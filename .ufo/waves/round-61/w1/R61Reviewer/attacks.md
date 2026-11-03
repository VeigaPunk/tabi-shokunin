# R61Reviewer attacks

Axes: **adjacency (8, C1)** and **coverage (9, C2)**. Recommendation only, not admission. Claims were read in full before investigation; no predicate, route, instrument, or shared artifact was amended. Paths below are lane-relative unless absolute. Exact instrument generations and retained source copies are in `pins.json`, `builder-pins.json`, and `*.reviewed.txt` here. Builders were concurrent; findings apply to those bytes, not an unspecified future generation.

## Findings, severity order

### A5-HEADER — MAJOR — frozen C1(d) cannot pass the unchanged counter

Attacked text, claims.json:27: “the unchanged r60 wide-screen counter ... run at scope=wide over the same snapshot-r61.tsv exits 0 with predicate true”.

The SHA-pinned snapshot `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` starts with bytes `6c 61 6e 65 09 0a`, i.e. `lane<TAB><LF>`, not `lane<TAB>head<LF>`. The unchanged counter requires the latter exactly (`round-60/counters/c1-wide-screen-r60.mjs:187-194`). The assigned scope-wide command exits **2**, stderr: `bad snapshot header ...: "lane\t" (expected "lane\thead")`; see `wide-frozen-header.stderr` and `commands.json`. No scan or row-mismatch calculation occurs. Thus unchanged bytes cannot satisfy C1(d)/K4. The v20 parser accepting the blank header (`c1-adjacency-host-v20.mjs.reviewed.txt:262-266`) does not repair the independent unchanged r60 counter. No repair was made by this reviewer.

### A5-CONTROL — MAJOR — the second do-nothing contrast assumes nonexistent frozen-row binding

Attacked text, claims.json:32: “the r60 wide-screen counter pins a different snapshot file, snapshot-r60.tsv” and “running the r60 wide-screen counter against snapshot-r61.tsv at scope=wide exits nonzero (its frozen rows belong to snapshot-r60 heads; rowMismatch > 0)”.

The CLI accepts arbitrary `--snapshot` (`round-60/counters/c1-wide-screen-r60.mjs:820-836`); `run` reads that supplied file (`380-388`). It does not pin snapshot-r60.tsv. Rows are supplied only by optional `--verify-rows`; without it rowMismatch starts at zero and remains zero (`398-410,497-499`). Frozen text never names the old rows file for this control. The actual pinned snapshot refuses for HEADER above, not stale rows. A **counterfactual header-only copy in owned scratch**, with all 20 heads unchanged, exits **0** under the unchanged counter: enumeratedMd=screenedMd=85775, unscreenedMd=0, rowMismatch=0, unresolvableHead=0, roster=20, rowsChecked=0. See `wide-header-only.stdout`, `.command.json`, and `shadow-snapshot.tsv`. This shadow is NOT the frozen snapshot and is NOT evidence that C1 passed. It isolates the additional false premise: even fixing the header would not produce the frozen control's claimed rowMismatch.

### B4-SUPERSET — MAJOR — published runner and additive counter have incompatible receipt contracts

Attacked text, claims.json:41: “receipt (schema superset of the r59/r60 chromium receipt)” and “a copy of the r60 counter b0d03fe0 plus the pointer-domain checks ... exits 0”.

Published `scripts/chrome-cdp-loopback-round61.mjs`, SHA `ed712fb8148b9d41f95c239e25b7821c9d8cb46fb03f0de06a8b2129349388d8`, explicitly says unrelated keyboard legs are not replayed (9-10), declares just `a-pointer-press,b-typed` (194-201), and records those two shots (273,306). It does not populate the carried controlDomain, shift/swallow/CapsLock/form2 journey or 18-step plan. The additive counter carries the r60 requirements (`chromium-receipt-r61.mjs.reviewed.txt`, compare r60 `checkStepPlan`, `evaluate` and `checkForm2`); changing schema only gates the added pointer check, not those carried requirements. Therefore this is not a compatible superset.

Additional direct field mismatches: runner `ptrlog` receives the whole `window.__ptrlog`, including mousedown/mouseup/click (160-165,275,305), while counter `checkPointerDomain` accepts only pointermove/down/up in ptrlog (`reviewed.txt:1737-1740`). Counter requires `pointerEventOrder` (`1750-1754`); runner never assigns it. Runner nonce accepts arbitrary lowercase/digits/hyphens (76-77); counter accepts exactly 12 hex after tabi-r61 (`637`), so the runbook's 8hex example would fail nonce-shape too. The runner does implement actual pointer dispatch, focus readback, per-character typing and curl closure fields; those do not remove the incompatible fields. Static contract finding, not a claimed live run. Retained probe receipt separately demonstrates mixed ptrlog, but is explicitly only a probe, not final data.

