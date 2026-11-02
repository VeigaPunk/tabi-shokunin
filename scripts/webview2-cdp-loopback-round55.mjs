#!/usr/bin/env node
// webview2-cdp-loopback-round55.mjs — tabi round 55, claim C2 (coverage:
// capability extension — the r54 planned residual: the KEY-DOMAIN control
// keys on the trace — Backspace edit, Tab focus traversal, Enter keyboard
// submit — each with a page-side DOM witness).
//
// Round 55 deltas vs the committed r54 runner (everything else
// structure-identical):
//   (1) the form fixture page (/form.html) now carries an INLINE KEYDOWN
//       RECORDER: a page-side script pushes every DOM keydown event's
//       {key, code, ctrlKey, altKey, metaKey, shiftKey, keyCode} onto
//       window.__keylog as it is delivered. The runner reads the full
//       record back after the fill (journey.form.pageKeylog) — the PAGE'S
//       OWN witness of what arrived, independent of the runner's dispatch
//       log. The counter re-derives the complete expected record from the
//       receipt's own nonce and compares entry by entry.
//   (2) --form now ALSO drives the CHORD-DOMAIN leg (the r53 planned
//       residual): after the r52 plain trace and the r53 Shift-chord
//       trace, the runner focuses the form's third field (#field3, no
//       name attribute — it is never submitted) and dispatches three
//       real modifier chords derived from the nonce: Control (modifiers
//       2), Alt (modifiers 1) and Meta (modifiers 4 — S153's
//       Input.dispatchKeyEvent modifiers bit field: Alt=1, Ctrl=2,
//       Meta/Command=4, Shift=8). Each chord is modifier keyDown + the
//       derived letter's keyDown/keyUp (no text param — a modifier chord
//       inserts nothing, and the field's DOM value staying EMPTY is part
//       of the witness) + modifier keyUp (12 key events total). The
//       derived letter is the first [a-f] character of the nonce's hex
//       tail (re-derivable by the counter from the receipt's own nonce).
//       Per chord, the two DOM keydown records the page captured are
//       read back into the receipt (journey.form.chordDomain.chords[]
//       .domEvents) — the CDP modifier bit <-> DOM boolean correspondence
//       (bit 2 <-> ctrlKey, bit 1 <-> altKey, bit 4 <-> metaKey) is the
//       round's measured ground; S153 grounds the bits, the UI Events
//       spec (S161, opened this round) grounds the DOM booleans.
//   (3) --form now ALSO drives the CONTROL-DOMAIN leg (the r54 planned
//       residual, appended after the chord-domain leg and BEFORE the
//       submit): End — the caret-anchor MOVEMENT key — is dispatched into
//       #field first (the pre-freeze smoke run caught the caret defect: a
//       mouse click into a NON-EMPTY field places the caret at the click
//       point, not the end — red control c2-smoke-caret-midtext-red.json —
//       so every caret-sensitive key below is anchored by End first); its
//       own witness is the keylog entry PLUS the negative edit witness
//       (the field's DOM value read back after End must be UNCHANGED).
//       Backspace — the edit key — is dispatched into #field; the field's
//       DOM value is read back and must be EXACTLY the nonce minus its
//       last character; the removed character is then re-typed (its real
//       keyDown/keyUp pair with the text param) and the value is witnessed
//       RESTORED to the nonce, so the submitted query stays the
//       invocation-bound pair. Tab — the focus key — is dispatched; the
//       page's OWN document.activeElement witness is read before/after and
//       must move #field -> #field2. Enter — the keyboard submit — is
//       dispatched FROM THE TABBED-TO FIELD (#field2): the implicit
//       submission navigates to /echo?field=<nonce>&mixed=<uppercased
//       nonce>, witnessed by the same server-side (fixture served log) +
//       client-side (echo page render) pair as the r54 button click.
//       DISCLOSED ASYMMETRY: the Enter keydown's own DOM record is NOT
//       witnessed — the implicit submission navigates the document and the
//       keylog dies with it — so the page keylog carries EXACTLY FOUR new
//       entries over r54 (the End keydown, the Backspace keydown, the
//       restored character's keydown, the Tab keydown) and the SUBMISSION
//       ITSELF is the Enter witness. The page keylog is read after the Tab
//       leg and before the Enter dispatch.
//   (4) The runtime contract is unchanged: --runtime MUST be passed
//       explicitly (auto-update drift is the standing host condition); the
//       nonce/profile/token prefixes move to tabi-r55 so cross-generation
//       receipts refuse by shape.
//
// Usage:
//   node scripts/webview2-cdp-loopback-round55.mjs --runtime <runtimeDir>
//        --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json>
//        [--csc <csc.exe>] [--journey] [--form]
//   node scripts/webview2-cdp-loopback-round55.mjs --path-selftest
// Exit: 0 receipt written and every step green; 1 a step failed (receipt still
// written with the failure recorded); 2 usage / selftest failure.
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DEFAULT_LOADER = 'C:/Program Files/WSL/wslsettings/WebView2Loader.dll';
const DEFAULT_CSC = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? null : argv[i + 1];
};
const hasFlag = (name) => argv.includes('--' + name);
const selfPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(selfPath), '..');
const hostSrc = path.join(repoRoot, 'scripts', 'webview2-host-round48.cs');

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// --- path resolution at launch (the r49 contract, unchanged) -----------------
function resolveAtLaunch(p) {
  return { given: p, resolved: path.resolve(p) };
}

