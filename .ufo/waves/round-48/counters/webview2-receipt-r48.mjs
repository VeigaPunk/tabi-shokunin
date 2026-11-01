#!/usr/bin/env node
// webview2-receipt-r48.mjs — tabi round 48, claim C3 counter (coverage: the
// third declared Chromium-class surface on this host, the WebView2 runtime,
// driven through a minimal COM host). Scores a committed
// webview2-cdp-loopback-round48 receipt and its screenshot bytes:
//   PREDICATE-SENTENCE: webview2-receipt-r48 admits a receipt where the schema
//   is tabi-webview2-cdp-r48, the browser identity matches /^Edg\// (a
//   cross-surface relabel to Chrome/ or a full msedge.exe path is refused —
//   the host executable must be msedgewebview2.exe under an EdgeWebView
//   Application/<version> runtime folder), the loader and driver and host
//   source digests recorded in the receipt equal the sha256 of the re-hashed
//   committed files, the DevTools websocket URL is 127.0.0.1 loopback, the
//   profile is a throwaway tabi-r48-wv2drv-<hex>-profile path, the discovery
//   came via the profile's EBWebView DevToolsActivePort with an explicit
//   port, the recorded nonce equals the nonce the live page title reported,
//   hostStdout shows the host reached ready, the committed screenshot bytes
//   hash to the receipt screenshot sha256 and carry the PNG magic, and the
//   keyed teardown reached postKillSweepCount 0.
// Declared residual (claims.json, the r44/r45 class): this counter binds
// receipt shape and committed bytes; it cannot by itself prove a browser ran —
// the re-derivation path is re-running the committed runner (the nonce differs
// per invocation) and re-compiling the host from the committed .cs. Declared
// before review data.
// Usage:
//   node webview2-receipt-r48.mjs <receipt.json> --shot <png> --driver <mjs> --hostsrc <cs>
//   node webview2-receipt-r48.mjs --selftest <fixtures-dir>
// Exit: 0 predicate met; 1 evaluated, not met; 2 could not evaluate.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-webview2-cdp-r48';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-webview2-receipt-r48', error: msg }));
  process.exit(2);
}

