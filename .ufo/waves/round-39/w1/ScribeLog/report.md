# ScribeLog — round-39 LOG entry skeleton

Seat: `ScribeLog` (lane `tabi`, round 39, attempt 1, one v2 wave). Milestone: **draft**.
Date: 2026-10-27. Lane tip observed: `1ace2fd` (worktree clean except untracked wave dirs).

## Deliverable

| Artifact | Path |
|---|---|
| Draft append-only LOG entry (drop-in shape, all unmeasured fields marked `OWED:`) | `.ufo/waves/round-39/w1/ScribeLog/LOG.round-39.skeleton.md` |
| Exact commands + outputs backing every number in the draft | `.ufo/waves/round-39/w1/ScribeLog/measurements.txt` |
| Seat findings (this file's wave-level copy) | `.ufo/waves/round-39/w1/ScribeLog.md` |

`LOG.md` itself was **not** touched (fleet-root tracked file; landing is an integration action).

## What the skeleton contains (behaviour)

1. **Freeze entry** — claims path and sha256 `ed88855a…89b6`; instrument-binding commit
   `9c09ebb1…`; round-start baseline `5bc56a81…`; the three frozen instrument paths with digests
   re-derived at HEAD (`75e823e4…`, `eefc8997…`, `3fba8b68…`) all equal to `claims.frozenDigests`;
   frozen axes (adjacency 8, operability 9, depth 9, coverage 9, freshness 9, calibration 9),
   `lowestAxis` adjacency and the frozen waiver/stagnation note; the 64-seat wave plan with its
   measured role mix.
2. **Claim surfaces verbatim in scope** (C1 coverage capability; C2 calibration instrument
   repair), including C1's full predicate leg list and C2's D1–D7 span, plus the 709-byte
   predicate sentence's sha256 `b535dd0c…` verified byte-identical to the counter constant.
3. **Observed source** — S145 `proc_pid_net(5)` with URL, anchor and the 11-word located quote,
   recorded against `.ufo/waves/round-39/assimilation/S145-open.txt`.
4. **Before-measurement** at the baseline (`c1-before`, `c2-before`, `census-start-counts`:
   rows 144 / A 128 · B 7 · C 9 / mined 120 · queued 15 · rejected 9).
5. **Pre-integration measurement** at `d3232d5`: C1 predicate met (exit 0); C2 not-met (exit 1)
   with D1–D4 and D7 true and findings `d5-receipt`, `d6-file`.
6. **C1 receipt fields as recorded** (2 runs; 9/8 samples; 1560/1461 ms coverage; identical
   first-shot `ebfae99c…`; 5-PID owned trees under node pid 2430191; 0 non-loopback on both
   surfaces plus final sweep; 0 survivors; port closed; Firefox 157.0 bound), with the knowledge
   entry's own limits restated.
7. **Owed block** — clean-clone counter runs at the disposition REV, `census-end.txt`,
   `numstat-at-<REV>.txt`, wave tallies, no-harm battery, frontier move, assimilation,
   re-verification, axis scores, trend verdicts, and the missing round-38 landed-commit ledger.
8. **Mistakes** (candidates, each with command-level evidence and an `OWED:` Captured-by) and a
   **landed-commit ledger** of the ten round-39 commits observed as ancestors of HEAD.

Every outcome the round has not measured is written as `OWED:`, never as done: no counter was run
by this seat against a clean clone, no wave tally is claimed, no axis score and no trend verdict
is offered.

## Findings (observed, not adjudicated)

- **F1 — `reference-drift`, independently re-derived.** `claims.json` declares
  `frozenAt: 9c09ebb…`, but the claims blob *at* `9c09ebb` declares `frozenAt: 1f4260a…`
  (`sha256` of that blob `40740f82…`, of the worktree/HEAD blob `ed88855a…`). The single-line
  diff lands in `dc695dc`. The pointer is an *instrument* pointer, not a claims-bytes pointer: the
  C2 counter digest at `1f4260a` is `891c1e9d…`, at `9c09ebb`/HEAD `eefc8997…` (the value the
  claims bind). Net effect: resolving a pre-`dc695dc` claims blob yields a digest mismatch. Wave
  seat `RevFreezeIntegrity` reports the same class from the opposite direction. The amendment did
  not touch the predicate sentence, so D7 byte-identity is unaffected (measured).
- **F2 — `claim-design` (cited, not re-run).** C2 D6 requires a numstat receipt committed at REV
  that names REV, so committing it moves the hash it must name. Recorded by
  `.ufo/waves/round-39/measure/c2-self-reference-probe.txt` (candidate `03322e9d…` → carrier
  `5c13c846…`, counter exits 1 again) and independently by seats `CritC2Semantics` and `RevD5D6`.
  Provenance limit: that probe file is untracked at HEAD (`git status --porcelain` → `??`), so the
  draft cites it as seat evidence, not as a committed receipt. Consequence carried in the draft:
  C2's predicate is never asserted true, and the calibration target may be unattainable under the
  frozen claim.
- **F3 — `source-registration`.** S145 is not in `corpus/SOURCES.md` (`grep -c S145` → 0; rows
  still 144), and the frozen C1 `source` field calls it "proc(5)" while the opened page and the
  knowledge entry are `proc_pid_net(5)`. Wave seat `RevSourcesRow` additionally reports a
  title/URL disagreement. The draft records the discrepancy and marks the row `OWED:`.
- **F4 — `ledger-gap`.** `LOG.md` has no round-38 landed-commit ledger although the round-38 entry
  promises one (`grep -n "Round 38" LOG.md` → a single heading). Carried as an inherited `OWED:`
  in the draft rather than invented.
- **F5 — wave state snapshot.** 64 seats dispatched (registry: reviewer 17, critic 12, scout 9,
  mutation-tester 8, executor 7, scribe 6, connector 3, sentinel 1, revenger 1); at measurement 25
  `report.md` files carried 31 `VERDICT` lines (23 `finding`, 5 `ok`, 2 `could-not-evaluate`, and
  one `VERDICT finding: …` in `RevNoHarmScope/report.md:27` whose token is followed by a colon).
  Recorded as an in-flight snapshot only — no tally is claimed and the incomplete wave is not
  scored.

## Gates / verification

None run by this seat, by design (draft artefact, verification is the main agent's). Every number
in the draft is a read of a committed receipt or a re-derivation whose command and output are in
`measurements.txt`. Recommended main-agent checks before this entry lands: the two frozen counters
in a clean clone at the disposition REV, the lane census, `check-selfassessment`, and the no-harm
battery recorded in the entry's `OWED:` block.

## Touched surfaces

- Written: `.ufo/waves/round-39/w1/ScribeLog/LOG.round-39.skeleton.md`,
  `.ufo/waves/round-39/w1/ScribeLog/measurements.txt`,
  `.ufo/waves/round-39/w1/ScribeLog/report.md`, `.ufo/waves/round-39/w1/ScribeLog.md`.
- Scratch `/fast/scratch/hyaku/tabi-r39/ScribeLog/` created and removed; no fixture, clone or
  driver run, so no browser was launched and no loopback server opened.

## Out of scope / not done

- `LOG.md`, `SCORECARD.md`, `SOURCES.md`, `corpus/**`, both frozen counters and the driver were
  **not** modified; no commit, push or jj/git mutation; no spawn; no `agent://all` message.
- No counter run, no wave tally, no axis score, no trend verdict, no disposition: the entry stays
  a draft until the wave completes.
- No tool installed or upgraded; no pacman transaction (`claims.toolInstalls` is `[]`).

VERDICT finding — draft LOG entry delivered complete with every unmeasured field marked OWED, and five observed input defects carried (F1 freeze-pointer/claims-bytes split re-derived; F2 C2 D6 self-reference cited from the frozen probe and two seats; F3 S145 unregistered plus proc(5)/proc_pid_net(5) citation split; F4 missing round-38 ledger; F5 wave still in flight); no claim, tally or score is asserted.