// --- --path-selftest: the resolver, unit-tested without a browser -----------
if (hasFlag('path-selftest')) {
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r55-pathselftest-'));
  const cases = [];
  const t = (name, fn) => {
    try { fn(); cases.push({ name, ok: true }); }
    catch (e) { cases.push({ name, ok: false, error: String(e && e.message || e) }); }
  };
  t('relative-scratch-resolves-absolute', () => {
    const r = resolveAtLaunch('rel-scratch-sub');
    if (!path.win32.isAbsolute(r.resolved)) throw new Error('not absolute: ' + r.resolved);
    if (!r.resolved.toLowerCase().endsWith('rel-scratch-sub')) throw new Error('tail lost: ' + r.resolved);
  });
  t('absolute-scratch-is-identity', () => {
    const abs = path.win32.normalize('C:\\temp\\tabi-r50-abs');
    const r = resolveAtLaunch(abs);
    if (path.resolve(r.resolved) !== path.resolve(abs)) throw new Error('not identity: ' + r.resolved);
  });
  t('profile-stays-under-resolved-scratch', () => {
    const r = resolveAtLaunch('nested/scratch');
    const profile = path.join(r.resolved, 'tabi-r55-wv2drv-abcd123456-profile');
    if (!profile.toLowerCase().startsWith(r.resolved.toLowerCase())) throw new Error('profile outside scratch');
    if (!path.win32.isAbsolute(profile)) throw new Error('profile not absolute');
  });
  t('double-resolution-stable', () => {
    const r1 = resolveAtLaunch('a/b/c');
    const r2 = resolveAtLaunch(r1.resolved);
    if (path.resolve(r1.resolved) !== path.resolve(r2.resolved)) throw new Error('unstable');
  });
  t('out-and-shot-resolve-together', () => {
    const r = resolveAtLaunch('out/recv.json');
    const shot = r.resolved.replace(/\.json$/, '') + '.png';
    if (!path.win32.isAbsolute(shot)) throw new Error('shot not absolute');
    if (!shot.toLowerCase().endsWith('recv.json.png') && !shot.toLowerCase().endsWith('recv.png') && !shot.toLowerCase().endsWith('.png')) throw new Error('shot tail lost');
  });
  t('dotdot-normalizes-away', () => {
    const r = resolveAtLaunch('a/../b');
    const segs = r.resolved.split(/[\\/]/);
    if (segs.includes('..') || segs.includes('a')) throw new Error('.. kept: ' + r.resolved);
    if (segs[segs.length - 1] !== 'b') throw new Error('tail: ' + r.resolved);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  const allPass = cases.every((c) => c.ok);
  console.log(JSON.stringify({ schema: 'tabi-webview2-cdp-r55-path-selftest', allPass, cases: cases.length, pass: cases.filter((c) => c.ok).length, cases }, null, 1));
  process.exit(allPass ? 0 : 1);
}

const scratchR = resolveAtLaunch(opt('scratch'));
const outR = resolveAtLaunch(opt('out'));
const runtimeArg = opt('runtime');
const loaderDll = path.win32.normalize(opt('loader') || DEFAULT_LOADER);
const cscExe = opt('csc') || DEFAULT_CSC;
const journeyMode = hasFlag('journey') || hasFlag('form');
const formMode = hasFlag('form');
if (!scratchR.given || !outR.given || !runtimeArg) {
  console.error('usage: node webview2-cdp-loopback-round55.mjs --runtime <dir> --loader <dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>] [--journey] | --path-selftest');
  process.exit(2);
}
const runtimeFolder = path.win32.normalize(runtimeArg);
const scratchDir = scratchR.resolved;
const outReceipt = outR.resolved;

const nonce = `tabi-r55-${crypto.randomBytes(8).toString('hex')}`;
const token = `tabi-r55-wv2drv-${crypto.randomBytes(5).toString('hex')}`;
const profile = path.join(scratchDir, `${token}-profile`);
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });

const receipt = {
  schema: 'tabi-webview2-cdp-r55',
  generatedBy: 'scripts/webview2-cdp-loopback-round55.mjs',
  driverSha256: sha256(fs.readFileSync(selfPath)),
  hostCsSha256: sha256(fs.readFileSync(hostSrc)),
  hostCsPath: 'scripts/webview2-host-round48.cs',
  runtimeFolder,
  loaderDll,
  loaderSha256: sha256(fs.readFileSync(loaderDll)),
  cscExe,
  nonce,
  token,
  profile,
  paths: {
    scratchGiven: scratchR.given,
    scratchResolved: scratchDir,
    outGiven: outR.given,
    outResolved: outReceipt,
    relInvocation: !path.win32.isAbsolute(scratchR.given),
    resolvedBy: 'path.resolve at launch (r49 contract carried; S157 primitives; the UDF anchors at the host exe directory — S160)',
  },
  journeyMode,
  steps: [],
  failures: [],
};
const note = (step, o) => { receipt.steps.push({ step, ...o }); console.error(JSON.stringify({ step, ...o })); };
const fail = (step, o) => { receipt.failures.push({ step, ...o }); note('FAIL ' + step, o); };

// --- inline loopback fixture server (journey mode): three static pages ------
// The nonce rides on every page (a #nonce marker), so the invocation binding
// survives the whole journey; anchors are the only links between pages.
const mkPage = (letter, title, anchors) => `<!doctype html><html><head><title>tabi-r55 journey fixture ${title}</title></head>` +
  `<body><h1 id="pg">fixture-page-${letter}</h1><p id="nonce">${nonce}</p>` +
  anchors +
  `</body></html>`;
// The form page carries the round-54 inline keydown recorder: every DOM
// keydown delivered to the page is pushed onto window.__keylog with its
// modifier booleans — the page's OWN record of what arrived, read back by
// the runner after the fill and re-derived by the counter from the nonce.
// #field3 has NO name attribute: it is never submitted; it is the chord-
// domain leg's focus target only.
const mkFormPage = () => `<!doctype html><html><head><title>tabi-r55 form fixture</title>` +
  `<script>window.__keylog=[];document.addEventListener('keydown',function(e){window.__keylog.push({key:e.key,code:e.code,ctrlKey:e.ctrlKey===true,altKey:e.altKey===true,metaKey:e.metaKey===true,shiftKey:e.shiftKey===true,keyCode:e.keyCode});});</script>` +
  `</head>` +
  `<body><h1 id="pg">fixture-page-F</h1><p id="nonce">${nonce}</p>` +
  `<form id="f" method="GET" action="/echo">` +
  `<input id="field" name="field" value="" size="40">` +
  `<input id="field2" name="mixed" value="" size="40">` +
  `<input id="field3" value="" size="40">` +
  `<button id="go" type="submit">go</button>` +
  `</form></body></html>`;
