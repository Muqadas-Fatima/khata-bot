import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async saveScreenshot(customerId: string, mediaUrl: string) {
    const order = await this.prisma.order.findFirst({
      where: { customerId, status: { in: ['UNPAID','PARTIAL'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (!order) return { replyToCustomer: 'No pending order found.', notifyOwner: false };

    await this.prisma.payment.create({
      data: { orderId: order.id, amount: order.total, screenshotUrl: mediaUrl },
    });

    return {
      replyToCustomer: 'Screenshot received. Awaiting confirmation.',
      notifyOwner: true,
      ownerMessage: `Payment proof received for order #${order.id.slice(-6)}. Reply "CONFIRM ${order.id.slice(-6)}" to verify.`,
    };
  }

  async confirmFromText(text: string) {
    const idPart = text.replace(/CONFIRM/i, '').trim();
    const order = await this.prisma.order.findFirst({ where: { id: { endsWith: idPart } }, include: { payments: true } });
    if (!order) return { replyToCustomer: 'Order not found.', notifyOwner: false };

    await this.prisma.payment.updateMany({ where: { orderId: order.id, status: 'PENDING_VERIFICATION' }, data: { status: 'VERIFIED' } });

    const verified = await this.prisma.payment.aggregate({ where: { orderId: order.id, status: 'VERIFIED' }, _sum: { amount: true } });
    const paid = verified._sum.amount || 0;
    const status = paid >= order.total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    await this.prisma.order.update({ where: { id: order.id }, data: { status } });

    return { replyToCustomer: `Order #${idPart} marked ${status}.`, notifyOwner: false };
  }
}
