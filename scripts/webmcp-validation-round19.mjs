#!/usr/bin/env node
// Round-19 declarative WebMCP validation harness.
//
// Each case receives a fresh private Chromium context. The harness observes
// toolsAdded, invokeTool, toolResponded and the fixture form's post-invocation
// state over Playwright's pipe-backed CDPSession. Fixture content and page data
// are untrusted observations; they are never interpreted as instructions.
// Prerequisite: input trees and receipt-output ancestors must remain trusted and
// immutable for the run. Static pathname refusals below do not close same-uid
// replacement races; no concurrent-pathname containment guarantee is claimed.
import { createHash } from 'node:crypto';
import {
  closeSync,
  createReadStream,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer, get as httpGet } from 'node:http';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');
const LANE_ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const VALIDATION_DIR = join(ROOT, 'corpus', 'evidence', 'round-19', 'validation');
const DEFAULT_CASES = join(VALIDATION_DIR, 'cases');
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const PRODUCER_REL = 'scripts/webmcp-validation-round19.mjs';
const PLAYWRIGHT_REQUIRED = '1.64.0';
const CHROMIUM_REQUIRED = '154.0.8037.97';
const NODE_REQUIRED = '24.21.0';
const WEBMCP_REQUIRED_FEATURES = [
  'WebMCP', 'WebMCPTesting', 'DevToolsWebMCPSupport', 'DeclarativeWebmcp',
];
const WEBMCP_REQUIRED_BLINK_FEATURES = ['WebMCP', 'WebMCPTesting'];
const WEBMCP_FEATURE_ARGS = [
  `--enable-features=${WEBMCP_REQUIRED_FEATURES.join(',')}`,
  `--enable-blink-features=${WEBMCP_REQUIRED_BLINK_FEATURES.join(',')}`,
];
const HOST_RESOLVER_DENY = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';
const WAIT_EVENT_MS = 5000;
const RESPONSE_WAIT_MS = 8000;
const RUN_TIMEOUT_MS = 420000;
const LAUNCH_TIMEOUT_MS = 15000;
const PENDING_LAUNCH_ABORT_WAIT_MS = LAUNCH_TIMEOUT_MS + 1000;
const PENDING_LAUNCH_SETTLE_MS = 3000;
const CONTEXT_OPERATION_TIMEOUT_MS = 10000;
const CONTEXT_CLOSE_TIMEOUT_MS = 5000;
const CASE_CLOSE_TIMEOUT_MS = 3000;
const CLEANUP_OPERATION_SETTLE_MS = 3000;
const SERVER_CLOSE_TIMEOUT_MS = 3000;
const RECORDED_CDP_EVENTS = [
  'Page.frameNavigated',
  'WebMCP.toolsAdded',
  'WebMCP.toolInvoked',
  'WebMCP.toolResponded',
];
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

const runContexts = [];
const pendingLaunches = new Set();
const activeOperations = new Set();
const activeBodies = new Set();
const abortController = new AbortController();
let activeServer = null;
let runTempDir = null;
let processTmpDir = null;
let processTmpDirBeforeRun = null;
let processTmpDirEnvBeforeRun;
let cleanupPromise = null;
let abortState = null;
let abortOutputPrinted = false;
let shutdownStarted = false;
let watchdogTimer = null;

const sleepRaw = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function makeAbortError() {
  const error = new Error(abortState?.message || 'run aborted');
  error.code = 'run_aborted';
  error.runAborted = true;
  return error;
}

function markAborted(state) {
  if (abortState) return false;
  if (shutdownStarted && state.kind !== 'signal') return false;
  abortState = state;
  abortController.abort();
  return true;
}

function markBrowserClosed(error) {
  if (/Target page, context or browser has been closed|browser has been closed|browser disconnected/i.test(
    String(error?.message ?? error ?? ''),
  )) {
    markAborted({ kind: 'browser_disconnected', message: String(error?.message ?? error) });
    return true;
  }
  return Boolean(abortState);
}

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

function registerOperation(promise, set) {
  set.add(promise);
  promise.then(
    () => set.delete(promise),
    () => set.delete(promise),
  );
  return promise;
}

function parseArgs(argv) {
  const args = { out: null, cases: DEFAULT_CASES, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out' || arg === '--cases') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a path`);
      if (arg === '--out') args.out = resolve(value);
      else args.cases = resolve(value);
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`unknown argument ${arg}`);
    }
  }
  if (!args.help && !args.out) throw new Error('--out PATH is required');
  return args;
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256File(path) {
  return sha256Buffer(readFileSync(path));
}

function stableStringify(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function deepEqual(left, right) {
  return stableStringify(left) === stableStringify(right);
}

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
    if (pkg.version !== PLAYWRIGHT_REQUIRED) return { dir, version: pkg.version, wrongVersion: true };
    const req = createRequire(join(dir, 'index.js'));
    return { dir, version: pkg.version, chromium: req('playwright').chromium };
  }
  return null;
}

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
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
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
      // Process exited while the snapshot was being read.
    }
  }
  return processes;
}

function findBrowserProcess(profile, processes = readProcSnapshot()) {
  const marker = `--user-data-dir=${profile}`;
  const mains = [...processes]
    .filter(([, info]) => info.argv.includes(marker) && !info.argv.some((arg) => arg.startsWith('--type=')))
    .map(([pid, info]) => ({ pid, ...info }));
  return mains.length === 1 ? mains[0] : null;
}

function findProcessesUsing(marker) {
  const hits = [];
  for (const [pid, info] of readProcSnapshot()) {
    if (info.argv.join(' ').includes(marker)) hits.push({ pid, argv: info.argv });
  }
  return hits;
}

function captureRunProcessTree(run, processes = readProcSnapshot()) {
  if (!(run.processTreePids instanceof Set)) run.processTreePids = new Set(run.processTreePids ?? []);
  if (!(run.processIdentity instanceof Map)) run.processIdentity = new Map();
  const addProcess = (pid, info) => {
    run.processTreePids.add(pid);
    if (info && !run.processIdentity.has(pid)) run.processIdentity.set(pid, info.startTicks);
  };
  if (Number.isInteger(run.pid) && run.pid > 0) addProcess(run.pid, processes.get(run.pid));
  let added = true;
  while (added) {
    added = false;
    for (const [pid, info] of processes) {
      const parent = processes.get(info.ppid);
      const parentStart = run.processIdentity.get(info.ppid);
      const parentMatches = parent && (parentStart === undefined || parent.startTicks === parentStart);
      if (run.processTreePids.has(info.ppid) && parentMatches && !run.processTreePids.has(pid)) {
        addProcess(pid, info);
        added = true;
      }
    }
  }
  const profileMarker = run.profile ? `--user-data-dir=${run.profile}` : null;
  if (profileMarker) {
    for (const [pid, info] of processes) {
      if (info.argv.includes(profileMarker)) addProcess(pid, info);
    }
  }
  return processes;
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
      // Process already exited.
    }
  }
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
    const processInfo = findBrowserProcess(opened.run.profile);
    if (processInfo) opened.run.pid = processInfo.pid;
    captureRunProcessTree(opened.run);
    signalRunProcesses(opened.run, 'SIGTERM');
  }
  await Promise.all(stillPending.map((opened) => waitForRunProcesses(opened.run, 0, 250, 1000)));
  return pending().length === 0;
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
  return { args, ignoreDefaultArgs };
}

