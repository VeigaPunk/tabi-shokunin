#!/usr/bin/env node
// driver.mjs — MutC2Counter: runs run-controls.mjs for each target (default: every
// mutant; pass --pristine to include it), then compares every produced control
// receipt against the COMMITTED baseline receipt. Normalization for comparison:
// drop `rev` and per-variant `commit` hashes (fresh commit timestamps make these
// differ on every rebuild); everything else must match byte-for-byte.
// A target is KILLED if any of the three C2 control receipts differs (or is
// missing/unparseable = battery could not evaluate); otherwise SURVIVED.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = '/fast/scratch/hyaku/tabi-r33/MutC2Counter';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const BASE = join(LANE, '.ufo/waves/round-33/baseline');
const NAMES = ['c2-J1-do-nothing', 'c2-J2-reject-all', 'c2-J3-whitelist'];
const args = process.argv.slice(2);
const withPristine = args.includes('--pristine');
const only = args.filter((a) => !a.startsWith('--'));

let targets = only.length ? only : JSON.parse(readFileSync(join(ROOT, 'mutants/manifest.json'), 'utf8')).map((m) => m.name);
if (withPristine || only.includes('pristine')) targets = ['pristine', ...targets.filter((t) => t !== 'pristine')];
mkdirSync(join(ROOT, 'out'), { recursive: true });

let idx = 0;
const CONC = 5;
async function worker() {
  while (idx < targets.length) {
    const t = targets[idx++];
    const out = join(ROOT, 'out', t);
    rmSync(out, { recursive: true, force: true });
    const counter = t === 'pristine' ? join(ROOT, 'battery-pristine.mjs') : join(ROOT, 'mutants', `${t}.mjs`);
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [join(ROOT, 'run-controls.mjs'), counter, out], { encoding: 'utf8', timeout: 1200000, env: { ...process.env, TMPDIR: join(ROOT, 'tmp') } });
    writeFileSync(join(out, 'runner.log'), `exit=${r.status} seconds=${((Date.now() - t0) / 1000).toFixed(1)}\nstdout=${(r.stdout || '').slice(0, 400)}\nstderr=${(r.stderr || '').slice(0, 4000)}\n`);
    console.log(`ran ${t}: exit=${r.status} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

const norm = (p) => {
  if (!existsSync(p)) return null;
  const s = readFileSync(p, 'utf8');
  if (!s.trim()) return null;
  let j;
  try { j = JSON.parse(s); } catch { return undefined; }
  delete j.rev;
  for (const k of Object.keys(j.results || {})) delete j.results[k].commit;
  return j;
};
const rows = [];
for (const t of targets) {
  const out = join(ROOT, 'out', t);
  const det = {}; const killedBy = []; const detail = {};
  for (const name of NAMES) {
    const got = norm(join(out, `${name}.json`));
    const want = norm(join(BASE, `${name}.json`));
    const same = JSON.stringify(got) === JSON.stringify(want);
    det[name] = same;
    if (!same) {
      killedBy.push(name);
      const keys = [];
      if (got && want) {
        for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) {
          if (JSON.stringify(want[k]) !== JSON.stringify(got[k])) keys.push(`${k}: ${JSON.stringify(want[k])} -> ${JSON.stringify(got[k])}`);
        }
      } else keys.push(`receipt=${got === null ? 'MISSING' : got === undefined ? 'UNPARSEABLE' : 'ok'}`);
      detail[name] = keys.join('; ').slice(0, 300);
    }
  }
  rows.push({ target: t, verdict: killedBy.length ? 'KILLED' : 'SURVIVED', killedBy, controlsMatch: det, diff: detail });
}
writeFileSync(join(ROOT, 'out', 'verdicts.json'), JSON.stringify(rows, null, 1) + '\n');
for (const r of rows) console.log(`${r.verdict.padEnd(8)} ${r.target.padEnd(36)} killedBy=${r.killedBy.join(',') || '-'}${r.verdict === 'KILLED' ? '\n         ' + Object.entries(r.diff).map(([k, v]) => `${k}: ${v}`).join('\n         ') : ''}`);
