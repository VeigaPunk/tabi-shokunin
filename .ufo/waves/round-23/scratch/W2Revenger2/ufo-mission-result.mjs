#!/usr/bin/env node
/**
 * Typed UFO mission-result envelope (evidence/display only).
 * Strict structured evidence; never completion authority or dispatch.
 */
import { closeSync, constants as fsConstants, fstatSync, fsyncSync, linkSync, lstatSync, mkdirSync, openSync, readdirSync, readlinkSync, readSync, realpathSync, renameSync, rmSync, unlinkSync, writeFileSync, writeSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { basename, dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";

export const SCHEMA = "ufo-mission-result-v1";
export const RECEIPT_SCHEMA = "ufo-task-receipt-v1";

const OUTCOMES = Object.freeze(["completed", "failed", "aborted"]);
const STATES = Object.freeze(["started", "not_started"]);
/** Terminal-outcome triple (spec 13 §2): reported beside the loop stop, never
 * folded into an exit code and never invented — an envelope that does not know
 * a field omits it. These are optional envelope fields, so their absence never
 * changes whether an envelope is admitted. */
const OUTCOME_TRIPLE_VALUES = Object.freeze({
  round_validity: Object.freeze(["sound", "unsound"]),
  loop_stop: Object.freeze([
    "saturated", "budget_halt", "blocked", "interrupted", "honesty_brake", "authority_boundary",
  ]),
  mission_goal: Object.freeze(["satisfied", "incomplete", "unverified"]),
});
const OUTCOME_TRIPLE_KEYS = Object.freeze(Object.keys(OUTCOME_TRIPLE_VALUES));
const INPUT_KEYS = Object.freeze(["runId", "sessionId", "subagents", "reportSummary", ...OUTCOME_TRIPLE_KEYS]);
const ENTRY_KEYS = Object.freeze(["outcome", "state", "body", "agentId", "item", "mode", "memberIndex", "stopReason", "failureClass", "axes", "milestone", "reportPresent"]);
// Typed failure class vocabulary — mirrors FAILURE_CLASS_REASON in
// ufo-swarm-collect.mjs (the wave-side producer). Declared here because this
// module is the envelope authority; the collect-side set must stay identical.
const ENTRY_FAILURE_CLASSES = Object.freeze([
  "rate_limit", "usage_limit", "model_unavailable", "lane_timeout",
  "process_exit", "unavailable", "quality_degraded",
]);
const ENVELOPE_KEYS = Object.freeze([
  "schema",
  "runId",
  "sessionId",
  "subagents",
  "summary",
  "completed",
  "failed",
  "aborted",
  "total",
  "resumeHint",
  "reportSummary",
  ...OUTCOME_TRIPLE_KEYS,
]);
// Report-landing summary keys (nc5-swarm r15): collect's answer to "which
// lane reports never landed on disk", carried at the envelope head so a
// missing report is visible without scanning every entry body.
const REPORT_SUMMARY_KEYS = Object.freeze(["expected", "present", "missing"]);
const RECEIPT_KEYS = Object.freeze([
  "schema", "taskKey", "runId", "sessionId",
  "promptSha256", "configSha256", "reportSha256",
  "producerId", "createdAt", "iteration",
]);
/** Receipt-bound iteration decisions. `stop` is an agent-declared halt, never
 * a Rust convergence verdict; `budget_halt` is a declared budget stop, not
 * saturation. `continue` is the only outcome that may release a successor. */
const ITERATION_DECISIONS = Object.freeze(["continue", "stop", "blocked", "budget_halt"]);
const ITERATION_KEYS = Object.freeze(["decision", "reason", "nativeVerdict", "blockedAudit"]);
/** Local agent/session names: ASCII alphanumerics plus `.` `-` `_`, 1-128 chars. */
const LOCAL_ID = /^[A-Za-z0-9._-]{1,128}$/u;
/** Same owner-id bounds as the wall registry. */
const RUN_ID = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/u;
const SESSION_ID = /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/u;
/** SHA-256 hex digest: 64 lowercase hex chars. */
const SHA256_HEX = /^[a-f0-9]{64}$/u;
/** Queue task key: task_ followed by 24 hex chars. */
const TASK_KEY = /^task_[a-f0-9]{24}$/u;

/**
 * @typedef {object} MissionResultEntry
 * @property {"completed"|"failed"|"aborted"} outcome
 * @property {"started"|"not_started"} state
 * @property {string} body
 * @property {string} [agentId]
 * @property {string} [item]
 * @property {"resume"} [mode]
 * @property {number} [memberIndex] 1-based wave member position (kimi swarmIndex)
 * @property {string} [stopReason] terminal stop detail (kimi stop_reason)
 * @property {string} [failureClass] typed transport/work failure class (swarm-collect vocabulary)
 * @property {boolean} [reportPresent] lane report file existed at collect time (only when the wave declared a reportDir)
 */

/**
 * @typedef {object} MissionResultEnvelope
 * @property {"ufo-mission-result-v1"} schema
 * @property {string} runId
 * @property {string} sessionId
 * @property {MissionResultEntry[]} subagents
 * @property {string} summary
 * @property {number} completed
 * @property {number} failed
 * @property {number} aborted
 * @property {number} total
 * @property {string|null} resumeHint
 * @property {"sound"|"unsound"} [round_validity]
 * @property {"saturated"|"budget_halt"|"blocked"|"interrupted"|"honesty_brake"|"authority_boundary"} [loop_stop]
 * @property {"satisfied"|"incomplete"|"unverified"} [mission_goal]
 */

export class MissionResultError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = "MissionResultError";
    this.code = code;
    this.details = details;
  }
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {Record<string, unknown>}
 */
function plainObject(value, label) {
  if (!isPlainObject(value)) {
    throw new MissionResultError("invalid_type", `${label} must be a plain object`);
  }
  return /** @type {Record<string, unknown>} */ (value);
}

/** Non-throwing plain-object predicate — the shape half of plainObject()
 * above, shared so every artifact/state/report boundary names the same
 * check instead of re-spelling `!== null && typeof === "object" &&
 * !Array.isArray` (four verbatim private copies plus a dozen inline
 * expansions lived across the swarm/monitor/watch/watchdog/mission-*
 * files before this lift, nc3-swarm r53). */
export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Element-shape member filter (nc3-swarm r59): parsed-JSON array members
 * (the monitor report's row arrays, the watchdog's status.missions) can
 * carry non-object elements — a null or a string used to TypeError on
 * `row.title`/`m.status` and kill the whole duty. The shared doctrine:
 * non-object elements are NAMED to the caller's callback and skipped, and
 * the well-formed rows still reach their duties. The caller owns the
 * malformed descriptor format (watch: `member[i]`; watchdog:
 * `missions[i]:<type>`), so emitted telemetry stays byte-identical.
 * @param {unknown[]} value
 * @param {(index: number, element: unknown) => void} onMalformed
 * @returns {Record<string, unknown>[]}
 */
export function plainObjectRows(value, onMalformed) {
  return value.filter((element, index) => {
    if (isPlainObject(element)) return true;
    onMalformed(index, element);
    return false;
  });
}

/**
 * @param {Record<string, unknown>} value
 * @param {readonly string[]} allowed
 * @param {string} label
 */
function rejectUnknown(value, allowed, label) {
  const extra = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extra.length > 0) {
    throw new MissionResultError("unknown_field", `${label} has unknown fields: ${extra.join(", ")}`, {
      fields: extra,
    });
  }
}

/**
 * @param {unknown} value
 * @param {RegExp} pattern
 * @param {string} label
 * @returns {string}
 */
function requireId(value, pattern, label) {
  if (typeof value !== "string" || value.length === 0 || !pattern.test(value)) {
    throw new MissionResultError("invalid_id", `${label} is not a safe local identity`);
  }
  return value;
}

// Digest faults are not identity faults: "not a safe local identity" tells
// the operator nothing about a malformed SHA-256. Same code, honest prose.
function requireDigest(value, label) {
  if (typeof value !== "string" || !SHA256_HEX.test(value)) {
    throw new MissionResultError("invalid_id", `${label} must be a 64-char lowercase SHA-256 digest`);
  }
  return value;
}

/**
 * Bounded-string predicate (nc3-swarm r78): the envelope's optional text
 * fields all apply the same doctrine — a string within a UTF-8 byte cap,
 * optionally nonempty — but each site spelled the check inline and the
 * `.some()` axis member check could not share a throwing helper at all.
 * The predicate carries the shape; the caller keeps its own `invalid_type`
 * message so emitted errors stay byte-identical per site.
 * Fail closed, `readBoundedFd` parity (nc5-swarm r14): a nonsense cap must
 * never silently disable the bound — NaN/±Infinity/fractions/negatives
 * throw `invalid_bound` at the first call instead of letting every string
 * through unbounded. All call sites pass constant caps inside envelope
 * validation, where MissionResultError is the module's own fault class.
 * @param {unknown} value
 * @param {number} maximumBytes UTF-8 byte cap (inclusive), non-negative safe integer
 * @param {boolean} [nonempty] require length > 0
 * @returns {boolean}
 */
export function boundedString(value, maximumBytes, nonempty = false) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0) {
    throw new MissionResultError("invalid_bound", "boundedString maximumBytes must be a non-negative safe integer");
  }
  return typeof value === "string"
    && (!nonempty || value.length > 0)
    && Buffer.byteLength(value, "utf8") <= maximumBytes;
}

/**
 * Normalize the optional report-landing summary (nc5-swarm r15): collect's
 * answer to "which lane reports never landed on disk". The arithmetic is
 * pinned, not trusted — `present + missing.length === expected` — and when
 * the entries carry `reportPresent` the summary is cross-checked against
 * them (`expected` is the member count; `present`/`missing` must reproduce
 * the true/false split exactly; presence must be all-or-none). A wave that
 * never declared a reportDir passes no summary and the field stays absent.
 * @param {unknown} value
 * @param {Array<{reportPresent?: boolean}>} subagents normalized entries
 * @returns {{expected: number, present: number, missing: string[]}|null}
 */
function normalizeReportSummary(value, subagents) {
  if (value === undefined) return null;
  const object = plainObject(value, "reportSummary");
  rejectUnknown(object, REPORT_SUMMARY_KEYS, "reportSummary");
  for (const key of ["expected", "present"]) {
    if (!Number.isSafeInteger(object[key]) || object[key] < 0) {
      throw new MissionResultError("invalid_type", `reportSummary.${key} must be a non-negative safe integer`);
    }
  }
  if (!Array.isArray(object.missing)) {
    throw new MissionResultError("invalid_type", "reportSummary.missing must be an array of member names");
  }
  if (object.present + object.missing.length !== object.expected) {
    throw new MissionResultError("inconsistent_derived", "reportSummary present + missing must equal expected");
  }
  const missing = object.missing.map((name, index) => {
    if (!boundedString(name, 256, true)) {
      throw new MissionResultError("invalid_type", `reportSummary.missing[${index}] must be a non-empty string within 256 bytes`);
    }
    return name;
  });
  const withPresence = subagents.filter((entry) => typeof entry.reportPresent === "boolean");
  if (withPresence.length > 0) {
    if (withPresence.length !== subagents.length) {
      throw new MissionResultError("inconsistent_derived", "reportSummary requires reportPresent on every entry or on none");
    }
    const present = subagents.filter((entry) => entry.reportPresent === true).length;
    if (object.expected !== subagents.length
        || object.present !== present
        || missing.length !== subagents.length - present) {
      throw new MissionResultError("inconsistent_derived", "reportSummary does not match entry reportPresent evidence");
    }
  } else if (object.expected !== subagents.length) {
    // No entry carries reportPresent, so present/missing cannot be
    // cross-checked — but expected is still a count of THIS envelope's
    // members and must agree with it (nc5-swarm r16, Audit07: a hand-built
    // summary with 2 entries and expected:3 used to validate, letting a
    // producer overstate the wave it never ran).
    throw new MissionResultError("inconsistent_derived", "reportSummary expected must equal the subagent count");
  }
  return { expected: object.expected, present: object.present, missing };
}

/**
 * Normalize an optional receipt-bound iteration decision. The decision is
 * declared by the producing agent and bound to the same report bytes as the
 * receipt; it is never a canonical Rust convergence verdict. `nativeVerdict`
 * is an optional digest reference to a real verdict artifact and is passed
 * through verbatim — it is never fabricated here.
 * @param {unknown} raw
 * @returns {{decision: string, reason?: string, nativeVerdict?: string}|null}
 */
function normalizeIterationDecision(raw) {
  if (raw == null) return null;
  const value = plainObject(raw, "receipt iteration");
  rejectUnknown(value, ITERATION_KEYS, "receipt iteration");
  if (!ITERATION_DECISIONS.includes(/** @type {string} */ (value.decision))) {
    throw new MissionResultError(
      "invalid_enum",
      `iteration.decision must be ${ITERATION_DECISIONS.join("|")}`,
    );
  }
  /** @type {{decision: string, reason?: string, nativeVerdict?: string}} */
  const iteration = { decision: /** @type {string} */ (value.decision) };
  if ("reason" in value) {
    if (!boundedString(value.reason, 1024, true)) {
      throw new MissionResultError("invalid_type", "iteration.reason must be a string within 1024 bytes");
    }
    iteration.reason = value.reason;
  }
  if ("nativeVerdict" in value) {
    iteration.nativeVerdict = requireDigest(value.nativeVerdict, "iteration.nativeVerdict");
  }
  if ("blockedAudit" in value) {
    const audit = plainObject(value.blockedAudit, "receipt iteration.blockedAudit");
    rejectUnknown(audit, ["transportFailures", "workFailures", "detail"], "receipt iteration.blockedAudit");
    for (const key of ["transportFailures", "workFailures"]) {
      if (!Number.isSafeInteger(audit[key]) || audit[key] < 0) {
        throw new MissionResultError("invalid_type", `iteration.blockedAudit.${key} must be a nonnegative integer`);
      }
    }
    if ("detail" in audit && !boundedString(audit.detail, 1024)) {
      throw new MissionResultError("invalid_type", "iteration.blockedAudit.detail must be a string within 1024 bytes");
    }
    iteration.blockedAudit = {
      transportFailures: audit.transportFailures,
      workFailures: audit.workFailures,
      ...(audit.detail !== undefined ? { detail: audit.detail } : {}),
    };
  }
  return iteration;
}

/**
 * Normalize the optional terminal-outcome triple (spec 13 §2). Each supplied
 * field is validated against its frozen vocabulary and passed through
 * verbatim; a field the producer did not supply stays absent rather than being
 * defaulted, so an unknown outcome is reported as absent, never invented.
 * @param {Record<string, unknown>} value
 * @returns {Record<string, string>}
 */
function normalizeOutcomeTriple(value) {
  /** @type {Record<string, string>} */
  const triple = {};
  for (const key of OUTCOME_TRIPLE_KEYS) {
    if (!(key in value)) continue;
    const allowed = OUTCOME_TRIPLE_VALUES[key];
    if (!allowed.includes(/** @type {string} */ (value[key]))) {
      throw new MissionResultError("invalid_enum", `${key} must be ${allowed.join("|")}`);
    }
    triple[key] = /** @type {string} */ (value[key]);
  }
  return triple;
}

/**
 * @param {unknown} raw
 * @returns {MissionResultEntry}
 */
