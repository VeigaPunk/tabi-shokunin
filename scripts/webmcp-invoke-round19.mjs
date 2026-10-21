#!/usr/bin/env node
// Round-19 WebMCP invocation harness (claim C2: tool invocation as committed
// evidence).
//
// Serves the round-17 loopback fixtures plus one embedded download fixture,
// launches Chromium in a private run tree, attaches Playwright CDPSessions only
// to its fixture pages, and records all sent CDP commands/responses plus the
// WebMCP and navigation events used by the twelve cases and four controls.
//
// H1/H2: signal and watchdog exits abort without a pass/fail receipt and share
// one idempotent cleanup path. Browser TMPDIR lives inside the private run tree.
// H3: the CDP pipe is retained; no remote-debugging TCP port is requested.
// H4: downloads are refused; marker bytes are scanned across the private trees,
// and every new file in download/artifact roots is rejected while alive or after close.
// S1: feature arguments are merged with the pinned Playwright defaults, and
// every launched browser's effective /proc argv is checked fail-closed.
//
// Page-declared tool names, descriptions, schemas, and outputs are untrusted
// target data: they are recorded, never interpreted as instructions.
//
// Usage:
//   node scripts/webmcp-invoke-round19.mjs [--out PATH] [--fixtures DIR]
//                                          [--chromium PATH] [--nonce HEX] [--force]
//
// Defaults: round-17 loopback fixtures, /usr/bin/chromium, a 128-bit run nonce,
// and a receipt under the process temp directory. Verdict/exit: pass→0, fail→1,
// could_not_evaluate→2 (also for a refused overwrite unless --force).
import { createHash, randomBytes } from 'node:crypto';
import {
  createReadStream,
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
const DEFAULT_OUT = join(tmpdir(), 'tabi-r19-webmcp-invoke-receipt.json');
const DEFAULT_FIXTURES = join(WEBMCP_DIR, 'fixtures');
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const PRODUCER_REL = 'scripts/webmcp-invoke-round19.mjs';
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
const WAIT_EVENT_MS = 5000;
const CASE_TIMEOUT_MS = 60000;
const RUN_TIMEOUT_MS = 420000;
const LAUNCH_TIMEOUT_MS = 15000;
const PENDING_LAUNCH_ABORT_WAIT_MS = LAUNCH_TIMEOUT_MS + 1000;
const PENDING_LAUNCH_SETTLE_MS = 3000;
const CONTEXT_OPERATION_TIMEOUT_MS = 10000;
const CONTEXT_CLOSE_TIMEOUT_MS = 5000;
const CASE_CLOSE_TIMEOUT_MS = 3000;
const CLEANUP_OPERATION_SETTLE_MS = 3000;
const SERVER_CLOSE_TIMEOUT_MS = 3000;

// Exact feature switches emitted by the pinned Playwright 1.64.0 Chromium
// launcher. Only these tokens are ignored; every other Playwright default is
// retained. The disable list is re-added as a union with harness additions.
const PLAYWRIGHT_DEFAULT_DISABLE_FEATURES = [
  'AvoidUnnecessaryBeforeUnloadCheckSync',
  'DestroyProfileOnBrowserClose',
  'DialMediaRouteProvider',
  'GlobalMediaControls',
  'HttpsUpgrades',
  'LensOverlay',
  'MediaRouter',
  'PaintHolding',
  'ThirdPartyStoragePartitioning',
  'BlockOriginHeaderModificationOnRedirect',
  'Translate',
  'AutoDeElevate',
  'OptimizationHints',
  'NetworkTimeServiceQuerying',
  'AimEnabled',
  'msForceBrowserSignIn',
  'msEdgeUpdateLaunchServicesPreferredVersion',
];
const PLAYWRIGHT_DEFAULT_ENABLE_FEATURES = process.env.PLAYWRIGHT_LEGACY_SCREENSHOT
  ? []
  : ['CDPScreenshotNewSurface'];
const DOWNLOAD_FIXTURE_FILE = 'invoke-download-refused.html';
const DOWNLOAD_FIXTURE_HTML = (runNonce) => `<!doctype html>
<html><head><meta charset="utf-8"><title>round19 refused download</title></head>
<body><h1>invoke-download-refused</h1><script>
(function () {
  window.__obs = { calls: [] };
  window.__runNonce = ${JSON.stringify(runNonce)};
  window.__downloadMarker = 'tabi-r19-download-' + crypto.randomUUID();
  window.__ready = (async function () {
    if (!document.modelContext || typeof document.modelContext.registerTool !== 'function') {
      return { ok: false, reason: 'no-modelContext' };
    }
    await document.modelContext.registerTool({
      name: 'download-blob',
      description: 'Create one fixture-owned blob download with unique marker bytes',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        var url = URL.createObjectURL(new Blob([window.__downloadMarker], { type: 'text/plain' }));
        window.__obs.calls.push({ tool: 'download-blob', nonce: window.__runNonce });
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'webmcp-refused-download.txt';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        return 'download-triggered';
      }
    });
    return { ok: true };
  })();
})();
</script></body></html>`;
const RECORDED_CDP_EVENTS = [
  'Page.frameNavigated',
  'WebMCP.toolsAdded',
  'WebMCP.toolsRemoved',
  'WebMCP.toolInvoked',
  'WebMCP.toolResponded',
];

// Required cases (round 17's eleven plus H4's download refusal case). Anything
// not reached gets a status:'missing' record in an ordinary evaluated run.
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
  'invoke-download-refused',
];

const runContexts = [];
const pendingLaunches = new Set();
const activeOperations = new Set();
const activeBodies = new Set();
let activeServer = null;
let runTempDir = null;
let processTmpDir = null;
let processTmpDirBeforeRun = null;
let cleanupPromise = null;
let cleanupEvidence = null;
let abortState = null;
let abortOutputPrinted = false;
let shutdownStarted = false;
const abortController = new AbortController();
let watchdogTimer = null;
let downloadScanEvidence = {
  roots: [],
  newFiles: [],
  errors: [{ stage: 'not_run', error: 'download scan did not complete' }],
  complete: false,
};

const sleepRaw = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
function sleep(ms) {
  if (abortState) return Promise.reject(makeAbortError());
  return new Promise((resolvePromise, rejectPromise) => {
    const timer = setTimeout(() => {
      abortController.signal.removeEventListener('abort', onAbort);
      resolvePromise();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      abortController.signal.removeEventListener('abort', onAbort);
      rejectPromise(makeAbortError());
    };
    abortController.signal.addEventListener('abort', onAbort, { once: true });
  });
}

function makeAbortError() {
  const error = new Error(abortState?.message || 'run aborted');
  error.code = 'run_aborted';
  error.runAborted = true;
  error.abortState = abortState;
  return error;
}

function markAborted(state) {
  if (abortState) return false;
  if (shutdownStarted && state.kind !== 'signal') return false;
  abortState = state;
  abortController.abort();
  return true;
}

function isBrowserClosedError(error) {
  return /Target page, context or browser has been closed|browser has been closed|browser disconnected/i.test(
    String(error?.message ?? error ?? ''),
  );
}

function markBrowserClosed(error) {
  if (isBrowserClosedError(error)) {
    markAborted({
      kind: 'browser_disconnected',
      message: String(error?.message ?? error),
    });
    return true;
  }
  return Boolean(abortState);
}

function abortable(promise) {
  if (abortState) return Promise.reject(makeAbortError());
  return new Promise((resolvePromise, rejectPromise) => {
    const onAbort = () => rejectPromise(makeAbortError());
    abortController.signal.addEventListener('abort', onAbort, { once: true });
    Promise.resolve(promise).then(resolvePromise, rejectPromise).then(
      () => abortController.signal.removeEventListener('abort', onAbort),
      () => abortController.signal.removeEventListener('abort', onAbort),
    );
  });
}
function settleWithin(promise, timeoutMs) {
  return new Promise((resolvePromise) => {
    let settled = false;
    let timer;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise(result);
    };
    timer = setTimeout(() => finish({ settled: false }), timeoutMs);
    timer.unref();
    Promise.resolve(promise).then(
      (value) => finish({ settled: true, value }),
      (error) => finish({ settled: true, error }),
    );
  });
}

async function withTimeout(promise, timeoutMs, message) {
  const result = await settleWithin(promise, timeoutMs);
  if (!result.settled) throw Object.assign(new Error(message), { timeout: true });
  if (result.error) throw result.error;
  return result.value;
}

async function settleSet(set, timeoutMs) {
  if (set.size === 0) return true;
  return (await settleWithin(Promise.allSettled([...set]), timeoutMs)).settled;
}

function parseArgs(argv) {
  const args = {
    out: DEFAULT_OUT,
    fixtures: DEFAULT_FIXTURES,
    chromium: DEFAULT_CHROMIUM,
    nonce: process.env.TABI_RUN_NONCE ?? randomBytes(16).toString('hex'),
    force: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') args.out = resolve(argv[++i]);
    else if (arg === '--fixtures') args.fixtures = resolve(argv[++i]);
    else if (arg === '--chromium') args.chromium = resolve(argv[++i]);
    else if (arg === '--nonce') args.nonce = argv[++i];
    else if (arg === '--force') args.force = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`unknown argument ${arg}`);
  }
  if (typeof args.nonce !== 'string' || !/^[0-9a-fA-F]{32}$/.test(args.nonce)) {
    throw new Error('TABI_RUN_NONCE / --nonce must be exactly 32 hexadecimal characters');
  }
  args.nonce = args.nonce.toLowerCase();
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
const executableDigests = new Map();

