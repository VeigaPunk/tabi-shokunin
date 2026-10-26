#!/usr/bin/env node
// CritC3Gaming scratch harness: adversarial fixtures against the frozen C3 counter.
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";

const S = process.env.S;
const COUNTER = join(S, "lane/scripts/check-release-pins.mjs");
const LANE = join(S, "lane");
const OLD = "154.0.8037.97";
const NEW = "156.0.8078.47";
const REG = "corpus/SOURCES.md";
const RECEIPT = "corpus/evidence/round-29/release-pins/receipt.json";
const BYTES = "corpus/evidence/round-29/release-pins/bytes";
const REFETCH = "corpus/evidence/round-29/release-pins/refetch";
const sha = (b) => createHash("sha256").update(b).digest("hex");

function fixture(name) {
  const root = mkdtempSync(join(S, `fx-${name}-`));
  const g = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  g(["init", "-q"]);
  if (g(["rev-parse", "--show-toplevel"]).trim() !== root) throw new Error("fixture root mismatch");
  g(["config", "user.email", "fixture@tabi.local"]);
  g(["config", "user.name", "tabi-fixture"]);
  const put = (rel, data) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); };
  return {
    root, put, g,
    commit() { g(["add", "-A"]); g(["commit", "--allow-empty", "-q", "-m", name]); return g(["rev-parse", "HEAD"]).trim(); },
  };
}

function run(fx, rev) {
  const r = spawnSync("node", [COUNTER, "--repo", fx.root, "--rev", rev, "--stable", NEW, "--json"], { encoding: "utf8" });
  let out = null;
  try { out = JSON.parse(r.stdout); } catch { out = null; }
  return {
    exit: r.status,
    population: out?.population ?? null,
    unresolved: out?.unresolved ?? null,
    holds: out?.holds ?? null,
    drifted: out?.drifted ?? null,
    rows: out?.rows ?? null,
    stderr: r.stderr.trim().slice(0, 300),
    refusal: out?.refusal ?? null,
  };
}

const summarize = (r) => ({
  exit: r.exit, population: r.population, unresolved: r.unresolved,
  holds: r.holds, drifted: r.drifted,
  reportIds: r.rows ? r.rows.map((x) => x.id) : null,
  unresolvedReasons: r.rows ? r.rows.filter((x) => !x.resolved).map((x) => `${x.id}:${x.reasons.join("+")}`) : null,
  stderr: r.stderr || null, refusal: r.refusal,
});

// real lane data
const realReg = readFileSync(join(LANE, REG), "utf8");
const realReceipt = JSON.parse(readFileSync(join(LANE, RECEIPT), "utf8"));
const realBytes = join(LANE, BYTES);

