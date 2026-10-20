# AttackGrammarReason — round-15 C1 USER refusal reason falsification

Author-side falsifier report. Not a non-author verdict. Source-reading only: no gate, selftest, witness, counter, test, build or browser was executed.

## Attacked bytes

- Repository: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- HEAD revision attacked: `72dcf031b9da24796b718517ea575f21e4f7caae` (matches `build-snapshot.json` `revision`)
- Baseline per snapshot: `7054a5e1068538349b4dbb0d291c2fe8643802f2`
- Gate source: `scripts/check-user-round-contract.mjs`
  - sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (matches snapshot `sha256` entry)
  - git blob `12b14bdf288dc9877820f699677fb11651d254c1` equals the worktree blob; `git status` shows no uncommitted change to `scripts/`, so the delivered bytes are the committed HEAD bytes.
- Last source write: `scripts/check-user-round-contract.mjs` mtime 2026-10-20 05:12:21 (-0300); commit `c138bea` "precise USER refusal diagnostics" 05:13:25; `72dcf03` 05:29:43 did not change this file.

## Temporal limits (reported, not treated as success)

1. `corpus/lessons/round-15.md` section `## Execution evidence` (lines 57-59) is empty: "Actual command receipts ... are added here before this lesson's first commit". No C1 receipt exists in the delivered tree. C1 success is therefore **not established**; the lesson's gate (lines 9-10) is unmet by evidence.
2. `.ufo/waves/round-15/w1/CountReasonWitness.md` (05:04:47), `CountWrongFailure.md` (05:05:16), `CountReasonGrammar.md` (05:06:01), `CountProduction.md` (05:06:52) all predate the final script write (05:12:21) and commit `c138bea`. They are **not delivered-byte reviews** and are not cited as evidence here.
3. `corpus/evidence/round-15/` contains only `source-index.json`, `misroot-recovery.json`, `metadata/`. No USER count-witness or diagnostic-witness receipt for `72dcf03`.
4. `corpus/QUALITY.md` item 21 and `corpus/README.md` round-15 section describe C1 behavior; they are not evidence of it.

## Propositions checked (source reading)

| # | Proposition (lesson / QUALITY 21) | Source reading | Result |
|---|---|---|---|
| P1 | Reason is a closed, structural literal, not derived from input | `COUNT_REASONS` lines 92-99; `fail()` lines 101-106 validates reason at construction; all count refusals pass literal reasons (lines 413, 414, 420, 430, 616, 618, 619) | Holds |
| P2 | Attacker command cannot inject a second `USER_ROUND_CONTRACT` line or a fake ` reason=` / ` detail=` into the receipt | `field()` regex `^name: (.+)$` (line 405) cannot capture `\n`; grammar `GREP_PATTERN` (line 371) excludes `=`, `\r`, `\n`; path `GREP_PATH` (line 372) excludes `=`; every echoed command passes `countingCommand` before echo | Holds for newline/`=` injection; see F2 for line-terminator truncation |
| P3 | `receiptOf` parses the reason from the anchored child record, not from prose | `receiptOf` lines 759-776 reads failure only from stderr, anchored regex line 764 `finding=... (?: reason=...)? detail=(.*)$`; reason group is `[a-z_]+` | Holds |
| P4 | Exact reason is asserted, not substring | `receiptMatches` lines 781-786: `observed.reason === expected.reason` (exact) | Holds for reason; detail is substring (`includes`, line 785) — see F5 |
| P5 | Malicious grammar is refused before any shell/git side effect | `countingCommand` (383-398) is anchored `^...$` and argv-only; `runCount` spawns git with argv (line 425). Marker-creating payloads (`tee`, `sh -c`) fail `TREE_COUNT` (line 367) before any spawn | Holds for tee/sh/option-injection payloads |
| P6 | Refusal happens before any counting for the round | `parseScore` (line 614) runs after `checkSpec` and `checkSwarm` (612-613). A malicious command in a round whose swarm or spec also fails yields that earlier reason, not `unsupported_counting_command` | Holds (ordering note only, F4) |
| P7 | Duplicate or extra measurement fields cannot hide a refused command | `parseScore` lines 400-416 use first-match `exec` for `<!-- user-round:${id}\n` (line 401) and first-match `field()` (line 405) with no uniqueness check | **Defect F1** |
| P8 | The evaluated command equals the displayed committed command | `(.+)$` with multiline flag (line 405) stops at `\r`, `\u2028`, `\u2029` (ECMAScript `.` and multiline `$` semantics, source-reading INFERENCE, not executed) | **Defect F2** |
| P9 | Unsupported-command echo cannot carry attacker text into the detail | Line 420 `Unsupported counting command: ${command}` echoes raw command; unreachable from `check()` (parseScore at 412-413 refuses first; runCount callers 618, 619, 1249, 1250 all pass validated `score.command`) | Dead echo branch; **F3** |
| P10 | Selftest expected-reason controls are discriminating | `reason_negative_control` lines 1234-1242 uses decoy `after_count_mismatch` against `count_missing_revision_red`; exact reason comparator rejects it | Holds (source reading) |
| P11 | Mutant arm flips only the masking guard | `MASK_GUARD` (line 859) appears once; `runDiagnosticWitness` (940-1036) splits on it and asserts count 2 parts; mutant `const masked = true;` (line 860) also masks tree-kind failures (line 429 guard applies to both kinds) | Holds; note mutant masks tree failures too, which matches historical `wc -l` masking |

## Findings

### F1 (medium) — duplicate measurement blocks and fields are silently first-match; malicious later copies are never refused

