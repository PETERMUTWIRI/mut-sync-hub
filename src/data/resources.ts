export type Resource = {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'api' | 'guides' | 'support' | 'blog' | 'whitepapers';
  type: 'pdf' | 'video' | 'article' | 'api' | 'tutorial' | 'whitepaper';
  url: string;
  date: string;
  author?: string;
  tags: string[];
  featured?: boolean;
  readingTime?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
};

export const resources: Resource[] = [
  {
    id: 'doc-architecture',
    title: 'Platform Architecture Overview',
    description: 'Comprehensive guide to MUTSYNCHUB architecture and infrastructure design principles',
    category: 'documentation',
    type: 'pdf',
    url: '/docs/architecture',
    date: '2025-06-15',
    tags: ['architecture', 'infrastructure', 'scalability'],
    readingTime: '15 min'
  },
  {
    id: 'api-auth',
    title: 'Authentication API Reference',
    description: 'Detailed documentation for our OAuth 2.0 implementation and API security',
    category: 'api',
    type: 'api',
    url: '/api/auth',
    date: '2025-07-01',
    tags: ['api', 'security', 'oauth'],
    level: 'intermediate'
  },
  {
    id: 'guide-dashboard',
    title: 'Building Custom Dashboards',
    description: 'Step-by-step tutorial for creating advanced analytics dashboards',
    category: 'guides',
    type: 'tutorial',
    url: '/guides/dashboards',
    date: '2025-06-22',
    tags: ['dashboard', 'analytics', 'visualization'],
    featured: true,
    readingTime: '25 min',
    level: 'advanced'
  },
  // ... 30+ additional resources
  // Blog resources (AI/Data Analytics)
  {
    id: 'blog-youtube-ai-1',
    title: 'AI for Business: YouTube Deep Dive',
    description: 'Watch this YouTube video on how AI is transforming enterprise analytics.',
    category: 'blog',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=E0Hmnixke2g',
    date: '2025-07-01',
    tags: ['AI', 'analytics', 'video'],
    featured: true,
    readingTime: '10 min',
    thumbnail: 'https://img.youtube.com/vi/2ePf9rue1Ao/hqdefault.jpg'
  },
  {
    id: 'blog-medium-ai-2',
    title: 'AI Trends in 2025',
    description: 'Medium article on the latest AI trends for data-driven enterprises.',
    category: 'blog',
    type: 'article',
    url: 'https://medium.com/ai-trends-2025',
    date: '2025-06-15',
    tags: ['AI', 'medium', 'trends'],
    featured: false,
    readingTime: '7 min',
    thumbnail: 'https://miro.medium.com/max/720/1*ai_trends.jpeg'
  },
  {
    id: 'blog-youtube-analytics-3',
    title: 'Data Analytics for Enterprises',
    description: 'YouTube video: Best practices for enterprise data analytics.',
    category: 'blog',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=1WHaFWMMXLI',
    date: '2025-06-10',
    tags: ['analytics', 'video', 'enterprise'],
    featured: false,
    readingTime: '12 min',
    thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg'
  },
  {
    id: 'blog-medium-data-4',
    title: 'Data-Driven Culture',
    description: 'Medium: Building a data-driven culture in your organization.',
    category: 'blog',
    type: 'article',
    url: 'https://medium.com/data-driven-culture',
    date: '2025-05-28',
    tags: ['data', 'culture', 'medium'],
    featured: false,
    readingTime: '8 min',
    thumbnail: 'https://miro.medium.com/max/720/1*data_culture.jpeg'
  },
  {
    id: 'blog-youtube-ai-5',
    title: 'AI Ethics in Analytics',
    description: 'YouTube: Exploring ethical AI in enterprise analytics.',
    category: 'blog',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=aGwYtUzMQUk',
    date: '2025-05-20',
    tags: ['AI', 'ethics', 'video'],
    featured: false,
    readingTime: '9 min',
    thumbnail: 'https://img.youtube.com/vi/3tmd-ClpJxA/hqdefault.jpg'
  },
  // Support resources (help, guides, community)
  {
    id: 'support-guide-1',
    title: 'How to Submit a Support Ticket',
    description: 'Step-by-step guide for submitting support tickets in MUTSYNCHUB.',
    category: 'support',
    type: 'tutorial',
    url: '/support/submit-ticket',
    date: '2025-07-01',
    tags: ['support', 'guide', 'ticket'],
    featured: true,
    readingTime: '5 min',
    thumbnail: '/public/support-guide-1.png'
  },
  {
    id: 'support-community-2',
    title: 'Join the Community Forum',
    description: 'Connect with other users and get help in our community forum.',
    category: 'support',
    type: 'article',
    url: '/support/community',
    date: '2025-06-25',
    tags: ['support', 'community', 'forum'],
    featured: false,
    readingTime: '3 min',
    thumbnail: '/public/support-community-2.png'
  },
  {
    id: 'support-faq-3',
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about MUTSYNCHUB.',
    category: 'support',
    type: 'article',
    url: '/support/faq',
    date: '2025-06-20',
    tags: ['support', 'faq'],
    featured: false,
    readingTime: '4 min',
    thumbnail: '/public/support-faq-3.png'
  },
  {
    id: 'support-status-4',
    title: 'System Status Dashboard',
    description: 'Check the current status of MUTSYNCHUB services.',
    category: 'support',
    type: 'article',
    url: '/support/status',
    date: '2025-06-15',
    tags: ['support', 'status', 'dashboard'],
    featured: false,
    readingTime: '2 min',
    thumbnail: '/public/support-status-4.png'
  },
  {
    id: 'support-contact-5',
    title: 'Contact Support',
    description: 'Reach out to our support team for personalized help.',
    category: 'support',
    type: 'article',
    url: '/support/contact',
    date: '2025-06-10',
    tags: ['support', 'contact'],
    featured: false,
    readingTime: '2 min',
    thumbnail: '/public/support-contact-5.png'
  },
  {
    id: 'whitepaper-ai',
    title: 'AI-Powered Data Integration Patterns',
    description: 'Research paper on next-gen data integration using machine learning',
    category: 'whitepapers',
    type: 'whitepaper',
    url: '/whitepapers/ai-integration',
    date: '2025-05-30',
    author: 'Dr. Elena Rodriguez',
    tags: ['AI', 'machine learning', 'data integration'],
    featured: true,
    readingTime: '45 min'
  }
];
