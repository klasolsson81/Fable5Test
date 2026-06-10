import type { L10n } from '../core/i18n';

/**
 * Offline knowledge base for the construct chat.
 * Used when /api/chat is unavailable (local dev, static hosting, API errors).
 */
export interface KbEntry {
  id: string;
  keywords: { sv: string[]; en: string[] };
  answer: L10n;
}

export const CHAT_KB: KbEntry[] = [
  {
    id: 'who',
    keywords: {
      sv: ['vem', 'klas', 'dig själv', 'presentera', 'om dig', 'vem är'],
      en: ['who', 'klas', 'yourself', 'introduce', 'about you', 'who is'],
    },
    answer: {
      sv: 'Klas Olsson, 45, Göteborg. Efter 22 år i fordonsindustrin sa han upp sig 2024 för att satsa allt på kod. Nu pluggar han Systemutvecklare .NET på NBI/Handelsakademin — och bygger samtidigt riktiga produkter åt externa kunder. Gift familjefar med torr humor och hög leveransdisciplin.',
      en: 'Klas Olsson, 45, Gothenburg. After 22 years in the automotive industry he quit in 2024 to go all in on code. He now studies .NET system development at NBI/Handelsakademin — while shipping real products for external clients. Married father with dry humor and a serious delivery discipline.',
    },
  },
  {
    id: 'jobbpilot',
    keywords: {
      sv: ['jobbpilot', 'flaggskepp', 'platsbanken', 'adr'],
      en: ['jobbpilot', 'flagship', 'platsbanken', 'adr'],
    },
    answer: {
      sv: 'JobbPilot är flaggskeppet: en svensk jobbansökningshanterare i .NET 10 / C# 14 + Next.js 16 + PostgreSQL. Clean Architecture + DDD med maskinellt verifierade lagergränser, 1 100+ backend-tester, 686 Vitest-tester, 92,1 % coverage och 66 ADR:er. Byggd agent-orkestrerat med Claude Code där review-agenter har veto-rätt. Repo: github.com/klasolsson81/jobbpilot',
      en: 'JobbPilot is the flagship: a Swedish job application manager in .NET 10 / C# 14 + Next.js 16 + PostgreSQL. Clean Architecture + DDD with machine-verified layer boundaries, 1,100+ backend tests, 686 Vitest tests, 92.1% coverage and 66 ADRs. Built agent-orchestrated with Claude Code where review agents hold veto power. Repo: github.com/klasolsson81/jobbpilot',
    },
  },
  {
    id: 'kalaskoll',
    keywords: {
      sv: ['kalaskoll', 'kalas', 'barnkalas', 'inbjudning'],
      en: ['kalaskoll', 'party', 'invitation', 'kids'],
    },
    answer: {
      sv: 'KalasKoll är en live SaaS (kalaskoll.se) för barnkalas: AI-genererade inbjudningar (Replicate Flux/DALL·E 3), realtids-gästlista via Supabase och GDPR artikel 9-säkrad allergihantering med AES-256-GCM och autoradering. Next.js 16, TypeScript, 133 enhetstester + 41 E2E. Byggd för sonen Alexanders 6-årskalas — blev en riktig produkt.',
      en: 'KalasKoll is a live SaaS (kalaskoll.se) for kids’ parties: AI-generated invitations (Replicate Flux/DALL·E 3), realtime guest list via Supabase and GDPR Article 9-grade allergy handling with AES-256-GCM and auto-deletion. Next.js 16, TypeScript, 133 unit tests + 41 E2E. Built for his son Alexander’s 6th birthday — became a real product.',
    },
  },
  {
    id: 'yobber',
    keywords: {
      sv: ['yobber', 'devotion', 'uppdrag', 'kund', 'frilans', 'konsult'],
      en: ['yobber', 'devotion', 'client', 'freelance', 'consult', 'engagement'],
    },
    answer: {
      sv: 'Yobber V2 är Klas största uppdrag: en komplett omskrivning av Devotion Ventures videorekryteringsplattform. Han bygger hela produkten själv — frontend, backend, auth och AI-matchning — i React/TypeScript/Supabase, med 49+ tester och växande. Koden är kundens, därför inte publik.',
      en: 'Yobber V2 is Klas’s biggest engagement: a complete rewrite of Devotion Ventures’ video recruitment platform. He builds the entire product solo — frontend, backend, auth and AI matching — in React/TypeScript/Supabase, with 49+ tests and growing. The code belongs to the client, hence not public.',
    },
  },
  {
    id: 'projects',
    keywords: {
      sv: ['projekt', 'byggt', 'portfolio', 'visa', 'produkter', 'recon', 'mini ats', 'detective', 'sky high'],
      en: ['project', 'built', 'portfolio', 'show', 'products', 'recon', 'mini ats', 'detective', 'sky high'],
    },
    answer: {
      sv: 'Urvalet: JobbPilot (.NET 10-flaggskepp), KalasKoll (live SaaS), Yobber V2 (kunduppdrag), Mini ATS (multi-tenant RLS), RECON (AI-säljanalys, live), Console Detective AI (C#-noir i terminalen), Sky High Adventures (spel till sonen) — och den här Matrix-portfolion. Öppna PROJEKT-noden för djupdykningar med screenshots.',
      en: 'The lineup: JobbPilot (.NET 10 flagship), KalasKoll (live SaaS), Yobber V2 (client work), Mini ATS (multi-tenant RLS), RECON (AI sales intelligence, live), Console Detective AI (C# noir in the terminal), Sky High Adventures (a game for his son) — and this Matrix portfolio. Open the PROJECTS node for deep dives with screenshots.',
    },
  },
  {
    id: 'stack',
    keywords: {
      sv: ['stack', 'teknik', 'språk', 'verktyg', 'kompetens', 'kan du', 'c#', '.net', 'react', 'typescript', 'supabase'],
      en: ['stack', 'tech', 'tools', 'skills', 'know', 'c#', '.net', 'react', 'typescript', 'supabase'],
    },
    answer: {
      sv: 'Kärnan: C#/.NET (ASP.NET Core, EF Core, LINQ) + TypeScript/React/Next.js + Supabase/PostgreSQL (RLS, Realtime). AI-integration är differentieraren: OpenAI, Anthropic, Replicate, agent-orkestrering. Testning med xUnit, Vitest och Playwright. Dessutom Three.js, Docker, Vercel och n8n.',
      en: 'The core: C#/.NET (ASP.NET Core, EF Core, LINQ) + TypeScript/React/Next.js + Supabase/PostgreSQL (RLS, Realtime). AI integration is the differentiator: OpenAI, Anthropic, Replicate, agent orchestration. Testing with xUnit, Vitest and Playwright. Plus Three.js, Docker, Vercel and n8n.',
    },
  },
  {
    id: 'lia',
    keywords: {
      sv: ['lia', 'praktik', 'anlita', 'anställ', 'rekryter', 'tillgänglig', 'ledig', 'jobb', 'söker'],
      en: ['lia', 'internship', 'hire', 'recruit', 'available', 'job', 'seeking', 'open'],
    },
    answer: {
      sv: 'LIA 1 (hösten 2026) är redan säkrad — hos Devotion Ventures, samma kund som anlitat honom för Yobber V2. Men LIA 2 är öppen: 8 mar–11 jun 2027, Göteborg eller remote. Han tar även konsultuppdrag vid sidan av studierna. Maila klasolsson81@gmail.com så svarar han inom 24h.',
      en: 'LIA 1 (autumn 2026) is already secured — at Devotion Ventures, the same client that hired him for Yobber V2. But LIA 2 is open: Mar 8–Jun 11 2027, Gothenburg or remote. He also takes consulting work alongside his studies. Email klasolsson81@gmail.com and he will reply within 24h.',
    },
  },
  {
    id: 'background',
    keywords: {
      sv: ['fordon', 'bakgrund', 'erfarenhet', 'tidigare', 'karriär', '22 år', 'resa', 'historia', 'ålder', 'gammal', '45'],
      en: ['automotive', 'background', 'experience', 'previous', 'career', '22 years', 'journey', 'story', 'age', 'old', '45'],
    },
    answer: {
      sv: '22 år i fordonsindustrin i Göteborg: lagarbete, kvalitet, processdisciplin, leverans under press. 2024 valde han om — vid 43. Är 45 för gammalt? Tvärtom: livserfarenhet + ny teknisk spets är en ovanlig kombination. Sedan dess: VG i alla kurser och sju levererade produkter.',
      en: '22 years in the automotive industry in Gothenburg: teamwork, quality, process discipline, delivery under pressure. In 2024 he chose again — at 43. Is 45 too old? The opposite: life experience plus fresh technical depth is a rare combination. Since then: top grades in every course and seven shipped products.',
    },
  },
  {
    id: 'contact',
    keywords: {
      sv: ['kontakt', 'mail', 'mejl', 'nå', 'linkedin', 'github', 'cv', 'telefon'],
      en: ['contact', 'mail', 'email', 'reach', 'linkedin', 'github', 'cv', 'resume', 'phone'],
    },
    answer: {
      sv: 'Mail: klasolsson81@gmail.com (svar inom 24h) · GitHub: github.com/klasolsson81 · LinkedIn: linkedin.com/in/klasolsson81 · CV: ladda ner via CV-noden eller /cv/CV_Klas_Olsson.pdf. Kontaktformuläret i KONTAKT-noden går direkt till hans inkorg.',
      en: 'Email: klasolsson81@gmail.com (reply within 24h) · GitHub: github.com/klasolsson81 · LinkedIn: linkedin.com/in/klasolsson81 · CV: download via the RESUME node or /cv/CV_Klas_Olsson.pdf. The contact form in the CONTACT node goes straight to his inbox.',
    },
  },
  {
    id: 'ai',
    keywords: {
      sv: ['ai', 'claude', 'openai', 'agent', 'llm', 'prompt', 'gpt'],
      en: ['ai', 'claude', 'openai', 'agent', 'llm', 'prompt', 'gpt'],
    },
    answer: {
      sv: 'AI är Klas differentierare — men som disciplin, inte hajp. I JobbPilot kör han en governance-modell med 13 specialiserade agenter där review-agenter har blockerande veto. Han har byggt chatbots, AI-bildgenerering (Replicate/DALL·E), AI-matchning i rekryteringsflöden och agentiska verktygskedjor. AI som hävstång, med människan som arkitekt.',
      en: 'AI is Klas’s differentiator — as a discipline, not hype. In JobbPilot he runs a governance model with 13 specialized agents where review agents hold blocking vetoes. He has built chatbots, AI image generation (Replicate/DALL·E), AI matching in recruitment flows and agentic toolchains. AI as leverage, with the human as architect.',
    },
  },
  {
    id: 'education',
    keywords: {
      sv: ['utbildning', 'skola', 'nbi', 'handelsakademin', 'studerar', 'kurs', 'betyg', 'yh'],
      en: ['education', 'school', 'nbi', 'study', 'course', 'grade', 'vocational'],
    },
    answer: {
      sv: 'Tvåårig YH-utbildning: Systemutvecklare .NET på NBI/Handelsakademin i Göteborg (start aug 2025, examen 2027). Hittills VG — högsta betyg — i samtliga betygsatta kurser: Systemutveckling, OOP Intro, OOP Grund och Databaser.',
      en: 'Two-year vocational programme: .NET System Developer at NBI/Handelsakademin in Gothenburg (started Aug 2025, graduating 2027). Top grades (VG) so far in every graded course: System Development, OOP Intro, OOP Fundamentals and Databases.',
    },
  },
  {
    id: 'matrix',
    keywords: {
      sv: ['matrix', 'piller', 'kanin', 'neo', 'morpheus', 'sked', 'verklighet'],
      en: ['matrix', 'pill', 'rabbit', 'neo', 'morpheus', 'spoon', 'reality'],
    },
    answer: {
      sv: 'Det finns ingen sked. Men det finns två piller: det röda ger dig 3D, ljud och kaninhål — det vita ger dig ren fakta. Klas valde det röda 2024. Frågan är vad du väljer. (Psst: prova Konami-koden.)',
      en: 'There is no spoon. But there are two pills: red gives you 3D, sound and rabbit holes — white gives you pure facts. Klas took the red one in 2024. The question is what you choose. (Psst: try the Konami code.)',
    },
  },
  {
    id: 'greeting',
    keywords: {
      sv: ['hej', 'hallå', 'tjena', 'hejsan', 'god dag', 'läget'],
      en: ['hello', 'hi', 'hey', 'greetings', 'yo', 'sup'],
    },
    answer: {
      sv: 'Hej! Konstruktionen är online. Fråga om projekten, stacken, LIA-perioderna eller resan från fordonsindustrin — jag svarar som Klas (fast i offline-läge just nu, så håll dig till ämnet).',
      en: 'Hi! The construct is online. Ask about the projects, the stack, the internship periods or the journey from automotive — I answer as Klas (though in offline mode right now, so stay on topic).',
    },
  },
];

export const KB_FALLBACK: L10n = {
  sv: 'Den frågan ligger utanför mitt offline-minne. Prova att fråga om projekt, tech-stack, LIA, bakgrund eller kontakt — eller maila Klas direkt: klasolsson81@gmail.com',
  en: 'That question is outside my offline memory. Try asking about projects, tech stack, internships, background or contact — or email Klas directly: klasolsson81@gmail.com',
};
