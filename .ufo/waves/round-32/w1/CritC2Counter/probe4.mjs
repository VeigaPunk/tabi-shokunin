// probe4.mjs — does the phrasing miss at SCORECARD.md:523 change the freeze count,
// and what protects it? Mutations of the real document only.
import { readFileSync } from "node:fs";
process.exit = () => {};
process.argv = ["node", "probe", "--json", "--repo", "/fast/scratch/hyaku/tabi-r32/CritC2Counter/tiny", "--rev", "HEAD"];
const m = await import("file:///fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/scripts/check-selfassessment.mjs");
const { m4Findings } = m;
const real = readFileSync("/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/SCORECARD.md", "utf8");
const lines = real.split("\n");
const report = (label, text) => {
  const fs = m4Findings(text);
  const c = fs.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded);
  const r12 = fs.filter((f) => f.round === 12);
  console.log(`\n### ${label}`);
  console.log(`  m4 total=${fs.length} counted=${c.length} counted lines=${c.map((f) => f.line).join(",")}`);
  for (const f of r12) console.log(`  round12 line=${f.line} claimed=${f.claimed} observed=${f.observed ?? "-"}${f.couldNotEvaluate ? " CNE=" + f.couldNotEvaluate : ""}`);
  return c;
};

report("control: real SCORECARD.md", real);

// 1. turn the round-12 phrasing into the matchable one, nothing else.
const l523 = lines.findIndex((l) => l.includes("this round does not use the nudge"));
console.log(`\nline ${l523 + 1}: ${JSON.stringify(lines[l523])}`);
const m1 = [...lines];
m1[l523] = m1[l523].replace("this round does not use the nudge.", "nudge inactive.");
report("1. :523 -> `nudge inactive.` (phrase now matches, inputs still unrecognized)", m1.join("\n"));

// 2. same, plus the round-12 group is given the label forms the extractor needs.
const m2 = [...m1];
const at456 = m2.findIndex((l) => l.startsWith("## Round 12"));
m2.splice(at456 + 2, 0, "Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8; Saturation 8 / window 3;");
report("2. + `Axes at round start:`/`Saturation 8 / window 3` injected into round 12", m2.join("\n"));

// 3. delta: is round 12's derived state active? (capability at 13 is outside 9..11)
const m3 = [...lines];
const at456b = m3.findIndex((l) => l.startsWith("## Round 12"));
m3.splice(at456b + 2, 0, "Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8; Saturation 8 / window 3; nudge inactive;");
report("3. same injection, phrasing untouched (control for the 2. delta)", m3.join("\n"));
