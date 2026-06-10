import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shaders from '../src/three/shaders';

/**
 * Compiles every GLSL shader with glslangValidator, wrapped in the same
 * ESSL3 prefix three.js applies for WebGL2 (#version 300 es + compat
 * defines + built-in uniforms/attributes). A typo here would otherwise
 * only surface as a black scene in a real browser.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BIN_DIR = join(ROOT, 'node_modules', 'glslang-validator-prebuilt-predownloaded', 'bin');
const BIN = {
  linux: join(BIN_DIR, 'glslangValidator.linux'),
  darwin: join(BIN_DIR, 'glslangValidator.darwin'),
  win32: join(BIN_DIR, 'glslangValidator.exe'),
}[process.platform as 'linux' | 'darwin' | 'win32'];

const VERT_PREFIX = `#version 300 es
#define attribute in
#define varying out
#define texture2D texture
precision highp float;
precision highp int;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`;

const FRAG_PREFIX = `#version 300 es
#define varying in
#define texture2D texture
#define gl_FragColor pc_fragColor
precision highp float;
precision highp int;
layout(location = 0) out highp vec4 pc_fragColor;
`;

const tmp = mkdtempSync(join(tmpdir(), 'glsl-'));

function compile(name: string, stage: 'vert' | 'frag', source: string): void {
  const file = join(tmp, `${name}.${stage}`);
  writeFileSync(file, (stage === 'vert' ? VERT_PREFIX : FRAG_PREFIX) + source);
  try {
    execFileSync(BIN!, [file], { encoding: 'utf8' });
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    throw new Error(`${name}.${stage} failed to compile:\n${e.stdout ?? ''}${e.stderr ?? ''}`);
  }
}

const CASES: [string, 'vert' | 'frag', string][] = [
  ['rain', 'vert', shaders.RAIN_VERT],
  ['rain', 'frag', shaders.RAIN_FRAG],
  ['floor', 'vert', shaders.FLOOR_VERT],
  ['floor', 'frag', shaders.FLOOR_FRAG],
  ['holo', 'vert', shaders.HOLO_VERT],
  ['holo', 'frag', shaders.HOLO_FRAG],
  ['holo-wire', 'frag', shaders.HOLO_WIRE_FRAG],
  ['cone', 'vert', shaders.CONE_VERT],
  ['cone', 'frag', shaders.CONE_FRAG],
  ['panel', 'vert', shaders.PANEL_VERT],
  ['panel', 'frag', shaders.PANEL_FRAG],
  ['particle', 'vert', shaders.PARTICLE_VERT],
  ['particle', 'frag', shaders.PARTICLE_FRAG],
];

describe('GLSL shaders compile under three.js WebGL2 semantics', () => {
  it('validator binary exists for this platform', () => {
    expect(BIN && existsSync(BIN), `no glslangValidator for ${process.platform}`).toBe(true);
    if (process.platform !== 'win32') chmodSync(BIN!, 0o755);
  });

  for (const [name, stage, source] of CASES) {
    it(`${name}.${stage}`, () => {
      expect(() => compile(name, stage, source)).not.toThrow();
    });
  }
});
