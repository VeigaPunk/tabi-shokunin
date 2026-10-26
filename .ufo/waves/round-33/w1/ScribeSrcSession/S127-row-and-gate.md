# S127 — ChromeDriver 154 session-id generator (draft for L1)

DRAFT — a seat never edits lane files. Paste the registry row into `corpus/SOURCES.md`
§Registry directly after S126 (`corpus/SOURCES.md:140`) and the Gate row into
`corpus/lessons/round-33.md` §Gate. The `used-by` note
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` MUST exist and MUST contain the token
`S127` before the structure gate is clean: with the note absent,
`node scripts/check-sources.mjs` reports
`FINDING id=used_by_missing fleet=E11 row=S127 detail=path_missing`, exit 1
(`check-sources-without-stub.txt`); with a note present it reports
`SOURCES_GATE verdict=clean rows=127 … findings=0`, exit 0 (`check-sources-with-stub.txt`).

## Registry row (11 cells; no `|` inside any cell)

| S127 | ChromeDriver 154 session-id generator — util.cc — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc | code | A | The 154 tag's classic session-id minting, its exact textual shape and the two places that id is surfaced; not id uniqueness, not the BiDi mapper's own sessionId, not a support promise | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, tree e096b0852a79b0810dba5cfaa714c95d74908532); util.cc:39-43, call site commands.cc:96-97, surfaces session_commands.cc:288-289 and 372; decoded blob sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b` from a 26200 B `?format=TEXT` fetch whose raw sha256 is `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4` | ChromeDriver 154 mints a session id as two `base::RandUint64()` values printed with `%016PRIx64%016PRIx64`, so the id is exactly 32 lowercase hex characters, zero-padded, and is echoed verbatim as the W3C `sessionId` and inside the BiDi `webSocketUrl` path, making a receipt's session id shape-checkable instead of an opaque string | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md |

`recheck` is `90d`, not `on-release`: `scripts/check-release-pins.mjs:178` takes every row
whose `recheck` is `on-release` and whose source carries a Chromium Gitiles tag pin into its
population, and S127 would enter it with no release-pin receipt entry (round-32 lesson M10,
`corpus/lessons/round-32.md:175-176`).

## Gate row (for `corpus/lessons/round-33.md` §Gate)

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S127 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc | 2026-10-26T18:24:21Z (ScribeSrcSession; `?format=TEXT` HTTP 200, 26,200 B, raw sha256 `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4`, decoded 19,648 B, sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b`; the human page URL itself 267,504 B at 18:24:22Z) | `util.cc:42`, inside `GenerateId()` at 39-43: `return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);` (8 tokens); call site `commands.cc:96`: `std::string new_id = GenerateId();` |

Gate prose to accompany the row: identified 1, included 1. Stop rule: the minting site is
`GenerateId()` at `chrome/test/chromedriver/util.cc:39-43` and its only call sites for a new
session are `commands.cc:96-97`; the id is consumed at `session_commands.cc:288-289`
(`webSocketUrl`) and `372` (`sessionId`). No further search run.

## What the row grounds, and what it does not

Grounded by the fetched bytes at tag `154.0.8037.97`:

- `util.cc:39-43` — `GenerateId()` = two `base::RandUint64()` values formatted with
  `%016` + `PRIx64`, twice, in that order.
- `%016` occurs twice and `PRIx64` twice in `util.cc`, `PRIX64` zero times (case-checked with
  `grep -o`, `receipts/excerpts.txt`). `PRIx64` is the lowercase-hex conversion, so the
  textual result is 16 + 16 = 32 characters, zero-padded, `[0-9a-f]`.
- `util.h:22` declares `std::string GenerateId();`.
- `commands.cc:91-97` — `ExecuteCreateSession` calls `GenerateId()` and constructs
  `Session(new_id, host)`.
- `session_commands.cc:287-290` — `webSocketUrl` = `"ws://" + host + "/session/" + session->id`.
- `session_commands.cc:370-373` — W3C body field `"sessionId" = session->id`.

Not grounded, and deliberately outside the row's scope:

- No session id was observed. The round-32/33 receipts the gate inspects are offline
  documents; no browser was launched and no `/session` response was read in this seat.
  The 32-lowercase-hex shape is a reading of the format string, not a captured id.
- Uniqueness or unpredictability of `base::RandUint64()` is not claimed.
- The BiDi mapper's own `sessionId` is not minted here: `session_commands.cc:452-457` sends
  `session.new` to the mapper with `"id"` = 1 and returns the mapper's response unchanged;
  the string `GenerateId` does not appear on that path.
- Browsing-context ids (checked because it was cheap, not part of the row's anchor):
  ChromeDriver's WebView id is the DevTools target id — `devtools_http_client.cc:46-52`
  parses the `/json/list` payload through `ParseWebViewsInfo`, `web_view_info.cc:95-109`
  takes each entry's `id` with `targetId` as fallback, and `web_view_impl.cc:685-687`
  returns it from `GetId()`. The mapper target is created as a hidden target and its id
  stored at `session_commands.cc:408-418`. Neither `session_commands.cc` nor `commands.cc`
  contains the string `browsingContext` (0 matches each), so a BiDi `browsingContext` id is
  not produced by this C++; what the mapper assigns is not grounded here.
