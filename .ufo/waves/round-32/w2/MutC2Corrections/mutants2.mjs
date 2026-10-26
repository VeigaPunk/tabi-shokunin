// MutC2Corrections — follow-up: citation-drop mutants for the corpus/README.md
// and SKILL.md round-32 corrections (the two correction paragraphs not yet
// proven load-bearing by a killed mutant).
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
    rec.mismatches = j.mismatches; rec.counted = j.counted;
    rec.couldNotEvaluate = j.couldNotEvaluate; rec.superseded = j.superseded; rec.clean = j.clean;
  }
  return rec;
}
function replaceOnce(content, from, to, tag) {
  const parts = content.split(from);
  if (parts.length !== 2) throw new Error(`${tag}: anchor occurs ${parts.length - 1} times, expected 1`);
  return parts.join(to);
}

const mutants = [
  { id: "Mu8-drop-citation-README-m1", file: "corpus/README.md",
    apply: (c) => replaceOnce(c, "at `corpus/README.md:613` and `corpus/README.md:668`",
      "at `corpus/README.md:668`", "Mu8") },
  { id: "Mu9-drop-citation-SKILL-m1", file: "SKILL.md",
    apply: (c) => replaceOnce(c, "`SKILL.md:2479`, `SKILL.md:2515`, `SKILL.md:2530`",
      "`SKILL.md:2479`, `SKILL.md:2530`", "Mu9") },
];

if (sha256(readFileSync(join(CLONE, "scripts/check-selfassessment.mjs"), "utf8")) !== FROZEN_COUNTER_SHA) throw new Error("counter bytes != frozen digest; aborting");
const resultsPath = join(OUT, "results.jsonl");
const emit = (rec) => { appendFileSync(resultsPath, JSON.stringify(rec) + "\n"); console.log(JSON.stringify(rec)); };

restore();
for (const m of mutants) {
  restore();
  const before = { head: REV, tree: git(["rev-parse", `${REV}^{tree}`]), fileBlob: git(["rev-parse", `${REV}:${m.file}`]) };
  const next = m.apply(readFileSync(join(CLONE, m.file), "utf8"));
  writeFileSync(join(CLONE, m.file), next);
  git(["add", "-A"]);
  git(["-c", "user.name=MutC2Corrections", "-c", "user.email=MutC2Corrections@scratch.local", "commit", "-qm", `mutant ${m.id}`]);
  const mrev = git(["rev-parse", "HEAD"]);
  const rec = { mutant: m.id, before, rev: mrev, tree: git(["rev-parse", `${mrev}^{tree}`]), fileBlob: git(["rev-parse", `${mrev}:${m.file}`]) };
  Object.assign(rec, runCounter(m.id));
  rec.verdict = rec.mismatches > 0 ? "killed" : rec.exit === 0 ? "SURVIVOR" : "inconclusive";
  writeFileSync(join(OUT, `${m.id}.json`), JSON.stringify(rec, null, 2));
  emit({ mutant: m.id, exit: rec.exit, mismatches: rec.mismatches, verdict: rec.verdict, counted: rec.counted, rev: mrev, tree: rec.tree, fileBlob: rec.fileBlob });
}
restore();
const restoration = {
  head: git(["rev-parse", "HEAD"]), porcelain: git(["status", "--porcelain"]),
  counterSha: sha256(readFileSync(join(CLONE, "scripts/check-selfassessment.mjs"), "utf8")),
  restoredControl: runCounter("restored-control-2"),
};
writeFileSync(join(OUT, "restoration-2.json"), JSON.stringify(restoration, null, 2));
emit({ tag: "restored-control-2", exit: restoration.restoredControl.exit, mismatches: restoration.restoredControl.mismatches, head: restoration.head });
console.log("SWEEP2-DONE");
