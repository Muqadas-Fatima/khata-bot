import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const orders = await this.prisma.order.findMany({ include: { customer: true } });
    const totalSales = orders.reduce((s, o) => s + o.total, 0);
    const totalPending = orders.filter(o => o.status !== 'PAID').reduce((s, o) => s + o.total, 0);
    const today = new Date().toDateString();
    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    return { totalSales, totalPending, ordersToday, recentOrders: orders.slice(-10).reverse() };
  }
}