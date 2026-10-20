#!/usr/bin/env node
// probes/WebmcpProbeInvoke.mjs — round-16 wave-1 falsifier probe.
//
// Question: does Chromium 154's WebMCP CDP domain expose a tool-invocation
// command, and/or can a testing API (document.modelContextTesting /
// navigator.modelContextTesting / WebMCPTesting) execute a tool? If yes,
// invoke ONLY the loopback fixture's own read-only "echo" tool and record
// the request/response events (toolInvoked / toolResponded) and result
// shape. Nothing with side effects beyond the loopback page is invoked.
//
// Usage: node WebmcpProbeInvoke.mjs [--out <json>] [--chromium <path>]
// Output default: WebmcpProbeInvoke.json next to this file. Never a shell.
// Loopback only: embedded fixture served on 127.0.0.1:0; fresh temp profile.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const OUT = opt('out', join(HERE, 'WebmcpProbeInvoke.json'));
const CHROMIUM = opt('chromium', process.env.CHROMIUM_PATH || '/usr/bin/chromium');
const FLAGS = [
  '--headless', '--remote-debugging-port=0',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const WEBMCP_FLAG_TOKEN = 'WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The only tool this probe ever invokes: a read-only echo with no side
// effects (pure string transform inside the loopback page).
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>webmcp-invoke-fixture</title></head><body><script>
window.__register = (async () => {
  const mc = document.modelContext;
  if (!mc) return { ok: false, reason: 'no-document.modelContext' };
  try {
    await mc.registerTool({
      name: 'echo',
      description: 'Echo the provided text back to the caller (read-only, no side effects).',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
      execute: async (input) => 'echo:' + (input && input.text),
    });
    return { ok: true };
  } catch (e) { return { ok: false, reason: String(e) }; }
})();
</script></body></html>`;

const out = {
  schema: 'tabi-round16-webmcp-probe-invoke-v1',
  seat: 'WebmcpProbeInvoke',
  capturedAt: new Date().toISOString(),
  question: 'Is there a CDP command or testing API able to invoke a registered WebMCP tool? Invoke only the loopback echo tool and record request/response events and result shape.',
  scope: 'loopback 127.0.0.1 only; temp profile; only the fixture\'s own read-only "echo" tool invoked',
};

let chromium = null, server = null, ws = null;
const cleanup = () => {
  try { ws && ws.close(); } catch {}
  try { chromium && chromium.kill('SIGKILL'); } catch {}
  try { server && server.close(); } catch {}
};

try {
  if (!existsSync(CHROMIUM)) throw new Error(`chromium not found at ${CHROMIUM}`);
  out.runtime = {
    node: process.version,
    chromiumExecutable: CHROMIUM,
    chromiumExecutableSha256: sha256(readFileSync(CHROMIUM)),
  };
  try {
    out.producerSha256 = sha256(readFileSync(fileURLToPath(import.meta.url)));
  } catch { out.producerSha256 = null; }

  // Serve the loopback fixture.
  server = createServer((req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(FIXTURE_HTML);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  const fixtureUrl = `http://127.0.0.1:${httpPort}/`;
  out.fixtureUrl = fixtureUrl;

  // Launch flagged Chromium on a fresh temp profile.
  const profile = mkdtempSync(join(tmpdir(), 'webmcp-invoke-prof-'));
  const stderrChunks = [];
  chromium = spawn(CHROMIUM, [...FLAGS, `--user-data-dir=${profile}`],
    { stdio: ['ignore', 'ignore', 'pipe'] });
  chromium.stderr.on('data', (d) => stderrChunks.push(d));

  let cdpPort = null;
  for (let i = 0; i < 200 && !cdpPort; i++) {
    const f = join(profile, 'DevToolsActivePort');
    if (existsSync(f)) cdpPort = Number(readFileSync(f, 'utf8').split('\n')[0]);
    else await sleep(100);
  }
  if (!cdpPort) throw new Error('DevToolsActivePort never appeared: ' +
    Buffer.concat(stderrChunks).toString('utf8').slice(-800));
  out.cdpPort = cdpPort;

  const fetchJson = async (path) =>
    (await fetch(`http://127.0.0.1:${cdpPort}${path}`)).json();

  const version = await fetchJson('/json/version');
  out.runtime.browser = version.Browser;
  out.runtime.webSocketDebuggerUrl = 'present';

  // --- 1. Enumerate the browser's own protocol for invocation commands ---
  const protocol = await fetchJson('/json/protocol');
  const webmcpDomain = protocol.domains.find((d) => d.domain === 'WebMCP');
  out.protocolDomain = webmcpDomain || null;
  out.invocationCandidates = [];
  for (const d of protocol.domains) {
    for (const c of d.commands || []) {
      if (/invoke|execute|call.*tool|tool.*call|run.*tool/i.test(c.name) &&
          /webmcp|mcp|tool|modelcontext/i.test(d.domain + ' ' + c.name)) {
        out.invocationCandidates.push(`${d.domain}.${c.name}`);
      }
    }
  }
  out.webmcpCommands = (webmcpDomain?.commands || []).map((c) => c.name);
  out.webmcpEvents = (webmcpDomain?.events || []).map((e) => e.name);
  out.invocationPath = {
    cdpInvokeTool: (webmcpDomain?.commands || []).some((c) => c.name === 'invokeTool'),
    cdpCancelInvocation: (webmcpDomain?.commands || []).some((c) => c.name === 'cancelInvocation'),
    testingApiInPage: null, // filled below
    inPageExecuteTool: null, // filled below
  };

  // --- 2. Attach page CDP session, enable, navigate to fixture ---
  let target = null;
  for (let i = 0; i < 50 && !target; i++) {
    const list = await fetchJson('/json/list');
    target = list.find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('no page target');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const events = [];
  let msgId = 0;
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) events.push({ method: m.method, params: m.params });
  });
  await new Promise((r, rej) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', rej);
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, (m) => (m.error
      ? rej(Object.assign(new Error(`${method}: ${JSON.stringify(m.error)}`), { protocolError: m.error }))
      : res(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  const webmcpEvents = () => events.filter((e) => e.method.startsWith('WebMCP.'));

  await send('Page.enable');
  await send('Runtime.enable');
  const en = await send('WebMCP.enable');
  out.webmcpEnableResult = en;

  const nav = await send('Page.navigate', { url: fixtureUrl });
  const frameId = nav.frameId;
  // Wait for the echo tool's toolsAdded (event-driven; do not assume timing).
  let toolsAdded = null;
  for (let i = 0; i < 100 && !toolsAdded; i++) {
    toolsAdded = webmcpEvents().find(
      (e) => e.method === 'WebMCP.toolsAdded' &&
             (e.params.tools || []).some((t) => t.name === 'echo'));
    if (!toolsAdded) await sleep(100);
  }
  const reg = await send('Runtime.evaluate', {
    expression: 'window.__register', awaitPromise: true, returnByValue: true });
  out.registration = reg.result.value;
  out.toolsAddedEcho = toolsAdded ? toolsAdded.params : null;
  out.echoFrameIdMatchesNav = !!toolsAdded &&
    toolsAdded.params.tools.find((t) => t.name === 'echo').frameId === frameId;

  // --- 3. Testing-API surface check (in-page) ---
  const surface = await send('Runtime.evaluate', {
    expression: `(() => {
      const o = {};
      o.document_modelContext = 'modelContext' in document;
      o.navigator_modelContext = 'modelContext' in navigator;
      o.document_modelContextTesting = 'modelContextTesting' in document;
      o.navigator_modelContextTesting = 'modelContextTesting' in navigator;
      o.window_keys = Object.getOwnPropertyNames(window)
        .filter((k) => /modelcontext|webmcp/i.test(k));
      const t = document.modelContextTesting || navigator.modelContextTesting;
      o.testing_object = t ? (t.constructor && t.constructor.name) : null;
      if (t) o.testing_props = Object.getOwnPropertyNames(Object.getPrototypeOf(t));
      const mc = document.modelContext;
      if (mc) o.modelContext_proto = Object.getOwnPropertyNames(Object.getPrototypeOf(mc));
      return o;
    })()`,
    returnByValue: true,
  });
  out.pageSurface = surface.result.value;
  out.invocationPath.testingApiInPage =
    !!(out.pageSurface.document_modelContextTesting || out.pageSurface.navigator_modelContextTesting);
  out.invocationPath.inPageExecuteTool =
    (out.pageSurface.modelContext_proto || []).includes('executeTool');

  // --- 4. Invoke ONLY the fixture's read-only echo tool via CDP ---
  const invokeInput = { text: 'round16-invoke-probe' };
  const invokeResult = await send('WebMCP.invokeTool', {
    frameId, toolName: 'echo', input: invokeInput });
  out.invokeTool = { command: { frameId, toolName: 'echo', input: invokeInput }, result: invokeResult };

  let toolInvoked = null, toolResponded = null;
  for (let i = 0; i < 100 && !toolResponded; i++) {
    toolInvoked = toolInvoked || webmcpEvents().find(
      (e) => e.method === 'WebMCP.toolInvoked' &&
             e.params.invocationId === invokeResult.invocationId);
    toolResponded = webmcpEvents().find(
      (e) => e.method === 'WebMCP.toolResponded' &&
             e.params.invocationId === invokeResult.invocationId);
    if (!toolResponded) await sleep(100);
  }
  out.toolInvokedEvent = toolInvoked ? toolInvoked.params : null;
  out.toolRespondedEvent = toolResponded ? toolResponded.params : null;
  out.echoResultShape = toolResponded ? {
    status: toolResponded.params.status,
    outputType: typeof toolResponded.params.output,
    output: toolResponded.params.output,
    invocationIdMatchesInvokeResult:
      toolResponded.params.invocationId === invokeResult.invocationId,
  } : null;

  // --- 5. Secondary: in-page ModelContext.executeTool on the same echo tool ---
  // IDL (chromium model_context.idl): executeTool(RegisteredTool, DOMString
  // inputArguments) — the descriptor requires name/origin/description/window
  // and the input is a required JSON *string*, not an object. Probe both.
  try {
    const exec = await send('Runtime.evaluate', {
      expression: `(async () => {
        const mc = document.modelContext;
        const desc = { name: 'echo', origin: location.origin,
          description: 'Echo the provided text back to the caller (read-only, no side effects).',
          window: window };
        const out = {};
        try {
          out.jsonStringInput = { ok: true,
            result: await mc.executeTool(desc, JSON.stringify({ text: 'inpage-execute' })) };
        } catch (e) { out.jsonStringInput = { ok: false, err: String(e) }; }
        try {
          out.objectInput = { ok: true,
            result: await mc.executeTool(desc, { text: 'inpage-execute' }) };
        } catch (e) { out.objectInput = { ok: false, err: String(e) }; }
        return out;
      })()`,
      awaitPromise: true, returnByValue: true,
    });
    out.inPageExecuteTool = exec.result.value;
  } catch (e) { out.inPageExecuteTool = { ok: false, err: String(e) }; }

  // --- 6. Error paths (still only the fixture's read-only echo tool) ---
  // 6a. Unknown tool name.
  try {
    const bad = await send('WebMCP.invokeTool', {
      frameId, toolName: 'no-such-tool', input: {} });
    out.unknownToolInvoke = { kind: 'result', result: bad };
  } catch (e) {
    out.unknownToolInvoke = { kind: 'protocol_error', error: e.protocolError || String(e) };
  }

  // 6b. Echo invoked with input violating its own inputSchema (required
  // `text` missing) — read-only; renderer-side validation/status path.
  try {
    const badInput = await send('WebMCP.invokeTool', {
      frameId, toolName: 'echo', input: {} });
    let badResp = null;
    for (let i = 0; i < 100 && !badResp; i++) {
      badResp = webmcpEvents().find(
        (e) => e.method === 'WebMCP.toolResponded' &&
               e.params.invocationId === badInput.invocationId);
      if (!badResp) await sleep(100);
    }
    out.invalidInputInvoke = { result: badInput,
      toolResponded: badResp ? badResp.params : null };
  } catch (e) {
    out.invalidInputInvoke = { kind: 'protocol_error', error: e.protocolError || String(e) };
  }

  // 6c. invokeTool on a session where the domain was never enabled (a second
  // page-session websocket to the same target; WebMCP.enable is per-session).
  // Binary strings suggest a "WebMCP domain is not enabled" error.
  try {
    const ws2 = new WebSocket(target.webSocketDebuggerUrl);
    const pending2 = new Map();
    let id2 = 0;
    ws2.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending2.has(m.id)) { pending2.get(m.id)(m); pending2.delete(m.id); }
    });
    await new Promise((r, rej) => {
      ws2.addEventListener('open', r);
      ws2.addEventListener('error', rej);
    });
    const send2 = (method, params = {}) => new Promise((res, rej) => {
      const mid = ++id2;
      pending2.set(mid, (m) => (m.error
        ? rej(Object.assign(new Error(`${method}: ${JSON.stringify(m.error)}`),
            { protocolError: m.error }))
        : res(m.result)));
      ws2.send(JSON.stringify({ id: mid, method, params }));
    });
    try {
      const r = await send2('WebMCP.invokeTool', {
        frameId, toolName: 'echo', input: { text: 'pre-enable' } });
      out.invokeBeforeEnable = { kind: 'result', result: r };
    } catch (e) {
      out.invokeBeforeEnable = { kind: 'protocol_error', error: e.protocolError || String(e) };
    }
    ws2.close();
  } catch (e) {
    out.invokeBeforeEnable = { kind: 'session_error', error: String(e) };
  }

  out.allWebmcpEvents = webmcpEvents();
  out.verdict = {
    invocationPathExists: out.invocationPath.cdpInvokeTool === true,
    path: 'WebMCP.invokeTool (CDP command; frameId + toolName + input → invocationId)',
    echoInvoked: toolResponded?.params.status === 'Completed',
    echoOutput: toolResponded?.params.output ?? null,
    testingApiPresent: out.invocationPath.testingApiInPage,
  };
} catch (e) {
  out.fatal = String(e.stack || e);
  out.verdict = { invocationPathExists: false, fatal: String(e) };
  process.exitCode = 1;
} finally {
  cleanup();
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`WEBMCP_INVOKE_PROBE verdict=${out.verdict.invocationPathExists ? 'path-exists' : 'none-found'} echo=${out.verdict.echoInvoked === true ? out.verdict.echoOutput : 'n/a'} out=${OUT}`);
process.exit(process.exitCode || 0);
