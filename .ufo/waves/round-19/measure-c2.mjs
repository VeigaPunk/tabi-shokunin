#!/usr/bin/env node
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const BASELINE = '66251bfc1aef393e4aec599e950a8deb867736bb';
const ROUND18_COUNTER = '.ufo/waves/round-18/measure-c2.mjs';
const OUTER_TIMEOUT_MS = 8 * 60 * 1000;
const EARLY_CASE_TIMEOUT_MS = 90 * 1000;
const EARLY_EXIT_TIMEOUT_MS = 30 * 1000;
const PID_CLEANUP_TIMEOUT_MS = 12 * 1000;
const MAX_BUFFER = 64 * 1024 * 1024;
const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
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
  'invoke-download-refused',
]);
const CONTROL_IDS = Object.freeze([
  'invoke-before-enable',
  'invoke-cancel',
  'invoke-declarative-navigation-result',
  'invoke-domain-disabled',
]);
const DOWNLOAD_CASE_ID = 'invoke-download-refused';

class CannotEvaluate extends Error {}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function gitEnv(home) {
  return {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: home,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_NAME: 'Tabi round-19 C2 measurement',
    GIT_AUTHOR_EMAIL: 'c2-measurement@shokunin.invalid',
    GIT_COMMITTER_NAME: 'Tabi round-19 C2 measurement',
    GIT_COMMITTER_EMAIL: 'c2-measurement@shokunin.invalid',
    LANG: 'C.UTF-8',
    TZ: 'UTC',
  };
}

function commandSync(command, args, { cwd, env, timeout = 30000, encoding = 'utf8', maxBuffer = MAX_BUFFER } = {}) {
  const result = spawnSync(command, args, { cwd, env, encoding, timeout, maxBuffer, windowsHide: true });
  if (result.error) {
    return {
      status: null,
      signal: result.signal ?? null,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      error: result.error,
    };
  }
  return { status: result.status, signal: result.signal, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: null };
}

function git(cwd, args, { home = tmpdir(), timeout = 30000 } = {}) {
  const result = commandSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    env: gitEnv(home),
    timeout,
  });
  if (result.status !== 0 || result.error) {
    const detail = result.error?.message ?? String(result.stderr).trim() ?? `status=${result.status}`;
    throw new CannotEvaluate(`git ${args[0]} failed: ${detail}`);
  }
  return result.stdout;
}

function resolveLaneRoot() {
  return String(git(dirname(SCRIPT), ['rev-parse', '--show-toplevel'])).trim();
}

function resolveRevision(repo, value, home) {
  if (!value || value.startsWith('-')) throw new CannotEvaluate('missing or invalid revision argument');
  const revision = String(git(repo, ['rev-parse', '--verify', '--end-of-options', `${value}^{commit}`], { home })).trim();
  if (!HEX40.test(revision)) throw new CannotEvaluate(`revision did not resolve to a full commit id: ${value}`);
  return revision;
}

function makeSandbox(repo, revision, home, label) {
  const sandbox = mkdtempSync(join(tmpdir(), `tabi-r19-c2-${label}-`));
  try {
    const clone = commandSync('git', ['-c', 'core.hooksPath=/dev/null', 'clone', '--no-hardlinks', '--quiet', repo, sandbox], {
      cwd: repo,
      env: gitEnv(home),
      timeout: 120000,
    });
    if (clone.status !== 0 || clone.error) {
      throw new CannotEvaluate(`git clone --no-hardlinks failed: ${clone.error?.message ?? String(clone.stderr).trim()}`);
    }
    git(sandbox, ['checkout', '--quiet', '--detach', revision], { home });
    git(sandbox, ['update-ref', 'refs/heads/master', revision], { home });
    return sandbox;
  } catch (error) {
    rmSync(sandbox, { recursive: true, force: true });
    throw error;
  }
}

function artifactAtRevision(repo, revision, home) {
  const paths = String(git(repo, ['ls-tree', '-r', '--name-only', revision, '--', 'scripts'], { home }))
    .split('\n')
    .filter((path) => /^scripts\/webmcp-invoke-round\d+\.mjs$/.test(path));
  const artifacts = paths.map((path) => ({ path, round: Number(/round(\d+)\.mjs$/.exec(path)[1]) }));
  artifacts.sort((a, b) => b.round - a.round || a.path.localeCompare(b.path));
  const selected = artifacts[0];
  if (!selected) throw new CannotEvaluate(`no scripts/webmcp-invoke-round*.mjs artifact at ${revision}`);
  const path = join(repo, selected.path);
  const bytes = readFileSync(path);
  return { ...selected, pathOnDisk: path, bytes, sha256: sha256(bytes) };
}

function witnessAtRevision(repo, revision, home) {
  const paths = String(git(repo, ['ls-tree', '-r', '--name-only', revision, '--', 'scripts'], { home })).split('\n').filter(Boolean);
  const successors = paths
    .filter((path) => /^scripts\/freshness-witness-round\d+\.mjs$/.test(path))
    .map((path) => ({ path, round: Number(/round(\d+)\.mjs$/.exec(path)[1]) }))
    .sort((a, b) => b.round - a.round || a.path.localeCompare(b.path));
  const selected = successors[0] ?? (paths.includes('scripts/freshness-witness.mjs') ? { path: 'scripts/freshness-witness.mjs', round: null } : null);
  if (!selected) throw new CannotEvaluate(`no freshness witness at ${revision}`);
  const pathOnDisk = join(repo, selected.path);
  const bytes = readFileSync(pathOnDisk);
  return { ...selected, pathOnDisk, source: bytes.toString('utf8'), sha256: sha256(bytes) };
}

function childEnv(runRoot, tempPath, extra = {}) {
  const home = join(runRoot, 'HOME');
  mkdirSync(home, { recursive: true });
  mkdirSync(tempPath, { recursive: true });
  return {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: home,
    XDG_CONFIG_HOME: join(home, '.config'),
    TMPDIR: tempPath,
    TMP: tempPath,
    TEMP: tempPath,
    TZ: 'UTC',
    LANG: 'C.UTF-8',
    ...extra,
  };
}

function makeRunDirs(sandbox, label, extraEnv = {}) {
  const root = mkdtempSync(join(sandbox, `.c2-${label}-`));
  const tempPath = mkdtempSync(join(tmpdir(), `tabi-r19-c2-tmp-${label}-`));
  return {
    root,
    tempPath,
    outPath: join(root, 'receipt.json'),
    env: childEnv(root, tempPath, extraEnv),
  };
}

function makeH4UuidMutant(artifact) {
  const source = artifact.bytes.toString('utf8');
  const anchor = artifact.round >= 19
    ? 'const downloadScanBefore = snapshotDownloadFiles();'
    : 'const downloadMarker = await page.evaluate(() => globalThis.__downloadMarker);';
  const occurrences = source.split(anchor).length - 1;
  if (occurrences !== 1) {
    throw new CannotEvaluate(`H4 UUID mutant expected one download-scan anchor, found ${occurrences}`);
  }
  const directory = `playwright-artifacts-${randomUUID()}`;
  const filename = randomUUID();
  const content = `tabi-c2-random-uuid-mutant-${randomUUID()}`;
  const injection = [
    '',
    `        const c2PlantedArtifactRoot = join(processTmpDir, ${JSON.stringify(directory)});`,
    '        mkdirSync(c2PlantedArtifactRoot, { recursive: true });',
    `        writeFileSync(join(c2PlantedArtifactRoot, ${JSON.stringify(filename)}), ${JSON.stringify(content)}, { flag: 'wx' });`,
  ].join('\n');
  const bytes = Buffer.from(source.replace(anchor, `${anchor}${injection}`));
  return {
    artifact: { ...artifact, bytes, sha256: sha256(bytes) },
    originalBytes: artifact.bytes,
    plant: { directory, filename, contentSha256: sha256(Buffer.from(content)) },
  };
}

async function runH4UuidMutant(sandbox, artifact, { nonce, label } = {}) {
  const mutant = makeH4UuidMutant(artifact);
  writeFileSync(artifact.pathOnDisk, mutant.artifact.bytes);
  try {
    const run = await runNormalArtifact(sandbox, mutant.artifact, { nonce, label });
    return { run, plant: mutant.plant, artifact: mutant.artifact };
  } finally {
    writeFileSync(artifact.pathOnDisk, mutant.originalBytes);
  }
}

function spawnCaptured(command, args, options, onStdoutChunk = null) {
  const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
    onStdoutChunk?.(chunk);
  });
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

function procArgv(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

function procInfo(pid) {
  const argv = procArgv(pid);
  if (!argv) return null;
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const fields = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/);
    return {
      pid: Number(pid),
      argv,
      ppid: Number(fields[1]),
      starttime: fields[19] ?? null,
      exe: readlinkSync(`/proc/${pid}/exe`),
    };
  } catch {
    return null;
  }
}

