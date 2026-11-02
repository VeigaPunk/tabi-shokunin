#!/usr/bin/env node
// webview2-cdp-loopback-round53.mjs — tabi round 53, claim C2 (coverage:
// capability extension — the r52 planned residual: keyboard-modifier chords
// on the per-key key-event trace).
//
// Round 53 deltas vs the committed r52 runner (everything else
// structure-identical):
//   (1) --form now ALSO types the mixed-case value (the invocation-bound
//       nonce, uppercased) into the form's SECOND field with real Shift
//       chords: for every uppercase letter the runner presses and releases a
//       real Shift key (ShiftLeft, VK 16) around the letter's keyDown/keyUp
//       pair, the letter's event carrying modifiers: 8 (S153's
//       Input.dispatchKeyEvent modifiers bit field: Shift=8) with the
//       shifted key/text; digits and '-' type unshifted (modifiers: 0).
//       The DOM value of #field2 is read back after EACH keystroke — the
//       per-keystroke prefix witness on the chord trace
//       (journey.form.chords.typing[]; keyEventCount = 4 per shifted
//       character: Shift down/up + the letter's keyDown/keyUp; 2 per
//       unshifted character). The r52 plain typing trace into #field is
//       unchanged; the GET submit now carries both fields
//       (?field=<nonce>&mixed=<uppercased nonce>) and the submission is
//       witnessed SERVER-SIDE (the fixture served log), CLIENT-SIDE (the
//       echo page renders both values), and in the DOM (both read back).
//   (2) S153 re-opened byte-identical a FIFTH time; the located ground for
//       this round is the dispatchKeyEvent modifiers parameter description
//       ("Bit field representing pressed modifier keys. Alt=1, Ctrl=2,
//       Meta/Command=4, Shift=8 (default: 0).") plus the command
//       description the r52 trace already rode.
//   (3) The runtime contract is unchanged: --runtime MUST be passed
//       explicitly (auto-update drift is the standing host condition); the
//       nonce/profile/token prefixes move to tabi-r53 so cross-generation
//       receipts refuse by shape.
//
// Usage:
//   node scripts/webview2-cdp-loopback-round53.mjs --runtime <runtimeDir>
//        --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json>
//        [--csc <csc.exe>] [--journey] [--form]
//   node scripts/webview2-cdp-loopback-round53.mjs --path-selftest
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r53-pathselftest-'));
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
    const profile = path.join(r.resolved, 'tabi-r53-wv2drv-abcd123456-profile');
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
  console.log(JSON.stringify({ schema: 'tabi-webview2-cdp-r53-path-selftest', allPass, cases: cases.length, pass: cases.filter((c) => c.ok).length, cases }, null, 1));
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
  console.error('usage: node webview2-cdp-loopback-round53.mjs --runtime <dir> --loader <dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>] [--journey] | --path-selftest');
  process.exit(2);
}
const runtimeFolder = path.win32.normalize(runtimeArg);
const scratchDir = scratchR.resolved;
const outReceipt = outR.resolved;

const nonce = `tabi-r53-${crypto.randomBytes(8).toString('hex')}`;
const token = `tabi-r53-wv2drv-${crypto.randomBytes(5).toString('hex')}`;
const profile = path.join(scratchDir, `${token}-profile`);
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });

const receipt = {
  schema: 'tabi-webview2-cdp-r53',
  generatedBy: 'scripts/webview2-cdp-loopback-round53.mjs',
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
const mkPage = (letter, title, anchors) => `<!doctype html><html><head><title>tabi-r53 journey fixture ${title}</title></head>` +
  `<body><h1 id="pg">fixture-page-${letter}</h1><p id="nonce">${nonce}</p>` +
  anchors +
  `</body></html>`;
const mkFormPage = () => `<!doctype html><html><head><title>tabi-r53 form fixture</title></head>` +
  `<body><h1 id="pg">fixture-page-F</h1><p id="nonce">${nonce}</p>` +
  `<form id="f" method="GET" action="/echo">` +
  `<input id="field" name="field" value="" size="40">` +
  `<input id="field2" name="mixed" value="" size="40">` +
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
      res.end(`<!doctype html><html><head><title>tabi-r53 echo</title></head><body><h1 id="pg">echo</h1><p id="echoed">${field}</p><p id="mixed-echoed">${mixed}</p></body></html>`);
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
          const form = { mechanism: 'dispatchKeyEvent+shift-chords+submit-click' };
          form.nonceOnFormPage = stepForm.nonceMarker === nonce;
          // leg 6 — the PER-KEY typing trace (the r52 fill mechanism): after
          // the same real mouse click into the field, every nonce character
          // rides a real Input.dispatchKeyEvent keyDown (with per-character
          // text/key/code/windowsVirtualKeyCode) + keyUp pair, and the field's
          // DOM value is read back after EACH keystroke — the per-key prefix
          // witness (value after keystroke i must be the nonce prefix of
          // length i+1). S153's Input.dispatchKeyEvent description is the
          // round's located ground (re-opened byte-identical this round).
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
          const [bx, by] = await centerOf('go');
          await clickAt(bx, by);
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
          note('form-complete', { fieldValue: form.fieldValueAfterTyping, keyEvents: form.keyEventCount, allPrefix: form.allPrefixTrue, chordValue: form.chords && form.chords.fieldValueAfterTyping, chordEvents: form.chords && form.chords.keyEventCount, allChordPrefixes: form.chords && form.chords.allPrefixTrue, echoPage: form.valueOnEchoPage, mixedEchoPage: form.mixedOnEchoPage, serverSaw: form.serverSawField, serverSawMixed: form.serverSawMixed });
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
      && f.serverSawMixed === true;
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
