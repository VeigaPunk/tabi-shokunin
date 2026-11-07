HOLDS

# R78Critic — final review on D bf94adaa

Measured at lane HEAD `bf94adaa` (16:09:58), `claims.json` sha256 `51435d8d…`, `freeze.txt`
`04a172fc…`, `scored/digests-commit.txt` = `bf94adaab578c540497764dbb42441421770a69e`; scored receipt
nonce `tabi-r78-l1-bf94adaab578` (driver `0ae89d…`, 79 events); counter `4ae29412…`, battery `3387e5f4…`,
kill-power `9fdd4ea7…`, selftest `647239…`, C2 checker `a4f89829…`, prior set `95c5d140…`. The earlier
dispatch state (D `d59ca027`) and the intermediate re-freeze (`d986c273`) were superseded; the
`d986c273` (c) failure is history (§8), not the claim under review.

## 1. The four legs hold on the final bytes

(a) `node scripts/check-filechooser-r78.mjs --lane … --receipt corpus/evidence/round78/chromium-file-chooser/receipt.json
--expect-driver-sha256 0ae89d… --expect-nonce tabi-r78-l1-bf94adaab578 --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json`
→ exit 0, `clean`, 186 checks (`.ufo/waves/round-78-seats/R78Critic/counter-bf94adaa.json`; the
committed `scored/c1-counter-a.json` 16:10:42, `counter-a.exit` 0). The receipt carries `frameTree`
(`mainFrameParentId null`, `mainFrameUrl about:blank`) and 5 `fixtureInputs`; prior set 11 receipts.

(b) `scored/cold-runs.txt` lists five committed cold runs (cold1, R78Exec1, R78Exec2 d1–d3), each
exit 0 clean 186. I re-ran all five with their own nonces, the committed prior set and `--prior` the
scored receipt: `cold1-bf94adaa.json`, `exec1-bf94adaa.json`, `exec2-d1-bf94adaa.json`,
`exec2-d2-bf94adaa.json`, `exec2-d3-bf94adaa.json` — all exit 0, `clean`, 186. Leg (b) holds.

