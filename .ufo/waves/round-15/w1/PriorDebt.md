# PriorDebt — retained USER debt exact qualifiers (round-15 w1)

Author-side, read-only audit. Not non-author certification. No gate, counter, selftest, test, suite, browser, or source edit was executed or made. No tools were installed or updated.

Commands used (read-only): `read`/`grep` over `scripts/check-user-round-contract.mjs`, `scripts/check-round-contract.mjs`, `corpus/lessons/round-14-verifier-spotcheck.md`, `SKILL.md`, `LOG.md`, `SCORECARD.md`; `git ls-tree`, `git log --oneline -- <r07 paths>`, `git show 7f506af:SCORECARD.md | grep -c`, `git rev-parse` / `git ls-tree` on the external validator repo; `sha256sum` and `stat` of the external validator; JSON field read of `corpus/evidence/user-20261015-r02/public/capture.json`.

## 1. Retained wording (exact, quoted)

| Source | Exact text |
|---|---|
| `corpus/lessons/round-14-verifier-spotcheck.md:189` | "USER remains red6/10; r07 survivor replay, user-record freezing, IPv6 classification, Git environment/hooks/config trust and external-validator pinning remain uncredited." |
| `corpus/lessons/round-14-verifier-spotcheck.md:112` | "Broader shell/environment/trust and legacy survivor-replay debts remain uncredited." |
| `SKILL.md:1682-1684` | "The existing survivor-replay, user-record-freezing and public-origin-classification gaps are separately retained in `.ufo/waves/round-13/w1/ReviewUser.txt` and `SafetyHistory.txt`; the bounded compatibility claim does not certify those paths." |
| `SKILL.md:1725-1727` | "This is not certification that arbitrary repositories or Git environments are safe. Survivor-replay, unfrozen user records, IPv6 origin classification and the external-validator pin remain separate debt." |
| `SKILL.md:1736` | "The honest production USER6/10 failure remains; expected10 is unchanged." |
| `SKILL.md:1678` (registry row) | "inherited six-of-ten `round_count` is still failed, not a successful compatibility repair verdict" |
| `LOG.md:733-734` | "broader r07 survivor replay, user-record freezing, IPv6 origin and external-validator pin debt remain uncredited." |
| `LOG.md:464-476` | "user-20261015-r07: executed, unadmitted, recorded without credit" (receipt byte-identical to r01) |

Qualifier set to carry forward (use these words, no upgrade): **USER 6/10 red (round_count 6≠10)**; **r07 survivor replay — open, uncredited**; **user-record freezing — open**; **IPv6/public-origin classification — open**; **Git environment/hooks/config trust — open (not named in SKILL.md; named only in round-14 verifier :189 and :112)**; **external-validator pin — open**. None is credited. Counts stay at the user-20261015-r06 row.

Discrepancy to keep visible: `SKILL.md:1680-1681` says the legacy gates "execute lane-authored SCORECARD counting commands through a shell". The delivered USER `runCount` no longer does (`scripts/check-user-round-contract.mjs:396-418`, argv via `spawnSync('git', …)`). That sentence is historical and should stay labelled as legacy; do not restate it as current.

## 2. Verified facts (read-only)

