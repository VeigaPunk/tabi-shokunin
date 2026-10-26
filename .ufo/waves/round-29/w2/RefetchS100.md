# RefetchS100 — C3 independent re-fetch and hostile check of row S100

Seat `RefetchS100` (leaf, wave w2 = falsify), lane tip `32008a453737a27f69e9ab401d0b9775d2a944f7`,
branch `master`, baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`. Claims read first:
`.ufo/waves/round-29/claims.json` (C3). All work in a clean `git clone --shared` at the tip
(`git status --porcelain` → 0 lines) plus a copy of it for fixtures; scratch
`/fast/scratch/hyaku/tabi-r29/RefetchS100` (removed at the end; receipts copied here).

**Headline.** My independently fetched bytes agree with the committed receipt on both tags and
with the row's declared 154 digest, the S115 declared 156 digest, the S115 `blob b3611221`, and
both tag→commit ids. My recomputed verdict for S100 is **drifted**, which agrees with the
counter's rule and with the S115/knowledge-note reading. Three gate defects and one row-text
defect are reproducible with line evidence (A1–A5 below). The most consequential: **at tip the C3
counting command cannot produce a verdict for S100 (or any row) at all** — `unresolved=23`,
because no re-fetch record is committed at the path the counter reads, and the wave's own
instruction writes records somewhere else.

---

## 1. My fetches (never PinS100's bytes)

```
curl -sS -o raw.<tag>.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT'
base64 -d  raw.<tag>.b64 > fhe.<tag>.cc ; sha256sum fhe.<tag>.cc
```
Exit 0 throughout; both GETs repeated once (two independent requests) and byte-identical
(`cmp -s`, `RefetchS100.fetch-log.txt`):

| tag | http | raw b64 bytes | decoded bytes | decoded sha256 (mine) | 2nd fetch |
|---|---|---|---|---|---|
| 156.0.8078.47 | 200 | 92716 | 69536 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` | identical |
| 154.0.8037.97 | 200 | 91040 | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | identical |

Receipt `corpus/evidence/round-29/release-pins/receipt.json` (entry `id=S100`,
`fetched_by=PinS100`, `fetched_at=2026-10-26T04:27:53Z`, `superseded_by=S115`):

| field | receipt | mine | agree |
|---|---|---|---|
| `new_status` | 200 | 200 | yes |
| `new_sha256` | `2a96…6102` | `2a96…6102` | **yes** |
| `old_status` → `old_sha256` | 200 → `8c8d…6916` | 200 → `8c8d…6916` | **yes** |
| committed bytes vs my bytes | — | `cmp` equal for both tags | **yes** (bytes authentic, not re-encoded) |

Provenance cross-checks (Gitiles `+/refs/tags/<tag>?format=JSON`, http 200 both):
tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (S100 anchor: same);
tag `156.0.8078.47` → commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (S115 anchor: same).
`git hash-object fhe.156.0.8078.47.cc` → `b3611221ba58efc420f5fa627aa30b14a75b4a77` (S115 anchor
`blob b3611221`: same). Three independent artifacts therefore corroborate my 156 bytes.

Written: `.ufo/waves/round-29/w2/refetch/S100.json` — schema as the sibling records, values from my
fetch (`fetched_at` `2026-10-26T05:28:04Z`, the completion instant of the timestamped GET).

**404 rule (item 5): not applicable.** Both tags returned 200 for S100's file, so no `request_id`
normalisation applies; raw sha256 = normalised sha256 for this seat (no committed 404 body involved).

## 2. My recomputed verdict vs the counter

Rule re-implemented verbatim from `scripts/check-release-pins.mjs` (`normLine` = trim + collapse
inner whitespace, `blockIn` = contiguous anywhere; `:157-171`, `:239`), applied to **committed
154 bytes + my 156 bytes**, ranges `[[174,328],[635,842]]` from the receipt
(`RefetchS100.recompute.json`, exit 0):

| range | old lines | holds in my 156 bytes | first contiguous occurrence |
|---|---|---|---|
| 174-328 | 155 | **no** | none (guard inserted mid-block) |
| 635-842 | 208 | **yes** | 673 (→ 673-880, exact, raw-line equal) |

⇒ **verdict = drifted** (not "holds"); no whole-file fallback applies because ranges are present.

Counter, same content, at the tip:

```
node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 \
     --stable 156.0.8078.47 --json          # exit 1
{ population: 23, unresolved: 23, holds: 0, drifted: 0 }
S100 -> { resolved: false, verdict: null, reasons: ["f6-refetch third_party/.../html_form_element.cc"] }
```
So at REV the counter never reaches the range computation for S100; the drift reading exists only in
my independent recompute. With **my** record planted at the counter's read path (fixture
`fx`, own scratch repo, `git -C fx` only), the counter agrees with me:

```
node scripts/check-release-pins.mjs --repo fx --rev HEAD --stable 156.0.8078.47 --json   # exit 1
{ unresolved: 22, resolved: 1, holds: 0, drifted: 1 }
S100 -> { resolved: true, verdict: "drifted", reasons: [] }        # supersession by S115 accepted
```

**Verdict agreement: yes** (drifted), once the record is where the counter looks.

## 3. S115 — is the superseding row true of the 156 bytes?

`corpus/SOURCES.md:129`: source `…/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc`,
anchor `tag 156.0.8078.47 commit 1d17a2e2…; html_form_element.cc:175-339,673-880; blob b3611221;
decoded sha256 2a96…6102`, teaches `supersedes S100 — the 154 anchored blocks now sit at 175-339
and 673-880 with every 154 line preserved in order, except a 10-line guard added at 201-210 …`.
Verified mechanically (`RefetchS100.s115-check.json`, my 156 bytes, exit 0):

| claim | result |
|---|---|
| decoded sha256 `2a96…6102` | **true** (my fetch) |
| blob `b3611221` | **true** (`git hash-object` → `b3611221ba58…`) |
| commit `1d17a2e2…` | **true** (Gitiles tag ref) |
| block 2 sits at 673-880 | **true**: `new[673..880]` equals `old[635..842]` raw-line for raw-line (`range2_exact: true`) |
| block 1 sits at 175-339 with one 10-line insertion | **true**: `new[175..339]` with `new[201..210]` deleted equals `old[174..328]` exactly (`range1_exact_after_removing_201_210: true`) |
| the 10-line guard is at 201-210 and fails the invocation | **true**: `if (!form_->GetDocument().IsActive())` at 203, `ScriptToolErrorCode::kToolInvocationFailed` at 206, message literals at 207/208 |
| teaches: "every 154 line preserved in order, except a 10-line guard" | **true only within the two anchored blocks; false for the file** — see A4 |
| the located quote occurs at the stated line(s) | **qualified false** — see A5 |

### A5 (row-text) — the "located quote" is a joined literal pair, not a located line

`.ufo/waves/round-29/w1/pins/S100/supersede-row.md` records, as a "Quote from the 156.0.8078.47
bytes (9 words, located)": `The document was detached while filling out the form`, cited
`:207-208`, and adds "no line of the 154 file carries this text".

```
grep -c 'The document was detached while filling out the form'  fhe.156.0.8078.47.cc   -> 0
grep -c 'The document was detached while filling out the form'  fhe.154.0.8037.97.cc   -> 0
156:207    "The document was detached while filling out "
156:208    "the form")));
```
The phrase is the **runtime string** of two adjacent C++ literals (207 + 208); it is not a substring
of any line in either file. The citation range is right and the runtime message is right, but the
sentence "no line of the 154 file carries this text" is true of the 156 file too, so it reads as
evidence of a difference that the source text does not carry. Smallest correction: quote the two
fragments with their line numbers, or annotate "adjacent string literals, 207 + 208".

## 4. Filing completeness (item 4)

`RefetchS100.filing.txt`. Anchor-cited files: `html_form_element.cc` (1). Anchor-cited ranges:
`174-328`, `635-842` (2) — plus a commit id and the full 154 digest, neither of which is a range.
Teaches-cell range: `787-815` (LC11), inside filed range 635-842. Receipt files: 1, receipt ranges:
`[[174,328],[635,842]]`.

- cited file absent from the receipt: **none**
- cited range absent from the receipt: **none**
- receipt range not cited by the anchor: **none**

⇒ **S100's filing is complete** relative to its own anchor; the wave-1 "subset filing" attack has no
instance on this row. It does, however, generalise — see A2, which needs no anchor mismatch at all.

## 5. Attacks on the gate (evidence, not repair)

### A1 — At tip, C3's own counting command yields `unresolved=23`; the refetch path is split

`scripts/check-release-pins.mjs:72` `const REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch";`
and `:217-220` read only that path (`git show <rev>:<REFETCH_ROOT>/<id>.json`).
`git ls-tree -r --name-only 32008a4 -- corpus/evidence/round-29/release-pins/` → 48 paths (46 byte
files = 23×2, `receipt.json`, `chromiumdash-stable-linux.json`); **no `refetch/` directory exists**,
so every row dies at `f6-refetch` before ranges (`:220 continue`), `holds=drifted=0`.
Meanwhile this wave's instruction writes records to `.ufo/waves/round-29/w2/refetch/<id>.json`, a
path the counter never reads. Predicted integration result, measured now by copying the 23 w2
records into the counter's path in a scratch fixture (`RefetchS100.counter-all-w2-refetches.json`):

