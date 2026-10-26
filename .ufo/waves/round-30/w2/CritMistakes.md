# CritMistakes — attack on round-30 lesson §Mistakes (M1–M6) at `072af95`

**Verdict.** I attacked the six mistake rows' evidence pointers, the "able to fail" claim behind each
fix, and the two rows that declare their fixes unlanded, in a clean `--shared` clone of
`072af95fe2822f0785a6ff88a578e2142dd258e5` (`git status --porcelain` empty) and read the lane read-only.
**M2 and M4 hold completely**: both pointers resolve line-for-line to what the row says, and their red
states reproduce from committed bytes (M2's probe: 1 / 0 / 0; the 23-row `used-by` log matches the git
blobs at baseline and tip with 0 mismatches). **M3's red state reproduces** (frozen round-29 bytes + the
catalogued `pins-f4-anchor-token` mutation → clean 20/20, exit 0; reason-pinned variant → exit 3 with
`expected_reasons ["f4-ranges"]` vs `rowReasons ["s1-drift-unsuperseded"]`; round-30 bytes + mutation →
exit 3 on `f4-anchor-lacks-range-token-unresolved`), and **M6's compensating check is real — I ran it**:
the claim's live reading gives 2/2 inside the network, and 0/2 with `l1-live` on both entries inside
`unshare -Urn`. The defects are in the *pointers and scope wording*, not in the arithmetic: M1's
"routed at `:118`" resolves to routed defect **1** (M4's), while its own defect is `:119`; M6's
`CritC2Counter.md §2` is a section that does not exist; M3's cell claims the self-test pins `reasons`
**per case** while 9 of 29 cases do (the lane SCORECARD itself says "nine reason-pinned cases"); M5 cites
a gate-mutants "counter v2 planned in SCORECARD" that is not in SCORECARD at the tip (the only counter-v2
plan there is the round-29 *release-pin* counter); and M5/M6 are the two rows with no `### M5`/`### M6`
subsection, which the round's own QUALITY 77 requires. Separately, my independent C1 run reproduces a
27/27 reading in which one kill has no killing case (`pins-f3-bytes-absent`: `exit 1, cases null,
failing_cases []`, a `sha256(null)` crash) — at the tip that fault is undisclosed and M5's
"certifies each killing case" has nothing to read for it; it was found independently by
`MeasureC1Clean` §6 and is now disclosed in the live wave-2 corrections (`e8720bc`), so I record it as
corroboration, not as a new defect against a standing claim.

M5 and M6 ship no fix red state by construction (their fixes are not landed); the red states they
do cite are the w1 attack artifacts themselves — `CritC1Counter/Z-minimal-cwd.diff` + `Z.exact.json`
and `SentinelFetchScope`'s fixture probes — and those exist and are as described.

Rev under test: `072af95fe2822f0785a6ff88a578e2142dd258e5`; the six M-rows' bytes are identical at
`072af95` and at the lane's current `e8720bc` (`sed -n '139,144p'` sha256
`144f884ae4831a8a9708b17f6633b923c9ea6ebbcc77a35bd71195075d0c6d9a`, both). The lane advanced from
`af0664e` to `e8720bc` (wave-2 corrections) during this review; every finding below is stated against
`072af95`, and where `e8720bc` already records the same thing I say so.

## What holds

