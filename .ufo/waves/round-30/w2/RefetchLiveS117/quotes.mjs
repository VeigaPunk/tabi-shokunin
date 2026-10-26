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
const lines = entry.split("\n");
const body = lines.slice(15).join("\n");
const live = readFileSync(`${S}/live.norm.txt`, "utf8");
const committed = readFileSync(`${S}/committed.norm.txt`, "utf8");
const receiptQuote = JSON.parse(readFileSync(`${S}/clone/corpus/evidence/round-30/frontier/S117.json`, "utf8")).quote;
const qs = entryQuotes(body);
const res = qs.map((q, i) => ({ i, words: words(q), in_live: live.includes(q), in_committed: committed.includes(q), q }));
console.log("header/body split at line 15; body lines:", lines.length - 15);
console.log("receipt quote words:", words(receiptQuote), "in_live:", live.includes(receiptQuote), "in_committed:", committed.includes(receiptQuote));
console.log("total >=4-word quoted spans:", qs.length, "misses(live):", res.filter(r => !r.in_live).length, "misses(committed):", res.filter(r => !r.in_committed).length);
for (const r of res) console.log(`${r.in_live ? "OK " : "MISS"} w=${r.words} :: ${r.q}`);
