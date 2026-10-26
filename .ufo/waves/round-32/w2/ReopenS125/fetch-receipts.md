# ReopenS125 — fetch receipts (UTC, all via `curl -q -sS --proto =https`, exit 0 each)

| # | UTC | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | 2026-10-26T17:07:21Z | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT | 200 | 90944 | `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e` (raw b64); decoded `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`, 90944→68207 B, `wc -l` 1877 |
| 2 | 2026-10-26T17:07:27Z | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/capabilities.cc?format=TEXT | 200 | 72612 | `3833f0e214c421db43d5749163c44de09a3abccfb3af748b8129372438e3eda7` (raw b64); decoded `597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7`, 54458 B, `wc -l` 1475 |
| 3 | 2026-10-26T17:07:2xZ (second, independent) | session_commands.cc `?format=TEXT` again | 200 | 90944 | raw `c5d66f5a…76e`; decoded `7b40e94c…bb5` — byte-identical to #1 |
| 4 | 2026-10-26T17:07:32Z (second, independent) | capabilities.cc `?format=TEXT` again | 200 | 72612 | raw `3833f0e2…eda7`; decoded `597c1a33…7ba7` — byte-identical to #2 |
| 5 | 2026-10-26T17:07:32Z | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON | 200 | 2334 | `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`; commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, tree `e096b0852a79b0810dba5cfaa714c95d74908532` |
| 6 | 2026-10-26T17:08:02Z | …/154.0.8037.97/chrome/test/chromedriver/capabilities.h?format=TEXT | 200 | 7756 | `d77d554e9ef8fec4367c3732228bf235a1c882f5ef638d87f34475c95d4c26b9`; `:205 bool web_socket_url = false;` |
| 7 | 2026-10-26T17:09:34Z | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc (bare URL, as the row's source cell writes it) | 200 | 823015 | `7669ca01f6ee144d9985c3925c3fdc69af1ee7de91f7cddde522d780979f9f57`; `webSocketUrl` occurs 1× |
| 8 | 2026-10-26T17:10:23Z | …/154.0.8037.97/chrome/test/chromedriver/session.h?format=TEXT | 200 | 8672 | `a135fd4da9bf9c21dc63ceea72e431abe920fff05bdeaf336a70b711886fcf6e` (raw); decoded `284a5d5be9ba2d9daf2dcac96a930ec2526dc2e7b0784036ea83c0b42812be4b`; `:112 bool web_socket_url = false;` |
| 9 | 2026-10-26T17:11:19Z | …/refs/tags/156.0.8078.47/chrome/test/chromedriver/session_commands.cc?format=TEXT | 200 | 92700 | `9948d10ea51844dd9d3d9827aba163a4b270a7f21898760108d346b0e5dc6b59` (raw); decoded `1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06`, 69523 B, `wc -l` 1904 |

No browser was started for this seat: `pgrep -fa 'chromedriver|chromium'` returned only PID 1371 `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` (an argv substring match, not a browser process). No tool installs or upgrades were needed.
