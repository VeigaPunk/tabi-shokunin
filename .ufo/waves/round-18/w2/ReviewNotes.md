VERDICT: ISSUES

Scope: the two new knowledge files at REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` —
`corpus/knowledge/source-recheck-round-18.md` (C1) and `corpus/knowledge/harness-hardening-round-18.md` (C2) —
checked against every receipt in `corpus/evidence/round-18/source-recheck/` (51 JSON + 51 excerpts), the 64-row
`corpus/SOURCES.md` at REV, the 7 round-18 dossiers, both harness scripts, and the named counters. Read-only
lane; all probes read lane bytes or ran read-only git/node. No installs or upgrades (preinstalled node v24.21.0,
curl, git, pdftotext 26.08.0 only; no pacman transaction). Private /tmp sandbox `tabi-r18-rn2` removed after use.

## Findings

### HIGH-1 — C1 note states a false present-tense registry anchor and never mentions S058–S064
- Where: `corpus/knowledge/source-recheck-round-18.md:11` (§1 Scope):
  "`corpus/SOURCES.md` has 57 rows (S001–S057)."
- Observed: at REV the registry has **64** rows, S001–S064. S058–S064 were opened this round and are committed in
  the same tree as the note. `grep -cE '^\| S0[0-9]{2} \|' corpus/SOURCES.md` → `64`.
  `grep -n 'S058' corpus/knowledge/source-recheck-round-18.md` → no output (exit 1): the note never mentions
  S058–S064 anywhere, including §5 (`:123-137` area) where S057 is listed among "Earlier supersessions still in
  force … S057 (for S053)" and §6 (`:136`) which admits a correction exists "outside this note" without naming
  S058, whose teaches cell (`corpus/SOURCES.md:72`) reads "supersedes S057 — REJECTED: listing names developer
  Google Ireland, Ltd. …".
- Why it matters: this is the copied-stale-anchor pattern. The 51-row receipt set is correct (fixed at B per the
  C1 gate), and §2/§4 qualify their baseline references ("at baseline B"), but §1 asserts the 57-row figure in the
  present tense with no qualifier. A reader taking §1 as current would conclude the publisher falsification and
  its superseding/rejecting row S058 do not exist.
- Repro: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/SOURCES.md | grep -cE '^\| S0[0-9]{2} \|'` → `64`;
  `git … show 530f40a…:corpus/knowledge/source-recheck-round-18.md | sed -n '11p'` → the sentence above.

### MED-1 — C2 note points to a "committed measurements.json" that does not exist at REV and that the cited command does not produce
- Where: `corpus/knowledge/harness-hardening-round-18.md:12`: "Observed counts come only from the committed
  `measurements.json` of the C2 measurement run (`node .ufo/waves/round-18/measure-c2.mjs REV`), and a reader
  must take them from that file". Same pointer style at `:45` ("the committed counter run lists its own IDs").
- Observed: no round-18 measurements.json exists at REV —
  `git ls-tree -r --name-only 530f40a9… | grep measurements` → `corpus/evidence/round-12..17/measurements.json`
  only. The cited counter writes no such file: `.ufo/waves/round-18/measure-c2.mjs:993-995`
  `function emit(record) { process.stdout.write(`${JSON.stringify(record)}\n`); }` — stdout only; its only
  `writeFileSync` calls build sandbox fixture bytes (`:919`, `:1128`, `:1136`, `:1161`).
- Why it matters: a future-measurement pointer written as a definite present-tense reference. A reader at REV who
  follows it lands on `corpus/evidence/round-17/measurements.json` (present at REV) — stale round-17 counts that
  look authoritative. The lesson handles this honestly ("Final measurements are appended after the measured
  revision lands; targets are not measurements"); the note does not mark the artifact as not-yet-existing, and
  misattributes its production to the named command.

### LOW-1 — C1 §3 undeclared anchor-cell edits for S051/S052
- Where: `source-recheck-round-18.md:48` declares "Anchor cells are reproduced from `corpus/SOURCES.md`; the three
  longest (S046, S054, S057) are abridged here" — but the §3 cells for S051/S052 are also altered without
  declaration: registry (`corpus/SOURCES.md`) says "git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280
  **peels to a018953688f1b10bddf91bff8747068f5f4746a4**), Documentation/…"; the note drops the "peels to …" clause:
  "git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280), Documentation/…".

