#!/usr/bin/env node
// .ufo/waves/round-17/probes/invoke-errorpaths.mjs — round-17 wave-1 falsifier
// for C2's invocation case predicates (PLAN.md C2 required cases
// invoke-imperative-throws / invoke-imperative-rejects).
//
// Question: when a registered WebMCP tool's `execute`
//   (a) throws synchronously,
//   (b) returns a rejected promise (Error and non-Error reason),
//   (c) returns non-string structured output (object / number / null),
//   (d) returns undefined,
// what does the `WebMCP.toolResponded` CDP event carry (`status`, `output`,
// `errorText`, `exception`), and does `WebMCP.invokeTool` itself error?
//
// Method: raw CDP over the page websocket (Node 24 built-in WebSocket).
// Loopback 127.0.0.1 only; fresh temp --user-data-dir AND temp HOME;
// /usr/bin/chromium headless; WebMCP flags exactly as the round-16 flagged
// receipt run. Raw request/response/event JSON is recorded verbatim.
// Never invokes a shell. Kills the browser and verifies the pid is gone.
//
// Usage: node .ufo/waves/round-17/probes/invoke-errorpaths.mjs \
//          [--out <json>] [--chromium <path>]
// The default --out is a temp file: this seat owns only the probe script,
// so the durable copy of the payloads lives in the seat report.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const SCRATCH = mkdtempSync(join(tmpdir(), 'tabi-r17-invoke-errcases-'));
const OUT = opt('out', join(SCRATCH, 'invoke-errorpaths.json'));
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');

