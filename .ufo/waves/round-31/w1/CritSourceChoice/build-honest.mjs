// Builds the honest counterpart fixture: same four sources and receipts, rows
// restricted to numbers the sources actually state as thresholds. Proves the
// smallest safe correction is feasible and reaches admitted >= 10 under --live.
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const ROOT = "/fast/scratch/hyaku/tabi-r31/CritSourceChoice/fx-honest";
const FETCH = "/fast/scratch/hyaku/tabi-r31/CritSourceChoice/fetch";
const ENTRY = "corpus/knowledge/rate-signal-decision-table.md";
const RECEIPTS = "corpus/evidence/round-31/decision-table";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const g = (args) => {
  const r = spawnSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr}`);
  return r.stdout.trim();
};

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
g(["init", "-q"]);
if (g(["rev-parse", "--show-toplevel"]) !== ROOT) throw new Error("fixture root mismatch");
g(["config", "user.email", "CritSourceChoice@scratch.local"]);
g(["config", "user.name", "CritSourceChoice"]);

const put = (rel, data) => { const abs = join(ROOT, rel); mkdirSync(join(abs, ".."), { recursive: true }); writeFileSync(abs, data); };
const commit = (m) => { g(["add", "-A"]); g(["commit", "-q", "-m", m]); return g(["rev-parse", "HEAD"]); };

const HDR = "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |";
const SEP = "|---|---|---|---|---|---|---|---|---|---|---|";
const reg = (rows) => ["# SOURCES", "", HDR, SEP, ...rows, ""].join("\n");
const row = (id, url, usedBy) => `| ${id} | ${url} | spec | A | scope | anchor | teaches | mined | 2026-10-26 | 180d | ${usedBy} |`;

put("corpus/SOURCES.md", reg([`| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`]));
const BASE = commit("baseline");

const SRC = {
  S119: { url: "https://www.rfc-editor.org/rfc/rfc9309.txt", file: "rfc9309.txt", ext: "txt" },
  S120: { url: "https://www.rfc-editor.org/rfc/rfc6585.txt", file: "rfc6585.txt", ext: "txt" },
  S121: { url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", file: "rate-limits-for-the-rest-api.html", ext: "html" },
  S122: { url: "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api", file: "best-practices-for-using-the-rest-api.html", ext: "html" },
};
const norm = (t) => t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, " ").replace(/\s+/g, " ").trim();
const bytes = {};
for (const [id, s] of Object.entries(SRC)) {
  const buf = readFileSync(join(FETCH, s.file));
  bytes[id] = buf;
  put(`${RECEIPTS}/bytes/${id}.${s.ext}`, buf);
  put(`${RECEIPTS}/${id}.json`, JSON.stringify({ id, url: s.url, fetched_at: "2026-10-26T08:36:57Z", fetched_by: "CritSourceChoice", http_status: 200, bytes_path: `${RECEIPTS}/bytes/${id}.${s.ext}`, sha256: sha256(buf) }, null, 2) + "\n");
}

// [row, signal, decision, threshold, source, quote]
const ROWS = [
  ["D1", "robots.txt answers `301` chain", "follow — crawler role only (§2.3.1.2 MUST when the chain resolves within five; the SHOULD follow at least five is the crawler duty, beyond five §2.3.1.4 MAY treat as unavailable)", "at most 5 redirects", "S119",
    "If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched"],
  ["D2", "cached `robots.txt`", "refetch — crawler role only (§2.4 SHOULD NOT, 24 h)", "no more than 24 hours", "S119",
    "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable"],
  ["D3", "`robots.txt` body", "cap — the crawler's own parser (§2.5 MUST)", "at least 500 KiB", "S119",
    "The parsing limit MUST be at least 500 kibibytes"],
  ["D4", "`x-ratelimit-remaining`", "cap — GitHub REST authenticated, published value", "5,000 requests", "S121",
    "All of these requests count towards your personal rate limit of 5,000 requests per hour"],
  ["D5", "`x-ratelimit-limit` unauthenticated", "cap — GitHub REST only", "60 requests", "S121",
    "The primary rate limit for unauthenticated requests is 60 requests per hour"],
  ["D6", "`429` while two requests are in flight", "serialize — GitHub secondary limit", "100 concurrent requests", "S121",
    "No more than 100 concurrent requests are allowed"],
  ["D7", "`x-ratelimit-remaining` on one endpoint", "limit — GitHub secondary limit", "900 points", "S121",
    "No more than 900 points per minute are allowed for REST API endpoints"],
  ["D8", "`x-ratelimit-remaining` after a `POST` burst", "limit — GitHub secondary limit", "80 requests", "S121",
    "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed"],
  ["D9", "`POST` token endpoint", "limit — GitHub OAuth token requests", "2,000 requests", "S121",
    "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps"],
  ["D10", "`429` without `retry-after`", "wait — GitHub fallback default, not a web norm", "at least 1 minute", "S122",
    "Otherwise, wait for at least one minute before retrying"],
  ["D11", "write burst `POST`/`PATCH`/`PUT`/`DELETE`", "serialize — GitHub's own pacing rule", "at least 1 second", "S122",
    "wait at least one second between each request"],
];
for (const r of ROWS) if (!norm(bytes[r[4]].toString("utf8")).includes(r[5])) throw new Error(`quote not located: ${r[0]}`);

const entry = ["# Honest decision table (CritSourceChoice probe)", "", "source: S119-S122", "verified-at: 2026-10-26", "recheck: 180d", "",
  "| Row | Signal | Decision | Threshold | Source | Located quote |", "|---|---|---|---|---|---|",
  ...ROWS.map((r) => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | "${r[5]}" |`), "", "Probe text: every number above is one the source states as a bound.", ""].join("\n");
put(ENTRY, entry);
put("corpus/SOURCES.md", reg([
  `| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`,
  ...Object.keys(SRC).map((id) => row(id, SRC[id].url, ENTRY)),
]));
const HEAD = commit("honest table");
console.log(`BASE=${BASE}\nHEAD=${HEAD}`);