async function sha256Executable(path) {
  const canonical = realpathSync(path);
  const fd = openSync(path, 'r');
  try {
    const stat = fstatSync(fd, { bigint: true });
    const stamp = (value) => `${value.dev}:${value.ino}:${value.size}:${value.mtimeNs}:${value.ctimeNs}`;
    const before = stamp(stat);
    if (!stat.isFile() || stamp(statSync(canonical, { bigint: true })) !== before) {
      throw new Error(`Chromium executable object changed before hashing: ${path}`);
    }
    const hash = createHash('sha256');
    await new Promise((resolvePromise, rejectPromise) => {
      const stream = createReadStream(path, { fd, autoClose: false });
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('error', rejectPromise);
      stream.on('end', resolvePromise);
    });
    if (stamp(fstatSync(fd, { bigint: true })) !== before ||
        realpathSync(path) !== canonical ||
        stamp(statSync(path, { bigint: true })) !== before) {
      throw new Error(`Chromium executable changed while hashing: ${path}`);
    }
    return {
      path: canonical, sha256: hash.digest('hex'), size: stat.size.toString(),
      device: stat.dev.toString(), inode: stat.ino.toString(),
      mtimeNs: stat.mtimeNs.toString(), ctimeNs: stat.ctimeNs.toString(),
    };
  } finally {
    closeSync(fd);
  }
}

function launchChromium(chromium, chromiumPath, tmpBase, extraArgs, label) {
  if (abortState || shutdownStarted) return Promise.reject(makeAbortError());
  const task = launchChromiumImpl(chromium, chromiumPath, tmpBase, extraArgs, label);
  pendingLaunches.add(task);
  task.then(() => pendingLaunches.delete(task), () => pendingLaunches.delete(task));
  return task;
}

async function launchChromiumImpl(chromium, chromiumPath, tmpBase, extraArgs, label) {
  const profile = mkdtempSync(join(tmpBase, `${label}-profile-`));
  const home = mkdtempSync(join(tmpBase, `${label}-home-`));
  const browserTempDir = join(tmpBase, 't');
  mkdirSync(browserTempDir, { recursive: true });
  const { args, ignoreDefaultArgs } = featureLaunchOptions(extraArgs);
  const webmcpEnableToken = args.find((arg) => arg.startsWith('--enable-features='));
  if (!webmcpEnableToken) throw new Error(`WebMCP enable-features token missing for ${label}`);
  const run = {
    label, profile, home, browserTempDir, pid: null, effectiveArgv: null,
    processTreePids: new Set(), processIdentity: new Map(), launchStatus: 'starting',
    launchAbortRequested: false, contextClosing: false, closeTimedOut: false,
    shutdownPromise: null, gone: null, featureSwitches: null, realExecutable: null,
    realExecutableSha256: null, realExecutableIdentity: null, version: null,
    expectedWebmcpEnableToken: webmcpEnableToken,
    launchGuards: null, loopbackGuard: null, artifactScans: [],
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
    const info = findBrowserProcess(profile);
    if (info) {
      run.pid = info.pid;
      captureRunProcessTree(run);
      signalRunProcesses(run, 'SIGTERM');
      await waitForRunProcesses(run, 0, 250, 1000);
    }
    throw error;
  }

  opened.context = context;
  const browser = context.browser();
  run.version = browser?.version() ?? null;
  if (run.version !== CHROMIUM_REQUIRED) {
    throw Object.assign(new Error(`Chromium ${run.version}; required ${CHROMIUM_REQUIRED}`), { code: 'chromium_version_mismatch' });
  }
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
    const info = findBrowserProcess(profile, processes);
    if (info) {
      run.pid = info.pid;
      captureRunProcessTree(run, processes);
      break;
    }
    await sleep(50);
  }
  if (abortState || run.launchAbortRequested || shutdownStarted) {
    await closeContextBounded(opened);
    throw makeAbortError();
  }
  if (!Number.isInteger(run.pid) || run.pid <= 0) throw new Error(`Chromium browser pid was not observed for ${label}`);

  run.effectiveArgv = readProcArgv(run.pid);
  const switchTokens = (name) => (run.effectiveArgv ?? [])
    .filter((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
  const enableTokens = switchTokens('enable-features');
  const blinkTokens = switchTokens('enable-blink-features');
  const disableTokens = switchTokens('disable-features');
  const disableBlinkTokens = switchTokens('disable-blink-features');
  const resolverTokens = switchTokens('host-resolver-rules');
  const featureValues = (token) => token?.includes('=')
    ? token.slice(token.indexOf('=') + 1).split(',').map((feature) => feature.trim())
    : [];
  const enabledFeatures = featureValues(enableTokens[0]);
  const blinkFeatures = featureValues(blinkTokens[0]);
  const disabledFeatures = featureValues(disableTokens[0]);
  const disabledBlinkFeatures = featureValues(disableBlinkTokens[0]);
  const featureName = (feature) => feature.replace(/^\*/, '').split(/[<:]/, 1)[0].trim();
  const requiredFeatures = new Set([...WEBMCP_REQUIRED_FEATURES, ...WEBMCP_REQUIRED_BLINK_FEATURES]);
  const disableConflicts = [...disabledFeatures, ...disabledBlinkFeatures]
    .filter((feature) => requiredFeatures.has(featureName(feature)));
  const expectedDisableToken = args.find((arg) => arg.startsWith('--disable-features=')) ??
    `--disable-features=${PLAYWRIGHT_DEFAULT_DISABLE_FEATURES.join(',')}`;
  const blinkRequiredSetExact = blinkFeatures.length === WEBMCP_REQUIRED_BLINK_FEATURES.length &&
    new Set(blinkFeatures).size === blinkFeatures.length &&
    WEBMCP_REQUIRED_BLINK_FEATURES.every((feature) => blinkFeatures.includes(feature));
  run.featureSwitches = {
    enableFeatures: enableTokens.length,
    enableBlinkFeatures: blinkTokens.length,
    disableFeatures: disableTokens.length,
    disableBlinkFeatures: disableBlinkTokens.length,
    hostResolverRules: resolverTokens.length,
    lastEnableFeatures: enableTokens.at(-1) ?? null,
    lastEnableBlinkFeatures: blinkTokens.at(-1) ?? null,
    lastDisableFeatures: disableTokens.at(-1) ?? null,
    enabledFeatures, blinkFeatures, disabledFeatures, disabledBlinkFeatures,
    blinkRequiredSetExact,
    webmcpEnabled: WEBMCP_REQUIRED_FEATURES.every((feature) => enabledFeatures.includes(feature)) &&
      blinkRequiredSetExact,
    disableConflicts,
    disableFeaturesExact: disableTokens.length === 1 && disableTokens[0] === expectedDisableToken,
    disableBlinkFeaturesUnambiguous: disableBlinkTokens.length === 0 ||
      (disableBlinkTokens.length === 1 && disableBlinkTokens[0].startsWith('--disable-blink-features=')),
    hostResolverDenyExact: resolverTokens.length === 1 && resolverTokens[0] === HOST_RESOLVER_DENY,
    webmcpEnableTokenExact: enableTokens.length === 1 && enableTokens[0] === run.expectedWebmcpEnableToken,
    hasRemoteDebuggingPipe: (run.effectiveArgv ?? []).includes('--remote-debugging-pipe'),
    noRemoteDebuggingPort: switchTokens('remote-debugging-port').length === 0,
    noSandboxFlag: switchTokens('no-sandbox').length === 0,
  };
  try {
    const identity = await sha256Executable(`/proc/${run.pid}/exe`);
    run.realExecutable = identity.path;
    run.realExecutableSha256 = identity.sha256;
    run.realExecutableIdentity = identity;
  } catch (cause) {
    throw Object.assign(new Error(`Chromium executable identity unavailable for ${label}: ${String(cause?.message ?? cause)}`, { cause }), {
      code: 'chromium_identity_unavailable',
    });
  }
  captureRunProcessTree(run);
  const devToolsActivePortExists = existsSync(join(profile, 'DevToolsActivePort'));
  const executableIdentityAvailable = typeof run.realExecutable === 'string' && run.realExecutable.length > 0 &&
    typeof run.realExecutableSha256 === 'string' && /^[a-f0-9]{64}$/.test(run.realExecutableSha256);
  const unsafeArgv = !Array.isArray(run.effectiveArgv) ||
    run.featureSwitches.enableFeatures !== 1 ||
    run.featureSwitches.enableBlinkFeatures !== 1 ||
    !run.featureSwitches.disableFeaturesExact ||
    !run.featureSwitches.disableBlinkFeaturesUnambiguous ||
    run.featureSwitches.disableConflicts.length > 0 ||
    !run.featureSwitches.webmcpEnabled ||
    !run.featureSwitches.hostResolverDenyExact ||
    !run.featureSwitches.webmcpEnableTokenExact ||
    !run.featureSwitches.hasRemoteDebuggingPipe ||
    !run.featureSwitches.noRemoteDebuggingPort ||
    !run.featureSwitches.noSandboxFlag ||
    !executableIdentityAvailable ||
    devToolsActivePortExists;
  run.launchGuards = { accepted: !unsafeArgv, executableIdentityAvailable, devToolsActivePortExists };
  if (unsafeArgv) {
    throw new Error(`effective Chromium argv failed closed launch checks for ${label}: ${JSON.stringify({
      pid: run.pid, featureSwitches: run.featureSwitches, launchGuards: run.launchGuards,
    })}`);
  }
  return opened;
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function startFixtureServer(fixtureBytes) {
  const served = [];
  const denied = [];
  const server = createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch {
      denied.push(String(req.url));
      res.writeHead(400).end('bad request');
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end('method not allowed');
      return;
    }
    if (pathname === '/' || pathname === '') {
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
      res.end([...fixtureBytes.keys()].sort().join('\\n'));
      return;
    }
    const name = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const bytes = fixtureBytes.get(name);
    if (!bytes) {
      denied.push(pathname);
      res.writeHead(404).end('not found');
      return;
    }
    const extension = name.slice(name.lastIndexOf('.'));
    served.push({ path: name, bytes: bytes.length, sha256: sha256Buffer(bytes) });
    res.writeHead(200, {
      'content-type': CONTENT_TYPES[extension] || 'application/octet-stream',
      'content-length': bytes.length,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else res.end(bytes);
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
      resolvePromise({ server, port: address.port, served, denied });
    });
  });
}

