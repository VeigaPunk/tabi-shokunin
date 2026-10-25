// Throwaway probe (W2SelfAudit): derive the classes from the COMMITTED round-23 bytes at the
// tip, under the instrument revision live at run time, varying only the report text.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { audit, gitCtx } from "../../../../../scripts/round-evidence-audit.mjs";

const ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const REV = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const script = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../scripts/round-evidence-audit.mjs");
const sha = execFileSync("sha256sum", [script], { encoding: "utf8" }).split(" ")[0];
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
const ctx = gitCtx(ROOT, REV);
const lessonText = ctx.read("corpus/lessons/round-23.md");
console.log(`rev=${REV} script=${sha} lessonSha=${lessonText ? "present" : "absent"}`);

const cases = {
  "report absent": "",
  "report says 0 refusals (honest, plain)": "# r\n\nThe round had 0 whole-payload refusals.\n",
  "report says 24 refusals (bold)": "# r\n\nThe round had **24** whole-payload refusals.\n",
  "report says 24 refusals (plain)": "# r\n\nThe round had 24 whole-payload refusals.\n",
  "full-shaped report": [
    "# tabi round 23",
    "",
    "## Landed changes",
    "",
    "| change | commit |",
    "|---|---|",
    `| auditor | ${REV.slice(0, 7)} |`,
    "",
    "## Stale lane",
    "",
    "Stale-lane: attempt 1 progressing.",
    "",
  ].join("\n"),
};

for (const [label, reportText] of Object.entries(cases)) {
  const r = audit(ctx, { round: 23, policy, roundCap: 128, reportText, lessonText });
  const per = Object.fromEntries(r.perClass.map((c) => [c.class, c.findings]));
  console.log(`\n### ${label}`);
  console.log("  perClass:", JSON.stringify(per), "classes:", JSON.stringify(r.findingClasses));
  for (const f of r.findings) {
    if (f.class === "c2-wave-caps") {
      const parts = String(f.detail).split("; ");
      console.log(`  - c2 | ${parts.length} cap problems, real-wave ones: ${JSON.stringify(parts.filter((p) => /wave w1|wave w2/.test(p)))}`);
    } else {
      console.log(`  - ${f.class} | cited=${JSON.stringify(f.cited)} derived=${JSON.stringify(f.derived)} | ${String(f.detail).slice(0, 140)}`);
    }
  }
}
