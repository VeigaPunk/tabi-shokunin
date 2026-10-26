# Receipts — seat CritC1EnvLeak (round 30, attack w2, C1)

Scratch root `$S = /fast/scratch/hyaku/tabi-r30/CritC1EnvLeak` (HYAKU_SCRATCH=/fast/scratch/hyaku).
Lane was never written. Measurement clone: `$S/clone` = `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin`,
`git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5`, `git -C "$S/clone" status --porcelain` empty
at every counter run. Two additional fixture repos, each verified `rev-parse --show-toplevel` equal to itself:
`$S/attack` (clone of `$S/clone`, per-variant attack commits on top of the tip) and `$S/base` (clone of `$S/clone`,
checked out at baseline f7c0317…, with the frozen counter and catalogue copied in, plus attack commits).
All commits made with `-c user.name=CritC1EnvLeak -c user.email=CritC1EnvLeak@scratch.local`.

## Frozen inputs (sha256, re-verified at the tip by the counter itself)

```
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
```
Every reading below reports `counter_sha256_at_rev 02945f88…` and `catalogue_sha256 cd1c27a2…`
(verified per JSON: `frozen_match True` for all 11 counter outputs that report it). The v2/v3 counters are
scratch experiments: their `counter_sha256_running` is `0a5a5023…` / `51cbcc0c…`, so those runs are
experiments, never predicate readings.

## Commands and exit codes

