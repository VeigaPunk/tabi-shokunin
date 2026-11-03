# R60MutC2 — mutation probe for claim C2 (round 60, wave w1)

Seat: R60MutC2 (mutation-tester). Claim: C2 (calibration, chromium receipt counter).
Frozen instrument: `.ufo/waves/round-60/counters/chromium-receipt-r60.mjs`
sha256 `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` (2582 lines) — the
final sha R60Exec2 froze after the L1-ordered P3/P3b strengthening and the page-keyup closure (selftest 110/110). Earlier
RE-READY shas `5465be1f`, `1bab026a`, `99844dd9`, `1408dd90` and `0ed93c7a` were superseded before this
measurement; the kills below are measured only on `b0d03fe0` and nothing here rests on earlier bytes.
Authority: `.ufo/waves/round-60/claims.json` C2 / mutantsC2 C6–C9 (read first, never amended).

## Method

Each mutant is a byte-copy of the frozen counter with an exact string replacement (the harness
asserts the target string occurs exactly once, then rebuilds the mutant from the recorded
replacement to prove the mutant sha). Mutant copies live in scratch
`/fast/scratch/hyaku/tabi-r60/R60MutC2/` (disposed by trap); the counter's
`FIXTURES_DIR` (dirname(SELF)/`chromium-receipt-r60-fixtures`) is symlinked to the lane's frozen
fixtures dir so the counter bytes stay exact. Every run uses the claim's argv shape:
`node <counter> <receipt> --driver scripts/chrome-cdp-loopback-round59.mjs
--expect-driver-sha256 b16ddb44…ff86 --shot corpus/evidence/round59/chromium-capslock-boundary
--json`, cwd = lane root.

Probe set F (hashes as measured): A `bdd3c0ea…d8a0` (r59 f6-probe), B `7793e4f8…6fbb`
(r59 f6-probe), D `0feeb2ae…c445`, E `5b5ebd12…736c` (r60 f-probes, both present on disk).
Live receipt `72514ff7…a083`. Kill rule (seat spec): KILLED iff a probe in F exits 0, or the live
receipt exits non-zero, or the selftest fails.

## Control (pristine bytes, same harness)

CONTROL-OK: `--selftest` exit 0, allPass true, 110/110; probes A/B/D/E all exit 1 (cancelable /
trace-shape findings); live receipt exit 0, findings []. Baseline is sound, so mutant results are
interpretable.

## Verdicts (all measured at the frozen sha b0d03fe0)

| mutant | mutant sha256 | selftest | A | B | D | E | live | verdict |
|---|---|---|---|---|---|---|---|---|
| C6 | `865060952339f1bd115bb468658c80ac41591d168fae88c5e314d84631b244d1` | 105/110 exit 1 | 1 | **0** | 1 | 1 | 0 | **KILLED** |
| C7 | `917d289547c246e996dff9ef517a8f3fce4c50658a227212481de116416ae58e` | 106/110 exit 1 | 1 | 1 | 1 | 1 | 0 | **KILLED** |
| C8 | `7d716f83490ec52f465536e55f2cb791a8a7eb63e00a4f6bdfce25ef9c496a4a` | 108/110 exit 1 | 1 | 1 | 1 | 1 | 0 | **KILLED** |
| C9 | `f881ece4eea412fdc64c7ffdceeeceddc9fe61fcee3341b31db6cce6d87a20af` | 109/110 exit 1 | 1 | 1 | 1 | 1 | 0 | **KILLED** |

No mutant SURVIVED. No mutant turned the live receipt red (K2 unaffected).

- **C6** — `SHAPE_KEYS` loses `cancelable`; `deliveredShapeProblem` drops the boolean-type and
  keydown-true rules; the leg trace's present-cancelable rules drop. Probe **B goes green**
  (`exit 0`, findings []): the deleted cancelable is no longer refused. Probe A stays red but its
  finding set shrinks to `keylog-flag-mismatch` (the cross-check still refuses it), so A alone does
  not kill C6 — B does, and the selftest kills it independently (5 failing cases: probe-A,
  probe-B, probe-D, second-event, string-typed).
- **C7** — both `checkCapsTraceFlags` call sites and the leg-trace (b) block removed. Selftest
  106/110, failing `cancelable-keyup-disagrees` (got [] vs want [keylog-flag-mismatch]) plus the
  A/D/second-event cases whose want-sets include the cross-check finding. **Probe D stays red**
  (`missing-delivered-shape-field`) because the shape rule independently refuses
  `cancelable:false` on a keyDown trace entry, so probe D is NOT the killer here; the isolating
  case is the selftest's keyup-disagrees fixture.
- **C8** — `capsMirrorSlots` reads only `press1`, dropping the `press2` press pair. Selftest
  108/110, failing exactly `cancelable-second-event-false` and `caps-dp-missing-press2-up` (the
  second pinning case is the defaultPrevented rule reading the same dropped slot). Probes stay
  red (they defect on the first event), so the second-event fixture is the killer, as the claim
  requires.
- **C9** — the boolean-type and keydown-true rules become a truthiness rule (a string `"true"` or
  any truthy non-boolean satisfies it; absent/false still refused). Selftest 109/110, failing
  exactly `cancelable-string-typed` (got [] vs want [missing-delivered-shape-field]). Probes stay
  red; the string-typed fixture is the killer, as the claim requires.

## Honest deviations from the mutantsC2 wording (killed anyway, but not by the named case)

1. C7's stated killer is "probe D". Measured: probe D remains refused under C7 by the independent
   delivered-shape value rule; the mutant is killed by the selftest case
   `cancelable-keyup-disagrees`, not by probe D. The kill is real (selftest not allPass) but the
   named detector is not the one that fires.
2. C6's stated killers are "probe A and probe B". Measured: probe B greens; probe A stays red with
   a reduced finding set. The claim's K3 (C6 must not survive the selftest) holds.

## Restoration / integrity

- Source bytes never modified: sha256 `b0d03fe0…caae` before and after the run
  (`integrity.sourceShaMatchesRun: true`).
- Each mutant was rebuilt from the recorded replacements against the frozen source and matched its
  recorded sha (`integrity.mutants.*.matchesRecorded: true`); changed lines 12/17/5/8 for C6/C7/C8/C9.
- Scratch copy disposed by `trap 'rm -rf -- "$S"' EXIT` after receipts were copied into
  `.ufo/waves/round-60/w1/R60MutC2/`.

## Not run / out of scope

- No C1 work, no r59 counter runs, no lane-wide build/lint/test, no git mutation, no commit.
- No tools installed or upgraded this seat.

Evidence: `.ufo/waves/round-60/w1/R60MutC2/kills.json` (per-mutant replacements, shas, selftest
detail incl. failing cases, per-probe exits and finding ids, live exit, verdict),
`harness.out.json`, `mutate.py`, `spec.json`.
