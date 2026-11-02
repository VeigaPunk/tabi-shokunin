#!/usr/bin/env node
// webview2-cdp-loopback-round51.mjs — tabi round 51, claim C2 (coverage:
// capability extension — the form-interaction residual on the webview2
// surface, the r49/r50 planned list's second residual: fill + submit).
//
// Round 51 deltas vs the committed r50 runner (everything else
// structure-identical):
//   (1) --form: the full r50 four-leg journey (Page.navigate /a.html, the
//       pages' own anchor clicks to /b.html and /c.html, the measured-model
//       history read at C and the Page.navigateToHistoryEntry back hop to the
//       /b.html entry) PLUS two form legs, driven with the CDP Input domain
//       (S153's Input.insertText / Input.dispatchMouseEvent descriptions are
//       the ground): anchor-click to /form.html, a real mouse click INTO the
//       field (mousePressed/mouseReleased at the element center),
//       Input.insertText of the invocation-bound nonce, the field's value read
//       back from the DOM, a second mouse click on the form's own submit
//       button, the GET form navigation to /echo observed SERVER-SIDE by the
//       inline fixture (served request log carries /echo?field=<nonce>) and
//       CLIENT-SIDE by the echo page rendering the received value — six legs,
//       six PNGs, receipt.form carries the whole chain. The nonce riding the
//       form page, the inserted value, the echo page rendering and the server
//       log entry are four independent witnesses of one invocation-bound
//       fill+submit round trip.
//   (2) /b.html gains a second anchor (#form) to the form page; the r50 pages'
//       bytes are otherwise unchanged in shape (each round's fixture is its
//       own; the r50 counter still pins the r50 bytes).
//   (3) The runtime default stays a placeholder: --runtime MUST be passed
//       explicitly (the r50 contract, unchanged — the auto-update drift is the
//       standing host condition).
//
// Usage:
//   node scripts/webview2-cdp-loopback-round51.mjs --runtime <runtimeDir> //        --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json> //        [--csc <csc.exe>] [--journey] [--form]
//   node scripts/webview2-cdp-loopback-round51.mjs --path-selftest
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r51-pathselftest-'));
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
    const profile = path.join(r.resolved, 'tabi-r51-wv2drv-abcd123456-profile');
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
  console.log(JSON.stringify({ schema: 'tabi-webview2-cdp-r50-path-selftest', allPass, cases: cases.length, pass: cases.filter((c) => c.ok).length, cases }, null, 1));
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
  console.error('usage: node webview2-cdp-loopback-round51.mjs --runtime <dir> --loader <dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>] [--journey] | --path-selftest');
  process.exit(2);
}
const runtimeFolder = path.win32.normalize(runtimeArg);
const scratchDir = scratchR.resolved;
const outReceipt = outR.resolved;

const nonce = `tabi-r51-${crypto.randomBytes(8).toString('hex')}`;
const token = `tabi-r51-wv2drv-${crypto.randomBytes(5).toString('hex')}`;
const profile = path.join(scratchDir, `${token}-profile`);
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });

const receipt = {
  schema: 'tabi-webview2-cdp-r51',
  generatedBy: 'scripts/webview2-cdp-loopback-round51.mjs',
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
const mkPage = (letter, title, anchors) => `<!doctype html><html><head><title>tabi-r51 journey fixture ${title}</title></head>` +
  `<body><h1 id="pg">fixture-page-${letter}</h1><p id="nonce">${nonce}</p>` +
  anchors +
  `</body></html>`;
const mkFormPage = () => `<!doctype html><html><head><title>tabi-r51 form fixture</title></head>` +
  `<body><h1 id="pg">fixture-page-F</h1><p id="nonce">${nonce}</p>` +
  `<form id="f" method="GET" action="/echo">` +
  `<input id="field" name="field" value="" size="40">` +
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
      fixture.served.push(req.url);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html><head><title>tabi-r51 echo</title></head><body><h1 id="pg">echo</h1><p id="echoed">${field}</p></body></html>`);
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
          const form = { mechanism: 'dispatchMouseEvent+insertText+submit-click' };
          form.nonceOnFormPage = stepForm.nonceMarker === nonce;
          // leg 6 — real input-domain fill + submit
          const [fx, fy] = await centerOf('field');
          await clickAt(fx, fy);
          await send('Input.insertText', { text: nonce });
          form.filledValue = nonce;
          form.fieldValueAfterInsert = await evalStr(`document.getElementById('field').value`);
          const [bx, by] = await centerOf('go');
          await clickAt(bx, by);
          if (!await waitEcho()) fail('form-echo-not-ready', {});
          const stepEcho = await recordStep('form-submit', '/echo', 'journey-echo');
          form.urlAfter = stepEcho.url;
          form.valueOnEchoPage = await evalStr(`(document.getElementById('echoed')||{}).textContent`) || null;
          const wantedQuery = '/echo?field=' + encodeURIComponent(nonce);
          form.servedEchoEntry = fixture.served.includes(wantedQuery) ? wantedQuery : (fixture.served.find((u) => String(u).startsWith('/echo?')) || null);
          form.serverSawField = Boolean(form.servedEchoEntry === wantedQuery);
          journey.form = form;
          note('form-complete', { fieldValue: form.fieldValueAfterInsert, echoPage: form.valueOnEchoPage, serverSaw: form.serverSawField });
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
    const f = receipt.journey && receipt.journey.form;
    ok = ok && f
      && f.nonceOnFormPage === true
      && f.filledValue === nonce && f.fieldValueAfterInsert === nonce
      && typeof f.urlAfter === 'string' && f.urlAfter.includes('/echo?field=' + encodeURIComponent(nonce))
      && f.valueOnEchoPage === nonce
      && f.serverSawField === true;
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
