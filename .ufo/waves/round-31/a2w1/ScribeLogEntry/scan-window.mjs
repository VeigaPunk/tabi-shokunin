// ScribeLogEntry — window-cleanliness scan for the drafted LOG.md entry.
// Mirrors the frozen counter's line-level claim grammar
// (scripts/check-selfassessment.mjs: m1LogFindings, lineOnly=true) without
// running the lane counter: a line is scanned only when it matches
// /self-?test|case/, and only the four documented tally shapes create a claim.
// Usage: node scan-window.mjs <log-entry.md>
import fs from "node:fs";

const file = process.argv[2];
const lines = fs.readFileSync(file, "utf8").split("\n");
const SCRIPT = /((?:\.{0,2}\/)?scripts\/[A-Za-z0-9_.\/-]+\.mjs)/g;
const SHAPES = [
  ["fraction", /`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g],
  ["n-case", /(\d+)-case\b/g],
  ["cases=", /\bcases\s*=\s*(\d+)/g],
  ["N cases", /\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g],
];
let scanned = 0;
let claims = 0;
lines.forEach((line, i) => {
  if (!/self-?test|case/.test(line)) return;
  scanned++;
  const found = [];
  for (const [label, re] of SHAPES) for (const m of line.matchAll(re)) found.push(`${label}:${m[0]}`);
  const scripts = [...line.matchAll(SCRIPT)].map((m) => m[1]);
  if (found.length) {
    claims += found.length;
    console.log(`CLAIM line=${i + 1} shapes=${JSON.stringify(found)} scripts=${JSON.stringify(scripts)}`);
  } else {
    console.log(`scanned-no-claim line=${i + 1} scripts=${JSON.stringify(scripts)}`);
  }
});
console.log(`lines=${lines.length} scanned=${scanned} claims=${claims}`);
process.exit(claims === 0 ? 0 : 1);