function normalizeEntry(raw) {
  const value = plainObject(raw, "subagent");
  rejectUnknown(value, ENTRY_KEYS, "subagent");
  if (!OUTCOMES.includes(/** @type {string} */ (value.outcome))) {
    throw new MissionResultError("invalid_enum", "outcome must be completed|failed|aborted");
  }
  if (!STATES.includes(/** @type {string} */ (value.state))) {
    throw new MissionResultError("invalid_enum", "state must be started|not_started");
  }
  if (value.outcome === "completed" && value.state === "not_started") {
    throw new MissionResultError("inconsistent_entry", "completed entries cannot be not_started");
  }
  if (!boundedString(value.body, 1024 * 1024)) {
    throw new MissionResultError("invalid_type", "body must be a string within the 1 MiB bound");
  }

  /** @type {MissionResultEntry} */
  const entry = {
    outcome: /** @type {MissionResultEntry["outcome"]} */ (value.outcome),
    state: /** @type {MissionResultEntry["state"]} */ (value.state),
    body: value.body,
  };
  if ("agentId" in value) {
    entry.agentId = requireId(value.agentId, LOCAL_ID, "agentId");
  }
  if ("item" in value) {
    if (!boundedString(value.item, 64 * 1024)) {
      throw new MissionResultError("invalid_type", "item must be a string within the 64 KiB bound");
    }
    entry.item = value.item;
  }
  if ("axes" in value) {
    // Per-lane judgment binding (ufo-swarm-wave spec items[].axes): a bounded
    // list of axis names the member was scored on. Mirrors the producer's
    // 8-name / 256-byte bounds.
    if (!Array.isArray(value.axes) || value.axes.length === 0 || value.axes.length > 8
        || value.axes.some((axis) => !boundedString(axis, 256, true))) {
      throw new MissionResultError("invalid_type", "axes must be an array of 1..8 nonempty strings within 256 bytes each");
    }
    // Wave-side parity (ufo-swarm-wave validateLaneMeta): a duplicated axis
    // name is a malformed judgment binding — the producer refuses it at mint,
    // so the envelope refuses it at admission rather than carrying a binding
    // no wave could have declared.
    if (new Set(value.axes).size !== value.axes.length) {
      throw new MissionResultError("invalid_type", "axes must not repeat an axis name");
    }
    entry.axes = value.axes;
  }
  if ("milestone" in value) {
    if (!boundedString(value.milestone, 256, true)) {
      throw new MissionResultError("invalid_type", "milestone must be a nonempty string within 256 bytes");
    }
    entry.milestone = value.milestone;
  }
  if ("mode" in value) {
    if (value.mode !== "resume") {
      throw new MissionResultError("invalid_enum", 'mode must be "resume" when present');
    }
    if (!entry.agentId) {
      throw new MissionResultError("resume_without_id", "mode resume requires agentId");
    }
    entry.mode = "resume";
  }
  if ("memberIndex" in value) {
    if (!Number.isSafeInteger(value.memberIndex) || value.memberIndex < 1) {
      throw new MissionResultError("invalid_type", "memberIndex must be a positive integer");
    }
    entry.memberIndex = value.memberIndex;
  }
  if ("stopReason" in value) {
    if (!boundedString(value.stopReason, 4096)) {
      throw new MissionResultError("invalid_type", "stopReason must be a string within the 4 KiB bound");
    }
    entry.stopReason = value.stopReason;
  }
  if ("failureClass" in value) {
    if (!ENTRY_FAILURE_CLASSES.includes(/** @type {string} */ (value.failureClass))) {
      throw new MissionResultError("invalid_enum", `failureClass must be ${ENTRY_FAILURE_CLASSES.join("|")}`);
    }
    // A completed member has no failure cause — carrying one is contradictory
    // evidence (ufo-swarm-collect.mjs refuses the same pair at produce time).
    // Runs after the enum check so a bad class still reports invalid_enum.
    if (value.outcome === "completed") {
      throw new MissionResultError("inconsistent_entry", "completed entries cannot carry failureClass");
    }
    entry.failureClass = /** @type {string} */ (value.failureClass);
  }
  if ("reportPresent" in value) {
    // Lane report existence (ufo-swarm-collect, only when the wave declared a
    // reportDir): true when <reportDir>/<name>.md exists at collect time.
    // Boolean only — a non-boolean is contradictory evidence, not coerced.
    if (typeof value.reportPresent !== "boolean") {
      throw new MissionResultError("invalid_type", "reportPresent must be a boolean");
    }
    entry.reportPresent = value.reportPresent;
  }
  return entry;
}
/**
 * @param {MissionResultEntry[]} subagents
 */
function derive(subagents) {
  let completed = 0;
  let failed = 0;
  let aborted = 0;
  /** @type {string[]} */
  const resumeIds = [];
  const seen = new Set();
  const seenIndex = new Set();
  for (const entry of subagents) {
    if (entry.agentId) {
      if (seen.has(entry.agentId)) {
        throw new MissionResultError("duplicate_agent_id", `duplicate agentId ${entry.agentId}`);
      }
      seen.add(entry.agentId);
    }
    if (entry.memberIndex !== undefined) {
      if (seenIndex.has(entry.memberIndex)) {
        throw new MissionResultError("duplicate_member_index", `duplicate memberIndex ${entry.memberIndex}`);
      }
      seenIndex.add(entry.memberIndex);
    }
    if (entry.outcome === "completed") completed += 1;
    else if (entry.outcome === "failed") failed += 1;
    else aborted += 1;
    if (entry.outcome !== "completed" && entry.agentId) {
      resumeIds.push(entry.agentId);
    }
  }
  const parts = [];
  if (completed > 0) parts.push(`completed: ${completed}`);
  if (failed > 0) parts.push(`failed: ${failed}`);
  if (aborted > 0) parts.push(`aborted: ${aborted}`);
  const summary = parts.join(", ");
  const resumeHint =
    resumeIds.length > 0
      ? `Resume unfinished OMP identities: ${resumeIds.join(", ")} (identity continuity only; advisory, not execution).`
      : null;
  return {
    summary,
    completed,
    failed,
    aborted,
    total: subagents.length,
    resumeHint,
  };
}

/**
 * Build a typed mission-result envelope from owner ids and subagent rows.
 * The optional `round_validity`/`loop_stop`/`mission_goal` fields are passed
 * through when supplied and left absent otherwise.
 * @param {{runId: string, sessionId: string, subagents: unknown[],
 *   reportSummary?: {expected: number, present: number, missing: string[]},
 *   round_validity?: string, loop_stop?: string, mission_goal?: string}} input
 * @returns {MissionResultEnvelope}
 */
export function createMissionResult(input) {
  const value = plainObject(input, "mission result input");
  rejectUnknown(value, INPUT_KEYS, "mission result input");
  const runId = requireId(value.runId, RUN_ID, "runId");
  const sessionId = requireId(value.sessionId, SESSION_ID, "sessionId");
  if (!Array.isArray(value.subagents)) {
    throw new MissionResultError("invalid_type", "subagents must be an array");
  }
  const subagents = value.subagents.map(normalizeEntry);
  const counts = derive(subagents);
  const reportSummary = normalizeReportSummary(value.reportSummary, subagents);
  return {
    schema: SCHEMA,
    runId,
    sessionId,
    subagents,
    ...counts,
    ...(reportSummary !== null ? { reportSummary } : {}),
    ...normalizeOutcomeTriple(value),
  };
}

/**
 * Strict envelope check: unknown fields, enums, derived counts, duplicate IDs.
 * @param {unknown} value
 * @returns {MissionResultEnvelope}
 */
export function validateMissionResult(value) {
  const object = plainObject(value, "mission result");
  rejectUnknown(object, ENVELOPE_KEYS, "mission result");
  if (object.schema !== SCHEMA) {
    throw new MissionResultError("invalid_schema", `schema must be ${SCHEMA}`);
  }
  const triple = {};
  for (const key of OUTCOME_TRIPLE_KEYS) {
    if (key in object) triple[key] = object[key];
  }
  const created = createMissionResult({
    runId: object.runId,
    sessionId: object.sessionId,
    subagents: object.subagents,
    // Report-landing summary pass-through (nc5-swarm r15): create re-runs
    // the full normalization and cross-check, so a malformed summary throws
    // inside create and a well-formed one round-trips canonically.
    ...("reportSummary" in object ? { reportSummary: object.reportSummary } : {}),
    ...triple,
  });
  for (const key of ["summary", "completed", "failed", "aborted", "total", "resumeHint"]) {
    if (!(key in object)) {
      throw new MissionResultError("missing_derived", `missing derived field ${key}`);
    }
    if (object[key] !== created[key]) {
      throw new MissionResultError("inconsistent_derived", `derived field ${key} does not match entries`);
    }
  }
  return created;
}

/**
 * @param {string} text
 * @param {boolean} [attribute]
 */
function escapeXml(text, attribute = false) {
  if (/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(text)) {
    throw new MissionResultError("invalid_xml_text", "text contains characters XML 1.0 cannot represent");
  }
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("\r", "&#13;");
  return attribute ? escaped.replaceAll("\n", "&#10;").replaceAll("\t", "&#9;") : escaped;
}

/**
 * Render evidence XML. Escapes every text and attribute; no parser.
 * @param {MissionResultEnvelope} envelope
 * @returns {string}
 */
export function renderMissionResultXml(envelope) {
  const valid = validateMissionResult(envelope);
  const lines = ["<agent_swarm_result>", `<summary>${escapeXml(valid.summary)}</summary>`];
  for (const key of OUTCOME_TRIPLE_KEYS) {
    if (valid[key] !== undefined) lines.push(`<${key}>${escapeXml(valid[key])}</${key}>`);
  }
  if (valid.resumeHint) {
    lines.push(`<resume_hint>${escapeXml(valid.resumeHint)}</resume_hint>`);
  }
  if (valid.reportSummary) {
    // Landing summary parity (nc5-swarm r15): emitted, never silently
    // dropped — a missing report visible in JSON must stay visible in XML.
    // expected/present are validated safe integers; names are escaped text.
    const summary = valid.reportSummary;
    const missing = summary.missing.map((name) => `<missing>${escapeXml(name)}</missing>`).join("");
    lines.push(`<report_summary expected="${summary.expected}" present="${summary.present}">${missing}</report_summary>`);
  }
  for (const entry of valid.subagents) {
    const attrs = [`outcome="${escapeXml(entry.outcome)}"`, `state="${escapeXml(entry.state)}"`];
    if (entry.mode === "resume") attrs.unshift(`mode="resume"`);
    if (entry.agentId) attrs.push(`agent_id="${escapeXml(entry.agentId)}"`);
    if (entry.item !== undefined) attrs.push(`item="${escapeXml(entry.item, true)}"`);
    if (entry.axes !== undefined) attrs.push(`axes="${escapeXml(entry.axes.join(","), true)}"`);
    if (entry.milestone !== undefined) attrs.push(`milestone="${escapeXml(entry.milestone, true)}"`);
    if (entry.memberIndex !== undefined) attrs.push(`member_index="${entry.memberIndex}"`);
    if (entry.stopReason !== undefined) attrs.push(`stop_reason="${escapeXml(entry.stopReason, true)}"`);
    if (entry.failureClass !== undefined) attrs.push(`failure_class="${escapeXml(entry.failureClass)}"`);
    if (typeof entry.reportPresent === "boolean") attrs.push(`report_present="${entry.reportPresent}"`);
    lines.push(`<subagent ${attrs.join(" ")}>${escapeXml(entry.body)}</subagent>`);
  }
  lines.push("</agent_swarm_result>");
  return `${lines.join("\n")}\n`;
}

/**
 * The seven identity/binding fields every task receipt carries, validated
 * once for both the producer (createTaskReceipt) and the admission path
 * (validateTaskReceipt) — the two functions used to repeat this block
 * verbatim, so a bound or pattern change could drift between mint and
 * admission. Field order in the returned object is the receipt's own key
 * order; callers spread it into their envelope shape.
 * @param {Record<string, unknown>} value
 */
function receiptCoreFields(value) {
  return {
    taskKey: requireId(value.taskKey, TASK_KEY, "taskKey"),
    runId: requireId(value.runId, RUN_ID, "runId"),
    sessionId: requireId(value.sessionId, SESSION_ID, "sessionId"),
    promptSha256: requireDigest(value.promptSha256, "promptSha256"),
    configSha256: requireDigest(value.configSha256, "configSha256"),
    reportSha256: requireDigest(value.reportSha256, "reportSha256"),
    producerId: requireId(value.producerId, LOCAL_ID, "producerId"),
  };
}

/**
 * Build a versioned task-result receipt binding task identity to report bytes.
 * `iteration` is an optional receipt-bound round decision
 * ({decision, reason?, nativeVerdict?}); it is declared evidence, never a
 * canonical Rust convergence verdict.
 * @param {{taskKey: string, runId: string, sessionId: string, promptSha256: string, configSha256: string, reportSha256: string, producerId: string, iteration?: object}} input
 * @returns {object}
 */
export function createTaskReceipt(input) {
  const value = plainObject(input, "task receipt input");
  rejectUnknown(value, ["taskKey", "runId", "sessionId", "promptSha256", "configSha256", "reportSha256", "producerId", "iteration"], "task receipt input");
  const core = receiptCoreFields(value);
  const iteration = normalizeIterationDecision(value.iteration);
  return {
    schema: RECEIPT_SCHEMA,
    ...core,
    createdAt: new Date().toISOString(),
    ...(iteration ? { iteration } : {}),
  };
}

/**
 * Validate a task receipt: schema, field types, cross-check against expected task metadata.
 * @param {unknown} value
 * @param {{taskKey?: string, runId?: string, sessionId?: string, promptSha256?: string, configSha256?: string, reportSha256?: string}} [expected]
 * @returns {object}
 */
export function validateTaskReceipt(value, expected = {}) {
  const object = plainObject(value, "task receipt");
  rejectUnknown(object, RECEIPT_KEYS, "task receipt");
  if (object.schema !== RECEIPT_SCHEMA) {
    throw new MissionResultError("invalid_schema", `receipt schema must be ${RECEIPT_SCHEMA}`);
  }
  const core = receiptCoreFields(object);
  // Shape plus calendar truth: the regex alone admits impossible dates
  // (2026-13-40) and out-of-range offsets; Date.parse rejects those but
  // ROLLS impossible calendar days (2026-02-30 → Mar 2) and 24:00, so the
  // day-of-month and hour get a real calendar arm on the captured fields.
  const createdAtMatch = typeof object.createdAt === "string"
    ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/u.exec(object.createdAt)
    : null;
  if (createdAtMatch === null || Number.isNaN(Date.parse(object.createdAt))) {
    throw new MissionResultError("invalid_type", "createdAt must be a valid ISO-8601 timestamp string");
  }
  const [, year, month, day, hour] = createdAtMatch;
  const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (Number(day) > daysInMonth || Number(hour) > 23) {
    throw new MissionResultError("invalid_type", "createdAt must be a valid ISO-8601 timestamp string");
  }
  // Cross-check against expected task metadata when provided — one doctrine
  // per bound field: a supplied expectation must equal the receipt's value,
  // else receipt_mismatch with that field's named label (nc3-swarm r64).
  for (const [key, label] of [
    ["taskKey", "expected task"],
    ["runId", "expected task"],
    ["sessionId", "expected task"],
    ["promptSha256", "expected task"],
    ["configSha256", "stored config digest"],
    ["reportSha256", "result file"],
  ]) {
    if (expected[key] !== undefined && core[key] !== expected[key]) {
      throw new MissionResultError("receipt_mismatch", `receipt ${key} does not match ${label}`, { field: key });
    }
  }
  const iteration = normalizeIterationDecision(object.iteration);
  return {
    schema: RECEIPT_SCHEMA,
    ...core,
    createdAt: object.createdAt,
    ...(iteration ? { iteration } : {}),
  };
}

// ── Shared bounded-read / atomic-write primitives ──
// Canonical home for the fleet's durability IO. The wave family
// (ufo-swarm-wave, ufo-swarm-collect, ufo-l0-monitor, ufo-l0-watch,
// ufo-stale-watchdog) and the mission-display CLIs all carried
// near-identical private copies that drifted — ufo-stale-watchdog's
// grow-from-empty exemption was removed everywhere else and left behind
// there. One implementation now; callers keep their own error contracts
// through `fail`, which receives a stable `kind`, never a caller's code.

const defaultBoundedFail = (message) => { throw new Error(message); };