| # | attack | evidence | verdict |
|---|---|---|---|
| M2 | pointer + sha + red state, re-run | `host-rate-limit-signal-classes-r14.md:6` is exactly the ceiling sentence; sha256 `844ef05f…9c42a` matches the cell. Probe re-run: staged line 6 → `CEILING_CLAIM contradicted: … -10 returned 200 (67803 bytes), -11 returned 200 (67097 bytes)`, **exit 1**; lane text "180d — the draft revision moves" → `CEILING_CLAIM none`, **exit 0**; control "-12 and later … 404" → `holds`, **exit 0**. Output identical to committed `b-demo.out` | holds |
| M2 fix target | "S116 re-pins … `-11` with `recheck: 180d`" | `git show 072af95:corpus/SOURCES.md`, S116 cells: `opened 2026-10-26`, `recheck 180d`; anchor cites `-11` (23 May 2026, expires 24 November 2026 — present at `S116.txt:8,56,66`); §3 heading line 302, the receipt quote spans 308–310 (line 311 begins "on every request.", so the Gate cell's "308–311" is one line too long — corrected in the wave-2 section), §4 line 432, example lines 323/444 all verified in the committed bytes | holds (wave 2 later changes the recheck cell to `2026-11-24` for an unrelated reason, `CritEntryPolicyFields` D4 — a tightening, not a contradiction) |
| M4 | pointer + all 23 rows + old→new log | `round-29-verifier-spotcheck.md:118` is routed defect 1 verbatim; `chromium-156-release-pin-recheck.md:3` lists all 23 ids; parsing the lesson's 23-row old→new table against `git show 061e620:corpus/SOURCES.md` and the tip registry gives **0 mismatches**; all 23 rows lacked the entry at `061e620` (23/23) and all 23 carry it now; 31 cells name the entry = 23 + the 8 superseding rows S108–S115. `a4-used-by-omits-entry` re-run: `reasons ["r3-used-by S114"]`, exit 1 | holds |
| M1 fix's mechanism | S114's own span | `html_form_element.cc:867` is exactly `executing_tool->CallDoneCallback(base::ok(String()));` (1 occurrence); committed 156 blob sha256 `2a96a97b…6102`, matching the demo's recorded value. `a-demo` re-run is **byte-identical** to committed `a-demo.out` (diff exit 0): pointer cell → `g5-quote-located`, exit 1; S111 17-word quote → also `g5`, exit 1 (line 202 re-opens with `//`, verified); S114 own-scope line 857 → admitted 1, exit 0 | holds, with the caveat in D7 |
| M3 | three red state rungs | see D3 and D8; all committed rungs reproduce with the committed bytes | holds |
| M5 pointer | `CritC1Counter.md` §1–§2 | file has `## 1. Verdict` (:8) and `## 2. Cheapest counterexample (Z)` (:24); §2 contains `<work>/mutant-<catalogue index>`, the `cwd` leak at `scripts/check-gate-mutants.mjs:142,148,152,215`, and the 27/0 result with frozen digests — exactly what the row says | holds |
| M6 pointer (part) | `SentinelFetchScope.md` | verdict states (a) `file://` reaches `admitted 1` with no network, (c) `-L` redirects off-origin and to cleartext, (d) inherits `~/.curlrc`/`~/.netrc` — the three behaviours the row names | holds |
| M5/M6 honesty | "not landed this round" | all three frozen counters are byte-identical to `claims.json.frozenDigests` at `072af95` (`02945f88…`, `cd1c27a2…`, `cadef57e…`); no counter edit exists at the tip, so the declaration is accurate | holds |
| M6 compensating check | executed, not assumed | in the clean clone: network run → `{"population":2,"admitted":2}` **exit 0**; `unshare -Urn` run → `{"population":2,"admitted":0, "reasons":["l1-live S117","l1-live S116"]}` **exit 1**. So the recorded live reading did reach the network, and the compensating check as written is runnable and true (`m6-no-network.txt`) | holds |
| class labels | vocabulary | M1/M4 `attribution`, M2 `stale-premise`, M3 `survivor`, M5 `vacuous`, M6 `scope` — all six are in the nine-term list. Nit: the lesson says "`CORPUS.md` §5 vocabulary", but `CORPUS.md` (fleet root) has no §5; it carries the nine terms and attributes them to `mistakes.md` §5 | holds (nit) |

## Defects

**D1 — M1's `routed at` pointer is one line off (reference-drift, low).**
`corpus/lessons/round-30.md:139` (table) and `:151` (subsection) cite
`corpus/lessons/round-29-verifier-spotcheck.md:118` as where the S114 defect was routed. Line 118 is
routed defect **1** ("`chromium-156-release-pin-recheck.md:3` cites all 23 re-opened rows … their
`used-by` cells omit the entry") — that is M4's defect. The S114 quote defect is `:119`
("`corpus/lessons/round-29.md:20`: S114's Gate quote reuses S111's detached-document comment"). The
intro at `:132` compounds it by citing only `:118` for "routed defects 1 and 2".
Evidence: `pointer-checks.txt`. Smallest correction: change M1's pointer to `:119` and the intro to
`:118-119`. (Not flagged by `RevUsedByChange`, which carries the same wrong line in its diff copy.)

**D2 — M6 cites a section that does not exist (reference-drift, low).**
`round-30.md:144` cites "`CritC2Counter.md` §2". That file has no numbered section: its headings are
`## Evidence` (:49), `## False refusals…` (:220), `## Defect vs tradeoff…` (:233), `## Impacted axes`
(:248), `## Smallest safe correction` (:262), `## Method…` (:294); the `file://` finding is the
Verdict (:3–6) and `### F1` (:80). A reader told "§2" cannot land. Smallest correction: cite
"Verdict, bullet (a), and §F1 (`:80–101`)".

**D3 — M3's fix cell overstates what landed (survivor, medium).**
The cell (`:141`) and the subsection (`:185–206`) say "the self-test carries `reasons: [...]` per case
and the runner compares them (`reasonsOk`), so a case cannot be satisfied by a neighbouring failure
path". Measured on `scripts/check-release-pins.mjs` at the tip: **9 of 29** cases carry an expectation
beyond exit + tally (`--selftest --json`, `expectedReasons` non-null on exactly the nine ids that start
`f1-old-tag-…`, `f2-dotdot-…`, `f3-old-bytes-never-committed-…`, `f4-range-past-last-…`,
`f4-anchor-lacks-…`, `drift-superseder-teaches-…`, `drift-superseder-not-at-…`,
`absence-404-present-…`, `absence-404-body-lacks-…`); the other 20 — including
`path-not-bound-unresolved`, the sole killer of catalogue mutant `pins-f2-path-binding` — assert exit +
tally only, which is exactly the shape `MutC3.md:56` and QUALITY 76 call "no coverage". The same gap
exists on the s106 gate (`field`/`fieldValue` on 7 of 10 cases). The lane's own SCORECARD is careful
here ("round 30 added nine reason-pinned cases"), so the lesson's "per case" contradicts the scorecard.
Note also that the mechanism was demonstrated on `range-not-in-anchor-unresolved`, which in the landed
script still has **no** reason pin. Smallest correction: "the nine cases that target the round-29
survivors pin `reasons` (and seven s106 cases pin `field`/`fieldValue`)" — or pin the rest.

**D4 — M5's compensating check, as written, cannot see the crash kill (medium at the tip; now disclosed).**
Running the frozen counter at `072af95` gives the L1 reading (`fault_total 27, fault_survivors 0,
benign_total 13, benign_killed 0`, exit 0), but one of the 27 "kills" is not a case failure:
`pins-f3-bytes-absent` is recorded `"killed": true, "exit": 1, "cases": null, "passed": null,
"failing_cases": []` — no aggregate, no case. I reproduced it from the catalogue's single-point
mutation (`if (ob === null || nb === null)` → `if (false)`) on the tip's own script bytes:
`node mutant --selftest` exits **1** with `TypeError [ERR_INVALID_ARG_TYPE] … at sha256 … at evaluate …
at runSelftest` (`f3-bytes-absent-crash.out`). The behaviour is real (the new case
`f3-old-bytes-never-committed-unresolved` deletes the old bytes, so the removed guard crashes), but the
M5 cell's method — "reads `failing_cases` per fault … certifies each killing case builds a fixture and
calls the gate's `evaluate()`" — has no killing case to read here, and the cell does not say what to do
when `failing_cases` is empty. The round's own QUALITY 76 instrument sentence ("every catalogued fault
mutant must turn its case red") is false for this mutant. Severity at the tip is tempered by the fact
that the w2 reviewer `RevC1KillAttribution` and `MeasureC1Clean` §6 found it independently, and
the live wave-2 corrections section of the lesson already names it ("One kill (`pins-f3-bytes-absent`)
is a crash on `sha256(null)`, not a named failing case"). Smallest correction: add one clause to M5 —
"…or, where `failing_cases` is empty, record the crash with the case whose fixture reaches the mutated
site", and read the C1 result as 26 attributed + 1 crash-attributed in the report.

**D5 — M5's "counter v2 … planned in SCORECARD" is not in SCORECARD and names the wrong counter (low).**
`round-30.md:143` ends "Counter v2 (next round, planned in SCORECARD): neutral run-directory names, killer
attribution in the kill rule". At `072af95` (and at `e8720bc`) `SCORECARD.md` has no gate-mutants v2 row:
its only counter-v2 plan is `SCORECARD.md:1498` — the round-29 **release-pin** counter v2 (anchor-derived
span sets, population id set). The gate-mutants v2 plan is a w2 deliverable (`w2-spec.json` item
`ScribeV2Plan`, "to become SCORECARD 'planned' rows; no lane edit"). A reader checking SCORECARD finds a
different counter's plan under the same phrase. Smallest correction: "planned for round 31
(`ScribeV2Plan`)".

**D6 — M5 and M6 have no subsections, against the round's own QUALITY 77 (low).**
`grep -c '^| M[0-9]'` → 6; `grep -c '^### M[0-9]'` → 4 (subsections at :146, :166, :185, :207).
QUALITY 77 — written this round from routed defect 3 — says a numbered mistake needs one table row *and*
one subsection, and "a row with no subsection leaves its fix and its able-to-fail state unrecorded". The
two rows without subsections are exactly the two unlanded fixes, whose compensating checks therefore live
only inside table cells. Smallest correction: add `### M5`/`### M6` with the check text (and the w2
results, once landed).

**D7 — M1's control is a fixture proxy for the repaired artifact (low, disclosure gap).**
M1's red state runs `g5-quote-located` on a *fixture frontier entry* with a synthetic receipt. S114 is not
a frontier entry, has no receipt, and its repaired cell lives in the round-30 Gate table, which no gate
parses (`g5` reads receipts; `g6-gate` only tests that the lesson file contains the receipt quote).
QUALITY 74 acknowledges this ("any Gate row no counter parses, is review"), but M1 — unlike M4, which
discloses "`r3-used-by` runs only on entries carrying a `frontier:` tag" — does not say that its
demonstration does not touch S114. Holds as a fix, but the control's reach should be stated.

**D8 — three receipt labels have no committed generating script (receipt hygiene, low).**
`e-demo.out` and `c-demo.out` label runs whose scripts are not in `c-cases/`:
`E-pins-freeze-reasons.mjs`, `E-pins-freeze-mut-f4-reasons.mjs`, `pins-head-exitcount.mjs` exist only as
`.json` (`node <name>.mjs` → module-not-found, exit 1). The substantive red state is reproducible from the
committed `…-instrumented.mjs` (I did: identical failing case, exit 3), so this does not break the
"Able to fail" claim; the three `.json` receipts alone cannot be re-run from committed bytes.

## Commands run (with exit codes)

Clone and clean state:

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q 072af95…
$ git -C "$S/clone" rev-parse HEAD                        → 072af95fe2822f0785a6ff88a578e2142dd258e5   exit 0
$ git -C "$S/clone" status --porcelain | wc -l            → 0                                          exit 0
```

Frozen C1 counter at the tip (the L1 reading, re-measured):

```
$ node scripts/check-gate-mutants.mjs --rev 072af95… --json > gate-mutants-072af95.json
  → fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0, clean true   exit 0
$ node -e '<dump fault records>'  → pins-f3-bytes-absent: killed=true exit=1 cases=null passed=null failing_cases=[]
```

M1/M4 demonstration re-run (committed harness, only the scratch root rebased):

```
$ node a-demo.mjs > a-demo.rerun2.json                     exit 0
$ diff <committed a-demo.out> a-demo.rerun2.json           exit 0 (identical)
$ grep -c 'executing_tool->CallDoneCallback(base::ok(String()));' html_form_element.cc@156 → 1
```

M2 demonstration re-run (committed probe + committed receipts):

```
$ node anchor-ceiling-probe.mjs --claim "$(sed -n '6p' …r14.md)" --receipts receipts
  → CEILING_CLAIM contradicted (-10 200, -11 200)          exit 1
$ node anchor-ceiling-probe.mjs --claim "180d — the draft revision moves" … → CEILING_CLAIM none   exit 0
$ node anchor-ceiling-probe.mjs --claim "…-12 and later currently return 404" … → holds            exit 0
```

M3 demonstration re-run (committed harnesses, `TMPDIR` in scratch):

```
$ node E-pins-freeze.mjs --selftest                        → clean 20/20        exit 0   (frozen round-29 bytes)
$ node E-pins-freeze-mut-f4.mjs --selftest                 → clean 20/20        exit 0   (the survivor)
$ node E-pins-freeze-reasons-instrumented.mjs --selftest   → clean 20/20        exit 0
$ node E-pins-freeze-mut-f4-reasons-instrumented.mjs …     → failed 20/19      exit 3
    failing case range-not-in-anchor-unresolved: expected_reasons ["f4-ranges"], reasons ["s1-drift-unsuperseded"]
$ node pins-head.mjs --selftest                            → clean 29/29        exit 0   (= 38891ca bytes, sha 915a6bb…)
$ node pins-head-mut-f4.mjs --selftest                     → failed 29/28      exit 3
    FAIL f4-anchor-lacks-range-token-unresolved expected_exit=1 exit=0 expected_unresolved=1 unresolved=0
$ node E-pins-freeze-reasons.mjs --selftest                → module not found   exit 1   (script not committed; see D8)
$ node E-pins-freeze-mut-f4-reasons.mjs --selftest         → module not found   exit 1   (ditto)
$ node pins-head-exitcount.mjs --selftest                  → module not found   exit 1   (ditto)
$ sha256 of c-cases/pins-head.mjs == 38891ca:scripts/check-release-pins.mjs  → 915a6bba…a648
$ sha256 of c-cases/E-pins-freeze.mjs == 061e620:scripts/check-release-pins.mjs → 56763720…3770
```

D4 reproduction (catalogue mutation applied to the tip's own script bytes, scratch only):

```
$ <single-point: "if (ob === null || nb === null)" → "if (false)", find occurs 1×>
$ node pins-head-mut-f3absent.mjs --selftest
  → TypeError [ERR_INVALID_ARG_TYPE] … at sha256 (…:96) … at evaluate (…:215) … at runSelftest   exit 1
```

M6 compensating check (frozen counter, clean clone):

```
$ node scripts/check-frontier-admission.mjs --rev 072af95… --frontier rate-tos-signal --since 2026-10-26 --live --json
  → population 2, admitted 2                                 exit 0
$ unshare -Urn node scripts/check-frontier-admission.mjs … --live --json
  → population 2, admitted 0, reasons ["l1-live S117","l1-live S116"]   exit 1
```

M4 log verification (lesson table vs git blobs):

```
$ node -e '<parse the 23-row old→new table; compare to git show 061e620:corpus/SOURCES.md and tip>'
  → table rows 23; mismatches []; old-era rows missing the citing entry 23/23 (all now present)
```

Pointer resolution (`pointer-checks.txt`): `round-29.md:20` = S114 cell; `…spotcheck.md:118` = routed
defect 1; `:119` = routed defect 2; `…r14.md:6` = the ceiling sentence; `MutC3.md:30` = row 8
`f4-anchor-token SURVIVED`, `:50` = survivor note 5; `CritC1Counter.md` has `## 1.` and `## 2.`;
`CritC2Counter.md` has **no** numbered section.

## Fetch record (read-only HTTPS GETs, no credentials or session material)

The two `--live` counter runs fetched both row URLs; the direct recorded re-fetch is:

| url | UTC start/end | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T07:50:37Z / 07:50:37Z | 200 | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` (identical to the committed S116 bytes) |
| https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T07:50:37Z / 07:50:37Z | 200 | 408912 | `a68b04607090ab32d6892c2d5cf8a7c08e341a8199e920bc0e8fb46592255195` (raw bytes vary per response, as the row documents) |

No API call, no login, no cookie or credential material read; the no-network run used `unshare -Urn`
(user namespace only, loopback only) and touched no host service.

## Tooling record

No tool installed, upgraded or configured; no pacman transaction (`node v24.21.0`, `git` and `curl`
pre-existing). Nothing under `$HYAKU_SCRATCH/tabi-r30/CritMistakes` remains after the receipts were
copied into this directory.

## Artifacts

- `a-demo.rerun2.json`, `a-demo.rerun.mjs` — M1/M4 re-run (byte-identical to committed `a-demo.out`).
- `gate-mutants-072af95.json` — frozen C1 counter at the tip (27/0/13/0, per-mutant `failing_cases`).
- `pins-head-selftest.json` — 29-case run used for the D3 count (9 with `expectedReasons`).
- `instrumented-mut-rerun.json` — M3 reason-pin red state re-run; failing case and reason identical to
  the committed `E-pins-freeze-mut-f4-reasons-instrumented.json`.
- `f3-bytes-absent-crash.out` — D4 crash-kill reproduction.
- `m6-no-network.txt` — M6 compensating check, network vs `unshare -Urn`.
- `pointer-checks.txt` — every pointer line read for M1/M2/M3/M5/M6.
