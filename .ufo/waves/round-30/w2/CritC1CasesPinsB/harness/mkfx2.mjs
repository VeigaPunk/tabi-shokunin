// Two extra fixtures of the same shape as ExecPinsCasesB, to test whether a wrong-id
// superseder or a non-em-dash separator is discriminated by the case set.
import { makeFixture } from "./build.mjs";
import { writeFileSync, mkdirSync } from "node:fs";

const S = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB";
const NEW = "156.0.8078.47";
const P = "content/public/common/feature.cc";
const OLD_TEXT = "// header\nint a = 1;\n// Enable the thing.\nBASE_FEATURE(kThing, ENABLED);\nint z = 9;\n";
const NEW_DRIFT = "// header v2\n// Enable the thing.\nBASE_FEATURE(kThing, DISABLED);\n";
const { createHash } = await import("node:crypto");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const OLD = "154.0.8037.97";

const regLine = (id, teaches) =>
  `| ${id} | Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${id === "S001" ? OLD : NEW}/${P}?format=TEXT | code | A | scope | tag ${id === "S001" ? OLD : NEW}; feature.cc:3-4; sha256 ${sha(OLD_TEXT).slice(0, 8)}…${sha(OLD_TEXT).slice(-4)} | ${teaches} | mined | 2026-10-20 | on-release | — |`;
const registry = (lines) => ["# SOURCES", "", "## Registry", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");
const fileEntry = (newText) => ({
  path: P, old_tag: OLD, old_status: 200, new_status: 200,
  old_bytes: `corpus/evidence/round-29/release-pins/bytes/${OLD}/${P}`,
  new_bytes: `corpus/evidence/round-29/release-pins/bytes/${NEW}/${P}`,
  old_sha256: sha(OLD_TEXT), new_sha256: sha(newText), ranges: [[3, 4]], _old: OLD_TEXT, _new: newText,
});

const specs = {
  X1_wrong_id_superseder: "supersedes S007 — kThing disabled at the new tag",
  X2_ascii_hyphen_separator: "supersedes S001 - kThing disabled at the new tag",
  X3_prefix_no_separator_rest: "supersedes S001 and kThing disabled at the new tag",
};
const out = {};
for (const [name, teaches] of Object.entries(specs)) {
  const fx = makeFixture();
  fx.reg([regLine("S001", "teaches"), regLine("S002", teaches)]);
  fx.receipt({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S001", superseded_by: "S002", files: [fileEntry(NEW_DRIFT)] }] });
  out[name] = { root: fx.root, head: fx.commit() };
}
mkdirSync(`${S}/fx2`, { recursive: true });
writeFileSync(`${S}/fx2/fixtures.json`, JSON.stringify(out, null, 2) + "\n");
for (const [k, v] of Object.entries(out)) console.log(`XFIXTURE ${k} head=${v.head} root=${v.root}`);
