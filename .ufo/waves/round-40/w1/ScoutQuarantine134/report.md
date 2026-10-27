# ScoutQuarantine134 — quarantine hand-check, staged ID S134

Access date: 2026-10-27 (UTC). Tooling: none installed (RULES.md read; curl/python3 already present). Scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine134/` (removed before yield).

## Row (read-only register, `shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 192)
`| tabi | round2 | S134 | payload-absent | https://developer.chrome.com/docs/agents/security | 評估測試和偵錯 | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
(Register line 365 also contains an "S134`" id, but it is lane `tameshi` round4, an unreachable never-checked row (doi 10.1145/351240.351266). It is a different row, so not classified here. The assigned data row is the `tabi` data row at line 192.)

Staged anchor/quotes (lane gate `shokuknow/lanes/tabi/round2/SOURCES-PROPOSED.md` lines 129-135): §"Agent security considerations for WebMCP"; quote 1 "Malicious manifests : Websites may have tool definitions with hidden instructions, in tool names, parameters, or descriptions, designed to hijack"; quote 2 "For Chrome extensions to use WebMCP, they must have `host_permission` to be allowed to access the page."

## Fetch
`curl -sS -L -m 60 -A 'Mozilla/5.0' -D hdr.txt -o src.html 'https://developer.chrome.com/docs/agents/security'` -> rc=0, HTTP/2 200, content-type text/html, 111899 bytes, `<html lang="en">`, title "Agent security considerations for WebMCP | AI in Chrome | Chrome for Developers". Source successfully opened.

## Observations
- Register quote `評估測試和偵錯`: not present, neither in raw HTML nor in tag-stripped/unescaped text (checked also substrings 評估, 偵錯: absent). Page is the English locale (headings: Build safer agents / Set deterministic guardrails / Set probabilistic guardrails / Use content classifiers and critics / Evaluate your agent's vulnerabilities / Identify attacks in production / Next steps).
- Origin of that quote: `SOURCES-PROPOSED.md` line 137 is the S135 row (WebMCP 最佳做法, zh-TW) with anchor §"評估測試和偵錯". The census (`quote-lint-full-v5.json`) shows the S134 row carrying it with `line` = the S135 table row, i.e. the S135 anchor was attributed to the S134 id (checker `binding: id` spill, same pattern as the S133 record picking up S134's title). So the register's quote belongs to a different source (S135), not to S134's staged claim.
- S134's own staged quotes, whitespace-normalised against the page text:
  - Quote 1 present, exact: located under intro of "Agent security considerations for WebMCP" ("There are two vectors of attack … Malicious manifests : Websites may have tool definitions with hidden instructions, in tool names, parameters, or descriptions, designed to hijack the agent.").
  - Quote 2 present, with the rendered page showing `host_permission` as code (backticks are the markdown of `<code>`): under "Build safer agents": "Note: For Chrome extensions to use WebMCP, they must have host_permission to be allowed to access the page."

## Classification (this row only)
- Register quote `評估測試和偵錯` vs cited S134 URL: **absent** (source fully opened, exact string not present). 
- But not a fabrication of S134 content: the string is S135's anchor mis-bound onto S134; S134's actual staged gate quotes are **present** in the cited source. Net: the `payload-absent` flag is a checker-binding artifact; row S134's staged claim is present/verified.

## Limitations
Single fetch of the default (English) locale on 2026-10-27; page `last-modified` Tue, 09 Jun 2026. Staged accessed date was 2026-10-23. No other-locale or archive fetch. Source repo and lane corpus untouched.

VERDICT finding — tabi S134 register quote 評估測試和偵錯 is absent from the opened source (111899 B, HTTP 200) but belongs to S135's anchor (id mis-binding); S134's actual two staged quotes are present
