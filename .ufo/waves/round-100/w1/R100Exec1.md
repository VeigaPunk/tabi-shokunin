# R100Exec1 — C1 cold reproduction (round 100, wave w1)

Seat: R100Exec1. L1 TabiR100. Lane /home/vgpnk/Projects/shokunin/tabi-shokunin (base 9a478a2e; freeze 468c2b94).
Claim read in full: plans/round-100.md §Claim + §Declared limits 1-8 + §Counting command.

## Setup (tooling)

- Read ~/.omp/agent/RULES.md first (operator 2026-10-19). Pacman PAUSED host-wide per seat spec — no pacman used.
- Installed client deps via npm (registry), channel `npm install`, reason: frozen counter pins these two versions:
  `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
  in /fast/scratch/hyaku/tabi-r100/R100Exec1/deps (after `npm init -y`). Install rc 0, "added 26 packages".
  Verified: `node -e require(...).version` → 25.16.0 / 1.65.0.
- SCRATCH/TMPDIR: /fast/scratch/hyaku/tabi-r100/R100Exec1/ (r1, r2, bat under it). Ports 34111,34112,34113.
  Host Chromium: /usr/bin/chromium 155.0.8059.84 (receipt `chromium: "Chromium 155.0.8059.84 Arch Linux"`).

## Runs (frozen counting command, --live, twice cold)

Command (each run; only --scratch differs):
`node scripts/check-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90 --live --deps /fast/scratch/hyaku/tabi-r100/R100Exec1/deps --scratch <rN> --ports 34111,34112,34113 --json`

- Run1 (--scratch .../R100Exec1/r1): **RC 0**, verdict `clean`, checkCount 216, findings []. Nonce tabi-r100-live-baba31b6c654. Receipt live-receipt-df112f8c650e.json, sha256 7340f4c2...f610. Driver status 0, 18 legs, 0 failures, 0 launchFailures, orphansSwept 0.
- Run2 (--scratch .../R100Exec1/r2): **RC 0**, verdict `clean`, checkCount 216, findings []. Nonce tabi-r100-live-55ba8b6805b5. Receipt live-receipt-89e2867a5ebf.json, sha256 97a552d0...8c19. Driver status 0, 18 legs, 0 failures, 0 launchFailures.
- Outcomes (both runs, identical): trustedMulti [LAUNCH2PL-1..3, LAUNCH2PU-1..3], dupKeep [DUP3-1..3], emptyOk [EMPTY1-1..3], mixedRefused [MIXED-1..3], dirWalk [DIR-1..3].
- Receipt leg sample (run1, DUP3-1): target m, files.m = [[dup.txt,21,text/plain,""],[dup.txt,22,text/plain,""],[other.txt,11,text/plain,""]] in order; clientBrowserVersion 155.0.8059.84, ssued 18 distinct UUIDs (counter-enforced fresh-browser).
- Library pin confirmed by counter `libs` check (no finding): receipt libraries puppeteer-core 25.16.0 (integrity sha512-VA5Pf..., file sha256 162b7199..., 927 tree files, tree sha 968a85e8...), playwright-core 1.65.0 (integrity sha512-vNSKg..., file sha256 4ef83305..., 116 tree files, tree sha 24584693...). A fresh npm install reproduces the pinned libs.

## Forgery battery (on run1 receipt)

`node scripts/negatives-client-oopif-uploadsets-round100.mjs --lane ... --receipt .../R100Exec1-run1-receipt.json --expect-nonce tabi-r100-live-baba31b6c654 --expect-driver-sha256 97947b0b1...306b90 --scratch .../R100Exec1/bat --json`
→ **RC 0**, battery tabi-r100-client-oopif-uploadsets-negatives, cases 121, ok 121, failed []. Positive case rc 0 `clean`; every mutation case rc 1 `findings` with its expected id verbatim (child-events, child-files, child-reads, outcome, missing, leg-arm, leg-urls, iframe-targets, frames, libs, browser, chromium, nonce, driver-pin, files, payloads, tmpdir, reps, ports, leg-set, leg-label, fresh-browser, failures, parent-files).

## Cleanup

- `pgrep -f "remote-debugging-port=34113"` → empty (no chromium left). No background jobs started; no commits; no git/jj mutation; no edits outside .ufo/waves/round-100/w1/R100Exec1* and own scratch (scratch removed at yield per contract).

## Artifacts (relative to lane root)

- .ufo/waves/round-100/w1/R100Exec1-run1.json / -run2.json (counter JSON: clean, 216 checks, 0 findings)
- .ufo/waves/round-100/w1/R100Exec1-run1-receipt.json / -run2-receipt.json (copies of live receipts)
- .ufo/waves/round-100/w1/R100Exec1-battery.json (121/121 battery cases ok)
- .ufo/waves/round-100/w1/R100Exec1.md (this report)

## Verdict

Both cold --live runs of the pinned driver with the pinned libraries reproduce every leg-level statement of C1 exactly (DUP3 untrusted dup-keep, EMPTY1 size-0 readback, MIXED exact refusal with nothing set, LAUNCH2PL/LAUNCH2PU trusted in order, DIR recursive webkitRelativePath walk with trusted events); checkCount 216, 0 findings, no setup endings, no leg-level statement observed false. Fresh npm install reproduces pinned libs. Battery 121/121.

VERDICT C1: neutral
