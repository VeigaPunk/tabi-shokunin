import { planSwarmWave } from "/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs";
const N = 65;
const items = Array.from({length: N}, (_, i) => ({ role: "reviewer", prompt: `probe lane ${i}` }));
const policy = { source: "config", maxLanes: 100, minLanes: 16, waveMinLanes: 64, waveMaxLanes: 100, rampBatchSize: 5, rampIntervalMs: 700, globalRunnerCeiling: 1056 };
for (const declared of [65, 64]) {
  try {
    const plan = planSwarmWave({ wave: `probe-${declared}`, reportDir: "probe", maxLanes: declared, items }, { policy });
    console.log(JSON.stringify({ declared, ok: true, total: plan.counts.total, floor: plan.policy.waveMinLanes, ceiling: plan.policy.waveMaxLanes, cap: plan.policy.maxLanes, declaredMaxLanes: plan.policy.declaredMaxLanes, hardCeiling: plan.policy.hardCeiling }));
  } catch (e) {
    console.log(JSON.stringify({ declared, ok: false, code: e.code ?? e.name, message: e.message }));
  }
}
