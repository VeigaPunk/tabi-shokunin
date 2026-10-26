// compare.mjs — compares each mutant's legs against the pristine baseline and
// verifies the restored pass is byte-behavior-identical to pristine.
import { readFileSync } from "node:fs";
const R = process.env.R;
const read = (p) => readFileSync(`${R}/${p}`, "utf8");
const j = (p) => JSON.parse(read(p));
const legASig = (n) => { const a = j(`${n}.A.json`); return { exit: read(`${n}.A.exit`).trim(), cases: a.cases, passed: a.passed, ok: a.ok, failed: a.results.filter((r) => !r.ok).map((r) => r.id) }; };
const legBMap = (n) => new Map(read(`${n}.B.jsonl`).trim().split("\n").map((l) => { const o = JSON.parse(l); return [o.id, o]; }));
const legCSig = (n) => { const c = j(`${n}.C.json`); return { exit: read(`${n}.C.exit`).trim(), mismatches: c.mismatches, counted: c.counted, couldNotEvaluate: c.couldNotEvaluate, superseded: c.superseded }; };

const pA = legASig("pristine"), pB = legBMap("pristine"), pC = legCSig("pristine");
console.log("PRISTINE_A", JSON.stringify(pA));
console.log("PRISTINE_C", JSON.stringify(pC));
for (const [, o] of pB) console.log("PRISTINE_B", JSON.stringify(o));

const muts = process.argv.slice(2);
for (const m of muts) {
  const dA = JSON.stringify(legASig(m)) !== JSON.stringify(pA);
  const mB = legBMap(m);
  const dB = [...pB.keys()].filter((k) => JSON.stringify(pB.get(k)) !== JSON.stringify(mB.get(k) || null));
  const dC = JSON.stringify(legCSig(m)) !== JSON.stringify(pC);
  const verdict = dA || dB.length > 0 || dC ? "KILLED" : "SURVIVED";
  console.log(`${m} verdict=${verdict} A:${dA ? "DIFF" : "same"} B-diff:[${dB.join(",")}] C:${dC ? "DIFF" : "same"}`);
  for (const k of dB) {
    console.log(`  killing-case ${k}`);
    console.log(`    pristine: ${JSON.stringify(pB.get(k))}`);
    console.log(`    mutant:   ${JSON.stringify(mB.get(k) || null)}`);
  }
  if (dA) console.log(`  killing-case selftest: pristine=${JSON.stringify(pA)} mutant=${JSON.stringify(legASig(m))}`);
  if (dC) console.log(`  killing-case reallane: pristine=${JSON.stringify(pC)} mutant=${JSON.stringify(legCSig(m))}`);
}

const rA = legASig("restored"), rB = legBMap("restored"), rC = legCSig("restored");
const restoredOk = JSON.stringify(rA) === JSON.stringify(pA)
  && JSON.stringify(rC) === JSON.stringify(pC)
  && [...pB.keys()].every((k) => JSON.stringify(pB.get(k)) === JSON.stringify(rB.get(k) || null))
  && pB.size === rB.size;
console.log(`RESTORED_MATCHES_PRISTINE ${restoredOk}`);
