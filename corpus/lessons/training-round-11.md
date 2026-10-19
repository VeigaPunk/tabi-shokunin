# Training round 11 lessons — tabi-shokunin (2026-10-14; written 2026-10-19)

Training round 11 (fleet "training r10", the FINAL round; `SCORECARD.md:120-130`).
**Retroactive**: written 2026-10-19 in the kaika fleet round-1 continuation from
in-repo records only — no round-11-time scratch survives (`ls /tmp/w11-ver-b11-poll`
→ `No such file or directory`, exit 2). Records: `LOG.md:138-145`; `SCORECARD.md:117`
(move-log row 11); `corpus/knowledge/closeout-r11.md` (`2147f3ec2ff2…`/234);
`corpus/knowledge/archive-receipt-r10.md` §8; `plans/completion-evidence.md`;
`plans/round-11.plan.md` (`21317a8ad672…`/716); commit `c24eaea` (68 files,
+7,923/−31, `2026-10-14T19:49:31-03:00`). Axis move: **freshness**. `reports/` has
no round-11 audit; VER-B11 is scratch-only (Gate). Named `training-round-11.md`
because `round-11.md` collides with the gate-protected `corpus/lessons/round-N.md`.

## What landed

- `closeout-r11.md` (B11-1; `2147f3ec2ff2…`/234 + E1 `:228`): the arc, standing
  asks (L0 packet; daemon revival), ledger C1–C6 closed / O1–O16 open / R1–R3
  residue; admission **admitted** (`LOG.md:141`).
- `archive-receipt-r10.md` §8 (B11-3; `79255f1e03b8…`/424): 9 new groups / 52
  files / 390,702 B; tree 36→45 groups, 1,721→1,782 files, 10,318,947→10,720,052 B;
  A+B re-run 52/52 OK, 0 diff.
- `plans/completion-evidence.md` (PACK-B; `2b5552a72c58…`/348).
- `corpus/lessons/round-10.md` (one-wave-late carry; `7cfabfc9d525…`/293).
- `SKILL.md` §T1–T6 append (B11-4; `:1321-1460`), incl. §Pins re-bind `:1349-1395`.
- `LOG.md:138`, `SCORECARD.md:117`, commit `c24eaea`.
- `VER-B11`: scratch verdict only — `LOG.md:141` names
  `/tmp/w11-ver-b11-poll/VERDICT.md` (checks PASS: citations in-bounds, §5 pin
  table 28/28, negative sweeps, F1–F3 agree; F-v1–F-v4 kept). Dir gone;
  `corpus/evidence/w11-ver-b11-poll/` keeps 15 artifacts, no VERDICT
  (`ls | grep -c VERDICT` → 0). Recorded, not counted as landed.

## Method lessons

- **A time-gated clause is stamped, not failed; only a later-dated witness closes
  it.** clause (c) read **IN FORCE 3/4** (`LOG.md:139`; closeout `:128`); commit
  `c24eaea` predates the flip; closure came via `c5e25208` (`SCORECARD.md:177-192`)
  after round 11. Keep both states.
- **No AUD-B11 seat is observed; a check seat plus a scratch verifier do not
  replace it.** `LOG.md:138` lists seven seats, "(no AUD-B11 seat observed)";
  `reports/` has no r11 audit. Name the missing seat; never infer a silent pass.
- **The lesson lands one wave late or not at all.** round-10's landed inside
  `c24eaea`; round-11's stayed owed (O5, `closeout-r11.md:132`) until this retro
  file; reconstruction used records only — close record debt in-round.
- **An append moves the receipt's own sha; cite the revision.** §8 states
  pre-append `c6f4445ebd03…`/203 but the r11 revision is `79255f1e03b8…`/424
  (`LOG.md:140`). "The receipt says X" needs its revision stamp.
- **Counts move; negative sweeps are measurements.** 45 groups at r11 close, 64
  at base `40a6de87f`; VER-B11's archived `verify_closeout.sh` carries the absence rows — keep
  the commands and stamp read times.

## Gate

Retroactive read 2026-10-19, not a round-11-time gate; kaika worktree at base
`40a6de87f`; this file closes O5.

- Candidates: closeout (B11-1); receipt §8 (B11-3); PACK-B; `round-10.md`; SKILL
  T-append (B11-4); LOG/SCORECARD; commit `c24eaea`. Admitted at the time: all as
  committed, clause (c) 3/4, VER-B11 recorded from scratch (`LOG.md:141-142`).
- Rejected/deferred: VER-B11 as an artifact (scratch expired); the round-11
  lesson then (closed here); O1–O16 per closeout §3 (O1 closed 2026-10-15; O5
  here).
- Re-run / controls (lane root, 2026-10-19):

  ```sh
  sha256sum corpus/knowledge/closeout-r11.md        # 2147f3ec2ff2… == git show c24eaea:…
  sha256sum corpus/knowledge/archive-receipt-r10.md # 79255f1e03b8…
  sha256sum corpus/lessons/round-10.md              # 7cfabfc9d525…
  sha256sum plans/completion-evidence.md            # 2b5552a72c58…
  sha256sum corpus/knowledge/arc-synthesis.md       # f42428bd9af7…
  # nine w10-*/w11-* manifests → groups=9 OK=52 BAD=0
  git show -s --format='%cI' c24eaea                # 2026-10-14T19:49:31-03:00
  grep -n '^| 11 | freshness' SCORECARD.md          # 117
  git ls-tree --name-only 40a6de87f corpus/lessons/ | wc -l     # 26 at base (before this file and kaika-fleet-round-1.md)
  git ls-tree -d --name-only 40a6de87f corpus/evidence/ | wc -l # 64 at base; 45 at r11 close
  ls /tmp/w11-ver-b11-poll                          # No such file or directory
  ls corpus/evidence/w11-ver-b11-poll | grep -c VERDICT  # 0
  sha256sum /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md  # fleet root: b0ca610c…/51 at read; r11: 02c53ec6…/25
  ```
- Falsifier: a pin that does not re-derive; a failing manifest line; a
  "verified" with no surface; a same-day clause-(c) closure claim; a count
  without read time.
- Carried debt out: closeout §3 O1–O16 remainder, R1–R3 residue;
  `carried-debt-closure-r8.md:5` malformed pin (O13, still live).
