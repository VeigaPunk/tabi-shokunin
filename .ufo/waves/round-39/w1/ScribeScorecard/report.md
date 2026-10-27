# ScribeScorecard — round 39 draft (declared claims + executed disposition)

Axes worked: **depth** (section structure, frozen-predicate fidelity, predicate-vs-score separation) and
**freshness** (read the frozen counters/claims at the current tip `1ace2fde`, not from prose). No browser was
launched; no product file, counter, claim, judge, or fleet-root tracked file was edited.

## 1. Draft block for `SCORECARD.md` (append-only; not written here)

> Host guard forbids a seat writing `SCORECARD.md`; this is the block the integrator appends. Every field marked
> `⟨pending⟩` is unmeasured and asserts no verdict.

---

## Round 39 — declared claims (frozen before data)

Freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; round-start baseline
`5bc56a81d196caeb8d24551928b883802697aabb`. The frozen `claims.json` records axis scores at
round start: adjacency 8 (lowest non-retired), operability 9, depth 9, coverage 9, freshness 9,
calibration 9; saturation line 8 / stagnation window 3. The claims record the stagnation nudge:
no capability entered in rounds 36–38 (the round-38 Playwright capability was not admitted), so the
window is exceeded and the lowest-axis obligation is waived; the round is a frontier/capability move
with C1 a capability acquisition on coverage. All three frozen instrument digests were verified equal
to the `claims.json` `frozenDigests` both at the freeze and at the observed tip: C1 counter
`75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`, C2 counter
`eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`, driver
`3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc`. Tool installs per the claims: none.

| Claim / axis | Kind | Counting command | Before | Target |
|---|---|---|---|---|
| C1 coverage — Playwright 1.64.0 + Firefox 157.0 (Juggler) session-bound egress against the loopback fixture, observed by `scripts/playwright-firefox-egress-round39.mjs` | capability-acquisition | `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev <REV> --repo <clean clone> --json` | No session-bound receipt: the round-38 v1 receipt (`corpus/evidence/round-38/playwright-firefox/receipt.json`, sha256 `dd77b71a…`) is refused by the frozen counter — global executable grep pid discovery, 2 samples at 400 ms, empty pid set not refused, `firefoxVersion` null | Frozen predicate true at the measured integration REV; the round-38 v1 receipt refused as the do-nothing control; the capability row enters `SCORECARD.md` |
| C2 calibration — round-38 routed residuals: sentence-mutation red control + numstat window protocol | instrument-repair | `node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev <REV> --repo <clean clone> --json` | Round-38 tip v1 counter predicate false (D4 `m3-sentence-mutant.json` absent; D6 no round-38 numstat receipt); v1 never checks the predicate sentence, so a mutated-sentence `claims.json` is invisible to it | Frozen predicate true at the measured integration REV; the counter itself refuses the mutated-claims fixture (exit non-zero, D7 finding) and the receipt records it; the numstat receipt window and body equal `git diff --numstat 3f42a5c7cc19..REV` excluding the receipt itself |

Frozen predicates, verbatim (each one byte-identical sentence across `claims.json`, the counter
constant and the counter header):

- **C1** — `schema v2 AND two unrefused runs AND identical first-shot sha256 across runs AND per-run owned
  tree nonempty rooted at a child of the driver node process AND at least 8 socket samples per run over at
  least 1000 ms AND zero non-loopback socket observations on both the ss and /proc surfaces including the
  post-close final sweep AND zero survivors AND the fixture port closed AND the firefox version bound from
  the live session AND the round-38 v1 receipt refused by this counter`
- **C2** — `D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34 AND
  w2-artifacts absent AND D2 tally stated == recomputed 23 ok 11 finding AND D3 every round-37 hash present
  and ancestor with the freeze landing stated at 34ed508c AND D4 captured-by row present AND the round-39
  sentence-mutant receipt records a nonzero exit with a predicate sentence different from the frozen
  sentence AND D5 round-39 census receipt counts equal this counter's parse AND D6 the round-39 numstat
  receipt names baseline 3f42a5c7cc19 and REV and its body byte-matches git diff --numstat baseline..REV
  excluding the receipt itself AND the round-39 claims predicate is byte-identical to this counter's
  sentence`

