#!/usr/bin/env node
// row-metrics.mjs — supplementary per-row metrics for tabi round 31 C1.
//
// This is EVIDENCE beside the frozen counter, not a predicate: it admits
// nothing, changes no gate and decides no claim. It reads the same entry at
// the same revision the counter reads, with the same normalisation (the
// normalise/parseTable/quoteSpans/numbersIn/UNIT_RE/NUMBER_WORDS/HEADER
// snippets are extracted textually from the counter blob at --rev, so the
// bytes are normalised by the counter's own code, not by a re-implementation),
// and reports five per-row measurements the counter does not have:
//
//   unit_in_quote            a plain synonym of the threshold's unit word
//                            occurs in the located quote (s/second, min/minute,
//                            h/hour, KiB/kibibytes, requests/request,
//                            redirects/redirect, points, concurrent)
//   bound_in_quote           the bound word of the threshold cell (at least /
//                            more than / no more than) occurs in the quote;
//                            "none" when the threshold cell carries no bound
//   number_in_quote          the threshold's number occurs in the quote
//   number_only_as_quantity  it occurs exactly once, so the quote has no
//                            second use of the same number; every other
//                            occurrence and every other number in the quote
//                            is listed
//   unit_adjacent_to_number  (supplementary) a unit synonym sits within the
//                            three words after the threshold number's
//                            occurrence — i.e. the source attaches that unit
//                            to that number
//   denominator_in_quote     (supplementary) the quote gives a rate ("per …")
//                            the threshold cell drops
//
// Totals: distinct (source, quote) pairs, distinct (source, threshold, unit)
// triples (and the bound-refined quads), plus the per-metric failing rows.
//
// Write scope: stdout and --json-out. Reads git blobs (git show <rev>:<path>)
// or, with --entry-file, one file; never the network; never the lane.
//
// Usage:
//   node row-metrics.mjs --repo <dir> --rev <REV> --entry corpus/knowledge/<x>.md
//        [--receipts DIR] [--entry-file <abs path>] [--json-out <path>]
//   node row-metrics.mjs ... --entry-file <abs path> --entry <in-repo path used
//        only for the reported label>
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const COUNTER_PATH = "scripts/check-decision-table.mjs";
const DEFAULT_RECEIPTS = "corpus/evidence/round-31/decision-table";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ---- argv -------------------------------------------------------------------

