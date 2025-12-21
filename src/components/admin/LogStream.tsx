// src/components/admin/LogStream.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { HiMagnifyingGlass, HiFunnel, HiPause, HiPlay, HiClipboardDocument, HiCheckCircle } from 'react-icons/hi2';

interface AuditLog {
  id: string;
  action: string;
  resource: string | null;
  details?: any;
  createdAt: string;
  ipAddress?: string | null;
  userProfile?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  } | null;
  organization?: {
    name: string;
    subdomain: string;
  } | null;
}

interface LogStreamProps {
  events: AuditLog[];
  className?: string;
  isLive?: boolean;
}

const LOG_LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR', 'SECURITY', 'API'] as const;
type LogLevel = typeof LOG_LEVELS[number];

const getLogLevel = (action: string): LogLevel => {
  if (action.includes('ERROR') || action.includes('FAILED')) return 'ERROR';
  if (action.includes('WARNING') || action.includes('SUSPICIOUS')) return 'WARNING';
  if (action.includes('LOGIN') || action.includes('SECURITY')) return 'SECURITY';
  if (action.includes('API') || action.includes('WEBHOOK')) return 'API';
  return 'INFO';
};

const getLevelStyles = (level: LogLevel) => {
  switch (level) {
    case 'ERROR':
      return {
        leftBorder: 'border-l-4 border-red-500',
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
        icon: '🔴'
      };
    case 'WARNING':
      return {
        leftBorder: 'border-l-4 border-amber-500',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: '🟡'
      };
    case 'SECURITY':
      return {
        leftBorder: 'border-l-4 border-purple-500',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        icon: '🔒'
      };
    case 'API':
      return {
        leftBorder: 'border-l-4 border-cyan-500',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        icon: '⚡'
      };
    default:
      return {
        leftBorder: 'border-l-4 border-green-500',
        badge: 'bg-green-500/15 text-green-400 border-green-500/30',
        icon: '🔵'
      };
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export function LogStream({ events, className = 'h-[600px]' }: LogStreamProps) {
  const [filteredEvents, setFilteredEvents] = useState<AuditLog[]>(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [isLive, setIsLive] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasAtBottom = useRef(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Filter events when props change or filters update
  useEffect(() => {
    let filtered = events;
    
    // Filter by level
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => getLogLevel(log.action) === selectedLevel);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(term) ||
        log.resource?.toLowerCase().includes(term) ||
        log.userProfile?.email?.toLowerCase().includes(term) ||
        log.organization?.name.toLowerCase().includes(term) ||
        JSON.stringify(log.details).toLowerCase().includes(term)
      );
    }
    
    setFilteredEvents(filtered);
    
    // Auto-scroll if enabled and was at bottom
    if (isLive && wasAtBottom.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [events, searchTerm, selectedLevel, isLive]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    
    wasAtBottom.current = isAtBottom;
    
    // Pause auto-scroll if user scrolls up
    if (!isAtBottom && isLive) {
      setIsLive(false);
    }
  }, [isLive]);

  // Copy to clipboard handler
  const handleCopy = useCallback(async (log: AuditLog) => {
    const logText = `[${log.createdAt}] ${log.action} - ${log.resource || 'N/A'} - ${
      log.userProfile?.email || 'System'
    } - ${JSON.stringify(log.details)}`;
    
    await navigator.clipboard.writeText(logText);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // **SSE Integration for Real-Time Updates **
  useEffect(() => {
    // Connect to admin SSE endpoint
    eventSourceRef.current = new EventSource('/api/admin/stream');
    
    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // New log entries will appear through React Query invalidation
      // This component receives them via props from the parent
    };

    eventSourceRef.current.onerror = () => {
      console.error('SSE connection failed, retrying...');
      eventSourceRef.current?.close();
    };

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  if (!events.length && !isLive) {
    return (
      <div className={`bg-slate-900/30 border border-cyan-500/20 rounded-xl p-8 flex items-center justify-center ${className}`}>
        <div className="text-center text-cyan-200/60">
          <HiFunnel className="text-4xl mx-auto mb-3 text-cyan-400/50" />
          <p>No logs match your filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedLevel('ALL'); }}
            className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Clear filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-900/30 border border-cyan-500/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header Controls */}
      <div className="border-b border-cyan-500/20 bg-slate-900/50 p-4 space-y-3">
        {/* Live Indicator & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
              {isLive && (
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
              )}
            </div>
            <span className="text-sm font-medium text-cyan-200">
              {isLive ? 'LIVE STREAMING' : 'PAUSED'}
            </span>
            <span className="text-xs text-slate-400">
              {filteredEvents.length} of {events.length} events
            </span>
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
              isLive 
                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
            }`}
          >
            {isLive ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by action, user, org, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <HiFunnel className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as LogLevel)}
              className="px-3 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            >
              {LOG_LEVELS.map(level => (
                <option key={level} value={level} className="bg-slate-900">
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log Stream */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1 p-3 bg-slate-950/40"
      >
        {filteredEvents.map((log) => {
          const level = getLogLevel(log.action);
          const styles = getLevelStyles(level);
          const initials = log.userProfile?.firstName && log.userProfile?.lastName
            ? `${log.userProfile.firstName[0]}${log.userProfile.lastName[0]}`.toUpperCase()
            : 'SY';

          return (
            <div 
              key={log.id}
              className={`group relative flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-cyan-500/20 hover:bg-slate-900/40 transition-all duration-200 ${styles.leftBorder} ${
                // Highlight animation for new entries
                events[0]?.id === log.id && isLive ? 'animate-pulse' : ''
              }`}
              onClick={() => handleCopy(log)}
            >
              {/* Timestamp */}
              <div className="text-slate-400 w-16 shrink-0">
                {formatTimestamp(log.createdAt)}
              </div>

              {/* Level Badge */}
              <div className={`px-2 py-1 rounded ${styles.badge} font-medium w-16 text-center`}>
                {level}
              </div>

              {/* User Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cyan-300 font-medium">{log.action}</span>
                  {log.resource && (
                    <>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-300 bg-slate-800/60 px-1.5 py-0.5 rounded">
                        {log.resource}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="mt-1 flex items-center gap-3 text-slate-400 text-[11px]">
                  <span className="truncate max-w-[200px]">
                    {log.userProfile?.email || 'system'}
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400/70 truncate max-w-[150px]">
                    {log.organization?.name}
                  </span>
                  {log.ipAddress && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500">{log.ipAddress}</span>
                    </>
                  )}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded border border-dashed border-cyan-500/20 max-h-20 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(log);
                }}
                className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded ${
                  copiedId === log.id 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20'
                }`}
                title="Copy log details"
              >
                {copiedId === log.id ? <HiCheckCircle className="w-4 h-4" /> : <HiClipboardDocument className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}