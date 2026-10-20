#!/usr/bin/env node
// Round-16 WebMCP loopback observation harness (claim C2).
//
// Serves corpus/evidence/round-16/webmcp/fixtures/*.html on 127.0.0.1:<ephemeral>,
// launches /usr/bin/chromium headless under a fresh temp profile with the WebMCP
// feature flags, attaches a CDP session per page, enables WebMCP + Audits, and
// records WebMCP.* / Audits.issueAdded events. Separate flag-off and
// DevToolsWebMCPSupport-disabled launches are the negative controls.
//
// Loopback confinement (page-level exact-origin claim only — no claim of global
// host no-egress): every request whose URL is not exactly
// http://127.0.0.1:<fixture-port>[/...] is aborted and recorded, except a
// top-level data: navigation used by the data-url divergence case (data: is a
// document source, not a network fetch). WebSockets are denied; service
// workers are blocked; --host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE
// 127.0.0.1 denies browser-level DNS. The Arch /usr/bin/chromium launcher reads
// ~/.config/chromium-flags.conf, so each launch gets a minimal env with
// HOME/XDG_CONFIG_HOME redirected to a temp dir, and the effective argv is read
// back from /proc/<browser-pid>/cmdline; the flag-off control asserts no WebMCP
// feature token reaches that argv.
//
// Tool payloads returned by the page are untrusted target data: this harness
// never calls WebMCP.invokeTool/cancelInvocation, executeTool, form submit, or
// requestSubmit.
//
// Usage:
//   node scripts/webmcp-loopback-round16.mjs [--out PATH] [--fixtures DIR]
//                                            [--chromium PATH] [--force]
//
// Defaults: --out corpus/evidence/round-16/webmcp/receipt.json,
//           --fixtures corpus/evidence/round-16/webmcp/fixtures,
//           --chromium /usr/bin/chromium.
// Verdict/exit: pass→0, fail→1, could_not_evaluate→2 (also for a refused
// overwrite of differing receipt bytes unless --force).
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  lstatSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { createServer, get as httpGet } from 'node:http';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');
const WEBMCP_DIR = join(ROOT, 'corpus', 'evidence', 'round-16', 'webmcp');
const DEFAULT_OUT = join(WEBMCP_DIR, 'receipt.json');
const DEFAULT_FIXTURES = join(WEBMCP_DIR, 'fixtures');
const COMMITTED_PROTOCOL = join(WEBMCP_DIR, 'protocol-domain.json');
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const PRODUCER_REL = 'scripts/webmcp-loopback-round16.mjs';
const PLAYWRIGHT_REQUIRED = '1.64.0';

const WEBMCP_FEATURE_ARGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const DOMAIN_DISABLED_ARGS = [
  '--enable-blink-features=WebMCP',
  '--disable-features=DevToolsWebMCPSupport',
];
const HOST_RESOLVER_DENY = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';
const WAIT_EVENT_MS = 4000;
const WAIT_ACTION_MS = 3000;
const CASE_TIMEOUT_MS = 45000;
const RUN_TIMEOUT_MS = 300000;

// Expected case ids (run order). Anything not reached gets a status:'missing'
// record so a vacuous short run cannot read as clean.
const CASE_IDS = [
  'flags-off-negative-control',
  'devtools-domain-disabled',
  'declarative-form-tool',
  'imperative-model-context',
  'lifecycle-removal',
  'navigation-clears-tools',
  'declarative-missing-name',
  'model-context-location',
  'frame-tools',
  'opaque-sandboxed-iframe',
  'data-url-declarative',
];

const launchedRuns = [];

function parseArgs(argv) {
  const args = {
    out: DEFAULT_OUT,
    fixtures: DEFAULT_FIXTURES,
    chromium: DEFAULT_CHROMIUM,
    force: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') args.out = resolve(argv[++i]);
    else if (arg === '--fixtures') args.fixtures = resolve(argv[++i]);
    else if (arg === '--chromium') args.chromium = resolve(argv[++i]);
    else if (arg === '--force') args.force = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('node scripts/webmcp-loopback-round16.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--force]');
      process.exit(0);
    } else {
      console.error(`webmcp-loopback: unknown argument ${arg}`);
      process.exit(2);
    }
  }
  return args;
}

function sha256File(path) {
  return new Promise((resolvePromise, rejectPromise) => {
    const hash = createHash('sha256');
    createReadStream(path)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolvePromise(hash.digest('hex')))
      .on('error', rejectPromise);
  });
}

function sha256FileBestEffort(path) {
  return sha256File(path).catch(() => null);
}

function stableStringify(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

function deepEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

// JSON Schema equivalence tolerant of this build's quirks (observed 2026-10-20
// by the fixtures seat's probes): declarative <select> parameters may come back
// as {type:'string'}, {enum:[...]}, or {type:'string',anyOf:[...],enum:[...]}.
// Enum-of-strings and anyOf-of-string-schemas normalize to {type:'string'}.
function schemaEquivalent(expected, actual) {
  if (deepEqual(expected, actual)) return true;
  if (expected === undefined || expected === null) return true; // unconstrained
  if (!expected || !actual || typeof expected !== 'object' || typeof actual !== 'object') return false;
  const isStringish = (s) => {
    if (!s || typeof s !== 'object') return false;
    if (s.type === 'string') return true;
    if (s.type === undefined && Array.isArray(s.enum) && s.enum.every((v) => typeof v === 'string')) return true;
    return false;
  };
  const norm = (s) => {
    const copy = { ...s };
    if (Array.isArray(copy.enum) && copy.enum.every((v) => typeof v === 'string')) {
      delete copy.enum;
      if (copy.type === undefined) copy.type = 'string';
    }
    if (Array.isArray(copy.anyOf) && copy.anyOf.every(isStringish)) {
      delete copy.anyOf;
      if (copy.type === undefined) copy.type = 'string';
    }
    return copy;
  };
  const e = norm(expected);
  const a = norm(actual);
  if (deepEqual(e, a)) return true;
  const eType = e.type ?? (e.properties ? 'object' : undefined);
  const aType = a.type ?? (a.properties ? 'object' : undefined);
  if (eType !== aType) return false;
  const eProps = e.properties && typeof e.properties === 'object' ? e.properties : {};
  const aProps = a.properties && typeof a.properties === 'object' ? a.properties : {};
  const keys = new Set([...Object.keys(eProps), ...Object.keys(aProps)]);
  for (const key of keys) {
    if (!schemaEquivalent(eProps[key], aProps[key])) return false;
  }
  const restE = { ...e };
  const restA = { ...a };
  delete restE.properties;
  delete restA.properties;
  return deepEqual(restE, restA);
}

// --- Playwright resolution (pattern: scripts/aria-loopback-round13.mjs:118-140;
// plain `playwright` package here, version pinned per PLAN C2) ---

function candidatePlaywrightDirs() {
  const dirs = [];
  const execDir = dirname(process.execPath);
  dirs.push(resolve(execDir, '..', 'lib', 'node_modules', 'playwright'));
  dirs.push('/usr/lib/node_modules/playwright');
  dirs.push('/usr/local/lib/node_modules/playwright');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) dirs.push(join(entry, 'playwright'));
  }
  return [...new Set(dirs)];
}

function resolvePlaywright() {
  for (const dir of candidatePlaywrightDirs()) {
    const pkgPath = join(dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    } catch {
      continue;
    }
    if (pkg.name !== 'playwright') continue;
    if (!existsSync(join(dir, 'index.mjs')) && !existsSync(join(dir, 'index.js'))) continue;
    if (pkg.version !== PLAYWRIGHT_REQUIRED) {
      return { dir, version: pkg.version, wrongVersion: true };
    }
    const req = createRequire(join(dir, 'index.js'));
    return { dir, version: pkg.version, chromium: req('playwright').chromium };
  }
  return null;
}

