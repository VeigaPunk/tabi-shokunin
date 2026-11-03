# R61MutC2 — C2 r61 counter mutation probe (round 61, wave w1)

Seat: R61MutC2 (mutation-tester). Claim: **C2** — coverage capability
`chromium-pointer-event-domain-linux`. Milestone: r61 counter mutants C1'–C5'.
Authority: `.ufo/waves/round-61/claims.json` (read in full; never amended). The frozen
mutant list is `mutants.C2`, the frozen forgery set is `F = {f1,f2,f3,f4}` and the
auxiliary nonce-tamper probe is f5.

Axes named: **coverage** (assigned; detector-coverage evidence for the new pointer
domain), **calibration** (the counter's forged-receipt refusal), **operability**
(reproducible CLI on copies). Each measured kill strengthens coverage evidence and
leaves calibration/operability intact (green fixture still green); no axis regressed.

## Instrument under test (pinned before any mutant ran)

| item | path | sha256 |
|---|---|---|
| r61 counter | `.ufo/waves/round-61/counters/chromium-receipt-r61.mjs` (159001 B) | `f615a2f9c2b2cf438321d54f1a6ac6364c22d6d7a7e7c3b7a823e7c2f3ea027e` |
| r60 base counter | `.ufo/waves/round-60/counters/chromium-receipt-r60.mjs` | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` |
| f-probes generator | `.ufo/waves/round-61/measure/f-probes-r61.py` | `53d5cb930f35fd5a1086c61164ae5a8dbf4d9323f5eed61269cad59efcc3f89e` |
| f-probes manifest | `.ufo/waves/round-61/measure/f-probes/manifest.json` | `c584174d4847003fe4cb961a70d094445f67a17b59a78a0c8c6575217eae9ac2` |
| green fixture receipt (synthetic) | `.../chromium-receipt-r61-fixtures/live/r61-pointer-fixture.receipt.json` | `6dd8c3e206fcabe263c7de548993f679ef4a34e8c3a8aa56af7136a6a9689da2` |
| fixture driver (r59 bytes) | `.../chromium-receipt-r61-fixtures/live/chrome-cdp-loopback-round59.mjs` | `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86` |
| fixtures dir (267 files) | `.ufo/waves/round-61/counters/chromium-receipt-r61-fixtures` | digest `abcccd970cb44c6954514cb14c1d859027f5cdf8982ff901bbc9c8ed287ada40` |

Probes actually executed (manifest shas re-verified byte-for-byte):

| probe | sha256 | frozen F |
|---|---|---|
| f1 | `028861210ea316086f556dd51fcb38afb88a3251687b68ac6e619bf6237a9e43` | yes |
| f2 | `70e85d04d7cddfafb2195765d34ee2c954c2069fc2fb22f97a7aeb4ccbf20d81` | yes |
| f3 | `21fec12011f8cae2cf1d2c2f535e3d269ddd20941a131eaf0eb2069c6ddfde10` | yes |
| f4 | `1f0ec49e6e260fb6fbd1e3a194eacd9fcb786cc4f32ea8c81d3b7ef2eec87742` | yes |
| f5 | `9bc26897326dc231ee8597bdeab4804163b20efcb7558ab9742b2aeb6d852155` | no (C5' auxiliary) |

Harness pins: `harness.py` `c5dc25b8f92d2ea93034ba3ab9fda971d470d2190df33d12a9a236d584184fdf`,
`spec.json` `57fe2f3c2caade0417b5532c2dc4aa1409e4fc58b1842d546bc50f346f32b5d0`,
`build_kills.py` `133527f7ad46b646014a67b0e547dee722cb1691dd64c00585ab8822ccc83175`,
`kills.json` `949338fd5319301cb206ce1e96617572e4bd3a64f7e8de2e48afad291ffd44e5`,
`harness.out.json` `de645065843a46c523a1701ddd45d5c45a9e1a483103d9c345315f65cc8c12bc`,
`precision.json` `72170f27948881d5b686d688bbd3d67ea31a521d81238a776541f1766ab00179`.

All probes and the green fixture were produced/verified by R61Exec3 at the same counter
sha; the f-probes manifest's `source` is the synthetic pointer fixture above. The live
r61 browser receipt does not exist yet (data-pass obligation), so this seat measures the
detector against the counter's own contract fixture, exactly as the frozen mutant list
prescribes.

## Method

For each mutant: a byte copy of the counter in scratch, one *semantic* defect applied as
exact string replacements (each target asserted to occur exactly once in the source), the
counter's `FIXTURES_DIR` resolved through a symlink to the lane fixtures dir, and three
runs with cwd = lane root:

1. `node <mutant> --selftest` — kill must show as selftest failures, not only as probe
   refusals (r60 discipline);
2. `node <mutant> <probe-fK.receipt.json> --driver <fixture driver>
   --expect-driver-sha256 b16ddb44…ff86 --shot <fixtures>/live --json` — a **KILL
   requires exit 0 here** where the pristine counter exits 1 (the r60 C6 pattern);
3. `node <mutant> <green fixture receipt> … --json` — the mutation must leave the
   unmutated fixture green (the mutation changes one thing).

Control is the pristine copy through the same harness (selftest + green fixture + f1–f5).

`--shot <fixtures>/live` is required for the probes: without it the probe receipts (which
carry no PNGs beside them) collect 36 `png-missing` findings in control and mutant alike,
so no mutant could ever green a probe. Measured; see finding F4.

## Control (pristine bytes, sha `f615a2f9…`)

| run | exit | result |
|---|---|---|
| `--selftest` | 0 | **126/126**, allPass true, finding-id coverage 66/66 |
| green fixture receipt | 0 | predicate true, findings `[]`, couldNotEvaluate `[]` |
| probe f1 | 1 | `pointer-type-wrong` ×3 |
| probe f2 | 1 | `pointer-order-wrong` ×2 |
| probe f3 | 1 | `pointer-id-wrong` ×1, `pointer-order-wrong` ×1 |
| probe f4 | 1 | `pointer-trust-wrong` ×1 |
| probe f5 | 1 | `pointer-nonce-wrong` ×1, `plain-trace-wrong` ×1 |

CONTROL-OK: baseline sound, so mutant results are interpretable.

## Verdicts — 5/5 KILLED, 0 SURVIVORS, 0 blocked

| mutant | mutant sha256 | sites / diff lines | selftest | matched probe (control → mutant) | fixture after | verdict |
|---|---|---|---|---|---|---|
| **C1'** drop pointerType check | `e87ebebb781c1a59a3a3b5e3cb9f1477a53be2d43dbafa4dc77561d0c5d254f1` | 1 / 1 | 124/126 exit 1 | f1: exit 1 `[pointer-type-wrong×3]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C2'** check only the first pointer entry | `352256bfbac4409f6814e25e35151c9635a4734c43372602f7948901eb6ad66c` | 4 / 8 | 121/126 exit 1 | f2: exit 1 `[pointer-order-wrong×2]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C3'** accept string/absent pointerId | `48bfe028792814049c483b3b478854ed004d11fe046e4b245d4cdd94c8a9375f` | 2 / 4 | 124/126 exit 1 | f3: exit 1 `[pointer-id-wrong, pointer-order-wrong]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C4'** drop isTrusted presence check | `6ef5c694637944e2da4265ef520a1fd1544444df15c27a13093363137f23731c` | 1 / 1 | 124/126 exit 1 | f4: exit 1 `[pointer-trust-wrong]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C5'** drop nonce binding | `81d27ea1f27d7409f88696a29563dff2a0ca1774dc5dec1341c771bf6eac8269` | 2 / 7 | 122/126 exit 1 | f5: exit 1 `[pointer-nonce-wrong, plain-trace-wrong]` → **exit 0 `[]`** | exit 0 | **KILLED** |

### Selftest failures (the kills are selftest failures, not only probe refusals)

- **C1'** — `r61-f1-pointer-touch` (got `[]`, want `[pointer-type-wrong]`),
  `r61-mutant-C1-prime` (same).
- **C2'** — `r61-buttons` (got `[]`, want `[pointer-buttons-wrong]`),
  `r61-f2-pointerdown-deleted` (got `[]`, want `[pointer-order-wrong]`),
  `r61-f3-pointerid-deleted` (got `[pointer-order-wrong]`,
  want `[pointer-id-wrong, pointer-order-wrong]`),
  `r61-mutant-C2-prime` (got `[]`, want `[pointer-order-wrong]`),
  `r61-mutant-C3-prime` (got `[pointer-order-wrong]`, want both pointer ids/order).
- **C3'** — `r61-f3-pointerid-deleted`, `r61-mutant-C3-prime` (got `[]`).
- **C4'** — `r61-f4-trust-deleted`, `r61-mutant-C4-prime` (got `[]`).
- **C5'** — `do-nothing-nonce-missing` (lost `plain-trace-wrong` from its want-set),
  `plain-trace-wrong` (got `[]`), `r61-f5-nonce-tamper` (got `[]`,
  want `[plain-trace-wrong, pointer-nonce-wrong]`), `r61-mutant-C5-prime` (same).

### Exact mutations applied (single semantic defect each; source occurrences all = 1)

- **C1'** — removed the per-entry rule
  `if (e.pointerType !== 'mouse') add('pointer-type-wrong', …)`.
- **C2'** — per-entry loop over `log.slice(0,1)`; the missing-first-pointerdown rule
  changed from `if (!firstDown || !…)` to `if (firstDown && !…)`; the press/release
  count rule changed from `if (downs.length === 0 || …)` to
  `if (downs.length > 0 && (…))`; the pairing loop changed to
  `for (let i = 0; i < Math.min(downs.length, 1); i += 1)`.
- **C3'** — per-entry id rule now refuses only a *present, non-string, non-numeric*
  id; the release-id equality (`u.pointerId !== d.pointerId`) is enforced only when
  both ids are numeric.
- **C4'** — removed the per-entry rule
  `if (!has(e, 'isTrusted') || e.isTrusted !== true) add('pointer-trust-wrong', …)`.
- **C5'** — removed the pointer-schema complete-trace rederivation
  (`pointer-nonce-wrong`); the carried `plainTrace` prefix rule no longer compares
  `valueAfter` against the nonce (its string-type rule stays).

## Precision probes — the frozen one-liners are under-specified (measured)

Narrow, single-site readings of the same frozen mutant text do **not** satisfy the
frozen detector; they are recorded as evidence, not as verdicts:

| variant | sha256 | probe | exit | findings |
|---|---|---|---|---|
| P-C2-narrow (per-entry loop over `ptrlog[0]` only) | `6ed1cf13739b887a3596d70c4c51f7b23df50725ef489c7e5a8ff7f8eaf65867` | f2 | 1 | `pointer-order-wrong` (the presence/count rules independently refuse the deleted down) |
| P-C3-typeonly (relax numeric id rule only) | `0704634765a15376d8a2700d42f3b047e162010d09c64e648fe5aef613f069b9` | f3 | 1 | `pointer-order-wrong` (release-id equality still refuses) |
| P-C5-additiveonly (remove `pointer-nonce-wrong` only) | `e70947f9c8ac971850e212f502615d23db0e6883d21d8a3d5231200c5f671621` | f5 | 1 | `plain-trace-wrong` (the carried r60 binding still refuses) |

Consequence: C2' must be read as the composed defect (first-entry-only *and*
missing-press tolerated *and* first-pairing-only); C3' must relax both the type rule and
the release-id equality; C5' must drop the carried nonce-prefix binding as well as the
additive pointer rederivation. All three match Exec3's pre-disclosed precision note.

