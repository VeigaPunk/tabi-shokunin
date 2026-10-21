# ScribeLogCorrection — C3 d1 LOG round-19 correction draft

Seat: `TabiR19-2.ScribeLogCorrection-4` (scribe, leaf). Baseline B = `66251bfc1aef393e4aec599e950a8deb867736bb`
(lane `refs/heads/master`, equal to B). No file in LANE was changed; `LOG.md` is untouched (append-only,
L1 lands the bullet).

## Verified facts (observed at B, `git show B:<path>`)

- `LOG.md:1059` (round-18 entry) reads verbatim: `- QUALITY33–38 arise from the lesson's mistake rows. README indexes corrections/new notes.`
- `corpus/QUALITY.md` numbered criteria 33–39 start at line 140 (`33.`) and end at line 165 (`39.`).
  Line 139 is the last line of criterion 32 (`corpus/lessons/round-17.md#mistakes; round16 outside routed 5)`).
  The assigned span `139-165` therefore includes one line of criterion 32; the draft uses `140-165`. L1 may revert to `139-165` verbatim if preferred.
- All seven criteria 33–39 cite `corpus/lessons/round-18.md#mistakes` (lines 142, 145, 149, 153, 156, 159, 164).
- `LOG.md:1078` (round-18 entry) records `QUALITY39 adds retained-body binding`, so the old `33–38` range
  omitted criterion 39, which is also a round-18 mistake-row criterion.
- Counting command at B, run by this seat: result **7**.
- Discriminator: the same command with upper bound 38 returns **6**; with 39 returns **7**. The counter
  separates the old wrong range from the corrected one.

## Counting command (re-derives 7 at B)

    git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 66251bfc1aef393e4aec599e950a8deb867736bb:corpus/QUALITY.md | awk '/^[0-9]+\. /{if(cur>=33&&cur<=39&&hit)n++; cur=$1+0; hit=0} /round-18\.md/{hit=1} END{if(cur>=33&&cur<=39&&hit)n++; print n}'

Expected output: `7`.

## Draft LOG.md bullet (round-19 entry, append-only; paste at the end of the round-19 section)

- C3 d1 correction (round 19): supersedes the round-18 entry's `LOG.md:1059` clause "QUALITY33–38 arise from the lesson's mistake rows" (line 1059 is not rewritten). Corrected: QUALITY 33–39 (seven criteria, corpus/QUALITY.md:140-165), all citing `corpus/lessons/round-18.md#mistakes`; criterion 39 (response-body digest, recorded at `LOG.md:1078`) was omitted from the old range. Counted at 66251bfc1aef393e4aec599e950a8deb867736bb: `git show 66251bfc1aef393e4aec599e950a8deb867736bb:corpus/QUALITY.md | awk '/^[0-9]+\. /{if(cur>=33&&cur<=39&&hit)n++; cur=$1+0; hit=0} /round-18\.md/{hit=1} END{if(cur>=33&&cur<=39&&hit)n++; print n}'` → 7 (the bound-38 variant → 6).

## Tools

None installed or updated. No subagents spawned.

## Isolation

- Clone: none (no production file; this report is the seat-owned report path under `.ufo/waves/round-19/w1/`).
- Branch: none.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit: none.
- Changed paths: `.ufo/waves/round-19/w1/ScribeLogCorrection.md` (this report only).
