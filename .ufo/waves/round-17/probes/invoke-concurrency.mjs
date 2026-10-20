#!/usr/bin/env node
// probes/invoke-concurrency.mjs — round-17 wave-1 falsifier probe for C2.
//
// Question (case `invoke-concurrent-ids`): when two or more WebMCP tool
// invocations overlap on one CDP page session, is every invocationId unique,
// what is the order of WebMCP.toolInvoked / WebMCP.toolResponded, and can a
// response be matched back to its request (and its tool) by invocationId
// alone? Does a second, sibling CDP session see the same events?
//
// Only the loopback fixture's own read-only tools are invoked (echo / delay /
// boom: pure string work plus a timer, no external effects). Raw CDP over the
// page target websocket; Node 24 built-in WebSocket; no third-party deps.
// Loopback 127.0.0.1 only, fresh temp profile + temp HOME (so the Arch
// launcher's ~/.config/chromium-flags.conf cannot inject flags), and the
// browser is SIGKILLed at the end with its pid proven gone.
//
// Usage: node .ufo/waves/round-17/probes/invoke-concurrency.mjs [--out JSON] [--chromium PATH]
// Default out: invoke-concurrency.json next to this file. Never shells out.

import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};
const OUT = opt('out', join(HERE, 'invoke-concurrency.json'));
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');