/**
 * Blocking spin-wait (nc3-swarm r64): the EAGAIN retry, the singleton-lock
 * ticket backoff, the dir-lock acquire backoff, and both daemon poll loops
 * each spelled `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
 * ms)` inline. One named primitive; a fresh SharedArrayBuffer per call keeps
 * the semantics of the inline copies (a zeroed cell, waited on once).
 * @param {number} ms
 */
export function spinWait(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Bounded read on an already-open fd. fstat pins the size BEFORE buffering;
 * a regular file gets a size+1 slack buffer so a mid-read grow consumes the
 * slack and fails closed, and the post-read fstat catches a mid-read shrink
 * or grow. Non-regular fds (pipes, stdin) have no trustworthy size: they
 * read in 64KiB chunks and die the moment the bound is crossed. EAGAIN is
 * retried only on non-regular fds — a regular file never raises it, and
 * retrying there would spin forever on an exotic driver fault.
 * `fail(message, kind)` maps faults to the caller's error contract; kinds:
 * "not_regular" | "too_large" | "changed" | "invalid_bound". Default: plain
 * Error. `maximum` undefined/null reads unbounded (single-arg callers);
 * any other value must be a non-negative safe integer.
 * `wrapReadError` maps a raw readSync failure (never a fail()-thrown
 * error); default propagates the raw errno-coded error.
 * @param {number} fd
 * @param {number} maximum
 * @param {string} label
 * @param {(message: string, kind: string) => never} [fail]
 * @param {(error: unknown) => never} [wrapReadError]
 * @returns {Buffer} raw bytes — never a utf8 string: create-receipt hashes
 *   report bytes through this reader and a string round-trip would alias
 *   invalid UTF-8 onto U+FFFD.
 */
export function readBoundedFd(fd, maximum, label, fail = defaultBoundedFail, wrapReadError = null) {
  // Bound admission: `undefined`/`null` is the documented unbounded
  // convention (many single-arg readBoundedFile callers rely on it), but
  // any OTHER non-safe-integer value (NaN, Infinity, fractions) silently
  // disabled every comparison below and read unbounded (r14 audit,
  // Audit08). Name the nonsense value instead.
  if (maximum !== undefined && maximum !== null
    && (!Number.isSafeInteger(maximum) || maximum < 0)) {
    fail(`${label} bound must be a non-negative safe integer`, "invalid_bound");
  }
  const info = fstatSync(fd);
  const isFile = info.isFile();
  if (isFile && info.size > maximum) fail(`${label} exceeds ${maximum} bytes`, "too_large");
  const raw = Buffer.allocUnsafe(isFile && info.size > 0 ? info.size + 1 : 65_536);
  const chunks = [];
  let offset = 0;
  let total = 0;
  for (;;) {
    let count;
    try {
      count = readSync(fd, raw, offset, raw.length - offset, null);
    } catch (error) {
      // fd 0 can be non-blocking (inherited O_NONBLOCK survives exec; stream
      // mode sets it): readSync raises EAGAIN while the writer is still
      // producing — pipe drained, not closed. Wait 1ms and retry so the
      // bound is reachable past the 64KiB pipe buffer (fleet-dispatcher r12
      // parity). Regular files never EAGAIN.
      if (!isFile && (error?.code === "EAGAIN" || error?.code === "EWOULDBLOCK")) {
        spinWait(1);
        continue;
      }
      if (wrapReadError !== null) wrapReadError(error);
      throw error;
    }
    if (count === 0) break;
    offset += count;
    total += count;
    if (total > maximum) fail(`${label} exceeds ${maximum} bytes`, "too_large");
    if (offset === raw.length) {
      if (isFile && info.size > 0) {
        // Slack byte consumed: the file grew past its stat size mid-read.
        fail(`${label} changed size while being read`, "changed");
      }
      // Copy before the buffer is reused: a subarray view would be
      // overwritten by the next read and corrupt earlier chunks.
      chunks.push(Buffer.from(raw.subarray(0, offset)));
      offset = 0;
    }
  }
  // No size>0 exemption: a file empty at fstat that grew before the read is
  // the same mid-read mutation — offset>0 against the pinned 0 catches it.
  if (isFile && (offset !== info.size || fstatSync(fd).size !== info.size)) {
    fail(`${label} changed size while being read`, "changed");
  }
  chunks.push(raw.subarray(0, offset));
  return Buffer.concat(chunks, total);
}

/**
 * Bounded read on a path: O_NOFOLLOW refuses a symlink at open (ELOOP
 * propagates as raw errno — wave-family parity; callers that map it keep
 * their own catch), and O_NONBLOCK fails a FIFO or other non-regular
 * occupant instead of hanging before the isFile refusal.
 */
export function readBoundedFile(path, maximum, label, fail = defaultBoundedFail) {
  const fd = openSync(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);
  try {
    if (!fstatSync(fd).isFile()) fail(`${label} is not a regular file`, "not_regular");
    return readBoundedFd(fd, maximum, label, fail);
  } finally {
    closeSync(fd);
  }
}

/**
 * Bounded stdin read (`-` alias): fd 0 through the same fail-closed loop.
 * Raw readSync faults are wrapped with the stdin context the wave family's
 * private copies produced — a fail()-thrown typed error passes through
 * untouched because wrapReadError only sees raw fs failures.
 */
export function readBoundedStdin(maximum, label, fail = defaultBoundedFail) {
  return readBoundedFd(0, maximum, label, fail, (error) =>
    fail(`${label} could not be read from stdin: ${error?.code ?? error?.message ?? error}`, "read_error"));
}

/**
 * Strip the trailing ", <syscall> '<path>'" tail Node interpolates into fs
 * error messages ("ENOENT: no such file or directory, open '/abs/x'"), so
 * typed error envelopes never leak absolute paths (nc5-swarm r02
 * error-surface pass). The errno and its description stay; only the path
 * goes. Non-fs messages pass through unchanged.
 * @param {unknown} error
 * @returns {string}
 */
export function redactFsErrorMessage(error) {
  return String(error instanceof Error ? error.message : error)
    .replace(/, (?:open|read|close|stat|lstat|fstat|unlink|write|mkdir|rmdir|rename|access) '[^']*'$/u, "")
    // Two-path rename tail (nc5-swarm r03): writeFileAtomic publishes via
    // rename, whose message spells BOTH the random tmp source and the
    // resolved destination — the single-path arm cannot match it.
    .replace(/, rename '[^']*' -> '[^']*'$/u, "");
}

/**
 * Errno codes whose fs faults are operator input on an operator-named path
 * (nc5-swarm r04: shared hub spelling — collect had the only copy; the
 * lifecycle/activity/observation/monitor CLI envelopes now redact the same
 * class). Resource faults (ENOSPC/EDQUOT) and collision faults (EEXIST on
 * the random tmp name) stay internal: the operator cannot fix them by
 * retyping the path.
 */
export const OPERATOR_PATH_ERRNOS = new Set(["ENOENT", "ENOTDIR", "ELOOP", "EACCES", "EPERM", "EISDIR"]);

/** Known-sensitive root prefixes for `redactAbsolutePaths` (nc5-swarm r05):
 *  the repo root and the enclosing isolation root, longest first so the
 *  nested repo keeps its own tag instead of being swallowed by the iso
 *  prefix. */
export function knownRootTags(root) {
  return [
    { root, tag: "repo" },
    { root: resolve(root, ".."), tag: "iso" },
  ];
}

/** Absolute-path redaction for durable LOG surfaces (nc5-swarm r05): the
 *  r04 CLI envelopes covered errno tails, but daemon telemetry forwards
 *  child output verbatim — a dispatcher refusal embeds
 *  `"queuePath":"/abs/.../repo/.ufo/queue.json"` inside its JSON envelope,
 *  which no errno-tail rule matches. Replacing known root prefixes with
 *  `<repo>`/`<iso>` keeps the relative tail (`.ufo/queue.json`) fully
 *  diagnosable while never persisting the host layout. Unknown absolute
 *  paths pass through: only roots the caller names are redacted, so the
 *  transform is opt-in and byte-predictable. Composes with (does not
 *  replace) `redactFsErrorMessage` — errno tails lose the path entirely,
 *  embedded JSON paths keep their repo-relative form.
 * @param {unknown} value
 * @param {{root: string, tag: string}[]} roots longest root first
 * @returns {string}
 */
export function redactAbsolutePaths(value, roots) {
  let text = String(value);
  for (const { root, tag } of roots) {
    if (typeof root !== "string" || root.length < 2) continue;
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "g"), `<${tag}>`);
  }
  return text;
}

/**
 * Bounded JSON artifact read (nc3-swarm r82): the queue-row evidence
 * surfaces — monitor settle/findStalled/repair, watch readState/hole
 * verdict/successor receipt, wave policy + lock-owner readers, this file's
 * readOwner default and readQueueFile — each spelled
 * `JSON.parse(readBoundedFile(path, bound, label).toString("utf8"))`
 * inline. One named read keeps the bound + O_NOFOLLOW/O_NONBLOCK contract
 * beside the parse; a JSON SyntaxError propagates for the caller to name,
 * and `fail` keeps the caller's typed-error contract (readBoundedFile
 * convention). Deliberately NOT adopted: collect's readJsonInput (own
 * enoentAsNull/errno doctrine), wave's loadRegistry (the parse carries its
 * own invalid_registry arm), watchdog's readBoundedFile (utf8-string
 * return, EINVAL/EFBIG codes).
 * @param {string} path
 * @param {number} maximum byte bound
 * @param {string} label bounded-read label
 * @param {(message: string, kind: string) => never} [fail]
 * @returns {unknown} parsed JSON
 */
export function readBoundedJson(path, maximum, label, fail = defaultBoundedFail) {
  return JSON.parse(readBoundedFile(path, maximum, label, fail).toString("utf8"));
}

/**
 * Atomic publish: random O_EXCL tmp + fsync + rename + directory fsync.
 * The tmp name carries pid+UUID because the destination may be
 * operator-controlled (collect --out, spec reportDir): a predictable name
 * is a symlink squat target — O_EXCL fails the open instead of following a
 * pre-planted link (a symlinked leaf IS an existing pathname, so the POSIX
 * create-exclusive rule refuses it without needing an explicit O_NOFOLLOW).
 * fsync BEFORE rename publishes durable bytes; the directory fsync makes
 * the rename itself survive a crash. Does NOT mkdir the parent — callers
 * that create their tree do it themselves.
 *
 * nc5-final-swarm r01 (PrimeAgent S5 parity, one step stronger): between
 * stage and rename the tmp PATHNAME is re-verified against the staged
 * inode (dev+ino, not merely "is a regular file" — a plain type check
 * misses an inode swap to another regular file, planner-executed). A
 * mismatch means some actor swapped the tmp path inside a
 * spec-controlled/shared-writable directory: the publish refuses, the
 * foreign object at the tmp path is left in place (never unlinked — the
 * pathname stopped naming our inode), and our own tmp is cleaned only
 * while it still names our inode. Cleanup also stands down after a
 * successful rename, so a post-rename fault (e.g. directory fsync EIO)
 * can never unlink a foreign re-plant at the vacated tmp name
 * (executed: rename + foreign replant + dir-fsync fault used to remove
 * the foreign file). `seams` is a test-only hook object: afterStage(tmp)
 * runs between fsync and the identity check (swap/EIO probes),
 * fsyncDir(dirFd) overrides the directory fsync; production callers pass
 * nothing and every byte of the publish sequence is unchanged.
 */
export function writeFileAtomic(path, body, seams = undefined) {
  const tmp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let renamed = false;
  let ownsTmp = true;
  try {
    const fd = openSync(tmp, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL, 0o600);
    let staged;
    try {
      writeFileSync(fd, body);
      fsyncSync(fd);
      staged = fstatSync(fd);
    } finally { closeSync(fd); }
    if (seams && typeof seams.afterStage === "function") seams.afterStage(tmp);
    let atPath;
    try { atPath = lstatSync(tmp); } catch { atPath = null; }
    if (!atPath || !atPath.isFile() || atPath.dev !== staged.dev || atPath.ino !== staged.ino) {
      // The tmp pathname no longer names our staged inode — never publish
      // foreign bytes and never unlink an object that is not ours.
      ownsTmp = false;
      throw new Error(`atomic publish refused: staged tmp was replaced before rename (possible swap); foreign object left in place`);
    }
    renameSync(tmp, path);
    renamed = true;
    const dirFd = openSync(dirname(path), fsConstants.O_RDONLY | fsConstants.O_DIRECTORY);
    try {
      if (seams && typeof seams.fsyncDir === "function") seams.fsyncDir(dirFd);
      else fsyncSync(dirFd);
    } finally { closeSync(dirFd); }
  } catch (error) {
    // Cleanup only while the tmp path still names OUR inode and we have not
    // published: after a rename the pathname is foreign territory; after a
    // detected swap it names a foreign object. Both are left alone.
    if (!renamed && ownsTmp) {
      try { unlinkSync(tmp); } catch { /* tmp may never have been created */ }
    }
    throw error;
  }
}

/**
 * nc5-swarm r24: atomic two-file commit for a primary artifact and its
 * sidecar. Stages both bodies as O_EXCL temps in the primary's directory,
 * fsyncs both, then publishes sidecar and primary by rename (sidecar first
 * so a reader that gates on the primary's existence never sees half the
 * pair), and fsyncs the directory once for both dentries. On any fault the
 * temps are unlinked and — if this call already published the sidecar — the
 * sidecar is retracted best-effort, so a typed CLI fault never leaves half
 * the pair on disk. The original errno is rethrown verbatim so callers'
 * OPERATOR_PATH_ERRNOS mapping is unchanged. The one window this cannot
 * close is kill -9 between the two renames (no journal) — documented in
 * ufo-swarm-collect's emit path.
 *
 * nc5-final-swarm r01 (PrimeAgent S5 parity): each tmp pathname is
 * re-verified against its staged inode (dev+ino) before its rename, and
 * cleanup unlinks a temp only while it still names our staged inode and
 * its rename has not completed — a detected swap or a post-rename fault
 * can never unlink a foreign object at the vacated tmp name. A swap on
 * the PRIMARY tmp after the sidecar rename retracts the half-published
 * sidecar (existing pair semantics) and leaves the foreign tmp object in
 * place. `seams` is a test-only hook object: afterStagePrimary(tmp) and
 * afterStageSidecar(tmp) run between fsync and the identity check,
 * fsyncDir(dirFd) overrides the directory fsync; production callers pass
 * nothing and every byte of the publish sequence is unchanged.
 */
