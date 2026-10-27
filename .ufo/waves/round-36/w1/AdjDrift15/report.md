# AdjDrift15 — C1 drift-ledger re-derivation (tabi r36 aw1 w1)

Seat: executor, leaf, judged on adjacency (milestone C1). Task: independently re-derive the audit
status of the 20 ledger rows in `.ufo/waves/round-36/w1-chunks/AdjDrift15.tsv` **from git objects
only**, then compare with the committed ledger `corpus/adjacency-screen-drift.tsv`.

**Result: 20/20 rows agree. 0 mismatches.** No row in this chunk is mis-audited.

## Frozen inputs (read, never assumed)

| input | sha256 | note |
|---|---|---|
| `.ufo/waves/round-36/baseline/c1-delta-pins.json` | `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` | equals `claims.frozenDigests` entry for that path — the pins I used are the frozen ones |
| `.ufo/waves/round-36/claims.json` | `3c6fe2705d1062f6f6dfc9cdc521de2c64f02b1d493ac3026f3e8b6e60c09245` | C1 predicate + kill rule read |
| `.ufo/waves/round-36/w1-chunks/AdjDrift15.tsv` | `71b71ec5ff8356a76371b58d2e47ceb60574537098801af67d6ddf51496815f1` | 20 rows, worktree only (not committed at HEAD) |
| `corpus/adjacency-screen-drift.tsv` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | 307 data rows + header; committed at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`, worktree bytes == `git show HEAD:` bytes |
| `corpus/adjacency-screen-browser.tsv` | `f4fc43f0588dd0272dac5484f7c54f7056fefb0b2084d7e7454010f46d8cb3b8` | 383-row closed screen pool |

Lane HEAD at run time: `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (the freeze commit named by the wave).

## Method (matches the frozen counter, not my invention)

The derivation rule in `derive.py` is the same sentence as the frozen instrument
`.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs:399-414` (read before writing code, not after):

1. `git -C <lane>-shokunin show <pin>:<path>`, take line `<line>`, `.trim()` → **cited**.
   Pin file absent / pin line absent → `stale` / `stale: pin line absent`.
2. `git -C <lane>-shokunin show <H>:<path>` where `H` = `baseline/c1-delta-pins.json`[lane].
   Head file absent → `stale: head file absent`.
   - `head[line-1].trim() == cited` → `unchanged` (this test runs **first**, as in the counter).
   - else every head line whose `.trim() == cited` → `moved :N1,N2,…` (counter takes the first as `N`).
   - else → `stale`.
3. Compare with the ledger row found by exact `sibling_ref` (307 rows, no duplicate ref — checked).

`derive.py` is committed in this seat dir; `commands.txt` holds every command, `git-invocations.txt`
the 12 `git show` calls issued (pin/head blobs cached across rows).

## Per-row derivation

All 20 rows are in the `unchanged` class. `byte-equal` = the raw pin line and the raw head line are
identical bytes (not merely equal after trimming), so no whitespace-only drift is hiding behind the
trim. `dup` = how many head lines have the same trimmed text (1 ⇒ the `unchanged` verdict is
unambiguous; a duplicate elsewhere would have made a `moved` reading possible).

| sibling | line | cited sha256[:12] | len | pin line vs head line | dup | ledger |
|---|---|---|---|---|---|---|
| mado-shokunin (*theme-wallpaper-plane.md*) | 353 | `a1e6318a1389` | 68 | byte-equal | 1 | unchanged |
| mado-shokunin | 354 | `e19ce8d0506c` | 29 | byte-equal | 1 | unchanged |
| mado-shokunin | 377 | `608681040679` | 71 | byte-equal | 1 | unchanged |
| mado-shokunin | 378 | `2a147ce0e3f1` | 74 | byte-equal | 1 | unchanged |
| mori-shokunin (*observability-census-r1.md*) | 142 | `aa7646d7b41c` | 75 | byte-equal | 1 | unchanged |
| mori-shokunin | 145 | `0f824ad86ff4` | 82 | byte-equal | 1 | unchanged |
| tameshi-shokunin (*gates-survey-kagi.md*) | 287 | `8b925fc68cf0` | 74 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin (*SKILL.md*) | 2547 | `0ead0ecb3e3d` | 408 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin (*kill-event-deep-r8.md*) | 81 | `8236169da93a` | 82 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 140 | `c17b0dc014c6` | 71 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 148 | `a2b1e0c8cbb5` | 105 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 185 | `1e393100d65c` | 264 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 227 | `09e33520c3d9` | 107 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 236 | `48e75032e7de` | 104 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 260 | `d1a13e5d835e` | 486 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 294 | `38982c52cbcf` | 206 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin (*oom-event-plane.md*) | 62 | `c4b52784b8df` | 100 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 111 | `1b374f6927fe` | 57 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 116 | `b7cbcffa8b32` | 107 | byte-equal | 1 | unchanged |
| tsukuroi-shokunin | 118 | `ae181a87d4da` | 109 | byte-equal | 1 | unchanged |