const PAGES = {
  '/a.html': mkPage('A', 'A', '<a id="next" href="/b.html">next page</a>'),
  '/b.html': mkPage('B', 'B', '<a id="next" href="/c.html">next page</a> <a id="form" href="/form.html">form page</a>'),
  '/c.html': mkPage('C', 'C', ''),
  '/form.html': mkFormPage(),
};
let fixtureServer = null;
let fixture = null;
if (journeyMode) {
  fixtureServer = (await import('node:http')).createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname === '/echo') {
      // the echo endpoint: the SERVER-SIDE witness of the form submit. The
      // received field is rendered back into the page (#echoed) so the client
      // DOM and the server log carry the same value independently.
      const field = u.searchParams.get('field') || '';
      const mixed = u.searchParams.get('mixed') || '';
      fixture.served.push(req.url);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html><head><title>tabi-r55 echo</title></head><body><h1 id="pg">echo</h1><p id="echoed">${field}</p><p id="mixed-echoed">${mixed}</p></body></html>`);
      return;
    }
    const body = PAGES[req.url] || PAGES['/a.html'];
    fixture.served.push(req.url);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  });
  await new Promise((res) => fixtureServer.listen(0, '127.0.0.1', res));
  fixture = { host: '127.0.0.1', port: fixtureServer.address().port, served: [] };
  receipt.fixture = fixture;
  note('fixture-listening', { url: `http://127.0.0.1:${fixture.port}/a.html` });
}

// --- compile the committed host if the exe is not already in the scratch ---
const hostExe = path.join(scratchDir, 'webview2-host-round48.exe');
let compile = null;
if (!fs.existsSync(hostExe)) {
  compile = spawnSync(cscExe, [
    '-nologo', '-target:exe', '-out:' + hostExe,
    '-r:System.Windows.Forms.dll', '-r:System.Drawing.dll',
    hostSrc,
  ], { encoding: 'utf8' });
  receipt.compile = { cscExe, status: compile.status, stdout: (compile.stdout || '').slice(0, 400), stderr: (compile.stderr || '').slice(0, 400) };
  if (compile.status !== 0) {
    fail('host-compile', { status: compile.status, stderr: (compile.stderr || '').slice(0, 300) });
    fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
    process.exit(1);
  }
  note('host-compiled', { hostExe });
} else {
  note('host-exe-reused', { hostExe });
}
receipt.hostExe = hostExe;
receipt.hostExeSha256 = sha256(fs.readFileSync(hostExe));

// --- spawn the host with the documented debugging env vars ------------------
const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(
  `<!doctype html><html><head><title>${nonce}</title></head><body><h1 id="n">${nonce}</h1></body></html>`);
