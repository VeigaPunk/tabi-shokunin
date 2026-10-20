#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const CASE_IDS = Object.freeze([
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
]);
const CONTROL_IDS = Object.freeze([
  'invoke-before-enable',
  'invoke-cancel',
  'invoke-declarative-navigation-result',
  'invoke-domain-disabled',
]);
const DOWNLOAD_CASE_ID = 'invoke-download-refused';
const SELF_TEST_PRODUCER_PATH = 'scripts/webmcp-invoke-round18.mjs';
const SELF_TEST_PRODUCER_SHA256 = 'a'.repeat(64);
const DOWNLOAD_SUGGESTED_FILENAME = 'webmcp-refused-download.txt';
const DOWNLOAD_MARKER_PREFIX = 'tabi-r18-download-';
const EXPECTED_CHROMIUM_LAUNCH_PATH = '/usr/bin/chromium';
const DEFAULT_ENABLE_FEATURES = Object.freeze(['CDPScreenshotNewSurface']);
const DEFAULT_DISABLE_FEATURES = Object.freeze([
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
]);
const WEBMCP_ENABLE_FEATURES = Object.freeze([
  'WebMCP',
  'WebMCPTesting',
  'DevToolsWebMCPSupport',
  'DeclarativeWebmcp',
]);
const WATCHDOG_TIMEOUT_MS = 6000;
const LISTENER_SCAN_TIMEOUT_MS = 1000;
const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const EXIT = Object.freeze({ evaluated: 0, couldNotEvaluate: 2 });
const CASE_WAIT_MS = 6000;
const H1_CLEANUP_WAIT_MS = 5000;
const POLL_MS = 200;
const NORMAL_TIMEOUT_MS = 8 * 60 * 1000;
const MAX_BUFFER = 64 * 1024 * 1024;

class CannotEvaluate extends Error {}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const executableIdentityCache = new Map();

async function fileExecutableIdentity(path) {
  const canonicalPath = realpathSync(path);
  if (!executableIdentityCache.has(canonicalPath)) {
    executableIdentityCache.set(canonicalPath, (async () => {
      const stat = statSync(canonicalPath);
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(canonicalPath)) hash.update(chunk);
      return {
        path: canonicalPath,
        device: String(stat.dev),
        inode: String(stat.ino),
        sha256: hash.digest('hex'),
      };
    })());
  }
  return executableIdentityCache.get(canonicalPath);
}

function processExecutableIdentity(pid) {
  try {
    const procPath = `/proc/${pid}/exe`;
    const stat = statSync(procPath);
    return {
      path: realpathSync(procPath),
      device: String(stat.dev),
      inode: String(stat.ino),
    };
  } catch {
    return null;
  }
}

function gitEnv(home) {
  return {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: home,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_NAME: 'Tabi C2 measurement probe',
    GIT_AUTHOR_EMAIL: 'c2-measurement-probe@example.invalid',
    GIT_COMMITTER_NAME: 'Tabi C2 measurement probe',
    GIT_COMMITTER_EMAIL: 'c2-measurement-probe@example.invalid',
    LANG: 'C.UTF-8',
    TZ: 'UTC',
  };
}

function commandSync(command, args, { cwd, env, timeout = 30000, encoding = 'utf8', maxBuffer = MAX_BUFFER } = {}) {
  const result = spawnSync(command, args, { cwd, env, encoding, timeout, maxBuffer, windowsHide: true });
  if (result.error) return { status: null, signal: result.signal ?? null, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error };
  return { status: result.status, signal: result.signal, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: null };
}

function git(cwd, args, { binary = false, home = tmpdir(), timeout = 30000 } = {}) {
  const result = commandSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    env: gitEnv(home),
    timeout,
    encoding: binary ? null : 'utf8',
  });
  if (result.status !== 0 || result.error) {
    const detail = result.error?.message ?? String(result.stderr).trim() ?? `status=${result.status}`;
    throw new CannotEvaluate(`git ${args[0]} failed: ${detail}`);
  }
  return result.stdout;
}

function resolveLaneRoot() {
  const scriptDir = dirname(SCRIPT);
  return String(git(scriptDir, ['rev-parse', '--show-toplevel'])).trim();
}

function resolveRevision(lane, revisionArg, home) {
  if (!revisionArg || revisionArg.startsWith('-')) throw new CannotEvaluate('missing or invalid revision argument');
  const resolved = String(git(lane, ['rev-parse', '--verify', '--end-of-options', `${revisionArg}^{commit}`], { home })).trim();
  if (!HEX40.test(resolved)) throw new CannotEvaluate(`revision did not resolve to a full commit id: ${revisionArg}`);
  return resolved;
}

function artifactAtRevision(repo, rev, home) {
  const paths = String(git(repo, ['ls-tree', '-r', '--name-only', rev, '--', 'scripts'], { home }))
    .split('\n')
    .filter((path) => /^scripts\/webmcp-invoke-round\d+\.mjs$/.test(path));
  const artifacts = paths.map((path) => ({ path, round: Number(/round(\d+)\.mjs$/.exec(path)[1]) }));
  artifacts.sort((a, b) => b.round - a.round || a.path.localeCompare(b.path));
  const selected = artifacts[0];
  if (!selected) throw new CannotEvaluate(`no scripts/webmcp-invoke-round*.mjs artifact at ${rev}`);
  const bytes = git(repo, ['cat-file', 'blob', `${rev}:${selected.path}`], { binary: true, home });
  return { ...selected, bytes };
}

function makeSandbox(lane, revision, home) {
  const sandbox = mkdtempSync(join(tmpdir(), 'tabi-r18-mc2-'));
  try {
    const clone = commandSync('git', ['-c', 'core.hooksPath=/dev/null', 'clone', '--no-hardlinks', lane, sandbox], {
      cwd: lane,
      env: gitEnv(home),
      timeout: 120000,
    });
    if (clone.status !== 0 || clone.error) {
      throw new CannotEvaluate(`git clone --no-hardlinks failed: ${clone.error?.message ?? String(clone.stderr).trim()}`);
    }
    git(sandbox, ['checkout', '-q', '--detach', revision], { home });
    git(sandbox, ['update-ref', 'refs/heads/master', revision], { home });
    return sandbox;
  } catch (error) {
    rmSync(sandbox, { recursive: true, force: true });
    throw error;
  }
}

function childEnv(runRoot, tempPath) {
  const home = join(runRoot, 'HOME');
  mkdirSync(home, { recursive: true });
  mkdirSync(tempPath, { recursive: true });
  return {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: home,
    TMPDIR: tempPath,
    TMP: tempPath,
    TEMP: tempPath,
    TZ: 'UTC',
    LANG: 'C.UTF-8',
  };
}

function spawnCaptured(command, args, options) {
  const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  let resolveClose;
  const closed = new Promise((resolvePromise) => { resolveClose = resolvePromise; });
  child.once('close', (code, signal) => resolveClose({ code, signal }));
  let spawnError = null;
  child.once('error', (error) => { spawnError = error; });
  return {
    child,
    closed,
    get stdout() { return stdout; },
    get stderr() { return stderr; },
    get spawnError() { return spawnError; },
  };
}

function readProcArgv(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

function processesContaining(marker) {
  let names;
  try {
    names = readdirSync('/proc');
  } catch {
    return [];
  }
  const matches = [];
  for (const name of names) {
    if (!/^\d+$/.test(name)) continue;
    const argv = readProcArgv(name);
    if (argv && argv.some((arg) => arg.includes(marker))) matches.push({ pid: Number(name), argv });
  }
  return matches;
}

function isBrowserArgv(argv) {
  const exe = basename(argv[0] ?? '').toLowerCase();
  if (/(?:chrome|chromium)/.test(exe) && !/(?:crashpad|sandbox)/.test(exe)) return true;
  return argv.some((arg) => arg.startsWith('--remote-debugging-port=') || arg.startsWith('--enable-features=') || arg.startsWith('--disable-features='));
}

function allFiles(root) {
  const found = [];
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) found.push(path);
    }
  };
  visit(root);
  return found;
}

function isBrowserLaunchArgv(argv) {
  return isBrowserArgv(argv)
    && argv.some((arg) => arg.startsWith('--user-data-dir='))
    && !argv.some((arg) => arg.startsWith('--type='));
}

function tmpEntriesEmpty(path) {
  try {
    return readdirSync(path).length === 0;
  } catch (error) {
    return error?.code === 'ENOENT';
  }
}

function readVerdict(path) {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    return typeof value?.verdict === 'string' ? value.verdict.toLowerCase() : null;
  } catch {
    return null;
  }
}

function roundReceiptFiles(sandbox) {
  const evidence = join(sandbox, 'corpus', 'evidence');
  return allFiles(evidence).filter((path) => /\/round-\d+\/webmcp-invoke\/receipt\.json$/.test(path));
}

function fileStamp(path) {
  try {
    const value = statSync(path, { bigint: true });
    return `${value.dev}:${value.ino}:${value.size}:${value.mtimeNs}`;
  } catch {
    return null;
  }
}

