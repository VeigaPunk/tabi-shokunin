#!/usr/bin/env node
// Counts only retained round-21 rows whose finite, invocation-correlated outcome
// matches the independent round-22 oracle. This is historical own-work evidence,
// not publisher authentication, branch coverage, or a new browser acquisition.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const SELF = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SELF), '../../..');
const EXPECTATIONS_PATH = 'corpus/evidence/round-22/semantic-expectations.json';
const NOTE_PATH = 'corpus/knowledge/webmcp-lifecycle-oracle-round-22.md';
const RECEIPT_PATH = 'corpus/evidence/round-21/runtime/receipt.json';
const EXECUTION_PATH = '.ufo/waves/round-21/runtime-execution-finalized.json';
const PRODUCER_PATH = 'scripts/webmcp-lifecycle-round21.mjs';
const RUNTIME_PREFIX = 'corpus/evidence/round-21/runtime/';
const RESULT_SCHEMA = 'tabi-round22-c1-semantic-measure-v1';
const EXPECTATIONS_SCHEMA = 'tabi-round22-semantic-expectations-v1';
const METRIC = 'c1_semantically_checked_lifecycle_rows';
const EXPECTATIONS_SHA256 = '4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e';
const PRODUCER_SHA256 = 'bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811';
const SOURCE_HEADER = 'source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json';
const CASE_IDS = [
  'na-pending', 'na-click', 'na-requestsubmit', 'na-native-submit',
  'na-reset', 'na-remove', 'na-reject', 'na-throw', 'na-delayed',
  'na-invalid-submit', 'auto-positive', 'auto-invalid',
];
const FLAGS = [
  '--enable-features=CDPScreenshotNewSurface,WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--disable-extensions',
];
const CASE_ARTIFACT_PATHS = CASE_IDS.flatMap((id) => [`${RUNTIME_PREFIX}${id}.json`, `${RUNTIME_PREFIX}${id}.html`]);
const ACQUISITION_ARTIFACT_PATHS = [RECEIPT_PATH, ...CASE_ARTIFACT_PATHS];
export const INPUT_PATHS = [
  EXPECTATIONS_PATH, NOTE_PATH, PRODUCER_PATH, RECEIPT_PATH, EXECUTION_PATH,
  ...CASE_ARTIFACT_PATHS,
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hex64 = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const equal = (left, right) => isDeepStrictEqual(left, right);
const bytesOf = (value) => {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'string' || value instanceof Uint8Array) return Buffer.from(value);
  return null;
};
const parseBytes = (bytes) => {
  if (!bytes) return { value: null, valid: false };
  try { return { value: JSON.parse(bytes.toString('utf8')), valid: true }; }
  catch { return { value: null, valid: false }; }
};
const statuses = (events) => events.map((frame) => frame.params?.status ?? null);
const responseFrames = (frames) => frames.filter((frame) => frame.dir === 'event' && frame.method === 'WebMCP.toolResponded');
const resolveTokens = (value, nonce, inputQ) => {
  if (value === '$nonce') return nonce;
  if (value === '$input') return inputQ;
  if (Array.isArray(value)) return value.map((item) => resolveTokens(item, nonce, inputQ));
  if (plain(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveTokens(item, nonce, inputQ)]));
  return value;
};

function result(findings, rows, value, verdict, exit) {
  return {
    schema: RESULT_SCHEMA,
    metric: METRIC,
    value,
    c1_semantically_checked_lifecycle_rows: value,
    verdict,
    exit,
    findings,
    rows,
  };
}

