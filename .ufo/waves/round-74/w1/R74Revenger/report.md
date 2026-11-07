HOLDS

# tabi r74 — fresh-start audit: does r74 repeat a rejected root failure?

Seat **R74Revenger** (calibration, non-author). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Audited bytes: base **c72235d6** (r73 verifier spot-check), pre-freeze instruments **b70e0a27**,
claims freeze **8faa903a**, digests commit **D = ca30e1a3**, scored run **19c301da**, tip **db59ed42**
(`round-74: wave w1 spec and validated dispatch`). I did not author any round-74 byte and did not
run the driver or Chromium. I re-executed the **frozen counter read-only** (stdout only, scratch in
`/fast/scratch/hyaku/tabi-r74/R74Revenger/`, removed after copying receipts here) on hand-built
mutants; those probe results are beside this report (`probe-r73-relabel.results.json`,
`probe-tolerance.results.json`, `probe-r73-relabel.mjs`). No lane gate was re-run to create scored
evidence; the committed scored artifacts were read, not regenerated.

**Verdict of this audit: none of the eight enumerated root failures (r60–r73) is repeated by the
committed r74 bytes.** Seven are closed by construction and re-measured or re-executed here; the
eighth (the r73 prior-set limit) is *vacuous for this surface* — a new capability with no earlier
generation, whose cross-generation relabel I executed and found refused — while the r73-planned
pinch prior set is **not shipped** and is explicitly carried (`claims.json:8`), so that item stays
open on the *pinch* surface only. Self-assessment: **0** SHONEN pointers broken (4/4 resolve),
**0** SCORECARD claims contradicted by the repo, **2** in-flight notes (section 2.3).

## 1. Root-failure matrix (r60–r73 → r74)

