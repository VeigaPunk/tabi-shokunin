# note-review — corpus/knowledge/chromium-file-chooser-runtime-round-78.md

Independent re-derivation over 9 receipts (p1-p4, s1-s3, the scored receipt, cold1) with
`/fast/scratch/hyaku/tabi-r78/R78Scribe/derive.mjs` (output `derive.out.json`, copied to
`.ufo/waves/round-78-seats/R78Scribe/`), plus counter runs and two crafted-receipt probes. Every
statement below is quoted from the note with its line; the verdict is AGREE / DISAGREE / PARTIAL.

## Header

> `recheck: node scripts/check-filechooser-r78.mjs ... --expect-nonce tabi-r78-l1-<D12> ... (exit 0, 186 checks)`

**DISAGREE at the committed state; AGREE at the current working tree.** Two states were measured:

- At HEAD `d986c273` (the committed tree): the same command with the assignment's nonce
  `tabi-r78-l1-d59ca0270c2a` exits **1** with one finding, `prior-set-unparsable`, naming
  `.ufo/waves/round-78/scored/selftest-r78-gates.out` (a JSON object plus a trailing
  `clean=true cases=15 failed=none` line, so `JSON.parse` fails at byte 7629). Output:
  `.ufo/waves/round-78-seats/R78Scribe/counter-scored.json`.
- After the L1 moved that file out of the walked tree (uncommitted `D` in `git status`; the file is
  tracked at HEAD): the same command exits **0**, `clean`, `checkCount 186`
  (`counter-scored-rerun.json`).
- The current working-tree receipt is a **different run**: nonce `tabi-r78-l1-d986c2735b6b`
  (started 18:25:18Z, 12 gaps). The assignment's nonce now exits 1 `nonce-expected`; the new nonce
  exits 0 clean 186 (`counter-nonce-tabi-r78-l1-*.json`).

The note's `<D12>` is therefore ambiguous: the assignment's D12 is `d59ca0270c2a`, the re-freeze
commit's D12 is `d986c2735b6b`, and the working tree carries the latter. Proposed wording: name the
commit whose D12 the command uses and state that the command must be run on a tree with no
instrument output inside `.ufo/waves/round-78/` or `corpus/evidence/round78/`.

## Intro

> "15 legs, 79 page events per honest run"

**AGREE.** All 9 receipts have `legs.length 15` and `events.length 79` (`derive.out.json`).

> "the pinned driver `scripts/chrome-cdp-filechooser-round78.mjs` and the counter `scripts/check-filechooser-r78.mjs` (186 checks)"

**AGREE.** `driverSha256 0ae89d92…` on all 9; `checkCount 186` on every counter run.

> "Every number below is re-derivable from the committed receipts named beside it."

**DISAGREE in one place.** The `#s 5 in 23 runs` number is not re-derivable from the two cited r77
files; the correct count over the 25 honest r77 runs is 24 (see §1). The `frameTree`/`fixtureInputs`
numbers are re-derivable. Proposed wording: "Every number below is re-derivable from the receipts
named beside it, except the r77 run counts, which come from `corpus/lessons/round-77.md:130` and the
25-receipt set it enumerates."

## §1 `Page.fileChooserOpened.backendNodeId` is not a property of the element

> "The event carries a `backendNodeId` (S212:1303-1304)"

**AGREE.** `.ufo/waves/round-77/sources/Page.pdl` lines 1303-1304 are the comment and
`experimental optional DOM.BackendNodeId backendNodeId`; the staged file's sha256 is
`e944a3b1…` (S212 row).

> "Blink assigns it from the DOM agent's serialization history, not from the element's identity."

**PARTIAL — inference stated as mechanism.** The measured fact is the drift. The mechanism is not
quoted from S212 (which only declares the field); S211:1911 passes `element->GetDomNodeId()`, which
supports "the DOM agent's node id" but not "serialization history". The r77 note already carries the
same inference (`corpus/knowledge/chromium-file-chooser-runtime-round-77.md:86`). Proposed wording:
"the id is the DOM agent's node id for the element (S211:1911 passes `element->GetDomNodeId()`), and
it drifted across honest runs, so it is not a stable property of the element [inference: the id is
assigned by the agent's serialization history]."

> "Across honest runs of ONE pinned driver the same input reported different ids — `#s` 5 in 23 runs and 4 in one, `#m` 7 and 10"

**DISAGREE on the count.** Over the 25 honest r77 runs the r77 lesson enumerates (16 pre-freeze + the
scored run + 3 R77Exec2 + 4 L1-diag + R77Exec1), `#s` is 5 in **24** and 4 in **1**; `#m` is 7 in
**24** and 10 in **1**. Command: a node loop over the 25 files printing
`legShape["pick-single"].opened[0][1]` and `legShape["pick-multiple"].opened[0][1]` →
`s5 24 s4 1 m7 24 m10 1`. The two cited files do show the drift (`R77Exec1/counter.json` derived
`pick-single` 4; `L1-diag/r2.json` `pick-multiple` 10), and both have driver
`9954db07…`; the "23" is the r77 lesson's *all-ids-held* count (`round-77.md:130`), not the `#s`
count. Proposed wording: "`#s` 5 in 24 runs and 4 in one, `#m` 7 in 24 and 10 in one (the r77 lesson
records 23 of 25 runs with every id at 5/7/14/18; the two drift runs are R77Exec1 and L1-diag r2)."

