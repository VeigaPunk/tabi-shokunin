#!/usr/bin/env node
// check-frontier-admission.mjs — tabi lane gate: coverage (admission of
// knowledge entries onto a named frontier surface, grounded in committed
// source bytes this round).
//
// Verdict: 0 clean (population >= 1 tagged entries and every one admitted);
//          1 failed (no tagged entry, or one or more tagged entries not
//          admitted); 2 could-not-evaluate (usage, unresolvable revision,
//          registry absent, malformed --since). Any other nonzero code is
//          undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (24 isolated cases over temporary sandbox
//          repositories; asserts exit code, admitted count and the first
//          reason id; creates and removes its own temp trees under TMPDIR,
//          never touches the lane).
// Frozen by: .ufo/waves/round-30/claims.json claim C2 (counter sha256
//          recorded there before any claim data).
// Pinned values: the CASES table in this file; the round's receipts under
//          --receipts (default corpus/evidence/round-30/frontier).
// Write scope: stdout/stderr only. Production reads committed git blobs
//          (git show <rev>:<path>); it fetches only with --live (read-only
//          GET of each receipt url via curl), never writes the lane,
//          never reads credentials or session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Population: knowledge entries corpus/knowledge/*.md at <rev> whose header
// (first 15 lines) carries the exact line `frontier: <slug>`. An entry is
// ADMITTED iff every check below passes; the first failing check per entry
// is reported by stable id.
//
//   e1-provenance     header has >= 1 `source:` line naming an S-id, plus
//                     `verified-at:` and `recheck:` lines.
//   r1-row-missing    each cited id has a registry row (0-3 leading spaces,
//                     11 cells) in corpus/SOURCES.md.
//   r2-status         the row's status is `mined`.
//   r3-used-by        the row's used-by names this entry's repo path.
//   r4-opened         the row's opened date is >= --since (opened this round).
//   g1-receipt        <receipts>/<id>.json is committed, parses, names the id.
//   g2-url            the row's source cell contains the receipt url.
//   g3-bytes          the receipt's bytes_path is committed and its sha256
//                     equals the receipt sha256; http_status is 200.
//   g4-quote-length   the receipt quote has 1..25 words.
//   g5-quote-located  the quote is a substring of the normalised bytes.
//   g6-gate           the quote appears verbatim in the round lesson (--lesson).
//   g7-refetch        <receipts>/refetch/<id>.json names a seat different from
//                     the receipt's fetched_by, its own committed bytes match
//                     its sha256 with http_status 200, and the quote is a
//                     substring of those normalised bytes.
//   l1-live           only with --live: the receipt url, fetched now (curl,
//                     HTTP 200), still contains the quote after normalisation.
//   l3-live-bytes     only with --live: the live bytes, normalised, equal the
//                     committed bytes, normalised. l1 + l3 tie the committed
//                     bytes to the real source; without --live a
//                     self-consistent fabricated receipt would pass.
//   q1-entry-quote    every double-quoted span of >= 4 words in the entry body
//                     (inline code and fenced blocks excluded) is a substring
//                     of the normalised bytes of one of the entry's cited rows.
//
// Normalisation: HTML bytes (doctype or <html) lose script/style blocks and
// tags, common entities are decoded; every text is whitespace-collapsed.
//
// Counted fields: population, admitted, failing.
//
// Usage:
//   node scripts/check-frontier-admission.mjs --rev <REV> --frontier <slug> --since YYYY-MM-DD
//        [--receipts DIR] [--lesson PATH] [--live] [--json]
//   node scripts/check-frontier-admission.mjs --selftest [--json]
//   node scripts/check-frontier-admission.mjs --repo <dir> ...   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-frontier-admission-v1";
const SELFTEST_SCHEMA = "tabi-frontier-admission-selftest-v1";
const SOURCES_PATH = "corpus/SOURCES.md";
const KNOWLEDGE_DIR = "corpus/knowledge";
const DEFAULT_RECEIPTS = "corpus/evidence/round-30/frontier";
const DEFAULT_LESSON = "corpus/lessons/round-30.md";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

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

function listKnowledge(repo, rev) {
  const r = git(repo, ["ls-tree", "--name-only", `${rev}:${KNOWLEDGE_DIR}`]);
  if (r.status !== 0) return [];
  return r.stdout.toString("utf8").split("\n").filter((n) => n.endsWith(".md")).sort();
}

// ---- parsing ----------------------------------------------------------------------

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
  return t;
}

