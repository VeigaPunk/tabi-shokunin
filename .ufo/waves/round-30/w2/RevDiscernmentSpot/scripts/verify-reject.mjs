import { readFileSync } from "fs";
import { createHash } from "crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();

const r9309 = readFileSync("rfc9309.txt", "utf8");
const r6585 = readFileSync("rfc6585.txt", "utf8");

console.log("== rfc digests ==");
console.log("rfc9309:", sha(r9309), r9309.length, "chars");
console.log("rfc6585:", sha(r6585), r6585.length, "chars");

console.log("== register quotes absent (raw + collapsed folds) ==");
const checks = [
  ["rfc9309", r9309, "使用 WebMCP 時，請注意下列事項"],
  ["rfc9309", r9309, "確認 WebMCP 工具曝光度"],
  ["rfc6585", r6585, "Add hints to your tools"],
  ["rfc6585", r6585, "Expose your tools carefully"],
  ["rfc6585", r6585, "Last updated 2026-09-01 UTC"],
];
for (const [name, text, q] of checks) console.log(`  ${name} ${JSON.stringify(q.slice(0, 44))} raw:${text.includes(q)} collapsed:${collapse(text).includes(q)}`);

console.log("== the reject entry's own quoted span vs RFC 6585 ==");
console.log("  'too many requests in a given amount of time' in rfc6585 collapsed:", collapse(r6585).includes("too many requests in a given amount of time"));

console.log("== paraphrase anchors: actual RFC sentences ==");
function ctx(text, needle, n = 3, span = 300) {
  const c = collapse(text);
  let idx = 0, found = 0;
  while (found < n) {
    const i = c.indexOf(needle, idx);
    if (i < 0) break;
    console.log(`  [${needle}] …${c.slice(Math.max(0, i - 120), i + span)}…`);
    idx = i + needle.length; found++;
  }
  if (!found) console.log(`  [${needle}] NOT FOUND`);
}
console.log("-- RFC 9309 --");
ctx(r9309, "authoriz", 4);
ctx(r9309, "4xx", 4);
ctx(r9309, "5xx", 4);
ctx(r9309, "24 hours", 2);
ctx(r9309, "500 KiB", 2);
console.log("-- RFC 6585 --");
ctx(r6585, "too many requests", 2);
ctx(r6585, "Retry-After", 3);
ctx(r6585, "cache", 3);
ctx(r6585, "429", 2);
