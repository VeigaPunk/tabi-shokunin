import { readFileSync } from "node:fs";
const S = "/fast/scratch/hyaku/tabi-r30/RefetchLiveS117";
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const words = (s) => collapse(s).split(" ").filter(Boolean).length;
const entry = readFileSync(`${S}/clone/corpus/knowledge/host-published-rate-limit-headers.md`, "utf8");
const lines = entry.split("\n");
const head = lines.slice(0, 15).join("\n");
function spans(txt) {
  const stripped = txt.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  return [...collapse(stripped).matchAll(/"([^"]{1,600}?)"|“([^”]{1,600}?)”/g)].map(m => collapse(m[1] ?? m[2])).filter(q => words(q) >= 4);
}
console.log("front-matter (first 15 lines) >=4w spans:", JSON.stringify(spans(head)));
console.log("body >=4w spans:", spans(lines.slice(15).join("\n")).length);
console.log("whole-file >=4w spans:", spans(entry).length, "same set as body:", JSON.stringify(spans(entry)) === JSON.stringify(spans(lines.slice(15).join("\n"))));
