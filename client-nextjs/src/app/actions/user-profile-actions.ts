// // src/app/actions/user-profile-actions.ts
// 'use server';

// import { stackServerApp } from '@/stack';

// export async function getCurrentUserRole(): Promise<string | null> {
//   try {
//     const user = await stackServerApp.getUser();
//     if (!user) {
//       console.error('getCurrentUserRole: No authenticated user');
//       return null;
//     }
//     const response = await fetch(`https://api.neon.tech/v2/projects/${process.env.NEON_PROJECT_ID}/sql`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.NEON_API_KEY}`,
//       },
//       body: JSON.stringify({
//         query: `
//           SELECT up.role
//           FROM public.userprofile up
//           JOIN neon_auth.users_sync us ON up.user_id = us.id
//           WHERE us.id = $1 AND us.deleted_at IS NULL
//         `,
//         params: [user.id],
//       }),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.error || `Neon query failed with status ${response.status}`);
//     }
//     return data.results[0]?.role || null;
//   } catch (error) {
//     console.error('getCurrentUserRole error:', error);
//     return null;
//   }
// }