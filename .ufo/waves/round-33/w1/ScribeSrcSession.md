# ScribeSrcSession — C2 source row S127 (ChromeDriver session id)

**Verdict.** Located and grounded: ChromeDriver 154 mints a new classic session's id in
`chrome/test/chromedriver/util.cc:39-43`, `GenerateId()`, which formats two `base::RandUint64()`
values with `%016`+`PRIx64` twice — a zero-padded, lowercase, exactly-32-hex-character string — and
`commands.cc:96-97` passes it to `Session(new_id, host)`; the same string is echoed verbatim as the
W3C `sessionId` (`session_commands.cc:372`) and inside the BiDi `webSocketUrl`
(`session_commands.cc:288-289`). The row is drafted with `recheck 90d` (not `on-release`, per
`scripts/check-release-pins.mjs:178` + round-32 M10) and structurally validated: inserted after S126
in a freeze clone with a placeholder used-by note, `node scripts/check-sources.mjs` exits 0 with
`verdict=clean rows=127 findings=0`; remove that note and it exits 1 with
`used_by_missing / E11 / path_missing` for S127. Two honest limits: no session id was ever
observed (no browser launched; the shape is a reading of the format string), and the row's used-by
target `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` does not exist yet, so the L1 must land
that note (citing `S127`) with or before the row.

## Evidence

All fetches `curl -q -sS --proto =https` against the measured tag; every one HTTP 200. Full table
with UTC time, status, raw bytes, raw sha256 and decoded bytes/sha256:
`ScribeSrcSession/fetch-log.tsv`.

| URL (suffix `?format=TEXT` unless noted) | UTC | HTTP | raw B | raw sha256 | decoded B / sha256 |
|---|---|---|---|---|---|
| `…/154.0.8037.97/chrome/test/chromedriver/util.cc` | 18:24:21Z | 200 | 26200 | `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4` | 19648 / `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b` |
| `…/chrome/test/chromedriver/util.cc` (human page, no `?format`) | 18:24:22Z | 200 | 267504 | `114b21572c1ee082e1f16d7b7ae1bad37d0433a49b7c4b361f050bb6d5af55cb` | same (HTML) |
| `…/chrome/test/chromedriver/util.h` | 18:25:16Z | 200 | 6088 | `6b688aaef63beea6c2febec1857401ca17c960ece48428d49f2d59d1e18a8a5a` | 4565 / `b3e2c5677f4f69c5eb7548481e5101435180cada6de98b62dbf5332655749a9c` |
| `…/chrome/test/chromedriver/commands.cc` | 18:24:24Z | 200 | 20924 | `4bc5d8dccea1bbbe6188d3903e443b2cc22aa789fc8d4bccbb952dc403d64f22` | 15692 / `d546e257994f46e4c818d5ada40f7223bd88546ed9c5a62706d71098b03c50f7` |
| `…/chrome/test/chromedriver/session_commands.cc` | 18:24:25Z | 200 | 90944 | `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e` | 68207 / `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` |
| `…/chrome/test/chromedriver/chrome/web_view_info.cc` | 18:24:26Z | 200 | 6140 | `6f631355373a45678e7fb59069828f9a69f3f4c9cd1e6d48a77d5e01d2f41264` | 4603 / `2c8a828686722298a0133ebcbfbc643ae03225f28cdc0c83b7e6574ff40bb015` |
| `…/chrome/test/chromedriver/chrome/devtools_http_client.cc` | 18:25:35Z | 200 | 3532 | `838c7430e708619f8f545f3edbf8c33da73287fd146bbfac2a557372a894e1ab` | 2649 / `656efea14af417a446cb841c123c3914eaa7de38689a58668895f13a18f980c2` |
| `…/chrome/test/chromedriver/chrome/web_view_impl.cc` | 18:25:36Z | 200 | 129996 | `ba3ff5239e5f6da609009fefdd214da941f8f69d0774e193225832d52a265c41` | 97495 / `93d8438082eb45ef511325e26131d6f6d268b83d019020ea92da640096af7b4d` |
| `…/154.0.8037.97?format=JSON` (tag ref) | 18:24:27Z | 200 | 2334 | `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264` | same |

The decoded `session_commands.cc` sha256 is byte-identical to S125's recorded decoded blob, an
independent cross-check that both seats read the same tag bytes. The tag ref JSON gives
`"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"`, `"tree": "e096b0852a79b0810dba5cfaa714c95d74908532"`,
matching S125's anchor.

Generation site (`decoded`, `…/chrome/test/chromedriver/util.cc`):

```
 39: std::string GenerateId() {
 40:   uint64_t msb = base::RandUint64();
 41:   uint64_t lsb = base::RandUint64();
 42:   return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);
 43: }
```

Call site (`commands.cc`): `96: std::string new_id = GenerateId();`,
`97: std::unique_ptr<Session> session = std::make_unique<Session>(new_id, host);`.
Declaration: `util.h:22: std::string GenerateId();`.
Surfaces: `session_commands.cc:288-289` (`"ws://" + session->host + "/session/" + session->id`) and
`session_commands.cc:372` (`body.Set("sessionId", session->id);`).

