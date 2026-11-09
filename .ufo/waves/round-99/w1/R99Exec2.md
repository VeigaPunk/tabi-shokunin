# R99Exec2 — C1 scale, stability and live killers

Seat R99Exec2 (`/skill:godspeed`). Plan `plans/round-99.md` §Claim + §Declared limits
1-8 read in full. Counted runs on pinned driver `98efdc12…b89f8`, Chromium
155.0.8059.84, ports 34621,34622,34623 (counting) / 34624,34625,34626 (killers).

## Axes
- Stability at scale (80 legs vs 24): frontier = exit code + findings on both runs.
- Live-killer behaviour (r98 D3 / exit-3 mapping, four `--live`-only ids).
- Trust-polarity / refusal invariants deep-checked against raw receipts.

## Tooling (RULES.md read 2026-11-09)
No pacman/sudo (paused host-wide; seat spec also forbids sudo — obeyed).
Only install: `puppeteer-core@25.16.0`, `playwright-core@1.65.0` via npm registry,
`npm install --no-audit --no-fund` into scratch
`/fast/scratch/hyaku/tabi-r99/R99Exec2/deps` (`npm init -y` + install). Verified:
`node -e …` printed `25.16.0 1.65.0`. Channel: npm registry. Reason: client deps.
Scratch removed before yield (`rm -rf`, verified gone). No chromium left on any
assigned port (`pgrep -f remote-debugging-port=3462*` empty).

## Counting runs (exact commands, exit codes)
1. reps10:
`node …/check-client-oopif-uploadsets-round99.mjs --lane … --expect-driver-sha256
98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 --live --deps
…/R99Exec2/deps --scratch …/R99Exec2/r10 --ports 34621,34622,34623 --json --reps 10`
→ `rc=0`, `verdict: clean`, `driverRun.status 0`, `legs:80, failures:0,
launchFailures:0`, `checkCount 898`, `findings: []`, `launchFailed: []`,
`orphansSwept: 0`. 125.07s. Saved as `R99Exec2-reps10.json` + receipt
(`R99Exec2-reps10-receipt.json`, sha `4099fba0…`).
2. default (reps 3):
same command without `--reps`, `--scratch …/def` → `rc=0`, verdict clean,
`legs:24, failures:0`, `checkCount 282`, `findings: []`. 38.21s.
Saved as `R99Exec2-default.json` + receipt
(`R99Exec2-default-receipt.json`, sha `3ea4ae90…`).
Both `--live` runs are reproduced before/after matches of the scored evidence
(`.ufo/waves/round-99/scored/c1-live.json`, `rc 0`, 282 checks, 0 findings):
same verdict, same outcome partition, same checkCount 282 on default reps.

## Per-arm outcomes (both counted runs, identical shape)
- PUAM (×3 / ×10): resolved; `[[tabi-r99-missing.txt,0,text/plain]]` on #s;
  events exactly `[["s","input",true],["s","change",true]]`; **both** reads
  `["err","NotFoundError","A requested file or directory could not be found at
  the time an operation was processed."]` — no PUAM read ever deviated.
- PLAM: error name `Error`, message exactly
  `ENOENT: no such file or directory, stat '<missingPath>'`; nothing set, no event.
- PLBX: `[[tabi-r99-bytes.png,256,image/png]]`, events `[s,input,false] +
  [s,change,false]`, both reads `['ok',256,40aff2e9…944880]`.
- PLBM: `[[p1,27,text/plain],[p2,36,application/octet-stream]]` on #m,
  untrusted input/change, both reads of both files ok/size/sha.
- PLBN / PUCN: exact frozen Error strings
  (`locator.setInputFiles: Error: Non-multiple file input can only accept single
  file` / `Multiple file uploads only work with <input type=file multiple>`);
  both inputs `[]`, no event, no read — never set a file or fired an event in
  any rep of either run.
- PLLP / PUCM: `[[a,22,text/plain],[b,30,text/plain]]`, trusted input/change, intact reads.
Payload legs (PLBX, PLBM) never saw a trusted event; path legs (PUAM, PLLP, PUCM)
never saw an untrusted one. Every events list matched exactly (no click, no
wrong-input event).

## Live killers (second attempt; first collided with counting ports)
First invocation (ports 34624,34625,34626 concurrent with counting on
34621,34622,34623) ended `rc=2`, `verdict: setup`, killer `K-exit`:
`free-port precheck: port 34624 busy: listen EADDRINUSE`. That was a seat
port collision (same triple family contention), not a law finding; both ports
verified free via `ss`, no leftover chromium, then re-run strictly serially.
Exact serial command:
`node …/livekillers-client-oopif-uploadsets-round99.mjs --lane … --deps
…/deps --scratch …/kl --ports 34624,34625,34626 --json`
→ `rc=0`, `killers:6, ok:6, failed:[]` → `R99Exec2-livekillers.json`.
Table (frozen / neutralised):
- K-exit: rc1 `driver-exit` / rc0 clean. K-ports: rc1 `ports-bound` / rc0.
- K-missing: rc1 `missing-bound` / rc0. K-tmpdir: rc1 `tmpdir-bound` / rc0.
- K-partial: rc1 `child-files` (ids `driver-exit,payloads,failures,child-files`,
  `launchFailed:[PUAM-1]`) / neutral mapping rc2 setup (r98 D3).
- K-launchonly: rc2 setup (`launchFailed:[PUAM-1]`, detail
  `"chromium never came up (driver exit 3) on [\"PUAM-1\"]; no law finding…"`);
  no neutral form (positive control).
No killer deviated from its frozen expectation; no live finding verbatim
beyond the frozen IDs.

## Kill-rule assessment
No leg in any run violated any leg-level statement of C1. No falsifying leg;
no refusals that set/fired; no PUAM read that didn't reject NotFoundError;
even the neutralised/mutant livekiller runs behaved per frozen expectations.
This seat's stability thesis therefore adds evidence *for* C1, does not falsify.

## Evidence artifacts (relative to lane root)
`R99Exec2-reps10.json`, `R99Exec2-default.json`, `R99Exec2-livekillers.json`,
`R99Exec2-reps10-receipt.json`, `R99Exec2-default-receipt.json` (this file,
`R99Exec2.md`) under `.ufo/waves/round-99/w1/`. Receipt `checkCount` 898/282
and `orphansSwept 0` across runs. Scratch `R99Exec2/{deps,r10,def,kl}` removed.

## Risks / blockers
- Collisions: running counting and killers concurrently on adjacent port
  triples still raced (first killers run got EADDRINUSE setup). Future seat
  jobs should run sequentially; this is operability, not a C1 law issue.
- Only `--live` runs are law evidence; `--receipt` forgeries would still pass
  receipt mode (declared limit 6).

VERDICT C1: neutral
