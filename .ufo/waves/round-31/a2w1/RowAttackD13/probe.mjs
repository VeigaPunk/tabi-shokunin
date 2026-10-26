// Word-number scan + targeted S121/S122 probes + cross-row uniqueness.
import { readFileSync } from "node:fs";
const CLONE = "/fast/scratch/hyaku/tabi-r31/RowAttackD13/clone";
const FETCH = "/fast/scratch/hyaku/tabi-r31/RowAttackD13/fetch";
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
const n = {};
for (const id of ["S119", "S120", "S121", "S122"]) n[id] = normalise(readFileSync(`${FETCH}/${id}.body`));

// 1. word-number + unit scan (NUMBER_WORDS x time/size units), all four sources
const WORDS = "zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|twenty-four|thirty|sixty|ninety|hundred";
const UNITW = "(?:kibibytes|mebibytes|KiB|MiB|bytes?|seconds?|minutes?|hours?|days?)";
const wrx = new RegExp(`\\b(?:${WORDS})\\s+${UNITW}\\b`, "gi");
for (const id of ["S119", "S120", "S121", "S122"]) {
  const seen = new Set();
  for (const m of n[id].matchAll(wrx)) {
    if (seen.has(m[0].toLowerCase())) continue;
    seen.add(m[0].toLowerCase());
    const i = m.index;
    console.log(`WORDNUM ${id}: ${m[0]}  …${n[id].slice(Math.max(0, i - 110), i + m[0].length + 90)}…`);
  }
}
console.log("---- targeted probes S121 ----");
for (const probe of ["content", "80 ", "500 requests", "2,000 requests", "30 requests", "Search", "OAuth app", "CPU time", "total response time", "calculating", "Calculating", "exponential", "ban ", "banned", "integra", "Content-generating", "Create content"]) {
  const i = n.S121.toLowerCase().indexOf(probe.toLowerCase());
  console.log(`S121 probe [${probe}] at=${i}` + (i >= 0 ? ` …${n.S121.slice(Math.max(0, i - 130), i + 170)}…` : ""));
}
console.log("---- targeted probes S122 ----");
for (const probe of ["poll", "Poll", "one minute", "one second", "exponential", "Conditional", "redirect", "301", "307", "etag", "If-None-Match", "back-off", "Back off", "2000", "2,000", "3,000"]) {
  const i = n.S122.toLowerCase().indexOf(probe.toLowerCase());
  console.log(`S122 probe [${probe}] at=${i}` + (i >= 0 ? ` …${n.S122.slice(Math.max(0, i - 130), i + 170)}…` : ""));
}
console.log("---- cross-row uniqueness ----");
const entry = readFileSync(`${CLONE}/corpus/knowledge/rate-signal-decision-table.md`, "utf8");
const lines = entry.split("\n");
const rows = [];
for (const line of lines) {
  const t = line.trim();
  if (!t.startsWith("| D")) continue;
  const c = t.slice(1, -1).split("|").map((x) => x.trim());
  if (c.length === 6) rows.push(c);
}
const quotes = rows.map((r) => (r[5].match(/"([^"]+)"/) || [])[1]);
const thrs = rows.map((r) => r[3]);
console.log("rows=" + rows.length, "distinctQuotes=" + new Set(quotes).size, "distinctThresholds=" + new Set(thrs).size, "distinctSources=" + new Set(rows.map((r) => r[4])).size);
for (let i = 0; i < rows.length; i++) console.log(`${rows[i][0]} src=${rows[i][4]} thr=[${thrs[i]}] qLen=${(quotes[i] || "").length}`);
// duplicate threshold-pair check (same number+unit)
const pairs = rows.map((r) => [r[0], (r[3].match(/\d[\d,\.]*/) || [""])[0], (r[3].match(/[A-Za-z]+.*$/) || [""])[0].replace(/^at least |^more than |^no more than /, "")]);
const byVal = {};
for (const [id, num, unit] of pairs) { const k = `${num}|${unit}`; (byVal[k] ||= []).push(id); }
for (const [k, v] of Object.entries(byVal)) if (v.length > 1) console.log(`SHARED threshold number+unit ${k}: ${v.join(",")}`);
