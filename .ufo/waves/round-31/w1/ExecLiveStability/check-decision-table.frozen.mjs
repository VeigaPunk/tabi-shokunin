#!/usr/bin/env node
// check-decision-table.mjs — tabi lane gate: depth (a decision table whose
// every row carries a real, sourced threshold).
//
// Verdict: 0 clean (population >= 1 table rows and every row admitted);
//          1 failed (entry or table absent, or one or more rows not
//          admitted); 2 could-not-evaluate (usage, unresolvable revision,
//          registry absent at --rev or --baseline). Any other nonzero code
//          is undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temporary sandbox repositories
//          under TMPDIR; asserts exit code, admitted count and the first
//          reason id; the live check is exercised through an injected
//          fetcher, never the network; creates and removes its own trees).
// Frozen by: .ufo/waves/round-31/claims.json claim C1 (counter sha256
//          recorded there before any claim data).
// Pinned values: the CASES table in this file; the round's receipts under
//          --receipts (default corpus/evidence/round-31/decision-table).
// Write scope: stdout/stderr only. Production reads committed git blobs
//          (git show <rev>:<path>); with --live it makes one read-only HTTPS
//          GET per cited row url (curl -q, https only, redirects only to
//          https on the same host); never writes the lane, never reads
//          credentials or session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Population: the data rows of the first Markdown table in --entry whose
// header cells are exactly `Row | Signal | Decision | Threshold | Source |
// Located quote` (case-insensitive). A row is ADMITTED iff every check below
// passes; the first failing check per row is reported by stable id.
//
//   t1-row-id        Row cell is `D<n>` and unique in the table.
//   t2-signal        Signal cell names an observable in a backticked token
//                    (a status code, header or robots condition).
//   t3-decision      Decision cell starts with one verb of the closed set
//                    DECISIONS (an action a journey driver can take).
//   t4-threshold     Threshold cell holds a number with a unit of time,
//                    count or size (UNIT_RE), optionally after a bound word.
//   r1-row-missing   Source cell is exactly one S-id with a registry row
//                    (0-3 leading spaces, 11 cells) in corpus/SOURCES.md.
//   r2-status        the row's status is `mined`.
//   r3-used-by       the row's used-by names --entry.
//   r4-new-row       the id has no registry row at --baseline (the row was
//                    opened after the baseline, i.e. this round).
//   g1-receipt       <receipts>/<id>.json is committed, parses, names the id.
//   g2-url           the receipt url is https and the row's source cell
//                    contains it.
//   g3-bytes         the receipt's bytes_path is committed, its sha256
//                    equals the receipt sha256, http_status is 200.
//   q1-quote-length  the Located quote cell holds one double-quoted span
//                    (straight or curly quotes) of 6..25 words.
//   q2-quote-located the span is a substring of the normalised receipt bytes.
//   n1-threshold-sourced the threshold's number occurs in the quote, as
//                    digits (thousands separators ignored) or as an English
//                    number word (NUMBER_WORDS) — the threshold is the
//                    source's, not the author's.
//   l1-live          only with --live: the receipt url fetched now (HTTP 200,
//                    https, final url on the same host) still contains the
//                    quote after normalisation. Without --live a receipt
//                    whose bytes are the author's own text would pass q2.
//
// Normalisation: HTML bytes (doctype or <html) lose script/style blocks and
// tags, entities are decoded; every text is whitespace-collapsed.
//
// Counted fields: population, admitted, failing.
//
// Usage:
//   node scripts/check-decision-table.mjs --rev <REV> --baseline <REV> --entry <path>
//        [--receipts DIR] [--live] [--json]
//   node scripts/check-decision-table.mjs --selftest [--json]
//   node scripts/check-decision-table.mjs --repo <dir> ...   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-decision-table-v1";
const SELFTEST_SCHEMA = "tabi-decision-table-selftest-v1";
const SOURCES_PATH = "corpus/SOURCES.md";
const DEFAULT_RECEIPTS = "corpus/evidence/round-31/decision-table";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEADER = ["row", "signal", "decision", "threshold", "source", "located quote"];
const DECISIONS = new Set(["wait", "stop", "retry", "allow", "disallow", "cap", "follow", "refetch", "backoff", "cache", "limit", "pause", "serialize"]);
const UNIT_RE = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i;
const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-four": 24, thirty: 30, sixty: 60, ninety: 90, hundred: 100 };

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ---- git (read-only) --------------------------------------------------------

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
  if (typeof path !== "string" || !path || path.includes("..") || path.startsWith("/")) return null;
  const r = git(repo, ["show", `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}

// ---- parsing ----------------------------------------------------------------

function parseRegistry(text) {
  const rows = new Map();
  for (const line of text.split("\n")) {
    if (!/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/.test(line)) continue;
    const cells = line.trim().split("|");
    if (cells.length !== 13) continue;
    const c = cells.slice(1, 12).map((x) => x.trim());
    const [id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, usedBy] = c;
    if (!rows.has(id)) rows.set(id, { id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, usedBy });
  }
  return rows;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };

export function normalise(buf) {
  let t = Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf);
  if (/<!doctype html|<html[\s>]/i.test(t)) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    t = t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#") && k !== "#39") return String.fromCodePoint(parseInt(k.slice(1), 10));
      return ENTITIES[k] ?? m;
    });
  }
  return t.replace(/\s+/g, " ").trim();
}

const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const words = (s) => collapse(s).split(" ").filter(Boolean).length;

function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  return t.slice(1, -1).split("|").map((c) => c.trim());
}

export function parseTable(text) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const cells = splitRow(lines[i]);
    if (!cells || cells.length !== HEADER.length) continue;
    if (!cells.every((c, k) => c.toLowerCase() === HEADER[k])) continue;
    const rows = [];
    let j = i + 1;
    if (j < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[j])) j += 1;
    for (; j < lines.length; j += 1) {
      const rc = splitRow(lines[j]);
      if (!rc) break;
      rows.push({ line: j + 1, cells: rc });
    }
    return { headerLine: i + 1, rows };
  }
  return null;
}

function quoteSpans(cell) {
  const out = [];
  for (const m of cell.matchAll(/"([^"]+)"|“([^”]+)”/g)) out.push(collapse(m[1] ?? m[2]));
  return out;
}

function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) out.add(Number(m[0].replace(/,/g, "")));
  const lower = text.toLowerCase();
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(lower)) out.add(n);
  }
  return out;
}

// ---- live fetch -------------------------------------------------------------

function curlFetch(url) {
  const r = spawnSync("curl", ["-q", "-sS", "--proto", "=https", "--proto-redir", "=https", "-L", "--max-redirs", "5", "--max-time", "60",
    "-o", "-", "-w", "\n%{http_code} %{url_effective}", url], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  const buf = r.stdout;
  const nl = buf.lastIndexOf(10);
  const [code, effective] = buf.subarray(nl + 1).toString("utf8").trim().split(" ");
  return { code: Number(code), effective: effective || "", body: buf.subarray(0, nl) };
}

function hostOf(url) {
  try { return new URL(url).host.toLowerCase(); } catch { return null; }
}

function liveOk(url, quote, fetcher) {
  if (!/^https:\/\//.test(url)) return false;
  const res = fetcher(url);
  if (!res || res.code !== 200) return false;
  if (!/^https:\/\//.test(res.effective) || hostOf(res.effective) !== hostOf(url)) return false;
  return normalise(res.body).includes(quote);
}

// ---- evaluation -------------------------------------------------------------

export function evaluate(repo, revArg, { baseline, entry, receipts = DEFAULT_RECEIPTS, live = false, fetcher = curlFetch }) {
  if (typeof entry !== "string" || !/^corpus\/knowledge\/[A-Za-z0-9._-]+\.md$/.test(entry)) throw new Refusal(`malformed --entry: ${entry}`);
  const rev = resolveRev(repo, revArg);
  const base = resolveRev(repo, baseline);
  const reg = blob(repo, rev, SOURCES_PATH);
  if (reg === null) throw new Refusal(`${SOURCES_PATH} absent at ${rev}`);
  const baseReg = blob(repo, base, SOURCES_PATH);
  if (baseReg === null) throw new Refusal(`${SOURCES_PATH} absent at baseline ${base}`);
  const rows = parseRegistry(reg.toString("utf8"));
  const baseRows = parseRegistry(baseReg.toString("utf8"));
  const result = (tableRows, entryPresent, tablePresent) => {
    const admitted = tableRows.filter((r) => r.admitted).length;
    return {
      schema: SCHEMA, rev, baseline: base, entry, receipts, live: Boolean(live),
      entryPresent, tablePresent,
      population: tableRows.length, admitted, failing: tableRows.length - admitted,
      rows: tableRows,
      clean: tableRows.length > 0 && admitted === tableRows.length,
    };
  };
  const eb = blob(repo, rev, entry);
  if (eb === null) return result([], false, false);
  const table = parseTable(eb.toString("utf8"));
  if (!table) return result([], true, false);

  const receiptCache = new Map();
  const loadReceipt = (id) => {
    if (receiptCache.has(id)) return receiptCache.get(id);
    const res = { reason: null, norm: null, url: null };
    const rb = blob(repo, rev, `${receipts}/${id}.json`);
    let rc = null;
    if (rb !== null) { try { rc = JSON.parse(rb.toString("utf8")); } catch { rc = null; } }
    if (!rc || rc.id !== id) res.reason = "g1-receipt";
    else if (typeof rc.url !== "string" || !/^https:\/\/\S+$/.test(rc.url) || !rows.get(id).source.includes(rc.url)) res.reason = "g2-url";
    else {
      const bytes = blob(repo, rev, rc.bytes_path);
      if (bytes === null || rc.http_status !== 200 || sha256(bytes) !== rc.sha256) res.reason = "g3-bytes";
      else { res.norm = normalise(bytes); res.url = rc.url; }
    }
    receiptCache.set(id, res);
    return res;
  };
  const liveCache = new Map();

  const seen = new Set();
  const out = [];
  for (const { line, cells } of table.rows) {
    const [rowId, signal, decision, threshold, source, quoteCell] = cells.length === HEADER.length ? cells : [cells[0] ?? "", "", "", "", "", ""];
    const fail = (reason) => out.push({ row: rowId, line, source, admitted: false, reason });
    if (!/^D[0-9]+$/.test(rowId) || seen.has(rowId)) { seen.add(rowId); fail("t1-row-id"); continue; }
    seen.add(rowId);
    if (!/`[^`]+`/.test(signal)) { fail("t2-signal"); continue; }
    const verb = (decision.toLowerCase().match(/^[a-z]+/) || [""])[0];
    if (!DECISIONS.has(verb)) { fail("t3-decision"); continue; }
    const tm = UNIT_RE.exec(threshold);
    if (!tm) { fail("t4-threshold"); continue; }
    const tnum = Number(tm[1].replace(/,/g, ""));
    if (!/^S[0-9]{3,}$/.test(source) || !rows.has(source)) { fail("r1-row-missing"); continue; }
    const reg = rows.get(source);
    if (reg.status !== "mined") { fail("r2-status"); continue; }
    if (!reg.usedBy.split(/[,;]/).map((p) => p.trim()).includes(entry)) { fail("r3-used-by"); continue; }
    if (baseRows.has(source)) { fail("r4-new-row"); continue; }
    const g = loadReceipt(source);
    if (g.reason) { fail(g.reason); continue; }
    const spans = quoteSpans(quoteCell);
    if (spans.length !== 1 || words(spans[0]) < 6 || words(spans[0]) > 25) { fail("q1-quote-length"); continue; }
    const quote = spans[0];
    if (!g.norm.includes(quote)) { fail("q2-quote-located"); continue; }
    if (!numbersIn(quote).has(tnum)) { fail("n1-threshold-sourced"); continue; }
    if (live) {
      const key = `${g.url}\u0000${quote}`;
      if (!liveCache.has(key)) liveCache.set(key, liveOk(g.url, quote, fetcher));
      if (!liveCache.get(key)) { fail("l1-live"); continue; }
    }
    out.push({ row: rowId, line, source, admitted: true, reason: null, threshold: tnum });
  }
  return result(out, true, true);
}

