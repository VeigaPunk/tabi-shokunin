# ScoutQuarantine06 — quarantine hand-check

Required setup reads: `claims.json`; attempted both frozen counter paths (the first request incorrectly used `.ufo/waves/round-39/counters.json`, which does not exist); then verified frozen files at the correct per-counter paths in freeze commit `9c09ebb1e2ff594c70ce72093b5d4133c1734dca` and round-38 `c1-routed-defects.mjs` in baseline `5bc56a81d196caeb8d24551928b883802697aabb`. Claims identify C1 coverage capability and C2 calibration instrument repair. No tools installed.

## Slice derivation

Command:
```sh
awk -F'|' '$2 ~ /tabi/ && $0 ~ /S[0-9]+/ {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
```
Output contained 37 `tabi` rows, all with S-ids. The 8-row lane slice (round3+round4, extracted in register order) is S149, S153, S154, S158, S163, S164, S165, S166; assigned partition rows 6–8 are **S158, S163, S164** (not the nominal five-id list). S149/S153/S154 were also checked rather than silently skipped. S164/S165/S166 are remaining actual rows and are outside the assigned three-row partition; no source fetch/classification claimed for them.

## Observations

Fetched cited URLs via `curl -L --max-time 30 -sS` into scratch and searched exact quoted strings with `grep -Fq`; scratch was removed by EXIT trap. The command reported source sizes and presence/absence:

- S149, `https://en.wikipedia.org/robots.txt`: 28,275 bytes; `The daemon` absent; `/status JSON fields` absent. **Absent (fabrication)** for both alleged quote fragments in this fetched source. The source is robots.txt, not evidence of a daemon status schema.
- S153, `https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md`: 22,859 bytes; exact Chinese quoted fragments `使用 document.modelContext.getTools()` and `从 Chrome 153 开始` absent. **Absent (fabrication)** in fetched source.
- S154, `https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn`: 180,609 bytes; `WebMCPNotSupportedError` absent, but `从 Chrome 153 开始` present. The cited alleged quote is **absent (fabrication)** while that related Chrome-version phrase is present; presence of a related phrase does not establish the missing API symbol.
- S158 (assigned), `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts`: 2,451 bytes; `RateLimit-Policy Field` absent. **Absent (fabrication)**. No URL fragment/anchor was supplied in the register.
- S163 (assigned), `https://agent-browser.dev/webmcp`: 267,368 bytes; `WebMCP 与 MCP 的区别` present in the fetched markup; `实时会话数据` absent. **Absent (fabrication)** for the alleged exact anchor/text fragments, with the caveat that the first substring is present as a heading in markup. The claimed line-189/zh-CN locator was not independently confirmed; returned source was the page markup without an established locale-specific view. **Unverifiable-family** for the broader paraphrase (“A WebMCP tool exists only while the page is open and reaches the live tab's session data…”): the cited note is truncated and an exact quote cannot be evaluated from it.

## Reproducible source-fetch/search commands

```sh
S=/fast/scratch/hyaku/tabi-r39/ScoutQuarantine06
mkdir -p "$S"
curl -L --max-time 30 -sS 'https://en.wikipedia.org/robots.txt' -o "$S/S149.txt"
curl -L --max-time 30 -sS 'https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md' -o "$S/S153.md"
curl -L --max-time 30 -sS 'https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn' -o "$S/S154.html"
curl -L --max-time 30 -sS 'https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts' -o "$S/S158.ts"
curl -L --max-time 30 -sS 'https://agent-browser.dev/webmcp' -o "$S/S163.html"
```
Observed source sizes/quote checks are recorded above; the original execution checked each of the eight listed strings against every fetched file, with all non-listed pairings absent. Temporary downloads removed at command exit. No campaign, lane registry, or knowledge-entry files were edited. Evidence path: `.ufo/waves/round-39/w1/ScoutQuarantine06/report.md`.

VERDICT finding — assigned S158/S163 evidence contains absent alleged strings (and S163 has a truncated broader paraphrase); S164/165/166 are outside the actual assigned partition and not evaluated.