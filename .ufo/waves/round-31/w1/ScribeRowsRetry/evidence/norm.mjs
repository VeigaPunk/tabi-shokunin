import { readFileSync } from "node:fs";
// Extracted verbatim from scripts/check-decision-table.mjs (frozen 9505a10).
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
const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-four": 24, thirty: 30, sixty: 60, ninety: 90, hundred: 100 };
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const words = (s) => collapse(s).split(" ").filter(Boolean).length;
function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) out.add(Number(m[0].replace(/,/g, "")));
  const lower = text.toLowerCase();
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(lower)) out.add(n);
  }
  return out;
}
const UNIT_RE = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i;
if (process.argv[2] === "--check") {
  const norm = normalise(readFileSync(process.argv[3]));
  const checks = JSON.parse(readFileSync(process.argv[4], "utf8"));
  let bad = 0;
  for (const c of checks) {
    const tm = UNIT_RE.exec(c.threshold);
    const tnum = tm ? Number(tm[1].replace(/,/g, "")) : null;
    const located = norm.includes(c.quote);
    const wc = words(c.quote);
    const numOk = tnum !== null && numbersIn(c.quote).has(tnum);
    const ok = located && wc >= 6 && wc <= 25 && numOk;
    if (!ok) bad += 1;
    console.log(`${c.row} quote_words=${wc} located=${located} threshold=${c.threshold} tnum=${tnum} number_in_quote=${numOk} ${ok ? "PASS" : "FAIL"}`);
    if (!located) {
      const i = norm.indexOf(c.quote.slice(0, 40));
      console.log(`  first-40-char index ${i}; context: ${i >= 0 ? JSON.stringify(norm.slice(i, i + 160)) : "n/a"}`);
    }
  }
  console.log(`total=${checks.length} failures=${bad}`);
  process.exit(bad ? 1 : 0);
}
const norm = normalise(readFileSync(process.argv[2]));
const a = Number(process.argv[3] || 0), b = Number(process.argv[4] || 0);
if (a || b) console.log(norm.slice(a, b)); else console.log(norm.slice(norm.indexOf("429 Too Many Requests") - 400, norm.indexOf("429 Too Many Requests") + 1600));
