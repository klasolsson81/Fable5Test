import { CHAT_KB, KB_FALLBACK } from '../data/chatKb';
import type { Lang } from '../core/store';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}#.+\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Word-boundary keyword matching: exact token, prefix for stems
 * ("projekt" matches "projekten") and padded includes for phrases.
 * Substrings inside other words never match ("12345" must not hit "45").
 */
function makeMatcher(message: string): (keyword: string) => boolean {
  const norm = normalize(message);
  const padded = ' ' + norm + ' ';
  const tokens = norm.split(' ');
  return (keyword) => {
    const kw = normalize(keyword);
    if (!kw) return false;
    if (kw.includes(' ')) return padded.includes(' ' + kw + ' ');
    return tokens.some((tok) => tok === kw || (kw.length >= 4 && tok.startsWith(kw)));
  };
}

/**
 * Keyword-scored retrieval over the local knowledge base.
 * Active-language keywords score 2, other-language keywords score 1
 * (visitors mix languages more often than you'd think).
 */
export function answerOffline(message: string, lang: Lang): string {
  const matches = makeMatcher(message);
  const other: Lang = lang === 'sv' ? 'en' : 'sv';

  let best: { score: number; answer: string } | null = null;

  for (const entry of CHAT_KB) {
    let score = 0;
    for (const kw of entry.keywords[lang]) {
      if (matches(kw)) score += 2;
    }
    for (const kw of entry.keywords[other]) {
      if (matches(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer[lang] };
    }
  }

  return best ? best.answer : KB_FALLBACK[lang];
}
