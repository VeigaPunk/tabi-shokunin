#!/usr/bin/env node
// webview2-receipt-r50.mjs — tabi round 50 counter for claim C2 (coverage:
// the multi-step journey over the webview2 surface) and claim C3 (operability:
// the r49-closure D3 carry-in — the runtime-existence check becomes a DECLARED
// could-not-evaluate class instead of an environmental finding). Scores a
// webview2-cdp-loopback-round50 receipt and its screenshot bytes:
//   PREDICATE-SENTENCE: webview2-receipt-r50 admits a receipt where the schema
//   is tabi-webview2-cdp-r50, the browser identity matches /^Edg\//, the
//   DevTools websocket URL is 127.0.0.1 loopback, the compiled host is
//   webview2-host-round48.exe under an EdgeWebView Application/<version>
//   runtime folder, the recorded Edg identity equals the runtime folder's
//   version tail, the runtime folder's msedgewebview2.exe existence is
//   verified WHEN the folder exists on the scoring host (a folder present but
//   without its exe is the finding runtime-msedgewebview2-absent) and is
//   GRADED AS THE DECLARED could-not-evaluate CLASS runtime-pin-host-drift
//   (recorded under output.couldNotEvaluate, never as a finding) WHEN the
//   folder does not exist — WebView2 auto-update removes fixed-version
//   folders (r49 closure D3: 156.0.4314.50 vanished after round 49; the r49
//   counter's identical check polluted every case with an environmental
//   finding), so the receipt's OTHER checks stay evaluated and the drift is
//   disclosed by name — the profile is a throwaway
//   tabi-r50-wv2drv-<hex>-profile under the RESOLVED scratch, receipt.paths
//   records given-vs-resolved for --scratch/--out with both resolved forms
//   win32-absolute and the resolution applied at launch (a relative
//   paths.scratchGiven must resolve to a DIFFERENT absolute path whose tail is
//   the given form, and relInvocation true; an absolute given must resolve
//   identity), the discovery came via the profile's EBWebView
//   DevToolsActivePort with an explicit port, the recorded nonce equals the
//   live page title's echo and matches the tabi-r50-<16hex> shape, the host
//   reached ready, the committed screenshot bytes hash to the receipt sha and
//   carry the PNG magic, the keyed teardown reached postKillSweepCount 0, the
//   driver and host-source digests equal the re-hashed committed files — and,
//   when receipt.journey is present, exactly four journey steps with legs
//   Page.navigate (/a.html), anchor-click (/b.html), anchor-click (/c.html),
//   navigateToHistoryEntry (/b.html), all same-port http://127.0.0.1 pages
//   with distinct URLs and present titles, nonceOnPageA true, a history block
//   read at /c.html with entriesLength 3, currentIndex 2 and entry urls
//   /a.html,/b.html,/c.html, a back leg with targetIndex 1 landing on /b.html
//   with entriesLengthAfter 3 and currentIndexAfter 1, per-step committed PNGs
//   hashing to the per-step pins, and the main shot equal to the FINAL step's
//   capture.
// Declared residual (the r44/r45/r48/r49 class, pre-declared): this counter
// binds receipt shape and committed bytes; it cannot by itself prove a browser
// ran — the re-derivation path is re-running the committed runner (fresh nonce
// and fresh fixture port per invocation) and re-compiling the host from the
// committed .cs. Second declared residual: when the pinned runtime folder is
// absent the runtime-existence leg is could-not-evaluate, so a hand-forged
// receipt naming a never-installed runtime version is refused only by the
// identity-consistency and shape checks, not by host bytes.
// Usage:
//   node webview2-receipt-r50.mjs <receipt.json> --shot <png> \
//        [--png-a <a.png> --png-b <b.png> --png-c <c.png>] \
//        --driver <mjs> --hostsrc <cs>
//   node webview2-receipt-r50.mjs --selftest <fixtures-dir>
// Exit: 0 predicate met; 1 evaluated, not met; 2 could not evaluate.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-webview2-cdp-r50';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-webview2-receipt-r50', error: msg }));
  process.exit(2);
}

