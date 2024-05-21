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

    // Attention! This implementation may differ from yours. Replace the fields according to your project and Payme documentation.
    for (let [, cartItem] of Object.entries(order.cart)) {
      let orderItem: OrderItem = {
        title: cartItem.name,
        price: cartItem.price * 100,
        count: cartItem.count,
        code: cartItem.code,
        package_code: cartItem.package_code,
        vat_percent: cartItem.vat_percent,
      };

      if (cartItem?.totalDiscount) {
        orderItem.discount = cartItem.totalDiscount * 100;
      }

      items.push(orderItem);
    }

    const fiscalData: OrderDetail = { receipt_type: 0, items: items };

    return fiscalData;
  }
}
