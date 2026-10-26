// Builds a two-commit fixture repo that satisfies every offline check of
// scripts/check-decision-table.mjs, so that the ONLY mutable condition left is
// the --live fetch. Local only; the repo never leaves the scratch tree.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const root = process.argv[2];
const URL_ = process.argv[3] ?? "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api";
const REG_URL = process.argv[4] || URL_;
const QUOTE = "Crawlers MUST follow at least five consecutive redirects per request sequence";
const BYTES = `Spec text. ${QUOTE}. End.\n`;
const ENTRY = "corpus/knowledge/fx-table.md";
const SOURCES = "corpus/SOURCES.md";
const RECEIPTS = "corpus/evidence/round-31/decision-table";

const run = (args) => {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} -> ${r.status} ${r.stderr}`);
  return r.stdout.trim();
};
const put = (rel, data) => { const p = join(root, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, data); };

mkdirSync(root, { recursive: true });
run(["init", "-q"]);
if (run(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch");
run(["config", "user.email", "c1live@scratch.local"]);
run(["config", "user.name", "SentinelC1Live"]);

const registry = (rows) => ["# SOURCES", "",
  "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |",
  "|---|---|---|---|---|---|---|---|---|---|---|", ...rows, ""].join("\n");
const regRow = (id, url, usedBy) =>
  `| ${id} | Fixture spec — ${url} | spec | A | scope | §2 | teaches | mined | 2026-10-26 | 180d | ${usedBy} |`;

put(SOURCES, registry([regRow("S001", "https://example.org/old.txt", "corpus/knowledge/old.md")]));
const BASE = run(["add", "-A"]) || run(["commit", "-q", "-m", "baseline"]);
const baseRev = run(["rev-parse", "HEAD"]);

put(SOURCES, registry([
  regRow("S001", "https://example.org/old.txt", "corpus/knowledge/old.md"),
  regRow("S900", REG_URL, ENTRY),
]));
put(ENTRY, ["# Fixture decision table", "", "source: S900", "verified-at: 2026-10-26", "recheck: 180d", "",
  "| Row | Signal | Decision | Threshold | Source | Located quote |",
  "|---|---|---|---|---|---|",
  `| D1 | robots.txt fetch answers \`301\` | follow | at least 5 redirects | S900 | "${QUOTE}" |`,
  "", "Trailing prose.", ""].join("\n"));
put(`${RECEIPTS}/bytes/S900.txt`, BYTES);
put(`${RECEIPTS}/S900.json`, JSON.stringify({
  id: "S900", url: URL_, fetched_at: "2026-10-26T00:00:00Z", fetched_by: "SentinelC1Live",
  http_status: 200, bytes_path: `${RECEIPTS}/bytes/S900.txt`,
  sha256: createHash("sha256").update(Buffer.from(BYTES)).digest("hex"),
}, null, 2));
run(["add", "-A"]);
run(["commit", "-q", "-m", "measured"]);
const rev = run(["rev-parse", "HEAD"]);
console.log(JSON.stringify({ root, baseRev, rev, entry: ENTRY, receipts: RECEIPTS, url: URL_ }));
