#!/usr/bin/env node
// probes/invoke-frames.mjs — round-17 C2 wave-1 discovery probe.
//
// Questions (first falsifier for C2's frame-attribution and permissions-policy
// case predicates):
//   * Does an imperative tool registered in a same-origin iframe arrive in
//     WebMCP.toolsAdded with the IFRAME's frameId (not the main frameId)?
//   * Same question for a cross-origin iframe served from a second loopback port
//     (http://127.0.0.1:<other-port> — cross-origin, same site, so it may or may
//     not be an out-of-process iframe; Target.setAutoAttach is armed to catch
//     both worlds and every event is tagged with its CDP sessionId).
//   * Can WebMCP.invokeTool reach a tool owned by an iframe when given the
//     iframe frameId, and exactly what does Chromium answer when the main
//     frameId is used instead (protocol error vs. tool-not-found)?
//   * What does a permissions-policy denial look like in an iframe:
//       - same-origin iframe with allow="tools 'none'"
//       - cross-origin iframe with allow="tools"
//       - cross-origin iframe with no allow attribute (policy default 'self')
//     and is a DECLARATIVE form inside a denied frame still announced over CDP
//     (the round-16 data: divergence showed CDP can announce what the page API
//     refuses)?
//   * Declarative invocation mechanics on 154: plain form vs submit button vs
//     `toolautosubmit` (the error text of a plain-form invoke names the rule).
//
// Records every raw CDP request/response/event in `wire` (seq-ordered) and the
// page-side observation (what each frame's execute received, via postMessage).
// Predictions are fixed in code before the run; each is compared afterwards.
//
// Loopback only: two http servers on 127.0.0.1 ephemeral ports; Chromium is
// launched with --host-resolver-rules that fail every name except 127.0.0.1;
// fresh temp --user-data-dir; HOME/XDG_CONFIG_HOME redirected to a temp dir so
// the Arch launcher's chromium-flags.conf cannot inject flags. No external
// request is possible. The only tools invoked are the loopback fixtures' own
// read-only echo tools, plus the declarative fixture form (submitted last; it
// is served by the same loopback server and has no external action).
//
// Usage:
//   node .ufo/waves/round-17/probes/invoke-frames.mjs [--out PATH]
//        [--chromium PATH] [--button-wait-ms N] [--keep-profile]
// Without --out the JSON document goes to stdout. With --out it is written to
// PATH (parent dirs must exist) and one summary line is printed. Exit: 0 the
// probe ran (contradictions are data, not a probe failure); 2 fatal (the JSON
// document is still written/printed). --button-wait-ms (default 12000) bounds
// the wait for the submit-button declarative case, which produced no
// toolResponded at 12000 or 30000 ms on this build.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const HERE = dirname(SCRIPT);
const argv = process.argv.slice(2);
const optValue = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
};
const OUT = optValue('--out', null);
const CHROMIUM = resolve(optValue('--chromium', '/usr/bin/chromium'));
const KEEP_PROFILE = argv.includes('--keep-profile');
// Submit-button declarative invocations produced no toolResponded within 12 s
// in the first runs; the knob exists so a slow/hung distinction can be probed.
const BUTTON_WAIT_MS = Number(optValue('--button-wait-ms', '12000'));

// Flags of the round-16 flagged run (corpus/evidence/round-16/webmcp/receipt.json
// runs[0].launchedArgs), plus the probe-level launch flags every r16 probe used.
const LAUNCH_ARGS = [
  '--headless',
  '--remote-debugging-port=0',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const WEBMCP_FEATURE_TOKENS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

const IFRAMES = [
  { name: 'same', origin: 'A', allow: null, decl: true },
  { name: 'same-deny', origin: 'A', allow: "tools 'none'", decl: true },
  { name: 'cross', origin: 'B', allow: 'tools', decl: true },
  { name: 'cross-default', origin: 'B', allow: null, decl: true },
];
const IFRAME_NAMES = new Set(IFRAMES.map((f) => f.name));

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withTimeout(promise, ms, label) {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error(`timeout:${label}`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); res(v); },
      (e) => { clearTimeout(timer); rej(e); },
    );
  });
}

