#!/usr/bin/env node
// R76Exec3 probe (round 76 C1): confirm() opened while the Page domain is DISABLED in
// /usr/bin/chromium 155.0.8059.84 --headless=new (hasBrowserHandler true).
// Hypothesis (S204 web_contents_impl.cc:9601-9603 / 9650-9656): the dialog is NOT suppressed
// (has_non_devtools_handlers keeps has_handlers true), it is left to the browser dialog manager,
// and the page stays blocked (confirm() does not return within 3 s). Alternative: headless
// auto-dismisses it (confirm returns false at once).
// Flow per run: Runtime.enable ONLY (never Page.enable first) -> real mouse click
// (Input.dispatchMouseEvent press awaited, release NOT awaited) -> poll via Runtime.evaluate for
// 3 s -> Page.enable (20 s bound) -> watch Page.javascriptDialogOpening 2.5 s ->
// Page.handleJavaScriptDialog(accept) (15 s bound) -> confirm unblock. If the Page-domain
// commands stall on session 1 while the dialog is pending, a SECOND DevTools session to the same
// target is opened to disambiguate per-session dispatch stall vs target-level block. Teardown
// kills the process group, sweeps by launch token, closes the fixture server, and proves no
// process with the profile path survives (pgrep exit 1 + ps needle scan + closed port probes).
// Launch/sweep plumbing is the lane driver's (scripts/chrome-cdp-dialog-round76.mjs).
// Usage: node probe-disabled-dialog.mjs --scratch <ABS dir> --out <ABS run.json> [--run tag]
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const CHROMIUM = '/usr/bin/chromium';
const BLOCK_MS = 3000;        // hypothesis window: no confirm() return within 3 s
const POLL_MS = 100;
const EVAL_TIMEOUT_MS = 700;  // per-poll evaluate timeout; unanswered evaluate = renderer blocked
const OPENING_WAIT_MS = 2500; // watch window after Page.enable for a (re)delivered opening event
const ENABLE_TIMEOUT_MS = 20000;
const HANDLE_TIMEOUT_MS = 15000;
const CLOSED_WATCH_MS = 2000;
const UNBLOCK_WAIT_MS = 3000;
const WATCHDOG_MS = 200000;   // hard cap per run; writes partial receipt then exits 2
const VIEWPORT = { width: 1280, height: 900 };
const CLICK = { x: 300, y: 120 }; // centre of button #c (left 250, top 100, 100x40)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const scratchDir = opt('scratch');
const outReceipt = opt('out');
const runTag = opt('run') || 'run';
if (!scratchDir || !path.isAbsolute(scratchDir) || !outReceipt || !path.isAbsolute(outReceipt) || !outReceipt.endsWith('.json')) {
  console.error('usage: probe --scratch <ABS> --out <ABS .json> [--run tag]');
  process.exit(2);
}
fs.mkdirSync(scratchDir, { recursive: true });
// Chromium's singleton socket must fit (lane driver r70 R4 check, same bound).
const sockLen = Buffer.byteLength(path.join(fs.realpathSync(scratchDir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
if (sockLen > 107) { console.error('scratch too long for singleton socket: ' + sockLen); process.exit(2); }

async function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => { try { srv.close(); } catch {} resolve(false); });
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}
async function pickPort(exclude) {
  for (let i = 0; i < 80; i++) {
    const p = 21000 + Math.floor(Math.random() * 38000);
    if (p !== exclude && (await portFree(p))) return p;
  }
  throw new Error('no free port');
}

const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>R76Exec3 disabled-page dialog probe</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } button { position: absolute; top: 100px; width: 100px; height: 40px; margin: 0; padding: 0; border: 0; } #c { left: 250px; }</style>
<script>
window.__phase = 'idle'; window.__result = null;
window.__confirmEnteredAt = null; window.__confirmReturnedAt = null;
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('c').addEventListener('click', function () {
    window.__phase = 'before-confirm';
    window.__confirmEnteredAt = performance.now();
    var r = window.confirm('r76exec3-confirm');
    window.__confirmReturnedAt = performance.now();
    window.__result = (r === true ? 'true' : r === false ? 'false' : 'other:' + typeof r);
    window.__phase = 'after-confirm';
  });
});
</script></head><body><button id="c">confirm</button></body></html>`;

// --- run-scoped home/profile under scratch (driver plumbing, unchanged in shape) ---
const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratchDir, 'profile-' + launchToken);
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdgConfig = path.join(runHome, '.config');
const runXdg = {
  HOME: runHome,
  XDG_CONFIG_HOME: runXdgConfig,
  XDG_CACHE_HOME: path.join(runHome, '.cache'),
  XDG_DATA_HOME: path.join(runHome, '.local', 'share'),
  XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
  XDG_RUNTIME_DIR: path.join(runHome, 'run'),
  TMPDIR: scratchDir,
};
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR, profileDir]) fs.mkdirSync(d, { recursive: true });
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const out = { at: new Date().toISOString(), pids: [], error: null };
  const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
  if (r.status !== 0) { out.error = 'ps exited ' + r.status; return out; }
  for (const line of (r.stdout || '').split('\n')) {
    if (SWEEP_NEEDLES.some((n) => line.includes(n))) {
      const pid = Number(line.trim().split(/\s+/)[0]);
      if (Number.isInteger(pid) && pid > 1) out.pids.push(pid);
    }
  }
  return out;
}
const killPid = (pid, sig = 'SIGKILL') => { try { process.kill(pid, sig); return true; } catch { return false; } };
async function sweepToZero() {
  let rounds = 0, last = null;
  while (rounds < 20) {
    last = sweepOnce();
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) killPid(pid);
    await sleep(250);
    rounds++;
  }
  return { rounds, survivors: last.error ? [] : last.pids, error: last.error };
}
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(v); } };
    s.setTimeout(1500, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}

const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) { console.error('launch token not fresh'); process.exit(2); }

const httpPort = await pickPort();
const devPort = await pickPort(httpPort);
const fixtureUrl = 'http://127.0.0.1:' + httpPort + '/';
const receipt = {
  probe: 'R76Exec3-disabled-page-dialog', run: runTag,
  startedAt: new Date().toISOString(), finishedAt: null,
  hypothesis: 'confirm() with Page domain disabled is NOT suppressed (S204 9601-9603); left to browser dialog manager; page blocked >= 3 s (S204 9650-9656). Alternative: auto-dismissed at once.',
  host: { chromium: null, devtoolsListening: null, childExit: null, stderrHead: '' },
  profileDir, ports: { httpPort, devPort }, fixtureSha256: crypto.createHash('sha256').update(FIXTURE).digest('hex'),
  cdpSendLog: [], lateResponses: [], sessions: {},
  click: {}, polls: [], blocked: {}, pageEnable: {}, opening: {}, handle: {}, session2: {}, unblock: {},
  teardown: {}, verdict: {}, failures: [],
};
let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { interrupted = true; });
const note = (m) => receipt.failures.push(m);
const t0global = Date.now();

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE : 'not found');
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(httpPort, '127.0.0.1', resolve); });

const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1',
  '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, fixtureUrl];
let child = null;
const sessions = [];
async function teardown() {
  for (const s of sessions) { try { s.ws.close(); } catch {} }
  if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} } }
  await sleep(600);
  const swept = await sweepToZero();
  try { server.closeAllConnections(); } catch {}
  await Promise.race([new Promise((r) => server.close(r)), sleep(2000)]);
  const pgrep = spawnSync('pgrep', ['-af', '--', profileDir], { encoding: 'utf8', timeout: 15000 });
  const psOut = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
  const psMatches = (psOut.stdout || '').split('\n').filter((l) => SWEEP_NEEDLES.some((n) => l.includes(n))).map((l) => l.trim());
  receipt.teardown = {
    killAttempted: true, sweepRounds: swept.rounds, sweepSurvivors: swept.survivors, sweepError: swept.error,
    pgrepProfile: { exit: pgrep.status, stdout: (pgrep.stdout || '').trim() },
    psNeedleMatches: psMatches,
    portProbes: { fixture: await probePort(httpPort), devtools: await probePort(devPort) },
    childExit: receipt.host.childExit,
  };
  if (swept.error) note('sweep-error: ' + swept.error);
  if (swept.survivors.length) note('sweep survivors: ' + swept.survivors.join(','));
  if (pgrep.status !== 1) note('pgrep found profile survivors (exit ' + pgrep.status + '): ' + (pgrep.stdout || '').trim());
  if (psMatches.length) note('ps needle matches survive: ' + JSON.stringify(psMatches));
  if (Object.values(receipt.teardown.portProbes).some((v) => v !== 'closed')) note('ports not closed: ' + JSON.stringify(receipt.teardown.portProbes));
}

// One DevTools session = one WebSocket to the page target. Events and send log are shared into
// the receipt; each session gets its own id space and pending map.
function attachSession(url, tag) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const events = [];
    const pending = new Map();
    let msgId = 0;
    const session = {
      tag, events, ws,
      send(method, params = {}, timeoutMs = 30000) {
        return new Promise((res, rej) => {
          const id = ++msgId;
          receipt.cdpSendLog.push({ session: tag, id, method, params, at: Date.now(), sinceStartMs: Date.now() - t0global });
          const timer = setTimeout(() => { pending.delete(id); rej(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs);
          pending.set(id, { resolve: res, reject: rej, timer });
          try { ws.send(JSON.stringify({ id, method, params })); } catch (e) { clearTimeout(timer); pending.delete(id); rej(e); }
        });
      },
      async evalExpr(expression, timeoutMs = 10000) {
        const r = await this.send('Runtime.evaluate', { expression, returnByValue: true }, timeoutMs);
        if (r.result.exceptionDetails) throw new Error('page-exception: ' + JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
        return r.result.result.value;
      },
    };
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (typeof msg.method === 'string' && msg.id === undefined) {
        events.push({ method: msg.method, params: msg.params, at: Date.now(), sinceStartMs: Date.now() - t0global });
        return;
      }
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(Object.assign(new Error(msg.error.message), { cdp: msg.error })) : p.resolve(msg); }
      else if (msg.id !== undefined) {
        // Response for an id we already timed out on (or never sent): still evidence the
        // command was eventually processed.
        receipt.lateResponses.push({ session: tag, id: msg.id, error: msg.error ?? null, hasResult: 'result' in msg, at: Date.now(), sinceStartMs: Date.now() - t0global });
      }
    });
    ws.addEventListener('open', () => resolve(session), { once: true });
    ws.addEventListener('error', () => reject(new Error('ws error ' + tag)), { once: true });
  });
}

const STATE_EXPR = 'JSON.stringify({phase:window.__phase,result:window.__result,enteredAt:window.__confirmEnteredAt,returnedAt:window.__confirmReturnedAt})';
const errOf = (e) => ({ code: e.cdp?.code ?? null, message: e.cdp?.message ?? e.message });

let watchdogFired = false;
const watchdog = setTimeout(async () => {
  watchdogFired = true;
  note('watchdog-' + WATCHDOG_MS + 'ms');
  try { if (child?.pid) process.kill(-child.pid, 'SIGKILL'); } catch {}
  receipt.finishedAt = new Date().toISOString();
  try { fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); } catch {}
  console.log(JSON.stringify({ run: runTag, watchdog: true }));
  process.exit(2);
}, WATCHDOG_MS);

try {
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
  child.on('exit', (code, signal) => { receipt.host.childExit = { code, signal, at: new Date().toISOString() }; });
  child.stderr.on('data', (d) => { if (receipt.host.stderrHead.length < 8192) receipt.host.stderrHead += d.toString('utf8').slice(0, 8192 - receipt.host.stderrHead.length); });
  const version = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...runXdg } });
  receipt.host.chromium = version.status === 0 ? version.stdout.trim() : null;

  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1200) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 200 && !page && child.exitCode === null; i++) {
    try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
    if (!page) await sleep(200);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  receipt.launch = { targetId: page.id, pageWsUrl: page.webSocketDebuggerUrl, cdpConnectAt: new Date().toISOString() };
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(receipt.host.stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;

  const s1 = await attachSession(page.webSocketDebuggerUrl, 's1');
  sessions.push(s1); receipt.sessions.s1 = { events: s1.events };
  const ver = await s1.send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  // Runtime.enable ONLY. Page domain stays disabled through the click and the 3 s block window.
  await s1.send('Runtime.enable');
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await s1.evalExpr('document.readyState === "complete" && window.__phase === "idle" && !!document.getElementById("c")', 3000); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.click.readyAt = Date.now() - t0global;
  receipt.click.preEvalSanity = await s1.evalExpr('"pre-ok"', 3000);

  // Real mouse click. Press awaited; release sent WITHOUT awaiting its ack (the ack is only
  // answered after the dialog the click handler opens is closed).
  await s1.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: CLICK.x, y: CLICK.y, button: 'left', buttons: 1, clickCount: 1 });
  const tReleaseSent = Date.now();
  receipt.click.pressAckAt = Date.now() - t0global;
  s1.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: CLICK.x, y: CLICK.y, button: 'left', buttons: 0, clickCount: 1 })
    .then((r) => { receipt.click.releaseAck = { at: Date.now() - t0global, sinceReleaseSentMs: Date.now() - tReleaseSent, ok: !!r.result }; })
    .catch((e) => { receipt.click.releaseAck = { error: e.message }; });
  receipt.click.releaseSentAt = tReleaseSent;
  receipt.click.releaseAwaited = false;

  // Poll the page variable for BLOCK_MS. An unanswered evaluate means the renderer is blocked
  // (inside the synchronous dialog wait); a response of 'after-confirm' would mean auto-dismiss.
  let sawAfter = false, firstAfterAt = null, resp = 0, noResp = 0, lastSeen = null;
  while (Date.now() - tReleaseSent < BLOCK_MS) {
    const at = Date.now();
    const p = s1.evalExpr(STATE_EXPR, EVAL_TIMEOUT_MS).catch(() => { throw new Error('evaluate-unanswered-' + EVAL_TIMEOUT_MS + 'ms'); });
    const timeout = sleep(EVAL_TIMEOUT_MS).then(() => { throw new Error('evaluate-unanswered-' + EVAL_TIMEOUT_MS + 'ms'); });
    p.catch(() => {}); timeout.catch(() => {});
    try {
      const s = JSON.parse(await Promise.race([p, timeout]));
      resp++; lastSeen = s;
      receipt.polls.push({ at, sinceReleaseSentMs: at - tReleaseSent, phase: s.phase, result: s.result });
      if (s.phase === 'after-confirm') { sawAfter = true; firstAfterAt = at - tReleaseSent; break; }
    } catch (e) {
      noResp++;
      receipt.polls.push({ at, sinceReleaseSentMs: at - tReleaseSent, err: e.message });
    }
    await sleep(POLL_MS);
  }
  receipt.blocked = {
    windowMs: BLOCK_MS, stayedBeforeConfirm: !sawAfter, confirmReturnedWithinWindowMs: firstAfterAt,
    pollResponses: resp, pollNoResponse: noResp,
    lastSeenPhase: lastSeen ? lastSeen.phase : null, lastSeenResult: lastSeen ? lastSeen.result : null,
  };

  // Enable the Page domain now that the dialog is (presumably) pending, and watch for a
  // (re)delivered javascriptDialogOpening.
  const tEnable = Date.now();
  let enableResult = null, enableError = null;
  try { enableResult = (await s1.send('Page.enable', {}, ENABLE_TIMEOUT_MS)).result; } catch (e) { enableError = errOf(e); }
  const eventsBeforeEnable = s1.events.length;
  let opening = null;
  const tOpenWatch = Date.now();
  while (Date.now() - tOpenWatch < OPENING_WAIT_MS) {
    opening = s1.events.find((e) => e.method === 'Page.javascriptDialogOpening') || null;
    if (opening) break;
    await sleep(25);
  }
  receipt.pageEnable = { sentAt: tEnable, respondedAt: enableResult ? Date.now() : null, ms: Date.now() - tEnable, result: enableResult, error: enableError, eventsBeforeEnable };
  receipt.opening = { event: opening, waitedMs: Date.now() - tOpenWatch, delayFromEnableMs: opening ? opening.at - tEnable : null };

  // Answer the dialog on session 1.
  const tHandle = Date.now();
  let handleResult = null, handleError = null;
  try { handleResult = (await s1.send('Page.handleJavaScriptDialog', { accept: true }, HANDLE_TIMEOUT_MS)).result; } catch (e) { handleError = errOf(e); }
  let closed = null;
  const tClosedWatch = Date.now();
  while (Date.now() - tClosedWatch < CLOSED_WATCH_MS && !(closed = s1.events.find((e) => e.method === 'Page.javascriptDialogClosed') || null)) await sleep(25);
  receipt.handle = { session: 's1', sentAt: tHandle, result: handleResult, error: handleError, ms: Date.now() - tHandle, closedEvent: closed, closedDelayFromHandleMs: closed ? closed.at - tHandle : null };

  // Diagnostic: a Page-domain command that returns a definite response (no FallThrough) tells
  // whether Page-domain dispatch itself is stalled or only Enable()/its fallthrough is.
  const tGFT = Date.now();
  let gftResult = null, gftError = null;
  try { gftResult = (await s1.send('Page.getFrameTree', {}, 10000)).result ? 'ok' : 'ok-empty'; } catch (e) { gftError = errOf(e); }
  receipt.pageDomainProbe = { command: 'Page.getFrameTree', sentAfterHandle: true, ms: Date.now() - tGFT, result: gftResult, error: gftError };

  // Unblock check on session 1.
  const tryUnblock = async (sess, waitMs) => {
    const t = Date.now(); let finalState = null, unblocked = false, atMs = null;
    while (Date.now() - t < waitMs) {
      try {
        const s = JSON.parse(await sess.evalExpr(STATE_EXPR, EVAL_TIMEOUT_MS));
        finalState = s;
        if (s.phase === 'after-confirm') { unblocked = true; atMs = Date.now() - t; break; }
      } catch {}
      await sleep(POLL_MS);
    }
    return { unblocked, unblockedAfterMs: atMs, finalState };
  };
  let un = await tryUnblock(s1, UNBLOCK_WAIT_MS);

  // If the s1 handle failed, open a second DevTools session to the same target: distinguishes
  // a per-session dispatch stall from a target-level block.
  if (handleError) {
    receipt.session2 = { attempted: true, reason: 's1 Page.handleJavaScriptDialog failed (' + (handleError.message || JSON.stringify(handleError)) + '); disambiguating with a second session' };
    try {
      const s2 = await attachSession(page.webSocketDebuggerUrl, 's2');
      sessions.push(s2); receipt.sessions.s2 = { events: s2.events };
      const tE2 = Date.now();
      let en2 = null, en2Err = null;
      try { en2 = (await s2.send('Page.enable', {}, ENABLE_TIMEOUT_MS)).result; } catch (e) { en2Err = errOf(e); }
      receipt.session2.enable = { sentAt: tE2, respondedAt: en2 ? Date.now() : null, ms: Date.now() - tE2, result: en2, error: en2Err };
      let op2 = null;
      const tW2 = Date.now();
      while (Date.now() - tW2 < OPENING_WAIT_MS) {
        op2 = s2.events.find((e) => e.method === 'Page.javascriptDialogOpening') || null;
        if (op2) break;
        await sleep(25);
      }
      receipt.session2.openingEvent = op2;
      const tH2 = Date.now();
      let h2 = null, h2Err = null;
      try { h2 = (await s2.send('Page.handleJavaScriptDialog', { accept: true }, HANDLE_TIMEOUT_MS)).result; } catch (e) { h2Err = errOf(e); }
      let cl2 = null;
      const tC2 = Date.now();
      while (Date.now() - tC2 < CLOSED_WATCH_MS && !(cl2 = s2.events.find((e) => e.method === 'Page.javascriptDialogClosed') || null)) await sleep(25);
      receipt.session2.handle = { sentAt: tH2, result: h2, error: h2Err, ms: Date.now() - tH2, closedEvent: cl2 };
      const un2 = await tryUnblock(s2, UNBLOCK_WAIT_MS);
      receipt.session2.unblock = un2;
      if (!un.unblocked && un2.unblocked) un = un2;
      receipt.session2.openingRedelivered = !!op2;
    } catch (e) {
      receipt.session2.error = e.message;
      note('session2-error: ' + e.message);
    }
  }

  receipt.unblock = {
    unblocked: un.unblocked, unblockedAfterMs: un.unblockedAfterMs, finalState: un.finalState,
    pageSideBlockedMs: un.finalState && un.finalState.enteredAt != null && un.finalState.returnedAt != null ? un.finalState.returnedAt - un.finalState.enteredAt : null,
  };
  // Did session 1 recover after the dialog closed?
  try { receipt.unblock.s1RecoveredEval = await s1.evalExpr('"s1-ok"', 5000); } catch (e) { receipt.unblock.s1RecoveredEval = null; receipt.unblock.s1RecoveredError = e.message; }
  receipt.verdict = {
    blockedWhilePageDisabled: receipt.blocked.stayedBeforeConfirm,
    evaluatesUnansweredDuringWindow: receipt.blocked.pollNoResponse,
    pageEnableResponded: !enableError,
    pageEnableMs: receipt.pageEnable.ms ?? null,
    openingRedeliveredOnEnable: !!opening || !!(receipt.session2 && receipt.session2.openingRedelivered),
    openingType: (opening || (receipt.session2 && receipt.session2.openingEvent)) ? ((opening || receipt.session2.openingEvent).params.type) : null,
    hasBrowserHandlerFromOpening: (opening || (receipt.session2 && receipt.session2.openingEvent)) ? ((opening || receipt.session2.openingEvent).params.hasBrowserHandler) : null,
    handleSucceeded: !(receipt.handle.error) || !!(receipt.session2 && receipt.session2.handle && !receipt.session2.handle.error),
    handleSession: !(receipt.handle.error) ? 's1' : (receipt.session2 && receipt.session2.handle && !receipt.session2.handle.error ? 's2' : null),
    s1HandleError: receipt.handle.error,
    s2HandleError: receipt.session2 && receipt.session2.handle ? receipt.session2.handle.error : null,
    closedEventDelivered: !!(receipt.handle.closedEvent || (receipt.session2 && receipt.session2.handle && receipt.session2.handle.closedEvent)),
    unblockedAfterHandle: un.unblocked,
    pageSideBlockedMs: receipt.unblock.pageSideBlockedMs,
    s1RecoveredAfterUnblock: !!receipt.unblock.s1RecoveredEval,
  };
} catch (e) {
  note('drive-error: ' + e.message);
  receipt.verdict = { driveError: e.message };
} finally {
  clearTimeout(watchdog);
  await teardown();
}
receipt.finishedAt = new Date().toISOString();
const v = receipt.verdict || {};
const core = v.blockedWhilePageDisabled === true && v.handleSucceeded === true && v.unblockedAfterHandle === true;
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ run: runTag, verdict: receipt.verdict, coreHeld: core, interrupted, watchdogFired, failures: receipt.failures }, null, 1));
process.exitCode = core && !interrupted && !watchdogFired && receipt.failures.length === 0 ? 0 : 1;
setTimeout(() => process.exit(process.exitCode ?? 1), 1500);
