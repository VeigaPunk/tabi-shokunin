#!/usr/bin/env node
// Failure-capable gate for the round-13 ARIA metadata correction.
//
// Two distinct historical facts are checked independently:
//   1. cleanup.server.listeningAfter was aggregated with the wrong predicate by the
//      round-13 producer (every(proof.listeningAfter === false) stored true under a raw
//      post-close observation name). The raw per-worker proofs say false.
//   2. receipt.runtime.node recorded 26.12.0 while pin.node.recorded is 24.21.0 and the
//      enforced floor is minimumMajor 20. Node is not part of the runtime pin match.
//
// This gate never rewrites the historical receipt, pin, worker, spec, or runner bytes.
// The corrected sidecar is a digest-bound statement derived from those bytes only; it
// is not a browser execution and cannot turn an unrelated failure into a pass.
//
// Modes:
//   node scripts/check-aria-metadata.mjs
//     Check the committed historical receipt and pin. The original contradiction is red.
//   node scripts/check-aria-metadata.mjs --sidecar <corrected.json>
//     Accept the sidecar only after digest/source/proof/Node checks and a post-correction
//     re-evaluation of the same bytes.
//   node scripts/check-aria-metadata.mjs --derive <receipt> <pin> --out <path>
//     Deterministically re-derive the sidecar under corpus/evidence/round-14/aria-metadata/.
//   node scripts/check-aria-metadata.mjs --witness
//     One checker, two observations: old summary red, qualified sidecar green, original
//     receipt/pin byte-identical afterwards.
//   node scripts/check-aria-metadata.mjs --self-test
//     Isolated mkdtemp fixtures, each exercised through a subprocess of this CLI.

import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');

const DEFAULT_RECEIPT = 'corpus/evidence/round-13/aria/receipt.json';
const DEFAULT_PIN = 'corpus/evidence/round-13/aria/runtime-pin.json';
const DEFAULT_MANIFEST = 'corpus/evidence/round-13/aria/manifest.json';
const DEFAULT_SIDECAR = 'corpus/evidence/round-14/aria-metadata/corrected.json';
const DEFAULT_EXPECTATIONS = 'corpus/evidence/round-14/aria-metadata/expected-fixtures.json';
const EVIDENCE_DIR = 'corpus/evidence/round-14/aria-metadata';
const WORKER_DIR = 'corpus/evidence/round-13/aria/actual/workers';
const WORKER_PREFIX = `${WORKER_DIR}/`;
const SIDECAR_SCHEMA = 'tabi-aria-metadata-correction-v1';
const EXPECTATIONS_SCHEMA = 'tabi-aria-metadata-fixture-expectations-v1';

// Immutable historical identities. These are code constants, never CLI inputs.
const ANCHORS = Object.freeze({
  receiptSha256: 'b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7',
  pinSha256: '4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2',
  producerSourceSha256: '1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c',
  specSha256: '03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc',
  configSha256: '87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4',
  manifestSha256: '56764241df4f4a644af39e368b2e47f35d3f4bbbdf17e7cef3fa848ee0d72112',
  workers: Object.freeze({
    'worker-0-1530637-1792474958700.json':
      '0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7',
  }),
});

const SOURCE_PATHS = Object.freeze({
  producer: 'scripts/aria-loopback-round13.mjs',
  spec: 'corpus/evidence/round-13/aria/aria-loopback.spec.mjs',
  config: 'corpus/evidence/round-13/aria/playwright.config.mjs',
  manifest: DEFAULT_MANIFEST,
});

const FIXTURE_PIN = Object.freeze({
  schema: 'tabi-aria-runtime-pin-v1',
  wave: 'tabi-round-13-w1',
  playwrightTest: '1.64.0',
  playwright: '1.64.0',
  playwrightCore: '1.64.0',
  chromium: {
    revision: '1248',
    version: '156.0.8078.4',
    executableSuffix: 'chromium-1248/chrome-linux64/chrome',
    executableSha256: '377a9fc07b495c3b8d0ab8ec1fdfd153641759f9756fea34d8dfce4de82f5025',
    bytes: 301186376,
  },
  node: { recorded: '24.21.0', minimumMajor: 20 },
});

const FIXTURE_WORKER_REF = Object.freeze({
  file: `${WORKER_PREFIX}worker-0-1530637-1792474958700.json`,
  worker: { index: '0', pid: 1530637 },
});

const FIXTURE_PROOF = Object.freeze({
  origin: 'http://127.0.0.1:40983',
  listeningBefore: true,
  closed: true,
  listeningAfter: false,
  refusedAfterClose: true,
  refusalDetail: 'ECONNREFUSED',
  closeError: null,
});

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const ORIGIN = /^http:\/\/(127\.0\.0\.1|localhost):\d+$/;
const WORKER_NAME = /^worker-(\d+)-(\d+)-(\d+)\.json$/;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortedValue(value[key]);
    return out;
  }
  return value;
}

function stableStringify(value) {
  return `${JSON.stringify(sortedValue(value), null, 2)}\n`;
}

function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match = SEMVER.exec(value);
  if (!match) return null;
  return { text: value, major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function finding(id, status, detail) {
  return { id, status, detail };
}

function pushFinding(list, id, ok, detail) {
  list.push(finding(id, ok ? 'pass' : 'fail', detail));
}

function readEntry(pathText) {
  const abs = isAbsolute(pathText) ? resolve(pathText) : resolve(ROOT, pathText);
  let link;
  try {
    link = lstatSync(abs);
  } catch (error) {
    return {
      ok: false,
      path: pathText,
      abs,
      reason: error?.code === 'ENOENT' ? 'missing' : 'unreadable',
      detail: String(error?.code || error?.message || error),
    };
  }
  if (link.isSymbolicLink()) {
    return { ok: false, path: pathText, abs, reason: 'symlink' };
  }
  if (!link.isFile()) {
    return { ok: false, path: pathText, abs, reason: 'not_regular' };
  }
  let fd;
  try {
    fd = openSync(abs, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
  } catch (error) {
    return {
      ok: false,
      path: pathText,
      abs,
      reason: error?.code === 'ELOOP' ? 'symlink' : 'unreadable',
      detail: String(error?.code || error?.message || error),
    };
  }
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile()) {
      return { ok: false, path: pathText, abs, reason: 'not_regular' };
    }
    const bytes = readFileSync(fd);
    return {
      ok: true,
      path: pathText,
      abs,
      bytes,
      bytesLength: bytes.length,
      sha256: sha256(bytes),
    };
  } catch (error) {
    return {
      ok: false,
      path: pathText,
      abs,
      reason: 'unreadable',
      detail: String(error?.code || error?.message || error),
    };
  } finally {
    closeSync(fd);
  }
}

function decodeJson(entry, label) {
  if (!entry.ok) return { ok: false, reason: `${label}:${entry.reason}` };
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(entry.bytes);
  } catch {
    return { ok: false, reason: `${label}:invalid_utf8` };
  }
  try {
    const value = JSON.parse(text);
    if (!isPlainObject(value)) return { ok: false, reason: `${label}:not_object` };
    return { ok: true, value };
  } catch {
    return { ok: false, reason: `${label}:invalid_json` };
  }
}

function readJson(pathText) {
  const entry = readEntry(pathText);
  const load = decodeJson(entry, basename(pathText));
  return { entry, load };
}

function sameAbs(left, right) {
  return Boolean(left && right && resolve(left) === resolve(right));
}

function pinProjection(pin) {
  return {
    schema: pin?.schema,
    wave: pin?.wave,
    playwrightTest: pin?.playwrightTest,
    playwright: pin?.playwright,
    playwrightCore: pin?.playwrightCore,
    chromium: {
      revision: pin?.chromium?.revision,
      version: pin?.chromium?.version,
      executableSuffix: pin?.chromium?.executableSuffix,
      executableSha256: pin?.chromium?.executableSha256,
      bytes: pin?.chromium?.bytes,
    },
    node: {
      recorded: pin?.node?.recorded,
      minimumMajor: pin?.node?.minimumMajor,
    },
  };
}

function proofShapeProblems(proof, index) {
  const problems = [];
  if (!isPlainObject(proof)) return [`proof[${index}]:not_object`];
  for (const key of ['listeningBefore', 'closed', 'listeningAfter', 'refusedAfterClose']) {
    if (typeof proof[key] !== 'boolean') problems.push(`proof[${index}]:${key}:nonboolean`);
  }
  if (!Object.prototype.hasOwnProperty.call(proof, 'closeError')) {
    problems.push(`proof[${index}]:closeError:missing`);
  }
  if (typeof proof.refusalDetail !== 'string') {
    problems.push(`proof[${index}]:refusalDetail:nonstring`);
  }
  if (typeof proof.origin !== 'string' || !ORIGIN.test(proof.origin)) {
    problems.push(`proof[${index}]:origin:invalid`);
  }
  return problems;
}

function proofValueProblems(proof, index) {
  const problems = [];
  if (proof?.listeningBefore !== true) problems.push(`proof[${index}]:listeningBefore_not_true`);
  if (proof?.closed !== true) problems.push(`proof[${index}]:closed_not_true`);
  if (proof?.listeningAfter !== false) problems.push(`proof[${index}]:listeningAfter_not_false`);
  if (proof?.refusedAfterClose !== true) problems.push(`proof[${index}]:refusedAfterClose_not_true`);
  if (proof?.closeError !== null) problems.push(`proof[${index}]:closeError_not_null`);
  if (proof?.refusalDetail !== 'ECONNREFUSED') {
    problems.push(`proof[${index}]:refusalDetail_not_ECONNREFUSED`);
  }
  return problems;
}