// --------------------------------------------------------------- fixtures ---
// Every frame: attempt an imperative registerTool and report the outcome to the
// parent via postMessage (works cross-origin). Its execute reports what it
// received before returning a read-only echo string. Declarative frames also
// carry <form toolname> variants so the CDP announcement and the invocation
// outcome can be compared per frame:
//   * plain form (no submit button, no toolautosubmit) — announced, invocation
//     expected to fail with the 154 "No submit button was found" error;
//   * `same` also carries a form with a submit button;
//   * `cross` also carries a form with the `toolautosubmit` attribute.
const FORMS = {
  same: [
    `<form toolname="decl-same" tooldescription="declarative echo same"><input name="text" toolparamdescription="text to submit"></form>`,
    `<form toolname="decl-btn-same" tooldescription="declarative echo same with submit button"><input name="text" toolparamdescription="text to submit"><button type="submit">Send</button></form>`,
  ],
  cross: [
    `<form toolname="decl-cross" tooldescription="declarative echo cross"><input name="text" toolparamdescription="text to submit"></form>`,
    `<form toolname="decl-auto-cross" tooldescription="declarative echo cross with toolautosubmit" toolautosubmit><input name="text" toolparamdescription="text to submit"></form>`,
  ],
  'same-deny': [
    `<form toolname="decl-same-deny" tooldescription="declarative echo same-deny"><input name="text" toolparamdescription="text to submit"></form>`,
  ],
  'cross-default': [
    `<form toolname="decl-cross-default" tooldescription="declarative echo cross-default"><input name="text" toolparamdescription="text to submit"></form>`,
  ],
};

function frameHtml(name, withForms) {
  const forms = withForms ? (FORMS[name] || []).join('\n') : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>frame-${name}</title></head>
<body><h1>frame-${name}</h1>
${forms}
<script>
(async () => {
  const name = ${JSON.stringify(name)};
  const post = (m) => { try { parent.postMessage(m, '*'); } catch (e) {} };
  const base = {
    frame: name,
    href: location.href,
    origin: location.origin,
    isSecureContext: !!window.isSecureContext,
    hasModelContext: !!document.modelContext,
  };
  try {
    const mc = document.modelContext;
    if (!mc) { post({ __tabiFrameReport: Object.assign({ ok: false, errName: 'no-modelContext' }, base) }); return; }
    await mc.registerTool({
      name: 'echo-' + name,
      description: 'Echo text back (' + name + ' frame tool, read-only).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => {
        post({ __tabiInvocation: { frame: name, tool: 'echo-' + name, input: input, inputType: typeof input } });
        return 'echo-' + name + ':' + (input && input.text);
      },
    });
    post({ __tabiFrameReport: Object.assign({ ok: true, tool: 'echo-' + name }, base) });
  } catch (e) {
    post({ __tabiFrameReport: Object.assign({
      ok: false,
      errName: (e && e.name) || null,
      errMessage: String((e && e.message) || e),
    }, base) });
  }
})();
</script></body></html>`;
}

function mainHtml(originB, expected) {
  const iframeTags = IFRAMES.map((f) => {
    const base = f.origin === 'B' ? originB : '';
    const allow = f.allow === null ? '' : ` allow="${f.allow}"`;
    const decl = f.decl ? '&decl=1' : '';
    return `<iframe id="f-${f.name}" src="${base}/frame?name=${encodeURIComponent(f.name)}${decl}"${allow}></iframe>`;
  }).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>webmcp-invoke-frames-main</title>
<script>
window.__reports = []; window.__invocations = [];
window.__expected = ${JSON.stringify(expected)};
window.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.__tabiFrameReport) window.__reports.push(d.__tabiFrameReport);
  if (d.__tabiInvocation) window.__invocations.push(d.__tabiInvocation);
});
window.__allReports = new Promise((res) => {
  const done = () => {
    const names = new Set(window.__reports.map((r) => r.frame));
    if (window.__expected.every((n) => names.has(n))) res(window.__reports.slice());
  };
  window.addEventListener('message', done);
  setTimeout(() => res(window.__reports.slice()), 6000);
});
</script></head>
<body><h1>main</h1>
${iframeTags}
<script>
(async () => {
  try {
    if (!document.modelContext) throw new Error('no document.modelContext');
    await document.modelContext.registerTool({
      name: 'echo-main',
      description: 'Echo text back (main frame tool, read-only).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => {
        window.__invocations.push({ frame: 'main', tool: 'echo-main', input: input, inputType: typeof input });
        return 'echo-main:' + (input && input.text);
      },
    });
    window.__mainRegistered = true;
  } catch (e) {
    window.__mainRegistered = false;
    window.__mainError = String((e && e.message) || e);
  }
})();
</script></body></html>`;
}

// ----------------------------------------------------------------- server ---
function listen(server) {
  return new Promise((r) => server.listen(0, '127.0.0.1', r));
}
function makeServer(routes) {
  return createServer((req, res) => {
    let url;
    try { url = new URL(req.url, 'http://127.0.0.1'); } catch { url = null; }
    const handler = url ? routes[url.pathname] : null;
    if (!handler) {
      res.statusCode = 404;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('not found');
      return;
    }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(handler(url.searchParams));
  });
}
const routesB = {
  '/frame': (q) => {
    const name = q.get('name');
    if (!IFRAME_NAMES.has(name)) return '<!doctype html><title>unknown-frame</title>';
    return frameHtml(name, q.get('decl') === '1');
  },
};

