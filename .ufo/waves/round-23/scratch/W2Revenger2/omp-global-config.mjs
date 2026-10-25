// Global OMP agent config reader for UFO seat routing.
//
// Pure functions over config text (or a resolved path). No YAML library: the
// repo has none, so this module is the canonical hand-rolled dialect parser —
// run-omp-native-trial.mjs imports yamlBlock from here (single-sourced).
//
// Precedence (operator directive): seat override -> modelRoles alias (when
// "@alias") -> concrete route; fallbackChains entry keyed by alias if present,
// else by the concrete route selector, else []. Chains are never wrapped or
// recursed.

import { createHash } from "node:crypto";
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
} from "node:fs";
import path from "node:path";

import { containsSensitiveShape } from "./ufo-credential-screen.mjs";

const MAX_CONFIG_FILE_BYTES = 1_048_576;

export const DEFAULT_CANDIDATES = Object.freeze([
  ".omp/agent/config.yml",
  ".omp/agent/config.yaml",
  ".config/omp/config.yml",
  ".config/omp/config.yaml",
  ".omp/config.yml",
  ".omp/config.yaml",
]);

export class OmpGlobalConfigError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "OmpGlobalConfigError";
    this.code = code;
  }
}

/**
 * @param {string} code
 * @param {string} message
 * @returns {never}
 */
function fail(code, message) {
  throw new OmpGlobalConfigError(code, message);
}

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * fd-bound read: O_NOFOLLOW refuses a symlink at open, fstat pins size, and a
 * post-read size check fails closed if the file changed mid-read.
 * @param {string} file
 * @param {string} label
 * @returns {{ text: string, sha256: string }}
 */
function readBoundedFile(file, label) {
  let fd;
  try {
    // O_NONBLOCK: a FIFO planted at the path would otherwise block this
    // synchronous open forever (no writer) before the isFile refusal can
    // run — house convention pairs the two flags (fleet-ledger-read.mjs);
    // O_NONBLOCK is a no-op on regular files.
    fd = openSync(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);
  } catch (error) {
    // Type by errno: EACCES/ELOOP are not "missing" — the launcher reports
    // code-derived names, and "no config found" for an unreadable or
    // symlinked authority is a misdiagnosis.
    const code = error?.code === "ENOENT" ? "missing"
      : error?.code === "ELOOP" ? "malformed"
      : "unreadable";
    fail(code, `${label} could not be opened: ${error?.message ?? error}`);
  }
  try {
    const info = fstatSync(fd);
    if (!info.isFile()) fail("malformed", `${label} must be a regular file`);
    if (info.size > MAX_CONFIG_FILE_BYTES) {
      fail("oversized", `${label} exceeds ${MAX_CONFIG_FILE_BYTES} byte bound`);
    }
    const bytes = Buffer.allocUnsafe(info.size + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(fd, bytes, offset, bytes.length - offset, null);
      if (count === 0) break;
      offset += count;
    }
    if (offset !== info.size || fstatSync(fd).size !== info.size) {
      fail("malformed", `${label} changed size while being read`);
    }
    const content = bytes.subarray(0, offset);
    return {
      // A UTF-8 BOM would make the first top-level key unmatchable — strip
      // it once so a BOM'd config parses instead of reporting "missing".
      text: content.toString("utf8").replace(/^\uFEFF/, ""),
      sha256: createHash("sha256").update(content).digest("hex"),
    };
  } finally {
    closeSync(fd);
  }
}

