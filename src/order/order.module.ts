import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OrderService } from './order.service';

@Module({
  controllers: [],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}