export function writeFilePairAtomic(primaryPath, primaryBody, sidecarPath, sidecarBody, seams = undefined) {
  const tmpPrimary = `${primaryPath}.tmp-${process.pid}-${randomUUID()}`;
  const tmpSidecar = `${sidecarPath}.tmp-${process.pid}-${randomUUID()}`;
  let sidecarPublished = false;
  let primaryPublished = false;
  const tmpState = new Map([[tmpPrimary, { owns: true, renamed: false }], [tmpSidecar, { owns: true, renamed: false }]]);
  const stage = (tmp, body) => {
    const fd = openSync(tmp, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL, 0o600);
    let staged;
    try {
      writeFileSync(fd, body);
      fsyncSync(fd);
      staged = fstatSync(fd);
    } finally { closeSync(fd); }
    return staged;
  };
  const identityGate = (tmp, staged) => {
    let atPath;
    try { atPath = lstatSync(tmp); } catch { atPath = null; }
    if (!atPath || !atPath.isFile() || atPath.dev !== staged.dev || atPath.ino !== staged.ino) {
      tmpState.get(tmp).owns = false;
      throw new Error(`atomic publish refused: staged tmp was replaced before rename (possible swap); foreign object left in place`);
    }
  };
  const cleanTmp = (tmp) => {
    const state = tmpState.get(tmp);
    if (state && !state.renamed && state.owns) {
      try { unlinkSync(tmp); } catch { /* tmp may never have been created */ }
    }
  };
  try {
    const stagedPrimary = stage(tmpPrimary, primaryBody);
    if (seams && typeof seams.afterStagePrimary === "function") seams.afterStagePrimary(tmpPrimary);
    const stagedSidecar = stage(tmpSidecar, sidecarBody);
    if (seams && typeof seams.afterStageSidecar === "function") seams.afterStageSidecar(tmpSidecar);
    identityGate(tmpSidecar, stagedSidecar);
    renameSync(tmpSidecar, sidecarPath);
    tmpState.get(tmpSidecar).renamed = true;
    sidecarPublished = true;
    identityGate(tmpPrimary, stagedPrimary);
    renameSync(tmpPrimary, primaryPath);
    tmpState.get(tmpPrimary).renamed = true;
    primaryPublished = true;
    const dirFd = openSync(dirname(primaryPath), fsConstants.O_RDONLY | fsConstants.O_DIRECTORY);
    try {
      if (seams && typeof seams.fsyncDir === "function") seams.fsyncDir(dirFd);
      else fsyncSync(dirFd);
    } finally { closeSync(dirFd); }
  } catch (error) {
    cleanTmp(tmpPrimary);
    cleanTmp(tmpSidecar);
    // Retract only while the pair is still half-published: once the
    // primary rename succeeded the pair is complete and must not be
    // torn apart by a later (dir-fsync) fault. Overwrite destinations
    // (a pre-existing sidecar) inherit writeFileAtomic's overwrite
    // semantics — the retract removes the sidecar this call published,
    // which may have replaced an older one; fresh destinations, the
    // collect --out contract, are unaffected.
    if (sidecarPublished && !primaryPublished) {
      try { unlinkSync(sidecarPath); } catch { /* best-effort retract */ }
    }
    throw error;
  }
}

// ── Path + credential gates (nc3-swarm r47) ────────────────────────────
// beneath (S-04) and redact/CREDENTIAL_SHAPE (S-06) lived as verbatim
// copies across the wave planner, collect, the L0 watch/monitor, and the
// stale watchdog — every consumer already imports this leaf, so the copies
// were pure drift surface. The drift class is realized: the watchdog's
// redact lacked the AWS AKIA/ASIA line the dispatcher canonical carries.
// One canonical home here. The dispatcher's own copies stay its own — its
// module-load side effects are why the copies existed, and importing it is
// still forbidden.

/**
 * S-04 containment: realpath-anchor the root and reject every symlink
 * component. Fresh roots: realpathSync throws ENOENT — fall back to
 * resolve(root) only then.
 * @param {string} root
 * @param {string} candidate
 */
export function beneath(root, candidate) {
  let realRoot;
  try {
    realRoot = realpathSync(resolve(root));
  } catch (error) {
    if (error?.code === "ENOENT") realRoot = resolve(root);
    else throw error;
  }
  const resolved = resolve(candidate);
  const rel = relative(realRoot, resolved);
  if (rel !== "" && (rel.startsWith(`..${sep}`) || rel === ".." || parse(rel).root)) return false;
  if (rel === "") return true;
  const parts = rel.split(sep);
  let current = realRoot;
  for (const part of parts) {
    current = join(current, part);
    try {
      const info = lstatSync(current);
      if (info.isSymbolicLink()) return false;
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
  }
  return true;
}

/** S-06 credential shape — verbatim against fleet-dispatcher.mjs. */
export const CREDENTIAL_SHAPE = /(?<![A-Za-z0-9_-])(?:"?(?:authorization|proxy-authorization|token|access_token|refresh_token|api[_-]?key|secret[_-]?key|private[_-]?key|password|bearer_token|client_secret|session_key|signing_key|private_token|cookie|set-cookie)"?\s*[:=])|bearer\s+[A-Za-z0-9._~+\/-]{10,}|basic\s+[A-Za-z0-9+\/=]{10,}|(?<![A-Za-z0-9_-])(?:sk-|xai-|rk-|ak-|ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[A-Za-z0-9_-]{12,}|(?<![A-Za-z0-9])(?:AKIA|ASIA)[A-Z0-9]{16}(?![A-Za-z0-9])|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/iu;

/** S-06 redaction — verbatim against fleet-dispatcher.mjs `redact`. */
export function redact(value) {
  if (typeof value !== "string") return value;
  let result = value;
  // Multiline PEM private-key blocks
  result = result.replace(
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu,
    "[REDACTED_PEM]",
  );
  // JWT tokens (three base64url segments starting with eyJ)
  result = result.replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,}/gu, "[REDACTED_JWT]");
  // Bearer tokens (≥10 char token body)
  result = result.replace(/bearer\s+[A-Za-z0-9._~+\/-]{10,}/giu, "bearer [REDACTED]");
  // HTTP basic-auth blobs — CREDENTIAL_SHAPE parity
  result = result.replace(/basic\s+[A-Za-z0-9+\/=]{10,}/giu, "basic [REDACTED]");
  // Provider key prefixes (sk-, rk-, ak-, xai-, github families) — word-boundary anchored
  result = result.replace(/(?<![A-Za-z0-9_-])(?:sk|rk|ak)-[A-Za-z0-9_-]{12,}/giu, "[REDACTED_KEY]");
  // AWS access-key ids (AKIA long-term, ASIA temporary) — CREDENTIAL_SHAPE parity
  result = result.replace(/(?<![A-Za-z0-9])(?:AKIA|ASIA)[A-Z0-9]{16}(?![A-Za-z0-9])/gu, "[REDACTED_KEY]");
  result = result.replace(/(?<![A-Za-z0-9_-])xai-[A-Za-z0-9_-]{12,}/giu, "[REDACTED_KEY]");
  result = result.replace(/(?<![A-Za-z0-9_-])(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_-]{12,}/giu, "[REDACTED_KEY]");
  result = result.replace(/(?<![A-Za-z0-9_-])github_pat_[A-Za-z0-9_-]{12,}/giu, "[REDACTED_KEY]");
  // Key=value pairs with credential-like keys: capture key, replace value
  // (incl. short secrets); cookie/set-cookie keys are CREDENTIAL_SHAPE parity.
  result = result.replace(
    /("?(?:authorization|proxy-authorization|token|access_token|refresh_token|api[_-]?key|secret[_-]?key|private[_-]?key|password|bearer_token|client_secret|session_key|signing_key|private_token|cookie|set-cookie)"?\s*[:=]\s*"?)([^",\s}]{1,})/giu,
    "$1[REDACTED]",
  );
  return result;
}

// ── Lock machinery (nc3-swarm r45) ─────────────────────────────────────
// Two lock families lived as near-verbatim copies across the watch daemons
// and the queue/registry writers; the drift class is proven live (r44's
// stale-watchdog leftover admitted its grow-from-empty exemption "was
// removed" elsewhere and "left behind" there). One canonical home here —
// this module is the leaf every consumer already imports. Callers keep
// their own filenames, messages, and typed error contracts through the
// spec/deps seams; the concurrency protocol is shared verbatim.

/** Liveness probe for a lock owner, the dispatcher's lockPidIsAlive shape:
 * EPERM means the pid exists but is not ours to signal — alive. */
export function pidIsAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

const MAX_PROC_TEXT_BYTES = 64 * 1024;

/** Bounded /proc read: O_NOFOLLOW refuses a symlinked proc entry and
 * O_NONBLOCK fails a non-regular occupant instead of hanging. */
function readProcText(path, maximumBytes) {
  const fd = openSync(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);
  try {
    const buffer = Buffer.allocUnsafe(maximumBytes + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const count = readSync(fd, buffer, offset, buffer.length - offset, null);
      if (count === 0) break;
      offset += count;
    }
    if (offset > maximumBytes) {
      throw Object.assign(new Error(`proc file exceeds ${maximumBytes} byte bound: ${path}`), { code: "EFBIG" });
    }
    return buffer.subarray(0, offset).toString("utf8");
  } finally {
    closeSync(fd);
  }
}

