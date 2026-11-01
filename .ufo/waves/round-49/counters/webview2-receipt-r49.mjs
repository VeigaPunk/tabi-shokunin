#!/usr/bin/env node
// webview2-receipt-r49.mjs — tabi round 49 counter for claims C2 (operability:
// the resolve-at-launch path contract) and C3 (coverage: cross-page navigation
// over a loopback HTTP fixture). Scores a webview2-cdp-loopback-round49
// receipt and its screenshot bytes:
//   PREDICATE-SENTENCE: webview2-receipt-r49 admits a receipt where the schema
//   is tabi-webview2-cdp-r49, the browser identity matches /^Edg\//, the
//   DevTools websocket URL is 127.0.0.1 loopback, the compiled host is
//   webview2-host-round48.exe under an EdgeWebView Application/<version>
//   runtime folder whose msedgewebview2.exe exists, the profile is a throwaway
//   tabi-r49-wv2drv-<hex>-profile under the RESOLVED scratch, receipt.paths
//   records given-vs-resolved for --scratch/--out with both resolved forms
//   win32-absolute and the resolution applied at launch (a relative
//   paths.scratchGiven must resolve to a DIFFERENT absolute path whose tail is
//   the given form, and relInvocation true; an absolute given must resolve
//   identity), the discovery came via the profile's EBWebView
//   DevToolsActivePort with an explicit port, the recorded nonce equals the
//   live page title's echo and matches the tabi-r49-<16hex> shape, the host
//   reached ready, the committed screenshot bytes hash to the receipt sha and
//   carry the PNG magic, the keyed teardown reached postKillSweepCount 0, the
//   driver and host-source digests equal the re-hashed committed files — and,
//   when receipt.nav is present, the navigation record shows mechanism
//   anchor-click with exactly two same-origin http://127.0.0.1:<same-port>
//   pages (/a.html then /b.html), distinct URLs, titles present, crossPage
//   true, page A's committed PNG hashes to pages[0].screenshot.sha256, and the
//   main shot is page B's capture.
// Declared residual (the r44/r45/r48 class, pre-declared): this counter binds
// receipt shape and committed bytes; it cannot by itself prove a browser ran —
// the re-derivation path is re-running the committed runner (fresh nonce and
// fresh fixture port per invocation) and re-compiling the host from the
// committed .cs.
// Usage:
//   node webview2-receipt-r49.mjs <receipt.json> --shot <png> [--shot-a <pngA>] --driver <mjs> --hostsrc <cs>
//   node webview2-receipt-r49.mjs --selftest <fixtures-dir>
// Exit: 0 predicate met; 1 evaluated, not met; 2 could not evaluate.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-webview2-cdp-r49';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-webview2-receipt-r49', error: msg }));
  process.exit(2);
}

