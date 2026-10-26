# RefetchS078 — C3 independent re-fetch and attack of row S078

Seat: `RefetchS078` (leaf, critic/attack), round 29, wave w2. No lane tracked file, index,
jj state or sibling repo was written. Scratch: `/fast/scratch/hyaku/tabi-r29/RefetchS078`
(`HYAKU_SCRATCH=/fast/scratch/hyaku`), one `git clone --shared` of the lane, no subagents.

Deliverable: `.ufo/waves/round-29/w2/refetch/S078.json` (values from my own fetch).
Receipts: `.ufo/waves/round-29/w2/refetch/RefetchS078.*` (counter runs, fixture runs, fetch log,
versions). Decoded bytes stayed in scratch and were deleted with it.

Note for the integrator: the w2 refetch directory in the working tree later filled with sibling
`S*.json` records (S033…S106) after my measurements; none of them is committed at either measured
revision, and the frozen counter reads committed blobs only, so the tip numbers below are
unaffected. Landing them all (plus `S078.json`) is what closes A1.

Measured revisions: `32008a453737a27f69e9ab401d0b9775d2a944f7` (as instructed) and, because the
live branch is two commits further on, `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (actual
`master` HEAD). Clean clone, `git status --porcelain` = 0 lines before any read.

## 1. Fresh fetch (own curl, own transfer; wave-1 bytes not reused)

Path: `third_party/blink/renderer/core/html/forms/html_form_element.cc`
URL form: `https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT`,
`base64 -d` (exit 0 both), HTTP status kept.

| tag | HTTP | decoded sha256 | receipt field | agree? |
|---|---|---|---|---|
| 154.0.8037.97 | 200 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `old_sha256` same | **agree** |
| 156.0.8078.47 | 200 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` | `new_sha256` same, `new_status` 200 | **agree** |

`fetched_at` in the refetch record is the mtime of my 156 transfer: `2026-10-26T05:17:46Z`
(02:17:46 -0300). The base64 payload digests (`ff55d511…`, `b7a3fae8…`) coincide with wave-1's
fetch log because Gitiles deterministically base64-encodes the same blob; independence is the
separate transfer, not a differing encoding. Both decoded payloads start with the Chromium
copyright header and end with `}  // namespace blink`.

