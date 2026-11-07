#!/usr/bin/env node
// R76Critic: declare-time forgeries. F2b = inside the declared limit (19 events, 2 of 6 gaps);
// F2c = 1 of 6 gaps changed (the exactness counterexample); F5 = Exec1 leg from a second prior.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = '/fast/scratch/hyaku/tabi-r76/R76Critic';
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-dialog-round76.mjs');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const TOL = 0.05, GAP_MIN = 50;
const pairs = (x) => (x.events || []).filter((e) => e && typeof e === 'object' && Number.isFinite(e.ts) && Number.isFinite(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const sim = (a, b) => { const na = pairs(a).length, ga = gapsOf(a); return { abs: na ? pairMatch(a, b) / na : 0, gap: ga.length ? matchCount(ga, gapsOf(b)) / ga.length : 0, na, ng: ga.length }; };

const priors = fs.readFileSync(path.join(LANE, '.ufo/waves/round-76/controls/c1/prior-set.txt'), 'utf8')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => JSON.parse(fs.readFileSync(path.join(LANE, l), 'utf8')));
const m = /\/\*DIALOG-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\nconst NEXT_TEMPLATE = `([\s\S]*?)`;\n\/\*DIALOG-FIXTURE-END\*\//.exec(fs.readFileSync(DRIVER, 'utf8'));

function relabel(base, newNonce) {
  const oldNonce = base.nonce;
  const r = JSON.parse(JSON.stringify(base).split(oldNonce).join(newNonce));
  const oldTok = base.host.launchToken, tok = crypto.randomBytes(6).toString('hex'), bid = crypto.randomUUID();
  r.host.launchToken = tok;
  r.host.argv = r.host.argv.map((a) => (typeof a === 'string' && a.startsWith('--user-data-dir=') && a.endsWith('/profile-' + oldTok) ? a.slice(0, -('profile-' + oldTok).length) + 'profile-' + tok : a));
  const oldUrl = base.host.devtoolsListening.url, port = base.host.devtoolsListening.port;
  const newUrl = 'ws://127.0.0.1:' + port + '/devtools/browser/' + bid;
  r.host.devtoolsListening = { ...base.host.devtoolsListening, url: newUrl, browserId: bid };
  r.host.stderrHead = String(base.host.stderrHead).split(oldUrl).join(newUrl);
  r.fixture = { ...r.fixture, sha256: sha256(Buffer.from(m[1].replaceAll('__NONCE__', newNonce))), nextSha256: sha256(Buffer.from(m[2].replaceAll('__NONCE__', newNonce))) };
  return r;
}
function save(tag, r) {
  const sims = priors.map((p) => sim(r, p));
  fs.writeFileSync(path.join(OUT, tag + '.receipt.json'), JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ tag, maxAbs: Math.max(...sims.map((s) => s.abs)), maxGap: Math.max(...sims.map((s) => s.gap)), ownGaps: gapsOf(r).length, gaps: gapsOf(r).map((g) => +g.toFixed(3)) }));
  return r;
}
function perturb(base) {
  const r = relabel(base, 'tabi-r76-l1-97bf5d560d03');
  const cIdx = r.events.findIndex((e) => e.leg === 'prompt-dismiss' && e.type === 'click');
  const aIdx = r.events.findIndex((e) => e.leg === 'alert-accept' && e.type === 'click');
  const oth = r.events.map((e, i) => i).filter((i) => i !== cIdx && i !== aIdx);
  const tsIdx = [cIdx, aIdx, ...oth.slice(0, 17)]; // 19 events total, all with a ts or at move
  for (const i of tsIdx) r.events[i].ts = +(r.events[i].ts + 0.1).toFixed(10);
  r.events[cIdx].at = +(r.events[cIdx].at + 305.0).toFixed(10); // 605.5 -> 300.5, adds a 305.1 gap
  r.legMarks[8].at = r.events[cIdx].at + 2.0;
  const r2 = JSON.parse(JSON.stringify(r));
  r2.events[aIdx].at = +(r2.events[aIdx].at + 0.2).toFixed(10); // 302.7 -> 302.5 (second counted gap)
  return { oneGap: r, twoGaps: r2, aIdx, cIdx };
}
const smoke1 = JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-76/controls/c1/smoke1.receipt.json'), 'utf8'));
const { oneGap, twoGaps } = perturb(smoke1);
save('F2c-one-gap', oneGap);
save('F2b-two-gaps', twoGaps);

// F5: the Exec1 leg: a different prior (smoke2), Exec1 nonce, same class of move; scored with the
// prior set plus the real scored receipt as an extra --prior.
const smoke2 = JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-76/controls/c1/smoke2.receipt.json'), 'utf8'));
const g = relabel(smoke2, 'tabi-r76-exec1-97bf5d560d03');
const cIdx = g.events.findIndex((e) => e.leg === 'prompt-dismiss' && e.type === 'click');
const aIdx = g.events.findIndex((e) => e.leg === 'alert-accept' && e.type === 'click');
const oth = g.events.map((e, i) => i).filter((i) => i !== cIdx && i !== aIdx);
for (const i of [cIdx, aIdx, ...oth.slice(0, 17)]) g.events[i].ts = +(g.events[i].ts + 0.1).toFixed(10);
g.events[cIdx].at = +(g.events[cIdx].at + 305.0).toFixed(10);
g.events[aIdx].at = +(g.events[aIdx].at + 0.2).toFixed(10);
g.legMarks[8].at = g.events[cIdx].at + 2.0;
save('F5-exec1', g);
const scored = JSON.parse(fs.readFileSync(path.join(LANE, 'corpus/evidence/round76/chromium-js-dialog/receipt.json'), 'utf8'));
const sg = sim(g, scored);
console.log(JSON.stringify({ tag: 'F5-vs-scored-prior', abs: sg.abs, gap: sg.gap }));
