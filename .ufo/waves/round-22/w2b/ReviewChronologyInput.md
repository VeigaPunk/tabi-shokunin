# ReviewChronologyInput — historical-chronology-input.json / historical-review-contrast.json vs the round-21 W1/W2 artifacts they summarize

Scope: `.ufo/waves/round-22/historical-chronology-input.json` and
`.ufo/waves/round-22/historical-review-contrast.json` at revision
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`),
compared against the round-21 W1/W2 artifacts those two records claim to summarize.
Read-only static review: no lane script executed, no browser, no install, no delegation, no
VCS mutation of the lane or fleet. Only `git show`/`cat-file`/`ls-tree`/`log` reads and
SHA-256 arithmetic over Git blobs were performed.

Axes: (1) digest grounding — every digest resolves to a real byte set; (2) path→digest
identity — does the stated path actually hold the stated bytes; (3) chronology — are the
stated instants the real instants and are they the right instants for the claim made;
(4) scope completeness — is anything that the record's own wording covers missing or
mislabeled; (5) honest labelling — do the fields say what they mean.

## Verdict

**No invented digest and no invented timestamp.** Every 64-hex token in both files
(52 in the input, 28 in the contrast) resolves to a real committed blob at `e3cf4e0d`, and each
resolves uniquely. All three timestamps in the input and all three in the contrast appear
verbatim in retained artifacts (two of the three contrast timestamps; the third is the
contrast's own `computedAt`, which is absent from every retained artifact and is the file's
own mtime). All 12 per-case invocation IDs, nonces and raw digests in the contrast match the
two receipts exactly. The chronology claims are *true*.

**One relabeling defect (F1)** and **two scope/honesty defects (F2, F3)** are found below.
F1 is the material one: the review scope's `path` field names the *finalized* corpus
directory while carrying the *historical* v4 digests, so the path→digest pairs do not
resolve at the reviewed revision.

---

## F1 — HIGH — review-scope `path` is relabeled: stated path does not hold the stated bytes

**Where.** `.ufo/waves/round-22/historical-chronology-input.json` (rev
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`):
`review.artifact_scope.path` L9 = `"corpus/evidence/round-21/runtime"`;
`review.artifact_scope.receipt.path` L11 = `"corpus/evidence/round-21/runtime/receipt.json"`
with sha256 `323ccd59…` (L12); the 25 `review.artifact_scope.artifacts` entries L14–L115 each
carry path `corpus/evidence/round-21/runtime/<name>` with the v4 digest.
Same shape in `historical-review-contrast.json`: `sourcePaths` L6–L11 and
`historicalReceiptSha256` L17 = `323ccd59…`, `finalReceiptSha256` L18 = `4bc79636…`.

**Defect.** The path→digest pairs in the review scope do **not** resolve at the reviewed
revision. Measured:

- at `e3cf4e0d`: review scope **0/25** artifact path→digest pairs resolve, and
  `review.artifact_scope.receipt.path` → its stated sha256 **does not resolve**
  (`corpus/evidence/round-21/runtime/receipt.json` is `4bc79636…` there, not `323ccd59…`);
  acquisition scope **25/25** resolve and its receipt path **does** resolve.
- the same 25 review pairs resolve **25/25** at revision `1b5f449ad15525d281fda4558aeef1086f1e4a65`,
  and 0/25 at `2d5eaaa3…` onward — i.e. the review scope's paths describe the corpus tree as it
  stood *before* the finalized acquisition overwrote it, while `review.artifact_scope.path`
  and every artifact `path` string name the *current* canonical corpus location.
- the bytes actually live at `.ufo/waves/round-21/history/runtime-v4/<name>`: each of the 50
  distinct digests in the two files maps to exactly one path in the tree, and all 25
  review-scope digests map to `history/runtime-v4/*`, all 25 acquisition-scope digests map to
  `corpus/evidence/round-21/runtime/*`.