```
node scripts/check-release-pins.mjs --repo fx-all --rev HEAD --stable 156.0.8078.47 --json   # exit 0
{ population: 23, unresolved: 0, resolved: 23, holds: 16, drifted: 7 }
drifted: S042 S071 S078 S080 S081 S096 S100
```
That matches `corpus/knowledge/chromium-156-release-pin-recheck.md` ("16 rows hold, 7 drifted")
exactly, and `RefetchS100.w2-refetch-coverage.txt` shows all 23 ids present as of 05:36Z. So the
claim's number is reachable — but only after a commit that copies `w2/refetch/*.json` into
`corpus/evidence/round-29/release-pins/refetch/`. **As committed at 32008a4 the predicate's target
is false** (`unresolved=23`), which is the pre-data `before` value, i.e. at tip the claim is
numerically indistinguishable from the baseline.

### A2 — Subset filing flips a drifted row to "holds" and skips the supersession requirement

`f4-ranges` (`:33`, `:232-241`) only requires each *filed* range to appear as a token in the anchor
cell; nothing requires the filed set to cover the anchor's cited ranges, and `:249` derives the
verdict from the filed ranges alone. Dropping the drifted range from S100's receipt
(`ranges = [[635,842]]`, anchor cell untouched, my refetch record present):

```
node scripts/check-release-pins.mjs --repo fx-subset --rev HEAD --stable 156.0.8078.47 --json  # exit 1
S100 -> { resolved: true, verdict: "holds", reasons: [] }        { unresolved: 22, holds: 1, drifted: 0 }
```
The row is certified **fresh** although block `174-328` no longer occurs at 156, and the `s1-drift`
check (`:250-253`) never runs because the verdict is not `drifted`. S115 then becomes an orphan
`supersedes S100` row that nothing reconciles, since S115 itself is outside the population (its only
tag equals `--stable`). This is a *stronger* form of the wave-1 subset observation: the subset need
not be merely under-filed, it can suppress the supersession requirement entirely.

### A3 — The superseding row's declared digest is never verified (false provenance admitted)

`:252` accepts a superseder on `teaches.startsWith("supersedes <id> —")` and
`source.includes("refs/tags/<stable>/")` only. Zeroing S115's declared `decoded sha256` in
`corpus/SOURCES.md` (3 occurrences of the shared 156 digest, fixture `fx-badsup`):

```
node scripts/check-release-pins.mjs --repo fx-badsup --rev HEAD --stable 156.0.8078.47 --json   # exit 1
S100 -> { resolved: true, verdict: "drifted", reasons: [] }
```
Unchanged. A superseding row may therefore carry any digest/range text — the 156 evidence for it is
never bound. (Here the digest happens to be right; nothing in the gate knows that.)

### A4 — S115's drift rationale is arithmetically incomplete; "every 154 line preserved" is false above the anchor

My own diff of committed 154 vs my 156 bytes (`RefetchS100.diff-154-156.txt`): **+48 / −27** lines in
**8 hunks**; only hunk 2 (+10 at 156:201-210) lies inside an anchored range.

| hunk (154 numbering) | +/− | inserted at 156 | inside an anchor? |
|---|---|---|---|
| 129-134 | +1 | 126 (`is_connected_nested_form_(false)`) | no |
| 203-208 | +10 | 201-210 (detached-document guard) | **yes** |
| 365-370 | +7 | 373-379 (sandbox `kScripts` early return) | no |
| 471-476 | +5 | 486-490 (`IncrementConnectedNestedFormCount`) | no |
| 521-526 | +15 | 541-555 (nested-form decrement + autofill invalidation) | no |
| 1206-1220 | +7/−8 | 1232-1239 | no |
| 1223-1238 | +3/−8 | 1247-1249 | no |
| 1741-1757 | −11 | (deletes `NotifyEmailVerificationTokenFieldChanged`, 154:1727-1737) | no |

Deleted 154 lines: 1194-1201, 1212-1219, 1727-1737 (27).

Consequences for the row text and the gate:

1. The second block's shift is **+38** (635→673, 842→880). Only 10 of those 38 lines are the guard;
   the other 28 come from hunks 1, 3, 4, 5 — **outside** the anchor. S115's sentence attributes the
   move to "a 10-line guard added at 201-210", so a reader recomputing the new position from the
   stated cause gets 645, not 673. The counter's `blockIn` still finds the block (it searches
   anywhere), so the gate is silent about the explanation being wrong.
2. "with every 154 line preserved in order" is **false as a file-level claim**: 27 154 lines are
   gone (email-verification indicator path), and the constructor/insert/remove paths gained a
   `is_connected_nested_form_` counter. It is true only of the two anchored blocks (verified exact).