function evaluateCleanup(receipt) {
  const cleanup = isPlainObject(receipt?.cleanup) ? receipt.cleanup : null;
  const server = isPlainObject(cleanup?.server) ? cleanup.server : null;
  const perWorker = Array.isArray(server?.perWorker) ? server.perWorker : null;
  const shapeProblems = [];
  if (!perWorker || perWorker.length === 0) {
    shapeProblems.push('perWorker:missing_or_empty');
  } else {
    perWorker.forEach((proof, index) => shapeProblems.push(...proofShapeProblems(proof, index)));
  }
  const valueProblems = [];
  if (perWorker && perWorker.length > 0) {
    perWorker.forEach((proof, index) => valueProblems.push(...proofValueProblems(proof, index)));
  }
  const complete = shapeProblems.length === 0;
  const allProofsPass = complete && valueProblems.length === 0;
  const derivedListeningAfter =
    perWorker && perWorker.length > 0
      ? perWorker.some((proof) => proof?.listeningAfter === true)
      : null;
  const derivedClosed =
    perWorker && perWorker.length > 0 ? perWorker.every((proof) => proof?.closed === true) : null;
  const derivedRefused =
    perWorker && perWorker.length > 0
      ? perWorker.every((proof) => proof?.refusedAfterClose === true)
      : null;
  const derivedAllGood = allProofsPass;

  const findings = [];
  pushFinding(findings, 'R14-ARIA-CLEANUP-SUMMARY-01', Boolean(server), {
    cleanupObject: Boolean(cleanup),
    serverObject: Boolean(server),
    perWorkerArray: Array.isArray(server?.perWorker),
  });
  pushFinding(findings, 'R14-ARIA-CLEANUP-PERWORKER-01', complete, {
    problems: shapeProblems,
    perWorkerCount: perWorker ? perWorker.length : 0,
  });
  pushFinding(findings, 'R14-ARIA-CLEANUP-PROOF-01', allProofsPass, {
    problems: valueProblems,
    perWorkerCount: perWorker ? perWorker.length : 0,
  });
  const summaryListening =
    server && typeof server.listeningAfter === 'boolean' ? server.listeningAfter : null;
  pushFinding(
    findings,
    'R14-ARIA-CLEANUP-LISTENING-AFTER-01',
    server !== null &&
      typeof server.listeningAfter === 'boolean' &&
      derivedListeningAfter !== null &&
      server.listeningAfter === derivedListeningAfter,
    {
      observed: server?.listeningAfter ?? null,
      derivedRawAnyListening: derivedListeningAfter,
      perWorkerListeningAfter: perWorker
        ? perWorker.map((proof) => (isPlainObject(proof) ? proof.listeningAfter : null))
        : null,
    },
  );
  pushFinding(
    findings,
    'R14-ARIA-CLEANUP-CLOSED-01',
    server !== null &&
      typeof server.closed === 'boolean' &&
      server.closed === derivedClosed &&
      typeof cleanup?.serverClosed === 'boolean' &&
      cleanup.serverClosed === derivedClosed,
    {
      observed: server?.closed ?? null,
      observedTopLevel: cleanup?.serverClosed ?? null,
      derivedAllClosed: derivedClosed,
    },
  );
  pushFinding(
    findings,
    'R14-ARIA-CLEANUP-REFUSED-01',
    server !== null &&
      typeof server.refusedAfterClose === 'boolean' &&
      server.refusedAfterClose === derivedRefused &&
      typeof cleanup?.serverRefusedAfterClose === 'boolean' &&
      cleanup.serverRefusedAfterClose === derivedRefused,
    {
      observed: server?.refusedAfterClose ?? null,
      observedTopLevel: cleanup?.serverRefusedAfterClose ?? null,
      derivedAllRefused: derivedRefused,
    },
  );
  pushFinding(
    findings,
    'R14-ARIA-CLEANUP-SERVEROK-01',
    server !== null &&
      typeof server.ok === 'boolean' &&
      server.ok === derivedAllGood &&
      typeof cleanup?.serverOk === 'boolean' &&
      cleanup.serverOk === derivedAllGood,
    {
      observed: server?.ok ?? null,
      observedTopLevel: cleanup?.serverOk ?? null,
      derivedAdmission: derivedAllGood,
    },
  );
  const counts = {
    receiptWorkers: Array.isArray(receipt?.workers) ? receipt.workers.length : null,
    summaryWorkers: Number.isInteger(receipt?.summary?.workers) ? receipt.summary.workers : null,
    cleanupWorkers: Number.isInteger(cleanup?.workers) ? cleanup.workers : null,
    cleanupPerWorker: perWorker ? perWorker.length : null,
    serverPerWorker: Array.isArray(receipt?.server?.perWorker)
      ? receipt.server.perWorker.length
      : null,
  };
  const countValues = Object.values(counts);
  const countsAgree =
    countValues.every((value) => Number.isInteger(value) && value === countValues[0]) &&
    countValues[0] >= 1;
  pushFinding(findings, 'R14-ARIA-CLEANUP-COUNT-01', countsAgree, counts);

  return {
    findings,
    derived: {
      summaryListeningAfter: server?.listeningAfter ?? null,
      perWorkerListeningAfter: perWorker
        ? perWorker.map((proof) => (isPlainObject(proof) ? proof.listeningAfter : null))
        : null,
      listeningAfter: derivedListeningAfter,
      closed: derivedClosed,
      refusedAfterClose: derivedRefused,
      serverOk: derivedAllGood,
      allProofsPass,
      complete,
      perWorkerCount: perWorker ? perWorker.length : 0,
    },
  };
}

function deriveNode(receipt, pin, workerContext) {
  const observedRaw = receipt?.runtime?.node;
  const recordedRaw = pin?.node?.recorded;
  const minimumRaw = pin?.node?.minimumMajor;
  const observed = parseVersion(observedRaw);
  const recorded = parseVersion(recordedRaw);
  const minimumMajor = Number.isInteger(minimumRaw) && minimumRaw >= 0 ? minimumRaw : null;
  const workerNodes = (workerContext?.readings || [])
    .filter((reading) => reading.ok && isPlainObject(reading.data))
    .map((reading) => reading.data?.runtime?.node);
  const agreement = workerNodes.length > 0 && workerNodes.every((value) => value === observedRaw);
  const exactMatch = Boolean(observed && recorded && observed.text === recorded.text);
  const minimumSatisfied = Boolean(observed && minimumMajor !== null && observed.major >= minimumMajor);
  return {
    observed: typeof observedRaw === 'string' ? observedRaw : null,
    recorded: typeof recordedRaw === 'string' ? recordedRaw : null,
    minimumMajor,
    observedMajor: observed ? observed.major : null,
    recordedMajor: recorded ? recorded.major : null,
    exactMatch,
    exactRecordedMatch: exactMatch,
    observedMatchesRecorded: exactMatch,
    minimumMajorSatisfied: minimumSatisfied,
    workerObservedNodes: workerNodes,
    workerAgreement: agreement,
    parsed: Boolean(observed && recorded && minimumMajor !== null),
    shapesOk: Boolean(observed && recorded && minimumMajor !== null),
  };
}

function evaluateNode(receipt, pin, workerContext) {
  const node = deriveNode(receipt, pin, workerContext);
  const findings = [];
  pushFinding(findings, 'R14-ARIA-NODE-01', node.shapesOk && node.workerAgreement, {
    observed: node.observed,
    workerObservedNodes: node.workerObservedNodes,
    workerAgreement: node.workerAgreement,
    semver: SEMVER.source,
  });
  pushFinding(findings, 'R14-ARIA-NODE-RECORDED-01', node.shapesOk, {
    observed: node.observed,
    recorded: node.recorded,
    exactMatch: node.exactMatch,
    exactRecordedMatch: node.exactRecordedMatch,
    descriptiveOnly: true,
    recordedRole: 'descriptive',
  });
  pushFinding(findings, 'R14-ARIA-NODE-MINIMUM-01', node.minimumSatisfied, {
    observed: node.observed,
    observedMajor: node.observedMajor,
    minimumMajor: node.minimumMajor,
    minimumMajorSatisfied: node.minimumMajorSatisfied,
  });
  return { findings, node };
}

function loadWorkerContext(receipt) {
  const problems = [];
  const proofProblems = [];
  const readings = [];
  const referenced = [];
  const workers = Array.isArray(receipt?.workers) ? receipt.workers : null;
  if (!workers || workers.length === 0) problems.push('workers:missing_or_empty');
  const cleanupProofs = Array.isArray(receipt?.cleanup?.server?.perWorker)
    ? receipt.cleanup.server.perWorker
    : null;
  const serverProofs = Array.isArray(receipt?.server?.perWorker) ? receipt.server.perWorker : null;

  if (workers) {
    workers.forEach((workerEntry, index) => {
      if (!isPlainObject(workerEntry)) {
        problems.push(`workers[${index}]:not_object`);
        return;
      }
      const file = workerEntry.file;
      if (typeof file !== 'string' || file.length === 0) {
        problems.push(`workers[${index}]:file:missing`);
        return;
      }
      if (isAbsolute(file) || file.split('/').includes('..') || !file.startsWith(WORKER_PREFIX)) {
        problems.push(`workers[${index}]:file:outside_worker_dir`);
        return;
      }
      const name = basename(file);
      const match = WORKER_NAME.exec(name);
      if (!match) {
        problems.push(`workers[${index}]:file:name_pattern`);
        return;
      }
      referenced.push(name);
      const expectedIndex = String(workerEntry.worker?.index ?? '');
      const expectedPid = String(workerEntry.worker?.pid ?? '');
      if (match[1] !== expectedIndex || match[2] !== expectedPid) {
        problems.push(`workers[${index}]:identity_filename_mismatch`);
      }
      const entry = readEntry(file);
      if (!entry.ok) {
        problems.push(`workers[${index}]:file:${entry.reason}`);
        readings.push({ name, ok: false, reason: entry.reason, entry });
        return;
      }
      const load = decodeJson(entry, name);
      if (!load.ok) {
        problems.push(`workers[${index}]:file:${load.reason}`);
        readings.push({ name, ok: false, reason: load.reason, entry });
        return;
      }
      const data = load.value;
      readings.push({ name, ok: true, entry, data });
      const actualIndex = String(data?.worker?.index ?? '');
      const actualPid = String(data?.worker?.pid ?? '');
      if (actualIndex !== expectedIndex || actualPid !== expectedPid) {
        problems.push(`workers[${index}]:worker_file_identity_mismatch`);
      }
      const cleanupProof = cleanupProofs ? cleanupProofs[index] : undefined;
      const serverProof = serverProofs ? serverProofs[index] : undefined;
      if (!cleanupProof || !serverProof) {
        proofProblems.push(`proof[${index}]:receipt_copy_missing`);
        return;
      }
      if (String(serverProof?.worker?.index ?? '') !== expectedIndex ||
          String(serverProof?.worker?.pid ?? '') !== expectedPid) {
        proofProblems.push(`proof[${index}]:server_worker_identity_mismatch`);
      }
      const workerProofText = stableStringify(data?.cleanup?.server);
      if (workerProofText !== stableStringify(cleanupProof)) {
        proofProblems.push(`proof[${index}]:worker_vs_cleanup_mismatch`);
      }
      if (workerProofText !== stableStringify(serverProof?.proof)) {
        proofProblems.push(`proof[${index}]:worker_vs_server_mismatch`);
      }
    });
  }

  let directoryNames = [];
  try {
    directoryNames = readdirSync(resolve(ROOT, WORKER_DIR))
      .filter((name) => name.endsWith('.json'))
      .sort();
  } catch {
    problems.push('workers:directory_unreadable');
  }
  const referencedSorted = [...new Set(referenced)].sort();
  if (referencedSorted.length !== referenced.length) problems.push('workers:duplicate_file');
  if (stableStringify(directoryNames) !== stableStringify(referencedSorted)) {
    problems.push('workers:directory_set_mismatch');
  }
  if (readings.length === 0) proofProblems.push('no_worker_proofs');

  return {
    readings,
    referenced,
    setFinding: finding(
      'R14-ARIA-WORKER-SET-01',
      problems.length === 0 ? 'pass' : 'fail',
      { problems, directoryNames, referenced: referencedSorted },
    ),
    proofFinding: finding(
      'R14-ARIA-WORKER-PROOF-01',
      proofProblems.length === 0 ? 'pass' : 'fail',
      { problems: proofProblems, copiesChecked: ['cleanup.server.perWorker', 'server.perWorker.proof', 'worker.cleanup.server'] },
    ),
  };
}

