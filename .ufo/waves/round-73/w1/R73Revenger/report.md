HOLDS

# tabi r73 — fresh-start audit: does r73 repeat a rejected root failure?

Seat R73Revenger (calibration). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Audited lane tip **c44fcf6f** (`round-73: C1 scored run (leg a) and leg (c) battery + kill power on its receipt`),
D = **3409ab53** (`freeze.txt`), base **d7ff9f19**. Frozen instruments: `.ufo/waves/round-73/freeze.txt:3-8`.
All readings below are committed bytes at that tip unless marked *working tree*. I did not author any
round-73 byte. I did not run the driver or Chromium; I re-executed the **frozen counter read-only** on both
receipts (it writes only stdout) and kept the two outputs beside this report (`rerun-a.json`, `rerun-b.json`).
No lane gate was re-run to create scored evidence.

Verdict of this audit: **none of the eight enumerated root failures is repeated by the committed r73 bytes.**
Six are fully closed by construction and re-measured; one (the r62 duplicate/fabricated class) is closed on
the r73 instrument while the original v21 meter is not regenerated; one (the r72 replay hole) is closed for
both routed replays with a declared, witnessed residual (full-identifier rewrite) — section 4.
The SCORECARD/SHONEN self-assessment is accurate on every current-state claim I could check: **0 contradicted**,
**8/8** SHONEN pointers resolve, **1** disclosed plan-scope delta, **0** broken numeric chains.

## 1. Root-failure matrix (r60–r72 → r73)