function closeServer(server) {
  if (!server) return Promise.resolve({ closed: true, reason: 'not started' });
  return new Promise((resolvePromise) => {
    try { server.closeAllConnections?.(); } catch { /* older Node */ }
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

function probePortClosed(port) {
  return new Promise((resolvePromise) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/', timeout: 1500 }, (res) => {
      res.resume();
      resolvePromise({ refused: false, status: res.statusCode });
    });
    req.on('timeout', () => {
      req.destroy();
      resolvePromise({ refused: false, timedOut: true });
    });
    req.on('error', (error) => resolvePromise({ refused: error.code === 'ECONNREFUSED', reason: error.code || String(error) }));
  });
}

async function guardLoopback(context, serverPort, blocked) {
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    let parsed = null;
    try { parsed = new URL(url); } catch { parsed = null; }
    const allowed = parsed !== null && parsed.protocol === 'http:' && parsed.hostname === '127.0.0.1' &&
      parsed.port === String(serverPort) && parsed.username === '' && parsed.password === '';
    if (allowed) await route.continue();
    else {
      blocked.push(url);
      await route.abort('blockedbyclient');
    }
  });
  await context.routeWebSocket(/.*/, (ws) => {
    blocked.push(`ws:${ws.url()}`);
    ws.close();
  });
  return {
    httpRouteInstalled: true,
    webSocketRouteInstalled: true,
    allowedOrigin: `http://127.0.0.1:${serverPort}`,
    scope: 'Page HTTP(S) requests and intercepted WebSocket connections; not OS-level egress confinement',
  };
}

function createCDPRecorder(session) {
  const frames = [];
  let sequence = 0;
  for (const method of RECORDED_CDP_EVENTS) {
    session.on(method, (params) => frames.push({ seq: ++sequence, dir: 'in', frame: { method, params: params ?? {} } }));
  }
  const send = async (method, params = {}) => {
    frames.push({ seq: ++sequence, dir: 'out', frame: { method, params } });
    try {
      const result = await session.send(method, params);
      frames.push({ seq: ++sequence, dir: 'in', frame: { method: `${method}:result`, result: result ?? {} } });
      return result;
    } catch (cause) {
      const error = new Error(String(cause?.message ?? cause));
      frames.push({ seq: ++sequence, dir: 'in', frame: { method: `${method}:error`, error: { message: error.message } } });
      error.reply = { message: error.message };
      throw error;
    }
  };
  return { frames, send, detach: () => session.detach() };
}

function eventParams(raw, method, predicate) {
  const entry = raw.frames.find((frame) => frame.dir === 'in' && frame.frame?.method === method && (!predicate || predicate(frame.frame.params)));
  return entry?.frame?.params ?? null;
}
function frameOriginViolation(frame, expectedOrigin, source) {
  const url = typeof frame?.url === 'string' ? frame.url : '';
  let origin = null;
  try { origin = new URL(url).origin; } catch { origin = null; }
  return origin === expectedOrigin ? null : {
    source,
    frameId: typeof frame?.id === 'string' ? frame.id : null,
    url,
    origin,
  };
}

