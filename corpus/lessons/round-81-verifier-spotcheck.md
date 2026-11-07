author: hyaku closure (non-author integrator, @m_zfl session)
round: tabi round 81 (lane round 81, attempt 1)
date: 2026-11-07
lane base: c27e8406e6a2dc3cafcff030c9224cf8a14e3464
lane head at verification: 2a117ea7d0809621971049a16725f2053dd74eb6
lane head after this file lands: see MANIFEST `commit` (this file's own commit)

# tabi round 81 — non-author verifier spot-check

Driver digest (copied from `.ufo/watchdog.log`, mutable): 2026-11-07T19:58:48-03:00 launch tabi
round=81 pgid=2877178 driver=hyaku-inline attempt=1; 2026-11-07T20:38:37-03:00 complete tabi
round=81; hyaku-inline attempt=1. Report `.ufo/reports/round-81/tabi.md`
(`9f0f84011c74571272192d059e62ba1fa57c400c`, author `tabi-shokunin <tabi@shokunin.local>`,
authored 20:28:31, committed 20:38:35 — a hyaku sweep commit: "L1 returned without committing;
attribution defect").

Declared claims: **C1** coverage (9), capability generation r81 of `chromium-showpicker-linux`
(the r80 frontier legs); **C2** calibration (9), the ten r80 routed defects plus the self-drift
identity leg. Frozen in `.ufo/waves/round-81/claims.json`; final digests commit
**D = `a2183a93362259cb574ef3d03b565ee6d2c26599`**, nonce `tabi-r81-l1-a2183a933622`.

## 1. Conformance (step 1)

| Check | Command | Observed |
|---|---|---|
| report filed by the lane identity | `git -C /home/vgpnk/Projects/shokunin log --format='%an %H' -- .ufo/reports/round-81/tabi.md` | `tabi-shokunin <tabi@shokunin.local> 9f0f84011c74571272192d059e62ba1fa57c400c` — lane identity, but a **sweep commit** (commit message names the attribution defect); the L1 returned without committing its own report |
| report lands last | report commit time vs lane tip | report committed 20:38:35, lane tip `2a117ea7` committed 20:25:00 — report lands after the lane's work; the lane HEAD at closure is `2a117ea7` |
| `SHONEN` heading, one line per box | report §SHONEN vs `SHONEN.md` | 1 heading, 4 `[~]` lines for 4 boxes, each with a pointer; no `[x]` written; `SHONEN.md` unchanged |
| every cited lane commit exists and is an ancestor of the branch | `git -C tabi-shokunin merge-base --is-ancestor <h> master` for `a2183a93 5233f510 86cd811a 2f4b03ed 97d42fad 7416159a 2a117ea7` | **7/7** resolve and are ancestors of `master`; `git ls-remote origin refs/heads/master` = `2a117ea7` |
| lane repo clean and pushed | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain` | `branch=master local=remote=2a117ea7 ahead=0 behind=0`; **porcelain shows 4 untracked entries** (defect D2 below) |
| prompt carries the contract | `.ufo/prompts/tabi-round-81.md` (943 lines) vs `templates/round-prompt.md` rendering | §1–§5 byte-identical to the template rendering modulo the single substitution `<tabi-repo>` → `tabi-shokunin` (verified by diff); addendum §6 present; five child-lane items present: report path §4, commit-then-push §5, `SHONEN` heading §4, commit-hash citation §4, write/push scope §5; L2 route map: run-15 chain ends at the 2026-11-04 restore, `MISSION.md` §L2 carries role-class buckets only — no contradiction |
| L2 floor | `.ufo/waves/round-81/w1-dispatch.json`, `w1-results.json`, `w1/swarm-registry.json` | one `taskCall` with **11 tasks** (4 executor, 2 reviewer, 1 critic, 1 mutation-tester, 1 scout, 1 scribe, 1 connector); attack share 3/11 = 27 % ≥ 25 %; `seats: 11`; **two seats returned empty output** (`R81Exec3`, `R81Drift`) — the report names no dead seats (defect D4); no `planner` seat — the L1 held planning (validator rejects `planner`), disclosed |
| census at HEAD | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | **exit 0**, W04 duplicate-URL warnings only; 223 rows |

Conformance defects (status-neutral, routed in §6): the report is a sweep commit under the lane
identity after the L1 returned without committing (D1); four wave files remain uncommitted in the
lane repo (D2); `LOG.md`, `corpus/QUALITY.md` and `SCORECARD.md` still state the S223 quote as
"23-word"/"23 words" while the committed lesson says 20 — the correction propagated to only one of
four records (D3); two wave seats returned empty output and the report names no dead seats (D4);
`freeze.txt` pins `claims.json` at `49c8c96e…` but the file at HEAD is `0b850d15…` — explained by the
declared digests commit `5233f510` (fills `digestsCommit`/`nonce`), disclosed in `freeze.txt`
comments and the lesson; recorded, not a defect.

## 2. Claim re-check (step 2)

Both claims rest on lane-owned gates, so PROTOCOL §Gate standard binds: I re-ran the two counters
themselves (plain `node` invocations over committed bytes — no browser, no live surface) and
verified the scored artifacts as committed evidence; I did not execute the driver, battery, kill
power or selftest.

### C1 — coverage (9), capability generation r81 of `chromium-showpicker-linux`

| Leg | Counting command the claim names | My re-check | Classification |
|---|---|---|---|
| (a) post-D scored run | `node scripts/check-showpicker-r81.mjs --lane <lane> --receipt corpus/evidence/round81/chromium-showpicker/receipt.json --expect-driver-sha256 e35e63c1… --expect-nonce tabi-r81-l1-a2183a933622 --expect-fixture-sha256 d9129edd… --prior-set .ufo/waves/round-81/controls/c1/prior-set.txt --json` | **re-run by me**: exit 0, `verdict clean`, `checkCount 56`, `findings []`, `priorSet 2`; receipt pins: `nonce=tabi-r81-l1-a2183a933622`, `driverSha256=e35e63c1…669`, `fixture.sha256=d9129edd…1703`; `scored/counter-a.json` matches | **re-measured** |
| before-state | base has no r81 receipt; the r80 receipt under the r81 counter | `git cat-file -e c27e8406:corpus/evidence/round81/chromium-showpicker/receipt.json` → exit 128 (absent); **re-run by me**: the r80 receipt under the r81 counter exits 1 with **30 findings including `schema`** (checkCount 57) — matches the report and `controls/c1/nowork.json` | **re-measured** |
| (b) cold-run acceptance | four cold receipts clean under the frozen counter | `scored/cold-runs.txt` names `R81Exec1/l1-rescore-cold1.json`, `l1-rescore-cold2.json`, `R81Exec2/cold3.score.json`, `cold4.score.json` — all four resolve under `.ufo/waves/round-81-seats/`; the committed `counter-a-dfrozen.json` (`--prior probe2`, priorSet 1) is `clean 56` | evidence-verified (paths resolve; the seat score files are committed) |
| (c) battery + kill power | `negatives-showpicker-r81.mjs` 62 cases; `kill-power-r81.mjs` 46 mutants | `scored/battery-a.json`: `cases` implied 62, `failed 0`, `coverage {declared 56, covered 56, uncovered [], unknown []}`; `scored/killpower-a.json`: `mutants 46`, `killed 46`, `survived 0`, `crashed 0`; `scored/selftest-r81-gates.out`: `clean true`, `cases 9`, all 9 gates ok including `pins-match-freeze` (13/13 sha256) | evidence-verified |
| (d) row + note + registry + selftest | capability row, knowledge note, `SKILL.md` §Round 81 gate registry | `SCORECARD.md` capability row `chromium-showpicker-linux (generation r81)` present with the six new laws; `corpus/knowledge/chromium-showpicker-runtime-round-81.md` opens with the provenance trio citing S219/S220/S222/S223; `SKILL.md` gains `## Round 81 gate registry`; knowledge count 93 → 94 (`git ls-tree` count) | **re-measured** (row/note/registry present; counts by `git ls-tree`) |
| pins (two evidences) | recompute `freeze.txt` over the worktree | **12/13 files sha256-identical**; the one mismatch is `claims.json` (`49c8c96e…` pinned vs `0b850d15…` at HEAD) — the declared digests commit `5233f510` rewrote only `digestsCommit`/`nonce`/unicode escapes; disclosed in `freeze.txt` comments and lesson `## Corrections` | **re-measured**; disclosed drift |

**C1 verdict: VERIFIED.** The before→after is reproducible on committed bytes (base absence →
receipt clean 56; r80 receipt under the r81 counter → exit 1, 30 findings incl. `schema`); the
frozen counter re-ran clean under my own invocation; battery/kill-power/selftest committed
evidence is green; the capability generation is demonstrated by a real receipt.

### C2 — calibration (9), record drift + self-drift

| Leg | Counting command the claim names | My re-check | Classification |
|---|---|---|---|
| (a) after | `node scripts/check-record-drift-r81.mjs --lane <lane> --json` | **re-run by me**: exit 0, `claims 12`, `mismatches 0`, `failed []`; `lesson-proof/c2-after.json` matches | **re-measured** |
| (b) before | `lesson-proof/c2-before.json` | `claims 12`, `mismatches 12`, all twelve ids failed — matches the report's "before: 12" | evidence-verified |
| (c) self-drift identity | the counter's `r81-identity`/`r81-numbers` legs | `claims.json` carries `digestsCommit a2183a93…` and `nonce tabi-r81-l1-a2183a933622`; SCORECARD/LOG/SKILL/lesson all cite the final D `a2183a93` (spot grep) | evidence-verified (inside the counter's green run) |
| (d) capability-status | `node scripts/check-capability-status.mjs --json` | selftest gate: `{"rows":14,"claimed":13,"provisional":1,"mismatches":0}` | evidence-verified |
| controls | `lesson-proof/c2-controls.json` | base mirror exit 0/0 mismatches; `reversed-correction` → exit 1 `claims-annotation`; `stale-removed` → exit 1 `capability-typo`; `nonce-swapped` → exit 1 `r81-identity` | evidence-verified |
| corrections on the record | the ten r80 routed defects | `corpus/lessons/round-81.md` `## Corrections` carries all ten rows append-only; spot checks: `.ufo/waves/round-80/census/end-green.txt` exists (committed earlier), `.ufo/waves/round-80/scored/battery-bound-a.json` exists, `corpus/QUALITY.md` 159 cites the quote-count criterion | **re-measured** (pointers resolve; rows present) |

**C2 verdict: VERIFIED on its stated scope** — the twelve record claims (ten r80 routed defects +
the r81 identity/numbers legs) verify at HEAD. The counter's own disclosed limit stands: four
claims are presence-bound (`gate-quote-counts`, `capability-typo`, `control-count`,
`landed-d10`), already routed by the lane to r82.

**New defect found by this spot-check (not part of C2's scope):** the S223 quote-count correction
reached `corpus/lessons/round-81.md` only. `LOG.md:3900` still says "23-word quote",
`corpus/QUALITY.md:1046` (criterion 159's own example) says "6 and 23 words", and
`SCORECARD.md:3946` says "(23 words)". The true count is **20** (`wc -w` on the committed quote).
This is the same record-drift class C2 exists to catch — routed to r82 in §6.

## 3. Per-axis verdicts

| Axis | Verdict | Reason |
|---|---|---|
| depth | unchanged | no depth claim; the note adds measured laws but the declared move is coverage |
| coverage | improved | C1 verified: capability generation r81 enters with a running demonstration (6-leg receipt, 56-check counter re-run clean by me, battery 62/62, kill power 46/46, selftest 9/9); knowledge 93 → 94; registry 221 → 223 |
| operability | unchanged | new instruments registered in `SKILL.md` §Round 81 gate registry; selftest green; no pre-existing runnable artifact regressed |
| freshness | unchanged | the r80 records re-verified (C2, 12 → 0); no sweep of older knowledge entries |
| calibration | unchanged | C2 verified on its stated scope (12 → 0, directional, three controls), but the round introduced a fresh record drift of the same class it corrected (the 23-vs-20 quote count in LOG/QUALITY/SCORECARD) plus uncommitted wave files — offsetting the gain at score 9 (r80 precedent) |
| adjacency | unchanged | `R81Connector`: 20 sibling lanes scanned, 0 contested rows; `PROVINCE.md` gains the round-81 surface and keeps the refusal routes |

`git diff c27e8406 2a117ea7 -- SCORECARD.md`: the r81 section is appended; all six axis scores stay
at 9; the capabilities table gains the generation-r81 row; nothing removed or lowered.

## 4. Discernment spot-check (`corpus/lessons/round-81.md` `## Gate`)

| Item | Decision | Re-opened source | Agree/Disagree | Reason |
|---|---|---|---|---|
| S222 CDP `DOM.setFileInputFiles` (new row) | admit | live `https://chromium.googlesource.com/…/DOM.pdl?format=TEXT` (2026-11-07); 46,100 B base64 decoded, sha256 `50c460459e50…` = row | agree | line 682 `command setFileInputFiles`, lines 684-691 carry "Array of file paths to set." (6 words, `wc -w` = 6) and parameters `files/nodeId/backendNodeId/objectId` — no `accept`, no directory parameter |
| S223 WHATWG `accept` attribute (new row) | admit | live `https://html.spec.whatwg.org/multipage/input.html` (2026-11-07); 687,515 B, sha256 `b0202de1c0b4…` = row | agree | §4.10.5.1.17 File Upload state carries "The accept attribute may be specified to provide user agents with a hint of what file types will be accepted." — **20 words** (`wc -w`), matching the committed lesson (the LOG/QUALITY/SCORECARD copies still say 23 — defect D3) |
| reject "the second chooser is answerable" | reject (not measured) | `corpus/evidence/round81/chromium-showpicker/receipt.json` leg `sp81-click-while-open`: `fileChooserOpened` ×2, no `answer` field | agree | the leg counts the second chooser but never answers it; the flip (an answer leg on the second event's `backendNodeId`) is the right one |
| reject "`accept` filters a programmatic answer" | reject | same receipt, leg `sp81-accept-answer`: `.txt` answered into `accept=".png"`, `stateAfter.k` shows acceptance | agree | S223 calls accept a hint; the measured answer was accepted; the flip (a Chromium source line validating `files` against `accept`) is stated |
| reject "a cross-origin `type=color` behaves like `type=date`" | reject (not measured) | S219/S220 exemption rows; no `type=color` leg in the receipt | agree | both types are exempt per the carried sources; the prediction is stated as prediction, not law |
| reject "the order discriminator proves the spec's order is wrong" | reject as worded | S219 step order vs measured Chromium branch order | agree | one call in two origins discriminates Chromium's order, not correctness; the flip names the needed source reading |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(W04 only) at HEAD; `grep -c '^| S[0-9]'` = **223** (221 → 223); the diff adds exactly S222/S223
(both tier A, `mined`, opened 2026-11-07) and touches only `used-by` on S219/S220; malformed rows 0;
duplicate ids none; every `mined` row's `used-by` paths resolve (sweep printed nothing).

## 5. Trend verdicts

- **expansion — improved.** `git ls-tree -r --name-only <rev> corpus/knowledge | wc -l` = 93 → 94;
  the new note is net new on uncovered ground, cites S219/S220/S222/S223 (all `mined`); registry
  221 → 223; the capability generation adds six measured surface elements and the coverage map
  gains `## Round 81 coverage`.
- **quality — improved, with disclosed limits.** The scored gate generation is green (56 checks
  re-run clean by me, battery 62/62 with `coverage.unknown []`, kill power 46/46, selftest 9/9);
  the ten r80 record defects are corrected on the record (12 → 0, directional, three controls); no
  admitted domain entry was found false. Disclosed limits (lane-routed): six receipt-level
  forgeries pass clean 56, eleven clause-level weakenings survive the frozen battery, the replay
  rule is pair-based, the frozen limit sentence's first clause is off by one, and four C2 claims
  are presence-bound.
- **discernment — improved.** The wave falsified the claims and the round's own controls caught
  four instrument defects before the freeze plus two named repairs; the critic's leg-(c)
  falsification was fixed by repair 2. My outside spot-check agrees with both sampled admits
  (S222/S223 re-opened live, sha256 match, quote counts verified) and all four sampled rejects.
  New limit: the quote-count correction propagated to only one of four records (D3).

## 6. Routed defects the lane must fix next round (r82)

Lane's own routed list (from the report/lesson, unchanged): (1) six receipt-level forgeries pass
clean 56 — bind fixture child sha/patch, `window.__r3` eval, chooser `afterSendId`, answer-path
location, `childState`, and give the cross-origin legs a page event or leg-specific binding;
(2) eleven clause-level weakenings survive the frozen battery; the kill power has no baseline
guard; (3) the C2 counter's four presence-bound claims pass with a reversed correction; (4) the
frozen limit sentence's first clause is off by one (record corrected); (5) the frozen
`claims.json` pins the pre-repair battery and one-line prior set (both repairs named).

Defects this spot-check adds:

6. **Quote-count propagation (self-drift, new).** `LOG.md:3900` "23-word quote",
   `corpus/QUALITY.md:1046` "6 and 23 words", `SCORECARD.md:3946` "(23 words)" — the true count is
   20 (`wc -w`); only `corpus/lessons/round-81.md` was corrected at `2a117ea7`. Sweep every touched
   file for the superseded count (PROTOCOL §Evidence standard, corrections sweep every mention).
7. **Uncommitted wave files.** `.ufo/waves/round-81/w1-results.json`,
   `.ufo/waves/round-81/w1/R81Scout.md`, `.ufo/waves/round-81/w1/R81Scout/` and
   `.ufo/waves/round-81-seats/R81Mut1/` (mutants.json, summary.json, witnesses.json — written
   20:25, after the last lane commit 20:24) are untracked at HEAD; commit them next round or
   record why they are exempt.
8. **Dead seats unnamed.** `w1-results.json` shows `R81Exec3` and `R81Drift` with empty output and
   no seat directory; the report's wave section names no dead seats. Name them (or the sweep that
   found none) next round.
9. **Report lands-last via sweep.** The report commit `9f0f8401` is a hyaku sweep under the lane
   identity ("L1 returned without committing; attribution defect") — the lane should land its own
   report commit before returning.

## Verdict

C1 **VERIFIED** (re-measured: counter re-run clean 56/56, before-state reproduced) and C2
**VERIFIED** on its stated scope (drift counter re-run 12 claims / 0 mismatches; controls
committed). `expansion: improved`, `quality: improved` (limits disclosed), `discernment:
improved`; coverage improved, calibration unchanged (fresh record drift of the corrected class),
the other four axes unchanged. No axis harmed. **Admitted**, with defects 6–9 owed to r82.
