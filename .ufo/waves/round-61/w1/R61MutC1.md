# R61MutC1 — C1 v20 adjacency meter mutation probe (M1–M5)

- Round 61, wave w1 (only wave), seat `R61MutC1` (mutation-tester), axis **adjacency**.
- Frozen authority read first and in full: `.ufo/waves/round-61/claims.json` (sha256
  `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e`); mutants = the frozen
  C1 list M1–M5; kill rule = the selftest reddens (≥1 case `ok=false`) or the moved-sibling /
  probe behavior breaks; SURVIVOR = mutant stays green.
- Evidence dir: `.ufo/waves/round-61/w1/R61MutC1/` — `kills.json`, per-mutant selftest captures,
  diffs, mutant sources.

## Target and pins

| object | sha256 |
|---|---|
| `.ufo/waves/round-61/counters/c1-adjacency-host-v20.mjs` (bytes tested; unchanged before **and** after) | `b76d972e47cbb32fc3e9fd21385aaa627aed223e8c54d50a9f55b817920cebc7` |
| `.ufo/waves/round-61/c1/snapshot-r61.tsv` at probe start (== freeze pin in claims.json / Exec1 pins) | `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` |
| same file at 20:11:12 (post-probe, header-only change; finding I6) | `c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c` |
| `.ufo/waves/round-61/claims.json` | `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e` |
| pristine scratch copy `/fast/scratch/hyaku/tabi-r61/R61MutC1/v20.mjs` (== committed bytes) | `b76d972e…` (identical) |

The sha matches `w1/R61Exec1/pins.json`. At probe time `counters/` was still untracked in git
(instrument-freeze commit not yet observed); the claims' `<pinned at instrument freeze>` placeholder
is therefore still open, by design (claims frozen before code). The target was byte-unstable while
R61Exec1 authored it (`9471026a…` → `b76d972e…` within 25 s); all runs below are against the stable
`b76d972e…`, confirmed unchanged over four 20 s polls.

