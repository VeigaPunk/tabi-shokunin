# R87Exec3 — C2 before/after and the two do-nothing controls (reproduction only)

Seat: executor, round 87 wave w1. Scope: reproduce C2's BEFORE control, both C1 do-nothing
controls, and the C2 AFTER state against the lane. Nothing was fixed, and no lane record was
edited. Axes: calibration, operability.

## Instrument identity

- Lane HEAD at run time: `24765dd9` (`24765dd95b5ef01ffc24a19ae5f293315216f4e5`), the frozen base.
  The r87 records are uncommitted working-tree changes (19 `git status --porcelain` entries);
  the drift gate reads the working tree.
- `scripts/check-record-drift-r87.mjs` sha256
  `603fb5874bf3743259a62209d9b41c023ccb78619239564e7f2a8a9e3c4397f7` — matches the
  `freeze.txt` pin exactly.
- `scripts/selftest-r87-gates.mjs` sha256
  `3e41bd2e93931c69df24b0d291aacf2646ea5f1e6240cd61e87544dbfeaadc82` — matches the `freeze.txt`
  pin; selftest line 78 runs `check-record-drift-r87.mjs --lane <lane> --json` (C2 leg c wiring
  present) and line 41 pins the script in `FILES`.
- All commands ran with cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin` and absolute `--lane`.

## 1. C2 BEFORE — frozen gate on a worktree of base 24765dd9

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin worktree add --detach \
  /fast/scratch/hyaku/tabi-r87/R87Exec3/base 24765dd95b5ef01ffc24a19ae5f293315216f4e5
git -C <base> rev-parse HEAD      # 24765dd95b5ef01ffc24a19ae5f293315216f4e5
git -C <base> status --porcelain  # empty
node scripts/check-record-drift-r87.mjs --lane /fast/scratch/hyaku/tabi-r87/R87Exec3/base --json
```

Result: **exit 1**, `claims 5`, `mismatches 5`.

```json
{"claims":5,"mismatches":5,"failed":[
 "accept-headline","mistake-evidence","sources-searchlog","ledger-pointer","report-corrections"]}
```

Per-statement details at base (from `--json`):

| id | base detail | base bytes observed |
|---|---|---|
| accept-headline | `skill=false plan86=false quality161=false` | `SKILL.md` carries "never a validator" once and not "not a validator on a programmatic answer"; `plans/round-86.md:23` carries "filters the dialog, never a programmatic answer"; `corpus/QUALITY.md` ends at item `160.` (no 161). |
| mistake-evidence | `rows=2 stalePointer=true repointed=false note=false beforeSurvivors=3` | both `corpus/lessons/round-86.md` rows cite "`scored/witness-a.json` first two runs"; `.ufo/waves/round-86/lesson-proof/README.md` is absent at base; `witness-a.json` exists with 3 before-survivors. |
| sources-searchlog | `round86-entry=false` | `corpus/SOURCES.md` has no `round-86` line at base. |
| ledger-pointer | `scribeRow=true pointer=true ledgerItem=false` | the base Scribe row already names `plans/round-86.md §Narrowings item 1`, but base §Narrowings item 1 is `accept-grammar-law`, not the headline narrowing. |
| report-corrections | `count=false sources=false` | `corpus/lessons/round-87.md` is absent at base. |

So BEFORE = 5 is real but not uniformly "stale existing sentences": statements 1–4 fail against
existing base bytes (accept-headline 3/3 stale-or-absent sub-checks, sources missing its line,
ledger §Narrowings missing the item, mistake rows stale), while statements 2 and 5 also require
files introduced in r87 (`lesson-proof/README.md`, `corpus/lessons/round-87.md`). The predicate's
`before mismatches == 5` holds exactly; it counts the whole record fix (edits plus the two new
r87 files), not only rewrites of pre-existing sentences.

## 2. C2 AFTER — same frozen gate on the lane

```
node scripts/check-record-drift-r87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Result: **exit 0**, `claims 5`, `mismatches 0`, `failed []`; all five details positive:
`skill=true plan86=true quality161=true`, `rows=2 stalePointer=false repointed=true note=true
beforeSurvivors=3`, `round86-entry=true`, `scribeRow=true pointer=true ledgerItem=true`,
`count=true sources=true`. Lane bytes: `QUALITY.md` item 161 present; `SOURCES.md:300` carries the
2026-11-08 round-86 entry with `identified 2 / screened 2 / included 0 / excluded 2`;
`plans/round-86.md:158` carries the accept-headline narrowing item; both lesson rows point at
`lesson-proof/README.md`, which states the transcripts were not retained and records before=3;
`corpus/lessons/round-87.md:46-49` records 39→40 and S221/S222 carried-not-reopened.

## 3. Do-nothing control 1 — round-86 scored receipt under the round-87 counter

```
node scripts/check-showpicker-r87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round86/chromium-showpicker/receipt.json \
  --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f \
  --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 \
  --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
