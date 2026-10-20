VERDICT: PASS

# Tabi round-17 wave-1 — harm baseline (all SKILL.md registry entry points)

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` measured at 2026-10-20 on a
throwaway sandbox clone `/tmp/tabi-r17-harmbaseline-KZuI`: `git clone --no-hardlinks LANE S`,
`git checkout --detach 5859243…`, `git update-ref refs/heads/master 5859243…`,
`git symbolic-ref HEAD refs/heads/master`. Verified before/after every run:
`git rev-parse HEAD` = 5859243…, `git symbolic-ref HEAD` = refs/heads/master,
`git status --porcelain` empty. Host: node v24.21.0, git 2.56.0. No browser was launched;
no gate dirtied the sandbox; LANE was never written by a gate. The sandbox was removed after
measurement (no cited failure needed it).

Method: each entry ran **twice** with a Node `spawnSync` runner (timeout 900000 ms per run,
cwd=sandbox, inherited environment). The table records run 1; `determinism` compares run 1 vs
run 2 exit/stdout-sha256/stderr-sha256. Entries with a `*` on the sha are nondeterministic
(see below); every exit and verdict/result token was stable (the starred summary lines embed
volatile fixture ids by construction). No entry timed out (max runtime 5894 ms).

## Entries (20)

| # | entry / argv | exit | stdout B/L | sha256[:12] | ms | summary line |
|---|---|---|---|---|---|---|
| 1 | `check-round-contract-production`<br>`node scripts/check-round-contract.mjs` | 0 | 2227/11 | `25e664981805` | 2774 | ROUND_CONTRACT verdict=clean rounds=10 consequential=0 |
| 2 | `check-round-contract-self-test`<br>`node scripts/check-round-contract.mjs --self-test` | 0 | 3822/35 | `9d8f6d664b37` | 4346 | ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1 |
| 3 | `check-round-contract-witness`<br>`node scripts/check-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` | 0 | 169/1 | `c9f2c4116d69` | 338 | ROUND_CONTRACT_WITNESS fixture=shared old_rev=75e7836b6c3090180aee2754e20a5d3cfb186e74 old_exit=1 old_finding=history_rewritten new_exit=0 new_verdict=clean result=PASS |
| 4 | `check-round-contract-count-witness`<br>`node scripts/check-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` | 0 | 433/1 | `70ea401e2488` | 383 | ROUND_CONTRACT_COUNT_WITNESS fixture=shared exit=0 verdict=clean old_rev=bebe2efc4565bb068efd905e9ef78011bb6b4efd baseline=34a18d4fd6416397c384228afa926051ff3086f5 code_revision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 code_sha256=8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942 old_exit=0 old_verdict=clean old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch new_marker=0 head_stable=1 result=PASS |
| 5 | `check-user-round-contract-production`<br>`node scripts/check-user-round-contract.mjs` | 1 | 0/0 | `e3b0c44298fc` | 210 | USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10 |
| 6 | `check-user-round-contract-self-test`<br>`node scripts/check-user-round-contract.mjs --self-test` | 0 | 12247/43 | `649c47902277` | 5894 | USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1 |
| 7 | `check-user-round-contract-witness`<br>`node scripts/check-user-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` | 0 | 1344/3 | `987187473462*` | 351 | USER_ROUND_CONTRACT_WITNESS rev=75e7836b6c3090180aee2754e20a5d3cfb186e74 baseline=4dfd3edb56e40eaa4d579a2c249abcf098ba6c62 args=["--repo","/var/tmp/tabi-user-witness-3HDrn0/repo","--baseline","4dfd3edb56e40eaa4d579a2c249abcf098ba6c62","--expect","1"] measuredRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 codeRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 code-sha256=f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b new-sha256=f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b head-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 worktree-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 committed=yes old_exit=1 old_verdict=failed old_finding=history_rewritten new_exit=0 new_verdict=clean new_finding=null result=PASS |
| 8 | `check-user-round-contract-count-witness`<br>`node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` | 0 | 1856/3 | `3c2d28243e6c*` | 442 | USER_ROUND_CONTRACT_COUNT_WITNESS rev=bebe2efc4565bb068efd905e9ef78011bb6b4efd baseline=ab9dd83bb40d6b5ee12491cc07ba32ddb38c8f03 args=["--repo","/var/tmp/tabi-user-count-witness-AuvArq/repo","--baseline","ab9dd83bb40d6b5ee12491cc07ba32ddb38c8f03","--expect","1","--pstack-pin","c8eb28bfd0dbefc0d2ca1014b510591c65b79c7d"] measuredRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 codeRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 code-sha256=f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b new-sha256=f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b head-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 worktree-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 committed=yes marker=.user-round14-count-marker old_exit=0 old_verdict=clean old_finding=clean old_finding_source=synthesized_clean_verdict old_marker=1 old_marker_applicable=1 old_marker_outcome=present new_exit=1 new_verdict=failed new_finding=score_mismatch new_reason=unsupported_counting_command new_marker=0 new_marker_applicable=1 new_marker_outcome=absent result=PASS |
| 9 | `check-user-round-contract-diagnostic-witness`<br>`node scripts/check-user-round-contract.mjs --diagnostic-witness` | 0 | 2330/5 | `983d3d900ff0*` | 566 | USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS baseline=5c7710d7393112f2163dd7efcaa38fccf534dfc2 args={"wrongAfter":["--repo","/var/tmp/tabi-user-diagnostic-witness-75mAh8/wrong-after","--baseline","ff03fc0bcd47db1c34a1d8fdd542306bd03c89b2","--expect","1","--pstack-pin","d9780523fbb6d55b0765036258ee0d51befea963"],"missing":["--repo","/var/tmp/tabi-user-diagnostic-witness-75mAh8/missing-revision","--baseline","408fe3059733f81235a42c4a3398bd2a54d58d53","--expect","1","--pstack-pin","a6b3259c7eff30da0bb04c7203c88d7fb4e26424"]} measuredRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 codeRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 code-sha256=f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b baseline-blob=347ae9bbcdc692c3ad55fdfd931fa2cce13fec6d baseline-sha256=bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3 worktree-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 committed=yes wrong_reason=unsupported_counting_command expected_outcome=no-match wrong_match=0 reasonless_match=1 wrong_reason_only_match=0 correct_reason=after_count_mismatch correct_match=1 mutant_reason=after_count_mismatch mutant_reasonless_match=1 mutant_wrong_reason_only=0 mutant_decoy_match=1 baseline_predicate=synthesized_exit_finding baseline_synthetic_match=1 result=PASS |
| 10 | `check-freshness-worktree`<br>`node scripts/check-freshness.mjs --worktree` | 0 | 5035/35 | `6f99a3748382` | 135 | FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production |
| 11 | `check-freshness-witness`<br>`node scripts/check-freshness.mjs --witness 5859243183c4d7ac5429dfdb8a73ce0d9a43d583` | 0 | 5066/35 | `edd6804a4268` | 187 | FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production |
| 12 | `check-freshness-self-test`<br>`node scripts/check-freshness.mjs --self-test` | 0 | 1313/13 | `32d695996750` | 357 | FRESHNESS_SELFTEST verdict=clean cases=12 |
| 13 | `check-sources-production`<br>`node scripts/check-sources.mjs` | 0 | 124/1 | `9fcbfa799e4a` | 21 | SOURCES_GATE verdict=clean rows=40 tiers=A:31,B:4,C:5 status=queued:2,mined:33,rejected:5 findings=0 file=corpus/SOURCES.md |
| 14 | `check-sources-self-test`<br>`node scripts/check-sources.mjs --self-test` | 0 | 2688/27 | `8a1efa8b30d2` | 474 | SOURCES_SELFTEST verdict=clean cases=26 |
| 15 | `check-aria-metadata-check`<br>`node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 | 9881/2 | `215b2242d667` | 24 | ARIA_METADATA check verdict=clean findings=28 failed=0 accepted=true sidecar=corpus/evidence/round-14/aria-metadata/corrected.json input=corpus/evidence/round-14/aria-metadata/corrected.json reason=clean |
| 16 | `check-aria-metadata-self-test`<br>`node scripts/check-aria-metadata.mjs --self-test` | 0 | 66183/63 | `d6ae0b28d9cb` | 851 | ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4 |
| 17 | `check-aria-metadata-witness`<br>`node scripts/check-aria-metadata.mjs --witness` | 0 | 13543/2 | `d6c7b7584c7f` | 26 | ARIA_METADATA witness verdict=clean transition=red->clean red_exit=1 red_finding=R14-ARIA-CLEANUP-LISTENING-AFTER-01 green_exit=0 accepted=true original_unchanged=true reason=clean |
| 18 | `check-aria-metadata-witness-mirrors`<br>`node scripts/check-aria-metadata.mjs --witness-mirrors` | 0 | 2271/2 | `20482f5e63f0` | 29 | ARIA_METADATA witness-mirrors verdict=clean exit=0 baseline_exit=0 mirror_exit=1 mirror_accepted=false legacy_exit=0 legacy_executed=false original_unchanged=true reason=clean |
| 19 | `check-measurement-binding-self-test`<br>`node scripts/check-measurement-binding.mjs --self-test` | 0 | 7975/60 | `abff6ff1180e` | 2953 | MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13 |
| 20 | `check-measurement-binding-check-r16-at-1205d26-reproduce`<br>`node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at 1205d261776a349af99a5a205c7c2467fbabae16 --reproduce` | 0 | 51/1 | `89ac1fca3d02` | 5215 | MEASUREMENT_BINDING verdict=clean claims=2 bound=2 |

