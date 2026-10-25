#!/usr/bin/env node
/**
 * ufo-swarm-wave — plan one swarm wave for OMP-native dispatch.
 *
 * Ports the verified kimi-code `/swarm` (AgentSwarm) semantics onto OMP's
 * `task` batch transport, per run-logic §4.3:
 *
 *   - ONE dispatch call per wave. The emitted `tasks` array is the payload of
 *     a single batched `task` call; splitting it into several calls violates
 *     the one-swarm-per-wave rule (kimi AgentSwarmExclusiveDenyPermissionPolicy).
 *   - At most 100 lanes per wave, counting spawn items and resumes together:
 *     the operator contract's global per-L1 atomized-L2 maximum, stricter
 *     than kimi's MAX_AGENT_SWARM_SUBAGENTS=128. `sighting.dispatch.swarm.maxLanes`
 *     and a per-spec `maxLanes` may only tighten the cap, never widen it.
 *   - Wave band: a wave with spawn lanes carries waveMinLanes..waveMaxLanes
 *     (config `sighting.dispatch.swarm.waveMinLanes`/`waveMaxLanes`, defaulting
 *     to the swarm band); a resume-only wave may be a single lane
 *     (kimi hasMinimumAgentSwarmInputs).
 *   - `{{item}}` template expansion; pairwise-distinct expanded prompts are
 *     REQUIRED — a duplicated expansion fails the wave before any lane
 *     spawns (kimi Map-dedupe throw). Never dedupe silently.
 *   - Resume preserves identity: a resume lane emits `{resume, message}` —
 *     the OMP mapping is `hub send` / `handle.send` to the parked agent id,
 *     which revives the same agent with its transcript and role. A resumed
 *     lane never carries a new `role`/`agent` (that would mint a
 *     replacement identity, violating I6).
 *   - Every spawn lane carries an explicit taxonomy role — never a wave of
 *     generic `task` agents. Swarm roles are the ten proposal roles;
 *     planner/distiller/labrat/Main are frozen-topology seats, not swarm
 *     lanes.
 *   - No per-lane `model` param: kimi gates it on `secondary-model`; ufo's
 *     collapse is the lane role's pinned route resolved from the global OMP
 *     alias table (AGENTS.md Routing authority) — never a hardcoded model.
 *
 * The kimi 5-per-700ms launch ramp is internal pacing of one AgentSwarm
 * call. On OMP the single `task` call is the wave and the harness queues
 * lanes beyond its concurrency window; the ramp constants are recorded in
 * the plan as declared pacing policy for substrates that pace manually.
 *
 * CLI (operator surface — declare a wave inline instead of staging a JSON
 * file; kimi's `/swarm` slash layer parses only `on|off|<prompt>`, so the
 * inline-declaration port is the spec SOURCE, not a new argument grammar):
 *   node scripts/ufo-swarm-wave.mjs plan --spec <wave.json|-> [--emit-tasks]
 *   node scripts/ufo-swarm-wave.mjs plan --spec-json <json> [--emit-tasks]
 *   node scripts/ufo-swarm-wave.mjs run  --spec <wave.json|->
 *   node scripts/ufo-swarm-wave.mjs run  --spec-json <json>
 *   node scripts/ufo-swarm-wave.mjs record --registry <path> --assignments <json>
 *   --spec - reads spec JSON from stdin with the same fail-closed bound as
 *   the file path. plan validates and emits the ufo-swarm-wave-v1 plan (or
 *   only plan.tasks with --emit-tasks). run validates and emits
 *   ufo-swarm-wave-dispatch-v1 — the exact single `task` call payload
 *   ({context, tasks} — spawn lanes only, null when the wave resumes only)
 *   plus resumeSends, one `hub send` entry per resume lane. `run` also
 *   persists the wave's member registry (ufo-swarm-registry-v1) at
 *   reportDir/swarm-registry.json or .ufo/scopes/<wave>/swarm-registry.json:
 *   a {name → {agentId, item, role}} map (G2). Spawn lanes land with
 *   agentId null; `record` fills them once the task call returns ids, so a
 *   later wave's resume lanes can name members across turns. Resume lanes
 *   are fail-closed: the agentId must appear in this wave's own registry or
 *   a declared spec.priorRegistry, else resume_unknown_member (kimi
 *   requireOwnedSubagent parity). The registry also persists each member's
 *   item text (C10) so a resumed row can name its item.
 *
 * Spec shape (JSON):
 *   {
 *     "wave": "recon-1",                  // optional label
 *     "context": "# Goal ...",            // optional batch-level task context
 *                                         //   (defaults to a minimal
 *                                         //   transport-shaped skeleton —
 *                                         //   the task call requires a
 *                                         //   string context)
 *     "template": "Audit {{item}} ...",   // optional; requires per-item "item"
 *     "hoist": true,                      // optional; template waves hoist the
 *                                         //   shared template (placeholder
 *                                         //   intact) into the batch context
 *                                         //   when the total payload shrinks
 *                                         //   by >= MIN_HOIST_SAVINGS bytes;
 *                                         //   ineligible/uneconomic waves
 *                                         //   bypass with the reason recorded
 *                                         //   in plan.compaction (r13)
 *     "reportDir": ".ufo/scopes/x/recon", // optional per-lane report dir
 *     "maxLanes": 32,                     // optional per-mission tightening
 *     "priorRegistry": ".ufo/scopes/recon-0/swarm-registry.json", // optional
 *     //   predecessor registry path (or array) a resume lane may name
 *     "items": [
 *       { "item": "src/auth", "role": "scout" },
 *       { "prompt": "Review ...", "role": "reviewer", "name": "SwarmAudit" },
 *       { "resume": "agent-abc123", "message": "Continue with ..." }
 *     ]
 *   }
 *
 * Route preflight (ONESHOT SUB-8, opt-in, plan and run):
 *   --route-families       record the wave's route families (distinct resolved
 *                          primary+chain per lane role, from one fd-bound
 *                          global-config snapshot) in plan.routePreflight;
 *   --route-probe <exe>    also ping each distinct hop once through <exe>
 *                          (scripts/ufo-route-preflight.mjs has the probe
 *                          contract). A family with no reachable hop fails
 *                          the wave with route_unreachable BEFORE the registry
 *                          is persisted or any payload is emitted.
 *
 * Exit codes: 0 ok · 1 invalid spec/plan (JSON error on stderr) · 64 usage.
 */
import { mkdirSync } from "node:fs";
import { RoutePreflightError, commandProbe, routePreflight } from "./ufo-route-preflight.mjs";
import { randomUUID } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDeclaredArgv, rejectFlagLikeValues, hasDuplicateArg, readBoundedFile, readBoundedJson, readBoundedStdin, redactFsErrorMessage, writeFileAtomic, withDirLock, ALLOW_EXTERNAL_TOOLS, isMainModule, isPlainObject, nonStringFields, emitJson, emitErrorJson, MissionResultError, gatedConfigPath, loadSwarmPolicy as loadHubSwarmPolicy, MAX_SWARM_LANES, MIN_SWARM_LANES } from "./ufo-mission-result.mjs";
import { loadRegistryDocument, MAX_REGISTRY_BYTES, MEMBER_NAME_PATTERN, RESUME_ID_PATTERN, SWARM_REGISTRY_SCHEMA, relativePathProblem, resolveBeneathRoot } from "./ufo-swarm-registry.mjs";

const ROOT = resolve(
  process.env.UFO_PROJECT_ROOT || join(dirname(fileURLToPath(import.meta.url)), ".."),
);
// S-04 containment gate: shared `beneath` walk (via ufo-swarm-registry's
// resolveBeneathRoot) + ALLOW_EXTERNAL_TOOLS (ufo-mission-result.mjs,
// nc3-swarm r47/r48) — the predicate and escape flag the dispatcher's
// gatedExecPath applies to the SAME env var this file gates. The config gate
// moved to the hub as `gatedConfigPath` (nc5-swarm r20): the stale watchdog
// resolves the same swarm policy from the same gated surface, and one
// canonical copy ends the drift surface. Registry paths use the same walk.
// Resolved on use (loadSwarmPolicy's default), not at import: a caller that
// passes an explicit configPath must not be crashed by an unrelated env
// override, and the CLI boundary owns the typed refusal.
function defaultConfigPath() {
  return gatedConfigPath(ROOT, process.env.UFO_CONFIG_PATH, join(ROOT, "config", "ufo.json"), "UFO_CONFIG_PATH");
}

// Module-internal: wave schemas and kimi-parity knobs are emitted by the CLI
// but imported by nothing (conformance vectors cite the schema STRINGS as
// data). The export surface is SWARM_ROLES, SwarmWaveError, the two producer
// maxima the collector derives its input bounds from, and the five documented
// functions.
const SWARM_WAVE_SCHEMA = "ufo-swarm-wave-v1";
const SWARM_WAVE_ERROR_SCHEMA = "ufo-swarm-wave-error-v1";
const SWARM_DISPATCH_SCHEMA = "ufo-swarm-wave-dispatch-v1";

// Operator contract: the global per-L1 atomized-L2 swarm maximum is 100 —
// stricter than kimi's MAX_AGENT_SWARM_SUBAGENTS=128. Kimi parity for the
// rest: minimum 2 unless all-resume, launch ramp 5 per 700 ms. The values
// live in the hub (ufo-mission-result.mjs) since nc4-swarm r02 — imported
// above, never restated here (one authority, one name).
const MAX_SPEC_BYTES = 1024 * 1024;
const MAX_ITEM_BYTES = 4 * 1024;
// Producer maxima imported by ufo-swarm-collect.mjs to derive its input
// bounds — the collector must admit exactly the payloads this planner emits.
export const MAX_PROMPT_BYTES = 64 * 1024;
export const MAX_CONTEXT_BYTES = 64 * 1024;
// Operator directive 2026-09-20: every dispatched subagent lane opens with
// this skill line. A lane is a fresh session — the Godspeed posture must be
// invoked, not assumed. Kept in sync with the fleet prompt convention
// (`/skill:ufo` for L1 assignments, `/skill:godspeed` for L2 lanes).
const GODSPEED_INVOCATION = "/skill:godspeed";
// The canonical terminal envelope marker (collect-omp-native-handoff
// GODSPEED_MARKER, run-omp-native-trial GODSPEED_MARKER): envelope-only,
// loads nothing, and must stay TERMINAL. fleet-dispatcher's envelope check is
// `trimEnd().endsWith("| godspeed")` and run-omp-native-trial requires
// exactly one marker, last.
const GODSPEED_MARKER = "| godspeed";

// Hook parity (`hasInvocation`, .omp/hooks/pre/ufo-godspeed-inject.js): a lane
// task that already opens with the invocation is left untouched. Idempotence
// is the shared contract, not a local nicety — a stacked second invocation
// would survive the hook (it sees a leading invocation and returns) and reach
// the lane twice.
function opensWithGodspeedInvocation(text) {
  return /^\s*\/skill:godspeed(?:\s|$)/u.test(text);
}

// Append the reportDir suffix as its own paragraph, BEFORE a terminal
// `| godspeed` marker when the text ends with one (seam #47). Appending after
// the marker would leave it nonterminal and put the operator's instruction
// outside the envelope that the canonical checks require to end with it.
function appendReportSuffix(text, suffix) {
  const trimmed = text.trimEnd();
  if (!trimmed.endsWith(GODSPEED_MARKER)) return `${text}\n\n${suffix}`;
  const body = trimmed.slice(0, trimmed.length - GODSPEED_MARKER.length).trimEnd();
  return body === ""
    ? `${suffix}\n\n${GODSPEED_MARKER}`
    : `${body}\n\n${suffix}\n\n${GODSPEED_MARKER}`;
}