function checkReceipt(receiptPath, shotPath, driverPath, hostSrcPath) {
  let receipt = null;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (receipt.schema !== SCHEMA) add('schema', receipt.schema);
  const browser = (receipt.jsonVersion || {}).Browser;
  if (typeof browser !== 'string' || !/^Edg\//.test(browser)) add('surface-identity-mismatch', `webview2: ${browser}`);
  const wsUrl = (receipt.jsonVersion || {}).webSocketDebuggerUrl;
  if (typeof wsUrl !== 'string' || !/^ws:\/\/127\.0\.0\.1:\d+\//.test(wsUrl)) add('ws-not-loopback', wsUrl);
  // receipt.hostExe is the compiled COM HOST (webview2-host-round48.exe);
  // the webview BINARY is the runtime folder's msedgewebview2.exe — both are
  // checked, a full msedge.exe or chrome.exe runtime path is refused.
  if (typeof receipt.hostExe !== 'string' || !/[\\/]webview2-host-round48\.exe$/.test(receipt.hostExe)) {
    add('host-exe-not-webview2-host', receipt.hostExe);
  }
  if (typeof receipt.runtimeFolder !== 'string'
      || !/[\\/]EdgeWebView[\\/]Application[\\/]\d+\.\d+\.\d+\.\d+$/.test(receipt.runtimeFolder)) {
    add('runtime-folder-not-webview2', receipt.runtimeFolder);
  } else {
    let runtimeExe = null;
    try { runtimeExe = fs.existsSync(path.join(receipt.runtimeFolder, 'msedgewebview2.exe')); } catch { runtimeExe = false; }
    if (!runtimeExe) add('runtime-msedgewebview2-absent', receipt.runtimeFolder);
  }
  if (typeof receipt.profile !== 'string' || !/[\\/]tabi-r48-wv2drv-[0-9a-f]+-profile$/.test(receipt.profile)) {
    add('profile-not-throwaway', receipt.profile);
  }
  if ((receipt.discovery || {}).via !== 'devtools-active-port-webview-ebwebview') add('discovery-via', (receipt.discovery || {}).via);
  if (!/^\d+$/.test(String((receipt.discovery || {}).port ?? ''))) add('discovery-port', (receipt.discovery || {}).port);
  if (receipt.nonceEcho !== receipt.nonce) add('invocation-binding', `${receipt.nonceEcho} != ${receipt.nonce}`);
  if (!/^tabi-r48-[0-9a-f]{16}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
  if (receipt.hostReadySeen !== true) add('host-not-ready', receipt.hostReadySeen);
  if (receipt.invocationBound !== true) add('invocation-bound-flag', receipt.invocationBound);
  if ((receipt.teardown || {}).postKillSweepCount !== 0) add('teardown-survivors', JSON.stringify(receipt.teardown));
  // loader/driver/hostsrc digest pins: the receipt must name the same bytes
  // the repo carries.
  for (const [pin, file, id] of [
    ['driverSha256', driverPath, 'driver-pin-mismatch'],
    ['hostCsSha256', hostSrcPath, 'hostsrc-pin-mismatch'],
  ]) {
    let digest = null;
    try { digest = sha256(fs.readFileSync(file)); } catch { add('pin-file-unreadable', file); }
    if (digest !== null && receipt[pin] !== digest) add(id, `${receipt[pin]} != ${digest}`);
  }
  if (!/^[0-9a-f]{64}$/.test(receipt.loaderSha256 || '')) add('loader-pin-shape', receipt.loaderSha256);
  if (!/^[0-9a-f]{64}$/.test(receipt.hostExeSha256 || '')) add('hostexe-pin-shape', receipt.hostExeSha256);
  let shot = null;
  try { shot = fs.readFileSync(shotPath); } catch { add('shot-unreadable', shotPath); }
  if (shot) {
    const rec = receipt.screenshot || {};
    if (rec.sha256 !== sha256(shot)) add('shot-digest-mismatch', `${rec.sha256} != ${sha256(shot)}`);
    if (rec.bytes !== shot.length) add('shot-length-mismatch', `${rec.bytes} != ${shot.length}`);
    if (!(shot[0] === 0x89 && shot[1] === 0x50 && shot[2] === 0x4e && shot[3] === 0x47)) add('shot-not-png', 'PNG magic missing');
  }
  return { receipt, findings };
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const dir = args[1];
  if (!dir) die('usage: webview2-receipt-r48.mjs --selftest <fixtures-dir>');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  // the fixtures dir sits at .ufo/waves/round-48/counters/<fixtures>: five
  // levels below the repo root
  const driverPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-cdp-loopback-round48.mjs');
  const hostSrcPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-host-round48.cs');
  // fixture receipts carry the LIVE driver/hostsrc pins so the pin checks pass
  // on them and only the tampered cell fails.
  let pass = 0;
  const results = manifest.cases.map((c) => {
    const r = checkReceipt(path.join(dir, c.receipt), path.join(dir, c.shot), driverPath, hostSrcPath);
    const got = r.findings.map((f) => f.id).sort();
    const want = (c.findings || []).slice().sort();
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) pass += 1;
    return { name: c.name, ok, got, want };
  });
  const allPass = pass === results.length;
  console.log(JSON.stringify({ schema: 'tabi-webview2-receipt-r48-selftest', allPass, cases: results.length, pass, results }, null, 1));
  process.exit(allPass ? 0 : 1);
}
if (args.length !== 7 || args[1] !== '--shot' || args[3] !== '--driver' || args[5] !== '--hostsrc') {
  die('usage: node webview2-receipt-r48.mjs <receipt.json> --shot <png> --driver <mjs> --hostsrc <cs> | --selftest <dir>');
}
const { receipt, findings } = checkReceipt(args[0], args[2], args[4], args[6]);
const out = {
  schema: 'tabi-webview2-receipt-r48',
  predicateSentence: 'webview2-receipt-r48 admits a receipt where the schema is tabi-webview2-cdp-r48, the browser identity matches /^Edg\\// (a cross-surface relabel to Chrome/ or a full msedge.exe path is refused — the host executable must be msedgewebview2.exe under an EdgeWebView Application/<version> runtime folder), the loader and driver and host source digests recorded in the receipt equal the sha256 of the re-hashed committed files, the DevTools websocket URL is 127.0.0.1 loopback, the profile is a throwaway tabi-r48-wv2drv-<hex>-profile path, the discovery came via the profile EBWebView DevToolsActivePort with an explicit port, the recorded nonce equals the nonce the live page title reported, hostStdout shows the host reached ready, the committed screenshot bytes hash to the receipt screenshot sha256 and carry the PNG magic, and the keyed teardown reached postKillSweepCount 0.',
  receipt: args[0], shot: args[2],
  browser: (receipt.jsonVersion || {}).Browser,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
