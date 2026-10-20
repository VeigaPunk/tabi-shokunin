# AttackMeasureC1 — round-15 C1 (USER reason/applicability diagnostics) falsification

Author-side source reading only. No gate, measure, selftest, counter, browser, or test was executed. No commits, no source edits, no installs. Non-author certification is not claimed.

## Attacked bytes

- Measured/delivered revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD; `build-snapshot.json` revision matches).
- Gate `scripts/check-user-round-contract.mjs`: HEAD blob and worktree both sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (matches snapshot). Last C1 gate commit `c138bea`.
- Probe `.ufo/waves/round-15/measure.mjs`: HEAD and worktree sha256 `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` (matches snapshot). Committed in `72dcf03`.
- Worktree is not clean (`M SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`; untracked `corpus/lessons/round-15.md`, `corpus/evidence/round-15/{source-index,misroot-recovery}.json`, `.ufo/waves/round-15/w2/`). None of the attacked C1 bytes are dirty.

## Temporal limit (not a defect, a fact)

- `corpus/evidence/round-15/user-diagnostics.json` (the C1 receipt named at `measure.mjs:149`) is absent at HEAD and in the worktree. At `72dcf03`, `countC1` returns `count=0, present=false` via the missing-receipt branch (`measure.mjs:632-636`). No C1 success exists at the delivered bytes.
- `corpus/lessons/round-15.md` is untracked. Its line 36 and line 48 describe "actual receipts below" that do not exist. Any C1 success claim in the lesson/LOG/SCORECARD is therefore unevidenced at this revision.
- The gate's own selftest output has never been captured as a committed receipt. The attacks below are therefore against the code and the contract text, not against a measured transcript.

## Findings (ordered by severity)

### F1 — High: criterion 3 "expected_finding equals a shipped finding token" is not enforced, and the finding-agreement branch is dead for shipped output

