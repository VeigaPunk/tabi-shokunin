#!/usr/bin/env node
// check-release-pins.mjs — tabi lane gate: freshness (release-pinned source rows).
//
// Verdict: 0 clean (population >= 1 and unresolved = 0), 1 failed (any
//          unresolved row), 2 could-not-evaluate (usage, unreadable revision,
//          registry absent, malformed --stable, receipt unparseable, or an
//          empty population). Any other nonzero code is undeclared and reads
//          as could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temporary sandbox repositories
//          created under $TMPDIR; asserts exit code AND the unresolved count;
//          removes its own temp trees, never touches the lane).
// Frozen by: .ufo/waves/round-29/claims.json claim C3.
// Write scope: stdout/stderr only. Production reads committed git blobs only
//          (git show <rev>:<path>); it never fetches and never writes the lane.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Population: every corpus/SOURCES.md registry row (0-3 leading spaces) whose
// recheck cell is `on-release` and whose source cell carries a Chromium Gitiles
// tag `refs/tags/<A.B.C.D>/` older than --stable.
// A population row is resolved when the receipt (default
// corpus/evidence/round-29/release-pins/receipt.json) holds one entry for its id
// and every check below passes:
//   r1-entry        exactly one receipt entry for the id, with >= 1 file.
//   f1-old-tag      file.old_tag equals a tag the row's source cell carries.
//   f2-path-bound   the row's source cell contains refs/tags/<old_tag>/<path>,
//                   or the row's anchor cell names basename(path).
//   f3-bytes        old_bytes and new_bytes sit at
//                   corpus/evidence/round-29/release-pins/bytes/<tag>/<path>
//                   (old_tag / stable), are committed at the revision, and
//                   hash to old_sha256 / new_sha256.
//   f4-ranges       every range [a,b] satisfies 1 <= a <= b <= old line count
//                   and the token `a-b` (or `a` when a = b) appears in the
//                   row's anchor cell (en/em dashes read as `-`); a 200 file
//                   with no ranges is compared whole.
//   f5-digest       when the row's source/anchor cells carry a sha256 (64 hex,
//                   or 8 hex + ellipsis + 4 hex), some file's old_sha256
//                   matches one of them.
//   f6-refetch      an independent re-fetch record
//                   corpus/evidence/round-29/release-pins/refetch/<id>.json
//                   (schema {id, seat, fetched_at, files:[{path, tag, status,
//                   sha256}]}) whose seat differs from entry.fetched_by lists
//                   the same path at the stable tag with the receipt's
//                   new_status and new_sha256. Copying old bytes in as new
//                   bytes therefore fails wherever the file changed.
// Verdict per file is computed, never read from the receipt: a 404 file
// (old_status 404) holds iff new_status is 404 and the new bytes contain
// NOT_FOUND; a 200 file holds iff every range's old lines (trimmed, inner
// whitespace collapsed) occur as one contiguous block in the new lines, or,
// with no ranges, iff old_sha256 = new_sha256. A row holds iff all its files
// hold; a drifted row is resolved only when entry.superseded_by names a
// registry row whose teaches cell opens `supersedes <id> —` and whose source
// cell carries refs/tags/<stable>/.
//
// Usage:
//   node scripts/check-release-pins.mjs --rev <REV> --stable <A.B.C.D> [--receipt <path>] [--json]
//   node scripts/check-release-pins.mjs --selftest [--json]
//   node scripts/check-release-pins.mjs --repo <dir> --rev <REV> --stable <A.B.C.D> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-release-pins-v1";
const SELFTEST_SCHEMA = "tabi-release-pins-selftest-v1";
const SOURCES_PATH = "corpus/SOURCES.md";
const DEFAULT_RECEIPT = "corpus/evidence/round-29/release-pins/receipt.json";
const BYTES_ROOT = "corpus/evidence/round-29/release-pins/bytes";
const REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_RE = /^\d+\.\d+\.\d+\.\d+$/;
const ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
const TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g;

class Refusal extends Error {}

function git(repo, args) {
  return spawnSync("git", ["-C", repo, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
}

function resolveRev(repo, rev) {
  if (typeof rev !== "string" || !/^[A-Za-z0-9._\/^~-]+$/.test(rev)) throw new Refusal(`bad revision syntax: ${rev}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`unresolvable revision: ${rev}`);
  return r.stdout.toString("utf8").trim();
}

function blob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function refetchFor(repo, rev, id, cache) {
  if (!cache.has(id)) {
    const b = blob(repo, rev, `${REFETCH_ROOT}/${id}.json`);
    let v = null;
    if (b !== null) { try { v = JSON.parse(b.toString("utf8")); } catch { v = null; } }
    cache.set(id, v && v.id === id ? v : null);
  }
  return cache.get(id);
}

function cmpVersion(a, b) {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 4; i += 1) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function parseRegistry(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    if (!ROW_RE.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    // cells[0] is the empty prefix; a well-formed row has 13 split parts.
    if (cells.length !== 13) continue;
    rows.push({
      id: cells[1],
      source: cells[2],
      anchor: cells[6],
      teaches: cells[7],
      recheck: cells[10],
      tags: [...new Set([...cells[2].matchAll(TAG_RE)].map((m) => m[1]))],
    });
  }
  return rows;
}

const normDash = (s) => s.replace(/[\u2010-\u2015\u2212]/g, "-");

function rangeToken(a, b) {
  return a === b ? String(a) : `${a}-${b}`;
}

function anchorHasRange(anchor, a, b) {
  const tok = rangeToken(a, b);
  const re = new RegExp(`(?<![0-9])${tok.replace("-", "\\s*-\\s*")}(?![0-9])`);
  return re.test(normDash(anchor));
}

function rowDigests(row) {
  const text = `${row.source} ${row.anchor}`;
  const full = [...text.matchAll(/(?<![0-9a-f])([0-9a-f]{64})(?![0-9a-f])/g)].map((m) => ({ full: m[1] }));
  const abbr = [...text.matchAll(/(?<![0-9a-f])([0-9a-f]{8})(?:…|\.\.\.)([0-9a-f]{4})(?![0-9a-f])/g)].map((m) => ({ pre: m[1], suf: m[2] }));
  return [...full, ...abbr];
}

function digestMatches(d, sha) {
  return d.full ? d.full === sha : sha.startsWith(d.pre) && sha.endsWith(d.suf);
}

const normLine = (s) => s.trim().replace(/\s+/g, " ");

function blockIn(oldLines, newLines) {
  const n = oldLines.length;
  if (n === 0) return true;
  for (let i = 0; i + n <= newLines.length; i += 1) {
    let ok = true;
    for (let j = 0; j < n; j += 1) if (newLines[i + j] !== oldLines[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

function evaluate(repo, revArg, stable, receiptPath) {
  if (!VERSION_RE.test(stable || "")) throw new Refusal(`malformed --stable: ${stable}`);
  const rev = resolveRev(repo, revArg);
  const reg = blob(repo, rev, SOURCES_PATH);
  if (reg === null) throw new Refusal(`${SOURCES_PATH} absent at ${rev}`);
  const rows = parseRegistry(reg.toString("utf8"));
  const byId = new Map(rows.map((r) => [r.id, r]));
  const refetchCache = new Map();
  const population = rows.filter((r) => r.recheck === "on-release" && r.tags.some((t) => cmpVersion(t, stable) < 0));
  if (population.length === 0) throw new Refusal("empty population (no on-release row pinned below --stable)");

  let receipt = null;
  const rb = blob(repo, rev, receiptPath);
  if (rb !== null) {
    try { receipt = JSON.parse(rb.toString("utf8")); } catch { throw new Refusal(`receipt unparseable: ${receiptPath}`); }
    if (receipt.schema !== SCHEMA) throw new Refusal(`receipt schema is not ${SCHEMA}`);
    if (receipt.stable !== stable) throw new Refusal(`receipt stable ${receipt.stable} != --stable ${stable}`);
    if (!Array.isArray(receipt.rows)) throw new Refusal("receipt rows is not an array");
  }

  const results = [];
  for (const row of population) {
    const reasons = [];
    const entries = receipt ? receipt.rows.filter((e) => e && e.id === row.id) : [];
    if (entries.length !== 1 || !Array.isArray(entries[0].files) || entries[0].files.length === 0) {
      reasons.push(receipt ? (entries.length > 1 ? "r1-entry duplicate" : "r1-entry missing or no files") : "r1-entry receipt absent");
      results.push({ id: row.id, resolved: false, verdict: null, reasons });
      continue;
    }
    const entry = entries[0];
    const fileVerdicts = [];
    const oldShas = [];
    for (const f of entry.files) {
      const label = f && f.path ? f.path : "(no path)";
      if (!f || typeof f.path !== "string" || !f.path || f.path.includes("..")) { reasons.push(`f2-path-bound ${label}`); continue; }
      if (!row.tags.includes(f.old_tag)) reasons.push(`f1-old-tag ${label}`);
      const inSource = row.source.includes(`refs/tags/${f.old_tag}/${f.path}`);
      const inAnchor = row.anchor.includes(basename(f.path));
      if (!inSource && !inAnchor) reasons.push(`f2-path-bound ${label}`);
      const wantOld = `${BYTES_ROOT}/${f.old_tag}/${f.path}`;
      const wantNew = `${BYTES_ROOT}/${stable}/${f.path}`;
      if (f.old_bytes !== wantOld || f.new_bytes !== wantNew) { reasons.push(`f3-bytes path ${label}`); continue; }
      const ob = blob(repo, rev, f.old_bytes);
      const nb = blob(repo, rev, f.new_bytes);
      if (ob === null || nb === null) { reasons.push(`f3-bytes absent ${label}`); continue; }
      if (sha256(ob) !== f.old_sha256 || sha256(nb) !== f.new_sha256) { reasons.push(`f3-bytes sha ${label}`); continue; }
      oldShas.push(f.old_sha256);
      const rf = refetchFor(repo, rev, row.id, refetchCache);
      const confirmed = rf && typeof rf.seat === "string" && rf.seat && typeof entry.fetched_by === "string" && entry.fetched_by && rf.seat !== entry.fetched_by &&
        Array.isArray(rf.files) && rf.files.some((x) => x && x.path === f.path && x.tag === stable && x.status === f.new_status && x.sha256 === f.new_sha256);
      if (!confirmed) { reasons.push(`f6-refetch ${label}`); continue; }
      const ranges = Array.isArray(f.ranges) ? f.ranges : [];
      if (f.old_status === 404) {
        fileVerdicts.push(f.new_status === 404 && nb.toString("utf8").includes("NOT_FOUND") ? "holds" : "drifted");
        continue;
      }
      if (f.old_status !== 200 || (f.new_status !== 200 && f.new_status !== 404)) { reasons.push(`f3-bytes status ${label}`); continue; }
      if (f.new_status === 404) { fileVerdicts.push("drifted"); continue; }
      const oldLines = ob.toString("utf8").split("\n");
      const newNorm = nb.toString("utf8").split("\n").map(normLine);
      let rangeOk = true;
      let holds = true;
      for (const r of ranges) {
        const [a, b] = Array.isArray(r) ? r.map(Number) : [NaN, NaN];
        if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < a || b > oldLines.length) {
          reasons.push(`f4-ranges ${label} ${JSON.stringify(r)}`);
          rangeOk = false;
          continue;
        }
        if (!blockIn(oldLines.slice(a - 1, b).map(normLine), newNorm)) holds = false;
      }
      if (!rangeOk) continue;
      if (ranges.length === 0) holds = f.old_sha256 === f.new_sha256;
      fileVerdicts.push(holds ? "holds" : "drifted");
    }
    const digests = rowDigests(row);
    if (digests.length && !digests.some((d) => oldShas.some((s) => digestMatches(d, s)))) reasons.push("f5-digest");
    let verdict = null;
    if (!reasons.length) {
      verdict = fileVerdicts.every((v) => v === "holds") ? "holds" : "drifted";
      if (verdict === "drifted") {
        const sup = entry.superseded_by ? byId.get(entry.superseded_by) : null;
        const ok = sup && sup.teaches.startsWith(`supersedes ${row.id} —`) && sup.source.includes(`refs/tags/${stable}/`);
        if (!ok) reasons.push("s1-drift-unsuperseded");
      }
    }
    results.push({ id: row.id, resolved: reasons.length === 0, verdict, reasons });
  }
  const unresolved = results.filter((r) => !r.resolved).length;
  return {
    schema: SCHEMA,
    rev,
    stable,
    receipt: receiptPath,
    receipt_present: rb !== null,
    population: population.length,
    resolved: population.length - unresolved,
    unresolved,
    holds: results.filter((r) => r.resolved && r.verdict === "holds").length,
    drifted: results.filter((r) => r.resolved && r.verdict === "drifted").length,
    rows: results,
    clean: unresolved === 0,
  };
}

// ---- self-test ----------------------------------------------------------------

const OLD = "154.0.8037.97";
const NEW = "156.0.8078.47";
const P = "content/public/common/feature.cc";
const OLD_TEXT = "// header\nint a = 1;\n// Enable the thing.\nBASE_FEATURE(kThing, ENABLED);\nint z = 9;\n";
const NEW_SAME = "// header v2\nint a = 2;\n\n// Enable the thing.\n  BASE_FEATURE(kThing,   ENABLED);\nint z = 9;\n";
const NEW_DRIFT = "// header v2\n// Enable the thing.\nBASE_FEATURE(kThing, DISABLED);\n";

function regLine(id, { tag = OLD, path = P, anchor, teaches = "teaches", recheck = "on-release", indent = "" } = {}) {
  const a = anchor ?? `tag ${tag}; feature.cc:3-4; sha256 ${sha256(Buffer.from(OLD_TEXT)).slice(0, 8)}…${sha256(Buffer.from(OLD_TEXT)).slice(-4)}`;
  return `${indent}| ${id} | Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${tag}/${path}?format=TEXT | code | A | scope | ${a} | ${teaches} | mined | 2026-10-20 | ${recheck} | — |`;
}

function registry(lines) {
  return ["# SOURCES", "", "## Registry", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");
}

function fileEntry({ oldText = OLD_TEXT, newText = NEW_SAME, ranges = [[3, 4]], oldStatus = 200, newStatus = 200, path = P, newTag = NEW } = {}) {
  return {
    path,
    old_tag: OLD,
    old_status: oldStatus,
    new_status: newStatus,
    old_bytes: `${BYTES_ROOT}/${OLD}/${path}`,
    new_bytes: `${BYTES_ROOT}/${newTag}/${path}`,
    old_sha256: sha256(Buffer.from(oldText)),
    new_sha256: sha256(Buffer.from(newText)),
    ranges,
    _old: oldText,
    _new: newText,
  };
}

function receiptOf(rows, stable = NEW) {
  return { schema: SCHEMA, stable, rows };
}

const REFETCH_FABRICATED = { seat: "W2-fixture", files: [{ path: P, tag: NEW, status: 200, sha256: sha256(Buffer.from(NEW_SAME)) }] };

const CASES = [
  { id: "absent-receipt-all-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); } },
  { id: "valid-holds-with-shifted-lines", exit: 0, unresolved: 0, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry()] }])); } },
  { id: "indented-row-counted", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001", { indent: "  " })]); } },
  { id: "not-on-release-not-counted", exit: 0, unresolved: 0, build: (d) => { d.reg([regLine("S001"), regLine("S002", { recheck: "90d" })]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry()] }])); } },
  { id: "pinned-at-stable-not-counted", exit: 0, unresolved: 0, build: (d) => { d.reg([regLine("S001"), regLine("S002", { tag: NEW })]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry()] }])); } },
  { id: "empty-population-could-not-evaluate", exit: 2, unresolved: null, build: (d) => { d.reg([regLine("S001", { tag: NEW })]); } },
  { id: "sha-mismatch-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); const f = fileEntry(); f.new_sha256 = "0".repeat(64); d.receipt(receiptOf([{ id: "S001", files: [f] }])); } },
  { id: "range-not-in-anchor-unresolved", exit: 1, unresolved: 1, reasons: ["f4-ranges"], build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ ranges: [[1, 2]] })] }])); } },
  { id: "new-bytes-under-old-tag-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ newTag: OLD, newText: OLD_TEXT })] }])); } },
  { id: "digest-binding-mismatch-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001", { anchor: `tag ${OLD}; feature.cc:3-4; sha256 deadbeef…0000` })]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry()] }])); } },
  { id: "path-not-bound-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ path: "base/other.cc" })] }])); } },
  { id: "drift-without-supersession-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ newText: NEW_DRIFT })] }])); } },
  {
    id: "drift-with-supersession-resolved", exit: 0, unresolved: 0,
    build: (d) => {
      d.reg([regLine("S001"), regLine("S002", { tag: NEW, teaches: "supersedes S001 — kThing disabled at the new tag" })]);
      d.receipt(receiptOf([{ id: "S001", superseded_by: "S002", files: [fileEntry({ newText: NEW_DRIFT })] }]));
    },
  },
  {
    id: "absence-404-holds", exit: 0, unresolved: 0,
    build: (d) => {
      const nf = "NOT_FOUND: Requested entity was not found.\n";
      d.reg([regLine("S001", { anchor: `HTTP 404; body sha256 ${sha256(Buffer.from(nf))}` })]);
      d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ oldText: nf, newText: nf, ranges: [], oldStatus: 404, newStatus: 404, path: P })] }]));
    },
  },
  {
    id: "absence-404-now-present-drifts", exit: 1, unresolved: 1,
    build: (d) => {
      const nf = "NOT_FOUND: Requested entity was not found.\n";
      d.reg([regLine("S001", { anchor: `HTTP 404; body sha256 ${sha256(Buffer.from(nf))}` })]);
      d.receipt(receiptOf([{ id: "S001", files: [fileEntry({ oldText: nf, newText: "int now_exists;\n", ranges: [], oldStatus: 404, newStatus: 200, path: P })] }]));
    },
  },
  { id: "receipt-stable-mismatch-could-not-evaluate", exit: 2, unresolved: null, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", files: [fileEntry()] }], "155.0.1.1")); } },
  { id: "bad-rev-could-not-evaluate", exit: 2, unresolved: null, rev: "no such rev!", build: (d) => { d.reg([regLine("S001")]); } },
  { id: "refetch-missing-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", _refetch: null, files: [fileEntry()] }])); } },
  { id: "refetch-same-seat-unresolved", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", fetched_by: "W2-fixture", files: [fileEntry()] }])); } },
  { id: "copied-old-as-new-caught-by-refetch", exit: 1, unresolved: 1, build: (d) => { d.reg([regLine("S001")]); d.receipt(receiptOf([{ id: "S001", _refetch: REFETCH_FABRICATED, files: [fileEntry({ newText: OLD_TEXT })] }])); } },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-release-pins-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  if (realpathSync(run(["rev-parse", "--show-toplevel"]).trim()) !== realpathSync(root)) throw new Error("fixture root mismatch");
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  const put = (rel, data) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); };
  return {
    root,
    reg(lines) { put(SOURCES_PATH, registry(lines)); },
    receipt(obj) {
      for (const e of obj.rows) {
        if (e.fetched_by === undefined) e.fetched_by = "W1-fixture";
        for (const f of e.files) {
          if (f._old !== undefined) put(f.old_bytes, f._old);
          if (f._new !== undefined) put(f.new_bytes, f._new);
          delete f._old; delete f._new;
        }
        const rf = e._refetch === undefined
          ? { seat: "W2-fixture", files: e.files.map((f) => ({ path: f.path, tag: obj.stable, status: f.new_status, sha256: f.new_sha256 })) }
          : e._refetch;
        delete e._refetch;
        if (rf) put(`${REFETCH_ROOT}/${e.id}.json`, `${JSON.stringify({ id: e.id, fetched_at: "2026-10-26T00:00:00Z", ...rf }, null, 2)}\n`);
      }
      put(DEFAULT_RECEIPT, `${JSON.stringify(obj, null, 2)}\n`);
    },
    commit() { run(["add", "-A"]); run(["commit", "--allow-empty", "-q", "-m", "fixture"]); return run(["rev-parse", "HEAD"]).trim(); },
  };
}

function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const fx = makeFixture();
    try {
      c.build(fx);
      const head = fx.commit();
      let exit;
      let out;
      try {
        out = evaluate(fx.root, c.rev ?? head, NEW, DEFAULT_RECEIPT);
        exit = out.clean ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { unresolved: null, refusal: e.message };
      }
      const row = Array.isArray(out.rows) && out.rows.length === 1 ? out.rows[0] : null;
      const reasonsOk = c.reasons === undefined || (row !== null && Array.isArray(row.reasons) &&
        row.reasons.length === c.reasons.length && c.reasons.every((p, i) => row.reasons[i].startsWith(p)));
      const ok = exit === c.exit && (c.unresolved === null ? out.unresolved === null : out.unresolved === c.unresolved) && reasonsOk;
      results.push({ id: c.id, ok, expectedExit: c.exit, exit, expectedUnresolved: c.unresolved, unresolved: out.unresolved, expectedReasons: c.reasons ?? null, rowReasons: row ? row.reasons : null, refusal: out.refusal ?? null });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli ----------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, stable: null, receipt: DEFAULT_RECEIPT, repo: LANE, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--stable") opts.stable = argv[++i];
    else if (a === "--receipt") opts.receipt = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`RELEASE_PINS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-release-pins.mjs --rev <REV> --stable <A.B.C.D> [--receipt <path>] [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected_unresolved=${r.expectedUnresolved ?? "-"} unresolved=${r.unresolved ?? "-"}${r.refusal ? ` refusal=${r.refusal}` : ""} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`RELEASE_PINS_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev || !opts.stable) {
    console.error("RELEASE_PINS verdict=could-not-evaluate detail=usage: --rev <REV> --stable <A.B.C.D>, or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev, opts.stable, opts.receipt);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`RELEASE_PINS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const r of out.rows) if (!r.resolved) console.log(`UNRESOLVED id=${r.id} reasons=${r.reasons.join(";")}`);
    console.log(`RELEASE_PINS verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} stable=${out.stable} population=${out.population} resolved=${out.resolved} unresolved=${out.unresolved} holds=${out.holds} drifted=${out.drifted}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
