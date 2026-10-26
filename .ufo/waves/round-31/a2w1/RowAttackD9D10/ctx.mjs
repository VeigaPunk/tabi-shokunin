import { readFileSync } from "node:fs";
const src = readFileSync("clone/scripts/check-decision-table.mjs", "utf8");
const a = src.indexOf("const ENTITIES");
const b = src.indexOf("\nconst collapse");
if (a < 0 || b < 0 || b <= a) throw new Error("extract failed");
const seg = src.slice(a, b).replace(/^export /m, "");
const make = new Function(`${seg}; return normalise;`);
const normalise = make();
const committed = normalise(readFileSync("clone/corpus/evidence/round-31/decision-table/bytes/S121.html"));
const live = normalise(readFileSync("s121-live.html"));
const quotes = {
  D9: "No more than 100 concurrent requests are allowed.",
  D10: "No more than 900 points per minute are allowed for REST API endpoints"
};
for (const [row, q] of Object.entries(quotes)) {
  const cq = q.replace(/\s+/g, " ");
  console.log(`== ${row} quote: "${q}"`);
  console.log(`   in committed bytes (normalised): ${committed.includes(cq)}`);
  console.log(`   in live bytes (normalised):      ${live.includes(cq)}`);
  const i = live.indexOf(cq);
  if (i >= 0) {
    console.log(`   LIVE before: ...${live.slice(Math.max(0, i - 600), i)}`);
    console.log(`   LIVE after:  ${live.slice(i + q.length, i + q.length + 600)}...`);
  } else console.log("   NOT FOUND live");
}
