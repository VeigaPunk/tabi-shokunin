# R100Exec2 — C1 scale, stability and live killers

- Deps: `D=/fast/scratch/hyaku/tabi-r100/R100Exec2/deps`, `npm install puppeteer-core@25.16.0 playwright-core@1.65.0` (npm registry channel, per assignment). Tool-install note: no pacman/sudo used; host-wide pacman is paused, so npm channel only. RULES.md read before install.
- Counting pin: `--expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90` (per assignment).

## Commands run (exact, with exits)

1. Reps-10 (60 legs): `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90 --live --deps /fast/scratch/hyaku/tabi-r100/R100Exec2/deps --scratch /fast/scratch/hyaku/tabi-r100/R100Exec2/r10 --ports 34121,34122,34123 --json --reps 10` → exit 0; verdict `clean`, checkCount 678, failures [].
2. Default (18 legs): same minus `--reps 10`, `--scratch .../def`, same ports → exit 0; verdict `clean`, checkCount 216, failures [].
3. Live killers: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/livekillers-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --deps /fast/scratch/hyaku/tabi-r100/R100Exec2/deps --scratch /fast/scratch/hyaku/tabi-r100/R100Exec2/kl --ports 34124,34125,34126 --json` → exit 0; ok 6/6.

Outputs: `R100Exec2-reps10.json`, `R100Exec2-default.json`, `R100Exec2-livekillers.json` (+ receipts `R100Exec2-reps10-receipt.json`, `R100Exec2-default-receipt.json`) under `.ufo/waves/round-100/w1/`.

## Per-arm stability

- Reps-10: 60 legs, 10 per arm (DUP3, EMPTY1, MIXED, LAUNCH2PL, LAUNCH2PU, DIR), all clean; no flake, no launch-failure, no setup. Default: 18 legs, 3 per arm, all clean. 78 live legs total, zero findings.
- Trust discipline held on every leg inspected from the copied receipts: no payload leg (DUP3/EMPTY1) ever saw an `isTrusted:true` event; no path leg (LAUNCH2PL/LAUNCH2PU/DIR) ever saw an `isTrusted:false` event.
- MIXED: on all 13 MIXED legs (10 + 3) no file was ever set on any input and no event ever fired (verified from receipt files/events, not just counter verdict).
- DIR: on all 13 DIR legs every file in `#d` carried a `webkitRelativePath` starting `probe-dir/` (including `probe-dir/sub/two.txt`); none missing its prefix.

## Live-killer table (6/6 ok, frozen rc and neutralised rc as expected)

| killer | frozen | neutralised |
|---|---|---|
| K-exit | rc1 `driver-exit` | rc0 clean |
| K-ports | rc1 `ports-bound` | rc0 clean |
| K-missing | rc1 `missing-bound` | rc0 clean |
| K-tmpdir | rc1 `tmpdir-bound` | rc0 clean |
| K-partial | rc1 (`driver-exit`,`payloads`,`failures`,`child-files`; LAUNCH2PU-1 launch-failed) | rc2 `setup` |
| K-launchonly | rc2 `setup` (`driver-exit`,`failures`; LAUNCH2PU-1 launch-failed) | — |

K-partial/K-launchonly confirm the r99 D3 exit-3 mapping still holds: a partial launch failure with a law change gives findings (`child-files`), a launch failure alone gives `setup`, not a law finding.

## Risks / blockers

- None observed. No falsifying leg seen; nothing changes the C1 verdict. Scratch tree under `/fast/scratch/hyaku/tabi-r100/R100Exec2/` removed before yield; no chromium remains on ports 34121–34126 (`pgrep -f remote-debugging-port=3412[123456]` empty). No lane/fleet files mutated.

VERDICT C1: neutral
