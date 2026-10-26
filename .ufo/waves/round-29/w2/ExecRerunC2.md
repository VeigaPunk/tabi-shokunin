# ExecRerunC2 — C2 re-measurement at 32008a453737a27f69e9ab401d0b9775d2a944f7

Seat: attack/re-measure (w2, round 29, tabi lane). Scope: C2 calibration only. No lane file edited.
All measurements ran in scratch clones of the lane (`git clone --shared`), never in the lane checkout.

**Verdict: C2 predicate MET at the tip — `mismatches = 0`. Before-state reproduced exactly: 6, with the
same six ids. Two calibration caveats and one bookkeeping deviation are recorded below; none of them
changes the count, and none of them is repaired by me (attack seat).**

---

## 1. Counter identity (frozen before data)

| what | sha256 |
|---|---|
| `scripts/check-selfassessment.mjs` in my clean clone at 32008a45 (disk) | `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` |
| same path, blob at claims-freeze commit `97be89bc` | `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` |
| same path, blob at tip `32008a45` | `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` |
| same path, blob at baseline `856fa9e` | `9bc6feb7207b6a1a3861c0c8f2804d481351c8c8a08f90b45903692932054d3f` |

Equals the claims-frozen `72812800…` and is unchanged from the claims commit to the tip, so the after
measurement uses the frozen counter and the before measurement uses the same bytes copied outside the
baseline clone (baseline blob differs, as it must).

Clone hygiene: `rev-parse HEAD` = the named rev, `git status --porcelain --untracked-files=all` **empty**
in both clones before every run. `node v24.21.0`, `git 2.56.0`, `jq` = `jaq 3.1.1`. No tool installed
or upgraded this seat.

---

## 2. After — raw output at the tip

```
cd <clean clone of 32008a45> && node scripts/check-selfassessment.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --json
exit=0
{
  "rev": "32008a453737a27f69e9ab401d0b9775d2a944f7",
  "mismatches": 0,
  "counted": [],
  "superseded": 12,
  "couldNotEvaluate": 92,
  "clean": true,
  "findings": 120
}
```

Receipt: `tip-c2.json` (byte-identical to my re-run at the previous commit `35045d7d`, `at-35045d7d.json`,
apart from `.rev`; `at-35045d7d.json` is canonically identical to the committed
`.ufo/waves/round-29/w1/build/c2/c2-lane-tip.json`).

## 3. Before — raw output, frozen counter, `--repo` at baseline

```
cp <clone>/scripts/check-selfassessment.mjs  <scratch>/frozen/check-selfassessment.mjs   # 72812800…
node <scratch>/frozen/check-selfassessment.mjs --repo <clean clone of 856fa9e> --rev 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb --json
exit=1
{ "mismatches": 6, "superseded": 5, "couldNotEvaluate": 93, "clean": false,
  "counted": [
    {"doc":"SCORECARD.md","line":410, "claimed":25,"observed":26},
    {"doc":"SCORECARD.md","line":1138,"claimed":12,"observed":13},
    {"doc":"SCORECARD.md","line":1139,"claimed":12,"observed":13},
    {"doc":"SCORECARD.md","line":1151,"claimed":12,"observed":13},
    {"doc":"SCORECARD.md","line":1439,"claimed":17,"observed":20},
    {"doc":"LOG.md",      "line":221, "claimed":8, "observed":12} ] }
```

**6 confirmed**, exactly the six ids in the claim. Canonical JSON is identical to the committed
`.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt` (that receipt's only extra
trailing text is its `exit=1` line).

## 4. Six baseline findings + SCORECARD.md:1438 — exact superseding text

Oracle numbers were re-run by me at the tip, independent of the counter:
`check-sources --self-test` → `cases=26` exit 0; `round-evidence-audit --selftest` → `"cases": 13`
exit 0; `check-selfassessment --selftest` → `cases=22 passed=22` exit 0; `check-s106-evidence
--selftest` → `cases=7 passed=7` exit 0; `check-freshness --self-test` → `cases=12` exit 0.

