#!/usr/bin/env node
// probe-safewrite.mjs — extracts safeWrite() VERBATIM from the frozen C1 v4 counter and runs
// the four symlink cases against throwaway dirs. Read-only wrt the lane; writes only under
// the caller's TMPDIR.  Usage: TMPDIR=... node probe-safewrite.mjs
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync, openSync, closeSync, fstatSync, writeSync, lstatSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const COUNTER = new URL('../../../counters/c1-adjacency-sweep-v4.mjs', import.meta.url).pathname;
const src = (await import('node:fs')).readFileSync(COUNTER, 'utf8');
const lo = src.indexOf('function safeWrite(');
const hi = src.indexOf('function runAdjGate(');
if (lo < 0 || hi < 0) throw new Error('safeWrite not found in the frozen counter');
class Refusal extends Error {}
const safeWrite = new Function('openSync', 'closeSync', 'fstatSync', 'writeSync', 'lstatSync', 'join', 'dirname', 'Refusal',
  `${src.slice(lo, hi)}\nreturn safeWrite;`)(openSync, closeSync, fstatSync, writeSync, lstatSync, join, dirname, Refusal);

const base = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'swprobe-'));
const attempt = (label, dir) => {
  try { const t = safeWrite(dir, 'gate.mjs', Buffer.from('x')); console.log(`${label}: WROTE ${t}`); }
  catch (e) { console.log(`${label}: REFUSED ${e.message}`); }
};
mkdirSync(join(base, 'real', 'd'), { recursive: true });
symlinkSync(join(base, 'real'), join(base, 'link'));
attempt('symlinked ancestor component', join(base, 'link', 'd'));
mkdirSync(join(base, 'd2'));
symlinkSync('/etc/passwd', join(base, 'd2', 'gate.mjs'));
attempt('symlinked target file', join(base, 'd2'));
mkdirSync(join(base, 'd3'));
attempt('plain dir (control)', join(base, 'd3'));
symlinkSync(join(base, 'real'), join(base, 'tmplink'));
attempt('dir created by mkdtemp under a symlinked TMPDIR', mkdtempSync(join(base, 'tmplink', 'k-')));
rmSync(base, { recursive: true, force: true });
