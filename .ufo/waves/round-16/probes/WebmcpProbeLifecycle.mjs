#!/usr/bin/env node
// tabi round-16 / wave-1 probe: WebMCP lifecycle events (toolsRemoved / re-add).
// Seat: TabiR16.WebmcpProbeLifecycle-5
//
// Observes, on Chromium 154 with WebMCP flags, the exact CDP WebMCP.* event
// sequences for:
//   1. removing a declarative <form toolname> element
//   2. changing the toolname attribute on a live form
//   3. imperative-tool removal paths (unregisterTool / returned registration /
//      AbortSignal) on document.modelContext
//   4. same-document navigation (hash / history.pushState)
//   5. cross-document navigation to a second page with a different tool
//   6. page reload
//   7. WebMCP.disable then WebMCP.enable (does enable replay existing tools?)
//
// Loopback only (127.0.0.1), fresh temp profile, headless /usr/bin/chromium,
// Playwright 1.64.0 from the global npm root. Writes
// .ufo/waves/round-16/probes/WebmcpProbeLifecycle.json next to this file.
// Usage: node .ufo/waves/round-16/probes/WebmcpProbeLifecycle.mjs [--json-only]

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(HERE, 'WebmcpProbeLifecycle.json');
const JSON_ONLY = process.argv.includes('--json-only');

const CHROMIUM = '/usr/bin/chromium';
const FLAGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

// ---- fixtures (self-contained; the shared fixtures dir is another seat's file)
const PAGE_FORM = `<!doctype html><html><head><title>declarative-form</title></head><body>
<form id="f" toolname="search" tooldescription="Search the catalog">
  <label>Query <input name="q" type="text"></label>
</form>
</body></html>`;

const PAGE_IMPERATIVE = `<!doctype html><html><head><title>imperative</title></head><body>
<script>
window.__mcInfo = (() => {
  const mc = document.modelContext;
  const info = { present: !!mc, ownKeys: [], protoKeys: [], ctor: null };
  if (mc) {
    info.ownKeys = Object.getOwnPropertyNames(mc);
    const proto = Object.getPrototypeOf(mc);
    info.ctor = proto && proto.constructor ? proto.constructor.name : null;
    info.protoKeys = proto ? Object.getOwnPropertyNames(proto) : [];
    info.registerToolLength = typeof mc.registerTool === 'function' ? mc.registerTool.length : null;
  }
  info.navModelContext = 'modelContext' in navigator;
  return info;
})();
window.__ac = null;
window.__regResult = undefined;
const protoKeys = (o) => {
  if (!o) return null;
  const p = Object.getPrototypeOf(o);
  return p ? { ctor: p.constructor ? p.constructor.name : null,
               keys: Object.getOwnPropertyNames(p) } : null;
};
window.registerEcho = async (name, mode) => {
  const mc = document.modelContext;
  const def = {
    name,
    description: name + ' probe tool',
    inputSchema: { type: 'object', properties: { msg: { type: 'string' } }, required: [] },
    execute: async (params) => params,
  };
  let signalArg = 'none';
  if (mode === 'signal') {
    window.__ac = new AbortController();
    window.__regResult = mc.registerTool(def, { signal: window.__ac.signal });
    signalArg = 'options.signal';
  } else if (mode === 'defsignal') {
    window.__ac = new AbortController();
    def.signal = window.__ac.signal;
    window.__regResult = mc.registerTool(def);
    signalArg = 'def.signal';
  } else {
    window.__regResult = mc.registerTool(def);
  }
  let resolved = null, rejected = null;
  try {
    resolved = await window.__regResult;
    window.__regResolved = resolved;
  } catch (e) {
    rejected = String(e && e.message || e);
    window.__regResolved = null;
  }
  const r = window.__regResolved ?? window.__regResult;
  return { signalArg,
           rejected,
           resolvedType: resolved === null ? null : typeof resolved,
           resolvedOwnKeys: resolved && typeof resolved === 'object' ? Object.getOwnPropertyNames(resolved) : null,
           resolvedProto: protoKeys(resolved && typeof resolved === 'object' ? resolved : null),
           resolvedCtorName: resolved && resolved.constructor ? resolved.constructor.name : null,
           resultType: typeof r,
           resultProto: protoKeys(typeof r === 'object' ? r : null),
           hasUnregisterTool: typeof mc.unregisterTool === 'function' };
};
window.abortEcho = () => { if (window.__ac) window.__ac.abort(); return 'aborted'; };
window.tryRemovalPaths = (name) => {
  const mc = document.modelContext;
  const r = window.__regResolved ?? window.__regResult;
  const attempts = [];
  const tryIt = (label, fn) => {
    try { attempts.push({ label, result: String(fn()) }); }
    catch (e) { attempts.push({ label, error: String(e && e.message || e) }); }
  };
  if (r && typeof r.unregister === 'function') tryIt('resolved.unregister', () => r.unregister());
  if (typeof mc.unregisterTool === 'function') tryIt('mc.unregisterTool', () => mc.unregisterTool(name));
  if (typeof mc.removeTool === 'function') tryIt('mc.removeTool', () => mc.removeTool(name));
  if (typeof mc.clearTools === 'function') tryIt('mc.clearTools', () => mc.clearTools());
  if (r && typeof r.abort === 'function') tryIt('resolved.abort', () => r.abort());
  if (r && typeof r.dispose === 'function') tryIt('resolved.dispose', () => r.dispose());
  return attempts;
};
</script>
</body></html>`;

