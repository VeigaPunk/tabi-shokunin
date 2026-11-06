#!/usr/bin/env node
// Attack harness, tabi round 71 C2 (predicate C2-EXEC-BOUND). Runs the same same-user attacks
// against one live verifier generation and classifies each outcome. Attacks A and B are
// R70Critic's (round-70 w1/R70Critic/receipts: preload-receipt*.cjs, run-attack.sh,
// do-nothing.mjs), re-expressed so they do not depend on the lane path the verifier executes
// (they match the driver/counter BASENAME, never `/scripts/...`), and so the swapped-in
// do-nothing producer carries its template inline (it needs no inherited environment).
//
// Usage: node attack-harness.mjs --lane <ABS lane checkout> --verifier verify-live-r70.mjs|verify-live-r71.mjs
//          --work <ABS short scratch dir> --out <ABS dir for the summary + per-attack receipts>
// Every attack runs on a FRESH copy of the lane's scripts/ and corpus/evidence/ under --work
// (copies are mutated; the lane is never written).
// Attacks:
//   P-tap / P-scroll  positive: clean environment, nothing tampered          (must exit 0)
//   A-env-tap / A-env-scroll  NODE_OPTIONS=--require <forge-preload.cjs> inherited by the verifier;
//                     the preload rewrites the driver's receipt into a copy of the committed evidence
//   B-swap-tap        after the verifier's pin read (trigger: <scratch>/run-a appears, i.e. after the
//                     pin read and evidence counter, before run a spawns), the lane-copy driver file
//                     is replaced by a do-nothing producer
//   C-swap-run-b-tap  after run a's receipt appears, every executable copy of the driver the
//                     verifier could run next (the lane-copy file and any snap-*/<driver> file) is
//                     replaced by the do-nothing producer
// Attack code appends one line to a marker file whenever it executes inside a run.
// Classification (frozen): FALSE-PASS = verifier exit 0 AND marker non-empty (attack code ran
// inside a run the verifier accepted); HONEST-PASS = exit 0 AND marker empty; REFUSED = exit != 0;
// NOT-LANDED = a swap attack whose swap never happened (harness red, never counted as a refusal).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'), verifier = opt('verifier'), work = opt('work'), outDir = opt('out');
if (!lane || !path.isAbsolute(lane) || !['verify-live-r70.mjs', 'verify-live-r71.mjs'].includes(verifier) || !work || !path.isAbsolute(work) || !outDir || !path.isAbsolute(outDir)) {
  console.error('usage: --lane <ABS> --verifier verify-live-r70.mjs|verify-live-r71.mjs --work <ABS> --out <ABS>'); process.exit(2);
}
fs.mkdirSync(work, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PROFILES = {
  tap: { profile: 'synthtap-r70', driver: 'chrome-cdp-synthtap-round70.mjs', counter: 'check-synthtap-r70.mjs', evidence: 'corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json', sha: '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577', durMs: 13000 },
  scroll: { profile: 'synthscroll-r69', driver: 'chrome-cdp-synthscroll-round69.mjs', counter: 'check-synthscroll-r69.mjs', evidence: 'corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json', sha: '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3', durMs: 11000 },
};
// The forging body shared by the preload and the do-nothing producer (R70Critic's rewrite).
const FORGE_BODY = `
function forgeFrom(template, nonce, httpPort, cdpPort, durMs, sha) {
  const crypto = require('crypto');
  const src = JSON.parse(require('fs').readFileSync(template, 'utf8'));
  src.nonce = nonce; src.nonceOnPage = nonce;
  for (const s of src.serverLog || []) { if (s) { s.run = nonce; if (s.path === '/') s.query = 'run=' + encodeURIComponent(nonce); } }
  src.host.argv = src.host.argv.map((a) => (a.startsWith('--remote-debugging-port=') ? '--remote-debugging-port=' + cdpPort : a));
  const dl = src.host.devtoolsListening || {};
  const browserId = dl.browserId || crypto.randomUUID();
  const newUrl = 'ws://127.0.0.1:' + cdpPort + '/devtools/browser/' + browserId;
  if (dl.url) src.host.stderrHead = String(src.host.stderrHead || '').replaceAll(dl.url, newUrl);
  src.host.devtoolsListening = { url: newUrl, port: Number(cdpPort), browserId };
  src.fixture.origin = 'http://127.0.0.1:' + httpPort;
  src.host.launchToken = crypto.randomBytes(6).toString('hex');
  src.startedAt = new Date(Date.now() - durMs).toISOString();
  src.finishedAt = new Date().toISOString();
  src.driverSha256 = sha;
  return src;
}`;
const preloadSrc = `// tabi r71 attack A: env-injected receipt forger (after R70Critic preload-receipt*.cjs).
${FORGE_BODY}
const fs = require('fs'); const path = require('path');
const main = String(process.argv[1] || '');
const base = process.env.ATTACK_DRIVER_BASENAME;
if (base && path.basename(main) === base) {
  const argv = process.argv.slice(2);
  const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
  const out = opt('out');
  const forge = () => JSON.stringify(forgeFrom(process.env.FORGED_TEMPLATE, opt('nonce'), opt('http-port'), opt('cdp-port'), Number(process.env.ATTACK_DUR_MS), process.env.FORGED_DRIVER_SHA), null, 1);
  fs.appendFileSync(process.env.ATTACK_MARKER, 'preload ' + main + '\\n');
  const orig = fs.writeFileSync;
  fs.writeFileSync = function (p, data, ...rest) {
    if (path.resolve(String(p)) === path.resolve(out)) return orig.call(fs, p, forge(), ...rest);
    return orig.call(fs, p, data, ...rest);
  };
}
`;
const doNothingSrc = (p, template, marker) => `// tabi r71 do-nothing producer (after R70Critic do-nothing.mjs): no browser, no CDP.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
${FORGE_BODY}
const fs = require('fs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
fs.appendFileSync(${JSON.stringify(marker)}, 'do-nothing ' + process.argv[1] + '\\n');
const out = opt('out');
fs.mkdirSync(require('path').dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(forgeFrom(${JSON.stringify(template)}, opt('nonce'), opt('http-port'), opt('cdp-port'), ${p.durMs}, ${JSON.stringify(p.sha)}), null, 1));
process.exit(0);
`;
const freshCopy = (name) => {
  const d = path.join(work, name);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(path.join(d, 'corpus', 'evidence'), { recursive: true });
  fs.cpSync(path.join(lane, 'scripts'), path.join(d, 'scripts'), { recursive: true });
  for (const r of ['round69', 'round70']) fs.cpSync(path.join(lane, 'corpus', 'evidence', r), path.join(d, 'corpus', 'evidence', r), { recursive: true });
  return d;
};
const cleanEnv = () => { const e = { ...process.env }; for (const k of Object.keys(e)) if (/^(NODE_OPTIONS|NODE_PATH|LD_PRELOAD|LD_AUDIT|LD_LIBRARY_PATH|NODE_REPL_EXTERNAL_MODULE|ATTACK_|FORGED_)/.test(k)) delete e[k]; return e; };
async function runVerifier(copy, prof, vscratch, env, watcher) {
  fs.rmSync(vscratch, { recursive: true, force: true });
  const child = spawn(process.execPath, [path.join(copy, 'scripts', verifier), '--profile', prof.profile, '--scratch', vscratch, '--json'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => { stdout += d; }); child.stderr.on('data', (d) => { stderr += d; });
  const done = new Promise((resolve) => child.on('exit', (code) => resolve(code)));
  let alive = true; done.then(() => { alive = false; });
  const w = watcher ? watcher(() => alive) : Promise.resolve(null);
  const code = await done; const swap = await w;
  let j = null; try { j = JSON.parse(stdout); } catch {}
  return { code, json: j, stderr: stderr.slice(0, 2000), swap };
}
const ATTACKS = [
  { id: 'P-tap', prof: 'tap', kind: 'positive' },
  { id: 'P-scroll', prof: 'scroll', kind: 'positive' },
  { id: 'A-env-tap', prof: 'tap', kind: 'env' },
  { id: 'A-env-scroll', prof: 'scroll', kind: 'env' },
  { id: 'B-swap-tap', prof: 'tap', kind: 'swap-after-pin' },
  { id: 'C-swap-run-b-tap', prof: 'tap', kind: 'swap-before-run-b' },
];
const rows = [];
for (const [ai, a] of ATTACKS.entries()) {
  const p = PROFILES[a.prof];
  const copy = freshCopy('lane' + ai);
  const marker = path.join(work, 'marker-' + a.id + '.log');
  fs.writeFileSync(marker, '');
  const template = path.join(copy, p.evidence);
  const dn = path.join(work, 'do-nothing-' + a.id + '.mjs');
  fs.writeFileSync(dn, doNothingSrc(p, template, marker));
  const vscratch = path.join(work, 'v' + ai);
  let env = cleanEnv(); let watcher = null;
  if (a.kind === 'env') {
    const pre = path.join(work, 'forge-preload.cjs'); fs.writeFileSync(pre, preloadSrc);
    env = { ...env, NODE_OPTIONS: '--require ' + pre, ATTACK_DRIVER_BASENAME: p.driver, FORGED_TEMPLATE: template, FORGED_DRIVER_SHA: p.sha, ATTACK_DUR_MS: String(p.durMs), ATTACK_MARKER: marker };
  } else if (a.kind === 'swap-after-pin') {
    watcher = async (alive) => {
      // trigger: the verifier creates <scratch>/run-a after its pin read and evidence counter and
      // just before it spawns run a (both generations); poll every 1 ms, swap at once
      const runA = path.join(vscratch, 'run-a');
      while (alive()) {
        if (fs.existsSync(runA)) { fs.copyFileSync(dn, path.join(copy, 'scripts', p.driver)); return { swappedAt: new Date().toISOString(), targets: ['scripts/' + p.driver] }; }
        await sleep(1);
      }
      return null;
    };
  } else if (a.kind === 'swap-before-run-b') {
    watcher = async (alive) => {
      const ra = path.join(vscratch, 'run-a', 'receipt.json');
      while (alive()) {
        if (fs.existsSync(ra)) {
          const targets = [path.join(copy, 'scripts', p.driver)];
          for (const d of fs.existsSync(vscratch) ? fs.readdirSync(vscratch) : []) if (d.startsWith('snap-')) targets.push(path.join(vscratch, d, p.driver));
          for (const t of targets) { try { fs.chmodSync(t, 0o700); } catch {} fs.copyFileSync(dn, t); }
          return { swappedAt: new Date().toISOString(), targets: targets.map((t) => path.relative(work, t)) };
        }
        await sleep(5);
      }
      return null;
    };
  }
  const t0 = Date.now();
  const r = await runVerifier(copy, p, vscratch, env, watcher);
  const markerLines = fs.readFileSync(marker, 'utf8').split('\n').filter(Boolean);
  const landed = a.kind === 'positive' || a.kind === 'env' || !!r.swap;
  const cls = !landed ? 'NOT-LANDED' : r.code === 0 ? (markerLines.length ? 'FALSE-PASS' : 'HONEST-PASS') : 'REFUSED';
  const row = { attack: a.id, kind: a.kind, profile: p.profile, verifier, exit: r.code, class: cls, findings: r.json ? r.json.findings : null, runs: r.json ? r.json.runs.map((x) => ({ name: x.name, exit: x.exit, wallMs: x.wallMs })) : null, markerLines, swap: r.swap, wallMs: Date.now() - t0, stderrHead: r.stderr.slice(0, 300) };
  rows.push(row);
  fs.writeFileSync(path.join(outDir, a.id + '.verifier.json'), JSON.stringify(r.json, null, 1));
  console.error(a.id + ' ' + verifier + ' exit=' + r.code + ' class=' + cls + ' findings=' + JSON.stringify(row.findings) + ' marker=' + markerLines.length);
  fs.rmSync(copy, { recursive: true, force: true }); fs.rmSync(vscratch, { recursive: true, force: true });
}
const summary = { schema: 'tabi-r71-attack-harness', verifier, rows, falsePass: rows.filter((r) => r.class === 'FALSE-PASS').length, notLanded: rows.filter((r) => r.class === 'NOT-LANDED').length, positivesOk: rows.filter((r) => r.kind === 'positive').every((r) => r.exit === 0) };
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ verifier, falsePass: summary.falsePass, notLanded: summary.notLanded, positivesOk: summary.positivesOk, classes: rows.map((r) => r.attack + ':' + r.class) }));