// Envelope integrity (seam #47, F1): after full composition a lane text
// carries either NO marker (historical — a prompt without an envelope
// stays valid) or exactly ONE marker, terminal. The canonical consumers
// demand that shape (fleet-dispatcher splitGodspeedEnvelope: exactly one,
// trimEnd()-terminal; run-omp-native-trial: one marker, last). A second
// marker can arrive through bytes this renderer does not author — a
// reportDir segment that contains the marker bytes ("x| godspeed") lands
// one inside the suffix — and a marker-shaped phrase mid-prompt is a
// single nonterminal marker. Refuse with a typed spec error, never strip:
// duplicates are an operator error, and silently repairing one would
// dispatch bytes the operator never wrote. Resume messages and spawn
// prompts share this check.
function checkEnvelopeMarker(text, label) {
  const markerCount = text.split(GODSPEED_MARKER).length - 1;
  if (markerCount > 1) {
    fail("invalid_spec", `${label} carries ${markerCount} "${GODSPEED_MARKER}" markers; the Godspeed envelope allows at most one, terminal`);
  }
  if (markerCount === 1 && !text.trimEnd().endsWith(GODSPEED_MARKER)) {
    fail("invalid_spec", `${label} carries a nonterminal "${GODSPEED_MARKER}" marker; the single envelope marker must close the text`);
  }
}

// The per-lane report instruction is verbatim at both composition sites
// (resume message, spawn prompt): one renderer so the two paths can never
// drift on the path join or the wording.
function reportInstruction(reportDir, name) {
  return `Report: write your scoped findings to ${reportDir}/${name}.md`;
}

// Schema-v2 shared-template frame (nc5-swarm r13). The template is carried
// VERBATIM — `{{item}}` placeholder intact — so the hoist moves only
// byte-identical shared bytes into the batch context; each lane substitutes
// the item named in its own task for every placeholder occurrence. Per-lane
// item, judgment binding, report path, and the godspeed invocation stay
// inline in the task, where the envelope checks and the godspeed-inject hook
// expect them.
function hoistedTemplateContext(base, template) {
  return [
    base,
    "# Shared lane template",
    `Every lane of this wave expands the template below, substituting its own item for each ${ITEM_PLACEHOLDER} occurrence. Your item, judgment binding, and report path arrive in your lane task.`,
    "",
    template,
  ].join("\n\n");
}

// Composition tail (nc3-swarm r69): a fully-composed lane text — resume
// message or spawn prompt — is byte-bounded then envelope-checked, in that
// order. `cause` carries the site-specific bound phrase so emitted messages
// stay byte-identical to the inline arms they replace.
function checkComposedText(text, label, cause) {
  if (byteLength(text) > MAX_PROMPT_BYTES) {
    fail("invalid_spec", `${label} exceeds ${MAX_PROMPT_BYTES} bytes ${cause}`);
  }
  checkEnvelopeMarker(text, label);
}

const MAX_WAVE_BYTES = 128;
// Registry schema, member-name/agent-id grammar, byte bound, and path rules
// live in ufo-swarm-registry.mjs — the collector reads the same authority.
const MAX_PRIOR_REGISTRIES = 16;
const ITEM_PLACEHOLDER = "{{item}}";

// Swarm lanes are the ten proposal roles. planner/distiller/labrat/Main are
// frozen-topology seats and can never be swarm lanes.
export const SWARM_ROLES = new Set([
  "scout",
  "reviewer",
  "critic",
  "connector",
  "sentinel",
  "executor",
  "mutation-tester",
  "revenger",
  "simplifier",
  "scribe",
]);

const SPEC_KEYS = new Set(["wave", "context", "template", "reportDir", "maxLanes", "items", "priorRegistry", "axes", "milestone", "hoist"]);
const ITEM_KEYS = new Set(["item", "prompt", "role", "resume", "message", "name", "axes", "milestone"]);
// Minimal shared context for a contextless spec (nc5-swarm r06): the task
// transport requires a string context, so an omitted context defaults to
// this transport-shaped skeleton and the emitted taskCall stays directly
// passable. Requirements only — no item scopes, no axes, no invented
// mission contract; an explicit spec.context always wins byte-identically.
const DEFAULT_WAVE_CONTEXT = [
  "# Goal",
  "Wave member: execute your lane task and report its observable outcome.",
  "",
  "# Constraints",
  "Leaf member — no subagent dispatch except your single labrat. Fleet and isolation bindings arrive in your lane task text.",
  "",
  "# Contract",
  "Return the lane's result; the wave collector joins it by member name.",
].join("\n");

// Schema-v2 hoist floor (nc5-swarm r13): compaction applies only when the
// total payload (shared context once + every lane task) shrinks by at least
// this many UTF-8 bytes. Below the floor the legacy per-lane shape ships
// instead — a marginal saving does not pay for the context/task split.
const MIN_HOIST_SAVINGS = 512;
// Per-lane judgment binding (mission goal: axes/milestone per atom). `axes`
// is a short list of axis names the lane is judged on; `milestone` names the
// plan milestone the atom serves. Both are spawn-item metadata: they render
// into the lane prompt and persist into the registry so collect can surface
// them. A resume lane keeps the member's original binding — restating it
// would fork the judgment contract, so the keys are refused there.
const MAX_LANE_AXES = 8;
const MAX_LANE_META_BYTES = 256;

export class SwarmWaveError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "SwarmWaveError";
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

function fail(code, message) {
  throw new SwarmWaveError(code, message);
}


function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

function optionalText(value, label, maximumBytes) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.trim().length === 0) {
    fail("invalid_spec", `${label} must be a nonempty string`);
  }
  if (byteLength(value) > maximumBytes) {
    fail("invalid_spec", `${label} exceeds ${maximumBytes} bytes`);
  }
  return value;
}

// First-duplicate-wins scan (nc3-swarm r68): the expanded-prompt, resume-id,
// and --assignments handle checks all walked a Map the same way — `prior =
// seen.get(key); if (prior !== undefined) fail(...); seen.set(key, tag)` —
// so the FIRST colliding pair names the typed refusal and later duplicates
// never mask it. `entries` yields [key, tag] pairs; `onDuplicate` receives
// the earlier tag, the current tag, and the shared key, and always throws.
// The usedNames Set below is a different shape (no carried tag) and stays
// inline.
function rejectDuplicate(entries, onDuplicate) {
  const seen = new Map();
  for (const [key, tag] of entries) {
    const prior = seen.get(key);
    if (prior !== undefined) onDuplicate(prior, tag, key);
    seen.set(key, tag);
  }
}
// Bounded reads: shared primitives (ufo-mission-result.mjs) — O_NOFOLLOW
// refuses a symlinked spec/config path at open, O_NONBLOCK fails a FIFO
// instead of hanging, fstat pins the size BEFORE buffering, and the size+1
// slack byte + post-read fstat fail closed on a mid-read grow. The `code`
// argument keeps this CLI's typed contract: the primitive's canonical
// messages flow through fail() unchanged.
function boundedFile(file, maximum, code, label) {
  return readBoundedFile(file, maximum, label, (message) => fail(code, message));
}

// Same fail-closed bound for stdin (`--spec -`): a pipe has no fstat size to
// pre-check, so the read kills the wave the moment the bound is crossed.
function boundedStdin(maximum, code, label) {
  return readBoundedStdin(maximum, label, (message) => fail(code, message));
}


