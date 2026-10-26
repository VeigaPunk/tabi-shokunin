# RevUsedByChange — round-30 w2 falsification: the 23 in-place `used-by` changes (SOURCES.md)

## Verdict

I attacked the 23 in-place `used-by` changes in `corpus/SOURCES.md` between the claims freeze `061e62024c0523d3c6c7e819506a773ff2cd7d75` and tip `072af95fe2822f0785a6ff88a578e2142dd258e5`, cell by cell, against the logged old→new table in `corpus/lessons/round-30.md` §"`used-by` changes" and the frozen SOURCES contract rules. The mechanical claims **hold**: exactly 23 registry rows changed and each differs in the `used-by` cell only; every change is a pure append of `, corpus/knowledge/chromium-156-release-pin-recheck.md` (or `—` → the entry for the four dash rows); the lesson logs all 23 old→new values byte-exactly (modulo the lesson table's markdown backtick wrapping) with no extra and no missing rows; S116/S117/S118 are pure additions (zero deleted lines, added line equals the tip row; per commit: S116+S117 in 38891ca0, S118 alone in 072af95f as 1 insertion/0 deletions); S108–S115 already named the entry at baseline and were correctly left untouched. One **defect** found, severity **low**: the four rows whose `used-by` was `—` (S080, S081, S093, S098) keep `status` = `queued` after gaining a `used-by` path that names an admitted knowledge entry — by the frozen contract's own status vocabulary (`mined` = "cited by ≥1 path in `used-by`") they should read `mined`; rule 2 permits exactly that in-place status change logged old→new, and the corpus's round-16 precedent (S020) pairs the flip with the used-by append. No gate reads this state, so it is a silent registry inconsistency; it affects no counter this round.

## Evidence

All commands run read-only in the lane checkout (`git show`/`git diff`/`grep`/`awk` do not touch the lane index); analysis scripts and extracted copies live in scratch `/fast/scratch/hyaku/tabi-r30/RevUsedByChange/` and are copied to `.ufo/waves/round-30/w2/RevUsedByChange/` (sha256: SOURCES.old.md `ed29d04e…d85d`, SOURCES.new.md `6a228c79…9efa`, round-30.new.md `7c699e5d…8bf`).

1. `git --no-pager diff --stat 061e6202… 072af95f… -- corpus/SOURCES.md` → exit 0, "26 insertions(+), 23 deletions(-)" — i.e. 23 modified lines + 3 added lines, nothing removed.
2. `git show <rev>:corpus/SOURCES.md` for both revs → 178 lines old, 181 lines new (+3). `corpus/lessons/round-30.md` does not exist at the freeze (exit 128) — created this round, so the §used-by table is new-file content.
3. Cell-by-cell compare (`compare.py`, receipt in output dir): header `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |` (11 columns, no escaped `|` anywhere in the file — `grep -c '\\|'` = 0, so naive pipe split is sound). Result:
   - added ids: S116, S117, S118; removed ids: none.
   - changed rows: **23** — S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098 S099 S100 S105 S106; for every one the differing-cell list is exactly `[10]` (`used-by`). "rows differing in cells other than used-by: NONE".
   - every new value ends with the entry and is a pure append (`old + ", " + ENTRY`, or `—` → `ENTRY` exactly): "pure-append violations: NONE".
   - rows carrying the entry in `used-by` but unchanged: S108–S115 only — all eight already listed it at baseline (e.g. S108 old used-by `corpus/knowledge/chromium-156-release-pin-recheck.md`), so leaving them is correct, not an omission.
4. Lesson log exactness (`lesson_check2.py`): §"`used-by` changes" table (`corpus/lessons/round-30.md:75-104`) parses to 23 rows; set-equal to the 23 actually-changed ids; comparing `(old, new)` pairs after stripping the table's backtick wrapping → "byte-exact … mismatches: NONE". The section's prose ("cites 23 re-opened rows whose `used-by` omitted it", `:77`) matches the entry: `corpus/knowledge/chromium-156-release-pin-recheck.md:3` names exactly those 23 as "re-opened rows" plus S108–S115 (already back-pointed).
5. Pure additions: in the two-rev diff each of S116/S117/S118 has 0 minus-lines and 1 plus-line, and the plus-line equals the tip row byte-for-byte. Per commit: `git diff 061e6202… 38891ca0 --stat` → 25 insertions/23 deletions (23 used-by edits + S116 + S117, both `+| S11[67]` present); `git diff 38891ca0..072af95f --stat` → 1 insertion, 0 deletions (S118 only). New rows sit at the table tail in id order (…S113, S114, S115, S116, S117, S118) and all three are `status` `mined` with a `used-by` path whose target file names the row id back (S118: 1 hit in `webmcp-invocation-round-17.md`; S116/S117: 3 and 5 hits in their entries) — consistent with `check-sources.mjs`'s `used_by_uncited` direction.
6. The four dash rows at tip (`corpus/SOURCES.md`): S080 `:94`, S081 `:95`, S093 `:107`, S098 `:112` — `status` = `queued` (unchanged from baseline), `used-by` = `corpus/knowledge/chromium-156-release-pin-recheck.md`, `recheck` `on-release` (unchanged). The lesson logs no status change for any row (no `queued`/status edit appears in round-30.md), so nothing is unlogged — the status flip simply was not made.

## Finding

**Defect (low): `queued` rows now satisfy the contract's `mined` definition — missing status flip on S080/S081/S093/S098.**

- Rule: SOURCES contract v1 `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:36` and fleet `CORPUS.md:103-104` define `status` — `queued` (opened, worth mining) · **`mined` (cited by ≥1 path in `used-by`)** · `rejected`. Rule 2 (`CONTRACT:49-51`, `CORPUS.md:116-118`): only `status`, `recheck`, `used-by` change in place, each logged old→new.
- State at tip: four rows are cited by ≥1 path in `used-by` (an admitted knowledge entry, per round-29 verifier `corpus/lessons/round-29-verifier-spotcheck.md:113` "a new admitted entry") yet read `queued`. By the definition they are `mined`.
- Precedent: round-16 did exactly this pairing — `corpus/lessons/round-16-verifier-spotcheck.md:105`: "the only in-place change is the S020 `status` queued→mined and `used-by` —→note cells. CORPUS.md §SOURCES rule 2 permits these, and the lesson logs them old→new." The round-29 verifier's own health language also pairs them: "It cites S108–S115, all `mined`, and each of those rows lists the entry in `used-by`" (`round-29-verifier-spotcheck.md:113`).
- Not caught by any instrument: `scripts/check-sources.mjs` findings (`:60-64`) include `mined_without_used_by` (`:330-331`) but no queued-with-used-by finding; the census awk (`CORPUS.md:146-147`) only checks that *mined* rows' used-by paths exist. New QUALITY criterion 75 (`corpus/QUALITY.md:412-420`) codifies used-by reciprocity and is silent on status. So the inconsistency ships silently.
- Mitigation: the routed defect 1 prescription (`round-29-verifier-spotcheck.md:118`) named only the used-by append ("Rule 2 allows an in-place `used-by` change logged old→new; append the path and log the change"), and the implementers followed it literally; the reciprocity fix itself is complete and correctly logged. No counter this round reads these four rows' status (C1's counter reads no corpus file; C2's `r3-used-by` checks only the used-by direction). Fix is mechanical: flip the four status cells queued→mined and log old→new per rule 2 — attack seat does not repair.

## Residual notes (not defects)

- S094 is `rejected` with two `used-by` paths (`corpus/lessons/round-19.md` + the entry). The rejected-with-path state predates this round (present at the freeze); the round only appended the entry, which the entry's `source:` line justifies (S094 is in its re-opened list). A rejection is kept; the append does not un-reject it. Flagged for the record, out of this round's change set.
- No tool installs were needed (git, coreutils, kernel Python only); nothing to record under the tooling authorization.

## Commands and exit codes

```
git --no-pager diff --stat 061e6202… 072af95f… -- corpus/SOURCES.md          # exit 0, 26+/23-
git show 061e6202…:corpus/SOURCES.md > $S/SOURCES.old.md                     # exit 0
git show 072af95f…:corpus/SOURCES.md > $S/SOURCES.new.md                     # exit 0
git show 061e6202…:corpus/lessons/round-30.md                                # exit 128 (absent at freeze)
python compare.py / lesson_check.py / lesson_check2.py (kernel)              # exit 0 after one indexing fix
grep -c '\\|' SOURCES.new.md                                                 # 0
git --no-pager diff 38891ca0..072af95f --stat -- corpus/SOURCES.md           # exit 0, 1 insertion, 0 deletions
git --no-pager diff 061e6202… 38891ca0 -- corpus/SOURCES.md | grep -c '^+| S11[67] '  # 2
grep -n rows / awk status+used-by cells / sed QUALITY 405-420                 # exit 0
```

Gates were not run (leaf attack seat; measurement belongs to the main agent). Every claim above is from the diff-level reads cited.
