export function getAnalyticsCredentials() {
  return {
    url: process.env.N8N_URL || 'https://n8n-bridge.onrender.com', // n8n hosted on Render
    key: process.env.ANALYTICS_KEY || 'dev-analytics-key-123',
  };
}