| # | Root failure, source | r73 state | Evidence (path:line or command → exit) |
|---|---|---|---|
| 1 | **K7 no-regression conjunct** (r60). The claim's own predicate carried a no-regression clause reading live sibling state; it went red and killed C1. `corpus/lessons/round-60-verifier-spotcheck.md` §2 C1 verdict ("KILLED by its own K7"); `MANIFEST.json` rounds[1094]. | **Not repeated.** r73 has no no-regression conjunct and no predicate clause reads live or sibling state; all four legs are repository-local and static once (a) lands. | `grep -n 'regress' .ufo/waves/round-73/claims.json` → exit 0, **one** hit, `claims.json:8`, inside the `priorRound` prose (the fresh-start reading note), not in the predicate. Predicate `claims.json:33` (a)–(d); kill list `claims.json:36-41` (4 rules) has no no-regression term. |
| 2 | **Frozen header rejected** (r61). The frozen snapshot's first line was `lane<TAB>`; the frozen counter rejected its own frozen input (exit 2, bad header). `round-61-verifier-spotcheck.md` §2 first row; `MANIFEST.json` rounds[1100]. | **Not repeated / not applicable.** r73 has no TSV header or snapshot artifact; its frozen inputs are `claims.json`, `freeze.txt` and the 12 committed receipts, and the frozen instrument consumes all of them. | Re-measured root: `sed -n 1p .ufo/waves/round-61/c1/snapshot-r61.tsv \| cat -A` → `lane^I$`. r73: `run-scored.sh` awk resolves the pin from `freeze.txt:3`; re-run `node scripts/check-synthpinch-r73.mjs --receipt corpus/evidence/round73/.../receipt.json --expect-driver-sha256 3f0ffe24… --expect-nonce tabi-r73-l1-3409ab53b905 <12 priors> --json` → **exit 0**, `clean`, 98 checks (`rerun-a.json`). All 12 priors parse and are used (`c1-negatives-a.json` `positiveOk:true`, 228 cases). |
| 3 | **Post-scoring recorder/interface changes** (r61). The final counter was +10,472 B / 4 digests different from the frozen text after seats had scored; the claim became unprovable as frozen (`round-61-verifier-spotcheck.md` §2 C2; `MANIFEST.json` rounds[1100]). | **Not repeated for the pinned instruments.** The freeze is followed by one output-only commit; all six pinned bytes are identical at D and at HEAD; no `scripts/` change after D. | `git diff --stat 3409ab53 HEAD` → 14 files, **all** under `.ufo/waves/round-73/scored/` plus the receipt (`exit 0`). `sha256sum` of the six instruments → equal to `freeze.txt:3-8` (driver `3f0ffe24…`, counter `3104101a…`, battery `0a738780…`, kill-power `5e4a8255…`, claims `ef289314…`, run-scored `8288728d…`). `git log 3409ab53..HEAD -- scripts/` → empty. |
| 4 | **M5 AND→OR survivor** (r62). The exact producer-verdict polarity flip survived the selftest 16/16 and was killed only by an out-of-battery witness. `round-62` closure R2; `.ufo/waves/round-62/w1/R62MutC2/kills.json` verdicts `M5`: `killedBySelftest:false`, `verdict:"SURVIVED-declared-detector"`; `MANIFEST.json` rounds[1236]. | **Closed, and the kill is attributable (not vacuous).** M5 is a declared source-location mutant and is killed by exactly the producer-verdict polarity cases. | Mutant: `.ufo/waves/round-73/controls/c1/kill-power-r73.mjs:34`. Scored: `c1-kill-power-a.json` → semantic `19/19` killed; `M5-producer-verdict-and-to-or` `killed:true`, `batteryExit:1`, `failedCases` = the **9** polarity cases (`producer-verdict-false-CONFIRMED`, `-true-REFUTED`, `-null-CONFIRMED`, `-string-true`, `-one`, `-true-UNKNOWN`, `-true-lowercase`, `-true-UNMEASURED`, `-true-null`; the 10th, `false-REFUTED`, still refuses under the flip, which is why it is absent). Counter check at `scripts/check-synthpinch-r73.mjs:264`. |
| 5 | **Contradictory duplicate / fabricated dispositions** (r62). The v21 meter greened `real-conflicting-meter.json` and `fabricated-meter.json` (both `predicate:true/findings:0`). `round-62` closure R3; `MANIFEST.json` rounds[1236]. | **Not repeated on the r73 instrument; original meter not regenerated (open outside this claim).** Duplicate keys, duplicate events and fabricated labels are refused semantically. | Counter: exact leg sequence **and length** `check-synthpinch-r73.mjs:156`, `seq` exact 1..N `:160`, leg membership `:161`, producer summary equality `:265`. Battery cases: `leg-order-duplicate-entry` `negatives-synthpinch-r73.mjs:95`, `seq-duplicate-event` `:97`, `event-leg-fabricated-label` `:99`, `leg-marks-fabricated-name` `:109`, `legshape-fabricated-leg` `:154`. Scored: each `ok:true`, exit 1; `seq-duplicate-event` isolated; the other four co-fire only the ids they declare (`c1-negatives-a.json`). Caveat: the r62 v21 adjacency meter itself was not regenerated by this round (section 4). |
| 6 | **r71 leg-b relabel leak.** The driver relabelled a trailing zero-scale wheel as `end`, outside every frozen leg. `.ufo/waves/round-71/w1/R71Exec1/counter.json` → `findings:[{id:"event-leg-domain", detail:"events outside the frozen legs: 1"}]`; `round-71-verifier-spotcheck.md` §2 C1 (b) and R1; `MANIFEST.json` rounds[1448]. | **Closed.** The r73 driver closes the record synchronously and counts late events; the counter refuses any label outside the frozen legs and any handler time outside its label's window. Exec1's r73 receipt has zero out-of-domain events and re-derives clean. | Receipt: 574 events, 11 frozen legs, 0 events outside them, `lateAfterClose:42` (`node` filter over `.ufo/waves/round-73/w1/R73Exec1/receipt.json`). Counter: `leg-marks` `check-synthpinch-r73.mjs:173`, `event-leg-domain` `:161`, `event-leg-window` `:175`. Re-run on Exec1's receipt with the 12 PRE priors **and** the (a) receipt as 13th → **exit 0**, `clean`, 98 checks (`rerun-b.json`). |
| 7 | **r72 relative battery case `in-wheel-anchor-2px`.** `clientX += 2` on an honest x that jitters over {399,400,401}; the ±1 tolerance swallowed it on receipts whose first `in` wheel sat at 399. `scripts/negatives-synthpinch-r72.mjs:159`; r72 scored `c1-negatives-a.json` `failed:["in-wheel-anchor-2px"]`, 217/218; `MANIFEST.json` rounds[1459] (routed defect 1). | **Closed, and proven on all nine repetitions, not one receipt.** The anchor cases are absolute; counter, battery **and** kill power were run over every PRE receipt before the freeze. | Battery: `in-wheel-anchor-abs-402` `negatives-synthpinch-r73.mjs:169`, `-abs-398` `:170`, `default-wheel-anchor-abs-y302` `:171`, must-accept `accept-in-anchor-abs-401` `:251`. Kill power: `M-anchor-tolerance-2` (`kill-power-r73.mjs:52`) killed by exactly `in-wheel-anchor-abs-402` and `-abs-398`. Repetition: `.ufo/waves/round-73/controls/c1/prefreeze-summary.json` → `receipts:9, ok:9, allOk:true`, every row counter 98/clean, battery 228/228, kill power `holds:true`. |
| 8 | **r72 replay hole.** A byte-identical pre-freeze receipt and a nonce+stamps rewrite both scored counter exit 0 clean, battery 218/218 and kill power `holds:true`. `.ufo/waves/round-72/w1/R72Critic/receipts/{zeroedit,forged-a}.counter.json` (`clean`, 0 findings), `battery-forged-a.json` (`allOk:true`), `killpower-forged-a.summary.json` (`holds:true`); `round-72` routed defect 2; `MANIFEST.json` rounds[1459]. | **Closed for both routed replays; one residual is declared, not hidden.** The counter now requires the pin, the expected nonce and ≥1 prior, and refuses a receipt sharing a launch token, DevTools browser id or event timeline with any prior. | Required flags `check-synthpinch-r73.mjs:101-105`; `nonce-expected` `:133`; `replay-launch-token` `:148`, `replay-devtools-url` `:150`, `replay-event-timeline` `:152`; battery replay cases `negatives-synthpinch-r73.mjs:180-186`, must-accept prior `:252`. Controls: `replay-zeroedit-smoke1` exit 1 ids `[nonce-expected + 3 replay]`; `replay-zeroedit-smoke1-own-nonce` exit 1 `[3 replay]`; `replay-forged-nonce-stamps` exit 1 `[3 replay]` — all `exact:true` (`controls-summary.json`). Open residual: `limit-full-identifier-rewrite` **exit 0**, i.e. a forger who rewrites nonce + launch token + browser id + every event `ts` is not refused; this is stated in `claims.json:42` and witnessed in the controls, so it is a declared limit, not a repeat of the hidden r72 hole. |

