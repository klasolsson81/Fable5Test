import type { L10n } from '../core/i18n';

export const PROFILE = {
  name: 'Klas Olsson',
  birthYear: 1981,
  city: { sv: 'Göteborg', en: 'Gothenburg' } satisfies L10n,
  role: {
    sv: 'Systemutvecklare .NET · AI-Augmented Fullstack Engineer',
    en: '.NET System Developer · AI-Augmented Fullstack Engineer',
  } satisfies L10n,
  email: 'klasolsson81@gmail.com',
  github: 'https://github.com/klasolsson81',
  linkedin: 'https://www.linkedin.com/in/klasolsson81/',
  site: 'https://klasolsson.se',
  cvPath: '/cv/CV_Klas_Olsson.pdf',
  photo: '/img/profile/klas.webp',
  aiAvatar: '/img/profile/klas-ai.webp',
  intro: {
    sv: 'Efter 22 år i fordonsindustrin valde jag det röda pillret: 2024 sa jag upp mig för att satsa allt på systemutveckling. Nu pluggar jag .NET på NBI/Handelsakademin i Göteborg — och bygger samtidigt riktiga produkter åt riktiga kunder. Hela produkter, från databas till deploy. Inte kursövningar.',
    en: 'After 22 years in the automotive industry I took the red pill: in 2024 I quit my job to go all in on software development. I now study .NET at NBI/Handelsakademin in Gothenburg — while shipping real products for real clients. Whole products, from database to deploy. Not course exercises.',
  } satisfies L10n,
  lia: {
    sv: 'Söker LIA: 31 aug–6 nov 2026 samt 8 mar–11 jun 2027 · Göteborg eller remote',
    en: 'Seeking internship (LIA): Aug 31–Nov 6 2026 and Mar 8–Jun 11 2027 · Gothenburg or remote',
  } satisfies L10n,
};

/** Age computed like the previous site: birth year 1981, counted from Jan 1. */
export function profileAge(now = new Date()): number {
  return now.getFullYear() - PROFILE.birthYear;
}