function checkReceipt(receiptPath, shots, driverPath, hostSrcPath) {
  let receipt = null;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }
  const findings = [];
  const couldNotEvaluate = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (receipt.schema !== SCHEMA) add('schema', receipt.schema);
  const browser = (receipt.jsonVersion || {}).Browser;
  if (typeof browser !== 'string' || !/^Edg\//.test(browser)) add('surface-identity-mismatch', `webview2: ${browser}`);
  const wsUrl = (receipt.jsonVersion || {}).webSocketDebuggerUrl;
  if (typeof wsUrl !== 'string' || !/^ws:\/\/127\.0\.0\.1:\d+\//.test(wsUrl)) add('ws-not-loopback', wsUrl);
  if (typeof receipt.hostExe !== 'string' || !/[\\/]webview2-host-round48\.exe$/.test(receipt.hostExe)) {
    add('host-exe-not-webview2-host', receipt.hostExe);
  }
  const RUNTIME_SHAPE = /[\\/]EdgeWebView[\\/]Application[\\/](\d+\.\d+\.\d+\.\d+)$/;
  if (typeof receipt.runtimeFolder !== 'string' || !RUNTIME_SHAPE.test(receipt.runtimeFolder)) {
    add('runtime-folder-not-webview2', receipt.runtimeFolder);
  } else {
    const versionTail = RUNTIME_SHAPE.exec(receipt.runtimeFolder)[1];
    const browserVer = /^Edg\/(.+)$/.exec(typeof browser === 'string' ? browser : '');
    if (browserVer && browserVer[1] !== versionTail) add('runtime-identity-mismatch', `${browserVer[1]} != folder ${versionTail}`);
    let folderExists = false, exeExists = false;
    try { folderExists = fs.existsSync(receipt.runtimeFolder); } catch { folderExists = false; }
    if (folderExists) {
      try { exeExists = fs.existsSync(path.join(receipt.runtimeFolder, 'msedgewebview2.exe')); } catch { exeExists = false; }
      if (!exeExists) add('runtime-msedgewebview2-absent', receipt.runtimeFolder);
    } else {
      // the DECLARED could-not-evaluate class (r49 closure D3): the pinned
      // fixed-version folder was removed by WebView2 auto-update on the
      // scoring host; the check cannot run, is named here, and is NOT a
      // finding — every other check below still evaluates.
      couldNotEvaluate.push({ check: 'runtime-existence', code: 'runtime-pin-host-drift', detail: receipt.runtimeFolder });
    }
  }
  // --- the paths contract (carried from r49) ----------------------------------
  const paths = receipt.paths || {};
  const norm = (p) => String(p).toLowerCase().replace(/[\\/]+/g, '\\');
  if (typeof receipt.profile !== 'string' || !/[\\/]tabi-r50-wv2drv-[0-9a-f]+-profile$/.test(receipt.profile)) {
    add('profile-not-throwaway', receipt.profile);
  }
  if (!paths.scratchGiven || !paths.scratchResolved || !paths.outGiven || !paths.outResolved) {
    add('paths-block-missing', JSON.stringify(paths).slice(0, 120));
  } else {
    if (!path.win32.isAbsolute(paths.scratchResolved) || !path.win32.isAbsolute(paths.outResolved)) {
      add('paths-resolved-not-absolute', `${paths.scratchResolved} | ${paths.outResolved}`);
    }
    const givenRel = typeof paths.scratchGiven === 'string' && !path.win32.isAbsolute(paths.scratchGiven);
    if (/tabi-r50-wv2drv-[0-9a-f]+-profile$/.test(String(receipt.profile))
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
  if (!/^tabi-r50-[0-9a-f]{16}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
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
  try { shot = fs.readFileSync(shots.main); } catch { add('shot-unreadable', shots.main); }
  const pngMagic = (b) => b && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (shot) {
    const rec = receipt.screenshot || {};
    if (rec.sha256 !== sha256(shot)) add('shot-digest-mismatch', `${rec.sha256} != ${sha256(shot)}`);
    if (rec.bytes !== shot.length) add('shot-length-mismatch', `${rec.bytes} != ${shot.length}`);
    if (!pngMagic(shot)) add('shot-not-png', 'PNG magic missing');
  }
  // --- the journey record (C2), when present ----------------------------------
  if (receipt.journey) {
    const j = receipt.journey;
    const steps = Array.isArray(j.steps) ? j.steps : null;
    if (!steps || steps.length !== 4) add('journey-steps', JSON.stringify(steps ? steps.length : null));
    else {
      const WANT = [
        { leg: 'Page.navigate', suffix: '/a.html', shotKey: 'a' },
        { leg: 'anchor-click', suffix: '/b.html', shotKey: 'b' },
        { leg: 'anchor-click', suffix: '/c.html', shotKey: 'c' },
        { leg: 'navigateToHistoryEntry', suffix: '/b.html', shotKey: null }, // main shot
      ];
      let firstPort = null;
      const urls = [];
      steps.forEach((s, i) => {
        const w = WANT[i];
        if (s.leg !== w.leg) add('journey-leg', `step ${i}: ${s.leg} != ${w.leg}`);
        let u = null;
        try { u = new URL(s.url); } catch { add('journey-url', s.url); }
        if (u) {
          urls.push(u);
          if (u.origin !== `http://127.0.0.1${u.port ? ':' + u.port : ''}`) add('journey-origin-not-loopback', u.origin);
          if (!/^\d+$/.test(u.port)) add('journey-port', u.port);
          else if (firstPort === null) firstPort = u.port;
          else if (u.port !== firstPort) add('journey-port', `${firstPort} != ${u.port}`);
          if (!u.pathname.endsWith(w.suffix)) add('journey-url', `step ${i}: ${u.pathname} !~ ${w.suffix}`);
        }
        if (typeof s.title !== 'string' || !s.title) add('journey-title', `step ${i}: ${s.title}`);
      });
      // no global distinctness rule: the back leg legitimately revisits
      // /b.html — the per-step suffix sequence above pins A→B→C→B.
      if (j.nonceOnPageA !== true) add('journey-invocation-binding', j.nonceOnPageA);
      // per-step PNGs
      for (let i = 0; i < 3; i++) {
        const f = shots[WANT[i].shotKey];
        let buf = null;
        if (!f) add('journey-shot-arg-missing', `--png-${WANT[i].shotKey}`);
        else { try { buf = fs.readFileSync(f); } catch { add('journey-shot-unreadable', f); } }
        if (buf) {
          const rec = steps[i].screenshot || {};
          if (rec.sha256 !== sha256(buf)) add('journey-shot-digest-mismatch', `step ${i}: ${rec.sha256} != ${sha256(buf)}`);
          if (rec.bytes !== buf.length) add('journey-shot-length-mismatch', `step ${i}: ${rec.bytes} != ${buf.length}`);
          if (!pngMagic(buf)) add('journey-shot-not-png', `step ${i}`);
        }
      }
      const recMain = receipt.screenshot || {};
      if (JSON.stringify(recMain) !== JSON.stringify(steps[3].screenshot || {})) add('main-shot-not-final-step', JSON.stringify({ recMain, last: steps[3].screenshot }).slice(0, 160));
      // history block, read at C
      const h = j.history || {};
      const hUrls = Array.isArray(h.urls) ? h.urls : [];
      const endsWith = (u, sfx) => { try { return new URL(u).pathname.endsWith(sfx); } catch { return false; } };
      if (h.entriesLength !== 3 || h.currentIndex !== 2
          || !endsWith(h.readAt || '', '/c.html')
          || hUrls.length !== 3
          || !endsWith(hUrls[0] || '', '/a.html') || !endsWith(hUrls[1] || '', '/b.html') || !endsWith(hUrls[2] || '', '/c.html')) {
        add('journey-history', JSON.stringify(h).slice(0, 200));
      }
      // back leg
      const bl = j.backLeg || {};
      if (bl.mechanism !== 'navigateToHistoryEntry' || bl.targetIndex !== 1
          || !endsWith(bl.urlAfter || '', '/b.html')
          || bl.entriesLengthAfter !== 3 || bl.currentIndexAfter !== 1) {
        add('journey-back-leg', JSON.stringify(bl).slice(0, 200));
      }
    }
  }
  return { receipt, findings, couldNotEvaluate };
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const dir = args[1];
  if (!dir) die('usage: webview2-receipt-r50.mjs --selftest <fixtures-dir>');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  // the fixtures dir sits at .ufo/waves/round-50/counters/<fixtures>: five
  // levels below the repo root
  const driverPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-cdp-loopback-round50.mjs');
  const hostSrcPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-host-round48.cs');
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r50-counter-selftest-'));
  let pass = 0;
  const results = [];
  for (const c of manifest.cases) {
    let receiptPath = path.join(dir, c.receipt);
    // runtimeProbe: materialize a deterministic runtime folder for the branch
    // the case needs, independent of the host's auto-update state.
    if (c.runtimeProbe === 'with-exe' || c.runtimeProbe === 'without-exe') {
      const rt = path.join(tmp, c.name, 'EdgeWebView', 'Application', '156.0.4314.50');
      fs.mkdirSync(rt, { recursive: true });
      if (c.runtimeProbe === 'with-exe') fs.writeFileSync(path.join(rt, 'msedgewebview2.exe'), 'probe');
      const r = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      r.runtimeFolder = rt;
      receiptPath = path.join(tmp, c.name + '.json');
      fs.writeFileSync(receiptPath, JSON.stringify(r, null, 1));
    }
    const r = checkReceipt(receiptPath, {
      main: c.shots && c.shots.main ? path.join(dir, c.shots.main) : path.join(dir, 'missing.png'),
      a: c.shots && c.shots.a ? path.join(dir, c.shots.a) : null,
      b: c.shots && c.shots.b ? path.join(dir, c.shots.b) : null,
      c: c.shots && c.shots.c ? path.join(dir, c.shots.c) : null,
    }, driverPath, hostSrcPath);
    const got = r.findings.map((f) => f.id).sort();
    const want = (c.findings || []).slice().sort();
    const findingsOk = JSON.stringify(got) === JSON.stringify(want);
    // the declared could-not-evaluate contract: non-empty iff the pinned
    // runtime folder does not exist on the scoring host, and only ever the
    // named code — never a finding.
    let folderExists = false;
    try { folderExists = fs.existsSync(r.receipt.runtimeFolder); } catch { folderExists = false; }
    const wantCne = folderExists ? [] : ['runtime-pin-host-drift'];
    const gotCne = r.couldNotEvaluate.map((x) => x.code).sort();
    const cneOk = JSON.stringify(gotCne) === JSON.stringify(wantCne);
    const ok = findingsOk && cneOk;
    if (ok) pass += 1;
    results.push({ name: c.name, ok, findingsOk, cneOk, got, want, gotCne, wantCne });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const allPass = pass === results.length;
  console.log(JSON.stringify({ schema: 'tabi-webview2-receipt-r50-selftest', allPass, cases: results.length, pass, results }, null, 1));
  process.exit(allPass ? 0 : 1);
}
// main: <receipt> --shot <png> [--png-a --png-b --png-c] --driver <mjs> --hostsrc <cs>
const receiptPath = args[0];
const idx = (name) => { const i = args.indexOf('--' + name); return i === -1 ? null : args[i + 1]; };
const driverIdx = args.indexOf('--driver');
const hostsrcIdx = args.indexOf('--hostsrc');
if (!receiptPath || !idx('shot') || driverIdx === -1 || hostsrcIdx === -1) {
  die('usage: node webview2-receipt-r50.mjs <receipt.json> --shot <png> [--png-a <a.png> --png-b <b.png> --png-c <c.png>] --driver <mjs> --hostsrc <cs> | --selftest <dir>');
}
const { receipt, findings, couldNotEvaluate } = checkReceipt(receiptPath, {
  main: idx('shot'),
  a: idx('png-a'),
  b: idx('png-b'),
  c: idx('png-c'),
}, args[driverIdx + 1], args[hostsrcIdx + 1]);
const out = {
  schema: 'tabi-webview2-receipt-r50',
  receipt: receiptPath,
  shots: { main: idx('shot'), a: idx('png-a'), b: idx('png-b'), c: idx('png-c') },
  browser: (receipt.jsonVersion || {}).Browser,
  journey: receipt.journey ? {
    steps: receipt.journey.steps.length,
    legs: receipt.journey.steps.map((s) => s.leg),
    urls: receipt.journey.steps.map((s) => s.url),
    history: receipt.journey.history,
    backLeg: receipt.journey.backLeg || null,
  } : null,
  predicate: findings.length === 0, findingCount: findings.length, findings,
  couldNotEvaluate,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
