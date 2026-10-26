# CritPredicateIdentity — predicate identity closure audit (round 29, wave w2)

Seat: critic (leaf; no subagents, no lane edits, no builds/linters of the lane, no `agent://all`).
Milestone: cross-claim. Subject: the closure rule — **one predicate = the same sentence in the
plan, the same condition in the counter's code, the same label in the receipt** — for C1, C2, C3
of `.ufo/waves/round-29/claims.json` (frozen `97be89bc`, read first).

Verdict in one line: **C2 and C3 each satisfy their literal target at the byte level, but neither
sentence describes its own code, and the state at the integrated tip is C3-red (`unresolved=23`)
plus a missing `.ufo/waves/round-29/measure/` that the frozen measurement rule requires.** C2's
`0` is reachable while a demonstrably stale tally of the frozen counter's own capability row
(`SCORECARD.md:1249`, 13 vs 22) stays uncounted.

## Environment and revisions measured

| item | value |
|---|---|
| lane | `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only git only) |
| clone | `$S/tip32008` = `git clone --shared`, checked out `32008a453737a27f69e9ab401d0b9775d2a944f7`, `git status --porcelain` = 0 lines |
| scratch | `S=/fast/scratch/hyaku/tabi-r29/CritPredicateIdentity` (one live clone; probe copies only) |
| counter bytes | `scripts/check-selfassessment.mjs` sha256 `728128008e…ba560c4`, `scripts/check-release-pins.mjs` sha256 `567637200b…f8c6fc3770` — both match `.ufo/waves/round-29/baseline/frozen-counter-sha256.txt` |
| node | v24.21.0 |
| receipts | copied to `.ufo/waves/round-29/w2/CritPredicateIdentity/` (`c2-tip.json`, `c2-probe-para.json`, `c2-dirty.json`, `c3-tip.json`, `mutant-replay.out`, `probe-para.mjs.txt`, `junk-del.mjs.txt`) |
| honesty | `TMPDIR` was **not** overridden for the counter runs: each gate `mkdtemp`s its own fixture tree under the OS temp dir and `rm`s it in a `finally`; nothing was written outside `$S` and the output dir. No fixture repo was created; no commit was made anywhere. No tool install was needed. |

Commands and exit codes (all from `$S/tip32008`, porcelain empty):

```
node scripts/check-s106-evidence.mjs --selftest                      -> exit 0   (cases=7 passed=7)
node scripts/check-s106-evidence.mjs --rev 32008a45… --json           -> exit 0   (valid=true; sha_match/anchor_located/anchor_unique/byte_count_match/revision_match all true)
node scripts/check-selfassessment.mjs --rev 32008a45… --json          -> exit 0   (mismatches=0, couldNotEvaluate=92, superseded=12, findings=120)
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json -> exit 1 (population=23, unresolved=23, holds=0, drifted=0, receipt_present=true)
node $S/probe-para.mjs --repo $S/tip32008 --rev 32008a45… --json      -> exit 1   (mismatches=1)
node $S/junk-del.mjs --selftest                                       -> exit 0   (cases=5 passed=5)
node $S/mutant-replay.mjs --selftest                                  -> exit 3   (cases=7 passed=6, measured-revision-bytes-mismatch FAIL)
```

# C1 — `operability`, `scripts/check-s106-evidence.mjs`

Predicate sentence (frozen, `claims.json` C1) split into its clauses:

| # | clause as written | code condition (rev `32008a45`) | receipt label | closure |
|---|---|---|---|---|
| 1 | "`--selftest` exits 0" | `process.exit(out.ok ? 0 : 3)` `:357`; `out.ok` = `failed.length === 0` `:318-319` | `selftest-l1.txt` last line `exit=0` (harness `echo`) | **bound** |
| 2 | "prints `S106_SELFTEST verdict=clean cases=N passed=N`" | one `console.log` `:355` emits exactly that literal | `selftest-l1.txt` line 8 verbatim; my run byte-identical | **bound** |
| 3 | "with N >= 7" | **no condition anywhere.** No minimum case count is asserted; `CASES` is data | tally line only | **sentence unenforced by code** |
| 4 | "its CASES include ids `measured-revision-bytes-match` and `measured-revision-bytes-mismatch`" | both objects exist in `CASES` `:185`, `:193`, but nothing asserts the id set or count | `CASE id=…` lines present in `selftest-l1.txt` and `mutation.txt` | **sentence unenforced by code** (receipt-read only) |
| 5 | "`corpus/evidence/round-29/s106-selftest/mutation.txt` shows the same self-test run on a copy of the gate whose revision comparison is removed" | no counter or gate reads `mutation.txt`; `mutation.diff` shows **two** edits — `revisionMatch = true` **and** `LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"` | `mutation.txt` (7 CASE lines) | **sentence incomplete** (one edit described, two applied) + unenforced |
| 6 | "exiting nonzero with `measured-revision-bytes-mismatch` FAIL" | — | `mutation.txt` line 3 `… exit=0 valid=true FAIL`; line 9 `exit=3` (shell `echo`, not program stdout) | **bound as a receipt label** |
| 7 | "`--rev REV --json` reports valid=true" | `:128` `valid = revisionMatch && shaMatch && anchorLocated && anchorUnique && byteCountMatch` | my run: all six fields true, exit 0 | **bound**, but the sentence names **1 of 5** conjuncts (it omits anchor uniqueness, byte count, sha match) |

