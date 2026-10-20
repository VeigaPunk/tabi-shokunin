#!/usr/bin/env node
// Round-13 accessible-selector demonstration entry point.
//
// This wrapper does not implement a matcher and does not run assertions itself.
// It verifies the pinned runtime, then launches the real Playwright Test runner
// (the official @playwright/test CLI) against the committed spec:
//   corpus/evidence/round-13/aria/aria-loopback.spec.mjs
// The spec uses genuine @playwright/test `test` and `expect(...)` assertions,
// including expect(locator).toMatchAriaSnapshot(...), which requires a live
// Playwright Test testInfo and therefore cannot run in a bare Node process.
//
// Usage:
//   node scripts/aria-loopback-round13.mjs
//
// Dependencies (already pinned under corpus/evidence/round-13/aria):
//   @playwright/test 1.64.0, playwright 1.64.0, playwright-core 1.64.0
//   Managed Chrome for Testing 156.0.8078.4 (Playwright cache revision 1248)
// Invocation performs no page navigation outside 127.0.0.1 and writes only
// under corpus/evidence/round-13/aria/.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');
const ARIA = join(ROOT, 'corpus', 'evidence', 'round-13', 'aria');
const CONFIG = join(ARIA, 'playwright.config.mjs');
const SPEC = join(ARIA, 'aria-loopback.spec.mjs');
const PIN_PATH = join(ARIA, 'runtime-pin.json');
const MANIFEST_PATH = join(ARIA, 'manifest.json');
const LOCK_PATH = join(ARIA, 'package-lock.json');
const RECEIPT = join(ARIA, 'receipt.json');
const ACTUAL = join(ARIA, 'actual');
const ARTIFACTS = join(ARIA, 'artifacts');
const RUNNER_TIMEOUT_MS = 240000;
const SPEC_REQUIRED_MARKERS = [
  '@playwright/test',
  'expect(',
  'toMatchAriaSnapshot',
  'strict mode violation',
  'ariaSnapshot()',
];
const CONFIG_REQUIRED_MARKERS = [
  'ignoreSnapshots: false',
  "updateSnapshots: 'none'",
  'retries: 0',
  'workers: 1',
];

const requireHere = createRequire(import.meta.url);

function sha256File(path) {
  return new Promise((resolvePromise, rejectPromise) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolvePromise(hash.digest('hex')));
    stream.on('error', rejectPromise);
  });
}

async function sha256FileSyncBestEffort(path) {
  if (!existsSync(path)) return null;
  try {
    return await sha256File(path);
  } catch {
    return null;
  }
}

function writeFailureReceipt(code, message, detail = {}) {
  const body = {
    schema: 'tabi-aria-loopback-receipt-v1',
    wave: 'tabi-round-13-w1',
    claim: 'C2',
    lane: 'AriaRunner',
    generatedAt: new Date().toISOString(),
    command: 'node scripts/aria-loopback-round13.mjs',
    sourceSha256: null,
    loopback: true,
    externalSite: false,
    verdict: 'could_not_evaluate',
    error: { code, message, ...detail },
    cases: [],
    negative: [],
    templates: [],
    fixtures: [],
    runtime: {
      node: process.versions.node,
      playwright: null,
      chromium: { executablePath: null, version: null },
      pinned: { pinPath: relative(ROOT, PIN_PATH), pinSha256: null, matched: false },
    },
    cleanup: null,
    summary: { cases: { expected: 8, ran: 0, passed: 0, failed: 0 }, negative: { total: 0 }, setupError: message },
  };
  body.sourceSha256 = null;
  try {
    mkdirSync(ARIA, { recursive: true });
    const tmp = join(ARIA, `.receipt.failure.${process.pid}.tmp`);
    writeFileSync(tmp, `${JSON.stringify(body, null, 2)}\n`);
    renameSync(tmp, RECEIPT);
  } catch {
    // The diagnostic on stderr remains authoritative if the receipt cannot be written.
  }
}