function evaluateSourceIdentity(receipt, workerContext, manifestEntry, manifestLoad) {
  const problems = [];
  const source = receipt?.source;
  const manifest = receipt?.manifest;
  const sourceInput = Array.isArray(receipt?.inputs)
    ? receipt.inputs.find((item) => item?.kind === 'source' && item?.name === 'source')
    : null;
  const declaredSource = receipt?.sourceSha256;
  const workerSourceShas = (workerContext?.readings || [])
    .filter((reading) => reading.ok && isPlainObject(reading.data))
    .map((reading) => ({
      sourceSha256: reading.data?.sourceSha256,
      sourceObjectSha256: reading.data?.source?.sha256,
      inputSourceSha256: Array.isArray(reading.data?.inputs)
        ? reading.data.inputs.find((item) => item?.kind === 'source' && item?.name === 'source')
            ?.actualSha256
        : null,
    }));

  if (declaredSource !== ANCHORS.producerSourceSha256) problems.push('receipt.sourceSha256');
  if (source?.sha256 !== ANCHORS.producerSourceSha256) problems.push('receipt.source.sha256');
  if (source?.path !== SOURCE_PATHS.producer) problems.push('receipt.source.path');
  if (source?.specSha256 !== ANCHORS.specSha256) problems.push('receipt.source.specSha256');
  if (source?.configSha256 !== ANCHORS.configSha256) problems.push('receipt.source.configSha256');
  if (!sourceInput || sourceInput.actualSha256 !== ANCHORS.producerSourceSha256) {
    problems.push('receipt.inputs.source.actualSha256');
  }
  if (manifest?.sha256 !== ANCHORS.manifestSha256) problems.push('receipt.manifest.sha256');
  if (manifest?.path !== SOURCE_PATHS.manifest) problems.push('receipt.manifest.path');
  if (manifestEntry && manifestEntry.ok && manifestEntry.sha256 !== ANCHORS.manifestSha256) {
    problems.push('manifest.currentSha256');
  }
  if (!manifestEntry || !manifestEntry.ok) problems.push('manifest:unreadable');
  if (!manifestLoad || !manifestLoad.ok) problems.push('manifest:malformed');
  for (const workerSource of workerSourceShas) {
    if (workerSource.sourceSha256 !== ANCHORS.producerSourceSha256) {
      problems.push('worker.sourceSha256');
    }
    if (workerSource.sourceObjectSha256 !== ANCHORS.producerSourceSha256) {
      problems.push('worker.source.sha256');
    }
    if (workerSource.inputSourceSha256 !== ANCHORS.producerSourceSha256) {
      problems.push('worker.inputs.source.actualSha256');
    }
  }

  const specEntry = readEntry(SOURCE_PATHS.spec);
  const configEntry = readEntry(SOURCE_PATHS.config);
  if (!specEntry.ok) problems.push(`spec:${specEntry.reason}`);
  else if (specEntry.sha256 !== ANCHORS.specSha256) problems.push('spec.currentSha256');
  if (!configEntry.ok) problems.push(`config:${configEntry.reason}`);
  else if (configEntry.sha256 !== ANCHORS.configSha256) problems.push('config.currentSha256');

  return finding('R14-ARIA-SOURCE-01', problems.length === 0 ? 'pass' : 'fail', {
    problems: [...new Set(problems)],
    declaredSource,
    specSha256: specEntry.ok ? specEntry.sha256 : null,
    configSha256: configEntry.ok ? configEntry.sha256 : null,
    manifestSha256: manifestEntry?.ok ? manifestEntry.sha256 : null,
    workerSourceBindings: workerSourceShas,
  });
}

function evaluateManifest(receipt, workerContext, manifestLoad) {
  const problems = [];
  if (!manifestLoad || !manifestLoad.ok) {
    problems.push('manifest:malformed');
    return finding('R14-ARIA-MANIFEST-01', 'fail', { problems });
  }
  const manifest = manifestLoad.value;
  const manifestCases = Array.isArray(manifest?.cases)
    ? manifest.cases.map((record) => record?.name).filter((name) => typeof name === 'string')
    : [];
  if (manifestCases.length === 0) problems.push('manifest:cases_missing');
  const duplicateManifest = manifestCases.filter((name, index) => manifestCases.indexOf(name) !== index);
  if (duplicateManifest.length > 0) problems.push('manifest:duplicate_cases');
  const workerCases = [];
  for (const reading of workerContext?.readings || []) {
    if (!reading.ok || !isPlainObject(reading.data)) continue;
    if (!Array.isArray(reading.data?.cases)) {
      problems.push(`${reading.name}:cases_missing`);
      continue;
    }
    for (const record of reading.data.cases) {
      if (typeof record?.name === 'string') workerCases.push(record.name);
    }
  }
  const duplicateWorker = workerCases.filter((name, index) => workerCases.indexOf(name) !== index);
  if (duplicateWorker.length > 0) problems.push('worker:duplicate_cases');
  const manifestSet = [...new Set(manifestCases)].sort();
  const workerSet = [...new Set(workerCases)].sort();
  if (stableStringify(manifestSet) !== stableStringify(workerSet)) {
    problems.push('worker_cases_vs_manifest');
  }
  if (receipt?.summary?.cases?.expected !== manifestCases.length) {
    problems.push('receipt.summary.cases.expected');
  }
  return finding('R14-ARIA-MANIFEST-01', problems.length === 0 ? 'pass' : 'fail', {
    problems,
    manifestCases: manifestSet,
    workerCases: workerSet,
  });
}

function evaluatePin(receipt, pin, pinEntry) {
  const problems = [];
  if (!pinEntry?.ok) problems.push(`pin:${pinEntry?.reason || 'unreadable'}`);
  if (!isPlainObject(pin)) problems.push('pin:not_object');
  if (typeof pin?.schema !== 'string') problems.push('pin.schema');
  if (typeof pin?.wave !== 'string') problems.push('pin.wave');
  for (const key of ['playwrightTest', 'playwright', 'playwrightCore']) {
    if (typeof pin?.[key] !== 'string') problems.push(`pin.${key}`);
  }
  for (const key of ['revision', 'version', 'executableSuffix', 'executableSha256']) {
    if (typeof pin?.chromium?.[key] !== 'string') problems.push(`pin.chromium.${key}`);
  }
  if (!Number.isInteger(pin?.chromium?.bytes)) problems.push('pin.chromium.bytes');
  if (typeof pin?.node?.recorded !== 'string') problems.push('pin.node.recorded');
  if (!Number.isInteger(pin?.node?.minimumMajor)) problems.push('pin.node.minimumMajor');
  if (pinEntry?.ok && receipt?.runtime?.pinned?.pinSha256 !== pinEntry.sha256) {
    problems.push('receipt.runtime.pinned.pinSha256');
  }
  if (pinEntry?.ok && receipt?.runtime?.pinned?.pinPath !== DEFAULT_PIN) {
    problems.push('receipt.runtime.pinned.pinPath');
  }
  if (!isPlainObject(receipt?.pin)) {
    problems.push('receipt.pin:missing');
  } else if (stableStringify(pinProjection(receipt.pin)) !== stableStringify(pinProjection(pin))) {
    problems.push('receipt.pin:differs_from_pin_file');
  }
  return finding('R14-ARIA-PIN-01', problems.length === 0 ? 'pass' : 'fail', {
    problems: [...new Set(problems)],
    pinSha256: pinEntry?.ok ? pinEntry.sha256 : null,
    advertisedPinSha256: receipt?.runtime?.pinned?.pinSha256 ?? null,
  });
}

function evaluateAnchors(receiptEntry, pinEntry, pin, receipt, workerContext) {
  const problems = [];
  const canonicalReceipt = receiptEntry?.ok && sameAbs(receiptEntry.abs, resolve(ROOT, DEFAULT_RECEIPT));
  const canonicalPin = pinEntry?.ok && sameAbs(pinEntry.abs, resolve(ROOT, DEFAULT_PIN));
  if (canonicalReceipt && receiptEntry.sha256 !== ANCHORS.receiptSha256) {
    problems.push('receipt_sha256');
  }
  if (canonicalPin && pinEntry.sha256 !== ANCHORS.pinSha256) problems.push('pin_sha256');
  if (receiptEntry?.ok && receiptEntry.sha256 === ANCHORS.receiptSha256 && !canonicalReceipt) {
    problems.push('anchored_receipt_bytes_at_noncanonical_path');
  }
  if (pinEntry?.ok && pinEntry.sha256 === ANCHORS.pinSha256 && !canonicalPin) {
    problems.push('anchored_pin_bytes_at_noncanonical_path');
  }
  for (const reading of workerContext?.readings || []) {
    if (!reading.ok || !reading.entry?.ok) continue;
    const expected = ANCHORS.workers[reading.name];
    if (!expected) problems.push(`worker:unanchored:${reading.name}`);
    else if (reading.entry.sha256 !== expected) problems.push(`worker_sha256:${reading.name}`);
  }
  if (canonicalReceipt || canonicalPin) {
    if (!canonicalReceipt) problems.push('canonical_pair:receipt_not_canonical');
    if (!canonicalPin) problems.push('canonical_pair:pin_not_canonical');
    if (pinEntry?.ok && receipt?.runtime?.pinned?.pinSha256 !== pinEntry.sha256) {
      problems.push('receipt_pin_binding');
    }
  }
  return finding('R14-ARIA-ANCHOR-01', problems.length === 0 ? 'pass' : 'fail', {
    problems: [...new Set(problems)],
    canonicalReceipt,
    canonicalPin,
    receiptSha256: receiptEntry?.ok ? receiptEntry.sha256 : null,
    pinSha256: pinEntry?.ok ? pinEntry.sha256 : null,
    anchors: {
      receiptSha256: ANCHORS.receiptSha256,
      pinSha256: ANCHORS.pinSha256,
      producerSourceSha256: ANCHORS.producerSourceSha256,
      specSha256: ANCHORS.specSha256,
      configSha256: ANCHORS.configSha256,
      manifestSha256: ANCHORS.manifestSha256,
      workers: ANCHORS.workers,
    },
  });
}

