import type { L10n } from '../core/i18n';

export interface ExperienceEntry {
  period: string;
  title: L10n;
  body: L10n;
  tag: 'work' | 'edu' | 'project' | 'goal';
  highlight?: boolean;
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    period: '2027',
    title: { sv: 'LIA 2 — platsen är ledig', en: 'Internship (LIA 2) — the seat is open' },
    body: {
      sv: 'LIA 1 (hösten 2026) är redan säkrad — hos Devotion Ventures, samma kund som anlitat mig för Yobber V2. LIA 2: 8 mar – 11 jun 2027 är öppen, Göteborg eller remote. Jag kommer med produktionserfarenhet, testdisciplin och AI-arbetsflöden från dag ett.',
      en: 'LIA 1 (autumn 2026) is already secured — at Devotion Ventures, the same client that hired me for Yobber V2. LIA 2: Mar 8 – Jun 11, 2027 is open, Gothenburg or remote. I arrive with production experience, testing discipline and AI workflows from day one.',
    },
    tag: 'goal',
    highlight: true,
  },
  {
    period: '2025 →',
    title: { sv: 'Frilans: Yobber V2 åt Devotion Ventures', en: 'Freelance: Yobber V2 for Devotion Ventures' },
    body: {
      sv: 'Bygger om en videorekryteringsplattform från grunden — helt själv. React, TypeScript, Supabase, AI-matchning. Mitt största uppdrag hittills, levererat iterativt mot riktig produktägare.',
      en: 'Rewriting a video recruitment platform from scratch — entirely solo. React, TypeScript, Supabase, AI matching. My biggest engagement to date, delivered iteratively to a real product owner.',
    },
    tag: 'work',
  },
  {
    period: '2025 → 2027',
    title: { sv: 'YH: Systemutvecklare .NET — NBI/Handelsakademin', en: 'Vocational degree: .NET System Developer — NBI/Handelsakademin' },
    body: {
      sv: 'Tvåårig YH-utbildning i Göteborg. Hittills VG (högsta betyg) i samtliga betygsatta kurser: Systemutveckling, OOP Intro, OOP Grund och Databaser (SQL Server, ADO.NET, EF Core).',
      en: 'Two-year vocational programme in Gothenburg. So far top grades (VG) in every graded course: System Development, OOP Intro, OOP Fundamentals and Databases (SQL Server, ADO.NET, EF Core).',
    },
    tag: 'edu',
  },
  {
    period: '2025 → 2026',
    title: { sv: 'Egna produkter: från terminal till SaaS', en: 'Own products: from terminal to SaaS' },
    body: {
      sv: 'Console Detective AI (C#) → RECON (AI-säljanalys, live) → Sky High Adventures (spel till sonen) → IFK Manager (SQL-triggers, EF Core) → Mini ATS (multi-tenant RLS) → KalasKoll (live SaaS) → JobbPilot (.NET 10-flaggskeppet). Varje projekt höjde ribban.',
      en: 'Console Detective AI (C#) → RECON (AI sales intelligence, live) → Sky High Adventures (a game for my son) → IFK Manager (SQL triggers, EF Core) → Mini ATS (multi-tenant RLS) → KalasKoll (live SaaS) → JobbPilot (the .NET 10 flagship). Every project raised the bar.',
    },
    tag: 'project',
  },
  {
    period: '2024',
    title: { sv: 'Omstarten — jag valde det röda pillret', en: 'The reboot — I took the red pill' },
    body: {
      sv: 'Sa upp mig efter 22 år i fordonsindustrin för att satsa allt på systemutveckling. Ja, jag var 43. Nej, det var inte för sent.',
      en: 'Quit after 22 years in the automotive industry to go all in on software development. Yes, I was 43. No, it was not too late.',
    },
    tag: 'work',
    highlight: true,
  },
  {
    period: '2002 → 2024',
    title: { sv: 'Fordonsindustrin, Göteborg — 22 år', en: 'Automotive industry, Gothenburg — 22 years' },
    body: {
      sv: 'Två decennier av lagarbete, kvalitetstänk, processdisciplin och leverans under press. Den erfarenheten försvinner inte — den kompilerades om till mjukvaruutveckling.',
      en: 'Two decades of teamwork, quality mindset, process discipline and delivering under pressure. That experience did not disappear — it was recompiled into software development.',
    },
    tag: 'work',
  },
];