function camelRole(role) {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// Hub relocation (nc4-swarm r02): the policy loader lives in
// ufo-mission-result.mjs — the one acyclic hub every daemon already imports
// (the r02 HubRelocate lane verified the DAG). The hub speaks
// MissionResultError; this CLI's typed envelope is SwarmWaveError, so the
// invalid_policy code maps through fail() and the emitted error schema,
// codes, and messages stay byte-stable for every caller. The loader's full
// contract (bands, floors, provenance) is documented on the hub export.
function loadSwarmPolicy(configPath = defaultConfigPath()) {
  try {
    return loadHubSwarmPolicy(configPath);
  } catch (error) {
    if (error instanceof MissionResultError && error.code === "invalid_policy") {
      fail("invalid_policy", error.message);
    }
    throw error;
  }
}

// Shared relative-path rule for reportDir and registry references: no
// absolute paths, no backslashes (a POSIX backslash is a filename character,
// not a separator — treating it as one would let "a\b" smuggle a segment the
// filesystem never sees), no empty/"." /".." segments ("x/./y" resolves to
// "x/y" but the spelling hides it from a reader).
function validateRelativePath(value, label, code) {
  const dir = optionalText(value, label, 512);
  if (dir === null) return null;
  const problem = relativePathProblem(dir);
  if (problem === "absolute") fail(code, `${label} must be a relative path`);
  if (problem === "backslashes") fail(code, `${label} must not contain backslashes`);
  if (problem === "segments") fail(code, `${label} must not contain empty, '.', or '..' segments`);
  return dir;
}

function validateReportDir(value) {
  return validateRelativePath(value, "reportDir", "invalid_report_dir");
}

// The wave's own member registry: reportDir when declared, else
// .ufo/scopes/<wave>/ (G2 — the registry must live where a later wave's
// resume lanes can name it). `wave` becomes a path segment, so it must be a
// single clean segment; an unnamed wave shares the "wave" scope.
function registryRelPath(reportDir, wave) {
  if (wave !== null && (wave.includes("/") || wave.includes("\\") || wave === "." || wave === "..")) {
    fail("invalid_spec", "wave must be a single path segment when it names the registry scope");
  }
  const dir = reportDir ?? `.ufo/scopes/${wave ?? "wave"}`;
  return `${dir}/swarm-registry.json`;
}

// Registry paths are read/write paths whose bytes decide resume ownership —
// an outside-root reference is policy injection by path. Gated exactly like
// the config path: same `beneath` walk, same escape flag.
function gatedRegistryPath(relPath, label) {
  // `beneath` rethrows non-ENOENT lstat faults; resolveBeneathRoot reports an
  // unstatable path as not provably inside the root, so it fails closed into
  // the same typed refusal gatedConfigPath emits.
  const { resolved, inside } = resolveBeneathRoot(ROOT, relPath);
  if (!inside && !ALLOW_EXTERNAL_TOOLS) {
    const error = new Error(`${label} resolves outside the project root: ${relPath}`);
    error.code = "EXEC_PATH_OUTSIDE_ROOT";
    throw error;
  }
  return resolved;
}

// spec.priorRegistry: a declared predecessor wave's registry path (string) or
// a bounded list of them. Each is a root-relative path under the same rules
// as reportDir.
function validatePriorRegistries(value) {
  if (value === undefined || value === null) return [];
  const raw = Array.isArray(value) ? value : [value];
  if (raw.length > MAX_PRIOR_REGISTRIES) {
    fail("invalid_spec", `spec.priorRegistry exceeds ${MAX_PRIOR_REGISTRIES} entries`);
  }
  const seen = new Set();
  const paths = [];
  for (const entry of raw) {
    const rel = validateRelativePath(entry, "spec.priorRegistry", "invalid_registry_path");
    if (rel === null) {
      fail("invalid_registry_path", "spec.priorRegistry entries must be nonempty strings");
    }
    if (!seen.has(rel)) {
      seen.add(rel);
      paths.push(rel);
    }
  }
  return paths;
}

// Cross-prior claim consistency (nc5-swarm r17, Audit04 suspect + planner
// H3/H5/H6): the same agentId listed under contradictory member/item
// evidence across prior registries is ambiguous ownership — fail closed
// invalid_registry. Identical claims are lineage redundancy (a resumed
// member legitimately re-listed under a different row key, e.g. a wake row
// carrying the original member provenance) and pass. ONE comparison shape
// shared by plan-time admission, lock-time revalidation, and record-time
// attestation, so the three surfaces cannot drift; the normalized claim is
// (entry.member ?? row key, entry.item ?? null) on both sides.
function assertConsistentPriorClaims(priorRegistries, ref = "spec.priorRegistry") {
  const claims = new Map();
  for (const prior of priorRegistries) {
    for (const [name, entry] of prior.members) {
      if (typeof entry.agentId !== "string") continue;
      const claim = {
        member: typeof entry.member === "string" ? entry.member : name,
        item: typeof entry.item === "string" ? entry.item : null,
      };
      const existing = claims.get(entry.agentId);
      if (existing !== undefined) {
        if (existing.member !== claim.member || existing.item !== claim.item) {
          fail(
            "invalid_registry",
            `${ref}: agentId ${entry.agentId} carries contradictory member/item evidence across prior registries`,
          );
        }
        continue;
      }
      claims.set(entry.agentId, claim);
    }
  }
  return claims;
}

// Load a ufo-swarm-registry-v1 file. Fail-closed: a missing required file,
// malformed JSON, wrong schema, or a member entry with a mistyped field is
// invalid_registry — a corrupt registry must never widen the
// resume-ownership set. `required: false` (the wave's own registry at plan
// time) treats ENOENT as "no registry yet" → null.
//
// `ref` is the relative, caller-spelled path (operator flag or artifact
// field) used in every diagnostic; the resolved absolute path is read but
// never interpolated (nc5-swarm r02 error-surface pass). Raw fs messages
// also carry the absolute path, so only the redacted errno text is kept.
function loadRegistry(resolvedPath, { required, ref }) {
  let raw;
  try {
    raw = boundedFile(resolvedPath, MAX_REGISTRY_BYTES, "invalid_registry", `registry ${ref}`);
  } catch (error) {
    if (!required && error?.code === "ENOENT") return null;
    if (error instanceof SwarmWaveError) throw error;
    fail("invalid_registry", `cannot read registry ${ref}: ${redactFsErrorMessage(error)}`);
  }
  // Document envelope + member container are shared with the collector
  // (ufo-swarm-registry.mjs); the per-member strictness below is the wave
  // side's ownership authority and stays here. The map-only mode is the
  // producer's shape — the collector alone tolerates array-form input.
  const doc = loadRegistryDocument(raw, {
    fail,
    members: "map",
    messages: {
      invalidJson: (error) => `registry ${ref} is not valid JSON: ${error.message}`,
      notDocument: () => `registry ${ref} is not a ${SWARM_REGISTRY_SCHEMA} document`,
      membersContainer: () => `registry ${ref} is not a ${SWARM_REGISTRY_SCHEMA} document`,
      entryObject: (label) => `registry ${ref} member ${label} is not an object`,
      missingName: (label) => `registry ${ref} member ${label} is missing a name`,
      memberName: (name) => `registry ${ref} member name ${JSON.stringify(name)} is not a wave member name`,
      duplicateName: (name) => `duplicate registry entry for member ${name}`,
    },
  });
  for (const field of nonStringFields(
    { wave: doc.wave, createdAt: doc.createdAt, updatedAt: doc.updatedAt },
    ["wave", "createdAt", "updatedAt"],
  )) {
    fail("invalid_registry", `registry ${ref} has a non-string ${field}`);
  }
  const members = new Map();
  for (const { name, entry } of doc.rows) {
    if (entry.agentId !== undefined && entry.agentId !== null
      && (typeof entry.agentId !== "string" || !RESUME_ID_PATTERN.test(entry.agentId))) {
      fail("invalid_registry", `registry ${ref} member ${name} has an invalid agentId`);
    }
    for (const field of nonStringFields(entry, ["item", "role", "member", "kind", "milestone"])) {
      fail("invalid_registry", `registry ${ref} member ${name} has a non-string ${field}`);
    }
    if (entry.axes !== undefined && entry.axes !== null
      && (!Array.isArray(entry.axes) || entry.axes.some((axis) => typeof axis !== "string"))) {
      fail("invalid_registry", `registry ${ref} member ${name} has a non-string-list axes`);
    }
    members.set(name, entry);
  }
  // Fail closed on shared ownership: record() guards its own writes, but a
  // hand-corrupted registry can mint two members on one agentId — plan
  // admission would then resolve a resume to the LAST Map.set winner
  // silently (nc5-swarm r14 audit, Audit16). Duplicate agentId is corrupt
  // by construction: resume rows carry agentId:null, so legit registries
  // never collide here.
  const agentIdOwners = new Map();
  for (const [name, entry] of members) {
    if (entry.agentId === undefined || entry.agentId === null) continue;
    const priorOwner = agentIdOwners.get(entry.agentId);
    if (priorOwner !== undefined) {
      fail("invalid_registry", `registry ${ref} members ${priorOwner} and ${name} share agentId ${JSON.stringify(entry.agentId)}`);
    }
    agentIdOwners.set(entry.agentId, name);
  }
  // priorRegistries is the wave's recorded predecessor declarations (r02):
  // carried through the normalized shape so `record` can re-validate
  // cross-file ownership. Malformed shapes fail closed at load — a corrupt
  // declaration must not silently weaken the record-time check.
  let priorRegistries = null;
  if (doc.priorRegistries !== undefined) {
    if (!Array.isArray(doc.priorRegistries)
      || doc.priorRegistries.some((entry) => typeof entry !== "string" || entry.length === 0)) {
      fail("invalid_registry", `registry ${ref} has a malformed priorRegistries`);
    }
    priorRegistries = doc.priorRegistries.slice();
  }
  return { members, wave: doc.wave, createdAt: doc.createdAt, reportDir: doc.reportDir, priorRegistries };
}

// Judgment binding is minted on the spawn member. A resume row is a new
// registry key, so without a copy collect reads the resume member and the
// axes/milestone disappear. Copy only a binding that still satisfies the
// spawn bounds; a present-but-invalid list fails closed.
function inheritedJudgment(entry, label) {
  let axes = null;
  if (entry.axes !== undefined && entry.axes !== null) {
    const axesOk = Array.isArray(entry.axes)
      && entry.axes.length >= 1
      && entry.axes.length <= MAX_LANE_AXES
      && entry.axes.every((axis) => typeof axis === "string" && axis.length > 0 && byteLength(axis) <= MAX_LANE_META_BYTES)
      && new Set(entry.axes).size === entry.axes.length;
    if (!axesOk) {
      fail("invalid_registry", `${label} axes are not a binding of 1..${MAX_LANE_AXES} distinct nonempty names within ${MAX_LANE_META_BYTES} bytes`);
    }
    axes = entry.axes.slice();
  }
  let milestone = null;
  if (entry.milestone !== undefined && entry.milestone !== null) {
    if (typeof entry.milestone !== "string" || entry.milestone.length === 0 || byteLength(entry.milestone) > MAX_LANE_META_BYTES) {
      fail("invalid_registry", `${label} milestone is not a nonempty string within ${MAX_LANE_META_BYTES} bytes`);
    }
    milestone = entry.milestone;
  }
  return { axes, milestone };
}

// Atomic registry write via the shared writeFileAtomic (ufo-mission-result):
// random O_EXCL tmp refuses the symlink squat a predictable .tmp-<pid> name
// invited (the registry path is spec-controlled — reportDir may name a
// shared-writable directory), fsync before rename + dir fsync after make the
// publish durable, and failure unlinks the tmp so retries never collide.
function writeRegistry(resolvedPath, registry) {
  mkdirSync(dirname(resolvedPath), { recursive: true });
  writeFileAtomic(resolvedPath, `${JSON.stringify(registry, null, 2)}\n`);
}

// The ufo-swarm-registry-v1 document shape — both writers (persistWaveRegistry
// at `run`, mainRecord at `record`) rebuilt this literal privately and the
// guards had already drifted (reportDir was `!== undefined` in one and
// `typeof === "string"` in the other). One canonical rebuild: `wave` always
// emits (null when the source never recorded one — loadRegistry accepts
// absent/null/string), `createdAt` falls back to the write time, `reportDir`
// emits only when it is a string, and `members` is the caller's merged map.
function buildRegistryDoc({ wave, createdAt, reportDir, members, priorRegistries }) {
  const now = new Date().toISOString();
  return {
    schema: SWARM_REGISTRY_SCHEMA,
    wave: wave ?? null,
    createdAt: createdAt ?? now,
    updatedAt: now,
    ...(typeof reportDir === "string" ? { reportDir } : {}),
    // Declared predecessor registries, persisted so `record` can re-validate
    // ownership against them under its lock (nc4-swarm r02, ToctouDesign
    // finding 1 cross-file arm). Absent when the wave declared none.
    ...(Array.isArray(priorRegistries) ? { priorRegistries } : {}),
    members,
  };
}

// ── Registry lock (dispatcher/monitor queue-lock parity) ──
// The registry is the resume-ownership authority, and both writers
// (persistWaveRegistry at `run`, mainRecord at `record`) are
// load→mutate→write sequences. Without a cross-process fence two
// concurrent `record` calls lose one assignment — a silently orphaned
// handle — and a `run` racing a `record` can drop members or resurrect
// reset rows. The lock is a `<registry>.lock` directory beside the
// registry; every writer in this file takes it, and this file is the only
// writer of ufo-swarm-registry-v1. Read-only loads (priorRegistry, resume
// resolution) stay lock-free: the atomic rename already gives them one
// consistent snapshot. The protocol is the shared withDirLock
// (ufo-mission-result.mjs, nc3-swarm r45); this wrapper keeps the
// registry's parent creation, token shape, messages, and the typed
// invalid_registry owner-reader contract.
function withRegistryLock(resolvedPath, fn) {
  const lockPath = `${resolvedPath}.lock`;
  // The lock lives beside the registry, whose parent writeRegistry already
  // creates — create it here too so `record` on a missing registry fails
  // with invalid_registry, not ENOENT on the lock dir.
  mkdirSync(dirname(resolvedPath), { recursive: true });
  try {
    return withDirLock(lockPath, {
      token: `swarm-${randomUUID()}`,
      timeoutMessage: "ufo-swarm-wave: registry lock timeout",
      unsafeMessage: "registry lock path is unsafe",
      readOwner: (ownerPath) => readBoundedJson(ownerPath, 4096, "lock owner", (message) => fail("invalid_registry", message)),
    }, fn);
  } catch (error) {
    // Lock denial is a typed refusal, not an internal fault: a timeout or an
    // unsafe lock path must surface as registry_lock_* so an operator can
    // tell contention from a bug (reportError maps plain Errors to internal).
    if (error instanceof SwarmWaveError) throw error;
    const message = String(error?.message ?? error);
    if (message.includes("registry lock timeout")) {
      fail("registry_lock_timeout", message);
    }
    if (message.includes("lock path is unsafe")) {
      fail("registry_lock_unsafe", message);
    }
    throw error;
  }
}

function validateResumeId(value, index) {
  if (typeof value !== "string" || !RESUME_ID_PATTERN.test(value)) {
    fail("invalid_resume_id", `items[${index}].resume must be an agent id (${RESUME_ID_PATTERN})`);
  }
  return value;
}

function validateName(value, index) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !MEMBER_NAME_PATTERN.test(value)) {
    fail("invalid_name", `items[${index}].name must be CamelCase, 2-32 chars (${MEMBER_NAME_PATTERN})`);
  }
  return value;
}

