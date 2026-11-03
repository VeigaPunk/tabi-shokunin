# R59MutMeter — MUTATE-RUN-RESTORE on the v19 adjacency meter (round 59, C1)

- Seat: **R59MutMeter** (mutation-tester, leaf). Lane root
  `/home/vgpnk/Projects/shokunin/tabi-shokunin`, lane base revision
  `4e7fb89d7b71a6fdf661680891440be6577759e8`. Host: linux x64, node v24.21.0.
- Frozen authority: `.ufo/waves/round-59/claims.json` — C1 plus the pinned
  `mutantsC1` identities (M1…M6) and the pre-data `preDataCorrection`
  (counts roster 20 / deltaLanes 20 / bgScreenSiblings 20). Read before any
  run; not amended by this seat.
- Status: **complete. All six assigned mutants KILLED; no survivor.** Pristine
  baseline green (38/38 selftest, 5/5 fixtures); every mutant copy restored to
  the exact pristine bytes and re-measured green. No live data pass, no browser,
  no network, no git/jj mutation, no installs.

## Bytes probed

| file | sha256 | bytes |
|---|---|---|
| `.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` | 53 384 |

Existence/stability poll: the file did not exist while the poll loop ran from
17:57; the author seat landed it at 18:15. This seat's two sha checks were
taken at **18:25:54** and **18:26:54** (exactly 60 s apart) and were identical;
the canonical file was re-hashed after every mutant and again before this report
— always `0f956f86…`. The canonical instrument was **read and copied only**:
every mutant and fixture lived under
`/fast/scratch/hyaku/tabi-r59/R59MutMeter/`.

Baseline on the canonical bytes (independent of the authoring seat):
`node …c1-adjacency-host-v19.mjs --selftest` → **exit 0, `allPass true`,
38 cases / 38 pass**, schema `tabi-adjacency-host-v19-selftest`
(`mutant-meter/selftest-baseline.json`).

## Detectors (run on pristine, mutated and restored bytes)

1. **Declared detector:** `node <copy> --selftest` — the meter's own 38-case
   suite (the freeze pin; the L1's message said "≥ 34", the instrument carries
   38).
2. **Independent fixture probe:** `mutant-meter/fixture-probe.mjs`
   (sha256 `c0e9adf7943da92a8fe0f66f567a41d5245d2928d2fb535741f7fb48ee0fd43b`),
   imports the meter's exported `verify` and feeds five minimal hand-built
   inputs: F2 `map-ref-alpha-suffix`, F3 `bg-hit-unadjudicated`,
   F4 `orphan-line-row`, F5 `line-row-unscreened-file`,
   F6 `screen-vocabulary`. Pristine: **5/5, exit 0**
   (`probe-pristine.json`).

A mutant is KILLED only when a detector that is green on pristine (and green
again on the restored bytes) fails on the mutant. Verdicts below use both
detectors; M1 is harness-level and the fixture probe is not applicable to it
(it stays green, disclosed in the receipt).

## Verdicts

| id | single logic change | mutant sha256 | failing selftest cases | failing fixture | verdict |
|---|---|---|---|---|---|
| M1 | `caseOk` verdict drops the findings term: `return okPredicate && okCount;` | `8ee919f13023d24d1bb9f3333b095ac5271c07d51d99379a43e87fa90c801549` | `harness-guard-findings-predicate-match`, `harness-guard-findings-count-match` | — (N/A) | **KILLED** |
| M2 | `parseRef` replaced by a lenient parser accepting alpha/empty/signed/no-`@`/no-colon | `1f6e05c7d04ac28975c556d0284fdfe7577b034889f4f85f83295250d2320fad` | `map-ref-unparseable`, `map-ref-alpha-suffix`, `map-ref-empty-suffix`, `map-ref-signed-suffix`, `map-ref-no-at`, `map-ref-no-second-colon` | `F2-map-ref-alpha-suffix` | **KILLED** |
| M3 | `bg-hit-unadjudicated` emission deleted from the universal screen | `1be2db562306a9883b35d04b300056b2998571b0a15365a0b1ce800536a7ad21` | `bg-hit-unadjudicated-map-lane`, `kama-screen-weakening-observable` | `F3-bg-hit-unadjudicated`, `F6-screen-vocabulary` | **KILLED** |
| M4 | `orphan-line-row` guard deleted | `b2f37d918f622f6ee15f650096cdbad9f56942d6d06dc9dc340c711a406124a2` | `orphan-line-row` | `F4-orphan-line-row` | **KILLED** |
| M5 | stray-line-row relPath re-scoped to the lane's first lane-row path (lane-only) | `5fbf184c89930ab7fbff116980a1e133398df1435b1fcc45a80e62748722369c` | `line-row-unscreened-file` + 5 multi-file kama/kaidoku cases (disclosed below) | `F5-line-row-unscreened-file` | **KILLED** |
| M6 | `BG_WORDS` gutted to `['cdp','headless','screenshot']` | `bd02739adeab3b503fc3e18ba76c81cc25dfe5d2ecb8921efb58032f8bf83f50` | `kama-screen-weakening-observable` + 5 vocabulary-sensitive kama/kaidoku cases (disclosed) | `F6-screen-vocabulary` | **KILLED** |

