# R61Connector — sibling overlap scan, tabi round 61 w1

Seat: R61Connector (leaf, read-only). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Fleet root `/home/vgpnk/Projects/shokunin` (read-only).
Snapshot file: `.ufo/waves/round-61/c1/snapshot-r61.tsv`
sha256 `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` (recomputed; matches `claims.json` controls.snapshot).
20 data rows + header; every sibling directory resolves; every byte below is read at the recorded snapshot head.
No sibling worktree was read, checked out, or written. No VCS mutation was run anywhere.

## Read discipline and one disclosed deviation

Discovery used `git -C <sibling> grep -I -l|-n -E <pattern> <snapshotHead> --`, which reads the
frozen tree objects at the recorded head and never the worktree. This is a deviation from the
literal instruction "read bytes ONLY via `git cat-file -p <head>:<path>`": `git grep` was used as
the path index only. Every byte quoted below was then re-extracted with
`git -C <sibling> cat-file -p <snapshotHead>:<path>` and the line number re-checked against that
extraction. The snapshot hash above was recomputed with `sha256sum` (exit 0).

## Heads scanned (snapshot head → live head at scan end)

| lane | snapshot head | live head at scan end | moved |
|---|---|---|---|
| audio-shokunin | f9da7ee97e0ba95da1803c2afe9c616c519bae18 | same | no |
| chousa-shokunin | f748abbb6bf58388e732facd4ecec5612419c457 | same | no |
| game-dev-2d-shokunin | 1e033ef053beedf9a201daa21fbeb9c8b2f72dc3 | same | no |
| game-dev-3d-shokunin | 39ca3973c7865456d97fae18033f3f460c6cf8c1 | same | no |
| kagi-shokunin | 76241c0a8641868f41f4c5801e2aa6bb7aaeb03a | 6191805a47f54dc2e922080129e1dd2b89390df2 | yes |
| kaidoku-shokunin | a35e514105234515e266440aa33a578536b0007b | c99e907cb5576c13a7b22755d776b356fdfc1752 | yes |
| kake-shokunin | c2482e5ce56d589ecd5ddefb0ec8bf1e0c4fde92 | ced2878a1e77f57afb4ee3baebf1021e5130399b | yes |
| kama-shokunin | 6035e952c2521999e192d6f236331f265ac98392 | same | no |
| kasegi-shokunin | c81eef717ee72f6911b0155992e52299403a56da | same | no |
| kengaku-shokunin | d2ed4ca32c9eb8e8a0f8b3c7ced3ff15c53f9821 | d5b3c3090dd418bf00a9411a4bee2c593d9ed4ac | yes |
| kotoba-shokunin | 1c8f37edf2e5ac0fb3c2be1c88e32406313fe47b | same | no |
| kotodama-shokunin | c285b2afb19d4b64320e18df1f55e426bf2d0b0c | same | no |
| kumitate-shokunin | 3c369336218329e30248b5d69c41348c02658169 | same | no |
| lore-shokunin | 0f044aa7c7e4e17cfd5b6278179709b60db45d61 | same | no |
| mado-shokunin | 23fbc174d02fa44662e9aee735bbf6de5cad3f1d | ed980316e330703030d0c17b2a7098e058295b99 | yes |
| mori-shokunin | 84c6cbc3b47c536a504aaee329c77897d389935e | same | no |
| revenger-shokunin | 5915ad8d71c19ad377829d130ba1c35445eb32a4 | same | no |
| souji-shokunin | 148f39a6c902b27e997ac36d395735406d3ad9de | 8c27791a1606cd654b059df6a00f0e031ad6abb8 | yes |
| tameshi-shokunin | f20ba482c7441d4c75818e7cd8a3165fee7821a1 | same | no |
| tsukuroi-shokunin | 3f6edcc9792d892890d7e25b8bf4327bc7d5e6b0 | ffd139e4e05db89ddea5f84f33eccb5ad8f03c7b | yes |

