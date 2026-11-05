# R65MutTester1 — survivors of the v22 delta-disposition-conflict pass

Target: `.ufo/waves/round-65/w1/R65Executor1/c1-adjacency-host-v22.mjs`, sha256
`5c16dfbcdba771eb61d279f7d8d5ceddd21ee55a34854073b5c8219e8991d1ec` (copied read-only to scratch at build time).
The pass is lines 178–186. Mutants touch only lines 179, 182 and 185 (one line each, asserted by the harness).
Checks per mutant: (a) v22 `--selftest` (46 cases); (b) forgery A `controls/c2-fixtures/delta-dup-contradiction.tsv`
and forgery B `round-62/w1/R62Reviewer/real-conflicting-delta.tsv`, must be refused with `delta-disposition-conflict`;
(c) positive `corpus/adjacency-host-delta-r62.tsv` at base, must be accepted.

Control (unmutated v22): selftest 46/46 green; A exit 1 with `kagi-shokunin:PROVINCE.md:41: no-tabi-ground vs contested-open`;
B exit 1 with `kaidoku-shokunin:PROVINCE.md:55: contested-open vs overlap-declared`; C exit 0.

## Survivors

### M8 — reverse the iteration (line 179): SURVIVED

Mutated line: `  for (const r of [...inputs.deltaRows].reverse()) {`
Checks: selftest 46/46 green; forgeries A and B still refused with the finding; positive C still accepted.

Why it survives: reversal keeps the pass refusing any key that carries two dispositions. Only the finding count
and the detail text change (which disposition is named "first"). No selftest case or real ledger asserts either.

Missing cases that kill it (both verified against the pure `verify()` core, see `kill-probe.mjs`):
- P1 `count-minority-first`: three line rows on one (lane, relPath, line) key, dispositions
  `contested-open`, `overlap-declared`, `overlap-declared`. v22 emits 2 `delta-disposition-conflict` findings; M8 emits 1.
  Case: `expect: 1, ids: ['delta-disposition-conflict'], assertFindingCount: 2`.
- P2 `detail-order`: two line rows on one key, `no-tabi-ground` then `contested-open`. v22 detail
  `lane-x:f.md:1: no-tabi-ground vs contested-open`; M8 detail `... contested-open vs no-tabi-ground`.
  Case asserting the exact detail string.

### M7 — swallow add() inside try (line 185): SURVIVED, EQUIVALENT (not a test gap)

Mutated line: `    if (first !== r[7]) try { add('delta-disposition-conflict', ...); } catch {}`
`add` is `(id, detail) => findings.push({ id, detail })`. `push` cannot throw, so the `try` is unreachable as a failure
path and no input distinguishes M7 from v22. Accepted as an equivalent mutant; it is not a kill target. Killing it would
require making `add` throw, which is a behaviour change outside this pass and is not recommended.

## Kill-by-one-check fragility (killed today, but by a single witness)

- M3 (key on lane+relPath, drop line; line 182): killed ONLY by the live positive ledger C (exit 1). The v22
  selftest stays green. Missing in-file case P3 `cross-line-same-file-green`: two line rows on one lane and one file,
  lines 1 and 2, dispositions `overlap-declared` and `contested-open`, expect 0 (v22 accepts; M3 refuses
  `f.md:2: overlap-declared vs contested-open`). Adding it makes the selftest the killer and no longer depends on live data.
- M5 (push on every duplicate; line 185): killed ONLY by the in-file selftest case
  `same-disposition-duplicate-accepted`. The positive ledger has zero same-key duplicates of any kind (`sameKeySameDispositionDupes: 0`),
  so C cannot kill it, and the forgeries are refused for their real conflict either way. If that selftest case were removed,
  M5 would survive. Keep it.

## Killed (robust)

- M1 (invert comparison, line 185): selftest `conflict-refused` and `same-disposition-duplicate-accepted` red; forgeries accepted.
- M2 (drop add(), line 185): selftest `conflict-refused` red; forgeries accepted.
- M4 (key on disposition only, line 182): selftest `conflict-refused` red; forgeries accepted.
- M6 (first key reused for every row, line 182): selftest 7 cases red; positive C refused.

## Observations for the L1

- Positive ledger `corpus/adjacency-host-delta-r62.tsv` has 0 same-key line conflicts and 0 same-key same-disposition duplicates,
  so the live positive control cannot exercise the duplicate logic at all. Only the in-file selftest does.
- Forgery A and forgery B each hold exactly one same-key conflict (see the control rows above). Both are refused by v22, so the
  claims-draft B drop condition does not trigger.
