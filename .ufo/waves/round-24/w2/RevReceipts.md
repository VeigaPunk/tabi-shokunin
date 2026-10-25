# RevReceipts — reproduce the round-24 counter receipts

Seat: `L1Tabi24.RevReceipts` (reviewer, leaf). Scope: re-run `check-gate-registry.mjs` and
`check-selfassessment.mjs` at baseline `573c99e` and tip `ad125e8`, plus the recorded after-rev
`b973fde`, and compare every field to `corpus/evidence/round-24/c{1,2}-*.json`. Environment:
`TMPDIR=/home/vgpnk/tmp-tabi24` exported; node v24.21.0; read-only; no tools installed.

## Commands run (all under `TMPDIR=/home/vgpnk/tmp-tabi24`)

```
node scripts/check-gate-registry.mjs --rev {573c99e..., ad125e8..., b973fde...} --json
node scripts/check-selfassessment.mjs --rev {573c99e..., ad125e8..., b973fde...} --json
node scripts/check-gate-registry.mjs --selftest
node scripts/check-selfassessment.mjs --selftest
git status --porcelain --untracked-files=all     # the command m3 runs itself
```

Re-run captures kept at `.ufo/waves/round-24/scratch/RevReceipts/` (ignored by the round's own
`.ufo/waves/*/scratch/` rule).

## Reproduction table

### C1 — `check-gate-registry` (`nonconformant`)

| Field | Committed receipt | Re-run | Reproduces |
|---|---|---|---|
| baseline `gates` | 12 | 12 | yes |
| baseline `nonconformant` | 3 | 3 | yes |
| baseline `findings` | e1-missing-row ×3 (`check-adjacency`, `check-measurement-binding`, `round-evidence-audit`) | identical ids and gates | yes |
| baseline `clean` / exit | false / 1 | false / 1 | yes |
| after `rev` | `b973fde` | — | **no: the file named `c1-tip.json` and `c1-measurements.json` both record `b973fde`, not the tip `ad125e8`** |
| after `gates` / `nonconformant` / `rows` / `skillBytes` | 14 / 0 / 23 / 228857 | 14 / 0 / 23 / 228857 at `ad125e8` | yes (byte-identical semantics at the true tip too; row numbers all match) |
| after `clean` / exit | true / 0 | true / 0 at `ad125e8` | yes |
| selftest cases/passed | 22 / 22 | 22 / 22, exit 0 | yes |

### C2 — `check-selfassessment` (`mismatches`)

| Field | Committed receipt | Re-run | Reproduces |
|---|---|---|---|
| baseline `rev` / `mismatches` | `573c99e` / 5 | 5 | yes |
| baseline `counted` | 4× m1 (`:410` 25→26, `:1138`,`:1139`,`:1151` 12→13) + 1× m3 | same 4 m1; m3 `observed` **4 → 5** | m1 yes; **m3 no** |
| baseline `couldNotEvaluate` | 75 | 75 | yes |
| baseline `findings` | 82 | 82, same set except the m3 line's observed count | yes modulo m3 count |
| after `rev` | `b973fde` (in `c2-tip.json`, `c2-measurements.json`) | — | **no: not the tip** |
| after `mismatches` | **1** | **1** at `ad125e8` (m3-unlanded-paths) | yes — and it is not 0 |
| after `counted.m3.observed` | 4 | **5** at `ad125e8`, **6** at `b973fde` minutes later | **no — three different values on the same counter, same flags** |
| after `couldNotEvaluate` | 75 | **79** at `ad125e8` (75 at `b973fde`) | **no** |
| after `superseded` | 5 | 5 | yes |
| after `findings` | 89 | 93 at `ad125e8` | no — four new `m1/CNE "ambiguous script association"` entries at `SCORECARD.md:1232,1233,1243,1249` |
| selftest cases/passed | 13 / 13 | 13 / 13, exit 0 | yes |

Baseline `m2-receipt-exit` findings (75 could-not-evaluate commands outside the closed grammar +
1 measured `git cat-file -e a89f193:...` → claimed 128, observed 128) reproduce exactly at both
revisions.

