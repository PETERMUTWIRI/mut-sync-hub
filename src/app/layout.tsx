'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StackProvider } from '@stackframe/stack';
import { stackClientApp } from '@/lib/stack.client';
import { Toaster } from 'react-hot-toast';
import '@/app/tailwind-output.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StackProvider app={stackClientApp}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" />
          </QueryClientProvider>
        </StackProvider>
      </body>
    </html>
  );
}