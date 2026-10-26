## Round 32 — 2026-10-26 — WebDriver BiDi moves from docs-held to runtime-held (coverage, capability) and the nudge-state class (calibration)

Attempt 1. Claims frozen before data at `.ufo/waves/round-32/claims.json` in commit
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (baseline `d805d1d6132430118b206a848b85753ab35d1014`), counters frozen at
`2f8535c5b3015fc5730c1076cbe57d1dc29e4fee` — `scripts/check-bidi-runtime.mjs` sha256
`2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`, `scripts/check-selfassessment.mjs` v3 sha256
`77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, both re-hashed from the freeze tree this round
and identical to `baseline/frozen-counter-sha256.txt`. A counter fix landed before the freeze: the pre-freeze control
run failed every `--live` leg with `session not created: Chrome instance exited` (chromium's singleton socket path
under a deep TMPDIR exceeds the 108-byte unix-socket limit), and `5ad1fcbf` changes `liveRecord`'s chromium TMPDIR
choice only; the frozen digests are the `5ad1fcbf` bytes, the same tree the controls were scored against
(`git diff --name-only 5ad1fcbf 4181fffb -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs` empty,
no document changed either). Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9,
adjacency 8. Lowest non-retired axis adjacency 8 and the stagnation nudge **ACTIVE** — every axis at or above the
saturation line 8 and no capability entered in the window of 3 rounds (last capability entries
`First-working round: 25`, `SCORECARD.md:1249,1306,1314`) — so the lowest-axis obligation is waived and the round is
a frontier/capability move (C1). C2 counts the three rounds that stated the opposite.

Controls, scored per claim before any claim data (`.ufo/waves/round-32/baseline/`, `README-receipts.md`; every capture
records its clone commit and tree digest in `<control>.provenance` — round-31 routed defect 5):

| Control | Reading | Exit |
|---|---|---|
| c1-J1-do-nothing | population 0, admitted 0, `e1-entry-absent` | 1 |
| c1-J2-docs-only | population 16, admitted 0, failing 16, `s1-source-row` | 1 |
| c1-J3-forgery-offline | population 16, admitted 16, `live: false` | 0 |
| c1-J3-forgery-live | population 16, admitted 0, failing 16, `t3-binding` ("first screenshot differs from this counter's live session") | 1 |
| c1-J4-counter-as-driver | population 16, admitted 0, failing 16, `t1-receipt` ("driver absent, is this counter, or its sha256 differs") | 1 |
| c2-J1-do-nothing | mismatches 18 (3 m4 + 15 m1) | 1 |
| c2-J2-delete-words | mismatches 15, but numstat 3/3 `SCORECARD.md` — the deletion leg fails | 1 |
| c2-J3-uncited-correction | mismatches 18 | 1 |

Self-tests at the freeze: `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` (exit 0),
`SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` (exit 0); `check-sources` census at round start `ok`
(exit 0), 122 registry rows.

C1 coverage + capability acquisition (sourced): `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, table
`| Row | Surface | BiDi method | Measured | Evidence |` with R1–R17 the matrix §2 rows in order (R16, stop loading /
nav-cancel, has no BiDi command in the draft's `browsingContext` command list and is recorded as such). Transport:
chromedriver 154.0.8037.97 (`ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`)
driving chromium 154.0.8037.97 headless over the classic `webSocketUrl: true` bootstrap, loopback fixture only;
receipt `corpus/evidence/round-32/bidi/receipt.json`, schema `tabi-bidi-receipt-v1`, transcript JSONL, fixture served
by the counter's `serveFixture()` (sha256 `343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`). The
target is admitted >= 14 and failing 0, set below the 16 admittable predicates the counter's own live leg held
before the freeze, and unreachable without a committed receipt of two real runs from a driver other than the
counter (controls J3/J4). C2 calibration: the frozen self-assessment counter v3 adds class `m4-nudge-state` and
refuses a failed self-test's summary as an oracle; at the freeze it reads 18 mismatches — 3 m4 (`SCORECARD.md:1473`,
`:1515`, `:1576` state `nudge inactive` for rounds 29–31 while the AXES.md rule applied to the lane's own SCORECARD
inputs gives active) and 15 m1 stale `check-selfassessment` tallies (`SCORECARD.md:1439,1465,1486,1564`;
`SKILL.md:2479,2515,2530,2545,2576,2578,2590,2594,2598`; `corpus/README.md:613,668` — claimed 17/22/30 against
observed 41, the 15 induced by v3's 11 added cases, 30 → 41). Target: 0 mismatches, 0 m4, 0 deleted lines, via
append-only corrections at the end of each document citing each stale `DOC:N`.

Counting commands (clean checkout, frozen counter digests verified; raw outputs under
`.ufo/waves/round-32/measure/` before the report):

- C1 — `node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json | jq '{population,admitted,failing,binding}'`.
  Before (freeze tree): population 0, admitted 0, exit 1, `e1-entry-absent` (`baseline/c1-J1-do-nothing.json`).
  After: `<L1: C1 after-measurement at REV — population, admitted, failing, binding, exit>`.
- C2 — `node scripts/check-selfassessment.mjs --rev <REV> --json | jq '{mismatches, m4: [.counted[]|select(.class=="m4-nudge-state")]|length}'`
  plus `git diff --numstat <freeze> <REV> -- SKILL.md corpus/README.md SCORECARD.md LOG.md`.
  Before: mismatches 18, m4 3, exit 1 (`baseline/c2-J1-do-nothing.json`).
  After: `<L1: C2 after-measurement at REV — mismatches, m4 count, deleted lines, exit>`.

Frontier step: SOURCES rows S123–S126 (registry 122 → 126) — S123 the RFC 9309 row superseding S119 on its header
date, S124 W3C WebDriver BiDi re-opened, S125 the Chrome-owned BiDi/ChromeDriver documentation, S126 W3C WebDriver
classic capabilities; each written only after opening it this round, `Gate` quotes in `corpus/lessons/round-32.md`.
C1's `source:` cites a registry row opened this round and the counter's `s1` check enforces one. Lesson
`corpus/lessons/round-32.md` carries `## Gate` and `## Mistakes`; the mistake mined is stale-premise — `nudge
inactive` carried from rounds 26–28 into 29–31 without re-derivation, fix = the m4 class shown able to fail
(`baseline/c2-J1-do-nothing.json`). Round-31 routed defects: (1) calibration counter v3 → C2 takes the failed-summary
refusal (M11) and the m4 class; word-numeral and `<name>_cases=` tallies and the merged two-bullet correction
survivor are **not claimed**; (2) decision-table counter v2 → not claimed; (3) S119 superseding row and the
`recheck` alignment → curation (S123), not a claim; (4) the 27 carried errata → dispositioned by wave-1 scribes,
curation; (5) control captures name a resolving revision → every control here records the clone commit and its tree
digest over the frozen counter commit; (6) round-30 routed defects 3–4 → not claimed; (7) scratch hygiene → every
seat prompt requires deleting its scratch, the L1 removes `$HYAKU_SCRATCH/tabi-r32` after landing. QUALITY criteria for
this round are numbered in the `SCORECARD.md` round-32 block as landed. Assimilation: none — `merge/tabi/` is not read
for C1/C2 and no `considerthese/` dir exists in this lane.

Waves: w1 (attempt 1, build + first falsifiers) 36 seats — 12 scribe, 8 executor, 5 critic, 3 connector, 3 reviewer,
2 mutation-tester, 2 scout, 1 sentinel (`.ufo/waves/round-32/w1/swarm-registry.json`, 36 items in `w1-spec.json`);
w2 (falsify) follows inside the round shape of 64–128 seats, the L1 holding the planner seat. Report counts, dead
seats and every wave's result are recorded in the round report.

Re-verification result (freshness duty): this round re-verifies the docs-held WebDriver BiDi capability matrix —
`corpus/knowledge/webdriver-bidi-capability-matrix.md` §2, the seventeen rows that entered coverage at kaika fleet
round-1 (`LOG.md:492`, capability `sources-registry`, coverage 8→9) with `locally measured: no` on every row and the
entry's own `verified-at: 2026-10-19`. Those rows are now observed on this host's BiDi endpoint, so §2's `locally
measured: no` cells describe the 2026-10-19 state and the new entry carries the runtime verdicts; R16 has no BiDi
command to observe. S123 additionally re-grounds S119's header date from fresh bytes.
`<L1: re-verification verdicts at REV — the seventeen row results and the S123–S126 re-location results>`.

Round-32 commit ledger (lane `master`): `d805d1d6` round-31 verifier spot-check (baseline); `2f8535c5` both counters
and registry rows; `5ad1fcbf` pre-freeze counter fix (chromium TMPDIR under a deep path); `4181fffb` claims, controls
and baseline receipts; the C1 entry, receipts and rows, the C2 corrections, the lesson, QUALITY and the wave
evidence follow and are named in the report.