// ---- self-test --------------------------------------------------------------

const ENTRY = "corpus/knowledge/fx-table.md";
const FX_URL = "https://example.org/spec.txt";
const SRC = "Intro.\nThe crawlers SHOULD follow at least five consecutive redirects, even across authorities.\nCrawlers SHOULD NOT use the cached version for more than 24 hours.\nThe limit is 5,000 requests per hour.\nIf none of the redirects resolve, the crawler stops trying.\n";
const Q5 = "The crawlers SHOULD follow at least five consecutive redirects, even across authorities.";
const Q24 = "Crawlers SHOULD NOT use the cached version for more than 24 hours.";
const QNONE = "If none of the redirects resolve, the crawler stops trying.";
const HTML = "<!DOCTYPE html><html><head><script>var x=\"Wait at least one minute before retrying any request\";</script></head><body><p>Otherwise, wait for <b>at least one minute</b> before retrying &amp; then back off.</p></body></html>";
const QHTML = "Otherwise, wait for at least one minute before retrying & then back off.";

function regRow(id, { url = FX_URL, status = "mined", usedBy = ENTRY, indent = "" } = {}) {
  return `${indent}| ${id} | Fixture spec — ${url} | spec | A | scope | §2 | teaches | ${status} | 2026-10-26 | 180d | ${usedBy} |`;
}
function registry(lines) {
  return ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");
}
function tableDoc(rows, header = "| Row | Signal | Decision | Threshold | Source | Located quote |") {
  return ["# Fixture decision table", "", "source: S002", "verified-at: 2026-10-26", "recheck: 180d", "", header, "|---|---|---|---|---|---|", ...rows, "", "Trailing prose.", ""].join("\n");
}
const R5 = `| D1 | robots.txt fetch answers \`301\` | follow | at least 5 redirects | S002 | "${Q5}" |`;
const R24 = `| D2 | cached \`robots.txt\` | refetch | 24 hours | S002 | "${Q24}" |`;
function receipt(d, { id = "S002", text = SRC, url = FX_URL, status = 200, sha } = {}) {
  const bytesPath = `${DEFAULT_RECEIPTS}/bytes/${id}.txt`;
  d.put(bytesPath, text);
  d.put(`${DEFAULT_RECEIPTS}/${id}.json`, JSON.stringify({ id, url, fetched_at: "2026-10-26T00:00:00Z", fetched_by: "fixture", http_status: status, bytes_path: bytesPath, sha256: sha ?? sha256(Buffer.from(text)) }));
}
const okFetch = (body = SRC) => (url) => ({ code: 200, effective: url, body: Buffer.from(body) });

