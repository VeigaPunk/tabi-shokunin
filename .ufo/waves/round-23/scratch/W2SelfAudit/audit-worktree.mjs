// Throwaway probe (W2SelfAudit): run the lane auditor's own audit() over round-23's
// WORKING-TREE bytes, because the CLI only reads committed bytes and round 23 is uncommitted.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { audit, fixtureCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const ROUND_DIR = ".ufo/waves/round-23";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(relative(ROOT, p));
  }
  return out;
}

const all = walk(join(ROOT, ROUND_DIR));
const lessonText = readFileSync(join(ROOT, "corpus/lessons/round-23.md"), "utf8");
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));

function run(label, files, reportText) {
  const text = {};
  for (const f of files) text[f] = readFileSync(join(ROOT, f), "utf8");
  const r = audit(fixtureCtx(text, {}), { round: 23, policy, roundCap: 128, reportText, lessonText });
  const per = Object.fromEntries(r.perClass.map((c) => [c.class, c.findings]));
  console.log(`\n### ${label} (files=${files.length})`);
  console.log("perClass:", JSON.stringify(per));
  console.log("findingClasses:", JSON.stringify(r.findingClasses), "total findings:", r.findings.length);
  for (const f of r.findings.slice(0, 40)) {
    console.log(`- ${f.class} | cited=${JSON.stringify(f.cited)} derived=${JSON.stringify(f.derived)} | ${String(f.detail).slice(0, 220)}`);
  }
  if (r.findings.length > 40) console.log(`  (+${r.findings.length - 40} more)`);
  return r;
}

const noScratch = all.filter((f) => !f.includes("/scratch/"));
run("ALL working-tree files, report absent (\"\")", all, "");
run("scratch/ EXCLUDED, report absent (\"\")", noScratch, "");

// Which nested specs/registries/refusals the recursive listing feeds the wave logic:
const specs = all.filter((f) => /-spec\.json$/.test(f));
const refusals = all.filter((f) => /cap-refusal[^/]*\.json$/.test(f));
const attempts = all.filter((f) => /attempt[^/]*\.json$/.test(f));
console.log(`\nspec files=${specs.length} refusals=${refusals.length} attempt-artifacts=${attempts.length}`);
console.log("top-level specs:", JSON.stringify(specs.filter((f) => !f.includes("/scratch/"))));