- Probe: `measure.mjs:697-701` only checks that `expected_finding` is non-empty, and compares against a `finding=` token (`entry.finding`). `selftestCases` reads `finding` from `tokens.get('finding')` (`measure.mjs:301`).
- Gate: every SELFTEST line emitted at `check-user-round-contract.mjs:1222`, `1252`, `1265`, `1273`, `1282` carries `expected_finding=` and `actual_exit=`, never a bare `finding=`. `tokensOf` keys on the full identifier, so `expected_finding` does not satisfy `finding`. `entry.finding` is always `null` for shipped lines, so the mismatch check never fires.
- Result: a line `SELFTEST name=x expected_exit=1 actual_exit=1 expected_finding=anything_at_all result=PASS` counts as a passing case. The spec says the expected finding must be a shipped token; the probe has no token list.
- Bounded correction: add `actual_finding=${observed.finding}` to the gate case line and compare `expected_finding` to it in the probe; or have the probe hold the closed finding vocabulary (the gate's `fail(...)` finding ids plus `clean`) and reject any other `expected_finding`.

### F2 — High (detector gap): criterion 2 shell detection is bypassable by comment-prefixed lines and path-qualified or `exec*` forms

- `codeOnly` (`measure.mjs:520-527`) drops every line whose trimmed text starts with `//`, `*` or `/*`. A line `/* note */ spawnSync('sh', ['-c', x])` or a continuation line `*/ spawnSync('sh', …)` is removed before `SHELL_CALL` / `SHELL_TRUE` run (`measure.mjs:655-660`). `analyzeRunCount` inherits the same stripping (`measure.mjs:529-531`).
- `SHELL_CALL` (`measure.mjs:176`) only matches a bare quoted name `bash|sh|zsh|dash|fish|ksh` as the first argument. Not matched: `spawnSync('/bin/sh', …)`, `spawnSync('/usr/bin/env', ['sh', …])`, `execSync('sh -c …')` (execSync takes one shell string and never needs a literal `sh` first argument), `execFileSync(variable)`.
- `functionBody` (`measure.mjs:495-518`) ends the runCount body at the first column-zero `}`. A column-zero `}` inside a template literal in runCount truncates the analyzed body, hiding the rest from `analyzeRunCount`.
- Current gate source: `grep` over `scripts/check-user-round-contract.mjs` shows only `spawnSync('git', …)` and `spawnSync(process.execPath, …)`; no `execSync`, no `shell:`. So the present bytes are not counterexamples. The detector is nonetheless not what criterion 2 says ("contains no shell binary invocation").
- Bounded correction: strip comments with a dependency-free JS lexer (token-level, not line-prefix) rather than line filters; reject every `exec*`/`spawn*` whose command is not `process.execPath` or the literal `'git'`; reject any spawn argument matching `/(^|\/)(bash|sh|zsh|dash|fish|ksh|env)$/`; reject any `shell` key whose value is not the literal `false` or absent; require exactly one `runCount` definition and analyze its body by token span rather than the first column-zero brace.

### F3 — Medium: an isolated cause-specific reason can be satisfied by `reason=none`

- Probe: `measure.mjs:708-727`. `GENERIC_REFUSAL_REASONS` (`measure.mjs:175`) is `{score_mismatch, round_count}`; `CLEAN_REASONS` (`measure.mjs:174`) is `{clean, could_not_evaluate}`. `none` is in neither.
- The gate uses `none` as its absent-reason sentinel (`check-user-round-contract.mjs:1222`, `1243`, `1252`, `1273`: `reason=${… ?? 'none'}`).
- Attack: `SELFTEST name=x expected_exit=1 actual_exit=1 expected_finding=score_mismatch expected_reason=none reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na isolation=cli result=PASS` passes `reasonAssertions`, adds `none` to `distinctReasons`, and increments `negativeReason` (exit 1, not generic). Criterion 5's "cause-specific" control is satisfied by a non-cause.
- Bounded correction: reject `none`, empty and `unknown` as expected_reason ids in the probe (add to a non-reason set beside `CLEAN_REASONS`).

### F4 — Medium: marker applicability is counted from marker_outcome on not-applicable cases; missing applicability is allowed

- Probe `measure.mjs:742-752` rejects `no_marker=1|0` and `marker_applicable=1` on not-applicable cases, but not `marker_outcome=absent|present`. Lines 758-760 then count `marker_outcome=absent|present` as a marker-applicable observation regardless of applicability.
- The spec header (`measure.mjs:56-59`) allows only `no_marker=1`, `no_marker=0` or `marker_applicable=1` as the observation, with not-applicable encoded as `no_marker=na`, "never as no_marker=0". A not-applicable case with `marker_outcome=absent no_marker=na` currently satisfies criterion 6.
- `applicability` may be absent: `normalizeApplicability(null)` returns `null` (`measure.mjs:539`), the applicable/not-applicable branches are skipped (`measure.mjs:742`, `753`), and a `no_marker=1` case with no applicability token still counts (`measure.mjs:758`).
- Bounded correction: count a marker observation only when `applicability === 'applicable'` and one of `no_marker ∈ {1,0}` or `marker_applicable=1` holds; drop `marker_outcome` from the count; require the applicability token on every passing case that carries a marker datum.

### F5 — Medium: criterion 1 binds the checker to `receipt.revision`, not to the measured revision

- `validateCommitPin` (`measure.mjs:565-582`) and `countC1` (`measure.mjs:651-652`) read the gate and its shell analysis at `receipt.revision`, and only check that revision is an ancestor of the measured revision.
- Consequence: at measured HEAD `72dcf03`, a receipt pinned to an older gate revision still counts `1` even if `scripts/check-user-round-contract.mjs` at HEAD differs from the pinned blob. The count would then describe bytes that are no longer delivered.
- Spec text (`measure.mjs:36-37`) literally requires only ancestry, so this is a spec gap, not an implementation slip. Bounded correction: additionally require `git diff --quiet <receipt.revision> <measured> -- scripts/check-user-round-contract.mjs` (or equal blob at measured), or require `receipt.revision == measured` for the gate path.

### F6 — Medium (residual, not fixable in the probe): C1 is attestation-only

- The probe never runs the gate (by design, `measure.mjs:3-9`). It accepts `selfTest.stdout` and `production.stdout` as text from a committed JSON receipt bound only by a matching `codeSha256` (`measure.mjs:578-580`). Nothing binds the stdout to an execution of those bytes (no transcript digest, argv, cwd, or witness).
- A hand-written receipt with the correct checker digest and a fabricated, self-consistent SELFTEST block counts `1`.
- Bounded correction: require a transcript digest and argv/cwd/exit provenance in the receipt, and a non-author re-run for certification. This report does not certify C1.

### F7 — Medium-low (gate truthfulness): some SELFTEST lines print literals as observations and mislabel in-process checks as CLI

- `check-user-round-contract.mjs:1243` (`reason_negative_control`) and `:1252` (`count_committed_<id>`) print `actual_exit=0` as a literal, not an observed exit. Both are in-process composites: `runCount` calls `spawnSync('git', …)` directly, and `reason_negative_control` never spawns the gate.
- `:1252` also prints `isolation=cli` for `count_committed_*`, though these are not CLI controls. The probe's own comment (`measure.mjs:546-551`, `NON_ISOLATED_CASE`) and the gate's comment say `count_committed_*` is non-isolated. The probe trusts the explicit `isolation=cli` token (`measure.mjs:716-718`), so any future `expected_reason` added to these lines would be counted as an isolated CLI control.
- Bounded correction: print `isolation=in-process` for composites and omit `actual_exit`/`reason` literals there, or print the true observed value; make `NON_ISOLATED_CASE` authoritative over the token.

### F8 — Low: applicability and reason aliases exceed the shipped vocabulary

- `normalizeApplicability` (`measure.mjs:538-544`) accepts `true`, `1`, `yes`, `0`, `no`, `na`, `n/a`, `false`, `inapplicable`, `not-applicable`. The contract states shipped applicability values are exactly `applicable|not_applicable` (`measure.mjs:47-49`).
- `selftestCases` accepts alias keys `applicable=`, `actual_reason=`, `observed_reason=`, `via=` (`measure.mjs:304-305`, `302-303`). Shipped lines use none of them.
- Bounded correction: strict enum and single key names.

### F9 — Low (latent): duplicate `runCount` definitions are not detected

- `analyzeRunCount` analyses only the first match (`measure.mjs:495-518`, `529-531`). JS function declarations hoist and the last one wins. The gate currently has one definition (`check-user-round-contract.mjs:418`), so no present defect.
- Bounded correction: require exactly one `runCount` definition in the code-only text.

### F10 — Info: scalar field is a literal

- `c1_operability_scalar_delta: 0` is hard-coded (`measure.mjs:1215`). It is consistent with the stated "no ordinal score delta" contract but the name reads as a measurement. Rename or derive.

## What held under source reading

- The production refusal is correctly pinned: gate `check-user-round-contract.mjs:602` emits `Found 6 user rounds, expected 10` with `finding=round_count`; probe regex `measure.mjs:794-807` matches exactly.
- Criterion 3 summary count matches emission: gate line `1287` sums `cases.length + committedIds.length + 4`, which equals the number of SELFTEST lines printed (the `clean` fixture also prints a line at `1222`).
- Shipped reason-asserting, isolated, exit-1 controls exist (`count_malicious_tee_refused` → `unsupported_counting_command`, `count_missing_revision_red` → `counting_command_failed`, etc.), so the gate meets criteria 4–5 on its own output; the attacks above are about the probe accepting non-conforming receipts, not about the gate's present output.
- The shipped marker semantics (`applies → no_marker=1|0, not-applicable → no_marker=na`, gate lines `1219-1221`) match the probe's intent for real gate output.

## Commands L1 should run after receipts exist (not run by this attacker)

- `node .ufo/waves/round-15/measure.mjs 72dcf03 --claim C1` — expected at this revision: `c1_truthful_diagnostics: 0`, `c1_receipt: 0`, no errors (missing-receipt branch).
- After a receipt lands at revision R: re-run `measure.mjs R --claim C1` and separately `git diff --quiet <receipt.revision> R -- scripts/check-user-round-contract.mjs` to test F5.
- A non-author re-run of `node scripts/check-user-round-contract.mjs --self-test` at the receipt revision and a byte comparison against the receipt's `selfTest.stdout` (F6).

## Residual risk / verification gaps

- No receipt exists; no transcript was observed. All conclusions are source-reading.
- No test or selftest execution. Regex and control-flow claims (F2 bypass forms, F3 `none` acceptance, F4 counting) are derived by reading `measure.mjs:520-527`, `708-760` and the gate emission lines; they are not executed. Verify by L1 with a fixture receipt if desired.
- Did not read the w2 `record.json`, `validation.json` or `dispatch-result.json` beyond existence.
- No pacman, no installs, no network. Tooling used: `sha256sum`, `git show`, `git ls-tree`, `git log`, `git status` (read-only).
