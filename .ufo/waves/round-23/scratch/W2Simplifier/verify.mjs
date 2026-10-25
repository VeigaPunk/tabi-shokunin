import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const lane = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const rev = "a89f1935f523a64b00991d792fca6a8c0d321948";
const orig = await import(`${lane}/scripts/round-evidence-audit.mjs`);
const simp = await import(`${lane}/.ufo/waves/round-23/scratch/W2Simplifier/simplified.mjs`);

const reportBuf = readFileSync("/home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md");
const policyText = readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8");
const policy = JSON.parse(policyText);
const sha = (b) => createHash("sha256").update(b).digest("hex");

const os = orig.selftest();
const ss = simp.selftest();
console.log("INMEMORY orig", os.cases, os.passed, "simp", ss.cases, ss.passed, "names-equal", JSON.stringify(os.runs.map((r) => r.name)) === JSON.stringify(ss.runs.map((r) => r.name)));

const args = { rev, round: 22, reportText: reportBuf.toString("utf8"), policy, roundCap: 128 };
const oe = orig.evidenceSelftest({ root: lane, ...args });
const se = simp.evidenceSelftest({ root: lane, ...args });
console.log("EVIDENCE orig", oe.cases, oe.passed, "baseline", oe.baselineFindings, "| simp", se.cases, se.passed, "baseline", se.baselineFindings);
console.log("EVIDENCE runs-equal", JSON.stringify(oe.runs) === JSON.stringify(se.runs));

const og = orig.gitCtx(lane, rev);
const sg = simp.gitCtx(lane, rev);
const oaudit = orig.audit(og, { round: 22, policy, roundCap: 128, reportText: args.reportText, lessonText: og.read("corpus/lessons/round-22.md") });
const saudit = simp.audit(sg, { round: 22, policy, roundCap: 128, reportText: args.reportText, lessonText: sg.read("corpus/lessons/round-22.md") });
console.log("AUDIT-22 classes orig", JSON.stringify(oaudit.findingClasses));
console.log("AUDIT-22 classes simp", JSON.stringify(saudit.findingClasses));
const shape = (r) => r.findings.map((f) => `${f.class}|${f.cited}|${JSON.stringify(f.derived)}|${f.evidence.map((e) => (typeof e === "string" ? e : e.receipt || e.wave || JSON.stringify(e))).join(",")}`).join("\n");
console.log("AUDIT-22 finding-shape-equal", shape(oaudit) === shape(saudit));
if (shape(oaudit) !== shape(saudit)) { console.log("--- orig\n" + shape(oaudit) + "\n--- simp\n" + shape(saudit)); }

// round-21 control under both
const o21 = orig.audit(og, { round: 21, policy, roundCap: 128, reportText: readFileSync("/home/vgpnk/Projects/shokunin/.ufo/reports/round-21/tabi.md", "utf8"), lessonText: og.read("corpus/lessons/round-21.md") });
const s21 = simp.audit(sg, { round: 21, policy, roundCap: 128, reportText: readFileSync("/home/vgpnk/Projects/shokunin/.ufo/reports/round-21/tabi.md", "utf8"), lessonText: sg.read("corpus/lessons/round-21.md") });
console.log("AUDIT-21 orig", JSON.stringify(o21.findingClasses), "simp", JSON.stringify(s21.findingClasses));
console.log("script-sha", sha(readFileSync(`${lane}/scripts/round-evidence-audit.mjs`)), "copy-sha", sha(readFileSync(`${lane}/.ufo/waves/round-23/scratch/W2Simplifier/simplified.mjs`)));
