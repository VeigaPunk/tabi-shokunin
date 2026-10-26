# RefetchS120 — independent refetch of S120 (RFC 6585) for C1, round 31 / a2w1

Seat: RefetchS120 (not the receipt's `fetched_by`, which is `FetchS120`).
Revision under test: `486048356f0712e4396588c9dab58cd419243120`. Freeze: `9505a10eb80b2a0b273ebaba3f7f872ad302192d`. Baseline: `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`.
Read first: `.ufo/waves/round-31/claims.json` (C1, frozen counter `d15f3bd7…f6832`, `--live` required, S120 cited in prose only).

## Verdict

**Holds.** Two independent read-only fetches of `https://www.rfc-editor.org/rfc/rfc6585.txt` (2026-10-26T12:26:40Z and 12:27:59Z, both HTTP 200, 17164 B, effective URL unchanged, raw sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58`) reproduce the committed receipt bytes (`corpus/evidence/round-31/decision-table/bytes/S120.txt`) byte for byte, and the counter's own `normalise()` — extracted verbatim from the frozen `scripts/check-decision-table.mjs` — gives the identical normalised digest `2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4` (14287 chars) for my fetches, the committed bytes, and (independently) the digest wave 1's fetcher recorded. Both prose claims the entry attributes to S120 are located verbatim in my fresh normalised bytes at the sections cited: §4 "MAY include a Retry-After header indicating how long to wait before making a new request" (line 137–139, normalised offset 4219) and §7.2 "servers are not required to use the 429 status code" (line 300–302, offset 8620). The registry row's anchor cell cites six line numbers; all six land on the cited sentences. Two low-severity registry-cell nits (anchor omits the §7.2 span the entry cites; the `teaches` cell says "Retry-After seconds" although RFC 6585 never says seconds) and two informational notes. Neither nit touches a C1 row, the counter, or any admitted count: no table row cites S120, so the counter never reads these cells.

## What I attacked

1. Byte fidelity: do the committed receipt bytes equal what the URL serves today (two fetches, independent of `FetchS120`)?
2. Normalised fidelity: does the counter's collapse-whitespace normalisation preserve that equality, and does it equal the normalised digest wave 1 recorded?
3. Prose attribution: are the two claims the entry attributes to S120 (§4 Retry-After MAY; §7.2 a server need not use 429) present in my fresh bytes at those sections, with the force the entry states?
4. Registry anchor: do the anchor cell's cited line numbers point at the cited sentences in the committed bytes?
5. Row impact: does any D-row cite S120 (a "Located quote" that would have to be re-located)? — No: D1–D5 cite S119, D6–D11 S121, D12–D13 S122 (13 rows, `grep -o '^| D[0-9]\+ …'`).

## Fetch record (TSV, verbatim)

`curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5`; no cookies, no credentials, no API host contacted; only `www.rfc-editor.org`.

```
fetch	utc_start	status	bytes	raw_sha256	norm_sha256	norm_chars	effective_url	server_date	source_file
1	2026-10-26T12:26:40Z	200	17164	f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58	2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4	14287	https://www.rfc-editor.org/rfc/rfc6585.txt	not-captured	rfc6585.1.txt
2	2026-10-26T12:26:40Z	200	17164	f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58	2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4	14287	https://www.rfc-editor.org/rfc/rfc6585.txt	not-captured	rfc6585.2.txt
3	2026-10-26T12:27:59Z	200	17164	f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58	2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4	14287	https://www.rfc-editor.org/rfc/rfc6585.txt	Mon, 26 Oct 2026 12:28:00 GMT	rfc6585.3.txt
```

Fetch 3 is an extra GET taken only to capture response headers (`-D hdr.3.txt`); it returned the same 17164 B / same sha256, `content-type: text/plain;charset=utf-8`, `etag: W/"2a8ddc3c0500e72e17265fccf2c80228"`, `server: cloudflare`. Fetches 1 and 2 were issued in the same second (`%{http_code} %{size_download} %{url_effective}` captured per fetch; `cmp` on the two bodies: IDENTICAL).

## Comparison with the committed receipt

| Artifact | raw sha256 | normalised sha256 | bytes |
|---|---|---|---|
| my fetch 1 | `f6d55d1b…76e58` | `2e9eae28…4d4` | 17164 |
| my fetch 2 | `f6d55d1b…76e58` | `2e9eae28…4d4` | 17164 |
| committed `bytes/S120.txt` (in scratch clone at REV) | `f6d55d1b…76e58` | `2e9eae28…4d4` | 17164 |
| receipt `S120.json.sha256` | `f6d55d1b…76e58` | — | (matches its `bytes_path`) |
| registry row `corpus/SOURCES.md:134` | `f6d55d1b…76e58`, "17164 B", "fetched 2026-10-26T08:36:10Z" | — | 17164 |
| wave-1 fetcher's own record `w1/FetchS120/S120-fetches.tsv` | `f6d55d1b…76e58` | `2e9eae28…4d4`, 14287 | 17164 |

`identical_raw=true`, `identical_norm=true` across my two fetches and the committed bytes. Full digests and the receipt file: `RefetchS120/hashes.txt`; machine output: `RefetchS120/locate.json`.

Method note on the normaliser: the frozen counter has **no import guard** — a bare `import()` of `scripts/check-decision-table.mjs` runs `main()` and exits `2` (`verdict=could-not-evaluate detail=usage: --rev <REV> --baseline <REV> --entry <path>, or --selftest`, observed). So I extracted `const ENTITIES = …` + `export function normalise(buf) {…}` verbatim as lines 132–146 of the frozen file (`RefetchS120/normalise.body.mjs`, sha256 `052b6e15fb5b43e8147860eee3dd36be6f28c9d3310e27463ec4e2142851199c`) and executed that. The frozen counter itself hashes to `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, equal to `claims.json.frozenDigests`. Two independent normalised digests agree (`2e9eae28…`), so the extraction is faithful in effect, not just in text.

## Per-row table (rows citing S120)

**No row cites S120.** The entry's 13 rows cite S119 (D1–D5), S121 (D6–D11), S122 (D12–D13). `grep -n "S120" corpus/knowledge/rate-signal-decision-table.md` returns exactly lines 4, 8, 97, 98, 138, 160 — the source header, the recheck note, two prose paragraphs, and the Limits/U2 bullets. There is therefore no "Located quote" cell for S120 and nothing for the counter's `q2-quote-located` / `n1-threshold-sourced` checks to read.

| Row id | quote cell cites S120 | located |
|---|---|---|
| D1–D13 | no | n/a (S119/S121/S122 only) |

## Prose claims the entry attributes to S120, located in my fresh normalised bytes

Offsets are into the normalised string (`normalise()` of the committed bytes = of my fetches); line numbers are the raw file's, which are the same in all three bodies.

| # | Entry location and claim | RFC 6585 span | Located | Normalised offset | Force check |
|---|---|---|---|---|---|
| P1 | entry:97–98 "the response may carry `Retry-After` indicating how long to wait (S120 §4)" | §4, lines 137–139: "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request." | yes (1 occurrence) | 4219 | MAY, as stated. The entry does not claim the un-quoted SHOULD clause. `Retry-After` occurs twice in the whole document (offsets 4315, 4459), both inside §4. |
| P2 | entry:98 and entry:160 "a server need not use 429 at all / need not use 429 (S120 §7.2)" | §7.2, lines 296–302: "…Therefore, servers are not required to use the 429 status code; when limiting resource usage, it may be more appropriate to just drop connections, or take other steps." | yes (1 occurrence) | 8620 | "not required" = MAY/optional, as stated; §7.2 is at line 294, so the section citation is right. Under "7. Security Considerations", read by the entry as the RFC's own statement — the text is literally there. |
| P1b | entry:97 "RFC 6585 defines 429" | §4, lines 134–135: "The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\")." | yes | 4103 | definition sentence, no force claim. |
| P1c | registry `teaches` cell only (the entry's prose makes no cache claim; `grep -n "cache"` in the entry hits only robots-cache lines 23, 26, 52, 75, 78): "MUST NOT be stored by a cache" | §4, line 165: "Responses with the 429 status code MUST NOT be stored by a cache." | yes | 4994 | MUST NOT, as stated. |
| P3 | entry:138 "`Retry-After: 3600` … illustrate the response" | §4 example block, line 145 | yes (1 occurrence) | 4459 | specimen, correctly called an illustration. |
| P4 | entry:138 "the 50-requests-per-hour sentence inside RFC 6585's sample 429 body" | §4 example body, lines 153–154: "I only allow 50 requests per hour to this Web site per logged in user." | yes (1 occurrence) | 4513 | specimen, correctly called an illustration, not a threshold. |
| P5 | registry `scope` cell only ("not how an origin counts or identifies clients"; the entry states no counting claim) | §4, lines 158–163: "Note that this specification does not define how the origin server identifies the user, nor how it counts requests. …" | yes | 4600 | statement of scope, no force claim. |

Section markers confirming the citations in the committed bytes: line 95 `3.  428 Precondition Required`, line 132 `4.  429 Too Many Requests`, line 175 `5.  431 Request Header Fields Too Large`, line 203 `6.  511 Network Authentication Required`, line 294 `7.2.  429 Too Many Requests`.

## Registry anchor cell (`corpus/SOURCES.md:134`) against the committed bytes

Anchor text: `§4 "429 Too Many Requests" lines 132-166 (Retry-After MAY at 138, example "Retry-After: 3600" at 145, "MUST NOT be stored by a cache" at 165), §3 428 at 95-130, §5 431 at 175-201, §6 511 at 203-220`.

| Cited | Line content in `bytes/S120.txt` | Verdict |
|---|---|---|
| §4 heading "429 Too Many Requests" 132 | `4.  429 Too Many Requests` | correct |
| "Retry-After MAY at 138" | `condition, and MAY include a Retry-After header indicating how long` | correct (MAY is on 138; sentence spans 137–139) |
| example "Retry-After: 3600" at 145 | `Retry-After: 3600` | correct |
| "MUST NOT be stored by a cache" at 165 | `Responses with the 429 status code MUST NOT be stored by a cache.` | correct |
| §3 428 at 95-130 | 95 = `3.  428 Precondition Required`, 130 = `Responses with the 428 status code MUST NOT be stored by a cache.` | correct (last content line 130) |
| §5 431 at 175-201 | 175 = `5.  431 Request Header Fields Too Large`, 201 = `Responses with the 431 status code MUST NOT be stored by a cache.` | correct |
| §6 511 at 203-220 | 203 = `6.  511 Network Authentication Required`, 220 = `Responses with the 511 status code MUST NOT be stored by a cache.` | correct (§6.1 starts at 231) |
| §4 span end 166 | 166 is blank; §4 content ends at 165; page footer 170–173; §5 at 175 | range is a one-blank-line superset (informational only) |

## Findings

- **N1 — low, registry anchor incompleteness.** The anchor cell lists §4, §3, §5, §6 but **not §7.2** (lines 294–303), although the entry's source header (`entry:4` "§4, §7.2") and U2 (`entry:160`) both rest on §7.2. The recheck line (`entry:8`) sends a future 180-day re-open to "re-locate every span"; a rechecker working only from the anchor cell would re-open §4 and miss the §7.2 sentence. Not a C1-predicate defect: S120 has no table row, and the counter reads neither the anchor cell nor prose citations.
- **N2 — low, unit not in the source.** The registry `teaches` cell says "MAY carry Retry-After **seconds** saying how long to wait". `grep -c "second" bytes/S120.txt` = **0** — RFC 6585 never states the unit; delay-seconds is RFC 7231 §7.1.3 semantics, and §4 quotes no unit even in its example (`Retry-After: 3600`). The entry's own prose is clean (it states no unit and attributes none to S120: entry:97–98, 138), so only the registry cell carries the unsourced unit. Again no row or counter impact.
- **N3 — informational, anchor range.** "§4 … lines 132-166": §4's content is 132–165; 166 is the blank separator before the page footer. Harmless.
- **N4 — informational, draft vs committed timestamp.** Wave-1 drafts (`w1/ScribeSourcesRows/rows.md:16`, `w1/ScribeSourcesRows/gate.md:12,38`) record `fetched 2026-10-26T08:36:21Z`; the committed registry row and the receipt both say `2026-10-26T08:36:10Z`, which matches the fetcher's own record (`w1/FetchS120/S120-fetches.tsv` row 1). The committed state is the correct one.
- **N5 — observation, counter shape.** The frozen counter executes `main()` on import (exit 2, `detail=usage…`) and exports nothing importable without triggering that path. It does not affect its CLI predicate; it only forces a rechecker who wants `normalise()` to extract it (as I did, verbatim, verified by digest agreement).

## Commands run (exit codes)

```
git clone --shared …/tabi-shokunin "$S/clone"                     # exit 0
git -C "$S/clone" checkout -q 486048356f…                          # exit 0; HEAD=486048356f…; porcelain lines: 0
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5  # fetch 1: exit 0 → 200 17164 https://www.rfc-editor.org/rfc/rfc6585.txt
curl … (same flags, run 2)                                         # exit 0 → 200 17164 same URL
cmp rfc6585.1.txt rfc6585.2.txt                                    # exit 0 → IDENTICAL
curl … -D hdr.3.txt (run 3, header capture)                        # exit 0 → 200 17164; date Mon, 26 Oct 2026 12:28:00 GMT
sha256sum rfc6585.{1,2,3}.txt                                      # f6d55d1b…76e58 ×3
sha256sum scripts/check-decision-table.mjs                         # d15f3bd7…f6832 == frozenDigests
sed -n '132,146p' scripts/check-decision-table.mjs > normalise.body.mjs ; sha256sum # 052b6e15…99c
node locate.mjs   # import of the frozen counter                     # exit 2: verdict=could-not-evaluate detail=usage…
node locate2.mjs  # verbatim normalise() over fetch1/fetch2/committed # exit 0 → hashes + offsets + occurrence counts
sed -n '<n>p' clone/corpus/evidence/round-31/decision-table/bytes/S120.txt  # anchor lines 95,130,132,138,145,153,165,166,175,201,203,220,294,300,301
grep -n "S120" corpus/knowledge/rate-signal-decision-table.md      # exit 0: lines 4,8,97,98,138,160 (no row)
grep -c "second" bytes/S120.txt                                    # 0
```

## Boundaries honoured / not run

- Read-only git in the lane; one `--shared` clone at the named REV, porcelain empty before use; every git call named `-C`. I wrote no lane tracked file, no lane index, no jj state.
- No builds, linters, formatters, and **no lane script run on my behalf**: in particular I did **not** run `check-decision-table.mjs` (the C1 counter reading at REV belongs to the L1 / main gate), so its `admitted`/`failing` numbers are untouched by me.
- No subagent spawned; no `agent://all`. Network was three GETs of one public RFC text, no logins, cookies, credentials or API host.
- No tool installation needed (curl, node, python3, git already present); no pacman transaction attempted (host-wide pause honoured).
- Scratch `$HYAKU_SCRATCH/tabi-r31/RefetchS120/` removed after copying receipts into `RefetchS120/` (fetch bodies, meta, headers, `fetch.tsv`, `hashes.txt`, `locate.json`, `locate2.mjs`, `normalise.body.mjs`).
