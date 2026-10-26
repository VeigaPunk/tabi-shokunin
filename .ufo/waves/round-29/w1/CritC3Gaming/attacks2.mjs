#!/usr/bin/env node
// CritC3Gaming scratch harness, round 2: corrected S3/S5 fixtures + tag-digit range binding.
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";

const S = process.env.S;
const COUNTER = join(S, "lane/scripts/check-release-pins.mjs");
const OLD = "154.0.8037.97";
const NEW = "156.0.8078.47";
const REG = "corpus/SOURCES.md";
const RECEIPT = "corpus/evidence/round-29/release-pins/receipt.json";
const BYTES = "corpus/evidence/round-29/release-pins/bytes";
const REFETCH = "corpus/evidence/round-29/release-pins/refetch";
const sha = (b) => createHash("sha256").update(b).digest("hex");

function fixture(name) {
  const root = mkdtempSync(join(S, `fx2-${name}-`));
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
  return { root, put, commit() { g(["add", "-A"]); g(["commit", "--allow-empty", "-q", "-m", name]); return g(["rev-parse", "HEAD"]).trim(); } };
}
function run(fx, rev) {
  const r = spawnSync("node", [COUNTER, "--repo", fx.root, "--rev", rev, "--stable", NEW, "--json"], { encoding: "utf8" });
  let out = null; try { out = JSON.parse(r.stdout); } catch { out = null; }
  return { exit: r.status, population: out?.population ?? null, unresolved: out?.unresolved ?? null, holds: out?.holds ?? null, drifted: out?.drifted ?? null,
    rows: out?.rows ? out.rows.map((x) => ({ id: x.id, resolved: x.resolved, verdict: x.verdict, reasons: x.reasons })) : null };
}
const header = `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
const row = (cells) => `| ${cells.join(" | ")} |\n`;
const out = {};

// S3 fixed: source names the real file; entry verifies a same-basename file elsewhere;
// line 596 is preserved byte-for-byte while 600 changes (invisible to ranges [[596,596]]).
{
  const fx = fixture("s3");
  const realPath = "content/public/common/content_switches.cc";
  const fakePath = "attacker/elsewhere/content_switches.cc";
  fx.put(REG, header + row(["S062", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${realPath}?format=TEXT`, "code", "A", "scope", "content_switches.cc:596-603; devtools_pipe_handler.cc:135-200", "teaches", "mined", "2026-10-20", "on-release", "—"]));
  const lines = Array.from({ length: 603 }, (_, i) => `f${i + 1}`);
  lines[595] = "int fabricated_line_596;";
  const oldText = lines.join("\n") + "\n";
  const newLines = lines.slice(); newLines[599] = "int drifted_line_600; // real 156 changed here";
  const newText = newLines.join("\n") + "\n";
  fx.put(`${BYTES}/${OLD}/${fakePath}`, oldText);
  fx.put(`${BYTES}/${NEW}/${fakePath}`, newText);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S062", fetched_by: "PinS062", files: [{ path: fakePath, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${fakePath}`, new_bytes: `${BYTES}/${NEW}/${fakePath}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[596, 596], [598, 598]] }] }] }, null, 2));
  fx.put(`${REFETCH}/S062.json`, JSON.stringify({ id: "S062", seat: "RivalSeat", fetched_at: "not-a-timestamp", files: [{ path: fakePath, tag: NEW, status: 200, sha256: sha(newText) }] }));
  out.S3b_basename_substitution = { desc: "entry verifies attacker/elsewhere/content_switches.cc; real content_switches.cc never fetched; line 600 drift outside declared single-line ranges", ...run(fx, fx.commit()) };
  rmSync(fx.root, { recursive: true, force: true });
}

// S5 fixed: vacuous superseder row clears drift; ranges token fixed to 3-3.
{
  const fx = fixture("s5");
  const path = "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc";
  const oldText = "a\nb\nc\n";
  const newText = "a\nREWRITTEN\nc\n";
  fx.put(REG, header + row(["S077", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "form_mcp_schema.cc:3-3", "teaches", "mined", "2026-10-20", "on-release", "—"])
    + row(["S900", `Nothing fetched — https://chromium.googlesource.com/chromium/src/+/refs/tags/${NEW}/this/path/does/not/exist.cc?format=TEXT`, "code", "C", "scope", "no anchor", "supersedes S077 — claimed, never verified, no receipt entry, no bytes", "guess", "2026-10-20", "90d", "—"]));
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S077", fetched_by: "PinS077", superseded_by: "S900", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[3, 3]] }] }] }, null, 2));
  fx.put(`${REFETCH}/S077.json`, JSON.stringify({ id: "S077", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] }));
  out.S5b_vacuous_superseder = { desc: "S900 carries only a stable-tag URL to a nonexistent path, no receipt entry, no bytes; S077 drift resolves", ...run(fx, fx.commit()) };
  rmSync(fx.root, { recursive: true, force: true });
}

// S12: range token taken from the tag's own digits (anchor "tag 154.0.8037.97"; no line range at all).
{
  const fx = fixture("s12");
  const path = "third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc";
  const lines = Array.from({ length: 8037 }, (_, i) => (i === 8036 ? "line 8037 content" : `l${i + 1}`));
  const oldText = lines.join("\n") + "\n";
  fx.put(REG, header + row(["S080", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d", "teaches", "mined", "2026-10-20", "on-release", "—"]));
  const newLines = lines.slice(); newLines[100] = "REWRITTEN"; newLines[5000] = "ALSO REWRITTEN";
  const newText = newLines.join("\n") + "\n";
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S080", fetched_by: "PinS080", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[8037, 8037]] }] }] }, null, 2));
  fx.put(`${REFETCH}/S080.json`, JSON.stringify({ id: "S080", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] }));
  out.S12_tag_digits_bind_range = { desc: "anchor states no line range; ranges [[8037,8037]] passes because '8037' occurs inside the tag 154.0.8037.97", ...run(fx, fx.commit()) };
  rmSync(fx.root, { recursive: true, force: true });
}

// S13: leading-4-space indentation silently removes a row from the population.
{
  const fx = fixture("s13");
  const path = "base/command_line.cc";
  const body = "x\ny\nz\n";
  fx.put(REG, header + `    | ${["S902", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "C", "scope", "command_line.cc:1-1", "teaches", "mined", "2026-10-20", "on-release", "—"].join(" | ")} |\n`);
  fx.put(`${BYTES}/${OLD}/${path}`, body);
  fx.put(`${BYTES}/${NEW}/${path}`, body);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [] }, null, 2));
  out.S13_indent_escape = run(fx, fx.commit());
  rmSync(fx.root, { recursive: true, force: true });
}

console.log(JSON.stringify(out, null, 2));