```

Result: **exit 1**, `verdict findings`, `checkCount 95`, 47 findings, `priorSet 2`.
`JSON.stringify(reproduced) === JSON.stringify(.ufo/waves/round-87/controls/c1/nowork-r86-under-r87.json)`
is **true** — a byte-for-byte (deep-equal) reproduction of the committed control, including the
`limit` block and `nodeReport`.

Finding ids (47), in order: `schema, nonce-shape, nonce-expected, driver-pin, plan-frozen,
leg-order, leg-records, plan-calls, leg-sp84-*` (18 legs), `leg-sp85-*` (6 legs), `leg-sp86-*`
(6 legs), `webkitdirectory-answer-law, accept-answer-law, multiple-mode-law, accept-mime-answer-law,
accept-grammar-law, second-chooser-answer-law, no-selection-law, fixture-descriptors,
prior-set-complete`. The superseded-generation ids named by the plan (`schema`, `plan-frozen`, leg
records) are present; `prior-set-complete` additionally names the round-87 evidence receipt found in
the walk, as in the committed control.

Calibration note: the control is fixture-pin sensitive. With the round-87 fixture pin
`10e444f7…d94c4` instead of the round-86 receipt's own fixture sha `94421dc0…a3a1`, the run still
exits 1 but reports 48 findings (adds `fixture-hash`). Byte-identical reproduction requires the
receipt's own fixture sha, which is what the committed control embeds.

## 4. Do-nothing control 2 — no receipt

```
node scripts/check-showpicker-r87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r87/R87Exec3/absent.json \
  --expect-driver-sha256 7c54e786…e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 10e444f7…94c4 \
  --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
```

Result: **exit 2**, `verdict unreadable`, single finding `receipt-unreadable`
(`ENOENT: no such file or directory, open '/fast/scratch/hyaku/tabi-r87/R87Exec3/absent.json'`).
Same shape as the committed `controls/c1/noreceipt.txt`; the prior set resolves first, so the
absent receipt is the reported failure.

## 5. Attacks on the claims (report only; no amendment proposed)

- **Gate is fail-able and pass-able in the same frozen instrument.** Same sha256-pinned script:
  base worktree → 5 mismatches/exit 1; lane → 0 mismatches/exit 0. The before worktree was clean
  at the exact frozen base commit, so the 5 is not a dirty-tree artifact.
- **Do-nothing control cannot pass by construction** (round-86 schema under a round-87 counter) and
  reproduces exactly; it does not depend on any r87 score beyond the prior-set walk noise it
  records.
- **Ordering claim not established by mtimes.** `plans/round-87.md` says the do-nothing controls
  were "committed before any score". Directory/file mtimes: `controls/c1/nowork-r86-under-r87.json`
  and `noreceipt.txt` 07:13:17, while `corpus/evidence/round87/chromium-showpicker/receipt.json`
  is 07:11:39; only `.ufo/waves/round-87/scored/drift-before.json` (07:04:18) demonstrably predates
  the receipt. The controls are constructions that cannot pass, so the ordering is not load-bearing
  for verification — but the plan's ordering sentence is not supported by the timestamps I can see.
  No defect claim is made; the integration owner should judge whether the wording needs it.
- **`claims.json` C1 `countingCommand` nonce is stale.** The frozen C1 counting command carries
  `--expect-nonce tabi-r87-l1-42a489b9d4be` (the superseded D2 nonce), while `claims.json.nonce`,
  `freeze.txt` context and the scored receipt carry `tabi-r87-l1-3dd4b0802d67`; the
  `doNothingControl` entry's recorded expected nonce is `3dd4b0802d67`. This string sits outside the
  five drift statements, so the gate is green; it is a claims-vs-instrument inconsistency for the
  critic/integrator, not a gate failure.
- **BEFORE count composition limit.** As shown in §1, 2 of the 5 base mismatches include the
  absence of r87-introduced files, so "5" measures the complete record fix (plus new files), not a
  pure stale-sentence count. The kill rule (`before != 5 → NOT verified`) is satisfied as written.

## Files changed

- This report only: `.ufo/waves/round-87/w1/R87Exec3.md`. No lane record, corpus/evidence/round87
  byte, script, fixture, or fleet-root file was written; no git/jj mutation beyond the assigned
  `worktree add` (and the assigned `worktree remove` before yielding). No test/build/lint was run
  beyond the two frozen counters named above.

## Tools

No install or upgrade. Node v24.21.0 and git were already present; channel: existing host binaries.

## Blockers

None. Worktree and scratch `/fast/scratch/hyaku/tabi-r87/R87Exec3` removed before yielding.