function prepareContext(receiptPathText, pinPathText) {
  const receiptRead = readJson(receiptPathText);
  const pinRead = readJson(pinPathText);
  const receipt = receiptRead.load.ok ? receiptRead.load.value : null;
  const pin = pinRead.load.ok ? pinRead.load.value : null;
  const manifestRead = readJson(DEFAULT_MANIFEST);
  const workerContext = loadWorkerContext(receipt);
  const sourceFinding = evaluateSourceIdentity(
    receipt,
    workerContext,
    manifestRead.entry,
    manifestRead.load,
  );
  const manifestFinding = evaluateManifest(receipt, workerContext, manifestRead.load);
  const pinFinding = evaluatePin(receipt, pin, pinRead.entry);
  const anchorFinding = evaluateAnchors(
    receiptRead.entry,
    pinRead.entry,
    pin,
    receipt,
    workerContext,
  );
  const inputFinding = finding(
    'R14-ARIA-INPUT-01',
    receiptRead.entry.ok && receiptRead.load.ok && isPlainObject(receipt?.runtime) ? 'pass' : 'fail',
    {
      problems: [
        ...(receiptRead.entry.ok ? [] : [`receipt:${receiptRead.entry.reason}`]),
        ...(receiptRead.load.ok ? [] : [`receipt:${receiptRead.load.reason}`]),
        ...(isPlainObject(receipt?.runtime) ? [] : ['receipt.runtime:missing']),
      ],
      receiptPath: receiptPathText,
      receiptSha256: receiptRead.entry.ok ? receiptRead.entry.sha256 : null,
      receiptBytes: receiptRead.entry.ok ? receiptRead.entry.bytesLength : null,
    },
  );
  return {
    receiptRead,
    pinRead,
    receipt,
    pin,
    inputFinding,
    pinFinding,
    anchorFinding,
    sourceFinding,
    manifestFinding,
    workerContext,
  };
}

function evaluateAll(receipt, pin, context) {
  const cleanup = evaluateCleanup(receipt);
  const node = evaluateNode(receipt, pin, context.workerContext);
  const findings = [
    context.inputFinding,
    context.pinFinding,
    context.anchorFinding,
    context.sourceFinding,
    context.manifestFinding,
    context.workerContext.setFinding,
    context.workerContext.proofFinding,
    ...cleanup.findings,
    ...node.findings,
  ];
  return {
    findings,
    derived: { cleanup: cleanup.derived, node: node.node },
    ok: findings.every((entry) => entry.status === 'pass'),
  };
}

function applyCorrection(receipt, corrected) {
  const copy = clone(receipt);
  if (isPlainObject(copy?.cleanup?.server)) copy.cleanup.server.listeningAfter = corrected;
  return copy;
}

function evaluateSidecar(pathText, context, preEvaluation) {
  const findings = [];
  const sidecarRead = readJson(pathText);
  const sidecar = sidecarRead.load.ok ? sidecarRead.load.value : null;
  const loadOk = sidecarRead.entry.ok && sidecarRead.load.ok;
  pushFinding(findings, 'R14-ARIA-SIDECAR-01', loadOk, {
    problems: loadOk
      ? []
      : [
          ...(sidecarRead.entry.ok ? [] : [`sidecar:${sidecarRead.entry.reason}`]),
          ...(sidecarRead.load.ok ? [] : [`sidecar:${sidecarRead.load.reason}`]),
        ],
    path: pathText,
    sha256: sidecarRead.entry.ok ? sidecarRead.entry.sha256 : null,
    bytes: sidecarRead.entry.ok ? sidecarRead.entry.bytesLength : null,
  });

  const result = {
    sidecarRead,
    sidecar,
    findings,
    accepted: false,
    postEvaluation: null,
    sidecarFindings: findings,
  };
  if (!loadOk) {
    findings.push(
      finding('R14-ARIA-SIDECAR-ACCEPTED-01', 'fail', { accepted: false, reason: 'sidecar_unreadable' }),
    );
    return result;
  }

  const proofs = Array.isArray(context.receipt?.cleanup?.server?.perWorker)
    ? context.receipt.cleanup.server.perWorker
    : [];
  const cleanupDerived = preEvaluation.derived.cleanup;
  const node = preEvaluation.derived.node;
  const observedCurrent = context.receipt?.cleanup?.server?.listeningAfter;
  const proofSetSha256 = sha256(stableStringify(proofs));
  const proofDigests = proofs.map((proof, index) => ({
    index,
    sha256: sha256(stableStringify(proof)),
  }));

  const schemaOk =
    sidecar?.schema === SIDECAR_SCHEMA ||
    (typeof sidecar?.kind === 'string' &&
      /metadata/i.test(sidecar.kind) &&
      /correct/i.test(sidecar.kind));
  pushFinding(findings, 'R14-ARIA-SIDECAR-SCHEMA-01', schemaOk, {
    schema: sidecar?.schema ?? null,
    kind: sidecar?.kind ?? null,
    expected: SIDECAR_SCHEMA,
  });

  const bindingProblems = [];
  const original = isPlainObject(sidecar?.original) ? sidecar.original : {};
  const source = isPlainObject(sidecar?.source) ? sidecar.source : {};
  const binding = isPlainObject(sidecar?.binding) ? sidecar.binding : {};
  const receiptShaCandidates = [
    original.receipt?.sha256,
    source.receipt?.sha256,
    binding.receiptSha256,
    binding.receipt?.sha256,
  ].filter((value) => value !== undefined);
  const pinShaCandidates = [
    original.pin?.sha256,
    source.pin?.sha256,
    binding.pinSha256,
    binding.pin?.sha256,
  ].filter((value) => value !== undefined);
  if (!context.receiptRead.entry.ok) bindingProblems.push('receipt_entry_unreadable');
  if (!context.pinRead.entry.ok) bindingProblems.push('pin_entry_unreadable');
  if (receiptShaCandidates.length === 0) bindingProblems.push('receipt_sha256_missing');
  if (pinShaCandidates.length === 0) bindingProblems.push('pin_sha256_missing');
  for (const candidate of receiptShaCandidates) {
    if (candidate !== context.receiptRead.entry.sha256) bindingProblems.push('receipt_sha256');
  }
  for (const candidate of pinShaCandidates) {
    if (candidate !== context.pinRead.entry.sha256) bindingProblems.push('pin_sha256');
  }
  if (typeof original.receipt?.path !== 'string' || original.receipt.path.length === 0) {
    bindingProblems.push('original.receipt.path');
  }
  if (typeof original.pin?.path !== 'string' || original.pin.path.length === 0) {
    bindingProblems.push('original.pin.path');
  }
  if (original.receipt?.bytes !== undefined && original.receipt.bytes !== context.receiptRead.entry.bytesLength) {
    bindingProblems.push('original.receipt.bytes');
  }
  if (original.pin?.bytes !== undefined && original.pin.bytes !== context.pinRead.entry.bytesLength) {
    bindingProblems.push('original.pin.bytes');
  }
  if (binding.proofSetSha256 !== proofSetSha256) bindingProblems.push('proofSetSha256');
  if (!Array.isArray(binding.perWorker) || binding.perWorker.length !== proofDigests.length) {
    bindingProblems.push('binding.perWorker.length');
  } else {
    binding.perWorker.forEach((entry, index) => {
      if (entry?.index !== index || entry?.sha256 !== proofDigests[index].sha256) {
        bindingProblems.push(`binding.perWorker[${index}]`);
      }
    });
  }
  if (binding.producerSourceSha256 !== ANCHORS.producerSourceSha256) {
    bindingProblems.push('binding.producerSourceSha256');
  }
  if (source.producer?.sourceSha256 !== ANCHORS.producerSourceSha256) {
    bindingProblems.push('source.producer.sourceSha256');
  }
  pushFinding(findings, 'R14-ARIA-SIDECAR-BINDING-01', bindingProblems.length === 0, {
    problems: [...new Set(bindingProblems)],
    receiptSha256: context.receiptRead.entry.sha256 ?? null,
    pinSha256: context.pinRead.entry.sha256 ?? null,
    proofSetSha256,
    proofDigests,
  });

  const correctionProblems = [];
  const corrections = Array.isArray(sidecar?.corrections) ? sidecar.corrections : null;
  if (!corrections || corrections.length !== 1) {
    correctionProblems.push('corrections:not_exactly_one');
  }
  const correction = corrections?.[0];
  if (correction?.path !== 'cleanup.server.listeningAfter') {
    correctionProblems.push('corrections[0].path');
  }
  if (typeof correction?.from !== 'boolean' || correction.from !== observedCurrent) {
    correctionProblems.push('corrections[0].from');
  }
  if (typeof correction?.to !== 'boolean' || correction.to !== cleanupDerived.listeningAfter) {
    correctionProblems.push('corrections[0].to');
  }
  if (correction?.to !== false) correctionProblems.push('corrections[0].to_not_false');
  if (correction?.value !== undefined && correction.value !== correction.to) {
    correctionProblems.push('corrections[0].value');
  }
  if (correction?.supportingProofs !== proofs.length) {
    correctionProblems.push('corrections[0].supportingProofs');
  }
  const mirror = isPlainObject(sidecar?.correction) ? sidecar.correction : null;
  if (mirror?.field !== 'cleanup.server.listeningAfter') correctionProblems.push('correction.field');
  if (mirror?.pointer !== '/cleanup/server/listeningAfter') correctionProblems.push('correction.pointer');
  if (mirror?.observed !== correction?.from) correctionProblems.push('correction.observed');
  if (mirror?.corrected !== correction?.to) correctionProblems.push('correction.corrected');
  if (mirror?.derived !== cleanupDerived.listeningAfter) correctionProblems.push('correction.derived');
  if (mirror?.supportingProofs !== proofs.length) correctionProblems.push('correction.supportingProofs');
  if (!cleanupDerived.allProofsPass) correctionProblems.push('proofs_do_not_all_pass');
  if (cleanupDerived.complete !== true) correctionProblems.push('proofs_not_complete');
  if (cleanupDerived.listeningAfter !== false) correctionProblems.push('derived_not_false');
  pushFinding(findings, 'R14-ARIA-SIDECAR-CORRECTION-01', correctionProblems.length === 0, {
    problems: [...new Set(correctionProblems)],
    observed: observedCurrent ?? null,
    derived: cleanupDerived.listeningAfter,
    supportingProofs: proofs.length,
  });

  const nodeProblems = [];
  const sidecarNode = isPlainObject(sidecar?.node) ? sidecar.node : null;
  if (!sidecarNode) nodeProblems.push('node:missing');
  if (sidecarNode?.observed !== node.observed) nodeProblems.push('node.observed');
  if (sidecarNode?.recorded !== node.recorded) nodeProblems.push('node.recorded');
  if (sidecarNode?.minimumMajor !== node.minimumMajor) nodeProblems.push('node.minimumMajor');
  if (sidecarNode?.exactMatch !== node.exactMatch) nodeProblems.push('node.exactMatch');
  if (sidecarNode?.exactRecordedMatch !== undefined &&
      sidecarNode.exactRecordedMatch !== node.exactMatch) {
    nodeProblems.push('node.exactRecordedMatch');
  }
  if (sidecarNode?.observedMatchesRecorded !== undefined &&
      sidecarNode.observedMatchesRecorded !== node.observedMatchesRecorded) {
    nodeProblems.push('node.observedMatchesRecorded');
  }
  if (sidecarNode?.minimumMajorSatisfied !== node.minimumMajorSatisfied) {
    nodeProblems.push('node.minimumMajorSatisfied');
  }
  if (sidecarNode?.descriptiveOnly !== true) nodeProblems.push('node.descriptiveOnly');
  if (sidecarNode?.recordedRole !== 'descriptive' && sidecarNode?.recordedIsDescriptive !== true) {
    nodeProblems.push('node.recordedRole');
  }
  pushFinding(findings, 'R14-ARIA-SIDECAR-NODE-CLAIM-01', nodeProblems.length === 0, {
    problems: [...new Set(nodeProblems)],
    computed: node,
  });

  const provenanceProblems = [];
  if (sidecar?.derivedFromHistoricalRuntime !== true) provenanceProblems.push('derivedFromHistoricalRuntime');
  if (sidecar?.browserExecuted !== false) provenanceProblems.push('browserExecuted');
  if (sidecar?.execution?.browser !== false) provenanceProblems.push('execution.browser');
  if (sidecar?.execution?.browserExecuted !== undefined &&
      sidecar.execution.browserExecuted !== false) provenanceProblems.push('execution.browserExecuted');
  if (sidecar?.execution?.newBrowserRun !== undefined &&
      sidecar.execution.newBrowserRun !== false) provenanceProblems.push('execution.newBrowserRun');
  if (sidecar?.provenance?.derivedFromHistoricalRuntime !== true) {
    provenanceProblems.push('provenance.derivedFromHistoricalRuntime');
  }
  if (sidecar?.provenance?.newBrowserExecution !== false) {
    provenanceProblems.push('provenance.newBrowserExecution');
  }
  if (sidecar?.provenance?.originalReceiptRewrittenForbidden !== true) {
    provenanceProblems.push('provenance.originalReceiptRewrittenForbidden');
  }
  if (typeof sidecar?.provenance?.note !== 'string' || sidecar.provenance.note.length === 0) {
    provenanceProblems.push('provenance.note');
  }
  pushFinding(findings, 'R14-ARIA-SIDECAR-PROVENANCE-01', provenanceProblems.length === 0, {
    problems: provenanceProblems,
  });

  const qualificationProblems = [];
  if (sidecar?.qualified !== true) qualificationProblems.push('qualified');
  if (sidecar?.status !== 'qualified') qualificationProblems.push('status');
  if (sidecar?.qualification?.qualified !== true) qualificationProblems.push('qualification.qualified');
  if (sidecar?.qualification?.proofCount !== proofs.length) {
    qualificationProblems.push('qualification.proofCount');
  }
  if (sidecar?.qualification?.allProofsSupportCorrection !== true) {
    qualificationProblems.push('qualification.allProofsSupportCorrection');
  }
  if (sidecar?.qualification?.allProofsComplete !== true) {
    qualificationProblems.push('qualification.allProofsComplete');
  }
  if (sidecar?.qualification?.everyProofNotListeningAfter !== true) {
    qualificationProblems.push('qualification.everyProofNotListeningAfter');
  }
  pushFinding(
    findings,
    'R14-ARIA-SIDECAR-QUALIFICATION-01',
    qualificationProblems.length === 0,
    { problems: qualificationProblems, proofCount: proofs.length },
  );

  const postEvaluation = evaluateAll(
    applyCorrection(context.receipt, correction?.to ?? cleanupDerived.listeningAfter),
    context.pin,
    context,
  );
  const residualFailures = postEvaluation.findings
    .filter((entry) => entry.status !== 'pass')
    .map((entry) => entry.id);
  pushFinding(findings, 'R14-ARIA-SIDECAR-RESIDUAL-01', residualFailures.length === 0, {
    residualFailures,
  });

  const accepted =
    findings.every((entry) => entry.status === 'pass') && postEvaluation.ok === true;
  findings.push(
    finding('R14-ARIA-SIDECAR-ACCEPTED-01', accepted ? 'pass' : 'fail', {
      accepted,
      correctedField: 'cleanup.server.listeningAfter',
      correctedValue: correction?.to ?? null,
      residualFailures,
    }),
  );
  result.accepted = accepted;
  result.postEvaluation = postEvaluation;
  result.sidecarFindings = findings;
  return result;
}

