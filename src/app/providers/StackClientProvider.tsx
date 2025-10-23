// 'use client';

// // import { StackProvider } from "@stackframe/stack";
// // import { ReactNode, useState, useEffect } from 'react';
// // import { initializeStackClientApp } from "@/lib/stack.client";

// // interface StackClientProviderProps {
// //   children: ReactNode;
// // }

// // export default function StackClientProvider({ children }: StackClientProviderProps) {
// //   const [app, setApp] = useState<ReturnType<typeof initializeStackClientApp> | null>(null);

// //   useEffect(() => {
// //     if (typeof window !== 'undefined') {
// //       setApp(initializeStackClientApp());
// //     }
// //   }, []);

// //   // Render children directly on server; wrap with provider on client
// //   // Use suppressHydrationWarning to ignore minor differences
// //   const content = <div suppressHydrationWarning>{children}</div>;

// //   return app ? (
// //     <StackProvider app={app}>
// //       {content}
// //     </StackProvider>
// //   ) : (
// //     content
// //   );
// // }
// import { StackProvider } from "@stackframe/stack";
// import { ReactNode, useMemo } from 'react';
// // import { initializeStackClientApp } from "@/lib/stack.client";
// import { stackClientApp } from "@/lib/stack.client";
// interface StackClientProviderProps {
//   children: ReactNode;
// }

// export default function StackClientProvider({ children }: StackClientProviderProps) {
//   const app = useMemo(() => stackClientApp(), []);
//   return (
//     <StackProvider app={app}>
//       {children}
//     </StackProvider>
//   );
// }