### LOW-2 — C1 §3 juxtaposes two unreconciled digest bases for the gitiles base64 rows
- Receipt `sha256` is of the served (base64) body; the reproduced anchor cells quote a different digest (recorded
  at row-open time) with no basis label, and the note never explains the difference:
  S033 receipt `9c0d5822fbae…f373` (520 B) vs anchor "sha256 50dd337d…6364"; S034 `3dc33e9d2e40` (310220 B) vs
  "99b92e67…1d2b"; S041 `0ea9bf3f3d06…47e4` (5292 B) vs "26e62f29…37ff"; S042 `039e24a0a954…d24d` (66824 B) vs
  "blob c5ef637f, sha256 474083d6…8823". Contrast S062/S064, whose dossiers record both bases explicitly
  ("decoded …, as served (base64) …"). §6 covers dynamic pages and non-HTTP commands but not this.

### LOW-3 — C2 front-matter S063 URL differs from the row's registered URL
- `harness-hardening-round-18.md:5` cites `https://nodejs.org/docs/v24.21.0/api/process.html#signal-events`;
  the registry row (`corpus/SOURCES.md:77`) pins `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`.
  Same content (see verification below), so citation hygiene, not drift.

## Verified clean (finite checks, exact values)

- **Receipt contract 51/51**: schema `tabi-source-recheck-v1`; `producerSha256` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` on all 51 and equals `sha256(.ufo/waves/round-18/recheck-fetch.mjs)` at REV; `rowUrl` verbatim in source cell 51/51; `quoteWords` = word count of quote, max 24 (≤25); `normalize(quote)` ∈ `normalize(excerpt)` 51/51; `excerptSha256` = sha256 of excerpt bytes 51/51; `quoteFound: true` 51/51; `fetchedAt` on 2026-10-20 51/51; `httpStatus` 200×50, null×1 (S029 only); `teachesVerdict` held 51/51 (0 drift, 0 unreachable); exactly 102 files, no S058+ receipts, no duplicates.
- **§2 aggregates exact**: status mined/queued/rejected 40/6/5 (rejected = S026,S027,S038,S040,S057); tier 42/4/5; decode none 13 / html-text 32 / base64 5 / pdf-text 1; HTTP 200/non-HTTP 50/1.
- **Counter runs (read-only, exit 0)**: `node .ufo/waves/round-18/measure-c1.mjs 2bff864f…` → `c1_rows_rechecked:0, eligible_rows:51, row_classes.url {immutable_pinned:14, living_live:42, own_work:1}` — matches §2/§4 exactly. `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` → `c1_rows_rechecked:51` (eligible 58 = 51 + the 7 new receipt-less rows, consistent with the fixed-at-B scope).
- **C2 basis all true**: `git rev-parse 6c97851^{commit}` → `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`; `git diff --quiet 6c97851 93bfead1f5f25f584353df3152a60209bbd89a2e -- scripts/webmcp-invoke-round17.mjs` → exit 0; `git show <rev>:scripts/webmcp-invoke-round17.mjs | sha256sum` → `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` at both.
- **Round-17 line citations all check**: `:78` `PLAYWRIGHT_REQUIRED = '1.64.0'`; `:91` `DEVTOOLS_PORT_ARG = '--remote-debugging-port=0'`; `:599` args push; `:471-493` DevToolsActivePort read; `:506-576` raw WebSocket; `:581` `/json/list`; `:817-820` failStart `process.exit`; `:1938` `rmSync(tmpBase, …)`; `:1992-1996` fail mapping; `:2056` `cdpChannel`; `:2118-2121` watchdog; `:2124-2127` `.catch`; `:221` `tmpdir()`; `:82-85`/`:86-89` feature consts; `:633-645` `featureSwitches`. Sentinel window cites match section headers at lines 17/29/42/53/69 (H1 17-27, H2 29-40, H3 42-51, H4 53-67, S1 69-75).
- **Round-18 script claims hold**: no launch `--remote-debugging-port` (sole occurrence is the refusal assertion `scripts/webmcp-invoke-round18.mjs:1018` `noRemoteDebuggingPort`); `acceptDownloads: false`; `handleSIGINT/TERM/HUP: false`; fixture `invoke-download-refused` present (0 occurrences in round17); `suggestedFilename`/`failure` recorded; `run_aborted`; `could_not_evaluate` ×4. `scripts/freshness-witness.mjs` contains `refs/heads/master`, merge-base ancestor check, `--witness`, `--dry-run`, HEAD refusal.
- **coreBundle (installed Playwright 1.64.0, global fnm tree)**: `:44749-44750` caller `--user-data-dir` throw and `--remote-debugging-pipe` rejection ("near line 44750" exact); `:44936` `chromeArguments.push("--remote-debugging-port=0")` in the BiDi launcher ("near line 44936" exact).
- **S063 Node claims**: raw v24.21.0 `doc/api/process.md` = 134327 B, sha256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` (matches the registered digest); `:757-759` quote verbatim; `:778-780` SIGKILL/SIGSTOP; `:4228-4247` contains "Pipes (and sockets): … asynchronous on POSIX" and "process.exit() … before an asynchronous write completes"; the sentence "the listener is called if the event loop is otherwise empty" is present in `nodejs.org/docs/latest-v24.x/api/process.md` (fetched 2026-10-20, 134429 B) and absent from v24.21.0; `nodejs.org/dist/index.json` newest v24 = `v24.22.0` ("served 24.22.0" ✓).
- **Sourced rows**: S059–S064 all `mined`, `used-by` = `corpus/knowledge/harness-hardening-round-18.md`, verified 2026-10-20, recheck `on-release`, each cited in the note body. S058 `rejected`, teaches opens "supersedes S057 —", no S058 cell contains "individual publisher".
- **Dossier anchors**: all 17 probed strings/ranges present in the 7 dossiers (S058 bytes 523546/523625 + `fbc214a8…`; SrcPwLaunch quote + commit `606ecd8b…` + ranges 247-253/1182-1190/1221-1234/1289-1306; SrcPwDownloads quote + 374-377; SrcPwCdpSession first-paragraph quote + 355-358/274-278/341-343/606-620 + `class-cdpsession.md:4-5` and `:4-6` both recorded; SrcChromiumPipe pipe-switch quote + commit `b510e9d7…` + `devtools_http_handler.cc:297-306`; SrcChromiumSwitchMerge `g_duplicate_switch_handler` + blob `3a95f227…`; SrcNodeSignals listener quote + commit `955266bf…` + 757-759).
- **Misc**: 50/50 HTTP receipts use exactly `curl -sSL --compressed --max-time 90 …`; no row of the 64 has a `recheck` cell dated ≤ 2026-10-20 ("no row past due" ✓); 2026-10-20 + 90d = 2027-01-18 ✓; `pdftotext -v` → `pdftotext version 26.08.0` (matches §6); S030/S046 identical bodies 37575 B / `184c519af9ed…` ✓; S020 `anchorObserved` carries `51ed7565…` + 2026-10-20 ✓; S029 command `git -C … show 837b33a…:corpus/evidence/round-13/aria/receipt.json`, 97073 B, `b458b351…` ✓; S057 receipt 695881 B / `361a9a0f2ec2…` vs registry-recorded 649153 B / `085c40b7…` exactly as §6 states.

## Residual risk and verification gaps
- No independent re-fetch of the 50 HTTP sources: receipts were produced today by the one producer; I verified note↔receipt↔registry coherence, not independent re-open (SOURCES rule 1, not claimed by the note).
- Chromium gitiles quotes not re-fetched from the tag; served-base64 digests not recomputed (dossier-recorded).
- measure-c2/measure-c3 not run here — executor peers (ReRunC2-2/ReRunC3-2) own those runs; my scope is the two knowledge files.
- Playwright tag-source line cites (chromium.ts etc.) accepted from committed dossiers, not re-fetched at tag v1.64.0.
- HIGH-1 intent (deliberate B-scoping vs stale prose) is not decidable from bytes; reported as written.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReviewNotes.md

Report: .ufo/waves/round-18/w2/ReviewNotes.md
