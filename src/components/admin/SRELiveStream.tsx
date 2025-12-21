// src/components/admin/SRELiveStream.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { HiMagnifyingGlass, HiFunnel, HiPause, HiPlay, HiClipboardDocument, HiCheckCircle } from 'react-icons/hi2';

interface SREEvent {
  id: string;
  timestamp: number;
  event: string;
  data: any;
  service?: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}

interface SRELiveStreamProps {
  className?: string;
}

const LOG_LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG', 'API', 'SUPPORT', 'METRICS'] as const;
type LogLevel = typeof LOG_LEVELS[number];

const getLevelFromEvent = (eventName: string): LogLevel => {
  if (eventName.includes('error') || eventName.includes('failed')) return 'ERROR';
  if (eventName.includes('warning') || eventName.includes('suspicious')) return 'WARN';
  if (eventName.includes('metrics')) return 'METRICS';
  if (eventName.includes('support')) return 'SUPPORT';
  if (eventName.includes('api') || eventName.includes('webhook')) return 'API';
  return 'INFO';
};

const getServiceFromEvent = (eventName: string): string => {
  if (eventName.startsWith('support:')) return 'support';
  if (eventName.startsWith('metrics:')) return 'metrics';
  if (eventName.startsWith('api:')) return 'api';
  if (eventName.startsWith('auth:')) return 'auth';
  if (eventName.startsWith('webhook:')) return 'webhook';
  return 'core';
};

const getLevelStyles = (level: LogLevel) => {
  switch (level) {
    case 'ERROR':
      return {
        leftBorder: 'border-l-4 border-red-500',
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
        icon: '🔴'
      };
    case 'WARN':
      return {
        leftBorder: 'border-l-4 border-amber-500',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: '🟡'
      };
    case 'METRICS':
      return {
        leftBorder: 'border-l-4 border-purple-500',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        icon: '📊'
      };
    case 'SUPPORT':
      return {
        leftBorder: 'border-l-4 border-green-500',
        badge: 'bg-green-500/15 text-green-400 border-green-500/30',
        icon: '🎧'
      };
    case 'API':
      return {
        leftBorder: 'border-l-4 border-cyan-500',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        icon: '⚡'
      };
    default:
      return {
        leftBorder: 'border-l-4 border-blue-500',
        badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        icon: '🔵'
      };
  }
};

const formatTimestamp = (ts: number) => {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export function SRELiveStream({ className = 'h-[600px]' }: SRELiveStreamProps) {
  const [events, setEvents] = useState<SREEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [isLive, setIsLive] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasAtBottom = useRef(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE Connection
  useEffect(() => {
    eventSourceRef.current = new EventSource('/api/admin/stream');
    
    eventSourceRef.current.onmessage = (event) => {
      const srEvent = JSON.parse(event.data) as SREEvent;
      
      setEvents(prev => {
        const newEvents = [srEvent, ...prev].slice(0, 1000); // Keep last 1000
        return newEvents;
      });
    };

    eventSourceRef.current.onerror = () => {
      console.error('[SRELIVE] SSE connection error');
      eventSourceRef.current?.close();
      // Reconnect after 3s
      setTimeout(() => {
        if (isLive) eventSourceRef.current = new EventSource('/api/admin/stream');
      }, 3000);
    };

    return () => {
      eventSourceRef.current?.close();
    };
  }, [isLive]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const level = getLevelFromEvent(event.event);
    const service = getServiceFromEvent(event.event);
    
    if (selectedLevel !== 'ALL' && level !== selectedLevel) return false;
    if (selectedService !== 'ALL' && service !== selectedService) return false;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        event.event.toLowerCase().includes(term) ||
        JSON.stringify(event.data).toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Auto-scroll
  useEffect(() => {
    if (isLive && wasAtBottom.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [filteredEvents, isLive]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtTop = scrollTop < 10;
    wasAtBottom.current = isAtTop;
    
    if (!isAtTop && isLive) setIsLive(false);
  }, [isLive]);

  const handleCopy = useCallback(async (event: SREEvent) => {
    const logText = `[${new Date(event.timestamp).toISOString()}] ${event.event}: ${JSON.stringify(event.data)}`;
    await navigator.clipboard.writeText(logText);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  if (!isLive && events.length === 0) {
    return (
      <div className={`bg-slate-900/30 border border-cyan-500/20 rounded-xl p-8 flex items-center justify-center ${className}`}>
        <div className="text-center text-cyan-200/60">
          <HiPause className="text-4xl mx-auto mb-3 text-cyan-400/50" />
          <p>Stream paused or no events yet.</p>
          <button 
            onClick={() => setIsLive(true)}
            className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Resume streaming
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-900/30 border border-cyan-500/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/50 p-4 space-y-3">
        {/* Live Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-sm font-medium text-cyan-200">
              {isLive ? 'LIVE' : 'PAUSED'} • {filteredEvents.length} events
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isLive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
          >
            {isLive ? <HiPause className="w-4 h-4 inline" /> : <HiPlay className="w-4 h-4 inline" />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel)}
            className="px-3 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {LOG_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="ALL">All Services</option>
            <option value="support">Support</option>
            <option value="metrics">Metrics</option>
            <option value="api">API</option>
            <option value="auth">Auth</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
      </div>

      {/* Event Stream */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1 p-3 bg-slate-950/40"
      >
        {filteredEvents.map((event) => {
          const level = getLevelFromEvent(event.event);
          const service = getServiceFromEvent(event.event);
          const styles = getLevelStyles(level);

          return (
            <div 
              key={event.id}
              className={`group relative flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-cyan-500/20 hover:bg-slate-900/40 transition-all ${styles.leftBorder}`}
              onClick={() => handleCopy(event)}
            >
              {/* Timestamp */}
              <div className="text-slate-400 w-16 shrink-0 font-mono">
                {formatTimestamp(event.timestamp)}
              </div>

              {/* Service & Level */}
              <div className="flex gap-2 items-center w-24 shrink-0">
                <span className={`px-2 py-1 rounded ${styles.badge} font-medium text-[10px] w-14 text-center truncate`}>
                  {level}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{service}</span>
              </div>

              {/* Event Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-medium">{event.event}</span>
                </div>
                
                {/* Data Preview */}
                {event.data && (
                  <div className="mt-1 text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded border border-dashed border-cyan-500/20 max-h-20 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(event);
                }}
                className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded ${
                  copiedId === event.id 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20'
                }`}
                title="Copy event"
              >
                {copiedId === event.id ? <HiCheckCircle className="w-4 h-4" /> : <HiClipboardDocument className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}