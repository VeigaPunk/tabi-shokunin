#!/usr/bin/env node
// invoke-declarative.mjs — round-17 C2 discovery probe (seat TabiR17.C2ProbeDeclarative-2).
//
// Question (first falsifier for C2's declarative-invocation predicates): when CDP
// `WebMCP.invokeTool` targets a DECLARATIVE `<form toolname>` tool on Chromium 154,
//   - is the form filled from the invocation input (text / <select> / checkbox)?
//   - does a submit event fire, what is `SubmitEvent.agentInvoked`, and is
//     `respondWith()` the response channel?
//   - what does `WebMCP.toolResponded` carry (status / output / errorText)?
//   - what happens without `toolautosubmit`, and without any submit handler?
//
// Raw CDP only: Node 24 built-in WebSocket to the BROWSER endpoint
// (`/json/version` -> webSocketDebuggerUrl), then Target.createTarget +
// Target.attachToTarget{flatten:true}; every command/response/event is recorded.
//
// Flags are the round-16 receipt flagged run (corpus/evidence/round-16/webmcp/
// receipt.json runs[0].effectiveArgv, playwright defaults included) with ONE
// documented deviation: `--remote-debugging-pipe` -> `--remote-debugging-port=0`,
// because this probe speaks the websocket transport.
//
// Usage:
//   node invoke-declarative.mjs [--out <file.json>] [--chromium <path>]
//                               [--timeout-ms 2500]
// Without --out the JSON goes to stdout only. No shell, no network except
// 127.0.0.1: the fixture server binds 127.0.0.1:0 and the browser carries
// `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`.
// A fresh mkdtemp profile is used and removed; the browser is SIGKILLed and the
// probe records that no process with that profile in its cmdline survives.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const OUT = opt('out', null);
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');
const TIMEOUT_MS = Number(opt('timeout-ms', '2500'));
const BROWSER_FLAGS = [
  // Verbatim r16 flagged-run defaults (playwright 1.64 launch set), see header.
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
  '--disable-sync',
  '--enable-unsafe-swiftshader',
  '--headless',
  '--hide-scrollbars',
  '--mute-audio',
  '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  // r16 receipt flag set.
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
  // Deviation from r16 (pipe -> port) so this probe can use the browser websocket.
  '--remote-debugging-port=0',
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- fixture -------------------------------------------------------------
// Four declarative tools + one non-tool control form. Forms carry a text input,
// a single <select> and a checkbox where the case wants value-filling evidence.
// Every submit handler records into window.__rec; the probe never fakes input.

const TOOL_NAMES = ['decl_autosubmit', 'decl_nosubmit', 'decl_precondition', 'decl_preventonly', 'decl_navigate'];
const FIXTURE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>r17 declarative invoke probe</title>
<script>
window.__rec = [];
window.__snap = (form) => {
  const fd = {};
  try { for (const [k, v] of new FormData(form).entries()) fd[k] = typeof v === 'string' ? v : '[file]'; }
  catch (e) { fd.error = String(e); }
  const raw = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    raw[el.name] = {
      tag: el.tagName, type: el.type || null, value: el.value === undefined ? null : el.value,
      checked: typeof el.checked === 'boolean' ? el.checked : null,
      selected: el.multiple ? [...el.selectedOptions].map((o) => o.value)
                            : (el.selectedOptions ? el.selectedOptions[0]?.value ?? null : null),
    };
  }
  let toolFormActive = null;
  try { toolFormActive = form.matches(':tool-form-active'); } catch (e) { toolFormActive = 'throws:' + e.name; }
  return { formData: fd, raw, toolFormActive };
};
window.__onSubmit = (id) => (e) => {
  const form = e.target;
  const rec = {
    formId: id, event: e.type, ctor: e.constructor && e.constructor.name,
    agentInvokedPresent: 'agentInvoked' in e,
    agentInvoked: typeof e.agentInvoked === 'undefined' ? null : e.agentInvoked,
    isTrusted: e.isTrusted,
    submitter: e.submitter ? { tag: e.submitter.tagName, name: e.submitter.name || null } : null,
    defaultPreventedAtEntry: e.defaultPrevented,
    respondWithType: typeof e.respondWith,
    snapshot: window.__snap(form),
  };
  // Case-specific tail is an inline snippet keyed by the form id, so the
  // recorded page evidence is self-describing.
  if (id === 'f-autosubmit') {
    e.preventDefault();
    rec.defaultPreventedAfter = e.defaultPrevented;
    try {
      const p = e.respondWith(Promise.resolve({
        from: id, agentInvoked: e.agentInvoked, values: rec.snapshot.formData }));
      rec.respondWithReturn = p === undefined ? 'undefined' : String(p && p.constructor && p.constructor.name);
    } catch (err) { rec.respondWithThrow = String(err); }
  } else if (id === 'f-precondition') {
    // respondWith before preventDefault: record the throw if any. The promise
    // resolves so a wrongly-accepted first call cannot hang the invocation.
    try {
      const p = e.respondWith(Promise.resolve({ firstCallAccepted: true }));
      rec.respondWithBeforePreventDefault = 'accepted:' + (p === undefined ? 'undefined' : String(p.constructor && p.constructor.name));
    } catch (err) { rec.respondWithBeforePreventDefault = 'throws:' + String(err); }
    e.preventDefault();
    rec.defaultPreventedAfter = e.defaultPrevented;
    try {
      const p = e.respondWith(Promise.resolve({
        secondCall: true, agentInvoked: e.agentInvoked, values: rec.snapshot.formData }));
      rec.respondWithReturn = p === undefined ? 'undefined' : String(p && p.constructor && p.constructor.name);
    } catch (err) { rec.respondWithThrow = String(err); }
  } else if (id === 'f-preventonly') {
    // preventDefault without respondWith: the browser is expected to report a
    // site programming error; record what the page can see.
    e.preventDefault();
    rec.defaultPreventedAfter = e.defaultPrevented;
  } else if (id === 'f-nosubmit' || id === 'f-control') {
    e.preventDefault();
    rec.defaultPreventedAfter = e.defaultPrevented;
    if (id === 'f-nosubmit') {
      try {
        e.respondWith(Promise.resolve({
          from: id, agentInvoked: e.agentInvoked, values: rec.snapshot.formData }));
      } catch (err) { rec.respondWithThrow = String(err); }
    }
  }
  window.__rec.push(rec);
};
</script></head><body>
<h1>r17 declarative invoke probe</h1>

