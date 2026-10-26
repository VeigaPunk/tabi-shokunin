import { readFileSync } from "node:fs";
const ENTRY = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S045/entry.json";
const ROW = "| S045 | Chromium 154 web tests for WebMCP invocation (WPT imperative suite plus inspector-protocol harness) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html | code | A | Invocation, abort and error semantics upstream asserts at tag 154.0.8037.97, build-scoped | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51, WebMCP.pdl:68 | Upstream asserts caller abort rejects with the caller's reason and fires toolcancel, unregistering mid-execution still resolves, and CDP invokeTool returns an invocationId that toolResponded echoes | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |";
const cells = ROW.split("|").map((c) => c.trim());
if (cells.length !== 13) throw new Error(`cells=${cells.length}`);
const source = cells[2], anchor = cells[6];
const entry = JSON.parse(readFileSync(ENTRY, "utf8"));
const normDash = (s) => s.replace(/[\u2010-\u2015\u2212]/g, "-");
const hasRange = (a, b) => new RegExp(`(?<![0-9])${(a === b ? String(a) : `${a}-${b}`).replace("-", "\\s*-\\s*")}(?![0-9])`).test(normDash(anchor));
const P = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S045/bytes";
const base = (p) => p.split("/").pop();
const res = [];
for (const f of entry.files) {
  const oldLines = readFileSync(`${P}/${f.old_tag}/${f.path}`, "utf8").split("\n").length;
  const checks = {
    path: f.path,
    f1_old_tag_in_source: source.includes(`refs/tags/${f.old_tag}/`) || anchor.includes(f.old_tag),
    f2_source_has_tag_path: source.includes(`refs/tags/${f.old_tag}/${f.path}`),
    f2_anchor_has_basename: anchor.includes(base(f.path)),
    old_line_count: oldLines,
    f4_tokens: f.ranges.map(([a, b]) => ({ range: [a, b], token_in_anchor: hasRange(a, b), within_lines: a >= 1 && b >= a && b <= oldLines })),
  };
  res.push(checks);
}
console.log(JSON.stringify(res, null, 2));
