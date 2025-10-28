'use client';

import { useConsultation } from '@/hooks/useConsultation';
import { useState } from 'react';

interface Props {
  threadId: string;
  onDone?: () => void;
}

export default function ConsultationForm({ threadId, onDone }: Props) {
  const { send } = useConsultation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const vars = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      consultation_date: fd.get('date') as string,
      consultation_time: fd.get('time') as string,
      services: 'AI-Consulting',
      company: 'N/A',
      phone: 'N/A',
      message: 'Booked via AI agent',
      ics_file: '',          // optional
      ics_filename: 'MutSyncHub-consultation.ics',
      now_year: new Date().getFullYear(),
    };

    // 1.  create calendar slot (server)
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'book',
        payload: { ...vars, threadId },
      }),
    }).then((r) => r.json());

    if (res.ok) {
      // 2.  send email (client)
      const mail = await send(vars);
      if (mail.ok) {
        alert('✅  Calendar slot + email sent.');
        onDone?.();
      } else {
        alert('Slot created, but email failed: ' + mail.error);
      }
    } else {
      alert('Booking failed: ' + res.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="name"  required placeholder="Your name"  className="input" />
      <input name="email" required placeholder="Email"      className="input" />
      <input name="date"  required placeholder="YYYY-MM-DD" className="input" />
      <input name="time"  required placeholder="HH:mm"      className="input" />
      <button disabled={loading} className="btn-primary">
        {loading ? 'Locking slot…' : 'Lock slot'}
      </button>
    </form>
  );
}