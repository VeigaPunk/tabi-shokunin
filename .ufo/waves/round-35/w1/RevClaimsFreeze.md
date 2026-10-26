# RevClaimsFreeze — round-35 freeze review (a4bfef0f75027c915e715649950b1d46dcb33d83)

**Verdict.** The freeze is sound on four of five checks and defective on one. All six `frozenDigests` values equal `git show a4bfef0f…:<path> | sha256sum`; `claims.json`, `SCORECARD.md` and `LOG.md` are byte-identical between worktree and freeze; the C1 predicate is one sentence consistently in claims.json, counter header, counter code, printed label, SCORECARD and LOG; the stagnation-nudge INACTIVE derivation is correct against AXES.md §The stagnation nudge and the SCORECARD.md:1612-1626 precedent; C1 sizing is clean (do-nothing cannot reach the target, every target clause is enumerated in code, axis named by the surface changed). **One defect: the frozen C2 counter enforces `admitted >= 14` while the frozen claim, SCORECARD and LOG all say 16** — a stale carry from round 32's target that also opens an unmeasured-rows hole; plus a lower-severity control-coverage gap that let it survive the pre-freeze pass, and two advisories. Findings only; no repairs made.

## Findings

### F1 — defect (high): C2 predicate threshold 14 in the counter vs 16 everywhere else
- `claims.json:162` — C2 predicate: "no entry finding AND no binding finding AND failing == 0 AND **admitted >= 16**"; `claims.json:163` — target "admitted **16** of the 16 matrix rows that have a BiDi command (R16 has none and must not be marked yes)".
- `SCORECARD.md:1941` — target cell "admitted **16** (every matrix row with a BiDi command), failing 0, binding null"; `LOG.md:2445-2446` — "target: all **16** matrix rows with a BiDi command held on Firefox".
- `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:54` — header "Predicate (frozen): … **admitted >= 14**"; `:77` — `const TARGET = 14;`; `:462` — `out.predicate = … && out.admitted >= TARGET;`; `:482` — the printed label `C2_FIREFOX_BIDI predicate=…` computes its boolean from the 14 rule and does not print the threshold.
- Concrete hole: `:449` marks a `no`-measured row unmeasured, `:460-461` count unmeasured rows as **not failing**, so with TARGET=14 the counter exits 0 (label `predicate=met`) with up to **2 of the 16 command rows unmeasured** — a reading `claims.json:163` forbids. At admitted 14–15 the counter prints `predicate=met` while the frozen claim predicate is false; the killRule's "first scripted measurement is the reading" gives no re-run to catch it.
- Origin: round 32's own declared target was `admitted >= 14` (`SCORECARD.md:1649`, a partial-coverage claim); round 35 upgraded the claim to all 16 and the counter constant was not updated. The pre-freeze instrument check demonstrates 16 is reachable (`baseline/c2-instrument-check.json`: both sessions R1–R15, R17 null, R16 `no-bidi-counterpart`, identical first-shot sha256 `7a3ae6a9b0d6…`) — the counter's 14 is the outlier.
- Prompt §9 (one predicate: same sentence, same code condition, same receipt label) is violated. Fix belongs to the counter owner **before any measurement**: `TARGET = 16` and header line 54 — which changes the frozen digest and must be a declared freeze amendment, not a silent edit.

### F2 — defect (low/medium): no frozen C2 control pins the threshold
- All five C2 controls have `admitted 0` (`claims.json:169-217`; `baseline/controls-summary.json`, 13/13 blocks match receipts). A `TARGET` mutation (14↔16, or any value ≤ 16) leaves every control's exit and predicate unchanged, so the stale 14 passed the pre-freeze control pass invisibly. A boundary control (e.g. 15 admitted + 1 unmeasured must exit 1 under the 16 rule) would have pinned it.

### F3 — advisory: the C2 capability row is a deliverable nothing enumerates
- `claims.json:158` types C2 "capability acquisition + coverage (sourced)" and `:159` lists "and a capability row." as a deliverable, but neither the claim nor the counter (which checks entry/receipt/live only) pins the row's operation text or reads the SCORECARD capabilities table. Under `AXES.md:57-64` (rows enter only through a demonstrated round) and `QUALITY.md:508-510` (84: a capability-table row names an **operation**, never a gate) the row is written at integration; the round-32 precedent (`SCORECARD.md:1663`, `:1679`) shows the intended shape. Risk: nothing frozen prevents a gate-shaped row entering the table at closure. Advisory to the L1.

