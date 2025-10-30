import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '@/lib/stack.client';

import { Toaster } from 'react-hot-toast';
import '@/app/tailwind.css';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StackProvider app={stackClientApp}>
         
         
              {children}
              <Toaster position="top-right" />
          
          
        </StackProvider>
      </body>
    </html>
  );
}