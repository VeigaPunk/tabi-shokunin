VERDICT: HOLDS

Attacked
- The C1 count claim (L1: `measure-c1.mjs` B=0 -> M=4 behavior entries, 4 label-only not
  credited) by re-running the counter twice per revision, plus a hostile-environment run and a
  stealth-HEAD mutant discrimination probe. Counter under test is the LANE worktree file,
  sha256 `47185c8c07bdd065b7e6cd4d1e3e3d57f07507b414c0f8bc3bb905d63a322d9f` = blob at M
  (`git show M:.ufo/waves/round-17/measure-c1.mjs | sha256sum`). Counter not edited; LANE only
  read (the counter clones it).

Commands (all exit 0, `dropped=[]` in every run)
```
node .ufo/waves/round-17/measure-c1.mjs 5859243183c4d7ac5429dfdb8a73ce0d9a43d583   # x2
node .ufo/waves/round-17/measure-c1.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d   # x2
```
Counts match L1 exactly: B `c1_anchor_safe=0`, `entriesCount=8`, `label_only=[]`;
M `c1_anchor_safe=4`, `label_only=["round-contract-count-witness","user-contract-witness",
"user-contract-count-witness","user-contract-diagnostic-witness"]`. `sitesSource` B=`embedded`
(c1-sites.json absent at B; declared fallback), M=`rev`.

Per-entry, B (run1; run2 pass/kind/cDiff/residue/exits identical; rt = a/b/b2/c ms)
| entry | pass | kind | cDiff | residue | exits | rt run1 | rt run2 |
|---|---|---|---|---|---|---|---|
| round-contract-production | false | behavior | finding | 20 | 0/1/1/1 | 2015/227/235/234 | 2076/244/263/251 |
| user-contract-production | false | behavior | finding | 29 | 1/1/1/1 | 163/1382/1323/1301 | 179/1299/1402/1377 |
| round-contract-count-witness | false | label | label | 20 | 0/0/0/0 | 322/329/321/322 | 398/440/559/574 |
| user-contract-witness | false | label | label | 29 | 0/0/0/0 | 321/321/303/314 | 425/398/409/407 |
| user-contract-count-witness | false | label | label | 29 | 0/0/0/0 | 369/382/383/378 | 515/477/465/470 |
| user-contract-diagnostic-witness | false | label | label | 29 | 0/0/0/0 | 526/517/526/501 | 657/669/579/498 |
| measurement-binding-round16-manifest | false | behavior | finding | 1 | 0/1/1/1 | 47/51/54/53 | 46/52/51/50 |
| user-contract-fixture-full-read | false | behavior | finding | 29 | 0/1/1/1 | 1249/335/335/356 | 1238/362/337/356 |

Per-entry, M (run1; run2 identical decisions)
| entry | pass | kind | cDiff | residue | exits | rt run1 | rt run2 |
|---|---|---|---|---|---|---|---|
| round-contract-production | true | behavior | finding | 0 | 0/0/0/1 | 2013/2181/2083/258 | 2141/2158/2273/272 |
| user-contract-production | true | behavior | finding | 0 | 1/1/1/1 | 191/191/195/1390 | 186/201/231/1973 |
| round-contract-count-witness | false | label | label | 0 | 0/0/0/0 | 350/333/329/329 | 424/424/421/434 |
| user-contract-witness | false | label | label | 0 | 0/0/0/0 | 325/333/317/313 | 415/401/408/418 |
| user-contract-count-witness | false | label | label | 0 | 0/0/0/0 | 415/401/387/390 | 498/511/494/397 |
| user-contract-diagnostic-witness | false | label | label | 0 | 0/0/0/0 | 516/529/521/490 | 507/499/521/519 |
| measurement-binding-round16-manifest | true | behavior | finding | 0 | 1/1/1/1 | 54/51/52/52 | 56/56/57/56 |
| user-contract-fixture-full-read | true | behavior | finding | 0 | 0/0/0/1 | 1308/1387/1445/436 | 1294/1219/1281/333 |

Residue is per gate, shared by entries. B: round gate 20 (raw 25 = 1 nonRevision + 4 site + 0
fixtureFunction), user gate 29 (33 = 2+2+0), binding 1 (1 = 0+0+0). M: round 0 (16 = 9+4+3),
user 0 (8 = 5+2+1), binding 0 (1 = 1+0+0); exclusion tallies sum to raw counts.
B reasons: all 8 carry `ab_exit_or_output_differs` + `gate_static_head_residue`; the 4 label
entries add `revision_field_not_lane_tip_b`/`_b2` + `committed_not_yes_b` + `committed_not_no_b2`
+ `arm_c_label_only`; the 4 behavior entries add `b2_behavior_differs_from_a`. M label entries
fail on `arm_c_label_only` alone, i.e. the L1's uncredited-by-label rule.

Determinism
- Decision vector (pass, kind, cDiff, checks, residue, label_only, count, entriesCount) identical
  across both runs per rev; concatenated `normalizedSha256` identical (B `44c17ed28ade938e`,
  M `c9c50d108d9a519b`).
