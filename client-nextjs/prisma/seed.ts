import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PLANS } from '../src/app/actions/plans';

const prisma = new PrismaClient();

async function main() {
  for (const plan of PLANS) {
    const id = uuidv4();
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
