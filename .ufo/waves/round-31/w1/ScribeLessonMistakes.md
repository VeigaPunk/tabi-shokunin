# ScribeLessonMistakes — round 31 w1, frontier step 2b.3 (`## Mistakes` mining)

**Verdict.** I drafted nine numbered mistake rows with one subsection each (§`mistakes.md`), each carrying class ·
evidence pointer · captured-by · fix and an explicit landed / partially landed / not landed marker. Two fixes are
landed and have red states I could check against committed receipts rather than re-running them — the v2 summary-line
oracle (round-30 M8) is proven able to fail by `baseline/m8-proof/old-oracle-selftest.txt` (`cases=29 passed=28`,
exit 3, only `v2-oracle-reads-summary-line-not-first-cases-token` FAIL), and the two new windows are red on the
pre-correction tree (`baseline/c2-J1-do-nothing.json`, `mismatches 9`, `exit=1`). Three things the candidate brief
took as given do not survive checking: the proof's own tally is **28 of 29**, not 28 of 30, because the probe also
deletes the case `v2-readme-no-section-fallback` (so the no-section-fallback association rule has **no** proven red
state); `baseline/README-receipts.md`'s m8-proof row states the wrong denominator ("28/30"); and the "mismatches 0"
sentence at `SCORECARD.md:1523` is still uncorrected at the freeze — `git grep -n 1523` over the four documents
returns nothing (exit 1). The sweep of round-30 w2 surfaced two defect families nobody has turned into a fix or a
criterion — the counter-observability gap M7 asked for (all ten round-31 freeze controls attack the work, none the
counter) and a real blind spot in the v2 window (`cli_cases=N` is invisible to the tally detector, so `SKILL.md:2474`'s
figure is never compared) — plus six frontier-pointer defects routed in round 30 and never corrected. No lanes edited,
no lane script run, no network fetch.

## Evidence — commands and exit codes

All of these ran read-only in the lane checkout (`git show`/`git grep`/`diff` over committed bytes). I created no
clone: I ran no lane script, so nothing needed a scratch working tree. Scratch receipts were staged under
`$HYAKU_SCRATCH/tabi-r31/ScribeLessonMistakes` and copied into the output dir before computing anything else.