function snapshotRoundReceipts(sandbox) {
  return new Map(roundReceiptFiles(sandbox).map((path) => [path, fileStamp(path)]));
}

function hasPassOrFailReceipt({ outPath, tempPath, sandbox, previousReceipts }) {
  const candidates = new Set([outPath]);
  for (const path of allFiles(tempPath)) if (extname(path).toLowerCase() === '.json') candidates.add(path);
  for (const path of roundReceiptFiles(sandbox)) {
    if (fileStamp(path) !== previousReceipts.get(path)) candidates.add(path);
  }
  for (const path of candidates) {
    const verdict = readVerdict(path);
    if (verdict === 'pass' || verdict === 'fail') return { found: true, path, verdict };
  }
  return { found: false, path: null, verdict: null };
}

function makeRunDirs(sandbox, label) {
  const root = mkdtempSync(join(sandbox, `.p${label[0]}-`));
  const tempPath = mkdtempSync(join(tmpdir(), `mc2-${label[0]}-`));
  return { root, tempPath, outPath: join(root, 'r.json'), env: childEnv(root, tempPath) };
}

async function terminateMarkerProcesses(markers, settleMs = 100) {
  const signal = (name) => {
    for (const marker of markers) {
      for (const processInfo of processesContaining(marker)) {
        try { process.kill(processInfo.pid, name); } catch {}
      }
    }
  };
  signal('SIGTERM');
  await sleep(settleMs);
  signal('SIGKILL');
}

async function runEarlyArtifact(sandbox, artifactPath, {
  waitMs = CASE_WAIT_MS,
  postSignalMs = H1_CLEANUP_WAIT_MS,
  closeWaitMs = 30000,
  signal = 'SIGTERM',
  label = 'h1',
} = {}) {
  const run = makeRunDirs(sandbox, label);
  const previousReceipts = snapshotRoundReceipts(sandbox);
  const proc = spawnCaptured(process.execPath, [artifactPath, '--out', run.outPath], {
    cwd: sandbox,
    env: run.env,
  });
  let pending = '';
  let caseLine = null;
  let resolveCase;
  const caseFound = new Promise((resolvePromise) => { resolveCase = resolvePromise; });
  proc.child.stdout.on('data', (chunk) => {
    pending += chunk;
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';
    for (const line of lines) {
      if (/\bWEBMCP_INVOKE_CASE\b/i.test(line)) {
        caseLine = line;
        resolveCase(line);
        break;
      }
    }
  });
  let startTimer;
  const startTimeout = new Promise((resolvePromise) => {
    startTimer = setTimeout(() => resolvePromise({ kind: 'timeout' }), waitMs);
  });
  const outcome = await Promise.race([
    caseFound.then((line) => ({ kind: 'case', line })),
    proc.closed.then((closed) => ({ kind: 'closed', closed })),
    startTimeout,
  ]);
  clearTimeout(startTimer);
  const childAliveAtSignal = proc.child.exitCode === null && proc.child.signalCode === null;
  let killSent = false;
  let close = outcome.kind === 'closed' ? outcome.closed : null;
  let remaining;
  if (outcome.kind !== 'closed') {
    killSent = proc.child.kill(signal);
    await sleep(postSignalMs);
    remaining = processesContaining(run.tempPath);
    let closeTimer;
    const closeTimeout = new Promise((resolvePromise) => {
      closeTimer = setTimeout(() => resolvePromise(null), closeWaitMs);
    });
    close = await Promise.race([proc.closed, closeTimeout]);
    clearTimeout(closeTimer);
    if (close === null) {
      proc.child.kill('SIGKILL');
      close = await Promise.race([proc.closed, sleep(100).then(() => null)]);
    }
  } else {
    remaining = processesContaining(run.tempPath);
  }
  const receipt = hasPassOrFailReceipt({ outPath: run.outPath, tempPath: run.tempPath, sandbox, previousReceipts });
  const combinedOutput = `${proc.stdout}\n${proc.stderr}`;
  const signalDelivered = combinedOutput.includes('finding=run_aborted') && combinedOutput.includes(`signal=${signal}`);
  const tmpEmpty = tmpEntriesEmpty(run.tempPath);
  return {
    trigger: outcome.kind,
    caseLine: caseLine ?? outcome.line ?? null,
    childAliveAtSignal,
    killSent,
    signalName: signal,
    signalDelivered,
    exitCode: close?.code ?? null,
    terminationSignal: close?.signal ?? null,
    processCount: remaining.length,
    processIds: remaining.map((entry) => entry.pid),
    passFailReceipt: receipt.found ? `${receipt.verdict}:${receipt.path}` : null,
    tmpEmpty,
    stdout: proc.stdout,
    stderr: proc.stderr,
    spawnError: proc.spawnError?.message ?? null,
    run,
  };
}

function scanDevToolsActivePort(tempPath) {
  return allFiles(tempPath).filter((path) => basename(path) === 'DevToolsActivePort');
}
function scanSsListeners(cwd, env) {
  const result = commandSync('ss', ['-H', '-ltnp'], { cwd, env, timeout: LISTENER_SCAN_TIMEOUT_MS });
  if (result.status !== 0 || result.error) {
    return { available: false, detail: result.error?.message ?? String(result.stderr).trim() ?? `exit=${result.status}` };
  }
  const rows = String(result.stdout).split(/\r?\n/).filter(Boolean).map((line) => ({
    line: line.trim(),
    pids: [...line.matchAll(/\bpid=(\d+)/g)].map((match) => Number(match[1])),
  }));
  return { available: true, rows };
}

async function runNormalArtifact(sandbox, artifactPath, { timeoutMs = NORMAL_TIMEOUT_MS, pollMs = POLL_MS, label = 'normal' } = {}) {
  const run = makeRunDirs(sandbox, label);
  const proc = spawnCaptured(process.execPath, [artifactPath, '--out', run.outPath], {
    cwd: sandbox,
    env: run.env,
  });
  const observed = new Map();
  const launchObserved = new Map();
  const devToolsFiles = new Set();
  const listeners = new Map();
  const liveDownloadFiles = new Set();
  let listenerScanAvailable = true;
  let listenerScanFailure = null;
  let listenerScans = 0;
  let stdoutPending = '';
  let downloadCaseLineLive = false;
  proc.child.stdout.on('data', (chunk) => {
    stdoutPending += chunk;
    const lines = stdoutPending.split(/\r?\n/);
    stdoutPending = lines.pop() ?? '';
    for (const line of lines) {
      if (/WEBMCP_INVOKE_CASE id=invoke-download-refused status=pass/i.test(line)
          && proc.child.exitCode === null
          && proc.child.signalCode === null) downloadCaseLineLive = true;
    }
  });
  const sample = () => {
    for (const processInfo of processesContaining(run.tempPath)) {
      if (!isBrowserArgv(processInfo.argv)) continue;
      const key = `${processInfo.pid}\0${processInfo.argv.join('\0')}`;
      const entry = { pid: processInfo.pid, argv: processInfo.argv };
      if (!observed.has(key)) observed.set(key, entry);
      if (isBrowserLaunchArgv(processInfo.argv) && !launchObserved.has(key)) {
        launchObserved.set(key, { ...entry, executableIdentity: processExecutableIdentity(processInfo.pid) });
      }
    }
    for (const path of scanDevToolsActivePort(run.tempPath)) devToolsFiles.add(path);
    for (const path of allFiles(run.tempPath)) {
      if (filenameMatchesDownload(path, DOWNLOAD_SUGGESTED_FILENAME)) liveDownloadFiles.add(path);
    }
    listenerScans += 1;
    const result = scanSsListeners(sandbox, run.env);
    if (!result.available) {
      listenerScanAvailable = false;
      listenerScanFailure ??= result.detail;
      return;
    }
    const pids = new Set([...observed.values()].map((entry) => entry.pid));
    for (const row of result.rows) {
      const ownerPids = row.pids.filter((pid) => pids.has(pid));
      if (ownerPids.length) listeners.set(`${ownerPids.join(',')}\0${row.line}`, { pids: ownerPids, line: row.line });
    }
  };
  sample();
  const poller = setInterval(sample, pollMs);
  let timeoutId;
  const timeoutPromise = new Promise((resolvePromise) => { timeoutId = setTimeout(() => resolvePromise(true), timeoutMs); });
  const timedOut = await Promise.race([proc.closed.then(() => false), timeoutPromise]);
  clearTimeout(timeoutId);
  let close;
  if (timedOut) {
    proc.child.kill('SIGTERM');
    close = await Promise.race([proc.closed, sleep(5000).then(() => null)]);
    if (close === null) proc.child.kill('SIGKILL');
  } else {
    close = await proc.closed;
  }
  clearInterval(poller);
  sample();
  let receiptBytes = null;
  let receipt = null;
  try {
    receiptBytes = readFileSync(run.outPath);
    receipt = JSON.parse(receiptBytes.toString('utf8'));
  } catch {
    receiptBytes = null;
    receipt = null;
  }
  const browserArgv = [...observed.values()];
  const launchArgv = [...launchObserved.values()];
  for (const entry of launchArgv) {
    const observedIdentity = entry.executableIdentity;
    if (!observedIdentity?.path) continue;
    try {
      const fileIdentity = await fileExecutableIdentity(observedIdentity.path);
      entry.executableIdentity = fileIdentity.device === observedIdentity.device && fileIdentity.inode === observedIdentity.inode
        ? fileIdentity
        : { ...observedIdentity, sha256: null };
    } catch {
      entry.executableIdentity = { ...observedIdentity, sha256: null };
    }
  }
  const result = {
    run,
    timedOut,
    completed: !timedOut && close !== null,
    exitCode: close?.code ?? null,
    signal: close?.signal ?? null,
    spawnError: proc.spawnError?.message ?? null,
    stdout: proc.stdout,
    stderr: proc.stderr,
    receipt,
    receiptBytes,
    receiptSha256: receiptBytes ? sha256(receiptBytes) : null,
    producerSha256: producerDigest(receipt),
    launchArgv,
    browserArgv,
    browserSamples: browserArgv.length,
    devToolsFiles: [...devToolsFiles],
    listenerScanAvailable,
    listenerScanFailure,
    listenerScans,
    listeners: [...listeners.values()],
    downloadCaseLineLive,
    liveDownloadFiles: [...liveDownloadFiles],
    tmpEmpty: tmpEntriesEmpty(run.tempPath),
    tmpFiles: allFiles(run.tempPath),
  };
  result.browserEvidence = browserRunEvidence(result);
  return result;
}
function producerDigest(receipt) {
  const value = receipt?.producerSha256 ?? receipt?.producer?.sha256 ?? null;
  return typeof value === 'string' && HEX64.test(value) ? value : null;
}

