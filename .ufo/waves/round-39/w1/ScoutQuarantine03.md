# Quarantine hand-check — ScoutQuarantine03

## Extraction
Command: `awk -F'|' '$2 ~ /\x60tabi\x60/ {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
Observed output: 37 `tabi` payload-absent rows (all include S-ids), plus the lane summary and one NEVER-CHECKED row S171. Assigned deterministic row ids S126, S130, S131, S133, S134 all occur in the payload-absent table.

## Fetch and quote checks
Fetched each cited URL with `curl -L --max-time 30 -sS -w '%{http_code} %{url_effective}'`; each returned HTTP 200. Sources were staged only in `/fast/scratch/hyaku/tabi-r39/ScoutQuarantine03` and removed after inspection.

- **S126 — absent (fabrication).** URL https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api . Page title observed: “Rate limits for the REST API - GitHub Docs”. Exact alleged registry snippets `Native messaging`, `Extension side`, and `Native messaging host side` do not occur in the fetched page text; these are unrelated to REST API rate limits. No specific anchor applicable.
- **S130 — absent (fabrication).** URL https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/f08dbe152502d66e75fa07fb2588dc0feb42bc20/tests/tools/webmcp.test.ts . Pinned raw TypeScript test file fetched. Alleged Japanese quote `Chrome 149 では、WebMCP オリジン トライアルに登録できます` does not occur; file is WebMCP test code and contains no such Japanese sentence. No anchor (raw file).
- **S131 — present.** URL https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja . Page title observed: “WebMCP オリジン トライアルに参加する”. Quote `WebMCP のユーザー ジャーニー` occurs in page text (section headed “ユーザー ジャーニー”); the following recommended-tools quote was present in the Japanese page content: `重要なユーザー ジャーニー （CUJ）をサポートするために提供できるツールの推奨事項を示します`. This contradicts the register’s absent label.
- **S133 — absent (fabrication).** URL https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja . Page title observed: “Evals を使用して WebMCP をテストする”. Alleged `Agent security considerations for WebMCP` is not present in fetched Japanese evals page; that title belongs to a different security page, not this cited URL. Anchor not applicable.
- **S134 — absent (fabrication).** URL https://developer.chrome.com/docs/agents/security . Page title observed: “Agent security considerations for WebMCP”. Alleged Traditional Chinese `評估測試和偵錯` does not occur in the English page; no corresponding anchor.

## Commands/output evidence
`curl` status output: `S126 200 https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`; `S130 200 https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/f08dbe152502d66e75fa07fb2588dc0feb42bc20/tests/tools/webmcp.test.ts`; `S131 200 https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja`; `S133 200 https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja`; `S134 200 https://developer.chrome.com/docs/agents/security`.

VERDICT finding — S131 quoted text is present; S126, S130, S133, S134 quoted text absent from successful fetches.