## Already red (expected, not a regression)

- `check-user-round-contract-production` exit 1, stdout 0 B, stderr 95 B
  sha256 `47e9ffdc4fa167e16d3635ee9aca74d30ea8f365dc571dc21b03566a3daada53`
  (byte-identical to the round-16 baseline observation): `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`.
  Only r01..r06 user lessons were ever committed; `expect=10` is hard-coded, so this is the
  inherited red, unchanged at 5859243.
- No other entry is red: 19/20 exit 0 (all self-tests, witnesses, `--worktree`, `--witness`
  with the 40-hex baseline, `check-sources`, aria modes, and the r16 measurement-binding
  `--check --at 1205d26 --reproduce` receipt).

## Nondeterminism across two runs (3 entries)

All three are user-contract witness modes. Exit, verdict/result and the `codeRevision=5859243…`
/`code-sha256=f9be3a72…` fields are stable; only volatile fixture identities differ:

- `check-user-round-contract-witness` — stdout differs in the random
  `/var/tmp/tabi-user-witness-XXXXXX/repo` path (printed in `args=`) and, when the pair
  straddles a wall-clock second, in the fixture `baseline` commit id (measured pair:
  `477522ca…` then `de982cb3…` after a 2 s gap; `git commit` timestamps are not pinned).
