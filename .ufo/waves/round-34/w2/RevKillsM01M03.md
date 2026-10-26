# RevKillsM01M03 — C2 kill cases for mutants M01 and M03 (round 34 w2, FALSIFY)

## Verdict

**HOLDS — no defect found in scope.** Both seat cases kill their mutants by the self-test alone, exactly as the C2 predicate requires. `v3-a-m01-duplicate-id-twice` is the only failing case when M01 (`else if ((idCounts.get(id) || 0) > 1)` → `> 2`) is applied to the gate at the wave-1 integration commit 04f9623dde8ad35d470cecf766e421eafbcb47fa, and `v3-a-m03-measured-cell-uppercase` is the only failing case when M03 (`return { verdict: m[1].toLowerCase(), … }` → `return { verdict: m[1], … }`) is applied; each run exits 3 with `BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55`. The pristine gate passes all 56 cases (exit 0). Both cases test the gate's runnable behaviour on a fixture repository (never its own source text), their expected values are the pristine gate's real outcomes (empirically re-confirmed, not tuned), neither uses `detailIncludes` so the message-rewording fragility question is moot for them (they pin stable finding ids and counts, not prose), and neither case claims a sourced id shape — the S127/S130/S131 shape rows belong to the M06/M08 cases and are present and consistent in SOURCES.md at the integration commit. Residual risk recorded below is limited and disclosed, not a defect.

## Mutants under test (frozen counter `.ufo/waves/round-34/counters/c2-gate-mutants.mjs`, MUTANTS array)

- **M01** — area `x3-duplicate-id threshold`; find `else if ((idCounts.get(id) || 0) > 1)`, replace `else if ((idCounts.get(id) || 0) > 2)`. Gate rule site: `scripts/check-bidi-runtime.mjs:843` (rule documented in the gate header at line 78: "x3-duplicate-id — the id occurs more than once in the entry table").
- **M03** — area `x4-measured-cell verdict case folding`; find `return { verdict: m[1].toLowerCase(), measured: true, detail: null };`, replace `return { verdict: m[1], measured: true, detail: null };`. Gate rule site: `scripts/check-bidi-runtime.mjs:373` inside `measuredVerdict()` (regex `const MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i;` at line 149).

Both find texts occur **exactly once** in the gate blob at the pinned commit (`grep -cF` → 1 each), so each mutant is appliable, matching the counter's precondition.

## Evidence — commands run and exit codes

Scratch clone (one live clone, per contract): `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa`; `git rev-parse HEAD` → `04f9623dde8ad35d470cecf766e421eafbcb47fa`; `git rev-parse --show-toplevel` → the clone dir. `TMPDIR` pointed at `$S` throughout. Mutants applied/reverted with exact find/replace pairs via the edit tool; no rule line was reworded.

1. **Pristine gate** — `cd "$S/clone" && TMPDIR="$S" node scripts/check-bidi-runtime.mjs --selftest` → **exit 0**, `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` (receipt `pristine.txt`, re-run `pristine-final.txt`, byte-identical, sha256 `4fe344f5…`).
2. **M01 applied** → self-test **exit 3**, exactly one FAIL line (receipts `m01.txt`, `m01-rerun.txt`, byte-identical, sha256 `051e6636…`):
   ```
   CASE id=v3-a-m01-duplicate-id-twice expected_exit=1 exit=0 expected_admitted=0 admitted=2 expected_population=2 population=2 expected_reason=x3-duplicate-id reason=- FAIL
   BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
   ```
   The other 55 cases still pass — the kill is precise (no collateral failure), and the failing case is the one assigned to M01.
3. **M01 reverted, M03 applied** → self-test **exit 3**, exactly one FAIL line (receipts `m03.txt`, `m03-rerun.txt`, byte-identical, sha256 `0f052055…`):
   ```
   CASE id=v3-a-m03-measured-cell-uppercase expected_exit=0 exit=1 expected_admitted=2 admitted=0 expected_population=2 population=2 expected_reason=- reason=- FAIL
   BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
   ```
