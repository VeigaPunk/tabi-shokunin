VERDICT: PASS — routed defects 1 and 2 both hold at master `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. Exact values below, plus two wording corrections the lesson row should carry.

# Scope, method, bound

- Read-only in LANE `/home/vgpnk/Projects/shokunin/tabi-shokunin` (every path below is LANE-relative). HEAD is detached at master `5859243…` (`git symbolic-ref -q HEAD` → exit 1).
- Reproduction ran in one sandbox clone `git clone --no-hardlinks LANE /tmp/tabi-r17-RevRouted12-tfzo/repo`, detached checkouts of `8f7feb3` and `3254740`; sandbox removed (`ls` → no such directory). No `jj`, no git write in LANE, no file written outside this Report.
- No tool installs; Node v24.21.0 and the lane's own git were sufficient.

# Routed defect 1 — unrooted liar probe: HOLDS

Exact facts:

- **The routed command as literally written is malformed.** `git cat-file -t 9ecfcc9 0754e44 7b497d1` → stderr `fatal: too many arguments`, **exit 129** (the usage block is printed; `cat-file -t` takes exactly one object). A reviewer copying the routed line gets a usage error, not evidence.
- **Run per object, all three are absent.** In LANE at master each of `9ecfcc9`, `0754e44`, `7b497d1` → `fatal: Not a valid object name`, **exit 128**. The same three probes in the fleet repo `/home/vgpnk/Projects/shokunin` → exit 128 each.
- **They resolve only in the r16 attack clone named by `corpus/evidence/round-16/measure/c1-liar-probes.json:3`** (`/tmp/tabi-r16-c1liar-93NO/repo`), as commits:
  - `9ecfcc9` → `9ecfcc911ce204d3a5b548a37819f01b0c640c10` (`refs/heads/v1-full-liar`)
  - `0754e44` → `0754e448bbe81390e3c190f5a69d13364d0bc45f` (`refs/heads/v2-liar-gate-real-selftest`)
  - `7b497d1` → `7b497d15a5db17fa3fe3dad6bf44612680dd5e80` (`refs/heads/v3-liar-selftest-real-gate`)
  - all three parented at `b444ca8e024f386124418169e8e400221524bba3`.
- **Liar blob sha256 at those revs reproduce `.ufo/waves/round-16/w2/AttackC1Liar.md:35-37` digit-for-digit** — V1 gate `fa1e12e17b03130074bc9c84540aac358a524db5f5f26e2ca3596bcf84624eaf` + selftest `3c92359883994e26550c863fb2809e935af36c13a55294b0e5dc68fcf36b187f`; V2 gate `fa1e12e1…` + selftest `8c5426f2…`; V3 gate `5150611c…` + selftest `3c923598…`; honest `b444ca8` carries both real pre-hardening blobs (`5150611c…`/`8c5426f2…`). So the probe was **not fabricated**; only its substrate is unrooted.
- **"Liar gate/selftest blobs are uncommitted" holds.** Over every commit touching the two paths (`git log --all`), lane history holds exactly two gate digests — `5150611c…` (`8f7feb3`) and `1f84fb54…` (`3254740`) — and exactly two selftest digests — `8c5426f2…` (`8f7feb3`) and `481eefae…` (`3254740`). `fa1e12e1…` and `3c923598…` are committed nowhere. At master `corpus/evidence/round-17` does not exist (`git cat-file -e` → exit 128); the only liar-named paths are `AttackC1Liar.md` and the committed record `c1-liar-probes.json` (blob `e31dc56cb62d8af4…`, added `6c8e0ff`, byte-identical at master).

Two corrections for the lesson:

1. **Not tmpfs.** `findmnt -T /tmp` → `/tmp xfs /dev/nvme0n1p1`; the clone still exists today (39 MB, `du -sh`). The defect is *non-reproducibility from LANE* (no generator, no blobs), not loss on reboot — a `/tmp` sweep or a `rm -rf` destroys the only copy silently. `:148`'s "tmpfs clone" is factually wrong.
2. **The counter identity is rooted, and split across revisions.** `c1-liar-probes.json:5` `counterSha256 c8b4100a9f60dcd530ae752074e04d05074b4938cc05c6f19214add05e2594cb` is `.ufo/waves/round-16/measure.mjs` at `3254740` **and** at master; the probe revisions carry `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9` at `b444ca8` (`AttackC1Liar.md:41` records it as `counterBlobAtRevisionSha256`). Lesson row should require **both** "tool actually executed" and "tool at the evaluated revision"; otherwise the same receipt can look rooted while naming two different tools.

Severity: medium, non-load-bearing for C1 — agrees with `:148`. Fix shape in PLAN `:157` (generator + committed liar blobs + fresh receipt) is the only recoverable route; the liar sources exist nowhere in LANE.

# Routed defect 2 — pre-hardening receipts: HOLDS, with one nuance

Recorded identities, byte-identical in both files at lines 3-4:

```
gateSha256     5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb
selftestSha256 8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae
```

- `corpus/evidence/round-16/binding/selftest.json`: `run.exit 0`; **43** `case=` lines, all `PASS`; summary `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13`; raw stdout sha256 (decoded with `jq -j`, no added newline) `590ca42a3c194379a233c7d6225ec38b334fc3f6e342a2071799e8e246894c1d`.
- `corpus/evidence/round-16/binding/legacy-r15.json`: `run.exit 1`; 4 findings (C1 `counted_inputs_undeclared,counter_changed_since_measurement,counter_digest_unrecorded`; C2 `counted_inputs_undeclared,counter_digest_mismatch`, `--at 36240c70ee114347a79abb91cacab6c63044ce36`); raw stdout sha256 `87745dd9cfc01905dfb978a3690be9916d0c6cc6f5a9c050d12de1d20f48e04b`.

Registered revision `3254740` (ancestor of master, `git merge-base --is-ancestor` → YES):

```
git show 3254740:scripts/check-measurement-binding.mjs     | sha256sum
  = 1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6   (PLAN :162 "1f84fb54…")
