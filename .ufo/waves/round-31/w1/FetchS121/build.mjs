import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
const norm = readFileSync("f1.norm.txt", "utf8");
const UNIT_RE = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i;
const NW = { zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,fifteen:15,twenty:20,"twenty-four":24,thirty:30,sixty:60,ninety:90,hundred:100 };
const numbersIn = (t) => { const o=new Set(); for (const m of t.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) o.add(Number(m[0].replace(/,/g,""))); const l=t.toLowerCase(); for (const [w,n] of Object.entries(NW)) if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(l)) o.add(n); return o; };
const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const R = [
 ["D1","`403`/`429` with `x-ratelimit-remaining: 0`","wait","0 requests",
  "If you exceed your primary rate limit, you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0 ."],
 ["D2","`retry-after` absent, `x-ratelimit-remaining` not 0","backoff","at least 1 minute",
  "Otherwise, wait for at least one minute before retrying."],
 ["D3","`retry-after` header present","wait","at least 1 second",
  "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed."],
 ["D4","`unauthenticated` request budget","cap","60 requests",
  "The primary rate limit for unauthenticated requests is 60 requests per hour."],
 ["D5","`x-ratelimit-remaining` under a personal token","cap","5,000 requests",
  "All of these requests count towards your personal rate limit of 5,000 requests per hour."],
 ["D6","GhEC-owned `GitHub App` acting on the user's behalf","cap","15,000 requests",
  "have a higher rate limit of 15,000 requests per hour."],
 ["D7","`GITHUB_TOKEN` in a `workflow`","cap","1,000 requests",
  "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository."],
 ["D8","`installation access token` on a large installation","cap","50 requests",
  "Installations that have more than 20 repositories receive another 50 requests per hour for each repository."],
 ["D9","`installation access token` ceiling","cap","12,500 requests",
  "The rate limit cannot increase beyond 12,500 requests per hour."],
 ["D10","`Git LFS` batch request, unauthenticated","cap","300 requests",
  "a limit of 300 requests per minute for unauthenticated requests"],
 ["D11","`concurrent` requests in flight","serialize","100 concurrent",
  "No more than 100 concurrent requests are allowed."],
 ["D12","`points` spent per minute, `REST`","limit","900 points",
  "No more than 900 points per minute are allowed for REST API endpoints"],
 ["D13","`CPU` seconds per real second","pause","90 seconds",
  "No more than 90 seconds of CPU time per 60 seconds of real time is allowed."],
 ["D14","`content-generating` requests","limit","80 requests",
  "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed."],
 ["D15","`OAuth` access token requests","limit","2,000 requests",
  "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps."],
 ["D16","cost of a `GET`/`HEAD`/`OPTIONS` request","cap","1 point",
  "Most REST API GET , HEAD , and OPTIONS requests 1"],
 ["D17","cost of a `POST`/`PATCH`/`PUT`/`DELETE` request","cap","5 points",
  "Most REST API POST , PATCH , PUT , or DELETE requests 5"],
];
const pre = [];
for (const [id, sig, dec, thr, q] of R) {
  const located = norm.includes(q), n = wc(q), tm = UNIT_RE.exec(thr);
  const num = tm ? Number(tm[1].replace(/,/g, "")) : null;
  const src = tm ? numbersIn(q).has(num) : false;
  pre.push(`${id} loc=${located} wc=${n} unit=${!!tm} sourced=${src}`);
  if (!located || n < 6 || n > 25 || !tm || !src) pre.push(`  !! ${id} FAILS rules: ${q}`);
}
writeFileSync("precheck.txt", pre.join("\n") + "\n");
const lines = R.map(([id, sig, dec, thr, q]) => `| ${id} | ${sig} | ${dec} | ${thr} | S121 | "${q}" |`);
const entry = ["# Rate-signal decision table (fixture probe for FetchS121)", "", "source: S121", "verified-at: 2026-10-26", "recheck: 180d", "",
  "| Row | Signal | Decision | Threshold | Source | Located quote |", "|---|---|---|---|---|---|", ...lines, "", "Trailing prose.", ""].join("\n");
writeFileSync("fx/corpus/knowledge/fx-r31.md", entry);
appendFileSync("fx/corpus/SOURCES.md", "| S121 | GitHub Docs — Rate limits for the REST API — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | docs | A | HTTP API | §About primary rate limits | teaches | mined | 2026-10-26 | 180d | corpus/knowledge/fx-r31.md |\n");
console.log(pre.join("\n"));