const autoCloseMs = 60000;
const host = spawn(hostExe, [runtimeFolder, loaderDll, url, String(autoCloseMs)], {
  env: {
    ...process.env,
    WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=0',
    WEBVIEW2_USER_DATA_FOLDER: path.win32.normalize(profile),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
receipt.hostPid = host.pid;
note('host-spawned', { pid: host.pid });
let hostStdout = '';
host.stdout.on('data', (c) => { hostStdout += c.toString(); });
let hostStderr = '';
host.stderr.on('data', (c) => { if (hostStderr.length < 4000) hostStderr += c.toString(); });

// --- discovery: EBWebView\DevToolsActivePort under the throwaway profile ---
let port = null, discoveryMs = null;
const portFiles = [
  path.join(profile, 'EBWebView', 'DevToolsActivePort'),
  path.join(profile, 'DevToolsActivePort'),
];
const t0 = Date.now();
for (let i = 0; i < 60 && !port; i++) {
  await sleep(250);
  for (const f of portFiles) {
    if (fs.existsSync(f)) {
      port = fs.readFileSync(f, 'utf8').split('\n')[0].trim();
      discoveryMs = Date.now() - t0;
      break;
    }
  }
}
receipt.discovery = { port, discoveryMs, via: 'devtools-active-port-webview-ebwebview' };
if (!port) fail('no-devtools-active-port', { waitedMs: Date.now() - t0 });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

if (port) {
  try {
    const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    receipt.jsonVersion = ver;
    note('json-version', { Browser: ver.Browser });
    // the initial data: page target is POLLED, not read once: the first live
    // run at the freeze bytes hit the race (the single target was still
    // about:blank when /json/list was read — exit 1, no-page-target; the red
    // receipt is kept at .ufo/waves/round-50/controls/), so the target list
    // is polled until the data: page target appears, bounded.
    let page = null, targets = [], pollAttempts = 0;
    for (let i = 0; i < 40 && !page; i++) {
      targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      pollAttempts = i + 1;
      page = (Array.isArray(targets) ? targets : []).find((t) => t.type === 'page' && t.url.startsWith('data:'));
      if (!page) await sleep(250);
    }
    receipt.pageTargetCount = Array.isArray(targets) ? targets.length : -1;
    receipt.targetPoll = {
      attempts: pollAttempts,
      found: !!page,
      observedTargets: (Array.isArray(targets) ? targets : []).slice(0, 4).map((t) => ({ type: t.type, url: String(t.url).slice(0, 60) })),
    };
    if (!page || !page.webSocketDebuggerUrl) {
      fail('no-page-target', { count: receipt.pageTargetCount, polled: pollAttempts });
    } else {
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
      let mid = 0;
      const pending = new Map();
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
      };
      const send = (method, params = {}) => new Promise((res, rej) => {
        const id = ++mid;
        pending.set(id, res);
        ws.send(JSON.stringify({ id, method, params }));
        setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('cdp timeout ' + method)); } }, 20000);
      });
      const evalStr = async (expression) => {
        const rs = await send('Runtime.evaluate', { expression, returnByValue: true });
        return rs.result && rs.result.result ? rs.result.result.value : undefined;
      };
      for (let i = 0; i < 20; i++) {
        if (await evalStr('document.readyState') === 'complete') break;
        await sleep(250);
      }
      receipt.nonceEcho = await evalStr('document.title');
      receipt.invocationBound = receipt.nonceEcho === nonce;
      note('runtime-evaluate', { titleEcho: receipt.nonceEcho, matches: receipt.invocationBound });

      const capture = async () => {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        if (!shot.result || !shot.result.data) throw new Error('capture-screenshot: ' + JSON.stringify(shot).slice(0, 160));
        return Buffer.from(shot.result.data, 'base64');
      };

      if (!journeyMode) {
        const png = await capture();
        const shotPath = outReceipt.replace(/\.json$/, '') + '.png';
        fs.writeFileSync(shotPath, png);
        receipt.screenshot = { path: shotPath, bytes: png.length, sha256: sha256(png) };
        note('capture-screenshot', { bytes: png.length });
      } else {
        // --- C2: the multi-step journey over the loopback fixture -----------
        const base = `http://127.0.0.1:${fixture.port}`;
        const journey = { mechanism: formMode ? 'anchor-click+navigateToHistoryEntry+form-submit' : 'anchor-click+navigateToHistoryEntry', steps: [], fixturePages: formMode ? 4 : 3 };
        const waitPath = async (suffix, extraExpr) => {
          for (let i = 0; i < 40; i++) {
            const href = String(await evalStr('location.href') || '');
            const ready = (await evalStr('document.readyState')) === 'complete';
            const extra = extraExpr ? (await evalStr(extraExpr)) : true;
            if (href.endsWith(suffix) && ready && extra) return true;
            await sleep(250);
          }
          return false;
        };
        const recordStep = async (leg, suffix, pngName) => {
          const png = await capture();
          const shotPath = outReceipt.replace(/\.json$/, '') + `-${pngName}.png`;
          fs.writeFileSync(shotPath, png);
          const stepRec = {
            leg,
            url: await evalStr('location.href'),
            title: await evalStr('document.title'),
            nonceMarker: await evalStr('(document.getElementById("nonce")||{}).textContent') || null,
            screenshot: { path: shotPath, bytes: png.length, sha256: sha256(png) },
          };
          journey.steps.push(stepRec);
          note('journey-step', { leg, url: stepRec.url, title: stepRec.title, bytes: png.length });
          return stepRec;
        };
        // leg 1 — Page.navigate to /a.html (S161 primitives ground the history
        // legs; the typed navigation is the same Page.navigate the r49 nav used)
        await send('Page.navigate', { url: `${base}/a.html` });
        if (!await waitPath('/a.html')) fail('journey-page-a-not-ready', {});
        const stepA = await recordStep('Page.navigate', '/a.html', 'journey-a');
        journey.nonceOnPageA = stepA.nonceMarker === nonce;
        // leg 2 — the page's OWN anchor click to /b.html
        await evalStr(`document.getElementById('next').click()`);
        if (!await waitPath('/b.html')) fail('journey-page-b-not-ready', {});
        await recordStep('anchor-click', '/b.html', 'journey-b');
        // leg 3 — anchor click to /c.html, then read the history AT C
        await evalStr(`document.getElementById('next').click()`);
        if (!await waitPath('/c.html')) fail('journey-page-c-not-ready', {});
        const stepC = await recordStep('anchor-click', '/c.html', 'journey-c');
        const histAtC = await send('Page.getNavigationHistory');
        const histC = histAtC.result || {};
        journey.history = {
          entriesLength: (histC.entries || []).length,
          currentIndex: histC.currentIndex,
          urls: (histC.entries || []).map((e) => e.url),
          readAt: stepC.url,
        };
        // leg 4 — back-navigation via Page.navigateToHistoryEntry to the /b.html
        // entry. MEASURED SURFACE MODEL (the first --journey live run at the
        // pre-amendment bytes mispredicted this — receipt kept at
        // controls/c2-journey-history-model-red.json): the initial data: page
        // OCCUPIES history slot 0, so the entries at C are [data:, a, b, c]
        // (entriesLength 4, currentIndex 3) and the /b.html entry is index 2.
        const target = (histC.entries || [])[2];
        if (!target) {
          fail('journey-back-target-missing', { entries: journey.history.entriesLength });
        } else {
          journey.backLeg = { mechanism: 'navigateToHistoryEntry', targetIndex: 2, targetEntryId: target.id, targetUrl: target.url };
          await send('Page.navigateToHistoryEntry', { entryId: target.id });
          if (!await waitPath('/b.html', 'document.title')) fail('journey-back-not-ready', {});
          const stepBack = await recordStep('navigateToHistoryEntry', '/b.html', 'journey-b-back');
          journey.backLeg.urlAfter = stepBack.url;
          journey.backLeg.titleAfter = stepBack.title;
          const histAfter = (await send('Page.getNavigationHistory')).result || {};
          journey.backLeg.entriesLengthAfter = (histAfter.entries || []).length;
          journey.backLeg.currentIndexAfter = histAfter.currentIndex;
        }
        // --- legs 5+6 (formMode): the form-interaction residual --------------
        // The r49/r50 planned residual: fill + submit on the fixture, driven
        // with the CDP Input domain (S153 Input.insertText /
        // Input.dispatchMouseEvent): a real mouse click into the field,
        // Input.insertText of the invocation-bound nonce, the value read back
        // from the DOM, a second mouse click on the form's own submit button,
        // the GET navigation to /echo witnessed SERVER-SIDE (fixture served
        // log) and CLIENT-SIDE (the echo page renders the received value).
        if (formMode) {
          const waitEcho = async () => {
            for (let i = 0; i < 40; i++) {
              const href = String(await evalStr('location.href') || '');
              const ready = (await evalStr('document.readyState')) === 'complete';
              if (href.includes('/echo?field=') && ready) return true;
              await sleep(250);
            }
            return false;
          };
          const clickAt = async (x, y) => {
            for (const type of ['mousePressed', 'mouseReleased']) {
              await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
            }
          };
          const centerOf = (id) => evalStr(`(() => { const b = document.getElementById('${id}').getBoundingClientRect(); return [Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2)]; })()`);
          // leg 5 — the /b.html page's own anchor to the form page
          await evalStr(`document.getElementById('form').click()`);
          if (!await waitPath('/form.html')) fail('journey-form-page-not-ready', {});
          const stepForm = await recordStep('anchor-click', '/form.html', 'journey-form');
          const form = { mechanism: 'dispatchKeyEvent+shift-chords+chord-domain+control-domain+enter-submit' };
          form.nonceOnFormPage = stepForm.nonceMarker === nonce;
          // leg 6 — the PER-KEY typing trace (the r52 fill mechanism): after
          // the same real mouse click into the field, every nonce character
          // rides a real Input.dispatchKeyEvent keyDown (with per-character
          // text/key/code/windowsVirtualKeyCode) + keyUp pair, and the field's
          // DOM value is read back after EACH keystroke — the per-key prefix
          // witness (value after keystroke i must be the nonce prefix of
          // length i+1). S153's Input.dispatchKeyEvent description is the
          // round's located ground (re-opened byte-identical a SIXTH time
          // this round; the bits ride the same description).
          const vkFor = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch) : /[a-z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 97) : ch === '-' ? 189 : null);
          const codeFor = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch : /[a-z]/.test(ch) ? 'Key' + ch.toUpperCase() : ch === '-' ? 'Minus' : null);
          const [fx, fy] = await centerOf('field');
          await clickAt(fx, fy);
          form.valueBeforeFirstKey = await evalStr(`document.getElementById('field').value`);
          form.typing = [];
          let keyEvents = 0;
          for (let i = 0; i < nonce.length; i++) {
            const ch = nonce[i];
            const vk = vkFor(ch), code = codeFor(ch);
            if (vk === null || code === null) { fail('keyevent-mapping-missing', { i, ch }); break; }
            await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: ch, text: ch, unmodifiedText: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
            keyEvents++;
            await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
            keyEvents++;
            const valueAfter = await evalStr(`document.getElementById('field').value`);
            form.typing.push({ i, char: ch, code, windowsVirtualKeyCode: vk, valueAfter });
          }
          form.keyEventCount = keyEvents;
          form.fieldValueAfterTyping = await evalStr(`document.getElementById('field').value`);
          form.filledValue = nonce;
          form.allPrefixTrue = form.typing.length === nonce.length
            && form.typing.every((t, i) => t.valueAfter === nonce.slice(0, i + 1));
          // --- the round-53 modifier-chord leg (the r52 planned residual):
          // the mixed-case value (the invocation-bound nonce, uppercased)
          // typed into the form's SECOND field with real Shift chords — for
          // every uppercase letter a real Shift keyDown/keyUp rides around
          // the letter's keyDown/keyUp pair (the letter's event carries
          // modifiers: 8 — S153's dispatchKeyEvent modifiers bit field,
          // Shift=8 — and the shifted key/text); digits and '-' type
          // unshifted. The DOM value of #field2 is read back after EACH
          // keystroke (the per-keystroke prefix witness on the chord
          // trace). The plain r52 typing trace into #field above is
          // unchanged.
          const mixed = nonce.toUpperCase();
          const vkForChord = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch) : /[A-Z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 65) : ch === '-' ? 189 : null);
          const codeForChord = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch : /[A-Z]/.test(ch) ? 'Key' + ch : ch === '-' ? 'Minus' : null);
          const [f2x, f2y] = await centerOf('field2');
          await clickAt(f2x, f2y);
          const chords = { value: mixed, valueBeforeFirstKey: await evalStr(`document.getElementById('field2').value`), typing: [] };
          let chordEvents = 0;
          const shiftKey = async (down) => {
            await send('Input.dispatchKeyEvent', down
              ? { type: 'keyDown', modifiers: 8, key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16 }
              : { type: 'keyUp', modifiers: 8, key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16 });
            chordEvents++;
          };
          for (let i = 0; i < mixed.length; i++) {
            const ch = mixed[i];
            const vk = vkForChord(ch), code = codeForChord(ch);
            if (vk === null || code === null) { fail('chord-mapping-missing', { i, ch }); break; }
            const shiftRide = /[A-Z]/.test(ch);
            if (shiftRide) await shiftKey(true);
            await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: shiftRide ? 8 : 0, key: ch, text: ch, unmodifiedText: shiftRide ? ch.toLowerCase() : ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
            chordEvents++;
            await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: shiftRide ? 8 : 0, key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
            chordEvents++;
            if (shiftRide) await shiftKey(false);
            const valueAfter = await evalStr(`document.getElementById('field2').value`);
            chords.typing.push({ i, char: ch, code, windowsVirtualKeyCode: vk, shiftRide, modifiers: shiftRide ? 8 : 0, valueAfter });
          }
          chords.keyEventCount = chordEvents;
          chords.fieldValueAfterTyping = await evalStr(`document.getElementById('field2').value`);
          chords.allPrefixTrue = chords.typing.length === mixed.length
            && chords.typing.every((t, i) => t.valueAfter === mixed.slice(0, i + 1));
          form.chords = chords;
          form.keylogLengthAfterShiftChords = await evalStr(`window.__keylog.length`);
          // --- the round-54 chord-domain leg (the r53 planned residual):
          // the Ctrl/Alt/Meta modifier domain (S153's modifiers bit field:
          // Alt=1, Ctrl=2, Meta/Command=4 — Shift=8 rode in r53). The
          // derived letter is the FIRST [a-f] character of the nonce's hex
          // tail (counter-re-derivable); each chord is modifier keyDown +
          // the letter's keyDown (NO text param — a modifier chord inserts
          // nothing; #field3's DOM value staying EMPTY is part of the
          // witness) + the letter's keyUp + modifier keyUp. The two DOM
          // keydown records the PAGE captured for each chord are read back
          // into the receipt: bit 2 <-> ctrlKey, bit 1 <-> altKey, bit 4
          // <-> metaKey (S161 grounds the DOM booleans; S153 the bits).
          const hexTail = nonce.split('-')[2] || '';
          const lm = /([a-f])/.exec(hexTail);
          const chordLetter = lm ? lm[1] : 'a';
          const chordLetterCode = 'Key' + chordLetter.toUpperCase();
          const chordLetterVk = 65 + (chordLetter.charCodeAt(0) - 97);
          const CHORD_MODS = [
            { name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', vk: 17 },
            { name: 'Alt', bit: 1, key: 'Alt', code: 'AltLeft', vk: 18 },
            { name: 'Meta', bit: 4, key: 'Meta', code: 'MetaLeft', vk: 91 },
          ];
          const [f3x, f3y] = await centerOf('field3');
          await clickAt(f3x, f3y);
          const chordDomain = {
            derivation: 'first [a-f] char of the nonce hex tail',
            hexTail,
            letter: chordLetter,
            letterCode: chordLetterCode,
            letterWindowsVirtualKeyCode: chordLetterVk,
            keylogLengthBefore: await evalStr(`window.__keylog.length`),
            chords: [],
          };
          let chordDomainEvents = 0;
          for (const cm of CHORD_MODS) {
            const klBefore = await evalStr(`window.__keylog.length`);
            await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk, nativeVirtualKeyCode: cm.vk });
            chordDomainEvents++;
            await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: cm.bit, key: chordLetter, unmodifiedText: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk, nativeVirtualKeyCode: chordLetterVk });
            chordDomainEvents++;
            await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: cm.bit, key: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk, nativeVirtualKeyCode: chordLetterVk });
            chordDomainEvents++;
            await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk, nativeVirtualKeyCode: cm.vk });
            chordDomainEvents++;
            const dom = await evalStr(`JSON.stringify(window.__keylog.slice(Number(${klBefore})))`);
            chordDomain.chords.push({
              name: cm.name, bit: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk,
              letterKeydown: { key: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk },
              keyEventsDispatched: 4,
              domEvents: dom ? JSON.parse(dom) : null,
            });
          }
          chordDomain.keyEventCount = chordDomainEvents;
          chordDomain.keylogLengthAfter = await evalStr(`window.__keylog.length`);
          chordDomain.field3ValueAfter = await evalStr(`document.getElementById('field3').value`);
          form.chordDomain = chordDomain;
          // --- the round-55 control-domain leg (the r54 planned residual):
          // the KEY-DOMAIN control keys on the trace, each with a page-side
          // DOM witness. Backspace (the edit key): dispatched into #field,
          // the DOM value read back must be the nonce MINUS its last
          // character; the removed character is re-typed (a real
          // keyDown/keyUp pair with the text param) and the value witnessed
          // RESTORED, so the submitted query stays the invocation-bound
          // pair. Tab (the focus key): the page's OWN
          // document.activeElement witness read before/after must move
          // #field -> #field2. Enter (the keyboard submit): dispatched FROM
          // THE TABBED-TO FIELD — implicit submission navigates to /echo
          // carrying BOTH parameters, witnessed server-side + client-side
          // exactly like the r54 button click. DISCLOSED ASYMMETRY: the
          // Enter keydown's own DOM record is NOT witnessed — the implicit
          // submission navigates the document and the keylog dies with it —
          // so the page keylog gains EXACTLY THREE entries over the r54
          // plan (the Backspace keydown, the restored character's keydown,
          // the Tab keydown), and the SUBMISSION ITSELF is the Enter
          // witness. The keylog is read after the Tab leg, BEFORE the Enter
          // dispatch.
          const controlDomain = {};
          const [rbx, rby] = await centerOf('field');
          await clickAt(rbx, rby);
          controlDomain.focusAfterClick = await evalStr(`document.activeElement.id || document.activeElement.tagName`);
          // the caret re-anchor (the smoke run's lesson: a mouse click into a
          // NON-EMPTY field places the caret at the click point, NOT at the
          // end — the red control c2-smoke-caret-midtext-red.json caught the
          // Backspace deleting a middle character). The End key MOVES the
          // caret to the end of the line; its own DOM witness is the keylog
          // entry PLUS the NEGATIVE EDIT WITNESS: the field's value is read
          // back after End and must be UNCHANGED (a movement key edits
          // nothing).
          controlDomain.keylogLengthBefore = await evalStr(`window.__keylog.length`);
          controlDomain.end = { key: 'End', code: 'End', windowsVirtualKeyCode: 35, fieldId: 'field' };
          await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
          controlDomain.end.keyEventsDispatched = 2;
          controlDomain.valueAfterEnd = await evalStr(`document.getElementById('field').value`);
          controlDomain.backspace = { key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, fieldId: 'field' };
          controlDomain.valueBeforeBackspace = await evalStr(`document.getElementById('field').value`);
          await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
          controlDomain.backspace.keyEventsDispatched = 2;
          controlDomain.valueAfterBackspace = await evalStr(`document.getElementById('field').value`);
          const lastCh = nonce[nonce.length - 1];
          const restoreVk = vkFor(lastCh), restoreCode = codeFor(lastCh);
          if (restoreVk === null || restoreCode === null) { fail('control-restore-mapping-missing', { lastCh }); }
          controlDomain.restore = { char: lastCh, code: restoreCode, windowsVirtualKeyCode: restoreVk };
          await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: lastCh, text: lastCh, unmodifiedText: lastCh, code: restoreCode, windowsVirtualKeyCode: restoreVk, nativeVirtualKeyCode: restoreVk });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: lastCh, code: restoreCode, windowsVirtualKeyCode: restoreVk, nativeVirtualKeyCode: restoreVk });
          controlDomain.restore.keyEventsDispatched = 2;
          controlDomain.valueAfterRestore = await evalStr(`document.getElementById('field').value`);
          await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
          controlDomain.tab = {
            key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, keyEventsDispatched: 2,
            activeElementBefore: controlDomain.focusAfterClick,
            activeElementAfter: await evalStr(`document.activeElement.id || document.activeElement.tagName`),
          };
          controlDomain.keylogLengthAfterTab = await evalStr(`window.__keylog.length`);
          form.controlDomain = controlDomain;
          form.pageKeylog = await evalStr(`JSON.stringify(window.__keylog)`);
          form.pageKeylog = form.pageKeylog ? JSON.parse(form.pageKeylog) : null;
          // the runner's own plan-vs-page comparison (the counter re-derives
          // the same plan independently from the receipt's nonce — this chain
          // only makes the RUN fail loudly when the page record disagrees):
          // every plain keyDown, every Shift chord keyDown (modifier ride +
          // letter), every chord-domain keyDown (modifier + letter) and the
          // THREE control-domain keyDowns (Backspace, the restored character,
          // Tab) — with the DOM booleans the modifier bits must produce.
          const klEq = (a, b) => !!a && !!b && a.key === b.key && a.code === b.code
            && a.ctrlKey === b.ctrlKey && a.altKey === b.altKey
            && a.metaKey === b.metaKey && a.shiftKey === b.shiftKey
            && a.keyCode === b.keyCode;
          const expectedKeylog = [];
          for (const ch of nonce) {
            expectedKeylog.push({ key: ch, code: codeFor(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, keyCode: vkFor(ch) });
          }
          for (const ch of mixed) {
            const ride = /[A-Z]/.test(ch);
            if (ride) expectedKeylog.push({ key: 'Shift', code: 'ShiftLeft', ctrlKey: false, altKey: false, metaKey: false, shiftKey: true, keyCode: 16 });
            expectedKeylog.push({ key: ch, code: codeForChord(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: ride, keyCode: vkForChord(ch) });
          }
          for (const cm of CHORD_MODS) {
            const bools = { ctrlKey: cm.bit === 2, altKey: cm.bit === 1, metaKey: cm.bit === 4, shiftKey: false };
            expectedKeylog.push({ key: cm.key, code: cm.code, keyCode: cm.vk, ...bools });
            expectedKeylog.push({ key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...bools });
          }
          expectedKeylog.push({ key: 'End', code: 'End', ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, keyCode: 35 });
          expectedKeylog.push({ key: 'Backspace', code: 'Backspace', ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, keyCode: 8 });
          expectedKeylog.push({ key: lastCh, code: codeFor(lastCh), ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, keyCode: vkFor(lastCh) });
          expectedKeylog.push({ key: 'Tab', code: 'Tab', ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, keyCode: 9 });
          form.expectedKeylogLength = expectedKeylog.length;
          form.keylogMatchesPlan = Array.isArray(form.pageKeylog)
            && form.pageKeylog.length === expectedKeylog.length
            && expectedKeylog.every((e, i) => klEq(e, form.pageKeylog[i]));
          form.chordDomainBooleansMatch = chordDomain.chords.length === CHORD_MODS.length
            && chordDomain.chords.every((c) => {
              const cm = CHORD_MODS.find((m) => m.name === c.name);
              if (!cm || c.bit !== cm.bit) return false;
              const bools = { ctrlKey: cm.bit === 2, altKey: cm.bit === 1, metaKey: cm.bit === 4, shiftKey: false };
              return Array.isArray(c.domEvents) && c.domEvents.length === 2
                && klEq(c.domEvents[0], { key: cm.key, code: cm.code, keyCode: cm.vk, ...bools })
                && klEq(c.domEvents[1], { key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...bools });
            });
          // the round-55 submit: the ENTER KEY, dispatched from the TABBED-TO
          // field (#field2) — the keyboard-submit witness (the r54 planned
          // residual). The button #go is NOT clicked this round; implicit
          // submission (the form carries a submit button, so the Enter
          // keydown's default action must submit) drives the same GET
          // navigation the r54 button click produced. The keyUp is not
          // dispatched: the submission rides the keyDown's default action
          // and the document may already be navigating.
          controlDomain.enter = {
            key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13,
            keyEventsDispatched: 1, submitMechanism: 'implicit-submission-enter-key',
            focusAtSubmit: await evalStr(`document.activeElement.id || document.activeElement.tagName`),
          };
          await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
          if (!await waitEcho()) fail('form-echo-not-ready', {});
          const stepEcho = await recordStep('form-submit', '/echo', 'journey-echo');
          form.urlAfter = stepEcho.url;
          form.valueOnEchoPage = await evalStr(`(document.getElementById('echoed')||{}).textContent`) || null;
          const wantedQuery = '/echo?field=' + encodeURIComponent(nonce) + '&mixed=' + encodeURIComponent(mixed);
          form.servedEchoEntry = fixture.served.includes(wantedQuery) ? wantedQuery : (fixture.served.find((u) => String(u).startsWith('/echo?')) || null);
          form.serverSawField = Boolean(form.servedEchoEntry === wantedQuery);
          form.mixedOnEchoPage = await evalStr(`(document.getElementById('mixed-echoed')||{}).textContent`) || null;
          form.serverSawMixed = Boolean(form.servedEchoEntry === wantedQuery);
          journey.form = form;
          note('form-complete', { fieldValue: form.fieldValueAfterTyping, keyEvents: form.keyEventCount, allPrefix: form.allPrefixTrue, chordValue: form.chords && form.chords.fieldValueAfterTyping, chordEvents: form.chords && form.chords.keyEventCount, allChordPrefixes: form.chords && form.chords.allPrefixTrue, chordDomainLetter: form.chordDomain && form.chordDomain.letter, chordDomainEvents: form.chordDomain && form.chordDomain.keyEventCount, field3ValueAfter: form.chordDomain && form.chordDomain.field3ValueAfter, backspaceValue: form.controlDomain && form.controlDomain.valueAfterBackspace, restoreValue: form.controlDomain && form.controlDomain.valueAfterRestore, tabFocus: form.controlDomain && form.controlDomain.tab && form.controlDomain.tab.activeElementAfter, keylogWindow: form.controlDomain && form.controlDomain.keylogLengthAfterTab - form.controlDomain.keylogLengthBefore, pageKeylogLength: Array.isArray(form.pageKeylog) ? form.pageKeylog.length : null, keylogMatchesPlan: form.keylogMatchesPlan, chordDomainBooleansMatch: form.chordDomainBooleansMatch, echoPage: form.valueOnEchoPage, mixedEchoPage: form.mixedOnEchoPage, serverSaw: form.serverSawField, serverSawMixed: form.serverSawMixed });
        }
        receipt.screenshot = journey.steps[journey.steps.length - 1].screenshot; // the main shot is the FINAL page
        receipt.journey = journey;
        note('journey-complete', {
          steps: journey.steps.length,
          entriesLength: journey.history && journey.history.entriesLength,
          backLeg: journey.backLeg ? journey.backLeg.urlAfter : null,
        });
      }
      ws.close();
    }
  } catch (e) {
    fail('cdp-error', { message: e.message });
  }
}

