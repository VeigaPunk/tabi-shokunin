#!/usr/bin/env node
// probes/invoke-controls.mjs — round-17 C2 falsifier probe: invocation controls
// and input-schema behaviour of Chromium 154's WebMCP.invokeTool CDP command.
//
// Questions (fixed before the run):
//   Q1  flag-off (no WebMCP feature tokens): exact WebMCP.enable / invokeTool
//       results. Is "Tool not found" distinguishable from "no page feature"?
//   Q2  --disable-features=DevToolsWebMCPSupport with the page feature on:
//       exact failure text for WebMCP.enable and WebMCP.invokeTool, and does
//       /json/protocol still advertise the domain?
//   Q3  With flags on and a registered echo tool whose inputSchema requires
//       {text: string}: does Chromium validate the CDP `input` object against
//       that schema before running `execute`? Cases: missing required key,
//       wrong property type, extra property, input:null, input omitted at the
//       CDP-parameter layer. Page-side execute records decide who ran.
//
// Raw CDP over the page-target websocket with Node 24's built-in WebSocket.
// Every frame sent/received is recorded verbatim in arm.traffic[].
// Loopback 127.0.0.1 only (--host-resolver-rules blocks every other host from
// the browser), fresh temp --user-data-dir per arm, browser SIGKILLed and its
// pid (plus any process carrying the profile path) verified gone before the
// next arm starts. Nothing outside the loopback fixture is invoked; the only
// tool is the fixture's own read-only echo.
//
// Usage: node .ufo/waves/round-17/probes/invoke-controls.mjs [--out <json>]
//        [--chromium <path>] [--case-wait-ms N]
// Default output: JSON on stdout (no file written). --out additionally writes
// the same bytes to that path. Exit 0 when every arm ran and every browser is
// confirmed gone; 1 on a fatal harness error.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import {
  existsSync, mkdtempSync, readFileSync, readlinkSync, readdirSync, realpathSync,
  rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};
const OUT = opt('out', null);
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');
const CASE_WAIT_MS = Number(opt('case-wait-ms', 4000));

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Round-16 receipt runs[].launchedArgs (flagged / flag-off / domain-disabled),
// plus the raw-CDP launch base the round-16 invoke probe used.
const HOST_RESOLVER = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';
const LAUNCH_BASE = [
  '--headless', '--remote-debugging-port=0', '--no-first-run',
  '--no-default-browser-check', '--disable-gpu',
];
const FLAGGED_ARGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const ARMS = [
  { id: 'flagged', launchedArgs: [HOST_RESOLVER, ...FLAGGED_ARGS] },
  { id: 'flag-off', launchedArgs: [HOST_RESOLVER] },
  {
    id: 'devtools-domain-disabled',
    launchedArgs: [HOST_RESOLVER, '--enable-blink-features=WebMCP',
      '--disable-features=DevToolsWebMCPSupport'],
  },
];

