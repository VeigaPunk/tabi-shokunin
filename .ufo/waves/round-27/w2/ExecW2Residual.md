# ExecW2Residual — residual verification queue at the tip (tabi round 27, wave 2)

Seat: `TabiR27.ExecW2Residual` (leaf executor, read-only reporter). Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Report of record: this file.

Assignment axes (godspeed):
- (A) gate selftest no-regression sweep at the tip
- (B) three claim counters re-run at baseline AND tip, byte-for-byte vs committed receipts
- (C) m3 final-measurement clean-tree condition, stated exactly

HEAD at all measurements: `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (`git rev-parse HEAD`).
Node `v24.21.0`. No tool installed/updated; no pacman; no git writes (read-only git only);
no external fetch. All artifacts under
`.ufo/waves/round-27/scratch/ExecW2Residual/` (gitignored).

---

## A. Gate selftest sweep at the tip — 13/13 exit 0, verdict clean; registry `nonconformant=0`

Command per gate (run from lane root, `node scripts/<s> <flag>`, stdout+stderr →
`scratch/ExecW2Residual/logs/<s>.log`):

| script | flag (read from file) | exit | tally (exact summary or JSON) |
|---|---|---|---|
| check-adjacency.mjs | `--self-test` (:17/:1114/:1128) | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` |
| check-aria-metadata.mjs | `--self-test` (:44/:3221/:3245) | 0 | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4`; JSON `ok:true exit:0` |
| check-bfcache-receipt.mjs | `--selftest` (:48/:318) | 0 | JSON `{cases:17, passed:17, clean:true, exit:0}` |
| check-freshness.mjs | `--self-test` (:48/:50) | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| check-gate-registry.mjs | `--selftest` (:50/:411) | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` |
| check-measurement-binding.mjs | `--self-test` (:16/:846) | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` |
| check-round-contract.mjs | `--self-test` (:275/:282) | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` |
| check-s106-evidence.mjs | `--selftest` (:34/:288) | 0 | `S106_SELFTEST verdict=clean cases=5 passed=5` |
| check-selfassessment.mjs | `--selftest` (:67) | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` |
| check-source-reopen-receipt.mjs | `--selftest` (:40/:351) | 0 | JSON `{cases:18, passed:18, clean:true, exit:0}` |
| check-sources.mjs | `--self-test` (:97) | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| check-user-round-contract.mjs | `--self-test` (:361/:371) | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` |
| round-evidence-audit.mjs | `--selftest` (:11/:926) | 0 | JSON `{schema:"tabi-round-evidence-audit-v1-selftest", cases:13, passed:13}` |

- `grep -c 'result=FAIL' logs/*.log` → 0 hits for 12/13; the only
  `verdict=failed` substring is `check-user-round-contract`'s legacy-branch design arm
  (`new_verdict=failed new_finding=score_mismatch` inside a PASS case, log line —
  same arm w1 documented; outer result PASS).
- Gate-registry conformance at the tip:
  `node scripts/check-gate-registry.mjs --rev HEAD --json` → exit 0,
  `{rows:27, gates:17, nonconformant:0, clean:true, skillBytes:233850, findings:[]}`.
  Latest row per gate has `missing=[]`; the 4 non-`scripts/` gate-kind rows are
  outside the selftest sweep as before.
- `scripts/report-contract.mjs` (new in `bceb17d`, tracked) is declared "Not a
  gate" (line 3) — it has no selftest flag, is unregistered in the gate registry,
  and was not in the 13-gate sweep. Not a regression.
- Wave-1 `ExecSelftestSweep` OBS-2 (stale header "4 isolated cases" in
  check-s106-evidence.mjs) is remediated in the committed tip: header now reads
  "5 isolated cases" (:8) and the gate prints `cases=5 passed=5`. OBS-1 remains
  (fixture commit-id interpolation makes s106 log bytes nondeterministic; verdict/
  tally stable — cases=5 passed=5).

No regression vs the w1 sweep (same tallies as the 5ed6484 re-sweep, plus the
committed s106 header fix).

## B. Claim counters re-run at baseline and tip