// --- keyed teardown: kill the HOST tree; sweep every process carrying the
// profile token; the fixture server is closed BEFORE teardown accounting ------
if (fixtureServer) { try { fixtureServer.close(); } catch {} }
if (host.pid) {
  const k = spawnSync('taskkill', ['/T', '/F', '/PID', String(host.pid)], { encoding: 'utf8' });
  receipt.hostKill = { pid: host.pid, status: k.status };
}
await sleep(1500);
const sweep = () => {
  const w = spawnSync('wmic', ['process', 'where', `CommandLine like '%${token}%'`, 'get', 'ProcessId,Name'], { encoding: 'utf8', timeout: 20000 });
  return (w.stdout || '').split('\n').map((s) => s.trim()).filter((s) => s.length > 0 && /\d\s/.test(s));
};
const survivors = sweep();
receipt.teardown = { postKillSweepCount: survivors.length, survivors };
if (survivors.length) {
  for (const row of survivors) {
    const m = /(\d+)\s*$/.exec(row);
    if (m) spawnSync('taskkill', ['/T', '/F', '/PID', m[1]], { encoding: 'utf8' });
  }
  await sleep(800);
  receipt.teardown.postSweepRecheckCount = sweep().length;
} else {
  receipt.teardown.postSweepRecheckCount = 0;
}
receipt.hostStdoutTail = hostStdout.slice(-200);
receipt.hostStderrTail = hostStderr.slice(-400);
receipt.hostReadySeen = hostStdout.includes('WEBVIEW2_HOST ready');

