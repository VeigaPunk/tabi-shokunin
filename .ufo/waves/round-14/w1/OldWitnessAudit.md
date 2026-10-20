# OldWitnessAudit — round-14 w1 (read-only, author-side)

Scope: old `--witness` interfaces of the two round gates, identity binding for a future repaired revision, and the C1 constraint on SCORECARD command execution. No gate was executed, no file was edited. Reports are advisory author-side, not non-author verification.

## 1. Filenames discovered

- Glob `scripts/check-*-round-contract.mjs` → one hit: `scripts/check-user-round-contract.mjs` (790 lines). This is the **user** gate.
- Glob `**/check-round-contract.mjs` → one hit: `scripts/check-round-contract.mjs` (747 lines). This is the **round** (pstack) gate. It has no `check-*-` infix, so the requested pattern does not match it.
- Named by gate constants but not globbed by me (existence unverified): `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`, `scripts/check-freshness.mjs` (user L54-56), and external `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (user L33, invoked at user L202).

## 2. Identity snapshot (read-only hashing; no gate run)

| Item | Observed | Relation |
|---|---|---|
| `scripts/check-round-contract.mjs` sha256 | `8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d` | equals user L22 `ROUND_SCRIPT_CUTOVER_SHA256` |
| same file, git blob | `43db9f4bba56a27114ed116c85f27b80227e74bd` | blob exists; `git cat-file -p 43db9f4b` contains `witness(rev)` (L704) and `runCount` (L292), i.e. it is the working-tree gate |
| `scripts/check-user-round-contract.mjs` sha256 | `690661217f4ba3fb47a416611d7e45bfcb2440fc093123a25efb97ab63f32171` | not pinned by either gate |
| same file, git blob | `7df3ee9f4df6db3c36c886f9173715bc299ce43a` | not pinned by either gate |
| round `LEGACY_GATE_BLOB` (round L38) `b2eb8316f41cd1039330e45f6739c07c5f11eace` | blob exists | pre-witness gate: no `witness`, `runCount` at L164, `check` at L279 calls it at L301-302 |
| user `LEGACY_USER_GATE_BLOB` (user L31) `18e2c79ada4258cc46af7696e98907299b77c431` | blob exists | pre-witness gate: `checkHistory` L103, `runCount` def L175, calls L359-360 |
| `ROUND_SCRIPT_PRIOR_SHA256` (user L21) `7d403cee…` | not recomputed (no blob for it checked) | — |
| HEAD | short `bebe2ef` | `HEAD:<path>` lookups were not verified (my `rev-parse` call was malformed); treat as unverified |

## 3. Witness interfaces to preserve

**Round gate** (`scripts/check-round-contract.mjs`)
- Argument rule: `--witness REV` must be the only argument (`argv.length === 2`) and REV must match `^[a-f0-9]{7,40}$` (L198-199). Violations → `usage`, exit 2. `--self-test` must also be the only argument (L197).
- `witness(rev)` (L704-736): resolves `blob(defaultRoot, rev, 'scripts/check-round-contract.mjs')` (L705) and requires it to equal `LEGACY_GATE_BLOB` (L706). No `^{commit}` peel.
- Old arm: the bytes at REV are copied to a `/var/tmp` scratch file and run on a shared fixture (L707-721).
- New arm: the running `script` (the working-tree file) runs on the same fixture (L721).
- PASS (L726): old exit 1, old finding `history_rewritten`, new exit 0, new verdict `clean`.
- Output (L727): `ROUND_CONTRACT_WITNESS fixture=shared old_rev=<raw input> old_exit=… old_finding=… new_exit=… new_verdict=… result=…`. Prints neither a new blob nor a sha256.

**User gate** (`scripts/check-user-round-contract.mjs`)
- Argument rule identical in shape (L230-233); `--pstack-pin` is an extra flag (L226). `witness` dispatches before `selfTest` (L783).
- `witness(rev)` (L629-665): `rev^{commit}` (L630); the blob at `scripts/check-user-round-contract.mjs` must equal `LEGACY_USER_GATE_BLOB` (L631-634), else `witness_failure`, exit 2.
- Old arm: legacy bytes are written to a `/var/tmp` scratch file and run; new arm: the running `script` (L646-650). PASS at L653-657.
- Output (L658-660): includes `rev=${commitRev}` (the legacy arm commit) and **`baseline=${baseline}` (L660), which is the SHA of a fixture commit created at run time** (see F4).

**Verdict/finding grammar**: round `fail()` default exit 1; `usage` and `could_not_evaluate` exit 2. User witness mismatch uses `witness_failure` exit 2 (L633) while the round witness mismatch uses exit 1 (L731). Preserve these exactly.

## 4. Findings (severity order)

**F1 — High (C1 blocker): two SCORECARD command families; the witness new arm executes one of them.**
- Production measurements are all of the form `git ls-tree -r --name-only <40hex> | grep <pat> [| grep <pat>] | wc -l`: SCORECARD.md L242, 250, 258, 266, 274, 282, 290, 298, 306, 314 (round) and L336, 344, 353, 361, 369, 377 (user). These count **tree paths**, not blob lines.
- The round witness fixture uses a different form: `git grep -h '^marker: admitted-round$' <sha> -- round-marker.txt | wc -l` (round L507, written by `writeGoodFixture` L446-526). This counts **matching content lines** with BRE `^`/`$` anchors.
- The old arm never reaches `runCount` (legacy checkHistory fails first, see F5). The new arm does: `checkHistory` passes on the canonical SHONEN, then `parseScore` → `runCount` runs for the fixture (L411-430). A repaired gate that only accepts the ls-tree form fails the witness new arm. Either the grammar covers both forms, or the fixture changes (which changes witness evidence; L1 decision).
- The goal's phrase "exact historical git-blob line-count semantics" fits only the `git grep -h` form. The production ls-tree form counts paths. The spec should name both families.

**F2 — High (C1 operability): the command gate is a blocklist, not an allowlist.**
- Round L279-280 and user L303-304: the command must start with `git ` and must not contain `; & \` < > \n \\` or `$(`/`${`. **`|` is not blocked**, so `git ls-tree … | sh` (or `| bash`, `| xargs …`) passes `parseScore`.
- The accepted string is then run by `spawnSync('bash', ['-c', command])` (round L293, user L311; legacy b2eb83 L165; 43db9f4b L293). Any SCORECARD line therefore executes arbitrary shell as the gate.

