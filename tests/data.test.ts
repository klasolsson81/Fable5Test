import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS } from '../src/data/projects';
import { SKILLS } from '../src/data/skills';
import { EXPERIENCE } from '../src/data/experience';
import { PROFILE } from '../src/data/profile';
import { CHAT_KB } from '../src/data/chatKb';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

describe('data integrity', () => {
  it('every project is complete', () => {
    for (const p of PROJECTS) {
      expect(p.id).toBeTruthy();
      expect(p.slides.length).toBeGreaterThan(0);
      expect(p.stack.length).toBeGreaterThan(0);
      for (const s of p.slides) {
        expect(s.title.sv && s.title.en).toBeTruthy();
        expect(s.body.sv && s.body.en).toBeTruthy();
      }
    }
  });

  it('project ids are unique', () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all referenced slide images exist in public/', () => {
    for (const p of PROJECTS) {
      for (const s of p.slides) {
        if (s.image) expect(existsSync(join(PUBLIC, s.image)), `${p.id}: ${s.image}`).toBe(true);
      }
    }
  });

  it('profile assets exist (photo, AI avatar, CV pdf, hologram bake)', () => {
    for (const file of [
      PROFILE.photo,
      PROFILE.aiAvatar,
      PROFILE.cvPath,
      PROFILE.hologramCutout,
      PROFILE.hologramDepth,
    ]) {
      expect(existsSync(join(PUBLIC, file)), file).toBe(true);
    }
  });

  it('at least five featured projects for the red carousel', () => {
    expect(PROJECTS.filter((p) => p.featured).length).toBeGreaterThanOrEqual(5);
  });

  it('skill levels stay on the 1–5 scale', () => {
    for (const s of SKILLS) {
      expect(s.level).toBeGreaterThanOrEqual(1);
      expect(s.level).toBeLessThanOrEqual(5);
    }
  });

  it('experience entries are bilingual', () => {
    for (const e of EXPERIENCE) {
      expect(e.title.sv && e.title.en).toBeTruthy();
      expect(e.body.sv && e.body.en).toBeTruthy();
    }
  });

  it('chat KB entries have keywords and answers in both languages', () => {
    for (const entry of CHAT_KB) {
      expect(entry.keywords.sv.length).toBeGreaterThan(0);
      expect(entry.keywords.en.length).toBeGreaterThan(0);
      expect(entry.answer.sv && entry.answer.en).toBeTruthy();
    }
  });
});