4. **M03 reverted** → pristine re-run **exit 0**, 56/56; `git -C "$S/clone" status --porcelain` → empty; worktree file sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` equals `git show HEAD:scripts/check-bidi-runtime.mjs` — the gate is byte-identical to the integrated blob after all applications/reverts (rule lines untouched).

## Per-case review (item by item)

### `v3-a-m01-duplicate-id-twice` (CASES line 1027) — verdict: **holds**

- **(1) Kills M01:** yes — exit 3, the quoted FAIL line above. Under the mutant the fixture's two rows (`ids: ["R2","R2"]`) are both admitted (`exit=0 admitted=2`), so the case fails on exit, admitted and reason simultaneously.
- **(2) Pristine passes it:** yes — pristine run line: `CASE id=v3-a-m01-duplicate-id-twice expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=2 population=2 expected_reason=x3-duplicate-id reason=x3-duplicate-id PASS`.
- **(3) Tests the rule, not source text:** yes. `runSelftest()` (lines 1084–1186) builds a real fixture git repo per case (`makeFixture()`, git init + SOURCES.md + lessons + entry doc + two golden transcripts + receipt + driver), commits it, and calls the gate's own `evaluate()` on it; the pass condition (lines ~1150–1156) compares only runtime outputs (`exit`, `admitted`, `reason`, `population`, `detailIncludes`). The only source read in the self-test is `gateSource` (line 1086), used as fixture *data* for the unrelated v2-f5 gate-copy case — not a self-check, and not used by this case. The case's expectations match the gate's documented rule semantics: header line 78 says the id "occurs more than once" is a finding, and line 843 implements `> 1`; the case comment ("an id listed exactly TWICE is a finding on both rows, not an admitted pair") says the same.
- **Expected values real, not tuned:** the pristine gate's actual output on this fixture equals every expected field (verified in the pristine PASS line), and the mutant's observed deviation is exactly its semantic effect (threshold 3 admits a twice-listed id). Nothing in the case is fitted to the mutant's behaviour.
- **(4) `detailIncludes`:** not used by this case. It pins `reason: "x3-duplicate-id"` — a stable finding id documented in the gate header (line 78), not prose. A semantically equivalent rewording of the detail message (`${id} appears ${idCounts.get(id)} times`, line 843) would **not** break this case. Fragility: none beyond the finding id itself (renaming that identifier is a semantic change, not a rewording).
- **(5) Sourced shape:** no id shape is exercised (threshold rule on entry-table ids R1–R17, which are ROWS keys, not BiDi session/context ids). No S-row claimed; none needed. The C2 sourcing requirement targets id-shape kill cases; this is a threshold case.

### `v3-a-m03-measured-cell-uppercase` (CASES line 1031) — verdict: **holds**

- **(1) Kills M03:** yes — exit 3, the quoted FAIL line above. Failure mode verified against the gate's row loop (lines 852–870): with the mutant, cell `Yes` parses as `verdict: "Yes"`, `measured: true`; the row is not x4 (measured), not x1/x3/x2, not `verdict === "no"`, passes the golden predicates, so `reason` stays null but `row.admitted = row.reason === null && row.verdict === "yes" && mv.measured` (line 869) is false because `"Yes" !== "yes"` → `admitted=0`, `failing=0`, `population=2` → `out.clean` false (line 872 requires `admitted >= 1`) → exit 1, reason `-`. Exactly the observed FAIL line, and exactly the case comment's prediction ("the mutant reads it as neither yes nor no, leaving population without an admitted row").
- **(2) Pristine passes it:** yes — pristine run line: `CASE id=v3-a-m03-measured-cell-uppercase expected_exit=0 exit=0 expected_admitted=2 admitted=2 expected_population=2 population=2 expected_reason=- reason=- PASS`.
- **(3) Tests the rule, not source text:** yes — same fixture + `evaluate()` mechanism as above; the case builds a fixture whose every Measured cell is `Yes` (`cell: () => "Yes"`) and expects the pristine gate's real outcome (case-folded verdicts, both rows admitted, exit 0). Expectations equal pristine behaviour (verified), not mutant-fitted values.
- **(4) `detailIncludes`:** not used by this case. It pins exit/admitted/population and `reason=null` — no gate message text at all, so no rewording of any message can break it. Fragility: none.
- **(5) Sourced shape:** no id shape exercised; no S-row claimed; none needed.

## Sourcing cross-check (item 5, recorded for the wave)

`corpus/SOURCES.md` at the integration commit: S127 at line 141 (ChromeDriver 154 session-id minting, 32 **lower-case** hex, util.cc:39-43), S130 at line 144 (DevTools target-id textual shape, 32 **UPPER-case** hex via `%016PRIX64`, `Token::FromString` rejects lower case), S131 at line 145 (chromium-bidi mapper names a top-level browsingContext with the CDP `targetId` verbatim). These are the rows behind the M06/M08 shape cases (seat-mates' scope); the M01/M03 cases make no shape claim, so there is nothing in my scope that could mismatch an S-row. No defect.

## Residual risk (disclosed, not a defect)

- The M01 case pins the finding id `x3-duplicate-id`; a future rename of that identifier would break the case — but that is a semantic identifier change, not a message rewording, and the counter's decoy/twin probes plus the wave-2 code read own the source-sniffing construction. The frozen counter itself discloses the same residual ("a self-test that reads its own source and checks a whitespace-normalised find text is not refused by these probes").
- Each mutant is killed by exactly one case (55/56 pass under each mutant). That is precision, not fragility — but it means the kill depends on those specific cases staying in CASES; deleting the case would resurrect the survivor, which the counter would catch as predicate false.

## Tooling

No tools installed or upgraded (operator authorization of 2026-10-19 not exercised). No network fetches. No browser launched.

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM01M03.md` (this file)
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM01M03/pristine.txt`, `pristine-final.txt`, `m01.txt`, `m01-rerun.txt`, `m03.txt`, `m03-rerun.txt` (self-test stdout; sha256 of each pair above; reruns byte-identical to first runs)
- Scratch `$HYAKU_SCRATCH/tabi-r34/RevKillsM01M03` (clone + run outputs) deleted before yield; receipts copied out first.
