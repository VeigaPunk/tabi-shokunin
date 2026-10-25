import { planSwarmWave } from "./ufo-swarm-wave.mjs";
const items = (n) => Array.from({length: n}, (_, i) => ({ role: "reviewer", prompt: `probe lane ${i}` }));
const cases = [
  ["v2 64-100, spec 65, n=65", { maxLanes: 100, minLanes: 16, waveMinLanes: 64, waveMaxLanes: 100 }, 65, 65],
  ["v2 64-100, spec 100, n=65", { maxLanes: 100, minLanes: 16, waveMinLanes: 64, waveMaxLanes: 100 }, 100, 65],
  ["v2 64-100, spec 65, n=66", { maxLanes: 100, minLanes: 16, waveMinLanes: 64, waveMaxLanes: 100 }, 65, 66],
  ["v1 32-64, spec 65, n=65", { maxLanes: 100, minLanes: 16, waveMinLanes: 32, waveMaxLanes: 64 }, 65, 65],
  ["alpha 16-32, spec 65, n=65", { maxLanes: 100, minLanes: 16, waveMinLanes: 16, waveMaxLanes: 32 }, 65, 65],
];
for (const [label, swarm, declared, n] of cases) {
  const policy = { source: "config", ...swarm, rampBatchSize: 5, rampIntervalMs: 700, globalRunnerCeiling: 1056 };
  try {
    const p = planSwarmWave({ wave: "probe", reportDir: "probe", maxLanes: declared, items: items(n) }, { policy });
    console.log(`${label}: PASS total=${p.counts.total} cap=${p.policy.maxLanes} declared=${p.policy.declaredMaxLanes} band=${p.policy.waveMinLanes}-${p.policy.waveMaxLanes}`);
  } catch (e) {
    console.log(`${label}: REFUSE ${e.code}: ${e.message}`);
  }
}
