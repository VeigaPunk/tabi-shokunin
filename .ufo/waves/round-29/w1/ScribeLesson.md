# ScribeLesson — round-29 `## Mistakes` draft

Seat: `ScribeLesson-2`, leaf, milestone `lesson`. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane HEAD observed while drafting: `35045d7` (`round-29: LOG entry with doc-bound correction of LOG.md:221`),
round baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`, claims frozen at
`.ufo/waves/round-29/claims.json` (commit `97be89bc66139eb45526a04af59a35dccc006eb9`).
`git status --porcelain` at the lane tip: tracked-clean; the only untracked paths are
`.ufo/waves/round-29/w1*` (wave evidence), so every committed pointer below is the tip's bytes.

## Behavior (what I produced)

One artefact: the draft `## Mistakes` section for `corpus/lessons/round-29.md`, written to
`.ufo/waves/round-29/w1/build/lesson-mistakes.md` (225 lines, 17,596 bytes). It is a draft only —
`corpus/lessons/round-29.md` does not exist yet (`ls` → not found) and I did not create it.

Structure: an intro naming the mined sources, a 3-row table (class · mistake · captured-by), three
detail blocks (class, evidence with `path:line` pointers, captured-by, fix, able-to-fail, untested
shapes), two drafted criteria for the rows with `captured-by: none`, and a scope note.

| Row | Class (CORPUS.md §5 vocabulary) | Captured by | Drafted criterion |
|---|---|---|---|
| M1 — r28 landed a self-test that crashes (`existsSync` not imported) and never ran it | `landing` (+ `vacuous`) | none (nearest 37/6/27/69 unreachable) | **P-71** |
| M2 — r28 quoted census output that the command never prints | `reference-drift` (explicitly not `number-drift`) | none (nearest 26/61/28/34 insufficient) | **P-72** |
| M3 — r27 counter false-cleared `LOG.md:221` on an unbound citation | `vacuous` (+ `attribution`) | 65, reinforced by 70 | — |

Numbering note: `corpus/QUALITY.md` ends at criterion 70 (`:381`; file 384 lines), so 71/72 are the
next free ids; the draft says the integrator owns final numbering.

## QUALITY criteria checked

Grepped and read all of `corpus/QUALITY.md` (70 criteria) and extracted the criterion→line map used
in the draft. Numbers examined per row, with the disposition:

| Criterion (line) | Relevant to | Why it does / does not capture the row |
|---|---|---|
| 6 (`:10`) | M1 | Requires a self-test to assert each refusal's expected exit/finding pair; does not require the self-test to run |
| 26 (`:102`) | M2 | Binds a run claim (count/verdict/exit "at REV") to a committed receipt; a quote can satisfy this and still misquote the payload |
| 27 (`:107`) | M1 | Requires a probe to be described by the shapes it defeats; "added" ≠ "defeats" |
| 28 (`:112`) | M2 | Requires pointers to resolve as committed bytes; the report's own quote resolves to the report |
| 34 (`:143`) | M2 | Requires a prose count to carry its counting command; the command and the count were both correct |
| 37 (`:154`) | M1 | Requires a *self-test claim* to cite a receipt; r28 made no such claim (declared unrun), so it was avoided, not satisfied |
| 61 (`:309`) | M2 | Requires a round-evidence figure derived from receipts; the figure (16 W04) was right |
| 65 (`:343`) | M3 | The criterion that should have caught it: "cites the superseded mention" plus reporting superseded mentions; r27's matcher satisfied the words with `:<digits>` |
| 69 (`:374`) | M1 | Requires paired source/divergent controls and a full resolved revision; not an execution record |
| 70 (`:381`) | M3 | Sharpens 65 to "names the target document and line" + three red cases; the missing fourth case (cross-document) is the one r29 adds |

Also read for fit and rejected: 21, 22, 30, 35, 38, 39, 43, 63, 64, 66, 67, 68 (none compares a
quoted payload with a re-capture, and none requires an unclaimed instrument to execute at its
landing commit). Criterion 67 covers decoded `?format=TEXT` bytes, which is upstream of both rows
and already satisfied by r26's evidence.

## Gates (what I ran, and what I deliberately did not)

I ran **no** lane gate, counter or self-test — no `--selftest`, no `--rev`, no `scripts/*.mjs`
invocation. Every receipt cited is read as committed bytes; no claim in the draft rests on an
execution I performed, and the draft says so where it matters (e.g. the seat's inverse-mutant
receipt is labelled "uncommitted at draft time").

Commands run (all read-only; exit codes as observed):

