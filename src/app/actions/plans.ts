// src/app/actions/plans.ts  (drop-in replacement)


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
  price: number; // in KES cents
  currency: string;
  features: PlanFeature[];
};

const PLAN_UUIDS = {
  free: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
  growth: 'e4bee2d2-028b-48e0-9673-8fff0b3c5cf4',
  scale: '95e7e49f-da3f-4a6f-ac97-ff081353d55f',
} as const;

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for micro-stores testing the waters.',
    price: 0,
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the AI agent', limit: 15 },
      { name: 'Scheduling', description: 'Scheduled PDF reports', limit: 2, allowedFrequencies: ['weekly'] },
      { name: 'Analytics-Live', description: 'Real-time KPI dashboard – unlimited views' },
      { name: 'Analytics-Export', description: 'PDF/CSV exports', limit: 0 }, // 0 = blocked
      { name: 'Support', description: 'Community support via Discord' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Unlock exports & forecasts for growing businesses.',
    price: 2999, // KES 2 999 (psychological 99)
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the AI agent', limit: 500 },
      { name: 'Scheduling', description: 'Scheduled PDF reports', limit: 20, allowedFrequencies: ['daily', 'weekly'] },
      { name: 'Analytics-Live', description: 'Real-time KPI dashboard – unlimited views' },
      { name: 'Analytics-Export', description: 'PDF/CSV exports', limit: 30 }, // 30 / month
      { name: 'Support', description: 'Email support – 24 h response' },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'For chains & distributors that need it all.',
    price: 9999, // KES 9 999
    currency: 'KSH',
    features: [
      { name: 'Agent Queries', description: 'Monthly queries to the AI agent', limit: 0 }, // 0 = unlimited
      { name: 'Scheduling', description: 'Scheduled PDF reports', limit: 0 }, // unlimited
      { name: 'Analytics-Live', description: 'Real-time KPI dashboard – unlimited views' },
      { name: 'Analytics-Export', description: 'PDF/CSV exports', limit: 0 }, // unlimited
      { name: 'Support', description: 'Priority email + WhatsApp hotline' },
      { name: 'Custom-Integrations', description: 'POS/ERP custom connectors' },
    ],
  },
];

export async function getPlans() {
  return PLANS;
}

export async function getPlanUuid(planId: string): Promise<string> {
  return PLAN_UUIDS[planId as keyof typeof PLAN_UUIDS] ?? planId;
}

/* ---------- helper to read limit by feature ---------- */
export async function getFeatureLimit(planId: string, feature: string): Promise<number> {
  const plan = PLANS.find(p => p.id === planId);
  return plan?.features.find(f => f.name === feature)?.limit ?? 0;
}