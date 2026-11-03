# R61MutC2 — C2 r61 counter mutation probe (round 61, wave w1)

Seat: R61MutC2 (mutation-tester). Claim: **C2** — coverage capability
`chromium-pointer-event-domain-linux`. Milestone: r61 counter mutants C1'–C5'.
Authority: `.ufo/waves/round-61/claims.json` (read in full; never amended). Frozen
mutant list = `mutants.C2` (C1'–C5'); frozen forgery set `F = {f1,f2,f3,f4}`; f5 is the
auxiliary nonce-tamper probe named by the seat for C5'.

Axes named: **coverage** (assigned: detector-coverage evidence for the pointer domain),
**calibration** (forged-receipt refusal), **operability** (reproducible CLI on copies).
Each kill improves the detector-coverage evidence and leaves calibration intact (green
fixture still green, live-derived baseline untouched). No axis regressed.

## Instrument under test (final bytes, pinned)

The counter was authored concurrently and revised during the wave. A complete
measurement on the first stable bytes `f615a2f9…` (5/5 killed) was superseded when the
counter gained the r61-journey path; it is archived under
`R61MutC2/superseded-f615a2f9/` and is **not** the verdict. All verdicts below are
measured on the final authoring bytes that reach selftest 129/129:

| item | path | sha256 |
|---|---|---|
| r61 counter (final) | `.ufo/waves/round-61/counters/chromium-receipt-r61.mjs` (164935 B) | `97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625` |
| r60 base counter | `.ufo/waves/round-60/counters/chromium-receipt-r60.mjs` | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` |
| f-probes generator | `.ufo/waves/round-61/measure/f-probes-r61.py` | `53d5cb930f35fd5a1086c61164ae5a8dbf4d9323f5eed61269cad59efcc3f89e` |
| f-probes manifest | `.ufo/waves/round-61/measure/f-probes/manifest.json` | `ff50c56e93fa36ca9c89b7ae4ba8dc9a375ca2e9b378957169bdbe349aac9d3c` |
| green fixture receipt | `…/chromium-receipt-r61-fixtures/r61-base-receipt.json` | `7839c0a65ac4bea9fa328c5e4ade92645ebfd3810eb803b46bd50061df9f4f22` |
| fixture driver (r61 runner) | `scripts/chrome-cdp-loopback-round61.mjs` | `f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76` |
| fixtures dir (273 files) | `.ufo/waves/round-61/counters/chromium-receipt-r61-fixtures` | digest `2f55bb8546e28948b897873120ae45fb0f4e4c7dd15de3cfa5e89bc4dec1e61f` |

The green receipt is Exec2's **real runner smoke receipt** `smoke-r61b` sha
`7839c0a6…`, copied untransformed (manifest `source` and `sourceSha256` agree). Its
`teardown` records `survivors []`, `postKillSweepCount 0`, both ports closed and both
post-kill curls 7. It is, however, a smoke receipt; the committed corpus receipt and the
live data-pass closure remain the L1's obligation. This seat ran no browser.

Probes executed (manifest shas re-verified byte-for-byte):

| probe | sha256 | frozen F |
|---|---|---|
| f1 | `f52c48ad3a58e90af4dc93532a5cef57c90767019e283a8391a4299d0976d90f` | yes |
| f2 | `21da0f13aa635be97ea8824ec69b732eaffee284e5811873027e4d34e5a00c1f` | yes |
| f3 | `b5ca8b2a7053a0b7289f24ee382095ab828e4a6d77344adb53da8753aae20673` | yes |
| f4 | `bb9d1155b5ca1d80fe86388569bf5d766519b936fb5e5a2480427c1677b59118` | yes |
| f5 | `ce1fa45b7619aff6ecd3a7f3c72aff163f19a5889e36582aed0b32075157d62a` | no (C5' auxiliary) |

Harness pins: `harness.py` `34f494ade8d3310ccb4bfb4f14a19e33ea57ef46339ba05955d4ed234390b669`,
`spec.json` `a5d2c4e3501e7a8befe4b232caf3c9a978245f3fed6f3aa69bc8867db8029165`,
`build_kills.py` `7ba81a4fd0051680045696a33338319948c30075a3abb7f2aca0c619b7558b56`,
`kills.json` `ded2e61b862a6323816d5004f6b28ad5b507f4afa9a9381fe664f6c480d440c7`,
`harness.out.json` `725fbdb988217953521ff3d213c698fee3324bed41ef9ce2559a7a265b3c6d1b`,
`precision.json` `d4da71b9d3fb517ad5f23c15583aa5e3a4d911c559cff9b55d5e794b812330df`,
control copy `97f10e67…` (byte-identical to the counter).

## Method

Each mutant is a byte copy with one *semantic* defect applied as exact string
replacements (every target asserted to occur exactly once in the source). The counter
resolves `FIXTURES_DIR` as `dirname(SELF)/chromium-receipt-r61-fixtures`, and the r61
fixtures' driver is declared `../../../../../scripts/chrome-cdp-loopback-round61.mjs`;
the harness therefore lays each copy out as a lane-shaped root
(`<root>/.ufo/waves/round-61/counters/<counter>` + fixtures symlink +
`<root>/scripts/chrome-cdp-loopback-round61.mjs` symlink), so the relative driver path
resolves. Three runs per mutant, cwd = lane root:

1. `node <mutant> --selftest` — the kill must show as selftest failures (r60 discipline);
2. `node <mutant> <probe-fK> --driver scripts/chrome-cdp-loopback-round61.mjs
   --expect-driver-sha256 f33f0ab7… --shot <fixtures> <fixtures>/r61-a-pointer-press.png
   <fixtures>/r61-b-typed.png --json` — **KILL requires exit 0 here** where the pristine
   counter exits 1 (the r60 C6 pattern);
3. `node <mutant> <r61-base-receipt.json> …same args… --json` — the green fixture must
   stay green.

The two shot files are positional `shotFiles` overrides, exactly as `r61-green.shotFiles`
declares: the receipt names `a-pointer-press.png`/`b-typed.png`, while the fixture dir
stores `r61-*.png`. Without the overrides both the receipt and every probe carry 2
`png-missing` findings and no mutant could ever green a probe (measured).

## Control (pristine copy, `97f10e67…`)

| run | exit | result |
|---|---|---|
| `--selftest` | 0 | **129/129**, allPass true, finding-id coverage 68/68 |
| green fixture receipt | 0 | predicate true, findings `[]`, couldNotEvaluate `[]` |
| probe f1 | 1 | `pointer-type-wrong` ×3 |
| probe f2 | 1 | `pointer-order-wrong` ×2 |
| probe f3 | 1 | `pointer-id-wrong` ×1, `pointer-order-wrong` ×1 |
| probe f4 | 1 | `pointer-trust-wrong` ×1 |
| probe f5 | 1 | `pointer-nonce-wrong` ×1, `plain-trace-wrong` ×1, `nonce-not-invocation-bound` ×1 |

CONTROL-OK: baseline sound, mutant results interpretable.

## Verdicts — 5/5 KILLED, 0 SURVIVORS, 0 blocked

| mutant | mutant sha256 | sites / diff lines | selftest | matched probe (control → mutant) | fixture after | verdict |
|---|---|---|---|---|---|---|
| **C1'** drop pointerType check | `1c019f96361245582d295b31f303ed80e401d2b5af37ba7dc9f1b437a52a1a60` | 1 / 1 | 127/129 exit 1 | f1: exit 1 `[pointer-type-wrong×3]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C2'** check only the first pointer entry | `34f29a5806c8ea7d4cada802cdc5b7b7228562fe63ff3e3353a3fc3fa9f64e0a` | 4 / 8 | 123/129 exit 1 | f2: exit 1 `[pointer-order-wrong×2]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C3'** accept string/absent pointerId | `a79790245fa9c867c86c3caaf8f651c03fb86e64f7a0a0e03878f7f09a843f76` | 2 / 4 | 127/129 exit 1 | f3: exit 1 `[pointer-id-wrong, pointer-order-wrong]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C4'** drop isTrusted presence check | `9e7dabc2a85326c6c37a2d889dd0d00ed8260947e6f958b159e6c17d9c6b1a4c` | 1 / 1 | 127/129 exit 1 | f4: exit 1 `[pointer-trust-wrong]` → **exit 0 `[]`** | exit 0 | **KILLED** |
| **C5'** drop nonce binding | `96dcb93124aecc7b9f1a73d7f41741e85bb6a62af9f2c07d0233cf0198722b16` | 4 / 11 | 125/129 exit 1 | f5: exit 1 `[pointer-nonce-wrong, plain-trace-wrong, nonce-not-invocation-bound]` → **exit 0 `[]`** | exit 0 | **KILLED** |

### Selftest failures (kills are selftest failures, not only probe refusals)

- **C1'** — `r61-c1-pen-one-entry` (got `[]`, want `[pointer-type-wrong]`),
  `r61-f1-pointer-touch` (same).
- **C2'** — `r61-buttons`, `r61-c1-pen-one-entry`,
  `r61-c2-last-entry-type` (got `[pointer-order-wrong]`, want `[pointer-log-wrong, pointer-order-wrong]`),
  `r61-c3-string-pointerid` (got `[pointer-order-wrong]`, want `[pointer-id-wrong, pointer-order-wrong]`),
  `r61-f2-pointerdown-deleted` (got `[pointer-order-wrong]`, want `[pointer-log-wrong, pointer-order-wrong]`),
  `r61-f3-pointerid-deleted` (got `[pointer-order-wrong]`, want both).
- **C3'** — `r61-c3-string-pointerid`, `r61-f3-pointerid-deleted` (got `[]`, want
  `[pointer-id-wrong, pointer-order-wrong]`).
- **C4'** — `r61-c4-trust-false`, `r61-f4-trust-deleted` (got `[]`, want
  `[pointer-trust-wrong]`).
- **C5'** — `do-nothing-nonce-missing` (lost `plain-trace-wrong` from its want-set),
  `plain-trace-wrong` (got `[]`), `r61-c5-value-binding` (got `[]`, want
  `[pointer-nonce-wrong]`), `r61-f5-nonce-tamper` (got `[]`, want
  `[nonce-not-invocation-bound, plain-trace-wrong, pointer-nonce-wrong]`).

### Exact mutations applied (one semantic defect each; every source occurrence = 1)

- **C1'** — removed the per-entry rule
  `if (e.pointerType !== 'mouse') add('pointer-type-wrong', …)`.
- **C2'** — per-entry loop over `log.slice(0,1)`; missing-first-pointerdown rule
  `if (!firstDown || …)` → `if (firstDown && …)`; press/release count rule
  `if (downs.length === 0 || …)` → `if (downs.length > 0 && (…))`; pairing loop bounded to
  `Math.min(downs.length, 1)`.
- **C3'** — per-entry id rule refuses only a *present, non-string, non-numeric* id;
  release-id equality enforced only when both ids are numeric.
- **C4'** — removed the per-entry rule
  `if (!has(e, 'isTrusted') || e.isTrusted !== true) add('pointer-trust-wrong', …)`.
- **C5'** — removed the pointer-schema plainTrace rederivation (`pointer-nonce-wrong`);
  the carried plainTrace prefix comparison (its string-type rule stays); the r61-path
  exact-nonce-in-typed-trace rule (`nonce-not-invocation-bound`); and the r61-path
  `form61.valueAfterTyping !== nonceStr` rule (`pointer-nonce-wrong`). Four sites, one
  capability: typed field values are no longer bound to the receipt nonce.

## Precision probes — the frozen one-liners are under-specified (measured)

Narrow single-site readings do **not** satisfy the frozen detectors:

| variant | sha256 | probe | exit | findings |
|---|---|---|---|---|
| P-C2-narrow (loop over `ptrlog[0]` only) | `b74393c099880ab982f0c6b6e51819212976298e7e7436e6fdf5f78c1b6bcadc` | f2 | 1 | `pointer-order-wrong` ×2 |
| P-C3-typeonly (relax numeric id rule only) | `1fd873a8611148561bc65e22a152520e8334c128698d1d3f80746e7eeec72ccc` | f3 | 1 | `pointer-order-wrong` |
| P-C5-additiveonly (remove additive `pointer-nonce-wrong` only) | `2d3902f5996a253715d87aca891a1ec7bdc8a02ace9e3b636f5d6610a0dec96b` | f5 | 1 | `plain-trace-wrong`, `nonce-not-invocation-bound` |

Consequence: C2' must be read as the composed defect (first-entry-only *and*
missing-press tolerated *and* first-pairing-only); C3' must relax both the type rule and
the release-id equality; C5' must drop the carried prefix binding **and** the r61-path
typed-trace rules (three refusals on f5). This matches and extends Exec3's pre-disclosed
precision note (which covered the carried plain-trace rule; the r61-path rule appeared
with the later revision).

## Integrity / restoration

- The lane counter was never edited: sha256 `97f10e67…d233625` before and after the
  matrix (re-checked; mtime `2026-11-03 20:17:47 -0300`). The staged control copy is
  byte-identical.
- Every mutant is a copy; staged files re-hash to the recorded mutant sha. Diffs are
  recorded (`diffLines`/`diffHunks` per mutant).
- Staged replay from `replay-root/` (lane-shaped; hardlinked counters, fixtures and
  runner symlinked so the fixtures' `../../../../../scripts/` traversal resolves after
  scratch disposal): control selftest 0 / fixture 0; every mutant selftest 1, matched
  probe 0, fixture 0 — identical to the measured matrix.
- Scratch `/fast/scratch/hyaku/tabi-r61/R61MutC2` was removed before hand-off;
  `harness.out.json` retains the measured argv (scratch paths) and
  `kills.json.*.reproduceArgv` gives the replay-root equivalents (same shas).

## Commands and exit codes (cwd = lane root)

Control (pristine copy): `--selftest` → **0** (129/129); green fixture → **0**;
probes f1…f5 → **1, 1, 1, 1, 1** (findings as above).

| mutant | `--selftest` | matched probe | green fixture |
|---|---|---|---|
| C1' | 1 (127/129) | f1 → **0** | 0 |
| C2' | 1 (123/129) | f2 → **0** | 0 |
| C3' | 1 (127/129) | f3 → **0** | 0 |
| C4' | 1 (127/129) | f4 → **0** | 0 |
| C5' | 1 (125/129) | f5 → **0** | 0 |

Precision variants: f2/f3/f5 → **1** each; fixtures → **0** each.
Exact argv for every run is in `.ufo/waves/round-61/w1/R61MutC2/harness.out.json` and
`precision.json`.

## Deviations (explicit)

1. **Two instrument generations.** The counter changed twice mid-wave (f615a2f9 →
   ac5ce54b → 97f10e67) and gained the r61-journey path; f-probes and fixtures were
   regenerated at 20:18. The first complete matrix is archived as superseded and is not
   a verdict. Final verdicts are on `97f10e67…` (selftest 129/129). If L1 freezes other
   bytes, re-run via `build_kills.py`/`harness.py` (the fixtures or the source moving
   invalidates the pinned shas and is refused by the harness).
2. **Composed mutants.** C2' (4 sites), C3' (2), C5' (4) each implement one semantic
   defect; narrow one-site readings are measured separately and do not green the named
   probes. C1'/C4' are single-site.
3. **Probe invocation shape.** Probes are scored with `--shot <fixtures>` plus the two
   shotFiles positional overrides. Without them, 2 `png-missing` findings persist in
   control and mutant alike. The frozen live command uses evidence-dir PNGs whose names
   match the live receipt, so live scoring is unaffected; replays from `measure/` must
   pass the overrides.
4. **Baseline provenance.** Green baseline is Exec2's live runner smoke receipt
   (`smoke-r61b`, untransformed). Kills are detector-level on live-shaped smoke bytes;
   the committed corpus receipt and the live data-pass closure are not measured here.
5. **Measured argv vs staged paths.** Scratch paths in recorded argv were disposed;
   `reproduceArgv` supplies replay-root equivalents; replay was executed.
6. **Symlinks/hardlinks in the wave dir.** `mutants/chromium-receipt-r61-fixtures`,
   `mutants/precision/…`, `control/…` point at the lane fixtures dir; `replay-root/`
   uses hardlinks for the counters and symlinks for fixtures/scripts.
7. **No browser, no loopback, no teardown proof** (not this item), no live receipt, no
   corpus writes, no commits/git-jj mutations, no pacman, no tool installs.

## Defects found in the frozen claims / instruments

- **F1 (C2' wording).** "check only the first pointer entry" does not identify the defect
  that greens f2: the narrow loop-only edit leaves f2 red (`pointer-order-wrong` ×2).
  The frozen kill rule holds only for the composed reading.
- **F2 (C3' wording).** f3 is refused twice (numeric-type rule + release-id equality); a
  type-only mutant leaves f3 red. The kill requires both sites.
- **F3 (C5' wording).** f5 is refused three times on this generation (additive
  `pointer-nonce-wrong`, carried `plain-trace-wrong`, r61-path
  `nonce-not-invocation-bound`). A one-site mutant survives the probe; the kill requires
  four sites including the r61 `valueAfterTyping` equality.
- **F4 (probe invocation).** Scoring from `measure/` needs the shotFiles overrides; the
  data-pass runbook's step 3c omits them. Without overrides the probe set is
  unsatisfiable (2 `png-missing` in control and mutant). The frozen live command is
  unaffected (live PNG names match the live receipt).
- **F5 (baseline provenance).** The green fixture is a smoke receipt, not the committed
  corpus receipt; the live capability's data-pass evidence and closure proof remain
  unmeasured by this seat.
- **F6 (selftest-vs-probe shape divergence, f2).** The selftest case
  `r61-f2-pointerdown-deleted` derives its forgery with an array-key delete (a hole:
  `pointer-log-wrong` + `pointer-order-wrong`), while the frozen probe deletes the
  element (`pointer-order-wrong` ×2). Both are refused by the pristine counter, but they
  are different bytes; the C2' mutant greens the probe while the hole-shaped selftest
  case still fails. Do not conflate them.
- **F7 (probe purity).** f1–f4 edit only `ptrlog`; f5 edits only the last `plainTrace`
  valueAfter; none touch `mouselog` or `journey`. That is why the composed C2' can green
  f2 while the independent seq/journey rules stay satisfied.

## Artifacts

`.ufo/waves/round-61/w1/R61MutC2/kills.json` (per-mutant ids, mutations, shas, selftest
failures with got/want, probe verdicts, fixture results, precision probes, instrument
findings, integrity/staged replay), `harness.out.json`, `harness.py`, `spec.json`,
`build_kills.py`, `precision.json`, `control/`, `mutants/C1p…C5p.mjs`,
`mutants/precision/P-*.mjs`, `replay-root/`, and `superseded-f615a2f9/` (the earlier
generation's complete measurement, archived, not a verdict). Seat report copy:
`.ufo/waves/round-61/w1/R61MutC2/report.md`.

No lane source file, corpus file, SCORECARD/LOG/MANIFEST, state dir or sibling repo was
written by this seat.
