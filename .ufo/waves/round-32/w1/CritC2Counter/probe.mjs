// probe.mjs — drive the FROZEN m4 instrument (check-selfassessment.mjs @ 4181fff)
// directly on fixture text. process.exit is stubbed so the module's main() is inert.
import { readFileSync } from "node:fs";
process.exit = () => {};
// main() runs at import and would evaluate the default repo: send it at a tiny inert fixture.
process.argv = ["node", "probe", "--json", "--repo", "/fast/scratch/hyaku/tabi-r32/CritC2Counter/tiny", "--rev", "HEAD"];
const SRC = "/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/scripts/check-selfassessment.mjs";
const m = await import(`file://${SRC}`);
const { m4Findings, capabilityRounds } = m;

const real = readFileSync("/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone/SCORECARD.md", "utf8");

const head = (round, axesLine, satLine = "Saturation 8 / window 3;") =>
  `## Round ${round} — declared claims\n\n${axesLine} ${satLine}\n\n`;

const show = (label, text) => {
  const fs = m4Findings(text);
  const counted = fs.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded);
  console.log(`\n### ${label}`);
  for (const f of fs) {
    console.log(
      `  line=${f.line} round=${f.round} claimed=${f.claimed} observed=${f.observed ?? "-"}` +
        `${f.superseded ? " SUPERSEDED" : ""}${f.couldNotEvaluate ? ` CNE=${f.couldNotEvaluate}` : ""}` +
        `${f.observed !== null && f.observed !== f.claimed && !f.superseded ? "  <<COUNTED" : ""}`
    );
  }
  console.log(`  counted=${counted.length}`);
  return { fs, counted };
};

const AX = "Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 9;";
// capability at round 1 => for round 5 (window 2..4) derived state is ACTIVE.
const capLine = "First-working round: 1.\n";

console.log("=== capabilityRounds(real SCORECARD.md) ===");
console.log(JSON.stringify(capabilityRounds(real)));

console.log("\n=== real m4 baseline ===");
show("real doc (all statements)", real);

console.log("\n=== F1: phrasing variants in a derived-ACTIVE round (target: every stale phrasing counts) ===");
for (const stmt of [
  "nudge inactive;",
  "the nudge is inactive;",
  "the stagnation nudge is not active;",
  "this round does not use the nudge;",
  "nudge waived;",
  "the nudge fires;",
  "the nudge remains inactive;",
  "no stagnation nudge this round;",
  "nudge state: inactive;",
  "nudge = inactive;",
  "the nudge is dormant;",
]) {
  show(`stmt: ${stmt}`, head(5, AX) + stmt + "\n" + capLine);
}

console.log("\n=== F2: statement outside any `## Round N` section ===");
show(
  "statement under `## Saturation` (derived-active round group elsewhere)",
  "## Saturation\n\nnudge inactive; saturation 8 / window 3.\n\n" +
    head(5, AX) + capLine + "no nudge statement in the round group.\n"
);
show(
  "statement in intro before the first round",
  "Intro: the stagnation nudge is inactive.\n\n" + head(5, AX) + capLine
);
show(
  "statement under `## Rounds 5-7` heading",
  "## Rounds 5-7 — dispositions\n\n" + AX + " Saturation 8 / window 3; nudge inactive.\n\n" + capLine
);

console.log("\n=== F3: axes paragraph in another section of the SAME round ===");
show(
  "axes in `## Round 5 — corrections`, statement in `## Round 5 — claims`",
  "## Round 5 — corrections\n\n" + AX + " Saturation 8 / window 3.\n\n" +
    capLine +
    "## Round 5 — declared claims\n\nnudge inactive;\n"
);
show(
  "axes in `## Round 4` section, statement in `## Round 5` section",
  "## Round 4 — dispositions\n\n" + AX + " Saturation 8 / window 3.\n\n" +
    capLine +
    "## Round 5 — declared claims\n\nnudge inactive;\n"
);
show(
  "axes + statement separated by a non-round `##` heading within the same round number",
  "## Round 5 — claims\n\n" + AX + "\n\n## Notes\n\ntext\n\n## Round 5 — disposition\n\nSaturation 8 / window 3; nudge inactive;\n"
);