// Judgment metadata: `axes` is a bounded list of axis names, `milestone` a
// short label. The same shape validates at two levels — `spec.axes` /
// `spec.milestone` are the wave's defaults (label "spec"), `items[N].axes` /
// `items[N].milestone` are the per-lane binding (label "items[N]"). Both are
// optional; absent stays absent (a lane with no declared binding is judged
// on the round's axes by default).
function validateLaneMeta(raw, label) {
  let axes = null;
  if (raw.axes !== undefined && raw.axes !== null) {
    if (!Array.isArray(raw.axes) || raw.axes.length === 0 || raw.axes.length > MAX_LANE_AXES) {
      fail("invalid_spec", `${label}.axes must be an array of 1..${MAX_LANE_AXES} axis names`);
    }
    axes = raw.axes.map((axis, at) => {
      if (typeof axis !== "string" || axis.length === 0 || byteLength(axis) > MAX_LANE_META_BYTES) {
        fail("invalid_spec", `${label}.axes[${at}] must be a nonempty string within ${MAX_LANE_META_BYTES} bytes`);
      }
      return axis;
    });
    if (new Set(axes).size !== axes.length) {
      fail("invalid_spec", `${label}.axes carries a duplicate axis name`);
    }
  }
  const milestone = optionalText(raw.milestone, `${label}.milestone`, MAX_LANE_META_BYTES);
  return { axes, milestone };
}

// Render the lane's contract into the prompt: the leaf bound first (every
// swarm lane is a leaf member — only an executor may spawn, and only its
// one labrat), then the judgment binding. A lane that knows its axes and
// milestone can be scored against them, and the registry copy lets collect
// attribute the verdict. Appended BEFORE the reportDir suffix so the report
// instruction stays last inside the envelope.
function laneBindingSuffix(lane) {
  const lines = [
    lane.role === "executor"
      ? "Lane bounds: leaf member — no subagent dispatch except your single labrat."
      : "Lane bounds: leaf member — no subagent dispatch.",
  ];
  if (lane.axes !== null) lines.push(`Judged on: ${lane.axes.join(", ")}`);
  if (lane.milestone !== null) lines.push(`Milestone: ${lane.milestone}`);
  return lines.join("\n");
}

/**
 * Plan one swarm wave. Pure: validates the spec against the ported kimi
 * semantics and returns the dispatch plan. The caller executes the plan by
 * issuing ONE batched `task` call with `plan.tasks` (spawn lanes) and one
 * `hub send` per resume lane — or, on substrates with a native swarm batch,
 * the equivalent single call.
 *
 * @param {object} spec
 * @param {{policy?: {source?: "config"|"default", maxLanes: number, rampBatchSize: number, rampIntervalMs: number, globalRunnerCeiling: number|null}}} [options]
 * @returns {object} plan (schema ufo-swarm-wave-v1)
 */