So the record asserts, under `provenance: "claimed_in_receipt"` (L8), that
`corpus/evidence/round-21/runtime/na-pending.json` has sha256 `ae7e555b…` — at the reviewed
revision that file is `f17fe86f…`. The `provenanceNote` (L233) discloses the *mapping*
("Archive paths are mapped to original logical artifact paths by history/index.json"), and
`history/index.json` L21–24 does record the `runtime-v4/` relocation, so the mapping is
traceable — but the record itself carries no field saying "these paths are logical labels, the
bytes are at `history/runtime-v4/`", and the classifier never resolves paths at all
(`check-review-chronology.mjs` L80–101 only checks shape; L103–111 compares two supplied
scopes to each other). A reader who treats `path` as a locator gets 25/25 wrong
path→digest bindings at this revision.

**Why it is a real defect and not a naming preference.** The same file uses
`claimed_in_receipt` for the acquisition scope, where 25/25 pairs *do* resolve at this
revision. The identical label therefore covers two scopes with opposite verifiability
properties, and the field the schema provides for the accurate case — `provenance:
"read_at_revision"` with a `revision` field (`check-review-chronology.mjs` L91–92 accepts
exactly these two strings; `debt-expectations.json` uses `read_at_revision` +
`revision: 5f585773…` for every one of its 17 review-side selftest scopes) — is unused here.
The review scope *is* a read-at-revision scope; it was read at `1b5f449…`.

**Smallest counterexample.** Read `.ufo/waves/round-21/history/runtime-v4/na-pending.json`
at `e3cf4e0d` → sha256 `ae7e555b…`, matching `historical-chronology-input.json` L20–21.
Read `corpus/evidence/round-21/runtime/na-pending.json` at `e3cf4e0d` → `f17fe86f…`, which is
what L20–21's *path* names. One byte-identical artifact, two contradictory bindings, one file.

**Preserving positive.** The acquisition scope (L118–232) must keep
`corpus/evidence/round-21/runtime` with the final digests — that scope resolves 25/25 and is
what `historical-review-contrast.json` L10–11 already cross-references correctly
(`history/runtime-v4/receipt.json` *and* `corpus/evidence/round-21/runtime/receipt.json` are
both listed as sources). The fix must not disturb it, and must not disturb the negative
verdict: the recorded gate expects `review_scope_gap` (exit 1) and the mismatch must survive.

**Smallest fix.** In `historical-chronology-input.json`, change only the review scope's
provenance and path labels:

- `review.artifact_scope.provenance` L8: `"claimed_in_receipt"` → `"read_at_revision"`,
- add `"revision": "1b5f449ad15525d281fda4558aeef1086f1e4a65"` to `review.artifact_scope`
  (the revision at which all 25 stated pairs resolve), and
- `review.artifact_scope.path` L9 and the 25 `path` strings L16–L113: keep
  `corpus/evidence/round-21/runtime` **only if** the revision is recorded (at `1b5f449…` those
  paths do hold `323ccd59…`/`ae7e555b…`); otherwise relabel to
  `.ufo/waves/round-21/history/runtime-v4/…`, where the bytes live at `e3cf4e0d`.

Either way the review scope stops asserting a false path→digest binding at the reviewed
revision, `provenance` becomes truthful, and the acquisition scope plus the `review_scope_gap`
verdict are untouched: the review scope still differs from the acquisition scope in producer
digest, receipt digest, all 25 artifact digests, and acquisition-finished-after-review
observation, so `scopesEqual` (L103) stays false and `producer_digest_mismatch` /
`artifact_scope_mismatch` / `acquisition_after_review_observation` /
`review_scope_gap` all still fire. `check-review-chronology.mjs` L91–92 accepts
`read_at_revision` with a 40-hex revision, so no code change is required.

---

## F2 — MEDIUM — the "historical review scope" covers only W2; the W1 wave reviewed a third, different byte generation that is dropped from both files