function frameTreeOriginViolations(node, expectedOrigin, violations = []) {
  if (!node) return violations;
  const violation = frameOriginViolation(node.frame, expectedOrigin, 'Page.getFrameTree');
  if (violation) violations.push(violation);
  for (const child of node.childFrames ?? []) frameTreeOriginViolations(child, expectedOrigin, violations);
  return violations;
}

function recordedNavigationViolations(raw, expectedOrigin, ignoredBootstrapSeqs) {
  return raw.frames
    .filter((entry) => entry.dir === 'in' && entry.frame?.method === 'Page.frameNavigated' && !ignoredBootstrapSeqs.has(entry.seq))
    .map((entry) => frameOriginViolation(entry.frame.params?.frame, expectedOrigin, 'Page.frameNavigated'))
    .filter(Boolean);
}

function scanPlaywrightArtifactFiles(root) {
  const result = { root, files: [], skippedSymlinks: [], complete: false, errors: [] };
  let current = root;
  const visit = (directory, insideArtifact = false) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      current = path;
      const stat = lstatSync(path);
      const inArtifact = insideArtifact || entry.startsWith('playwright-artifacts-');
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        visit(path, inArtifact);
      } else if (inArtifact) {
        result.files.push(relative(root, path));
      } else if (stat.isSymbolicLink()) {
        // Chromium's profile lock/socket symlinks are not artifact trees.
        result.skippedSymlinks.push(relative(root, path));
      }
    }
  };
  try {
    const stat = lstatSync(root);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('artifact scan root is not a regular directory');
    visit(root);
    result.complete = true;
  } catch (error) {
    result.errors.push({ path: current, code: error?.code ?? null, message: String(error?.message ?? error) });
  }
  result.files.sort();
  result.skippedSymlinks.sort();
  return result;
}

function captureArtifactScan(phase, run = null) {
  const roots = [runTempDir, processTmpDir].filter(Boolean).map(scanPlaywrightArtifactFiles);
  const snapshot = { phase, roots, complete: roots.every((root) => root.complete) };
  if (run) run.artifactScans.push(snapshot);
  return snapshot;
}

function assertArtifactScanComplete(snapshot) {
  if (!snapshot.complete) {
    throw Object.assign(new Error(`artifact scan incomplete: ${JSON.stringify(snapshot)}`), { code: 'artifact_scan_incomplete' });
  }
}

function newArtifactFiles(baseline, snapshots) {
  const filesOf = (snapshot) => snapshot.roots.flatMap((root) => root.files.map((path) => join(root.root, path)));
  const previous = new Set(filesOf(baseline));
  return [...new Set(snapshots.flatMap(filesOf).filter((path) => !previous.has(path)))].sort();
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

function waitEvent(raw, method, predicate, timeoutMs = WAIT_EVENT_MS) {
  return waitFor(() => eventParams(raw, method, predicate), timeoutMs);
}

function waitTool(raw, name, timeoutMs = WAIT_EVENT_MS) {
  return waitFor(() => {
    for (const entry of raw.frames) {
      if (entry.dir !== 'in' || entry.frame?.method !== 'WebMCP.toolsAdded') continue;
      const tool = (entry.frame.params?.tools ?? []).find((candidate) => candidate?.name === name);
      if (tool) return tool;
    }
    return null;
  }, timeoutMs);
}

function cdpInvoke(raw, frameId, toolName, input) {
  const params = { frameId, toolName, input };
  return raw.send('WebMCP.invokeTool', params).then(
    (result) => ({ invocationId: result?.invocationId ?? null, error: null }),
    (error) => ({ invocationId: null, error: { message: String(error?.message ?? error) } }),
  );
}

async function pageObservation(page, toolName) {
  return page.evaluate(({ toolName }) => {
    const calls = Array.isArray(globalThis.__obs?.calls) ? globalThis.__obs.calls : null;
    const form = Array.from(document.forms).find((candidate) => candidate.getAttribute('toolname') === toolName) ?? null;
    // Field inventory (round-19 L1 integration rule): every listed form control except buttons,
    // keyed by its name attribute; an unnamed control is keyed "" because Chromium 154 exposes it
    // as the "" schema property (FamDisabledHidden probe). Checkbox/radio report the checked
    // control's value (FormData-like) or null when none is checked.
    const BUTTON_TYPES = new Set(['submit', 'reset', 'button', 'image']);
    const isField = (element) =>
      !(element instanceof HTMLButtonElement) &&
      !(element instanceof HTMLFieldSetElement) &&
      !(element instanceof HTMLOutputElement) &&
      !(element instanceof HTMLObjectElement) &&
      !(element instanceof HTMLInputElement && BUTTON_TYPES.has((element.type || '').toLowerCase()));
    const controlsOf = form ? Array.from(form.elements).filter(isField) : [];
    const fieldNames = [...new Set(controlsOf.map((element) => (typeof element.name === 'string' ? element.name : '')))];
    const fieldValue = (name) => {
      const controls = controlsOf.filter((element) => (element.name || '') === name);
      if (controls.length === 0) return null;
      const oneValue = (element) => {
        const type = (element.type || '').toLowerCase();
        if ((type === 'checkbox' || type === 'radio') && !element.checked) return null;
        if (element instanceof HTMLSelectElement && element.multiple) {
          return Array.from(element.selectedOptions, (option) => option.value);
        }
        return typeof element.value === 'string' ? element.value : null;
      };
      const values = controls.map(oneValue).filter((value) => value !== null);
      if (values.length === 0) return null;
      if (values.length === 1) return values[0];
      return values;
    };
    return {
      submitCount: calls === null ? null : calls.length,
      fields: form ? Object.fromEntries(fieldNames.map((name) => [name, fieldValue(name)])) : null,
    };
  }, { toolName });
}

async function closeContextBounded(opened) {
  const { context, run } = opened;
  run.contextClosing = true;
  captureRunProcessTree(run);
  const before = captureArtifactScan('before-context-close', run);
  let after;
  let gone;
  try {
    if (context) {
      const closeOutcome = await settleWithin(Promise.resolve().then(() => context.close()), CONTEXT_CLOSE_TIMEOUT_MS);
      if (!closeOutcome.settled) run.closeTimedOut = true;
      else if (closeOutcome.error) run.closeError = String(closeOutcome.error?.message ?? closeOutcome.error);
    }
    gone = await waitForRunProcesses(run, run.closeTimedOut ? 0 : 10000, 500, 1500);
  } finally {
    after = captureArtifactScan('after-context-close', run);
  }
  assertArtifactScanComplete(before);
  assertArtifactScanComplete(after);
  return gone;
}

function closeOwnedContext(opened) {
  if (opened.run.shutdownPromise) return opened.run.shutdownPromise;
  opened.run.shutdownPromise = closeContextBounded(opened);
  return opened.run.shutdownPromise;
}

async function closeCase(opened) {
  if (!opened) return;
  opened.pageLifecycle.intentionalClose = true;
  if (opened.raw) opened.raw.intentionalClose = true;
  if (abortState || shutdownStarted) return;
  if (opened.raw) {
    const detached = await settleWithin(opened.raw.detach(), CASE_CLOSE_TIMEOUT_MS);
    if (!detached.settled) markAborted({ kind: 'cleanup_timeout', message: 'CDPSession.detach timed out' });
    else if (detached.error) markBrowserClosed(detached.error);
  }
  if (opened.page && !opened.page.isClosed()) {
    const closed = await settleWithin(Promise.resolve().then(() => opened.page.close()), CASE_CLOSE_TIMEOUT_MS);
    if (!closed.settled) markAborted({ kind: 'cleanup_timeout', message: 'page.close timed out' });
    else if (closed.error) markBrowserClosed(closed.error);
  }
}

function canonicalFuturePath(path) {
  let ancestor = resolve(path);
  const suffix = [];
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) break;
    suffix.unshift(basename(ancestor));
    ancestor = parent;
  }
  return resolve(realpathSync(ancestor), ...suffix);
}

