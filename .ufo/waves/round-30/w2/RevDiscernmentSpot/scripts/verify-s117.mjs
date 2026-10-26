import { readFileSync } from "fs";
import { createHash } from "crypto";

// verbatim from scripts/check-frontier-admission.mjs:136-151 (frozen cadef57e…9eca)
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };
function normalise(buf) {
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

const sha = (s) => createHash("sha256").update(s).digest("hex");
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const words = (s) => collapse(s).split(" ").filter(Boolean).length;

const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const live = readFileSync("discord-rate-limits.html");
const committed = readFileSync(`${LANE}/corpus/evidence/round-30/frontier/bytes/S117.html`);
const refetch = readFileSync(`${LANE}/corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html`);
const entryFile = readFileSync(`${LANE}/corpus/knowledge/host-published-rate-limit-headers.md`, "utf8");

const nLive = normalise(live), nCom = normalise(committed), nRef = normalise(refetch);
console.log("== normalised bodies ==");
console.log("live     sha:", sha(nLive), "chars:", nLive.length);
console.log("committed sha:", sha(nCom), "chars:", nCom.length);
console.log("refetch  sha:", sha(nRef), "chars:", nRef.length);
console.log("live==committed:", nLive === nCom, "| live==refetch:", nLive === nRef);
console.log("row anchor claims norm sha c719ecca...:", sha(nCom) === "c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007", "| chars 8728:", nCom.length === 8728);

console.log("== receipt quote located (g5 analogue incl. live) ==");
const quote = "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.";
for (const [k, n] of Object.entries({ live: nLive, committed: nCom, refetch: nRef })) console.log(`  ${k}:`, n.includes(quote));

console.log("== entry quoted spans (q1 replication over body after 15-line head) ==");
function headerOf(text) { const lines = text.split("\n"); return { head: lines.slice(0, 15), body: lines.slice(15).join("\n") }; }
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
const { body } = headerOf(entryFile);
const quotes = entryQuotes(body);
console.log("quoted spans >=4 words:", quotes.length);
for (const q of quotes) {
  const a = nLive.includes(q), b = nCom.includes(q);
  console.log(a && b ? "OK  " : "FAIL", JSON.stringify(q.slice(0, 110)));
}

console.log("== specific factual spans vs live norm ==");
const spans = [
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
  "X-RateLimit-Reset-After",
  "X-RateLimit-Bucket",
  "X-RateLimit-Global",
  "X-RateLimit-Scope",
  "The number of requests that can be made",
  "The number of remaining requests that can be made",
  "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets",
  "Total time (in seconds) of when the current rate limit bucket will reset.",
  "A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)",
  "Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)",
  "Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)",
  "Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.",
  "In the case that a rate limit is exceeded, the API will return a HTTP 429 response code with a JSON body.",
  "Your application should rely on the Retry-After header or retry_after field to determine when to retry the request.",
  "Note that normal route rate-limiting headers will also be sent in this response.",
  "All bots can make up to 50 requests per second to our API.",
  "Interaction endpoints are not bound to the bot’s Global Rate Limit.",
  "10,000",
  "X-RateLimit-Limit: 5",
  "X-RateLimit-Remaining: 0",
  "X-RateLimit-Reset: 1470173023",
  "X-RateLimit-Reset-After: 1",
  "X-RateLimit-Bucket: abcd1234",
  "1470173023.123",
  "retry_after",
  "Retry-After",
  "invalid request",
  "optional",
];
for (const s of spans) console.log(nLive.includes(s) ? "OK  " : "MISS", JSON.stringify(s.slice(0, 110)));

console.log("== raw-html metadata ==");
const raw = live.toString("utf8");
console.log("dateModified 2026-02-06T17:38:32.017Z in raw html:", raw.includes("2026-02-06T17:38:32.017Z"));
console.log("refetch bytes sha matches refetch record c1c2d3f9...:", sha(refetch.toString("utf8")) === "c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3", "| raw sha:", sha(live.toString("utf8")));