7 of 20 lanes had moved past their snapshot head by scan end. Two of them moved again *during*
the scan: kaidoku `d9ab47dc…` → `c99e907c…` and mado `eafd500f…` → `ed980316…` (observed at two
instants of the same scan, not from a cache). This is the drift the C1 (b) clause predicts.

## Class 1 — pointer-event / pointer-domain ground

Pattern used for discovery (case-sensitive, `-I` skips binary):
`PointerEvent|pointerdown|pointerup|pointermove|pointerType|pointerId|dispatchMouseEvent|input\.performActions|pointer-event|pointer domain`

Loop result: 20 `git grep` invocations; 14 exit 0 (at least one hit), 6 exit 1 (no hit:
audio-shokunin, game-dev-2d-shokunin, game-dev-3d-shokunin, kaidoku-shokunin, lore-shokunin,
tsukuroi-shokunin). 165 hit files, all under `.ufo/` or `corpus/`; no `node_modules` path occurs
among them — the non-authored hits are fetched page/source captures and binary strings dumps, not an
installed package tree.

Root-doc negative (the class's "skill, province" surface):
`git -C <lane> grep -I -n -i -E 'PointerEvent|pointerdown|pointerup|pointermove|pointerType|pointerId|pointer-event|pointer domain' <head> -- PROVINCE.md SKILL.md AGENTS.md README.md`
→ 20 invocations, all exit 1, 0 hit lines. No sibling PROVINCE.md or SKILL.md adds or rules
pointer-event capture.

Literal-token presence at the snapshot heads (whole tree, `git grep -I -l -F <token>`):

| token | lanes with a hit | files |
|---|---|---|
| `PointerEvent` | kotoba-shokunin only | 2 |
| `pointerType` | kotoba-shokunin only | 2 |
| `pointerId` | kotoba-shokunin only | 2 |
| `Input.dispatchMouseEvent` | kotoba-shokunin only | 2 |
| `input.performActions` | kotoba-shokunin only | 2 |
| `pointerdown` | kagi, kake, kama, kengaku, kotoba, kumitate, mori, revenger | 75 |

The kotoba files are harness-binary string dumps, not lane-authored prose:
`.ufo/round-44/evidence/omp-live-18.12.2-strings.txt` and
`.ufo/waves/round-82/build/Kb82E12Loader-omp-18.14.0-strings.txt`. Example lines
(`.ufo/round-44/evidence/omp-live-18.12.2-strings.txt`):
```
6636:Input.dispatchMouseEvent
603234:input.performActions
1280460:        return this.#e.send("Input.dispatchMouseEvent", {
```
Of the 75 `pointerdown` files, every one outside kake is a fetched page body, a fetched source
snapshot, or a binary strings dump (`.html`, `.body`, `.src`, `.orig`, `.raw`, `strings.txt`).
No lane-authored script (`.js`, `.mjs`, `.py`, `.sh`) in any sibling dispatches a pointer event:
the script-extension pass returned only the kotoba strings dump.

### Found

#### kake-shokunin `corpus/knowledge/accessibility-review-cards.json`
sha256 `65aa760b0943c13b1f154f139e8b6c7c0dac5cbf40e0be5d1db232bafb479f16`, 662 lines.
A lane-authored WCAG 2.2 review-card packet that rules pointer-action semantics and names
`pointerdown` in a failure example. Six lines quoted whole:

`:235`
```
    "sourceQuote": "Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true",
```
`:237`
```
    "evidenceNeeded": "An inventory of hover and focus triggered content instances, with page, trigger and type. For each instance, record whether author code or the user agent controls its presentation, the dismissal mechanism tested with the trigger still active, the pointer-onto-content result where hover applies, and whether it ever disappears on its own. Also record whether the content reports an input error or obscures or replaces other content, and keep human tester notes or a recording with the user agent and input method used. Shared record for every card: reviewer, evaluation date, delivered build/revision, full page/process scope and variants, relied-upon technologies and accessibility-support evidence, method and observation pointers, applicability with rationale, and operator authorization. Use corpus/handoffs/accessibility-preparation.md; keep this reusable card not-assessed.",
```
`:412`
```
    "title": "Pointer Gestures",
```
`:424`
```
    "title": "Pointer Cancellation",
```
`:429`
```
    "evidenceNeeded": "An inventory of the single-pointer functions that were reviewed. For each function, a record of which event triggers it: press (down-event) or release (up-event). Where the function fires on press, record which option applies: the abort-or-undo mechanism and how it works, the up-reversal behavior that was observed, or a written rationale for why completing on press is essential, such as a keyboard or keypad emulation. Name the reviewer, date, and the browsers, pointer types, and assistive technology configurations that were used. Where useful, attach the relevant event-handler code or a screen recording as supporting evidence. Code alone does not show runtime behavior. Shared record for every card: reviewer, evaluation date, delivered build/revision, full page/process scope and variants, relied-upon technologies and accessibility-support evidence, method and observation pointers, applicability with rationale, and operator authorization. Use corpus/handoffs/accessibility-preparation.md; keep this reusable card not-assessed.",
```
`:430`
```
    "failureExample": "A shopping page has a custom 'Remove item' button scripted to delete the cart line on mousedown or pointerdown. A user who presses it by accident cannot slide the pointer away to cancel, and no undo or restore option is offered. The item is gone before the pointer is released. Releasing the pointer leaves the item deleted; the up-event does not reverse the deletion, and press-triggered deletion is not essential.",
```
The same packet assigns browser execution of these criteria to tabi: the `publisherCheck` field of
2.5.1/2.5.2/2.5.8 begins `Preparation only: kake inventories the scope and requests a separately
operator-authorized evaluator; tabi owns authorized browser/assistive-technology execution …`.
tabi's own ruled map already carries this split (`corpus/adjacency.tsv` row
`accessibility-browser-at-execution`, kake, disposition `split-declared`); this is an existing
declared boundary, not new ground.