function isWithin(path, root) {
  return path === root || path.startsWith(root + sep);
}
function assertNoSymlinkComponents(path) {
  let current = sep;
  for (const component of resolve(path).split(sep).filter(Boolean)) {
    current = join(current, component);
    const stat = lstatSync(current, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink()) {
      throw Object.assign(new Error(`refusing --out with symlink path component: ${current}`), { code: 'out_symlink_component' });
    }
  }
}


function assertSafeOutput(out) {
  const lexical = resolve(out);
  assertNoSymlinkComponents(lexical);
  const canonicalParent = canonicalFuturePath(dirname(lexical));
  const roots = [ROOT, LANE_ROOT].map((root) => {
    try { return realpathSync(root); } catch { return resolve(root); }
  });
  if (roots.some((root) => isWithin(lexical, root) || isWithin(canonicalParent, root))) {
    throw Object.assign(new Error(`refusing --out inside LANE/repository: ${out}`), { code: 'out_inside_lane' });
  }
  const existing = lstatSync(lexical, { throwIfNoEntry: false });
  if (existing) throw Object.assign(new Error(`refusing existing --out path: ${out}`), { code: 'out_exists' });
}

function loadCases(casesDir, fixturesDir) {
  const casesRoot = realpathSync(casesDir);
  const fixturesRoot = realpathSync(fixturesDir);
  if (!statSync(casesRoot).isDirectory()) throw new Error(`cases path is not a directory: ${casesDir}`);
  if (!statSync(fixturesRoot).isDirectory()) throw new Error(`fixtures path is not a directory: ${fixturesDir}`);
  const entries = readdirSync(casesRoot).filter((name) => name.endsWith('.json')).sort();
  if (entries.length === 0) throw new Error(`no .json case files in ${casesDir}`);
  const casesFilesSha256 = {};
  const fixturesSha256 = {};
  const fixtureBytes = new Map();
  const cases = [];
  const seenIds = new Set();
  for (const name of entries) {
    const caseSlug = name.slice(0, -'.json'.length);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(caseSlug)) throw new Error(`invalid cases filename slug: ${name}`);
    const path = join(casesRoot, name);
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`case file is not a regular file: ${path}`);
    const bytes = readFileSync(path);
    const document = JSON.parse(bytes.toString('utf8'));
    if (!document || document.schema !== 'tabi-webmcp-validation-cases-v1') throw new Error(`unsupported cases schema in ${name}`);
    if (typeof document.family !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(document.family)) throw new Error(`invalid family in ${name}`);
    if (document.fixture !== `${document.family}.html`) throw new Error(`fixture must be ${document.family}.html in ${name}`);
    if (typeof document.author !== 'string' || !document.author.trim()) throw new Error(`missing author in ${name}`);
    if (!Array.isArray(document.cases) || document.cases.length === 0) throw new Error(`cases must be a nonempty array in ${name}`);
    const fixturePath = join(fixturesRoot, document.fixture);
    const fixtureStat = lstatSync(fixturePath, { throwIfNoEntry: false });
    if (!fixtureStat?.isFile() || fixtureStat.isSymbolicLink()) throw new Error(`fixture is missing or not a regular file: ${fixturePath}`);
    const canonicalFixture = realpathSync(fixturePath);
    if (!isWithin(canonicalFixture, fixturesRoot) || canonicalFixture === fixturesRoot) throw new Error(`fixture escapes fixtures directory: ${fixturePath}`);
    if (!fixtureBytes.has(document.fixture)) {
      const fixture = readFileSync(canonicalFixture);
      fixtureBytes.set(document.fixture, fixture);
      fixturesSha256[document.fixture] = sha256Buffer(fixture);
    }

    const idPattern = new RegExp(`^decl-${document.family}-\\d{2}$`);
    for (const entry of document.cases) {
      if (!entry || typeof entry.id !== 'string' || !idPattern.test(entry.id)) throw new Error(`invalid case id for family ${document.family} in ${name}`);
      if (seenIds.has(entry.id)) throw new Error(`duplicate case id ${entry.id}`);
      seenIds.add(entry.id);
      if (typeof entry.tool !== 'string' || !entry.tool.trim()) throw new Error(`invalid tool name for ${entry.id}`);
      if (!Object.hasOwn(entry, 'input')) throw new Error(`missing input for ${entry.id}`);
      const expect = entry.expect;
      if (!expect || typeof expect !== 'object' || Array.isArray(expect) || typeof expect.status !== 'string') throw new Error(`invalid expect.status for ${entry.id}`);
      if (!(expect.errorTextIncludes === null || typeof expect.errorTextIncludes === 'string')) throw new Error(`invalid expect.errorTextIncludes for ${entry.id}`);
      if (!(expect.submitCount === 0 || expect.submitCount === 1)) throw new Error(`invalid expect.submitCount for ${entry.id}`);
      for (const key of ['fields', 'schema']) {
        const value = expect[key];
        if (!(value === null || (value && typeof value === 'object' && !Array.isArray(value)))) throw new Error(`invalid expect.${key} for ${entry.id}`);
      }
      if (!entry.source || typeof entry.source.file !== 'string' || typeof entry.source.lines !== 'string' || typeof entry.source.url !== 'string') {
        throw new Error(`invalid source record for ${entry.id}`);
      }
      if (typeof entry.question !== 'string' || typeof entry.answer !== 'string') throw new Error(`invalid question/answer for ${entry.id}`);
      cases.push({ id: entry.id, family: document.family, fixture: document.fixture, tool: entry.tool, input: entry.input, expected: expect });
    }
    casesFilesSha256[name] = sha256Buffer(bytes);
  }
  return { cases, casesFilesSha256, fixturesSha256, fixtureBytes, casesRoot, fixturesRoot };
}

