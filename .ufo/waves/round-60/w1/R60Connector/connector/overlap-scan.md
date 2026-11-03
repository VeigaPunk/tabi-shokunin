# R60 w1 connector: sibling-overlap scan

Seat R60Connector. Read-only. Scope: the 20 roster sibling lanes at the heads in `.ufo/waves/round-60/c1/snapshot-r60.tsv`. All 20 heads resolve. Searches are `git -C <lane> grep -I -n -i` on the head tree-ish, plus `git ls-tree -r` name checks. Path:line below is the path at that head.
Patterns (a): `cancelable|CapsLock|getModifierState|dispatchKeyEvent|receipt counter|BG_WORDS`.
Extra checks (b): `BG_WORDS|browser-ground|browser ground|bgWords|BG_WORD|chrome-cdp|chromium-receipt|chromium receipt|wide-screen` in content, and round-60/round-59 counter names in file names.
Out of scope: the 37 kaidoku overlap-declared rulings (L0 tabi|round-59).
Limit: literal regex on tracked blobs at recorded heads. It does not prove absence of a paraphrased screen.

## (a) Overlap per lane (path:line, owner = lane that carries the blob)

- audio-shokunin: no overlap (0 hits).
- chousa-shokunin: prose only. `.ufo/waves/round-31/controls/ChousaR31.CriticAxisFit31/evidence-manifest.txt:234`, `round-32/w2/Chronology32.md:49`, `round-40/w1/ScribeKnowledgeEntry.md:91` ("receipt counter"). No overlap.
- game-dev-2d-shokunin: 7 binary matches only, Godot export fixtures `corpus/live/r25-export-critic/target-isolation/relroot_abstarget/project/out/fixture.x86_64` and `corpus/live/r25-export-scout/pair1..4-*/project/out/fixture.x86_64` (+ `r25-pair-reviewer/pairs/runroot-absolute-{1,2}/export/fixture.x86_64`). Compiled binaries; no overlap.
- game-dev-3d-shokunin: no overlap (0 hits).
- kagi-shokunin: no overlap (0 hits). Name-level only: `corpus/knowledge/cdp-bridge-1password.md` (1Password CDP bridge knowledge page, not a counter).
- kaidoku-shokunin: prose only, 7 lines. `.ufo/waves/round-36/w2/R36W2ConnCrossClaim.md:194,242`, `round-38/r38-w2-results.json:16`, `round-42/w1/artifacts/R42ConnRouted/ledger.json:14`, `round-43/r43-w2-results.json:82`, `round-44/r44-w2-results.json:226`, `round-52/w1/ExecSelftestInv/cases.md:63`. No overlap.
- kake-shokunin: 27 "receipt counter" lines in prose (25 files); 2 `cancelable` lines in fetched third-party HTML, `round-46/sources/S135.html:335` and its `round-48/assimilation/validate` copy; `scripts/base_path_audit.py:45` names Chromium as a parser reference (comment). No overlap.
- kama-shokunin: prose "receipt counter" (`round-26/w1-build/advice/ExecRerankOff.md:17`, `round-30/controls/kama-r30-ctl-CtlAllQ/report.md:47`, `round-52/w1/out/J6RenameOver.md:131`); `round-22/residual/FinalSources/raw/os.txt:4058` ("marked as cancelable", CPython docs). No overlap.
- kasegi-shokunin: prose (`round-26/c1-controls/m3-gameability.txt:3`, `round-31/wave3-results.json:28`, `round-37/wave1/CritBoundary.md:184`); minified page JS `round-59/controls/s092-issue-shell.html:66` and `s092-savedsearch-shell.html:66` (`unhandledrejection` cancelable). Not a key event. No overlap.
- kengaku-shokunin: 1 line, `round-42/build/R42BatOrdClause/loadbearing.txt:43` ("pair-receipt counter_rc=1"). No overlap.
- kotoba-shokunin: the only lane whose text carries CDP key-event strings. 96 lines, 3 files.
  - `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt`: `:6631`, `:581264`, `:1280257`, `:1280330` (`Input.dispatchKeyEvent`); `:1279906` (`CapsLock: { keyCode: 20 ...}` map); `:579913` (`CapsLock`); `:18649` (`cancelable`); `:2403669` (`getModifierState` inside a minified bundle).
  - `.ufo/waves/round-82/build/Kb82E12Loader-omp-18.14.0-strings.txt`: `:7398`, `:672936`, `:1371488`, `:1371561` (`Input.dispatchKeyEvent`); `:671587`, `:1371137` (CapsLock).
  - Both files are string dumps of a third-party agent binary. Subject overlap (CDP key names), with no counter, grader or path overlap.
  - `.ufo/waves/round-67/w2/logs/RevControlJunk.log:2`: prose "receipt counter".
