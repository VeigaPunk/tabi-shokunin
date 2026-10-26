// probe3.mjs — the real round-32 target document shapes, then hand the bytes to the
// production CLI path (--repo/--rev over a committed fixture repo).
import { readFileSync, writeFileSync } from "node:fs";
process.exit = () => {};
process.argv = ["node", "probe", "--json", "--repo", "/fast/scratch/hyaku/tabi-r32/CritC2Counter/tiny", "--rev", "HEAD"];
const m = await import("file:///fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/scripts/check-selfassessment.mjs");
const { m4Findings, capabilityRounds } = m;
const real = readFileSync("/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/SCORECARD.md", "utf8");

const axes32 =
  "Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; " +
  "Saturation 8 / window 3; nudge active; no axis retired.";
const capRow = (cell) =>
  "| Capability | What it can now do | Evidence pointer | First-working round |\n|---|---|---|---|\n" +
  `| webdriver-bidi-transport | 16 loopback BiDi rows | receipt | ${cell} |\n`;

const quotedCorrections =
  "## Round 32 — corrections\n\n" +
  "- `SCORECARD.md:1473`: correction — the line says `nudge inactive`; the derived state is `nudge active`.\n" +
  "- `SCORECARD.md:1515`: correction — the line says `nudge inactive`; the derived state is `nudge active`.\n" +
  "- `SCORECARD.md:1576`: correction — the line says `nudge inactive`; the derived state is `nudge active`.\n";
const safeCorrections =
  "## Round 32 — corrections\n\n" +
  "- `SCORECARD.md:1473`: correction — that stagnation-nudge statement is stale; the derived state is `nudge active` (capabilities last entered round 25).\n" +
  "- `SCORECARD.md:1515`: correction — that stagnation-nudge statement is stale; the derived state is `nudge active`.\n" +
  "- `SCORECARD.md:1576`: correction — that stagnation-nudge statement is stale; the derived state is `nudge active`.\n";

const doc = (corr, cell) =>
  real + "\n## Round 32 — declared claims\n\n" + axes32 + "\n\n" + capRow(cell) + "\n" + corr + "\n";

const docs = {
  "target-quoted-round32": doc(quotedCorrections, "round32"),
  "target-safe-round32": doc(safeCorrections, "round32"),
  "target-safe-poisoncell": doc(safeCorrections, "loopback rows 30 measured, round32"),
};

for (const [name, text] of Object.entries(docs)) {
  writeFileSync(`/fast/scratch/hyaku/tabi-r32/CritC2Counter/${name}.md`, text);
  const fs = m4Findings(text);
  const counted = fs.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded);
  console.log(`\n### ${name}  capabilityRounds=${JSON.stringify(capabilityRounds(text))}`);
  for (const f of fs.filter((x) => x.round >= 29)) {
    const c = f.observed !== null && f.observed !== f.claimed && !f.superseded;
    console.log(
      `  line=${f.line} round=${f.round} claimed=${f.claimed} observed=${f.observed ?? "-"}` +
        `${f.superseded ? " SUPERSEDED" : ""}${f.couldNotEvaluate ? ` CNE` : ""}${c ? "  <<COUNTED" : ""}`
    );
  }
  console.log(`  m4 counted=${counted.length}`);
}
