# R88Review2 — new-leg attribution attack (sp88 ×3)

Seat: R88Review2 (godspeed). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base f16f992d, scored receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` (fixture sha256 `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`, nonce `tabi-r88-l1-86f1dcec`, driver `8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4`). Frozen counter `scripts/check-showpicker-round88.mjs` (pin `3224747613008046907f88332e1054ff8f364fab9763e88868c905f5829c6f79`). Scratch `/fast/scratch/hyaku/tabi-r88/R88Review2/` removed on yield.

## What the three legs contain (ground truth, from the scored receipt)

| leg | target | kind | top `fixtureInputs[].accept` | per-leg `fixtureInputs[].accept` | delivered |
|---|---|---|---|---|---|
| `sp88-accept-case-png` | `ac` | `showpicker-answer` | `IMAGE/PNG` | `IMAGE/PNG` (21-entry mirror of top) | `tabi-r88-b.png` 21 B `image/png` hex `89504e470d0a1a0a746162692d7238332d706e670a` |
| `sp88-accept-audiovideo-text` | `au` | `showpicker-answer` | `audio/*,video/*` | `audio/*,video/*` | `tabi-r88-a.txt` 22 B `text/plain` hex `746162692d7238332d616e737765722d616c7068610a` |
| `sp88-accept-mimeparam-png` | `amc` | `showpicker-answer` | `image/png;q=0.9` | `image/png;q=0.9` | `tabi-r88-b.png` 21 B `image/png` |

Each leg is its own element in **two places**: top-level `r.fixtureInputs` (21 descriptors) and every leg's `leg.fixtureInputs` (identical 21-descriptor array copied per leg). `fixture.patch.body` also embeds the raw HTML: `<input type="file" id="ac" accept="IMAGE/PNG">`, `<input type="file" id="au" accept="audio/*,video/*">`, `<input type="file" id="amc" accept="image/png;q=0.9">`.

Binding in the counter (`check-showpicker-round88.mjs:741–763` GRAMMAR + `acceptShape` + `LEG_SHAPE`):

- `PLAN` binds leg→target, kind, intercept, priorClick, gesture and `files[0]` (png/txt). `plan-frozen` checks `{name,kind,target,intercept,priorClick,gesture}`.
- `LEG_SHAPE[leg]` (via `check('leg-'+name)` at line 653) binds per leg: event `seq` (8 events ending `read@<target>`), `trusted`, `act`, `xy`, `files` (input/change/read triples with `[name,size,type]`), `opened` (`selectSingle`), and full `state` (`{..., [target]: [[name,size,type,'']]}`).
- The GRAMMAR loop (line 760) additionally binds: `answer.files === [f.name]`, `answer.setParams.files[0]` basename, `setParams.backendNodeId === nodeReport[name][0]`, `setResult {}`, `setError null`, `stateAfter[target] === [[f.name,f.size,f.type,'']]`, exactly one `read` event with `ret === 'hex:'+f.hex`, and `r.fixtureInputs.find(id===target).accept === accept` (exact string).
- `mode-law` (line 683) reads `r.fixtureInputs.find(id===p.target).multiple` → expects `selectSingle` (all three targets are `multiple:false`).
- `fixture-descriptors` (line 833) checks `same(r.fixtureInputs, FIXTURE_INPUTS)` — the exact 21-descriptor snapshot including the three new rects (100/300/500 @ 960) and accept strings.

## Method

20 single-change mutations against a scratch copy, scored with the frozen counter. A scratch receipt outside the walked trees trips `prior-set-complete` (the walk finds the scored original inside `corpus/evidence/round88`); exempting the scored hash via `--tree-exempt-sha256 8fd42735b5ba37d7e17c44c5f855d0632e526598b63bf9919bb1337171b79d77` restores a clean baseline (P1-baseline-exempt: exit 0, clean, checkCount 102). All findings below use that exempted baseline unless noted.

## Caught vs. not caught

### Swaps between two sp88 legs — all caught, but via state, not via accept

- **swap `stateAfter` `ac`↔`au`** (P1-swap-state): exit 1. `leg-sp88-accept-case-png`, `leg-sp88-accept-audiovideo-text`, `accept-grammar-law`, `no-selection-law` (dismiss-state mismatch). ✔ caught.
- **swap `stateAfter`+`stateAfterDismiss` `ac`↔`amc`** (Q1): exit 1. `leg-*` ×2 + `accept-grammar-law`. ✔ caught (both deliver PNG, so only the target key in `state` distinguishes them).
- **swap `answer` `ac`↔`au`** (Q3): exit 1. `plan-calls` + `accept-grammar-law` (backendNodeId + files mismatch). ✔ caught.
- **swap `read.ret` hex `ac`↔`au`** (Q2): exit 1. `accept-grammar-law` only. ✔ caught — the hex **is** bound per leg (via the `read` ret in GRAMMAR), the one per-leg fact that survives intact.
- **swap `stateAfter` `ac`↔`au` without exemption** (M1): same + `prior-set-complete` noise. ✔.

### `accept` string — top-level caught, per-leg NOT caught (the headline gap)

- **top-level `ac` accept `IMAGE/PNG`→`image/png`** (P2): exit 1. `accept-grammar-law` + `fixture-descriptors`. ✔ caught.
- **per-leg `ac` accept `IMAGE/PNG`→`image/png`** (P3): **exit 0, clean**. ✘ NOT caught. `leg.fixtureInputs` is never read by the counter — only its key existence is checked (`LEG_KEYS` includes `fixtureInputs`; `leg-records` does not deep-compare it). The leg's own page-read accept can be any string and the leg still scores clean.
- **per-leg accept swap `ac`↔`au`** (P15): clean. **Whole per-leg `fixtureInputs` arrays swapped** (Q7): clean. **Per-leg accept set to a wholly wrong token** (`au`→`image/png`, Q9; `amc`→`image/png` dropping `;q=0.9`, Q10; trailing-space/whitespace variants P11–P13): clean. **Per-leg descriptor deleted** (Q14), rect changed (R7), `multiple` flipped (R8), `type` changed (R9): clean.
- **top-level `ac`↔`au` accept swap** (P14): exit 1. `accept-grammar-law` + `fixture-descriptors`. ✔. **Top-level `au` whitespace** (`audio/*,video/*`→`audio/*, video/*`, Q8): caught. **Top-level `ac` removed** (Q13): exit 1 (`mode-law`, `accept-grammar-law`, `fixture-descriptors`).
- **`fixture.patch.body` accept changed** (P7, Q4): **clean** when the top snapshot is left intact. `patch.body` is not parsed by the counter (only the fixture sha256 pin covers the driver-built fixture, not the receipt's embedded copy).

So the claim wording "each with its raw accept attribute read back by `window.__inputs()`" is true at the top level (`r.fixtureInputs`, produced by `window.__inputs()` in the driver) and enforced byte-exact by `fixture-descriptors` + GRAMMAR. But the per-leg mirror (`leg.fixtureInputs`) — the artifact that reads as "the leg's own measurement" — contributes **nothing**: it is dead weight in every leg. Swapping one leg's per-leg accept facts for another's is invisible. The leg is NOT individually attributable through its own recorded accept; attribution rides entirely on the shared top-level snapshot plus `stateAfter[target]`.

### Delivered-file facts — name/size/type/hex mostly bound; `upload`/`uploadPng` not

- **answer `files` `ac` png→txt** (P5/M5): `accept-grammar-law`. ✔. **state type flip** `amc` png→text/plain (Q5): `leg-*` + `accept-grammar-law` + `no-selection-law`. ✔. **read hex single-nibble flip** (P4/M4): `accept-grammar-law`. ✔. **read `files` size flip** (Q6): `leg-sp88-accept-case-png` only. ✔. **read target swap** (R5): `leg-*`. ✔. **dismiss-state flip** (Q12): `no-selection-law` only. ✔.
- **`upload`/`uploadPng` hex/size/sha corruption** (P6, P10, Q11, R1, R2): **clean** in all five cases. `upload` and `uploadPng` are validated for the r84 legs (`accept-answer-law`, `multiple-mode-law`, `accept-mime-answer-law`, `second-chooser-answer-law` at lines 714/726/732/777) but **never referenced in the GRAMMAR loop** (line 760 checks `answer`, `stateAfter[target]`, `read.ret`, top desc — not `upload`/`uploadPng`). For all twelve grammar legs — including the three new ones — the upload-side hash/size recorded in the receipt is unchecked. The leg's name/size/type/hex are bound through `answer.files`, `stateAfter[target]`, `pageEvents` and `read.ret`, not through `upload*`.
- **`backendNodeId` corruption** (R4): `accept-grammar-law`. ✔. **`setParams.files` path swap** (R3): `plan-calls` + `accept-grammar-law`. ✔.

### Attribution verdict

The three new legs are close to swappable through their own data, and the counter does not prevent it:

1. **Accept attribution is top-level-only.** The exact raw string is bound once, globally, by `fixture-descriptors` over `r.fixtureInputs` (plus `mode-law` for `multiple`). Per-leg `fixtureInputs[].accept` is never compared to anything. Any per-leg accept forgery passes.
2. **The two PNG legs (`ac`, `amc`) are byte-identical in delivered content.** Name, size, type, hex, and answer files are the same PNG for both. They differ only in: target id (`ac` vs `amc`), leg name, top-level accept string, `backendNodeId` (19 vs 20), and upload directory. A full content swap that also moves `stateAfter` to the swapped target key and fixes `backendNodeId` linkage would be indistinguishable from an honest run — the only thing tying each leg to its accept token is the top-level descriptor + the leg's `target` binding, i.e. the grammar loop's `desc.accept === accept` check on the shared snapshot. The legs are attributable **by target id through the global snapshot**, not by any leg-owned measurement of the accept token.
3. The text leg (`au`) is separable from the PNG legs by delivered bytes alone, so an `ac`↔`au` fact swap is caught via `stateAfter`/`answer`/`read.hex`.

## Which of the ten grammar rows are enforced only by the top-level snapshot

All twelve GRAMMAR rows (the "ten token forms" of the claim = twelve rows: aw×2, am×2, ap, aa, av, a2, aws, ac, au, amc) are enforced **only through the top-level `r.fixtureInputs`** for the accept token — the GRAMMAR loop line 758 resolves `desc` from `r.fixtureInputs`, never from `leg.fixtureInputs`. `fixture-descriptors` additionally freezes the whole 21-entry array. Per-leg `fixtureInputs` enforces zero rows. The per-leg delivered facts that ARE individually bound are `stateAfter[target]`, `answer.files`/`setParams`, and `read.ret` (hex).

## Falsification of the claim's wording

Claim C1 text: "Three new page inputs, each with its raw accept attribute read back by `window.__inputs()`". The read-back as scored is `r.fixtureInputs` (exact-matched by `fixture-descriptors`); the per-leg `fixtureInputs` copy is not read back into the verdict. The claim's law sentence ("the raw attribute is read from the page") holds for the top snapshot but not for the per-leg record. This is a wording/attribution gap, not a scoring failure of the scored receipt itself: the scored receipt passes clean at checkCount 102 with all three exact strings present in both the top snapshot, the per-leg mirrors, and the patched HTML body. The gap is that counter leniency (unvalidated per-leg accept, unvalidated `upload*` on grammar legs) means a receipt that contradicts the per-leg accept facts would still score clean.

## Mutations summary (each run individually, exempted baseline P1 = clean exit 0)

Caught (exit 1): P1-swap-state (4 ids), P2-top-ac-lower (2), P4-read-hex-flip (1), P5-answer-files (1), Q1-swap-state-ac-amc (3), Q2-swap-read-hex (1), Q3-swap-answer (2), Q4-top-and-patch-lower (2), Q5-state-type-flip (3), Q6-read-files-flip (1), Q8-top-au-whitespace (2), Q12-dismiss-flip (1), Q13-top-remove-ac (3), P14-top-accept-swap (2), P9-target-swap (1), R3-setparams-path (2), R4-backendNodeId (1), R5-read-target-swap (1), R6-top-rect (1), R10-top-type (1).

Not caught (exit 0, clean): P3-perleg-ac-lower, P6-uploadPng-flip, P7-patch-body-lower, Q7-swap-perleg-fixtureInputs, Q9-perleg-au-wrong-token, Q10-perleg-amc-drop-param, Q11-upload-corrupt, Q14-perleg-remove-ac, P10-upload-field, P11/P12/P13-perleg-whitespace, P15-perleg-accept-swap, R1-uploadPng-size, R2-upload-size, R7-perleg-rect, R8-perleg-multiple, R9-perleg-type.

## Residual risk / notes

- Attacks are against the receipt + frozen counter only; the counter's documented limits (replay escape minimum, `Page.fileChooserOpened.backendNodeId` relabel) are inherited and not re-tested.
- No mutation touched pins, predicates, or kill rules.
