// probe2.mjs — real-document mutations for the m4 correction path.
import { readFileSync } from "node:fs";
process.exit = () => {};
process.argv = ["node", "probe", "--json", "--repo", "/fast/scratch/hyaku/tabi-r32/CritC2Counter/tiny", "--rev", "HEAD"];
const m = await import("file:///fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/scripts/check-selfassessment.mjs");
const { m4Findings } = m;
const real = readFileSync("/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/SCORECARD.md", "utf8");
const lines = real.split("\n");
const idx = (pred) => lines.findIndex(pred);

const report = (label, text) => {
  const fs = m4Findings(text).filter((f) => f.round >= 29);
  console.log(`\n### ${label}`);
  for (const f of fs) {
    const counted = f.observed !== null && f.observed !== f.claimed && !f.superseded;
    console.log(
      `  line=${f.line} round=${f.round} claimed=${f.claimed} observed=${f.observed ?? "-"}` +
        `${f.superseded ? " SUPERSEDED" : ""}${f.couldNotEvaluate ? ` CNE` : ""}${counted ? "  <<COUNTED" : ""}`
    );
  }
  console.log(`  counted(round>=29)=${fs.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded).length}`);
};

const append = (text) => real + "\n" + text + "\n";

// A: prescribed shape — correction bullet at the END of the document under a round heading.
report(
  "A1 correction appended in `## Round 32 — corrections`, quoting the stale phrase",
  append(
    "## Round 32 — corrections\n\nThe m4 class reads the round-29 statement as stale (`SCORECARD.md:1473`).\n\n" +
      "- `SCORECARD.md:1473`: correction — the line says `nudge inactive`; the derived state is `nudge active`.\n"
  )
);
report(
  "A2 same placement, no round heading (`## Corrections (round 32)`)",
  append("## Corrections (round 32)\n\n- `SCORECARD.md:1473`: correction — the derived state is `nudge active`.\n")
);
report(
  "A3 prescribed shape, correction worded WITHOUT quoting the stale phrase",
  append(
    "## Round 32 — corrections\n\n- `SCORECARD.md:1473`: correction — the stagnation-nudge statement there is stale; the derived state is `nudge active` (capabilities last entered round 25).\n"
  )
);
report(
  "A4 correction placed inside the existing round-29 corrections section (line ~1458), before the statement",
  (() => {
    const at = idx((l) => l.startsWith("## Round 29 — corrections"));
    const copy = [...lines];
    copy.splice(at + 3, 0, "- `SCORECARD.md:1473`: correction — the derived state is `nudge active`.");
    return copy.join("\n");
  })()
);
report(
  "A5 correction cites the state-word line only (`SCORECARD.md:1474`)",
  append("## Round 32 — corrections\n\n- `SCORECARD.md:1474`: correction — the derived state is `nudge active`.\n")
);
report(
  "A6 correction cites a range covering both lines (`SCORECARD.md:1473-1474`)",
  append("## Round 32 — corrections\n\n- `SCORECARD.md:1473-1474`: correction — the derived state is `nudge active`.\n")
);
report(
  "A7 one paragraph with a range clears all three rounds (`SCORECARD.md:1470-1580`)",
  append("## Round 32 — corrections\n\n- `SCORECARD.md:1470-1580`: correction — the nudge was active for every round in the range.\n")
);
report(
  "A8 wrong-round correction: round-30 attribution clears the round-29 statement",
  append("## Round 32 — corrections\n\nCorrection — supersedes `SCORECARD.md:1473`: the nudge was active for round 30.\n")
);
report(
  "A9 ordinary prose using `correctly` + a shell range + `nudge active` clears without being a correction",
  append(
    "## Round 32 — waves and seats\n\nRe-ran `git grep -n nudge -- SCORECARD.md:1470-1580`; the instrument correctly reads the nudge active state.\n"
  )
);
report(
  "A10 correction in `## Round 32 — corrections` that quotes the stale phrase, plus a later paragraph stating the state",
  append(
    "## Round 32 — corrections\n\n- `SCORECARD.md:1473`: the stale line says `nudge inactive`.\n\n" +
      "Correction — supersedes `SCORECARD.md:1473`: the derived state is `nudge active`.\n"
  )
);

// B: capability-cell digit self-poisoning for the round that files the row.
const head32 =
  "## Round 32 — declared claims\n\nAxes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; Saturation 8 / window 3; nudge active;\n\n";
report(
  "B1 round-32 capability row whose last cell carries a digit in 29..31",
  append(
    head32 +
      "| Capability | What it can now do | Evidence pointer | First-working round |\n|---|---|---|---|\n| bidi-transport | 30 loopback rows over a BiDi session | receipt | round32 |\n"
  )
);
report(
  "B2 same table, cell = `round32` only",
  append(
    head32 +
      "| Capability | What it can now do | Evidence pointer | First-working round |\n|---|---|---|---|\n| bidi-transport | 30 loopback rows over a BiDi session | receipt | round32 |\n"
  )
);
report(
  "B3 same table, cell = `loopback rows 30 measured, round32`",
  append(
    head32 +
      "| Capability | What it can now do | Evidence pointer | First-working round |\n|---|---|---|---|\n| bidi-transport | x | receipt | loopback rows 30 measured, round32 |\n"
  )
);
report(
  "B4 control: cell = `32`",
  append(
    head32 +
      "| Capability | What it can now do | Evidence pointer | First-working round |\n|---|---|---|---|\n| bidi-transport | x | receipt | 32 |\n"
  )
);