## C1 counterexamples

**P1 (high, sentence unenforced) — the counting command is green with both revision cases
deleted.** The gate's own junk control (`baseline/c1-control-case-deletion.txt`) already shows
`verdict=clean cases=5 passed=5`, `exit=0`. I reproduced it on the repaired tip bytes (import
`existsSync` is already present at the tip, so the only edit is the deletion of the two case
objects):

```
$ node $S/junk-del.mjs --selftest
CASE id=clean-fixture-valid … PASS
CASE id=sha-mismatch-invalid … PASS
CASE id=anchor-off-by-one-invalid … PASS
CASE id=missing-bytes-could-not-evaluate … PASS
CASE id=missing-receipt-could-not-evaluate … PASS
S106_SELFTEST verdict=clean cases=5 passed=5
exit=0
```

So `countingCommand` (`--selftest; echo exit=$?`) returns `exit=0` in both the target state and
the vacuous one. Clauses 3 and 4 are carried **only** by a number in the receipt that a human (or
the C2 matcher) must read. The claim survives because its `killRule` says so, not because the
instrument says so.

**P2 (verified honest, no defect) — the mutation receipt reproduces.** I applied the two edits
named by `mutation.diff` to a copy of the tip gate (`$S/mutant-replay.mjs`) and ran `--selftest`:
`verdict=failed cases=7 passed=6`, `exit=3`, with case 3
`measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL`. Diff against the
committed receipt is **only** the two `refusal=… : corpus/…` fixture commit ids (documented as
unpinned in `baseline/README-receipts.md`) — everything else matches line for line. The LANE edit
in the diff is inert under `--selftest` (fixtures carry their own `--repo`), which my replay (both
edits applied) demonstrates.

**P3 (cross-claim, see X2) — C1's repair changes C2's oracle.** At baseline
`SCORECARD.md:1438` was `couldNotEvaluate: "self-test printed no tally"`; at the tip it is
`claimed=5 observed=7 superseded=true`. The predicate sentence says nothing about that effect and
`claims.json`'s separability note reasons only in the other direction.

# C2 — `calibration`, `scripts/check-selfassessment.mjs`

