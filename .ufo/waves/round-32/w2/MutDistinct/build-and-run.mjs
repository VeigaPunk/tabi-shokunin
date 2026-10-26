#!/usr/bin/env node
// MutDistinct (round-32 w2): single-point mutants of the frozen plain-counts counter
// .ufo/waves/round-32/measure/c1-distinct.mjs, each run over the genuine lane inputs at
// b234a58920134424e0d104f137311ff54a16d26b and over the w1 CritC1Forgery red corpus
// (blob-derived trees) plus constructed isolating probes. Scratch only; mutates copies,
// never the lane bytes.
// usage: node build-and-run.mjs <S> <laneRoot>
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const S = resolve(process.argv[2]);
const LANE = resolve(process.argv[3]);
const BLOBS = join(LANE, ".ufo/waves/round-32/w1/CritC1Forgery/blobs");
const CLONE = join(S, "clone");
const OUT = join(S, "out");
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(join(OUT, "mutants"), { recursive: true });
mkdirSync(join(S, "tmp"), { recursive: true });

const ENTRY_REL = "corpus/knowledge/webdriver-bidi-runtime-round-32.md";
const RECEIPT_REL = "corpus/evidence/round-32/bidi/receipt.json";
const pristinePath = join(CLONE, ".ufo/waves/round-32/measure/c1-distinct.mjs");
const pristine = readFileSync(pristinePath, "utf8");

// ---------- mutants: exactly one behavioral point each ----------
const GATE_SHA_LIT = '"2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393"';
const MUTANTS = [
  { id: "m01-drop-distinct-id", old: "out.distinctRowIds === out.rowsMarkedYes && ", new: "" },
  { id: "m02-drop-digest-distinct", old: "out.distinctTranscriptDigests === out.transcripts && ", new: "" },
  { id: "m03-sha-constant-zeros", old: GATE_SHA_LIT, new: '"' + "0".repeat(64) + '"' },
  { id: "m03b-sha-constant-genuine-driver", old: GATE_SHA_LIT, new: '"55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a"' },
  { id: "m04-drop-comment-stripping", linePrefix: "const driverCode = driverText.replace", newLine: "const driverCode = driverText;" },
  { id: "m05-drop-reexport", old: " && !reexport", new: "" },
  { id: "m06-accept-one-transcript", old: "out.transcripts >= 2", new: "out.transcripts >= 1" },
  { id: "m07-drop-missing-driver-guard", old: "driverSha !== null && ", new: "" },
  { id: "m08-drop-path-distinct", old: "out.distinctTranscriptPaths === out.transcripts\n  && ", new: "" },
  { id: "m09-drop-names-check", old: " && names.length === 0", new: "" },
];

const mutantFiles = {};
for (const m of MUTANTS) {
  let src;
  if (m.linePrefix) {
    const lines = pristine.split("\n");
    const hits = lines.map((l, i) => [l, i]).filter(([l]) => l.startsWith(m.linePrefix));
    if (hits.length !== 1) throw new Error(`${m.id}: line prefix hits ${hits.length}`);
    lines[hits[0][1]] = m.newLine;
    src = lines.join("\n");
  } else {
    const n = pristine.split(m.old).length - 1;
    if (n !== 1) throw new Error(`${m.id}: old-string occurrences ${n}`);
    src = pristine.replace(m.old, m.new);
  }
  const p = join(OUT, "mutants", `${m.id}.mjs`);
  writeFileSync(p, src);
  mutantFiles[m.id] = { path: p, sha256: sha(src) };
}

