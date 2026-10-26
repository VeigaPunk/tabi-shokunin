# Live fetch receipts — RevQuoteRegrounding (tabi round 30, wave w2)

All fetches: read-only HTTPS GET of public Chromium source via Gitiles `?format=TEXT` (base64), no logins/cookies/credentials/API calls.
Fetch window: 2026-10-26T07:38:31Z – 2026-10-26T07:38:33Z (both fetch calls ran inside this window; per-fetch HTTP status and byte counts below from curl `-w`).

| # | url | utc (window) | http | body bytes (base64) | decoded bytes | decoded sha256 |
|---|-----|--------------|------|---------------------|---------------|----------------|
| 1 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26T07:38:31–33Z | 200 | 68940 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| 2 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26T07:38:31–33Z | 200 | 92716 | 69536 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |
| 3 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26T07:38:31–33Z | 200 | 68940 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (identical to #1) |
| 4 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26T07:38:31–33Z | 200 | 91040 | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |

Committed bytes cross-check (`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/`):
- `form_mcp_schema.cc` sha256 `904b75e7…152f` == live #1 ✓
- `html_form_element.cc` sha256 `2a96a97b…6102` == live #2 ✓

Rows' recorded digests (corpus/SOURCES.md): S110 `904b75e7…152f` ✓; S114/S115 `2a96a97b…6102` ✓; S096/S100 (154 blob) `8c8d6796…916` ✓.

Receipt files in this directory: the four base64 HTTP bodies (`*.b64`), the four decoded files, `verify_quotes.py` (the checker) and `verify_quotes.out` (its full output).