const PAGE_NAV_A = `<!doctype html><html><head><title>nav-a</title></head><body>
<form toolname="toolA" tooldescription="Tool A"><input name="a" type="text"></form>
</body></html>`;

const PAGE_NAV_B = `<!doctype html><html><head><title>nav-b</title></head><body>
<form toolname="toolB" tooldescription="Tool B"><input name="b" type="text"></form>
</body></html>`;

const PAGES = {
  '/form.html': PAGE_FORM,
  '/imperative.html': PAGE_IMPERATIVE,
  '/nav-a.html': PAGE_NAV_A,
  '/nav-b.html': PAGE_NAV_B,
};

function sha256(s) { return createHash('sha256').update(s).digest('hex'); }

function npmRootGlobal() {
  try { return execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(); }
  catch { return null; }
}

function resolvePlaywright() {
  const candidates = [];
  const root = npmRootGlobal();
  if (root) candidates.push(join(root, 'playwright'));
  for (const c of candidates) {
    const idx = join(c, 'index.js');
    if (existsSync(idx)) {
      const req = createRequire(idx);
      const pkg = req(join(c, 'package.json'));
      return { dir: c, version: pkg.version, chromium: req(idx).chromium };
    }
  }
  throw new Error('playwright not found in global npm root: ' + JSON.stringify(candidates));
}

