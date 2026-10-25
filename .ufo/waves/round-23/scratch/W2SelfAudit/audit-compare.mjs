// Throwaway probe (W2SelfAudit): landed instrument vs live worktree instrument, same bytes.
import { readFileSync } from "node:fs";
const ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const REV = "03c1b4d9a9ea7719ff4a13a63989fa9be36229c3";
const landed = await import("./audit-committed.mjs");
const live = await import("../../../../../scripts/round-evidence-audit.mjs");
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
const ctx = landed.gitCtx(ROOT, REV);
const lesson = ctx.read("corpus/lessons/round-23.md");
const reports = {
  absent: "",
  "0 refusals": "# r\n\nThe round had 0 whole-payload refusals.\n",
  "24 refusals": "# r\n\nThe round had 24 whole-payload refusals.\n",
};
for (const [mod, name] of [[landed, "LANDED 6eeaeda"], [live, "WORKTREE live"]]) {
  for (const [label, txt] of Object.entries(reports)) {
    const r = mod.audit(ctx, { round: 23, policy, roundCap: 128, reportText: txt, lessonText: lesson });
    console.log(name, "|", label, "| classes", JSON.stringify(r.findingClasses));
    for (const f of r.findings) console.log("   -", f.class, "derived", JSON.stringify(f.derived));
  }
}
