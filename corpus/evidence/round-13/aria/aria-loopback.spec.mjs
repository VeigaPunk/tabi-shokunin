// Real Playwright Test spec for the round-13 accessible-selector demonstration.
// It uses the genuine @playwright/test runner, `test`, and `expect` assertions;
// the ARIA assertions are `expect(locator).toMatchAriaSnapshot(...)` evaluated
// inside the runner (the matcher requires a live testInfo). There is no local
// matching substitute anywhere in this file.
//
// The launcher (scripts/aria-loopback-round13.mjs) spawns the pinned Playwright
// Test CLI with playwright.config.mjs, workers=1, retries=0, updateSnapshots=none.
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.TABI_R13_ARIA_ROOT ? resolve(process.env.TABI_R13_ARIA_ROOT) : resolve(HERE, '../../../..');
const PWT_DIR = process.env.TABI_R13_ARIA_PWT_DIR ? resolve(process.env.TABI_R13_ARIA_PWT_DIR) : join(HERE, 'node_modules', '@playwright', 'test');
const ACTUAL_DIR = process.env.TABI_R13_ARIA_ACTUAL_DIR ? resolve(process.env.TABI_R13_ARIA_ACTUAL_DIR) : join(HERE, 'actual');
const SCRIPT_PATH = join(ROOT, 'scripts', 'aria-loopback-round13.mjs');

const requirePwt = createRequire(import.meta.url);
const playwrightTest = requirePwt(join(PWT_DIR, 'index.js'));
const { test, expect, chromium } = playwrightTest;

const DEFAULT_TIMEOUTS = {
  caseMs: 30000,
  expectMs: 2500,
  actionMs: 3000,
  navigationMs: 5000,
  negativeSnapshotMs: 1200,
  serverRefusalMs: 1500,
  processSettleMs: 3000,
};

let PIN = null;
let MANIFEST = null;
let LOAD_ERROR = null;
try {
  PIN = JSON.parse(readFileSync(join(HERE, 'runtime-pin.json'), 'utf8'));
  MANIFEST = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));
} catch (error) {
  LOAD_ERROR = error;
}
const T = (PIN && PIN.timeouts) || DEFAULT_TIMEOUTS;

const CASE_ORDER = [
  { name: 'role-name', findingId: 'R13-ARIA-ROLE-NAME-01' },
  { name: 'label-fill', findingId: 'R13-ARIA-LABEL-01' },
  { name: 'duplicate-strict', findingId: 'R13-ARIA-STRICT-01' },
  { name: 're-resolve', findingId: 'R13-ARIA-RERESOLVE-01' },
  { name: 'panel-before-after', findingId: 'R13-ARIA-PANEL-SNAPSHOT-01' },
  { name: 'contain-default', findingId: 'R13-ARIA-CONTAIN-01' },
  { name: 'equal-explicit', findingId: 'R13-ARIA-EQUAL-01' },
  { name: 'checked-wrong-state', findingId: 'R13-ARIA-CHECKED-01' },
];

const RUNTIME_FINDING = 'R13-ARIA-RUNTIME-PIN-01';
const NOTE_FINDING = 'R13-ARIA-NOTE-01';
const CLEANUP_FINDING = 'R13-ARIA-CLEANUP-01';
const EXTERNAL_FINDING = 'R13-ARIA-EXTERNAL-01';
const CASSET_FINDING = 'R13-ARIA-CASE-SET-01';

const CASE_RECORDS = [];
const NEGATIVES = [];
const INPUT_CHECKS = [];
const SERVER_LOG = [];
const FIXTURE_BODIES = new Map();
let SERVER = null;
let SERVER_PORT = 0;
let SERVER_ADDRESS = null;
let ORIGIN = null;
let RUNTIME = null;
let MANIFEST_SHA256 = null;
let PIN_SHA256 = null;
let SCRIPT_SHA256 = null;
let MANIFEST_TEXT = null;
let BROWSER_VERSION = null;
let BROWSER_VERSION_SOURCE = null;
let ROOT_OUTPUTS_BEFORE = null;
let SETUP_ERROR = null;
let CONFIG_OBSERVED = null;
let NOTE_INFO = null;

function sha256FileSync(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sha256Text(text) {
  return createHash('sha256').update(text).digest('hex');
}

function safeReadText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

async function sha256File(path) {
  return await new Promise((resolvePromise, rejectPromise) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolvePromise(hash.digest('hex')));
    stream.on('error', rejectPromise);
  });
}

function rel(path) {
  return relative(ROOT, path).split('\\').join('/');
}

function readTemplate(name) {
  const entry = MANIFEST.templates[name];
  if (!entry) throw new Error(`manifest template missing: ${name}`);
  const abs = join(ROOT, entry.path);
  const text = readFileSync(abs, 'utf8');
  const sha = sha256Text(text);
  if (sha !== entry.sha256) throw new Error(`template digest drift: ${name}`);
  return { name, abs, path: entry.path, sha256: entry.sha256, bytes: entry.bytes, text };
}

function manifestCase(name) {
  if (!MANIFEST) throw new Error('manifest unavailable');
  const found = MANIFEST.cases.find((entry) => entry.name === name);
  if (!found) throw new Error(`manifest case missing: ${name}`);
  return found;
}

function setupInputChecks() {
  const checks = [];
  for (const [name, entry] of Object.entries(MANIFEST.fixtures)) {
    const abs = join(ROOT, entry.path);
    if (!existsSync(abs)) throw new Error(`fixture missing: ${entry.path}`);
    const actualSha256 = sha256FileSync(abs);
    const actualBytes = statSync(abs).size;
    checks.push({
      kind: 'fixture',
      name,
      path: entry.path,
      expectedSha256: entry.sha256,
      actualSha256,
      expectedBytes: entry.bytes,
      actualBytes,
    });
  }
  for (const [name, entry] of Object.entries(MANIFEST.templates)) {
    const abs = join(ROOT, entry.path);
    if (!existsSync(abs)) throw new Error(`template missing: ${entry.path}`);
    const actualSha256 = sha256FileSync(abs);
    const actualBytes = statSync(abs).size;
    checks.push({
      kind: 'template',
      name,
      path: entry.path,
      expectedSha256: entry.sha256,
      actualSha256,
      expectedBytes: entry.bytes,
      actualBytes,
    });
  }
  checks.push({
    kind: 'manifest',
    name: 'manifest',
    path: rel(join(HERE, 'manifest.json')),
    expectedSha256: null,
    actualSha256: MANIFEST_SHA256,
    expectedBytes: null,
    actualBytes: statSync(join(HERE, 'manifest.json')).size,
  });
  checks.push({
    kind: 'runtime-pin',
    name: 'runtime-pin',
    path: rel(join(HERE, 'runtime-pin.json')),
    expectedSha256: null,
    actualSha256: PIN_SHA256,
    expectedBytes: null,
    actualBytes: statSync(join(HERE, 'runtime-pin.json')).size,
  });
  checks.push({
    kind: 'source',
    name: 'source',
    path: rel(SCRIPT_PATH),
    expectedSha256: null,
    actualSha256: SCRIPT_SHA256,
    expectedBytes: null,
    actualBytes: statSync(SCRIPT_PATH).size,
  });
  return checks;
}

function assertInputDigests() {
  for (const check of INPUT_CHECKS) {
    if (check.expectedBytes !== null) expect(check.actualBytes).toBe(check.expectedBytes);
    if (check.expectedSha256 !== null) expect(check.actualSha256).toBe(check.expectedSha256);
  }
}

