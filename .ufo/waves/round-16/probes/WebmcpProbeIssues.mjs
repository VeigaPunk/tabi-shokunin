#!/usr/bin/env node
// Round-16 wave-1 probe (seat: WebmcpProbeIssues-5, claim C2).
//
// Loads malformed declarative WebMCP forms on a 127.0.0.1 loopback page in
// /usr/bin/chromium (headless, fresh temp profile, WebMCP feature flags) and
// records, per case:
//   - every Audits.issueAdded payload verbatim (issue.code, issue details)
//   - every WebMCP.* CDP event verbatim (toolsAdded/toolsRemoved/...)
//   - every page console message (Playwright console event)
//   - whether a tool is still registered (document.modelContext.getTools())
//   - document.modelContext / navigator.modelContext presence
//
// Malformed cases (per assignment):
//   missing-toolname, missing-tooldescription, input-without-name,
//   required-input-without-name, param-missing-title-and-description
// Positive control: well-formed declarative form.
//
// Output: probes/WebmcpProbeIssues.json (same directory as this script).
// Loopback 127.0.0.1 only; temp profile; never a real site or user profile.
//
// Usage: node .ufo/waves/round-16/probes/WebmcpProbeIssues.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const PROBES = dirname(SCRIPT);
const OUT_PATH = join(PROBES, 'WebmcpProbeIssues.json');
const CHROMIUM = '/usr/bin/chromium';

const FLAGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];

// --- fixtures ---------------------------------------------------------------
// Fixture bodies are intentionally minimal: a single declarative form mutated
// per case. A console.log marker proves script execution and seeds the console
// channel with a known message.

