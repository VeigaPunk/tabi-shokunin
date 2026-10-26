# MutC2 — mutation probe: doc binding in `scripts/check-selfassessment.mjs`

- Seat: MutC2 (mutation-tester, leaf — no subagents dispatched, no `agent://all` messages).
- Item: mutation-test the doc binding at commit `97be89bc66139eb45526a04af59a35dccc006eb9`; run `--selftest` on each scratch copy; report killed/survived with killing case ids.
- Milestone: C2 (calibration).
- Script under test: `scripts/check-selfassessment.mjs` @ `97be89b`, sha256 `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` (matches the sha256 pinned in `.ufo/waves/round-29/claims.json` C2 predicate). Extracted with `git show 97be89b…:scripts/check-selfassessment.mjs`; the lane working-tree copy at probe time is byte-identical (same sha256).
- Detector (bounded, same for pristine/mutated): `TMPDIR=<scratch>/tmp node <copy>/check-selfassessment.mjs --selftest`; kill = `verdict=failed` (exit 3) or any case FAIL; survive = `verdict=clean cases=22 passed=22` exit 0.
- Node: v24.21.0. Tooling record: **no tools installed or upgraded** (operator authorization 2026-10-19 unused; pacman untouched).

## Baseline (pristine bytes)

```
$ TMPDIR=$S/tmp node $S/base/check-selfassessment.mjs --selftest ; echo exit=$?
SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22
exit=0        # all 22 CASE lines PASS
```

Baseline clean → all mutant verdicts below are valid kills/survivals (a baseline failure would have made them inconclusive). First baseline attempt failed only because the copy was named `*.pristine` (ESM `ERR_UNKNOWN_FILE_EXTENSION`); re-run after renaming to `.mjs` — no script content involved.

## Mutant table

Target function (pristine, lines 269–277):

```js
function citesLine(text, doc, line) {
  return [...text.matchAll(/\b(LOG|SCORECARD)\.md:(\d+)(?:-(\d+))?\b/g)]
    .some((match) => {
      if (`${match[1]}.md` !== doc) return false;
      const first = Number(match[2]);
      const last = Number(match[3] || match[2]);
      return first <= line && line <= last;
    });
}
```

| id | Mutation (exact diff vs pristine) | `--selftest` result | Verdict | Killing case id(s) |
|----|-----------------------------------|---------------------|---------|---------------------|
| m1 | drop document comparison: delete `if (\`${match[1]}.md\` !== doc) return false;` | `verdict=failed cases=22 passed=20`, exit 3 | **KILLED** | `m1-scorecard-crossdoc-citation-not-superseded` (expected exit 1, got 0), `m1-log-crossdoc-citation-not-superseded` (expected 1, got 0) |
| m2 | bind SCORECARD window to LOG.md: `citesLine(g.lineText \|\| "", "SCORECARD.md", f.line)` → `"LOG.md"` (line 239) | `verdict=failed cases=22 passed=20`, exit 3 | **KILLED** | `m1-stale-then-superseded` (expected exit 0, got 1), `m1-scorecard-crossdoc-citation-not-superseded` (expected 1, got 0) |
| m3 | bind LOG window to SCORECARD.md: `citesLine(text, "LOG.md", f.line)` → `"SCORECARD.md"` (line 332) | `verdict=failed cases=22 passed=20`, exit 3 | **KILLED** | `m1-log-stale-then-corrected` (expected exit 0, got 1), `m1-log-crossdoc-citation-not-superseded` (expected 1, got 0) |
| m4 | accept ranges reversed: `first <= line && line <= last` → `last <= line && line <= first` | `verdict=clean cases=22 passed=22`, exit 0 | **SURVIVED** | — (no killing case exists; see probe below) |
| m5a | off-by-one, upper end exclusive: `first <= line && line <= last` → `first <= line && line < last` | `verdict=failed cases=22 passed=20`, exit 3 | **KILLED** | `m1-stale-then-superseded`, `m1-log-stale-then-corrected` (single-line cites have first==last, so `line < last` drops them) |
| m5b | off-by-one on range ends only: `last = Number(match[3] \|\| match[2])` → `match[3] ? Number(match[3]) - 1 : Number(match[2])` | `verdict=clean cases=22 passed=22`, exit 0 | **SURVIVED** | — (no killing case exists; see probe below) |

Mutant file sha256s (scratch copies): m1 `bcbcf060…f50d337`, m2 `5ab78d72…bdb7313`, m3 `224f4ec8…051588`, m4 `598a0a37…86a0d4`, m5a `1aad57ea…200909`, m5b `cd20d52c…8fad20e` (full hashes in the command log below).

