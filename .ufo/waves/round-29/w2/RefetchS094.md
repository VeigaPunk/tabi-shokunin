# RefetchS094 — C3 independent re-fetch and attack of row S094 (wave 2, falsify)

Seat: RefetchS094 (leaf; no subagent dispatch; no lane writes beyond this report and
`.ufo/waves/round-29/w2/refetch/`). Milestone C3, axis freshness.
Measured revision: **32008a453737a27f69e9ab401d0b9775d2a944f7** (the revision named in the item),
in a clean `git clone --shared` (`git status --porcelain` = 0 lines). Lane tip is
`e1e3a15f2db10c135739e0ee7e81ce63a02facf6`; the counter was also run there (identical C3 tallies).
Counter blob at 32008a4: `cbb2388fa7265f615fc5edc798f56930e4c64237`, working-tree sha256
`567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`.
Receipt blob at 32008a4 = working tree = sha256 `ef3f9b0ad25dff53e8f429ffe200060cf8d9c4e269727487fc3431398ea23f77`.
Wave-1 seat PinS094 bytes were **not** reused: every byte below came from my own curl (samples A/B/C,
request_ids `8ab9ac27…`, `f60a72c1…`, `2509f522…`; log in `refetch/RefetchS094.fetches.txt`).
Tooling: no installs (node v24.21.0, curl 8.23.0 present); pacman not invoked.

## Row under test

`corpus/SOURCES.md:108` (13 split cells, parsed as the counter does):

- source: `…/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT`
- anchor: `HTTP 404 fetched 2026-10-21; first line NOT_FOUND: Requested entity was not found; body sha256 9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`
- teaches: `REJECTED: this guessed test filename does not exist at the tag; flip: a resolvable test file with a located quote (html_form_mcp_tool_test.cc is a lead)`
- recheck: `on-release`, status `rejected`, tier `C`.

## 1. Per-file digest agreement (my fetches vs the committed receipt)

One file: `third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`.

| side | my HTTP | my bytes | my raw sha256 | my normalised sha256 | receipt | verdict |
|---|---|---|---|---|---|---|
| new @156.0.8078.47 (A) | 404 | 233 | `94ce1ef487afbe3cc6b6340d824cf8358fd40654f787d991ac7bb4d048b70c53` | `604d97983ea428e85f90186c8c8daee9e0bb226132b7075be266266110764868` | new_status 404, new_sha256 `604d9798…4868` | **agree** (normalised) |
| new @156.0.8078.47 (B, second fetch) | 404 | 233 | `df355096876c5bde8b5a5bcd1560260dbbaddf875160a96983762d07491f1d3f` | `604d9798…4868` | — | nonce-only difference |
| old @154.0.8037.97 (C) | 404 | 233 | `8e8b4b1831068f20b98cbb07f3cefcf761368c19501f3be597e3cf0e2f23d2ed` | `604d9798…4868` | old_status 404, old_sha256 `9d640282…8b19` | **disagree on the digest, agree on the bytes modulo nonce** |

Detail.

- **New side is byte-exact.** My normalised sample A is byte-identical to the committed
  `corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/…` (`diff` empty), and its digest equals
  the receipt's `new_sha256`. The committed new bytes are therefore a genuine Gitiles 404 envelope for
  this URL at this tag, not fabricated text.
- **Old side cannot be re-derived from the network.** Gitiles embeds a fresh
  `request_id: "<32 hex>"` at line 7 of every 404 body, so `old_sha256` is not reproducible by any live
  fetch (my raw 154 digest `8e8b4b18…` ≠ `9d6402…`). The committed 154 body is byte-identical to the
  lane's retained round-19 fetch: `gzip -dc corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz | sha256sum`
  = `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` (233 bytes), i.e. the registry
  anchor digest. Replacing that body's nonce with the receipt's placeholder yields exactly my sample A
  (`2509f522…`/`8e8b4b18…` differ only in that line). So the old bytes are authentic **as a retained
  artifact**, not as a live re-fetch.
