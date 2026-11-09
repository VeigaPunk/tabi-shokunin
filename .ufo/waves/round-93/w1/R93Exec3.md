# R93Exec3 — freeze-stamp gate (mined-mistake gate: freeze stamp)

Task: `/skill:godspeed` seat R93Exec3. Create ONE script
`scripts/check-freeze-stamp-round93.mjs` (node, no deps), run its selftest and
the gate on rounds 90–93 of the real lane, save JSON outputs under
`.ufo/waves/round-93/w1/`.

Tooling: node v24.21.0, git 2.56.0 (both preinstalled system binaries; no
installs were needed, so no pacman/uv/npx activity). No Chromium runs, no
ports used. No git/jj mutation anywhere; all lane git access was read-only
(`show master:<path>`, `log --diff-filter=A`, `rev-parse --verify
master^{commit}`). Fixture selftest used a `git init -q -b master` repo under
the assigned scratch and asserted `rev-parse --show-toplevel` == fixture dir
before writing; local user.name/email set in that fixture repo only.

## Script created

- `scripts/check-freeze-stamp-round93.mjs`

Usage: `node check-freeze-stamp-round93.mjs --lane <ABS lane> --round <N>
[--json]` and `--selftest --scratch <ABS dir>`. Semantics per frozen spec:
reads `.ufo/waves/round-N/claims.json` at master tip, takes the oldest
`--diff-filter=A` line (`%H %cI`) as the adding commit, compares
`claims.frozenAt` (ISO 8601 with offset) against commit committer time:
`frozenAt > commit` → `future-frozenAt` (exit 1); missing/unparseable
`frozenAt` → `frozenAt-unparseable` (exit 1); path absent at master (or no
adding commit in master history) → verdict `setup` (exit 2); usage errors exit
2; else clean (exit 0). JSON shape {gate, round, path, addedIn, committedAt,
frozenAt, verdict, findings} with verdict `clean`|`finding`|`setup`.
`frozenAt` must match an ISO-8601-with-offset pattern AND parse; r90/r91
free-text values deliberately count as unparseable.
Selftest builds a fixture repo under `--scratch` (mkdtemp, toplevel asserted,
local identity, branch master, committer date pinned to
2026-11-08T20:00:00-03:00) with three rounds — frozenAt before (clean), after
(`future-frozenAt`), garbage (`frozenAt-unparseable`) — and asserts the three
verdicts/findings/exit codes; exit 0 iff all three match. On pass the fixture
is removed; on fail it is retained for inspection.

## Commands and exit codes (exact)

All from `/fast/scratch/hyaku/tabi-r93/R93Exec3` (scratch created with
`mkdir -p`; fixture removed by the passing selftest itself).

- Selftest:
  `node …/scripts/check-freeze-stamp-round93.mjs --selftest --scratch
  /fast/scratch/hyaku/tabi-r93/R93Exec3 --json >
  .ufo/waves/round-93/w1/R93Exec3-selftest.json`
  → rc 0, `pass: true`, cases clean / `future-frozenAt` / `frozenAt-unparseable`.
- Gate on real lane (`--lane /home/vgpnk/Projects/shokunin/tabi-shokunin
  --round <N> --json`, output to `.ufo/waves/round-93/w1/R93Exec3-r<N>.json`):
  - `--round 90` → rc 1, verdict `finding`, findings [`frozenAt-unparseable`]
    (frozenAt is free text starting "2026-11-08. The scored receipt…");
    addedIn f2b69440, committedAt 2026-11-08T12:11:41-03:00.
  - `--round 91` → rc 1, verdict `finding`, findings [`frozenAt-unparseable`]
    (same free-text form); addedIn 249b7d0c, committedAt 2026-11-08T13:15:09-03:00.
  - `--round 92` → rc 1, verdict `finding`, findings [`future-frozenAt`]
    (frozenAt 2026-11-08T20:05:00-03:00 vs addedIn 2bac1048 committedAt
    2026-11-08T20:02:04-03:00) — matches the expected spot-check.
  - `--round 93` → rc 0, verdict `clean` (frozenAt 2026-11-08T20:47:56-03:00
    vs addedIn 7a7f39f3 committedAt 2026-11-08T20:48:00-03:00).
- Extra probes (not saved): non-JSON output prints one line; `--round 999`
  (absent path) → rc 2 verdict `setup`; relative `--lane` → rc 2; missing
  `--round` → rc 2. No chromium processes involved (no ports assigned).

## Outputs saved (relative to /home/vgpnk/Projects/shokunin/tabi-shokunin)

- `scripts/check-freeze-stamp-round93.mjs` (the one script)
- `.ufo/waves/round-93/w1/R93Exec3.md` (this report)
- `.ufo/waves/round-93/w1/R93Exec3-selftest.json`
- `.ufo/waves/round-93/w1/R93Exec3-r90.json`
- `.ufo/waves/round-93/w1/R93Exec3-r91.json`
- `.ufo/waves/round-93/w1/R93Exec3-r92.json`
- `.ufo/waves/round-93/w1/R93Exec3-r93.json`

## Verdicts and risks

- Gate calibrated: selftest 3/3 pass; r92 reproduces the expected
  future-dated freeze (rc 1); r93 is clean (rc 0, frozenAt 4 s before the
  freeze commit); r90/r91 flag `frozenAt-unparseable` because their
  `frozenAt` strings are prose, not ISO 8601 — a correct literal reading of
  the frozen spec ("frozenAt missing/unparseable → exit 1"), though the L1 may
  wish to treat pre-r92 prose stamps as out of scope for this gate.
- Path-absent → exit 2 covers both "file absent at master" and "no adding
  commit in master history" (e.g. file present but never added on master
  would fall through to setup). `master` resolution failure is a usage error
  (exit 2) as specified.
- No frozen file (predicate, counter, driver, battery, pin, control,
  claims.json, plan) was edited; lane reads were read-only git only. No
  commits, no background jobs, no installs. Scratch
  `/fast/scratch/hyaku/tabi-r93/R93Exec3` removed after copying outputs.

VERDICT C1: neutral
(the gate is record work, not C1)