async function resolveRuntime() {
  const pwtPkg = JSON.parse(readFileSync(join(PWT_DIR, 'package.json'), 'utf8'));
  const pwtRequire = createRequire(join(PWT_DIR, 'index.js'));
  let playwrightPkgPath;
  try {
    playwrightPkgPath = pwtRequire.resolve('playwright/package.json');
  } catch {
    playwrightPkgPath = join(dirname(PWT_DIR), 'playwright', 'package.json');
  }
  const playwrightDir = dirname(playwrightPkgPath);
  let corePkgPath;
  try {
    corePkgPath = createRequire(playwrightPkgPath).resolve('playwright-core/package.json');
  } catch {
    const sibling = join(dirname(playwrightDir), 'playwright-core', 'package.json');
    const nested = join(playwrightDir, 'node_modules', 'playwright-core', 'package.json');
    corePkgPath = existsSync(sibling) ? sibling : nested;
  }
  const playwrightPkg = JSON.parse(readFileSync(playwrightPkgPath, 'utf8'));
  const corePkg = JSON.parse(readFileSync(corePkgPath, 'utf8'));
  const executablePath = chromium.executablePath();
  const executableStat = statSync(executablePath);
  const executableSha256 = await sha256File(executablePath);
  return {
    node: process.versions.node,
    nodeMajor: Number(process.versions.node.split('.')[0]),
    pwtVersion: pwtPkg.version,
    pwtDir: PWT_DIR,
    playwrightVersion: playwrightPkg.version,
    playwrightPackagePath: playwrightPkgPath,
    coreVersion: corePkg.version,
    corePackagePath: corePkgPath,
    executablePath,
    executableBytes: executableStat.size,
    executableSha256,
    command: 'node scripts/aria-loopback-round13.mjs',
  };
}

function runtimePinStatus() {
  if (!RUNTIME || !PIN) {
    return { matched: false, playwrightMatched: false, chromiumMatched: false, browserVersionMatched: false };
  }
  const playwrightMatched =
    RUNTIME.pwtVersion === PIN.playwrightTest &&
    RUNTIME.playwrightVersion === PIN.playwright &&
    RUNTIME.coreVersion === PIN.playwrightCore;
  const chromiumMatched =
    RUNTIME.executableSha256 === PIN.chromium.executableSha256 &&
    RUNTIME.executableBytes === PIN.chromium.bytes &&
    RUNTIME.executablePath.endsWith(PIN.chromium.executableSuffix);
  const browserVersionMatched = BROWSER_VERSION === PIN.chromium.version;
  return {
    matched: playwrightMatched && chromiumMatched && browserVersionMatched,
    playwrightMatched,
    chromiumMatched,
    browserVersionMatched,
  };
}

function assertPinnedRuntime() {
  expect(RUNTIME.pwtVersion).toBe(PIN.playwrightTest);
  expect(RUNTIME.playwrightVersion).toBe(PIN.playwright);
  expect(RUNTIME.coreVersion).toBe(PIN.playwrightCore);
  expect(RUNTIME.executablePath.endsWith(PIN.chromium.executableSuffix)).toBe(true);
  expect(RUNTIME.executableSha256).toBe(PIN.chromium.executableSha256);
  expect(RUNTIME.executableBytes).toBe(PIN.chromium.bytes);
  expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor);
}

function assertConfig(testInfo) {
  // Playwright 1.64: retries/ignoreSnapshots live on public FullProject
  // (testInfo.project); expect is on FullProject where exposed and otherwise on
  // the project-internal state; workers/updateSnapshots live on FullConfig.
  const projectExpect = testInfo.project.expect ?? testInfo._projectInternal?.expect ?? null;
  expect(testInfo.retry).toBe(0);
  expect(testInfo.project.retries).toBe(0);
  expect(testInfo.project.ignoreSnapshots).toBe(false);
  expect(testInfo.config.updateSnapshots).toBe('none');
  expect(projectExpect?.timeout).toBe(PIN.timeouts.expectMs);
  expect(projectExpect?.toMatchAriaSnapshot?.children).toBeUndefined();
  expect(testInfo.config.workers).toBe(1);
  expect(testInfo.timeout).toBe(PIN.timeouts.caseMs);
  CONFIG_OBSERVED = {
    workers: testInfo.config.workers,
    updateSnapshots: testInfo.config.updateSnapshots,
    retries: testInfo.project.retries,
    ignoreSnapshots: testInfo.project.ignoreSnapshots,
    expectTimeoutMs: projectExpect?.timeout ?? null,
    globalChildrenOverride: projectExpect?.toMatchAriaSnapshot?.children ?? null,
    expectSource: testInfo.project.expect ? 'project' : testInfo._projectInternal?.expect ? 'project-internal' : null,
    testTimeoutMs: testInfo.timeout,
    retry: testInfo.retry,
  };
}

