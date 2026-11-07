#!/usr/bin/env node
// R73Critic forgery builder (critic seat, NOT a production instrument).
// Rebuilds every forged receipt cited in report.md from committed lane bytes.
// Usage: node forge-build.mjs --lane <ABS lane> --out <ABS dir>
// Each forgery is scored with the frozen counter and the frozen PRE prior set; see report.md.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'), outDir = opt('out');
if (!lane || !outDir) { console.error('usage: --lane <ABS lane> --out <ABS dir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const PIN = '3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4';
const NONCE_A = 'tabi-r73-l1-3409ab53b905';
const NONCE_B = 'tabi-r73-exec1-3409ab53b905';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const clone = (x) => JSON.parse(JSON.stringify(x));
const sub = (x, o, n) => (typeof x === 'string' ? x.replaceAll(o, n)
  : Array.isArray(x) ? x.map((i) => sub(i, o, n))
  : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, sub(v, o, n)]))
  : x);

// relabel: rewrite only the four identity fields plus the nonce string (nothing else).
function relabel(receipt, nonce) {
  const r = clone(receipt);
  const old = r.nonce;
  r.schema = 'tabi-chrome-cdp-synthpinch-r73';
  r.nonce = nonce;
  r.nonceOnPage = nonce;
  r.driverSha256 = PIN;
  return sub(r, old, nonce);
}

// F4: round-72 scored receipt, four fields only; launch token, DevTools browser id and every
// event ts/at are kept byte-for-byte.
fs.writeFileSync(path.join(outDir, 'forge-r72-relabel.json'), JSON.stringify(
  relabel(read(path.join(lane, 'corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json')), NONCE_A), null, 1));

// F5: round-72 control smoke1 as the leg (b) receipt (PRE + the (a) receipt as priors).
fs.writeFileSync(path.join(outDir, 'forge-legb-r72smoke1.json'), JSON.stringify(
  relabel(read(path.join(lane, '.ufo/waves/round-72/controls/c1/smoke1.receipt.json')), NONCE_B), null, 1));

// F3: the declared-limit witness (nonce + launch token + DevTools browser id + every event ts).
function launder(receipt) {
  const r = clone(receipt);
  const oldNonce = r.nonce, oldTok = r.host.launchToken, oldUrl = r.host.devtoolsListening.url;
  const newTok = 'aaaaaaaaaaaa';
  const newUrl = oldUrl.slice(0, oldUrl.lastIndexOf('/') + 1) + '11111111-2222-3333-4444-555555555555';
  r.host.launchToken = newTok;
  r.host.argv = r.host.argv.map((a) => a.replaceAll(oldTok, newTok));
  r.host.devtoolsListening.url = newUrl;
  r.host.stderrHead = r.host.stderrHead.replaceAll(oldUrl, newUrl);
  for (const e of r.events) e.ts += 1000;
  return relabel(r, NONCE_A);
}
fs.writeFileSync(path.join(outDir, 'forge-smoke1-launder.json'), JSON.stringify(
  launder(read(path.join(lane, '.ufo/waves/round-73/controls/c1/smoke1.receipt.json'))), null, 1));

// F2: the declared forged-a analog (nonce + both wall-clock stamps +1 h, nothing else).
function stampsOnly(receipt) {
  const r = relabel(receipt, NONCE_A);
  for (const k of ['startedAt', 'finishedAt']) {
    const t = new Date(r[k]);
    r[k] = new Date(t.getTime() + 3600e3).toISOString().replace(/\.(\d{3})Z$/, '.$1Z');
  }
  return r;
}
fs.writeFileSync(path.join(outDir, 'forge-nonce-stamps.json'), JSON.stringify(
  stampsOnly(read(path.join(lane, '.ufo/waves/round-73/controls/c1/smoke1.receipt.json'))), null, 1));

console.log(JSON.stringify({ out: outDir, files: fs.readdirSync(outDir).sort() }));
