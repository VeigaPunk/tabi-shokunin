import { readFileSync } from "node:fs";
const src = readFileSync("clone/scripts/check-decision-table.mjs", "utf8");
const seg = src.slice(src.indexOf("const ENTITIES"), src.indexOf("\nconst collapse")).replace(/^export /m, "");
const normalise = new Function(`${seg}; return normalise;`)();
const live = normalise(readFileSync("s121-live.html"));
const h = live.indexOf("Calculating points for the secondary rate limit");
console.log("POINTS SECTION:", live.slice(h, h + 1400));
console.log("\n'weighted' occurrences:", (live.match(/weighted/g) || []).length);
let i = live.indexOf("weighted");
while (i >= 0) { console.log("  ...", live.slice(Math.max(0, i - 150), i + 150), "..."); i = live.indexOf("weighted", i + 1); }
const q9 = "No more than 100 concurrent requests are allowed.";
const q10 = "No more than 900 points per minute are allowed for REST API endpoints";
console.log("D9 quote words:", q9.split(" ").length, "| D10 quote words:", q10.split(" ").length);
console.log("subject-to-change caveat:", live.includes("These secondary rate limits are subject to change without notice. You may also encounter a secondary rate limit for undisclosed reasons."));