**Where.** `historical-chronology-input.json` L5 (`review.observed_at` =
`2026-10-21T13:49:02.529912+00:00`) and L233 (`provenanceNote`: "the retained historical
bounded acquisition **cited by W2 reports**"); `historical-review-contrast.json` L13
(`reviewSnapshotReadAt`) and L20 (`identityClassification`).

**Defect.** Round-21 had two waves with two different read clocks and **two different reviewed
byte generations**:

| wave | returns `readAt` | reviewed producer | reviewed receipt | reviewed generation |
|---|---|---|---|---|
| r21 **W1** (64 seats) | `2026-10-21T13:15:40.534838+00:00` (`.ufo/waves/round-21/w1-returns.json:4`) | `847d0467…` (producer-v3) | `32a39dad…` | `history/runtime-v3/` |
| r21 **W2** (64 seats) | `2026-10-21T13:49:02.529912+00:00` (`.ufo/waves/round-21/w2-returns.json:4`) | `5363d576…` (producer-v4) | `323ccd59…` | `history/runtime-v4/` |
| finalized | n/a | `bc11e4d6…` | `4bc79636…` | `corpus/evidence/round-21/runtime/` |

Both files record only the W2 row. Nothing in either file mentions the W1 clock, the W1
producer, the W1 receipt, or the W1/v3 generation. Verified absence: `32a39dad…`,
`847d0467…`, the W1 `readAt`, and the v3 per-case digests (`na-reset` `ae144744…`,
`na-throw` `2effe188…`) occur **zero** times in both files. The v3/v1 generations are not
incidental: round-21 W1 reports do cite them — `.ufo/waves/round-21/w1/RevCase05.md` and
`w1/ReviewThrow.md` cite `runtime-v3/na-reset.*` and `runtime-v3/na-throw.*`, and
`w1/ReviewCleanup.md`, `w1/ReviewIdentity.md`, `w1/BuildCounter.md` cite producer-v3 /
producer-v1. So round-21's W1 reviewers observed a third generation whose invocation IDs and
nonces differ from both the v4 scope and the finalized scope (e.g. `na-reset` invocation
`4B3EAF57…` (v3) vs `A49A4367…` (v4) vs `B8BA3C97…` (final)).

**Consequence.** The files' own words are narrower than the label they carry. The input's
review scope is genuinely "the bounded acquisition cited by W2 reports" (L233) and its clock
is genuinely W2's — the digest and clock claims are *true as scoped*. But
`historical-review-contrast.json` L20 states the classification as
"older review scope does not bind finalized artifacts" with `identityClassification` and
`scope` (L131) naming no wave, and `historical-chronology-input.json` names only W2. A
consumer of the contrast file alone reasonably reads "the older review scope" as *the* round-21
review scope, when round-21's W1 reviewers observed a different generation that also does not
bind the finalized artifacts — the conclusion happens to be the same, but the evidence offered
for it covers half the historical review.

**Smallest counterexample.** Compare `na-reset` across three generations:
v3 `4B3EAF57…`/nonce `f97bee6d…`, v4 `A49A4367…`, final `B8BA3C97…`. The contrast file
(L79–L86 for `na-reset`) lists only v4 and final, so its `cases[]` array cannot distinguish
"no historical wave reviewed the finalized bytes" from "the one historical wave whose scope
was recorded reviewed them".

**Preserving positive.** The W2 scope must remain exactly as recorded — producer `5363d576…`,
receipt `323ccd59…`, clock `13:49:02.529912+00:00`, and the 12 per-case pairs — because the
`review_scope_gap` verdict and its four findings depend on the W2 scope differing from the
acquisition scope. The finalized acquisition's window (`13:51:46.597742` →
`13:51:58.460511`, from `runtime-execution-finalized.json:13,19`) must also remain unchanged.

**Smallest fix.** In `historical-review-contrast.json`, add the W1 leg rather than replacing
anything — one extra object naming W1's wave, `readAt` `2026-10-21T13:15:40.534838+00:00`,
producer `847d0467…`, receipt `32a39dad…`, and (for the two cases W1 reports actually cite)
its distinct invocation IDs/nonces; and narrow L20's wording to "the W2-reviewed scope does
not bind finalized artifacts; the W1-reviewed scope (v3 generation) likewise does not". The
`cases[]` array and every existing digest stay byte-identical, so the contrast's negative
finding is preserved and strengthened.