## Findings

### F1 — C2's claimed "met / 5 → 0" is refuted by the round's own committed receipt. HIGH.

The frozen counter reports `mismatches: 1`, `clean: false`, exit 1 at `ad125e8` **and** at the
recorded after-rev `b973fde`. The committed `corpus/evidence/round-24/c2-tip.json` itself records
`mismatches: 1`, `clean: false`; `c2-measurements.json` records `after.mismatches: 1`. Against
this, `claims.json` declares `C2.after: 0`, `SCORECARD.md:1233` declares "**met**: … tip counts
none", and `LOG.md:1756` declares "5 → 0". The claim's after-target is not met at any measured
revision — no re-run is needed to see it; the discrepancy is inside the round's own receipts.
**Verdict impact: C2's "met" disposition is falsified.** Residual count at tip = 1
(m3-unlanded-paths over 5+ untracked wave-2 artifacts).

### F2 — `claims.json` C2 `before: 4` contradicts the instrument and its own receipt. MEDIUM.

`claims.json` declares "Before: 4 mismatches at the baseline revision (three stale `--selftest`
12/12 figures …, one unlanded-path mismatch over 89 porcelain paths)". The same counter reports
5 at `573c99e` — four stale tallies (the fourth is `check-sources` 25 vs 26 at `SCORECARD.md:410`)
plus the m3 finding — and the committed receipt records 5. `SCORECARD.md`'s claims table corrects
this to "5 → 0" in prose, but `claims.json`'s `revisions` block is **empty** (`[]`) — the frozen
claim carries a falsified before-value with no recorded post-freeze correction. Separately, the
declared "one unlanded-path mismatch over 89 porcelain paths" does not describe the measurement:
m3 counts live-tree paths at run time (4 at capture), not the round-23 89. Verdict impact:
cosmetic on the before (the baseline was under-described, not over-counted), but it is a
frozen-document inconsistency a reader cannot resolve from committed bytes.

### F3 — m3's observed value is not a function of the revision; the receipt cannot be reproduced. HIGH.

`check-selfassessment.mjs:269` runs `git status --porcelain --untracked-files=all` on the **live
working tree** for every `--rev`. Observed values for the same class: 4 at capture (receipt),
5 on my baseline run, 5 on my tip run, 6 on my `b973fde` run minutes later, 8 paths now in
`git status` as wave-2 seats write reports. The receipt therefore records a number that no reader
can re-derive, and the finding stores only a count — never the paths — so it is non-auditable as
well as non-reproducible. This is not incidental: m3 is 1 of the 5 baseline mismatches and 100%
of the residual after-value that decides F1. The claim's counting command
(`--rev <REV>`) reads as revision-scoped; the deciding class is not. Verdict impact: the
m3-dependent fields in `c2-*.json` are tree-state snapshots, not measurements of the named revs.

### F4 — The tip commit itself added four tally lines the counter cannot parse; couldNotEvaluate rose 75 → 79. MEDIUM.

`ad125e8` appended the round's capability rows (`SCORECARD.md:1239-1249`), whose `--selftest`
tallies sit on lines that name no script inside a section that names several → four
`m1/CNE "ambiguous script association"` findings (`:1232,:1233,:1243,:1249`). At `b973fde` the
committed value 75 reproduces exactly; at the tip it is 79. The claimed figures (22 and 13) are
true — so no false figure is masked — but the counter demonstrably cannot verify the two new
gates' own tallies in the document that declares them. The receipt (`c2-tip.json`, recorded at
`b973fde`) contains none of these findings and so does not measure the tip. Verdict impact: a
field that does not reproduce (75 vs 79) and a coverage regression, not a hidden mismatch.

### F5 — Both "tip" receipts measure `b973fde`, not `ad125e8`. MEDIUM.

