import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private ai: AiService) {}

  async createFromText(customer: any, text: string) {
    const products = await this.prisma.product.findMany({ where: { active: true } });
    const items = await this.ai.extractOrderItems(text, products);

    let total = 0;
    const orderItems = items.map((i: any) => {
      const p = products.find(p => p.name.toLowerCase() === i.name.toLowerCase());
      if (!p) return null;
      total += p.price * i.qty;
      return { name: p.name, price: p.price, qty: i.qty };
    }).filter(Boolean);

    if (!orderItems.length) {
      return { replyToCustomer: "Couldn't match your order to our catalogue. Type MENU to see products.", notifyOwner: false };
    }

    const order = await this.prisma.order.create({
      data: { customerId: customer.id, total, items: { create: orderItems } },
    });

    const receipt = `🧾 Order #${order.id.slice(-6)}\n` +
      orderItems.map(i => `${i.name} x${i.qty} = ${i.price * i.qty}`).join('\n') +
      `\n\nTotal: PKR ${total}\nStatus: UNPAID\nSend payment screenshot once paid.`;

    return {
      replyToCustomer: receipt,
      notifyOwner: true,
      ownerMessage: `New order #${order.id.slice(-6)} from ${customer.name || customer.phone} — PKR ${total}`,
    };
  }

  async pendingSummary() {
    const orders = await this.prisma.order.findMany({
      where: { status: { in: ['UNPAID','PARTIAL'] } },
      include: { customer: true },
    });
    if (!orders.length) return { replyToCustomer: '📒 No pending payments.', notifyOwner: false };
    const list = orders.map(o => `${o.customer.name || o.customer.phone} — PKR ${o.total} (#${o.id.slice(-6)})`).join('\n');
    return { replyToCustomer: `📒 Pending Payments\n${list}`, notifyOwner: false };
  }

  async findPending() {
    return this.prisma.order.findMany({ where: { status: { in: ['UNPAID','PARTIAL'] } }, include: { customer: true } });
  }
}