import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymeException } from './errors/payme.exception';
import { PaymeError } from './errors/payme.error';
import { Account } from './types/common';
import { OrderState, TransactionState } from './types/enums';
import {
  CancelTransactionParams,
  CheckPerformTransactionParams,
  CheckTransactionParams,
  CreateTransactionParams,
  GetStatementParams,
  PerformTransactionParams,
} from './types/params';
import { Transaction } from '@prisma/client';
import { traceDeprecation } from 'process';

@Injectable()
export class PaymeService {
  constructor(private prisma: PrismaService) {}

  async checkPerformTransaction(
    params: CheckPerformTransactionParams.Request,
  ): Promise<CheckPerformTransactionParams.Response> {
    const orderId = Number(params.account.order_id);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new PaymeException(PaymeError.ORDER_NOT_FOUND);
    }

    if (order.state !== OrderState.WAITING_PAY) {
      if (order.state === OrderState.IN_PROGRESS) {
        throw new PaymeException(PaymeError.ORDER_IN_PROGRESS);
      }

      if (order.state === OrderState.ACCEPTED) {
        throw new PaymeException(PaymeError.ORDER_ACCEPTED);
      }

      if (order.state === OrderState.CANCELLED) {
        throw new PaymeException(PaymeError.ORDER_CANCELLED);
      }
    }

    const convertedCoins = Math.floor(Number(params.amount) / 100); // convert tiyin to som

    if (convertedCoins !== order.amount) {
      throw new PaymeException(PaymeError.INVALID_AMOUNT);
    }

    return { allow: true };
  }

  async createTransaction(
    params: CreateTransactionParams.Request,
  ): Promise<CreateTransactionParams.Response> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { payme_transaction_id: params.id },
    });

    if (transaction) {
      if (transaction.state !== TransactionState.CREATED) {
        throw new PaymeException(PaymeError.INACTIVE_TRANSCACTION);
      }

      const createTime = transaction.create_time.getTime();
      const isExpired = this.checkTransactionExpiration(createTime);

      if (!isExpired) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            state: TransactionState.CANCELLED,
            cancel_time: new Date(),
            reason: {
              connect: { id: 4 },
            },
          },
        });

        throw new PaymeException(PaymeError.COULD_NOT_PERFORM_TRANSACTION);
      }

      return {
        transaction: transaction.id.toString(),
        create_time: createTime,
        state: transaction.state,
      };
    } else {
      // If this operation fails - throw an error
      const result = await this.checkPerformTransaction({
        amount: params.amount,
        account: params.account,
      });

      // Else operation is allowed (always) after running checkPerformTransaction and then we can create transaction
      if (result.allow) {
        const transaction = await this.prisma.transaction.create({
          data: {
            payme_transaction_id: params.id,
            time: new Date(params.time),
            amount: params.amount,
            account: params.account,
          },
        });

        return {
          transaction: transaction.id.toString(),
          create_time: transaction.create_time.getTime(),
          state: transaction.state,
        };
      }
    }
  }

  async performTransaction(
    params: PerformTransactionParams.Request,
  ): Promise<PerformTransactionParams.Response> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { payme_transaction_id: params.id },
    });

    if (!transaction) {
      throw new PaymeException(PaymeError.TRANSACTION_NOT_FOUND);
    }

    if (transaction.state === TransactionState.CREATED) {
      const isExpired = this.checkTransactionExpiration(
        transaction.create_time.getTime(),
      );

      if (isExpired) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            state: TransactionState.CANCELLED,
            cancel_time: new Date(),
            reason: {
              connect: { id: 4 },
            },
          },
        });

        throw new PaymeException(PaymeError.COULD_NOT_PERFORM_TRANSACTION);
      }

      const account = transaction.account as Account;
      const orderId = Number(account.order_id);
      const performTime = new Date();

      // If you connect Telegram Bot You can add code here for trigger updates

      await this.prisma.order.update({
        where: { id: orderId },
        data: { state: OrderState.ACCEPTED },
      });

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          state: TransactionState.COMPLETED,
          perform_time: performTime,
        },
      });

      return {
        transaction: transaction.id.toString(),
        perform_time: performTime.getTime(),
        state: TransactionState.COMPLETED,
      };
    } else {
      if (transaction.state !== TransactionState.COMPLETED) {
        throw new PaymeException(PaymeError.COULD_NOT_PERFORM_TRANSACTION);
      }

      return {
        transaction: transaction.id.toString(),
        perform_time: transaction.perform_time.getTime(),
        state: transaction.state,
      };
    }
  }

  async cancelTransaction(
    params: CancelTransactionParams.Request,
  ): Promise<CancelTransactionParams.Response> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { payme_transaction_id: params.id },
    });

    if (!transaction) {
      throw new PaymeException(PaymeError.TRANSACTION_NOT_FOUND);
    }

    const cancelTime = transaction.cancel_time ?? new Date();
    const isCreated = transaction.state === TransactionState.CREATED;
    const isCompleted = transaction.state === TransactionState.COMPLETED;

    if (isCreated || isCompleted) {
      /* If need no refund option
        if (isCompleted && noRefund) {
          throw new PaymeException(PaymeError.NO_REFUND)
        }
      */

      const reasonCode = Number(params.reason);
      const reason = await this.prisma.reason.findUnique({
        where: { code: reasonCode },
      });
      const transactionState = isCreated
        ? TransactionState.CANCELLED
        : TransactionState.CANCELLED_AFTER_COMPLETE;

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          state: transactionState,
          cancel_time: cancelTime,
          reason: {
            connect: { id: reason.id },
          },
        },
      });
    }

    return {
      transaction: transaction.id.toString(),
      cancel_time: cancelTime.getTime(),
      state: transaction.state,
    };
  }

  async checkTransaction(
    params: CheckTransactionParams.Request,
  ): Promise<CheckTransactionParams.Response> {
    const transaction = await this.prisma.transaction.findUnique({
      select: {
        id: true,
        create_time: true,
        perform_time: true,
        cancel_time: true,
        state: true,
        reason: {
          select: {
            code: true,
          },
        },
      },
      where: { payme_transaction_id: params.id },
    });

    if (!transaction) {
      throw new PaymeException(PaymeError.TRANSACTION_NOT_FOUND);
    }

    return {
      transaction: transaction.id.toString(),
      create_time: transaction.create_time.getTime(),
      cancel_time: transaction.cancel_time.getTime(),
      perform_time: transaction.perform_time.getTime(),
      state: transaction.state,
      reason: transaction.reason.code,
    };
  }

  async getStatement(
    params: GetStatementParams.Request,
  ): Promise<GetStatementParams.Response> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        time: {
          lte: new Date(params.from),
          gte: new Date(params.to),
        },
      },
      include: { reason: true },
      orderBy: {
        time: 'asc',
      },
    });

    const preparedAnswer = transactions.map((transaction) => ({
      id: transaction.payme_transaction_id,
      time: transaction.time.getTime(),
      amount: transaction.amount,
      account: transaction.account as Account,
      create_time: transaction.create_time.getTime(),
      perform_time: transaction.perform_time.getTime(),
      cancel_time: transaction.cancel_time.getTime(),
      transaction: transaction.id.toString(),
      state: transaction.state,
      reason: transaction.reason.code,
    }));

    return {
      transactions: preparedAnswer,
    };
  }

  checkTransactionExpiration(createTime: number) {
    const isExpired = (Date.now() - createTime) / 36e5 >= 12; // 12 hours

    return isExpired;
  }
}
