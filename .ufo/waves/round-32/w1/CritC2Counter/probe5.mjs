import { readFileSync } from "node:fs";
process.exit = () => {};
process.argv = ["node","probe","--json","--repo","/fast/scratch/hyaku/tabi-r32/CritC2Counter/tiny","--rev","HEAD"];
const m = await import("file:///fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/scripts/check-selfassessment.mjs");
const real = readFileSync("/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/SCORECARD.md","utf8");
const lines = real.split("\n");
const inject = (stmt) => {
  const c = [...lines];
  c.splice(c.findIndex((l)=>l.startsWith("## Round 12")) + 2, 0,
    "Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8; Saturation 8 / window 3;" + (stmt ? " " + stmt : ""));
  return c.join("\n");
};
for (const [label, stmt] of [["no statement", ""], ["nudge active;", "nudge active;"], ["nudge inactive;", "nudge inactive;"]]) {
  const fs = m.m4Findings(inject(stmt));
  const r = fs.filter((f)=>f.round===12);
  console.log(label, "->", JSON.stringify(r.map((f)=>({line:f.line,claimed:f.claimed,observed:f.observed}))), "counted(round12)=" + r.filter((f)=>f.observed!==null&&f.observed!==f.claimed&&!f.superseded).length);
}
