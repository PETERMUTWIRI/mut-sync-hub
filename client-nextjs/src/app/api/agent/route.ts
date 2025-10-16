/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';
import { google } from 'googleapis';
import { prisma } from '@lib/prisma';


/* ---------- Prisma (edge) ---------- */
let prisma: PrismaClient;
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

/* ---------- Google Calendar ---------- */
const googleAuth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});
const calendar = google.calendar({ version: 'v3', auth: googleAuth });

/* ---------- local LLM (HF-free) ---------- */
const generator = await pipeline(
  'text-generation',
  'Xenova/TinyLlama-1.1B-Chat-v1.0',
  { quantized: true }
);

/* ---------- typed wrapper ---------- */
async function generate(prompt: string, opts: { max_new_tokens?: number; temperature?: number } = {}): Promise<string> {
  const res = await generator(prompt, {
    max_new_tokens: opts.max_new_tokens ?? 40,
    temperature: opts.temperature ?? 0.8,
    do_sample: true,
    return_full_text: false,
  });
  const first = (Array.isArray(res) ? res[0] : res) as { generated_text: string };
  let text = first.generated_text.replace(/<\|.*?\|>/g, '').trim();
  const sentences = text.split(/[.!?]/);
  const unique = sentences.filter((s, i, a) => a.indexOf(s) === i);
  return unique.slice(0, 2).join('. ') + '.';
}





/* ---------- tiny helpers ---------- */
const HOT_SERVICES = [
  'AI-Agent-Ecosystems',
  'Quantum-Safe-Crypto-Stack',
  'Edge-AI-for-IoT',
  'Synthetic-Data-Generator',
  'Voice-Cloning-Defense',
  'Serverless-LLM-Runtime',
  'Green-Cloud-Optimizer',
  'Real-time-Fraud-Graph',
  'Privacy-Preserving-Analytics',
  'Autonomous-Supply-Chain',
];

const KNOWLEDGE = `
Who we really are:
We’re the team that turns “I think we have a data problem” into “We just saved 8 million shillings this quarter.”  
Born in Nairobi, built for Africa’s speed, budget, and reality.

What we actually sell (pick your pain):
1  Agents that work nights → 40 % less staff cost, 24/7 replies, zero tea breaks.
2  Cloud bill shrinking → same traffic, 30-40 % smaller invoice (money back in your pocket).
3  Stock that arrives just-in-time → no lost sales, no dead inventory, no “sorry, out of stock”.
4  Fraud caught in 200 ms → money stays in your account, not in someone else’s M-Pesa.
5  Voice clones blocked → your CEO’s voice can’t be faked to approve fake payments.
6  Encrypted data you can still read → compliance guys smile, hackers cry.
7  Forecasts that don’t guess → buy exactly what you’ll sell next month.
8  Edge AI on a KES 2 k chip → no GPU, no cloud, no latency, no licence fees.

Real numbers we’ve hit for others:
- Health-chain: 99.99 % uptime, 40 % lower cloud bill.
- Fin-tech: 94 % fraud caught, 8.7 M saved per year.
- Retail chain: 85 % of chats handled by agents, 2.1 M saved, 4.8/5 customer happiness.

How we roll (4-week sprint):
Week 1 – 30-min free call (book below) → we map your pain → live demo on your data.  
Week 2 – fixed-price quote → you say yes → we sign.  
Week 3 – build → you watch daily updates.  
Week 4 – go-live → we hand over keys + training → you start saving.

 
Enterprise – call us, we’ll tailor it.

What we will NEVER sell you:
Crypto bots, TikTok growth hacks, consumer gimmicks.  
If you ask, I’ll politely say “That’s not our lane” and point you back to the list above.

Ready to stop bleeding money or time?
Tell me what hurts most right now (cost, fraud, stock, cloud bill, customer wait) or just say “show me demo” and I’ll book you a free slot.
`;
const SUPPORT_ARTICLES = `
### 1. Password / account
Q: How do I reset my password?
A: Click “Forgot password” on the login page, enter your email, open the link we send you, choose a new password (≥ 8 chars, 1 symbol). Done.

Q: Can I change my email address?
A: Yes – open Settings → Profile → Email, type the new address, click “Send code”, enter the 6-digit code we email you, hit Save.

### 2. Billing & invoices
Q: How do I download an invoice?
A: Dashboard → Billing → Invoices → ⋯ menu → Download PDF.  
Need VAT details edited? Email billing@mutsynhub.com with your new details and we regenerate the invoice within 24 h.

Q: Why was I charged after I cancelled?
A: We bill in arrears for usage in the previous period. If you still feel the charge is wrong, open ticket TKT-BILL with the last 4 digits of the transaction and we refund within 2 business days.

### 3. Service status / outages
Current known issues:
- Integration Connectors – maintenance until 03:00 EAT (progress bar shows on status page).
- Notification System – degraded, ETA fix 1 h.  
Everything else is green. 99.99 % monthly uptime.

### 4. Data-sync questions
Q: How often does sync happen?
Free plans: 24 h.  
Pro: every 15 min.  
Enterprise: real-time or on-demand via API.

Q: Which sources are supported?
SQL (Postgres, MySQL, SQL-Server), Mongo, Firebase, S3, Google-Sheets, Shopify, Woo, M-Pesa, Safaricom, KCB, Equity, SAP, MS-Dynamics, Kafka, MQTT – full list at /docs/integrations.

### 5. API / technical
Q: Where is my API key?
Dashboard → Settings → API → Generate Key. Keep it safe; we only show it once.

Q: Getting 401 “Invalid credentials”?
Rotate a fresh key, ensure the header is: Authorization: Bearer YOUR_KEY.  
Still stuck? Send us the request-id header from the error response – we’ll trace it.

### 6. Security & compliance
- Data encrypted at rest (AES-256) and in transit (TLS 1.3).  
- SOC-2 Type-II & ISO-27001 certificates available under NDA.  
- We never store your passwords in plain text (bcrypt + salt).  
- GDPR & ODPA (Kenya) compliant – delete account self-serve under Settings → Danger Zone.

### 7. Contact channels
- 24/7 live chat (this window).  
- Email: support@mutsynhub.com – SLA 2 h business, 8 h weekends.  
- Phone / WhatsApp: +254 783 423 550 (06:00 – 22:00 EAT).

If the question is NOT listed above, reply exactly:
“I’ve logged your issue. A human will pick it up within 30 min. Ticket-ID will appear in this chat.”
`;
async function getThread(id: string) {
  return getPrisma().agentmessage.findMany({ where: { threadid: id }, orderBy: { createdat: 'asc' } });
}