- Pointer: `scripts/check-user-round-contract.mjs:400-416`, specifically line 401 (`pattern.exec(scorecard)` returns first block) and line 405 (`new RegExp('^'+name+': (.+)$','m').exec(body)` returns first line).
- Trace: a `<!-- user-round:user-20261015-rNN` block appended after the committed one (SCORECARD is APPEND_ONLY-prefix-checked at line 72/317-321, so appended text is permitted) is never parsed, never refused, and produces `verdict=clean`. Likewise a second `command:` line inside the same block is ignored; only the first is evaluated.
- Impact: the malicious payload is not executed (argv-only counting), so this is a refusal/truthfulness gap, not an execution path. But C1's stated contract is that malicious grammar is refused with an exact reason; a clean verdict over a SCORECARD containing an unevaluated malicious `command:` line is not truthful.
- Bounded correction (source only, for L1):
  - In `parseScore`, require exactly one occurrence: count `scorecard.matchAll` of `<!-- user-round:${id}\n`; if not 1, `fail('missing_score', ...)`.
  - In `field()`, count matches of `^${name}: ` in `body` with `m`; if not 1, `fail('missing_score', \`${id} scorecard repeats ${name}\`)`.
  - Add one negative selftest case that appends a second `command:` line carrying `| tee` and expects `missing_score`, with marker-absent control.

### F2 (medium-low) — line terminators truncate the evaluated command; the tail is silently dropped

- Pointer: `scripts/check-user-round-contract.mjs:405` (`(.+)$` with `m`) and `:411` (`field('command')`).
- Trace (ECMAScript source reading, not executed): `.` excludes `\n`, `\r`, `\u2028`, `\u2029`; multiline `$` matches before any of those. A committed line `command: git ls-tree -r --name-only <40hex> | grep x | wc -l\r| sh -c 'touch y'` yields captured command = the grammar-valid prefix. The grammar at 367 accepts the prefix; `verdict=clean` results; the displayed/committed bytes contain an unrefused shell tail.
- Impact: same class as F1 — the shell tail is never executed by the gate, but the gate's refusal contract does not cover the committed bytes, and a human or historical `wc -l` pipeline copy would execute it.
- Bounded correction: change line 405 to capture to end-of-line (`^${name}: ([^\n]*)$`, `m`), and in `parseScore` reject the command field with `fail('score_mismatch', ..., 1, 'unsupported_counting_command')` when the captured value matches `/[\r\u2028\u2029]/`. Apply the same rejection to `measured-against`, `before`, `after`, `axis` (or fail `missing_score`).
- Add one selftest with `\r` plus shell tail expecting exit 1, `finding=score_mismatch`, `reason=unsupported_counting_command`, marker absent.

### F3 (low) — dead raw-command echo in `runCount`

- Pointer: `scripts/check-user-round-contract.mjs:419-420`: `fail('score_mismatch', \`Unsupported counting command: ${command}\`, 1, 'unsupported_counting_command')`.
- Trace: every caller (`check()` at 618-619; selftest at 1249-1250) passes `score.command` already validated by `parseScore` at 412-413. The branch is unreachable, but if reached it would place raw attacker text in the `detail=` tail.
- Bounded correction: delete the branch or replace with fixed text (`counting command is not a supported git line count`) with the same reason, per clean-cutover rule. No behavior change on the current path.

### F4 (note, not a defect) — refusal reason depends on check order

- Pointer: `check()` lines 612-614: `checkSpec` and `checkSwarm` run before `parseScore`. A malicious command in a round with a broken swarm reports `short_swarm`, not `unsupported_counting_command`. Selftest controls use a good fixture, so their isolation holds.
- Correction if L1 wants isolation: none required for C1; state the precedence in QUALITY 21 or lesson if a claim is made about isolated refusal.

### F5 (low) — expected-detail comparison is substring, not exact

- Pointer: `receiptMatches` line 785 `observed.detail.includes(expected.detail)`; selftest expectations at 1088 (`Counting command failed:`), 1237, 1241, 1236.
- Trace: the expected detail for `count_missing_revision_red` is a prefix of a line whose tail is the grammar-valid command echo (line 430). Reason and finding are exact, so no decoy passes; but detail is weaker than the lesson's "exact expected refusal reasons" wording.
- Bounded correction: use `observed.detail.startsWith(expected.detail)` for echo-bearing expectations, or fixed exact detail text at call sites.

## Verified non-defects (attack attempted, held)

- Reason spoofing via detail echo: blocked by grammar excluding `=` and line terminators (see P2 and F2 for the terminator caveat).
- Git option injection via scorecard command: `GREP_COUNT`/`TREE_COUNT` anchored; `countPattern` rejects leading `-`; `GREP_PATH` rejects leading `-` and `..`; revision is 40-hex; argv only (line 422-425).
- Shell payload via tee/sh/`--git-dir`: refused before spawn by anchored grammar (367-368); marker-absence is applicable only to the tee and sh controls (lines 1061-1068).

## Environment and tooling

- No installs or updates performed. `pacman` paused per host ruling; none needed.
- Commands used were read-only: `git rev-parse HEAD`, `git status --porcelain`, `git diff` (docs only), `git log`, `git hash-object`, `sha256sum`, `ls -l`, plus the repo file reads and greps above.
- Not executed: `check-user-round-contract.mjs` in any mode, selftest, witnesses, counters, tests, linters, builds, browser.

## Commands L1 should run after integration (not run by this seat)

- `node scripts/check-user-round-contract.mjs --self-test` (expect new cases from F1/F2 once added)
- `node scripts/check-user-round-contract.mjs --count-witness <rev>` and `--diagnostic-witness`, capturing receipts into `corpus/evidence/round-15/` (none exist yet; lesson lines 57-59 must be filled from actual output)
- `git grep -n 'user-round:user-20261015' -- SCORECARD.md` to confirm no duplicate blocks exist in committed SCORECARD before F1 lands