console.log("\n=== F4: axis / saturation input label variants (real round-28 shape) ===");
show(
  "round-28 real shape: `axes depth 8, ...` (no label, no `at round start`)",
  "## Round 5 — declared claims\n\nBaseline `abc`; axes depth 9, coverage 9,\noperability 9, freshness 9, calibration 9, adjacency 9. Saturation 8 / window 3; nudge inactive;\n\n" + capLine
);
show(
  "`Axes at round start: depth: 9, ...` (colon after axis name)",
  "## Round 5 — claims\n\nAxes at round start: depth: 9, coverage: 9, operability: 9, freshness: 9, calibration: 9, adjacency: 9; Saturation 8 / window 3; nudge inactive;\n\n" + capLine
);
show(
  "axes list longer than 240 chars after the label",
  head(5, "Axes at round start: " + "noted above and reheard in the wave report; ".repeat(6) + "depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 9;") + "nudge inactive;\n" + capLine
);
show(
  "`Saturation line8 and window3` (real round-12 shape)",
  head(5, AX, "Saturation line8 and window3 retained;") + "nudge inactive;\n" + capLine
);
show(
  "axes given as a markdown table (real round-12 shape)",
  "## Round 5 — claims\n\n| Axis | Before → after |\n|---|---|\n| depth | 9 |\n| adjacency | 9 |\n\nSaturation 8 / window 3; nudge inactive;\n\n" + capLine
);

console.log("\n=== F5: capability entry shapes (does a capability in-window get seen?) ===");
const capShapes = [
  ["prose `First-working round: 3`", "First-working round: 3.\n"],
  ["prose `first-working3`", "aria capability remains first-working3.\n"],
  ["prose `First-working: 3`", "First-working: 3.\n"],
  ["prose `first working round 3`", "first working round 3.\n"],
  ["table, last cell numeric", "| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | 3 |\n"],
  ["table, last cell `round3`", "| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | round3 |\n"],
  ["table, last cell `fleet-round-3`", "| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | fleet-round-3 |\n"],
  ["table, header NOT last cell", "| Capability | First-working round | Evidence |\n|---|---|---|\n| x | 3 | y |\n"],
  ["table, word numeral `three`", "| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | three |\n"],
  ["table, last cell `x-v3` name", "| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | bi-transport-v3 |\n"],
];
for (const [label, capText] of capShapes) {
  // round 5, window 2..4: a capability claimed at round 3 makes the derived state INACTIVE.
  const t = "## Round 5 — claims\n\n" + AX + " Saturation 8 / window 3;\n\nnudge inactive;\n\n" + capText;
  show(`cap shape ${label}`, t);
}

console.log("\n=== F6: correction clearing (stale statement at line 5, derived ACTIVE) ===");
const stale = "nudge inactive;\n\n" + capLine;
const staleDoc = () => head(5, AX) + stale;
show("control (no correction)", staleDoc());
show(
  "ordinary text with `correctly` + citation + `nudge active`",
  staleDoc() + "\nThe counter correctly reads the nudge active state for this round (`SCORECARD.md:5`).\n"
);
show(
  "broad range citation clears several rounds at once",
  head(5, AX) + "nudge inactive;\n\n" + capLine +
    head(6, AX) + "nudge inactive;\n\n" +
    head(7, AX) + "nudge active;\n\n" +
    "Correction (supersedes `SCORECARD.md:1-3`): the nudge was active.\n"
);
show(
  "wrapped statement: correction cites the line holding the state word, not `nudge`",
  "## Round 5 — claims\n\n" + AX + " Saturation 8 / window 3;\nnudge\ninactive;\n\n" + capLine +
    "Correction (supersedes `SCORECARD.md:5`): the nudge was active for round 5.\n"
);
show(
  "same-line correction after the statement",
  head(5, AX) + "nudge inactive; correction — the nudge was active.\n\n" + capLine
);
show(
  "correction without a citation but with the right state",
  staleDoc() + "\nCorrection: the nudge was active for round 5.\n"
);

console.log("\n=== F7: rule quotation looks like a claim (derived INACTIVE round) ===");
// capability at round 4, round 5 window 2..4 => derived INACTIVE.
show(
  "quoted rule text inside the round group",
  head(5, AX) + "First-working round: 4.\n\nQuoting `AXES.md`: the nudge is active when every axis sits at or above the saturation line and no capability entered within the window.\n"
);
show(
  "grammar documentation listing both states",
  head(5, AX) + "First-working round: 4.\n\nThe accepted spellings are `nudge is active` and `nudge is inactive`.\n"
);

console.log("\n=== F8: spurious capability from a name digit (suppresses a true ACTIVE) ===");
show(
  "table row last cell `bi-transport-v3` under a First-working header",
  head(5, AX) + "nudge inactive;\n\n| Capability | Evidence | First-working round |\n|---|---|---|\n| x | y | bi-transport-v3 |\n"
);

console.log("\n=== F9: duplicate statement counted twice ===");
show(
  "same stale statement twice in one round group",
  head(5, AX) + "nudge inactive; no axis retired.\n\n### Planned\n\n- nudge inactive; lowest-axis obligation not claimed.\n\n" + capLine
);

console.log("\n=== F10: line-wrap merges `nudge` with a following unrelated `active` ===");
show(
  "`...nudge\\nactive...` across a wrap",
  head(5, AX) + "we do not read the stagnation nudge\nactive work continues on the same axis;\n\n" + capLine
);
