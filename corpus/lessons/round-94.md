# tabi — round 94

L1 `TabiR94`. Base `d7744d04` (lane tip at round start; round 93 closed `ok`, admitted). ONE claim —
C1 coverage, the new capability `chromium-oopif-backendnode-collision-linux` (r93 declared limit 3:
whose node the page session names for a cross-site iframe chooser's `backendNodeId`, and the miss
branch of the same lookup) — worded as the conjunction of its counter's checks, frozen with its
controls in commit `2308b6ce` (`claims.json.frozenAt` 21:49:37 -03:00) before the scored run
(`012776cf`) and before the wave `.ready` was written.

## Gate

### Sources — opened this round

The L1 fetched both on 2026-11-08 at 21:39-21:40 -03:00 (gitiles `?format=TEXT`, base64-decoded) and
staged the bytes in the freeze commit under `.ufo/waves/round-94/sources/` (`sha256.txt`).

- **S233** (admit, tier A, `mined`) — Blink `third_party/blink/renderer/core/inspector/identifiers_factory.cc`
  at tag 155.0.8059.84, https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/identifiers_factory.cc
  (accessed 2026-11-08; 7,404 B base64 → 5,551 B, sha256 `8d8ee04ee525`). Lines 119-120: "int
  IdentifiersFactory::IntIdForNode(Node* node) { return node->GetDomNodeId();" (6 words by `wc -w`).
- **S234** (admit, tier A, `mined`) — Blink `third_party/blink/renderer/core/dom/node.cc` at tag
  155.0.8059.84, https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/dom/node.cc
  (accessed 2026-11-08; 192,152 B base64 → 144,114 B, sha256 `1fa7935829ce`). Lines 354-355:
  "DOMNodeId Node::GetDomNodeId() { return DOMNodeIds::IdForNode(this);" (5 words by `wc -w`).
- **Reject** — Blink `dom_node_ids.h` at the same tag (staged r93, sha256 `83f63b185057`): it declares
  `IdForNode` / `NodeForId` / `ExistingIdForNode` but teaches nothing S232's definitions do not. Flip:
  a round that claims the `ExistingIdForNode` (no-mint) path.

What they teach together with S231/S232: the `backendNodeId` in a CDP node record
(`BuildObjectForNode`, S231 line 2546) is the node's own DOM node id, minted on first request from the
receiving renderer's process-wide counter, and resolved by `NodeForId` in whichever renderer receives
the command. Status/recheck/used-by changes: S233 and S234 are new rows (none → `mined`, 90d, used-by
the r94 note). S231/S232 rows are not edited (append-only record); the r94 note cites them.

Assimilation: none (no `merge/tabi/` theme taken this round). considerthese: no
`considerthese/` directory in this lane.

## Mistakes

1. **Class: a control that kills the driver's process group but not the browsers the driver started
   in their own groups (orphaned chromium), plus a sweep that matched argv the browser had
   rewritten.** Evidence: this round's own pre-freeze controls. Attempt 1 (counter `9a406e25…`):
   counter SIGTERM and driver SIGKILL each left 12 chromium processes
   (`.ufo/waves/round-94/controls/rc-setup-attempt1.txt`). Attempt 2 (counter `7d04a36e…`): a counter
   SIGTERM was scored `findings` rc 1 (the driver's own handler exited 130 first and the main path read
   a missing receipt), and the orphan sweep found 0 processes while 13 survived, because chromium
   rewrites its process title so `/proc/<pid>/cmdline` is no longer NUL-separated
   (`controls/rc-attempt2.txt`). Captured-by: R93Sentinel S5 (r93) named the class, but no control
   COUNTED the survivors; the r93 busy-port setup control never starts a browser. Fix: the r94 counter
   SIGTERMs the driver group, SIGKILLs it after 2 s, then kills every process whose whole command line
   contains `--user-data-dir=<run scratch>/driver/`, also after every normal driver exit
   (`driverRun.orphansSwept`); a counter interrupted by a signal and a driver exiting 130 are `setup`.
   **Shown able to fail:** the control's own counter (`pgrep -fc "user-data-dir=<scratch>"` after the
   signal) read 12 and 13 on attempts 1-2 and 0 on attempt 3 (`controls/rc.txt`: driver SIGKILL →
   `setup`, 14 swept, 0 left; counter SIGTERM → `setup`, 0 left).
2. **Class: a recorded quote word count that `wc -w` does not reproduce** (r93 spot-check §8 item 1,
   same class as r92 §8 item 5). Evidence: `corpus/lessons/round-93.md` §Gate S232 says "8 words for the
   two lines together"; `wc -w` over the two quoted lines gives 6. Captured-by: the r93 lesson's own
   pledge ("from this round on, word counts come from `wc -w`") — a pledge, not a gate. Fix: this
   lesson's counts above were produced by `wc -w` on the exact quoted strings (6 and 5), and the wave
   seat R94Exec3 re-counts every r93 quote (`.ufo/waves/round-94/w1/R94Exec3-wordcounts.json`).
   Correction (append-only): S232's two quoted lines are 6 words, not 8.

## Corrections carried by round 94 (r93 spot-check §8; append-only)

- Item 1: S232 word count 8 → 6 (Mistake 2 above).
- Item 2: the r94 counter output carries `receipt` and `receiptSha256`, and the committed scored record
  `.ufo/waves/round-94/scored/c1-live.record.json` adds `receiptCommitted`
  (`corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json`, same sha256
  `8070fcdc7871…`) — the scratch path in `.receipt` is no longer the only pointer.
