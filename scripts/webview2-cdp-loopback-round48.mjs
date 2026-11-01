#!/usr/bin/env node
// webview2-cdp-loopback-round48.mjs — tabi round 48, claim C3 runner
// (coverage: the third declared Chromium-class surface on this host, the
// WebView2 runtime). The r48 probe finding (round-open receipts under
// .ufo/waves/round-48/controls/): msedgewebview2.exe launched standalone
// initializes a profile and EXITS CLEANLY — the embedded browser keeps
// running only while a host application holds a CoreWebView2. The documented
// remote-debugging route (S158, Microsoft Learn WebView2 debugging docs;
// S159, the SDK header declaring the COM ABI) therefore applies to a HOST:
// this runner compiles the committed minimal COM host
// (scripts/webview2-host-round48.cs, csc.exe Framework 4.8, C# 5), spawns it
// with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=0 and a
// throwaway profile, discovers the endpoint from the profile's
// EBWebView\DevToolsActivePort file (the webview writes it one level below
// the profile root, unlike msedge.exe which writes it at the root), confirms
// identity by /json/version, reads the invocation-bound nonce back over the
// WebSocket CDP session, captures a PNG, and tears the host down with a keyed
// sweep (the browser subprocess must already be gone when the host dies —
// measured, not assumed).
//
// Usage:
//   node scripts/webview2-cdp-loopback-round48.mjs --runtime <runtimeDir> \
//        --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>]
// Exit: 0 receipt written and every step green; 1 a step failed (receipt still
// written with the failure recorded); 2 usage.
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
const scratchDir = opt('scratch');
const outReceipt = opt('out');
const runtimeFolder = path.win32.normalize(opt('runtime') || DEFAULT_RUNTIME);
const loaderDll = path.win32.normalize(opt('loader') || DEFAULT_LOADER);
const cscExe = opt('csc') || DEFAULT_CSC;
if (!scratchDir || !outReceipt) {
  console.error('usage: node webview2-cdp-loopback-round48.mjs --runtime <dir> --loader <dll> --scratch <dir> --out <receipt.json> [--csc <csc.exe>]');
  process.exit(2);
}
const selfPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(selfPath), '..');
const hostSrc = path.join(repoRoot, 'scripts', 'webview2-host-round48.cs');

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nonce = `tabi-r48-${crypto.randomBytes(8).toString('hex')}`;
const token = `tabi-r48-wv2drv-${crypto.randomBytes(5).toString('hex')}`;
const profile = path.join(scratchDir, `${token}-profile`);
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(path.resolve(outReceipt)), { recursive: true });

const receipt = {
  schema: 'tabi-webview2-cdp-r48',
  generatedBy: 'scripts/webview2-cdp-loopback-round48.mjs',
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
  steps: [],
  failures: [],
};
const note = (step, o) => { receipt.steps.push({ step, ...o }); console.error(JSON.stringify({ step, ...o })); };
const fail = (step, o) => { receipt.failures.push({ step, ...o }); note('FAIL ' + step, o); };

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

// --- spawn the host with the documented debugging env vars ---
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
      for (let i = 0; i < 20; i++) {
        const rs = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
        if (rs.result && rs.result.result && rs.result.result.value === 'complete') break;
        await sleep(250);
      }
      const titleRes = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
      receipt.nonceEcho = titleRes.result && titleRes.result.result && titleRes.result.result.value;
      receipt.invocationBound = receipt.nonceEcho === nonce;
      note('runtime-evaluate', { titleEcho: receipt.nonceEcho, matches: receipt.invocationBound });
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (shot.result && shot.result.data) {
        const png = Buffer.from(shot.result.data, 'base64');
        const shotPath = outReceipt.replace(/\.json$/, '') + '.png';
        fs.writeFileSync(shotPath, png);
        receipt.screenshot = { path: shotPath, bytes: png.length, sha256: sha256(png) };
        note('capture-screenshot', { bytes: png.length });
      } else {
        fail('capture-screenshot', { error: JSON.stringify(shot).slice(0, 200) });
      }
      ws.close();
    }
  } catch (e) {
    fail('cdp-error', { message: e.message });
  }
}

// --- keyed teardown: kill the HOST tree; the browser subprocess must already
// be gone; sweep every process carrying the profile token ---
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

const ok = receipt.failures.length === 0
  && receipt.hostReadySeen === true
  && receipt.invocationBound === true
  && receipt.screenshot
  && receipt.teardown.postKillSweepCount === 0;
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  ok,
  port,
  invocationBound: receipt.invocationBound === true,
  screenshot: receipt.screenshot || null,
  postKillSweepCount: receipt.teardown.postKillSweepCount,
  failures: receipt.failures,
}, null, 1));
process.exit(ok ? 0 : 1);
