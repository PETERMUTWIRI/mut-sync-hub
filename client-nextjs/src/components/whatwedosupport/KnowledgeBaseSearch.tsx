// src/components/support/KnowledgeBaseSearch.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Getting Started',
    articles: [
      {
        title: 'Welcome to MutSyncHub: Your First Steps',
        content: `MutSyncHub is designed to empower businesses with seamless data integration and analytics. To get started, create your account using your business email, then verify your identity through our secure onboarding process. Once inside the dashboard, you’ll find a guided tour that highlights key features such as data source connections, sync scheduling, and real-time monitoring. Begin by linking your first data source—MutSyncHub supports SQL, NoSQL, and cloud platforms. Our wizard walks you through authentication, permissions, and mapping fields for optimal data flow. After setup, explore the analytics dashboard to visualize your data and set up automated syncs. If you need help, our support team is available 24/7 via chat, email, or phone. MutSyncHub’s documentation and knowledge base provide step-by-step guides for every feature, ensuring you’re never stuck. By following these steps, you’ll unlock the full power of MutSyncHub for your enterprise.`
      },
      {
        title: 'Setting Up Your First Integration',
        content: `Integrating your first data source with MutSyncHub is simple. Navigate to the Integrations tab and select from our library of supported platforms. Whether you’re connecting a cloud database, SaaS app, or custom API, our integration wizard provides clear instructions. Enter your credentials, configure sync frequency, and choose which tables or objects to import. MutSyncHub validates your connection and offers troubleshooting tips if issues arise. Once connected, you can monitor sync status, view logs, and receive notifications for any errors. Our platform’s flexibility means you can add, remove, or modify integrations at any time. For advanced setups, use our API or webhook features to automate workflows. With MutSyncHub, your data integration is secure, scalable, and fully supported.`
      },
      {
        title: 'User Roles and Permissions in MutSyncHub',
        content: `Managing user access is critical for enterprise security. MutSyncHub allows you to assign roles such as Admin, Analyst, and Viewer, each with customizable permissions. Admins can add or remove users, configure integrations, and access billing. Analysts can view and manipulate data, create reports, and set up syncs. Viewers have read-only access to dashboards and reports. To manage roles, visit the Account Settings page and use the intuitive interface to assign permissions. MutSyncHub logs all user activity for compliance and auditing. Our RBAC (Role-Based Access Control) system ensures only authorized users can access sensitive data. For SSO and advanced authentication, MutSyncHub integrates with major identity providers. Secure your enterprise with robust user management tools.`
      },
      {
        title: 'Customizing Your Dashboard Experience',
        content: `MutSyncHub’s dashboard is fully customizable to fit your business needs. Use drag-and-drop widgets to display key metrics, sync status, and alerts. Create custom views for different teams, such as finance, operations, or IT. Save dashboard layouts and share them with colleagues. Our platform supports dark mode, accessibility features, and responsive design for mobile devices. Integrate third-party visualization tools or export data to your BI platform. MutSyncHub’s dashboard adapts as your business grows, allowing you to add new widgets, integrations, and reports. Personalize your experience and make data-driven decisions with ease.`
      },
      {
        title: 'Getting Help: Support Channels and Resources',
        content: `MutSyncHub offers multiple support channels to ensure you get help when you need it. Access our live chat for instant answers, submit support tickets for complex issues, or browse the knowledge base for self-service guides. Our support team is staffed by experts in data integration, analytics, and enterprise IT. We offer onboarding webinars, video tutorials, and detailed documentation. For urgent issues, phone support is available 24/7. MutSyncHub’s community forum connects you with other users to share tips and solutions. Stay informed with system status updates and proactive notifications. With MutSyncHub, world-class support is always at your fingertips.`
      }
    ]
  },
  {
    name: 'API Documentation',
    articles: [
      {
        title: 'Authenticating with MutSyncHub API',
        content: `MutSyncHub’s API uses secure authentication methods to protect your data. Generate your API key from the dashboard and use it in the Authorization header for all requests. For enterprise clients, we support OAuth 2.0 and SSO integration. Our API documentation provides sample code for popular languages, including Python, JavaScript, and Java. Authentication errors are clearly explained, with troubleshooting steps for invalid keys, expired tokens, and permission issues. MutSyncHub’s support team can assist with API onboarding and security best practices.`
      },
      {
        title: 'REST and GraphQL Endpoints Overview',
        content: `MutSyncHub offers both REST and GraphQL endpoints for flexible data access. REST endpoints cover common operations such as listing integrations, fetching sync status, and managing users. GraphQL allows you to query multiple data sources in a single request, with fine-grained control over fields and filters. Our documentation includes endpoint URLs, request/response formats, and sample queries. MutSyncHub’s API is versioned for stability, and we provide changelogs for all updates. Use our API explorer to test requests and view live data.`
      },
      {
        title: 'Error Handling and Troubleshooting',
        content: `Robust error handling is built into MutSyncHub’s API. Standard HTTP status codes indicate success or failure, and detailed error messages help you diagnose issues. Common errors include authentication failures, invalid parameters, and rate limits. Our documentation lists all error codes and provides solutions. For complex issues, enable debug logging and contact support with your request ID. MutSyncHub’s API uptime is monitored 24/7, and we publish status updates for any incidents.`
      },
      {
        title: 'Webhooks and Event-Driven Integrations',
        content: `MutSyncHub supports webhooks for real-time event notifications. Configure webhooks to receive updates on sync completion, errors, or new integrations. Our event payloads include detailed metadata for easy processing. Secure your webhooks with secret tokens and IP whitelisting. MutSyncHub’s documentation provides setup guides and sample payloads. Use webhooks to automate workflows, trigger alerts, or sync data with external systems. For advanced use cases, contact our solutions team for custom integrations.`
      },
      {
        title: 'API Rate Limits and Best Practices',
        content: `To ensure platform stability, MutSyncHub enforces API rate limits based on your subscription tier. Our documentation lists rate limits for each endpoint and provides tips for efficient usage. Use pagination, caching, and batch requests to optimize performance. Exceeding rate limits returns a clear error message with retry instructions. For high-volume clients, contact MutSyncHub to discuss custom limits and dedicated resources. Follow our best practices for secure, scalable API integration.`
      }
    ]
  },
  {
    name: 'Integrations',
    articles: [
      {
        title: 'Connecting Cloud Storage Platforms',
        content: `MutSyncHub integrates with major cloud storage providers, including AWS S3, Google Cloud Storage, and Azure Blob. Use our integration wizard to authenticate, select buckets, and configure sync schedules. MutSyncHub supports incremental syncs, conflict resolution, and data validation. Monitor integration health from the dashboard and receive alerts for any issues. Our documentation covers setup, troubleshooting, and advanced features such as encryption and access control.`
      },
      {
        title: 'Integrating SaaS Applications',
        content: `Connect your SaaS apps to MutSyncHub for unified data analytics. Supported platforms include Salesforce, HubSpot, and Slack. Use OAuth for secure authentication and select which objects to sync. MutSyncHub maps fields automatically and provides customization options. Schedule syncs, monitor status, and resolve errors with our intuitive interface. For unsupported apps, use our custom API integration feature. MutSyncHub’s support team assists with onboarding and optimization.`
      },
      {
        title: 'Custom API Integrations',
        content: `MutSyncHub’s flexible API integration framework lets you connect any REST or GraphQL API. Define endpoints, authentication, and data mapping in the dashboard. Test connections, view logs, and set up automated syncs. Our documentation provides sample configurations and troubleshooting tips. MutSyncHub supports complex workflows, including multi-step syncs and conditional logic. For enterprise clients, we offer custom integration services and dedicated support.`
      },
      {
        title: 'Monitoring and Managing Integrations',
        content: `Keep your integrations running smoothly with MutSyncHub’s monitoring tools. View sync status, error logs, and performance metrics in real time. Set up notifications for failures, delays, or data anomalies. Use the dashboard to pause, resume, or reconfigure integrations. MutSyncHub’s analytics help you identify bottlenecks and optimize workflows. Our support team provides proactive monitoring and incident response for mission-critical integrations.`
      },
      {
        title: 'Security and Compliance for Integrations',
        content: `MutSyncHub prioritizes security and compliance for all integrations. Data is encrypted in transit and at rest, and we support SOC 2, GDPR, and HIPAA requirements. Configure access controls, audit logs, and data retention policies from the dashboard. MutSyncHub’s compliance team provides documentation and assistance for regulatory audits. Stay secure and compliant with enterprise-grade integration tools.`
      }
    ]
  },
  {
    name: 'Billing & Accounts',
    articles: [
      {
        title: 'Understanding MutSyncHub Subscription Plans',
        content: `MutSyncHub offers flexible subscription plans for businesses of all sizes. Choose from Free, Professional, and Enterprise tiers, each with different features and limits. Our billing dashboard provides a clear overview of your plan, usage, and renewal dates. Upgrade or downgrade anytime, and view detailed invoices for each billing cycle. MutSyncHub’s support team can help you select the best plan for your needs.`
      },
      {
        title: 'Managing Payment Methods and Invoices',
        content: `Add, update, or remove payment methods securely from your account settings. MutSyncHub supports credit cards, ACH, and wire transfers. View and download invoices for each billing period, with line-item details and tax information. Set up billing contacts and notifications to stay informed. For payment issues, contact our billing support team for prompt assistance.`
      },
      {
        title: 'Account Security and Data Privacy',
        content: `Protect your account with MutSyncHub’s security features. Enable two-factor authentication, set strong passwords, and monitor login activity. Our platform complies with major data privacy regulations, and we never share your information with third parties. Review our privacy policy and data retention settings in the dashboard. MutSyncHub’s support team is available for security consultations and incident response.`
      },
      {
        title: 'Resolving Billing Issues and Disputes',
        content: `If you encounter billing issues, MutSyncHub provides clear resolution steps. Submit a support ticket with your invoice number and details. Our team investigates disputes promptly and communicates updates throughout the process. Refunds and adjustments are processed according to our terms of service. For urgent issues, phone support is available 24/7. MutSyncHub values transparency and customer satisfaction in all billing matters.`
      },
      {
        title: 'Account Management for Teams',
        content: `MutSyncHub supports team-based account management. Add or remove users, assign roles, and configure permissions from the dashboard. Set up billing contacts, manage subscriptions, and monitor usage for each team member. Our platform provides audit logs and activity reports for compliance. For enterprise clients, MutSyncHub offers dedicated account managers and onboarding support.`
      }
    ]
  },
  {
    name: 'Troubleshooting',
    articles: [
      {
        title: 'Resolving Data Sync Failures',
        content: `Data sync failures can occur due to network issues, authentication errors, or schema changes. MutSyncHub’s troubleshooting guide walks you through common causes and solutions. Check connection status, review error logs, and validate credentials. Our platform provides automated alerts and suggestions for quick resolution. For persistent issues, contact support with your sync ID and logs. MutSyncHub’s team is available 24/7 to assist with critical incidents.`
      },
      {
        title: 'Fixing Integration Errors',
        content: `Integration errors may result from API changes, permission issues, or data mapping conflicts. MutSyncHub’s dashboard highlights affected integrations and provides step-by-step fixes. Update credentials, review field mappings, and test connections. Our documentation covers common error codes and solutions. For complex cases, enable debug mode and share logs with support. MutSyncHub’s proactive monitoring helps prevent future errors.`
      },
      {
        title: 'Optimizing Performance and Speed',
        content: `Slow syncs or analytics can impact business operations. MutSyncHub’s performance guide covers optimization tips such as batching requests, indexing data, and scheduling syncs during off-peak hours. Monitor performance metrics in the dashboard and set up alerts for delays. Our support team can analyze logs and recommend improvements. MutSyncHub’s scalable architecture ensures high performance for enterprise workloads.`
      },
      {
        title: 'Handling Authentication and Access Issues',
        content: `Authentication issues may prevent users or integrations from accessing MutSyncHub. Review user roles, permissions, and API keys in the dashboard. Reset passwords, enable two-factor authentication, and check SSO settings. Our documentation provides troubleshooting steps for common access problems. For urgent cases, contact support for immediate assistance. MutSyncHub’s security team monitors access logs and responds to incidents.`
      },
      {
        title: 'Contacting Support for Urgent Issues',
        content: `For urgent issues, MutSyncHub offers multiple support channels. Use live chat for instant help, submit tickets for complex problems, or call our 24/7 hotline. Provide detailed information, including error messages and logs, to expedite resolution. Our support team prioritizes critical incidents and communicates updates regularly. MutSyncHub’s knowledge base and community forum offer additional resources for troubleshooting.`
      }
    ]
  }
];

