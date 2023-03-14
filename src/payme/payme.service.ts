import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { TransactionService } from 'src/transaction/transaction.service';
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
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymeService {
  constructor(
    private prisma: PrismaService,
    private transaction: TransactionService,
    private order: OrderService,
    private telegram: TelegramService,
  ) {}

  async checkPerformTransaction(
    params: CheckPerformTransactionParams.Request,
  ): Promise<CheckPerformTransactionParams.Response> {
    const orderId = Number(params.account.order_id);
    const order = await this.order.find(orderId);

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

    const detail = this.order.getFiscalData(order);

    return { allow: true, detail };
  }

  async createTransaction(
    params: CreateTransactionParams.Request,
  ): Promise<CreateTransactionParams.Response> {
    const transaction = await this.transaction.find(params.id);

    if (transaction) {
      if (transaction.state !== TransactionState.CREATED) {
        throw new PaymeException(PaymeError.INACTIVE_TRANSCACTION);
      }

      const createTime = transaction.create_time.getTime();

      await this.transaction.validate(transaction.id, createTime);

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
        // Find existed transaction from Payme by order_id. Payme can create another new transaction
        const orderId = Number(params.account.order_id);
        const existTransaction = await this.transaction.exist(orderId);

        if (existTransaction) {
          throw new PaymeException(PaymeError.TRANSACTION_ALREADY_CREATED);
        }

        const transaction = await this.transaction.create(params, orderId);

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
    const transaction = await this.transaction.find(params.id);

    if (!transaction) {
      throw new PaymeException(PaymeError.TRANSACTION_NOT_FOUND);
    }

    if (transaction.state === TransactionState.CREATED) {
      await this.transaction.validate(
        transaction.id,
        transaction.create_time.getTime(),
      );

      const account = transaction.account as Account;
      const orderId = Number(account.order_id);
      const performTime = new Date();

      // If you connect Telegram Bot You can add code here for trigger updates
      // Your implementation may differ
      const order = await this.order.find(orderId, true);

      await lastValueFrom(
        this.telegram.notify(
          order.User.telegramId,
          `Ваш заказ #${order.id} успешно оплачен`,
        ),
      );
      await lastValueFrom(
        this.telegram.updateAdminStatus(order.message_id, '💳 Оплачено картой'),
      );

      await this.order.approve(orderId);
      await this.transaction.complete(transaction.id, performTime);

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
    const transaction = await this.transaction.find(params.id);

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

      // Cancel by custom reason received from Payme
      await this.transaction.cancel(
        transaction.id,
        transactionState,
        reason.id,
        cancelTime,
      );

      // If you connect Telegram Bot You can add code here for trigger updates
      // Your implementation may differ
      const { order_id } = transaction.account as Account;
      const order = await this.order.find(Number(order_id), true);

      await lastValueFrom(
        this.telegram.notify(
          order.User.telegramId,
          `Ваш платёж по заказу #${order.id} успешно отменён`,
        ),
      );
      await lastValueFrom(
        this.telegram.updateAdminStatus(order.message_id, '💳 Оплата отменена'),
      );

      await this.order.decline(order_id);
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
    const selectFields = {
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
    };
    const transaction = await this.transaction.find(params.id, selectFields);

    if (!transaction) {
      throw new PaymeException(PaymeError.TRANSACTION_NOT_FOUND);
    }

    return {
      transaction: transaction.id.toString(),
      create_time: transaction.create_time.getTime(),
      perform_time: transaction?.perform_time
        ? transaction.perform_time.getTime()
        : 0,
      cancel_time: transaction?.cancel_time
        ? transaction.cancel_time.getTime()
        : 0,
      state: transaction.state,
      reason: transaction.reason ? transaction.reason.code : null,
    };
  }

  async getStatement(
    params: GetStatementParams.Request,
  ): Promise<GetStatementParams.Response> {
    const dateFrom = new Date(params.from);
    const dateTo = new Date(params.to);
    const transactions = await this.transaction.listBetweenDates(
      dateFrom,
      dateTo,
    );

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
}