function parseArgs(argv) {
  const o = { receipts: DEFAULT_RECEIPTS, counter: COUNTER_PATH };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument: ${a}`);
    const v = argv[i + 1];
    switch (a) {
      case "--repo": o.repo = v; i += 1; break;
      case "--rev": o.rev = v; i += 1; break;
      case "--entry": o.entry = v; i += 1; break;
      case "--entry-file": o.entryFile = v; i += 1; break;
      case "--receipts": o.receipts = v; i += 1; break;
      case "--json-out": o.jsonOut = v; i += 1; break;
      default: throw new Error(`unknown option: ${a}`);
    }
  }
  if (!o.repo || !o.rev || !o.entry) throw new Error("usage: --repo <dir> --rev <REV> --entry <path> [--entry-file <path>] [--receipts DIR] [--json-out <path>]");
  return o;
}

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  return spawnSync("git", ["-C", repo, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
}
function blob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}
function resolveRev(repo, rev) {
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Error(`unresolvable revision: ${rev}`);
  return r.stdout.toString("utf8").trim();
}

// ---- extract the counter's own helpers --------------------------------------
// Textual extraction keeps the normalisation identical to the counter's. A
// re-implementation would drift; a copy would silently diverge on upgrade.

function grabBraced(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error(`counter marker missing: ${marker}`);
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let k = open; k < src.length; k += 1) {
    if (src[k] === "{") depth += 1;
    else if (src[k] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(i, k + 1);
    }
  }
  throw new Error(`unbalanced block: ${marker}`);
}
function grabLine(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error(`counter marker missing: ${marker}`);
  const end = src.indexOf("\n", i);
  const line = src.slice(i, end === -1 ? src.length : end);
  if (!line.trimEnd().endsWith(";")) throw new Error(`not a single-line statement: ${marker}`);
  return line;
}

function loadCounterHelpers(src) {
  const parts = [
    grabBraced(src, "const ENTITIES ="),
    grabBraced(src, "export function normalise("),
    grabBraced(src, "const NUMBER_WORDS ="),
    grabLine(src, "const collapse ="),
    grabLine(src, "const UNIT_RE ="),
    grabLine(src, "const HEADER ="),
    grabBraced(src, "function splitRow("),
    grabBraced(src, "export function parseTable("),
    grabBraced(src, "function quoteSpans("),
    grabBraced(src, "function numbersIn("),
  ].map((s) => s.replace(/^export /, ""));
  // eslint-disable-next-line no-new-func
  return new Function(`${parts.join("\n;\n")}\n;return { normalise, NUMBER_WORDS, UNIT_RE, HEADER, splitRow, parseTable, quoteSpans, numbersIn };`)();
}

// ---- unit families (the plain synonyms named in the assignment) -------------

const FAMILIES = {
  s: ["seconds", "second", "secs", "sec"],
  min: ["minutes", "minute", "mins", "min"],
  h: ["hours", "hour", "hrs", "hr"],
  day: ["days", "day"],
  kib: ["kibibytes", "kibibyte", "kib"],
  mib: ["mebibytes", "mebibyte", "mib"],
  byte: ["bytes", "byte"],
  request: ["requests", "request"],
  redirect: ["redirects", "redirect"],
  point: ["points", "point"],
  attempt: ["attempts", "attempt"],
  retry: ["retries", "retry"],
  concurrent: ["concurrent"],
};

function familyOf(unit) {
  const u = String(unit).toLowerCase();
  if (u === "s" || u.startsWith("sec")) return "s";
  if (u.startsWith("min")) return "min";
  if (u === "h" || u.startsWith("hour") || u === "hr" || u === "hrs") return "h";
  if (u.startsWith("day")) return "day";
  if (u === "kib" || u.startsWith("kibib")) return "kib";
  if (u === "mib" || u.startsWith("mebib")) return "mib";
  if (u.startsWith("byte")) return "byte";
  if (u.startsWith("request")) return "request";
  if (u.startsWith("redirect")) return "redirect";
  if (u.startsWith("point")) return "point";
  if (u.startsWith("attempt")) return "attempt";
  if (u.startsWith("retr")) return "retry";
  if (u === "concurrent") return "concurrent";
  return null;
}

const BOUNDS = [
  ["no more than", "no more than"],
  ["at least", "at least"],
  ["at most", "at most"],
  ["more than", "more than"],
  ["less than", "less than"],
  ["up to", "up to"],
];

function parseThresholdCell(cell) {
  const lower = cell.toLowerCase();
  let bound = null;
  for (const [needle, label] of BOUNDS) {
    if (lower.trimStart().startsWith(needle)) { bound = label; break; }
  }
  const m = /\b(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s+([A-Za-z]+)/.exec(cell);
  if (!m) return null;
  return { text: cell.trim(), numberText: m[1], number: Number(m[1].replace(/,/g, "")), unit: m[2], bound };
}

// ---- occurrences ------------------------------------------------------------

function occurrences(quote, number, numberWords) {
  const out = [];
  const digitRe = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)/g;
  for (const m of quote.matchAll(digitRe)) {
    const v = Number(m[1].replace(/,/g, ""));
    out.push({ kind: "digit", text: m[1], value: v, index: m.index, end: m.index + m[1].length });
  }
  const lower = quote.toLowerCase();
  for (const [word, v] of Object.entries(numberWords)) {
    const re = new RegExp(`(^|[^a-z0-9-])${word}([^a-z0-9-]|$)`, "g");
    for (const m of lower.matchAll(re)) {
      const idx = m.index + m[1].length;
      out.push({ kind: "word", text: word, value: v, index: idx, end: idx + word.length });
    }
  }
  out.sort((a, b) => a.index - b.index);
  const snippet = (i) => quote.slice(Math.max(0, i - 26), Math.min(quote.length, i + 34)).trim();
  for (const o of out) o.snippet = snippet(o.index);
  return { all: out, hits: out.filter((o) => o.value === number) };
}

function wordsAfter(quote, index, n) {
  return quote.slice(index).split(/\s+/).filter(Boolean).slice(0, n);
}

// ---- main -------------------------------------------------------------------

function run(argv) {
  const o = parseArgs(argv);
  const repo = o.repo;
  const rev = resolveRev(repo, o.rev);
  const counterBytes = blob(repo, rev, o.counter);
  if (counterBytes === null) throw new Error(`${o.counter} absent at ${rev}`);
  const counterSha = sha256(counterBytes);
  const H = loadCounterHelpers(counterBytes.toString("utf8"));

  const entryBytes = o.entryFile ? readFileSync(o.entryFile) : blob(repo, rev, o.entry);
  if (entryBytes === null) throw new Error(`entry absent at ${rev}: ${o.entry}`);
  const table = H.parseTable(entryBytes.toString("utf8"));
  if (!table) throw new Error("no table with the counter's header in the entry");

  const receiptCache = new Map();
  const loadNorm = (id) => {
    if (receiptCache.has(id)) return receiptCache.get(id);
    const res = { norm: null, problem: null, url: null, sha256: null };
    const rb = blob(repo, rev, `${o.receipts}/${id}.json`);
    let rc = null;
    if (rb !== null) { try { rc = JSON.parse(rb.toString("utf8")); } catch { rc = null; } }
    if (!rc || rc.id !== id) res.problem = "receipt-absent-or-malformed";
    else {
      const bytes = blob(repo, rev, rc.bytes_path);
      res.sha256 = rc.sha256 ?? null;
      res.url = rc.url ?? null;
      if (bytes === null) res.problem = "bytes-absent";
      else if (rc.http_status !== 200) res.problem = `http_status=${rc.http_status}`;
      else if (sha256(bytes) !== rc.sha256) res.problem = "sha256-mismatch";
      else res.norm = H.normalise(bytes);
    }
    receiptCache.set(id, res);
    return res;
  };

  const rows = [];
  for (const { line, cells } of table.rows) {
    const [rowId, , decision, thresholdCell, source, quoteCell] = cells;
    const t = parseThresholdCell(thresholdCell);
    const spans = H.quoteSpans(quoteCell);
    const quote = spans.length === 1 ? spans[0] : null;
    const rec = loadNorm(source);
    const located = Boolean(quote && rec.norm && rec.norm.includes(quote));
    const fam = t ? familyOf(t.unit) : null;
    const syn = fam ? FAMILIES[fam] : null;
    const lowerQuote = quote ? quote.toLowerCase() : "";
    const unitHits = quote && syn
      ? syn.filter((w) => new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`).test(lowerQuote))
      : [];
    const boundOther = quote
      ? BOUNDS.map(([n]) => n).filter((b) => b !== t?.bound && !(t?.bound ?? "").includes(b)
          && new RegExp(`(^|[^a-z0-9])${b}([^a-z0-9]|$)`).test(lowerQuote))
      : [];
    const occ = quote && t ? occurrences(quote, t.number, H.NUMBER_WORDS) : { all: [], hits: [] };
    const firstHit = occ.hits[0] ?? null;
    const after = quote && firstHit ? wordsAfter(quote, firstHit.end, 3).map((x) => x.replace(/[^A-Za-z]/g, "").toLowerCase()) : [];
    const unitAdjacent = Boolean(syn) && after.some((w) => syn.includes(w));
    const perMatch = quote ? /\bper\s+(\S+(?:\s+\S+){0,2})/.exec(quote) : null;
    const otherNumbers = [];
    for (const x of occ.all) {
      if (x.value === t?.number) continue;
      const key = String(x.value);
      const hit = otherNumbers.find((z) => z.value === x.value);
      if (hit) hit.occurrences.push(x.snippet);
      else otherNumbers.push({ value: x.value, occurrences: [x.snippet] });
    }
    const extraSame = occ.hits.slice(1).map((x) => x.snippet);
    // Force: the modal the Decision cell names, the modals the quote carries as
    // RFC 2119 capitals, and the entry's own `(derived)` marker rule.
    const MODAL_RE = /\b(MUST NOT|SHOULD NOT|MUST|SHOULD|MAY)\b/g;
    const declaredModals = [...new Set([...String(decision).matchAll(MODAL_RE)].map((m) => m[1]))];
    const quotedModals = quote ? [...new Set([...quote.matchAll(MODAL_RE)].map((m) => m[1]))] : [];
    const derivedMarker = /\(derived\)/i.test(String(decision));
    const forceConsistent = derivedMarker
      ? quotedModals.length === 0
      : declaredModals.every((m) => quotedModals.includes(m));
    const lowerDirective = quote ? /\b(?:should|must|may|wait|do not|avoid|use)\b/.test(quote.toLowerCase()) : false;
    rows.push({
      row: rowId,
      line,
      source,
      decision_verb: String(decision).trim().split(/\s+/)[0],
      threshold_cell: thresholdCell.trim(),
      threshold: t ? { number: t.number, as_written: t.numberText, unit: t.unit, unit_family: fam, bound: t.bound } : null,
      quote,
      quote_words: quote ? quote.split(/\s+/).filter(Boolean).length : 0,
      quote_located_in_receipt: located,
      receipt_problem: rec.problem,
      metrics: {
        unit_in_quote: unitHits.length > 0,
        unit_synonyms_found: unitHits,
        bound_in_quote: t?.bound ? lowerQuote.includes(t.bound) : "none",
        bound_other_in_quote: boundOther,
        number_in_quote: occ.hits.length > 0,
        number_occurrences: occ.hits.length,
        number_only_as_quantity: occ.hits.length === 1,
        number_other_occurrences: extraSame,
        other_numbers_in_quote: otherNumbers,
        unit_adjacent_to_number: unitAdjacent,
        words_after_number: after,
        denominator_in_quote: perMatch ? `per ${perMatch[1].trim()}` : null,
        denominator_in_threshold: /\bper\b/i.test(thresholdCell),
        force_declared_modals: declaredModals,
        force_quoted_capitals: quotedModals,
        force_derived_marker: derivedMarker,
        force_quote_has_lower_directive: lowerDirective,
        force_consistent: forceConsistent,
      },
      counter_numbersIn_has_threshold: quote && t ? H.numbersIn(quote).has(t.number) : null,
    });
  }

  const distinct = (fn) => new Set(rows.map(fn)).size;
  const fail = (pred) => rows.filter((r) => !pred(r)).map((r) => r.row);
  const totals = {
    rows: rows.length,
    sources: [...new Set(rows.map((r) => r.source))].sort(),
    distinct_quotes: distinct((r) => r.quote),
    distinct_source_quote_pairs: distinct((r) => `${r.source}\u0000${r.quote}`),
    distinct_source_threshold_unit_triples: distinct((r) => `${r.source}\u0000${r.threshold?.number}\u0000${r.threshold?.unit_family}`),
    distinct_source_threshold_unit_bound_quads: distinct((r) => `${r.source}\u0000${r.threshold?.number}\u0000${r.threshold?.unit_family}\u0000${r.threshold?.bound}`),
    distinct_threshold_number_unit_pairs: distinct((r) => `${r.threshold?.number}\u0000${r.threshold?.unit_family}`),
    failing_rows: {
      unit_in_quote: fail((r) => r.metrics.unit_in_quote),
      bound_in_quote: fail((r) => (r.metrics.bound_in_quote === "none" ? true : r.metrics.bound_in_quote === true)),
      number_in_quote: fail((r) => r.metrics.number_in_quote),
      number_only_as_quantity: fail((r) => r.metrics.number_only_as_quantity),
      unit_adjacent_to_number: fail((r) => r.metrics.unit_adjacent_to_number),
      denominator_dropped: rows.filter((r) => r.metrics.denominator_in_quote && !r.metrics.denominator_in_threshold).map((r) => r.row),
      force_consistent: fail((r) => r.metrics.force_consistent),
      force_derived_rows: rows.filter((r) => r.metrics.force_derived_marker).map((r) => r.row),
    },
  };

  return {
    schema: "tabi-round-31-row-metrics-v1",
    purpose: "supplementary row metrics beside the frozen counter; admits nothing, decides no claim",
    repo,
    rev,
    entry: o.entry,
    entry_file: o.entryFile ?? null,
    entry_sha256: sha256(entryBytes),
    receipts: o.receipts,
    counter: o.counter,
    counter_sha256: counterSha,
    normalisation: "extracted textually from the counter blob at --rev (normalise, parseTable, quoteSpans, numbersIn, UNIT_RE, NUMBER_WORDS, HEADER)",
    table_header_line: table.headerLine,
    rows,
    totals,
  };
}

function main() {
  let out;
  try {
    out = run(process.argv.slice(2));
  } catch (e) {
    console.error(`ROW_METRICS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  const json = JSON.stringify(out, null, 2);
  if (out.entry_file && process.env.ROW_METRICS_JSON_OUT === undefined) { /* no-op */ }
  const outFile = (() => {
    const i = process.argv.indexOf("--json-out");
    return i > 0 ? process.argv[i + 1] : null;
  })();
  if (outFile) writeFileSync(outFile, `${json}\n`);
  console.log(json);
  process.exit(0);
}

main();