function expectationShape(expectations) {
  if (!plain(expectations) || expectations.schema !== EXPECTATIONS_SCHEMA || expectations.metric !== METRIC ||
      expectations.sourceNotePath !== NOTE_PATH || expectations.sourceHeader !== SOURCE_HEADER ||
      expectations.producerPath !== PRODUCER_PATH || expectations.producerSha256 !== PRODUCER_SHA256 ||
      expectations.receiptPath !== RECEIPT_PATH || expectations.receiptSchema !== 'tabi-round21-runtime-v1' ||
      !plain(expectations.acquisition) || expectations.acquisition.path !== EXECUTION_PATH ||
      expectations.acquisition.schema !== 'tabi-round21-experiment-execution-v1' ||
      expectations.acquisition.revision !== '1b5f449ad15525d281fda4558aeef1086f1e4a65' ||
      expectations.acquisition.baseline !== 'e7cf11a810003d4a65cc85bd265f2c17dd65b738' ||
      expectations.acquisition.measuredRevision !== 'uncommitted' ||
      expectations.acquisition.outputPath !== '.ufo/waves/round-21/runtime-finalized-candidate' ||
      expectations.acquisition.exit !== 0 ||
      !equal(expectations.environment, { node: 'v24.21.0', chromium: '154.0.8037.97', playwright: '1.64.0', flags: FLAGS }) ||
      !Array.isArray(expectations.cases) || expectations.cases.length !== CASE_IDS.length) return false;
  return expectations.cases.every((row, index) => plain(row) && row.id === CASE_IDS[index] &&
    typeof row.action === 'string' && typeof row.autosubmit === 'boolean' && typeof row.mode === 'string' &&
    typeof row.inputQ === 'string' && hex64(row.fixtureSha256) &&
    ['none', 'pre-action', 'action-to-post'].includes(row.responseWindow) &&
    (row.response === null || plain(row.response)) && plain(row.pre) && plain(row.post) &&
    ['none', 'landing'].includes(row.navigation) &&
    (row.delayed === undefined || plain(row.delayed)));
}

function addFinding(findings, id, detail) {
  if (!findings.some((item) => item.id === id && item.detail === detail)) findings.push({ id, detail });
}

function validatePageState(actual, expected, nonce, inputQ, origin, id, stage, findings) {
  if (!plain(actual)) {
    addFinding(findings, 'input_shape', `${id}:${stage}:page-state`);
    return;
  }
  if (actual.secureContext !== true || actual.formActive !== expected.formActive ||
      actual.formExists !== expected.formExists || actual.value !== resolveTokens(expected.value, nonce, inputQ) ||
      actual.focused !== expected.focused) addFinding(findings, 'semantic_status', `${id}:${stage}:form-state`);
  const expectedNonce = stage === 'post' && id === 'na-native-submit' ? undefined : nonce;
  if (expectedNonce === undefined ? Object.hasOwn(actual, 'nonce') : actual.nonce !== expectedNonce)
    addFinding(findings, 'semantic_status', `${id}:${stage}:nonce-state`);
  if (expected.submitCount === null) {
    if (Object.hasOwn(actual, 'submits')) addFinding(findings, 'semantic_status', `${id}:${stage}:submit-observation`);
  } else {
    const expectedSubmits = expected.submitCount === 1 ? [{
      agentInvoked: true, isTrusted: true, q: nonce, active: true, respondWith: 'function',
    }] : [];
    if (!equal(actual.submits, expectedSubmits)) addFinding(findings, 'semantic_status', `${id}:${stage}:submit-event`);
  }
  if (!equal(actual.errors, expected.errors)) addFinding(findings, 'semantic_error', `${id}:${stage}:page-errors`);
  if (typeof actual.url !== 'string') {
    addFinding(findings, 'semantic_navigation', `${id}:${stage}:url-missing`);
  } else {
    try {
      const url = new URL(actual.url);
      const expectedPath = expected.urlPath;
      const expectedSearch = resolveTokens(expected.urlSearch, nonce, inputQ);
      if (url.origin !== origin || url.pathname !== expectedPath || url.search !== expectedSearch || url.hash || url.username || url.password)
        addFinding(findings, 'semantic_navigation', `${id}:${stage}:url`);
    } catch {
      addFinding(findings, 'semantic_navigation', `${id}:${stage}:url-invalid`);
    }
  }
}