git show 3254740:scripts/selftest-measurement-binding.mjs  | sha256sum
  = 481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3   (spotcheck :67 "481eefae…")
```

Master `5859243` carries the **same** two digests (`1f84fb54…`/`481eefae…`), so the registered blob is still master's gate; the hardening landed at `3254740` and never moved again. `3254740`'s subject is "round-16: wave-2 falsification repairs (gate/selftest/counter/harness hardening, receipt regenerated, …)" — the binding receipts are not among what was regenerated: both are byte-unchanged from `8f7feb3` (the commit that added them) to master (`ac3d486f…` selftest, `489cd1af…` legacy).

Reproduced in the sandbox (detached checkouts):

| rev | worktree gate/selftest | `--self-test` | `--legacy … --at 36240c7…` |
|---|---|---|---|
| `8f7feb3` | `5150611c…` / `8c5426f2…` | exit 0, 43 cases, `verdict=clean cases=43`, stdout `590ca42a…` | exit 1, stdout `87745dd9…` |
| `3254740` | `1f84fb54…` / `481eefae…` | exit 0, **59** cases, `verdict=clean cases=59 reasons=13`, stdout `abff6ff1…` | exit 1, stdout `87745dd9…` |

Both recorded stdout strings reproduce **byte-for-byte** at `8f7feb3` (the same command at `3254740` gives `87745dd9…` for legacy — byte-identical to the receipt — and a 59-case stdout for selftest). Thus the receipts are genuine and their `:6` note ("bytes equal the committed blobs named by these digests") is true; they simply self-certify a superseded blob. Attaching the receipts to `8f7feb3` is [INFERENCE] from byte-identical reruns plus the recorded digests — no other committed revision has those bytes.

**Nuance the lesson should carry.** The selftest receipt is stale in *identity and case count* (43 vs 59; 16 added control pairs); the legacy receipt's *content* is exactly what the registered gate still emits today — only its identity header is stale. So "pre-hardening receipts" is accurate, but "the tallies live only inside the counter stdout" understates it: for legacy the receipt body is still correct evidence. The 16 cases are the paired controls `counted_inputs_undeclared_unresolved`, `counter_failed_worktree_differs`, `count_not_reproduced_constant`, `count_not_reproduced_string`, `manifest_schema_invalid_name_only`, `argv_unsupported_dir_prefix`, `counter_path_dash`, `revision_unresolved_dash_ref`, each with `_control`.

Recommendation for the new receipts (PLAN `:160-162`): carry the measured revision and a `gateSha256AtMeasuredRevision` field, and record stdout raw (no trailing newline added), so a reader does not have to cross-check a bare `gateSha256` against the revision. Severity: medium; both files are honest-but-stale, not fabricated.

# Residual risk and verification gaps

- The liar clone is the only copy of three revision objects and two blobs; it can vanish at any moment. The RoutedLiar generator must carry the liar sources as committed blobs — they cannot be recovered from LANE. I did not re-derive the probe's `0/0/0/1` counts (out of scope; they rest on rooted counter `c8b4100a…`).
- Byte-comparison above used decoded stdout (`jq -j`); an earlier `jq -r` decode falsely suggested a trailing blank line — the stored strings end `…=13\n` / `…b7cf0446a31014...\n` and match the runs exactly.
- No claim here about C1/C2/C3 counters, the r17 gate edits in flight, or any round-17 artifact.

Files written: `.ufo/waves/round-17/w1/RevRouted12.md`
