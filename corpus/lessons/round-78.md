# tabi — round 78

L1 `TabiR78`. Base `ae2dc25fe8b4db70d2ef8a83804bc5545fbc35ff` (lane clean, `local=remote`, `ahead=0
behind=0`). Round 77 was **not admitted** (`round-77-verifier-spotcheck.md`: C1 NOT VERIFIED, quality
harmed); its eight routed defects are the spine of this round. Claims: C1 coverage — capability
`chromium-file-chooser-linux`, generation r78 (round-77 routed defects 1–3 + QUALITY 150); C2
calibration — capability-row status, counted by a committed instrument.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-78/census/start.txt`; 213 rows at base). End: see the report.

## Gate

### Sources — new rows

Both fetched by the L1 on 2026-11-07 from the live page, http 200, bytes and sha256 in
`.ufo/waves/round-78/sources/FETCH.txt` (raw HTML staged beside it, not edited).

- **S214** Playwright `class FileChooser` — `https://playwright.dev/docs/api/class-filechooser`.
  Located quotes: "Returns input element associated with this file chooser." (`fileChooser.element`)
  and "Returns whether this file chooser accepts multiple files." (`fileChooser.isMultiple`). Tier A
  for Playwright's own client-side contract; it does not evidence Chromium behaviour.
- **S215** Puppeteer `Page.waitForFileChooser()` — `https://pptr.dev/api/puppeteer.page.waitforfilechooser`.
  Located quote: "This must be called before the file chooser is launched. It will not return a
  currently active file chooser." Tier A for the arming rule at that API page.

Admitted: `corpus/knowledge/chromium-file-chooser-runtime-round-78.md` (cites S208–S215; states what
the page can bind — descriptor, mode, frame tree — and what a receipt cannot prove).

Rejected (with flip conditions):

- **"The chooser event's `backendNodeId` identifies the element across runs"** — reject: measured id
  drift on one pinned driver (`#s` 5→4, `#m` 7→10) with every other per-leg field identical; the id is
  a serialization artifact and the r78 counter reports it without requiring a literal. Flip: a tag
  where the id is stable across 25 honest runs.
- **"`fileChooser.element` (S214) proves the CDP id binding"** — reject: the client property is its own
  object model (it resolves the node when needed), not evidence of stability; client-side usage only,
  so the CDP side rests on the measured receipts, not on S214.
- **"`mainFrameId` from the driver is enough"** — reject: that field was self-referential in r77
  (the counter compared events to a value the same driver wrote); r78 anchors it in the driver's own
  `Page.getFrameTree` result and checks parent and url. Flip: a driver whose frame-tree call is
  removed or unaudited.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

Correction carried from the r77 closure (routed defect 5): S213's row was appended in round 77 without
its `## Gate` record. Re-opened this round at
`https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts`
(http 200, 6124 B, sha256 `c86ed958…c445`, matching the staged copy): lines 134-136 read "The zero-length
array is a special case, it seems that / DOM.setFileInputFiles does not actually update the files in
that case, so / the solution is to eval the element value to a new FileList directly." — the quote
supports the row's `teaches` as written.

### Admitted / rejected claims

C1 admitted as the round's coverage move (see `claims.json` / `SCORECARD.md` for the frozen predicate,
counter, pins and kill rule). C2 admitted as the calibration move (instrument
`scripts/check-capability-status.mjs`, before state `lesson-proof/c2-before.json`).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `scope` — an instrument wrote its own JSON into the tree it walks, so it parsed a half-written file and reported `prior-set-unparsable` on itself | `lesson-proof/self-write-collision.json` (p1's first counter run, exit 1, the finding names `probe/p1.counter.json`) | none at the time — QUALITY 151 (new) | `run-prefreeze-gates.sh` writes under `$HYAKU_SCRATCH` and copies `pf/out/pf-*.json` after each run; the same pass then reports the walk clean |
| `survivor` — the r78 walk's exemption is a PATH, while the battery keeps the source receipt out of the prior set, so all 378 cases also reported `prior-set-complete` on the first run | `lesson-proof/prior-set-path-exemption.txt` (`cases 378 passed 13 allOk false`) | the battery's own `extra` rule (QUALITY 131: every unexpected id fails the case) | an explicit `--tree-exempt <source receipt>` interface used only by the pre-freeze harness/gates; contradictory-nonce and escaped-schema cases remain outside it; selftest case `tree-exempt-absent` fails without the flag (QUALITY 153) |
| `stale-premise` — the 34 R77Mut1 witnesses were imported by presence, not by kind; three `must-accept` witnesses became refusal cases with `expect: null` and crashed the battery | `lesson-proof/witness-import-crash.txt` (verbatim `TypeError: Cannot read properties of null (reading 'startsWith')`) | none — QUALITY 154 (new) refuses such a set before any run | witnesses re-classified by `kind`; the battery now refuses a refusal case without an expected finding id (exit 2), and the corrected set runs 398/398 |
| `number-drift` — a bulk rename missed template-string ids (`leg-${leg}-opened`), leaving 15 per-leg `opened-mode` ids without a case | first battery coverage summary `coverageGap` listed all 15; fixed by rewriting the per-leg generator and adding a cross-input id case | the battery's coverage rule (QUALITY 132) — it caught it before the freeze | generator emits `opened-mode` and `opened-node-cross` cases; `coverageGap: []` on the final run |
| `scope` — the r78 receipt's cross-generation prior was initially absent: the prior set held only r78 receipts, so a relabel of the r77 scored receipt (same 15-leg shape) would have been inside the limit | `lesson-proof/c1-nowork.json` (r77 receipt under the r78 counter: 9 findings — schema/pin-derived, but no replay source) | QUALITY 138/140 (prior set carries every committed receipt of the shape) | `corpus/evidence/round77/chromium-file-chooser/receipt.json` appended to the prior set before the freeze; the honest p1/s1 counters stay clean with 9 priors each |
| `survivor` — a carried bracket derived by small shifts (0.3-1.5 ms) landed a moved prior event within TOL of another event of the receipt under test, so `accept-prior-abs-below-threshold` over-counted (abs 40 of need 40) and failed closed on p3/s2; a carried witness (`accept-own-gap-50.0`) duplicated the existing 50.1 accept because a 50.0 ms own gap can compute below the 50 ms floor by float subtraction | `lesson-proof/bracket-accept-overshoot.json` (both errors verbatim) | QUALITY 149 (the placement guard states the decisive property and fails closed) — it caught both | the accept side moves non-kept events >= 1000 ms (`keepExactFar`), the refuse side declares `abs >= need` (`placed(p, 'need', ...)`), and the duplicate witness is merged with a comment; the final pass is green on all 7 receipts |
| `stale-premise` — the r78 driver fork carried r77's LEG-SHAPE block with literal backendNodeIds and its predicate compared them, so the producer refused an honest cold run (`pick-multiple` 7->10; `producer-verdict` only) although the counter's new mode-only leg check passed all 186 checks — the r77 defect survived one layer down, in the producer's self-check | `lesson-proof/driver-shape-id-pin.json` (the diff is the only field; driver exit 1, counter 1 finding) | the round's own leg (b) (cold-run acceptance) caught it before any scored verdict; QUALITY 150 covers the rule but not the producer layer | LEG_SHAPE `opened` = modes only and the predicate compares a mode projection; driver re-pinned to 0ae89d92..., every pre-freeze receipt re-produced and the gate pass re-run BEFORE the new digests commit |
| `survivor` — replacing a fragile accept case (its placement guard failed on p3/s2) removed the only case that dies when the pair tolerance widens 0.05 -> 0.06; kill power left `M-timeline-tol-0.06` alive with every other mutant killed | `lesson-proof/tol-witness-loss.txt` (76 semantic mutants, 75 killed, survivor named) | QUALITY 143 (every tolerance bracketed on both sides) read through kill power's survivor list — it caught it | `accept-prior-retimed-0.051-scattered`: `absNeed` scattered prior events sit exactly 0.051 ms out, UNROUNDED (q() rounds 0.051 to 0.1, which no tolerance would catch), so it must accept at 0.05 and is refused at 0.06; kill power holds |

Sweep for further mistakes: `ls .ufo/waves/round-78/lesson-proof/` (every red state above);
`node .ufo/waves/round-78/controls/c1/prefreeze-summary.mjs` re-reads every gate output and fails
closed.

## Corrections (round-78 wave, after D `bf94adaa`)

1. **The limit sentence states the refusal threshold, not the escape minimum.** The counter refuses when
   `absMatched >= absNeed` OR `gapMatched >= gapNeed`; a forgery therefore escapes when
   `absMatched < absNeed` AND `gapMatched < gapNeed`, i.e. after editing `N_p - absNeed + 1` events and
   `G_p - gapNeed + 1` gaps — for the 79-event / 11-gap priors **40 events and 3 gaps**, not 40 and 9.
   R78Critic's F3 (identity relabel + 40 events + 3 gaps) scores clean 186 and is outside the sentence as
   frozen (`.ufo/waves/round-78-seats/R78Critic/counter-f3.json`). The frozen text is not edited; the
   correct sentence is this one, and r79 prints the escape minimum beside the threshold.
2. **The node-id relabel limit is confirmed:** a consistent relabel at every occurrence is clean
   (F5, `counter-f5.json`), and the receipt still proves the page element through `fixture-descriptors`,
   `mode-law` and `node-binding-law`.
3. **The scored state the critic measured was superseded.** Their §1 (leg (c) false) measured the
   D `d986c273` battery (397 cases, two gap cases failing on a 12-gap receipt); under the final
   D `bf94adaa` the battery is 400/400 `allOk` and kill power holds (186/186 force-true, 76/76 semantic,
   no survivors) — `scored/c1-negatives-a.json`, `scored/c1-killpower-a.json`. The gap cases are now
   count-aware and the floor has an accepting side (`accept-own-gaps-at-floor`).
4. **Cold-run ledger.** `scored/cold-runs.txt` lists the five committed cold runs (cold1, R78Exec1,
   R78Exec2 d1–d3), each counter exit 0 clean 186 — leg (b) as frozen.
