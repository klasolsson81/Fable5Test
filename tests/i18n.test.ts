import { describe, expect, it } from 'vitest';
import { sv } from '../src/i18n/sv';
import { en } from '../src/i18n/en';

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe('i18n dictionaries', () => {
  it('sv and en expose exactly the same key tree', () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(sv).sort());
  });

  it('no value is an empty string', () => {
    const flatten = (obj: unknown): string[] => {
      if (typeof obj === 'string') return [obj];
      if (Array.isArray(obj)) return obj.flatMap(flatten);
      if (typeof obj === 'object' && obj !== null) return Object.values(obj).flatMap(flatten);
      return [];
    };
    for (const dict of [sv, en]) {
      for (const value of flatten(dict)) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