> "The one-id-per-input law survives: the same input keeps one id within a run and different inputs keep distinct ids, so a cross-input swap is refused while a consistent relabel is inside the declared limit."

**PARTIAL — the first clause is right, the "cross-input swap" clause is ambiguous and, read
literally, false.** The counter's `node-binding-law` (`scripts/check-filechooser-r78.mjs:528-539`)
requires one id per input across legs and four distinct ids; a single-leg swap to another input's id
is refused (`swap-one-leg.receipt.json` → exit 1, `node-binding-law`). But a **consistent** swap of
two inputs' ids at every occurrence is clean: `swap-consistent.receipt.json` (5↔7 in the event log,
`legShape`, `legs[].openedNode`, `setParams.backendNodeId`, `cdpSendLog`) → exit 0, `clean`
(`counter-swap-consistent.json`); a consistent relabel 5→105 is also clean
(`counter-relabel-consistent.json`). That is the declared limit, and §5 says so; §1's "cross-input
swap is refused" should not be read as covering the consistent swap. Proposed wording: "a single
leg's id swapped to another input's id is refused (one id per input, distinct across inputs); a
consistent swap of two inputs' ids, like any consistent relabel, is inside the declared limit."

> "the leg's target letter plus a descriptor the page measured before the legs ran (`fixtureInputs`: `tag`, `type`, `multiple`, `webkitdirectory`, `accept`, and the layout rect)"

**AGREE.** `fixtureInputs` is measured at send 9 (`window.__inputs()`), before the first leg
(`window.__setLeg("start")` at send 10); the counter's `fixture-descriptors` check
(`check-filechooser-r78.mjs:482-498`) compares the five descriptors and requires each click point
inside its rect. Nuance: the point→element mapping is the counter's `AT_TARGET` table, not a
page-measured value; the descriptor values and rect are page-measured.

> "reports the id (`nodeReport`) instead of requiring it"

**AGREE.** `nodeReport` is output-only (`check-filechooser-r78.mjs:604`); the per-leg check compares
`opened` modes only (`:474`). The id is still bound to the raw event log by
`legshape-consistency` (driver legShape vs the counter's re-derivation), not to a literal.

> "Client-side corroboration: Playwright's `FileChooser` exposes `element` … and `isMultiple` … — the client answers a chooser through the input it belongs to, never through an id."

**PARTIAL — the quotes are present, the last clause is not in S214.** The staged
`.ufo/waves/round-78/sources/playwright-filechooser.html` has the two quotes at lines 11 and 22
(verified; live re-fetch at 15:25Z byte-identical, sha256 `3dc2d551…`). The docs show the API surface
(`element`, `isMultiple`, `setFiles`); they say nothing about how the client addresses the node
internally. The lesson's own rejected claim 2 says the client property is "its own object model …
not evidence of stability". Proposed wording: "the client API exposes the input element and its
multiple flag and answers the chooser through that element; it does not evidence the CDP id's
stability (the lesson rejects that reading)."

## §2 The chooser mode is the input's attribute

> "Measured mode per element on all 7 pre-freeze receipts and the scored receipt: `#s`,`#d`,`#k` → `selectSingle`, `#m` → `selectMultiple`"

**AGREE.** My derivation over the 7 PRE receipts, the scored receipt and cold1: `pick-single`,
`pick-same`, `pick-first-only`, `pick-missing`, `pick-empty`, `forward-click`, `intercept-cancel` →
`selectSingle`; `pick-multiple` → `selectMultiple`; `dir-mode` → `selectSingle`; `accept-ignored` →
`selectSingle` (`derive.out.json`).

> "`webkitdirectory` does not change the mode (S211:1899-1913 calls the probe with `input.Multiple()`)"

**DISAGREE on the locator.** `input.Multiple()` is at
`.ufo/waves/round-77/sources/file_input_type.cc:203`, inside S210's mined range (200-210). S211:1899-1913
is `InspectorPageAgent::FileChooserOpened`, which receives `bool multiple` and selects
`SelectMultiple`/`SelectSingle` (line 1909-1911); it does not call `input.Multiple()`. Proposed
wording: "(S210:203 passes `input.Multiple()` into the probe; S211:1899-1913 chooses the mode from
that flag)."

