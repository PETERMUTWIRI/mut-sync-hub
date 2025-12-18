// import { StackClientApp } from '@stackframe/stack';

// let stackClientApp = null;

// const initializeStackClientApp = () => {
//   if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
//     throw new Error('Missing NEXT_PUBLIC_STACK_PROJECT_ID in environment variables');
//   }
//   if (!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
//     throw new Error('Missing NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY in environment variables');
//   }

//   return new StackClientApp({
//     projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
//     publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
//     tokenStore: 'nextjs-cookie',
//     urls: {
//       home: '/',         // Required minimum; points to your app's home route
//       signIn: '/sign-in', // Matches your sign-in page route
//       signUp: '/sign-up', // Matches your sign-up page route
//       // forgotPassword: '/forgot-password', // Add if you have this page; otherwise, omit
//     },
//   });
// };

import { StackClientApp } from '@stackframe/stack';

const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || '',
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '',
  tokenStore: 'nextjs-cookie',
  urls: {
    home: '/',
    signIn: '/sign-in',
    signUp: '/sign-up',
    handler: '/handler/callback',
  },
});

export { stackClientApp };