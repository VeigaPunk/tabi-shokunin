# ScoutQuarantine143 — quarantine hand-check, staged ID S143

## Row (read-only register, `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 198)
S143 appears in several lanes (kake round1, tabi round3, tameshi round5; kumitate round4 in the unreachable table). This wave is the tabi wave, so I took the tabi row. The kake, tameshi and kumitate S143 rows were not checked.
`| tabi | round3 | S143 | payload-absent | https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts | `Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled` | ... |`
- Staged slice (`assimilation/quarantine-slice` line 21) lists `S143 payload-absent`, consistent with the row. The slice has no lane or URL.
- The register row has no anchor or section, only URL, quote and class.

## Fetch
- URL: https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts
- Access date: 2026-10-27 (HTTP `date: Tue, 27 Oct 2026 19:33:42 GMT`)
- Command: `curl -sSL -m 60 -D hdr.txt -o WebMCP.ts <URL>` → rc=0, `HTTP/2 200`, `content-type: text/plain; charset=utf-8`, etag `24417a1899b63c1a52629736f18f76674c0b6648279c48fe82c40d392cd9efa2`
- Bytes: 10681; sha256 `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5`
- Scratch: `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine143/`, deleted before yield.

## Search
Python check on the full UTF-8 text:
- Exact quote: False. Whitespace-normalized quote: False.
- Substring `Requires Chrome`: False. `151`: False. `enable-features`: False.
- `WebMCP` appears, so this is the right file.
- The only grep hits for `chrome|151|flag|enable|experimental|feature` are line 236 ("The experimental WebMCP class provides an API for the WebMCP API."), line 252 (`@experimental`) and line 372 (`WebMCP.enable` CDP call).
- The file has no Chrome version requirement or feature-flag text at all.

## Classification
**ABSENT / fabrication-candidate confirmed against the actual source.** The cited URL was opened successfully (200, full file) and the quoted passage is not in it, in any section.

## Limitations
- The URL points at `main`, which moves. A different puppeteer revision may have carried this text. I did not check history, other puppeteer files, docs, or the lane's local artifacts or companion URLs. The verdict covers only the cited URL at the access time above.
- The ID matches several lanes; the tabi row was chosen from wave context.
- No tools installed. No edits to shokuknow or the lane corpus. Nothing adopted.

VERDICT finding S143(tabi round3) cited WebMCP.ts opened 200/10681B on 2026-10-27; quote "Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled" absent (class: absent/fabrication-candidate)
