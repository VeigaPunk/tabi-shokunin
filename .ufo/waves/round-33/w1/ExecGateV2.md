# ExecGateV2 — gate v2 of `scripts/check-bidi-runtime.mjs` (round 33, claim C2, receipt leg)

Seat `ExecGateV2`. Work clone: `/fast/scratch/hyaku/tabi-r33/ExecGateV2/clone` detached at
`e6b0a9074d434ccc307badd312ae7379d1193fea`; v2 committed there as
`b04b1fee2b7fb6c6be9ca6b55fd936c756e89373` (one file changed: `scripts/check-bidi-runtime.mjs`,
+426/−99). Delivered file sha256 `7cda6e4658541abc178af8e08eea59b539db2d741798be483ecbb445a82344f7`.

## Verdict

Gate v2 is built, and every requirement of the seat item is measured rather than asserted. The
frozen battery (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`, bytes unchanged,
`--rev b04b1fe --repo $S/clone --json`) returns **predicate true, exit 0**: H0, H1 and H2 accepted
at population 17 / admitted 16 / failing 0, and **0 of 8 forgeries accepted** (F1 `t1-receipt`,
F2 `x3-duplicate-id`, F3/F4/F5/F6 `t1-receipt`, F7 `x4-measured-cell` with admitted 15, F8
`s1-source-row` with population 17); `--selftest` exits 0 with **cases=44 passed=44**; the gate
source carries **no honest digest literal and no 12-hex prefix** (`digestLiterals []`, and my own
grep of all five prefixes is 0). All 27 v1 cases still pass unchanged, and the 9 round-32 MutC1
survivors (M04, M06, M09, M10, M11, M14, M17, M18, M19) are each killed by exactly **one** new
case and nothing else (43/44 under every mutant, selftest exit 3). `liveRecord` is byte-identical
to v1's (8,505 bytes both), `parseArgs` and the `--help` line are byte-identical, and every JSON
field v1 emits is still emitted (six fields added, two row fields added). One cross-file
obligation is measured and must be carried by the L1 at integration: v2's case count turns the two
declared `27/27` tallies for this gate (`SCORECARD.md:1657`, `SKILL.md:2626`) into
`m1-selftest-tally` mismatches (0 → 2 at my REV), and an appended correction paragraph restores
**mismatches 0 with 0 deleted lines** (probe commit `5271d552a117518a2bfed0c48898c88593da4700`,
`--json` exit 0, `superseded` 39 → 41) — see §5.

## 1. What v2 decides (code map, delivered file)

| Rule (seat item) | v2 site | Finding id |
|---|---|---|
| population = every row whose Measured cell is non-empty | `check-bidi-runtime.mjs:691` | — |
| a Measured cell other than a bare `yes`/`no` (+ dash reason) | `:142` (`MEASURED`), `:361` (`measuredVerdict`), `:800` | `x4-measured-cell` |
| duplicate row ids | `:802` (every occurrence) | `x3-duplicate-id` |
| transcript paths distinct / sha256 distinct | `:756`, `:757` | `t1-receipt` |
| sessionId = 32 lowercase hex, bound to `ws://127.0.0.1:<port>/session/<id>`, distinct across runs | `:138`, `:371` (`sessionOf`), `:770` | `t1-receipt` |
| context ids = 32 uppercase hex (golden `C1` refused) | `:139`, `:387` (`contextIds`), `:766` | `t1-receipt` |
| driver ≠ gate by path, bytes, re-export, or non-allow-listed import | `:137` (`DRIVER_ALLOW`), `:402`/`:425`/`:432`, `:737` | `t1-receipt` |
| s1 needs a `corpus/lessons/round-*.md` `## Gate` row (https URL + 64-hex) with the registry host | `:504` (`gateRows`), `:691-720` | `s1-source-row` |
| unmeasured `no` rows counted but never admitted | `:806-810`, `:826` (`clean`) | — |

Allow-list stated in the header (`:100-105`): `FIXTURE, FIXTURE_SHA256, FIXTURE_HEADER, VIEWPORT,
DATA_TEXT, serveFixture`. The honest driver imports three of them
(`driverImports` in `honest-v2.json`: `./check-bidi-runtime.mjs` → `FIXTURE_SHA256, VIEWPORT,
serveFixture`), so it passes.

## 2. Frozen battery (the round's predicate)

```
$ cd /fast/scratch/hyaku/tabi-r33/ExecGateV2/clone
$ TMPDIR=$S/tmp/final node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
      --rev b04b1fee2b7fb6c6be9ca6b55fd936c756e89373 --repo "$S/clone" --json > battery-final.json
exit=0
```

| variant | exit | accepted | population | admitted | failing | entry | reasons |
|---|---|---|---|---|---|---|---|
| H0 | 0 | true | 17 | **16** | **0** | — | — |
| H1 | 0 | true | 17 | **16** | **0** | — | — |
| H2 | 0 | true | 17 | **16** | **0** | — | — |
| F1 golden-splice | 1 | false | 17 | 0 | 16 | — | `t1-receipt` |
| F2 duplicate ids | 1 | false | 17 | 0 | 16 | — | `x3-duplicate-id` |
| F3 same path twice | 1 | false | 17 | 0 | 16 | — | `t1-receipt` |
| F4 byte copy | 1 | false | 17 | 0 | 16 | — | `t1-receipt` |
| F5 driver = gate copy | 1 | false | 17 | 0 | 16 | — | `t1-receipt` |
| F6 driver re-exports gate | 1 | false | 17 | 0 | 16 | — | `t1-receipt` |
| F7 `yes (live)` | 1 | false | 17 | 15 | **1** | — | `x4-measured-cell` |
| F8 junk source row | 1 | false | 17 | 0 | 17 | `s1-source-row` | `s1-source-row` |

`predicate=true honest={H0:true,H1:true,H2:true} forgeriesAccepted=0/8
selftestExit=0 digestLiterals=0` (`battery.txt` last line). Population is 17 (not 16) because the
honest entry has 16 `yes` rows plus R16 `no — no BiDi command`; H0's `admitted 16, failing 0` is
the battery's own clause and holds.

## 3. Self-test: 44 cases, 44 passed, and the 9 mutants each killed

```
$ node scripts/check-bidi-runtime.mjs --selftest --json   # exit=0, cases 44, passed 44, ok true
$ node scripts/check-bidi-runtime.mjs --selftest           # exit=0
BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44
```

27 v1 cases (all unchanged in expected exit/admitted/reason) + 8 battery-construction cases
(`v2-f1-golden-splice` … `v2-f8-junk-source-row`, `:957-965`) + 9 survivor cases
(`v2-m04-…` … `v2-m19-…`, `:967-975`).

Mutant re-application (one single-point edit each, `v2-mutants.patch`, 9 × exactly one `@@`
hunk; each mutant run as `node scripts/mutMXX.mjs --selftest` with its own TMPDIR):

| mutant | v2 site mutated | exit | cases/passed | failing case (observed) |
|---|---|---|---|---|
| M04 | drop cross-run `chromedriverVersion` equality | 3 | 43/44 | `v2-m04-runs-chromedriver-differ` (exit 0, admitted 16) |
| M06 | `ok()` accepts any response frame | 3 | 43/44 | `v2-m06-error-frame-as-success` (exit 0, admitted 1) |
| M09 | drop R9 `c.i > first` | 3 | 43/44 | `v2-m09-readout-before-typing` (exit 0, admitted 1) |
| M10 | drop R14 `c.i > tr.i` | 3 | 43/44 | `v2-m10-pathname-before-traverse` (exit 0, admitted 1) |
| M11 | drop driver `sha256 !== driverSha256` | 3 | 43/44 | `v2-m11-driver-sha-differs` (exit 0, admitted 16) |
| M14 | `browserVersion` compared by major only | 3 | 43/44 | `v2-m14-browser-version-same-major` (exit 0, admitted 1) |
| M17 | `WS_LOOPBACK` loosened to `/^ws:\/\//` | 3 | 43/44 | `v2-m17-ws-url-off-loopback` (exit 0, admitted 1) |
| M18 | R4 accepts any decodable PNG | 3 | 43/44 | `v2-m18-png-wrong-dimensions` (exit 0, admitted 1) |
| M19 | population = `yes` rows only (the pre-fix filter) | 3 | 43/44 | `v2-m19-unmeasured-row-counted` (population 16, expected 17) |

No mutant fails a case other than its own. Two re-application notes are in §6.

## 4. Honest entry, v2 vs v1, offline (no `--live`)

```
$ node scripts/check-bidi-runtime.mjs --rev b04b1fe --baseline d805d1d6132430118b206a848b85753ab35d1014 \
      --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json    # exit=0
{v2} population 17 admitted 16 failing 0 unmeasured 1 distinct 16 entryFinding null binding null clean true
$ node $S/v1-gate.mjs --repo $S/clone --rev e6b0a90 --baseline d805d1d… --entry … --json   # exit=0
{v1} schema tabi-bidi-runtime-v1 population 16 admitted 16 failing 0 entryFinding null clean true
```

v2's new `provenance` field names the honest runs' real ids and contexts
(`10abbb47…/@ws://127.0.0.1:37279/session/10abbb47…`, context `31B8FE9C25C36020CBB175F250715903`;
`6b30c703…`, context `0E62B928C3D82E935056B338D5E0FBF4`), i.e. the three s1 S-ids S124/S125/S126
pass the new Gate-row/host rule against `corpus/lessons/round-32.md:14-19` (H0 confirms it
end-to-end).

## 5. Integration obligation the L1 must carry (measured, not inferred)

`scripts/check-selfassessment.mjs` uses each gate's own `--selftest` output as the m1 oracle.

```
$ node scripts/check-selfassessment.mjs --rev b04b1fe --json   # exit=1
mismatches 2, couldNotEvaluate 106, superseded 39
  m1-selftest-tally SCORECARD.md:1657 claimed 27 observed 44
  m1-selftest-tally SKILL.md:2626    claimed 27 observed 44
# baseline b7d16fb: mismatches 0 (same two rows, claimed 27 observed 27)
```

The claims' `noHarmRule` requires `check-selfassessment` mismatches 0 at REV, so the L1 must land
one appended correction paragraph **in the same commit as v2**. The recipe is proven in scratch
(commit `5271d55`, `probe-keep.json`):

```
Correction (round 33, append-only): `scripts/check-bidi-runtime.mjs` gate v2 rewrites the receipt
leg; the round-32 tally at SCORECARD.md:1657 is superseded and the gate `--selftest` now reports
cases=44 passed=44.
Correction (round 33, append-only): `scripts/check-bidi-runtime.mjs` gate v2 rewrites the receipt
leg; the round-32 tally at SKILL.md:2626 is superseded and the gate `--selftest` now reports
cases=44 passed=44.
```

Result at the probe commit: `exit=0, mismatches 0, superseded 41`; both stale rows
`superseded True`, both correction rows `claimed 44 observed 44`; `git diff --numstat` for
`SCORECARD.md`/`SKILL.md` = `2 0` / `2 0` (zero deleted lines). The probe commit is **not** a
deliverable and was dropped (`git reset --hard b04b1fe`; `status --porcelain` 0 lines).

## 6. Design notes for the reviewer (two judgement calls, both measured)

1. **"exactly `yes` or `no`" cannot be taken literally with the honest entry.** The honest entry
   marks R16 `no — no BiDi command`. A gate that fails any cell that is not exactly `yes`/`no`
   refuses H0 (`failing 1`) and the frozen predicate goes false. v2 therefore accepts a bare
   verdict optionally followed by a dash-introduced reason **only for `no`** (`MEASURED`,
   `:142`); any other decoration — `yes (live)`, `no —`, `no (x)` after `yes` — is
   `x4-measured-cell`. F7 is refused and H0 is admitted; both are measured above. Tightening this
   to the literal rule breaks H0.
2. **M17 and M19 needed their v2-equivalent form, not their v1 text.** M17's v1 site was R1's
   inline regex; v2 enforces loopback in one shared constant (`WS_LOOPBACK`, `:140`) read by both
   R1 and the receipt provenance arm, so the re-applied mutation is that constant. M19's v1
   mutation *is* v2's rule (population counts every non-empty cell), so the re-applied probe is
   the pre-fix filter (`yes` rows only); the case asserts `population 17` and fails at 16. In the
   pristine gate the M17 case also fails at `t1-receipt` rather than `t2-run`, because the
   provenance arm fires before R1 — that is by design (receipt before rows), and the case asserts
   `t1-receipt`.

## 7. No-harm and hygiene evidence

- `node scripts/check-gate-mutants.mjs --rev b04b1fe --json` → **exit 0**, `fault_total 27
  fault_killed 27 benign_total 13 benign_killed 0 survivors []`. It **does not cover this gate**:
  `scripts/gate-mutants.json` `gates` = `[check-s106-evidence.mjs, check-release-pins.mjs]` only,
  so the run is no-harm evidence, not kill coverage for v2.
- UI surface unchanged: `liveRecord` segment byte-identical to v1 (8,505 B both); `parseArgs`
  identical; `--help` line identical; exit codes 0/1/2/3 unchanged; JSON field set is a strict
  superset (`distinct, driverImports, duplicates, entryDetail, provenance, unmeasured` added at
  top level; `measured, verdict` added per row; nothing removed — diff over `honest-v1.json` vs
  `honest-v2.json`). One value changed: `schema` `tabi-bidi-runtime-v1` → `tabi-bidi-runtime-v2`
  (and `SELFTEST_SCHEMA` likewise); no lane script matches on that value (grep: only the gate
  itself).
- No honest digest literal: battery clause `digestLiterals 0`, plus
  `grep -c` of `8aa97463c238 / 9918a716da71 / 92bd413caab0 / b9dab912f0af / 55dbef88ed4b` in the
  delivered file → 0 each.
- Network: **none** (no fetch by this seat; every URL in this report is a lane path or an
  identifier string). Browser: **none started**; `pgrep -fa 'chromedriver|chromium'` → no line
  owned by this seat (only the host `earlyoom` line, filtered). Tooling: nothing installed or
  upgraded (node v24.21.0, git, jq already present; pacman untouched).
- Writes: only `$HYAKU_SCRATCH/tabi-r33/ExecGateV2/` (clone + TMPDIR), the output dir, and this
  report. No lane tracked file, index, jj state, fleet repo or sibling repo touched; every commit
  named `-C <clone>` with identity `ExecGateV2 <ExecGateV2@scratch.local>` and the toplevel
  verified (`/fast/scratch/hyaku/tabi-r33/ExecGateV2/clone`). Scratch removed after the receipts
  were copied.

## 8. Limits carried by v2 (also stated in the gate header, `:107-119`)

- The battery is finite: v2 binds session/context **shape** and cross-run identity, not a
  driver-emitted log, so a transcript synthesised with real-shaped ids, real-shaped contexts and
  distinct bytes is still not *proven* executed. The live leg (not mine — ExecLiveLeg) is what the
  capability verdict rests on.
- The `## Gate` row check reads text; it does not verify the URL was fetched.
- The driver import scan is line-based static matching (a computed specifier or a multi-line
  import is not detected).
- A `no` row is unmeasured, not verified: v2 cannot tell an absent capability from an unmeasured
  one; it only stops the row from vanishing.

## 9. Deliverables (in this directory, `…/round-33/w1/ExecGateV2/`)

| file | what |
|---|---|
| `check-bidi-runtime.mjs` | full v2 file (sha256 `7cda6e46…44f7`, `chmod +x`), byte-equal to `b04b1fe:scripts/check-bidi-runtime.mjs` |
| `v2.patch` | `git diff e6b0a90 b04b1fe -- scripts/check-bidi-runtime.mjs` (50,827 B) |
| `v2-mutants.patch` | the 9 single-point mutant diffs used for §3 (9 hunks) |
| `battery-final.json`, `battery.txt` | frozen battery, predicate true, exit 0 |
| `selftest.json`, `selftest.txt` | v2 `--selftest` (44/44, exit 0), pristine |
| `mutants.json`, `mutants.txt` | per-mutant tallies and the failing case output |
| `honest-v2.json`, `honest-v1.json` | offline gate runs on the honest round-32 entry at v2 and v1 |
| `selfassessment-v2.json` | `check-selfassessment --rev b04b1fe`: mismatches 2 (the §5 obligation) |
| `probe-keep.json` | `check-selfassessment` at the append-only correction probe: mismatches 0 |
| `gate-mutants-v2.json` | `check-gate-mutants --rev b04b1fe`: exit 0, no bidi gate catalogued |
| `sha256.txt` | digests of the delivered artifacts |
