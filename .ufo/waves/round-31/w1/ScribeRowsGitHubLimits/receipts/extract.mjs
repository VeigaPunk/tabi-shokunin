import { readFileSync } from "node:fs";
const src = readFileSync(new URL("./clone/scripts/check-decision-table.mjs", import.meta.url), "utf8");
const lines = src.split("\n");
const start = lines.findIndex((l) => l.startsWith("export function normalise(buf) {"));
if (start < 0) throw new Error("normalise not found");
let end = -1;
for (let i = start + 1; i < lines.length; i += 1) { if (lines[i] === "}") { end = i; break; } }
if (end < 0) throw new Error("normalise end not found");
const entIdx = lines.findIndex((l) => l.startsWith("const ENTITIES = "));
if (entIdx < 0) throw new Error("ENTITIES not found");
const body = [lines[entIdx], ...lines.slice(start, end + 1).map((l) => l.replace(/^export /, ""))].join("\n");
const factory = new Function(`${body}\nreturn { normalise, ENTITIES };`);
const { normalise, ENTITIES } = factory();
export { normalise, ENTITIES };
export const extractedLines = { entIdx: entIdx + 1, start: start + 1, end: end + 1 };
export const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
export const words = (s) => collapse(s).split(" ").filter(Boolean).length;
export const UNIT_RE = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i;
export const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-four": 24, thirty: 30, sixty: 60, ninety: 90, hundred: 100 };
export function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) out.add(Number(m[0].replace(/,/g, "")));
  const lower = text.toLowerCase();
  for (const [w, n] of Object.entries(NUMBER_WORDS)) if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(lower)) out.add(n);
  return out;
}
