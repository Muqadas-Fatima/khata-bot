import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CatalogueService {
  constructor(private prisma: PrismaService) {}

  async replyWithMenu() {
    const products = await this.prisma.product.findMany({ where: { active: true } });
    const list = products.map(p => `${p.name} — PKR ${p.price}`).join('\n');
    return { replyToCustomer: `📋 Our Products\n${list}`, notifyOwner: false };
  }

  async addFromText(text: string) {
    // "ADD PRODUCT Shock Absorber XL 450"
    const match = text.match(/ADD PRODUCT (.+) (\d+)$/i);
    if (!match) return { replyToCustomer: 'Format: ADD PRODUCT <name> <price>', notifyOwner: false };
    await this.prisma.product.create({ data: { name: match[1].trim(), price: Number(match[2]) } });
    return { replyToCustomer: `Added: ${match[1]} — PKR ${match[2]}`, notifyOwner: false };
  }
}