Baseline rev `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; tip `bceb17d…`.

### B1. C1 — `node scripts/check-selfassessment.mjs --rev <REV> --json` (exit 1 all runs)

| rev | mismatches | counted | couldNotEvaluate | superseded | clean |
|---|---|---|---|---|---|
| `f185b4e` (baseline) | **5** | LOG:335 (4→12), :391 (4→12), :1090 (66→26), :1103 (66→26), + m3 (observed 13 at run time) | 92 | 6 | false |
| `bceb17d` (tip) | **1** | m3 only (observed 15 at run time) | 92 | 10 | false |
| `fd722a78` (receipt rev) | **1** | m3 only (observed 23 at run time) | 92 | 10 | false |

- Byte-for-byte vs committed receipt `measure-c1-fd722a7.json`:
  `diff` of a fresh run at `--rev fd722a78…` → **exactly two changed lines, both
  the m3 `observed` field** (fresh 23 vs committed 9603). Every other field —
  rev, mismatches, all findings, counted, couldNotEvaluate 92, superseded 10,
  clean false — byte-identical. Same result for the frozen baseline receipt
  `selfassess-baseline-raw.json` (4ad4c77): fresh run differs only in m3
  `observed` (25 vs committed 6). This is the known live-tree term, not a counter
  regression (w1 `ExecC1Baseline` §2/§4, `ExecC1Tip` §5.5).
- The claim's before/after arms hold under the counter: baseline m1 LOG-window
  findings = 4 (the fifth, LOG:1664, is already superseded by the round-26
  correction at f185b4e — matches `ExecC1Tip` §5.1); tip m1 counted = 0; the only
  residual mismatch is the m3 working-tree finding. `mismatches=0` at the tip is
  reached only on a fully clean tree (see C).

### B2. C2 — `node scripts/check-s106-evidence.mjs --rev <REV> --json` (exit 0 all runs)

| rev | present | sha_match | anchor_located | anchor_unique | byte_count_match | valid |
|---|---|---|---|---|---|---|
| `f185b4e` (baseline) | true | true | true | true | true | **true** |
| `bceb17d` (tip) | true | true | true | true | true | **true** |
| `5577d1b` (receipt rev) | true | true | true | true | true | **true** |

- Byte-for-byte vs committed receipt `measure-c2-5577d1b.json`: `diff` at
  `--rev 5577d1b…` → **empty, exit 0. The C2 receipt is fully reproducible
  (no live-tree term in this gate). Anchor line 187, `BASE_FEATURE(kBackForwardCache,
  base::FEATURE_ENABLED_BY_DEFAULT);`, occurrences 1.

### B3. C3 — `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l`

- Baseline `f185b4e`: **0**. Tip `bceb17d`: **1** —
  `corpus/knowledge/redirect-and-retry-after-semantics.md`. Entry line 3 cites
  `source: S107` with RFC 9110 §§ and fresh fetch date/bytes/sha256.
- S107 registry row present at tip: `corpus/SOURCES.md:121`
  (`| S107 | HTTP Semantics — RFC 9110 … |`).
- Census gate: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
  --root /home/vgpnk/Projects/shokunin tabi` → **exit 0**, output byte-identical
  to committed `census-after-c3.txt` (`diff` exit 0; same 16 W04 rows + `tabi ok`
  line).

## C. m3 class — final measurement clean-tree condition (exactly what I saw)

`m3Findings` (scripts/check-selfassessment.mjs:379-388) runs `git status
--porcelain --untracked-files=all` on the **live tree** and sets `observed` =
number of porcelain lines (every line, including tracked modifications).

Final capture (after all B runs, before this report was written):

```
$ git status --porcelain
 M SCORECARD.md
?? .ufo/waves/round-27/w1.ready.dispatched
?? .ufo/waves/round-27/w2/
$ git status --porcelain --untracked-files=all | wc -l
24
```

`-uall` listing: 1 tracked modification ` M SCORECARD.md` + 23 untracked paths
(`.ufo/waves/round-27/w1.ready.dispatched`, `.ufo/waves/round-27/w2/` — peer
reports, swarm-registry.json). So:

- The tree is **not clean**: one tracked file (`SCORECARD.md`) is modified in the
  worktree by a sibling wave-2 seat (in-flight W2 note in the round-27 block:
  `git diff SCORECARD.md` → `+4/-2`, index 46ab843..9b41f0c), and the two
  untracked wave paths exist. The SCORECARD.md modification appeared mid-sweep:
  my earlier `git status --porcelain` captures showed no `M` entries (only the two
  `??` paths).
- Because m3 counts **all** porcelain lines, the sibling's tracked edit now feeds
  m3's `observed`: my C1 runs saw m3 observed 13 (baseline run), 15 (tip run), 23
  (receipt-rev run), 25 (frozen-baseline run) as peers wrote w2 reports; the
  committed receipt's 9603 is unreproducible and was captured at a very dirty
  moment. m3 stays one finding regardless of the integer, so mismatch arithmetic
  (C1 `mismatches`) is unaffected — but `clean:false` and `mismatches=1` persist
  until the tree is emptied.
- The m1 LOG-window and m2 receipt-exit classes read committed blobs at `--rev`
  and are unaffected by any of this.

## Findings

1. **(A) No selftest regression at the tip**: 13/13 exit 0, verdict clean;
   gate-registry `nonconformant=0, clean=true` at `bceb17d`. OBS-2 remediated;
   OBS-1 (s106 log nondeterminism, fixture commit id) persists as a known
   non-behavioral output variance.
2. **(B) C2 and C3 counters reproduce their committed evidence byte-for-byte**
   (C2 receipt diff empty; C3 counts 0→1 and census output identical to
   `census-after-c3.txt`). **C1 reproduces byte-for-byte modulo the m3 live-tree
   integer** (fresh vs committed `observed`: 23 vs 9603 at `fd722a78`; 25 vs 6 at
   `4ad4c77`) — the documented m3 term, not a counter drift. Arms verified:
   baseline m1 LOG findings 4 alive + :1664 superseded; tip m1=0, mismatches=1
   (m3 only).
3. **(C) The final measurement's clean-tree condition is NOT met at this
   writing**: exactly ` M SCORECARD.md` + 23 untracked `-uall` paths (24 porcelain
   lines). Any "byte-identical receipt" acceptance must compare modulo
   `m3-unlanded-paths.observed`, or be run from an empty tree; and the sibling's
   uncommitted SCORECARD.md edit must land or be reverted before m3 can read 0.

## Evidence

```
git rev-parse HEAD                                  # bceb17dd82446a3b7514dd9759ec733673b4ba0d
node scripts/<s>.mjs <flag>                         # A sweep, 13 gates, logs in scratch/…/logs/
node scripts/check-gate-registry.mjs --rev HEAD --json
node scripts/check-selfassessment.mjs --rev f185b4e… --json   # B1 baseline
node scripts/check-selfassessment.mjs --rev bceb17d… --json   # B1 tip
node scripts/check-selfassessment.mjs --rev fd722a78… --json  # B1 receipt rev
node scripts/check-selfassessment.mjs --rev 4ad4c77… --json   # B1 frozen baseline
diff scratch/…/c1-receiptrev-fd722a78.json .ufo/waves/round-27/measure-c1-fd722a7.json
diff scratch/…/c1-frozen-baseline-4ad4c77.json .ufo/waves/round-27/selfassess-baseline-raw.json
node scripts/check-s106-evidence.mjs --rev f185b4e… --json    # B2 baseline
node scripts/check-s106-evidence.mjs --rev bceb17d… --json    # B2 tip
node scripts/check-s106-evidence.mjs --rev 5577d1b… --json    # B2 receipt rev
diff scratch/…/c2-receiptrev-5577d1b.json .ufo/waves/round-27/measure-c2-5577d1b.json
git grep -lE '^source: S107 ' f185b4e… -- corpus/knowledge | wc -l   # 0
git grep -lE '^source: S107 ' bceb17d… -- corpus/knowledge | wc -l   # 1
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
diff /tmp/census-now.txt .ufo/waves/round-27/census-after-c3.txt      # empty
git status --porcelain ; git status --porcelain --untracked-files=all | wc -l
```

Scratch: `.ufo/waves/round-27/scratch/ExecW2Residual/{logs/,c1-*.json,c2-*.json}`.
No tracked file touched; no git write; no tool install; no network.