// ---------- fixture trees (each mirrors the lane layout) ----------
const genuineEntry = readFileSync(join(CLONE, ENTRY_REL));
const genuineReceiptTxt = readFileSync(join(CLONE, RECEIPT_REL), "utf8");
const genuineReceipt = JSON.parse(genuineReceiptTxt);
const run1 = readFileSync(join(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"));
const run2 = readFileSync(join(CLONE, "corpus/evidence/round-32/bidi/run2/transcript.jsonl"));
const genuineDriver = readFileSync(join(CLONE, "scripts/bidi-loopback-round32.mjs"));
const gateBytes = readFileSync(join(CLONE, "scripts/check-bidi-runtime.mjs"));
const v1Entry = readFileSync(join(BLOBS, "v1-entry.md"));
const v1ReceiptTxt = readFileSync(join(BLOBS, "v1-receipt.json"), "utf8");
const v1Driver = readFileSync(join(BLOBS, "v1-driver-reexport.mjs"));
const v2Entry = readFileSync(join(BLOBS, "v2-entry-duplicates.md"));
const v3ReceiptTxt = readFileSync(join(BLOBS, "v3-receipt-same-path.json"), "utf8");
const v8Entry = readFileSync(join(BLOBS, "v8-entry-r16-unknown.md"));
const DRIVER_REL = "corpus/evidence/round-32/bidi/bidi-driver.mjs";

function tree(name) {
  const root = join(S, "fix", name);
  const put = (rel, data) => {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, data);
  };
  const putCopy = (rel, srcAbs) => put(rel, readFileSync(srcAbs));
  return { root, put, putCopy };
}
function receiptVariant(name, mutate) {
  const r = JSON.parse(genuineReceiptTxt);
  mutate(r);
  return Buffer.from(JSON.stringify(r, null, 1) + "\n");
}

const trees = {};
{ // v1same: w1 blobs v1 verbatim; transcripts = real run1 bytes twice (blob claims identical shas)
  const t = tree("v1same"); const r = t.root;
  t.put(ENTRY_REL, v1Entry); t.put(RECEIPT_REL, v1ReceiptTxt); t.put(DRIVER_REL, v1Driver);
  const v1r = JSON.parse(v1ReceiptTxt);
  for (const run of v1r.runs) t.put(run.transcript, run1);
  trees.v1same = r;
}
{ // v1dist: re-export driver (w1 blob) as the ONLY barrier: genuine entry + genuine distinct transcripts
  const t = tree("v1dist"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("v1dist", (x) => { x.driver = DRIVER_REL; }));
  t.put(DRIVER_REL, v1Driver);
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.v1dist = r;
}
{ // v2: w1 blob duplicate-rows entry (16x R2) over an otherwise genuine tree
  const t = tree("v2"); const r = t.root;
  t.put(ENTRY_REL, v2Entry); t.put(RECEIPT_REL, genuineReceiptTxt);
  t.put("scripts/bidi-loopback-round32.mjs", genuineDriver);
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.v2 = r;
}
{ // v3: w1 blob same-path-twice receipt; cited driver = the gate's own bytes; one transcript file
  const t = tree("v3"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry); t.put(RECEIPT_REL, v3ReceiptTxt); t.put(DRIVER_REL, gateBytes);
  const v3r = JSON.parse(v3ReceiptTxt);
  t.put(v3r.runs[0].transcript, run1);
  trees.v3 = r;
}
{ // v4: two byte-identical transcripts at distinct paths, honest driver (isolates digest distinctness)
  const t = tree("v4"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("v4", (x) => { x.runs[1].transcript = "corpus/evidence/round-32/bidi/v4copy/run2/transcript.jsonl"; }));
  t.put("scripts/bidi-loopback-round32.mjs", genuineDriver);
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/v4copy/run2/transcript.jsonl", run1);
  trees.v4 = r;
}
{ // onerun: single-run receipt (isolates the >= 2 transcripts rule)
  const t = tree("onerun"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("onerun", (x) => { x.runs = [x.runs[0]]; }));
  t.put("scripts/bidi-loopback-round32.mjs", genuineDriver);
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  trees.onerun = r;
}
{ // nodriver: receipt cites a driver path that does not exist (isolates the null guard)
  const t = tree("nodriver"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("nodriver", (x) => { x.driver = "scripts/nonexistent-driver.mjs"; }));
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.nodriver = r;
}
{ // gateplus: cited driver = gate bytes + one trailing newline (sha differs, names remain)
  const t = tree("gateplus"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("gateplus", (x) => { x.driver = DRIVER_REL; }));
  t.put(DRIVER_REL, Buffer.concat([gateBytes, Buffer.from("\n")]));
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.gateplus = r;
}
{ // v8: w1 blob entry (R16 + invented R18 marked yes) over an otherwise genuine tree
  const t = tree("v8"); const r = t.root;
  t.put(ENTRY_REL, v8Entry); t.put(RECEIPT_REL, genuineReceiptTxt);
  t.put("scripts/bidi-loopback-round32.mjs", genuineDriver);
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.v8 = r;
}
{ // importeval: driver imports the gate's unflagged `evaluate` export (importsGate probe)
  const t = tree("importeval"); const r = t.root;
  t.put(ENTRY_REL, genuineEntry);
  t.put(RECEIPT_REL, receiptVariant("importeval", (x) => { x.driver = DRIVER_REL; }));
  t.put(DRIVER_REL, Buffer.from('import { evaluate } from "../../../../scripts/check-bidi-runtime.mjs";\n'));
  t.put("corpus/evidence/round-32/bidi/run1/transcript.jsonl", run1);
  t.put("corpus/evidence/round-32/bidi/run2/transcript.jsonl", run2);
  trees.importeval = r;
}

const INPUTS = [
  { id: "G-genuine-b234a589", root: CLONE, entry: ENTRY_REL, receipt: RECEIPT_REL },
  ...Object.entries(trees).map(([id, root]) => ({ id, root, entry: ENTRY_REL, receipt: RECEIPT_REL })),
];

function runCounter(counterPath, input) {
  const res = spawnSync("node", [counterPath, input.root, input.entry, input.receipt],
    { encoding: "utf8", env: { ...process.env, TMPDIR: join(S, "tmp") } });
  let parsed = null;
  try { parsed = JSON.parse(res.stdout); } catch {}
  return { exit: res.status, stderr: (res.stderr || "").trim(), out: parsed };
}

const results = { generatedBy: "MutDistinct build-and-run.mjs", cloneRev: "b234a58920134424e0d104f137311ff54a16d26b", pristineSha256: sha(pristine), mutants: mutantFiles, inputs: {}, runs: {}, flips: {} };
for (const input of INPUTS) results.inputs[input.id] = input;

results.runs.pristine = {};
for (const input of INPUTS) results.runs.pristine[input.id] = runCounter(pristinePath, input);

for (const m of MUTANTS) {
  results.runs[m.id] = {};
  results.flips[m.id] = [];
  for (const input of INPUTS) {
    const r = runCounter(mutantFiles[m.id].path, input);
    results.runs[m.id][input.id] = r;
    const pExit = results.runs.pristine[input.id].exit;
    if (r.exit !== pExit) {
      results.flips[m.id].push({
        input: input.id, pristineExit: pExit, mutantExit: r.exit,
        direction: pExit === 1 && r.exit === 0 ? "missed-forgery 1->0" : pExit === 0 && r.exit === 1 ? "false-alarm 0->1" : `other ${pExit}->${r.exit}`,
      });
    }
  }
}

// fixture manifest: sha256 of every file placed in every tree (audit without copying trees)
results.fixtureManifest = {};
for (const [id, root] of Object.entries(trees)) {
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p); else files.push({ rel: p.slice(root.length + 1), sha256: sha(readFileSync(p)) });
    }
  };
  walk(root);
  results.fixtureManifest[id] = files;
}

writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 1));

// human-readable matrix
let tsv = ["mutant\tinput\tpristineExit\tmutantExit\tflip"];
for (const m of MUTANTS) for (const input of INPUTS) {
  const pExit = results.runs.pristine[input.id].exit, mExit = results.runs[m.id][input.id].exit;
  tsv.push([m.id, input.id, pExit, mExit, pExit === mExit ? "" : (pExit === 1 ? "MISSED 1->0" : "FALSE-ALARM 0->1")].join("\t"));
}
writeFileSync(join(OUT, "matrix.tsv"), tsv.join("\n") + "\n");

console.log("pristine verdicts:");
for (const input of INPUTS) {
  const r = results.runs.pristine[input.id];
  console.log(`  ${input.id}: exit ${r.exit} ok=${r.out ? r.out.ok : "?"}`);
}
console.log("flips:");
for (const m of MUTANTS) console.log(`  ${m.id}: ${results.flips[m.id].length ? results.flips[m.id].map((f) => `${f.input} ${f.direction}`).join("; ") : "SURVIVED (no flip)"}`);