function getDotPath(object, path) {
  let value = object;
  for (const part of path.split('.')) {
    if (!part || value === null || typeof value !== 'object' || !Object.hasOwn(value, part)) return { found: false, value: null };
    value = value[part];
  }
  return { found: true, value };
}

function compareExpectation(expected, observed) {
  const mismatches = [];
  if (observed.status !== expected.status) mismatches.push('status');
  if (typeof expected.errorTextIncludes === 'string' && !String(observed.errorText ?? '').includes(expected.errorTextIncludes)) {
    mismatches.push('errorTextIncludes');
  }
  if (observed.submitCount !== expected.submitCount) mismatches.push('submitCount');
  if (expected.fields !== null) {
    for (const [name, value] of Object.entries(expected.fields)) {
      const actual = observed.fields && Object.hasOwn(observed.fields, name) ? observed.fields[name] : null;
      if (!deepEqual(actual, value)) mismatches.push(`fields.${name}`);
    }
  }
  if (expected.schema !== null) {
    for (const [path, value] of Object.entries(expected.schema)) {
      const actual = getDotPath(observed.schema, path);
      if (!actual.found || !deepEqual(actual.value, value)) mismatches.push(`schema.${path}`);
    }
  }
  return mismatches;
}

async function evaluateCase({ testCase, index, chromium, chromiumPath, tmpBase, base, blocked, artifactBaseline }) {
  if (abortState) throw makeAbortError();
  const label = `case-${String(index + 1).padStart(3, '0')}`;
  const blockedStart = blocked.length;
  const expectedOrigin = new URL(base).origin;
  const downloadEvents = [];
  const navigationViolations = [];
  const bootstrapFrameNavigations = new Set();
  let record = null;
  const machine = await launchChromium(chromium, chromiumPath, tmpBase, WEBMCP_FEATURE_ARGS, label);
  let page = null;
  let raw = null;
  const pageLifecycle = { intentionalClose: false };
  const opened = { ...machine, page, raw, pageLifecycle };
  try {
    machine.run.loopbackGuard = await guardLoopback(machine.context, new URL(base).port, blocked);
    page = await withTimeout(Promise.resolve().then(() => machine.context.newPage()), CONTEXT_OPERATION_TIMEOUT_MS, `context.newPage timed out for ${label}`);
    opened.page = page;
    page.on('close', () => {
      if (!pageLifecycle.intentionalClose && !shutdownStarted) {
        markAborted({ kind: 'browser_disconnected', message: `fixture page closed during ${testCase.id}`, run: label });
      }
    });
    page.on('download', (download) => {
      let suggestedFilename = null;
      try { suggestedFilename = download.suggestedFilename(); } catch { /* event itself is sufficient evidence */ }
      downloadEvents.push({ suggestedFilename });
    });
    const session = await withTimeout(Promise.resolve().then(() => machine.context.newCDPSession(page)), CONTEXT_OPERATION_TIMEOUT_MS, `newCDPSession timed out for ${label}`);
    raw = createCDPRecorder(session);
    opened.raw = raw;
    await withTimeout(raw.send('Page.enable'), CONTEXT_OPERATION_TIMEOUT_MS, `Page.enable timed out for ${label}`);
    const initialTree = await withTimeout(raw.send('Page.getFrameTree'), CONTEXT_OPERATION_TIMEOUT_MS, `initial Page.getFrameTree timed out for ${label}`);
    const initialFrameId = initialTree?.frameTree?.frame?.id;
    if (typeof initialFrameId !== 'string' || !initialFrameId) throw new Error(`initial main frame id unavailable for ${testCase.id}`);
    for (const entry of raw.frames) {
      const frame = entry.frame?.params?.frame;
      if (entry.dir === 'in' && entry.frame?.method === 'Page.frameNavigated' && frame?.id === initialFrameId && frame.url === 'about:blank') {
        bootstrapFrameNavigations.add(entry.seq);
      }
    }
    const fixtureUrl = `${base}/${encodeURIComponent(testCase.fixture)}`;
    await withTimeout(Promise.resolve().then(() => page.goto(fixtureUrl, { waitUntil: 'load', timeout: 15000 })), 20000, `fixture navigation timed out for ${testCase.id}`);
    if (page.url() !== fixtureUrl) throw new Error(`fixture URL mismatch: ${page.url()} != ${fixtureUrl}`);
    await withTimeout(raw.send('WebMCP.enable'), CONTEXT_OPERATION_TIMEOUT_MS, `WebMCP.enable timed out for ${label}`);
    const tree = await withTimeout(raw.send('Page.getFrameTree'), CONTEXT_OPERATION_TIMEOUT_MS, `Page.getFrameTree timed out for ${label}`);
    navigationViolations.push(...frameTreeOriginViolations(tree?.frameTree, expectedOrigin));
    const frameId = tree?.frameTree?.frame?.id;
    if (typeof frameId !== 'string' || !frameId) throw new Error(`main frame id unavailable for ${testCase.id}`);

    const tool = await waitTool(raw, testCase.tool);
    const invoke = await withTimeout(cdpInvoke(raw, frameId, testCase.tool, testCase.input), CONTEXT_OPERATION_TIMEOUT_MS, `WebMCP.invokeTool timed out for ${testCase.id}`);
    const responded = invoke.invocationId
      ? await waitEvent(raw, 'WebMCP.toolResponded', (params) => params?.invocationId === invoke.invocationId, RESPONSE_WAIT_MS)
      : null;
    const invoked = invoke.invocationId
      ? eventParams(raw, 'WebMCP.toolInvoked', (params) => params?.invocationId === invoke.invocationId)
      : null;
    const pageState = await withTimeout(pageObservation(page, testCase.tool), CONTEXT_OPERATION_TIMEOUT_MS, `form observation timed out for ${testCase.id}`);
    const observed = {
      status: responded?.status ?? 'no-response',
      errorText: responded && typeof responded.errorText === 'string' ? responded.errorText : null,
      commandError: invoke.error,
      invocationId: invoke.invocationId,
      toolInvoked: invoked,
      toolResponded: responded,
      schema: tool?.inputSchema ?? null,
      submitCount: pageState?.submitCount ?? null,
      fields: pageState?.fields ?? null,
      navigationViolations,
      downloadEvents,
      newPlaywrightArtifactFiles: [],
      blockedExternalRequests: [],
      contextLabel: machine.run.label,
    };
    const mismatches = compareExpectation(testCase.expected, observed);
    record = {
      id: testCase.id,
      family: testCase.family,
      input: testCase.input,
      expected: testCase.expected,
      observed,
      pass: mismatches.length === 0,
    };
  } finally {
    // Preserve transient artifacts before page.close can remove them.
    captureArtifactScan('before-case-close', machine.run);
    try {
      await closeCase(opened);
      if (raw) navigationViolations.push(...recordedNavigationViolations(raw, expectedOrigin, bootstrapFrameNavigations));
    } finally {
      await closeOwnedContext(machine);
    }
  }
  if (record) {
    for (const snapshot of machine.run.artifactScans) assertArtifactScanComplete(snapshot);
    const newArtifactFilesForCase = newArtifactFiles(artifactBaseline, machine.run.artifactScans);
    const caseBlocked = blocked.slice(blockedStart);
    record.observed.navigationViolations = navigationViolations;
    record.observed.downloadEvents = downloadEvents;
    record.observed.newPlaywrightArtifactFiles = newArtifactFilesForCase;
    record.observed.blockedExternalRequests = caseBlocked;
    record.pass = record.pass && navigationViolations.length === 0 && downloadEvents.length === 0 && newArtifactFilesForCase.length === 0;
  }
  return record;
}

