// Scratch probe (W2Mistakes): does c2's round-cap arm fire alone, and is c6's
// "LOG entry lands in" escape text-only (no hash resolution)?
import { audit, fixtureCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const policy = { sighting: { dispatch: { swarm: { waveMinLanes: 2, waveMaxLanes: 2 } } } };
const lesson = "## Gate\n\nSpot-check: x\n\n## Mistakes\n\nnone\n";
const files = () => ({
  "corpus/lessons/round-90.md": lesson,
  ".ufo/waves/round-90/w1-spec.json": JSON.stringify({ wave: "fx-w1", maxLanes: 2, items: [{ name: "A" }, { name: "B" }] }),
  ".ufo/waves/round-90/w1-spawn-result.json": JSON.stringify({ text: "Spawned 2 background agents using scout, reviewer." }),
  ".ufo/waves/round-90/w1/swarm-registry.json": JSON.stringify({ schema: "ufo-swarm-registry-v1", members: { A: { agentId: "x.A" }, B: { agentId: "x.B" } } }),
});
const wave2 = (f) => {
  f[".ufo/waves/round-90/w2-spec.json"] = JSON.stringify({ wave: "fx-w2", maxLanes: 2, items: [{ name: "C" }, { name: "D" }] });
  f[".ufo/waves/round-90/w2-spawn-result.json"] = JSON.stringify({ text: "Spawned 2 background agents using scout, reviewer." });
  f[".ufo/waves/round-90/w2/swarm-registry.json"] = JSON.stringify({ schema: "ufo-swarm-registry-v1", members: { C: { agentId: "x.C" }, D: { agentId: "x.D" } } });
};
const report = (row) => ["# r", "", "**Stale-lane:** none — attempt 1 graded.", "", "## Landed changes", "", "| Change | LOG.md entry | Commit |", "|---|---|---|", row, "", "## Before → after measurements", "", "none", ""].join("\n");

const ctx = (f, cf) => fixtureCtx(f, cf);
const run = (name, f, cf, rep, cap) => {
  const r = audit(ctx(f, cf), { round: 90, policy, roundCap: cap, reportText: rep, lessonText: lesson });
  console.log(name, "=>", JSON.stringify(r.findingClasses), r.findings.map((x) => x.detail));
};

// 1. round-cap arm alone: both waves at band cap 2, total 4, roundCap 3.
const f1 = files();
wave2(f1);
run("c2-round-arm-alone(cap3)", f1, {}, report("| x | `LOG.md` §x | `aaaaaaa` |"), 3);

// 2. c6: "lands in" names ccccccc, which carries no LOG.md either.
run(
  "c6-lands-in-nonLOG(cap4)",
  files(),
  { bbbbbbb: ["SCORECARD.md"], ccccccc: ["SCORECARD.md"] },
  report("| fixture change | LOG entry lands in `ccccccc` | `bbbbbbb` |"),
  4
);

// 3. control: same row without the "lands in" text.
run("c6-control-no-escape(cap4)", files(), { bbbbbbb: ["SCORECARD.md"] }, report("| fixture change | `LOG.md` §x | `bbbbbbb` |"), 4);