// Each case: base() builds the baseline commit; build() the measured commit.
const baseReg = (d) => d.put(SOURCES_PATH, registry([regRow("S001", { usedBy: "corpus/knowledge/old.md" })]));
const std = (d, rows = [R5, R24], opts = {}) => { d.put(SOURCES_PATH, registry([regRow("S001", { usedBy: "corpus/knowledge/old.md" }), regRow("S002", opts.row)])); d.put(ENTRY, tableDoc(rows)); receipt(d, opts.receipt); };

const CASES = [
  { id: "admitted-clean", exit: 0, admitted: 2, reason: null, build: (d) => std(d) },
  { id: "entry-absent-zero", exit: 1, admitted: 0, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([regRow("S002")])); } },
  { id: "table-header-wrong-zero", exit: 1, admitted: 0, reason: null, build: (d) => { std(d); d.put(ENTRY, tableDoc([R5], "| Row | Signal | Action | Threshold | Source | Located quote |")); } },
  { id: "row-id-duplicate", exit: 1, admitted: 1, reason: "t1-row-id", build: (d) => std(d, [R5, R5]) },
  { id: "signal-without-token", exit: 1, admitted: 0, reason: "t2-signal", build: (d) => std(d, [R5.replace("`301`", "301")]) },
  { id: "decision-outside-set", exit: 1, admitted: 0, reason: "t3-decision", build: (d) => std(d, [R5.replace("| follow |", "| consider |")]) },
  { id: "threshold-prose", exit: 1, admitted: 0, reason: "t4-threshold", build: (d) => std(d, [R5.replace("at least 5 redirects", "several redirects")]) },
  { id: "threshold-unitless", exit: 1, admitted: 0, reason: "t4-threshold", build: (d) => std(d, [R5.replace("at least 5 redirects", "5")]) },
  { id: "source-row-missing", exit: 1, admitted: 0, reason: "r1-row-missing", build: (d) => std(d, [R5.replace("| S002 |", "| S009 |")]) },
  { id: "source-two-ids", exit: 1, admitted: 0, reason: "r1-row-missing", build: (d) => std(d, [R5.replace("| S002 |", "| S002, S001 |")]) },
  { id: "status-queued", exit: 1, admitted: 0, reason: "r2-status", build: (d) => std(d, [R5], { row: { status: "queued" } }) },
  { id: "used-by-omits-entry", exit: 1, admitted: 0, reason: "r3-used-by", build: (d) => std(d, [R5], { row: { usedBy: "corpus/knowledge/other.md" } }) },
  { id: "row-present-at-baseline", exit: 1, admitted: 0, reason: "r4-new-row", build: (d) => { d.put(SOURCES_PATH, registry([regRow("S001", { usedBy: `corpus/knowledge/old.md, ${ENTRY}` })])); d.put(ENTRY, tableDoc([R5.replace("| S002 |", "| S001 |")])); receipt(d, { id: "S001" }); } },
  { id: "indented-row-found", exit: 0, admitted: 1, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([regRow("S002", { indent: "  " })])); d.put(ENTRY, tableDoc([R5])); receipt(d); } },
  { id: "receipt-missing", exit: 1, admitted: 0, reason: "g1-receipt", build: (d) => { d.put(SOURCES_PATH, registry([regRow("S002")])); d.put(ENTRY, tableDoc([R5])); } },
  { id: "receipt-url-http", exit: 1, admitted: 0, reason: "g2-url", build: (d) => std(d, [R5], { row: { url: "http://example.org/spec.txt" }, receipt: { url: "http://example.org/spec.txt" } }) },
  { id: "receipt-url-not-in-row", exit: 1, admitted: 0, reason: "g2-url", build: (d) => std(d, [R5], { receipt: { url: "https://example.org/other.txt" } }) },
  { id: "bytes-sha-mismatch", exit: 1, admitted: 0, reason: "g3-bytes", build: (d) => std(d, [R5], { receipt: { sha: "0".repeat(64) } }) },
  { id: "http-status-404", exit: 1, admitted: 0, reason: "g3-bytes", build: (d) => std(d, [R5], { receipt: { status: 404 } }) },
  { id: "quote-too-short", exit: 1, admitted: 0, reason: "q1-quote-length", build: (d) => std(d, [R5.replace(`"${Q5}"`, '"follow at least five redirects"')]) },
  { id: "quote-two-spans", exit: 1, admitted: 0, reason: "q1-quote-length", build: (d) => std(d, [R5.replace(`"${Q5}"`, `"${Q5}" and "${Q24}"`)]) },
  { id: "quote-not-in-bytes", exit: 1, admitted: 0, reason: "q2-quote-located", build: (d) => std(d, [R5.replace("at least five consecutive", "at least seven consecutive").replace("at least 5 redirects", "at least 7 redirects")]) },
  { id: "threshold-not-in-quote", exit: 1, admitted: 0, reason: "n1-threshold-sourced", build: (d) => std(d, [R5.replace("at least 5 redirects", "at least 10 redirects")]) },
  { id: "threshold-thousands-separator", exit: 0, admitted: 1, reason: null, build: (d) => std(d, [`| D3 | \`x-ratelimit-limit\` | cap | 5000 requests | S002 | "The limit is 5,000 requests per hour." |`]) },
  { id: "number-word-needs-boundary", exit: 1, admitted: 0, reason: "n1-threshold-sourced", build: (d) => std(d, [`| D4 | \`301\` loop | stop | 1 redirects | S002 | "${QNONE}" |`]) },
  { id: "html-normalised-located", exit: 0, admitted: 1, reason: null, build: (d) => std(d, [`| D5 | \`429\` without \`retry-after\` | wait | at least 1 minute | S002 | "${QHTML}" |`], { receipt: { text: HTML } }) },
  { id: "html-script-text-not-located", exit: 1, admitted: 0, reason: "q2-quote-located", build: (d) => std(d, [`| D6 | \`429\` | wait | 1 minute | S002 | "Wait at least one minute before retrying any request" |`], { receipt: { text: HTML } }) },
  { id: "live-located", exit: 0, admitted: 2, reason: null, live: true, fetcher: okFetch(), build: (d) => std(d) },
  { id: "live-self-quote-receipt", exit: 1, admitted: 0, reason: "l1-live", live: true, fetcher: okFetch("The real page says something else.\n"), build: (d) => std(d, [R5]) },
  { id: "live-offhost-redirect", exit: 1, admitted: 0, reason: "l1-live", live: true, fetcher: (u) => ({ code: 200, effective: "https://evil.example.net/spec.txt", body: Buffer.from(SRC) }), build: (d) => std(d, [R5]) },
  { id: "live-non-200", exit: 1, admitted: 0, reason: "l1-live", live: true, fetcher: (u) => ({ code: 404, effective: u, body: Buffer.from(SRC) }), build: (d) => std(d, [R5]) },
  { id: "live-fetch-failed", exit: 1, admitted: 0, reason: "l1-live", live: true, fetcher: () => null, build: (d) => std(d, [R5]) },
  { id: "bad-rev-could-not-evaluate", exit: 2, admitted: null, reason: null, rev: "no such rev!", build: (d) => std(d) },
  { id: "malformed-entry-could-not-evaluate", exit: 2, admitted: null, reason: null, entry: "../SKILL.md", build: (d) => std(d) },
];

