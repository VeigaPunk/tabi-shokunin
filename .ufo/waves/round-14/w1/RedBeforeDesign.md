# Red-before design — SCORECARD command execution

## Reconstructed contract

The gate's `command:` field is lane-authored historical measurement data, not an executable interface. It must be interpreted using a narrow, non-shell evaluator for the exact committed `git ls-tree -r --name-only REV | grep PATTERN | wc -l` grammar, preserving the existing before/after counts and findings. It must not evaluate SCORECARD text as shell. In particular, the new evaluator must reject an extra `tee` stage rather than merely blacklist a few shell metacharacters; `|` is part of the legitimate historical grammar, so a pipe-only ban is not an equivalent migration.

## Evidence chain (read-only)

- `scripts/check-round-contract.mjs:270-295` (`parseScore` / `runCount`) validates that a command starts with `git `, rejects semicolons, ampersands, backticks, `<`, `>`, line breaks, backslashes and `$(`/`${`, but does not reject `|`; `runCount` then calls `spawnSync('bash', ['-c', command], { cwd: root, ... })`. `check()` constructs `beforeCommand` by replacing the measured commit with the baseline, then calls `runCount` for both before and after at `:407-430`.
- `scripts/check-user-round-contract.mjs:294-314` has the same whitelist-by-blacklist shape and `bash -c` execution. Its check path calls the before/after measurement at `:471-495`.
- The required pipeline is present in committed `SCORECARD.md`: pstack rows include `git ls-tree -r --name-only … | grep … | wc -l` at `:238-314`, and user rows at `:332-378`. The observed recorded outcomes are not all 0→1 (e.g. pstack r02 is 0→2, r03 is 0→4), so the parser/evaluator must keep each expected historical count intact.
- Both fixture generators write a marker only after the baseline commit and use a measured commit that contains it: round fixture `scripts/check-round-contract.mjs:447-508`; user fixture `scripts/check-user-round-contract.mjs:512-581`. The existing `--witness` implementations use temporary roots under `/var/tmp` and `finally` cleanup (`check-round-contract.mjs:704-735`; `check-user-round-contract.mjs:629-664`). Their current SHONEN red/green setup can stop the old arm at history validation, before it reaches `runCount`, so that existing SHONEN case alone is not a C1 execution witness.
- `xd://lsp` was unavailable (`No such tool`; the mounted device list does not include LSP). I used direct source reads and literal `grep` output only; no grep result is treated as semantic proof. No gate, witness, self-test, build, lint, formatter, or runtime command was run. No tool was installed or updated.

## Isolated same-command red/green witness design

Add a distinct C1 subcase to each existing witness mode while retaining its current SHONEN history case and pinned legacy-gate identity. Build a fresh fixture from the existing fixture generator and **leave its baseline SHONEN bytes unchanged**; otherwise the pinned old gate may reject history before evaluating the command. Reuse the fixture's baseline and measured commits, then replace only the fixture's current `command:` value in `SCORECARD.md` with the same malicious pipeline for both arms and commit that SCORECARD change in the fixture:

```text
git ls-tree -r --name-only <measured> | grep round-marker.txt | tee .round14-count-marker | wc -l
```

For the user fixture, a corresponding distinct marker basename is fine (for example `.user-round14-count-marker`). The fixture baseline has no `round-marker.txt`; the fixture's measured commit does. Replacing `<measured>` with `<baseline>` for the before evaluation therefore preserves the historical `0` before / `1` after output. This uses the real committed `ls-tree`/`grep`/`wc -l` pipeline shape, plus only the forbidden `tee` side effect.

Run the pinned old gate first against this fixture using the exact same `--repo`, `--baseline`, and `--expect` values intended for the new gate. The command's `tee` operand is a **relative leaf in the fixture cwd**, so the intentional red-arm write is confined to the fresh `/var/tmp` fixture. Require old exit 0 / clean verdict and the marker's presence; this proves both that the old gate accepted the measurement and that its shell execution occurred. Then remove that marker and assert absence without modifying any committed fixture file. Run the new gate against the unchanged fixture state with the identical command and args; require a non-clean refusal for unsupported grammar and require the marker to remain absent. Record actual child exit/verdict/finding and marker observations, not synthetic expected strings. If either arm does not meet its predicate, fail the witness. Existing `finally` cleanup must remove the scratch root on all paths.

For the history-preservation guard, capture fixture `HEAD` before and after each child and require equality; the marker is untracked scratch, not a commit. After removing the old marker, confirm the working tree returns to its pre-child fixture state (or equivalent exact status check) before invoking the new arm. Keep this C1 subcase separate from the current canonical-SHONEN case so each red cause reaches its intended validation path.

## Divergence and confidence

Observed divergence in the checked-in source is shell execution of a SCORECARD command whose pipeline delimiter is permitted by the current filter. A `tee` stage can preserve the count pipeline's stdout while creating a marker; the proposed witness distinguishes actual execution from a mere parser error and ensures its only intentional side effect is under a disposable fixture root. Static confidence is high for the source paths above; whether the witness passes against the pinned old gate and the landed new evaluators remains **unobserved** until Main runs it.

I messaged `TabiR14.RoundCounter` and `TabiR14.UserCounter` with the same fixture, command, SHONEN-isolation, and marker-reset design. No source edits or verification were performed by this lane.
