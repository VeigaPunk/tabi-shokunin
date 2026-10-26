# ExecKillsB — C2 build (round 34, w1): self-test cases killing M04 M05 M07 M16 M18 M19

**Verdict.** All six mutants assigned to this seat are now killed by the gate's own `--selftest` alone:
each applies exactly once to the frozen gate, and applying it makes the self-test exit 3 with exactly one
`CASE … FAIL` line — the case built for that rule. The pristine gate still exits 0 (50/50 cases), and the
counter's neutral comment, decoy comment (quoting every mutant replacement) and whitespace twin at each of
the six mutant sites all still exit 0; no mutant find text was reworded (`unappliable 0`, every find occurs
once); the round-33 frozen forgery battery still reads predicate true (H0/H1/H2 admitted, 0 of 8 forgeries).
The frozen counter at my commit reads `killedCount 14 / 20` with `survivors M01 M03 M06 M08 M09 M10` — the
remaining six are the sibling executor's half, so the lane-level predicate is still false until both patches
merge. Two of my six (M04, M05) can only be killed by pinning *which* finding fired, because the fixture that
disables one rule always arms the next one; I added a case field that asserts the gate's own runtime finding
detail, never its source bytes.

## What I attacked

`scripts/check-bidi-runtime.mjs` (the runnable BiDi runtime gate), self-test section only, against the 20
frozen single-point mutants in `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (MUTANTS array). My slice:
M04, M05, M07, M16, M18, M19. Rule lines themselves were not touched; my diff's hunks are all at or after
line 875 (`goldenLines`, `lessonsDoc`, `CASES`, `runSelftest`), while the mutated rule lines sit at 145-150,
380-390, 510-560 and 720-870.

## Changes (all in the self-test part of the gate)

1. `goldenLines(…)` gains `bWsSessionSegment = null`: the `webSocketUrl` session segment can carry an id other
   than the session's own `sessionId` (M07 fixture). Default behaviour unchanged.
2. `lessonsDoc(ids, o = {})` gains `bGateRowNoSha`: the fixture `## Gate` row keeps its https URL and quote
   and loses only the 64-hex sha256 (M16 fixture). Call site passes the case options through.
3. `runSelftest` case comparison gains an optional `bDetailIncludes` expectation checked against the runtime
   finding detail (`out.entryDetail` / failing `row.detail`), and the results record now carries
   `detail` / `expectedDetailIncludes` so the JSON selftest output shows which finding fired.
4. Six `v3-b-*` CASES entries, one per assigned mutant, with the PRISTINE expected exit/admitted/reason/
   population (and, for M04/M05/M19, the expected finding).

