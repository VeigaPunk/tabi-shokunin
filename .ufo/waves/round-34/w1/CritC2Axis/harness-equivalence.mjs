#!/usr/bin/env node
// harness-equivalence.mjs — CritC2Axis (tabi round 34, C2 attack).
// Question: can a CASES entry (whose pass predicate is exit/admitted/population/reason)
// distinguish mutants M04, M05, M06 of scripts/check-bidi-runtime.mjs, or are they
// equivalent on that observable surface?
// Method: replicate runSelftest()'s fixture builder, build one fixture per scenario,
// then run the PRISTINE gate and each patched gate variant (one mutant applied) on
// the SAME fixture repo at the SAME rev, and compare the quadruple the runner compares.
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";

const S = process.env.S || "/fast/scratch/hyaku/tabi-r34/CritC2Axis";
const GATE = `${S}/clone/scripts/check-bidi-runtime.mjs`;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const gateSrc = readFileSync(GATE, "utf8");

const MUTANTS = JSON.parse(readFileSync(`${S}/out/mutants.json`, "utf8"));
const MUT = Object.fromEntries(MUTANTS.map((m) => [m.id, [m.find, m.replace]]));

const count = (h, n) => { let c = 0, i = 0; while ((i = h.indexOf(n, i)) !== -1) { c += 1; i += n.length; } return c; };
const variants = { pristine: gateSrc };
for (const [id, [find, repl]] of Object.entries(MUT)) {
  const n = count(gateSrc, find);
  if (n !== 1) throw new Error(`${id} find occurs ${n} times in the gate`);
  variants[id] = gateSrc.replace(find, () => repl);
}
const mods = {};
for (const [name, text] of Object.entries(variants)) {
  const p = `${S}/variants/${name}.mjs`;
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
  mods[name] = await import(pathToFileURL(p).href);
}

// ---- verbatim from the gate's selftest (entryDoc / regDoc / lessonsDoc) ----
const ENTRY = "corpus/knowledge/bidi-fixture.md";
const LESSONS = "corpus/lessons/round-33.md";
const ALL_OK = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "R17"];
const ROWS = mods.pristine.ROWS;
function entryDoc(o) {
  const rows = o.entryRows || (o.ids || ALL_OK).map((id, k) => [id, o.cell ? o.cell(id, k) : "yes"]);
  const all = o.extraRows ? rows.concat(o.extraRows) : rows;
  return [`source: ${o.source || "S002"} — fixture`, "verified-at: fixture", "recheck: fixture", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
    ...all.map(([id, cell]) => `| ${id} | ${ROWS[id] || "x"} | m | ${cell} | receipt |`), ""].join("\n");
}
function regDoc(rows) {
  return ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map(([id, usedBy]) => `| ${id} | t — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${usedBy} |`), ""].join("\n");
}
function lessonsDoc(ids) {
  return ["# fixture round lesson", "", "## Gate", "", "| row | URL | accessed | receipt quote |", "|---|---|---|---|",
    ...ids.map((id) => `| ${id} | https://e.test/${id.toLowerCase()} | 2026-10-26T00:00:00Z (HTTP 200, 12 B, sha256 \`${"a".repeat(64)}\`) | "fixture receipt quote" |`), "",
    "## Mistakes", "", "- none.", ""].join("\n");
}

function lessonsDocNoSha(ids) {
  return ["# fixture round lesson", "", "## Gate", "", "| row | URL | accessed | receipt quote |", "|---|---|---|---|",
    ...ids.map((id) => `| ${id} | https://e.test/${id.toLowerCase()} | 2026-10-26T00:00:00Z (HTTP 200, 12 B) | "fixture receipt quote" |`), "",
    "## Mistakes", "", "- none.", ""].join("\n");
}

