"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AIFloatingWidget: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openHandler = () => setAiOpen(true);
    window.addEventListener('openChatWidget', openHandler);
    return () => window.removeEventListener('openChatWidget', openHandler);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error('Agent API error');
      const data = await res.json();
      setResponse(data.response || '[AI Response] No answer received.');
    } catch (err: any) {
      setResponse('[AI Error] Unable to connect to agent backend.');
    }
    setLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {!aiOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-[200] bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-5 flex items-center justify-center group"
            style={{ 
              boxShadow: "0 10px 35px -5px rgba(29, 123, 233, 0.4)",
              width: "72px",
              height: "72px"
            }}
            onClick={() => setAiOpen(true)}
            aria-label="Open AI Assistant"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Bot className="h-7 w-7 mb-1" />
              <span className="text-xs font-medium">AI</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-8 right-8 z-[300] w-[400px] max-w-[90vw]"
          >
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">MutSyncHub AI Assistant</h2>
                      <p className="text-sm text-blue-100 opacity-90">Enterprise-grade solutions</p>
                    </div>
                  </div>
                  <button 
                    className="text-blue-100 hover:text-white transition-colors p-1"
                    onClick={() => setAiOpen(false)}
                    aria-label="Close AI Assistant"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Welcome panel */}
              <div className="p-5 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Hello! I'm your enterprise AI assistant</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Ask about solutions, integrations, or technical architecture.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Chat container */}
              <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                {response && (
                  <div className="mb-6">
                    <div className="flex justify-end mb-2">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%]">
                        <p className="text-sm">{query}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                        <p className="text-sm">{response}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center py-4">
                  <div className="inline-flex flex-wrap justify-center gap-2">
                    {[
                      "Explain cloud architecture",
                      "Show API integrations",
                      "Describe AI ecosystems"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full transition-colors"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Input area */}
              <form 
                onSubmit={handleSend} 
                className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask about our enterprise solutions..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !query.trim()} 
                    className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 flex items-center justify-center ${
                      !query.trim() || loading ? 'opacity-50' : 'hover:opacity-90'
                    } transition-all`}
                    style={{ minWidth: "48px" }}
                  >
                    {loading ? (
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150"></div>
                      </div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFloatingWidget;