HOLDS

# R77Review2 — battery and kill-power review (brackets, denominators, walk cases, attribution)

Scope: `scripts/negatives-filechooser-r77.mjs` and `.ufo/waves/round-77/controls/c1/kill-power-r77.mjs`
at the frozen bytes. `sha256sum` (exit 0) gives `3925fe2a5f772123fd9d707c52829088ab7dcaec8d9aad70265c2528eef103ff`
and `795b2eda8fe5812544f2b300330840b797f05a80901c2cd2e2312c9f032037aa`, matching
`.ufo/waves/round-77/freeze.txt:3` and `:5`; the counter (`ac17ff8d…`) and pinned driver (`9954db07…`)
also match (`:2`, `:1`). Lane HEAD `eedaa802d97928a57741fd1c2945cef81dd4ecc7`; uncommitted lane edits
(SCORECARD.md, SKILL.md, corpus/QUALITY.md, SOURCES.md, the r77 note, the r77 lesson) are not mine —
this seat wrote only `.ufo/waves/round-77-seats/R77Review2/`, `.ufo/waves/round-77/w1/R77Review2/`
and the flat trailer copy `.ufo/waves/round-77/w1/R77Review2.md`.

All JSON outputs cited below are under `.ufo/waves/round-77-seats/R77Review2/`; every mutant ran on
copies (counter copy + battery copy + pinned driver in one scratch dir) with `--first-failure`.

## Baseline re-measurements (not leg (a) credit — the wave seat repeats nothing)

1. Counter on the scored receipt, frozen command:
   `node scripts/check-filechooser-r77.mjs --lane <lane> --receipt corpus/evidence/round77/chromium-file-chooser/receipt.json --expect-driver-sha256 9954db07… --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt --json`
   → **exit 0**, verdict `clean`, `checkCount 183`, `findings []`, `limit` 19 entries:
   16 honest priors `79 events/11 gaps → absNeed 40 / gapNeed 9`; the three degenerate priors
   `37/11 → 19/9` and `35/11 → 18/9`; `walk {outside:[], unparsable:[]}` (`base-counter-a.json`).
   (The 19 prior receipts were enumerated from `prior-set.txt`; all have 11 gaps — `node -e` over the
   files, so the gap denominator is 9 for every prior, honest or degenerate.)
2. Full frozen battery, stdout through a pipe at full size:
   `node scripts/negatives-filechooser-r77.mjs … --json | node -e 'JSON.parse(stdin)'`
   → 186,387 bytes parsed, `allOk true`, 336/336 results (323 refuse + 10 must-accept + 3 laundered),
   `failed []`, `coverageGap []`, `stoppedEarly false`, pipeline **exit 0** (`full-battery-pipe.json`).
   A second full run (`full-battery-second.json`) → **exit 0**, `allOk true`.
3. Counter `--json` through a pipe: 32,688 bytes parsed, byte-identical to file mode
   (`wc -c base-counter-a.json` = 32688).

## (1) Brackets — placement confirmed, near-boundary mutants

My own computation (scratch `placements.mjs`, saved as `bracket-placements.json`) is an independent
replica of the counter's rule (prior denominators, 0.1 ms grid), plus one direct counter run per pair
(`direct-brackets.json`, `direct-grid.json`, `direct-owngaps.json`); `near-boundary-mutants.json` is the
mutant sweep. All mutant runs on copies; the battery's `placed()` guard (`negatives-filechooser-r77.mjs:248`)
throws on a misplacement, so the clean full run means every bracket case sat where it claims.

| Pair (battery lines) | My computation / counter `limit` | Mutant just across | Outcome |
|---|---|---|---|
| pair tolerance 0.049 / 0.051 (`:306`,`:397`) | ±0.049: absMatched **79 ≥ 40**, gapMatched 8 < 9 → refused (exit 1); ±0.051: abs **4 < 40** → clean (exit 0) | `TOL = 0.048` | **killed** by `replay-timeline-tol-in-0.049` (no finding) |
| | | `TOL = 0.052` | **killed** by `accept-prior-tol-out-0.051` (refused, replay) |
| 0.1 ms grid 2e-5 / 5e-6 (`:166`,`:392`) | +2e-5 → deviation 2.0e-4 units > 1e-4 → `event-time-quantum` (exit 1); +5e-6 → 5.0e-5 ≤ 1e-4 → clean (exit 0) | (frozen 0.02 / 1e-5) | both killed in the scored kill-power (183/183 force-true, 70/70 semantic) |
| abs 40 / 39 of 79 (`:307`,`:407`) | keepExact(40): absMatched **40 = absNeed** → refused; keepExact(39): **39 < 40** → clean | `FRAC = 0.51` (need 41) | **killed** by `replay-timeline-abs-at-threshold` |
| | | `FRAC = 0.505` (need 40) | **survives** — equivalent at this granularity |
| gap 9 / 8 of 11 (`:308`,`:408`) | breakGaps(2): gapMatched **9 = gapNeed** → refused; breakGaps(3): **8 < 9** → clean | `GAP_FRAC = 0.82` (need 10) | **killed** by `replay-timeline-gap-at-threshold` + `…gaps-added-own-denominator` |
| | | `GAP_FRAC = 0.78` (need still 9) | **survives** — equivalent at this granularity |
| own gap 50.1 / 49.9 ms (`:314`,`:409`) | 49.9 → ownGaps **10 < 11** → refused; 50.1 → ownGaps **11** → clean | `GAP_MIN = 49.8` | **killed** by `replay-timeline-own-gap-49.9` |
| | | `GAP_MIN = 50.2` | **killed** by `accept-own-gap-50.1` |
| own-gap floor | | `MIN_OWN_GAPS = 10` | **killed** by `own-gap-49.9` + `too-few-gaps` |
| | | `MIN_OWN_GAPS = 12` | **killed-positive** (honest receipt refused; no named case) |

