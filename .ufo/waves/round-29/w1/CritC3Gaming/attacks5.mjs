#!/usr/bin/env node
// CritC3Gaming scratch harness, round 5: the same recorded digest is enforced or ignored
// depending on whether the anchor writes "sha256 <hex>" or "sha256<hex>".
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

function build(name, anchor) {
  const root = mkdtempSync(join(S, `fx5-${name}-`));
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
  const path = "third_party/blink/renderer/platform/runtime_enabled_features.json5";
  const real = "REAL-154-BYTES-1\nREAL-154-BYTES-2\nREAL-154-BYTES-3\n";
  const fake = "FABRICATED-1\nFABRICATED-2\nFABRICATED-3\n";
  const header = `# SOURCES\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  put(REG, header + `| ${["S074", `Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${OLD}/${path}?format=TEXT`, "code", "A", "scope", anchor, "teaches", "mined", "2026-10-20", "on-release", "—"].join(" | ")} |\n`);
  put(`${BYTES}/${OLD}/${path}`, fake);   // committed "154" bytes are not the content the digest names
  put(`${BYTES}/${NEW}/${path}`, fake);
  put(RECEIPT, JSON.stringify({ schema: "tabi-release-pins-v1", stable: NEW, rows: [{ id: "S074", fetched_by: "PinS074", files: [{ path, old_tag: OLD, old_status: 200, new_status: 200, old_bytes: `${BYTES}/${OLD}/${path}`, new_bytes: `${BYTES}/${NEW}/${path}`, old_sha256: sha(fake), new_sha256: sha(fake), ranges: [[2, 2]] }] }] }, null, 2));
  put(`${REFETCH}/S074.json`, JSON.stringify({ id: "S074", seat: "RivalSeat", fetched_at: "x", files: [{ path, tag: NEW, status: 200, sha256: sha(fake) }] }));
  g(["add", "-A"]); g(["commit", "--allow-empty", "-q", "-m", name]);
  const rev = g(["rev-parse", "HEAD"]).trim();
  const r = spawnSync("node", [COUNTER, "--repo", root, "--rev", rev, "--stable", NEW, "--json"], { encoding: "utf8" });
  let o = null; try { o = JSON.parse(r.stdout); } catch { o = null; }
  rmSync(root, { recursive: true, force: true });
  return { exit: r.status, population: o?.population ?? null, unresolved: o?.unresolved ?? null, rows: o?.rows?.map((x) => ({ id: x.id, resolved: x.resolved, verdict: x.verdict, reasons: x.reasons })) ?? null, digestNamed: sha(real) };
}

const D = sha("REAL-154-BYTES-1\nREAL-154-BYTES-2\nREAL-154-BYTES-3\n");
const out = {
  control_space_separated: build("space", `tag 154.0.8037.97, WebMCP block7023-7050, status7035, decoded sha256 ${D}`),
  concatenated_like_S074: build("concat", `tag154.0.8037.97, WebMCP block7023-7050, status7035, decoded sha256${D}`),
};
console.log(JSON.stringify(out, null, 2));