- Baseline `7f506affa55f6fb892d3c8073c75151c998bdf2c`: zero `user-20261015` paths under `corpus/lessons`, `reports`, `corpus/evidence`; zero `user-round:` blocks in `SCORECARD.md`. Every user record is post-baseline and therefore outside any baseline freeze.
- HEAD user lessons: r01–r06 only. `reports/user-20261015-r07.md` and `corpus/lessons/user-20261015-r07.md` absent.
- r07 evidence exists only from commit `2676cc8` ("Admit user-20261015-r07 evidence and gate.", 37 files). `corpus/evidence/user-20261015-r07/` at HEAD: `aggregate.json`, `dispatch.json`, `slices.json`, `spec.json`, `operability/selftest-receipt.txt`, `seats/s01..s32/result.json`.
- Blob identity at HEAD: `corpus/evidence/user-20261015-r01/operability/selftest-receipt.txt` and `…/user-20261015-r07/operability/selftest-receipt.txt` are both `a09039f51f7071b60f135256aad4dced2eb631be`. `…/seats/s26/result.json` in r01 and r07 both `f5c4f6f1671c20914f993f84420672047c33f748`.
- `corpus/evidence/user-20261015-r02/public/capture.json`: `class: public-observation`, `url: https://example.com/`, `consequential: false`; requests GET only. This is the only user public capture in the tree; it is non-loopback.
- External validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`: 95076 bytes, mtime 2026-10-19 19:02, sha256 `1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a`, git blob `bd3a016a776a1ab30b418614c67b67b7041d1306` at repo HEAD `2cad7085f5e50bd590ef94f41064b91adb26cf43`, `git status` clean for that path. Currently no digest pin in the gate. Record this as the observed identity only; it is not a credit.
- Lane git: `git 2.55.0`. Shell env sets only `GIT_EDITOR`, `GIT_PAGER`, `GIT_TERMINAL_PROMPT`. No `refs/replace` entries. These are observations of this host, not of the gate's guarantees.

## 3. Defects and anchors

All anchors: `scripts/check-user-round-contract.mjs` unless stated.

### D1 — r07 survivor replay (open; route is live)
- Anchors: `:315-320` `roundIds` reads HEAD `corpus/lessons` only, no round-ID allowlist or tombstone; `:580-584` count and sequence checks pass for r01..r07; `:378-394` `parseScore` trusts the SCORECARD block's `measured-against` if it is a commit and the command's rev equals it; `:501-514` `checkReport` needs `lane-commit: <measured>` and the report absent at `measured`; `:536-541` `sameTree` compares HEAD to `measured` only; `:470-499` `checkSwarm` checks internal consistency of aggregate/seat files, not provenance.
- Replay: add lesson `corpus/lessons/user-20261015-r07.md` (axis operability, admit/reject lines, one spot-check), a SCORECARD block with `before: 0`, `after: 1`, `measured-against: 2676cc8…`, command `git ls-tree -r --name-only 2676cc8 | grep user-20261015-r07/operability/selftest-receipt.txt | wc -l`, and `reports/user-20261015-r07.md` with `lane-commit: 2676cc8`. The `before`=0 holds at baseline (zero user evidence there). `:595` `log.includes(id)` is already satisfied by the LOG entry at `LOG.md:464`.
- Exposure: production stays red at `round_count` (7≠10), so the risk is a false admitted credit and a fabricated trend, not a green verdict.
- Gaps: no cross-round blob uniqueness (receipt blob `a09039f5` is already credited to r01); `measured-against` is author-chosen after baseline; `log.includes(id)` matches rejection text.
- Proposed fixture tests (isolated `--repo`, not production):
  1. r07-replay fixture with the above lesson/SCORECARD/report → expect exit 1 with a new finding (proposed `evidence_reused`).
  2. Synthetic round whose operability receipt blob equals a prior round's → expect `evidence_reused`.
  3. `log.includes` fixture where LOG mentions the id only in a rejection line → expect `missing_score` once the LOG check is tightened.
- Proposed fix: explicit round-ID list with r07 tombstoned as rejected; reject evidence blobs already present in an earlier round; require `measured-against` to be a commit strictly after the round's own evidence was first created.

### D2 — user-record freezing (open; wider than r07)
- Anchors: `:124-133` `protectedPath` has no `user-20261015` paths; `:56` `LEGACY_LESSON = /^corpus\/lessons\/round-\d+\.md$/` excludes `user-20261015-rNN.md`; `:240-251` `pstackDrift` returns false for user lessons, reports, and evidence; `:230-238` `lessonDrift` only reached for round-N lessons; `:72` `APPEND_ONLY` checks SCORECARD/LOG only as a prefix of the baseline bytes (none user-related there); `:379` `parseScore` uses the first matching `<!-- user-round:` block, so a later duplicate is silently ignored; `:551-552` non-matching class/consequential captures are silently skipped; `:511-512` SHONEN presence check accepts `[x]`.
- Concrete unfreezing: user lesson `axis` can be relabelled together with its SCORECARD block (count values depend only on the command, not the label); evidence can be rewritten if `measured-against` is moved to the rewritten commit (`sameTree` then passes); user LOG/report text is unconstrained.
- Proposed fixture tests:
  1. Relabel `axis` in a user lesson and SCORECARD block with unchanged counts → expect a new finding (proposed `record_drift`).
  2. Rewrite a user evidence file and move `measured-against` to the rewritten commit → expect failure.
  3. Duplicate `<!-- user-round:…` block with a different `after` → expect failure, not silent first-match.
- Proposed fix: freeze the user record set (lessons, reports, evidence, SCORECARD user blocks) by a committed per-round blob manifest pinned at an explicit admitted commit, analogous to the census used by `check-round-contract.mjs:182-261`.

### D3 — IPv6 / public-origin classification (open)
- Anchors: `:553-556` `new URL(capture.url)` then `host === 'localhost' || host === '127.0.0.1' || host === '::1'`. WHATWG URL serializes IPv6 hostnames with brackets, so `[::1]` never equals `'::1'`. Per round-13 `ReviewUser.txt` F8 (recorded there as verified; not re-executed here).
- Not rejected: `[::ffff:7f00:1]` (mapped loopback), `0.0.0.0`, any `127.0.0.0/8` other than `127.0.0.1`, `localhost.`, `*.localhost`, `[::]`.
- `:568-569` request URLs are not host-checked; `capture.url` is self-reported.
- `:551-552` `consequential: true` with `class: public-observation` is silently skipped, not failed.
- Sibling defect: `scripts/check-round-contract.mjs:557` has the identical literal comparison (out of this slice; cross-reference only).
- Proposed fixture tests (expect `public_observation`, exit 1):
  1. `url: http://[::1]:8080/`, class `public-observation`, `consequential: false` → must fail (currently clean at expect=1).
  2. `url: http://0.0.0.0/` and `http://127.0.0.2/` → must fail.
  3. `url: http://localhost./` → must fail.
  4. `url: https://example.com/`, `requests[0].url: http://[::ffff:7f00:1]/` → must fail.
  5. `class: public-observation`, `consequential: true` → must fail, not skip.
