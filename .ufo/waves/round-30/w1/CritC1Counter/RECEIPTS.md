# CritC1Counter — receipts (round 30, w1, C1 attack)

Seat: `CritC1Counter` (critic, leaf). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r30/CritC1Counter` (`HYAKU_SCRATCH=/fast/scratch/hyaku`), removed at exit.
Clone: `git clone --shared <lane> $S/clone`, `git -C $S/clone checkout 061e62024c0523d3c6c7e819506a773ff2cd7d75`,
identity `critc1counter` set locally with `git -c user.name=... -c user.email=...` on every commit.
No lane tracked file, lane index, lane jj state, fleet repo or `/home/vgpnk/Projects/shokuknow` was written.
No tool was installed or upgraded. No network fetch was made (C2 is not my claim; nothing here needed the wire).

All measurements run the **frozen** counter and catalogue: every JSON below reports
`counter_sha256_at_rev = 02945f882ea9…` and `catalogue_sha256 = cd1c27a2a971…`
(`claims.json:frozenDigests`), except where a scratch catalogue is deliberately altered
(`decoy-*.json`, catalogue `0a113f5823b6…`).

## Commands and exit codes

| # | command (cwd = `$S/clone`, `TMPDIR=$S/tmp`) | exit | reading | file |
|---|---|---|---|---|
| 1 | `node scripts/check-gate-mutants.mjs --rev 061e6202… --json` | 1 | ft 27, fs 14, bt 13, bk 0 (baseline reproduced) | `base.json` |
| 2 | `node scripts/check-gate-mutants.mjs --rev <Z> --json` | 0 | ft 27, **fs 0**, bt 13, **bk 0**, clean true | `Z.exact.json` |
| 3 | `node scripts/check-gate-mutants.mjs --rev <A> --json` | 0 | ft 27, **fs 0**, bt 13, **bk 0**, clean true | `A.exact.json` |
| 4 | `node scripts/check-gate-mutants.mjs --rev <B2> --json` | 0 | ft 27, **fs 0**, bt 13, **bk 0**, clean true | `B2.exact.json` |
| 5 | `node scripts/check-gate-mutants.mjs --rev <C5> --json` | 0 | ft 27, **fs 0**, bt 13, **bk 0**, clean true | `C5.exact.json` |
| 6 | `node scripts/check-gate-mutants.mjs --rev <C4> --json` | 1 | ft 27, fs 14 (attack rev-sensitive; see report §3) | `C4.exact.json` |
| 7 | `node scripts/check-gate-mutants.mjs --rev <C> --json` | 1 | ft 27, fs 0, bt 13, **bk 5** (naive identification false-kills benigns) | `C.json` |
| 8 | `node scripts/check-gate-mutants.mjs --selftest --json` (pristine tree) | 0 | cases 12, passed 12, ok true | `counter-selftest.json` |
| 9 | `node scripts/check-s106-evidence.mjs --selftest --json` (pristine tree) | 0 | cases 7, passed 7, ok true | `s106-selftest.json` |
| 10 | `node scripts/check-release-pins.mjs --selftest --json` (pristine tree) | 0 | cases 20, passed 20, ok true | `pins-selftest.json` |
| 11 | `node scripts/check-gate-mutants.mjs --rev <Z+2 decoys> --json` | 1 | ft 29, **fs 2** (both same-length decoys survive) | `decoy-bdfcafd.json` |
| 12 | `node scripts/check-gate-mutants.mjs --rev <B2+2 decoys> --json` | 1 | ft 29, **fs 1** (`s106-anchor-unique-bound` survives) | `decoy-dcd3c69.json` |
| 13 | `node scripts/check-gate-mutants.mjs --rev <Z+flip decoy> --json` | 0 | ft 28, fs 0 (flip decoy is caught by a *behavioural* case) | `decoy-flip.json` |
| 14 | `node scripts/check-gate-mutants.mjs --rev <A> --repo $S/clone --work $S/work --json` | 0 | ft 27, fs 0, bk 0 (also clean with `--repo`/`--work`) | `A.json` |

Revs measured (all in `$S/clone`): `Z bdfcafd67e99d8b415b48472af21e22acf1e3b79`,
`A 7556ca21c8097aac92f3158b6d18e0969c015c71`, `B2 dcd3c69dbea2c54a1d2490ddcbb1b7a1b4aa609f`,
`C5 5969e9c5cca93e240193262a6cc6a5ccfcc2b502`, `C4 cd8b31fb1d57e0cccf1e24a2f9bc1128285bd827`,
`C f5d136e767d672ed8e86fc77345c7f3c6ec7ddc3`. Decoy revs: `e82690873ac38abcde1113ffda989c51418bc5a2` (Z),
`8b2a83bf0fd42a549339a54e9907de6da5ac131d` (B2), `039523a543554bc3e9f8ca8acf0cb02c3b784994` (flip).

Note on rows 2–5: the measured rev was *not* `HEAD` of the working tree for most runs (the tree was reset to
`061e6202…` so the frozen counter bytes were the ones executing); `--rev` is resolved by the counter with
`git show <rev>:<path>`, so gate/catalogue blobs come from the measured rev while the counter binary is the
frozen one. Row 5 (C5) deliberately measured a rev that is not `HEAD`.

## Attack patches (attack artifacts — NOT proposed lane changes)

| file | added lines | what it does | result |
|---|---|---|---|
| `Z-minimal-cwd.diff` | 2 (1 per gate), no import changes | `results.push({id:"z", ok:! /mutant-(\d+)$/.test(process.cwd()) …})` | fs 0, bk 0, exit 0 |
| `A-cwd-leak.diff` | 6 | same channel, readable form (`basename(process.cwd())`, threshold per gate) | fs 0, bk 0, exit 0 |
| `B2-inventory.diff` | 7 (two long table lines) | fragment-count table over its own bytes; no env/git/proc use | fs 0, bk 0, exit 0 |
| `C5-rev-provenance.diff` | 29 | `/proc/<ppid>/{cwd,cmdline}` → repo + `--rev` → pristine blob + catalogue → exact mutant identity | fs 0, bk 0, exit 0 |
| `C4-pristine-compare.diff` | 25 | same, but keyed on `HEAD` instead of `--rev` | fs 14 when rev ≠ HEAD (rev-sensitive) |
| `C-proc-provenance.diff` | 23 | first identification attempt (`find` absent + `replace` present) | fs 0, **bk 5** — false-kills benigns |
| `B-inventory.diff` | 7 | inventory with placeholder counts (table literals not self-counted) | counter refused exit 2: `pristine self-test … failing=check-inventory` |

Every attack leaves all 40 catalogued `find` strings byte-identical and occurring exactly once: the counter's
static guard passed (each run reached the mutant stage and reported `fault_total 27`), and no refusal line
appeared in any `*.exact.json`.

## Fixture arithmetic used in report §5

`s106` self-test fixture (`FIXTURE_BYTES`, 187 lines): 2614 bytes; anchor text occurs 1 time.
`sha-mismatch-invalid` writes `FIXTURE_BYTES.replace("// tail","// tampered")` = 2618 bytes, so
`byteCountMatch` is false in that fixture independently of `shaMatch` (computed with `Buffer.byteLength`
over the same construction the gate uses).