function readBootId() {
  try {
    const text = readProcText("/proc/sys/kernel/random/boot_id", 128).trim();
    return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/iu.test(text)
      ? text.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

function readPidStarttime(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return null;
  try {
    const stat = readProcText(`/proc/${pid}/stat`, 4096);
    const close = stat.lastIndexOf(")");
    if (close < 0) return null;
    const fields = stat.slice(close + 1).trim().split(/\s+/u);
    const starttime = fields[19];
    return /^\d+$/u.test(starttime) ? starttime : null;
  } catch {
    return null;
  }
}

function procIdentity(pid = process.pid) {
  return { starttime: readPidStarttime(pid), bootId: readBootId() };
}

/** Legacy locks contain no start identity. Refuse them only when the live
 * PID actually runs this module; a random long-lived process must not squat
 * the escalation path. Unreadable /proc returns null and therefore stays
 * conservative-live — never create a second old-version daemon by guessing.
 * Returns a matcher: (pid) => true | false | null (unreadable). */
function legacyOwnerMatchesModule(modulePath, moduleBasename) {
  return (pid) => {
    try {
      const argv = readProcText(`/proc/${pid}/cmdline`, MAX_PROC_TEXT_BYTES)
        .split("\0")
        .filter(Boolean);
      const cwd = readlinkSync(`/proc/${pid}/cwd`);
      const expected = realpathSync(modulePath);
      for (const argument of argv.slice(1)) {
        if (argument.startsWith("-")) continue;
        const candidate = isAbsolute(argument) ? argument : resolve(cwd, argument);
        try {
          const resolvedCandidate = realpathSync(candidate);
          if (resolvedCandidate === expected
            || (dirname(resolvedCandidate) === dirname(expected)
              && basename(resolvedCandidate).startsWith(moduleBasename))) return true;
        } catch {
          // Not a path (for example an inline -e program argument).
        }
      }
      return false;
    } catch {
      return null;
    }
  };
}

/**
 * Single-instance guard (watchdog SH-03 parity): two daemons share one
 * whole-file state (last-writer-wins) and duplicate the respawn/whip
 * ladders against the same rows. The ticket is the sole mutation fence;
 * identity only decides whether its immutable owner record is current.
 *
 * The public lock body stays exactly `<pid>\n`: existing operators and the
 * focused suite inspect it. Identity rides the private source hardlink that
 * publish() already needs for atomic installation. Retaining that link
 * under a structured owner-only name binds starttime/boot ID to the lock
 * inode without a second-file commit window. PID existence alone cannot
 * distinguish reuse.
 *
 * @param {object} spec
 * @param {string} spec.dir directory holding the lock (created 0o700)
 * @param {string} spec.lockName lock filename inside dir
 * @param {string} spec.ownerLinkPrefix owner-link name prefix (e.g. ".l0-watch.owner")
 * @param {string} spec.modulePath realpath'd module path for the legacy matcher
 * @param {string} spec.moduleBasename basename prefix for the legacy matcher
 * @param {(file: string) => string} spec.readBody bounded owner-body reader
 *   returning utf8 text — callers keep their own error contract (the parse
 *   below swallows it either way; the inode-bound owner link recovers a
 *   torn body).
 * @param {object} [deps] injected seams: pidAlive, pidIdentity,
 *   legacyOwnerMatches — same contract the private copies exposed.
 * @returns {{ acquired: boolean, ownerPid: number|null, path: string,
 *   stolen?: boolean, reason?: string }}
 */
export function acquireSingletonLock(spec, deps = {}) {
  const alive = deps.pidAlive || pidIsAlive;
  const identityFor = deps.pidIdentity || procIdentity;
  const legacyMatches = deps.legacyOwnerMatches
    || legacyOwnerMatchesModule(spec.modulePath, spec.moduleBasename);
  const path = join(spec.dir, spec.lockName);
  const ticket = `${path}.takeover`;
  const ownerLinkPattern = new RegExp(
    `^${spec.ownerLinkPrefix.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\.(\\d+)\\.([0-9]+|x)\\.([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}|x)\\.([0-9a-f]{32})$`,
    "u",
  );
  mkdirSync(spec.dir, { recursive: true, mode: 0o700 });

  const ownerLinksFor = (file, info) => {
    let entries;
    try {
      entries = readdirSync(dirname(file), { withFileTypes: true });
    } catch {
      return [];
    }
    const links = [];
    for (const entry of entries) {
      const match = ownerLinkPattern.exec(entry.name);
      if (!match) continue;
      const candidate = join(dirname(file), entry.name);
      try {
        const candidateInfo = lstatSync(candidate);
        if (!candidateInfo.isFile() || candidateInfo.dev !== info.dev || candidateInfo.ino !== info.ino) continue;
        links.push({
          path: candidate,
          pid: Number.parseInt(match[1], 10),
          starttime: match[2] === "x" ? null : match[2],
          bootId: match[3] === "x" ? null : match[3],
          dev: candidateInfo.dev,
          ino: candidateInfo.ino,
        });
      } catch {
        // A concurrent cleanup removed the candidate; the fixed record remains.
      }
    }
    return links;
  };

  const readOwner = (file) => {
    let info;
    try {
      info = lstatSync(file);
      if (!info.isFile() || info.isSymbolicLink()) return null;
    } catch {
      return null;
    }
    const ownerLinks = ownerLinksFor(file, info);
    let pid = null;
    try {
      const body = spec.readBody(file).trim();
      if (/^\d+$/u.test(body)) {
        const parsed = Number.parseInt(body, 10);
        if (Number.isSafeInteger(parsed) && parsed > 0) pid = parsed;
      }
    } catch {
      // The inode-bound owner link below can still recover a torn body.
    }
    const linkPids = [...new Set(ownerLinks.map((entry) => entry.pid))];
    if (pid === null && linkPids.length === 1) pid = linkPids[0];
    const identities = ownerLinks.filter((entry) => entry.pid === pid);
    const identity = identities.length > 0
      && identities.every((entry) =>
        entry.starttime === identities[0].starttime && entry.bootId === identities[0].bootId)
      ? identities[0]
      : null;
    return {
      pid,
      starttime: identity?.starttime ?? null,
      bootId: identity?.bootId ?? null,
      identityOwned: identity !== null,
      ownerLinks,
      dev: info.dev,
      ino: info.ino,
    };
  };

  const ownerState = (owner) => {
    if (owner?.pid === null || !Number.isSafeInteger(owner?.pid)) return "unknown";
    if (!alive(owner.pid)) return "dead";
    if (owner.identityOwned) {
      const observed = identityFor(owner.pid);
      if (owner.bootId !== null) {
        if (observed?.bootId === null || observed?.bootId === undefined) return "live";
        if (observed.bootId !== owner.bootId) return "stale";
      }
      if (owner.starttime !== null) {
        if (observed?.starttime === null || observed?.starttime === undefined) return "live";
        if (observed.starttime !== owner.starttime) return "stale";
      }
      return "live";
    }
    const matches = legacyMatches(owner.pid);
    return matches === null ? "live" : matches ? "live" : "foreign_live";
  };

  const cleanupOwnerLinks = (owner) => {
    if (!owner?.identityOwned) return;
    for (const link of owner.ownerLinks) {
      try {
        const current = lstatSync(link.path);
        if (current.isFile() && current.dev === owner.dev && current.ino === owner.ino) unlinkSync(link.path);
      } catch {
        // Best-effort after the fixed link is gone; a UUID path is never reused.
      }
    }
  };

  // Publish the immutable pid body and its inode-bound identity hardlink as one
  // operation: the owner link exists before link(target), so a visible target
  // always has either full identity or a conservative legacy interpretation.
  const publish = (target) => {
    const identity = identityFor(process.pid) || {};
    const starttime = typeof identity.starttime === "string" && /^\d+$/u.test(identity.starttime)
      ? identity.starttime
      : "x";
    const bootId = typeof identity.bootId === "string"
      && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/iu.test(identity.bootId)
      ? identity.bootId.toLowerCase()
      : "x";
    const token = join(
      dirname(target),
      `${spec.ownerLinkPrefix}.${process.pid}.${starttime}.${bootId}.${randomUUID().replaceAll("-", "")}`,
    );
    const fd = openSync(token, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL, 0o600);
    try { writeSync(fd, `${process.pid}\n`); fsyncSync(fd); } finally { closeSync(fd); }
    try {
      linkSync(token, target);
      return { published: true, ownerLink: token };
    } catch (error) {
      try { unlinkSync(token); } catch { /* failed publication owns no record */ }
      if (error?.code === "EEXIST") return { published: false, ownerLink: null };
      throw error;
    }
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const ticketClaim = publish(ticket);
    if (!ticketClaim.published) {
      const holder = readOwner(ticket);
      if (ownerState(holder) === "live") {
        spinWait(2);
        continue;
      }
      const seized = `${ticket}.stale.${process.pid}.${randomUUID()}`;
      try {
        renameSync(ticket, seized);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        continue;
      }
      const seizedOwner = readOwner(seized);
      const seizedState = ownerState(seizedOwner);
      if (seizedState === "live") {
        try { linkSync(seized, ticket); } catch { /* a contender published its own */ }
        // The holder is live: its owner links are the identity fence its
        // finally uses to prove ownership and unlink the ticket. Deleting
        // them here (the old unconditional cleanup) left a live-pid ticket
        // with no fence — the holder could never clear it and every later
        // contender spun on "live" until the holder exited.
        try { rmSync(seized, { force: true }); } catch { /* residue is a .stale.* orphan */ }
      } else if (seizedState !== "foreign_live") {
        try { rmSync(seized, { force: true }); } catch { /* residue is a .stale.* orphan */ }
        cleanupOwnerLinks(seizedOwner);
      }
      continue;
    }
    try {
      const owner = readOwner(path);
      const state = ownerState(owner);
      if (state === "live") return { acquired: false, ownerPid: owner.pid, path };
      // The ticket should exclude writers, but a previously misjudged ticket
      // must not let this stale pre-judge snapshot unlink a fresh contender's
      // lock. Re-pin the inode immediately before either mutation.
      const currentOwner = readOwner(path);
      if ((owner === null) !== (currentOwner === null)
        || (owner !== null
          && (owner.dev !== currentOwner.dev || owner.ino !== currentOwner.ino))) continue;

      let occupied = true;
      if (state === "foreign_live") {
        // Proven live but not this daemon: preserve its bytes for the
        // operator instead of deleting them by guess.
        try {
          renameSync(path, `${path}.bad.${randomUUID()}`);
        } catch {
          return { acquired: false, ownerPid: owner.pid, path, reason: "lock_path_occupied" };
        }
      } else {
        try {
          unlinkSync(path);
          cleanupOwnerLinks(currentOwner);
        } catch (error) {
          if (error?.code === "ENOENT") occupied = false;
          else {
            try {
              renameSync(path, `${path}.bad.${randomUUID()}`);
            } catch {
              return { acquired: false, ownerPid: null, path, reason: "lock_path_occupied" };
            }
          }
        }
      }
      if (publish(path).published) {
        return occupied
          ? { acquired: true, ownerPid: process.pid, path, stolen: true }
          : { acquired: true, ownerPid: process.pid, path };
      }
      // Only a concurrently broken ticket can hold the path here — re-read.
    } finally {
      let heldTicket = null;
      let ownsTicket = false;
      if (ticketClaim.ownerLink !== null) {
        try {
          const ticketInfo = lstatSync(ticket);
          const ownerInfo = lstatSync(ticketClaim.ownerLink);
          ownsTicket = ticketInfo.isFile() && ownerInfo.isFile()
            && ticketInfo.dev === ownerInfo.dev && ticketInfo.ino === ownerInfo.ino;
          if (ownsTicket) heldTicket = readOwner(ticket);
        } catch {
          // A contender already removed or replaced the fixed ticket.
        }
      }
      if (ownsTicket) {
        try { unlinkSync(ticket); } catch { /* residue: a stale ticket the next start breaks */ }
        cleanupOwnerLinks(heldTicket);
      }
      // Our UUID link cannot alias another contender even after replacement.
      if (ticketClaim.ownerLink !== null) {
        try { unlinkSync(ticketClaim.ownerLink); } catch { /* already cleaned */ }
      }
    }
  }
  return { acquired: false, ownerPid: null, path };
}

/**
 * Directory-mutex lock (dispatcher/monitor queue-lock parity): mkdir is the
 * atomic claim; owner.json binds the holder's pid+token so the stale break
 * and the release path can both prove whose lock it is. A lock whose owner
 * pid is dead (or whose owner.json is unreadable and the dir is older than
 * staleMs) is quarantined by rename — the rename fences the steal so a live
 * owner's dir can't be pulled out from under it, and the seized-token check
 * puts the lock back when a contender re-acquired between our read and the
 * rename.
 *
 * @param {string} lockPath lock directory path (created 0o700)
 * @param {object} opts
 * @param {string} opts.token owner token written to owner.json
 * @param {number} [opts.timeoutMs] acquire deadline (default 30000)
 * @param {number} [opts.staleMs] unreadable-owner staleness bound (default 30000)
 * @param {string} opts.timeoutMessage error on deadline
 * @param {string} opts.unsafeMessage error on symlink/non-directory lock path
 * @param {(ownerPath: string) => unknown} [opts.readOwner] bounded owner.json
 *   reader returning the PARSED body — callers keep their own typed error
 *   contract (a throw falls through to the mtime-freshness check, identical
 *   to the private copies). Default: shared readBoundedJson.
 * @param {() => unknown} fn critical section
 */
export function withDirLock(lockPath, opts, fn) {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const staleMs = opts.staleMs ?? 30_000;
  const readOwner = opts.readOwner
    || ((ownerPath) => readBoundedJson(ownerPath, 4096, "lock owner"));

  const breakStaleLock = () => {
    let owner = null;
    try {
      owner = readOwner(join(lockPath, "owner.json"));
      if (pidIsAlive(owner?.pid)) return false;
    } catch {
      let mtime;
      try {
        mtime = lstatSync(lockPath).mtimeMs;
      } catch {
        return false; // vanished mid-check — caller retries
      }
      // Only a provably fresh mtime defers the break: a future-dated dir
      // (backward clock step, touch -d) makes now-mtime negative forever and
      // latches the lock for the whole skew — every acquire burns its
      // deadline. Unprovable freshness attempts the fenced break; the
      // seized-token check still restores a live contender's lock.
      const age = Date.now() - mtime;
      if (age >= 0 && age < staleMs) return false;
    }
    const quarantine = `${lockPath}.stale.${process.pid}.${randomUUID()}`;
    try {
      renameSync(lockPath, quarantine);
    } catch {
      return false; // another contender won the claim
    }
    let seizedIsOurs = true;
    if (owner !== null) {
      try {
        const seized = readOwner(join(quarantine, "owner.json"));
        // Token compare only on a proven string: a parsed non-object owner
        // body (`5`, `"x"`) makes owner.token undefined, and a contender's
        // fresh lock read back malformed also yields undefined —
        // `undefined === undefined` used to delete a live lock.
        seizedIsOurs = typeof owner?.token === "string" && seized?.token === owner.token;
      } catch {
        seizedIsOurs = false;
      }
    }
    if (seizedIsOurs) {
      rmSync(quarantine, { recursive: true, force: true });
    } else {
      try {
        renameSync(quarantine, lockPath);
      } catch {
        rmSync(quarantine, { recursive: true, force: true });
      }
    }
    return true;
  };

  // Owner write, dispatcher writeLockOwner parity: O_EXCL refuses a planted
  // file, O_NOFOLLOW refuses a symlink, 0o600 keeps the token private, and
  // the fsync makes the ownership record durable before any contender can
  // read it.
  const writeLockOwner = (token) => {
    const ownerPath = join(lockPath, "owner.json");
    const body = `${JSON.stringify({ pid: process.pid, token, at: Date.now() })}\n`;
    const descriptor = openSync(
      ownerPath,
      fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_NOFOLLOW,
      0o600,
    );
    try {
      const buffer = Buffer.from(body);
      let offset = 0;
      while (offset < buffer.length) {
        offset += writeSync(descriptor, buffer, offset, buffer.length - offset);
      }
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
  };

  const deadline = Date.now() + timeoutMs;
  const token = opts.token;
  for (let attempt = 0; ; attempt += 1) {
    try {
      mkdirSync(lockPath, { mode: 0o700 });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      let lockInfo;
      try {
        lockInfo = lstatSync(lockPath);
      } catch (statError) {
        // Lock vanished between EEXIST and lstat — lost race, retry.
        if (statError?.code === "ENOENT") continue;
        throw statError;
      }
      if (lockInfo.isSymbolicLink() || !lockInfo.isDirectory()) throw new Error(opts.unsafeMessage);
      if (breakStaleLock()) continue;
      if (Date.now() >= deadline) throw new Error(opts.timeoutMessage);
      const waitMs = Math.min(100 * (attempt + 1), 2000);
      spinWait(waitMs);
      continue;
    }
    try {
      writeLockOwner(token);
      break;
    } catch (error) {
      rmSync(lockPath, { recursive: true, force: true });
      throw error;
    }
  }
  try {
    return fn();
  } finally {
    // Token-checked release (dispatcher parity): the lock at the path is
    // ours only while its owner.json carries our token. A lock stolen and
    // re-acquired while we held it belongs to the contender — removing it
    // would leave two holders mutating concurrently.
    try {
      const owner = readOwner(join(lockPath, "owner.json"));
      // String-proven compare, same as the stale-break arm: a caller that
      // omitted opts.token would otherwise release a malformed owner body
      // on `undefined === undefined`.
      if (typeof owner?.token === "string" && owner.token === token) {
        rmSync(lockPath, { recursive: true, force: true });
      }
    } catch {
      // A replaced lock is never ours to remove.
    }
  }
}

/**
 * Bounded append-only log with one-generation rotation (watch/watchdog/
 * monitor parity): O_NOFOLLOW refuses a planted symlink at the fixed log
 * path, O_NONBLOCK fails a FIFO instead of hanging the caller, O_APPEND
 * keeps each regular-file write atomic, and 0o600 keeps the evidence
 * owner-only. Once the open file reaches maxBytes the live segment is
 * renamed to `<path>.1` — one segment is the whole generation set, so the
 * loss bound is one generation by design. rename(2) is an atomic replace:
 * a planted link at the segment path is unlinked without its target being
 * written.
 *
 * A failed rename keeps the bound soft: the payload is appended to the
 * still-open old fd after rotateFailedLine. A successful rename closes the
 * old fd (it still names the renamed inode), reopens the live path, and
 * writes rotatedLine inline — never through this function again, so
 * rotation cannot re-enter itself.
 *
 * @param {string} path log file path
 * @param {string} body payload bytes to append (caller-stamped, newline
 *   terminated)
 * @param {object} opts
 * @param {number} opts.maxBytes rotation threshold on the open file's size
 * @param {(info: {preBytes: number, boundBytes: number}) => string} opts.rotatedLine
 *   line written to the fresh fd after a successful rotation
 * @param {(info: {preBytes: number, boundBytes: number, code: string|null}) => string} opts.rotateFailedLine
 *   line written to the old fd when the segment rename fails
 * @returns {boolean} true when the payload was appended
 */
export function appendRotatingLog(path, body, opts) {
  const openLog = () => openSync(
    path,
    fsConstants.O_WRONLY | fsConstants.O_APPEND | fsConstants.O_CREAT | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK,
    0o600,
  );
  let fd = openLog();
  try {
    let live = fd;
    const preBytes = fstatSync(fd).size;
    if (preBytes >= opts.maxBytes) {
      let renameError = null;
      try {
        renameSync(path, `${path}.1`);
      } catch (error) {
        renameError = error;
      }
      if (renameError) {
        writeSync(live, opts.rotateFailedLine({
          preBytes,
          boundBytes: opts.maxBytes,
          code: typeof renameError?.code === "string" ? renameError.code : null,
        }));
      } else {
        closeSync(fd);
        live = fd = openLog();
        writeSync(live, opts.rotatedLine({ preBytes, boundBytes: opts.maxBytes }));
      }
    }
    writeSync(live, body);
    return true;
  } finally {
    closeSync(fd);
  }
}

/**
 * ENOENT-mkdir retry for fixed-path writes (monitor writeOrRetry / watch
 * writeState+log parity, nc3-swarm r49): a mid-run `.ufo` wipe used to
 * convert a passing heal into a non-zero exit at its last step (the
 * 16:09–17:24Z monitor_failed cluster, all during wipe recovery). One
 * retry after recreating the parent dir; every other fault propagates —
 * or, under `swallow`, is dropped entirely (watch daemon doctrine: an
 * unwritable log/state must never kill the tick; the duty re-proves
 * itself next pass).
 *
 * @param {string} path file path whose parent may have been wiped
 * @param {(path: string) => unknown} write the write attempt
 * @param {object} [opts]
 * @param {boolean} [opts.swallow] drop every fault instead of throwing
 * @returns {boolean} true when a write attempt completed
 */
export function writeWithMkdirRetry(path, write, opts = {}) {
  const swallow = opts.swallow === true;
  try {
    write(path);
    return true;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      if (swallow) return false;
      throw error;
    }
  }
  try {
    mkdirSync(dirname(path), { recursive: true });
    write(path);
    return true;
  } catch (error) {
    if (swallow) return false;
    throw error;
  }
}

/**
 * Single-line surface collapse (nc3-swarm r82): artifact bytes crossing
 * into a one-line surface — a stamped log line, a text-report field, a
 * bounded fault excerpt, a sanitized display string — get whitespace
 * collapsed so a crafted value can never forge an extra line. The
 * appendStampedLog stamp below, the monitor's field()/repend-fault clip,
 * the watch's noteInvalidRunId/childFault, and activity's
 * sanitizeDisplayText each spelled `String(x).replace(/\s+/gu, " ")`
 * inline. One named collapse keeps the boundary doctrine in one place;
 * callers keep their own bounds (slice limits stay at the call site).
 * @param {unknown} value
 * @returns {string}
 */
export function collapseWhitespace(value) {
  return String(value).replace(/\s+/gu, " ");
}

/**
 * Stamped action-log append (monitor appendLog / watch log parity,
 * nc3-swarm r49): lines carry queue-row bytes (titles, fault excerpts,
 * error messages), so whitespace is collapsed at the boundary — a
 * crafted value can never inject a forged log line. Each line is
 * ISO-stamped, joined, and appended through appendRotatingLog with the
 * shared one-generation rotation lines; a wiped `.ufo` mid-tick gets
 * the writeWithMkdirRetry recovery. `swallow` selects the daemon's
 * best-effort doctrine (watch) over the CLI's propagate doctrine
 * (monitor).
 *
 * @param {string} path log file path
 * @param {unknown[]} lines action lines (stringified at the boundary)
 * @param {object} opts
 * @param {number} opts.maxBytes rotation threshold (required)
 * @param {boolean} [opts.swallow] forwarded to writeWithMkdirRetry
 * @returns {boolean} true when the append completed
 */
export function appendStampedLog(path, lines, opts) {
  if (lines.length === 0) return true;
  const stamped = lines.map((line) =>
    `${new Date().toISOString()} ${collapseWhitespace(line)}`).join("\n");
  const stamp = (line) => `${new Date().toISOString()} ${line}\n`;
  return writeWithMkdirRetry(path, (p) => {
    appendRotatingLog(p, `${stamped}\n`, {
      maxBytes: opts.maxBytes,
      rotatedLine: () => stamp("log_rotated"),
      rotateFailedLine: ({ code }) => stamp(`log_rotate_failed code=${code ?? "unknown"}`),
    });
  }, { swallow: opts.swallow === true });
}

/**
 * Quiet-tick atomic publish (watch writeState / watchdog saveState parity):
 * an unchanged state file used to pay tmp+rename+fsync+dir-fsync every
 * poll for the fleet's life. A bounded read + byte compare proves the file
 * already carries exactly this body — the write is a non-event and the
 * rename is skipped. Semantics preserved: a corrupted file parses to a
 * DIFFERENT normalized body (repair-on-load still lands), an external edit
 * differs (last-writer-wins still overwrites), and an absent/unreadable
 * file falls through to the write. Buffer.equals, never a decoded-string
 * compare — decoding would alias invalid-UTF-8 file bytes onto U+FFFD and
 * skip a needed repair.
 *
 * @param {string} path state file path
 * @param {string} body exact bytes to publish
 * @param {object} [opts]
 * @param {number} opts.maxBytes bound on the compare read (required)
 * @param {string} [opts.label] bounded-read label (default: path)
 * @param {(message: string, kind: string) => never} [opts.fail] typed-error
 *   seam forwarded to readBoundedFile — unreachable in practice: every
 *   compare-read fault is swallowed into a write, so callers needing typed
 *   errors should read first themselves
 * @returns {boolean} true when the write ran, false when skipped unchanged
 */
export function writeFileAtomicIfChanged(path, body, opts) {
  try {
    const current = readBoundedFile(path, opts.maxBytes, opts.label ?? path, opts.fail);
    if (current.equals(Buffer.from(body, "utf8"))) return false;
  } catch { /* absent or unreadable — the write below creates/repairs it */ }
  writeFileAtomic(path, body);
  return true;
}

/**
 * Shared argv reader for the wave-family CLIs: a duplicate flag and a
 * missing/`--`-leading value are usage errors through the caller's typed
 * fail(), so each CLI keeps its own error class.
 * @param {string[]} args
 * @param {string} name
 * @param {(code: string, message: string) => never} fail
 */
export function optionValue(args, name, fail) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  if (args.indexOf(name, index + 1) !== -1) {
    fail("usage", `duplicate ${name}`);
  }
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    fail("usage", `${name} requires a value`);
  }
  return value;
}