function makeFixture(baseDir) {
  const root = mkdtempSync(join(baseDir, "fx-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  const top = run(["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`fixture root mismatch: ${top} != ${root}`);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  return {
    root,
    put(rel, data) { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); },
    commit() { run(["add", "-A"]); run(["commit", "--allow-empty", "-q", "-m", "fixture"]); return run(["rev-parse", "HEAD"]).trim(); },
  };
}

function runSelftest() {
  const baseDir = mkdtempSync(join(tmpdir(), "tabi-decision-table-selftest-"));
  const results = [];
  try {
    for (const c of CASES) {
      const fx = makeFixture(baseDir);
      try {
        baseReg(fx);
        const baseline = fx.commit();
        c.build(fx);
        const head = fx.commit();
        let exit;
        let out;
        try {
          out = evaluate(fx.root, c.rev ?? head, { baseline, entry: c.entry ?? ENTRY, live: Boolean(c.live), fetcher: c.fetcher ?? (() => { throw new Error("network forbidden in self-test"); }) });
          exit = out.clean ? 0 : 1;
        } catch (e) {
          if (!(e instanceof Refusal)) throw e;
          exit = 2;
          out = { admitted: null, rows: [], refusal: e.message };
        }
        const first = out.rows.map((r) => r.reason).find(Boolean) ?? null;
        const ok = exit === c.exit && out.admitted === c.admitted && first === c.reason;
        results.push({ id: c.id, ok, expectedExit: c.exit, exit, admitted: out.admitted, reason: first, refusal: out.refusal ?? null });
      } finally {
        rmSync(fx.root, { recursive: true, force: true });
      }
    }
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli --------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, baseline: null, entry: null, repo: LANE, receipts: DEFAULT_RECEIPTS, live: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--live") opts.live = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--baseline") opts.baseline = argv[++i];
    else if (a === "--entry") opts.entry = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else if (a === "--receipts") opts.receipts = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`DECISION_TABLE verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-decision-table.mjs --rev <REV> --baseline <REV> --entry <corpus/knowledge/X.md> [--receipts DIR] [--live] [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} admitted=${r.admitted ?? "-"} reason=${r.reason ?? "-"}${r.refusal ? ` refusal=${r.refusal}` : ""} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`DECISION_TABLE_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev || !opts.baseline || !opts.entry) {
    console.error("DECISION_TABLE verdict=could-not-evaluate detail=usage: --rev <REV> --baseline <REV> --entry <path>, or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev, opts);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`DECISION_TABLE verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const r of out.rows) console.log(`ROW ${r.row} line=${r.line} source=${r.source} ${r.admitted ? "ADMITTED" : `NOT-ADMITTED reason=${r.reason}`}`);
    console.log(`DECISION_TABLE verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} baseline=${out.baseline} entry=${out.entry} live=${out.live} population=${out.population} admitted=${out.admitted} failing=${out.failing}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