async function cleanup() {
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
    } catch { serverPort = null; }
    const serverOutcome = await settleWithin(closeServer(server), SERVER_CLOSE_TIMEOUT_MS);
    const serverClose = serverOutcome.settled ? serverOutcome.value : { closed: false, timedOut: true };
    activeServer = null;
    const serverPortProbe = serverPort !== null ? await probePortClosed(serverPort) : { refused: true, reason: 'no server started' };
    const paths = [runTempDir, processTmpDir].filter(Boolean);
    const strays = [
      ...(runTempDir ? findProcessesUsing(runTempDir) : []),
      ...(processTmpDir ? findProcessesUsing(processTmpDir) : []),
    ];
    // This last two-root snapshot precedes deletion even on abort/error cleanup.
    const finalArtifactScan = captureArtifactScan('before-temp-removal');
    const artifactScansComplete = finalArtifactScan.complete &&
      contexts.every(({ run }) => run.artifactScans.every((snapshot) => snapshot.complete));
    const removalErrors = [];
    for (const path of paths) {
      try { rmSync(path, { recursive: true, force: true }); }
      catch (error) { removalErrors.push({ path, error: String(error?.message ?? error) }); }
    }
    if (processTmpDirEnvBeforeRun === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = processTmpDirEnvBeforeRun;
    return {
      launchesSettled,
      pendingLaunchAbortCompleted,
      activeOperationsSettled,
      activeBodiesSettled,
      finalArtifactScan,
      artifactScansComplete,
      contexts: contexts.map((opened) => ({ label: opened.run.label, pid: opened.run.pid, gone: opened.run.gone, closeTimedOut: opened.run.closeTimedOut === true })),
      everyBrowserGone: contexts.every((opened) => opened.run.gone === true),
      tempPathsRemoved: paths.every((path) => !existsSync(path)),
      removalErrors,
      serverClose,
      serverPortProbe,
      strays,
    };
  })();
  return cleanupPromise;
}

function outputPathAllowed(out) {
  assertSafeOutput(out);
  mkdirSync(dirname(out), { recursive: true });
  assertSafeOutput(out);
}