// -------------------------------------------------------------- processes ---
function procsMatching(needle) {
  const hits = [];
  let pids = [];
  try { pids = readdirSync('/proc'); } catch { return hits; }
  for (const pid of pids) {
    if (!/^[0-9]+$/.test(pid)) continue;
    try {
      const cmd = readFileSync(`/proc/${pid}/cmdline`, 'utf8');
      if (cmd.includes(needle)) hits.push(Number(pid));
    } catch { /* process exited or unreadable */ }
  }
  return hits;
}

function walkFrames(tree, depth = 0, acc = []) {
  const f = tree.frame || {};
  acc.push({ frameId: f.id || null, parentId: f.parentId || null, url: f.url || '', depth });
  for (const child of tree.childFrames || []) walkFrames(child, depth + 1, acc);
  return acc;
}
function frameNameOf(url) {
  try { return new URL(url).searchParams.get('name'); } catch { return null; }
}

// ------------------------------------------------------------------- main ---
const out = {
  schema: 'tabi-round17-c2-invoke-frames-v1',
  seat: 'C2ProbeFrames',
  capturedAt: new Date().toISOString(),
  question: 'WebMCP frame attribution and invocation targeting: tools in a same-origin iframe and in a cross-origin (second loopback port) iframe; toolsAdded frameId; invokeTool with iframe frameId vs main frameId; permissions-policy denial inside the iframe.',
  scope: 'loopback 127.0.0.1 only; fresh temp profile; only the fixtures\' own read-only echo tools (and the declarative fixture form, last) invoked',
  producerSha256: null,
  runtime: {},
  launchedArgs: LAUNCH_ARGS,
  options: { buttonWaitMs: BUTTON_WAIT_MS },
  cmdlineEarly: null,
  effectiveCmdline: null,
  flagsTokensInCmdline: null,
  cmdlineLooksJoined: null,
  servers: null,
  fixtures: { iframes: IFRAMES },
  frameTree: [],
  reports: [],
  pageState: null,
  toolsAdded: [],
  toolsRemoved: [],
  frames: [],
  attachedTargets: [],
  attempts: [],
  predictions: [],
  contradictions: [],
  knowledgeRound16Check: null,
  kill: null,
  wire: [],
};
try { out.producerSha256 = sha256(readFileSync(SCRIPT)); } catch { out.producerSha256 = null; }

let chromium = null;
let serverA = null;
let serverB = null;
let ws = null;
let profile = null;
let envDir = null;
const stderrChunks = [];
const wire = [];
let wireSeq = 0;
let nextId = 0;
const pending = new Map();
const events = [];

function record(entry) {
  wireSeq += 1;
  wire.push({ seq: wireSeq, t: Date.now(), ...entry });
  return wireSeq;
}
function send(method, params = {}, sessionId) {
  const id = ++nextId;
  const msg = { id, method, params };
  if (sessionId) msg.sessionId = sessionId;
  record({ dir: 'send', ...msg });
  return new Promise((res, rej) => {
    pending.set(id, { method, res, rej });
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      pending.delete(id);
      rej(e);
    }
  });
}

async function handleAttached(p) {
  const sid = p.sessionId;
  const info = p.targetInfo || {};
  const rec = {
    sessionId: sid,
    targetId: info.targetId || null,
    type: info.type || null,
    url: info.url || '',
    setup: {},
  };
  out.attachedTargets.push(rec);
  for (const method of ['WebMCP.enable', 'Runtime.enable', 'Page.enable']) {
    try {
      rec.setup[method] = await send(method, {}, sid);
    } catch (e) {
      rec.setup[method] = { error: e.protocolError || String(e) };
    }
  }
  try {
    rec.setup['Target.setAutoAttach'] = await send('Target.setAutoAttach', {
      autoAttach: true, waitForDebuggerOnStart: true, flatten: true,
    }, sid);
  } catch (e) {
    rec.setup['Target.setAutoAttach'] = { error: e.protocolError || String(e) };
  }
  try {
    rec.setup['Runtime.runIfWaitingForDebugger'] = await send('Runtime.runIfWaitingForDebugger', {}, sid);
  } catch (e) {
    rec.setup['Runtime.runIfWaitingForDebugger'] = { error: e.protocolError || String(e) };
  }
}

function webmcpEvents() {
  return events.filter((e) => e.method.startsWith('WebMCP.'));
}
function addedTools() {
  const acc = [];
  for (const e of events) {
    if (e.method !== 'WebMCP.toolsAdded') continue;
    for (const tool of e.params.tools || []) {
      acc.push({ ...tool, sessionId: e.sessionId, wireSeq: e.seq });
    }
  }
  return acc;
}
function removedTools() {
  const acc = [];
  for (const e of events) {
    if (e.method !== 'WebMCP.toolsRemoved') continue;
    acc.push({ params: e.params, sessionId: e.sessionId, wireSeq: e.seq });
  }
  return acc;
}
const toolByName = (name) => addedTools().find((t) => t.name === name) || null;

