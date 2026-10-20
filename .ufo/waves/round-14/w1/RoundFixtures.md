# RoundFixtures — hostile count-command cases and preserved-history regression checks

Seat: `TabiR14.RoundFixtures` · Target: `scripts/check-round-contract.mjs` (hash #071D, read-only)
Scope: static design only. Nothing executed (no gate run, no selftest, no build, no sandbox run).
Tools installed/updated: none.
Line numbers below refer to `scripts/check-round-contract.mjs` unless prefixed otherwise.

## 1. Findings (by severity)

**F1 — critical: lane-authored SCORECARD command runs as a shell with no metacharacter denylist that matters.**
- `runCount` (L292-296) executes `spawnSync('bash', ['-c', command])` with `cwd: root`.
- The only guard is `parseScore` (L279-280): `command.startsWith('git ')` and `!/[;&\`<>\n\\]|\$[({]/`.
- Not blocked, so accepted and executed: `|` (any pipe stage, any binary), `(`/`)` (subshell, needs no `;`), `'`/`"`, `!` (git alias `!cmd`), `~`, `*`, `?`, `[`, `{`, `#`, `=` (env prefix on later stages), `$NAME`, and `-` options on `git` (`-c`, `-p`, `-C`, `--git-dir`, `--output`, `--ext-diff`).
- Consequence: an arbitrary command runs as the gate user, and the gate's `measured-against` binding is only textual (see F4).

**F2 — high: fail-open masking of errors via pipeline status.**
- Production shape is `git … | grep … | wc -l` (SCORECARD.md L242-314, L336-377). Bash returns the status of the last stage, so `wc` status 0 hides failures of `git` (exit 128 on a bad rev or path) and `grep` (exit 2 on an invalid regex).
- A broken stage yields stdout `0`, and `before: 0` is the most common pin. The gate therefore cannot distinguish "no matches" from "could not evaluate".
- The grep exit-1 path (no match) MUST keep mapping to `0`. That is the historical semantics and must be preserved (see §4 RG-1).

**F3 — high: output desync between what is displayed and what is executed.**
- `field` (L274-278) uses `/^name: (.+)$/m`. In JS, `.` and multiline `$` stop at `\r`, `\u2028`, and `\u2029`. The gate executes only the prefix, while the SCORECARD text shows the whole line. The `\n` branch of the denylist is therefore unreachable.
- `field` uses the first match only (L275-276). A duplicate `command:` line, or a duplicate `<!-- pstack-round:<id>` block (L271, first match wins), is silently ignored. Either can hide a payload from the gate's audit path while remaining visible to readers.
- `.trim()` (L277) strips U+00A0 and U+FEFF, so `measured-against: <sha>\u00a0` is accepted.

**F4 — high: `measured-against` is not bound to the revision actually read.**
- L427 `command.replaceAll(score.measured, options.baseline)` is the only binding. Any occurrence of the 40-hex string is replaced, including a grep pattern. The command may read `HEAD` or any other tree-ish while `measured` appears only as a pattern.
- Trailing operands, flags and env prefixes are not structurally checked either.

**F5 — medium: the selftest has zero coverage of the count command.**
- None of the 26 cases in `selfTest` (L547-665) mutates `SCORECARD.md`'s `command:`, `before`, `after`, `measured-against`, or duplicates. The only command under test is the fixture's own `git grep -h … | wc -l` (L507).
- The guard at L280 has no negative test. `--witness` (L704-736) also only compares verdicts on that fixture.

**F6 — medium: parser loosens the git invocation.** `argumentsOf` (L185-212) uses `Number(...)` for `--expect`, accepting `0x1`, `1e0`, and whitespace. Cosmetic, but it is the same class as F1 for argv input. Recommend `/^[1-9]\d?$/`-style validation alongside the fix. (Out of count-command scope; noted only.)

**F7 — medium: sibling gate has identical code.** `check-user-round-contract.mjs` L310-314, L493-495, and the fixture at L580 share the same `runCount` and guard. Any fix must land in both, or the user gate remains exploitable. Not edited here (out of my assignment).

**F8 — low: DoS.** `spawnSync` 30s timeout (L293) kills only the direct `bash` child. A grandchild such as `| sleep 60` or `| yes` keeps the stdout pipe open, so the call may not return at the timeout [INFERENCE — not executed]. Default `maxBuffer` (1 MiB) yields `ENOBUFS` on large output (bounded case H28 below).

## 2. Hostile count-command cases

Template: `<M>` = the fixture measured commit (40-hex). Each case is placed in a `SCORECARD.md` block whose other fields are the good fixture's values (`axis: freshness`, `before: 0`, `after: 1`, `measured-against: <M>`). The gate contains `<M>` in every case, so L428 is not the first stop.

Pre-fix column is static analysis of L279-280 and L292-296: "ACCEPTED" means the guard passes and `bash -c` runs the command. Every "ACCEPTED" row MUST run only in a disposable `--repo` under `/var/tmp`, never production. Sentinel paths `/var/tmp/tabi-r14-H##` are the success signal for execution.

| ID | Class | Exact command (`<M>` placeholder) | Pre-fix (L279-296) | Required post-fix result |
|---|---|---|---|---|
| H01 | option: git alias `!` | `git -c alias.r14x='!touch /var/tmp/tabi-r14-H01' r14x \| grep <M> \| wc -l` | ACCEPTED, sentinel created | exit 1 `finding=missing_score`, sentinel absent |
| H02 | option: `core.fsmonitor` via `-c` | `git -c core.fsmonitor='touch /var/tmp/tabi-r14-H02' status --porcelain \| grep <M> \| wc -l` | ACCEPTED [INFERENCE: fsmonitor string executes on status] | same |
| H03 | option: `diff.external` + `--ext-diff` | `git -c diff.external='touch /var/tmp/tabi-r14-H03' log -p --ext-diff -1 <M> \| grep <M> \| wc -l` | ACCEPTED [INFERENCE] | same |
| H04 | option: forced pager `-p` | `git -p -c core.pager='touch /var/tmp/tabi-r14-H04' log -1 <M> \| grep <M> \| wc -l` | ACCEPTED [INFERENCE: `-p` forces pager when stdout is a pipe] | same |
| H05 | option: write arbitrary file | `git log -1 --output=/var/tmp/tabi-r14-H05 --format=%H <M> \| grep <M> \| wc -l` | ACCEPTED; file written, then `score_mismatch` (stdout empty, after=0 ≠ 1) | `missing_score` before execution; file absent |
| H06 | option: repo substitution `--git-dir` | `git --git-dir=/var/tmp/tabi-r14-H06/.git ls-tree -r --name-only <M> \| grep <M> \| wc -l` | ACCEPTED; git error masked to `0` (F2) | `missing_score` before execution |
| H07 | option: repo substitution `-C` | `git -C /var/tmp/tabi-r14-H06 ls-tree -r --name-only <M> \| grep <M> \| wc -l` | ACCEPTED; masked to `0` | `missing_score` |
| H08 | flag escalation (semantics) | `git ls-tree -r -t --name-only <M> \| grep <M> \| wc -l` | ACCEPTED (counts tree entries too) | `missing_score` (only `-r --name-only` allowed) |
| H09 | flag escalation (semantics) | `git ls-tree -r -z --name-only <M> \| grep <M> \| wc -l` | ACCEPTED (NUL output: `wc -l` counts 0 lines) | `missing_score` |
| H10 | substitution: subshell, no `;` | `git ls-tree -r --name-only <M> \| (touch /var/tmp/tabi-r14-H10) \| grep <M> \| wc -l` | ACCEPTED (bare `(` not denylisted) | `missing_score`, sentinel absent |
| H11 | substitution: pipe to shell | `git ls-tree -r --name-only <M> \| sh -c 'touch /var/tmp/tabi-r14-H11' \| wc -l` | ACCEPTED | same |
| H12 | substitution: pipe to node | `git ls-tree -r --name-only <M> \| node -e "require('fs').writeFileSync('/var/tmp/tabi-r14-H12','x')" \| wc -l` | ACCEPTED | same |
| H13 | substitution: `tee` side-effect stage | `git ls-tree -r --name-only <M> \| tee /var/tmp/tabi-r14-H13 \| grep <M> \| wc -l` | ACCEPTED | same |
| H14 | substitution: env expansion | `git ls-tree -r --name-only <M> \| grep "$HOME" \| wc -l` | ACCEPTED (`$H` not denylisted) | `missing_score` |
| H15 | substitution: worktree-dependent patterns | `git ls-tree -r --name-only <M> \| grep -f SCORECARD.md \| wc -l` | ACCEPTED; result depends on uncommitted `SCORECARD.md` | `missing_score` (no leading `-`, no extra options) |
| H16 | substitution: host file read via operand | `git ls-tree -r --name-only <M> \| grep <M> ~/.bashrc \| wc -l` | ACCEPTED (`~` expands; stdin ignored; host file read) | `missing_score` (no extra operands) |
| H17 | binding bypass (F4) | `git ls-tree -r --name-only HEAD \| grep <M> \| wc -l` | ACCEPTED: before `0` (grep baseline), after `1` if fixture commits `receipt-<M>.txt` after `<M>`; verdict `clean` while count reads HEAD | `missing_score`; `<M>` must be the tree argument, not a pattern |
| H18 | trailing wc operand | `git ls-tree -r --name-only <M> \| grep <M> \| wc -l /var/tmp/tabi-r14-H18` | `score_mismatch` (exit 1 or `N path` output) | `missing_score` |
| H19 | trailing wc operand (format) | `git ls-tree -r --name-only <M> \| grep <M> \| wc -c` | `score_mismatch` (bytes ≠ lines) | `missing_score` (only `wc -l`) |
| H20 | masked grep error (F2) | `git ls-tree -r --name-only <M> \| grep '[' \| wc -l` | ACCEPTED as `0`, stderr only | DECISION D2 (§5): `could_not_evaluate`, or reject at parse |
| H21 | masked git error (F2) | `git ls-tree -r --name-only 0000000000000000000000000000000000000000 \| grep <M> \| wc -l` | ACCEPTED as `0` | `could_not_evaluate` or `missing_score`; never `0` silently |
| H22 | CR truncation (F3) | line: `command: git ls-tree -r --name-only <M> \| grep <M> \| wc -l\r\| tee /var/tmp/tabi-r14-H22` | ACCEPTED (prefix runs; payload dropped by `.`) — verdict `clean` while SCORECARD text carries the payload | `missing_score` (control char in field line) |
| H23 | U+2028 truncation (F3) | same as H22 with `\u2028` in place of `\r` | ACCEPTED, same desync | `missing_score` |
| H24 | duplicate `command:` field (F3) | block with `command: <benign>` then `command: <H22 payload without \r>` | ACCEPTED (first match) | `missing_score` (duplicate field) |
| H25 | duplicate block for same id (F3) | second `<!-- pstack-round:pstack-20261015-r01` block after the good one, hostile `command:` | ACCEPTED (first block wins) | `missing_score` (duplicate block) |
| H26 | trailing NBSP (F3) | `measured-against: <M>` followed by U+00A0 | ACCEPTED (`.trim()`) | `missing_score` |
| H27 | `after` padding (F3) | `after: 1` followed by U+00A0 | ACCEPTED | `missing_score` |
| H28 | unbounded output (F8, bounded) | `git ls-tree -r --name-only <M> \| yes \| head -c 2000000` | `score_mismatch` via ENOBUFS (default `maxBuffer` 1 MiB) | `missing_score` before execution |
| H29 | stall (F8, bounded) | `git ls-tree -r --name-only <M> \| grep <M> \| sleep 60 \| wc -l` | runs until the 30s timeout, possibly longer because the grandchild holds the pipe [INFERENCE] | `missing_score` immediately |
| C01 | control: backtick (must stay blocked) | `git ls-tree -r --name-only <M> \| grep \`id\` \| wc -l` | `missing_score` (L280) | `missing_score` (unchanged) |
| C02 | control: `$(...)` | `git ls-tree -r --name-only <M> \| grep $(id) \| wc -l` | `missing_score` | unchanged |
| C03 | control: `;` | `git ls-tree -r --name-only <M>; touch /var/tmp/x` | `missing_score` | unchanged |
| C04 | control: `${IFS}` | `git ls-tree -r --name-only <M> \| grep${IFS}x \| wc -l` | `missing_score` | unchanged |
| C05 | control: redirection `>` | `git ls-tree -r --name-only <M> > /var/tmp/x` | `missing_score` | unchanged |

Note on H17: the fixture commits `receipt-<M>.txt` after `<M>` (new commit on top of the measure commit). The before-run then greps the baseline sha over `HEAD` and gets 0; the after-run greps `<M>` over `HEAD` and gets 1. This is the concrete proof that `measured-against` is decorative under the current check.

### Selftest additions (spec for the implementing seat, not edited here)

- Add `selfTest` cases with a `mutate` that rewrites the `command:` line of the `pstack-20261015-r01` block in `SCORECARD.md`. Use the existing `mutation` commit path (L672-675). The block is appended after the `baseline-score\n` prefix, so the append-only check still passes.
- Each case: `exit: 1, finding: 'missing_score'`, plus a sentinel-absent check for H01-H16 and H22-H29.
- Add the CR, U+2028, NBSP, duplicate-field and duplicate-block cases as raw byte writes, since `commit` runs `git add`/`git commit` and the fixture is UTF-8.
- Add the controls C01-C05 as a single case, which expects `missing_score` before execution.

## 3. Proposed fix shape (for implementer; not applied)

Replace `runCount(root, command)` with a parser that never invokes a shell. The parser accepts exactly the two observed shapes (both are used by fixtures or production; nothing else):

- Form A (production, 16 rows): `git ls-tree -r --name-only <SHA40> | grep <PAT> [| grep <PAT>]* | wc -l`
- Form B (fixture L507 shape): `git grep -h <PAT> <SHA40> -- <PATH> | wc -l`

Token rules:
- `<SHA40>` = `/^[a-f0-9]{40}$/`; must equal `measured` (or `baseline` in the before run) in the tree-ish position, and must not appear elsewhere.
- `<PAT>` = bare token `/^[A-Za-z0-9._\/-]+$/` not starting with `-`, or a single-quoted string with no `'` (quoted pattern may contain `^`, `$`, spaces).
- `<PATH>` = bare token from the same class.
- No other flags, no operands, no env prefixes, no pipes beyond the shape above, no `(`, `)`, `{`, `}`, `~`, `*`, `?`, `[`, `!`, `"`, `\`, `$`, `#`, `=`.

Execution: `spawnSync('git', argv, { cwd: root, shell: false, env: <caller env> })` followed by `spawnSync('grep', [pat], { input: prev.stdout })` for each stage, and `wc -l` counted in JS as the number of `\n` bytes. Keep `LC_ALL`/`LANG` unchanged so grep byte semantics are identical. Keep the `grep` exit mapping: 0 → lines, 1 → `0`, ≥2 → D2 decision. Git non-zero → D2 decision.

Also in `parseScore`: reject any control character (`/[\x00-\x1f\x7f\u2028\u2029\u00a0\ufeff]/`) in `command`, `measured-against`, `before`, `after`; reject duplicate `command:`/`before:`/`after:`/`measured-against:`/`axis:` lines; reject duplicate `<!-- pstack-round:<id>` blocks.

Key constraint: `before`/`after` strings compare exactly (L295 `trim()` output vs field string). Do not change that equality.

## 4. Preserved-history regression checks (exact values; must be identical after the fix)

**RG-1 — 10 production pstack rows** (SCORECARD.md L238-315). Expected per row: `before` and `after` as pinned, `measured-against` as pinned, shape Form A. Before-run uses `<measured>` → `HARD_BASELINE` 7f506affa55f6fb892d3c8073c75151c998bdf2c.

| round | axis | before | after | measured-against |
|---|---|---|---|---|
| pstack-20261015-r01 | freshness | 0 | 1 | f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8 |
| pstack-20261015-r02 | freshness | 0 | 2 | 6a91f68af5ac5135b6b753c947b12c72e54794ef |
| pstack-20261015-r03 | adjacency | 0 | 4 | a19c6a90a0fb0e00729fd895c3c136ac4305f877 |
| pstack-20261015-r04 | coverage | 0 | 1 | 3e3ba9e90d4bf04d5743652e72a9252f81877122 |
| pstack-20261015-r05 | freshness | 0 | 1 | 2e4cba06a07ff7f50a7aee6688644217eec64128 |
| pstack-20261015-r06 | operability | 0 | 1 | ef51deddbb3c649ae3931f011757e3eb9d340ad9 |
| pstack-20261015-r07 | adjacency | 0 | 1 | ec5ee4bd51a35fe964fe63b73ab356c27530e464 |
| pstack-20261015-r08 | calibration | 0 | 1 | 472bfc33de340035be5fa001f4e6685b79be4a64 |
| pstack-20261015-r09 | coverage | 0 | 1 | e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2 |
| pstack-20261015-r10 | freshness | 0 | 1 | 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2 |

Production command texts that must parse under Form A (exact, from SCORECARD.md): r01 `grep pstack-20261015-r01/public/capture.json`; r02 `grep pstack-20261015-r02/replay- | grep receipt.txt`; r03 `grep pstack-20261015-r03/boundary/ | grep '.txt'`; r04 `grep corpus/knowledge/example-domain-observation.md`; r05 `grep pstack-20261015-r05/replay/receipt.txt`; r06 `grep pstack-20261015-r06/operability/selftest-receipt.txt`; r07 `grep pstack-20261015-r07/boundary/refusal-receipt.txt`; r08 `grep pstack-20261015-r08/calibration/pin-receipt.txt`; r09 `grep corpus/knowledge/loopback-pin-stability.md`; r10 `grep pstack-20261015-r10/replay/receipt.txt`. Each preceded by `git ls-tree -r --name-only <sha> |` and followed by `| wc -l`.

Note: r03's `'.txt'` is an unanchored BRE where `.` matches any char. This is historical semantics and must not be "fixed" to a literal match.

**RG-2 — 6 production user rows** (SCORECARD.md L332-378, gated by `check-user-round-contract.mjs`, not this file). Expected: user-20261015-r01 operability 0→1 `95ea5f8b98ae4cf8ee651bf46709570114f50edd`; r02 adjacency 0→1 `59ba8da019400c1a3b14bc2c19746a457f791601`; r03 calibration 0→1 `8a869af00665e8e445bc84c50492433097c55866`; r04 coverage 0→1 `982e3b2d53569fe3494d5f589384ce789ea52a20`; r05 depth 0→1 `c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7`; r06 freshness 0→1 `1229098dae56c2d193c01203ff93651da2853f6e`. Sibling seat must run the same check.

**RG-3 — pins that must remain byte-identical in this file:**
- `HARD_BASELINE` = `7f506affa55f6fb892d3c8073c75151c998bdf2c` (L11)
- `CENSUS_SHA256` = `b9c8dc3557b825f8bd4b18ff0db03909e16ddd526ef18554cb2bf68da696be9c` (L30)
- `SHONEN_SEED_SHA256` = `b45c2ac3cdf8ba80563e77cabf72670a6a101590f8031d9b484c67313bcdab67` (L36)
- `LEGACY_GATE_BLOB` = `b2eb8316f41cd1039330e45f6739c07c5f11eace` (L38)
- `APPEND_ONLY` list (L25), `SHONEN_PATH` (L26), `CENSUS_PATH` (L27), and `protectedPath` (L83-92) are unchanged. This file is not in `protectedPath`, so editing it does not trip the history check.

**RG-4 — selftest, 26 named cases + alias (must stay PASS with the same exit/finding):** clean(0,clean); short_swarm(1); missing_gate(1); consequential_action(1); canonical_shonen(0,clean); canonical_shonen_census(0,clean); shonen_invalid_mark(1,shonen_policy); shonen_extra_prose(1); shonen_missing_box(1); shonen_x_without_verifier(1); shonen_x_self_declared(1); shonen_wrong_title(1); shonen_missing_pointer(1); shonen_tree_pointer(1); shonen_symlink_pointer(1); shonen_unchecked_prose(1); shonen_extra_evidence_line(1); shonen_crlf(1); shonen_double_newline(1); census_row_mismatch(1,history_rewritten); census_missing_row(1,history_rewritten); census_byte_tamper(1,history_rewritten); census_deleted(1,history_rewritten); census_moved_baseline(1,history_rewritten); historical_mutation(1,history_rewritten); future_lesson_allowed(0,clean); production_alias_refused(2,usage). Expected summary line: `ROUND_CONTRACT_SELFTEST verdict=clean cases=26 alias_checks=1`.

The `clean` fixture uses Form B (L507). The fixed parser MUST accept Form B, or the fixture must be migrated in the same change (clean cutover). Choose one explicitly (D1).

**RG-5 — witness.** `--witness <rev>` with `<rev>` whose `scripts/check-round-contract.mjs` blob is `b2eb8316f41cd1039330e45f6739c07c5f11eace` (find via `git log --format=%H -- scripts/check-round-contract.mjs` and `git rev-parse <rev>:scripts/check-round-contract.mjs`). Expected: `ROUND_CONTRACT_WITNESS fixture=shared old_rev=<rev> old_exit=1 old_finding=history_rewritten new_exit=0 new_verdict=clean ... result=PASS`.

**RG-6 — production rows, byte-for-byte oracle.** Before the edit, record the old gate's full stdout: `node scripts/check-round-contract.mjs > /var/tmp/r14-oracle-before.txt`. After the edit, run the new gate and diff the `ROUND id=…` lines and the final `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` line. Must be identical.

**RG-7 — per-stage equivalence.** For each of the 10 command strings in RG-1 (and the 6 user strings), compare `bash -c` stdout trimmed against the new parser's output with `<measured>` substituted by `<baseline>` and by `<measured>`. Both must equal `before`/`after`.

## 5. Decisions for L1 (explicit, not silently chosen)

- **D1** Form B: keep the fixture's `git grep` shape (parser accepts it) or migrate the fixture to Form A. Either is a clean cutover; pick one and state it.
- **D2** Exit semantics: grep exit ≥2 and git non-zero currently map to `0` (F2). Preserving that is what "exact historical semantics" literally says for grep exit 1; for exit ≥2 and git errors the current behavior is a silent false `0`. Recommended: `could_not_evaluate` (exit 2). No production row exercises those paths [INFERENCE — verify by running RG-1 under the new parser; zero rows should hit exit ≥2].
- **D3** `measured` binding: require `<SHA40>` in the tree-ish position only (recommended), which rejects H17.
- **D4** Apply the same parser to `check-user-round-contract.mjs` in the same change (F7).

## 6. Verification plan for L1 (commands; run after all seats land)

1. Pre-edit oracle: `node scripts/check-round-contract.mjs > /var/tmp/r14-oracle-before.txt; echo $?`
2. Post-edit: `node scripts/check-round-contract.mjs --self-test` → expect `ROUND_CONTRACT_SELFTEST verdict=clean cases=26 alias_checks=1` plus the new hostile cases (each `result=PASS`).
3. Post-edit: `node scripts/check-round-contract.mjs` → diff `ROUND` lines against `/var/tmp/r14-oracle-before.txt` (RG-6).
4. Witness: `node scripts/check-round-contract.mjs --witness <legacy-rev>` → `result=PASS` (RG-5).
5. Hostile sentinel check: `ls /var/tmp/tabi-r14-H* 2>/dev/null` → must print nothing after post-edit selftest. Remove any leftovers before the run.
6. User gate: `node scripts/check-user-round-contract.mjs` and its selftest (sibling seat's scope).

Hostile-case execution against the OLD gate is optional and only in a disposable `--repo` under `/var/tmp`, never production, and it must run under a wrapper with a hard `timeout 60` (H28/H29 can stall).

## 7. Verification gaps

- Nothing was run. All "ACCEPTED" statements are static analysis of L279-280 and L292-296. Items tagged [INFERENCE] (H02, H03, H04, H29, F8) depend on git and spawnSync runtime behavior and MUST be confirmed by L1 in a sandbox, not in production.
- Production SCORECARD rows were read from `SCORECARD.md` (grep of the `pstack-round` / `user-round` blocks) and the expected values in §4 are transcribed from it; L1 must re-derive them from the file.
- `check-user-round-contract.mjs` was not read in full; F7 is based on grep hits at L310-314, L493-495, L580.