function recordId(record) {
  return typeof record?.id === 'string' ? record.id : typeof record?.caseId === 'string' ? record.caseId : null;
}

function recordPassed(record) {
  if (Object.hasOwn(record ?? {}, 'pass')) return record.pass === true;
  return record?.status === 'pass';
}

function countIds(records) {
  const counts = new Map();
  for (const record of records) {
    const id = recordId(record);
    if (id !== null) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

function retainedCoverage(receipt, expectedProducer = null) {
  const cases = Array.isArray(receipt?.cases) ? receipt.cases : [];
  const controls = Array.isArray(receipt?.controls) ? receipt.controls : [];
  const caseCounts = countIds(cases);
  const controlCounts = countIds(controls);
  const reasons = [];
  const duplicateCases = [...caseCounts].filter(([, count]) => count !== 1).map(([id]) => id);
  const duplicateControls = [...controlCounts].filter(([, count]) => count !== 1).map(([id]) => id);
  const requiredCaseFailures = CASE_IDS.filter((id) => caseCounts.get(id) !== 1 || !recordPassed(cases.find((record) => recordId(record) === id)));
  const requiredControlFailures = CONTROL_IDS.filter((id) => controlCounts.get(id) !== 1 || !recordPassed(controls.find((record) => recordId(record) === id)));
  const downloadMatches = cases.filter((record) => recordId(record) === DOWNLOAD_CASE_ID);
  const downloadPass = downloadMatches.length === 1 && recordPassed(downloadMatches[0]);
  let producerPass = null;
  if (!Array.isArray(receipt?.cases)) reasons.push('receipt cases[] missing');
  if (!Array.isArray(receipt?.controls)) reasons.push('receipt controls[] missing');
  if (duplicateCases.length) reasons.push(`case ids missing/duplicated: ${duplicateCases.join(',')}`);
  if (duplicateControls.length) reasons.push(`control ids missing/duplicated: ${duplicateControls.join(',')}`);
  if (requiredCaseFailures.length) reasons.push(`original required cases not uniquely passing: ${requiredCaseFailures.join(',')}`);
  if (requiredControlFailures.length) reasons.push(`original controls not uniquely passing: ${requiredControlFailures.join(',')}`);
  if (!downloadPass) reasons.push(`${DOWNLOAD_CASE_ID} is missing, duplicated, or not passing`);
  if (expectedProducer) {
    producerPass = receipt?.producerSha256 === expectedProducer.sha256
      && receipt?.producer?.sha256 === expectedProducer.sha256
      && receipt?.producer?.path === expectedProducer.path;
    if (!producerPass) reasons.push(`receipt producer identity mismatch: expected ${expectedProducer.path}@${expectedProducer.sha256}, observed ${receipt?.producer?.path ?? 'no path'}@${receipt?.producerSha256 ?? receipt?.producer?.sha256 ?? 'no digest'}`);
  }
  return {
    pass: reasons.length === 0,
    why: reasons.length ? reasons.join('; ') : 'all 11 original cases, 4 original controls, and the download case are uniquely present and passing, with the expected producer identity',
    originalCasesPassed: CASE_IDS.length - requiredCaseFailures.length,
    originalCasesRequired: CASE_IDS.length,
    originalControlsPassed: CONTROL_IDS.length - requiredControlFailures.length,
    originalControlsRequired: CONTROL_IDS.length,
    downloadCasePass: downloadPass,
    producerPass,
    producerPath: receipt?.producer?.path ?? null,
    producerSha256: producerDigest(receipt),
    duplicateCases,
    duplicateControls,
  };
}
function browserRunEvidence(normal) {
  const runs = Array.isArray(normal?.receipt?.runs) ? normal.receipt.runs : [];
  const observedLaunches = Array.isArray(normal?.launchArgv) ? normal.launchArgv : [];
  const requiredLabels = ['flagged', 'flag-off', 'domain-disabled'];
  const reasons = [];
  const matchedPids = [];
  const expected = observedLaunches.find((entry) => entry.executableIdentity?.path)?.executableIdentity ?? null;
  const expectedIsChromium = expected !== null && /(?:chromium|chrome)(?:\.exe)?$/i.test(basename(expected.path));
  if (!expectedIsChromium || !HEX64.test(expected?.sha256 ?? '')) reasons.push('no observed Chromium main with a content-addressed executable identity');
  const labelCounts = countIds(runs.map((run) => ({ id: run?.label })));
  for (const label of requiredLabels) {
    const matches = runs.filter((run) => run?.label === label);
    if (matches.length !== 1) {
      reasons.push(`receipt run ${label} occurs ${matches.length} times`);
      continue;
    }
    const run = matches[0];
    if (!Number.isInteger(run.pid) || run.pid <= 0) {
      reasons.push(`receipt run ${label} has no positive PID`);
      continue;
    }
    const observed = observedLaunches.filter((entry) => entry.pid === run.pid);
    if (observed.length !== 1) {
      reasons.push(`receipt run ${label} PID ${run.pid} is not one observed Chromium main PID`);
      continue;
    }
    const processIdentity = observed[0].executableIdentity;
    matchedPids.push(run.pid);
    if (!processIdentity
        || processIdentity.path !== expected?.path
        || processIdentity.device !== expected?.device
        || processIdentity.inode !== expected?.inode
        || processIdentity.sha256 !== expected?.sha256
        || observed[0].argv[0] !== processIdentity.path) {
      reasons.push(`observed PID ${run.pid} executable identity differs from the actual launch identity`);
    }
    if (run.realExecutable !== processIdentity?.path || run.realExecutableSha256 !== processIdentity?.sha256) {
      reasons.push(`receipt run ${label} executable identity does not match observed PID ${run.pid}`);
    }
    const recordedArgv = run.effectiveArgv ?? run.argv;
    if (!Array.isArray(recordedArgv) || JSON.stringify(recordedArgv) !== JSON.stringify(observed[0].argv)) {
      reasons.push(`receipt run ${label} argv does not match observed PID ${run.pid}`);
    }
  }
  if (labelCounts.size !== requiredLabels.length || requiredLabels.some((label) => labelCounts.get(label) !== 1)) {
    reasons.push('receipt run labels are not an exact unique launch-role set');
  }
  const chromium = normal?.receipt?.runtime?.observed?.chromium;
  if (chromium?.launchPath !== EXPECTED_CHROMIUM_LAUNCH_PATH
      || chromium?.realExecutable !== expected?.path
      || chromium?.realExecutableSha256 !== expected?.sha256) {
    reasons.push('receipt runtime Chromium identity does not match the observed launch identity');
  }
  return {
    pass: reasons.length === 0,
    why: reasons.length ? reasons.join('; ') : 'all three receipt launch PIDs match observed Chromium mains and effective executable SHA-256',
    expectedExecutable: expected?.path ?? null,
    expectedExecutableSha256: expected?.sha256 ?? null,
    receiptPids: runs.map((run) => run?.pid ?? null),
    matchedPids,
    observedLaunchPids: observedLaunches.map((run) => run.pid),
  };
}
function coveredHazard(ownPass, ownWhy, coverage, browserEvidence = null) {
  if (!coverage.pass) return { pass: false, why: `retained-coverage precondition failed (${coverage.why}); ${ownWhy}` };
  if (browserEvidence && !browserEvidence.pass) return { pass: false, why: `observed-browser precondition failed (${browserEvidence.why}); ${ownWhy}` };
  return { pass: Boolean(ownPass), why: ownWhy };
}

function h1Hazard(h1, coverage, normal) {
  const pass = h1.trigger === 'case'
    && typeof h1.caseLine === 'string'
    && h1.childAliveAtSignal
    && h1.killSent
    && h1.signalName === 'SIGTERM'
    && h1.signalDelivered
    && h1.exitCode === 2
    && h1.passFailReceipt === null
    && h1.processCount === 0;
  const why = `case started=${typeof h1.caseLine === 'string'}, child alive at signal=${h1.childAliveAtSignal}, SIGTERM sent=${h1.killSent}, run_aborted/SIGTERM observed=${h1.signalDelivered}, exit=${h1.exitCode ?? 'none'}, pass/fail receipt=${h1.passFailReceipt ?? 'none'}, surviving TMPDIR processes=${h1.processCount}`;
  return coveredHazard(pass, why, coverage, normal?.browserEvidence);
}

function h2Hazard({ h1, sigint, normal, watchdog }, coverage) {
  const sigintTriggered = sigint.trigger === 'case'
    && typeof sigint.caseLine === 'string'
    && sigint.childAliveAtSignal
    && sigint.killSent
    && sigint.exitCode !== null;
  const watchdogText = `${watchdog.stdout}\n${watchdog.stderr}`;
  const watchdogTriggered = watchdog.completed
    && watchdog.exitCode === 2
    && watchdog.browserSamples > 0
    && /(?:run_timeout|hard run timeout)/i.test(watchdogText);
  const pass = h1.tmpEmpty && normal.tmpEmpty && sigintTriggered && sigint.tmpEmpty && watchdogTriggered && watchdog.tmpEmpty;
  const why = `TMPDIR empty after SIGTERM=${h1.tmpEmpty}, normal=${normal.tmpEmpty}, SIGINT run=${sigintTriggered} (empty=${sigint.tmpEmpty}), watchdog=${watchdogTriggered} (empty=${watchdog.tmpEmpty}, browser argv=${watchdog.browserSamples})`;
  return coveredHazard(pass, why, coverage, normal.browserEvidence);
}

function h3Hazard(normal, coverage) {
  const remotePort = normal.browserArgv.some(({ argv }) => argv.some((arg) => arg.startsWith('--remote-debugging-port')));
  const ownedListeners = normal.listeners.length;
  const pass = normal.completed
    && normal.browserSamples > 0
    && normal.listenerScanAvailable
    && !remotePort
    && normal.devToolsFiles.length === 0
    && ownedListeners === 0;
  const why = `normal run completed=${normal.completed}, observed browser argv=${normal.browserSamples}, --remote-debugging-port seen=${remotePort}, DevToolsActivePort seen=${normal.devToolsFiles.length > 0}, ss scans=${normal.listenerScans} available=${normal.listenerScanAvailable}, browser-owned listeners=${ownedListeners}`;
  return coveredHazard(pass, why, coverage, normal.browserEvidence);
}
function filenameMatchesDownload(filePath, suggestedFilename) {
  const actual = basename(filePath).toLowerCase();
  const expected = basename(suggestedFilename).toLowerCase();
  if (actual === expected) return true;
  const suffix = extname(expected);
  const stem = suffix ? expected.slice(0, -suffix.length) : expected;
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ext = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped} \\(\\d+\\)${ext}$`, 'i').test(actual);
}

function clearDownloadScan(scan) {
  return scan?.complete === true && Array.isArray(scan.matches) && scan.matches.length === 0;
}

function h4Hazard(normal, coverage) {
  const cases = Array.isArray(normal.receipt?.cases) ? normal.receipt.cases : [];
  const matches = cases.filter((record) => recordId(record) === DOWNLOAD_CASE_ID);
  const entry = matches.length === 1 ? matches[0] : null;
  const observations = entry?.actual ?? entry?.observations ?? {};
  const receiptEvents = Array.isArray(entry?.downloadEvents) ? entry.downloadEvents : [];
  const observedEvents = Array.isArray(observations.downloadEvents) ? observations.downloadEvents : [];
  const event = observedEvents.length === 1 ? observedEvents[0] : null;
  const markerValid = observations.downloadMarkerPrefix === DOWNLOAD_MARKER_PREFIX && HEX64.test(observations.downloadMarkerSha256 ?? '');
  const invocationIdPresent = observations.invoke?.invocationId !== null && observations.invoke?.invocationId !== undefined;
  const invocationRequestValid = observations.invoke?.request?.method === 'WebMCP.invokeTool'
    && observations.invoke?.request?.params?.toolName === 'download-blob';
  const invokeErrorNull = observations.invoke?.error === null;
  const respondedCompleted = observations.responded?.status === 'Completed';
  const responseOutputMatches = observations.responded?.output === 'download-triggered';
  const attempt = markerValid && invocationRequestValid && invocationIdPresent && invokeErrorNull && respondedCompleted && responseOutputMatches;
  const failureText = typeof event?.failure === 'string' ? event.failure : '';
  // Playwright 1.64.0's denied-download path reports this exact diagnostic as failure().
  const refusalText = failureText === 'Pass { acceptDownloads: true } when you are creating your browser context.'
    || (/cancel|reject|refus/i.test(failureText) && !/acceptDownloads\s*:\s*true/i.test(failureText));
  const refusalRecorded = event !== null
    && receiptEvents.length === 1
    && receiptEvents[0]?.suggestedFilename === event.suggestedFilename
    && receiptEvents[0]?.failure === event.failure
    && event.suggestedFilename === DOWNLOAD_SUGGESTED_FILENAME
    && event.failureSettled === true
    && event.failure !== null
    && event.failureError === null
    && refusalText;
  const beforeCloseClear = ['runTempDir', 'processTmpdir'].every((key) => clearDownloadScan(observations.beforeContextClose?.[key]));
  const afterCloseClear = ['runTempDir', 'processTmpdir'].every((key) => clearDownloadScan(observations.afterContextClose?.[key]));
  const liveFiles = normal.liveDownloadFiles;
  const downloadedFiles = normal.tmpFiles.filter((path) => filenameMatchesDownload(path, event?.suggestedFilename ?? DOWNLOAD_SUGGESTED_FILENAME));
  const pass = entry !== null
    && recordPassed(entry)
    && normal.downloadCaseLineLive
    && attempt
    && refusalRecorded
    && beforeCloseClear
    && afterCloseClear
    && liveFiles.length === 0
    && downloadedFiles.length === 0;
  const why = `case unique=${entry !== null}, pass=${entry ? recordPassed(entry) : false}, case line observed while process live=${normal.downloadCaseLineLive}, actual invoke attempt=${attempt} (marker prefix+sha=${markerValid}, request=${invocationRequestValid}, invocationId=${invocationIdPresent}, no error=${invokeErrorNull}, responded=${respondedCompleted}, output=${responseOutputMatches}, fields=${Object.keys(observations).join(',') || 'none'}), one settled refusal event=${refusalRecorded}, pre-close scans clear=${beforeCloseClear}, post-close scans clear=${afterCloseClear}, fixture files seen live=${liveFiles.length}, present after run=${downloadedFiles.length}`;
  return coveredHazard(pass, why, coverage, normal.browserEvidence);
}

function featureSwitchCounts(argv) {
  return {
    enable: argv.filter((arg) => arg.startsWith('--enable-features=')).length,
    disable: argv.filter((arg) => arg.startsWith('--disable-features=')).length,
  };
}

function featureValues(argv, switchName) {
  const prefix = `--${switchName}=`;
  return argv
    .filter((arg) => arg.startsWith(prefix))
    .flatMap((arg) => arg.slice(prefix.length).split(',').filter(Boolean));
}

function duplicateValues(values) {
  const seen = new Set();
  return values.filter((value) => seen.has(value) || !seen.add(value));
}

function expectedFeatureProfile(argv) {
  const enable = featureValues(argv, 'enable-features');
  const disable = featureValues(argv, 'disable-features');
  const blink = featureValues(argv, 'enable-blink-features');
  const hasWebMcp = [...enable, ...blink].some((feature) => WEBMCP_ENABLE_FEATURES.includes(feature));
  const role = disable.includes('DevToolsWebMCPSupport')
    ? 'domain-disabled'
    : enable.includes('WebMCP') && blink.includes('WebMCP')
      ? 'flagged'
      : !hasWebMcp
        ? 'flag-off'
        : 'unknown';
  const expectedEnable = [...DEFAULT_ENABLE_FEATURES, ...(role === 'flagged' ? WEBMCP_ENABLE_FEATURES : [])];
  const expectedDisable = [...DEFAULT_DISABLE_FEATURES, ...(role === 'domain-disabled' ? ['DevToolsWebMCPSupport'] : [])];
  const expectedBlink = role === 'flagged' ? ['WebMCP', 'WebMCPTesting'] : role === 'domain-disabled' ? ['WebMCP'] : [];
  const missing = [
    ...expectedEnable.filter((feature) => !enable.includes(feature)).map((feature) => `enable:${feature}`),
    ...expectedDisable.filter((feature) => !disable.includes(feature)).map((feature) => `disable:${feature}`),
    ...expectedBlink.filter((feature) => !blink.includes(feature)).map((feature) => `blink:${feature}`),
  ];
  if (role === 'flag-off' && [...enable, ...blink].some((feature) => WEBMCP_ENABLE_FEATURES.includes(feature))) {
    missing.push('flag-off unexpectedly enables WebMCP');
  }
  const repeated = [
    ...duplicateValues(enable).map((feature) => `enable:${feature}`),
    ...duplicateValues(disable).map((feature) => `disable:${feature}`),
    ...duplicateValues(blink).map((feature) => `blink:${feature}`),
  ];
  return { role, missing, repeated, counts: featureSwitchCounts(argv) };
}

function s1Hazard(normal, coverage) {
  const roles = new Set();
  const violations = [];
  for (const { pid, argv } of normal.launchArgv) {
    const profile = expectedFeatureProfile(argv);
    roles.add(profile.role);
    if (profile.counts.enable !== 1 || profile.counts.disable > 1 || profile.role === 'unknown' || profile.missing.length || profile.repeated.length) {
      violations.push({ pid, role: profile.role, enable: profile.counts.enable, disable: profile.counts.disable, missing: profile.missing, repeated: profile.repeated });
    }
  }
  const requiredRoles = ['flagged', 'flag-off', 'domain-disabled'];
  const missingRoles = requiredRoles.filter((role) => !roles.has(role));
  const pass = normal.launchArgv.length > 0 && violations.length === 0 && missingRoles.length === 0;
  const why = `observed launched browser argv=${normal.launchArgv.length}, required launch roles missing=${missingRoles.join(',') || 'none'}, feature-union violations=${violations.length}${violations.length ? ` (${JSON.stringify(violations)})` : ''}`;
  return coveredHazard(pass, why, coverage, normal.browserEvidence);
}
function f6Hazard(sandbox, revision, wrapperPath, coverage, home) {
  if (!existsSync(wrapperPath) || !statSync(wrapperPath).isFile()) {
    return coveredHazard(false, 'scripts/freshness-witness.mjs absent or not a regular file at the revision', coverage);
  }
  const poison = String(git(sandbox, ['commit-tree', `${revision}^{tree}`, '-p', revision, '-m', 'round-18 C2 off-branch witness probe'], { home })).trim();
  if (!HEX40.test(poison)) throw new CannotEvaluate('failed to create F6 off-branch poison commit');
  git(sandbox, ['checkout', '-q', '--detach', poison], { home });
  const head = String(git(sandbox, ['rev-parse', '--verify', 'HEAD'], { home })).trim();
  const branchTip = String(git(sandbox, ['rev-parse', '--verify', 'refs/heads/master'], { home })).trim();
  if (head !== poison || branchTip !== revision || poison === branchTip) throw new CannotEvaluate('F6 poison commit did not leave HEAD detached from refs/heads/master');
  const env = childEnv(join(sandbox, '.measure-c2-f6-home'), join(sandbox, '.measure-c2-f6-tmp'));
  const badRevision = commandSync(process.execPath, [wrapperPath, '--rev', 'HEAD'], {
    cwd: sandbox,
    env,
    timeout: 30000,
  });
  const dryRun = commandSync(process.execPath, [wrapperPath, '--dry-run'], {
    cwd: sandbox,
    env,
    timeout: 30000,
  });
  const tipPrinted = dryRun.status === 0 && String(dryRun.stdout).includes(branchTip);
  const pass = badRevision.status === 2 && tipPrinted;
  return coveredHazard(pass, `wrapper-scoped F6 check: --rev HEAD exit=${badRevision.status ?? 'none'}, expected 2; detached HEAD=${head}; master=${branchTip}; --dry-run exit=${dryRun.status ?? 'none'}, master hash printed=${tipPrinted}; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable`, coverage);
}

function wrapperAndArtifactOverrides(sandbox, artifact, args) {
  let selectedArtifactPath = join(sandbox, artifact.path);
  if (args.worktreeArtifact) {
    const source = resolve(args.worktreeArtifact);
    if (!existsSync(source) || !statSync(source).isFile()) throw new CannotEvaluate(`worktree artifact is not a regular file: ${source}`);
    const name = basename(source);
    if (/^webmcp-invoke-round\d+\.mjs$/.test(name)) selectedArtifactPath = join(sandbox, 'scripts', name);
    mkdirSync(dirname(selectedArtifactPath), { recursive: true });
    copyFileSync(source, selectedArtifactPath);
  }
  const wrapperPath = join(sandbox, 'scripts', 'freshness-witness.mjs');
  if (args.worktreeWrapper) {
    const source = resolve(args.worktreeWrapper);
    if (!existsSync(source) || !statSync(source).isFile()) throw new CannotEvaluate(`worktree wrapper is not a regular file: ${source}`);
    mkdirSync(dirname(wrapperPath), { recursive: true });
    copyFileSync(source, wrapperPath);
  }
  return { selectedArtifactPath, wrapperPath };
}

function makeWatchdogProbeArtifact(sandbox, sourcePath) {
  const originalBytes = readFileSync(sourcePath);
  const originalText = originalBytes.toString('utf8');
  const matches = [...originalText.matchAll(/const RUN_TIMEOUT_MS = \d+;/g)];
  if (matches.length !== 1) throw new CannotEvaluate(`watchdog probe expected one RUN_TIMEOUT_MS declaration, found ${matches.length}`);
  const originalDeclaration = matches[0][0];
  const originalTimeoutMs = Number(/\d+/.exec(originalDeclaration)[0]);
  const modifiedDeclaration = `const RUN_TIMEOUT_MS = ${WATCHDOG_TIMEOUT_MS};`;
  const modifiedText = originalText.slice(0, matches[0].index)
    + modifiedDeclaration
    + originalText.slice(matches[0].index + originalDeclaration.length);
  const modifiedBytes = Buffer.from(modifiedText);
  const relativePath = 'scripts/.measure-c2-watchdog-probe.mjs';
  const artifactPath = join(sandbox, relativePath);
  writeFileSync(artifactPath, modifiedBytes);
  return {
    artifactPath,
    patch: {
      path: relativePath,
      originalTimeoutMs,
      timeoutMs: WATCHDOG_TIMEOUT_MS,
      originalDeclaration,
      modifiedDeclaration,
      originalSha256: sha256(originalBytes),
      modifiedSha256: sha256(modifiedBytes),
      modifiedBytesLength: modifiedBytes.length,
    },
  };
}

function evaluateHazards({ sandbox, revision, wrapperPath, h1, sigint, normal, watchdog, coverage, home }) {
  return {
    h1: h1Hazard(h1, coverage, normal),
    h2: h2Hazard({ h1, sigint, normal, watchdog }, coverage),
    h3: h3Hazard(normal, coverage),
    h4: h4Hazard(normal, coverage),
    s1: s1Hazard(normal, coverage),
    f6: f6Hazard(sandbox, revision, wrapperPath, coverage, home),
  };
}

function outputRecord({ rev, hazards, artifact, artifactSha256, counterSha256, h1, normal, sigint, watchdog, watchdogPatch, coverage, mode }) {
  const watchdogText = `${watchdog?.stdout ?? ''}\n${watchdog?.stderr ?? ''}`;
  const diagnostics = mode === 'worktree' ? Object.fromEntries(
    [['h1', h1], ['sigint', sigint], ['normal', normal], ['watchdog', watchdog]].map(([name, probe]) => [name, probe ? {
      exitCode: probe.exitCode,
      signal: probe.terminationSignal ?? probe.signal ?? null,
      stdout: `${probe.stdout ?? ''}`.slice(-4000),
      stderr: `${probe.stderr ?? ''}`.slice(-4000),
    } : null]),
  ) : null;
  const runtime = normal?.receipt?.runtime?.observed ?? null;
  return {
    rev,
    c2_hazards_closed: Object.values(hazards).filter((result) => result.pass).length,
    hazards,
    artifact,
    artifactSha256,
    counterSha256,
    receiptSha256: normal?.receiptSha256 ?? null,
    producerPath: normal?.receipt?.producer?.path ?? null,
    producerSha256: normal?.producerSha256 ?? null,
    runtimeIdentity: runtime ? {
      chromium: {
        launchPath: runtime.chromium?.launchPath ?? null,
        realExecutable: runtime.chromium?.realExecutable ?? null,
        realExecutableSha256: runtime.chromium?.realExecutableSha256 ?? null,
        version: runtime.chromium?.version ?? null,
      },
      playwright: runtime.playwright ?? null,
      playwrightDir: runtime.playwrightDir ?? null,
      node: runtime.node ?? null,
    } : null,
    browserEvidence: normal?.browserEvidence ?? null,
    watchdogPatch: watchdogPatch ?? null,
    abnormalProbes: {
      sigint: sigint ? {
        caseStarted: typeof sigint.caseLine === 'string',
        childAliveAtSignal: sigint.childAliveAtSignal,
        signalSent: sigint.killSent,
        exitCode: sigint.exitCode,
        tmpEmpty: sigint.tmpEmpty,
      } : null,
      watchdog: watchdog ? {
        fired: /(?:run_timeout|hard run timeout)/i.test(watchdogText),
        exitCode: watchdog.exitCode,
        browserArgv: watchdog.browserSamples,
        tmpEmpty: watchdog.tmpEmpty,
      } : null,
    },
    coverage: coverage ?? null,
    ...(mode === 'worktree' ? { mode: 'worktree', diagnostics } : {}),
  };
}

function emit(record) {
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

function errorRecord(error, { revision = null, artifact = null, artifactSha256 = null, counterSha256 = null, mode = 'revision' } = {}) {
  const why = String(error?.message ?? error).replace(/\s+/g, ' ');
  const hazards = Object.fromEntries(['h1', 'h2', 'h3', 'h4', 's1', 'f6'].map((id) => [id, { pass: false, why: `could not evaluate: ${why}` }]));
  return outputRecord({
    rev: mode === 'worktree' ? `worktree:${revision ?? 'unknown'}` : revision,
    hazards,
    artifact,
    artifactSha256,
    counterSha256,
    normal: null,
    coverage: { pass: false, why: `could not evaluate: ${why}` },
    mode,
  });
}

function parseArguments(argv) {
  const result = { revision: null, selfTest: false, worktreeArtifact: null, worktreeWrapper: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--self-test') result.selfTest = true;
    else if (arg === '--worktree-artifact' || arg === '--worktree-wrapper') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new CannotEvaluate(`${arg} requires a path`);
      result[arg === '--worktree-artifact' ? 'worktreeArtifact' : 'worktreeWrapper'] = value;
    } else if (arg.startsWith('-')) {
      throw new CannotEvaluate(`unknown option ${arg}`);
    } else if (result.revision === null) {
      result.revision = arg;
    } else {
      throw new CannotEvaluate('unexpected extra argument');
    }
  }
  if (result.selfTest && (result.worktreeArtifact || result.worktreeWrapper)) throw new CannotEvaluate('--self-test cannot be combined with worktree overrides');
  if (!result.selfTest && result.revision === null) throw new CannotEvaluate('usage: measure-c2.mjs REV [--self-test] [--worktree-artifact PATH] [--worktree-wrapper PATH]');
  return result;
}

async function mainRevision(args) {
  let lane = null;
  let homeRoot = null;
  let sandbox = null;
  let revision = null;
  let artifactPath = null;
  let artifactDigest = null;
  const probeTempDirs = [];
  const mode = args.worktreeArtifact || args.worktreeWrapper ? 'worktree' : 'revision';
  try {
    lane = resolveLaneRoot();
    homeRoot = mkdtempSync(join(tmpdir(), 'tabi-r18-mc2-home-'));
    revision = resolveRevision(lane, args.revision, homeRoot);
    const sourceArtifact = artifactAtRevision(lane, revision, homeRoot);
    artifactDigest = args.worktreeArtifact ? sha256(readFileSync(resolve(args.worktreeArtifact))) : sha256(sourceArtifact.bytes);
    sandbox = makeSandbox(lane, revision, homeRoot);
    const overrides = wrapperAndArtifactOverrides(sandbox, sourceArtifact, args);
    artifactPath = overrides.selectedArtifactPath;
    const h1 = await runEarlyArtifact(sandbox, artifactPath);
    probeTempDirs.push(h1.run.tempPath);
    await terminateMarkerProcesses([h1.run.tempPath]);
    const sigint = await runEarlyArtifact(sandbox, artifactPath, { signal: 'SIGINT', label: 'sigint' });
    probeTempDirs.push(sigint.run.tempPath);
    await terminateMarkerProcesses([sigint.run.tempPath]);
    const normal = await runNormalArtifact(sandbox, artifactPath);
    probeTempDirs.push(normal.run.tempPath);
    const watchdogProbeArtifact = makeWatchdogProbeArtifact(sandbox, artifactPath);
    const watchdog = await runNormalArtifact(sandbox, watchdogProbeArtifact.artifactPath, {
      timeoutMs: WATCHDOG_TIMEOUT_MS + 20000,
      label: 'watchdog',
    });
    probeTempDirs.push(watchdog.run.tempPath);
    const expectedProducer = {
      path: artifactPath.slice(sandbox.length + 1).replaceAll('\\', '/'),
      sha256: artifactDigest,
    };
    const coverage = retainedCoverage(normal.receipt, expectedProducer);
    const hazards = evaluateHazards({
      sandbox,
      revision,
      wrapperPath: overrides.wrapperPath,
      h1,
      sigint,
      normal,
      watchdog,
      coverage,
      home: homeRoot,
    });
    const counterDigest = sha256(readFileSync(SCRIPT));
    return {
      record: outputRecord({
        rev: mode === 'worktree' ? `worktree:${revision}` : revision,
        hazards,
        artifact: sourceArtifact.path,
        artifactSha256: artifactDigest,
        counterSha256: counterDigest,
        h1,
        normal,
        sigint,
        watchdog,
        watchdogPatch: watchdogProbeArtifact.patch,
        coverage,
        mode,
      }),
      exitCode: EXIT.evaluated,
    };
  } catch (error) {
    const counterDigest = sha256(readFileSync(SCRIPT));
    return {
      record: errorRecord(error, {
        revision,
        artifact: artifactPath ? artifactPath.slice(sandbox?.length ?? 0).replace(/^\//, '') : null,
        artifactSha256: artifactDigest,
        counterSha256: counterDigest,
        mode,
      }),
      exitCode: EXIT.couldNotEvaluate,
    };
  } finally {
    if (sandbox) {
      await terminateMarkerProcesses(probeTempDirs);
      for (const path of probeTempDirs) rmSync(path, { recursive: true, force: true });
      rmSync(sandbox, { recursive: true, force: true });
    }
    if (homeRoot) rmSync(homeRoot, { recursive: true, force: true });
  }
}

function stubHarnessSource(mode) {
  return `#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
const mode = ${JSON.stringify(mode)};
const tmp = process.env.TMPDIR;
if (mode === 'startup-exit2') {
  process.exit(2);
}
if (['h1-good', 'h1-bad', 'sigint-good', 'sigint-leak'].includes(mode)) {
  process.on('SIGTERM', () => {
    if (mode === 'h1-good') process.stderr.write('WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM\\n');
    process.exit(mode === 'h1-good' ? 2 : 1);
  });
  process.on('SIGINT', () => {
    if (mode === 'sigint-good') process.stderr.write('WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGINT\\n');
    if (mode === 'sigint-leak') writeFileSync(join(tmp, 'sigint-leftover.tmp'), 'x');
    process.exit(mode === 'sigint-good' ? 2 : 130);
  });
  process.stdout.write('WEBMCP_INVOKE_CASE id=stub\\n');
  setInterval(() => {}, 1000);
} else {
  const out = process.argv[process.argv.indexOf('--out') + 1];
  mkdirSync(dirname(out), { recursive: true });
  if (mode === 'tmp-bad') writeFileSync(join(tmp, 'leftover.tmp'), 'x');
  const defaultsEnable = ${JSON.stringify(DEFAULT_ENABLE_FEATURES)};
  const defaultsDisable = ${JSON.stringify(DEFAULT_DISABLE_FEATURES)};
  const webmcp = ${JSON.stringify(WEBMCP_ENABLE_FEATURES)};
  const roles = ['flagged', 'flag-off', 'domain-disabled'];
  const children = roles.map(role => {
    let enable = [...defaultsEnable, ...(role === 'flagged' ? webmcp : [])];
    let disable = [...defaultsDisable, ...(role === 'domain-disabled' ? ['DevToolsWebMCPSupport'] : [])];
    const blink = role === 'flagged' ? ['WebMCP', 'WebMCPTesting'] : role === 'domain-disabled' ? ['WebMCP'] : [];
    if (mode === 'features-missing' && role === 'flagged') enable = [...defaultsEnable];
    const argv = ['--enable-features=' + enable.join(','), '--disable-features=' + disable.join(',')];
    if (blink.length) argv.push('--enable-blink-features=' + blink.join(','));
    if (mode === 'features-bad' && role === 'flagged') argv.push('--enable-features=Other', '--disable-features=Extra');
    if (mode === 'port-bad' && role === 'flagged') argv.push('--remote-debugging-port=9223');
    argv.push('--user-data-dir=' + join(tmp, role + '-profile'));
    argv.push(tmp);
    const code = mode === 'listener-bad' && role === 'flagged'
      ? "const net=require('node:net'); const server=net.createServer(); server.listen(0,'127.0.0.1'); setInterval(()=>{},1000);"
      : 'setInterval(()=>{},1000);';
    const child = spawn(process.execPath, ['-e', code, '--', ...argv], { stdio: 'ignore' });
    const closed = new Promise(resolvePromise => child.once('close', resolvePromise));
    return { child, closed };
  });
  const renderer = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000);', '--', '--type=renderer', '--enable-features=WebMCP', tmp], { stdio: 'ignore' });
  children.push({ child: renderer, closed: new Promise(resolvePromise => renderer.once('close', resolvePromise)) });
  if (mode === 'port-bad') writeFileSync(join(tmp, 'DevToolsActivePort'), '9223\\n');
  const stopBrowsers = async () => {
    for (const browser of children) browser.child.kill('SIGTERM');
    await Promise.all(children.map(browser => browser.closed));
  };
  if (mode === 'watchdog-good' || mode === 'watchdog-bad') {
    await new Promise(resolvePromise => setTimeout(resolvePromise, 500));
    if (mode === 'watchdog-bad') writeFileSync(join(tmp, 'watchdog-leftover.tmp'), 'x');
    process.stderr.write('WEBMCP_INVOKE_ERROR {"code":"run_timeout","message":"hard run timeout"}\\n');
    await stopBrowsers();
    process.exit(2);
  }
  await new Promise(resolvePromise => setTimeout(resolvePromise, 500));
  await stopBrowsers();
  const cases = ${JSON.stringify(CASE_IDS)}.map(id => ({ id, pass: true, status: 'pass' }));
  const failure = mode === 'download-bad' ? null
    : mode === 'download-success-indicator' ? 'Pass { acceptDownloads: true } when you are creating your browser context.'
      : mode === 'download-accepted' ? 'Download completed'
        : 'Download is canceled';
  const event = {
    suggestedFilename: ${JSON.stringify(DOWNLOAD_SUGGESTED_FILENAME)},
    failure,
    failureSettled: true,
    failureError: null,
  };
  const downloadMarkerPrefix = ${JSON.stringify(DOWNLOAD_MARKER_PREFIX)};
  const downloadMarker = downloadMarkerPrefix + 'selftest-blob';
  const downloadMarkerSha256 = 'b'.repeat(64);
  const scans = {
    runTempDir: { complete: true, matches: [] },
    processTmpdir: { complete: true, matches: [] },
  };
  const download = {
    id: ${JSON.stringify(DOWNLOAD_CASE_ID)},
    pass: mode !== 'download-bad',
    status: mode === 'download-bad' ? 'fail' : 'pass',
    observations: {
      downloadMarkerPrefix,
      downloadMarkerSha256,
      invoke: {
        request: { method: 'WebMCP.invokeTool', params: { toolName: 'download-blob' } },
        invocationId: 'selftest-invocation',
        error: null,
      },
      responded: { status: 'Completed', output: 'download-triggered' },
      downloadEvents: [event],
      beforeContextClose: scans,
      afterContextClose: { ...scans, browserGone: true },
    },
    downloadEvents: [event],
  };
  if (mode === 'download-bad' || mode === 'download-accepted') writeFileSync(join(tmp, ${JSON.stringify(DOWNLOAD_SUGGESTED_FILENAME)}), downloadMarker);
  cases.push(download);
  const controls = ${JSON.stringify(CONTROL_IDS)}.map(id => ({ id, pass: true, status: 'pass' }));
  if (mode === 'coverage-bad') controls.pop();
  if (mode === 'coverage-bad') cases.push({ ...cases[0] });
  process.stdout.write('WEBMCP_INVOKE_CASE id=invoke-download-refused status=pass\\n');
  await new Promise(resolvePromise => setTimeout(resolvePromise, 100));
  writeFileSync(out, JSON.stringify({ verdict: 'pass', cases, controls, producer: { path: ${JSON.stringify(SELF_TEST_PRODUCER_PATH)}, sha256: ${JSON.stringify(SELF_TEST_PRODUCER_SHA256)} }, producerSha256: ${JSON.stringify(SELF_TEST_PRODUCER_SHA256)} }));
  process.exit(0);
}
`;
}

function createStubRun(sandbox, mode) {
  const root = mkdtempSync(join(sandbox, '.stub-'));
  const artifactPath = join(root, 'stub.mjs');
  writeFileSync(artifactPath, stubHarnessSource(mode));
  return { root, artifactPath };
}

async function selfTestEarly(sandbox, mode, options = {}) {
  const stub = createStubRun(sandbox, mode);
  return runEarlyArtifact(sandbox, stub.artifactPath, { waitMs: CASE_WAIT_MS, postSignalMs: 25, ...options });
}

async function selfTestNormal(sandbox, mode) {
  const stub = createStubRun(sandbox, mode);
  const normal = await runNormalArtifact(sandbox, stub.artifactPath, { timeoutMs: 5000, pollMs: 20, label: `self-normal-${mode}` });
  if (!normal.receipt) return normal;
  const identity = {
    path: '/usr/lib/chromium/chromium',
    device: 'self-test-device',
    inode: 'self-test-inode',
    sha256: 'a'.repeat(64),
  };
  normal.launchArgv = normal.launchArgv.map((entry) => ({
    ...entry,
    argv: [identity.path, ...entry.argv.slice(1)],
    executableIdentity: identity,
  }));
  normal.receipt.runs = normal.launchArgv.map((entry) => {
    const userData = entry.argv.find((arg) => arg.startsWith('--user-data-dir=')) ?? '';
    const label = ['flagged', 'flag-off', 'domain-disabled'].find((candidate) => userData.includes(`${candidate}-profile`)) ?? 'unknown';
    return {
      label,
      pid: entry.pid,
      realExecutable: identity.path,
      realExecutableSha256: identity.sha256,
      effectiveArgv: entry.argv,
    };
  });
  normal.receipt.runtime = {
    observed: {
      chromium: {
        launchPath: EXPECTED_CHROMIUM_LAUNCH_PATH,
        realExecutable: identity.path,
        realExecutableSha256: identity.sha256,
      },
    },
  };
  normal.browserEvidence = browserRunEvidence(normal);
  return normal;
}

function selfTestCoverage(receipt) {
  return retainedCoverage(receipt, {
    path: SELF_TEST_PRODUCER_PATH,
    sha256: SELF_TEST_PRODUCER_SHA256,
  });
}
function createTinyGitRepo(repo, home) {
  mkdirSync(repo, { recursive: true });
  const init = commandSync('git', ['init', '-q', '--initial-branch=master', repo], { cwd: dirname(repo), env: gitEnv(home) });
  if (init.status !== 0) throw new CannotEvaluate(`self-test git init failed: ${String(init.stderr).trim()}`);
  const emptyTree = String(git(repo, ['hash-object', '-w', '-t', 'tree', '--stdin'], { home })).trim();
  const rev = String(git(repo, ['-c', 'user.name=Counter Self-Test', '-c', 'user.email=counter-self-test@example.invalid', 'commit-tree', emptyTree, '-m', 'self-test base'], { home })).trim();
  git(repo, ['update-ref', 'refs/heads/master', rev], { home });
  git(repo, ['checkout', '-q', '--detach', rev], { home });
  return rev;
}

function selfTestReplacementRef(root, home) {
  const repo = join(root, 'replace-ref');
  mkdirSync(join(repo, 'corpus'), { recursive: true });
  const init = commandSync('git', ['init', '-q', '--initial-branch=master', repo], { cwd: root, env: gitEnv(home) });
  if (init.status !== 0) throw new CannotEvaluate(`replacement-ref self-test init failed: ${String(init.stderr).trim()}`);
  const file = join(repo, 'corpus', 'probe.txt');
  writeFileSync(file, 'original object');
  git(repo, ['add', '--', 'corpus/probe.txt'], { home });
  git(repo, ['commit', '-m', 'original object'], { home });
  const original = String(git(repo, ['rev-parse', '--verify', 'HEAD'], { home })).trim();
  writeFileSync(file, 'replacement object');
  git(repo, ['add', '--', 'corpus/probe.txt'], { home });
  git(repo, ['commit', '-m', 'replacement object'], { home });
  const replacement = String(git(repo, ['rev-parse', '--verify', 'HEAD'], { home })).trim();
  git(repo, ['replace', original, replacement], { home });
  const protectedRead = String(git(repo, ['show', `${original}:corpus/probe.txt`], { home })).trim();
  const unprotectedEnv = gitEnv(home);
  delete unprotectedEnv.GIT_NO_REPLACE_OBJECTS;
  const unprotected = commandSync('git', ['-c', 'core.hooksPath=/dev/null', 'show', `${original}:corpus/probe.txt`], {
    cwd: repo,
    env: unprotectedEnv,
  });
  const replacedRead = String(unprotected.stdout).trim();
  const pass = protectedRead === 'original object' && unprotected.status === 0 && replacedRead === 'replacement object';
  return {
    pass,
    why: `GIT_NO_REPLACE_OBJECTS read=${protectedRead}, replacement-enabled control=${replacedRead}, control exit=${unprotected.status}`,
  };
}

function wrapperStubSource(good) {
  if (!good) return `#!/usr/bin/env node\nif (process.argv.includes('--dry-run')) console.log('wrong-tip'); process.exit(0);\n`;
  return `#!/usr/bin/env node\nimport { spawnSync } from 'node:child_process';\nconst bad = process.argv.indexOf('--rev');\nif (bad >= 0 && process.argv[bad + 1] === 'HEAD') process.exit(2);\nif (process.argv.includes('--dry-run')) { const r = spawnSync('git', ['rev-parse', 'refs/heads/master'], { encoding: 'utf8' }); process.stdout.write(r.stdout); process.exit(r.status === 0 ? 0 : 2); }\nprocess.exit(2);\n`;
}