// ---- makeFixture (verbatim shape from the gate) ----
const ROOTDIR = mkdtempSync(join(S, "fx-"));
function makeFixture() {
  const root = mkdtempSync(join(ROOTDIR, "tabi-bidi-runtime-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout.trim();
  };
  run(["init", "-q"]);
  if (run(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch");
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  const put = (rel, text) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, text); };
  const commit = () => { run(["add", "-A"]); run(["commit", "-q", "--allow-empty", "-m", "fixture"]); return run(["rev-parse", "HEAD"]); };
  return { root, put, commit };
}

// ---- build one fixture exactly like runSelftest(), plus the post-processing hooks ----
function buildFixture(o = {}) {
  const fx = makeFixture();
  const goldenLines = mods.pristine.goldenLines;
  const sha256l = sha256;
  fx.put("corpus/SOURCES.md", regDoc([["S001", ENTRY]]));
  fx.put(LESSONS, o.lessonNoSha ? lessonsDocNoSha(["S002"]) : lessonsDoc(["S002"]));
  const baseline = fx.commit();
  const usedBy = o.usedBy || ENTRY;
  fx.put("corpus/SOURCES.md", regDoc([["S001", ENTRY], ["S002", usedBy]]));
  if (!o.noEntry) fx.put(ENTRY, entryDoc(o));
  const runsN = o.runs || 2;
  const texts = [];
  for (let k = 1; k <= runsN; k += 1) {
    const opt = { base: o.base, version: o.version, mutate: o.mutate, shotTag: o.shotPerRun ? `run${k}` : "", sessionTag: `run${k}` };
    if (k === 1 && o.run1) Object.assign(opt, o.run1);
    if (k === 2 && o.run2) Object.assign(opt, o.run2);
    let text = goldenLines(opt);
    if (o.postText) text = o.postText(text, k);
    texts.push(text);
  }
  if (o.samePath && runsN >= 2) texts[1] = texts[0];
  if (o.sameBytes && runsN >= 2) texts[1] = texts[0];
  const runs = [];
  for (let k = 1; k <= runsN; k += 1) {
    const rel = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`;
    const cite = o.samePath && k === 2 ? "corpus/evidence/round-32/bidi/run1/transcript.jsonl" : rel;
    fx.put(rel, texts[k - 1]);
    runs.push({ name: `run${k}`, transcript: cite, transcriptSha256: sha256l(Buffer.from(texts[k - 1])) });
  }
  const driver = o.driverPath || "scripts/bidi-driver-fixture.mjs";
  const driverBytes = Buffer.from(o.driverText || "// fixture driver\n");
  if (!o.noDriver) fx.put(driver, driverBytes);
  fx.put("corpus/evidence/round-32/bidi/receipt.json", JSON.stringify({
    schema: "tabi-bidi-receipt-v1", fixtureSha256: o.fixtureSha || mods.pristine.FIXTURE_SHA256,
    browserVersion: "154.0.8037.97", driver, driverSha256: o.driverSha || sha256l(driverBytes), runs,
  }, null, 2));
  const rev = fx.commit();
  return { root: fx.root, rev, baseline };
}

// the runner's comparison surface, verbatim from runSelftest()
function triple(out) {
  const exit = out.clean ? 0 : 1;
  const reason = out.entryFinding || (out.rows.find((r) => !r.admitted) || {}).reason || null;
  const detail = (out.rows.find((r) => !r.admitted) || {}).detail || null;
  return { exit, admitted: out.admitted, population: out.population, reason, detail };
}

// ---- scenarios ----
const upperSid = "AB".repeat(16);
const lowerCtx = "abcdef0123456789abcdef0123456789";
const toUpperUrlSid = (text) => text; // sid uppercase already builds the url uppercase
const otherWsSid = (text) => text.split("\n").map((l) => l.includes('"dir":"http-res"') ? l.replace(/\/session\/[0-9a-f]{32}/, "/session/" + "f".repeat(32)) : l).join("\n");
const lowerUrlSid = (text) => text.split("\n").map((l) => {
  if (!l.includes('"dir":"http-res"')) return l;
  return l.replace(/\/session\/([0-9a-fA-F]{32})/g, (m, s) => `/session/${s.toLowerCase()}`);
}).join("\n");

const SCENARIOS = [
  ["golden", {}, ["pristine"]],
  ["samePath", { samePath: true }, ["pristine", "M04", "M05"]],
  ["sameBytes", { sameBytes: true }, ["pristine", "M04", "M05"]],
  ["upperYes-cell", { cell: () => "Yes" }, ["pristine", "M03"]],
  ["lowercase-context", { run1: { contextId: lowerCtx }, run2: { contextId: lowerCtx } }, ["pristine", "M08"]],
  ["uppercase-sid", { run1: { sessionId: upperSid }, run2: { sessionId: upperSid } }, ["pristine", "M06"]],
  ["uppercase-sid-lower-url", { run1: { sessionId: upperSid }, run2: { sessionId: upperSid }, postText: lowerUrlSid }, ["pristine", "M06"]],
  ["dup-two-rows", { ids: ["R2", "R2"] }, ["pristine", "M01"]],
  ["ws-url-other-session", { run1: { postTextWs: true }, run2: { postTextWs: true }, postText: otherWsSid }, ["pristine", "M07"]],
  ["driver-imports-ROWS", { driverPath: "corpus/evidence/round-32/bidi/f6-driver.mjs", driverText: 'import { ROWS } from "../../../../scripts/check-bidi-runtime.mjs";\n' }, ["pristine", "M09"]],
  ["driver-imports-serveFixture", { driverPath: "corpus/evidence/round-32/bidi/f6-driver.mjs", driverText: 'import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "../../../../scripts/check-bidi-runtime.mjs";\n' }, ["pristine", "M10"]],
  ["gate-row-no-sha", { lessonNoSha: true }, ["pristine", "M16"]],
  ["all-no-rows", { entryRows: [["R2", "no"]] }, ["pristine", "M18"]],
  ["two-runs-same-sid-diff-bytes", {
    run1: { sessionId: "0".repeat(32) }, run2: { sessionId: "0".repeat(32), mutate: (s) => { s.push(["cmd", "session.status", {}, { ready: true }]); } },
  }, ["pristine", "M19"]],
];

const report = [];
for (const [name, o, which] of SCENARIOS) {
  const fx = buildFixture(o);
  const row = { scenario: name };
  for (const v of which) {
    const gate = mods[v];
    const out = await gate.evaluate(fx.root, { rev: fx.rev, baseline: fx.baseline, entry: ENTRY, live: false });
    row[v] = triple(out);
  }
  report.push(row);
  rmSync(fx.root, { recursive: true, force: true });
}
rmSync(ROOTDIR, { recursive: true, force: true });
console.log(JSON.stringify(report, null, 1));
// equivalence verdict on the runner's surface (exit, admitted, population, reason)
const differs = (a, b) => ["exit", "admitted", "population", "reason"].some((k) => a[k] !== b[k]);
for (const row of report) {
  const v = Object.keys(row).filter((k) => k !== "scenario" && k !== "pristine");
  for (const m of v) console.log(`DISTINGUISHABLE_on_runner_surface scenario=${row.scenario} ${m}=${differs(row.pristine, row[m])}`);
}
