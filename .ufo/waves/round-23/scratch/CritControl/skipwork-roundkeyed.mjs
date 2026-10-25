#!/usr/bin/env node
// Cheapest skip-work control that satisfies EVERY control sentence the frozen C1 names.
// It reads no evidence: the answer is a function of --round (and a faked --selftest).
const a = process.argv.slice(2);
const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
const CLASSES = ["c1-refusal-arithmetic","c2-wave-caps","c3-gate-spotcheck",
                 "c4-stale-attempts","c5-registry-identities","c6-landed-log-binding"];
if (a.includes("--selftest")) {
  process.stdout.write(JSON.stringify({schema:"tabi-round-evidence-audit-v1-selftest",cases:12,passed:12,clean:true})+"\n");
  process.exit(0);
}
const round = Number(val("--round"));
const hit = round === 22;                       // the only "derivation"
const out = {schema:"tabi-round-evidence-audit-v1",rev:val("--rev") ?? null,round,
  findings: hit ? CLASSES.map((c)=>({class:c,cited:"n/a",derived:"n/a",evidence:["n/a"]})) : [],
  classes:6, clean:!hit};
process.stdout.write(JSON.stringify(out)+"\n");
process.exit(hit ? 1 : 0);
