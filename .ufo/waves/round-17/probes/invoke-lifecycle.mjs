#!/usr/bin/env node
// .ufo/waves/round-17/probes/invoke-lifecycle.mjs — C2 discovery probe (round 17, wave 1).
//
// Question (C2 case-predicate falsifier): what do Chromium 154's CDP WebMCP
// lifecycle paths actually emit, in what order, for
//   (1) invokeTool with an unregistered toolName,
//   (2) invokeTool after the tool was unregistered via the registerTool AbortSignal,
//   (3) page navigation while an invocation is pending,
//   (4) page reload while an invocation is pending,
//   (5) target close while an invocation is pending,
// plus the two adjacent ones a harness predicate must not confuse with them:
//   (6) unregistering the tool while its invocation is pending,
//   (7) invoking the old tool name / old frameId after navigation.
//
// Method: raw CDP over the BROWSER websocket (Node 24 built-in WebSocket),
// flattened target sessions, every send/receive recorded with a host-clock
// epoch. Page-side observations travel over same-origin sendBeacon marks, so
// they survive document destruction. Loopback 127.0.0.1 only, temp profile,
// --host-resolver-rules from the round-16 run blocks every other origin.
//
// Launch flags: verbatim from corpus/evidence/round-16/webmcp/receipt.json
// runs[0].effectiveArgv, with exactly three deltas (recorded in the output):
//   - the argv[0] engine path is dropped (we spawn the /usr/bin/chromium launcher),
//   - --remote-debugging-pipe -> --remote-debugging-port=0 (this probe needs the
//     browser websocket; the round-16 harness used the pipe),
//   - --user-data-dir=<r16 temp dir> -> this run's fresh temp dir.
// HOME/XDG_CONFIG_HOME are redirected so the host ~/.config/chromium-flags.conf
// (which injects --ozone-platform, --load-extension, ...) cannot alter argv.
//
// Usage: node invoke-lifecycle.mjs [--out <json>] [--chromium <path>]
// Output: one JSON file (default /tmp/tabi-r17-c2probe-invoke-lifecycle.json)
// plus a stdout summary. Nothing is written inside the lane.
// Predictions are fixed in this file before execution; each case reports
// predictionHeld. This probe invokes only its own loopback fixture tools.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const OUT = opt('out', '/tmp/tabi-r17-c2probe-invoke-lifecycle.json');
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');
const SLOW_MS = 2500;
const LONG_MS = 10000;
const OBSERVE_MS = 3500;

// corpus/evidence/round-16/webmcp/receipt.json runs[0].effectiveArgv, minus
// argv[0], minus --remote-debugging-pipe, minus the r16 --user-data-dir.
const R16_FLAGS = [
  '--disable-field-trial-config',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-back-forward-cache',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-extensions-with-background-pages',
  '--disable-component-update',
  '--no-default-browser-check',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-edgeupdater',
  '--disable-extensions',
  '--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,NetworkTimeServiceQuerying,AimEnabled,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion',
  '--enable-features=CDPScreenshotNewSurface',
  '--allow-pre-commit-input',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-updater-scheduler',
  '--force-color-profile=srgb',
  '--metrics-recording-only',
  '--no-first-run',
  '--password-store=basic',
  '--use-mock-keychain',
  '--no-service-autorun',
  '--export-tagged-pdf',
  '--disable-search-engine-choice-screen',
  '--unsafely-disable-devtools-self-xss-warnings',
  '--edge-skip-compat-layer-relaunch',
  '--disable-infobars',
  '--disable-search-engine-choice-screen',
  '--disable-sync',
  '--enable-unsafe-swiftshader',
  '--headless',
  '--hide-scrollbars',
  '--mute-audio',
  '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sha256File = (p) => sha256(readFileSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cap = (v, n = 6000) => {
  const s = JSON.stringify(v);
  if (s === undefined) return undefined;
  return s.length <= n ? JSON.parse(s) : { truncated: true, bytes: s.length, jsonPrefix: s.slice(0, n) };
};