/**
 * Declared-argv-surface walk for the L0 daemon CLIs (nc3-swarm r55): the
 * monitor and the watch each carried the same loop — unknown argument,
 * missing value, a declared flag where a value belongs (a swallowed flag,
 * not a value), and duplicate value options all collect as usage faults so
 * the caller refuses typed before any queue read or mutation.
 *
 * Semantics (union of both private copies):
 * - A declared flag is recorded in `flags` and consumes nothing.
 * - A declared value option is recorded in `seen` the first time it
 *   appears; a second appearance faults `duplicate <name>` — seen-ever,
 *   not only-when-valued (the watch's stricter arm: `--x a --x` reports
 *   duplicate, not requires-a-value).
 * - A value is the next argument only when it exists and is not itself a
 *   declared flag or value option; anything else faults
 *   `<name> requires a value`. A present value is consumed so it is never
 *   re-walked as an unknown argument; the first valid value wins.
 * - Anything else faults `unsupported argument: <arg>`.
 *
 * Returns `{ flags: Set<string>, values: Map<string,string>, faults: string[] }`.
 * The caller decides the refusal: both daemons append their own value-domain
 * checks to `faults` and emit one typed usage error.
 * @param {string[]} args
 * @param {Iterable<string>} flagNames declared zero-argument flags
 * @param {Iterable<string>} valueNames declared options taking one value
 */
export function parseDeclaredArgv(args, flagNames, valueNames) {
  const flagArgs = new Set(flagNames);
  const valueArgs = new Set(valueNames);
  const flags = new Set();
  const values = new Map();
  const seen = new Set();
  const faults = [];
  for (let i = 0; i < args.length; i += 1) {
    const argument = args[i];
    if (flagArgs.has(argument)) {
      flags.add(argument);
      continue;
    }
    if (valueArgs.has(argument)) {
      const value = args[i + 1];
      const hasValue = value !== undefined && !flagArgs.has(value) && !valueArgs.has(value);
      if (seen.has(argument)) {
        faults.push(`duplicate ${argument}`);
      } else {
        seen.add(argument);
        if (!hasValue) faults.push(`${argument} requires a value`);
      }
      // Consume the value whenever one is present — even on a duplicate —
      // so it is never re-walked as an unknown argument.
      if (hasValue) {
        if (!values.has(argument)) values.set(argument, value);
        i += 1;
      }
      continue;
    }
    faults.push(`unsupported argument: ${argument}`);
  }
  return { flags, values, faults };
}

/**
 * optionValue parity arm for parseDeclaredArgv callers (nc3-swarm r67): the
 * walker accepts a value that is not itself a DECLARED name, so
 * `--spec --bogus` binds "--bogus" as the spec text where optionValue would
 * refuse. Callers that bind the value into a path/JSON parse restate the
 * stricter arm: a value leading with `--` is a missing value, not a value.
 * Faults UNSHIFT in declaration order so the first-reported fault matches
 * the per-name loop this replaces — a `--spec --bogus` still reports
 * "--spec requires a value" ahead of the walker's own unsupported-argument
 * fault for the consumed-looking token.
 * Deliberately NOT folded into parseDeclaredArgv: the monitor/watch daemons
 * keep the walker's semantics (their per-option domain checks refuse
 * dash-leading values with their own messages).
 * @param {{values: Map<string,string>, faults: string[]}} parsed
 * @param {Iterable<string>} valueNames declared options taking one value
 */
export function rejectFlagLikeValues(parsed, valueNames) {
  for (const name of valueNames) {
    const value = parsed.values.get(name);
    if (value !== undefined && value.startsWith("--")) {
      parsed.faults.unshift(`${name} requires a value`);
    }
  }
}

/**
 * Duplicate-flag predicate (nc3-swarm r67): parseDeclaredArgv dedupes a
 * declared flag silently, so a CLI that refuses a repeated flag restates
 * the indexOf/lastIndexOf check. One named predicate keeps the doctrine —
 * "the helper dedupes silently; this CLI refuses a duplicate" — in one
 * place.
 * @param {string[]} args
 * @param {string} name
 */
export function hasDuplicateArg(args, name) {
  return args.indexOf(name) !== args.lastIndexOf(name);
}


/**
 * Pretty-printed JSON emit for the wave-family CLIs (nc3-swarm r64): this
 * CLI's four command arms and the wave planner's two emit sites each spelled
 * `process.stdout.write(JSON.stringify(value, null, 2) + "\n")` inline. One
 * named emit keeps the trailing-newline contract in one place. collect's
 * emit is a different shape (pre-computed string / XML branch) and stays.
 * @param {unknown} value
 */
export function emitJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Compact JSON error emit for the *-error-v1 family (nc3-swarm r82): every
 * owned CLI's typed boundary spelled
 * `process.stderr.write(JSON.stringify(payload) + "\n")` inline — 15 sites
 * across 9 files (lifecycle/observation's console.error(JSON.stringify(...))
 * is the same bytes plus the newline). One named emit keeps the
 * trailing-newline contract in one place; the payload shape (schema, code,
 * message, optional details) stays the caller's. Deliberately NOT adopted:
 * the watch's writeSync(1, …) refused payload (stdout sink under
 * process.exit) and the watchdog's writeSync(2, …) telemetry fallback
 * (not the CLI envelope).
 * @param {unknown} payload
 */
export function emitErrorJson(payload) {
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}
// ---------------------------------------------------------------------------
// Queue-row trust-boundary primitives (nc3-swarm r48). The pending-work queue
// is dispatcher-written artifact bytes: every consumer re-derived the same
// five gates as private copies (monitor absPath / watch queueRowPath, watch
// statSignature / monitor's inline memo key, the gq<16hex> row-id check, the
// bounded queue read + shape validation, and the dispatch-snapshot prompt
// layout). One canonical copy each; callers keep their own error classes.

/** Dispatcher parity: queue/artifact bytes are read under the same bound the
 * dispatcher's acceptance path applies (fleet-dispatcher MAX_QUEUE_BYTES), so
 * an oversized artifact fails closed instead of OOMing the pass — and would
 * be rejected at acceptance anyway. */
export const MAX_QUEUE_BYTES = 4 * 1024 * 1024;

/** Dispatcher parity (fleet-dispatcher TERMINAL_QUEUE_STATES): the queue
 * admits {pending, launching, running, paused, completed, failed, blocked}
 * and only completed/failed are terminal. The monitor's TERMINAL and the
 * watch's TERMINAL_QUEUE_STATES_LOCAL were documented local copies — the
 * dispatcher itself is unimportable (main-guarded CLI), so this module is
 * where the parity becomes structural instead of comment-only. */
export const TERMINAL_QUEUE_STATES = new Set(["completed", "failed"]);

/** Evidence-file bound parity (nc3-swarm r82): the monitor's heal log, the
 * watch's action log, and the watchdog's telemetry log are the same class
 * of artifact — owner-only lines in .ufo/ — so they share one cap: one
 * generation of loss by design, never unbounded growth. The watchdog's
 * state bound (MAX_STATE_BYTES) is a different class and stays local. */
export const MAX_EVIDENCE_LOG_BYTES = 1024 * 1024;

/**
 * The expected bag the dispatcher's acceptance path cross-checks a receipt
 * against (nc3-swarm r82): the monitor's settle() and the watch's
 * hole-verdict each rebuilt `{taskKey, runId, sessionId, promptSha256,
 * configSha256, reportSha256}` inline — the same six fields the dispatcher
 * validates, with promptSha256/configSha256 omitted-as-undefined when the
 * row carries none. The source prompt digest belongs IN the bag: the
 * either-binding's snapshotDigest callback is the second arm for a
 * rebound prompt, not a substitute for the source binding — without the
 * source digest here a receipt carrying a foreign promptSha256 passed
 * settle unchecked (nc4-swarm r01, MonitorRepairAudit/ResultHubAudit).
 * `reportSha256` is the caller's digest of the CURRENT report bytes
 * (memoized on the monitor side, shared on the watch side).
 * @param {object} task queue row
 * @param {string} reportSha256 digest of the report bytes on disk
 */
export function expectedReceiptBag(task, reportSha256) {
  return { taskKey: task.key, runId: task.runId, sessionId: task.sessionId,
    promptSha256: task.promptSha256 ?? undefined,
    configSha256: task.configSha256 ?? undefined, reportSha256 };
}

/**
 * Present-non-string field names (nc3-swarm r82): the wave registry loader
 * ran the same `field !== undefined && field !== null && typeof !==
 * "string"` loop over the document fields and each member's string fields —
 * a declared-but-mistyped field is corruption, named by the caller's own
 * typed error. Returns the offending names in declaration order (empty
 * when clean). Deliberately NOT adopted: the watch's readState lane-field
 * loop treats null as corruption too (`!== undefined` only) — a different
 * predicate, documented at its site.
 * @param {object} obj
 * @param {string[]} fields
 * @returns {string[]}
 */
export function nonStringFields(obj, fields) {
  return fields.filter((field) => obj[field] !== undefined && obj[field] !== null && typeof obj[field] !== "string");
}

/**
 * Stalled-row idle field (nc3-swarm r68): the monitor's text report and the
 * watch's whip action line rendered the same three-arm doctrine — a
 * scanError shows the fault, a future-dated transcript mtime is unprovable
 * liveness named "future-mtime" (never a fabricated idle), an absent
 * transcript is "no-transcript", and only a provable age renders as
 * minutes. `suffix` carries the surface's unit text: the monitor pads a
 * column so it appends " idle"; the watch's action line embeds `idle=` so
 * it passes "". The watch never sees a scanError row (it skips them before
 * the whip gate) — the arm stays so the helper is total over the row shape.
 * @param {object} row stalled row ({scanError?, futureMtime?, idleMinutes})
 * @param {string} suffix appended after the minutes figure
 * @returns {string}
 */
export function stalledIdleText(row, suffix) {
  return row.scanError
    ? `scan:${row.scanError}`
    : row.futureMtime ? "future-mtime"
    : row.idleMinutes === null ? "no-transcript" : `${row.idleMinutes}m${suffix}`;
}

/** S-04 escape hatch, dispatcher parity: test harnesses with fixture stubs
 * under scratch roots set UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1; production stays
 * default-deny. Bound once at module load, same as the private copies. */
export const ALLOW_EXTERNAL_TOOLS = process.env.UFO_FLEET_ALLOW_EXTERNAL_TOOLS === "1";

/** S-04 containment gate for config-read paths (nc5-swarm r20, moved from
 * ufo-swarm-wave.mjs so the stale watchdog resolves the same swarm policy
 * from the same gated surface). A config path is a read-path, not an exec
 * path, but its bytes define wave policy (maxLanes, ramp pacing,
 * globalRunnerCeiling) — an outside-root override is policy injection by
 * path. Gated exactly as fleet-dispatcher.mjs `gatedExecPath`: same escape
 * flag (ALLOW_EXTERNAL_TOOLS), same code, same message shape. An unstatable
 * path is not provably inside the root, so it fails closed into the same
 * typed refusal.
 * @param {string} root project root the candidate must stay beneath
 * @param {string|undefined} envValue override (e.g. process.env.UFO_CONFIG_PATH)
 * @param {string} fallback default path when no override is set
 * @param {string} name override name for the refusal message
 * @returns {string} resolved path
 */
export function gatedConfigPath(root, envValue, fallback, name) {
  const resolved = resolve(envValue || fallback);
  if (ALLOW_EXTERNAL_TOOLS || !envValue) return resolved;
  let ok;
  try {
    ok = beneath(root, resolved);
  } catch {
    ok = false;
  }
  if (!ok) {
    throw Object.assign(
      new Error(`${name} resolves outside the project root — set UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 to allow external tools`),
      { code: "EXEC_PATH_OUTSIDE_ROOT" },
    );
  }
  return resolved;
}

/** Queue-row runId is dispatcher-minted `gq<16 hex>` (fleet-dispatcher
 * QUEUE_RUN_ID_PATTERN, enforced at queue write). Anything else is
 * corruption, not a live lane — and a state-table hazard: a
 * "__proto__"/"constructor" runId makes `lanes[id] ??=` resolve to
 * Object.prototype. The strict pattern makes the inherited-name probe
 * redundant (no Object.prototype member is gq-shaped). */
const QUEUE_RUN_ID = /^gq[a-f0-9]{16}$/u;
export function isQueueRunId(runId) {
  return typeof runId === "string" && QUEUE_RUN_ID.test(runId);
}

/**
 * Queue-row path fields are artifact bytes, not operator argv: a ".." or
 * absolute value would read/write outside the project. join + the shared
 * beneath(root) walk + the ALLOW_EXTERNAL_TOOLS escape. Returns null (never
 * throws) so one bad row degrades to a skipped finding instead of killing
 * the whole pass.
 * @param {string} root
 * @param {unknown} rel
 * @returns {string | null}
 */
export function containedJoin(root, rel) {
  if (typeof rel !== "string" || rel.length === 0) return null;
  const resolved = join(root, rel);
  if (ALLOW_EXTERNAL_TOOLS) return resolved;
  let ok;
  try {
    ok = beneath(root, resolved);
  } catch {
    ok = false;
  }
  return ok ? resolved : null;
}

/**
 * Artifact stat signature — the memo key component for digest/verdict
 * memos. lstat (not stat): beneath() already rejects symlinked components,
 * and under UFO_FLEET_ALLOW_EXTERNAL_TOOLS a link's own identity changing
 * must still invalidate. Any rewrite bumps mtimeNs/ctimeNs/size/ino, so a
 * changed artifact always misses and re-validates fresh — the same trust
 * boundary the dispatcher's archiveDirPartsMemo declares. null = absent or
 * unreadable, which callers treat exactly like an existsSync gate.
 * @param {string} path
 * @returns {string | null}
 */
export function statSignature(path) {
  try {
    const info = lstatSync(path, { bigint: true });
    return `${info.dev}:${info.ino}:${info.mtimeNs}:${info.ctimeNs}:${info.size}`;
  } catch {
    return null;
  }
}

/**
 * Bounded artifact digest — the sha256File both daemons (monitor memoized,
 * watch verbatim copy) carried privately. Artifact bytes are read under the
 * same bound the dispatcher's acceptance path applies, so an oversized
 * artifact fails closed here instead of OOMing the pass — and would be
 * rejected at acceptance anyway. Callers memoize on statSignature when a
 * pass digests the same artifact repeatedly; failures propagate (never
 * memoized) so per-row fault isolation is preserved.
 * @param {string} path
 * @param {number} maximum
 * @param {string} [label]
 * @returns {string}
 */
