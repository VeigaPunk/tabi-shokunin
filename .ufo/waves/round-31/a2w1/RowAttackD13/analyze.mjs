// RowAttackD13 analysis: transcription of normalise/parseTable/quoteSpans/numbersIn
// from scripts/check-decision-table.mjs at 486048356f0712e4396588c9dab58cd419243120
// (import is impossible: the counter's main() process.exit()s on load).
import { readFileSync, writeFileSync } from "node:fs";

const CLONE = "/fast/scratch/hyaku/tabi-r31/RowAttackD13/clone";
const FETCH = "/fast/scratch/hyaku/tabi-r31/RowAttackD13/fetch";

// verbatim transcription (counter lines 92-196)
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };
function normalise(buf) {
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
const HEADER = ["row", "signal", "decision", "threshold", "source", "located quote"];
function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  return t.slice(1, -1).split("|").map((c) => c.trim());
}
function parseTable(text) {
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
const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-four": 24, thirty: 30, sixty: 60, ninety: 90, hundred: 100 };
function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) out.add(Number(m[0].replace(/,/g, "")));
  const lower = text.toLowerCase();
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(lower)) out.add(n);
  }
  return out;
}

const entry = readFileSync(`${CLONE}/corpus/knowledge/rate-signal-decision-table.md`, "utf8");
const table = parseTable(entry);
if (!table) { console.error("TABLE NOT FOUND"); process.exit(9); }

const receipts = {};
for (const id of ["S119", "S120", "S121", "S122"]) {
  const r = JSON.parse(readFileSync(`${CLONE}/corpus/evidence/round-31/decision-table/${id}.json`, "utf8"));
  receipts[id] = { url: r.url, norm: normalise(readFileSync(`${CLONE}/${r.bytes_path}`)) };
}
const live = {};
for (const id of ["S119", "S120", "S121", "S122"]) {
  live[id] = { norm: normalise(readFileSync(`${FETCH}/${id}.body`)) };
}

const out = [];
out.push(`table headerLine=${table.headerLine} rows=${table.rows.length}`);
for (const row of table.rows) {
  const [rowId, signal, decision, threshold, source, quoteCell] = row.cells;
  const spans = quoteSpans(quoteCell);
  const tm = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i.exec(threshold);
  for (const q of spans) {
    const rec = receipts[source], lv = live[source];
    const inRec = rec.norm.includes(q), inLive = lv.norm.includes(q);
    const recIdx = rec.norm.indexOf(q), liveIdx = lv.norm.indexOf(q);
    const ctx = (s, i) => s.slice(Math.max(0, i - 550), Math.min(s.length, i + q.length + 550));
    out.push(`\n===== ${rowId} src=${source} entryLine=${row.line}`);
    out.push(`SIGNAL: ${signal}`);
    out.push(`DECISION: ${decision}`);
    out.push(`THRESHOLD: ${threshold}  parsed_number=${tm ? tm[1] : "NONE"} parsed_unit=${tm ? tm[3] : "NONE"}`);
    out.push(`QUOTE(${words(q)}w): ${q}`);
    out.push(`inReceiptBytes=${inRec} inLiveBytes=${inLive} thresholdNumberInQuote=${numbersIn(q).has(tm ? Number(tm[1].replace(/,/g, "")) : NaN)}`);
    if (inRec) out.push(`RECEIPT CTX: …${ctx(rec.norm, recIdx)}…`);
    if (inLive) out.push(`LIVE CTX: …${ctx(lv.norm, liveIdx)}…`);
    if (!inLive) out.push(`!! QUOTE ABSENT FROM LIVE ${source} BYTES (normalised)`);
  }
}

// Number+unit inventory per source from live bytes, for the omission scan.
const UNIT_SCAN = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(KiB|MiB|kibibytes|mebibytes|bytes?|seconds?|minutes?|hours?|days?|requests?|redirects?|points?|concurrent|retries?|attempts?|per second|per minute|per hour|per day)/gi;
for (const id of ["S119", "S120", "S121", "S122"]) {
  const n = live[id].norm;
  const seen = new Set();
  const hits = [];
  for (const m of n.matchAll(UNIT_SCAN)) {
    if (seen.has(m[0])) continue;
    seen.add(m[0]);
    const i = m.index;
    hits.push(`  ${m[0]}  …${n.slice(Math.max(0, i - 100), i + m[0].length + 80).replace(/\s+/g, " ")}…`);
  }
  out.push(`\n##### NUMBER+UNIT INVENTORY ${id} (${hits.length} unique)`);
  out.push(hits.join("\n"));
}
writeFileSync("/fast/scratch/hyaku/tabi-r31/RowAttackD13/analysis.txt", out.join("\n"));
console.log("rows=" + table.rows.length, "quoteBlocks=" + out.filter(l => l.startsWith("=====")).length, "inventorySources=4");