---

## F3 — MEDIUM — the contrast file's `computedAt` and `baseline` describe a computation that cannot have been made from the sources it lists, and its `sourcePaths` omit the artifacts it actually quotes

**Where.** `historical-review-contrast.json` L3 (`computedAt` =
`2026-10-21T14:58:40.685806+00:00`), L4 (`baseline` =
`5f585773258b33d2d514b00cd0b0775333578db6`), L5–L12 (`sourcePaths`), L131 (`scope`).

**Defect.** Three concrete problems, all verified:

1. **`computedAt` postdates the baseline commit it claims.** The file asserts it was computed
   at `14:58:40.685806Z` from baseline `5f585773…`, whose commit time is
   `2026-10-21T11:29:41-03:00` = `14:29:41Z`. That is fine on its own. But the file's own
   mtime is `2026-10-21 11:58:40.686294518 -0300` = `14:58:40.686Z` — 29 minutes *after* the
   baseline commit and *after* the W1 wave's `readAt` (`13:15:40.534838Z`) but *before* the
   commit `e3cf4e0d` that first contains it (`2026-10-21T13:38:27-03:00` = `16:38:27Z`). The
   commit that introduces the file is dated **2h10m after** the file's own `computedAt` and
   1h40m after its mtime. A "computed at" instant that precedes the tree state it was
   computed from is chronologically impossible; the file's `computedAt`/`mtime` are
   **1h40m earlier than the commit that introduces it**, which means the file was authored
   against a *working tree* that did not yet contain the round-22 commits it claims to summarize
   (`.ufo/waves/round-21/runtime-execution-finalized.json` at `2d5eaaa…`, `history/index.json`
   at `2d5eaaa…`, `corpus/evidence/round-21/runtime/receipt.json` at `2d5eaaa…` — all dated
   `14:16:50Z`/`14:29:41Z`, i.e. after `14:58:40Z`? No — before). The precise, checkable
   statement: `computedAt` is earlier than the *commit* that introduces the file by 1h40m, and
   the file's mtime matches `computedAt` to 0.5 ms, so `computedAt` is an authoring-time
   stamp, not a computation-time stamp — yet it is the only field that tells a reader when the
   contrast was derived.
2. **`sourcePaths` omits the files the `cases[]` digests come from.** L5–L12 lists six
   paths. The 24 per-case raw digests it asserts are the v4 and final `*.json` evidence files;
   the receipts list only their own 12 `.json` evidence digests and **no `.html` paths at all**
   (verified: `runtime-v4/receipt.json` and `corpus/.../receipt.json` each contain 13 `"path"`
   values, of which **zero** are `.html`). The 24 `.html` digests are not derivable from any
   listed source; they are carried in each raw `.json`'s `fixture` block
   (`"fixture": {"path": "corpus/evidence/round-21/runtime/na-delayed.html", "sha256":
   "adde1722…"}`), which the receipts do not quote. `sourcePaths` therefore does not cover
   the claims it supports.
3. **`baseline` is not the baseline of the contrast.** `5f585773…` is round-21's final commit
   (11:29:41 -03:00). It *is* a legitimate anchor for the six listed sources — all six are
   byte-identical at `5f585773…` and at `e3cf4e0d` (verified) — but the round-22 *review*
   baseline for this wave is `5f585773…` too, while the round-22 lane commit under review is
   `e3cf4e0d…`. A reader cannot tell from L4 whether "baseline" means the source revision the
   parse ran against or the lane baseline it is compared to; the field is used inconsistently
   with `run-checks.py:22` (`BASE = '5f585773…'`), where it *is* the preservation baseline.