function isChromiumArgv(argv) {
  const name = basename(argv[0] ?? '').toLowerCase();
  return /^(?:chrome|chromium|chromium-browser)(?:\.exe)?$/.test(name)
    && !/(?:crashpad|sandbox)/.test(name);
}

function processesUsing(markers, browserOnly = false) {
  let names;
  try {
    names = readdirSync('/proc');
  } catch {
    return [];
  }
  const matches = [];
  for (const name of names) {
    if (!/^\d+$/.test(name)) continue;
    const info = procInfo(name);
    if (!info || !info.argv.some((arg) => markers.some((marker) => arg.includes(marker)))) continue;
    if (browserOnly && !isChromiumArgv(info.argv)) continue;
    matches.push(info);
  }
  return matches;
}

function processTreeChromium(rootPid) {
  if (!Number.isInteger(rootPid)) return [];
  let names;
  try {
    names = readdirSync('/proc');
  } catch {
    return [];
  }
  const processes = new Map();
  for (const name of names) {
    if (!/^\d+$/.test(name)) continue;
    const info = procInfo(name);
    if (info) processes.set(info.pid, info);
  }
  const owned = new Set([rootPid]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [pid, info] of processes) {
      if (!owned.has(pid) && owned.has(info.ppid)) {
        owned.add(pid);
        changed = true;
      }
    }
  }
  return [...owned]
    .map((pid) => processes.get(pid))
    .filter((info) => info && isChromiumArgv(info.argv));
}