function checkCase({ expected, receiptCase, raw, rawBytes, fixtureBytes, receiptStart, receiptEnd, findings }) {
  const id = expected.id;
  const local = [];
  const add = (kind, detail) => addFinding(local, kind, `${id}:${detail}`);
  const unavailable = (detail) => {
    add('input_shape', detail);
    for (const item of local) addFinding(findings, item.id, item.detail);
    return { id, outcome: null, semanticMatch: false, counted: false, sequence: null, findings: local };
  };
  if (!plain(receiptCase) || !plain(raw) || !Array.isArray(raw.frames) || !Array.isArray(raw.pageObservations) || !raw.frames.every(plain))
    return unavailable('case-evidence-shape');

  const nonce = receiptCase.nonce;
  if (typeof nonce !== 'string' || nonce.length < 16 || raw.nonce !== nonce || raw.id !== id ||
      raw.autosubmit !== expected.autosubmit || receiptCase.autosubmit !== expected.autosubmit ||
      raw.action !== expected.action || receiptCase.action !== expected.action || raw.mode !== expected.mode ||
      receiptCase.evidence?.path !== `${RUNTIME_PREFIX}${id}.json` ||
      raw.fixture?.path !== `${RUNTIME_PREFIX}${id}.html` || !fixtureBytes ||
      raw.fixture?.sha256 !== sha256(fixtureBytes) || raw.fixture.sha256 !== expected.fixtureSha256 ||
      typeof receiptCase.invocationId !== 'string' || !receiptCase.invocationId || receiptCase.invokeError !== null)
    add('evidence_binding', 'case-identity-or-fixture');
  if (typeof nonce !== 'string' || nonce.length < 16) return unavailable('nonce');
  const inputQ = resolveTokens(expected.inputQ, nonce, nonce);
  if (expected.inputQ !== '$nonce' && expected.inputQ !== 'not-an-email') add('input_shape', 'expected-input');

  const frames = raw.frames;
  if (!frames.length || frames.some((frame, index) => frame.seq !== index + 1 || !Number.isSafeInteger(frame.at) ||
      (index > 0 && frame.at < frames[index - 1].at))) add('semantic_timing', 'frame-sequence-or-clock');
  if (frames.some((frame) => !Number.isSafeInteger(frame.at) || frame.at < receiptStart || frame.at > receiptEnd))
    add('evidence_binding', 'frame-outside-acquisition-window');
  const observations = frames.filter((frame) => frame.dir === 'observation').map((frame) => ({
    label: frame.label, at: frame.at, seq: frame.seq, value: frame.value,
  }));
  if (!equal(raw.pageObservations, observations)) add('evidence_binding', 'page-observation-raw-link');

  const pageObservation = (label) => raw.pageObservations.filter((item) => item?.label === label);
  const preList = pageObservation('pre-action');
  const postList = pageObservation('after-action');
  const delayedList = pageObservation('delayed-before-release');
  const pre = preList[0];
  const post = postList[0];
  if (preList.length !== 1 || postList.length !== 1 || delayedList.length !== (expected.delayed ? 1 : 0))
    add('semantic_timing', 'observation-marker-set');

  const actionFrames = frames.filter((frame) => frame.dir === 'action');
  const completeFrames = frames.filter((frame) => frame.dir === 'action-complete');
  const actionFrame = actionFrames[0];
  const completeFrame = completeFrames[0];
  if (actionFrames.length !== 1 || completeFrames.length !== 1 || actionFrame?.action !== expected.action ||
      completeFrame?.action !== expected.action || actionFrame?.phase !== (expected.action === 'none' ? 'no-action' : 'dispatch-started'))
    add('semantic_status', 'action-invocation');
  if (pre && post && actionFrame && completeFrame && !(pre.seq < actionFrame.seq && actionFrame.seq < completeFrame.seq && completeFrame.seq < post.seq))
    add('semantic_timing', 'pre-action-dispatch-post-sequence');

  const sentInvocations = frames.filter((frame) => frame.dir === 'sent' && frame.method === 'WebMCP.invokeTool');
  const invokedEvents = frames.filter((frame) => frame.dir === 'event' && frame.method === 'WebMCP.toolInvoked');
  const toolAdds = frames.filter((frame) => frame.dir === 'event' && frame.method === 'WebMCP.toolsAdded');
  const sentTrees = frames.filter((frame) => frame.dir === 'sent' && frame.method === 'Page.getFrameTree');
  const sent = sentInvocations[0];
  const commandResults = sent ? frames.filter((frame) => (frame.dir === 'result' || frame.dir === 'error') && frame.command === sent.command) : [];
  const commandResult = commandResults[0];
  const treeResult = sentTrees[0] ? frames.filter((frame) => frame.dir === 'result' && frame.command === sentTrees[0].command) : [];
  const invoked = invokedEvents[0];
  const invocationId = commandResult?.result?.invocationId;
  const treeFrameId = treeResult[0]?.result?.frameTree?.frame?.id;
  const initialNavigations = frames.filter((frame) => frame.dir === 'event' && frame.method === 'Page.frameNavigated');
  const initialFrameId = initialNavigations[0]?.params?.frame?.id;
  const addedTools = toolAdds.flatMap((frame) => Array.isArray(frame.params?.tools) ? frame.params.tools : []);
  const lifecycleTools = addedTools.filter((tool) => tool?.name === 'lifecycle');
  let invokedInput = null;
  try { invokedInput = JSON.parse(invoked?.params?.input); } catch { /* mismatched input is reported below */ }
  if (sentInvocations.length !== 1 || !Number.isSafeInteger(sent?.command) || commandResults.length !== 1 ||
      commandResult?.dir !== 'result' || !plain(commandResult.result) || typeof invocationId !== 'string' || !invocationId ||
      receiptCase.invocationId !== invocationId || invokedEvents.length !== 1 ||
      invoked?.params?.invocationId !== invocationId ||
      lifecycleTools.length !== 1 || !treeFrameId || treeFrameId !== initialFrameId ||
      lifecycleTools[0]?.frameId !== treeFrameId || sent?.params?.frameId !== treeFrameId ||
      invoked?.params?.frameId !== treeFrameId || invoked?.params?.toolName !== 'lifecycle' ||
      sent?.params?.toolName !== 'lifecycle' || !equal(sent?.params?.input, { q: inputQ }) || !equal(invokedInput, { q: inputQ }) ||
      !(sent?.seq < commandResult?.seq && commandResult?.seq < invoked?.seq && invoked?.seq < pre?.seq))
    add('evidence_binding', 'current-invocation-chain');
  if (receiptCase.invocationId !== invocationId || invoked?.params?.invocationId !== invocationId)
    add('evidence_binding', 'invocation-id-cross-link');
  if (sent && commandResult && invoked && !(sent.seq < commandResult.seq && commandResult.seq < invoked.seq))
    add('semantic_timing', 'invocation-sequence');
  if (sent?.params?.input?.q !== inputQ || invokedInput?.q !== inputQ)
    add('semantic_output', 'invoked-input');

  const navEvents = frames.filter((frame) => frame.dir === 'event' && frame.method === 'Page.frameNavigated');
  const firstUrl = navEvents[0]?.params?.frame?.url;
  let origin = null;
  try {
    const first = new URL(firstUrl);
    if (first.protocol === 'http:' && first.hostname === '127.0.0.1' && first.port && first.pathname === `/${id}` && !first.search)
      origin = first.origin;
  } catch { /* navigation finding below */ }
  if (!origin) add('semantic_navigation', 'initial-loopback-navigation');

  const preFrame = pre ? frames.find((frame) => frame.dir === 'observation' && frame.label === 'pre-action' && frame.seq === pre.seq) : null;
  const postFrame = post ? frames.find((frame) => frame.dir === 'observation' && frame.label === 'after-action' && frame.seq === post.seq) : null;
  if (!preFrame || !postFrame || preFrame.at !== pre?.at || postFrame.at !== post?.at ||
      !equal(preFrame.value, pre?.value) || !equal(postFrame.value, post?.value))
    add('evidence_binding', 'observation-frame-link');
  if (pre && origin) validatePageState(pre.value, expected.pre, nonce, inputQ, origin, id, 'pre', local);
  if (post && origin) validatePageState(post.value, expected.post, nonce, inputQ, origin, id, 'post', local);

  const allResponses = responseFrames(frames);
  const matchingResponses = allResponses.filter((frame) => frame.params?.invocationId === invocationId);
  if (allResponses.some((frame) => frame.params?.invocationId !== invocationId)) add('evidence_binding', 'response-other-invocation');
  const beforePre = pre ? matchingResponses.filter((frame) => frame.seq < pre.seq) : [];
  const beforePost = post ? matchingResponses.filter((frame) => frame.seq < post.seq) : [];
  if (!equal(statuses(beforePre), expected.pre.statuses) || !equal(statuses(beforePost), expected.post.statuses))
    add('semantic_status', 'finite-window-response-statuses');
  if (!pre || !post || !plain(receiptCase.preAction) || !plain(receiptCase.after)) {
    add('input_shape', 'receipt-summary-shape');
  } else {
    const preSummary = receiptCase.preAction;
    const afterSummary = receiptCase.after;
    const preMs = preSummary.end - preSummary.start;
    const afterMs = afterSummary.end - afterSummary.start;
    if (!Number.isSafeInteger(preSummary.start) || !Number.isSafeInteger(preSummary.end) ||
        preSummary.end !== pre.at || preSummary.windowMs !== preMs || preMs < expected.pre.minMs || preMs > expected.pre.maxMs ||
        preSummary.start < receiptStart || preSummary.start > pre.at || sent?.at > preSummary.start ||
        preSummary.responseCount !== beforePre.length || preSummary.formActive !== pre.value?.formActive ||
        !Number.isSafeInteger(afterSummary.start) || !Number.isSafeInteger(afterSummary.end) ||
        afterSummary.end !== post.at || afterSummary.windowMs !== afterMs || afterMs < expected.post.minMs || afterMs > expected.post.maxMs ||
        afterSummary.start < pre.at || afterSummary.start > actionFrame?.at || afterSummary.end > receiptEnd ||
        !actionFrame || !completeFrame || actionFrame.at < afterSummary.start || completeFrame.at > afterSummary.end)
      add('semantic_timing', 'finite-summary-windows');
    if (!equal(afterSummary.responses, beforePost.map((frame) => frame.params)) ||
        !equal(afterSummary.pageState, post.value) ||
        !equal(afterSummary.submits, Array.isArray(post.value?.submits) ? post.value.submits : null))
      add('evidence_binding', 'receipt-raw-summary');
    const summarizedNavigations = navEvents.filter((frame) => frame.at >= afterSummary.start && frame.seq < post.seq).map((frame) => frame.params);
    if (!equal(afterSummary.navigations, summarizedNavigations)) add('evidence_binding', 'receipt-navigation-summary');
  }

  const expectedResponse = expected.response;
  if (expectedResponse === null) {
    if (matchingResponses.length !== 0) add('semantic_status', 'pending-has-response');
  } else {
    if (matchingResponses.length !== 1) add('semantic_status', 'response-count');
    const response = matchingResponses[0];
    if (response && response.params?.status !== expectedResponse.status) add('semantic_status', 'outcome-status');
    if (response) {
      const expectedParams = { invocationId, status: expectedResponse.status };
      if (Object.hasOwn(expectedResponse, 'errorText')) expectedParams.errorText = expectedResponse.errorText;
      else expectedParams.output = resolveTokens(expectedResponse.output, nonce, inputQ);
      if (!equal(response.params, expectedParams)) {
        if (Object.hasOwn(expectedResponse, 'errorText')) add('semantic_error', 'exact-error-text-or-output-presence');
        else add('semantic_output', 'exact-output-shape');
      }
    }
  }
  if (expected.responseWindow === 'none' && matchingResponses.length !== 0)
    add('semantic_status', 'response-outside-finite-pending-case');
  if (expected.responseWindow === 'pre-action' && matchingResponses.some((frame) => !pre || frame.seq >= pre.seq))
    add('semantic_timing', 'autosubmit-not-before-pre-action');
  if (expected.responseWindow === 'action-to-post' && matchingResponses.some((frame) => !actionFrame || !post || frame.seq <= actionFrame.seq || frame.seq >= post.seq))
    add('semantic_timing', 'response-outside-action-window');

  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
  if (expected.navigation === 'none') {
    if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
  } else {
    const landing = actionNavigations[0]?.params?.frame?.url;
    let validLanding = false;
    try {
      const url = new URL(landing);
      validLanding = actionNavigations.length === 1 && url.origin === origin && url.pathname === '/landing' &&
        url.search === `?q=${encodeURIComponent(nonce)}` && !url.hash;
    } catch { /* navigation finding below */ }
    if (!validLanding) add('semantic_navigation', 'native-submit-landing');
    const response = matchingResponses[0];
    const navigation = actionNavigations[0];
    if (navigation && response && navigation.seq >= response.seq)
      add('semantic_navigation', 'landing-before-completion');
  }

  if (expected.delayed) {
    const delayed = delayedList[0];
    const delayedFrame = delayed ? frames.find((frame) => frame.dir === 'observation' && frame.label === 'delayed-before-release' && frame.seq === delayed.seq) : null;
    const releases = frames.filter((frame) => frame.dir === 'release');
    const release = releases[0];
    if (!delayed || !delayedFrame || releases.length !== 1 || !release || !completeFrame ||
        !(completeFrame.seq < delayed.seq && delayed.seq < release.seq) ||
        !Number.isSafeInteger(delayed.at) || delayed.at - completeFrame.at < expected.delayed.minMs ||
        delayed.at - completeFrame.at > expected.delayed.maxMs || delayed.value?.formActive !== expected.delayed.formActiveBeforeRelease ||
        matchingResponses.some((frame) => frame.seq <= release.seq) || !matchingResponses[0] ||
        matchingResponses[0].seq <= release.seq || !equal(delayed.value?.errors, []) ||
        delayed.value?.url !== post?.value?.url || delayed.value?.nonce !== nonce || delayed.value?.value !== nonce)
      add('semantic_delayed', 'active-before-release-and-response-after-release');
  } else if (frames.some((frame) => frame.dir === 'release')) {
    add('semantic_delayed', 'unexpected-release-marker');
  }

  if (!Array.isArray(raw.browserPidsBefore) || raw.browserPidsBefore.length === 0 ||
      raw.browserPidsBefore.some((pid) => !Number.isSafeInteger(pid) || pid <= 0) ||
      !equal(raw.browserPidsAfter, []) || raw.contextClosed !== true || raw.closeError ||
      !equal(raw.blocked, []) || !equal(raw.downloads, []))
    add('evidence_binding', 'case-cleanup-or-boundary');

  const observed = matchingResponses[0]?.params?.status ?? 'Pending';
  const semanticMatch = local.length === 0;
  for (const item of local) addFinding(findings, item.id, item.detail);
  return {
    id,
    outcome: observed,
    semanticMatch,
    counted: false,
    sequence: {
      invocation: invoked?.seq ?? null,
      preAction: pre?.seq ?? null,
      action: actionFrame?.seq ?? null,
      response: matchingResponses[0]?.seq ?? null,
      release: frames.find((frame) => frame.dir === 'release')?.seq ?? null,
      postAction: post?.seq ?? null,
    },
    findings: local,
    rawDigest: rawBytes ? sha256(rawBytes) : null,
  };
}