export function sha256File(path, maximum, label = "artifact") {
  return createHash("sha256").update(readBoundedFile(path, maximum, label)).digest("hex");
}

/**
 * Bounded queue read + parsed-shape validation. The dispatcher always
 * writes `tasks` as an array of row objects, so a truthy non-array or a
 * non-object element is corruption — `queue.tasks` iteration used to
 * TypeError and escape the CLI boundary. A shape fault is reported through
 * the caller's fail() (optionValue convention: fail throws the caller's
 * typed error class); a JSON SyntaxError propagates for the caller to name.
 * @param {string} path
 * @param {(message: string) => never} fail
 */
export function readQueueFile(path, fail) {
  const queue = readBoundedJson(path, MAX_QUEUE_BYTES, "pending-work queue");
  if (!isPlainObject(queue)
    || !Array.isArray(queue.tasks)
    || queue.tasks.some((task) => !isPlainObject(task))) {
    fail("pending-work queue is malformed: tasks must be an array of row objects");
  }
  return queue;
}

/**
 * The dispatch-snapshot prompt layout — `.ufo/sessions/<runId>/
 * dispatch-snapshot-<attempt>/prompt.md`. Returns the RELATIVE path (the
 * caller gates it through containedJoin like every other row path field —
 * a ".." or non-string runId yields null there, never an out-of-root read),
 * or null when the row's attempt counter is not a positive integer.
 * @param {unknown} runId
 * @param {unknown} attempt
 * @returns {string | null}
 */
function dispatchSnapshotPromptPath(runId, attempt) {
  const n = Number(attempt);
  if (!Number.isSafeInteger(n) || n < 1) return null;
  return join(".ufo", "sessions", String(runId ?? ""), `dispatch-snapshot-${n}`, "prompt.md");
}

/**
 * Snapshot-prompt digest (nc3-swarm r52) — the receipt-validation fallback
 * both daemons carried verbatim (ufo-l0-monitor, ufo-l0-watch). A receipt
 * may bind the snapshot prompt bytes the lane received (skill lines +
 * binding overlay) instead of the drifting source file; the dispatcher
 * accepts either digest via the dispatch_snapshot bindingSource and reads
 * the snapshot under MAX_QUEUE_BYTES (dispatchSnapshotDigests), so that is
 * the bound here — the monitor's private copy used MAX_PROMPT_BYTES, which
 * would false-null the fallback on a >512 KiB snapshot the dispatcher
 * accepts. The queue-row runId is gated through containedJoin like every
 * other row path field; null on a bad row or an unreadable artifact, never
 * a throw escaping the pass.
 * @param {string} root project root the row path is gated under
 * @param {unknown} runId queue-row runId
 * @param {unknown} attempt queue-row attempt counter
 * @param {(path: string, maximum: number) => string} [digest] bounded
 *   digester — pass a statSignature-memoized wrapper to keep per-pass memo
 *   hits; defaults to the shared sha256File.
 * @returns {string | null}
 */
export function snapshotPromptSha256(root, runId, attempt, digest = sha256File) {
  const snapshot = containedJoin(root, dispatchSnapshotPromptPath(runId, attempt));
  if (snapshot === null) return null;
  try {
    return digest(snapshot, MAX_QUEUE_BYTES);
  } catch {
    return null;
  }
}

/**
 * Dispatch-snapshot config digest SET (nc5-swarm r17) — dispatcher parity
 * (fleet-dispatcher.mjs dispatchSnapshotDigests over config.json): every
 * dispatch-snapshot-<n>/config.json under the row's session dir contributes
 * one bounded digest; a missing or unreadable member contributes nothing
 * and the set stays closed (symlinked members are refused by the bounded
 * read's O_NOFOLLOW and fall into the same arm). A config-null queue row
 * binds its receipt's configSha256 to this set at acceptance; both daemon
 * verdicts (monitor settle, watch hole) must apply the same binding or a
 * receipt the dispatcher rejects (foreign config digest while snapshots
 * are live) validates daemon-side. An empty set = pruned snapshots: the
 * binding stays unbound, exactly like acceptance. The queue-row runId is
 * gated through containedJoin like every other row path field.
 * @param {string} root project root the row path is gated under
 * @param {unknown} runId queue-row runId
 * @param {(path: string, maximum: number) => string} [digest] bounded
 *   digester — pass a statSignature-memoized wrapper to keep per-pass memo
 *   hits; defaults to the shared sha256File.
 * @returns {Set<string>} the snapshot config digests (possibly empty)
 */
export function snapshotConfigDigests(root, runId, digest = sha256File) {
  const digests = new Set();
  const sessionsDir = containedJoin(root, join(".ufo", "sessions", String(runId ?? "")));
  if (sessionsDir === null) return digests;
  let entries;
  try {
    entries = readdirSync(sessionsDir, { withFileTypes: true });
  } catch {
    return digests;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("dispatch-snapshot-")) continue;
    try {
      digests.add(digest(join(sessionsDir, entry.name, "config.json"), MAX_QUEUE_BYTES));
    } catch {
      // A missing or unreadable member contributes nothing.
    }
  }
  return digests;
}

/**
 * Either-binding receipt validation (nc3-swarm r54) — the acceptance
 * contract both L0 daemons carried verbatim (ufo-l0-monitor settle,
 * ufo-l0-watch hole verdict): a receipt may bind the SOURCE prompt digest
 * (queue-row promptSha256) or the dispatch-snapshot digest (the prompt the
 * lane actually received — dispatcher's dispatch_snapshot bindingSource).
 * Try the source binding first; on ANY validation failure retry against
 * the snapshot digest — but only when the row resolves one. A null
 * snapshot digest rethrows the source-binding error, so a missing
 * snapshot never masks the real mismatch. The dispatcher's own check is
 * set-membership over every dispatch-snapshot-* dir; the daemons' single
 * current-attempt fallback is the stricter subset this helper encodes.
 * @param {unknown} parsed parsed receipt JSON (unvalidated)
 * @param {object} expected expected bag validateTaskReceipt cross-checks
 *   (taskKey/runId/sessionId/configSha256/reportSha256 + source promptSha256)
 * @param {() => string | null} snapshotDigest resolves the row's
 *   dispatch-snapshot prompt digest, or null when unavailable
 * @returns {object} the validated, normalized receipt
 */
export function validateTaskReceiptEitherBinding(parsed, expected, snapshotDigest) {
  try {
    return validateTaskReceipt(parsed, expected);
  } catch (firstError) {
    // The snapshot arm exists for ONE failure: the receipt's promptSha256
    // bound to the dispatch-snapshot bytes rather than the (drifted) source
    // digest. Any other first-path error — schema, a different field's
    // mismatch, iteration shape — is final; retrying it would only add a
    // bounded disk read on the settle hot path and misread as "prompt
    // either-bound" when the first path never looked at prompt. The field
    // rides error.details, not the message text — a reworded message must
    // not silently disable the snapshot arm.
    if (firstError?.code !== "receipt_mismatch"
        || firstError?.details?.field !== "promptSha256") {
      throw firstError;
    }
    const snapDigest = snapshotDigest();
    if (snapDigest === null) throw firstError;
    return validateTaskReceipt(parsed, { ...expected, promptSha256: snapDigest });
  }
}

/**
 * Direct-entry guard (nc3-swarm r51). Every owned CLI carried the same
 * 11-line copy: `node -e 'import(...)' <module-path>` puts the imported
 * path in argv[1] too, so the eval/print check refuses those entrypoints;
 * realpath comparison on BOTH sides keeps an intentional symlink launch —
 * under `--preserve-symlinks` import.meta.url stays the symlink path while
 * argv[1] realpaths, so realpathing only argv[1] (the 7-copy form) made a
 * symlinked launch silently refuse to run. A vanished argv[1] target or a
 * missing argv[1] is not a direct invocation.
 * @param {string} moduleUrl import.meta.url of the calling module
 */
export function isMainModule(moduleUrl) {
  const hasEvalEntrypoint = process.execArgv.some((argument) =>
    argument.startsWith("-e") || argument.startsWith("-p")
    || argument === "--eval" || argument.startsWith("--eval=")
    || argument === "--print" || argument.startsWith("--print="));
  if (hasEvalEntrypoint || !process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

// ── Shared daemon helpers (nc4-swarm r02 hub relocation) ───────────────────
// These three lived in ufo-swarm-wave.mjs (loadSwarmPolicy) and
// ufo-stale-watchdog.mjs (newestMtime/parseReportOutput); the r02 wave
// proved the hub is an acyclic target (it imports zero project modules), so
// the cross-daemon import edges collapse into one direction. Error shape:
// this module speaks MissionResultError; callers map codes to their own
// typed envelopes.

// Operator contract: the global per-L1 atomized-L2 swarm maximum is 100 —
// stricter than kimi's MAX_AGENT_SWARM_SUBAGENTS=128. Kimi parity for the
// rest: minimum 2 unless all-resume, launch ramp 5 per 700 ms.
export const MAX_SWARM_LANES = 100;
export const MIN_SWARM_LANES = 2;
export const SWARM_RAMP_BATCH_SIZE = 5;
export const SWARM_RAMP_INTERVAL_MS = 700;

export const MAX_SWARM_POLICY_BYTES = 1024 * 1024;

/**
 * Swarm dispatch policy from config/ufo.json. The `swarm` block is optional;
 * absent keys fall back to the built-in constants. `maxLanes` may only
 * tighten the hard 100 ceiling. `source` records provenance — "config" when
 * config/ufo.json was read (even if its `swarm` block is absent), "default"
 * when the file is absent. Throws MissionResultError("invalid_policy", ...)
 * on malformed policy bytes.
 * @param {string} [configPath]
 */
export function loadSwarmPolicy(configPath) {
  const policyFail = (message) => {
    throw new MissionResultError("invalid_policy", message);
  };
  let config = null;
  let source = "default";
  try {
    config = readBoundedJson(configPath, MAX_SWARM_POLICY_BYTES, configPath, policyFail);
    source = "config";
  } catch (error) {
    if (error instanceof MissionResultError) throw error;
    if (error?.code !== "ENOENT") {
      policyFail(`cannot read ${configPath}: ${error.message}`);
    }
  }
  if (config !== null && !isPlainObject(config)) {
    policyFail(`${configPath} must be a JSON object`);
  }
  const sightingField = config?.sighting;
  if (sightingField !== undefined && sightingField !== null && !isPlainObject(sightingField)) {
    policyFail("sighting must be an object");
  }
  const dispatchField = config?.sighting?.dispatch;
  if (dispatchField !== undefined && dispatchField !== null && !isPlainObject(dispatchField)) {
    policyFail("sighting.dispatch must be an object");
  }
  const dispatch = isPlainObject(dispatchField) ? dispatchField : {};
  const swarmField = dispatch.swarm;
  if (swarmField !== undefined && swarmField !== null && !isPlainObject(swarmField)) {
    policyFail("sighting.dispatch.swarm must be an object");
  }
  const swarm = isPlainObject(swarmField) ? swarmField : {};

  let maxLanes = MAX_SWARM_LANES;
  if (swarm.maxLanes !== undefined) {
    if (!Number.isSafeInteger(swarm.maxLanes) || swarm.maxLanes < 1) {
      policyFail("sighting.dispatch.swarm.maxLanes must be a positive integer");
    }
    maxLanes = Math.min(swarm.maxLanes, MAX_SWARM_LANES);
  }

  let rampBatchSize = SWARM_RAMP_BATCH_SIZE;
  if (swarm.rampBatchSize !== undefined) {
    if (!Number.isSafeInteger(swarm.rampBatchSize) || swarm.rampBatchSize < 1) {
      policyFail("sighting.dispatch.swarm.rampBatchSize must be a positive integer");
    }
    rampBatchSize = swarm.rampBatchSize;
  }

  let rampIntervalMs = SWARM_RAMP_INTERVAL_MS;
  if (swarm.rampIntervalMs !== undefined) {
    if (!Number.isSafeInteger(swarm.rampIntervalMs) || swarm.rampIntervalMs < 1) {
      policyFail("sighting.dispatch.swarm.rampIntervalMs must be a positive integer");
    }
    rampIntervalMs = swarm.rampIntervalMs;
  }

  // A floor, not a ceiling. Default stays 2 when a policy omits it (that is
  // what the injected-policy vectors rely on); the repo config sets the
  // real floor.
  let minLanes = MIN_SWARM_LANES;
  if (swarm.minLanes !== undefined) {
    if (!Number.isSafeInteger(swarm.minLanes) || swarm.minLanes < 1) {
      policyFail("sighting.dispatch.swarm.minLanes must be a positive integer");
    }
    minLanes = Math.min(swarm.minLanes, maxLanes);
  }

  // Two bands, two jobs. `minLanes`/`maxLanes` bound the SWARM a round
  // fields; `waveMinLanes`/`waveMaxLanes` bound ONE wave's width. When a
  // policy declares no wave band, the wave band falls back to the swarm
  // band.
  let waveMinLanes = minLanes;
  if (swarm.waveMinLanes !== undefined) {
    if (!Number.isSafeInteger(swarm.waveMinLanes) || swarm.waveMinLanes < 1) {
      policyFail("sighting.dispatch.swarm.waveMinLanes must be a positive integer");
    }
    waveMinLanes = Math.min(swarm.waveMinLanes, maxLanes);
  }
  let waveMaxLanes = Math.min(maxLanes, MAX_SWARM_LANES);
  if (swarm.waveMaxLanes !== undefined) {
    if (!Number.isSafeInteger(swarm.waveMaxLanes) || swarm.waveMaxLanes < 1) {
      policyFail("sighting.dispatch.swarm.waveMaxLanes must be a positive integer");
    }
    waveMaxLanes = Math.min(swarm.waveMaxLanes, maxLanes);
  }
  if (waveMaxLanes < waveMinLanes) {
    policyFail("sighting.dispatch.swarm wave band is inverted: waveMaxLanes < waveMinLanes");
  }

  let globalRunnerCeiling = null;
  if (dispatch.globalRunnerCeiling !== undefined) {
    if (!Number.isSafeInteger(dispatch.globalRunnerCeiling) || dispatch.globalRunnerCeiling < 1) {
      policyFail("sighting.dispatch.globalRunnerCeiling must be a positive integer");
    }
    globalRunnerCeiling = dispatch.globalRunnerCeiling;
  }

  return { maxLanes, minLanes, waveMinLanes, waveMaxLanes, rampBatchSize, rampIntervalMs, globalRunnerCeiling, source };
}

// Telemetry/report split for child stdout: producers (dispatcher `output()`,
// ufo-sighting `output()`) write compact `log()` telemetry lines BEFORE the
// report body. Whole-buffer parse first — a single-line report must not be
// misread as telemetry. Then the pretty-body marker (`{\n` at line start),
// then the last line starting `{` — a compact report body after telemetry
// has no `{\n` marker but is still the terminal line. A throw propagates as
// the caller's transient fault; a parsed non-report object is the caller's
// durable-refusal shape, never a retry.
/**
 * @param {string} out
 */
export function parseReportOutput(out) {
  try {
    return JSON.parse(out);
  } catch { /* telemetry lines precede the report body */ }
  const marker = /^\{\n/m.exec(out);
  if (marker) return JSON.parse(out.slice(marker.index));
  const tail = out.lastIndexOf("\n{");
  return JSON.parse(tail >= 0 ? out.slice(tail + 1) : out);
}

// Returns { newest, error }. newest is the newest mtime in the tree (0 when
// absent — ENOENT/ENOTDIR means "never wrote", which is infinite-age stale,
// not a scan failure). error is set only for real scan faults (EACCES etc.):
// a mission whose session cannot be observed must never be refired blind.
// `filter` (optional) narrows which non-directory entries count — the L0
// monitor's transcript scan passes a `.jsonl` predicate so foreign files in
// a session dir cannot mask a stall. Directory mtimes always count: a
// rotation that swaps files changes the dir entry even when the filter
// excludes the payloads.
/**
 * @param {string} dir
 * @param {(name: string) => boolean} [filter]
 */
export function newestMtime(dir, filter) {
  let newest = 0;
  let firstError = null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if (e?.code === "ENOENT" || e?.code === "ENOTDIR") return { newest: 0, error: null };
    return { newest: 0, error: e };
  }
  for (const e of entries) {
    try {
      const p = join(dir, e.name);
      // lstat, never stat: a symlinked entry must not let foreign content
      // influence staleness — a fresh-target link would suppress refire
      // forever, a dead/non-traversable target would stall the scan on a
      // permanent error. Skipping is silent: the mission's own writes are
      // regular files/dirs, links are foreign.
      const st = lstatSync(p);
      if (st.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (st.mtimeMs > newest) newest = st.mtimeMs;
        const sub = newestMtime(p, filter);
        if (sub.error && !firstError) firstError = sub.error;
        if (sub.newest > newest) newest = sub.newest;
      } else if (filter === undefined || filter(e.name)) {
        if (st.mtimeMs > newest) newest = st.mtimeMs;
      }
    } catch (statError) {
      // Vanished between readdir and stat is benign; anything else is a real
      // scan fault — a partially observed tree must not refire blind.
      if (!firstError && statError?.code !== "ENOENT" && statError?.code !== "ENOTDIR") {
        firstError = statError;
      }
    }
  }
  return { newest, error: firstError };
}

// The L0 daemons (monitor, watch) and the dispatcher must agree on ONE
// queue path or the fleet splits into dual-writer halves. Env override is
// honored only inside the repo-state root — parity with the dispatcher's
// assertQueuePath beneath(UFO_STATE) gate: a hostile or mis-set
// UFO_PENDING_WORK_PATH must never turn a heal/repend into an out-of-root
// write.
/**
 * @param {string} root
 * @param {string} [envValue] process.env.UFO_PENDING_WORK_PATH
 */
export function resolveQueuePath(root, envValue) {
  const fallback = join(root, ".ufo", "pending-work.json");
  if (envValue === undefined || envValue === "") return fallback;
  const candidate = resolve(root, envValue);
  const stateRoot = join(root, ".ufo");
  if (candidate !== fallback && !beneath(stateRoot, candidate)) {
    throw new MissionResultError(
      "queue_path_outside_root",
      `UFO_PENDING_WORK_PATH must stay beneath ${stateRoot}`,
    );
  }
  return candidate;
}

// CLI error-code classifier shared by the mission-display CLIs
// (activity, lifecycle, observation): coded fs faults keep their errno
// string; a bare TypeError from the projection validators and a JSON
// SyntaxError are operator input (INVALID_INPUT); anything else is an
// internal fault and must not be mislabeled. Payload shape/message/schema
// stay caller-owned so no emitted byte moves (SmallCLISimplify finding 3).
/**
 * @param {unknown} error
 */
export function cliErrorCode(error) {
  return typeof error?.code === "string" ? error.code
    : error instanceof TypeError || error instanceof SyntaxError ? "INVALID_INPUT" : "INTERNAL";
}

/**
 * @param {string} source
 */
const MAX_INPUT_BYTES = 4 * 1024 * 1024;

// Maps the shared primitive's kinds to this CLI's typed contract — the
// messages are byte-identical to what the private reader produced.
function boundedInputFail(message, kind) {
  if (kind === "too_large") {
    throw new MissionResultError("request_too_large", "input exceeds the 4 MiB bound");
  }
  if (kind === "not_regular") {
    throw new MissionResultError("invalid_type", "input must be a regular file");
  }
  throw new MissionResultError("invalid_type", message);
}

function readBytes(source) {
  // Shared primitives: O_NOFOLLOW refuses a symlink at open (ELOOP mapped
  // to the typed contract below), fstat pins the identity, and a post-read
  // fstat fails closed if the file changed size mid-read. stdin (stat size
  // 0) is read in bounded chunks and dies the moment the bound is crossed.
  if (source && source !== "-") {
    try {
      return readBoundedFile(source, MAX_INPUT_BYTES, "input", boundedInputFail);
    } catch (error) {
      if (error?.code === "ELOOP") {
        throw new MissionResultError("invalid_type", "input must be a regular file");
      }
      throw error;
    }
  }
  return readBoundedFd(0, MAX_INPUT_BYTES, "input", boundedInputFail);
}

/**
 * Errno→typed-input mapping (nc3-swarm r64): both read sites in main()
 * spelled the same doctrine — a MissionResultError passes through, an
 * errno-coded fs fault (ENOENT/EISDIR/ELOOP/…) is the operator input class
 * and keeps `unreadable_input`, and an uncoded throw is an internal fault
 * that must never wear an operator-facing code.
 * @param {unknown} error
 * @returns {never}
 */
function rethrowInputError(error) {
  if (error instanceof MissionResultError) throw error;
  const code = typeof error?.code === "string" ? "unreadable_input" : "internal";
  // nc5-swarm r03: an errno-coded fs fault carries Node's ", syscall
  // '<path>'" tail — redact it like every other typed surface (wave spec,
  // collect input/output), so the envelope keeps errno + description and
  // never echoes a path. A non-fs throw is an internal fault: its full
  // text stays, unredacted, for diagnosis.
  const message = code === "unreadable_input"
    ? redactFsErrorMessage(error)
    : error instanceof Error ? error.message : String(error);
  throw new MissionResultError(code, message);
}

// The six acceptance binding fields a --expected bag may assert
// (fleet-dispatcher parity; nc5-swarm r02).
const RECEIPT_BINDING_KEYS = new Set([
  "taskKey", "runId", "sessionId", "promptSha256", "configSha256", "reportSha256",
]);

function usage() {
  return "Usage: ufo-mission-result.mjs create|validate|xml|create-receipt|validate-receipt [file|-]"
    + " — validate-receipt exit 0 means the receipt is shape-valid JSON against the schema ONLY,"
    + " not that the fleet accepted it: acceptance is the dispatcher's expected-bag cross-check"
    + " (taskKey/runId/sessionId/promptSha256/configSha256/reportSha256)."
    + " validate-receipt gates: [--iterate] [--expected key=value ...] —"
    + " --iterate requires an iteration.decision; --expected binds one of the six"
    + " acceptance fields (repeatable; malformed, unknown, or duplicate keys exit 64)."
    + " create-receipt gates: [--out <path>] —"
    + " --out publishes the minted receipt atomically (tmp+fsync+rename+dir-fsync) to <path>"
    + " with stdout silent, so a crash mid-mint can never leave the truncated-file artifact"
    + " the shell `> receipt.json` redirect produces (nc5-swarm r05); without --out the"
    + " receipt is emitted on stdout as before. --out refuses '-', empty, and '--'-leading"
    + " paths like any non-path value.";
}

// create-receipt argv (nc5-swarm r05): the source positional may sit before
// or after `--out <path>`; everything malformed is a usage refusal (exit
// 64), never a silent ignore — an unrecognized flag must not fall through
// to the source check and die as a phantom-file ENOENT (the r02
// validate-receipt doctrine, second consumer).
function parseCreateReceiptArgv(args) {
  let source = null;
  let outPath = null;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--out") {
      const value = args[i + 1];
      if (value === undefined) {
        throw new MissionResultError("usage", "--out requires a path argument");
      }
      i++;
      if (outPath !== null) {
        throw new MissionResultError("usage", "--out repeats; one publish path per mint");
      }
      outPath = value;
      continue;
    }
    if (arg.startsWith("--") || arg === "") {
      throw new MissionResultError("usage", usage());
    }
    if (source !== null) {
      throw new MissionResultError("usage", usage());
    }
    source = arg;
  }
  return { source: source ?? "-", outPath };
}

