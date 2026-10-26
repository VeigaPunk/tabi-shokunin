// MutC1Beyond scratch runner — applies one minimal find/replace mutation per
// copy of a gate script (byte-exact, assert find occurs exactly once), runs the
// mutated copy's --selftest under TMPDIR=$S/tmp, records exit + failing cases.
// Nothing in the lane or the clone is modified; mutants live in $S/mutants.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const S = "/fast/scratch/hyaku/tabi-r30/MutC1Beyond";
const SCRIPTS = join(S, "clone", "scripts");
const OUT = join(S, "mutants");
const TMP = join(S, "tmp");
rmSync(OUT, { recursive: true, force: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const sha = (b) => createHash("sha256").update(b).digest("hex");

const GATES = {
  s106: { file: "scripts/check-s106-evidence.mjs" },
  pins: { file: "scripts/check-release-pins.mjs" },
};
for (const g of Object.values(GATES)) {
  g.path = join(SCRIPTS, g.file.split("/").pop());
  g.bytes = readFileSync(g.path);
  g.sha256 = sha(g.bytes);
}

// Each mutant: minimal behaviour-bearing disable, all OUTSIDE the frozen
// catalogue scripts/gate-mutants.json (sha cd1c27a2…).
const M = (id, gate, find, replace, target) => ({ id, gate, find, replace, target });
const MUTANTS = [
  // ---- s106: parseReceipt field checks -------------------------------------
  M("s106-parseReceipt-schema-drop", "s106",
    "  if (doc.schema !== RECEIPT_SCHEMA) throw new Refusal(`receipt schema mismatch: ${JSON.stringify(doc.schema)}`);",
    "", "parseReceipt: receipt schema refusal"),
  M("s106-parseReceipt-string-fields-drop", "s106",
    "  for (const key of [\"url\", \"decoded_sha256\", \"bytes_path\", \"measured_rev\"]) {\n    if (typeof doc[key] !== \"string\" || !doc[key]) throw new Refusal(`receipt missing ${key}`);\n  }",
    "", "parseReceipt: required string fields loop"),
  M("s106-parseReceipt-rev-hex-drop", "s106",
    "  if (!/^[0-9a-f]{40}$/.test(doc.measured_rev)) throw new Refusal(\"receipt measured_rev must be a full lowercase commit id\");",
    "", "parseReceipt: measured_rev 40-hex guard"),
  M("s106-parseReceipt-decoded-bytes-type-drop", "s106",
    "  if (typeof doc.decoded_bytes !== \"number\") throw new Refusal(\"receipt missing decoded_bytes\");",
    "", "parseReceipt: decoded_bytes number guard"),
  M("s106-parseReceipt-anchor-fields-drop", "s106",
    "  if (!doc.anchor || typeof doc.anchor !== \"object\") throw new Refusal(\"receipt missing anchor\");\n  if (typeof doc.anchor.line !== \"number\" || typeof doc.anchor.text !== \"string\" || !doc.anchor.text) {\n    throw new Refusal(\"receipt anchor needs line (number) and text (string)\");\n  }",
    "", "parseReceipt: anchor object/line/text guards"),
  // ---- s106: resolveRev guards ----------------------------------------------
  M("s106-resolveRev-syntax-drop", "s106",
    "  if (!rev || !/^[A-Za-z0-9][A-Za-z0-9._\\/-]*$/.test(rev)) throw new Refusal(`bad revision: ${JSON.stringify(rev)}`);",
    "", "resolveRev: revision syntax guard"),
  M("s106-resolveRev-unresolvable-drop", "s106",
    "  if (r.status !== 0) throw new Refusal(`revision does not resolve: ${rev}`);",
    "", "resolveRev: unresolvable-revision guard"),
  // ---- s106: anchor trim -----------------------------------------------------
  M("s106-anchor-located-notrim", "s106",
    "  const anchorLocated = recorded !== undefined && recorded.trim() === receipt.anchor.text.trim();",
    "  const anchorLocated = recorded !== undefined && recorded === receipt.anchor.text;",
    "anchorLocated: .trim() dropped both sides"),
  M("s106-anchor-unique-notrim", "s106",
    "  const occurrences = lines.filter((l) => l.trim() === receipt.anchor.text.trim()).length;",
    "  const occurrences = lines.filter((l) => l === receipt.anchor.text).length;",
    "anchor_unique occurrence scan: .trim() dropped both sides"),
  // ---- release-pins: parseRegistry guards ------------------------------------
  M("pins-rowre-indent-strict", "pins",
    "const ROW_RE = /^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/;",
    "const ROW_RE = /^\\|\\s*S\\d{3,}\\s*\\|/;",
    "parseRegistry: 0-3 space indent acceptance removed (rows must start at col 0)"),
  M("pins-rowre-indent-loose", "pins",
    "const ROW_RE = /^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/;",
    "const ROW_RE = /^ *\\|\\s*S\\d{3,}\\s*\\|/;",
    "parseRegistry: indent bound removed (any leading spaces accepted)"),
  M("pins-parseRegistry-13cell-drop", "pins",
    "    if (cells.length !== 13) continue;",
    "", "parseRegistry: 13-cell well-formedness guard"),
  // ---- release-pins: cmpVersion ----------------------------------------------
  M("pins-cmpVersion-always-zero", "pins",
    "  for (let i = 0; i < 4; i += 1) if (x[i] !== y[i]) return x[i] - y[i];",
    "  for (let i = 0; i < 4; i += 1) if (x[i] !== y[i]) return 0;",
    "cmpVersion: ordering crushed to equality (population filter never fires)"),
  M("pins-cmpVersion-first-two", "pins",
    "  for (let i = 0; i < 4; i += 1) if (x[i] !== y[i]) return x[i] - y[i];",
    "  for (let i = 0; i < 2; i += 1) if (x[i] !== y[i]) return x[i] - y[i];",
    "cmpVersion: components 3-4 ignored (A.B identical versions compare equal)"),
  // ---- release-pins: rowDigests abbreviated-digest form ----------------------
  M("pins-rowDigests-abbr-drop", "pins",
    "  const abbr = [...text.matchAll(/(?<![0-9a-f])([0-9a-f]{8})(?:…|\\.\\.\\.)([0-9a-f]{4})(?![0-9a-f])/g)].map((m) => ({ pre: m[1], suf: m[2] }));",
    "  const abbr = [];",
    "rowDigests: abbreviated (8…4) digest form never collected"),
  M("pins-digestMatches-suffix-drop", "pins",
    "  return d.full ? d.full === sha : sha.startsWith(d.pre) && sha.endsWith(d.suf);",
    "  return d.full ? d.full === sha : sha.startsWith(d.pre);",
    "digestMatches: abbreviated-digest suffix check dropped"),
  // ---- release-pins: blockIn / normLine --------------------------------------
  M("pins-blockIn-always-true", "pins",
    "function blockIn(oldLines, newLines) {\n  const n = oldLines.length;\n  if (n === 0) return true;",
    "function blockIn(oldLines, newLines) {\n  const n = oldLines.length;\n  if (n === 0) return true;\n  return true;",
    "blockIn: contiguous-block containment disabled (always found)"),
  M("pins-normLine-identity", "pins",
    "const normLine = (s) => s.trim().replace(/\\s+/g, \" \");",
    "const normLine = (s) => s;",
    "normLine: trim/whitespace-collapse disabled"),
  // ---- release-pins: f2 inAnchor basename ------------------------------------
  M("pins-f2-inanchor-basename-drop", "pins",
    "      const inAnchor = row.anchor.includes(basename(f.path));",
    "      const inAnchor = row.anchor.includes(f.path);",
    "f2-path-bound: anchor branch requires full path, basename() binding dropped"),
  // ---- release-pins: receipt schema/stable refusals ---------------------------
  M("pins-receipt-schema-refusal-drop", "pins",
    "    if (receipt.schema !== SCHEMA) throw new Refusal(`receipt schema is not ${SCHEMA}`);",
    "", "evaluate: receipt schema refusal"),
  M("pins-receipt-stable-refusal-drop", "pins",
    "    if (receipt.stable !== stable) throw new Refusal(`receipt stable ${receipt.stable} != --stable ${stable}`);",
    "", "evaluate: receipt stable-vs---stable refusal"),
  // ---- release-pins: r1 duplicate entry ---------------------------------------
  M("pins-r1-duplicate-entry-allowed", "pins",
    "    if (entries.length !== 1 || !Array.isArray(entries[0].files) || entries[0].files.length === 0) {",
    "    if (entries.length < 1 || !Array.isArray(entries[0].files) || entries[0].files.length === 0) {",
    "r1-entry: duplicate receipt entries no longer refused (first wins)"),
];

const env = { ...process.env, TMPDIR: TMP };

function runSelftest(scriptPath) {
  const r = spawnSync(process.execPath, [scriptPath, "--selftest", "--json"], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024, env, timeout: 240000,
  });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* non-JSON output */ }
  return {
    exit: r.status,
    signal: r.signal ?? null,
    ok: parsed ? parsed.ok : null,
    cases: parsed ? parsed.cases : null,
    passed: parsed ? parsed.passed : null,
    failing: parsed && Array.isArray(parsed.results) ? parsed.results.filter((x) => !x.ok).map((x) => x.id) : null,
    stderr_head: (r.stderr || "").split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 300),
  };
}

