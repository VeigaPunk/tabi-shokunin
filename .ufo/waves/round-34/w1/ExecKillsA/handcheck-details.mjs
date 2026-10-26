import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const D = process.env.S; // scratch dir holding an edited clone
const COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs";
const src = readFileSync(COUNTER, "utf8");
const a = src.indexOf("const MUTANTS = Object.freeze([");
const b = src.indexOf("\n]);", a);
const M = JSON.parse(src.slice(a + "const MUTANTS = Object.freeze(".length, b + 2));
const G = readFileSync(D + "/clone/scripts/check-bidi-runtime.mjs", "utf8");
const out = {};
const run = (file, caseId) => {
  const r = spawnSync("node", [file, "--selftest", "--json"], { encoding: "utf8", maxBuffer: 1e8, env: { ...process.env, TMPDIR: D + "/tmp" } });
  const j = JSON.parse(r.stdout);
  const c = j.results.find((x) => x.id === caseId);
  return { exit: r.status, ok: c.ok, reason: c.reason, detail: c.detail };
};
const CASE = { M01: "v3-a-m01-duplicate-id-twice", M03: "v3-a-m03-measured-cell-uppercase", M06: "v3-a-m06-session-id-uppercase", M08: "v3-a-m08-context-id-lowercase", M09: "v3-a-m09-driver-imports-rows", M10: "v3-a-m10-driver-imports-servefixture" };
for (const id of ["M01", "M03", "M06", "M08", "M09", "M10"]) {
  const m = M.find((x) => x.id === id);
  const dir = `${D}/tmp/mut-${id}-json`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/check-bidi-runtime.mjs`, G.replace(m.find, m.replace));
  const mu = run(`${dir}/check-bidi-runtime.mjs`, CASE[id]);
  const pr = run(D + "/clone/scripts/check-bidi-runtime.mjs", CASE[id]);
  out[id] = { pristine: pr, mutant: mu };
  console.log(`${id}: pristine exit=${pr.exit} admitted-detail=${JSON.stringify(pr.detail)} | mutant exit=${mu.exit} detail=${JSON.stringify(mu.detail)}`);
}
writeFileSync(D + "/out/detail-comparison.json", JSON.stringify(out, null, 2) + "\n");
