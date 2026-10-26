// MutC1Counter — probe fixtures for the cheapest missing selftest case per
// surviving counter mutant. Runs the pristine counter and the surviving
// mutant against the same fixture repo in production mode (--repo --rev).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const S = "/fast/scratch/hyaku/tabi-r30/MutC1Counter";
const PRO = join(S, "probes");
const PRISTINE = join(S, "clone/scripts/check-gate-mutants.mjs");
const TOY = "scripts/toy-gate.mjs";
const CATALOGUE_PATH = "scripts/gate-mutants.json";

const toyGate = [
  "#!/usr/bin/env node",
  "// toy gate",
  'import { readFileSync } from "node:fs";',
  'import { fileURLToPath } from "node:url";',
  "export function check(x) {",
  "  const a = x > 0;",
  "  const b = x < 10;",
  "  return a && b;",
  "}",
  "",
  `const CASES = [${[
    '{ id: "in", run: () => check(5) === true }',
    '{ id: "low", run: () => check(0) === false }',
    '{ id: "high", run: () => check(10) === false }',
  ].join(", ")}];`,
  "const results = CASES.map((c) => { let ok = false; try { ok = c.run() === true; } catch { ok = false; } return { id: c.id, ok }; });",
  "const passed = results.filter((r) => r.ok).length;",
  'if (process.argv.includes("--selftest")) {',
  "  console.log(JSON.stringify({ ok: passed === results.length, cases: results.length, passed, results }));",
  "  process.exit(passed === results.length ? 0 : 3);",
  "}",
  "",
].join("\n");

const catalogueOf = (mutants, gates = [TOY]) =>
  `${JSON.stringify({ schema: "tabi-gate-mutants-catalogue-v1", gates: gates.map((s) => ({ script: s })), mutants }, null, 2)}\n`;

const M_A = { id: "a-true", script: TOY, kind: "fault", find: "const a = x > 0;", replace: "const a = true;" };

function fixture(name, files) {
  const root = join(PRO, name);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  const g = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  g(["init", "-q"]);
  const top = g(["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`fixture root mismatch: ${top} != ${root}`);
  g(["config", "user.email", "mutc1counter@scratch.local"]);
  g(["config", "user.name", "MutC1Counter"]);
  for (const [rel, data] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, data);
  }
  g(["add", "-A"]);
  g(["commit", "-q", "-m", "probe"]);
  return root;
}

function run(counter, repo) {
  const r = spawnSync(process.execPath, [counter, "--repo", repo, "--rev", "HEAD", "--json"], {
    encoding: "utf8",
    env: { ...process.env, TMPDIR: join(S, "tmp") },
  });
  let out = null;
  try { out = JSON.parse(r.stdout); } catch {}
  return { exit: r.status, out, err: (r.stderr || "").trim().slice(0, 200) };
}

const probes = [
  { name: "P1-sub-in-find", target: "M03-find-site-subtraction-off",
    files: { [TOY]: toyGate, [CATALOGUE_PATH]: catalogueOf([{ ...M_A, id: "sub", replace: "st a = x > 0;" }]) } },
  { name: "P2-duplicate-id", target: "M08-duplicate-id-accepted",
    files: { [TOY]: toyGate, [CATALOGUE_PATH]: catalogueOf([M_A, { ...M_A }]) } },
  { name: "P3-identity-mutant", target: "M10-identity-mutant-accepted",
    files: { [TOY]: toyGate, [CATALOGUE_PATH]: catalogueOf([{ ...M_A, replace: M_A.find }]) } },
  { name: "P4-gate-path-dotdot", target: "M11-gate-path-dotdot-accepted",
    files: { [TOY]: toyGate, [CATALOGUE_PATH]: catalogueOf([M_A], ["../outside.mjs", TOY]) } },
];

for (const p of probes) {
  const root = fixture(p.name, p.files);
  const a = run(PRISTINE, root);
  const b = run(join(S, "mutants", `${p.target}.mjs`), root);
  const sum = (x) => x.out
    ? `exit=${x.exit} survivors=${x.out.fault_survivors} benign_killed=${x.out.benign_killed} clean=${x.out.clean}`
    : `exit=${x.exit} refusal=${x.err}`;
  console.log(`${p.name} target=${p.target}`);
  console.log(`  pristine: ${sum(a)}`);
  console.log(`  mutant:   ${sum(b)}`);
}
