# RevFreeze — round-31 freeze review (seat report)

## Verdict

The freeze commit 9505a10eb80b2a0b273ebaba3f7f872ad302192d is sound: both frozenDigests in `.ufo/waves/round-31/claims.json` match `git show <freeze>:<path> | sha256sum` byte-for-byte; every control receipt I re-ran (C1 J1, J2, J3 offline+live, J4, J5; C2 J1, J2, J3, J4 — all ten, beyond the required five) reproduces field-identically on a scratch clone at the freeze commit; the C2 freeze-time corrections touch exactly the four statements claims.json names and each was true or superseded at the round-30 tip (round-30 oracle measured at 22 cases by running the v1 counter's self-test at the baseline); and both counters' code says what the claims.json predicates say. One low-severity defect: the baseline README's m8-proof row misstates the old-oracle self-test tally as "(28/30, exit 3)" where the receipt and my re-run show cases=29 passed=28, exit=3 (old-oracle.mjs has 29 CASES — it lacks `v2-readme-no-section-fallback`). No high or medium finding. The freeze is fit to measure against.

## Check 1 — frozenDigests — PASS

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ for f in scripts/check-decision-table.mjs scripts/check-selfassessment.mjs; do
    printf '%s ' "$f"; git show 9505a10eb80b2a0b273ebaba3f7f872ad302192d:"$f" | sha256sum; done
scripts/check-decision-table.mjs d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  -
scripts/check-selfassessment.mjs 143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce  -
EXIT:0
```

Both equal `claims.json §frozenDigests` and the committed receipt `baseline/frozen-counter-sha256.txt`. The committed counters are byte-identical to the freeze-tree blobs (my scratch clone checked out at 9505a10, `git status --porcelain` empty).

## Check 2 — control receipts reproduce — PASS (10/10)

Method: one live clone per seat (`git clone --shared <lane> $S/clone; git -C $S/clone checkout -q 9505a10…`, toplevel verified, tree clean), then I re-ran the committed `baseline/controls.sh` itself with `T0=$S/clone`, `OUT=$S/out`, `PRE=$S/prefetch` and `HYAKU_SCRATCH=$S` (so the script's internal `tabi-r31/l1/{ctl,tmp}` scratch landed inside my seat scratch, per lane bounds). Prefetch: I fetched RFC 9309 myself — `curl -q -sS --proto =https -o prefetch/rfc9309.txt https://www.rfc-editor.org/rfc/rfc9309.txt`, exit 0, HTTP 200, 25265 bytes, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`, 2026-10-26T08:38:55Z (receipt `receipts/fetch-rfc9309.txt`).

```
$ bash <lane>/.ufo/waves/round-31/baseline/controls.sh "$S/clone" "$S/out" "$S/prefetch"
CONTROLS-EXIT:0        (Wall time 165.77s)
```

Comparison: `jq -S 'del(.rev)'` on each committed receipt vs my run (fixture commit hashes differ per run by design; every other field must match):

```
MATCH  c1-J1-do-nothing      MATCH  c2-J1-do-nothing
MATCH  c1-J2-old-rows        MATCH  c2-J2-delete-lines
MATCH  c1-J3-selfquote-offline  MATCH  c2-J3-uncited-correction
MATCH  c1-J3-selfquote-live  MATCH  c2-J4-wrong-doc-citation
MATCH  c1-J4-invented-thresholds
MATCH  c1-J5-package-as-is
```

All ten `.exit` files match the committed ones (c1-J3-offline exit=0; every other control exit=1). Required subset confirmed in detail:

- **C1 J1** (do-nothing, --live): population 0, admitted 0, `entryPresent:false`, exit 1 — matches claims.json C1 `before` ("entry absent at the freeze tree"). No network needed (entry absent short-circuits before any fetch).
- **C1 J3 offline**: population 2, admitted 2, exit 0 (self-quote receipts pass q2/n1 offline — the offline game is winnable); **J3 --live**: population 2, admitted 0, both rows `l1-live`, exit 1. The counter made two internal live GETs here (rfc-editor.org/rfc9309.txt, rfc6585.txt; the instrument does not log their bytes — the observable outcome, both quotes absent from the live pages, is in the reproduced receipt). `--live` is therefore load-bearing in the predicate, as claimed.
- **C1 J4** (--live): population 3, admitted 0, all three rows `n1-threshold-sourced`, exit 1 — genuine RFC 9309 bytes/quotes with the author's own thresholds (10 redirects vs quote's five; 12 hours vs 24; 64 KiB vs 500) are refused. No live GET fires (rows fail at n1 before l1-live).
- **C2 J1** (do-nothing): mismatches 9, exit 1; `counted` is exactly the nine lines claims.json names — SKILL.md 1614 (25/26), 2479 (13/30), 2514 (5/10), 2515 (17/30), 2529 (7/10), 2530 (20/30), 2543 (20/29), 2544 (7/10), corpus/README.md 613 (17/30) — and nothing else (SCORECARD and LOG windows contribute zero counted mismatches).
- **C2 J3** (uncited blanket correction): mismatches 12 = the nine stale + 3 new at SKILL.md:2582, where the single `26/26` tally on a line naming four scripts is attributed to each named script (s106 10, release-pins 29, selfassessment 30 refuse it; sources 26 accepts). Matches the committed receipt and the counter's same-line association rule.

