// MutC1Counter — one-guard-at-a-time mutants of scripts/check-gate-mutants.mjs.
// Each spec's find string is asserted to occur exactly once in the pristine
// bytes before the copy is written. Scratch-only; the lane is never touched.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SRC = "/fast/scratch/hyaku/tabi-r30/MutC1Counter/clone/scripts/check-gate-mutants.mjs";
const OUT = "/fast/scratch/hyaku/tabi-r30/MutC1Counter/mutants";

const specs = [
  { id: "M01-find-exactly-once", guard: "find string must occur exactly once in pristine gate bytes",
    find: `if (n !== 1) throw new Refusal(`,
    replace: `if (n < 1) throw new Refusal(` },
  { id: "M02-mutant-aware-scan-off", guard: "fault replacement text must not occur in pristine bytes outside the find site",
    find: `if (m.kind === "fault" && m.replace.replace(/\\s+/g, "").length >= LITERAL_MIN) {`,
    replace: `if (false && m.kind === "fault" && m.replace.replace(/\\s+/g, "").length >= LITERAL_MIN) {` },
  { id: "M03-find-site-subtraction-off", guard: "outside count subtracts occurrences of replace inside the find string itself",
    find: `const outside = occurrences(src, m.replace) - occurrences(m.find, m.replace);`,
    replace: `const outside = occurrences(src, m.replace);` },
  { id: "M04-pristine-clean-refusal-off", guard: "pristine self-test not clean => could-not-evaluate",
    find: `if (!res.clean) {`,
    replace: `if (false) {` },
  { id: "M05-benign-accounting-off", guard: "killed benign mutants are counted in benign_killed",
    find: `const benignKilled = benign.filter((m) => m.killed).map((m) => m.id);`,
    replace: `const benignKilled = [];` },
  { id: "M06-crash-not-killed", guard: "a run that is not clean (incl. crash exit!=0/1) counts as killed",
    find: `const killed = !res.clean;`,
    replace: `const killed = res.exit === 1;` },
  { id: "M06b-timeout-flag-off", guard: "ETIMEDOUT forces not-clean regardless of exit",
    find: `const timedOut = r.error && r.error.code === "ETIMEDOUT";`,
    replace: `const timedOut = false;` },
  { id: "M07-clean-conjunction-drop", guard: "clean requires fault_survivors 0 AND benign_killed 0",
    find: `clean: survivors.length === 0 && benignKilled.length === 0,`,
    replace: `clean: survivors.length === 0,` },
  { id: "M08-duplicate-id-accepted", guard: "catalogue parse refuses duplicate mutant id",
    find: `if (ids.has(m.id)) throw new Refusal(`,
    replace: `if (false) throw new Refusal(` },
  { id: "M09-unknown-kind-accepted", guard: "catalogue parse refuses kind other than fault|benign",
    find: `if (m.kind !== "fault" && m.kind !== "benign") throw new Refusal(`,
    replace: `if (false) throw new Refusal(` },
  { id: "M10-identity-mutant-accepted", guard: "catalogue parse refuses find === replace",
    find: `if (m.find === m.replace) throw new Refusal(`,
    replace: `if (false) throw new Refusal(` },
  { id: "M11-gate-path-dotdot-accepted", guard: "catalogue parse refuses gate script path containing ..",
    find: `|| g.script.includes("..")) throw new Refusal(`,
    replace: `) throw new Refusal(` },
];

const occ = (h, n) => { let c = 0, i = h.indexOf(n); while (i !== -1) { c += 1; i = h.indexOf(n, i + n.length); } return c; };
const pristine = readFileSync(SRC, "utf8");
console.log(`pristine\t${createHash("sha256").update(pristine).digest("hex")}`);
for (const s of specs) {
  const n = occ(pristine, s.find);
  if (n !== 1) { console.error(`SPEC ${s.id}: find occurs ${n} times in pristine (must be 1) — aborting`); process.exit(1); }
  const mutated = pristine.replace(s.find, () => s.replace);
  if (occ(mutated, s.replace) < 1) { console.error(`SPEC ${s.id}: replace absent after mutation — aborting`); process.exit(1); }
  writeFileSync(`${OUT}/${s.id}.mjs`, mutated);
  console.log(`${s.id}\t${createHash("sha256").update(mutated).digest("hex")}\t${JSON.stringify(s.find)} -> ${JSON.stringify(s.replace)}`);
}
