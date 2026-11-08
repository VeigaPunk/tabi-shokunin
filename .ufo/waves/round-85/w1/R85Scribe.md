# R85Scribe — round 85 / w1 — the r85 knowledge note, lesson sections, SKILL registry row

Seat: R85Scribe (scribe, axis `depth`). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base `c574d593`. Leaf member: **no subagent dispatch**. Read-only on the lane except for the three
drafts this seat was asked to write; **no git/jj mutation, nothing committed, nothing pushed**.
**No package was installed** (nothing needed; the pausable-pacman rule was not exercised).

## Deliverables (drafts, not committed)

| path | purpose |
|---|---|
| `.ufo/waves/round-85/w1/R85Scribe/knowledge-note.md` | draft of `corpus/knowledge/chromium-showpicker-runtime-round-85.md` (house style of the r84 note) |
| `.ufo/waves/round-85/w1/R85Scribe/lesson.md` | draft of the round-85 lesson's `## Gate` / `## Mistakes` / `## Corrections` sections |
| `.ufo/waves/round-85/w1/R85Scribe/skill-row.md` | draft of the `## Round 85 gate registry` block for `SKILL.md`, in the style of the r84 entry |

The lane already carries landed equivalents (`corpus/knowledge/chromium-showpicker-runtime-round-85.md`
at 04:41, `corpus/lessons/round-85.md` at 04:41, `SKILL.md` §Round 85 gate registry at 04:41) —
written by the L1/other seats while this seat was measuring. **These drafts are this seat's own
independent read of the same bytes**; they are written to the assignment's spec (six new legs with
receipt field paths, the carried r84 laws, the cannot-prove list, the named frontier, the C2
before/after numbers, the seven r85 instruments with entry commands and verdict maps) and they
diverge from the landed texts in exactly the places listed under *Divergences* below. The L1 owns
integration.

## Identity: a live conflict, recorded verbatim

This seat's brief names **D `dbecb1a18905`**, nonce `tabi-r85-l1-dbecb1a18905`, freeze commit
`5c1961525e83efe2682cab389b8995d67c0ab4f0`. The lane has **re-frozen to D `620623a43f74`**, nonce
`tabi-r85-l1-620623a43f74`:

- `.ufo/waves/round-85/claims.json` → `"digestsCommit": "620623a43f74"`, `"nonce":
  "tabi-r85-l1-620623a43f74"`, `frozenAt` = "…freeze.txt sha256 620623a43f74 (D2; D1 dbecb1a18905
  superseded by the drift-counter family-case mapping fix recorded in plans/round-85.md §Re-freeze
  history — no record had been scored against D1's drift counter)".
- `.ufo/waves/round-85/freeze.txt` sha256 = `620623a43f747cfadf13e24b4501bfd8b8fff43cefa7c97aa1bee67c5a3c6906`.
- `plans/round-85.md` §Re-freeze history records D1 → D2 and the family→case mapping fix.
- The scored receipt was **re-executed** at the D2 nonce: `corpus/evidence/round85/chromium-showpicker/receipt.json`
  is now nonce `tabi-r85-l1-620623a43f74`, `fixture.sha256` `0b012937…d252a`, file sha256
  `c22f90f7…1e56a` (the D1 receipt, `d5b1cb25…746a7`, fixture `9b71a949…2db5d`, is superseded, not
  edited).

**Every number in this seat's drafts and in this report is from the D2 bytes**, because the D2
instruments, the D2 scored artifacts and the live receipt are what bind them. The brief's D1 nonce
is quoted only where the D1→D2 difference is the point. This seat did **not** re-freeze anything
and proposes no amendment to any frozen predicate, counter, pin, prior, threshold or kill rule.

## What this seat measured (every command run read-only; scratch under `/fast/scratch/hyaku/tabi-r85/R85Scribe/`)

1. **Counter** — `node scripts/check-showpicker-r85.mjs --lane <ABS lane> --receipt
   corpus/evidence/round85/chromium-showpicker/receipt.json --expect-driver-sha256
   1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee --expect-nonce
   tabi-r85-l1-620623a43f74 --expect-fixture-sha256
   0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a --prior-set
   .ufo/waves/round-85/controls/c1/prior-set.txt --json` → **exit 0, verdict `clean`, 87 checks,
   0 findings**. Independently confirmed by `.ufo/waves/round-85/scored/counter-a.json`.