function buildNoteAdmission(rel, sources, scope) {
  const abs = join(ROOT, rel);
  const text = safeReadText(abs);
  const readme = safeReadText(join(ROOT, 'corpus/README.md')) || '';
  const sourcesText = safeReadText(join(ROOT, 'corpus/SOURCES.md')) || '';
  const shortRel = rel.replace(/^corpus\//, '');
  const readmeContains = text !== null && (readme.includes(rel) || readme.includes(shortRel));
  const sourcesContains = text !== null && (sourcesText.includes(rel) || sourcesText.includes(shortRel));
  return {
    path: rel,
    exists: text !== null,
    sha256: text !== null ? sha256Text(text) : null,
    bytes: text !== null ? statSync(abs).size : null,
    sources,
    indexed: {
      readme: { path: 'corpus/README.md', sha256: sha256Text(readme), contains: readmeContains },
      sources: { path: 'corpus/SOURCES.md', sha256: sha256Text(sourcesText), contains: sourcesContains },
    },
    admitted: text !== null && readmeContains && sourcesContains,
    scope,
  };
}

function loadNoteAdmission() {
  const primary = buildNoteAdmission(
    'corpus/knowledge/aria-loopback-round-13.md',
    ['S023', 'S024', 'S025'],
    'round-13 admitted runtime note; sourced/indexed documentation record of this demonstration',
  );
  const documentedContract = buildNoteAdmission(
    'corpus/knowledge/playwright-accessible-locators-and-snapshots.md',
    ['S023', 'S024', 'S025'],
    'prior docs-held locator/snapshot contract; retained as record, not acquisition credit',
  );
  return {
    ...primary,
    acquisitionCredit: primary.admitted,
    documentedContract,
    notePolicy: 'the round-13 note must exist and be mapped in corpus/README.md and corpus/SOURCES.md; the prior contract note is record only',
  };
}

function assertNoteAdmission() {
  expect(NOTE_INFO.exists).toBe(true);
  expect(NOTE_INFO.indexed.readme.contains).toBe(true);
  expect(NOTE_INFO.indexed.sources.contains).toBe(true);
  expect(NOTE_INFO.admitted).toBe(true);
  expect(NOTE_INFO.sha256).toMatch(/^[a-f0-9]{64}$/);
}

function assertLocatorContract(record, locator, spec) {
  const source = locator.toString();
  record.locator = source;
  record.contract = spec.locator.contract;
  expect(source).toBe(spec.locator.contract);
  for (const token of spec.locator.mustContain || []) expect(source).toContain(token);
  for (const token of spec.locator.mustNotContain || []) expect(source).not.toContain(token);
  record.checks.push({ id: 'locator-contract', matcher: 'toBe(committed contract)', pass: true, actual: source });
}

function childPids(ppid = process.pid) {
  if (!existsSync('/proc/self/stat')) return { supported: false, pids: [] };
  const pids = [];
  for (const name of readdirSync('/proc')) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const stat = readFileSync(`/proc/${name}/stat`, 'utf8');
      const close = stat.lastIndexOf(')');
      if (close < 0) continue;
      const fields = stat.slice(close + 2).trim().split(/\s+/);
      if (fields[1] === String(ppid) && fields[0] !== 'Z') pids.push(Number(name));
    } catch {
      // process exited while scanning
    }
  }
  return { supported: true, pids: pids.sort((a, b) => a - b) };
}

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function timeLimited(promise, ms, fallback) {
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((resolvePromise) => {
        timer = setTimeout(() => resolvePromise(fallback), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function startServer() {
  return new Promise((resolvePromise, rejectPromise) => {
    SERVER = createServer((request, response) => {
      const started = Date.now();
      const log = { method: request.method, path: null, status: 0, bytes: 0, ms: 0 };
      let url;
      try {
        url = new URL(request.url, 'http://127.0.0.1');
      } catch {
        response.writeHead(400, { 'content-type': 'text/plain' });
        response.end('bad request');
        log.status = 400;
        log.ms = Date.now() - started;
        SERVER_LOG.push(log);
        return;
      }
      log.path = url.pathname;
      if (request.method !== 'GET') {
        const body = 'method not allowed';
        response.writeHead(405, { allow: 'GET', 'content-type': 'text/plain', 'content-length': Buffer.byteLength(body) });
        response.end(body);
        log.status = 405;
        log.bytes = Buffer.byteLength(body);
        log.ms = Date.now() - started;
        SERVER_LOG.push(log);
        return;
      }
      if (url.pathname === '/favicon.ico') {
        response.writeHead(204);
        response.end();
        log.status = 204;
        log.ms = Date.now() - started;
        SERVER_LOG.push(log);
        return;
      }
      if (url.search) {
        const body = 'query not supported';
        response.writeHead(400, { 'content-type': 'text/plain', 'content-length': Buffer.byteLength(body) });
        response.end(body);
        log.status = 400;
        log.bytes = Buffer.byteLength(body);
        log.ms = Date.now() - started;
        SERVER_LOG.push(log);
        return;
      }
      const body = FIXTURE_BODIES.get(url.pathname);
      if (!body) {
        const text = 'not found';
        response.writeHead(404, { 'content-type': 'text/plain', 'content-length': Buffer.byteLength(text) });
        response.end(text);
        log.status = 404;
        log.bytes = Buffer.byteLength(text);
        log.ms = Date.now() - started;
        SERVER_LOG.push(log);
        return;
      }
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'content-length': body.length,
      });
      response.end(body);
      log.status = 200;
      log.bytes = body.length;
      log.ms = Date.now() - started;
      SERVER_LOG.push(log);
    });
    SERVER.on('error', rejectPromise);
    SERVER.listen(0, '127.0.0.1', () => {
      const address = SERVER.address();
      SERVER_ADDRESS = address.address;
      SERVER_PORT = address.port;
      ORIGIN = `http://127.0.0.1:${SERVER_PORT}`;
      resolvePromise();
    });
  });
}

async function closeServerAndProve() {
  const proof = {
    origin: ORIGIN,
    listeningBefore: SERVER ? SERVER.listening : false,
    closed: false,
    listeningAfter: null,
    refusedAfterClose: false,
    refusalDetail: null,
    closeError: null,
  };
  if (SERVER) {
    try {
      await new Promise((resolvePromise) => SERVER.close(() => resolvePromise()));
      proof.closed = true;
    } catch (error) {
      proof.closeError = String(error?.message || error);
    }
  }
  proof.listeningAfter = SERVER ? SERVER.listening : null;
  if (ORIGIN) {
    try {
      await fetch(`${ORIGIN}/fixtures/controls.html`, { signal: AbortSignal.timeout(T.serverRefusalMs) });
    } catch (error) {
      proof.refusedAfterClose = true;
      proof.refusalDetail = String(error?.cause?.code || error?.name || error);
    }
  }
  return proof;
}

function fixtureUrl(fixtureName) {
  const entry = MANIFEST.fixtures[fixtureName];
  if (!entry) throw new Error(`fixture manifest entry missing: ${fixtureName}`);
  return `${ORIGIN}/fixtures/${basename(entry.path)}`;
}

async function openSession(spec, record) {
  const fixtureEntry = MANIFEST.fixtures[spec.fixture];
  if (!fixtureEntry) throw new Error(`fixture manifest entry missing: ${spec.fixture}`);
  const tempRoot = mkdtempSync(join(tmpdir(), 'tabi-r13-aria-'));
  const xdgConfig = join(tempRoot, 'xdg-config');
  const xdgCache = join(tempRoot, 'xdg-cache');
  const xdgData = join(tempRoot, 'xdg-data');
  const xdgState = join(tempRoot, 'xdg-state');
  const xdgRuntime = join(tempRoot, 'xdg-runtime');
  const tmpDir = join(tempRoot, 'tmp');
  const downloads = join(tempRoot, 'downloads');
  for (const dir of [xdgConfig, xdgCache, xdgData, xdgState, xdgRuntime, tmpDir, downloads]) {
    mkdirSync(dir, { recursive: true });
  }
  const profileDir = join(tempRoot, 'profile');
  mkdirSync(profileDir, { recursive: true });
  const childrenBefore = childPids();
  const browserEnv = {
    HOME: tempRoot,
    XDG_CONFIG_HOME: xdgConfig,
    XDG_CACHE_HOME: xdgCache,
    XDG_DATA_HOME: xdgData,
    XDG_STATE_HOME: xdgState,
    XDG_RUNTIME_DIR: xdgRuntime,
    TMPDIR: tmpDir,
    LANG: 'C.UTF-8',
    TZ: 'UTC',
  };
  const session = {
    tempRoot,
    profileDir,
    browserEnv,
    childrenBefore,
    context: null,
    page: null,
    captures: [],
    requests: [],
    externalAborts: [],
    externalSeen: [],
    serverStart: SERVER_LOG.length,
    navigationStatus: null,
    cookiesBefore: null,
    serviceWorkersBefore: null,
    storageState: null,
    contextPages: null,
    fixturePath: fixtureEntry.path,
    fixtureUrl: fixtureUrl(spec.fixture),
  };
  try {
    session.context = await chromium.launchPersistentContext(profileDir, {
      executablePath: RUNTIME.executablePath,
      headless: true,
      env: browserEnv,
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'UTC',
      serviceWorkers: 'block',
      acceptDownloads: false,
      downloadsPath: downloads,
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--disable-features=Translate,OptimizationHints,MediaRouter',
      ],
    });
  } catch (error) {
    session.launchError = String(error?.message || error);
    return session;
  }

  const context = session.context;
  context.setDefaultTimeout(T.actionMs);
  context.setDefaultNavigationTimeout(T.navigationMs);

  await context.route('**/*', (route) => {
    const request = route.request();
    const raw = request.url();
    let url;
    try {
      url = new URL(raw);
    } catch {
      session.externalAborts.push({ url: raw, resourceType: request.resourceType(), reason: 'unparseable-url' });
      return route.abort('blockedbyclient');
    }
    const allowed =
      url.protocol === 'http:' &&
      url.hostname === '127.0.0.1' &&
      url.port === String(SERVER_PORT) &&
      url.username === '' &&
      url.password === '';
    if (allowed) return route.continue();
    session.externalAborts.push({
      url: raw,
      resourceType: request.resourceType(),
      reason: 'outside-exact-fixture-origin',
    });
    return route.abort('blockedbyclient');
  });

  context.on('request', (request) => {
    const raw = request.url();
    session.requests.push(raw);
    if (!raw.startsWith(`${ORIGIN}/`)) session.externalSeen.push(raw);
  });

  session.cookiesBefore = await context.cookies();
  session.serviceWorkersBefore = context.serviceWorkers().length;
  session.storageState = await context.storageState();
  session.page = context.pages()[0] || (await context.newPage());
  session.contextPages = context.pages().length;

  const response = await session.page.goto(session.fixtureUrl, { waitUntil: 'load', timeout: T.navigationMs });
  session.navigationStatus = response ? response.status() : null;
  return session;
}

async function cleanupSession(session) {
  const proof = {
    tempRoot: session.tempRoot,
    profileDir: session.profileDir,
    childProbeSupported: session.childrenBefore.supported,
    childrenBefore: session.childrenBefore.pids,
    contextPresent: Boolean(session.context),
    contextClosed: false,
    closeError: null,
    newPageRejected: null,
    childrenAfter: null,
    browserProcessesAfter: null,
    profileRemoved: false,
    tempRootRemoved: false,
    ok: false,
  };
  if (session.context) {
    try {
      const closed = await timeLimited(
        session.context.close().then(() => true, (error) => ({ error })),
        10000,
        false,
      );
      if (closed === true) {
        proof.contextClosed = true;
      } else if (closed && closed.error) {
        proof.closeError = String(closed.error?.message || closed.error);
      } else {
        proof.closeError = 'context.close() exceeded 10000ms';
      }
    } catch (error) {
      proof.closeError = String(error?.message || error);
    }
    try {
      proof.newPageRejected = await timeLimited(
        session.context.newPage().then(() => false, () => true),
        1500,
        false,
      );
    } catch {
      proof.newPageRejected = true;
    }
  }
  const baseline = new Set(session.childrenBefore.pids);
  const deadline = Date.now() + T.processSettleMs;
  let after = childPids();
  while (after.supported && after.pids.some((pid) => !baseline.has(pid)) && Date.now() < deadline) {
    await delay(50);
    after = childPids();
  }
  proof.childrenAfter = after.pids;
  proof.browserProcessesAfter = after.supported ? after.pids.filter((pid) => !baseline.has(pid)) : [];
  try {
    rmSync(session.tempRoot, { recursive: true, force: true });
  } catch (error) {
    proof.removeError = String(error?.message || error);
  }
  proof.profileRemoved = !existsSync(session.profileDir);
  proof.tempRootRemoved = !existsSync(session.tempRoot);
  proof.ok =
    proof.tempRootRemoved &&
    proof.profileRemoved &&
    proof.browserProcessesAfter.length === 0 &&
    (!session.context || (proof.contextClosed && proof.newPageRejected === true));
  return proof;
}

async function captureSnapshot(session, label, locator) {
  const yaml = await locator.ariaSnapshot();
  session.captures.push({ label, yaml });
  return yaml;
}

async function captureRejection(record, id, promise, patterns, meta = {}) {
  const started = Date.now();
  let message = '';
  const wrapped = Promise.resolve(promise).catch((error) => {
    message = error instanceof Error ? error.message : String(error);
    throw error;
  });
  await expect(wrapped).rejects.toThrow(new RegExp(patterns[0]));
  for (const pattern of patterns.slice(1)) expect(message).toMatch(new RegExp(pattern));
  for (const token of meta.mustContain || []) expect(message).toContain(token);
  expect(message).not.toContain('must be called during the test');
  expect(message).not.toContain('Aria snapshot must be a YAML sequence');
  const entry = {
    name: id,
    kind: meta.kind || 'unknown',
    findingId: record.findingId,
    expected: 'reject',
    actual: 'reject',
    matcher: meta.matcher || `rejects.toThrow(/${patterns[0]}/)`,
    patterns,
    mustContain: meta.mustContain || [],
    message,
    messageSha256: sha256Text(message),
    durationMs: Date.now() - started,
    template: meta.template || null,
    templateSha256: meta.templateSha256 || null,
  };
  record.negative.push(entry);
  NEGATIVES.push(entry);
  record.checks.push({ id: `${id}.rejected`, matcher: entry.matcher, pass: true });
  return entry;
}

function setCaseTemplates(record, spec) {
  if (spec.templates && spec.templates.length) {
    const entries = spec.templates.map((name) => {
      const template = readTemplate(name);
      return {
        name,
        path: template.path,
        sha256: template.sha256,
        bytes: template.bytes,
        text: template.text,
      };
    });
    record.templates = entries;
    const primaryName = record.name === 'checked-wrong-state' ? 'checkbox-checked-false' : entries[0].name;
    const primary = entries.find((entry) => entry.name === primaryName) || entries[0];
    record.template = primary.path;
    record.templateSha256 = primary.sha256;
    record.templateKind = 'aria-yaml';
    return entries.reduce((map, entry) => Object.assign(map, { [entry.name]: entry }), {});
  }
  record.templates = [];
  record.template = rel(join(HERE, 'manifest.json'));
  record.templateSha256 = MANIFEST_SHA256;
  record.templateKind = 'locator-contract';
  return {};
}

function assertSessionConfinement(session, record) {
  expect(SERVER_ADDRESS).toBe('127.0.0.1');
  expect(SERVER_PORT).toBeGreaterThan(0);
  expect(session.navigationStatus).toBe(200);
  expect(session.contextPages).toBe(1);
  expect(session.cookiesBefore).toHaveLength(0);
  expect(session.serviceWorkersBefore).toBe(0);
  expect(session.storageState.origins).toHaveLength(0);
  expect(session.externalAborts).toEqual([]);
  expect(session.externalSeen).toEqual([]);
  expect(session.requests.length).toBeGreaterThan(0);
  expect(session.requests.every((url) => url.startsWith(`${ORIGIN}/`))).toBe(true);
  const serverRequests = SERVER_LOG.slice(session.serverStart);
  expect(serverRequests.length).toBeGreaterThan(0);
  expect(serverRequests.some((entry) => entry.status === 200)).toBe(true);
  expect(serverRequests.every((entry) => entry.path === '/favicon.ico' || FIXTURE_BODIES.has(entry.path))).toBe(true);
  record.counts = { ...record.counts, requests: session.requests.length, externalAborts: session.externalAborts.length };
}

async function assertBrowserPin(session, record) {
  const browserVersion = session.context.browser()?.version();
  let version = browserVersion;
  let source = 'browser';
  if (!version) {
    let cdp = null;
    try {
      cdp = await session.context.newCDPSession(session.page);
      const info = await cdp.send('Browser.getVersion');
      const match =
        /(?:HeadlessChrome|Chrome)\/(\d+\.\d+\.\d+\.\d+)/.exec(info.product) ||
        /(?:HeadlessChrome|Chrome)\/(\d+\.\d+\.\d+\.\d+)/.exec(info.userAgent);
      version = match ? match[1] : null;
      source = 'cdp-Browser.getVersion';
    } catch {
      const userAgent = await session.page.evaluate(() => navigator.userAgent);
      const match = /(?:HeadlessChrome|Chrome)\/(\d+\.\d+\.\d+\.\d+)/.exec(userAgent);
      version = match ? match[1] : null;
      source = 'user-agent';
    } finally {
      if (cdp) {
        try {
          await cdp.detach();
        } catch {
          // context teardown closes the session
        }
      }
    }
  }
  expect(version).toBe(PIN.chromium.version);
  BROWSER_VERSION = version;
  BROWSER_VERSION_SOURCE = source;
  record.browserRuntime = {
    version,
    source,
    executablePath: RUNTIME.executablePath,
    executableSha256: RUNTIME.executableSha256,
    profile: 'fresh persistent profile under fresh TMPDIR temp root',
    serviceWorkers: 'block',
    browserEnv: Object.keys(session.browserEnv).sort(),
  };
}

function finalizeCase(record, session) {
  const observation = {
    name: record.name,
    findingId: record.findingId,
    status: record.status,
    expected: record.expected,
    actual: record.actual,
    phase: record.phase,
    durationMs: record.durationMs,
    fixture: record.fixture,
    fixturePath: record.fixturePath,
    fixtureSha256: record.fixtureSha256,
    locator: record.locator,
    contract: record.contract,
    note: record.note || null,
    template: record.template,
    templateSha256: record.templateSha256,
    templateKind: record.templateKind,
    templates: record.templates,
    checks: record.checks,
    counts: record.counts,
    negative: record.negative,
    snapshots: [],
    cleanup: record.cleanup,
    browserRuntime: record.browserRuntime,
    requests: session ? session.requests : [],
    externalAborts: session ? session.externalAborts : [],
    externalSeen: session ? session.externalSeen : [],
    serverRequests: session ? SERVER_LOG.slice(session.serverStart) : [],
    error: record.error,
  };
  mkdirSync(ACTUAL_DIR, { recursive: true });
  for (const capture of session ? session.captures : []) {
    const yamlFile = join(ACTUAL_DIR, `${record.name}-${capture.label}.aria.yml`);
    const yamlBody = capture.yaml.endsWith('\n') ? capture.yaml : `${capture.yaml}\n`;
    writeFileSync(yamlFile, yamlBody);
    observation.snapshots.push({
      label: capture.label,
      path: rel(yamlFile),
      sha256: sha256FileSync(yamlFile),
      bytes: statSync(yamlFile).size,
      yaml: capture.yaml,
    });
  }
  const actualFile = join(ACTUAL_DIR, `${record.name}.json`);
  const body = `${JSON.stringify(observation, null, 2)}\n`;
  writeFileSync(actualFile, body);
  record.actualPath = rel(actualFile);
  record.actualSha256 = sha256FileSync(actualFile);
  record.actualBytes = statSync(actualFile).size;
  record.snapshots = observation.snapshots;
  record.requests = observation.requests;
  record.externalAborts = observation.externalAborts;
  record.externalSeen = observation.externalSeen;
  record.serverRequests = observation.serverRequests;
  return observation;
}

for (const caseDef of CASE_ORDER) {
  test(`${caseDef.name}`, async ({}, testInfo) => {
    const record = {
      name: caseDef.name,
      findingId: caseDef.findingId,
      status: 'running',
      expected: null,
      actual: 'not-run',
      phase: 'setup',
      durationMs: 0,
      fixture: null,
      locator: null,
      contract: null,
      note: null,
      template: null,
      templateSha256: null,
      templateKind: null,
      templates: [],
      checks: [],
      counts: {},
      negative: [],
      snapshots: [],
      cleanup: null,
      browserRuntime: null,
      error: null,
      actualPath: null,
      actualSha256: null,
      actualBytes: null,
    };
    CASE_RECORDS.push(record);
    const started = Date.now();
    let session = null;
    let primaryError = null;
    try {
      if (LOAD_ERROR) throw new Error(`fixture load failed: ${LOAD_ERROR.message}`);
      if (SETUP_ERROR) throw SETUP_ERROR;
      const spec = manifestCase(caseDef.name);
      record.expected = spec.expected;
      record.fixture = spec.fixture;
      record.fixturePath = MANIFEST.fixtures[spec.fixture]?.path ?? null;
      record.fixtureSha256 = MANIFEST.fixtures[spec.fixture]?.sha256 ?? null;
      record.phase = 'runtime-pin';
      assertPinnedRuntime();
      record.phase = 'inputs';
      assertInputDigests();
      record.phase = 'config';
      assertConfig(testInfo);
      record.phase = 'documented-note';
      assertNoteAdmission();
      record.note = NOTE_INFO;
      record.phase = 'session';
      session = await openSession(spec, record);
      if (session.launchError) throw new Error(`browser launch failed: ${session.launchError}`);
      assertSessionConfinement(session, record);
      record.phase = 'browser-pin';
      await assertBrowserPin(session, record);
      const templates = setCaseTemplates(record, spec);
      const page = session.page;

      switch (caseDef.name) {
        case 'role-name': {
          record.phase = 'role-name';
          const save = page.getByRole('button', { name: 'Save changes', exact: true });
          assertLocatorContract(record, save, spec);
          await expect(save).toHaveCount(1);
          record.checks.push({ id: 'role-name.count', matcher: 'toHaveCount(1)', pass: true });
          await expect(save).toHaveAccessibleName('Save changes');
          record.checks.push({ id: 'role-name.name', matcher: 'toHaveAccessibleName', pass: true });
          await save.click({ timeout: T.actionMs });
          const status = page.locator('#save-status');
          await expect(status).toHaveText('saved');
          record.checks.push({ id: 'role-name.click', matcher: 'toHaveText(saved)', pass: true });
          record.counts = { ...record.counts, matches: 1, statusText: 'saved' };
          record.actual = 'exactly one role+name match; click set the scoped status to saved';
          break;
        }
        case 'label-fill': {
          record.phase = 'label-fill';
          const email = page.getByLabel('Email address');
          assertLocatorContract(record, email, spec);
          await expect(email).toHaveCount(1);
          await expect(email).toHaveAttribute('type', 'email');
          await email.fill('runner@example.test');
          await expect(email).toHaveValue('runner@example.test');
          record.checks.push({ id: 'label-fill.value', matcher: 'toHaveValue', pass: true });
          record.counts = { ...record.counts, matches: 1, value: 'runner@example.test' };
          record.actual = 'the label-associated input resolved to one field and held the filled value';
          break;
        }
        case 'duplicate-strict': {
          record.phase = 'duplicate-strict';
          const deletes = page.getByRole('button', { name: 'Delete', exact: true });
          assertLocatorContract(record, deletes, spec);
          await expect(deletes).toHaveCount(2);
          record.checks.push({ id: 'duplicate-strict.count', matcher: 'toHaveCount(2)', pass: true });
          const clickPromise = deletes.click({ timeout: T.actionMs });
          await captureRejection(record, 'duplicate-strict.strict', clickPromise, spec.negative.errorPatterns, {
            kind: 'strict-mode',
            matcher: 'expect(promise).rejects.toThrow(/strict mode violation/)',
            mustContain: ['resolved to 2 elements'],
          });
          record.counts = { ...record.counts, matches: 2 };
          record.actual = 'count was 2; the bare role/name click rejected with a strict mode violation and no first/last/nth opt-out';
          break;
        }
        case 're-resolve': {
          record.phase = 're-resolve';
          const bump = page.getByRole('button', { name: 'Bump counter', exact: true });
          assertLocatorContract(record, bump, spec);
          await expect(bump).toHaveCount(1);
          const count = page.locator('#count');
          await expect(count).toHaveText('0');
          const token0 = await bump.getAttribute('data-instance');
          expect(token0).toBe('1');
          const staleHandle = await bump.elementHandle();
          await bump.click({ timeout: T.actionMs });
          await expect(count).toHaveText('1');
          await expect(bump).toHaveAttribute('data-instance', '2');
          await expect(bump).toHaveCount(1);
          const token1 = await bump.getAttribute('data-instance');
          expect(token1).toBe('2');
          const staleConnected = await staleHandle.evaluate((element) => element.isConnected);
          expect(staleConnected).toBe(false);
          await bump.click({ timeout: T.actionMs });
          await expect(count).toHaveText('2');
          await expect(bump).toHaveAttribute('data-instance', '3');
          const token2 = await bump.getAttribute('data-instance');
          expect(token2).toBe('3');
          expect([token0, token1, token2]).toEqual(['1', '2', '3']);
          record.checks.push({ id: 're-resolve.tokens', matcher: 'toEqual([1,2,3])', pass: true });
          record.checks.push({ id: 're-resolve.stale-handle', matcher: 'isConnected=false', pass: true });
          record.counts = {
            ...record.counts,
            matches: 1,
            instanceTokens: [token0, token1, token2],
            staleHandleConnectedAfterReplacement: staleConnected,
            countText: '2',
          };
          record.actual = 'the same locator clicked the replacement node twice; instance tokens advanced 1->2->3 and the retained element handle reported isConnected=false';
          break;
        }
        case 'panel-before-after': {
          record.phase = 'panel-before';
          const main = page.getByRole('main', { name: 'Preferences', exact: true });
          assertLocatorContract(record, main, spec);
          await expect(main).toHaveCount(1);
          const beforeYaml = await captureSnapshot(session, 'before', main);
          await expect(main).toMatchAriaSnapshot(templates['panel-before'].text);
          record.checks.push({ id: 'panel.before-template', matcher: 'toMatchAriaSnapshot(panel-before)', pass: true });
          record.phase = 'panel-after';
          const toggle = page.getByRole('button', { name: 'Toggle advanced', exact: true });
          await toggle.click({ timeout: T.actionMs });
          const afterYaml = await captureSnapshot(session, 'after', main);
          await expect(main).toMatchAriaSnapshot(templates['panel-after'].text);
          record.checks.push({ id: 'panel.after-template', matcher: 'toMatchAriaSnapshot(panel-after)', pass: true });
          expect(afterYaml).not.toBe(beforeYaml);
          expect(afterYaml).toContain('checkbox "Accept terms"');
          record.counts = { ...record.counts, beforeBytes: Buffer.byteLength(beforeYaml), afterBytes: Buffer.byteLength(afterYaml), changed: true };
          record.actual = 'before and after YAML were captured; each committed template matched its state and the YAML changed';
          break;
        }
        case 'contain-default': {
          record.phase = 'contain-default';
          const list = page.getByRole('list', { name: 'Queue', exact: true });
          assertLocatorContract(record, list, spec);
          await expect(list).toHaveCount(1);
          const actualYaml = await captureSnapshot(session, 'actual', list);
          await expect(list).toMatchAriaSnapshot(templates['queue-contain'].text);
          record.checks.push({ id: 'contain.default', matcher: 'toMatchAriaSnapshot(contain default)', pass: true });
          expect(actualYaml).toContain('listitem "Alpha"');
          expect(actualYaml).toContain('listitem "Beta"');
          expect(actualYaml).toContain('listitem "Gamma"');
          record.counts = { ...record.counts, items: 3, matchedTemplateItems: 2 };
          record.actual = 'default contain accepted the Alpha/Beta template while the Gamma sibling was present as an extra child';
          break;
        }
        case 'equal-explicit': {
          record.phase = 'equal-explicit';
          const list = page.getByRole('list', { name: 'Queue', exact: true });
          assertLocatorContract(record, list, spec);
          await expect(list).toHaveCount(1);
          const actualYaml = await captureSnapshot(session, 'actual', list);
          await expect(list).toMatchAriaSnapshot(templates['queue-contain'].text);
          record.checks.push({ id: 'equal.subset-contain-green', matcher: 'toMatchAriaSnapshot(contain)', pass: true });
          const equalFail = templates['queue-equal-extra-fails'];
          const failing = expect(list).toMatchAriaSnapshot(equalFail.text, { timeout: T.negativeSnapshotMs });
          await captureRejection(record, 'equal-explicit.extra-child', failing, spec.negative.errorPatterns, {
            kind: 'aria-snapshot',
            matcher: 'expect(locator).toMatchAriaSnapshot(children: equal) rejected',
            template: equalFail.path,
            templateSha256: equalFail.sha256,
            mustContain: ['listitem "Gamma"'],
          });
          const equalExact = templates['queue-equal-exact'];
          await expect(list).toMatchAriaSnapshot(equalExact.text);
          record.checks.push({ id: 'equal.full-green', matcher: 'toMatchAriaSnapshot(equal exact)', pass: true });
          record.counts = { ...record.counts, items: 3, subsetItems: 2, equalRejected: true };
          record.actual = 'default contain passed, explicit children:equal rejected Alpha/Beta against Alpha/Beta/Gamma, and the exact three-item equal template passed';
          break;
        }
        case 'checked-wrong-state': {
          record.phase = 'checked-reveal';
          const toggle = page.getByRole('button', { name: 'Toggle advanced', exact: true });
          await toggle.click({ timeout: T.actionMs });
          const checkbox = page.getByLabel('Accept terms');
          assertLocatorContract(record, checkbox, spec);
          await expect(checkbox).toHaveCount(1);
          await expect(checkbox).not.toBeChecked();
          const beforeYaml = await captureSnapshot(session, 'before', checkbox);
          await expect(checkbox).toMatchAriaSnapshot(templates['checkbox-unchecked'].text);
          record.checks.push({ id: 'checked.unchecked-partial-green', matcher: 'toMatchAriaSnapshot(unchecked)', pass: true });
          const checked = templates['checkbox-checked'];
          const uncheckedVsChecked = expect(checkbox).toMatchAriaSnapshot(checked.text, { timeout: T.negativeSnapshotMs });
          await captureRejection(record, 'checked-wrong.unchecked-vs-checked', uncheckedVsChecked, spec.negative.errorPatterns, {
            kind: 'aria-snapshot',
            matcher: 'expect(locator).toMatchAriaSnapshot([checked]) rejected',
            template: checked.path,
            templateSha256: checked.sha256,
            mustContain: ['checkbox "Accept terms"'],
          });
          await checkbox.check({ timeout: T.actionMs });
          await expect(checkbox).toBeChecked();
          const afterYaml = await captureSnapshot(session, 'after', checkbox);
          await expect(checkbox).toMatchAriaSnapshot(checked.text);
          record.checks.push({ id: 'checked.checked-green', matcher: 'toMatchAriaSnapshot([checked])', pass: true });
          expect(afterYaml).toContain('[checked]');
          const checkedFalse = templates['checkbox-checked-false'];
          const checkedVsFalse = expect(checkbox).toMatchAriaSnapshot(checkedFalse.text, { timeout: T.negativeSnapshotMs });
          await captureRejection(record, 'checked-wrong.checked-vs-false', checkedVsFalse, spec.negative.errorPatterns, {
            kind: 'aria-snapshot',
            matcher: 'expect(locator).toMatchAriaSnapshot([checked=false]) rejected',
            template: checkedFalse.path,
            templateSha256: checkedFalse.sha256,
            mustContain: ['[checked]'],
          });
          record.counts = {
            ...record.counts,
            beforeChecked: false,
            afterChecked: true,
            beforeBytes: Buffer.byteLength(beforeYaml),
            afterBytes: Buffer.byteLength(afterYaml),
            negatives: 2,
          };
          record.actual = 'unchecked passed the partial template and rejected [checked]; after checking, the same [checked] template passed and [checked=false] rejected the checked control';
          break;
        }
        default:
          throw new Error(`unregistered case body: ${caseDef.name}`);
      }
      record.phase = 'confinement';
      assertSessionConfinement(session, record);
      record.status = 'pass';
    } catch (error) {
      primaryError = error;
      record.status = 'fail';
      record.error = {
        name: error?.name || 'Error',
        message: String(error?.message || error),
        stack: String(error?.stack || ''),
        phase: record.phase,
      };
    } finally {
      if (session) {
        try {
          record.cleanup = await cleanupSession(session);
        } catch (cleanupError) {
          record.cleanup = {
            contextPresent: Boolean(session.context),
            ok: false,
            error: String(cleanupError?.message || cleanupError),
          };
          if (!primaryError) {
            primaryError = cleanupError;
            record.status = 'fail';
            record.error = { name: 'CleanupError', message: String(cleanupError?.message || cleanupError), stack: String(cleanupError?.stack || ''), phase: 'cleanup' };
          }
        }
        if (!record.cleanup.ok && !primaryError) {
          primaryError = new Error(`cleanup proof failed: ${JSON.stringify(record.cleanup)}`);
          record.status = 'fail';
          record.error = { name: 'CleanupError', message: primaryError.message, stack: primaryError.stack, phase: 'cleanup' };
        }
      } else {
        record.cleanup = { contextPresent: false, ok: false, reason: 'session not created' };
      }
      record.durationMs = Date.now() - started;
      try {
        finalizeCase(record, session);
      } catch (error) {
        if (!primaryError) {
          primaryError = error;
          record.status = 'fail';
          record.error = { name: error?.name || 'Error', message: String(error?.message || error), stack: String(error?.stack || ''), phase: 'receipt-write' };
        }
      }
    }
    if (primaryError) throw primaryError;
  });
}

test.beforeAll(async () => {
  try {
    mkdirSync(ACTUAL_DIR, { recursive: true });
    if (LOAD_ERROR) throw new Error(`manifest/pin load failed: ${LOAD_ERROR.message}`);
    ROOT_OUTPUTS_BEFORE = process.env.TABI_R13_ARIA_ROOT_OUTPUTS_BEFORE
      ? JSON.parse(process.env.TABI_R13_ARIA_ROOT_OUTPUTS_BEFORE)
      : {
          testResults: existsSync(join(ROOT, 'test-results')),
          playwrightReport: existsSync(join(ROOT, 'playwright-report')),
        };
    NOTE_INFO = loadNoteAdmission();
    MANIFEST_TEXT = readFileSync(join(HERE, 'manifest.json'), 'utf8');
    MANIFEST_SHA256 = sha256Text(MANIFEST_TEXT);
    PIN_SHA256 = sha256FileSync(join(HERE, 'runtime-pin.json'));
    SCRIPT_SHA256 = sha256FileSync(SCRIPT_PATH);
    RUNTIME = await resolveRuntime();
    INPUT_CHECKS.push(...setupInputChecks());
    for (const [name, entry] of Object.entries(MANIFEST.fixtures)) {
      const body = readFileSync(join(ROOT, entry.path));
      const servedSha256 = createHash('sha256').update(body).digest('hex');
      if (servedSha256 !== entry.sha256 || body.length !== entry.bytes) {
        throw new Error(`served fixture bytes do not match manifest: ${name}`);
      }
      FIXTURE_BODIES.set(`/fixtures/${basename(entry.path)}`, body);
    }
    if (FIXTURE_BODIES.size !== Object.keys(MANIFEST.fixtures).length) {
      throw new Error('fixture URL collision');
    }
    await startServer();
  } catch (error) {
    SETUP_ERROR = new Error(`setup failed: ${error?.message || error}`);
    SETUP_ERROR.stack = String(error?.stack || '');
  }
});

test.afterAll(async () => {
  const started = Date.now();
  let serverProof = {
    origin: ORIGIN,
    listeningBefore: SERVER ? SERVER.listening : false,
    closed: false,
    listeningAfter: null,
    refusedAfterClose: false,
    refusalDetail: null,
    closeError: SETUP_ERROR ? String(SETUP_ERROR.message) : null,
  };
  try {
    serverProof = await closeServerAndProve();
  } catch (error) {
    serverProof.closeError = String(error?.message || error);
  }
  const rootOutputsAfter = {
    testResults: existsSync(join(ROOT, 'test-results')),
    playwrightReport: existsSync(join(ROOT, 'playwright-report')),
  };
  const rootOutputsIntroduced = {
    testResults: !ROOT_OUTPUTS_BEFORE?.testResults && rootOutputsAfter.testResults,
    playwrightReport: !ROOT_OUTPUTS_BEFORE?.playwrightReport && rootOutputsAfter.playwrightReport,
  };
  const artifactsEntries = existsSync(join(HERE, 'artifacts')) ? readdirSync(join(HERE, 'artifacts')) : [];
  const runtime = runtimePinStatus();
  const expectedNames = CASE_ORDER.map((entry) => entry.name);
  const actualNames = CASE_RECORDS.map((entry) => entry.name);
  const caseSetOk =
    actualNames.length === expectedNames.length &&
    expectedNames.every((name) => actualNames.filter((actual) => actual === name).length === 1) &&
    CASE_RECORDS.every((record) => record.findingId === CASE_ORDER.find((entry) => entry.name === record.name)?.findingId);
  const allCasesPass = CASE_RECORDS.length === CASE_ORDER.length && CASE_RECORDS.every((record) => record.status === 'pass');
  const allCleanupPass = CASE_RECORDS.length === CASE_ORDER.length && CASE_RECORDS.every((record) => record.cleanup?.ok === true);
  const negativeKinds = [...new Set(NEGATIVES.map((entry) => entry.kind))];
  const externalsZero =
    CASE_RECORDS.length === CASE_ORDER.length &&
    CASE_RECORDS.every((record) => (record.externalAborts || []).length === 0 && (record.externalSeen || []).length === 0);
  const serverOk = serverProof.closed && serverProof.listeningAfter === false && serverProof.refusedAfterClose === true;
  const outputConfinementOk = !rootOutputsIntroduced.testResults && !rootOutputsIntroduced.playwrightReport;
  const negativeOk =
    NEGATIVES.length >= 3 &&
    negativeKinds.includes('strict-mode') &&
    negativeKinds.includes('aria-snapshot') &&
    NEGATIVES.some((entry) => entry.name === 'equal-explicit.extra-child') &&
    NEGATIVES.some((entry) => entry.name === 'checked-wrong.unchecked-vs-checked') &&
    NEGATIVES.some((entry) => entry.name === 'checked-wrong.checked-vs-false');
  const findings = [
    ...CASE_RECORDS.map((record) => ({
      id: record.findingId,
      status: record.status === 'pass' ? 'pass' : 'fail',
      case: record.name,
      detail: record.error ? record.error.message : record.actual,
    })),
    {
      id: RUNTIME_FINDING,
      status: runtime.matched ? 'pass' : 'fail',
      detail: runtime,
    },
    {
      id: NOTE_FINDING,
      status: NOTE_INFO?.admitted ? 'pass' : 'fail',
      detail: NOTE_INFO,
    },
    {
      id: EXTERNAL_FINDING,
      status: externalsZero ? 'pass' : 'fail',
      detail: { cases: CASE_RECORDS.length, externalAborts: CASE_RECORDS.reduce((sum, record) => sum + (record.externalAborts || []).length, 0) },
    },
    {
      id: CLEANUP_FINDING,
      status: allCleanupPass && serverOk ? 'pass' : 'fail',
      detail: { allCaseCleanup: allCleanupPass, server: serverProof },
    },
    {
      id: CASSET_FINDING,
      status: caseSetOk && allCasesPass ? 'pass' : 'fail',
      detail: { expected: expectedNames, actual: actualNames, allCasesPass },
    },
  ];
  const verdict =
    findings.every((finding) => finding.status === 'pass') &&
    negativeOk &&
    outputConfinementOk &&
    !SETUP_ERROR
      ? 'pass'
      : 'fail';
  const receipt = {
    schema: 'tabi-aria-loopback-receipt-v1',
    wave: 'tabi-round-13-w1',
    claim: 'C2',
    lane: 'AriaRunner',
    worker: { index: process.env.TEST_WORKER_INDEX ?? null, pid: process.pid },
    generatedAt: new Date().toISOString(),
    command: 'node scripts/aria-loopback-round13.mjs',
    sourceSha256: SCRIPT_SHA256,
    loopback: true,
    externalSite: false,
    source: {
      path: rel(SCRIPT_PATH),
      sha256: SCRIPT_SHA256,
      specPath: rel(join(HERE, 'aria-loopback.spec.mjs')),
      specSha256: existsSync(join(HERE, 'aria-loopback.spec.mjs')) ? sha256FileSync(join(HERE, 'aria-loopback.spec.mjs')) : null,
      configPath: rel(join(HERE, 'playwright.config.mjs')),
      configSha256: existsSync(join(HERE, 'playwright.config.mjs')) ? sha256FileSync(join(HERE, 'playwright.config.mjs')) : null,
    },
    runtime: {
      node: RUNTIME?.node ?? process.versions.node,
      playwright: RUNTIME?.pwtVersion ?? null,
      playwrightPackage: RUNTIME?.playwrightVersion ?? null,
      playwrightCore: RUNTIME?.coreVersion ?? null,
      chromium: {
        executablePath: RUNTIME?.executablePath ?? null,
        executableSha256: RUNTIME?.executableSha256 ?? null,
        executableBytes: RUNTIME?.executableBytes ?? null,
        managedRevision: PIN?.chromium?.revision ?? null,
        version: BROWSER_VERSION,
        browserVersion: BROWSER_VERSION,
        browserVersionSource: BROWSER_VERSION_SOURCE,
        claimedVersion: PIN?.chromium?.version ?? null,
      },
      command: 'node scripts/aria-loopback-round13.mjs',
      pinned: {
        pinPath: rel(join(HERE, 'runtime-pin.json')),
        pinSha256: PIN_SHA256,
        ...runtime,
      },
    },
    pin: PIN,
    manifest: {
      path: rel(join(HERE, 'manifest.json')),
      sha256: MANIFEST_SHA256,
      schema: MANIFEST?.schema ?? null,
    },
    templates: MANIFEST
      ? Object.entries(MANIFEST.templates).map(([name, entry]) => ({
          name,
          path: entry.path,
          sha256: entry.sha256,
          bytes: entry.bytes,
          text: safeReadText(join(ROOT, entry.path)),
        }))
      : [],
    fixtures: MANIFEST
      ? Object.entries(MANIFEST.fixtures).map(([name, entry]) => ({
          name,
          path: entry.path,
          sha256: entry.sha256,
          bytes: entry.bytes,
        }))
      : [],
    inputs: INPUT_CHECKS,
    timeouts: T,
    config: {
      workers: CONFIG_OBSERVED?.workers ?? null,
      retries: CONFIG_OBSERVED?.retries ?? null,
      ignoreSnapshots: CONFIG_OBSERVED?.ignoreSnapshots ?? null,
      updateSnapshots: CONFIG_OBSERVED?.updateSnapshots ?? null,
      expectTimeoutMs: CONFIG_OBSERVED?.expectTimeoutMs ?? null,
      actionTimeoutMs: T.actionMs,
      navigationTimeoutMs: T.navigationMs,
      globalChildrenOverride: CONFIG_OBSERVED?.globalChildrenOverride ?? null,
      testTimeoutMs: CONFIG_OBSERVED?.testTimeoutMs ?? null,
      observed: CONFIG_OBSERVED,
      expected: {
        workers: 1,
        retries: 0,
        ignoreSnapshots: false,
        updateSnapshots: 'none',
        expectTimeoutMs: T.expectMs,
        globalChildrenOverride: null,
      },
    },
    note: NOTE_INFO,
    documentedContract: NOTE_INFO,
    notePath: NOTE_INFO?.path ?? null,
    noteSha256: NOTE_INFO?.sha256 ?? null,
    noteAdmitted: NOTE_INFO?.admitted === true,
    documentedNotePath: NOTE_INFO?.path ?? null,
    documentedNoteSha256: NOTE_INFO?.sha256 ?? null,
    server: {
      host: SERVER_ADDRESS,
      port: SERVER_PORT,
      origin: ORIGIN,
      fixtureRoutes: [...FIXTURE_BODIES.keys()],
      requests: SERVER_LOG,
      externalRequestsBlocked: CASE_RECORDS.reduce((sum, record) => sum + (record.externalAborts || []).length, 0),
      claimScope: 'page-level exact-origin confinement only; no claim of global host no-egress',
    },
    cases: CASE_RECORDS,
    negative: NEGATIVES,
    findings,
    profile: {
      policy: 'fresh persistent profile per case under a fresh mkdtemp TMPDIR root',
      temp: true,
      removed: allCleanupPass,
      entries: CASE_RECORDS.map((record) => ({
        case: record.name,
        dir: record.cleanup?.profileDir ?? null,
        removed: record.cleanup?.profileRemoved === true,
        tempRootRemoved: record.cleanup?.tempRootRemoved === true,
      })),
    },
    externalRequestsBlocked: CASE_RECORDS.reduce((sum, record) => sum + (record.externalAborts || []).length, 0),
    cleanup: {
      caseCleanup: CASE_RECORDS.map((record) => ({ case: record.name, ...record.cleanup })),
      allCaseCleanup: allCleanupPass,
      server: serverProof,
      serverOk,
      serverClosed: serverProof.closed,
      serverRefusedAfterClose: serverProof.refusedAfterClose,
      contextClosed: CASE_RECORDS.every((record) => record.cleanup?.contextClosed === true),
      browserProcs: CASE_RECORDS.reduce((sum, record) => sum + (record.cleanup?.browserProcessesAfter?.length || 0), 0),
      artifactsDir: rel(join(HERE, 'artifacts')),
      artifactsEntries,
      rootOutputsBefore: ROOT_OUTPUTS_BEFORE,
      rootOutputsAfter,
      rootOutputsIntroduced,
      outputConfinementOk,
      tempRootsRemoved: CASE_RECORDS.every((record) => record.cleanup?.tempRootRemoved === true),
      tempRootRemoved: CASE_RECORDS.every((record) => record.cleanup?.tempRootRemoved === true),
      profilesRemoved: CASE_RECORDS.every((record) => record.cleanup?.profileRemoved === true),
      profileRemoved: CASE_RECORDS.every((record) => record.cleanup?.profileRemoved === true),
      browserProcessesAfter: CASE_RECORDS.reduce((sum, record) => sum + (record.cleanup?.browserProcessesAfter?.length || 0), 0),
    },
    summary: {
      cases: {
        expected: CASE_ORDER.length,
        expectedIds: expectedNames,
        ran: CASE_RECORDS.length,
        passed: CASE_RECORDS.filter((record) => record.status === 'pass').length,
        failed: CASE_RECORDS.filter((record) => record.status !== 'pass').length,
      },
      negative: {
        total: NEGATIVES.length,
        kinds: negativeKinds,
        expectedFailureChecks: NEGATIVES.map((entry) => ({ name: entry.name, expected: 'reject', actual: 'reject' })),
      },
      loopback: true,
      externalSite: false,
      setupError: SETUP_ERROR ? String(SETUP_ERROR.message) : null,
      durationMs: Date.now() - started,
    },
    verdict,
  };
  // Each worker writes its local observation. A test failure restarts the
  // Playwright worker, so the launcher merges these worker receipts plus the
  // per-case JSON files into the single final receipt. No full-run assertion
  // runs here: it would fail in a restarted worker that only saw its own cases.
  mkdirSync(join(ACTUAL_DIR, 'workers'), { recursive: true });
  const workerIndex = process.env.TEST_WORKER_INDEX ?? 'x';
  const workerFile = join(ACTUAL_DIR, 'workers', `worker-${workerIndex}-${process.pid}-${Date.now()}.json`);
  const tempReceipt = `${workerFile}.tmp`;
  writeFileSync(tempReceipt, `${JSON.stringify(receipt, null, 2)}\n`);
  renameSync(tempReceipt, workerFile);
});
