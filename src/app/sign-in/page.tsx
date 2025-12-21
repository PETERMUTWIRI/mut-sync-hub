// src/app/sign-in/page.tsx
'use client';

import { CredentialSignIn, OAuthButton } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@stackframe/stack';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AUTH_CONFIG } from '@/lib/auth/stack-config';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignInPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const user = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ FIXED: Use router.push instead of PostLoginRedirect
  if (isClient && user) {
    router.push(AUTH_CONFIG.POST_LOGIN_URL);
    return null;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-cockpit-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/5 backdrop-blur-lg border border-gray-700/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan-400 text-center font-sans">
                Access Mission Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ✅ Google SSO */}
              <OAuthButton 
                provider="google" 
                type="sign-in"
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-cockpit-bg px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* ✅ Email/Password Sign In */}
              <CredentialSignIn />

              {/* ✅ Forgot Password Link */}
              <div className="flex justify-center pt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* ✅ Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-700/20">
                <Link 
                  href="/sign-up"
                  className="text-sm text-gray-400 hover:text-cyan-400"
                >
                  Don't have an account? <span className="font-semibold">Sign Up</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}