Tag identity (Gitiles `?format=JSON`, HTTP 200 each): 154 tag commit
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (matches S078's anchor commit claim), 156 tag commit
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (matches the commit quoted in S109/S110).

Committed receipt bytes at 32008a45 compared byte-for-byte with my decoded fetches:
`identical True` for both tags. `f3-bytes` is therefore externally corroborated, not merely
self-consistent.

## 2. Verdict recomputation (counter rule, then the frozen counter itself)

Rule implemented independently from `scripts/check-release-pins.mjs` (`blockIn`: per line
`trim()`, inner whitespace collapsed, old slice must occur as one contiguous run anywhere in the
new line array):

| range (154 lines) | slice len | contiguous hit in 156 | verdict |
|---|---|---|---|
| 174-328 | 155 | none | **drifted** |
| 635-842 | 208 | line 673 | **holds** |

Row verdict: **drifted** (one file, one of two ranges broken) → superseded.

Frozen counter at the instructed tip:

```
node scripts/check-release-pins.mjs --repo <clone> --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 \
  --stable 156.0.8078.47 --json        -> exit 1
population 23, resolved 0, unresolved 23, holds 0, drifted 0, clean false
S078: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/core/html/forms/html_form_element.cc"]}
```

Same at actual HEAD `e1e3a15`: `population 23, resolved 0, unresolved 23`, S078 again
`["f6-refetch …/html_form_element.cc"]`. Every unresolved reason in the whole population is
`f6-refetch`; no other reason appears.

Cause: `corpus/evidence/round-29/release-pins/refetch/` **does not exist** at 32008a45 or at
e1e3a15 (`git ls-files 'corpus/evidence/round-29/release-pins/refetch/*'` → empty; `git ls-tree -r
e1e3a15 | grep -i refetch` → only fixture/attack files). `f6` runs before `f4`, so the tip run
short-circuits before range checking; it proves only that `f1`-`f3` and `f5` pass for S078.

Verdict agreement, tested with my record present. Fixture `fx-base` = the real S078 row copied
verbatim from `corpus/SOURCES.md` + the real receipt entry + both committed byte files + my
`S078.json`:

```
--repo fx-base --rev HEAD --stable 156.0.8078.47  -> exit 0
{"population":1,"resolved":1,"unresolved":0,"holds":0,"drifted":1}
S078: {"resolved":true,"verdict":"drifted","reasons":[]}
```

Full-tree fixture (git archive of 32008a45 into a fresh fixture repo + only my `S078.json` under
`corpus/evidence/round-29/release-pins/refetch/`) → `population 23, resolved 1, unresolved 22,
drifted 1`; the single resolved row is S078 and all 22 remaining reasons are `f6-refetch`.
So: **my recomputed verdict (drifted, resolved via S111) agrees with the counter's computed
verdict once an independent re-fetch record exists; at the instructed tip the counter reaches no
verdict at all because no re-fetch record was integrated.**

## 3. S111 supersession audit (156 bytes, my fetch)

Row: `corpus/SOURCES.md:125`, source `…/refs/tags/156.0.8078.47/…/html_form_element.cc?format=TEXT`,
anchor `tag 156.0.8078.47; html_form_element.cc:175-339, 673-880; decoded sha256 2a96a97b…6102`.

| claim | evidence from my 156 bytes | true? |
|---|---|---|
| digest `2a96a97b…86102` | decoded sha256 is exactly that | yes |
| range `175-339` is the anchored code at 156 | line 175 = `void HTMLFormElement::HTMLFormMcpTool::ExecuteTool(` = 154 line 174; line 339 = `}` = 154 line 328; 175-339 = old 174-328 plus the 10-line guard, no other change inside the span | yes |
| range `673-880` | 156:673-880 is byte-identical to 154:635-842 (208 lines, slice comparison True; first line `void HTMLFormElement::PrepareForSubmission(const Event* event,`), exactly the +38 offset | yes |
| guard exists, `ScriptToolError kToolInvocationFailed`, text "The document was detached while filling out the form" | 156:203 `if (!form_->GetDocument().IsActive()) {`; 206 `ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,`; 207-208 `"The document was detached while filling out "` + `"the form")));`; 209 `}` | yes |
| guard sits before the submit-or-focus branch | guard 203-209; success comment 211 `// Success. Now we can either submit the form or focus the submit button.`; `is_currently_running_ = true;` at 215 | yes |
| drafter's located quote at stated 156 line (`w1/pins/S078/supersede-row.md`) | 156:201 `  // Filling out the form controls dispatches \`input\` and \`change\` events,`; 156:202 `  // whose handlers may have detached the document.` — exact leading spaces, 17 words | yes |
| "range 635-842 holds byte-identically … (cmp exit 0)" | slice equality True | yes |

Boundary/imprecision findings (no verdict impact):

- **Insertion-window ambiguity.** `difflib` opcodes place the 10 inserted lines at
  `new 199-208` (`insert old 198-197`), while the draft says "inserted after old line 197, i.e.
  156 lines 201-210". Both are text-equivalent because 154:198-199 (`'  }'`, `''`) recur verbatim
  at 156:209-210; the guard branch itself is 203-209 as stated. The fetch log's own partition
  ("old 174-197 == new 175-198; inserted new 201-210; old 198-328 == new 209-339") mixes the two
  alignments: if old 174-197 sits at 175-198 and old 198-328 at 209-339, the gap is 199-208, not
  201-210. Cosmetic; every cited anchor range (175-339, 673-880) and every counter check passes.
- **"content otherwise identical"** is true of the anchored span only. Whole-file diff between the
  two tags has 10 non-equal opcodes, 48 inserted and 27 deleted lines. Outside the guard: insert at
  156:126 (`is_connected_nested_form_(false),`), 373-379 (sandboxed `allow-scripts` check),
  486-490 and 540-554 (connected-nested-form tracking), 1232-1238 and 1247-1249 (autofill
  invalidation), deletes at old 1195-1202 / 1212-1219 (email-verification token notification),
  old 1729-1739 (its definition). S111's scope cell scopes the row to the anchored code, so the
  clause is defensible if read as written; read as a whole-file statement it overstates stability.
- "input/change handlers … can deactivate the document": source comment says handlers "may have
  detached the document" and the guard tests `IsActive()`; the exact returned text says
  "detached". Paraphrase is loose but not false for the failure it cites.

## 4. Filing completeness of S078's receipt entry

Anchor cell (`SOURCES.md:92`) cites exactly one file and two ranges:
`html_form_element.cc:174-328, 635-842` (+ full decoded sha256 `8c8d6796…6916`).
Receipt entry (`receipt.json` rows[S078]) files: that same path, `ranges [[174,328],[635,842]]`,
`old_tag 154.0.8037.97`, `old_status/new_status 200`, `old_sha256/new_sha256` = my digests.
→ **no cited file or range is missing from the entry; no receipt range is uncited by the anchor.**
S078's filing is complete; the counter's general subset-filing weakness is not instantiated here.

## 5. Attack findings

**A1 (blocker for C3 as integrated).** C3's predicate is `unresolved = 0`, but at the instructed
revision `32008a45` (and at live HEAD `e1e3a15`) the counter reports
`population 23 / unresolved 23`, every row solely `f6-refetch`, because no
`corpus/evidence/round-29/release-pins/refetch/<id>.json` exists in the tree. Wave-1 produced
`entry.json`/drafts but no re-fetch records; the w2 records were not yet integrated when the
assignment named the tip. This is an integration gap, not an S078 data defect: the full-tree
fixture with only my record proves S078 resolves and the other 22 rows then fail solely for their
own missing records. Line evidence: `scripts/check-release-pins.mjs:40-42,72,217-220` (f6 contract
and short-circuit before f4), empty `git ls-files` result at both revisions.

**A2 (counter accepts subset filing).** Fixture `fx-subset`: S078 anchor extended to
`html_form_element.cc:174-328, 635-842, 729-758` while the receipt still files only two ranges →
counter exit **0**, `resolved 1, drifted 1`. A row may therefore cite more anchors than it files;
`f4` only validates ranges that appear in the receipt (`check-release-pins.mjs:222-241`).
S078's real row is not affected (section 4).

**A3 (supersession row content is never validated).** Fixture `fx-bogussup`: S111's anchor
replaced by `html_form_element.cc:1-2; decoded sha256 deadbeef…` (false ranges, false digest),
teaches prefix intact → counter exit **0**, S078 resolved. Fixture `fx-unrelatedsup`: S111's
source changed to an unrelated 156 file (`script_tools/model_context.cc`) → counter exit **0**,
S078 resolved. `s1-drift-unsuperseded` checks only the teaches prefix `supersedes S078 —`
(U+2014 confirmed) and `refs/tags/156.0.8078.47/` in the source
(`check-release-pins.mjs:265-271`). Consequence: the supersession half of C3's predicate is
unfalsifiable by the counter; the truth of S111 rests on this audit (section 3), not on the gate.
The safe reading is that the gate proves "a row exists", not "the row is correct".

**A4 (re-fetch independence is self-declared).** `f6` requires only a different `seat` string and
matching path/tag/status/sha. A fabricated record by a second seat, or copied old bytes with a
matching fabricated sha, passes (`f6` compares to `new_sha256`, `check-release-pins.mjs:217-220`).
`f3` binds only the committed path, never the HTTP provenance. My seat's value is precisely that
its digest was obtained by a separate transport; the gate cannot enforce that.

**A5 (range check nuance).** `f4` bounds ranges by the *old* line count and only requires the
token to appear in the anchor cell. For a 156-pinned row re-checked at 157, the ranges are 156
line numbers, so the semantics stay coherent; but a superseding row's cited ranges are never
bound to its own `new`/old bytes (A3). No S078 impact.

**A6 (404 rule).** Not applicable to S078: both fetches are 200 and no 404 body was normalised.
Raw and normalised sha256 are identical (`2a96a97b…86102`); receipt `normalization` does not
apply to this entry.

## 6. Impacted axes, tradeoffs, smallest safe correction

- Axes: **freshness** (primary; C3), **operability** (the gate's f6 wiring is the repair site),
  **calibration** (C3's target is presented as achieved only if the tip actually measures 0).
- Tradeoff the canonical judge must weigh: the counter's f6/s1 are deliberately cheap structural
  checks; making them semantic (verify the superseding row's ranges/digest, require a fetch
  provenance record) is a real design change, not a bug fix. Meanwhile the claim text for C3 is
  honest about what s1 requires ("a superseding registry row opening `supersedes <id> —` pinned
  at the 156 tag"), so A2/A3 are weaknesses of the gate, not false claim wording.
- Smallest safe correction (owner: integrator, not this seat): land the w2 re-fetch records at
  `corpus/evidence/round-29/release-pins/refetch/<id>.json` (one per population row, seat ≠
  `fetched_by`), then re-run C3's counting command at the integrated tip; S078's record is
  `w2/refetch/S078.json` and resolves the row as `drifted` via S111. Do **not** weaken C3's
  predicate to accept missing f6 records. If the supersession content must be gate-enforced
  rather than audited, add to `s1` a check that the superseding row's anchor ranges are within its
  own `refs/tags/<stable>/<path>` bytes and that any sha256 in its anchor matches those bytes;
  until then, record in the C3 measure receipt that S111's truth is audit-backed (this report),
  not gate-backed.

## 7. Commands and exit codes (this seat)

```
git clone --shared <lane> lane && git -C lane checkout 32008a4537… ; git -C lane status --porcelain | wc -l   -> 0
curl …/refs/tags/154.0.8037.97/<path>?format=TEXT -w '%{http_code}'  -> 200 (base64 -d exit 0)
curl …/refs/tags/156.0.8078.47/<path>?format=TEXT -w '%{http_code}'  -> 200 (base64 -d exit 0)
curl …/+/refs/tags/{154.0.8037.97,156.0.8078.47}?format=JSON          -> 200, 200
node scripts/check-release-pins.mjs --repo <clone> --rev 32008a45… --stable 156.0.8078.47 --json   -> exit 1
node scripts/check-release-pins.mjs --repo <clone> --rev e1e3a15…  --stable 156.0.8078.47 --json   -> exit 1
node … --repo fx-base        --rev HEAD --stable 156.0.8078.47 --json                             -> exit 0
node … --repo fx-full        --rev HEAD --stable 156.0.8078.47 --json                             -> exit 1 (22 × f6; S078 resolved)
node … --repo fx-bogussup    --rev HEAD --stable 156.0.8078.47 --json                             -> exit 0
node … --repo fx-unrelatedsup--rev HEAD --stable 156.0.8078.47 --json                             -> exit 0
node … --repo fx-subset      --rev HEAD --stable 156.0.8078.47 --json                             -> exit 0
node … --repo fx-uncited     --rev HEAD --stable 156.0.8078.47 --json                             -> exit 1 (f4-ranges [729,758])
```

All fixture repos were created as `mktemp -d -p $S` + `git init`, toplevel verified equal to the
fixture dir before the first commit; no commit was made in the lane clone or anywhere else.
No tools installed or updated (host pacman paused; nothing needed). Node/git/curl versions in
`w2/refetch/S078/versions.txt`.

Writes: `.ufo/waves/round-29/w2/refetch/S078.json`, `w2/refetch/S078/` receipts, this report.
No lane tracked file, index or jj state touched; the pre-existing untracked w2 directory
(`w2.ready`) was already present.
