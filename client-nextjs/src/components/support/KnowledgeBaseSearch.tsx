// client-nextjs/src/components/support/KnowledgeBaseSearch.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { useDebounce } from '@/lib/useDebounce';              // tiny hook below
import { agentChat } from '@/app/actions/agent';             // your HF agent

type Article = {
  id: string;
  title: string;
  description: string;
  category: string;
  views: number;
  lastUpdated: string;
  content?: string; // full text for AI ranking
};

const CATEGORIES = [
  { id: 'getting-started', category: 'Getting Started', count: 5, views: 1243 },
  { id: 'api',            category: 'API Documentation', count: 3, views: 876 },
  { id: 'integrations',   category: 'Integrations', count: 4, views: 921 },
  { id: 'billing',        category: 'Billing & Accounts', count: 2, views: 542 },
  { id: 'troubleshooting',category: 'Troubleshooting', count: 6, views: 1102 },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'KB-001',
    title: 'Setting Up Your First Integration',
    description: 'Step-by-step guide to connecting your first data source',
    category: 'Getting Started',
    views: 1243,
    lastUpdated: '2025-07-10',
    content: 'Open the Integrations tab → click "Add Source" → choose your system → enter credentials → test connection → save.',
  },
  {
    id: 'KB-002',
    title: 'API Authentication Methods',
    description: 'Understanding OAuth 2.0 and API key authentication',
    category: 'API Documentation',
    views: 876,
    lastUpdated: '2025-07-15',
    content: 'MutSyncHub supports OAuth 2.0 client-credentials and long-lived API keys. Rotate keys every 90 days for security.',
  },
  {
    id: 'KB-003',
    title: 'Resolving Data Sync Issues',
    description: 'Common problems and solutions for data synchronization',
    category: 'Troubleshooting',
    views: 921,
    lastUpdated: '2025-06-28',
    content: 'If sync fails, check firewall ports, verify credentials, and ensure the source schema has not changed.',
  },
];

/* ---------- component ---------- */
export default function KnowledgeBaseSearch() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Article[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  /* load recently viewed from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem('kb-recent');
    if (raw) setRecentIds(JSON.parse(raw));
  }, []);

  const markAsRead = (id: string) => {
    const updated = [id, ...recentIds.filter((i) => i !== id)].slice(0, 5);
    setRecentIds(updated);
    localStorage.setItem('kb-recent', JSON.stringify(updated));
  };

  /* AI suggestions whenever debounced search changes */
  useEffect(() => {
    if (!debounced) { setAiSuggestions([]); return; }
    setAiLoading(true);
    agentChat(`Suggest the 3 most relevant knowledge-base articles for: "${debounced}". Reply JSON only: [{"id":"KB-xxx","title":"...","description":"..."}]`)
      .then((res) => {
        try {
          const parsed: Article[] = JSON.parse(res.content);
          setAiSuggestions(parsed);
        } catch {
          setAiSuggestions([]);
        }
      })
      .finally(() => setAiLoading(false));
  }, [debounced]);

  /* highlight matched text */
  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-[#2E7D7D]/30 text-teal-200 rounded px-1">{p}</span>
      ) : (
        p
      )
    );
  };

  /* filtered lists */
  const filtered = useMemo(() => {
    if (!debounced) return MOCK_ARTICLES;
    const q = debounced.toLowerCase();
    return MOCK_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [debounced]);

  const recent = useMemo(
    () => MOCK_ARTICLES.filter((a) => recentIds.includes(a.id)),
    [recentIds]
  );

  /* ----- render ----- */
  return (
    <div className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl overflow-hidden">
      {/* search bar */}
      <div className="p-6 border-b border-[#2E7D7D]/30">
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2E7D7D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-[#2E7D7D]/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
          />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* AI suggestions */}
        {aiSuggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#2E7D7D]" />
              <h3 className="text-white font-semibold">AI Suggestions</h3>
            </div>
            <div className="space-y-3">
              {aiSuggestions.map((a) => (
                <ArticleRow key={a.id} article={a} highlightQuery={search} onRead={markAsRead} highlight={highlight} />
              ))}
            </div>
          </section>
        )}

        {/* recently viewed */}
        {recent.length > 0 && !search && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[#2E7D7D]" />
              <h3 className="text-white font-semibold">Recently Viewed</h3>
            </div>
            <div className="space-y-3">
              {recent.map((a) => (
                <ArticleRow key={a.id} article={a} highlightQuery={search} onRead={markAsRead} highlight={highlight} />
              ))}
            </div>
          </section>
        )}

        {/* categories */}
        {!search && (
          <section>
            <h3 className="text-white font-semibold mb-3">Browse by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((c) => (
                <CategoryCard key={c.id} {...c} />
              ))}
            </div>
          </section>
        )}

        {/* search results / popular */}
        <section>
          <h3 className="text-white font-semibold mb-3">{search ? 'Search Results' : 'Popular Articles'}</h3>
          <div className="space-y-3">
            {filtered.map((a) => (
              <ArticleRow key={a.id} article={a} highlightQuery={search} onRead={markAsRead} highlight={highlight} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */
function ArticleRow({ article, highlightQuery, onRead, highlight }: { article: Article; highlightQuery: string; onRead: (id: string) => void; highlight: (text: string, query: string) => React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-4 p-4 hover:bg-[#2E7D7D]/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#2E7D7D]/40"
      onClick={() => onRead(article.id)}
    >
      <BookOpen size={20} className="text-[#2E7D7D] shrink-0 mt-1" />
      <div className="flex-1">
        <h4 className="text-white font-medium">{highlight(article.title, highlightQuery)}</h4>
        <p className="text-gray-300 text-sm mt-1">{highlight(article.description, highlightQuery)}</p>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span>{article.category}</span>
          <span>{article.views} views</span>
          <span>Updated {new Date(article.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-[#2E7D7D]" />
    </div>
  );
}

function CategoryCard({ category, count }: { category: string; count: number }) {
  return (
    <div className="bg-black/30 border border-[#2E7D7D]/30 rounded-lg p-4 hover:border-[#2E7D7D] transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">{category}</h4>
        <span className="bg-[#2E7D7D]/20 text-[#2E7D7D] rounded-full px-2 py-1 text-xs">{count} articles</span>
      </div>
      <button className="mt-3 text-[#2E7D7D] hover:text-teal-400 text-sm font-medium flex items-center gap-1">
        View all <ChevronRight size={14} />
      </button>
    </div>
  );
}