#### kake-shokunin `.ufo/waves/round-25/w1/SC252.md`
The round-25 seat report that produced the 2.5.2 card. Three lines quoted whole:

`:1`
```
# SC 2.5.2 Pointer Cancellation — review card
```
`:12`
```
  "failureExample": "A shopping page has a custom 'Remove item' button scripted to delete the cart line on mousedown or pointerdown. A user who presses it by accident cannot slide the pointer away to cancel, and no undo or restore option is offered. The item is gone before the pointer is released.",
```
`:13`
```
  "limitation": "This card is a manual-review prompt only. No website has been evaluated, and it records no pass, fail, inapplicability, or conformance outcome. Static source or automated scanning can flag down-event handlers, but it cannot settle the criterion. Only human operation shows whether an abort, undo, or up-reversal option actually works, or whether completing on press is essential. The saved Note 2 limits the criterion to web content that interprets pointer actions. Actions needed to operate the user agent or assistive technology are excluded. Keyboard-only operation is out of scope here.",
```

#### mado-shokunin `corpus/knowledge/input-debugging-boundaries-r15.md:35`
sha256 `48caaa8c9b0785ed01bf08d1d881856564fed736ddd21bc9c197db4f0344895e`.
Wayland `wl_pointer` event-contract ground (compositor/client layer, not a DOM PointerEvent):
```
| Wayland client focus/event contract: which protocol state is relevant? | S052 `wl_pointer.enter`/`leave`/`motion`/`button`, XML:2138–2265; `wl_keyboard.enter`/`leave`/`key`, XML:2614–2699 | `[OBS-source]` pointer events are surface-local/focus-related; keyboard enter identifies a focused surface; key events carry platform-specific codes interpreted with the keymap. The key event requires an active surface in this XML revision | No live client input was observed; XML version 11 is not this host's advertised version 9, nor proof a diagnostic observer sees another client's stream |
```