async function saveMessage(id: string, role: string, content: string) {
  await getPrisma().agentmessage.create({ data: { threadid: id, role, content } });
}

function buildPrompt(msg: string, hist: any[]): string {
  const recent = hist.slice(-1).map(h => ({ role: h.role, content: h.content.slice(0, 80) }));
  const chat: any[] = [
    {
      role: 'system',
      content: `You are MutSyncHub’s AI consultant. Answer ONLY using the following knowledge base. If the question is outside this list, reply exactly: “I can only help with MutSyncHub solutions.”\n${KNOWLEDGE}`,
    },
    ...recent,
    { role: 'user', content: msg },
  ];
  const raw = generator.tokenizer.apply_chat_template(chat, { tokenize: false, add_generation_prompt: true }) as string;
  const tokens = generator.tokenizer.encode(raw);
  if (tokens.length > 800) {
    const trimmed = tokens.slice(0, 800);
    return generator.tokenizer.decode(trimmed) + '<|assistant|>';
  }
  return raw.split('<|assistant|>')[0] + '<|assistant|>';
}


/* ---------- business logic ---------- */
async function agentChat(message: string, threadId = 'anon') {
  /* ---------- 1.  async helpers (HOISTED) ---------- */
  async function wantsSupport(msg: string, hist: any[]) {
    const wants = /password|invoice|bill|charge|refund|login|401|403|sync|connector|outage|maintenance|down|broken|not working|error|can't|unable/i;
    if (!wants.test(msg)) return null;

    const prompt = buildPrompt(
      `Answer with ONE short paragraph using only the SUPPORT_ARTICLES above. If no match, say: “I’ve logged your issue. A human will pick it up within 30 min. Ticket-ID will appear in this chat.” Do not add anything else.\nUser: ${msg}`,
      [...hist, { role: 'system', content: SUPPORT_ARTICLES }]
    );
    const raw = await generate(prompt, { max_new_tokens: 120, temperature: 0.2 });
    const content = raw.split('assistant').pop()?.trim() ?? '';
    await saveMessage(threadId, 'user', msg);
    await saveMessage(threadId, 'assistant', content);
    return { role: 'assistant' as const, content, requiresContact: false };
  }

  async function wantsMetrics(msg: string, hist: any[]) {
    const wants = /status|metrics|tickets|queue|response|uptime/i;
    if (!wants.test(msg)) return null;

    const data = {
      open: 3, pending: 2, resolved: 12, escalated: 1,
      avgResponse: 210, satisfaction: 98, liveQueue: 3,
    };
    const content = `📊 Current support snapshot – Open: ${data.open} | Pending: ${data.pending} | Resolved today: ${data.resolved} | Avg response: ${data.avgResponse} ms | Satisfaction: ${data.satisfaction} % | Live queue: ${data.liveQueue}`;
    await saveMessage(threadId, 'user', msg);
    await saveMessage(threadId, 'assistant', content);
    return { role: 'assistant' as const, content, requiresContact: false };
  }
  /* ---------- 2.  main flow ---------- */
  const history = await getThread(threadId);

  /* existing intents … */
  const wantsList = /what.*sell|what.*offer|list.*service|our solutions/i;
  if (wantsList.test(message)) { /* … */ }

  const offTopic = /(yoga|public speaking|crypto|tiktok|bitcoin|nft|onlyfans)/i;
  if (offTopic.test(message)) { /* … */ }

  const wantsDemo = /demo|meeting|consultation|call|slot/i;
  if (wantsDemo.test(message) && !history.some(m => m.role === 'assistant' && m.content.includes('book'))) { /* … */ }

  /* new support intents (helpers now in scope) */
  const supportReply = await wantsSupport(message, history);
  if (supportReply) return supportReply;

  const metricsReply = await wantsMetrics(message, history);
  if (metricsReply) return metricsReply;

  /* fallback to general LLM */
  const prompt  = buildPrompt(message, history);
  const raw     = await generate(prompt);
  const content = raw.split('assistant').pop()?.trim() ?? '';
  const requiresContact = history.filter(h => h.role === 'assistant').length >= 4;

  await saveMessage(threadId, 'user',  message);
  await saveMessage(threadId, 'assistant', content);
  return { role: 'assistant' as const, content, requiresContact };
}