## Integrity / restoration

- The lane counter was never edited: sha256 `f615a2f9…ea027e` before the matrix and
  identical after (re-checked at 23:12 UTC, mtime unchanged `2026-11-03 20:07:24 -0300`).
- Every mutant is a copy; its staged file re-hashes to the recorded mutant sha
  (`harness.out.json.integrity`). Control copy is byte-identical to the source
  (`f615a2f9…`).
- The staged wave-dir copies were re-run after staging: control selftest 0 / fixture 0;
  each mutant selftest 1, matched probe 0, fixture 0 — identical to the scratch matrix
  (`kills.json.integrity.stagedReplay`). A `chromium-receipt-r61-fixtures` symlink was
  added beside the staged counters so `FIXTURES_DIR` resolves; its target is the lane's
  r61 fixtures dir (absolute).
- Scratch `/fast/scratch/hyaku/tabi-r61/R61MutC2` was removed before this report was
  finalized; the measured argv inside `harness.out.json` names those scratch paths, and
  `kills.json.*.reproduceArgv` gives the equivalent wave-dir paths (same shas).

## Commands and exit codes (all cwd = lane root)

Control (pristine copy):
`node <control> --selftest` → **0** (126/126);
`node <control> <fixture receipt> --driver <fixture driver> --expect-driver-sha256
b16ddb44…ff86 --shot <fixtures>/live --json` → **0**;
the same argv with `probe-f1…f5.receipt.json` → **1, 1, 1, 1, 1**.

