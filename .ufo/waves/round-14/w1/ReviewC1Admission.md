# ReviewC1Admission — tabi round 14, w1 (C1 operability, read-only)

Seat: TabiR14.ReviewC1Admission (reviewer, leaf). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Snapshot: working tree read 2026-10-20T06:50–06:58Z. HEAD `bebe2ef`. The gate files were being edited by RoundCounter / UserCounter during this read (round gate sha256 moved `fac79599…` → `f7eacd14…` → `8a573b4e…`; user gate `runCount` signature changed between reads). Every line number below is a snapshot pointer; re-read before acting.

Checks executed: none. Only read-only `git` plumbing (`cat-file`, `log`, `show`, `ls-tree`, `hash-object`, `status`), `sha256sum`, `cmp`, file reads, and one literal `grep` semantics probe (`printf 'examplexdomain\n' | grep -c 'example.domain'` → `1`, showing BRE `.` matches any char). No gate, self-test, witness, build or lint was run. No tools installed or upgraded. `strace` is already present at `/usr/bin/strace`; GNU grep is `3.12-modified` (`/usr/bin/grep`, pacman `grep 3.12-2`).

## Verdict

C1 is not admissible yet. The direction is right (argv `git`, no shell, historical forms only), but:
- one concrete production-red regression is already in the working tree (F1: the user gate would report `history_rewritten`, not the honest `round_count`);
- the round-gate tokenizer accepts a quoted `'|'` as a pipe (F2);
- child-process controls are incomplete in both gates (F3);
- the production user run never reaches the counting code, so no receipt yet exercises the six real USER rows (F4).

## Findings (by severity)

### F1 — HIGH — user gate archived-identity list omits an intermediate round-gate digest; production red changes class
- Pointer: `scripts/check-user-round-contract.mjs`, constants L29–L40 (`ROUND_SCRIPT_ARCHIVED_SHA256 = [PRIOR, CUTOVER]`) and `acceptedRoundScript` L204–L223; the history loop is L215–L221.
- Evidence (git-verified, read-only): `git log --format=%h 92d700d..HEAD -- scripts/check-round-contract.mjs` lists `1199150` and `1212207`. `git show 1199150:scripts/check-round-contract.mjs | sha256sum` = `6f9eddc74f0e10ac5046ed9ecd99650db4f338c004f5d0e349503b6515a6b299`. That digest is in neither the archived nor the accepted list. The loop at L217–L221 returns `false` on it, so `pstackDrift` flags `scripts/check-round-contract.mjs` and production prints `history_rewritten: Pstack bytes changed…` before `round_count`. The file's own comment (L23–L28) says every commit in that history must be one of the explicit identities, so the comment and the constants disagree.
- Consequence: the C1 expected production result (`finding=round_count detail=Found 6 user rounds, expected 10`, exit 1) is not what the working tree produces.
- Fix: add the `1199150` digest as an explicit archived (superseded) identity and keep it out of ACCEPTED. Add a fixture: an unarchived intermediate digest → `history_rewritten`; an archived intermediate plus accepted HEAD → reaches `round_count`.

### F2 — HIGH (refusal contract) — round tokenizer collapses quoted `'|'` into a pipe operator
- Pointer: `scripts/check-round-contract.mjs` `countStages` (≈L317–L350): `tokens.push('|')` for the operator (≈L321), `tokens.push(quoted)` for quoted words (L337), then `if (token === '|') stages.push([])` on the same string space.
- Effect: a quoted word equal to `|` becomes an operator. Example (source-derived, not executed): `git ls-tree -r --name-only <sha> | grep marker '|' wc -l` → stages `[git…]`, `[grep marker]`, `[wc -l]` → accepted and counted. Shell semantics differ: `grep` receives `|` and `wc` as file operands. The accepted count therefore comes from a command the grammar should refuse. No code execution path, but it violates "reject unrecognized syntax before any process starts."
- Fix: tokens must carry a kind (`{op:'|'}` vs `{word:…}`). Add a self-test: quoted `'|'` → `score_mismatch`, no marker.

