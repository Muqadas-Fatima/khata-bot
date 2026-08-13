import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(phone: string) {
    let c = await this.prisma.customer.findUnique({ where: { phone } });
    if (!c) c = await this.prisma.customer.create({ data: { phone } });
    return c;
  }

  async saveName(id: string, name: string) {
    return this.prisma.customer.update({ where: { id }, data: { name, awaitingName: false } });
  }
}