export function planSwarmWave(spec, options = {}) {
  if (!isPlainObject(spec)) fail("invalid_spec", "spec must be a JSON object");
  for (const key of Object.keys(spec)) {
    if (!SPEC_KEYS.has(key)) fail("invalid_spec", `unknown spec key ${JSON.stringify(key)}`);
  }
  const policy = options.policy ?? loadSwarmPolicy();
  // The 100 ceiling is a hard invariant: an injected or config policy may
  // tighten it, never widen it. Injected policies get the same validation
  // loadSwarmPolicy applies to config — a caller must not smuggle in
  // non-integer or negative pacing values. One loop covers the cap, the
  // pacing knobs, and the band: an untyped waveMinLanes would otherwise
  // fall through to the MIN_SWARM_LANES default and silently change the
  // floor. Check order is the original declaration order.
  for (const key of ["maxLanes", "rampBatchSize", "rampIntervalMs", "minLanes", "waveMinLanes", "waveMaxLanes"]) {
    if (policy[key] !== undefined && (!Number.isSafeInteger(policy[key]) || policy[key] < 1)) {
      fail("invalid_policy", `policy.${key} must be a positive integer`);
    }
  }
  // Injected-policy parity with loadSwarmPolicy (lines ~409-425): the config
  // loader clamps the wave band to maxLanes and rejects an inverted band as
  // invalid_policy. An injected policy must not smuggle in an inversion that
  // would surface as impossible_band — a spec-induced refusal — when the
  // policy itself is malformed. Defaults mirror the loader: floor falls back
  // to minLanes, ceiling to the effective cap. Both clamp to policyMaxLanes
  // (computed below), never to the spec cap — the floor is a policy minimum
  // and clamping it to cap would make impossible_band unreachable.
  const policyMaxLanes =
    policy.maxLanes === undefined ? MAX_SWARM_LANES : Math.min(policy.maxLanes, MAX_SWARM_LANES);
  const policyFloor = Math.min(
    Number.isSafeInteger(policy.waveMinLanes) && policy.waveMinLanes > 0
      ? policy.waveMinLanes
      : (Number.isSafeInteger(policy.minLanes) && policy.minLanes > 0 ? policy.minLanes : MIN_SWARM_LANES),
    policyMaxLanes);
  const policyCeiling = Math.min(
    Number.isSafeInteger(policy.waveMaxLanes) && policy.waveMaxLanes > 0
      ? policy.waveMaxLanes
      : policyMaxLanes,
    policyMaxLanes);
  if (policyCeiling < policyFloor) {
    fail("invalid_policy", `policy wave band is inverted: waveMaxLanes ${policyCeiling} < waveMinLanes ${policyFloor}`);
  }
  if (policy.globalRunnerCeiling !== undefined && policy.globalRunnerCeiling !== null
    && (!Number.isSafeInteger(policy.globalRunnerCeiling) || policy.globalRunnerCeiling < 1)) {
    fail("invalid_policy", "policy.globalRunnerCeiling must be a positive integer");
  }

  const wave = optionalText(spec.wave, "wave", MAX_WAVE_BYTES);
  // A contextless spec still yields a directly passable taskCall (nc5-swarm
  // r06): the task transport requires a string context, so the advertised-
  // optional key defaults to a minimal transport-shaped skeleton — the
  // documented "dispatch-ready {context,tasks}" payload is otherwise a null
  // context no caller can pass verbatim.
  // Explicit context stays byte-identical at the head of the emitted
  // context; a template hoist (below) may APPEND the shared template after
  // it, never rewrite it. Resume-only waves still emit taskCall:null.
  let context = optionalText(spec.context, "context", MAX_CONTEXT_BYTES) ?? DEFAULT_WAVE_CONTEXT;
  const template = optionalText(spec.template, "template", MAX_PROMPT_BYTES);
  // A template without the placeholder expands every item to the same text —
  // either duplicate_expansion or a wave of identical lanes. Refuse it
  // directly instead of letting the degenerate expansion surface downstream.
  if (template !== null && !template.includes(ITEM_PLACEHOLDER)) {
    fail("invalid_spec", "spec.template must contain the {{item}} placeholder");
  }
  // Schema-v2 context compaction (nc5-swarm r13): a template wave hoists the
  // byte-identical template — placeholder intact — into the shared taskCall
  // context once, instead of embedding a full expansion in every lane task.
  // The expansion is still validated exactly as before (64 KiB bound,
  // pairwise-distinct expansions); hoist rewrites EMISSION only. Opt-out for
  // operators who need the legacy per-lane shape (e.g. a template that fits
  // per-lane but breaches the shared context bound).
  const hoist = spec.hoist === undefined ? true : spec.hoist;
  if (typeof hoist !== "boolean") {
    fail("invalid_spec", "spec.hoist must be a boolean");
  }


  const reportDir = validateReportDir(spec.reportDir);
  const priorRegistries = validatePriorRegistries(spec.priorRegistry);
  const registryPath = registryRelPath(reportDir, wave);
  // Wave-level judgment defaults: every spawn lane that does not declare its
  // own axes/milestone inherits these. Resume lanes never see them — a
  // resume keeps the member's binding minted at spawn (the registry is the
  // authority), so spec defaults apply to spawn items only.
  const specMeta = validateLaneMeta(spec, "spec");

  let cap = policyMaxLanes;
  let declaredMaxLanes = null;
  if (spec.maxLanes !== undefined) {
    if (!Number.isSafeInteger(spec.maxLanes) || spec.maxLanes < 1) {
      fail("invalid_spec", "spec.maxLanes must be a positive integer");
    }
    // A spec may only tighten the cap; a value above the hard ceiling is
    // clamped, not widened — record the declared value so the clamp is
    // visible in the plan instead of a silent no-op.
    declaredMaxLanes = spec.maxLanes;
    cap = Math.min(cap, spec.maxLanes);
  }

  if (!Array.isArray(spec.items)) {
    fail("invalid_spec", "spec.items must be an array");
  }

  // One pass validates AND classifies: the band checks below need the
  // spawn/resume split, and a lanes.map plus two filters ran three
  // traversals for one pass's work. `lanes` stays the task-mint pass's
  // input; spawns/resumes are the same lane objects, in spec order.
  const lanes = [];
  const spawns = [];
  const resumes = [];
  const file = (lane) => {
    lanes.push(lane);
    (lane.kind === "resume" ? resumes : spawns).push(lane);
  };
  spec.items.forEach((raw, index) => {
    if (!isPlainObject(raw)) fail("invalid_spec", `items[${index}] must be an object`);
    for (const key of Object.keys(raw)) {
      if (!ITEM_KEYS.has(key)) {
        fail("invalid_spec", `items[${index}] has unknown key ${JSON.stringify(key)}`);
      }
    }
    const name = validateName(raw.name, index);
    const isResume = raw.resume !== undefined && raw.resume !== null;
    if (isResume) {
      const resume = validateResumeId(raw.resume, index);
      if (raw.role !== undefined) {
        fail("resume_role_forbidden", `items[${index}] is a resume; role would mint a new identity (I6)`);
      }
      if (raw.item !== undefined && raw.item !== null) {
        fail("resume_item_forbidden", `items[${index}] is a resume; item expansion does not apply`);
      }
      // Judgment binding is minted with the member, not restated per wake:
      // a resume keeps the member's original axes/milestone from the
      // registry, so re-declaring them here would fork the contract.
      if (raw.axes !== undefined && raw.axes !== null) {
        fail("resume_meta_forbidden", `items[${index}] is a resume; axes bind at spawn, not per wake`);
      }
      if (raw.milestone !== undefined && raw.milestone !== null) {
        fail("resume_meta_forbidden", `items[${index}] is a resume; milestone binds at spawn, not per wake`);
      }
      // `null` means absent for the value check (optionalText), so the
      // conflict check must use the same null-as-absent rule — otherwise
      // {message: null, prompt: "x"} dies as message_with_prompt instead of
      // running with the prompt.
      if (raw.message != null && raw.prompt != null) {
        fail("message_with_prompt", `items[${index}] is a resume; set message or prompt, not both`);
      }
      // Label the key the input actually carried: `prompt` is the documented
      // resume alias for `message`, so a bad value under `prompt` must not be
      // reported as `items[N].message` — an operator who "fixes" the cited key
      // adds `message` and hits message_with_prompt instead.
      const message = optionalText(
        raw.message ?? raw.prompt,
        `items[${index}].${raw.message !== undefined ? "message" : "prompt"}`,
        MAX_PROMPT_BYTES,
      );
      file({ kind: "resume", index, name, resume, message });
      return;
    }
    // spawn lane
    // `message` is resume-lane vocabulary: on a spawn lane it is silently
    // ignored today, which masks an operator error (the lane runs with the
    // template/prompt text, not the intended message). Fail loudly, the same
    // way resume lanes reject role/item.
    if (raw.message !== undefined) {
      fail("spawn_message_forbidden", `items[${index}] is a spawn lane; message applies to resume lanes only`);
    }
    if (raw.role === undefined || raw.role === null) {
      fail("role_required", `items[${index}] is a spawn lane and requires an explicit taxonomy role`);
    }
    if (typeof raw.role !== "string" || !SWARM_ROLES.has(raw.role)) {
      fail("unknown_role", `items[${index}].role ${JSON.stringify(raw.role)} is not a swarm role`);
    }
    const meta = validateLaneMeta(raw, `items[${index}]`);
    // Item-level binding wins outright over the wave defaults — a lane that
    // declares its own axes is judged on exactly those, not a merged set.
    const axes = meta.axes ?? specMeta.axes;
    const milestone = meta.milestone ?? specMeta.milestone;
    if (template !== null) {
      if (raw.prompt !== undefined) {
        fail("prompt_with_template", `items[${index}] may not set prompt when spec.template is used`);
      }
      const item = optionalText(raw.item, `items[${index}].item`, MAX_ITEM_BYTES);
      if (item === null) {
        fail("item_required", `items[${index}].item is required when spec.template is used`);
      }
      // Function replacement: item text is literal. A string replacement would
      // re-interpret $&, $', $`, $$, $n patterns inside the item and silently
      // corrupt the expanded prompt (shell vars and code snippets hit this).
      const expanded = template.replaceAll(ITEM_PLACEHOLDER, () => item);
      if (byteLength(expanded) > MAX_PROMPT_BYTES) {
        fail("invalid_spec", `items[${index}] expansion exceeds ${MAX_PROMPT_BYTES} bytes`);
      }
      file({ kind: "spawn", index, name, role: raw.role, item, text: expanded, axes, milestone });
      return;
    }
    // `item` doubles as the lane's partition label: it may accompany `prompt`
    // (item = atom id persisted to the registry, prompt = body) so a named
    // prompt lane still records what it owns. Without a template, prompt is
    // the text; item alone remains the short-prompt form.
    const prompt = optionalText(raw.prompt, `items[${index}].prompt`, MAX_PROMPT_BYTES);
    const item = optionalText(raw.item, `items[${index}].item`, MAX_ITEM_BYTES);
    const text = prompt ?? item;
    if (text === null) {
      fail("prompt_required", `items[${index}] needs prompt or item when no spec.template is set`);
    }
    file({ kind: "spawn", index, name, role: raw.role, item, text, axes, milestone });
  });

  const total = lanes.length;

  if (total === 0) fail("empty_wave", "a swarm wave needs at least one lane");
  // The floor is a policy minimum — never clamped to the spec cap, or
  // impossible_band (cap below floor) could never fire. The ceiling clamps
  // to cap: a spec.maxLanes tighter than the policy band narrows the wave.
  const laneFloor = policyFloor;
  const laneCeiling = Math.min(policyCeiling, cap);
  // Feasibility before size: when the effective cap sits below the wave
  // floor no spawn wave can satisfy the band, and that is the actionable
  // report — a too_many_lanes answer would name the wrong fix (the cap is
  // the problem, not the lane count). Resume-only waves are exempt: they
  // carry no spawn band obligation.
  if (spawns.length > 0 && laneCeiling < laneFloor) {
    fail(
      "impossible_band",
      `spec.maxLanes ${cap} is below the wave floor ${laneFloor}; no spawn wave can satisfy the band — raise spec.maxLanes or dispatch resumes only`,
    );
  }
  if (total > cap) {
    fail("too_many_lanes", `wave has ${total} lanes; the cap is ${cap} (hard ceiling ${MAX_SWARM_LANES})`);
  }
  if (spawns.length > 0 && total < laneFloor) {
    fail(
      "too_few_lanes",
      `a wave with spawn lanes needs at least ${laneFloor} lanes (got ${total}); split the round's scope into waves of ${laneFloor}-${laneCeiling} same-shape lanes`,
    );
  }
  if (spawns.length > 0 && total > laneCeiling) {
    fail(
      "wave_too_wide",
      `a wave carries at most ${laneCeiling} lanes (got ${total}); split it into sequential waves of ${laneFloor}-${laneCeiling}`,
    );
  }

  // kimi Map-dedupe parity: pairwise-distinct expanded prompts are required.
  rejectDuplicate(
    spawns.map((lane) => [lane.text, lane]),
    (prior, lane) => fail(
      "duplicate_expansion",
      `items[${prior.index}] and items[${lane.index}] expand to identical prompts; expansions must be pairwise distinct`,
    ),
  );
  rejectDuplicate(
    resumes.map((lane) => [lane.resume, lane]),
    (prior, lane) => fail(
      "duplicate_resume_id",
      `items[${prior.index}] and items[${lane.index}] resume the same agent ${lane.resume}`,
    ),
  );

  // Resume-ownership check (kimi requireOwnedSubagent/requireIdleSubagent
  // parity): a resume lane's agentId must be a member of this wave's own
  // registry (a previous run of the same wave path) or of a declared
  // predecessor wave's registry (spec.priorRegistry). Fail-closed: no
  // registry names the id → resume_unknown_member, before any lane spawns.
  // The wave's own registry wins on id collision — it is the freshest
  // record of who owns the handle.
  const registryMembers = new Map();
  // Cross-prior claims ride the shared consistency check (r17): identical
  // claims are lineage redundancy and stay first-wins; a contradiction
  // fails closed before any lane spawns. The check runs whenever a prior
  // is DECLARED, not only when a resume lane consumes one (r18, Audit01):
  // every wave persists its priorRegistries on the registry doc, so a
  // spawn-only wave must fail admission on an unreadable or contradictory
  // prior instead of surfacing it for the first time at record.
  const loadedPriors = [];
  for (const rel of priorRegistries) {
    loadedPriors.push(loadRegistry(gatedRegistryPath(rel, "spec.priorRegistry"), { required: true, ref: rel }));
  }
  assertConsistentPriorClaims(loadedPriors);
  if (resumes.length > 0) {
    const own = loadRegistry(gatedRegistryPath(registryPath, "wave registry"), { required: false, ref: registryPath });
    for (const [name, entry] of own?.members ?? []) {
      if (typeof entry.agentId === "string") registryMembers.set(entry.agentId, { name, entry });
    }
    for (const prior of loadedPriors) {
      for (const [name, entry] of prior.members) {
        if (typeof entry.agentId !== "string") continue;
        if (!registryMembers.has(entry.agentId)) {
          registryMembers.set(entry.agentId, { name, entry });
        }
      }
    }
    for (const lane of resumes) {
      const owner = registryMembers.get(lane.resume);
      if (owner === undefined) {
        fail(
          "resume_unknown_member",
          `items[${lane.index}].resume ${lane.resume} is not a member of this wave's registry or any declared priorRegistry`,
        );
      }
      // The resumed row keeps the ORIGINAL member's name (and item, C10) so
      // a later result row can name what the member was working on. A
      // chained resume (resume of a resume row) must not decay provenance
      // one hop per wave — carry the owner's recorded member when present.
      lane.member = typeof owner.entry.member === "string" ? owner.entry.member : owner.name;
      lane.memberItem = typeof owner.entry.item === "string" ? owner.entry.item : null;
      // Carry the owner's judgment binding onto this resume row. A chained
      // resume reads the previous resume row, which itself copied the spawn
      // binding, so the contract does not decay one hop per wave.
      const judgment = inheritedJudgment(owner.entry, `registry member ${owner.name}`);
      lane.memberAxes = judgment.axes;
      lane.memberMilestone = judgment.milestone;
    }
  }

  const usedNames = new Set();
  const memberEntries = [];
  // Schema-v2 compaction state (nc5-swarm r13). Every spawn lane is first
  // composed the LEGACY way — that text is today's emission, so its bound
  // and envelope checks keep exactly their old precedence and diagnostics.
  // An eligible template wave ALSO builds a compact per-lane text (item +
  // binding + report + invocation, template prose hoisted to the shared
  // context); after the map the plan decides all-or-nothing whether the
  // compact tasks and hoisted context actually ship.
  const hoistEligibleTemplate =
    template !== null && hoist && spawns.length > 0
    // A leading invocation would duplicate across context+task (the hook
    // inspects task text only, so it cannot dedupe); a terminal envelope
    // marker would strand nonterminal in the context. Both are valid
    // LEGACY templates — they bypass compaction with the reason recorded.
    && !opensWithGodspeedInvocation(template)
    && !template.trimEnd().endsWith(GODSPEED_MARKER);
  let legacyTaskBytes = 0;
  let compactTaskBytes = 0;
  const compactTexts = new Map();
  const tasks = lanes.map((lane, laneIndex) => {
    // Resolve the dispatch name ONCE here: the registry member entry built
    // beside each task keys by the same value, and a divergent second
    // derivation would silently break resume ownership instead of failing
    // loudly.
    const name =
      lane.name ??
      (lane.kind === "resume"
        ? `SwarmResume${String(laneIndex + 1).padStart(2, "0")}`
        : `Swarm${camelRole(lane.role)}${String(laneIndex + 1).padStart(2, "0")}`);
    if (usedNames.has(name)) fail("duplicate_name", `lane name ${name} is not unique`);
    usedNames.add(name);
    if (lane.kind === "resume") {
      // One handle, one member (I6): the resume row is provenance, not a
      // second owner — agentId stays null so the original member row keeps
      // sole ownership of the handle. `member` names the resumed owner (the
      // original name on a chained resume), and the inherited axes/milestone
      // ride this row so collect attributes the verdict to the dispatch
      // name. Minting agentId here produced dual holders of one handle and
      // locked out idempotent re-record of the true owner.
      const member = { kind: "resume", agentId: null, member: lane.member, item: lane.memberItem };
      if (lane.memberAxes != null) member.axes = lane.memberAxes;
      if (lane.memberMilestone != null) member.milestone = lane.memberMilestone;
      memberEntries.push([name, member]);
      const entry = { name, resume: lane.resume, member: lane.member, item: lane.memberItem };
      let message = lane.message ?? "Continue your assigned work and report the outcome.";
      if (reportDir !== null) {
        // Marker-aware append, same as the spawn path: a message ending in
        // the envelope marker must keep it terminal — a plain template
        // append would strand the report instruction outside the envelope.
        message = appendReportSuffix(message, reportInstruction(reportDir, name));
      }
      // The reportDir suffix is appended AFTER the per-item bound check — a
      // prompt at the bound would silently exceed MAX_PROMPT_BYTES here.
      // Envelope parity with the spawn path: a resume message is still
      // operator-authored bytes delivered as an instruction, so the same
      // at-most-one-terminal-marker rule applies. The leading invocation is
      // NOT injected — a resumed lane keeps its identity and transcript.
      checkComposedText(message, `items[${lane.index}] message`, "after reportDir append");
      entry.message = message;
      return entry;
    }
    const member = { kind: "spawn", agentId: null, role: lane.role, item: lane.item };
    // Judgment binding persists with the member: a later resume wave
    // resolves the owner row and inherits these, and collect can
    // attribute the verdict to the declared axes/milestone.
    if (lane.axes !== null) member.axes = lane.axes;
    if (lane.milestone !== null) member.milestone = lane.milestone;
    memberEntries.push([name, member]);
    let text = lane.text;
    // The lane's contract rides inside the prompt, ahead of the report
    // instruction: leaf bounds (what it may not do) plus the judgment
    // binding (what it is scored on) before where to write.
    text = appendReportSuffix(text, laneBindingSuffix(lane));
    if (reportDir !== null) {
      text = appendReportSuffix(text, reportInstruction(reportDir, name));
    }
    // Operator directive 2026-09-20: a lane is a fresh session, so the
    // Godspeed posture has to be *invoked*, not merely declared. The trailing
    // `| godspeed` marker is an envelope marker; only a leading skill line
    // loads the skill, which is why a lane without it ran godspeed-blind.
    // Idempotent (hook parity): a text that already opens with the invocation
    // keeps its single copy — never stack a second directive.
    if (!opensWithGodspeedInvocation(text)) {
      text = `${GODSPEED_INVOCATION}\n\n${text}`;
    }
    // Envelope integrity (seam #47, F1): shared check — after full
    // composition a lane task carries no marker or exactly one, terminal.
    checkComposedText(text, `items[${lane.index}] prompt`, "after reportDir append and godspeed invocation");
    legacyTaskBytes += byteLength(text);
    if (hoistEligibleTemplate) {
      // Compact emission: the lane's task names its item and carries its
      // contract; the template prose it expands lives once in the shared
      // context, placeholder intact. The binding/report order and the
      // envelope mechanics mirror the legacy composition above exactly.
      let compact = `## Your item\n\n${lane.item}\n\n${laneBindingSuffix(lane)}`;
      if (reportDir !== null) {
        compact = appendReportSuffix(compact, reportInstruction(reportDir, name));
      }
      compact = `${GODSPEED_INVOCATION}\n\n${compact}`;
      checkComposedText(compact, `items[${lane.index}] prompt`, "after template hoist compaction");
      compactTaskBytes += byteLength(compact);
      compactTexts.set(laneIndex, compact);
    }
    return { name, agent: lane.role, task: text };
  });

  // All-or-nothing compaction decision (r13), after every legacy per-lane
  // check has already run at its old precedence: apply the compact tasks and
  // hoisted context only when the TOTAL payload (context once + every task)
  // shrinks by the floor and the composed context stays within its bound.
  // Every bypass keeps the legacy emission byte-identical and records why.
  let compaction = { applied: false, mechanism: null, reason: null, savedBytes: 0, payloadBytesBefore: 0, payloadBytesAfter: 0 };
  if (template !== null && spawns.length > 0) {
    let reason = hoist ? null : "disabled";
    if (reason === null && !hoistEligibleTemplate) {
      reason = opensWithGodspeedInvocation(template) ? "template_invocation" : "template_marker";
    }
    let hoistedContext = null;
    if (reason === null) {
      hoistedContext = hoistedTemplateContext(context, template);
      if (byteLength(hoistedContext) > MAX_CONTEXT_BYTES) reason = "context_bound";
    }
    if (reason === null) {
      const before = byteLength(context) + legacyTaskBytes;
      const after = byteLength(hoistedContext) + compactTaskBytes;
      if (before - after < MIN_HOIST_SAVINGS) reason = "no_savings";
      else {
        context = hoistedContext;
        compaction = {
          applied: true,
          mechanism: "template_hoist",
          reason: null,
          savedBytes: before - after,
          payloadBytesBefore: before,
          payloadBytesAfter: after,
        };
        for (const [laneIndex, compact] of compactTexts) {
          tasks[laneIndex].task = compact;
        }
      }
    }
    if (!compaction.applied) {
      compaction = { applied: false, mechanism: null, reason, savedBytes: 0, payloadBytesBefore: 0, payloadBytesAfter: 0 };
    }
  }

  return {
    schema: SWARM_WAVE_SCHEMA,
    wave,
    context,
    policy: {
      // Provenance of the declared ceiling/pacing: "config" means
      // config/ufo.json was read for this policy, "default" means the
      // built-in constants alone (including a caller-injected policy,
      // which the plan cannot attribute to a config file).
      source: policy.source === "config" ? "config" : "default",
      maxLanes: cap,
      minLanes: policy.minLanes,
      waveMinLanes: policy.waveMinLanes,
      waveMaxLanes: policy.waveMaxLanes,
      declaredMaxLanes,
      hardCeiling: MAX_SWARM_LANES,
      rampBatchSize: policy.rampBatchSize,
      rampIntervalMs: policy.rampIntervalMs,
      globalRunnerCeiling: policy.globalRunnerCeiling,
    },
    counts: { spawn: spawns.length, resume: resumes.length, total },
    // Schema-v2 context-compaction telemetry (nc5-swarm r13): whether the
    // shared template was hoisted into the batch context, why not when it
    // was not, and the measured total-payload delta. Operator-facing
    // evidence for the context-footprint axis; inert to collect/record.
    // savedBytes is the NET wave payload delta (before − after, shared
    // context counted once) — NOT a per-seat shrink sum. A per-lane
    // hoistedBytes quantity measures a different thing; reconciling one
    // against the other misreads both.
    compaction,
    dispatch: {
      calls: spawns.length > 0 ? 1 : 0,
      kind: "task",
      // Operator-facing guidance only: this prose is intentionally unpinned —
      // no suite asserts its wording. The invariant it describes (exactly one
      // batched task call per wave) is pinned structurally instead, via
      // `dispatch.calls` plus the `taskCall`/`resumeSends` split; the suite
      // pins `dispatch.kind` as a value and this field as a shape only.
      note:
        "Issue exactly one batched task call carrying every spawn lane, plus one hub send per resume lane. " +
        "Never split a wave into multiple task calls (one-swarm-per-wave).",
    },
    // Member registry (G2/C10): where `run` persists this wave's
    // {name → agentId/item/role} map so a later wave's resume lanes can name
    // members across turns. `members` is what THIS wave registers — spawn
    // lanes with agentId null until `record` fills them post-spawn, resume
    // lanes keyed by the resumed member's name.
    registry: {
      schema: SWARM_REGISTRY_SCHEMA,
      path: registryPath,
      // Declared reportDir only: collect uses it to surface reportPresent per
      // member. Absent means the wave asked for no reports — collect emits
      // nothing rather than flagging every member missing.
      ...(reportDir !== null ? { reportDir } : {}),
      members: Object.fromEntries(memberEntries),

    },
    // The validated predecessor registry paths ride the plan so
    // persistWaveRegistry can re-validate resume ownership against FRESH
    // prior reads under the registry lock (nc4-swarm r02, ToctouDesign
    // finding 2 — the lock-free plan-time admission reads can be stale by
    // the time the registry is published).
    priorRegistries,
    tasks,
  };
}