Kill rules (frozen): C1 — any stated number differing from the receipt; missing dual-surface agreement;
empty or unbound owned set admitted; fewer than 8 samples or 1000 ms coverage; any non-loopback
observation; survivors; unbound version; the do-nothing control reaching the predicate. C2 — any D1–D3
re-derivation differing; a fabricated mutant receipt (no recorded counter run, sha pair equal, or exit 0);
census receipt counts differing from the counter parse; numstat window/body not equal to `baseline..REV`
excluding itself; claims predicate not byte-identical.

## Round 39 — executed disposition

Draft status: **the integration REV is not yet fixed.** Every cell marked `⟨pending⟩` is unmeasured and no
lane verdict is asserted. The measured fields below are the frozen counters' own outputs (exit status and
JSON) at the named revisions; receipts and counter bytes are read through `git show <REV>:<path>`.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 coverage | `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev <REV> --repo <clean clone> --json` | Baseline `5bc56a81`: `FINDING receipt-absent`, predicate not-met, control refused. At `d3232d56` (pre-integration carrier) and unchanged at tip `1ace2fde`: findings 0, `predicate: true`, exit 0. Receipt `e894f1d5…`: schema `tabi-pw-firefox-egress-receipt-v2`; two unrefused runs, `sampleCount` 9 / `coverageMs` 1560 and 8 / 1461; one shared first-shot sha256 `ebfae99c…`; owned `nodePid` 2430191 with 1 root and 5-member tree per run; `ss` and `/proc` each 6 observations / 0 non-loopback; post-close sweep 0/0 on both surfaces; `egressNonLoopback` 0; `survivors` 0; ports closed; Firefox 157.0 bound to `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`; fixture sha256 `fe5564b6…` (1261 bytes); v1 control refused with exactly five reasons | ⟨pending: integration REV⟩ — observed predicate **met** (boolean) at `d3232d56` and `1ace2fde`; numeric **coverage 9 → 9** unless an authored rubric moves it |
| C2 calibration | `node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev <REV> --repo <clean clone> --json` | Baseline `5bc56a81` (v1 counter, banner `C1_ROUTED_DEFECTS`): `d4-receipt`, `d6-file`, predicate not-met, seats 34, tally 23/11, census 144. At `d3232d56` and tip `1ace2fde`: D1 true (stale line present, append-only correction present, seats 34, w2 artifacts absent); D2 stated 23 ok / 11 finding == recomputed 23/11 over 34 reports; D3 all six round-37 hashes present, commits, ancestors, freeze landing at `34ed508c`; D4 mutant receipt exit 1, sentence differs, sha pair unequal; D7 claims predicate byte-identical (source `claims.json@1ace2fde`). Findings: `d5-receipt` (`.ufo/waves/round-39/measure/census-end.txt` absent at REV), `d6-file` (`.ufo/waves/round-39/measure/numstat-at-<REV8>.txt` absent at REV). Predicate **false**, exit 1 | ⟨pending: integration REV⟩ — observed predicate **not met** at every REV measured; the D5/D6 receipts are absent and the frozen D6 target is self-referential (see *Freeze provenance* and *Recorded limits*). Numeric **calibration 9 → 9** |
| depth, operability, freshness, adjacency | — | no claim this round | unchanged; no-harm and trend rows are completed by the integration seat, not here |

Measured census ground truth at the tip (scribe-computed with the census-start command, identical at the
round-start baseline): rows 144; tier A=128, B=7, C=9; status mined=120, queued=15, rejected=9. This is the
value a `census-end.txt` receipt would have to carry for D5 at a tip-revision measurement; no such receipt
is committed.

### Measured predicate vs numeric axis score

- **Measured predicate** is a boolean over committed artefacts at a *named* REV, produced by the frozen
  counter's exit status (0 met / 1 evaluated-not-met / 2 could-not-evaluate). It is never derived from prose
  and never from a numeric score.
- **Numeric axis score** is the frozen `axesAtRoundStart` value (adjacency 8, all others 9). A passing
  predicate does not increment it; only an authored rubric may, which is the discipline already applied in
  rounds 35–37. The disposition therefore reports the observed predicate and the unchanged numeric score as
  separate fields, and a draft may leave either as `⟨pending⟩` rather than infer one from the other.