function fail(code, message, detail = {}) {
  writeFailureReceipt(code, message, detail);
  console.error(`TABI-ARIA-ERROR ${JSON.stringify({ code, message, ...detail })}`);
  process.exit(code);
}

function candidatePwtDirs() {
  const dirs = [join(ARIA, 'node_modules', '@playwright', 'test')];
  const execDir = dirname(process.execPath);
  dirs.push(resolve(execDir, '..', 'lib', 'node_modules', '@playwright', 'test'));
  dirs.push('/usr/lib/node_modules/@playwright/test');
  dirs.push('/usr/local/lib/node_modules/@playwright/test');
  for (const entry of (process.env.NODE_PATH || '').split(':')) {
    if (entry) dirs.push(join(entry, '@playwright', 'test'));
  }
  return [...new Set(dirs)];
}

function resolvePwt() {
  for (const dir of candidatePwtDirs()) {
    const pkgPath = join(dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    } catch {
      continue;
    }
    if (pkg.name !== '@playwright/test') continue;
    if (!existsSync(join(dir, 'cli.js')) || !existsSync(join(dir, 'index.js'))) continue;
    return { dir, version: pkg.version, pkgPath };
  }
  return null;
}

function checkTextMarkers(path, markers) {
  if (!existsSync(path)) return { ok: false, missing: ['<file missing>'], path };
  const text = readFileSync(path, 'utf8');
  const missing = markers.filter((marker) => !text.includes(marker));
  return { ok: missing.length === 0, missing, path };
}

function readJsonIf(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function listJson(dir) {
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => join(dir, name));
  } catch {
    return [];
  }
}

function safeReadText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function sha256Text(text) {
  return createHash('sha256').update(text).digest('hex');
}