async function waitUntil(pred, ms) {
  const t0 = Date.now();
  for (;;) {
    const v = pred();
    if (v) return v;
    if (Date.now() - t0 > ms) return null;
    await sleep(100);
  }
}
async function waitForEvent(method, pred = () => true, ms = 6000) {
  return waitUntil(() => events.find((e) => e.method === method && pred(e)), ms);
}

// Invoke one tool and wait (event-driven) for the matching toolResponded.
async function invoke(label, sessionId, frameId, toolName, input, note, respondMs = 6000) {
  const rec = {
    label,
    note: note || null,
    sessionId: sessionId || null,
    request: { frameId, toolName, input },
  };
  try {
    const r = await withTimeout(send('WebMCP.invokeTool', { frameId, toolName, input }, sessionId), 6000, label);
    rec.result = r;
    if (r && r.invocationId) {
      const invoked = await waitForEvent('WebMCP.toolInvoked', (e) => e.params.invocationId === r.invocationId, 4000);
      const responded = await waitForEvent('WebMCP.toolResponded', (e) => e.params.invocationId === r.invocationId, respondMs);
      rec.toolInvoked = invoked ? { sessionId: invoked.sessionId, wireSeq: invoked.seq, params: invoked.params } : null;
      rec.toolResponded = responded ? { sessionId: responded.sessionId, wireSeq: responded.seq, params: responded.params } : null;
    }
  } catch (e) {
    rec.error = e.protocolError || { message: String(e) };
  }
  out.attempts.push(rec);
  return rec;
}
const attempt = (label) => out.attempts.find((a) => a.label === label) || null;
const respondedStatus = (label) => attempt(label)?.toolResponded?.params?.status ?? null;

