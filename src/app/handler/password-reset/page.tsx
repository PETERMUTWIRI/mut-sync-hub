// File: src/app/handler/password-reset/page.tsx
'use client';

import { PasswordReset } from '@stackframe/stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PasswordResetPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] dark:bg-[#1E2A44]">
      <Card className="w-full max-w-md border-[#E2E8F0] dark:border-[#2E7D7D]/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1E2A44] dark:text-[#E2E8F0] text-center">
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordReset searchParams={searchParams} />
        </CardContent>
      </Card>
    </div>
  );
}