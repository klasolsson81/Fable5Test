import type { L10n } from '../core/i18n';

export interface Skill {
  label: L10n;
  level: 1 | 2 | 3 | 4 | 5;
  group: 'core' | 'lang';
}

export const SKILLS: Skill[] = [
  { label: { sv: 'C# / .NET', en: 'C# / .NET' }, level: 5, group: 'core' },
  { label: { sv: 'AI-integration & agentflöden', en: 'AI integration & agent workflows' }, level: 5, group: 'core' },
  { label: { sv: 'TypeScript / JavaScript', en: 'TypeScript / JavaScript' }, level: 4, group: 'core' },
  { label: { sv: 'React / Next.js', en: 'React / Next.js' }, level: 4, group: 'core' },
  { label: { sv: 'SQL / PostgreSQL / Supabase', en: 'SQL / PostgreSQL / Supabase' }, level: 4, group: 'core' },
  { label: { sv: 'Testning (xUnit · Vitest · Playwright)', en: 'Testing (xUnit · Vitest · Playwright)' }, level: 4, group: 'core' },
  { label: { sv: 'Three.js / kreativ webb', en: 'Three.js / creative web' }, level: 4, group: 'core' },
  { label: { sv: 'Clean Architecture / DDD', en: 'Clean Architecture / DDD' }, level: 4, group: 'core' },
  { label: { sv: 'Docker / CI/CD', en: 'Docker / CI/CD' }, level: 3, group: 'core' },
  { label: { sv: 'Cloud (Vercel · Azure · AWS)', en: 'Cloud (Vercel · Azure · AWS)' }, level: 3, group: 'core' },
  { label: { sv: 'Svenska', en: 'Swedish' }, level: 5, group: 'lang' },
  { label: { sv: 'Engelska', en: 'English' }, level: 5, group: 'lang' },
];

export const TOOLS: string[] = [
  'Git / GitHub',
  'Visual Studio / VS Code',
  'Claude Code',
  'OpenAI API',
  'Anthropic API',
  'Replicate',
  'Supabase',
  'Vercel',
  'Docker',
  'n8n',
  'Spectre.Console',
  'EF Core',
  'Resend / 46elks',
  'Playwright',
];