const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const words = (s) => collapse(s).split(" ").filter(Boolean).length;

function entryQuotes(body) {
  const stripped = body.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  const flat = collapse(stripped);
  const out = [];
  for (const m of flat.matchAll(/"([^"]{1,600}?)"|“([^”]{1,600}?)”/g)) {
    const q = collapse(m[1] ?? m[2]);
    if (words(q) >= 4) out.push(q);
  }
  return out;
}

function headerOf(text) {
  const lines = text.split("\n");
  return { head: lines.slice(0, 15), body: lines.slice(15).join("\n"), all: text };
}

// ---- evaluation -------------------------------------------------------------------------

function fetchLive(url) {
  if (!/^(https:\/\/|file:\/\/)/.test(url)) return null;
  const r = spawnSync("curl", ["-sS", "-L", "--max-time", "60", "-o", "-", "-w", "\n%{http_code}", url], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  const buf = r.stdout;
  const nl = buf.lastIndexOf(10);
  const code = buf.subarray(nl + 1).toString("utf8").trim();
  if (!(code === "200" || (url.startsWith("file://") && code === "000"))) return null;
  return buf.subarray(0, nl);
}

export function evaluate(repo, revArg, { frontier, since, receipts = DEFAULT_RECEIPTS, lesson = DEFAULT_LESSON, live = false }) {
  if (!SLUG_RE.test(frontier || "")) throw new Refusal(`malformed --frontier: ${frontier}`);
  if (!DATE_RE.test(since || "")) throw new Refusal(`malformed --since: ${since}`);
  const rev = resolveRev(repo, revArg);
  const reg = blob(repo, rev, SOURCES_PATH);
  if (reg === null) throw new Refusal(`${SOURCES_PATH} absent at ${rev}`);
  const rows = parseRegistry(reg.toString("utf8"));
  const lessonBuf = blob(repo, rev, lesson);
  const lessonFlat = lessonBuf === null ? null : collapse(lessonBuf.toString("utf8"));
  const tagLine = `frontier: ${frontier}`;
  const cache = new Map();

  const loadReceipt = (id) => {
    if (cache.has(id)) return cache.get(id);
    const res = { reason: null, norm: null };
    const rb = blob(repo, rev, `${receipts}/${id}.json`);
    let rc = null;
    if (rb !== null) { try { rc = JSON.parse(rb.toString("utf8")); } catch { rc = null; } }
    if (!rc || rc.id !== id) { res.reason = "g1-receipt"; cache.set(id, res); return res; }
    const row = rows.get(id);
    if (typeof rc.url !== "string" || !rc.url || !row.source.includes(rc.url)) { res.reason = "g2-url"; cache.set(id, res); return res; }
    const bytes = blob(repo, rev, rc.bytes_path);
    if (bytes === null || rc.http_status !== 200 || sha256(bytes) !== rc.sha256) { res.reason = "g3-bytes"; cache.set(id, res); return res; }
    const q = typeof rc.quote === "string" ? collapse(rc.quote) : "";
    const n = words(q);
    if (n < 1 || n > 25) { res.reason = "g4-quote-length"; cache.set(id, res); return res; }
    const norm = normalise(bytes);
    if (!norm.includes(q)) { res.reason = "g5-quote-located"; cache.set(id, res); return res; }
    if (lessonFlat === null || !lessonFlat.includes(q)) { res.reason = "g6-gate"; cache.set(id, res); return res; }
    const fb = blob(repo, rev, `${receipts}/refetch/${id}.json`);
    let rf = null;
    if (fb !== null) { try { rf = JSON.parse(fb.toString("utf8")); } catch { rf = null; } }
    const rfBytes = rf ? blob(repo, rev, rf.bytes_path) : null;
    const rfOk = rf && rf.id === id && typeof rf.seat === "string" && rf.seat && typeof rc.fetched_by === "string" && rc.fetched_by &&
      rf.seat !== rc.fetched_by && rf.http_status === 200 && rfBytes !== null && sha256(rfBytes) === rf.sha256 && normalise(rfBytes).includes(q);
    if (!rfOk) { res.reason = "g7-refetch"; cache.set(id, res); return res; }
    if (live) {
      const lb = fetchLive(rc.url);
      if (lb === null || !normalise(lb).includes(q)) { res.reason = "l1-live"; cache.set(id, res); return res; }
      if (normalise(lb) !== norm) { res.reason = "l3-live-bytes"; cache.set(id, res); return res; }
    }
    res.norm = norm;
    cache.set(id, res);
    return res;
  };

  const entries = [];
  for (const name of listKnowledge(repo, rev)) {
    const path = `${KNOWLEDGE_DIR}/${name}`;
    const b = blob(repo, rev, path);
    if (b === null) continue;
    const { head, body } = headerOf(b.toString("utf8"));
    if (!head.some((l) => l.trim() === tagLine)) continue;
    const reasons = [];
    const ids = [];
    for (const l of head) {
      const m = /^source:\s*(.*)$/.exec(l.trim());
      if (m) for (const x of m[1].matchAll(/\bS[0-9]{3,}\b/g)) if (!ids.includes(x[0])) ids.push(x[0]);
    }
    const hasVerified = head.some((l) => /^verified-at:\s*\S/.test(l.trim()));
    const hasRecheck = head.some((l) => /^recheck:\s*\S/.test(l.trim()));
    if (!ids.length || !hasVerified || !hasRecheck) reasons.push("e1-provenance");
    const norms = [];
    for (const id of reasons.length ? [] : ids) {
      const row = rows.get(id);
      if (!row) { reasons.push(`r1-row-missing ${id}`); continue; }
      if (row.status !== "mined") { reasons.push(`r2-status ${id}`); continue; }
      const used = row.usedBy.split(/[,;]/).map((p) => p.trim());
      if (!used.includes(path)) { reasons.push(`r3-used-by ${id}`); continue; }
      if (!DATE_RE.test(row.opened) || row.opened < since) { reasons.push(`r4-opened ${id}`); continue; }
      const g = loadReceipt(id);
      if (g.reason) { reasons.push(`${g.reason} ${id}`); continue; }
      norms.push(g.norm);
    }
    if (!reasons.length) {
      for (const q of entryQuotes(body)) {
        if (!norms.some((n) => n.includes(q))) { reasons.push(`q1-entry-quote ${JSON.stringify(q.slice(0, 80))}`); break; }
      }
    }
    entries.push({ path, ids, admitted: reasons.length === 0, reasons });
  }
  const admitted = entries.filter((e) => e.admitted).length;
  return {
    schema: SCHEMA,
    rev,
    frontier,
    since,
    receipts,
    lesson,
    live: Boolean(live),
    population: entries.length,
    admitted,
    failing: entries.length - admitted,
    entries,
    clean: entries.length > 0 && admitted === entries.length,
  };
}

// ---- self-test ---------------------------------------------------------------------------

const SINCE = "2026-10-26";
const URL = "https://example.org/spec.txt";
const SRC_TEXT = "Intro line.\nThe policy field SHOULD remain consistent over a sequence of HTTP\nresponses, while the other field MAY change on every request.\n";
const QUOTE = "SHOULD remain consistent over a sequence of HTTP responses";
const HTML_TEXT = "<!DOCTYPE html><html><head><style>.x{}</style><script>var q=\"hidden words in a script\";</script></head><body><p>A host discloses its budget in <code>X-RateLimit-Limit</code> &amp; friends.</p></body></html>";
const HTML_QUOTE = "A host discloses its budget in X-RateLimit-Limit & friends.";
const ENTRY = "corpus/knowledge/fx-entry.md";

function row(id, { url = URL, status = "mined", opened = SINCE, usedBy = ENTRY, indent = "" } = {}) {
  return `${indent}| ${id} | Fixture spec — ${url} | spec | A | scope | §3 | teaches | ${status} | ${opened} | 180d | ${usedBy} |`;
}

function registry(lines) {
  return ["# SOURCES", "", "## Registry", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");
}

function entry({ ids = ["S001"], tag = "frontier: rate-tos-signal", body = `The draft says the field "${QUOTE}".`, provenance = true } = {}) {
  const head = [`# Fixture entry`, "", ...ids.map((i) => `source: ${i} — ${URL} — §3`)];
  if (provenance) head.push("verified-at: 2026-10-26", "recheck: 180d");
  head.push(tag);
  while (head.length < 15) head.push("");
  return `${head.join("\n")}\n${body}\n`;
}

function std(d, { id = "S001", text = SRC_TEXT, quote = QUOTE, url = URL, seat = "W2-refetch", fetchedBy = "W1-fetch", refetchText, status = 200, lessonQuote, sha } = {}) {
  const bytesPath = `corpus/evidence/round-30/frontier/bytes/${id}.txt`;
  const rfPath = `corpus/evidence/round-30/frontier/refetch/bytes/${id}.txt`;
  d.put(bytesPath, text);
  const rft = refetchText ?? text;
  d.put(rfPath, rft);
  d.put(`${DEFAULT_RECEIPTS}/${id}.json`, JSON.stringify({ id, url, fetched_at: "2026-10-26T00:00:00Z", fetched_by: fetchedBy, http_status: status, bytes_path: bytesPath, sha256: sha ?? sha256(Buffer.from(text)), quote }));
  d.put(`${DEFAULT_RECEIPTS}/refetch/${id}.json`, JSON.stringify({ id, seat, fetched_at: "2026-10-26T01:00:00Z", http_status: 200, bytes_path: rfPath, sha256: sha256(Buffer.from(rft)) }));
  d.put(DEFAULT_LESSON, `# Round 30\n\n## Gate\n\n- ${id}: ${url}, 2026-10-26, "${lessonQuote ?? quote}"\n`);
}

const CASES = [
  { id: "admitted-clean", exit: 0, admitted: 1, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d); } },
  { id: "no-tagged-entry-fails-zero", exit: 1, admitted: 0, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry({ tag: "ground: something" })); std(d); } },
  { id: "provenance-missing", exit: 1, admitted: 0, reason: "e1-provenance", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry({ provenance: false })); std(d); } },
  { id: "row-missing", exit: 1, admitted: 0, reason: "r1-row-missing", build: (d) => { d.put(SOURCES_PATH, registry([row("S002")])); d.put(ENTRY, entry()); std(d); } },
  { id: "indented-row-found", exit: 0, admitted: 1, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([row("S001", { indent: "  " })])); d.put(ENTRY, entry()); std(d); } },
  { id: "status-queued", exit: 1, admitted: 0, reason: "r2-status", build: (d) => { d.put(SOURCES_PATH, registry([row("S001", { status: "queued" })])); d.put(ENTRY, entry()); std(d); } },
  { id: "used-by-omits-entry", exit: 1, admitted: 0, reason: "r3-used-by", build: (d) => { d.put(SOURCES_PATH, registry([row("S001", { usedBy: "corpus/knowledge/other.md" })])); d.put(ENTRY, entry()); std(d); } },
  { id: "opened-before-round", exit: 1, admitted: 0, reason: "r4-opened", build: (d) => { d.put(SOURCES_PATH, registry([row("S001", { opened: "2026-10-23" })])); d.put(ENTRY, entry()); std(d); } },
  { id: "receipt-missing", exit: 1, admitted: 0, reason: "g1-receipt", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); d.put(DEFAULT_LESSON, `"${QUOTE}"`); } },
  { id: "receipt-url-not-in-row", exit: 1, admitted: 0, reason: "g2-url", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { url: "https://example.org/other.txt" }); } },
  { id: "bytes-sha-mismatch", exit: 1, admitted: 0, reason: "g3-bytes", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { sha: "0".repeat(64) }); } },
  { id: "http-status-not-200", exit: 1, admitted: 0, reason: "g3-bytes", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { status: 404 }); } },
  { id: "quote-over-25-words", exit: 1, admitted: 0, reason: "g4-quote-length", build: (d) => { const long = Array.from({ length: 26 }, (_, i) => `w${i}`).join(" "); d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { text: `${long}\n`, quote: long }); } },
  { id: "quote-not-in-bytes", exit: 1, admitted: 0, reason: "g5-quote-located", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { quote: "SHOULD remain stable over a sequence of HTTP responses" }); } },
  { id: "quote-not-in-lesson-gate", exit: 1, admitted: 0, reason: "g6-gate", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { lessonQuote: "something else entirely here" }); } },
  { id: "refetch-same-seat", exit: 1, admitted: 0, reason: "g7-refetch", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { seat: "W1-fetch" }); } },
  { id: "refetch-bytes-lack-quote", exit: 1, admitted: 0, reason: "g7-refetch", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry()); std(d, { refetchText: "a different page\n" }); } },
  { id: "entry-quote-fabricated", exit: 1, admitted: 0, reason: "q1-entry-quote", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry({ body: `The draft says "${QUOTE}" and also "servers MUST always publish a policy".` })); std(d); } },
  { id: "entry-quote-in-code-span-ignored", exit: 0, admitted: 1, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry({ body: "Example: `RateLimit-Policy: \"burst q one hundred per sixty\"` is a header." })); std(d); } },
  { id: "html-normalised-quote-located", exit: 0, admitted: 1, reason: null, build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); d.put(ENTRY, entry({ body: `The page says "${HTML_QUOTE}"` })); std(d, { text: HTML_TEXT, quote: HTML_QUOTE }); } },
  { id: "live-file-url-located", exit: 0, admitted: 1, reason: null, live: true, build: (d) => { const u = `file://${d.root}/live-source.txt`; d.put("live-source.txt", SRC_TEXT); d.put(SOURCES_PATH, registry([row("S001", { url: u })])); d.put(ENTRY, entry()); std(d, { url: u }); } },
  { id: "live-file-url-quote-gone", exit: 1, admitted: 0, reason: "l1-live", live: true, build: (d) => { const u = `file://${d.root}/live-source.txt`; d.put("live-source.txt", "the source changed\n"); d.put(SOURCES_PATH, registry([row("S001", { url: u })])); d.put(ENTRY, entry()); std(d, { url: u }); } },
  { id: "live-bytes-differ-from-committed", exit: 1, admitted: 0, reason: "l3-live-bytes", live: true, build: (d) => { const u = `file://${d.root}/live-source.txt`; const fab = `${SRC_TEXT}Servers MUST always publish a policy field.\n`; d.put("live-source.txt", SRC_TEXT); d.put(SOURCES_PATH, registry([row("S001", { url: u })])); d.put(ENTRY, entry({ body: `The draft says "${QUOTE}" and "Servers MUST always publish a policy field."` })); std(d, { url: u, text: fab, refetchText: fab }); } },
  { id: "bad-rev-could-not-evaluate", exit: 2, admitted: null, reason: null, rev: "no such rev!", build: (d) => { d.put(SOURCES_PATH, registry([row("S001")])); } },
];