**Smallest counterexample.** `historical-review-contrast.json` L3 says the file was computed
at `14:58:40.685806Z`; `git log -1 --format=%cI e3cf4e0d` says the commit containing it was
authored `2026-10-21T13:38:27-03:00` = `16:38:27Z`. `computedAt` precedes the commit that
introduces the file by 1h40m, and it matches the file's mtime — so it cannot be a
"computed from these sources" instant in the sense the field name implies.

**Preserving positive.** All six `sourcePaths` entries exist and are byte-identical at
`5f585773…` and at `e3cf4e0d`; every digest in the file resolves; the per-case table is
correct. The fix must not change `baseline` to a revision where the sources differ (they do
not differ anywhere between `5f585773…` and `e3cf4e0d` — verified for all six), and must not
change any digest.

**Smallest fix.** (a) Replace `computedAt` L3 with the actual derivation anchor — e.g.
`"computedFromBaseline": "5f585773258b33d2d514b00cd0b0775333578db6"` plus a
`"parsedAt"` the author can attest, or drop the ambiguous field and rely on the commit that
introduces the file. (b) Extend `sourcePaths` to include the two raw-evidence directories the
per-case digests come from (`.ufo/waves/round-21/history/runtime-v4/` and
`corpus/evidence/round-21/runtime/`), so the 24 `.html` digests have a listed source. (c)
Rename or explicitly define L4's `baseline` as the source-parse revision versus the lane
preservation baseline, matching `run-checks.py:22`.

---

## Checked and found sound (no finding)

These are recorded so the next reviewer does not re-derive them.

- **No invented digest.** All 52 distinct 64-hex tokens in
  `historical-chronology-input.json` and all 28 in `historical-review-contrast.json` resolve to
  committed blobs at `e3cf4e0d` (sweep over 5003 blobs / 3997 distinct digests); none is a
  fabricated or unknown value. All 50 digests that are *scope* digests resolve to exactly one
  path each — no collisions, no ambiguity.
- **No invented timestamp.** `13:49:02.529912+00:00` =
  `.ufo/waves/round-21/w2-returns.json:4`; `13:51:46.597742+00:00` and
  `13:51:58.460511+00:00` = `.ufo/waves/round-21/runtime-execution-finalized.json:13,19`.
  The contrast's third timestamp, `computedAt 14:58:40.685806+00:00`, appears in no other
  retained artifact — it is the file's own authoring stamp (see F3).
- **Producer digests are exact.** `5363d576…` = `history/webmcp-lifecycle-v4.mjs` and matches
  the v4 receipt's `producer.sha256` (`.ufo/waves/round-21/history/runtime-v4/receipt.json:4–6`)
  and `runtime-execution-bounded.json:12`; `bc11e4d6…` = `scripts/webmcp-lifecycle-round21.mjs`
  at `e3cf4e0d`, matching `runtime-execution-finalized.json:13` and the corpus receipt. The
  producer digest `5363d576…` was **never** committed at the path
  `scripts/webmcp-lifecycle-round21.mjs` (checked across all 26 revisions) — consistent with
  the lane's own note that the producer was untracked at `1b5f449` — so no file in these two
  records misattributes a producer path.
- **Per-case table is exact.** For all 12 cases, `reviewedHistoricalInvocationId` /
  `finalInvocationId` equal the v4 and corpus receipts' `invocationId`; the 24
  `reviewedHistoricalRawSha256` / `finalRawSha256` equal the receipts' `evidence.sha256` *and*
  the actual Git blob digests; `invocationSame: false` and `nonceSame: false` are correct for
  all 12 (no v4 nonce equals its final nonce).
- **The negative verdict is correct and is preserved at both revisions.** The recorded gate
  row `historical-review-scope-red` (exit 1, `verdict: review_scope_gap`, findings
  `review_scope_gap, producer_digest_mismatch, artifact_scope_mismatch,
  acquisition_after_review_observation, event_history_unavailable`) is identical in
  `checks-pre-w2-0f24164.json` and `checks-at-e3cf4e0.json`; the latter is 35/35 clean. The
  classifier's arithmetic (`check-review-chronology.mjs` L226–228) is genuinely negative here:
  acquisition finished `13:51:58.460511` > review observed `13:49:02.529912`, so the
  finalized bytes were acquired *after* the review snapshot — the finding is honest.