- Proposed fix: `isLoopbackOrUnspecified(host)` that strips brackets and covers `::1`, `::`, `::ffff:` mapped loopback, `127.0.0.0/8`, `0.0.0.0`, `localhost` and `*.localhost` with optional trailing dot; apply it to `capture.url` and every `requests[].url`; fail on non-observation classes that carry `consequential: true`.

### D4 — external-validator pin (open)
- Anchors: `:57` `const VALIDATOR = '/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs'`; `:441-445` `spawnSync(process.execPath, [VALIDATOR, 'plan', …], { cwd: '/home/vgpnk/Projects/ufo-fsd-alpha', … })` with no `env`, no digest check, no git-blob check; `:449` accepts validator output schema/counts only.
- Effect: a changed validator can accept any 32-member spec; the gate is not portable (absolute operator-local path), fails closed on absence (`short_swarm`).
- Observed identity (not a pin): sha256 `1d33a03f…09d0`, blob `bd3a016a…` (see §2).
- Proposed tests: (1) a self-test asserting the validator bytes equal a committed `VALIDATOR_SHA256` constant (production path) → mismatch exits 2 `could_not_evaluate`; (2) a fixture-only `--validator` override with a wrong digest → exit 2, no spawn.
- Proposed fix: constant `VALIDATOR_SHA256` checked before spawn; receipt records sha256 and git blob; child env scrubbed (see D5).

### D5 — Git environment / hooks / config trust (open)
- Anchors: `:96-98` `git()` → `spawnSync('git', args, { cwd: root })` inherits the full environment and resolves `git` via `PATH`; `:403` `runCount` spawns `git` with the same inheritance; `:402` `git grep -h -e <pattern>` without `-G`/`-F`, so `grep.patternType` (repo-independent global config) changes pattern semantics; `:139-142` comment says refs/replace must not split blob identity but no `GIT_NO_REPLACE_OBJECTS` is set; `:235` `git log` inherits env; `:287` `merge-base` inherits env.
- Concrete risks: `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` in the caller's env redirect reads; `refs/replace/<commit>` changes `ls-tree`/`log` output for a counted commit; `grep.patternType=fixed` or global config changes count (fails closed, but nondeterministic).
- Proposed fixture tests (isolated, not production): (1) `GIT_CONFIG_GLOBAL` setting `grep.patternType=fixed` → deterministic result matching BRE grammar or explicit fail; (2) `refs/replace` on a counted commit in a fixture repo → count must be unaffected with `GIT_NO_REPLACE_OBJECTS=1`; (3) `GIT_DIR` pointing to another repo → `could_not_evaluate`.
- Proposed fix: one `gitEnv()` helper (scrubbed: `GIT_NO_REPLACE_OBJECTS=1`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, unset `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_REPLACE_REF_BASE`, `GIT_NAMESPACE`, fixed `PATH`), pass `-G` explicitly in grep counts, and resolve `git` to an absolute path once.

### D6 — USER 6/10 red (retained; no credit)
- Anchors: `:277-280` production forces `expect === 10` and the fixed baseline; `:580` `round_count` fails at 6; `SKILL.md:1736` retains the failure.
- No test or edit is proposed to change the scalar. D1 would move 6→7 (still red), not green.

## 4. Cross-lane notes (not owned here)
- `scripts/check-round-contract.mjs:557` has the same IPv6 literal bug (D3).
- `scripts/check-round-contract.mjs:296` admits `|` in counting commands (only `[;&`<>\n\\]` and `$(`/`${` are refused); `:298` checks only `measured-against` shape. Round-13 `ReviewUser.txt` F3 records the same. Whether ROUND's record freezing matches D1/D2 was not audited in this slice.

## 5. Owners / messages
- Code-related findings D1–D5 are in `scripts/check-user-round-contract.mjs`, owned by `CounterDiagnostics`. Message sent to `TabiR15.CounterDiagnostics` with the anchors above.
- `MetadataEnforce` (ARIA) has no overlap with these debts; not messaged.
- Coordinator summary sent to `TabiR15`.

## 6. Checks for L1 after integration (not run here)
- Fixture-only self-test lines for D1–D5 as listed; production run is expected to remain red at `round_count` (6 ≠ 10).
- Do not change `expect` or the production baseline.

## 7. Out of scope / not performed
- No edit to any source, SCORECARD, LOG, lesson, report, or evidence file.
- No execution of `check-user-round-contract.mjs`, `check-round-contract.mjs`, selftests, the external validator, `measure.mjs`, or any browser.
- No access to `~/.omp/agent/agent.db*`, credential/auth files, or sibling MANIFEST/fleet files.