function selfTestF6(root, good, home) {
  const repo = join(root, good ? 'f6-good' : 'f6-bad');
  const revision = createTinyGitRepo(repo, home);
  const wrapperPath = join(repo, 'scripts', 'freshness-witness.mjs');
  mkdirSync(dirname(wrapperPath), { recursive: true });
  writeFileSync(wrapperPath, wrapperStubSource(good));
  const coverage = { pass: true, why: 'synthetic full retained coverage' };
  return f6Hazard(repo, revision, wrapperPath, coverage, home);
}

async function runSelfTests() {
  const home = mkdtempSync(join(tmpdir(), 'tabi-r18-mc2-self-home-'));
  const root = mkdtempSync(join(tmpdir(), 'tabi-r18-mc2-self-'));
  const tests = [];
  const tempDirs = [];
  const track = (result) => {
    tempDirs.push(result.run.tempPath);
    return result;
  };
  const coverage = { pass: true, why: 'synthetic full retained coverage' };
  const check = (name, actual, expected) => {
    const pass = actual.pass === expected;
    tests.push({ name, pass, expected, actual: actual.pass, why: actual.why });
  };
  const syntheticBrowserNormal = { browserEvidence: { pass: true, why: 'synthetic receipt PID and executable identity matched observed launch processes' } };
  try {
    const h1Good = track(await selfTestEarly(root, 'h1-good'));
    check('h1_live_case_sigterm_aborted', h1Hazard(h1Good, coverage, syntheticBrowserNormal), true);
    const h1Bad = track(await selfTestEarly(root, 'h1-bad'));
    check('h1_signal_without_abort_record', h1Hazard(h1Bad, coverage, syntheticBrowserNormal), false);
    const startupExit = track(await selfTestEarly(root, 'startup-exit2'));
    check('h1_startup_exit2_is_not_signal_success', h1Hazard(startupExit, coverage, syntheticBrowserNormal), false);

    const good = track(await selfTestNormal(root, 'good'));
    const goodCoverage = selfTestCoverage(good.receipt);
    const badProducerDigest = {
      ...good.receipt,
      producerSha256: '0'.repeat(64),
      producer: { ...good.receipt.producer, sha256: '0'.repeat(64) },
    };
    check('producer_digest_mismatch_rejected', selfTestCoverage(badProducerDigest), false);
    const badProducerPath = {
      ...good.receipt,
      producer: { ...good.receipt.producer, path: 'scripts/webmcp-invoke-round17.mjs' },
    };
    check('producer_path_mismatch_rejected', selfTestCoverage(badProducerPath), false);
    const forgedNoBrowser = { ...good, browserSamples: 0, browserArgv: [], launchArgv: [] };
    forgedNoBrowser.browserEvidence = browserRunEvidence(forgedNoBrowser);
    check('h4_forged_passing_receipt_without_observed_browser_is_rejected', h4Hazard(forgedNoBrowser, goodCoverage), false);
    const browserCreditDenied = [
      h1Hazard(h1Good, goodCoverage, forgedNoBrowser),
      h2Hazard({ h1: h1Good, sigint: { trigger: 'case', caseLine: 'case', childAliveAtSignal: true, killSent: true, exitCode: 2, tmpEmpty: true }, normal: forgedNoBrowser, watchdog: { completed: true, exitCode: 2, browserSamples: 1, stdout: 'run_timeout', stderr: '', tmpEmpty: true } }, goodCoverage),
      h3Hazard(forgedNoBrowser, goodCoverage),
      s1Hazard(forgedNoBrowser, goodCoverage),
    ].every((hazard) => hazard.pass === false);
    check('browser_dependent_shared_credit_requires_observed_run_pids', { pass: browserCreditDenied, why: 'H1/H2/H3/S1 withheld credit without observed Chromium PID and executable identity matches' }, true);
    const sigintGood = track(await selfTestEarly(root, 'sigint-good', { signal: 'SIGINT', label: 'self-sigint-good' }));
    const watchdogGood = track(await selfTestNormal(root, 'watchdog-good'));
    check('h2_all_exit_paths_clean', h2Hazard({ h1: h1Good, sigint: sigintGood, normal: good, watchdog: watchdogGood }, goodCoverage), true);
    check('h3_pipe_no_port_or_listener', h3Hazard(good, goodCoverage), true);
    check('h4_live_refusal_record_and_scans', h4Hazard(good, goodCoverage), true);
    check('s1_feature_union_and_switch_counts', s1Hazard(good, goodCoverage), true);
    check('s1_checks_launch_argv_not_renderer_children', { pass: good.launchArgv.length === 3 && good.browserArgv.length > good.launchArgv.length, why: `launch argv=${good.launchArgv.length}, all process argv=${good.browserArgv.length}` }, true);

    const tmpBad = track(await selfTestNormal(root, 'tmp-bad'));
    check('h2_normal_exit_leftover', h2Hazard({ h1: h1Good, sigint: sigintGood, normal: tmpBad, watchdog: watchdogGood }, selfTestCoverage(tmpBad.receipt)), false);
    const sigintBad = track(await selfTestEarly(root, 'sigint-leak', { signal: 'SIGINT', label: 'self-sigint-bad' }));
    check('h2_sigint_leftover', h2Hazard({ h1: h1Good, sigint: sigintBad, normal: good, watchdog: watchdogGood }, goodCoverage), false);
    const watchdogBad = track(await selfTestNormal(root, 'watchdog-bad'));
    check('h2_watchdog_leftover', h2Hazard({ h1: h1Good, sigint: sigintGood, normal: good, watchdog: watchdogBad }, goodCoverage), false);

    const portBad = track(await selfTestNormal(root, 'port-bad'));
    check('h3_remote_port_present', h3Hazard(portBad, selfTestCoverage(portBad.receipt)), false);
    const listenerBad = track(await selfTestNormal(root, 'listener-bad'));
    check('h3_browser_owned_listener', h3Hazard(listenerBad, selfTestCoverage(listenerBad.receipt)), false);

    const downloadBad = track(await selfTestNormal(root, 'download-bad'));
    check('h4_download_not_refused', h4Hazard(downloadBad, selfTestCoverage(downloadBad.receipt)), false);
    const playwrightDenial = track(await selfTestNormal(root, 'download-success-indicator'));
    check('h4_playwright_deny_diagnostic_is_refusal', h4Hazard(playwrightDenial, selfTestCoverage(playwrightDenial.receipt)), true);
    const acceptedDownload = track(await selfTestNormal(root, 'download-accepted'));
    check('h4_downloaded_file_is_not_refusal', h4Hazard(acceptedDownload, selfTestCoverage(acceptedDownload.receipt)), false);

    const featuresBad = track(await selfTestNormal(root, 'features-bad'));
    check('s1_duplicate_feature_switches', s1Hazard(featuresBad, selfTestCoverage(featuresBad.receipt)), false);
    const featuresMissing = track(await selfTestNormal(root, 'features-missing'));
    check('s1_missing_playwright_or_harness_feature', s1Hazard(featuresMissing, selfTestCoverage(featuresMissing.receipt)), false);

    const coverageBad = track(await selfTestNormal(root, 'coverage-bad'));
    check('retained_coverage_gate', h3Hazard(good, selfTestCoverage(coverageBad.receipt)), false);

    check('f6_wrapper_master_anchor', selfTestF6(root, true, home), true);
    check('f6_wrapper_rejects_head', selfTestF6(root, false, home), false);
    check('git_replace_ref_disabled', selfTestReplacementRef(root, home), true);
  } finally {
    await terminateMarkerProcesses(tempDirs);
    for (const path of tempDirs) rmSync(path, { recursive: true, force: true });
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
  const failed = tests.filter((test) => !test.pass);
  return {
    schema: 'tabi-round18-c2-selftest-v1',
    verdict: failed.length === 0 && tests.length >= 8 ? 'pass' : 'fail',
    cases: tests.length,
    tests,
  };
}
async function entry() {
  let args;
  try {
    args = parseArguments(process.argv.slice(2));
    if (args.selfTest) {
      const result = await runSelfTests();
      emit(result);
      return result.verdict === 'pass' ? EXIT.evaluated : EXIT.couldNotEvaluate;
    }
    const result = await mainRevision(args);
    emit(result.record);
    return result.exitCode;
  } catch (error) {
    const record = errorRecord(error, { counterSha256: sha256(readFileSync(SCRIPT)) });
    emit(record);
    return EXIT.couldNotEvaluate;
  }
}

process.exitCode = await entry();
