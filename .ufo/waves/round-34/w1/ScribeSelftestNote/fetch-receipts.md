# Fetch receipts — ScribeSelftestNote (tabi round 34, w1)

All fetches: `curl -q -sS --proto =https`, Gitiles `?format=TEXT`, base64-decoded locally. Read-only GETs of
public Chromium source; no credentials, cookies or API calls. Bodies retained in this directory.

| # | URL | UTC | HTTP | bytes (raw) | sha256 (raw) | bytes (decoded) | sha256 (decoded) | cross-check |
|---|---|---|---|---|---|---|---|---|
| 1 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT` | 2026-10-26T19:51:13Z | 200 | 26200 | `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4` | 19648 | `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b` | equals S127's recorded raw and decoded digests (`corpus/SOURCES.md`) |
| 2 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT` | 2026-10-26T19:52:04Z | 200 | 90944 | `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e` | 68207 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` | equals S125's recorded decoded digest |

Files: `util.b64`/`util.cc`, `sc.b64`/`session_commands.cc`.

Quoted spans:

- `util.cc:39-43` — `std::string GenerateId() { … return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb); }`
  (two 64-bit halves, lower-case hex, 32 characters).
- `session_commands.cc:287-289` — `if (session->web_socket_url) { caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id); }`.
- `session_commands.cc:369-372` — `if (session->w3c_compliant) { … body.Set("sessionId", session->id); … }`.

No 404s. No other network access. No browser launched.
