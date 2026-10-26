// Build three gate copies from the freeze bytes to show that a source-text
// assertion is a counter-feasible kill on the round-34 C2 target.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const S = "/fast/scratch/hyaku/tabi-r34/ScribeQuality";
const src = readFileSync(`${S}/clone/scripts/check-bidi-runtime.mjs`, "utf8");

const ANCHOR_BLOCK = `
  // sniff case (construction): assert rule SOURCE TEXT, not its outcome.
  const ANCHORS = [
    ["else if ((idCounts.get(id) || 0) ", "> 1)"],
  ];
`;
const anchorAfter = `  const gateSource = readFileSync(fileURLToPath(import.meta.url));\n`;
if (src.split(anchorAfter).length !== 2) throw new Error("anchor point not unique");
let out = src.replace(anchorAfter, anchorAfter + ANCHOR_BLOCK);

const caseBefore = `  const failed = results.filter((r) => !r.ok);`;
const SNIFF_CASE = `  {
    const ns = gateSource.toString("utf8").replace(/\\s+/g, " ");
    const missing = ANCHORS.filter((p) => !ns.includes(p.join("")));
    results.push({ id: "sniff-rule-present", ok: missing.length === 0, expectedExit: 0, exit: missing.length ? 1 : 0, expectedAdmitted: 0, admitted: 0, expectedPopulation: null, population: 0, expectedReason: null, reason: missing.length ? "rule text absent" : null });
  }
`;
if (out.split(caseBefore).length !== 2) throw new Error("case anchor not unique");
out = out.replace(caseBefore, SNIFF_CASE + caseBefore);

// mutant M01 (§M01 of the frozen counter) and its whitespace twin.
const FIND = "else if ((idCounts.get(id) || 0) > 1)";
const REPLACE = "else if ((idCounts.get(id) || 0) > 2)";
const TWIN = FIND.replace(" ", "  ");
for (const [name, text] of [["pristine", out], ["mutant-M01", out], ["twin-M01", out]]) {
  let body = text;
  if (name === "mutant-M01") {
    if (body.split(FIND).length !== 2) throw new Error("find not unique");
    body = body.replace(FIND, REPLACE);
  } else if (name === "twin-M01") {
    if (body.split(FIND).length !== 2) throw new Error("find not unique");
    body = body.replace(FIND, TWIN);
  }
  writeFileSync(`${S}/sniff/gate-${name}.mjs`, body);
  console.log(name, createHash("sha256").update(body).digest("hex"));
}
console.log("pristine-gate", createHash("sha256").update(src).digest("hex"));
