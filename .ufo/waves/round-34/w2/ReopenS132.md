# ReopenS132 — re-open of SOURCES row S132 (round 34, w2 FALSIFY)

**Verdict: HOLDS, with one low-severity wording note (not a row defect).** I re-fetched
`commands.cc` at tag 154.0.8037.97 myself. The bytes match the row's recorded sizes and both digests. All anchors
exist at the cited lines. The row parses as 11 cells with no `|` inside a cell, kind `code` / tier `A` / status
`mined` are consistent with S127 and the registry, and `used-by` names a file that cites S132. The claims the
entry and the lesson build on S132 are what the bytes say. The note: the entry's "registered without a uniqueness
check" (and the row's "not on a registry") is true of the explicit code but the container is a `std::map`, so a
colliding id would be silently dropped by `emplace` rather than overwritten. That is a nuance, not an overreach
(see Notes).

## Fetches (curl -q -sS --proto =https; Gitiles ?format=TEXT, base64 -d)
| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| .../154.0.8037.97/chrome/test/chromedriver/commands.cc?format=TEXT | 2026-10-26T20:12:33Z | 503 (transient; body = Google error page 1,459 B, not hashed) | - | - |
| same | 20:12:38Z / 20:12:47Z / 20:12:56Z | 200 (x3) | 20,924 raw | raw `4bc5d8dccea1bbbe6188d3903e443b2cc22aa789fc8d4bccbb952dc403d64f22`; decoded 15,692 B `d546e257994f46e4c818d5ada40f7223bd88546ed9c5a62706d71098b03c50f7` |
| .../chromedriver/util.cc?format=TEXT | 20:13:20Z | 200 | 26,200 raw | raw `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4` (matches S127 row) |
| .../chromedriver/session_thread_map.h?format=TEXT | 20:13:25Z | 200 | 1,200 raw | raw `9edbaee1c49133cef76bad08832e46de83392947aa6666875195a5460f907be5` |
| .../refs/tags/154.0.8037.97?format=JSON | 20:13:33Z | 200 | 2,334 | `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`; `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"`, tree `e096b085…` |

Row S132 states raw 20,924 B / sha `4bc5d8dc…d64f22` / decoded 15,692 B / `d546e257…3c50f7` (SOURCES.md:146) and
lesson Gate line `corpus/lessons/round-34.md:34` states the same truncated digests and sizes: both match my bytes.
The row's tag commit `b510e9d7…` equals the tag JSON. (The row's "fetched twice, byte-identical" matches my three
identical 200s; the original two times cannot be re-observed.)

## Anchors (decoded commands.cc, my line numbers)
- `:91-112` `ExecuteCreateSession(...)`; row says `:91-111` (closing brace at 112 — immaterial).
- `:96` `  std::string new_id = GenerateId();` — matches row and lesson Gate.
- `:110` `  session_thread_map->emplace(new_id, std::move(thread_info));` — matches. Nothing between 96 and 110 compares
  `new_id` with `session_thread_map` (the only use of the map before 110 is none; `find` appears first at :392, in
  ExecuteSessionCommand). No uniqueness check in this function — row/entry claim holds.
- `:114-133` `ExecuteBidiSessionNew`; `:130` `new_params.SetByDottedPath("capabilities.alwaysMatch.webSocketUrl", true);`
  and `:131-132` calls `ExecuteCreateSession` — row's "reaches the same function with webSocketUrl forced true (line 130)" holds.
- Cross-doc: `util.cc:39-43` `GenerateId()` = two `base::RandUint64()` printed `%016PRIx64%016PRIx64` (S127 holds; supports the row's
  "two random 64-bit words per S127", "128 random bits"). `session_thread_map.h`: `using SessionThreadMap = std::map<std::string, std::unique_ptr<SessionThreadInfo>>;`.

## Row structure (corpus/SOURCES.md:146 at 04f9623)
- `awk -F'|'` NF=13 → 11 cells between the outer pipes; no embedded `|` (cell lengths: 6,178,6,3,221,524,438,7,12,5,49). Cells:
  id S132 | source+URL | kind `code` | tier `A` | scope | anchor | teaches | status `mined` | opened `2026-10-26` | recheck `90d` | used-by.
- `node scripts/check-sources.mjs` in a scratch clone at 04f9623: `SOURCES_GATE verdict=clean rows=133 ... findings=0`, exit 0.
- `used-by` = `corpus/knowledge/bidi-gate-selftest-round-34.md`, which cites S132 at line 1 (header) and line 59 (`S132, commands.cc:96, :110`). Also cited by lesson `round-34.md:34,85` and README.md:798.
- Gate quote (lesson :34) is the two code lines verbatim from my decode; no overreach in "admit (mined; grounds the M19 rule as lane discipline)".

## What the entry/lesson claim, against the bytes
- Entry :58-60: "one id is minted per create-session call and registered without a uniqueness check (S132 :96, :110), so the pairwise-distinct rule (M19) is the lane's own receipt discipline, not a driver guarantee." — supported: one GenerateId per ExecuteCreateSession call (both create-session paths reach it); no explicit dedupe; no driver-side uniqueness promise appears in the file.
- Row "teaches": "a repeated sessionId across independent runs is therefore evidence of a reused or hand-copied receipt" — lane inference from 128-bit randomness (S127 + S132), stated with "therefore" and scoped "fixes 154 only"; not a byte claim of S132 but not overreach.

## Notes (low severity, wording only — no repair made)
1. `emplace` on `std::map` (`session_thread_map.h`) does not overwrite on an existing key; an id collision would leave the earlier entry and discard the new `thread_info` while `init_session_cmd` still runs with `new_id`. So "registered ... with no uniqueness check" / "not on a registry" is correct for explicit code but the container itself enforces key uniqueness by dropping. Nothing in the entry's gate rule depends on this (M19 is a receipt rule about distinct runs). Severity: low/informational.
2. Row anchor `:91-111` omits the function's closing brace at :112. Immaterial.
3. First fetch returned 503 once (transient Gitiles); retries 200.

## Deliverables (/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w2/ReopenS132/)
`commands.cc.154.0.8037.97`, `util.cc.154.0.8037.97`, `session_thread_map.h.154.0.8037.97`, `tag-154.0.8037.97.json`, `decoded-sha256.txt`.
Commands run (all exit 0 except the first curl's 503 body): curl fetches above; `base64 -d`; `sha256sum`; `git clone --shared` + `checkout --detach 04f9623…` in scratch; `node scripts/check-sources.mjs` (exit 0). No tools installed. Scratch removed.