const KnowledgeBaseSearch = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeArticle, setActiveArticle] = useState<{categoryIdx: number, articleIdx: number} | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  // Fixed popular articles with proper indices
  const popularArticles = [
    {
      title: 'Setting Up Your First Integration',
      summary: 'Step-by-step guide to connecting your first data source',
      category: 'Getting Started',
      categoryIdx: 0,
      articleIdx: 1, // Fixed index
      views: 1243,
      date: 'Jul 10',
    },
    {
      title: 'API Authentication Methods',
      summary: 'Understanding OAuth 2.0 and API key authentication',
      category: 'API Documentation',
      categoryIdx: 1,
      articleIdx: 0, // Fixed index
      views: 876,
      date: 'Jul 15',
    },
    {
      title: 'Resolving Data Sync Issues',
      summary: 'Common problems and solutions for data synchronization',
      category: 'Troubleshooting',
      categoryIdx: 4,
      articleIdx: 0, // Fixed index
      views: 921,
      date: 'Jun 28',
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Knowledge Base</h2>
      
      {/* Popular Articles Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">Popular Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularArticles.map((article, idx) => (
            <div
              key={`${article.title}-${idx}`}
              className="bg-white/90 rounded-xl shadow flex items-center justify-between p-4 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
              onClick={() => {
                setActiveCategory(article.categoryIdx);
                setActiveArticle({
                  categoryIdx: article.categoryIdx,
                  articleIdx: article.articleIdx
                });
              }}
            >
              <div>
                <h4 className="text-blue-700 font-bold text-base mb-1">{article.title}</h4>
                <p className="text-gray-700 text-sm mb-1">{article.summary}</p>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{article.category}</span>
                  <span>{article.views} views</span>
                  <span>Updated {article.date}</span>
                </div>
              </div>
              <span className="ml-4 text-blue-700">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={cat.name}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeCategory === idx ? 'bg-white text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-white/40'}`}
            onClick={() => { 
              setActiveCategory(idx); 
              setActiveArticle(null); 
            }}
          >
            {cat.name} <span className="ml-2 text-xs font-bold">{cat.articles.length} articles</span>
          </button>
        ))}
      </div>
      
      <div className="mb-4 text-right">
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 flex items-center gap-2"
          onClick={() => setShowAllModal(true)}
        >
          View All by Category
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories[activeCategory].articles.map((article, idx) => (
          <motion.div
            key={article.title}
            className={`bg-white/90 rounded-xl shadow-lg p-6 cursor-pointer transition-all ${activeArticle?.categoryIdx === activeCategory && activeArticle?.articleIdx === idx ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
            onClick={() => setActiveArticle({
              categoryIdx: activeCategory,
              articleIdx: idx
            })}
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-lg font-bold text-blue-700 mb-2">{article.title}</h3>
            <p className="text-gray-700 text-sm line-clamp-3">{article.content.slice(0, 120)}...</p>
          </motion.div>
        ))}
      </div>

      {/* Modal for viewing all articles in category */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[80vh]">
            <button 
              className="absolute top-4 right-4 text-blue-700 font-bold text-xl" 
              onClick={() => setShowAllModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">All Articles: {categories[activeCategory].name}</h2>
            <div className="space-y-6">
              {categories[activeCategory].articles.map((article, idx) => (
                <div key={`${article.title}-${idx}`} className="border-b pb-4">
                  <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center justify-between">
                    {article.title}
                    <span className="ml-2 text-blue-700">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                  </h3>
                  <p className="text-gray-800 text-base whitespace-pre-line mb-2">{article.content.slice(0, 120)}...</p>
                  <div className="text-xs text-gray-500 flex gap-2 mb-2">
                    <span>{categories[activeCategory].name}</span>
                    <span>{(1000 + idx * 37)} views</span>
                    <span>Updated Jul {10 + idx}</span>
                  </div>
                  <button
                    className="text-blue-700 underline text-xs mt-1"
                    onClick={() => { 
                      setShowAllModal(false); 
                      setActiveArticle({
                        categoryIdx: activeCategory,
                        articleIdx: idx
                      }); 
                    }}
                  >
                    Read Full Article
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Article Content Modal */}
      {activeArticle !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-8 relative">
            <button 
              className="absolute top-4 right-4 text-blue-700 font-bold text-xl" 
              onClick={() => setActiveArticle(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              {categories[activeArticle.categoryIdx].articles[activeArticle.articleIdx].title}
            </h2>
            <p className="text-gray-800 text-base whitespace-pre-line max-h-[60vh] overflow-y-auto" style={{minHeight: '220px'}}>
              {categories[activeArticle.categoryIdx].articles[activeArticle.articleIdx].content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseSearch;