FINDINGS

# R76Scribe — independent re-derivation of the r76 note and lesson Gate

Seat R76Scribe, round 76 w1, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`a69f9060cb9d239b3d6d4429e1b91177b792ebd3`. Read-only review: no product, judge, lane-root or
sibling file was written; no git/jj mutation; no subagent; no tool install.

**Bottom line.** The note's measured table holds on every receipt I re-derived (9 PRE smokes + 4
probes + the (a) receipt = 14 receipts x 10 legs, **140/140 legs** rebuilt from raw events and CDP
logs). The lesson's seven Gate quotes all locate at their stated lines and are ≤ 25 words (max 19).
Two substantive defects: the note's novelty sentence is false as written (a prior note did cover a
dialog), and the note's "20 ms = CDP round trip" attribution is refuted by an independent probe
(the block is 1.1–3.4 ms when the answer is event-driven; the driver's 18.6–24.8 ms is dominated by
its 20 ms poll). Six smaller citation/wording fixes are listed in `note-review.md`.

## What was run (command → exit code)

| command | exit | result |
|---|---|---|
| `node derive.mjs` (seat scratch; reads the 14 receipts) | 0 | per-receipt/per-leg facts; every receipt 37 page events, 18 CDP dialog/nav events, 3 server rows, `failures []`; `derived.json` |
| `node matrix.mjs` | 0 | per-leg signatures across 14 receipts; `legShape` identical 14/14 modulo nonce; dialog block 18.6–24.8 ms (median 20.4, 84 samples); 518/518 page events `isTrusted`; 84/84 `dialog-return` before `click` |
| `node rederive.mjs` | 0 | **140/140 legs** match the recorded `legShape`; Gate quote table (7/7 locate, ≤25 words) |
| `node scripts/check-dialog-r76.mjs --lane … --receipt corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 152ffc…dd51 --expect-nonce tabi-r76-l1-97bf5d560d03 --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --json` (05:04) | 0 | `verdict clean`, `checkCount 131`, `findings []`, `priors 17`, priorSet sha256 `30f7418a…`, `maxAbs 0`, `maxGap 0.333`, own gaps 6 (`a-counter.json`) |
| same counter, re-run at 05:11 after a sibling seat wrote artifacts | 1 | one finding `prior-set-complete` naming `.ufo/waves/round-76/w1/R76Critic/F5-exec1.receipt.json` (finding 13) |
| same counter, re-run after the sibling renamed its artifacts (05:12) | 0 | `verdict clean`, `checkCount 131`, `findings []`, `priors 17` (`a-counter-after-fix.json`) |
| `node release-block-probe.mjs` (independent Chromium 155.0.8059.84 `--headless=new`, 3 iterations) | 0 | page dialog block **1.1 / 1.3 / 3.4 ms**; handle round trip 1.34–3.35 ms; `mouseReleased` response resolved **0.02–0.06 ms after the handle response**, 1.8–4.1 ms after the release was sent; ports closed, child SIGKILL (`release-block-probe.receipt.txt`) |
| `git grep -lE 'handleJavaScriptDialog\|javascriptDialogOpening' a69f9060 -- corpus/knowledge` | 1 | empty (agrees with the note) |
| `git show a69f9060:corpus/SOURCES.md \| grep -c 'page_handler.cc\|local_dom_window.cc\|web_contents_impl.cc'` | 0 | count 0 (agrees with the lesson) |
| `git show a69f9060:SCORECARD.md \| grep -c '^\| \`chromium'`; `… \| grep -in dialog` | 0 | 8 rows / 7 unique capability names, 0 dialog lines |
| `sha256sum` on the 5 staged sources and the 4 instruments | 0 | all match `sources/FETCH.txt` and `freeze.txt` (driver `152ffc…dd51`, counter `505055…dcf4`, battery `91874c…474c`, kill power `801078…aca1`) |
| `wc -l` on the 5 sources | 0 | 1795 / 2781 / 2943 / 1602 / 13314 — the lesson's counts |
| `bash scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi` | 0 | `tabi rows 206` now; base `corpus/SOURCES.md` has 201 rows (`git show a69f9060:… \| grep -c '^\| S[0-9]'`) |
| python over `lesson-proof/probe-build1-p1-refuted.receipt.json` with the build-1 regex | 0 | exactly 6 look-alike hits, ids 11/16/21/26/31/36, all `window.__setLeg(...)` (the lesson's claim) |
| python over `lesson-proof/prefreeze-pass1/*` | 0 | `pf-smoke4.counter.json` finding `leg-records: start:elapsedMs`; 7/9 smokes failed on bracket cases; smoke3 exactly 3 `bracket misplaced`; pass-1 summary `allOk false` |

## Findings

1. **Novelty sentence is false as written** (`corpus/knowledge/chromium-js-dialog-runtime-round-76.md:9-10`:
   "no capability row or note covered a dialog"). The quoted grep only tests the two CDP names. At
   base a note covers a dialog: `git show a69f9060:corpus/knowledge/webdriver-bidi-runtime-round-32.md:83`
   (R17 user prompts/dialogs "yes", one `alert` + `handleUserPrompt`) and `:108` ("Not dialog
   coverage: one `alert` with `accept: true` … `confirm`/`prompt` … not measured");
   `webdriver-bidi-firefox-runtime-round-35.md:124` repeats it; `webdriver-bidi-capability-matrix.md:76`
   calls dialogs "not currently a tabi surface (no anchor — honest lane-coverage gap)", which
   contradicts r32/r35's `yes`. The capability-row half is true (7 unique chromium rows at base,
   none dialog). Proposed wording in `note-review.md` §2 item 1.
2. **The 20 ms is not the CDP round trip** (`note:63-64`). The 13 PRE receipts' dialog block is
   18.6–24.8 ms (median 20.4; 84 returns) — real, but the driver polls `waitOpening` every 20 ms
   (`scripts/chrome-cdp-dialog-round76.mjs:340`) and answers only after a poll (`:360-364`). My
   event-driven probe measured the same block at **1.1–3.4 ms** and the handle round trip at
   1.34–3.35 ms (`release-block-probe.receipt.txt`). The parenthetical "(the CDP round trip of the
   answer)" must be replaced.
3. **S202 range excludes `beforeunload`** (`note:17`, `corpus/SOURCES.md:216`): `DialogType` is
   `sources/Page.pdl:392-398`; `beforeunload` is line **398**, outside the cited 392-397. The row's
   own parenthetical lists it. Fix both to 392-398.
4. **S204 `11656-11712` overshoots `OnDialogClosed`, which ends at 11701** (`note:36`,
   `SOURCES.md:218`; `sources/web_contents_impl.cc:11656-11701`; 11702-11712 are other functions).
5. **"answered as if cancelled" is `:9631-9634`, not inside `:9601-9603`** (`note:35`;
   `sources/web_contents_impl.cc:9632` runs the callback `(true, false, "")`).
6. **S204 subframe range**: note says 9605-9626 (`note:87`), SOURCES says 9605-9628; the block ends
   at 9628 (`sources/web_contents_impl.cc:9605-9628`).
7. **`-32602` attribution** (`note:30`): the code is the protocol's invalid-params error (measured
   in all 14 receipts), not text in `page_handler.cc`; `page_handler.cc:1733` only names
   `InvalidParams`.
8. **"touch"** (`note:8`): no touch capability row and no note drives `Input.dispatchTouchEvent` as
   a surface; it appears only inside `Input.synthesize*Gesture` notes (69/70/71). Say "synthesized
   touch gestures".
9. **Manager-hang assertion** (`note:67-68`): `hasBrowserHandler: true` proves a delegate dialog
   manager exists (S204:9601), not that it would hang; the note marks it "not measured" — word it as
   unknown.
10. **Release-ordering claim** (`note:69-70`) was unmeasured in the lane's receipts (no response
    timestamps); my probe now measures it: the release response resolves only after the close
    (0.02–0.06 ms after the handle response). Cite the probe or mark it inferred from S206.
11. **Lesson evidence pointers** (minor): `census/start.txt` does not record "201 rows" (it holds 31
    lines of W04 warnings + `tabi ok`; 201 is the base-file count); the pass-1 `allOk false`
    summary is `lesson-proof/prefreeze-pass1/prefreeze-summary.json`, not the current
    `controls/c1/prefreeze-summary.json` (`allOk true`); "every honest probe of the first build" is
    one probe (only one build-1 receipt exists: `grep -rl fca1e354… .ufo/waves/round-76` → 1); the
    S202 quote occurs only after stripping the PDL `#` markers.
12. **S202's bytes are identical to S105's** (same sha256 `e944a3b1…05be`, same 61,911 bytes at
    tags 154.0.8037.97 and 155.0.8059.84): the lesson's "held at other tags" is true, but the row's
    value is the tag binding, not new text.
13. **Wave-level contamination by a sibling seat (blocker for re-runs; reported to Main and
    R76Critic).** `.ufo/waves/round-76/w1/R76Critic/` holds six `.json` files whose top-level schema
    is `tabi-chrome-cdp-dialog-r76`: `F1-identity-only.receipt.json`, `F2b-two-gaps.receipt.json`,
    `F2c-one-gap.receipt.json`, `F3-18-events.receipt.json`, `F6-tuned.receipt.json` (nonce
    `tabi-r76-l1-97bf5d560d03`) and `F5-exec1.receipt.json` (nonce `tabi-r76-exec1-97bf5d560d03`).
    The counter's `prior-set-complete` walk reads every `*.json` of that schema under
    `.ufo/waves/round-76` and `corpus/evidence/round76` (`scripts/check-dialog-r76.mjs:216-219`).
    Re-running the (a) counter at 05:11 exits **1** with `prior-set-complete` naming
    `F5-exec1.receipt.json`; simulating the walk with `--expect-nonce tabi-r76-exec1-…` refuses the
    five l1-nonce files (plus the (a) receipt, which the predicate passes as `--prior`). So leg (b)
    as specified fails on those five unless each is passed as `--prior`, and any (a) re-run /
    battery / kill-power over (a) fails on F5. The wave spec's convention is `<name>.receipt.txt`
    precisely so the walk never reads a seat's file; these were saved as `.json`. I did not modify
    them; the fix owner is whoever owns R76Critic's artifacts (rename to `.receipt.txt` or move to
    scratch). My own artifacts are safe: `a-counter.json` (schema `tabi-check-dialog-r76`) and
    `derived.json` (no top-level `schema`) are skipped by the walk — the 05:11 finding names only
    the sibling's file. **Resolved at 05:12:** R76Critic renamed all six to `<name>.receipt.txt`
    (confirmed by read-only enumeration: the wave tree now holds 18 schema receipts = the 17 priors
    + the (a) receipt, none under `w1/R76Critic`), and my re-run of the (a) counter exits **0**
    clean 131 with 17 priors (`a-counter-after-fix.json`). The blocker was real for 8 minutes and
    is the exact race `claims.json` `priorSet` describes; the convention held only after the
    rename.
14. **Second contamination wave (open at my last check; owned by L1 TabiR76 per Main).**
    `.ufo/waves/round-76/w1/R76Review1/receipts/` holds **30** more `.json` files of the receipt
    schema: 28 under `receipts/` carrying the expected (a) nonce (skipped by the walk) and 2 under
    `receipts/walk/` carrying nonce `tabi-r76-evil-dead`. Read-only enumeration now finds **48**
    schema receipts in the two walked trees (the 18 expected = 17 priors + (a), plus the 30).
    The (a) counter exits **1** with `prior-set-complete` naming
    `…/R76Review1/receipts/walk/evil-plain.receipt.json` (`/tmp/r76scribe-main2.json`, reproduced
    from the frozen counting command). **The walk is evadable:** it filters candidate files with a
    byte test (`b.includes('"tabi-chrome-cdp-dialog-r76"')`, `scripts/check-dialog-r76.mjs:219`)
    before parsing, so `…/R76Review1/receipts/walk/evil-escaped-schema.receipt.json`, whose schema
    is written `"tabi\u002dchrome\u002dcdp-dialog-r76"`, parses to the same schema and the same
    `tabi-r76-evil-dead` nonce but is never parsed by the walk (literal needle absent from its
    bytes; `json.load` yields schema `tabi-chrome-cdp-dialog-r76`). Renaming every file the counter
    names will therefore leave that one in place: a fix must enumerate by parsing, not by the
    counter's byte prefilter.

## Gates

- Note's measured table: **9/9 rows hold on 14/14 receipts** (`matrix.txt`, `derived.json`).
- Note's protocol citations: all locate; three range fixes (findings 3, 4, 6) and one attribution
  fix (finding 5).
- Lesson Gate quotes S202–S206: **7/7 locate at the stated lines, 7/7 ≤ 25 words** (19/5/2/6/1/9/5);
  S202 requires comment-marker stripping (`gate-review.md` §1).
- Counter on (a): exit 0, clean, 131 checks, 17 priors, priorSet sha256 `30f7418a…` at 05:04; the
  same command exits 1 at 05:11 with `prior-set-complete` naming the sibling's
  `R76Critic/F5-exec1.receipt.json` (finding 13), and exits 0 clean again after the rename at 05:12
  (`a-counter-after-fix.json`), and exits **1** again at the second contamination wave
  (`a-counter-second-wave.json`, finding 14). The red runs are tree-state artifacts, not changes in
  the receipt.
- Lesson Mistakes rows 1–7: each checkable claim verified, with the wording nits in finding 11.
- Admit/reject judgment: I agree with the Gate's admitted note (its listed measured claims) and with
  the rejected "no dialog open is a harmless no-op" (`gate-review.md` §3).

## Touched surfaces

- Written: `.ufo/waves/round-76/w1/R76Scribe/{report.md,note-review.md,gate-review.md,a-counter.json,matrix.txt,rederive.txt,derived.json,release-block-probe.mjs,release-block-probe.receipt.txt}`
  and `.ufo/waves/round-76/w1/R76Scribe.md` (the Report trailer copy).
- Scratch: `/fast/scratch/hyaku/tabi-r76/R76Scribe/` (probe profile + scripts), removed after the
  artifacts were copied.
- Read-only: lane tree, `.ufo/waves/round-76/**`, `corpus/**`, `scripts/**`, read-only `git show`
  / `git grep`.
- No installs (no pacman, no uv/npx); no host sysctl/service/boot/etc./usr/var change.

## Out of scope / not established

- Legs (b) and (d) of the predicate (R76Exec1 cold run; capability row + note integration) were not
  run or judged here; (a) and (c) status was taken as dispatched and only (a)'s counter was re-run.
  Finding 13 shows the tree state under which leg (b) as specified fails `prior-set-complete` on the
  five l1-nonce files unless they are passed as `--prior` or removed/renamed.
- The Page-domain-disabled leg, another-origin navigation, reload-time beforeunload and sticky
  activation were not measured; the note's "not measured" stands.
- The lesson's "26 witnesses" of R75Mut1 and the r73/r74 mutant inventories were not recounted.
- The probe receipt carries the schema `tabi-r76-scribe-release-block-probe`, not
  `tabi-chrome-cdp-dialog-r76`, and is saved as `.receipt.txt` per the wave convention, so the
  counter's `prior-set-complete` walk does not read it (`scripts/check-dialog-r76.mjs:216-219`
  reads only `*.json` of the receipt schema).

## Artifacts

- `.ufo/waves/round-76/w1/R76Scribe/note-review.md` — statement-by-statement review with proposed
  wording fixes.
- `.ufo/waves/round-76/w1/R76Scribe/gate-review.md` — per-row quote/word-count table, row defects,
  admit/reject, lesson-claim checks.
- `.ufo/waves/round-76/w1/R76Scribe/a-counter.json` — counter output on the (a) receipt (05:04);
  `a-counter-after-fix.json` — the same run after the first rename (05:12, exit 0);
  `a-counter-second-wave.json` — the same run at the second wave (exit 1, `prior-set-complete`).
- `.ufo/waves/round-76/w1/R76Scribe/matrix.txt`, `rederive.txt`, `derived.json` — derivation
  outputs (14 receipts x 10 legs).
- `.ufo/waves/round-76/w1/R76Scribe/release-block-probe.receipt.txt` + `release-block-probe.mjs` —
  the independent release/block measurement (seat artifact, not a lane instrument).