// Return the indented block beneath a unique top-level `key:` line. A
// duplicated top-level key fails closed: YAML last-wins would let a second
// section silently override the one this check inspected. The key match is
// quote- and space-tolerant because the consumer's parser treats
// `"key":`, `'key':`, and `key :` as the same key — a spelled-differently
// duplicate must still collide here instead of evading the count.
export function yamlBlock(text, key, label, failFn = fail) {
  const bare = escapeRegExp(key);
  const keyPattern = new RegExp(`^(?:${bare}|"${bare}"|'${bare}')\\s*:\\s*$`, "gmu");
  const keyMatches = [...text.matchAll(keyPattern)];
  if (keyMatches.length === 0) {
    failFn("missing", `${label} requires a top-level ${key}: section`);
  }
  if (keyMatches.length > 1) {
    failFn("ambiguous", `${label} repeats the top-level ${key}: section`);
  }
  const rest = text.slice(keyMatches[0].index + keyMatches[0][0].length);
  const lines = rest.split("\n").slice(1);
  const block = [];
  for (const line of lines) {
    // A comment line is not content: skipping it BEFORE the break test
    // keeps `# note` lines — including column-0 comments — from truncating
    // the block and silently dropping every declared alias/chain/seat below.
    if (/^\s*#/.test(line)) continue;
    if (/^\S/.test(line)) break;
    // YAML forbids tab indentation; a tab-indented line under a space-keyed
    // section would be silently dropped by the space-anchored consumers
    // below (and could hide a duplicate binding under YAML last-wins), so
    // fail closed instead of collecting it.
    if (/^[ \t]*\t/.test(line)) failFn("malformed", `${label} ${key}: section uses tab indentation`);
    block.push(line);
  }
  return block.join("\n");
}

// Return the deeper-indented block beneath a `key:` line inside an already
// extracted YAML block, or "" when the key is absent. A duplicated key fails
// closed for the same last-wins reason as yamlBlock, with the same
// quote/space-tolerant key recognition.
function yamlSubBlock(block, key, label) {
  const bare = escapeRegExp(key);
  const keyPattern = new RegExp(`^ +(?:${bare}|"${bare}"|'${bare}')\\s*:\\s*$`, "gmu");
  const matches = [...block.matchAll(keyPattern)];
  if (matches.length === 0) return "";
  if (matches.length > 1) {
    fail("malformed", `${label} repeats the ${key}: key`);
  }
  const keyIndent = matches[0][0].match(/^ +/)[0].length;
  const lines = block.slice(matches[0].index + matches[0][0].length).split("\n").slice(1);
  const out = [];
  for (const line of lines) {
    // Same comment rule as yamlBlock: a `#` line — including a column-0
    // comment — must not truncate the sub-block, so skip it BEFORE the
    // break test (the break would otherwise end the block on the comment).
    if (/^\s*#/.test(line)) continue;
    if (/^\S/.test(line)) break;
    // Same tab rule as yamlBlock: a tab-indented child measures indent 0
    // under the space-only count and silently truncates the sub-block —
    // fail closed instead.
    if (/^[ \t]*\t/.test(line)) fail("malformed", `${label} ${key}: sub-block uses tab indentation`);
    const indent = line.match(/^ +/)?.[0].length ?? 0;
    if (line.trim() !== "" && indent <= keyIndent) break;
    out.push(line);
  }
  return out.join("\n");
}

/**
 * Strip one layer of matching single or double quotes from a YAML scalar.
 * @param {string} raw
 */
function unquoteScalar(raw) {
  if (raw.length >= 2) {
    const a = raw[0];
    const b = raw[raw.length - 1];
    if (a === '"' && b === '"') {
      // Double-quoted scalars carry YAML escapes; leaving \" verbatim
      // corrupts the value downstream.
      return raw.slice(1, -1).replace(/\\(["\\/bfnrt])/gu, (m, c) =>
        ({ '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" })[c] ?? m);
    }
    if (a === "'" && b === "'") {
      return raw.slice(1, -1).replace(/''/g, "'");
    }
  }
  return raw;
}

// Error messages echo raw config lines; a malformed line carrying a secret
// would land in stderr/ledger text. Screen before interpolating.
function safeLine(line) {
  const trimmed = line.trim();
  return containsSensitiveShape(trimmed) ? "<redacted line>" : trimmed;
}

// Key names are interpolated into error messages too; a secret-shaped key
// (token=…, bearer …) would leak where safeLine already redacts the line.
function safeKey(key) {
  return containsSensitiveShape(key) ? "<redacted key>" : key;
}

/**
 * Parse `key: value` map lines under a block. Blank and `#` comment lines are
 * skipped. Duplicate keys and non-map lines fail closed with the offending line.
 * @param {string} block
 * @param {string} label
 * @returns {Map<string, string>}
 */
function parseSimpleMap(block, label) {
  /** @type {Map<string, string>} */
  const out = new Map();
  for (const line of block.split("\n")) {
    if (line.trim() === "" || /^\s*#/.test(line)) continue;
    if (/^[ \t]*\t/.test(line)) {
      fail("malformed", `${label} uses tab indentation: ${safeLine(line)}`);
    }
    // key may be bare or quoted; value is the remainder after the first `:`.
    const match = line.match(
      /^ +(?:([A-Za-z0-9_.\-/:+]+)|"([^"]+)"|'([^']+)')\s*:\s*(.*?)\s*$/u,
    );
    if (!match) {
      fail("malformed", `${label} has a malformed line: ${safeLine(line)}`);
    }
    const key = match[1] ?? match[2] ?? match[3];
    let rawValue = match[4];
    if (rawValue === "") {
      fail("malformed", `${label} has an empty value on line: ${safeLine(line)}`);
    }
    // Nested maps under a simple string map are not part of this dialect —
    // nor are YAML indicator-led values ([a], {x: y}, *ref, &anchor, !tag).
    if (rawValue === "|" || rawValue === ">" || rawValue === "[]" || rawValue === "{}"
        || /^[[{&*!]/.test(rawValue)) {
      fail("malformed", `${label} has a non-scalar value on line: ${safeLine(line)}`);
    }
    // An unquoted value keeps no inline comment: ` #…` is YAML comment
    // syntax, and keeping it verbatim corrupts routes downstream. A value
    // that IS a comment (`key: # note`) is an empty value — the empty-value
    // check below fails it. Quoted values keep their bytes.
    if (!/^["']/.test(rawValue)) {
      const commentAt = rawValue.startsWith("#") ? 0 : rawValue.indexOf(" #");
      if (commentAt !== -1) rawValue = rawValue.slice(0, commentAt).trimEnd();
    } else {
      // A quoted scalar may still carry a trailing ` # comment`: find the
      // closing quote (skipping \" escapes / '' doublings), then require the
      // remainder to be empty or a comment — otherwise the comment text
      // glues into the route and resolves clean.
      const quote = rawValue[0];
      let close = -1;
      for (let i = 1; i < rawValue.length; i++) {
        if (quote === '"' && rawValue[i] === "\\") { i++; continue; }
        if (rawValue[i] === quote) {
          if (quote === "'" && rawValue[i + 1] === "'") { i++; continue; }
          close = i;
          break;
        }
      }
      if (close !== -1) {
        const tail = rawValue.slice(close + 1).trim();
        if (tail === "" || tail.startsWith("#")) {
          rawValue = rawValue.slice(0, close + 1);
        } else {
          // Bytes after the closing quote that are not a comment are not
          // part of any scalar in this dialect — keeping them glues garbage
          // into the route (and can smuggle a @-alias past its detector
          // by wrapping the value in quotes).
          fail("malformed", `${label} has trailing bytes after a quoted value: ${safeLine(line)}`);
        }
      } else {
        fail("malformed", `${label} has an unterminated quoted value: ${safeLine(line)}`);
      }
    }
    const value = unquoteScalar(rawValue);
    if (value.length === 0) {
      fail("malformed", `${label} has an empty value on line: ${safeLine(line)}`);
    }
    if (out.has(key)) {
      fail("ambiguous", `${label} repeats key ${safeKey(key)} on line: ${safeLine(line)}`);
    }
    out.set(key, value);
  }
  return out;
}

/**
 * Resolve the first existing global OMP config candidate under `home`.
 * @param {{ home?: string, candidates?: readonly string[] }} [opts]
 * @returns {{ path: string, text: string, sha256: string } | null}
 */
export function globalOmpConfigPath({
  home = process.env.HOME,
  candidates = DEFAULT_CANDIDATES,
} = {}) {
  if (typeof home !== "string" || home.length === 0) {
    fail("missing", "HOME is unset; cannot resolve global OMP config path");
  }
  if (!Array.isArray(candidates) || candidates.length === 0) {
    fail("malformed", "global OMP config candidates must be a nonempty array");
  }
  for (const rel of candidates) {
    if (typeof rel !== "string" || rel.length === 0) {
      fail("malformed", `global OMP config candidate is empty: ${JSON.stringify(rel)}`);
    }
    const full = path.resolve(home, rel);
    // lstat first: a symlinked authority path (live OR dangling) is refused
    // outright — existsSync would silently skip a dangling symlink and let a
    // lower-precedence legacy candidate become the routing authority.
    const stat = lstatSync(full, { throwIfNoEntry: false });
    if (stat === undefined) continue;
    if (stat.isSymbolicLink()) {
      fail("malformed", `global OMP config candidate is a symlink: ${full}`);
    }
    try {
      const snapshot = readBoundedFile(full, full);
      return { path: full, ...snapshot };
    } catch (error) {
      // A file removed between lstat and open is absent, not unreadable —
      // continue to the next candidate like a never-present path.
      if (error?.code === "missing") continue;
      throw error;
    }
  }
  return null;
}


/**
 * @param {string} text
 * @returns {Map<string, string>}
 */
export function parseModelRoles(text) {
  if (typeof text !== "string") fail("malformed", "parseModelRoles requires config text");
  const block = yamlBlock(text, "modelRoles", "global OMP config");
  return parseSimpleMap(block, "modelRoles");
}

export function parseAgentModelOverrides(text) {
  if (typeof text !== "string") fail("malformed", "parseAgentModelOverrides requires config text");
  const taskBlock = yamlBlock(text, "task", "global OMP config");
  const overridesBlock = yamlSubBlock(taskBlock, "agentModelOverrides", "global OMP config task");
  if (overridesBlock === "") {
    fail("missing", "global OMP config task.agentModelOverrides is missing");
  }
  return parseSimpleMap(overridesBlock, "task.agentModelOverrides");
}

/**
 * Parse `retry.fallbackChains` into key -> route[] maps.
 * Supports `key: []`, `key:` + `- route` items, and quoted keys (`"m_luna":`).
 * @param {string} text
 * @returns {Map<string, string[]>}
 */
export function parseFallbackChains(text) {
  if (typeof text !== "string") fail("malformed", "parseFallbackChains requires config text");
  const retryBlock = yamlBlock(text, "retry", "global OMP config");
  const chainsBlock = yamlSubBlock(retryBlock, "fallbackChains", "global OMP config retry");
  if (chainsBlock === "") {
    fail("missing", "global OMP config retry.fallbackChains is missing");
  }

  /** @type {Map<string, string[]>} */
  const chains = new Map();
  /** @type {string | null} */
  let current = null;
  /** @type {number | null} */
  let currentKeyIndent = null;
  // `key: []` followed by `- item` lines is contradictory YAML (declared
  // empty + items); track the inline-empty declaration so items under it
  // fail closed instead of silently merging.
  let currentDeclaredEmpty = false;
  for (const line of chainsBlock.split("\n")) {
    if (line.trim() === "" || /^\s*#/.test(line)) continue;
    if (/^[ \t]*\t/.test(line)) {
      fail("malformed", `retry.fallbackChains uses tab indentation: ${line.trim()}`);
    }

    // key: []  or  key:  or  "key": []  (same-line empty array allowed);
    // a trailing ` # comment` is stripped under the same rule as list
    // items and map values (space-# starts a comment; #-without-space stays
    // content) — `key: [] # reason` used to be the one commented form the
    // dialect rejected.
    const keyMatch = line.match(
      /^( +)(?:([A-Za-z0-9_.\-/:+]+)|"([^"]+)"|'([^']+)')\s*:\s*(\[\s*\])?(\s+#.*)?\s*$/u,
    );
    if (keyMatch) {
      const indent = keyMatch[1].length;
      const key = keyMatch[2] ?? keyMatch[3] ?? keyMatch[4];
      if (current !== null && currentKeyIndent !== null && indent > currentKeyIndent) {
        fail("malformed", `retry.fallbackChains has a nested key under ${safeKey(current)}: ${safeLine(line)}`);
      }
      if (chains.has(key)) {
        fail("ambiguous", `retry.fallbackChains repeats key ${safeKey(key)}`);
      }
      current = key;
      currentKeyIndent = indent;
      currentDeclaredEmpty = keyMatch[5] !== undefined;
      chains.set(current, []);
      continue;
    }

    // list item under the current key (bare or quoted scalar); a trailing
    // ` # comment` is stripped under the same rule as parseSimpleMap values
    // (space-# starts a comment; a #-without-space stays content), so the
    // dialect treats map values and list items identically.
    const stepMatch = line.match(/^( +)- +("[^"]*"|'[^']*'|\S+?)(\s+#.*)?$/u);
    if (stepMatch && current !== null && currentKeyIndent !== null) {
      const indent = stepMatch[1].length;
      if (indent <= currentKeyIndent) {
        fail("malformed", `retry.fallbackChains list item not nested under ${safeKey(current)}: ${safeLine(line)}`);
      }
      if (currentDeclaredEmpty) {
        fail("malformed", `retry.fallbackChains key ${safeKey(current)} declares [] yet carries items: ${safeLine(line)}`);
      }
      const step = unquoteScalar(stepMatch[2]);
      if (step.length === 0 || step === "[]") {
        fail("malformed", `retry.fallbackChains has an empty step under ${safeKey(current)}: ${safeLine(line)}`);
      }
      chains.get(current).push(step);
      continue;
    }

    // standalone `[]` on its own line under a key (empty chain body); it
    // declares emptiness exactly like the inline `key: []` form, so a
    // later `- item` under it must fail closed the same way (both shapes
    // are contradictory YAML: declared empty + items).
    const emptyMatch = line.match(/^( +)\[\s*\]\s*$/u);
    if (emptyMatch && current !== null && currentKeyIndent !== null) {
      const indent = emptyMatch[1].length;
      if (indent <= currentKeyIndent) {
        fail("malformed", `retry.fallbackChains empty list not nested under ${safeKey(current)}: ${safeLine(line)}`);
      }
      currentDeclaredEmpty = true;
      // already [] from key open; keep empty
      continue;
    }

    fail("malformed", `retry.fallbackChains has an unrecognized line: ${safeLine(line)}`);
  }

  return chains;
}

// Shared resolution over already-parsed maps: readGlobalSeatRouting resolves
// every seat from ONE parse — re-running the full-text parsers per seat was
// O(seats × text) dead work.
function resolveFromMaps(roles, chains, { alias, route }) {
  let chainKey = null;
  let fallbackChain = [];
  if (alias !== null && chains.has(alias)) {
    chainKey = alias;
    fallbackChain = [...chains.get(alias)];
  } else if (chains.has(route)) {
    chainKey = route;
    fallbackChain = [...chains.get(route)];
  }
  return { route, fallbackChain, via: { alias, chainKey } };
}

export function resolveAliasFromMaps(roles, chains, alias) {
  if (!roles.has(alias)) {
    // The alias arrives verbatim from a seat override (@value) — a
    // secret-shaped override must not echo where safeKey already redacts
    // key names elsewhere.
    fail("missing", `modelRoles has no alias ${safeKey(alias)}`);
  }
  const route = roles.get(alias);
  // modelRoles values are concrete routes: an @-value is alias-to-alias,
  // which this dialect never recurses — reject it at parse depth.
  if (route.startsWith("@")) {
    fail("malformed", `modelRoles.${safeKey(alias)} resolves to another alias ${safeKey(route)} — aliases must name concrete routes`);
  }
  return resolveFromMaps(roles, chains, { alias, route });
}

export function resolveAliasRouting(text, alias) {
  if (typeof text !== "string") fail("malformed", "resolveAliasRouting requires config text");
  if (typeof alias !== "string" || alias.length === 0 || alias.startsWith("@")) {
    fail("malformed", "resolveAliasRouting requires a bare nonempty alias");
  }
  return resolveAliasFromMaps(parseModelRoles(text), parseFallbackChains(text), alias);
}

/**
 * Resolve one seat's concrete route + fallback chain from config text.
 * @param {string} text
 * @param {string} seat
 * @returns {{ route: string, fallbackChain: string[], via: { alias: string | null, chainKey: string | null } }}
 */
export function resolveSeatRouting(text, seat) {
  if (typeof text !== "string") fail("malformed", "resolveSeatRouting requires config text");
  if (typeof seat !== "string" || seat.length === 0) {
    fail("malformed", "resolveSeatRouting requires a nonempty seat id");
  }
  return resolveSeatFromMaps(
    parseAgentModelOverrides(text),
    parseModelRoles(text),
    parseFallbackChains(text),
    seat,
  );
}

function resolveSeatFromMaps(overrides, roles, chains, seat) {
  if (!overrides.has(seat)) {
    fail("missing", `task.agentModelOverrides has no entry for seat ${safeKey(seat)}`);
  }
  const override = overrides.get(seat);
  if (override.startsWith("@")) {
    const alias = override.slice(1);
    if (alias.length === 0) {
      fail("malformed", `task.agentModelOverrides.${seat} has an empty @alias`);
    }
    return resolveAliasFromMaps(roles, chains, alias);
  }
  if (override.length === 0) {
    fail("malformed", `resolved route for seat ${seat} is empty`);
  }
  return resolveFromMaps(roles, chains, { alias: null, route: override });
}

/**
 * Read every seat in task.agentModelOverrides and resolve routing.
 * @param {{ path?: string, home?: string, candidates?: readonly string[] }} [opts]
 * @returns {{
 *   path: string,
 *   text: string,
 *   sha256: string,
 *   seats: Map<string, { route: string, fallbackChain: string[], via: { alias: string | null, chainKey: string | null } }>,
 *   modelRoles: Map<string, string>,
 *   fallbackChains: Map<string, string[]>,
 * }}
 */
export function readGlobalSeatRouting({ path: explicitPath, home, candidates, snapshot } = {}) {
  let resolvedPath;
  let text;
  let sha256;
  if (snapshot && typeof snapshot.path === "string" && typeof snapshot.text === "string") {
    // Passthrough: the caller already holds an fd-bound snapshot of this
    // file — re-opening would double the read AND reopen a TOCTOU window.
    resolvedPath = snapshot.path;
    text = snapshot.text;
    sha256 = snapshot.sha256;
  } else if (typeof explicitPath === "string" && explicitPath.length > 0) {
    resolvedPath = path.resolve(explicitPath);
    ({ text, sha256 } = readBoundedFile(resolvedPath, resolvedPath));
  } else {
    const found = globalOmpConfigPath({ home, candidates });
    if (found === null) {
      fail("missing", "no global OMP config found under the candidate paths");
    }
    resolvedPath = found.path;
    text = found.text;
    sha256 = found.sha256;
  }

  const modelRoles = parseModelRoles(text);
  const overrides = parseAgentModelOverrides(text);
  const fallbackChains = parseFallbackChains(text);

  /** @type {Map<string, { route: string, fallbackChain: string[], via: { alias: string | null, chainKey: string | null } }>} */
  const seats = new Map();
  for (const seat of overrides.keys()) {
    seats.set(seat, resolveSeatFromMaps(overrides, modelRoles, fallbackChains, seat));
  }

  // An orphan chain key silently strips a seat's cascade: a typo'd key
  // matches no alias and no resolved route, so nothing ever consumes it.
  const chainTargets = new Set([...modelRoles.keys(), ...modelRoles.values()]);
  for (const resolved of seats.values()) chainTargets.add(resolved.route);
  for (const key of fallbackChains.keys()) {
    if (!chainTargets.has(key)) {
      fail("malformed", `retry.fallbackChains key ${safeKey(key)} matches no modelRoles alias or resolved route — the chain is dead weight`);
    }
  }
  return {
    path: resolvedPath,
    text,
    sha256,
    seats,
    modelRoles,
    fallbackChains,
  };
}

/**
 * Resolve every global model-role alias whose primary route uses `provider`.
 * Project files are never consulted; duplicate aliases merge onto one route.
 * @param {string} provider
 * @param {{ path?: string, home?: string, candidates?: readonly string[] }} [opts]
 */
export function readGlobalProviderAliasRoutes(provider, opts = {}) {
  if (opts === null || typeof opts !== "object") {
    fail("malformed", "readGlobalProviderAliasRoutes opts must be an object");
  }
  if (typeof provider !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(provider)) {
    fail("invalid", "provider is invalid");
  }
  const snapshot = readGlobalSeatRouting(opts);
  const byRoute = new Map();
  for (const alias of snapshot.modelRoles.keys()) {
    const resolved = resolveAliasFromMaps(snapshot.modelRoles, snapshot.fallbackChains, alias);
    if (!resolved.route.startsWith(`${provider}/`)) continue;
    const existing = byRoute.get(resolved.route);
    if (existing) existing.aliases.push(alias);
    else byRoute.set(resolved.route, { route: resolved.route, aliases: [alias] });
  }
  return {
    path: snapshot.path,
    sha256: snapshot.sha256,
    routes: [...byRoute.values()]
      .map((entry) => ({ ...entry, aliases: entry.aliases.sort() }))
      .sort((left, right) => left.route.localeCompare(right.route)),
  };
}
