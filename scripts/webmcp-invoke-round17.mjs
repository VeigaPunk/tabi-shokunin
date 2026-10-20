#!/usr/bin/env node
// Round-17 WebMCP invocation harness (claim C2: tool invocation as committed
// evidence).
//
// Serves corpus/evidence/round-17/webmcp-invoke/fixtures/*.html on
// 127.0.0.1:<ephemeral>, launches /usr/bin/chromium headless under a fresh temp
// profile with the round-16 WebMCP feature flags, attaches a raw CDP WebSocket
// to each page target (Playwright owns the page and the page-level loopback
// route guard; the raw socket records the exact CDP frames), and drives
// WebMCP.invokeTool for the eleven PLAN C2 cases.
//
// What is recorded per case:
//   - the raw CDP payloads: every frame sent and received on the case's raw
//     session (Page.enable / WebMCP.enable / Page.getFrameTree /
//     WebMCP.invokeTool / WebMCP.cancelInvocation and the WebMCP.toolsAdded /
//     toolsRemoved / toolInvoked / toolResponded events), verbatim with message
//     ids, protocol error codes and arrival order;
//   - the page-side observation: what each tool's `execute` received (window
//     state read back through page.evaluate) and, independently, a loopback
//     server ledger entry the fixture's execute POSTs to /__ledger (JSON body,
//     including the input it received);
//   - a predicate fixed in the harness source before the run (description plus
//     the sha256 of the predicate function's source), never derived from the
//     observed payload.
//
// Controls (not part of the eleven cases): invoke-before-enable,
// invoke-cancel, invoke-declarative-navigation-result, invoke-domain-disabled.
// The invoke-navigation-pending CASE records the imperative dangling
// observation (non-agent navigation, no toolResponded within an explicit
// window); the declarative cross-document completion is the separate control.
//
// Confinement: fixture origin http://127.0.0.1:<port> only; Playwright's route
// guard aborts and records every page request to any other origin, WebSockets
// are denied and service workers blocked; --host-resolver-rules denies
// browser-level DNS outside 127.0.0.1. The CDP control channel is a Node
// WebSocket to 127.0.0.1:<ephemeral DevTools port> opened with
// --remote-debugging-port=0; that port belongs to the run and is closed when
// the browser exits. Page-declared tool names, descriptions, schemas and
// outputs are untrusted target data: they are recorded, never interpreted as
// instructions.
//
// Usage:
//   node scripts/webmcp-invoke-round17.mjs [--out PATH] [--fixtures DIR]
//                                          [--chromium PATH] [--force]
//
// Defaults: --out corpus/evidence/round-17/webmcp-invoke/receipt.json,
//           --fixtures corpus/evidence/round-17/webmcp-invoke/fixtures,
//           --chromium /usr/bin/chromium.
// Verdict/exit: pass→0, fail→1, could_not_evaluate→2 (also for a refused
// overwrite of differing receipt bytes unless --force).
import { createHash, randomBytes } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer, get as httpGet } from 'node:http';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');
const WEBMCP_DIR = join(ROOT, 'corpus', 'evidence', 'round-17', 'webmcp-invoke');
const DEFAULT_OUT = join(WEBMCP_DIR, 'receipt.json');
const DEFAULT_FIXTURES = join(WEBMCP_DIR, 'fixtures');
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const PRODUCER_REL = 'scripts/webmcp-invoke-round17.mjs';
const PLAYWRIGHT_REQUIRED = '1.64.0';

// Same feature flags as the round-16 flagged launch (PLAN C2: "flags exactly as
// r16's flagged run unless a case is a control").
const WEBMCP_FEATURE_ARGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const DOMAIN_DISABLED_ARGS = [
  '--enable-blink-features=WebMCP',
  '--disable-features=DevToolsWebMCPSupport',
];
const HOST_RESOLVER_DENY = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';
const DEVTOOLS_PORT_ARG = '--remote-debugging-port=0';
const WAIT_EVENT_MS = 5000;
const CASE_TIMEOUT_MS = 60000;
const RUN_TIMEOUT_MS = 420000;

// Required case ids (PLAN C2, counter-owned). Anything not reached gets a
// status:'missing' record so a vacuous short run cannot read as clean.
const CASE_IDS = [
  'invoke-imperative-success',
  'invoke-imperative-throws',
  'invoke-imperative-rejects',
  'invoke-unknown-tool',
  'invoke-input-schema-mismatch',
  'invoke-declarative-form',
  'invoke-after-unregister',
  'invoke-concurrent-ids',
  'invoke-flags-off-control',
  'invoke-iframe-frameid',
  'invoke-navigation-pending',
];

const launchedRuns = [];
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

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
      console.log('node scripts/webmcp-invoke-round17.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--force]');
      process.exit(0);
    } else {
      console.error(`webmcp-invoke: unknown argument ${arg}`);
      process.exit(2);
    }
  }
  return args;
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256Text(text) {
  return createHash('sha256').update(text).digest('hex');
}

function sha256FileBestEffort(path) {
  try {
    return sha256Buffer(readFileSync(path));
  } catch {
    return null;
  }
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

function jsonParseSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function newNonce(label) {
  return `${label}-${randomBytes(6).toString('hex')}`;
}

// --- Playwright resolution (same pattern as scripts/webmcp-loopback-round16.mjs) ---

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
  let entries = [];
  try {
    entries = readdirSync('/proc');
  } catch {
    return hits;
  }
  for (const entry of entries) {
    if (!/^\d+$/.test(entry)) continue;
    const argv = readProcArgv(Number(entry));
    if (argv && argv.join(' ').includes(marker)) hits.push({ pid: Number(entry), argv });
  }
  return hits;
}

function findBrowserPid(profile) {
  const marker = `--user-data-dir=${profile}`;
  const mains = findProcessesUsing(marker).filter(
    (hit) => hit.argv.includes(marker) && !hit.argv.some((a) => a.startsWith('--type=')),
  );
  return mains.length === 1 ? mains[0].pid : null;
}

// --- Fixture server: loopback bind (asserted), fixtures-dir confinement,
// GET/HEAD only, no symlinks, no traversal, plus the /__ledger sink that
// fixtures' execute functions report their entry observation to. ---

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
  const ledger = [];
  const server = createServer((req, res) => {
    let parsedUrl = null;
    try {
      parsedUrl = new URL(req.url, 'http://127.0.0.1');
    } catch {
      denied.push(`<undecodable:${req.url}>`);
      res.writeHead(400).end('bad request');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(parsedUrl.pathname);
    } catch {
      denied.push(`<undecodable:${req.url}>`);
      res.writeHead(400).end('bad request');
      return;
    }
    if (pathname === '/__ledger') {
      // Server-side observation of what execute received, independent of the
      // page's own window state (a CDP readback the page could otherwise
      // doctor). Fixtures POST a JSON body; arbitrary keys are preserved.
      const finish = (payload) => {
        ledger.push({ seq: ledger.length + 1, at: Date.now(), ...(payload && typeof payload === 'object' ? payload : {}) });
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }).end('ok');
      };
      if (req.method === 'POST') {
        let data = '';
        let oversized = false;
        req.on('data', (chunk) => {
          data += chunk;
          if (data.length > 65536) {
            oversized = true;
            req.destroy();
          }
        });
        req.on('end', () => {
          if (oversized) return;
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = { raw: data.slice(0, 2048) };
          }
          finish(parsed);
        });
        return;
      }
      finish({
        tool: parsedUrl.searchParams.get('tool'),
        phase: parsedUrl.searchParams.get('phase'),
        nonce: parsedUrl.searchParams.get('nonce'),
      });
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end('method not allowed');
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
    res.end(readFileSync(abs));
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
      resolvePromise({ server, port: address.port, served, denied, ledger });
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

// --- Page-level loopback confinement (same contract as round 16: exact-origin
// abort of HTTP(S), beacon and page WebSocket requests; no claim of global
// host no-egress). ---

async function guardLoopback(context, serverPort, blocked) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
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

// --- Raw CDP client. The page-target socket records every frame; sends are
// correlated by message id and reject with the protocol error object. ---

function waitDevToolsPort(profile, timeoutMs) {
  return new Promise((resolvePromise) => {
    const deadline = Date.now() + timeoutMs;
    const poll = () => {
      try {
        const text = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').trim();
        const port = Number(text.split('\n')[0]);
        if (Number.isInteger(port) && port > 0) {
          resolvePromise(port);
          return;
        }
      } catch {
        /* not written yet */
      }
      if (Date.now() >= deadline) {
        resolvePromise(null);
        return;
      }
      setTimeout(poll, 50);
    };
    poll();
  });
}