Per mutant (same argv shape, counter path substituted):

| mutant | `--selftest` | matched probe | green fixture |
|---|---|---|---|
| C1' | 1 (124/126) | f1 → **0** | 0 |
| C2' | 1 (121/126) | f2 → **0** | 0 |
| C3' | 1 (124/126) | f3 → **0** | 0 |
| C4' | 1 (124/126) | f4 → **0** | 0 |
| C5' | 1 (122/126) | f5 → **0** | 0 |

Precision variants: `P-C2-narrow` f2 → **1**; `P-C3-typeonly` f3 → **1**;
`P-C5-additiveonly` f5 → **1**; each fixture → **0**.
Exact argv for every run is stored in `.ufo/waves/round-61/w1/R61MutC2/harness.out.json`
and `precision.json`.

## Deviations (explicit)

1. **Composed mutants.** C2' (4 sites), C3' (2), C5' (2) implement one semantic defect
   each; the frozen one-line wording cannot green the named probe with a single-site
   edit (measured: precision probes). C1'/C4' are single-site.
2. **`--shot` on probe runs.** Used `<fixtures>/live`; without it all probes carry 36
   `png-missing` findings (measured), making a kill impossible. The frozen live
   after-command passes `--shot`; DATA-PASS-RUNBOOK step 3c omits it (finding F4).
