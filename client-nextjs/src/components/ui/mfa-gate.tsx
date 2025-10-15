'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

export function MFAGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'invalid'>('idle');

  const verify = async (c: string) => {
    if (c.length !== 6) return;
    setStatus('loading');
    const res = await fetch('/api/profile/mfa/verify', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ code: c }),
    });
    const { valid } = await res.json();
    if (valid) {
      setStatus('idle');
      onSuccess();
      setCode('');
    } else {
      setStatus('invalid');
      toast.error('Invalid code');
    }
  };

  const handleChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setStatus('idle');                       // reset while typing
    if (digits.length === 6) verify(digits); // auto-submit
  };

  const borderColor =
    status === 'invalid' ? 'border-red-500' :
    status === 'loading' ? 'border-teal-400' :
    'border-teal-500/50';

  return (
    <div className="rounded-xl bg-black/30 border border-teal-500/50 p-4">
      <Label className="text-teal-300">Enter 6-digit authenticator code</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="123456"
          maxLength={6}
          className={`bg-black/30 ${borderColor}`}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d{6}"
        />
        <Button onClick={() => verify(code)} disabled={code.length !== 6 || status === 'loading'} className="bg-teal-600 hover:bg-teal-500 text-white min-w-[5rem]">
          {status === 'loading' ? <Spinner className="w-4 h-4" /> : 'Verify'}
        </Button>
      </div>
      {status === 'invalid' && <p className="text-xs text-red-400 mt-2">Code not recognised – try again</p>}
    </div>
  );
}