// Flag token set copied from corpus/evidence/round-16/webmcp/receipt.json
// runs[label=flagged].launchedArgs (the two WebMCP tokens + resolver rule),
// with the headless mechanics the round-16 probe used to obtain them.
const WEBMCP_FEATURES = 'WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp';
const WEBMCP_BLINK_FEATURES = 'WebMCP,WebMCPTesting';
const HOST_RESOLVER_RULE = 'MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';
const LAUNCH_ARGS = [
  '--headless',
  '--remote-debugging-port=0',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  `--host-resolver-rules=${HOST_RESOLVER_RULE}`,
  `--enable-features=${WEBMCP_FEATURES}`,
  `--enable-blink-features=${WEBMCP_BLINK_FEATURES}`,
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tools exercised by this probe. Each `execute` records what it received in
// window.__calls[name] BEFORE it returns or throws, so the page-side
// observation survives a throw.
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>r17-invoke-errorpaths</title></head><body><script>
window.__calls = {};
window.__reg = {};
window.__ready = false;
(async () => {
  const mc = document.modelContext;
  if (!mc) { window.__reg.fatal = 'no-document.modelContext'; window.__ready = true; return; }
  const mk = (name, fn) => ({
    name: name,
    description: 'round-17 error-path probe tool ' + name,
    inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
    execute: (input) => {
      let recv;
      try { recv = JSON.stringify(input); } catch (e) { recv = 'unserializable:' + String(e); }
      window.__calls[name] = {
        receivedType: typeof input,
        receivedIsObject: !!input && typeof input === 'object',
        receivedJson: recv,
      };
      return fn(input);
    },
  });
  const defs = [
    ['ctl-string', (i) => 'ctl:' + (i && i.q)],
    ['sync-throw', () => { throw new Error('sync-boom'); }],
    ['async-reject', async () => { throw new Error('async-boom'); }],
    ['reject-string', () => Promise.reject('plain-string-reason')],
    ['returns-object', () => ({ ok: true, n: 3 })],
    ['returns-number', () => 42],
    ['returns-null', () => null],
    ['returns-undefined', () => {}],
  ];
  for (const pair of defs) {
    try { await mc.registerTool(mk(pair[0], pair[1])); window.__reg[pair[0]] = 'registered'; }
    catch (e) { window.__reg[pair[0]] = 'register-failed: ' + String(e); }
  }
  window.__ready = true;
})();
</script></body></html>`;

const out = {
  schema: 'tabi-round17-probe-invoke-errorpaths-v1',
  seat: 'TabiR17.C2ProbeErrorPaths-2',
  capturedAt: new Date().toISOString(),
  question:
    'What does WebMCP.toolResponded carry when execute throws synchronously, rejects, ' +
    'returns non-string structured output, or returns undefined; and does invokeTool itself error?',
  scope:
    'loopback http://127.0.0.1:<ephemeral> only; fresh temp user-data-dir and HOME; ' +
    'only fixture-registered tools invoked; browser SIGKILLed and pid death verified',
  launchArgs: LAUNCH_ARGS,
  webmcpFlags: {
    '--enable-features': WEBMCP_FEATURES,
    '--enable-blink-features': WEBMCP_BLINK_FEATURES,
    '--host-resolver-rules': HOST_RESOLVER_RULE,
    source: 'corpus/evidence/round-16/webmcp/receipt.json runs[label=flagged].launchedArgs',
  },
  cases: {},
  probeErrors: [],
};

let chromium = null;
let server = null;
let ws = null;
let profileDir = null;
let homeDir = null;
let xdgDir = null;
let chromiumPid = null;

// Split into pieces so `<script>`-looking text never appears in the source.
const html = FIXTURE_HTML;

const fetchJson = async (port, path) =>
  (await fetch(`http://127.0.0.1:${port}${path}`)).json();

const survivingPids = (needle) => {
  const found = [];
  for (const ent of readdirSync('/proc')) {
    if (!/^\d+$/.test(ent)) continue;
    let cmd = '';
    try { cmd = readFileSync(`/proc/${ent}/cmdline`, 'utf8'); } catch { continue; }
    if (cmd.includes(needle)) found.push(Number(ent));
  }
  return found;
};

try {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  out.runtime = {
    node: process.version,
    chromiumLauncher: CHROMIUM,
    chromiumLauncherSha256: sha256(readFileSync(CHROMIUM)),
    chromiumVersionBanner: null, // filled from CDP Browser.getVersion
  };
  out.producerSha256 = sha256(readFileSync(new URL(import.meta.url)));

  // --- loopback fixture ---
  server = (await import('node:http')).createServer((req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  const fixtureUrl = `http://127.0.0.1:${httpPort}/`;
  out.fixtureUrl = fixtureUrl;
  if (server.address().address !== '127.0.0.1') throw new Error('fixture not bound to 127.0.0.1');

  // --- launch flagged Chromium on a fresh profile + isolated HOME ---
  profileDir = mkdtempSync(join(tmpdir(), 'tabi-r17-invoke-err-prof-'));
  homeDir = mkdtempSync(join(tmpdir(), 'tabi-r17-invoke-err-home-'));
  xdgDir = mkdtempSync(join(tmpdir(), 'tabi-r17-invoke-err-xdg-'));
  // /usr/bin/chromium is an ELF launcher that merges $XDG_CONFIG_HOME/chromium-flags.conf
  // (and $HOME/.config) into argv; isolate both so the effective argv is exactly
  // LAUNCH_ARGS and comparable across hosts.
  const hostConf = join(process.env.XDG_CONFIG_HOME || join(process.env.HOME || '', '.config'),
    'chromium-flags.conf');
  out.launcherIsolation = {
    home: homeDir,
    xdgConfigHome: xdgDir,
    hostFlagsConfPath: hostConf,
    hostFlagsConfPresent: existsSync(hostConf),
    hostFlagsConfTokens: existsSync(hostConf)
      ? readFileSync(hostConf, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
      : [],
    note: 'launcher merges this file into argv unless HOME and XDG_CONFIG_HOME are both isolated',
  };
  const stderrChunks = [];
  chromium = spawn(CHROMIUM, [...LAUNCH_ARGS, `--user-data-dir=${profileDir}`], {
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, HOME: homeDir, XDG_CONFIG_HOME: xdgDir },
  });
  chromiumPid = chromium.pid;
  out.browserPid = chromiumPid;
  chromium.stderr.on('data', (d) => stderrChunks.push(d));

  let cdpPort = null;
  for (let i = 0; i < 250 && !cdpPort; i++) {
    const f = join(profileDir, 'DevToolsActivePort');
    if (existsSync(f)) cdpPort = Number(readFileSync(f, 'utf8').split('\n')[0]);
    else await sleep(100);
  }
  if (!cdpPort) {
    throw new Error('DevToolsActivePort never appeared: ' +
      Buffer.concat(stderrChunks).toString('utf8').slice(-1200));
  }
  out.cdpPort = cdpPort;
  out.loopback = {
    host: '127.0.0.1',
    cdpPort,
    externalRequestCount: null, // filled from Network events
  };

  // Observed argv + real executable (the Arch /usr/bin/chromium is a launcher).
  try {
    out.observedCmdline = readFileSync(`/proc/${chromiumPid}/cmdline`, 'utf8')
      .split('\0').filter(Boolean);
    const realExe = readlinkSync(`/proc/${chromiumPid}/exe`);
    out.runtime.realExecutable = realExe;
    out.runtime.realExecutableSha256 = sha256(readFileSync(realExe));
  } catch (e) {
    out.probeErrors.push({ where: 'proc-identity', error: String(e) });
  }

  const version = await fetchJson(cdpPort, '/json/version');
  out.runtime.chromiumVersionBanner = version.Browser;
  out.runtime.product = version.Browser;
  out.runtime.protocolVersion = version['Protocol-Version'];

  // --- protocol declaration (what a predicate may legitimately expect) ---
  const protocol = await fetchJson(cdpPort, '/json/protocol');
  const domain = protocol.domains.find((d) => d.domain === 'WebMCP');
  const invokedStatus = domain?.types?.find((t) => t.id === 'InvocationStatus');
  const responded = domain?.events?.find((e) => e.name === 'toolResponded');
  out.protocol = {
    webmcpDomainPresent: !!domain,
    invocationStatusEnum: invokedStatus?.enum || null,
    invokeTool: domain?.commands?.find((c) => c.name === 'invokeTool') || null,
    toolRespondedParams: (responded?.parameters || []).map((p) => ({
      name: p.name, optional: !!p.optional, type: p.type || p.$ref || null,
    })),
  };
  if (!domain) throw new Error('WebMCP domain absent from protocol');

  // --- page target + raw CDP ---
  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    const list = await fetchJson(cdpPort, '/json/list');
    target = list.find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('no page target');
  out.target = { type: target.type, urlBeforeNavigate: target.url };

  ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const evLog = [];
  const t0 = Date.now();
  let msgId = 0;
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) evLog.push({ at: Date.now() - t0, method: m.method, params: m.params });
  });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  const sent = [];
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++msgId;
    sent.push({ id, method, params });
    pending.set(id, (m) => (m.error
      ? rej(Object.assign(new Error(`${method}: ${JSON.stringify(m.error)}`), { protocolError: m.error }))
      : res(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  const waitFor = async (fn, ms, step = 50) => {
    const until = Date.now() + ms;
    while (Date.now() < until) { const v = fn(); if (v) return v; await sleep(step); }
    return null;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  out.webmcpEnableResult = await send('WebMCP.enable');

  const nav = await send('Page.navigate', { url: fixtureUrl });
  const frameId = nav.frameId;
  out.frameId = frameId;

  const ready = await waitFor(() => evLog.some((e) => e.method === 'WebMCP.toolsAdded'), 15000);
  if (!ready) throw new Error('no WebMCP.toolsAdded after navigate');
  const pageReady = await send('Runtime.evaluate', {
    expression: 'window.__ready === true', returnByValue: true,
  });
  out.pageReady = pageReady.result.value;

  const registration = await send('Runtime.evaluate', {
    expression: 'window.__reg', returnByValue: true,
  });
  out.registration = registration.result.value;

  const addedNames = [];
  for (const e of evLog) {
    if (e.method === 'WebMCP.toolsAdded') {
      for (const tool of e.params.tools || []) addedNames.push(tool.name);
    }
  }
  out.toolsAddedNames = addedNames;
  out.toolsAddedRaw = evLog.filter((e) => e.method === 'WebMCP.toolsAdded');

  // --- invoke each case, record raw command/response/events ---
  const CASES = [
    'ctl-string',
    'sync-throw',
    'async-reject',
    'reject-string',
    'returns-object',
    'returns-number',
    'returns-null',
    'returns-undefined',
  ];
  const invokeOnce = async (toolName) => {
    const rec = {
      toolName,
      input: { q: toolName },
      invokedAt: Date.now() - t0,
      commandResult: null,
      commandError: null,
      commandAckAt: null,
      toolInvoked: null,
      toolResponded: null,
      respondedAfterCommandMs: null,
      respondedBeforeCommandAck: null,
      timedOut: false,
      pageCall: null,
      runtimeEventsInWindow: [],
    };
    const evStart = evLog.length;
    try {
      rec.commandResult = await send('WebMCP.invokeTool', {
        frameId, toolName, input: { q: toolName },
      });
    } catch (e) {
      rec.commandError = e.protocolError || { message: String(e) };
    }
    rec.commandAckAt = Date.now() - t0;
    const invocationId = rec.commandResult && rec.commandResult.invocationId;
    if (invocationId) {
      rec.toolInvoked = await waitFor(
        () => evLog.find((e) => e.method === 'WebMCP.toolInvoked' &&
          e.params.invocationId === invocationId), 3000);
      rec.toolResponded = await waitFor(
        () => evLog.find((e) => e.method === 'WebMCP.toolResponded' &&
          e.params.invocationId === invocationId), 6000);
      if (rec.toolResponded) {
        rec.respondedAfterCommandMs = rec.toolResponded.at - rec.commandAckAt;
        rec.respondedBeforeCommandAck = rec.toolResponded.at < rec.commandAckAt;
      }
      rec.timedOut = !rec.toolResponded;
    }
    rec.runtimeEventsInWindow = evLog.slice(evStart)
      .filter((e) => e.method === 'Runtime.exceptionThrown' || e.method === 'Runtime.consoleAPICalled')
      .map((e) => ({ method: e.method, params: e.params }));
    try {
      const call = await send('Runtime.evaluate', {
        expression: `window.__calls[${JSON.stringify(toolName)}] || null`,
        returnByValue: true,
      });
      rec.pageCall = call.result.value;
    } catch (e) {
      rec.pageCall = { error: String(e) };
    }
    // trimmed projection used by the report / predicates
    rec.observed = {
      invocationId: invocationId || null,
      commandErrorCode: rec.commandError ? rec.commandError.code : null,
      commandErrorMessage: rec.commandError ? rec.commandError.message : null,
      status: rec.toolResponded ? rec.toolResponded.params.status : null,
      output: rec.toolResponded && 'output' in rec.toolResponded.params
        ? rec.toolResponded.params.output : undefined,
      outputPresent: rec.toolResponded ? 'output' in rec.toolResponded.params : false,
      outputType: rec.toolResponded && 'output' in rec.toolResponded.params
        ? typeof rec.toolResponded.params.output : null,
      errorText: rec.toolResponded && 'errorText' in rec.toolResponded.params
        ? rec.toolResponded.params.errorText : undefined,
      errorTextPresent: rec.toolResponded ? 'errorText' in rec.toolResponded.params : false,
      exception: rec.toolResponded && rec.toolResponded.params.exception
        ? rec.toolResponded.params.exception : null,
      toolInvokedInput: rec.toolInvoked ? rec.toolInvoked.params.input : null,
      toolInvokedInputType: rec.toolInvoked ? typeof rec.toolInvoked.params.input : null,
      pageExecuteCalled: !!rec.pageCall,
      pageReceivedType: rec.pageCall ? rec.pageCall.receivedType : null,
      pageReceivedJson: rec.pageCall ? rec.pageCall.receivedJson : null,
    };
    return rec;
  };

  for (const toolName of CASES) out.cases[toolName] = await invokeOnce(toolName);

  // Control: does invokeTool itself error for a name that was never registered?
  out.cases['unknown-tool'] = await (async () => {
    const evStart = evLog.length;
    let commandResult = null, commandError = null;
    try {
      commandResult = await send('WebMCP.invokeTool', {
        frameId, toolName: 'no-such-tool-r17', input: {},
      });
    } catch (e) {
      commandError = e.protocolError || { message: String(e) };
    }
    let toolResponded = null;
    if (commandResult && commandResult.invocationId) {
      toolResponded = await waitFor(
        () => evLog.find((e) => e.method === 'WebMCP.toolResponded' &&
          e.params.invocationId === commandResult.invocationId), 3000);
    }
    return {
      toolName: 'no-such-tool-r17',
      commandResult, commandError, toolResponded,
      events: evLog.slice(evStart).filter((e) => e.method.startsWith('WebMCP.')),
      observed: {
        commandErrorCode: commandError ? commandError.code : null,
        commandErrorMessage: commandError ? commandError.message : null,
        status: toolResponded ? toolResponded.params.status : null,
        errorText: toolResponded ? toolResponded.params.errorText : undefined,
        errorTextPresent: toolResponded ? 'errorText' in toolResponded.params : false,
      },
    };
  })();

  // --- loopback accounting from the raw Network stream ---
  const ext = evLog.filter((e) => e.method === 'Network.requestWillBeSent').map((e) => e.params.request.url)
    .filter((u) => /^https?:/i.test(u) && !/^https?:\/\/127\.0\.0\.1[:/]/i.test(u));
  out.loopback.externalRequests = ext;
  out.loopback.externalRequestCount = ext.length;

  // --- summary verdict: fixed before the run (see report) ---
  out.verdict = {
    everyCaseAnswered:
      CASES.every((n) => out.cases[n].toolResponded) &&
      !!out.cases['unknown-tool'].toolResponded,
    invokeToolNeverErrored: CASES.every((n) => out.cases[n].commandError === null),
    statuses: Object.fromEntries(CASES.map((n) => [n, out.cases[n].observed.status])),
    outputTypes: Object.fromEntries(CASES.map((n) => [n, out.cases[n].observed.outputType])),
  };

  // raw protocol traffic, verbatim
  out.cdp = { commandsSent: sent, eventCount: evLog.length, events: evLog };

  // --- teardown: kill, then prove the pid is gone ---
  out.teardown = { signal: 'SIGKILL', browserPid: chromiumPid };
  try { ws && ws.close(); } catch { /* ignore */ }
  const exitP = new Promise((r) => chromium.once('exit', (code, sig) => r({ code, sig })));
  try { chromium.kill('SIGKILL'); } catch (e) { out.teardown.killError = String(e); }
  const exitInfo = await Promise.race([exitP, sleep(8000).then(() => null)]);
  out.teardown.exit = exitInfo;
  await sleep(300);
  let pidGone = false;
  try { process.kill(chromiumPid, 0); } catch (e) { pidGone = e.code === 'ESRCH'; }
  out.teardown.pidGoneByKillZero = pidGone;
  out.teardown.procEntryAbsent = !existsSync(`/proc/${chromiumPid}`);
  out.teardown.survivingPidsWithProfile = survivingPids(profileDir);
  out.teardown.gone = pidGone && out.teardown.procEntryAbsent &&
    out.teardown.survivingPidsWithProfile.length === 0;
} catch (e) {
  out.crash = { message: String(e), stack: e && e.stack ? String(e.stack) : null };
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch { /* ignore */ }
  try { chromium && chromium.kill('SIGKILL'); } catch { /* ignore */ }
  try { server && server.close(); } catch { /* ignore */ }
  try { if (profileDir) rmSync(profileDir, { recursive: true, force: true }); } catch { /* ignore */ }
  try { if (homeDir) rmSync(homeDir, { recursive: true, force: true }); } catch { /* ignore */ }
  try { if (xdgDir) rmSync(xdgDir, { recursive: true, force: true }); } catch { /* ignore */ }
}

writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
const v = out.verdict || {};
console.log('R17_INVOKE_ERRORPATHS ' + JSON.stringify({
  out: OUT,
  statuses: v.statuses || null,
  outputTypes: v.outputTypes || null,
  invokeToolNeverErrored: v.invokeToolNeverErrored ?? null,
  browserGone: out.teardown ? out.teardown.gone : null,
  crash: out.crash ? out.crash.message : null,
}));
process.exit(process.exitCode || 0);
