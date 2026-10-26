# CritEntry — read-only fetch receipts (round 34 w2)

All GETs: `curl -q -sS --proto '=https' "<url>?format=TEXT" -o <file>`. Gitiles returns base64; decoded bytes
hashed. Tag pin `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), identical to S125/S127/S130-S132.

| # | path (under `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/`) | UTC | HTTP | raw B / sha256 | decoded B / sha256 |
|---|---|---|---|---|---|
| F1 | `base/token.cc` | 2026-10-26T20:13:40Z | 200 | 2992 / `36deab71f228db91f847d23f5c8b87aab50ed6b8bd0ed87e1989cd3090d9b889` | 2243 / `6ef1fc2bddf044f5ae49fc827d46917d5d4edfdbc46d37ac2bf4b9289112628f` |
| F2 | `content/browser/renderer_host/render_frame_devtools_agent_host.cc` (first try — wrong path) | 2026-10-26T20:13:41Z | 503 | 1459 B Google error body (base64 decode fails, same shape the scouts hit) | — |
| F3 | `third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts` | 2026-10-26T20:13:45Z | 200 | 20140 / `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599` | 15104 / `cd435aa8cbbd0a1e908e48c3190be7120aa76cf918cb81d814d55d1ad5cce9d9` |
| F4 | `chrome/test/chromedriver/commands.cc` | 2026-10-26T20:13:48Z | 200 | 20924 / `4bc5d8dccea1bbbe6188d3903e443b2cc22aa789fc8d4bccbb952dc403d64f22` | 15692 / `d546e257994f46e4c818d5ada40f7223bd88546ed9c5a62706d71098b03c50f7` |
| F5 | `chrome/test/chromedriver/session_commands.cc` | 2026-10-26T20:13:53Z | 200 | 90944 / `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e` | 68207 / `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` |
| F6 | `content/browser/devtools/render_frame_devtools_agent_host.cc` (retry, correct path) | 2026-10-26T20:14:21Z | 200 | 61064 / `2a1945ee5329ba6611916746e223844ecdcc847858815064e4a07dc58f4d5699` | 45797 / `4e2f2ec2ee2ba845091d95556e25a0eb0e2fa8e50203511cc1fb68fa5d29b26b` |
| F7 | same wrong path as F2 (retry next day-time) | 2026-10-26T20:14:25Z | 404 | 233 / `72ac7bbd4698d766522acdfc6856a3a87135e0c122d0db4eebf4758e28987877`; body text: `NOT_FOUND: Requested entity was not found` (`[type.googleapis.com/google.rpc.LocalizedMessage] locale: "en-US" message: "Object is not found"`) | — |

Cross-check: F1/F3/F4/F5 raw digests are byte-identical to the digests already recorded for S130
(`36deab71…9b889`), S131 (`f3483993…c33599`), S132 (`4bc5d8dc…d64f22`) and S125 (`c5d66f5a…9074876e`); F6's decoded
bytes agree with the line-339 fact the entry cites. Nothing was fetched to satisfy a licence or a login; no token,
cookie or session material was used.