2. **Check-id decomposition** (this seat's own diff of the two scored counter outputs): r85 = 34
   structural + 3 `leg-*` meta + 24 per-leg + 26 `*-law`; r84 = 34 + 3 + 18 + 25. Set difference of
   the two `checks` maps = exactly the six `leg-sp85-same-origin-*` ids + `same-origin-no-picker-law`;
   **no r84 id is lost**.
3. **Battery** — `.ufo/waves/round-85/scored/battery-a.json`: **175 cases, 0 failed, coverage
   87/87** (`uncovered []`, `unknown []`).
4. **Kill power** — `.ufo/waves/round-85/scored/killpower-a.json`: **58 mutants, 58 killed, 0
   survived, 0 crashed, 0 unapplied**; the script's `MUTANTS` table holds 58 entries, the last eight
   being the six r84 survivor families plus `same-origin-no-picker-want-dropped` and
   `same-origin-no-picker-law-dropped`.
5. **Family witnesses (C2)** — `node scripts/witness-families-r85.mjs --lane <ABS lane> --work
   <ABS scratch> --json` → **exit 0**. `before.survivors` = **3** (`cross-access-dropped`,
   `cross-childseq-dropped`, `cross-childact-before-dropped` — each survived the frozen r84 battery
   with 162 cases / 0 failed); `after.survivors` = **0**; `crashed []`, `unapplied []` in both
   generations; the three already-killed families fail first on `cross-origin-tel-message`,
   `cross-origin-text-late`, `cross-origin-search-activation`. Run twice by this seat (once against
   the D1 receipt, once against the D2 receipt) with identical id-for-id results, and identical to
   `.ufo/waves/round-85/scored/witness-a.json`. **C2 before/after: 3 of 6 families survive the
   frozen r84 battery, 0 of 6 the frozen r85 battery.**
6. **Self-test** — `.ufo/waves/round-85/scored/selftest.json`: `clean true`, **9 gates, 0 failed**
   (`pins-match-freeze`, `counter-clean`, `battery`, `kill-power`, `nowork-control`,
   `tree-exempt-path-refused`, `tree-exempt-unmatched-refused`, `record-drift`,
   `capability-status`). This seat re-ran it independently against the committed lane
   (`node scripts/selftest-r85-gates.mjs --lane <ABS lane> --work <ABS scratch> --json`) → **exit 0,
   `clean: true`, 9 cases, 0 failed**, every gate `ok` — the same result the scored artifact holds.
7. **Record drift** — `node scripts/check-record-drift-r85.mjs --lane <ABS lane> --json` →
   **8 claims, 0 mismatches**, all eight ids `ok`.
8. **Do-nothing controls** — `.ufo/waves/round-85/controls/c1/nowork-r84-under-r85.json`: the r84
   scored receipt under the r85 counter → **exit 1, `findings`, 81 checks, 22 findings**; a
   no-receipt run → **exit 2**, `verdict: unreadable`, `receipt-unreadable` (committed transcript
   `.ufo/waves/round-85/controls/c1/noreceipt.txt`).
9. **Replay escape, reproduced** — a copy of the scored receipt with **every** `pageEvents[].ts`
   and `.at` shifted by `+2.0` still passes `replay-event-timeline`
   (`checks['replay-event-timeline'] === true`, `absMatched 0`, `refused false`); the only finding
   is `prior-set-complete`, because a receipt under test outside the walked trees makes the in-tree
   receipt count as unlisted. The counter prints the escape itself in its `limit` block
   (`priorEvents 76`, `absNeed 38`, `escapeEvents 39`, `tolerance 0.05`, `gapMin 50`).
10. **D1 drift counter, re-run against the D2 lane** — `git show 5c19615:scripts/check-record-drift-r85.mjs`
    (sha256 `1c6f1396…20d84`) → **exit 1**, `failed:["family-witnesses"]`, detail
    `battery cases missing: ["cross-message-unpinned", …all six…]` — the D1 counter looked for the
    *witness family* names where the battery's *case* ids are `cross-tel-*`
    (`scripts/negatives-showpicker-r85.mjs:238–243`). This is the defect the D2 re-freeze fixes;
    the D2 bytes read clean.
11. **The six new legs, field by field** (D2 receipt) — `legs[18..20]`: `showPicker` =
    `{ok:false, name:'NotAllowedError', message:"Failed to execute 'showPicker' on
    'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."}`,
    `activationBefore`/`activationAfter` both `{isActive:false,hasBeenActive:false}`, `pageEvents`
    empty, zero `Page.fileChooserOpened`, `stateAfter` empty, `priorClick` null.
    `legs[21..23]`: `priorClick` `{at:[360,40], wantTarget:'pad'}`, `priorPressId` 15,
    `priorReleaseId` 16, `priorClickElement` `'pad'`, `activationBefore`
    `{isActive:true,hasBeenActive:true}` → `activationAfter` `{isActive:false,hasBeenActive:true}`,
    five trusted `#pad` events, `showPicker` `{ok:true, ret:'undefined'}`, **zero** chooser events,
    `firstChooserBackendNodeId` null, `stateAfter` empty.
    `legs[12..14]` (cross-origin): `childResult` = `{ok:false, name:'SecurityError', message:"Failed
    to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."}`,
    `childActivationBefore` `{false,false}` → `childActivationAfter` `{true,true}`, five trusted
    child-button events, `parentCrossAccess` `{contentDocument:null, windowDocument:'SecurityError'}`.
    `fixtureInputs` (top-level and in all 24 legs) carries `tes`/`ses`/`txs` with `type`
    tel/search/text.
12. **The carried r84 laws, re-derived on the D2 receipt** — `legs[2].childResult` =
    `{ok:true, ret:'undefined'}` (color exempt); `legs[6].showPicker` = `InvalidStateError`
    "cannot be used on immutable controls." against `legs[1].childResult` = SecurityError on the
    *same* disabled `type=date` (origin before mutability); `legs[7].stateAfter.d` carries
    `webkitRelativePath` `tabi-r85-dir/inner-a.txt` / `…inner-b.png`; `legs[8].stateAfter.k` =
    `[["tabi-r85-a.txt",22,"text/plain",""]]` (a `.txt` into `accept=".png"`, accepted);
    `legs[15]` mode `selectMultiple`, `stateAfter.m` = the same `.txt`; `legs[16].stateAfter.k` =
    `[["tabi-r85-b.png",21,"image/png",""]]`, `read` `ret` =
    `hex:89504e470d0a1a0a746162692d7238332d706e670a` (PNG signature + the 13-byte marker
    `tabi-r83-png\n` — the marker still names r83); `legs[17]` `firstChooserBackendNodeId` ===
    `secondChooserBackendNodeId` (18/18), choosers 1 → 2, `stateAfter.s` =
    `[["tabi-r85-second.txt",28,"text/plain",""]]`, `stateAfter.sValue` =
    `C:\fakepath\tabi-r85-second.txt`; `legs[9]` click-while-open choosers 1 → 2 on element `s`.
13. **Registry / census** — 223 rows (`grep -cE '^\| S[0-9]+ ' corpus/SOURCES.md` → 223), no
    `git diff` on `corpus/SOURCES.md`; census `start.txt` and `end.txt` both end `exit=0` with the
    `tabi ok` line.

## Findings this seat measured and did not see recorded elsewhere in the lane

- **`number-drift` — the frozen claim's do-nothing-control prose undercounts by one.** `claims.json`
  C1 `doNothingControl` says "exit 1, 81 checks (not 87), **21 findings**"; the control artifact it
  points at carries **22**. Reported, not amended (the claim is FROZEN).
- **`reference-drift` — the plan's predicate line pins the superseded D1 fixture next to the D2
  nonce.** `plans/round-85.md:18` reads "fixture `9b71a949…`, nonce `tabi-r85-l1-620623a43f74`",
  while the live receipt's `fixture.sha256` is `0b012937…d252a` (the plan's own line 82 records
  the correct D2 value). Running the frozen counting command with the plan's line-18 pin against
  the live receipt fails `fixture-hash`; with the D2 pin it exits 0 clean at 87 checks. Reported,
  not amended.
