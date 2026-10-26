# ScribeMistakes — round-30 w1 (tabi), mistake rows M1–M4

Seat: `ScribeMistakes` (leaf; no subagents). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; every measurement ran
in the seat's own `git clone --shared` checked out at `061e62024c0523d3c6c7e819506a773ff2cd7d75` (`git status --porcelain`
0 lines). No lane file, index, jj state or fleet repo was written; the proposed lesson change is a patch.

## Verdict

All four rows are evidenced and every fix is shown able to fail against a stored red state. **M1** (attribution): round-29's
S114 Gate quote is S111's pointer cell; the frozen frontier counter's `g5-quote-located` rejects both the pointer text and —
a fact not in the round-29 routing — S111's 17-word quote itself, which is **not** contiguous in the committed 156 bytes
because line 202 re-opens with `//`; S114's own-scope quote at `:857` is admitted by the same fixture, so the harness is not
failing for an unrelated reason. **M2** (stale-premise): the staged package anchor's "`-10` and later currently return 404"
is contradicted by live `ietf.org` archive fetches on 2026-10-26T07:06:06Z — `-09`, `-10`, `-11` all HTTP 200, only `-12`
404 — and the lane's `-11` bytes are byte-identical to the live bytes (`d6016dd0…d412`). **M3** (survivor): the
`pins-f4-anchor-token` mutant is reproduced as SURVIVED on the frozen round-29 self-test (clean 20/20, exit 0) and is caught
only when a per-case `reasons` expectation is added (exit 1 / unresolved 1 unchanged, `rowReasons ["s1-drift-unsuperseded"]`
vs expected `["f4-ranges"]`); the round-30 case set kills it through a new case whose bypass changes the verdict. **M4**
(attribution, routed defect 1): `r3-used-by` rejects a row whose `used-by` omits the citing entry (fixture exit 1,
`r3-used-by S114`), with the scope limit that it reads only frontier-tagged entries. One calibration note: for the
`pins-f4-anchor-token` mutant the round-30 case set's expected exit/unresolved is sufficient without the reason pin; the
reason pin's demonstrated value is the frozen-bytes wrong-path case (M3 below).

## Deliverable

`corpus/lessons/round-30.md` gains `## Mistakes` with M1–M4: 4 table rows and 4 subsections (counted equal). Patch:
`.ufo/waves/round-30/w1/ScribeMistakes/round-30-mistakes.patch`, generated against **lane tip `38891ca`** (`git apply --check`
→ 0, `git apply` → 0, `git apply -R` → 0 in the scratch clone). Source of the rows:
`.ufo/waves/round-30/w1/ScribeMistakes/report-rows.md`.

Contract discrepancy: the seat contract names the lane tip as `061e620…`, but `git -C <lane> rev-parse HEAD` is
`38891ca0bd28fff45b6736edfcad93438b782063` (the `061e620…` freeze commit plus the C1/C2 data commit). `round-30.md` does not
exist at `061e620…`, so a patch taken with `git diff 061e620` would delete and re-add the whole file; the patch is therefore
based on `38891ca` and applies cleanly to the current lane file.

## Evidence

### Baseline and frozen bytes

```
$ git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q 061e620…
                                                                        exit 0
$ git -C "$S/clone" rev-parse HEAD    → 061e62024c0523d3c6c7e819506a773ff2cd7d75
$ git -C "$S/clone" status --porcelain | wc -l → 0
$ sha256sum scripts/check-frontier-admission.mjs scripts/check-gate-mutants.mjs scripts/gate-mutants.json
  cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  check-frontier-admission.mjs
  02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  check-gate-mutants.mjs
  cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  gate-mutants.json
                                                                        exit 0  (all three = claims.json frozenDigests)
```

### M1 — S114's Gate quote is S111's (attribution)

Evidence pointer: `corpus/lessons/round-29.md:20` (S114 row, quote cell = "`:201-202` same comment as S111 (same blob,
different scope: navigation sentinel)"), routed at `corpus/lessons/round-29-verifier-spotcheck.md:118` (defect 2). Both
resolve in the lane checkout.

Quote location over the committed 156 bytes (`quote-location.txt`, normalisation = whitespace collapse, the counter's
non-HTML path; exit 0):

