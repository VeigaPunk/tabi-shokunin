import { readFileSync } from "fs";
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
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
const n = normalise(readFileSync("discord-rate-limits.html"));
function region(needle, before = 200, after = 700, occurrence = 1) {
  let idx = -1;
  for (let i = 0; i < occurrence; i++) idx = n.indexOf(needle, idx + 1);
  if (idx < 0) { console.log(`[${needle}] NOT FOUND`); return; }
  console.log(`\n===== [${needle}] #${occurrence} =====`);
  console.log(n.slice(Math.max(0, idx - before), idx + after));
}
region("X-RateLimit-Scope: shared", 400, 500);
region("X-RateLimit-Scope: user", 500, 300);
region("X-RateLimit-Global: true", 500, 300);
region("50 requests per second", 300, 400);
region("10,000", 300, 400);
region("IP address", 200, 300, 1);
region("IP address", 200, 300, 2);
region("hard", 200, 300);
region("Invalid Request Limit", 100, 900);