- **The unmeasured "(no picker exists for these types)" parenthetical has already propagated into
  the SCORECARD capability row** (`SCORECARD.md:4133`). It is prose: the receipt has no
  picker-capability field, and the zero-open expectation is a hardcoded name set in the counter
  (`NO_PICKER`, `scripts/check-showpicker-r85.mjs:146`). Flagged to the L1; not amended here.
- **The `same-origin-no-picker-law` covers only the three `-activated` arms**, and the
  `NotAllowedError` outcome of the three non-activated arms rests on the shared `gesture-law`
  (`SP_LAW`) sweep rather than on a per-leg law of its own. That is a coverage statement, not a
  defect — the two are re-derived by the same counter — but it is the shape the r85 laws take and
  the note says so.

## Divergences from the lane's landed texts (L1's call)

- **Nonce / digest.** The landed note and lesson carry D `620623a43f74`; this seat's drafts carry
  the same D2 identity, with the brief's D1 recorded explicitly as superseded.
- **The do-nothing-control count.** The landed lesson/plan say 22 findings; the **frozen claim**
  says 21. This seat's drafts state 22 and flag the claim's 21 as a number-drift finding.
- **The frontier list.** The landed note's §Frontier names three items (the accept token matrix, a
  same-element origin comparison, a same-origin activated `type=color` arm). The assignment asks
  this seat to name the frontier as *accept MIME-token / `image/*` grammar* and *a cross-origin vs
  same-origin comparison holding activation constant*; this seat's draft names the accept matrix,
  the **same-element** origin comparison (the element switch is exactly the unheld constant), the
  missing **(cross-origin, no-activation)** cell, the `type=color` same-origin activated arm, the
  picker-mechanism probe, and a translation-invariant replay statistic.