## 2. The claim at the audited tip (what the committed bytes show)

- **(a)** receipt `corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json` sha256 `a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8` = the value recorded at dispatch; nonce `tabi-r73-l1-3409ab53b905`; driver pin `3f0ffe24…`; counter exit 0, `clean`, **98** checks (`scored/c1-counter-a.exit`=0, `c1-counter-a.json`). Re-run by this seat with the 12 priors → exit 0 (`rerun-a.json`).
- **(b)** *working tree, not committed at the audited tip*: `.ufo/waves/round-73/w1/R73Exec1/receipt.json` nonce `tabi-r73-exec1-3409ab53b905`, 574 events, 0 out-of-domain events, its own launch token/browser id/timeline; counter exit 0 clean 98 (seat output), and my re-run with the 12 PRE priors + the (a) receipt → exit 0 clean 98 (`rerun-b.json`).
- **(c)** battery exit 0, `allOk:true`, 228/228 (216 refuse, 9 must-accept, 3 laundered), `coverageGap:[]`; kill power exit 0, `holds:true`, unmutated battery exit 0, force-true 98/98, semantic 19/19, survivors `[]` (`scored/c1-negatives-a.json`, `scored/c1-kill-power-a.json`, `.exit` files 0).
- **(d)** capability row **0** at the tip (`grep -c '^| \`chromium-synth-pinch-gesture-linux\` |' SCORECARD.md` → 0), which is correct sequencing (row is written only after (a)–(c)); the knowledge note exists and cites S180–S183 (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md:1`, committed at `ae2628af`).
- **Pre-freeze:** 9/9 smoke receipts each have counter + battery + kill power green under the fail-closed summary (`prefreeze-summary.json`; red-state proof of the summary itself `lesson-proof/prefreeze-summary-streamA-lost.{exit=1,json}` → `ok:5/9`).

## 3. Calibration: SCORECARD / SHONEN against repo state

Counts first: **0 contradicted among the grouped checks below (~40 individual assertions); 8/8 SHONEN pointers resolve; 1 disclosed plan-scope delta; 0 broken numeric chains.**

| Claim | Repo observation | Agree |
|---|---|---|
| SHONEN has 4 boxes, all `[~]`, no `[x]` (`SHONEN.md:5,7,9,11`) | `grep -cE '^- \['` → 4; `grep -cE '^- \[x\]'` → 0 | yes |
| Box 1 pointer `SKILL.md:697` approval table | line 697 = `## Approval table — finalized (every interaction class mapped)` | yes |
| Box 1 pointer `SKILL.md:1598-1617` kaika rows | line 1598 heading plus the decision table at 1604–1617 | yes |
| Box 2 `multi-step-journey.md` §1, §2, §7 | headings at `:12`, `:71`, `:252` | yes |
| Box 2 logged in `LOG.md` round-3 | `LOG.md:76` round-3 entry | yes |
| Box 3 `executor-test-sufficiency.md` §0, §4 | headings at `:20`, `:175` | yes |
| Box 4 `PROVINCE.md:3-19` | file lines 3–19: Domain/Owns/Refuses | yes |
| Box 4 refusal receipt | `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` 95 B, lists revenger/kaidoku/kake/kagi | yes |
| SCORECARD r69 knowledge 81→82, registry 173→174 (`SCORECARD.md:3636-3655`) | 58d84eda → 90b9ff04: knowledge 81→82, SOURCES 173→174 | yes |
| SCORECARD r69 C2 63 checks; C1 battery 19/19; C2 battery 44/44; selftest exit 0 | `scored/c2-counter-a.json` checkCount 63; `c1-negatives-real.json` 19/19; `c2-negatives-a.json` 44/44; `selftest-r69-gates.out` `clean sibling-matrix=0 synthscroll=0`, exit=0 | yes |
| SCORECARD r70 knowledge 82→83, registry 174→175; 31/31 controls; C1 84 checks | 90b9ff04 → 11b00f64: 82→83, 174→175; `round-70/controls/summary.json` controls 31/holding 31; `scored/c1-counter-a.json` checkCount 84 | yes |
| SCORECARD r71 knowledge 83→84, registry 175→178; QUALITY 133–134; battery 107/107, 98 isolated; kill power 87/87; falsePass 4→0; selftest 8/8 | 11b00f64→4e4ac080: 83→84, 175→178; `corpus/QUALITY.md:972-978`; `negatives-battery-smoke1.json` cases 107/isolated 98; `kill-power-smoke1.json` mutants 87/killed 87; `pre-r70/summary.json` falsePass 4; `c2-eval-L1.json` falsePass 0; `selftest-r71-gates.out` `clean=true cases=8`, exit=0 | yes |
| SCORECARD r72 knowledge 84→85, registry 178→179; QUALITY 135–136; counter 5/5; battery 218/218; kill power 94/94 + 12/12; (a) 94 checks; (b) Exec1 clean; (c) 217/218 `in-wheel-anchor-2px`; selftest 8/8 | 4e4ac080→0e462227: 84→85, 178→179; `QUALITY.md:978-982`; `smoke-counter-summary.json` 5/5; `negatives-battery-smoke1.json` 218/218; `kill-power-smoke1.json` 94/94 + 12/12; `scored/c1-counter-a.json` 94; `w1/R72Exec1/counter.json` clean 94; `scored/c1-negatives-a.json` failed `["in-wheel-anchor-2px"]`; `selftest-r72-gates.out` `clean=true cases=8`, exit=0 | yes |
| SCORECARD r73 "Planned": absolute anchor, counter+battery+kill power over every pre-freeze receipt | both delivered: absolute cases at battery `:169-172`; `prefreeze-summary.json` 9/9 allOk | yes |
| SCORECARD r73 "Planned": the r71 R2 verifier hardening | **not claimed this round**; `claims.json:42` says "The r71 R2 verifier hardening is not part of this claim" | 1 scope delta, disclosed |
| r73 claim text vs repo (nonce, receipt sha, 98 checks, 12 priors, 228 cases, 19 mutants, 0 capability rows, 179 rows at base, limit witness) | all re-measured above; `git show d7ff9f19:corpus/SOURCES.md` → 179 rows; controls `limit-full-identifier-rewrite` exit 0 | yes |
| SCORECARD historical top table (7/5/5/3/6/5) and "terminal refresh" | differs from the current all-6-at-9, but is stamped 2026-10-14 and explicitly superseded by the round blocks at `SCORECARD.md:3636-3709` | stale-by-design, 0 current-state contradictions |

No false numeric chain was found: knowledge/registry move exactly 81→82→83→84→85 (and 86 after the r73 note),
173→174→175→178→179 (183 after S180–S183). The r73 knowledge note's measured table also re-derives: first `in`
wheel x = 400 six times / 399 three times; first `default` x = 400 seven / 399 two; per-leg Σ deltaY×scale
within 4.21×10⁻⁵ of −100 ln(factor) on all 36 leg sums; wheel counts 16–17 (in/out/clamp) and 8–9 (default).

## 4. Residuals / watch items (none is a repeat of the eight)

1. **Declared limit, open:** a same-user forger who rewrites nonce + launch token + browser id + every event
   `ts` is not refused (`controls-summary.json` `limit-full-identifier-rewrite` exit 0; `claims.json:42`).
   It is witnessed and stated, not concealed.
2. **r62 meter not regenerated (open outside this claim):** the v21 adjacency false-green is not retested by
   r73; only the analogous pattern is exercised on the pinch counter (root 5).
3. **Durability at the audited tip (not an instrument change):** the r73 lesson, `SKILL.md` `## Round 73 gate
   registry`, `QUALITY.md` 137 (only 137 exists; `grep -c '^138\.'` → 0) and `scripts/selftest-r73-gates.mjs`
   are **uncommitted** — the three docs mtime 22:24–22:25 vs the scored run 22:18–22:23, the selftest script
   22:03; Exec1's evidence is under the untracked `w1/`. None is in `freeze.txt` and none changes a pinned byte.
   The L1 must land them without editing the frozen instruments.
4. **Leg (d) is unwritten (row 0)** — correct ordering, but the frozen kill rule "any predicate leg (a)-(d)
   false at the lane tip" is presently true, so the row must land only with (b) verified and integrated.

## 5. Verdict

**HOLDS.** Against the eight root failures of r60–r72, committed r73 bytes show: no K7-style conjunct; no
frozen artifact the frozen instrument rejects; no post-freeze instrument change; M5 killed attributably; the
duplicate/fabricated-label class refused on the new counter; the r71 leg leak closed at both driver and
counter; the r72 relative case replaced by absolute cases run over all nine repetitions; and both r72 replays
refused, with the only remaining forgery path declared and witnessed. The lane's own scoring record matches
the repository: 0 contradicted current-state claims in SCORECARD/SHONEN, 8/8 pointers resolve, and the one
delta (the r71 R2 verifier hardening) is openly excluded from the frozen claim rather than claimed as done.

Confidence: high for the committed-byte comparisons and the counter re-runs; medium for leg (b) only because
its evidence is untracked working-tree state at the audited tip; the calibration sample is broad but not
exhaustive (it covers every current round block and every SHONEN box, not all 3,700 lines of SCORECARD).