// Minimal browser environment: isolates the Arch launcher wrapper from
// ~/.config/chromium-flags.conf so the recorded argv is the effective argv.
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

function readProcArgv(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8')
      .split('\0')
      .filter((part) => part.length > 0);
  } catch {
    return null;
  }
}

function findProcessesUsing(marker) {
  const hits = [];
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    const argv = readProcArgv(Number(entry));
    if (argv && argv.join(' ').includes(marker)) hits.push({ pid: Number(entry), argv });
  }
  return hits;
}

// The browser main process is the one whose argv carries this run's unique
// --user-data-dir and no --type= (renderer/gpu/utility children carry --type).
function findBrowserPid(profile) {
  const marker = `--user-data-dir=${profile}`;
  const mains = findProcessesUsing(marker).filter(
    (hit) => hit.argv.includes(marker) && !hit.argv.some((a) => a.startsWith('--type=')),
  );
  return mains.length === 1 ? mains[0].pid : null;
}

// --- Fixture server: loopback bind (asserted), fixtures-dir confinement,
// GET/HEAD only, no symlinks, no traversal. ---

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startFixtureServer(fixturesDir) {
  const root = realpathSync(resolve(fixturesDir));
  const served = [];
  const denied = [];
  const server = createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end('method not allowed');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch {
      denied.push(`<undecodable:${req.url}>`);
      res.writeHead(400).end('bad request');
      return;
    }
    if (pathname === '/' || pathname === '') {
      const names = readdirSync(root).sort();
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end(names.join('\n'));
      return;
    }
    const abs = normalize(join(root, pathname));
    const inRoot = abs === root || abs.startsWith(root + sep);
    let real = null;
    if (inRoot) {
      try {
        real = realpathSync(abs);
      } catch {
        real = null;
      }
    }
    let lst = null;
    if (inRoot) {
      // Wave-2 SentinelHarness H2: a NUL in the path threw outside any try.
      try {
        lst = lstatSync(abs, { throwIfNoEntry: false });
      } catch {
        lst = null;
      }
    }
    if (
      !inRoot ||
      real === null ||
      real === root ||
      !real.startsWith(root + sep) ||
      !lst ||
      lst.isSymbolicLink() ||
      !lst.isFile()
    ) {
      denied.push(pathname);
      res.writeHead(404).end('not found');
      return;
    }
    const ext = abs.slice(abs.lastIndexOf('.'));
    served.push({ path: relative(root, abs), bytes: lst.size });
    res.writeHead(200, {
      'content-type': CONTENT_TYPES[ext] || 'application/octet-stream',
      'content-length': lst.size,
      'cache-control': 'no-store',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(abs).pipe(res);
  });
  return new Promise((resolvePromise, rejectPromise) => {
    server.on('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || address.address !== '127.0.0.1') {
        server.close();
        rejectPromise(new Error(`fixture server bound ${address?.address}; expected 127.0.0.1`));
        return;
      }
      resolvePromise({ server, port: address.port, served, denied });
    });
  });
}

function closeServer(server) {
  return new Promise((resolvePromise) => {
    try {
      server.closeAllConnections?.();
    } catch {
      /* older node */
    }
    server.close(() => resolvePromise());
  });
}

function probePortClosed(port) {
  return new Promise((resolvePromise) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/', timeout: 1500 }, (res) => {
      res.resume();
      resolvePromise({ refused: false, status: res.statusCode });
    });
    req.on('timeout', () => {
      req.destroy();
      resolvePromise({ refused: true, reason: 'timeout' });
    });
    req.on('error', (error) => {
      resolvePromise({ refused: true, reason: error.code || String(error) });
    });
  });
}

// --- Browser-side helpers ---

async function guardLoopback(context, serverPort, blocked) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    // data: top-level navigation is a document source, not a network fetch;
    // it stays admitted for the data-url divergence case. Everything else
    // must be exactly http://127.0.0.1:<fixture-port>.
    if (url.startsWith('data:') && request.isNavigationRequest()) {
      await route.continue();
      return;
    }
    let parsed = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    const allowed =
      parsed !== null &&
      parsed.protocol === 'http:' &&
      parsed.hostname === '127.0.0.1' &&
      parsed.port === String(serverPort) &&
      parsed.username === '' &&
      parsed.password === '';
    if (allowed) {
      await route.continue();
    } else {
      blocked.push(url);
      await route.abort('blockedbyclient');
    }
  });
  try {
    await context.routeWebSocket(/.*/, (ws) => {
      blocked.push(`ws:${ws.url()}`);
      ws.close();
    });
  } catch {
    // routeWebSocket unavailable on this version; page-level attempts still
    // surface through the route guard.
  }
}

async function attachCdp(context, page) {
  const t0 = Date.now();
  const session = await context.newCDPSession(page);
  const events = [];
  const toolsAdded = [];
  const toolsRemoved = [];
  const issues = [];
  const record = (name) => (params) => {
    const entry = { event: name, params: params ?? null, atMs: Date.now() - t0 };
    events.push(entry);
    if (name === 'WebMCP.toolsAdded') for (const t of params?.tools ?? []) toolsAdded.push(t);
    if (name === 'WebMCP.toolsRemoved') for (const t of params?.tools ?? []) toolsRemoved.push(t);
    if (name === 'Audits.issueAdded') issues.push(params ?? null);
  };
  for (const name of [
    'WebMCP.toolsAdded',
    'WebMCP.toolsRemoved',
    'WebMCP.toolsChanged',
    'WebMCP.toolCalled',
    'Audits.issueAdded',
  ]) {
    session.on(name, record(name));
  }
  // Armed before any navigation; enable results are recorded as domain
  // presence/absence evidence (WebMCP.enable returns {} even with no flags).
  const enables = {};
  const enableSeq = [];
  for (const cmd of ['WebMCP.enable', 'Audits.enable', 'Page.enable']) {
    enableSeq.push(cmd);
    try {
      enables[cmd] = await session.send(cmd);
    } catch (error) {
      enables[cmd] = { error: String(error?.message ?? error) };
    }
  }
  return { session, events, toolsAdded, toolsRemoved, issues, enables, enableSeq };
}

