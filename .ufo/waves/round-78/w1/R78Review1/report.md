FINDINGS

# R78Review1 — review of `scripts/check-filechooser-r78.mjs` at frozen bytes (C1, round 78)

**Verdict: FINDINGS.** The current frozen artifact is the D7 counter `4ae2941215b7cad72db4755b32ab78a7077313d98ddce76a617f968792bd518d` (commit `a4d628c8ef4961869aaa9d8530793eeb60daf88e`; `freeze.txt` at that commit carries it; driver `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`; prior-set `95c5d14091348c47fac51252448934ce08bf222327259fb02943ac6249816716`). The pre-D7 review below was made at the earlier frozen bytes `d3a8fd8714ca3448070dfe4a4355e0725ac97527b070952cc9ae89a5f9e0fe09` (commit `d986c273`), which D7 supersedes. Under D7: the scored receipt (`tabi-r78-l1-a4d628c8ef49`, pick-multiple id 10) exits 0 clean 186, the selftest exits 0 15/15, and cold1 (`tabi-r78-cold1-a4d628c8ef49`, pick-multiple id 11) exits 0 clean 186. F1 (unreadable-directory false green) and F5 (`treeExempt` auditability) are fixed in D7; F4 is partial (`isObj(r.sweeps)`, values unvalidated); F2/F3/F6/F7/F9/F10 and the new ENOENT false refusal remain (the L1 routed them to r79). The D7 numbers and per-finding status are in "D7 re-run" and the F-sections. All crafted receipts and counter outputs are under `.ufo/waves/round-78-seats/R78Review1/` (outside the walked trees); no script was edited by this seat; no Chromium run; no tool installs.

## Setup and command prefixes

- Real-lane counter prefix:
  `node scripts/check-filechooser-r78.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json`
- Crafted-receipt prefix (scratch lane = a copy of the committed prior set; receipt under test outside the lane; the driver beside the counter is the real pinned one):
  `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-filechooser-r78.mjs --lane /fast/scratch/hyaku/tabi-r78/R78Review1/lane --receipt /fast/scratch/hyaku/tabi-r78/R78Review1/out/<v>.receipt.json --expect-driver-sha256 0ae89d92… --expect-nonce tabi-r78-rv1-<v> --prior-set /fast/scratch/hyaku/tabi-r78/R78Review1/lane/.ufo/waves/round-78/controls/c1/prior-set.txt --json`
  The scratch lane was removed after the cited outputs were copied here; the receipts are `receipts/<v>.receipt.json`, the outputs `counters/<v>.counter.json`. To reproduce F1, recreate the lane by copying the committed priors, put `e2/fixtures/hidden-scored-copy.receipt.json` in `lane/.ufo/waves/round-78/extra/locked/`, `chmod 000` the directory, and run the prefix with `--receipt receipts/forge-base.receipt.json`.
- The crafted receipts are derived from the `tabi-r78-l1-d59ca0270c2a` scored run (pinned at commit `b1f33724`, sha256 `203dcef9765a74c4c274c0194a506f9189cbb40372758a921bf143e7c7ffd560`) and the PRE receipts; the derived receipts rewrite nonce, launch token, browser id and per-leg times (the declared same-user forgery), then each variant changes one field. `forge-base` is the control: exit 0, clean 186 (`counters/base.counter.json`).

## Baseline (real lane) — note the re-freeze during the review

At ~15:25 the L1 committed `d986c2735b6b` ("digests commit D (re-freeze) — battery deduped (397 cases) … selftest output moved out of the walked trees …"). The counter and driver bytes are unchanged (`d3a8fd87…`, `0ae89d92…`, `freeze.txt:1-2`); the prior-set file is unchanged (`95c5d140…`); `negatives-filechooser-r78.mjs`, `check-capability-status.mjs` and the battery count changed. The scored receipt at the path was replaced by a post-D re-run: the committed `d986c273` receipt is the old `tabi-r78-l1-d59ca0270c2a` run (pick-multiple id 7), while the working file is the new `tabi-r78-l1-d986c2735b6b` run (pick-multiple id 10), uncommitted (`git status --porcelain` shows `M corpus/evidence/round78/chromium-file-chooser/receipt.json`). Both score clean 186.