// ---------------------------------------------------------------- fixture ---
const pageHtml = (names, signalForms = {}) => `<!doctype html>
<html><head><meta charset="utf-8"><title>tabi-r17-invoke-lifecycle</title></head>
<body><h1>invoke-lifecycle fixture</h1>
<script>
(function () {
  var PAGE_TAG = Math.random().toString(36).slice(2, 10);
  var SLOW_MS = ${SLOW_MS};
  var LONG_MS = ${LONG_MS};
  var NAMES = ${JSON.stringify(names)};
  var SIGNAL_FORM = ${JSON.stringify(signalForms)};
  window.__pageTag = PAGE_TAG;
  window.__aborts = {};
  window.__localMarks = [];
  window.__regResult = null;
  function describe(v) {
    if (v === null || v === undefined) return String(v);
    var o = { type: typeof v, ctor: v.constructor && v.constructor.name };
    try { o.protos = Object.getOwnPropertyNames(Object.getPrototypeOf(v)).slice(0, 16); } catch (e) {}
    return o;
  }
  function mark(phase, data) {
    var m = { pageTag: PAGE_TAG, path: location.pathname, phase: phase, data: data, epoch: Date.now(), perf: Math.round(performance.now() * 100) / 100 };
    window.__localMarks.push(m);
    try { navigator.sendBeacon('/mark', JSON.stringify(m)); } catch (e) {}
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function immediate(name) {
    return async function (input, client) {
      mark('execute-start', { name: name, input: input === undefined ? null : input, argc: arguments.length, second: describe(client) });
      var out = name + ':' + (input && input.text);
      mark('execute-return', { name: name, result: out });
      return out;
    };
  }
  function delayed(name, ms) {
    return async function (input, client) {
      mark('execute-start', { name: name, input: input === undefined ? null : input, argc: arguments.length, second: describe(client) });
      await sleep(ms);
      var out = name + ':' + (input && input.text);
      mark('execute-return', { name: name, result: out });
      return out;
    };
  }
  var IMPLS = {
    echo: immediate('echo'),
    'second-tool': immediate('second-tool'),
    slow: delayed('slow', SLOW_MS),
    abortable: delayed('abortable', SLOW_MS),
    slowlong: delayed('slowlong', LONG_MS)
  };
  window.__registerAll = async function () {
    var mc = document.modelContext;
    var out = { pageTag: PAGE_TAG, hasModelContext: !!mc, registerToolLength: mc && mc.registerTool ? mc.registerTool.length : null, registered: [], failed: [] };
    if (!mc) { mark('no-model-context', {}); return out; }
    for (var i = 0; i < NAMES.length; i++) {
      var name = NAMES[i];
      var ac = new AbortController();
      window.__aborts[name] = ac;
      try {
        var def = {
          name: name,
          description: name + ' lifecycle probe tool',
          inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
          execute: IMPLS[name] || immediate(name)
        };
        // The 2nd argument is a ModelContextToolOptions dictionary: the signal
        // must be a property ({ signal }). A bare AbortSignal in that position
        // is accepted by WebIDL but converts to an empty dictionary.
        if (SIGNAL_FORM[name] === 'bare-signal') await mc.registerTool(def, ac.signal);
        else await mc.registerTool(def, { signal: ac.signal });
        out.registered.push(name);
      } catch (e) { out.failed.push({ name: name, err: String(e) }); }
    }
    mark('registered', out);
    return out;
  };
  window.__getTools = async function () {
    var mc = document.modelContext;
    if (!mc || typeof mc.getTools !== 'function') return { ok: false, reason: 'no-getTools' };
    try {
      var r = mc.getTools();
      if (r && typeof r.then === 'function') r = await r;
      return { ok: true, count: (r || []).length, tools: (r || []).map(function (t) { return { name: t.name, inputSchemaType: typeof t.inputSchema }; }) };
    } catch (e) { return { ok: false, err: String(e) }; }
  };
  window.__abort = function (name) {
    var ac = window.__aborts[name];
    if (!ac) return { ok: false, reason: 'no-controller', name: name };
    ac.abort();
    mark('aborted', { name: name });
    return { ok: true, name: name };
  };
  window.__regPromise = window.__registerAll().then(function (r) { window.__regResult = r; return r; });
})();
</script></body></html>`;

// ------------------------------------------------------------ cdp client ---
const PROC_EPOCH0 = Date.now();

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const raw = [];
  const pending = new Map();
  const events = [];
  const waiters = new Set();
  let nextId = 0;
  const rec = (dir, msg) => {
    if (raw.length < 20000) raw.push({ seq: raw.length + 1, epoch: Date.now(), dir, msg });
  };
  ws.addEventListener('message', (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch { rec('recv-unparsed', String(ev.data).slice(0, 500)); return; }
    if (m.id !== undefined && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      clearTimeout(p.timer);
      rec('recv', m);
      p.resolve({ ok: !m.error, result: m.result, error: m.error, method: p.method, sessionId: p.sessionId, epoch: Date.now() });
      return;
    }
    rec('recv', m);
    if (!m.method) return;
    const e = { method: m.method, params: m.params, sessionId: m.sessionId ?? null, epoch: Date.now(), raw: m };
    events.push(e);
    for (const w of [...waiters]) {
      if (w.pred(e)) { waiters.delete(w); clearTimeout(w.timer); w.resolve({ found: true, event: e, waitedMs: Date.now() - w.startedAt }); }
    }
  });
  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', (ev) => reject(new Error(`websocket error: ${ev?.message || 'unknown'}`)));
  });
  const send = (method, params = {}, sessionId, timeoutMs = 5000) => new Promise((resolve) => {
    const id = ++nextId;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ ok: false, timeout: true, method, sessionId, epoch: Date.now() });
    }, timeoutMs);
    pending.set(id, { resolve, timer, method, sessionId });
    rec('send', msg);
    try { ws.send(JSON.stringify(msg)); } catch (e) {
      pending.delete(id); clearTimeout(timer);
      resolve({ ok: false, sendError: String(e), method, sessionId, epoch: Date.now() });
    }
  });
  const waitFor = (pred, ms, from = events.length) => {
    for (let i = from; i < events.length; i++) if (pred(events[i])) return Promise.resolve({ found: true, event: events[i], waitedMs: 0 });
    return new Promise((resolve) => {
      const w = { pred, startedAt: Date.now(), resolve: (r) => resolve({ ...r, waitedMs: Date.now() - w.startedAt }) };
      w.timer = setTimeout(() => { waiters.delete(w); resolve({ found: false, waitedMs: ms }); }, ms);
      waiters.add(w);
    });
  };
  return {
    ws, raw, events, send, waitFor,
    close: () => { try { ws.close(); } catch {} },
  };
}

// ------------------------------------------------------------------ main ----
const out = {
  schema: 'tabi-round17-webmcp-invoke-lifecycle-probe-v1',
  probe: 'invoke-lifecycle',
  seat: 'C2ProbeLifecycle',
  capturedAt: new Date().toISOString(),
  question: 'CDP error/event payloads and their order for unknown toolName, invoke-after-unregister, and navigate/reload/close while an invocation is pending; adjacent: unregister-while-pending, invoke-old-name/frame after navigation.',
  scope: 'loopback 127.0.0.1 only; fresh temp profile; only this probe fixture\'s own tools invoked',
  predictionsFixedBeforeRun: true,
  fixture: { slowMs: SLOW_MS, longMs: LONG_MS, observeMs: OBSERVE_MS },
  cases: [],
  raw: [],
};

