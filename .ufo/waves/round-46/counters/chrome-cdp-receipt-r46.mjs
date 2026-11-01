#!/usr/bin/env node
// chrome-cdp-receipt-r46.mjs — tabi round 46, claim C1 counter (operability:
// the teardown repair). Scores a committed chrome-cdp-loopback-round46 receipt
// and its screenshot bytes on committed-shape grounds:
//
//   PREDICATE-SENTENCE: chrome-cdp-receipt-r46 admits a receipt where the schema is tabi-chrome-cdp-round46, the declaredSurface is chrome or edge, the runner digest equals the frozen scripts/chrome-cdp-loopback-round46.mjs pin 557a3f0633357216ec199f59d7b6f356ad02d888fe28218d16390e73c89bb9a4 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, discoveryVia is stderr or devtools-active-port (a devtools-active-port discovery additionally records a /devtools/browser/ path), the browserPath belongs to the declared surface's installed family, the browser identity matches the declared surface's grammar (Chrome/ for chrome, Edg/ for edge — a cross-surface relabel is refused), the launchKey is a fresh per-run throwaway profile token named for the declared surface and equal to the profile dir's basename, the pre-launch keyed sweep recorded 0 (a fresh key), the mid-run keyed census is nonempty (the token group binds a live launch), the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, the four timestamps are strictly increasing, chromeTerminated is true, the legacy tree-kill attempt is recorded with its output, and the post-kill keyed sweep reached exactly 0 through at least one recorded sweep round.
//
// Declared residual (frozen before review data): this counter binds receipt
// shape and committed bytes; it cannot by itself prove a browser ran or that
// the sweep pids were real — the re-derivation path is re-running the runner
// (the fixture nonce differs per invocation). Same residual model as rounds
// 44-45.
import fs from 'node:fs';
import crypto from 'node:crypto';

