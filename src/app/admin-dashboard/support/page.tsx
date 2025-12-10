// src/app/admin-dashboard/support/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { 
  HiTicket, HiReply, HiCheckCircle, 
  HiTrash, HiRefresh, HiBell
} from 'react-icons/hi';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  user_email: string;
  created_at: string;
  SupportReply: any[];
  organization: { name: string; subdomain: string };
}

export default function AdminSupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: () => fetch('/api/admin/support/tickets', { credentials: 'include' }).then(r => r.json())
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await fetch('/api/admin/support/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, message })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast.success('Reply sent successfully');
      setReplyMessage('');
      setSelectedTicket(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send reply');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast.success('Status updated');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
          <HiTicket className="text-cyan-400" /> Global Support Inbox
        </h1>
        <p className="text-sm text-cyan-200/70">Manage and respond to user support tickets in real-time</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="xl:col-span-2 bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20 bg-slate-900/70">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-cyan-400">Recent Tickets</h2>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] })}
                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition"
              >
                <HiRefresh className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-cyan-500/10 max-h-[600px] overflow-y-auto">
            {tickets?.map((ticket: SupportTicket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-4 hover:bg-slate-900/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white flex-1">{ticket.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.status === 'open' ? 'bg-green-500/10 text-green-400' :
                    ticket.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>{ticket.user_email}</span>
                    <span>•</span>
                    <span>{ticket.organization.name}</span>
                    <span>•</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiBell className="w-3 h-3" />
                    <span>{ticket.SupportReply.length} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Panel */}
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Ticket Details</h2>
          
          {!selectedTicket ? (
            <div className="text-center py-12 text-slate-500">
              <HiTicket className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
              <p>Select a ticket to view details</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white mb-1">{selectedTicket.title}</h3>
                <p className="text-sm text-slate-400">{selectedTicket.user_email} • {selectedTicket.organization.name}</p>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-slate-300 text-sm">{selectedTicket.description}</p>
              </div>

              {/* Previous Replies */}
              {selectedTicket.SupportReply.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-medium text-cyan-400">Conversation</h4>
                  {selectedTicket.SupportReply.map((reply: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-lg text-sm ${
                      reply.author_email === process.env.OWNER_EMAIL 
                        ? 'bg-blue-500/10 border border-blue-500/20 ml-4' 
                        : 'bg-slate-800/50 mr-4'
                    }`}>
                      <div className="font-medium text-cyan-400 text-xs mb-1">
                        {reply.author_email === process.env.OWNER_EMAIL ? 'Owner' : 'User'} • {new Date(reply.created_at).toLocaleString()}
                      </div>
                      <div className="text-slate-200">{reply.body}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="border-t border-cyan-500/20 pt-4">
                <label className="block text-sm font-medium text-cyan-400 mb-2">Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => replyMutation.mutate({ 
                      ticketId: selectedTicket.id, 
                      message: replyMessage 
                    })}
                    disabled={!replyMessage.trim() || replyMutation.isPending}
                    className="flex-1 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ 
                      ticketId: selectedTicket.id, 
                      status: 'closed' 
                    })}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}