### F3 — HIGH (child CLI controls) — required controls absent in both gates
Current state:
- Round: `git()` L60 has `maxBuffer` only. No `timeout`, no `env` scrub, no `-c core.quotePath`, no hook suppression. The `ls-tree` path at L415 and the `grep` path inherit the same helper. Fixture `git init -q` (≈L622) and `commit()` (≈L612) inherit global `init.templateDir`/hooks and `GIT_DIR`.
- User: `runCount` L403 has `timeout` 30 s and `maxBuffer` 16 MiB (good) but no env scrub. Fixture `commit()` ≈L611 and `init` ≈L621 are unhardened.
- Selftest / witness node children: no `timeout` in either gate (round ≈L887, L900, L918, L950–951, L992–997; user ≈L763–764, L815–819, L960, L976).
- `git` is spawned as argv (`spawnSync('git', args)`), no shell in either gate. That part is correct and must stay.
Required controls (declare each in the report):
1. Every spawn: argv array, no shell, explicit `cwd: root`, `timeout` (30 s git, 120 s node children), `maxBuffer` (16 MiB), check `error`, `signal`, `status`.
2. Git env for count and fixture children: delete `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_NAMESPACE`, `GIT_COMMON_DIR`; set `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_TERMINAL_PROMPT=0`.
3. Pin `-c core.quotePath=true` on count argv, so output is ASCII C-quoted bytes and the legacy-equivalence argument is provable (see F7).
4. Fixture repos: `git init -q --template=` and `-c core.hooksPath=/dev/null` on fixture `commit`.
5. Node child spawns: explicit `timeout`.
Trade-off to state: pinning global config changes semantics only for users who set `core.quotePath=false`; the 16 historical rows are ASCII, so the historical counts are preserved.

### F4 — HIGH (evidence) — no production receipt exercises USER counting
- Pointer: user `check()` L575–L604: `round_count` at L580 is thrown before the loop; `runCount` is first reached at L598.
- Consequence: production USER (exit 1, round_count) never runs the six real USER rows through the new evaluator. The committed round-13 USER production receipt (`corpus/evidence/round-13/user-production-final.json`) has exit and stderr only, no counts.
- Required evidence: a non-production clone run (`--expect 6`, see L1 list step 9) plus a one-time legacy-oracle run of `7df3ee9` in the same scratch clone, compared line by line on the six `ROUND id=…` lines (`before`, `after`, `measured-against`). The legacy run executes lane SCORECARD shell, so it is allowed only in a scratch clone under `/var/tmp`, never in the production tree.

### F5 — MEDIUM — user gate ignores the embedded revision token; round gate honours it
- Pointer: user `runCount(root, command, rev = null)` L396–L403: `const target = rev ?? spec.rev`; `score.command` is run with `rev` = baseline / measured (L598–L599). `spec.rev` is parsed then discarded.
- Round gate: `replaceAll(measured, baseline)` on the embedded token (legacy-exact, L~596–L600).
- Effect: a row whose command names revision X but declares `measured-against` Y is counted at Y by USER and at X by round. The 16 committed rows have command rev = measured-against (checked by reading SCORECARD.md L242–L378; L1 should confirm mechanically), so the historical result is unchanged, but the two gates disagree on the same text.
- Fix: in both gates require `spec.rev === score.measured` (refuse with `missing_score` otherwise) and count the parsed token, or use the embedded token in both. Pick one and test it.

### F6 — MEDIUM — refusal finding mapping differs across gates and within the round gate
- Round: parseScore prefilter L296 → `missing_score`; `countStages` refusals → `score_mismatch`; `runCount` L459 → `score_mismatch`. Round self-tests `count_*` expect `score_mismatch`.
- User: `countingCommand` null → `missing_score` (parseScore and runCount). User self-tests `malicious_*` expect `missing_score`.
- RoundCounter's brief says "reject as score_mismatch"; UserCounter's implementation uses `missing_score`.
- Fix (recommended): grammar refusal → `missing_score` in both gates (structural, same as the existing prefilter); evaluated count mismatch or git failure → `score_mismatch`. Apply in both gates and assert it in both self-test suites. L1 must not accept a mix.