// Fixture: one imperative read-only tool. `execute` records exactly what it
// received, so the page side (not the CDP response) decides whether an
// invalid input reached `execute`.
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>r17-invoke-controls</title></head><body><script>
window.__execLog = [];
window.__registerState = (async () => {
  const mc = document.modelContext;
  if (!mc) return { ok: false, reason: 'no-document.modelContext' };
  try {
    await mc.registerTool({
      name: 'echo',
      description: 'Echo the provided text back to the caller (read-only, no side effects).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => {
        let json;
        try { json = JSON.stringify(input); } catch (e) { json = 'unstringifiable'; }
        if (json === undefined) json = 'undefined';
        window.__execLog.push({
          at: Date.now(),
          tool: 'echo',
          inputJson: json,
          typeofInput: input === null ? 'null' : typeof input,
          inputIsArray: Array.isArray(input),
          keys: input && typeof input === 'object' ? Object.keys(input) : null,
          typeofText: input && typeof input === 'object' ? typeof input.text : null
        });
        return 'echo:' + (input && input.text);
      }
    });
    return { ok: true };
  } catch (e) { return { ok: false, reason: String(e) }; }
})();
</script></body></html>`;

const CASES = {
  flagged: [
    { id: 'valid-input', hasInput: true, input: { text: 'round17-invoke-controls' } },
    { id: 'missing-required', hasInput: true, input: {} },
    { id: 'wrong-type', hasInput: true, input: { text: 42 } },
    { id: 'extra-property', hasInput: true, input: { text: 'x', extra: true } },
    { id: 'input-null', hasInput: true, input: null },
    { id: 'input-omitted', hasInput: false },
    { id: 'unknown-tool', toolName: 'no-such-tool', hasInput: true, input: { text: 'x' } },
    { id: 'valid-input-after-mismatches', hasInput: true, input: { text: 'after' } },
  ],
  'flag-off': [
    { id: 'invoke-known-name', hasInput: true, input: { text: 'x' } },
    { id: 'invoke-unknown-name', toolName: 'no-such-tool', hasInput: true, input: { text: 'x' } },
    { id: 'invoke-input-omitted', hasInput: false },
  ],
  'devtools-domain-disabled': [
    { id: 'invoke-known-name', hasInput: true, input: { text: 'x' } },
  ],
};

// Mirrors the round-16 harness (scripts/webmcp-loopback-round16.mjs:232-241):
// HOME/XDG_CONFIG_HOME point into the temp profile, so the Arch chromium
// launcher does not inject ~/.config/chromium-flags.conf tokens into the
// argv under test. The record still stores the real /proc argv.
function minimalBrowserEnv(homeDir) {
  return {
    HOME: homeDir,
    XDG_CONFIG_HOME: join(homeDir, '.config'),
    PATH: process.env.PATH || '/usr/bin:/bin',
    TMPDIR: tmpdir(),
    TZ: 'UTC',
    LANG: 'C.UTF-8',
  };
}

// A WebMCP flag token, strict enough that a profile path containing "webmcp"
// cannot be mistaken for one (round-16 harness readProcArgv comment).
function isWebmcpFlagToken(tok) {
  return (/^--enable-(blink-)?features=/.test(tok) && /webmcp/i.test(tok))
    || tok === '--enable-experimental-web-platform-features';
}

function procsMatchingProfile(profile) {
  const hits = [];
  for (const name of readdirSync('/proc')) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const cmd = readFileSync(`/proc/${name}/cmdline`, 'utf8').split('\0').join(' ').trim();
      if (cmd.includes(profile)) hits.push({ pid: Number(name), cmd: cmd.slice(0, 400) });
    } catch { /* not ours / vanished */ }
  }
  return hits;
}

function makeCdp(wsUrl, t0, traffic) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const events = [];
  let nextId = 0;
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', () => reject(new Error('websocket error')));
  });
  ws.addEventListener('message', (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { msg = { parseError: String(ev.data) }; }
    traffic.push({ dir: 'recv', atMs: Date.now() - t0, message: msg });
    if (msg.id != null && pending.has(msg.id)) {
      const settle = pending.get(msg.id);
      pending.delete(msg.id);
      settle(msg);
    } else if (msg.method) {
      events.push({ atMs: Date.now() - t0, method: msg.method, params: msg.params ?? null });
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const message = { id, method, params };
    traffic.push({ dir: 'send', atMs: Date.now() - t0, message });
    pending.set(id, (m) => {
      if (m.error) {
        reject(Object.assign(new Error(`${method}: ${m.error.message}`),
          { protocolError: m.error }));
      } else {
        resolve(m.result);
      }
    });
    ws.send(JSON.stringify(message));
  });
  return { ready, send, events, traffic, close: () => { try { ws.close(); } catch { /* closed */ } } };
}

async function waitFor(pred, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = pred();
    if (v) return v;
    await sleep(50);
  }
  return null;
}

async function evaluate(cdp, expression, extra = {}) {
  const r = await cdp.send('Runtime.evaluate', {
    expression, returnByValue: true, ...extra,
  });
  if (r && r.exceptionDetails) {
    return { __exception: r.exceptionDetails.text ?? 'exception' };
  }
  return r?.result?.value ?? null;
}

async function readExecLog(cdp) {
  const v = await evaluate(cdp, 'JSON.stringify(window.__execLog || [])');
  if (typeof v !== 'string') return [];
  try { return JSON.parse(v); } catch { return []; }
}

async function runCase(cdp, frameId, spec) {
  const beforeEvents = cdp.events.length;
  const beforeExec = await readExecLog(cdp);
  const params = { frameId, toolName: spec.toolName ?? 'echo' };
  if (spec.hasInput) params.input = spec.input;
  const out = {
    case: spec.id,
    request: { method: 'WebMCP.invokeTool', params },
    result: null,
    error: null,
    toolInvoked: null,
    toolResponded: null,
    pageExecuteRecords: [],
    otherEvents: [],
  };
  try {
    out.result = await cdp.send('WebMCP.invokeTool', params);
  } catch (e) {
    out.error = e.protocolError ?? { message: String(e) };
  }
  if (out.result && out.result.invocationId) {
    const invoked = await waitFor(() => cdp.events.find((e) => e.method === 'WebMCP.toolInvoked'
      && e.params?.invocationId === out.result.invocationId), CASE_WAIT_MS);
    const responded = await waitFor(() => cdp.events.find((e) => e.method === 'WebMCP.toolResponded'
      && e.params?.invocationId === out.result.invocationId), CASE_WAIT_MS);
    out.toolInvoked = invoked?.params ?? null;
    out.toolResponded = responded?.params ?? null;
  }
  const afterExec = await readExecLog(cdp);
  out.pageExecuteRecords = afterExec.slice(beforeExec.length);
  out.execLogLengthBefore = beforeExec.length;
  out.execLogLengthAfter = afterExec.length;
  out.otherEvents = cdp.events.slice(beforeEvents)
    .filter((e) => !/^WebMCP\.tool(Invoked|Responded)$/.test(e.method))
    .map((e) => ({ atMs: e.atMs, method: e.method, params: e.params }));
  return out;
}

async function killAndConfirm(child, profile) {
  const pid = child?.pid ?? null;
  const out = {
    pid,
    groupKillSent: false,
    sigkillSent: false,
    escalated: [],
    exit: null,
    mainPidGoneAfterMs: null,
    allGoneAfterMs: null,
    stillExistsAtEnd: null,
    allGoneAtEnd: null,
    kill0: null,
    leftover: [],
  };
  if (!child || pid == null) return out;
  const exited = new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  const t0 = Date.now();
  // The browser was spawned detached, so its children (crashpad handlers,
  // zygotes, renderers) share pid's process group: kill the group first.
  try {
    process.kill(-pid, 'SIGKILL');
    out.groupKillSent = true;
  } catch (e) { out.groupKillError = e.code || String(e); }
  try {
    child.kill('SIGKILL');
    out.sigkillSent = true;
  } catch (e) { out.killError = String(e); }
  out.exit = await Promise.race([exited, sleep(5000).then(() => null)]);
  while (Date.now() - t0 < 5000) {
    const mainGone = !existsSync(`/proc/${pid}`);
    if (mainGone && out.mainPidGoneAfterMs === null) out.mainPidGoneAfterMs = Date.now() - t0;
    const leftovers = procsMatchingProfile(profile);
    if (mainGone && leftovers.length === 0) {
      out.allGoneAfterMs = Date.now() - t0;
      break;
    }
    for (const l of leftovers) {
      if (out.escalated.includes(l.pid)) continue;
      try {
        process.kill(l.pid, 'SIGKILL');
        out.escalated.push(l.pid);
      } catch { /* already gone */ }
    }
    await sleep(100);
  }
  out.stillExistsAtEnd = existsSync(`/proc/${pid}`);
  try {
    process.kill(pid, 0);
    out.kill0 = 'alive';
  } catch (e) {
    out.kill0 = e.code || String(e);
  }
  out.leftover = procsMatchingProfile(profile);
  out.allGoneAtEnd = !out.stillExistsAtEnd && out.leftover.length === 0;
  return out;
}

async function runArm(spec, fixtureUrl) {
  const t0 = Date.now();
  const profile = mkdtempSync(join(tmpdir(), `r17-invoke-${spec.id}-`));
  const arm = {
    id: spec.id,
    launchBase: LAUNCH_BASE,
    launchedArgs: spec.launchedArgs,
    startedAt: new Date().toISOString(),
    profileDir: profile,
    pid: null,
    browserCmdline: null,
    protocol: null,
    enables: {},
    enableSeq: [],
    navigation: null,
    readyState: null,
    pageState: null,
    registration: null,
    toolsAddedEvent: null,
    cases: [],
    eventMethodCounts: {},
    traffic: [],
    kill: null,
    fatal: null,
    stderrTail: null,
  };
  const stderrChunks = [];
  let child = null;
  let cdp = null;
  try {
    if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
    child = spawn(CHROMIUM, [...LAUNCH_BASE, ...spec.launchedArgs, `--user-data-dir=${profile}`],
      { stdio: ['ignore', 'ignore', 'pipe'], env: minimalBrowserEnv(profile), detached: true });
    arm.env = { HOME: profile, XDG_CONFIG_HOME: join(profile, '.config') };
    arm.pid = child.pid;
    child.stderr.on('data', (d) => stderrChunks.push(d));

    let cdpPort = null;
    for (let i = 0; i < 300 && !cdpPort; i++) {
      const f = join(profile, 'DevToolsActivePort');
      try {
        if (existsSync(f)) cdpPort = Number(readFileSync(f, 'utf8').split('\n')[0]);
      } catch { /* still being written */ }
      if (!cdpPort) await sleep(100);
    }
    if (!cdpPort) {
      throw new Error(`DevToolsActivePort never appeared: ${Buffer.concat(stderrChunks).toString('utf8').slice(-600)}`);
    }
    arm.cdpPort = cdpPort;

    try {
      const raw = readFileSync(`/proc/${child.pid}/cmdline`, 'utf8');
      const entries = raw.split('\0').filter(Boolean);
      // Flag presence is checked on whitespace-separated words because one
      // argv element may itself contain spaces (the resolver-rules value),
      // and the Arch launcher can present the whole command line as argv[0]
      // when it injects chromium-flags.conf tokens.
      const words = raw.split(/[\0\s]+/).filter(Boolean);
      arm.browserCmdline = {
        raw: raw.replace(/\0/g, ' ').trim(),
        nulCount: (raw.match(/\0/g) ?? []).length,
        argvCount: entries.length,
        argv: entries,
      };
      arm.webmcpFlagTokens = words.filter(isWebmcpFlagToken);
      arm.webmcpSubstringTokens = words.filter((tok) => /webmcp/i.test(tok));
    } catch (e) { arm.browserCmdlineError = String(e); }
    arm.webmcpFlagTokenCount = (arm.webmcpFlagTokens ?? []).length;
    try {
      arm.realExecutableFromProc = readlinkSync(`/proc/${child.pid}/exe`);
      arm.realExecutableFromProcSha256 = sha256(readFileSync(arm.realExecutableFromProc));
    } catch (e) { arm.realExecutableFromProcError = String(e); }
    arm.procsBeforeKill = procsMatchingProfile(profile);

    const fetchJson = async (path, init) => {
      const res = await fetch(`http://127.0.0.1:${cdpPort}${path}`, init);
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* non-JSON */ }
      return { status: res.status, text, json };
    };

    const version = await fetchJson('/json/version');
    arm.version = { httpStatus: version.status, body: version.json };
    const protocol = await fetchJson('/json/protocol');
    const domains = protocol.json?.domains ?? [];
    const webmcp = domains.find((d) => d.domain === 'WebMCP') ?? null;
    arm.protocol = {
      endpoint: `http://127.0.0.1:${cdpPort}/json/protocol`,
      httpStatus: protocol.status,
      sha256: sha256(protocol.text),
      webmcpPresent: !!webmcp,
      experimental: webmcp?.experimental ?? null,
      commands: (webmcp?.commands ?? []).map((c) => c.name),
      events: (webmcp?.events ?? []).map((e) => e.name),
      invokeTool: (webmcp?.commands ?? []).find((c) => c.name === 'invokeTool') ?? null,
    };

    let target = null;
    for (let i = 0; i < 100 && !target; i++) {
      const list = await fetchJson('/json/list');
      target = (list.json ?? []).find((t) => t.type === 'page') ?? null;
      if (!target) await sleep(50);
    }
    if (!target) {
      const created = await fetchJson('/json/new?about:blank', { method: 'PUT' });
      target = created.json ?? null;
    }
    if (!target?.webSocketDebuggerUrl) throw new Error('no page target with webSocketDebuggerUrl');
    arm.targetId = target.id;

    cdp = makeCdp(target.webSocketDebuggerUrl, t0, arm.traffic);
    await cdp.ready;

    for (const method of ['Page.enable', 'Runtime.enable', 'WebMCP.enable']) {
      const entry = { method, params: {} };
      try {
        entry.result = await cdp.send(method);
      } catch (e) {
        entry.error = e.protocolError ?? { message: String(e) };
      }
      arm.enableSeq.push(entry);
      arm.enables[method] = entry;
    }

    arm.navigation = await cdp.send('Page.navigate', { url: fixtureUrl });
    const frameId = arm.navigation?.frameId ?? null;
    arm.frameId = frameId;
    for (let i = 0; i < 200; i++) {
      try {
        arm.readyState = await evaluate(cdp, 'document.readyState');
      } catch { arm.readyState = null; }
      if (arm.readyState === 'complete') break;
      await sleep(50);
    }

    arm.pageState = await evaluate(cdp, `(() => ({
      origin: location.origin,
      isSecureContext: window.isSecureContext,
      hasDocumentModelContext: 'modelContext' in document,
      documentModelContextType: typeof document.modelContext,
      hasNavigatorModelContext: 'modelContext' in navigator,
      hasRegisterState: '__registerState' in window
    }))()`);

    arm.registration = await evaluate(cdp, `(async () => {
      if (typeof window.__registerState === 'undefined') return { present: false };
      try { return await window.__registerState; }
      catch (e) { return { present: true, ok: false, reason: String(e) }; }
    })()`, { awaitPromise: true });

    if (spec.id === 'flagged') {
      const added = await waitFor(() => cdp.events.find((e) => e.method === 'WebMCP.toolsAdded'
        && (e.params?.tools ?? []).some((t) => t.name === 'echo')), CASE_WAIT_MS);
      arm.toolsAddedEvent = added?.params ?? null;
    }

    if (frameId) {
      for (const cs of CASES[spec.id] ?? []) {
        arm.cases.push(await runCase(cdp, frameId, cs));
      }
    } else {
      arm.fatal = 'navigation returned no frameId';
    }

    for (const e of cdp.events) {
      arm.eventMethodCounts[e.method] = (arm.eventMethodCounts[e.method] ?? 0) + 1;
    }
  } catch (e) {
    arm.fatal = String(e?.stack || e);
  } finally {
    try { cdp && cdp.close(); } catch { /* ignore */ }
    await sleep(100);
    arm.kill = await killAndConfirm(child, profile);
    arm.stderrTail = Buffer.concat(stderrChunks).toString('utf8').slice(-1200) || null;
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 2 });
    } catch (e) { arm.profileRemovalError = String(e); }
    arm.profileRemoved = !existsSync(profile);
    arm.durationMs = Date.now() - t0;
  }
  return arm;
}

