#!/usr/bin/env node
// webview2-cdp-loopback-round49.mjs — tabi round 49, claims C2 (operability:
// the r48-closure-routed relative-path foot-gun) and C3 (coverage: cross-page
// navigation over a loopback HTTP fixture, the r48 note's declared residual).
//
// Round 49 deltas vs the committed r48 runner (everything else byte-equivalent
// in structure):
//   (1) PATH RESOLUTION AT LAUNCH. The r48 runner passed --scratch through
//       verbatim, so a RELATIVE --scratch produced a relative
//       WEBVIEW2_USER_DATA_FOLDER, which the WebView2 runtime resolved against
//       the HOST EXE's directory (S160: "the default UDF location is the
//       directory that the app executable (.exe) is running in") while the
//       runner polled the path relative to the CWD — the round-open red
//       control (controls/c2-v1-relative-scratch-red-*.json/txt) shows the
//       profile landing at <cwd>/relscratch/relscratch/<token>-profile with a
//       live DevToolsActivePort the runner never read. This runner resolves
//       --scratch and --out ONCE at launch (path.resolve — the S157
//       primitives) and uses the absolute forms everywhere downstream; the
//       receipt records given vs resolved under `paths`.
//   (2) --nav: after the invocation-bound nonce page (unchanged verification
//       model), the runner starts an inline loopback HTTP fixture server
//       (127.0.0.1, ephemeral port, two static pages served from this file's
//       own bytes), Page.navigates to page A, follows the page's OWN anchor
//       (Runtime.evaluate of el.click()) to page B, and records per-page URL,
//       title and screenshot under receipt.nav. The fixture server is closed
//       before teardown accounting.
//
// Usage:
//   node scripts/webview2-cdp-loopback-round49.mjs --runtime <runtimeDir> \
//        --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json> \
//        [--csc <csc.exe>] [--nav]
//   node scripts/webview2-cdp-loopback-round49.mjs --path-selftest
// Exit: 0 receipt written and every step green; 1 a step failed (receipt still
// written with the failure recorded); 2 usage / selftest failure.
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DEFAULT_RUNTIME = 'C:/Program Files (x86)/Microsoft/EdgeWebView/Application/156.0.4314.50';
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

// --- path resolution, the C2 fix: given -> absolute ONCE, at launch ---------
function resolveAtLaunch(p) {
  return { given: p, resolved: path.resolve(p) };
}

// --- --path-selftest: the resolver, unit-tested without a browser -----------
if (hasFlag('path-selftest')) {
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r49-pathselftest-'));
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
    const abs = path.win32.normalize('C:\\temp\\tabi-r49-abs');
    const r = resolveAtLaunch(abs);
    if (path.resolve(r.resolved) !== path.resolve(abs)) throw new Error('not identity: ' + r.resolved);
  });
  t('profile-stays-under-resolved-scratch', () => {
    const r = resolveAtLaunch('nested/scratch');
    const profile = path.join(r.resolved, 'tabi-r49-wv2drv-abcd123456-profile');
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
  console.log(JSON.stringify({ schema: 'tabi-webview2-cdp-r49-path-selftest', allPass, cases: cases.length, pass: cases.filter((c) => c.ok).length, cases }, null, 1));
  process.exit(allPass ? 0 : 1);
}

const scratchR = resolveAtLaunch(opt('scratch'));
const outR = resolveAtLaunch(opt('out'));
const runtimeFolder = path.win32.normalize(opt('runtime') || DEFAULT_RUNTIME);
const loaderDll = path.win32.normalize(opt('loader') || DEFAULT_LOADER);
const cscExe = opt('csc') || DEFAULT_CSC;
const navMode = hasFlag('nav');
if (!scratchR.given || !outR.given) {
  console.error('usage: node webview2-cdp-loopback-round49.mjs --runtime <dir> --loader <dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>] [--nav] | --path-selftest');
  process.exit(2);
}
const scratchDir = scratchR.resolved;
const outReceipt = outR.resolved;

const nonce = `tabi-r49-${crypto.randomBytes(8).toString('hex')}`;
const token = `tabi-r49-wv2drv-${crypto.randomBytes(5).toString('hex')}`;
const profile = path.join(scratchDir, `${token}-profile`);
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });

const receipt = {
  schema: 'tabi-webview2-cdp-r49',
  generatedBy: 'scripts/webview2-cdp-loopback-round49.mjs',
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
    resolvedBy: 'path.resolve at launch (r49; S157 primitives; the UDF anchors at the host exe directory — S160)',
  },
  navMode,
  steps: [],
  failures: [],
};
const note = (step, o) => { receipt.steps.push({ step, ...o }); console.error(JSON.stringify({ step, ...o })); };
const fail = (step, o) => { receipt.failures.push({ step, ...o }); note('FAIL ' + step, o); };