| # | Command | Exit | Result used |
|---|---|---|---|
| 1 | `ls -la .ufo/waves/round-29/ .ufo/waves/round-29/baseline/ .ufo/waves/round-29/w1/` | 0 | baseline receipt inventory (21 files, all tracked) |
| 2 | `wc -l corpus/QUALITY.md corpus/CORPUS.md` | 1 | `QUALITY.md` 384 lines; `CORPUS.md` is **not** in `corpus/` — canonical copy at the fleet root `/home/vgpnk/Projects/shokunin/CORPUS.md` |
| 3 | `python3` over `MANIFEST.json` | 0 | tabi r26/r27/r28 closure notes (lines 22967 / 23280 / 23439) |
| 4 | `grep -n -i -E "vacuous\|survivor\|stale-premise\|…" CORPUS.md` | 0 | class vocabulary at `CORPUS.md:174-176` |
| 5 | `git show 856fa9e:scripts/check-s106-evidence.mjs \| grep -n existsSync` | 0 | one hit, `:267`; the `node:fs` import at `:37` lacks it |
| 6 | `git diff eb23c0b b4128c4 -- scripts/check-s106-evidence.mjs` | 0 | the r28 edit adds `+ if (existsSync(receiptPath)) {` and no import line |
| 7 | `git diff --stat b4128c4 856fa9e -- scripts/check-s106-evidence.mjs` | 0 | empty → the crashing bytes are r28's tip bytes |
| 8 | `git show HEAD:scripts/check-s106-evidence.mjs \| grep -n …` | 0 | landed repair: import `:38`, mismatch case `:193`, trailing `d.commit()` `:203`, field assertion `:311` |
| 9 | `grep -c existsSync corpus/lessons/round-28-verifier-spotcheck.md` | **1** | output `0` — the closure's static read never mentions the missing import |
| 10 | `python3` sha256 of report line 37 and capture line 4 | 0 | `03602872…a434` vs `4e778de4…fe7b`, `equal? False` (the stored red pair for P-72) |
| 11 | `python3` JSON decode of the baseline C2 receipts | 0 | frozen counter at baseline `mismatches=6 clean=false`; old-counter baseline `7`; junk controls `0` vs `6` |
| 12 | `python3 -m json.tool claims.json` (read) | 0 | the three predicates and their kill rules, used only as targets, never as evidence |
| 13 | `sed`/`awk` on `SCORECARD.md` / `LOG.md` | 0 | corrections block `SCORECARD.md:1458-1466`; `LOG.md:2007` |

One tool failure worth recording: my first decode of `baseline/c2-before-frozen-counter-cleanbase.json.txt`
raised `JSONDecodeError: Extra data` because the file carries an `exit=` trailer after the JSON; I
re-read it with `JSONDecoder().raw_decode` rather than treating that as a missing receipt.

Tooling: nothing installed or upgraded (no `uv tool`, `npx`, pacman or binary drop was needed).

## Touched surfaces

- Wrote `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/build/lesson-mistakes.md`
  (inside the wave dir I may write; untracked at write time).
- Created and removed scratch `/fast/scratch/hyaku/tabi-r29/ScribeLesson` (`TMPDIR` set for the one
  command that wrote nothing; post-check `[ -d "$S" ]` false).
- Read-only elsewhere: lane tracked bytes, baseline receipts, `corpus/evidence/round-29/`,
  `w1/build/c1/` (sibling seat output), fleet `MANIFEST.json` + `.ufo/reports/round-28/tabi.md`.
- Not touched: `corpus/lessons/round-29.md`, the lane git index, jj state, any sibling repo, any
  product script. No commit, no push, no subagent dispatch, no `agent://all`.

## Findings

1. **M1 has no capturing criterion (F1).** The r28 crash is not a broken claim, it is an unrun
   landed instrument: `ReferenceError: existsSync is not defined` at
   `scripts/check-s106-evidence.mjs:267` at `856fa9e` (`.ufo/waves/round-29/baseline/s106-selftest.txt`,
   exit 1, no tally), with the import missing at `:37`. Criterion 37 only bites a *self-test claim*,
   and the round avoided one by declaring the instrument unrun (`corpus/lessons/round-28.md:19`,
   `SKILL.md:2529`, `round-28-verifier-spotcheck.md:26`). The closure's own static read found the
   field inversion and the uncommitted-receipt bug (`round-28-verifier-spotcheck.md:28-29`) but not
   the import — `grep -c existsSync` on that file is 0 — so only execution could have caught it.
   Proposed P-71 puts "executes where it lands" into the bar.