- kotodama-shokunin: prose "receipt counter" in 10 files; `round-71/assimilation/fetches/s804.html:1551` (fetched third-party JS event-prop list, `cancelable`). Counter files `round-72..75/counters/accept-c.py` etc. are unrelated. No overlap.
- kumitate-shokunin: 2 lines, `round-57/build/ExecD57Close/mut-summary.txt:99` and `mutate-run.log:99` (a round-49 commit subject naming "clause-receipt counter"). No overlap.
- lore-shokunin: 1 line, `round-96/seats/V22-c3-tamper.md:92` ("Receipt counters move"). No overlap.
- mado-shokunin: 152 files, 763 lines. No `cancelable`, `getModifierState` or `dispatchKeyEvent`.
  - CapsLock, 150 files / 761 lines: keyboard-device research. Examples `.ufo/waves/round-15/w1/reports/PrivacyJoin.md:96`, `round-15/w1/reports/AttackDelivery.md:31`, `round-24/fetch/S158.bin:795` (keymap state `capsLock`), `quality/counters/c1-r46-fixtures.json` (85 lines) and `c1-r46-fixtures-v2.json` (105 lines), `quality/counters/c1-r46-devices{,-v2,-v3}.py`, `tools/mado-devices.py`. Hyprland/libinput evdev, not a browser key event. No overlap with round-60 probes.
  - `chromium` in code: `.ufo/waves/round-37/w1/scratch/SimplifyCounters/*/c2-r37-eventq.py:59,74` (a `chromium` process name in an ss-output fixture). Not a receipt counter.
  - Name-proximate: `.ufo/waves/round-37/w1/scratch/SimplifyCounters/*/c1-r37-event-ground.py` ("event-socket delivery ground"; corpus coverage). Not browser-ground words; no BG_WORDS.
- mori-shokunin: prose 5 lines (`round-23/falsify/C1R10.md:162`, `round-36/c0/CtlJ12.md:49`, `round-78/evidence/counter-win-live-r78.txt:5`); CPython docs `corpus/evidence/recheck-r32/S068.src:5221`. No overlap.
- revenger-shokunin: no overlap (0 hits).
- souji-shokunin: prose 7 lines (`round-25/w1/ScoutToolSHA256Counter.md:52`, `round-26/w1/ScoutCensusBefore.md:4`, `census/round-33/waves/w1/deliver-mistakes.md:13`, `census/round-28/waves/w1-results.json:143`, `census/round-3/seat-59.json:51`, `census/round-44/waves/w1/S44scout58/os.html:5221`). Name-level: `census/round-45/waves/w1/S45reviewer01/receipt-counter-freeze.txt`. No overlap.
- tameshi-shokunin: prose 9 lines (`round-55/w1-results.json:400`, `round-56/w2/T56W2ConnectorSeparability-receipts/sibling-overlap.txt:12`, `round-57/w3/T57W3Read17.md:71`, `round-57/w1/T57W1ScribeRecords/stage/LOG.md:1831`, `LOG.md:1831`). No overlap.
- tsukuroi-shokunin: prose 6 lines (`round-35/w1/K15FieldMutants.md:80`, `round-39/w1/RevFreezeOrder.md:35`, `round-46/w1/C2RevHashDef.md:41`, `round-52/w1/R52CritDecl.md:13`). Its `check-scrub-admission` "counter" is a hash, not a receipt counter. No overlap.

## (b) Browser-ground word screen or chromium receipt counter in a sibling

- BG_WORDS: 0 tracked blobs in all 20 siblings at their heads. The screen lives only in the tabi lane's own counters, `round-45..53/counters/c1-adjacency-host-v{5..13}.mjs` (e.g. `round-45/counters/c1-adjacency-host-v5.mjs:46,151` at base 8a3f6f89). Those are in-lane, not siblings.
- browser-ground, bgWords, BG_WORD, chrome-cdp, chromium-receipt, wide-screen: 0 content hits in any sibling.
- Own chromium receipt counter in a sibling: none. Name checks found only browser-chrome or CDP-topic files, not counters: kagi `cdp-bridge-1password.md`; kaidoku `round-20/evidence/c2/wasm-compare/inspect-control-chrome-plugin*.json`; kasegi `round-47/w1/R47MutC1a.draft/A4-L4-chrome-substring*`; kotoba `round-74/.../W2_chrome_banner/`; kake `round-23/live/burnerchrome-kimi/`.
- Name collisions with round-60 or round-59 counter and driver names (`c1-wide-screen-r60.mjs`, `chromium-receipt-r60.mjs`, `f-probes-r60.py`, `chromium-receipt-r59.mjs`, `chrome-cdp-loopback-round59.mjs`, `c1-adjacency-host-v19.mjs`): none in any sibling tree.
- Near-name counters that do not collide: mado `quality/counters/c1-r46-*`, mado round-37 `c1-r37-event-ground.py`, kake round-70 `receipt-counter-*.txt`, kaidoku round-43 `receipt-counter-seam.txt`, kengaku `receipt-counter.txt` (round-37/38/39).

## (c) Out of scope

The 37 kaidoku overlap-declared rulings (L0 tabi|round-59 open) were not examined.

## Verdict

- No sibling carries a BG_WORDS word screen, a browser-ground screen, or a chromium receipt counter.
- No sibling file name or path collides with the round-60 counter names or paths.
- Subject-level overlap only: kotoba's CDP `Input.dispatchKeyEvent` and CapsLock key-map strings in an omp binary dump; mado's keyboard-device CapsLock research (evdev, not browser).
- No sibling was written; no sibling repo was modified.
- Not run: no check of the round-60 counter code (not yet authored), and no per-line triage of kotoba and kake `chromium` prose (only the code-file check, which found none in kotoba).
