# R93Exec2 — leg-level counterexample hunt for C1 (repetition)

Seat: R93Exec2 (`/skill:godspeed`). Plan: `plans/round-93.md` §Claim / §Declared limits.
Predicate: `C1-CROSS-SESSION-ANSWER-R93` (capability `chromium-oopif-backendnode-scope-linux`).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Frozen pins verified before any run:
driver `a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0`,
counter `3c721b668e553050ed6450d7b2e1881a864d191ef243ce410c37d5f04e36f1e3`,
battery `c8c15cc7368025201c949af2defd23fb048a8d17c4ba20a49659d46f3d88f6f5`
(all match `controls/instrument-sha256.txt`; `sha256sum`, rc=0). Frozen files unedited.

## Runs (exact counting command; `--reps 10` only on run-reps10)

| run | ports (http,child,cdp) | scratch | rc | verdict | checks | findings | nonce |
|---|---|---|---|---|---|---|---|
| run1 | 19411,19412,19413 | `.../R93Exec2/run1` | 0 | clean | 101 | 0 | tabi-r93-live-814739afbca4 |
| run2 | 19414,19415,19416 | `.../R93Exec2/run2` | 0 | clean | 101 | 0 | tabi-r93-live-74787cdaefc5 |
| run3 | 19417,19418,19419 | `.../R93Exec2/run3` | 0 | clean | 101 | 0 | tabi-r93-live-dbafc5315667 |
| run-reps10 | 19411,19412,19413 | `.../R93Exec2/run-reps10` | 0 | clean | 311 | 0 | tabi-r93-live-80d6e9671087 |

Per-run detail incl. every leg's `describePage.nodeName`, `pagePierceInputS`,
`crossAnswer.error`, `filesAfterCross`, `answer.error`, `childFiles`: `R93Exec2-summary.json`
(one object per run, 4 runs, 6+6+6+20 = 38 legs). Full command text per run is stored
in the JSON `command` field; template:

`node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-cross-session-answer-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0 --live --scratch /fast/scratch/hyaku/tabi-r93/R93Exec2/<run> --ports <triple> --json [--reps 10]`

Receipt sha256 (full values in `R93Exec2-summary.json`): run1 c300ce5cf7bf2afe…, run2 ec7c66a5ffa8cbe1…, run3 b881728fd913dc17…, run-reps10 4956ea9d9b0ac1ef… (16-hex prefixes; full hashes verified on read).

## Observed leg values (identical across all 38 legs)

- X legs (cross-site, `localhost`): `describeChooser` = INPUT (iframe session, no error);
  `describePage.nodeName` = `#document` (page session, error null) in every X leg;
  `pagePierceInputS` = 0; `crossAnswer.error` = exactly `Node is not a file input element`
  (page session); `filesAfterCross` = `[]`; iframe-session answer error null;
  `childFiles` = `[["tabi-r93-answer.txt", 22]]`.
- S legs (same-site, `127.0.0.1`): `describePage.nodeName` = INPUT (page session);
  `pagePierceInputS` = 1; `crossAnswer` = null (none sent, as claimed); answer error null;
  `childFiles` = `[["tabi-r93-answer.txt", 22]]`.

## Findings classification

None. No run produced any finding id, so there is no leg-level statement of the frozen
wording that is false on a live run of the pinned driver, and no setup/port/resource
failure to name (all four counters exited 0; ports were free — `pgrep -f
"remote-debugging-port=1941"` was empty before and after the runs; no chromium processes
remained on ports 19411–19419 at yield time). The `--reps 10` run (20 legs, 311 checks)
covers other legs per declared limit 6 and likewise shows zero findings; per the seat
brief that is still evidence about the law, and it is neutral here.

No receipts were copied to `w1/` because the brief copies only receipts that have a
finding; there are none.

## Tooling / hygiene

No tools installed or upgraded (node + Chromium already present; pacman untouched per
pause notice; nothing run under sudo; no git/jj mutation; scratch root
`/fast/scratch/hyaku/tabi-r93/R93Exec2/` removed after copying `R93Exec2-summary.json`
and this report into `w1/`).

VERDICT C1: neutral

Report: .ufo/waves/round-93/w1/R93Exec2.md
