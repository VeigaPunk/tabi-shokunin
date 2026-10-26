// MutC2Corrections — mutation sweep over the round-32 C2 corrections.
// Each mutant: restore pristine REV, apply one exact edit, commit in the
// scratch clone, run the frozen v3 counter at --rev HEAD, record, restore.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const CLONE = "/fast/scratch/hyaku/tabi-r32/MutC2Corrections/clone";
const OUT = "/fast/scratch/hyaku/tabi-r32/MutC2Corrections/results";
const TMP = "/fast/scratch/hyaku/tabi-r32/MutC2Corrections/tmp";
const REV = "b234a58920134424e0d104f137311ff54a16d26b";
const FROZEN_COUNTER_SHA = "77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9";
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const git = (args) => {
  const r = spawnSync("git", ["-C", CLONE, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
};

function restore() {
  git(["reset", "--hard", REV]);
  git(["clean", "-fdq"]);
  if (git(["rev-parse", "HEAD"]) !== REV) throw new Error("restore: HEAD != REV");
  if (git(["status", "--porcelain"]) !== "") throw new Error("restore: tree not clean");
}

function runCounter(tag) {
  const r = spawnSync("node", ["scripts/check-selfassessment.mjs", "--rev", "HEAD", "--json"], {
    cwd: CLONE, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, timeout: 600000,
    env: { ...process.env, TMPDIR: TMP, TMP: TMP, TEMP: TMP },
  });
  const rec = { tag, exit: r.status };
  if (r.stdout && r.stdout.trim().startsWith("{")) {
    const j = JSON.parse(r.stdout);
    rec.mismatches = j.mismatches;
    rec.counted = j.counted;
    rec.couldNotEvaluate = j.couldNotEvaluate;
    rec.superseded = j.superseded;
    rec.clean = j.clean;
  }
  if (r.stderr && r.stderr.trim()) rec.stderrTail = r.stderr.trim().split("\n").slice(-4);
  return rec;
}

function replaceOnce(content, from, to, tag) {
  const parts = content.split(from);
  if (parts.length !== 2) throw new Error(`${tag}: anchor occurs ${parts.length - 1} times, expected 1`);
  return parts.join(to);
}
function replaceReOnce(content, re, to, tag) {
  const hits = content.match(new RegExp(re.source, "gm"));
  if (!hits || hits.length !== 1) throw new Error(`${tag}: regex anchor hits ${hits ? hits.length : 0}, expected 1`);
  return content.replace(re, to);
}

// Mu5: move the round-29 nudge correction paragraph from the round-32
// corrections section to immediately above its stale line (SCORECARD.md:1473
// at REV), renumbering the stale-line citation so the only broken property is
// the later-paragraph ordering.
function applyMu5(content) {
  const lines = content.split("\n");
  const staleIdx = lines.findIndex((l) => l.includes("C1 works operability, C3 works freshness. Saturation 8 / window 3; nudge"));
  if (staleIdx !== 1472) throw new Error(`Mu5: stale statement line ${staleIdx + 1}, expected 1473`);
  const pStart = lines.findIndex((l) => l.startsWith("Correction — supersedes the round-29 stagnation-nudge statement"));
  if (pStart < 0) throw new Error("Mu5: paragraph start not found");
  if (pStart < staleIdx) throw new Error("Mu5: paragraph unexpectedly above stale line");
  let pEnd = pStart;
  while (pEnd + 1 < lines.length && lines[pEnd + 1].trim() !== "") pEnd += 1;
  const paraLen = pEnd - pStart + 1;
  if (paraLen !== 5) throw new Error(`Mu5: paragraph is ${paraLen} lines, expected 5`);
  const blankAfter = lines[pEnd + 1] === "";
  lines.splice(pStart, paraLen + (blankAfter ? 1 : 0));
  const inserted = [...linesAndPara(content, pStart, paraLen), ""];
  // recompute: re-extract para text from original content
  function linesAndPara(orig, start, len) {
    const origLines = orig.split("\n");
    const para = origLines.slice(start, start + len).map((l) => l);
    const newStale1Based = staleIdx + para.length + 1 + 1; // insertAt=staleIdx, +inserted blank, 1-based
    return para.map((l) => l.replace("`SCORECARD.md:1473`", `\`SCORECARD.md:${newStale1Based}\``));
  }
  if (!inserted.slice(0, paraLen).some((l) => l.includes("`SCORECARD.md:1479`"))) throw new Error("Mu5: renumbering did not apply");
  lines.splice(staleIdx, 0, ...inserted);
  const staleNow = lines[staleIdx + inserted.length];
  if (!staleNow.includes("nudge")) throw new Error("Mu5: stale line not immediately after inserted block");
  return lines.join("\n");
}

const mutants = [
  { id: "Mu1-drop-citation-SCORECARD-m1", file: "SCORECARD.md",
    apply: (c) => replaceOnce(c, "`SCORECARD.md:1439`, `SCORECARD.md:1465`, `SCORECARD.md:1486`",
      "`SCORECARD.md:1439`, `SCORECARD.md:1486`", "Mu1") },
  { id: "Mu2-41-to-40-SCORECARD-m1", file: "SCORECARD.md",
    apply: (c) => replaceOnce(c, "`--selftest` (41/41): correction", "`--selftest` (40/40): correction", "Mu2") },
  { id: "Mu3a-nudge-active-to-inactive-SCORECARD-r29", file: "SCORECARD.md",
    apply: (c) => replaceOnce(c, "`SCORECARD.md:1473`: the nudge was active.", "`SCORECARD.md:1473`: the nudge was inactive.", "Mu3a") },
  { id: "Mu3b-nudge-active-to-inactive-LOG-r31", file: "LOG.md",
    apply: (c) => replaceOnce(c, "the nudge was active for round 31", "the nudge was inactive for round 31", "Mu3b") },
  { id: "Mu4a-remove-word-Correction-SKILL-m1", file: "SKILL.md",
    apply: (c) => replaceReOnce(c, /^- Correction [—-] supersedes the nine stale tallies/m,
      "- supersedes the nine stale tallies", "Mu4a") },
  { id: "Mu4b-remove-marker-phrase-SKILL-m1", file: "SKILL.md",
    apply: (c) => replaceReOnce(c, /^- Correction [—-] supersedes the nine stale tallies/m,
      "- the nine stale tallies", "Mu4b") },
  { id: "Mu5-move-r29-correction-above-stale-line", file: "SCORECARD.md", move: true },
];

const FILES = ["SCORECARD.md", "LOG.md", "SKILL.md", "corpus/README.md"];
const counterSha = () => sha256(readFileSync(join(CLONE, "scripts/check-selfassessment.mjs"), "utf8"));
if (counterSha() !== FROZEN_COUNTER_SHA) throw new Error("counter bytes != frozen digest; aborting");

const resultsPath = join(OUT, "results.jsonl");
const emit = (rec) => {
  appendFileSync(resultsPath, JSON.stringify(rec) + "\n");
  console.log(JSON.stringify(rec));
};

restore();
const pristine = { ...runCounter("pristine-control"), rev: REV, tree: git(["rev-parse", `${REV}^{tree}`]) };
emit(pristine);

for (const m of mutants) {
  restore();
  const before = { head: REV, tree: git(["rev-parse", `${REV}^{tree}`]), fileBlob: git(["rev-parse", `${REV}:${m.file}`]) };
  const orig = readFileSync(join(CLONE, m.file), "utf8");
  const next = m.move ? applyMu5(orig) : m.apply(orig);
  writeFileSync(join(CLONE, m.file), next);
  git(["add", "-A"]);
  git(["-c", "user.name=MutC2Corrections", "-c", "user.email=MutC2Corrections@scratch.local", "commit", "-qm", `mutant ${m.id}`]);
  const mrev = git(["rev-parse", "HEAD"]);
  const rec = { mutant: m.id, before, rev: mrev, tree: git(["rev-parse", `${mrev}^{tree}`]), fileBlob: git(["rev-parse", `${mrev}:${m.file}`]) };
  Object.assign(rec, runCounter(m.id));
  rec.verdict = rec.mismatches > 0 ? "killed" : rec.exit === 0 ? "SURVIVOR" : "inconclusive";
  rec.expected = m.expected;
  writeFileSync(join(OUT, `${m.id}.json`), JSON.stringify(rec, null, 2));
  emit({ mutant: m.id, exit: rec.exit, mismatches: rec.mismatches, verdict: rec.verdict, counted: rec.counted, rev: mrev, tree: rec.tree, fileBlob: rec.fileBlob });
}

restore();
const restored = { ...runCounter("restored-control"), rev: git(["rev-parse", "HEAD"]), tree: git(["rev-parse", "HEAD^{tree}"]) };
const restoration = {
  head: git(["rev-parse", "HEAD"]),
  porcelain: git(["status", "--porcelain"]),
  counterSha: counterSha(),
  blobsAtRev: Object.fromEntries(FILES.map((f) => [f, git(["rev-parse", `${REV}:${f}`])])),
  worktreeSha256: Object.fromEntries(FILES.map((f) => [f, sha256(readFileSync(join(CLONE, f), "utf8"))])),
  restoredControl: restored,
};
writeFileSync(join(OUT, "restoration.json"), JSON.stringify(restoration, null, 2));
emit({ tag: "restored-control", exit: restored.exit, mismatches: restored.mismatches, head: restoration.head, counterSha: restoration.counterSha });
console.log("SWEEP-DONE");
