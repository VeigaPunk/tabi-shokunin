#!/usr/bin/env node
// chrome-cdp-receipt-r44.mjs — tabi round 44, claim C2 counter (coverage
// capability). Scores a committed chrome-cdp-loopback-round44 receipt and its
// screenshot bytes on committed-shape grounds:
//   PREDICATE-SENTENCE: chrome-cdp-receipt-r44 admits a receipt where the schema is tabi-chrome-cdp-round44, the runner digest equals the frozen scripts/chrome-cdp-loopback-round44.mjs pin 9b2855f09e4b72f1e3250089c2e3d3341fd98b50bf2ea86291953e3a97c6f655 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, the profile dir is a non-default throwaway path under the declared scratch, the browser identity matches Chrome-slash-version, the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, and the four timestamps are strictly increasing with chromeTerminated true.
// Declared residual (claims.json): this counter binds receipt shape and
// committed bytes; it does not and cannot prove by itself that a browser ran —
// the re-derivation path for Chrome-ness is re-running the runner (fixture
// nonce differs per invocation). That limit is declared before review data.
import fs from 'node:fs';
import crypto from 'node:crypto';

const RUNNER_PIN = '9b2855f09e4b72f1e3250089c2e3d3341fd98b50bf2ea86291953e3a97c6f655';
const TITLE = 'tabi r44 cdp loopback fixture';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-receipt-r44', error: msg }));
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length !== 5 || args[1] !== '--shot' || args[3] !== '--runner') {
  die('usage: node chrome-cdp-receipt-r44.mjs <receipt.json> --shot <shot.png> --runner <runner.mjs>');
}
const receiptPath = args[0], shotPath = args[2], runnerPath = args[4];
let receipt = null;
try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }

const findings = [];
const add = (id, detail) => findings.push({ id, detail });

if (receipt.schema !== 'tabi-chrome-cdp-round44') add('schema', receipt.schema);
if (!/^[0-9a-f]{64}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
let runnerDigest = null;
try { runnerDigest = sha256(fs.readFileSync(runnerPath)); } catch { add('runner-unreadable', runnerPath); }
if (runnerDigest !== null) {
  if (receipt.runnerSha256 !== runnerDigest) add('runner-self-digest-mismatch', `${receipt.runnerSha256} != ${runnerDigest}`);
  if (runnerDigest !== RUNNER_PIN) add('runner-pin-mismatch', `${runnerDigest} != pinned ${RUNNER_PIN}`);
}
if (!/^127\.0\.0\.1:\d+$/.test(receipt.wsHost || '')) add('ws-host-not-loopback', receipt.wsHost);
if (!/^http:\/\/127\.0\.0\.1:\d+\/$/.test(receipt.fixtureUrl || '')) add('fixture-url-not-loopback', receipt.fixtureUrl);
if (typeof receipt.profileDir !== 'string' || !/[\\/]chrome-profile$/.test(receipt.profileDir)) add('profile-not-throwaway', receipt.profileDir);
if (typeof receipt.browser !== 'string' || !/^Chrome\//.test(receipt.browser)) add('browser-identity', receipt.browser);
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
  schema: 'tabi-chrome-cdp-receipt-r44',
  predicateSentence: 'chrome-cdp-receipt-r44 admits a receipt where the schema is tabi-chrome-cdp-round44, the runner digest equals the frozen scripts/chrome-cdp-loopback-round44.mjs pin 9b2855f09e4b72f1e3250089c2e3d3341fd98b50bf2ea86291953e3a97c6f655 and the runner file bytes hash to the same value, the nonce is fresh 64-hex, the DevTools socket host and the fixture URL are both 127.0.0.1 loopback with explicit ports, the profile dir is a non-default throwaway path under the declared scratch, the browser identity matches Chrome-slash-version, the recorded fixture nonce equals the nonce the live DOM reported, the page title equals the fixture title, the marker is found, the committed screenshot bytes hash to the receipt screenshotSha256 and carry the PNG magic, and the four timestamps are strictly increasing with chromeTerminated true.',
  receipt: receiptPath, shot: shotPath, runnerDigest,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
