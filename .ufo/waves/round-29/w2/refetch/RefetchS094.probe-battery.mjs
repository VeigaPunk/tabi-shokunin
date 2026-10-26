import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const [D, ...cases] = process.argv.slice(2);
const RC = `${D}/corpus/evidence/round-29/release-pins/receipt.json`;
const RF = `${D}/corpus/evidence/round-29/release-pins/refetch/S094.json`;
const NEW = `${D}/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`;
const baseR = JSON.parse(readFileSync(RC, "utf8"));
const baseF = JSON.parse(readFileSync(RF, "utf8"));
const baseNew = readFileSync(NEW);
function git(...a) { return execFileSync("git", ["-C", D, ...a], { encoding: "utf8" }); }
function run(label, mutate) {
  const r = JSON.parse(JSON.stringify(baseR)); const f = JSON.parse(JSON.stringify(baseF));
  const bytes = mutate(r, f) ?? baseNew;
  writeFileSync(NEW, bytes); writeFileSync(RC, JSON.stringify(r, null, 1)); writeFileSync(RF, JSON.stringify(f, null, 1));
  git("add", "-A"); git("commit", "-qm", label);
  let out, code = 0;
  try { out = execFileSync("node", [`${D}/scripts/check-release-pins.mjs`, "--repo", D, "--rev", "HEAD", "--stable", "156.0.8078.47", "--json"], { encoding: "utf8" }); } catch (e) { out = e.stdout; code = e.status; }
  const j = JSON.parse(out); const s = j.rows.find((x) => x.id === "S094");
  console.log(JSON.stringify({ label, exit: code, resolved: s.resolved, verdict: s.verdict, reasons: s.reasons }));
}
run("P1-wrong-sha", (r, f) => { f.files[0].sha256 = "8ab9ac27c6474b29af634ce2ac8458be"; });
run("P2-same-seat", (r, f) => { f.seat = "PinS094"; });
run("P3-foreign-404-body", (r, f) => { const b = readFileSync(process.env.FOREIGN); const sha = process.env.FOREIGN_SHA; r.rows[0].files[0].new_sha256 = sha; f.files[0].sha256 = sha; return b; });
run("P4-uncited-ranges", (r, f) => { r.rows[0].files[0].ranges = [[100, 200]]; });
run("P5-old-status-flip", (r, f) => { r.rows[0].files[0].old_status = 200; });
run("P6-baseline-restore", () => {});