Equivalence intervals at this receipt's granularity (computed analytically and confirmed by the runs
above; the 16 honest priors are 79 events / 11 gaps):

- pair tolerance `TOL ∈ (0.049, 0.051]` (strict `<` in `pairMatch`, `check-filechooser-r77.mjs:243-250`).
- 0.1 ms grid tolerance `∈ [5e-5, 2e-4)` units = `[5e-6, 2e-5)` ms (carried `1e-4`).
- abs fraction `FRAC ∈ (39/79, 40/79] = (0.493671, 0.506329]` (carried 0.5).
- gap fraction `GAP_FRAC ∈ (8/11, 9/11] = (0.72727, 0.81818]` (carried 0.75). **0.78 is not a boundary
  crossing**: the discrete boundary is 9/11 = 0.81818; `GAP_FRAC = 0.78` and 0.75 produce the same
  `gapNeed = 9` for every prior, hence the same rule. The frozen kill-power's 0.85 and 0.6 both kill;
  the assignment's probe value 0.78 survives as an equivalent mutant, not as an escape.
- `GAP_MIN ∈ (49.9, 50.1]` ms (carried 50; every other real gap is ≥ 285.9 ms, so only the bracket
  moves). `MIN_OWN_GAPS = {11}` exactly (11 is the mode of 16 honest receipts; 10 and 12 both die).

