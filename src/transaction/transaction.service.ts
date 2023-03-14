import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaymeError } from 'src/payme/errors/payme.error';
import { PaymeException } from 'src/payme/errors/payme.exception';
import { TransactionState } from 'src/payme/types/enums';
import { CreateTransactionParams } from 'src/payme/types/params';

type TransactionWithReason = Transaction & { reason?: { code: number } };

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(
    params: CreateTransactionParams.Request,
    orderId: number,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        payme_transaction_id: params.id,
        time: new Date(params.time),
        amount: params.amount,
        account: params.account,
        Order: { connect: { id: orderId } },
      },
    });
  }

  async find(
    payme_transaction_id: string,
    select: Prisma.TransactionSelect | null = null,
  ): Promise<TransactionWithReason> {
    let args: {
      where: Prisma.TransactionWhereUniqueInput;
      select?: Prisma.TransactionSelect;
    } = { where: { payme_transaction_id } };

    if (args) args.select = select;

    return this.prisma.transaction.findUnique(args);
  }

  async listBetweenDates(
    dateFrom: Date,
    dateTo: Date,
  ): Promise<TransactionWithReason[]> {
    return this.prisma.transaction.findMany({
      where: {
        time: {
          lte: dateFrom,
          gte: dateTo,
        },
      },
      include: { reason: true },
      orderBy: {
        time: 'asc',
      },
    });
  }

  /**
   * Check if exist transaction by order
   * @param orderId
   * @returns Transaction or empty value
   */
  async exist(orderId: number): Promise<Transaction> {
    return this.prisma.transaction.findFirst({
      where: { orderId },
    });
  }

  /**
   * Check if transaction is not expired (12 hours)
   * @param transactionId - transaction id
   * @param createTime - date of created Transaction
   * @returns void
   */
  async validate(transactionId: number, createTime: number): Promise<void> {
    const isExpired = this.checkTransactionExpiration(createTime);

    if (isExpired) {
      await this.cancel(transactionId);

      throw new PaymeException(PaymeError.COULD_NOT_PERFORM_TRANSACTION);
    }

    return;
  }

  /**
   * Mark as completed transaction in Database
   * @param id - transaction id
   * @param perform_time - date to perform Transaction
   * @returns void
   */
  async complete(id: number, perform_time: Date): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: {
        state: TransactionState.COMPLETED,
        perform_time,
      },
    });

    return;
  }

  /**
   * Mark as cancelled transaction in Database
   * @param id - transaction id
   * @param state - optional state
   * @param reasonId - optional reason for transaction cancellation
   * @param cancel_time - date of cancelled transaction
   * @returns void
   */
  async cancel(
    id: number,
    state = TransactionState.CANCELLED,
    reasonId = 4,
    cancel_time = new Date(),
  ): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: {
        state,
        cancel_time,
        reason: {
          connect: { id: reasonId },
        },
      },
    });

    return;
  }

  checkTransactionExpiration(createTime: number) {
    const isExpired = (Date.now() - createTime) / 36e5 >= 12; // 12 hours

    return isExpired;
  }
}
