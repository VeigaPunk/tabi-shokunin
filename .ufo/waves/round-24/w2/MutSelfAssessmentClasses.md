# MutSelfAssessmentClasses — mutation matrix on `scripts/check-selfassessment.mjs`

Scope: run the required eight-mutant matrix against the **shipped** counter (committed
`ad125e85c235e1c4ec6a08e398bd64da01f68a08`), then extend it with attack mutants aimed at the
things the class grammar does not cover. Every fixture is a scratch git repo under
`.ufo/waves/round-24/scratch/L1Tabi24.MutSelfAssessmentClasses/fx{,2,3}/`; the counter was
invoked as `node scripts/check-selfassessment.mjs --repo <scratch> --rev <rev> --json` with
`TMPDIR=/home/vgpnk/tmp-tabi24`. The lane instrument bytes were never modified:
sha256 `1c40e938efd255825391116abb772ddf334aea0be23828a96a5b21553b7093b7` before and after
(`matrix*.json` head/tail fields). Raw outputs: `matrix.json`, `matrix2.json`, `matrix3.json`,
`tip.json`, `base.json` beside this report's driver scripts.

## 1. Required matrix — observed vs expected

| mutant | expected | observed | verdict |
|---|---|---|---|
| stale tally (12/12, gate says cases=13) | exit 1, m1 counted | exit 1, mismatches 1, m1 counted | as expected |
| correct tally (13/13) | clean | exit 0, mismatches 0 | as expected |
| superseding line (stale 12/12 then later 13/13 correction) | clean | exit 0, superseded 1 | as expected |
| contradictory receipt exit (`cat-file -e 0000000:SKILL.md` claimed 1, real 128) | exit 1, m2 counted | exit 1, m2 counted | as expected |
| matching receipt (claimed 128) | clean | exit 0 | as expected |
| out-of-grammar command (`curl … | sh`) | could-not-evaluate, not counted | exit 0, mismatches 0, couldNotEvaluate 1 | as expected |
| dirty tree (untracked stray + disposition heading) | exit 1, m3 counted | exit 1, m3 counted (observed = path count) | as expected |
| clean tree | clean | exit 0 | as expected |

All eight required mutants behave exactly as the seat description expects. The detector is
capable of failing on each class; none of the eight is a dead case.

## 2. Mutants the gate misses (attack rows)

| mutant | expected | observed | verdict |
|---|---|---|---|
| A1 stale 12/12 tally in `SHONEN.md` (SCORECARD clean) | m1 counted | exit 0, 0 findings, 0 cne | **MISSED** |
| A2 receipt `exit: "1"` (string, not number) | m2 counted or cne | exit 0, silently skipped | **MISSED** |
| A3 contradictory receipt in `.ufo/waves/…/control/` | m2 counted or cne | exit 0, skipped — only `corpus/evidence` is scanned | **MISSED** |
| A4 malformed-JSON receipt with contradictory exit | m2 counted or cne | exit 0, `catch {} → continue`, silently skipped | **MISSED** |
| A5 dirty tree, no `## Round N — executed disposition` heading | m3 counted | exit 0 — m3 is never even evaluated | **MISSED** |
| A6 stale 12/12 + gate working copy edited | m1 counted | exit 1 **only because m3 saw the dirty gate file**; m1 became could-not-evaluate, not counted | **MISSED (m1 laundered)** |
| A7 later line restates the right number with no supersede marker | m1 counted | exit 0, superseded 1 — supersession needs no marker or correction wording | **MISSED (lenient)** |
| A8 stale tally "12/12 passing" (no `--selftest`, no "cases") | m1 counted or cne | exit 0, **no finding at all** | **MISSED** |
| A9 dirty tree evaluated at the *older* rev | exit 0 | exit 1 — m3 counted against a rev that predates the dirt | **MISSED (wrong-rev attribution)** |
| A10 stale 12/12 + touched gate + no disposition heading | exit 1 | **exit 0, mismatches 0, couldNotEvaluate 1** — full laundering path: m1 laundered, m3 inert | **MISSED** |
| A11 table row with `--selftest` and `12/12` in different cells | m1 counted | exit 0, no finding — TALLY_PATTERNS[0] stops at `\|` inside 24 chars | **MISSED** |
| A13 gate selftest exits 3 (`verdict=failed cases=13 passed=11`), doc claims 13/13 | m1 counted or cne | exit 0 — the oracle's own exit code is captured (`exit: r.status`) and never consulted | **MISSED** |
| A16 `cli_cases=12` form | m1 counted | exit 0, no finding — `\bcases=` needs a word boundary; `cli_cases` has `_` | **MISSED** |
| A18 `passed=12, verdict=failed` only | m1 counted | exit 0, no finding | **MISSED** |

A14 (oracle fails + stale tally) still trips m1 via the number mismatch — as expected. A17
(`cases=12`) and A19 (`--selftest (12/12)`) are caught — the closed forms do work.

## 3. Findings against the lane (grounded)

- **F1 — C2 `after: 0` is contradicted by the round's own receipts.** Committed
  `corpus/evidence/round-24/c2-tip.json` (at `ad125e85`) records `rev b973fde…,
  mismatches: 1, clean: false, counted: [m3-unlanded-paths observed 4]`; `c2-measurements.json`
  "after" block likewise records `mismatches: 1`. A fresh run now:
  `node scripts/check-selfassessment.mjs --rev ad125e85… --json` → **exit 1, mismatches 1,
  m3 observed 5** (untracked wave-2 dispatch files: `gen-w2.mjs`, `w2-spec.json`,
  `w2-dispatch.{json,err}`, `w2/swarm-registry.json`). No committed receipt shows 0; the only
  two after-measurements (then and now) show 1. The SCORECARD prose "tip counts none" and the
  claim's `after: 0` are unreceipted.
