// File: src/app/sign-in/page.tsx
"use client";
import { CredentialSignIn, OAuthButton } from '@stackframe/stack';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostLoginRedirect } from '@/components/PostLoginRedirect';
import { useUser } from '@stackframe/stack';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useEffect, useState } from 'react';
import { stackClientApp } from '@/lib/stack.client'; // Import stack client for password reset URL

export default function SignInPage() {
  const [isClient, setIsClient] = useState(false);
  const user = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (user) {
    return <PostLoginRedirect />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] dark:bg-[#1E2A44]">
        <Card className="w-full max-w-md border-[#E2E8F0] dark:border-[#2E7D7D]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#1E2A44] dark:text-[#E2E8F0] text-center">
              Sign In to MutSyncHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OAuthButton provider="google" type="sign-in" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E2E8F0] dark:border-[#2E7D7D]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F7FAFC] dark:bg-[#1E2A44] px-2 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>
            <CredentialSignIn />
            {/* ✅ Forgot password link added below credential sign-in */}
            <div className="flex justify-center pt-2">
              <Link
                href={stackClientApp.urls.passwordReset}
                className="text-sm text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}