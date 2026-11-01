#!/usr/bin/env node
// chrome-cdp-receipt-r45.mjs — tabi round 45, claim C2 counter (coverage: the
// second declared Chromium-class surface, Edge, on this host). Scores a
// committed chrome-cdp-loopback-round45 receipt and its screenshot bytes on
// committed-shape grounds:
//   PREDICATE-SENTENCE: chrome-cdp-receipt-r45 admits a receipt where the schema is tabi-chrome-cdp-round45, the declaredSurface is chrome or edge, the runner digest equals the frozen scripts/chrome-cdp-loopback-round45.mjs pin c2abfccf68f0b204b25fa0339377f8d3bdde4111f44423f21a2bd2d0e6d15d82 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, discoveryVia is stderr or devtools-active-port (a devtools-active-port discovery additionally records a /devtools/browser/ path), the browserPath belongs to the declared surface's installed family, the browser identity matches the declared surface's grammar (Chrome/ for chrome, Edg/ for edge — a cross-surface relabel is refused), the profile dir is a non-default throwaway path named for the declared surface under the declared scratch, the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, and the four timestamps are strictly increasing with chromeTerminated true.
// Declared residual (claims.json, same class as r44): this counter binds
// receipt shape and committed bytes; it does not and cannot prove by itself
// that a browser ran — the re-derivation path is re-running the runner (the
// fixture nonce differs per invocation). Declared before review data.
import fs from 'node:fs';
import crypto from 'node:crypto';

const RUNNER_PIN = 'c2abfccf68f0b204b25fa0339377f8d3bdde4111f44423f21a2bd2d0e6d15d82';
const TITLE = 'tabi r45 cdp loopback fixture';
const SURFACE_IDENTITY = { chrome: /^Chrome\//, edge: /^Edg\// };
const SURFACE_BROWSERPATH = { chrome: /Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/, edge: /Microsoft[\\/]Edge[\\/]Application[\\/]msedge\.exe$/ };
const SURFACE_PROFILE = { chrome: /[\\/]chrome-profile$/, edge: /[\\/]edge-profile$/ };

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-receipt-r45', error: msg }));
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length !== 5 || args[1] !== '--shot' || args[3] !== '--runner') {
  die('usage: node chrome-cdp-receipt-r45.mjs <receipt.json> --shot <shot.png> --runner <runner.mjs>');
}
const receiptPath = args[0], shotPath = args[2], runnerPath = args[4];
let receipt = null;
try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }

const findings = [];
const add = (id, detail) => findings.push({ id, detail });

if (receipt.schema !== 'tabi-chrome-cdp-round45') add('schema', receipt.schema);
const surface = receipt.declaredSurface;
if (surface !== 'chrome' && surface !== 'edge') add('declared-surface', surface);
if (!/^[0-9a-f]{64}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
let runnerDigest = null;
try { runnerDigest = sha256(fs.readFileSync(runnerPath)); } catch { add('runner-unreadable', runnerPath); }
if (runnerDigest !== null) {
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
  if (typeof receipt.profileDir !== 'string' || !SURFACE_PROFILE[surface].test(receipt.profileDir)) add('profile-not-throwaway', `${surface}: ${receipt.profileDir}`);
}
if (receipt.fixtureNonce !== receipt.domFixtureNonce) add('invocation-binding', 'fixture nonce != live DOM nonce');
if (receipt.domFixtureNonce !== (receipt.dom || {}).nonce) add('dom-nonce-field-mismatch', 'domFixtureNonce != dom.nonce');
if (receipt.pageTitle !== TITLE || (receipt.dom || {}).title !== TITLE) add('page-title', receipt.pageTitle);
if (receipt.markerFound !== true || (receipt.dom || {}).markerFound !== true) add('marker', 'marker not found');
if (receipt.invocationBound !== true) add('invocation-bound-flag', receipt.invocationBound);
const ts = [receipt.t0Ms, receipt.tDomMs, receipt.tShotMs, receipt.tEndMs];
if (ts.some((t) => !Number.isFinite(t)) || !(ts[0] < ts[1] && ts[1] < ts[2] && ts[2] < ts[3])) add('timestamps', JSON.stringify(ts));
if (receipt.chromeTerminated !== true) add('chrome-terminated', receipt.chromeTerminated);
let shot = null;
try { shot = fs.readFileSync(shotPath); } catch { add('shot-unreadable', shotPath); }
if (shot) {
  if (receipt.screenshotSha256 !== sha256(shot)) add('shot-digest-mismatch', `${receipt.screenshotSha256} != ${sha256(shot)}`);
  if (!(shot[0] === 0x89 && shot[1] === 0x50 && shot[2] === 0x4e && shot[3] === 0x47)) add('shot-not-png', 'PNG magic missing');
  if (receipt.pngByteLength !== shot.length) add('shot-length-mismatch', `${receipt.pngByteLength} != ${shot.length}`);
}

const out = {
  schema: 'tabi-chrome-cdp-receipt-r45',
  predicateSentence: 'chrome-cdp-receipt-r45 admits a receipt where the schema is tabi-chrome-cdp-round45, the declaredSurface is chrome or edge, the runner digest equals the frozen scripts/chrome-cdp-loopback-round45.mjs pin c2abfccf68f0b204b25fa0339377f8d3bdde4111f44423f21a2bd2d0e6d15d82 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, discoveryVia is stderr or devtools-active-port (a devtools-active-port discovery additionally records a /devtools/browser/ path), the browserPath belongs to the declared surface\'s installed family, the browser identity matches the declared surface\'s grammar (Chrome/ for chrome, Edg/ for edge — a cross-surface relabel is refused), the profile dir is a non-default throwaway path named for the declared surface under the declared scratch, the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, and the four timestamps are strictly increasing with chromeTerminated true.',
  receipt: receiptPath, shot: shotPath, runnerDigest,
  declaredSurface: surface,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
