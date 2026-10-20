VERDICT: ISSUES

# LiveS057 — independent re-fetch and claim attack on C1 receipt S057

Seat `TabiR18.LiveS057-2` (leaf, no delegation). Read-only production: no lane edit, no git write, no
`jj`, no counter mutation. All network GETs went to one public URL; all scratch bytes lived in
`/tmp/tabi-r18-s057-5DRubL` and were deleted after this report. The round-18 producer
`.ufo/waves/round-18/recheck-fetch.mjs` was **imported** for its `decodeBody`/`normalize` functions to
match the receipt's normalizer; its `main()` was never run, so no receipt/excerpt was written.

Lane tip at work: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse refs/heads/master` =
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (REV), matching the assignment. `git status --porcelain=v1 --
corpus/evidence/round-18/source-recheck/S057.json corpus/SOURCES.md` printed nothing, so the worktree
bytes equal REV for both inputs.

## 1. Independent fetch (exact commands, observed exits)

```sh
D=$(mktemp -d /tmp/tabi-r18-s057-XXXXXX)            # actual: /tmp/tabi-r18-s057-5DRubL
UA='Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'
URL='https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd'
CODE=$(curl -sSL --compressed --max-time 90 -A "$UA" -o "$D/body1" -w '%{http_code}' "$URL"); echo "http=$CODE"
# http=200
stat -c 'bytes=%s' "$D/body1"; sha256sum "$D/body1"
# bytes=695873
# 7525018fcadd77252f49f46e861fcd06b0facdc050d9ebf25b4778af70fbf411  body1
sleep 2
CODE2=$(curl -sSL --compressed --max-time 90 -A "$UA" -o "$D/body2" -w '%{http_code}' "$URL"); echo "http=$CODE2"
# http2=200
stat -c 'bytes=%s' "$D/body2"; sha256sum "$D/body2"
# bytes2=695874
# 94fb51a97872cb2dd835c81606201ee21dfa008d69210f75bc890e5b1d001501  body2
```

The UA was passed as one argv, matching the producer's real `spawnSync('curl', argv)` at
`.ufo/waves/round-18/recheck-fetch.mjs:95-96` (`-A`, `'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'`).
The receipt's printed `command` string is not the same thing (finding F5).

Two fetches two seconds apart differ in 193,584 byte positions; `cmp` reports EOF on body1 after byte
695873 (body2 is one byte longer). First difference is byte 201, a CSP nonce:
`<script nonce="F8TiZ2y0DNaZGgQzTbGGEQ">` vs `<script nonce="lAgN66xJ_suDgAmjqdxj6Q">`.

## 2. Decode and quote location (producer's own normalizer)

```sh
node --input-type=module -e "
import {readFileSync} from 'node:fs';
import {decodeBody,normalize} from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs';
const q='Inspect, monitor, and execute WebMCP tools manually or with Gemini';
for (const f of ['body1','body2']) {
  const t=normalize(decodeBody(readFileSync(f),'html-text'));
  console.log(f, t.length, t.indexOf(q));
}"
# body1 5997 394
# body2 5997 394
```

| Observation | body1 (mine) | body2 (mine) | Receipt S057 |
|---|---|---|---|
| HTTP status | 200 | 200 | 200 |
| Body bytes | 695873 | 695874 | 695881 |
| Body sha256 | `7525018fcadd77252f49f46e861fcd06b0facdc050d9ebf25b4778af70fbf411` | `94fb51a97872cb2dd835c81606201ee21dfa008d69210f75bc890e5b1d001501` | `361a9a0f2ec2ebb424c9263eb18d29f10c08e6a83ab1ed6d80bc109b2a18ac2c` |
| Normalized text length | 5997 | 5997 | not recorded (excerpt 1068 B) |
| Normalized text sha256 | `1e1898091ae696122c03befa9f2fcb7030342ae3d8d94913dc951f3d381cc0d8` | same `1e1898…c0d8` | not recorded |
| Quote occurrences / offset | 1 / **394** | 1 / **394** | `quoteFound=true`, `quoteOffset=394` |
| Quote word count | 10 | 10 | `quoteWords=10` |
| Derived excerpt (`±600`, `\n`) | 1068 B, sha256 `2e730a9a453d7ae1b3ed68c38b9c3e15f50123e9fd6cf9e5b33b592ca09e52ae` | same | `excerptSha256=2e730a9a…e52ae` |

The derived excerpt is **byte-identical** to the committed
`corpus/evidence/round-18/source-recheck/S057.excerpt.txt` (sha256 also equal at REV:
`git show REV:...S057.excerpt.txt | sha256sum` → `2e730a9a453d7ae1b3ed68c38b9c3e15f50123e9fd6cf9e5b33b592ca09e52ae`).
So the quote presence, normalized offset 394, word count 10 and excerpt bytes reproduce exactly even
though the raw response digests do not. Per the assignment, raw-body inequality on this dynamic page is
not treated as a falsification; the excerpt/quote are the verifiable content.

Raw HTML locations (body1, `grep -F -b -o`): **534277** `<meta name="description">`, **534479**
`<meta property="og:description">`, **561342** the visible Overview `<p>`, **660040** the
`AF_initDataCallback` item record, **660316** the embedded manifest JSON `"description"`. The normalized
text keeps one occurrence because `html-text` drops tags/scripts. Receipt `quoteOffset`
394 is therefore a normalized-text offset, not a raw-byte offset; that is consistent with the producer
(`sourceExcerpt` at `measure-c1.mjs:238-245`).

## 3. Anchor and source identity

Normalized-text offsets in body1 (each string located once):

| Anchor from receipt `anchorObserved` | Offset | Held? |
|---|---|---|
| `4.9`, `11 ratings` | 236, 242 | yes |
| `20,000 users` | 358 | yes |
| `150.0.7861.0` | 567 (Prerequisites sentence) | yes |
| `1.9.19` | 823 | yes |
| `Updated October 5, 2026` | 830 | yes |
| `Offered by` / `François Beaufort` | 867 / 878 | yes |
| `Google Ireland, Ltd.` | 936 | yes |
| `individual publisher` | **-1 (absent)** | **row anchor cell does not hold** |

`grep -F -c 'individual publisher' body1` → **0**. The raw body also carries the extension manifest at
byte 660419: `"version": "1.9.19", "minimum_chrome_version": "150.0.7861.0", "permissions": [...]`, so
the receipt's phrase “manifest minimum_chrome_version 150.0.7861.0” is observed in the raw body (the
normalized text only carries the same value in the Prerequisites sentence). Source identity held: same
listing URL/id, same title `WebMCP - Model Context Tool Inspector`, same developer card, same
version/update/rating/user anchors. The listing now shows `Offered by François Beaufort` (no publisher
class) and `Developer Google Ireland, Ltd. …` — exactly the S058 correction recorded in
`corpus/SOURCES.md:72`, and the round-17 re-open's Break 1 at
`.ufo/waves/round-17/w2/ReopenS053.md:27-43`.

The receipt's `anchorObserved` deliberately omits the row anchor's `(individual publisher)` phrase; its
`note` at `corpus/evidence/round-18/source-recheck/S057.json:22` says “Anchor cell (individual publisher)
is corrected by S058 per PLAN D4”. So the omission is disclosed inside the receipt, but the C1 counter
never compares `anchorObserved` to the row anchor (see `evaluateReceipt`, `measure-c1.mjs:315-378`), and
the C1 note's table reproduces the false anchor at
`corpus/knowledge/source-recheck-round-18.md:102`.

## 4. Does the quote support `teaches`?

`teaches` for S057 is `supersedes S053 — REJECTED: the listing (developer Google Ireland, Ltd.; offered
by François Beaufort) restates a manual inspect-and-execute workflow and a Chrome 150.0.7861.0 floor but
adds no invocation contract beyond S048 and S041; flip: the listing or the extension source publishes an
invocation API contract` (`corpus/SOURCES.md:71`, cell 6).

- **Manual execution / prerequisites**: supported. Quote says “execute WebMCP tools manually”; excerpt
  contains the full Prerequisites sentence (`chrome://flags` + 150.0.7861.0). But the quote also says
  “**or with Gemini**”, an agent-driven execution path. The row's “manual invocation workflow” wording is
  therefore incomplete; the round-17 re-open already recommended replacing it with “manual-execution
  claim” (`.ufo/waves/round-17/w2/ReopenS053.md:89`), and S058's claim cell uses “manual execution
  workflow” (`corpus/SOURCES.md:72`, cell 4). The receipt's note concedes “scope wording workflow is
  looser than the copy” (`S057.json:22`).