Receipts: `mutant-meter/M1-kill.json` … `M6-kill.json` (schema per mutant,
required fields `mutant`, `mutantSha256`, `diff`, `selftestCases`,
`failedCaseIds`, `verdict`, plus baseline/mutant/restored outputs and restore
evidence). Unified diffs also land in `mutant-meter/runs/diff-M*.patch`.

## Observed outputs (actual, not paraphrased)

- **M1** — 36/38, `allPass false`. `harness-guard-findings-predicate-match`:
  predicate `false`, count 1, finding
  `harness-guard-findings: findings-mismatch + predicate-match returned true`;
  `harness-guard-findings-count-match`: same finding with `count-match`.
  `direct` is `false` in both (the `direct` term re-reads `caseOk` outside the
  verdict path). The older `harness-guard` case still **passes** under M1 —
  its three rows only test predicate/count mismatch, where the dropped
  findings term changes nothing.
- **M2** — 32/38. All six malformed-suffix cases fail: `map-ref-unparseable`
  emitted `audit-note-moved-line` + `audit-status-mismatch` for `…:12x`;
  `map-ref-alpha-suffix`/`empty`/`signed`/`no-at`/`no-second-colon` emitted
  `audit-missing` for the malformed ref instead of `map-ref-unparseable`
  (the lenient parser accepted each shape). Probe `F2` got `[audit-missing]`
  where pristine emits `[map-ref-unparseable]`.
- **M3** — 36/38. `bg-hit-unadjudicated-map-lane` and
  `kama-screen-weakening-observable` each emitted only
  `bg-screen-missing` (count 1 instead of the expected 2). Probe `F3` and
  `F6` got `[bg-screen-missing]` (the hit line went unadjudicated silently).
- **M4** — 37/38. `orphan-line-row` case emitted
  `line-row-unscreened-file: ghost-lane:PROVINCE.md:2` — the orphan is no
  longer classified as an orphan (count 1, wrong id). Probe `F4` got
  `[line-row-unscreened-file]`.
- **M5** — 32/38. `line-row-unscreened-file` case: predicate **true**, count
  **0** (the foreign `OTHER-UNSCREENED.md:2` row was validated against
  `PROVINCE.md:2` and accepted). Probe `F5` got `[]`. Extra disclosed
  failures (lane-only scope collapsing multi-file keying):
  `kama-invented-row` (+1 invented finding),
  `kama-quote-spliced` (+1 invented),
  `kama-head-citation` (+1 invented),
  `kama-mixed-forgery` (3 vs 2),
  `kaidoku-multi-file-keyed-green` (2 spurious invented findings).
- **M6** — 32/38. `kama-screen-weakening-observable` emitted only
  `bg-screen-missing` (count 1 vs 2); probe `F6` likewise. Extra disclosed
  failures from the gutted vocabulary: the kama/kaidoku lane rows claim
  `bgHits 1` while the gutted list derives 0, so five fixtures additionally
  fail via `lane-screen-hits-mismatch` (and the invented rows that follow).

## Restoration evidence

Every mutant copy was overwritten with the pristine bytes and re-run with both
detectors: **38/38 allPass true** and **5/5 allPass true**, sha equal to
`0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` for all six
copies. Each receipt records `restoration.equalsPristine true`,
`bytesRestoredFromCommitted true`, `repoBytesUntouched true`. The canonical
instrument's sha after the whole probe run is unchanged
(`0f956f86…`). Raw restored outputs: `mutant-meter/runs/*-restored.json`.

## Findings (disclosed, never smoothed)

1. **No survivor in the assigned set.** All six pinned identities are killed.
2. **The `direct` term is load-bearing for M1.** The observed run shows the
   older `harness-guard` case stays green under M1; only the two new
   `harness-guard-findings-*` cases fail, and only through their `direct`
   term. A future generation that drops `direct` (or folds it back into
   `caseOk`) would let a findings-term drop survive again — the N1 class is
   pinned only by that observable.
3. **M2 kills all six shapes because the mutant accepts all six.** The five
   new malformed-shape cases are not individually distinguished by this
   mutant. Under the r58 m4b weakening (`/^\d+/` only), alpha-only, empty,
   signed, no-`@` and no-colon refs still return `null`, so those five cases
   would still pass and only the digit-led `12x` case would fail. This is
   **[INFERENCE] from the code semantics; the r58-style weakening was not run
   here** (outside the assigned mutant set).
