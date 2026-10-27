# ScoutQuarantine138 — S138 quarantine hand-check (tabi round2 row)

## Row (read-only register, `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 195)
`| tabi | round2 | S138 | payload-absent | https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md | `Testing WebMCP tools` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

Note: ID S138 also appears at line 177 as a souji round3 row (`https://qiita.com/koseki/items/f1af58f1ec1693f0536a`, quote `## gc.auto (6700)`). This seat is a Tabi seat (round 40), so I classified only the tabi round2 row; the souji row was not fetched or classified.

## Source access
- URL: https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md
- Access date: 2026-10-27 (UTC), two independent curl fetches.
- Status: HTTP/2 200, text/plain, 6443 bytes, sha256 `4db8d356ade0f6da3f00b8b4bd50bccdfeba7c068142c21fafd4b5ee4d45bbdb` (identical on both fetches), etag 62915516…b896f.
- Headings in the fetched document: `# @mcp-b/webmcp-extension`, `## Install`, `## Set up the extension`, `## Start from the template`, `## Security and scope`, `## Test` (line 143).

## Quote search
- Exact `Testing WebMCP tools`: 0 matches (`grep -n`).
- Case-insensitive `testing webmcp`: 0 matches. Case-insensitive `webmcp tools`: 0 matches.
- Closest passage: section `## Test` (line 143), which holds a `pnpm --filter @mcp-b/webmcp-extension test:e2e` command and prose about smoke-building the template and loading it in Playwright Chromium. The heading is "Test", not "Testing WebMCP tools".

## Classification
**absent / fabrication-class for this quote**. The cited source was opened successfully (HTTP 200, full 6443 bytes), and the exact quote does not appear in it. This confirms the register's `payload-absent` class for the cited URL.

## Limitations
- Checked only the main-branch README as served on the access date; I did not check other branches or commits, so the quote could have existed in an earlier revision. The register's "companion URLs and local artifacts" were not re-checked, as assigned.
- Earlier seat summaries were not used as evidence.
- No tools installed. Scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine138/` was removed on exit. Nothing in `/home/vgpnk/Projects/shokuknow` was written.
- The task text gave two report paths (`.../ScoutQuarantine138/report.md` and `.../ScoutQuarantine138.md`); I wrote only the `report.md` one.

VERDICT ok S138 tabi/round2 payload-absent confirmed: source opened (200, 6443 B), exact quote `Testing WebMCP tools` absent