#### mado-shokunin `.ufo/waves/round-15/w1/reports/ReviewPointer.md:4`
```
Scope: adversarial review of one integration risk for the U6 input ladder: that a pointer event *delivered* to a client is conflated with a *rendered* cursor or an *app response*.
```

#### mado-shokunin `.ufo/waves/round-15/w1/reports/WaylandSeat.md:93`
```
     - Focus is bounded by `wl_pointer.enter` and `wl_pointer.leave`. If the pointer is over another application, the wallpaper, or another monitor, the client receives zero pointer events.
```

#### mado-shokunin `.ufo/waves/round-15/w1/reports/ReviewSeat.md:54`
```
A8. Scope stays documentary: no claim that any key or pointer event was produced, read, or injected.
```

### Not found
- No sibling PROVINCE.md/SKILL.md/AGENTS.md/README.md carries any pointer-event token (20/20 exit 1).
- No sibling-authored script or tool dispatches pointer events (`dispatchMouseEvent`,
  `performActions`, `PointerEvent`) anywhere in the 20 snapshot trees.
- No sibling witnesses a page-side `PointerEvent`: the literals `PointerEvent`, `pointerType`,
  `pointerId`, `Input.dispatchMouseEvent` occur only in kotoba's two harness strings dumps.

## Class 2 — adjacency-meter ground (the C1 instrument family)

Pattern used for discovery:
`bgScreenSiblings|bg-screen|sibling-screen|screenedMd|enumeratedMd|wideHit|BG_WORDS|browser-ground-word|browser-ground word|snapshot-binding|snapshot binding|adjacency-host|adjacency meter|adjacency-meter|lane-screen-head-mismatch|provinceSha256|bgHits|adjacency-host-audit|adjacency-host-delta|snapshot-r6|adjacency-screen|sibling screen|snapshot rebind`

Loop result: 20 `git grep` invocations; 11 exit 0, 9 exit 1 (audio, game-dev-2d, game-dev-3d,
kake, kotodama, lore, mori, souji, tsukuroi); 59 hit files.

Per-token census (`git grep -I -l -F <token> <head> --`, 15 tokens × 20 lanes):

| token | files | lanes |
|---|---|---|
| `bgScreenSiblings` | 0 | — |
| `bgHits` | 0 | — |
| `screenedMd` | 0 | — |
| `enumeratedMd` | 0 | — |
| `wideHit` | 0 | — |
| `BG_WORDS` | 0 | — |
| `provinceSha256` | 0 | — |
| `lane-screen-head-mismatch` | 0 | — |
| `adjacency-host` | 0 | — |
| `snapshot-r60` | 0 | — |
| `snapshot-r61` | 0 | — |
| `sibling-screen` | 0 | — |
| `bg-screen` | 0 | — |
| `browser-ground` | 0 | — |
| `wide-screen` | 0 | — |
| `adjacency-screen` | 5 | kagi 1, kengaku 2, tameshi 1, tsukuroi 1 |
| `snapshot-binding` (hyphen) | 29 | kumitate 28, mado 1 |
| `snapshot binding` (space) | 23 | chousa 5, kaidoku 1, kama 9, kotoba 1, kumitate 1, revenger 1, tameshi 2, tsukuroi 3 |

No sibling runs its own browser-ground-word screen, sibling-screen meter, or cross-lane
snapshot-binding ledger: every C1-family token is zero. The `snapshot-binding` hits are other
instruments' own snapshot mechanisms (config snapshots, source-anchor snapshots, boot-chain
snapshots), not cross-lane byte ledgers; two are mechanism-level precedents (below).

### Found — direct references to tabi's adjacency screens (the C1 instrument family)

