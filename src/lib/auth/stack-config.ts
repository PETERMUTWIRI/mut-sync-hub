// src/lib/auth/stack-config.ts
export const AUTH_CONFIG = {
  // 🔥 CRITICAL: Self-hosted callback handling
  POST_LOGIN_URL: process.env.NEXT_PUBLIC_STACK_POST_LOGIN_URL || '/auth/callback',
  POST_LOGOUT_URL: process.env.NEXT_PUBLIC_STACK_POST_LOGOUT_URL || '/',
  
  // Owner auto-promotion
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  
  // Cookie cleanup
  COOKIE_NAMES: {
    SESSION: 'stack-session-token',
    CALLBACK: 'stack-callback-data',
  }
} as const;