| # | command (cwd = lane root) | exit | what it establishes |
|---|---|---|---|
| 1 | `git show 9505a10:scripts/check-selfassessment.mjs \| sha256sum` → `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce` | 0 | frozen counter bytes = `claims.json.frozenDigests` |
| 2 | `git show 9505a10:scripts/check-decision-table.mjs \| sha256sum` → `d15f3bd7…f6832`; same file at baseline `96a2d1a3` → `fatal: path … does not exist` | 0 / 128 | C1 counter frozen; it is new this round (absent at baseline) |
| 3 | `git show 96a2d1a3:scripts/check-selfassessment.mjs \| sha256sum` → `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` | 0 | the v2 bytes are not the baseline bytes (the freeze upgraded the counter) |
| 4 | `git show 96a2d1a3:scripts/check-selfassessment.mjs \| grep -n 'readBlob(repo, rev,'` → `:402` `SCORECARD.md`, `:405` `LOG.md` only; `grep -nE 'SKILL\.md\|corpus/README\.md'` → only fixture receipt commands `:606`, `:617` | 0 | the baseline instrument had no SKILL.md / corpus/README.md window — M2's premise, mechanically |
| 5 | `python3` over `baseline/c2-T0-reading.json` | 0 | `rev befe2a3f… mismatches 9 couldNotEvaluate 103`; the nine findings are exactly `SKILL.md:1614, 2479, 2514, 2515, 2529, 2530, 2543, 2544` and `corpus/README.md:613` (`receipts/t0-mismatch-set.txt`) |
| 6 | `for n in 1614 2479 …; do git show 9505a10:SKILL.md \| sed -n "${n}p"; done` and `git show 9505a10:corpus/README.md \| sed -n '613p'` | 0 | each cited line's bytes at the freeze (e.g. `:1614` "25 isolated CLI cases", `README:613` "`--selftest` cases=17") |
| 7 | `diff -u <frozen counter> baseline/m8-proof/old-oracle.mjs` | 1 | 6 hunks, 19 removed / 9 added lines: oracle reverted (`:173-175`), `lineOnly` plumbing removed (`:285-320`), case `v2-readme-no-section-fallback` deleted (`:723`), header 30→29 (`receipts/frozen-vs-old-oracle.diff`) |
| 8 | `tail -4 baseline/m8-proof/old-oracle-selftest.txt` | 0 | `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`, `exit=3`; the single FAIL line is the oracle case |
| 9 | `tail -3 baseline/c2-counter-selftest.txt` | 0 | frozen v2 self-test green: `cases=30 passed=30`, `exit=0` |
| 10 | `git grep -n "1523" 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md; echo exit=$?` | 1 | **zero** citations of `SCORECARD.md:1523` anywhere in the four documents — M3's fix is not landed (`receipts/freeze-1523.txt`) |
| 11 | `git grep -n "process.env" 9505a10 -- scripts/{check-selfassessment,check-gate-mutants,check-frontier-admission,check-release-pins,check-s106-evidence}.mjs` | 0 | `check-gate-mutants.mjs:152` and `check-selfassessment.mjs:167` still spread the parent env into the child; `:96`/`s106:63` pin only `GIT_CONFIG_*` (`receipts/env-forward-lines.txt`) |
| 12 | `git show 9505a10:scripts/check-gate-mutants.mjs \| sed -n '138,155p'` and `…check-frontier-admission.mjs \| sed -n '170,182p'` | 0 | run directory `join(work, runId)` at `:142`; `fetchLive` accepts `file://` (`:174`) and shells `curl -sS -L` with no `-q`/proto pin (`:175`) — the M5/M6 leaks are live in frozen bytes |
| 13 | `git show 9505a10:scripts/check-selfassessment.mjs \| sed -n '118,150p'` | 0 | `TALLY_PATTERNS[2] = /\bcases\s*=\s*(\d+)/` — no boundary inside `cli_cases=36`, so `SKILL.md:2474` is never seen (M7) |
| 14 | `git show 9505a10:scripts/check-aria-metadata.mjs \| grep -n cli_cases` | 0 | `:2320` refused path `verdict=blocked cli_cases=0`, `:2983-2986` clean path `verdict=clean cli_cases=36 helpers=4` |
| 15 | `git cat-file -t befe2a3f96f451e1fe797c3cab5f4c8dcf670f99` | **128** | `fatal: Not a valid commit name` — the T0 reading's revision is a scratch-clone commit, not a lane object; only tree `192b064…` (`git cat-file -t` → `tree`, exit 0) ties T0 to the freeze |
| 16 | `git show 9505a10:corpus/QUALITY.md \| grep -cE "^[0-9]+\. "` | 0 | 79 criteria at the freeze — the drafted criterion 80 (`ConnCounterLeaks.md:102-113`) is not landed |
| 17 | `grep -c '^| M[0-9]' mistakes.md` / `grep -c '^### M[0-9]' mistakes.md` | 0 | 9 / 9 — criterion 77's row/subsection equality holds in the draft |

Read, not run: `baseline/README-receipts.md`, `baseline/c1-counter-selftest.txt` (34/34), `baseline/c2-J1-do-nothing.json`
+ `.exit` (`exit=1`), `measure/noharm-at-0ffc6ea.txt:130` (3), `measure/noharm-at-d3cd62a.txt:1` (1),
`baseline/controls.sh` (T0 = scratch clone, fixture identity, `fresh()`/`commit()`), and the round-30 w2 reports
cited in the table (`ConnCounterLeaks`, `CritC1EnvLeak`, `CritC1CasesPinsA/B`, `CritC1CasesS106`, `CritC2Fabrication`,
`CritC2Surface`, `CritEntryPolicyFields`, `CritEntryDiscord`, `CritMistakes`, `MutC1Beyond`, `ConnFrontierConsistency`).

One external artifact was consumed read-only: `.ufo/waves/round-31/w1/ExecC2Oracle/oracle.tsv` (a sibling w1 seat's
probe, 17 gates) — cited for M7 and for the independent confirmation of M1's class at this round's tip
(`check-gate-mutants.mjs`: first `cases=`-shaped token 2, summary `cases=12`). It is not my measurement.

## Mistakes draft — what each row claims

| # | class | fix status | red state |
|---|---|---|---|
| M1 | `number-drift` | landed (v2 summary-line oracle + regression case) | `m8-proof/old-oracle-selftest.txt`: 28/29, exit 3, that case FAIL |
| M2 | `scope` | landed (SKILL.md + corpus/README.md windows) | T0 tree: 9 mismatches, exit 1 |
| M3 | `number-drift` | **not landed** (no `:1523` citation at the freeze) | the sentence at `SCORECARD.md:1523` |
| M4 | `vacuous` | partially landed (new counter hermetic; 3 carried; criterion 80 unlanded) | `live-offhost-redirect` case for the landed half; unbuilt for env/run-dir |
| M5 | `survivor` | not landed (carried `notClaimed` 1) | variant tables in `CritC1CasesPinsA/B`, `MutC1Beyond` |
| M6 | `attribution` | not landed (carried `notClaimed` 1) | refetch labels in `corpus/evidence/round-30/frontier/refetch/` |
| M7 | `scope` | not landed (found this round) | unbuilt — a stale `cli_cases` figure yields **no** finding today |
| M8 | `vacuous` | not landed (freeze passed) | unbuilt — no control in `claims.json` attacks a counter observable |
| M9 | `reference-drift` | not landed (six routed defects) | `corpus/README.md:37` "(C2–C6)" vs `:644` "C3 and C6" at the freeze |

