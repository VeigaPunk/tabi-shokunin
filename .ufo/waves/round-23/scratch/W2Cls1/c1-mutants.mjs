// Scratch (throwaway) falsifier for c1-refusal-arithmetic.
// Imports the landed auditor's exported audit()/fixtureCtx() and runs a 24-receipt
// fixture whose only moved part is the cited figure or one receipt's bytes.
import { audit, fixtureCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const MARK = "Background job limit reached";
const R = 90;
const D = `.ufo/waves/round-${R}`;
const lessonPath = `corpus/lessons/round-${R}.md`;

function receipt(i, text = `Failed to start background task jobs: Lane${i}: ${MARK} (100).`) {
  return JSON.stringify({ attempt: i, at: "2026-10-25T00:00:00Z", result: { text }, spawnedSeats: 0 });
}

function fixture({ receipts = 24, markers = 24, cite = "24 whole-payload refusals", extra = {} } = {}) {
  const files = {};
  for (let i = 1; i <= receipts; i += 1) {
    const body = i <= markers ? receipt(i) : receipt(i, "Failed to start background task jobs: LaneX: payload invalid (400).");
    files[`${D}/w1-cap-refusal-${String(i).padStart(2, "0")}.json`] = body;
  }
  files[`${D}/w1-spec.json`] = JSON.stringify({ wave: "w1", maxLanes: 24, items: [{ name: "A" }, { name: "B" }] });
  files[lessonPath] = [
    `# Round${R}`,
    "",
    "## Gate",
    "",
    `${cite}.`,
    "Spot-check: reviewer agreement on one admit and one reject (fixture).",
    "",
    "## Mistakes",
    "",
    "none",
    "",
  ].join("\n");
  Object.assign(files, extra);
  const report = ["# fixture report", "", "**Stale-lane:** none — attempt 1 graded.", ""].join("\n");
  return { files, report };
}

function run(fx) {
  const policy = { sighting: { dispatch: { swarm: { waveMinLanes: 1, waveMaxLanes: 24 } } } };
  const r = audit(fixtureCtx(fx.files), {
    round: R,
    policy,
    roundCap: 4,
    reportText: fx.report,
    lessonText: fx.files[lessonPath],
  });
  const c1 = r.findings.filter((f) => f.class === "c1-refusal-arithmetic");
  return { classes: r.findingClasses, c1: c1.map((f) => ({ cited: f.cited, derived: f.derived, detail: f.detail })) };
}

const cases = [
  ["baseline-24-markers-cite-24", fixture()],
  ["ticket: 23-of-24-markers, cite 24", fixture({ markers: 23, cite: "24 whole-payload refusals" })],
  ["same-23-markers, cite 23 (non-marker not counted)", fixture({ markers: 23, cite: "23 whole-payload refusals" })],
  ["24-markers, lesson cites nothing", fixture({ cite: "the wave was refused at the host cap" })],
  ["24-markers, cite 23 (round-22 shape)", fixture({ cite: "23 whole-payload refusals" })],
  ["24-markers, lesson stale 23 beside corrected 24", fixture({ cite: "23 whole-payload refusals; earlier count 23, now 24 whole-payload refusals" })],
  [
    "24 markers, one receipt mentions the cap in a note only",
    fixture({
      extra: {
        [`${D}/w1-cap-refusal-25.json`]: JSON.stringify({
          attempt: 25,
          result: { text: "Spawned 2 background agents; all seats started." },
          note: `an earlier attempt died after '${MARK}' (100)`,
          spawnedSeats: 2,
        }),
      },
    }),
  ],
  [
    "24 markers, one says 'Background jobs limit reached' (near-miss wording)",
    fixture({
      extra: {
        [`${D}/w1-cap-refusal-01.json`]: receipt(1, "Failed to start background task jobs: Lane1: Background jobs limit reached (100)."),
      },
    }),
  ],
];

const out = cases.map(([name, fx]) => ({ name, ...run(fx) }));
console.log(JSON.stringify(out, null, 2));
const bad = out.filter((c) => c.c1.length > 0 && c.classes.some((x) => x !== "c1-refusal-arithmetic"));
if (bad.length) console.error("ISOLATION FAILURE: " + JSON.stringify(bad.map((b) => b.name)));
