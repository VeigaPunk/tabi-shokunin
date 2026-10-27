# ScoutQuarantine158 — quarantine hand-check, S158

## Staged row (read-only register, line 206)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`

| lane | round | id | class | cited source | quote | note |
|---|---|---|---|---|---|---|
| `tabi` | round4 | S158 | `payload-absent` | https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts | `RateLimit-Policy Field` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |

The register has no anchor column. The row gives only the URL and the quote, so I did not check an anchor.
The grep for `S158` matched exactly this one row.

## Source access
- URL: https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts (`main` branch, a moving ref).
- Access date: 2026-10-27 (UTC).
- Status: the cited source opened successfully. `curl -L` returned HTTP 200 with no redirect, 2451 bytes, 79 lines.
- sha256: `f06ffc3b4fafae2b59ac8700861b6f0cbbd301d012cd24999a37ceb731f8e066`. This is from the second fetch. The first fetch gave the same 2451 bytes.
- The file is a TypeScript source with two tool definitions: `list_webmcp_tools` and `execute_webmcp_tool`.

## Quote search
- `grep -n -i -E 'rate|limit|policy|field' w.ts` returned 0 matches in the full file. The exact quote `RateLimit-Policy Field` is therefore absent, and so are `rate`, `limit`, `policy` and `field` as case-insensitive substrings.
- I read the remaining lines 30-79 in full. They hold only the `execute_webmcp_tool` schema and handler, with no rate-limit content.
- The phrase `RateLimit-Policy` names an HTTP header (IETF RateLimit header fields). It has no topical relation to this WebMCP tool file.

## Classification
**absent / fabrication.** The actual source was fetched in full and the exact quote is not in it.
This is consistent with the register's `payload-absent` class for this row.

## Limitations
- I checked only the single cited URL at the `main` ref as of 2026-10-27. The file could have differed when the row was written, but a rate-limit quote in a 79-line tool-definition file is implausible.
- I did not fetch the register's companion URLs or the lane's local artifacts. The assignment said to open only the cited source, so I rely on the register's note for those.
- The quote appears to come from a different source, so the row's citation looks mis-attributed. I did not search for the true source.
- I read nothing from other seats' summaries. The shokuknow repo and the lane corpus were not edited. No tools were installed (`curl` only). Scratch was deleted.

VERDICT finding S158: absent/fabrication — cited webmcp.ts fetched (HTTP 200, 2451 B), exact quote `RateLimit-Policy Field` absent; no rate/limit/policy/field text at all.
