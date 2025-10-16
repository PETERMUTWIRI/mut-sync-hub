// client-nextjs/src/components/support/SupportTicketCard.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle, Bot } from 'lucide-react';
// HF agent server action
import { useUser } from '@stackframe/stack';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  assignee: string | null;
  SupportReply: { authorEmail: string; body: string; createdAt: string }[];
}

const statusColour: Record<Ticket['status'], string> = {
  open: 'bg-green-500/10 text-green-300 border border-green-500/30',
  pending: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30',
  resolved: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  closed: 'bg-gray-500/10 text-gray-300 border border-gray-500/30',
};

const priorityColour: Record<Ticket['priority'], string> = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-gray-500/20 text-gray-300',
};

export default function SupportTicketCard({ ticket }: { ticket: Ticket }) {
  const user = useUser();
  const [expanded, setExpanded] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAI = async () => {
    setAiLoading(true);
    const res = await agentChat(
      `User ticket: "${ticket.title}" - ${ticket.description}. Give a short, helpful next step or explanation.`
    );
    setAiReply(res.content);
    setAiLoading(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl p-5 hover:border-[#2E7D7D] transition-colors cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      {/* header bar */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColour[ticket.status]}`}>{ticket.status}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColour[ticket.priority]}`}>{ticket.priority}</span>
            <span className="text-gray-400 text-xs">#{ticket.id.slice(-6)}</span>
          </div>
          <h3 className="text-white font-semibold mt-2">{ticket.title}</h3>
          <p className="text-gray-300 text-sm mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <ChevronRight className={`text-[#2E7D7D] transition-transform ${expanded ? 'rotate-90' : ''}`} size={20} />
      </div>

      {/* footer */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>Assigned: {ticket.assignee || 'Unassigned'}</span>
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>

      {/* expandable section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-[#2E7D7D]/30 space-y-4"
          >
            {/* official replies */}
            {ticket.SupportReply.map((r) => (
              <div key={r.createdAt} className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#2E7D7D] text-xs font-medium">{r.authorEmail}</span>
                  <span className="text-gray-500 text-xs">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-200 text-sm whitespace-pre-wrap">{r.body}</p>
              </div>
            ))}

            {/* AI assistant */}
            <div className="bg-[#2E7D7D]/10 rounded-lg p-3 border border-[#2E7D7D]/40">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-[#2E7D7D]" />
                <span className="text-[#2E7D7D] text-sm font-medium">AI Assistant</span>
              </div>
              {aiReply ? (
                <p className="text-gray-200 text-sm whitespace-pre-wrap">{aiReply}</p>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card toggle
                    askAI();
                  }}
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Thinking…' : 'Ask AI for next step'}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}