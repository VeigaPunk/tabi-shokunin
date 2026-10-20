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
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
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

async function main() {
  const startedAt = new Date().toISOString();
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

  if (!existsSync(RECEIPT)) {
    fail(2, 'Playwright runner did not write receipt.json', { exitStatus: result.status, startedAt });
  }
  let receipt;
  try {
    receipt = JSON.parse(readFileSync(RECEIPT, 'utf8'));
  } catch (error) {
    fail(2, `receipt.json is not valid JSON: ${error.message}`, { exitStatus: result.status });
  }
  if (receipt.schema !== 'tabi-aria-loopback-receipt-v1') {
    fail(2, 'receipt schema mismatch', { schema: receipt.schema, exitStatus: result.status });
  }
  const rootOutputsAfter = {
    testResults: existsSync(join(ROOT, 'test-results')),
    playwrightReport: existsSync(join(ROOT, 'playwright-report')),
  };
  const rootOutputsIntroduced = {
    testResults: !rootOutputsBefore.testResults && rootOutputsAfter.testResults,
    playwrightReport: !rootOutputsBefore.playwrightReport && rootOutputsAfter.playwrightReport,
  };
  const summary = {
    exit: result.status,
    verdict: receipt.verdict,
    cases: receipt.summary?.cases ?? null,
    negative: receipt.summary?.negative?.total ?? null,
    runtime: {
      playwright: receipt.runtime?.playwright ?? null,
      chromium: receipt.runtime?.chromium?.version ?? null,
    },
    pinSha256Matched: receipt.runtime?.pinned?.pinSha256 === pinSha256,
    rootOutputsIntroduced,
    receipt: relative(ROOT, RECEIPT),
    durationMs: receipt.summary?.durationMs ?? null,
  };
  console.log(`TABI-ARIA-RESULT ${JSON.stringify(summary)}`);
  if (rootOutputsIntroduced.testResults || rootOutputsIntroduced.playwrightReport) {
    console.error(`TABI-ARIA-ERROR ${JSON.stringify({ code: 1, message: 'runner introduced repo-root report directories', rootOutputsIntroduced })}`);
    process.exit(1);
  }
  if (receipt.verdict !== 'pass') process.exit(1);
  if (result.status !== 0) process.exit(1);
  process.exit(0);
}

main().catch((error) => {
  fail(2, `unexpected launcher error: ${error?.message || error}`, { stack: String(error?.stack || '') });
});
