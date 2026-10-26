# CritC2Axis — C2 axis/separability falsifier (tabi round 33, w1)

## Verdict

C2 is **operability, and the label holds** — not calibration or depth relabelled — but the frozen after-state verifies less than the round's routed defect claims, and it verifies nothing about the live leg that the lane's one BiDi capability rests on. Grounds for the axis: gate v1's own stated outcome is "0 clean" when the population is "every one admitted" (`scripts/check-bidi-runtime.mjs:5-9` at `e6b0a90`), and at the baseline it prints that clean verdict for a receipt whose transcripts were never produced by a browser (`c2-J1-do-nothing.json`: `forgeriesAccepted 8/8`, `honest.H0/H1/H2 true`). A runnable checklist that produces a false stated outcome is exactly `AXES.md`'s operability failure ("A checklist item can be run and produces the stated outcome"); item 9 of the prompt ("name the axis by the surface the round changes, not by the number it produces") points at the gate, and the lane had already assigned this move to operability a round before the claim (`SCORECARD.md:1689` "planned: operability — gate v2 for `check-bidi-runtime.mjs`"). Calibration is ruled out as an alternative by the prompt's own definition (a calibration claim "must count mismatches between the lane's self-assessment … and observed repo state"; C2 counts none), and depth would need the move to land in the skill's decision tables rather than in a gate's exit code. The counter is a genuine falsifier: the do-nothing control is the lane itself at the baseline and scores `predicate false` with `forgeriesAccepted 8`, and the two degenerate controls die on *different* clauses (reject-all: `honest` all false; whitelist: `digestLiterals` 5 and `selftest` exit 3). I reproduced the do-nothing reading independently at the freeze. The two claims are causally separable in both directions (three tests below). Two medium defects remain: **D1** the headline forgery F1 tests a placeholder session id, not a spliced screenshot, so "splice detection" is not in the after-state; **D2** the `--live` leg is outside the predicate *and* the frozen no-harm sweep, so v2 can break the round-32 capability silently. The "sourced" label is earned only if S127 grounds the session-id-shape rule that actually refuses F1; S128/S129 ground launch flags that no frozen instrument exercises, and no frozen gate checks the note's grounding at all.

## The four questions, answered from local evidence

1. **Operability or relabelled calibration/depth?** Holds as operability. Strongest counterexample found, and rejected: round 32's own axes row read operability as "no claim; 18 self-tests and 6 gates green at `08086884`" while that same gate admitted the 8 forgeries — i.e. the lane's r32 witness for operability was *greenness*, not *soundness*. Under a greenness-only reading, C2's soundness delta would be calibration machinery. Rejected because the lane's established operability witness is a **behaviour count**, not an exit code: `SCORECARD.md:831` ("six finite hazards 0→6"), `:787` ("behaviour-bearing gate entries 0→4"), `:883` ("finite artifact-root / current-nonce properties 0→2"), `:1400` ("improved in substance, scalar held"). C2 is that shape. Cost of the label: see D4.
2. **Is the battery a counter a do-nothing control cannot reach?** Yes. `baseline/c2-J1-do-nothing.json` is the lane at `b7d16fb8` (provenance: `rev=b7d16fb8… tree=c7999ee… repo=lane`) and reads `forgeriesAccepted 8`, `digestLiterals []`, `selftest 0`, `predicate false`, exit 1. The control files carry the frozen counter digest (`counter_sha256=51ace65f…e812b`, equal to `claims.json.frozenDigests`) so the controls were scored with the frozen bytes. I re-ran the frozen battery at the freeze revision myself and got the identical reading (below).
3. **Is C2 verifiable without C1, and C1 without C2?** Yes, empirically, three ways (below): C2's reading is invariant to C1's ledger landing; C1's reading is invariant to C2's gate bytes *and* to a gate whose behaviour is flipped to exit 1. Neither counter reads the other's surface (C2 reads only `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, `corpus/evidence/round-32/bidi*`, `corpus/SOURCES.md`, `scripts/check-bidi-runtime.mjs`, and `.ufo/waves/round-32/w2/RerunDriver/bidi-run` — counter:60-62,148-149,191,169; C1 reads `corpus/adjacency.tsv`, `corpus/adjacency-screen.tsv`, `scripts/check-adjacency.mjs` and sibling pins — c1 counter:6-8,26-31).
4. **Is "sourced" earned if S127-S129 ground only session shape and live-leg flags?** Narrowly yes, and *only* because the session-shape rule is the one that carries F1: golden transcripts hardcode `sessionId:"X"` and `ws://127.0.0.1:9515/session/X` (`scripts/check-bidi-runtime.mjs:628`; `goldenLines` takes `base, version, mutate, shotTag, driverVersion` only — no id parameter, :590), while the honest runs carry 32-hex ids (`10abbb47…`, `6b30c703…`). So F1 is refusable by an id/port-shape rule, which S127 must ground; the sink/transcript-distinctness rules (F2-F6), the cell-parse rule (F7) and the source-row rule (F8) are lane-internal reasoning that no row grounds. The label is unverified by the counter: the predicate (claims.json:45, counter:229) has no note term, and `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` cannot exist at the freeze (SOURCES max row is S126 at `e6b0a90`). The only frozen check on sourcing is row existence plus used-by citation (`scripts/check-sources.mjs:232,339`), never that the quote supports the rule.

