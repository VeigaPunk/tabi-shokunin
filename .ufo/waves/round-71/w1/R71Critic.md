FALSIFIED

# R71Critic — frozen-claim attack (C1, C2)

Full detail, receipts and reproductions: `.ufo/waves/round-71/w1/R71Critic/report.md` and
`w1/R71Critic/receipts/`.

## C1 `C1-SYNTHPINCH` — **falsified** (predicate leg (b))

- Independent seat R71Exec1's cold run of the pinned driver (nonce `tabi-r71-exec1-7f6bc402`):
  driver exit 0, 14.381 s, 575 events, predicate true, hypothesis CONFIRMED — but the pinned
  counter exits 1 with the single finding `event-leg-domain` (`w1/R71Exec1/counter.json`; my
  re-run gives the same). Stray event: seq 575, leg `end`, zero-delta ctrl wheel of the runaway
  `scaleFactor:0` gesture, labelled after `__setLeg("end")` (driver `:330`), read at `:331`;
  counter `:100`. Kill rule 3 fires; the lane's "honest stop on leg b" (SCORECARD.md:3678,:3691)
  is correct. No predicate amendment; r72 fixes the driver's read/relabel ordering with N≥5
  pre-freeze repetitions.
- Novelty holds: no prior pinch note/receipt/row (`grep -ril pinch`, `grep -rl synthesizePinchGesture
  corpus/evidence`, `git log -S` first touches `711a38c2`); S176–S178 are new. The five mouse legs
  re-measure the already-held ctrl+wheel→zoom path.
- Do-nothing reach: a 3-field rebrand of the committed receipt (no browser) is **counter-clean
  87/87, battery 107/107, kill-power 87/87**. (a)+(c) cannot separate a forgery; the declared
  limit ("not an execution oracle") covers it. Leg (b) was the only execution evidence and is red.
- Overfit: bands vs measured — in/out/clamp 242.5 ms vs [150,450]; default 125.8 vs [60,300];
  zero 4674 vs [3000,6000] (tightest); ratio 4.10 vs [3,5]; counts 16/16/16/9/282 vs floors.
  Stretching a wheel span ×1.9 is refused (false-red, not false-green). Shape was frozen on n=2
  clean runs; the third live run was red.
- Instrument residues: `Input.setIgnoreInputEvents` still accepted (`:106`, r70 FG3 carry-over);
  unread `legs[].params`/`elapsedMs`/`slowToTouchSpanRatio`; `--laundered` takes one path per flag.

## C2 `C2-EXEC-BOUND` — **holds-with-limit**

- Legs (a)–(d) hold: L1 evaluator holds, R71Exec2 independent harness rc 0 falsePass 0 notLanded 0
  with both live profiles exit 0, my lane-copy baseline exit 0 (runs 12 826/12 960 ms).
- New outsider attack **E-receipt-handoff**, not named by the limit: the verifier loads the receipt
  (`:189`), hashes it (`:190`), checks stdout against it (`:202`), then runs the counter on the
  **path** (`:205`) with no re-bind. Watcher replaced both run receipts with the committed evidence
  rebranded: 2/2 swaps landed (`receipts/c2/handoff.log`), `receiptSha256` = forged, counter exit 0.
  Only (O) refused, on a 0.1 ms `pressReleaseMs` template drift; (O) binds 5 keys (tap `:82`), so an
  in-place edit of `cdpSendLog`/`plan`/`failures`/`host`/`startedAt`/tap `legs[]` is invisible.
  "Narrowed, not excluded" covers the class → not a falsification; a named correction entry is owed.
- Un-named, not run: children spawn `process.execPath` (`:163`,`:183`), a **user-writable** fnm node
  (`test -w` true) — replace it after start and the snapshot hashes still match. Hostile `ps` on the
  allow-listed PATH is not a same-user vector (`/usr/local/bin` root:root; `/usr/bin/{chromium,curl}`
  absolute).
- Axis fit: operability is right per AXES.md:13 ("a checklist item can be run and produces the stated
  outcome"); C1 coverage fits but scores no movement.

## Impacted axes

coverage: no movement (capability withheld). operability: C2 movement stands; residual narrowed to
receipt handoff + interpreter substitution.