function runOwnedChromium(run, rootPid = null) {
  const identities = new Map();
  const candidates = [
    ...processesUsing([run.tempPath], true),
    ...processTreeChromium(rootPid),
  ];
  for (const info of candidates) {
    const key = `${info.pid}:${info.starttime}:${info.exe}`;
    identities.set(key, { pid: info.pid, starttime: info.starttime, exe: info.exe });
  }
  return [...identities.values()].sort((a, b) => a.pid - b.pid);
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

function receiptPaths(sandbox) {
  const evidence = join(sandbox, 'corpus', 'evidence');
  return allFiles(evidence).filter((path) => extname(path).toLowerCase() === '.json');
}

function fileStamp(path) {
  try {
    const value = statSync(path, { bigint: true });
    return `${value.dev}:${value.ino}:${value.size}:${value.mtimeNs}`;
  } catch {
    return null;
  }
}

function snapshotReceipts(sandbox) {
  return new Map(receiptPaths(sandbox).map((path) => [path, fileStamp(path)]));
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function receiptVerdict(path) {
  const value = readJson(path);
  return typeof value?.verdict === 'string' ? value.verdict.toLowerCase() : null;
}

function passFailReceipts(run, sandbox, previous) {
  const candidates = new Set([run.outPath, ...allFiles(run.root).filter((path) => extname(path).toLowerCase() === '.json')]);
  for (const path of receiptPaths(sandbox)) {
    if (fileStamp(path) !== previous.get(path)) candidates.add(path);
  }
  for (const path of candidates) {
    const verdict = receiptVerdict(path);
    if (verdict === 'pass' || verdict === 'fail') return { path, verdict };
  }
  return null;
}


async function waitForOwnedChromium(run, rootPid, timeoutMs) {
  const started = Date.now();
  let identities = runOwnedChromium(run, rootPid);
  while (identities.length === 0 && Date.now() - started < timeoutMs) {
    await sleep(50);
    identities = runOwnedChromium(run, rootPid);
  }
  return identities;
}

async function waitForNoOwnedChromium(run, rootPid, timeoutMs) {
  const started = Date.now();
  let identities = runOwnedChromium(run, rootPid);
  while (identities.length > 0 && Date.now() - started < timeoutMs) {
    await sleep(100);
    identities = runOwnedChromium(run, rootPid);
  }
  return identities;
}

async function terminateRunBrowsers(run, rootPid = null) {
  const signal = (name) => {
    const pids = new Set(runOwnedChromium(run, rootPid).map((identity) => identity.pid));
    for (const pid of pids) {
      try { process.kill(pid, name); } catch {}
    }
  };
  signal('SIGTERM');
  await sleep(150);
  signal('SIGKILL');
}

function findCase(receipt, id) {
  const cases = Array.isArray(receipt?.cases) ? receipt.cases : [];
  const matches = cases.filter((entry) => entry?.id === id || entry?.caseId === id);
  return matches.length === 1 ? matches[0] : null;
}

function casePassed(entry) {
  return entry?.status === 'pass' || entry?.pass === true;
}

function downloadEvents(entry) {
  if (!entry) return [];
  const arrays = [
    entry.downloadEvents,
    entry.actual?.downloadEvents,
    entry.actual?.observations?.downloadEvents,
    entry.observed?.downloadEvents,
    entry.observations?.downloadEvents,
  ].filter(Array.isArray);
  for (const events of arrays) {
    if (events.length) return events;
  }
  return arrays[0] ?? [];
}

// Receipt-local corroboration only: all observations and frames remain producer-authored, not tamper-proof evidence.
function h4RawInvocationShape(entry) {
  const actual = entry?.actual ?? entry?.observations ?? {};
  const frames = Array.isArray(entry?.cdp?.frames) ? entry.cdp.frames : [];
  const invokes = frames.filter((item) =>
    item?.dir === 'out' && item.frame?.method === 'WebMCP.invokeTool');
  const request = invokes.length === 1 ? invokes[0] : null;
  const requestParams = request?.frame?.params ?? null;
  const requestId = request?.frame?.id ?? null;
  const requestReplies = request
    ? frames.filter((item) =>
      item?.dir === 'in' &&
      item.frame?.id === requestId &&
      (Object.hasOwn(item.frame, 'result') || Object.hasOwn(item.frame, 'error')))
    : [];
  const requestReply = requestReplies.length === 1 ? requestReplies[0] : null;
  const invokedEvents = frames.filter((item) =>
    item?.dir === 'in' && item.frame?.method === 'WebMCP.toolInvoked');
  const respondedEvents = frames.filter((item) =>
    item?.dir === 'in' && item.frame?.method === 'WebMCP.toolResponded');
  const invoke = actual.invoke ?? null;
  const responded = actual.responded ?? null;
  const invocationId = invoke?.invocationId ?? null;
  const actualParams = invoke?.request?.params ?? null;
  const emptyInput = (value) => value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.keys(value).length === 0;
  const requestMatches = request !== null
    && Number.isInteger(requestId)
    && requestId > 0
    && requestParams?.toolName === 'download-blob'
    && typeof entry?.cdp?.mainFrameId === 'string'
    && entry.cdp.mainFrameId.length > 0
    && requestParams.frameId === entry.cdp.mainFrameId
    && emptyInput(requestParams.input)
    && invoke?.request?.method === 'WebMCP.invokeTool'
    && invoke?.error === null
    && actualParams?.toolName === requestParams.toolName
    && actualParams?.frameId === requestParams.frameId
    && emptyInput(actualParams.input);
  const replyId = requestReply?.frame?.result?.invocationId ?? null;
  const invocationReplyMatches = requestMatches
    && requestReplies.length === 1
    && !Object.hasOwn(requestReply.frame, 'error')
    && typeof replyId === 'string'
    && replyId.length > 0
    && invocationId === replyId
    && invoke?.result?.invocationId === replyId;
  const invokedParams = invokedEvents.length === 1 ? invokedEvents[0].frame.params : null;
  const invocationEventMatches = invocationReplyMatches
    && invokedEvents.length === 1
    && invokedParams?.invocationId === replyId
    && invokedParams?.toolName === 'download-blob';
  const respondedParams = respondedEvents.length === 1 ? respondedEvents[0].frame.params : null;
  const responseEventMatches = invocationReplyMatches
    && respondedEvents.length === 1
    && respondedParams?.invocationId === replyId
    && respondedParams?.status === 'Completed'
    && respondedParams?.output === 'download-triggered';
  const registeredTools = frames
    .filter((item) => item?.dir === 'in' && item.frame?.method === 'WebMCP.toolsAdded')
    .flatMap((item) => Array.isArray(item.frame.params?.tools) ? item.frame.params.tools : []);
  const fixtureEvidenceObserved = entry?.fixtureFile === 'invoke-download-refused.html'
    && entry?.fixture === 'scripts/webmcp-invoke-round19.mjs#embedded:invoke-download-refused.html'
    && HEX64.test(entry?.fixtureSha256 ?? '')
    && registeredTools.length === 1
    && registeredTools[0]?.name === 'download-blob'
    && Array.isArray(entry?.toolsAdded)
    && entry.toolsAdded.length === 1
    && entry.toolsAdded[0]?.name === 'download-blob';
  const pageRecord = actual.pageDownloadRecord ?? null;
  const pageEvidenceObserved = pageRecord?.tool === 'download-blob'
    && typeof pageRecord?.nonce === 'string'
    && pageRecord.nonce.length > 0
    && actual.downloadMarkerPrefix === 'tabi-r19-download-'
    && HEX64.test(actual.downloadMarkerSha256 ?? '');
  return {
    invocationObserved: invocationReplyMatches && invocationEventMatches,
    responseObserved: responseEventMatches
      && responded?.invocationId === replyId
      && responded?.status === 'Completed'
      && responded?.output === 'download-triggered',
    fixtureEvidenceObserved,
    pageEvidenceObserved,
    rawInvokeCount: invokes.length,
    rawToolInvokedCount: invokedEvents.length,
    rawToolRespondedCount: respondedEvents.length,
  };
}

function h4RecordShape(receipt, nonce) {
  const entry = findCase(receipt, DOWNLOAD_CASE_ID);
  const actual = entry?.actual ?? entry?.observations ?? {};
  const events = downloadEvents(entry);
  const event = events.length === 1 ? events[0] : null;
  const pageRecord = actual.pageDownloadRecord ?? null;
  const invocation = h4RawInvocationShape(entry);
  const nonceEchoed = pageRecord?.tool === 'download-blob' && pageRecord?.nonce === nonce;
  const refusalObserved = event !== null
    && typeof event.suggestedFilename === 'string'
    && event.failureSettled === true
    && event.failure !== null
    && event.failureError === null;
  return {
    pass: casePassed(entry)
      && nonceEchoed
      && invocation.invocationObserved
      && invocation.responseObserved
      && invocation.fixtureEvidenceObserved
      && invocation.pageEvidenceObserved
      && refusalObserved,
    casePresent: entry !== null,
    caseStatus: entry?.status ?? (entry?.pass === true ? 'pass' : null),
    pageDownloadRecord: pageRecord,
    nonceEchoed,
    ...invocation,
    eventCount: events.length,
    refusalObserved,
    nonce,
  };
}

function cleanDownloadScanShape(receipt) {
  const entry = findCase(receipt, DOWNLOAD_CASE_ID);
  const scan = entry?.actual?.downloadScan ?? entry?.observations?.downloadScan ?? null;
  const pass = scan?.complete === true && Array.isArray(scan.newFiles) && scan.newFiles.length === 0;
  return {
    pass,
    complete: scan?.complete === true,
    newFiles: scan?.newFiles ?? null,
    errors: scan?.errors ?? null,
  };
}

function plantedUuidScanShape(receipt, plant) {
  const entry = findCase(receipt, DOWNLOAD_CASE_ID);
  const scan = entry?.actual?.downloadScan ?? entry?.observations?.downloadScan ?? null;
  const relativePath = `${plant?.directory ?? ''}/${plant?.filename ?? ''}`;
  const plantedPath = typeof relativePath === 'string' ? relativePath.replaceAll('\\\\', '/') : '';
  const file = Array.isArray(scan?.newFiles)
    ? scan.newFiles.find((item) => typeof item?.path === 'string' && item.path.replaceAll('\\\\', '/').endsWith(`/${plantedPath}`))
    : null;
  const root = Array.isArray(scan?.roots)
    ? scan.roots.find((item) => item?.kind === 'playwrightArtifacts'
      && typeof item.path === 'string'
      && item.path.replaceAll('\\\\', '/').endsWith(`/${plant?.directory}`))
    : null;
  const scanListed = Boolean(scan?.complete === true
    && file
    && root
    && Array.isArray(file.roots)
    && file.roots.includes(root.path)
    && Array.isArray(file.stages)
    && file.stages.includes('whileBrowserAlive'));
  const caseFailed = entry?.status === 'fail' || entry?.pass === false;
  const runFailed = receipt?.verdict === 'fail';
  return {
    pass: scanListed && caseFailed && runFailed,
    scanComplete: scan?.complete === true,
    scanListed,
    newFile: file,
    artifactRoot: root,
    caseStatus: entry?.status ?? (entry?.pass === true ? 'pass' : null),
    receiptVerdict: receipt?.verdict ?? null,
    plant: plant ? { directory: plant.directory, filename: plant.filename, contentSha256: plant.contentSha256 } : null,
  };
}

function replayPriorShape(fixture, currentNonce) {
  const priorNonce = fixture?.nonce ?? null;
  const realBrowserObserved = fixture?.browserObserved === true;
  const original = fixture ? h4RecordShape(fixture.receipt, priorNonce) : { pass: false };
  const replayed = fixture ? h4RecordShape(fixture.receipt, currentNonce) : { pass: false };
  const nonceChanged = typeof priorNonce === 'string' && priorNonce !== currentNonce;
  return {
    pass: realBrowserObserved && original.pass && nonceChanged && !replayed.pass,
    priorReceiptSha256: fixture?.receiptSha256 ?? null,
    priorNonce,
    currentNonce,
    realBrowserObserved,
    originalRecordPass: original.pass,
    replayRejected: !replayed.pass,
    replayCheck: replayed,
  };
}

function scansClear(scan) {
  return scan?.complete === true && Array.isArray(scan.matches) && scan.matches.length === 0;
}

function legacyRound18H4WouldCredit(receipt, artifact, browserObserved) {
  const cases = Array.isArray(receipt?.cases) ? receipt.cases : [];
  const controls = Array.isArray(receipt?.controls) ? receipt.controls : [];
  const caseCounts = new Map();
  const controlCounts = new Map();
  for (const item of cases) if (typeof item?.id === 'string') caseCounts.set(item.id, (caseCounts.get(item.id) ?? 0) + 1);
  for (const item of controls) if (typeof item?.id === 'string') controlCounts.set(item.id, (controlCounts.get(item.id) ?? 0) + 1);
  const coverage = CASE_IDS.every((id) => caseCounts.get(id) === 1 && casePassed(findCase(receipt, id)))
    && CONTROL_IDS.every((id) => controlCounts.get(id) === 1 && casePassed(controls.find((item) => item.id === id)));
  const producerDigest = receipt?.producerSha256 ?? receipt?.producer?.sha256;
  const producerPass = receipt?.producer?.path === artifact.path
    && producerDigest === artifact.sha256
    && receipt?.producerSha256 === artifact.sha256;
  const entry = findCase(receipt, DOWNLOAD_CASE_ID);
  const observations = entry?.actual ?? entry?.observations ?? {};
  const receipts = Array.isArray(entry?.downloadEvents) ? entry.downloadEvents : [];
  const observedEvents = Array.isArray(observations.downloadEvents) ? observations.downloadEvents : [];
  const event = observedEvents.length === 1 ? observedEvents[0] : null;
  const markerValid = typeof observations.downloadMarkerPrefix === 'string'
    && HEX64.test(observations.downloadMarkerSha256 ?? '');
  const invokeValid = observations.invoke?.request?.method === 'WebMCP.invokeTool'
    && observations.invoke?.request?.params?.toolName === 'download-blob'
    && observations.invoke?.invocationId !== null
    && observations.invoke?.invocationId !== undefined
    && observations.invoke?.error === null;
  const responseValid = observations.responded?.status === 'Completed'
    && observations.responded?.output === 'download-triggered';
  const refusal = typeof event?.failure === 'string'
    && (event.failure === 'Pass { acceptDownloads: true } when you are creating your browser context.'
      || (/cancel|reject|refus/i.test(event.failure) && !/acceptDownloads\s*:\s*true/i.test(event.failure)));
  const eventValid = event !== null
    && receipts.length === 1
    && receipts[0]?.suggestedFilename === event.suggestedFilename
    && receipts[0]?.failure === event.failure
    && event.suggestedFilename === 'webmcp-refused-download.txt'
    && event.failureSettled === true
    && event.failure !== null
    && event.failureError === null
    && refusal;
  const before = ['runTempDir', 'processTmpdir'].every((key) => scansClear(observations.beforeContextClose?.[key]));
  const after = ['runTempDir', 'processTmpdir'].every((key) => scansClear(observations.afterContextClose?.[key]));
  const actualNoFile = observations.afterContextClose?.runTempDir?.matches?.length === 0
    && observations.afterContextClose?.processTmpdir?.matches?.length === 0;
  return Boolean(
    coverage && producerPass && browserObserved && casePassed(entry)
      && entry && eventValid && markerValid && invokeValid && responseValid && before && after && actualNoFile,
  );
}

function legacyCounterProfile(source) {
  const h4 = source.slice(source.indexOf('function h4Hazard('), source.indexOf('function featureSwitchCounts('));
  return {
    h4NonceBlind: !/\bnonce\b|TABI_RUN_NONCE/.test(h4),
    h4PlaywrightArtifactBlind: !/playwright-artifacts/i.test(h4),
  };
}

function completePidIdentity(identity) {
  return Number.isInteger(identity?.pid)
    && identity.pid > 0
    && typeof identity.starttime === 'string'
    && /^\d+$/.test(identity.starttime)
    && typeof identity.exe === 'string'
    && identity.exe.startsWith('/');
}

function h1Shape(probe) {
  const beforeValid = Array.isArray(probe?.pidSetBefore)
    && probe.pidSetBefore.length > 0
    && probe.pidSetBefore.every(completePidIdentity);
  const afterEmpty = Array.isArray(probe?.pidSetAfter) && probe.pidSetAfter.length === 0;
  const pass = typeof probe?.caseLine === 'string'
    && beforeValid
    && probe?.signalSent === true
    && ['SIGINT', 'SIGHUP'].includes(probe?.signalName)
    && probe?.exitCode === 2
    && probe?.abortedMarkerObserved === true
    && probe?.passFailReceipt === null
    && afterEmpty;
  return {
    pass,
    caseLine: probe?.caseLine ?? null,
    pidSetBefore: probe?.pidSetBefore ?? [],
    pidSetBeforeComplete: beforeValid,
    signalSent: probe?.signalSent ?? false,
    signalName: probe?.signalName ?? null,
    exitCode: probe?.exitCode ?? null,
    abortedMarkerObserved: probe?.abortedMarkerObserved ?? false,
    passFailReceipt: probe?.passFailReceipt ?? null,
    pidSetAfter: probe?.pidSetAfter ?? [],
    why: pass ? 'first case was active with complete run-owned Chromium identities, abort exited 2, emitted run_aborted, wrote no pass/fail receipt, and left no owned Chromium identities' : 'one or more required signal-abort observations failed',
  };
}

function f6Shape(probe) {
  const text = `${probe.stdout ?? ''}\n${probe.stderr ?? ''}`;
  const findingObserved = text.includes('finding=witness_revision_refused');
  const detailObserved = text.includes(probe.expectedDetail);
  const pass = probe.status === 2 && findingObserved && detailObserved;
  return {
    pass,
    input: probe.input,
    status: probe.status,
    expectedDetail: probe.expectedDetail,
    findingObserved,
    detailObserved,
    stdout: String(probe.stdout ?? '').trim().slice(0, 1200),
    stderr: String(probe.stderr ?? '').trim().slice(0, 1200),
    why: pass ? 'witness exited 2 with witness_revision_refused and the shape-correct detail' : 'witness did not emit the shape-correct refusal result',
  };
}

function f6ValidShape(probe, revision) {
  const expected = `FRESHNESS_WITNESS tip=${revision} source=--rev`;
  const pass = probe.status === 0 && String(probe.stdout ?? '').startsWith(`${expected}\n`);
  return {
    pass,
    status: probe.status,
    revision,
    expectedOutputPrefix: expected,
    stdout: String(probe.stdout ?? '').trim().slice(0, 1200),
    stderr: String(probe.stderr ?? '').trim().slice(0, 1200),
  };
}

function parseArguments(argv) {
  const result = { revision: null, selfTest: false };
  for (const arg of argv) {
    if (arg === '--self-test') {
      if (result.selfTest) throw new CannotEvaluate('--self-test may be supplied once');
      result.selfTest = true;
    } else if (arg.startsWith('-')) {
      throw new CannotEvaluate(`unknown option ${arg}`);
    } else if (result.revision === null) {
      result.revision = arg;
    } else {
      throw new CannotEvaluate('unexpected extra argument');
    }
  }
  if (result.selfTest && result.revision !== null) throw new CannotEvaluate('--self-test cannot be combined with a revision');
  if (!result.selfTest && result.revision === null) throw new CannotEvaluate('usage: measure-c2.mjs REV | --self-test');
  return result;
}

async function runNormalArtifact(sandbox, artifact, { nonce, label } = {}) {
  const run = makeRunDirs(sandbox, label, { TABI_RUN_NONCE: nonce });
  const previous = snapshotReceipts(sandbox);
  const observed = new Map();
  const sample = () => {
    for (const identity of runOwnedChromium(run, proc?.child.pid)) {
      observed.set(`${identity.pid}:${identity.starttime}:${identity.exe}`, identity);
    }
  };
  let proc = null;
  let poller = null;
  let timeoutId = null;
  let closed = null;
  let timedOut = false;
  try {
    proc = spawnCaptured(process.execPath, [artifact.pathOnDisk, '--out', run.outPath], {
      cwd: sandbox,
      env: run.env,
    });
    sample();
    poller = setInterval(sample, 100);
    const timeout = new Promise((resolvePromise) => {
      timeoutId = setTimeout(() => resolvePromise(null), OUTER_TIMEOUT_MS);
    });
    closed = await Promise.race([proc.closed, timeout]);
    timedOut = closed === null;
    if (timedOut) {
      proc.child.kill('SIGTERM');
      closed = await Promise.race([proc.closed, sleep(5000).then(() => null)]);
      if (closed === null) {
        proc.child.kill('SIGKILL');
        closed = await Promise.race([proc.closed, sleep(2000).then(() => null)]);
      }
    }
    clearTimeout(timeoutId);
    timeoutId = null;
    clearInterval(poller);
    poller = null;
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
    return {
      run,
      exitCode: closed?.code ?? null,
      terminationSignal: closed?.signal ?? null,
      timedOut,
      stdout: proc.stdout,
      stderr: proc.stderr,
      spawnError: proc.spawnError?.message ?? null,
      receipt,
      receiptSha256: receiptBytes ? sha256(receiptBytes) : null,
      browserIdentitiesObserved: [...observed.values()].sort((a, b) => a.pid - b.pid),
      passFailReceipt: passFailReceipts(run, sandbox, previous),
    };
  } finally {
    clearTimeout(timeoutId);
    clearInterval(poller);
    if (proc && proc.child.exitCode === null && proc.child.signalCode === null) {
      try { proc.child.kill('SIGTERM'); } catch {}
      await Promise.race([proc.closed, sleep(1000)]);
      if (proc.child.exitCode === null && proc.child.signalCode === null) {
        try { proc.child.kill('SIGKILL'); } catch {}
      }
    }
    await terminateRunBrowsers(run, proc?.child.pid);
    rmSync(run.root, { recursive: true, force: true });
    rmSync(run.tempPath, { recursive: true, force: true });
  }
}

async function runSignalArtifact(sandbox, artifact, signalName, label) {
  const run = makeRunDirs(sandbox, label);
  const previous = snapshotReceipts(sandbox);
  let proc = null;
  let pending = '';
  let caseLine = null;
  let resolveCase;
  const caseFound = new Promise((resolvePromise) => { resolveCase = resolvePromise; });
  let startTimer = null;
  let closeTimer = null;
  let close = null;
  let pidSetBefore = [];
  let signalSent = false;
  let pidSetAfter = [];
  let timeoutKind = null;
  try {
    proc = spawnCaptured(process.execPath, [artifact.pathOnDisk, '--out', run.outPath], {
      cwd: sandbox,
      env: run.env,
    }, (chunk) => {
      pending += chunk;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? '';
      for (const line of lines) {
        if (/\bWEBMCP_INVOKE_CASE\b/i.test(line)) {
          caseLine ??= line;
          resolveCase(line);
          break;
        }
      }
    });
    const startTimeout = new Promise((resolvePromise) => {
      startTimer = setTimeout(() => resolvePromise(null), EARLY_CASE_TIMEOUT_MS);
    });
    const firstLine = await Promise.race([caseFound, proc.closed.then(() => null), startTimeout]);
    clearTimeout(startTimer);
    startTimer = null;
    if (firstLine === null) {
      timeoutKind = 'first_case_not_observed';
    } else {
      pidSetBefore = await waitForOwnedChromium(run, proc.child.pid, 30000);
      if (pidSetBefore.length === 0) timeoutKind = 'no_run_owned_chromium_before_signal';
      else signalSent = proc.child.kill(signalName);
    }
    if (proc.child.exitCode === null && proc.child.signalCode === null) {
      const closeWait = new Promise((resolvePromise) => {
        closeTimer = setTimeout(() => resolvePromise(null), EARLY_EXIT_TIMEOUT_MS);
      });
      close = await Promise.race([proc.closed, closeWait]);
      clearTimeout(closeTimer);
      closeTimer = null;
      if (close === null) {
        proc.child.kill('SIGKILL');
        close = await Promise.race([proc.closed, sleep(2000).then(() => null)]);
      }
    } else {
      close = await Promise.race([proc.closed, sleep(100).then(() => null)]);
    }
    pidSetAfter = await waitForNoOwnedChromium(run, proc.child.pid, PID_CLEANUP_TIMEOUT_MS);
    const receipt = passFailReceipts(run, sandbox, previous);
    const combined = `${proc.stdout}\n${proc.stderr}`;
    return {
      signalName,
      caseLine,
      pidSetBefore,
      signalSent,
      exitCode: close?.code ?? null,
      terminationSignal: close?.signal ?? null,
      pidSetAfter,
      passFailReceipt: receipt ? `${receipt.verdict}:${receipt.path}` : null,
      abortedMarkerObserved: combined.includes('finding=run_aborted') && combined.includes(`signal=${signalName}`),
      stdout: proc.stdout,
      stderr: proc.stderr,
      spawnError: proc.spawnError?.message ?? null,
      timeoutKind,
    };
  } finally {
    clearTimeout(startTimer);
    clearTimeout(closeTimer);
    if (proc && proc.child.exitCode === null && proc.child.signalCode === null) {
      try { proc.child.kill('SIGTERM'); } catch {}
      await Promise.race([proc.closed, sleep(500)]);
      if (proc.child.exitCode === null && proc.child.signalCode === null) {
        try { proc.child.kill('SIGKILL'); } catch {}
      }
    }
    await terminateRunBrowsers(run, proc?.child.pid);
    rmSync(run.root, { recursive: true, force: true });
    rmSync(run.tempPath, { recursive: true, force: true });
  }
}

function runF6Probes(sandbox, revision, witness, home) {
  const symbolicDetail = '--rev requires a 40-hex commit revision';
  const offBranchDetail = '--rev must be an ancestor of refs/heads/master';
  const inputs = [
    ['HEAD', 'HEAD', symbolicDetail],
    ['@', '@', symbolicDetail],
    ['master', 'master', symbolicDetail],
    ['short_7_hex', revision.slice(0, 7), symbolicDetail],
  ];
  if (!existsSync(witness.pathOnDisk) || !statSync(witness.pathOnDisk).isFile()) {
    const shapes = Object.fromEntries([
      ...inputs,
      ['off_branch_full', null, offBranchDetail],
    ].map(([name, value, expectedDetail]) => [name, f6Shape({
      input: value ?? name,
      expectedDetail,
      status: null,
      stdout: '',
      stderr: 'witness absent or not a regular file',
    })]));
    return { shapes, validAncestor: { pass: false, status: null, why: 'witness absent or not a regular file' } };
  }
  const poisonTree = String(git(sandbox, ['rev-parse', '--verify', `${revision}^{tree}`], { home })).trim();
  const poison = String(git(sandbox, ['commit-tree', poisonTree, '-p', revision, '-m', 'round-19 C2 off-branch witness probe'], { home })).trim();
  if (!HEX40.test(poison)) throw new CannotEvaluate('failed to create F6 off-branch poison commit');
  const root = mkdtempSync(join(sandbox, '.c2-f6-'));
  const temp = mkdtempSync(join(tmpdir(), 'tabi-r19-c2-f6-'));
  const env = { ...gitEnv(join(root, 'HOME')), ...childEnv(root, temp) };
  const allInputs = [...inputs, ['off_branch_full', poison, offBranchDetail]];
  const shapes = {};
  let validAncestor;
  try {
    for (const [name, value, expectedDetail] of allInputs) {
      const result = commandSync(process.execPath, [witness.pathOnDisk, '--rev', value], {
        cwd: sandbox,
        env,
        timeout: 30000,
      });
      shapes[name] = f6Shape({
        input: name === 'off_branch_full' ? poison : value,
        expectedDetail,
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr || result.error?.message || '',
      });
      shapes[name].testedValue = value;
    }
    const accepted = commandSync(process.execPath, [witness.pathOnDisk, '--rev', revision, '--dry-run'], {
      cwd: sandbox,
      env,
      timeout: 30000,
    });
    validAncestor = f6ValidShape({
      status: accepted.status,
      stdout: accepted.stdout,
      stderr: accepted.stderr || accepted.error?.message || '',
    }, revision);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(temp, { recursive: true, force: true });
  }
  return { shapes, validAncestor, witnessPath: witness.path };
}

function runtimeIdentity(normal) {
  const runtime = normal?.receipt?.runtime?.observed ?? {};
  const chromium = runtime.chromium ?? {};
  return {
    chromium: {
      launchPath: chromium.launchPath ?? null,
      realExecutable: chromium.realExecutable ?? null,
      realExecutableSha256: chromium.realExecutableSha256 ?? null,
      version: chromium.version ?? chromium.product ?? null,
    },
    playwright: runtime.playwright ?? null,
    playwrightDir: runtime.playwrightDir ?? null,
    node: runtime.node ?? null,
    counterNode: process.versions.node,
  };
}

function producerMatches(receipt, artifact) {
  const producer = receipt?.producer;
  const producerSha = receipt?.producerSha256 ?? producer?.sha256;
  return producer?.path === artifact.path
    && producer?.sha256 === artifact.sha256
    && producerSha === artifact.sha256;
}

function normalH4Shape(normal, artifact, nonce) {
  const record = h4RecordShape(normal?.receipt, nonce);
  const scan = cleanDownloadScanShape(normal?.receipt);
  const identities = normal?.browserIdentitiesObserved ?? [];
  const browserObserved = identities.length > 0 && identities.every(completePidIdentity);
  const producerPass = producerMatches(normal?.receipt, artifact);
  const pass = normal?.exitCode === 0
    && normal?.receipt?.verdict === 'pass'
    && record.pass
    && scan.pass
    && producerPass
    && browserObserved;
  return {
    pass,
    exitCode: normal?.exitCode ?? null,
    verdict: normal?.receipt?.verdict ?? null,
    receiptSha256: normal?.receiptSha256 ?? null,
    record,
    scan,
    producerPass,
    browserObserved,
    browserIdentitiesObserved: identities,
    why: pass ? 'clean receipt contains a correlated raw CDP invocation/response, fixture and page evidence, current nonce echo, and zero new files' : 'clean run lacks correlated receipt-local CDP evidence, fixture/page nonce evidence, complete zero-new-file scan, producer identity, or browser ownership',
  };
}

function replayFixtureFrom(normal, nonce) {
  if (!normal?.receipt) return null;
  const receipt = JSON.parse(JSON.stringify(normal.receipt));
  return {
    receipt,
    nonce,
    receiptSha256: normal.receiptSha256,
    browserObserved: (normal.browserIdentitiesObserved?.length ?? 0) > 0
      && normal.browserIdentitiesObserved.every(completePidIdentity),
  };
}

function h4UuidMutantShape(mutant, clean) {
  const scan = plantedUuidScanShape(mutant?.run?.receipt, mutant?.plant);
  const producerPass = producerMatches(mutant?.run?.receipt, mutant?.artifact);
  const browserObserved = (mutant?.run?.browserIdentitiesObserved?.length ?? 0) > 0
    && mutant.run.browserIdentitiesObserved.every(completePidIdentity);
  const failedRun = mutant?.run?.exitCode === 1
    && mutant?.run?.receipt?.verdict === 'fail'
    && scan.caseStatus === 'fail';
  const pass = clean?.pass === true && failedRun && scan.pass && producerPass && browserObserved;
  return {
    pass,
    cleanRunPassed: clean?.pass === true,
    mutantExitCode: mutant?.run?.exitCode ?? null,
    mutantVerdict: mutant?.run?.receipt?.verdict ?? null,
    mutantCaseStatus: scan.caseStatus,
    harnessScan: scan,
    producerPass,
    browserObserved,
    browserIdentitiesObserved: mutant?.run?.browserIdentitiesObserved ?? [],
    why: pass ? 'clean run passed; the UUID-file mutant appeared in the harness scan and made the harness run and case fail' : 'clean run or harness rejection of the UUID-file mutant was not fully observed',
  };
}

async function evaluateRevision(sandbox, revision, label, home, legacyProfile) {
  const result = {
    revision,
    label,
    artifact: null,
    witness: null,
    h4: {
      h4a: { pass: false, why: 'UUID-file mutant not run' },
      h4b: { pass: false, why: 'nonce and replay probes not run' },
    },
    h1: {},
    f6: null,
    runtime: null,
    errors: [],
  };
  let artifact;
  let witness;
  try {
    artifact = artifactAtRevision(sandbox, revision, home);
    witness = witnessAtRevision(sandbox, revision, home);
    result.artifact = { path: artifact.path, round: artifact.round, sha256: artifact.sha256 };
    result.witness = { path: witness.path, round: witness.round, sha256: witness.sha256 };
  } catch (error) {
    result.errors.push(String(error?.message ?? error));
    return result;
  }

  let prior = null;
  let clean = null;
  let mutant = null;
  let replayFixture = null;
  let currentNonce = null;
  let priorNonce = null;
  try {
    priorNonce = randomBytes(16).toString('hex');
    prior = await runNormalArtifact(sandbox, artifact, { nonce: priorNonce, label: `${label}-replay-source` });
    replayFixture = replayFixtureFrom(prior, priorNonce);
    currentNonce = randomBytes(16).toString('hex');
    clean = await runNormalArtifact(sandbox, artifact, { nonce: currentNonce, label: `${label}-clean` });
    const cleanShape = normalH4Shape(clean, artifact, currentNonce);
    const replay = replayPriorShape(replayFixture, currentNonce);
    const legacyCreditPrior = prior
      ? legacyRound18H4WouldCredit(prior.receipt, artifact, (prior.browserIdentitiesObserved?.length ?? 0) > 0)
      : false;
    result.h4.h4b = {
      pass: cleanShape.pass && replay.pass,
      cleanRun: cleanShape,
      replay,
      legacyCounterWouldCreditPriorRecord: legacyCreditPrior,
      legacyCounterNonceBlind: legacyProfile.h4NonceBlind,
      priorNonceLoadedBeforeCurrentNonce: Boolean(replayFixture && currentNonce && priorNonce !== currentNonce),
    };
    result.runtime = runtimeIdentity(clean);
    result.normalReceipt = {
      receiptSha256: clean?.receiptSha256 ?? null,
      exitCode: clean?.exitCode ?? null,
      verdict: clean?.receipt?.verdict ?? null,
      browserIdentitiesObserved: clean?.browserIdentitiesObserved ?? [],
      spawnError: clean?.spawnError ?? null,
    };
  } catch (error) {
    result.errors.push(`H4 clean/replay: ${String(error?.message ?? error)}`);
  }

  try {
    mutant = await runH4UuidMutant(sandbox, artifact, {
      nonce: randomBytes(16).toString('hex'),
      label: `${label}-uuid-mutant`,
    });
    const cleanShape = clean ? normalH4Shape(clean, artifact, currentNonce) : { pass: false };
    const candidateShape = h4UuidMutantShape(mutant, cleanShape);
    const legacyCreditMutant = legacyRound18H4WouldCredit(
      mutant.run.receipt,
      mutant.artifact,
      mutant.run.browserIdentitiesObserved.length > 0,
    );
    result.h4.h4a = {
      ...candidateShape,
      legacyCounterWouldCreditMutant: legacyCreditMutant,
      legacyCounterIgnoresPlaywrightArtifacts: legacyProfile.h4PlaywrightArtifactBlind,
    };
  } catch (error) {
    result.errors.push(`H4 UUID mutant: ${String(error?.message ?? error)}`);
    result.h4.h4a = { pass: false, legacyCounterWouldCreditMutant: false, why: String(error?.message ?? error) };
  }

  for (const signalName of ['SIGINT', 'SIGHUP']) {
    const key = signalName.toLowerCase();
    try {
      const probe = await runSignalArtifact(sandbox, artifact, signalName, `${label}-${key}`);
      result.h1[key] = { ...h1Shape(probe), probe };
    } catch (error) {
      result.errors.push(`${signalName}: ${String(error?.message ?? error)}`);
      result.h1[key] = { pass: false, why: String(error?.message ?? error) };
    }
  }

  try {
    result.f6 = runF6Probes(sandbox, revision, witness, home);
  } catch (error) {
    result.errors.push(`F6: ${String(error?.message ?? error)}`);
    result.f6 = {
      shapes: {},
      validAncestor: { pass: false, why: String(error?.message ?? error) },
      witnessPath: witness.path,
    };
  }
  return result;
}

function compareRecords(base, candidate, legacyProfile) {
  const eligible = candidate?.artifact?.path === 'scripts/webmcp-invoke-round19.mjs';
  const h4aRedAtB = legacyProfile.h4PlaywrightArtifactBlind
    && base?.h4?.h4a?.legacyCounterWouldCreditMutant === true;
  const h4bRedAtB = legacyProfile.h4NonceBlind
    && base?.h4?.h4b?.legacyCounterWouldCreditPriorRecord === true;
  const h4a = {
    baseline: {
      legacyCounterWouldCreditMutant: base?.h4?.h4a?.legacyCounterWouldCreditMutant ?? false,
      legacyCounterIgnoresPlaywrightArtifacts: legacyProfile.h4PlaywrightArtifactBlind,
    },
    revision: candidate?.h4?.h4a ?? { pass: false, why: 'candidate H4a probe unavailable' },
    closed: eligible && h4aRedAtB && candidate?.h4?.h4a?.pass === true,
  };
  const h4b = {
    baseline: {
      legacyCounterWouldCreditPriorRecord: base?.h4?.h4b?.legacyCounterWouldCreditPriorRecord ?? false,
      legacyCounterNonceBlind: legacyProfile.h4NonceBlind,
    },
    revision: candidate?.h4?.h4b ?? { pass: false, why: 'candidate H4b probe unavailable' },
    closed: eligible && h4bRedAtB && candidate?.h4?.h4b?.pass === true,
  };
  return {
    h4: { h4a, h4b },
    c2_h4_properties: Number(h4a.closed) + Number(h4b.closed),
    coverage: {
      h1: { baseline: base.h1, revision: candidate.h1 },
      f6: { baseline: base.f6, revision: candidate.f6 },
    },
    eligibleRound19Artifact: eligible,
  };
}

function outputRecord({ revision, base, candidate, comparison, counterSha256, legacyProfile }) {
  return {
    rev: revision,
    c2_h4_properties: comparison.c2_h4_properties,
    evaluationStatus: base.errors.length === 0 && candidate.errors.length === 0 ? 'complete' : 'could_not_evaluate',
    h4: comparison.h4,
    coverage: comparison.coverage,
    runtime_identity: {
      baseline: base.runtime,
      revision: candidate.runtime,
      counterNode: process.versions.node,
    },
    artifacts: {
      baseline: base.artifact,
      revision: candidate.artifact,
      baselineWitness: base.witness,
      revisionWitness: candidate.witness,
      eligibleRound19Artifact: comparison.eligibleRound19Artifact,
    },
    legacyRound18Counter: legacyProfile,
    probeErrors: { baseline: base.errors, revision: candidate.errors },
    counterSha256,
  };
}

function failedOutput(revision, counterSha256, error) {
  const failure = String(error?.message ?? error).replace(/\s+/g, ' ');
  const failedProperty = { closed: false, baseline: { pass: false }, revision: { pass: false, why: failure } };
  return {
    rev: revision,
    c2_h4_properties: 0,
    h4: { h4a: failedProperty, h4b: { ...failedProperty } },
    coverage: {
      h1: { baseline: null, revision: null },
      f6: { baseline: null, revision: null },
    },
    runtime_identity: { baseline: null, revision: null, counterNode: process.versions.node },
    artifacts: { baseline: null, revision: null, eligibleRound19Artifact: false },
    evaluationStatus: 'could_not_evaluate',
    probeErrors: { fatal: failure },
    counterSha256,
  };
}

async function mainRevision(revisionArg) {
  let lane = null;
  let home = null;
  let baseSandbox = null;
  let revisionSandbox = null;
  let revision = null;
  const counterSha256 = sha256(readFileSync(SCRIPT));
  try {
    lane = resolveLaneRoot();
    home = mkdtempSync(join(tmpdir(), 'tabi-r19-c2-home-'));
    revision = resolveRevision(lane, revisionArg, home);
    baseSandbox = makeSandbox(lane, BASELINE, home, 'base');
    revisionSandbox = makeSandbox(lane, revision, home, 'revision');
    const legacySourcePath = join(baseSandbox, ROUND18_COUNTER);
    if (!existsSync(legacySourcePath)) throw new CannotEvaluate(`round-18 counter missing at baseline: ${ROUND18_COUNTER}`);
    const legacyProfile = legacyCounterProfile(readFileSync(legacySourcePath, 'utf8'));
    const base = await evaluateRevision(baseSandbox, BASELINE, 'base', home, legacyProfile);
    const candidate = revision === BASELINE
      ? base
      : await evaluateRevision(revisionSandbox, revision, 'revision', home, legacyProfile);
    const comparison = compareRecords(base, candidate, legacyProfile);
    return outputRecord({ revision, base, candidate, comparison, counterSha256, legacyProfile });
  } catch (error) {
    return failedOutput(revision, counterSha256, error);
  } finally {
    if (baseSandbox) rmSync(baseSandbox, { recursive: true, force: true });
    if (revisionSandbox) rmSync(revisionSandbox, { recursive: true, force: true });
    if (home) rmSync(home, { recursive: true, force: true });
  }
}

function selfTest() {
  const tests = [];
  const check = (name, pass, detail = null) => tests.push({ name, pass: Boolean(pass), detail });
  const event = {
    suggestedFilename: 'webmcp-refused-download.txt',
    failure: 'Download is canceled',
    failureSettled: true,
    failureError: null,
  };
  const clearScan = { complete: true, roots: [], newFiles: [], errors: [] };
  const identity = { pid: 111, starttime: '12345', exe: '/usr/lib/chromium/chromium' };
  const candidateArtifact = { path: 'scripts/webmcp-invoke-round19.mjs', sha256: 'a'.repeat(64), round: 19, pathOnDisk: '/tmp/counter-artifact.mjs' };
  const makeReceipt = (nonce, artifact, { verdict = 'pass', includeNonce = true, scan = clearScan } = {}) => {
    const actual = {
      downloadMarkerPrefix: 'tabi-r19-download-',
      downloadMarkerSha256: 'b'.repeat(64),
      pageDownloadRecord: { tool: 'download-blob', ...(includeNonce ? { nonce } : {}) },
      invoke: {
        request: {
          method: 'WebMCP.invokeTool',
          params: { frameId: 'main-frame', toolName: 'download-blob', input: {} },
        },
        result: { invocationId: 'invoke-1' },
        invocationId: 'invoke-1',
        error: null,
      },
      responded: { invocationId: 'invoke-1', status: 'Completed', output: 'download-triggered' },
      downloadEvents: [event],
      downloadScan: scan,
      beforeContextClose: {
        runTempDir: { complete: true, matches: [] },
        processTmpdir: { complete: true, matches: [] },
      },
      afterContextClose: {
        runTempDir: { complete: true, matches: [] },
        processTmpdir: { complete: true, matches: [] },
      },
    };
    const frames = [
      { seq: 1, dir: 'in', frame: { method: 'WebMCP.toolsAdded', params: { tools: [{ name: 'download-blob' }] } } },
      { seq: 2, dir: 'out', frame: { id: 1, method: 'WebMCP.invokeTool', params: { frameId: 'main-frame', toolName: 'download-blob', input: {} } } },
      { seq: 3, dir: 'in', frame: { id: 1, result: { invocationId: 'invoke-1' } } },
      { seq: 4, dir: 'in', frame: { method: 'WebMCP.toolInvoked', params: { invocationId: 'invoke-1', toolName: 'download-blob' } } },
      { seq: 5, dir: 'in', frame: { method: 'WebMCP.toolResponded', params: { invocationId: 'invoke-1', status: 'Completed', output: 'download-triggered' } } },
    ];
    return {
      verdict,
      nonce,
      producer: { path: artifact.path, sha256: artifact.sha256 },
      producerSha256: artifact.sha256,
      cases: CASE_IDS.map((id) => ({
        id,
        status: id === DOWNLOAD_CASE_ID && verdict === 'fail' ? 'fail' : 'pass',
        ...(id === DOWNLOAD_CASE_ID ? {
          fixture: 'scripts/webmcp-invoke-round19.mjs#embedded:invoke-download-refused.html',
          fixtureFile: 'invoke-download-refused.html',
          fixtureSha256: 'c'.repeat(64),
          actual,
          downloadEvents: [event],
          toolsAdded: [{ name: 'download-blob' }],
          cdp: { mainFrameId: 'main-frame', frames },
        } : {}),
      })),
      controls: CONTROL_IDS.map((id) => ({ id, status: 'pass' })),
    };
  };

  const nonceA = '0123456789abcdef0123456789abcdef';
  const nonceB = 'fedcba9876543210fedcba9876543210';
  const currentReceipt = makeReceipt(nonceA, candidateArtifact);
  check('h4_real_raw_invocation_fixture_and_nonce_evidence_accepted', h4RecordShape(currentReceipt, nonceA).pass);
  check('h4_wrong_current_nonce_rejected', !h4RecordShape(currentReceipt, nonceB).pass);
  const counterAwareEcho = JSON.parse(JSON.stringify(currentReceipt));
  const counterAwareCase = findCase(counterAwareEcho, DOWNLOAD_CASE_ID);
  counterAwareCase.actual.invoke = { request: null, invocationId: null, error: null };
  counterAwareCase.actual.responded = null;
  check('h4_counter_aware_nonce_echo_without_invoke_rejected', !h4RecordShape(counterAwareEcho, nonceA).pass);
  const missingRawInvoke = JSON.parse(JSON.stringify(currentReceipt));
  findCase(missingRawInvoke, DOWNLOAD_CASE_ID).cdp.frames = findCase(missingRawInvoke, DOWNLOAD_CASE_ID).cdp.frames
    .filter((item) => !(item.dir === 'out' && item.frame?.method === 'WebMCP.invokeTool'));
  check('h4_missing_raw_invoke_rejected', !h4RecordShape(missingRawInvoke, nonceA).pass);
  const contradictoryRawInvoke = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryRawInvoke, DOWNLOAD_CASE_ID).cdp.frames
    .find((item) => item.dir === 'out' && item.frame?.method === 'WebMCP.invokeTool').frame.params.toolName = 'other-tool';
  check('h4_raw_invoke_wrong_tool_rejected', !h4RecordShape(contradictoryRawInvoke, nonceA).pass);
  const missingInvokeReply = JSON.parse(JSON.stringify(currentReceipt));
  findCase(missingInvokeReply, DOWNLOAD_CASE_ID).cdp.frames = findCase(missingInvokeReply, DOWNLOAD_CASE_ID).cdp.frames
    .filter((item) => !(item.dir === 'in' && item.frame?.id === 1));
  check('h4_missing_raw_invoke_reply_rejected', !h4RecordShape(missingInvokeReply, nonceA).pass);
  const contradictoryInvokeReply = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryInvokeReply, DOWNLOAD_CASE_ID).cdp.frames
    .find((item) => item.dir === 'in' && item.frame?.id === 1).frame.result.invocationId = 'other-invocation';
  check('h4_raw_invoke_reply_id_mismatch_rejected', !h4RecordShape(contradictoryInvokeReply, nonceA).pass);
  const missingToolInvoked = JSON.parse(JSON.stringify(currentReceipt));
  findCase(missingToolInvoked, DOWNLOAD_CASE_ID).cdp.frames = findCase(missingToolInvoked, DOWNLOAD_CASE_ID).cdp.frames
    .filter((item) => item.frame?.method !== 'WebMCP.toolInvoked');
  check('h4_missing_raw_tool_invoked_rejected', !h4RecordShape(missingToolInvoked, nonceA).pass);
  const contradictoryToolInvoked = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryToolInvoked, DOWNLOAD_CASE_ID).cdp.frames
    .find((item) => item.frame?.method === 'WebMCP.toolInvoked').frame.params.invocationId = 'other-invocation';
  check('h4_raw_tool_invoked_id_mismatch_rejected', !h4RecordShape(contradictoryToolInvoked, nonceA).pass);
  const missingToolResponded = JSON.parse(JSON.stringify(currentReceipt));
  findCase(missingToolResponded, DOWNLOAD_CASE_ID).cdp.frames = findCase(missingToolResponded, DOWNLOAD_CASE_ID).cdp.frames
    .filter((item) => item.frame?.method !== 'WebMCP.toolResponded');
  check('h4_missing_raw_tool_responded_rejected', !h4RecordShape(missingToolResponded, nonceA).pass);
  const contradictoryToolResponded = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryToolResponded, DOWNLOAD_CASE_ID).cdp.frames
    .find((item) => item.frame?.method === 'WebMCP.toolResponded').frame.params.status = 'Error';
  check('h4_raw_tool_responded_status_mismatch_rejected', !h4RecordShape(contradictoryToolResponded, nonceA).pass);
  const missingFixtureEvidence = JSON.parse(JSON.stringify(currentReceipt));
  delete findCase(missingFixtureEvidence, DOWNLOAD_CASE_ID).fixtureSha256;
  check('h4_missing_fixture_evidence_rejected', !h4RecordShape(missingFixtureEvidence, nonceA).pass);
  const contradictoryToolRespondedId = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryToolRespondedId, DOWNLOAD_CASE_ID).cdp.frames
    .find((item) => item.frame?.method === 'WebMCP.toolResponded').frame.params.invocationId = 'other-invocation';
  check('h4_raw_tool_responded_id_mismatch_rejected', !h4RecordShape(contradictoryToolRespondedId, nonceA).pass);
  const contradictoryActualResponse = JSON.parse(JSON.stringify(currentReceipt));
  findCase(contradictoryActualResponse, DOWNLOAD_CASE_ID).actual.responded.invocationId = 'other-invocation';
  check('h4_actual_response_id_mismatch_rejected', !h4RecordShape(contradictoryActualResponse, nonceA).pass);
  const missingPageEvidence = JSON.parse(JSON.stringify(currentReceipt));
  delete findCase(missingPageEvidence, DOWNLOAD_CASE_ID).actual.downloadMarkerSha256;
  check('h4_missing_page_evidence_rejected', !h4RecordShape(missingPageEvidence, nonceA).pass);
  check('h4_clean_scan_requires_zero_new_files', cleanDownloadScanShape(currentReceipt).pass);
  const dirtyReceipt = JSON.parse(JSON.stringify(currentReceipt));
  findCase(dirtyReceipt, DOWNLOAD_CASE_ID).actual.downloadScan.newFiles.push({ path: '/tmp/unexpected' });
  check('h4_clean_scan_new_file_rejected', !cleanDownloadScanShape(dirtyReceipt).pass);

  const replayFixture = {
    receipt: JSON.parse(JSON.stringify(currentReceipt)),
    nonce: nonceA,
    receiptSha256: 'c'.repeat(64),
    browserObserved: true,
  };
  check('h4_prior_real_browser_record_rejected_for_new_nonce', replayPriorShape(replayFixture, nonceB).pass);
  check('h4_replay_same_nonce_not_rejected', !replayPriorShape(replayFixture, nonceA).pass);

  const directory = `playwright-artifacts-${randomUUID()}`;
  const filename = randomUUID();
  const rootPath = `/tmp/c2-process/${directory}`;
  const filePath = `${rootPath}/${filename}`;
  const scanWithPlant = {
    complete: true,
    errors: [],
    roots: [{ kind: 'playwrightArtifacts', path: rootPath }],
    newFiles: [{ path: filePath, roots: [rootPath], stages: ['whileBrowserAlive'] }],
  };
  const plant = { directory, filename, contentSha256: 'd'.repeat(64) };
  const mutantArtifact = { ...candidateArtifact, sha256: 'e'.repeat(64) };
  const mutantReceipt = makeReceipt(nonceA, mutantArtifact, { verdict: 'fail', scan: scanWithPlant });
  check('h4_uuid_scan_path_and_run_failure_required', plantedUuidScanShape(mutantReceipt, plant).pass);
  check('h4_uuid_mutant_requires_clean_run_and_harness_rejection', h4UuidMutantShape({
    run: { receipt: mutantReceipt, exitCode: 1, browserIdentitiesObserved: [identity] },
    artifact: mutantArtifact,
    plant,
  }, { pass: true }).pass);
  const unreportedPlant = JSON.parse(JSON.stringify(mutantReceipt));
  findCase(unreportedPlant, DOWNLOAD_CASE_ID).actual.downloadScan.newFiles = [];
  check('h4_uuid_unreported_file_rejected', !plantedUuidScanShape(unreportedPlant, plant).pass);
  const oldArtifact = { path: 'scripts/webmcp-invoke-round18.mjs', sha256: 'f'.repeat(64) };
  const oldReceipt = makeReceipt(nonceA, oldArtifact, { includeNonce: false });
  findCase(oldReceipt, DOWNLOAD_CASE_ID).actual.downloadMarkerPrefix = 'tabi-r18-download-';
  check('h4_round18_predicate_credits_replay_and_uuid_mutant', legacyRound18H4WouldCredit(oldReceipt, oldArtifact, true));

  const validSignal = {
    caseLine: 'WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass',
    pidSetBefore: [identity],
    signalSent: true,
    signalName: 'SIGINT',
    exitCode: 2,
    abortedMarkerObserved: true,
    passFailReceipt: null,
    pidSetAfter: [],
  };
  check('h1_sigint_clean_abort_accepts_complete_pid_identity', h1Shape(validSignal).pass);
  check('h1_sighup_clean_abort_accepts_complete_pid_identity', h1Shape({ ...validSignal, signalName: 'SIGHUP' }).pass);
  check('h1_idle_browser_mutant_rejected', !h1Shape({ ...validSignal, pidSetBefore: [] }).pass);
  check('h1_missing_starttime_or_exe_rejected', !h1Shape({ ...validSignal, pidSetBefore: [{ pid: 111 }] }).pass);
  check('h1_no_run_aborted_marker_rejected', !h1Shape({ ...validSignal, abortedMarkerObserved: false }).pass);
  check('h1_exit_two_required', !h1Shape({ ...validSignal, exitCode: 130 }).pass);
  check('h1_no_pass_fail_receipt_required', !h1Shape({ ...validSignal, passFailReceipt: 'pass:/tmp/receipt.json' }).pass);
  check('h1_empty_after_required', !h1Shape({ ...validSignal, pidSetAfter: [identity] }).pass);

  const symbolicDetail = '--rev requires a 40-hex commit revision';
  const offBranchDetail = '--rev must be an ancestor of refs/heads/master';
  check('f6_symbolic_refusal_requires_exact_detail', f6Shape({
    input: 'HEAD', expectedDetail: symbolicDetail, status: 2,
    stderr: `FRESHNESS_WITNESS finding=witness_revision_refused detail=${symbolicDetail}`,
  }).pass);
  check('f6_short_refusal_requires_exact_detail', f6Shape({
    input: '0123456', expectedDetail: symbolicDetail, status: 2,
    stderr: `FRESHNESS_WITNESS finding=witness_revision_refused detail=${symbolicDetail}`,
  }).pass);
  check('f6_off_branch_refusal_requires_exact_detail', f6Shape({
    input: 'e'.repeat(40), expectedDetail: offBranchDetail, status: 2,
    stderr: `FRESHNESS_WITNESS finding=witness_revision_refused detail=${offBranchDetail}`,
  }).pass);
  check('f6_wrong_reason_rejected', !f6Shape({
    input: 'HEAD', expectedDetail: symbolicDetail, status: 2,
    stderr: 'FRESHNESS_WITNESS finding=witness_revision_refused detail=some other refusal',
  }).pass);
  check('f6_wrong_finding_rejected', !f6Shape({
    input: 'HEAD', expectedDetail: symbolicDetail, status: 2,
    stderr: `FRESHNESS_WITNESS finding=witness_usage detail=${symbolicDetail}`,
  }).pass);
  const acceptedRevision = '1'.repeat(40);
  check('f6_valid_full_ancestor_positive_control', f6ValidShape({
    status: 0,
    stdout: `FRESHNESS_WITNESS tip=${acceptedRevision} source=--rev\nFRESHNESS_WITNESS argv=[]\n`,
    stderr: '',
  }, acceptedRevision).pass);

  const r19Mutant = makeH4UuidMutant({
    ...candidateArtifact,
    bytes: Buffer.from('const downloadScanBefore = snapshotDownloadFiles();'),
  });
  check('h4_mutant_injects_after_download_baseline', r19Mutant.artifact.bytes.indexOf('const c2PlantedArtifactRoot') > r19Mutant.artifact.bytes.indexOf('const downloadScanBefore'));
  const r18Mutant = makeH4UuidMutant({
    ...oldArtifact,
    round: 18,
    pathOnDisk: '/tmp/counter-round18.mjs',
    bytes: Buffer.from('const downloadMarker = await page.evaluate(() => globalThis.__downloadMarker);'),
  });
  check('h4_round18_mutant_uses_download_case_anchor', r18Mutant.artifact.bytes.indexOf('const c2PlantedArtifactRoot') > r18Mutant.artifact.bytes.indexOf('const downloadMarker'));
  const artifacts = [
    { path: 'scripts/webmcp-invoke-round17.mjs', round: 17 },
    { path: 'scripts/webmcp-invoke-round19.mjs', round: 19 },
    { path: 'scripts/webmcp-invoke-round18.mjs', round: 18 },
  ];
  check('newest_round_artifact_selected', [...artifacts].sort((a, b) => b.round - a.round)[0].path === 'scripts/webmcp-invoke-round19.mjs');

  const failed = tests.filter((test) => !test.pass);
  const repoRoot = String(git(dirname(SCRIPT), ['rev-parse', '--show-toplevel'])).trim();
  const receiptPath = 'corpus/evidence/round-19/selftests/c2.json';
  const result = {
    schema: 'tabi-round19-c2-selftest-v1',
    verdict: failed.length === 0 ? 'pass' : 'fail',
    cases: tests.length,
    passed: tests.length - failed.length,
    failed: failed.length,
    tests,
    runtimeIdentity: { node: process.versions.node },
    producer: { path: relative(repoRoot, SCRIPT).split(sep).join('/'), sha256: sha256(readFileSync(SCRIPT)) },
    receiptPath,
  };
  const outputPath = join(repoRoot, receiptPath);
  mkdirSync(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(result, null, 2)}\n`);
  renameSync(temporaryPath, outputPath);
  return result;
}

async function entry() {
  let args;
  try {
    args = parseArguments(process.argv.slice(2));
    if (args.selfTest) {
      const result = selfTest();
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return result.verdict === 'pass' ? 0 : 2;
    }
    const result = await mainRevision(args.revision);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return result.evaluationStatus === 'complete' ? 0 : 2;
  } catch (error) {
    const result = failedOutput(null, sha256(readFileSync(SCRIPT)), error);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return 2;
  }
}

process.exitCode = await entry();