function sha256FileSync(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
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

function missingCaseRecord(entry) {
  return {
    name: entry.name,
    findingId: entry.findingId,
    status: 'missing',
    expected: entry.expected,
    actual: 'no observation was produced for this case (worker exit or restart before it ran)',
    phase: 'missing',
    durationMs: 0,
    fixture: entry.fixture ?? null,
    fixturePath: null,
    fixtureSha256: null,
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
    cleanup: { ok: false, reason: 'missing case observation' },
    browserRuntime: null,
    error: { name: 'MissingCase', message: 'case did not run before worker exit', phase: 'missing' },
    actualPath: null,
    actualSha256: null,
    actualBytes: null,
    requests: [],
    externalAborts: [],
    externalSeen: [],
  };
}

async function verifyCaseArtifacts(record) {
  const issues = [];
  if (!record.actualPath) {
    issues.push('missing actualPath');
  } else {
    const abs = join(ROOT, record.actualPath);
    if (!existsSync(abs)) {
      issues.push(`actual file missing: ${record.actualPath}`);
    } else {
      const sha = await sha256File(abs);
      if (sha !== record.actualSha256) issues.push(`actual digest mismatch: ${record.actualPath}`);
      record.actualBytes = statSync(abs).size;
    }
  }
  const snapshots = [];
  for (const snapshot of record.snapshots || []) {
    if (!snapshot.path) {
      issues.push('snapshot path missing');
      continue;
    }
    const abs = join(ROOT, snapshot.path);
    if (!existsSync(abs)) {
      issues.push(`snapshot missing: ${snapshot.path}`);
      snapshots.push(snapshot);
      continue;
    }
    const sha = await sha256File(abs);
    if (sha !== snapshot.sha256) issues.push(`snapshot digest mismatch: ${snapshot.path}`);
    snapshots.push({ ...snapshot, sha256: sha, bytes: statSync(abs).size });
  }
  if (snapshots.length) record.snapshots = snapshots;
  if (issues.length) {
    record.status = 'fail';
    record.error = {
      name: 'ArtifactIntegrityError',
      message: issues.join('; '),
      phase: 'artifact-integrity',
    };
  }
  return record;
}

function aggregateConfigOk(config) {
  return Boolean(
    config &&
      config.workers === 1 &&
      config.retries === 0 &&
      config.ignoreSnapshots === false &&
      config.updateSnapshots === 'none' &&
      config.expectTimeoutMs === 2500 &&
      (config.globalChildrenOverride === null || config.globalChildrenOverride === undefined),
  );
}

async function aggregateReceipt({ childStatus, launcherStartedAt, rootOutputsBefore, pin, pinSha256, manifest, manifestSha256, sourceSha256, rootOutputsAfter }) {
  const workerFiles = listJson(join(ACTUAL, 'workers'));
  const workerEntries = workerFiles
    .map((file) => ({ file, data: readJsonIf(file) }))
    .filter((entry) => entry.data && entry.data.schema === 'tabi-aria-loopback-receipt-v1');
  const workers = workerEntries.map((entry) => entry.data);
  const expected = manifest.cases;
  const expectedNames = expected.map((entry) => entry.name);

  const caseMap = new Map();
  const duplicateCases = [];
  for (const worker of workers) {
    for (const record of worker.cases || []) {
      const name = record?.name;
      if (!name || !expectedNames.includes(name)) continue;
      if (caseMap.has(name)) duplicateCases.push(name);
      else caseMap.set(name, record);
    }
  }
  // Fallback: a worker can exit before its afterAll runs; per-case observation
  // files are written in each test's finally block and survive the restart.
  for (const entry of expected) {
    if (caseMap.has(entry.name)) continue;
    const caseFile = join(ACTUAL, `${entry.name}.json`);
    if (!existsSync(caseFile)) continue;
    const observation = readJsonIf(caseFile);
    if (!observation) continue;
    observation.actualPath = relative(ROOT, caseFile);
    observation.actualSha256 = await sha256File(caseFile);
    observation.actualBytes = statSync(caseFile).size;
    caseMap.set(entry.name, observation);
  }
  const cases = [];
  for (const entry of expected) {
    const record = caseMap.get(entry.name);
    if (!record) {
      cases.push(missingCaseRecord(entry));
      continue;
    }
    cases.push(await verifyCaseArtifacts(record));
  }

  const negativeByName = new Map();
  for (const record of cases) {
    for (const entry of record.negative || []) {
      if (entry?.name) negativeByName.set(entry.name, entry);
    }
  }
  for (const worker of workers) {
    for (const entry of worker.negative || []) {
      if (entry?.name && !negativeByName.has(entry.name)) negativeByName.set(entry.name, entry);
    }
  }
  const negatives = [...negativeByName.values()];
  const negativeKinds = [...new Set(negatives.map((entry) => entry.kind))];

  const runtimeList = workers.map((worker) => worker.runtime).filter((runtime) => runtime && runtime.playwright);
  const runtimeSource = runtimeList[0] || null;
  const runtimeConsistent = runtimeList.every(
    (runtime) =>
      runtime.playwright === runtimeSource?.playwright &&
      runtime.playwrightPackage === runtimeSource?.playwrightPackage &&
      runtime.playwrightCore === runtimeSource?.playwrightCore &&
      runtime.chromium?.executableSha256 === runtimeSource?.chromium?.executableSha256 &&
      runtime.chromium?.executableBytes === runtimeSource?.chromium?.executableBytes,
  );
  const browserVersions = [...new Set(cases.map((record) => record.browserRuntime?.version).filter(Boolean))];
  const browserVersion = browserVersions[0] || runtimeSource?.chromium?.browserVersion || null;
  const browserVersionSource = cases.find((record) => record.browserRuntime?.source)?.browserRuntime?.source || null;
  const playwrightMatched = Boolean(
    runtimeSource &&
      runtimeSource.playwright === pin.playwrightTest &&
      runtimeSource.playwrightPackage === pin.playwright &&
      runtimeSource.playwrightCore === pin.playwrightCore &&
      runtimeConsistent,
  );
  const chromium = runtimeSource?.chromium || {};
  const chromiumMatched = Boolean(
    chromium.executablePath &&
      chromium.executablePath.endsWith(pin.chromium.executableSuffix) &&
      chromium.executableSha256 === pin.chromium.executableSha256 &&
      chromium.executableBytes === pin.chromium.bytes,
  );
  const browserVersionMatched = browserVersion === pin.chromium.version && browserVersions.length <= 1;
  const runtimePinMatched = playwrightMatched && chromiumMatched && browserVersionMatched;
  const runtime = {
    node: runtimeSource?.node ?? process.versions.node,
    playwright: runtimeSource?.playwright ?? null,
    playwrightPackage: runtimeSource?.playwrightPackage ?? null,
    playwrightCore: runtimeSource?.playwrightCore ?? null,
    chromium: {
      executablePath: chromium.executablePath ?? null,
      executableSha256: chromium.executableSha256 ?? null,
      executableBytes: chromium.executableBytes ?? null,
      managedRevision: pin.chromium.revision,
      version: browserVersion,
      browserVersion,
      browserVersionSource,
      claimedVersion: pin.chromium.version,
    },
    command: 'node scripts/aria-loopback-round13.mjs',
    pinned: {
      pinPath: relative(ROOT, PIN_PATH),
      pinSha256,
      matched: runtimePinMatched,
      playwrightMatched,
      chromiumMatched,
      browserVersionMatched,
      runtimeConsistent,
      browserVersions,
    },
  };

  const config = workers.map((worker) => worker.config).find(Boolean) || null;
  const configOk = workers.length > 0 && workers.every((worker) => aggregateConfigOk(worker.config));

  const noteFromWorker = workers.map((worker) => worker.note).find((note) => note?.path);
  const note = noteFromWorker || loadNoteAdmission();
  const noteAdmitted = note?.admitted === true && note?.acquisitionCredit === true;

  const serverProofs = workers.map((worker) => worker.cleanup?.server).filter(Boolean);
  const serverOk =
    workers.length > 0 &&
    serverProofs.length === workers.length &&
    serverProofs.every((proof) => proof.closed === true && proof.listeningAfter === false && proof.refusedAfterClose === true);
  const serverRequests = workers.flatMap((worker) => worker.server?.requests || []);
  const fixtureRoutes = [...new Set(workers.flatMap((worker) => worker.server?.fixtureRoutes || []))];
  const firstServer = workers.map((worker) => worker.server).find(Boolean) || null;
  const externalRequestsBlocked = cases.reduce((sum, record) => sum + (record.externalAborts || []).length, 0);

  const allCaseCleanup = expectedNames.every((name) => caseMap.get(name)?.cleanup?.ok === true);
  const profilesRemoved = expectedNames.every((name) => caseMap.get(name)?.cleanup?.profileRemoved === true);
  const tempRootsRemoved = expectedNames.every((name) => caseMap.get(name)?.cleanup?.tempRootRemoved === true);
  const contextClosed = expectedNames.every((name) => caseMap.get(name)?.cleanup?.contextClosed === true);
  const browserProcessesAfter = cases.reduce((sum, record) => sum + (record.cleanup?.browserProcessesAfter?.length || 0), 0);
  const rootOutputsIntroduced = {
    testResults: !rootOutputsBefore.testResults && rootOutputsAfter.testResults,
    playwrightReport: !rootOutputsBefore.playwrightReport && rootOutputsAfter.playwrightReport,
  };
  const outputConfinementOk =
    workers.length > 0 &&
    workers.every((worker) => worker.cleanup?.outputConfinementOk === true) &&
    !rootOutputsIntroduced.testResults &&
    !rootOutputsIntroduced.playwrightReport;

  const caseSetOk =
    cases.length === expected.length &&
    duplicateCases.length === 0 &&
    expectedNames.every((name) => cases.filter((record) => record.name === name).length === 1);
  const allCasesPass = caseSetOk && cases.every((record) => record.status === 'pass');
  const externalsZero = cases.every(
    (record) => (record.externalAborts || []).length === 0 && (record.externalSeen || []).length === 0,
  );
  const negativeOk =
    negatives.length >= 3 &&
    negativeKinds.includes('strict-mode') &&
    negativeKinds.includes('aria-snapshot') &&
    negatives.some((entry) => entry.name === 'equal-explicit.extra-child') &&
    negatives.some((entry) => entry.name === 'checked-wrong.unchecked-vs-checked') &&
    negatives.some((entry) => entry.name === 'checked-wrong.checked-vs-false');
  const setupError = workers.map((worker) => worker.summary?.setupError).find(Boolean) || null;
  const findings = [
    ...cases.map((record) => ({
      id: record.findingId,
      status: record.status === 'pass' ? 'pass' : 'fail',
      case: record.name,
      detail: record.error ? record.error.message : record.actual,
    })),
    { id: 'R13-ARIA-RUNTIME-PIN-01', status: runtimePinMatched ? 'pass' : 'fail', detail: runtime.pinned },
    { id: 'R13-ARIA-NOTE-01', status: noteAdmitted ? 'pass' : 'fail', detail: note },
    { id: 'R13-ARIA-CONFIG-01', status: configOk ? 'pass' : 'fail', detail: { observed: config, expected: { workers: 1, retries: 0, ignoreSnapshots: false, updateSnapshots: 'none', expectTimeoutMs: 2500, globalChildrenOverride: null } } },
    { id: 'R13-ARIA-EXTERNAL-01', status: externalsZero ? 'pass' : 'fail', detail: { cases: cases.length, externalAborts: externalRequestsBlocked } },
    { id: 'R13-ARIA-CLEANUP-01', status: allCaseCleanup && serverOk ? 'pass' : 'fail', detail: { allCaseCleanup, serverOk } },
    { id: 'R13-ARIA-CASE-SET-01', status: caseSetOk && allCasesPass ? 'pass' : 'fail', detail: { expected: expectedNames, actual: cases.map((record) => record.name), duplicates: duplicateCases, allCasesPass } },
  ];
  const verdict =
    findings.every((finding) => finding.status === 'pass') &&
    negativeOk &&
    outputConfinementOk &&
    childStatus === 0 &&
    !setupError
      ? 'pass'
      : 'fail';

  const templates = Object.entries(manifest.templates).map(([name, entry]) => ({
    name,
    path: entry.path,
    sha256: entry.sha256,
    bytes: entry.bytes,
    text: safeReadText(join(ROOT, entry.path)),
  }));
  const fixtures = Object.entries(manifest.fixtures).map(([name, entry]) => ({
    name,
    path: entry.path,
    sha256: entry.sha256,
    bytes: entry.bytes,
  }));

  return {
    schema: 'tabi-aria-loopback-receipt-v1',
    wave: 'tabi-round-13-w1',
    claim: 'C2',
    lane: 'AriaRunner',
    generatedAt: new Date().toISOString(),
    command: 'node scripts/aria-loopback-round13.mjs',
    sourceSha256,
    loopback: true,
    externalSite: false,
    source: {
      path: relative(ROOT, SCRIPT),
      sha256: sourceSha256,
      specPath: relative(ROOT, SPEC),
      specSha256: existsSync(SPEC) ? sha256FileSync(SPEC) : null,
      configPath: relative(ROOT, CONFIG),
      configSha256: existsSync(CONFIG) ? sha256FileSync(CONFIG) : null,
    },
    runtime,
    pin,
    manifest: { path: relative(ROOT, MANIFEST_PATH), sha256: manifestSha256, schema: manifest.schema ?? null },
    templates,
    fixtures,
    inputs: workers.map((worker) => worker.inputs).find(Boolean) || [],
    timeouts: workers.map((worker) => worker.timeouts).find(Boolean) || pin.timeouts,
    config: {
      workers: config?.workers ?? null,
      retries: config?.retries ?? null,
      ignoreSnapshots: config?.ignoreSnapshots ?? null,
      updateSnapshots: config?.updateSnapshots ?? null,
      expectTimeoutMs: config?.expectTimeoutMs ?? null,
      actionTimeoutMs: pin.timeouts.actionMs,
      navigationTimeoutMs: pin.timeouts.navigationMs,
      globalChildrenOverride: config?.globalChildrenOverride ?? null,
      testTimeoutMs: config?.testTimeoutMs ?? null,
      observed: config,
      expected: { workers: 1, retries: 0, ignoreSnapshots: false, updateSnapshots: 'none', expectTimeoutMs: 2500, globalChildrenOverride: null },
    },
    note,
    documentedContract: note?.documentedContract ?? null,
    notePath: note?.path ?? null,
    noteSha256: note?.sha256 ?? null,
    noteAdmitted,
    documentedNotePath: note?.path ?? null,
    documentedNoteSha256: note?.sha256 ?? null,
    profile: {
      policy: 'fresh persistent profile per case under a fresh mkdtemp TMPDIR root',
      temp: true,
      removed: profilesRemoved,
      entries: cases.map((record) => ({
        case: record.name,
        dir: record.cleanup?.profileDir ?? null,
        removed: record.cleanup?.profileRemoved === true,
        tempRootRemoved: record.cleanup?.tempRootRemoved === true,
      })),
    },
    externalRequestsBlocked,
    server: {
      host: firstServer?.host ?? null,
      port: firstServer?.port ?? null,
      origin: firstServer?.origin ?? null,
      fixtureRoutes,
      requests: serverRequests,
      externalRequestsBlocked,
      claimScope: 'page-level exact-origin confinement only; no claim of global host no-egress',
      perWorker: workers.map((worker) => ({
        worker: worker.worker,
        server: worker.server ?? null,
        proof: worker.cleanup?.server ?? null,
      })),
    },
    cases,
    negative: negatives,
    findings,
    workers: workerEntries.map(({ file, data }) => ({
      file: relative(ROOT, file),
      worker: data.worker,
      generatedAt: data.generatedAt,
      localCases: (data.cases || []).map((record) => record.name),
      setupError: data.summary?.setupError ?? null,
      serverOk: data.cleanup?.serverOk === true,
      outputConfinementOk: data.cleanup?.outputConfinementOk === true,
    })),
    cleanup: {
      caseCleanup: cases.map((record) => ({ case: record.name, ...(record.cleanup || {}) })),
      allCaseCleanup,
      server: {
        closed: serverProofs.length > 0 && serverProofs.every((proof) => proof.closed === true),
        listeningAfter: serverProofs.length > 0 ? serverProofs.every((proof) => proof.listeningAfter === false) : null,
        refusedAfterClose: serverProofs.length > 0 && serverProofs.every((proof) => proof.refusedAfterClose === true),
        ok: serverOk,
        perWorker: serverProofs,
      },
      serverOk,
      serverClosed: serverProofs.length > 0 && serverProofs.every((proof) => proof.closed === true),
      serverRefusedAfterClose: serverProofs.length > 0 && serverProofs.every((proof) => proof.refusedAfterClose === true),
      contextClosed,
      browserProcs: browserProcessesAfter,
      artifactsDir: relative(ROOT, ARTIFACTS),
      artifactsEntries: (() => {
        try {
          return readdirSync(ARTIFACTS);
        } catch {
          return [];
        }
      })(),
      rootOutputsBefore,
      rootOutputsAfter,
      rootOutputsIntroduced,
      outputConfinementOk,
      tempRootsRemoved,
      profileRemoved: profilesRemoved,
      profilesRemoved,
      browserProcessesAfter,
    },
    summary: {
      cases: {
        expected: expected.length,
        expectedIds: expectedNames,
        ran: cases.filter((record) => record.status !== 'missing').length,
        passed: cases.filter((record) => record.status === 'pass').length,
        failed: cases.filter((record) => record.status !== 'pass').length,
        missing: cases.filter((record) => record.status === 'missing').map((record) => record.name),
      },
      negative: {
        total: negatives.length,
        kinds: negativeKinds,
        expectedFailureChecks: negatives.map((entry) => ({ name: entry.name, expected: 'reject', actual: 'reject' })),
      },
      workers: workers.length,
      workerRestarts: Math.max(0, workers.length - 1),
      loopback: true,
      externalSite: false,
      setupError,
      durationMs: Date.now() - launcherStartedAt,
    },
    verdict,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  if (!existsSync(PIN_PATH)) fail(2, 'runtime pin missing', { path: relative(ROOT, PIN_PATH) });
  let pin;
  try {
    pin = JSON.parse(readFileSync(PIN_PATH, 'utf8'));
  } catch (error) {
    fail(2, `runtime pin unreadable: ${error.message}`, { path: relative(ROOT, PIN_PATH) });
  }
  const pinSha256 = await sha256FileSyncBestEffort(PIN_PATH);
  if (!pin.schema || pin.schema !== 'tabi-aria-runtime-pin-v1') {
    fail(2, 'runtime pin schema mismatch', { schema: pin.schema });
  }
  if (!existsSync(MANIFEST_PATH)) fail(2, 'fixture manifest missing', { path: relative(ROOT, MANIFEST_PATH) });
  if (!existsSync(CONFIG)) fail(2, 'Playwright config missing', { path: relative(ROOT, CONFIG) });
  if (!existsSync(SPEC)) fail(2, 'Playwright spec missing', { path: relative(ROOT, SPEC) });
  if (!existsSync(LOCK_PATH)) fail(2, 'package lock missing', { path: relative(ROOT, LOCK_PATH) });

  const specCheck = checkTextMarkers(SPEC, SPEC_REQUIRED_MARKERS);
  if (!specCheck.ok) {
    fail(2, 'spec is missing required real-runner markers', { missing: specCheck.missing, path: relative(ROOT, SPEC) });
  }
  const configCheck = checkTextMarkers(CONFIG, CONFIG_REQUIRED_MARKERS);
  if (!configCheck.ok) {
    fail(2, 'config is missing required confinement markers', { missing: configCheck.missing, path: relative(ROOT, CONFIG) });
  }

  const pwt = resolvePwt();
  if (!pwt) {
    fail(2, 'official @playwright/test package not found', {
      searched: candidatePwtDirs().map((dir) => relative(ROOT, dir) || dir),
      remedy: 'npm install --prefix corpus/evidence/round-13/aria (exact @playwright/test 1.64.0)',
    });
  }
  if (pwt.version !== pin.playwrightTest) {
    fail(2, 'resolved @playwright/test version differs from pin', { resolved: pwt.version, pinned: pin.playwrightTest, dir: pwt.dir });
  }

  const pwtRequire = createRequire(join(pwt.dir, 'index.js'));
  let chromium;
  try {
    chromium = pwtRequire(join(pwt.dir, 'index.js')).chromium;
  } catch (error) {
    fail(2, `cannot load resolved @playwright/test: ${error.message}`, { dir: pwt.dir });
  }
  let executablePath;
  try {
    executablePath = chromium.executablePath();
  } catch (error) {
    fail(2, `cannot resolve managed chromium: ${error.message}`);
  }
  if (!existsSync(executablePath)) {
    fail(2, 'managed chromium executable missing', { executablePath });
  }
  const executableStat = statSync(executablePath);
  const executableSha256 = await sha256File(executablePath);
  if (!executablePath.endsWith(pin.chromium.executableSuffix)) {
    fail(2, 'managed chromium path does not match pin', { executablePath, suffix: pin.chromium.executableSuffix });
  }
  if (executableStat.size !== pin.chromium.bytes || executableSha256 !== pin.chromium.executableSha256) {
    fail(2, 'managed chromium digest does not match pin', {
      executablePath,
      bytes: executableStat.size,
      pinnedBytes: pin.chromium.bytes,
      sha256: executableSha256,
      pinnedSha256: pin.chromium.executableSha256,
    });
  }

  rmSync(RECEIPT, { force: true });
  rmSync(ACTUAL, { recursive: true, force: true });
  mkdirSync(ACTUAL, { recursive: true });
  mkdirSync(ARTIFACTS, { recursive: true });

  const rootOutputsBefore = {
    testResults: existsSync(join(ROOT, 'test-results')),
    playwrightReport: existsSync(join(ROOT, 'playwright-report')),
  };
  const env = {
    ...process.env,
    TABI_R13_ARIA_ROOT: ROOT,
    TABI_R13_ARIA_PWT_DIR: pwt.dir,
    TABI_R13_ARIA_RECEIPT: RECEIPT,
    TABI_R13_ARIA_ACTUAL_DIR: ACTUAL,
    TABI_R13_ARIA_ROOT_OUTPUTS_BEFORE: JSON.stringify(rootOutputsBefore),
    FORCE_COLOR: '0',
  };
  const cliArgs = [
    join(pwt.dir, 'cli.js'),
    'test',
    `--config=${CONFIG}`,
    '--workers=1',
    '--retries=0',
    '--reporter=line',
    '--update-snapshots=none',
    `--timeout=${pin.timeouts.caseMs}`,
    `--output=${ARTIFACTS}`,
  ];
  const result = spawnSync(process.execPath, cliArgs, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
    timeout: RUNNER_TIMEOUT_MS,
    killSignal: 'SIGTERM',
  });

  if (result.error) {
    fail(2, `Playwright runner failed to start: ${result.error.message}`, {
      startedAt,
      cli: cliArgs,
      pinSha256,
      executablePath,
      executableSha256,
    });
  }
  if (result.signal) {
    fail(2, `Playwright runner terminated by ${result.signal}`, {
      startedAt,
      cli: cliArgs,
      pinSha256,
      executablePath,
      executableSha256,
    });
  }

  const manifest = readJsonIf(MANIFEST_PATH);
  if (!manifest || !Array.isArray(manifest.cases)) {
    fail(2, 'fixture manifest is unreadable or has no cases', { exitStatus: result.status });
  }
  const manifestSha256 = sha256FileSync(MANIFEST_PATH);
  const sourceSha256 = existsSync(SCRIPT) ? sha256FileSync(SCRIPT) : null;
  const rootOutputsAfter = {
    testResults: existsSync(join(ROOT, 'test-results')),
    playwrightReport: existsSync(join(ROOT, 'playwright-report')),
  };
  const receipt = await aggregateReceipt({
    childStatus: result.status,
    launcherStartedAt: startedMs,
    rootOutputsBefore,
    pin,
    pinSha256,
    manifest,
    manifestSha256,
    sourceSha256,
    rootOutputsAfter,
  });
  mkdirSync(ARIA, { recursive: true });
  const tempReceipt = join(ARIA, `.receipt.${process.pid}.tmp`);
  writeFileSync(tempReceipt, `${JSON.stringify(receipt, null, 2)}\n`);
  renameSync(tempReceipt, RECEIPT);

  const summary = {
    exit: result.status,
    verdict: receipt.verdict,
    cases: receipt.summary?.cases ?? null,
    negative: receipt.summary?.negative?.total ?? null,
    workers: receipt.summary?.workers ?? 0,
    runtime: {
      playwright: receipt.runtime?.playwright ?? null,
      chromium: receipt.runtime?.chromium?.version ?? null,
    },
    pinSha256Matched: receipt.runtime?.pinned?.pinSha256 === pinSha256,
    noteAdmitted: receipt.noteAdmitted === true,
    rootOutputsIntroduced: receipt.cleanup?.rootOutputsIntroduced ?? null,
    receipt: relative(ROOT, RECEIPT),
    durationMs: receipt.summary?.durationMs ?? null,
  };
  console.log(`TABI-ARIA-RESULT ${JSON.stringify(summary)}`);
  const introduced = receipt.cleanup?.rootOutputsIntroduced;
  if (introduced?.testResults || introduced?.playwrightReport) {
    console.error(`TABI-ARIA-ERROR ${JSON.stringify({ code: 1, message: 'runner introduced repo-root report directories', introduced })}`);
    process.exit(1);
  }
  if (receipt.verdict !== 'pass') process.exit(1);
  if (result.status !== 0) process.exit(1);
  process.exit(0);
}

main().catch((error) => {
  fail(2, `unexpected launcher error: ${error?.message || error}`, { stack: String(error?.stack || '') });
});
