// W2Cls2 break driver: fixtureCtx audit() over c2-wave-caps edge cases.
import { audit, fixtureCtx } from "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/round-evidence-audit.mjs";

const DIR = ".ufo/waves/round-91";
const LESSON = "# lesson\n\n## Gate\n\nspot-check: done\n";
const REPORT = "## Stale-lane\n\n- attempt 1 complete\n\n## Landed changes\n\n- none\n";
// Fleet band from /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json
const BAND = { waveMinLanes: 32, waveMaxLanes: 64 };
const policy = { sighting: { dispatch: { swarm: BAND } } };

const items = (n) => Array.from({ length: n }, (_, i) => ({ name: `S${i}` }));
const spec = (maxLanes, n) => JSON.stringify({ wave: "w1", maxLanes, items: items(n) });
const spawn = (n) => JSON.stringify({ text: `Spawned ${n} background agents using reviewer.` });
const refusal = () =>
  JSON.stringify({ text: "Failed to start background task jobs: X: Background job limit reached (100)." });

function run(name, files, roundCap) {
  const ctx = fixtureCtx({
    "corpus/lessons/round-91.md": LESSON,
    ...files,
  });
  let out;
  try {
    out = audit(ctx, { round: 91, policy, roundCap, reportText: REPORT, lessonText: LESSON });
  } catch (e) {
    console.log(JSON.stringify({ name, threw: String(e) }));
    return;
  }
  const c2 = out.findings.find((f) => f.class === "c2-wave-caps");
  console.log(
    JSON.stringify({
      name,
      clean: out.clean,
      c2: c2 ? { cited: c2.cited, derived: c2.derived, detail: c2.detail } : null,
      others: out.findings.filter((f) => f.class !== "c2-wave-caps").map((f) => f.class),
    })
  );
}

// A: wave at exactly band edge (64 seats, spec maxLanes 64, items 64), round total 64 < cap 128 -> clean on c2
run("A-exactly-64-clean", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-spawn-result.json`]: spawn(64),
}, 128);

// B: two waves, 64+64 = exactly 128 at cap -> clean on c2
run("B-round-exactly-128-clean", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-spawn-result.json`]: spawn(64),
  [`${DIR}/w2-spec.json`]: spec(64, 64),
  [`${DIR}/w2-spawn-result.json`]: spawn(64),
}, 128);

// C: spec maxLanes 64 but items 65 (over-spec items, seats spawned 65) -> must trip
run("C-items65-maxLanes64", {
  [`${DIR}/w1-spec.json`]: spec(64, 65),
  [`${DIR}/w1-spawn-result.json`]: spawn(65),
}, 128);

// C2: spec maxLanes 64, items 65, spawned 64 (items overflow alone) -> must trip
run("C2-items-overflow-only", {
  [`${DIR}/w1-spec.json`]: spec(64, 65),
  [`${DIR}/w1-spawn-result.json`]: spawn(64),
}, 128);

// D: spec present, no spawn-result, no refusal, no validation -> unaccounted (not silent zero)
run("D-spec-no-receipt", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
}, 128);

// E: spec + validation but no spawn receipt -> unaccounted per implementation branch
run("E-spec-validation-only", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-validation.json`]: JSON.stringify({ policy: { source: "config", maxLanes: 64 } }),
}, 128);

// F: spec + refusal receipt only -> accounted as refusal, 0 spawned
run("F-spec-refusal-only", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-cap-refusal.json`]: refusal(),
}, 128);

// G: two waves 64 + 65 = 129 > 128 (round cap trip without band trip)
run("G-round-129", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-spawn-result.json`]: spawn(64),
  [`${DIR}/w2-spec.json`]: spec(64, 65),
  [`${DIR}/w2-spawn-result.json`]: spawn(65),
}, 128);

// H: unaccounted wave + real wave: does the accounted one still get counted in evidence?
run("H-mixed", {
  [`${DIR}/w1-spec.json`]: spec(64, 64),
  [`${DIR}/w1-spawn-result.json`]: spawn(64),
  [`${DIR}/w2-spec.json`]: spec(64, 64),
}, 128);