// --- inline loopback fixture server (nav mode): two static pages ------------
const PAGE_A = `<!doctype html><html><head><title>tabi-r49 nav fixture A</title></head>` +
  `<body><h1 id="pg">fixture-page-A</h1><a id="next" href="/b.html">next page</a></body></html>`;
const PAGE_B = `<!doctype html><html><head><title>tabi-r49 nav fixture B</title></head>` +
  `<body><h1 id="pg">fixture-page-B</h1><p id="done">arrived cross-page</p></body></html>`;
let fixtureServer = null;
let fixture = null;
if (navMode) {
  fixtureServer = (await import('node:http')).createServer((req, res) => {
    const body = req.url === '/b.html' ? PAGE_B : PAGE_A;
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
const autoCloseMs = 40000;
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
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = (Array.isArray(targets) ? targets : []).find((t) => t.type === 'page' && t.url.startsWith('data:'));
    receipt.pageTargetCount = Array.isArray(targets) ? targets.length : -1;
    if (!page || !page.webSocketDebuggerUrl) {
      fail('no-page-target', { count: receipt.pageTargetCount });
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

      if (!navMode) {
        const png = await capture();
        const shotPath = outReceipt.replace(/\.json$/, '') + '.png';
        fs.writeFileSync(shotPath, png);
        receipt.screenshot = { path: shotPath, bytes: png.length, sha256: sha256(png) };
        note('capture-screenshot', { bytes: png.length });
      } else {
        // --- C3: cross-page navigation over the loopback fixture -----------
        const urlA = `http://127.0.0.1:${fixture.port}/a.html`;
        await send('Page.navigate', { url: urlA });
        let readyA = false;
        for (let i = 0; i < 40; i++) {
          if ((await evalStr('document.readyState')) === 'complete' && String(await evalStr('location.href')).endsWith('/a.html')) { readyA = true; break; }
          await sleep(250);
        }
        if (!readyA) fail('nav-page-a-not-ready', { urlA });
        const titleA = await evalStr('document.title');
        const pngA = await capture();
        const shotAPath = outReceipt.replace(/\.json$/, '') + '-page-a.png';
        fs.writeFileSync(shotAPath, pngA);
        const pageA = { url: await evalStr('location.href'), title: titleA, screenshot: { path: shotAPath, bytes: pngA.length, sha256: sha256(pngA) } };
        note('nav-page-a', { url: pageA.url, title: pageA.title, bytes: pngA.length });
        // cross-page via the page's OWN anchor (a real link navigation)
        await evalStr(`document.getElementById('next').click()`);
        let readyB = false;
        for (let i = 0; i < 40; i++) {
          const href = String(await evalStr('location.href') || '');
          if (href.endsWith('/b.html') && (await evalStr('document.readyState')) === 'complete') { readyB = true; break; }
          await sleep(250);
        }
        if (!readyB) fail('nav-page-b-not-ready', {});
        const titleB = await evalStr('document.title');
        const pngB = await capture();
        const shotBPath = outReceipt.replace(/\.json$/, '') + '-page-b.png';
        fs.writeFileSync(shotBPath, pngB);
        const pageB = { url: await evalStr('location.href'), title: titleB, screenshot: { path: shotBPath, bytes: pngB.length, sha256: sha256(pngB) } };
        note('nav-page-b', { url: pageB.url, title: pageB.title, bytes: pngB.length });
        receipt.screenshot = pageB.screenshot; // the main shot is the FINAL page
        receipt.nav = {
          mechanism: 'anchor-click',
          pages: [pageA, pageB],
          crossPage: pageA.url !== pageB.url,
          sameOrigin: new URL(pageA.url).origin === new URL(pageB.url).origin,
        };
        note('nav-complete', { crossPage: receipt.nav.crossPage, mechanism: receipt.nav.mechanism });
      }
      ws.close();
    }
  } catch (e) {
    fail('cdp-error', { message: e.message });
  }
}

// --- keyed teardown: kill the HOST tree; the browser subprocess must already
// be gone; sweep every process carrying the profile token ---
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
if (navMode) {
  ok = ok && receipt.nav && receipt.nav.crossPage === true && receipt.nav.sameOrigin === true
    && Array.isArray(receipt.nav.pages) && receipt.nav.pages.length === 2;
}
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  ok,
  port,
  invocationBound: receipt.invocationBound === true,
  nav: receipt.nav ? { crossPage: receipt.nav.crossPage, mechanism: receipt.nav.mechanism, pages: receipt.nav.pages.map((p) => p.url) } : null,
  screenshot: receipt.screenshot || null,
  postKillSweepCount: receipt.teardown.postKillSweepCount,
  failures: receipt.failures,
}, null, 1));
process.exit(ok ? 0 : 1);