/**
 * Render a validated plan as the dispatch payload (schema
 * ufo-swarm-wave-dispatch-v1) an operator executes directly: one batched
 * `task` call ({context, tasks} — spawn lanes only) plus one `hub send` per
 * resume lane. The one-swarm-per-wave invariant is structural here: resume
 * entries are separated from spawn lanes, and a resume-only wave emits
 * `taskCall: null` (zero task calls, all hub sends) instead of an empty
 * `tasks` array that could be misread as a no-lane call.
 */
export function planToDispatchPayload(plan) {
  const spawns = [];
  const resumes = [];
  for (const entry of plan.tasks) {
    // Two independent arms, not else-if: an entry carrying both fields
    // (never minted by planSwarmWave, but this is an exported boundary)
    // landed in BOTH lists under the two-filter version — preserved.
    if (entry.agent !== undefined) spawns.push(entry);
    if (entry.resume !== undefined) resumes.push(entry);
  }
  return {
    schema: SWARM_DISPATCH_SCHEMA,
    wave: plan.wave,
    policy: plan.policy,
    counts: plan.counts,
    // The registry path travels with the payload so the operator can persist
    registry: plan.registry,
    // Set by `run` when persisting cleared a recorded handle — absent on
    // `plan` (no registry write) and when nothing was displaced.
    ...(plan.handlesReset !== undefined ? { handlesReset: plan.handlesReset } : {}),
    // Compaction telemetry mirrors through so `run` consumers see the same
    // applied/reason/savedBytes evidence `plan` emits (r13).
    ...(plan.compaction !== undefined ? { compaction: plan.compaction } : {}),
    // SUB-8 route preflight evidence, present only when requested.
    ...(plan.routePreflight !== undefined ? { routePreflight: plan.routePreflight } : {}),
    taskCall:
      spawns.length > 0 ? { context: plan.context, tasks: spawns } : null,
    resumeSends: resumes,
    // Same shape-only treatment as planSwarmWave's `dispatch.note`: operator
    // guidance prose, intentionally unpinned (never asserted as text).
    note:
      spawns.length > 0
        ? "Issue exactly one batched task call with taskCall ({context, tasks}); never split a wave into multiple task calls (one-swarm-per-wave). Then one hub send per resumeSends entry: hub send --to <entry.resume> --message <entry.message> (entry.name is bookkeeping, not a hub field)."
        : "No spawn lanes: this wave resumes only — one hub send per resumeSends entry: hub send --to <entry.resume> --message <entry.message>; no task call is issued.",
  };
}

// Shared argv reader (ufo-mission-result.mjs, nc3-swarm r47): duplicate and
// missing-value flags are usage errors through this CLI's typed fail().

function emitUsageError(message) {
  emitErrorJson({ schema: SWARM_WAVE_ERROR_SCHEMA, code: "usage", message });
  return 64;
}

const USAGE =
  "Usage: ufo-swarm-wave.mjs plan --spec <wave.json|->|--spec-json <json> [--emit-tasks] [--route-families|--route-probe <exe>] | ufo-swarm-wave.mjs run --spec <wave.json|->|--spec-json <json> [--route-families|--route-probe <exe>] | ufo-swarm-wave.mjs record --registry <path> --assignments <json>";

/**
 * SUB-8: resolve (and with a probe, ping) the routes of the plan's spawn
 * lanes. Exported for the suite; `routingOptions` pins the config snapshot.
 */
export function waveRoutePreflight(plan, { probe = null, routingOptions = {} } = {}) {
  const laneCounts = new Map();
  for (const entry of plan.tasks) {
    if (entry.agent !== undefined) laneCounts.set(entry.agent, (laneCounts.get(entry.agent) ?? 0) + 1);
  }
  try {
    return routePreflight({ laneCounts, probe, routingOptions });
  } catch (error) {
    if (error instanceof RoutePreflightError) throw new SwarmWaveError(error.code, error.message, error.details);
    throw error;
  }
}

/**
 * Resolve the single declared spec source: --spec <path> | --spec - (stdin) |
 * --spec-json <literal>. Exactly one source per invocation.
 */
function readSpecSource(specRef, specJson) {
  if (specJson !== null) {
    if (byteLength(specJson) > MAX_SPEC_BYTES) {
      fail("invalid_spec", `--spec-json exceeds ${MAX_SPEC_BYTES} bytes`);
    }
    return Buffer.from(specJson, "utf8");
  }
  if (specRef === "-") {
    return boundedStdin(MAX_SPEC_BYTES, "invalid_spec", "spec");
  }
  try {
    return boundedFile(resolve(specRef), MAX_SPEC_BYTES, "invalid_spec", "spec");
  } catch (error) {
    // Typed, path-free operator-input refusal (nc5-swarm r02): errno faults
    // on the declared spec path stay invalid_spec, but the raw Node fs
    // message interpolates the absolute path — redact it. Typed
    // SwarmWaveError refusals from boundedFile (size/not-regular/changed)
    // carry no errno and rethrow untouched; anything else keeps reportError's
    // internal mapping.
    if (["ENOENT", "ENOTDIR", "ELOOP", "EACCES", "EPERM"].includes(error?.code)) {
      fail("invalid_spec", `spec: ${redactFsErrorMessage(error)}`);
    }
    throw error;
  }
}

