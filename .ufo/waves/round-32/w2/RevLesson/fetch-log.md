# RevLesson fetch log (w2 falsify, 2026-10-26) — read-only HTTPS GETs, `curl -q -sS --proto =https`

| # | URL | UTC time | HTTP status | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T17:22:51Z | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| 2 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT | 2026-10-26T17:25:08Z | 200 | 90944 (base64; decoded 68207) | decoded: `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` |
| 3 | https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | 2026-10-26T17:25:08Z | 200 | 4235856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |
| 4 | https://www.w3.org/TR/webdriver2/ | 2026-10-26T17:25:08Z | 200 | 1882653 | `929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e` |

All four digests are byte-identical to the digests recorded in the round-32 lesson's `## Gate` table
(S123: `f633915d…`; S125 decoded: `7b40e94…`; S124: `dc1077db…`; S126: `929f2f0…`).

Quote-location checks on the fetched bytes:
- S123: line 6 `Request for Comments: 9309`; line 11 `September 2022`; `June 2022` only at lines 554 and 559 (RFC 9110/9111 reference entries).
- S124: Abstract sentence "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents." — 1 exact match; §4.1 sentence "WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true." — present at HTML line 2216 (wrapped across lines in the pretty-printed HTML); revision `f922e6af669ead51496db85f37813f39438ef171` present.
- S125: lines 287-289 = `if (session->web_socket_url) {` / `caps.Set("webSocketUrl",` / `"ws://" + session->host + "/session/" + session->id);`.
- S126: lines 11306-11307 = `"<code>ignore</code>"` / "All simple dialogs encountered should be left to the user to handle."; lines 1976-1980 = `unhandledPromptBehavior` … `Defaults to "<code>dismiss and notify</code>"`; case-insensitive `websocket` occurrences = 0 (grep exit 1).

No logins, cookies, credentials, API calls or session material; no external site navigated by any browser.
