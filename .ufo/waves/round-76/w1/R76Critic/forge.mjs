#!/usr/bin/env node
// R76Critic forgery builder: relabel a committed prior into a receipt for the frozen C1 counting
// command, then perturb the event timeline by construction. Scratch only; never writes the lane.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = '/fast/scratch/hyaku/tabi-r76/R76Critic';
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-dialog-round76.mjs');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const pairs = (x) => (x.events || []).filter((e) => e && typeof e === 'object' && Number.isFinite(e.ts) && Number.isFinite(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const sim = (a, b) => { const na = pairs(a).length, ga = gapsOf(a); return { abs: na ? pairMatch(a, b) / na : 0, gap: ga.length ? matchCount(ga, gapsOf(b)) / ga.length : 0, na, ng: ga.length }; };

const priors = fs.readFileSync(path.join(LANE, '.ufo/waves/round-76/controls/c1/prior-set.txt'), 'utf8')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => JSON.parse(fs.readFileSync(path.join(LANE, l), 'utf8')));

const driverSrc = fs.readFileSync(DRIVER, 'utf8');
const m = /\/\*DIALOG-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\nconst NEXT_TEMPLATE = `([\s\S]*?)`;\n\/\*DIALOG-FIXTURE-END\*\//.exec(driverSrc);
if (!m) throw new Error('fixture templates not found in pinned driver');

const rndHex = (n) => crypto.randomBytes(n).toString('hex');
const uuid = () => crypto.randomUUID();
const OLD = JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-76/controls/c1/smoke1.receipt.json'), 'utf8'));

function relabel(base, newNonce) {
  const oldNonce = base.nonce;
  let s = JSON.stringify(base);
  s = s.split(oldNonce).join(newNonce);
  const r = JSON.parse(s);
  // host identity: launch token, profile dir, devtools browser id and the stderr echo of its url
  const oldTok = base.host.launchToken;
  const tok = rndHex(6);
  const bid = uuid();
  r.host.launchToken = tok;
  r.host.argv = r.host.argv.map((a) => (typeof a === 'string' && a.startsWith('--user-data-dir=') && a.endsWith('/profile-' + oldTok) ? a.slice(0, -('profile-' + oldTok).length) + 'profile-' + tok : a));
  const oldUrl = base.host.devtoolsListening.url;
  const port = base.host.devtoolsListening.port;
  const newUrl = 'ws://127.0.0.1:' + port + '/devtools/browser/' + bid;
  r.host.devtoolsListening = { ...base.host.devtoolsListening, url: newUrl, browserId: bid };
  r.host.stderrHead = String(base.host.stderrHead).split(oldUrl).join(newUrl);
  // fixture hashes depend on the nonce: recompute from the PINNED driver (same rule as the counter)
  r.fixture = { ...r.fixture, sha256: sha256(Buffer.from(m[1].replaceAll('__NONCE__', newNonce))), nextSha256: sha256(Buffer.from(m[2].replaceAll('__NONCE__', newNonce))) };
  // producer verdict stays true/CONFIRMED: a forger asserts it
  return r;
}

function report(tag, r) {
  const sims = priors.map((p) => sim(r, p));
  const worst = sims.map((s, i) => ({ i, ...s })).sort((a, b) => (b.abs - a.abs) || (b.gap - a.gap))[0];
  const refused = sims.some((s) => s.abs >= FRAC || s.gap >= GAP_FRAC);
  const out = { tag, refused, maxAbs: Math.max(...sims.map((s) => s.abs)), maxGap: Math.max(...sims.map((s) => s.gap)), worst, ownGaps: gapsOf(r).length, ownGapsList: gapsOf(r).map((g) => +g.toFixed(3)) };
  fs.writeFileSync(path.join(OUT, tag + '.receipt.json'), JSON.stringify(r, null, 1));
  console.log(JSON.stringify(out));
  return out;
}

const files = {
  identity: OLD,
};

// F1: identity relabel only, timeline untouched.
const f1 = relabel(OLD, 'tabi-r76-l1-97bf5d560d03');
report('F1-identity-only', f1);

// helper: move ts of chosen events by delta; move at of one event by deltaAt; adjust the mark that
// bounds the moved event's leg so the window check keeps holding.
function pert(tsIdx, tsDelta, atIdx, atDelta, newMark) {
  const r = JSON.parse(JSON.stringify(f1));
  for (const i of tsIdx) r.events[i].ts = +(r.events[i].ts + tsDelta).toFixed(10);
  if (atIdx !== null) r.events[atIdx].at = +(r.events[atIdx].at + atDelta).toFixed(10);
  if (newMark !== undefined && newMark !== null) r.legMarks[newMark[0]].at = newMark[1];
  return r;
}

const clickIdx = f1.events.findIndex((e) => e.leg === 'prompt-dismiss' && e.type === 'click');
const others = f1.events.map((e, i) => i).filter((i) => i !== clickIdx);
console.log(JSON.stringify({ clickIdx, click: f1.events[clickIdx], prev: f1.events[clickIdx - 1], mark8: f1.legMarks[8], mark9: f1.legMarks[9], marks: f1.legMarks.map((x) => [x.name, x.at]) }));

// F2: 19 events moved (the at-moved click + 18 ts-only), the at move splits the 605.5 gap into
// 302.5 + 300.5 -> one prior gap value (605.5) is lost and one gap is added (ownGaps 7).
const f2 = pert([clickIdx, ...others.slice(0, 18)], 0.1, clickIdx, 305.0, [8, f1.events[clickIdx].at + 305.0 + 2.0]);
report('F2-declared-limit', f2);

// F3: 18 events moved (the at-moved click + 17 ts-only) -> expect 19/37 matched = 0.5135 -> refuse.
const f3 = pert([clickIdx, ...others.slice(0, 17)], 0.1, clickIdx, 305.0, [8, f1.events[clickIdx].at + 305.0 + 2.0]);
report('F3-18-events', f3);

// F4: 17 events moved + two duplicated pairs (two events take another event's identical pair) ->
// matched predicted 18/37 = 0.486 -> escape? (tests the duplicate-prior-events shortcut)
const r4 = pert([clickIdx, ...others.slice(0, 16)], 0.1, clickIdx, 305.0, [8, f1.events[clickIdx].at + 305.0 + 2.0]);
// duplicate the (ts,at) of pointerdown into mousedown on two click legs whose pair values differ
let dupes = 0;
for (const leg of ['alert-accept', 'confirm-accept']) {
  const a = r4.events.find((e) => e.leg === leg && e.type === 'pointerdown');
  const b = r4.events.find((e) => e.leg === leg && e.type === 'mousedown');
  if (a && b && (a.ts !== b.ts || a.at !== b.at)) { b.ts = a.ts; b.at = a.at; dupes++; }
}
console.log(JSON.stringify({ dupes }));
report('F4-17-moved-2-dupes', r4);
