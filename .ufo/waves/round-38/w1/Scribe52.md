# Scribe52 — W1-52 draft finding / evidence note

role: scribe (draft note only; no product-code, judge, git, or fleet edits)
focus: #1 — sources row / knowledge gate; lesson and mistakes; SCORECARD/LOG/report consistency
claims under review: C1 (calibration, D1–D6) and C2 (coverage, Playwright Firefox/Juggler)
lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`

Revisions measured (read-only): `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` (frozen claims,
= `claims.json.frozenAt`), `3bc0b10` (lane HEAD during measurement, "round-38: record Firefox
capability and routed defects"), `3f42a5c7…` (round-37 closure tip / counter's BASELINE),
`98239d0…` (`claims.json.baseline`). HEAD moved from `a8e7d50` to `3bc0b10` during this seat;
every statement below names the rev it was measured at.

Method: read committed bytes via `git show`, ran the frozen counter read-only
(`node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev <rev> --repo . --json`, writes
nothing), ran `node scripts/check-sources.mjs` (read-only), recomputed the round-37 seat tally
from committed reports, and fetched the S144 page once for an independent quote receipt.
No production file, commit, git/jj mutation, or install was performed.

## Gate legs at HEAD `3bc0b10` (frozen counter, verbatim findings)

`predicate=false`, exit 1. Ten findings remain:

```
d1-results       w1-results.json absent
d3-hash          99437d29/f76da094/34ed508c/5a2ebb6a/f485cce1/bf8ecd5a  present=false (all
                 isCommit=true ancestor=true)
d3-freeze-landing LOG round-38 section does not record the freeze entry landing at 34ed508c
d4-m3            no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)
d4-receipt       m3-sentence-mutant.json absent
d5-receipt       census-end.txt absent at REV
d6-file          no numstat receipt under .ufo/waves/round-38/measure
```

Legs that already pass at `3bc0b10`: `d1.stalePresent=true`, `d1.supersedingCorrection=true`,
`d1.w2Absent=true`, `d2.stated` present and `d2.recomputed = {ok:23, finding:11, reports:34}`,
`d4-section` (`## Mistakes` exists). Same run at `a8e7d50` and at `3f42a5c7` yields 15 findings
(adds `d1-correction`, `d2-stated`, `d4-lesson`); the baseline control therefore fails as C1's
target requires, though no baseline-control receipt is committed yet
(`.ufo/waves/round-38/baseline/` is empty: `git ls-tree -r --name-only HEAD .ufo/waves/round-38/baseline/ | wc -l` → 0).

## Findings

### F1 — C1/D1 is unsatisfiable until a round-37 settlement file is committed (blocker)

`c1-routed-defects.mjs:88-96` reads `.ufo/waves/round-37/w1-results.json` at REV and requires
`seats === 34`. That path is not in any commit:

- `git cat-file -e HEAD:.ufo/waves/round-37/w1-results.json` → `fatal: path … exists on disk, but not in 'HEAD'`
- `git log --all --oneline -- .ufo/waves/round-37/w1-results.json` → empty
- worktree file (untracked, `git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json`) parses `seats 34`, keys `lane,round,wave,seats,results`

Two committed documents already lean on that non-committed artifact:
`SCORECARD.md:2102` ("The committed round-37 result object records 34 w1 seats") and
`corpus/lessons/round-38.md:11` ("re-derive from committed `w1-results.json` (34 seats)").
Both statements are false at `3bc0b10`.

Falsified by: committing the file in the same round — then `d1.seats` becomes 34 and the
`d1-results` finding disappears. Until then C1's killRule term "absent source receipt" holds.

### F2 — C1/D3: LOG round-38 section carries no round-37 hash ledger

`LOG.md:2525` starts the round-38 section; over that slice all six required hashes are absent
(`present=false` for every entry in the block above), and `34ed508c` never appears.
Required by `c1-routed-defects.mjs:132-150`. Measured identically on committed bytes
(`git show 3bc0b10:LOG.md | grep -n '^## Round 38'` → 2525; grep of the slice → 0/6).
Falsified by: an appended ledger naming all six hashes plus the freeze-entry landing at
`34ed508c` (and not attributing the freeze to `99437d29`).

