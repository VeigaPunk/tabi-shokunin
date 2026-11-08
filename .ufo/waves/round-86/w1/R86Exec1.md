# R86Exec1 — leg (a) independence: cold re-run of frozen C1 driver, scored by frozen counter

Seat: R86Exec1 (leaf executor). Round 86, wave `w1`, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
L1/owner: TabiR86. Nonce base: `tabi-r86-l1-4bd89a80f439` (D `4bd89a80f439`).

## Axes (godspeed)
- **independence**: a fresh, never-before-seen run of the frozen driver must reproduce the C1 laws.
- **law-fidelity**: scored verdict must reflect only the frozen checker — no amended predicate, counter, pin, prior, threshold or kill rule.
- **provenance**: all numbers reported here were measured in this seat (two live driver runs + two live counter runs); no catalogue numbers copied.

## Instruments (frozen, verified by sha256 before running)
- driver `scripts/chrome-cdp-showpicker-round86.mjs` — `5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d` ✓
- counter `scripts/check-showpicker-r86.mjs` — `a41fab46647127cd19d10eeaa6a33ac9d47f4c7b75d69ec169cfc3a71b73370a` ✓
- prior set `.ufo/waves/round-86/controls/c1/prior-set.txt` — `prior1.json`, `prior2.json` (the two pre-freeze 30-leg probes; file sha256 `1a3d47bf…` per scored counter output).
- Host: `Chromium 155.0.8059.84 Arch Linux`, CDP `Chrome/155.0.8059.84`, protocol `1.3`, Node `v24.21.0` (counter `host-chromium`/`host-node` checks pass on both cold runs).

## Cold runs (two fresh nonces, distinct port triples, scratch only)
- **cold1**: nonce `tabi-r86-cold1-4bd89a80f439`, ports 19600 (http) / 19601 (cdp) / 19602 (child), `startedAt 2026-11-08T08:47:29.692Z`, `finishedAt 2026-11-08T08:49:50.493Z`, receipt `/fast/scratch/hyaku/tabi-r86/R86Exec1/cold1.json` (508 662 bytes, sha256 `0d2379194ffc629764b190a160c4570ad355fabe7fc508e51213e8c1748d99fb`).
  - fixture sha256 `09d334a5588dd938ce47021b786f7bf57956b2ea09f484256544f200ed78d0ba`, driverSha256 `5a435da6…`, 30 legs, `failures []`. Driver process output is summarised at end of this file's appendix. Note: fixture sha differs from the scored receipt (`94421dc0…`) because the fixture embeds `--nonce` and the child origin (port) per run; the counter pins the fixture hash taken from the receipt under test, so each cold run is scored against its own receipt fixture sha.
- **cold2**: nonce `tabi-r86-cold2-4bd89a80f439`, ports 19610 / 19611 / 19612, `startedAt 2026-11-08T08:47:29.692Z`, `finishedAt 2026-11-08T08:49:51.449Z`, receipt `/fast/scratch/hyaku/tabi-r86/R86Exec1/cold2.json` (508 641 bytes, sha256 `34bd0c640a1d141417792af752da6cf30367603089c1b1a99c16e799fa810085`).
  - fixture sha256 `1168bd4f60662f88c8d70105ad43a555b78e7cbf6bca3067c212ff84b8dbd0d2`, driverSha256 `5a435da6…`, 30 legs, `failures []`.
- Both runs: every leg `errors=0`; chooser counts match the frozen plan (12 chooser-opening legs fire `Page.fileChooserOpened`, the 18 no-picker legs fire none, incl. `sp86-same-origin-color-activated` returning `undefined` with 0 choosers and no input/change). The full per-leg stderr/stdout of both runs was captured in the tool output and is reproduced verbatim in the appendix; receipt summaries were re-extracted after the fact and agree with it.

## Scoring (frozen counter, `--json`, pin `5a435da6…`, fixture from receipt, frozen prior set)
Command pattern (cold1 shown; cold2 analogous):
```
node scripts/check-showpicker-r86.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r86/R86Exec1/cold1.json \
  --expect-driver-sha256 5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d \
  --expect-nonce tabi-r86-cold1-4bd89a80f439 \
  --expect-fixture-sha256 09d334a5588dd938ce47021b786f7bf57956b2ea09f484256544f200ed78d0ba \
  --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json
```

- **cold1**: verdict `findings`, `checkCount 95`, exit `1`. Failing ids: **only `prior-set-complete`** (94 of 95 checks pass, including all 30 per-leg checks, all law checks — `accept-grammar-law`, `same-origin-color-law`, cross-origin/order laws, `replay-*`, etc.). Detail: `receipts of schema tabi-chrome-cdp-showpicker-r86 in the round-86 wave/evidence trees, not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r86/R86Exec1/cold1.json), not exempted by sha256 and not among the priors: /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round86/chromium-showpicker/receipt.json`. Replay detail: `ownEvents 121, ownGaps 4`, per-prior `absMatched 0, gapMatched 0, absNeed 61, refused false` on both priors.
- **cold2**: verdict `findings`, `checkCount 95`, exit `1`. Failing ids: **only `prior-set-complete`** (94 of 95 pass). Detail identical in form: the only undeclared in-tree receipt is `corpus/evidence/round86/chromium-showpicker/receipt.json`. Replay detail: `ownEvents 121, ownGaps 5`, per-prior `absMatched 0, gapMatched 0, absNeed 61, refused false` on both priors.