### A2-AID — MINOR — an affected authoring caller still calls the removed head source

Attacked text, claims.json:27(b): “the per-run head snapshot is REPLACED by the frozen snapshot file”.

`c1-adjacency-host-v20.mjs.reviewed.txt:355-358` accepts `snapshot` in `listObserved` but calls removed `headSnapshots(fleet, roster)`. With required corpus/adjacency.tsv copied into owned scratch, `--list-observed --fleet ... --snapshot ...` exits **1**, `ReferenceError: headSnapshots is not defined`. See `v20-authoring-aid.stderr` and `extra-commands.json`. This is an affected advertised CLI caller, not evidence that the canonical runAt path reads live sibling bytes.

### A2-ERROR — MINOR — disclosure exists on evaluated red results, not every exit

Attacked text, claims.json:27(b): “a sibling whose LIVE head moved past its snapshot head is reported in the output's drift disclosure”.

Canonical `runAt` appends drift after `verify`, even with findings (`reviewed.txt:329-351`): my frozen-revision run exits **1**, findings=198 (r61 ledgers absent at that revision), drift.length=7. So findings>0 does NOT suppress disclosure. However an unreadable map revision hits `die` before snapshot/drift acquisition (`330-331`); CLI/parser/read exceptions also use error-only `die`. My all-zero revision exits **2** with only schema/error and no drift (`v20-unreadable-rev.stderr`). If “every exit path” is intended, it is not implemented; if disclosure is only required for evaluated results, this is a scope clarification, not a K1 failure.

### B1-IDENTITY — NOTE — r60 refusal is schema identity, not rejection of pointer additions

Attacked text, claims.json:41: “exit 1 (cross-refusal: the pointer schema is outside its frozen shape)” and killRules.C2.f4: “exits 0 -> the receipt shape is indistinguishable ...”.

r60 `SCHEMA` is exactly `tabi-chrome-cdp-r59` (630); first evaluated check is `rec.schema !== SCHEMA -> schema-wrong` (1758), before nonce and driver checks. With the published runner's r61 schema, that is the first refusal. Adding pointerDomain and ptrlog to a known-green r59 fixture leaves it green (exit **0**); changing only its schema to r61 yields exit **1**, one finding `schema-wrong`. See `r60-pointer-superset.stdout` and `r60-pointer-new-schema.stdout`. Therefore cross-refusal can be obtained by a label alone; it does not establish semantic novelty of pointer fields. This does not itself trip frozen f4 for an r61-labeled live receipt.

### B2-MUTANT — NOTE — f2 requires occurrence/order binding; mutant wording needs precision

Attacked text, claims.json:86: “C2': check only the first pointer entry -> forgery f2 (first pointerdown deleted, later entries intact) greens -> KILLED.”

An existence-only `some(pointerdown)` cannot detect deletion of an early down when another survives. Conversely demanding that the first pointer entry be pointerdown would reject the legitimate leading pointermove. The necessary check is a dispatch/occurrence-bound sequence or matching pair discipline, not mere existence. The inspected r61 counter compares pointer type subsequence with the chronological mouse/pointer log, then requires a preceding down for each mousedown/up (1750-1774). My synthetic two-click control passes; removing the first ptrlog down while retaining the later down fails `pointer-order-wrong` (exit **1**). See `synthetic-f2.stdout`. Changing only the per-entry loop to inspect one entry would leave this independent order rejection intact, so f2 does not necessarily green that literal mutant. Do not call a compound removal a single-loop mutation without disclosure.

## A1: every frozen C1 clause mapped to mechanisms