// the control-domain restore-char mapping, hoisted for the ok block (the
// vkFor/codeFor helpers above are scoped inside the form leg)
const lastChFinal = nonce[nonce.length - 1];
const lastChCode = (/[0-9]/.test(lastChFinal) ? 'Digit' + lastChFinal : /[a-z]/.test(lastChFinal) ? 'Key' + lastChFinal.toUpperCase() : lastChFinal === '-' ? 'Minus' : null);
const lastChVk = (/[0-9]/.test(lastChFinal) ? 48 + Number(lastChFinal) : /[a-z]/.test(lastChFinal) ? 65 + (lastChFinal.charCodeAt(0) - 97) : lastChFinal === '-' ? 189 : null);
let ok = receipt.failures.length === 0
  && receipt.hostReadySeen === true
  && receipt.invocationBound === true
  && receipt.screenshot
  && receipt.teardown.postKillSweepCount === 0;
if (journeyMode) {
  ok = ok && receipt.journey
    && Array.isArray(receipt.journey.steps) && receipt.journey.steps.length === (formMode ? 6 : 4)
    && receipt.journey.nonceOnPageA === true
    && receipt.journey.history && receipt.journey.history.entriesLength === 4 && receipt.journey.history.currentIndex === 3
    && receipt.journey.backLeg && receipt.journey.backLeg.urlAfter && receipt.journey.backLeg.urlAfter.endsWith('/b.html')
    && receipt.journey.backLeg.entriesLengthAfter === 4 && receipt.journey.backLeg.currentIndexAfter === 2;
  if (formMode) {
    const f = receipt.journey && receipt.journey.form;
    ok = ok && f
      && f.nonceOnFormPage === true
      && f.filledValue === nonce
      && f.valueBeforeFirstKey === ''
      && Array.isArray(f.typing) && f.typing.length === nonce.length
      && f.typing.every((t, i) => t.char === nonce[i] && t.valueAfter === nonce.slice(0, i + 1))
      && f.keyEventCount === 2 * nonce.length
      && f.fieldValueAfterTyping === nonce
      && f.allPrefixTrue === true
      && typeof f.urlAfter === 'string' && f.urlAfter.includes('/echo?field=' + encodeURIComponent(nonce))
      && f.valueOnEchoPage === nonce
      && f.serverSawField === true
      && f.chords && f.chords.value === nonce.toUpperCase()
      && f.chords.valueBeforeFirstKey === ''
      && Array.isArray(f.chords.typing) && f.chords.typing.length === nonce.length
      && f.chords.typing.every((t, i) => t.char === nonce.toUpperCase()[i] && t.valueAfter === nonce.toUpperCase().slice(0, i + 1))
      && f.chords.typing.every((t) => t.shiftRide === /[A-Z]/.test(t.char) && t.modifiers === (t.shiftRide ? 8 : 0))
      && f.chords.keyEventCount === [...nonce.toUpperCase()].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? 4 : 2), 0)
          && f.chords.fieldValueAfterTyping === nonce.toUpperCase()
          && f.chords.allPrefixTrue === true
          && f.mixedOnEchoPage === nonce.toUpperCase()
          && f.serverSawMixed === true
          && f.chordDomain
          && f.chordDomain.derivation === 'first [a-f] char of the nonce hex tail'
          && f.chordDomain.letter === (() => { const m = /([a-f])/.exec((nonce.split('-')[2]) || ''); return m ? m[1] : 'a'; })()
          && f.chordDomain.letterCode === 'Key' + f.chordDomain.letter.toUpperCase()
          && f.chordDomain.letterWindowsVirtualKeyCode === 65 + (f.chordDomain.letter.charCodeAt(0) - 97)
          && Array.isArray(f.chordDomain.chords) && f.chordDomain.chords.length === 3
          && f.chordDomain.chords.every((c) => c.keyEventsDispatched === 4)
          && f.chordDomain.keyEventCount === 12
          && f.chordDomain.field3ValueAfter === ''
          && f.chordDomain.keylogLengthAfter - f.chordDomain.keylogLengthBefore === 6
          && f.chordDomainBooleansMatch === true
          && f.controlDomain
          && f.controlDomain.focusAfterClick === 'field'
          && f.controlDomain.end
          && f.controlDomain.end.key === 'End' && f.controlDomain.end.code === 'End'
          && f.controlDomain.end.windowsVirtualKeyCode === 35
          && f.controlDomain.end.keyEventsDispatched === 2
          && f.controlDomain.valueAfterEnd === nonce
          && f.controlDomain.backspace
          && f.controlDomain.backspace.key === 'Backspace' && f.controlDomain.backspace.code === 'Backspace'
          && f.controlDomain.backspace.windowsVirtualKeyCode === 8
          && f.controlDomain.backspace.keyEventsDispatched === 2
          && f.controlDomain.valueBeforeBackspace === nonce
          && f.controlDomain.valueAfterBackspace === nonce.slice(0, -1)
          && f.controlDomain.restore
          && f.controlDomain.restore.char === lastChFinal
          && f.controlDomain.restore.code === lastChCode
          && f.controlDomain.restore.windowsVirtualKeyCode === lastChVk
          && f.controlDomain.restore.keyEventsDispatched === 2
          && f.controlDomain.valueAfterRestore === nonce
          && f.controlDomain.tab
          && f.controlDomain.tab.key === 'Tab' && f.controlDomain.tab.code === 'Tab'
          && f.controlDomain.tab.windowsVirtualKeyCode === 9
          && f.controlDomain.tab.keyEventsDispatched === 2
          && f.controlDomain.tab.activeElementBefore === 'field'
          && f.controlDomain.tab.activeElementAfter === 'field2'
          && f.controlDomain.enter
          && f.controlDomain.enter.key === 'Enter' && f.controlDomain.enter.code === 'Enter'
          && f.controlDomain.enter.windowsVirtualKeyCode === 13
          && f.controlDomain.enter.keyEventsDispatched === 1
          && f.controlDomain.enter.submitMechanism === 'implicit-submission-enter-key'
          && f.controlDomain.enter.focusAtSubmit === 'field2'
          && Number(f.controlDomain.keylogLengthBefore) === Number(f.chordDomain.keylogLengthAfter)
          && Number(f.controlDomain.keylogLengthAfterTab) - Number(f.controlDomain.keylogLengthBefore) === 4
          && f.expectedKeylogLength === nonce.length + [...nonce.toUpperCase()].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? 2 : 1), 0) + 6 + 4
          && f.keylogMatchesPlan === true;
  }
}
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  ok,
  port,
  invocationBound: receipt.invocationBound === true,
  journey: receipt.journey ? {
    steps: receipt.journey.steps.length,
    legs: receipt.journey.steps.map((s) => s.leg),
    urls: receipt.journey.steps.map((s) => s.url),
    history: receipt.journey.history,
    backLeg: receipt.journey.backLeg || null,
  } : null,
  screenshot: receipt.screenshot || null,
  postKillSweepCount: receipt.teardown.postKillSweepCount,
  failures: receipt.failures,
}, null, 1));
process.exit(ok ? 0 : 1);