function runCheck({ receiptPathText, pinPathText, sidecarPathText }) {
  const context = prepareContext(receiptPathText, pinPathText);
  const preEvaluation = evaluateAll(context.receipt, context.pin, context);
  if (!sidecarPathText) {
    return {
      ok: preEvaluation.ok,
      exit: preEvaluation.ok ? 0 : 1,
      context,
      preEvaluation,
      postEvaluation: null,
      sidecarResult: null,
      findings: preEvaluation.findings,
      accepted: false,
    };
  }
  const sidecarResult = evaluateSidecar(sidecarPathText, context, preEvaluation);
  const postEvaluation = sidecarResult.postEvaluation ?? preEvaluation;
  const findings = [...postEvaluation.findings, ...sidecarResult.findings];
  const ok =
    sidecarResult.accepted &&
    postEvaluation.ok === true &&
    sidecarResult.findings.every((entry) => entry.status === 'pass');
  return {
    ok,
    exit: ok ? 0 : 1,
    context,
    preEvaluation,
    postEvaluation: sidecarResult.postEvaluation,
    sidecarResult,
    findings,
    accepted: sidecarResult.accepted,
  };
}

function repoRelative(abs) {
  const rel = relative(ROOT, abs);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) return abs;
  return rel;
}

function buildSidecar({ context, preEvaluation, receiptLabel, pinLabel }) {
  const receipt = context.receipt;
  const pin = context.pin;
  const proofs = receipt.cleanup.server.perWorker;
  const cleanupDerived = preEvaluation.derived.cleanup;
  const node = preEvaluation.derived.node;
  const observed = receipt.cleanup.server.listeningAfter;
  const corrected = cleanupDerived.listeningAfter;
  const proofDigests = proofs.map((proof, index) => ({
    index,
    sha256: sha256(stableStringify(proof)),
  }));
  const proofSetSha256 = sha256(stableStringify(proofs));
  const receiptMeta = {
    path: receiptLabel,
    sha256: context.receiptRead.entry.sha256,
    bytes: context.receiptRead.entry.bytesLength,
  };
  const pinMeta = {
    path: pinLabel,
    sha256: context.pinRead.entry.sha256,
    bytes: context.pinRead.entry.bytesLength,
  };
  const allValuesOk = cleanupDerived.allProofsPass === true;
  return {
    schema: SIDECAR_SCHEMA,
    kind: 'cleanup-and-node-metadata-correction',
    wave: receipt.wave ?? 'tabi-round-13-w1',
    claim: receipt.claim ?? 'C2',
    qualified: true,
    status: 'qualified',
    browserExecuted: false,
    derivedFromHistoricalRuntime: true,
    execution: {
      browser: false,
      browserExecuted: false,
      newBrowserRun: false,
      source: 'historical-static-bytes',
    },
    provenance: {
      derivedFromHistoricalRuntime: true,
      newBrowserExecution: false,
      originalReceiptRewrittenForbidden: true,
      note:
        'Derived only from the committed historical receipt, pin, manifest, and worker bytes; ' +
        'no browser was launched and no historical file is rewritten.',
    },
    original: { receipt: receiptMeta, pin: pinMeta },
    source: {
      receipt: receiptMeta,
      pin: pinMeta,
      producer: {
        path: SOURCE_PATHS.producer,
        sourceSha256: ANCHORS.producerSourceSha256,
        role: 'historical producer identity recorded by the receipt',
      },
      spec: {
        path: SOURCE_PATHS.spec,
        sha256: ANCHORS.specSha256,
      },
      manifest: {
        path: SOURCE_PATHS.manifest,
        sha256: ANCHORS.manifestSha256,
      },
    },
    binding: {
      receiptSha256: context.receiptRead.entry.sha256,
      pinSha256: context.pinRead.entry.sha256,
      proofSetSha256,
      perWorker: proofDigests,
      producerSourceSha256: ANCHORS.producerSourceSha256,
    },
    corrections: [
      {
        path: 'cleanup.server.listeningAfter',
        from: observed,
        to: corrected,
        value: corrected,
        derived: corrected,
        supportingProofs: proofs.length,
        rule:
          'raw post-close state is true iff any complete nonempty perWorker proof reports ' +
          'listeningAfter===true; false only when every proof reports false',
      },
    ],
    correction: {
      field: 'cleanup.server.listeningAfter',
      pointer: '/cleanup/server/listeningAfter',
      observed,
      corrected,
      derived: corrected,
      supportingProofs: proofs.length,
      rule:
        'raw post-close state is true iff any complete nonempty perWorker proof reports ' +
        'listeningAfter===true; false only when every proof reports false',
    },
    node: {
      observed: node.observed,
      recorded: node.recorded,
      exactMatch: node.exactMatch,
      exactRecordedMatch: node.exactRecordedMatch,
      observedMatchesRecorded: node.observedMatchesRecorded,
      minimumMajor: node.minimumMajor,
      minimumMajorSatisfied: node.minimumMajorSatisfied,
      descriptiveOnly: true,
      recordedRole: 'descriptive',
      recordedIsDescriptive: true,
      note:
        `observed Node ${node.observed} is not the exact recorded ${node.recorded} pin; ` +
        `node.recorded is descriptive metadata and node.minimumMajor=${node.minimumMajor} ` +
        'is the enforced floor',
    },
    cleanup: {
      perWorkerCount: proofs.length,
      allClosed: cleanupDerived.closed,
      allRefusedAfterClose: cleanupDerived.refusedAfterClose,
      allNotListeningAfter: allValuesOk,
      derivedListeningAfter: corrected,
      summaryServerOk: cleanupDerived.serverOk,
    },
    qualification: {
      qualified: true,
      proofCount: proofs.length,
      allProofsComplete: cleanupDerived.complete,
      allProofsSupportCorrection: allValuesOk,
      everyProofListensBefore: allValuesOk,
      everyProofClosed: cleanupDerived.closed === true,
      everyProofRefusedAfterClose: cleanupDerived.refusedAfterClose === true,
      everyProofNotListeningAfter: allValuesOk,
    },
  };
}

function resolveOutPath(outArg) {
  if (typeof outArg !== 'string' || outArg.length === 0) {
    return { ok: false, reason: 'out:missing' };
  }
  if (isAbsolute(outArg)) return { ok: false, reason: 'out:absolute_refused' };
  const evidenceAbs = resolve(ROOT, EVIDENCE_DIR);
  const abs = resolve(ROOT, outArg);
  if (abs !== evidenceAbs && !abs.startsWith(`${evidenceAbs}${sep}`)) {
    return { ok: false, reason: 'out:outside_evidence_dir' };
  }
  const rel = relative(evidenceAbs, abs);
  if (rel.length === 0 || rel.split(sep).some((segment) => segment === '..' || segment.length === 0)) {
    return { ok: false, reason: 'out:invalid_relative' };
  }
  let parentStat;
  try {
    parentStat = lstatSync(dirname(abs));
  } catch {
    return { ok: false, reason: 'out:parent_missing' };
  }
  if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) {
    return { ok: false, reason: 'out:parent_not_plain_directory' };
  }
  let existing = null;
  try {
    existing = lstatSync(abs);
  } catch (error) {
    if (error?.code !== 'ENOENT') return { ok: false, reason: 'out:unreadable' };
  }
  if (existing) {
    if (existing.isSymbolicLink()) return { ok: false, reason: 'out:symlink_refused' };
    if (!existing.isFile()) return { ok: false, reason: 'out:not_regular' };
  }
  return { ok: true, abs, rel };
}