#### kagi-shokunin `.ufo/waves/round-31/build/ConnOverlap.md:47`
sha256 `31f4ff8b03c2faffffcd5fc61364cb03306d3fa98fe0e56df796ed76f85f1b01`
```
| 11 | tabi | `corpus/adjacency-screen-browser.tsv:28-42` (10 pinned rows) | tabi's screen **pins kagi's** `cdp-bridge-1password.md` lines as kagi's hold | tabi screening kagi's ground, not claiming it; the pins are `<lane>@<40-hex>:<path>:<line>` (frozen commits), so a new kagi knowledge file cannot break them |
```

#### kengaku-shokunin `.ufo/waves/round-51/w1/C2ConnLedgerSchema.md:71`
sha256 `0987de0fd717e420d8a44107293b32405ea9b32b8b5fa89410e06e26f71df5f1`
```
| tabi | `corpus/adjacency-screen*.tsv` | sibling_ref, reason, surface, quote, note (drift variant: sibling_ref, status, note) | no | `status` only |
```
Mirrored in the seat-results JSON at `.ufo/waves/round-51/w1-results.json:214` as an
escaped JSON string of the same report (not quoted whole here: it is one multi-kilobyte
JSON line; the `.md` line above is the authored form).

#### tameshi-shokunin `.ufo/waves/round-50/w1/T50ConnSiblingShrink.md:35`
sha256 `a40ed26f447e2b99f567742f96567cab1aee5a47346668cfb88b70afad24ece0`
```
| kaidoku | (cited via tabi `corpus/adjacency-screen-browser.tsv:69`) | "vacuuming shrinks the window" | crash-core retention scheduling phrase, unrelated |
```

#### tsukuroi-shokunin `.ufo/waves/round-43/w2/AdjFinal/sibling-skillmd-pin-lines.txt`
sha256 `9e36e8c7dc2c1f4035e15ef2db789684c1b5a4c29b66811f6b8468607722e12d`. Three lines:

`:301`
```
tabi-shokunin: .ufo/waves/round-34/w2-results.json:64:   "output": "{\n  \"seat\": \"CritScreenTameshiTsukuroiChousa\",\n  \"milestone\": \"C1\",\n  \"item\": \"attack the 8 screen rows for tameshi/tsukuroi/chousa in corpus/adjacency-screen-skill.tsv\",\n  \"verdict\": \"holds\",\n  \"severity\": \"none\",\n  \"rows_attacked\": 8,\n  \"rows_by_reason\": {\n    \"third-lane-report\": 7,\n    \"no-claim-declared\": 1,\
```
`:305`
```
tabi-shokunin: .ufo/waves/round-34/w2/CritScreenTameshiTsukuroiChousa.md:127:- `SKILL.md:2819-2839` + `corpus/adjacency-screen.tsv` row 45 (round-33 precedent: tsukuroi
```
`:367`
```
tabi-shokunin: corpus/adjacency-screen-browser.tsv:365:tsukuroi-shokunin@a968393c678171f8a5a2907da5015735396da4cc:SKILL.md:2547	not-browser-sense	-	3,381,800 pages (12.9 GiB) more than each +300 Chromium	The candidate is a pages-magnitude check of OOM score bands inside tsukuroi's `Row F7 check`, where a `+300 Chromium` process is one band member; the line computes `rss+swapents+pgtables` and states no browser intera
```
`:301` ends in the file itself with a backslash and no closing brace; quoted as stored.

### Found — mechanism-level snapshot-binding precedents (different instrument)

#### kama-shokunin `.ufo/waves/round-59/w1/out/K06C2ReferenceDrift.md`
sha256 `f0d6c4c6177faf4c0d9221b12c763b21971e2866f521b3f2592015960eae776b`