- Item 3: R93Sentinel S4/S5 — Mistake 1 fix and the three setup controls.
- Item 4: R93Mut survivors / R93Critic1 hardening — the r94 battery carries `port-out-of-range`,
  `s-files-after-cross-nonnull`, `producer-pass-ignored`, `*-B-unbound` (B echoed on every
  describe/cross/answer record); R93Critic3's parent-document reading is the r94 C-arm predicate.
  The r93 instruments are frozen history and are not edited.
- Item 5 (append-only check aware of SOURCES table inserts): carried. This round's SOURCES change is
  two inserted table rows and one inserted search-log entry, 0 deleted lines.
- Item 6 (report errata): the r94 report is corrected only by appended errata.
- Item 7 (r91 items 3/5): still carried.

## Leads screened by the wave (not rows)

R94Scout re-fetched S233/S234 byte-identical to the staged copies (`w1/R94Scout-sources/`, sha256
`8d8ee04ee525…`, `1fa7935829ce…`) and located paint-path mint sites at the tag:
`core/paint/text_fragment_painter.cc` line 747 and `core/paint/paint_property_tree_builder.cc` line 852
(both conditional). **Refused as rows this round**: R94Critic3 could not isolate which pass mints the
input's id, so no lane entry rests on them. Flip: a round that claims the minting pass.

## Wave w1 (12 seats; every seat filed; artifacts in `.ufo/waves/round-94/w1/`)

- R94Exec1: two cold `--live` runs clean, 165 checks each; battery 74/74 on run1's receipt; B 2/302/305.
- R94Exec2: four `--live` runs clean (165, 165, 165, and 522 at `--reps 10`; 57 legs). Its run3
  attempt 1 ended `setup` rc 2 (driver SIGKILL) — caused by R94Sentinel's mis-targeted kill (below).
- R94Exec3: freeze-stamp gate clean on r94 (21:49:37 ≤ 21:49:42); census exit 0; the r93 S232 word
  count re-measured (8 recorded, 6 measured).
- R94Mut: 70 counter mutants, 65 killed; survivors M08/M10/M13 (ports below 1024, duplicate ports,
  non-UUID browser id: battery gaps; the unmutated counter is as strict as the wording) and M39/M56
  (`>= B` → `> B`, stricter). 48 kills rest on the positive control alone — the negatives check an
  expected id appears, so an over-reporting counter passes them (routed r95).
- R94Critic1: every C/M/S clause enforced; 10 receipt-mode forgeries (pierce max scalar, click
  coordinates, 1500 ms window, "painted", chromium string, port shift) all inside declared limit 6.
- R94Critic2: parent pad 400 flips M into a `#text` collision; child pad 1 collides with a non-root
  `about:blank` `#document`; pads 5-300 miss (pad 5: B = 7 < parent max 16, still a miss — membership,
  not comparison); answer-first changes `filesAfterCross` only; hidden spans B = 2.
- R94Critic3: B is fixed at the child's first render, not by DevTools serialization (Bpre = B = 302),
  not at click; spans inserted after load or after the input leave B = 2.
- R94Reviewer: freeze precedes scoring; pins equal at freeze and master; every scored leg meets each
  clause by jq; receipt sha256 matches the corpus copy. No defects.
- R94Sentinel: the three setup controls reproduce (one byte-identical); F1 a same-UID writer can read
  the nonce from `/proc/<pid>/cmdline` and substitute the `--live` receipt between write and read
  (trust boundary beyond limit 6); F2 a chromium launch failure (TMPDIR ≥ 63 bytes → singleton socket
  path too long) is scored `findings` rc 1, F4 a directory at the receipt path crashes with rc 1 and no
  verdict, F3 own-signal setup JSON lacks `driverRun`; counter SIGKILL (uncatchable) leaves the driver
  and chromium alive. All routed to r95; none makes a false claim look clean except F1, which needs a
  concurrent same-UID forger.
- R94Scout: sources re-opened byte-identical; paint-path leads above.
- R94Scribe: knowledge-note draft and S233/S234 row drafts (`w1/R94Scribe-note.md`,
  `w1/R94Scribe-sources.json`); the L1 note was written from the receipts and integrates the wave's
  findings; the drafted rows match the committed S233/S234 in id, URL and anchor lines.
- R94Connector: 20 sibling lanes, no contradicting sibling statement; three tabi statements r94
  contradicts (r92 note session-scope INFERENCE, r93 README unconditional summary, r93 note rule 2
  contrast) — corrected by appended sections this round.

Every seat's C1 verdict is `neutral` (`.ufo/waves/round-94/claim-falsification.tsv`).

### Wave incident (recorded, not a claim defect)

R94Sentinel's first driver-SIGKILL control used `pgrep -f "chrome-cdp-backendnode-collision-round94.mjs
--lane $LANE" | head -1`, which matches every seat's driver (all seats share the lane path), and killed
R94Exec2's run3 attempt-1 driver. R94Sentinel disclosed it (`w1/R94Sentinel.md` §7); R94Exec2's cited
run3 is the clean retry. Class: a kill selector scoped to the shared lane path instead of the seat's
own ports/scratch. Captured-by: the wave contract ("kill only processes carrying your own ports"),
which the selector did not follow. Fix for r95 wave contexts: kill selectors must name the seat's own
`--scratch` or port triple.