Shape checks (textual, on the decoded bytes): `grep -o '%016' util.cc` → 2;
`grep -o 'PRIx64' util.cc` → 2; `grep -c 'PRIX64' util.cc` → 0. `PRIx64` is the lowercase hex
conversion, `%016` zero-pads to 16 digits, twice ⇒ 32 characters, `[0-9a-f]`, fixed width.

Browsing-context side (cheap check, kept out of the row's anchor): `devtools_http_client.cc:46-52`
feeds the `/json/list` payload to `ParseWebViewsInfo`; `web_view_info.cc:95-109` takes each entry's
`id` with `targetId` as fallback; `web_view_impl.cc:685-687` `GetId()` returns it. The mapper target
is created hidden and its id stored at `session_commands.cc:408-418`. `browsingContext` occurs 0
times in `session_commands.cc` and `commands.cc`, so a BiDi `browsingContext` id is not produced by
this C++ (what the embedded mapper assigns is not grounded here and is not claimed).

Structural validation, in the freeze clone (never the lane checkout):

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
$ git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea # exit 0
$ git -C "$S/clone" rev-parse HEAD  → e6b0a9074d434ccc307badd312ae7379d1193fea
# row inserted after corpus/SOURCES.md:140 (S126); placeholder note cites S127
$ cd "$S/clone" && node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=127 tiers=A:112,B:6,C:9 status=queued:15,mined:103,rejected:9 findings=0 file=corpus/SOURCES.md
EXIT=0
$ # same, with the used-by note removed
FINDING id=used_by_missing fleet=E11 row=S127 detail=path_missing
SOURCES_GATE verdict=failed … findings=1
EXIT=1
```

Both transcripts are in the output dir. Runs used `TMPDIR=/fast/scratch/hyaku/tabi-r33/ScribeSrcSession/tmp`
(no browser involved). No lane tracked file, index or jj state was touched; the lane checkout was
read only, the only writes outside scratch are this report and the output dir below.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeSrcSession/S127-row-and-gate.md` — the 11-cell registry row
  (id S127, `code`, tier A scoped, anchor `util.cc:39-43` + call site + surfaces, status `mined`,
  opened 2026-10-26, recheck `90d`, used-by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`),
  the Gate table row (URL, access time, ≤25-word located quote), and the grounds/limits section.
- `.ufo/waves/round-33/w1/ScribeSrcSession/row-S127.txt` — the row alone, one line, paste-ready.
- `.ufo/waves/round-33/w1/ScribeSrcSession/fetch-log.tsv` — every fetch with UTC time, URL, HTTP
  status, raw bytes, raw sha256, decoded bytes, decoded sha256.
- `.ufo/waves/round-33/w1/ScribeSrcSession/excerpts.txt` — line-numbered excerpts of every cited
  span, generated from the decoded blobs.
- `.ufo/waves/round-33/w1/ScribeSrcSession/{util,util.h,commands,session_commands,web_view_info,devtools_http_client,web_view_impl}.dec`
  — the decoded source bytes the row cites (so the L1 can re-derive every line without refetching).
- `.ufo/waves/round-33/w1/ScribeSrcSession/check-sources-{with,without}-stub.txt` — clone gate
  receipts, exit 0 / exit 1.
- `.ufo/waves/round-33/w1/ScribeSrcSession/sha256sums.txt` — digests of all of the above.

## Findings and limits

1. **Dependency for the L1:** the row's `used-by` note must exist and contain `S127`, else
   `check-sources` fails `E11` (demonstrated). Land the C2 note and this row together.
2. **Not observed:** the 32-lowercase-hex shape is derived from the format string, not from a
   captured `/session` response; no browser ran in this seat. Any future receipt that states a
   session id of another shape (uppercase, dashed UUID) is inconsistent with this source, but a
   string that merely matches the shape is not thereby authentic — the shape rules out malformed
   ids only.
3. **Not claimed:** uniqueness/unpredictability of `base::RandUint64()`; the mapper's own BiDi
   `sessionId` origin; any BiDi `browsingContext` id generation.
4. **Transient fetch failure, recorded:** the first `util.h` fetch returned HTTP 503 (empty body,
   1,459 B error page); it was refetched at 18:25:16Z with HTTP 200 (recorded above). One earlier
   listing request of mine was malformed (two query strings appended) and returned HTTP 400; it was
   corrected and only the corrected listing (HTTP 200, 12,687 B) was used.
5. **Cadence:** `recheck 90d` is the correct cell here — `scripts/check-release-pins.mjs:178`
   selects `on-release` rows with a Chromium Gitiles tag pin into its population, and S127 has no
   release-pin receipt entry (round-32 M10, `corpus/lessons/round-32.md:175-176`).
6. No tool was installed or upgraded; no package manager ran. Scratch
   `/fast/scratch/hyaku/tabi-r33/ScribeSrcSession` (clone included) is removed before this report
   is yielded; no chromedriver/chromium was started, so there is no process to report.
