# RevKillsM18M19 — C2 kill cases for M18/M19 (tabi round 34, wave w2)

Reviewed: `scripts/check-bidi-runtime.mjs` at lane commit `04f9623dde8ad35d470cecf766e421eafbcb47fa` (gate blob sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87`), mutants taken verbatim from the frozen counter `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (sha256 `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82` — equals `claims.json` frozenDigests).

## Verdict

**HOLDS — no defect.** Both assigned mutants are killed by the gate's own `--selftest` alone at the integration rev, each by exactly its named v3-b case and no other: M18 (`clean` guard `admitted >= 1` weakened to `>= 0`, rule site `scripts/check-bidi-runtime.mjs:867`) is killed by `v3-b-m18-clean-with-zero-admitted` (:1062), M19 (sessionId pairwise-distinctness finding dropped, rule site `:811`) is killed by `v3-b-m19-sessionid-repeated` (:1065); each mutant run exits 3 with exactly one `CASE ... FAIL` line naming that case. The pristine gate passes both cases (selftest exit 0, 56/56). Both cases are rule tests — they drive the gate's `evaluate()` on a synthesised fixture repo and compare runtime outputs (exit, admitted, population, reason, detail), never the gate's source text — and their expected values are the pristine gate's real computed outcomes, not tuned numbers: under M18 the only observable delta is exit 1→0 (admitted/reason/population unchanged), under M19 the only refusal for that fixture is the sessionId-distinctness finding (mutant flips exit 1→0 and admitted 0→16). The frozen counter run at the rev reads predicate true (killed 20/20, survivors 0, unappliable 0, twins all exit 0, pristine/neutral/decoy exit 0, round-33 battery predicate true, forgeries 0 of 8). One low-severity fragility is recorded (M19's `detailIncludes` couples the case to the gate's message wording); it is the disclosed v3 mechanism, is not load-bearing for the kill, and is not a blocker.

## Evidence

Scratch: `S=/fast/scratch/hyaku/tabi-r34/RevKillsM18M19`, `TMPDIR=$S/tmp`; one live clone `git clone --shared …/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` → HEAD `04f9623dde8ad35d470cecf766e421eafbcb47fa`; `git rev-parse --show-toplevel` asserted equal to the clone dir before every git mutation. Lane untouched: post-run `git -C "$C" status --porcelain | wc -l` → `0`. No tools installed (authorization unused), no network fetches, no browser launched.

### (1) Mutant applied → selftest exits 3 with THAT case failing

Mutants applied by `mut.mjs` (verbatim find/replace from the counter's MUTANTS array; refuses unless the find text occurs exactly once — both printed `occurrences=1`, matching the counter's own `occurrences: 1`):

- M18 → `node scripts/check-bidi-runtime.mjs --selftest` exit **3**, `verdict=failed cases=56 passed=55`, exactly one FAIL line:
  ```
  CASE id=v3-b-m18-clean-with-zero-admitted expected_exit=1 exit=0 expected_admitted=0 admitted=0 expected_population=16 population=16 expected_reason=- reason=- FAIL
  ```
- M19 → exit **3**, `verdict=failed cases=56 passed=55`, exactly one FAIL line:
  ```
  CASE id=v3-b-m19-sessionid-repeated expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=- population=16 expected_reason=t1-receipt reason=- FAIL
  ```

Both are kills by the frozen definition (exit 3 + a `CASE … FAIL` line, not a crash/timeout). The discriminating deltas are exactly the attacked rules: M18 leaves admitted/reason/population untouched and flips only `clean` (exit 1→0); M19 removes the fixture's only refusal (exit 1→0, admitted 0→16, reason t1-receipt→none).

### (2) Pristine gate passes both cases

`TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → exit **0**, `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56`, including:

```
CASE id=v3-b-m18-clean-with-zero-admitted expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=16 population=16 expected_reason=- reason=- PASS
CASE id=v3-b-m19-sessionid-repeated expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt PASS
```

Pristine `--selftest --json` rows (the gate's real outcomes the expectations were set from): v3-b-m18 `{exit:1, admitted:0, population:16, reason:null, detail:null}`; v3-b-m19 `{exit:1, admitted:0, population:16, reason:"t1-receipt", detail:"sessionId repeated across runs: 0f1e2d3c4b5a69788796a5b4c3d2e1f0, 0f1e2d3c4b5a69788796a5b4c3d2e1f0"}`.

### (3) Rule tests on fixtures, not source text; expectations are pristine outcomes

The harness (`runSelftest`, :1084-1180) builds a fixture git repo (registry, lessons, entry doc, transcripts, driver, receipt) and calls the gate's `evaluate()`; the pass computation at `:1162-1164` compares only `exit`, `admitted`, `reason`, `population` and `detailIncludes` — all runtime outputs of `evaluate()` on that fixture. The gate's own source is read once (`gateSource`, `:1086`) but used solely as fixture driver bytes for the byte-copy construction (`:1127`, `:1129`), never compared against rule text. Independent confirmation that the self-test is not keyed on its own bytes or on find-text presence: the counter's neutral-comment, decoy-comment and per-site whitespace-twin legs all exit 0 at this rev (`twinsFailing: []`, M18/M19 `twinExit: 0`). Expectation fidelity is empirical, not asserted: pristine 56/56 PASS shows every expectation equals the pristine gate's computed outcome, and each mutant run shows the case failing on precisely the attacked rule's observable (section 1). For M18 the case's `reason: null` + `detail: null` under pristine confirms nothing else refuses the fixture — the `admitted >= 1` conjunct at `:867` is the sole obstacle, so the case pins the clean-guard arithmetic exactly. For M19 the pristine detail names the sessionId finding as the only refusal, so the case pins that rule exactly.

### (4) `detailIncludes` provenance and fragility

- v3-b-m18: no `detailIncludes` — no message coupling.
- v3-b-m19: `detailIncludes: "sessionId repeated across runs"` is a strict prefix of the gate's runtime detail, built at `:811`: `` receiptFinding = `sessionId repeated across runs: ${sids.join(", ")}` `` — i.e. it is the gate's output for that rule, verified against the pristine `--json` detail above. **Fragility (low defect, recorded, non-blocking):** a semantically equivalent rewording of that message (e.g. "sessionId reused across runs") would flip the pristine self-test to exit 3 and thereby the counter's pristine leg to false — the case is coupled to the message's wording, not just its semantics. This is the disclosed v3 mechanism (harness comment `:1157-1160`: "a case may also pin WHICH check refused … The detail is gate output, never the gate's bytes"), and the kill itself does not depend on the pin: under M19 the case also fails on `exit` (0 vs 1) and `admitted` (16 vs 0), so the detail only guards *which* finding fired under pristine.

### (5) Sourced shapes vs S-rows (corpus/SOURCES.md at 04f9623)

- **v3-b-m19** exercises the S127 shape: its sessionId `0f1e2d3c4b5a69788796a5b4c3d2e1f0` is 32 lower-case hex, the shape S127 pins for ChromeDriver 154's classic session-id minting (SOURCES.md:141; gate header `:63-65` "32 lowercase hex"; enforced by `sessionOf` at `:382`). The case comment (:1063-1064) cites S127. ✓
- **v3-b-m18** exercises no id shape (all-Measured-"no" cell override on the golden fixture); it makes no S-row claim. ✓
- Fixture substrate consistency: `goldenLines` defaults mint the sessionId as lower-case hex (`:880`, S127) and the contextId as 32 UPPER-case hex (`:881`, S130's `%016PRIX64` shape, SOURCES.md:144; S131 SOURCES.md:145 — mapper uses `targetInfo.targetId` verbatim). The context-id shape refusals themselves are seat A's cases (v3-a-m08), out of my scope.

### Frozen counter cross-check

`TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo "$S/clone" --json` → exit **0**: `{predicate: true, killedCount: 20, survivors: [], unappliable: [], twinsFailing: [], pristine.exit: 0, neutral.exit: 0, decoy.exit: 0, battery: {predicate: true, forgeriesAccepted: 0, honest: {H0,H1,H2: true}}}`; M18 row `{occurrences: 1, twinExit: 0, exit: 3, failingCases: ["v3-b-m18-clean-with-zero-admitted"], killed: true}`; M19 row `{occurrences: 1, twinExit: 0, exit: 3, failingCases: ["v3-b-m19-sessionid-repeated"], killed: true}` — identical to my manual runs.

## Per-case verdicts

| Case | Mutant | Pristine | Mutant run | Rule-vs-text | Expectations | S-row | Verdict |
|---|---|---|---|---|---|---|---|
| `v3-b-m18-clean-with-zero-admitted` (:1062) | M18 (:867) | PASS (exit 0 selftest) | exit 3, that case FAILs (exit 0 vs 1) | rule test on fixture | real pristine outcome (exit 1, admitted 0, pop 16, reason null) | none claimed | **holds** |
| `v3-b-m19-sessionid-repeated` (:1065) | M19 (:811) | PASS (exit 0 selftest) | exit 3, that case FAILs (exit 0 vs 1, admitted 16 vs 0) | rule test on fixture | real pristine outcome (exit 1, t1-receipt, detail = :811 message) | S127 ✓ (:141) | **holds**; low-severity wording fragility recorded |

## Residual risk / notes

- M19 `detailIncludes` wording coupling (low, above): a future semantically-equivalent message rewording would fail the pristine self-test; the fix would be loosening the pin, but as landed it is the disclosed design and non-load-bearing for the kill.
- Counter's disclosed residual (self-test sniffing its own source with whitespace-normalised find text) is refused by the wave-2 code read, not the counter; for these two cases the harness never compares source text and neutral/decoy/twin legs pass, so no such construction is present at these sites.
- No lane file was edited; the scratch clone was restored clean after each mutant; scratch dir deleted after receipts were copied.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM18M19.md` (this file)
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM18M19/` — `pristine.txt`, `pristine.json`, `m18.txt`, `m19.txt`, `counter.json`, `counter.err`, `mut.mjs`