## Findings the L1 must not lose

1. **The m8-proof denominator is wrong in two places.** `baseline/README-receipts.md` (m8-proof row) says "28/30";
   the receipt says `cases=29 passed=28`. Cause: the probe deletes `v2-readme-no-section-fallback` rather than
   failing it. Consequence: only the **oracle** clause is shown able to fail; the **no-section-fallback** rule
   (and, by extension, the `lineOnly` association the C2 claim leans on for registry/frontier sections) has no
   isolated red state. If the lesson cites the proof, cite it for the oracle only.
2. **M3 is still open at the freeze.** The routed defect's requested correction citing `SCORECARD.md:1523` does not
   exist; `git grep 1523` over the four documents is empty (exit 1). The freeze corrected `:1439`, `:1465`,
   `:1486`, `SKILL.md:2545` and nothing else, as `claims.json.freezeTimeCorrections` states.
3. **The T0 "before" readings are not reproducible from the lane repo.** `c2-T0-reading.json` and
   `c2-J1-do-nothing.json` name `befe2a3f…`, which `git cat-file` rejects (exit 128); it is a scratch-clone commit
   made by `controls.sh`. The number is legitimate (tree `192b064…` is in the lane, and `controls.sh` is
   committed), but any citation must say "re-run `controls.sh` on T0", not "`git show befe2a3f`".
4. **A v2 blind spot landed with the fix.** `SKILL.md:2474` states `(cli_cases=36, helpers=4)`; `TALLY_PATTERNS`
   cannot see `_cases=`, and no finding is emitted for the line — so a future drift there is invisible, and the
   oracle would report `could-not-evaluate` even if the detector were widened. Two independent probes (my
   `T0` extraction, `ExecC2Oracle/oracle.tsv`) agree.
5. **Round-30's M7 fix did not reach round-31's freeze.** All ten controls in `claims.json` attack the work; none
   attacks an observable of the counter (run directory, forwarded env, accepted URL schemes). That is the control
   class the round-30 lesson asked for, and it is the cheapest way to catch the M4/M6 leaks before a claim is frozen.
6. **Routed and never corrected:** the six `ConnFrontierConsistency` pointer defects. The freeze tree still reads
   "(C2–C6)" at `corpus/README.md:37` and "C3 and C6" at `:644`.

## Touched surfaces

- Written (only these): `.ufo/waves/round-31/w1/ScribeLessonMistakes.md` (this report),
  `.ufo/waves/round-31/w1/ScribeLessonMistakes/mistakes.md` (the draft),
  `.ufo/waves/round-31/w1/ScribeLessonMistakes/receipts/` (6 files: `t0-mismatch-set.txt`,
  `baseline-window-absence.txt`, `freeze-1523.txt`, `frozen-vs-old-oracle.diff`, `env-forward-lines.txt`,
  `oracle-coverage-rows.tsv`).
- Lane tracked files: none edited. Lane git index / jj state: untouched. No commits anywhere (no clone, no fixture
  repo). No lane script executed; no build, lint or formatter run (none exist in this lane for this purpose).
- Network: none. No credential, cookie or session material read.
- Tools installed/upgraded: none.

## Out of scope (deliberately not done)

- Writing `corpus/lessons/round-31.md` — the L1 integrates; I deliver the draft only.
- Repairing any defect: M3's correction, criterion 80, the counter v2 items, the frontier errata are all left as
  findings with their red states named.
- Re-measuring C1/C2: `--live` and the self-tests are other seats' work this wave; I quote committed receipts and
  say so each time.
- Deleting the stale sentences: the lane's rule is append-only, so the corrections must be appended at the end of
  each document (an insertion above a cited line shifts every later citation).

## Artifact paths

- Draft: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeLessonMistakes/mistakes.md`
- Receipts: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeLessonMistakes/receipts/`
- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeLessonMistakes.md`
- Scratch (deleted after the receipts were copied): `/fast/scratch/hyaku/tabi-r31/ScribeLessonMistakes/`