// Opt-in validate-receipt gates (nc5-swarm r02): the source positional may
// sit before or after the flags; --iterate is a bare presence gate on
// iteration.decision; --expected consumes the next argv as key=value and
// asserts equality against the receipt. Everything malformed is a usage
// refusal (exit 64), never a silent ignore — an unrecognized flag must not
// fall through to the source check and die as a phantom-file ENOENT.
function parseValidateReceiptArgv(args) {
  let source = null;
  let iterate = false;
  const expected = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--iterate") {
      if (iterate) throw new MissionResultError("usage", usage());
      iterate = true;
      continue;
    }
    if (arg === "--expected") {
      const kv = args[i + 1];
      if (kv === undefined) {
        throw new MissionResultError("usage", "--expected requires a key=value argument");
      }
      i++;
      const eq = kv.indexOf("=");
      const key = eq === -1 ? "" : kv.slice(0, eq);
      const value = eq === -1 ? "" : kv.slice(eq + 1);
      if (!RECEIPT_BINDING_KEYS.has(key) || value === "") {
        throw new MissionResultError(
          "usage",
          `--expected takes key=value with key one of ${[...RECEIPT_BINDING_KEYS].join("/")} and a nonempty value`,
        );
      }
      if (expected[key] !== undefined) {
        throw new MissionResultError("usage", `--expected repeats key ${key}; one binding per field`);
      }
      expected[key] = value;
      continue;
    }
    if (arg.startsWith("--") || arg === "") {
      throw new MissionResultError("usage", usage());
    }
    if (source !== null) {
      throw new MissionResultError("usage", usage());
    }
    source = arg;
  }
  return { source: source ?? "-", iterate, expected };
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (argv.length === 1 && (command === "--help" || command === "-h")) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!command || !["create", "validate", "xml", "create-receipt", "validate-receipt"].includes(command)) {
    throw new MissionResultError("usage", usage());
  }
  let receiptGate = null;
  let createReceiptOut = null;
  let source;
  if (command === "validate-receipt") {
    receiptGate = parseValidateReceiptArgv(argv.slice(1));
    source = receiptGate.source;
  } else if (command === "create-receipt") {
    const createGate = parseCreateReceiptArgv(argv.slice(1));
    source = createGate.source;
    createReceiptOut = createGate.outPath;
  } else {
    if (argv.length > 2) {
      throw new MissionResultError("usage", usage());
    }
    source = argv[1] ?? "-";
    // Declared source surface (r28): an empty-string or `--`-leading source is
    // operator input, not a file — `""` used to fall through `|| "-"` and read
    // stdin (reporting invalid_json on empty input), and `--bogus` used to die
    // as ENOENT on a phantom file. `-` alone stays the stdin alias.
    if (source === "" || source.startsWith("--")) {
      throw new MissionResultError("usage", usage());
    }
  }
  let raw;
  try {
    raw = readBytes(source);
  } catch (error) {
    rethrowInputError(error);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw new MissionResultError("invalid_json", error instanceof Error ? error.message : String(error));
  }
  if (command === "create-receipt") {
    // reportPath: hash the report file in-process at mint time. The
    // hand-computed sha256sum step this replaces minted stale or wrong-file
    // digests that the dispatcher only rejects at settle — the
    // acceptance_evidence_missing hole class the L0 watch exists to
    // respawn. A declared reportSha256 that disagrees with the file bytes
    let receiptInput = parsed;
    let reportPath;
    // Non-object input skips the destructure entirely: it must reach
    // createTaskReceipt untouched so it fails the same typed
    // "must be an object" check it always did — a bare destructure would
    // TypeError on null and escape as `internal`.
    if (isPlainObject(parsed)) {
      ({ reportPath, ...receiptInput } = parsed);
    }
    // fails closed here instead of becoming that hole.
    if (reportPath !== undefined) {
      // "-" is this CLI's stdin alias, never a report path: the report is
      // always a file (resultPath). readBytes("-") would read fd 0 — with
      // stdin input it returns empty (stdin already drained) and mints a
      // guaranteed-stale digest the dispatcher only rejects at settle; on a
      // TTY it blocks the mint forever. Refuse it like any non-path value.
      if (typeof reportPath !== "string" || reportPath === "" || reportPath === "-" || reportPath.startsWith("--")) {
        throw new MissionResultError("invalid_type", reportPath === "-"
          ? 'reportPath "-" is the stdin alias on this CLI — the receipt JSON is already read from fd 0, so "-" would re-read stdin (empty: stale digest minted; TTY: blocks forever). Pass the report file path.'
          : "reportPath must be a file path string");
      }
      let reportBytes;
      try {
        reportBytes = readBytes(reportPath);
      } catch (error) {
        rethrowInputError(error);
      }
      const digest = createHash("sha256").update(reportBytes).digest("hex");
      if (receiptInput.reportSha256 !== undefined && receiptInput.reportSha256 !== digest) {
        throw new MissionResultError(
          "receipt_mismatch",
          "declared reportSha256 does not match the reportPath file bytes",
        );
      }
      receiptInput.reportSha256 = digest;
    }
    const minted = createTaskReceipt(receiptInput);
    if (createReceiptOut !== null) {
      // Atomic publish (nc5-swarm r05): the fleet completion contract used
      // to pipe stdout into `> receipt.json`, and the shell truncates the
      // destination at redirect setup — a crash between truncate and first
      // write leaves the exact 0-byte torn receipt the L0 watch keeps
      // finding on blocked rows. Publishing via writeFileAtomic means a
      // crash mid-mint leaves the previous bytes (or no file), never a
      // truncated one. Path doctrine mirrors reportPath: stdin alias,
      // empty, and flag-leading values are not paths. fs faults map through
      // the shared errno→typed-input boundary, path tail redacted.
      if (createReceiptOut === "" || createReceiptOut === "-" || createReceiptOut.startsWith("--")) {
        throw new MissionResultError("invalid_type", "--out must be a file path string");
      }
      try {
        writeFileAtomic(createReceiptOut, `${JSON.stringify(minted, null, 2)}\n`);
      } catch (error) {
        rethrowInputError(error);
      }
      return;
    }
    emitJson(minted);
    return;
  }
  if (command === "create") {
    emitJson(createMissionResult(parsed));
    return;
  }
  if (command === "validate-receipt") {
    // Shape gate, optionally tightened (nc5-swarm r02): the default stays
    // shape-only — exit 0 says exactly one thing: the receipt is shape-valid
    // JSON against the schema. It does NOT say the fleet accepted it —
    // acceptance is the dispatcher's expected-bag cross-check
    // (`validateTaskReceipt(value, expected)` in fleet-dispatcher.mjs), which
    // binds taskKey/runId/sessionId/promptSha256/configSha256/reportSha256 to
    // the task that produced it. --expected runs that same binding check
    // locally; --iterate additionally requires an iteration.decision (chains
    // fail closed without one — a missing decision is a typed refusal, not a
    // shape pass). stdout echoes the receipt fields verbatim, unredacted
    // (residual C2): do not pipe untrusted receipts into shared logs
    // expecting scrubbing.
    const validated = validateTaskReceipt(parsed, receiptGate.expected);
    if (receiptGate.iterate && validated.iteration === undefined) {
      throw new MissionResultError(
        "missing_decision",
        "receipt carries no iteration.decision; the iterate gate requires one",
        { field: "iteration.decision" },
      );
    }
    emitJson(validated);
    return;
  }
  const envelope = validateMissionResult(parsed);
  if (command === "validate") {
    emitJson(envelope);
    return;
  }
  process.stdout.write(renderMissionResultXml(envelope));
}

// Direct entry only — shared isMainModule (this file, r51): eval/print
// entrypoints are never direct invocations, while realpath comparison on
// both sides keeps an intentional symlink launch.
const isMain = isMainModule(import.meta.url);
if (isMain) {
  main().catch((error) => {
    emitErrorJson({
      schema: "ufo-mission-result-error-v1",
      code: error instanceof MissionResultError ? error.code : "internal",
      message: error instanceof Error ? error.message : String(error),
      details: error instanceof MissionResultError ? error.details : {},
    });
    process.exitCode = error instanceof MissionResultError && error.code === "usage" ? 64 : 1;
  });
}