- `check-user-round-contract-count-witness` — same two sources: random
  `tabi-user-count-witness-XXXXXX` path and wall-clock-derived fixture `baseline`/`--pstack-pin`.
- `check-user-round-contract-diagnostic-witness` — random
  `tabi-user-diagnostic-witness-XXXXXX` path plus the missing-arm `--baseline`/`--pstack-pin`
  fixture ids (measured: `a916bfb1…` then `6e09c1e3…`). All differential match flags are stable.

## Not executed (deliberately out of this baseline's assignment)

- `check-aria-metadata --derive <receipt> <pin> --out PATH` — a write mode; this baseline is
  read-only. Its helper is covered by `--self-test` (36 CLI cases, 4 helpers).
- `check-measurement-binding --legacy <round-15 measurements.json> --at 36240c7…` — alternate
  manifest entry; the registered r17 receipt is the `--check corpus/evidence/round-16/... --at
  1205d26… --reproduce` run above (claims=2 bound=2). The pre-hardening `--legacy` receipt is
  routed evidence owned by RoutedHardened in PLAN.md.
- Optional flag variants (`check-sources --file/--since`, freshness `--repo/--expected`) are
  argument modifiers of the entries above, not separate registry entry points.

## Provenance pointers

- Receipt: `.ufo/waves/round-17/harm-baseline.json` (schema `tabi-round17-harm-baseline-v1`,
  20 gate entries, full stdout/stderr records, `protectedPaths`, `alreadyRed`).
- Gate script sha256 at baseline: round-contract `8a573b4e…`, user-contract `f9be3a72…`,
  freshness `93d19637…`, sources `afd04787…`, aria `d707625e…`, measurement-binding
  `1f84fb54…` (`check-measurement-binding.mjs` is the only gate script added between the
  round-16 baseline e38d259 and 5859243; the other five are byte-identical — every carried
  `protectedPaths` note therefore still applies).
- Independently observed baseline facts: freshness matched=34 unique=34 lane=31 public=3;
  sources rows=40 tiers=A:31,B:4,C:5 status=queued:2,mined:33,rejected:5 findings=0;
  measuredRevision=5859243… printed by the round witness modes.
- Tooling: none installed or updated (no pacman/uv/npm/cargo transaction).

## Files written

- `.ufo/waves/round-17/harm-baseline.json`
- `.ufo/waves/round-17/w1/HarmBaseline.md`
