// // src/lib/rate-limit.ts
// import { RateLimit } from '@/lib/prisma';
// import { prisma } from '@/lib/prisma';

// export async function checkRateLimit(identifier: string, limit: number, windowMs: number) {
//   const now = new Date();
//   const windowStart = new Date(now.getTime() - windowMs);

//   const count = await prisma.rateLimit.count({
//     where: {
//       identifier,
//       createdAt: { gte: windowStart }
//     }
//   });

//   if (count >= limit) return false;

//   await prisma.rateLimit.create({
//     data: {
//       identifier,
//       action: 'api_call',
//       count: 1,
//       expiresAt: new Date(now.getTime() + windowMs)
//     }
//   });

//   return true;
// }

// // Add to API routes:
// // if (!(await checkRateLimit(userId, 100, 60000))) {
// //   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
// // }