function buildSummary(out) {
  const arm = (id) => out.arms.find((a) => a.id === id) ?? null;
  const caseOf = (a, id) => (a?.cases ?? []).find((c) => c.case === id) ?? null;
  const pick = (c) => (c ? {
    case: c.case,
    request: c.request,
    result: c.result,
    error: c.error,
    invocationAccepted: !!c.result?.invocationId,
    toolInvoked: c.toolInvoked,
    toolResponded: c.toolResponded,
    executeRan: (c.pageExecuteRecords ?? []).length > 0,
    pageExecuteRecords: c.pageExecuteRecords,
    execLogLengthBefore: c.execLogLengthBefore,
    execLogLengthAfter: c.execLogLengthAfter,
  } : null);
  const flagged = arm('flagged');
  const flagOff = arm('flag-off');
  const domainDisabled = arm('devtools-domain-disabled');
  return {
    questions: {
      q1: 'flag-off: exact WebMCP.enable/invokeTool results; is Tool-not-found distinguishable from page feature off?',
      q2: 'DevToolsWebMCPSupport disabled: exact enable/invokeTool failure text; protocol still advertises domain?',
      q3: 'does Chromium validate invokeTool input against the registered tool inputSchema before execute?',
    },
    arms: out.arms.map((a) => ({
      id: a.id,
      fatal: a.fatal,
      pid: a.pid,
      durationMs: a.durationMs,
      webmcpFlagTokensOnBrowserCmdline: a.webmcpFlagTokens ?? null,
      webmcpFlagTokenCount: a.webmcpFlagTokenCount ?? null,
      browserCmdlineShape: a.browserCmdline
        ? { nulCount: a.browserCmdline.nulCount, argvCount: a.browserCmdline.argvCount }
        : null,
      webmcpSubstringTokens: a.webmcpSubstringTokens ?? null,
      realExecutableFromProc: a.realExecutableFromProc ?? null,
      realExecutableFromProcSha256: a.realExecutableFromProcSha256 ?? null,
      protocolWebmcpPresent: a.protocol?.webmcpPresent ?? null,
      protocolCommands: a.protocol?.commands ?? null,
      webmcpEnable: a.enables?.['WebMCP.enable'] ?? null,
      documentModelContextType: a.pageState?.documentModelContextType ?? null,
      registration: a.registration,
      toolsAddedEvent: a.toolsAddedEvent ? {
        toolNames: (a.toolsAddedEvent.tools ?? []).map((t) => t.name),
        frameIdMatches: a.toolsAddedEvent.tools?.[0]?.frameId === a.frameId,
      } : null,
      kill: a.kill,
      profileRemoved: a.profileRemoved,
    })),
    controls: {
      flagOffEnable: flagOff?.enables?.['WebMCP.enable'] ?? null,
      flagOffInvokeKnownName: pick(caseOf(flagOff, 'invoke-known-name')),
      flagOffInvokeUnknownName: pick(caseOf(flagOff, 'invoke-unknown-name')),
      flagOffInputOmitted: pick(caseOf(flagOff, 'invoke-input-omitted')),
      domainDisabledEnable: domainDisabled?.enables?.['WebMCP.enable'] ?? null,
      domainDisabledInvoke: pick(caseOf(domainDisabled, 'invoke-known-name')),
    },
    schemaValidation: {
      cases: (flagged?.cases ?? []).map(pick),
      executeRanForMissingRequired: (caseOf(flagged, 'missing-required')?.pageExecuteRecords ?? []).length > 0,
      executeRanForWrongType: (caseOf(flagged, 'wrong-type')?.pageExecuteRecords ?? []).length > 0,
      executeRanForExtraProperty: (caseOf(flagged, 'extra-property')?.pageExecuteRecords ?? []).length > 0,
      executeRanForInputNull: (caseOf(flagged, 'input-null')?.pageExecuteRecords ?? []).length > 0,
      executeRanForInputOmitted: (caseOf(flagged, 'input-omitted')?.pageExecuteRecords ?? []).length > 0,
      protocolErrorsObserved: (flagged?.cases ?? [])
        .filter((c) => c.error)
        .map((c) => ({ case: c.case, error: c.error })),
      toolRespondedStatuses: (flagged?.cases ?? [])
        .map((c) => ({ case: c.case, status: c.toolResponded?.status ?? null,
          errorText: c.toolResponded?.errorText ?? null,
          output: c.toolResponded?.output ?? null })),
    },
    allBrowsersGone: out.arms.length === ARMS.length && out.arms.every((a) =>
      a.kill && a.kill.allGoneAtEnd === true && a.kill.stillExistsAtEnd === false
      && (a.kill.leftover ?? []).length === 0),
  };
}

