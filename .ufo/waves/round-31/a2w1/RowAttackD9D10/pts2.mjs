import { readFileSync } from "node:fs";
const src = readFileSync("clone/scripts/check-decision-table.mjs", "utf8");
const seg = src.slice(src.indexOf("const ENTITIES"), src.indexOf("\nconst collapse")).replace(/^export /m, "");
const normalise = new Function(`${seg}; return normalise;`)();
const live = normalise(readFileSync("s121-live.html"));
// second occurrence of the heading = the section body (first is the bullet-2 link text)
const first = live.indexOf("Calculating points for the secondary rate limit");
const second = live.indexOf("Calculating points for the secondary rate limit", first + 1);
console.log("POINTS SECTION BODY:", live.slice(second, second + 1500));
console.log("\n--- all 'concurrent' occurrences:");
let i = live.indexOf("concurrent"), n = 0;
while (i >= 0 && n < 10) { n++; console.log(`#${n}:`, live.slice(Math.max(0, i - 180), i + 180)); i = live.indexOf("concurrent", i + 1); }
console.log("total concurrent occurrences:", n);
