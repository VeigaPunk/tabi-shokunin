# ScoutQuarantine133 — quarantine hand-check, staged ID S133 (tabi round2 row)

## Row (register /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md line 191)
`| tabi | round2 | S133 | payload-absent | https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja | "Agent security considerations for WebMCP" | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

Note: the ID S133 also appears at register line 176 as `souji | round3 | S133` (local artifact lanes/souji/round3/evidence/r24-renameat2-probe.out, not a public source). This seat (tabi wave, public-source fetch) evaluated only the tabi row; the souji row was NOT evaluated.

## Fetch
- URL: https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja ; accessed 2026-10-27 (curl -L, UA Mozilla/5.0); HTTP/2 200, no redirect, last-modified Tue, 19 May 2026; 162162 bytes (sha256 printed in scratch, deleted).
- Companion check: same page without `?hl=ja` (English) HTTP 200, 162815 bytes; also 0 hits for the quote.

## Passage search
- Exact quote "Agent security considerations for WebMCP": 0 matches in raw HTML (grep -c) and in tag-stripped text (10351 chars); case-insensitive "Agent security"/"security consider"/"Agent": 0 matches; same in English variant.
- Page headings (h1-h3, observed): 障害モード; テストツールを単独でテストする (通話の精度を測定する, アプリケーションの状態, 電話を受ける時間, 決定論的テストを実行する, 確率的テストを実行する); エンドツーエンドのテスト (チェーン内の障害を評価する); WebMCP を試す. No security section.
- Only security-related text is site/side navigation: "WebMCP ツールのセキュリティ" (link to a sibling page) and generic "プライバシーとセキュリティ". Not the quoted heading and not a section of the evals page.

## Classification
**absent** — the actual cited source was successfully opened (200, full body), and the exact quoted string is not present on the page (nor its Japanese equivalent as a section). The quote appears to belong to a different page (the sibling WebMCP tool-security page linked in nav) — [INFERENCE], that page not fetched (out of assigned scope). Register's `payload-absent` status is consistent with observation.

## Limitations
- Static HTML fetch only (no JS rendering); the page content is server-rendered (headings present), so a JS-only section is unlikely but not excluded.
- Only the assigned URL and its English variant fetched; no companion pages.
- No tools installed; no writes outside scratch and this report; source repo untouched.

VERDICT ok S133 (tabi round2) classified absent: source opened (200, 162162 bytes), exact quote not present
