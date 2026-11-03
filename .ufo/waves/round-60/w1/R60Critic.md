# R60Critic: scoped falsification findings, round 60 wave w1

Table with per-item evidence: `.ufo/waves/round-60/w1/R60Critic/critique.md`.

## C1 (adjacency): survived

- The pre-data do-nothing control (scope=map) is red at the real snapshot: exit 1, predicate false, unscreenedMd 85,573.
- The wide run on the real snapshot is green: exit 0, predicate true, enumeratedMd 85,598 == screenedMd, unscreenedMd 0, rowMismatch 0, unresolvableHead 0, roster 20. My independent `git ls-tree` census over all 20 heads matches the per-lane counts.
- Blind-spot classes checked by fixture and by live census: symlink named .md (72 live, not followed), newline in path (3 live), non-ASCII path, invalid-UTF-8 blobs (3 live), LFS pointer (no live instance), worktree differs from head (M3). No FLAW.
- Notes: uppercase `.MD` is excluded by the frozen wording (no live instance). Submodule gitlinks: fixture NOT-RUN; live census shows 0.

## C2 (calibration): FLAWs found and closed across L1-adjudicated byte moves; final instrument b0d03fe0

- The pre-data control holds: the unmodified r59 counter is green on A and B (exit 0, findings []); forgedGreen 4.
- **At 99844dd9 (then-final):** three forged CapsLock probes outside F went green — `defaultPrevented` deleted on press1.keydownEntry, press2.keyupEntry, and letters1[0] each exited 0 with no findings. Cause: the shape check tested `defaultPrevented` only when present and `checkCapsTraceFlags` skipped slots without both flags as booleans. Under the frozen K1/K5 wording this met the kill condition at those bytes.
- **At 1408dd90:** Exec2 closed the P2 family (delivered shape now requires `defaultPrevented` present, boolean, false); my independent re-run confirmed the refusal.
- **P3/P3b** (top-level `keylog[0]`, key End) stayed green at 99844dd9/1408dd90. I ruled them outside C2's declared change set (scope NOTE); **the L1 overruled and ordered the narrow variant**. Refused at 0ed93c7a and b0d03fe0 (keylog-entry-mismatch).
- **Final instrument b0d03fe0 (FROZEN, selftest 110/110):** my independent re-run of all nine original probes refuses every one; four new boundary probes: letter-keyup `defaultPrevented` deletion refused (P7), CapsLock keyup `cancelable` deletion refused (P5), CapsLock keyup page-record falsification refused even when forged CONSISTENTLY on both records (P8), and the single GREEN: letter keyup page-record `cancelable:false` (P6) — the class Exec2 pins as `page-keyup-cancelable-false-admitted`, by the claim's keyup rule (keydown value is what the boundary binds). **Zero unpinned green forgeries known to this seat.** Repins: `cr1/repin-b0d03fe0.txt` (plus per-sha repins for the three earlier generations).

## CR3 (knowledge draft): SOUND on the residual

- `R60Scribe/knowledge-draft.md` §5 states the byte-perfect-replica residual as a residual, and §6 lists the limits. It does not claim a pass.
- Note: the draft omits the P2-family gap; after the 1408dd90 fix the gap is closed, so the draft needs no post-data edit for it.

## Proposed action for the L1 (not a critic decision)

- Resolved during the wave: the L1 ruled the P3/P3b narrow variant in scope; the instrument final is b0d03fe0 (selftest 110/110, frozen by L1). K5 residual, RULED by the L1 (option a): the keyup cancelable VALUE stays unbound by design (frozen keyup rule = presence + boolean type). A consistent-record keyup-value forgery is a NAMED RESIDUAL LIMIT, not a kill; no counter edit. Measured here: P8b (press1) and P8c (press2) consistent across all three recordings exit 0, findings []. Partial forgeries are refused by the untouched recording (P8, P6-style). My earlier "CapsLock keyups are value-bound" reading was wrong and is corrected. Remaining L1 items from this seat: `.MD` case-sensitivity and LFS-content scope notes (CR2.f/CR2.e).

## Verification state

- Ran: C1 wide and map on the real snapshot; r60 C2 on live receipt, A, B, D, E, and P1-P4, P2b, P2c, P3, P3b at ALL FOUR instrument shas (99844dd9, 1408dd90, 0ed93c7a, b0d03fe0); plus boundary probes P5-P9 at b0d03fe0; r59 control on A and B; fixture for C1 (9 enumerated, roster 1).
- Not run: submodule gitlink fixture (CR2.g).
- Scratch `/fast/scratch/hyaku/tabi-r60/R60Critic` removed after evidence copy.
- Tools touched: none installed. Used node (built-in), python3 stdlib, git (read-only plus fixture commits in a scratch repo). No new tools installed.
