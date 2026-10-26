import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const S = "/fast/scratch/hyaku/tabi-r31/ScribeRowsRetry";
const ROOT = join(S, "fixture-probe");
const ENTRY = "corpus/knowledge/rate-signal-decision-table.md";
const RECEIPTS = "corpus/evidence/round-31/decision-table";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const g = (args) => { const r = spawnSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }); if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr}`); return r.stdout.trim(); };

// Frozen normalise (verbatim bodies from scripts/check-decision-table.mjs at 9505a10).
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

const probe = readFileSync(join(S, "probe-honest-table.md"), "utf8");
const rows = probe.split("\n").filter((l) => /^\|\s*D\d+\s*\|/.test(l));
const cells = rows.map((l) => l.trim().slice(1, -1).split("|").map((c) => c.trim()));
const SRC = {
  S119: { url: "https://www.rfc-editor.org/rfc/rfc9309.txt", file: "rfc9309.txt", ext: "txt" },
  S120: { url: "https://www.rfc-editor.org/rfc/rfc6585.txt", file: "rfc6585.txt", ext: "txt" },
  S121: { url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", file: "rate-limits-for-the-rest-api.html", ext: "html" },
  S122: { url: "https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api", file: "best-practices-for-using-the-rest-api.html", ext: "html" },
};

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
g(["init", "-q"]);
if (g(["rev-parse", "--show-toplevel"]) !== ROOT) throw new Error("fixture root mismatch");
g(["config", "user.email", "ScribeRowsRetry@scratch.local"]);
g(["config", "user.name", "ScribeRowsRetry"]);
const put = (rel, data) => { const abs = join(ROOT, rel); mkdirSync(join(abs, ".."), { recursive: true }); writeFileSync(abs, data); };
const commit = (m) => { g(["add", "-A"]); g(["commit", "-q", "-m", m]); return g(["rev-parse", "HEAD"]); };

const HDR = "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |";
const SEP = "|---|---|---|---|---|---|---|---|---|---|---|";
const reg = (rs) => ["# SOURCES", "", HDR, SEP, ...rs, ""].join("\n");
const row = (id, url) => `| ${id} | ${url} | spec | A | scope | anchor | teaches | mined | 2026-10-26 | 180d | ${ENTRY} |`;
put("corpus/SOURCES.md", reg([`| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`]));
const BASE = commit("baseline");

for (const [id, s] of Object.entries(SRC)) {
  const buf = readFileSync(join(S, "fetch", s.file));
  put(`${RECEIPTS}/bytes/${id}.${s.ext}`, buf);
  put(`${RECEIPTS}/${id}.json`, JSON.stringify({ id, url: s.url, fetched_at: "2026-10-26T08:47:26Z", fetched_by: "ScribeRowsRetry-independent-check", http_status: 200, bytes: buf.length, bytes_path: `${RECEIPTS}/bytes/${id}.${s.ext}`, sha256: sha256(buf) }, null, 2) + "\n");
}

const normCache = {};
const normOf = (id) => (normCache[id] ??= normalise(readFileSync(join(S, "fetch", SRC[id].file))));
const report = [];
for (const c of cells) {
  const [id, , , , , qcell] = c;
  const span = (qcell.match(/"([^"]+)"/) || [])[1];
  if (!span) { report.push(`${id} NO_SPAN`); continue; }
  report.push(`${id} source=${c[4]} quote_words=${span.split(" ").length} located=${normOf(c[4]).includes(span)}`);
}

put(ENTRY, probe);
put("corpus/SOURCES.md", reg([
  `| S107 | https://www.rfc-editor.org/rfc/rfc9110.txt | spec | A | s | a | t | mined | 2026-10-25 | 730d | corpus/knowledge/redirect-and-retry-after-semantics.md |`,
  ...Object.keys(SRC).map((id) => row(id, SRC[id].url)),
]));
const HEAD = commit("probe honest table, independent build");
console.log(report.join("\n"));
console.log(`BASE=${BASE}\nHEAD=${HEAD}`);