## Findings

**D1 — medium — F1's discriminator is the placeholder id, not the splice; "splice detection" is not in the after-state.** The routed defect the lane is closing names five elements, two of which are "splice detection" and "one self-test case per w1 MutC1 survivor (9/20)" (`corpus/lessons/round-32-verifier-spotcheck.md:148`; `SCORECARD.md:1689-1690`). The frozen predicate verifies neither: it counts `--selftest` exit 0 (already 0 at v1) and it accepts *any* refusal reason. F1 is built as two `goldenLines()` transcripts with the honest first screenshot spliced in (counter:169-172) — but those transcripts can never change their id: golden lines 48, `sessionId "X"`, ws port 9515, against honest 71 lines, 32-hex id, real port (`golden-vs-honest.txt`). v1's `t3-binding` already accepts the spliced bytes (`:47-53`, `:545-553`), so v2 can reach `forgeriesAccepted 0` with a session-id/line-count tell and leave the round-32 splice hole exactly open. This is disclosed as a finite-battery limit ("a golden transcript with real-shaped session ids and distinct bases", claims.json C2.feasibilityDisclosed), so it is not a false claim — it is a credit problem: the C2 SCORECARD row must not claim splice detection, and wave 2 must run F1′ (32-hex id, 71-line shape, real user-data-dir string, distinct bases) and report the survivor.
*Smallest safe correction:* C2's row wording (`forgeries refused 8/8 by provenance/format checks; splice detection unverified at v2; F1′ survives/refused as measured`), one wave-2 seat on the 32-hex splice, no predicate change.

**D2 — medium — the `--live` leg is in neither the predicate nor the frozen no-harm sweep.** v2 changes live launch flags by construction (drop `--no-sandbox`, bypass the launcher flags file, per S128/S129). The predicate is offline by construction and the killRule says so (claims.json:50); the frozen no-harm sweep runs the gate without `--live` (`baseline/measure-at-baseline/noharm-at-b7d16fb.txt:7`: `… live=false`), and only the self-test (line 14). So a v2 whose live leg cannot start a browser would pass C2's predicate, pass every frozen no-harm gate, and silently falsify the round-32 capability row `webdriver-bidi-runtime` (its evidence pointer is the `--live` invocation). The wave-1 live-leg probe seat produces prose, not a receipt.
*Smallest safe correction:* at REV commit one `--live` receipt (`node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json`, exit 0, `admitted 16`) under `.ufo/waves/round-33/measure/` and require the closure to re-derive it. claims.json already files live changes as "no-harm evidence only"; this makes that evidence a receipt instead of a report paragraph. No frozen bytes change.

**D3 — low — the note's grounding is outside every frozen instrument.** The counter's read set (counter:60-62,148-149,191) contains no note path, and the predicate (counter:229) has no term for S127-S129 or for the note. Row *existence* is gated, row *use* is gated by `used-by` citation (`check-sources.mjs:232,339`), but S128/S129's subject (launch flags) is exercised by nothing (see D2), so citing them for the live-leg rationale is unaudited prose.
*Smallest safe correction:* the C2 report quotes S127's located sentence beside v2's id rule and states S128/S129's role as live-leg only; the note must not cite S128/S129 for the id rule.

**D4 — low — r33's C2 row and r32's operability reading cannot both stand unqualified.** At `08086884` the same gate accepted the 8 forgeries and r32 recorded operability "unchanged" (`SCORECARD.md` r32 axes row). C2's premise is that this acceptance is an operability defect. One of the two readings is wrong; the honest version is that r32's operability witness was greenness while the gate was unsound.
*Smallest safe correction:* the r33 C2 row says so in one clause ("carried r32 defect: the same gate admitted these 8 forgeries at 08086884; r32's operability witness was exit codes, not soundness"), and the mined mistake section may use it.

**D5 — note, not a defect — the digest-literal guard is scoped to five digests.** `digestLiterals` filters `HONEST_DIGESTS` only (counter:222), so any other 64-hex literal is legal gate source; the J3 control itself embeds the entry and registry shas as 64-hex literals and is caught only via the four transcript digests and the driver digest. This does not reach the target (a whitelist of unrelated blobs refuses none of F1-F8), and the size/encoding escape is disclosed. Recording it so the closure does not read `digestLiterals []` as "no whitelist of any kind".

**Premature saturation — not a defect, a wording constraint.** Operability is 9 at round start against saturation 8 (`claims.json.axisScoresAtRoundStart`), and the lane's own ceiling for 9 is unmet (`SCORECARD.md:811`: "operability 9 needs USER green or an L0 out-of-scope ruling, a non-author run of the gates at the landed tip, and a new runnable rung"). C2 supplies a hardened runnable rung and no USER green, so the row must read "improved in substance, scalar held" (precedent `SCORECARD.md:1400`) and must not imply 9→10.

