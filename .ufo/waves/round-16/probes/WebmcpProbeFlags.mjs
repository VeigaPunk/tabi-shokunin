#!/usr/bin/env node
// Round-16 probe seat: WebmcpProbeFlags.
//
// Question: what is the MINIMAL Chromium launch-flag set on this host
// (Chromium 154.0.8037.97, /usr/bin/chromium, Playwright 1.64.0, Node v24)
// for (a) `document.modelContext` to exist on a loopback page and
// (b) the CDP `WebMCP.toolsAdded` event to fire for a declarative
// <form toolname=... tooldescription=...> tool?
//
// Method: for each flag-set case, launch a fresh headless Chromium via
// launchPersistentContext (temp profile dir), attach a CDP session, call
// `WebMCP.enable`, subscribe to `WebMCP.*` events BEFORE navigation, then
// load a loopback http://127.0.0.1:<port> page carrying the declarative
// form. Evaluate the modelContext surface on document and navigator,
// drain events, record. Every non-loopback request is aborted.
//
// Output: .ufo/waves/round-16/probes/WebmcpProbeFlags.json (sibling path).
// Advisory only: code-owning probe seat; L1 re-runs final checks.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const SCRIPT = fileURLToPath(import.meta.url);
const OUT_PATH = resolve(dirname(SCRIPT), 'WebmcpProbeFlags.json');
const CHROMIUM = '/usr/bin/chromium';
const GOTO_TIMEOUT_MS = 15000;
const EVENT_DRAIN_MS = 800;

const PAGE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>webmcp flags probe</title></head>
<body>
<form toolname="search" tooldescription="Search">
  <input name="q" title="Query">
</form>
</body></html>
`;

// ---------- playwright resolution (global npm root; same candidate shape as
// scripts/aria-loopback-round13.mjs candidatePwtDirs) ----------
function candidateGlobalRoots() {
  const dirs = [];
  const execDir = dirname(process.execPath); // .../bin
  dirs.push(resolve(execDir, '..', 'lib', 'node_modules'));
  dirs.push('/usr/lib/node_modules');
  dirs.push('/usr/local/lib/node_modules');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) dirs.push(entry);
  }
  return [...new Set(dirs)];
}

function resolvePlaywright() {
  const requireHere = createRequire(import.meta.url);
  for (const root of candidateGlobalRoots()) {
    const pkgJson = join(root, 'playwright', 'package.json');
    if (!existsSync(pkgJson)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgJson, 'utf8'));
      if (pkg.name !== 'playwright') continue;
      const mod = requireHere(join(root, 'playwright'));
      if (mod && mod.chromium) return { mod, version: pkg.version, root };
    } catch {
      continue;
    }
  }
  return null;
}

// ---------- flag matrix ----------
// Each case: { name, args } where args are extra chromium launch args.
const CASES = [
  { name: 'none', args: [] },
  { name: 'features-WebMCP', args: ['--enable-features=WebMCP'] },
  { name: 'blink-WebMCP', args: ['--enable-blink-features=WebMCP'] },
  { name: 'features-DevToolsWebMCPSupport', args: ['--enable-features=DevToolsWebMCPSupport'] },
  { name: 'features-DeclarativeWebmcp', args: ['--enable-features=DeclarativeWebmcp'] },
  { name: 'experimental-web-platform-features', args: ['--enable-experimental-web-platform-features'] },
  { name: 'features-WebMCP+blink-WebMCP', args: ['--enable-features=WebMCP', '--enable-blink-features=WebMCP'] },
  { name: 'blink-WebMCP+DevToolsWebMCPSupport', args: ['--enable-blink-features=WebMCP', '--enable-features=DevToolsWebMCPSupport'] },
  { name: 'blink-WebMCP+DeclarativeWebmcp', args: ['--enable-blink-features=WebMCP', '--enable-features=DeclarativeWebmcp'] },
  { name: 'blink-WebMCP+DeclarativeWebmcp+DevToolsWebMCPSupport', args: ['--enable-blink-features=WebMCP', '--enable-features=DeclarativeWebmcp,DevToolsWebMCPSupport'] },
  { name: 'full-plan-set', args: ['--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp', '--enable-blink-features=WebMCP,WebMCPTesting'] },
  // Ablation cases added after CriticC2-5 source-scoped predictions:
  // WebMCPTesting implied_by WebMCP; DevToolsWebMCPSupport enabled-by-default gate for CDP events.
  { name: 'blink-WebMCPTesting', args: ['--enable-blink-features=WebMCPTesting'] },
  { name: 'blink-WebMCP+disable-DevToolsWebMCPSupport', args: ['--enable-blink-features=WebMCP', '--disable-features=DevToolsWebMCPSupport'] },
  { name: 'features-WebMCP+disable-blink-WebMCP', args: ['--enable-features=WebMCP', '--disable-blink-features=WebMCP'] },
];

function sha256File(path) {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

async function serveLoopback() {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(PAGE_HTML);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}/` };
}

