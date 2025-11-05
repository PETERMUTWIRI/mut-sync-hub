import { getAnalyticsCredentials } from '@/lib/analytics-credentials';

async function retryFetch(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      console.warn(`[trigger] → attempt ${attempt + 1} failed (${res.status})`);
      if (attempt < retries) await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    } catch (err) {
      console.warn(`[trigger] → attempt ${attempt + 1} network error:`, err);
      if (attempt < retries) await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    }
  }
  throw new Error(`[trigger] → failed after ${retries + 1} attempts`);
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { url } = getAnalyticsCredentials();
  const baseUrl = url.replace('/api/v1', '');

  const orgId = process.env.ORG_ID || 'demo';
  const isProd = process.env.NODE_ENV === 'production';
  const workflowId = process.env.N8N_WEBHOOK_ID || 'bf66a583-48a0-4281-b354-ce65159475c7';

  const webhookUrl = isProd
    ? `${baseUrl}/webhook/${orgId}`
    : `${baseUrl}/webhook-test/${workflowId}`;

  console.log(`[trigger] → sending to ${webhookUrl}`);

  const payload = {
    orgId,
    sourceId: params.id,
    ts: new Date().toISOString(),
  };

  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };

  try {
    const res = await retryFetch(webhookUrl, options, 3, 1500);
    console.log(`[trigger] → success ${res.status}`);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error(`[trigger] → final failure:`, err.message || err);
    return new Response(JSON.stringify({ error: 'Webhook trigger failed', details: err.message }), { status: 502 });
  }
}