const out = {
  schema: 'tabi-round17-webmcp-invoke-controls-v1',
  seat: 'C2ProbeControls',
  capturedAt: new Date().toISOString(),
  question: 'WebMCP.invokeTool on Chromium 154: flag-off and DevToolsWebMCPSupport-disabled error text; inputSchema enforcement before execute.',
  scope: 'loopback 127.0.0.1 only; temp profile per arm; only the fixture\'s read-only echo tool is invoked; raw CDP frames recorded',
  runtime: null,
  producerSha256: null,
  fixture: null,
  arms: [],
  summary: null,
  fatal: null,
};

let server = null;
try {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  // /usr/bin/chromium is the Arch launcher (a regular file, not a symlink);
  // the browser proper is the /proc/<pid>/exe target read per arm.
  out.runtime = {
    node: process.version,
    launcherPath: CHROMIUM,
    launcherSha256: sha256(readFileSync(CHROMIUM)),
    launcherRealPath: realpathSync(CHROMIUM),
    realExecutable: null,
    realExecutableSha256: null,
  };
  out.producerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));

  const fixtureSha256 = sha256(FIXTURE_HTML);
  server = createServer((req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(FIXTURE_HTML);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const fixtureUrl = `http://127.0.0.1:${server.address().port}/fixture.html`;
  out.fixture = {
    url: fixtureUrl,
    sha256: fixtureSha256,
    tool: 'echo',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  };

  for (const spec of ARMS) {
    out.arms.push(await runArm(spec, fixtureUrl));
  }
  const withProcExe = out.arms.find((a) => a.realExecutableFromProc) ?? null;
  if (withProcExe) {
    out.runtime.realExecutable = withProcExe.realExecutableFromProc;
    out.runtime.realExecutableSha256 = withProcExe.realExecutableFromProcSha256;
  }
} catch (e) {
  out.fatal = String(e?.stack || e);
} finally {
  try { server && server.close(); } catch { /* ignore */ }
}

out.summary = buildSummary(out);
const json = JSON.stringify(out, null, 2) + '\n';
if (OUT) writeFileSync(OUT, json);
process.stdout.write(json);
process.exitCode = out.fatal ? 1 : 0;
