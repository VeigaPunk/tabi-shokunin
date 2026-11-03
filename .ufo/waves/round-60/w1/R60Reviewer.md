# R60Reviewer — round 60 w1 reviewer findings (tabi-shokunin)

Scope: attack seat only. claims.json read first (freeze 67d6f70e = lane HEAD, unmoved). Pre-data predicate review, then attacks after executor READY (R60Exec1/Exec2/Exec3, none dead). No counters, claims, or corpus edited. Full 13-row table: `.ufo/waves/round-60/w1/R60Reviewer/attacks.md`; evidence (run JSONs at each digest, seat-owned forgeries, diffs): `.ufo/waves/round-60/w1/R60Reviewer/evidence/`.

## Final instruments
- C2 `chromium-receipt-r60.mjs` sha256 **b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae** (2582 lines; fifth digest; 0ed93c7a at 2561 lines, 1408dd90, 99844dd9, 5465be1f superseded).
- C1 `c1-wide-screen-r60.mjs` sha256 **ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920**.

## C1 — adjacency wide screen
- **A1 KILLED.** counts.enumeratedMd **85,598** independently re-derived (NUL-delimited `ls-tree -z`), per-lane match at all 20 frozen heads. The naive `grep '\.md$'` pipeline gives 85,594 (kengaku: 1 CJK-quoted path; souji: 3 filenames containing a literal newline). Future verifiers must enumerate NUL-delimited.
- Do-nothing control reproduced: scope=map exit 1, screened 25, unscreened 85,573 (RED as required). scope=wide exit 0, predicate true, screened=enumerated=85,598, unscreened 0, roster 20, rowMismatch 0, unresolvableHead 0; wideHitLines 19,049 in 6,129 files (non-adjudicated residual).
- **A2 KILLED.** No worktree read, checkout, or repo-path readFile; blob access via `ls-tree -z` / `cat-file --batch` / `cat-file blob` + oid re-verify / `git show`; readFileSync only on explicit `--map-file` / `--verify-rows` inputs; no hardcoded /tmp.

## C2 — calibration cancelable gate (b0d03fe0)
- Frozen probes A/B/D/E each exit 1; live receipt exit 0, predicate true, findings [], couldNotEvaluate [].
- Selftest against the lane counter: 110/110 allPass; self-check fixtureCount 110.
- **A5a KILLED** (capsLock:true on the first CapsLock keydown at three paths → caps-flag-true).
- **A5b** trace[0]-only capsLock:true: SURVIVED at interim 5465be1f (and r59), a K5-class seat finding that drove the fix → KILLED at 1408dd90, 0ed93c7a, b0d03fe0.
- **A5c** defaultPrevented deletion on CapsLock/letter events: green at 99844dd9 (critic) → KILLED at 1408dd90 onward.
- **A5d** P3 (top-level `keylog.entries[0].cancelable=false`): green at 1408dd90 → refused at 0ed93c7a and b0d03fe0 (keylog-entry-mismatch), per the L1 ruling.
- **A5e** P3b (`keylog.entries[0].key` End→EndX): KILLED at 0ed93c7a and b0d03fe0.
- **A6** page-side letter KEYUP (the residual I named at 0ed93c7a): defaultPrevented deleted, key corrupted (f→fX), cancelable deleted, and cancelable as string "true" are all KILLED at b0d03fe0. **cancelable:false on a letter keyup is GREEN (exit 0) by design** — the keyup rule binds presence and boolean type only. Under K5's letter that is a green forged receipt outside F, so the L1 must rule: named by-design boundary (executor's pinned case `page-keyup-cancelable-false-admitted`, ok:true) or a kill-class finding. Same tension as A5d before its ruling; I have not classed it either way.

## FLAWs (non-fatal, for the L1)
1. PD1: the A3 oracle "declared change set (a)-(e) of claims.json C2" is not in claims.json; it lives only in untracked `w1-spec.json` items/3/prompt. Pin the change-set text at the instrument freeze. The extensions (defaultPrevented rule, trace[] capsLock, scalar mirrors, non-object mirror letters, control-window identity, page-tail keyup run) are K5- or L1-justified but not enumerated in that text. The b0d03fe0 digest is +21 net lines over 0ed93c7a (2561→2582, of which +10 are comment lines), per the executor's re-diff and my wc -l check; I did not run a full diff of it.
2. PD2: C1's `rowMismatch == 0` is vacuous on the rowless snapshot (rowsChecked 0 without `--verify-rows`). Mitigated: Exec1's `--rows-out` + `--verify-rows` run gave rowsChecked 85,598, rowMismatch 0 (scratch, uncommitted).
3. PD3: "browser-ground-word" is code-authority (BG_WORDS verbatim from v19); mitigated by C1's non-adjudication of wide hits.
4. A3 minor: envelope-schema strings renamed r59→r60 (error-output identity only).
5. A6(e) — RULED by the L1 (option a): the cancelable VALUE of any keyup is unbound by design (keyup rule = presence + boolean type). Measured at b0d03fe0: letter keyup cancelable:false on the page record only → exit 0; CapsLock keyup cancelable:false in all three recordings → exit 0; CapsLock on the page record only → exit 1. A consistent-record keyup-value forgery is a named residual limit, not a kill; pinned by the GREEN case page-keyup-cancelable-false-admitted. No counter edit.

## Residuals named
- Derived summary booleans (leg.anyCapsTrue, capsLatchObservedAllFalse, capsLatchOk, trace.capsLatchOk) are unread; judged not-K5.

## Not run / limits
- Mutant kills M1–M5 (C1) and C6–C9 (C2), the C1 selftest (17/17, executor receipt), the census, and K4 `--verify-rows` (executor receipt) were not independently run by this seat.
- Tools: none installed or upgraded (node v24.21.0, python3, git only).
