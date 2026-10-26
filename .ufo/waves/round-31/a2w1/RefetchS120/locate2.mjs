import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };

export function normalise(buf) {
  let t = Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf);
  if (/<!doctype html|<html[\s>]/i.test(t)) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    t = t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#") && k !== "#39") return String.fromCodePoint(parseInt(k.slice(1), 10));
      return ENTITIES[k] ?? m;
    });
  }
  return t.replace(/\s+/g, " ").trim();
}
const sha = (b) => createHash("sha256").update(b).digest("hex");
const files = {
  fetch1: process.env.S + "/fetch/rfc6585.1.txt",
  fetch2: process.env.S + "/fetch/rfc6585.2.txt",
  committed: process.env.S + "/clone/corpus/evidence/round-31/decision-table/bytes/S120.txt",
};
const raw = {}, norm = {}, normLen = {}, texts = {};
for (const [k, p] of Object.entries(files)) {
  const b = readFileSync(p);
  raw[k] = sha(b);
  const n = normalise(b);
  texts[k] = n;
  norm[k] = sha(Buffer.from(n, "utf8"));
  normLen[k] = n.length;
}
const claims = {
  "P1/s4-repr-SHOULD-MAY-retry-after": "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.",
  "P1b/s4-429-definition": "The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\").",
  "P1c/s4-cache-prohibition": "Responses with the 429 status code MUST NOT be stored by a cache.",
  "P2/s7.2-servers-not-required": "Therefore, servers are not required to use the 429 status code; when limiting resource usage, it may be more appropriate to just drop connections, or take other steps.",
  "P3/s4-example-retry-after-3600": "Retry-After: 3600",
  "P4/s4-example-body-50-per-hour": "I only allow 50 requests per hour to this Web site per logged in user.",
  "P5/s4-counting-undefined": "Note that this specification does not define how the origin server identifies the user, nor how it counts requests.",
};
const rows = Object.entries(claims).map(([name, q]) => {
  const offsets = [];
  for (let i = texts.committed.indexOf(q); i >= 0; i = texts.committed.indexOf(q, i + 1)) offsets.push(i);
  return { name, found: offsets.length > 0, occurrences: offsets.length, offsets, inFetch1: texts.fetch1.indexOf(q) };
});
const retryAfter = [];
for (let i = texts.committed.indexOf("Retry-After"); i >= 0; i = texts.committed.indexOf("Retry-After", i + 1)) retryAfter.push({ offset: i, before: texts.committed.slice(Math.max(0,i-70), i).trim() });
const markers = {};
for (const m of ["3. 428 Precondition Required", "4. 429 Too Many Requests", "5. 431 Request Header Fields Too Large", "6. 511 Network Authentication Required", "7.2. 429 Too Many Requests", "7.3. 431", "7. Security Considerations"]) markers[m] = texts.committed.indexOf(m);
console.log(JSON.stringify({ hashes: { raw, norm, normLen }, identicalRaw: raw.fetch1 === raw.fetch2 && raw.fetch1 === raw.committed, identicalNorm: norm.fetch1 === norm.fetch2 && norm.fetch1 === norm.committed, rows, retryAfter, markers }, null, 2));
