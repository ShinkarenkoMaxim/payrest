import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  find(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }
}