| stale line / claim | superseding line (verbatim) | own doc? | number | tip state |
|---|---|---|---|---|
| `SCORECARD.md:410` 25 vs 26 | `SCORECARD.md:1463` — ``- `scripts/check-sources.mjs` `--selftest` (26/26): correction — supersedes the stale tally at `SCORECARD.md:410`.`` | yes (`SCORECARD.md` → `SCORECARD.md`) | 26 = oracle | superseded=true, obs 26 |
| `SCORECARD.md:1138` 12 vs 13 | `SCORECARD.md:1464` — ``- `scripts/round-evidence-audit.mjs` `--selftest` (13/13): correction — supersedes the stale tallies at `SCORECARD.md:1138-1139` and `SCORECARD.md:1151`.`` | yes | 13 = oracle | superseded=true, obs 13 |
| `SCORECARD.md:1139` 12 vs 13 | same line `SCORECARD.md:1464` (range `1138-1139` contains 1139) | yes | 13 | superseded=true, obs 13 |
| `SCORECARD.md:1151` 12 vs 13 | same line `SCORECARD.md:1464` (second citation) | yes | 13 | superseded=true, obs 13 |
| `SCORECARD.md:1439` 17 vs 22 | `SCORECARD.md:1465` — ``- `scripts/check-selfassessment.mjs` `--selftest` (22/22): correction — supersedes the stale tally at `SCORECARD.md:1439` (the doc-bound matcher added two cross-document cases this round).`` | yes | 22 = oracle | superseded=true, obs 22 |
| `SCORECARD.md:1438` 5 vs 7 | `SCORECARD.md:1466` — ``- `scripts/check-s106-evidence.mjs` `--selftest` (7/7): correction — supersedes the stale tally at `SCORECARD.md:1438` (its figure was the round-28 baseline count; at the round-28 tip the self-test crashed before printing a tally).`` | yes | 7 = oracle | superseded=true, obs 7 |
| `LOG.md:221` 8 vs 12 | `LOG.md:2007-2008` paragraph — ``Correction (supersedes LOG.md:221): `scripts/check-freshness.mjs` `--selftest` measured`` / `` `cases: 12` at the round-29 tip; the eight figure on that line predates four added cases.`` | yes (`LOG.md` → `LOG.md`, the one citation in the lane's LOG that is not self-document-mismatched) | 12 = oracle | superseded=true, obs 12 |

All seven stale lines are unmodified, append-only: their `lineText` at the tip is **identical** to
baseline's at the same line numbers (410/1138/1139/1151/1439/LOG:221 checked field-by-field), and the
SCORECARD block header states that intent (`SCORECARD.md:1458` ``## Round 29 — corrections (append-only;
each cites the stale line in its own document)``).

The 12 superseded rows at the tip = these 7 + 5 pre-existing (`LOG.md:335`, `:391`, `:1090`, `:1103`,
`:1664`).

## 5. Progression (frozen counter, `--rev` walk on the tip clone)

| rev | exit | mismatches | counted |
|---|---|---|---|
| `856fa9e` (baseline, separate clean clone) | 1 | 6 | 410, 1138, 1139, 1151, 1439 (17→20), LOG:221 |
| `190052c9` | 1 | 6 | same six; `1439` now 17→**22** (oracle script is the frozen counter) |
| `59e8167a` | 1 | 1 | `LOG.md:221` 8→12 |
| `35045d7d` | 0 | 0 | — |
| `32008a45` (tip) | 0 | 0 | — |

The zero is earned by exactly the two correction commits (`59e8167a` SCORECARD block, `35045d7d` LOG
paragraph) and survives the final commit.

**Integration check.** While I measured, the lane advanced to `e1e3a15f2db10c135739e0ee7e81ce63a02facf6`
("wave-1 evidence … lesson, QUALITY 71-73, README frontier"). That commit touches **no** `SCORECARD.md`,
`LOG.md` or `scripts/` path (`git diff --name-only 32008a45..e1e3a15 -- SCORECARD.md LOG.md scripts/`
is empty). Re-measured in a clean checkout of `e1e3a15` (porcelain empty, exit 0):
`mismatches=0, counted=[], superseded=12, couldNotEvaluate=92, clean=true`
(`at-e1e3a15-integrated-tip.json`). The C2 zero therefore also holds at the new lane tip, not just at the
named REV.

## 6. Attacks I ran against the claim

Fixture: `cp -a` of the tip clone at `$S/probe` (`rev-parse --show-toplevel` verified = probe), three
scratch commits, frozen counter run from outside the repo with `--repo`/`--rev`.

- **P1 own-document rule bites at the tip (not only in fixtures).** Re-pointed the LOG correction's
  citation `LOG.md:221` → `SCORECARD.md:221`: `exit=1, mismatches=1, counted=[LOG.md:221 8→12]`
  (`probe-P1-crossdoc.json`, `probe-f49b31e.diff`).
- **P3 containing-line requirement bites at the tip.** Re-pointed the 1439 correction to
  `SCORECARD.md:1440` (own document, adjacent line): `exit=1, mismatches=1,
  counted=[SCORECARD.md:1439 17→22]` (`probe-P3-wrongline.json`, `probe-3f70af1.diff`).
- **P2 range widening clears an arbitrary row — residual hole, confirmed empirically.** Planted a new
  stale row `` `scripts/check-sources.mjs` `--selftest` (25/25)`` plus a correction citing
  `SCORECARD.md:1-99999`: `exit=0, mismatches=0` (`probe-P2-widerange.json`, `probe-1cf7ad1.diff`).
  The frozen rule's own wording — "a line **or range** containing it" — permits this; a maximal range
  contains every stale SCORECARD line. **Not exercised at REV**: all seven real citations are exact
  (`:410`, `:1439`, `:1438`) or tight (`:1138-1139`, `:1151`, `LOG.md:221`), so the tip zero is not
  obtained by range widening.

