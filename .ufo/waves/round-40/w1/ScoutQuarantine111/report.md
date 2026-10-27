# ScoutQuarantine111 — quarantine hand-check of staged ID S111

## Row identification
Staged-ID list in `gen-w1-spec.py` (S110,S111,S114,S117,S118,...) matches the `tabi` lane round1 rows. The register has three S111 rows (chousa/round4, revenger/round4, tabi/round1); this seat is the Tabi-lane one (line 182):

`| tabi | round1 | S111 | payload-absent | https://developer.chrome.com/docs/ai/webmcp/secure-tools | "Add hints to your tools"<br>"默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。" | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

Register: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md (read-only; no anchor column exists, row key is lane/round/id).

## Fetch (access date 2026-10-27T19:33:34Z, curl -L, UA Mozilla/5.0, scratch only)
- `https://developer.chrome.com/docs/ai/webmcp/secure-tools` → HTTP 200, 140264 bytes, no redirect (English page; sha256 prefix a2e9ca32…). `/zh/docs/...` path redirects to the same English bytes.
- `https://developer.chrome.com/docs/ai/webmcp/secure-tools?hl=zh-cn` → HTTP 200, 131145 bytes (zh-CN localization; sha256 prefix c80917e3…).

## Findings (tags stripped, entities unescaped, whitespace collapsed)
- Quote 1 `Add hints to your tools`: ABSENT in both English and zh-CN pages (0 matches raw and text). English H2 headings are: "Use annotation hints", "Expose your tools carefully", "Set character budgets", "Next steps". Nearest content: "There are a few hints you should add when building your tools" under "Use annotation hints". The zh-CN heading is "使用注释提示".
- Quote 2 `默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。`: ABSENT from the staged URL as served (English). PRESENT verbatim (1 match) in the `?hl=zh-cn` localization, section "谨慎公开您的工具" (= English "Expose your tools carefully"). English counterpart, same section: "The WebMCP document.modelContext.registerTool API only exposes the tool's functionality…" (the English page has no "other sites or cross-origin" phrase; it did not match).

## Classification (this row only)
**partial** — source opened successfully (not unreachable). Quote 2 is present, but only in the zh-CN localized variant of the cited URL (section "谨慎公开您的工具"), not at the staged URL as fetched. Quote 1 is absent in both locales (exact wording "Add hints to your tools" does not occur; heading is "Use annotation hints"). Register's "quote is in none of them" is therefore half wrong (quote 2 exists in a locale variant) and half confirmed (quote 1 is a genuine mismatch/likely paraphrase-fabricated heading). Row should be corrected (quote 1 → "Use annotation hints"; cite the `?hl=zh-cn` URL for quote 2) rather than refused wholesale. Not classed as whole-row fabrication because one quote is verifiably present.

Located quote (<=25 words, zh-CN `?hl=zh-cn`, section 谨慎公开您的工具): 默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。

## Limitations
- Page served as static HTML by curl; no JS rendering. Live Chrome docs may change; a prior version at staging time was not checked (no archive lookup). Registry's recorded fetch of the staged URL may have been served a different locale/version.
- Companion URLs and lane local artifacts of the original row were not rechecked (scope: cited source only).
- No tools installed (RULES.md read; none needed). No edits to shokuknow or corpus. Scratch removed at exit.

VERDICT finding S111(tabi/round1) partial: quote2 present only at ?hl=zh-cn locale of cited page, quote1 "Add hints to your tools" absent in en+zh-CN (heading is "Use annotation hints")