Carried-case check (supporting K3/M5's premise): v19 = 38 cases, v20 = 42 cases, **0** carried
cases missing, exactly 4 new host cases: `moved-sibling-snapshot-green-with-drift`,
`missing-snapshot-exits-2`, `unresolvable-head-refused`, `r61-ledger-generation-mismatch`.

## Control (unmutated copy) — green, valid run

- `node /fast/scratch/hyaku/tabi-r61/R61MutC1/v20.mjs --selftest` → **exit 0**,
  `allPass true`, `cases 42`, `pass 42`, `failing []`. Capture:
  `w1/R61MutC1/control-selftest.json` (sha256 `fea89517ce38c8e449c5829e30132c21391e3f8d7ef33a0cd6acd69fd9eaba31`).
- Restored-bytes control after all mutants (same copy, same sha `b76d972e…`):
  **exit 0**, `allPass true`, 42/42. Capture: `control-after.json` (sha256 `0b03eb85…`).
  No start-up failure, so no mutant is inconclusive for a red control.

## Mutants (one semantic mutation each, on copies only)

Detector for all: `node <mutant> --selftest`. Full records in `kills.json`; raw captures `st-M*.stdout.json`.

| id | mutation (site) | mutant sha256 | exit | cases pass | failing case(s) | verdict |
|---|---|---|---|---|---|---|
| M1 | head source reverted to per-run `rev-parse HEAD` (runAt head source; v19 live-state behavior) | `eed573d4e8d8d022337b19541c5ddb504b32f4938a2bb53203c4d3f7cd728caa` | 1 | 40/42 | `moved-sibling-snapshot-green-with-drift`, `unresolvable-head-refused` | **KILLED** |
| M2 | drift disclosure dropped (`discloseDrift` returns `[]`) | `7e2783b3324502f888299eaaf14d9532a8edeb4b8e6f6e60750640c0ff586e6e` | 1 | 41/42 | `moved-sibling-snapshot-green-with-drift` | **KILLED** |
| M3 | missing `--snapshot` defaults to per-run heads (CLI guard replaced by live-head TSV fallback) | `4df198413f8ee1f3402925712816bcd016077fc7acd670de6540ccf56ab86583` | 1 | 41/42 | `missing-snapshot-exits-2` | **KILLED** |
| M4 | unresolvable snapshot head treated as zero files (cat-file check removed from `snapshotFindings`) | `5ecbefed0031d3af8c5028159e454b93b9d883ff41679aee6b0409c5073a752f` | 1 | 41/42 | `unresolvable-head-refused` | **KILLED** |
| M5 | P1 once-per-row audit binding dropped (last-wins map, no `audit-duplicate`) | `55ac4de467fce5e12e13f2f8a1ef475f6edc76a8056d6f7a095e60c7db5a4cd4` | 1 | 41/42 | `audit-duplicate` (carried v19 case) | **KILLED** |

### Measured evidence per kill

- **M1** — moved-sibling case: child exit 1, `predicate false`, `drift []` (0); findings
  `lane-screen-sha-mismatch`, `lane-screen-lines-mismatch`, `lane-screen-hits-mismatch`,
  `delta-line-missing`, `lane-screen-head-mismatch`. With the head source live, the fixture's
  recorded `oldHead` is discarded, so the delta row re-derives against the moved bytes and the
  case's `predicate true && drift>=1` both fail. Collateral: `unresolvable-head-refused` also
  reddens, because the live `rev-parse` replaces the recorded `000…0` head and no
  `unresolvable-head` finding is emitted.
- **M2** — child exit 0, `predicate true`, findings `[]`, `drift []` (0). This is exactly the
  r60-K7 silence the case exists to catch: only the `drift>=1` clause reddens it. Sharpest kill
  (1 failing case, 41 green).
- **M3** — child exit 1, not 2. The fallback live-head TSV is written
  (`m3-per-run-1479668.tsv`, content `lane/head` + `quiet-lane 4a1d22bf…`) and the run evaluates
  against live bytes (findings `lane-screen-sha-mismatch`, `lane-screen-lines-mismatch`,
  `lane-screen-hits-mismatch`, `delta-line-missing`, `lane-screen-head-mismatch`). The case asserts
  exit 2 and stderr naming `--snapshot`; status mismatch is the catch.
- **M4** — child exit 1, `predicate false`, findings `['lane-screen-sha-mismatch']` only,
  `drift` len 1. Status 1 matches, but the `unresolvable-head` id is absent — the case's id
  assertion is the catch (head treated as an absent file, never as refused).
- **M5** — core case `audit-duplicate`: findings `[]`, predicate true, findingCount 0. With the
  duplicate-binding check removed, two identical audit rows for `refA` no longer produce the
  `audit-duplicate` finding; the carried case's `ids: ['audit-duplicate']` reddens.

No SURVIVOR. No mutant crashed the harness (all emitted 42 case records; stderr empty), so every
red is an assertion failure, not an incidental throw.

## Findings (reported, not edited)

1. **I1 — instrument defect (reproduced): `--list-observed` is dead.**
   `v20 --list-observed` calls `headSnapshots(fleet, roster)` at line 358, but v20 deleted
   `headSnapshots()` (replaced by `readSnapshot`). Command:
   `node .ufo/waves/round-61/counters/c1-adjacency-host-v20.mjs --list-observed --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv`
   → **exit 1**, `ReferenceError: headSnapshots is not defined` (capture `list-observed2.err`).
   Without `--snapshot` the same subcommand exits 2 with `--snapshot <tsv> is required`
   (`list-observed.err`), although the usage line advertises `--list-observed --fleet <dir>`.
   Does not affect the frozen run path (the claim runs the meter with `--rev/--repo/--fleet/--snapshot`);
   it affects only the authoring aid.
2. **I2 — instrument quality: cross-seat scratch path.** `hostSelftest()` hardcodes
   `/fast/scratch/hyaku/tabi-r61/R61Exec1`, so every detector run (control and all five mutants)
   created and removed a `snapshot-fixture-*` dir under another seat's scratch path. No files of
   that seat were touched (its dir was empty at probe time); an `os.tmpdir()`/mktemp base would
   keep seat isolation.
3. **I3 — M1 is caught twice** (primary: moved-sibling; collateral: unresolvable-head). Not a
   defect; recorded so the kill is not double-counted as two independent coverage wins.
4. **I4 — M2 is the sharpest kill** and the load-bearing case for the r60 K7 remedy: the mutant is
   predicate-true and finding-free, distinguishable only by the drift clause.
5. **I5 — authoring-window instability / pin placeholder** (above): the file changed mid-authoring;
   the pins in `w1/R61Exec1/pins.json` match the probed bytes, and the claims' frozen pin remains
   a placeholder until the instrument-freeze commit. Not judged here.
6. **I6 — frozen-control byte drift (observed, not caused by this seat).**
   `.ufo/waves/round-61/c1/snapshot-r61.tsv` was `8b175b27…` (the claims' freeze pin) at probe
   start and is `c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c` at
   mtime 2026-11-03 20:11:12 (1153 → 1157 bytes). The sole textual change is the header cell
   `lane<TAB>` → `lane<TAB>head`; all 20 lane rows are byte-identical (verified by prefix diff and
   a full row dump). `readSnapshot` accepts both spellings, so no probe here is affected, but a
   FROZEN control's bytes no longer match its freeze pin and no amendment is permitted by the
   freeze rule. This seat only read the file (`sha256sum`, `--list-observed`).

## Deviations (explicit)

- M1 was implemented at `runAt()`'s head-source line rather than inside `readSnapshot()`, because
  `readSnapshot(file)` has no `fleet` argument; the semantics are exactly the frozen mutation
  (every sibling byte read at a per-run `rev-parse HEAD`, live state) and nothing else changed.
- Mutants were generated as full copies via exact-string replacement (single occurrence asserted per
  patch); the committed instrument was read/copied only, never written. `kills.json` carries the
  patch (site + old/new) and each diff (`diff-M*.txt`, hashes in `kills.json`).
- Only `--selftest` (plus the `--list-observed` defect probe) was run; the live data pass is not
  this seat's item.
- Scratch `/fast/scratch/hyaku/tabi-r61/R61MutC1` removed after receipt copy; mutant sources and
  captures preserved under `w1/R61MutC1/`.
- No git/jj mutation run anywhere; lane git reads were read-only (`status`, `log`, `rev-parse`,
  `sha256sum` is not git). No pacman, no tool installs.

## Command log (exit codes)

| command | exit |
|---|---|
| `sha256sum …/c1-adjacency-host-v20.mjs` (stability polls, 4×20 s identical) | 0 |
| `cp …/v20.mjs /fast/scratch/…/R61MutC1/v20.mjs && sha256sum` (matches committed) | 0 |
| `node /fast/…/R61MutC1/v20.mjs --selftest` (control) | 0 (42/42) |
| `python3 mutate.py` (apply M1–M5 to copies + run each selftest) | 0 (driver) |
| `node /fast/…/R61MutC1/v20-M1.mjs --selftest` | 1 (40/42) |
| `node /fast/…/R61MutC1/v20-M2.mjs --selftest` | 1 (41/42) |
| `node /fast/…/R61MutC1/v20-M3.mjs --selftest` | 1 (41/42) |
| `node /fast/…/R61MutC1/v20-M4.mjs --selftest` | 1 (41/42) |
| `node /fast/…/R61MutC1/v20-M5.mjs --selftest` | 1 (41/42) |
| `node /fast/…/R61MutC1/v20.mjs --selftest` (after; restored bytes) | 0 (42/42) |
| `node …/c1-adjacency-host-v20.mjs --list-observed --fleet /home/vgpnk/Projects/shokunin` | 2 |
| `node …/c1-adjacency-host-v20.mjs --list-observed --fleet … --snapshot …` | 1 (ReferenceError) |
| `sha256sum` committed instrument after all runs | 0 (unchanged `b76d972e…`) |

## Artifact pins (this seat's evidence)

| artifact | sha256 |
|---|---|
| `w1/R61MutC1/kills.json` | `7a7ace6996e726c0612a9f102010ade95b124b5e6318e2c087e2e5bf3c7042d9` |
| `w1/R61MutC1/control-selftest.json` | `fea89517ce38c8e449c5829e30132c21391e3f8d7ef33a0cd6acd69fd9eaba31` |
| `w1/R61MutC1/control-after.json` | `0b03eb853fc5a1b9fa2c11fb2c9924118b96ce404687b433c07fe07ab2ab94c5` |
| `w1/R61MutC1/st-M1.stdout.json` | `e1d6b7d7940f614113784d8e9526a710047ed78199b0eebfdaa15828fe3ab23b` |
| `w1/R61MutC1/st-M2.stdout.json` | `35d20c1937016bee1ac1bb0afd0893ca6321dbac4e25541865b9dd212a8baf3d` |
| `w1/R61MutC1/st-M3.stdout.json` | `2690a1c728fefe5aae747ba96616936d0d3891d8d23a9de330e80c4241b11947` |
| `w1/R61MutC1/st-M4.stdout.json` | `2ff2a5a698d4dd24ce46521f628e5cf07263038814d059cf00114ecd605d2629` |
| `w1/R61MutC1/st-M5.stdout.json` | `91be4bf2952238cab0052334ca0f010b17f5ce47fb1be92a4ea69bc8d71397f2` |
| `w1/R61MutC1/diff-M1..M5.txt` | `041d0239…`, `2ab86a57…`, `57db1f23…`, `814197b3…`, `da3b8756…` (full in `kills.json`) |
| `w1/R61MutC1/list-observed2.err` (I1 repro) | `538e668bdfcab10fda4eb7e8a9bb7c398373e826484a17d1d859f877afacc371` |
| `w1/R61MutC1/v20-M{1..5}.mjs` | `eed573d4…`, `7e2783b3…`, `4df19841…`, `5ecbefed…`, `55ac4de4…` (as in mutant table) |

## Verdict

All five frozen C1 mutants **KILLED**. Control green before and after on identical bytes; the
committed instrument was never modified. Survivors: none. The killed-case map matches the frozen
mutant predictions one-for-one (M1/M2 → moved-sibling drift case, M3 → missing-snapshot-2,
M4 → unresolvable-head-refused, M5 → carried `audit-duplicate`).