`c1-tip.json` and `c2-tip.json` both record `rev: b973fde3c89fb2d3476ad0b6002791b75ec87a27`;
`c1-measurements.json` and `c2-measurements.json` record `after.rev` the same. `SCORECARD.md:1225`
states the disposition was "measured … against the tip commit". `b973fde` is an ancestor of the
tip, and the intervening commit changed C2's measurement (F4). For C1 every field is identical at
both revisions (skillBytes 228857, 14 gates, 0 nonconformant, rows 23, exit 0) — verdict
unchanged. For C2 the label is wrong and the recorded file is stale, though the verdict was
already false at `b973fde` (F1).

### F6 — The pre-data control receipt named in both claims does not exist. MEDIUM.

`claims.json` C1 and C2 each state the skip-work control is "Recorded before data in
`.ufo/waves/round-24/control/control-receipt.json`". That path does not exist on disk and has
never existed in git (`git log --all -- .ufo/waves/round-24/control` → empty; the only
same-named file sits inside another seat's mutation fixture). `.ufo/waves/round-24/w1/
ExecControlSkip.md:189-191` discloses the seat wrote its receipt inline because the path was
outside its write scope — so the control was run and scored (0 at baseline, as claimed), but the
named receipt file was never produced. The claims' pointer is dangling. Verdict impact: the
control's falsifying power still exists (the inline receipt in the committed W1 report), but the
frozen claim's stated evidence location is false.

### F7 — The C2 counter never reads `SHONEN.md`, though the claim names it in scope. LOW.

`claims.json` C2 declares the self-assessment surface as "SCORECARD.md blocks that name a lane
gate script, **and SHONEN.md**". `evaluate()` (scripts/check-selfassessment.mjs:282-285) reads
only `SCORECARD.md`; `SHONEN` appears nowhere in the file. `SHONEN.md` currently carries no
self-test tally, so no mismatch is hidden today — but the declared scope exceeds the
implementation. Related stale figures the counter cannot see by design: the scripts' own headers
say "`--selftest` (15 isolated cases" (`check-gate-registry.mjs:7`, actual 22) and
"(10 isolated cases" (`check-selfassessment.mjs:8`, actual 13) — the exact class m1 exists to
catch, outside m1's window. Verdict impact: none on the count; a calibration residual.

### F8 — m3 makes the gate un-greenable mid-wave; the round's own wave files trip it. LOW (design).

The five-to-eight untracked paths driving the m3 finding are wave-2 orchestration artifacts
(`gen-w2.mjs`, `w2-spec.json`, `w2-dispatch.*`, `w2/*.md`, `w2/swarm-registry.json`) created by
the round's own machinery outside the ignored `scratch/` rule. `SCORECARD.md:1255` claims
"`git status --porcelain` empty at the tip" and `LOG.md:1779` claims defect 2 closed "89 → 0" —
both are refuted by the receipt's own `observed: 4` and by any re-run. Whether wave files
"should" count as unlanded is a spec question; as specified, m3 can only be green between waves,
so the C2 "after: 0" target was unachievable by construction during the round.

## Verdict deltas

- **C1: claim stands.** 3 → 0 nonconformant reproduces at baseline and tip (12 → 14 gates, both
  new gates carry rows, `--selftest` 22/22). Only the `rev` label on the after-measurement is
  wrong (F5); no counted field changed.
- **C2: claim fails.** Frozen claim says 4 → 0; the counter says 5 → 1 at every measured rev,
  and the committed receipts themselves record `mismatches: 1`, `clean: false`. `SCORECARD.md`
  and `LOG.md` both assert "met" anyway. The round's own wave-2 artifacts are what the last
  standing mismatch counts.

## Residual risk / verification gaps

- I did not re-execute the gates' internal logic on mutant fixtures beyond the shipped
  selftests (22 and 13 cases, both exit 0); field-predicate adequacy is a sibling seat's lane.
- m3's non-reproducibility is demonstrated by values 4/5/6 across runs; the exact path sets at
  capture time are unrecoverable because the finding stores counts only.
- The four new ambiguous-association tallies are true figures; I verified truth by running the
  gates' selftests, not because the counter could associate them.
- The m2 closed grammar executed one command (`git cat-file -e a89f193:...` → 128 as claimed);
  the other 75 receipts are could-not-evaluate by design, so the m2 class's coverage on this
  corpus is ~1.3%.