## 7. Residual risks / caveats (reported, not repaired)

1. **Range-widening hole** (§6 P2): the counter cannot distinguish a precise citation from
   `SCORECARD.md:1-99999`. A future round can clear any SCORECARD stale tally without naming it.
2. **Plant-and-clear is undetectable.** Any stale tally authored and "corrected" inside one document is
   byte-indistinguishable from a genuine correction. No control in `claims.json` covers it; the frozen
   counter's 22-case self-test covers cross-document and wrong-number citations only.
3. **The zero covers 28 measured rows of 120 findings; 92 are could-not-evaluate.** Compared with
   baseline (23 measured, 93 CNE, 116 findings) there is **no displacement into CNE** — measured rose
   23→28 and no measured row regressed to CNE (row-by-row set diff). But the axis claim is only over the
   measured subset.
4. **The tip zero does not depend on this round's matcher hardening.** The pre-round counter
   (`9bc6feb…`) run at the tip produces a **byte-identical** receipt (`mismatches=0, superseded=12,
   CNE=92`; `tip-c2-oldcounter.json` has the same sha256 as `tip-c2.json`). The doc-bound rule is
   evidenced only through the baseline cross-document control and its two self-test cases
   (`m1-scorecard-crossdoc-citation-not-superseded`, `m1-log-crossdoc-citation-not-superseded`,
   `cases=22 passed=22` exit 0). Honest reading: corrections landed; the matcher change did not move
   the tip number.
5. **`SCORECARD.md:1438` is a seventh stale row that only exists because C1 landed.** At baseline it was
   could-not-evaluate (`self-test printed no tally`; the s106 self-test dies with
   `ReferenceError: existsSync is not defined` at `scripts/check-s106-evidence.mjs:267`,
   `baseline-s106-selftest.err`), so the claims' six-row "before" list is exact for the baseline.
   After C1's repair it became measurable and stale (5 vs 7) and is cleared by `SCORECARD.md:1466`.
   The claim's separability direction still holds (if C1 had not landed, the row stays CNE and C2 is
   unaffected), but the post-repair supersession surface is seven rows, not six.
6. **Bookkeeping deviation vs `claims.json.measurementRule`.** That rule names
   `.ufo/waves/round-29/measure/` for the committed after raw output; **no `measure/` directory exists**
   in the round. The after receipt is committed at `.ufo/waves/round-29/w1/build/c2/c2-lane-tip.json`
   (git-tracked) and is for `35045d7d`, not the final tip `32008a45`; my `tip-c2.json` is the tip-rev
   evidence (findings identical to `35045d7d` apart from `.rev`).
7. **`SCORECARD.md:1439` says "selftest baseline 17 cases"; the round-29 baseline counter has 20**
   (I ran `--selftest` at `856fa9e`: `cases=20 passed=20`). 17 is the round-28 baseline; the row is a
   round-28 row, so the word "baseline" is round-relative. The correction's 22 matches the frozen
   counter at tip. No count impact, flagging the ambiguity.
8. `SCORECARD.md:1438`'s "5 cases at baseline" matches the round-28 pre-implementation case count; the
   baseline script already declares 7 case ids (`grep -cE '^\s*id: "'` = 7 at both `856fa9e` and
   `32008a45`), consistent with the correction's "5 + 2 revision-binding cases, crashed at the tip".

## 8. Not run (honesty)

- I did not re-run the claims' baseline controls (`baseline/c2-control-crossdoc-frozencounter.json`,
  `baseline/c2-control-crossdoc-oldcounter.json`, `baseline/c2-red-before-selftest.txt`); I substituted
  fresh probes P1/P3 at the tip plus the frozen counter's own 22-case self-test.
- No build, lint, formatter, or other lane gate beyond the five self-tests quoted in §4 (all exit 0).

## 9. Receipts (this directory)

`commands.txt`, `SHASUMS.txt`, `tip-c2.json`, `tip-c2-oldcounter.json`, `baseline-c2-frozen.json`,
`at-190052c9.json`, `at-59e8167a.json`, `at-35045d7d.json`, `at-e1e3a15-integrated-tip.json`,
`probe-P1-crossdoc.json`, `probe-P2-widerange.json`, `probe-P3-wrongline.json`,
`probe-1cf7ad1.diff`, `probe-f49b31e.diff`, `probe-3f70af1.diff`, `baseline-s106-selftest.err`.

Scratch hygiene: clones and the probe copy live under `/fast/scratch/hyaku/tabi-r29/ExecRerunC2` and are
left in place for this wave only; nothing under /tmp; the lane checkout was never written and never used
for a measurement.

Process disclosure: the contract allows one live clone per seat; the item requires both a tip and a
baseline measurement, so I used two `git clone --shared` clones (tip, baseline) and a `cp -a` copy of
the tip clone for the probes — no third clone, and no probe commit anywhere outside `$S/probe`.
