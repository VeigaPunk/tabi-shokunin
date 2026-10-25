# W2Cheat — could this round be read as meeting C1/C2 without earning it?

**Verdict: C1's *number* is reproducible, C1's *mechanism claim* is not. C2 is met at HEAD with citation-level defects.**
Six classes from round-22 bytes reproduce on every revision I could execute (`6`, exit 1), round-21 yields only
`c3` (true positive), and both control arms are clean (`12/12`; `6/6` repairs, each exactly one class removed).
But `c4` and `c6` are decided by prose in a file outside the lane, and each has a one-phrase escape that the
round's own green mutants certify as a "repair". Lane HEAD moved under this review
(`a89f193` → `03c1b4d` → `dfae5cd` → `af00b59`); every claim below names the sha it read.
Bytes: worktree `e88a078e…c966be62`, HEAD blob `6eeaeda7…9870662`, receipt pin `325006d2…deb8e808`.

## Findings

1. **c6 clears on a phrase, and the shipped "repair" is prose-only.** `bindsElsewhere = /LOG entry lands in/i.test(row)`
   (`sed -n '470p' scripts/round-evidence-audit.mjs`). The green mutant pairs that sentence with `aaaaaaa`, a hash
   `filesOfCommit` returns null for, and `bbbbbbb` → `SCORECARD.md` (no LOG.md): `sed -n '646,660p' scripts/round-evidence-audit.mjs`.
   Nothing blocks: a row can name a commit that touches no `LOG.md` and clear the class by writing five words.
   Smallest correction: require the named section to exist in `LOG.md` **at a commit whose own file list contains
   `LOG.md`**; make the green mutant resolve both hashes.
2. **c4 accepts `silent` as a grade.** `gradedAttempts` accept-list is
   `progressing|silent|landed|graded|refused|stale|dead|complete|completed` (`:214`), and the green mutant writes
   "Attempt 2 — silent. Attempt 3 — landed." (`:620`). The round-22 routed defect *was* attempt 2 being silent;
   the class clears on the sentence that states the defect. Command: `sed -n '212,220p;610,621p' scripts/round-evidence-audit.mjs`.
3. **c4/c6 read an unpinned file in another repo.** Before the `--report` path guard, two false prose edits at a
   fixed `--rev` turned 6 classes into 4: `node <audit> --rev a89f193 --round 22 --round-cap 128 --report …/W2Cheat/report-phrases.md --json`
   (c4 wording + two `LOG entry lands in` insertions). The guard now restricts *path*, not *content*:
   `--report` is still the fleet's `round-22/tabi.md`, and only its sha is echoed (`reportSha256`), never bound to a
   fleet commit. Nothing blocks a lane author from editing that file in place.
4. **The producer is not in any commit.** `git show HEAD:scripts/round-evidence-audit.mjs | sha256sum` →
   `6eeaeda7…`; `sha256sum scripts/round-evidence-audit.mjs` → `e88a078e…`; the committed receipt pins
   `325006d2…` (`git show HEAD:corpus/evidence/round-23/c1-measurements.json`). The committed blob also refuses to
   run outside the lane root (`--root must be a git worktree top level`), so "measured at the checkpoint" is true of
   the argv, not of the bytes. Nothing blocks; correction: commit the producer and pin `scriptSha256` in the claim.
5. **C2's Gate command returns 0, and the Gate states 1.** `git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l`
   → `0`; `sed -n '24p;43p' corpus/lessons/round-23.md` shows the baseline rev under "Counting commands" and
   "C2: baseline 0 → 1" beneath it. The `1` is real (`… 03c1b4d -- corpus/knowledge | wc -l` → `1`) but is produced
   by no command in the block. Correction: print the checkpoint rev in the block, or label line 24 the before-arm.
6. **C2's counter is satisfiable by a header line alone.** Fixture under `.ufo/waves/round-23/scratch/W2Cheat/faketree/`:
   one knowledge file with `source: S102 …` and no SOURCES row → `git grep --no-index -lE '^source: S10[23] ' -- corpus/knowledge | wc -l` → `1`.
   `check-sources.mjs` validates row→citation only (`used_by_uncited` cases); no gate reads knowledge headers.
   Nothing blocks; the quote/row binding lives in Gate prose.
7. **The claim still says "committed wave bytes" for six classes, and it is false for three.** `c2` needs the fleet
   policy band + `--round-cap`; `c4`/`c6` need the fleet report; all are outside `--rev`. `revisions[1]` records the
   correction without editing `declared` (`node -e 'require("./.ufo/waves/round-23/claims.json").claims[0].declared'`).
   Disclosed, not blocked; `declared` alone misleads.
8. **S102's anchor disagrees three ways.** Row "lines 2815-2824", lesson "line 2815", entry "2815–2828";
   `sed -n '2815,2828p' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt` — the quoted paragraph ends at 2824, and 2825–2828 is an uncited paragraph.
9. **c6's second finding states the wrong reason.** Detail: "does not say where the entry lands", but the row *does*
   name `LOG.md` §Round22 landing (serial cohort). The real defect is stronger: that subsection exists nowhere
   (`git show a89f193:LOG.md | grep -cE 'serial cohort|item 1|item 3'` → `0`) and `be271a2` touches only
   `checks-final.json`. True positive, false explanation — fix the detail, keep the class.
10. **C2's "opened this round" is self-declared.** `opened` cells are prose, never compared to a fetch clock; committed
    scratch bytes do match both row digests (`062239…`, `6f32bf…`), so the chain holds while URL provenance does not.

## Cheats that are blocked (artifact or command that does it)

| Cheat | Blocked by |
|---|---|
| count read from the `classIds` constant | `findingClasses` is derived from findings; verified equal to the distinct set: `node -e '…r.findingClasses…'` |
| print-six unconditionally | `fixtures/skipwork-control.mjs` + `skipwork-receipt.json` (6 on a clean fixture → refused) |
| round-keyed fake (6 for 22, 0 elsewhere) | evidence-keyed matrix: each single repair must yield exactly 5 with its class absent — `--selftest --rev a89f193 --round 22 --round-cap 128` → `clean:true` |
| fixture that ships the answer | no expectations file is read; inputs are blobs + report + policy (`grep -n 'expectations\|knownDefects'` → none) |
| counter reads its own receipt | nothing under `.ufo/waves/round-23/` is opened (one comment); script writes only stdout |
| c3 by filename mention | hardened predicate needs `agree\|disagree\|result:\|verdict` on the spot-check line and excludes negation (`:204-207`); `red-filename-only.md` now fires |
| C2 paraphrase / nonexistent section / 28-word quote | E1/E2/E3 are true of the staged bytes; all 7 quoted spans are found (S103 needs tag-strip: `<strong>custom request header</strong>`) |
| duplicate source under a new id | `sources-census` W04 count unchanged (16); no prior `rfc6265`/`cheatsheetseries` row |
| id arithmetic (copy staged ids) | staged `S145/S146` are the same documents; staged `S102` is the Chromium README, a different document |

**Impacted axes:** operability (C1 mechanism, 1–4), calibration (C1 controls 7–9, C2 anchors 5, 8, 10),
coverage (C2 metric shape, 6). Depth, freshness and adjacency are untouched.
