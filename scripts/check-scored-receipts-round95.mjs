#!/usr/bin/env node
// Gate: tabi round 95 (mined mistake, r94 spot-check §8 item 3 / D2). Every counter output under
// `.ufo/waves/round-<N>/scored/*.json` that names a `receiptSha256` must have a receipt with that sha256
// COMMITTED in the lane at the given revision (any blob under `corpus/evidence/` or
// `.ufo/waves/round-<N>/`). r94's tip re-run cited a receipt that lived only in scratch.
// Usage: node check-scored-receipts-round95.mjs --lane <ABS lane> --round <N> [--rev master]
// Exit 0 clean; 1 findings; 2 setup.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'); const round = Number(opt('round')); const rev = opt('rev') || 'master';
const out = (o, rc) => { console.log(JSON.stringify(o)); process.exit(rc); };
if (!lane || !path.isAbsolute(lane) || !Number.isInteger(round) || round < 1) out({ gate: 'check-scored-receipts-round95', verdict: 'setup', detail: 'usage: --lane <ABS> --round <N> [--rev R]' }, 2);
const git = (...a) => spawnSync('git', ['-C', lane, ...a], { encoding: 'buffer', maxBuffer: 1 << 30 });
const top = git('rev-parse', '--show-toplevel');
if (top.status !== 0 || top.stdout.toString().trim() !== lane) out({ gate: 'check-scored-receipts-round95', verdict: 'setup', detail: 'lane is not a git toplevel: ' + lane }, 2);
const r = git('rev-parse', '--verify', rev + '^{commit}');
if (r.status !== 0) out({ gate: 'check-scored-receipts-round95', verdict: 'setup', detail: 'bad rev ' + rev }, 2);
const commit = r.stdout.toString().trim();
const wave = `.ufo/waves/round-${round}/`;
const files = git('ls-tree', '-r', '--name-only', commit).stdout.toString().split('\n').filter(Boolean);
const scored = files.filter((f) => f.startsWith(wave + 'scored/') && f.endsWith('.json'));
const pool = files.filter((f) => f.startsWith('corpus/evidence/') || f.startsWith(wave));
const shas = new Map();
for (const f of pool) { const b = git('show', commit + ':' + f); if (b.status === 0) shas.set(crypto.createHash('sha256').update(b.stdout).digest('hex'), f); }
const findings = []; const checked = [];
for (const f of scored) {
  let j; try { j = JSON.parse(git('show', commit + ':' + f).stdout.toString()); } catch { continue; }
  if (!j || typeof j !== 'object' || typeof j.receiptSha256 !== 'string') continue;
  const hit = shas.get(j.receiptSha256) || null;
  checked.push({ file: f, receiptSha256: j.receiptSha256, committedAs: hit });
  if (!hit) findings.push({ id: 'receipt-uncommitted', file: f, detail: 'no committed blob under corpus/evidence/ or ' + wave + ' has sha256 ' + j.receiptSha256 });
}
if (!checked.length) out({ gate: 'check-scored-receipts-round95', verdict: 'setup', round, rev: commit, detail: 'no scored output with receiptSha256 under ' + wave + 'scored/' }, 2);
out({ gate: 'check-scored-receipts-round95', verdict: findings.length ? 'findings' : 'clean', round, rev: commit, checked, findings }, findings.length ? 1 : 0);