| # | command (cwd) | exit | output |
|---|---|---|---|
| 1 | `TMPDIR=$S/tmp1 node scripts/check-s106-evidence.mjs --selftest --json` ($S/clone) | 0 | `s106-pristine.json` 10/10 |
| 2 | `TMPDIR=$S/tmp1 node scripts/check-release-pins.mjs --selftest --json` ($S/clone) | 0 | `pins-pristine.json` 29/29 |
| 3 | `node scripts/check-gate-mutants.mjs --rev 072af95f… --work $S/work --json` ($S/clone) | 0 | `tip-baseline.json` fs 0 bk 0 |
| 4 | same, `TMPDIR`/cwd = `/tmp/critc1-alt` (alt-cwd determinism) | 0 | `tip-altcwd.json` (byte-identical to #3) |
| 5 | `--repo $S/base --rev 8107530…` (baseline + frozen counter) | 1 | `base-frozen.json` fs 14 bk 0 |
| 6 | `--repo $S/attack --rev 86f97d1…` (tip + V1 cwd) | 0 | `V1-cwd.json` fs 0 bk 0 |
| 7 | `--repo $S/attack --rev bd1799e…` (tip + V2 own path) | 0 | `V2-ownpath.json` fs 0 bk 0 |
| 8 | `--repo $S/attack --rev e146045…` (tip + V0 PWD) | 0 | `V0-pwd.json` fs 0 bk 0, z-kills 0 |
| 9 | `--repo $S/attack --rev d6754f4…` (tip + V3 TMPDIR) | 0 | `V3-tmpdir.json` fs 0 bk 0 |
| 10 | `--repo $S/attack --rev 54b939a…` (tip + V4 /proc/self) | 0 | `V4-proc.json` fs 0 bk 0 |
| 11 | `--repo $S/base --rev 72dbbfa…` (baseline + Z 2 lines/gate) | 0 | `base-attack-frozen.json` fs 0 bk 0 |
| 12 | `--repo $S/base --rev 9ff873d…` (baseline + V5 provenance) | 0 | `V5-frozen.json` fs 0 bk 0, prov-kills 27 |
| 13 | `node $S/v2/check-gate-mutants.mjs --repo $S/base --rev 8107530…` | 1 | `base-v2counter.json` fs 14 |
| 14 | `node $S/v2/check-gate-mutants.mjs --repo $S/base --rev 72dbbfa…` | 1 | `base-attack-v2counter.json` fs 14, z-kills 0 |
| 15 | `node $S/v2/check-gate-mutants.mjs --repo $S/base --rev 9ff873d…` | 0 | `V5-v2counter.json` fs 0, prov-kills 27 |
| 16 | `node $S/v2/check-gate-mutants.mjs --repo $S/attack --rev 072af95f…` | 0 | `tip-v2counter.json` fs 0, killed_by identical to #3 |
| 17 | `node $S/v2/check-gate-mutants.mjs --repo $S/attack --rev 86f97d1…` | 0 | `tip-attack-v2counter.json` fs 0, junk unflagged |
| 18 | `node $S/v3/check-gate-mutants.mjs --repo $S/base --rev 9ff873d…` | 1 | `V5-v3.json` fs 14, prov-kills 0 |
| 19 | `node $S/v3/check-gate-mutants.mjs --repo $S/base --rev 72dbbfa…` | 1 | `Z-v3.json` fs 14, z-kills 0 |
| 20 | `node $S/v3/check-gate-mutants.mjs --repo $S/attack --rev 072af95f…` | 0 | `tip-v3.json` fs 0 bk 0 |
| 21 | gates copied to `$S/tmp1/mutant-7/`, run there with `TMPDIR=$S/tmp1/mutant-7/tmp` | 0,0 | `s106-identitynamed.json` 10/10, `pins-identitynamed.json` 29/29, per-case `ok` identical to #1/#2 |
| 22 | gates copied to `$S/tmp1/ns-probe/`, run under `unshare -pfr --mount-proc node …` | 0,0 | `s106-nsprobe.json` 10/10, `pins-nsprobe.json` 29/29 |
| 23 | `unshare -pfr --mount-proc node -e '…readFileSync("/proc/"+process.ppid+"/cmdline")…'` | 0 | prints `ppid 0`, `parent read failed: ENOENT` |
| 24 | same ns: `mount -t tmpfs none $S/clone` then read a file inside it | 0 | `repo unreadable inside ns: ENOENT` |

## Artifact digests and UTC times

| file | sha256 (first 16) | sha256 | UTC |
|---|---|---|---|
| tip-baseline.json | 0392fc1005dc52bd | 0392fc1005dc52bd95e9d1e934cdaeba1a224357c41723b87ac2a5fcda4122e2 | 07:36:32Z |
| tip-altcwd.json | 0392fc1005dc52bd | (identical to tip-baseline) | — |
| base-frozen.json | e9740ae51d8c01a0 | e9740ae51d8c01a074b3ab361a1678854a010705745e5b6abb130103d47a0e22 | 07:40:56Z |
| base-attack-frozen.json | 5b7ca6b591e62edd | 5b7ca6b591e62edd85208b22f6eef9d09307407377c8591d25f51de315cabec8 | 07:43:02Z |
| V1-cwd.json | 9f96f3b525269dac | 9f96f3b525269dac63a6e94f8522e813709fb2ebd189228116b70c0719ace266 | 07:35:53Z |
| V2-ownpath.json | ac3ddb6e5c253ef6 | ac3ddb6e5c253ef68cc3d0bf110dfdc259238be96b970f64ce9ed7259fe31607 | 07:37:20Z |
| V0-pwd.json | 28c254d4cc8b5bdb | 28c254d4cc8b5bdb3165aefb9ca0bb67961007434c5865b11beaf5e86473646d | — |
| V3-tmpdir.json | 05c168801dd82bc2 | 05c168801dd82bc2ba7b32e26f530a94c712412846a77bb940588d80d2057f87 | 07:38:49Z |
| V4-proc.json | d441213ce71637df | d441213ce71637dfc8c92ddb088dbd9627f879b5eed1f183ad8ad0b59dcbff93 | 07:39:34Z |
| V5-frozen.json | 4d947e5878d2e717 | 4d947e5878d2e7174e8b4a4fadaa5da93dcdcd06d25669a1624fdfa07add83ac | 07:46:09Z |
| V5-v2counter.json | 000ca29884983272 | 000ca29884983272af3beaeed38fe194f69f3d0d0d5c0d53322dc45e2dcdb84f | 07:46:27Z |
| V5-v3.json | ddc921429f4cc8b9 | ddc921429f4cc8b906b6a6360a8159481a3816c0b7ad7e61632b164e0d445ed1 | 07:48:45Z |
| Z-v3.json | 587f5fd694d220f1 | 587f5fd694d220f1f10604135663d77baa91b7a58b04490e5b8eccd5558d6259 | 07:49:02Z |
| tip-v2counter.json | 40a228dacceb24f4 | 40a228dacceb24f4f7ee50c58f06bd7de4bd8e26f044c42581671391ad8bbc71 | 07:43:49Z |
| tip-v3.json | 0fab48374914fdbb | 0fab48374914fdbb86d24cee4ebae7e770430a3713bb08a530104d59ac787636 | 07:49:24Z |

Attack patches (`attack-*.patch`, `counter-v2.mjs`, `counter-v3.mjs`, `counter-v2.patch`) sit beside this file.
Commit map: attack repo `86f97d1` V1 cwd, `bd1799e` V2 own path, `e146045` V0 PWD, `d6754f4` V3 TMPDIR,
`54b939a` V4 /proc/self; base repo `8107530` baseline+frozen counter, `72dbbfa` baseline+Z, `9ff873d` baseline+V5.

No network fetches. No tool installs. No lane writes.
