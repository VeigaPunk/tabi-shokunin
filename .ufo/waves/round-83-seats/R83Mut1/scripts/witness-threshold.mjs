#!/usr/bin/env node
// Threshold witnesses for replay-frac-relaxed and replay-refusal-boundary-strict.
// Build a receipt from the frozen prior (identity rewritten, tokens/browser ids freshened), then
// shift FOUR whole legs (events + marks) by +100 ms: 30 of 61 events move, leaving exactly
// absMatched = 31 = ceil(0.5*61). Every other check stays valid because each shifted leg's marks
// move with its events, preserving leg windows and ordering.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r83/R83Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r83.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round83/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-83/controls/c1/prior-set.txt');
const PRIOR = path.join(LANE, '.ufo/waves/round-83/controls/c1/probes/prior1.json');
const rec = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const src = fs.readFileSync(COUNTER, 'utf8');
const grab = (f) => { const s = fs.readFileSync(f, 'utf8'); const a = s.indexOf('const MUTANTS = ['); const b = s.indexOf('\n];', a); return Function('return ' + s.slice(a + 'const MUTANTS = '.length, b + 2))(); };
const MUTANTS = new Map(grab(path.join(S, 'run-mutants.mjs')).map(([n, f, t]) => [n, { from: f, to: t }]));
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to;
  for (const l of r.legs || []) {
    for (const s of l.serverLog || []) if (s.run === old) s.run = to;
    for (const s of l.childServerLog || []) if (s.run === old) s.run = to;
    for (const c of l.cdpSendLog || []) {
      if (c.method === 'Page.navigate') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of l.cdpEventLog || []) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
};
const forged = () => {
  const c = JSON.parse(fs.readFileSync(PRIOR, 'utf8'));
  rewriteNonce(c, rec.nonce);
  c.driverSha256 = rec.driverSha256;
  c.fixture.sha256 = rec.fixture.sha256;
  for (const l of c.legs) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = (l.argv || []).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    l.devtoolsListening = { url: 'ws://127.0.0.1:' + c.ports.cdp + '/devtools/browser/' + bid, port: c.ports.cdp, browserId: bid };
    l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
  }
  return c;
};
const shift = (c) => {
  const legs = ['sp83-same-origin-nonfile-disabled', 'sp83-webkitdirectory-answer', 'sp83-accept-answer', 'sp83-multiple-mode'];
  let moved = 0;
  for (const name of legs) {
    const l = c.legs.find((x) => x.name === name);
    for (const e of l.pageEvents) { e.ts = Math.round((e.ts + 100) * 10) / 10; e.at = Math.round((e.at + 100) * 10) / 10; moved++; }
    for (const m of l.marks) m.at = Math.round((m.at + 100) * 10) / 10;
    if (typeof l.closedAt === 'number') l.closedAt = Math.round((l.closedAt + 100) * 10) / 10;
  }
  return moved;
};
const run = (counterPath, receiptPath) => {
  const r = spawnSync(process.execPath, [counterPath, '--lane', LANE, '--receipt', receiptPath,
    '--expect-driver-sha256', rec.driverSha256, '--expect-nonce', rec.nonce,
    '--expect-fixture-sha256', rec.fixture.sha256, '--prior-set', PRIOR_SET,
    '--tree-exempt-sha256', '3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c', '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, verdict: j && j.verdict, findings: j && j.findings ? j.findings.map((f) => f.id) : null, limit: j && j.limit ? { ownEvents: j.limit.ownEvents, perPrior: j.limit.perPrior } : null, stderr: (r.stderr || '').slice(0, 300) };
};
const base = forged(); const moved = shift(base);
const receiptPath = path.join(S, 'witness-receipts', 'replay-boundary-31.json');
fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, JSON.stringify(base));
const counters = {};
for (const name of ['replay-tolerance-tightened', 'replay-frac-relaxed', 'replay-refusal-boundary-strict']) {
  const m = MUTANTS.get(name); const dir = path.join(S, 'witness-counters', name);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'check-showpicker-r83.mjs');
  fs.writeFileSync(p, src.replace(m.from, m.to));
  counters[name] = p;
}
const out = { receipt: receiptPath, movedEvents: moved, matchedEvents: 61 - moved, pristine: run(COUNTER, receiptPath), mutants: {} };
for (const [name, p] of Object.entries(counters)) out.mutants[name] = run(p, receiptPath);
fs.writeFileSync(path.join(S, 'witness-results-threshold.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
