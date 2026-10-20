#!/usr/bin/env node
// WebmcpProbeSecure — tabi round 16 wave 1 probe (owner: TabiR16.WebmcpProbeSecure-5).
// Question: which context classes expose document.modelContext and produce
// CDP WebMCP.toolsAdded when Chromium 154 is launched with the PLAN flags?
// Contexts compared (all traffic loopback):
//   http://127.0.0.1:<port>            loopback IP literal
//   http://localhost:<port>            loopback hostname
//   http://tabi.test:<port>            non-loopback alias mapped to 127.0.0.1 via
//                                      --host-resolver-rules (never leaves loopback)
//   data:text/html,...                 opaque origin URL
//   about:blank                        about: URL surface
//   sandboxed iframe (allow-scripts)   opaque-origin subframe of a loopback page
//   sandboxed iframe + allow-same-origin  same-origin subframe control
// Per context: isSecureContext, origin, typeof document.modelContext,
// 'modelContext' in navigator, WebMCP.enable result, declarative-form and
// imperative-registerTool results, and any WebMCP.* events observed.
// Usage: node .ufo/waves/round-16/probes/WebmcpProbeSecure.mjs [--out <json>]
// No shell, no writes outside the probe JSON output path.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DEFAULT = join(HERE, 'WebmcpProbeSecure.json');
const FLAGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
  '--host-resolver-rules=MAP tabi.test 127.0.0.1',
];
const CHROMIUM = '/usr/bin/chromium';
const ALIAS = 'tabi.test';
const SETTLE_MS = 700;

function parseArgs(argv) {
  const out = { out: OUT_DEFAULT };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) { out.out = resolve(argv[i + 1]); i += 1; }
  }
  return out;
}

function resolvePlaywright() {
  const dirs = [];
  try {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    if (root) dirs.push(join(root, 'playwright'));
  } catch { /* npm lookup is best-effort */ }
  const execDir = dirname(process.execPath);
  dirs.push(resolve(execDir, '..', 'lib', 'node_modules', 'playwright'));
  dirs.push('/usr/lib/node_modules/playwright');
  dirs.push('/usr/local/lib/node_modules/playwright');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) dirs.push(join(entry, 'playwright'));
  }
  for (const dir of [...new Set(dirs)]) {
    const pkgPath = join(dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    let pkg;
    try { pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch { continue; }
    if (pkg.name !== 'playwright' || !existsSync(join(dir, 'index.mjs'))) continue;
    return { dir, version: pkg.version };
  }
  return null;
}

const sha256File = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Page bodies are inline: fixtures dir is owned by WebmcpFixtures, probes stay self-contained.
const FORM_HTML = `<!doctype html><html><body>
<form toolname="decl_search" tooldescription="Declarative search tool">
  <input name="q" title="Query text">
</form>
</body></html>`;

const PARENT_IFRAME_HTML = (sandboxTokens) => `<!doctype html><html><body>
<iframe id="probe" sandbox="${sandboxTokens}" src="/frame.html"></iframe>
</body></html>`;

const FRAME_HTML = `<!doctype html><html><body>
<form toolname="frame_tool" tooldescription="Frame declarative tool">
  <input name="fq" title="Frame query">
</form>
</body></html>`;

const IMPERATIVE_SNIPPET = `(() => {
  const out = { modelContextType: typeof document.modelContext,
    navigatorHas: ('modelContext' in navigator), registered: false };
  if (typeof document.modelContext === 'undefined' || document.modelContext === null) return out;
  try {
    const maybe = document.modelContext.registerTool({
      name: 'imp_ping',
      description: 'Imperative ping tool',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({ ok: true }),
    });
    if (maybe && typeof maybe.then === 'function') {
      return maybe.then(() => ({ ...out, registered: true }))
        .catch((e) => ({ ...out, registered: false, error: String(e) }));
    }
    out.registered = true;
    return out;
  } catch (e) {
    out.registered = false;
    out.error = String(e);
    return out;
  }
})()`;

const CONTEXT_SNIPPET = `(() => ({
  isSecureContext: window.isSecureContext,
  origin: window.origin,
  locationOrigin: location.origin,
  url: location.href,
  modelContextType: typeof document.modelContext,
  navigatorHasModelContext: ('modelContext' in navigator),
  crossOriginIsolated: (typeof crossOriginIsolated === 'boolean') ? crossOriginIsolated : null,
}))()`;

function attachWebmcp(cdp, sink) {
  cdp.on('WebMCP.toolsAdded', (p) => sink.push({ event: 'toolsAdded', params: p }));
  cdp.on('WebMCP.toolsRemoved', (p) => sink.push({ event: 'toolsRemoved', params: p }));
}

async function probePage(browser, url, label, extra = {}) {
  const page = await browser.newPage();
  const events = [];
  const cdp = await page.context().newCDPSession(page);
  attachWebmcp(cdp, events);
  let enableResult = null;
  try {
    enableResult = await cdp.send('WebMCP.enable');
  } catch (e) {
    enableResult = { error: String(e && e.message ? e.message : e) };
  }
  const result = { label, url, webmcpEnable: enableResult, ...extra };
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
  } catch (e) {
    result.gotoError = String(e && e.message ? e.message : e);
  }
  await sleep(SETTLE_MS); // let declarative registration settle
  try {
    result.context = await page.evaluate(CONTEXT_SNIPPET);
  } catch (e) {
    result.context = { error: String(e) };
  }
  try {
    result.imperative = await page.evaluate(IMPERATIVE_SNIPPET);
  } catch (e) {
    result.imperative = { error: String(e) };
  }
  await sleep(SETTLE_MS);
  result.events = events;
  result.toolsAddedCount = events.filter((e) => e.event === 'toolsAdded').length;
  try { await cdp.detach(); } catch { /* best effort */ }
  await page.close();
  return result;
}