- The anchor digest entered `corpus/SOURCES.md` at `d5cf4d7` (round 19), long before round 29
  (`git log -S'9d6402…8b19' -- corpus/SOURCES.md` → only `d5cf4d7`), so the f5 binding is not
  circular within this round.

## 2. Verdict agreement

Counter rule (`scripts/check-release-pins.mjs` at 32008a4): for `old_status === 404` the file holds iff
`new_status === 404` and the new bytes contain the literal `NOT_FOUND` (l.222-223); ranges are never
examined for such a file. My recomputation from committed 154 bytes + my 156 bytes:
**status 404 → 404, line 1 of the body is `NOT_FOUND: Requested entity was not found` → holds; no
range to compare; no superseding row required.**

Counter at 32008a4 (`--rev 32008a4… --stable 156.0.8078.47 --json`, exit 1):
`population=23 unresolved=23 holds=0 drifted=0`, and S094 is
`{"resolved":false,"verdict":null,"reasons":["f6-refetch …form_mcp_schema_unittest.cc"]}` — the only
reason is the refetch record, because `corpus/evidence/round-29/release-pins/refetch/` holds **0 files**
at that revision (`git ls-tree -r 32008a4 corpus/evidence/round-29/release-pins/refetch/` → empty).
Same tallies at tip `e1e3a15`.

With this seat's record installed (`refetch/S094.json`, seat `RefetchS094` ≠ receipt `fetched_by`
`PinS094`), the counter resolves the row: fixture probe base case → `resolved:true verdict:"holds"
reasons:[]`. **Verdict agreement: yes — the counter and my independent recomputation both say holds.**

Consequence for C3 as written: at the named REV the predicate is *not* met (unresolved 23, not 0);
resolution depends on a later integration commit that copies all 23 w2 refetch records into
`corpus/evidence/round-29/release-pins/refetch/`. Any after-measurement must name the REV that
actually contains them; measuring at 32008a4 reads `unresolved=23`. (Reported as a coordination
constraint, not repaired here.)

## 3. Anchored-block review (±25 lines) — nothing alters the teaches cell

The anchor cell gives no line ranges for this file ("absence row"), so the counter's whole-file branch
applies and there is no anchored block to widen. The 156 body is 7 lines; I read all of it and diffed
it against the committed 154 body: **the only difference is line 7** (the `request_id` value vs the
placeholder). Boilerplate is identical (`NOT_FOUND: …`, `locale: "en-US"`, `message: "Object is not
found"`), so nothing outside a block changes the assertion "this guessed test filename does not exist
at the tag" — the absence still holds at 156.

