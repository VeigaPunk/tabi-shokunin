// WebmcpProbeImperative — tabi round 16, C2 probe (leaf seat).
// With the PLAN WebMCP flags on a loopback page, enumerate document.modelContext,
// exercise whatever imperative methods exist (registerTool/getTools/executeTool
// style plus removal paths), record return values and thrown error
// names/messages for invalid inputs, and correlate WebMCP.toolsAdded /
// toolsRemoved CDP events. Writes sibling .json. Loopback only; temp profile;
// never a real site, never the user's browser profile.
//
// Run: node .ufo/waves/round-16/probes/WebmcpProbeImperative.mjs
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'WebmcpProbeImperative.json');
const CHROMIUM = process.env.WEBMCP_CHROMIUM || '/usr/bin/chromium';
const FLAGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

const result = {
  schema: 'tabi-round16-webmcp-probe-imperative-v1',
  probe: 'WebmcpProbeImperative',
  round: 16,
  generatedAt: new Date().toISOString(),
  runtime: {},
  flags: FLAGS,
  page: {},
  modelContext: {},
  calls: [],
  events: [],
  notes: [],
};

function sha256File(path) {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

function candidateRequirePaths() {
  const dirs = [];
  const execDir = dirname(process.execPath);
  dirs.push(resolve(execDir, '..', 'lib', 'node_modules'));
  dirs.push('/usr/lib/node_modules', '/usr/local/lib/node_modules');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) dirs.push(entry);
  }
  try {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    if (root) dirs.push(root);
  } catch { /* npm resolution is best-effort */ }
  return [...new Set(dirs)];
}

function loadPlaywright() {
  const errors = [];
  for (const dir of candidateRequirePaths()) {
    const entry = join(dir, 'playwright');
    if (!existsSync(join(entry, 'package.json'))) continue;
    try {
      const req = createRequire(join(entry, 'package.json'));
      const pw = req('playwright');
      let version = null;
      try {
        version = JSON.parse(readFileSync(join(entry, 'package.json'), 'utf8')).version;
      } catch { /* version optional */ }
      return { pw, version, dir: entry };
    } catch (err) {
      errors.push(`${entry}: ${err && err.message}`);
    }
  }
  result.notes.push({ playwrightLoadErrors: errors });
  return null;
}