```
html_form_element.cc@156 ABSENT  17w  S111 round-29 Gate quote
html_form_element.cc@156 PRESENT 11w  S111 first line only
html_form_element.cc@156 ABSENT  11w  S114 round-29 Gate cell (pointer text)
html_form_element.cc@156 PRESENT  1w  S114 round-30 re-grounded (:867)
html_form_element.cc@156 PRESENT 13w  S114 own-scope line 857
html_form_element.cc@156 PRESENT  7w  S115 round-30 re-grounded (:203-206)
html_form_element.cc@156 ABSENT   9w  S110/S115 round-29 message
```

The 156 blob is `sha256 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102`; lines 201–202 are
`// Filling out … events,` and `// whose handlers may have detached the document.`, so the quote's join drops the second
`//` and the quote is not a substring — the reuse fails the same gate for its own reason. (Round-29's routing covers only
the S110/S115 two-literal message; this quote's `//` join is not mentioned there.)

Fix able to fail — frozen frontier counter `cadef57e…9eca`, four fixture repos, `TMPDIR` under scratch
(`a-demo.out`, `a-demo.mjs`; exit 0):

| case | receipt quote | bytes | counter result |
|---|---|---|---|
| a1 | round-29 S114 Gate cell (11 w) | 156 `html_form_element.cc` | exit 1, population 1, admitted 0, `reasons ["g5-quote-located S114"]` |
| a2 | S111's 17-word quote | 156 `html_form_element.cc` | exit 1, admitted 0, `reasons ["g5-quote-located S114"]` |
| a3 | S111's 17-word quote | 156 `html_select_element.cc` | exit 1, admitted 0, `reasons ["g5-quote-located S114"]` |
| a5 | S114 own-scope line 857 (13 w) | 156 `html_form_element.cc` | **exit 0, admitted 1** (positive control) |

The fix landed in the lesson: `round-30.md` §"Re-grounded Gate quotes for S110, S114, S115" (S114 quote
`executing_tool->CallDoneCallback(base::ok(String()));` at `:867`, located above).

### M2 — a package anchor's revision ceiling (stale-premise)

Evidence pointer: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md:6`
(file sha256 `844ef05f5d2531b2cf96958a0fa305b86d30e92c4cecab48d5c17fef7ea9c42a`), text:
`recheck: 180d — the draft revision moves; -10 and later currently return 404 (not run in this round)`.

Live read-only GETs (curl, no credentials), receipts `ScribeMistakes/receipts/draft-*.json`:

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | 2026-10-26T07:06:06Z | 200 | 67876 | `e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee` |
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | 2026-10-26T07:06:06Z | 200 | 67803 | `f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5` |
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T07:06:06Z | 200 | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt | 2026-10-26T07:06:06Z | 404 | 77297 | `db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898` |

The live `-11` sha equals the lane's committed `corpus/evidence/round-30/frontier/bytes/S116.txt`
(`d6016dd0db5a…d412`), so the lane's re-pin is byte-consistent with the live archive; only the staged ceiling claim is false.

Fix able to fail (`anchor-ceiling-probe.mjs`, `b-demo.out`):

```
B1 staged line 6        → CEILING_CLAIM contradicted: … -10 returned 200 (67803 bytes), -11 returned 200 (67097 bytes)   exit 1
B2 lane recheck text    → CEILING_CLAIM none (no '-N and later … 404' assertion)                                          exit 0
B3 control -12 and later→ CEILING_CLAIM holds (-12)                                                                       exit 0
B4 control -09 and later→ CEILING_CLAIM contradicted: -09 200, -10 200, -11 200                                           exit 1
```

The probe reads receipt statuses, so it neither always fails nor always passes; B3 is the true-claim control.

### M3 — exit + count only let a mutant through the wrong path (survivor)

Evidence pointer: `.ufo/waves/round-29/w1/MutC3.md` mutant row 8 (`f4-anchor-token`, **SURVIVED**) and survivor note 5
("the self-test asserts only exit + unresolved count, not the reason"). Both resolve in the lane.

Catalogue mutant `pins-f4-anchor-token` (find
`a < 1 || b < a || b > oldLines.length || !anchorHasRange(row.anchor, a, b)` → `a < 1 || b < a || b > oldLines.length`),
find string occurs exactly once in both revisions:

```
$ node E-pins-freeze.mjs --selftest --json                              (061e620 bytes, sha256 56763720…3770)
  verdict=clean cases=20 passed=20                                      exit 0
$ node E-pins-freeze-mut-f4.mjs --selftest --json                       (same bytes + mutant)
  verdict=clean cases=20 passed=20                                      exit 0   ← SURVIVED, reproduces MutC3 #5
$ node E-pins-freeze-reasons-instrumented.mjs --selftest --json         (+ reasons:["f4-ranges"] on range-not-in-anchor-unresolved, reason comparison, instrumented row dump)
  verdict=clean cases=20 passed=20                                      exit 0
$ node E-pins-freeze-mut-f4-reasons-instrumented.mjs --selftest --json  (same + mutant)
  verdict=failed cases=20 passed=19                                     exit 3
  {"id":"range-not-in-anchor-unresolved","exit":1,"unresolved":1,
   "expectedReasons":["f4-ranges"],"rowReasons":["s1-drift-unsuperseded"]}
$ node C/pins-head.mjs --selftest --json                                (38891ca bytes, 29 cases)
  verdict=clean cases=29 passed=29                                      exit 0
$ node C/pins-head-mut-f4.mjs --selftest --json
  verdict=failed cases=29 passed=28                                     exit 3
  FAIL case=f4-anchor-lacks-range-token-unresolved exit=0 unresolved=0 expected_reasons=["f4-ranges"]
$ node C/pins-head-mut-f4-exitcount.mjs --selftest --json               (assertion reverted to exit+count only)
  verdict=failed cases=29 passed=28                                     exit 3
```

Calibration: on the landed case set the new case's expected verdict alone kills the mutant (exit 0 vs expected 1), so the
`reasons` field is not the sole kill there; its demonstrated independent value is the frozen-bytes run, where exit and
unresolved are identical and only `rowReasons` differs. Fix landed: `38891ca` adds `reasons` per case in
`scripts/check-release-pins.mjs` and `field`/`fieldValue` cases in `scripts/check-s106-evidence.mjs`
(`same-length-tamper-invalid`, `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`).

### M4 — used-by reciprocity (attribution; routed defect 1)

Evidence pointer: `corpus/lessons/round-29-verifier-spotcheck.md:118`: `corpus/knowledge/chromium-156-release-pin-recheck.md:3`
cites 23 re-opened rows whose `used-by` omit the entry. Fix landed: round-30.md §"`used-by` changes" lists the 23 old→new
cells; `corpus/SOURCES.md` at the lane tip names the entry in 31 lines (`grep -c` → 31), and S033's cell now carries it.

Fix able to fail (`a-demo.out`, case `a4-used-by-omits-entry`): a row whose `used-by` is `corpus/knowledge/other.md` while
the tagged entry is `corpus/knowledge/fx-entry.md` → exit 1, population 1, admitted 0, `reasons ["r3-used-by S114"]`.
Scope limit: `r3-used-by` evaluates only entries carrying a `frontier:` tag, so reciprocity outside that surface remains
unchecked by any gate — the 23-row fix is a curation edit.

## Gates / checks run (commands and exit codes)

| command (cwd as noted) | exit |
|---|---|
| `git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q 061e620…` | 0 |
| `sha256sum` frozen counter + catalogue (above) | 0, all match `claims.json` |
| `TMPDIR=$S/tmp node a-demo.mjs` | 0 |
| 4 × `curl -sS -L --max-time 60 … draft-…-{09,10,11,12}.txt` | 0 (statuses in table) |
| `node anchor-ceiling-probe.mjs --claim <staged line 6> --receipts receipts` | 1 (intended red) |
| `node anchor-ceiling-probe.mjs --claim "recheck: 180d (…)"` | 0 |
| `node anchor-ceiling-probe.mjs --claim "-12 and later … 404"` | 0 |
| `node anchor-ceiling-probe.mjs --claim "-09 and later … 404"` | 1 |
| `node E-pins-freeze.mjs --selftest --json` / `…-mut-f4` | 0 / 0 (survivor) |
| `node E-pins-freeze-reasons-instrumented.mjs` / `…-mut-f4-…` | 0 / 3 |
| `node C/pins-head.mjs` / `…-mut-f4` / `…-mut-f4-exitcount` | 0 / 3 / 3 |
| quote-location check over committed 156 bytes | 0 |
| `git -C "$S/clone" apply --check|apply|apply -R round-30-mistakes.patch` | 0 / 0 / 0 |

No lane counter (`check-gate-mutants.mjs`, `check-frontier-admission.mjs` production mode on the lane) was run against the
lane: C1/C2 verdicts are the executors' and L1's to measure. The frozen frontier counter was run only as a library-style CLI
over the seat's own fixture repos (`--repo <fixture>`).

## Touched surfaces

- Wrote only: `tabi-shokunin/.ufo/waves/round-30/w1/ScribeMistakes/` (rows, patch, receipts, demo scripts and outputs) and
  `$HYAKU_SCRATCH/tabi-r30/ScribeMistakes/` (clone at `061e620…`, fixture repos, mutant/self-test copies, live bytes).
- Read-only: lane git (`rev-parse`, `show`, `log`), committed 156/round-30 bytes, `corpus/lessons/*`, `corpus/SOURCES.md`,
  `scripts/*` at two revisions, `/home/vgpnk/Projects/shokuknow/merge/tabi/…` (no package tools run),
  `/home/vgpnk/Projects/shokunin/CORPUS.md`.
- Not touched: lane tracked files, lane index, jj state, fleet repo, sibling lanes, package tree. No commit in the lane or in
  the clone; the only commits are inside the seat's fixture repos.

## Out of scope / not verified

- C1 (`fault_survivors 0`, `benign_killed 0`) and C2 (`population 2 / admitted 2`) verdicts were not measured here.
- No claim that `check-release-pins.mjs` or `check-s106-evidence.mjs` are clean at `38891ca` in production mode; only their
  `--selftest` runs above.
- M4's gate coverage outside the frontier surface is unchecked (stated as a limit, not a defect claim).
- The round-29 S110/S115 two-literal analysis in `round-30.md` was re-confirmed only for the `html_form_element.cc`
  message (absent, 9 w); no fresh live Gitiles refetch was made this seat (no need for these rows).

## Findings for the L1 / closure

1. S111's round-29 Gate quote is itself non-contiguous across a `//` comment marker (new fact relative to routed defect 2);
   any future citation of it must quote one line or include the marker.
2. The lane tip is `38891ca`, not `061e620` as the seat contract states; the patch is based on `38891ca` and applies.
3. `r3-used-by` is frontier-scoped; non-frontier reciprocity has no gate.
4. Calibration of M3: the reason pin is the sole discriminator only on the frozen self-test; on the landed case set the new
   case's expected verdict also kills the mutant.

## Tooling record

No tools installed or upgraded; no pacman transaction. Used pre-existing `node` (v24.21.0, printed in a scratch stack trace
this seat), `git`, `curl`, `sha256sum`; the `git` version was not recorded this seat, and nothing was installed.

## Artifact paths (relative to the lane root)

- `.ufo/waves/round-30/w1/ScribeMistakes.md` — this report
- `.ufo/waves/round-30/w1/ScribeMistakes/report-rows.md` — the `## Mistakes` section as proposed (4 rows, 4 subsections)
- `.ufo/waves/round-30/w1/ScribeMistakes/round-30-mistakes.patch` — applies to `38891ca` (`--check` 0)
- `.ufo/waves/round-30/w1/ScribeMistakes/a-demo.mjs`, `a-demo.out`, `quote-location.txt` — M1/M4 fixture evidence
- `.ufo/waves/round-30/w1/ScribeMistakes/anchor-ceiling-probe.mjs`, `b-demo.out`, `receipts/draft-{09,10,11,12}.json` — M2
- `.ufo/waves/round-30/w1/ScribeMistakes/c-demo.out`, `e-demo.out`, `c-cases/` — M3 mutants, self-test outputs, instrumented harnesses
