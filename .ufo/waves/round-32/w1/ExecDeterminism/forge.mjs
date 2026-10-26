// forge.mjs — probe whether t3's --live binding rejects a transcript that was
// never produced by a browser but carries (a) the authentic first-screenshot
// bytes measured on this host build and (b) the authentic chromedriverVersion
// string. Runs the frozen counter's own evaluate() over a throwaway fixture
// repo with a real liveRecord as the live leg.
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { evaluate, goldenLines, FIXTURE_SHA256, FIXTURE } from "./clone/scripts/check-bidi-runtime.mjs";

const S = "/fast/scratch/hyaku/tabi-r32/ExecDeterminism";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const PNG = readFileSync(join(S, "out/smoke.png"));
const B64 = PNG.toString("base64");
const VERSION = "154.0.8037.97";
const CDV = "154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})";
console.log("authentic PNG sha256", sha256(PNG), "bytes", PNG.length);

const root = mkdtempSync(join(S, "forge-"));
const run = (args) => {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr}`);
  return r.stdout.trim();
};
run(["init", "-q"]);
if (run(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch");
run(["config", "user.email", "execdeterminism@scratch.local"]);
run(["config", "user.name", "ExecDeterminism"]);
const put = (rel, text) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, text); };
const commit = (msg) => { run(["add", "-A"]); run(["commit", "-q", "-m", msg]); return run(["rev-parse", "HEAD"]); };

const REG_HEAD = ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|"];
const reg = (rows) => [...REG_HEAD, ...rows].join("\n") + "\n";
put("corpus/SOURCES.md", reg(["| S001 | t — https://e.test/ | spec | A | s | a | t | mined | 2026-01-01 | 90d | corpus/knowledge/other.md |"]));
const baseline = commit("baseline");

// Entry: two rows marked yes.
const entryPath = "corpus/knowledge/bidi-runtime-forge.md";
put("corpus/SOURCES.md", reg([
  "| S001 | t — https://e.test/ | spec | A | s | a | t | mined | 2026-01-01 | 90d | corpus/knowledge/other.md |",
  `| S002 | t — https://e.test/bidi | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${entryPath} |`,
]));
put(entryPath, ["source: S002 — forged", "verified-at: forged", "recheck: forged", "",
  "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
  "| R2 | Target inventory | browsingContext.getTree | yes | receipt |",
  "| R15 | Cookies | storage.getCookies | yes | receipt |", ""].join("\n"));

// Driver stub: a file the counter can hash (never executed by the counter).
const driverPath = "corpus/evidence/driver-forge.mjs";
put(driverPath, "// stub driver: recorded nothing; transcripts below were synthesised.\nexport const forged = true;\n");

// Two synthetic transcripts: golden predicate-satisfying lines, with the
// authentic screenshot bytes and authentic chromedriverVersion spliced in.
const lines = goldenLines({ version: VERSION, driverVersion: CDV, mutate: (steps) => {
  const st = steps.find((x) => x[1] === "browsingContext.captureScreenshot");
  st[3] = { data: B64 };
} });
const runs = [];
for (const name of ["forged-a", "forged-b"]) {
  const p = `corpus/evidence/round-32/bidi/${name}.jsonl`;
  put(p, lines);
  runs.push({ name, transcript: p, transcriptSha256: sha256(Buffer.from(lines)) });
}
const receiptPath = "corpus/evidence/round-32/bidi/receipt.json";
put(receiptPath, JSON.stringify({ schema: "tabi-bidi-receipt-v1", fixtureSha256: FIXTURE_SHA256,
  browserVersion: VERSION, driver: driverPath, driverSha256: sha256(Buffer.from(readFileSync(join(root, driverPath)))),
  runs }, null, 1) + "\n");
const rev = commit("forge");

const out = await evaluate(root, { rev, baseline, entry: entryPath, receipt: receiptPath, live: true });
console.log(JSON.stringify({ population: out.population, admitted: out.admitted, failing: out.failing, binding: out.binding, entryFinding: out.entryFinding, rows: out.rows.map((r) => [r.id, r.admitted, r.reason, r.detail]) }, null, 1));
console.log("FIXTURE keys", Object.keys(FIXTURE).join(","));