const loaded = loadPlaywright();
if (!loaded) {
  result.fatal = 'playwright_not_loadable';
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.error('WEBMCP_PROBE_FATAL playwright_not_loadable');
  process.exit(2);
}
const { chromium } = loaded.pw;
result.runtime.playwright = loaded.version;
result.runtime.playwrightDir = loaded.dir;
result.runtime.node = process.version;
result.runtime.chromiumExecutable = CHROMIUM;
result.runtime.chromiumSha256 = sha256File(CHROMIUM);
try {
  result.runtime.chromiumVersion = execFileSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).trim();
} catch (err) {
  result.runtime.chromiumVersion = null;
  result.notes.push({ chromiumVersionError: String(err && err.message) });
}

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>webmcp imperative probe</title></head><body><h1>probe</h1></body></html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(HTML);
});
await new Promise((res) => server.listen(0, '127.0.0.1', res));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/`;
result.page.url = url;

const events = [];
let browser;
try {
  browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: FLAGS,
  });
} catch (err) {
  result.fatal = 'chromium_launch_failed';
  result.notes.push({ launchError: String(err && err.message) });
  server.close();
  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.error('WEBMCP_PROBE_FATAL chromium_launch_failed');
  process.exit(2);
}

const context = await browser.newContext();
await context.route('**/*', (route) => {
  const u = route.request().url();
  if (u.startsWith('http://127.0.0.1:') || u.startsWith('http://localhost:')) return route.continue();
  return route.abort();
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
for (const evt of ['WebMCP.toolsAdded', 'WebMCP.toolsRemoved', 'Audits.issueAdded']) {
  cdp.on(evt, (params) => {
    events.push({ t: Date.now(), event: evt, params });
  });
}
let webmcpEnable = null;
try {
  webmcpEnable = await cdp.send('WebMCP.enable');
} catch (err) {
  webmcpEnable = { error: String(err && err.message) };
}
try {
  await cdp.send('Audits.enable');
} catch (err) {
  result.notes.push({ auditsEnableError: String(err && err.message) });
}
result.page.webmcpEnableResult = webmcpEnable;

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(300);

// ---- enumerate document.modelContext ----
result.modelContext = await page.evaluate(() => {
  const out = { navigatorModelContext: null, documentHasOwn: null, chain: [], methods: {}, shape: null };
  try {
    out.navigatorModelContext = 'modelContext' in navigator ? typeof navigator.modelContext : false;
  } catch (err) {
    out.navigatorModelContext = 'probe_error:' + err.name;
  }
  const mc = document.modelContext;
  out.documentHasOwn = Object.prototype.hasOwnProperty.call(document, 'modelContext');
  out.typeof = typeof mc;
  if (mc == null) {
    out.shape = mc === null ? 'null' : 'undefined';
    return out;
  }
  out.constructorName = mc.constructor && mc.constructor.name;
  out.ownKeys = Object.getOwnPropertyNames(mc);
  out.specNameAbsence = {};
  for (const n of ['provideContext', 'unregisterTool', 'clearContext', 'unregisterAllTools', 'removeTool']) {
    out.specNameAbsence[n] = typeof mc[n];
  }
  let proto = Object.getPrototypeOf(mc);
  let depth = 0;
  while (proto && depth < 8) {
    const level = { name: proto.constructor && proto.constructor.name, props: [] };
    for (const name of Object.getOwnPropertyNames(proto)) {
      const d = Object.getOwnPropertyDescriptor(proto, name);
      level.props.push({
        name,
        kind: d && typeof d.value === 'function' ? 'function' : (d && 'value' in d ? 'value' : 'accessor'),
        enumerable: d ? d.enumerable : null,
        writable: d ? d.writable : null,
        arity: d && typeof d.value === 'function' ? d.value.length : null,
        hasGetter: !!(d && d.get),
        hasSetter: !!(d && d.set),
      });
      if (d && typeof d.value === 'function' && name !== 'constructor') {
        out.methods[name] = { arity: d.value.length, protoLevel: level.name };
      }
    }
    for (const sym of Object.getOwnPropertySymbols(proto)) {
      level.props.push({ name: String(sym), kind: 'symbol' });
    }
    out.chain.push(level);
    proto = Object.getPrototypeOf(proto);
    depth += 1;
  }
  return out;
});

// ---- helper to run one call from Node and capture everything ----
async function runCall(label, source, settleMs = 350) {
  const before = events.length;
  let callResult;
  try {
    callResult = await page.evaluate(`(async () => { ${source} })()`);
  } catch (err) {
    callResult = { threwAtEvaluate: true, errorName: err && err.name, errorMessage: String(err && err.message) };
  }
  await page.waitForTimeout(settleMs);
  const newEvents = events.slice(before);
  const rec = { label, result: callResult, eventsAfter: newEvents.map((e) => e.event) };
  result.calls.push(rec);
  return rec;
}

const VALID_TOOL = `{
  name: 'probe_echo',
  description: 'Echo the supplied text',
  inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  execute: async (args) => ({ content: [{ type: 'text', text: String(args && args.text) }] })
}`;

// Wrap a single expression producing maybe-promise and serialize outcome.
const wrap = (expr) => `
  try {
    const raw = (() => (${expr}))();
    const rawIsPromise = raw instanceof Promise;
    const rawType = typeof raw;
    const v = await raw;
    let ser;
    try { ser = v === undefined ? { undefined: true } : JSON.parse(JSON.stringify(v)); }
    catch (e) { ser = { unserializable: Object.prototype.toString.call(v), keys: v && typeof v === 'object' ? Object.keys(v) : null }; }
    return { returned: true, rawIsPromise, rawType,
      isPromise: rawIsPromise, value: ser, valueType: typeof v };
  } catch (err) {
    return { threw: true, errorName: err && err.name, errorMessage: String(err && err.message), isDOMException: err instanceof DOMException, code: err && err.code };
  }`;

// A valid baseline registration (also seeds unregister/executeTool tests).
await runCall('registerTool_valid', wrap(`document.modelContext.registerTool(${VALID_TOOL})`));

// Invalid inputs.
await runCall('registerTool_missing_name', wrap(`document.modelContext.registerTool({
  description: 'No name', inputSchema: { type: 'object' }, execute: async () => ({})
})`));
await runCall('registerTool_duplicate_name', wrap(`document.modelContext.registerTool(${VALID_TOOL})`));
await runCall('registerTool_bad_schema_string', wrap(`document.modelContext.registerTool({
  name: 'bad_schema_str', description: 'x', inputSchema: 'not-an-object', execute: async () => ({})
})`));
await runCall('registerTool_bad_schema_type', wrap(`document.modelContext.registerTool({
  name: 'bad_schema_type', description: 'x', inputSchema: { type: 'bogus' }, execute: async () => ({})
})`));
await runCall('registerTool_missing_execute', wrap(`document.modelContext.registerTool({
  name: 'no_execute', description: 'x', inputSchema: { type: 'object' }
})`));
await runCall('registerTool_missing_description', wrap(`document.modelContext.registerTool({
  name: 'no_desc', inputSchema: { type: 'object' }, execute: async () => ({})
})`));
await runCall('registerTool_no_args', wrap(`document.modelContext.registerTool()`));
await runCall('registerTool_string_arg', wrap(`document.modelContext.registerTool('just-a-string')`));
await runCall('registerTool_annotations_extra', wrap(`document.modelContext.registerTool({
  name: 'probe_extra', description: 'extra fields', inputSchema: { type: 'object' },
  execute: async () => ({}), annotations: { readOnlyHint: true }
})`));
await runCall('registerTool_null_schema', wrap(`document.modelContext.registerTool({
  name: 'null_schema', description: 'x', inputSchema: null, execute: async () => ({})
})`));

// getTools serialization of the three registered tools.
await runCall('getTools_entries', `
  const raw = document.modelContext.getTools();
  const rawInfo = { isPromise: raw instanceof Promise, typeof: typeof raw,
    constructorName: raw && raw.constructor && raw.constructor.name,
    toStringTag: Object.prototype.toString.call(raw) };
  const tools = await raw;
  const list = Array.isArray(tools) ? tools : [tools];
  return { rawInfo, resolvedIsArray: Array.isArray(tools), length: tools && tools.length,
    entries: list.map((t) => ({
      constructorName: t && t.constructor && t.constructor.name,
      protoName: t && Object.getPrototypeOf(t) && Object.getPrototypeOf(t).constructor
        && Object.getPrototypeOf(t).constructor.name,
      ownKeys: t ? Object.getOwnPropertyNames(t) : null,
      protoKeys: t ? Object.getOwnPropertyNames(Object.getPrototypeOf(t)) : null,
      name: t && t.name, description: t && t.description,
      inputSchema: t && t.inputSchema, origin: t && t.origin, title: t && t.title,
      windowType: t && typeof t.window,
      executeType: t && typeof t.execute,
    })) };`);

// toolchange event surface: addEventListener + ontoolchange, then register.
await runCall('toolchange_registration', `
  window.__tcEvents = [];
  const ser = (e) => {
    const proto = e && Object.getPrototypeOf(e);
    const rec = {
      type: e && e.type,
      constructorName: e && e.constructor && e.constructor.name,
      protoName: proto && proto.constructor && proto.constructor.name,
      isTrusted: e && e.isTrusted,
      ownKeys: e ? Object.getOwnPropertyNames(e) : [],
      protoKeys: proto ? Object.getOwnPropertyNames(proto) : [],
    };
    for (const k of rec.protoKeys) {
      if (k === 'constructor') continue;
      try { rec['p_' + k] = JSON.parse(JSON.stringify(e[k])); } catch (err) { rec['p_' + k] = 'unserializable:' + typeof e[k]; }
    }
    return rec;
  };
  document.modelContext.addEventListener('toolchange', (e) => window.__tcEvents.push({ via: 'addEventListener', ...ser(e) }));
  document.modelContext.ontoolchange = (e) => window.__tcEvents.push({ via: 'ontoolchange', ...ser(e) });
  document.modelContext.registerTool({
    name: 'probe_tc', description: 'toolchange probe', inputSchema: { type: 'object' },
    execute: async () => ({})
  });
  return { captured: window.__tcEvents, ontoolchangeDescriptor: Object.getOwnPropertyDescriptor(Object.getPrototypeOf(document.modelContext), 'ontoolchange') ? 'accessor-on-proto' : 'none' };`);

await runCall('executeTool_string_name', wrap(`document.modelContext.executeTool('probe_echo', { text: 'hi-object' })`));
await runCall('executeTool_one_arg', wrap(`document.modelContext.executeTool('probe_echo')`));
await runCall('executeTool_no_args', wrap(`document.modelContext.executeTool()`));
await runCall('executeTool_registered_tool_object', `
  const tools = await document.modelContext.getTools();
  const names = (tools || []).map((t) => t && t.name);
  const echo = (tools || []).find((t) => t && t.name === 'probe_echo');
  if (!echo) return { noTool: true, names };
  try {
    const v = await document.modelContext.executeTool(echo, { text: 'via-RegisteredTool' });
    let ser;
    try { ser = JSON.parse(JSON.stringify(v)); } catch (e) { ser = { unserializable: Object.prototype.toString.call(v) }; }
    return { returned: true, names, value: ser, valueType: typeof v };
  } catch (err) {
    return { threw: true, names, errorName: err.name, errorMessage: String(err.message), isDOMException: err instanceof DOMException, code: err.code };
  }`);
await runCall('executeTool_registered_tool_wrong_input', `
  const tools = await document.modelContext.getTools();
  const echo = (tools || []).find((t) => t && t.name === 'probe_echo');
  if (!echo) return { noTool: true };
  try {
    const v = await document.modelContext.executeTool(echo, { wrong: 1 });
    return { returned: true, value: String(JSON.stringify(v)) };
  } catch (err) {
    return { threw: true, errorName: err.name, errorMessage: String(err.message), isDOMException: err instanceof DOMException };
  }`);
await runCall('executeTool_registered_tool_string_input', `
  const tools = await document.modelContext.getTools();
  const echo = (tools || []).find((t) => t && t.name === 'probe_echo');
  if (!echo) return { noTool: true };
  try {
    const v = await document.modelContext.executeTool(echo, JSON.stringify({ text: 'via-json-string' }));
    let ser;
    try { ser = JSON.parse(JSON.stringify(v)); } catch (e) { ser = { unserializable: Object.prototype.toString.call(v), keys: v && typeof v === 'object' ? Object.keys(v) : null }; }
    return { returned: true, value: ser, valueType: typeof v };
  } catch (err) {
    return { threw: true, errorName: err.name, errorMessage: String(err.message), isDOMException: err instanceof DOMException, code: err.code };
  }`);
await runCall('executeTool_registered_tool_empty_string_input', `
  const tools = await document.modelContext.getTools();
  const echo = (tools || []).find((t) => t && t.name === 'probe_echo');
  if (!echo) return { noTool: true };
  try {
    const v = await document.modelContext.executeTool(echo, '{}');
    let ser;
    try { ser = JSON.parse(JSON.stringify(v)); } catch (e) { ser = { unserializable: Object.prototype.toString.call(v) }; }
    return { returned: true, value: ser };
  } catch (err) {
    return { threw: true, errorName: err.name, errorMessage: String(err.message), isDOMException: err instanceof DOMException };
  }`);
await runCall('executeTool_registered_tool_bad_json_string', `
  const tools = await document.modelContext.getTools();
  const echo = (tools || []).find((t) => t && t.name === 'probe_echo');
  if (!echo) return { noTool: true };
  try {
    const v = await document.modelContext.executeTool(echo, 'not json at all');
    return { returned: true, value: String(JSON.stringify(v)) };
  } catch (err) {
    return { threw: true, errorName: err.name, errorMessage: String(err.message), isDOMException: err instanceof DOMException };
  }`);

// Removal paths: signal inside the tool dict, signal as a second options arg,
// then abort and watch for WebMCP.toolsRemoved.
await runCall('registerTool_signal_in_dict', `
  window.__acDict = new AbortController();
  try {
    const v = document.modelContext.registerTool({
      name: 'probe_signal_dict', description: 'x', inputSchema: { type: 'object' },
      execute: async () => ({}), signal: window.__acDict.signal
    });
    return { returned: true, rawIsPromise: v instanceof Promise, value: v === undefined ? { undefined: true } : v };
  } catch (err) { return { threw: true, errorName: err.name, errorMessage: String(err.message) }; }`);
await runCall('abort_signal_dict', wrap(`window.__acDict.abort()`));
await runCall('getTools_after_dict_abort', `const t = await document.modelContext.getTools(); return { names: (t || []).map((x) => x && x.name) };`);

await runCall('registerTool_signal_second_arg', `
  window.__acOpt = new AbortController();
  try {
    const v = document.modelContext.registerTool({
      name: 'probe_signal_opt', description: 'x', inputSchema: { type: 'object' },
      execute: async () => ({})
    }, { signal: window.__acOpt.signal });
    return { returned: true, rawIsPromise: v instanceof Promise, value: v === undefined ? { undefined: true } : v };
  } catch (err) { return { threw: true, errorName: err.name, errorMessage: String(err.message) }; }`);
await runCall('abort_signal_opt', wrap(`window.__acOpt.abort()`));
await runCall('getTools_after_opt_abort', `const t = await document.modelContext.getTools(); return { names: (t || []).map((x) => x && x.name) };`);

// Spec-style absent members (recorded for the note even though undefined).
await runCall('unregisterTool_absent', wrap(`document.modelContext.unregisterTool('probe_echo')`));
await runCall('provideContext_absent', wrap(`document.modelContext.provideContext({ context: 'x' })`));
await runCall('clearContext_absent', wrap(`document.modelContext.clearContext()`));

// Discovered-only members not yet exercised beyond registration: when() from
// the new EventTarget API surface.
await runCall('when_toolchange', wrap(`document.modelContext.when('toolchange')`));

// Re-check the surface after mutations.
result.modelContext.postCallOwnKeys = await page.evaluate(() =>
  document.modelContext ? Object.getOwnPropertyNames(document.modelContext) : null);
result.modelContext.finalToolNames = await page.evaluate(async () => {
  if (!document.modelContext) return null;
  const t = await document.modelContext.getTools();
  return (t || []).map((x) => x && x.name);
});
result.modelContext.tcEventsLate = await page.evaluate(() => window.__tcEvents || null);

await page.waitForTimeout(300);
result.events = events;
result.summary = {
  calls: result.calls.length,
  events: events.length,
  toolsAdded: events.filter((e) => e.event === 'WebMCP.toolsAdded').length,
  toolsRemoved: events.filter((e) => e.event === 'WebMCP.toolsRemoved').length,
};

await browser.close();
server.close();
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
console.log('WEBMCP_PROBE_IMPERATIVE ' + JSON.stringify(result.summary));