- **The plan's stale fixture pin** is reported above; this seat's drafts use `0b012937…d252a`.
- **The r84 note's recheck line** was run verbatim by this seat: `corpus/knowledge/chromium-showpicker-runtime-round-84.md`'s
  `recheck:` command exits **0 clean at 80 checks** against the committed r84 receipt — the r84
  note's recheck line is sound (an earlier D1-era fixture value appears only in the r84 *w1 draft*,
  not in the landed note).

## Out of scope (not done by this seat)

- No product code, counter, battery, kill-power, selftest, drift counter or witness runner was
  edited. No claim, pin, prior, threshold or kill rule was amended.
- No commit, push, publish or deploy. No git/jj mutation of any kind (only `git show` /
  `git log` / `git status` / `git diff`, read-only).
- Nothing was written outside the lane tree, this seat's scratch dir, and this seat's report path.
- No fleet repo, no sibling lane, no `.ufo/state`, no `.scratch/` was touched.
- The scored receipt is now **committed** — `git show HEAD:corpus/evidence/round85/chromium-showpicker/receipt.json`
  reads nonce `tabi-r85-l1-620623a43f74`, fixture `0b012937…d252a`, 24 legs, and the five scored
  artifacts are in commit `c8876299` (".ufo/waves/round-85/scored/…"). This seat's working tree is
  clean apart from its own two untracked paths (this report and its draft directory). R85Review1's
  MEDIUM-1 ("the scored receipt is not committed") was true when that seat measured it and is
  **resolved** by that commit; this seat re-checked it rather than repeating it.

## Artifacts

- Drafts: `.ufo/waves/round-85/w1/R85Scribe/knowledge-note.md`, `.ufo/waves/round-85/w1/R85Scribe/lesson.md`,
  `.ufo/waves/round-85/w1/R85Scribe/skill-row.md`
- This report: `.ufo/waves/round-85/w1/R85Scribe.md`
- Scratch (removed before yield): `/fast/scratch/hyaku/tabi-r85/R85Scribe/`

**Checks the main agent should run after integrating** (this seat ran them against the lane as
committed, i.e. **before** these drafts are integrated; both read the lesson, the plan, SKILL.md and
SCORECARD.md, so they must be re-run against the integrated text): the drift counter
(`node scripts/check-record-drift-r85.mjs --lane <ABS lane> --json` → **8 claims, 0 mismatches**,
measured) and the selftest (`node scripts/selftest-r85-gates.mjs --lane <ABS lane> --work <ABS
scratch> --json` → **exit 0, 9/9 green**, measured).

**Also check the L1's own records** (this seat did not edit them): the frozen claim's
`doNothingControl` prose says "21 findings" against a control artifact carrying **22**, and
`plans/round-85.md:18` pins the superseded D1 fixture `9b71a949…` beside the D2 nonce where the
live receipt's fixture is `0b012937…d252a` (the same plan's line 82 records the correct D2 value).
Both are reported, not amended — the claim is FROZEN and no predicate, counter, pin, prior,
threshold or kill rule is proposed for change.
