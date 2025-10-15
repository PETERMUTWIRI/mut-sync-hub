import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend'; // or nodemailer
import { prisma } from '@/lib/prisma';
import { jsonToPDF } from '@/lib/buildReportPDF';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { orgId, plan } = await req.json();
  const org = await prisma.organization.findUnique({ where: { id: orgId }, include: { users: true } });
  const user = org?.users[0];
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 });

  // generate welcome PDF
  const pdf = await jsonToPDF([{ name: 'Unlimited', value: 9999 }], 'Welcome to Newton Analytics');

  await resend.emails.send({
    from: 'Newton <newton@mutsynhub.com>',
    to: user.email,
    subject: '🔓  Unlocked – Newton Analytics',
    attachments: [{ filename: 'Newton-Analytics.pdf', content: pdf.toString('base64') }],
    html: `
      <h2>Welcome to Newton Analytics!</h2>
      <p>Your ${plan} plan is now active.</p>
      <ul>
        <li>Unlimited exports</li>
        <li>Unlimited scheduled reports</li>
        <li>AI insights</li>
      </ul>
      <p>Upload your next CSV – Newton is waiting.</p>
      <a href="https://mutsynhub.com/analytics?industry=supermarket" style="background:#10b981;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Open Dashboard</a>
    `,
  });

  return NextResponse.json({ sent: true });
}