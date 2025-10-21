'use client'; // Keep as client component due to Navbar usage

import { StackProvider } from '@stackframe/stack';
import { stackClientApp } from '@/lib/stack.client';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import FloatingHomeButton from '@/components/ui/FloatingHomeButton';
import './global.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StackProvider app={stackClientApp}>
          <div className="bg-neutral-950 min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex-col">
              {children}
              <FloatingHomeButton />
              <Footer />
            </div>
          </div>
          <Toaster position="top-right" />
        </StackProvider>
      </body>
    </html>
  );
}