function issueErrorTypes(issues) {
  const counts = {};
  for (const issue of issues) {
    const type = issue?.issue?.details?.genericIssueDetails?.errorType ?? issue?.issue?.code ?? null;
    if (type) counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

async function waitFor(predicate, timeoutMs, intervalMs = 60) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return predicate();
}

async function gotoFixture(page, base, file) {
  await page.goto(`${base}/${file}`, { waitUntil: 'load', timeout: 15000 });
}

async function fixtureDeclaration(page) {
  try {
    return await page.evaluate(() => {
      const d = globalThis.__webmcpFixture;
      if (!d || typeof d !== 'object') return null;
      return {
        id: d.id ?? null,
        expectedTools: Array.isArray(d.expectedTools) ? d.expectedTools : null,
        actionOrder: Array.isArray(d.actionOrder) ? d.actionOrder : Object.keys(d.actions || {}),
        expectedRemoved: Array.isArray(d.expectedRemoved) ? d.expectedRemoved : null,
      };
    });
  } catch {
    return null;
  }
}

async function runFixtureAction(page, name) {
  return page.evaluate(async (actionName) => {
    const d = globalThis.__webmcpFixture;
    const fn = d && d.actions ? d.actions[actionName] : null;
    if (typeof fn !== 'function') return { ran: false, reason: 'no such action' };
    try {
      const result = await fn();
      return { ran: true, result: result ?? null };
    } catch (error) {
      return { ran: false, reason: String(error?.message ?? error) };
    }
  }, name);
}

async function getToolsSnapshot(page) {
  try {
    return await page.evaluate(async () => {
      const mc = document.modelContext;
      if (!mc || typeof mc.getTools !== 'function') return null;
      const tools = await mc.getTools();
      return Array.isArray(tools) ? tools.map((t) => ({ name: t?.name ?? null })) : null;
    });
  } catch (error) {
    return { error: String(error?.message ?? error) };
  }
}

// Fallback when a fixture does not declare __webmcpFixture.expectedTools: parse
// declarative <form toolname tooldescription> markup plus its named controls.
function parseDeclarativeTools(html) {
  const tools = [];
  const formRe = /<form\b[^>]*>/gi;
  let match;
  while ((match = formRe.exec(html)) !== null) {
    const tag = match[0];
    const attr = (name) => {
      const m =
        tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i')) ||
        tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, 'i'));
      return m ? m[1] : null;
    };
    const name = attr('toolname');
    if (!name) continue;
    const description = attr('tooldescription');
    const closeIdx = html.indexOf('</form', match.index);
    const body = html.slice(match.index, closeIdx === -1 ? html.length : closeIdx);
    const properties = {};
    const inputRe = /<(?:input|select|textarea)\b[^>]*\bname\s*=\s*"([^"]+)"[^>]*>/gi;
    let im;
    while ((im = inputRe.exec(body)) !== null) properties[im[1]] = { type: 'string' };
    const singleRe = /<(?:input|select|textarea)\b[^>]*\bname\s*=\s*'([^']+)'[^>]*>/gi;
    while ((im = singleRe.exec(body)) !== null) properties[im[1]] = { type: 'string' };
    tools.push({
      name,
      description,
      inputSchema: { type: 'object', properties, required: [] },
    });
  }
  return tools;
}

function toolMatches(expectedTool, actualTools) {
  return actualTools.find(
    (t) =>
      t.name === expectedTool.name &&
      (expectedTool.description == null || t.description === expectedTool.description) &&
      (expectedTool.inputSchema == null || schemaEquivalent(expectedTool.inputSchema, t.inputSchema)),
  );
}

function compareTools(expected, actual) {
  const missing = expected.filter((e) => !toolMatches(e, actual));
  const matchedNames = new Set(expected.map((e) => e.name));
  const unexpected = actual.filter((a) => !matchedNames.has(a.name));
  const fieldMismatches = [];
  for (const e of expected) {
    const candidate = actual.find((a) => a.name === e.name);
    if (!candidate || toolMatches(e, [candidate])) continue;
    fieldMismatches.push({
      name: e.name,
      expectedDescription: e.description ?? null,
      actualDescription: candidate.description ?? null,
      expectedSchema: e.inputSchema ?? null,
      actualSchema: candidate.inputSchema ?? null,
    });
  }
  return { missing, unexpected, fieldMismatches };
}

// --- CDP protocol domain: always capture this binary's own /json/protocol
// over a loopback devtools port; when the peer-owned committed artifact exists,
// extract its WebMCP domain and deep-compare (comparison.webmcpDomainIdentical). ---

function committedProtocolDomain() {
  if (!existsSync(COMMITTED_PROTOCOL)) return null;
  const raw = readFileSync(COMMITTED_PROTOCOL, 'utf8');
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  const domain =
    parsed?.domains?.find?.((d) => d.domain === 'WebMCP') ??
    parsed?.runs?.find?.((r) => r.label === 'webmcp')?.protocolEndpoint?.webmcpDomain ??
    parsed?.runs?.webmcp?.protocolEndpoint?.webmcpDomain ??
    parsed?.webmcp ??
    parsed?.domain ??
    null;
  return {
    path: 'corpus/evidence/round-16/webmcp/protocol-domain.json',
    sha256: createHash('sha256').update(raw).digest('hex'),
    webmcpDomain: domain,
  };
}

async function fetchProtocolDomain(chromiumPath) {
  const committed = committedProtocolDomain();
  const profile = mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-proto-'));
  const home = mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-protohome-'));
  const child = spawn(
    chromiumPath,
    [
      '--headless',
      '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      HOST_RESOLVER_DENY,
      ...WEBMCP_FEATURE_ARGS,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'], env: minimalBrowserEnv(home) },
  );
  let stderrText = '';
  const wsUrl = await new Promise((resolvePromise) => {
    const timer = setTimeout(() => resolvePromise(null), 15000);
    child.stderr.on('data', (chunk) => {
      stderrText += chunk.toString('utf8');
      const m = stderrText.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolvePromise(m[1]);
      }
    });
    child.on('exit', () => {
      clearTimeout(timer);
      resolvePromise(null);
    });
  });
  try {
    if (!wsUrl) {
      return { ok: false, source: 'live /json/protocol', reason: 'no DevTools endpoint observed', stderrTail: stderrText.slice(-400), committed };
    }
    const port = new URL(wsUrl).port;
    const body = await new Promise((resolvePromise, rejectPromise) => {
      httpGet(`http://127.0.0.1:${port}/json/protocol`, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')));
      }).on('error', rejectPromise);
    });
    const protocol = JSON.parse(body);
    const webmcp = (protocol.domains || []).find((d) => d.domain === 'WebMCP') || null;
    const identical = committed ? deepEqual(webmcp, committed.webmcpDomain) : null;
    return {
      ok: Boolean(webmcp),
      source: `live http://127.0.0.1:${port}/json/protocol`,
      webmcp,
      protocolSha256: createHash('sha256').update(body).digest('hex'),
      committed,
      comparison: committed
        ? { webmcpDomainIdentical: identical, liveSha256: null, note: 'deep-equal of WebMCP domain objects, not bytes' }
        : null,
    };
  } catch (error) {
    return { ok: false, source: 'live /json/protocol', reason: String(error?.message ?? error), committed };
  } finally {
    try {
      child.kill('SIGKILL');
    } catch {
      /* already exited */
    }
    // Wave-2 SentinelHarness H3: wait for the browser to exit before removing
    // its profile, or child processes re-create files in the deleted dir.
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise((resolveExit) => {
        const timer = setTimeout(resolveExit, 5000);
        child.once('exit', () => { clearTimeout(timer); resolveExit(); });
      });
    }
    rmSync(profile, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
}

// --- Browser launch: persistent context (temp profile), minimal env, then
// browser pid + version + real binary resolved through CDP SystemInfo /
// Browser.getVersion and /proc (context.browser() is null for persistent
// contexts). ---