function checkReceipt(receiptPath, shotPath, shotAPath, driverPath, hostSrcPath) {
  let receipt = null;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (receipt.schema !== SCHEMA) add('schema', receipt.schema);
  const browser = (receipt.jsonVersion || {}).Browser;
  if (typeof browser !== 'string' || !/^Edg\//.test(browser)) add('surface-identity-mismatch', `webview2: ${browser}`);
  const wsUrl = (receipt.jsonVersion || {}).webSocketDebuggerUrl;
  if (typeof wsUrl !== 'string' || !/^ws:\/\/127\.0\.0\.1:\d+\//.test(wsUrl)) add('ws-not-loopback', wsUrl);
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
  // --- the r49 path contract (C2) -------------------------------------------
  const paths = receipt.paths || {};
  const norm = (p) => String(p).toLowerCase().replace(/[\\/]+/g, '\\');
  if (typeof receipt.profile !== 'string' || !/[\\/]tabi-r49-wv2drv-[0-9a-f]+-profile$/.test(receipt.profile)) {
    add('profile-not-throwaway', receipt.profile);
  }
  if (!paths.scratchGiven || !paths.scratchResolved || !paths.outGiven || !paths.outResolved) {
    add('paths-block-missing', JSON.stringify(paths).slice(0, 120));
  } else {
    if (!path.win32.isAbsolute(paths.scratchResolved) || !path.win32.isAbsolute(paths.outResolved)) {
      add('paths-resolved-not-absolute', `${paths.scratchResolved} | ${paths.outResolved}`);
    }
    const givenRel = typeof paths.scratchGiven === 'string' && !path.win32.isAbsolute(paths.scratchGiven);
    if (/tabi-r49-wv2drv-[0-9a-f]+-profile$/.test(String(receipt.profile))
        && !norm(receipt.profile).startsWith(norm(paths.scratchResolved))) add('profile-outside-resolved-scratch', receipt.profile);
    if (givenRel) {
      if (paths.relInvocation !== true) add('relinvocation-flag', paths.relInvocation);
      if (norm(paths.scratchResolved) === norm(paths.scratchGiven)) add('paths-resolution-not-applied', paths.scratchResolved);
      const tail = norm(paths.scratchGiven).replace(/^\\/, '');
      if (!norm(paths.scratchResolved).endsWith(tail)) add('paths-tail-lost', `${paths.scratchGiven} -> ${paths.scratchResolved}`);
    } else if (typeof paths.scratchGiven === 'string') {
      if (path.win32.normalize(paths.scratchGiven).toLowerCase() !== path.win32.normalize(paths.scratchResolved).toLowerCase()) {
        add('paths-absolute-not-identity', `${paths.scratchGiven} -> ${paths.scratchResolved}`);
      }
    }
  }
  if ((receipt.discovery || {}).via !== 'devtools-active-port-webview-ebwebview') add('discovery-via', (receipt.discovery || {}).via);
  if (!/^\d+$/.test(String((receipt.discovery || {}).port ?? ''))) add('discovery-port', (receipt.discovery || {}).port);
  if (receipt.nonceEcho !== receipt.nonce) add('invocation-binding', `${receipt.nonceEcho} != ${receipt.nonce}`);
  if (!/^tabi-r49-[0-9a-f]{16}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
  if (receipt.hostReadySeen !== true) add('host-not-ready', receipt.hostReadySeen);
  if (receipt.invocationBound !== true) add('invocation-bound-flag', receipt.invocationBound);
  if ((receipt.teardown || {}).postKillSweepCount !== 0) add('teardown-survivors', JSON.stringify(receipt.teardown));
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
  // --- the r49 navigation record (C3), when present --------------------------
  if (receipt.nav) {
    const nav = receipt.nav;
    if (nav.mechanism !== 'anchor-click') add('nav-mechanism', nav.mechanism);
    if (!Array.isArray(nav.pages) || nav.pages.length !== 2) add('nav-pages', JSON.stringify(nav.pages || null).slice(0, 120));
    else {
      const [a, b] = nav.pages;
      let ua = null, ub = null;
      try { ua = new URL(a.url); } catch { add('nav-url-a', a.url); }
      try { ub = new URL(b.url); } catch { add('nav-url-b', b.url); }
      if (ua && ub) {
        if (ua.origin !== `http://127.0.0.1${ua.port ? ':' + ua.port : ''}` || ub.origin !== `http://127.0.0.1${ub.port ? ':' + ub.port : ''}`) add('nav-origin-not-loopback', `${ua.origin} ${ub.origin}`);
        if (ua.port !== ub.port || !/^\d+$/.test(ua.port)) add('nav-port', `${ua.port} ${ub.port}`);
        if (a.url === b.url) add('nav-crosspage-false', `${a.url}`);
        if (!ua.pathname.endsWith('/a.html')) add('nav-page-a-path', ua.pathname);
        if (!ub.pathname.endsWith('/b.html')) add('nav-page-b-path', ub.pathname);
      }
      if (typeof a.title !== 'string' || !a.title) add('nav-title-a', a.title);
      if (typeof b.title !== 'string' || !b.title) add('nav-title-b', b.title);
      if (nav.crossPage !== true) add('nav-crosspage-flag', nav.crossPage);
      if (nav.sameOrigin !== true) add('nav-sameorigin-flag', nav.sameOrigin);
      let shotA = null;
      if (!shotAPath) add('shot-a-missing-arg', 'nav receipt requires --shot-a');
      else { try { shotA = fs.readFileSync(shotAPath); } catch { add('shot-a-unreadable', shotAPath); } }
      if (shotA) {
        const recA = a.screenshot || {};
        if (recA.sha256 !== sha256(shotA)) add('shot-a-digest-mismatch', `${recA.sha256} != ${sha256(shotA)}`);
        if (recA.bytes !== shotA.length) add('shot-a-length-mismatch', `${recA.bytes} != ${shotA.length}`);
        if (!(shotA[0] === 0x89 && shotA[1] === 0x50 && shotA[2] === 0x4e && shotA[3] === 0x47)) add('shot-a-not-png', 'PNG magic missing');
      }
      const recB = (receipt.screenshot || {});
      if (JSON.stringify(recB) !== JSON.stringify(b.screenshot || {})) add('main-shot-not-page-b', JSON.stringify({ recB, b: b.screenshot }).slice(0, 160));
    }
  }
  return { receipt, findings };
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const dir = args[1];
  if (!dir) die('usage: webview2-receipt-r49.mjs --selftest <fixtures-dir>');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  // the fixtures dir sits at .ufo/waves/round-49/counters/<fixtures>: five
  // levels below the repo root
  const driverPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-cdp-loopback-round49.mjs');
  const hostSrcPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-host-round48.cs');
  let pass = 0;
  const results = manifest.cases.map((c) => {
    const r = checkReceipt(path.join(dir, c.receipt), c.shot ? path.join(dir, c.shot) : path.join(dir, 'missing.png'), c.shotA ? path.join(dir, c.shotA) : null, driverPath, hostSrcPath);
    const got = r.findings.map((f) => f.id).sort();
    const want = (c.findings || []).slice().sort();
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) pass += 1;
    return { name: c.name, ok, got, want };
  });
  const allPass = pass === results.length;
  console.log(JSON.stringify({ schema: 'tabi-webview2-receipt-r49-selftest', allPass, cases: results.length, pass, results }, null, 1));
  process.exit(allPass ? 0 : 1);
}
// main: <receipt> --shot <png> [--shot-a <pngA>] --driver <mjs> --hostsrc <cs>
const receiptPath = args[0];
const shotIdx = args.indexOf('--shot');
const driverIdx = args.indexOf('--driver');
const hostsrcIdx = args.indexOf('--hostsrc');
const shotAIdx = args.indexOf('--shot-a');
if (!receiptPath || shotIdx === -1 || driverIdx === -1 || hostsrcIdx === -1) {
  die('usage: node webview2-receipt-r49.mjs <receipt.json> --shot <png> [--shot-a <pngA>] --driver <mjs> --hostsrc <cs> | --selftest <dir>');
}
const { receipt, findings } = checkReceipt(receiptPath, args[shotIdx + 1], shotAIdx === -1 ? null : args[shotAIdx + 1], args[driverIdx + 1], args[hostsrcIdx + 1]);
const out = {
  schema: 'tabi-webview2-receipt-r49',
  receipt: receiptPath,
  shot: args[shotIdx + 1],
  shotA: shotAIdx === -1 ? null : args[shotAIdx + 1],
  browser: (receipt.jsonVersion || {}).Browser,
  nav: receipt.nav ? { mechanism: receipt.nav.mechanism, crossPage: receipt.nav.crossPage, pages: receipt.nav.pages.map((p) => p.url) } : null,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