async function fetchJson(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function connectRawCdp(wsUrl, t0) {
  return new Promise((resolvePromise, rejectPromise) => {
    const ws = new WebSocket(wsUrl);
    const frames = [];
    const pending = new Map();
    let nextId = 0;
    let seq = 0;
    const record = (dir, frame) => {
      const entry = { seq: ++seq, dir, atMs: Date.now() - t0, frame };
      frames.push(entry);
      return entry;
    };
    ws.addEventListener('message', (event) => {
      let frame;
      try {
        frame = JSON.parse(event.data);
      } catch {
        frame = { raw: String(event.data) };
      }
      record('in', frame);
      if (frame.id !== undefined && frame.id !== null && pending.has(frame.id)) {
        const handler = pending.get(frame.id);
        pending.delete(frame.id);
        handler(frame);
      }
    });
    ws.addEventListener('open', () => {
      const send = (method, params = {}) =>
        new Promise((resolveSend, rejectSend) => {
          const id = ++nextId;
          const frame = { id, method, params };
          record('out', frame);
          const timer = setTimeout(() => {
            pending.delete(id);
            rejectSend(Object.assign(new Error(`CDP timeout after 10000ms: ${method}`), { timeout: true }));
          }, 10000);
          pending.set(id, (reply) => {
            clearTimeout(timer);
            if (reply.error) {
              const error = new Error(`${method}: ${reply.error.message}`);
              error.protocolError = reply.error;
              error.reply = reply;
              rejectSend(error);
            } else {
              resolveSend(reply.result);
            }
          });
          try {
            ws.send(JSON.stringify(frame));
          } catch (error) {
            clearTimeout(timer);
            pending.delete(id);
            rejectSend(error);
          }
        });
      resolvePromise({
        ws,
        frames,
        send,
        close: () => {
          try {
            ws.close();
          } catch {
            /* already closed */
          }
        },
      });
    });
    ws.addEventListener('error', (event) => rejectPromise(new Error(`raw CDP websocket error: ${event?.message ?? 'unknown'}`)));
  });
}

async function findPageTarget(devtoolsPort, pageUrl) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const targets = await fetchJson(`http://127.0.0.1:${devtoolsPort}/json/list`).catch(() => null);
    if (Array.isArray(targets)) {
      const exact = targets.filter((t) => t.type === 'page' && t.url === pageUrl && t.webSocketDebuggerUrl);
      if (exact.length === 1) return exact[0];
      const pages = targets.filter((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (exact.length === 0 && pages.length === 1) return pages[0];
    }
    await sleep(50);
  }
  return null;
}

// --- Launch: persistent context (temp profile), minimal env, remote debugging
// port for the raw CDP recorder, then browser pid + real binary from /proc. ---

async function launchChromium(chromium, chromiumPath, tmpBase, extraArgs, label, t0) {
  const profile = mkdtempSync(join(tmpBase, `${label}-profile-`));
  const home = mkdtempSync(join(tmpBase, `${label}-home-`));
  const args = [HOST_RESOLVER_DENY, DEVTOOLS_PORT_ARG, ...extraArgs];
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: chromiumPath,
    headless: true,
    args,
    env: minimalBrowserEnv(home),
    serviceWorkers: 'block',
    chromiumSandbox: true,
  });
  const devtoolsPort = await waitDevToolsPort(profile, 15000);
  const pid = findBrowserPid(profile);
  let versionInfo = null;
  if (devtoolsPort !== null) {
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${devtoolsPort}/json/version`);
    } catch {
      versionInfo = null;
    }
  }
  const effectiveArgv = pid !== null ? readProcArgv(pid) : null;
  // Only feature-enabling switches count; the profile path itself contains the
  // run label, which is not a flag.
  const webmcpArgvTokens = (effectiveArgv ?? []).filter(
    (a) => (/^--enable-(blink-)?features=/.test(a) && /webmcp/i.test(a)) || a === '--enable-experimental-web-platform-features',
  );
  // Chromium honours the LAST occurrence of each --*-features switch only
  // (round-16 lesson: two --enable-features instances make the first a no-op).
  // Record which instance wins for every feature-carrying flag name so the
  // controls can prove our tokens are the last occurrence on the effective
  // command line, with Playwright's own injected switches counted.
  const lastSwitchValue = (name) => {
    const hits = (effectiveArgv ?? []).filter((a) => a.startsWith(`--${name}=`));
    return hits.length ? hits[hits.length - 1] : null;
  };
  const featureSwitches = {
    note: 'Chromium applies only the last occurrence of each --*-features flag name; audited from /proc argv',
    lastEnableFeatures: lastSwitchValue('enable-features'),
    lastEnableBlinkFeatures: lastSwitchValue('enable-blink-features'),
    lastDisableFeatures: lastSwitchValue('disable-features'),
    webmcpInLastEnable: /webmcp/i.test(lastSwitchValue('enable-features') ?? '') || /webmcp/i.test(lastSwitchValue('enable-blink-features') ?? ''),
    devtoolsSupportInLastDisable: /devtoolswebmcpsupport/i.test(lastSwitchValue('disable-features') ?? ''),
    counts: {
      enableFeatures: (effectiveArgv ?? []).filter((a) => a.startsWith('--enable-features=')).length,
      enableBlinkFeatures: (effectiveArgv ?? []).filter((a) => a.startsWith('--enable-blink-features=')).length,
      disableFeatures: (effectiveArgv ?? []).filter((a) => a.startsWith('--disable-features=')).length,
    },
  };
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
    argv: effectiveArgv,
    webmcpArgvTokens,
    featureSwitches,
    realExecutable,
    realExecutableSha256: realExecutable ? sha256FileBestEffort(realExecutable) : null,
    version: versionInfo?.Browser ?? null,
    product: versionInfo?.Browser ?? null,
    userAgent: versionInfo?.['User-Agent'] ?? null,
    devtoolsPort,
    profile,
    home,
    gone: null,
  };
  launchedRuns.push(run);
  return { context, run };
}

// --- Case plumbing ---

function eventRecords(raw, method, predicate, sinceIndex = 0) {
  return raw.frames
    .slice(sinceIndex)
    .filter((entry) => entry.dir === 'in' && entry.frame && entry.frame.method === method && (!predicate || predicate(entry.frame.params)));
}

function eventParams(raw, method, predicate, sinceIndex = 0) {
  const hit = eventRecords(raw, method, predicate, sinceIndex)[0];
  return hit ? hit.frame.params : null;
}

async function waitFor(predicate, timeoutMs, intervalMs = 50) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await sleep(intervalMs);
  }
  return predicate();
}

function waitEvent(raw, method, predicate, timeoutMs = WAIT_EVENT_MS, sinceIndex = 0) {
  return waitFor(() => eventParams(raw, method, predicate, sinceIndex), timeoutMs);
}

function waitTool(raw, name, timeoutMs = WAIT_EVENT_MS) {
  return waitFor(
    () =>
      raw.frames.find(
        (entry) =>
          entry.dir === 'in' &&
          entry.frame?.method === 'WebMCP.toolsAdded' &&
          (entry.frame.params?.tools ?? []).some((tool) => tool.name === name),
      ),
    timeoutMs,
  );
}

function waitToolRemoved(raw, name, timeoutMs = WAIT_EVENT_MS) {
  return waitFor(
    () =>
      raw.frames.find(
        (entry) =>
          entry.dir === 'in' &&
          entry.frame?.method === 'WebMCP.toolsRemoved' &&
          (entry.frame.params?.tools ?? []).some((tool) => tool.name === name),
      ),
    timeoutMs,
  );
}

async function cdpInvoke(raw, frameId, toolName, input) {
  const params = { frameId, toolName, input };
  try {
    const result = await raw.send('WebMCP.invokeTool', params);
    return {
      request: { method: 'WebMCP.invokeTool', params },
      result: result ?? null,
      invocationId: result?.invocationId ?? null,
      error: null,
    };
  } catch (error) {
    return {
      request: { method: 'WebMCP.invokeTool', params },
      result: null,
      invocationId: null,
      error: error.protocolError ?? { code: null, message: String(error?.message ?? error) },
    };
  }
}

async function pageObservation(page) {
  try {
    return await page.evaluate(() => {
      if (!globalThis.__obs) return null;
      return JSON.parse(JSON.stringify(globalThis.__obs));
    });
  } catch {
    return null;
  }
}

async function frameObservation(frame) {
  try {
    return await frame.evaluate(() => {
      if (!globalThis.__obs) return null;
      return JSON.parse(JSON.stringify(globalThis.__obs));
    });
  } catch {
    return null;
  }
}

async function attachCase(machine, base, fixtureFile) {
  const { context, run } = machine;
  const page = await context.newPage();
  await page.goto(`${base}/${fixtureFile}`, { waitUntil: 'load', timeout: 15000 });
  const target = await findPageTarget(run.devtoolsPort, page.url());
  if (!target) throw new Error(`no CDP page target found for ${page.url()} (devtools port ${run.devtoolsPort})`);
  const raw = await connectRawCdp(target.webSocketDebuggerUrl, Date.now());
  await page.evaluate(() => globalThis.__ready ?? null).catch(() => null);
  return { page, raw };
}

function closeCase(opened) {
  try {
    opened.raw.close();
  } catch {
    /* already closed */
  }
  return opened.page.close().catch(() => {});
}

function buildCaseRecord({ id, fixtureFile, fixtureSha256, startedAt, description, predicate, expected, expectedProvenance, observations, divergence = false, detail = null }) {
  const predicatePassed = Boolean(predicate(observations));
  return {
    id,
    name: id,
    status: predicatePassed ? 'pass' : 'fail',
    fixture: `corpus/evidence/round-17/webmcp-invoke/fixtures/${fixtureFile}`,
    fixtureFile,
    fixtureSha256,
    predicate: {
      description,
      fnSha256: sha256Text(predicate.toString()),
      fixedBeforeRun: true,
      source: 'scripts/webmcp-invoke-round17.mjs (case predicate; hashed above)',
    },
    expected,
    expectedProvenance,
    divergence,
    actual: observations,
    detail: detail ?? (predicatePassed ? 'predicate satisfied' : 'predicate not satisfied'),
    durationMs: Date.now() - startedAt,
  };
}

// --- Driver ---

function failStart(code, message, detail = {}) {
  console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code, message, ...detail })}`);
  process.exit(2);
}