| # | clause as written | code condition (rev `97be89b`, sha verified) | receipt label | closure |
|---|---|---|---|---|
| 1 | "In a clean checkout of REV" | `:154` a gate whose blob at REV ≠ the working copy is `could-not-evaluate`; `m3` reads `git status --porcelain` | — | **bound and load-bearing** (see P4) |
| 2 | "run with the counter frozen (sha256 728128008e…)" | verified in the clone | — | **bound** |
| 3 | "a supersession citation clears a stale tally only when it names the stale line's own document **and** a line or range containing it" | `citesLine(text, doc, line)` `:267-276`; call sites `:237` (`"SCORECARD.md"`), `:330` (`"LOG.md"`) | corrections at `SCORECARD.md:1463-1466`, `LOG.md:2007` | **bound** (both directions verified: the two cross-document self-test cases are red on the old matcher, green on the frozen one) |
| 4 | "plus the pre-existing script-name, correction-marker and observed-number conditions" | SCORECARD `:236-240`: `g.script === f.script`, `g.observed === g.claimed === f.observed`, marker `/supersed\|correct\|replace\|replac\|superseding/i`; LOG `:328-332`: `namesScript`, marker `/supersed\|correct/i`, `statedTallyNumbers(text).includes(f.observed)` | — | **sentence omits the asymmetry**: two different marker grammars, and the LOG condition is "the number appears anywhere in the paragraph", not "the correction states the corrected number" |
| 5 | "reports mismatches = 0" | `:408` `counted = findings.filter(f => f.observed !== null && f.observed !== f.claimed && !f.superseded)` over **m1 + m2 + m3**; `:412` `mismatches: counted.length` | my run `mismatches: 0` | **bound as a number; sentence omits (a)–(d) below** |

Sentence omissions that the code enforces (or refuses to count):

- **(a) `mismatches` includes classes the sentence never names.** `m2-receipt-exit` (77 findings
  at the tip) and `m3-unlanded-paths` are inside the same integer. Demonstrated: one untracked
  file in the otherwise clean clone flips the count —
  `mismatches: 1`, `counted: [{class: "m3-unlanded-paths", claimed: "landed", observed: 1}]`,
  exit 1 (`CritPredicateIdentity/c2-dirty.json`; the file was removed, porcelain back to 0). A
  reader who takes "mismatches" to mean stale tallies is reading a different instrument.
- **(b) 92 of 120 findings at the tip cannot be counted at all.** Exact partition at
  `32008a45` (`c2-tip.json`): m1 43 = 16 could-not-evaluate + 12 superseded + 15 agreeing;
  m2 77 = 76 could-not-evaluate + 1 agreeing; `mismatches: 0`, `couldNotEvaluate: 92`,
  `superseded: 12`. Three independent escapes produce the 92:
  ambiguous script association, script outside `RUNNABLE_GATE` (`:79`), and `malformed fraction
  claim (N !== M)` (`:195`, `:291` — a tally written `(13/22)` is never compared).
- **(c) the escape is exploitable by the lane's own document.** `SCORECARD.md:1249`, the
  capability row of `scripts/check-selfassessment.mjs` itself, says
  `` `--selftest` (cases=13) `` (paragraph `1245-1250`, which names exactly one script). The
  oracle at the tip is 22. It is uncounted solely because the script name is on the previous
  line. A one-rule change to paragraph-level association (still conservative: only when the
  paragraph names exactly one script) gives:

  ```
  $ node $S/probe-para.mjs --repo $S/tip32008 --rev 32008a45… --json
  mismatches 1   counted = SCORECARD.md:1249  claimed 13  observed 22
  couldNotEvaluate 87   superseded 12   (exit 1)
  ```

  Five lines leave `could-not-evaluate` under that rule (`LOG.md:1863`, `LOG.md:1864`,
  `SCORECARD.md:1243`, `:1249`, `:1306`); only `:1249` is stale. So the frozen `0` is a property
  of the **association rule**, which the predicate sentence never states.
