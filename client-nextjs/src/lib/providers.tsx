// src/components/StackClientProvider.tsx
"use client";
import { StackProvider } from "@stackframe/stack";
import { stackClientApp } from "./stack.client"; // adjust path as needed

export default function StackClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
}