| # | Root failure (source) | r74 state | Evidence (command → exit / path:line) |
|---|---|---|---|
| 1 | **K7 no-regression conjunct reads live state** (r60 R2; the v19 clause read sibling heads, red on 7 at the data rev / 8 later) | **not repeated** — the frozen predicate has no conjunct that reads anything outside the lane or anything mutable between runs | `python3 -c "json.load(claims)['claims']['C1']['predicate']"` → four legs, all lane-local (receipt, cold run, battery + kill power, SCORECARD row + note), no sibling heads; `.ufo/waves/round-74/claims.json:33`. Re-execution 40 min after the scored run on the same committed receipt: `probe r74…`/`scored_receipt` exit **0**, clean 148 (`probe-r73-relabel.results.json`) — time is not an input |
| 2 | **Frozen header rejected** (r61 C1: the counter refused its own frozen snapshot header `lane\t`) | **closed** — the counter accepts exactly the frozen input class it will be given | `jq '{receipts,ok,allOk}' .ufo/waves/round-74/controls/c1/prefreeze-summary.json` → `9/9/allOk true`, every row `counter.exit 0, 148 checks`, and every one of the 12 PRE receipts is accepted as a `--prior` (the scored run's counter exit **0**, `scored/c1-counter-a.exit`); the schema gate (`scripts/check-imecompose-r74.mjs:133`) matches the schema the frozen driver emits (`corpus/evidence/round74/chromium-ime-composition/receipt.json` `schema = tabi-chrome-cdp-imecompose-r74`) |
| 3 | **Post-scoring recorder/interface changes** (r61 C2: counter +10,472 B, nonce acceptance 12→16 hex after seats began scoring) | **closed** — the instrument set is byte-identical at the pre-freeze controls commit, at D and at the tip | `sha256sum` at `b70e0a27:` == `ca30e1a3:` == working tree for driver `afacee1b…`, counter `5901d895…`, battery `8c0dd93a…`, kill-power `dcc8308b…`, claims `423ae94f…`, run-scored `c6527ccf…` (= `freeze.txt`); `git diff --stat ca30e1a3 HEAD -- <the six>` → empty, exit **0** |
| 4 | **M5 producer-verdict AND→OR survivor** (r62 R2: the exact `&&`→`\|\|` mutant survived 16/16) | **closed** — M5 is a source-location mutant at the exact producer-verdict string and dies; ten polarity cases back it | `.ufo/waves/round-74/controls/c1/kill-power-r74.mjs:36` (`M5-producer-verdict-and-to-or`, edit string required to occur exactly once, `:64-67`), target line `scripts/check-imecompose-r74.mjs:266`; `jq .scored/c1-kill-power-a.json` → `forceTrue 148/148`, `semantic 26/26`, `survivors []`, `holds true`, `unmutatedExit 0`; polarity cases `scripts/negatives-imecompose-r74.mjs:140` (10 pairs), all `isolated: true` in `scored/c1-negatives-a.json` |
| 5 | **Contradictory duplicate / fabricated dispositions false-green** (r62 R3: two contradictory dispositions for one key both accepted, blanket labels) | **closed as a class** — there is no disposition ledger to contradict; every law is re-derived from raw events and the producer summary is bound to the re-derivation | `scripts/check-imecompose-r74.mjs:267` `legshape-consistency` (canon compare of `derived`), per-leg re-derivation `:215-232`, fabricated-label cases `negatives-imecompose-r74.mjs:89-100`, three laundered degenerate receipts refused for their expected id (`scored/c1-negatives-a.json` `launderedCases 3`, all `ok`). Residual R1 below (duplicate JSON keys) |
| 6 | **r71 leg-b relabel leak** (a never-ending gesture leaked one wheel past the `end` relabel; per-leg shape checks accepted a mislabelled event) | **closed** — events are bound to their labelled leg by *handler time inside the leg-marked window*, not only by label | `scripts/check-imecompose-r74.mjs:172` `event-leg-domain`, `:184` `leg-marks` (`closedAt ≥ last mark`, `lateAfterClose === 0`), `:186` `event-leg-window` (window from `legMarks`, monotone `at`). Executed: relabelling one `compose-b` event into `compose-a` → exit **1**, 10 ids led by `event-leg-window`; into `commit` → exit **1**, 10 ids led by `event-leg-window` (`probe-r73-relabel.results.json` `leg_relabel_earlier/later`). Independent cold runs also clean: `w1/R74Exec1/counter.json`, `w1/R74Exec2/d1,d2.counter.json` → clean 148, three distinct nonces/launch tokens, driver pin `afacee1b…` |
| 7 | **r72 relative battery case + replay hole** (a case moved `clientX += 2` from a receipt value already offset, landing inside the counter's ±1 tolerance; legs (a)/(b) satisfiable by a replayed or nonce-rewritten pre-freeze receipt) | **closed** — cases are anchored to the frozen plan / frozen fixture / the 0.1 ms grid, and replay is refused below the declared limit | Cases: `negatives-imecompose-r74.mjs:154` (sub-quantum prior shift), `:158` (1e-12), `:171-173` (selected-text mutations fixed by the frozen fixture's `ab` at sel 2–4, `receipt` `compositionstart` rows), `:101-102` (window boundary ± one grid step). Replay: `check-imecompose-r74.mjs:135` `nonce-expected`, `:157/:159/:162` the three replay ids, `:149` fixture hash. Executed: `replay-zeroedit-smoke1`, `…-own-nonce`, `…-nonce-stamps(+fixture)` all exit **1** with exactly the declared ids (`controls/c1/controls-summary.json`), and `battery 239/239, gap 0` on the scored receipt and on all 9 pre-freeze repetitions |
| 8 | **r73 prior-set limit + 1e-12 timeline escape** (a previous-generation receipt relabelled on four identity fields passed; a 1e-12 `ts` change defeated the timeline hash) | **1e-12 escape closed; prior-set limit not repeated for this surface, open for pinch (carried)** | 1e-12: `controls-summary.json` `replay-forged-1e-12` exit **1**, exactly `replay-event-timeline`; re-executed on a *fully* relabelled PRE receipt: `prior_full_rewrite_1e-12` → exit **1**, 1 id `replay-event-timeline`; `prior_full_rewrite_exact` → same; `prior_shift_006` → exit **1** `event-time-quantum`; `prior_one_event_one_quantum` and `prior_shift_01` → exit **0** (the declared limit, tight: the smallest escaping change is exactly one 0.1 ms quantum, matching `claims.json:42` verbatim). Prior set: `claims.json:20` states the QUALITY 138 boundary (no earlier generation of this surface), and I executed the r73 attack — r73 pinch receipt with schema+nonce+nonceOnPage+driverSha256+fixture+all nonce carriers+fresh launch token/browser id rewritten → exit **1** with 93 ids (`r73_relabelled_maximal`), the four-field variant → exit **1** with 95 ids (`r73_relabelled_four_fields`); the frozen counting command cannot be satisfied by a relabelled previous-generation receipt |

Aggregate for #4/#6/#7/#8: `scored/c1-kill-power-a.exit` = 0, `scored/c1-negatives-a.exit` = 0,
`scored/c1-counter-a.exit` = 0, `scored/c1-counter-a.json` `verdict clean, checkCount 148,
findings []`.

**What the lane did NOT close, stated honestly by the lane itself.** SCORECARD `:3729`
("Planned (r74): a counter generation whose prior set is every committed receipt of every pinch
generation (QUALITY 138), …") was not executed, because r74 claims a different capability; the
r73 pinch capability stays withheld and its cross-generation prior set is still owed. `claims.json:8`
says so ("routed defects 1-2 concern the pinch counter and battery and are carried, not claimed").
This is a superseded plan, not a repeated failure: the r74 counter's own prior set is PRE (12
same-round receipts), and QUALITY 138's class ("differs only in identity labels") is empty for
IME composition — proven by the executed relabel probes above, not by argument alone.

## 2. SCORECARD / SHONEN self-assessment against repo state

### 2.1 SHONEN — 4 boxes, 4/4 pointers resolve (0 broken)

| Box | Pointer | Resolves |
|---|---|---|
| 1 | `SKILL.md` §Approval table `:697`, §Evidence ladder, §Runbook, `:1598-1617` kaika rows | yes — `SKILL.md:697` = `## Approval table — finalized`, `:361` = `## Evidence ladder`, `:87` = `## Runbook`, `:1598` errata heading with the three decision rows at `:1605-1608` |
| 2 | `corpus/knowledge/multi-step-journey.md` §1–§2, §7; `LOG.md` round-3 entry | yes — headings at `:12`, `:71`, `:252`; `LOG.md:76` "round 3: probation-completing round" |
| 3 | `corpus/knowledge/executor-test-sufficiency.md` §0, §4 | yes — `:20` and `:175` |
| 4 | `PROVINCE.md:3-19`; refusal receipt | yes — domain/owns/refuses at `PROVINCE.md:3-19`; `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` present (95 B) |

All four stay `[~]`; no `[x]` was written. Promotion is operator-owned and nothing in this audit
promotes. Cross-domain check: the r74 surface (IME composition over CDP) is inside the province
(CDP session discipline, interaction records); no bleed.

### 2.2 SCORECARD — 0 contradicted claims checked

| Claim | Check | Observed |
|---|---|---|
| r73 block: "Knowledge 85 → 86" | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | `d7ff9f19` 85, `c72235d6` 86, HEAD 87 (r74 note) ✓ |
| r73 block: "Registry 179 → 186" | `git show <rev>:corpus/SOURCES.md \| grep -cE '^\| S[0-9]{3} '` | 179 → 186 → HEAD 193 (S187–S193) ✓ |
| r73 block: counter 98 checks, 9/9 pre-freeze | `jq .checkCount .ufo/waves/round-73/scored/c1-counter-a.json`; `jq .ok …prefreeze-summary.json` | 98; 9 ✓ |
| r73 block commit chain `ae2628af → d7387fb3 → D 3409ab53 → c44fcf6f`, tip 8c081aa3 | `git cat-file -e` + `git merge-base --is-ancestor` | 6/6 commits exist and are ancestors of HEAD ✓ |
| r73 freeze digests hold at the base | `sha256sum` of the 6 `round-73/freeze.txt` files at `c72235d6` | 6/6 `ok` ✓ |
| Capability rows `chromium-*` | `grep -o '^\| \`chromium-[a-z-]*\`' SCORECARD.md` | 6 rows / 5 distinct: the duplicate is `chromium-wheel-scroll-domain-linux` as r63 "planned, not entered" (`:3479`) and r64 entered (`:3537`) — labelled, not contradictory |
| r74 claim "capability row = 0" | `grep -c '^\| \`chromium-ime-composition-linux\` \|' SCORECARD.md` | 0 ✓ (leg (d) still open) |
| r74 claim "no knowledge note covers IME at base" | `git grep -c imeSetComposition c72235d6 -- corpus/knowledge` | no match, exit 1 ✓ |
| `claims.json:8` "r73 admitted (MANIFEST index 1469)" | `python3` over `MANIFEST.json` | `rounds[1469]` = tabi r73, `admitted true`, `capabilities_added ["chromium-synth-pinch-gesture-linux"]` ✓ |
| STATUS AT DISPATCH numbers | `jq` over `scored/*.json`, `cat scored/*.exit` | counter clean 148 findings 0 nonce `tabi-r74-l1-ca30e1a3b7b2`; battery 239/239 gap 0 allOk; kill power 148/148 + 26/26 holds — all four exits 0 ✓ |

### 2.3 In-flight notes (not counted as mismatches; for the integration owner)

1. **`corpus/README.md` is modified in the working tree (uncommitted, +4 lines)** and already names
   the capability in the present tense ("new ground; capability `chromium-ime-composition-linux` …
   Sourced and measured") while the SCORECARD row count is 0 and legs (b)/(d) are uncommitted. The
   measurement it cites is leg (a) and is real; but committing that line before legs (b)/(d) would
   be the first self-assessment mismatch of the round. `git diff corpus/README.md` → 4 insertions.
2. **r73's "Planned (r74)" pinch prior set is superseded** (`SCORECARD:3729` vs `claims.json:8`);
   disclosed by the lane, so not a contradiction — but the pinch capability remains withheld with
   QUALITY 138 still owed on that surface.
3. Receipt/source spot-checks that hold: the r74 knowledge note's line spans land —
   `input_method_controller.cc:1009` `SetComposition`, `:1032-1034` null-target return,
   `:694-704` `CommitText`→`ReplaceCompositionAndMoveCaret`/`InsertTextAndMoveCaret`, `:1084`
   `!DispatchCompositionStartEvent(GetFrame().SelectedText())`, `:924-925`
   `DispatchBeforeInputInsertText(GetDocument().FocusedElement(), …)`; `input_handler.cc:1345`
   "Either both replacement start/end are specified or neither."; `Input.pdl:141` and `:150`;
   `editing_utilities.cc:1772-1773` (`if (!target)` / `return DispatchEventResult::kNotCanceled;`,
   quote is the two-line join the note's span names). All seven staged files' sha256 equal both
   `sources/FETCH.txt` and the `SOURCES.md` S187–S193 cells.

## 3. Residuals (declared or newly found; none is a repeated root failure)

- **R1 (new, minor): duplicate JSON keys are not refused.** A receipt with `"predicate": false`
  followed by `"predicate": true` is read as `true` by Node, Python and jq alike (last-wins), so the
  counter exits **0** clean (`probe-r73-relabel.results.json` `duplicate_predicate_key`). This is
  not the r62 class — the counter has no disposition ledger to contradict and re-derives every law
  from `events` — but a malformed document is accepted. Suggest a duplicate-key rejection in the
  next generation.
- **R2 (carried, lane-disclosed): the pinch prior set.** `claims.json:20` prior set is PRE only;
  QUALITY 138 is vacuous here and I proved the relabel attack is refused, but the pinch surface's
  cross-generation prior set remains owed (`SCORECARD:3729`).
- **R3 (declared limit, accurate and tight):** the smallest escaping forgery is a whole 0.1 ms
  shift of at least one event time with all identifiers rewritten (`claims.json:42`); executed
  witnesses: 0.06 → refused (`event-time-quantum`), 0.1 → exit 0, one event at 0.05 → refused.
  The limit sentence is *true as written* — unlike r73's, which a relabel falsified.
- **R4 (design note):** one battery case (`negatives-imecompose-r74.mjs:171`,
  `compositionstart-selected-text` `selEnd = 3`) is effective only because the frozen fixture's
  selected text is `ab` at sel 2–4; the fixture is pinned in the driver, so this is a constant, not
  a receipt-dependent tolerance (r72's failure mode), and it repeated green on 9/9 receipts.
- **R5 (design note):** the counter reads the pinned driver **beside itself**
  (`check-imecompose-r74.mjs:38,149`) and only extracts the fixture template when the driver bytes
  equal the argv pin, so a swapped driver makes `fixture-hash` red rather than green.

## 4. Evidence chain (commands and exits)

```
sha256sum <6 instruments>                                  # = freeze.txt, 6/6
git diff --stat ca30e1a3 HEAD -- <6 instruments>           # empty, exit 0
git show b70e0a27:<4 instruments> | sha256sum              # = freeze.txt (pre-freeze bytes = frozen bytes)
jq .ufo/waves/round-74/controls/c1/prefreeze-summary.json   # receipts 9, ok 9, allOk true
jq .ufo/waves/round-74/controls/c1/controls-summary.json    # allOk true; 9 controls + 3 degenerates ok
jq .ufo/waves/round-74/scored/c1-counter-a.json             # clean, 148, findings []
cat  .ufo/waves/round-74/scored/c1-{counter,negatives,kill-power}-a.exit  # 0 0 0
jq .ufo/waves/round-74/scored/c1-negatives-a.json           # 239/239, gap [], isolated 140, laundered 3
jq .ufo/waves/round-74/scored/c1-kill-power-a.json          # holds, 148/148, 26/26, survivors []
node scripts/check-imecompose-r74.mjs --list-checks | jq length   # 148
git grep -l tabi-r74-l1-ca30e1a3b7b2 <commits ≤ D>          # no match before D
node .ufo/waves/round-74/w1/R74Revenger/probe-r73-relabel.mjs --work <scratch>   # exit 0; 9 probes
```

Probe outcomes (full JSON in `probe-r73-relabel.results.json` and
`probe-tolerance.results.json`):

| probe | exit | ids |
|---|---|---|
| `scored_receipt` (committed receipt) | 0 | — |
| `r73_relabelled_maximal` (r73 receipt, every identity + ids rewritten) | 1 | 93 ids (`plan-frozen`, `leg-order`, `event-types`, … ) |
| `r73_relabelled_four_fields` | 1 | 95 ids |
| `prior_full_rewrite_exact` | 1 | `replay-event-timeline` |
| `prior_full_rewrite_1e-12` | 1 | `replay-event-timeline` |
| `prior_shift_006` | 1 | `event-time-quantum` |
| `prior_one_event_005` | 1 | `event-time-quantum` |
| `prior_one_event_one_quantum` (0.1 ms) | 0 | — (declared limit) |
| `prior_shift_01` (all events) | 0 | — (declared limit) |
| `leg_relabel_earlier` / `leg_relabel_later` | 1 / 1 | `event-leg-window` first |
| `duplicate_predicate_key` | 0 | — (R1) |

## 5. Confidence

- **High** that no r60–r73 root failure is repeated by the committed r74 bytes: each row is a
  re-measured digest, a committed artifact field, or my own execution of the frozen counter.
- **High** that the r73 1e-12 escape is closed and the replacement limit is tight (three boundary
  probes on both sides).
- **Medium-high** on the prior-set item: the refusal of the relabelled r73 receipt is measured
  (93/95 ids), but the "no earlier generation exists" boundary is a property of the corpus today,
  not a structural guard — a future IME receipt generation must widen PRE (QUALITY 138).
- **Not verified here (out of seat):** legs (b) and (d) as committed claims; the wave's own seats'
  verdicts. `w1/R74Exec1/counter.json` and `R74Exec2/d1,d2` are clean 148 on the frozen pin with
  distinct nonces, which is consistent with leg (b) landing, but they are uncommitted at this tip.
- No tool installs; no host mutation; scratch removed.