3. **Synthetic green baseline.** The green fixture receipt is Exec3's synthetic r61
   pointer receipt, not live browser evidence. Kills are detector-level contract kills;
   live pointer delivery/teardown is the data pass, not this seat.
4. **Measured argv vs staged paths.** Scratch paths in recorded argv were disposed;
   `reproduceArgv` supplies the staged equivalents and the replay was executed.
5. **Symlink in the wave dir.** `mutants/chromium-receipt-r61-fixtures` (and under
   `precision/`, `control/`) points at the lane fixtures dir so staged counters resolve
   `FIXTURES_DIR`.
6. **No browser, no loopback, no teardown proof** (not this item), no live receipt, no
   corpus writes, no commits/git-jj mutations, no pacman, no tool installs.
7. **Pin timing.** The counter was authored concurrently by R61Exec3; these verdicts are
   measured on the first stable authoring bytes `f615a2f9…` (Exec3's final report sha).
   If L1's instrument freeze changes the bytes, all verdicts must be re-measured on the
   frozen sha; the harness reproduces them.

## Defects found in the frozen claims / instruments

- **F1 (C2' wording).** "check only the first pointer entry" does not identify the
  defect that greens f2: the narrow loop-only edit leaves f2 red
  (`pointer-order-wrong` ×2). The frozen kill rule holds only for the composed reading.
- **F2 (C3' wording).** f3 deletes the pointerdown's `pointerId`; the counter refuses it
  twice (numeric-type rule + release-id equality). A type-only mutant leaves f3 red.
- **F3 (C5' wording).** f5 is refused twice (additive `pointer-nonce-wrong` + carried
  `plain-trace-wrong`). Removing only the additive check leaves f5 red — exactly the
  precision Exec3 disclosed before this seat ran.
- **F4 (probe invocation).** Probes must be scored with `--shot`; the data-pass runbook's
  step 3c omits it, and without it the probe set is unsatisfiable (36 `png-missing`).
  The frozen live command carries `--shot`, so the claim text is safe; the runbook step
  is not.
- **F5 (baseline provenance).** The green fixture is synthetic; no page-side live
  PointerEvent witness exists yet on the lane. The mutant kills therefore certify the
  counter contract, not the browser capability; the live after-state remains unmeasured.
- **F6 (probe purity).** f1–f4 mutate only `ptrlog`, never `mouselog`; this is coherent
  with the seq rule but means f2 leaves an unmatched `pointerup` that only the
  presence/count rules (and the composed C2') can see.

## Artifacts

`.ufo/waves/round-61/w1/R61MutC2/kills.json` (per-mutant ids, mutations, shas, selftest
failures with got/want, probe verdicts, fixture results, precision probes, instrument
findings, integrity/staged replay), `harness.out.json` (all runs, argv, exits, parsed
outputs), `harness.py`, `spec.json`, `build_kills.py`, `precision.json`,
`control/chromium-receipt-r61.mjs`, `mutants/C1p…C5p.mjs`,
`mutants/precision/P-*.mjs`. Seat report copy: `.ufo/waves/round-61/w1/R61MutC2/report.md`.

No lane source file, corpus file, SCORECARD/LOG/MANIFEST, state dir or sibling repo was
written by this seat.