export function evaluate(files) {
  const findings = [];
  if (!files || typeof files !== 'object' || Array.isArray(files))
    return result([{ id: 'input_shape', detail: 'file-map' }], [], 0, 'failed', 1);
  const get = (path) => {
    if (files[path] === undefined) return null;
    return bytesOf(files[path]);
  };
  const expectationsBytes = get(EXPECTATIONS_PATH);
  const noteBytes = get(NOTE_PATH);
  const expectationsPresent = Object.prototype.hasOwnProperty.call(files, EXPECTATIONS_PATH);
  const notePresent = Object.prototype.hasOwnProperty.call(files, NOTE_PATH);
  if (!expectationsPresent && !notePresent) return result([], [], 0, 'baseline', 0);
  if ((expectationsPresent && !expectationsBytes) || (notePresent && !noteBytes))
    addFinding(findings, 'input_shape', 'non-byte-oracle-input');
  if (!expectationsBytes) addFinding(findings, 'source_binding', 'semantic-expectations-missing');
  if (!noteBytes) addFinding(findings, 'source_binding', 'oracle-note-missing');
  const parsedExpectations = parseBytes(expectationsBytes);
  const expectations = parsedExpectations.value;
  if (expectationsBytes && !parsedExpectations.valid) addFinding(findings, 'input_shape', 'semantic-expectations-json');
  if (expectationsBytes && sha256(expectationsBytes) !== EXPECTATIONS_SHA256)
    addFinding(findings, 'input_shape', 'semantic-expectations-digest');
  if (expectationsBytes && !expectationShape(expectations)) addFinding(findings, 'input_shape', 'semantic-expectations-schema');
  if (noteBytes) {
    const note = noteBytes.toString('utf8');
    const firstLine = note.split(/\r?\n/, 1)[0];
    if (firstLine !== SOURCE_HEADER || expectations?.sourceHeader !== SOURCE_HEADER || expectations?.sourceNotePath !== NOTE_PATH)
      addFinding(findings, 'source_binding', 'canonical-S101-first-line');
  }
  if (!expectationsBytes || !parsedExpectations.valid || !expectationShape(expectations))
    return result(findings, [], 0, 'failed', 1);

  const receiptBytes = get(RECEIPT_PATH);
  const executionBytes = get(EXECUTION_PATH);
  const producerBytes = get(PRODUCER_PATH);
  const receiptParsed = parseBytes(receiptBytes);
  const executionParsed = parseBytes(executionBytes);
  const receipt = receiptParsed.value;
  const execution = executionParsed.value;
  if (!receiptBytes || !executionBytes || !producerBytes) addFinding(findings, 'evidence_binding', 'acquisition-input-missing');
  if (receiptBytes && !receiptParsed.valid) addFinding(findings, 'input_shape', 'receipt-json');
  if (executionBytes && !executionParsed.valid) addFinding(findings, 'input_shape', 'acquisition-json');
  if (producerBytes && sha256(producerBytes) !== PRODUCER_SHA256) addFinding(findings, 'evidence_binding', 'producer-digest');

  const artifactPaths = ACQUISITION_ARTIFACT_PATHS;
  const expectedArtifactKeys = [...artifactPaths].sort();
  const acquisition = expectations.acquisition;
  if (plain(execution)) {
    const argv = execution.argv;
    const argvValid = Array.isArray(argv) && argv.length === 4 && typeof argv[0] === 'string' &&
      isAbsolute(argv[0]) && basename(argv[0]) === 'node' && argv[1] === PRODUCER_PATH &&
      argv[2] === '--out' && argv[3] === acquisition.outputPath;
    const artifactKeys = plain(execution.artifacts) ? Object.keys(execution.artifacts).sort() : [];
    if (execution.schema !== acquisition.schema || execution.revision !== acquisition.revision ||
        execution.baseline !== acquisition.baseline || execution.measuredRevision !== acquisition.measuredRevision ||
        execution.producerPath !== PRODUCER_PATH || execution.producerSha256 !== PRODUCER_SHA256 ||
        execution.exit !== acquisition.exit || !argvValid || !equal(artifactKeys, expectedArtifactKeys))
      addFinding(findings, 'evidence_binding', 'acquisition-identity-or-artifact-set');
    if (receiptBytes && execution.receiptSha256 !== sha256(receiptBytes))
      addFinding(findings, 'evidence_binding', 'acquisition-receipt-digest');
    for (const path of artifactPaths) {
      const artifactBytes = get(path);
      if (!artifactBytes || execution.artifacts?.[path] !== sha256(artifactBytes))
        addFinding(findings, 'evidence_binding', `acquisition-artifact:${path}`);
    }
  } else if (executionBytes) {
    addFinding(findings, 'input_shape', 'acquisition-object');
  }

  let receiptStart = NaN;
  let receiptEnd = NaN;
  if (plain(receipt)) {
    receiptStart = typeof receipt.startedAt === 'string' ? Date.parse(receipt.startedAt) : NaN;
    receiptEnd = typeof receipt.finishedAt === 'string' ? Date.parse(receipt.finishedAt) : NaN;
    if (receipt.schema !== expectations.receiptSchema || !Array.isArray(receipt.cases) ||
        receipt.producer?.path !== PRODUCER_PATH || receipt.producer?.sha256 !== PRODUCER_SHA256 ||
        !equal(receipt.environment, expectations.environment) ||
        receipt.cleanup?.browserClosed !== true || receipt.cleanup?.serverClosed !== true ||
        !Number.isFinite(receiptStart) || !Number.isFinite(receiptEnd) || receiptEnd < receiptStart)
      addFinding(findings, 'evidence_binding', 'receipt-acquisition-envelope');
    const ids = Array.isArray(receipt.cases) ? receipt.cases.map((item) => item?.id ?? null) : [];
    if (!equal(ids, CASE_IDS)) addFinding(findings, 'case_set', 'receipt-case-order-or-set');
  } else if (receiptBytes) {
    addFinding(findings, 'input_shape', 'receipt-object');
  }

  const casesById = new Map();
  if (Array.isArray(receipt?.cases)) {
    for (const item of receipt.cases) if (typeof item?.id === 'string' && !casesById.has(item.id)) casesById.set(item.id, item);
  }
  const rows = [];
  for (const expected of expectations.cases) {
    const receiptCase = casesById.get(expected.id) ?? null;
    const rawBytes = get(`${RUNTIME_PREFIX}${expected.id}.json`);
    const fixtureBytes = get(`${RUNTIME_PREFIX}${expected.id}.html`);
    const rawParsed = parseBytes(rawBytes);
    if (!rawBytes || !fixtureBytes) addFinding(findings, 'evidence_binding', `${expected.id}:raw-or-fixture-missing`);
    if (rawBytes && !rawParsed.valid) addFinding(findings, 'input_shape', `${expected.id}:raw-json`);
    if (!receiptCase) addFinding(findings, 'case_set', `${expected.id}:receipt-row-missing`);
    if (receiptCase && rawBytes && receiptCase.evidence?.sha256 !== sha256(rawBytes))
      addFinding(findings, 'evidence_binding', `${expected.id}:receipt-raw-digest`);
    const row = checkCase({
      expected, receiptCase, raw: rawParsed.value, rawBytes, fixtureBytes,
      receiptStart, receiptEnd, findings,
    });
    rows.push(row);
  }

  const blocked = findings.length > 0;
  let value = 0;
  for (const row of rows) {
    row.counted = !blocked && row.semanticMatch;
    if (row.counted) value++;
  }
  const exit = findings.length ? 1 : 0;
  const verdict = exit ? 'failed' : value ? 'clean' : 'baseline';
  return result(findings, rows, value, verdict, exit);
}