function makeFixture(base) {
  const root = mkdtempSync(join(base, "fx-"));
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
  const base = mkdtempSync(join(tmpdir(), "tabi-frontier-admission-selftest-"));
  const results = [];
  try {
    for (const c of CASES) {
      const fx = makeFixture(base);
      try {
        c.build(fx);
        const head = fx.commit();
        let exit;
        let out;
        try {
          out = evaluate(fx.root, c.rev ?? head, { frontier: "rate-tos-signal", since: SINCE, live: Boolean(c.live) });
          exit = out.clean ? 0 : 1;
        } catch (e) {
          if (!(e instanceof Refusal)) throw e;
          exit = 2;
          out = { admitted: null, entries: [], refusal: e.message };
        }
        const first = out.entries.flatMap((e) => e.reasons)[0] ?? null;
        const firstId = first ? first.split(" ")[0] : null;
        const ok = exit === c.exit && out.admitted === c.admitted && firstId === c.reason;
        results.push({ id: c.id, ok, expectedExit: c.exit, exit, admitted: out.admitted, reason: first, refusal: out.refusal ?? null });
      } finally {
        rmSync(fx.root, { recursive: true, force: true });
      }
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli ---------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, repo: LANE, frontier: null, since: null, receipts: DEFAULT_RECEIPTS, lesson: DEFAULT_LESSON, live: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--live") opts.live = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else if (a === "--frontier") opts.frontier = argv[++i];
    else if (a === "--since") opts.since = argv[++i];
    else if (a === "--receipts") opts.receipts = argv[++i];
    else if (a === "--lesson") opts.lesson = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`FRONTIER_ADMISSION verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-frontier-admission.mjs --rev <REV> --frontier <slug> --since YYYY-MM-DD [--receipts DIR] [--lesson PATH] [--live] [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} admitted=${r.admitted ?? "-"} reason=${r.reason ?? "-"}${r.refusal ? ` refusal=${r.refusal}` : ""} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`FRONTIER_ADMISSION_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev || !opts.frontier || !opts.since) {
    console.error("FRONTIER_ADMISSION verdict=could-not-evaluate detail=usage: --rev <REV> --frontier <slug> --since YYYY-MM-DD, or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev, opts);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`FRONTIER_ADMISSION verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const e of out.entries) console.log(`ENTRY path=${e.path} ids=${e.ids.join(",")} ${e.admitted ? "ADMITTED" : `NOT-ADMITTED reasons=${e.reasons.join(";")}`}`);
    console.log(`FRONTIER_ADMISSION verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} frontier=${out.frontier} since=${out.since} live=${out.live} population=${out.population} admitted=${out.admitted} failing=${out.failing}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