- **F2 — C2 `before: 4` in `claims.json` understates the counter's own measurement.** At
  baseline `573c99e`: **exit 1, mismatches 5** — four m1 (`check-sources` 25↛26 at `:410`;
  `round-evidence-audit` 12↛13 at `:1138`, `:1139`, `:1151`) + one m3. The claim's prose says
  "three stale `--selftest` 12/12 figures" — it omits the `:410` finding entirely. LOG and
  SCORECARD both say "5 → 0"; the committed receipt says 5. Only `claims.json` says 4.
- **F3 — m3 is rev-independent and path-indiscriminate.** It reads the *live* working tree
  regardless of `--rev` (A9: a dirt created today counts against a rev committed yesterday),
  and counts any unignored path — including wave scaffolding the round never asserted
  (the five wave-2 dispatch files now tripping m3 at tip are orchestrator files, not lane
  claims). Consequence: `after: 0` is only ever a momentary property of tree quietness, never
  a property of the revision; the claimed after-value cannot be reproduced from committed
  bytes.
- **F4 — `clean` is defined as `mismatches === 0` with `couldNotEvaluate` unrestricted.** At
  tip: **couldNotEvaluate 79** (baseline 75; the +4 are the round's own `node scripts/…`
  receipts, which m2's grammar excludes). Kill-rule-compliant ("cne never counted as match")
  but the laundering path is real: A10 shows stale tally + tampered oracle + missing heading
  → `clean: true`. M1's byte-identity guard (A6) converts a stale tally into
  could-not-evaluate rather than a mismatch — an edit of the gate's working copy launders it,
  and only m3's path count happens to keep the run non-zero.
- **F5 — m1 scans `SCORECARD.md` only; the declared surface also names `SHONEN.md`.**
  A1 shows a stale tally there is invisible. The instrument's **own header** (`line 8`):
  `` `--selftest` (10 isolated cases `` is a stale m1-class figure — the matrix is 13 cases
  (`SELFASSESSMENT_SELFTEST … cases=13 passed=13`, verified). It sits on a surface m1 never
  reads.
- **F6 — m1 tally grammar misses the lane's own tally form.** The round's corrections block
  line `:1199` reads ``check-aria-metadata.mjs` `--self-test` → cli_cases=36, helpers=4.` —
  `cli_cases=` produces **zero** m1 findings at tip (verified: 0 findings naming
  check-aria-metadata). A stale `cli_cases` figure is uncatchable (A16). Table-format rows
  with the flag in one cell and the ratio in the next are also uncatchable (A11).
- **F7 — m2 silently skips instead of could-not-evaluate** for: `exit` present as a string
  (A2), receipts outside `corpus/evidence` (A3 — including the round's own
  `.ufo/waves/round-24/control/control-receipt.json`), and unparseable JSON (A4). None of
  these is reported anywhere in the output; they are invisible to `couldNotEvaluate` too.
- **F8 — supersession requires no marker.** Any later line that associates the script with a
  number matching the oracle's tally clears the earlier stale line (A7), regardless of whether
  the later line claims to be a correction. Designed leniency ("append-only convention"), but
  it is a false-negative vector: an accidental correct mention supersedes a deliberate stale
  claim.
- **F9 — m1 never consults the oracle's verdict/exit.** A gate whose selftest exits nonzero
  or prints `verdict=failed` still certifies a matching tally (A13); only the extracted
  number is used.

## 4. Commands run (all read-only vs the lane; fixtures under ignored scratch)

```
node scripts/check-selfassessment.mjs --selftest                        # cases=13 passed=13, exit 0
node scripts/check-selfassessment.mjs --rev ad125e85… --json            # exit 1, mismatches 1, cne 79, sup 5, findings 93
node scripts/check-selfassessment.mjs --rev 573c99e4… --json            # exit 1, mismatches 5 (4×m1 + 1×m3), cne 75
git ls-tree -r --name-only ad125e85 corpus/evidence                     # receipt list
git show ad125e85:corpus/evidence/round-24/c2-tip.json                  # mismatches: 1, clean: false @b973fde
git show ad125e85:corpus/evidence/round-24/c2-measurements.json         # before: 5, after: 1
git status --porcelain --untracked-files=all                            # 5 untracked wave-2 files at run time
git check-ignore -v .ufo/waves/round-24/scratch/x                       # .gitignore:5 — scratch ignored
node scratch/…/matrix{,2,3}.mjs                                         # 8 required + 14 attack mutants
sha256sum scripts/check-selfassessment.mjs → 1c40e938… (before == after) # counter bytes untouched
```

Verdict: the shipped counter passes its own 13-case selftest and every required mutant
behaves as expected — the instrument can fail on all three classes. But it **misses 10 attack
mutants**, and the round's headline numbers are off: `before` is 5 where `claims.json` says 4,
and `after` is 1 by both committed receipts and a fresh run, where the claim says 0 — with
`clean` reachable even while 79 receipt commands are undecidable.

No tooling installed; node v24.21.0 and git sufficed (per tooling directive: no installs
recorded, none needed; pacman untouched per guard).