- **“adds no invocation contract”**: the quote alone cannot support an absence. My full-body re-fetch
  does support it for this listing: normalized text has `invoke=-1`, `invocation=-1`, `API=-1`,
  `tool.invoke=-1`, `executeTool=-1`; raw body has `invoke` count 0, `invocation` count 0. The only
  `contract`/`SDK` hits are related-extension descriptions for *other* listings (offsets 2314 and 4267:
  “validates tools, contracts, forms” for WebMCP Ready Checker; “Open-source SDK” for Midscene.js), not
  this listing's copy. But the receipt commits only the quote + 1068-byte excerpt, not the body or an
  absence-scan record; an auditor relying on committed bytes alone cannot re-derive the absence. The C1
  note's own limit says “Quote presence is not claim truth”
  (`corpus/knowledge/source-recheck-round-18.md:139-145`). So `teachesVerdict=held` is true for the
  source as I re-fetched it, but the committed receipt is a partial evidence bundle for the second half
  of `teaches`.

Verdicts: **source identity held; receipt anchorObserved held; row anchor cell drifted (publisher class
false, superseded by S058); teaches held narrowly for manual execution/floor, with the Gemini path
omitted and the absence clause supported only by an uncommitted full-body scan.**

## 5. The count and the freshness scope

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` → exit 0:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
 "status":{"mined":48,"queued":8,"rejected":8},
 "url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

Registry at REV: `git show REV:corpus/SOURCES.md` parses **64** rows (unique ids), not 57. Seven rows
open with `supersedes S… —`: S028, S040, S054, S055, S056, S057, **S058**. Therefore:

- Active rows at REV = 64 − 7 = **57**.
- Receipts = 51 (`json=51`, `excerpt=51` at REV); S057 is one of them but is superseded at REV by S058.
- Active rows with receipts = **50/57**. S058–S064 (7 rows opened this round) have no receipts
  (`git ls-tree … | grep -c S058` → 0).
- The declared target “51 = every row not superseded at B” is met at B: 57 rows − 6 baseline
  supersessions = 51, and 51 receipts. The counter's `eligible_rows=58` is
  `64 − 6` (`measure-c1.mjs:15,465`), i.e. it includes the 7 new rows and S057 and is not the declared
  target denominator. `c1_rows_rechecked=51` is correct for the B-scoped claim; a reader who divides
  51 by `eligible_rows` gets 51/58, which is not the claim's denominator.

`freshness_scope` and the note's §6 explicitly disclaim current product support
(`corpus/knowledge/source-recheck-round-18.md:138-156`), so I do **not** find a text-level confusion of
immutable availability with live product freshness. The one place the note over-infers time is line 146:
it compares the registry's 649153-byte Chromium-UA snapshot with this receipt's 695881-byte recheck-UA
body and concludes “the bytes changed between fetches on one day”. Those are different request
representations as well as different times: the round-17 re-open used Chromium 154 UA and got
649060–649162 B (`.ufo/waves/round-17/w2/ReopenS053.md:6,21-22`), S058's Chromium-UA fetch #3 got
649153 B (`.ufo/waves/round-18/sources/S058Listing.md:19`), while my two recheck-UA fetches got
695873/695874 B. The ~46.7 KB gap tracks the UA/serialization, so the note should not attribute it to
time alone. Digests remain snapshot handles, exactly as the note says elsewhere.

## 6. S029 own-work spot check (git, not network)

```sh
git -C LANE show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json \
  | sha256sum