`:1`
```
# K06C2ReferenceDrift — C2 fleet snapshot binding
```
`:15`
```
- **Calibration:** no demonstrated calibration defect from snapshot binding alone. This does not supply missing S517/S518 evidence or establish the frozen overall C2 predicate; the available closure remains `rejected-honest-stop` as stated in the task.
```
The body measures a counter that resolves the fleet ref on every invocation instead of pinning a
prior revision, advances only a fixture HEAD, and concludes that callers should record the emitted
fleet commit and pass that exact revision for stable comparison. This is the same
per-run-head-versus-frozen-snapshot mechanism as C1's rebind, applied to a different counter.

#### kaidoku-shokunin `.ufo/waves/round-49/w2/W2C2Mutate.md:58`
sha256 `138d8af16aad4fc70218bfbdbbe7a3c3f72981de666c1d91b07824d073c4dada`
```
| M30 | popper snapshot comment appended **and** S147 anchor sha re-pinned to `e63e4135…3347` (lesson's sha not updated) | A6 snapshot binding | none | **0** | **0** | none | 07365d9c61940090 | **UNDETECTED** (consistent snapshot forgery; disclosed only as live-page limit) |
```
A mutant row for a snapshot-bound ledger's forgery surface; the row records an undetected
consistent snapshot forgery as a disclosed limit of that instrument.

### Not found
- No `bgScreenSiblings`, `bgHits`, `screenedMd`, `enumeratedMd`, `wideHit`, `BG_WORDS`,
  `provinceSha256`, `lane-screen-head-mismatch`, `adjacency-host`, `snapshot-r60`, `snapshot-r61`,
  `sibling-screen`, `bg-screen`, `browser-ground`, or `wide-screen` token in any sibling.
- kasegi's phrase "The sibling screen finds the claim-package gate disjoint" (`LOG.md:1929` and
  `.ufo/waves/round-43/w1/ScribeLogEntry.log-entry.md:121`) is the connector/overlap sense of
  "sibling screen", not a browser-ground screen: term match only.
- kumitate's 28 `snapshot-binding` files are its `ufo-l0-watch` config-null
  "dispatch-snapshot binding" (`bindSnapshotConfig`), a config snapshot, not a cross-lane byte
  ledger: term match only.

## Class 3 — fresh commits on top of the snapshot heads

`git -C <lane> log --oneline <snapshotHead>..<liveHead>` (exit 0 for each of the 7 moved lanes;
the other 13 produced an empty range). Files touched from
`git -C <lane> diff --name-only <snapshotHead> <liveHead>`.

| lane | commits | files touched | top-level surfaces | what the new commits are |
|---|---|---|---|---|
| kagi-shokunin | 2 | 119 | corpus, LOG.md, PROVINCE.md, SCORECARD.md, SKILL.md, .ufo | round-32 committed-snapshot measurements (C1 honest stop, C2 verified); self-description sweep and op recheck |
| kaidoku-shokunin | 2 | 109 | corpus, LOG.md, SCORECARD.md, SKILL.md, .ufo | round-64 jsc route trial, two corrected assimilations, wave evidence, honest-stop record; verifier spot-check |
| kake-shokunin | 2 | 14 | corpus, .ufo | round-73 C1/C2/C3 receipts and harm batteries; verifier spot-check lesson |
| kengaku-shokunin | 2 | 15 | plans, .ufo | round-68 pypi completion probe and correction-gate claims, wave spec; flag-restore fix |
| mado-shokunin | 2 | 6 | corpus, .ufo | round-65 verifier spot-check; round-66 bounded counter-discrimination claims freeze |
| souji-shokunin | 3 | 440 | census, corpus, LOG.md, SCORECARD.md | round-56 terminal standing receipts, census records, lesson |
| tsukuroi-shokunin | 2 | 64 | corpus, LOG.md, SCORECARD.md, SKILL.md, tools, .ufo | round-68 committed-revision integration receipts, pinwatch and source-reference gate |

