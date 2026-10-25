/**
 * ufo-swarm-registry — one authority for the `ufo-swarm-registry-v1` artifact.
 *
 * The wave planner owns and writes the registry; the collector joins it back
 * onto settled results. Before this module the two sides carried independent
 * copies of the schema string, member-name pattern, byte bound, and the
 * relative/beneath path rules, and had already drifted (the collector's own
 * comment records the 1–4 MiB registry window that refused every resume wave).
 *
 * What is shared here:
 *   - the schema constant, member-name pattern, agent-id pattern, byte bound;
 *   - the relative-path shape verdict and root-containment probe;
 *   - `loadRegistryDocument`/`normalizeRegistryDocument`, which parse and
 *     normalize the document envelope and member container into ordered
 *     `{name, entry}` rows.
 *
 * What is deliberately NOT shared: per-member field tolerance. The wave side
 * is the ownership authority and validates entries strictly (agentId shape,
 * string fields, axes, unique ownership); the collector keeps its array and
 * alias tolerance at the join boundary. Each caller passes its own `fail`
 * adapter and message table, so typed codes and pinned diagnostics stay with
 * the surface that emits them.
 */
import { resolve } from "node:path";
import { beneath, isPlainObject } from "./ufo-mission-result.mjs";

export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";

/** Producer and consumer read the same artifact bytes, so one bound. */
export const MAX_REGISTRY_BYTES = 1024 * 1024;

/** Member names minted by the wave planner — the join key in every surface. */
export const MEMBER_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{1,31}$/u;

/** Registry agentId shape (resume ids use the same grammar). */
export const RESUME_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/u;

/**
 * Shape verdict for an artifact-relative path: null when clean, else the
 * first violated rule (`absolute` | `backslashes` | `segments`). Callers own
 * the typed message for each reason — the wave and collector spell them
 * differently and both are pinned.
 * @param {string} value
 * @returns {null | "absolute" | "backslashes" | "segments"}
 */
export function relativePathProblem(value) {
  if (value.startsWith("/") || /^[A-Za-z]:[\\/]/u.test(value)) return "absolute";
  if (value.includes("\\")) return "backslashes";
  if (value.split("/").some((segment) => segment === ".." || segment === "." || segment === "")) {
    return "segments";
  }
  return null;
}

/**
 * Resolve a relative path under `root` and report containment. `beneath`
 * walks every component (symlinks included) and rethrows non-ENOENT lstat
 * faults; an unstatable path is not provably inside the root, so it reports
 * `inside: false` instead of throwing.
 * @param {string} root
 * @param {string} relPath
 * @returns {{resolved: string, inside: boolean}}
 */
export function resolveBeneathRoot(root, relPath) {
  const resolved = resolve(root, relPath);
  let inside;
  try {
    inside = beneath(root, resolved);
  } catch {
    inside = false;
  }
  return { resolved, inside };
}

/**
 * Normalize an already-parsed registry document into ordered member rows.
 *
 * Document shape is shared; member fields are not. Map-form entries keep the
 * map key as the member name (an entry's own `name` field must never shadow
 * it); array-form entries must name themselves. Duplicate names fail closed
 * in both forms.
 *
 * @param {unknown} parsed
 * @param {{
 *   fail: (code: string, message: string) => never,
 *   messages: {
 *     notDocument: () => string,
 *     membersContainer: () => string,
 *     entryObject: (label: string) => string,
 *     missingName: (label: string) => string,
 *     memberName: (name: unknown, label: string) => string,
 *     duplicateName: (name: string) => string,
 *   },
 *   members?: "map" | "map-or-array",
 *   memberNameCode?: string,
 * }} opts
 * @returns {{
 *   rows: {name: string, entry: Record<string, unknown>}[],
 *   wave: string | null,
 *   createdAt: string | null,
 *   updatedAt: string | null,
 *   reportDir: string | null,
 *   priorRegistries: unknown,
 * }}
 */
export function normalizeRegistryDocument(parsed, {
  fail,
  messages,
  members = "map",
  memberNameCode = "invalid_registry",
}) {
  if (!isPlainObject(parsed) || parsed.schema !== SWARM_REGISTRY_SCHEMA) {
    fail("invalid_registry", messages.notDocument());
  }
  const raw = parsed.members;
  /** @type {{name: unknown, entry: unknown, label: string}[]} */
  const entries = [];
  if (Array.isArray(raw)) {
    if (members === "map") fail("invalid_registry", messages.notDocument());
    raw.forEach((entry, index) => {
      const label = `registry.members[${index}]`;
      if (!isPlainObject(entry)) fail("invalid_registry", messages.entryObject(label));
      if (entry.name === undefined) fail("invalid_registry", messages.missingName(label));
      entries.push({ name: entry.name, entry, label });
    });
  } else if (isPlainObject(raw)) {
    for (const [name, entry] of Object.entries(raw)) {
      const label = `registry.members.${name}`;
      if (!isPlainObject(entry)) fail("invalid_registry", messages.entryObject(label));
      entries.push({ name, entry, label });
    }
  } else {
    fail("invalid_registry", members === "map" ? messages.notDocument() : messages.membersContainer());
  }
  const rows = [];
  const seen = new Set();
  for (const { name, entry, label } of entries) {
    if (typeof name !== "string" || !MEMBER_NAME_PATTERN.test(name)) {
      fail(memberNameCode, messages.memberName(name, label));
    }
    if (seen.has(name)) fail("invalid_registry", messages.duplicateName(name));
    seen.add(name);
    rows.push({ name, entry });
  }
  return {
    rows,
    wave: parsed.wave ?? null,
    createdAt: parsed.createdAt ?? null,
    updatedAt: parsed.updatedAt ?? null,
    reportDir: typeof parsed.reportDir === "string" ? parsed.reportDir : null,
    priorRegistries: parsed.priorRegistries,
  };
}

/**
 * Parse registry bytes and normalize them. Used by the wave side, whose read
 * path hands the module the bounded raw bytes; the collector parses through
 * its own bounded input reader and calls `normalizeRegistryDocument` with the
 * same message table.
 * @param {Buffer | string} bytes
 * @param {Parameters<typeof normalizeRegistryDocument>[1] & {
 *   messages: { invalidJson: (error: Error) => string },
 * }} opts
 */
export function loadRegistryDocument(bytes, opts) {
  let parsed;
  try {
    parsed = JSON.parse(typeof bytes === "string" ? bytes : bytes.toString("utf8"));
  } catch (error) {
    opts.fail("invalid_registry", opts.messages.invalidJson(error));
  }
  return normalizeRegistryDocument(parsed, opts);
}
