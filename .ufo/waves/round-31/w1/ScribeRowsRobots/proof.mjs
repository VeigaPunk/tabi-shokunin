// Proof: each row's quote is a substring of normalise(bytes) using the frozen
// counter's own normalise(), and the threshold number occurs in the quote using
// the frozen counter's own numbersIn() (extracted verbatim from counter.mjs).
import { readFileSync } from "node:fs";
import { normalise } from "./norm.mjs";

const src = readFileSync("./counter.mjs", "utf8");
const start = src.indexOf("function numbersIn(text) {");
if (start < 0) throw new Error("numbersIn not found");
let depth = 0, end = -1;
for (let i = src.indexOf("{", start); i < src.length; i += 1) {
  if (src[i] === "{") depth += 1;
  else if (src[i] === "}") { depth -= 1; if (depth === 0) { end = i + 1; break; } }
}
const nwStart = src.indexOf("const NUMBER_WORDS = {");
let nwDepth = 0, nwEnd = -1;
for (let i = src.indexOf("{", nwStart); i < src.length; i += 1) {
  if (src[i] === "{") nwDepth += 1;
  else if (src[i] === "}") { nwDepth -= 1; if (nwDepth === 0) { nwEnd = i + 1; break; } }
}
const decl = src.slice(nwStart, src.indexOf(";", nwEnd) + 1);
const numbersIn = new Function(`${decl}\n${src.slice(start, end)}; return numbersIn;`)();

const text = normalise(readFileSync("./rfc9309.txt"));
console.log(`normalised bytes: ${text.length} chars, source sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`);

const rows = [
  ["D1", "The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP).", 5],
  ["D2", "If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched, parsed, and its rules followed", 5],
  ["D3", "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable.", 5],
  ["D4", "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume", 30],
  ["D5", "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable.", 24],
  ["D6", "The parsing limit MUST be at least 500 kibibytes [KiB].", 500],
];

let ok = true;
for (const [id, quote, tnum] of rows) {
  const words = quote.split(/\s+/).filter(Boolean).length;
  const located = text.includes(quote);
  const nums = [...numbersIn(quote)].sort((a, b) => a - b);
  const hit = numbersIn(quote).has(tnum);
  if (!located || !hit || words < 6 || words > 25 || quote.includes("|")) ok = false;
  console.log(`${id} words=${words} substring=${located} quote_numbers=[${nums.join(",")}] threshold=${tnum} number_in_quote=${hit}`);
}
console.log(`PROOF verdict=${ok ? "ok" : "FAILED"}`);
process.exit(ok ? 0 : 1);