Diff scan for this round's grounds: `git -C <lane> diff --unified=0 <snapshotHead> <liveHead>`
(exit 0 for all 7; total 2,871,242 bytes of patch) then
`grep -c -E '^\+.*(PointerEvent|pointerdown|pointerup|pointermove|pointerType|pointerId|dispatchMouseEvent|isTrusted)'`
and the class-2 pattern over added lines. Result: **0 added lines for class 1 and 0 for class 2 in
all 7 lanes.** No fresh commit on top of a snapshot head adds pointer-event ground or
adjacency-instrument ground.

## Cross-checks and instrument observations

1. The C1 wide-screen clause (`c1-wide-screen-r60.mjs`) enumerates only paths ending `.md`
   (its header: "every tracked blob whose path ends in .md"). kake's pointer-ground packet is
   `corpus/knowledge/accessibility-review-cards.json`, 662 lines, of which 16 lines contain a
   frozen BG word (`cdp|devtools|remote-debugging|headless|webdriver|geckodriver|selenium|playwright|bidi|crawl|screenshot|recordhar|record-har`;
   measured `git grep -I -c -E … <head>:corpus/knowledge/accessibility-review-cards.json` → 16).
   The v19/v20 core screen covers PROVINCE.md plus files referenced by `corpus/adjacency.tsv`; the
   map's kake rows reference `PROVINCE.md` and `SKILL.md` only. Those 16 BG-word lines are
   therefore outside both C1 screens. This is a coverage-set observation for the claim, not an
   amendment request.
2. tabi's map already rules kake's accessibility browser-execution split:
   `corpus/adjacency.tsv` row `accessibility-browser-at-execution` (kake, `split-declared`,
   sibling quote `PROVINCE.md:85`, tabi quote `SKILL.md:2889`
   "browser and assistive-technology execution for kake's accessibility review is tabi's").
3. The literal `PointerEvent`/`pointerType` evidence sits in kotoba's harness string dumps, i.e.
   upstream binary bytes. It does not contradict C2's unheld-ground premise (no page-side
   witness), but a token sweep that counted it as lane-held ground would be wrong.

## Verdict

**overlap 23 lines in 13 files** — 13 pointer-ground lines in 6 files (kake card 6, kake SC252 3,
mado knowledge 1, mado ReviewPointer 1, mado WaylandSeat 1, mado ReviewSeat 1) and 10
adjacency-family lines in 7 files (kagi 1, kengaku 2 [one .md + its JSON mirror], tameshi 1,
tsukuroi 3, kama 2, kaidoku 1). **0 lines added by fresh commits.**

Files: `kake-shokunin/corpus/knowledge/accessibility-review-cards.json`,
`kake-shokunin/.ufo/waves/round-25/w1/SC252.md`,
`mado-shokunin/corpus/knowledge/input-debugging-boundaries-r15.md`,
`mado-shokunin/.ufo/waves/round-15/w1/reports/ReviewPointer.md`,
`mado-shokunin/.ufo/waves/round-15/w1/reports/WaylandSeat.md`,
`mado-shokunin/.ufo/waves/round-15/w1/reports/ReviewSeat.md`,
`kagi-shokunin/.ufo/waves/round-31/build/ConnOverlap.md`,
`kengaku-shokunin/.ufo/waves/round-51/w1/C2ConnLedgerSchema.md`,
`kengaku-shokunin/.ufo/waves/round-51/w1-results.json`,
`tameshi-shokunin/.ufo/waves/round-50/w1/T50ConnSiblingShrink.md`,
`tsukuroi-shokunin/.ufo/waves/round-43/w2/AdjFinal/sibling-skillmd-pin-lines.txt`,
`kama-shokunin/.ufo/waves/round-59/w1/out/K06C2ReferenceDrift.md`,
`kaidoku-shokunin/.ufo/waves/round-49/w2/W2C2Mutate.md`.

None of the 23 lines adds a page-side `PointerEvent` witness, a browser-ground-word screen, a
sibling-screen meter, or a cross-lane snapshot-binding ledger. Inventory only; adjudication is a
later round's residual.
