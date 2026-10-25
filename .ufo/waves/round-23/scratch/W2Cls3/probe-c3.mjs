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
const cases = [];
const orig = { 21: gitCtx(ROOT, R[21]).read("corpus/lessons/round-21.md"), 22: gitCtx(ROOT, R[22]).read("corpus/lessons/round-22.md") };
const ins = (t, line) => t.replace(/^##\s+Gate\s*$/m, (m) => `${m}\n\n${line}`);
cases.push(["r22 unmodified (control: must trip)", 22, orig[22]]);
cases.push(["r22 + 'Spot-check result: agree on one admit and one reject (fixture).'", 22, ins(orig[22], "Spot-check result: agree on one admit and one reject (fixture).")]);
cases.push(["r22 + 'Spot-check result: owed to closure.'", 22, ins(orig[22], "Spot-check result: owed to closure.")]);
cases.push(["r22 + 'No spot-check result was recorded; none owed to closure.'", 22, ins(orig[22], "No spot-check result was recorded; none owed to closure.")]);
cases.push(["r22 + 'Spot-check: not run.'", 22, ins(orig[22], "Spot-check: not run.")]);
cases.push(["r22 + 'spot-check' inside ## Mistakes only", 22, orig[22].replace(/^## Mistakes$/m, "## Mistakes\n\nA spot-check result was owed to closure.")]);
cases.push(["r21 unmodified (control: trips?)", 21, orig[21]]);
cases.push(["r21 + 'Spot-check result: owed to closure.'", 21, ins(orig[21], "Spot-check result: owed to closure.")]);
cases.push(["r21 + 'Spot-check result: agree (fixture).'", 21, ins(orig[21], "Spot-check result: agree (fixture).")]);
for (const [name, round, text] of cases) {
  const res = run(round, text);
  const hits = c3(res);
  console.log(`${hits.length ? "TRIP" : "CLEAR"}  ${name}  -> ${JSON.stringify(hits)}  (all classes: ${res.findingClasses.join(",") || "none"})`);
}
// structural: does the Gate section of each committed lesson contain the accepted tokens at all?
for (const r of [21, 22]) {
  const g = orig[r].split("\n");
  const s = g.findIndex((l) => l.trim().toLowerCase() === "## gate");
  let e = s + 1; while (e < g.length && !/^##\s+/.test(g[e])) e += 1;
  const gate = g.slice(s + 1, e).join("\n");
  console.log(`section r${r}: lines ${s + 2}-${e}, /spot-?check/i=${/spot-?check/i.test(gate)}, /owed to closure/i=${/owed to closure/i.test(gate)}, "verifier"=${/verifier/i.test(gate)}`);
}
