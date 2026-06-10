import { sv } from '../i18n/sv';
import { en } from '../i18n/en';
import type { Dict } from '../i18n/sv';
import { useStore } from './store';
import type { Lang } from './store';

export const DICTS: Record<Lang, Dict> = { sv, en };

/** Hook: returns the active dictionary (re-renders on language switch). */
export function useT(): Dict {
  const lang = useStore((s) => s.lang);
  return DICTS[lang];
}

/** Non-hook accessor for use outside React (three.js scene, audio engine …). */
export function getT(): Dict {
  return DICTS[useStore.getState().lang];
}

/** Bilingual value helper for data files: { sv, en } → active language. */
export interface L10n {
  sv: string;
  en: string;
}

export function useL(): (v: L10n) => string {
  const lang = useStore((s) => s.lang);
  return (v) => v[lang];
}