async function probeIframe(browser, baseUrl, sandboxTokens, label) {
  const page = await browser.newPage();
  const events = [];
  const cdp = await page.context().newCDPSession(page);
  attachWebmcp(cdp, events);
  let enableResult = null;
  try {
    enableResult = await cdp.send('WebMCP.enable');
  } catch (e) {
    enableResult = { error: String(e && e.message ? e.message : e) };
  }
  const result = { label, url: `${baseUrl}/parent.html`, sandbox: sandboxTokens, webmcpEnable: enableResult };
  try {
    await page.route('**/parent.html', (route) => route.fulfill({
      status: 200, contentType: 'text/html', body: PARENT_IFRAME_HTML(sandboxTokens),
    }));
    await page.goto(`${baseUrl}/parent.html`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForSelector('iframe#probe', { timeout: 5000 });
    const frame = page.frames().find((f) => f !== page.mainFrame());
    if (!frame) {
      result.frameError = 'no child frame observed';
    } else {
      result.frameUrl = frame.url();
      await sleep(SETTLE_MS);
      try { result.parentContext = await page.evaluate(CONTEXT_SNIPPET); } catch (e) { result.parentContext = { error: String(e) }; }
      try { result.frameContext = await frame.evaluate(CONTEXT_SNIPPET); } catch (e) { result.frameContext = { error: String(e) }; }
      try { result.frameImperative = await frame.evaluate(IMPERATIVE_SNIPPET); } catch (e) { result.frameImperative = { error: String(e) }; }
    }
  } catch (e) {
    result.error = String(e && e.message ? e.message : e);
  }
  await sleep(SETTLE_MS);
  result.events = events;
  result.toolsAddedCount = events.filter((e) => e.event === 'toolsAdded').length;
  try { await cdp.detach(); } catch { /* best effort */ }
  await page.close();
  return result;
}

async function main() {
  const { out } = parseArgs(process.argv.slice(2));
  const pw = resolvePlaywright();
  if (!pw) {
    console.error('PROBE-ERROR playwright package not found');
    process.exit(2);
  }
  const require2 = createRequire(join(pw.dir, 'index.mjs'));
  const { chromium } = require2('playwright');

  // Loopback fixture server: only the declarative frame page is served; parents are route-intercepted.
  const server = createServer((req, res) => {
    const host = (req.headers.host || '').split(':')[0];
    const loopbackHost = host === '127.0.0.1' || host === 'localhost' || host === ALIAS;
    if (!loopbackHost || req.url !== '/frame.html') {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' }).end(FRAME_HTML);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseIp = `http://127.0.0.1:${port}`;
  const baseLocal = `http://localhost:${port}`;
  const baseAlias = `http://${ALIAS}:${port}`;

  const profile = mkdtempSync(join(tmpdir(), 'tabi-webmcp-secure-'));
  const browser = await chromium.launchPersistentContext(profile, {
    executablePath: CHROMIUM,
    headless: true,
    args: FLAGS,
  });

  const record = {
    schema: 'tabi-round16-webmcp-secure-probe-v1',
    producedAt: new Date().toISOString(),
    runtime: {
      chromiumVersion: execFileSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).trim(),
      chromiumSha256: sha256File(CHROMIUM),
      playwright: pw.version,
      node: process.version,
    },
    flags: FLAGS,
    port,
    cases: [],
    summary: null,
  };

  try {
    // 1. http://127.0.0.1 — loopback IP literal.
    record.cases.push(await probePage(browser, `${baseIp}/frame.html`, 'http_loopback_ip'));
    // 2. http://localhost — loopback hostname.
    record.cases.push(await probePage(browser, `${baseLocal}/frame.html`, 'http_localhost'));
    // 3. http://tabi.test — non-loopback alias resolved to 127.0.0.1 in-process.
    record.cases.push(await probePage(browser, `${baseAlias}/frame.html`, 'http_alias_tabi_test'));
    // 4. data: URL — opaque origin.
    const dataUrl = `data:text/html,${encodeURIComponent(FORM_HTML)}`;
    record.cases.push(await probePage(browser, dataUrl, 'data_url'));
    // 5. about:blank — navigate then inject identical body; origin stays about: scheme.
    {
      const page = await browser.newPage();
      const events = [];
      const cdp = await page.context().newCDPSession(page);
      attachWebmcp(cdp, events);
      let enableResult = null;
      try { enableResult = await cdp.send('WebMCP.enable'); } catch (e) { enableResult = { error: String(e && e.message ? e.message : e) }; }
      const res5 = { label: 'about_blank', url: 'about:blank', webmcpEnable: enableResult };
      try {
        await page.goto('about:blank', { waitUntil: 'load', timeout: 15000 });
        await page.setContent(FORM_HTML);
        await sleep(SETTLE_MS);
        res5.context = await page.evaluate(CONTEXT_SNIPPET);
        res5.imperative = await page.evaluate(IMPERATIVE_SNIPPET);
      } catch (e) {
        res5.error = String(e && e.message ? e.message : e);
      }
      await sleep(SETTLE_MS);
      res5.events = events;
      res5.toolsAddedCount = events.filter((e) => e.event === 'toolsAdded').length;
      try { await cdp.detach(); } catch { /* best effort */ }
      await page.close();
      record.cases.push(res5);
    }
    // 6. sandboxed iframe (allow-scripts) — opaque origin subframe on a loopback parent.
    record.cases.push(await probeIframe(browser, baseIp, 'allow-scripts', 'sandbox_iframe_opaque'));
    // 7. sandboxed iframe with allow-same-origin — same-origin control.
    record.cases.push(await probeIframe(browser, baseIp, 'allow-scripts allow-same-origin', 'sandbox_iframe_same_origin'));
  } finally {
    await browser.close();
    server.close();
  }

  record.summary = {
    cases: record.cases.length,
    contexts: record.cases.map((c) => {
      const ctx = c.frameContext || c.context || {};
      return {
        label: c.label,
        isSecureContext: ctx.isSecureContext ?? null,
        modelContextType: ctx.modelContextType ?? null,
        toolsAddedCount: c.toolsAddedCount ?? 0,
      };
    }),
  };

  const tmp = `${out}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(record, null, 2)}\n`);
  renameSync(tmp, out);
  console.log(`PROBE-OK cases=${record.cases.length} out=${out}`);
  for (const s of record.summary.contexts) {
    console.log(`  ${s.label}: isSecureContext=${s.isSecureContext} modelContext=${s.modelContextType} toolsAdded=${s.toolsAddedCount}`);
  }
}

main().catch((e) => {
  console.error(`PROBE-ERROR ${String(e && e.stack ? e.stack : e)}`);
  process.exit(2);
});
