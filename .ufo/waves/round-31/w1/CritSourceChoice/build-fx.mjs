// Builds a counterexample fixture repo for the C1 first falsifier:
// rows whose quoted numbers are genuine and located, but whose scope /
// normative force is misrepresented (example value, MAY, vendor policy).
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const ROOT = "/fast/scratch/hyaku/tabi-r31/CritSourceChoice/fx";
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
const top = g(["rev-parse", "--show-toplevel"]);
if (top !== ROOT) throw new Error(`fixture root mismatch: ${top}`);
g(["config", "user.email", "CritSourceChoice@scratch.local"]);
g(["config", "user.name", "CritSourceChoice"]);

const put = (rel, data) => {
  const abs = join(ROOT, rel);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, data);
};
const commit = (msg) => { g(["add", "-A"]); g(["commit", "-q", "-m", msg]); return g(["rev-parse", "HEAD"]); };

// ---- registry ---------------------------------------------------------------
const HDR = "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |";
const SEP = "|---|---|---|---|---|---|---|---|---|---|---|";
const row = (id, url, status, usedBy) =>
  `| ${id} | ${url} | spec | A | scope | anchor | teaches | ${status} | 2026-10-26 | 180d | ${usedBy} |`;
const reg = (rows) => ["# SOURCES", "", HDR, SEP, ...rows, ""].join("\n");

// baseline: none of S119-S122 exists yet
put("corpus/SOURCES.md", reg([`| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`]));
const BASE = commit("baseline");

// ---- bytes (genuine fetches from this round) --------------------------------
const SRC = {
  S119: { url: "https://www.rfc-editor.org/rfc/rfc9309.txt", file: "rfc9309.txt", ext: "txt" },
  S120: { url: "https://www.rfc-editor.org/rfc/rfc6585.txt", file: "rfc6585.txt", ext: "txt" },
  S121: { url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", file: "rate-limits-for-the-rest-api.html", ext: "html" },
  S122: { url: "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api", file: "best-practices-for-using-the-rest-api.html", ext: "html" },
};
const read = (f) => readFileSync(join(FETCH, f));
const norm = (t) => t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, " ").replace(/\s+/g, " ").trim();

const bytes = {};
for (const [id, s] of Object.entries(SRC)) {
  const buf = read(s.file);
  bytes[id] = buf;
  put(`${RECEIPTS}/bytes/${id}.${s.ext}`, buf);
  put(`${RECEIPTS}/${id}.json`, JSON.stringify({
    id, url: s.url, fetched_at: "2026-10-26T08:36:57Z", fetched_by: "CritSourceChoice",
    http_status: 200, bytes_path: `${RECEIPTS}/bytes/${id}.${s.ext}`, sha256: sha256(buf),
  }, null, 2) + "\n");
}

// ---- entry: every quote genuine + located, every scope misread --------------
const Q = {
  D1: "the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume that the robots.txt file is unavailable",
  D2: "HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600",
  D3: "All of these requests count towards your personal rate limit of 5,000 requests per hour",
  D4: "Otherwise, wait for at least one minute before retrying",
  D5: "All of these requests count towards your personal rate limit of 5,000 requests per hour",
};
// sanity: each quote must genuinely be a substring of the receipt bytes
for (const [k, id] of [["D1", "S119"], ["D2", "S120"], ["D3", "S121"], ["D4", "S122"], ["D5", "S121"]]) {
  if (!norm(bytes[id].toString("utf8")).includes(Q[k])) throw new Error(`quote ${k} not located in ${id}`);
}
const w = (s) => s.split(" ").filter(Boolean).length;
for (const k of Object.keys(Q)) console.log(`${k} words=${w(Q[k])}`);

const entry = [
  "# Counterexample decision table (CritSourceChoice probe)",
  "",
  "source: S119-S122",
  "verified-at: 2026-10-26",
  "recheck: 180d",
  "",
  "| Row | Signal | Decision | Threshold | Source | Located quote |",
  "|---|---|---|---|---|---|",
  `| D1 | robots.txt answers \`500\` | stop | 30 days | S119 | "${Q.D1}" |`,
  `| D2 | \`429\` body | wait | 3600 seconds | S120 | "${Q.D2}" |`,
  `| D3 | \`x-ratelimit-remaining\` | cap | 5,000 requests | S121 | "${Q.D3}" |`,
  `| D4 | \`retry-after\` absent | backoff | 1 minute | S122 | "${Q.D4}" |`,
  `| D5 | \`x-ratelimit-remaining\` | wait | 6 hours | S121 | "${Q.D5}" |`,
  "",
  "Probe text: D1 reads the parenthetical example as a threshold; D2 reads an",
  "example response body as a rule; D3/D4 apply one vendor's policy as a web norm.",
  "",
].join("\n");
put(ENTRY, entry);

const usedBy = ENTRY;
put("corpus/SOURCES.md", reg([
  `| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`,
  row("S119", SRC.S119.url, "mined", usedBy),
  row("S120", SRC.S120.url, "mined", usedBy),
  row("S121", SRC.S121.url, "mined", usedBy),
  row("S122", SRC.S122.url, "mined", usedBy),
]));
const HEAD = commit("scope-misread table");
console.log(`BASE=${BASE}\nHEAD=${HEAD}\nROOT=${ROOT}`);
