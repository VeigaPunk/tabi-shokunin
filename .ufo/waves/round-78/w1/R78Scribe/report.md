FINDINGS

# R78Scribe — independent re-derivation of the r78 note and lesson Gate

Seat: R78Scribe (leaf, no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
All paths below are lane-relative unless absolute. JSON outputs and crafted receipts are under
`.ufo/waves/round-78-seats/R78Scribe/`; this report and the three drafts are the only files under
`.ufo/waves/round-78/w1/R78Scribe/`. No git/jj mutation; no writes to the walked trees
(`.ufo/waves/round-78`, `corpus/evidence/round78`). No tool installs (no pacman; `curl` and `node`
were already present).

## 1. What was run

- Derivation over 9 receipts (p1-p4, s1-s3, the scored receipt, cold1):
  `node .ufo/waves/round-78-seats/R78Scribe/derive.mjs <9 paths> > derive.out.json` → exit 0,
  243109 B; copy at `.ufo/waves/round-78-seats/R78Scribe/derive.out.json` (the script is copied
  there too; the original ran from `/fast/scratch/hyaku/tabi-r78/R78Scribe/`, since removed).
- Counter on the scored receipt at HEAD (before the L1's move), assignment nonce:
  `node scripts/check-filechooser-r78.mjs --lane <abs> --receipt corpus/evidence/round78/chromium-file-chooser/receipt.json --expect-driver-sha256 0ae89d92… --expect-nonce tabi-r78-l1-d59ca0270c2a --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json`
  → **exit 1**, one finding `prior-set-unparsable` naming
  `.ufo/waves/round-78/scored/selftest-r78-gates.out` (`counter-scored.json`).
- Selftest at HEAD: `node scripts/selftest-r78-gates.mjs --selftest` → **exit 1**, 7 of 15 cases
  fail on `prior-set-unparsable` (`selftest-now.out`).
- Counter after the L1 moved that file out of the walked tree (uncommitted `D`):
  same command → **exit 0**, `clean`, `checkCount 186` (`counter-scored-rerun.json`).
- Selftest after the move: **exit 0**, 15/15 (`selftest-rerun.out`).
- Current working-tree receipt: nonce `tabi-r78-l1-d986c2735b6b`, started 18:25:18Z, 12 gaps.
  Counter with the new nonce → exit 0 clean 186; with the assignment's nonce → exit 1
  `nonce-expected` (`counter-nonce-tabi-r78-l1-d986c2735b6b.json`,
  `counter-nonce-tabi-r78-l1-d59ca0270c2a.json`).
- p1 reproduction: `--prior-set pf/ps-p1.txt --tree-exempt corpus/evidence/round78/chromium-file-chooser/receipt.json`
  → exit 0 clean 186 (`counter-p1b.json`).
- Committed (a) receipt: `git show HEAD:corpus/evidence/round78/chromium-file-chooser/receipt.json`
  → `head-D-receipt.json`; counter with the D nonce, the prior set and the working-tree run exempted
  → exit 0 clean 186 (`counter-head-D.json`).
- Crafted-receipt probes (under the seat dir; run against a scratch mirror lane, since removed):
  consistent 5↔7 swap → exit 0 clean (`counter-swap-consistent.json`); single-leg swap → exit 1
  `node-binding-law` (`counter-swap-one-leg.json`); consistent 5→105 relabel → exit 0 clean
  (`counter-relabel-consistent.json`); consistent frame-id rewrite → exit 0 clean
  (`counter-frame-relabel.json`).
- C2: `node scripts/check-capability-status.mjs --json` → exit 0, `mismatches 0`, `provisional 1`
  (`c2-now.json`).
- Live source re-fetch: `curl -sS https://playwright.dev/docs/api/class-filechooser` → http 200,
  50956 B, sha256 `3dc2d551…b948`; `curl -sS https://pptr.dev/api/puppeteer.page.waitforfilechooser`
  → http 200, 54126 B, sha256 `9aa1a06e…c6fa`; both byte-identical to the staged copies and
  `sources/FETCH.txt` (copies at `.ufo/waves/round-78-seats/R78Scribe/live-*.html`).

## 2. Derivation result (agreement with the note's measured core)

Over the 7 PRE receipts, the scored receipt and cold1 (`derive.out.json`):

- **15 legs, 79 page events** on all 9.
- **Page events per leg** (scored receipt): `pick-single` pointerdown/mousedown/pointerup/mouseup/
  click/input/change/read on `s`; `pick-multiple` the same on `m` plus two reads; `pick-same` the
  pointer set plus `cancel@s`; `pick-empty` the pointer set only; `dir-mode` the pointer set on `d`;
  `forward-click` `f` pointer set + untrusted `click@s` + input/change/read; `script-click`
  untrusted `click@s`; `not-file-input` no page events; `intercept-cancel`/`intercept-off` the
  pointer set + `cancel@s`.
- **File lists** exact: `tabi-a.txt` 11 B text/plain, `tabi-b.bin` 5 B application/octet-stream,
  `tabi-missing.txt` 0 B text/plain; reads `hex:746162692d616c7068610a`, `hex:00010203ff`,
  `error:NotFoundError`.
- **Chooser modes**: `#s`/`#d`/`#k`/`#f`→`#s` `selectSingle`, `#m` `selectMultiple`; 10 chooser
  events per receipt.
- **Node ids**: `s` 5, `m` 7, `d` 14, `k` 18 on all 9 receipts; one id per input, distinct; the
  driver's `openedNode` equals the raw event log's `backendNodeId` on every leg (MATCH on 9/9).
- **State-after**: the model's S0-S6 states match; `pick-empty`'s state equals `pick-missing`'s
  (selection kept); `pick-same`'s state unchanged.
- **Frame tree**: `mainFrameId` equals `frameTree.mainFrameId`, parent null, url `about:blank`; all
  chooser events and the one `Page.frameNavigated` carry that id; navigation url
  `origin + /?run=<nonce>` (9/9).
- **Intercept sends** are the first sends of their legs (ids 13, 67, 72 in the scored receipt);
  `Page.getFrameTree` (send 4) precedes `Page.navigate` (send 6).
- **Non-file node**: `{code:-32000, message:"Node is not a file input element"}`; staged
  `.ufo/waves/round-77/sources/inspector_dom_agent.cc:1809` is the ServerError line.

The note's §2 mode table, §3 frame-tree facts, §4 send order and §6 measured facts all agree with
this derivation. The defects are in the note's counts, locators and limit sentences.

## 3. Note review (details in `note-review.md`)

Disagreements, each with the measured evidence:

1. **`#s 5 in 23 runs` → 24** (`corpus/knowledge/chromium-file-chooser-runtime-round-78.md:17`).
   Over the 25 honest r77 runs the r77 lesson enumerates, `#s` is 5 in 24 and 4 in 1; `#m` is 7 in
   24 and 10 in 1 (node loop over the 25 files → `s5 24 s4 1 m7 24 m10 1`). The "23" is the r77
   lesson's all-ids-held count (`corpus/lessons/round-77.md:130`), not the `#s` count.
2. **`S211:1899-1913 calls the probe with input.Multiple()`** (note:34). `input.Multiple()` is at
   `.ufo/waves/round-77/sources/file_input_type.cc:203` (S210's range); S211:1899-1913 receives
   `bool multiple` and selects the mode.
3. **"Using it removes the self-reference"** (note:43). The r78 counter still compares events to
   `r.mainFrameId`; `frameTree` is written by the same driver. A consistent rewrite of
   `mainFrameId`, `frameTree.mainFrameId`, all chooser `frameId`s and the navigation `frameId` is
   clean (`frame-relabel.receipt.json` → exit 0 clean).
4. **"the pre-freeze harness therefore passes --tree-exempt"** (note:62). `run-prefreeze-gates.sh`
   passes no `--tree-exempt`; the battery is its only user (`scripts/negatives-filechooser-r78.mjs:531`),
   and QUALITY 153's green state says "`--tree-exempt` passed by the battery only".
5. **§5 omits the unparsable-JSON-looking-file refusal** (`check-filechooser-r78.mjs:297-315`). That
   rule, not the schema walk, refused the scored receipt at HEAD because of
   `.ufo/waves/round-78/scored/selftest-r78-gates.out`.
6. **"a cross-input swap is refused"** (note:23-24). A single-leg swap is refused
   (`node-binding-law`); a **consistent** 5↔7 swap is clean (`swap-consistent` → exit 0). §5 says a
   consistent relabel is undetectable, so §1's wording must be narrowed.
7. **"the client … never through an id"** (note:28-29). S214 shows `element`, `isMultiple`,
   `setFiles`; it says nothing about how the client addresses the node. The lesson's rejected claim 2
   says the client property is its own object model, not evidence of stability.
8. **"Blink assigns it from the DOM agent's serialization history"** (note:16) is an inference;
   S212:1303-1304 only declares the field. S211:1911 (`element->GetDomNodeId()`) supports "the DOM
   agent's node id", not the assignment history.

The note's header recheck `(exit 0, 186 checks)` is true only on a tree with no instrument output in
the walked trees, and its `<D12>` is ambiguous: the assignment's D12 is `d59ca0270c2a`, the
re-freeze commit's is `d986c2735b6b`, and the working-tree receipt carries the latter (counter with
the old nonce → exit 1 `nonce-expected`; with the new nonce → exit 0 clean 186).

## 4. Gate review (details in `gate-review.md`)

- **S214 (Playwright FileChooser)**: quote present at the locator (staged HTML lines 11 and 22,
  `fileChooser.element`/`fileChooser.isMultiple`); tier A defensible for the client-side contract;
  `used-by` resolves to the note. **Defect:** the `teaches` cell says "not through a
  browser-assigned id", which the docs do not state and the lesson's rejected claim 2 contradicts.
  Live re-fetch byte-identical (sha256 `3dc2d551…`), so "not edited" is verified, not self-reported.
- **S215 (Puppeteer waitForFileChooser)**: quote present (staged line 6, the caution paragraph);
  tier A defensible; `used-by` resolves. Live re-fetch byte-identical (sha256 `9aa1a06e…`).
- **Census**: `scripts/sources-census.sh` is fleet-root-relative
  (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`), not under the lane's `scripts/`;
  `census/start.txt` ends `tabi ok …` and `exit=0`. 213 at base is correct (215 now, S214/S215 new);
  the census file prints no row count, so 213 is an inference from the registry.
- **S213 correction**: the quoted comment spans **134-137**, not 134-136 (line 137 is "the solution
  is to eval the element value to a new FileList directly."); the staged file is 6124 B, sha256
  `c86ed958…c445`, matching the lesson.
- **Rejected claim 3 (mainFrameId)**: the rejection is right that r77 was self-referential and r78
  adds the `Page.getFrameTree` result, but the result is also driver-written; a consistent rewrite
  is clean (measured). The flip condition does not cover it.
- **Admitted note**: the lesson's summary "what a receipt cannot prove" inherits the note's §5
  omissions (unparsable-file rule; consistent frame-id rewrite).

## 5. Mistakes review (details in `mistakes-review.md`)

Eight rows; `captured-by` is the right criterion for all eight. Two fixes can fail (row 1
demonstrated, row 2 by misuse), one is latent (row 7), and one row's final-state claim is false on
the current working-tree run:

- **Row 1 (scope, self-write collision)**: the fix names only `run-prefreeze-gates.sh`; the
  **selftest output** in the walked tree reproduces the class. At HEAD the counter on the scored
  receipt exits 1 `prior-set-unparsable` and the selftest exits 1 (7/15). The L1 moved the file out
  (uncommitted `D`), after which both pass; the fix is a manual move, not an enforced rule. QUALITY
  151's green state also names only the harness.
- **Row 2 (path exemption)**: `--tree-exempt` is caller-declared and unconstrained; the counter
  cannot distinguish a legitimate source receipt from a receipt that should be a prior. The lesson
  says "used only by the pre-freeze harness/gates"; the battery is the only user (line 531), and the
  harness passes none (QUALITY 153: "battery only").
- **Row 3**: guard at `negatives-filechooser-r78.mjs:523` is sound; stale "398/398" (final frozen
  battery is 397 cases).
- **Row 4**: coverage rule sound (`:579`), but the evidence cell names no file; the only artifact
  with `coverageGap 15` is `lesson-proof/prior-set-path-exemption.txt:2`, which records the count,
  not the 15 ids. The sweep line "every red state above" is false for this row.
- **Row 5**: `c1-nowork.json` has 9 findings (verified); "9 priors each" is stale — the committed
  `pf/out/pf-p1.counter.json` and `pf-s1.counter.json` have `priorSet.length 10` (9 r78 + r77).
- **Row 6**: placement guard sound (`placed(p,'need',…)` throws unless `abs >= need`); the evidence's
  "QUALITY 149/155" cites a nonexistent row 155 (QUALITY ends at 154).
- **Row 7**: driver `LEG_SHAPE` is modes-only and the predicate uses `modeShape`
  (`scripts/chrome-cdp-filechooser-round78.mjs:441-470`), so the producer fix holds; latent risk:
  the counter's `SHAPE` still carries literal ids (`check-filechooser-r78.mjs:127-145`) that no
  check compares, so a future full-array comparison would reintroduce the pin.
- **Row 8**: the 0.051 witness is sound (`keepScattered` adds the shift without `q()`; at TOL 0.05
  it accepts, at 0.06 it refuses; `M-timeline-tol-0.06` is killed in the 15:13 kill-power output).
  But "kill power holds" is **false at the final frozen bytes on the current working-tree scored run**: the final
  battery (397 cases) fails two cases (`replay-timeline-own-gap-49.9`,
  `replay-timeline-too-few-gaps`), so the unmutated baseline is not clean and kill power reports
  `holds false` with `survivors []` (`.ufo/waves/round-78-seats/R78Exec1/kill-power-a.json`, 15:26).
  The two cases are the **own-gap** brackets, not the TOL witness: the new scored receipt has **12**
  `>= 50 ms` gaps (my computation over its 79 events: 54.1, 317.3, 303.3, 313, 303.1, 302.1, 337.7,
  332.9, 305.4, 315.4, 2128.3, 340.5), while the cases assume exactly `MIN_OWN_GAPS = 11`; shrinking
  one gap to 49.9 leaves 11 (still >= 11), so the counter accepts. On the 11-gap PRE receipts the
  same cases refuse. This is the receipt-dependent-guard class QUALITY 149 warns about.

## 6. State findings (the predicate's legs at the measured states)

The lane moved while I measured; both states are reported.

| state | scored receipt | counter (re-run) | battery | kill power | selftest |
|---|---|---|---|---|---|
| HEAD `d986c273` (committed) | D run, nonce `tabi-r78-l1-d59ca0270c2a`, 11 gaps (`git show HEAD:corpus/evidence/…/receipt.json` sha256 `203dcef9…`) | committed output clean 186; **re-run at HEAD exit 1** `prior-set-unparsable` (selftest output in the walked tree) | committed output 398 cases allOk true (`git show HEAD:.ufo/waves/round-78/scored/c1-negatives-a.json`); the frozen battery is 397 cases | committed output `holds true` (`git show HEAD:.ufo/waves/round-78/scored/c1-killpower-a.json`), old bytes | **exit 1**, 7/15 |
| working tree (15:25-15:26, uncommitted) | re-run, nonce `tabi-r78-l1-d986c2735b6b`, 12 gaps (sha256 `eb0a6a2c…`) | exit 0 clean 186 with the new nonce; exit 1 `nonce-expected` with the assignment's nonce | **exit 1, allOk false**, 2 failed (`c1-negatives-a.json`, `negatives-a.exit` = 1) | **holds false**, survivors [] (`R78Exec1/kill-power-a.json`) | exit 0, 15/15 (after the move) |

Consequences for the frozen predicate:

- **(a)** the committed (a) receipt itself is clean: the HEAD receipt extracted to the seat dir
  (`head-D-receipt.json`, sha256 `203dcef9…`) with the D nonce and the prior set, exempting the
  working-tree new run by path, exits **0** clean 186 (`counter-head-D.json`). The leg failed at
  HEAD only because the selftest output was in the walked tree (re-run at HEAD → exit 1
  `prior-set-unparsable`); after the move it passes. The assignment's nonce no longer matches the
  working-tree receipt, which is a different run (`d986c2735b6b`).
- **(c)** is **not evidenced by a committed 397-case battery output on the (a) receipt**. The (a)
  receipt is the D run (nonce `tabi-r78-l1-d59ca0270c2a`, 11 gaps). The committed scored battery
  output is a 398-case run (`git show HEAD:.ufo/waves/round-78/scored/c1-negatives-a.json`, allOk
  true), not the frozen 397-case battery (`74102f20…`); the committed kill-power output is from
  `60460ed1…`, not the final `494002e5…`. The 397-case battery does pass on an 11-gap receipt —
  R78Review2's scratch-copy `refrozen-battery.json` (allOk true) — but that is not the committed
  scored output. On the **new** working-tree run (nonce `tabi-r78-l1-d986c2735b6b`, 12 gaps) the
  397-case battery exits 1 with 2 failed cases and kill power holds false, so the new run cannot
  stand in for the (a) receipt either. The freeze at D also pins a third 398-case battery
  (`72488728…`) that is not the battery at D (`71bce77d…`).
- **(d)** the selftest passes at the working tree (15/15) but failed at HEAD (7/15); the capability
  row/SKILL registry claims were not re-checked (out of this seat's scope).

Other state findings:

- **Freeze provenance**: at D `d59ca027`, `freeze.txt` pins the battery at `72488728…` while the
  battery bytes at D are `71bce77d…` (`git show d59ca027:scripts/negatives-filechooser-r78.mjs |
  sha256sum`); the final freeze `d986c273` matches the current bytes (`74102f20…`, `494002e5…`,
  `a4f89829…`). The claims' `frozenAt` ("before any post-D (scored) run") is stale for the re-freeze,
  which is after the scored-run commit `b1f33724`.
- **Status-at-dispatch**: "(a) … nodeReport pick-multiple id 10" is false for the scored receipt —
  the counter's `nodeReport` is `pick-multiple [7]` (`counter-scored.json`); id 10 was the first
  cold1 run (`lesson-proof/driver-shape-id-pin.json`) and r77's L1-diag r2.
- **cold1 path**: the assignment's `.ufo/waves/round-78/scored/cold1.receipt.json` does not exist;
  the receipt is `.ufo/waves/round-78-seats/L1-cold1/receipt.json`. The selftest's comment
  (`scripts/selftest-r78-gates.mjs:12`) names the wrong path; its code (line 46) uses the seat path.

## 7. Out of scope / not re-run

- The battery and kill power were **read, not re-run** (the L1's outputs at 15:26; the failing cases
  are explained by my own gap computation). Re-running the 397-case battery is a heavy pass and the
  host is loaded; the committed output and the gap count are sufficient to show the failure.
- C1 legs (b) cold-run acceptance, (d) capability row/SKILL registry, and the full kill-power mutant
  sweep were not re-run; C2 was re-run (exit 0, mismatches 0).
- The note's §1 r77 drift mechanism ("serialization history") is flagged as inference, not falsified.
- I did not edit any product code, judge, commit, or push; no subagent dispatch.

## 8. Artifacts

Under `.ufo/waves/round-78-seats/R78Scribe/`:
`derive.out.json`, `derive.mjs`, `analyze.mjs`, `craft.mjs`, `craft2.mjs`,
`head-D-receipt.json`, `counter-head-D.json`, `counter-scored.json`, `counter-scored-rerun.json`,
`counter-nonce-tabi-r78-l1-d59ca0270c2a.json`, `counter-nonce-tabi-r78-l1-d986c2735b6b.json`,
`counter-p1.json`, `counter-p1b.json`, `counter-swap-consistent.json`, `counter-swap-one-leg.json`,
`counter-relabel-consistent.json`, `counter-frame-relabel.json`, `swap-consistent.receipt.json`,
`swap-one-leg.receipt.json`, `relabel-consistent.receipt.json`, `frame-relabel.receipt.json`,
`selftest-now.out`, `selftest-rerun.out`, `c2-now.json`,
`live-playwright-filechooser.html`, `live-puppeteer-waitforfilechooser.html`.

Drafts: `.ufo/waves/round-78/w1/R78Scribe/note-review.md`, `gate-review.md`, `mistakes-review.md`;
this report at `.ufo/waves/round-78/w1/R78Scribe/report.md`.