4. **M5's lane-only scope has a second, sharper detector:** the
   multi-file-green fixture (`kaidoku-multi-file-keyed-green`) goes red with
   spurious `delta-line-invented` findings. Disclosed as extra failures; the
   declared detector is `line-row-unscreened-file` / `F5`.
5. **M6's vocabulary gut trips `lane-screen-hits-mismatch` on five fixtures
   before the intended observable.** Disclosed as extra failures; the declared
   detector is `kama-screen-weakening-observable` (2 → 1) / `F6`.
6. **One mutant draft was invalid, not a survivor.** The first M5 draft
   dereferenced the lane's first lane row before the orphan guard and threw a
   `TypeError` on orphan rows (no JSON verdict). It was discarded; the recorded
   M5 (sha `5fbf184c…`) preserves the orphan guard order and a safe lookup.

## Commands run (all from the lane root unless noted; outcome)

| command | outcome |
|---|---|
| `sha256sum .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` (18:25:54, 18:26:54, post-run) | identical `0f956f86…` each time |
| `node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --selftest` | exit 0, 38/38, allPass true |
| `node fixture-probe.mjs v19.pristine.mjs` | exit 0, 5/5 |
| `node M{1..6}.mjs --selftest` (scratch copies) | exit 1 each; pass counts 36, 32, 36, 37, 32, 32 of 38 |
| `node fixture-probe.mjs M{1..6}.mjs` | exit 1 for M2–M6; exit 0 for M1 (harness-level, probe N/A) |
| `diff -u --label a/… --label b/… v19.pristine.mjs M{n}.mjs` | patches captured in `runs/diff-M*.patch` |
| `cp v19.pristine.mjs M{1..6}.mjs` then both detectors | exit 0, 38/38 and 5/5, sha == pristine |

No install/upgrade was needed; **tooling: none installed** (no pacman, no
`uv tool`, no network fetch). No browser was launched.

## Artifacts produced (all under the lane unless noted)

| artifact | sha256 |
|---|---|
| `mutant-meter/M1-kill.json` | `e6700bcbd5c063c252456e126e9cff851227dff657216cd5be497f59df8c481b` |
| `mutant-meter/M2-kill.json` | `91d038c303911b0438625648f5be39d053f0034f8d4b83c806ea8a9142dbcf0e` |
| `mutant-meter/M3-kill.json` | `6aedfb283e750d010a783ebe81cbe1e4e9a20c224813b9fc6ffb6b7f6ace2d4c` |
| `mutant-meter/M4-kill.json` | `eefb281af328e0b2f7469b031134d8c881ea1446506a36d0b17483dd312a565a` |
| `mutant-meter/M5-kill.json` | `4c21a77db90e4f95d8d156d2c7078c88f190c951781e8d6ea644b85f63bea6c7` |
| `mutant-meter/M6-kill.json` | `92d74aeada7fcc90fdf2708a8f4c8df0bb7d79228c4497d1890417ab7f51ae41` |
| `mutant-meter/fixture-probe.mjs` | `c0e9adf7943da92a8fe0f66f567a41d5245d2928d2fb535741f7fb48ee0fd43b` |
| `mutant-meter/selftest-baseline.json` | `7f4a1acd1f8a1aeb1a011bdb87a3313c7a9dc6d080964df82d38e70f7b11d336` |
| `mutant-meter/probe-pristine.json` | `d7e91c97d733a47135bcfdc846e6c0c028305602aaf320a857858804bfcb851f` |
| `mutant-meter/manifest.sha256` | `9c060f70cad87e5c3972f43069caa3edae652d2d5451fcbb1e816a5eb7ca84ee` |
| `mutant-meter/README.md` | `a850461bb158f41e66a63730f509b347aa48d24df78a0d6afccb556d1c861beb` |

`manifest.sha256` enumerates the **39** files present when it was generated
(the six receipts, the probe, the two baselines, and the 30 raw
mutant/restored captures and diffs under `runs/`). `README.md` was written
after the manifest and is listed above with its own sha256.

## Bounds observed

Writes confined to `.ufo/waves/round-59/mutant-meter/`, this report, and the
scratch root `/fast/scratch/hyaku/tabi-r59/R59MutMeter/` (deleted before
yield). No fleet-repo write, no sibling-lane write, no `corpus/`, no
`.ufo/state/`, no `MANIFEST.json`, no git/jj mutation anywhere, no browser, no
network fetch, no tool install.

Report: `.ufo/waves/round-59/w1/R59MutMeter.md`
