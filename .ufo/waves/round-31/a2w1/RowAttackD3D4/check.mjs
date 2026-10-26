import { normalise } from "./clone/scripts/check-decision-table.mjs";
import fs from "node:fs";
const body = fs.readFileSync("rfc9309.txt");
const n = normalise(body);
const q3 = "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume";
const q4 = "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable.";
for (const [id,q] of [["D3",q3],["D4",q4]]) {
  const i = n.indexOf(q);
  console.log(id, "found=" + (i>=0), "count=" + n.split(q).length - 1, "words=" + q.split(" ").filter(Boolean).length);
  if (i>=0) console.log("  ctx: …" + n.slice(Math.max(0,i-60), i+q.length+140) + "…");
}
// exact RFC sentences in raw text
const raw = body.toString("utf8");
const s34 = raw.split("\n").slice(400,421).join(" ");
console.log("RAW 2.3.1.4 ->", s34.replace(/\s+/g," ").trim());
