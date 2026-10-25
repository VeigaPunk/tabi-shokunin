// W2Cls4: same audit() code path as the CLI, fed round-23's working-tree bytes through
// fixtureCtx — round 23 has NO committed tree yet, so gitCtx cannot read it.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { audit, fixtureCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const root = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const list = (extraArgs = []) =>
  execFileSync("find", [`.ufo/waves/round-23`, "-type", "f", ...extraArgs], { cwd: root })
    .toString("utf8").split("\n").filter(Boolean).sort();

function run(label, paths) {
  const files = {};
  for (const p of paths) files[p] = readFileSync(`${root}/${p}`, "utf8");
  const reportText = readFileSync(`${root}/.ufo/waves/round-23/scratch/W2Cls4/r0-none.md`, "utf8");
  const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
  const res = audit(fixtureCtx(files), { round: 23, policy, roundCap: 100, reportText, lessonText: null });
  const attemptFiles = paths.filter((f) => /attempt[^/]*\.json$/.test(f));
  const c4 = res.findings.filter((f) => f.class === "c4-stale-attempts");
  console.log(JSON.stringify({
    label, files: paths.length, attemptArtifacts: attemptFiles,
    c4: c4.map((f) => ({ derived: f.derived, detail: f.detail })),
    spawnResults: paths.filter((p) => /-spawn-result\.json$/.test(p)),
  }, null, 1));
}

const all = list();
run("round-23 without scratch", all.filter((p) => !p.startsWith(".ufo/waves/round-23/scratch/")));
run("round-23 including scratch", all);