function runDerive({ receiptPathText, pinPathText, outArg }) {
  const out = resolveOutPath(outArg);
  if (!out.ok) {
    return {
      ok: false,
      exit: 2,
      findings: [finding('R14-ARIA-DERIVE-OUT-01', 'fail', { problems: [out.reason] })],
      out: null,
      sidecar: null,
    };
  }
  const context = prepareContext(receiptPathText, pinPathText);
  const preEvaluation = evaluateAll(context.receipt, context.pin, context);
  const failing = preEvaluation.findings.filter((entry) => entry.status !== 'pass');
  const failures = failing.map((entry) => entry.id);
  const expectedFailureSet = ['R14-ARIA-CLEANUP-LISTENING-AFTER-01'];
  const onlyContradiction =
    failures.length === expectedFailureSet.length &&
    expectedFailureSet.every((id) => failures.includes(id));
  const shapeOk =
    onlyContradiction &&
    context.receipt?.verdict === 'pass' &&
    preEvaluation.derived.cleanup.complete === true &&
    preEvaluation.derived.cleanup.allProofsPass === true &&
    preEvaluation.derived.cleanup.listeningAfter === false;
  if (!shapeOk) {
    return {
      ok: false,
      exit: 1,
      findings: [
        ...preEvaluation.findings,
        finding('R14-ARIA-DERIVE-REFUSED-01', 'fail', {
          failures,
          expectedFailures: expectedFailureSet,
          verdict: context.receipt?.verdict ?? null,
          cleanup: preEvaluation.derived.cleanup,
        }),
      ],
      out: null,
      sidecar: null,
    };
  }
  const receiptLabel = repoRelative(context.receiptRead.entry.abs);
  const pinLabel = repoRelative(context.pinRead.entry.abs);
  const sidecar = buildSidecar({ context, preEvaluation, receiptLabel, pinLabel });
  const bytes = Buffer.from(stableStringify(sidecar), 'utf8');
  const sidecarSha256 = sha256(bytes);
  let verification = null;
  const tmpPath = `${out.abs}.derive-${process.pid}`;
  try {
    writeFileSync(tmpPath, stableStringify(sidecar), { flag: 'wx' });
    const sidecarResult = evaluateSidecar(tmpPath, context, preEvaluation);
    const post = sidecarResult.postEvaluation ?? preEvaluation;
    verification = {
      ok: sidecarResult.accepted && post.ok === true,
      exit: sidecarResult.accepted && post.ok === true ? 0 : 1,
      findings: [...post.findings, ...sidecarResult.findings],
    };
  } finally {
    try {
      rmSync(tmpPath, { force: true });
    } catch {
      // The temporary sidecar is removed best-effort; the guarded destination is untouched.
    }
  }
  if (!verification || !verification.ok || verification.exit !== 0) {
    return {
      ok: false,
      exit: 1,
      findings: [
        ...preEvaluation.findings,
        ...(verification?.findings || []),
        finding('R14-ARIA-DERIVE-REFUSED-01', 'fail', {
          reason: 'derived_sidecar_did_not_validate',
        }),
      ],
      out: null,
      sidecar,
    };
  }
  let existingBytes = null;
  try {
    existingBytes = readFileSync(out.abs);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      return {
        ok: false,
        exit: 2,
        findings: [finding('R14-ARIA-DERIVE-OUT-01', 'fail', { problems: ['out:unreadable'] })],
        out: null,
        sidecar: null,
      };
    }
  }
  if (existingBytes) {
    const byteIdentical = Buffer.compare(existingBytes, bytes) === 0;
    let canonicalIdentical = false;
    try {
      const parsedExisting = JSON.parse(existingBytes.toString('utf8'));
      canonicalIdentical =
        Buffer.compare(Buffer.from(stableStringify(parsedExisting), 'utf8'), bytes) === 0;
    } catch {
      canonicalIdentical = false;
    }
    if (byteIdentical || canonicalIdentical) {
      return {
        ok: true,
        exit: 0,
        findings: verification.findings,
        out: {
          path: repoRelative(out.abs),
          sha256: sidecarSha256,
          bytes: bytes.length,
          wrote: false,
          identical: true,
          byteIdentical,
          canonicalIdentical,
        },
        sidecar,
      };
    }
    return {
      ok: false,
      exit: 2,
      findings: [
        finding('R14-ARIA-DERIVE-OUT-01', 'fail', {
          problems: ['out:existing_bytes_differ_refusing_overwrite'],
          existingSha256: sha256(existingBytes),
          derivedSha256: sidecarSha256,
        }),
      ],
      out: null,
      sidecar: null,
    };
  }
  try {
    writeFileSync(out.abs, bytes, { flag: 'wx' });
  } catch (error) {
    return {
      ok: false,
      exit: 2,
      findings: [
        finding('R14-ARIA-DERIVE-OUT-01', 'fail', {
          problems: ['out:write_failed'],
          detail: String(error?.code || error?.message || error),
        }),
      ],
      out: null,
      sidecar: null,
    };
  }
  return {
    ok: true,
    exit: 0,
    findings: verification.findings,
    out: {
      path: repoRelative(out.abs),
      sha256: sidecarSha256,
      bytes: bytes.length,
      wrote: true,
      identical: true,
    },
    sidecar,
  };
}

function runWitness({ receiptPathText, pinPathText, sidecarPathText }) {
  const beforeReceipt = readEntry(receiptPathText);
  const beforePin = readEntry(pinPathText);
  const red = runCheck({ receiptPathText, pinPathText, sidecarPathText: null });
  if (!sidecarPathText) {
    const sidecarEntry = readEntry(DEFAULT_SIDECAR);
    if (sidecarEntry.ok) sidecarPathText = DEFAULT_SIDECAR;
  }
  const green = sidecarPathText
    ? runCheck({ receiptPathText, pinPathText, sidecarPathText })
    : null;
  const afterReceipt = readEntry(receiptPathText);
  const afterPin = readEntry(pinPathText);
  const originalUnchanged =
    beforeReceipt.ok &&
    afterReceipt.ok &&
    beforePin.ok &&
    afterPin.ok &&
    beforeReceipt.sha256 === afterReceipt.sha256 &&
    beforePin.sha256 === afterPin.sha256;
  const redFinding = red.findings.find(
    (entry) =>
      entry.id === 'R14-ARIA-CLEANUP-LISTENING-AFTER-01' && entry.status === 'fail',
  );
  const greenOk = Boolean(green && green.exit === 0 && green.accepted === true);
  const ok = Boolean(red.exit === 1 && redFinding && greenOk && originalUnchanged);
  const redCommand = [
    'node',
    'scripts/check-aria-metadata.mjs',
    '--receipt',
    receiptPathText,
    '--pin',
    pinPathText,
  ];
  const greenCommand = sidecarPathText
    ? [...redCommand, '--sidecar', sidecarPathText]
    : null;
  const phaseStdout = (phase, command) => {
    if (!phase || !command) return null;
    const failed = phase.findings.filter((entry) => entry.status !== 'pass').map((entry) => entry.id);
    return [
      `command: ${command.join(' ')}`,
      `ARIA_METADATA check verdict=${phase.ok ? 'clean' : 'red'} findings=${phase.findings.length} ` +
        `failed=${failed.length} accepted=${phase.accepted === true}`,
      ...(failed.length > 0 ? [`ARIA_METADATA findings ${failed.join(',')}`] : []),
    ].join('\n');
  };
  return {
    ok,
    exit: ok ? 0 : 1,
    red: {
      ...red,
      command: redCommand,
      stdout: phaseStdout(red, redCommand),
    },
    green: green
      ? {
          ...green,
          command: greenCommand,
          stdout: phaseStdout(green, greenCommand),
        }
      : null,
    redFinding: redFinding?.id ?? null,
    originalUnchanged,
    receipt: {
      beforeSha256: beforeReceipt.ok ? beforeReceipt.sha256 : null,
      afterSha256: afterReceipt.ok ? afterReceipt.sha256 : null,
    },
    pin: {
      beforeSha256: beforePin.ok ? beforePin.sha256 : null,
      afterSha256: afterPin.ok ? afterPin.sha256 : null,
    },
    sidecarPath: sidecarPathText,
  };
}

function fixtureReceipt({
  summaryListeningAfter = false,
  proof = FIXTURE_PROOF,
  node = '26.12.0',
  pinSha256,
  includeServer = true,
  workerCount = 1,
} = {}) {
  const proofs = workerCount === 0 ? [] : [clone(proof)];
  const workers = workerCount === 0 ? [] : [clone(FIXTURE_WORKER_REF)];
  const receipt = {
    schema: 'tabi-aria-loopback-receipt-v1',
    wave: 'tabi-round-13-w1',
    claim: 'C2',
    sourceSha256: ANCHORS.producerSourceSha256,
    runtime: {
      node,
      pinned: {
        pinPath: DEFAULT_PIN,
        pinSha256,
      },
    },
    pin: clone(FIXTURE_PIN),
    manifest: {
      path: DEFAULT_MANIFEST,
      sha256: ANCHORS.manifestSha256,
      schema: 'tabi-aria-loopback-fixture-manifest-v1',
    },
    source: {
      path: SOURCE_PATHS.producer,
      sha256: ANCHORS.producerSourceSha256,
      specPath: SOURCE_PATHS.spec,
      specSha256: ANCHORS.specSha256,
      configPath: SOURCE_PATHS.config,
      configSha256: ANCHORS.configSha256,
    },
    inputs: [
      {
        kind: 'source',
        name: 'source',
        path: SOURCE_PATHS.producer,
        expectedSha256: null,
        actualSha256: ANCHORS.producerSourceSha256,
        expectedBytes: null,
        actualBytes: 32177,
      },
    ],
    server: {
      perWorker: proofs.map((entry) => ({
        worker: { index: '0', pid: 1530637 },
        proof: clone(entry),
      })),
    },
    cleanup: includeServer
      ? {
          workers: workerCount,
          server: {
            closed: true,
            listeningAfter: summaryListeningAfter,
            refusedAfterClose: true,
            ok: true,
            perWorker: proofs.map((entry) => clone(entry)),
          },
          serverOk: true,
          serverClosed: true,
          serverRefusedAfterClose: true,
        }
      : {
          workers: workerCount,
          serverOk: true,
          serverClosed: true,
          serverRefusedAfterClose: true,
        },
    workers,
    summary: {
      workers: workerCount,
      loopback: true,
      externalSite: false,
      cases: {
        expected: 8,
      },
    },
    verdict: 'pass',
  };
  return receipt;
}

function writeFixture(dir, name, value) {
  const bytes = Buffer.from(stableStringify(value), 'utf8');
  writeFileSync(join(dir, name), bytes);
  return { name, bytes: bytes.length, sha256: sha256(bytes) };
}

