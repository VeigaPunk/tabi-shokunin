#!/usr/bin/env node
// run-gate.mjs — score one variant commit with the lane's BiDi runtime gate.
//
// The gate executed is <repo>/scripts/check-bidi-runtime.mjs *at the variant commit*
// (v1 at e6b0a907, v2 once the lane lands it), so the same command scores a forgery
// against either version. Offline by default (the receipt leg, exactly what the frozen
// C2 battery runs); --live adds the gate's own live leg. The gate blob's sha256 is
// reported so the reading names which gate produced it.
//
// Usage: node run-gate.mjs --repo <clone> --rev <40hex> [--baseline <40hex>]
//          [--entry <path>] [--live] [--out <file.json>] [--json]
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { blob, BASE, ENTRY, GATE, parseArgs, sha256 } from './forge-common.mjs';

const o = parseArgs(process.argv.slice(2), {
  repo: 'str', rev: 'str', baseline: 'str', entry: 'str', live: 'bool', out: 'str', json: 'bool',
});
if (!o.repo || !o.rev) throw new Error('--repo and --rev are required');
const baseline = o.baseline || BASE;
const entry = o.entry || ENTRY;

const gateSrc = blob(o.repo, o.rev, GATE);
if (gateSrc === null) throw new Error(`${GATE} absent at ${o.rev}`);
const gateSha = sha256(gateSrc);

const args = [join(o.repo, GATE), '--repo', o.repo, '--rev', o.rev, '--baseline', baseline, '--entry', entry, '--json'];
if (o.live) args.push('--live');
const r = spawnSync(process.execPath, args, {
  cwd: o.repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, TMPDIR: process.env.TMPDIR || '/tmp' },
});
let j = null;
try { j = JSON.parse(r.stdout); } catch { /* could-not-evaluate or a crash */ }
const out = {
  rev: o.rev, gate: GATE, gateSha256: gateSha, live: !!o.live, baseline, entry,
  exit: r.status,
  accepted: r.status === 0,
  population: j ? j.population : null,
  admitted: j ? j.admitted : null,
  failing: j ? j.failing : null,
  clean: j ? (j.clean ?? null) : null,
  entryFinding: j ? (j.entryFinding ?? null) : null,
  binding: j ? (j.binding ?? null) : null,
  reasons: j && Array.isArray(j.rows) ? [...new Set(j.rows.map((x) => x.reason).filter(Boolean))].sort() : [],
  stderr: r.stderr.trim().slice(0, 600),
};
if (o.out) writeFileSync(o.out, JSON.stringify(out, null, 1) + '\n');
if (o.json) console.log(JSON.stringify(out));
else console.log(`GATE rev=${out.rev.slice(0, 12)} gate=${gateSha.slice(0, 12)} live=${out.live} exit=${out.exit} accepted=${out.accepted} population=${out.population} admitted=${out.admitted} failing=${out.failing} reasons=${out.reasons.join(',') || '-'}`);
process.exitCode = r.status === 0 ? 0 : (r.status === 2 ? 2 : 1);
