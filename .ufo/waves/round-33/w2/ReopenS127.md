# ReopenS127 — independent re-open of SOURCES row S127 (C2 ground), round 33 w2

**Verdict: holds.** I re-fetched every byte S127 cites, at the pinned tag `154.0.8037.97`, and reproduced both recorded digests exactly: the 26,200 B `?format=TEXT` blob has raw sha256 `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4` and decodes to 19,648 B, sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b`, identical to the anchor cell and to the original receipt fetched at 18:24:21Z (byte-stable across two independent GETs ~27 min apart). The located quote, the call site, the two surfacing lines, the tag→commit/tree identity, all 11 row cells, the lesson Gate line, and the ground chain into gate v2's session-provenance rule all verify against the decoded bytes. No defect found; no severity to assign.

## What was attacked

SOURCES.md:141 row S127 at integration revision `042d6d9abf97d567d495652a85eabc851b81adc1` (read via `git -C <lane> show 042d6d9…:corpus/SOURCES.md`, lane untouched), its receipt at `corpus/lessons/round-33.md:35`, its Gate entry at `corpus/lessons/round-33.md:46-49`, and its use as C2's session-provenance ground (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:1`, lesson `:90-91`, gate v2 source).

## Evidence

### Fetches (all `curl -q -sS --proto =https`; full log + bytes in the output dir)

| # | UTC | URL (tag 154.0.8037.97) | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | 18:49:47Z | chromedriver.googlesource.com …/util.cc?format=TEXT | 404 | 135 | — (my wrong-host probe; row cites chromium.googlesource.com) |
| 2 | 18:50:01Z | chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT | 200 | 26,200 raw / 19,648 decoded | raw `e3e0d00f…e00d4` ✓ row; decoded `3ed654c7…be37b` ✓ row |
| 3 | 18:51:02Z | …/chrome/test/chromedriver/commands.cc?format=TEXT | 200 | 20,924 / 15,692 | decoded `d546e257…c50f7` |
| 4 | 18:51:02Z | …/chrome/test/chromedriver/session_commands.cc?format=TEXT | 503 | 1,459 | transient; retried |
| 5 | 18:51:53Z | …/session_commands.cc?format=TEXT (retry) | 200 | 90,944 / 68,207 | decoded `7b40e94c…abb5` — also equals S125's independently recorded blob sha256 (corroboration) |
| 6 | 18:51:53Z | chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON | 200 | 1,047 | commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, tree `e096b0852a79b0810dba5cfaa714c95d74908532` |

Commands: `curl … -o util.cc.b64; base64 -d util.cc.b64 > util.cc; sha256sum …` — all exit 0 (the 503 retry loop and the base64 of the 404 body exit 1 as logged, both expected/no bearing).

### Decoded-byte checks (file:line in my decoded copies)

- **util.cc:39-43** — exactly as anchored:
  - 39: `std::string GenerateId() {`
  - 40: `  uint64_t msb = base::RandUint64();`
  - 41: `  uint64_t lsb = base::RandUint64();`
  - 42: `  return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);`
  - 43: `}`
  Receipt quote (round-33.md:35) quotes line 42 verbatim ✓. `%016` + `PRIx64` (lowercase, no `#` flag) ⇒ exactly 32 zero-padded lowercase hex chars — the teaches cell's "exactly 32 lowercase hex" and Gate line 46-48 are faithful readings of the format string.
