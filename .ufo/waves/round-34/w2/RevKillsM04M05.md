# RevKillsM04M05 — C2 kill cases for mutants M04 and M05

## Verdict

**Holds.** Both named self-test cases do their job. `v3-b-m04-transcript-path-repeated` kills M04 (transcript path distinctness) and `v3-b-m05-transcript-sha-repeated` kills M05 (transcript sha256 distinctness): with each mutant applied to the gate at `04f9623dde8ad35d470cecf766e421eafbcb47fa`, `node scripts/check-bidi-runtime.mjs --selftest` exits **3** with exactly one `CASE … FAIL` line — the case named for that mutant, no collateral failures — and the pristine gate passes all 56 cases (exit 0). Both cases test the gate's *behaviour on a built fixture* (never its source text), their expected values are the pristine gate's real outcome (identical to the pre-existing round-33 cases `v2-f3-same-path-twice` / `v2-f4-byte-copy` they pin), and their fixtures carry the sourced id shapes (S127 lower-case session id, S130/S131 upper-case context id). One **low-severity fragility defect** is recorded, shared by both cases: the `detailIncludes` pin couples each case to the exact wording of the gate's refusal message — a semantically equivalent rewording of the message breaks the case while the rule still refuses identically (demonstrated empirically for both). The coupling is the deliberate mechanism that distinguishes M04 from M05 (without it both survive, because sibling rules refuse the same fixtures with the same finding id `t1-receipt`), it is disclosed in the knowledge entry and the gate's own case comments, it cannot false-pass a mutant or false-fail a pristine gate, and the counter's neutral/decoy/twin probes are unaffected because the pin matches gate *output*, not gate *source*. A joint M05+M19 evasion is still caught by the case's exit/admitted expectations (the gate then admits the byte-copy receipt, exit 0 / admitted 16, and the case expects 1 / 0).

## Evidence

All commands run in the seat clone `/fast/scratch/hyaku/tabi-r34/RevKillsM04M05/clone` at `04f9623dde8ad35d470cecf766e421eafbcb47fa` (== lane HEAD; `diff -q` of the gate against the lane worktree: identical). Node v24.21.0. Gate file: `scripts/check-bidi-runtime.mjs` (line numbers at this rev).

### Setup and mutant provenance

- `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach 04f9623…` → `CLONE_HEAD=04f9623dde8ad35d470cecf766e421eafbcb47fa`, `LANE_HEAD=04f9623…`, `GATE_IDENTICAL`.
- Frozen counter bytes verified: sha256 of `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` == frozen digest `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82` (asserted in `apply-mutant.mjs`, which exits 2 on mismatch; it proceeded). Counter in clone byte-identical to the lane counter.
- M04/M05 find/replace pairs extracted from the counter's `MUTANTS` array and cross-checked **byte-identical** against `.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl` (20 lines, parses clean).
- Each find text occurs **exactly once** in the gate (asserted before every application: `find_occurrences=1`).

### (2) Pristine gate passes both cases

`TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → **exit 0**, `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56`, including:

```
CASE id=v3-b-m04-transcript-path-repeated expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt PASS
CASE id=v3-b-m05-transcript-sha-repeated  expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt PASS
```

Receipt: `pristine.log`.

### (1) M04 kill — `v3-b-m04-transcript-path-repeated` (gate :1051, build `{samePath: true}`)

`node apply-mutant.mjs M04` (gate bytes 79429 → 79342); `node scripts/check-bidi-runtime.mjs --selftest` → **exit 3**, `verdict=failed cases=56 passed=55`, the **only** FAIL line (log :48):

```
CASE id=v3-b-m04-transcript-path-repeated expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt FAIL
```

JSON (`m04-selftest.json`): under the mutant the same fixture is refused by the **sha** rule — `detail: "transcript sha256 repeated across runs (byte-identical copies)"` — which does not contain the case's pin `transcript path repeated across runs`; exit/admitted/reason still match (1 / 0 / t1-receipt). Mechanism: the mutant makes gate :797 `if (false) …`, so the `else if` at :798 fires instead. Without the detail pin M04 would survive (same finding id from the sibling rule) — exactly the equivalence the knowledge entry discloses.

### (1) M05 kill — `v3-b-m05-transcript-sha-repeated` (gate :1053, build `{sameBytes: true}`)

`node apply-mutant.mjs M05` (gate bytes 79429 → 79285); self-test → **exit 3**, `verdict=failed cases=56 passed=55`, the **only** FAIL line (log :49):

```
CASE id=v3-b-m05-transcript-sha-repeated expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt FAIL
```

JSON (`m05-selftest.json`): under the mutant the byte-identical transcripts fall through to the **sessionId** rule (gate :811) — `detail: "sessionId repeated across runs: e3a0ae31f5ca9591800dcbf63f70ae4f, e3a0ae31f5ca9591800dcbf63f70ae4f"` — which does not contain the pin `transcript sha256 repeated across runs`. The fixture keeps distinct paths (runner :1122 overrides the cite only for `samePath`), so the path rule is silent by design, as the case comment at :1052 says.

### (3) Rule-tested, not source-text; expectations pristine-real

- The runner builds a git fixture per case and calls the gate's `evaluate()` in process (:1084–1147); `pass` compares exit / admitted / reason / population / detail (:1164–1165). For these two cases the gate source is never inspected — `gateSource` (:1086) is read only to build the `driverCopyOfGate`/`gateBlob` fixtures of other cases.
- Expected values are the pristine gate's real outcome: the pristine self-test passes both cases, and the expectations are identical to the pre-existing round-33 cases `v2-f3-same-path-twice` (:1003) and `v2-f4-byte-copy` (:1004), which use the same `{samePath}` / `{sameBytes}` builds — the v3 cases add only the `detailIncludes` pin.

### (4) `detailIncludes` — gate runtime output, and demonstrated reword fragility (low defect)

- The pinned strings **are** the gate's runtime output for these rules: built at :797 (`transcript path repeated across runs: ${…}`) and :798 (`transcript sha256 repeated across runs (byte-identical copies)`), assigned to `row.detail` at :847, read by the runner as `firstDetail` (:1163) and matched with `.includes()` (:1164).
- Fragility **demonstrated** (behavior-preserving message reword, no mutant, pristine otherwise):
  - R1: `transcript path repeated across runs` → `transcript path cited twice across runs` → self-test **exit 3**, only `v3-b-m04-transcript-path-repeated` FAILs; JSON shows the rule still refuses (`exit=1`, `reason=t1-receipt`, `detail="transcript path cited twice across runs: corpus/evidence/round-32/bidi/run1/transcript.jsonl, …"`). Receipt: `reword-m04.log` / `reword-m04.json`.
  - R2: `transcript sha256 repeated across runs (byte-identical copies)` → `transcript sha256 cited twice across runs (byte-identical copies)` → self-test **exit 3**, only `v3-b-m05-transcript-sha-repeated` FAILs, rule still refuses (`exit=1`, `reason=t1-receipt`). Receipt: `reword-m05.log` / `reword-m05.json`.
- Severity: **low**. The pin is the intended WHICH-rule discriminator (knowledge entry §1 "pins the finding detail"; gate comments :1049–1050, :1052); a rewording only ever *adds* failures (never masks a mutant), the pristine gate passes, and the counter's neutral/decoy/twin probes are unaffected because the pin matches gate output, not gate bytes. A future message reword surfaces as a visible self-test failure, not a silent gap.
- Defense in depth (run, not inferred): applying **M05+M19 jointly** makes the gate admit the byte-copy receipt (`exit=0`, `admitted=16`, `reason=null`) and the `v3-b-m05` case still FAILs — on exit/admitted, not the pin (`m05m19-selftest.json`).

### (5) Sourced shapes vs S-rows

- Fixtures use `goldenLines` defaults (no id overrides in these two builds): `sessionId = sha256("tabi-bidi-v2-session:<seed>").slice(0,32)` — recomputed `e3a0ae31f5ca9591800dcbf63f70ae4f`, matches `/^[0-9a-f]{32}$/` (gate :145) and equals the sid printed in the M05-mutant detail; `contextId = sha256(…).toUpperCase().slice(0,32)` = `07182C94B0ABA3788ADDBD385808E7A9`, matches `/^[0-9A-F]{32}$/` (gate :146).
- Registry: S127 = ChromeDriver 154 `util.cc:39-43`, `%016" PRIx64 "%016" PRIx64` → 32 **lower-case** hex (`corpus/SOURCES.md:141`); S130 = `base/token.cc` `%016PRIX64`, `FromString` rejects lower case → 32 **UPPER-case** hex (`corpus/SOURCES.md:144`); S131 = mapper names the top-level browsingContext by the CDP `targetId` verbatim (`corpus/SOURCES.md:145`). The real round-32 transcript at the cited path agrees: `sessionId 10abbb479bdcc37a405098c5ea778bf0` (lower-case), `context 31B8FE9C25C36020CBB175F250715903` (upper-case).
- Scope note: in these two cases the path/sha finding fires *before* the id checks (gate :796 block precedes :800), so the sourced shapes are **carried** by the fixtures, not exercised by them — the shape rules themselves are exercised by the M06/M07/M08/M19 cases.

### Hygiene

- After every mutant/reword application the gate was restored (`git -C "$S/clone" checkout -q -- scripts/check-bidi-runtime.mjs`); `git status --porcelain` = 0 lines each time; final `RESTORED_DIRTY=0`.
- No tool installs or upgrades (none needed). No network fetches. No browser launches. No lane file edited; writes limited to the seat report, the seat output dir, and `$HYAKU_SCRATCH/tabi-r34/RevKillsM04M05/` (scratch deleted after receipt copy).

## Per-case verdicts

| case | mutant | kill (exit 3, own CASE FAIL, no collateral) | pristine pass | tests rule on fixture, pristine-real expectations | detail = gate output; reword fragility | sourced shapes |
|---|---|---|---|---|---|---|
| `v3-b-m04-transcript-path-repeated` | M04 | **yes** | yes | yes | yes — low fragility recorded (demonstrated R1) | carried, S127/S130/S131-conformant |
| `v3-b-m05-transcript-sha-repeated` | M05 | **yes** | yes | yes | yes — low fragility recorded (demonstrated R2) | carried, S127/S130/S131-conformant |

## Deliverables

- Report: `.ufo/waves/round-34/w2/RevKillsM04M05.md` (this file)
- Receipts: `.ufo/waves/round-34/w2/RevKillsM04M05/` — `pristine.log`, `m04-selftest.log`, `m04-selftest.json`, `m05-selftest.log`, `m05-selftest.json`, `reword-m04.log`, `reword-m04.json`, `reword-m05.log`, `reword-m05.json`, `m05m19-selftest.json`, `apply-mutant.mjs`
