import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { PaymeService } from './payme.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { PaymeController } from './payme.controller';
import InternalServerErrorExceptionFilter from './errors/internal-server.exception.fitler';
import { TelegramModule } from 'src/telegram/telegram.module';
import { TransactionService } from 'src/transaction/transaction.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [PaymeController],
  providers: [
    PaymeService,
    TransactionService,
    OrderService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
    TelegramService,
  ],
  imports: [TelegramModule],
})
export class PaymeModule {}
