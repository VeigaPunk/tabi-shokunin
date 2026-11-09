# R93Critic2 — procedure sensitivity of C1 (critic-2)

## Method
Copied pinned driver (sha256 `a0dedd…9a4a0`, verified) to `R93Critic2-probe.mjs`
(probe sha `ebefe6…f4d3` for base/a/b/d, `76e739…7281` after c-guard fix; lane
driver never edited). One `--variant` per run, `--reps 3`, ports 19421/19422/19423,
one variant at a time, scratch `/fast/scratch/hyaku/tabi-r93/R93Critic2/`, rc 0 all.
Chromium 155.0.8059.84, fresh browser per leg, 6 legs per run (X-1,S-1,X-2,S-2,X-3,S-3).
Base probe run reproduces the frozen law exactly (X: `describePage=#document`,
pierce 0, cross error `Node is not a file input element`, after `[]`, final
`[[tabi-r93-answer.txt,22]]`; S: INPUT/pierce 1/final file), so the harness is sound.

## Per-variant X legs (S legs identical in shape: INPUT/pierce 1/final file, 3/3 each)
| variant | describePage.nodeName+attrs | crossAnswer.error | filesAfterCross | final childFiles |
|---|---|---|---|---|
| base (3) | `#document`, `[]` | `Node is not a file input element` | `[]` | `[[tabi-r93-answer.txt,22]]` |
| (a) DOM.enable+DOM.getDocument before click (3) | `#document`, `[]` | same | `[]` | same |
| (b) nodeId via pushNodesByBackendIdsToFrontend (3) | `#document`, `[]` | same (`pushError null`, `nodeIds [1]`) | `[]` | same |
| (c) iframe answer FIRST, then cross (3) | `#document`, `[]` | same | `[[tabi-r93-answer.txt,22]]`* | same |
| (d) +5 elements before iframe (3) | `#document`, `[]` | same | `[]` | same |

* (c) `filesAfterCross` is order-confounded: the correct answer already delivered
  the file before the cross call; nothing was read "after a failed cross" there.

Variant (a) extra readout: `DOM.enable` ok, `DOM.getDocument` root `#document`
(6/6 legs incl. S). B was `2` on every X leg in every variant.

## Notable non-findings
- The `#document` name is not a procedure artifact: it survives enabling the DOM
  domain before the click, survives switching the cross handle to the
  `pushNodesByBackendIdsToFrontend` nodeId (no `DOM.enable` needed — push returned
  `[1]`), survives reversed answer order, and survives extra parent elements.
- The exact cross error string `Node is not a file input element` held in all 15
  X cross calls (base,a,b,c,d) including the nodeId path and reversed order.
- Final correct-session delivery held 15/15 X legs and 15/15 S legs (fixed c run).

## Discarded probe bug (disclosed, not a law reading)
First (c) run had a guard bug (`if (VARIANT!=='c')` skipped S-leg answers) so its
S finals read `[]`. Fixed to `if (!(VARIANT==='c' && csid!==ps))` and re-ran
(nonced `tabi-r93-critic2c2`); X legs of both c runs agree exactly. The firstdraft
receipt is preserved (`R93Critic2-var-c-firstdraft-receipt.json`) and excluded
from all counts above.

## Stable teaching vs procedure-specific
Stable: `#document`-on-page, exact not-a-file-input error, empty-after-cross in
pinned order, INPUT-on-chooser-session, S-arm INPUT. Procedure-specific: only the
`filesAfterCross` reading in order (c) — exactly the frozen limit 4 carve-out
("reverse order is unmeasured"). Nothing else moved when its procedure variable moved.

## Relation to frozen wording
Frozen C1 binds the pinned procedure; declared limits 3–4 already fence off `#document`
identity and answer order. No interpretable leg falsified any stated clause
(24/24 interpretable legs). Order-(c) un-readability and the S-guard artifact
are not wording falsifiers.

Tooling: none installed; chromium/node pre-existing. pgrep on 19423 empty after
every run; scratch removed after copying receipts to `w1/`.

VERDICT C1: neutral