New case ids (all prefixed `v3-` and carrying this seat's letter `b`):
`v3-b-m04-transcript-path-repeated`, `v3-b-m05-transcript-sha-repeated`,
`v3-b-m07-ws-session-segment-unbound`, `v3-b-m16-gate-row-without-sha`,
`v3-b-m18-clean-with-zero-admitted`, `v3-b-m19-sessionid-repeated`.
New builder option names: `bWsSessionSegment`, `bGateRowNoSha`, `bDetailIncludes`.

## Evidence (commands, exit codes)

Scratch clone `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` then
`git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` → `rev-parse HEAD`
= `59f1b47aae277e1670e4a824173da8cde7e388ee`.

1. Baseline (read, not rerun): `.ufo/waves/round-34/baseline/c2-J1-do-nothing.json` → `killed 8`,
   `survivors M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19`, `pristine.last … cases=44 passed=44`,
   `battery true`, gate sha `eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1`.
2. Pristine self-test at my commit (cwd = clone, `TMPDIR=$S/tmp`):
   `node scripts/check-bidi-runtime.mjs --selftest` → **exit 0**,
   `BIDI_RUNTIME_SELFTEST verdict=clean cases=50 passed=50`; the six new cases all PASS with the pristine
   values (e.g. `v3-b-m04… expected_exit=1 exit=1 admitted=0 reason=t1-receipt PASS`,
   `v3-b-m16… expected_reason=s1-source-row reason=s1-source-row PASS`).
   `--selftest --json` → **exit 0**, `pristine-selftest.json` records the exact finding details quoted in
   `table.md`.
3. Frozen counter (bytes untouched, run from the lane checkout, `--repo` my clone):
   `TMPDIR=$S/tmp node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev 11a3a0716592849f8a45d35c57c04b0b91ef3c25 --repo "$S/clone" --json`
   → **exit 1** (predicate not yet met at this commit: the sibling half is missing), result:

   ```
   {"predicate":false,"killedCount":14,
    "survivors":["M01","M03","M06","M08","M09","M10"],
    "unappliable":[],"twinsFailing":[],
    "pristine":0,"neutral":0,"decoy":0,
    "battery":true,"honest":{"H0":true,"H1":true,"H2":true},"forgeries":0,
    "gateSha256":"fb74449651086e41fd5c0a618a1c0e83323bbce254288b40be6ea864021a9ef7"}
   ```

   Per-mutant records for my six (`counter.json`): each `occurrences 1`, `exit 3`, `twinExit 0`, and
   `failingCases` = exactly that mutant's own new case id —
   M04 → `v3-b-m04-transcript-path-repeated`; M05 → `v3-b-m05-transcript-sha-repeated`;
   M07 → `v3-b-m07-ws-session-segment-unbound`; M16 → `v3-b-m16-gate-row-without-sha`;
   M18 → `v3-b-m18-clean-with-zero-admitted`; M19 → `v3-b-m19-sessionid-repeated`.
   No collateral case failed in any of the six mutant runs.
4. Hand verification of the mutant outcomes (`mutant-outcomes.json`): a throwaway clone at the same commit,
   each mutant written in with the counter's exact find→replace, `--selftest --json`:
   - M04 → exit 3; case detail `transcript sha256 repeated across runs (byte-identical copies)` (pristine:
     `transcript path repeated across runs: …run1/transcript.jsonl, …run1/transcript.jsonl`).
   - M05 → exit 3; case detail `sessionId repeated across runs: e3a0…ae4f, e3a0…ae4f` (pristine:
     `transcript sha256 repeated across runs (byte-identical copies)`).
   - M07 → exit 3; case exit 0, admitted 16, reason null (pristine: exit 1, admitted 0, `t1-receipt`,
     `run1: webSocketUrl session segment bbbb…bbbb != sessionId e3a0…ae4f`).
   - M16 → exit 3; case exit 0, admitted 16 (pristine: exit 1, admitted 0, `s1-source-row`,
     ``S002: no corpus/lessons/round-*.md `## Gate` row with an https URL and a 64-hex sha256``).
   - M18 → exit 3; case exit 0, admitted 0 (pristine: exit 1, admitted 0, population 16, failing 0).
   - M19 → exit 3; case exit 0, admitted 16 (pristine: exit 1, admitted 0, `t1-receipt`,
     `sessionId repeated across runs: 0f1e…e1f0, 0f1e…e1f0`).

## Rule → fixture map (smallest honest fixture)

| mutant | rule (baseline file:line) | fixture |
|---|---|---|
| M04 | transcript path distinctness, `scripts/check-bidi-runtime.mjs:797` | `samePath: true` — both runs cite `…/run1/transcript.jsonl` |
| M05 | transcript sha256 distinctness, `:798` | `sameBytes: true` — one text under two distinct run paths |
| M07 | webSocketUrl segment ↔ sessionId, `:388` | `bWsSessionSegment: "b".repeat(32)` on run1 only |
| M16 | s1 Gate-row 64-hex digest, `:750` | `bGateRowNoSha: true` — same host, same URL, no sha256 |
| M18 | clean guard `admitted >= 1`, `:867` | `cell: () => "no"` — population 16, admitted 0, failing 0 |
| M19 | sessionId pairwise distinctness, `:811` | same explicit 32-lower-case-hex `sessionId` on both runs, distinct `sessionTag` |

## Disclosure: why M04/M05 pin the finding, not the exit

A repeated transcript path is only constructible by citing one blob twice, so both runs' recorded sha256 must
equal that blob's — disabling the path rule always arms the byte-identity rule, which reports the same exit,
admitted count and reason (`t1-receipt`). Symmetrically, byte-identical transcripts necessarily carry the same
sessionId, so disabling the sha rule always lands on the sessionId rule. Neither mutant is observable at
exit/admitted/reason level; both are observable in *which* rule names the fixture. `bDetailIncludes` asserts
that runtime detail. It reads no gate bytes, so the counter's decoy/neutral/twin probes (which rewrite the
source) still pass — confirmed: `neutral 0`, `decoy 0`, `twinsFailing []`. The known residual disclosed at
freeze (a self-test that whitespace-normalises its own source) is not used here: the six new cases exercise
rules through fixtures only.