## Killing evidence (verbatim FAIL lines)

```
== m1: SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20
CASE id=m1-scorecard-crossdoc-citation-not-superseded expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
CASE id=m1-log-crossdoc-citation-not-superseded expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
== m2: SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20
CASE id=m1-stale-then-superseded expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
CASE id=m1-scorecard-crossdoc-citation-not-superseded expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
== m3: SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20
CASE id=m1-log-stale-then-corrected expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
CASE id=m1-log-crossdoc-citation-not-superseded expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
== m5a: SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20
CASE id=m1-stale-then-superseded expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
CASE id=m1-log-stale-then-corrected expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
```

Interpretation: the frozen suite pins (a) cross-document citations never clear (kills m1), (b) each window's own document name is load-bearing (kills m2, m3), and (c) single-line citations are inclusive at both ends (kills m5a). The doc-binding invariant claimed in C2 ("names the stale line's own document") is genuinely enforced by the self-test.

## Survivors — coverage finding

m4 and m5b survive because **all 22 self-test citations are single-line** (`SCORECARD.md:5`, `LOG.md:6`, `:999`); no case ever cites a multi-line containing range, so range order and range-end inclusivity are unpinned by the suite. Both survivors are real behavior changes, shown by a supplementary production-mode probe (outside the frozen suite, fixture repo in scratch, `--repo <fx> --rev HEAD --json`):

Fixture SCORECARD (committed, clean tree; gate `scripts/check-fixture.mjs` prints `cases=13`):

```
5: | C1 | `scripts/check-fixture.mjs` `--selftest` (12/12) | met |
6: | C2 | `scripts/check-fixture.mjs` `--selftest` (12/12) | met |
10: `scripts/check-fixture.mjs` `--selftest` (13/13) corrects the stale figures in `SCORECARD.md:5-6`.
```

| run | exit | mismatches | counted |
|-----|------|------------|---------|
| pristine | 0 | 0 | `[]` (superseded=2 — range `5-6` clears both stale lines) |
| m4 (reversed) | 1 | 2 | lines 5 and 6 (reversed range matches nothing) |
| m5b (range end −1) | 1 | 1 | line 6 only (the range's upper end escapes the −1 end) |

So a correction citing a containing range silently stops clearing under m4/m5b, and `--selftest` cannot see it. One added case would kill both: a variant of `m1-stale-then-superseded` whose correction cites `SCORECARD.md:5-6` (stale line at the range's upper end), expected exit 0. Reported as a coverage finding only — I did not modify the counter or the suite (attack seat: findings, never repairs).

## Commands run (with exit codes)

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 97be89bc…:scripts/check-selfassessment.mjs > scratch copy   # ok
sha256sum base copy                # 728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4 (== frozen)
TMPDIR=$S/tmp node $S/base/check-selfassessment.mjs --selftest ; echo exit=$?    # exit=0, verdict=clean cases=22 passed=22
for d in m1 m2 m3 m4 m5a m5b: TMPDIR=$S/tmp node $S/$d/check-selfassessment.mjs --selftest
  → m1 exit=3, m2 exit=3, m3 exit=3, m4 exit=0, m5a exit=3, m5b exit=0
git -C $D init/add/commit probe fixture; rev-parse --show-toplevel == $D verified before use
node $S/{base,m4,m5b}/check-selfassessment.mjs --repo $D --rev HEAD --json
  → base exit=0 mismatches=0; m4 exit=1 mismatches=2; m5b exit=1 mismatches=1
```

All git calls on the probe fixture named `-C "$D"`; toplevel verified before the first commit. No lane git index or jj state touched; read-only git in the lane (`show`, `status`, `rev-parse`, `ls-tree`).

## Restoration evidence

- Mutants live only in scratch copies; the lane file was never written.
- Lane `scripts/check-selfassessment.mjs` sha256 before == after == `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` (frozen bytes intact).
- `git status --porcelain=v1 | sort` snapshots before/after my probe window are byte-identical (diff empty; 6 pre-existing entries, owned by other seats/integrator — HEAD moved 190052c → 35045d7 during the window from concurrent integration, not from me).
- Pristine scratch copy re-hashed at end: still `72812800…560c4`.

## Cleanup

Scratch `/fast/scratch/hyaku/tabi-r29/MutC2` (fixtures, mutant copies, raw outputs) removed after this report was written; all receipts are inlined above. `/tmp` unused. No installs to record.