function assertCleanupComplete(result) {
  const good = result.launchesSettled && result.pendingLaunchAbortCompleted && result.activeOperationsSettled &&
    result.activeBodiesSettled && result.everyBrowserGone && result.tempPathsRemoved && result.removalErrors.length === 0 &&
    result.serverClose.closed === true && result.serverPortProbe.refused === true && result.strays.length === 0 &&
    result.artifactScansComplete;
  if (!good) throw Object.assign(new Error(`cleanup incomplete: ${JSON.stringify(result)}`), { code: 'cleanup_incomplete' });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('node scripts/webmcp-validation-round19.mjs --out PATH [--cases DIR]');
    return 0;
  }
  assertSafeOutput(args.out);
  const fixturesDir = join(dirname(args.cases), 'fixtures');
  const loaded = loadCases(args.cases, fixturesDir);
  const pw = resolvePlaywright();
  if (!pw) throw Object.assign(new Error(`could not resolve Playwright ${PLAYWRIGHT_REQUIRED}; candidates=${candidatePlaywrightDirs().join(',')}`), { code: 'playwright_unresolved' });
  if (pw.wrongVersion) throw Object.assign(new Error(`Playwright ${pw.version} found at ${pw.dir}; required ${PLAYWRIGHT_REQUIRED}`), { code: 'playwright_version_mismatch' });
  if (process.version !== `v${NODE_REQUIRED}`) throw Object.assign(new Error(`Node ${process.version}; required v${NODE_REQUIRED}`), { code: 'node_version_mismatch' });
  if (!existsSync(DEFAULT_CHROMIUM)) throw Object.assign(new Error(`Chromium executable not found: ${DEFAULT_CHROMIUM}`), { code: 'chromium_missing' });

  outputPathAllowed(args.out);
  const processTmpDirBeforeRun = tmpdir();
  processTmpDirEnvBeforeRun = process.env.TMPDIR;
  processTmpDir = realpathSync(mkdtempSync(join(processTmpDirBeforeRun, 'tabi-r19-webmcp-validation-process-')));
  const candidateRunTempDir = join(processTmpDirBeforeRun, 'tabi-r19-webmcp-validation-XXXXXX');
  const runTempParent = join(candidateRunTempDir, 't', 'org.chromium.Chromium.XXXXXX', 'SingletonSocket').length < 100
    ? processTmpDirBeforeRun
    : '/tmp';
  runTempDir = realpathSync(mkdtempSync(join(runTempParent, 'tabi-r19-webmcp-validation-')));
  process.env.TMPDIR = processTmpDir;
  const server = await startFixtureServer(loaded.fixtureBytes);
  const base = `http://127.0.0.1:${server.port}`;
  const blocked = [];
  const artifactBaseline = captureArtifactScan('before-run');
  assertArtifactScanComplete(artifactBaseline);
  const chromiumIdentity = await sha256Executable(DEFAULT_CHROMIUM);
  const producerSha256 = sha256File(SCRIPT);
  const cases = [];
  const findings = [];

  for (let index = 0; index < loaded.cases.length; index += 1) {
    if (abortState) throw makeAbortError();
    const testCase = loaded.cases[index];
    const operation = registerOperation(abortable(evaluateCase({
      testCase,
      index,
      chromium: pw.chromium,
      chromiumPath: DEFAULT_CHROMIUM,
      tmpBase: runTempDir,
      base,
      blocked,
      artifactBaseline,
    })), activeOperations);
    registerOperation(operation, activeBodies);
    const record = await operation;
    cases.push(record);
    console.log(`WEBMCP_VALIDATION_CASE id=${record.id} pass=${record.pass}`);
  }

  if (abortState) throw makeAbortError();
  if (blocked.length > 0) findings.push({ severity: 'fail', code: 'external_request_blocked', requests: blocked });
  for (const entry of cases) {
    if (entry.observed.navigationViolations.length > 0) {
      findings.push({ severity: 'fail', code: 'navigation_outside_fixture_origin', case: entry.id, violations: entry.observed.navigationViolations });
    }
    if (entry.observed.downloadEvents.length > 0) {
      findings.push({ severity: 'fail', code: 'download_observed', case: entry.id, downloads: entry.observed.downloadEvents });
    }
    if (entry.observed.newPlaywrightArtifactFiles.length > 0) {
      findings.push({ severity: 'fail', code: 'playwright_artifact_file_created', case: entry.id, files: entry.observed.newPlaywrightArtifactFiles });
    }
  }
  const cleanupResult = await cleanup();
  const finalArtifactFiles = newArtifactFiles(artifactBaseline, [cleanupResult.finalArtifactScan]);
  if (finalArtifactFiles.length > 0) {
    findings.push({ severity: 'fail', code: 'playwright_artifact_file_created', phase: 'before-temp-removal', files: finalArtifactFiles });
  }
  assertCleanupComplete(cleanupResult);
  if (abortState) throw makeAbortError();
  const firstRun = runContexts[0]?.run;
  const chromiumVersion = firstRun?.version ?? null;
  if (chromiumVersion !== CHROMIUM_REQUIRED) throw Object.assign(new Error(`Chromium ${chromiumVersion}; required ${CHROMIUM_REQUIRED}`), { code: 'chromium_version_mismatch' });
  if (!firstRun || runContexts.some(({ run }) =>
    typeof run.realExecutable !== 'string' || run.realExecutable.length === 0 ||
    typeof run.realExecutableSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(run.realExecutableSha256) ||
    run.realExecutableIdentity === null)) {
    throw Object.assign(new Error('Chromium executable identity unavailable for a case context'), { code: 'chromium_identity_unavailable' });
  }
  if (runContexts.some(({ run }) => run.version !== CHROMIUM_REQUIRED ||
    run.realExecutable !== firstRun.realExecutable ||
    run.realExecutableSha256 !== firstRun.realExecutableSha256 ||
    !deepEqual(run.realExecutableIdentity, firstRun.realExecutableIdentity))) {
    throw Object.assign(new Error('Chromium runtime identity changed between case contexts'), { code: 'chromium_identity_changed' });
  }
  const runtime = {
    identity: `Chromium ${chromiumVersion} / Playwright ${pw.version} / Node ${process.versions.node}`,
    chromium: {
      launchPath: DEFAULT_CHROMIUM,
      launchSha256: chromiumIdentity.sha256,
      realExecutable: firstRun?.realExecutable ?? null,
      realExecutableSha256: firstRun?.realExecutableSha256 ?? null,
      version: chromiumVersion,
      versionSource: 'Playwright Browser.version() on a pipe-owned context',
    },
    playwright: { version: pw.version, directory: pw.dir },
    node: process.versions.node,
  };
  const receipt = {
    schema: 'tabi-webmcp-validation-receipt-v1',
    generatedAt: new Date().toISOString(),
    runtime,
    producerSha256,
    casesFilesSha256: loaded.casesFilesSha256,
    fixturesSha256: loaded.fixturesSha256,
    cases,
    contexts: runContexts.map(({ run }) => ({
      label: run.label, pid: run.pid, version: run.version,
      effectiveArgv: run.effectiveArgv,
      featureSwitches: run.featureSwitches,
      launchGuards: run.launchGuards,
      loopbackGuard: run.loopbackGuard,
      realExecutable: run.realExecutable,
      realExecutableSha256: run.realExecutableSha256,
      realExecutableIdentity: run.realExecutableIdentity,
      artifactScans: run.artifactScans,
    })),
    artifactBaseline,
    cleanup: cleanupResult,
    filesystemAssumptions: {
      trustedImmutableInputTreesAndOutputAncestorsRequired: true,
      sameUidPathnameRaceProtection: false,
    },
    findings,
    summary: {
      cases: cases.length,
      passed: cases.filter((entry) => entry.pass).length,
      failed: cases.filter((entry) => !entry.pass).length,
      findings: findings.length,
    },
  };
  const body = `${JSON.stringify(receipt, null, 2)}\n`;
  try {
    writeFileSync(args.out, body, { flag: 'wx' });
  } catch (error) {
    if (error?.code === 'EEXIST') throw Object.assign(new Error(`refusing existing --out path: ${args.out}`), { code: 'out_exists' });
    throw error;
  }
  const failed = cases.filter((entry) => !entry.pass).length;
  const verdict = failed === 0 && findings.length === 0 ? 'pass' : 'fail';
  console.log(`WEBMCP_VALIDATION verdict=${verdict} cases=${cases.length} passed=${cases.length - failed} failed=${failed} findings=${findings.length} out=${args.out}`);
  clearTimeout(watchdogTimer);
  return verdict === 'pass' ? 0 : 1;
}

function reportAbortedRun() {
  if (abortOutputPrinted || !abortState) return;
  abortOutputPrinted = true;
  if (abortState.kind === 'signal') {
    console.log(`WEBMCP_VALIDATION verdict=could_not_evaluate finding=run_aborted signal=${abortState.signal}`);
  } else {
    console.error(`WEBMCP_VALIDATION_ERROR ${JSON.stringify({ code: 'run_aborted', ...abortState })}`);
    console.log(`WEBMCP_VALIDATION verdict=could_not_evaluate finding=run_aborted reason=${abortState.kind}`);
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    if (!abortState) markAborted({ kind: 'signal', signal, message: `received ${signal}` });
    void cleanup().then(
      () => { reportAbortedRun(); process.exitCode = 2; },
      (error) => {
        console.error(`WEBMCP_VALIDATION_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(error?.message ?? error) })}`);
        reportAbortedRun();
        process.exitCode = 2;
      },
    );
  });
}

watchdogTimer = setTimeout(() => {
  if (!markAborted({ kind: 'watchdog', message: 'hard run timeout' })) return;
  console.error('WEBMCP_VALIDATION_ERROR {"code":"run_timeout","message":"hard run timeout"}');
  void cleanup().then(() => { reportAbortedRun(); process.exitCode = 2; }, (error) => {
    console.error(`WEBMCP_VALIDATION_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(error?.message ?? error) })}`);
    reportAbortedRun();
    process.exitCode = 2;
  });
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
      const cleanupResult = await cleanup();
      if (!abortState) assertCleanupComplete(cleanupResult);
    } catch (cleanupError) {
      console.error(`WEBMCP_VALIDATION_ERROR ${JSON.stringify({ code: 'cleanup_failed', message: String(cleanupError?.message ?? cleanupError) })}`);
    }
    if (abortState) reportAbortedRun();
    else console.error(`WEBMCP_VALIDATION_ERROR ${JSON.stringify({ code: error?.code ?? 'could_not_evaluate', message: String(error?.message ?? error) })}`);
    process.exitCode = 2;
  },
);