async function launchChromium(chromium, chromiumPath, tmpBase, extraArgs, label) {
  const profile = mkdtempSync(join(tmpBase, `${label}-profile-`));
  const home = mkdtempSync(join(tmpBase, `${label}-home-`));
  const args = [HOST_RESOLVER_DENY, ...extraArgs];
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: chromiumPath,
    headless: true,
    args,
    env: minimalBrowserEnv(home),
    serviceWorkers: 'block',
    chromiumSandbox: true,
  });
  let pid = null;
  let version = null;
  let product = null;
  let page = null;
  try {
    page = await context.newPage();
    const session = await context.newCDPSession(page);
    // Wave-2 AttackReceiptRuntime/CaseFlagsOffNegativeControl: SystemInfo is
    // browser-target-only, so the page session always failed (pid null). Find
    // the browser main process by its unique --user-data-dir in /proc instead.
    pid = findBrowserPid(profile);
    try {
      const v = await session.send('Browser.getVersion');
      product = v.product ?? null;
      version = product;
    } catch {
      version = null;
    }
  } catch {
    // version/pid stay null; recorded in the run record
  } finally {
    if (page) await page.close().catch(() => {});
  }
  const effectiveArgv = pid !== null ? readProcArgv(pid) : null;
  // Only feature-enabling switches count; the profile path itself contains
  // "webmcp" (tabi-r16-webmcp-…), which the old /webmcp/i filter matched.
  const webmcpArgvTokens = (effectiveArgv ?? []).filter((a) =>
    (/^--enable-(blink-)?features=/.test(a) && /webmcp/i.test(a)) || a === '--enable-experimental-web-platform-features');
  let realExecutable = null;
  if (pid !== null) {
    try {
      realExecutable = realpathSync(`/proc/${pid}/exe`);
    } catch {
      realExecutable = null;
    }
  }
  const run = {
    label,
    launchedArgs: args,
    pid,
    effectiveArgv,
    webmcpArgvTokens,
    realExecutable,
    version,
    product,
    profile,
    home,
  };
  launchedRuns.push(run);
  return { context, run };
}

// --- Cases: each returns { pass, expected, expectedProvenance, actual, detail,
// toolsAdded, events, comparison? }. toolsAdded/events are lifted to the case
// record top level so measurement counters bind them directly. ---

async function caseFlagsOffNegativeControl({ chromium, chromiumPath, tmpBase, base, serverPort, blocked }) {
  const { context, run } = await launchChromium(chromium, chromiumPath, tmpBase, [], 'flag-off');
  try {
    await guardLoopback(context, serverPort, blocked);
    const page = await context.newPage();
    const cdp = await attachCdp(context, page);
    let pageClosed = false;
    try {
      await gotoFixture(page, base, 'declarative-form.html');
      await waitFor(() => cdp.toolsAdded.length > 0, 1500);
      const probes = await page.evaluate(() => ({
        documentModelContext: typeof document.modelContext,
        navigatorModelContext: 'modelContext' in navigator,
        isSecureContext: globalThis.isSecureContext,
      }));
      const argvClean = run.pid !== null && Array.isArray(run.effectiveArgv) && run.webmcpArgvTokens.length === 0;
      const pass =
        probes.documentModelContext === 'undefined' &&
        probes.navigatorModelContext === false &&
        cdp.toolsAdded.length === 0 &&
        argvClean;
      return {
        pass,
        expected: {
          webmcpEnable: 'result object (domain presence only — enable returns {} even without flags)',
          documentModelContext: 'undefined',
          navigatorModelContext: 'absent',
          toolsAdded: 0,
          webmcpArgvTokens: 0,
        },
        expectedProvenance: 'harness-specified (PLAN C2 flag-off contract)',
        actual: {
          webmcpEnableResult: cdp.enables['WebMCP.enable'],
          enableSeq: cdp.enableSeq,
          documentModelContext: probes.documentModelContext,
          navigatorModelContext: probes.navigatorModelContext,
          isSecureContext: probes.isSecureContext,
          effectiveArgv: run.effectiveArgv,
          webmcpArgvTokens: run.webmcpArgvTokens,
          issues: cdp.issues,
        },
        toolsAdded: cdp.toolsAdded,
        events: cdp.events,
        detail: pass
          ? `flags off: no document.modelContext, no toolsAdded, effective argv clean (pid ${run.pid})`
          : `docMc=${probes.documentModelContext} navMc=${probes.navigatorModelContext} tools=${cdp.toolsAdded.length} argvTokens=${JSON.stringify(run.webmcpArgvTokens)}`,
      };
    } finally {
      await page.close().then(() => { pageClosed = true; }).catch(() => {});
    }
  } finally {
    await context.close().catch(() => {});
  }
}

