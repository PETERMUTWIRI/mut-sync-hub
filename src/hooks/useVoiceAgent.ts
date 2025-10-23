'use client';

import { useState, useEffect } from 'react';

export function useVoiceAgent() {
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  const listen = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    const rec = new (window as any).webkitSpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => setTranscript(e.results[0][0].transcript);
    rec.start();
  };

  const reply = async (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return { listen, reply, transcript, speaking };
};