// Exactly the round-16 flagged run's WebMCP tokens (receipt flags.enabled) plus
// the same host-resolver deny and headless/no-first-run set; --user-data-dir is
// per run. No flag beyond the r16 flagged run's set is added here.
const FLAGS = [
  '--headless',
  '--remote-debugging-port=0',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--disable-extensions',
  '--noerrdialogs',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

// ---------------------------------------------------------------------------
// Predicates fixed here, before the run. Each is evaluated against the frames
// observed below; `pass` means "the assertion held", never "the probe worked".
// ---------------------------------------------------------------------------
const PREDICATES = [
  { id: 'concurrent-ids-unique',
    assert: 'every invokeTool command response carries an invocationId and all ids on the session are distinct, including for identical toolName+input sent back to back' },
  { id: 'ack-only',
    assert: 'the invokeTool command result carries invocationId and no terminal status/output: completion is event-only' },
  { id: 'one-invoked-one-responded',
    assert: 'each invocationId appears exactly once in toolInvoked and exactly once in toolResponded' },
  { id: 'responded-carries-toolname',
    assert: 'toolResponded params name the tool or frame (if absent, tool correlation needs toolInvoked or the request record)' },
  { id: 'overlap',
    assert: 'in the ordered-pair group the second toolInvoked arrives before the first toolResponded, i.e. invocations overlap rather than serialize' },
  { id: 'no-crosstalk',
    assert: 'each toolResponded output embeds its own invocation input only (delay:<text>:<ms> / echo:<text>)' },
  { id: 'responded-completion-order',
    assert: 'toolResponded order follows completion order (short delay first) regardless of submission order' },
  { id: 'duplicate-input-distinct-ids',
    assert: 'two identical echo invocations yield 2 distinct ids, 2 toolInvoked, 2 toolResponded and 2 page executions' },
  { id: 'observer-session-isolation',
    assert: 'a second enabled CDP session receives zero WebMCP invocation events for an invocation it did not issue' },
  { id: 'page-executions-match',
    assert: 'the page-side execute log has one entry per invocation carrying the same input CDP sent' },
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const T0 = process.hrtime.bigint();
const now = () => Math.round(Number(process.hrtime.bigint() - T0) / 1e3) / 1e3; // ms, 3dp

const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>webmcp-invoke-concurrency</title></head><body><script>
window.__calls = [];
window.__register = (async () => {
  const mc = document.modelContext;
  if (!mc) return { ok: false, reason: 'no-document.modelContext' };
  const rec = (name, input) => { window.__calls.push({ name, input, at: performance.now() }); };
  try {
    await mc.registerTool({
      name: 'echo',
      description: 'Echo the provided text back to the caller (read-only, no side effects).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => { rec('echo', input); return 'echo:' + (input && input.text); },
    });
    await mc.registerTool({
      name: 'delay',
      description: 'Wait ms then echo text back (read-only timer, no side effects).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' }, ms: { type: 'number' } }, required: ['text', 'ms'] },
      execute: async (input) => {
        rec('delay', input);
        const ms = Number(input && input.ms) || 0;
        await new Promise((r) => setTimeout(r, ms));
        return 'delay:' + (input && input.text) + ':' + ms;
      },
    });
    await mc.registerTool({
      name: 'boom',
      description: 'Throw a deterministic error (read-only, no side effects).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => { rec('boom', input); throw new Error('boom:' + (input && input.text)); },
    });
    return { ok: true, names: ['echo', 'delay', 'boom'] };
  } catch (e) { return { ok: false, reason: String(e) }; }
})();
</script></body></html>`;

const out = {
  schema: 'tabi-round17-webmcp-probe-invoke-concurrency-v1',
  seat: 'C2ProbeConcurrency',
  capturedAt: new Date().toISOString(),
  question: 'Two or more concurrent WebMCP invocations: invocationId uniqueness, toolInvoked/toolResponded ordering, and whether a response is matchable to its request by invocationId alone.',
  scope: 'loopback 127.0.0.1 only; temp profile and temp HOME; only the fixture\'s own read-only echo/delay/boom tools invoked; browser SIGKILLed and pid proven gone',
  predicates: PREDICATES,
};

let chromium = null;
let server = null;
let tmpBase = null;
let httpRequests = [];
const sessions = [];

// --- /proc helpers (copied pattern from scripts/webmcp-loopback-round16.mjs) ---
function readProcArgv(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter((p) => p.length > 0);
  } catch { return null; }
}
function findProcessesUsing(marker) {
  const hits = [];
  let entries = [];
  try { entries = readdirSync('/proc'); } catch { return hits; }
  for (const entry of entries) {
    if (!/^\d+$/.test(entry)) continue;
    const a = readProcArgv(Number(entry));
    if (a && a.join(' ').includes(marker)) hits.push({ pid: Number(entry), argv: a });
  }
  return hits;
}

function makeSession(wsUrl, label) {
  const st = {
    label, ws: new WebSocket(wsUrl), raw: [], events: [], pending: new Map(), nextId: 0, closed: false,
  };
  st.open = new Promise((resolve, reject) => {
    st.ws.addEventListener('open', () => resolve(), { once: true });
    st.ws.addEventListener('error', (e) => reject(new Error(`${label} ws error: ${e.message || e}`)), { once: true });
  });
  st.ws.addEventListener('message', (ev) => {
    const t = now();
    const raw = typeof ev.data === 'string' ? ev.data : String(ev.data);
    let m = null;
    try { m = JSON.parse(raw); } catch { st.raw.push({ dir: 'in', t, raw, unparsed: true }); return; }
    if (m.id !== undefined && st.pending.has(m.id)) {
      const resolve = st.pending.get(m.id);
      st.pending.delete(m.id);
      st.raw.push({ dir: 'in', t, id: m.id, raw });
      resolve({ id: m.id, t, result: m.result, error: m.error });
    } else {
      st.raw.push({ dir: 'in', t, raw });
      if (m.method) st.events.push({ t, method: m.method, params: m.params, raw });
    }
  });
  sessions.push(st);
  return st;
}

function sendRaw(st, method, params = {}) {
  const id = ++st.nextId;
  const frame = { id, method, params };
  const tSent = now();
  st.raw.push({ dir: 'out', t: tSent, id, raw: JSON.stringify(frame) });
  const promise = new Promise((resolve) => { st.pending.set(id, resolve); });
  st.ws.send(JSON.stringify(frame));
  return { id, tSent, promise };
}

async function waitFor(pred, timeoutMs, pollMs = 20) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pred()) return true;
    await sleep(pollMs);
  }
  return pred();
}

const invokedFor = (st, invocationId) =>
  st.events.filter((e) => e.method === 'WebMCP.toolInvoked' && e.params && e.params.invocationId === invocationId);
const respondedFor = (st, invocationId) =>
  st.events.filter((e) => e.method === 'WebMCP.toolResponded' && e.params && e.params.invocationId === invocationId);

// Key-order-insensitive JSON: Chromium re-serializes tool input with sorted keys.
const canon = (v) => {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
};
const valueOf = (res) => (res && res.result && res.result.result ? res.result.result.value : undefined);
const procState = (pid) => {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    return stat.slice(stat.lastIndexOf(')') + 2, stat.lastIndexOf(')') + 3);
  } catch { return null; }
};

// Send every invocation in one tick (no await between sends), then collect.
async function invokeGroup(st, frameId, specs, waitMs = 6000) {
  const startIdx = st.raw.length;
  const eventStartIdx = st.events.length;
  const invocations = specs.map((s) => {
    const r = sendRaw(st, 'WebMCP.invokeTool', { frameId, toolName: s.toolName, input: s.input });
    return { label: s.label, toolName: s.toolName, input: s.input,
      commandId: r.id, tSentMs: r.tSent, promise: r.promise };
  });
  const responses = await Promise.all(invocations.map((i) => i.promise));
  invocations.forEach((inv, idx) => {
    inv.result = responses[idx].result ?? null;
    inv.protocolError = responses[idx].error ?? null;
    inv.tResultMs = responses[idx].t;
  });
  const ids = invocations.map((inv) => inv.result && inv.result.invocationId).filter(Boolean);
  const done = () => ids.length === invocations.length &&
    ids.every((id) => respondedFor(st, id).length >= 1);
  const completed = await waitFor(done, waitMs);
  for (const inv of invocations) {
    const id = inv.result && inv.result.invocationId;
    inv.toolInvoked = id ? invokedFor(st, id).map((e) => ({ tMs: e.t, params: e.params })) : [];
    inv.toolResponded = id ? respondedFor(st, id).map((e) => ({ tMs: e.t, params: e.params })) : [];
    const firstInvoked = inv.toolInvoked[0];
    const firstResponded = inv.toolResponded[0];
    if (firstInvoked) {
      let parsed = null;
      try { parsed = JSON.parse(firstInvoked.params.input); } catch { parsed = firstInvoked.params.input; }
      inv.invokedInput = parsed;
      inv.invokedInputIsJsonString = typeof firstInvoked.params.input === 'string';
      inv.pageInputMatches = canon(parsed) === canon(inv.input);
      inv.invokedInputKeySorted = firstInvoked.params.input === canon(parsed);
    }
    if (firstResponded) {
      inv.status = firstResponded.params.status;
      inv.output = firstResponded.params.output ?? null;
      inv.respondedExtraParams = Object.keys(firstResponded.params).filter(
        (k) => !['invocationId', 'status', 'output'].includes(k));
    }
    // Does the response deterministically embed this invocation's own input?
    if (inv.toolName === 'delay' && typeof inv.output === 'string') {
      inv.outputEmbedsOwnInput = inv.output === `delay:${inv.input.text}:${inv.input.ms}`;
    } else if (inv.toolName === 'echo' && typeof inv.output === 'string') {
      inv.outputEmbedsOwnInput = inv.output === `echo:${inv.input.text}`;
    } else {
      inv.outputEmbedsOwnInput = null;
    }
  }

  // Global order of terminal events for this group, in arrival order.
  const groupEvents = st.events.slice(eventStartIdx)
    .filter((e) => e.method === 'WebMCP.toolInvoked' || e.method === 'WebMCP.toolResponded')
    .map((e) => ({ tMs: e.t, method: e.method, invocationId: e.params && e.params.invocationId,
      toolName: e.params && e.params.toolName, status: e.params && e.params.status }));

  return {
    invocations,
    events: groupEvents,
    completed,
    frames: st.raw.slice(startIdx),
    checks: groupChecks(invocations, groupEvents),
  };
}

function groupChecks(invocations, events) {
  const ids = invocations.map((i) => i.result && i.result.invocationId).filter(Boolean);
  const invokedIds = events.filter((e) => e.method === 'WebMCP.toolInvoked').map((e) => e.invocationId);
  const respondedIds = events.filter((e) => e.method === 'WebMCP.toolResponded').map((e) => e.invocationId);
  const firstRespondedIdx = events.findIndex((e) => e.method === 'WebMCP.toolResponded');
  const laterInvokedBeforeFirstResponse = firstRespondedIdx > 0 &&
    events.slice(0, firstRespondedIdx).filter((e) => e.method === 'WebMCP.toolInvoked').length >= 2;
  const respondedOrder = invocations
    .filter((i) => i.toolResponded.length > 0)
    .sort((a, b) => a.toolResponded[0].tMs - b.toolResponded[0].tMs)
    .map((i) => i.label);
  return {
    idsUnique: ids.length === new Set(ids).size && ids.every((id) => typeof id === 'string' && id.length > 0),
    invokedOnePerInvocation: invokedIds.length === invocations.length &&
      invocations.every((i) => i.toolInvoked.length === 1),
    respondedOnePerInvocation: respondedIds.length === invocations.length &&
      invocations.every((i) => i.toolResponded.length === 1),
    ackOnlyInvocationId: invocations.every((i) => i.result &&
      Object.keys(i.result).length === 1 && typeof i.result.invocationId === 'string'),
    respondedParams: invocations.map((i) => (i.toolResponded[0] ? i.toolResponded[0].params : null)),
    respondedOrder,
    laterInvokedBeforeFirstResponse,
    phaseSeparation: firstRespondedIdx < 0 ? 'no-responses'
      : (events.slice(firstRespondedIdx).some((e) => e.method === 'WebMCP.toolInvoked') ? 'interleaved' : 'separated'),
    outputsEmbedOwnInput: invocations.filter((i) => i.toolName !== 'boom')
      .every((i) => i.outputEmbedsOwnInput === true),
    boomErrorShape: invocations.filter((i) => i.toolName === 'boom').map((i) => ({
      invocationId: i.result && i.result.invocationId,
      status: i.status,
      errorText: i.toolResponded[0] ? i.toolResponded[0].params.errorText : null,
      exceptionDescription: i.toolResponded[0] && i.toolResponded[0].params.exception
        ? i.toolResponded[0].params.exception.description : null,
    })),
    inputsPreserved: invocations.every((i) => i.pageInputMatches === true),
  };
}

// ---------------------------------------------------------------------------
async function main() {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  out.producer = { path: fileURLToPath(import.meta.url), sha256: sha256(readFileSync(fileURLToPath(import.meta.url))) };
  out.runtime = {
    node: process.version,
    chromium: {
      launchPath: CHROMIUM,
      launchSha256: sha256(readFileSync(CHROMIUM)),
      realExecutable: null,
      realExecutableSha256: null,
      product: null,
      versionSource: null,
    },
  };

  // Loopback fixture server, bound explicitly to 127.0.0.1.
  server = createServer((req, res) => {
    httpRequests.push({ method: req.method, url: req.url, remoteAddress: req.socket.remoteAddress });
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(FIXTURE_HTML);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (address.address !== '127.0.0.1') throw new Error(`fixture server bound ${address.address}`);
  const httpPort = address.port;
  const fixtureUrl = `http://127.0.0.1:${httpPort}/`;
  out.fixtureUrl = fixtureUrl;

  tmpBase = mkdtempSync(join(tmpdir(), 'tabi-r17-invoke-conc-'));
  const profile = join(tmpBase, 'profile');
  const home = join(tmpBase, 'home');
  mkdirSync(join(home, '.config'), { recursive: true });
  mkdirSync(profile, { recursive: true });
  out.tmpRoot = tmpBase;

  // Minimal env: isolates the Arch launcher from ~/.config/chromium-flags.conf.
  const childEnv = {
    HOME: home,
    XDG_CONFIG_HOME: join(home, '.config'),
    PATH: process.env.PATH || '/usr/bin:/bin',
    TMPDIR: tmpdir(),
    TZ: 'UTC',
    LANG: 'C.UTF-8',
  };
  const launchArgs = [...FLAGS, `--user-data-dir=${profile}`, 'about:blank'];
  out.flags = {
    passed: launchArgs,
    webmcpFeatureArgs: FLAGS.filter((a) => /WebMCP|host-resolver/.test(a)),
    hostEnvIsolated: true,
  };

  const stderr = [];
  chromium = spawn(CHROMIUM, launchArgs, { stdio: ['ignore', 'ignore', 'pipe'], env: childEnv });
  chromium.stderr.on('data', (d) => stderr.push(d));

  let cdpPort = null;
  const activePortFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 300 && !cdpPort; i += 1) {
    if (existsSync(activePortFile)) {
      cdpPort = Number(readFileSync(activePortFile, 'utf8').split('\n')[0]);
      if (!Number.isInteger(cdpPort) || cdpPort <= 0) cdpPort = null;
    } else await sleep(100);
  }
  if (!cdpPort) {
    throw new Error(`DevToolsActivePort never appeared; stderr tail: ${Buffer.concat(stderr).toString('utf8').slice(-800)}`);
  }
  out.cdpPort = cdpPort;

  const marker = `--user-data-dir=${profile}`;
  let browserHit = null;
  for (let i = 0; i < 50 && !browserHit; i += 1) {
    const mains = findProcessesUsing(marker).filter(
      (h) => h.argv.includes(marker) && !h.argv.some((a) => a.startsWith('--type=')));
    if (mains.length === 1) browserHit = mains[0]; else await sleep(100);
  }
  out.browser = {
    spawnPid: chromium.pid,
    mainPid: browserHit ? browserHit.pid : null,
    effectiveArgv: browserHit ? browserHit.argv : null,
    realExecutable: browserHit ? realpathSync(`/proc/${browserHit.pid}/exe`) : null,
  };
  if (out.browser.realExecutable) {
    out.runtime.chromium.realExecutable = out.browser.realExecutable;
    out.runtime.chromium.realExecutableSha256 = sha256(readFileSync(out.browser.realExecutable));
  }

  const fetchJson = async (p) => (await fetch(`http://127.0.0.1:${cdpPort}${p}`)).json();
  const version = await fetchJson('/json/version');
  out.runtime.chromium.product = version.Browser;
  out.runtime.chromium.versionSource = 'CDP /json/version on this run';
  out.error = null;

  const protocol = await fetchJson('/json/protocol');
  const domain = (protocol.domains || []).find((d) => d.domain === 'WebMCP');
  out.protocol = domain ? {
    commands: (domain.commands || []).map((c) => ({ name: c.name, parameters: c.parameters })),
    events: (domain.events || []).map((e) => ({ name: e.name, parameters: e.parameters })),
  } : null;

  let target = null;
  for (let i = 0; i < 100 && !target; i += 1) {
    const list = await fetchJson('/json/list');
    target = list.find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('no page target');
  out.cdp = { targetWsHost: new URL(target.webSocketDebuggerUrl).host, targetType: target.type };

  // --- session S1: invoker ---
  const s1 = makeSession(target.webSocketDebuggerUrl, 's1');
  await s1.open;
  const en1 = await sendRaw(s1, 'WebMCP.enable', {}).promise;
  out.s1Enable = { result: en1.result ?? null, error: en1.error ?? null };
  await sendRaw(s1, 'Page.enable', {}).promise;
  await sendRaw(s1, 'Runtime.enable', {}).promise;
  const nav = await sendRaw(s1, 'Page.navigate', { url: fixtureUrl }).promise;
  const frameId = nav.result && nav.result.frameId;
  out.frameId = frameId;
  const namesSeen = () => new Set(s1.events
    .filter((e) => e.method === 'WebMCP.toolsAdded')
    .flatMap((e) => (e.params.tools || []).map((t) => t.name)));
  const allTools = await waitFor(
    () => ['echo', 'delay', 'boom'].every((n) => namesSeen().has(n)), 6000);
  out.registration = {
    allThreeToolsAnnounced: allTools,
    toolsAnnounced: [...namesSeen()],
    pageRegister: null,
  };
  const regEval = await sendRaw(s1, 'Runtime.evaluate', {
    expression: 'window.__register', awaitPromise: true, returnByValue: true,
  }).promise;
  const regValue = valueOf(regEval);
  out.registration.pageRegister = regValue !== undefined ? regValue : { protocolError: regEval.error || 'no-value' };

  // Group 1: same tool, submission order alpha (500ms) then beta (50ms).
  out.groupA = await invokeGroup(s1, frameId, [
    { label: 'alpha-slow', toolName: 'delay', input: { text: 'alpha', ms: 500 } },
    { label: 'beta-fast', toolName: 'delay', input: { text: 'beta', ms: 50 } },
  ]);
  out.groupA.id = 'same-tool-reorder';
  out.groupA.expectedRespondedOrder = ['beta-fast', 'alpha-slow'];

  // Group 2: different tools at once, one of them throwing.
  out.groupB = await invokeGroup(s1, frameId, [
    { label: 'slow-delay', toolName: 'delay', input: { text: 'slow', ms: 300 } },
    { label: 'fast-echo', toolName: 'echo', input: { text: 'fast' } },
    { label: 'throwing-boom', toolName: 'boom', input: { text: 'kaboom' } },
  ]);
  out.groupB.id = 'different-tools';

  // Group 3: identical tool + identical input, sent in the same tick.
  out.groupC = await invokeGroup(s1, frameId, [
    { label: 'dup-1', toolName: 'echo', input: { text: 'dup' } },
    { label: 'dup-2', toolName: 'echo', input: { text: 'dup' } },
  ]);
  out.groupC.id = 'duplicate-identical';

  // Group 4: sibling observer session, enabled but issuing nothing.
  const s2 = makeSession(target.webSocketDebuggerUrl, 's2');
  await s2.open;
  const en2 = await sendRaw(s2, 'WebMCP.enable', {}).promise;
  await sleep(150);
  const s2EventsBefore = s2.events.filter((e) => e.method.startsWith('WebMCP.')).length;
  const s2StartIdx = s2.raw.length;
  const obs = sendRaw(s1, 'WebMCP.invokeTool', {
    frameId, toolName: 'echo', input: { text: 'watched' },
  });
  const obsRes = await obs.promise;
  const obsId = obsRes.result && obsRes.result.invocationId;
  await waitFor(() => obsId && respondedFor(s1, obsId).length >= 1, 4000);
  await sleep(300); // grace window for any cross-session delivery
  const s2Webmcp = s2.events.filter((e) => e.method.startsWith('WebMCP.'));
  const s2InvocationEvents = s2Webmcp.filter(
    (e) => e.method === 'WebMCP.toolInvoked' || e.method === 'WebMCP.toolResponded');
  out.observer = {
    id: 'observer-session',
    s2Enable: { result: en2.result ?? null, error: en2.error ?? null },
    s2EventsBefore: s2EventsBefore,
    s2ToolsAddedOnEnable: s2.events.filter((e) => e.method === 'WebMCP.toolsAdded')
      .flatMap((e) => (e.params.tools || []).map((t) => t.name)),
    s2WebmcpEventMethods: s2Webmcp.map((e) => e.method),
    s2InvocationEvents: s2InvocationEvents.map((e) => ({ tMs: e.t, method: e.method, params: e.params })),
    s2SawInvocation: s2InvocationEvents.some((e) => e.params && e.params.invocationId === obsId),
    s1InvokedForObserved: invokedFor(s1, obsId).length,
    s1RespondedForObserved: respondedFor(s1, obsId).length,
    s1RespondedParams: (respondedFor(s1, obsId)[0] || {}).params || null,
    s1CommandResult: obsRes.result ?? null,
    s2Frames: s2.raw.slice(s2StartIdx),
    s2RawTotal: s2.raw.length,
  };

  // Group 5: S1 and S2 each invoke concurrently; can either event stream
  // attribute an invocation to the CDP session that issued it?
  const dStartS1 = s1.raw.length;
  const dStartS2 = s2.raw.length;
  const d1cmd = sendRaw(s1, 'WebMCP.invokeTool', { frameId, toolName: 'delay', input: { text: 'from-s1', ms: 150 } });
  const d2cmd = sendRaw(s2, 'WebMCP.invokeTool', { frameId, toolName: 'delay', input: { text: 'from-s2', ms: 80 } });
  const [d1res, d2res] = await Promise.all([d1cmd.promise, d2cmd.promise]);
  const dIds = [d1res.result && d1res.result.invocationId, d2res.result && d2res.result.invocationId]
    .filter(Boolean);
  await waitFor(() => dIds.every((id) => respondedFor(s1, id).length >= 1 && respondedFor(s2, id).length >= 1), 6000);
  const dInvocation = (label, input, cmd, res, st) => {
    const id = res.result && res.result.invocationId;
    const invoked = id ? invokedFor(st, id).map((e) => ({ tMs: e.t, params: e.params })) : [];
    const responded = id ? respondedFor(st, id).map((e) => ({ tMs: e.t, params: e.params })) : [];
    const output = responded[0] ? (responded[0].params.output ?? null) : null;
    return {
      label, toolName: 'delay', input, commandId: cmd.id, result: res.result ?? null,
      protocolError: res.error ?? null, toolInvoked: invoked, toolResponded: responded,
      status: responded[0] ? responded[0].params.status : null, output,
      outputEmbedsOwnInput: typeof output === 'string' ? output === `delay:${input.text}:${input.ms}` : null,
      pageInputMatches: invoked.length > 0 ? canon(JSON.parse(invoked[0].params.input)) === canon(input) : false,
    };
  };
  const dGroupEvents = (st) => st.events
    .filter((e) => (e.method === 'WebMCP.toolInvoked' || e.method === 'WebMCP.toolResponded') &&
      dIds.includes(e.params && e.params.invocationId))
    .map((e) => ({ tMs: e.t, method: e.method, invocationId: e.params.invocationId,
      toolName: e.params.toolName, status: e.params.status }));
  const dUniquePerStream = (st) => dIds.every((id) => {
    const evs = dGroupEvents(st);
    return evs.filter((e) => e.method === 'WebMCP.toolInvoked' && e.invocationId === id).length === 1 &&
      evs.filter((e) => e.method === 'WebMCP.toolResponded' && e.invocationId === id).length === 1;
  });
  out.groupD = {
    id: 'two-sessions-concurrent',
    s1Command: { id: d1cmd.id, result: d1res.result ?? null, error: d1res.error ?? null },
    s2Command: { id: d2cmd.id, result: d2res.result ?? null, error: d2res.error ?? null },
    invocations: [
      dInvocation('from-s1', { text: 'from-s1', ms: 150 }, d1cmd, d1res, s1),
      dInvocation('from-s2', { text: 'from-s2', ms: 80 }, d2cmd, d2res, s2),
    ],
    s1Events: dGroupEvents(s1),
    s2Events: dGroupEvents(s2),
    s1EventCounts: dGroupEvents(s1).length,
    s2EventCounts: dGroupEvents(s2).length,
    s1SeesS2: !!d2res.result && dGroupEvents(s1).some((e) => e.invocationId === d2res.result.invocationId),
    s2SeesS1: !!d1res.result && dGroupEvents(s2).some((e) => e.invocationId === d1res.result.invocationId),
    s1UniquePerInvocationInStream: dUniquePerStream(s1),
    s2UniquePerInvocationInStream: dUniquePerStream(s2),
    s1Frames: s1.raw.slice(dStartS1),
    s2Frames: s2.raw.slice(dStartS2),
  };
  out.groupD.checks = {
    respondedParams: out.groupD.invocations.map((i) => (i.toolResponded[0] ? i.toolResponded[0].params : null)),
    phaseSeparation: (() => {
      const firstResponse = out.groupD.s1Events.findIndex((e) => e.method === 'WebMCP.toolResponded');
      if (firstResponse < 0) return 'no-responses';
      return out.groupD.s1Events.slice(firstResponse).some((e) => e.method === 'WebMCP.toolInvoked')
        ? 'interleaved' : 'separated';
    })(),
    copiesPerStream: dIds.map((id) => ({
      invocationId: id,
      s1: dGroupEvents(s1).filter((e) => e.invocationId === id).length,
      s2: dGroupEvents(s2).filter((e) => e.invocationId === id).length,
    })),
  };

  // Page-side execute log (what each tool's execute actually received).
  const callsEval = await sendRaw(s1, 'Runtime.evaluate', {
    expression: '({ count: window.__calls.length, calls: window.__calls })',
    returnByValue: true,
  }).promise;
  const callsValue = valueOf(callsEval);
  out.pageCalls = callsValue !== undefined ? callsValue : { protocolError: callsEval.error || 'no-value' };

  out.transcript = { s1RawTotal: s1.raw.length, s1Events: s1.events.length, s2RawTotal: s2.raw.length };

  // --- predicate evaluation (against everything observed above) ---
  const allGroups = [out.groupA, out.groupB, out.groupC, out.groupD];
  const allInvocations = allGroups.flatMap((g) => g.invocations);
  const allIds = allInvocations.map((i) => i.result && i.result.invocationId).filter(Boolean);
  const everythingRespondedParams = allGroups.flatMap((g) => g.checks.respondedParams).filter(Boolean);
  const allInvokedParams = allInvocations.flatMap((i) => i.toolInvoked.map((x) => x.params));
  const pageCallsValue = out.pageCalls && Array.isArray(out.pageCalls.calls) ? out.pageCalls.calls : [];
  const expectedExecutions = allInvocations.length + 1; // + the observer-session invocation

  const results = [];
  const record = (id, pass, detail) => results.push({ id, pass, detail });
  record('concurrent-ids-unique',
    allIds.length === allInvocations.length && allIds.length === new Set(allIds).size,
    `${allIds.length} ids for ${allInvocations.length} invocations, ${new Set(allIds).size} distinct`);
  record('ack-only',
    allInvocations.every((i) => i.result && Object.keys(i.result).length === 1 &&
      typeof i.result.invocationId === 'string'),
    JSON.stringify(allInvocations.map((i) => i.result)));
  record('one-invoked-one-responded',
    allInvocations.every((i) => i.toolInvoked.length === 1 && i.toolResponded.length === 1) &&
      out.groupD.s1UniquePerInvocationInStream && out.groupD.s2UniquePerInvocationInStream,
    `per issuing stream: ${JSON.stringify(allInvocations.map((i) => `${i.label}:inv=${i.toolInvoked.length},resp=${i.toolResponded.length}`))}; groupD s1Unique=${out.groupD.s1UniquePerInvocationInStream} s2Unique=${out.groupD.s2UniquePerInvocationInStream}`);
  const respondedKeys = [...new Set(everythingRespondedParams.flatMap((p) => Object.keys(p)))].sort();
  record('responded-carries-toolname',
    everythingRespondedParams.every((p) => Object.prototype.hasOwnProperty.call(p, 'toolName')),
    `toolResponded param keys observed: ${JSON.stringify(respondedKeys)}`);
  record('overlap',
    out.groupA.checks.laterInvokedBeforeFirstResponse === true,
    `groupA events: ${JSON.stringify(out.groupA.events)}`);
  record('no-crosstalk',
    allInvocations.filter((i) => i.toolName !== 'boom').every((i) => i.outputEmbedsOwnInput === true) &&
      allInvocations.filter((i) => i.toolName === 'boom').every((i) => i.status === 'Error' &&
        i.toolResponded[0] && i.toolResponded[0].params.exception &&
        String(i.toolResponded[0].params.exception.description).includes(`boom:${i.input.text}`)),
    `non-boom own-output=${allInvocations.filter((i) => i.toolName !== 'boom').map((i) => ({ tool: i.toolName, out: i.output, own: i.outputEmbedsOwnInput }))}; boom=${JSON.stringify(allGroups.flatMap((g) => g.checks.boomErrorShape))}`);
  record('responded-completion-order',
    JSON.stringify(out.groupA.checks.respondedOrder) === JSON.stringify(['beta-fast', 'alpha-slow']),
    `order=${JSON.stringify(out.groupA.checks.respondedOrder)} expected=${JSON.stringify(['beta-fast', 'alpha-slow'])}; groupB order=${JSON.stringify(out.groupB.checks.respondedOrder)}`);
  record('duplicate-input-distinct-ids',
    out.groupC.checks.idsUnique && out.groupC.checks.invokedOnePerInvocation &&
      out.groupC.checks.respondedOnePerInvocation,
    JSON.stringify(out.groupC.invocations.map((i) => ({ label: i.label, id: i.result && i.result.invocationId, status: i.status }))));
  record('observer-session-isolation',
    out.observer.s2SawInvocation === false,
    `s2 invocation events=${out.observer.s2InvocationEvents.length}, s2 methods=${JSON.stringify(out.observer.s2WebmcpEventMethods)}`);
  record('dual-session-cross-delivery',
    out.groupD.s1SeesS2 === true && out.groupD.s2SeesS1 === true,
    JSON.stringify({ s1EventCounts: out.groupD.s1EventCounts, s2EventCounts: out.groupD.s2EventCounts, s1SeesS2: out.groupD.s1SeesS2, s2SeesS1: out.groupD.s2SeesS1 }));
  const sessionKeyNames = ['sessionId', 'session', 'clientId', 'workerId'];
  const anySessionKey = [...everythingRespondedParams, ...allInvokedParams]
    .some((p) => sessionKeyNames.some((k) => Object.prototype.hasOwnProperty.call(p, k)));
  record('session-attributable',
    anySessionKey,
    `any session-ish key on an invocation event: ${anySessionKey}`);
  record('page-executions-match',
    pageCallsValue.length === expectedExecutions &&
      allInvocations.every((i) => i.pageInputMatches === true),
    `page execute entries=${pageCallsValue.length}, expected=${expectedExecutions}, inputsPreserved=${allInvocations.every((i) => i.pageInputMatches === true)}`);

  out.predicateResults = results;
  out.verdict = {
    allPredicatesHeld: results.every((r) => r.pass === true),
    failed: results.filter((r) => r.pass !== true).map((r) => r.id),
    invocationIdUnique: results.find((r) => r.id === 'concurrent-ids-unique').pass,
    respondedCarriesToolName: results.find((r) => r.id === 'responded-carries-toolname').pass,
    observerIsolated: results.find((r) => r.id === 'observer-session-isolation').pass,
    dualSessionCrossDelivery: results.find((r) => r.id === 'dual-session-cross-delivery').pass,
    sessionAttributable: results.find((r) => r.id === 'session-attributable').pass,
    completionOrder: out.groupA.checks.respondedOrder,
    phaseSeparation: allGroups.map((g) => ({ id: g.id, phase: g.checks.phaseSeparation })),
    ackBeforeCompletion: (() => {
      const a = out.groupA.invocations.find((i) => i.label === 'alpha-slow');
      return a && a.tResultMs < (a.toolResponded[0] ? a.toolResponded[0].tMs : Infinity);
    })(),
  };
}