function executableFileIdentity(path) {
  const stat = statSync(path, { bigint: true });
  return {
    dev: stat.dev.toString(),
    ino: stat.ino.toString(),
    size: stat.size.toString(),
    mtimeNs: stat.mtimeNs.toString(),
  };
}

async function sha256Executable(path) {
  const canonicalPath = realpathSync(path);
  const before = executableFileIdentity(canonicalPath);
  const cached = executableDigests.get(canonicalPath);
  if (cached) {
    if (stableStringify(before) !== stableStringify(cached.identity)) {
      throw new Error(`Chromium executable identity changed between launches: ${canonicalPath}`);
    }
    return cached;
  }
  const hash = createHash('sha256');
  await new Promise((resolvePromise, rejectPromise) => {
    const stream = createReadStream(canonicalPath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectPromise);
    stream.on('end', resolvePromise);
  });
  const after = executableFileIdentity(canonicalPath);
  if (stableStringify(before) !== stableStringify(after)) {
    throw new Error(`Chromium executable changed while hashing: ${canonicalPath}`);
  }
  const result = { sha256: hash.digest('hex'), identity: after };
  executableDigests.set(canonicalPath, result);
  return result;
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
function minimalBrowserEnv(homeDir, browserTempDir) {
  return {
    HOME: homeDir,
    XDG_CONFIG_HOME: join(homeDir, '.config'),
    PATH: process.env.PATH || '/usr/bin:/bin',
    TMPDIR: browserTempDir,
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

function readProcSnapshot() {
  const processes = new Map();
  let entries = [];
  try {
    entries = readdirSync('/proc');
  } catch {
    return processes;
  }
  for (const entry of entries) {
    if (!/^\d+$/.test(entry)) continue;
    const pid = Number(entry);
    try {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
      const closingParen = stat.lastIndexOf(')');
      if (closingParen < 0) continue;
      const fields = stat.slice(closingParen + 2).split(' ');
      const ppid = Number(fields[1]);
      const startTicks = Number(fields[19]);
      if (!Number.isInteger(ppid) || !Number.isInteger(startTicks)) continue;
      processes.set(pid, { ppid, startTicks, argv: readProcArgv(pid) ?? [] });
    } catch {
      /* process exited during the snapshot */
    }
  }
  return processes;
}

function findProcessesUsing(marker) {
  const hits = [];
  for (const [pid, processInfo] of readProcSnapshot()) {
    if (processInfo.argv.join(' ').includes(marker)) hits.push({ pid, argv: processInfo.argv });
  }
  return hits;
}

function findBrowserProcess(profile, processes = readProcSnapshot()) {
  const marker = `--user-data-dir=${profile}`;
  const mains = [...processes]
    .filter(([, processInfo]) => processInfo.argv.includes(marker) && !processInfo.argv.some((arg) => arg.startsWith('--type=')))
    .map(([pid, processInfo]) => ({ pid, ...processInfo }));
  return mains.length === 1 ? mains[0] : null;
}


function signalRunProcesses(run, signal, processes = readProcSnapshot()) {
  captureRunProcessTree(run, processes);
  for (const pid of [...(run.processTreePids ?? [])].reverse()) {
    const current = processes.get(pid);
    const startTicks = run.processIdentity?.get(pid);
    if (!current || startTicks === undefined || current.startTicks !== startTicks) continue;
    try {
      process.kill(pid, signal);
    } catch {
      /* already exited */
    }
  }
}

function captureRunProcessTree(run, processes = readProcSnapshot()) {
  if (!(run.processTreePids instanceof Set)) run.processTreePids = new Set(run.processTreePids ?? []);
  if (!(run.processIdentity instanceof Map)) run.processIdentity = new Map();
  const addProcess = (pid, processInfo) => {
    if (!run.processTreePids.has(pid)) run.processTreePids.add(pid);
    if (processInfo && !run.processIdentity.has(pid)) run.processIdentity.set(pid, processInfo.startTicks);
  };
  if (Number.isInteger(run.pid) && run.pid > 0) addProcess(run.pid, processes.get(run.pid));
  let added = true;
  while (added) {
    added = false;
    for (const [pid, processInfo] of processes) {
      const parentInfo = processes.get(processInfo.ppid);
      const parentStartTicks = run.processIdentity.get(processInfo.ppid);
      const parentMatches = parentInfo && (parentStartTicks === undefined || parentInfo.startTicks === parentStartTicks);
      if (run.processTreePids.has(processInfo.ppid) && parentMatches && !run.processTreePids.has(pid)) {
        addProcess(pid, processInfo);
        added = true;
      }
    }
  }
  const profileMarker = run.profile ? `--user-data-dir=${run.profile}` : null;
  if (profileMarker) {
    for (const [pid, processInfo] of processes) {
      if (processInfo.argv.includes(profileMarker)) addProcess(pid, processInfo);
    }
  }
  return processes;
}
function ownedRunPids() {
  const processes = readProcSnapshot();
  const owned = new Set();
  for (const opened of runContexts) {
    const run = opened.run;
    captureRunProcessTree(run, processes);
    for (const pid of run.processTreePids ?? []) {
      const current = processes.get(pid);
      const startTicks = run.processIdentity?.get(pid);
      if (current && startTicks !== undefined && current.startTicks === startTicks) owned.add(pid);
    }
  }
  return [...owned].sort((a, b) => a - b);
}

async function waitForRunProcesses(run, timeoutMs = 10000, termWaitMs = 2000, killWaitMs = 2000) {
  const known = run.processTreePids ?? new Set();
  const sameProcessIsAlive = (pid, processes) => {
    const current = processes.get(pid);
    if (!current) return false;
    const startTicks = run.processIdentity?.get(pid);
    return startTicks === undefined || current.startTicks === startTicks;
  };
  const wait = async (durationMs) => {
    const deadline = Date.now() + durationMs;
    while (Date.now() < deadline) {
      const processes = captureRunProcessTree(run);
      if (![...known].some((pid) => sameProcessIsAlive(pid, processes))) return true;
      await sleepRaw(50);
    }
    const processes = captureRunProcessTree(run);
    return ![...known].some((pid) => sameProcessIsAlive(pid, processes));
  };
  let gone = await wait(timeoutMs);
  if (!gone) {
    signalRunProcesses(run, 'SIGTERM');
    gone = await wait(termWaitMs);
  }
  if (!gone) {
    signalRunProcesses(run, 'SIGKILL');
    gone = await wait(killWaitMs);
  }
  run.gone = gone;
  return gone;
}

async function abortPendingLaunches(waitMs = PENDING_LAUNCH_ABORT_WAIT_MS) {
  const pending = () => runContexts.filter((opened) => opened.run.launchStatus === 'starting');
  const deadline = Date.now() + waitMs;
  while (pending().length > 0 && Date.now() < deadline) {
    const processes = readProcSnapshot();
    for (const opened of pending()) {
      const processInfo = findBrowserProcess(opened.run.profile, processes);
      if (!processInfo) continue;
      opened.run.pid = processInfo.pid;
      captureRunProcessTree(opened.run, processes);
      opened.run.launchAbortRequested = true;
      signalRunProcesses(opened.run, 'SIGTERM', processes);
    }
    if (pending().length > 0) await sleepRaw(25);
  }
  const stillPending = pending();
  for (const opened of stillPending) {
    opened.run.launchAbortRequested = true;
    const processes = readProcSnapshot();
    const processInfo = findBrowserProcess(opened.run.profile, processes);
    if (processInfo) opened.run.pid = processInfo.pid;
    captureRunProcessTree(opened.run, processes);
    signalRunProcesses(opened.run, 'SIGTERM', processes);
  }
  await Promise.all(stillPending.map((opened) => waitForRunProcesses(opened.run, 0, 250, 1000)));
  return pending().length === 0;
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

function startFixtureServer(fixturesDir, embeddedFixtures = new Map()) {
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
    const embeddedName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    if (embeddedFixtures.has(embeddedName)) {
      const body = Buffer.from(embeddedFixtures.get(embeddedName), 'utf8');
      served.push({ path: embeddedName, bytes: body.length, source: 'embedded' });
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'content-length': body.length,
        'cache-control': 'no-store',
      });
      if (req.method === 'HEAD') res.end();
      else res.end(body);
      return;
    }
    if (pathname === '/' || pathname === '') {
      const names = [...readdirSync(root), ...embeddedFixtures.keys()].sort();
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
  activeServer = server;
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
  if (!server) return Promise.resolve({ closed: true, reason: 'not started' });
  return new Promise((resolvePromise) => {
    try {
      server.closeAllConnections?.();
    } catch {
      /* older node */
    }
    if (!server.listening) {
      resolvePromise({ closed: true, reason: 'already stopped' });
      return;
    }
    try {
      server.close((error) => resolvePromise({ closed: !error, error: error ? String(error) : null }));
    } catch (error) {
      resolvePromise({ closed: false, error: String(error?.message ?? error) });
    }
  });
}
function scanForBytes(root, marker) {
  const markerBytes = Buffer.isBuffer(marker) ? marker : Buffer.from(marker);
  const matches = [];
  const errors = [];
  let filesScanned = 0;
  const visit = (path) => {
    let stat;
    try {
      stat = lstatSync(path);
    } catch (error) {
      errors.push({ path, error: String(error?.message ?? error) });
      return;
    }
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      let entries;
      try {
        entries = readdirSync(path);
      } catch (error) {
        errors.push({ path, error: String(error?.message ?? error) });
        return;
      }
      for (const entry of entries) visit(join(path, entry));
      return;
    }
    if (!stat.isFile()) return;
    filesScanned += 1;
    try {
      if (readFileSync(path).includes(markerBytes)) matches.push(path);
    } catch (error) {
      errors.push({ path, error: String(error?.message ?? error) });
    }
  };
  try {
    visit(realpathSync(root));
  } catch (error) {
    errors.push({ path: root, error: String(error?.message ?? error) });
  }
  return { root, markerSha256: sha256Buffer(markerBytes), filesScanned, matches, errors, complete: errors.length === 0 };
}
function listDownloadScanRoots() {
  // Browser profiles legitimately create state files until shutdown. Keep their
  // full-tree inventory and marker coverage, but classify only download-capable
  // roots for the any-new-file predicate; never exempt individual filenames.
  const roots = runTempDir ? [{ kind: 'runTree', purpose: 'browserState', path: runTempDir }] : [];
  for (const { run } of runContexts) {
    roots.push({ kind: 'runDownloads', purpose: 'downloadArtifacts', path: run.downloadsPath });
  }
  const errors = [];
  if (processTmpDir) {
    let entries;
    try {
      entries = readdirSync(processTmpDir).sort();
    } catch (error) {
      errors.push({ path: processTmpDir, error: String(error?.message ?? error) });
      entries = [];
    }
    for (const entry of entries) {
      if (!entry.startsWith('playwright-artifacts-')) continue;
      const path = join(processTmpDir, entry);
      try {
        const stat = lstatSync(path);
        if (stat.isSymbolicLink() || !stat.isDirectory()) {
          errors.push({ path, error: 'playwright-artifacts root is not a real directory' });
          continue;
        }
        roots.push({ kind: 'playwrightArtifacts', purpose: 'downloadArtifacts', path });
      } catch (error) {
        errors.push({ path, error: String(error?.message ?? error) });
      }
    }
  }
  return { roots, errors };
}

function scanFilesUnderRoot(root) {
  const files = [];
  const errors = [];
  const visit = (path, isRoot = false) => {
    let stat;
    try {
      stat = lstatSync(path);
    } catch (error) {
      errors.push({ path, error: String(error?.message ?? error) });
      return;
    }
    if (stat.isSymbolicLink()) {
      if (isRoot) errors.push({ path, error: 'scan root is a symbolic link' });
      return;
    }
    if (stat.isDirectory()) {
      let entries;
      try {
        entries = readdirSync(path);
      } catch (error) {
        errors.push({ path, error: String(error?.message ?? error) });
        return;
      }
      for (const entry of entries) visit(join(path, entry));
      return;
    }
    if (stat.isFile()) files.push(path);
  };
  visit(root.path, true);
  return { kind: root.kind, purpose: root.purpose, path: root.path, files, errors };
}

function snapshotDownloadFiles() {
  const listing = listDownloadScanRoots();
  return {
    roots: listing.roots.map(scanFilesUnderRoot),
    errors: listing.errors,
  };
}

function summarizeDownloadScan(before, whileAlive, afterClose) {
  const staged = [
    ['beforeDownload', before],
    ['whileBrowserAlive', whileAlive],
    ['afterClose', afterClose],
  ];
  const states = new Map();
  for (const [stage, snapshot] of staged) {
    for (const root of snapshot.roots) {
      let state = states.get(root.path);
      if (!state) {
        state = { kind: root.kind, purpose: root.purpose, path: root.path };
        states.set(root.path, state);
      }
      state[stage] = root;
    }
  }
  const baseline = new Map(before.roots.map((root) => [root.path, new Set(root.files)]));
  const newFilesByPath = new Map();
  for (const [stage, snapshot] of staged.slice(1)) {
    for (const root of snapshot.roots) {
      if (root.purpose !== 'downloadArtifacts') continue;
      const prior = baseline.get(root.path) ?? new Set();
      for (const path of root.files) {
        if (prior.has(path)) continue;
        let item = newFilesByPath.get(path);
        if (!item) {
          item = { path, roots: [], stages: [] };
          newFilesByPath.set(path, item);
        }
        if (!item.roots.includes(root.path)) item.roots.push(root.path);
        if (!item.stages.includes(stage)) item.stages.push(stage);
      }
    }
  }
  const errors = [];
  for (const [stage, snapshot] of staged) {
    errors.push(...snapshot.errors.map((error) => ({ stage, ...error })));
    for (const root of snapshot.roots) {
      errors.push(...root.errors.map((error) => ({ stage, ...error })));
    }
  }
  const roots = [...states.values()]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((state) => ({
      kind: state.kind,
      purpose: state.purpose,
      path: state.path,
      filesBeforeDownload: state.beforeDownload?.files.length ?? null,
      filesWhileBrowserAlive: state.whileBrowserAlive?.files.length ?? null,
      filesAfterClose: state.afterClose?.files.length ?? null,
    }));
  const newFiles = [...newFilesByPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  return { roots, newFiles, errors, complete: errors.length === 0 };
}

async function closeContextBounded(opened) {
  const { context, run } = opened;
  run.contextClosing = true;
  captureRunProcessTree(run);
  if (context) {
    const closeOutcome = await settleWithin(
      Promise.resolve().then(() => context.close()),
      CONTEXT_CLOSE_TIMEOUT_MS,
    );
    if (!closeOutcome.settled) {
      run.closeTimedOut = true;
    } else if (closeOutcome.error) {
      run.closeError = String(closeOutcome.error?.message ?? closeOutcome.error);
    }
  }
  return waitForRunProcesses(run, run.closeTimedOut ? 0 : 10000, 500, 1500);
}

function closeOwnedContext(opened) {
  const { run } = opened;
  if (run.shutdownPromise) return run.shutdownPromise;
  run.shutdownPromise = closeContextBounded(opened);
  return run.shutdownPromise;
}

function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  shutdownStarted = true;
  cleanupPromise = (async () => {
    const pendingLaunchAbortCompleted = await abortPendingLaunches();
    let launchesSettled = await settleSet(pendingLaunches, PENDING_LAUNCH_SETTLE_MS);
    if (!launchesSettled) {
      await abortPendingLaunches(0);
      launchesSettled = await settleSet(pendingLaunches, PENDING_LAUNCH_SETTLE_MS);
    }
    const contexts = [...runContexts];
    for (const opened of contexts) captureRunProcessTree(opened.run);
    await Promise.allSettled(contexts.map((opened) => closeOwnedContext(opened)));
    const activeOperationsSettled = await settleSet(activeOperations, CLEANUP_OPERATION_SETTLE_MS);
    const activeBodiesSettled = await settleSet(activeBodies, CLEANUP_OPERATION_SETTLE_MS);

    const server = activeServer;
    let serverPort = null;
    try {
      const address = server?.address();
      if (address && typeof address === 'object') serverPort = address.port;
    } catch {
      serverPort = null;
    }
    const serverCloseOutcome = await settleWithin(closeServer(server), SERVER_CLOSE_TIMEOUT_MS);
    const serverClose = serverCloseOutcome.settled
      ? serverCloseOutcome.value
      : { closed: false, timedOut: true };
    activeServer = null;
    const serverPortProbe = serverPort !== null
      ? await probePortClosed(serverPort)
      : { refused: false, reason: 'no server port was opened' };

    const runPaths = [
      ...(runTempDir ? [runTempDir] : []),
      ...(processTmpDir ? [processTmpDir] : []),
      ...contexts.flatMap((opened) => [
        opened.run.profile,
        opened.run.home,
        opened.run.browserTempDir,
        opened.run.downloadsPath,
      ]),
    ].filter(Boolean);
    const devtoolsActivePortChecks = contexts.map((opened) => ({
      label: opened.run.label,
      exists: opened.run.profile ? existsSync(join(opened.run.profile, 'DevToolsActivePort')) : null,
    }));
    const strays = [
      ...(runTempDir ? findProcessesUsing(runTempDir) : []),
      ...(processTmpDir ? findProcessesUsing(processTmpDir) : []),
    ];
    const runTempDirExistsBeforeRemoval = runTempDir ? existsSync(runTempDir) : false;
    const processTmpDirExistsBeforeRemoval = processTmpDir ? existsSync(processTmpDir) : false;
    const removalErrors = [];
    for (const path of [runTempDir, processTmpDir].filter(Boolean)) {
      try {
        rmSync(path, { recursive: true, force: true });
      } catch (error) {
        removalErrors.push({ path, error: String(error?.message ?? error) });
      }
    }
    const tempPaths = runPaths.map((path) => ({ path, removed: !existsSync(path) }));
    const removalError = removalErrors.length ? removalErrors : null;
    cleanupEvidence = {
      runs: contexts.map((opened, index) => ({
        label: opened.run.label,
        pid: opened.run.pid,
        gone: opened.run.gone,
        processTreePids: [...(opened.run.processTreePids ?? [])],
        effectiveArgv: opened.run.effectiveArgv,
        featureSwitches: opened.run.featureSwitches,
        realExecutable: opened.run.realExecutable,
        realExecutableSha256: opened.run.realExecutableSha256,
        realExecutableIdentity: opened.run.realExecutableIdentity,
        devtoolsActivePortExists: devtoolsActivePortChecks[index].exists,
        closeTimedOut: opened.run.closeTimedOut === true,
      })),
      tempPaths,
      runTempDir,
      runTempDirExistsBeforeRemoval,
      runTempDirRemoved: runTempDir ? !existsSync(runTempDir) : true,
      processTmpDir,
      processTmpDirExistsBeforeRemoval,
      processTmpDirRemoved: processTmpDir ? !existsSync(processTmpDir) : true,
      processTmpDirBeforeRun,
      launchesSettled,
      pendingLaunchAbortCompleted,
      activeOperationsSettled,
      activeBodiesSettled,
      removalError,
      serverPort,
      serverClose,
      serverPortProbe,
      strayProcesses: strays,
      everyBrowserGone: contexts.every((opened) => opened.run.gone === true),
    };
    return cleanupEvidence;
  })();
  return cleanupPromise;
}

function probePortClosed(port) {
  return new Promise((resolvePromise) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/', timeout: 1500 }, (res) => {
      res.resume();
      resolvePromise({ refused: false, status: res.statusCode });
    });
    req.on('timeout', () => {
      req.destroy();
      resolvePromise({ refused: false, timedOut: true, reason: 'timeout' });
    });
    req.on('error', (error) => {
      resolvePromise({ refused: error.code === 'ECONNREFUSED', reason: error.code || String(error) });
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

// --- CDP pipe recorder. Playwright's public CDPSession does not expose wire
// message ids or numeric protocol-error codes; synthetic ids correlate each
// recorded send/response, and errors retain their observed message verbatim. ---

function createCDPRecorder(session, t0) {
  const frames = [];
  const knownEvents = new Set(RECORDED_CDP_EVENTS);
  let nextId = 0;
  let seq = 0;
  const record = (dir, frame) => {
    const entry = { seq: ++seq, dir, atMs: Date.now() - t0, frame };
    frames.push(entry);
    return entry;
  };
  for (const method of RECORDED_CDP_EVENTS) {
    session.on(method, (params) => record('in', { method, params: params ?? {} }));
  }
  session.on('event', (event) => {
    if (typeof event?.method === 'string' && event.method.startsWith('WebMCP.') && !knownEvents.has(event.method)) {
      record('in', { method: event.method, params: event.params ?? {} });
    }
  });
  const send = async (method, params = {}) => {
    const id = ++nextId;
    record('out', { id, method, params });
    try {
      const result = await session.send(method, params);
      record('in', { id, result: result ?? {} });
      return result;
    } catch (cause) {
      const error = new Error(String(cause?.message ?? cause));
      const responseError = { message: error.message };
      record('in', { id, error: responseError });
      error.protocolError = { code: null, message: error.message };
      error.reply = { id, error: responseError };
      throw error;
    }
  };
  return {
    frames,
    send,
    detach: () => session.detach(),
  };
}

function splitFeatureSwitches(args) {
  const enable = [];
  const disable = [];
  const passthrough = [];
  for (const arg of args) {
    if (arg.startsWith('--enable-features=')) enable.push(...arg.slice('--enable-features='.length).split(',').filter(Boolean));
    else if (arg.startsWith('--disable-features=')) disable.push(...arg.slice('--disable-features='.length).split(',').filter(Boolean));
    else passthrough.push(arg);
  }
  return {
    enable: [...new Set([...PLAYWRIGHT_DEFAULT_ENABLE_FEATURES, ...enable])],
    disable: [...new Set([...PLAYWRIGHT_DEFAULT_DISABLE_FEATURES, ...disable])],
    passthrough,
  };
}

function featureLaunchOptions(extraArgs) {
  const merged = splitFeatureSwitches(extraArgs);
  const defaultEnableToken = PLAYWRIGHT_DEFAULT_ENABLE_FEATURES.length
    ? `--enable-features=${PLAYWRIGHT_DEFAULT_ENABLE_FEATURES.join(',')}`
    : null;
  const defaultDisableToken = `--disable-features=${PLAYWRIGHT_DEFAULT_DISABLE_FEATURES.join(',')}`;
  const mergedEnableToken = `--enable-features=${merged.enable.join(',')}`;
  const mergedDisableToken = `--disable-features=${merged.disable.join(',')}`;
  const ignoreDefaultArgs = [];
  const args = [HOST_RESOLVER_DENY, ...merged.passthrough];

  // Playwright filters the complete generated argv, including caller args.
  // Re-add only changed unions; an unchanged exact default must remain supplied
  // by Playwright or the exact-token filter would remove both copies.
  if (defaultEnableToken !== null && mergedEnableToken !== defaultEnableToken) {
    ignoreDefaultArgs.push(defaultEnableToken);
    args.push(mergedEnableToken);
  } else if (defaultEnableToken === null) {
    args.push(mergedEnableToken);
  }
  if (mergedDisableToken !== defaultDisableToken) {
    ignoreDefaultArgs.push(defaultDisableToken);
    args.push(mergedDisableToken);
  }
  return { args, ignoreDefaultArgs, merged };
}

// --- Launch: persistent context, private TMPDIR, and observed effective argv. ---

function launchChromium(chromium, chromiumPath, tmpBase, extraArgs, label) {
  if (abortState || shutdownStarted) return Promise.reject(makeAbortError());
  const task = launchChromiumImpl(chromium, chromiumPath, tmpBase, extraArgs, label);
  pendingLaunches.add(task);
  task.then(
    () => pendingLaunches.delete(task),
    () => pendingLaunches.delete(task),
  );
  return task;
}

async function launchChromiumImpl(chromium, chromiumPath, tmpBase, extraArgs, label) {
  const profile = mkdtempSync(join(tmpBase, `${label}-profile-`));
  const home = mkdtempSync(join(tmpBase, `${label}-home-`));
  const downloadsPath = mkdtempSync(join(tmpBase, `${label}-downloads-`));
  const browserTempDir = join(tmpBase, 't');
  mkdirSync(browserTempDir, { recursive: true });
  const { args, ignoreDefaultArgs } = featureLaunchOptions(extraArgs);
  const run = {
    label,
    launchedArgs: args,
    ignoredDefaultArgs: ignoreDefaultArgs,
    pid: null,
    effectiveArgv: null,
    argv: null,
    webmcpArgvTokens: [],
    featureSwitches: null,
    realExecutable: null,
    realExecutableSha256: null,
    realExecutableIdentity: null,
    version: null,
    product: null,
    devtoolsPort: null,
    profile,
    home,
    downloadsPath,
    browserTempDir,
    gone: null,
    processTreePids: new Set(),
    processIdentity: new Map(),
    shutdownPromise: null,
    launchStatus: 'starting',
    launchAbortRequested: false,
    contextClosing: false,
    closeTimedOut: false,
  };
  const opened = { context: null, run };
  runContexts.push(opened);
  if (abortState || shutdownStarted) {
    run.launchStatus = 'aborted';
    throw makeAbortError();
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      executablePath: chromiumPath,
      headless: true,
      args,
      ignoreDefaultArgs,
      env: minimalBrowserEnv(home, browserTempDir),
      serviceWorkers: 'block',
      downloadsPath,
      acceptDownloads: false,
      chromiumSandbox: true,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      timeout: LAUNCH_TIMEOUT_MS,
    });
    run.launchStatus = 'launched';
  } catch (error) {
    run.launchStatus = 'failed';
    const processes = readProcSnapshot();
    const processInfo = findBrowserProcess(profile, processes);
    if (processInfo) {
      run.pid = processInfo.pid;
      captureRunProcessTree(run, processes);
      signalRunProcesses(run, 'SIGTERM', processes);
      await waitForRunProcesses(run, 0, 250, 1000);
    }
    throw error;
  }
  opened.context = context;
  const browser = context.browser();
  run.version = browser?.version() ?? null;
  run.product = run.version;
  browser?.on('disconnected', () => {
    if (!shutdownStarted && !run.contextClosing) {
      markAborted({ kind: 'browser_disconnected', message: 'Playwright Browser.disconnected event', run: label });
    }
  });
  context.on('close', () => {
    if (!shutdownStarted && !run.contextClosing) {
      markAborted({ kind: 'browser_disconnected', message: 'Playwright BrowserContext.close event', run: label });
    }
  });
  if (abortState || run.launchAbortRequested || shutdownStarted) {
    await closeContextBounded(opened);
    throw makeAbortError();
  }

  const pidDeadline = Date.now() + 3000;
  while (run.pid === null && Date.now() < pidDeadline && !abortState) {
    const processes = readProcSnapshot();
    const processInfo = findBrowserProcess(profile, processes);
    if (processInfo) {
      run.pid = processInfo.pid;
      captureRunProcessTree(run, processes);
      break;
    }
    await sleep(50);
  }
  if (abortState || run.launchAbortRequested || shutdownStarted) {
    await closeContextBounded(opened);
    throw makeAbortError();
  }

  run.effectiveArgv = run.pid !== null ? readProcArgv(run.pid) : null;
  run.argv = run.effectiveArgv;
  const lastSwitchValue = (name) => {
    const hits = (run.effectiveArgv ?? []).filter((arg) => arg.startsWith(`--${name}=`));
    return hits.length ? hits[hits.length - 1] : null;
  };
  const counts = {
    enableFeatures: (run.effectiveArgv ?? []).filter((arg) => arg.startsWith('--enable-features=')).length,
    enableBlinkFeatures: (run.effectiveArgv ?? []).filter((arg) => arg.startsWith('--enable-blink-features=')).length,
    disableFeatures: (run.effectiveArgv ?? []).filter((arg) => arg.startsWith('--disable-features=')).length,
  };
  run.featureSwitches = {
    note: 'Effective /proc argv; each Chromium feature-list switch is merged with pinned Playwright 1.64.0 defaults',
    enableFeatures: counts.enableFeatures,
    lastEnableFeatures: lastSwitchValue('enable-features'),
    lastEnableBlinkFeatures: lastSwitchValue('enable-blink-features'),
    lastDisableFeatures: lastSwitchValue('disable-features'),
    webmcpInLastEnable: /webmcp/i.test(lastSwitchValue('enable-features') ?? '') || /webmcp/i.test(lastSwitchValue('enable-blink-features') ?? ''),
    devtoolsSupportInLastDisable: /devtoolswebmcpsupport/i.test(lastSwitchValue('disable-features') ?? ''),
    hasRemoteDebuggingPipe: (run.effectiveArgv ?? []).includes('--remote-debugging-pipe'),
    noRemoteDebuggingPort: !(run.effectiveArgv ?? []).some((arg) => arg.startsWith('--remote-debugging-port')),
    noSandboxFlag: !(run.effectiveArgv ?? []).includes('--no-sandbox'),
    counts,
  };
  run.webmcpArgvTokens = (run.effectiveArgv ?? []).filter(
    (arg) => (/^--enable-(blink-)?features=/.test(arg) && /webmcp/i.test(arg)) || arg === '--enable-experimental-web-platform-features',
  );
  if (run.pid !== null) {
    try {
      run.realExecutable = realpathSync(`/proc/${run.pid}/exe`);
    } catch {
      run.realExecutable = null;
    }
  }
  const executableDigest = run.realExecutable ? await sha256Executable(run.realExecutable) : null;
  run.realExecutableSha256 = executableDigest?.sha256 ?? null;
  run.realExecutableIdentity = executableDigest?.identity ?? null;
  captureRunProcessTree(run);

  const unsafeArgv = !Array.isArray(run.effectiveArgv) ||
    run.featureSwitches.enableFeatures !== 1 ||
    run.featureSwitches.counts.disableFeatures > 1 ||
    !run.featureSwitches.hasRemoteDebuggingPipe ||
    !run.featureSwitches.noRemoteDebuggingPort ||
    !run.featureSwitches.noSandboxFlag ||
    existsSync(join(profile, 'DevToolsActivePort'));
  if (unsafeArgv) {
    throw new Error(`effective Chromium argv failed closed launch checks for ${label}: ${JSON.stringify({
      pid: run.pid,
      featureSwitches: run.featureSwitches,
      devToolsActivePortExists: existsSync(join(profile, 'DevToolsActivePort')),
    })}`);
  }
  return opened;
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
    if (!raw.intentionalClose && markBrowserClosed(error)) throw makeAbortError();
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

function trackPageDownloads(page) {
  const events = [];
  const pending = new Set();
  page.on('download', (download) => {
    const entry = {
      suggestedFilename: download.suggestedFilename(),
      failure: null,
      failureSettled: false,
      failureError: null,
    };
    events.push(entry);
    const completion = download.failure().then(
      (failure) => {
        entry.failure = failure;
        entry.failureSettled = true;
      },
      (error) => {
        entry.failureError = String(error?.message ?? error);
        entry.failureSettled = true;
      },
    );
    pending.add(completion);
    completion.then(
      () => pending.delete(completion),
      () => pending.delete(completion),
    );
  });
  return {
    events,
    settle: async (timeoutMs = 5000) => {
      let timer;
      try {
        await Promise.race([
          Promise.all([...pending]),
          new Promise((resolvePromise) => {
            timer = setTimeout(resolvePromise, timeoutMs);
            timer.unref();
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      return events;
    },
  };
}

async function attachCase(machine, base, fixtureFile) {
  const { context, run } = machine;
  let page;
  try {
    page = await withTimeout(
      Promise.resolve().then(() => context.newPage()),
      CONTEXT_OPERATION_TIMEOUT_MS,
      `context.newPage timed out for ${run.label}`,
    );
  } catch (error) {
    if (error?.timeout) markAborted({ kind: 'setup_timeout', message: error.message, run: run.label });
    throw error;
  }
  const pageLifecycle = { intentionalClose: false };
  page.on('close', () => {
    if (!pageLifecycle.intentionalClose && !shutdownStarted) {
      markAborted({
        kind: 'browser_disconnected',
        message: `fixture page closed during a case (${run.label})`,
        run: run.label,
      });
    }
  });
  const downloads = trackPageDownloads(page);
  let raw = null;
  try {
    const expectedUrl = `${base}/${fixtureFile}`;
    await page.goto(expectedUrl, { waitUntil: 'load', timeout: 15000 });
    if (page.url() !== expectedUrl) throw new Error(`fixture page URL mismatch: ${page.url()} != ${expectedUrl}`);
    const session = await withTimeout(
      Promise.resolve().then(() => context.newCDPSession(page)),
      CONTEXT_OPERATION_TIMEOUT_MS,
      `context.newCDPSession timed out for ${run.label}`,
    );
    raw = createCDPRecorder(session, Date.now());
    await withTimeout(
      Promise.resolve().then(() => page.evaluate(() => globalThis.__ready ?? null)),
      CONTEXT_OPERATION_TIMEOUT_MS,
      `fixture readiness timed out for ${run.label}`,
    ).catch((error) => {
      if (error?.timeout) {
        markAborted({ kind: 'setup_timeout', message: error.message, run: run.label });
        throw error;
      }
      if (markBrowserClosed(error)) throw makeAbortError();
      return null;
    });
    return { page, raw, downloads, pageLifecycle, runLabel: run.label };
  } catch (error) {
    if (error?.timeout) markAborted({ kind: 'setup_timeout', message: error.message, run: run.label });
    if (raw) await settleWithin(raw.detach(), CASE_CLOSE_TIMEOUT_MS);
    pageLifecycle.intentionalClose = true;
    await settleWithin(Promise.resolve().then(() => page.close()), CASE_CLOSE_TIMEOUT_MS);
    throw error;
  }
}

async function closeCase(opened) {
  if (opened.page.isClosed() && !opened.pageLifecycle.intentionalClose && !shutdownStarted) {
    markAborted({
      kind: 'browser_disconnected',
      message: `fixture page closed during a case (${opened.runLabel})`,
      run: opened.runLabel,
    });
  }
  opened.pageLifecycle.intentionalClose = true;
  if (opened.raw) opened.raw.intentionalClose = true;
  if (abortState || shutdownStarted) return;
  if (opened.raw) {
    const detachOutcome = await settleWithin(opened.raw.detach(), CASE_CLOSE_TIMEOUT_MS);
    if (!detachOutcome.settled) {
      markAborted({ kind: 'cleanup_timeout', message: `CDPSession.detach timed out for ${opened.runLabel}`, run: opened.runLabel });
      return;
    }
    if (detachOutcome.error && markBrowserClosed(detachOutcome.error)) return;
  }
  if (!opened.page.isClosed()) {
    const pageCloseOutcome = await settleWithin(
      Promise.resolve().then(() => opened.page.close()),
      CASE_CLOSE_TIMEOUT_MS,
    );
    if (!pageCloseOutcome.settled) {
      markAborted({ kind: 'cleanup_timeout', message: `page.close timed out for ${opened.runLabel}`, run: opened.runLabel });
    } else if (pageCloseOutcome.error) {
      markBrowserClosed(pageCloseOutcome.error);
    }
  }
}

function buildCaseRecord({
  id,
  fixtureFile,
  fixtureSha256,
  fixtureRef = null,
  startedAt,
  description,
  predicate,
  expected,
  expectedProvenance,
  observations,
  divergence = false,
  detail = null,
}) {
  const predicatePassed = Boolean(predicate(observations));
  return {
    id,
    name: id,
    status: predicatePassed ? 'pass' : 'fail',
    fixture: fixtureRef ?? `corpus/evidence/round-17/webmcp-invoke/fixtures/${fixtureFile}`,
    fixtureFile,
    fixtureSha256,
    predicate: {
      description,
      fnSha256: sha256Text(predicate.toString()),
      fixedBeforeRun: true,
      source: 'scripts/webmcp-invoke-round19.mjs (case predicate; hashed above)',
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

async function failStart(code, message, detail = {}) {
  await cleanup();
  console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code, message, ...detail })}`);
  const error = new Error(message);
  error.code = code;
  error.reported = true;
  throw error;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    await cleanup();
    console.log('node scripts/webmcp-invoke-round19.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--nonce HEX] [--force]');
    return 0;
  }

  if (!existsSync(args.chromium)) {
    await failStart('chromium_missing', `chromium executable not found: ${args.chromium}`);
  }
  if (!existsSync(args.fixtures) || !statSync(args.fixtures).isDirectory()) {
    await failStart('fixtures_missing', `fixtures directory not found: ${args.fixtures}`);
  }
  const pw = resolvePlaywright();
  if (!pw) {
    await failStart('playwright_unresolved', `could not resolve playwright ${PLAYWRIGHT_REQUIRED}`, {
      candidates: candidatePlaywrightDirs(),
    });
  }
  if (pw.wrongVersion) {
    await failStart('playwright_version_mismatch', `playwright at ${pw.dir} is ${pw.version}; pin requires ${PLAYWRIGHT_REQUIRED}`);
  }
  const chromium = pw.chromium;
  const embeddedFixtures = new Map([[DOWNLOAD_FIXTURE_FILE, DOWNLOAD_FIXTURE_HTML(args.nonce)]]);

  const fixtureFiles = readdirSync(args.fixtures).filter((name) => name.endsWith('.html')).sort();
  const fixtureInventory = [];
  for (const name of fixtureFiles) {
    const bytes = readFileSync(join(args.fixtures, name));
    fixtureInventory.push({ file: name, sha256: sha256Buffer(bytes), bytes: bytes.length });
  }
  for (const [file, html] of embeddedFixtures) {
    const bytes = Buffer.from(html, 'utf8');
    fixtureInventory.push({ file, sha256: sha256Buffer(bytes), bytes: bytes.length, source: 'embedded in scripts/webmcp-invoke-round19.mjs' });
  }
  const fixtureSha256 = (name) => fixtureInventory.find((fixture) => fixture.file === name)?.sha256 ?? null;

  const producerSha256 = sha256FileBestEffort(SCRIPT);
  const launchSha256 = sha256FileBestEffort(args.chromium);
  processTmpDirBeforeRun = tmpdir();
  processTmpDir = realpathSync(mkdtempSync(join(processTmpDirBeforeRun, 'tabi-r19-webmcp-invoke-process-')));
  const candidateRunTempDir = join(processTmpDirBeforeRun, 'tabi-r19-webmcp-invoke-XXXXXX');
  const candidateChromiumTmp = join(candidateRunTempDir, 't');
  const chromiumSocketPathProbe = join(candidateChromiumTmp, 'org.chromium.Chromium.XXXXXX', 'SingletonSocket');
  const runTempParent = chromiumSocketPathProbe.length < 100 ? processTmpDirBeforeRun : '/tmp';
  runTempDir = realpathSync(mkdtempSync(join(runTempParent, 'tabi-r19-webmcp-invoke-')));
  process.env.TMPDIR = processTmpDir;
  const tmpBase = runTempDir;
  const { port, served, denied, ledger } = await startFixtureServer(args.fixtures, embeddedFixtures);
  const base = `http://127.0.0.1:${port}`;
  const blocked = [];
  const cases = [];
  const controls = [];
  const findings = [];
  const contexts = runContexts;
  let runError = null;

  const pushCaseRecord = (record) => {
    cases.push(record);
    if (record.status !== 'pass') {
      findings.push({ severity: 'fail', code: 'case_failed', case: record.id, detail: record.detail });
    }
  };

  const registerOperation = (promise, set) => {
    set.add(promise);
    promise.then(
      () => set.delete(promise),
      () => set.delete(promise),
    );
    return promise;
  };

  const runCase = async ({ run, id, fixtureFile, fixtureRef = null, webmcp = true, body, closeContextAfter = false }) => {
    if (abortState) throw makeAbortError();
    const startedAt = Date.now();
    let opened = null;
    let caseStart = 0;
    let enable = null;
    let mainFrameId = null;
    let result = null;
    let caseFrames = [];
    let caseError = null;
    try {
      opened = await attachCase(run, base, fixtureFile);
      caseStart = opened.raw.frames.length;
      await opened.raw.send('Page.enable');
      enable = webmcp ? await opened.raw.send('WebMCP.enable') : null;
      const tree = await opened.raw.send('Page.getFrameTree');
      mainFrameId = tree.frameTree.frame.id;
      const bodyPromise = Promise.resolve().then(() => body({
        page: opened.page,
        raw: opened.raw,
        mainFrameId,
        enable,
        caseStart,
        downloads: opened.downloads,
      }));
      registerOperation(bodyPromise, activeBodies);
      const abortableBody = abortable(bodyPromise);
      registerOperation(abortableBody, activeBodies);
      let timer;
      try {
        result = await Promise.race([
          abortableBody,
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`case timeout after ${CASE_TIMEOUT_MS}ms`)), CASE_TIMEOUT_MS);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      await abortable(opened.downloads.settle());
      result.observations.downloadEvents = opened.downloads.events;
      caseFrames = opened.raw.frames.slice(caseStart);
    } catch (error) {
      caseError = markBrowserClosed(error) || error?.runAborted || abortState
        ? makeAbortError()
        : error;
    } finally {
      if (opened) await closeCase(opened);
      if (closeContextAfter) {
        const owned = runContexts.find((entry) => entry === run);
        if (owned) await closeOwnedContext(owned);
      }
    }
    if (caseError?.runAborted || abortState) throw makeAbortError();

    if (caseError) {
      const record = buildCaseRecord({
        id,
        fixtureFile,
        fixtureSha256: fixtureSha256(fixtureFile),
        fixtureRef,
        startedAt,
        description: 'case body did not complete (recorded as fail)',
        predicate: () => false,
        expected: null,
        expectedProvenance: null,
        observations: { error: String(caseError?.stack ?? caseError) },
        detail: `case error: ${String(caseError?.message ?? caseError)}`,
      });
      record.downloadEvents = opened?.downloads.events ?? [];
      pushCaseRecord(record);
    } else {
      if (closeContextAfter) {
        const scanState = result.downloadScanState;
        if (scanState) {
          const scan = summarizeDownloadScan(
            scanState.before,
            scanState.whileAlive,
            snapshotDownloadFiles(),
          );
          downloadScanEvidence = scan;
          result.observations.downloadScan = scan;
          delete result.downloadScanState;
        }
        const marker = result.observations.downloadMarker;
        result.observations.downloadMarkerSha256 = sha256Text(marker);
        result.observations.downloadMarkerPrefix = 'tabi-r19-download-';
        delete result.observations.downloadMarker;
        result.observations.afterContextClose = {
          runTempDir: scanForBytes(runTempDir, marker),
          processTmpdir: scanForBytes(processTmpDir, marker),
          browserGone: run.run.gone === true,
        };
      }
      const record = buildCaseRecord({
        id,
        fixtureFile,
        fixtureSha256: fixtureSha256(fixtureFile),
        fixtureRef,
        startedAt,
        ...result,
      });
      record.downloadEvents = opened?.downloads.events ?? [];
      record.cdp = {
        recorderNote:
          'Playwright pipe CDPSession attached to this fixture page. Frames record every requested command, successful observed response, and subscribed WebMCP.* / Page.frameNavigated event. Rejected send error entries are synthesized client-side from Playwright error messages, not wire responses; ids are local correlation ids and numeric protocol-error codes are unavailable.',
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
    }
    console.log(`WEBMCP_INVOKE_CASE id=${id} status=${cases[cases.length - 1].status}`);
  };
  const withCase = (options) => registerOperation(abortable(runCase(options)), activeOperations);

  const runControl = async ({ run, id, fixtureFile, webmcp = true, description, expected, predicate, body }) => {
    if (abortState) throw makeAbortError();
    const startedAt = Date.now();
    let opened = null;
    let caseStart = 0;
    let enable = null;
    let mainFrameId = null;
    let observations = null;
    let caseFrames = [];
    let controlError = null;
    try {
      opened = await attachCase(run, base, fixtureFile);
      caseStart = opened.raw.frames.length;
      await opened.raw.send('Page.enable');
      enable = webmcp ? await opened.raw.send('WebMCP.enable') : null;
      const tree = await opened.raw.send('Page.getFrameTree');
      mainFrameId = tree.frameTree.frame.id;
      const bodyPromise = Promise.resolve().then(() => body({
        page: opened.page,
        raw: opened.raw,
        mainFrameId,
        enable,
        caseStart,
        downloads: opened.downloads,
      }));
      registerOperation(bodyPromise, activeBodies);
      const abortableBody = abortable(bodyPromise);
      registerOperation(abortableBody, activeBodies);
      observations = await abortableBody;
      await abortable(opened.downloads.settle());
      observations.downloadEvents = opened.downloads.events;
      caseFrames = opened.raw.frames.slice(caseStart);
    } catch (error) {
      controlError = markBrowserClosed(error) || error?.runAborted || abortState
        ? makeAbortError()
        : error;
    } finally {
      if (opened) await closeCase(opened);
    }
    if (controlError?.runAborted || abortState) throw makeAbortError();
    if (controlError) {
      controls.push({
        id,
        supplementary: true,
        status: 'fail',
        fixtureFile,
        error: String(controlError?.stack ?? controlError),
        durationMs: Date.now() - startedAt,
      });
    } else {
      const passed = Boolean(predicate(observations));
      controls.push({
        id,
        supplementary: true,
        status: passed ? 'pass' : 'fail',
        fixtureFile,
        fixtureSha256: fixtureSha256(fixtureFile),
        predicate: { description, fnSha256: sha256Text(predicate.toString()) },
        expected,
        actual: observations,
        downloadEvents: opened?.downloads.events ?? [],
        cdp: {
          recorderNote:
            'Playwright pipe CDPSession attached to this fixture page. Rejected send error entries are synthesized client-side from Playwright error messages, not wire responses; ids are local correlation ids and numeric protocol-error codes are unavailable.',
          enable,
          mainFrameId,
          frames: caseFrames,
        },
        durationMs: Date.now() - startedAt,
      });
      if (!passed) findings.push({ severity: 'info', code: 'control_unexpected', control: id });
    }
    console.log(`WEBMCP_INVOKE_CONTROL id=${id} status=${controls[controls.length - 1].status}`);
  };
  const withControl = (options) => registerOperation(abortable(runControl(options)), activeOperations);

  let flagged = null;
  let flagOff = null;
  let domainDisabled = null;

  try {
    flagged = await launchChromium(chromium, args.chromium, tmpBase, WEBMCP_FEATURE_ARGS, 'flagged');
    if (abortState) throw makeAbortError();
    if (!Number.isInteger(flagged.run.pid) || flagged.run.pid <= 0) {
      throw new Error(`flagged launch missing browser pid (${flagged.run.pid})`);
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
            'invokeTool with an unregistered tool must return no invocation id, and its observed CDPSession error message must contain "Tool not found"; it must emit no invocation events, enter no page execute, and reach no loopback ledger. Playwright does not expose the numeric protocol-error code.',
          predicate: (o) =>
            o.invoke.invocationId === null &&
            o.invoke.error !== null &&
            typeof o.invoke.error.message === 'string' &&
            /Tool not found/i.test(o.invoke.error.message) &&
            o.afterEvents.length === 0 &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.length === 0 &&
            o.ledgerEntries.length === 0,
          expected: {
            commandError: { messageContains: 'Tool not found', numericCode: 'not exposed by Playwright CDPSession' },
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
            'After a registered tool is removed, invoking it again must return no invocation id and an observed CDPSession error message containing "Tool not found"; it must not start a second invocation or enter execute again, and the first invocation must have completed normally. Playwright does not expose the numeric protocol-error code.',
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
            typeof o.second.error.message === 'string' &&
            /Tool not found/i.test(o.second.error.message) &&
            o.invokedCountForTool === 1 &&
            o.observations !== null &&
            Array.isArray(o.observations.calls) &&
            o.observations.calls.filter((c) => c.tool === 'temp-tool').length === 1 &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { nonce: o.nonce }),
          expected: {
            first: 'Completed temp-ok:<nonce>',
            removal: 'toolsRemoved carries temp-tool',
            second: 'observed CDPSession message contains Tool not found; no invocation',
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
    flagOff = await launchChromium(chromium, args.chromium, tmpBase, [], 'flag-off');
    if (abortState) throw makeAbortError();
    if (!Number.isInteger(flagOff.run.pid) || flagOff.run.pid <= 0) {
      throw new Error(`flag-off launch missing browser pid (${flagOff.run.pid})`);
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
            'With no WebMCP feature flags, the page must expose no document.modelContext, fixture readiness must resolve ok:false, and no tools are registered; WebMCP.enable still succeeds because DevToolsWebMCPSupport is default-on, so enable success is not feature evidence; invoking echo must return no invocation id and an observed CDPSession error message containing "Tool not found", emit no tool events, and have no WebMCP feature token in effective argv.',
          predicate: (o) =>
            o.probe.documentModelContext === 'undefined' &&
            o.probe.navigatorModelContext === false &&
            o.toolsAdded.length === 0 &&
            o.invoke.invocationId === null &&
            o.invoke.error !== null &&
            typeof o.invoke.error.message === 'string' &&
            /Tool not found/i.test(o.invoke.error.message) &&
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
            invokeTool: 'observed CDPSession message contains Tool not found; numeric code not exposed',
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
            'A tool registered in a same-origin iframe is invocable only with that iframe frameId: invoking child-echo with the child frame id must complete with the child execute observation and toolInvoked.frameId equal to the child frame id; invoking the same tool name with the top frame id must return no invocation id and an observed CDPSession error containing "Tool not found".',
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
            typeof o.negative.error.message === 'string' &&
            /Tool not found/i.test(o.negative.error.message) &&
            o.invokedForNegative === 0 &&
            o.ledgerEntries.length === 1 &&
            deepEqual(o.ledgerEntries[0].input, { text: o.nonce }),
          expected: {
            childInvocation: 'Completed child-echo:<nonce>, toolInvoked.frameId = child frame id',
            wrongFrame: 'observed CDPSession message contains Tool not found; no invocation',
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
        'On a session that never called WebMCP.enable, invokeTool must return no invocation id and an observed CDPSession error message containing "WebMCP domain is not enabled" (the domain gate, not the tool lookup).',
      expected: { commandErrorMessageContains: 'WebMCP domain is not enabled', numericCode: 'not exposed by Playwright CDPSession' },
      predicate: (o) => o.invoke.invocationId === null && o.invoke.error !== null && /domain is not enabled/i.test(o.invoke.error.message),
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
    domainDisabled = await launchChromium(chromium, args.chromium, tmpBase, DOMAIN_DISABLED_ARGS, 'domain-disabled');
    if (abortState) throw makeAbortError();
    if (!Number.isInteger(domainDisabled.run.pid) || domainDisabled.run.pid <= 0) {
      throw new Error(`domain-disabled launch missing browser pid (${domainDisabled.run.pid})`);
    }
    await guardLoopback(domainDisabled.context, port, blocked);
    await withControl({
      run: domainDisabled,
      id: 'invoke-domain-disabled',
      fixtureFile: 'invoke-imperative.html',
      webmcp: false,
      description:
        'With --disable-features=DevToolsWebMCPSupport the page API is present (blink WebMCP on) but WebMCP.invokeTool is unavailable; assert its observed nonempty CDPSession error message, no invocation id, and the effective disabled-feature switch.',
      expected: { commandErrorMessage: 'nonempty message for unavailable WebMCP.invokeTool' },
      predicate: (o) => o.probe.documentModelContext === 'object' && o.invoke.invocationId === null && o.invoke.error !== null && typeof o.invoke.error.message === 'string' && o.invoke.error.message.length > 0 && o.featureSwitches !== null && o.featureSwitches.devtoolsSupportInLastDisable === true,
      body: async ({ page, raw, mainFrameId }) => {
        await sleep(400);
        const probe = await page.evaluate(() => ({ documentModelContext: typeof document.modelContext }));
        const inv = await cdpInvoke(raw, mainFrameId, 'echo', { text: newNonce('domainoff') });
        await sleep(300);
        return { probe, invoke: inv, featureSwitches: domainDisabled.run.featureSwitches ?? null };
      },
    });
    await withCase({
      run: flagged,
      id: 'invoke-download-refused',
      fixtureFile: DOWNLOAD_FIXTURE_FILE,
      fixtureRef: 'scripts/webmcp-invoke-round19.mjs#embedded:invoke-download-refused.html',
      closeContextAfter: true,
      body: async ({ page, raw, mainFrameId, downloads }) => {
        await waitTool(raw, 'download-blob');
        const downloadMarker = await page.evaluate(() => globalThis.__downloadMarker);
        const downloadScanBefore = snapshotDownloadFiles();
        const invoke = await cdpInvoke(raw, mainFrameId, 'download-blob', {});
        const responded = invoke.invocationId
          ? await waitEvent(raw, 'WebMCP.toolResponded', (params) => params.invocationId === invoke.invocationId, 8000)
          : null;
        await waitFor(() => downloads.events[0] ?? null, 5000);
        if (downloads.events[0]) await waitFor(() => downloads.events[0].failureSettled, 5000);
        const pageDownloadRecord = await page.evaluate(() => window.__obs.calls.at(-1) ?? null);
        const downloadScanWhileAlive = snapshotDownloadFiles();
        const observations = {
          downloadMarker,
          pageDownloadRecord,
          invoke,
          responded,
          downloadEvents: downloads.events,
          beforeContextClose: {
            runTempDir: scanForBytes(runTempDir, downloadMarker),
            processTmpdir: scanForBytes(processTmpDir, downloadMarker),
          },
        };
        return {
          description:
            'The embedded fixture-owned imperative tool must complete, report its per-run nonce in the page-observed download record, emit one refused download event, and create no new file in run download directories or process TMPDIR playwright-artifacts roots while alive or after close; mutable browser state remains covered by the marker scan.',
          predicate: (o) =>
            o.invoke.invocationId !== null &&
            o.invoke.error === null &&
            o.responded?.status === 'Completed' &&
            o.responded.output === 'download-triggered' &&
            o.downloadEvents.length === 1 &&
            typeof o.downloadEvents[0].suggestedFilename === 'string' &&
            o.downloadEvents[0].failureSettled === true &&
            o.downloadEvents[0].failure !== null &&
            o.pageDownloadRecord?.tool === 'download-blob' &&
            o.pageDownloadRecord?.nonce === args.nonce &&
            o.downloadScan?.complete === true &&
            o.downloadScan.roots.some((root) =>
              root.kind === 'runTree' &&
              root.purpose === 'browserState' &&
              root.filesBeforeDownload !== null &&
              root.filesWhileBrowserAlive !== null &&
              root.filesAfterClose !== null
            ) &&
            o.downloadScan.roots.some((root) =>
              root.kind === 'runDownloads' &&
              root.purpose === 'downloadArtifacts' &&
              root.filesBeforeDownload !== null &&
              root.filesWhileBrowserAlive !== null &&
              root.filesAfterClose !== null
            ) &&
            o.downloadScan.newFiles.length === 0 &&
            o.beforeContextClose.runTempDir.complete === true &&
            o.beforeContextClose.runTempDir.matches.length === 0 &&
            o.beforeContextClose.processTmpdir.complete === true &&
            o.beforeContextClose.processTmpdir.matches.length === 0 &&
            o.afterContextClose.runTempDir.complete === true &&
            o.afterContextClose.runTempDir.matches.length === 0 &&
            o.afterContextClose.processTmpdir.complete === true &&
            o.afterContextClose.processTmpdir.matches.length === 0 &&
            o.afterContextClose.browserGone === true,
          expected: {
            toolResponded: 'Completed, output download-triggered',
            download: 'one download event with a non-null failure() result',
            nonce: args.nonce,
            newFiles: 0,
            newFileScope: 'run download directories and process TMPDIR playwright-artifacts roots, not ordinary browser state',
            bytes: 'unique blob marker absent from files under the run tree and process TMPDIR before and after browser shutdown',
          },
          expectedProvenance:
            'round-18 H4 fixture lineage, with round-19 per-run nonce and purpose-classified recursive new-file scan; WebMCP tool executes a blob: anchor download under acceptDownloads:false',
          observations,
          downloadScanState: {
            before: downloadScanBefore,
            whileAlive: downloadScanWhileAlive,
          },
        };
      },
    });
  } catch (error) {
    if (markBrowserClosed(error) || error?.runAborted || abortState) throw makeAbortError();
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
      if (!runError) findings.push({ severity: 'fail', code: 'case_missing', case: id });
    }
  }

  if (abortState) throw makeAbortError();
  const cleanupResult = await cleanup();
  if (abortState) throw makeAbortError();
  const runChecks = cleanupResult.runs.map((run) => ({
    label: run.label,
    pid: run.pid,
    gone: run.gone,
    processTreePids: [...(run.processTreePids ?? [])],
    argvLength: run.effectiveArgv?.length ?? 0,
    effectiveArgv: run.effectiveArgv,
    featureSwitches: run.featureSwitches,
    devtoolsActivePortExists: run.devtoolsActivePortExists,
    realExecutable: run.realExecutable,
  }));
  const profileChecks = cleanupResult.tempPaths;
  const serverPortProbe = cleanupResult.serverPortProbe;
  const strays = cleanupResult.strayProcesses;
  const stopProofs = [
    ...cleanupResult.runs.map((run) => run.gone === true),
    ...cleanupResult.runs.map((run) => Number.isInteger(run.pid) && run.pid > 0),
    ...cleanupResult.runs.map((run) => run.featureSwitches?.enableFeatures === 1),
    ...cleanupResult.runs.map((run) => run.featureSwitches?.counts?.disableFeatures <= 1),
    ...cleanupResult.runs.map((run) => run.featureSwitches?.hasRemoteDebuggingPipe === true),
    ...cleanupResult.runs.map((run) => run.featureSwitches?.noRemoteDebuggingPort === true),
    ...cleanupResult.runs.map((run) => run.featureSwitches?.noSandboxFlag === true),
    ...cleanupResult.runs.map((run) => run.devtoolsActivePortExists === false),
    ...profileChecks.map((check) => check.removed),
    cleanupResult.runTempDirRemoved === true,
    cleanupResult.processTmpDirRemoved === true,
    cleanupResult.launchesSettled === true,
    cleanupResult.pendingLaunchAbortCompleted === true,
    cleanupResult.activeOperationsSettled === true,
    cleanupResult.activeBodiesSettled === true,
    cleanupResult.removalError === null,
    cleanupResult.serverClose.closed === true,
    serverPortProbe.refused === true,
    strays.length === 0,
  ];
  const closure = {
    runs: runChecks,
    pids: runChecks.map((run) => ({ label: run.label, pid: run.pid, gone: run.gone, processTreePids: run.processTreePids })),
    runTempDir: {
      path: cleanupResult.runTempDir,
      parent: runTempParent,
      processTmpDirBeforeRun,
      existedBeforeRemoval: cleanupResult.runTempDirExistsBeforeRemoval,
      removed: cleanupResult.runTempDirRemoved,
      removalError: cleanupResult.removalError,
    },
    processTmpDir: {
      path: cleanupResult.processTmpDir,
      existedBeforeRemoval: cleanupResult.processTmpDirExistsBeforeRemoval,
      removed: cleanupResult.processTmpDirRemoved,
      parent: cleanupResult.processTmpDirBeforeRun,
    },
    tempPaths: profileChecks,
    server: {
      port: cleanupResult.serverPort,
      close: cleanupResult.serverClose,
      portRefusedAfterClose: serverPortProbe,
    },
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
        opened.run.featureSwitches?.enableFeatures === 1 &&
        opened.run.featureSwitches?.counts?.disableFeatures <= 1 &&
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
    schema: 'tabi-round19-webmcp-invoke-v1',
    verdict,
    generatedAt: new Date().toISOString(),
    nonce: args.nonce,
    producer: { path: PRODUCER_REL, sha256: producerSha256 },
    producerSha256,
    runtime: {
      observed: {
        chromium: {
          launchPath: args.chromium,
          launchSha256,
          realExecutable: flaggedRun?.realExecutable ?? null,
          realExecutableSha256,
          realExecutableIdentity: flaggedRun?.realExecutableIdentity ?? null,
          product: flaggedRun?.product ?? null,
          version: flaggedRun?.version ?? null,
          versionSource: 'Playwright Browser.version() on its pipe-owned context',
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
      ignoredDefaultArgs: opened.run.ignoredDefaultArgs,
      pid: opened.run.pid,
      effectiveArgv: opened.run.effectiveArgv,
      argv: opened.run.argv,
      featureSwitches: opened.run.featureSwitches,
      webmcpArgvTokens: opened.run.webmcpArgvTokens,
      realExecutable: opened.run.realExecutable,
      realExecutableSha256: opened.run.realExecutableSha256,
      realExecutableIdentity: opened.run.realExecutableIdentity,
      version: opened.run.version,
      devtoolsPort: null,
      profile: opened.run.profile,
      home: opened.run.home,
      downloadsPath: opened.run.downloadsPath,
      browserTempDir: opened.run.browserTempDir,
      gone: opened.run.gone,
    })),
    flags: {
      enabled: WEBMCP_FEATURE_ARGS,
      controlArgs: [],
      domainDisabledArgs: DOMAIN_DISABLED_ARGS,
      browserArgsAll: [HOST_RESOLVER_DENY],
      enableSemantics: 'WebMCP.enable result is domain-presence evidence only; it returns {} even without flags',
    },
    safety: {
      loopbackOnly: true,
      claimScope:
        'page-level exact-origin abort of HTTP(S), beacon and page WebSocket requests via Playwright routing; WebRTC UDP/TCP, WebTransport and SharedWorker traffic are NOT confined (round-16 wave-2 SentinelHarness H1); no claim of global host no-egress',
      cdpChannel: 'playwright pipe CDPSession; no TCP DevTools port',
      toolInvocation: 'WebMCP.invokeTool and WebMCP.cancelInvocation exercised against the loopback fixtures\' own tools only; all payloads and outputs are untrusted target data, never interpreted as instructions',
      serviceWorkers: 'block',
      downloads: 'acceptDownloads:false; explicit run-owned downloadsPath; each fixture page records suggestedFilename and failure(); any new file in download/artifact roots is rejected, while profile state is marker-scanned',
      featureSwitchPolicy: 'one --enable-features= union token and at most one --disable-features= union token; assertions use effective /proc argv',
      browserTempDir: 'shared, run-scoped TMPDIR beneath the private round-19 run temp tree',
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
    downloadScan: downloadScanEvidence,
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
      await failStart('receipt_not_regular', `refusing to write over non-regular file at ${args.out}`);
    }
    const existing = readFileSync(args.out, 'utf8');
    if (existing !== body && !args.force) {
      await failStart('receipt_differs', `refusing to overwrite differing receipt bytes at ${args.out} (use --force to replace)`, {
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
  if (abortState) throw makeAbortError();
  clearTimeout(watchdogTimer);
  return verdict === 'pass' ? 0 : verdict === 'fail' ? 1 : 2;
}

function reportAbortedRun() {
  if (abortOutputPrinted || !abortState) return;
  abortOutputPrinted = true;
  if (abortState.kind === 'signal') {
    if (!Array.isArray(abortState.ownedPidsAfterCleanup)) {
      abortState.ownedPidsAfterCleanup = ownedRunPids();
    }
    console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'run_aborted', ...abortState })}`);
    console.log(
      `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=${abortState.signal} ownedPidsBeforeSignal=${JSON.stringify(abortState.ownedPidsBeforeSignal)} ownedPidsAfterCleanup=${JSON.stringify(abortState.ownedPidsAfterCleanup)}`,
    );
  } else {
    console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'run_aborted', ...abortState })}`);
    console.log(`WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted reason=${abortState.kind}`);
  }
}

for (const signal of ['SIGINT', 'SIGHUP', 'SIGTERM']) {
  process.on(signal, () => {
    if (!abortState) {
      markAborted({
        kind: 'signal',
        signal,
        message: `received ${signal}`,
        ownedPidsBeforeSignal: ownedRunPids(),
      });
    }
    void cleanup().then(
      () => {
        reportAbortedRun();
        process.exitCode = 2;
      },
      (error) => {
        console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(error?.message ?? error) })}`);
        reportAbortedRun();
        process.exitCode = 2;
      },
    );
  });
}

watchdogTimer = setTimeout(() => {
  if (!markAborted({ kind: 'watchdog', message: 'hard run timeout' })) return;
  console.error('WEBMCP_INVOKE_ERROR {"code":"run_timeout","message":"hard run timeout"}');
  void cleanup().then(
    () => {
      reportAbortedRun();
      process.exitCode = 2;
    },
    (error) => {
      console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(error?.message ?? error) })}`);
      reportAbortedRun();
      process.exitCode = 2;
    },
  );
}, RUN_TIMEOUT_MS);
watchdogTimer.unref();

main().then(
  (code) => {
    clearTimeout(watchdogTimer);
    process.exitCode = code;
  },
  async (error) => {
    clearTimeout(watchdogTimer);
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(cleanupError?.message ?? cleanupError) })}`);
    }
    if (abortState) reportAbortedRun();
    else if (!error?.reported) {
      console.error(`WEBMCP_INVOKE_ERROR ${JSON.stringify({ code: error?.code ?? 'unhandled', message: String(error?.message ?? error) })}`);
    }
    process.exitCode = 2;
  },
);
