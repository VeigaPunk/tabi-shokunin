import { readFileSync } from "node:fs";
const S = "/fast/scratch/hyaku/tabi-r30/RefetchLiveS117";
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
const entry = readFileSync(`${S}/clone/corpus/knowledge/host-published-rate-limit-headers.md`, "utf8");
const qs = entryQuotes(entry.split("\n").slice(15).join("\n"));
const live = readFileSync(`${S}/live.norm.txt`, "utf8");
const rc = JSON.parse(readFileSync(`${S}/clone/corpus/evidence/round-30/frontier/S117.json`, "utf8")).quote;
const count = (h, n) => h.split(n).length - 1;
console.log("receipt quote occurrences in live normalised:", count(live, rc), "words:", words(rc));
let dup = 0;
for (const q of qs) { const c = count(live, q); if (c !== 1) { dup++; console.log("occurrences", c, "::", q.slice(0,70)); } }
console.log("spans:", qs.length, "non-unique:", dup);
console.log("committed occurrences of receipt quote:", count(readFileSync(`${S}/committed.norm.txt`,"utf8"), rc));
