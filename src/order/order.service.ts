import { Injectable } from '@nestjs/common';
import { Order, Prisma, User } from '@prisma/client';
import { OrderDetail, OrderItem } from 'src/payme/types/common';
import { OrderState } from 'src/payme/types/enums';
import { PrismaService } from 'src/prisma.service';

type OrderWithUser = Order & { User?: User };

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async find(id: number, withUser = false): Promise<OrderWithUser> {
    let args: {
      where: Prisma.OrderWhereUniqueInput;
      include?: Prisma.OrderInclude;
    } = { where: { id } };

    if (withUser) args.include = { User: true };

    return this.prisma.order.findUnique(args);
  }

  async approve(id: number): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { state: OrderState.ACCEPTED, status: 'approve' },
    });

    return;
  }

  async decline(id: number): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { state: OrderState.CANCELLED, status: 'decline' },
    });

    return;
  }

  /**
   * Collect product items for fiscalization
   * @param order - order data
   * @returns OrderDetail
   */
  getFiscalData(order: Order): OrderDetail {
    const items: OrderItem[] = [];

    for (let [, item] of Object.entries(order.cart)) {
      items.push({
        title: item.name,
        price: item.totalPrice * 100,
        count: item.count,
        code: item.code,
        package_code: item.package_code,
        vat_percent: item.vat_percent,
      });
    }

    const fiscalData: OrderDetail = { receipt_type: 0, items: items };

    return fiscalData;
  }
}