### F7 — MEDIUM — the two gates implement different grammars and decoders
- Round: arbitrary printable pattern to `git grep`, bare `*`, up to N stages, multiple `git grep` paths, `latin1`/utf8 decode differences. User: one path, restricted `GREP_PATTERN`, `latin1` decode for ls-tree output.
- Same SCORECARD text can be accepted by one gate and refused by the other. Equivalence with GNU grep 3.12 BRE holds for ASCII lines only. `.` in JS matches a byte under `latin1` but a code point under the legacy UTF-8 locale, and `core.quotePath` decides which one the output contains.
- Fix: one narrow grammar (the user gate's closed shapes are the better base), one decoder (`latin1` over ASCII-only output, with an explicit refusal of any non-ASCII byte in ls-tree output, or `-c core.quotePath=true` and an assertion), shared test vectors in both self-tests.

### F8 — MEDIUM — receipts bind worktree bytes, not the HEAD blob
- Pointer: round `countWitness` (≈L950–L1000) and user `countWitness` (≈L765–L810), `codeSha256 = sha256(readFileSync(script))`, printed next to `codeRevision = HEAD`.
- Consequence: a dirty worktree can produce a receipt whose digest is not the HEAD blob it claims. The lesson requires "both gate source digests and exact measured revision must match retained execution receipts."
- Fix: refuse unless `git status --porcelain -- scripts/check-*-round-contract.mjs` is empty and `sha256(worktree) == sha256(git show HEAD:<path>)`; print `code-sha256` from the HEAD blob.

### F9 — MEDIUM — round canary is weaker than user canary; refusal matrix is thin
- Round count-witness and self-tests use `tee` only. User adds `| sh -c 'touch MARKER'` (user self-test `malicious_shell_stage_refused`), which proves arbitrary code. The legacy prefilter accepts that shape (no forbidden character), so it is a valid red-before arm.
- Missing refusal cases in round (each with `no_marker`): `sh -c`, `>` redirect, `$(…)`, backticks, `&&`, quoted `'|'` (F2), `grep -v`, `grep -f <file>`, leading-dash bare token, rev token `HEAD` or `<sha>:path`, unbalanced quote, tab inside command.
- Missing in user: `missing_revision_red` exists; add quoted-`|`-equivalent (`'|'` cannot be a user pattern, so this case proves the regex whitelist), `>` redirect, `$(`, backtick.

### F10 — LOW — round production run exercises all ten rows; the evidence is strong, keep it
- Round production (`node scripts/check-round-contract.mjs`) runs `runCount` on all ten real rows. The committed round-13 receipt `corpus/evidence/round-13/round-production-final.json` (exit 0, ten `ROUND id=…` lines) is the historical oracle. Compare `before`, `after`, `measured-against` field-by-field.

## Evidence required beyond static no-bash grep (E1–E8)

- E1 execve trace on new production runs: `strace -f -e trace=execve -o <file> node scripts/check-round-contract.mjs` (and the user clone run). Expected: zero `execve` of `/bin/sh`, `/usr/bin/sh`, `/usr/bin/bash`, `/bin/bash`; only `node` and `git`.
- E2 red-before arm: `--count-witness` of each gate (round: rev `1212207`, blob `43db9f4b`; user: rev `bebe2ef`, blob `7df3ee9`) run under `strace`. Expected: old arm creates marker, shows bash/sh execve; new arm: marker absent, `missing_score` or `score_mismatch` per F6 mapping.
- E3 canary with arbitrary code: both gates, `| sh -c 'touch MARKER'` and `| bash -c 'touch MARKER'` in old and new arms (F9).
- E4 real-row counts: round production (10 rows) matches `round-13/round-production-final.json` field-by-field; user clone run (6 rows, `--expect 6`) matches a one-time legacy `7df3ee9` run in the same scratch clone.
- E5 negative counts: one mutated row per gate (`after: 2`) → `score_mismatch`, exit 1, same mutation under legacy → same result (confirms value-check semantics preserved).
- E6 digest chain: `sha256sum scripts/*.mjs` = `git show HEAD:…|sha256sum`; `ROUND14_CUTOVER_DIGEST_PENDING` absent from the committed user gate; every blob in `92d700d..HEAD` for the round gate is in the user gate's archived or accepted list (F1 fixed).
- E7 SHONEN / census / HARD_BASELINE / PSTACK_PIN constants unchanged: `git diff bebe2ef -- scripts | grep -E 'HARD_BASELINE|PSTACK_PIN|CENSUS_SHA256|SHONEN_SEED'` shows no change to those constants.
- E8 missing-revision: a row whose rev does not exist → explicit `score_mismatch` (not silent `0`), matching `corpus/lessons/round-14.md` L13 ("a missing Git revision is an explicit failed count, not legacy last-pipeline-stage silent 0").

## Exact script digest / runtime / production red — expected outcomes

| Run (HEAD = the commit that carries the new round gate AND the user pin) | Expected |
|---|---|
| `node scripts/check-round-contract.mjs --self-test` | `ROUND_CONTRACT_SELFTEST verdict=clean`, every case PASS, marker cases `no_marker=1` |
| `node scripts/check-user-round-contract.mjs --self-test` | `USER_ROUND_CONTRACT_SELFTEST verdict=clean` |
| `node scripts/check-round-contract.mjs` (production) | exit 0; `ROUND id=pstack-20261015-r01…r10` with before/after = 0→1, 0→2 (r02), 0→4 (r03), 0→1 (r04–r10); `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` |
| `node scripts/check-user-round-contract.mjs` (production) | exit 1; stderr exactly `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10` (NOT `history_rewritten`, NOT `could_not_evaluate`) |
| user clone `--expect 6` (E4) | exit 0; `ROUND id=user-20261015-r01…r06` with before 0, after 1 each; `USER_ROUND_CONTRACT verdict=clean rounds=6` |
| `--count-witness` (E2) | `PASS` for both, marker old=1 new=0 |
| `--witness 75e7836` (round) | `ROUND_CONTRACT_WITNESS … result=PASS` (legacy blob b2eb8316) |
| user `--witness <rev with blob 18e2c79>` | `USER_ROUND_CONTRACT_WITNESS … result=PASS`, `code-sha256` = HEAD blob sha |

Exact counts (SCORECARD.md L242–L378, all `before: 0`; `after` from SCORECARD): round r01 1 (f5c8f31), r02 2 (6a91f68), r03 4 (a19c6a9), r04 1 (3e3ba9e), r05 1 (2e4cba0), r06 1 (ef51ded), r07 1 (ec5ee4b), r08 1 (472bfc3), r09 1 (e3c5bae), r10 1 (4e75a17). User r01 1 (95ea5f8), r02 1 (59ba8da), r03 1 (8a869af), r04 1 (982e3b2), r05 1 (c6fb0d5), r06 1 (1229098). All 16 measured SHAs resolve to commits (`git cat-file -t` = commit).

## Digest sequencing (must hold at the single commit)

1. Freeze `scripts/check-round-contract.mjs`. No further edits after step 3.
2. Commit it; `git show HEAD:scripts/check-round-contract.mjs | sha256sum` → write into the user gate as the CURRENT identity, and add `6f9eddc7…` (F1) to the archived set.
3. Commit user gate change in the same commit (no separate follow-up commit for the pin).
4. Re-check `git status --porcelain scripts/` empty before any receipt.
Any later round-gate edit requires a new user-gate pin and a new receipt. Do not record a worktree digest as the pin (F8).

## L1 verification commands (describe only; not run by this seat)

1. `git status --porcelain && git rev-parse HEAD`
2. `node scripts/check-round-contract.mjs --self-test`
3. `node scripts/check-user-round-contract.mjs --self-test`
4. `node scripts/check-round-contract.mjs` → compare ROUND lines with `corpus/evidence/round-13/round-production-final.json` stdout.
5. `node scripts/check-user-round-contract.mjs` → exact stderr in the table above.
6. `node scripts/check-round-contract.mjs --count-witness 1212207`
7. `node scripts/check-user-round-contract.mjs --count-witness bebe2ef`
8. `node scripts/check-round-contract.mjs --witness 75e7836`
9. `git clone --no-hardlinks -q . /var/tmp/c1-user-clone && node scripts/check-user-round-contract.mjs --repo /var/tmp/c1-user-clone --baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c --expect 6`; then the same with `git show bebe2ef:scripts/check-user-round-contract.mjs > /var/tmp/c1-legacy-user.mjs` against the same clone → diff the six ROUND lines. Scratch only; remove afterwards.
10. `strace -f -e trace=execve -o /var/tmp/c1-round.strace node scripts/check-round-contract.mjs` and the same for the user clone run; then count shell `execve` lines (must be 0).
11. Mutation probe in the clone: `after: 2` on one user row → `score_mismatch`; `| sh -c 'touch MARKER'` → `missing_score`, no marker.
12. `git log --format=%h 92d700d..HEAD -- scripts/check-round-contract.mjs` → each blob sha256 ∈ archived ∪ accepted.

## Rejected shortcuts (cosmetic or semantic reduction)

- Lookup of the sixteen historical strings → precomputed counts. Rejected: the count must come from git bytes.
- A `startsWith('git ')` + denylist prefilter as the only defense (it is still in parseScore L296, keep it as defense in depth only).
- A literal-substring match in place of BRE (`example.domain` must match `examplexdomain`; probe above).
- Static removal of the word `bash` (lesson `round-14.md` L9: "Static removal of the word bash alone is not evidence").
- Blanket digest exemption or a second cutover without the explicit archived list (QUALITY16).
- Running the legacy gates against the production SCORECARD to obtain oracles (use scratch clones only).

## Residual risk and gaps

- Legacy witness arms still execute bash on fixture-generated commands by design; acceptable only in `/var/tmp` scratch with marker files. Not a SCORECARD path.
- `grep` is invoked through the GNU binary in legacy; new evaluator may not match if LANG/LC_ALL differs. Pin `LC_ALL=C` for ls-tree paths (ASCII-only) and record the locale in receipts.
- USER validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` is outside the repo and unpinned (exists, 95076 bytes, 2026-10-19). Clone runs depend on it; record its sha256 in the receipt.
- Pre-existing debt noted by round-13 reviewers stays uncredited: r07 survivor replay, user record freezing, IPv6 origin classification, external validator pin.
- Non-author verification is not provided by this seat; this is an author-side advisory review.