const gitEnv = () => ({
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  LANG: 'C',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_LAZY_FETCH: '1',
});
function git(args) {
  const child = spawnSync('git', ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false', ...args], {
    cwd: ROOT, env: gitEnv(), encoding: null, maxBuffer: 64 * 1024 * 1024,
  });
  if (child.error || child.status !== 0) throw new Error('revision_input:git-object-unavailable');
  return child.stdout;
}
export function filesAt(revision) {
  if (typeof revision !== 'string' || !/^[a-f0-9]{40}$/.test(revision))
    throw new Error('revision_input:full-40-hex-commit-required');
  const resolved = git(['rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`]).toString('ascii').trim();
  if (resolved !== revision) throw new Error('revision_input:commit-identity-mismatch');
  const files = Object.create(null);
  const allowed = new Set(INPUT_PATHS);
  const entries = git(['ls-tree', '-r', '-z', revision, '--', ...INPUT_PATHS]).toString('utf8').split('\0').filter(Boolean);
  for (const entry of entries) {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(entry);
    if (!match || !allowed.has(match[3])) throw new Error('revision_input:non-regular-or-unlisted-blob');
    files[match[3]] = git(['cat-file', 'blob', match[2]]);
  }
  return files;
}

function cliError(message) {
  return result([{ id: 'revision_input', detail: message }], [], 0, 'could-not-evaluate', 2);
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  if (process.argv.length === 3 && process.argv[2] === '--selftest') {
    const selftest = resolve(ROOT, '.ufo/waves/round-22/selftest-c1.mjs');
    const child = spawnSync(process.execPath, [selftest], { stdio: 'inherit' });
    process.exitCode = child.status ?? 2;
  } else if (process.argv.length === 3) {
    try {
      const revision = process.argv[2];
      const output = evaluate(filesAt(revision));
      output.revision = revision;
      console.log(JSON.stringify(output));
      process.exitCode = output.exit;
    } catch (error) {
      const message = typeof error?.message === 'string' && error.message.startsWith('revision_input:')
        ? error.message : 'revision_input:evaluation-failed';
      console.log(JSON.stringify(cliError(message)));
      process.exitCode = 2;
    }
  } else {
    console.log(JSON.stringify(cliError('revision_input:usage')));
    process.exitCode = 2;
  }
}