## Evidence (commands and exit codes)

Setup, in scratch only (`HYAKU_SCRATCH=/fast/scratch/hyaku`, `TMPDIR=$HYAKU_SCRATCH/tabi-r33/CritC2Axis/tmp`):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone      # exit 0
git -C $S/clone checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea # exit 0
git -C $S/clone rev-parse --show-toplevel                                    # == $S/clone
git -C $S/clone rev-parse HEAD                                               # e6b0a90…
sha256sum .ufo/waves/round-33/counters/*.mjs
  # da59d157…c6380 (c1) and 51ace65f…e812b (c2) == claims.json.frozenDigests
git diff --stat b7d16fb8 e6b0a90 | tail -1   # 29 files, 945 insertions, all under .ufo/waves/round-33/
```

Do-nothing reproduction and baseline readings:

```
node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
  --rev e6b0a90… --repo $S/clone --json          # exit 1
  → predicate false, honest {H0:true,H1:true,H2:true}, forgeriesAccepted 8,
    digestLiterals [], selftest {exit:0,"cases=27 passed=27"}, stderr 0 B
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
  --rev e6b0a90… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json  # exit 1
  → predicate false, candidates 52, mapped 5, screened 0, unaccounted 47,
    newMapped 0, adjacency clean
```

Identical to `baseline/c2-J1-do-nothing.json` (rev `b7d16fb8`, `forgeriesAccepted 8`) and `baseline/measure-at-baseline/c*-at-b7d16fb.json`. Controls: `c2-J2-reject-all` → honest all false, forgeries 0, exit 1; `c2-J3-whitelist` → honest true, forgeries 0, `digestLiterals` `["8aa97463c238","9918a716da71","92bd413caab0","b9dab912f0af","55dbef88ed4b"]`, `selftest 3`, exit 1 (`baseline/controls-summary.json`).

Separability, both directions, in a throwaway clone of the freeze:

```
# R1 = 77a12204… : corpus/adjacency-screen.tsv header added (C1 surface only)
node …/c2-bidi-forgery-battery.mjs --rev 77a12204… --repo $D --json   # exit 1
  → identical: honest all true, forgeriesAccepted 8, digestLiterals [], selftest 0
# R2 = 9dc7326e… : scripts/check-bidi-runtime.mjs byte-changed (C2 surface only)
node …/c1-adjacency-sweep.mjs --rev 9dc7326e… --repo $D --fleet … --json  # exit 1
  → identical: 52/5/0/47/0, adjacency clean
# R3 = 175fa472… : gate behaviour flipped so evaluation exits 1
node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6… --entry …   # gate exit 1
node …/c1-adjacency-sweep.mjs --rev 175fa472… --repo $D --fleet … --json  # exit 1
  → still 52/5/0/47/0, adjacency clean
```

F1's discriminator (D1), measured from the gate's own generator:

```
golden-vs-honest.txt
  golden lines 48  sessionId "X"  ws ws://127.0.0.1:9515/session/X
  honest lines 71  sessionId 10abbb479bdcc37a405098c5ea778bf0  ws …/session/10abbb…
  golden methods 15, honest methods 15
```

cited against `scripts/check-bidi-runtime.mjs:628` (hardcoded `sessionId: "X"`), `:590` (parameter list has no id), `:545-553` (`t3-binding` compares screenshot bytes only), and F1's builder (`c2-bidi-forgery-battery.mjs:169-172`).

Live-leg gap (D2): `baseline/measure-at-baseline/noharm-at-b7d16fb.txt:7` — `… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md :: exit=0 :: … live=false`; `claims.json:50` — "The --live leg is not part of this predicate … reported as no-harm evidence only"; `SCORECARD.md:1675` — the r32 capability's evidence pointer is the `--live` invocation.

Sourcing (D3/D4): `git show e6b0a90:corpus/SOURCES.md | grep -o '^| S1[0-9][0-9] ' | tail -3` → `S124 S125 S126` (no S127+ at the freeze); `c2-bidi-forgery-battery.mjs:229` (predicate, no note term), `:60-62,148-149,191` (read set); `scripts/check-sources.mjs:232,339` (used-by citation only).

No browser was started for this review. `pgrep -fa 'chromedriver|chromium'` returns one line, `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` — the host's oom killer matching its own pattern string, not a browser I started. The scratch dir `/fast/scratch/hyaku/tabi-r33/CritC2Axis` is removed; the lane worktree shows only untracked wave files.

## Deliverable paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/CritC2Axis.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/CritC2Axis/` — `c2-at-freeze.json`, `c1-at-freeze.json`, `c2-with-c1-screen.json`, `c1-with-c2-gate.json`, `c1-with-broken-gate.json` (+ `.stderr` where non-empty: all 0 B), `golden-vs-honest.txt`
