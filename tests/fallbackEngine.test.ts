import { describe, expect, it } from 'vitest';
import { answerOffline } from '../src/chat/fallbackEngine';
import { KB_FALLBACK } from '../src/data/chatKb';

describe('offline chat construct', () => {
  it('answers project questions in Swedish', () => {
    expect(answerOffline('Berätta om JobbPilot', 'sv')).toContain('JobbPilot');
    expect(answerOffline('vad är kalaskoll?', 'sv')).toContain('kalaskoll.se');
  });

  it('answers in English when asked in English', () => {
    const reply = answerOffline('What tech stack do you use?', 'en');
    expect(reply).toMatch(/C#|\.NET/);
    expect(reply).not.toMatch(/Kärnan/);
  });

  it('handles LIA/internship questions', () => {
    expect(answerOffline('söker du LIA-plats?', 'sv')).toContain('2026');
    expect(answerOffline('are you open for an internship?', 'en')).toContain('2026');
  });

  it('gives contact details', () => {
    expect(answerOffline('hur når jag dig?', 'sv')).toContain('klasolsson81@gmail.com');
  });

  it('cross-language keywords still match', () => {
    expect(answerOffline('do you know supabase?', 'sv')).not.toBe(KB_FALLBACK.sv);
  });

  it('falls back gracefully on nonsense', () => {
    expect(answerOffline('xyzzy quux 12345 blorp', 'sv')).toBe(KB_FALLBACK.sv);
    expect(answerOffline('xyzzy quux 12345 blorp', 'en')).toBe(KB_FALLBACK.en);
  });
});