<form id="f-autosubmit" toolname="decl_autosubmit"
      tooldescription="Declarative tool: autosubmit, preventDefault + respondWith"
      toolautosubmit action="/submitted?f=autosubmit" method="get">
  <input name="q" type="text" toolparamdescription="Query text" required>
  <select name="color" toolparamdescription="Color choice">
    <option value="red">Red</option><option value="green">Green</option><option value="blue">Blue</option>
  </select>
  <input name="agree" type="checkbox" toolparamdescription="Agree to the terms">
</form>

<form id="f-nosubmit" toolname="decl_nosubmit"
      tooldescription="Declarative tool: no toolautosubmit, handler responds"
      action="/submitted?f=nosubmit" method="get">
  <input name="q" type="text" toolparamdescription="Query text" required>
  <button type="submit" name="go">Go</button>
</form>

<form id="f-precondition" toolname="decl_precondition"
      tooldescription="Declarative tool: respondWith before preventDefault"
      action="/submitted?f=precondition" method="get">
  <input name="q" type="text" toolparamdescription="Query text" required>
  <button type="submit" name="go">Go</button>
</form>

<form id="f-preventonly" toolname="decl_preventonly"
      tooldescription="Declarative tool: preventDefault without respondWith"
      action="/submitted?f=preventonly" method="get">
  <input name="q" type="text" toolparamdescription="Query text" required>
  <button type="submit" name="go">Go</button>
</form>

<form id="f-navigate" toolname="decl_navigate"
      tooldescription="Declarative tool: autosubmit, no submit handler"
      toolautosubmit action="/submitted?f=navigate" method="get">
  <input name="q" type="text" toolparamdescription="Query text" required>
</form>

<form id="f-control" action="/submitted?f=control" method="get">
  <input name="q" type="text">
  <button type="submit" name="go">Go</button>
</form>
<script>
  // f-navigate deliberately has NO submit listener (measures the default
  // submission path); every other form records its submit event.
  for (const id of ['f-autosubmit', 'f-nosubmit', 'f-precondition', 'f-preventonly', 'f-control']) {
    const f = document.getElementById(id);
    if (f) f.addEventListener('submit', window.__onSubmit(id));
  }
  window.__probeReady = true;