async function runCase(chromium, caseDef, url) {
  const profile = mkdtempSync(join(tmpdir(), 'webmcp-flags-'));
  const record = {
    name: caseDef.name,
    args: caseDef.args,
    browserVersion: null,
    webMcpEnable: { ok: null, result: null, error: null },
    surface: null,
    events: [],
    error: null,
  };
  let context = null;
  try {
    context = await chromium.launchPersistentContext(profile, {
      executablePath: CHROMIUM,
      headless: true,
      args: caseDef.args,
      timeout: 30000,
    });
    const page = context.pages()[0] ?? (await context.newPage());
    const client = await context.newCDPSession(page);
    try {
      const ver = await client.send('Browser.getVersion');
      record.browserVersion = ver?.product ?? null;
    } catch { /* best effort */ }
    // Abort anything that is not loopback.
    await context.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') route.continue();
      else route.abort();
    });
    client.on('WebMCP.toolsAdded', (params) => record.events.push({ method: 'WebMCP.toolsAdded', params }));
    client.on('WebMCP.toolsRemoved', (params) => record.events.push({ method: 'WebMCP.toolsRemoved', params }));
    client.on('WebMCP.toolsUpdated', (params) => record.events.push({ method: 'WebMCP.toolsUpdated', params }));
    try {
      const res = await client.send('WebMCP.enable');
      record.webMcpEnable = { ok: true, result: res ?? null, error: null };
    } catch (e) {
      record.webMcpEnable = { ok: false, result: null, error: String(e?.message || e) };
    }
    await page.goto(url, { waitUntil: 'load', timeout: GOTO_TIMEOUT_MS });
    // Drain any async event delivery.
    await page.waitForTimeout(EVENT_DRAIN_MS);
    record.surface = await page.evaluate(() => {
      const mc = document.modelContext;
      let protoKeys = null;
      try {
        protoKeys = mc ? Object.getOwnPropertyNames(Object.getPrototypeOf(mc)) : null;
      } catch { /* best effort */ }
      return {
        documentModelContextTypeof: typeof mc,
        modelContextInDocument: 'modelContext' in document,
        modelContextInNavigator: 'modelContext' in navigator,
        navigatorModelContextTypeof: typeof navigator.modelContext,
        modelContextGlobalTypeof: typeof globalThis.ModelContext,
        modelContextToolGlobalTypeof: typeof globalThis.ModelContextTool,
        registerToolTypeof: typeof mc?.registerTool,
        unregisterToolTypeof: typeof mc?.unregisterTool,
        provideContextTypeof: typeof mc?.provideContext,
        protoKeys,
        formToolnameAttrPresent: document.querySelector('form')?.getAttribute('toolname') ?? null,
      };
    });
    await context.close();
    context = null;
  } catch (e) {
    record.error = String(e?.message || e);
  } finally {
    try { if (context) await context.close(); } catch { /* best effort */ }
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  return record;
}

function summarize(results) {
  const hasDocMc = (r) => r.surface && r.surface.documentModelContextTypeof === 'object' && r.surface.modelContextInDocument === true;
  const hasToolsAdded = (r) => r.events.some((e) => e.method === 'WebMCP.toolsAdded' && Array.isArray(e.params?.tools) && e.params.tools.length > 0);
  const docCases = results.filter(hasDocMc).map((r) => r.name);
  const eventCases = results.filter(hasToolsAdded).map((r) => r.name);
  const fewestArgs = (names) => results
    .filter((r) => names.includes(r.name))
    .sort((a, b) => a.args.length - b.args.length || a.name.localeCompare(b.name))[0]?.name ?? null;
  return {
    documentModelContextPositiveCases: docCases,
    toolsAddedPositiveCases: eventCases,
    minimalForDocumentModelContext: docCases.length ? fewestArgs(docCases) : null,
    minimalForToolsAdded: eventCases.length ? fewestArgs(eventCases) : null,
  };
}

async function main() {
  const pw = resolvePlaywright();
  if (!pw) {
    console.error('FATAL: playwright not found under any global npm root candidate');
    process.exit(2);
  }
  const { server, url } = await serveLoopback();
  const results = [];
  try {
    for (const caseDef of CASES) {
      const rec = await runCase(pw.mod.chromium, caseDef, url);
      results.push(rec);
      const mc = rec.surface ? rec.surface.documentModelContextTypeof : '(no surface)';
      const ev = rec.events.filter((e) => e.method === 'WebMCP.toolsAdded').length;
      console.log(`case=${rec.name} enable=${rec.webMcpEnable.ok ? 'ok' : 'err:' + rec.webMcpEnable.error} doc.modelContext=${mc} toolsAdded=${ev}${rec.error ? ' launchErr=' + rec.error : ''}`);
    }
  } finally {
    server.close();
  }
  const out = {
    schema: 'tabi-round16-webmcp-flags-probe-v1',
    producedAt: new Date().toISOString(),
    runtime: {
      chromiumVersion: execFileSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).trim(),
      chromiumPath: CHROMIUM,
      chromiumSha256: sha256File(CHROMIUM),
      playwrightVersion: pw.version,
      playwrightRoot: pw.root,
      node: process.version,
    },
    page: { url: 'http://127.0.0.1:<ephemeral>/', htmlSha256: createHash('sha256').update(PAGE_HTML).digest('hex'), declarativeForm: '<form toolname="search" tooldescription="Search"><input name="q" title="Query"></form>' },
    cases: results,
    summary: summarize(results),
  };
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('FATAL', e?.stack || e);
  process.exit(2);
});