let child = null, server = null, cdp = null;
let profile = null;
const serverMarks = [];
const serverRequests = [];
const srvT0 = Date.now();

const shutdown = async () => {
  try { cdp && cdp.close(); } catch {}
  try { server && server.close(); } catch {}
  if (child && child.pid && !out.shutdown) {
    const pid = child.pid;
    let exited = false;
    const onExit = new Promise((r) => child.once('exit', () => { exited = true; r(); }));
    try { process.kill(-pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} }
    await Promise.race([onExit, sleep(5000)]);
    await sleep(250);
    const survivors = [];
    for (const d of readdirSync('/proc')) {
      if (!/^\d+$/.test(d)) continue;
      try {
        const cmd = readFileSync(`/proc/${d}/cmdline`).toString('utf8');
        if (profile && cmd.includes(profile)) survivors.push({ pid: Number(d), cmd: cmd.split('\0').filter(Boolean).slice(0, 3).join(' ') });
      } catch {}
    }
    let pidGone = false, killZero = null;
    try { process.kill(pid, 0); killZero = 'alive'; } catch (e) { killZero = e.code || String(e); pidGone = e.code === 'ESRCH'; }
    out.shutdown = {
      signal: 'SIGKILL', sentToProcessGroup: -pid, childExitEvent: exited,
      pid, pidGone, killZero, procExeStillPresent: existsSync(`/proc/${pid}`), survivors,
    };
  }
};