</script>
</body></html>`;

// --- probe state ---------------------------------------------------------

const out = {
  schema: 'tabi-round17-webmcp-probe-invoke-declarative-v1',
  seat: 'TabiR17.C2ProbeDeclarative-2',
  capturedAt: new Date().toISOString(),
  question: 'WebMCP.invokeTool on a declarative <form toolname> tool: form fill, submit/agentInvoked, respondWith channel, toolResponded payload, <select>/checkbox inputs.',
  flags: { browser: BROWSER_FLAGS, deviationFromR16: '--remote-debugging-pipe replaced by --remote-debugging-port=0 (browser websocket transport)' },
  fixtureHtmlSha256: sha256(Buffer.from(FIXTURE_HTML)),
  page: {},
  cdpRequests: [],
  cdpEvents: [],
  console: [],
  server: [],
  cases: [],
  browserLifecycle: {},
};
try { out.producerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url))); }
catch { out.producerSha256 = null; }

const serverLog = [];
const navLog = [];
const consoleLog = [];
const wmcpEvents = [];

let chromium = null;
let server = null;
let profile = null;
let profileHome = null;
let ws = null;

const killPidsWithProfile = (profilePath) => {
  const hits = [];
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    let cmd = '';
    try { cmd = readFileSync(`/proc/${entry}/cmdline`, 'utf8'); } catch { continue; }
    if (cmd.includes(profilePath)) hits.push(Number(entry));
  }
  return hits;
};

const hardKillBrowser = async () => {
  const life = out.browserLifecycle;
  life.pid = chromium ? chromium.pid : null;
  if (chromium && chromium.pid) {
    try { life.exePath = readlinkSync(`/proc/${chromium.pid}/exe`); }
    catch { life.exePath = null; }
    life.cmdlineHead = (() => {
      try { return readFileSync(`/proc/${chromium.pid}/cmdline`, 'utf8').split('\0').slice(0, 3); }
      catch { return null; }
    })();
  }
  try { ws && ws.close(); } catch { /* already closed */ }
  try { chromium && chromium.kill('SIGKILL'); } catch { /* exited */ }
  if (chromium) await Promise.race([
    new Promise((r) => chromium.once('exit', r)), sleep(2000)]);
  await sleep(300);
  life.strayAfterFirstKill = profile ? killPidsWithProfile(profile) : [];
  for (const pid of life.strayAfterFirstKill) {
    try { process.kill(pid, 'SIGKILL'); } catch { /* raced */ }
  }
  await sleep(1200);
  life.strayAfterSecondKill = profile ? killPidsWithProfile(profile) : [];
  life.pidAliveAfterKill = (() => {
    if (!life.pid) return null;
    try { process.kill(life.pid, 0); return true; } catch { return false; }
  })();
  life.gone = life.pidAliveAfterKill === false && life.strayAfterSecondKill.length === 0;
};

const cleanup = async () => {
  try { server && server.close(); } catch { /* closed */ }
  try { await hardKillBrowser(); } catch { /* already down */ }
  if (profile) { try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ } }
  if (profileHome) { try { rmSync(profileHome, { recursive: true, force: true }); } catch { /* best effort */ } }
};

// --- CDP plumbing --------------------------------------------------------

const pending = new Map();
let msgId = 0;
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++msgId;
  const frame = { id, method, params };
  if (sessionId) frame.sessionId = sessionId;
  const entry = { id, method, params, sessionId: sessionId || null };
  out.cdpRequests.push(entry);
  pending.set(id, (m) => {
    if (m.error) {
      entry.error = m.error;
      rej(Object.assign(new Error(`${method}: ${JSON.stringify(m.error)}`), { protocolError: m.error }));
    } else {
      entry.result = m.result;
      res(m.result);
    }
  });
  ws.send(JSON.stringify(frame));
});

const evaluate = async (sessionId, expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (r.exceptionDetails) {
    throw Object.assign(new Error('evaluate threw: ' + JSON.stringify(r.exceptionDetails)), { details: r.exceptionDetails });
  }
  return r.result ? r.result.value : undefined;
};

const waitFor = async (pred, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = pred();
    if (v) return v;
    await sleep(40);
  }
  return null;
};

const wmcpOf = (invocationId, method) => wmcpEvents.find(
  (e) => e.method === method && e.params && e.params.invocationId === invocationId);

const toolOf = (name) => {
  const tools = [];
  for (const e of wmcpEvents) {
    if (e.method === 'WebMCP.toolsAdded') for (const t of e.params.tools || []) if (t.name === name) tools.push(t);
  }
  return tools;
};

// --- page-side helpers ---------------------------------------------------

const recRead = (sessionId) => evaluate(sessionId, 'window.__rec');
const stateRead = (sessionId, formId) => evaluate(sessionId, `(() => {
  const f = document.getElementById(${JSON.stringify(formId)});
  if (!f) return { missing: true };
  const raw = {}; for (const el of f.elements) { if (!el.name) continue;
    raw[el.name] = { tag: el.tagName, type: el.type || null, value: el.value,
      checked: typeof el.checked === 'boolean' ? el.checked : null,
      selected: el.selectedOptions ? el.selectedOptions[0]?.value ?? null : null }; }
  return { raw, formData: window.__snap(f).formData, toolFormActive: window.__snap(f).toolFormActive };
})()`);

const caseRun = async (sessionId, frameId, caseDef) => {
  const { id, toolName, input, formId, timeoutMs = TIMEOUT_MS } = caseDef;
  const started = new Date().toISOString();
  const marks = { wmcp: wmcpEvents.length, nav: navLog.length, server: serverLog.length, console: consoleLog.length };
  const recBefore = ((await recRead(sessionId)) || []).length;
  const c = { id, startedAt: started, request: { frameId, toolName, input }, marks };

  try {
    c.result = await send('WebMCP.invokeTool', { frameId, toolName, input }, sessionId);
  } catch (e) {
    c.error = e.protocolError || String(e);
  }
  c.valuesAtInvokeReturn = formId ? await stateRead(sessionId, formId).catch((e) => ({ error: String(e) })) : null;

  const invocationId = c.result && c.result.invocationId;
  const responded = invocationId
    ? await waitFor(() => wmcpOf(invocationId, 'WebMCP.toolResponded'), timeoutMs)
    : null;
  // The page submit handler and the toolResponded event race; give the page a
  // short extra window before reading records.
  await sleep(150);
  c.submitRecords = ((await recRead(sessionId)) || []).slice(recBefore);
  c.valuesAfterWait = formId ? await stateRead(sessionId, formId).catch((e) => ({ error: String(e) })) : null;
  c.toolInvoked = invocationId ? (wmcpOf(invocationId, 'WebMCP.toolInvoked') || null) : null;
  c.toolResponded = responded || null;
  c.events = wmcpEvents.slice(marks.wmcp);
  c.navigations = navLog.slice(marks.nav);
  c.serverRequests = serverLog.slice(marks.server);
  c.console = consoleLog.slice(marks.console);
  c.endedAt = new Date().toISOString();

  // Phase 2: if a non-autosubmit form did not submit on its own, ask the page
  // to submit it and see whether the pending invocation then completes.
  if (caseDef.ifNoSubmit && c.submitRecords.length === 0) {
    const p2start = { wmcp: wmcpEvents.length, nav: navLog.length, server: serverLog.length, console: consoleLog.length };
    const recBefore2 = ((await recRead(sessionId)) || []).length;
    c.phase2 = { trigger: `document.getElementById(${JSON.stringify(formId)}).requestSubmit()` };
    try { c.phase2.triggerResult = await evaluate(sessionId, c.phase2.trigger); }
    catch (e) { c.phase2.triggerError = String(e); }
    c.phase2.responded = invocationId
      ? await waitFor(() => wmcpOf(invocationId, 'WebMCP.toolResponded'), timeoutMs)
      : null;
    await sleep(150);
    c.phase2.submitRecords = ((await recRead(sessionId)) || []).slice(recBefore2);
    c.phase2.toolResponded = c.phase2.responded || null;
    c.phase2.events = wmcpEvents.slice(p2start.wmcp);
    c.phase2.navigations = navLog.slice(p2start.nav);
    c.phase2.serverRequests = serverLog.slice(p2start.server);
    c.phase2.console = consoleLog.slice(p2start.console);
  }
  return c;
};

const canon = (v) => (Array.isArray(v) ? v.map(canon)
  : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]))
    : v);
const check = (name, got, expected) => ({
  name, got, expected,
  holds: expected === undefined ? null : JSON.stringify(canon(got)) === JSON.stringify(canon(expected)),
});

// --- main ----------------------------------------------------------------

let fatal = null;
try {
  out.runtime = {
    node: process.version,
    chromiumExecutable: CHROMIUM,
    chromiumLauncherSha256: sha256(readFileSync(CHROMIUM)),
  };

  server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (d) => chunks.push(d));
    req.on('end', () => {
      serverLog.push({ method: req.method, url: req.url, bodyBytes: Buffer.concat(chunks).length });
      res.setHeader('cache-control', 'no-store');
      if (req.url === '/') {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(FIXTURE_HTML);
      } else if (req.url.startsWith('/submitted')) {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end('<!doctype html><title>submitted</title><p id="submitted">submitted ' + req.url + '</p>');
      } else {
        res.statusCode = 404;
        res.end('not found');
      }
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  out.fixtureUrl = `http://127.0.0.1:${httpPort}/`;
  out.serverBind = { address: '127.0.0.1', port: httpPort };

  profile = mkdtempSync(join(tmpdir(), 'tabi-r17-decl-invoke-'));
  out.userDataDir = profile;
  // r16 redirected HOME/XDG_CONFIG_HOME per launch so the host's
  // ~/.config/chromium-flags.conf and extensions cannot alter the flag set.
  profileHome = mkdtempSync(join(tmpdir(), 'tabi-r17-decl-home-'));
  out.envRedirect = { HOME: profileHome, XDG_CONFIG_HOME: join(profileHome, '.config') };
  const stderrChunks = [];
  chromium = spawn(CHROMIUM, [...BROWSER_FLAGS, `--user-data-dir=${profile}`, 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'], detached: false,
      env: { ...process.env, HOME: out.envRedirect.HOME, XDG_CONFIG_HOME: out.envRedirect.XDG_CONFIG_HOME } });
  chromium.stderr.on('data', (d) => { if (stderrChunks.length < 200) stderrChunks.push(d); });

  let cdpPort = null;
  for (let i = 0; i < 300 && !cdpPort; i++) {
    const f = join(profile, 'DevToolsActivePort');
    if (existsSync(f)) cdpPort = Number(readFileSync(f, 'utf8').split('\n')[0]);
    else await sleep(50);
  }
  if (!cdpPort) throw new Error('DevToolsActivePort never appeared; stderr tail: ' +
    Buffer.concat(stderrChunks).toString('utf8').slice(-1200));
  out.cdpPort = cdpPort;

  const fetchJson = async (p) => (await fetch(`http://127.0.0.1:${cdpPort}${p}`)).json();
  const version = await fetchJson('/json/version');
  out.runtime.browserProduct = version.Browser;
  out.runtime.protocolVersion = version['Protocol-Version'];

  ws = new WebSocket(version.webSocketDebuggerUrl);
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const fn = pending.get(m.id); pending.delete(m.id); fn(m); return; }
    if (!m.method) return;
    out.cdpEvents.push({ method: m.method, sessionId: m.sessionId || null, params: m.params });
    if (m.method.startsWith('WebMCP.')) wmcpEvents.push({ method: m.method, params: m.params });
    if (m.method === 'Page.frameNavigated') navLog.push({ url: m.params.frame.url, frameId: m.params.frame.id, parentId: m.params.frame.parentId || null });
    if (m.method === 'Runtime.consoleAPICalled') {
      consoleLog.push({ kind: 'console', type: m.params.type,
        args: (m.params.args || []).map((a) => a.value !== undefined ? a.value : a.description) });
    }
    if (m.method === 'Log.entryAdded') {
      consoleLog.push({ kind: 'log', level: m.params.entry.level, source: m.params.entry.source, text: m.params.entry.text });
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleLog.push({ kind: 'exception', text: m.params.exceptionDetails.text,
        description: m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : null });
    }
  });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const attach = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attach.sessionId;
  out.session = { targetId, sessionId, flattened: true };

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  try { await send('Log.enable', {}, sessionId); } catch { /* Log is optional */ }
  const webmcpEnable = await send('WebMCP.enable', {}, sessionId);
  out.webmcpEnableResult = webmcpEnable;

  // Each case runs on a freshly loaded fixture page so one case's navigation or
  // page-side state cannot leak into the next. A case's own frameId is used for
  // its invokeTool command.
  const controlRun = async (def) => {
    const marks = { nav: navLog.length, server: serverLog.length, console: consoleLog.length };
    const recBefore = ((await recRead(sessionId)) || []).length;
    const c = { id: def.id, startedAt: new Date().toISOString(), control: def.control };
    try { c.result = await evaluate(sessionId, def.control); }
    catch (e) { c.error = String(e); }
    await sleep(200);
    c.submitRecords = ((await recRead(sessionId)) || []).slice(recBefore);
    c.navigations = navLog.slice(marks.nav);
    c.serverRequests = serverLog.slice(marks.server);
    c.console = consoleLog.slice(marks.console);
    c.endedAt = new Date().toISOString();
    return c;
  };

  const loadFixture = async (toolName) => {
    const mark = wmcpEvents.length;
    const navMark = navLog.length;
    const nav = await send('Page.navigate', { url: out.fixtureUrl }, sessionId);
    await waitFor(() => navLog.length > navMark, 2000);
    const start = Date.now();
    let ready = false;
    while (Date.now() - start < 4000 && !ready) {
      try { ready = (await evaluate(sessionId, 'window.__probeReady === true')) === true; }
      catch { /* execution context swapping */ }
      if (!ready) await sleep(50);
    }
    const announce = () => wmcpEvents.slice(mark).some(
      (e) => e.method === 'WebMCP.toolsAdded' && (e.params.tools || []).some((t) => t.name === toolName));
    let registered = toolName ? !!(await waitFor(announce, 2500)) : null;
    if (toolName && !registered) {
      await send('WebMCP.enable', {}, sessionId).catch(() => {});
      registered = !!(await waitFor(announce, 2500));
    }
    const tool = toolName ? (toolOf(toolName).slice(-1)[0] || null) : null;
    return { frameId: nav.frameId, ready, registered, tool };
  };

  // Initial load: registration evidence and the page API surface.
  const first = await loadFixture(TOOL_NAMES[0]);
  out.page.frameId = first.frameId;
  out.page.probeReady = first.ready;
  out.page.registeredTools = TOOL_NAMES.map((n) => ({ name: n, tools: toolOf(n) }));
  out.page.toolsAddedCount = wmcpEvents.filter((e) => e.method === 'WebMCP.toolsAdded').length;

  // Page-side API surface (before any invocation).
  out.page.surface = await evaluate(sessionId, `(() => {
    const d = Object.getOwnPropertyDescriptor(SubmitEvent.prototype, 'agentInvoked');
    const r = Object.getOwnPropertyDescriptor(SubmitEvent.prototype, 'respondWith');
    let pseudoSupported = true; let pseudoErr = null;
    try { document.querySelector('form:tool-form-active'); } catch (e) { pseudoSupported = false; pseudoErr = e.name; }
    const mc = document.modelContext;
    return {
      submitEvent_agentInvoked: d ? { kind: d.get ? 'getter' : 'value', enumerable: d.enumerable } : null,
      submitEvent_respondWith: r ? { kind: typeof r.value, length: r.value ? r.value.length : null, enumerable: r.enumerable } : null,
      toolFormActiveSelectorSupported: pseudoSupported, toolFormActiveSelectorError: pseudoErr,
      modelContextProto: mc ? Object.getOwnPropertyNames(Object.getPrototypeOf(mc)) : null,
      isSecureContext: window.isSecureContext,
      getToolsType: mc && typeof mc.getTools,
    };
  })()`);
  out.page.getTools = await evaluate(sessionId, `(async () => {
    try { const t = await document.modelContext.getTools();
      return t.map((x) => ({ name: x.name, inputSchemaType: typeof x.inputSchema,
        inputSchema: typeof x.inputSchema === 'string' ? x.inputSchema : JSON.stringify(x.inputSchema) })); }
    catch (e) { return { error: String(e) }; }
  })()`);

  // --- cases: fresh fixture page per case --------------------------------
  const cases = [
    { id: 'declarative-autosubmit-respondWith', toolName: 'decl_autosubmit', formId: 'f-autosubmit',
      input: { q: 'round17-decl-query', color: 'green', agree: true } },
    { id: 'declarative-respondWith-before-preventDefault', toolName: 'decl_precondition', formId: 'f-precondition',
      input: { q: 'round17-precondition' }, ifNoSubmit: true },
    { id: 'declarative-preventDefault-no-respondWith', toolName: 'decl_preventonly', formId: 'f-preventonly',
      input: { q: 'round17-preventonly' }, ifNoSubmit: true },
    { id: 'user-submit-control', toolName: null, formId: 'f-control',
      control: 'document.getElementById("f-control").requestSubmit()' },
    { id: 'declarative-no-autosubmit', toolName: 'decl_nosubmit', formId: 'f-nosubmit',
      input: { q: 'round17-nosubmit' }, ifNoSubmit: true },
    { id: 'declarative-no-handler-navigation', toolName: 'decl_navigate', formId: 'f-navigate',
      input: { q: 'round17-navigate' } },
  ];

  for (const def of cases) {
    const page = await loadFixture(def.toolName || null);
    const c = def.toolName
      ? await caseRun(sessionId, page.frameId, def)
      : await controlRun(def);
    c.pageLoad = { frameId: page.frameId, ready: page.ready, toolRegistered: page.registered, tool: page.tool };
    out.cases.push(c);
  }

  // Post-run tool list on a clean load (the navigating case leaves /submitted).
  await loadFixture(TOOL_NAMES[0]);
  out.page.getToolsAfter = await evaluate(sessionId, `(async () => {
    try { return (await document.modelContext.getTools()).map((x) => x.name); }
    catch (e) { return { error: String(e) }; }
  })()`).catch((e) => ({ error: String(e) }));

  out.console = consoleLog;
  out.consoleAfterCasesCount = consoleLog.length;

  // --- checks: expectations fixed here, before reading the fields back ----
  const byId = (id) => out.cases.find((c) => c.id === id);
  const filled = byId('declarative-autosubmit-respondWith');
  const r0 = filled && filled.submitRecords && filled.submitRecords[0];
  const resp0 = filled && filled.toolResponded && filled.toolResponded.params;
  const output0 = resp0 && resp0.output;
  const snap0 = r0 && r0.snapshot;
  const expectedValues = { q: 'round17-decl-query', color: 'green', agree: 'on' };
  const expectedOutput = { from: 'f-autosubmit', agentInvoked: true, values: expectedValues };
  filled.checks = [
    check('submit event fired during invocation', !!(r0), true),
    check('SubmitEvent.agentInvoked is true', r0 ? r0.agentInvoked : null, true),
    check('submit event isTrusted', r0 ? r0.isTrusted : null, true),
    check('form filled: text q', snap0 ? snap0.formData.q : null, 'round17-decl-query'),
    check('form filled: <select> color', snap0 ? snap0.formData.color : null, 'green'),
    check('form filled: checkbox agree (FormData)', snap0 ? snap0.formData.agree : null, 'on'),
    check('form filled: checkbox agree (checked DOM property)', snap0 ? snap0.raw.agree.checked : null, true),
    check('form matches :tool-form-active during submit', snap0 ? snap0.toolFormActive : null, true),
    check('SubmitEvent.respondWith is a function', r0 ? r0.respondWithType : null, 'function'),
    check('defaultPrevented after handler', r0 ? r0.defaultPreventedAfter : null, true),
    check('toolResponded.status', resp0 ? resp0.status : null, 'Completed'),
    check('toolResponded.output equals the respondWith value', output0 === undefined ? null : output0, expectedOutput),
    check('toolInvoked.input is a JSON string', filled.toolInvoked ? typeof filled.toolInvoked.params.input : null, 'string'),
    check('toolInvoked.input parses to the command input', (() => {
      try { return JSON.parse(filled.toolInvoked.params.input); } catch { return null; }
    })(), { q: 'round17-decl-query', color: 'green', agree: true }),
    check('no navigation for the responding form', filled.navigations.length, 0),
    check('fill visible immediately after invokeTool returns', !!filled.valuesAtInvokeReturn &&
      filled.valuesAtInvokeReturn.formData &&
      filled.valuesAtInvokeReturn.formData.q === 'round17-decl-query', true),
  ];
  const pre = byId('declarative-respondWith-before-preventDefault');
  const preR = pre && ((pre.submitRecords && pre.submitRecords[0]) ||
    (pre.phase2 && pre.phase2.submitRecords && pre.phase2.submitRecords[0]));
  pre.checks = [
    check('submit fired by the invocation itself without toolautosubmit', (pre.submitRecords || []).length > 0, false),
    check('submit fired after the page calls requestSubmit', !!preR, true),
    check('agentInvoked true', preR ? preR.agentInvoked : null, true),
    check('respondWith before preventDefault (informational: throw text)', preR ? preR.respondWithBeforePreventDefault : null, undefined),
    check('second respondWith after preventDefault (informational)', preR ? (preR.respondWithReturn || preR.respondWithThrow || null) : null, undefined),
    check('toolResponded.status (informational)', (pre.phase2 && pre.phase2.toolResponded ? pre.phase2.toolResponded.params
      : pre.toolResponded ? pre.toolResponded.params : null)?.status, undefined),
    check('toolResponded.output (informational)', (pre.phase2 && pre.phase2.toolResponded ? pre.phase2.toolResponded.params
      : pre.toolResponded ? pre.toolResponded.params : null)?.output, undefined),
  ];
  const prev = byId('declarative-preventDefault-no-respondWith');
  const prevR = prev && ((prev.submitRecords && prev.submitRecords[0]) ||
    (prev.phase2 && prev.phase2.submitRecords && prev.phase2.submitRecords[0]));
  prev.checks = [
    check('submit fired by the invocation itself without toolautosubmit', (prev.submitRecords || []).length > 0, false),
    check('submit fired after the page calls requestSubmit', !!prevR, true),
    check('agentInvoked true', prevR ? prevR.agentInvoked : null, true),
    check('toolResponded.status after preventDefault without respondWith (informational)',
      (prev.phase2 && prev.phase2.toolResponded ? prev.phase2.toolResponded.params
        : prev.toolResponded ? prev.toolResponded.params : null)?.status, undefined),
    check('toolResponded.errorText (informational)',
      (prev.phase2 && prev.phase2.toolResponded ? prev.phase2.toolResponded.params
        : prev.toolResponded ? prev.toolResponded.params : null)?.errorText ?? null, undefined),
    check('console text seen by the page (informational)',
      ((prev.phase2 && prev.phase2.console) || prev.console || []).map((x) => x.text || x.args).join(' | ').slice(0, 400), undefined),
  ];
  const ctl = byId('user-submit-control');
  const ctlR = ctl && ctl.submitRecords && ctl.submitRecords[0];
  ctl.checks = [
    check('user requestSubmit fires submit', !!ctlR, true),
    check('SubmitEvent.agentInvoked is false for a user submit', ctlR ? ctlR.agentInvoked : null, false),
  ];
  const noauto = byId('declarative-no-autosubmit');
  const noR = noauto && noauto.submitRecords && noauto.submitRecords[0];
  const noP2R = noauto && noauto.phase2 && noauto.phase2.submitRecords && noauto.phase2.submitRecords[0];
  noauto.checks = [
    check('submit during invoke without toolautosubmit (informational)', !!noR, undefined),
    check('agentInvoked during invoke without toolautosubmit (informational)', noR ? noR.agentInvoked : null, undefined),
    check('toolResponded during invoke without toolautosubmit (informational)', noauto.toolResponded ? noauto.toolResponded.params.status : null, undefined),
    check('page requestSubmit after invoke: submit fired (informational)', !!noP2R, undefined),
    check('page requestSubmit after invoke: agentInvoked (informational)', noP2R ? noP2R.agentInvoked : null, undefined),
    check('page requestSubmit after invoke: toolResponded (informational)', noauto.phase2 && noauto.phase2.toolResponded ? noauto.phase2.toolResponded.params.status : null, undefined),
  ];
  const nav = byId('declarative-no-handler-navigation');
  nav.checks = [
    check('navigated to the form action', nav.navigations.length > 0, true),
    check('server saw GET /submitted with the form data', nav.serverRequests.some((r) => r.method === 'GET' && r.url.startsWith('/submitted?q=round17-navigate')), true),
    check('toolResponded.status for unhandled submit (informational)', nav.toolResponded ? nav.toolResponded.params.status : null, undefined),
    check('toolResponded.output for unhandled submit (informational)', nav.toolResponded ? nav.toolResponded.params.output : null, undefined),
    check('toolResponded.errorText for unhandled submit (informational)', nav.toolResponded ? nav.toolResponded.params.errorText ?? null : null, undefined),
  ];

  const all = out.cases.flatMap((c) => (c.checks || []).map((k) => ({ case: c.id, ...k })));
  out.verdict = {
    cases: out.cases.length,
    checks: all.length,
    checked: all.filter((k) => k.holds !== null).length,
    failed: all.filter((k) => k.holds === false).map((k) => `${k.case}:${k.name}`),
    informational: all.filter((k) => k.holds === null).length,
  };
} catch (e) {
  fatal = String(e && e.stack || e);
  out.fatal = fatal;
  out.verdict = { fatal };
  process.exitCode = 1;
} finally {
  await cleanup();
  out.finishedAt = new Date().toISOString();
}

const json = JSON.stringify(out, null, 2) + '\n';
if (OUT) writeFileSync(OUT, json);
if (!OUT) process.stdout.write(json);
console.error(`INVOKE_DECLARATIVE verdict=${out.verdict && out.verdict.fatal ? 'fatal' : 'ok'} cases=${out.verdict && out.verdict.cases} checked=${out.verdict && out.verdict.checked} failed=${(out.verdict && out.verdict.failed || []).length} gone=${out.browserLifecycle && out.browserLifecycle.gone}`);
process.exit(process.exitCode || 0);
