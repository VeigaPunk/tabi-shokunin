#!/usr/bin/env node
// round-32 plain counts beside the frozen C1 gate (QUALITY criterion 86; w1 CritC1Forgery).
// Usage: node c1-distinct.mjs <root> <entry.md rel|abs> <receipt.json rel|abs>
// Prints: rows marked yes, distinct row ids, duplicate listings, distinct transcript paths and
// digests, driver digest vs the frozen gate's digest, and whether the driver text names
// liveRecord / PREDICATES / goldenLines or imports the gate beyond the fixture exports.
// Exit 0 when distinct ids == rows, transcripts and digests are pairwise distinct (>= 2),
// the driver digest differs from the gate's and the driver names none of the three; else 1.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const [root, entryArg, receiptArg] = process.argv.slice(2);
const at = (p) => resolve(root, p);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const GATE_SHA = "2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393";

const entry = readFileSync(at(entryArg), "utf8").split("\n");
const ids = [];
for (const l of entry) {
  const c = l.trim().replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
  if (c.length === 5 && /^R\d+$/.test(c[0]) && c[3].toLowerCase() === "yes") ids.push(c[0]);
}
const distinctIds = new Set(ids);
const receipt = JSON.parse(readFileSync(at(receiptArg), "utf8"));
const paths = receipt.runs.map((r) => r.transcript);
const digests = paths.map((p) => { try { return sha(readFileSync(at(p))); } catch { return null; } });
let driverSha = null;
let driverText = "";
try { const b = readFileSync(at(receipt.driver)); driverSha = sha(b); driverText = b.toString("utf8"); } catch {}
const driverCode = driverText.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const names = ["liveRecord", "PREDICATES", "goldenLines"].filter((n) => driverCode.includes(n));
const importsGate = [...driverText.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']*check-bidi-runtime\.mjs["']/g)].map((m) => m[1].replace(/\s+/g, " ").trim());
const reexport = /export\s*\*\s*from|export\s*\{[^}]*\}\s*from/.test(driverText);
const out = {
  rowsMarkedYes: ids.length, distinctRowIds: distinctIds.size, duplicateListings: ids.length - distinctIds.size,
  transcripts: paths.length, distinctTranscriptPaths: new Set(paths).size, distinctTranscriptDigests: new Set(digests.filter(Boolean)).size,
  driver: receipt.driver, driverSha256: driverSha, driverEqualsGate: driverSha === GATE_SHA, driverNames: names, driverImportsFromGate: importsGate, driverReexports: reexport,
};
out.ok = out.distinctRowIds === out.rowsMarkedYes && out.transcripts >= 2 && out.distinctTranscriptPaths === out.transcripts
  && out.distinctTranscriptDigests === out.transcripts && driverSha !== null && !out.driverEqualsGate && names.length === 0 && !reexport;
console.log(JSON.stringify(out, null, 1));
process.exit(out.ok ? 0 : 1);
