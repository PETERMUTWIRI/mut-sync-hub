import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto';
import { PLANS } from '../src/app/actions/plans';

const prisma = new PrismaClient();

async function main() {
  for (const plan of PLANS) {
    const id = randomUUID();
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
      },
    });
    console.log(`Seeded plan: ${plan.name} (${id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
