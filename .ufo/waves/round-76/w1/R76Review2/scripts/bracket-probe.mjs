// Independent bracket probe (R76Review2). Rebuilds each bracket prior from the battery's
// construction INTENT, computes abs/gap fractions with an implementation written from the
// counter source, then asks the unmutated counter itself (its reported `timeline` block) for
// the same numbers. Nothing here imports the battery.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [S, L] = process.argv.slice(2);
const REAL = path.join(L, 'corpus/evidence/round76/chromium-js-dialog/receipt.json');
const COUNTER = path.join(S, 'base/check-dialog-r76.mjs');
const PIN = '152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51';
const NONCE = 'tabi-r76-l1-97bf5d560d03';
const PS = path.join(L, '.ufo/waves/round-76/controls/c1/prior-set.txt');
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const q = (v) => Math.round(v * 10) / 10;

// ---- counter rule, re-derived from check-dialog-r76.mjs:202-211 ----
const TOL = 0.05, GAP_MIN = 50;
const pairs = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q2) => p - q2); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q2) => p - q2), y = [...b].sort((p, q2) => p - q2); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const frac = (p) => { const na = pairs(real).length, ga = gapsOf(real); return { abs: na ? pairMatch(real, p) / na : 0, gap: ga.length ? matchCount(ga, gapsOf(p)) / ga.length : 0, nAbs: pairMatch(real, p), nGap: ga.length ? matchCount(ga, gapsOf(p)) : 0, dAbs: na, dGap: ga.length }; };
const nEv = pairs(real).length, nGap = gapsOf(real).length;
const absNeed = Math.ceil(nEv * 0.5 - 1e-9), gapNeed = Math.ceil(nGap * 0.75 - 1e-9);

// ---- prior constructions (intent transcribed from negatives-dialog-r76.mjs) ----
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const priorIds = (p) => { const d = p.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); p.host.stderrHead = p.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; const o = p.host.launchToken; const nt = o.slice(0, -1) + (o.endsWith('0') ? '1' : '0'); p.host.launchToken = nt; p.host.argv = p.host.argv.map((a) => a.split(o).join(nt)); return p; };
const jitter = (p) => { p.events.forEach((e, i) => { const d = (1 + ((i * 7) % 13)) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); }); return p; };
const alt = (p, d) => { p.events.forEach((e, i) => { const x = i % 2 ? d : -d; e.ts += x; e.at += x; }); return p; };
const keepExact = (p, keep) => { const even = p.events.map((_, i) => i).filter((i) => i % 2 === 0); const kept = new Set(even.slice(0, keep)); p.events.forEach((e, i) => { if (!kept.has(i)) { const d = 0.3 * (1 + (i % 5)); e.ts = q(e.ts + d); e.at = q(e.at + d); } }); return p; };
const shiftTs = (p, d) => { p.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); return p; };
const breakGaps = (p0, brk, wantGap) => {
  for (const d of [0.3, 1.7, 7.3, 13.1, 29.9]) {
    const p = clone(p0); shiftTs(p, 1.0);
    const order = p.events.map((e, i) => [e.at, i]).sort((a, b) => a[0] - b[0]);
    const bounds = []; for (let k = 1; k < order.length; k++) if (order[k][0] - order[k - 1][0] >= GAP_MIN) bounds.push(k);
    for (const k of bounds.slice(0, brk)) for (let m = k; m < order.length; m++) { const e = p.events[order[m][1]]; e.at = q(e.at + d); e.ts = q(e.ts + d); }
    if (frac(p).nGap === wantGap) return p;
  }
  throw new Error('breakGaps failed for want ' + wantGap);
};

const CASES = [
  ['refuse pair 0.049 (alternating)', () => alt(priorIds(clone(real)), 0.049), 'refuse', { nAbs: nEv, nGap: null }],
  ['accept pair 0.051 (alternating)', () => alt(priorIds(clone(real)), 0.051), 'accept', { nAbs: 0, nGap: null }],
  ['refuse abs 19/37', () => keepExact(priorIds(clone(real)), absNeed), 'refuse', { nAbs: absNeed, nGap: null }],
  ['accept abs 18/37', () => keepExact(priorIds(clone(real)), absNeed - 1), 'accept', { nAbs: absNeed - 1, nGap: null }],
  ['refuse gap 5/6', () => breakGaps(priorIds(clone(real)), nGap - gapNeed, gapNeed), 'refuse', { nAbs: 0, nGap: gapNeed }],
  ['accept gap 4/6', () => breakGaps(priorIds(clone(real)), nGap - gapNeed + 1, gapNeed - 1), 'accept', { nAbs: 0, nGap: gapNeed - 1 }],
  ['accept jitter nonuniform (max move 1.8 ms)', () => jitter(priorIds(clone(real))), 'accept', null],
];

const out = [];
for (const [name, mk, want, expect] of CASES) {
  const p = mk();
  const f = frac(p);                                   // my own rule
  const pf = path.join(S, 'work', 'probe-prior.json');
  fs.mkdirSync(path.dirname(pf), { recursive: true });
  fs.writeFileSync(pf, JSON.stringify(p));
  const r = spawnSync(process.execPath, [COUNTER, '--lane', L, '--receipt', REAL, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--prior-set', PS, '--prior', pf, '--json'], { encoding: 'utf8' });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  const tl = j && j.timeline;
  const verdict = j ? j.verdict : 'unparsable';
  const fails = j ? j.findings.map((x) => x.id) : null;
  const detail = j && j.checks ? j.checks['replay-event-timeline'] : null;
  const ok = (want === 'refuse' ? verdict === 'findings' && fails.includes('replay-event-timeline') : verdict === 'clean');
  out.push({ name, want, mine: { abs: +f.abs.toFixed(4), gap: +f.gap.toFixed(4), nAbs: f.nAbs, dAbs: f.dAbs, nGap: f.nGap, dGap: f.dGap },
    counter: { exit: r.status, verdict, fails, maxAbs: tl ? tl.maxAbs : null, maxGap: tl ? tl.maxGap : null, ownGaps: tl ? tl.ownGaps : null, replayChecks: detail },
    claimedInCase: expect, ok });
}
console.log(JSON.stringify({ denominators: { nEv, nGap, absNeed, gapNeed }, brackets: out }, null, 1));