> "The r78 counter derives the expected mode from the page-measured `multiple` flag of the descriptor for the leg's target, so the law is tied to the page element, not to a table in the counter."

**AGREE for `mode-law`** (`check-filechooser-r78.mjs:519-527` uses `fixtureInputs`' `multiple`).
Nuance: the per-leg `opened-mode` check (`:474`) compares against the counter's `SHAPE` table, which
still carries literal modes; the sentence is true of the law, not of every check.

## §3 The main frame has an anchor outside the event log

> "Page.getFrameTree before navigation returns the main frame with no parent and url `about:blank`; its id is the id every chooser event and the one `Page.frameNavigated` carry"

**AGREE.** Send 4 is `Page.getFrameTree`, send 6 is `Page.navigate`; the receipt's `frameTree` is
`{mainFrameId, mainFrameParentId: null, mainFrameUrl: "about:blank"}`; `mainFrameId` equals every
chooser event's `frameId` and the one navigation's `frameId` (9 receipts, `derive.out.json`).

> "Using it removes the self-reference in round 77 (the counter compared events to a field the same driver wrote)"

**PARTIAL — it moves the self-reference, it does not remove it.** The r78 counter still compares
events to `r.mainFrameId` (driver-written); it adds `mainFrameId === frameTree.mainFrameId`, but
`frameTree` is also written by the same driver. A consistent rewrite of `mainFrameId`,
`frameTree.mainFrameId`, every chooser event's `frameId` and the navigation's `frameId` is clean:
`frame-relabel.receipt.json` (new id `ABCDEF01…`) → exit 0, `clean`
(`counter-frame-relabel.json`). Proposed wording: "the frame id is now bound to the
`Page.getFrameTree` result the driver recorded, so a forger must rewrite two fields consistently; it
is not an independent anchor (a consistent rewrite is inside the declared limit, measured)."

## §4 Arming is before the click

> "A client must arm interception before the click that opens the chooser: Puppeteer's `Page.waitForFileChooser` says … (S215)"

**AGREE.** Staged `puppeteer-waitforfilechooser.html` line 6 has the quote; live re-fetch
byte-identical (sha256 `9aa1a06e…`).

> "The driver's `Page.setInterceptFileChooserDialog` sends are therefore the first sends of their legs"

**AGREE.** Send 13 (intercept-on), 67 (intercept-cancel), 72 (intercept-off) each follow their
`__setLeg` evaluate and precede the leg's trigger.

> "and the counter requires a chooser event for a leg only when interception was enabled at that leg"

**PARTIAL.** `activation-law` (`check-filechooser-r78.mjs:505-518`) requires a chooser event iff the
leg has exactly one click on `s/m/d/k` with `act === true` **and** interception is on. Interception
is necessary, not sufficient (`script-click` has interception on and no chooser because its click is
untrusted/inactive). Proposed wording: "…only when a click on a file input carried transient
activation while interception was on."

## §5 What a receipt cannot prove

> "A browser-assigned id relabelled consistently everywhere is not detectable (no check pins it)."

**AGREE.** `swap-consistent` and `relabel-consistent` exit 0 clean (above).

> "The counter reads receipts: a forger who rewrites the identity fields and enough event times/gaps of a prior escapes once below the printed per-prior `absNeed`/`gapNeed`."

**AGREE.** The `limit` block prints `priorEvents`, `priorGaps`, `absNeed = ceil(0.5*N_p)`,
`gapNeed = ceil(0.75*G_p)`; the counter refuses when either matched count reaches its need
(`check-filechooser-r78.mjs:276-285`). Cold1's block: 79/11 → 40/9.

> "A receipt outside the two walked trees (`.ufo/waves/round-78`, `corpus/evidence/round78`) is outside the prior-set walk; the pre-freeze harness therefore passes `--tree-exempt <its source receipt>` explicitly"

**DISAGREE on the actor.** `run-prefreeze-gates.sh` passes **no** `--tree-exempt`; it runs the
counter with `--prior-set pf/ps-<k>.txt` only (the source receipt is excluded from that set and is
the receipt under test, so it is exempt by self-path; every other PRE receipt is a prior). The
`--tree-exempt` user is the **battery** (`scripts/negatives-filechooser-r78.mjs:531` passes
`realPath`), and the selftest names it in `tree-exempt-absent`. QUALITY 153's green state says
"`--tree-exempt` passed by the battery only". Proposed wording: "the battery passes
`--tree-exempt <its source receipt>` for each case; the pre-freeze harness needs no flag because the
receipt under test is exempt by path and every other PRE receipt is in its prior set."

> "and the walk still refuses any OTHER file of the schema, including one that carries the run's nonce."

**AGREE**, but **the section omits the rule that actually bit the scored receipt**: the walk also
refuses any file that looks like JSON (a `.json` name in any case, or a first non-blank `{`/`[`) and
does not parse (`check-filechooser-r78.mjs:297-315`). At HEAD that rule refused the scored receipt
because of `.ufo/waves/round-78/scored/selftest-r78-gates.out` (a JSON object plus a trailing text
line); the L1 had to move the file out of the walked tree. Proposed addition: "the walk also refuses
a file that looks like JSON and does not parse, whatever its schema — an instrument's own output
inside a walked tree is a refusal (measured: the selftest output at HEAD; keep outputs out of the
trees)."

## §6 Measured facts a consumer can rely on

> "`DOM.setFileInputFiles` on the opened node delivers trusted `input`+`change` with exact bytes"

**AGREE.** `pick-single`/`pick-multiple`/`pick-first-only`/`pick-missing`/`accept-ignored` have
`isTrusted true` on `input`/`change`, files `[name, size, type]` exact, and reads
`hex:746162692d616c7068610a` / `hex:00010203ff` (`derive.out.json`).

> "an unchanged selection fires `cancel`"

**AGREE.** `pick-same`: `cancel@s` with the previous files, state unchanged.

> "`[]` fires nothing and keeps the selection"

**AGREE.** `pick-empty`: only the pointer/click events; `stateAfter` equals `pick-missing`'s state
(`s: tabi-missing.txt`), no `input`/`change`/`cancel`.

> "A non-file node is refused `{code -32000, message: "Node is not a file input element"}` (S209:1809)"

**AGREE.** `not-file-input` leg: `setParams.objectId`, `setError` exactly that pair; staged
`inspector_dom_agent.cc:1809` is the `ServerError("Node is not a file input element")` line.

> "`--headless=new` cancels a chooser opened with interception disabled, with no `fileChooserOpened` event (measured `intercept-off` leg)"

**AGREE.** `intercept-off`: `opened false`, one `cancel@s`, no chooser event after its trigger send.

> "re-measured here on 7 receipts, all 186 checks clean"

**AGREE historically.** `pf/out/pf-p{1..4}.counter.json` and `pf-s{1..3}.counter.json` are
`clean 186`; I reproduced p1 clean 186 with `pf/ps-p1.txt` and
`--tree-exempt corpus/evidence/round78/chromium-file-chooser/receipt.json` (`counter-p1b.json`).
The qualifier is that the scored receipt now sits in the walked tree, so a re-run needs that
exemption (or the scored receipt as a prior).

## Evidence list

> `.ufo/waves/round-78/controls/c1/probe/p1-p4.receipt.json`, `…/smoke/s1-s3.receipt.json`, `…/pf/out/pf-*.{counter,battery,killpower}.json`

**AGREE with the files; the `p1-p4`/`s1-s3` forms are shorthand.** Actual names are
`p1.receipt.json`…`p4.receipt.json`, `s1.receipt.json`…`s3.receipt.json`; the `pf/out` glob matches
the counter/battery/kill-power outputs. The note does not list cold1
(`.ufo/waves/round-78-seats/L1-cold1/receipt.json`), which the assignment's status cites; the
assignment's own path `.ufo/waves/round-78/scored/cold1.receipt.json` does not exist (the selftest's
comment at `scripts/selftest-r78-gates.mjs:12` names that wrong path; its code at line 46 uses the
seat path).

## Summary of note defects

1. `#s 5 in 23 runs` → 24 (measured; the 23 is the r77 all-ids-held count).
2. `S211:1899-1913 calls the probe with input.Multiple()` → S210:203.
3. "Using it removes the self-reference" → it doubles the driver-written field; a consistent frame
   relabel is clean (measured).
4. "the pre-freeze harness therefore passes --tree-exempt" → the battery does; the harness does not
   (QUALITY 153 says "battery only").
5. §5 omits the unparsable-JSON-looking-file refusal, which refused the scored receipt at HEAD.
6. "a cross-input swap is refused" → only the inconsistent (single-leg) swap; a consistent swap is
   inside the limit (measured).
7. "the client … never through an id" → not in S214; the lesson's rejected claim 2 says the
   opposite reading is unsupported.
8. "Blink assigns it from the DOM agent's serialization history" → inference, not a quoted line.