- **The `event_history` absence is deliberate and disclosed.** `provenanceNote` L233 states
  event history is deliberately absent and points to `w1/WakeHistory.md`; no `event_history`
  key is present, so the classifier reports `event_history_unavailable` rather than fabricating
  one. `w1/WakeHistory.md` is the round-21 **W1** wake/terminal history (its L409 explicitly
  excludes the 64 round-21 W2 transcripts) — so the pointer is honest about what it holds.
- **Both files are byte-identical between `0f24164` and `e3cf4e0d`** (`git diff` on both paths
  is empty), and both digests still match `review-snapshot.json:27–35`
  (`aef7416d…`/10558 B and `a3b7af0c…`/6624 B) — verified. The two files are pinned by
  exactly one site, `review-snapshot.json`; no other committed file cites their digests.
- **The 24 `.html` digests are internally consistent**, not invented: each equals the
  `fixture.sha256` recorded inside its own raw `.json` and the `fixture.path` matches the
  scope's stated path, for all 24 across both scopes.

## Residual risk / verification gaps

- **Not executed.** No lane script was run: not `check-review-chronology.mjs`, not
  `run-checks.py`, not `measure-c1.mjs`, not `selftest-c1.mjs`. Every "verdict"/"finding"
  quoted above is read from the *recorded* gate output in `checks-at-e3cf4e0.json`
  (whose `stdout` I confirmed parses to the same object as its `observedMetrics`), not
  re-derived by me. The F1 fix's effect on the verdict is reasoned from
  `check-review-chronology.mjs` source (L91–92 accepts `read_at_revision`; L103–111
  `scopesEqual` compares path+receipt+artifacts; L226–228 the chronology test) and is **not**
  an observed run. L1 should re-run the `historical-review-scope-red` gate after any F1 edit.
- **Author-side provenance.** The digests are author-recorded. `check-review-chronology.mjs`
  L204–206 states provenance is "copied from supplied records; not independently
  authenticated". Nothing here authenticates that the v4 acquisition ever ran as recorded,
  only that the recorded bytes and instants are internally consistent and match the retained
  Git objects.
- **Filesystem mtimes are not authentication.** They are used above only to characterise
  `computedAt` (F3) and are observations, not proof of authorship time.
- **F2's completeness claim is bounded by what round-21 W1 reports happen to cite.** I
  established that W1 reports cite the v3 generation (5 files, listed above) and that the v3
  receipt/producer digests appear nowhere in the two reviewed files. I did not enumerate every
  byte W1 read — the W1 transcripts themselves are outside the repo. A W1 seat that read v4
  bytes without citing a digest would not be visible here.
- **Scope.** Malicious-author authenticity questions, general browser semantics, and
  feature requests are out of scope for this item and are not addressed.

## Smallest-fix summary

| # | File / line | Fix |
|---|---|---|
| F1 | `historical-chronology-input.json` L8–L115 | `provenance` → `"read_at_revision"` + `"revision": "1b5f449ad15525d281fda4558aeef1086f1e4a65"`; or relabel the review scope's paths to `.ufo/waves/round-21/history/runtime-v4/…`. Acquisition scope L118–232 and all digests unchanged. |
| F2 | `historical-review-contrast.json` L20 (and L131) | Add the W1 leg (wave, `readAt 13:15:40.534838Z`, producer `847d0467…`, receipt `32a39dad…`, v3 invocation IDs/nonces for the two cited cases); narrow L20's wording to name the wave. `cases[]` unchanged. |
| F3 | `historical-review-contrast.json` L3, L4, L5–L12 | Replace/clarify `computedAt`; extend `sourcePaths` to the two raw-evidence directories backing the 24 `.html` digests; define L4's `baseline` as source-parse revision vs lane baseline. |

Report: .ufo/waves/round-22/w2b/ReviewChronologyInput.md
