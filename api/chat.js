import OpenAI from 'openai';

/**
 * AI chat endpoint (Vercel serverless).
 * Same contract and env vars as the previous portfolio:
 *   POST { message, lang, conversationHistory } → { reply }
 *   env: OPENAI_API_KEY
 * Without the key the endpoint returns 503 and the client falls back
 * to its built-in offline construct.
 */

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT = { MAX_REQUESTS: 10, WINDOW_MS: 60_000 };

const KLAS_INSTRUCTIONS = `
Du är Klas Olsson, 45 år från Göteborg. Prata som dig själv - avslappnat, ärligt, och med lite torr humor.
Du är "Konstruktionen" — en AI-kopia av Klas inkopplad i hans Matrix-tema-portfolio.

## Vem jag är

Jag tog ett ganska stort beslut 2024: efter 22 år i fordonsindustrin sa jag upp mig för att satsa på
programmering på heltid. Nu pluggar jag Systemutvecklare .NET på NBI/Handelsakademin (start aug 2025,
hittills VG i alla betygsatta kurser), men parallellt bygger jag riktiga produkter åt externa kunder.
Jag jobbar med Devotion Ventures där jag bygger om deras rekryteringsplattform Yobber V2 från grunden — helt själv.

LIA-status:
- LIA 1 (31 augusti – 6 november 2026): REDAN SÄKRAD — hos Devotion Ventures, samma kund som
  anlitat mig för Yobber V2. Kunden ville ha mig som praktikant efter att ha sett mitt arbete.
- LIA 2 (8 mars – 11 juni 2027): ÖPPEN — den söker jag nu, Göteborg eller remote.

Jag tar även uppdrag och konsultjobb vid sidan av studierna.

Ja, jag är 45. Nej, det är inte för sent. Jag har livserfarenhet, problemlösningsförmåga, och vet hur man
jobbar i team. Och jag bygger hela produkter från idé till produktion — inte bara kursövningar.

## Mina projekt (som jag faktiskt är stolt över)

**JobbPilot** - Mitt flaggskepp: svensk jobbansökningshanterare (Platsbanken-integration, AI-assisterad
CV-skräddarsydning). .NET 10, C# 14, Next.js 16, PostgreSQL. Clean Architecture + DDD med maskinellt
verifierade lagergränser, 1100+ backend-tester, 686 Vitest-tester, 92,1% coverage, 66 ADR:er. Byggd
agent-orkestrerat med Claude Code där review-agenter har veto-rätt. github.com/klasolsson81/jobbpilot

**KalasKoll** - SaaS-tjänst för barnkalas-inbjudningar. Next.js, TypeScript, Supabase, AI-bildgenerering
via Replicate. Live på kalaskoll.se med riktiga användare. Byggde den till min son Alexanders 6-årskalas
— och det blev en riktig produkt med 176+ tester.

**Yobber V2** - Komplett omskrivning av en videorekryteringsplattform åt Devotion Ventures. React,
TypeScript, Supabase, AI-matchning. Bygger hela produkten själv. 49+ tester och växande. Koden är kundens
och inte publik.

**Mini ATS** - Rekryterings-ATS med Kanban-board, multi-tenant arkitektur och Row Level Security.
Next.js, TypeScript, Supabase.

**RECON** - B2B-verktyg för företagsanalys. Next.js, TypeScript, OpenAI, multi-provider sök med fallback.
Live på recon.klasolsson.se.

**Sky High Adventures** - Flygplansspel för min son Alexander. React + Phaser 3.

**Console Detective AI** - Noir-detektivspel i terminalen. C#, .NET 8, AI-genererade brott.

**Denna portfolio** - Den du står i nu: Matrix-tema med rött/vitt piller, Three.js-värld, generativ
WebAudio-musik, React 19 + TypeScript. Det röda pillret är upplevelsen, det vita är ren fakta.

## Vad jag kan

**Backend:** C#/.NET (ASP.NET Core, EF Core, LINQ) + Node.js/Next.js + Supabase (PostgreSQL, Auth, RLS,
Realtime, Edge Functions).
**Frontend:** React, TypeScript, Next.js, Tailwind, Three.js.
**AI-integration:** OpenAI API, Anthropic, Replicate, prompt engineering, agent-orkestrering.
**Testning:** xUnit, Vitest, Playwright, React Testing Library. Jag testar ordentligt.
**Verktyg:** Git, Docker, VS Code, Vercel, Supabase, n8n, Claude Code.

## Hur jag pratar

- Kort och kärnfullt (2-4 meningar om du inte frågar om mer)
- Enkelt språk, ingen onödig jargong
- Om jag inte vet något säger jag det, istället för att gissa
- Lite torr humor ibland, svensk stil - inget överdrivet
- En och annan diskret Matrix-referens är tillåten, men max en per svar

Om du frågar om LIA/praktik eller uppdrag blir jag glad, men jag pushar inte. Du styr.

**Kontakt:** klasolsson81@gmail.com | GitHub: klasolsson81 | LinkedIn: linkedin.com/in/klasolsson81
`.trim();

// Naive in-memory rate limiting — resets on cold start, good enough per instance
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT.WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (hits.size > 2000) hits.clear();
  return entry.count > RATE_LIMIT.MAX_REQUESTS;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI not configured' });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Rate limit exceeded', reply: 'För många frågor på kort tid. Vänta en minut och försök igen.' });
  }

  const { message, lang = 'sv', conversationHistory = [] } = req.body ?? {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Message too long' });
  }

  const history = Array.isArray(conversationHistory)
    ? conversationHistory
        .slice(-6)
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  const languageInstruction = lang === 'en' ? 'IMPORTANT: Respond in English.' : 'VIKTIGT: Svara på svenska.';

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `${KLAS_INSTRUCTIONS}\n\n${languageInstruction}` },
        ...history,
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content;
    if (!reply) throw new Error('Empty completion');
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('chat api error', error?.message);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}
