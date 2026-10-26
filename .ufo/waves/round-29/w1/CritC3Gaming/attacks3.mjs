#!/usr/bin/env node
// CritC3Gaming scratch harness, round 3: S3c (basename substitution, single line) and S5c (drift cleared by vacuous superseder).
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
  const root = mkdtempSync(join(S, `fx3-${name}-`));
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
    rows: out?.rows ? out.rows.map((x) => ({ id: x.id, resolved: x.resolved, verdict: x.verdict, reasons: x.reasons })) : null, stderr: r.stderr.trim() };
}
const header = `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
const row = (cells) => `| ${cells.join(" | ")} |\n`;
const out = {};

{
  const fx = fixture("s3c");
  const realPath = "content/public/common/content_switches.cc";
  const fakePath = "attacker/elsewhere/content_switches.cc";
  fx.put(REG, header + row(["S062", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${realPath}?format=TEXT`, "code", "A", "scope", "content_switches.cc:596-603; devtools_pipe_handler.cc:135-200", "teaches", "mined", "2026-10-20", "on-release", "—"]));
  const lines = Array.from({ length: 603 }, (_, i) => `f${i + 1}`);
  lines[595] = "int fabricated_line_596;";
  const oldText = lines.join("\n") + "\n";
  const nl = lines.slice(); nl[599] = "int drifted_line_600; // the real 156 change";
  const newText = nl.join("\n") + "\n";
  fx.put(`${BYTES}/${OLD}/${fakePath}`, oldText);
  fx.put(`${BYTES}/${NEW}/${fakePath}`, newText);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S062", fetched_by: "PinS062", files: [{ path: fakePath, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${fakePath}`, new_bytes: `${BYTES}/${NEW}/${fakePath}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[596, 596]] }] }] }, null, 2));
  fx.put(`${REFETCH}/S062.json`, JSON.stringify({ id: "S062", seat: "RivalSeat", fetched_at: "not-a-timestamp", files: [{ path: fakePath, tag: NEW, status: 200, sha256: sha(newText) }] }));
  out.S3c_basename_substitution = { desc: "entry verifies attacker/elsewhere/content_switches.cc only; ranges [[596,596]] though anchor states 596-603; line 600 changed", ...run(fx, fx.commit()) };
  rmSync(fx.root, { recursive: true, force: true });
}
{
  const fx = fixture("s5c");
  const path = "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc";
  const oldText = "a\nb\nc\n";
  const newText = "a\nREWRITTEN\nc\n";
  fx.put(REG, header + row(["S077", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", "form_mcp_schema.cc:2-2", "teaches", "mined", "2026-10-20", "on-release", "—"])
    + row(["S900", `Nothing fetched — https://chromium.googlesource.com/chromium/src/+/refs/tags/${NEW}/this/path/does/not/exist.cc?format=TEXT`, "code", "C", "scope", "no anchor", "supersedes S077 — claimed, never verified, no receipt entry, no bytes", "guess", "2026-10-20", "90d", "—"]));
  fx.put(`${BYTES}/${OLD}/${path}`, oldText);
  fx.put(`${BYTES}/${NEW}/${path}`, newText);
  fx.put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S077", fetched_by: "PinS077", superseded_by: "S900", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(oldText), new_sha256: sha(newText), ranges: [[2, 2]] }] }] }, null, 2));
  fx.put(`${REFETCH}/S077.json`, JSON.stringify({ id: "S077", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(newText) }] }));
  out.S5c_vacuous_superseder = { desc: "S077's anchored line 2 changed (drifted); S900 never fetched anything", ...run(fx, fx.commit()) };
  rmSync(fx.root, { recursive: true, force: true });
}
console.log(JSON.stringify(out, null, 2));
