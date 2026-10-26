// CritC1Predicates: does the frozen counter's `admitted` count DISTINCT rows?
// Builds a throwaway fixture repo whose entry lists ONE row (R2) repeated 14
// times and scores it with the exported evaluate() + a golden live runner.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { evaluate, goldenLines, recordFromTranscript, FIXTURE_SHA256, ROWS } from "./clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const SCHEMA = "tabi-bidi-receipt-v1";
const root = mkdtempSync(join(process.env.TMPDIR || "/tmp", "c1p-dup-"));
const git = (args) => {
  const r = spawnSync("git", ["-C", root, "-c", "user.name=CritC1Predicates", "-c", "user.email=CritC1Predicates@scratch.local", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr}`);
  return r.stdout.trim();
};
const put = (rel, text) => { const a = join(root, rel); mkdirSync(dirname(a), { recursive: true }); writeFileSync(a, text); };
const commit = () => { git(["add", "-A"]); git(["commit", "-q", "--allow-empty", "-m", "f"]); return git(["rev-parse", "HEAD"]); };
const regDoc = (rows) => ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map(([id, usedBy]) => `| ${id} | t — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${usedBy} |`), ""].join("\n");

const ENTRY = "corpus/knowledge/dup-probe.md";
const N = 14;
try {
  git(["init", "-q"]);
  if (git(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch after init");
  put("corpus/SOURCES.md", regDoc([["S001", ENTRY]]));
  const baseline = commit();
  put("corpus/SOURCES.md", regDoc([["S001", ENTRY], ["S002", ENTRY]]));
  put(ENTRY, ["source: S002 — probe", "verified-at: probe", "recheck: probe", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
    ...Array.from({ length: N }, () => `| R2 | ${ROWS.R2} | browsingContext.getTree | yes | receipt |`), ""].join("\n"));
  const runs = [];
  for (let k = 1; k <= 2; k += 1) {
    const text = goldenLines({});
    const rel = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`;
    put(rel, text);
    runs.push({ name: `run${k}`, transcript: rel, transcriptSha256: sha256(Buffer.from(text)) });
  }
  put("scripts/bidi-driver-fixture.mjs", "// fixture driver\n");
  put("corpus/evidence/round-32/bidi/receipt.json", JSON.stringify({ schema: SCHEMA, fixtureSha256: FIXTURE_SHA256, browserVersion: "154.0.8037.97",
    driver: "scripts/bidi-driver-fixture.mjs", driverSha256: sha256(Buffer.from("// fixture driver\n")), runs }, null, 2));
  const rev = commit();
  const out = await evaluate(root, { rev, baseline, entry: ENTRY, live: true, liveRunner: async () => recordFromTranscript(goldenLines({})) });
  console.log(JSON.stringify({ schema: "critc1-dup-v1", entryRows: N, distinctIds: [...new Set(out.rows.map((r) => r.id))], population: out.population, admitted: out.admitted, failing: out.failing, clean: out.clean, duplicateIdsAdmitted: out.rows.filter((r) => r.admitted).length }, null, 2));
} finally {
  rmSync(root, { recursive: true, force: true });
}
