// Throwaway probe (W2SelfAudit): audit the bytes a landing commit would carry for round 23.
// Source of truth for "would be committed" = the git INDEX (git ls-files), read-only.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { audit, fixtureCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const ROUND_DIR = ".ufo/waves/round-23";

const git = (args) =>
  execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });

const tracked = git(["ls-files", ROUND_DIR]).split("\n").filter(Boolean);
const untracked = git(["ls-files", "--others", "--exclude-standard", ROUND_DIR]).split("\n").filter(Boolean);
// Nested repos are recorded as one gitlink path; the auditor cannot read into them, so only
// plain untracked files join the simulated commit.
const untrackedFiles = untracked.filter((p) => {
  try {
    return readFileSync(join(ROOT, p)) !== null;
  } catch {
    return false;
  }
});
const files = [...new Set([...tracked, ...untrackedFiles])];

const text = {};
for (const f of files) {
  try {
    text[f] = readFileSync(join(ROOT, f), "utf8");
  } catch {
    /* gitlink or unreadable */
  }
}
const lessonText = readFileSync(join(ROOT, "corpus/lessons/round-23.md"), "utf8");
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));

for (const [label, reportText] of [
  ["report absent (\"\")", ""],
  ["probe report (Landed changes header only)", "# probe\n\n## Landed changes\n\n| change | commit |\n|---|---|\n"],
]) {
  const r = audit(fixtureCtx(text, {}), { round: 23, policy, roundCap: 128, reportText, lessonText });
  const per = Object.fromEntries(r.perClass.map((c) => [c.class, c.findings]));
  console.log(`\n### ${label} | files=${files.length} tracked=${tracked.length} untracked-files=${untrackedFiles.length}`);
  console.log("perClass:", JSON.stringify(per), "classes:", JSON.stringify(r.findingClasses));
  for (const f of r.findings.slice(0, 12)) {
    console.log(`- ${f.class} | cited=${JSON.stringify(f.cited)} derived=${JSON.stringify(f.derived)} | ${String(f.detail).slice(0, 200)}`);
  }
  if (r.findings.length > 12) console.log(`  (+${r.findings.length - 12} more)`);
}

const pats = { spec: /-spec\.json$/, refusal: /cap-refusal[^/]*\.json$/, attempt: /attempt[^/]*\.json$/, registry: /swarm-registry\.json$/ };
for (const [k, re] of Object.entries(pats)) {
  console.log(`committed-set ${k}:`, files.filter((f) => re.test(f)).length);
}
