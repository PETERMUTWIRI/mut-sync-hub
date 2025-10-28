// src/components/support/SupportTicketCard.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import PriorityIndicator from './PriorityIndicator';
import StatusBadge from './StatusBadge';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  assignee: string;
}

interface Props {
  ticket: Ticket;
}

const SupportTicketCard: React.FC<Props> = ({ ticket }) => {
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <PriorityIndicator priority={ticket.priority} />
            <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{ticket.description}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created:</span>{' '}
          <span className="text-gray-700 dark:text-gray-300">
            {new Date(ticket.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Assignee:</span>{' '}
          <span className="text-gray-700 dark:text-gray-300">{ticket.assignee}</span>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketCard;