#!/usr/bin/env node
// check-source-reopen-receipt.mjs — tabi lane gate: C2 freshness (source re-open receipt).
//
// Verdict: 0 clean (receipt present, reopened=6, unresolved=0), 1 failed (any
//          unresolved or wrong counts), 2 could-not-evaluate (usage, missing
//          receipt at the revision, git failure, unexpected error). Any other
//          nonzero code is undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temp fixtures; asserts exit code
//          AND stable finding id; creates and removes its own temp trees even on
//          a crash).
// Write scope: stdout/stderr only. Production reads committed git blobs only.
// Owner: tabi L1.
//
// What it decides
// ---------------
// The receipt is `corpus/evidence/round-25/freshness/reopened.json` (schema
// tabi-source-reopen-v1). For each of the six rows (S013, S015, S016, S020,
// S023, S024) the counter requires:
//   f1-missing-receipt   receipt absent at the measured revision -> could-not-evaluate.
//   f2-invalid-schema     JSON does not parse or lacks rows/summary.
//   f3-fetched-date       row.fetched_at must be a valid ISO-8601 UTC timestamp on
//                         or after 2026-10-25 (this round).
//   f4-fetch-digest       row.sha256 must be a 64-hex digest and must equal sha256
//                         of the stored bytes at row.bytes_path (committed this
//                         round); a missing/mismatched file is unresolved.
//   f5-unresolved         a row is unresolved when: verdict=holds without a held
//                         quote (row.held_quote) that equals row.located_quote and
//                         actually appears in the stored bytes (tag-stripped,
//                         whitespace-normalized); verdict in drifted|absent without a
//                         supersession pointer that resolves to a SOURCES correction
//                         row opened this round whose teaches OPENS with
//                         "supersedes <this row's id> —"; or verdict missing/unknown.
//   f6-count-mismatch     duplicate row ids, summary.reopened != rows.length, or
//                         summary.unresolved != computed unresolved.
// Findings are stable ids; exit 1 when unresolved>0, reopened!=6, or any count
// mismatch; exit 2 when the receipt is missing or unreadable.
//
// Usage:
//   node scripts/check-source-reopen-receipt.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-source-reopen-receipt.mjs --selftest [--json]
//   node scripts/check-source-reopen-receipt.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-source-reopen-v1";
const SELFTEST_SCHEMA = "tabi-source-reopen-selftest-v1";
const RECEIPT_PATH = "corpus/evidence/round-25/freshness/reopened.json";
const SOURCES_PATH = "corpus/SOURCES.md";
const EXPECTED_IDS = ["S013", "S015", "S016", "S020", "S023", "S024"];
const ROUND_DATE = "2026-10-25";
const DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");

function normalize(s) {
  return String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sha(b) {
  return createHash("sha256").update(b).digest("hex");
}

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

function git(repo, args) {
  const env = {};
  for (const k of Object.keys(process.env)) {
    if (!k.startsWith("GIT_")) env[k] = process.env[k];
  }
  const r = spawnSync("git", ["--no-replace-objects", "-C", repo, ...args], { encoding: "utf8", env, timeout: 20000, maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return { out: r.stdout ?? "", status: r.status };
}

function resolveRev(repo, rev) {
  const r = git(repo, ["rev-parse", "--verify", "--end-of-options", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`git rev-parse ${rev} failed: ${r.stderr.trim()}`);
  return r.out.trim();
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) return { out: "", status: r.status };
  return { out: r.out ?? "", status: 0 };
}

// supersessionRow(repo, rev, sid): locate the SOURCES row, return {teaches, opened}
// or null when absent. The regex is ECMAScript-safe (\\s, not POSIX classes).
function supersessionRow(repo, rev, sid) {
  const blob = readBlob(repo, rev, SOURCES_PATH);
  if (blob.status !== 0) return null;
  const re = new RegExp(`^\\|[\\s]*${sid}[\\s]*\\|`, "m");
  const m = re.exec(blob.out);
  if (!m) return null;
  const lineEnd = blob.out.indexOf("\n", m.index);
  const line = blob.out.slice(m.index, lineEnd === -1 ? undefined : lineEnd);
  const cells = line.split("|").map((c) => c.trim());
  // cells[0] is empty before the first '|'; id=cells[1], teaches=cells[7], opened=cells[9]
  return { teaches: cells[7] ?? "", opened: cells[9] ?? "" };
}

function score(repo, rev) {
  const blob = readBlob(repo, rev, RECEIPT_PATH);
  if (blob.status !== 0) {
    return { schema: SCHEMA, rev, reopened: 0, resolved: 0, unresolved: 0, findings: [{ class: "f1-missing-receipt", detail: `no receipt at ${rev}:${RECEIPT_PATH}` }], clean: false, exit: 2 };
  }
  if (blob.out.length > 5_000_000) {
    return { schema: SCHEMA, rev, reopened: 0, resolved: 0, unresolved: 0, findings: [{ class: "f2-invalid-schema", detail: "receipt too large" }], clean: false, exit: 2 };
  }
  let r;
  try {
    r = JSON.parse(blob.out);
  } catch (e) {
    return { schema: SCHEMA, rev, reopened: 0, resolved: 0, unresolved: 0, findings: [{ class: "f2-invalid-schema", detail: e.message }], clean: false, exit: 2 };
  }
  const findings = [];
  if (r.schema !== SCHEMA || !Array.isArray(r.rows) || !r.summary) {
    findings.push({ class: "f2-invalid-schema", detail: "schema/rows/summary shape" });
  }
  const rows = Array.isArray(r.rows) ? r.rows : [];
  let reopened = rows.length;
  const ids = rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) {
    findings.push({ class: "f6-count-mismatch", detail: "duplicate row ids" });
  }
  let resolved = 0;
  let unresolved = 0;
  for (const row of rows) {
    if (!EXPECTED_IDS.includes(row.id)) {
      findings.push({ class: "f6-count-mismatch", detail: `unexpected row id ${row.id}` });
      continue;
    }
    if (typeof row.fetched_at !== "string" || !DATE_RE.test(row.fetched_at) || row.fetched_at < ROUND_DATE) {
      unresolved++;
      findings.push({ class: "f3-fetched-date", detail: `${row.id} fetched_at=${row.fetched_at}` });
      continue;
    }
    const bytesBlob = typeof row.bytes_path === "string" ? readBlob(repo, rev, row.bytes_path) : { status: 1 };
    const digestOk = typeof row.sha256 === "string" && /^[0-9a-f]{64}$/.test(row.sha256) && bytesBlob.status === 0 && sha(Buffer.from(bytesBlob.out)) === row.sha256;
    if (!digestOk) {
      unresolved++;
      findings.push({ class: "f4-fetch-digest", detail: `${row.id} sha256=${row.sha256} bytes=${row.bytes_path}` });
      continue;
    }
    const verdict = row.verdict;
    if (verdict === "holds") {
      const held = typeof row.held_quote === "string" ? normalize(row.held_quote) : "";
      const q = typeof row.located_quote === "string" ? normalize(row.located_quote) : "";
      if (held.length > 0 && q === held && normalize(bytesBlob.out).includes(held)) {
        resolved++;
      } else {
        unresolved++;
        findings.push({ class: "f5-unresolved", detail: `${row.id} holds without held quote located in stored bytes` });
      }
    } else if (verdict === "drifted" || verdict === "absent") {
      if (typeof row.supersession === "string" && /^S[0-9]{3,}$/.test(row.supersession)) {
        const srow = supersessionRow(repo, rev, row.supersession);
        const ok = srow !== null && srow.opened === ROUND_DATE && new RegExp(`^supersedes\\s+${row.id}\\s+—`).test(normalize(srow.teaches));
        if (ok) {
          resolved++;
        } else {
          unresolved++;
          findings.push({ class: "f5-unresolved", detail: `${row.id} supersession ${row.supersession} not a this-round correction row for ${row.id}` });
        }
      } else {
        unresolved++;
        findings.push({ class: "f5-unresolved", detail: `${row.id} ${verdict} without supersession pointer` });
      }
    } else {
      unresolved++;
      findings.push({ class: "f5-unresolved", detail: `${row.id} verdict=${verdict}` });
    }
  }
  if (reopened !== 6) {
    findings.push({ class: "f6-count-mismatch", detail: `reopened=${reopened}` });
  }
  if (typeof r.summary.reopened === "number" && r.summary.reopened !== reopened) {
    findings.push({ class: "f6-count-mismatch", detail: `summary.reopened=${r.summary.reopened} rows=${reopened}` });
  }
  if (typeof r.summary.unresolved === "number" && r.summary.unresolved !== unresolved) {
    findings.push({ class: "f6-count-mismatch", detail: `summary.unresolved=${r.summary.unresolved} computed=${unresolved}` });
  }
  const clean = findings.length === 0 && reopened === 6 && unresolved === 0;
  const exit = clean ? 0 : 1;
  return { schema: SCHEMA, rev, reopened, resolved, unresolved, findings, clean, exit };
}

const CASES = [
  { name: "clean-6-6", exit: 0, finding: null },
  { name: "stale-fetch-date", exit: 1, finding: "f3-fetched-date" },
  { name: "bad-date-string", exit: 1, finding: "f3-fetched-date" },
  { name: "missing-digest", exit: 1, finding: "f4-fetch-digest" },
  { name: "missing-bytes-path", exit: 1, finding: "f4-fetch-digest" },
  { name: "bytes-digest-mismatch", exit: 1, finding: "f4-fetch-digest" },
  { name: "holds-without-quote", exit: 1, finding: "f5-unresolved" },
  { name: "quote-not-in-bytes", exit: 1, finding: "f5-unresolved" },
  { name: "located-neq-held", exit: 1, finding: "f5-unresolved" },
  { name: "drift-without-pointer", exit: 1, finding: "f5-unresolved" },
  { name: "dangling-supersession", exit: 1, finding: "f5-unresolved" },
  { name: "stale-supersession", exit: 1, finding: "f5-unresolved" },
  { name: "wrong-supersedes-target", exit: 1, finding: "f5-unresolved" },
  { name: "missing-verdict", exit: 1, finding: "f5-unresolved" },
  { name: "duplicate-row", exit: 1, finding: "f6-count-mismatch" },
  { name: "five-rows", exit: 1, finding: "f6-count-mismatch" },
  { name: "summary-mismatch", exit: 1, finding: "f6-count-mismatch" },
  { name: "missing-receipt", exit: 2, finding: "f1-missing-receipt" },
];

function cleanRows() {
  return EXPECTED_IDS.map((id) => {
    const content = `<html>fixture ${id} quote for ${id}</html>\n`;
    return { id, url: `https://example.invalid/${id}`, fetched_at: "2026-10-25T12:15:24Z", bytes: Buffer.byteLength(content), sha256: sha(Buffer.from(content)), bytes_path: `corpus/evidence/round-25/freshness/bytes/${id}.html`, held_quote: `quote for ${id}`, located_quote: `quote for ${id}`, verdict: "holds" };
  });
}

function writeCase(repo2, name, receipt, withSources) {
  mkdirSync(join(repo2, "corpus/evidence/round-25/freshness/bytes"), { recursive: true });
  if (receipt !== null) {
    const p = join(repo2, "corpus/evidence/round-25/freshness/reopened.json");
    writeFileSync(p, JSON.stringify(receipt, null, 2) + "\n");
  }
  const sp = join(repo2, "corpus/SOURCES.md");
  let lines = "# SOURCES\n## Registry\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
  for (const id of EXPECTED_IDS) {
    lines += `| ${id} | fixture | docs | A | s | a | teaches | mined | 2026-10-19 | on-release | — |\n`;
    const content = `<html>fixture ${id} quote for ${id}</html>\n`;
    writeFileSync(join(repo2, `corpus/evidence/round-25/freshness/bytes/${id}.html`), content);
  }
  if (withSources) {
    lines += `| ${withSources.id} | fixture | docs | A | s | a | ${withSources.teaches} | mined | ${ROUND_DATE} | on-release | — |\n`;
  }
  writeFileSync(sp, lines);
  git(repo2, ["add", "corpus"]);
  git(repo2, ["commit", "-q", "-m", name]);
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), "tabi-source-reopen-selftest-"));
  try {
    const results = [];
    for (const c of CASES) {
      const r2 = mkdtempSync(join(tmpdir(), "tabi-source-reopen-case-"));
      try {
        const repo2 = join(r2, "repo");
        mkdirSync(join(repo2, "corpus/evidence/round-25/freshness"), { recursive: true });
        git(repo2, ["init", "-q"]);
        git(repo2, ["config", "user.email", "t@t"]);
        git(repo2, ["config", "user.name", "t"]);
        let receipt = null;
        let withSources = null;
        switch (c.name) {
          case "clean-6-6": receipt = { schema: SCHEMA, rows: cleanRows(), summary: { reopened: 6, resolved: 6, unresolved: 0 } }; break;
          case "stale-fetch-date": {
            const rows = cleanRows(); rows[0].fetched_at = "2026-10-19T00:00:00Z";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "bad-date-string": {
            const rows = cleanRows(); rows[0].fetched_at = "zzzz";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "missing-digest": {
            const rows = cleanRows(); delete rows[1].sha256;
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "missing-bytes-path": {
            const rows = cleanRows(); delete rows[2].bytes_path;
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "bytes-digest-mismatch": {
            const rows = cleanRows(); rows[3].sha256 = "b".repeat(64);
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "holds-without-quote": {
            const rows = cleanRows(); delete rows[0].located_quote;
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "quote-not-in-bytes": {
            const rows = cleanRows(); rows[1].located_quote = "this quote is not in the stored bytes";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "located-neq-held": {
            const rows = cleanRows(); rows[2].located_quote = "quote for " + rows[2].id + " extra";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "drift-without-pointer": {
            const rows = cleanRows(); rows[3].verdict = "drifted";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "dangling-supersession": {
            const rows = cleanRows(); rows[3].verdict = "drifted"; rows[3].supersession = "S999";
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "stale-supersession": {
            const rows = cleanRows(); rows[3].verdict = "drifted"; rows[3].supersession = "S014"; // exists but opened 2026-10-19
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "wrong-supersedes-target": {
            const rows = cleanRows(); rows[3].verdict = "drifted"; rows[3].supersession = "S107";
            withSources = { id: "S107", teaches: "supersedes S013 — not " + rows[3].id };
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "missing-verdict": {
            const rows = cleanRows(); delete rows[4].verdict;
            receipt = { schema: SCHEMA, rows, summary: { reopened: 6, resolved: 5, unresolved: 1 } }; break;
          }
          case "duplicate-row": {
            const rows = cleanRows(); rows.push({ ...rows[0] });
            receipt = { schema: SCHEMA, rows, summary: { reopened: 7, resolved: 6, unresolved: 0 } }; break;
          }
          case "five-rows": receipt = { schema: SCHEMA, rows: cleanRows().slice(0, 5), summary: { reopened: 5, resolved: 5, unresolved: 0 } }; break;
          case "summary-mismatch": receipt = { schema: SCHEMA, rows: cleanRows(), summary: { reopened: 6, resolved: 6, unresolved: 3 } }; break;
          case "missing-receipt": receipt = null; break;
        }
        writeCase(repo2, c.name, receipt, withSources);
        const rev = git(repo2, ["rev-parse", "HEAD"]).out.trim();
        const s = score(repo2, rev);
        const ok = s.exit === c.exit && (c.finding === null || s.findings.some((f) => f.class === c.finding));
        results.push({ name: c.name, expectedExit: c.exit, expectedFinding: c.finding, gotExit: s.exit, gotFindings: s.findings.map((f) => f.class), ok });
      } finally {
        rmSync(r2, { recursive: true, force: true });
      }
    }
    const passed = results.filter((r) => r.ok).length;
    return { schema: SELFTEST_SCHEMA, cases: results.length, passed, results, clean: passed === results.length, exit: passed === results.length ? 0 : 1 };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const out = (o) => process.stdout.write(JSON.stringify(o, null, json ? 2 : 0) + "\n");
  try {
    if (args.includes("--selftest")) {
      const s = selftest();
      out(s);
      process.exit(s.exit);
    }
    const revIdx = args.indexOf("--rev");
    const repoIdx = args.indexOf("--repo");
    let repo = LANE;
    if (repoIdx !== -1) repo = args[repoIdx + 1];
    if (revIdx === -1) {
      out({ schema: SCHEMA, error: "usage: --rev <40-hex-or-ref> [--json] | --selftest [--json]" });
      process.exit(2);
    }
    const revArg = args[revIdx + 1];
    let rev;
    try {
      rev = resolveRev(repo, revArg);
    } catch (e) {
      out({ schema: SCHEMA, rev: revArg, error: e.message, exit: 2 });
      process.exit(2);
    }
    const s = score(repo, rev);
    out(s);
    process.exit(s.exit);
  } catch (e) {
    out({ schema: SCHEMA, error: e.message, exit: 2 });
    process.exit(2);
  }
}

main();
