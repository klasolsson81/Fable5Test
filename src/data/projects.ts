import type { L10n } from '../core/i18n';

export interface Slide {
  title: L10n;
  body: L10n;
  image?: string;
}

export interface Project {
  id: string;
  /** Short code shown on holo-cards, e.g. "JP-01". */
  code: string;
  name: string;
  year: string;
  tagline: L10n;
  status: L10n;
  role: L10n;
  stack: string[];
  links: { live?: string; repo?: string };
  /** Featured projects get a slot in the red-pill carousel front row. */
  featured: boolean;
  /** Client work without public code/screenshots. */
  confidential?: boolean;
  accent: string;
  slides: Slide[];
}

export const PROJECTS: Project[] = [
  {
    id: 'jobbpilot',
    code: 'JP-01',
    name: 'JobbPilot',
    year: '2026 →',
    tagline: {
      sv: 'Svensk jobbansökningshanterare — civic utility med agent-orkestrerad ingenjörsdisciplin',
      en: 'Swedish job application manager — civic utility built with agent-orchestrated engineering discipline',
    },
    status: { sv: 'Pågående · Fas 0–3 levererade', en: 'In progress · Phases 0–3 shipped' },
    role: { sv: 'Soloutvecklare & agent-orkestrerare', en: 'Solo developer & agent orchestrator' },
    stack: ['.NET 10', 'C# 14', 'Next.js 16', 'TypeScript', 'PostgreSQL', 'Clean Architecture', 'DDD'],
    links: { repo: 'https://github.com/klasolsson81/jobbpilot' },
    featured: true,
    accent: '#46ff8e',
    slides: [
      {
        title: { sv: 'Flaggskeppet', en: 'The flagship' },
        body: {
          sv: 'JobbPilot är en komplett jobbsök- och ansökningshanterare för svenska arbetsmarknaden: Platsbanken-integration, AI-assisterad CV/brev-skräddarsydning och en end-to-end pipeline-tracker. Positionerad som civic utility — ett verktyg som ska kännas som svensk offentlig digital service, inte som ännu en AI-hajp.',
          en: 'JobbPilot is a complete job search and application manager for the Swedish job market: Platsbanken integration, AI-assisted CV/cover-letter tailoring and an end-to-end pipeline tracker. Positioned as a civic utility — built to feel like Swedish public digital service, not yet another AI hype product.',
        },
      },
      {
        title: { sv: 'Maskinellt verifierad arkitektur', en: 'Machine-verified architecture' },
        body: {
          sv: 'Clean Architecture + DDD med arkitekturtester som verifierar lager-gränserna maskinellt. 1 100+ gröna backend-tester, 686 Vitest-tester och 92,1 % first-party line coverage. Varje arkitekturbeslut historieförs som en immutable ADR — 66 beslut hittills.',
          en: 'Clean Architecture + DDD with architecture tests that machine-verify the layer boundaries. 1,100+ green backend tests, 686 Vitest tests and 92.1% first-party line coverage. Every architectural decision is recorded as an immutable ADR — 66 decisions so far.',
        },
      },
      {
        title: { sv: 'Agent-orkestrerad utveckling', en: 'Agent-orchestrated development' },
        body: {
          sv: 'Byggd med Claude Code som primär utvecklingspartner i en governance-modell: 13 specialiserade agenter där code-reviewer, security-auditor och design-reviewer har blockerande veto före commit, och en CTO-agent agerar decision-maker vid arkitektur-tradeoffs. Disciplin, inte autocomplete.',
          en: 'Built with Claude Code as the primary development partner in a governance model: 13 specialized agents where code-reviewer, security-auditor and design-reviewer hold blocking veto power before commit, and a CTO agent acts as decision-maker on architecture tradeoffs. Discipline, not autocomplete.',
        },
      },
      {
        title: { sv: 'GDPR & EU-dataresidens', en: 'GDPR & EU data residency' },
        body: {
          sv: 'AI-lagret är medvetet GDPR-gated bakom fem icke-förhandlingsbara villkor (ADR 0051). EU-dataresidens, Bring-Your-Own-Key för AI och en tydlig gräns mellan persondata och modellanrop. Säkerhet är ett krav i arkitekturen, inte ett patch i efterhand.',
          en: 'The AI layer is deliberately GDPR-gated behind five non-negotiable conditions (ADR 0051). EU data residency, Bring-Your-Own-Key for AI and a hard boundary between personal data and model calls. Security is an architectural requirement, not an afterthought patch.',
        },
      },
    ],
  },
  {
    id: 'kalaskoll',
    code: 'KK-02',
    name: 'KalasKoll',
    year: '2026',
    tagline: {
      sv: 'SaaS för barnkalas — AI-inbjudningar, realtids-OSA och GDPR-säkrad allergihantering',
      en: 'SaaS for kids’ parties — AI invitations, realtime RSVP and GDPR-grade allergy handling',
    },
    status: { sv: 'LIVE på kalaskoll.se · riktiga användare', en: 'LIVE at kalaskoll.se · real users' },
    role: { sv: 'Grundare & soloutvecklare', en: 'Founder & solo developer' },
    stack: ['Next.js 16', 'TypeScript', 'Supabase', 'Tailwind 4', 'Three.js', 'Replicate Flux', 'DALL·E 3'],
    links: { live: 'https://kalaskoll.se', repo: 'https://github.com/klasolsson81/kalaskoll' },
    featured: true,
    accent: '#ff7ad9',
    slides: [
      {
        title: { sv: 'Född ur verkligt kaos', en: 'Born from real chaos' },
        body: {
          sv: 'Min son Alexander fyllde 6 och vi skulle bjuda 20 förskolebarn. SMS, lappar och anteckningar blev kaos — så jag byggde en hel webapp. Mitt största och mest personliga projekt: idag live med riktiga användare.',
          en: 'My son Alexander turned 6 and we were inviting 20 preschool kids. Texts, paper notes and reminders turned into chaos — so I built an entire web app. My biggest and most personal project: live today with real users.',
        },
        image: '/img/projects/kalaskoll/01.webp',
      },
      {
        title: { sv: 'AI-genererade inbjudningar', en: 'AI-generated invitations' },
        body: {
          sv: 'Föräldern väljer mellan 9 illustrerade mallar eller en AI-genererad inbjudan via Replicate Flux / DALL·E 3. Delning via e-post, länk eller utskrift med QR-kod — och allt samlas i en dashboard med realtidsuppdaterad gästlista.',
          en: 'Parents pick from 9 illustrated templates or an AI-generated invitation via Replicate Flux / DALL·E 3. Share by email, link or print with QR code — all collected in a dashboard with a realtime guest list.',
        },
        image: '/img/projects/kalaskoll/02.webp',
      },
      {
        title: { sv: 'Gäster utan konto', en: 'Guests without accounts' },
        body: {
          sv: 'Gästerna klickar på länken och svarar direkt — inget konto. Redigering sker via kryptografisk edit-token. OSA-sidan är mobile-first med stora touch-ytor, eftersom 99 % svarar via mobilen.',
          en: 'Guests click the link and respond instantly — no account needed. Edits use a cryptographic edit token. The RSVP page is mobile-first with large touch targets, since 99% reply on their phones.',
        },
        image: '/img/projects/kalaskoll/05.webp',
      },
      {
        title: { sv: 'Realtid via Supabase', en: 'Realtime via Supabase' },
        body: {
          sv: 'Gästlistan uppdateras live via Supabase Realtime. Föräldern ser direkt vilka som tackat ja, kontaktuppgifter och allergier — krypterade med AES-256-GCM och skyddade av Row-Level Security.',
          en: 'The guest list updates live through Supabase Realtime. Parents instantly see who accepted, contact details and allergies — encrypted with AES-256-GCM and protected by Row-Level Security.',
        },
        image: '/img/projects/kalaskoll/04.webp',
      },
      {
        title: { sv: 'GDPR artikel 9 på riktigt', en: 'GDPR Article 9, for real' },
        body: {
          sv: 'Allergidata är hälsodata enligt GDPR artikel 9: uttryckligt samtycke, separat lagring, kryptering — och automatisk radering 7 dagar efter kalaset. Rate limiting via Upstash Redis. 133 enhetstester + 41 E2E-tester (Playwright) håller det stabilt.',
          en: 'Allergy data is health data under GDPR Article 9: explicit consent, separate storage, encryption — and automatic deletion 7 days after the party. Rate limiting via Upstash Redis. 133 unit tests + 41 E2E tests (Playwright) keep it stable.',
        },
        image: '/img/projects/kalaskoll/03.webp',
      },
    ],
  },
  {
    id: 'yobber',
    code: 'YB-03',
    name: 'Yobber V2',
    year: '2025 →',
    tagline: {
      sv: 'Videorekryteringsplattform — komplett omskrivning åt Devotion Ventures, byggd solo',
      en: 'Video recruitment platform — full rewrite for Devotion Ventures, built solo',
    },
    status: { sv: 'Kunduppdrag · pågående', en: 'Client engagement · ongoing' },
    role: { sv: 'Enda utvecklaren — frontend, backend, auth, AI', en: 'Sole developer — frontend, backend, auth, AI' },
    stack: ['React', 'TypeScript', 'Supabase', 'AI-matchning'],
    links: {},
    featured: true,
    confidential: true,
    accent: '#5ec8ff',
    slides: [
      {
        title: { sv: 'Mitt största uppdrag', en: 'My biggest engagement' },
        body: {
          sv: 'Devotion Ventures anlitade mig för att skriva om deras videorekryteringsplattform Yobber från grunden. Jag bygger hela produkten själv: frontend, backend, auth och AI-flöden — parallellt med studierna.',
          en: 'Devotion Ventures hired me to rewrite their video recruitment platform Yobber from scratch. I am building the entire product solo: frontend, backend, auth and AI flows — in parallel with my studies.',
        },
      },
      {
        title: { sv: 'AI-matchning i rekryteringsflödet', en: 'AI matching in the recruiting flow' },
        body: {
          sv: 'Kandidater och roller matchas med AI-stöd direkt i flödet. React + TypeScript + Supabase i botten, med fokus på snabba videoflöden och en UX som funkar för både kandidat och rekryterare.',
          en: 'Candidates and roles are matched with AI assistance directly in the flow. React + TypeScript + Supabase underneath, focused on fast video flows and a UX that works for both candidates and recruiters.',
        },
      },
      {
        title: { sv: 'Förtroende under NDA', en: 'Trust under NDA' },
        body: {
          sv: 'Koden är inte publik — det är kundens produkt. Men siffrorna talar: 49+ tester och växande, levererat iterativt mot riktig produktägare. Bästa kvittot? Devotion Ventures tar emot mig som LIA-praktikant hösten 2026 efter att ha sett mitt arbete.',
          en: 'The code is not public — it is the client’s product. But the numbers speak: 49+ tests and growing, delivered iteratively to a real product owner. The best receipt? Devotion Ventures is taking me on as their LIA intern in autumn 2026 after seeing my work.',
        },
      },
    ],
  },
  {
    id: 'miniats',
    code: 'MA-04',
    name: 'Mini ATS',
    year: '2026',
    tagline: {
      sv: 'Multi-tenant rekryteringssystem med Kanban-pipeline och Row-Level Security',
      en: 'Multi-tenant applicant tracking system with Kanban pipeline and Row-Level Security',
    },
    status: { sv: 'Färdigt · demo på begäran', en: 'Completed · demo on request' },
    role: { sv: 'Soloutvecklare', en: 'Solo developer' },
    stack: ['Next.js 16', 'TypeScript', 'Supabase', 'RLS', '@dnd-kit', 'Zod', 'next-intl'],
    links: { repo: 'https://github.com/klasolsson81/mini-ats' },
    featured: true,
    accent: '#b48bff',
    slides: [
      {
        title: { sv: 'Enterprise-mönster i miniformat', en: 'Enterprise patterns, mini format' },
        body: {
          sv: 'Ett komplett Applicant Tracking System för rekryteringsteam: multi-tenant arkitektur, rollseparation och modern glassmorphism-UX. Byggt för att bevisa att jag kan leverera enterprise-grade system.',
          en: 'A complete applicant tracking system for recruiting teams: multi-tenant architecture, role separation and modern glassmorphism UX. Built to prove I can ship enterprise-grade systems.',
        },
        image: '/img/projects/miniats/01.webp',
      },
      {
        title: { sv: 'Kanban med drag-and-drop', en: 'Kanban with drag-and-drop' },
        body: {
          sv: 'Hjärtat är Kanban-boarden: kandidater dras genom 7 rekryteringssteg med @dnd-kit. Optimistiska uppdateringar ger omedelbar feedback medan synkronisering sker i bakgrunden.',
          en: 'The heart is the Kanban board: candidates are dragged through 7 recruiting stages with @dnd-kit. Optimistic updates give instant feedback while syncing happens in the background.',
        },
        image: '/img/projects/miniats/04.webp',
      },
      {
        title: { sv: 'Row-Level Security på riktigt', en: 'Row-Level Security for real' },
        body: {
          sv: 'Komplett dataisolering mellan tenants via Postgres RLS-policies med hjälpfunktioner som current_tenant_id() och is_admin(). Varje query filtreras i databasen — inte i applikationskoden.',
          en: 'Complete data isolation between tenants via Postgres RLS policies with helpers like current_tenant_id() and is_admin(). Every query is filtered in the database — not in application code.',
        },
        image: '/img/projects/miniats/03.webp',
      },
      {
        title: { sv: 'Admin, impersonation & audit', en: 'Admin, impersonation & audit' },
        body: {
          sv: 'Admin-portal med tenant-hantering och impersonation för support — varje sådan händelse loggas med IP, user agent och tidsstämpel. Audit trails för compliance, inte bara för syns skull.',
          en: 'Admin portal with tenant management and impersonation for support — every such event is logged with IP, user agent and timestamp. Audit trails for compliance, not for show.',
        },
        image: '/img/projects/miniats/02.webp',
      },
      {
        title: { sv: 'Server Actions & i18n', en: 'Server Actions & i18n' },
        body: {
          sv: 'Next.js 16 App Router med Server Actions för alla mutationer, Zod för validering och next-intl för svenska/engelska. Loggvyn ger full spårbarhet över systemet.',
          en: 'Next.js 16 App Router with Server Actions for all mutations, Zod for validation and next-intl for Swedish/English. The log view gives full traceability across the system.',
        },
        image: '/img/projects/miniats/05.webp',
      },
    ],
  },
  {
    id: 'recon',
    code: 'RC-05',
    name: 'RECON',
    year: '2025',
    tagline: {
      sv: 'AI-driven B2B-säljintelligens — företagsanalys i realtid med multi-provider-sök',
      en: 'AI-driven B2B sales intelligence — realtime company analysis with multi-provider search',
    },
    status: { sv: 'LIVE på recon.klasolsson.se', en: 'LIVE at recon.klasolsson.se' },
    role: { sv: 'Utvecklare · workshop med InFiNetCode AB', en: 'Developer · workshop with InFiNetCode AB' },
    stack: ['Next.js', 'TypeScript', 'OpenAI', 'Tavily', 'Zod', 'LRU-cache'],
    links: { live: 'https://recon.klasolsson.se' },
    featured: true,
    accent: '#ffb84d',
    slides: [
      {
        title: { sv: 'Säljinsikter i realtid', en: 'Sales insights in realtime' },
        body: {
          sv: 'RECON aggregerar data från webbplatser, sociala medier, nyheter och finansiella rapporter — och genererar actionable säljinsikter: ice breakers, pain points, sales hooks och finansiella signaler. Byggt under en 2-dagars workshop med InFiNetCode AB.',
          en: 'RECON aggregates data from websites, social media, news and financial reports — generating actionable sales insights: ice breakers, pain points, sales hooks and financial signals. Built during a 2-day workshop with InFiNetCode AB.',
        },
        image: '/img/projects/recon/01.webp',
      },
      {
        title: { sv: 'Multi-provider med fallback', en: 'Multi-provider with fallback' },
        body: {
          sv: 'En search orchestrator med automatisk fallback över fyra providers (Tavily, Serper, Brave, SerpAPI). Når en provider sin kvot växlar systemet sömlöst — 5 750+ gratis sökningar per månad och 100 % uptime.',
          en: 'A search orchestrator with automatic fallback across four providers (Tavily, Serper, Brave, SerpAPI). When one provider hits its quota the system switches seamlessly — 5,750+ free searches per month and 100% uptime.',
        },
      },
      {
        title: { sv: '70 % snabbare', en: '70% faster' },
        body: {
          sv: 'LRU-cache med TTL, eliminerade health checks och optimerade prompts tog ner söktiden från 15–25 s till 5–8 s — 70 % snabbare med 50 % mindre API-användning. Efteråt: strukturerad code review över 5 sessioner, 15/15 identifierade issues åtgärdade.',
          en: 'LRU cache with TTL, eliminated health checks and optimized prompts cut search time from 15–25s to 5–8s — 70% faster with 50% less API usage. Afterwards: a structured code review across 5 sessions, 15/15 identified issues fixed.',
        },
      },
    ],
  },
  {
    id: 'detective',
    code: 'CD-06',
    name: 'Console Detective AI',
    year: '2025',
    tagline: {
      sv: 'Noir-detektivspel i terminalen — AI-genererade mordgåtor, ingen omgång är den andra lik',
      en: 'Noir detective game in the terminal — AI-generated murder mysteries, no two runs alike',
    },
    status: { sv: 'Färdigt · mitt första större C#-projekt', en: 'Completed · my first major C# project' },
    role: { sv: 'Soloutvecklare', en: 'Solo developer' },
    stack: ['C#', '.NET 8', 'Spectre.Console', 'OpenAI', 'LINQ'],
    links: { repo: 'https://github.com/klasolsson81/Console_Detective' },
    featured: true,
    accent: '#ff5e5e',
    slides: [
      {
        title: { sv: 'AI som spelmotor', en: 'AI as game engine' },
        body: {
          sv: 'Ett textbaserat noir-detektivspel där OpenAI genererar brottsfall, dialoger och ledtrådar dynamiskt i realtid. En strikt CaseContext skickas som dold system-prompt: AI:n vet vem mördaren är — men avslöjar det aldrig för tidigt.',
          en: 'A text-based noir detective game where OpenAI generates cases, dialogue and clues dynamically in realtime. A strict CaseContext travels as a hidden system prompt: the AI knows who the murderer is — but never reveals it too early.',
        },
        image: '/img/projects/detective/02.webp',
      },
      {
        title: { sv: 'Lärdomen: arkitektur först', en: 'The lesson: architecture first' },
        body: {
          sv: 'Jag skrev spellogiken för vanlig konsol först och försökte tvinga in Spectre.Console-UI:t efteråt — och fick skriva om stora delar. Idag hade jag isolerat UI-lagret från start. Dyrt misstag, billig lärdom.',
          en: 'I wrote the game logic for a plain console first and tried to force the Spectre.Console UI in afterwards — and had to rewrite large parts. Today I would isolate the UI layer from day one. Expensive mistake, cheap lesson.',
        },
        image: '/img/projects/detective/01.webp',
      },
      {
        title: { sv: 'C#-grunderna på djupet', en: 'C# fundamentals in depth' },
        body: {
          sv: 'Projektet gav mig djup förståelse för LINQ (ledtrådshantering), objektorientering (spelets värld) och prompt-disciplin. Mitt första större C#-projekt — och det som gjorde mig fast i .NET.',
          en: 'The project gave me deep understanding of LINQ (clue handling), object orientation (the game world) and prompt discipline. My first major C# project — the one that hooked me on .NET.',
        },
        image: '/img/projects/detective/03.webp',
      },
    ],
  },
  {
    id: 'skyhigh',
    code: 'SH-07',
    name: 'Sky High Adventures',
    year: '2025',
    tagline: {
      sv: 'Webbaserat flygplansspel byggt för min son Alexander — familjen är piloterna',
      en: 'Web-based airplane game built for my son Alexander — the family are the pilots',
    },
    status: { sv: 'LIVE · hjärteprojekt', en: 'LIVE · passion project' },
    role: { sv: 'Pappa & utvecklare', en: 'Dad & developer' },
    stack: ['React', 'Phaser 3', 'TypeScript'],
    links: { live: 'https://skyadventuregame.klasolsson.se', repo: 'https://github.com/klasolsson81/sky-adventure-game' },
    featured: false,
    accent: '#6fd7ff',
    slides: [
      {
        title: { sv: 'Spelglädje som krav-spec', en: 'Joy as the spec' },
        body: {
          sv: 'Ett flygplansspel där familjen är piloter, byggt för min då 5-årige son. Phaser 3 för spelmotorn, React runt omkring. Kravställaren är tuffast i branschen: en femåring märker direkt om spelet inte är kul.',
          en: 'An airplane game where the family are the pilots, built for my then 5-year-old son. Phaser 3 for the game engine, React around it. The toughest product owner in the business: a five-year-old instantly notices if a game is not fun.',
        },
        image: '/img/projects/skyhigh/01.webp',
      },
    ],
  },
  {
    id: 'fitness',
    code: 'FT-08',
    name: 'Fitness Progress Tracker',
    year: '2025',
    tagline: {
      sv: 'Grupprojekt: system för PT & klienter — jag tog rollen som Team Lead & Scrum Master',
      en: 'Team project: system for PTs & clients — I took the Team Lead & Scrum Master role',
    },
    status: { sv: 'Färdigt · skolprojekt i team', en: 'Completed · school team project' },
    role: { sv: 'Team Lead & Scrum Master', en: 'Team Lead & Scrum Master' },
    stack: ['C#', '.NET', 'OOP', 'GitHub Projects'],
    links: { repo: 'https://github.com/klasolsson81/FitnessProgressTracker' },
    featured: false,
    accent: '#9dff6f',
    slides: [
      {
        title: { sv: 'Ledarskap > kod', en: 'Leadership > code' },
        body: {
          sv: 'Den största utmaningen var inte koden utan kommunikationen. Jag satte upp Kanban i GitHub Projects med Discord-webhooks så att alla såg varje ny PR direkt — kortare ledtider, färre krockar.',
          en: 'The biggest challenge was not the code but the communication. I set up Kanban in GitHub Projects with Discord webhooks so everyone saw each new PR instantly — shorter lead times, fewer collisions.',
        },
        image: '/img/projects/fitness/04.webp',
      },
      {
        title: { sv: 'Roller & behörigheter', en: 'Roles & permissions' },
        body: {
          sv: 'PT:n har en egen adminvy för sina klienter, med kostscheman byggda kring kalorier och makronutrienter. Här lärde jag mig hantera användarroller och behörigheter på riktigt.',
          en: 'The PT gets a dedicated admin view for their clients, with meal plans built around calories and macronutrients. This is where I properly learned user roles and permissions.',
        },
        image: '/img/projects/fitness/02.webp',
      },
    ],
  },
  {
    id: 'matrix-portfolio',
    code: 'MX-09',
    name: 'Portfolio: The Construct',
    year: '2026',
    tagline: {
      sv: 'Sajten du står i just nu — Three.js-värld, generativt WebAudio-ljud och två verkligheter',
      en: 'The site you are standing in right now — Three.js world, generative WebAudio sound and two realities',
    },
    status: { sv: 'LIVE · du är här', en: 'LIVE · you are here' },
    role: { sv: 'Designad & byggd i Matrix-tema', en: 'Designed & built in Matrix theme' },
    stack: ['React 19', 'TypeScript', 'Three.js', 'WebAudio', 'Vite', 'Vercel'],
    links: { repo: 'https://github.com/klasolsson81/Fable5Test' },
    featured: false,
    accent: '#2eff7e',
    slides: [
      {
        title: { sv: 'Två piller, en kodbas', en: 'Two pills, one codebase' },
        body: {
          sv: 'Rött piller: 3D-konstruktion med digital rain-shaders, hologram och generativ ambient-musik syntetiserad i WebAudio (noll ljudfiler). Vitt piller: ren dossier, noll effekter, print-vänlig. Samma datakälla, två verkligheter — och 3D-koden laddas bara om du väljer den röda.',
          en: 'Red pill: a 3D construct with digital rain shaders, holograms and generative ambient music synthesized in WebAudio (zero audio files). White pill: a clean dossier, zero effects, print-friendly. One data source, two realities — and the 3D code only loads if you choose red.',
        },
      },
      {
        title: { sv: 'Prestanda som feature', en: 'Performance as a feature' },
        body: {
          sv: 'FPS-vakt som sänker upplösning och partikelantal vid behov, pixel-ratio-tak, pausad rendering i bakgrundsflikar och full respekt för prefers-reduced-motion. Wow-faktor får aldrig kosta lagg.',
          en: 'An FPS watchdog that lowers resolution and particle counts when needed, a pixel-ratio cap, paused rendering in background tabs and full respect for prefers-reduced-motion. Wow factor must never cost lag.',
        },
      },
    ],
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
