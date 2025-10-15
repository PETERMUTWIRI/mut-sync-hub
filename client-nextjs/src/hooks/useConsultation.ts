'use client';

import { sendConsultationEmail, type ConsultationMail } from '@/lib/emailClient';

export function useConsultation() {
  const send = async (vars: ConsultationMail) => {
    try {
      const res = await sendConsultationEmail(vars);
      return { ok: true, data: res };
    } catch (e: any) {
      console.error('EmailJS', e);
      return { ok: false, error: e.text || e.message };
    }
  };
  return { send };
}