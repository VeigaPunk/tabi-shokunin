# R60 w1 connector: sibling-overlap scan (seat R60Connector)

Full evidence: `.ufo/waves/round-60/w1/R60Connector/connector/overlap-scan.md`. Read-only. Scope: 20 roster siblings at the heads in `.ufo/waves/round-60/c1/snapshot-r60.tsv`; all 20 heads resolve. Searches: `git -C <lane> grep -I -n -i` on the head tree-ish and `git ls-tree -r` name checks.

## (a) Overlap per lane (patterns: cancelable | CapsLock | getModifierState | dispatchKeyEvent | receipt counter | BG_WORDS)

- audio-shokunin: no overlap (0 hits).
- chousa-shokunin: prose only, `.ufo/waves/round-31/controls/ChousaR31.CriticAxisFit31/evidence-manifest.txt:234`. No overlap.
- game-dev-2d-shokunin: 7 binary Godot fixture matches (`corpus/live/r25-*/.../fixture.x86_64`). No overlap.
- game-dev-3d-shokunin: no overlap (0 hits).
- kagi-shokunin: no overlap (0 hits).
- kaidoku-shokunin: prose only, 7 lines (`round-36/w2/R36W2ConnCrossClaim.md:194,242`, others in round-38/42/43/44/52). No overlap.
- kake-shokunin: prose "receipt counter" (27 lines); 2 `cancelable` in fetched third-party HTML (`round-46/sources/S135.html:335`). No overlap.
- kama-shokunin: prose "receipt counter"; `round-22/residual/FinalSources/raw/os.txt:4058` (CPython docs). No overlap.
- kasegi-shokunin: prose; minified page JS `round-59/controls/s092-*-shell.html:66`. No overlap.
- kengaku-shokunin: 1 prose line, `round-42/build/R42BatOrdClause/loadbearing.txt:43`. No overlap.
- kotoba-shokunin: subject overlap only. CDP key-event strings in omp binary dumps: `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt` `:6631,:581264,:1280257` (`Input.dispatchKeyEvent`), `:1279906,:579913` (CapsLock key map), `:18649` (cancelable); `.ufo/waves/round-82/build/Kb82E12Loader-omp-18.14.0-strings.txt` `:7398,:672936,:1371488` (dispatchKeyEvent), `:671587,:1371137` (CapsLock). No counter, grader or path overlap.
- kotodama-shokunin: prose "receipt counter"; `round-71/assimilation/fetches/s804.html:1551` (third-party JS). No overlap.
- kumitate-shokunin: 2 prose lines, `round-57/build/ExecD57Close/mut-summary.txt:99`. No overlap.
- lore-shokunin: 1 prose line, `round-96/seats/V22-c3-tamper.md:92`. No overlap.
- mado-shokunin: CapsLock in 150 files (761 lines) is keyboard-device (evdev/libinput) research: `round-15/w1/reports/PrivacyJoin.md:96`, `quality/counters/c1-r46-fixtures*.json`, `quality/counters/c1-r46-devices*.py`, `tools/mado-devices.py`. Not browser key events. `c2-r37-eventq.py:59,74` names a `chromium` process in a fixture. No `cancelable`, `getModifierState` or `dispatchKeyEvent`. No overlap with round-60 probes.
- mori-shokunin: prose 5 lines; CPython docs `corpus/evidence/recheck-r32/S068.src:5221`. No overlap.
- revenger-shokunin: no overlap (0 hits).
- souji-shokunin: prose 7 lines (`round-25/w1/ScoutToolSHA256Counter.md:52`, `census/round-33/waves/w1/deliver-mistakes.md:13`). No overlap.
- tameshi-shokunin: prose 9 lines (`round-56/w2/T56W2ConnectorSeparability-receipts/sibling-overlap.txt:12`, `round-57/w3/T57W3Read17.md:71`). No overlap.
- tsukuroi-shokunin: prose 6 lines (`round-39/w1/RevFreezeOrder.md:35`, `round-52/w1/R52CritDecl.md:13`). No overlap.

## (b) Browser-ground word screen or chromium receipt counter in a sibling

- BG_WORDS: 0 hits in all 20 siblings. The screen exists only in the tabi lane's own `round-45..53/counters/c1-adjacency-host-v{5..13}.mjs` (e.g. `round-45/counters/c1-adjacency-host-v5.mjs:46,151` at base 8a3f6f89). In-lane, not a sibling.
- browser-ground, bgWords, BG_WORD, chrome-cdp, chromium-receipt, wide-screen: 0 content hits in any sibling.
- No sibling carries its own chromium receipt counter. Browser-chrome or CDP-topic names only (kagi `cdp-bridge-1password.md`; kaidoku `inspect-control-chrome-plugin*`; kasegi `R47MutC1a` chrome-substring; kake `burnerchrome-kimi`).
- No name collision with round-60 or round-59 counter and driver names (`c1-wide-screen-r60.mjs`, `chromium-receipt-r60.mjs`, `f-probes-r60.py`, `chromium-receipt-r59.mjs`, `chrome-cdp-loopback-round59.mjs`, `c1-adjacency-host-v19.mjs`) in any sibling tree.

## (c) Out of scope

The 37 kaidoku overlap-declared rulings (L0 tabi|round-59 open).

## Verdict

- No sibling carries a BG_WORDS word screen, a browser-ground screen, or a chromium receipt counter. No sibling path collides with round-60 names.
- Subject-level overlap only: kotoba's CDP key-event strings in an omp binary dump; mado's keyboard-device CapsLock research.
- Literal regex on tracked blobs at recorded heads; does not prove absence of a paraphrased screen.
