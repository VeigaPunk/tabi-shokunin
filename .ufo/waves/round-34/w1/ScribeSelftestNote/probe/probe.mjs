
// probe.mjs — ScribeSelftestNote (tabi r34 w1): empirical kill-map probe for the 12 C2 survivors.
// Read-only w.r.t. the lane: gate bytes come from the seat's scratch clone at 15dfaccb.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const S = process.env.S;
const BASE = join(S, "clone/scripts/check-bidi-runtime.mjs");
const PRISTINE = readFileSync(BASE, "utf8");

const PROBES = [
  { id: "p-sha-dup-same-bytes", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ sameBytes: true }) },
  { id: "p-uppercase-sid", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ run1: { sessionId: "A".repeat(32) }, run2: { sessionId: "B".repeat(32) } }) },
  { id: "p-uppercase-yes-cell", exit: 0, admitted: 16, reason: null, build: () => ({ cell: () => "YES" }) },
  { id: "p-two-duplicate-ids", exit: 1, admitted: 0, reason: "x3-duplicate-id", build: () => ({ ids: ["R2", "R2"] }) },
  { id: "p-lowercase-context", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ contextId: "a".repeat(32) }) },
  { id: "p-sid-repeated-distinct-bytes", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ run1: { sessionId: "ab".repeat(16) }, run2: { sessionId: "ab".repeat(16), base: "http://127.0.0.1:40001" } }) },
  { id: "p-driver-imports-servefixture", exit: 0, admitted: 16, reason: null, build: () => ({ driverText: 'import { serveFixture } from "./check-bidi-runtime.mjs";\n' }) },
  { id: "p-driver-imports-rows", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ driverText: 'import { ROWS } from "./check-bidi-runtime.mjs";\n' }) },
  { id: "p-all-rows-no", exit: 1, admitted: 0, reason: null, build: () => ({ ids: ["R16"], cell: () => "no" }) },
];

const PROBE_SRC = PROBES.map((p) => `  { id: ${JSON.stringify(p.id)}, exit: ${p.exit}, admitted: ${p.admitted}, reason: ${JSON.stringify(p.reason)}, build: () => (${p.build.toString()})() },`).join("\n");

const MUT = {
  M01: ["else if ((idCounts.get(id) || 0) > 1)", "else if ((idCounts.get(id) || 0) > 2)"],
  M03: ["return { verdict: m[1].toLowerCase(), measured: true, detail: null };", "return { verdict: m[1], measured: true, detail: null };"],
  M05: ['else if (new Set(runs.map((r) => r.sha)).size !== runs.length) receiptFinding = "transcript sha256 repeated across runs (byte-identical copies)";', ";"],
  M06: ["const SESSION_ID = /^[0-9a-f]{32}$/;", "const SESSION_ID = /^[0-9a-fA-F]{32}$/;"],
  M08: ["const CONTEXT_ID = /^[0-9A-F]{32}$/;", "const CONTEXT_ID = /^[0-9a-fA-F]{32}$/;"],
  M09: ['const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture"]);', 'const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture", "ROWS"]);'],
  M10: ['", "VIEWPORT", "DATA_TEXT", "serveFixture"]);', '", "VIEWPORT", "DATA_TEXT"]);'],
  M18: ["out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0;", "out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 0 && out.failing === 0;"],
  M19: ["if (!receiptFinding && new Set(sids).size !== sids.length) receiptFinding = `sessionId repeated across runs: ${sids.join(\", \")}`;", "// sessionId distinctness disabled (mutant)"],
  "M05+M19": null,
  "M06+WS_WIDE": null,
};
const pairs = {
  "M05+M19": [MUT.M05, MUT.M19],
  "M06+WS_WIDE": [MUT.M06, ["const WS_SESSION = /^ws:\\/\\/[^/]+\\/session\\/([0-9a-f]{32})$/;", "const WS_SESSION = /^ws:\\/\\/[^/]+\\/session\\/([0-9a-fA-F]{32})$/;"]],
};
const count = (h, n) => h.split(n).length - 1;

function build(name, edits) {
  let text = PRISTINE;
  for (const [find, rep] of edits || []) {
    const c = count(text, find);
    if (c !== 1) throw new Error(`${name}: find occurs ${c} times: ${find.slice(0, 60)}`);
    text = text.replace(find, rep);
  }
  const anchor = "];\n\nfunction makeFixture()";
  const c = count(text, anchor);
  if (c !== 1) throw new Error(`${name}: CASES anchor occurs ${c} times`);
  text = text.replace(anchor, PROBE_SRC + "\n];\n\nfunction makeFixture()");
  return text;
}

const variants = [["pristine", null]];
for (const [k, v] of Object.entries(MUT)) variants.push([k, v ? [v] : pairs[k]]);

const out = [];
for (const [name, edits] of variants) {
  const file = join(S, "probe", `${name.replace(/\+/g, "_")}.mjs`);
  writeFileSync(file, build(name, edits));
  const r = spawnSync(process.execPath, [file, "--selftest"], { cwd: join(S, "probe"), encoding: "utf8", env: { ...process.env, TMPDIR: join(S, "tmp") }, timeout: 600000, maxBuffer: 64 << 20 });
  const lines = (r.stdout || "").split("\n");
  const probeLines = lines.filter((l) => l.startsWith("CASE id=p-"));
  const summary = lines.filter((l) => l.startsWith("BIDI_RUNTIME_SELFTEST")).pop() || "";
  out.push({
    variant: name,
    exit: r.status,
    summary,
    probes: probeLines.map((l) => { const id = /id=(\S+)/.exec(l)[1]; return [id, l.trim().endsWith("PASS") ? "PASS" : "FAIL"]; }),
    failedOther: lines.filter((l) => l.startsWith("CASE id=") && !l.startsWith("CASE id=p-") && l.trim().endsWith("FAIL")).map((l) => /id=(\S+)/.exec(l)[1]),
    stderr: (r.stderr || "").slice(0, 400),
  });
  console.log(`${name}: exit=${r.status} ${summary}`);
  for (const [id, st] of out.at(-1).probes) console.log(`   ${id} ${st}`);
}
writeFileSync(join(S, "probe/killmap.json"), JSON.stringify(out, null, 2));