The D1 case, the 49.9/50.1 own-gap pair and the tolerance/abs/gap pairs are isolated in the full run
(exactly `replay-event-timeline`, no collateral); `replay-timeline-too-few-gaps` is the only bracket
with a second finding (`event-leg-window`, listed in that case's `alsoAllowed`).

## (2) D1 denominators — separation is real; which mixed rules survive

- The counter divides both fractions by the **prior's** counts: `np = pairs(p).length`,
  `gp = gaps(p).length` (`check-filechooser-r77.mjs:246-250`); the per-prior `limit` block prints
  `absNeed`/`gapNeed` (`:543`), 19 entries on the scored receipt.
- Direct separation on copies (`direct-brackets.json`): under-test receipt = real + two added gaps
  (own 13, `addTwoGaps`, battery `:272-279`), prior = clone broken to exactly 9/11 matched.
  Prior-denominator counter: **exit 1**, `gapMatched 9 ≥ gapNeed 9`, `refused true`.
  Own-denominator copy (`gapNeed = ceil(0.75 * 13) = 10`): **exit 0 clean**. So the case does separate
  prior- from own-denominator rules; the kill-power's `M-timeline-gap-denominator-own`
  (`kill-power-r77.mjs:73`) is killed by exactly this named case (scored results and my replay).
- Why two added gaps and not one: own 12 gives `ceil(0.75*12) = 9 = prior need`, so a one-gap addition
  cannot separate; 13 is the minimum that does. The case adds exactly two.
- Mixed rules (full battery runs on copies, `mutant-GAPDEN-*.json`):
  - `max(gp, own)` → **killed** by the D1 case (need 10).
  - `own` alone → **killed** by the D1 case.
  - `min(gp, own)` → **survives**, and is identical to the prior rule for every accepted receipt here:
    the counter's own-gap floor forces own ≥ 11 and every prior has gp = 11, so min = 11.
  - `OR(prior, own)` → **survives**, but is strictly stronger (own ≥ 11 ⇒ ceil(0.75·own) ≥ 9 = prior
    need), so it cannot lower the forgery floor.
  - `average (gp + own)/2` → **survives** (`mutant-GAPDEN-avg.json`, `allOk true`). At own = 13 the
    average is 12, `ceil(0.75·12) = 9`, i.e. it coincides with the prior rule; it only becomes weaker
    for own ≥ 14. The D1 witness sits at the separation minimum (own 13), so it does not pin a
    slower-growing mixed denominator. The battery contains no receipt with more than 13 own gaps.
- Abs denominator (uncarried, `kill-power-r77.mjs:14`): the `pairs(p).length → pairs(a).length` mutant
  **survives the full battery** (`mutant-ABSDEN-own.json`, `allOk true`), so the omission is
  operationally sound. The stated reason is inaccurate: the three degenerate priors are 37, 35 and 79
  events, not 79; under the mutant their needs rise from 19/18 to 40, i.e. the rule becomes *stricter*
  against them, and no case depends on those needs (the honest receipt's absMatched against them is
  0–1). Low-severity documentation defect, not a behaviour defect.

## (3) Walk cases on a mirror lane — no write into the real lane

`mkMirror` (battery `:416-423`) makes `work/mirror-<case>` a real directory, symlinks `lane/scripts`
as a whole, symlinks **each entry** of `lane/.ufo/waves/round-77` individually, and symlinks
`corpus/evidence/round77` as a whole; the case closures write only new names in the mirror directory or
under `work/mirror-extra-*`. Measured by a sha256+size+mtime manifest of the lane's `scripts/`,
`.ufo/waves/round-77/` and `corpus/evidence/round77/` (`mirror-write-differential.json`):

- A copy of the battery filtered to the 7 mirror cases + `accept-prose` (frozen `mkMirror` code):
  375 files before, 375 after, `added []`, `removed []`, `changed []`; all 7 mirror cases OK
  (`prior-set-complete` ×5, `prior-set-unparsable` ×2), prose accept OK.
- A full frozen battery run (333 + 3): 391 → 394; the only three additions are concurrent **other-seat
  prose reports** (`w1/R77Connector.md`, `w1/R77Scribe/gate-review.md`, `w1/R77Scribe/report.md`);
  `removed []`, `changed []`, HEAD unchanged, and no `.case`, `copy.*`, receipt or script added.
- Therefore the frozen mirror cases do not write into the real lane. Latent risk: `scripts` and
  `corpus/evidence/round77` are wholesale symlinks, so a future mirror case writing through
  `m/scripts/…` or `m/corpus/evidence/round77/…` would land in the real lane; the safe part is the
  per-entry symlinking of the round-77 directory, which keeps `copy.JSON` etc. in the mirror.
- The seat tree `.ufo/waves/round-77-seats/` is a sibling of the walked tree, which is why my JSON
  outputs are invisible to `prior-set-complete`; the seat-output rule is mechanically enforced by
  `.ufo/waves/round-77/build-spec.py:23-26` (`check_items`), selfcheck **exit 0**
  (`accepted: [SelfGood]` / `REFUSED: … SelfBad`), and all 12 spec items carry it (`node -e` count 12).

## (4) Attribution and the pipe-truncation fix (QUALITY 148)

- **Named-case kills.** I re-ran all 70 frozen SEMANTIC mutants on copies with `--first-failure`
  (`frozen-semantic-rerun.json`): **66 killed by a named case, 4 killed-positive, 0 survived, 0
  case-level crashes** (no failed case with `findingIds: null`). Of the 66 named, 42 are clean semantic
  misses (the named case's counter run exited 0 with no finding) and 24 are named cases with collateral
  findings. The scored kill-power says 70/70 killed, 4 killed-positive, 0 survivors, 0 crashed,
  `holds true`, 183/183 force-true, minimum-mutant guard ok (`.ufo/waves/round-77/scored/c1-kill-power-a.json`).
- **Reproducibility.** All 70 outcomes match the scored run (66 named / 4 positive). For four mutants
  (`M5-producer-verdict-and-to-or`, `M-timeline-gapfrac-0.6`, `M-prior-set-complete-dropped`,
  `M-walk-evidence-only`) my failed-case set is a strict subset of the scored set: `--first-failure`
  stops in-flight cases, and the scored run's launcher passes `${JOBS:-12}` (`run-scored.sh`) where my
  replay used `--jobs 5` (`frozen-semantic-vs-scored.json`: 70/70 same outcome, 4 concurrency supersets).
- **Killed without a named case:** yes, the `killed-positive` path (`kill-power-r77.mjs:136-150`).
  It is finding-backed, not empty: the four are `M-timeline-min-own-gaps-12`,
  `M-walk-nonce-exclusion-dropped`, `M-activation-intercept-dropped`, `M-selection-last-path`, with
  the mutant counter's own finding ids on the honest receipt (`replay-event-timeline`;
  `prior-set-complete`; `activation-law`; `selection-law`+`read-law`). I reproduced the first directly:
  a `MIN_OWN_GAPS=12` counter on the honest receipt → exit 1, `findings [replay-event-timeline]`,
  `ownGaps 11 < 12`, and the battery stops with `cases 0`, `failed ["(positive)"]`.
- **Crash caveat.** A case-level counter crash (uncaught exception → exit 1, empty stdout) makes that
  case fail with `findingIds: null`; `classify` lists it under `killed` with a named case even though
  the expected finding never fired. Demonstrated with a crafted counter that throws only when
  `r.nonce !== expectNonce`: the `nonce-expected` case returned `{exit:1, findingIds:null}` and appears
  in `failed` (`crash-attribution.json`). Mutation-testing convention counts crashes as kills and the
  frozen 70 contain none, but the summary does not record per-case finding ids, so a future
  crash-killed mutant is indistinguishable from a semantic kill.
- **Pipe truncation.** The 186,387-byte battery summary through a pipe parsed completely (allOk true,
  336/336); the counter's 32,688-byte `--json` through a pipe is byte-identical to file mode. The
  battery sets `process.exitCode` (`negatives-filechooser-r77.mjs:493`), the counter's `writeAll` loops
  on `EAGAIN` (`check-filechooser-r77.mjs:145`), and kill-power waits on `'close'` and writes its
  summary to `--out` (`kill-power-r77.mjs:129-135`). No truncation observed at full size.

## Low-severity defects (documentation / maintainability; behaviour and predicate legs unaffected)

- **D1** `kill-power-r77.mjs:14`: “79 events in every honest receipt and every prior” is false — the
  three degenerate priors are 37, 35 and 79 events. The omission is still sound (`ABSDEN-own` survives,
  `allOk true`); reword the reason.
- **D2** `negatives-filechooser-r77.mjs:242-260`: the battery re-implements the counter's rule
  constants and `needs()` by hand; nothing mechanically ties the replica to `check-filechooser-r77.mjs:241`.
  Frozen digests pin both for this generation and my direct runs agree with the replica, but a future
  one-sided edit would silently misplace brackets.
- **D3** D1 witness granularity: the witness is at own = 13, the minimum that separates the pure own
  denominator; `min`, `OR` (both equivalent-or-stricter) and the average mixed denominator survive.
  Not a counter defect; it bounds what the D1 case proves.

## Residual risk and verification gaps

- I did not re-run the 183 force-true mutants or the full 253-mutant kill-power. The force-true
  construction replaces the `check()` hook with `if (id === "<id>") ok = true;` for each of the 183
  declared ids; with `coverageGap []` every id is the expected id of ≥1 refusal case, so forcing it
  true must fail that case. The scored results confirm 183/183 killed, each with the id-named case
  (e.g. `schema` → `failedCases ["schema"]`).
- The kill-power's failed-case list is scheduling-dependent (`--first-failure`, in-flight workers);
  the scored launcher passes `${JOBS:-12}`, the kill-power default is 4, my replay used 5. `killed` is
  stable, the exact list is not.
- The counter is a receipt reader, not an execution oracle; the declared limit (same-user forgery
  below both prior needs; a receipt fabricated from nothing; a receipt outside the prior set and the
  two walked trees) stands unchanged. I did not attempt to extend it.
- Hard links: `priorReal` uses `realpath`, so a hard link to a prior inside a walked tree is not
  exempted and would be refused (`prior-set-complete`). Stricter, not a hole; the frozen walk cases
  use symlinks only (R77Exec4's hypothesis covers hard links).
- `GAPDEN-avg` survival means a future counter that averaged the two denominators would pass this
  battery at own = 13; pinning it would need a receipt with own ≥ 14, which the frozen case list does
  not contain (whether the last leg can host a third ≥ 50 ms gap before `closedAt` was not established).
- Resume continuity: not applicable — neither frozen instrument has a resume/preflight path; the closest continuation guard is the counter's replay identity/timeline check, reviewed above.
- No tool installs or upgrades were needed (nothing recorded). Scratch
  `/fast/scratch/hyaku/tabi-r77/R77Review2/` was removed after the cited JSON was copied to the seat
  directory.

## Artifacts (`.ufo/waves/round-77-seats/R77Review2/`)

`base-counter-a.json`, `bracket-placements.json`, `direct-brackets.json`, `direct-grid.json`,
`direct-owngaps.json`, `full-battery-pipe.json`, `full-battery-second.json`,
`near-boundary-mutants.json`, `mutant-*.json` (16), `frozen-semantic-rerun.json`,
`frozen-semantic-vs-scored.json`, `mirror-write-differential.json`, `crash-attribution.json`,
`min12-positive.json`.