(c) Committed `scored/c1-negatives-a.json`: `allOk true`, 400 cases, 400 passed, 0 failed,
`positiveOk true`, `negatives-a.exit` 0. My independent battery re-run with the frozen arguments
(`battery-bf94adaa.json`, `--jobs 4`) → exit 0, `allOk true`, 400/400, 0 failed. Committed
`scored/c1-killpower-a.json`: `holds true`, `unmutatedExit 0`, `unmutatedOutcome survived`,
`unmutatedLastExit 0`, `unmutatedLastOutcome survived`, force-true 186/186, semantic 76/76,
`survivors []`, `crashed []`, minimum-mutant guard ok, `killpower-a.exit` 0. I verified the committed
kill-power output and re-ran the battery; I did not re-run the full 262-mutant sweep (host load ≈139;
the committed output is the L1's gate, and the battery re-run confirms its unmutated runs). On the
committed bytes leg (c) holds.

(d) `node scripts/selftest-r78-gates.mjs --selftest` → exit 0, `clean=true cases=15 failed=none`
(`selftest-bf94adaa.out`). The capability row names first-working 78 with the r77 note; the note cites
S208-S215; the SKILL registry exists. Leg (d) holds.

No leg is false on D `bf94adaa`; the claim's kill rule does not fire.

## 2. The limit sentence: accepted correction, still imprecise in the frozen text

The frozen sentence says "at least absNeed events AND gapNeed gaps … escapes"; the escape minimum is
`N_p - absNeed + 1` events AND `G_p - gapNeed + 1` gaps — **40 and 3** for the 79-event/11-gap priors
(and 19/3, 18/3 for the 37- and 35-event degenerates). F3 (identity relabel + 40 event-time edits +
3 gap edits) scores exit 0 clean 186 on the final counter (`counter-f3-bf94adaa.json`; limit p1
`absMatched 39/40, gapMatched 8/9, refused false`); F4 (40 events, 2 gaps) is refused (`gapMatched
9/9`); F1 (identity only, abs 79/40) and F2 (uniform +1000 ms, gap 11/9) are refused. The final
counter's thresholds are unchanged (`check-filechooser-r78.mjs:271`: `TOL 0.05, GAP_MIN 50, FRAC 0.5,
GAP_FRAC 0.75, MIN_OWN_GAPS 11`). The L1 accepted this as a correction, not a repair of the frozen
text: SCORECARD Correction 5 and `corpus/lessons/round-78.md` Corrections 1 record it, and r79 prints
the escape minimum beside the threshold. The frozen sentence remains a sufficient condition, not the
escape minimum; the correction is on the record.

## 3. Node-id relabel: inside by design (confirmed on the final counter)

F5 = F3 + a consistent relabel of the browser-assigned `backendNodeId` (5→105, 7→107, 14→114, 18→118
at every occurrence: legs, set params, CDP sends/events, legShape) scores exit 0 clean 186
(`counter-f5-bf94adaa.json`; `nodeReport` 105/107/114/118). The receipt still proves the page element
through `fixture-descriptors` (the commanded point lies inside the page-measured rect of the input with
the measured tag/type/multiple/webkitdirectory/accept), `mode-law` (the chooser mode equals the
measured `multiple`), and `node-binding-law` (one id per input, distinct, the set targets the opened
id). The id's referent is opaque; a consistent relabel is undetectable — QUALITY 150's declared limit.

## 4. A do-nothing producer can meet (a)-(d)

All four legs are receipt-level: (a) the counter on a receipt; (b) more counter runs; (c) the battery
and kill power, both counter-derived; (d) the selftest, row, note and registry. The only external
anchors are the pinned driver hash, the nonce, the prior set and the host literal — all public. A
synthesised receipt that satisfies the 186 structural checks meets every leg; the limit explicitly
admits "a receipt fabricated from nothing that satisfies every check", and the cheapest relabel (F3)
already does it with 40/3 edits. The claim's coverage is receipt-consistency, not execution evidence;
the limit discloses this.

Other forgery classes tested (on the previous counter; the final counter's checks are the same):
modified driver beside the counter + fields rewritten to the pin → refused `fixture-hash`
(`counter-modified-driver.json`); a second file with the same nonce inside the walked tree → refused
`prior-set-complete` (`counter-dup-same-nonce.json`); a JSON-escaped schema → refused
`prior-set-complete` (`counter-escaped-schema.json`); prose naming the schema → accepted
(`counter-prose.json`); page-stub/eval-trigger/swap-files degenerates → refused by the battery's
laundered cases and the counter's send-log/trust laws.

## 5. C2

Current: `node scripts/check-capability-status.mjs --json` → exit 0, rows 11, claimed 10,
provisional 1, mismatches 0 (`c2-live.json`). The claim's leg (c) (verified row 78 + historical r77
row `provisional r77`, count 1) holds. The counting command alone is vacuous: appending `provisional`
to every claimed row gives exit 0, provisional 9, mismatches 0 (`c2-allprovisional-current.json`); the
claim's leg (c) count 1 blocks the blanket stamp, but the kill rule does not enforce the count. The old
checker (`7424c865`) on the current SCORECARD also exits 0 (rows 10, claimed 9, provisional 1,
`c2-oldchecker-current.json`) because it skips the r78 row whose first cell carries a suffix; the new
checker (`a4f89829`) counts 11 and adds the named-round-must-list-the-capability rule. The C2 claim
holds; the counting command remains weak. Smallest safe correction: make the provisional set/count part
of the counting command and the kill rule.

## 6. Sourced laws: what S208-S215 actually say at the cited lines

Re-opened the staged tag-155.0.8059.84 files in `.ufo/waves/round-77/sources/` (hashes in
`corpus/SOURCES.md`):

- activation-law: `file_input_type.cc:181-188` — no transient activation → console warning, return, no
  chooser. ✓ S210.
- mode-law: the call is `file_input_type.cc:203-204` — `probe::FileChooserOpened(..., input.Multiple(),
  &suppressed, &canceled);`; the mapping is `inspector_page_agent.cc:1903-1909` — `multiple ?
  SelectMultiple : SelectSingle`. ✓ S210:203 + S211:1899-1913.
- selection-law: `file_input_type.cc:535-556` — non-`multiple` keeps `first_file_only`. ✓ S210:525-556.
- empty-list-law: `file_input_type.cc:536-537` — `if (paths.empty()) return;`. ✓ S210:535-537.
- cancel-law: `file_input_type.cc:465-481` — `if (SetFiles(files) || force) { input+change } else {
  DispatchCancelEvent }`. The unchanged-selection condition is `SetFiles` at `439-463` (`if (!files)
  return false;` and the `HasSameSource` comparison), outside the declared mined ranges (174-224,
  465-481, 483-508, 525-556). The cancel branch is sourced; the unchanged-selection half is not in the
  mined lines.
- not-file-input-law: `inspector_dom_agent.cc:1806-1810` — `if (!html_input_element || FormControlType()
  != kInputFile) return ServerError("Node is not a file input element");`. ✓ S209:1795-1817. The `-32000`
  code is the protocol's ServerError mapping, measured, not in S209.
- selectors: `DOM.pdl:681-691` — `setFileInputFiles` with `files` and `nodeId`/`backendNodeId`/`objectId`.
  ✓ S208.
- intercept-law: `inspector_page_agent.cc:1949-1956` — `suppress_file_chooser_.Set(enabled);
  cancel_file_chooser_.Set(enabled && cancel.value_or(false));`; `Page.pdl:1279-1288` — the experimental
  `cancel` "cancels the dialog by emitting relevant events (if any) … if the interception is enabled".
  ✓ S211 + S212. The `intercept-off` headless cancel is measured; `FileChooserCanceled`
  (`file_input_type.cc:511-513`) is outside the mined ranges.
- read-law: missing path → File of size 0, `arrayBuffer()` rejects `NotFoundError`, `accept` not
  enforced. This is NOT in S208-S215; it is the r77 note's measured row
  (`corpus/knowledge/…round-77.md:70`). The `accept` non-enforcement is supported only by the absence
  of an accept check in `SetFilesFromPaths` (S210:535-556), not by a line.
- coordinate-law: page pointer `clientX/clientY` equal the commanded point is the driver's
  `Input.dispatchMouseEvent` params vs the page events — a self-consistency check, not a Chromium source
  law in S208-S215.
- S214/S215 (client docs): Playwright `FileChooser.element`/`isMultiple` and Puppeteer
  `waitForFileChooser` "This must be called before the file chooser is launched." ✓, but they are
  client-side contracts, not Chromium behaviour.
- Locator error: the note §2 says "S211:1899-1913 calls the probe with `input.Multiple()`"; the call is
  `file_input_type.cc:203`. The r77 closure item 8 already corrected this; the r78 note repeats it.

## 7. Transient lane-state defect (historical, fixed)

At 15:15–15:22 the committed `.ufo/waves/round-78/scored/selftest-r78-gates.out` (a JSON document plus
a trailing `clean=true cases=15 failed=none` line) was inside the counter's walked tree. The frozen (a)
command then exited 1 with `prior-set-unparsable` naming that file
(`.ufo/waves/round-78-seats/R78Critic/scored-counter.json`), and the selftest exited 1 with 7 of 15
cases red (`selftest-now.out`). The L1 moved the capture to `.ufo/waves/round-78-seats/L1-selftest/`;
the counter and selftest now pass. The defect is fixable, but it shows the walked tree is mutable: any
JSON-looking non-parsing file under `.ufo/waves/round-78` breaks every receipt's verdict. Keep captures
outside the walked trees and run the `prior-set-unparsable` check after the selftest.

## 8. Re-freeze history

The intermediate re-freeze `d986c273` (digests commit `d986c2735b6b`, battery `74102f20`, kill-power
`494002e5`) had leg (c) false: the battery `allOk false` with two failed cases
(`replay-timeline-own-gap-49.9`, `replay-timeline-too-few-gaps`) and the kill-power output stale
(15:13, old battery). It was superseded by the final D `bf94adaa`, which re-produced the scored receipt
and cold1 with nonce `tabi-r78-bf94adaab578` and re-ran the gates with battery `3387e5f4` and
kill-power `9fdd4ea7`. The final D's (a)-(d) hold; the `d986c273` state is not the claim under review.

## 9. Remaining corrections (none is a leg)

1. The frozen limit sentence still prints `gapNeed` as the escape requirement; r79 prints the escape
   minimum. (Accepted by the L1; SCORECARD Correction 5; lesson Correction 1.)
2. The note §2 locator: `file_input_type.cc:203`, not S211:1899-1913.
3. The C2 counting command: include the provisional set/count in the output and the kill rule.
4. Keep captures outside the walked trees; run `prior-set-unparsable` after the selftest.

Report: .ufo/waves/round-78/w1/R78Critic.md
