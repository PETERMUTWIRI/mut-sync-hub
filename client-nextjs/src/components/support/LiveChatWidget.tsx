// client-nextjs/src/components/support/LiveChatWidget.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentRequest } from '@/lib/agentClient';

import { useUser } from '@stackframe/stack';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatWidget({ isOpen, onClose }: LiveChatWidgetProps) {
  const user = useUser();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* scroll to bottom on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* initial greeting */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          text: 'Hi! I’m MutSyncHub AI – ask me anything about integrations, APIs, or your account.',
          sender: 'agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await agentRequest('chat', { message: input, threadId: 'live' });
      const agentMsg: Message = {
        id: crypto.randomUUID(),
        text: res.content,
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        text: 'Sorry, I ran into an error. Please try again or contact human support.',
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl shadow-2xl flex flex-col z-50"
        >
          {/* header */}
          <div className="bg-[#2E7D7D]/20 px-4 py-3 flex items-center justify-between border-b border-[#2E7D7D]/30">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#2E7D7D]" />
              <h3 className="text-white font-medium">MutSyncHub AI</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[#2E7D7D] hover:text-teal-300" aria-label="More options"><MoreVertical size={16} /></button>
              <button onClick={onClose} className="text-[#2E7D7D] hover:text-teal-300" aria-label="Close chat"><X size={18} /></button>
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#2E7D7D]/30 text-white rounded-br-none'
                      : 'bg-black/30 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-400 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-black/30 text-gray-200 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                  <Bot size={14} className="text-[#2E7D7D]" />
                  <span>Typing</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#2E7D7D] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#2E7D7D] rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-[#2E7D7D] rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-[#2E7D7D]/30 px-4 py-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-black/30 border border-[#2E7D7D]/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
            />
            <button
              type="submit"
              className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white p-2 rounded-lg disabled:opacity-50"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}