### F3 — C1/D4: the M3 row and its red control are missing; the control check is self-asserted

`corpus/lessons/round-38.md:11` carries one row, `class self-assessment-overclaim`, with
"Captured-by: none at round 37". No row names the round-36 M3 class `surface-mismatch`, which
`c1-routed-defects.mjs:158-166` requires. `.ufo/waves/round-38/baseline/` is empty (see above),
so `m3-sentence-mutant.json` is absent too (`c1:168-169`).

Note the check itself: `c1:173` accepts `exit===1 || exit===2 || refused===true || killed===true`
read out of a JSON file — the refusal is asserted by the receipt, never re-derived by the
counter. A hand-written `{"exit":2}` passes the leg, which is the same "trust the prose" class
the counter's header claims to remove (`c1:6-9`).
Falsified by: a `surface-mismatch` row with a `Captured-by:` naming the round-37 M3 evidence
plus a receipt whose refusal the counter re-derives (e.g. by re-running the sentence check).

### F4 — C1: the frozen predicate sentence is not the sentence in `claims.json` (round-37 M3 class at freeze)

```
claims.json:26  predicate      = "D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true"
counter c1:46   PREDICATE_SENT  = "D1 stale-line-present AND superseding-correction-present AND …"
node equality   → false
```

`c1-routed-defects.mjs:42-44` asserts "the same sentence in claims.json and the receipt's
`predicateSentence` field" — that assertion is false against the frozen bytes. No counter leg
compares them, so the predicate can read `true` while the declared sentence differs.
This is exactly the round-37 routed defect the round's own D4 leg is asked to instrument.
Falsified by: making `claims.json:26` byte-identical to `c1:46`, or adding a leg that fails on
mismatch (which would also give D4's class a real capture).

### F5 — C1/D6: two conflicting "baseline" identities; D6 only accepts one

- `claims.json:6` `"baseline": "98239d0396ff32c3feb14638b3214fe688e8b122"` (itself a round-38
  commit: "add frozen-instrument candidates and Firefox driver")
- `c1-routed-defects.mjs:52` `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'` (round-37 closure tip)
- `LOG.md:2527` "Round-start baseline: `3f42a5c7…`"

Round-37's own `claims.json` used the round-start commit for both fields
(`frozenAt == baseline == ed8ccfc…`), so the lane convention is "baseline = round start", which
makes `98239d0` the odd value. `c1:219-220` tests the receipt text for the hardcoded
`3f42a5c7…` (40-hex, with a 12-hex fallback), so a numstat receipt that names the
`claims.json`-declared baseline `98239d0` is refused by D6 while being faithful to `claims.json`.
The predicate's phrase "window endpoints == baseline..REV" (`c1:46`) has two referents.
Falsified by: a receipt diffing `98239d0..REV` → `d6-window` finding; or by an append-only note
that names one baseline for both documents.

### F6 — C1/D6 does not re-derive the property it names (text presence over `names[0]`)

`c1:211-224`: the leg picks the first `numstat-at-*.txt` from `ls-tree` order (`names[0]`), then
tests only that the text contains the baseline prefix and the REV prefix. The diff range itself
is never read. Consequences: (a) the round-37 defect (a two-round window, per
`round-37-verifier-spotcheck.md` routed defect 6) still passes as long as the header names both
endpoints; (b) with two receipts present, which receipt is judged depends on alphabetical hash
order, not on recency or on a declared name. Header/impl also disagree: `c1:44-45` says D5/D6
receipts are read "at --repo's worktree", while `c1:180-182,217` read `git show REV:<path>`.
Falsified by: a receipt whose header names both endpoints but whose diff window is wider →
still predicate-true.

### F7 — C1/D5: the natural census output fails the tier histogram equality

`c1:178-209` captures `tier[s]?\s*[:=]\s*([^\n]*)` and requires exact key-set equality with
`{A,B,C}`. Pasting the registry gate's own summary line
(`SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0 file=…`)
parses to `{A:128,B:7,C:9,queued:15,mined:120,rejected:9,findings:0}` → equality false
(simulated with the counter's own `parseHist`). A passing block is one key-group per line:

```
rows: 144
tier: A:128 B:7 C:9
status: queued:15 mined:120 rejected:9
```

Independent parse of `corpus/SOURCES.md` at `3bc0b10` (counter-equivalent, c[4]=tier, c[8]=status):
`{"rows":144,"tier":{"A":128,"B":7,"C":9},"status":{"mined":120,"queued":15,"rejected":9}}`.

### F8 — Lesson asserts a census receipt that does not exist (committed false artifact claim)

`corpus/lessons/round-38.md:15` (committed in `3bc0b10`): "Round-end validation returned exit 0
and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt`".
`git ls-tree -r --name-only HEAD .ufo/waves/round-38/measure/ | wc -l` → 0. The round is also
still in flight, so "round-end" is asserted before the end. Append-only correction or the
receipt must exist; the counter refuses the absent file (`d5-receipt`).
Falsified by: committing the counts-bearing receipt at that path.

### F9 — C2: the "counting command" cannot express the predicate (producer, not gate)

`scripts/playwright-firefox-loopback-round38.mjs:145-168`: `main()` writes the receipt and
returns; `binding`, `egressNonLoopback`, `survivors` are recorded and never gate. A run with
`binding=false` or `survivors>0` still exits 0. C2's `countingCommand`
(`claims.json:38`) therefore has no accept/refuse semantics, unlike C1's counter (0/1/2).
Supporting observations from the committed receipt
(`corpus/evidence/round-38/playwright-firefox/receipt.json`):
`runs[*].egress.samples = 2` (two socket samples per run), `firefoxVersion: null` (driver sets it
null at `:157`; only `browserVersion` is probed at `:159` — the receipt's version surface is the
browser build, not the Firefox identity the claim names), and `profile` created at `:72` is never
passed to `firefox.launch` at `:73`, so "cold run" rests on Playwright's own temp-profile
behaviour, not on a recorded profile path.
Falsified by: a non-loopback egress / survivor run still exiting 0 (already true by construction),
or by adding a gate that exits non-zero on `binding=false ∨ survivors>0 ∨ egress>0`.

### F10 — C2 source row: absent at the freeze, landed at `3bc0b10`; admit receipt lacks a fetch digest

- At `a8e7d50` (frozen claims): `grep -c S144 corpus/SOURCES.md` → 0; registry 143 rows (max S143,
  `corpus/SOURCES.md:157`). The knowledge note (`corpus/knowledge/playwright-firefox-loopback-round-38.md:1`)
  and `SCORECARD.md:2105`/`LOG.md:2529` already cited it, so at freeze C2's killRule term
  "no cited newly opened source row" held.
- At `3bc0b10`: `corpus/SOURCES.md:158` — tier A, `mined`, opened 2026-10-27, recheck `on-release`,
  used-by `corpus/knowledge/playwright-firefox-loopback-round-38.md` (exists). Registry gate:
  `SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0`.
- Quote verified independently by this seat: `curl https://playwright.dev/docs/browsers` →
  HTTP 200, 134,107 B, sha256 `bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`
  (2026-10-27); `§Firefox` contains verbatim "Playwright doesn't work with the branded version of
  Firefox since it relies on patches." — matching `corpus/lessons/round-38.md:5` (14 words). The
  substantive claim therefore holds; what is missing is the receipt: the lesson row carries no
  HTTP status/bytes/digest/timestamp, unlike S142 (`corpus/lessons/round-36.md:11`) and S143
  (`corpus/lessons/round-37.md:14`). This seat's fetch is evidence for this round only, not a
  retroactive open receipt (the doc is living).
- Id provenance note (not a defect): S144 was never in the lane registry
  (`round-36/w1/ScribeQuarantine.md:80` "id absent"), and the fleet staged id was already
  remapped (`round-23/w2/W2IdMap.md:30`, staged S144 → S101), so `max+1` = S144 is consistent.

### F11 — Criterion 11 index gap for the new note

`corpus/README.md` has no row mentioning `playwright-firefox` (`grep -n playwright-firefox corpus/README.md` → no match);
README last changed at `20a69e0` (round 36). `corpus/QUALITY.md:26-27` requires the coverage map
to list every current note or state its snapshot date and the exact open row-count gap in the
same commit as each admit; `3bc0b10` adds `corpus/knowledge/playwright-firefox-loopback-round-38.md`
without touching the index.
Falsified by: an index row (or a dated snapshot line naming the gap) in the admit commit.

## Confirmed-consistent items (evidence, not praise)

- **D2 target is well-founded.** Independent recompute from committed reports at `a8e7d50`
  (last `VERDICT (ok|finding|error)` per seat, 34 seat files, dir/`report.md` preferred):
  `{ok:23, finding:11, error:0, none:0}`; the 11 finding seats are ConnPattern, CritC2b,
  CritHarness, LabratC1, LabratC2, MutC1a, MutC2a, MutC2b, RevControls, RevFrozenDigests,
  SentinelScope. This matches `c1.d2.recomputed` and refutes the round-37 report's
  "18 seats returned VERDICT ok, 16 finding-grade" (`.ufo/reports/round-37/tabi.md:139`).
- **D1's stale line and correction are both locatable.** Stale: `SCORECARD.md:2078`
  ("68 seats (w1 34 + w2 34"). Correction: `SCORECARD.md:2102`; simulated with the counter's
  own predicate (`c1:87-93`) over the committed text → `supersedingCorrection=true`, confirmed by
  the live run (`d1.supersedingCorrection=true`). The scorecard section also carries the C2
  capability row (`SCORECARD.md:2105`) with a dangling-then-resolved `Source: S144`.
- **C2 receipt numbers match the knowledge note verbatim.** Two runs, `firstShotSha256` both
  `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, `firstShotBytes` 20626
  both; per run `pids=3`, `portClosed=true`, `survivors=0`, `egress.nonLoopback=0`;
  `httpLog` 6 entries each with 2 distinct URLs, all `http://127.0.0.1:<port>/…`, non-loopback
  URLs `[]`; `errors` `[]`. The note's "both recorded 0 non-loopback socket observations and 0
  surviving Firefox PIDs" is exact.
- **LOG's tally string is already present** (`LOG.md:2531` "seat tally 23 ok / 11 finding"), so
  `d2-stated` will pass once D3's ledger and the remaining legs land.

## Not executed / out of scope for this seat

- Did not re-run the driver (no new browser run; the receipt is read, not regenerated).
- Did not run `c2-firefox-bidi-v4.mjs` or `c2-battery-mutants.mjs`. Their headers describe a
  "claim C2b" that does not exist in `claims.json` (claims are C1 and C2 only; C2's
  `countingCommand` is the driver), so the two frozen digests
  (`claims.json:47-48`) gate no frozen claim. Flagged, not judged.
- Did not verify the WebKit rejection in `corpus/lessons/round-38.md:6` (host `ldd` evidence);
  outside this seat's focus.
- Did not touch `~/.local/bin`, fleet-root tracked files, git/jj state, or other seats' output.

## Tool installs (this seat)

None — no pacman, no `uv`/npm/cargo installs. Node used: v24.21.0; `git`, `curl`, `sha256sum`
already present.

## Artifacts

- Counter output captured under `/fast/scratch/hyaku/tabi-r38/Scribe52/` (`c1-a8e7d50…json`,
  `c1-3bc0b10.json`, `c1-3f42a5c7….json`, `c1-98239d0….json`, `pw-browsers.html`); scratch is
  removed at yield — all quoted numbers above are reproduced from the committed bytes cited
  inline.
- This note: `.ufo/waves/round-38/w1/Scribe52.md`.
