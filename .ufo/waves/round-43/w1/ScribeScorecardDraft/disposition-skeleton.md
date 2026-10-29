# Round 43 — executed disposition (DRAFT skeleton; seat `ScribeScorecardDraft`)

Append-only draft for `SCORECARD.md`: to be appended after the existing
`## Round 43 — declared claims (frozen before data)` section. No prior byte of
`SCORECARD.md` is edited by this draft; the draft itself is not an admission.

Measured at integration revision `<REV>` (L1-owned); baseline
`ab592825cd195599822ca227f7768914df208201`; claims, counters and controls frozen at
`7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` and never amended after seat data.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| **C1 coverage** — Playwright Firefox loopback TCP observation under a signature-authenticated chain (per-invocation Ed25519 run key, witness-attested, challenge-bound receipt) | `node scripts/measure-c1-round43.mjs --out corpus/evidence/round43/playwright-egress/receipt.json --measure-out .ufo/waves/round-43/measure/c1-measure-r43.json --scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run` | **Before (frozen, `claims.json`):** "At baseline ab592825cd195599822ca227f7768914df208201: git ls-tree -r --name-only <baseline> -- corpus/evidence/round43 lists 0 files (control .ufo/waves/round-43/controls/c1-baseline-tree-count.txt); the committed round-42 receipt scored by counter v5 in a direct invocation is refused (control .ufo/waves/round-43/controls/c1-replay-r42-refused.json); a self-signed synthetic pair is refused by the challenge-response (control .ufo/waves/round-43/controls/c1-synthetic-refused.json); a tampered measure record is refused by its signature (control .ufo/waves/round-43/controls/c1-relabel-refused.json)." → **After:** `<pending L1 post-wave>` | `pending (L1 post-wave)` |
| **C2 calibration** — round-42 routed-defect checker hardened (r1 blob-type gate via S151, pinned measure blob id 8ff64d691f5c09569a50f2a5a038bb23774c3d35, r5 freeze-binds-controls, r6 committed V0-probe refusal) | `node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | **Before (frozen, `claims.json`):** "At baseline ab592825cd195599822ca227f7768914df208201 the round-43 checker exits 1: the round-43 claims freeze and its controls are not yet committed (control .ufo/waves/round-43/controls/c2-baseline-red-r43.json records the red state). The r42 checker bytes green the rebuilt V0 fabrication and name no type violation on the tree fixture (controls c2-v0-probe.json, c2-tree-fixture.json)." → **After:** `<pending L1 post-wave>` | `pending (L1 post-wave)` |

Verdict / score column is left as `pending (L1 post-wave)` for both rows: the wave
was not settled when this draft was written, the measured revision is L1's, and the
frozen kill rules (quoted below) decide the cell — no seat, including this one, may
write an admission into the cell.

### Frozen kill rules that govern the verdict cells

- **C1:** "If any settled seat demonstrates an in-model do-nothing reach, or any control refuses, or the receipt/measure bytes are not committed at the measured revision, the claim is not admitted: no capability row enters the SCORECARD table, coverage holds its score, and the finding is routed to round 44. The predicate, kill rule and counting command are frozen before any seat scores; they are never amended after wave data."
- **C2:** "If any settled seat demonstrates, within the committed bytes and the declared model, that a rule accepts what its sentence denies (a tree scored as blob, a fabricated measure record greened, a forged control binding, a quote line absent from the control bytes), the claim is not met as worded: calibration holds its score and the repair routes to round 44. No rule or sentence is amended after any seat scores."

### Conditional admissions (each applies only if its own frozen admission sentence holds)

- **C1 (on pass only):** On pass only: one capabilities-table row `playwright-firefox-loopback-tcp - observe a loopback browser session's TCP sockets from both ss and /proc/net/tcp under a signature-authenticated chain (per-invocation Ed25519 run key, witness-attested, challenge-bound receipt)` whose evidence pointer names the committed round-43 receipt and measure record, first-working round 43.
- **C2 (on pass only):** On pass only: calibration evidence pointer updated to the round-43 checker receipt at the measured revision; no numeric score change without a later score rubric.

### Waves / seats — round 43

One policy-v2 wave of **64 seats** (`tabi-r43-w1`, build and attack items together),
dispatched at `.ufo/waves/round-43/w1.ready.dispatched`; report dir
`.ufo/waves/round-43/w1/`. **Roles are tallied at integration from
`.ufo/waves/round-43/w1/w1-results.json`** (canonical source: the results file, not this
draft): `<pending L1 post-wave>`.

Dispatch-time shape observed by this seat (registry
`.ufo/waves/round-43/w1/swarm-registry.json`, `createdAt`
`2026-10-29T20:49:15.914Z`, 64 members, all `kind: spawn`): roles — critic 16,
executor 16, mutation-tester 8, reviewer 6, scout 5, scribe 5, connector 4, sentinel 2,
simplifier 1, revenger 1; declared axes — calibration 27, operability 10, coverage 9,
freshness 6, adjacency 4, discernment 4, quality 2, depth 2. Seat outcomes
(settled / finding / dead), the wave's WAVE-DONE state and the counts of seats that
found an in-model do-nothing reach: `<pending L1 post-wave>`. Dead seats are recorded,
never replaced.

### Draft-integrity notes (grounded by this seat's own runs)

- The frozen digests in `claims.json` were re-derived from the committed bytes at the
  freeze commit `7ca6f018` for all six frozen files, and all eight committed control
  files hash equal to their `claims.json` `controlBindings` entries
  (`.ufo/waves/round-43/w1/ScribeScorecardDraft/evidence/freeze-digests.txt`).
- The C2 counting command re-run at the baseline revision exits 1 with exactly the
  two findings the committed red control records (`r5-claims-absent`,
  `r6-probe-absent`), so the C2 "Before" cell is observed, not copied
  (`evidence/c2-checker-at-baseline.json`; control
  `.ufo/waves/round-43/controls/c2-baseline-red-r43.json`).
- The C1 "Before" cell's first element was re-observed:
  `git ls-tree -r --name-only ab592825cd195599822ca227f7768914df208201 --
  corpus/evidence/round43 | wc -l` → `0`
  (`evidence/c1-baseline-tree-count.txt`).
- The C1 counting command was **not** run by this seat (it launches Firefox and is
  L1's measured run); its "After" cell is therefore genuinely pending, not asserted.

### Open items for L1 (not amendments — nothing frozen was touched)

- `SCORECARD.md:2309` (round-43 declared-claims table) prints the C1 counting command
  with `--scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run2`, while the frozen
  `claims.json` (sha256
  `290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029` at the freeze
  commit) says `--scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run`. This draft
  quotes the frozen `claims.json` string; L1 to reconcile the declared table.
- The C2 counting command carries the frozen `<REV>` placeholder; L1 substitutes the
  measured revision when the disposition is finalized.
