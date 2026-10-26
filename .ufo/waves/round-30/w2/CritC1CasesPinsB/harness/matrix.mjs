// Matrix: for each wrong-gate variant, (a) production mode over the four extracted
// fixtures (rows[].reasons + exit), (b) the gate's own --selftest over all cases.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const S = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB";
const fx = JSON.parse(readFileSync(`${S}/fx/fixtures.json`, "utf8"));
const CASES = Object.keys(fx);
const STABLE = "156.0.8078.47";
const env = { ...process.env, TMPDIR: `${S}/tmp` };
const results = {};

const runProd = (script, root, head) => {
  const r = spawnSync(process.execPath, [script, "--repo", root, "--rev", head, "--stable", STABLE, "--json"], { encoding: "utf8", env });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch {}
  return { exit: r.status, rows: parsed ? parsed.rows.map((x) => ({ id: x.id, resolved: x.resolved, verdict: x.verdict, reasons: x.reasons })) : null, clean: parsed ? parsed.clean : null, stderr: r.stderr.trim() };
};
const runSelftest = (script) => {
  const r = spawnSync(process.execPath, [script, "--selftest", "--json"], { encoding: "utf8", env });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch {}
  return { exit: r.status, failed: parsed ? parsed.results.filter((x) => !x.ok).map((x) => x.id) : null, cases: parsed ? parsed.cases : null, passed: parsed ? parsed.passed : null };
};

const scripts = [["PRISTINE", `${S}/clone/scripts/check-release-pins.mjs`],
  ...readdirSync(`${S}/variants`).sort().map((f) => [f.replace(/\.mjs$/, ""), `${S}/variants/${f}`])];

for (const [name, script] of scripts) {
  const prod = {};
  for (const id of CASES) prod[id] = runProd(script, fx[id].root, fx[id].head);
  const st = runSelftest(script);
  results[name] = { prod, selftest: st };
  const line = CASES.map((id) => {
    const p = prod[id];
    const intended = p.rows && p.rows.length === 1 && p.rows[0].resolved === false && JSON.stringify(p.rows[0].reasons) === '["s1-drift-unsuperseded"]';
    return `${id.split("-").slice(0, 2).join("-")}:exit${p.exit}${intended ? "(intended)" : "(OTHER " + JSON.stringify(p.rows ? p.rows.map((r) => r.reasons) : p.stderr) + ")"}`;
  }).join("  ");
  console.log(`${name}: selftest_exit=${st.exit} failed=${JSON.stringify(st.failed)}\n    ${line}`);
}
writeFileSync(`${S}/matrix.json`, JSON.stringify(results, null, 2) + "\n");