function runSelfTest() {
  const results = [];
  const fixtureResults = [];
  const expectRead = readJson(DEFAULT_EXPECTATIONS);
  if (!expectRead.entry.ok || !expectRead.load.ok || expectRead.load.value?.schema !== EXPECTATIONS_SCHEMA) {
    const payload = {
      schema: 'tabi-aria-metadata-selftest-v1',
      ok: false,
      exit: 1,
      findings: [
        finding('R14-ARIA-SELFTEST-01', 'fail', {
          problems: [
            ...(expectRead.entry.ok ? [] : [`expectations:${expectRead.entry.reason}`]),
            ...(expectRead.load.ok ? [] : [`expectations:${expectRead.load.reason}`]),
          ],
          path: DEFAULT_EXPECTATIONS,
        }),
      ],
      cases: [],
    };
    console.log('ARIA_METADATA_SELFTEST verdict=blocked cases=0');
    console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
    return { exit: 1, payload };
  }
  const expectations = expectRead.load.value;
  const dir = mkdtempSync(join(tmpdir(), 'tabi-r14-aria-metadata-'));
  try {
    const pinBytes = Buffer.from(stableStringify(FIXTURE_PIN), 'utf8');
    const pinSha256 = sha256(pinBytes);
    writeFileSync(join(dir, 'pin.json'), pinBytes);
    const generated = {
      pin: { name: 'pin.json', bytes: pinBytes.length, sha256: pinSha256 },
      'receipt-green': writeFixture(
        dir,
        'receipt-green.json',
        fixtureReceipt({ summaryListeningAfter: false, pinSha256 }),
      ),
      'receipt-old': writeFixture(
        dir,
        'receipt-old.json',
        fixtureReceipt({ summaryListeningAfter: true, pinSha256 }),
      ),
      'receipt-min': writeFixture(
        dir,
        'receipt-min.json',
        fixtureReceipt({ summaryListeningAfter: false, pinSha256, node: '18.20.0' }),
      ),
      'receipt-empty': writeFixture(
        dir,
        'receipt-empty.json',
        fixtureReceipt({ summaryListeningAfter: false, pinSha256, workerCount: 0 }),
      ),
      'receipt-nonboolean': writeFixture(
        dir,
        'receipt-nonboolean.json',
        fixtureReceipt({
          summaryListeningAfter: false,
          pinSha256,
          proof: { ...clone(FIXTURE_PROOF), listeningAfter: 'false' },
        }),
      ),
      'receipt-missing-summary': writeFixture(
        dir,
        'receipt-missing-summary.json',
        fixtureReceipt({ summaryListeningAfter: false, pinSha256, includeServer: false }),
      ),
    };
    const malformedBytes = Buffer.from('{"schema":"tabi-aria-loopback-receipt-v1",\n', 'utf8');
    writeFileSync(join(dir, 'malformed-receipt.json'), malformedBytes);
    generated['malformed-receipt'] = {
      name: 'malformed-receipt.json',
      bytes: malformedBytes.length,
      sha256: sha256(malformedBytes),
    };

    const oldContext = prepareContext(
      join(dir, 'receipt-old.json'),
      join(dir, 'pin.json'),
    );
    const oldPre = evaluateAll(oldContext.receipt, oldContext.pin, oldContext);
    const sidecarValid = buildSidecar({
      context: oldContext,
      preEvaluation: oldPre,
      receiptLabel: 'fixtures/receipt-old.json',
      pinLabel: 'fixtures/pin.json',
    });
    generated['sidecar-valid'] = writeFixture(dir, 'sidecar-valid.json', sidecarValid);
    const badDigest = clone(sidecarValid);
    const zero = '0'.repeat(64);
    badDigest.original.receipt.sha256 = zero;
    badDigest.source.receipt.sha256 = zero;
    badDigest.binding.receiptSha256 = zero;
    generated['sidecar-baddigest'] = writeFixture(dir, 'sidecar-baddigest.json', badDigest);
    const wrongTo = clone(sidecarValid);
    wrongTo.corrections[0].to = true;
    wrongTo.corrections[0].value = true;
    wrongTo.correction.corrected = true;
    generated['sidecar-wrongto'] = writeFixture(dir, 'sidecar-wrongto.json', wrongTo);
    const exactNode = clone(sidecarValid);
    exactNode.node.exactMatch = true;
    exactNode.node.exactRecordedMatch = true;
    exactNode.node.observedMatchesRecorded = true;
    generated['sidecar-exactnode'] = writeFixture(dir, 'sidecar-exactnode.json', exactNode);
    const autoSidecar = clone(sidecarValid);
    autoSidecar.original.receipt.path = join(dir, 'receipt-old.json');
    autoSidecar.original.pin.path = join(dir, 'pin.json');
    autoSidecar.source.receipt.path = join(dir, 'receipt-old.json');
    autoSidecar.source.pin.path = join(dir, 'pin.json');
    generated['sidecar-auto'] = writeFixture(dir, 'sidecar-auto.json', autoSidecar);

    for (const [name, entry] of Object.entries(expectations.fixtures || {})) {
      const generatedEntry = generated[name];
      const ok = Boolean(
        generatedEntry &&
          generatedEntry.sha256 === entry.sha256 &&
          generatedEntry.bytes === entry.bytes,
      );
      fixtureResults.push({
        name,
        ok,
        expectedSha256: entry.sha256,
        actualSha256: generatedEntry?.sha256 ?? null,
        expectedBytes: entry.bytes,
        actualBytes: generatedEntry?.bytes ?? null,
      });
    }

    const pathFor = (token) => {
      if (token.startsWith('@')) {
        const name = token.slice(1);
        const generatedEntry = generated[name];
        if (!generatedEntry) throw new Error(`unknown fixture token ${token}`);
        return join(dir, generatedEntry.name);
      }
      return token;
    };

    for (const testCase of expectations.cases || []) {
      const args = (testCase.args || []).map(pathFor);
      const child = spawnSync(process.execPath, [SCRIPT, ...args], {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 16 * 1024 * 1024,
        env: { PATH: process.env.PATH, HOME: process.env.HOME, TZ: 'UTC' },
      });
      let payload = null;
      const jsonLine = (child.stdout || '')
        .split('\n')
        .find((line) => line.startsWith('ARIA_METADATA_JSON '));
      if (jsonLine) {
        try {
          payload = JSON.parse(jsonLine.slice('ARIA_METADATA_JSON '.length));
        } catch {
          payload = null;
        }
      }
      const problems = [];
      if (child.error) problems.push(`spawn:${child.error.code || child.error.message}`);
      if (child.status !== testCase.expectedExit) {
        problems.push(`exit:${child.status}:expected_${testCase.expectedExit}`);
      }
      if (!payload) problems.push('payload:missing');
      if (testCase.kind === 'witness') {
        if (payload) {
          if (testCase.expectedExit === 0) {
            if (payload.ok !== true) problems.push('witness:not_ok');
            if (payload.red?.exit !== 1) problems.push('witness:red_exit');
            if (payload.redFinding !== 'R14-ARIA-CLEANUP-LISTENING-AFTER-01') {
              problems.push('witness:red_finding');
            }
            if (payload.green?.exit !== 0) problems.push('witness:green_exit');
            if (payload.green?.accepted !== true) problems.push('witness:green_not_accepted');
          } else {
            if (payload.ok !== false) problems.push('witness:unexpected_ok');
            if (payload.red?.exit !== 1) problems.push('witness:red_exit');
            if (payload.redFinding !== 'R14-ARIA-CLEANUP-LISTENING-AFTER-01') {
              problems.push('witness:red_finding');
            }
            if (payload.green?.exit === 0 && payload.green?.accepted === true) {
              problems.push('witness:bad_sidecar_accepted');
            }
          }
          if (payload.originalUnchanged !== true) problems.push('witness:original_changed');
        }
      } else if (payload) {
        if (testCase.expectedExit === 0 && payload.ok !== true) problems.push('payload:not_ok');
        const failFindings = (payload.findings || []).filter((entry) => entry.status === 'fail');
        if (testCase.expectedExit === 0 && failFindings.length > 0) {
          problems.push(`payload:unexpected_fail:${failFindings.map((entry) => entry.id).join(',')}`);
        }
        for (const expected of testCase.expectedFindings || []) {
          const match = (payload.findings || []).find((entry) => entry.id === expected.id);
          if (!match) problems.push(`finding_missing:${expected.id}`);
          else if (match.status !== expected.status) {
            problems.push(`finding_status:${expected.id}:${match.status}`);
          }
        }
      }
      results.push({
        id: testCase.id,
        ok: problems.length === 0,
        expectedExit: testCase.expectedExit,
        exit: child.status,
        finding: testCase.expectedFindings?.[0]?.id ?? payload?.redFinding ?? 'none',
        problems,
        findings: (payload?.findings || []).map((entry) => ({ id: entry.id, status: entry.status })),
        stderr: (child.stderr || '').trim().slice(0, 1000),
      });
    }

    const deriveContext = prepareContext(join(dir, 'receipt-old.json'), join(dir, 'pin.json'));
    const derivePre = evaluateAll(deriveContext.receipt, deriveContext.pin, deriveContext);
    const deriveA = stableStringify(
      buildSidecar({
        context: deriveContext,
        preEvaluation: derivePre,
        receiptLabel: 'fixtures/receipt-old.json',
        pinLabel: 'fixtures/pin.json',
      }),
    );
    const deriveB = stableStringify(
      buildSidecar({
        context: deriveContext,
        preEvaluation: derivePre,
        receiptLabel: 'fixtures/receipt-old.json',
        pinLabel: 'fixtures/pin.json',
      }),
    );
    const deriveIdentical = deriveA === deriveB && deriveA === readFileSync(join(dir, 'sidecar-valid.json'), 'utf8');
    results.push({
      id: 'derive-deterministic-sidecar',
      ok: deriveIdentical,
      expectedExit: 0,
      exit: deriveIdentical ? 0 : 1,
      finding: 'R14-ARIA-SIDECAR-ACCEPTED-01',
      problems: deriveIdentical ? [] : ['derive:not_byte_deterministic'],
      findings: [],
      stderr: '',
    });

    const fixturesOk = fixtureResults.every((entry) => entry.ok);
    const casesOk = results.every((entry) => entry.ok);
    const ok = fixturesOk && casesOk && results.length >= 4;
    const payload = {
      schema: 'tabi-aria-metadata-selftest-v1',
      ok,
      exit: ok ? 0 : 1,
      cases: results,
      fixtures: fixtureResults,
      caseCount: results.length,
    };
    console.log(
      `ARIA_METADATA_SELFTEST verdict=${ok ? 'clean' : 'blocked'} cases=${results.length}`,
    );
    for (const entry of fixtureResults) {
      console.log(
        `ARIA_METADATA_SELFTEST result=${entry.ok ? 'PASS' : 'FAIL'} fixture=${entry.name} ` +
          `expected_sha256=${entry.expectedSha256} actual_sha256=${entry.actualSha256 ?? 'none'}`,
      );
    }
    for (const entry of results) {
      console.log(
        `ARIA_METADATA_SELFTEST result=${entry.ok ? 'PASS' : 'FAIL'} case=${entry.id} ` +
          `expected_exit=${entry.expectedExit} exit=${entry.exit} finding=${entry.finding}` +
          (entry.problems.length ? ` problems=${entry.problems.join('|')}` : ''),
      );
    }
    console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
    return { exit: ok ? 0 : 1, payload };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function checkPayload(result) {
  const { context, preEvaluation } = result;
  return {
    schema: 'tabi-aria-metadata-check-v1',
    mode: 'check',
    ok: result.ok,
    exit: result.exit,
    acceptedCorrection: result.accepted === true,
    receipt: {
      path: context.receiptRead.entry.path,
      absPath: context.receiptRead.entry.abs,
      sha256: context.receiptRead.entry.ok ? context.receiptRead.entry.sha256 : null,
      bytes: context.receiptRead.entry.ok ? context.receiptRead.entry.bytesLength : null,
    },
    pin: {
      path: context.pinRead.entry.path,
      absPath: context.pinRead.entry.abs,
      sha256: context.pinRead.entry.ok ? context.pinRead.entry.sha256 : null,
      bytes: context.pinRead.entry.ok ? context.pinRead.entry.bytesLength : null,
    },
    sidecar: result.sidecarResult
      ? {
          path: result.sidecarResult.sidecarRead.entry.path,
          sha256: result.sidecarResult.sidecarRead.entry.ok
            ? result.sidecarResult.sidecarRead.entry.sha256
            : null,
          bytes: result.sidecarResult.sidecarRead.entry.ok
            ? result.sidecarResult.sidecarRead.entry.bytesLength
            : null,
          accepted: result.sidecarResult.accepted,
        }
      : null,
    observed: {
      summaryListeningAfter: preEvaluation.derived.cleanup.summaryListeningAfter,
      perWorkerListeningAfter: preEvaluation.derived.cleanup.perWorkerListeningAfter,
      node: {
        observed: preEvaluation.derived.node.observed,
        recorded: preEvaluation.derived.node.recorded,
        minimumMajor: preEvaluation.derived.node.minimumMajor,
        exactMatch: preEvaluation.derived.node.exactMatch,
        minimumMajorSatisfied: preEvaluation.derived.node.minimumMajorSatisfied,
      },
    },
    derived: result.postEvaluation?.derived ?? preEvaluation.derived,
    originalFindings: preEvaluation.findings.map((entry) => ({
      id: entry.id,
      status: entry.status,
    })),
    findings: result.findings,
  };
}

function witnessPayload(result) {
  return {
    schema: 'tabi-aria-metadata-witness-v1',
    mode: 'witness',
    ok: result.ok,
    exit: result.exit,
    transition: result.ok ? 'red->clean' : 'not-demonstrated',
    redFinding: result.redFinding,
    originalUnchanged: result.originalUnchanged,
    receipt: result.receipt,
    pin: result.pin,
    sidecarPath: result.sidecarPath,
    red: {
      exit: result.red.exit,
      ok: result.red.ok,
      accepted: result.red.accepted,
      command: result.red.command,
      stdout: result.red.stdout,
      findings: result.red.findings.map((entry) => ({ id: entry.id, status: entry.status })),
    },
    green: result.green
      ? {
          exit: result.green.exit,
          ok: result.green.ok,
          accepted: result.green.accepted,
          command: result.green.command,
          stdout: result.green.stdout,
          findings: result.green.findings.map((entry) => ({ id: entry.id, status: entry.status })),
        }
      : null,
  };
}

function derivePayload(result) {
  return {
    schema: 'tabi-aria-metadata-derive-v1',
    mode: 'derive',
    ok: result.ok,
    exit: result.exit,
    out: result.out,
    findings: result.findings.map((entry) => ({ id: entry.id, status: entry.status, detail: entry.detail })),
    sidecarSha256: result.out?.sha256 ?? null,
    sidecar: result.sidecar,
  };
}

function resolveCheckInput(inputPath) {
  const read = readJson(inputPath);
  if (!read.entry.ok || !read.load.ok) {
    return {
      ok: false,
      reason: read.entry.ok ? read.load.reason : `input:${read.entry.reason}`,
    };
  }
  const value = read.load.value;
  const isSidecar =
    value.schema === SIDECAR_SCHEMA ||
    (typeof value.kind === 'string' && /metadata/i.test(value.kind) && /correct/i.test(value.kind));
  if (!isSidecar) {
    return {
      ok: true,
      kind: 'receipt',
      receiptPathText: inputPath,
      pinPathText: DEFAULT_PIN,
      sidecarPathText: null,
    };
  }
  const receiptPathText = value?.original?.receipt?.path;
  const pinPathText = value?.original?.pin?.path;
  if (typeof receiptPathText !== 'string' || typeof pinPathText !== 'string') {
    return { ok: false, reason: 'sidecar:original_paths_missing' };
  }
  return {
    ok: true,
    kind: 'sidecar',
    receiptPathText,
    pinPathText,
    sidecarPathText: inputPath,
  };
}

function usage() {
  return [
    'ARIA_METADATA usage:',
    '  node scripts/check-aria-metadata.mjs [--receipt <path>] [--pin <path>] [--sidecar <path>]',
    '  node scripts/check-aria-metadata.mjs --derive <receipt> <pin> --out <path>',
    '  node scripts/check-aria-metadata.mjs --witness [--receipt <path>] [--pin <path>] [--sidecar <path>]',
    '  node scripts/check-aria-metadata.mjs --self-test',
  ].join('\n');
}

function parseArguments(argv) {
  const options = {
    mode: 'check',
    receipt: DEFAULT_RECEIPT,
    pin: DEFAULT_PIN,
    sidecar: null,
    out: null,
    checkInput: null,
    help: false,
  };
  const modes = new Set();
  let index = 0;
  const nextValue = (flag) => {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    index += 1;
    return value;
  };
  while (index < argv.length) {
    const arg = argv[index];
    if (arg === '--self-test') {
      modes.add('self-test');
      options.mode = 'self-test';
    } else if (arg === '--witness') {
      modes.add('witness');
      options.mode = 'witness';
    } else if (arg === '--derive') {
      modes.add('derive');
      options.mode = 'derive';
      options.receipt = nextValue('--derive');
      options.pin = nextValue('--derive');
    } else if (arg === '--check') {
      modes.add('check');
      options.mode = 'check';
      const candidate = argv[index + 1];
      if (candidate && !candidate.startsWith('--')) {
        options.checkInput = nextValue('--check');
      }
    } else if (arg === '--receipt') {
      options.receipt = nextValue('--receipt');
    } else if (arg === '--pin') {
      options.pin = nextValue('--pin');
    } else if (arg === '--sidecar') {
      options.sidecar = nextValue('--sidecar');
    } else if (arg === '--out') {
      options.out = nextValue('--out');
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
    index += 1;
  }
  if (modes.size > 1) throw new Error('modes are mutually exclusive');
  if (options.mode === 'derive' && !options.out) throw new Error('--derive requires --out');
  if (options.mode === 'check' && options.sidecar === null && modes.size === 0) {
    options.sidecar = null;
  }
  if (options.mode === 'witness' && options.sidecar === null) {
    options.sidecar = DEFAULT_SIDECAR;
  }
  return options;
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.log(`ARIA_METADATA usage verdict=invalid reason=${error.message}`);
    console.log(usage());
    console.log(
      `ARIA_METADATA_JSON ${JSON.stringify({
        schema: 'tabi-aria-metadata-usage-v1',
        ok: false,
        exit: 2,
        error: error.message,
      })}`,
    );
    return 2;
  }
  if (options.help) {
    console.log(usage());
    console.log('ARIA_METADATA help verdict=clean');
    return 0;
  }
  if (options.mode === 'self-test') {
    return runSelfTest().exit;
  }
  if (options.mode === 'witness') {
    const result = runWitness({
      receiptPathText: options.receipt,
      pinPathText: options.pin,
      sidecarPathText: options.sidecar,
    });
    const payload = witnessPayload(result);
    const verdict = result.ok ? 'clean' : 'red';
    console.log(
      `ARIA_METADATA witness verdict=${verdict} transition=${payload.transition} ` +
        `red_exit=${result.red.exit} red_finding=${result.redFinding ?? 'none'} ` +
        `green_exit=${result.green?.exit ?? 'none'} accepted=${result.green?.accepted === true} ` +
        `original_unchanged=${result.originalUnchanged}`,
    );
    console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
    return result.exit;
  }
  if (options.mode === 'derive') {
    const result = runDerive({
      receiptPathText: options.receipt,
      pinPathText: options.pin,
      outArg: options.out,
    });
    const payload = derivePayload(result);
    const verdict = result.ok ? 'clean' : 'red';
    console.log(
      `ARIA_METADATA derive verdict=${verdict} exit=${result.exit} ` +
        `out=${result.out?.path ?? 'none'} sha256=${result.out?.sha256 ?? 'none'} ` +
        `wrote=${result.out?.wrote ?? false} identical=${result.out?.identical ?? false}`,
    );
    console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
    return result.exit;
  }
  let receiptPathText = options.receipt;
  let pinPathText = options.pin;
  let sidecarPathText = options.sidecar;
  if (options.checkInput) {
    const auto = resolveCheckInput(options.checkInput);
    if (!auto.ok) {
      const payload = {
        schema: 'tabi-aria-metadata-check-v1',
        mode: 'check',
        ok: false,
        exit: 1,
        autoInput: options.checkInput,
        findings: [
          finding('R14-ARIA-CHECK-INPUT-01', 'fail', {
            path: options.checkInput,
            reason: auto.reason,
          }),
        ],
      };
      console.log(
        `ARIA_METADATA check verdict=red findings=1 failed=1 accepted=false ` +
          `sidecar=none input=${options.checkInput}`,
      );
      console.log('ARIA_METADATA findings R14-ARIA-CHECK-INPUT-01');
      console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
      return 1;
    }
    receiptPathText = auto.receiptPathText;
    pinPathText = auto.pinPathText;
    sidecarPathText = auto.sidecarPathText;
  }
  const result = runCheck({
    receiptPathText,
    pinPathText,
    sidecarPathText,
  });
  const payload = checkPayload(result);
  const failed = result.findings.filter((entry) => entry.status !== 'pass').map((entry) => entry.id);
  const verdict = result.ok ? 'clean' : 'red';
  console.log(
    `ARIA_METADATA check verdict=${verdict} findings=${result.findings.length} ` +
      `failed=${failed.length} accepted=${result.accepted === true} ` +
      `sidecar=${sidecarPathText ?? 'none'}${options.checkInput ? ` input=${options.checkInput}` : ''}`,
  );
  if (failed.length > 0) {
    console.log(`ARIA_METADATA findings ${failed.join(',')}`);
  }
  console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
  return result.exit;
}

let exitCode;
try {
  exitCode = main();
} catch (error) {
  const message = String(error?.stack || error?.message || error);
  console.log(`ARIA_METADATA fatal verdict=red reason=${String(error?.message || error)}`);
  console.log(
    `ARIA_METADATA_JSON ${JSON.stringify({
      schema: 'tabi-aria-metadata-fatal-v1',
      ok: false,
      exit: 2,
      error: message,
    })}`,
  );
  exitCode = 2;
}
process.exitCode = exitCode;