try {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  out.runtime.chromiumPath = CHROMIUM;
  out.runtime.chromiumSha256 = sha256(readFileSync(CHROMIUM));
  out.runtime.node = process.version;

  // Servers: B (cross origin) first so A's main document can reference it.
  serverB = makeServer(routesB);
  await listen(serverB);
  const originB = `http://127.0.0.1:${serverB.address().port}`;
  const expected = IFRAMES.map((f) => f.name);
  serverA = makeServer({
    '/': () => mainHtml(originB, expected),
    '/frame': (q) => {
      const name = q.get('name');
      if (!IFRAME_NAMES.has(name)) return '<!doctype html><title>unknown-frame</title>';
      return frameHtml(name, q.get('decl') === '1');
    },
  });
  await listen(serverA);
  const originA = `http://127.0.0.1:${serverA.address().port}`;
  out.servers = { originA, originB };
  out.fixtures.mainUrl = `${originA}/`;
  out.fixtures.iframeUrls = IFRAMES.map((f) => ({
    name: f.name,
    src: `${f.origin === 'B' ? originB : ''}/frame?name=${encodeURIComponent(f.name)}&decl=1`,
    allow: f.allow,
    crossOrigin: f.origin === 'B',
  }));

  // Fresh profile + redirected HOME so chromium-flags.conf cannot inject flags.
  profile = mkdtempSync(join(tmpdir(), 'tabi-r17-invokeframes-'));
  envDir = mkdtempSync(join(tmpdir(), 'tabi-r17-invokeframes-env-'));
  mkdirSync(join(envDir, 'xdg-config'), { recursive: true });
  const env = { ...process.env, HOME: envDir, XDG_CONFIG_HOME: join(envDir, 'xdg-config') };
  chromium = spawn(CHROMIUM, [...LAUNCH_ARGS, `--user-data-dir=${profile}`], {
    stdio: ['ignore', 'ignore', 'pipe'],
    env,
  });
  const browserPid = chromium.pid;
  out.runtime.browserPid = browserPid;
  // Two reads: the launcher/early exec argv, then the browser's own post-init
  // /proc/<pid>/cmdline. Chromium rewrites its cmdline into one space-joined
  // string during startup on this host, so tokens are checked as substrings of
  // the raw bytes and the joined shape is recorded explicitly.
  let cmdlineEarlyRaw = null;
  try { cmdlineEarlyRaw = readFileSync(`/proc/${browserPid}/cmdline`, 'utf8'); } catch { /* exec race */ }
  out.cmdlineEarly = cmdlineEarlyRaw;
  chromium.stderr.on('data', (d) => {
    stderrChunks.push(d);
    if (stderrChunks.length > 400) stderrChunks.shift();
  });
  chromium.on('exit', (code, signal) => { out.runtime.browserExit = { code, signal }; });

  let cdpPort = null;
  for (let i = 0; i < 200 && !cdpPort; i += 1) {
    const f = join(profile, 'DevToolsActivePort');
    if (existsSync(f)) {
      const txt = readFileSync(f, 'utf8').split('\n');
      cdpPort = Number(txt[0]);
    } else {
      await sleep(100);
    }
  }
  if (!cdpPort) {
    throw new Error(`DevToolsActivePort never appeared: ${Buffer.concat(stderrChunks).toString('utf8').slice(-1200)}`);
  }
  out.runtime.cdpPort = cdpPort;
  try { out.effectiveCmdline = readFileSync(`/proc/${browserPid}/cmdline`, 'utf8'); } catch { out.effectiveCmdline = null; }
  out.flagsTokensInCmdline = {
    early: cmdlineEarlyRaw === null ? null : WEBMCP_FEATURE_TOKENS.map((t) => cmdlineEarlyRaw.includes(t)),
    late: out.effectiveCmdline === null ? null : WEBMCP_FEATURE_TOKENS.map((t) => out.effectiveCmdline.includes(t)),
  };
  out.cmdlineLooksJoined = out.effectiveCmdline === null
    ? null
    : out.effectiveCmdline.split('\0').filter(Boolean).length === 1;

  const fetchJson = async (p) => (await fetch(`http://127.0.0.1:${cdpPort}${p}`)).json();
  const version = await fetchJson('/json/version');
  out.runtime.browser = version.Browser;
  if (!version.webSocketDebuggerUrl) throw new Error('no browser webSocketDebuggerUrl');

  // Raw CDP over the BROWSER websocket; one flattened page session; auto-attach
  // armed so an out-of-process cross-origin iframe would still be observed.
  ws = new WebSocket(version.webSocketDebuggerUrl);
  ws.addEventListener('message', (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch { return; }
    if (m.id !== undefined && pending.has(m.id)) {
      record({ dir: 'recv', id: m.id, sessionId: m.sessionId || null,
        result: m.result, error: m.error });
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) {
        const err = new Error(`${p.method}: ${m.error.message}`);
        err.protocolError = m.error;
        p.rej(err);
      } else {
        p.res(m.result);
      }
      return;
    }
    if (m.method) {
      record({ dir: 'recv', sessionId: m.sessionId || null, method: m.method, params: m.params });
      events.push({ seq: wireSeq, t: Date.now(), sessionId: m.sessionId || null, method: m.method, params: m.params });
      if (m.method === 'Target.attachedToTarget') {
        handleAttached(m.params).catch((e) => {
          out.attachedTargets.push({ sessionId: m.params.sessionId, setupError: String(e) });
        });
      }
      if (m.method === 'Page.frameAttached' || m.method === 'Page.frameNavigated'
          || m.method === 'Page.frameDetached' || m.method === 'Page.loadEventFired'
          || m.method === 'Target.detachedFromTarget' || m.method === 'Target.targetCreated'
          || m.method === 'Target.targetInfoChanged' || m.method === 'Target.targetDestroyed'
          || m.method === 'Inspector.targetCrashed' || m.method === 'Runtime.exceptionThrown') {
        out.frames.push({ seq: wireSeq, sessionId: m.sessionId || null, method: m.method, params: m.params });
      }
    }
  });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', (e) => rej(new Error(`ws error: ${e.message || e.type || 'unknown'}`)), { once: true });
  });

  const targets = await send('Target.getTargets');
  out.runtime.targetsAtStart = targets.targetInfos.map((t) => ({ type: t.type, targetId: t.targetId, url: t.url }));
  const page = targets.targetInfos.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');
  const attached = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  const S = attached.sessionId;
  out.pageSessionId = S;
  await send('Page.enable', {}, S);
  await send('Runtime.enable', {}, S);
  await send('WebMCP.enable', {}, S);
  await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }, S);

  const nav = await send('Page.navigate', { url: out.fixtures.mainUrl }, S);
  out.navigation = nav;

  // Collect the four iframe reports (all post registration outcomes).
  let reports = [];
  try {
    const r = await withTimeout(send('Runtime.evaluate', {
      expression: 'window.__allReports', awaitPromise: true, returnByValue: true,
    }, S), 12000, 'allReports');
    reports = (r && r.result && r.result.value) || [];
    if (r && r.exceptionDetails) out.reportsException = r.exceptionDetails;
  } catch (e) {
    out.reportsError = e.protocolError || { message: String(e) };
  }
  out.reports = reports;

  // Main-frame registration outcome.
  try {
    const st = await withTimeout(send('Runtime.evaluate', {
      expression: `JSON.stringify({
        mainRegistered: window.__mainRegistered ?? null,
        mainError: window.__mainError ?? null,
        invocations: window.__invocations ?? [],
        reportsSeen: (window.__reports || []).length,
      })`,
      returnByValue: true,
    }, S), 5000, 'pageState');
    out.pageState = st && st.result ? JSON.parse(st.result.value) : null;
  } catch (e) {
    out.pageStateError = e.protocolError || { message: String(e) };
  }

  // Frame tree (parent page session sees all frames of the page, incl. OOPIF).
  const tree = await send('Page.getFrameTree', {}, S);
  out.frameTree = walkFrames(tree.frameTree);
  const frameIdMain = tree.frameTree.frame.id;
  out.frameIdMain = frameIdMain;
  const frameIdByName = {};
  for (const f of out.frameTree) {
    const n = frameNameOf(f.url);
    if (n) frameIdByName[n] = f.frameId;
  }
  out.frameIdByName = frameIdByName;

  // Let declarative registration and any late events settle.
  await sleep(1500);
  out.toolsAdded = addedTools();
  out.toolsRemoved = removedTools();

  const tMain = toolByName('echo-main');
  const tSame = toolByName('echo-same');
  const tCross = toolByName('echo-cross');
  const tDeclSame = toolByName('decl-same');
  const tDeclBtnSame = toolByName('decl-btn-same');
  const tDeclSameDeny = toolByName('decl-same-deny');
  const tDeclCross = toolByName('decl-cross');
  const tDeclAutoCross = toolByName('decl-auto-cross');
  const tDeclCrossDefault = toolByName('decl-cross-default');
  out.toolIndex = {
    echoMain: tMain, echoSame: tSame, echoCross: tCross,
    declSame: tDeclSame, declBtnSame: tDeclBtnSame,
    declSameDeny: tDeclSameDeny, declCross: tDeclCross,
    declAutoCross: tDeclAutoCross, declCrossDefault: tDeclCrossDefault,
  };
  out.frameIdAgreement = {
    sameToolVsTree: tSame && frameIdByName.same ? tSame.frameId === frameIdByName.same : null,
    crossToolVsTree: tCross && frameIdByName.cross ? tCross.frameId === frameIdByName.cross : null,
    declSameVsTree: tDeclSame && frameIdByName.same ? tDeclSame.frameId === frameIdByName.same : null,
    sameToolDiffersFromMain: tSame ? tSame.frameId !== frameIdMain : null,
  };

  const crossSession = tCross ? tCross.sessionId : null;
  const sameSession = tSame ? tSame.sessionId : S;

  // ---- invocations ----
  if (tMain) {
    await invoke('main-own-frame', S, tMain.frameId, 'echo-main', { text: 'main-own' },
      'control: tool owned by the main frame, invoked with its own frameId');
  }
  if (tSame) {
    await invoke('same-own-frame', sameSession, tSame.frameId, 'echo-same', { text: 'same-own' },
      'tool owned by the same-origin iframe, invoked with the iframe frameId');
    await invoke('same-wrong-frame', S, frameIdMain, 'echo-same', { text: 'same-wrong' },
      'same tool, MAIN frameId: probe for the frameId gate');
    await invoke('main-wrong-frame', S, tSame.frameId, 'echo-main', { text: 'main-wrong' },
      'reverse mismatch: main-frame tool addressed with the iframe frameId');
  }
  if (tCross) {
    await invoke('cross-own-frame', crossSession, tCross.frameId, 'echo-cross', { text: 'cross-own' },
      `tool owned by the cross-origin iframe, invoked with its frameId on session ${crossSession === S ? 'page' : 'child'}`);
    if (crossSession !== S) {
      await invoke('cross-via-page-session', S, tCross.frameId, 'echo-cross', { text: 'cross-via-page' },
        'cross-origin tool addressed from the page session instead of its owning child session');
    }
    await invoke('cross-wrong-frame', S, frameIdMain, 'echo-cross', { text: 'cross-wrong' },
      'cross-origin tool addressed with the MAIN frameId');
  }
  if (frameIdByName['same-deny']) {
    await invoke('same-deny-frame', S, frameIdByName['same-deny'], 'echo-same-deny', { text: 'denied' },
      'permissions-policy-denied same-origin iframe: probe whether a denied frame owns any invocable tool');
  }
  if (frameIdByName['cross-default']) {
    await invoke('cross-default-frame', S, frameIdByName['cross-default'], 'echo-cross-default', { text: 'cross-default' },
      'cross-origin iframe without allow="tools" (policy default self): same question');
  }

  // Page-side observation of what each frame's execute actually received.
  try {
    const st = await withTimeout(send('Runtime.evaluate', {
      expression: `JSON.stringify({
        invocations: window.__invocations ?? [],
        reportsSeen: (window.__reports || []).length,
      })`,
      returnByValue: true,
    }, S), 5000, 'pageStateAfter');
    out.pageStateAfter = st && st.result ? JSON.parse(st.result.value) : null;
  } catch (e) {
    out.pageStateAfterError = e.protocolError || { message: String(e) };
  }

  // Declarative fixture forms last: a submission navigates its own iframe.
  // 1) plain form (no submit button, no toolautosubmit) → the 154 error rule.
  if (tDeclCross) {
    await invoke('decl-cross-plain', crossSession, tDeclCross.frameId, 'decl-cross', { text: 'decl-cross-submit' },
      'declarative tool in the cross-origin iframe, plain form: submission stays on the loopback fixture');
  }
  // 2) toolautosubmit form.
  if (tDeclAutoCross) {
    await invoke('decl-auto-cross', crossSession, tDeclAutoCross.frameId, 'decl-auto-cross', { text: 'decl-auto-submit' },
      'declarative tool with toolautosubmit: no button required by the 154 error text');
  }
  // 3) submit-button form.
  if (tDeclBtnSame) {
    await invoke('decl-btn-same', sameSession, tDeclBtnSame.frameId, 'decl-btn-same', { text: 'decl-btn-submit' },
      'declarative tool with a submit button', BUTTON_WAIT_MS);
  }
  await sleep(500);
  const navigated = events
    .filter((e) => e.method === 'Page.frameNavigated')
    .map((e) => ({ seq: e.seq, frameId: e.params.frame?.id ?? null, url: e.params.frame?.url ?? '' }));
  const invokedSeq = (label) => attempt(label)?.toolInvoked?.wireSeq ?? null;
  const navigatedAfter = (label, frameId) => {
    const since = invokedSeq(label);
    if (since === null || !frameId) return null;
    return navigated.some((n) => n.frameId === frameId && n.seq > since);
  };
  out.declarativeNavigation = {
    frameNavigatedEvents: navigated,
    crossFrameAfterAutoSubmit: navigatedAfter('decl-auto-cross', tDeclAutoCross?.frameId),
    sameFrameAfterButtonSubmit: navigatedAfter('decl-btn-same', tDeclBtnSame?.frameId),
  };
  out.toolsAddedAfter = addedTools();
  out.toolsRemovedAfter = removedTools();

  // ---- fixed predictions vs observations ----
  const rep = (n) => reports.find((r) => r.frame === n) || null;
  const outcome = (label) => {
    const a = attempt(label);
    if (!a) return null;
    if (a.error) return 'error';
    return a.toolResponded?.params?.status ?? 'no_response';
  };
  const P = (name, expect, observed) => ({ name, expect, observed });
  const preds = [
    P('same-origin iframe registerTool succeeds by default', true, rep('same') ? rep('same').ok : null),
    P('same-origin iframe tool announced (echo-same present)', true, !!tSame),
    P('same-origin iframe tool frameId is the iframe frameId (per frame tree)', true,
      out.frameIdAgreement.sameToolVsTree),
    P('same-origin iframe tool frameId differs from main frameId', true,
      out.frameIdAgreement.sameToolDiffersFromMain),
    P('same-origin declarative tool frameId is the iframe frameId', true,
      out.frameIdAgreement.declSameVsTree),
    P('cross-origin iframe with allow="tools" registers', true, rep('cross') ? rep('cross').ok : null),
    P('cross-origin iframe with no allow attribute is denied with NotAllowedError',
      'NotAllowedError', rep('cross-default') ? rep('cross-default').errName : null),
    P('same-origin iframe with allow="tools \'none\'" is denied with NotAllowedError',
      'NotAllowedError', rep('same-deny') ? rep('same-deny').errName : null),
    P('declarative form in a denied frame is NOT announced over CDP', true,
      !(tDeclSameDeny || tDeclCrossDefault)),
    P('invoke with the owning iframe frameId → toolResponded Completed', 'Completed',
      outcome('same-own-frame')),
    P('invoke an iframe tool with the MAIN frameId → protocol error', 'error',
      attempt('same-wrong-frame')?.error ? 'error' : 'result'),
    P('invoke a main-frame tool with the iframe frameId → protocol error', 'error',
      attempt('main-wrong-frame')?.error ? 'error' : 'result'),
    P('invoke a cross-origin iframe tool with its frameId → Completed', 'Completed',
      outcome('cross-own-frame')),
    P('invoke a cross-origin iframe tool with the MAIN frameId → protocol error', 'error',
      attempt('cross-wrong-frame')?.error ? 'error' : 'result'),
    P('plain declarative form invoke → toolResponded status Error', 'Error',
      outcome('decl-cross-plain')),
    P('declarative form with toolautosubmit invoke → toolResponded status Completed', 'Completed',
      outcome('decl-auto-cross')),
    P('declarative form with a submit button invoke → toolResponded status Completed', 'Completed',
      outcome('decl-btn-same')),
  ];
  for (const p of preds) {
    const observed = p.observed === undefined ? null : p.observed;
    p.unobservable = observed === null;
    p.holds = p.unobservable ? null : String(observed) === String(p.expect);
    out.predictions.push(p);
    if (p.holds === false) out.contradictions.push(p);
  }

  const declSummary = (label) => {
    const a = attempt(label);
    if (!a) return null;
    if (a.error) return { label, kind: 'protocol_error', error: a.error };
    if (!a.toolResponded) {
      return { label, kind: 'no_response', invocationId: a.result?.invocationId ?? null };
    }
    return {
      label,
      kind: 'responded',
      status: a.toolResponded.params?.status ?? null,
      errorText: a.toolResponded.params?.errorText ?? null,
      output: a.toolResponded.params?.output ?? null,
    };
  };
  out.declarativeResults = {
    plainNoButton: declSummary('decl-cross-plain'),
    toolautosubmit: declSummary('decl-auto-cross'),
    submitButton: declSummary('decl-btn-same'),
  };

  out.knowledgeRound16Check = {
    note: 'corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80',
    frameToolsClaim: 'a same-origin iframe declarative tool arrives with the iframe frameId',
    frameToolsObserved: out.frameIdAgreement.declSameVsTree,
    policyClaim: 'permissions policy feature "tools" default \'self\'; denial is NotAllowedError',
    deniedSameOrigin: rep('same-deny') || null,
    deniedCrossOriginDefault: rep('cross-default') || null,
    crossOriginAllowed: rep('cross') || null,
    declaredAnnouncedInDeniedFrames: {
      declSameDeny: !!tDeclSameDeny,
      declCrossDefault: !!tDeclCrossDefault,
    },
  };

  out.verdict = {
    probeRan: true,
    contradictions: out.contradictions.length,
    unobservable: out.predictions.filter((p) => p.unobservable).length,
    invocationPathWorksForIframeTools: respondedStatus('same-own-frame') === 'Completed',
    frameIdGateExists: !!attempt('same-wrong-frame')?.error,
  };
} catch (e) {
  out.fatal = String((e && e.stack) || e);
  out.verdict = { probeRan: false, fatal: String((e && e.stack) || e) };
  process.exitCode = 2;
} finally {
  try { if (ws) ws.close(); } catch { /* already closed */ }
  try { if (serverA) serverA.close(); } catch { /* already closed */ }
  try { if (serverB) serverB.close(); } catch { /* already closed */ }

  let exited = false;
  let exitSignal = null;
  if (chromium) {
    const pid = chromium.pid;
    try { chromium.kill('SIGKILL'); } catch { /* already dead */ }
    exited = await new Promise((res) => {
      if (chromium.exitCode !== null || chromium.signalCode !== null) { res(true); return; }
      const timer = setTimeout(() => res(false), 5000);
      chromium.once('exit', (code, signal) => {
        clearTimeout(timer);
        exitSignal = signal;
        res(true);
      });
    });
    const leftoverBefore = profile ? procsMatching(profile) : [];
    for (const p of leftoverBefore) {
      try { process.kill(p, 'SIGKILL'); } catch { /* gone */ }
    }
    if (leftoverBefore.length) await sleep(400);
    const leftoverAfter = profile ? procsMatching(profile) : [];
    out.kill = {
      pid,
      sent: 'SIGKILL',
      exited,
      exitSignal,
      pidGone: !existsSync(`/proc/${pid}`),
      pidAlive: (() => {
        try { process.kill(pid, 0); return true; } catch (e) { return e.code !== 'ESRCH'; }
      })(),
      leftoverPidsBeforeSweep: leftoverBefore,
      leftoverPidsAfterSweep: leftoverAfter,
      profileRemoved: false,
    };
  }
  if (!KEEP_PROFILE) {
    try { if (profile) rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
    try { if (envDir) rmSync(envDir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  if (out.kill) out.kill.profileRemoved = !!(profile && !existsSync(profile));
  out.stderrTail = Buffer.concat(stderrChunks).toString('utf8').slice(-1500);
  out.wire = wire;
  out.wireEntryCount = wire.length;
  out.eventCount = events.length;
}

const doc = JSON.stringify(out, null, 2) + '\n';
if (OUT) {
  writeFileSync(OUT, doc);
  console.log(`INVOKE_FRAMES_PROBE ran=${out.verdict?.probeRan === true} `
    + `contradictions=${out.contradictions.length} unobservable=${out.predictions.filter((p) => p.unobservable).length} `
    + `sameIframeInvoke=${respondedStatus('same-own-frame')} pidGone=${out.kill?.pidGone} out=${OUT}`);
} else {
  process.stdout.write(doc);
}