const watchdog = setTimeout(() => {
  console.error('invoke-concurrency: watchdog fired');
  process.exitCode = 3;
}, 240000);
watchdog.unref();

try {
  await main();
} catch (e) {
  out.fatal = String(e && e.stack ? e.stack : e);
  process.exitCode = 1;
} finally {
  for (const st of sessions) { try { st.ws.close(); } catch { /* already closed */ } }
  await sleep(100);
  // Kill: the launcher pid plus every process carrying this run's profile.
  const killed = [];
  try {
    if (chromium && chromium.pid) { try { process.kill(chromium.pid, 'SIGKILL'); killed.push({ pid: chromium.pid, how: 'spawn-pid' }); } catch { /* gone */ } }
    if (tmpBase) {
      const marker = `--user-data-dir=${join(tmpBase, 'profile')}`;
      const hits = findProcessesUsing(marker);
      for (const h of hits) {
        try { process.kill(h.pid, 'SIGKILL'); killed.push({ pid: h.pid, how: 'profile-marker' }); } catch { /* gone */ }
      }
      // Prove gone: no live process names the profile, and the spawn pid is
      // either absent or a reaped zombie (state Z) — never a running browser.
      let survivors = [];
      for (let i = 0; i < 50; i += 1) {
        survivors = findProcessesUsing(marker);
        if (survivors.length === 0) break;
        await sleep(100);
      }
      const spawnPid = chromium ? chromium.pid : 0;
      if (chromium && chromium.exitCode === null && chromium.signalCode === null) {
        await Promise.race([new Promise((r) => chromium.once('exit', r)), sleep(2000)]);
      }
      const spawnPresent = existsSync(`/proc/${spawnPid}`);
      const spawnPidState = procState(spawnPid);
      const pidGone = !spawnPresent || spawnPidState === 'Z';
      out.shutdown = {
        killed,
        profileMarker: marker,
        survivors: survivors.map((s) => ({ pid: s.pid, argv: s.argv.slice(0, 6) })),
        gone: survivors.length === 0 && pidGone,
        spawnPid,
        spawnPidPresent: spawnPresent,
        spawnPidState,
        spawnPidGone: pidGone,
        checkedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    out.shutdown = { error: String(e), gone: false };
  }
  try { if (server) server.close(); } catch { /* closed */ }
  try { if (tmpBase) rmSync(tmpBase, { recursive: true, force: true }); } catch { /* best effort */ }
  out.loopback = {
    bindAddress: '127.0.0.1',
    requestCount: httpRequests.length,
    externalRequestCount: httpRequests.filter((r) => r.remoteAddress !== '127.0.0.1').length,
    paths: [...new Set(httpRequests.map((r) => r.url))],
  };
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
}

console.log(JSON.stringify({
  verdict: out.verdict || null,
  fatal: out.fatal || null,
  shutdown: out.shutdown ? { gone: out.shutdown.gone, survivors: out.shutdown.survivors.length } : null,
  out: OUT,
}));
process.exit(process.exitCode || 0);