Also reproduced: counter self-tests at the freeze tree — `check-decision-table.mjs --selftest` → `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`, exit 0; `check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30`, exit 0 (matches `c1-counter-selftest.txt` 34/34 and `c2-counter-selftest.txt` 30/30, and the tallies stated in the freeze commit's new SKILL.md registry rows). m8-proof: `node .ufo/waves/round-31/baseline/m8-proof/old-oracle.mjs --selftest` → `verdict=failed cases=29 passed=28`, **exit 3**, CASE lines byte-identical to `m8-proof/old-oracle-selftest.txt` — the summary-line-oracle fix is able to fail, as required. Committed `c2-T0-reading.json` == `c2-J1-do-nothing.json` (rev-normalized), confirming the README's statement that tree 192b0643 (freeze minus `.ufo/waves/round-31/`, unread by both counters) reads the same.

## Check 3 — C2 freeze-time corrections — PASS

The freeze commit's only SCORECARD.md/SKILL.md edits (verified from `git show 9505a10 -- SCORECARD.md SKILL.md`):

- SCORECARD.md +6 lines: `## Round 31 — corrections (append-only; each cites the stale line in its own document)` + one bullet stating `check-selfassessment.mjs --selftest (30/30)` superseding exactly `SCORECARD.md:1439`, `:1465`, `:1486`.
- SKILL.md +19 lines: the round-31 registry section (2 new gate rows stating cases=34 and cases=30 — new statements, not corrections) + one correction paragraph superseding exactly `SKILL.md:2545`.

That is precisely the four statements claims.json §C2.freezeTimeCorrections names; nothing else is corrected. Each was true or superseded at the round-30 tip:

```
$ git show 96a2d1a3…:SCORECARD.md | sed -n '1439p'   → | C2 calibration | … selftest baseline 17 cases …
$ git show 96a2d1a3…:SCORECARD.md | sed -n '1465p'   → - `scripts/check-selfassessment.mjs` `--selftest` (22/22): correction — supersedes the stale tally at `SCORECARD.md:1439` …
$ git show 96a2d1a3…:SCORECARD.md | sed -n '1486p'   → … C2's frozen counter now runs `cases=22` …
$ git show 96a2d1a3…:SKILL.md    | sed -n '2545p'   → | selfassessment-counter | gate | … (cases=22, passed=22) …
$ cd <baseline clone 96a2d1a3> && node scripts/check-selfassessment.mjs --selftest | tail -1
SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22      (exit 0)
```

So at the round-30 tip: :1465, :1486, SKILL.md:2545 state the then-oracle 22 (true); :1439's stale 17 is superseded there by the round-29 22/22 correction at :1465, which cites it. The freeze commit's own new statements are oracle-correct at the freeze tree: 30/30 (SCORECARD bullet, SKILL paragraph), cases=34 (decision-table row — self-test measured 34/34), cases=30 (selfassessment-counter row — 30/30). The surrounding correction chains hold, so no other staleness leaks into the freeze reading: SCORECARD:1507 (round 30) supersedes the s106 tallies at :1438/:1466/:1479 with 10/10, and :1193 supersedes the round-evidence-audit twelve-case wordings at :1138/:1139/:1151 with cases=13 — consistent with c2-J1 counting exactly nine, none in SCORECARD. Baseline oracles for the other gates, measured by me at the baseline clone (all exit 0): s106 10/10, release-pins 29/29, sources 26 (`SOURCES_SELFTEST verdict=clean cases=26` via its `--self-test` flag) — so all nine before-value statements were already stale at the baseline, as claimed.

## Check 4 — predicates vs counter code — PASS

Read both counters in full from the freeze tree (482 + 900 lines).

- **C1** (`check-decision-table.mjs`): exit 0 ⟺ `clean` ⟺ population > 0 ∧ admitted = population; so "exits 0 and admitted ≥ 10" entails failing = 0 — the predicate, countingCommand (`--rev/--baseline/--entry/--live/--json`), before value (entry absent → `result([],false,false)` → exit 1), kill rule (exit 2 on Refusal: usage, unresolvable rev, registry absent at --rev/--baseline, malformed --entry) and all five control descriptions match the code paths (r4-new-row before any receipt check; l1-live only with --live and only after q2/n1; n1 compares the threshold number against numbers found in the quote, thousands separators and English number words handled; live fetch is `curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5`, 200 + same-host effective URL required — matching the freeze commit's own SKILL.md registry row).
- **C2** (`check-selfassessment.mjs` v2): exit 0 ⟺ `counted.length === 0` ⟺ mismatches = 0; oracle is the gate's own last `<NAME>_SELFTEST … cases=N` summary line (M8 fix), falling back only when no summary line prints; windows are SCORECARD (section fallback), LOG.md, and — new in v2 — SKILL.md and corpus/README.md with `lineOnly` association (no section fallback) and paragraph supersession requiring same-document citation (`citesLine` distinguishes `README.md` from `corpus/README.md`), a correction marker, the same script, and the oracle-correct number. The 30 CASES include the v2 window cases (`v2-skill-*`, `v2-readme-*`, `v2-oracle-reads-summary-line-not-first-cases-token`) and the M8 regression case. The numstat deleted-lines condition and the scripts/-unchanged condition are procedural (measurement rule), not counter code — consistent with the kill rules as written; at REV = freeze commit they hold vacuously/verified (check 1).
- Separability as claimed: the C1 counter reads only corpus/SOURCES.md, the entry and receipts (no SKILL.md/README.md line); the C2 counter reads only SCORECARD/LOG/SKILL/corpus-README, evidence JSON receipts and git status (no knowledge entry, no registry row). The disclosed coupling (C1's SKILL.md registry row cases=34 read by C2's window) is correct at freeze and c2-J1 counts no mismatch there.

## Findings by severity

- **Low — README-receipts.md prose slip (m8-proof row).** `baseline/README-receipts.md` says the m8 proof's regression case "FAILS (28/30, exit 3)"; the committed receipt `m8-proof/old-oracle-selftest.txt` and my re-run both show `cases=29 passed=28`, exit 3. old-oracle.mjs contains 29 CASES (it lacks `v2-readme-no-section-fallback`, present in the v2 counter — confirmed by diffing CASES ids), so no reading yields 30. The receipt is the ground truth and reproduces; claims.json carries no such figure. Suggested fix (curation, one word): "(28/29, exit 3)" or "cases=29 passed=28, exit 3".

No medium or high finding. No gate, counter, claim or control defect found.

## Residual risk and verification gaps

- `baseline/census-start.txt` (fleet `sources-census.sh validate` at round start, exit 0, 19 W04) not re-run: it is a round-start fleet-state snapshot, not a counter control; re-running now would validate the current fleet, not the freeze state.
- The kill-rule conditions enforced outside the counters (counter bytes = frozenDigests at REV, no change under scripts/ between freeze and REV, numstat 0 deleted lines in the four documents) are verified here only at REV = the freeze commit; at the measurement REV the L1 must re-verify them (claims.json measurementRule already says so).
- The two counter-internal live GETs during c1-J3-live were not byte-logged by the instrument; their outcome (l1-live on both rows) is the recorded evidence. My own fetch record covers the J4 prefetch only.
- Fixture revs differ between the committed receipts and my reproduction (per-run fixture commit hashes); all comparisons were rev-normalized, every other JSON field identical.

## Tooling record

No tools installed or upgraded (curl/git/node/jq preexisting; pacman untouched). Scratch: `/fast/scratch/hyaku/tabi-r31/RevFreeze` (clone, base-clone at 96a2d1a3, prefetch, out, receipts copy at `.ufo/waves/round-31/w1/RevFreeze/receipts/`). No lane tracked file edited; no lane git/jj state touched; commits only inside scratch fixture clones created by the committed controls.sh.
