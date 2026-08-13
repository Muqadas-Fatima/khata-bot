import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'Shock Absorber XL', price: 450 },
      { name: 'Shock Absorber Mini', price: 300 },
    ],
  });
}
main().finally(() => prisma.$disconnect());