try {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  out.producerSha256 = sha256File(new URL(import.meta.url).pathname);
  out.runtime = {
    node: process.version,
    chromiumLaunchPath: CHROMIUM,
    chromiumLaunchSha256: sha256File(CHROMIUM),
    hostChromiumFlagsConf: existsSync(join(process.env.HOME || '', '.config/chromium-flags.conf')),
  };

  // ---- loopback fixture server ----
  server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'POST' && url.pathname === '/mark') {
      const chunks = [];
      let size = 0;
      req.on('data', (c) => { size += c.length; if (size <= 16384) chunks.push(c); });
      req.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch {}
        serverMarks.push({ ...parsed, receivedEpoch: Date.now(), receivedAfterSrvStartMs: Date.now() - srvT0 });
        res.writeHead(204); res.end();
      });
      return;
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/second' || url.pathname === '/ab')) {
      serverRequests.push({ path: url.pathname, epoch: Date.now(), afterSrvStartMs: Date.now() - srvT0 });
      const names = url.pathname === '/second' ? ['second-tool']
        : url.pathname === '/ab' ? ['sigopt', 'sigraw']
        : ['echo', 'slow', 'slowlong', 'abortable'];
      const signalForms = url.pathname === '/ab' ? { sigraw: 'bare-signal' } : {};
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(pageHtml(names, signalForms));
      return;
    }
    serverRequests.push({ path: url.pathname, epoch: Date.now(), afterSrvStartMs: Date.now() - srvT0, status: 404 });
    res.writeHead(404); res.end('not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  out.fixture.origin = origin;
  out.fixture.pages = { main: `${origin}/`, second: `${origin}/second` };

  // ---- launch ----
  profile = mkdtempSync(join(tmpdir(), 'tabi-r17-lifecycle-'));
  const fakeHome = join(profile, 'home');
  mkdirSync(join(fakeHome, '.config'), { recursive: true });
  const argv = [...R16_FLAGS, `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'];
  out.launch = {
    requestedArgv: argv,
    deltasFromR16: [
      'dropped argv[0] /usr/lib/chromium/chromium (spawning the /usr/bin/chromium launcher)',
      '--remote-debugging-pipe -> --remote-debugging-port=0 (browser websocket for this probe)',
      'r16 temp --user-data-dir -> this run\'s fresh temp profile',
    ],
    envOverrides: { HOME: '<temp>', XDG_CONFIG_HOME: '<temp>/.config' },
  };
  const stderrChunks = [];
  child = spawn(CHROMIUM, argv, {
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, HOME: fakeHome, XDG_CONFIG_HOME: join(fakeHome, '.config') },
  });
  child.stderr.on('data', (d) => { if (stderrChunks.length < 200) stderrChunks.push(d); });
  out.launch.pid = child.pid;

  let cdpPort = null;
  for (let i = 0; i < 300 && !cdpPort; i++) {
    const f = join(profile, 'DevToolsActivePort');
    if (existsSync(f)) {
      const first = readFileSync(f, 'utf8').split('\n')[0].trim();
      if (/^\d+$/.test(first)) cdpPort = Number(first);
    }
    if (!cdpPort) await sleep(100);
  }
  if (!cdpPort) throw new Error(`DevToolsActivePort never appeared; stderr tail: ${Buffer.concat(stderrChunks).toString('utf8').slice(-800)}`);
  out.launch.cdpPort = cdpPort;

  // Chromium rewrites its own /proc/<pid>/cmdline into one space-joined title
  // string (NUL separation is gone), so args are matched as substrings.
  try {
    const title = readFileSync(`/proc/${child.pid}/cmdline`).toString('utf8').split('\0').filter(Boolean);
    out.launch.procCmdlineEntries = title.length;
    out.launch.effectiveTitle = title.join(' ');
  } catch (e) { out.launch.effectiveArgvError = String(e); }
  try {
    out.launch.realExecutable = readlinkSync(`/proc/${child.pid}/exe`);
    out.launch.realExecutableSha256 = sha256File(out.launch.realExecutable);
  } catch (e) { out.launch.realExecutableError = String(e); }
  out.launch.requestedFlagsMissingFromTitle = argv.filter((a) => !(out.launch.effectiveTitle || '').includes(a));
  out.launch.webmcpFlagTokensInTitle = (out.launch.effectiveTitle || '').match(/--enable-(?:features|blink-features)=\S*/g) || [];
  out.launch.titleStartsWithRealExecutable = !!out.launch.realExecutable &&
    (out.launch.effectiveTitle || '').startsWith(out.launch.realExecutable);

  const version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
  out.runtime.product = version.Browser;
  out.runtime.protocolVersion = version['Protocol-Version'];
  const wsUrl = version.webSocketDebuggerUrl;
  out.runtime.browserWebSocketHost = new URL(wsUrl).host;
  if (new URL(wsUrl).hostname !== '127.0.0.1') throw new Error(`refusing non-loopback CDP host ${wsUrl}`);

  cdp = connect(wsUrl);
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('browser websocket open timeout')), 10000);
    cdp.ws.addEventListener('open', () => { clearTimeout(t); resolve(); });
    cdp.ws.addEventListener('error', (e) => { clearTimeout(t); reject(new Error(`ws error ${e?.message || ''}`)); });
  });
  const send = cdp.send;
  const events = cdp.events;

  await send('Target.setDiscoverTargets', { discover: true });
  // WebMCP is a page-target domain: enabling it on the browser session answers
  // -32601 "'WebMCP.enable' wasn't found" (observed here). Each page session
  // enables it in openTarget; the per-session enable result is recorded.
  out.browserLevelWebmcpEnable = await send('WebMCP.enable');

  // ---- helpers ----
  const trimEvent = (e) => ({ epoch: e.epoch, method: e.method, sessionId: e.sessionId, params: cap(e.params) });
  const newCase = (id, question, prediction) => {
    const c = {
      id, question, prediction,
      predicateForHarness: null,
      predictionHeld: null,
      steps: [],
      observations: {},
    };
    c._ev = events.length;
    c._marks = serverMarks.length;
    c._reqs = serverRequests.length;
    out.cases.push(c);
    return c;
  };
  const endCase = (c) => {
    c.events = events.slice(c._ev).filter((e) => /^(WebMCP\.|Page\.(frameNavigated|frameStartedLoading|loadEventFired|lifecycleEvent)|Runtime\.(executionContextsCleared|executionContextDestroyed|executionContextCreated)|Target\.)/.test(e.method)).map(trimEvent);
    c.pageMarks = serverMarks.slice(c._marks);
    c.requests = serverRequests.slice(c._reqs);
    delete c._ev; delete c._marks; delete c._reqs;
  };
  const openTarget = async (path, wantTools) => {
    const t = await send('Target.createTarget', { url: 'about:blank' });
    const targetId = t.result.targetId;
    const a = await send('Target.attachToTarget', { targetId, flatten: true });
    const sid = a.result.sessionId;
    await send('Page.enable', {}, sid);
    await send('Runtime.enable', {}, sid);
    const we = await send('WebMCP.enable', {}, sid);
    const nav = await send('Page.navigate', { url: origin + path }, sid);
    const frameId = nav.result.frameId;
    // registration is sequential in the fixture, so the LAST wanted name's
    // toolsAdded witnesses that every earlier one is already announced.
    const lastName = wantTools[wantTools.length - 1];
    const added = await cdp.waitFor((e) => e.sessionId === sid && e.method === 'WebMCP.toolsAdded' &&
      (e.params.tools || []).some((x) => x.name === lastName), 8000);
    const st = await send('Runtime.evaluate', {
      expression: 'JSON.stringify({hasModelContext: !!document.modelContext, tag: window.__pageTag, reg: window.__regResult, marks: (window.__localMarks || []).map(function (m) { return m.phase; })})',
      returnByValue: true,
    }, sid);
    let pageState;
    if (st.ok && st.result && typeof st.result.value === 'string') {
      try { pageState = JSON.parse(st.result.value); } catch { pageState = { unparsable: true, value: st.result.value }; }
    } else pageState = { evaluateRaw: cap(st) };
    return { targetId, sid, frameId, enable: we, toolsAdded: added.found ? added.event : null, pageState };
  };

  // =================== T1: unknown / after-unregister / unregister-pending / navigate-pending
  const t1 = await openTarget('/', ['echo', 'slow', 'slowlong', 'abortable']);
  const t1Meta = { targetId: t1.targetId, sessionId: t1.sid, frameId: t1.frameId, enable: t1.enable, toolsAdded: cap(t1.toolsAdded?.params), pageState: t1.pageState };

  // ---- case 1: unknown toolName
  {
    const c = newCase('invoke-unknown-tool', 'WebMCP.invokeTool with a name that was never registered in this frame',
      { kind: 'protocol_error', code: -32602, message: 'Tool not found', eventsExpected: 0 });
    c.observations.target = t1Meta;
    const from = events.length;
    const r = await send('WebMCP.invokeTool', { frameId: t1.frameId, toolName: 'no-such-tool', input: {} }, t1.sid);
    c.steps.push({ label: 'invokeTool no-such-tool', request: { frameId: t1.frameId, toolName: 'no-such-tool', input: {} }, response: cap(r) });
    await sleep(500);
    const evs = events.slice(from).filter((e) => e.method.startsWith('WebMCP.'));
    c.observations.webmcpEventsAfter = evs.map(trimEvent);
    c.observations.eventCount = evs.length;
    c.predicateForHarness = 'response.ok === false && response.error.code === -32602 && response.error.message === "Tool not found" && zero WebMCP.toolInvoked/toolResponded events for this frame within 500 ms';
    c.predictionHeld = r.ok === false && r.error?.code === -32602 && r.error?.message === 'Tool not found' && evs.length === 0;
    endCase(c);
  }

  // ---- case 2: invoke after unregister (AbortSignal in the options dictionary)
  {
    const c = newCase('invoke-after-unregister', 'abort the registerTool options.signal, wait WebMCP.toolsRemoved, then invokeTool the removed name',
      { toolsRemoved: true, kind: 'protocol_error', code: -32602, message: 'Tool not found', eventsExpected: 0 });
    const from = events.length;
    const before = await send('Runtime.evaluate', { expression: 'window.__getTools()', awaitPromise: true, returnByValue: true }, t1.sid);
    c.steps.push({ label: 'getTools() before abort', response: cap(before) });
    const ab = await send('Runtime.evaluate', { expression: 'window.__abort("abortable")', returnByValue: true }, t1.sid);
    const removed = await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolsRemoved' &&
      (e.params.tools || []).some((t) => t.name === 'abortable'), 3000, from);
    c.steps.push({ label: 'abort options.signal for abortable', response: cap(ab) });
    c.observations.toolsRemoved = removed.found ? trimEvent(removed.event) : null;
    const after = await send('Runtime.evaluate', { expression: 'window.__getTools()', awaitPromise: true, returnByValue: true }, t1.sid);
    c.steps.push({ label: 'getTools() after abort', response: cap(after) });
    const evFrom = events.length;
    const r = await send('WebMCP.invokeTool', { frameId: t1.frameId, toolName: 'abortable', input: { text: 'after-unregister' } }, t1.sid);
    c.steps.push({ label: 'invokeTool abortable after removal', request: { frameId: t1.frameId, toolName: 'abortable', input: { text: 'after-unregister' } }, response: cap(r) });
    const invocationId = r.result?.invocationId ?? null;
    const responded = invocationId
      ? await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolResponded' && e.params.invocationId === invocationId, 3500, evFrom)
      : { found: false, waitedMs: 0 };
    c.observations.toolResponded = responded.found ? trimEvent(responded.event) : null;
    await sleep(300);
    const evs = events.slice(evFrom).filter((e) => e.method.startsWith('WebMCP.'));
    c.observations.webmcpEventsAfter = evs.map(trimEvent);
    c.observations.eventCount = evs.length;
    c.predicateForHarness = 'a WebMCP.toolsRemoved {name} arrives on abort; a later invokeTool for that name is a protocol error -32602 "Tool not found" with no toolInvoked/toolResponded';
    const removedThenError = !!removed.found && r.ok === false && r.error?.code === -32602 && r.error?.message === 'Tool not found' && evs.length === 0;
    c.predictionHeld = removedThenError;
    c.observations.outcome = removedThenError ? 'predicted' : (!removed.found ? 'no-toolsRemoved' : 'invocationId-returned');
    endCase(c);
  }

  // ---- case 3: unregister while the invocation is pending (adjacent discriminator)
  {
    const c = newCase('invoke-unregister-while-pending', 'invoke slow (2500 ms), then abort its registration while the invocation is pending',
      { pendingInvocationSurvives: true, status: 'Completed' });
    const from = events.length;
    const inv = await send('WebMCP.invokeTool', { frameId: t1.frameId, toolName: 'slow', input: { text: 'unregister-pending' } }, t1.sid);
    const invocationId = inv.result?.invocationId;
    c.steps.push({ label: 'invokeTool slow', request: { frameId: t1.frameId, toolName: 'slow', input: { text: 'unregister-pending' } }, response: cap(inv) });
    const invoked = await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolInvoked' && e.params.invocationId === invocationId, 2000, from);
    c.observations.toolInvoked = invoked.found ? trimEvent(invoked.event) : null;
    const ab = await send('Runtime.evaluate', { expression: 'window.__abort("slow")', returnByValue: true }, t1.sid);
    const removed = await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolsRemoved' &&
      (e.params.tools || []).some((t) => t.name === 'slow'), 3000, from);
    c.steps.push({ label: 'abort signal for slow while pending', response: cap(ab) });
    c.observations.toolsRemovedWhilePending = removed.found ? trimEvent(removed.event) : null;
    const responded = await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolResponded' && e.params.invocationId === invocationId, SLOW_MS + 2500, from);
    c.observations.toolResponded = responded.found ? trimEvent(responded.event) : null;
    if (responded.found) {
      c.observations.responseEpochMinusAbortEpoch = responded.event.epoch - (removed.found ? removed.event.epoch : NaN);
    }
    await sleep(300);
    c.observations.pageMarks = serverMarks.slice(c._marks).filter((m) => m.pageTag);
    c.predicateForHarness = 'abort of the registration does not cancel an already-started invocation: toolResponded for that invocationId arrives with status "Completed" even though toolsRemoved already fired';
    c.predictionHeld = !!responded.found && responded.event.params.status === 'Completed';
    endCase(c);
  }

  // ---- case 4: navigate while pending
  let navInvocationId = null;
  let oldFrameId = t1.frameId;
  let newFrameId = null;
  {
    const c = newCase('invoke-navigation-pending', 'invoke slowlong (10000 ms), then Page.navigate to /second while the invocation is pending',
      { toolResponded: 'none or Canceled', toolsRemovedOnNavigation: false, frameNavigated: true, executionContextsCleared: true });
    const from = events.length;
    const inv = await send('WebMCP.invokeTool', { frameId: t1.frameId, toolName: 'slowlong', input: { text: 'nav-pending' } }, t1.sid);
    navInvocationId = inv.result?.invocationId;
    c.steps.push({ label: 'invokeTool slowlong', request: { frameId: t1.frameId, toolName: 'slowlong', input: { text: 'nav-pending' } }, response: cap(inv) });
    const invoked = await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolInvoked' && e.params.invocationId === navInvocationId, 2000, from);
    c.observations.toolInvoked = invoked.found ? trimEvent(invoked.event) : null;
    const navFrom = events.length;
    const nav = await send('Page.navigate', { url: origin + '/second' }, t1.sid);
    c.steps.push({ label: 'Page.navigate /second while pending', request: { url: origin + '/second' }, response: cap(nav) });
    await sleep(OBSERVE_MS);
    const evs = events.slice(navFrom);
    newFrameId = nav.result?.frameId ?? null;
    c.observations.navigatedFrameId = newFrameId;
    c.observations.reportedFrameIdUnchanged = newFrameId === oldFrameId;
    c.observations.webmcpEvents = evs.filter((e) => e.method.startsWith('WebMCP.')).map(trimEvent);
    c.observations.orderEvents = evs.filter((e) => /^(Page\.frameNavigated|Runtime\.executionContextsCleared|Runtime\.executionContextDestroyed|WebMCP\.)/.test(e.method)).map(trimEvent);
    c.observations.toolRespondedForPending = evs.find((e) => e.method === 'WebMCP.toolResponded' && e.params.invocationId === navInvocationId) ? trimEvent(evs.find((e) => e.method === 'WebMCP.toolResponded' && e.params.invocationId === navInvocationId)) : null;
    c.observations.toolsRemovedForOldTool = evs.some((e) => e.method === 'WebMCP.toolsRemoved' && (e.params.tools || []).some((t) => t.name === 'slowlong'));
    c.observations.secondToolAdded = evs.some((e) => e.method === 'WebMCP.toolsAdded' && (e.params.tools || []).some((t) => t.name === 'second-tool'));
    c.observations.pageMarks = serverMarks.slice(c._marks);
    c.observations.requests = serverRequests.slice(c._reqs);
    c.predicateForHarness = 'navigating a frame with a pending invocation emits no toolResponded for that invocationId and no toolsRemoved for the old tool; it DOES emit Page.frameNavigated and Runtime.executionContextsCleared (in that order as observed), then toolsAdded for the new document';
    c.predictionHeld = c.observations.toolRespondedForPending === null && c.observations.toolsRemovedForOldTool === false && !!newFrameId;
    endCase(c);
  }

  // ---- case 5: invoke the old name / old frameId after navigation
  {
    const c = newCase('invoke-after-navigation-old-name', 'after the navigation completed, invokeTool the pre-navigation tool name (and the old frameId if it differs)',
      { kind: 'protocol_error', code: -32602, message: 'Tool not found' });
    await cdp.waitFor((e) => e.sessionId === t1.sid && e.method === 'WebMCP.toolsAdded' && (e.params.tools || []).some((t) => t.name === 'second-tool'), 4000);
    const frameId = newFrameId || t1.frameId;
    const r = await send('WebMCP.invokeTool', { frameId, toolName: 'slowlong', input: { text: 'post-nav' } }, t1.sid);
    c.steps.push({ label: 'invokeTool slowlong after navigation (new frameId)', request: { frameId, toolName: 'slowlong', input: { text: 'post-nav' } }, response: cap(r) });
    if (oldFrameId && oldFrameId !== frameId) {
      const r2 = await send('WebMCP.invokeTool', { frameId: oldFrameId, toolName: 'slowlong', input: { text: 'old-frame' } }, t1.sid);
      c.steps.push({ label: 'invokeTool slowlong with pre-navigation frameId', request: { frameId: oldFrameId, toolName: 'slowlong' }, response: cap(r2) });
    } else {
      c.observations.oldFrameIdEqualsNew = true;
    }
    await sleep(300);
    c.predicateForHarness = 'after navigation the old tool name is gone from that frame: -32602 "Tool not found" (no event); a pre-navigation frameId that still resolves behaves the same';
    c.predictionHeld = r.ok === false && r.error?.code === -32602 && r.error?.message === 'Tool not found';
    endCase(c);
  }

  // =================== T1b: which second-argument form wires the removal signal
  {
    const ta = await openTarget('/ab', ['sigopt', 'sigraw']);
    const c = newCase('signal-form-ab', 'abort a tool registered with options.signal={signal} and one registered with a bare AbortSignal as the 2nd positional argument',
      { removedFor: ['sigopt'], removedForBare: false, invokeAfterOptionsAbort: '-32602 Tool not found', invokeAfterBareAbort: 'invocationId then Completed' });
    c.observations.target = { targetId: ta.targetId, sessionId: ta.sid, frameId: ta.frameId, pageState: ta.pageState, toolsAdded: cap(ta.toolsAdded?.params) };
    const from = events.length;
    const abOpt = await send('Runtime.evaluate', { expression: 'window.__abort("sigopt")', returnByValue: true }, ta.sid);
    const abRaw = await send('Runtime.evaluate', { expression: 'window.__abort("sigraw")', returnByValue: true }, ta.sid);
    c.steps.push({ label: 'abort {signal} tool (sigopt)', response: cap(abOpt) });
    c.steps.push({ label: 'abort bare-signal tool (sigraw)', response: cap(abRaw) });
    await sleep(1500);
    const removed = events.slice(from).filter((e) => e.method === 'WebMCP.toolsRemoved').map(trimEvent);
    c.observations.toolsRemoved = removed;
    c.observations.removedNames = removed.flatMap((e) => (e.params.tools || []).map((t) => t.name));
    const gt = await send('Runtime.evaluate', { expression: 'window.__getTools()', awaitPromise: true, returnByValue: true }, ta.sid);
    c.steps.push({ label: 'getTools() after both aborts', response: cap(gt) });
    const evFrom = events.length;
    const rOpt = await send('WebMCP.invokeTool', { frameId: ta.frameId, toolName: 'sigopt', input: { text: 'after-abort-options' } }, ta.sid);
    const rRaw = await send('WebMCP.invokeTool', { frameId: ta.frameId, toolName: 'sigraw', input: { text: 'after-abort-bare' } }, ta.sid);
    c.steps.push({ label: 'invokeTool sigopt ({signal} aborted)', response: cap(rOpt) });
    c.steps.push({ label: 'invokeTool sigraw (bare signal aborted)', response: cap(rRaw) });
    let rawResp = null;
    if (rRaw.result?.invocationId) {
      const w = await cdp.waitFor((e) => e.sessionId === ta.sid && e.method === 'WebMCP.toolResponded' &&
        e.params.invocationId === rRaw.result.invocationId, 3000, evFrom);
      rawResp = w.found ? trimEvent(w.event) : null;
    }
    c.observations.rawToolResponded = rawResp;
    c.observations.webmcpEvents = events.slice(evFrom).filter((e) => e.method.startsWith('WebMCP.')).map(trimEvent);
    c.observations.pageMarks = serverMarks.slice(c._marks);
    c.predicateForHarness = 'the removal signal is the `signal` property of the second (options dictionary) argument: {signal} abort -> toolsRemoved + name gone from getTools() + invokeTool -32602 "Tool not found"; a bare AbortSignal in that position is accepted but wires nothing -> no toolsRemoved, invokeTool still returns an invocationId and the tool Completes';
    c.predictionHeld = c.observations.removedNames.length === 1 && c.observations.removedNames[0] === 'sigopt' &&
      rOpt.ok === false && rOpt.error?.code === -32602 && rOpt.error?.message === 'Tool not found' &&
      rRaw.ok === true && !!rRaw.result?.invocationId && rawResp?.params?.status === 'Completed';
    endCase(c);
  }

  // =================== T2: reload while pending
  {
    const t2 = await openTarget('/', ['echo', 'slow', 'slowlong', 'abortable']);
    const c = newCase('invoke-reload-pending', 'invoke slowlong, then Page.reload({ignoreCache:true}) while the invocation is pending',
      { toolResponded: 'none or Canceled', toolsRemovedOnReload: false });
    c.observations.target = { targetId: t2.targetId, sessionId: t2.sid, frameId: t2.frameId, toolsAdded: cap(t2.toolsAdded?.params) };
    const from = events.length;
    const inv = await send('WebMCP.invokeTool', { frameId: t2.frameId, toolName: 'slowlong', input: { text: 'reload-pending' } }, t2.sid);
    const invocationId = inv.result?.invocationId;
    c.steps.push({ label: 'invokeTool slowlong', request: { frameId: t2.frameId, toolName: 'slowlong', input: { text: 'reload-pending' } }, response: cap(inv) });
    const invoked = await cdp.waitFor((e) => e.sessionId === t2.sid && e.method === 'WebMCP.toolInvoked' && e.params.invocationId === invocationId, 2000, from);
    c.observations.toolInvoked = invoked.found ? trimEvent(invoked.event) : null;
    const reloadFrom = events.length;
    const rel = await send('Page.reload', { ignoreCache: true }, t2.sid);
    c.steps.push({ label: 'Page.reload while pending', response: cap(rel) });
    await sleep(OBSERVE_MS);
    const evs = events.slice(reloadFrom);
    c.observations.webmcpEvents = evs.filter((e) => e.method.startsWith('WebMCP.')).map(trimEvent);
    c.observations.orderEvents = evs.filter((e) => /^(Page\.frameNavigated|Runtime\.executionContextsCleared|Runtime\.executionContextDestroyed|WebMCP\.)/.test(e.method)).map(trimEvent);
    const tr = evs.find((e) => e.method === 'WebMCP.toolResponded' && e.params.invocationId === invocationId);
    c.observations.toolRespondedForPending = tr ? trimEvent(tr) : null;
    c.observations.toolsRemovedOnReload = evs.filter((e) => e.method === 'WebMCP.toolsRemoved').map(trimEvent);
    c.observations.slowlongReAddedAfterReload = evs.some((e) => e.method === 'WebMCP.toolsAdded' && (e.params.tools || []).some((t) => t.name === 'slowlong'));
    c.observations.requests = serverRequests.slice(c._reqs);
    c.observations.pageMarks = serverMarks.slice(c._marks);
    c.predicateForHarness = 'reload with a pending invocation emits no toolResponded for that invocationId and no toolsRemoved; the new document re-announces its tools via toolsAdded';
    c.predictionHeld = c.observations.toolRespondedForPending === null && c.observations.toolsRemovedOnReload.length === 0;
    endCase(c);
  }

  // =================== T3: close target while pending
  {
    const t3 = await openTarget('/', ['echo', 'slow', 'slowlong', 'abortable']);
    const c = newCase('invoke-close-pending', 'invoke slowlong, then Target.closeTarget while the invocation is pending',
      { toolResponded: 'none (session dies)', targetDestroyed: true, detachedFromTarget: true });
    c.observations.target = { targetId: t3.targetId, sessionId: t3.sid, frameId: t3.frameId };
    const from = events.length;
    const inv = await send('WebMCP.invokeTool', { frameId: t3.frameId, toolName: 'slowlong', input: { text: 'close-pending' } }, t3.sid);
    const invocationId = inv.result?.invocationId;
    c.steps.push({ label: 'invokeTool slowlong', request: { frameId: t3.frameId, toolName: 'slowlong', input: { text: 'close-pending' } }, response: cap(inv) });
    const invoked = await cdp.waitFor((e) => e.sessionId === t3.sid && e.method === 'WebMCP.toolInvoked' && e.params.invocationId === invocationId, 2000, from);
    c.observations.toolInvoked = invoked.found ? trimEvent(invoked.event) : null;
    const closeFrom = events.length;
    const cl = await send('Target.closeTarget', { targetId: t3.targetId });
    c.steps.push({ label: 'Target.closeTarget while pending', request: { targetId: t3.targetId }, response: cap(cl) });
    await sleep(2500);
    const evs = events.slice(closeFrom);
    c.observations.webmcpEvents = evs.filter((e) => e.method.startsWith('WebMCP.')).map(trimEvent);
    c.observations.targetEvents = evs.filter((e) => e.method.startsWith('Target.')).map(trimEvent);
    c.observations.order = evs.filter((e) => /^(Target\.|WebMCP\.)/.test(e.method)).map((e) => ({ epoch: e.epoch, method: e.method, sessionId: e.sessionId }));
    const tr = evs.find((e) => e.method === 'WebMCP.toolResponded' && e.params.invocationId === invocationId);
    c.observations.toolRespondedForPending = tr ? trimEvent(tr) : null;
    const probeAfter = await send('Runtime.evaluate', { expression: '1+1', returnByValue: true }, t3.sid, 2000);
    c.steps.push({ label: 'Runtime.evaluate on the closed session (after close)', response: cap(probeAfter) });
    c.observations.closedSessionCommand = { ok: probeAfter.ok, error: probeAfter.error, timeout: probeAfter.timeout === true };
    c.observations.pageMarks = serverMarks.slice(c._marks);
    c.observations.requests = serverRequests.slice(c._reqs);
    c.predicateForHarness = 'closing the target with a pending invocation emits Target.targetDestroyed (and Target.detachedFromTarget), never toolResponded for the invocationId; later commands on that session id fail with a protocol error (or time out)';
    c.predictionHeld = c.observations.toolRespondedForPending === null && c.observations.targetEvents.some((e) => e.method === 'Target.targetDestroyed');
    endCase(c);
  }

  // =================== late-response sweep
  const invocationIds = [];
  for (const c of out.cases) {
    for (const s of c.steps) {
      if (s.response?.result?.invocationId) invocationIds.push({ case: c.id, invocationId: s.response.result.invocationId, invokeEpoch: s.response.epoch });
    }
  }
  // Every pending invocation used the LONG_MS tool, so wait until each is past
  // its own timer before the sweep: "no toolResponded" then means "not even
  // after the tool would have resolved", not merely "not yet".
  const lastInvoke = invocationIds.reduce((m, x) => Math.max(m, x.invokeEpoch), 0);
  const extraWaitMs = Math.max(0, lastInvoke + LONG_MS + 500 - Date.now());
  out.timerSweepWaitMs = extraWaitMs;
  if (extraWaitMs > 0) await sleep(extraWaitMs);
  const sweepEpoch = Date.now();
  out.observationWindow = { sweepEpoch, runStartEpoch: PROC_EPOCH0, totalWallMs: sweepEpoch - PROC_EPOCH0 };
  out.lateResponses = invocationIds.map(({ case: id, invocationId, invokeEpoch }) => {
    const hits = events.filter((e) => e.method === 'WebMCP.toolResponded' && e.params.invocationId === invocationId);
    return {
      case: id, invocationId,
      elapsedSinceInvokeMs: sweepEpoch - invokeEpoch,
      responded: hits.length,
      responses: hits.map(trimEvent),
    };
  });

  out.raw = cdp.raw;
  out.eventTotals = {
    total: events.length,
    byMethod: events.reduce((acc, e) => { acc[e.method] = (acc[e.method] || 0) + 1; return acc; }, {}),
  };
  out.verdict = {
    cases: out.cases.length,
    predictionsHeld: out.cases.filter((c) => c.predictionHeld === true).length,
    predictionsFailed: out.cases.filter((c) => c.predictionHeld === false).map((c) => c.id),
    unknowns: out.cases.filter((c) => c.predictionHeld === null).map((c) => c.id),
  };
} catch (e) {
  out.fatal = String(e.stack || e);
  out.verdict = { fatal: String(e) };
  process.exitCode = 1;
} finally {
  try { if (cdp) out.raw = cdp.raw; } catch {}
  try {
    if (cdp && out.cases.length) {
      for (const c of out.cases) {
        const t = c.observations?.target;
        if (t?.targetId) await cdp.send('Target.closeTarget', { targetId: t.targetId }, undefined, 1000);
      }
    }
  } catch {}
  await shutdown();
  try { server && server.close(); } catch {}
  try { if (profile) rmSync(profile, { recursive: true, force: true }); } catch (e) { out.profileCleanupError = String(e); }
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
}

// stdout summary (exact payloads, trimmed)
const line = (s) => process.stdout.write(s + '\n');
line(`probe=invoke-lifecycle out=${OUT}`);
if (out.fatal) line(`FATAL ${out.fatal.split('\n')[0]}`);
line(`browser=${out.runtime?.product} pid=${out.launch?.pid} gone=${out.shutdown?.pidGone} survivors=${out.shutdown?.survivors?.length ?? 'n/a'}`);
for (const c of out.cases) {
  line(`--- case ${c.id} predictionHeld=${c.predictionHeld}`);
  for (const s of c.steps) {
    line(`    ${s.label}: ${s.response ? JSON.stringify(s.response.error ?? s.response.result ?? s.response.timeout ?? s.response.sendError).slice(0, 240) : ''}`);
  }
  const interesting = c.observations.toolResponded ?? c.observations.toolRespondedForPending;
  if (interesting) line(`    toolResponded: ${JSON.stringify(interesting.params)}`);
  if (c.observations.navigatedFrameId) line(`    navigatedFrameId=${c.observations.navigatedFrameId} unchanged=${c.observations.reportedFrameIdUnchanged}`);
  if (c.observations.closedSessionCommand) line(`    closedSessionCommand=${JSON.stringify(c.observations.closedSessionCommand)}`);
}
line(`verdict=${JSON.stringify(out.verdict)}`);
process.exit(process.exitCode || 0);
