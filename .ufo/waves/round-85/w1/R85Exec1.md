# R85Exec1 — leg (a): two independent cold runs of the frozen r85 driver

Milestone: leg (a) — two independent cold runs of the frozen r85 driver, scored by the frozen counter.
Seat: R85Exec1.

## Driver SHA256 (measured)

`sha256sum scripts/chrome-cdp-showpicker-round85.mjs` =
`1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee`
(matches the received driverSha256 pin and the scored receipt's driverSha256).
No tool installs/updates performed (none needed). No subagents dispatched (no labrat probe needed;
both runs completed directly). Paused pacman transactions respected; nothing installed.

## Disk before / after

`df -h /fast` before the runs: `/dev/nvme1n1p2 804G 470G 334G 59% /fast`.
After both runs (before scratch deletion): `804G 472G 332G 59% /fast`.
Scratch `/fast/scratch/hyaku/tabi-r85/R85Exec1/` was removed after scoring, per assignment.

## Run 1 — cold1

Command (exact, from scratch dir):
`node scripts/chrome-cdp-showpicker-round85.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin
 --nonce tabi-r85-cold1-dbecb1a18905 --scratch /fast/scratch/hyaku/tabi-r85/R85Exec1/run1
 --out /fast/scratch/hyaku/tabi-r85/R85Exec1/run1/receipt.json
 --http-port 19600 --cdp-port 19601 --child-port 19602`

- Driver exit code: 0 (`EXIT=0`). 24 legs, failures: [].
  (Two `MaxListenersExceededWarning: 11 SIGINT/SIGTERM listeners` warnings on stderr — benign.)
- Receipt: `/fast/scratch/hyaku/tabi-r85/R85Exec1/run1/receipt.json`
  (deleted with scratch after scoring; all measured values below are transcribed from the live receipt.)
- Receipt nonce: `tabi-r85-cold1-dbecb1a18905`; receipt fixture.sha256:
  `2a6091304d734b1cbcbdd2b6db9f945dc6472e2e9764bac1526f07fb38b9c199`
  (fixture sha differs from run 2 only because the nonce is embedded in the generated fixture).
- Scored with the frozen counter exactly as specified
  (`--expect-driver-sha256 1690c63d…`, `--expect-nonce tabi-r85-cold1-dbecb1a18905`,
  `--expect-fixture-sha256 2a609130…`, `--prior-set .ufo/waves/round-85/controls/c1/prior-set.txt`, `--json`):
  - Counter exit code: 1.
  - Verdict: `findings`. checkCount: 87.
  - 86 of 87 checks true. The single failing check is `prior-set-complete: false`, with the sole finding:
    `receipts of schema tabi-chrome-cdp-showpicker-r85 in the round-85 wave/evidence trees, not the receipt
    under test (path ../../../../../fast/scratch/hyaku/tabi-r85/R85Exec1/run1/receipt.json), not exempted
    by sha256 and not among the priors: .../corpus/evidence/round85/chromium-showpicker/receipt.json`
    (the L1 scored receipt, sha256 `d5b1cb25…746a7`, nonce `tabi-r85-l1-dbecb1a18905`, is present in the
    evidence tree and is not named by `prior-set.txt`, which lists only
    `.ufo/waves/round-85/controls/c1/probes/prior1.json`, sha256 `d6ab237f…14ef2f4c2`).
    This is the counter truthfully refusing to call a run "clean" while an in-tree receipt is not declared a
    prior. It is a prior-set declaration gap, NOT a measurement failure — all 24 legs, all laws
    (gesture, activation, mode, cross-origin-nonfile, order, same-origin-no-picker, trust, teardown, replay,
    etc.) and the strict replay/counter checks pass. priorSet: 1; limit `refused: false`
    (absMatched 0 vs absNeed 38, gapMatched 0 vs gapNeed 2).

## Run 2 — cold2

Command (exact, from scratch dir):
`node scripts/chrome-cdp-showpicker-round85.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin
 --nonce tabi-r85-cold2-dbecb1a18905 --scratch /fast/scratch/hyaku/tabi-r85/R85Exec1/run2
 --out /fast/scratch/hyaku/tabi-r85/R85Exec1/run2/receipt.json
 --http-port 19610 --cdp-port 19611 --child-port 19612`

- Driver exit code: 0 (`EXIT=0`). 24 legs, failures: [].
  Same benign MaxListeners warnings.
- Receipt nonce: `tabi-r85-cold2-dbecb1a18905`; receipt fixture.sha256:
  `d4934fcd5cb5bdcaae47eec6c952683595bf18c6dcefbfb4908c987ca5d486a8`.
- Counter (same invocation with the cold2 nonce/fixture sha):
  - Counter exit code: 1. Verdict: `findings`. checkCount: 87.
  - Identical 86/87: only `prior-set-complete: false` fails, with the identical finding (pointing at the
    L1 evidence-tree receipt `d5b1cb25…746a7`). priorSet: 1; limit `refused: false`
    (absMatched 1 vs absNeed 38, gapMatched 0 vs gapNeed 2).

## The six new r85 legs (both runs, transcribed verbatim)

`showPicker` is the recorded showPicker result; `activationBefore/After` are `navigator.userActivation`
states before/after; chooser count = choosers opened (firstChooserBackendNodeId,
secondChooserBackendNodeId and the counter's nodeReport are `null` / `[]` for all six legs in both runs
— i.e. ZERO choosers).

| Leg | Run | showPicker | activationBefore | activationAfter | Choosers |
|---|---|---|---|---|---|
| sp85-same-origin-tel | cold1 | `{ok:false, name:"NotAllowedError", message: "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."}` | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-tel | cold2 | same NotAllowedError (identical) | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-search | cold1 | same NotAllowedError | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-search | cold2 | same NotAllowedError | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-text | cold1 | same NotAllowedError | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-text | cold2 | same NotAllowedError | `{isActive:false, hasBeenActive:false}` | `{isActive:false, hasBeenActive:false}` | 0 |
| sp85-same-origin-tel-activated | cold1 | `{ok:true, ret:"undefined"}` | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |
| sp85-same-origin-tel-activated | cold2 | same (identical) | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |
| sp85-same-origin-search-activated | cold1 | `{ok:true, ret:"undefined"}` | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |
| sp85-same-origin-search-activated | cold2 | same (identical) | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |
| sp85-same-origin-text-activated | cold1 | `{ok:true, ret:"undefined"}` | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |
| sp85-same-origin-text-activated | cold2 | same (identical) | `{isActive:true, hasBeenActive:true}` | `{isActive:false, hasBeenActive:true}` | 0 |

This matches the frozen law on all six legs:
- same-origin WITHOUT transient activation -> NotAllowedError (tel/search/text, no choosers);
- same-origin WITH activation -> `showPicker()` returns undefined and ZERO choosers open
  (tel/search/text -activated);
- cross-origin -> SecurityError (existing r84 legs, e.g. sp84-cross-origin-tel/search/text child
  `{ok:false, name:"SecurityError", message: "… showPicker() called from cross-origin iframe."}`,
  identical in both runs).

## Do the two runs agree on the six records?

YES — fully. For all six legs, `showPicker`, `activationBefore`, `activationAfter`,
`firstChooserBackendNodeId`, `secondChooserBackendNodeId`, `gesture`, `stateAfter`, `events` and the full
showPicker payload are identical between cold1 and cold2 (compared programmatically against the live
receipts before deletion; every equality check printed `True`). The only differences between the two
receipts are the expected run-identity fields: nonce, fixture-derived port/origin and upload paths
(`run1/upload-…` vs `run2/upload-…`), and the counter's replay absMatched (0 vs 1, both far under the
refusal threshold of 38).

## Risks / blockers

- Both counter runs are verdict `findings` (exit 1) solely because `prior-set-complete` is false: the L1
  scored receipt `corpus/evidence/round85/chromium-showpicker/receipt.json` (sha256 `d5b1cb25…746a7`)
  sits in the wave/evidence tree but is not listed in the frozen `prior-set.txt`
  (which names only `controls/c1/probes/prior1.json`). The frozen counter is behaving exactly as
  designed — it refuses to call a run clean while an in-tree same-schema receipt is not declared a prior.
  I did not (and per bounds must not) amend the prior set or any pin; the correction — declaring the
  scored receipt a prior (or moving the check out of the scanned tree) — is the L1/integration owner's
  call. This seat's measured facts: every measurement, law and replay check passes on both cold runs.
- No other blockers: both driver runs exit 0 with 24/24 legs error-free; Chromium/host checks
  (`host-chromium`, `host-node`, `host-argv`, `teardown-closure`, `run-window`) all pass.
- Scratch was deleted after transcription; no files remain outside the lane tree except this report.
  No commits, no mutating git/jj commands, no writes outside the lane tree / scratch / this report path.
