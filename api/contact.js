import nodemailer from 'nodemailer';

/**
 * Contact form endpoint (Vercel serverless).
 * env: GMAIL_USER, GMAIL_PASS (app-specific password) — same as the previous portfolio.
 * Without them the endpoint returns 503 and the client falls back to mailto.
 */

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > 600_000) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (hits.size > 2000) hits.clear();
  return entry.count > 5;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || 'unknown';
}

const clean = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return res.status(503).json({ error: 'Mail not configured' });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const name = clean(req.body?.name, 100);
  const email = clean(req.body?.email, 200);
  const message = String(req.body?.message ?? '').trim().slice(0, 3000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Portfolio: The Construct" <${process.env.GMAIL_USER}>`,
      to: 'klasolsson81@gmail.com',
      replyTo: `"${name}" <${email}>`,
      subject: `▸ Transmission från ${name} (portfolio)`,
      text: `Namn: ${name}\nE-post: ${email}\n\n${message}`,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('contact api error', error?.message);
    return res.status(500).json({ error: 'Send failed' });
  }
}