Machine-readable: `receipt.tsv` (`sibling_ref \t my-status \t my-note \t ledger-status \t agree|MISMATCH`
+ summary line), `derivation.json` (cited text per row), `advisory.json`.

## Adjacency hardening (beyond the letter of the task)

1. **These are real drift rows, not idle rows.** Each chunk pin equals the frozen counter's own `PINS`
   table (`c1-adjacency-sweep-v4.mjs:94-115`) for its lane, and each frozen head differs from it, so
   all four lanes are in the counter's `drifted` set: pin → head commit counts
   mado 39, mori 46, tameshi 41, tsukuroi 55, with `merge-base --is-ancestor <pin> <H>` true for all
   four (`crosscheck.json`). tsukuroi `SKILL.md` grew 3,941 → 4,546 lines while line 2547 stayed
   byte-identical — a real drift surface where the cited line did not move.
2. **Pool membership.** All 20 chunk refs also occur as `sibling_ref` in the closed pool
   `corpus/adjacency-screen-browser.tsv` (20 in, 0 missing), so no row here is invented outside the
   screened pool.
3. **Second, independent route.** Re-derived via `git cat-file blob <rev>:<path>` instead of
   `git show` — 0 differences (`crosscheck.json`).
4. **Object-substitution hardening.** The counter runs with `GIT_NO_REPLACE_OBJECTS=1`; I checked
   `git replace -l` (empty) and `.git/info/grafts` (absent) for mado/mori/tameshi/tsukuroi/tabi, and
   re-ran the driver under `GIT_NO_REPLACE_OBJECTS=1` — `receipt.tsv` byte-identical.
5. **The instrument is not stuck on one answer.** A 7-row synthetic fixture
   (`selftest/build-fixture.sh`, `selftest/expected-statuses.tsv`) drives the *same* driver through
   `unchanged`, `moved :3`, `moved :4`, `stale` (cited text deleted), `stale: pin line absent`,
   `stale: head file absent`, and a **deliberately wrong** ledger row is reported `MISMATCH`
   (`doc.md:5`). Without this, "20/20 unchanged" would be indistinguishable from a collapsed
   comparator.

## Limits of this chunk (stated, not papered over)

- This chunk exercises only the real-data `unchanged` class. The claim's `moved` surface (the 3
  kaidoku rows, `SKILL.md` 585→748, 621→784, 652→815) and every `stale` disposition live in sibling
  chunks, so agreement here corroborates nothing about them.
- I verified ledger **status** against git objects at the frozen heads. I did not re-derive the
  `note` column semantics beyond noting that `unchanged` rows carry `-`, which the counter accepts
  (`c1-adjacency-sweep-v4.mjs:437-446` constrains notes only for `moved`).
- No counter run, build, lint or formatter was executed (seat rules: the parent owns the gate). The
  frozen counter's `drift.auditFindings`/predicate are therefore unobserved from this seat; what is
  observed is agreement of 20 independent derivations with the committed bytes.
- The pins file can only be as good as its freeze; I verified its digest equals the frozen digest in
  `claims.json`, which is the strongest check available to a leaf.

## Tooling

No installs or upgrades were needed or performed (python3 + git already present; nothing written to
any PATH directory). Scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift15/` was created for this
seat and removed before yielding; `TMPDIR` was pointed inside it explicitly. No mutating git command
was run in any lane repo; the only git writes were inside a throwaway fixture under my scratch root
(guard asserted `git rev-parse --show-toplevel` == fixture dir).

## Evidence index (all under `.ufo/waves/round-36/w1/AdjDrift15/`)

`receipt.tsv` · `derivation.json` · `advisory.json` · `crosscheck.json` · `commands.txt` ·
`git-invocations.txt` · `derive.py` · `selftest/{build-fixture.sh,receipt.tsv,expected-statuses.tsv,chunk.tsv,ledger.tsv,pins.json,git-invocations.txt}`

VERDICT ok 20/20 ledger rows re-derived from git objects at the frozen delta heads and all agree with the committed `corpus/adjacency-screen-drift.tsv` (all `unchanged`; 0 mismatches, 0 stale, 0 moved in this chunk); lanes verified genuinely drifted (pin → head 39/46/41/55 commits, pin is ancestor), refs 20/20 inside the closed pool, second-route `cat-file` derivation identical, replace-refs/grafts absent, and the comparator proven non-vacuous on a fixture covering every status class plus a caught wrong-status injection.