- **(a)** “P1 audit re-derivation”: v19 verify:153-174, cached sibling reader:143-150. “P2 roster completeness”:176-185 plus host rosterScan:338-354. “P3 bounded delta screen”:188-299 (per-lane/per-file indexes, byte/hash/line/hit/head and quote checks). Generation/schema/constants live at 79-80,94-96,724-727 and selftest output705; r61 regeneration belongs to the separate rebind tool, not an existing v19 CLI. Rebind uses its imported v20 snapshot parser and head-bound cat-file reader (rebind-r61:65-86). All these clauses have implementation homes; the name/revision changes are real new work.
- **(b)** Replace v19 headSnapshots:318-325, called at runAt:368, with file parsing. Keep makeSibRefGit:328-334 using supplied frozen heads; keep headOf passed at376 for ledger head checks. New drift disclosure needs a separate advisory LIVE HEAD observation; there is no v19 drift output. Literal “never a fresh rev-parse” cannot cover that advisory observation as well as prohibit all fresh head reads: distinguish source-of-bytes from disclosure. Observed v20 runAt does distinguish them. P1 will still refuse a stale-at-snapshot status via audit-status-mismatch; green with stale LIVE state is intentional frozen-snapshot behavior, not an undisclosed freshness measurement. No evidence found that canonical P1 is bypassed.
- **(c)** Carry v19 cases from selftest:418 onward. New required-argument path belongs to CLI714-721; moved-head/drift and unresolvable-head cases require host-layer coverage, not pure verify alone. v19's null/undefined reader results conflate unresolved/missing states (328-334), so explicit object resolution is genuinely new. Inspected v20 adds cat-file commit checks and host cases. I did NOT run its selftest because that function hard-codes another seat's scratch directory (reviewed.txt:389-392) and creates fixture repositories there, outside my write authority.
- **(d)** Separate unchanged r60 CLI is the home. It DOES accept arbitrary --snapshot; see A5 findings. This clause has a home but the exact frozen input is incompatible with it, so the complete frozen delta is not attainable as written.

## A3: before-state comparison

Required v19 command at `7032914cb5229dc9ce2b867827e6f1ee5db7673b` exits **1**, predicate=false, findingCount=**18**, counts roster20/map16/audit16/deltaLanes20/bgScreenSiblings20. This matches measuredAtFreeze numerically; no mismatch finding. `commands.json` and `v19-before.stdout` retain full output. The claims.before.command names baseline 6c5c2a2..., whereas my assignment explicitly requests frozen-claims revision 7032914...; I used the latter and do not claim to have rerun the former.

## A4: K2 reachability

K2 says unchanged/live v19 at SAME data revision goes green. v19 always reads **r59**, not r61, ledgers (79-80,362-376). Merely rebinding r61 ledgers cannot make v19 green. For each present screened file, v19 requires its live HEAD to equal the r59 delta row's exact head (253-255), in addition to hashes/lines/hits/quotes and audit statuses. Thus ordinary forward sibling commits or content-only reverts do not undo a head mismatch; restoring the exact recorded refs (and compatible roster/map) could. K2 is a conservative possible counterfactual, not a premise that drift will naturally reverse. No sibling refs were changed, no fixture commits made, and no actual data revision existed to test its final K2 outcome.

## B3: f4 is not already refused by carried r60 checks

The r60 check has no pointer trust validation. In the known-green synthetic pointer superset, deleting the first pointermove isTrusted from both pointer copies still exits **0** (`r60-pointer-trust-deleted.stdout`). So **NO**, r60-carried checks alone do not make f4/C4 vacuous. In the inspected r61 generation the explicit trust check rejects f4 with pointer-trust-wrong (`synthetic-f4.stdout`). Wording detail: that line contains both `!has(e,'isTrusted')` and `e.isTrusted !== true`; dropping only the presence subexpression still rejects absent trust through undefined!==true. The mutant must specify whether it removes the whole enforcement or only the has() guard.

## Evidence boundaries / residual risk

Full argv and exit codes are retained in commands.json, extra-commands.json, synthetic-commands.json and wide-header-only.command.json. Synthetic receipts are adversarial fixtures, NOT new browser observations. No Chromium, listening ports, other agent, or background process was started by me; consequently I make no new runtime teardown claim. The existing probe's closure fields were read, not independently remeasured. No tools installed or upgraded.

LSP prerequisite: `read xd://lsp` returned “No such tool”; no LSP device/server was available to answer status, references, definition, or diagnostics. Text search/line reads were therefore the fallback, not semantic reference proof. Actual file diff was inspected via read-only git diff --no-index (exit1 denotes differences). This review is not a fleet runtime, rerouting, saturation, or resume-path admission: no resume/run orchestration code changed in these targets, and no resume_continuity_v1 claim is made.

Later builder edits, instrument-freeze identities, the actual committed data revision, full carried selftest execution, live receipt F runs, and host teardown all remain integration-owner verification obligations. These gaps do not weaken the reproduced frozen snapshot-header and control-premise findings.
