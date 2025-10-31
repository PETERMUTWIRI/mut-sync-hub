'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((r) => r.json());

export function ProfileCompletionBanner() {
  const { data: profile, error } = useSWR('/api/profile', fetcher);

  if (error || !profile || profile?.firstName) return null;

  return (
    <div className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white flex items-center justify-between text-sm md:text-base">
      <span>👋  Welcome!  Add your details to finish setup.</span>
      <Link href="/user-dashboard-main/profile?onboard=true">
        <Button size="sm" className="bg-white text-teal-600 hover:bg-gray-100">
          Complete Profile
        </Button>
      </Link>
    </div>
  );
}