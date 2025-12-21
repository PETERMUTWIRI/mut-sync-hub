// src/app/forgot-password/page.tsx
'use client';

import { PasswordReset } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@stackframe/stack';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const user = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ FIXED: No onSuccess prop - self-hosted handles redirect automatically
  // If already logged in, go to dashboard
  if (isClient && user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cockpit-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 backdrop-blur-lg border border-gray-700/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-cyan-400 text-center font-sans">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ✅ No onSuccess - self-hosted redirects to sign-in automatically */}
            <PasswordReset 
              fullPage={false}
              searchParams={{}} // Required prop in self-hosted
            />

            <div className="text-center pt-4 border-t border-gray-700/20">
              <Link 
                href="/sign-in"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}