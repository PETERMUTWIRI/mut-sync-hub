'use client';   // mark as client bundle

import emailjs from '@emailjs/browser';

export type ConsultationMail = {
  name: string;
  email: string;
  consultation_date: string;
  consultation_time: string;
  services?: string;
  company?: string;
  phone?: string;
  message?: string;
  ics_file?: string;
  ics_filename?: string;
  now_year?: number;
};

export async function sendConsultationEmail(vars: ConsultationMail) {
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    vars,
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}