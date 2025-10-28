// src/lib/types.ts  (auto-imported everywhere)
export type OrgProfile = {
  orgId: string;
  role: string;
  isTechnical: boolean;
  layoutMode: 'beginner' | 'advanced';
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  planId: string;
};

export type PlanFeature = {
  name: string;
  description: string;
  limit?: number;
  allowedFrequencies?: string[];
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number; // KES cents
  currency: string;
  features: PlanFeature[];
};

export type UsageQuota = {
  used: number;
  limit: number;
  remaining: number;
  locked: boolean;
};

export type Flag = {
  key: string;
  enabled: boolean;
  payload?: Record<string, any>;
};