// src/components/ui/ErrorPage.tsx
"use client";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HiExclamationCircle } from 'react-icons/hi';

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <Alert>
      <HiExclamationCircle className="h-5 w-5" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}