1. Old scored run (`tabi-r78-l1-d59ca0270c2a`, id 7), the receipt at the path until 15:25:30, after the L1 moved the selftest `.out` out of the walked tree: exit 0, `clean`, `checkCount 186`, `walk {outside:[],unparsable:[]}` (`counters/scored-after-move.counter.json`).
1b. Re-frozen working run (`tabi-r78-l1-d986c2735b6b`, id 10): exit 0, `clean`, `checkCount 186`, `nodeReport pick-multiple [10]`, `walk {outside:[],unparsable:[]}` (`counters/scored-refrozen-d986c273.counter.json`).
2. cold1, re-frozen run (`tabi-r78-cold1-d986c2735b6b`, id 10), with the scored receipt as an extra prior (the selftest's cold-clean invocation, `scripts/selftest-r78-gates.mjs:65`): exit 0 clean 186 (`counters/cold1-refrozen-d986c273.counter.json`). The old cold1 run (`tabi-r78-cold1-d59ca0270c2a`, id 7) was at the seat path until 15:25; its output is `counters/cold1-after-move.counter.json`.
3. cold1 **without** `--prior`: exit 1 `prior-set-complete` for both the old run (`counters/cold1-before-move-no-extra-prior.counter.json`) and the re-frozen run (`counters/cold1-refrozen-no-extra-prior.counter.json`). The canonical counting command shows `--prior` optional; a cold run scored with it alone refuses because the scored receipt sits in the walked tree and is not in the committed prior set. The committed cold evidence adds the scored receipt as a prior (cold1's `counter.json` priorSet has 12 entries); the predicate text should pin that invocation.
4. Before the L1 moved `.ufo/waves/round-78/scored/selftest-r78-gates.out`: scored exit 1 `prior-set-unparsable` (`counters/scored-before-move.counter.json`); cold1 exit 1 `prior-set-unparsable` (+ `prior-set-complete` without `--prior`). The file is a JSON object followed by `clean=true cases=15 failed=none` (`scripts/selftest-r78-gates.mjs:87`); the walk's "first non-blank byte `{` and does not parse" rule refused it. After the move both are clean. This is the live instance of F2.

## D7 re-run (commit `a4d628c8`, counter `4ae29412`)

- Frozen bytes: `sha256sum scripts/check-filechooser-r78.mjs` -> `4ae29412…`; `git show a4d628c8:.ufo/waves/round-78/freeze.txt` line 2 -> `4ae29412…`; driver `0ae89d92…`; prior-set `95c5d140…`. The working counter matches the D7 freeze; the scored receipt and the `.ufo/waves/round-78/scored/` gate outputs are post-D7 and uncommitted (`git status --porcelain` -> `M`).
- Scored receipt (`tabi-r78-l1-a4d628c8ef49`, pick-multiple id 10): **exit 0**, `clean`, `checkCount 186`, `walk {outside:[],unparsable:[]}`, `treeExempt []` (`counters/d7-scored.counter.json`).
- Selftest (`node scripts/selftest-r78-gates.mjs --selftest`): **exit 0**, `ok true`, `cases 15`, `failed none` (`counters/d7-selftest.out`).
- cold1 (`tabi-r78-cold1-a4d628c8ef49`, pick-multiple id 11): **exit 0**, `clean 186`, `walk` clean (`counters/d7-cold1.counter.json`).
- Crafted variants under D7 (`counters/*-d7.counter.json`): the same verdicts as the pre-D7 table — `forge-base`, `forge-idperm`, `forge-rectmove`, `forge-sweeps`, `forge-nested`, `forge-frame`, `forge-port`, `forge-dir` exit 0; `forge-iddup` (`node-binding-law`), `forge-descswap` (`fixture-descriptors`+`mode-law`), `forge-rectout` (`fixture-descriptors`), `forge-extrafield` (`receipt-fields`), `forge-frame-parent` (`frame-tree`), `forge-argv-extra` (`host-argv`), `forge-legshape` (`legshape-consistency`), `forge-sel` (`selection-law`+`leg-pick-first-only-state`), `forge-cancel` (`cancel-law`+`leg-pick-same-files`), `forge-empty` (`empty-list-law`+`leg-pick-empty-*`), `forge-interceptoff` (`intercept-law`+`chooser-event-binding`+`cancel-law`), `forge-trust` (`trust-law`+`leg-script-click-trusted`+`coordinate-law`) exit 1.
- E2 under D7 (`e2/*-d7.counter.json`): locked dir -> **exit 1** `prior-set-unparsable` with `(unreadable directory)` (F1 fixed); `--tree-exempt` -> **exit 0** clean with `treeExempt` listing the real path (F5 fixed); unreadable `.md` -> **exit 1** `prior-set-unparsable` (F2 remains); wrapped double-encoded -> **exit 0** clean (F6 remains); schema-only -> **exit 0**, schema+nonce -> **exit 1** (F7 remains); directory named `*.json` with a receipt -> **exit 1**, empty -> **exit 0**; broken `.json` -> **exit 1**; loop symlink -> **exit 0**; same-nonce copy -> **exit 1**; symlink to a prior -> **exit 0**; broken symlink -> **exit 0**; array -> **exit 0**; missing walk root -> **exit 1** `prior-set-unparsable` (the ENOENT false refusal remains, routed to r79).
- The D7 gate numbers above are the (a)/(b)/(d) legs of C1-FILECHOOSER-R78 as frozen; the remaining findings are not legs of that claim per the L1 and are routed to r79.



`walk()` catches `readdirSync` failure and returns (`scripts/check-filechooser-r78.mjs:299`), with no record in `walk`. A same-user forger can put a receipt of the schema inside a mode-000 subdirectory of a walked tree; the check exits 0 clean and never lists it. The hidden receipt is **inside** the walked trees, so the declared limit ("outside the two walked trees", line 67) does not cover it.

- Crafted: scratch lane `.ufo/waves/round-78/extra/locked/scored-copy.receipt.json` = a copy of the committed scored receipt (`e2/fixtures/hidden-scored-copy.receipt.json`), directory `chmod 000`.
- Command: crafted prefix with `--receipt out/forge-base.receipt.json` -> **exit 0**, `clean`, `walk {outside:[],unparsable:[]}` (`e2/e2-locked-scored.json`).
- Readable control: same file, directory `chmod 755` -> **exit 1**, `prior-set-complete`, `walk.outside [".ufo/waves/round-78/extra/locked/scored-copy.receipt.json"]` (`e2/e2-readable-scored.json`).
- A copy of a prior (p1) in the locked directory behaves the same: `chmod 000` -> exit 0 clean (`e2/e2-locked-dir.json`); readable -> exit 1 (`e2/e2-dup.json`).
- The same applies to a directory named `*.json` with mode 000 (it is walked and skipped) and to any unreadable subdirectory of `corpus/evidence/round78`.
- Finding id: `prior-set-complete` (false negative). This is the headline: the prior-set completeness guarantee is bypassable by a same-user chmod, and the hidden receipt is not outside the trees.
- Fixed in D7 (commit `a4d628c8`): line 301 now pushes `(unreadable directory)` into `unparsable`, so the locked-dir case exits 1 `prior-set-unparsable` (`e2/locked-scored-d7.counter.json`). The pre-D7 frozen bytes (`d3a8fd87`) still had the false green; D7 supersedes them.

## F2 (Medium — false refusal) — unreadable non-JSON file refused under `prior-set-unparsable`

`readFileSync` failure pushes `(unreadable)` into `unparsable` for ANY file (`scripts/check-filechooser-r78.mjs:306`), while the check's stated rule is "files … that look like JSON but do not parse" (line 307). A mode-000 `.md` in the walked tree refuses every honest receipt.

- Crafted: scratch lane `.ufo/waves/round-78/extra/notes.md` (`e2/fixtures/notes.md`), `chmod 000` -> **exit 1**, `prior-set-unparsable` (`e2/e2-unreadable-md.json`).
- Live: the selftest `.out` (baseline 4) refused the scored receipt and cold1 from ~15:14 until the L1 moved it; exit 1 before, exit 0 after. The L1's move fixes the instance; the mechanism remains for any JSON+prose hybrid or unreadable file in the walked trees. This attacks predicate (b)'s zero-honest-refusal target, not a false green.

## F3 (Medium — claim mismatch) — `frame-tree` is not an independent anchor

`frame-tree` (`scripts/check-filechooser-r78.mjs:433`) compares `frameTree` to `mainFrameId` and to the event frameIds. All three are written by the driver from the same `Page.getFrameTree` result (`scripts/chrome-cdp-filechooser-round78.mjs:338-340`); the result itself is not recorded in the receipt (the send log holds only sends; the CDP event log holds only `Page.fileChooserOpened`/`Page.frameNavigated`). A self-consistent forgery passes; the E3 comment "not a self-referential field" (lines 22-23, 431) is false — the check enforces consistency, not provenance.

- Crafted: `receipts/forge-frame.receipt.json` (mainFrameId and all frameIds `0123456789ABCDEF0123456789ABCDEF`, frameTree consistent) -> **exit 0** clean (`counters/forge-frame.counter.json`).
- `receipts/forge-frame-parent.receipt.json` (parent non-null) -> **exit 1** `frame-tree` (`counters/forge-frame-parent.counter.json`), so the consistency check bites.
- Limit: inside the "fabricated from nothing" clause (lines 61-67); the E3 claim is the defect.

## F4 (Medium — claim mismatch) — `receipt-fields`: `sweeps` is unread

`sweeps` is in `RECEIPT_KEYS` (`scripts/check-filechooser-r78.mjs:221`) but never read (`grep -n sweeps scripts/check-filechooser-r78.mjs` -> line 221 only; the driver writes it at `scripts/chrome-cdp-filechooser-round78.mjs:285`). The E3 comment "every key below is read somewhere in this counter, so no bookkeeping field is carried unread" (lines 219-221) is false.

- Crafted: `receipts/forge-sweeps.receipt.json` with `sweeps {preLaunch:99,midRun:-1,postKill:7,extra:"unread"}` -> **exit 0** clean (`counters/forge-sweeps.counter.json`).
- `teardown.postKillSweepCount` is checked (0); `sweeps.preLaunch`/`midRun` are not. Limit: fabricated-receipt clause; the claim is the defect.
- D7 adds `isObj(r.sweeps)` to `receipt-fields`; the values are still unvalidated — `forge-sweeps` exits 0 clean under D7 (`counters/forge-sweeps-d7.counter.json`). Partial, as the L1 accepted; routed to r79.

## F5 (Medium — auditability) — `--tree-exempt` is unauthenticated and unrecorded

The exemption is by real path (`scripts/check-filechooser-r78.mjs:181-184`), and the JSON output has no `treeExempt` field (the `walk` block is trees/outside/unparsable only). A caller can exempt any file; a directory or missing path is silently accepted (no-op), so a typo fails closed with no diagnostic.

- Crafted: readable copy of p1 in the walked tree -> **exit 1** `prior-set-complete` (`e2/e2-dup.json`); with `--tree-exempt .ufo/waves/round-78/extra/dup.receipt.json` -> **exit 0** (`e2/e2-dup-exempt-rel.json`); absolute -> **exit 0** (`e2/e2-dup-exempt-abs.json`); `--tree-exempt .ufo/waves/round-78/extra` (directory) -> **exit 1** (`e2/e2-dup-exempt-dir.json`); missing -> **exit 1** (`e2/e2-dup-exempt-missing.json`).
- The exemption path is not in any output; a reviewer cannot see which files a run exempted. Limit: caller trust boundary; the auditability gap is the defect.
- Fixed in D7: the output carries `treeExempt: [...exemptReal]`; `e2/dup-exempt-rel-d7.counter.json` exits 0 clean and lists the real path. The pre-D7 frozen bytes did not.

## F6 (Low — claim mismatch) — a double-encoded receipt is hidden

The E2 comment "a JSON-escaped schema no longer hides a receipt" (line 287) is false for a string-wrapped receipt: `JSON.parse` yields a string, `isObj` is false, the file is ignored.

- Crafted: `e2/fixtures/wrapped.json` = `JSON.stringify(JSON.stringify(p1))` -> **exit 0** clean (`e2/e2-wrapped.json`).
- A double-encoded file cannot be the receipt under test (`receipt-unreadable` exit 2), so the impact is limited to hiding a prior-set member; claim mismatch.

## F7 (Low — claim mismatch) — "a receipt by its top-level schema alone" is false

The code also requires `nonce` or `events` (line 309). `e2/fixtures/schema-only.json` (schema only) -> **exit 0** clean (`e2/e2-schema-only.json`); `e2/fixtures/schema-nonce.json` (schema+nonce) -> **exit 1** `prior-set-complete` (`e2/e2-schema-nonce.json`). The narrower rule deliberately excludes the driver `.out.json` summaries (schema, no nonce/events), so the code is right and the comment (lines 17, 287) is wrong.

## F8 (Low — precision) — E1: a consistent id permutation escapes by design; the rect is containment-only

- `receipts/forge-idperm.receipt.json` permutes the four backendNodeIds (5<->7, 14<->18) across legs, setParams, cdpEventLog and legShape -> **exit 0** clean; `nodeReport` shows `pick-single 7, pick-multiple 5, dir-mode 18, accept-ignored 14` (`counters/forge-idperm.counter.json`). A non-injective relabel (`receipts/forge-iddup.receipt.json`, s and m both 7) -> **exit 1** `node-binding-law` (`counters/forge-iddup.counter.json`). The id is opaque; the law binds one id per input, distinct and stable, not identity. The element identity is bound by the click point + pinned fixture attributes + mode + the page state model; the id-to-element map does not exist (no `DOM.describeNode` in the allow-list). This is the declared design: ids reported, not pinned (lines 11-16), plus the fabricated-receipt clause (lines 61-67). The limit is exactly there: a consistent permutation is indistinguishable from drift.
- `receipts/forge-descswap.receipt.json` (swap `multiple` and rect between s and m) -> **exit 1** `fixture-descriptors` (`s:multiple,m:multiple`) + `mode-law` (`counters/forge-descswap.counter.json`). A descriptor attribute swap is refused.
- `receipts/forge-rectmove.receipt.json` (all rects = full viewport) -> **exit 0** clean (`counters/forge-rectmove.counter.json`); `receipts/forge-rectout.receipt.json` (s rect moved away) -> **exit 1** `fixture-descriptors` (`point outside`) (`counters/forge-rectout.counter.json`). So "move a rect" passes as long as the commanded point stays inside; the rect is a claim, not a page measurement (no `DOM.getBoxModel` in the send log). Inside the fabricated-receipt limit; the `fixture-descriptors` comment should say "containment", not "measured".

## F9 (Low — precision) — `host-argv`: the two self-derived slots accept replacements

`host-argv` is exact equality with `argvWant` derived from the receipt's own port/token (`scripts/check-filechooser-r78.mjs:249-257`). An extra slot is refused (`receipts/forge-argv-extra.receipt.json` -> **exit 1** `host-argv`, `counters/forge-argv-extra.counter.json`), but a replacement in slot 2 or 4 passes if internally consistent: `receipts/forge-port.receipt.json` (port 55555 in argv/devtools/stderr) -> **exit 0** clean (`counters/forge-port.counter.json`); `receipts/forge-dir.receipt.json` (`/tmp/rv1/profile-<tok>`, upload `/tmp/rv1/upload-<tok>`) -> **exit 0** clean (`counters/forge-dir.counter.json`). The comment "a decoy in any slot … changes the array" (line 248) is true for an extra slot, not for a replacement in the two slots the derivation reads from the receipt. Inside the fabricated-receipt limit.

## F10 (Low — precision) — nested fields are not closed

`receipt-fields` closes only the top-level key set. `receipts/forge-nested.receipt.json` adds `host.evil`, `teardown.evil`, `upload.evil`, `legMarks[0].evil`, `cdpSendLog[0].evil`, `serverLog[0].evil` -> **exit 0** clean (`counters/forge-nested.counter.json`). `allowed()` (lines 440-448) does not check the send-log entry key set; `leg-marks`, `server-log-binding`, `teardown-closure`, `upload-binding` do not close their sub-objects. The E3 comment "an added field cannot ride along unreviewed" (line 24) is true only at the top level. Low: unread data, no verdict effect.

## F11 (Medium — evidence) — the "drift accepted" witnesses are the D7 runs (post-D7, uncommitted at run time)

`status-at-dispatch.txt:2` says "nodeReport pick-multiple id 10 (drift accepted by design)". The old `tabi-r78-l1-d59ca0270c2a` receipt (the one at the path when the status was written) has pick-multiple id 7: `counters/scored-after-move.counter.json`, `counters/cold1-after-move.counter.json` (old cold1), `R78Exec1/counter.json`, `R78Exec2/d1-d3.counter.json` all show `[7]`; p1-p4/s1-s3 all 7. The D7 scored run `tabi-r78-l1-a4d628c8ef49` (id 10) and D7 cold1 `tabi-r78-cold1-a4d628c8ef49` (id 11) score clean 186 (`counters/d7-scored.counter.json`, `counters/d7-cold1.counter.json`), so the drift claim has honest witnesses — the D7 commit `a4d628c8` carries the counter, but the post-D7 scored/cold receipts are uncommitted at the time of this run. The E1 relaxation is exercised by the D7 runs (id 10/11) and by the crafted permutation (F8); the post-D7 receipts must be committed for the (a)/(b) evidence to be pinned.

## F12 (Low — reproducibility) — cold-run invocation and pins

- The canonical counting command shows `--prior` optional; cold1 without it exits 1 `prior-set-complete` (baseline 3). The committed cold evidence adds the scored receipt as a prior (selftest line 65; cold1's `counter.json` priorSet has 12 entries). The predicate text should pin the invocation.
- The prior receipts are tracked at the old D (`git ls-tree -r d59ca0270c2ad1bddc26f81d7688a962465e77d4 -- .ufo/waves/round-78/controls/c1` lists the 11 blobs) and are unchanged at D7 `a4d628c8` (the prior-set file's sha is still `95c5d140…`). The old scored receipt is pinned by commit `b1f33724` (`git cat-file blob b1f33724:corpus/evidence/round78/chromium-file-chooser/receipt.json | sha256sum` -> `203dcef9…`); the D7 scored/cold receipts are post-D7 and uncommitted at the time of this run. `freeze.txt` does not list the scored receipt or the individual priors; the pin lives in git, and the counter's output records each prior's sha256, so a changed prior is visible but not refused.

## F13 (High — freeze integrity) — resolved by D7; the pre-D7 snapshot was between D6 and D7

**Status: resolved by D7 (commit `a4d628c8`).** The patch is committed; `freeze.txt` at D7 carries `4ae29412…`; the previous D `d986c273` is superseded, not repaired. The pre-D7 snapshot below is history; the D7 numbers are in "D7 re-run".

At 15:28:51 `scripts/check-filechooser-r78.mjs` was modified (sha256 `4ae2941215b7cad72db4755b32ab78a7077313d98ddce76a617f968792bd518d`; `git status --porcelain` -> `M`) after the re-freeze commit `d986c273` (frozen blob `d3a8fd87…`, `freeze.txt:2`). The diff is 5 insertions/2 deletions: `receipt-fields` adds `isObj(r.sweeps)`; the `readdirSync` catch pushes `(unreadable directory)` instead of returning; the output adds `treeExempt: [...exemptReal]`; the comment cites this seat. These are exactly F1/F4/F5. At that moment the patch was uncommitted and unfrozen; D7 commits it. The D7 re-run (above) is the current evidence.

- D7 behavior: locked-dir case -> **exit 1** `prior-set-unparsable` with `(unreadable directory)` (`e2/locked-scored-d7.counter.json`); `--tree-exempt` output lists the real path (`e2/dup-exempt-rel-d7.counter.json`, exit 0); `forge-sweeps` still **exit 0** clean (`counters/forge-sweeps-d7.counter.json`); F2/F3/F6/F7/F9/F10 unchanged.
- The ENOENT false refusal remains in D7: a missing walk root is reported as `(unreadable directory)` and refuses. The scratch lane without `corpus/evidence/round78` exits 1 `prior-set-unparsable` (`corpus/evidence/round78 (unreadable directory)`) (`e2/missing-root-d7.counter.json`); the pre-D7 counter silently skipped a missing root. The catch conflates a missing root (ENOENT) with an unreadable one (EACCES). The L1 routed it to r79 as the first item; it cannot affect the frozen command's legs because both walked roots exist in every run of that command.
- The pre-D7 evidence in this report (baselines 1-4, F1-F12, the carried probes) was produced at the pre-D7 frozen bytes; the D7 runs are labelled `d7`.



- `selection-law`: `receipts/forge-sel.receipt.json` (pick-first-only state changed in leg and legShape) -> **exit 1** `selection-law` + `leg-pick-first-only-state` (`counters/forge-sel.counter.json`).
- `cancel-law`: `receipts/forge-cancel.receipt.json` (pick-same cancel list changed) -> **exit 1** `cancel-law` + `leg-pick-same-files` (`counters/forge-cancel.counter.json`).
- `empty-list-law`: `receipts/forge-empty.receipt.json` (pick-empty gains an input event) -> **exit 1** `empty-list-law` + `leg-pick-empty-*` (`counters/forge-empty.counter.json`).
- `intercept-law`: `receipts/forge-interceptoff.receipt.json` (intercept-off opened true) -> **exit 1** `intercept-law` + `chooser-event-binding` (opened legs 11) + `cancel-law` (`counters/forge-interceptoff.counter.json`).
- `trust-law`/`coordinate-law`: `receipts/forge-trust.receipt.json` (script-click trusted) -> **exit 1** `trust-law` + `leg-script-click-trusted` + `coordinate-law` (`counters/forge-trust.counter.json`).
- `legshape-consistency`: `receipts/forge-legshape.receipt.json` -> **exit 1** (`counters/forge-legshape.counter.json`).
- Replay: scoring a prior receipt itself (`p1`, nonce `tabi-r78-p1`) -> **exit 1** `replay-launch-token` + `replay-devtools-url` + `replay-event-timeline` (absMatched 79/79) (`counters/replay-p1.counter.json`).
- The selection model covers every leg (the four exclusions are covered by `cancel-law`, `empty-list-law`, `intercept-law`); the model is the counter's own derivation from the cited sources, so its correctness is not independently re-observed here (no Chromium run).

## Answers to the priority questions

1. **E1 strength vs the pinned literal.** The pinned `[mode, backendNodeId]` literal was a prior-run stability check, not an element-identity check: the id is browser-assigned and opaque, and r77 refused honest drift. The new binding is at least as strong for identity because it ties the chooser to the page element via the commanded point (`coordinate-law`), the pinned fixture attributes (`fixture-descriptors`), the `multiple` attribute (`mode-law`) and the page state/selection model, and it adds injectivity/stability (`node-binding-law`). The residual is the id: a **consistent permutation** of the four ids passes (`forge-idperm`, exit 0), while a non-injective relabel is refused (`forge-iddup`, exit 1). That is the declared design (ids reported, not pinned, lines 11-16) and the formal "fabricated from nothing" clause (lines 61-67); there is no id-to-element map in the receipt. A descriptor **attribute** swap is refused (`forge-descswap`, exit 1); a **rect move** passes if the point stays inside (`forge-rectmove`, exit 0; `forge-rectout`, exit 1), because the rect is only a containment claim.
2. **E3.** `receipt-fields` closes only the top level; `sweeps` is unread and nested extras pass (F4, F10). `frameTree` is a driver summary, not an independent anchor: a self-consistent forgery passes (F3). `host-argv` is exact equality, so an extra slot is refused, but slots 2 and 4 are derived from the receipt itself, so replacements there pass (F9).
3. **E2.** A `.json` that parses but is not a receipt is ignored (clean); a directory named `*.json` is walked (a receipt inside -> exit 1; empty -> clean); an unreadable **file** is refused (false red, F2); a loop symlink is cut (clean); an unreadable **directory** is silently skipped (false green, F1); `--tree-exempt` works relative/absolute, silently no-ops for a directory/missing path, and is not recorded in the output (F5). A different file claiming the run's nonce is refused (`e2/e2-same-nonce.json`, exit 1); a symlink to a prior is exempt by real path (`e2/e2-symlink-prior.json`, exit 0); a broken symlink is silently skipped (`e2/e2-broken-symlink.json`, exit 0).
4. **Carried rules.** The selection model, the cross-leg laws and `legshape-consistency` all bite on the crafted mutations (probes above); no false green found in them. Their correctness is the counter's own derivation, not an independent execution.

## Residual risk and verification gaps

- The counter is a receipt reader, not an execution oracle (declared). All crafted receipts are within the fabricated-receipt clause except F1 (unreadable directory), which is out of limit.
- Freeze integrity (F13): resolved by D7 (`a4d628c8`; counter `4ae29412`; `freeze.txt` at D7 carries it). The post-D7 scored/cold receipts are uncommitted at the time of this run; the gates are running. D7 fixes F1/F5 and only the type check of F4; F2/F3/F6/F7/F9/F10 and the ENOENT false refusal remain (routed to r79).
- The E1 element binding rests on click point + pinned fixture attributes + mode + page state; the backendNodeId is opaque (F8). A consistent permutation escapes by design; the limit is the E1 design note and the fabricated-receipt clause.
- The frame binding is a driver-summary consistency check (F3); the `Page.getFrameTree` result is not a raw log.
- The prior-set walk trusts filesystem readability (F1) and refuses unreadable files (F2); the two behaviors are asymmetric.
- `--tree-exempt` is unauthenticated and unrecorded (F5).
- `sweeps` is dead in the counter (F4); nested extras ride along (F10).
- I did not run the battery or kill-power (out of scope for this seat); predicate (c) is not re-verified here.
- I did not run Chromium; the browser-side semantics (selection model, mode law) are not independently re-observed.
- The scratch lane was removed after the cited outputs were copied here; the crafted receipts and outputs are in `receipts/`, `counters/`, `e2/`.

## Tool installs

None.