async function main() {
  const t0 = Date.now();
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.chromium)) {
    failStart('chromium_missing', `chromium executable not found: ${args.chromium}`);
  }
  if (!existsSync(args.fixtures) || !statSync(args.fixtures).isDirectory()) {
    failStart('fixtures_missing', `fixtures directory not found: ${args.fixtures}`);
  }
  const pw = resolvePlaywright();
  if (!pw) {
    failStart('playwright_unresolved', `could not resolve playwright ${PLAYWRIGHT_REQUIRED}`, {
      candidates: candidatePlaywrightDirs(),
    });
  }
  if (pw.wrongVersion) {
    failStart('playwright_version_mismatch', `playwright at ${pw.dir} is ${pw.version}; pin requires ${PLAYWRIGHT_REQUIRED}`);
  }
  const chromium = pw.chromium;

  const fixtureFiles = readdirSync(args.fixtures).filter((name) => name.endsWith('.html')).sort();
  const fixtureInventory = [];
  for (const name of fixtureFiles) {
    const bytes = readFileSync(join(args.fixtures, name));
    fixtureInventory.push({ file: name, sha256: sha256Buffer(bytes), bytes: bytes.length });
  }
  const fixtureSha256 = (name) => fixtureInventory.find((f) => f.file === name)?.sha256 ?? null;

  const producerSha256 = sha256FileBestEffort(SCRIPT);
  const launchSha256 = sha256FileBestEffort(args.chromium);
  const { server, port, served, denied, ledger } = await startFixtureServer(args.fixtures);
  const base = `http://127.0.0.1:${port}`;
  const blocked = [];
  const tmpBase = mkdtempSync(join(tmpdir(), 'tabi-r17-webmcp-invoke-'));
  const cases = [];
  const controls = [];
  const findings = [];
  const contexts = [];
  let runError = null;

  const pushCaseRecord = (record) => {
    cases.push(record);
    if (record.status !== 'pass') {
      findings.push({ severity: 'fail', code: 'case_failed', case: record.id, detail: record.detail });
    }
  };

  const withCase = async ({ run, id, fixtureFile, webmcp = true, body }) => {
    const startedAt = Date.now();
    let opened = null;
    let caseStart = 0;
    try {
      opened = await attachCase(run, base, fixtureFile);
      caseStart = opened.raw.frames.length;
      await opened.raw.send('Page.enable');
      const enable = webmcp ? await opened.raw.send('WebMCP.enable') : null;
      const tree = await opened.raw.send('Page.getFrameTree');
      const mainFrameId = tree.frameTree.frame.id;
      const result = await Promise.race([
        body({ page: opened.page, raw: opened.raw, mainFrameId, enable, caseStart }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`case timeout after ${CASE_TIMEOUT_MS}ms`)), CASE_TIMEOUT_MS)),
      ]);
      const caseFrames = opened.raw.frames.slice(caseStart);
      const record = buildCaseRecord({
        id,
        fixtureFile,
        fixtureSha256: fixtureSha256(fixtureFile),
        startedAt,
        ...result,
      });
      record.cdp = {
        rawPayloadNote:
          'Verbatim CDP JSON frames on the case raw session: out = requests exactly as sent (id/method/params), in = responses (id/result or id/error) and events (method/params), ordered by seq. Messages are the page-target session; the websocket URL is 127.0.0.1:<ephemeral DevTools port> owned by this run.',
        enable,
        mainFrameId,
        frames: caseFrames,
      };
      record.events = caseFrames
        .filter((entry) => entry.dir === 'in' && entry.frame?.method?.startsWith('WebMCP.'))
        .map((entry) => entry.frame.method);
      record.eventLog = caseFrames
        .filter((entry) => entry.dir === 'in' && entry.frame?.method?.startsWith('WebMCP.'))
        .map((entry) => ({ seq: entry.seq, atMs: entry.atMs, method: entry.frame.method, params: entry.frame.params }));
      record.toolsAdded = caseFrames
        .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'WebMCP.toolsAdded')
        .flatMap((entry) => entry.frame.params?.tools ?? []);
      pushCaseRecord(record);
    } catch (error) {
      pushCaseRecord(
        buildCaseRecord({
          id,
          fixtureFile,
          fixtureSha256: fixtureSha256(fixtureFile),
          startedAt,
          description: 'case body did not complete (recorded as fail)',
          predicate: () => false,
          expected: null,
          expectedProvenance: null,
          observations: { error: String(error?.stack ?? error) },
          detail: `case error: ${String(error?.message ?? error)}`,
        }),
      );
    } finally {
      if (opened) await closeCase(opened);
    }
    console.log(`WEBMCP_INVOKE_CASE id=${id} status=${cases[cases.length - 1].status}`);
  };

  const withControl = async ({ run, id, fixtureFile, webmcp = true, description, expected, predicate, body }) => {
    const startedAt = Date.now();
    let opened = null;
    let caseStart = 0;
    try {
      opened = await attachCase(run, base, fixtureFile);
      caseStart = opened.raw.frames.length;
      await opened.raw.send('Page.enable');
      const enable = webmcp ? await opened.raw.send('WebMCP.enable') : null;
      const tree = await opened.raw.send('Page.getFrameTree');
      const mainFrameId = tree.frameTree.frame.id;
      const observations = await body({ page: opened.page, raw: opened.raw, mainFrameId, enable, caseStart });
      const passed = Boolean(predicate(observations));
      const caseFrames = opened.raw.frames.slice(caseStart);
      controls.push({
        id,
        supplementary: true,
        status: passed ? 'pass' : 'fail',
        fixtureFile,
        fixtureSha256: fixtureSha256(fixtureFile),
        predicate: { description, fnSha256: sha256Text(predicate.toString()) },
        expected,
        actual: observations,
        cdp: { frames: caseFrames },
        durationMs: Date.now() - startedAt,
      });
      if (!passed) findings.push({ severity: 'info', code: 'control_unexpected', control: id });
    } catch (error) {
      controls.push({
        id,
        supplementary: true,
        status: 'fail',
        fixtureFile,
        error: String(error?.stack ?? error),
        durationMs: Date.now() - startedAt,
      });
    } finally {
      if (opened) await closeCase(opened);
    }
    console.log(`WEBMCP_INVOKE_CONTROL id=${id} status=${controls[controls.length - 1].status}`);
  };

  let flagged = null;
  let flagOff = null;
  let domainDisabled = null;

  try {
    flagged = await launchChromium(chromium, args.chromium, tmpBase, WEBMCP_FEATURE_ARGS, 'flagged', t0);
    contexts.push(flagged);
    if (!Number.isInteger(flagged.run.pid) || flagged.run.pid <= 0 || flagged.run.devtoolsPort === null) {
      throw new Error(`flagged launch missing pid (${flagged.run.pid}) or devtools port (${flagged.run.devtoolsPort})`);
    }
    await guardLoopback(flagged.context, port, blocked);

    // --- Case 1: invoke-imperative-success ---
    await withCase({
      run: flagged,
      id: 'invoke-imperative-success',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        const ready = await page.evaluate(() => globalThis.__ready).catch(() => null);
        await waitTool(raw, 'echo');
        const nonce = newNonce('success');
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', { text: nonce });
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        const invokedRec = eventRecords(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart)[0] ?? null;
        const respondedRec = eventRecords(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, caseStart)[0] ?? null;
        const observations = await pageObservation(page);
        await waitFor(() => ledger.some((e) => e.tool === 'echo' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'echo' && e.nonce === nonce);
        return {
          description:
            'invokeTool(frameId=main, toolName=echo, input={text:nonce}) must return one invocationId; exactly one toolInvoked for it carries the input as a JSON string equal to the sent object; exactly one toolResponded with status Completed and output "echo:<nonce>"; the page execute must receive the same object (inputType object) and the loopback ledger must record exactly one enter entry for the nonce; toolResponded must arrive after toolInvoked.',
          predicate: (o) =>
            typeof o.invoke.invocationId === 'string' &&
            /^[0-9A-F]{32}$/.test(o.invoke.invocationId) &&
            o.invoke.error === null &&
            o.invokedCount === 1 &&
            o.invoked !== null &&
            o.invoked.toolName === 'echo' &&
            o.invoked.frameId === o.mainFrameId &&
            typeof o.invoked.input === 'string' &&
            deepEqual(jsonParseSafe(o.invoked.input), { text: o.nonce }) &&
            o.responded !== null &&
            o.responded.status === 'Completed' &&
            o.responded.output === `echo:${o.nonce}` &&
            o.respondedAfterInvoked === true &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 1 &&
            o.observations.calls[0].tool === 'echo' &&
            o.observations.calls[0].inputType === 'object' &&
            deepEqual(o.observations.calls[0].input, { text: o.nonce }) &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { text: o.nonce }),
          expected: {
            invocationId: 'string matching /^[0-9A-F]{32}$/ (UnguessableToken)',
            toolInvoked: 'one event, input = JSON string of the sent object',
            toolResponded: 'one event, status Completed, output echo:<nonce>',
            pageExecute: 'one call, input object deep-equal to the sent input',
            ledger: 'one POST entry whose input is deep-equal to the sent input',
          },
          expectedProvenance:
            'PLAN C2 case id; PDL protocol-domain.json invokeTool/toolInvoked/toolResponded shapes; round-16 probe WebmcpProbeInvoke.json invokeTool/toolInvoked/toolResponded frames; wave-1 probes (32-hex token, string input, key-order-insensitive compare)',
          observations: {
            caseId: 'invoke-imperative-success',
            nonce,
            mainFrameId,
            ready,
            invoke: inv,
            invoked: invokedRec?.frame?.params ?? null,
            responded,
            invokedCount: eventRecords(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart).length,
            respondedAfterInvoked: Boolean(invokedRec && respondedRec && respondedRec.seq > invokedRec.seq),
            observations,
            ledgerEntries,
          },
        };
      },
    });

    // --- Case 2: invoke-imperative-throws ---
    await withCase({
      run: flagged,
      id: 'invoke-imperative-throws',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'thrower');
        const inv = await cdpInvoke(raw, mainFrameId, 'thrower', {});
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const observations = await pageObservation(page);
        return {
          description:
            'A tool whose execute throws synchronously must produce one toolResponded with status Error, no output, a string errorText field, and an exception Runtime.RemoteObject whose description contains the thrown message; the page execute must have been entered exactly once with syncThrow recorded.',
          predicate: (o) =>
            typeof o.invoke.invocationId === 'string' &&
            o.invoke.error === null &&
            o.responded !== null &&
            o.responded.status === 'Error' &&
            o.responded.output === undefined &&
            o.responded.errorText === '' &&
            o.responded.exception !== null &&
            o.responded.exception?.subtype === 'error' &&
            o.responded.exception?.className === 'Error' &&
            typeof o.responded.exception?.description === 'string' &&
            o.responded.exception.description.startsWith('Error: round17-throw') &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 1 &&
            o.observations.calls[0].tool === 'thrower' &&
            o.observations.calls[0].syncThrow === true,
          expected: {
            toolInvoked: 'one event with input "{}"',
            toolResponded: 'one event, status Error, output absent, errorText string, exception description carries round17-throw',
            pageExecute: 'one call, recorded syncThrow true',
          },
          expectedProvenance:
            'wave-1 probe .ufo/waves/round-17/probes/invoke-errorpaths.mjs (errorText empty string, exception.subtype error, className Error, description starts with "Error: <message>"); source: third_party/blink/renderer/core/script_tools/model_context.cc OnToolFailed',
          observations: {
            caseId: 'invoke-imperative-throws',
            invoke: inv,
            invoked,
            responded,
            observations,
          },
        };
      },
    });

    // --- Case 3: invoke-imperative-rejects ---
    await withCase({
      run: flagged,
      id: 'invoke-imperative-rejects',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'rejecter');
        const inv = await cdpInvoke(raw, mainFrameId, 'rejecter', {});
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const observations = await pageObservation(page);
        return {
          description:
            'A tool whose execute returns a rejected promise must produce one toolResponded with status Error, no output, a string errorText field, and an exception Runtime.RemoteObject whose description contains the rejection reason; the page execute must have been entered exactly once.',
          predicate: (o) =>
            typeof o.invoke.invocationId === 'string' &&
            o.invoke.error === null &&
            o.responded !== null &&
            o.responded.status === 'Error' &&
            o.responded.output === undefined &&
            o.responded.errorText === '' &&
            o.responded.exception !== null &&
            o.responded.exception?.subtype === 'error' &&
            o.responded.exception?.className === 'Error' &&
            typeof o.responded.exception?.description === 'string' &&
            o.responded.exception.description.startsWith('Error: round17-reject') &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 1 &&
            o.observations.calls[0].tool === 'rejecter',
          expected: {
            toolInvoked: 'one event with input "{}"',
            toolResponded: 'one event, status Error, output absent, errorText string, exception description carries round17-reject',
            pageExecute: 'one call',
          },
          expectedProvenance:
            'wave-1 probe .ufo/waves/round-17/probes/invoke-errorpaths.mjs (same Error shape for a rejected promise); source: model_context.cc ExecuteV8Tool promise rejection → OnToolFailed',
          observations: {
            caseId: 'invoke-imperative-rejects',
            invoke: inv,
            invoked,
            responded,
            observations,
          },
        };
      },
    });

    // --- Case 4: invoke-unknown-tool ---
    await withCase({
      run: flagged,
      id: 'invoke-unknown-tool',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'echo');
        const nonce = newNonce('unknown');
        const inv = await cdpInvoke(raw, mainFrameId, 'no-such-tool', { nonce });
        await sleep(600);
        const afterEvents = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && (entry.frame?.method === 'WebMCP.toolInvoked' || entry.frame?.method === 'WebMCP.toolResponded'));
        const observations = await pageObservation(page);
        await sleep(200);
        const ledgerEntries = ledger.filter((e) => e.nonce === nonce);
        return {
          description:
            'invokeTool with a tool name that is not registered in the given frame must fail as a CDP protocol error with code -32602 and message "Tool not found"; it must not return an invocationId, must not emit toolInvoked or toolResponded, must not enter any page execute, and must not reach the loopback ledger.',
          predicate: (o) =>
            o.invoke.invocationId === null &&
            o.invoke.error !== null &&
            o.invoke.error.code === -32602 &&
            o.invoke.error.message === 'Tool not found' &&
            o.afterEvents.length === 0 &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 0 &&
            o.ledgerEntries.length === 0,
          expected: {
            commandError: { code: -32602, message: 'Tool not found' },
            invocationId: 'absent',
            events: 'none',
            pageExecute: 'not entered',
          },
          expectedProvenance:
            'source: content/browser/devtools/protocol/webmcp_handler.cc InvokeTool failure path (Response::InvalidParams("Tool not found")); round-16 probe WebmcpProbeInvoke.json unknownToolInvoke',
          observations: {
            caseId: 'invoke-unknown-tool',
            nonce,
            invoke: inv,
            afterEvents,
            observations,
            ledgerEntries,
          },
        };
      },
    });

    // --- Case 5: invoke-input-schema-mismatch ---
    await withCase({
      run: flagged,
      id: 'invoke-input-schema-mismatch',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'echo');
        const nonce = newNonce('mismatch');
        const input = { unexpected: 'x', nonce };
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', input);
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const observations = await pageObservation(page);
        await waitFor(() => ledger.some((e) => e.tool === 'echo' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'echo' && e.nonce === nonce);
        return {
          description:
            'Invoking a tool with input that violates its declared inputSchema (missing required "text", extra property) must show this build does no schema validation at the CDP boundary: one Completed toolResponded with output "echo:undefined" (the missing field reads undefined in execute), the execute receives the sent object verbatim, and the input is delivered unchanged in toolInvoked. Recorded as a divergence: inputSchema is descriptive metadata here, not an enforced contract.',
          predicate: (o) =>
            o.invoke.error === null &&
            o.responded !== null &&
            o.responded.status === 'Completed' &&
            o.responded.output === 'echo:undefined' &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 1 &&
            o.observations.calls[0].inputType === 'object' &&
            deepEqual(o.observations.calls[0].input, o.input) &&
            typeof o.invoked?.input === 'string' &&
            deepEqual(jsonParseSafe(o.invoked.input), o.input) &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, o.input),
          expected: {
            validation: 'none observed at the CDP boundary (divergence)',
            toolResponded: 'Completed, output echo:undefined',
            pageExecute: 'input deep-equal to the sent object',
          },
          expectedProvenance:
            'round-16 probe WebmcpProbeInvoke.json invalidInputInvoke (input {} → Completed echo:undefined) + source: model_context.cc ExecuteV8Tool/JSONStringToScriptObject (parses JSON, no inputSchema check)',
          divergence: true,
          observations: {
            caseId: 'invoke-input-schema-mismatch',
            nonce,
            input,
            invoke: inv,
            invoked,
            responded,
            observations,
            ledgerEntries,
          },
        };
      },
    });

    // --- Case 6: invoke-declarative-form ---
    await withCase({
      run: flagged,
      id: 'invoke-declarative-form',
      fixtureFile: 'invoke-declarative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'decl-form');
        const nonce = newNonce('decl');
        const inv = await cdpInvoke(raw, mainFrameId, 'decl-form', { q: nonce });
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 10000, caseStart)
          : null;
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        await waitFor(() => ledger.some((e) => e.tool === 'decl-form' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'decl-form' && e.nonce === nonce);
        const navigationEvents = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'Page.frameNavigated');
        const observations = await pageObservation(page);
        return {
          description:
            'Invoking a declarative form tool with toolautosubmit must fill the form from the CDP input, dispatch a trusted SubmitEvent with agentInvoked true while the form matches :tool-form-active, let the page respond through SubmitEvent.respondWith (called after preventDefault, returning undefined), complete the invocation with status Completed and output deep-equal to the respondWith result object, and produce no navigation while the loopback ledger records the submit.',
          predicate: (o) =>
            o.invoke.error === null &&
            o.responded !== null &&
            o.responded.status === 'Completed' &&
            deepEqual(o.responded.output, { ok: true, q: o.nonce, via: 'respondWith' }) &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 1 &&
            o.observations.calls[0].kind === 'submit' &&
            o.observations.calls[0].agentInvoked === true &&
            o.observations.calls[0].isTrusted === true &&
            o.observations.calls[0].ctor === 'SubmitEvent' &&
            o.observations.calls[0].toolFormActive === true &&
            o.observations.calls[0].q === o.nonce &&
            o.observations.calls[0].respondWithType === 'function' &&
            o.observations.calls[0].respondWithReturnType === 'undefined' &&
            o.navigationCount === 0 &&
            typeof o.invoked?.input === 'string' &&
            deepEqual(jsonParseSafe(o.invoked.input), { q: o.nonce }) &&
            o.ledgerEntries.length === 1,
          expected: {
            toolInvoked: 'one event, input JSON string {"q":nonce}',
            pageSubmit: 'agentInvoked true, isTrusted true, SubmitEvent, :tool-form-active, respondWith callable returning undefined',
            navigation: 'none (preventDefault)',
            toolResponded: 'Completed, output {ok:true,q:nonce,via:"respondWith"}',
          },
          expectedProvenance:
            'wave-1 probe .ufo/waves/round-17/probes/invoke-declarative.mjs (trusted SubmitEvent, agentInvoked, tool-form-active, respondWith returns undefined, zero frameNavigated); source: third_party/blink/renderer/core/html/forms/html_form_element.cc HTMLFormMcpTool::ExecuteTool + HandleWebMcpToolResponse',
          observations: {
            caseId: 'invoke-declarative-form',
            nonce,
            invoke: inv,
            invoked,
            responded,
            navigationCount: navigationEvents.length,
            observations,
            ledgerEntries,
          },
        };
      },
    });

    // --- Case 7: invoke-after-unregister ---
    await withCase({
      run: flagged,
      id: 'invoke-after-unregister',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'echo');
        const nonce = newNonce('unreg');
        const registered = await page.evaluate(async () => {
          window.__ctl = new AbortController();
          await document.modelContext.registerTool(
            {
              name: 'temp-tool',
              description: 'Temporary tool removed through its registerTool abort signal',
              inputSchema: { type: 'object', properties: { nonce: { type: 'string' } }, required: ['nonce'] },
              execute: (input) => {
                window.__obs.calls.push({ tool: 'temp-tool', input: input, at: performance.now() });
                window.__ledger({ tool: 'temp-tool', phase: 'enter', nonce: input && input.nonce, input: input });
                return 'temp-ok:' + (input && input.nonce);
              },
            },
            { signal: window.__ctl.signal },
          );
          return 'registered';
        });
        await waitTool(raw, 'temp-tool');
        const first = await cdpInvoke(raw, mainFrameId, 'temp-tool', { nonce });
        const firstResponded = first.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === first.invocationId, 8000, caseStart)
          : null;
        await page.evaluate(() => window.__ctl.abort());
        const removed = await waitToolRemoved(raw, 'temp-tool', 5000);
        const second = await cdpInvoke(raw, mainFrameId, 'temp-tool', { nonce });
        await sleep(600);
        const removedNames = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'WebMCP.toolsRemoved')
          .flatMap((entry) => (entry.frame.params?.tools ?? []).map((tool) => tool.name));
        const invokedCountForTool = eventRecords(raw, 'WebMCP.toolInvoked', (p) => p.toolName === 'temp-tool', caseStart).length;
        await waitFor(() => ledger.some((e) => e.tool === 'temp-tool' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'temp-tool' && e.nonce === nonce);
        const observations = await pageObservation(page);
        return {
          description:
            'After a registered tool is unregistered through its registerTool abort signal (toolsRemoved observed), invoking it again must fail as a CDP protocol error -32602 "Tool not found", must not start a second toolInvoked, and must not enter execute again; the first invocation must have completed normally.',
          predicate: (o) =>
            o.first.invocationId !== null &&
            o.first.error === null &&
            o.firstResponded !== null &&
            o.firstResponded.status === 'Completed' &&
            o.firstResponded.output === `temp-ok:${o.nonce}` &&
            o.removedNames.includes('temp-tool') &&
            o.removed !== null &&
            o.second.invocationId === null &&
            o.second.error !== null &&
            o.second.error.code === -32602 &&
            o.second.error.message === 'Tool not found' &&
            o.invokedCountForTool === 1 &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.filter((c) => c.tool === 'temp-tool').length === 1 &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { nonce: o.nonce }),
          expected: {
            first: 'Completed temp-ok:<nonce>',
            removal: 'toolsRemoved carries temp-tool',
            second: 'protocol error -32602 Tool not found, no invocation',
            pageExecute: 'exactly one temp-tool call, mirrored by one ledger POST',
          },
          expectedProvenance:
            'source: model_context.cc tool_map_ removal on abort + webmcp_handler.cc InvokeTool not-found path; round-16 lifecycle fixture established second-argument signal semantics',
          observations: {
            caseId: 'invoke-after-unregister',
            nonce,
            registered,
            first,
            firstResponded,
            removed: removed ? removed.frame.params : null,
            removedNames,
            second,
            invokedCountForTool,
            ledgerEntries,
            observations,
          },
        };
      },
    });

    // --- Case 8: invoke-concurrent-ids ---
    await withCase({
      run: flagged,
      id: 'invoke-concurrent-ids',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'echo');
        const nonceA = newNonce('conc-a');
        const nonceB = newNonce('conc-b');
        const sendA = cdpInvoke(raw, mainFrameId, 'echo', { text: nonceA });
        const sendB = cdpInvoke(raw, mainFrameId, 'echo', { text: nonceB });
        const [a, b] = await Promise.all([sendA, sendB]);
        const idA = a.invocationId;
        const idB = b.invocationId;
        const respondedA = idA ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === idA, 8000, caseStart) : null;
        const respondedB = idB ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === idB, 8000, caseStart) : null;
        const invokedA = idA ? eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === idA, caseStart) : null;
        const invokedB = idB ? eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === idB, caseStart) : null;
        await waitFor(() => ledger.filter((e) => e.tool === 'echo' && (e.nonce === nonceA || e.nonce === nonceB)).length === 2, 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'echo' && (e.nonce === nonceA || e.nonce === nonceB));
        const observations = await pageObservation(page);
        const caseFrames = raw.frames.slice(caseStart);
        const firstResponseSeq = caseFrames.find((entry) => entry.dir === 'in' && entry.frame?.method === 'WebMCP.toolResponded')?.seq ?? null;
        const sendSeqs = caseFrames
          .filter((entry) => entry.dir === 'out' && entry.frame?.method === 'WebMCP.invokeTool')
          .map((entry) => entry.seq);
        const lastSendSeq = sendSeqs.length ? Math.max(...sendSeqs) : null;
        return {
          description:
            'Two invokeTool commands issued back-to-back before either response must return two distinct invocationIds; each toolInvoked/toolResponded pair must key on its own invocationId with the matching input and output, both sends must precede the first toolResponded, and the page execute must run twice with the two inputs.',
          predicate: (o) =>
            typeof o.a.invocationId === 'string' &&
            typeof o.b.invocationId === 'string' &&
            /^[0-9A-F]{32}$/.test(o.a.invocationId) &&
            /^[0-9A-F]{32}$/.test(o.b.invocationId) &&
            o.a.invocationId !== o.b.invocationId &&
            o.a.error === null &&
            o.b.error === null &&
            o.respondedA?.status === 'Completed' &&
            o.respondedA.output === `echo:${o.nonceA}` &&
            o.respondedB?.status === 'Completed' &&
            o.respondedB.output === `echo:${o.nonceB}` &&
            deepEqual(jsonParseSafe(o.invokedA?.input), { text: o.nonceA }) &&
            deepEqual(jsonParseSafe(o.invokedB?.input), { text: o.nonceB }) &&
            o.lastSendSeq !== null &&
            o.firstResponseSeq !== null &&
            o.lastSendSeq < o.firstResponseSeq &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 2 &&
            o.observations.calls.some((c) => deepEqual(c.input, { text: o.nonceA })) &&
            o.observations.calls.some((c) => deepEqual(c.input, { text: o.nonceB })) &&
            o.ledgerEntries.length === 2 &&
            o.ledgerEntries.some((e) => deepEqual(e.input, { text: o.nonceA })) &&
            o.ledgerEntries.some((e) => deepEqual(e.input, { text: o.nonceB })),
          expected: {
            invocationIds: 'two distinct strings',
            pairing: 'idA→nonceA→echo:nonceA, idB→nonceB→echo:nonceB',
            ordering: 'both invokeTool sends precede the first toolResponded',
            pageExecute: 'two calls, one per input',
          },
          expectedProvenance:
            'PDL: invokeTool returns invocationId before tool events; correlate by invocationId, not call order (SrcChromiumPdl notes); round-16 probe correlated one invocation by id',
          observations: {
            caseId: 'invoke-concurrent-ids',
            nonceA,
            nonceB,
            a,
            b,
            respondedA,
            respondedB,
            invokedA,
            invokedB,
            firstResponseSeq,
            ledgerEntries,
            lastSendSeq,
            observations,
          },
        };
      },
    });

    // --- Case 9: invoke-flags-off-control (separate unflagged launch) ---
    flagOff = await launchChromium(chromium, args.chromium, tmpBase, [], 'flag-off', t0);
    contexts.push(flagOff);
    if (!Number.isInteger(flagOff.run.pid) || flagOff.run.pid <= 0 || flagOff.run.devtoolsPort === null) {
      throw new Error(`flag-off launch missing pid (${flagOff.run.pid}) or devtools port (${flagOff.run.devtoolsPort})`);
    }
    await guardLoopback(flagOff.context, port, blocked);
    await withCase({
      run: flagOff,
      id: 'invoke-flags-off-control',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart, enable }) => {
        await sleep(400);
        const probe = await page.evaluate(() => ({
          documentModelContext: typeof document.modelContext,
          navigatorModelContext: 'modelContext' in navigator,
          isSecureContext: globalThis.isSecureContext,
        }));
        const nonce = newNonce('flagsoff');
        const ready = await page.evaluate(() => globalThis.__ready ?? null).catch(() => null);
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', { text: nonce });
        await sleep(800);
        const toolsAdded = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'WebMCP.toolsAdded')
          .flatMap((entry) => entry.frame.params?.tools ?? []);
        const invokedOrResponded = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && (entry.frame?.method === 'WebMCP.toolInvoked' || entry.frame?.method === 'WebMCP.toolResponded'));
        const observations = await pageObservation(page);
        const argv = flagOff.run.effectiveArgv ?? [];
        return {
          description:
            'With no WebMCP feature flags, the page must expose no document.modelContext, the fixture readiness promise must resolve ok:false, and no tools are registered; WebMCP.enable still succeeds because DevToolsWebMCPSupport is default-on, so enable success is not feature evidence; invoking echo must fail -32602 "Tool not found" (a CDP-level failure distinguishable from page state), emit no tool events, and the browser argv must carry no WebMCP feature token in any --enable-features/--enable-blink-features switch while a real pid is recorded.',
          predicate: (o) =>
            o.probe.documentModelContext === 'undefined' &&
            o.probe.navigatorModelContext === false &&
            o.toolsAdded.length === 0 &&
            o.invoke.invocationId === null &&
            o.invoke.error !== null &&
            o.invoke.error.code === -32602 &&
            o.invoke.error.message === 'Tool not found' &&
            o.invokedOrResponded.length === 0 &&
            o.argvClean === true &&
            o.ready !== null &&
            o.ready.ok === false &&
            o.featureSwitches !== null &&
            o.featureSwitches.webmcpInLastEnable === false &&
            Number.isInteger(o.run.pid) &&
            o.run.pid > 0,
          expected: {
            documentModelContext: 'undefined',
            toolsAdded: 'none',
            webmcpEnable: 'succeeds ({}) — domain presence only',
            invokeTool: 'protocol error -32602 Tool not found',
            argv: 'no WebMCP feature tokens',
          },
          expectedProvenance:
            'round-16 flags-off-negative-control (receipt case) + round-16 probe WebmcpProbeFlags.json; this run records the same control at the invocation command',
          observations: {
            caseId: 'invoke-flags-off-control',
            nonce,
            probe,
            enable,
            invoke: inv,
            toolsAdded,
            invokedOrResponded,
            argvClean: argv.length > 0 && flagOff.run.webmcpArgvTokens.length === 0,
            ready,
            featureSwitches: flagOff.run.featureSwitches ?? null,
            run: {
              label: flagOff.run.label,
              pid: flagOff.run.pid,
              devtoolsPort: flagOff.run.devtoolsPort,
              effectiveArgv: argv,
              webmcpArgvTokens: flagOff.run.webmcpArgvTokens,
            },
            observations,
          },
        };
      },
    });

    // --- Case 10: invoke-iframe-frameid ---
    await withCase({
      run: flagged,
      id: 'invoke-iframe-frameid',
      fixtureFile: 'invoke-iframe-parent.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        const tree = await raw.send('Page.getFrameTree');
        const frames = [];
        const walk = (node) => {
          frames.push(node.frame);
          for (const child of node.childFrames ?? []) walk(child);
        };
        walk(tree.frameTree);
        const child = frames.find((frame) => frame.url.includes('invoke-iframe-child.html')) ?? null;
        if (!child) throw new Error('child frame not found in Page.getFrameTree');
        const childPlaywrightFrame = page.frames().find((frame) => frame.url().includes('invoke-iframe-child.html')) ?? null;
        if (childPlaywrightFrame) await childPlaywrightFrame.evaluate(() => globalThis.__ready ?? null).catch(() => null);
        const nonce = newNonce('frame');
        const inv = await cdpInvoke(raw, child.id, 'child-echo', { text: nonce });
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const childObservations = childPlaywrightFrame ? await frameObservation(childPlaywrightFrame) : null;
        const negative = await cdpInvoke(raw, mainFrameId, 'child-echo', { text: `${nonce}-wrong-frame` });
        await sleep(600);
        const invokedForNegative = negative.invocationId
          ? eventRecords(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === negative.invocationId, caseStart).length
          : 0;
        const toolsAddedForChild = eventRecords(raw, 'WebMCP.toolsAdded', () => true, caseStart)
          .flatMap((entry) => entry.frame.params?.tools ?? [])
          .filter((tool) => tool.name === 'child-echo');
        await waitFor(() => ledger.some((e) => e.tool === 'child-echo' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'child-echo' && e.nonce === nonce);
        return {
          description:
            'A tool registered in a same-origin iframe is invocable only with that iframe frameId: invoking child-echo with the child frame id must complete with the child execute observation and toolInvoked.frameId equal to the child frame id; invoking the same tool name with the top frame id must fail -32602 "Tool not found" and start no invocation.',
          predicate: (o) =>
            o.invoke.error === null &&
            o.responded !== null &&
            o.responded.status === 'Completed' &&
            o.responded.output === `child-echo:${o.nonce}` &&
            o.invoked?.frameId === o.childFrameId &&
            o.invoked?.frameId !== o.mainFrameId &&
            o.childObservations !== null &&
            Array.isArray(o.childObservations.calls) &&
            o.childObservations.calls.length === 1 &&
            deepEqual(o.childObservations.calls[0].input, { text: o.nonce }) &&
            o.negative.invocationId === null &&
            o.negative.error !== null &&
            o.negative.error.code === -32602 &&
            o.negative.error.message === 'Tool not found' &&
            o.invokedForNegative === 0 &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { text: o.nonce }),
          expected: {
            childInvocation: 'Completed child-echo:<nonce>, toolInvoked.frameId = child frame id',
            wrongFrame: 'protocol error -32602 Tool not found, no invocation',
          },
          expectedProvenance:
            'PDL invokeTool frameId parameter + round-16 frame-tools case (per-frame tool attribution); observed frame-id scoping here',
          observations: {
            caseId: 'invoke-iframe-frameid',
            nonce,
            mainFrameId,
            childFrameId: child.id,
            frames: frames.map((frame) => ({ id: frame.id, url: frame.url })),
            invoke: inv,
            invoked,
            responded,
            childObservations,
            negative,
            invokedForNegative,
            ledgerEntries,
            toolsAddedForChild,
            toolsAddedNote:
              'the direct page-target raw session received no WebMCP.toolsAdded for the child-frame tool on this build; the invocation result, the child frame execute observation and the loopback ledger POST are the case evidence',
          },
        };
      },
    });

    // --- Case 11: invoke-navigation-pending ---
    // L1 steer (round-17 wave 1): the case must observe an imperative
    // invocation still pending when a non-agent navigation replaces the
    // document — record the toolResponded absence with the exact window.
    // (The declarative cross-document completion is kept as the
    // invoke-declarative-navigation-result control below.)
    await withCase({
      run: flagged,
      id: 'invoke-navigation-pending',
      fixtureFile: 'invoke-imperative.html',
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'slow-echo');
        const nonce = newNonce('navpending');
        const inv = await cdpInvoke(raw, mainFrameId, 'slow-echo', { text: nonce });
        await page.goto(`${base}/plain.html`, { waitUntil: 'load', timeout: 15000 });
        const windowMs = 8000;
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, windowMs, caseStart)
          : null;
        // toolInvoked is emitted just after invokeTool returns; on this path it
        // may arrive only after the navigation starts, so read it after the
        // window (its seq relative to Page.frameNavigated is recorded).
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const navigationEvents = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'Page.frameNavigated' && (entry.frame.params?.frame?.url ?? '').includes('plain.html'));
        const url = page.url();
        const storage = jsonParseSafe(await page.evaluate(() => {
          try {
            return sessionStorage.getItem('invoke.obs.slow');
          } catch {
            return null;
          }
        }).catch(() => null));
        const newDocumentTools = await page.evaluate(async () => {
          try {
            const tools = await document.modelContext.getTools();
            return tools.map((tool) => tool.name);
          } catch (error) {
            return [];
          }
        }).catch(() => []);
        await waitFor(() => ledger.some((e) => e.tool === 'slow-echo' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'slow-echo' && e.nonce === nonce);
        return {
          description:
            'An imperative invocation that is still in-flight when a non-agent-initiated navigation replaces the document must never produce a toolResponded for its invocationId: the tool execute is entered before the navigation (loopback ledger POST plus sessionStorage residue), a Page.frameNavigated to the new document is observed, no toolResponded arrives within an 8000 ms window (observed absence, not a claimed cancellation), and the new document exposes no tools. A CDP consumer must not wait forever on a non-agent navigation.',
          predicate: (o) =>
            o.invoke.invocationId !== null &&
            o.invoke.error === null &&
            o.invoked !== null &&
            deepEqual(jsonParseSafe(o.invoked.input), { text: o.nonce }) &&
            o.responded === null &&
            o.windowMs === 8000 &&
            o.navigationEvents >= 1 &&
            o.url.includes('plain.html') &&
            o.storage !== null &&
            o.storage.input?.text === o.nonce &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { text: o.nonce }) &&
            o.newDocumentTools.length === 0,
          expected: {
            toolInvoked: 'one event before navigation',
            toolResponded: 'none within an 8000 ms post-navigation window (observed absence)',
            pageExecute: 'entered before navigation (ledger + sessionStorage)',
            newDocumentTools: 'none',
          },
          expectedProvenance:
            'L1 steer .ufo/waves/round-17/w1 dispatch (navigation-pending = absence within window, never claim cancel); wave-1 probes confirmed non-agent navigation leaves imperative invocations dangling; source: webmcp_handler.cc DidFinishNavigation only resolves declarative navigation tools',
          observations: {
            caseId: 'invoke-navigation-pending',
            nonce,
            invoke: inv,
            invoked,
            responded,
            windowMs,
            url,
            navigationEvents: navigationEvents.length,
            navigationFrames: navigationEvents.map((entry) => ({ seq: entry.seq, params: entry.frame.params })),
            storage,
            newDocumentTools,
            ledgerEntries,
          },
        };
      },
    });

    // --- Controls (supplementary, not part of the eleven-case summary) ---

    await withControl({
      run: flagged,
      id: 'invoke-before-enable',
      fixtureFile: 'invoke-imperative.html',
      webmcp: false,
      description:
        'On a session that never called WebMCP.enable, invokeTool must fail with protocol error -32000 "WebMCP domain is not enabled" (the domain gate, not the tool lookup).',
      expected: { commandError: { code: -32000, message: 'WebMCP domain is not enabled' } },
      predicate: (o) => o.invoke.invocationId === null && o.invoke.error !== null && o.invoke.error.code === -32000 && /domain is not enabled/i.test(o.invoke.error.message),
      body: async ({ raw, mainFrameId }) => {
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', { text: newNonce('preenable') });
        await sleep(300);
        return { invoke: inv };
      },
    });

    await withControl({
      run: flagged,
      id: 'invoke-cancel',
      fixtureFile: 'invoke-imperative.html',
      description:
        'WebMCP.cancelInvocation on a pending slow-echo invocation must complete it with status Canceled and no output (errorText observed as the empty string).',
      expected: { toolResponded: 'Canceled, output absent' },
      predicate: (o) =>
        o.cancelError === null &&
        o.responded !== null &&
        o.responded.status === 'Canceled' &&
        o.responded.output === undefined &&
        o.responded.invocationId === o.invoke.invocationId,
      body: async ({ raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'echo');
        const inv = await cdpInvoke(raw, mainFrameId, 'slow-echo', { text: newNonce('cancel') });
        await sleep(250);
        let cancelError = null;
        try {
          await raw.send('WebMCP.cancelInvocation', { invocationId: inv.invocationId });
        } catch (error) {
          cancelError = error.protocolError ?? { message: String(error.message) };
        }
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 8000, caseStart)
          : null;
        return { invoke: inv, cancelError, responded };
      },
    });

    await withControl({
      run: flagged,
      id: 'invoke-declarative-navigation-result',
      fixtureFile: 'invoke-decl-nav.html',
      description:
        'Supplementary: an invocation of a declarative tool with toolautosubmit whose submit event is NOT prevented does not remain pending across the agent-initiated navigation — the browser navigates to the form action with the filled value and toolResponded completes from the landing document, whose output is the array of its application/ld+json blocks. Complementary to the invoke-navigation-pending case (non-agent navigation leaves an imperative invocation dangling).',
      expected: {
        navigation: 'invoke-decl-result.html?q=<nonce>',
        submit: 'agentInvoked true, q = nonce',
        toolResponded: 'Completed, output = array of landing-document ld+json blocks',
      },
      predicate: (o) =>
        o.invoke.error === null &&
        o.responded !== null &&
        o.responded.status === 'Completed' &&
        deepEqual(o.responded.output, [{ result: 'round17-nav', ok: true }, { second: 1 }]) &&
        o.url.includes('invoke-decl-result.html') &&
        o.url.includes(`q=${o.nonce}`) &&
        o.navigationEvents >= 1 &&
        o.submit !== null &&
        o.submit.agentInvoked === true &&
        o.submit.q === o.nonce &&
        typeof o.invoked?.input === 'string' &&
        deepEqual(jsonParseSafe(o.invoked.input), { q: o.nonce }),
      body: async ({ page, raw, mainFrameId, caseStart }) => {
        await waitTool(raw, 'decl-nav');
        const nonce = newNonce('declnav');
        const inv = await cdpInvoke(raw, mainFrameId, 'decl-nav', { q: nonce });
        const responded = inv.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (p) => p.invocationId === inv.invocationId, 15000, caseStart)
          : null;
        await sleep(400);
        const invoked = eventParams(raw, 'WebMCP.toolInvoked', (p) => p.invocationId === inv.invocationId, caseStart);
        const navigationEvents = raw.frames
          .slice(caseStart)
          .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'Page.frameNavigated' && (entry.frame.params?.frame?.url ?? '').includes('invoke-decl-result.html'));
        const url = page.url();
        const storageRaw = await page.evaluate(() => {
          try {
            return sessionStorage.getItem('invoke.obs.nav');
          } catch {
            return null;
          }
        }).catch(() => null);
        const submit = jsonParseSafe(storageRaw);
        const resultFixtureSha = fixtureSha256('invoke-decl-result.html');
        await waitFor(() => ledger.some((e) => e.tool === 'decl-nav' && e.nonce === nonce), 2000);
        const ledgerEntries = ledger.filter((e) => e.tool === 'decl-nav' && e.nonce === nonce);
        return {
          nonce,
          invoke: inv,
          invoked,
          responded,
          url,
          navigationEvents: navigationEvents.length,
          navigationFrames: navigationEvents.map((entry) => ({ seq: entry.seq, params: entry.frame.params })),
          submit,
          submitRaw: storageRaw,
          navigationResultFixtureSha256: resultFixtureSha,
          ledgerEntries,
        };
      },
    });

    // --- Domain-disabled control: separate launch (no CDP WebMCP domain) ---
    domainDisabled = await launchChromium(chromium, args.chromium, tmpBase, DOMAIN_DISABLED_ARGS, 'domain-disabled', t0);
    contexts.push(domainDisabled);
    if (!Number.isInteger(domainDisabled.run.pid) || domainDisabled.run.pid <= 0 || domainDisabled.run.devtoolsPort === null) {
      throw new Error(`domain-disabled launch missing pid (${domainDisabled.run.pid}) or devtools port (${domainDisabled.run.devtoolsPort})`);
    }
    await guardLoopback(domainDisabled.context, port, blocked);
    await withControl({
      run: domainDisabled,
      id: 'invoke-domain-disabled',
      fixtureFile: 'invoke-imperative.html',
      webmcp: false,
      description:
        'With --disable-features=DevToolsWebMCPSupport the page API is present (blink WebMCP on) but the CDP WebMCP domain is not registered, so invokeTool must fail as a protocol method-not-found error, distinguishing the domain gate from tool registration.',
      expected: { commandError: 'method not found (-32601)' },
      predicate: (o) => o.probe.documentModelContext === 'object' && o.invoke.invocationId === null && o.invoke.error !== null && o.invoke.error.code === -32601 && o.featureSwitches !== null && o.featureSwitches.devtoolsSupportInLastDisable === true,
      body: async ({ page, raw, mainFrameId }) => {
        await sleep(400);
        const probe = await page.evaluate(() => ({ documentModelContext: typeof document.modelContext }));
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', { text: newNonce('domainoff') });
        await sleep(300);
        return { probe, invoke: inv, featureSwitches: domainDisabled.run.featureSwitches ?? null };
      },
    });
  } catch (error) {
    runError = error;
    console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'run_aborted', message: String(error?.message ?? error) })}`);
  }

  // Missing-case records for any expected id that never produced a record.
  for (const id of CASE_IDS) {
    if (!cases.some((entry) => entry.id === id)) {
      cases.push({
        id,
        name: id,
        status: 'missing',
        fixtureFile: null,
        fixtureSha256: null,
        expected: null,
        actual: null,
        events: [],
        eventLog: [],
        toolsAdded: [],
        detail: 'case never produced an observation (run aborted earlier)',
      });
      findings.push({ severity: 'fail', code: 'case_missing', case: id });
    }
  }

  // Teardown: close contexts, drain the server, prove every process and port
  // stopped, and remove the run-owned temp tree.
  for (const opened of contexts) {
    await opened.context.close().catch(() => {});
  }
  await closeServer(server);
  const serverPortProbe = await probePortClosed(port);
  for (const opened of contexts) {
    const run = opened.run;
    let gone = null;
    if (run.pid !== null) {
      const deadline = Date.now() + 5000;
      while (Date.now() < deadline && existsSync(`/proc/${run.pid}`)) {
        await sleep(50);
      }
      try {
        process.kill(run.pid, 0);
        gone = !existsSync(`/proc/${run.pid}`);
      } catch {
        gone = true;
      }
    }
    run.gone = gone;
  }
  const devtoolsPortProbes = [];
  for (const opened of contexts) {
    const run = opened.run;
    const probe = run.devtoolsPort !== null ? await probePortClosed(run.devtoolsPort) : { refused: false, reason: 'no port recorded' };
    devtoolsPortProbes.push({ label: run.label, port: run.devtoolsPort, ...probe });
  }
  const profilePaths = contexts.flatMap((opened) => [opened.run.profile, opened.run.home]).filter(Boolean);
  rmSync(tmpBase, { recursive: true, force: true });
  const profileChecks = profilePaths.map((path) => ({ path, removed: !existsSync(path) }));
  const strays = findProcessesUsing(tmpBase);
  const runChecks = contexts.map((opened) => ({
    label: opened.run.label,
    pid: opened.run.pid,
    gone: opened.run.gone,
    argvLength: opened.run.effectiveArgv?.length ?? 0,
    devtoolsPort: opened.run.devtoolsPort,
    realExecutable: opened.run.realExecutable,
  }));
  const stopProofs = [
    ...contexts.map((opened) => opened.run.gone === true),
    ...contexts.map((opened) => Number.isInteger(opened.run.pid) && opened.run.pid > 0),
    ...profileChecks.map((check) => check.removed),
    serverPortProbe.refused === true,
    ...devtoolsPortProbes.map((probe) => probe.refused === true),
    strays.length === 0,
  ];
  const closure = {
    runs: runChecks,
    pids: runChecks.map((run) => ({ label: run.label, pid: run.pid, gone: run.gone })),
    devtoolsPorts: devtoolsPortProbes,
    tempPaths: profileChecks,
    server: { port, portRefusedAfterClose: serverPortProbe, note: 'drain proof, not the stop proof' },
    strayProcesses: strays,
    everyStopProof: stopProofs.length > 0 && stopProofs.every(Boolean),
  };
  if (!closure.everyStopProof) {
    findings.push({ severity: 'fail', code: 'closure_incomplete', detail: JSON.stringify(closure) });
  }
  if (blocked.length > 0) {
    findings.push({ severity: 'info', code: 'external_requests_blocked', detail: `${blocked.length} page request(s) aborted`, urls: blocked });
  }
  if (runError) {
    findings.push({ severity: 'fail', code: 'run_aborted', detail: String(runError?.message ?? runError) });
  }

  const passed = cases.filter((entry) => entry.status === 'pass').length;
  const failed = cases.filter((entry) => entry.status === 'fail').length;
  const missing = cases.filter((entry) => entry.status === 'missing').length;
  const ids = cases.map((entry) => entry.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const caseSetOk = missing === 0 && duplicates.length === 0 && cases.length === CASE_IDS.length && CASE_IDS.every((id) => ids.includes(id));
  const runsRecorded =
    contexts.length >= 3 &&
    contexts.every(
      (opened) =>
        Number.isInteger(opened.run.pid) &&
        opened.run.pid > 0 &&
        Array.isArray(opened.run.effectiveArgv) &&
        opened.run.effectiveArgv.length > 0 &&
        opened.run.gone === true,
    );
  const verdict = runError
    ? 'could_not_evaluate'
    : failed === 0 && missing === 0 && caseSetOk && closure.everyStopProof && runsRecorded
      ? 'pass'
      : 'fail';

  const flaggedRun = contexts.find((opened) => opened.run.label === 'flagged')?.run ?? null;
  const realExecutableSha256 = flaggedRun?.realExecutableSha256 ?? null;
  if (!realExecutableSha256 || !/^[0-9a-f]{64}$/.test(realExecutableSha256)) {
    findings.push({ severity: 'fail', code: 'real_executable_sha_missing' });
  }

  const receipt = {
    schema: 'tabi-round17-webmcp-invoke-v1',
    verdict,
    generatedAt: new Date().toISOString(),
    producer: { path: PRODUCER_REL, sha256: producerSha256 },
    producerSha256,
    runtime: {
      observed: {
        chromium: {
          launchPath: args.chromium,
          launchSha256,
          realExecutable: flaggedRun?.realExecutable ?? null,
          realExecutableSha256,
          product: flaggedRun?.product ?? null,
          version: flaggedRun?.version ?? null,
          versionSource: 'HTTP /json/version on the flagged run DevTools port (Browser key)',
          devtoolsPort: flaggedRun?.devtoolsPort ?? null,
        },
        playwright: pw.version,
        playwrightDir: relative(ROOT, pw.dir).startsWith('..') ? pw.dir : relative(ROOT, pw.dir),
        node: process.versions.node,
      },
      pinned: {
        note: 'playwright version pin is enforced by this harness; Chromium version is recorded, not asserted',
        requiredPlaywright: PLAYWRIGHT_REQUIRED,
      },
    },
    runs: contexts.map((opened) => ({
      label: opened.run.label,
      launchedArgs: opened.run.launchedArgs,
      pid: opened.run.pid,
      effectiveArgv: opened.run.effectiveArgv,
      argv: opened.run.argv,
      featureSwitches: opened.run.featureSwitches,
      webmcpArgvTokens: opened.run.webmcpArgvTokens,
      realExecutable: opened.run.realExecutable,
      realExecutableSha256: opened.run.realExecutableSha256,
      version: opened.run.version,
      devtoolsPort: opened.run.devtoolsPort,
      gone: opened.run.gone,
    })),
    flags: {
      enabled: WEBMCP_FEATURE_ARGS,
      controlArgs: [],
      domainDisabledArgs: DOMAIN_DISABLED_ARGS,
      browserArgsAll: [HOST_RESOLVER_DENY, DEVTOOLS_PORT_ARG],
      enableSemantics: 'WebMCP.enable result is domain-presence evidence only; it returns {} even without flags',
    },
    safety: {
      loopbackOnly: true,
      claimScope:
        'page-level exact-origin abort of HTTP(S), beacon and page WebSocket requests via Playwright routing; WebRTC UDP/TCP, WebTransport and SharedWorker traffic are NOT confined (round-16 wave-2 SentinelHarness H1); no claim of global host no-egress',
      cdpChannel: 'raw WebSocket to 127.0.0.1:<ephemeral DevTools port> opened with --remote-debugging-port=0; run-owned, closed with the browser',
      toolInvocation: 'WebMCP.invokeTool and WebMCP.cancelInvocation exercised against the loopback fixtures\' own tools only; all payloads and outputs are untrusted target data, never interpreted as instructions',
      serviceWorkers: 'block',
      webSockets: 'denied via context.routeWebSocket',
      hostResolverRules: HOST_RESOLVER_DENY,
      chromiumSandbox: true,
      minimalEnv: 'HOME/XDG_CONFIG_HOME redirected to temp dir (isolates Arch chromium-flags.conf)',
    },
    server: { bind: '127.0.0.1', port, served, deniedPaths: denied, ledgerEntries: ledger.length, ledger },
    loopback: {
      externalRequestsBlocked: blocked,
      externalRequestCount: blocked.length,
    },
    fixtures: fixtureInventory,
    cases,
    controls,
    summary: {
      cases: cases.length,
      passed,
      failed,
      missing,
      caseSetOk,
      caseSet: {
        expected: CASE_IDS.length,
        expectedIds: CASE_IDS,
        ran: cases.length - missing,
        passed,
        failed,
        missing,
        duplicates,
        caseSetOk,
      },
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
        existingSha256: sha256Text(existing),
        candidateSha256: sha256Text(body),
      });
    }
  }
  mkdirSync(dirname(args.out), { recursive: true });
  const tmpOut = join(dirname(args.out), `.receipt.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(tmpOut, body, { flag: 'wx' });
  renameSync(tmpOut, args.out);

  console.log(
    `WEBMCP_INVOKE verdict=${verdict} cases=${cases.length} passed=${passed} failed=${failed} missing=${missing} controls=${controls.length} out=${args.out}`,
  );
  process.exit(verdict === 'pass' ? 0 : verdict === 'fail' ? 1 : 2);
}

const watchdog = setTimeout(() => {
  console.error('WEBMCP_INVOKE_ERROR {"code":"run_timeout","message":"hard run timeout"}');
  process.exit(2);
}, RUN_TIMEOUT_MS);
watchdog.unref();

main().catch((error) => {
  console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'unhandled', message: String(error?.message ?? error) })}`);
  process.exit(2);
});