- **commands.cc:96-97** (call site ✓) — inside `ExecuteCreateSession`:
  - 96: `  std::string new_id = GenerateId();` (receipt's `commands.cc:96` verbatim ✓)
  - 97: `  std::unique_ptr<Session> session = std::make_unique<Session>(new_id, host);`
- **session_commands.cc:288-289 and :372** (the two surfaces ✓):
  - 287-290: `if (session->web_socket_url) { caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id); }` — the `Set` spans exactly 288-289.
  - 372: `    body.Set("sessionId", session->id);` — verbatim echo as the classic W3C `sessionId`.
- **Tag identity** — ref JSON: commit/tree match the anchor cell (and S125's same pin).

### Row cells (SOURCES.md:141, 11 cells against header `id|source|kind|tier|scope|anchor|teaches|status|opened|recheck|used-by`)

All 11 populated and consistent: id S127; source names the fetched URL; kind `code`; tier `A` appropriate for primary build-pinned source scoped to the scope cell; scope bounded with correct exclusions (not id uniqueness — the code shows no uniqueness claim; not the BiDi mapper's own sessionId — `session_commands.cc` surfaces the classic id only; not a support promise); anchor digests/line numbers all reproduced above; teaches verified as stated; status `mined`, opened `2026-10-26` (receipt 18:24:21Z same day); recheck `90d` — matches the lesson's `:26-27` reason (a Chromium tag pin must not enter `check-release-pins.mjs`'s population, round-32 M10); used-by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` exists at the pinned commit and carries literal `S127` at its line 1.

### Ground chain into gate v2 (lesson :90-91)

`scripts/check-bidi-runtime.mjs` v2 (extracted at 042d6d9): line 145 `const SESSION_ID = /^[0-9a-f]{32}$/; // ChromeDriver 154 classic session id shape`, line 148 `WS_SESSION = /^ws:\/\/[^/]+\/session\/([0-9a-f]{32})$/`, and `sessionOf()` at :376-391 refusing any receipt whose new-session body lacks a 32-lowercase-hex `sessionId` bound into a loopback `webSocketUrl` carrying that same id — a faithful formalization of `GenerateId()`'s shape plus the two surfacing lines. No scope overreach: the gate's pairwise-distinct-sessionIds rule (:65-66, :807) is a separate cross-run rule, not attributed to S127, whose scope cell explicitly excludes id uniqueness. Honesty note in the lesson (:86, "S127 observed no session id; the 32-hex shape is a reading of the format string") is accurate and my re-open confirms the reading.

### Receipt-file citations resolve

`git ls-tree 042d6d9:.ufo/waves/round-33/w1/ScribeSrcSession/` → `S127-row-and-gate.md` (lesson R11), `row-S127.txt` (note line 1's "row drafted by"), `util.cc.dec`, `session_commands.cc.dec`, `commands.cc.dec`, `sha256sums.txt`, `fetch-log.tsv` — both cited filenames exist; no dangling citation found.

## Residual risk / verification gaps

- `?format=TEXT` serving could in principle differ per fetch; here two independent GETs at 18:24:21Z and 18:50:01Z were byte-identical (same raw sha256), so the pin is stable.
- I did not re-run `node scripts/check-sources.mjs` (leaf seat; no lane scripts). The lesson records that run at :39-42; structure-only, does not affect byte/quote findings above.
- Transient HTTP 503 on one session_commands.cc GET (retry succeeded) — recorded, no finding.

## Process notes

- No tools installed or upgraded (tooling authorization unused). No lane, fleet, sibling, or `~/.local/bin` writes; reads only via `git show`/`git ls-tree` on the lane at `042d6d9abf97d567d495652a85eabc851b81adc1` and the six HTTPS GETs logged above.
- No chromedriver/chromium processes started this seat; `pgrep -fa 'chromedriver|chromium'` owned lines: none expected and none started (browser never launched).
- Scratch `/fast/scratch/hyaku/tabi-r33/ReopenS127` deleted after receipt copy (receipts listed below); scratch tree removed from disk.

## Deliverable paths (relative to lane root)

- This report: `.ufo/waves/round-33/w2/ReopenS127.md`
- Receipts: `.ufo/waves/round-33/w2/ReopenS127/` — `util.cc.b64`, `util.cc`, `commands.cc.b64`, `commands.cc`, `session_commands.cc.b64`, `session_commands.cc`, `tag.json`, `fetch-log.txt`, `sha256sums.txt`
