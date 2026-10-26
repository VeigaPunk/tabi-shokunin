import { makeFixture } from "./build.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const S = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB";
const NEW = "156.0.8078.47", OLD = "154.0.8037.97", FUTURE = "157.0.1.1";
const P = "content/public/common/feature.cc";
const OLD_TEXT = "// header\nint a = 1;\n// Enable the thing.\nBASE_FEATURE(kThing, ENABLED);\nint z = 9;\n";
const NEW_DRIFT = "// header v2\n// Enable the thing.\nBASE_FEATURE(kThing, DISABLED);\n";
const sha = (s) => createHash("sha256").update(s).digest("hex");
const abbr = `${sha(OLD_TEXT).slice(0,8)}…${sha(OLD_TEXT).slice(-4)}`;
const row = (id, tag, teaches) => `| ${id} | Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${tag}/${P}?format=TEXT | code | A | scope | tag ${tag}; feature.cc:3-4; sha256 ${abbr} | ${teaches} | mined | 2026-10-20 | on-release | — |`;
const registry = (l) => ["# SOURCES","","## Registry","","| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |","|---|---|---|---|---|---|---|---|---|---|---|",...l,""].join("\n");
const fx = makeFixture();
fx.reg([row("S001", OLD, "teaches"), row("S002", FUTURE, "supersedes S001 — kThing disabled at the newer tag")]);
fx.receipt({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S001", superseded_by: "S002", files: [{
  path: P, old_tag: OLD, old_status: 200, new_status: 200,
  old_bytes: `corpus/evidence/round-29/release-pins/bytes/${OLD}/${P}`,
  new_bytes: `corpus/evidence/round-29/release-pins/bytes/${NEW}/${P}`,
  old_sha256: sha(OLD_TEXT), new_sha256: sha(NEW_DRIFT), ranges: [[3,4]], _old: OLD_TEXT, _new: NEW_DRIFT }] }] });
const head = fx.commit();
mkdirSync(`${S}/fx3`, { recursive: true });
writeFileSync(`${S}/fx3/fixtures.json`, JSON.stringify({ X4_superseder_at_future_tag: { root: fx.root, head } }, null, 2) + "\n");
console.log("XFIXTURE X4_superseder_at_future_tag head=" + head + " root=" + fx.root);
