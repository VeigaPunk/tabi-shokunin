# check-bidi-runtime self-test tally (27) — every stating line, and the drafted corrections

## Command (run from the lane root, at the read-only lane worktree; output saved verbatim to `grep-bidi-tally.txt` in this directory)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin && \
grep -nE "cases=27|passed=27|27/27|\(27\)" SKILL.md SCORECARD.md corpus/README.md LOG.md
```

exit 0. Three matches, one per file; `corpus/README.md` has none.

## The three lines

| file:line | tally as written | what the line is |
|---|---|---|
| `SKILL.md:2626` | `(cases=27, passed=27)` in the Self-test cell | the round-32 `bidi-runtime` gate registry row — the row this round's v2 row supersedes |
| `SCORECARD.md:1657` | `(27/27)` | the round-32 capability/measurement block's self-test line |
| `LOG.md:2154` | `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` | the round-32 entry's "Self-tests at the freeze" line |

## Files with no stating line

- `corpus/README.md` — zero. Two near misses, neither a tally: `corpus/README.md:659` reads "26 of the 27 catalogued
  faults", the `check-gate-mutants` fault catalogue for `check-s106-evidence.mjs` and `check-release-pins.mjs`;
  `corpus/README.md:716`'s "27" is inside the loopback address `127.0.0.1`. Command: `grep -nE "bidi" corpus/README.md
  | grep 27` → one match, the `127.0.0.1` row.
- Outside the four named documents: `grep -rnE "cases=27|passed=27|27/27" corpus/QUALITY.md corpus/SOURCES.md
  corpus/knowledge/*.md` → no match (exit 1, empty). Nothing else restates this gate's tally.

## Drafted correction lines (append-only; each cites the stale line in its own document)

Written in the round-32 correction style (`SCORECARD.md:1610` block; `SKILL.md` "Round 32 — corrections";
`LOG.md:2222` "Correction (supersedes … at `LOG.md:N`)" form). Every `<N>` is the round-33 measured tally read from the
gate's own summary line at the measured revision; the L1 fills it after the gate lands, and the same N goes into the
round-33 registry row's Self-test cell (the calibration counter treats the later statement of a gate's tally as the
current one, so a filled row with an unfilled correction would read as a mismatch).

- `SKILL.md` (in `skill-append.md`, final section):
  ``- `scripts/check-bidi-runtime.mjs` `--selftest` (<N>/<N>): correction — supersedes the stale tally at `SKILL.md:2626`. …``
- `SCORECARD.md` (`scorecard-append.md`):
  ``- `scripts/check-bidi-runtime.mjs` `--selftest` (<N>/<N>): correction — supersedes the stale tally at `SCORECARD.md:1657`. …``
- `LOG.md` (`log-append.md`):
  ``Correction (supersedes the round-32 freeze self-test tally at `LOG.md:2154`): …``

## Why `<N>` and not a number

No v2 gate exists at the revision I read (`e6b0a9074d434ccc307badd312ae7379d1193fea` still carries v1: `SKILL.md:2626`
is v1's row, and `scripts/check-bidi-runtime.mjs` is the v1 blob). A tally written now would be an unmeasured number,
so every tally slot stays `<N>`; the L1 fills it from `BIDI_RUNTIME_SELFTEST verdict=clean cases=<N> passed=<N>`.
The design intent is 27 v1 cases retained plus one case per frozen battery construction F1–F8 plus one per round-32
surviving mutant M04, M06, M09, M10, M11, M14, M17, M18, M19 (the wave-1 build assignment), which is a plan, not a
measurement — the correction text says so without asserting a total.