**F3 — High (coupling; needs an explicit L1 decision): repairing the round gate invalidates the user gate's pin.**
- User `PSTACK_PATHS` includes `scripts/check-round-contract.mjs` (user L53). `pstackDrift` (L204-205) calls `acceptedRoundScript` (L176-189), which accepts only sha256 ∈ {prior `7d403cee…`, cutover `8478cd43…`}. Any C1 edit to the round gate yields a third digest → production user check fails `history_rewritten`.
- Clearing it requires replacing `ROUND_SCRIPT_CUTOVER_SHA256` in the user gate. That is a second cutover, contrary to "the one lane-owned tooling cutover accepted after PSTACK_PIN" (user L14-16) and to the "policy/self-blessing redirect" guard (user L15-16). L1 must either approve a second cutover explicitly (recording old/new sha256 and the user-gate constant change in the same commit) or reject the round-gate edit.
- Comment mismatch to fix in the same cutover: user L18-20 says the prior digest is "the blob at PSTACK_PIN" and the cutover is "git blob 43db9f4b", but the constants are sha256 of bytes.

**F4 — Medium (scratch-ID overclaim and binding).**
- User witness line L660 prints `baseline=<fixture commit SHA>`. `writeGoodFixture` commits at run time, so that SHA depends on the clock and is not reproducible. It must not read as a baseline or production identity. Rename it to fixture-local, or drop it.
- In both witnesses the new arm is the running file, so PASS certifies "whatever bytes are running" and never names them. Recommend both witness lines print `new_blob=<sha1("blob "+len+"\0"+bytes), computed in-process>` and `new_sha256=` of the running gate. This binds the evidence line to the bytes without a git call.
- A gate cannot self-pin its own blob (its bytes contain the constant). The repaired-revision binding therefore stays external: L1 records `git rev-parse <commit>:scripts/check-round-contract.mjs`, and the existing user-gate constant (F3) is the only in-repo pin.
- Round prints `old_rev=${rev}` (raw input); user prints `rev=${commitRev}` (resolved). Keep both as they are.

