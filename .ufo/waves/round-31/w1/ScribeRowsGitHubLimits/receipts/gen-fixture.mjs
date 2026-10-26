import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

const S = "/fast/scratch/hyaku/tabi-r31/ScribeRowsGitHubLimits";
const D = `${S}/fx`;
const rows = JSON.parse(readFileSync(`${S}/rows.json`, "utf8"));
const bytes = readFileSync(`${S}/fetch/s121.html`);
const sha = createHash("sha256").update(bytes).digest("hex");

mkdirSync(`${D}/corpus/evidence/round-31/decision-table/bytes`, { recursive: true });
writeFileSync(`${D}/corpus/evidence/round-31/decision-table/bytes/S121.html`, bytes);
writeFileSync(`${D}/corpus/evidence/round-31/decision-table/S121.json`, JSON.stringify({
  id: "S121",
  url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
  fetched_at: "2026-10-26T08:36:22Z",
  http_status: 200,
  bytes_path: "corpus/evidence/round-31/decision-table/bytes/S121.html",
  sha256: sha,
}, null, 2) + "\n");

const reg = readFileSync(`${D}/corpus/SOURCES.md`, "utf8").trimEnd() + "\n"
  + "| S121 | GitHub Docs — Rate limits for the REST API — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | doc | A | GitHub REST API policy | §Exceeding the rate limit | rate thresholds | mined | 2026-10-26 | 180d | corpus/knowledge/rate-signal-decision-table.md |\n";
writeFileSync(`${D}/corpus/SOURCES.md`, reg);

const header = "| Row | Signal | Decision | Threshold | Source | Located quote |";
const body = rows.map((r) => `| ${r.row} | ${r.signal} | ${r.decision} | ${r.threshold} | S121 | "${r.quote}" |`);
const doc = [
  "# Rate-signal decision table", "", "source: S121", "verified-at: 2026-10-26", "recheck: 180d", "",
  header, "|---|---|---|---|---|---|", ...body, "",
  "Scope: these rows are the vendor's published policy for its REST API host.", "",
].join("\n");
writeFileSync(`${D}/corpus/knowledge/rate-signal-decision-table.md`, doc);
console.log(JSON.stringify({ sha256: sha, rows: rows.length }));