### Capability row (drafted, conditional on the C1 disposition)

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| playwright-firefox-session-bound-egress | Run Playwright 1.64.0's Firefox 157.0 through Juggler against a loopback fixture, bind the browser's process tree to the driver node process, sample both `ss` and `/proc` socket surfaces for the run window plus a post-close sweep, and emit a two-cold-run receipt with identical first-shot bytes, zero non-loopback observations, zero survivors and a session-bound browser version | `scripts/playwright-firefox-egress-round39.mjs`; `corpus/evidence/round-39/playwright-egress/receipt.json` (sha256 `e894f1d5…`); counter `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` | 39 ⟨conditional: not asserted until the integration-REV disposition⟩ |

This row is drafted, not landed: several w1 seats found that the instrument's coverage is periodic
sampling with named blind spots (below), so the row's "what it can now do" wording deliberately claims
sampling, not continuous detection.

### Freeze provenance (observed, disclosed)

- `claims.json` at the freeze commit `9c09ebb1` has sha256 `40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009`
  and records `"frozenAt": "1f4260aeb3af186e84444cbb417a31b8a35bdb55"`; a later commit `dc695dc`
  ("align mutant fixture to frozen claims bytes") changes that single field to `9c09ebb1…`, giving sha256
  `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6` (`git diff --stat`: 1 insertion,
  1 deletion). The three frozen instrument digests are unchanged by the amendment and match at both commits.
- Consequently the C2 red-control receipt binds `frozenClaimsSha256` `40740f82…` — the *pre-amendment*
  claims blob — not the `ed88855a…` blob resident at the measured REV. The mutant blob it names is
  `a2ba6eea…`; w1 `RevC2Receipt` replayed the same command at `9c09ebb1` and observed exit 1 with
  `d7-sentence-mismatch`.
- Commit `1f4260ae` (the stale `frozenAt` target) carries C2 counter `891c1e9d…`, not the claims' pinned
  `eefc8997…`. That is the pre-amendment C2 freeze, which is what w1 `RevFreezeIntegrity` observed as a
  digest mismatch; at `9c09ebb1` and every later commit all three frozen digests match.

### Recorded limits (w1 falsification evidence; cited, not upgraded)

| Limit | Source | Observed |
|---|---|---|
| Sampling blind spots | `w1/CritC1Samples.md` | Loopback-only fixture: 21 connections closed after 12 ms, 100 ms probes over 2.2 s → 1 of 22 probes saw the fixture port. The frozen sample-count/elapsed thresholds cannot exclude between-tick gaps. |
| Source-level false-negative paths in the driver | `w1/RevC1Driver.md` | PID tree discovered once before navigation and reused; empty/unavailable `ss` stdout becomes synthetic zeros and the counter checks only numeric non-loopback counts; roots selected by argument substring; `coverageMs` computed after the post-close 600 ms sleep. Occurrence during the captured runs was not evaluated. |
| One-surface acceptance | `w1/RevC1EgressWindow.md` | The counter can accept a run with one observation surface unavailable; startup/tree/sample-window gaps remain unobserved. |
| `/proc` malformed-hex parser | `w1/CritC1ProcParse.md` | `GG00007F` and `0100ZZ7F` decode to loopback (`[127,0,0,NaN]`, `[127,0,NaN,1]`); width-only validation weakens the second surface, so dual-surface agreement is not independent. |
| D4 forgeable / D7 identity | `w1/CritC2ReceiptHonesty.md`, `w1/CritC2Semantics.md` | D4 checks only JSON fields (`observedExit`, differing sentence, unequal 64-hex pair) — a hand-authored receipt passes; D7 indexes `claims[1]` without checking `id === C2`. |
| D5 unbound, D6 self-referential | `w1/RevD5D6.md`, `.ufo/waves/round-39/measure/c2-self-reference-probe.txt` | D5 equality is histogram-only, unbound to REV/source hash; D6 requires a receipt committed *at* the measured REV that names that REV, so adding the receipt changes the hash the receipt must name (probe: candidate `03322e9d…` → carrier `5c13c846…`, both refused `d5-receipt`/`d6-file`). D6 header endpoint checks are substring-only. |
| Untracked paths outside seat scopes | `w1/RevNoHarmScope.md`; this seat's `git status` | `?? .ufo/waves/round-39/measure/c2-self-reference-probe.txt` and `?? .ufo/waves/round-39/w1.ready.dispatched` (plus in-flight seat files). |

D6 satisfiability note **[INFERENCE, not executed]**: with the measured REV derived from the same commit
tree that must contain the receipt, the only construction that could satisfy the frozen D6 is a commit whose
8-hex prefix was named by an ancestor — i.e. a ~2^32-offset prefix grind. No such arrangement exists in the
lane, so the draft treats the frozen C2 target as unreachable as written and leaves the final verdict to the
integration REV rather than asserting one.

## 2. Commands actually run (this seat)

```sh
# provenance / digests (lane root /home/vgpnk/Projects/shokunin/tabi-shokunin)
sha256sum .ufo/waves/round-39/counters/c1-egress-session-bound.mjs \
          .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs \
          scripts/playwright-firefox-egress-round39.mjs
# → 75e823e4…, eefc8997…, 3fba8b68…  (equal to claims.json frozenDigests)

for R in 1f4260ae 9c09ebb1 dc695dc 1ace2fde; do git show $R:.ufo/waves/round-39/claims.json | sha256sum; done
# → d5bcab65…, 40740f82…, ed88855a…, ed88855a…

git diff --stat 9c09ebb1e2ff594c70ce72093b5d4133c1734dca d3232d56… -- .ufo/waves/round-39/claims.json
# → 1 file changed, 1 insertion(+), 1 deletion(-)   (frozenAt only)

# frozen counters, read-only, at the observed tip
node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 1ace2fde… --repo . --json ; echo $?
# → predicate:true, findings:[], control.refused:true (5 reasons), C1_EXIT=0
node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 1ace2fde… --repo . --json ; echo $?
# → findings:[d5-receipt, d6-file], predicate:false, C2_EXIT=1

# census ground truth (same command shape as measure/census-start-counts.txt)
awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {n++; t[$5]++; s[$9]++} END {…}' corpus/SOURCES.md
# → rows=144; tier A=128 B=7 C=9; status mined=120 queued=15 rejected=9
```

Raw outputs preserved at `w1/ScribeScorecard/c1-at-1ace2fde.txt` and `w1/ScribeScorecard/c2-at-1ace2fde.txt`;
the pre-integration pair is `.ufo/waves/round-39/measure/pre-integration-counters.txt` (REV `d3232d56…`).

## 3. Findings of this seat

1. The tip is `1ace2fde` with **no integration REV**; the drafted disposition therefore carries `⟨pending⟩`
   verdict cells instead of a lane verdict.
2. C1's measured predicate is **met** at both observed carriers with byte-identical receipt `e894f1d5…`.
3. C2's measured predicate is **not met** at every observed REV; the two findings are absent receipts
   (`d5-receipt`, `d6-file`), not failed re-derivations — D1–D4 and D7 all hold.
4. `claims.json` was amended after the freeze commit (the `frozenAt` field only), so the C2 mutant receipt
   binds the pre-amendment blob `40740f82…` while the measured REV carries `ed88855a…`. The instrument
   digests were not amended and match at both commits.
5. `w1.ready.partial` present in an earlier directory listing was gone at observation time; the seat files
   and `measure/c2-self-reference-probe.txt` remain untracked.

## 4. Out of scope / not asserted

- No `SCORECARD.md`, `LOG.md`, `MANIFEST.json`, counter, claim, receipt or product file was edited; no
  commit, push, git/jj mutation, fleet/sibling-repo touch, install, spawn, or browser launch.
- No lane verdict, no axis increment, and no claim-met/claim-not-met statement for the integration REV.
- w1 seat verdicts above are quoted as their own observations, not adopted as the lane's.
- Scratch `/fast/scratch/hyaku/tabi-r39/ScribeScorecard/` created for this seat and removed before yield;
  no `/tmp` file used.

VERDICT finding — draft landed: declared-claims section frozen-field complete, disposition carries `⟨pending: integration REV⟩` cells; observed C1 predicate met (exit 0, receipt `e894f1d5…`) and C2 predicate not met (`d5-receipt`, `d6-file`) at `d3232d56` and `1ace2fde`; C2's frozen D5/D6 receipts are absent and D6 is self-referential by probe; `claims.json` was amended post-freeze (`frozenAt` only, `40740f82…` → `ed88855a…`) so the mutant receipt binds the pre-amendment blob; no lane verdict or numeric axis score asserted.
