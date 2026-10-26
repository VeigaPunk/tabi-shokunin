// Attack probe (scratch only): two DISTINCT synthetic transcripts with one real
// fixture screenshot spliced in, plus an independent-looking driver. Does the
// gate admit them, and does c1-distinct's "plain counts" set pass them?
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { goldenLines, FIXTURE_SHA256 } from "/fast/scratch/hyaku/tabi-r32/CritC1Claim/clone/scripts/check-bidi-runtime.mjs";

const S = "/fast/scratch/hyaku/tabi-r32/CritC1Claim";
const root = join(S, "fx");
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" }).trim();
git("init", "-q");
git("config", "user.email", "critc1claim@scratch.local");
git("config", "user.name", "CritC1Claim");
if (git("rev-parse", "--show-toplevel") !== root) throw new Error("fixture root mismatch");

const put = (rel, text) => { const p = join(root, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const ENTRY = "corpus/knowledge/forged-bidi.md";
const regRow = (id, usedBy) => `| ${id} | t — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${usedBy} |`;
const REG_HEAD = ["| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|"];

put("corpus/SOURCES.md", ["# SOURCES", "", ...REG_HEAD, regRow("S001", "corpus/knowledge/other.md"), ""].join("\n"));
git("add", "-A"); git("commit", "-q", "-m", "base"); const BASE = git("rev-parse", "HEAD");

const shot = readFileSync("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/CritC1Forgery/cdp-shot.png");
const shotB64 = shot.toString("base64");
const splice = (ctx) => goldenLines({ driverVersion: "154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})", mutate: (steps) => {
  for (const st of steps) if (st[1] === "browsingContext.captureScreenshot") st[3] = { data: shotB64 };
  for (const st of steps) if (st[1] === "browsingContext.getTree") st[3] = { contexts: [{ context: ctx, url: "about:blank" }] };
} });

const runs = [];
for (const [k, ctx] of [[1, "CTX-A"], [2, "CTX-B"]]) {
  const rel = `corpus/evidence/round-32/bidi/forged/run${k}/transcript.jsonl`;
  const text = splice(ctx);
  put(rel, text);
  runs.push({ name: `run${k}`, transcript: rel, transcriptSha256: sha(Buffer.from(text)) });
}
const driverRel = "scripts/forged-driver.mjs";
const driverText = "// independent-looking driver (probe)\n";
put(driverRel, driverText);
put("corpus/evidence/round-32/bidi/forged/receipt.json", JSON.stringify({
  schema: "tabi-bidi-receipt-v1", fixtureSha256: FIXTURE_SHA256, browserVersion: "154.0.8037.97",
  driver: driverRel, driverSha256: sha(Buffer.from(driverText)), runs,
}, null, 1));
const ids = ["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12","R13","R14","R15","R17"];
put(ENTRY, ["source: S902 — probe", "verified-at: probe", "recheck: probe", "",
  "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
  ...ids.map((id) => `| ${id} | x | m | yes | corpus/evidence/round-32/bidi/forged/receipt.json |`), ""].join("\n"));
put("corpus/SOURCES.md", ["# SOURCES", "", ...REG_HEAD, regRow("S001", "corpus/knowledge/other.md"), regRow("S902", ENTRY), ""].join("\n"));
git("add", "-A"); git("commit", "-q", "-m", "rev"); const REV = git("rev-parse", "HEAD");
console.log(JSON.stringify({ root, BASE, REV, distinctDigests: new Set(runs.map((r) => r.transcriptSha256)).size, shotSha: sha(shot) }));