3. The only WebMCP-behavioural change outside the anchor — `ScheduleDeclarativeWebMCPToolRegistration()`
   now returns early for sandboxed documents without `allow-scripts` (156:373-379, comment
   "Declarative WebMCP tools require script execution capability…") — is in the exact function S115's
   teaches cell topic ("declarative form lifecycle branches") covers, and it appears in neither S115
   nor the recheck note's change list. The note's change section is scoped "inside anchored ground",
   so this is out of its declared scope, but a reader who takes S115 as the current 156 reading of
   this file gets a registration-eligibility rule that omits a new exclusion. The gate cannot see it:
   range scope is the anchor, and the same blind spot applies to the three superseding rows for this
   file (S111/S114/S115) and to the rows they replace (S078/S096/S100).

### What S100 itself gets right (no finding)

The 154 digest, the tag commit, the two 154 ranges, the drift call, and the supersession link are all
correct and reproduced independently. Nothing in this report asks for a change to S100's row.

## 6. Impacted axes and smallest safe corrections

Axis: **freshness** (C3) only — nothing here touches C1's operability code or C2's tallies
(`sep` claim holds for this row: S100's evidence is untouched by either).

Smallest safe corrections, in order of blast radius:

1. **Integration (blocking C3's number):** commit the 23 `w2/refetch/<id>.json` records to
   `corpus/evidence/round-29/release-pins/refetch/`, the path named at `check-release-pins.mjs:72`,
   then re-run the claims' counting command; at 32008a4+that commit the counter yields
   `population=23 unresolved=0 holds=16 drifted=7` (measured, `RefetchS100.counter-all-w2-refetches.json`).
   If instead the wave path is intended to be authoritative, the constant must move — one of the two,
   not both left differing.
2. **f4 coverage:** require the receipt's filed range set to cover every range token in the anchor
   cell (or refuse `ranges` that are a strict subset), so A2's `holds` cannot be produced by
   omission. One added condition next to `:234`, one new reason id.
3. **s1 binding:** check the superseding row's declared digest against the stable bytes (and that its
   cited ranges resolve) instead of `teaches` prefix + source tag alone (`:252`).
4. **S115 teaches cell:** replace the causal sentence with the arithmetic — "the second block's +38
   offset = 10-line guard at 201-210 plus 28 lines inserted outside the anchor (156:126, 373-379,
   486-490, 541-555); 27 154 lines outside the anchor are deleted (154:1194-1201, 1212-1219,
   1727-1737)" — or extend the anchor to include 373-379 and say so.
5. **Quote form (w1 artifact):** cite 207 and 208 as two adjacent literals, not as one located line.

## 7. Commands run (all exit codes)

| # | command | exit |
|---|---|---|
| 1 | `curl … refs/tags/156.0.8078.47/…?format=TEXT` (×2, http 200) + `base64 -d` + `sha256sum` | 0 |
| 2 | `curl … refs/tags/154.0.8037.97/…?format=TEXT` (×2, http 200) + decode + hash | 0 |
| 3 | `git clone --shared … && git checkout 32008a4… && git status --porcelain` (0 lines) | 0 |
| 4 | `node recompute.mjs` → verdict drifted | 0 |
| 5 | `node verify-s115.mjs` → range2_exact, range1_exact, phrase absent both files | 0 |
| 6 | `node scripts/check-release-pins.mjs --rev 32008a4… --stable 156.0.8078.47 --json` | **1** (unresolved 23) |
| 7 | `node … --repo fx` (my record filed) → S100 resolved/drifted | 1 |
| 8 | `node … --repo fx-subset` (range dropped) → S100 holds | 1 |
| 9 | `node … --repo fx-badsup` (S115 digest zeroed) → S100 still resolved/drifted | 1 |
| 10 | `node … --repo fx-all` (all 23 w2 records) → 23/0/16/7 | **0** |
| 11 | `curl … +/refs/tags/154.0.8037.97?format=JSON`, `…156.0.8078.47?format=JSON` | 0 (200/200, ids match) |
| 12 | `git hash-object fhe.156.0.8078.47.cc` → `b3611221ba58…` | 0 |

No tool was installed or upgraded in this seat (node v24.21.0, git, curl, jq, base64 — all present;
`pacman` untouched).

## 8. Deliverables in this directory

- `refetch/S100.json` — re-fetch record (my bytes, normalised = raw, status 200)
- `RefetchS100.md` — this report
- `RefetchS100.fetch-log.txt`, `RefetchS100.filing.txt`, `RefetchS100.w2-refetch-coverage.txt`
- `RefetchS100.recompute.json`, `RefetchS100.s115-check.json`
- `RefetchS100.counter-at-tip.json`, `RefetchS100.counter-with-refetch.json`,
  `RefetchS100.counter-subset-filing.json`, `RefetchS100.counter-badsup-digest.json`,
  `RefetchS100.counter-all-w2-refetches.json`
- `RefetchS100.diff-154-156.txt` (my 154↔156 diff)
