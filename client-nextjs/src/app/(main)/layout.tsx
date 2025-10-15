'use client'; // Keep as client component due to Navbar usage

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import FloatingHomeButton from '@/components/ui/FloatingHomeButton';
import '../global.css';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-neutral-950 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex-col">
        {children}
        <FloatingHomeButton />
        <Footer />
      </div>
    </div>
  );
}