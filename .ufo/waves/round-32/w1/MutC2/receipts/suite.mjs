// suite.mjs — MutC2 falsifier fixtures for check-selfassessment.mjs (frozen v3).
// Builds one throwaway git repo per case under FXBASE, commits it, and runs the
// counter under test (COUNTER env) with --repo <fixture> --rev <sha> --json.
// Emits one JSON line per case: { id, exit, mismatches, counted, couldNotEvaluate, superseded }.
import { spawnSync } from "node:child_process";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const COUNTER = process.env.COUNTER;
const BASE = process.env.FXBASE;

function sh(root, args) {
  const r = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" },
  });
  if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr}`);
  return r.stdout;
}

function fixture(id, files) {
  const root = join(BASE, id);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  for (const [rel, src] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, src);
  }
  sh(root, ["init", "-q", "-b", "main"]);
  sh(root, ["config", "user.email", "fx@tabi.local"]);
  sh(root, ["config", "user.name", "fx"]);
  const top = sh(root, ["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`${id}: toplevel ${top} != ${root}`);
  sh(root, ["add", "-A"]);
  sh(root, ["commit", "-q", "-m", "fx"]);
  return root;
}

function runCounter(root, rev) {
  const r = spawnSync("node", [COUNTER, "--repo", root, "--rev", rev, "--json"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  let p = null;
  try { p = JSON.parse(r.stdout); } catch {}
  return {
    exit: r.status,
    mismatches: p ? p.mismatches : null,
    counted: p ? p.counted : null,
    couldNotEvaluate: p ? p.couldNotEvaluate : null,
    superseded: p ? p.superseded : null,
    stderr: p ? undefined : `${r.stderr}`.slice(0, 300),
  };
}

const GATE_OK_13 = `process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=13 passed=13\\n");\n`;
const GATE_CLEAN_EXIT1 = `process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=12 passed=12\\n");\nprocess.exit(1);\n`;
const GATE_FAILED_EXIT0 = `process.stdout.write("FIXTURE_SELFTEST verdict=failed cases=13 passed=12\\n");\n`;

// Statement line is 9 (as in the frozen selftest's nudgeDoc): corrections can cite SCORECARD.md:9.
function nudgeDoc({ cap, said, adjacency = 8, proseCap = null, tail = "", correction = "" }) {
  const axes = `Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency ${adjacency}; Saturation 8 / window 3; nudge ${said}; no axis retired.${tail}`;
  const parts = [
    "# scorecard",
    "",
  ];
  if (proseCap === null) {
    parts.push(
      "| Capability | What it can now do | Evidence pointer | First-working round |",
      "|---|---|---|---|",
      `| fixture-cap | x | y | ${cap} |`,
      "",
    );
  }
  parts.push("## Round 5 — declared claims", "");
  if (proseCap !== null) parts.push(`Capability fixture-cap: First-working round: ${proseCap}.`, "");
  if (correction) {
    parts.push(axes, "", "## Round 6 — corrections", "", correction, "");
  } else {
    parts.push(axes, "");
  }
  return parts.join("\n");
}

function twoSectionDoc() {
  return [
    "# scorecard",
    "",
    "## Round 5 — inputs",
    "",
    "Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8; Saturation 8 / window 3.",
    "",
    "## Round 5 — claims",
    "",
    "The stagnation nudge is inactive for round 5.",
    "",
  ].join("\n");
}

function tallyDoc(claim) {
  return [
    "# scorecard",
    "",
    "## Round 23 — executed disposition",
    "",
    `| C1 | \`scripts/check-fixture.mjs\` ${claim} | met |`,
    "",
  ].join("\n");
}

const CASES = [
  { id: "FC-m1-control-stale-tally", expect: "E1 m1", files: (d) => ({ "SCORECARD.md": tallyDoc("`--selftest` (12/12)"), "scripts/check-fixture.mjs": GATE_OK_13 }) },
  { id: "F1-window-far-boundary", expect: "E1 m4 (cap at round-window counts as recent)", files: (d) => ({ "SCORECARD.md": nudgeDoc({ cap: 2, said: "active" }) }) },
  { id: "F2-saturation-boundary", expect: "E0 clean (axis exactly at line satisfies 'at or above')", files: (d) => ({ "SCORECARD.md": nudgeDoc({ cap: 1, said: "active" }) }) },
  { id: "F3-prose-cap-in-window", expect: "E1 m4 (prose First-working round inside window)", files: (d) => ({ "SCORECARD.md": nudgeDoc({ proseCap: 4, said: "active" }) }) },
  { id: "F4-correction-uncited", expect: "E1 m4 (correction lacks SCORECARD.md:9 citation)", files: (d) => ({ "SCORECARD.md": nudgeDoc({ cap: 1, said: "inactive", correction: "Correction: the stagnation nudge was active for round 5." }) }) },
  { id: "F5-correction-wrong-state", expect: "E1 m4 (correction states inactive, derived active)", files: (d) => ({ "SCORECARD.md": nudgeDoc({ cap: 1, said: "inactive", correction: "Correction (supersedes `SCORECARD.md:9`): the stagnation nudge was inactive for round 5, as stated." }) }) },
  { id: "F6-self-paragraph-supersedes", expect: "E1 m4 (statement paragraph must not clear itself)", files: (d) => ({ "SCORECARD.md": nudgeDoc({ cap: 1, said: "inactive", tail: " Correction: supersedes SCORECARD.md:9 — nudge was active." }) }) },
  { id: "F7-oracle-verdict-failed-exit0", expect: "E0, couldNotEvaluate 1 (unclean verdict is no oracle)", files: (d) => ({ "SCORECARD.md": tallyDoc("`--selftest` (12/12)"), "scripts/check-fixture.mjs": GATE_FAILED_EXIT0 }) },
  { id: "F8-oracle-nonzero-exit-clean", expect: "E0, couldNotEvaluate 1 (nonzero exit is no oracle)", files: (d) => ({ "SCORECARD.md": tallyDoc("`--selftest` (13/13)"), "scripts/check-fixture.mjs": GATE_CLEAN_EXIT1 }) },
  { id: "F9-same-round-two-sections", expect: "E1 m4 (Round 5 sections merge by round number)", files: (d) => ({ "SCORECARD.md": twoSectionDoc() }) },
];

for (const c of CASES) {
  const root = fixture(c.id, c.files());
  const rev = sh(root, ["rev-parse", "HEAD"]).trim();
  const out = runCounter(root, rev);
  console.log(JSON.stringify({ id: c.id, expect: c.expect, ...out }));
}