## Sourcing / frontier step

- Session id shape (32 lower-case hex) used by the M07 and M19 fixtures rests on registry row **S127**
  (ChromeDriver 154 `util.cc` id minting), which is present in `corpus/SOURCES.md` at the freeze; I read it
  this round (`corpus/SOURCES.md:141`).
- Browsing-context id shape (upper-case 32 hex) is inherited unchanged from the existing `goldenLines`
  builder; it is grounded by the honest transcripts (`corpus/evidence/round-32/bidi/run1/transcript.jsonl`:
  `"context":"31B8FE9C25C36020CBB175F250715903"`) and its registry row is **still needed** (S130+); that
  matters for the sibling id-shape cases (M06/M08), not for mine. `S130`+ does not exist at the freeze
  (`git show 15dfacc…:corpus/SOURCES.md` ends at S129), and seats never edit the registry, so nothing is
  drafted here beyond this note.
- No network fetch, no browser launch, no tool install this seat.

## Risks / merge notes

1. The sibling executor adds cases at the same `CASES` tail; the L1 must merge two diffs that both touch
   `runSelftest` and `goldenLines`. My ids carry `v3-` + `b`, my option names carry the `b` prefix, so a
   textual merge is unambiguous.
2. If the sibling half also needs a detail-level assertion, `bDetailIncludes` is reusable as-is; it is optional
   and absent-means-unchecked, so existing cases are unaffected.
3. Until both patches land, the lane-level predicate stays false (`survivors M01 M03 M06 M08 M09 M10`); my
   half alone cannot make it true, and I did not touch those rules.
4. `bWsSessionSegment`/`bGateRowNoSha` are test hooks on exported/fixture builders; production behaviour and
   the counter's probes are unaffected (pristine/neutral/decoy/twins all exit 0).

## Deliverables

- `.ufo/waves/round-34/w1/ExecKillsB/cases.patch` — `git diff 59f1b47aae277e1670e4a824173da8cde7e388ee 11a3a0716592849f8a45d35c57c04b0b91ef3c25 -- scripts/check-bidi-runtime.mjs` (86 lines, sha256 `d4c820d666688ad04b05b3de0cdee84da84a07bac9068f6e397ba39ed98645d7`).
- `.ufo/waves/round-34/w1/ExecKillsB/counter.json` — full frozen-counter output at that commit.
- `.ufo/waves/round-34/w1/ExecKillsB/table.md` — mutant | rule | case id | pristine vs mutant outcome.
- `.ufo/waves/round-34/w1/ExecKillsB/pristine-selftest.json` — pristine `--selftest --json` (50/50, exit 0).
- `.ufo/waves/round-34/w1/ExecKillsB/mutant-outcomes.json` — per-mutant hand verification.
- Scratch clone `/fast/scratch/hyaku/tabi-r34/ExecKillsB` removed before yielding.