Outside-the-body check (the row's teaches cell also names a flip lead):

- My own directory listing at 156 (different endpoint, `?format=JSON`, HTTP 200, 37359 bytes) has no
  `form_mcp_schema_unittest.cc`; names matching `mcp` are `form_mcp_schema.cc`,
  `form_mcp_schema.h`, `html_form_mcp_tool_test.cc` — an independent absence witness, not just a 404.
- The flip lead resolves at 156: `html_form_mcp_tool_test.cc` HTTP 200, 106254 bytes, sha256
  `944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6` (matches PinS094's claim; my bytes).
- Directory drift 154→156 (`forms/`): `clear_button_element.cc` and `clear_button_element.h` removed
  (248 → 246 names). That touches nothing S094 asserts.

## 4. Filing completeness

| cited by the row | cited where | in the receipt entry |
|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc` | source cell, `refs/tags/154.0.8037.97/<path>` | yes, the single `files[]` element |
| body digest `9d6402…8b19` | anchor cell | bound by f5 to `old_sha256` |
| "first line NOT_FOUND" | anchor cell | true of the committed body (line 1) |
| line ranges | **none cited** | `ranges: []` |

No cited file is missing; no receipt range is uncited, because the receipt files none. So the
*wave-1 "subset filing" shape does not appear in this row* — but the counter's range check is not
merely permissive here, it is **absent**: see A2.

## 5. Attack findings (each reproduced on a throwaway fixture; receipts in `refetch/`)

Fixture: `D=$(mktemp -d -p $S) && git -C "$D" init -q`, toplevel verified equal to `D` before the first
commit; D holds copies of `corpus/SOURCES.md`, the counter, the two committed S094 byte files, a
receipt trimmed to the single S094 row (schema/stable preserved) and `refetch/S094.json`. Every case is
a commit in D; command `node "$D/scripts/check-release-pins.mjs" --repo "$D" --rev HEAD --stable 156.0.8078.47 --json`.

| case | mutation | counter result for S094 |
|---|---|---|
| base | my record as written | `resolved:true verdict:holds reasons:[]` |
| P1 | refetch `sha256` := my **raw** (unnormalised) digest | `f6-refetch` (fails) |
| P2 | refetch `seat` := `PinS094` | `f6-refetch` (fails) |
| P3 | 156 bytes := 404 body of a **different path** (`…/forms/s094_unrelated_probe_does_not_exist.cc`, HTTP 404), receipt `new_sha256` and refetch digest updated | `resolved:true verdict:holds reasons:[]` |
| P4 | receipt `ranges` := `[[100,200]]` (uncited by the anchor; impossible — body is 7 lines) | `resolved:true verdict:holds reasons:[]` |
| P5 | `old_status` := 200 | `verdict:drifted`, `s1-drift-unsuperseded` |
| P6 | base restored | `resolved:true verdict:holds reasons:[]` |

**A1 (critical, structural) — a 404 digest binds nothing to a path.** My foreign-path 404 body
normalises to `604d9798…4868`, *the same digest* as the real file's 404 body: the Gitiles 404 envelope
is path-invariant. f6 (l.218-220) compares only `x.path === f.path` (a receipt-controlled string),
`x.tag`, `x.status`, `x.sha256`. So `new_sha256` for an absence row cannot distinguish "absent at this
path" from "any 404 on Gitiles", and P3 resolves. The path binding that remains is f2 (l.206-208,
comparing the *source cell* to the *receipt path*) plus the seat's own URL — neither is evidence the
counter can see. This reproduces PinS094's F2 with independent bytes and strengthens it: because the
digests are equal, not merely both acceptable, no digest-level fix exists; an absence needs a
listing/`?format=JSON` witness.

**A2 (high) — uncited and impossible ranges are accepted for absence rows.** The 404 branch (l.222-223)
precedes the range loop (l.231-239), so `ranges` is never validated or compared for a 404 file; P4
resolves with `[[100,200]]` even though the committed body has 7 lines and the anchor cell contains no
`100-200` token. Filing completeness is therefore enforced only for 200 rows; the counter cannot reject
a receipt that *adds* ranges the anchor never cites.

**A3 (medium) — `old_status` is self-declared.** l.222 and l.226 branch on the receipt's own
`old_status`; no check re-derives it from committed evidence. It only has a consequence when set to
200 (P5 → drifted + s1), so a seat that mislabels a previously-200 file as 404 (or vice versa) is not
caught, and for this row the entire "absence" classification rests on that one receipt field (backed
here only by the round-19 retained body).

**A4 (medium) — normalisation is mandatory but unenforced.** f6 requires the *normalised* digest (P1
fails with the honest raw digest), yet neither the refetch schema `{id, seat, fetched_at, files:[{path,
tag, status, sha256}]}` nor the counter carries a `normalization`/`raw_sha256` field. An auditor cannot
tell a seat that normalised a genuine fetch from a seat that copied `new_sha256` out of the receipt;
only my `refetch/RefetchS094.fetches.txt` (raw digests + request_ids) records that distinction for this
row. The receipt documents the normalisation for S094 alone (`normalization`, `raw_new_sha256`), and
the counter never reads either field.

**A5 (low) — rejected rows are in the population.** Population filters only `recheck === "on-release"`
and `tag < stable` (l.178), so `status: rejected` rows count toward `population=23`. That is
semantically right for this row (a rejected row "holds" when the absence still holds), but it means the
C3 tally mixes re-verified acceptance rows with re-verified rejections; the verdict word `holds` reads
the same for both.

## 6. Impacted axes

- **freshness (C3)** — primary. The row's resolution requirement "an independent re-fetch record from a
  different seat agreeing with the 156 bytes" is, for absence rows, satisfied by any Gitiles 404 (A1), and
  the counter's honesty here rests on a receipt-level convention it does not check (A4). The row's own
  truth is unaffected: the file is absent at both tags, the flip lead is present at 156, and the
  committed bytes are authentic (new side byte-exact to my fetch; old side identical to the round-19
  retained artifact modulo the per-request nonce).
- **operability / calibration / depth / coverage / adjacency** — not impacted; I ran no C1/C2 or
  measure-path checks and change no production file.

## 7. Smallest safe correction

1. Extend the refetch schema with `url`, `normalization` (the exact substitution) and `raw_sha256`, and
   let f6 accept **either** the raw or the normalised digest, asserting the declared normalisation — the
   convention becomes auditable and an honest raw-digest seat stops failing (A4, P1).
2. For `old_status 404` (absence rows) require one extra field in the receipt entry, e.g.
   `absence_witness: {endpoint, status, sha256, basename}` from the directory listing at the stable tag,
   and have the counter check `basename` is absent from a committed listing — this is the only check that
   binds an absence to a path (A1, P3).
3. Require `ranges` to be empty whenever `old_status === 404`, so an uncited/impossible range cannot be
   filed (A2, P4).
4. Optional: derive `old_status` from the committed old bytes (a body that parses as a Gitiles 404
   envelope cannot be a 200 source file) instead of trusting the receipt field (A3).

None of this is a repair I performed; the counter is frozen this round and the lane's tracked files are
read-only to this seat. As an unspecified-but-not-harmed note: with `refetch/S094.json` integrated, S094
resolves and the C3 tally moves from unresolved 23 to 22 at the integrating REV.

## 8. Commands run (exit codes)

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin $S/lane && git -C $S/lane checkout 32008a4…`; `git -C $S/lane status --porcelain \| wc -l` → 0 | 0 |
| 2 | `curl -sS -o bA -w '%{http_code}' '…/refs/tags/156.0.8078.47/…/form_mcp_schema_unittest.cc?format=TEXT'` → `404`, bytes 233 | 0 |
| 3 | same at `154.0.8037.97` (sample C) → `404`, bytes 233 | 0 |
| 4 | `base64 -d bA` (404 body is plain text, not base64) | **1** (expected) |
| 5 | `sha256sum` raw and nonce-normalised bodies; `diff` normalised A vs committed 156 body | 0 (`diff` empty) |
| 6 | `gzip -dc corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz \| sha256sum` → `9d6402…8b19` | 0 |
| 7 | `node scripts/check-release-pins.mjs --rev 32008a4… --stable 156.0.8078.47 --json` → `population:23 unresolved:23` | 1 |
| 8 | same at `--rev e1e3a15…` → `population:23 unresolved:23` | 1 |
| 9 | `curl -sS '…/forms?format=JSON'` at 156 → `200`, 37359 bytes, no `form_mcp_schema_unittest.cc` | 0 |
| 10 | `curl -sS '…/html_form_mcp_tool_test.cc?format=TEXT'` at 156 → `200`, 106254 bytes, sha `944ee9e4…` | 0 |
| 11 | fixture battery P1-P6 (table in §5) | 0 (script), each counter run 1 |

Receipts: `refetch/S094.json` (the record, values from sample A only) plus
`refetch/RefetchS094.{fetches.txt,receipts.txt,probe-battery.txt,probe-battery.mjs,counter-32008a4.json,counter-at-tip.json,counter-with-refetch.json,dir-listing-156.0.8078.47.json,156.normalized.txt,154.normalized.txt,foreign-404-body.raw.txt,foreign-404-body.normalized.txt,foreign-404.status.txt,lead-156.html_form_mcp_tool_test.cc}`.
Scratch under `/fast/scratch/hyaku/tabi-r29/RefetchS094` removed after the copies.