async function caseDevtoolsDomainDisabled({ chromium, chromiumPath, tmpBase, base, serverPort, blocked }) {
  const { context, run } = await launchChromium(chromium, chromiumPath, tmpBase, DOMAIN_DISABLED_ARGS, 'domain-disabled');
  try {
    await guardLoopback(context, serverPort, blocked);
    const page = await context.newPage();
    const cdp = await attachCdp(context, page);
    try {
      await gotoFixture(page, base, 'declarative-form.html');
      await waitFor(() => cdp.toolsAdded.length > 0, 1500);
      const probes = await page.evaluate(() => ({
        documentModelContext: typeof document.modelContext,
      }));
      const enableResult = cdp.enables['WebMCP.enable'];
      const enableNotFound = Boolean(enableResult?.error) && /wasn't found|not found/i.test(enableResult.error);
      const pass =
        probes.documentModelContext === 'object' &&
        enableNotFound &&
        cdp.toolsAdded.length === 0;
      return {
        pass,
        expected: {
          documentModelContext: 'object (page API present via blink WebMCP)',
          webmcpEnable: "error 'wasn't found' (DevToolsWebMCPSupport registers the CDP domain)",
          toolsAdded: 0,
        },
        expectedProvenance: 'harness-specified (WebmcpProbeFlags ablation, .ufo/waves/round-16/probes/WebmcpProbeFlags.json)',
        actual: {
          documentModelContext: probes.documentModelContext,
          webmcpEnableResult: enableResult,
          launchedArgs: run.launchedArgs,
          issues: cdp.issues,
        },
        toolsAdded: cdp.toolsAdded,
        events: cdp.events,
        detail: pass
          ? `DevToolsWebMCPSupport disabled: page API present, CDP domain absent (${enableResult?.error})`
          : `docMc=${probes.documentModelContext} enable=${JSON.stringify(enableResult)} tools=${cdp.toolsAdded.length}`,
      };
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    await context.close().catch(() => {});
  }
}

async function caseDeclarativeForm({ context, base, readFixture }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'declarative-form.html');
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const decl = await fixtureDeclaration(page);
    const html = readFixture('declarative-form.html');
    const expected = decl?.expectedTools ?? parseDeclarativeTools(html);
    const cmp = compareTools(expected, cdp.toolsAdded);
    const pass =
      expected.length > 0 &&
      cmp.missing.length === 0 &&
      cmp.fieldMismatches.length === 0 &&
      cmp.unexpected.length === 0;
    return {
      pass,
      expected: {
        tools: expected,
        oracleBasis: 'fixture-declared expectedTools (observed baseline; WPT getTools-declarative-schema shape)',
      },
      expectedProvenance: decl?.expectedTools ? 'fixture __webmcpFixture.expectedTools' : 'harness-parsed declarative HTML',
      actual: {
        toolsAdded: cdp.toolsAdded,
        enable: cdp.enables['WebMCP.enable'],
        issues: cdp.issues,
        issueErrorTypes: issueErrorTypes(cdp.issues),
        getTools: await getToolsSnapshot(page),
      },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `${expected.length} declarative tool(s) observed via WebMCP.toolsAdded`
        : `missing=${cmp.missing.length} fieldMismatches=${cmp.fieldMismatches.length} unexpected=${cmp.unexpected.length}`,
      comparison: cmp,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseImperative({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'imperative.html');
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const decl = await fixtureDeclaration(page);
    const mcProbe = await page.evaluate(() => ({
      documentModelContext: typeof document.modelContext,
      registerTool: typeof document.modelContext?.registerTool,
      getTools: typeof document.modelContext?.getTools,
      provideContext: typeof document.modelContext?.provideContext,
    }));
    const getTools = await getToolsSnapshot(page);
    const expected = decl?.expectedTools ?? [];
    const cmp = compareTools(expected, cdp.toolsAdded);
    const pass =
      mcProbe.documentModelContext === 'object' &&
      expected.length > 0 &&
      cmp.missing.length === 0 &&
      cmp.fieldMismatches.length === 0 &&
      cmp.unexpected.length === 0;
    return {
      pass,
      expected: { tools: expected, documentModelContext: 'object' },
      expectedProvenance: 'fixture __webmcpFixture.expectedTools (registerTool imperative)',
      actual: { toolsAdded: cdp.toolsAdded, modelContext: mcProbe, getTools, issues: cdp.issues },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail:
        expected.length === 0
          ? 'fixture declared no expectedTools (cannot compare)'
          : pass
            ? `${expected.length} imperative tool(s) observed; document.modelContext=${mcProbe.documentModelContext}`
            : `missing=${cmp.missing.length} fieldMismatches=${cmp.fieldMismatches.length} unexpected=${cmp.unexpected.length}`,
      comparison: cmp,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseLifecycle({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'lifecycle.html');
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const decl = await fixtureDeclaration(page);
    const expected = decl?.expectedTools ?? [];
    const actionsRun = [];
    const order = decl?.actionOrder ?? [];
    for (const actionName of order) {
      const beforeRemoved = cdp.toolsRemoved.length;
      const beforeAdded = cdp.toolsAdded.length;
      const outcome = await runFixtureAction(page, actionName);
      const newEvents = await waitFor(
        () => cdp.toolsRemoved.length > beforeRemoved || cdp.toolsAdded.length > beforeAdded,
        WAIT_ACTION_MS,
      );
      actionsRun.push({
        action: actionName,
        ...outcome,
        observedEventsAfterAction: Boolean(newEvents),
        removedAfterAction: cdp.toolsRemoved.slice(beforeRemoved),
        addedAfterAction: cdp.toolsAdded.slice(beforeAdded),
      });
    }
    const expectedRemoved = decl?.expectedRemoved ?? expected.map((t) => t.name);
    const removedNames = cdp.toolsRemoved.map((t) => t.name ?? t);
    const missingRemovals = expectedRemoved.filter((n) => !removedNames.includes(n));
    const addedNames = cdp.toolsAdded.map((t) => t.name);
    const missingAdds = expected.map((e) => e.name).filter((n) => !addedNames.includes(n));
    const getTools = await getToolsSnapshot(page);
    const remainingNames = Array.isArray(getTools) ? getTools.map((t) => t.name) : null;
    const lingering = remainingNames ? expectedRemoved.filter((n) => remainingNames.includes(n)) : [];
    const pass =
      expectedRemoved.length > 0 &&
      missingRemovals.length === 0 &&
      missingAdds.length === 0 &&
      lingering.length === 0;
    return {
      pass,
      expected: {
        toolsAdded: expected.map((t) => t.name),
        toolsRemoved: expectedRemoved,
        basis: 'toolsRemoved events carry {name,frameId} only; attribution relies on action/event sequence above',
      },
      expectedProvenance: 'fixture __webmcpFixture actionOrder + expectedRemoved',
      actual: {
        toolsAdded: addedNames,
        toolsRemoved: removedNames,
        actions: actionsRun,
        getTools,
        issues: cdp.issues,
      },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `toolsRemoved observed for ${expectedRemoved.join(', ')} via actions ${order.join(', ')}`
        : `missingRemovals=[${missingRemovals}] missingAdds=[${missingAdds}] lingering=${JSON.stringify(lingering)} actions=${JSON.stringify(actionsRun.map((a) => a.action))}`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseNavigationClears({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'declarative-form.html');
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const registeredNames = cdp.toolsAdded.map((t) => t.name);
    await gotoFixture(page, base, 'plain.html');
    // Wait the full action window: absence of toolsRemoved is the assertion.
    await waitFor(() => cdp.toolsRemoved.length > 0, WAIT_ACTION_MS);
    const removedNames = cdp.toolsRemoved.map((t) => t.name ?? t);
    const after = await getToolsSnapshot(page);
    const afterNames = Array.isArray(after) ? after.map((t) => t && t.name) : [];
    const stale = registeredNames.filter((n) => afterNames.includes(n));
    // Expectation repaired after the first L1 run (which expected toolsRemoved
    // and failed): Chromium 154 sends no WebMCP.toolsRemoved on cross-document
    // navigation; the DevTools frontend drops a frame's tools when that frame's
    // default execution context is destroyed (devtools-frontend
    // front_end/models/web_mcp/WebMCPModel.ts:192-203 at the 154 DEPS pin
    // 66df492a), and the lane's lifecycle probe observed the same absence.
    const pass = registeredNames.length > 0 && removedNames.length === 0 && Array.isArray(after) && stale.length === 0;
    return {
      pass,
      expected: { toolsRemovedOnNavigate: [], staleToolsInNewDocument: [] },
      expectedProvenance:
        'source oracle: devtools-frontend WebMCPModel.ts:192-203 (pin 66df492a) synthesizes removal on execution-context destruction; ' +
        'corroborated by .ufo/waves/round-16/probes/WebmcpProbeLifecycle.json cross_document_navigation; ' +
        'first L1 run expected toolsRemoved and failed (retained)',
      actual: {
        toolsRemoved: removedNames,
        toolsAddedAfterNavigate: cdp.toolsAdded.slice(registeredNames.length),
        getTools: after,
      },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `navigation to plain.html: no toolsRemoved event; [${registeredNames}] absent from new document getTools`
        : `registered=[${registeredNames}] removed=[${removedNames}] stale=[${stale}]`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseDeclarativeMissingName({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'declarative-missing-name.html');
    // Fair window for the parser to emit a tool or an Audits issue.
    await waitFor(() => cdp.toolsAdded.length > 0 || cdp.issues.length > 0, WAIT_ACTION_MS);
    const errorTypes = issueErrorTypes(cdp.issues);
    const expectedError = 'FormModelContextMissingToolName';
    const getTools = await getToolsSnapshot(page);
    // Cause model (asserted, not optional): no tool registers AND the Audits
    // GenericIssue carries errorType FormModelContextMissingToolName.
    const pass = cdp.toolsAdded.length === 0 && (errorTypes[expectedError] ?? 0) >= 1;
    return {
      pass,
      expected: { toolsAdded: 0, auditsErrorType: expectedError },
      expectedProvenance: 'harness-specified (FormModelContextMissingToolName observed twice on this build)',
      actual: { issues: cdp.issues, issueErrorTypes: errorTypes, getTools },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `no tool registered; Audits errorType ${expectedError} x${errorTypes[expectedError]}`
        : `toolsAdded=${cdp.toolsAdded.length} errorTypes=${JSON.stringify(errorTypes)}`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseModelContextLocation({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'plain.html');
    const probe = await page.evaluate(() => ({
      documentModelContextType: typeof document.modelContext,
      documentModelContextTag: document.modelContext === null || document.modelContext === undefined
        ? String(document.modelContext) : Object.prototype.toString.call(document.modelContext),
      registerToolType: typeof document.modelContext?.registerTool,
      documentOwnProperty: Object.prototype.hasOwnProperty.call(document, 'modelContext'),
      navigatorHasModelContext: 'modelContext' in navigator,
      navigatorModelContextType: typeof navigator.modelContext,
      isSecureContext: globalThis.isSecureContext,
    }));
    // Wave-2 CaseModelContextLocation: typeof null is 'object'; require the
    // real ModelContext object (not own, tagged, with registerTool).
    const pass = probe.documentModelContextType === 'object' &&
      probe.documentModelContextTag === '[object ModelContext]' &&
      probe.registerToolType === 'function' &&
      probe.documentOwnProperty === false &&
      probe.navigatorHasModelContext === false;
    return {
      pass,
      expected: { documentModelContext: 'object (present)', navigatorModelContext: 'absent' },
      expectedProvenance: 'harness-specified (PLAN C2: document.modelContext, not navigator)',
      actual: probe,
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: `document.modelContext=${probe.documentModelContextType} (own=${probe.documentOwnProperty}); 'modelContext' in navigator=${probe.navigatorHasModelContext}; isSecureContext=${probe.isSecureContext}`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseFrameTools({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'frame-parent.html');
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const frameTree = await cdp.session.send('Page.getFrameTree');
    const cdpFrames = [];
    const walk = (node) => {
      cdpFrames.push(node.frame);
      for (const child of node.childFrames ?? []) walk(child);
    };
    walk(frameTree.frameTree);
    const pwFrames = page.frames();
    const perFrame = [];
    for (const pwf of pwFrames) {
      let decl = null;
      try {
        decl = await pwf.evaluate(() => {
          const d = globalThis.__webmcpFixture;
          return d && Array.isArray(d.expectedTools) ? { id: d.id ?? null, expectedTools: d.expectedTools } : null;
        });
      } catch {
        decl = null;
      }
      perFrame.push({ url: pwf.url(), name: pwf.name(), declaration: decl });
    }
    const cdpIdFor = (url) => cdpFrames.find((f) => f.url === url)?.id ?? null;
    // A tool declared in a frame's own expectedTools is attributed to that
    // frame; a parent-declared tool with frame:'child' is attributed to the
    // frame that self-declares the same name, else the first non-parent frame.
    const parentUrl = pwFrames[0]?.url() ?? null;
    const selfDeclared = new Map();
    for (const pf of perFrame) {
      for (const tool of pf.declaration?.expectedTools ?? []) {
        if (!tool.frame) selfDeclared.set(tool.name, pf.url);
      }
    }
    const expectations = [];
    for (const pf of perFrame) {
      for (const tool of pf.declaration?.expectedTools ?? []) {
        if (tool.frame && selfDeclared.has(tool.name)) continue; // attributed to the self-declaring frame
        const targetUrl = tool.frame
          ? selfDeclared.get(tool.name) ?? perFrame.find((f) => f.url !== parentUrl)?.url ?? pf.url
          : pf.url;
        expectations.push({ frameUrl: targetUrl, frameId: cdpIdFor(targetUrl), tool });
      }
    }
    const problems = [];
    for (const exp of expectations) {
      const match = cdp.toolsAdded.find(
        (t) =>
          t.name === exp.tool.name &&
          (exp.tool.description == null || t.description === exp.tool.description) &&
          (exp.tool.inputSchema == null || schemaEquivalent(exp.tool.inputSchema, t.inputSchema)),
      );
      if (!match) {
        problems.push(`tool not observed: ${exp.tool.name} (frame ${exp.frameUrl})`);
        continue;
      }
      if (exp.frameId && match.frameId && match.frameId !== exp.frameId) {
        problems.push(`frameId mismatch for ${exp.tool.name}: expected ${exp.frameId}, got ${match.frameId}`);
      }
      if (exp.frameId && !('frameId' in match)) {
        problems.push(`tool ${exp.tool.name} carries no frameId (expected ${exp.frameId})`);
      }
    }
    const pass = expectations.length > 0 && problems.length === 0;
    return {
      pass,
      expected: { perFrameTools: expectations.map((e) => ({ frame: e.frameUrl, frameId: e.frameId, name: e.tool.name })) },
      expectedProvenance: 'fixture __webmcpFixture.expectedTools per frame (frame marker attribution)',
      actual: {
        cdpFrames: cdpFrames.map((f) => ({ id: f.id, url: f.url })),
        perFrameDeclarations: perFrame,
      },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: problems.length ? problems.join('; ') : `${expectations.length} tool(s) attributed to their declaring frames`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseOpaqueSandboxedIframe({ context, base }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    await gotoFixture(page, base, 'plain.html');
    const before = cdp.toolsAdded.length;
    const report = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const done = (value) => resolve(value);
          window.addEventListener('message', function onMsg(ev) {
            if (ev.data && ev.data.webmcpSandbox) {
              window.removeEventListener('message', onMsg);
              done(ev.data.webmcpSandbox);
            }
          });
          const iframe = document.createElement('iframe');
          iframe.setAttribute('sandbox', 'allow-scripts'); // opaque origin, scripts allowed
          // registerTool returns a Promise in Chromium 154 (fixtures README;
          // first L1 run read only the synchronous path and saw no error), so
          // both a synchronous throw and an asynchronous rejection are recorded.
          iframe.srcdoc = `<!doctype html><script>(function(){
  var out = { mcType: typeof document.modelContext, regType: typeof (document.modelContext && document.modelContext.registerTool), error: null, errorName: null, settled: null };
  var post = function () { parent.postMessage({ webmcpSandbox: out }, '*'); };
  try {
    if (out.regType !== 'function') { post(); return; }
    Promise.resolve(document.modelContext.registerTool({ name: 'sandboxed-tool', description: 'opaque iframe tool', execute: function () { return 'x'; } }))
      .then(function () { out.settled = 'resolved'; post(); },
            function (e) { out.settled = 'rejected'; out.error = String(e); out.errorName = e && e.name ? e.name : null; post(); });
  } catch (e) { out.settled = 'threw'; out.error = String(e); out.errorName = e && e.name ? e.name : null; post(); }
})();<\/script>`;
          document.body.appendChild(iframe);
          setTimeout(() => done({ timeout: true }), 5000);
        }),
    );
    await waitFor(() => cdp.toolsAdded.length > before, 1000);
    const newTools = cdp.toolsAdded.slice(before);
    const sandboxedAdded = newTools.filter((t) => t.name === 'sandboxed-tool');
    const pass =
      report !== null &&
      !report.timeout &&
      report.mcType === 'object' && report.settled === 'rejected' && report.errorName === 'NotAllowedError' &&
      sandboxedAdded.length === 0;
    return {
      pass,
      expected: {
        sandboxedRegistration: 'denied (modelContext absent or registerTool throws; permissions-policy "tools")',
        toolsAddedFromSandbox: 0,
      },
      expectedProvenance: 'harness-specified (WebMCP spec S020 §4.4 permissions policy; probe-observed NotAllowedError)',
      actual: { iframeReport: report, toolsAddedDelta: newTools, issues: cdp.issues },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `opaque sandboxed iframe denied: ${report.errorName ?? `modelContext ${report.mcType}`} (${report.error ?? 'no modelContext'})`
        : `report=${JSON.stringify(report)} sandboxedAdded=${sandboxedAdded.length}`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function caseDataUrlDeclarative({ context, readFixture }) {
  const page = await context.newPage();
  const cdp = await attachCdp(context, page);
  try {
    const html = readFixture('declarative-form.html');
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    await page.goto(dataUrl, { waitUntil: 'load', timeout: 15000 });
    await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS);
    const probe = await page.evaluate(() => ({
      documentModelContext: typeof document.modelContext,
      isSecureContext: globalThis.isSecureContext,
    }));
    // Divergence (recorded, per CriticC2/probe observation on this build):
    // on a data: URL document.modelContext is undefined yet the CDP
    // WebMCP.toolsAdded event still fires.
    const pass = probe.documentModelContext === 'undefined' && cdp.toolsAdded.length >= 1;
    return {
      pass,
      divergence: true,
      expected: { documentModelContext: 'undefined', toolsAdded: '>=1 (event fires despite absent page API — divergence)' },
      expectedProvenance: 'probe-observed divergence (probes/WebmcpProbeSecure.json): page API gated on secure context, CDP event not',
      actual: { ...probe, toolsAdded: cdp.toolsAdded },
      toolsAdded: cdp.toolsAdded,
      events: cdp.events,
      detail: pass
        ? `divergence confirmed: doc.modelContext undefined but ${cdp.toolsAdded.length} tool(s) announced via CDP`
        : `docMc=${probe.documentModelContext} toolsAdded=${cdp.toolsAdded.length}`,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

// --- Driver ---

function failStart(code, message, detail = {}) {
  console.error(`WEBMCP_LOOPBACK_ERROR ${JSON.stringify({ code, message, ...detail })}`);
  process.exit(2);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.chromium)) {
    failStart('chromium_missing', `chromium executable not found: ${args.chromium}`);
  }
  if (!existsSync(args.fixtures) || !statSync(args.fixtures).isDirectory()) {
    failStart('fixtures_missing', `fixtures directory not found: ${args.fixtures}`);
  }

  const pw = resolvePlaywright();
  if (!pw) {
    failStart('playwright_unresolved', `could not resolve playwright ${PLAYWRIGHT_REQUIRED} from global npm candidates`, {
      candidates: candidatePlaywrightDirs(),
    });
  }
  if (pw.wrongVersion) {
    failStart('playwright_version_mismatch', `playwright at ${pw.dir} is ${pw.version}; pin requires ${PLAYWRIGHT_REQUIRED}`);
  }
  const chromium = pw.chromium;

  const fixtureFiles = readdirSync(args.fixtures).filter((name) => name.endsWith('.html')).sort();
  const fixtureInventory = [];
  const fixtureBytes = new Map();
  for (const name of fixtureFiles) {
    const abs = join(args.fixtures, name);
    const text = readFileSync(abs);
    fixtureBytes.set(name, text.toString('utf8'));
    fixtureInventory.push({
      file: name,
      sha256: createHash('sha256').update(text).digest('hex'),
      bytes: text.length,
    });
  }
  const readFixture = (name) => fixtureBytes.get(name) ?? null;
  const fixtureSha256 = (name) => fixtureInventory.find((f) => f.file === name)?.sha256 ?? null;

  const producerSha256 = await sha256File(SCRIPT);
  const executableSha256 = await sha256File(args.chromium);
  const protocol = await fetchProtocolDomain(args.chromium);

  const { server, port, served, denied } = await startFixtureServer(args.fixtures);
  const base = `http://127.0.0.1:${port}`;
  const blocked = [];
  const tmpBase = mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-'));
  const cases = [];
  const findings = [];

  const pushCase = (id, fixtureFile, flagsOn, result, startedAt) => {
    const fixtureRel =
      fixtureFile === 'data:'
        ? 'data: (declarative-form.html bytes)'
        : fixtureFile
          ? `corpus/evidence/round-16/webmcp/fixtures/${fixtureFile}`
          : null;
    const record = {
      id,
      name: id,
      fixture: fixtureRel,
      fixtureFile: fixtureFile === 'data:' ? 'declarative-form.html' : fixtureFile,
      fixtureSha256: fixtureSha256(fixtureFile === 'data:' ? 'declarative-form.html' : fixtureFile),
      status: result.pass ? 'pass' : 'fail',
      expected: result.expected ?? null,
      expectedProvenance: result.expectedProvenance ?? null,
      divergence: result.divergence ?? false,
      actual: result.actual ?? null,
      toolsAdded: result.toolsAdded ?? result.actual?.toolsAdded ?? result.actual?.tools ?? [],
      events: (result.events ?? []).map((e) => e.event),
      eventLog: result.events ?? [],
      detail: result.detail ?? null,
      comparison: result.comparison ?? null,
      durationMs: Date.now() - startedAt,
    };
    if (flagsOn === 'flagged') record.flags = WEBMCP_FEATURE_ARGS;
    else if (flagsOn === 'domain-disabled') record.flags = DOMAIN_DISABLED_ARGS;
    else record.control = 'flag-off';
    cases.push(record);
    if (!result.pass) findings.push({ severity: 'fail', code: 'case_failed', case: id, detail: record.detail });
    return record;
  };

  let flagged = null;
  let runError = null;
  try {
    flagged = await launchChromium(chromium, args.chromium, tmpBase, WEBMCP_FEATURE_ARGS, 'flagged');
    await guardLoopback(flagged.context, port, blocked);

    const shared = { context: flagged.context, base, readFixture };
    const launchShared = {
      chromium,
      chromiumPath: args.chromium,
      tmpBase,
      base,
      serverPort: port,
      blocked,
    };
    const caseDefs = [
      ['flags-off-negative-control', 'declarative-form.html', 'off', () => caseFlagsOffNegativeControl(launchShared)],
      ['devtools-domain-disabled', 'declarative-form.html', 'domain-disabled', () => caseDevtoolsDomainDisabled(launchShared)],
      ['declarative-form-tool', 'declarative-form.html', 'flagged', () => caseDeclarativeForm(shared)],
      ['imperative-model-context', 'imperative.html', 'flagged', () => caseImperative(shared)],
      ['lifecycle-removal', 'lifecycle.html', 'flagged', () => caseLifecycle(shared)],
      ['navigation-clears-tools', 'declarative-form.html', 'flagged', () => caseNavigationClears(shared)],
      ['declarative-missing-name', 'declarative-missing-name.html', 'flagged', () => caseDeclarativeMissingName(shared)],
      ['model-context-location', 'plain.html', 'flagged', () => caseModelContextLocation(shared)],
      ['frame-tools', 'frame-parent.html', 'flagged', () => caseFrameTools(shared)],
      ['opaque-sandboxed-iframe', 'plain.html', 'flagged', () => caseOpaqueSandboxedIframe(shared)],
      ['data-url-declarative', 'data:', 'flagged', () => caseDataUrlDeclarative(shared)],
    ];

    for (const [id, fixture, flagsMode, fn] of caseDefs) {
      const startedAt = Date.now();
      try {
        const result = await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`case timeout after ${CASE_TIMEOUT_MS}ms`)), CASE_TIMEOUT_MS),
          ),
        ]);
        pushCase(id, fixture, flagsMode, result, startedAt);
      } catch (error) {
        pushCase(
          id,
          fixture,
          flagsMode,
          { pass: false, expected: null, actual: null, detail: `case error: ${String(error?.message ?? error)}` },
          startedAt,
        );
      }
      console.log(`WEBMCP_CASE id=${id} status=${cases[cases.length - 1].status}`);
    }
  } catch (error) {
    runError = error;
  }

  // Missing-case records for any expected id that never produced a record.
  for (const id of CASE_IDS) {
    if (!cases.some((c) => c.id === id)) {
      cases.push({
        id,
        name: id,
        status: 'missing',
        expected: null,
        actual: null,
        toolsAdded: [],
        events: [],
        eventLog: [],
        detail: 'case never produced an observation (run aborted earlier)',
      });
      findings.push({ severity: 'fail', code: 'case_missing', case: id });
    }
  }

  // Teardown + closure proof: contexts closed, server drained, port refuses,
  // temp dirs removed, no surviving process references this run's temp base.
  if (flagged?.context) await flagged.context.close().catch(() => {});
  await closeServer(server);
  const portProbe = await probePortClosed(port);
  const pidChecks = launchedRuns.map((r) => {
    // Wave-2 AttackReceiptClosure: an unknown pid is not a stop proof.
    let gone = null;
    if (r.pid !== null) {
      try {
        process.kill(r.pid, 0);
        gone = !existsSync(`/proc/${r.pid}`);
      } catch {
        gone = true;
      }
    }
    return { label: r.label, pid: r.pid, gone };
  });
  const profileChecks = launchedRuns
    .flatMap((r) => [r.profile, r.home])
    .filter(Boolean)
    .map((p) => ({ path: p, removed: true }));
  rmSync(tmpBase, { recursive: true, force: true });
  for (const check of profileChecks) check.removed = !existsSync(check.path);
  const strays = findProcessesUsing(tmpBase);
  const stopProofs = [
    ...pidChecks.map((c) => c.gone),
    ...profileChecks.map((c) => c.removed),
    portProbe.refused === true,
    strays.length === 0,
  ];
  const closure = {
    pids: pidChecks,
    tempPaths: profileChecks,
    server: { portRefusedAfterClose: portProbe, note: 'any semantics — this is the drain proof, not the stop proof' },
    strayProcesses: strays,
    everyStopProof: stopProofs.length > 0 && stopProofs.every(Boolean),
  };
  if (!closure.everyStopProof) {
    findings.push({ severity: 'fail', code: 'closure_incomplete', detail: JSON.stringify(closure) });
  }
  if (blocked.length > 0) {
    findings.push({ severity: 'info', code: 'external_requests_blocked', detail: `${blocked.length} request(s) aborted`, urls: blocked });
  }
  if (!protocol.ok) {
    findings.push({ severity: 'info', code: 'protocol_domain_unavailable', detail: protocol.reason ?? 'no WebMCP domain captured' });
  }

  const passed = cases.filter((c) => c.status === 'pass').length;
  const failed = cases.filter((c) => c.status === 'fail').length;
  const missing = cases.filter((c) => c.status === 'missing').length;
  const ids = cases.map((c) => c.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  const caseSet = {
    expected: CASE_IDS.length,
    expectedIds: CASE_IDS,
    ran: cases.length - missing,
    passed,
    failed,
    missing,
    duplicates,
    caseSetOk: missing === 0 && duplicates.length === 0 && cases.length === CASE_IDS.length,
  };
  const verdict = runError ? 'could_not_evaluate' : failed === 0 && missing === 0 && closure.everyStopProof ? 'pass' : 'fail';
  if (runError) findings.push({ severity: 'fail', code: 'run_aborted', detail: String(runError?.message ?? runError) });

  const realBinarySha = launchedRuns.find((r) => r.realExecutable)
    ? await sha256FileBestEffort(launchedRuns.find((r) => r.realExecutable).realExecutable)
    : null;

  const receipt = {
    schema: 'tabi-round16-webmcp-v1',
    verdict,
    generatedAt: new Date().toISOString(),
    producer: { path: PRODUCER_REL, sha256: producerSha256 },
    producerSha256,
    runtime: {
      observed: {
        chromium: {
          launchPath: args.chromium,
          launchSha256: executableSha256,
          realExecutable: launchedRuns.find((r) => r.realExecutable)?.realExecutable ?? null,
          realExecutableSha256: realBinarySha,
          product: flagged?.run.product ?? null,
          version: flagged?.run.version ?? null,
          versionSource: 'CDP Browser.getVersion on flagged run',
        },
        playwright: pw.version,
        playwrightDir: relative(ROOT, pw.dir).startsWith('..') ? pw.dir : relative(ROOT, pw.dir),
        node: process.versions.node,
      },
      pinned: {
        note: 'pin values live in corpus/evidence/round-16/webmcp/runtime-pin.json (peer-owned); this harness does not copy them',
        requiredPlaywright: PLAYWRIGHT_REQUIRED,
      },
    },
    runs: launchedRuns.map((r) => ({
      label: r.label,
      launchedArgs: r.launchedArgs,
      pid: r.pid,
      effectiveArgv: r.effectiveArgv,
      webmcpArgvTokens: r.webmcpArgvTokens,
      realExecutable: r.realExecutable,
      version: r.version,
    })),
    flags: {
      enabled: WEBMCP_FEATURE_ARGS,
      controlArgs: [],
      domainDisabledArgs: DOMAIN_DISABLED_ARGS,
      browserArgsAll: [HOST_RESOLVER_DENY],
      enableSemantics: 'WebMCP.enable result is domain-presence evidence only; it returns {} even without flags',
    },
    protocolDomain: protocol,
    safety: {
      loopbackOnly: true,
      claimScope: 'page-level exact-origin abort of HTTP(S), beacon and page WebSocket requests; WebRTC UDP/TCP, WebTransport and SharedWorker traffic are NOT confined (wave-2 SentinelHarness H1); no claim of global host no-egress',
      toolInvocation: 'none — page-declared tool payloads are untrusted data; no invokeTool/cancelInvocation/executeTool/submit',
      serviceWorkers: 'block',
      webSockets: 'denied via context.routeWebSocket',
      hostResolverRules: HOST_RESOLVER_DENY,
      chromiumSandbox: true,
      minimalEnv: 'HOME/XDG_CONFIG_HOME redirected to temp dir (isolates Arch chromium-flags.conf)',
      dataNavigationExemption: 'top-level data: navigations admitted for the data-url divergence case only',
    },
    server: { bind: '127.0.0.1', port, served, deniedPaths: denied },
    loopback: {
      externalRequestsBlocked: blocked,
      externalRequestCount: blocked.length,
    },
    fixtures: fixtureInventory,
    cases,
    summary: {
      cases: cases.length,
      passed,
      failed,
      missing,
      caseSet,
    },
    findings,
    closure,
  };

  const body = `${JSON.stringify(receipt, null, 2)}\n`;
  const outStat = lstatSync(args.out, { throwIfNoEntry: false });
  if (outStat) {
    if (outStat.isSymbolicLink() || !outStat.isFile()) {
      failStart('receipt_not_regular', `refusing to write over non-regular file at ${args.out}`);
    }
    const existing = readFileSync(args.out, 'utf8');
    if (existing !== body && !args.force) {
      failStart('receipt_differs', `refusing to overwrite differing receipt bytes at ${args.out} (use --force to replace)`, {
        existingSha256: createHash('sha256').update(existing).digest('hex'),
        candidateSha256: createHash('sha256').update(body).digest('hex'),
      });
    }
  }
  mkdirSync(dirname(args.out), { recursive: true });
  const tmp = join(dirname(args.out), `.receipt.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(tmp, body, { flag: 'wx' });
  renameSync(tmp, args.out);

  console.log(
    `WEBMCP_LOOPBACK verdict=${verdict} cases=${cases.length} passed=${passed} failed=${failed} missing=${missing} out=${args.out}`,
  );
  process.exit(verdict === 'pass' ? 0 : verdict === 'fail' ? 1 : 2);
}

const watchdog = setTimeout(() => {
  console.error('WEBMCP_LOOPBACK_ERROR {"code":"run_timeout","message":"hard run timeout"}');
  process.exit(2);
}, RUN_TIMEOUT_MS);
watchdog.unref();

main().catch((error) => {
  console.error(`WEBMCP_LOOPBACK_ERROR ${JSON.stringify({ code: 'unhandled', message: String(error?.message ?? error) })}`);
  process.exit(2);
});