// Shared failure mapping for every command: typed SwarmWaveError → its code,
// EXEC_PATH_OUTSIDE_ROOT rides through verbatim (boundary refusal is policy,
// not a spec error — fleet-dispatcher gatedExecPath parity), operator-input
// faults (JSON syntax, ENOENT/ENOTDIR/ELOOP/EACCES/EPERM on declared paths)
// → invalid_spec, anything else → internal. Always exit 1.
function reportError(error) {
  if (error instanceof SwarmWaveError) {
    emitErrorJson({
      schema: SWARM_WAVE_ERROR_SCHEMA, code: error.code, message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
    return 1;
  }
  if (error?.code === "EXEC_PATH_OUTSIDE_ROOT") {
    emitErrorJson({ schema: SWARM_WAVE_ERROR_SCHEMA, code: error.code, message: String(error.message) });
    return 1;
  }
  const code =
    error instanceof SyntaxError
    || error?.code === "ENOENT"
    || error?.code === "ENOTDIR"
    || error?.code === "ELOOP"
    || error?.code === "EACCES"
    || error?.code === "EPERM"
      ? "invalid_spec"
      : "internal";
  emitErrorJson({ schema: SWARM_WAVE_ERROR_SCHEMA, code, message: String(error?.message ?? error) });
  return 1;
}

// Persist the wave's member registry (G2): merge this wave's lanes over any
// existing registry at the same path — a re-run keeps members from earlier
// runs, while this wave's spawn lanes reset agentId to null (a fresh spawn
// has no handle yet) and resume lanes carry the handle they claim.
// Exported (nc5-swarm r17): deterministic TOCTOU pin seam — the CLI run path
// re-plans immediately before persisting, so only a same-invocation
// plan→mutate→persist probe can exercise the lock-time revalidation.
export function persistWaveRegistry(plan) {
  const abs = gatedRegistryPath(plan.registry.path, "wave registry");
  return withRegistryLock(abs, () => {
  const existing = loadRegistry(abs, { required: false, ref: plan.registry.path });
  // Cross-wave collision refusal (nc5-swarm r07): a DIFFERENT wave identity
  // sharing this registry path (same reportDir, index-derived default member
  // names) used to merge over the prior wave and silently drop its live
  // agent handles — the displacement surfaced only post-persistence via
  // handlesReset, after the ownership bytes were already gone. Refuse
  // BEFORE the write when the effective wave identity changes and an
  // overlapping member name would displace an assigned handle. Same-wave
  // re-runs (and unspecified-wave re-runs that inherit the registry's
  // identity) keep their documented reset semantics below.
  const existingWave = existing?.wave ?? null;
  const effectiveWave = plan.wave ?? existingWave;
  // Only KNOWN differing identities refuse: a registry without a recorded
  // wave predates wave provenance (hand-written or legacy), and its
  // same-scope resets stay governed by the resume re-validation below —
  // the TOCTOU pin (resume_ownership_revalidated_under_registry_lock)
  // covers exactly that shape and must keep its precedence.
  if (existing !== null && typeof existing.wave === "string" && effectiveWave !== existingWave) {
    // A planned resume lane that claims the displaced handle transfers it
    // on purpose (the aliased-reset case revalidateResumeOwnership already
    // adjudicates under the lock) — excluding claimed handles keeps the
    // r02 TOCTOU precedence: that pin must still die resume_unknown_member.
    const claimedHandles = new Set(
      (plan.tasks ?? [])
        .filter((task) => typeof task?.resume === "string")
        .map((task) => task.resume),
    );
    const displaced = Object.entries(plan.registry.members)
      .filter(([name, member]) => {
        const prior = existing.members.get(name);
        return prior !== undefined
          && typeof prior.agentId === "string"
          && prior.agentId !== member.agentId
          && !claimedHandles.has(prior.agentId);
      })
      .map(([name]) => name);
    if (displaced.length > 0) {
      fail("wave_registry_collision",
        `wave ${JSON.stringify(effectiveWave)} refuses to overwrite registry ${plan.registry.path} owned by wave ${JSON.stringify(existingWave)}: member name(s) ${displaced.map((name) => JSON.stringify(name)).join(", ")} already carry assigned handles. Use a distinct reportDir, rename the members, or resume the existing handles.`);
    }
  }
  // A re-run of THIS wave resets its spawn rows to agentId null — but a
  // DIFFERENT wave sharing this reportDir collides on the index-derived
  // default names and silently drops live handles the same way. A resume
  // row is the same overwrite with a non-null agentId: re-pointing a member
  // name to a DIFFERENT handle kills the old handle's only ownership row
  // just as silently (the displaced id becomes unresumable). The reset is
  // deliberate for a re-run; the silent part was the defect, now refused
  // above for cross-wave identity changes before any byte is published.
  // Surface every remaining same-wave displaced handle on the payload so
  // the operator sees ownership die.
  const handlesReset = [];
  if (existing !== null) {
    for (const [name, member] of Object.entries(plan.registry.members)) {
      const prior = existing.members.get(name);
      if (prior !== undefined && typeof prior.agentId === "string" && prior.agentId !== member.agentId) {
        handlesReset.push({ name, previousAgentId: prior.agentId, agentId: member.agentId });
      }
    }
  }
  const mergedMembers = {
    ...(existing === null ? {} : Object.fromEntries(existing.members)),
    ...plan.registry.members,
  };
  // Locked resume-ownership re-validation (nc4-swarm r02, ToctouDesign
  // finding 2): plan-time admission resolved resume ids against a
  // LOCK-FREE registry read, and this merge can then reset the very owner
  // row the resolution relied on (same-name spawn lane overwriting a
  // recorded handle, or a racing `record` flipping a row between read and
  // publish). Re-validate every resume lane against the MERGED map plus
  // FRESH prior-registry reads (own-wins precedence, same as admission) —
  // inside this existing critical section, between merge and write, so no
  // second lock acquisition can deadlock withRegistryLock. A lost id dies
  // typed BEFORE writeRegistry publishes the broken map or the payload
  // emits a resume send for a handle this wave no longer owns. The one
  // deliberate exception: a resume lane that explicitly took the owner's
  // NAME transfers the handle on purpose — the payload's resume send names
  // the id directly and the row's `member` provenance carries the chain
  // (the aliased-reset case, pinned by resume_alias_reset_surfaced_on_run).
  revalidateResumeOwnership(plan, mergedMembers, existing);
  const registryDoc = buildRegistryDoc({
    wave: plan.wave ?? existing?.wave,
    createdAt: existing?.createdAt,
    // Preserve a declared reportDir across re-runs: collect reads it back to
    // attribute missing lane reports. A re-run of a wave that declared none
    // must not inherit a stale one from a prior wave sharing the path.
    reportDir: plan.registry.reportDir,
    // Carry the wave's declared predecessors forward so later `record`
    // calls can re-validate cross-file ownership under the same lock.
    priorRegistries: Array.isArray(plan.priorRegistries) && plan.priorRegistries.length > 0
      ? plan.priorRegistries
      : existing?.priorRegistries,
    members: mergedMembers,
  });
  writeRegistry(abs, registryDoc);
  return handlesReset;
  });
}

// Pure re-check over the merged member map (ToctouDesign design): every
// planned resume lane's target id must still resolve after the merge —
// either in the merged map's attested agentIds or in a FRESH read of a
// declared prior registry (lock-free reads are fine here: the atomic
// registry rename gives each load one consistent snapshot, and the lock we
// already hold fences the merge itself). Freshness matters: admission's
// reads happened before the lock, and `record` can have rewritten rows in
// between. A chained resume lane carries its target on the task entry; the
// member provenance rides `member`/`memberItem` (r01), not the id.
function revalidateResumeOwnership(plan, mergedMembers, existing) {
  // Cross-prior claim replay under the lock (nc5-swarm r17, Audit04
  // suspect; extended r18, Audit01): admission ran the consistency check
  // against LOCK-FREE reads; a prior registry swapped between plan and
  // publish would otherwise pass lock-time attestation with a
  // contradictory-claim id — revalidation unioned ids without ever
  // re-comparing claims. Same shape as admission, same fail-closed code,
  // over the same fresh reads the attestation uses. The replay runs
  // whenever priors are DECLARED — a spawn-only persist writes
  // priorRegistries onto the registry doc and must not publish against a
  // contradictory or unreadable prior set either.
  const priors = Array.isArray(plan.priorRegistries) ? plan.priorRegistries : [];
  const loadedPriors = [];
  for (const rel of priors) {
    loadedPriors.push(loadRegistry(gatedRegistryPath(rel, "spec.priorRegistry"), { required: true, ref: rel }));
  }
  assertConsistentPriorClaims(loadedPriors);
  const resumeLanes = (plan.tasks ?? []).filter((task) => typeof task?.resume === "string");
  if (resumeLanes.length === 0) return;
  const attested = new Set();
  for (const member of Object.values(mergedMembers)) {
    if (typeof member?.agentId === "string") attested.add(member.agentId);
  }
  for (const prior of loadedPriors) {
    for (const member of prior.members.values()) {
      if (typeof member?.agentId === "string") attested.add(member.agentId);
    }
  }
  for (const lane of resumeLanes) {
    if (attested.has(lane.resume)) continue;
    // Deliberate transfer: this lane's own registry row (same name) is the
    // row that displaced the recorded handle — the operator explicitly
    // re-aliased the owner name onto the resume lane. The resume send
    // targets the id directly; ownership continues rather than being lost.
    const displacedBySelf = existing !== null
      && existing.members.get(lane.name)?.agentId === lane.resume
      && plan.registry.members[lane.name] !== undefined;
    if (displacedBySelf) continue;
    fail(
      "resume_unknown_member",
      `resume lane ${lane.name} (${lane.resume}) lost ownership during the registry merge (the owner row was reset or re-bound between plan admission and publish); re-run the wave against the published registry`,
    );
  }
}


// record --registry <path> --assignments '{"<memberName>": "<agentId>"}' —
// the post-spawn half of G2: once the batched task call returns agent ids,
// the operator records them so later waves' resume lanes resolve ownership.
// Fail-closed: unknown member names and malformed ids are typed errors, and
// the registry file must already exist (a `run` creates it). Re-pointing a
// member to a DIFFERENT non-null handle is conflicting_assignment (I6) —
// re-run the wave to reset spawn rows before recording a fresh handle.
function mainRecord(args) {
  // Declared-argv walk (ufo-mission-result.mjs, nc3-swarm r55): unknown
  // argument / missing value / swallowed flag / duplicate all collect as
  // usage faults. The private consumed-set walk this replaces let
  // `record --bogus` report "requires --registry" instead of naming the
  // unsupported argument.
  const parsed = parseDeclaredArgv(args, [], ["--registry", "--assignments"]);
  // optionValue parity (shared rejectFlagLikeValues, r67): a value that
  // itself leads with `--` is a missing value, not a value — the helper
  // only refuses DECLARED names there, so the wave CLI's stricter arm is
  // applied to the two values it binds.
  rejectFlagLikeValues(parsed, ["--registry", "--assignments"]);
  if (parsed.faults.length > 0) {
    return emitUsageError(parsed.faults[0]);
  }
  const registryRef = parsed.values.get("--registry") ?? null;
  const assignmentsJson = parsed.values.get("--assignments") ?? null;
  if (registryRef === null || assignmentsJson === null) {
    return emitUsageError("record requires --registry <path> and --assignments <json>");
  }
  try {
    const rel = validateRelativePath(registryRef, "--registry", "invalid_registry_path");
    const abs = gatedRegistryPath(rel, "--registry");
    const registryDoc = withRegistryLock(abs, () => {
    const doc = loadRegistry(abs, { required: true, ref: rel });
    if (byteLength(assignmentsJson) > MAX_SPEC_BYTES) {
      fail("invalid_assignments", `--assignments exceeds ${MAX_SPEC_BYTES} bytes`);
    }
    let assignments;
    try {
      assignments = JSON.parse(assignmentsJson);
    } catch (error) {
      fail("invalid_assignments", `--assignments is not valid JSON: ${error.message}`);
    }
    if (!isPlainObject(assignments)) {
      fail("invalid_assignments", "--assignments must be a JSON object of {memberName: agentId}");
    }
    // Cross-member aliasing: two members pointing at the same live handle
    // would make a later resume ambiguous — the registry is the ownership
    // authority, so a duplicated agentId dies typed here, not at resume time.
    rejectDuplicate(
      Object.entries(assignments).map(([name, agentId]) => [agentId, name]),
      (prior, name, agentId) => fail(
        "conflicting_assignment",
        `--assignments maps both ${prior} and ${name} to ${agentId}; one handle owns one member`,
      ),
    );
    // The payload dedupe above only covers ids inside THIS call: an
    // assignment naming an agentId another member already holds at rest
    // lands the same aliasing the payload check refuses — two members, one
    // handle, and resume resolution silently keeps whichever the Map
    // iteration reaches first. The registry is the ownership authority, so
    // the at-rest set is checked before any member is mutated — through an
    // agentId → holders index (nc3-swarm r69): one O(M) build replaces the
    // per-assignment O(M) rescan, and each holder list preserves the
    // original member-order scan's first-conflict naming exactly.
    const atRest = new Map();
    for (const [otherName, other] of doc.members) {
      if (typeof other.agentId !== "string") continue;
      const holders = atRest.get(other.agentId);
      if (holders === undefined) atRest.set(other.agentId, [otherName]);
      else holders.push(otherName);
    }
    // Cross-file attestation (nc4-swarm r02, ToctouDesign finding 1
    // record-flip arm): ids a DECLARED PREDECESSOR registry attests are
    // owned there, and granting one to this wave's member would mint two
    // ownership rows for one handle across files — a later wave declaring
    // either registry resolves the resume to the wrong owner. The wave
    // persists its declared priorRegistries at run time precisely so this
    // check can run under the same lock. Same-name re-declaration is the
    // same ownership claim (idempotent provenance), not a conflict.
    const priorDocs = [];
    if (Array.isArray(doc.priorRegistries)) {
      for (const rel of doc.priorRegistries) {
        priorDocs.push({ rel, prior: loadRegistry(gatedRegistryPath(rel, "spec.priorRegistry"), { required: true, ref: rel }) });
      }
    }
    // Cross-prior claim replay at record time (nc5-swarm r17, planner H6):
    // the declared priors can drift into contradiction AFTER run; record
    // re-reads them under its own lock and must not mutate membership
    // against a prior set admission would have refused. Registry-level
    // (untargeted ids included), before any assignment mutates a row.
    assertConsistentPriorClaims(priorDocs.map(({ prior }) => prior));
    const priorHolders = new Map();
    for (const { rel, prior } of priorDocs) {
      for (const [priorName, priorMember] of prior.members) {
        if (typeof priorMember.agentId !== "string") continue;
        // Normalized claim (member ?? key, item ?? null): the same claim
        // under a different row key is lineage, not a conflict (H5).
        const holder = {
          label: `${priorName} (in ${rel})`,
          name: priorName,
          member: typeof priorMember.member === "string" ? priorMember.member : priorName,
          item: typeof priorMember.item === "string" ? priorMember.item : null,
        };
        const holders = priorHolders.get(priorMember.agentId);
        if (holders === undefined) priorHolders.set(priorMember.agentId, [holder]);
        else holders.push(holder);
      }
    }
    for (const [name, agentId] of Object.entries(assignments)) {
      const otherName = (atRest.get(agentId) ?? []).find((holder) => holder !== name);
      if (otherName !== undefined) {
        fail(
          "conflicting_assignment",
          `--assignments.${name} grants ${agentId}, which member ${otherName} already holds; one handle owns one member`,
        );
      }
      // Not attested at rest in THIS registry and not a same-name or
      // same-claim re-declaration of a prior owner's claim → the grant
      // would split ownership across files.
      if (!atRest.has(agentId)) {
        const local = doc.members.get(name);
        const localClaim = local === undefined ? null : {
          member: typeof local.member === "string" ? local.member : name,
          item: typeof local.item === "string" ? local.item : null,
        };
        // Same-claim exemption (nc5-swarm r17, planner H5): a resumed
        // member re-listed under a DIFFERENT row key (a wake row carrying
        // the original member/item provenance) is the same ownership
        // claim, not a split. Identical normalized (member, item) passes;
        // any other prior attestation of the id stays a cross-file
        // conflict — one handle owns one member across registries.
        const conflict = (priorHolders.get(agentId) ?? []).find((holder) =>
          holder.name !== name
          && (localClaim === null
            || holder.member !== localClaim.member
            || holder.item !== localClaim.item));
        if (conflict !== undefined) {
          fail(
            "conflicting_assignment",
            `--assignments.${name} grants ${agentId}, which ${conflict.label} already attests under a different member/item claim; one handle owns one member across registries too`,
          );
        }
      }
    }
    for (const [name, agentId] of Object.entries(assignments)) {
      const entry = doc.members.get(name);
      if (entry === undefined) {
        fail("unknown_member", `--assignments names ${name}, which is not a member of ${rel}`);
      }
      if (typeof agentId !== "string" || !RESUME_ID_PATTERN.test(agentId)) {
        fail("invalid_agent_id", `--assignments.${name} must be an agent id (${RESUME_ID_PATTERN})`);
      }
      // The registry is the resume-ownership authority: re-pointing a member
      // to a DIFFERENT live handle would silently rewrite ownership (I6).
      // Same-id re-record is idempotent; a conflict dies typed — re-run the
      // wave (spawn rows reset to null) before recording a fresh handle.
      if (typeof entry.agentId === "string" && entry.agentId !== agentId) {
        fail(
          "conflicting_assignment",
          `--assignments.${name} re-points ${name} from ${entry.agentId} to ${agentId}; re-run the wave to reset the handle before recording a new one`,
        );
      }
      entry.agentId = agentId;
    }
    const nextDoc = buildRegistryDoc({
      wave: doc.wave,
      createdAt: doc.createdAt,
      reportDir: doc.reportDir,
      priorRegistries: doc.priorRegistries ?? undefined,
      members: Object.fromEntries(doc.members),
    });
    writeRegistry(abs, nextDoc);
    return nextDoc;
    });
    emitJson({ path: rel, ...registryDoc });
    return 0;
  } catch (error) {
    return reportError(error);
  }
}

function main(argv) {
  const [command, ...args] = argv;
  if (command === "record") {
    return mainRecord(args);
  }
  if (command !== "plan" && command !== "run") {
    return emitUsageError(USAGE);
  }
  // Declared-argv walk (ufo-mission-result.mjs, nc3-swarm r55): unknown
  // argument / missing value / swallowed flag / duplicate value options
  // collect as usage faults. The private consumed-set walk this replaces
  // ran the spec-source checks first, so `plan --bogus` was refused as
  // "requires --spec" instead of naming the unsupported argument.
  const parsed = parseDeclaredArgv(args, ["--emit-tasks", "--route-families"], ["--spec", "--spec-json", "--route-probe"]);
  // optionValue parity (shared rejectFlagLikeValues, r67): a value that
  // itself leads with `--` is a missing value, not a value — the helper
  // only refuses DECLARED names there.
  rejectFlagLikeValues(parsed, ["--spec", "--spec-json", "--route-probe"]);
  if (parsed.faults.length > 0) {
    return emitUsageError(parsed.faults[0]);
  }
  const specRef = parsed.values.get("--spec") ?? null;
  const specJson = parsed.values.get("--spec-json") ?? null;
  if (specRef !== null && specJson !== null) {
    return emitUsageError("declare exactly one spec source: --spec <wave.json|-> or --spec-json <json>");
  }
  if (specRef === null && specJson === null) {
    return emitUsageError(`${command} requires --spec <wave.json|-> or --spec-json <json>`);
  }
  const emitTasks = parsed.flags.has("--emit-tasks");
  if (command === "run" && emitTasks) {
    return emitUsageError("run always emits the full dispatch payload; --emit-tasks is plan-only");
  }
  // --emit-tasks is a declared flag the helper dedupes silently; the wave
  // CLI refuses a duplicate, at the same precedence the private walk kept
  // (after the spec-source and run checks).
  if (hasDuplicateArg(args, "--emit-tasks")) {
    return emitUsageError("duplicate --emit-tasks");
  }
  if (hasDuplicateArg(args, "--route-families")) {
    return emitUsageError("duplicate --route-families");
  }
  const routeProbe = parsed.values.get("--route-probe") ?? null;
  const routeFamilies = parsed.flags.has("--route-families");
  try {
    const spec = JSON.parse(readSpecSource(specRef, specJson).toString("utf8"));
    const plan = planSwarmWave(spec);
    if (routeProbe !== null || routeFamilies) {
      // Before persistWaveRegistry: a refused wave leaves no registry and
      // emits no payload, so nothing can spawn on a dead cascade.
      // The probe is an executable: resolved against the project root and
      // refused outside it unless external tools are allowed (the same gate
      // every other path this CLI executes or writes passes through).
      plan.routePreflight = waveRoutePreflight(plan, {
        probe: routeProbe === null ? null : commandProbe(gatedRegistryPath(routeProbe, "--route-probe")),
      });
    }
    if (command === "run") {
      // G2: persist the member registry before the payload is emitted so the
      // {name → agentId} map exists the moment lanes spawn; `record` fills
      // agentIds once the task call returns them. handlesReset names every
      // member whose recorded handle this run cleared — a same-reportDir
      // collision or a re-run; never silent.
      const handlesReset = persistWaveRegistry(plan);
      if (handlesReset.length > 0) plan.handlesReset = handlesReset;
    }
    const output =
      command === "run"
        ? planToDispatchPayload(plan)
        : emitTasks
          // Hoisted plans are only dispatchable with their shared context:
          // bare compact tasks would leave lanes without the template. Emit
          // the {context, tasks} pair so the surface stays paste-able; a
          // non-hoisted plan keeps the historical bare-tasks array.
          ? (plan.compaction?.applied === true
            ? { context: plan.context, tasks: plan.tasks }
            : plan.tasks)
          : plan;
    emitJson(output);
    return 0;
  } catch (error) {
    return reportError(error);
  }
}

// Direct entry only — shared isMainModule (ufo-mission-result.mjs, r51):
// eval/print entrypoints are never direct invocations; realpath comparison
// on both sides keeps an intentional symlink launch.
const isMain = isMainModule(import.meta.url);
if (isMain) {
  // exitCode, not exit(): a synchronous process.exit can truncate a large
  // buffered stdout payload (the plan JSON) — the event loop must drain it.
  process.exitCode = main(process.argv.slice(2));
}