### F4 — advisory (wording only): "minus the 67 round-34 candidates"
- `claims.json:33` says the candidate set is the BG-matching, tabi-free lines "minus the **67** round-34 candidates". The round-34 list has 67 rows (`wc -l` = 67) but only **22** intersect the derived universe (`priorCandidatesSkipped: 22` in `baseline/c1-J1-do-nothing.json`; operative rule is the counter's frozen definition, `c1-adjacency-sweep-v3.mjs:26-27`: "whose (lane, path, trimmed text) is not a round-34 candidate"). No numeric effect — 383 is consistent in `claims.json:33`, `SCORECARD.md:1940`, `LOG.md:2440` and every receipt — but the gloss reads as if 67 lines were subtracted from a 450-line universe.

## Verified clean (evidence)

1. **frozenDigests 6/6** — each value equals `git show a4bfef0f…:<path> | sha256sum` (exit 0): c1 counter `5707a937…`, c2 counter `7cc7f17f…`, controls.mjs `32c0f6bc…`, measure.sh `1fdbe8c4…`, check-adjacency.mjs `4e2c2a64…`, check-bidi-runtime.mjs `370e8e95…`.
2. **Frozen-state identity** — `claims.json` (`a2561c01…`), `SCORECARD.md`, `LOG.md` worktree bytes == freeze-commit bytes; all line citations apply to the frozen state.
3. **C1 predicate one-sentence rule** — `claims.json:36` == `c1-adjacency-sweep-v3.mjs:61-62` (header) == `:307` (code; `NEW_TARGET = 2` at `:80`) == label `:327` (`C1_ADJACENCY_SWEEP_V3 predicate=… adjacency=… unaccounted=… newMapped=…`) == `SCORECARD.md:1940` == `LOG.md:2443`.
4. **C1 controls** — programmatic compare of `claims.json` control blocks vs `baseline/controls-summary.json`: 13/13 match, 0 field diffs; receipts on disk agree (J1 unaccounted 383 exit 1; J2 screen-all unaccounted 0 / newMapped 0 exit 1 — screening alone cannot verify; J8 exit 0 is the disclosed residual forgery, attacked per `feasibilityDisclosed` + killRule, consistent with QUALITY 88/90/91/97).
5. **Candidate arithmetic** — 383 total; per-lane counts match `claims.json:33` exactly (kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1); `PINS` (`c1-adjacency-sweep-v3.mjs:85-105`) == `baseline/c1-pins.json` (20 lanes); ledger header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note` == counter `SCREEN_HEADER` (`:76`); screen reasons == SKILL.md:2861-2881 closed vocabulary.
6. **Stagnation nudge INACTIVE is right** — `AXES.md:66-73`: active iff every owned axis ≥ saturation line AND no capability entered within the window. Axes at round start 9/9/9/9/9/8 (`SCORECARD.md:1934-1935`), saturation 8 / window 3, window = rounds 32–34, and the round-32 capabilities-table row `webdriver-bidi-runtime` is an operation row (`SCORECARD.md:1663`, first-working 32; QUALITY 84). Precedent `SCORECARD.md:1612-1626`: rounds 29/30/31 corrections derived ACTIVE on the same rule when no entry was in-window. `claims.json` `lowestNonRetiredAxis` states the same derivation, and its round-36 prediction (first active if nothing enters at 35, window 33–35) checks. Lowest-axis obligation binds → C1 works adjacency.
7. **Claim sizing** — C1: every target clause enumerated in code (gate verdict `:307`, unaccounted over the enumerated candidate set `:233-238`, newMapped with n1–n4 `:273-303`); do-nothing J1 exit 1; axis adjacency named by the surface changed (map + new screen ledger). C2: do-nothing J1 exit 1; axis coverage named by the surface (second-engine runtime evidence); every target clause enumerated in code (entry x1–x4/s1 `:341-378`, receipt `:380-425`, UUID session/context checks, binding `:437-447`, admitted `:452-456`) **except the threshold (F1)**.
8. **C2 claim type** — allowed by `AXES.md:40-41` (capability acquisition with a per-axis verdict, type recorded in the round report); the sourced requirement is enumerated (s1-source, counter header `:29-34`, code `:347-377`); the pre-freeze instrument check satisfies AXES.md:62-64's demonstration rule.
9. **measure.sh vs measurementRule** — counters taken from the FREEZE commit via `git show` (`measure.sh:21-24`), digests recorded in provenance, clean clone with `rev-parse --show-toplevel` assert, TMPDIR under HYAKU_SCRATCH, r33/r34 no-harm counters, noharm gate list, numstat append-only check.
10. **C2 live-leg hygiene** — free `--websocket-port` (never 9222), HOME/TMPDIR/XDG_* scrubbed into scratch, `--profile-root` in scratch, headless, loopback fixture only (`c2-firefox-bidi.mjs:193-196`).

## Commands run (all exit 0 unless noted)
- Digest loop: `for spec in …; do git show "$F:$spec" | sha256sum; done` — 6/6 match.
- Byte identity: `sha256sum` worktree vs `git show $F:<file> | sha256sum` for claims.json, SCORECARD.md, LOG.md — SAME ×3.
- Control compare: node script joining `claims.json` controls with `controls-summary.json` — "ALL CONTROL BLOCKS MATCH".
- `wc -l` on both candidate TSVs (383, 67); per-lane `cut|sort|uniq -c` aggregation.
- `grep -n` line-number location for every citation above.
- Full transcript: `evidence.txt` in this directory.

## Deliverables
- Report: `tabi-shokunin/.ufo/waves/round-35/w1/RevClaimsFreeze.md` (this file)
- Evidence: `tabi-shokunin/.ufo/waves/round-35/w1/RevClaimsFreeze/evidence.txt`
- Scratch `/fast/scratch/hyaku/tabi-r35/RevClaimsFreeze` created empty and removed; no tool installed; no browser launched; no lane file edited.
