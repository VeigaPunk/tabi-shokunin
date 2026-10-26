# CritClaimSizing — tabi round 29 claim-sizing audit (attack seat)

Read: `.ufo/waves/round-29/claims.json` at `97be89bc66139eb45526a04af59a35dccc006eb9` (the freeze commit),
`/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-29.md` §6 item 9, `AXES.md`, plus the frozen counters and
the baseline receipts the claims cite. Method: read-only over committed bytes; every counterexample built in
one `git clone --shared` per control under `$HYAKU_SCRATCH/tabi-r29/CritClaimSizing` (removed at exit). No lane
file, index, jj state, sibling repo or fleet file was written. Network: none used (no Gitiles/Dash GET was needed
to falsify the claims). No tool installed.

Verdict in one line: **all three claims survive the do-nothing controls but two of the three targets are reachable
without the claimed work (C2 by suppressing the tallies, C3 by committing the 154 bytes as the 156 bytes), C2's
target is broken by C1 landing in the same round, and C1's after-state is not one value over one command.**

## Check matrix (§6.9)

| Rule | C1 | C2 | C3 |
|---|---|---|---|
| after-state = one concrete value, one command, committed bytes | **FAIL** (4 conjuncts, 3 artifacts, command covers 1) | **PARTIAL** (scalar + free-standing sha conjunct; before-receipt not parseable) | **PARTIAL** (2 values; `holds`/`drifted` needed to read the predicate; counter not byte-pinned) |
| no universal clause without enumerating counter | pass (no universal) | **FAIL** ("0" is over 6 counted while 93 findings are exempt) | pass for "each of the 23" (enumerated in `rows[]`, baseline receipt has 23 ids); **FAIL** for "independent … different seat" (string compare only) |
| axis named by the surface the round changes | pass (operability: a runnable gate's self-test) | pass (calibration: SCORECARD/LOG tallies vs gate tallies) | pass (freshness: SOURCES pin rows re-verified at the live stable) |
| each control scored with the frozen counter before data and cannot reach the target | **FAIL** (cheapest control not scored) — target nonetheless survives it | **FAIL** — target reached with zero corrections | **FAIL** — controls are the counter's own self-test cases, not a junk commit; target reached with zero new bytes |
| predicate = counter code = receipt label | **FAIL** (mutation receipt + `--rev` conjuncts have no counter) | pass (label `.mismatches` = code `:408-412` = before receipt; frozen sha matches) | **FAIL** ("independent" ≠ `rf.seat !== entry.fetched_by`) |
| freshness claim is not re-scoring an old rule | n/a | n/a | pass in form (new counter + new live surface), but the numeric delta it moves is counter coverage, not drift |
| calibration claim counts self-assessment vs observed state | n/a | pass in form (`:408` compares doc claim to gate tally), **FAIL** in discriminating power (see CX1) | n/a |

## Counterexamples (built, run, receipts committed beside this report)

### CX1 — C2 (claims.json:35) target `0` is reachable with no correction at all
Six edits that make the six stale tallies unparseable (`cases=25`→`cases=twenty-five`; `12-case`→`twelve-case`;
`(12/12)`→`(twelve of twelve)`; `12/12 exit 0`→`twelve of twelve exit 0`; `17 cases`→`seventeen cases`;
`cases=8`→`cases=eight`), committed on a baseline clone, frozen counter (sha `72812800…60c4`, verified equal to
`git show 97be89b:scripts/check-selfassessment.mjs | sha256sum`):

```
node counter.mjs --repo <clone> --rev HEAD --json
{"mismatches":0,"clean":true,"counted":[],"couldNotEvaluate":93,"superseded":5}   exit=0
```
Receipt: `CritClaimSizing/c2-suppression-control.json`, edits `CritClaimSizing/c2-suppression-edits.diff`.
No append-only correction was written; the stale sentences were obscured, and the finding disappeared rather than
being cleared. Second route, also 0: deleting the four gates whose tallies mismatch (`check-sources`,
`round-evidence-audit`, `check-freshness`, `check-selfassessment`) gives
`{"mismatches":0,"clean":true,"couldNotEvaluate":110}` exit=0 — `couldNotEvaluate` is unbounded, so every mismatch
can be converted into an exempt finding (`CritClaimSizing/c2-deleted-gates-control.json`).

### CX2 — C3 (claims.json:51) target `unresolved=0` is reachable with zero 156 bytes fetched
One-row fixture repo: the **154 bytes** committed also under `bytes/156.0.8078.47/`, receipt `fetched_by:"CritA"`,
refetch file `seat:"CritB"` — both written by the same hand. Frozen counter (sha `5676372…3770`, verified):

```
{"receipt_present":true,"population":1,"resolved":1,"unresolved":0,"holds":1,"drifted":0,"clean":true}  exit=0
```
Receipt: `CritClaimSizing/c3-copied-old-as-new.json`, fixture tree `CritClaimSizing/c3-fixture-tree.txt`.
Why it cannot fail: with ranges, `holds` is `blockIn(oldLines, newLines)` (`scripts/check-release-pins.mjs:239`) and
identical text trivially contains the old lines; with no ranges it is `old_sha256 === new_sha256` (`:242`). The only
guard is `f6`, which is `rf.seat !== entry.fetched_by` (`:218`) — two free strings, no author, no signature, no
commit identity. The claim's word **independent** (`claims.json:47`) is not what the code tests, so predicate ≠
counter. `copiedOldAsNewJunk` (`claims.json:55`) passes only where the file *changed and* the receipt/refetch shas
disagree — both artifacts are authored by the round that is being scored.

### CX3 — cross-claim: C1 landing creates a seventh C2 mismatch, so C2's `0` fails at the merged tip
C2's target is `0` over the counted set (`claims.json:35`). At baseline, `SCORECARD.md:1438` is exempt
(`couldNotEvaluate: "self-test printed no tally"` — `c2-before-frozen-counter-cleanbase.json.txt`). C1's target
requires that same gate to print a tally (`claims.json:18,21`). Once it does, the counter runs the gate
(`scripts/check-selfassessment.mjs:155` gate now runnable) and counts the line's `5 cases` against the observed 7:

```
{"mismatches":1,"counted":[{"doc":"SCORECARD.md","line":1438,"claimed":5,"observed":7}],"couldNotEvaluate":92}  exit=1
```
Receipt: `CritClaimSizing/c2-c1-coupling-control.json` (baseline clone with the six tallies suppressed + an
import-only s106 gate that prints `cases=7`). Consequences:
- C2's `before` (`claims.json:34`) under-counts by one at the round's tip: 6 is the count *only while C1 has not
  landed*. The same-round tip count is 7 (or 1 if the six are suppressed).
- `separability` (`claims.json:58`) is true only in the direction it states ("if C1 does not land … C2 is
  unaffected"); it does not say, and must now record, that C1 landing **adds** a C2 finding.
- The declared six corrections cannot reach the declared 0 at REV; the seventh (`SCORECARD.md:1438`) must be
  corrected too, which is within C2's frozen target (no narrowing) but outside its declared before-set.

## Per-claim defects

### C1 — operability gate repair (claims.json:15-26)

| # | path:line | Defect |
|---|---|---|
| D1 | `claims.json:18-19` | Predicate is a 4-part conjunction — self-test exit/tally, two case ids, a committed mutation receipt, and `--rev REV --json valid=true` — while `countingCommand` (`:19`) covers only the self-test. Not one value over one command; the receipt is a text file no command re-derives, and the `--rev` verdict is a second command. |
| D2 | `claims.json:18` | The mutation receipt is unbound: no sha256 of the mutated copy, no harness, no diff/hash inside the receipt, and "the same self-test run" is unverifiable. A seat can hand-write `corpus/evidence/round-29/s106-selftest/mutation.txt`. This is the round-28 self-grading failure repeated (the seat authors both the artifact and its oracle). |
| D3 | `claims.json:18` (conjunct 4) | `--rev REV --json valid=true` has **no before** (`:20` records only the crash) and depends on production evidence outside the stated scope. The claim cannot plan for it; if the real S106 receipt is not `valid` at REV, C1 fails for a reason its before never measured. |
| D4 | `claims.json:18,21` vs `scripts/check-s106-evidence.mjs:301` | The target is satisfiable by deleting `field: "revision_match"` from `measured-revision-bytes-match` (removing the exercise) while `if (c.field) ok = ok && out[c.field] === false;` stays inverted. Nothing in the predicate requires a case whose expected field value is `true`, so the runner inversion the Goal names as defect (b) is not bound by the claim. |
| D5 | `claims.json:24-25` | Cheapest control not scored before freeze. The declared junk control *also* adds the import; the obvious cheapest control is the import alone. I ran it (`CritClaimSizing/c1-import-only.txt`): `S106_SELFTEST verdict=failed cases=7 passed=5`, `exit=3` — it does **not** reach the target, so the target survives the control, but §6.9's receipt for the cheapest control is missing. |
| D6 | `claims.json:17` | Attribution verified, not a defect: round-28 routed defects 1 and 2 (`corpus/lessons/round-28-verifier-spotcheck.md:88-90`) do cover the inverted `:301`, the uncommitted mismatch receipt and the missing post-edit `--rev`/self-test evidence. |

Also observed, not a sizing defect: `scripts/check-s106-evidence.mjs` is byte-identical at `856fa9e` and `97be89b`
(sha `0f5e7c47…a21e6ff`), so `:267`/`:301` are current line numbers.

### C2 — calibration (claims.json:29-42)

| # | path:line | Defect |
|---|---|---|
| D7 | `claims.json:35-36` + CX1 | Target `0` is reachable by suppressing the six tallies (and by deleting the mismatching gates → `couldNotEvaluate 110`). The control set (`:38-39`) only covers do-nothing and cross-document citations. |
| D8 | `claims.json:32` | The "0" is a universal statement over the lane's self-assessment, but the counter exempts every `couldNotEvaluate` finding (93 at baseline; `scripts/check-selfassessment.mjs:408` filters `observed !== null`). A calibration claim read as "self-assessment matches observed state" is not what 0 proves. |
| D9 | `claims.json:34` + CX3 | `before` is not closed over C1: after C1 lands, `SCORECARD.md:1438` is a counted 5-vs-7 mismatch. The declared six corrections cannot reach the declared target at the round's tip; the seventh line must be corrected (or the claim reports 1). |
| D10 | `.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt` (byte 42330) | The before receipt is not valid JSON: a trailing `exit=1` line follows the closing brace, so `jq '.mismatches'` prints `6` and **exits 5**. The closure's one-command re-derivation of the before value fails on the committed artifact. The `.json.txt` name hides it. |
| D11 | `claims.json:33` vs `:36` | `countingCommand` omits the frozen-sha check the kill rule requires; a re-derivation with an edited counter passes the command and fails the kill rule silently. |
| — | `claims.json:31-32` | Credit where due: the predicate matches the counter code. The document binding is real (frozen cross-doc control `mismatches:6` vs old counter `mismatches:0`, verified with `jq`), the frozen sha equals the committed blob, and the red-before/after selftest receipts (`22/20` → `22/22`) support the `redBefore` field. C2 is the best-formed of the three; its hole is the target's discriminating power, not its wording. |

### C3 — freshness (claims.json:44-57)

| # | path:line | Defect |
|---|---|---|
| D12 | `claims.json:47` vs `scripts/check-release-pins.mjs:218` | "an independent re-fetch record from a different seat" is code-visible only as `rf.seat !== entry.fetched_by`. False provenance: one author, two files, two strings. The label the receipt prints (`resolved`) overstates what was checked. |
| D13 | `claims.json:47,51` + CX2 | `unresolved=0` does not require any 156 byte to be fetched: 154 bytes committed under the 156 path give `holds` (`:239`, `:242`) and `f6` is authored by the same round. The target does not distinguish "re-verified at the new stable" from "copied the old bytes". |
| D14 | `claims.json:47` | The counter is **not byte-pinned** by the predicate (contrast C2 at `:32`). `baseline/frozen-counter-sha256.txt` records `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770` but the predicate never cites it; a seat may edit `scripts/check-release-pins.mjs` after seeing the 23-unresolved baseline and still satisfy the predicate's letter. |
| D15 | `claims.json:52` | The kill rule carries a second, unmeasurable condition: "any drifted row whose citing knowledge entries carry no round-29 recheck note". The frozen counter never reads `corpus/knowledge/` — no enumeration of "citing knowledge entries" exists in the command, so this is a universal clause without an enumerating counter, and predicate ≠ kill rule ≠ label. |
| D16 | `claims.json:55-56` | Both junk controls are the counter's own self-test cases (`baseline/c3-selftest-frozen.txt`), not a junk commit scored with the frozen counter on a lane clone — the kake-r34 pattern §6.9 names. Consequently no control measures *drift*: the do-nothing baseline's 23 unresolved rows carry one reason each, `r1-entry receipt absent` (`baseline/c3-before.json`), i.e. the "before" measures receipt absence, not staleness. |
| D17 | `claims.json:48,51` | `countingCommand` projects `{population,unresolved,holds,drifted}`, which cannot show the predicate's per-row conditions (digest match, anchor-bound ranges, supersession). `holds`/`drifted` are close, but a row resolved by supersession is invisible in the projection; the command as written is weaker than the predicate it measures. |

Verified premises of C3 (not defects): the trigger is real — `chromiumdash-stable-linux.json` sha256
`90abf2c3…7fe33` matches `claims.json:49`; 23 of the 81 `on-release` rows carry `refs/tags/154.0.8037.97/`
(`git show 856fa9e:corpus/SOURCES.md | grep -E '^\| *S[0-9]{3,} .*\| *on-release *\|' | wc -l` → 81; the same
filter + `grep -c 'refs/tags/154\.0\.8037\.97/'` → 23, matching `population=23`); no release-pin counter existed
before this round, so the freshness axis naming is not a re-score of a held rule.

## Impacted axes

| Axis | Impact | Why |
|---|---|---|
| calibration | **at risk (worst)** | C2's target is met by hiding findings (CX1) and is broken by C1 (CX3). If the lane lands C2 by suppressing edits or reports `0` while `couldNotEvaluate` grows, calibration is harmed, not improved. |
| freshness | **at risk** | C3's `resolved` label would certify rows re-verified at 156 that were never fetched (CX2), and "independent" would be a claim the counter cannot support. |
| operability | **partly at risk** | C1 does make a broken gate runnable, but without a case asserting a `true` field (D4) the repaired runner's inversion survives the claim. |
| coverage, depth, adjacency | unchanged | no coverage/depth claim (`claims.json:60`); no surface moved. |
| discernment | **at risk** | The controls as frozen are scored by the round on itself (C1's mutation receipt, C3's self-test cases); only C2 has an outside comparison. |

## Smallest safe corrections (for the round owner; I do not edit production code)

1. **C2 (must, before reporting):** add `SCORECARD.md:1438` to the corrections (append-only exact correction with
   the observed 7), and record in the report that the tip count is 7 because C1 landed — F(CX3). Keep the declared
   target `0`; do not narrow it. Also re-commit the before receipt as parseable JSON (a sibling
   `.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json` without the trailing `exit=1`), and add
   to C2's evidence a fourth receipt: **junk-control `mismatches` must stay `> 0`** under a tally-obscuring clone
   (the counter I ran), so the closure sees the target is discriminating.
2. **C2 (predicate honesty):** report the target as "6/7 counted mismatches cleared; `couldNotEvaluate` unchanged at
   93 (no finding removed from the count)" — i.e. paste `mismatches` **and** `couldNotEvaluate` beside each other so
   the closure can see no claim was hidden (CX1). Since the claims are frozen, this is reporting, not re-scoring.
3. **C3 (must):** do not report `unresolved=0` as "re-verified at 156" unless each of the 23 rows' 156 bytes has a
   provenance the closure can check without trusting the receipt: paste, per row, the Gitiles HTTP status + decoded
   sha256 actually observed this round and the two seat identities as *commit-bound evidence* (e.g. the refetch file
   committed by a different seat's own lane commit), and state plainly that the counter's `f6` is a string compare.
   Alternatively report C3 as failed-by-design and route the counter (`f6` author binding, `holds` requiring
   `old_sha256 !== new_sha256` for changed anchors) to round 30 as a frozen-counter amendment.
4. **C3 (predicate pinning):** cite `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770` in the report
   next to every C3 measurement, and re-verify it before the after-run; the claim text cannot be changed, the
   evidence can carry the pin.
5. **C1:** report the missing `--rev REV --json` before; if it is `false`, C1 is an honest stop on that conjunct
   (do not drop it). Add the import-only control receipt (D5, in this directory) to the wave evidence so the
   cheapest-control rule is satisfied on the record, and make sure the repaired case set includes one case whose
   expected field value is `true` (that is the only thing that binds `:301`); if it does not, report the inversion
   as unrepaired rather than closing the claim.
6. **Round lesson candidate (discernment):** "a target whose count is a subset of a larger exempt bucket is not a
   target" — C2's `0 of 6` over `93 couldNotEvaluate`, and C3's `0` over a `holds` computed from self-authored
   bytes, share the class. The criterion belongs in `corpus/QUALITY.md` with both counterexamples as the paired
   controls.

## Commands run (verbatim) and exit codes

```
git -C … log/show 97be89b                  # freeze commit contents: claims.json + both counters + baseline receipts
git show 97be89b:scripts/check-release-pins.mjs | sha256sum   -> 5676372…3770   (== baseline/frozen-counter-sha256.txt)
git show 97be89b:scripts/check-selfassessment.mjs | sha256sum -> 7281280…60c4   (== claims.json:32)
git show 97be89b:.ufo/waves/round-29/baseline/chromiumdash-stable-linux.json | sha256sum -> 90abf2c…7fe33 (== claims.json:49)
git show 856fa9e:scripts/check-s106-evidence.mjs | sha256sum  -> 0f5e7c47…a21e6ff (== at 97be89b; :267/:301 current)
jq '{mismatches,clean,counted:(.counted|length),couldNotEvaluate,superseded}' baseline/c2-control-crossdoc-frozencounter.json
   -> {"mismatches":6,"clean":false,"counted":6,"couldNotEvaluate":93,"superseded":5}
jq … baseline/c2-control-crossdoc-oldcounter.json -> {"mismatches":0,"clean":true,...}
jq '{mismatches,clean,counted:(.counted|length),couldNotEvaluate,superseded}' baseline/c2-before-frozen-counter-cleanbase.json.txt
   -> {"mismatches":6,"clean":false,"counted":6,"couldNotEvaluate":93,"superseded":5}      [jq exit 5: trailing `exit=1`]

# CX1 (suppression), scratch clone of 856fa9e, six edits, one commit 8ce5226, frozen counter:
node counter.mjs --repo <clone> --rev HEAD --json   -> mismatches 0, clean true, counted [], couldNotEvaluate 93   exit=0
# CX1b (gate deletion), commit e2d1a4e:            -> mismatches 0, clean true, couldNotEvaluate 110              exit=0
# D5  (C1 cheapest control: existsSync import only): node gate.mjs --selftest ->
#     S106_SELFTEST verdict=failed cases=7 passed=5                                                             exit=3
# CX2 (C3 copied-old-as-new, 1-row fixture, commit 2e76020, frozen counter):
node pins.mjs --repo <fixture> --rev HEAD --stable 156.0.8078.47 --json
   -> population 1, resolved 1, unresolved 0, holds 1, drifted 0, clean true                                     exit=0
# CX3 (C1→C2 coupling, baseline clone + import-only 7-case gate, commit 81b899a, frozen counter):
node counter.mjs --repo <clone> --rev HEAD --json
   -> mismatches 1, counted [{SCORECARD.md:1438, 5 vs 7}], couldNotEvaluate 92                                  exit=1
```

Receipts: `CritClaimSizing/c1-import-only.txt`, `c2-suppression-control.json`, `c2-suppression-edits.diff`,
`c2-deleted-gates-control.json`, `c2-c1-coupling-control.json`, `c3-copied-old-as-new.json`,
`c3-fixture-tree.txt`.

## Discipline note

Scratch: `$HYAKU_SCRATCH=/fast/scratch/hyaku`, one `git clone --shared` per control (3 total), every `git -C`
named and `rev-parse --show-toplevel` verified before the first fixture commit; `trap`-free cleanup done
(`rm -rf -- /fast/scratch/hyaku/tabi-r29/CritClaimSizing`), receipts copied into this directory first, so the
tree is gone. `/tmp` unused. Lane writes: this report and `CritClaimSizing/` only; the lane index, jj state,
`MANIFEST.json` and the fleet repo untouched. No `agent://all` message, no subagent, no build/lint/format of the lane.