const startedAt = new Date().toISOString();
const baselines = {};
for (const [k, g] of Object.entries(GATES)) {
  const t0 = Date.now();
  const run = runSelftest(g.path);
  baselines[k] = { file: g.file, sha256: g.sha256, ...run, ms: Date.now() - t0 };
}

const results = [];
for (const m of MUTANTS) {
  const g = GATES[m.gate];
  const text = g.bytes.toString("utf8");
  const count = text.split(m.find).length - 1;
  if (count !== 1) {
    results.push({ id: m.id, gate: g.file, target: m.target, find_count: count, applied: false, error: "find string not present exactly once", selftest_exit: null });
    continue;
  }
  const mutated = text.replace(m.find, m.replace);
  const mutantSha = sha(Buffer.from(mutated, "utf8"));
  if (mutantSha === g.sha256) {
    results.push({ id: m.id, gate: g.file, target: m.target, find_count: count, applied: false, error: "replacement produced identical bytes", selftest_exit: null });
    continue;
  }
  const mp = join(OUT, `${m.id}.mjs`);
  writeFileSync(mp, mutated);
  const t0 = Date.now();
  const run = runSelftest(mp);
  results.push({
    id: m.id, gate: g.file, target: m.target,
    find_count: count, applied: true,
    mutant_path: mp, mutant_sha256: mutantSha,
    selftest_exit: run.exit, selftest_signal: run.signal,
    selftest_ok: run.ok, cases: run.cases, passed: run.passed,
    failing_cases: run.failing, stderr_head: run.stderr_head,
    ms: Date.now() - t0,
    verdict: run.exit === 0 && run.ok === true ? "SURVIVED"
      : run.exit === 3 && run.ok === false ? "KILLED"
      : "INVALID-RUN",
  });
}

const out = {
  runner: "MutC1Beyond scratch runner (beyond-catalogue probes; catalogue scripts/gate-mutants.json untouched)",
  rev: "072af95fe2822f0785a6ff88a578e2142dd258e5",
  startedAt, finishedAt: new Date().toISOString(),
  node: process.version,
  pristine_gate_sha256: Object.fromEntries(Object.entries(GATES).map(([k, g]) => [g.file, g.sha256])),
  baselines, results,
};
writeFileSync(join(S, "results.json"), JSON.stringify(out, null, 2));
for (const b of Object.entries(baselines)) {
  console.log(`BASELINE\t${b[0]}\texit=${b[1].exit}\tok=${b[1].ok}\tcases=${b[1].cases}\tpassed=${b[1].passed}`);
}
for (const r of results) {
  console.log(`${r.verdict ?? "SKIP"}\t${r.id}\texit=${r.selftest_exit}\tfailing=${(r.failing_cases ?? []).join(",") || "-"}${r.error ? `\terror=${r.error}` : ""}`);
}
