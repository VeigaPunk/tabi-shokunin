#!/usr/bin/env node
// PinS098 — range verdict for registry row S098 (one file, two tags).
// Mirrors check-release-pins.mjs f4 semantics: each old range's lines
// (trimmed, inner whitespace collapsed) must occur as one contiguous block
// in the new file. Usage: node compare-ranges.mjs <dir-with-bytes>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OLD = "154.0.8037.97";
const NEW = "156.0.8078.47";
const PATH = "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc";
const RANGES = [[491, 928], [583, 583]];

const root = process.argv[2];
const read = (tag) => readFileSync(join(root, "bytes", tag, PATH), "utf8");
const norm = (s) => s.trim().replace(/\s+/g, " ");

const oldLines = read(OLD).split("\n");
const newLines = read(NEW).split("\n");
const newNorm = newLines.map(norm);

const out = { id: "S098", path: PATH, old_tag: OLD, new_tag: NEW, ranges: [] };
for (const [a, b] of RANGES) {
  const block = oldLines.slice(a - 1, b).map(norm);
  let at = null;
  for (let i = 0; i + block.length <= newNorm.length; i += 1) {
    let ok = true;
    for (let j = 0; j < block.length; j += 1) if (newNorm[i + j] !== block[j]) { ok = false; break; }
    if (ok) { at = i + 1; break; }
  }
  out.ranges.push({
    range: [a, b],
    old_line_count: oldLines.length,
    new_line_count: newLines.length,
    block_lines: block.length,
    verdict: at === null ? "drifted" : "holds",
    new_line_start: at,
    new_line_end: at === null ? null : at + block.length - 1,
    old_first_line: oldLines[a - 1],
    old_last_line: oldLines[b - 1],
  });
}
out.file_verdict = out.ranges.every((r) => r.verdict === "holds") ? "holds" : "drifted";
writeFileSync(join(root, "ranges-verdict.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify(out, null, 2));