async function main() {
  const t0 = Date.now();
  const log = [];
  let seq = 0;
  const recEvent = (method, params) =>
    log.push({ seq: seq++, t: Date.now() - t0, kind: 'event', method, params });
  const recAction = (name, detail) =>
    log.push({ seq: seq++, t: Date.now() - t0, kind: 'action', name, detail });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const drain = async (ms = 500) => { await sleep(ms); };

  // ---- loopback server
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const body = PAGES[url.pathname];
    if (!body) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  recAction('server_started', { base });

  const pwt = resolvePlaywright();
  recAction('playwright_resolved', { dir: pwt.dir, version: pwt.version });

  const profileDir = mkdtempSync(join(tmpdir(), 'wmcprobe-'));
  const context = await pwt.chromium.launchPersistentContext(profileDir, {
    executablePath: CHROMIUM,
    headless: true,
    args: [...FLAGS, '--disable-dev-shm-usage'],
  });
  const runtime = {
    chromiumVersion: execFileSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).trim(),
    executableSha256: sha256File(CHROMIUM),
    playwright: pwt.version,
    node: process.version,
    flags: FLAGS,
  };

  // hard loopback confinement: abort anything not on our server
  await context.route('**/*', (route) => {
    try {
      const u = new URL(route.request().url());
      if (u.hostname === '127.0.0.1' && u.port === String(port)) return route.continue();
      if (u.protocol === 'about:' || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
      return route.abort();
    } catch { return route.abort(); }
  });

  const page = context.pages()[0] ?? (await context.newPage());
  const cdp = await context.newCDPSession(page);

  // capture every CDP event (wildcard) by wrapping emit
  const origEmit = cdp.emit.bind(cdp);
  cdp.emit = (ev, ...rest) => {
    if (typeof ev === 'string' && (ev.startsWith('WebMCP.') || ev.startsWith('Page.') || ev.startsWith('Audits.') || ev.startsWith('Inspector.'))) {
      recEvent(ev, rest[0] ?? null);
    }
    return origEmit(ev, ...rest);
  };
  recAction('cdp_session_attached', {});

  await cdp.send('Page.enable');
  await cdp.send('Audits.enable').catch((e) => recAction('audits_enable_failed', { error: String(e) }));
  const webmcpEnable = await cdp.send('WebMCP.enable').then(
    (r) => ({ ok: true, result: r }),
    (e) => ({ ok: false, error: String(e) }));
  recAction('WebMCP.enable', webmcpEnable);

  const cases = [];
  const caseMark = (name) => { recAction('CASE_BEGIN', { name }); return { name, beginSeq: seq - 1 }; };

  // ---------------------------------------------------------------- case 1
  {
    const c = caseMark('declarative_form_remove');
    await page.goto(`${base}/form.html`, { waitUntil: 'load' });
    recAction('goto', { url: '/form.html' });
    await drain(600);
    await page.evaluate(() => document.getElementById('f').remove());
    recAction('dom_remove_form', {});
    await drain(700);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 2
  {
    const c = caseMark('declarative_toolname_change');
    await page.goto(`${base}/form.html`, { waitUntil: 'load' });
    recAction('goto', { url: '/form.html' });
    await drain(600);
    await page.evaluate(() => document.getElementById('f').setAttribute('toolname', 'renamed'));
    recAction('set_toolname_attr', { to: 'renamed' });
    await drain(700);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 3a
  {
    const c = caseMark('imperative_register_then_unregister');
    await page.goto(`${base}/imperative.html`, { waitUntil: 'load' });
    recAction('goto', { url: '/imperative.html' });
    await drain(400);
    const mcInfo = await page.evaluate(() => window.__mcInfo);
    recAction('modelContext_introspection', mcInfo);
    let reg;
    try {
      reg = await page.evaluate(() => window.registerEcho('imp_a', 'plain'));
      recAction('registerEcho_plain', reg);
    } catch (e) { recAction('registerEcho_plain_error', { error: String(e) }); }
    await drain(600);
    try {
      const out = await page.evaluate(() => window.tryRemovalPaths('imp_a'));
      recAction('tryRemovalPaths', out);
    } catch (e) { recAction('unregisterEcho_error', { error: String(e) }); }
    await drain(700);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 3b
  {
    const c = caseMark('imperative_abort_signal');
    try {
      const reg = await page.evaluate(() => window.registerEcho('imp_b', 'signal'));
      recAction('registerEcho_signal', reg);
      await drain(600);
      await page.evaluate(() => window.abortEcho());
      recAction('abort_signal', {});
      await drain(700);
    } catch (e) { recAction('case3b_error', { error: String(e) }); }
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 4
  {
    const c = caseMark('same_document_navigation');
    await page.goto(`${base}/nav-a.html`, { waitUntil: 'load' });
    recAction('goto', { url: '/nav-a.html' });
    await drain(600);
    await page.evaluate(() => { location.hash = '#section1'; });
    recAction('hash_navigate', { to: '#section1' });
    await drain(600);
    await page.evaluate(() => { history.pushState({}, '', '/nav-a.html?pushed=1'); });
    recAction('pushstate_navigate', {});
    await drain(600);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 5
  {
    const c = caseMark('cross_document_navigation');
    await page.goto(`${base}/nav-b.html`, { waitUntil: 'load' });
    recAction('goto', { url: '/nav-b.html' });
    await drain(800);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 6
  {
    const c = caseMark('reload');
    await page.reload({ waitUntil: 'load' });
    recAction('reload', {});
    await drain(800);
    c.endSeq = seq; cases.push(c);
  }

  // ---------------------------------------------------------------- case 7
  {
    const c = caseMark('disable_then_enable');
    const dis = await cdp.send('WebMCP.disable').then(
      (r) => ({ ok: true, result: r }), (e) => ({ ok: false, error: String(e) }));
    recAction('WebMCP.disable', dis);
    await drain(500);
    const en = await cdp.send('WebMCP.enable').then(
      (r) => ({ ok: true, result: r }), (e) => ({ ok: false, error: String(e) }));
    recAction('WebMCP.enable_again', en);
    await drain(800);
    c.endSeq = seq; cases.push(c);
  }

  // ---- derive per-case event slices + verdicts
  for (const c of cases) {
    c.events = log.filter((e) => e.seq > c.beginSeq && (c.endSeq === undefined || e.seq < c.endSeq));
    c.toolsAdded = c.events.filter((e) => e.method === 'WebMCP.toolsAdded');
    c.toolsRemoved = c.events.filter((e) => e.method === 'WebMCP.toolsRemoved');
    c.otherWebmcp = c.events.filter((e) => e.method && e.method.startsWith('WebMCP.') &&
      e.method !== 'WebMCP.toolsAdded' && e.method !== 'WebMCP.toolsRemoved');
    delete c.beginSeq; delete c.endSeq;
  }

  const output = {
    schema: 'tabi-r16-webmcp-probe-lifecycle-v1',
    seat: 'WebmcpProbeLifecycle',
    generatedAt: new Date(t0).toISOString(),
    runtime,
    server: { base, pages: Object.keys(PAGES) },
    webmcpEnable,
    log,
    cases,
    summary: {
      events: log.filter((e) => e.kind === 'event').length,
      toolsAdded: log.filter((e) => e.method === 'WebMCP.toolsAdded').length,
      toolsRemoved: log.filter((e) => e.method === 'WebMCP.toolsRemoved').length,
    },
  };

  writeFileSync(OUT_JSON, JSON.stringify(output, null, 2) + '\n');
  await context.close();
  server.close();
  rmSync(profileDir, { recursive: true, force: true });

  if (!JSON_ONLY) {
    console.log(`probe done: ${output.summary.events} events ` +
      `(+${output.summary.toolsAdded} toolsAdded, -${output.summary.toolsRemoved} toolsRemoved) -> ${OUT_JSON}`);
    for (const c of cases) {
      console.log(`  ${c.name}: +${c.toolsAdded.length} -${c.toolsRemoved.length} other=${c.otherWebmcp.map((e) => e.method).join(',') || '-'}`);
    }
  }
  process.exit(0);
}

function sha256File(path) {
  return sha256(readFileSync(path));
}

main().catch((e) => { console.error('PROBE_FATAL', e); process.exit(2); });