async function gatherRequirements(service: string, threadId = 'anon') {
  const prompt = buildPrompt(
    `User wants "${service}". Ask ONE concise question to clarify requirements. Reply JSON only: {"question":"...","complete":boolean}`,
    [] // empty history → still gets KNOWLEDGE via system role
  );
  const raw = await generate(prompt, { max_new_tokens: 200 });
  const text = raw.split('assistant').pop()?.trim() ?? '';
  try { return JSON.parse(text); } catch { return { question: 'Could you tell me more about your goals?', complete: false }; }
}

async function bookSlot(
  date: string,
  time: string,
  email: string,
  threadId = 'anon',
  name = 'Valued Client'   // <-- new
) {
  const event = {
    summary: 'MutSyncHub Consultation',
    description: `Thread: ${threadId}`,
    start: { dateTime: `${date}T${time}:00`, timeZone: 'Africa/Nairobi' },
    end: { dateTime: `${date}T${String(Number(time.split(':')[0]) + 1).padStart(2, '0')}:00:00`, timeZone: 'Africa/Nairobi' },
  };
  await calendar.events.insert({ calendarId: 'primary', requestBody: event });
  return { ok: true };
}




async function explainStat(statName: string, value: number) {
  const prompt = buildPrompt(`Explain this metric in one short sentence for a non-technical user: "${statName}" = ${value}.`, []);
  const raw = await generate(prompt, { max_new_tokens: 60 });
  return raw.split('assistant').pop()?.trim() ?? '';
}

async function analyticsQuery(question: string, threadId = 'anon') {
  const data = { activeUsers: 142, revenue: 133700, labels: ['Mon', 'Tue', 'Wed'], values: [40, 55, 45] };
  const visual = (() => {
    if (/trend|over time/i.test(question)) return { type: 'line', data };
    if (/distribution|share/i.test(question)) return { type: 'pie', data };
    return { type: 'bar', data };
  })();
  const answer = await agentChat(`Answer this business question using the data: ${JSON.stringify(data)}. Question: ${question}`, threadId);
  return { answer, visual };
}

/* ---------- API router ---------- */
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    const text = await req.text();          // read raw body
    body = text ? JSON.parse(text) : {};    // safe parse
  } catch (e) {
    console.error('Bad JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, payload } = body;
  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  }

  try {
    switch (action) {
      case 'chat': {
        const { message, threadId } = payload;
        const res = await agentChat(message, threadId);
        return NextResponse.json(res, { status: 200 });
      }
      case 'requirements': {
        const { service, threadId } = payload;
        const res = await gatherRequirements(service, threadId);
        return NextResponse.json(res, { status:  200 });
      }
      case 'book': {
        const { date, time, email, threadId, name } = payload;
        await bookSlot(date, time, email, threadId, name); // name added
        return NextResponse.json({ ok: true }, { status: 201 });
      };
      case 'explain': {
        const { statName, value } = payload;
        const text = await explainStat(statName, value);
        return NextResponse.json({ explanation: text }, { status: 200 });
      }
      case 'analytics': {
        const { question, threadId } = payload;
        const res = await analyticsQuery(question, threadId);
        return NextResponse.json(res, { status: 200 });
      }
      case 'hot-services':
        return NextResponse.json({ list: HOT_SERVICES }, { status: 200 });
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}