- Raw JSON `firstLine.*` differs run-to-run only in the gates' own fixture commit ids
  (`baseline=<40hex>` from `git commit` inside a gate fixture, wall-clock). Poison ids are stable:
  `buildPoison` pins `GIT_AUTHOR_DATE/GIT_COMMITTER_DATE=2026-10-20T00:00:00+00:00`
  (measure-c1.mjs:364,367), and all 8 poison ids were byte-identical across runs. So the JSON is
  not byte-reproducible; every decision field is.
- Wall time: B 16.2s / 18.3s, M 20.3s / 21.9s, hostile 19.5s, mutant 17.0s. Max single arm 2181 ms
  (M round-production/b) against `RUN_TIMEOUT_MS` 600000 (measure-c1.mjs:180) -- 275x margin.
  Arm-time asymmetry (e.g. user-contract-production C 1390-1973 ms vs A/B/B2 ~190 ms) is exit-path
  shape (C leaves round_count and runs the per-round loop), not a timing-sensitive verdict.

Host state / timing (none observed to move a pass)
- `makeEnv` (:216-230) replaces the environment: PATH, HOME=sandbox, TZ=UTC,
  GIT_CONFIG_NOSYSTEM=1, GIT_CONFIG_GLOBAL=/dev/null, GIT_OPTIONAL_LOCKS=0,
  GIT_TERMINAL_PROMPT=0, GIT_NO_REPLACE_OBJECTS=1; the gates re-pin their own git env and inherit
  only PATH/HOME (check-round-contract.mjs:65-80 at M). Rewritten temp dirs are `/var/tmp/tabi-*`,
  which the counter normalizes.
- Hostile run `env -i ... TZ=Asia/Tokyo LC_ALL=de_DE.UTF-8 LANG=de_DE.UTF-8 HOME=/tmp
  GIT_CONFIG_GLOBAL=/tmp/hostile-gitconfig GIT_COMMITTER_DATE=2001-01-01T00:00:00Z`: M count 4 and
  the identical per-entry pass/kind/cDiff/residue vector.
- No `Date`/`Date.now`/`hrtime` reads in the three gate blobs at M (grep). Only locale-sensitive
  call is binding's `localeCompare` finding sort (:748); the env replacement fixes the locale.
- All runs overlapped other seats running the same counter/gates on this host (live PIDs observed);
  results unchanged under that load. Internal timeouts are far above observed: user gate git calls
  `timeout: 30000` (check-user-round-contract.mjs:509 at M), binding reproduce timeout
  (unexercised). [INFERENCE] a >250x host stall, unobserved, is the only route to a timeout arm.

Discrimination probe (do the credited entries actually test the anchor?)
- Throwaway clone at M, two gates patched to resolve HEAD in baseline style, spelled
  `['HE','AD'].join('')` so the literal residue scan sees no `'HEAD'`: user `laneTip` early-returns
  `gitOk(root, ['rev-parse','--verify','--end-of-options', ...])`; binding default `--at` resolves
  HEAD instead of `laneTip(repo)`. Committed as e9f4ff72c3b6b468b7335df606687d6bf5b6cca9, master
  set to it, counter run `--lane <clone> <mutant>`: `c1_anchor_safe=1`.
- Every mutated entry failed as it must if anchored: user-contract-production `equal_ab=false`
  (B advanced past round_count to 10 rounds), user-contract-{witness,count-witness,diagnostic}
  `rev_fields_b=false`, user-contract-fixture-full-read B=`evidence_moved`, measurement-binding
  `equal_ab=false`. The only survivor was round-contract-production (gate not mutated). Residue for
  the two mutated gates stayed 0 -- the literal scan misses split-token reads (declared limit in
  the counter header), but the behavior arms caught it.

Caveats (none breaks the count)
1. 2 of 4 credited entries are red in arm A at M, so their pass is equality-of-red: 
   user-contract-production exits 1 `round_count Found 6 user rounds, expected 10` (same finding at
   B; pre-existing), and measurement-binding exits 1 `verdict=failed claims=2 bound=0` (B arm A was
   `clean claims=2 bound=2`; r17's edit of `scripts/check-measurement-binding.mjs` and
   `scripts/selftest-measurement-binding.mjs` is a countedInput of the r16 manifest, so
   `countedInputChanged` correctly unbinds it at the new tip). Both still discriminate in the probe.
   M=4 should not be read as "four green entry points".
2. B=0 does not rest on the residue rule alone: every B entry also fails
   `ab_exit_or_output_differs` (e.g. round-production 0/1, binding 0/1).
3. The residue inventory is keyed by (function, line) from `c1-sites.json` at REV; a stale
   inventory or a stealth read at an excluded site would keep residue 0 (the probe shows the
   split-token case; behavior arms covered it here).
4. If a future wave wants a byte-reproducible receipt, normalize the fixture commit ids in
   `firstLine` (they are already normalized in `normalizedSha256`) or drop `firstLine`. No repair
   needed for the count.

Files written: .ufo/waves/round-17/w2/ReRunC1.md
Raw receipts retained: /tmp/c1-{B,M}-{1,2}.json (+.err), /tmp/c1-M-hostile.json, /tmp/c1-mutant.json.
Temp mutant clone /tmp/tabi-r17w2-ReRunC1-mut1 removed. No tooling installed.