# b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
git -C LANE show 2bff864fdfee684ddbcd066cc8e735adaba2735c:corpus/evidence/round-13/aria/receipt.json \
  | sha256sum
# b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
```

Observed: 97,073 bytes; quote at normalized offset **74695** = receipt `quoteOffset`; derived excerpt
sha256 `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` = receipt `excerptSha256`
and the committed `S029.excerpt.txt`; receipt `bytes=97073`, `sha256=b458b351…89b7`, `httpStatus=null`;
lane-tip B blob is byte-identical. S029 holds.

## 7. Findings (path:line, finite counterexample)

**F1 — C1 note's row count is stale at REV (minor).**
`corpus/knowledge/source-recheck-round-18.md:11` says “`corpus/SOURCES.md` has 57 rows (S001–S057)”.
At REV the registry has **64** rows (S001–S064; `git show REV:corpus/SOURCES.md | grep -c '^| S[0-9]'` →
64), because S058–S064 were opened this round. The note's header is B-scoped, so this is a scope-wording
defect, not a counter error; fix to “at baseline B, 57 rows; at REV, 64”.

**F2 — “not a superseding row” is unqualified at REV (minor).**
`corpus/knowledge/source-recheck-round-18.md:146` says the S057 digest mismatch is “a limit on the row,
not a superseding row, because the claim it quotes is still present.” The sentence is about the digest,
but reads row-wide. At REV,
`corpus/SOURCES.md:72` is a **superseding row**: `S058 … supersedes S057 — REJECTED: listing names
developer Google Ireland, Ltd. …`. Line 136 acknowledges the correction is “outside this note”, so the
fix is to qualify line 146 (“not a superseding row for the digest; S058 supersedes S057 for the
publisher/claim wording”) and to cite S058 in §5.

**F3 — C1 note reproduces the falsified S057 anchor without an inline marker (minor).**
`corpus/knowledge/source-recheck-round-18.md:102` prints the anchor as “`listing fetched 2026-10-20,
Offered by François Beaufort (individual publisher), …`”. The live 695873-byte body contains **0**
occurrences of `individual publisher` (`grep -F -c` → 0), and the excerpt itself contains `Developer
Google Ireland, Ltd.` with no such class; S058's dossier F6/F7 says “no publisher class is stated here”
(`.ufo/waves/round-18/sources/S058Listing.md:37-38`). The receipt's own `note` already says the anchor is
corrected by S058 (`S057.json:22`), but `evaluateReceipt` never compares `anchorObserved` to the row
anchor (`measure-c1.mjs:315-378`), so a `held` receipt can coexist with a false anchor. The row bytes
stay per SOURCES append-only; the note table should mark the cell `superseded by S058`.

**F4 — `teachesVerdict=held` is only partly supported by committed bytes (moderate evidence-scope).**
The quote supports “execute … manually” and the excerpt supports the Prerequisites; the quote does not
support “adds no invocation contract”. That absence is confirmed by a whole-body scan (my re-fetch:
`invoke=0`, `invocation=0`; normalized `API=-1`, `executeTool=-1`), but the receipt commits only the
quote and 1068-byte excerpt, and no absence-scan record. Also the quote's “or with Gemini” is an
execution path the “manual invocation workflow” phrasing drops; the round-17 re-open had already
recommended “manual-execution claim” (`.ufo/waves/round-17/w2/ReopenS053.md:89`), and S058's claim cell
adopts that wording (`corpus/SOURCES.md:72`, cell 4). The claim is true as re-fetched; the receipt's
committed evidence is not sufficient by itself.

**F5 — The recorded `command` is not shell-executable (minor reproducibility).**
`corpus/evidence/round-18/source-recheck/S057.json:7` records
`-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18` unquoted. `bash -n -c "<that command>"`
→ `bash: -c: line 1: syntax error near unexpected token '('`, exit **2**. The producer's real argv is a
single `-A` value (`recheck-fetch.mjs:95`), and the counter's `expectedCurlCommand`
(`measure-c1.mjs:233-236`) reproduces the same unquoted join, so no check catches it. The receipt's
bytes/quote are still valid; the `command` field should be quoted (or recorded as JSON argv).

**F6 — The 51 count includes a row superseded at REV and excludes the 7 new rows (minor measurement
boundary).**
At B the claim is exact: 51/51 active rows have receipts. At REV: 64 rows, 7 superseded (S057 included),
57 active, 50 active rows with receipts, 7 active rows without (S058–S064). `eligible_rows=58` is
`64−6`, not the 51 target. This is not a falsification of the B-scoped claim, but the measured revision's
freshness coverage is 50/57 active rows, and the successor S058 has no recheck receipt. State the
denominator/label explicitly when the scalar is promoted.

**F7 — Dynamic-body digest is a snapshot, not an identity (informational, expected).**
Receipt 695881 B / `361a9a0f…ac2c`; my two same-UA fetches 695873 B / `7525018f…f411` and 695874 B /
`94fb51a9…1501`; normalized text identical (`1e189809…c0d8`) and excerpt identical. The receipt's raw
digest cannot be re-derived; quote/excerpt can. This matches the note's §6 warning and the round-17
finding (`.ufo/waves/round-17/w2/ReopenS053.md:21-24`). Do not compare raw digests across runs; do not
read the 649153→695881 byte change as time drift without holding UA constant (see §5).

**F8 — S029 own-work holds (informational).**
Pinned commit `837b33a…`, blob sha256 `b458b351…89b7`, 97073 B, quote offset 74695, excerpt sha256
`80b5de21…96ff`, lane-tip B blob identical. No network was used for S029.

## 8. Finite limits

- One public URL, two independent GETs, one host, 2026-10-20. No browser, no JS execution, no profile,
  no authenticated content. Public-source GET only.
- Raw-body equality is not claimed and was not required; the dynamic page's CSP nonce and embedded JSON
  rotate per response. The quote/excerpt comparison is the stable test.
- The absence claim (“no invocation contract”) was checked on one listing body and one Chromium-UA body
  via the S058 dossier; no extension source/XPI was fetched, so the row's flip condition's second
  disjunct (“extension source publishes …”) remains unobserved, not refuted.
- `measure-c1.mjs` was run once without `--live`; `--live` would re-fetch all 51 and is not needed to
  answer the S057 question. The producer was imported, not executed; nothing was written to the lane.
- A quote found is not a truth proof, as the C1 note itself states. The findings above are about receipt
  validity, anchor coverage, and note wording, not about any runtime WebMCP behavior.

## 9. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS057.md` (this report)
- Temporary sandbox `/tmp/tabi-r18-s057-5DRubL` and helper files `/tmp/s029probe.mjs`,
  `/tmp/rowprobe.mjs`, `/tmp/tabi-r18-s057-dir` were deleted after the report; no lane file was changed.
