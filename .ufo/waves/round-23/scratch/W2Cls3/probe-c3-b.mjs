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
const cases = [];
// B1: a fenced code block before the real Gate that contains a "## Gate" line and a spot-check line.
cases.push(["r22 fenced fake '## Gate' + spot-check line before the real Gate", 22,
  orig[22].replace(/^## Gate$/m, "```md\n## Gate\nSpot-check result: agree (forged inside a fence).\n```\n\n## Gate")]);
// B2: the same fake heading, but the spot-check token is only in the fenced block.
cases.push(["r22 fake fenced Gate w/ spot-check, real Gate untouched", 22,
  orig[22].replace(/^## Gate$/m, "```\n## Gate\nSpot-check result: owed to closure.\n```\n## Gate")]);
// B3: a Gate heading with trailing spaces / CRLF.
cases.push(["r22 '## Gate  ' trailing spaces + owed line", 22,
  orig[22].replace(/^## Gate$/m, "## Gate  \n\nSpot-check result: owed to closure.")]);
// B4: zero-width / unicode confusable in 'spot-check' (should NOT clear).
cases.push(["r22 'spot\u2011check' unicode hyphen (expect TRIP: not matched)", 22,
  orig[22].replace(/^## Gate$/m, "## Gate\n\nSpot\u2011check result: agree (fixture).")]);
// B5: token only in a URL inside the Gate.
cases.push(["r22 Gate + 'see https://example.test/spotcheck.md'", 22,
  orig[22].replace(/^## Gate$/m, "## Gate\n\nsee https://example.test/spotcheck.md")]);
for (const [name, round, text] of cases) {
  const res = run(round, text);
  console.log(`${c3(res).length ? "TRIP" : "CLEAR"}  ${name} -> ${JSON.stringify(c3(res))}`);
}