- **(d) today's `0` is also partly the consequence of append-only prose, not of state.** All six
  baseline counts are cleared by correction lines (`SCORECARD.md:1463-1466`, `LOG.md:2007`), and
  the round-29 correction for `:1439` ("the doc-bound matcher added two cross-document cases this
  round", 17 → 22) is corroborated: `97be89b` added exactly the two cross-document cases and the
  red/green pair in `baseline/` shows 20/22 → 22/22.

**P4 (bound, no defect) — cleanliness is load-bearing.** The same frozen counter on the tip
bytes with one untracked path reports `mismatches: 1` (`m3`), so a dirty tree cannot be sold as
`0`. The predicate states it; the code enforces it.

# C3 — `freshness`, `scripts/check-release-pins.mjs`

| # | clause as written | code condition (rev `97be89b`, sha verified) | receipt label | closure |
|---|---|---|---|---|
| 1 | "reports population = 23" | `:179` population = rows whose `recheck` cell is `on-release` **and** whose source cell carries a tag `< --stable` | my run `population: 23` | **bound**; verified independently: 89 `on-release` rows, exactly 23 carry tags and all 23 carry exactly `["154.0.8037.97"]`, so the sentence's "pinned at 154" is a true fact — but the *condition* is "tag older than stable", not "pinned at 154" |
| 2 | "unresolved = 0" | `:254` `unresolved = results.filter(!resolved).length` | **my run `unresolved: 23`, exit 1** | **RED at the integrated tip** |
| 3 | "resolved only by committed 154 and 156 decoded bytes with matching sha256" | `:209-217` (`f3`): paths forced to `BYTES_ROOT/<old_tag>/<path>` and `BYTES_ROOT/<stable>/<path>`, both committed at REV, sha256 equal to the receipt | `bytes/154.0.8037.97/` and `bytes/156.0.8078.47/` present | **bound** |
| 4 | "ranges bound to the row's own anchor" | `:230-240` (`f4`) + `anchorHasRange` `:145-152`: `1 ≤ a ≤ b ≤ oldLines`, token `a-b` in the anchor cell | — | **bound for 39 of 40 files; not applied to any 404 file** (see below) |
| 5 | "the row's registry digest matched where it records one" | `:246` (`f5`): any source/anchor digest vs any file's `old_sha256` | — | **bound**; 15 of 23 rows record a digest, so the clause is vacuous for 8 |
| 6 | "an independent re-fetch record from a different seat agreeing with the 156 bytes" | `:218-220` (`f6`): `rf.id===id`, `rf.seat !== entry.fetched_by` (string inequality), `rf.files.some(x => x.path===f.path && x.tag===stable && x.status===f.new_status && x.sha256===f.new_sha256)`; **`fetched_at` is never validated; no URL, no HTTP status, no nonce** | no `refetch/` directory exists at the tip | **code enforces less than the sentence says** |
| 7 | "for a row whose anchored content changed, a superseding registry row opening `supersedes <id> —`, pinned at the 156 tag" | `:251-253` (`s1`): `sup.teaches.startsWith("supersedes <id> —")` **and** `sup.source.includes("refs/tags/156.0.8078.47/")` | 7 rows carry `superseded_by` | **bound and exact**; verified all 7 superseders are `S109…S115`, each `teaches` opens `supersedes S0xx —` and each source carries the 156 tag |

Sentence omissions (code binds them; the sentence does not):

- `r1-entry` `:195` — exactly one entry per id; duplicate entries or zero files are unresolved.
- `f1-old-tag` `:205` — the file's `old_tag` must be one of the row's own tags.
- `f2-path-bound` `:204,:206-208` — the path must appear in the source cell as
  `refs/tags/<old_tag>/<path>`, **or** the anchor cell must merely contain `basename(path)`.
- the status grammar `:226` (`old_status/new_status ∈ {200,404}`) and `:222-225`, the live
  404 branch: **a 404 file holds iff `new_status===404` and the new bytes contain `NOT_FOUND` —
  its declared ranges are never checked against the anchor.** `S094`
  (`third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`, `old=404 new=404
  ranges=0`) is exactly such a file, so for that row clause 4 of the sentence does not apply.
- receipt-level guards: `receipt.schema`, `receipt.stable === --stable`, `rows` array (`:190-194`);
  empty population → exit 2 (`:180`).

**P5 (critical, state) — C3 is red at the tip.** `corpus/evidence/round-29/release-pins/refetch/`
does not exist at `32008a45`; every one of the 23 rows fails on `f6-refetch` and only on
`f6-refetch`:

```
$ node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json
exit=1  population 23  resolved 0  unresolved 23  holds 0  drifted 0
S033 … S106: reasons = ["f6-refetch <path>", …]
```

So the sole clause separating `unresolved=23` from `unresolved=0` is `f6`, the one clause the code
enforces most weakly ("independent" = a different seat *string*; `fetched_at` unvalidated, any
value accepted). The claim's receipt commits the 23 entries and their seat labels but **no
refetch evidence**, and no field of any committed artifact carries the label `unresolved=0` yet.
(Wave-1 `CritC3Gaming.md` S14 already shows the green is reachable by 23 JSON files derived from
the receipt, including `fetched_at: 1970-01-01` and an invented seat; I confirm the mechanism from
the code, not from a new fixture.)

**P6 (medium, sentence vs code) — `f2`'s anchor-basename OR lets a file outside the row's URL
through.** `:207-208`: `inAnchor = row.anchor.includes(basename(f.path))`. Basenames such as
`form_mcp_schema.cc` are shared by S042/S077/S093/S098 and appear in their anchor cells, so a
receipt file entry pointing at a different directory with the same basename clears `f2`. Same
surface as wave-1 `CritC3Gaming.md` S3c — recorded here because the frozen sentence says
"the row's own anchor" (ranges), never "the row's own path".

# Cross-claim findings

**X1 (high) — the frozen measurement rule is unmet.** `claims.json.measurementRule`: "its raw
output is committed under `.ufo/waves/round-29/measure/` **before the report is written**." That
directory does not exist at `32008a45` **nor** at the wave-1 evidence commit `e1e3a15`
(`git ls-tree e1e3a15 .ufo/waves/round-29/` lists only `baseline`, `claims.json`,
`r28-wave-accounting.md`, `w1*`, `w2-spec.json`). The after-outputs live where the claim text
happens to put them instead: C1 in `corpus/evidence/round-29/s106-selftest/selftest-l1.txt`, C2/C3
in `.ufo/waves/round-29/w1/*.json` (`ConnSeparability.c2-at-head.json`,
`ConnSeparability.c3-at-head.json` — the latter also reads `unresolved: 23`). Under the rule as
frozen, none of the three after-measurements is filed where the contract says, so the "same label
in the receipt" leg of the closure has no committed carrier for C2 and C3.

**X2 (high) — C2's `0` is invariant to C1's repair, and C1's repair is what created one of the
lines C2 had to correct.** `SCORECARD.md:1438` never enters `counted` in either measured state:
baseline `observed=null` (could-not-evaluate, no tally), tip `observed=7 superseded=true`. If the
C1 repair were absent at the tip, both `:1438` and its correction `:1466` would be
`could-not-evaluate` (same script, `:154`) and `mismatches` would still be 0. Consequence for the
closure rule: **C2 = 0 is not evidence that C1 landed**, and `claims.json`'s separability note
("If C1 does not land … C2 is unaffected") is true but one-sided — the converse (C1 landing makes
`:1438` comparable and therefore obliges a correction) is unstated, and the obligation was
discharged by appending `SCORECARD.md:1466`, not by the repair. Wave-1 `ConnSeparability.md`
(§"C1 landing → C2 count") records the forward direction; the invariance is the part neither
claim states.

**X3 (medium) — one stale tally, two different dispositions.** `SCORECARD.md:1249` (13) and
`SCORECARD.md:1439` (17) are both stale tallies of `scripts/check-selfassessment.mjs` against the
same oracle (22 at the tip). `:1439` is counted and superseded by `:1465`; `:1249` is invisible.
The difference is not staleness, nor the document, nor the script — it is that one line names the
script and the other wraps. The correction block is therefore incomplete with respect to its own
rule, and no committed artifact records that.

# Impacted axes

- **operability (C1)**: the repair is real (`7/7`, rev-mode `valid=true`, mutation red and
  reproducible), but the *bounds* of the claim (N ≥ 7, the two case ids) are receipt-read. A
  future deletion of cases stays green on the counting command.
- **calibration (C2)**: the count is honest as defined and the doc-binding is correct at both call
  sites, but `mismatches` is a narrower and broader quantity than the sentence implies — narrower
  (92/120 excluded by construction), broader (m2/m3 inside it). The counter's own capability row
  is stale inside the counter's own zero.
- **freshness (C3)**: red at the integrated tip; the only clause that can turn it green is the
  one whose word "independent" the code does not enforce.

# Smallest safe corrections (ranked; nothing in the lane was edited by this seat)

1. **C3, blocking**: commit the 23 `refetch/<id>.json` records (or the claim stays failed at the
   tip). While doing it, add two conditions at `:218` — `rf.fetched_at` must parse as ISO-8601 and
   `rf.files[].url` (or a `url` field per file) must equal
   `https://chromium.googlesource.com/chromium/src/+/refs/tags/<stable>/<path>?format=TEXT` —
   otherwise the sentence must be narrowed to "a record from a distinct seat label". This is the
   single change that makes "independent re-fetch" a code condition instead of a label.
2. **C2, cheap**: extend association to the nearest enclosing paragraph when that paragraph names
   exactly one script (my probe's rule). It makes `SCORECARD.md:1249` counted, so the claim's `0`
   must then be restored by a `:1249` correction line — which is the append-only method the claim
   already uses. If the rule is not changed, the predicate sentence must say the count is over
   line-associated tallies only, and must name the three excluded classes (ambiguous association,
   non-runnable script, malformed fraction) and the two included ones (m2, m3).
3. **C1, one line**: assert the case-id set inside `runSelftest` (e.g. compare
   `results.map(r => r.id).sort()` to the seven declared ids and fail otherwise). That binds
   "N ≥ 7" and "both revision ids" to the code instead of to a human reading the tally.
4. **Claims text only**: add `r1-entry`, `f1-old-tag`, `f2-path-bound`, the 200/404 grammar and the
   404 hold rule to C3's sentence, and name `anchor_unique`/`byte_count_match`/`sha_match` in C1's.
   The code is the stricter side here; amending the sentence costs nothing and cannot weaken the
   claim.

# Checks that passed (recorded so the rounds' closures do not re-open them)

- C1: `--selftest` exit 0 with `verdict=clean cases=7 passed=7`; both revision case ids printed;
  `--rev 32008a45… --json` `valid=true` with all five conjuncts true; `mutation.txt` red and
  byte-reproducible modulo documented fixture commit ids; the diff's LANE edit is inert.
- C2: frozen bytes match `728128008e…`; the doc binding is present at both call sites; the two
  cross-document self-test cases are red on the old matcher and green on the frozen one
  (`baseline/c2-red-before-selftest.txt`, `c2-after-fix-selftest.txt`); the baseline `6` and the
  tip `0` reproduce exactly on the named lines (`:410, :1138, :1139, :1151, :1439`, `LOG.md:221`),
  and every supersession cites its own document; `LOG.md:221` is cleared by a LOG paragraph
  (`:2007`) that names the script, carries the marker, cites `LOG.md:221` and states `cases: 12`.
- C3: frozen bytes match `56763720…`; population 23 verified independently of the counter (89
  `on-release` rows, exactly 23 tagged, all at `154.0.8037.97`); 39 of 40 files are 200→200 with
  anchor-bound ranges; the 7 drifted rows all map to `S109…S115`, each opening
  `supersedes S0xx —` and each carrying `refs/tags/156.0.8078.47/`; 15 of 23 rows carry a digest,
  so `f5` binds for 15 and is vacuous for 8.

# Limits of this review

- I did not verify the *content* of the committed 154/156 bytes against the network; that is the
  refetch seats' lane and wave-1 `Refetch*` evidence. My claims about `f3` are about the binding
  chain (path ↔ sha ↔ receipt), which I re-derived from the code and re-ran.
- C3's red state is a snapshot at `32008a45` / `e1e3a15`. It is red for a *committed-absence*
  reason (`refetch/`), not for a byte disagreement; the wave-2 refetch seats are still producing
  those records. The finding is therefore "the claim is unverified at the tip and the rule that
  would verify it is the weakly-bound one", not "the 156 bytes are wrong".
- I ran no lane build, linter, or formatter; I edited no lane file; I made no commit anywhere and
  created no fixture repository.
