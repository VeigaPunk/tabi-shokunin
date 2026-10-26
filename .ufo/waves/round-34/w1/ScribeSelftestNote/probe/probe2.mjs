
// probe2.mjs — ScribeSelftestNote (tabi r34 w1): probe the three survivors that need a NEW
// fixture-builder option (M04, M07, M16) plus the corrected M08 context-id probe.
// Gate bytes from the seat's scratch clone at 15dfaccb; only builder options are added.
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const S = process.env.S;
const PRISTINE = readFileSync(join(S, "clone/scripts/check-bidi-runtime.mjs"), "utf8");

// Builder-option additions (self-test fixture only; no rule line touched).
const BUILDER = [
  // (a) cite run1's transcript path for run2 without also copying its bytes
  ['      const cite = o.samePath && k === 2 ? "corpus/evidence/round-32/bidi/run1/transcript.jsonl" : rel;',
   '      const cite = (o.samePath || o.samePathDistinctBytes) && k === 2 ? "corpus/evidence/round-32/bidi/run1/transcript.jsonl" : rel;'],
  // (b) a webSocketUrl whose session segment is a *different* well-shaped id
  ['  const wsUrl = `ws://${wsHost}:${wsPort}/session/${sid}`;',
   '  const wsUrl = `ws://${wsHost}:${wsPort}/session/${wsSid === null ? sid : wsSid}`;'],
  ['export function goldenLines({ base = "http://127.0.0.1:40000", version = "154.0.8037.97", mutate = () => {}, shotTag = "", driverVersion = "154.0.8037.97 (fixture)", sessionTag = "golden", sessionId = null, contextId = null, wsHost = "127.0.0.1", wsPort = 9515 } = {}) {',
   'export function goldenLines({ base = "http://127.0.0.1:40000", version = "154.0.8037.97", mutate = () => {}, shotTag = "", driverVersion = "154.0.8037.97 (fixture)", sessionTag = "golden", sessionId = null, contextId = null, wsHost = "127.0.0.1", wsPort = 9515, wsSid = null } = {}) {'],
  ['        if (k === 2 && o.run2) Object.assign(opt, o.run2);',
   '        if (k === 2 && o.run2) Object.assign(opt, o.run2);\n        if (o.wsSid) opt.wsSid = o.wsSid;'],
  // (c) a Gate table row with an https URL and NO 64-hex sha256
  ['function lessonsDoc(ids) {',
   'function lessonsDoc(ids, noSha = false) {'],
  ['    ...ids.map((id) => `| ${id} | https://e.test/${id.toLowerCase()} | 2026-10-26T00:00:00Z (HTTP 200, 12 B, sha256 \\`${"a".repeat(64)}\\`) | "fixture receipt quote" |`), "",',
   '    ...ids.map((id) => noSha\n      ? `| ${id} | https://e.test/${id.toLowerCase()} | 2026-10-26T00:00:00Z (HTTP 200, 12 B) | "fixture receipt quote" |`\n      : `| ${id} | https://e.test/${id.toLowerCase()} | 2026-10-26T00:00:00Z (HTTP 200, 12 B, sha256 \\`${"a".repeat(64)}\\`) | "fixture receipt quote" |`), "",'],
  ['      fx.put(LESSONS, lessonsDoc(["S002"]));',
   '      fx.put(LESSONS, lessonsDoc(["S002"], o.noGateSha));'],
];

const PROBES = [
  { id: "p-same-path-distinct-bytes", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ samePathDistinctBytes: true, run2: { base: "http://127.0.0.1:40001" } }) },
  { id: "p-ws-url-other-sid", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ wsSid: "cd".repeat(16) }) },
  { id: "p-gate-row-no-sha", exit: 1, admitted: 0, reason: "s1-source-row", build: () => ({ noGateSha: true }) },
  { id: "p-lowercase-context", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ run1: { contextId: "a".repeat(32) }, run2: { contextId: "b".repeat(32) } }) },
];

const PROBE_SRC = PROBES.map((p) => `  { id: ${JSON.stringify(p.id)}, exit: ${p.exit}, admitted: ${p.admitted}, reason: ${JSON.stringify(p.reason)}, build: () => (${p.build.toString()})() },`).join("\n");

const MUT = {
  M04: ['if (new Set(runs.map((r) => r.path)).size !== runs.length) receiptFinding = `transcript path repeated across runs: ${runs.map((r) => r.path).join(", ")}`;', "if (false) receiptFinding = `transcript path repeated across runs`;"],
  M07: ['if (m[1] !== sid) return { why: `webSocketUrl session segment ${m[1]} != sessionId ${sid}` };', ""],
  M16: ["const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text));", "const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text));"],
  M08: ["const CONTEXT_ID = /^[0-9A-F]{32}$/;", "const CONTEXT_ID = /^[0-9a-fA-F]{32}$/;"],
};
const count = (h, n) => h.split(n).length - 1;

function build(name, edits) {
  let text = PRISTINE;
  for (const [find, rep] of BUILDER) {
    const c = count(text, find);
    if (c !== 1) throw new Error(`${name}: builder anchor occurs ${c} times: ${find.slice(0, 70)}`);
    text = text.replace(find, rep);
  }
  for (const [find, rep] of edits || []) {
    const c = count(text, find);
    if (c !== 1) throw new Error(`${name}: find occurs ${c} times: ${find.slice(0, 60)}`);
    text = text.replace(find, rep);
  }
  const anchor = "];\n\nfunction makeFixture()";
  if (count(text, anchor) !== 1) throw new Error(`${name}: CASES anchor`);
  return text.replace(anchor, PROBE_SRC + "\n];\n\nfunction makeFixture()");
}

const variants = [["pristine", null], ["M04", [MUT.M04]], ["M07", [MUT.M07]], ["M16", [MUT.M16]], ["M08", [MUT.M08]]];
const out = [];
for (const [name, edits] of variants) {
  const file = join(S, "probe", `p2-${name}.mjs`);
  writeFileSync(file, build(name, edits));
  const r = spawnSync(process.execPath, [file, "--selftest"], { cwd: join(S, "probe"), encoding: "utf8", env: { ...process.env, TMPDIR: join(S, "tmp") }, timeout: 600000, maxBuffer: 64 << 20 });
  const lines = (r.stdout || "").split("\n");
  const probes = lines.filter((l) => l.startsWith("CASE id=p-")).map((l) => [/id=(\S+)/.exec(l)[1], l.trim().endsWith("PASS") ? "PASS" : "FAIL"]);
  const summary = lines.filter((l) => l.startsWith("BIDI_RUNTIME_SELFTEST")).pop() || "";
  out.push({ variant: name, exit: r.status, summary, probes, failedOther: lines.filter((l) => l.startsWith("CASE id=") && !l.startsWith("CASE id=p-") && l.trim().endsWith("FAIL")).map((l) => /id=(\S+)/.exec(l)[1]), stderr: (r.stderr || "").slice(0, 300) });
  console.log(`${name}: exit=${r.status} ${summary}`);
  for (const [id, st] of probes) console.log(`   ${id} ${st}`);
  if (out.at(-1).failedOther.length) console.log("   other failing:", out.at(-1).failedOther.join(","));
}
writeFileSync(join(S, "probe/killmap2.json"), JSON.stringify(out, null, 2));