**F5 — Medium (preserve): witness resolution and red-arm reason.**
- Round: `blob(rev:path)` without peel (L705); user: `rev^{commit}` (L630). Do not unify silently.
- Round legacy red arm: b2eb83 contains an unconditional `if (!census) fail('history_rewritten', 'Baseline census is not committed')` (grep line 107 of the blob; surrounding context not read). The fixture has no census, so the old arm fails in `checkHistory` before any `runCount`. [INFERENCE: holds because the old arm's red finding is that census line; read b2eb83 L100-110 to confirm.]
- Current round `censusEntries` (L165-169) returns null for non-production fixtures with no census, so the new arm is unaffected.
- Consequence: C1 changes to `runCount`/`parseScore` cannot change the old arm's red finding. They do affect the new arm (F1).

**F6 — Medium (decision): silent masking of producer failure.**
- `runCount` (round L292-296; user L310-314) takes pipeline status from `wc -l` (no `pipefail`). A failing `git ls-tree`/`git grep` (e.g., an unknown measured revision) yields empty stdout → `"0"` with status 0. `list()` (round L77-81) similarly returns `[]` on git failure.
- Preserving exact legacy counts means reproducing this silent `0`. Fail-closed (`score_mismatch`) is a behavior change that can only turn a silent pass into a red. L1 must choose and say so in the commit message.

**F7 — Low: external dependency inside the user gate.**
- `checkSpec` (user L202) executes the absolute external validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (L33). It runs on the production path and inside the user witness new arm (`check()` → `checkSpec` at L486). Witness and production both depend on that sibling checkout. Out of C1 scope; noted as a boundary.

## 5. Constraint for a C1 replacement (for L1 to approve; not implemented)

- Remove `spawnSync('bash', ['-c', …])` from both gates. Parse the SCORECARD command against a strict grammar and fail `missing_score` on anything else. Accept exactly:
  - A: `git ls-tree -r --name-only <40hex> | grep <pat> ( | grep <pat> )* | wc -l`
  - B: `git grep -h <pat> <40hex> -- <path> | wc -l` (the fixture form)
- Run git via `spawnSync('git', argv)` with argv built from the parsed tokens (no shell). Count lines with an exact `\n` count, which is `wc -l` semantics. `git grep` exit 1 (no match) → 0; other non-zero → fail (or keep the legacy silent `0` if F6 is resolved that way).
- Patterns: BRE semantics. Form A filters ls-tree names in-process with a RegExp converted from the BRE token (escape everything except `.`, keep `^`/`$`). Form B passes the pattern as an argv element to `git grep`.
- Keep finding names (`missing_score`, `score_mismatch`), exit codes, the `--witness` argument rules, and both witness output prefixes.

## 6. Commands L1 should run after all seats land (not run by me)

1. `node scripts/check-round-contract.mjs --self-test`
2. `node scripts/check-user-round-contract.mjs --self-test`
3. Round witness: find a commit C with `git rev-parse C:scripts/check-round-contract.mjs` = `b2eb8316…` (`git log --format=%H -- scripts/check-round-contract.mjs`), then `node scripts/check-round-contract.mjs --witness C`.
4. User witness: find a commit C with `git rev-parse C:scripts/check-user-round-contract.mjs` = `18e2c79a…`, then `node scripts/check-user-round-contract.mjs --witness C`.
5. Production: `node scripts/check-round-contract.mjs` and `node scripts/check-user-round-contract.mjs`. Expect `ROUND_CONTRACT verdict=clean rounds=10` and `USER_ROUND_CONTRACT verdict=clean rounds=10`. Run after any F3 pin change.
6. Confirm removal: `grep -n "spawnSync('bash'" scripts/check-round-contract.mjs scripts/check-user-round-contract.mjs` must print nothing.
7. Re-hash the round gate: `sha256sum scripts/check-round-contract.mjs` must equal the constant the user gate pins (F3), or the pin change must be in the same commit.

## 7. Tooling

No tools installed or updated. Read-only operations used: glob, read, grep, `sha256sum`, `git hash-object`, `git cat-file -t`/`-p` on blobs. No gate was executed. No file was modified.

## 8. Not assessed

- C2 (round13 cleanup/Node metadata sidecar) — outside this assignment.
- The 1212207f commit and the 16 SCORECARD lines were not enumerated against user r04 (no user r04 command line appeared in my grep).
- Whether a witness new arm run reaches `checkSpec`/`VALIDATOR` in practice (F7 is inferred from code order).