function fixture(id, inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${id}</title></head>` +
    `<body>${inner}` +
    `<script>console.log('fixture-loaded ${id}');</script>` +
    `</body></html>`;
}

const CASES = [
  {
    id: 'missing-toolname',
    note: 'form has tooldescription but no toolname',
    html: fixture('missing-toolname',
      '<form tooldescription="Search things"><input name="q" title="Query"></form>'),
  },
  {
    id: 'missing-tooldescription',
    note: 'form has toolname but no tooldescription',
    html: fixture('missing-tooldescription',
      '<form toolname="search"><input name="q" title="Query"></form>'),
  },
  {
    id: 'input-without-name',
    note: 'form is well-formed; sole input has no name attribute',
    html: fixture('input-without-name',
      '<form toolname="search" tooldescription="Search things"><input title="Query"></form>'),
  },
  {
    id: 'required-input-without-name',
    note: 'well-formed form; a required input has no name attribute',
    html: fixture('required-input-without-name',
      '<form toolname="search" tooldescription="Search things">' +
      '<input required title="Query"><input name="ok" title="Other"></form>'),
  },
  {
    id: 'param-missing-title-and-description',
    note: 'named input with neither title attribute nor toolparamdescription',
    html: fixture('param-missing-title-and-description',
      '<form toolname="search" tooldescription="Search things"><input name="q"></form>'),
  },
  {
    id: 'positive-control',
    note: 'well-formed declarative form (name/description/title present)',
    html: fixture('positive-control',
      '<form toolname="search" tooldescription="Search things"><input name="q" title="Query"></form>'),
  },
  // Disambiguation variants: the first run showed title="..." alone does NOT
  // satisfy ParameterMissingTitleAndDescription. Probe which signal
  // (toolparamdescription, <label>, aria-label, toolparamtitle) silences it.
  {
    id: 'param-with-toolparamdescription',
    note: 'named input carrying toolparamdescription attribute',
    html: fixture('param-with-toolparamdescription',
      '<form toolname="search" tooldescription="Search things">' +
      '<input name="q" toolparamdescription="Query text"></form>'),
  },
  {
    id: 'param-with-label',
    note: 'named input associated with a <label for=> element',
    html: fixture('param-with-label',
      '<form toolname="search" tooldescription="Search things">' +
      '<label for="q">Query</label><input id="q" name="q"></form>'),
  },
  {
    id: 'param-with-aria-label',
    note: 'named input carrying aria-label',
    html: fixture('param-with-aria-label',
      '<form toolname="search" tooldescription="Search things">' +
      '<input name="q" aria-label="Query"></form>'),
  },
  {
    id: 'param-with-toolparamtitle',
    note: 'named input carrying toolparamtitle alone (attribute absent from binary strings)',
    html: fixture('param-with-toolparamtitle',
      '<form toolname="search" tooldescription="Search things">' +
      '<input name="q" toolparamtitle="Query"></form>'),
  },
];

// --- playwright resolution (global npm root, like aria-loopback-round13) -----

function resolvePlaywright() {
  const candidates = [];
  try {
    candidates.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim());
  } catch { /* npm root unavailable; try other candidates */ }
  const execDir = dirname(process.execPath);
  candidates.push(resolve(execDir, '..', 'lib', 'node_modules'));
  candidates.push('/usr/lib/node_modules');
  candidates.push('/usr/local/lib/node_modules');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) candidates.push(entry);
  }
  for (const root of [...new Set(candidates)]) {
    const pkgPath = join(root, 'playwright', 'package.json');
    if (!existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.name !== 'playwright') continue;
      const req = createRequire(pkgPath);
      return { playwright: req('playwright'), version: pkg.version, root };
    } catch { /* keep searching */ }
  }
  return null;
}

async function sha256File(path) {
  return new Promise((res, rej) => {
    const h = createHash('sha256');
    const s = createReadStream(path);
    s.on('data', (c) => h.update(c));
    s.on('end', () => res(h.digest('hex')));
    s.on('error', rej);
  });
}

// --- loopback server ---------------------------------------------------------

function serveFixtures() {
  const routes = new Map();
  for (const c of CASES) routes.set(`/${c.id}.html`, c.html);
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    const body = routes.get(url.pathname);
    if (body === undefined) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  });
  return new Promise((res, rej) => {
    server.on('error', rej);
    server.listen(0, '127.0.0.1', () => {
      res({ server, port: server.address().port });
    });
  });
}

// --- per-case run ------------------------------------------------------------

const CASE_SETTLE_MS = 750; // let declarative registration + Audits batching land

async function runCase(browser, baseUrl, tc) {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);

  const issues = [];
  const webmcpEvents = [];
  const consoleMessages = [];
  const cdpCommandErrors = [];
  let tools = null;
  let surface = null;

  cdp.on('Audits.issueAdded', (p) => issues.push(p));
  cdp.on('WebMCP.toolsAdded', (p) => webmcpEvents.push({ method: 'WebMCP.toolsAdded', params: p }));
  cdp.on('WebMCP.toolsRemoved', (p) => webmcpEvents.push({ method: 'WebMCP.toolsRemoved', params: p }));
  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  page.on('pageerror', (err) => {
    consoleMessages.push({ type: 'pageerror', text: String(err), location: null });
  });

  for (const cmd of ['WebMCP.enable', 'Audits.enable']) {
    try {
      const r = await cdp.send(cmd);
      cdpCommandErrors.push({ command: cmd, ok: true, result: r });
    } catch (e) {
      cdpCommandErrors.push({ command: cmd, ok: false, error: String(e && e.message || e) });
    }
  }

  await page.goto(`${baseUrl}/${tc.id}.html`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(CASE_SETTLE_MS);

  try {
    surface = await page.evaluate(async () => {
      const out = {
        documentModelContextType: typeof document.modelContext,
        navigatorModelContext: 'modelContext' in navigator,
      };
      if (document.modelContext && typeof document.modelContext.getTools === 'function') {
        try {
          const ts = await document.modelContext.getTools();
          out.getToolsCount = Array.isArray(ts) ? ts.length : null;
          out.getToolsNames = Array.isArray(ts)
            ? ts.map((t) => (t && t.name !== undefined ? t.name : String(t)))
            : null;
        } catch (e) {
          out.getToolsError = String(e && e.message || e);
        }
      }
      return out;
    });
  } catch (e) {
    surface = { evaluateError: String(e && e.message || e) };
  }

  tools = webmcpEvents
    .filter((e) => e.method === 'WebMCP.toolsAdded')
    .flatMap((e) => (e.params && e.params.tools) || []);

  const result = {
    case: tc.id,
    note: tc.note,
    url: `${baseUrl}/${tc.id}.html`,
    cdpCommands: cdpCommandErrors,
    surface,
    webmcpEvents,
    toolsAddedCount: tools.length,
    toolStillRegistered: tools.length > 0,
    issues,
    issueCodes: issues.map((i) => i && i.issue && i.issue.code).filter(Boolean),
    consoleMessages,
  };
  await cdp.detach().catch(() => {});
  await page.close().catch(() => {});
  return result;
}

// --- main --------------------------------------------------------------------

async function main() {
  const startedAt = new Date().toISOString();
  const probeSha256 = await sha256File(SCRIPT);
  const resolved = resolvePlaywright();
  if (!resolved) {
    console.error('PROBE-ERROR playwright not resolvable from global npm root');
    process.exit(2);
  }
  const { chromium } = resolved.playwright;

  const profileDir = mkdtempSync(join(tmpdir(), 'webmcp-issues-profile-'));
  const { server, port } = await serveFixtures();
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  const results = [];
  let launchError = null;
  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM,
      headless: true,
      args: FLAGS,
    });
    for (const tc of CASES) {
      try {
        results.push(await runCase(browser, baseUrl, tc));
      } catch (e) {
        results.push({ case: tc.id, note: tc.note, fatalError: String(e && e.stack || e) });
      }
    }
  } catch (e) {
    launchError = String(e && e.stack || e);
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((r) => server.close(r));
    rmSync(profileDir, { recursive: true, force: true });
  }

  const out = {
    schema: 'tabi-round16-webmcp-issues-probe-v1',
    probe: 'WebmcpProbeIssues',
    purpose: 'record Audits.issueAdded payloads for malformed declarative WebMCP forms',
    generatedAt: startedAt,
    finishedAt: new Date().toISOString(),
    runtime: {
      node: process.versions.node,
      playwright: resolved.version,
      playwrightRoot: resolved.root,
      chromiumExecutable: CHROMIUM,
      chromiumSha256: await sha256File(CHROMIUM).catch(() => null),
      chromiumVersion: browser ? browser.version() : null,
    },
    flags: FLAGS,
    loopbackOnly: true,
    baseUrl,
    probeSha256,
    launchError,
    cases: results,
    summary: {
      cases: results.length,
      casesWithIssues: results.filter((r) => (r.issueCodes || []).length > 0).length,
      casesWithTool: results.filter((r) => r.toolStillRegistered).length,
      uniqueIssueCodes: [...new Set(results.flatMap((r) => r.issueCodes || []))].sort(),
    },
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`PROBE_ISSUES verdict=done cases=${results.length} ` +
    `issueCodes=${out.summary.uniqueIssueCodes.join(',') || 'none'} ` +
    `out=${OUT_PATH}`);
}

main().catch((e) => {
  console.error(`PROBE-ERROR ${e && e.stack || e}`);
  process.exit(2);
});