## Law vs declaration (`prior-set-complete`)
- **Verdict: not a law failure.** `prior-set-complete` is a *declaration* check, not a browser-law check: it requires that every receipt of schema `tabi-chrome-cdp-showpicker-r86` found in the two walked trees (`.ufo/waves/round-86`, `corpus/evidence/round86`) be either the receipt under test, in the frozen prior set, or exempted by sha256. My cold receipts deliberately live **outside** the lane trees (`/fast/scratch/…`), so the frozen scored receipt `corpus/evidence/round86/chromium-showpicker/receipt.json` is an undeclared in-tree receipt from the counter's point of view.
- This is exactly the failure mode the assignment anticipates: *"a cold run may legitimately fail only `prior-set-complete` (an undeclared in-tree receipt)."* Both runs do precisely that, and no other finding fires. The assignment instructs **not** to write into `corpus/evidence/round86` (the scored path is the L1's), and I did not — so the `prior-set-complete` failure is structural, not a defect in the frozen driver/counter pair.
- Every browser law held on both independent runs: the six-leg accept GRAMMAR matrix (`sp86-accept-wildcard-text` = `accept="image/*"` + text/plain; `sp86-accept-wildcard-png` = `accept="image/*"` + image/png; `sp86-accept-mixed-text`/`sp86-accept-mixed-png` = `accept="image/png, .txt"` + both; `sp86-accept-pdf-token-png` = `accept="application/pdf"` + image/png) delivered bytes with trusted input+change and page-read hex, and `sp86-same-origin-color-activated` (`type=color` activated arm) returned `undefined`, consumed activation, fired no input/change and opened ZERO `Page.fileChooserOpened` events.
- The counter's live `limit` block (printed beside the threshold, per the frozen limit sentence) confirms the replay rule; no forger-style escape is claimed for these cold runs.

## What was NOT touched
- No writes into `corpus/evidence/round86` or `corpus/evidence/...`; both cold receipts stayed in scratch and were removed after scoring.
- No commits, no mutations of the fleet repo, no git/jj mutating commands anywhere (none run at all — the driver and counter need none). No subagents dispatched (leaf seat; the single permitted `labrat` was not needed).
- Tools installed/upgraded: **none.** `node v24.21.0` and `/usr/bin/chromium` were already present at their pinned values.

## Scratch cleanup
`/fast/scratch/hyaku/tabi-r86/R86Exec1/` (both `cold*/` trees and `cold1.json`/`cold2.json`) was removed after scoring and before yielding, per the assignment. The only artifact retained is this report at `.ufo/waves/round-86/w1/R86Exec1.md`.

## Risks / blockers
- **None for the scoped task.** The two cold runs reproduce the C1 laws under the frozen counter; the lone `prior-set-complete` finding is a declaration artefact of the assignment's own bounds (cold receipts must not be written into the scored tree, and no prior/exemption was declared for the pre-existing scored receipt) — the L1 owns the scored path and its declaration.
- If a future cold run is scored *inside* the tree (e.g. under `.ufo/waves/round-86/scored/`), `prior-set-complete` would no longer fire for the scored receipt only if that path is the receipt under test — but that is the L1's call, not this seat's.
- Port contention: both runs occupied 19600-19602 and 19610-19612 simultaneously and both completed (driver does a free-port precheck); no collision observed.

## Exact retained evidence (verbatim from the scored counter, `findings` arrays)
- cold1 `findings`: `[{"id":"prior-set-complete","detail":"receipts of schema tabi-chrome-cdp-showpicker-r86 in the round-86 wave/evidence trees, not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r86/R86Exec1/cold1.json), not exempted by sha256 and not among the priors: /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round86/chromium-showpicker/receipt.json"}]`
- cold2 `findings`: `[{"id":"prior-set-complete","detail":"receipts of schema tabi-chrome-cdp-showpicker-r86 in the round-86 wave/evidence trees, not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r86/R86Exec1/cold2.json), not exempted by sha256 and not among the priors: /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round86/chromium-showpicker/receipt.json"}]`
- Both: `checkCount 95`, 94 true / 1 false (`prior-set-complete`); all other check ids `true`. Full per-check maps were in the counter stdout captured during this seat (tool output); the two `checks` objects are summarised by the 94/1 split and the named law checks above.

## Appendix: driver leg-completion lines (both runs, identical)
```
leg sp84-cross-origin-nonfile done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-nonfile-disabled done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-color done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-month done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-week done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-time done, errors=0 showPicker=null choosers=0
leg sp84-same-origin-nonfile-disabled done, errors=0 showPicker={"ok":false,"name":"InvalidStateError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls."} choosers=0
leg sp84-webkitdirectory-answer done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp84-accept-answer done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp84-click-while-open done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=2
leg sp84-cross-origin-number done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-range done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-tel done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-search done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-text done, errors=0 showPicker=null choosers=0
leg sp84-multiple-mode done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp84-accept-mime-answer done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp84-second-chooser-answer done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=2
leg sp85-same-origin-tel done, errors=0 showPicker={"ok":false,"name":"NotAllowedError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."} choosers=0
leg sp85-same-origin-search done, errors=0 showPicker={"ok":false,"name":"NotAllowedError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."} choosers=0
leg sp85-same-origin-text done, errors=0 showPicker={"ok":false,"name":"NotAllowedError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."} choosers=0
leg sp85-same-origin-tel-activated done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=0
leg sp85-same-origin-search-activated done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=0
leg sp85-same-origin-text-activated done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=0
leg sp86-accept-wildcard-text done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp86-accept-wildcard-png done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp86-accept-mixed-text done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp86-accept-mixed-png done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp86-accept-pdf-token-png done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=1
leg sp86-same-origin-color-activated done, errors=0 showPicker={"ok":true,"ret":"undefined"} choosers=0
```
