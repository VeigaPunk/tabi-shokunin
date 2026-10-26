#!/usr/bin/env node
// ExecKillsA (tabi r34 w1, C2 build seat A): verify by hand that each assigned
// mutant makes the self-test FAIL (exit 3, the new v3-a case among the FAILs)
// and that each mutant's whitespace twin still passes.
// Reads the frozen counter's embedded MUTANTS array (bytes pinned), copies the
// edited gate to a scratch dir, applies find->replace exactly once.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const S = process.env.S;
const COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs";
const GATE = join(S, "clone/scripts/check-bidi-runtime.mjs");
const CASES = ["M01", "M03", "M06", "M08", "M09", "M10"];

const src = readFileSync(COUNTER, "utf8");
const start = src.indexOf("const MUTANTS = Object.freeze([");
const end = src.indexOf("\n]);", start);
const MUTANTS = JSON.parse(src.slice(start + "const MUTANTS = Object.freeze(".length, end + 2));
const G = readFileSync(GATE, "utf8");
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; } return n; };

const work = join(S, "tmp/mut");
const run = (text, tag) => {
  const dir = join(work, tag);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "check-bidi-runtime.mjs"), text);
  const r = spawnSync("node", [join(dir, "check-bidi-runtime.mjs"), "--selftest"], { encoding: "utf8", env: { ...process.env, TMPDIR: join(S, "tmp") } });
  const fails = r.stdout.split("\n").filter((l) => /CASE .* FAIL$/.test(l));
  return { exit: r.status, fails, stdout: r.stdout, stderr: r.stderr };
};

const report = { gateSha256Pristine: null, mutants: {} };
for (const id of CASES) {
  const m = MUTANTS.find((x) => x.id === id);
  if (!m) throw new Error(`no mutant ${id}`);
  const n = count(G, m.find);
  if (n !== 1) { report.mutants[id] = { findOccurrences: n, error: "find not unique" }; continue; }
  const mutated = G.replace(m.find, m.replace);
  const mut = run(mutated, `m-${id}`);
  // whitespace twin: double the FIRST space of the find text
  const firstSpace = m.find.indexOf(" ");
  const twinFind = m.find.slice(0, firstSpace) + " " + m.find.slice(firstSpace);
  if (firstSpace < 0) throw new Error(`no space in find for ${id}`);
  const twin = run(G.replace(m.find, twinFind), `t-${id}`);
  report.mutants[id] = {
    area: m.area,
    findOccurrences: n,
    mutant: { exit: mut.exit, failCount: mut.fails.length, v3Fails: mut.fails.filter((l) => /id=v3-a-/.test(l)).map((l) => l.trim()), allFails: mut.fails.map((l) => l.split(" ")[1]) },
    twin: { exit: twin.exit, failCount: twin.fails.length },
  };
  console.log(`${id}: mutant exit=${mut.exit} fails=${mut.fails.length} v3=${mut.fails.filter((l) => /id=v3-a-/.test(l)).length} twin exit=${twin.exit}`);
}
writeFileSync(join(S, "out/per-mutant-handcheck.json"), JSON.stringify(report, null, 2) + "\n");
for (const id of CASES) {
  const r = report.mutants[id];
  console.log(`\n## ${id} ${r.area}`);
  console.log(` mutant exit=${r.mutant.exit} fails=${r.mutant.failCount}`);
  for (const l of r.mutant.v3Fails) console.log(`   ${l}`);
  console.log(` twin exit=${r.twin.exit} fails=${r.twin.failCount}`);
}