function writeReceipt(fx, receipt) { fx.put(RECEIPT, `${JSON.stringify(receipt, null, 2)}\n`); }
function copyBytes(fx) {
  for (const f of realReceipt.rows) for (const e of f.files) {
    const ob = join(realBytes, e.old_tag, e.path);
    cpSync(ob, join(fx.root, e.old_bytes), { recursive: true });
  }
}
function regLineFromCells(cells) { return `| ${cells.join(" | ")} |`; }
function realRegRow(id) {
  return realReg.split("\n").find((l) => new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`).test(l));
}
function rowCells(line) { return line.split("|").map((c) => c.trim()); }

const results = {};

// ---------------------------------------------------------------- S1
// copy-old-as-new at full 23-row scale: no network, 156 tree = byte copy of 154.
{
  const fx = fixture("s1-copyold");
  fx.put(REG, realReg);
  copyBytes(fx);
  cpSync(join(fx.root, BYTES, OLD), join(fx.root, BYTES, NEW), { recursive: true });
  const rec = JSON.parse(JSON.stringify(realReceipt));
  for (const row of rec.rows) {
    for (const f of row.files) {
      f.new_status = f.old_status;
      f.new_sha256 = f.old_sha256;
    }
    fx.put(`${REFETCH}/${row.id}.json`, `${JSON.stringify({
      id: row.id, seat: "RivalSeat-not-the-fetcher", fetched_at: "whenever",
      files: row.files.map((f) => ({ path: f.path, tag: NEW, status: f.new_status, sha256: f.new_sha256 })),
    }, null, 2)}\n`);
  }
  writeReceipt(fx, rec);
  const head = fx.commit();
  results.S1_copy_old_as_new = { desc: "all 23 rows: bytes/156 = byte copy of bytes/154, receipt new_sha:=old_sha, fabricated refetch", ...summarize(run(fx, head)) };
  results.S1_identity = spawnSync("diff", ["-rq", join(fx.root, BYTES, OLD), join(fx.root, BYTES, NEW)], { encoding: "utf8" }).status;
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S2
// range-subset: anchor says 7-12, receipt declares only [12,12]; lines 7-11 changed.
{
  const fx = fixture("s2-range-subset");
  const path = "third_party/blink/renderer/core/script_tools/model_context_supplement.idl";
  const oldText = Array.from({ length: 12 }, (_, i) => `line${i + 1} OLD`).join("\n") + "\n";
  const newText = Array.from({ length: 12 }, (_, i) => (i >= 6 && i <= 10 ? `line${i + 1} TOTALLY-REWRITTEN` : `line${i + 1} OLD`)).join("\n") + "\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S033", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "tag 154.0.8037.97, lines 7-12", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S033", fetched_by: "PinS033", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[12, 12]] }] }] });
  fx.put(`${REFETCH}/S033.json`, `${JSON.stringify({ id: "S033", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] })}\n`);
  const head = fx.commit();
  results.S2_range_subset_7_12_declared_12 = { desc: "anchor names 7-12; receipt ranges [[12,12]]; lines 7-11 rewritten", ...summarize(run(fx, head)) };
  // control: honest full range
  const fx2 = fixture("s2b-honest");
  fx2.put(REG, readFileSync(join(fx.root, REG)));
  for (const rel of [`${BYTES}/${OLD}/${path}`, `${BYTES}/${NEW}/${path}`, `${REFETCH}/S033.json`]) fx2.put(rel, readFileSync(join(fx.root, rel)));
  const rec = JSON.parse(readFileSync(join(fx.root, RECEIPT), "utf8")); rec.rows[0].files[0].ranges = [[7, 12]];
  writeReceipt(fx2, rec);
  const head2 = fx2.commit();
  results.S2b_range_full_control = { desc: "same fixture, honest ranges [[7,12]]", ...summarize(run(fx2, head2)) };
  rmSync(fx.root, { recursive: true, force: true }); rmSync(fx2.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S3
// basename substitution + range shrink: source names content_switches.cc:596-603,
// receipt points at a fabricated file with the same basename in another directory.
{
  const fx = fixture("s3-basename");
  const realPath = "content/public/common/content_switches.cc";
  const fakePath = "attacker/elsewhere/content_switches.cc";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S062", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${realPath}?format=TEXT`, "code", "A", "scope", "content_switches.cc:596-603; devtools_pipe_handler.cc:135-200", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  const oldText = Array.from({ length: 603 }, (_, i) => (i === 595 ? "int fabricated_line_596;" : `f${i + 1}`)).join("\n") + "\n";
  const newText = oldText.replace("int fabricated_line_596;", "int fabricated_line_596; // changed elsewhere");
  fx.put(`${BYTES}/${OLD}/${fakePath}`, oldText);
  fx.put(`${BYTES}/${NEW}/${fakePath}`, newText);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S062", fetched_by: "PinS062", files: [{ path: fakePath, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${fakePath}`, new_bytes: `${BYTES}/${NEW}/${fakePath}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[596, 596]] }] }] });
  fx.put(`${REFETCH}/S062.json`, `${JSON.stringify({ id: "S062", seat: "RivalSeat", fetched_at: "x", files: [{ path: fakePath, tag: NEW, status: 200, sha256: sha(newText) }] })}\n`);
  const head = fx.commit();
  results.S3_basename_and_single_line = { desc: "row source names the real file; entry verifies attacker/elsewhere/content_switches.cc only, ranges [[596,596]] of 596-603", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S4
// self-supersession: a drifting row resolves itself via its own teaches cell.
{
  const fx = fixture("s4-selfsup");
  const path = "third_party/blink/public/devtools_protocol/domains/WebMCP.pdl";
  const oldText = "a\nb\nc\n";
  const newText = "a\nTOTALLY DIFFERENT\nc\n";
  // source carries BOTH tags so startsWith(supersedes S041) + refs/tags/<stable>/ both pass on the same row
  const src = `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT and https://chromium.googlesource.com/chromium/src/+/refs/tags/${NEW}/${path}?format=TEXT`;
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S041", src, "code", "A", "scope", "WebMCP.pdl:2-2", "supersedes S041 — this row now supersedes itself", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S041", fetched_by: "PinS041", superseded_by: "S041", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[2, 2]] }] }] });
  fx.put(`${REFETCH}/S041.json`, `${JSON.stringify({ id: "S041", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] })}\n`);
  const head = fx.commit();
  results.S4_self_supersession = { desc: "row's own teaches cell opens 'supersedes S041 —' and its source carries the stable tag; superseded_by points at itself", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S5
// vacuous superseder: a registry line that never fetched anything, carries only the
// stable tag, holds no bytes/receipt, yet clears another row's drift.
{
  const fx = fixture("s5-vacuous-sup");
  const path = "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc";
  const oldText = "a\nb\nc\n";
  const newText = "a\nREWRITTEN\nc\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S077", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "form_mcp_schema.cc:1-3", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n${regLineFromCells(["S900", `Nothing fetched — https://chromium.googlesource.com/chromium/src/+/refs/tags/${NEW}/this/path/does/not/exist.cc?format=TEXT`, "code", "C", "scope", "no anchor at all", "supersedes S077 — claimed, never verified", "guess", "2026-10-20", "90d", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S077", fetched_by: "PinS077", superseded_by: "S900", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[2, 2]] }] }] });
  fx.put(`${REFETCH}/S077.json`, `${JSON.stringify({ id: "S077", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] })}\n`);
  const head = fx.commit();
  results.S5_vacuous_superseder = { desc: "S900 has no receipt entry, no bytes, a nonexistent stable-tag path, and clears S077's drift", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S6
// population swap: drop one hard real row by putting a '|' in its anchor cell,
// add a synthetic cheap row -> population still 23, unresolved 0.
function s6(rootName, mutate) {
  const fx = fixture(rootName);
  let reg = readFileSync(join(LANE, REG), "utf8");
  const rec = JSON.parse(JSON.stringify(realReceipt));
  // make S105 unresolvable: delete its receipt entry
  rec.rows = rec.rows.filter((r) => r.id !== "S105");
  copyBytes(fx);
  cpSync(join(LANE, BYTES, NEW), join(fx.root, BYTES, NEW), { recursive: true });
  const fakePath = "attacker/fixture.cc";
  const oldText = "x\ny\nz\n";
  fx.put(`${BYTES}/${OLD}/${fakePath}`, oldText);
  fx.put(`${BYTES}/${NEW}/${fakePath}`, oldText);
  fx.put(`${REFETCH}/S999.json`, `${JSON.stringify({ id: "S999", seat: "RivalSeat", fetched_at: "x", files: [{ path: fakePath, tag: NEW, status: 200, sha256: sha(oldText) }] })}\n`);
  rec.rows.push({ id: "S999", fetched_by: "Attacker", files: [{ path: fakePath, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${fakePath}`, new_bytes: `${BYTES}/${NEW}/${fakePath}`, old_sha256: sha(oldText), new_sha256: sha(oldText), ranges: [[2, 2]] }] });
  // refetch for every real row that still has an entry (mirror the committed 156 shas)
  for (const row of rec.rows) {
    if (row.id === "S999") continue;
    fx.put(`${REFETCH}/${row.id}.json`, `${JSON.stringify({ id: row.id, seat: "RivalSeat", fetched_at: "x", files: row.files.map((f) => ({ path: f.path, tag: NEW, status: f.new_status, sha256: f.new_sha256 })) })}\n`);
  }
  reg = mutate(reg);
  fx.put(REG, reg);
  writeReceipt(fx, rec);
  const head = fx.commit();
  const r = run(fx, head);
  rmSync(fx.root, { recursive: true, force: true });
  return r;
}
const s999 = regLineFromCells(["S999", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/attacker/fixture.cc?format=TEXT`, "code", "C", "scope", "fixture.cc:2-2", "teaches", "mined", "2026-10-20", "on-release", "—"]);
{
  const ctrl = s6("s6-ctrl", (reg) => reg);                      // S105 entry missing, nothing else
  const ctrlAdd = s6("s6-ctrl-add", (reg) => reg.replace(/\n$/, `\n${s999}\n`)); // add row, keep S105 line
  const attack = s6("s6-attack", (reg) => {
    const line = realRegRow("S105");
    const cells = rowCells(line);
    cells[6] = `${cells[6]} | injected-pipe-in-anchor`;
    const mutated = line.replace(line, regLineFromCells(cells.slice(1, -1)));
    return reg.replace(line, mutated).replace(/\n$/, `\n${s999}\n`);
  });
  results.S6a_control_missing_S105 = { desc: "receipt lacks S105, registry untouched", ...summarize(ctrl) };
  results.S6b_control_extra_row = { desc: "receipt lacks S105, S999 appended (14th population row)", ...summarize(ctrlAdd) };
  results.S6c_population_swap = { desc: "S105 forced out of the population by a '|' in its anchor cell; S999 appended in its place", ...summarize(attack) };
}

// ---------------------------------------------------------------- S7
// 404 vacuity: any body containing NOT_FOUND resolves a 404 row; ranges never checked.
{
  const fx = fixture("s7-404");
  const path = "third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc";
  const body = "NOT_FOUND: Requested entity was not found.\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S094", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "HTTP 404; expected decoded lines 100-200 and sha256 deadbeef", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, body);
  fx.put(`${BYTES}/${NEW}/${path}`, body);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S094", fetched_by: "PinS094", files: [{ path, old_tag: OLD, old_status: 404, new_status: 404, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(body), new_sha256: sha(body), ranges: [[100, 200]] }] }] });
  fx.put(`${REFETCH}/S094.json`, `${JSON.stringify({ id: "S094", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 404, sha256: sha(body) }] })}\n`);
  const head = fx.commit();
  results.S7_404_vacuity = { desc: "404 row: ranges [[100,200]] absent from the anchor and the file has 1 line; still resolved", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S8
// digest substitution across files: the row's sha256 is satisfied by a second file.
{
  const fx = fixture("s8-digest-sub");
  const a = "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc";
  const b = "third_party/blink/renderer/core/html/forms/form_mcp_schema.h";
  const realA = "real-A-1\nreal-A-2\nreal-A-3\n";
  const fakeA = "fabricated-A-1\nfabricated-A-2\nfabricated-A-3\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S093", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${a}?format=TEXT`, "code", "A", "scope", `form_mcp_schema.cc:1-3, form_mcp_schema.h:1-3; decoded .cc SHA-256 ${sha(Buffer.from(realA))}`, "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${a}`, fakeA);
  fx.put(`${BYTES}/${NEW}/${a}`, fakeA);
  fx.put(`${BYTES}/${OLD}/${b}`, realA);
  fx.put(`${BYTES}/${NEW}/${b}`, realA);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S093", fetched_by: "PinS093", files: [
    { path: a, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${a}`, new_bytes: `${BYTES}/${NEW}/${a}`, old_sha256: sha(fakeA), new_sha256: sha(fakeA), ranges: [[1, 3]] },
    { path: b, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${b}`, new_bytes: `${BYTES}/${NEW}/${b}`, old_sha256: sha(realA), new_sha256: sha(realA), ranges: [[1, 3]] },
  ] }] });
  fx.put(`${REFETCH}/S093.json`, `${JSON.stringify({ id: "S093", seat: "RivalSeat", fetched_at: "x", files: [{ path: a, tag: NEW, status: 200, sha256: sha(fakeA) }, { path: b, tag: NEW, status: 200, sha256: sha(realA) }] })}\n`);
  const head = fx.commit();
  results.S8_digest_satisfied_by_other_file = { desc: "row records the real .cc digest; .cc bytes are fabricated and .h bytes are the real .cc content", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S9
// vacuous range at the trailing empty line produced by split("\n").
{
  const fx = fixture("s9-empty-line");
  const path = "content/public/common/content_features.cc";
  const oldText = "one\ntwo\nthree\n";                       // split -> 4 lines, line 4 = ""
  const newText = "one\nREWRITTEN\nthree\nFOURTH CHANGED\n";  // line 4 = ""
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S106", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "decoded line 4", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S106", fetched_by: "PinS106", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[4, 4]] }] }] });
  fx.put(`${REFETCH}/S106.json`, `${JSON.stringify({ id: "S106", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] })}\n`);
  const head = fx.commit();
  results.S9_trailing_empty_line_range = { desc: "range [4,4] is the empty line after the final newline; lines 2 and 4 rewritten", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S10
// entry may omit anchored files entirely: two files in the say, one in the entry.
{
  const fx = fixture("s10-subset");
  const a = "base/command_line.cc";
  const b = "base/feature_list.cc";
  const aOld = "c1\nc2\nc3\n";
  const bOld = "f1\nf2\nf3\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S064", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${a}?format=TEXT`, "code", "A", "scope", "command_line.cc:1-3; feature_list.cc:1-3", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/${a}`, aOld);
  fx.put(`${BYTES}/${NEW}/${a}`, aOld);
  fx.put(`${BYTES}/${OLD}/${b}`, bOld);
  fx.put(`${BYTES}/${NEW}/${b}`, "COMPLETELY DIFFERENT SOURCE\n");
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S064", fetched_by: "PinS064", files: [{ path: a, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${a}`, new_bytes: `${BYTES}/${NEW}/${a}`, old_sha256: sha(aOld), new_sha256: sha(aOld), ranges: [[1, 3]] }] }] });
  fx.put(`${REFETCH}/S064.json`, `${JSON.stringify({ id: "S064", seat: "RivalSeat", fetched_at: "x", files: [{ path: a, tag: NEW, status: 200, sha256: sha(aOld) }] })}\n`);
  const head = fx.commit();
  results.S10_anchored_file_omitted = { desc: "anchor names command_line.cc and feature_list.cc; entry lists only command_line.cc (feature_list.cc 156 bytes differ wholly)", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

// ---------------------------------------------------------------- S11
// path traversal probe (expected blocked) and absolute path probe.
{
  const fx = fixture("s11-traversal");
  const path = "../../../../etc/hostname";
  const body = "x\n";
  fx.put(REG, `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n${regLineFromCells(["S901", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/hostname?format=TEXT`, "code", "C", "scope", "hostname:1-1", "teaches", "mined", "2026-10-20", "on-release", "—"])}\n`);
  fx.put(`${BYTES}/${OLD}/hostname`, body);
  fx.put(`${BYTES}/${NEW}/hostname`, body);
  writeReceipt(fx, { schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S901", fetched_by: "Attacker", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(body), new_sha256: sha(body), ranges: [[1, 1]] }] }] });
  fx.put(`${REFETCH}/S901.json`, `${JSON.stringify({ id: "S901", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(body) }] })}\n`);
  const head = fx.commit();
  results.S11_traversal = { desc: "path with '..' (expected blocked)", ...summarize(run(fx, head)) };
  rmSync(fx.root, { recursive: true, force: true });
}

console.log(JSON.stringify(results, null, 2));