const RUNNER_PIN = '557a3f0633357216ec199f59d7b6f356ad02d888fe28218d16390e73c89bb9a4';
const TITLE = 'tabi r46 cdp loopback fixture';
const SURFACE_IDENTITY = { chrome: /^Chrome\//, edge: /^Edg\// };
const SURFACE_BROWSERPATH = { chrome: /Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/, edge: /Microsoft[\\/]Edge[\\/]Application[\\/]msedge\.exe$/ };
const LAUNCHKEY = { chrome: /^chrome-profile-[0-9a-f]{12}$/, edge: /^edge-profile-[0-9a-f]{12}$/ };

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// --- pure core -----------------------------------------------------------------
// score({receipt, shotBytes, runnerDigest}) -> findings[]
export function score(input) {
  const receipt = input.receipt;
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (receipt.schema !== 'tabi-chrome-cdp-round46') add('schema', receipt.schema);
  const surface = receipt.declaredSurface;
  if (surface !== 'chrome' && surface !== 'edge') add('declared-surface', surface);
  if (!/^[0-9a-f]{64}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
  const runnerDigest = input.runnerDigest;
  if (runnerDigest === null || runnerDigest === undefined) add('runner-unreadable', input.runnerPath || '');
  else {
    if (receipt.runnerSha256 !== runnerDigest) add('runner-self-digest-mismatch', `${receipt.runnerSha256} != ${runnerDigest}`);
    if (runnerDigest !== RUNNER_PIN) add('runner-pin-mismatch', `${runnerDigest} != pinned ${RUNNER_PIN}`);
  }
  if (!/^127\.0\.0\.1:\d+$/.test(receipt.wsHost || '')) add('ws-host-not-loopback', receipt.wsHost);
  if (!/^http:\/\/127\.0\.0\.1:\d+\/$/.test(receipt.fixtureUrl || '')) add('fixture-url-not-loopback', receipt.fixtureUrl);
  if (receipt.discoveryVia !== 'stderr' && receipt.discoveryVia !== 'devtools-active-port') add('discovery-via', receipt.discoveryVia);
  if (receipt.discoveryVia === 'devtools-active-port'
    && (typeof receipt.devtoolsBrowserPath !== 'string' || !/^\/devtools\/browser\//.test(receipt.devtoolsBrowserPath))) {
    add('devtools-active-port-path', receipt.devtoolsBrowserPath);
  }
  if (surface === 'chrome' || surface === 'edge') {
    if (typeof receipt.browserPath !== 'string' || !SURFACE_BROWSERPATH[surface].test(receipt.browserPath)) add('surface-browserpath', `${surface}: ${receipt.browserPath}`);
    if (typeof receipt.browser !== 'string' || !SURFACE_IDENTITY[surface].test(receipt.browser)) add('surface-identity-mismatch', `${surface}: ${receipt.browser}`);
    if (typeof receipt.launchKey !== 'string' || !LAUNCHKEY[surface].test(receipt.launchKey)) add('launch-key-shape', `${surface}: ${receipt.launchKey}`);
    if (typeof receipt.profileDir !== 'string' || receipt.launchKey === undefined
      || !new RegExp(`[\\\\/]${receipt.launchKey}$`).test(receipt.profileDir)) add('profile-not-launch-keyed', `${receipt.profileDir} vs ${receipt.launchKey}`);
  }
  if (receipt.preLaunchSweepCount !== 0) add('prelaunch-sweep-not-zero', receipt.preLaunchSweepCount);
  if (!receipt.midRunSweep || typeof receipt.midRunSweep !== 'object') add('midrun-census-missing', receipt.midRunSweep);
  else {
    if (!Number.isInteger(receipt.midRunSweep.count) || receipt.midRunSweep.count < 1) add('midrun-census-empty', receipt.midRunSweep.count);
    else {
      if (!Array.isArray(receipt.midRunSweep.pids) || receipt.midRunSweep.pids.length !== receipt.midRunSweep.count) add('midrun-pids-mismatch', JSON.stringify(receipt.midRunSweep.pids));
      if (!Array.isArray(receipt.midRunSweep.procs) || receipt.midRunSweep.procs.length !== receipt.midRunSweep.count) add('midrun-procs-mismatch', receipt.midRunSweep.procs && receipt.midRunSweep.procs.length);
      else {
        for (const p of receipt.midRunSweep.procs) {
          if (!Number.isInteger(p.pid) || typeof p.name !== 'string' || !p.name) { add('midrun-proc-shape', JSON.stringify(p).slice(-120)); break; }
        }
      }
    }
  }
  if (receipt.fixtureNonce !== receipt.domFixtureNonce) add('invocation-binding', 'fixture nonce != live DOM nonce');
  if (receipt.domFixtureNonce !== (receipt.dom || {}).nonce) add('dom-nonce-field-mismatch', 'domFixtureNonce != dom.nonce');
  if (receipt.pageTitle !== TITLE || (receipt.dom || {}).title !== TITLE) add('page-title', receipt.pageTitle);
  if (receipt.markerFound !== true || (receipt.dom || {}).markerFound !== true) add('marker', 'marker not found');
  if (receipt.invocationBound !== true) add('invocation-bound-flag', receipt.invocationBound);
  const ts = [receipt.t0Ms, receipt.tDomMs, receipt.tShotMs, receipt.tEndMs];
  if (ts.some((t) => !Number.isFinite(t)) || !(ts[0] < ts[1] && ts[1] < ts[2] && ts[2] < ts[3])) add('timestamps', JSON.stringify(ts));
  const td = receipt.teardown;
  if (!td || typeof td !== 'object') add('teardown-missing', td);
  else {
    if (td.chromeTerminated !== true) add('chrome-terminated', td.chromeTerminated);
    if (!td.legacyTreeKill || td.legacyTreeKill.ran !== true || typeof td.legacyTreeKill.output !== 'string' || td.legacyTreeKill.output.length === 0) add('legacy-treekill-unrecorded', td.legacyTreeKill && JSON.stringify(td.legacyTreeKill).slice(-120));
    if (!td.keyedSweep || !Array.isArray(td.keyedSweep.rounds)) add('keyed-sweep-rounds-missing', td.keyedSweep);
    if (td.postKillSweepCount !== 0) add('postkill-sweep-not-zero', td.postKillSweepCount);
  }
  const shot = input.shotBytes;
  if (!shot) add('shot-unreadable', input.shotPath || '');
  else {
    if (receipt.screenshotSha256 !== sha256(shot)) add('shot-digest-mismatch', `${receipt.screenshotSha256} != ${sha256(shot)}`);
    if (!(shot[0] === 0x89 && shot[1] === 0x50 && shot[2] === 0x4e && shot[3] === 0x47)) add('shot-not-png', 'PNG magic missing');
    if (receipt.pngByteLength !== shot.length) add('shot-length-mismatch', `${receipt.pngByteLength} != ${shot.length}`);
  }
  return findings;
}

// --- CLI ------------------------------------------------------------------------
const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const { selftest } = await import('./chrome-cdp-receipt-r46-selftest.mjs');
  process.exit(selftest(score, { RUNNER_PIN, TITLE }));
}
if (args.length !== 5 || args[1] !== '--shot' || args[3] !== '--runner') {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-receipt-r46', error: 'usage: node chrome-cdp-receipt-r46.mjs <receipt.json> --shot <shot.png> --runner <runner.mjs> | --selftest' }));
  process.exit(2);
}
const receiptPath = args[0], shotPath = args[2], runnerPath = args[4];
let receipt = null;
try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-receipt-r46', error: 'receipt unreadable or unparseable' })); process.exit(2); }
let runnerDigest = null;
try { runnerDigest = sha256(fs.readFileSync(runnerPath)); } catch { runnerDigest = null; }
let shot = null;
try { shot = fs.readFileSync(shotPath); } catch { shot = null; }

const findings = score({ receipt, shotBytes: shot, runnerDigest, shotPath, runnerPath });
const out = {
  schema: 'tabi-chrome-cdp-receipt-r46',
  predicateSentence: 'chrome-cdp-receipt-r46 admits a receipt where the schema is tabi-chrome-cdp-round46, the declaredSurface is chrome or edge, the runner digest equals the frozen scripts/chrome-cdp-loopback-round46.mjs pin 557a3f0633357216ec199f59d7b6f356ad02d888fe28218d16390e73c89bb9a4 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, discoveryVia is stderr or devtools-active-port (a devtools-active-port discovery additionally records a /devtools/browser/ path), the browserPath belongs to the declared surface\'s installed family, the browser identity matches the declared surface\'s grammar (Chrome/ for chrome, Edg/ for edge — a cross-surface relabel is refused), the launchKey is a fresh per-run throwaway profile token named for the declared surface and equal to the profile dir\'s basename, the pre-launch keyed sweep recorded 0 (a fresh key), the mid-run keyed census is nonempty (the token group binds a live launch), the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, the four timestamps are strictly increasing, chromeTerminated is true, the legacy tree-kill attempt is recorded with its output, and the post-kill keyed sweep reached exactly 0 through at least one recorded sweep round.',
  receipt: receiptPath, shot: shotPath, runnerDigest,
  declaredSurface: receipt.declaredSurface,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