2. **M2 has no capturing criterion either (F2).** The r28 census block prints
   `…/models/web_mcp/WebMCPModel.ts` (`shokunin@a7c6d0f1:.ufo/reports/round-28/tabi.md:37`, repeated
   `:58`) where the same command prints `…/panels/application/WebMCPView.ts` — the closure re-run
   (`round-28-verifier-spotcheck.md:16`), this round's capture
   (`.ufo/waves/round-29/baseline/census-start.txt:4`), and the registry row
   (`corpus/SOURCES.md:82`) all agree on View. Every count was right, so 26/61/34 pass; proposed P-72
   requires the quote to be a pointer to a committed capture compared byte-for-byte.
3. **M3 is captured, in writing, but was not enforced (F3).** Criterion 65 already required a
   supersession to "cite the superseded mention"; r27's counter satisfied it with any `:<digits>`
   and reported `mismatches=0 clean=true` while its own finding read claimed 8 / observed 12
   (`round-27-verifier-spotcheck.md:15`; `MANIFEST.json:23280`). r28 wrote 70 and still shipped a
   matcher that would let `SCORECARD.md:221` clear `LOG.md:221`
   (`round-28-verifier-spotcheck.md:39`) — so 70's own text was violated in the round that authored
   it. **Routed observation for main:** that is a distinct shape (a criterion authored alongside an
   implementation it contradicts, with no check in between) which my three assigned rows do not
   carry; it would need its own row and its own red state.
4. **The r29 C1 landing is the seat's exact bytes and is non-vacuous in both directions (F4).**
   `git show HEAD:scripts/check-s106-evidence.mjs | sha256sum` equals
   `sha256sum w1/build/c1/check-s106-evidence.mjs` → `1a01256e…5eb3`. Committed after-arms:
   `corpus/evidence/round-29/s106-selftest/selftest-l1.txt` (7/7, exit 0) and `mutation.txt`
   (mismatch case FAIL, `verdict=failed cases=7 passed=6`, exit 3). The inverse mutant
   (`w1/build/c1/positive-control-nonvacuous.txt`) turns the positive cases red, so the pair is not
   vacuously satisfiable.
5. **One after-arm is still uncommitted (F5).** `w1/build/c1/positive-control-nonvacuous.txt` and
   `w1/build/c1/selftest.txt` are seat output outside `corpus/evidence/`; the draft labels them
   "seat output, uncommitted at draft time" and does not lean on them for any pass claim. If the
   integrator wants an inverse-mutant arm in the criteria-27 description, it needs committing.
6. **Criterion numbering is free at 71 (F6).** `corpus/QUALITY.md` ends at criterion 70, line 381,
   file length 384 lines — verified by `wc -l` and by the criterion→line extraction.
7. **Pointer hygiene confirmed before writing (F7).** Every `path:line` in the draft was opened at
   the cited revision: `CORPUS.md:174-176`, `QUALITY.md:10/102/107/112/143/154/309/343/374/381`,
   `round-28.md:19`, `SKILL.md:2529`, `round-27-verifier-spotcheck.md:15`,
   `round-28-verifier-spotcheck.md:16/26/28-29/39`, `corpus/SOURCES.md:82`, `SCORECARD.md:1458-1466`,
   `LOG.md:2007`, `MANIFEST.json:22967/23280/23439`, plus the baseline receipt paths. Two cells use
   the fleet form `shokunin@a7c6d0f1:<path>` per criterion 28's sibling/fleet rule.

## Out of scope (not done, deliberately)

- C3 freshness (23 release-pinned rows, the release-pins counter, the S108–S115 supersessions) — not
  examined beyond reading its baseline receipts for the able-to-fail neighbourhood.
- Any axis verdict, score delta, wave accounting, or the round's own `## Gate` section.
- Running any counter/gate, and any repair of product code.
- The r28 wave-accounting defect (`round-28-verifier-spotcheck.md:16` defect a) — named in the
  draft's scope note and left to the gate section, because this seat has no r29 red state for it.
- `corpus/lessons/round-29.md` was not created: the assignment is the draft only.

## Artifact paths

- Draft: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/build/lesson-mistakes.md`
- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/ScribeLesson.md`
- Evidence read: `.ufo/waves/round-29/baseline/{s106-selftest.txt,c1-control-case-deletion.txt,c1-control-case-deletion.diff,census-start.txt,c2-before-frozen-counter-cleanbase.json.txt,c2-red-before-selftest.txt,c2-after-fix-selftest.txt,c2-control-crossdoc-oldcounter.json,c2-control-crossdoc-frozencounter.json,c3-selftest-frozen.txt,frozen-counter-sha256.txt,rev.txt,chromiumdash-stable-linux.json}`;
  `corpus/evidence/round-29/s106-selftest/{selftest-l1.txt,mutation.txt,mutation.diff}`;
  `w1/build/c1/{selftest.txt,mutation.txt,mutation.diff,positive-control-nonvacuous.txt,check-s106-evidence.mjs}`
  (seat output, uncommitted)
