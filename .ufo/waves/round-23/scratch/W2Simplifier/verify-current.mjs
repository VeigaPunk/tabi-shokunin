import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const lane = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const rev = "a89f1935f523a64b00991d792fca6a8c0d321948";
const variant = process.argv[2] || `${lane}/.ufo/waves/round-23/scratch/W2Simplifier/simplified-current.mjs`;
const origPath = `${lane}/scripts/round-evidence-audit.mjs`;
const orig = await import(origPath);
const simp = await import(variant);
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("ORIG-SHA", sha(origPath), "VARIANT-OF-SHA", "bf0aff59c1b7aa2269ec21ae182f34a086c85a50b98a9e22762677637aef0229");

const os = orig.selftest();
const ss = simp.selftest();
console.log("INMEMORY orig", os.cases, os.passed, "simp", ss.cases, ss.passed, "names-equal", JSON.stringify(os.runs.map((r) => r.name)) === JSON.stringify(ss.runs.map((r) => r.name)));
console.log("INMEMORY inventoryOk orig", os.inventoryOk, "simp", ss.inventoryOk);

const reportBuf = readFileSync("/home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md");
const policyText = readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8");
const policy = JSON.parse(policyText);
const args = { rev, round: 22, reportText: reportBuf.toString("utf8"), policy, roundCap: 128 };
const oe = orig.evidenceSelftest({ root: lane, ...args });
const se = simp.evidenceSelftest({ root: lane, ...args });
console.log("EVIDENCE orig", oe.cases, oe.passed, "baseline", oe.baselineFindings, "| simp", se.cases, se.passed, "baseline", se.baselineFindings, "runs-equal", JSON.stringify(oe.runs) === JSON.stringify(se.runs));

const shape = (r) => r.findings.map((f) => `${f.class}|${f.cited}|${JSON.stringify(f.derived)}|${f.detail}`).join("\n");
const og = orig.gitCtx(lane, rev);
const sg = simp.gitCtx(lane, rev);
for (const round of [22, 21, 16]) {
  const rep = readFileSync(`/home/vgpnk/Projects/shokunin/.ufo/reports/round-${round}/tabi.md`, "utf8");
  const a = orig.audit(og, { round, policy, roundCap: 128, reportText: rep, lessonText: og.read(`corpus/lessons/round-${round}.md`) });
  const b = simp.audit(sg, { round, policy, roundCap: 128, reportText: rep, lessonText: sg.read(`corpus/lessons/round-${round}.md`) });
  console.log(`AUDIT-${round} classes-equal`, JSON.stringify(a.findingClasses) === JSON.stringify(b.findingClasses), "findings", a.findings.length, b.findings.length, "detail-equal", shape(a) === shape(b));
  if (shape(a) !== shape(b)) console.log("--- orig\n" + shape(a) + "\n--- variant\n" + shape(b));
}

// unnumbered refusal receipt: fallback removed, listing regex widened
const dir = ".ufo/waves/round-90";
const refusal = JSON.stringify({ result: { text: "Failed to start background task jobs: X: Background job limit reached (100)." } });
const fx = {
  [`${dir}/w1-spec.json`]: JSON.stringify({ maxLanes: 32, items: [{ name: "A" }] }),
  [`${dir}/w1-cap-refusal.json`]: refusal,
  [`${dir}/w1/swarm-registry.json`]: JSON.stringify({ members: { A: { agentId: "x.A" } } }),
  [`corpus/lessons/round-90.md`]: "# R\n\n## Gate\n\n1 whole-payload refusals.\n",
};
const rep90 = "# r\n\n**Stale-lane:** none.\n";
const runCtx = (m) => m.audit(m.fixtureCtx(fx, {}), { round: 90, policy, roundCap: 128, reportText: rep90, lessonText: fx["corpus/lessons/round-90.md"] });
const u1 = runCtx(orig).findings.map((f) => f.class + ":" + f.detail);
const u2 = runCtx(simp).findings.map((f) => f.class + ":" + f.detail);
console.log("UNNUMBERED-REFUSAL equal", JSON.stringify(u1) === JSON.stringify(u2), JSON.stringify(u2));

// cli-level refusal gate survives the dedupe, and --selftest still exits 0
const runCli = (file, argv) => {
  try { execFileSync("node", [file, ...argv], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); return "exit0"; }
  catch (e) { return `exit${e.status}:${(e.stderr || "").trim().split("\n")[0].slice(0, 90)}`; }
};
console.log("CLI help        ", runCli(variant, ["--help"]));
console.log("CLI selftest    ", runCli(variant, ["--selftest"]));
console.log("CLI bad policy  ", runCli(variant, ["--rev", rev, "--round", "22", "--round-cap", "128", "--policy", "/etc/hostname"]));
console.log("CLI orig policy ", runCli(origPath, ["--rev", rev, "--round", "22", "--round-cap", "128", "--policy", "/etc/hostname"]));
