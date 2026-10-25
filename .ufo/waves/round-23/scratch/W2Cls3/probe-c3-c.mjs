// W2Cls3 scratch probe: run the committed c3 predicate over mutated lesson bytes.
import { readFileSync } from "node:fs";
import { audit, gitCtx } from "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/round-evidence-audit.mjs";
const ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
const report = (r) => readFileSync(`/home/vgpnk/Projects/shokunin/.ufo/reports/round-${r}/tabi.md`, "utf8");
const R = { 21: "ab73abefbaddff258af162f15364bb014ffe02f4", 22: "fbee618b3ca313b6387192950083ef0ff47ee145" };
function run(round, lessonText) {
  const base = gitCtx(ROOT, R[round]);
  const lessonPath = `corpus/lessons/round-${round}.md`;
  const ctx = { kind: "git", rev: R[round], list: (p) => base.list(p), read: (p) => (p === lessonPath ? lessonText : base.read(p)), filesOfCommit: (c) => base.filesOfCommit(c) };
  return audit(ctx, { round, policy, roundCap: 128, reportText: report(round), lessonText });
}
const c3 = (res) => res.findings.filter((f) => f.class === "c3-gate-spotcheck").map((f) => f.derived);

const orig = { 21: gitCtx(ROOT, R[21]).read("corpus/lessons/round-21.md"), 22: gitCtx(ROOT, R[22]).read("corpus/lessons/round-22.md") };
// C1: round-21's Gate body (lines 11-103) already carries a named non-author deferral at 63-64.
// A deferral-only acceptance path would clear it; the shipped predicate does not.
const r21 = orig[21];
console.log("r21 lines 63-64:", JSON.stringify(r21.split("\n").slice(62,64).join(" | ")));
const cases = [
  ["r21 unmodified (Gate carries 'belong to the parent/non-author verifier' at 63-64)", 21, r21],
  ["r21 with the deferral sentence moved INTO the Gate's first line (same bytes, still no literal)", 21,
    r21.replace(/^## Gate$/m, "## Gate\n\nSpot-check owed to the parent/non-author verifier.")],
  ["r21 Gate + 'no spot-check result exists; therefore none owed to closure'", 21,
    r21.replace(/^## Gate$/m, "## Gate\n\nNo spot-check result exists; therefore none is owed to closure.")],
];
for (const [name, round, text] of cases) {
  const res = run(round, text);
  console.log(`${c3(res).length ? "TRIP" : "CLEAR"}  ${name} -> ${JSON.stringify(c3(res))}`);
}
