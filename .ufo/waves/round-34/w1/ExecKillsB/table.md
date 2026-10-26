# C2 (round 34 w1, seat ExecKillsB) — per-mutant kill table

Commit: 11a3a0716592849f8a45d35c57c04b0b91ef3c25 (parent 59f1b47aae277e1670e4a824173da8cde7e388ee).
Pristine gate self-test: `BIDI_RUNTIME_SELFTEST verdict=clean cases=50 passed=50`, exit 0.
Frozen counter at that commit: killed 14/20, survivors M01 M03 M06 M08 M09 M10 (the sibling seat's half),
unappliable 0, twinsFailing 0, pristine/neutral/decoy exit 0, battery predicate true (H0/H1/H2 admitted, forgeries 0).

Pristine values come from `pristine-selftest.json` (case objects); mutant values from
`mutant-outcomes.json` (each mutant applied with the counter's exact find→replace to a throwaway
clone at the same commit, then `--selftest --json`).

| mutant | rule it disables (file:line at baseline) | case id (added) | pristine outcome | mutant outcome |
|---|---|---|---|---|
| M04 | transcript path distinctness across runs (`scripts/check-bidi-runtime.mjs:797`) | `v3-b-m04-transcript-path-repeated` | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `transcript path repeated across runs: corpus/evidence/round-32/bidi/run1/transcript.jsonl, corpus/evidence/round-32/bidi/run1/transcript.jsonl` → PASS | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `transcript sha256 repeated across runs (byte-identical copies)` → CASE FAIL, self-test exit 3 |
| M05 | transcript sha256 distinctness across runs (`:798`) | `v3-b-m05-transcript-sha-repeated` | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `transcript sha256 repeated across runs (byte-identical copies)` → PASS | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `sessionId repeated across runs: e3a0ae31f5ca9591800dcbf63f70ae4f, e3a0ae31f5ca9591800dcbf63f70ae4f` → CASE FAIL, exit 3 |
| M07 | webSocketUrl session segment == sessionId (`:388`) | `v3-b-m07-ws-session-segment-unbound` | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `run1: webSocketUrl session segment bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb != sessionId e3a0ae31f5ca9591800dcbf63f70ae4f` → PASS | exit 0, admitted 16, reason null → CASE FAIL, exit 3 |
| M16 | s1 `## Gate` row 64-hex sha256 requirement (`:750`) | `v3-b-m16-gate-row-without-sha` | exit 1, admitted 0, pop 16, reason `s1-source-row`, detail ``S002: no corpus/lessons/round-*.md `## Gate` row with an https URL and a 64-hex sha256`` → PASS | exit 0, admitted 16, reason null → CASE FAIL, exit 3 |
| M18 | clean guard `admitted >= 1` (`:867`) | `v3-b-m18-clean-with-zero-admitted` | exit 1, admitted 0, pop 16, failing 0, reason null → PASS | exit 0, admitted 0, reason null → CASE FAIL, exit 3 |
| M19 | sessionId pairwise distinctness across runs (`:811`) | `v3-b-m19-sessionid-repeated` | exit 1, admitted 0, pop 16, reason `t1-receipt`, detail `sessionId repeated across runs: 0f1e2d3c4b5a69788796a5b4c3d2e1f0, 0f1e2d3c4b5a69788796a5b4c3d2e1f0` → PASS | exit 0, admitted 16, reason null → CASE FAIL, exit 3 |

In every mutant run exactly one case failed (`failingCases` = that mutant's own case id); no collateral case broke.

## Why M04 and M05 assert the finding, not just the exit

A path collision is only reachable with one blob cited twice, so both runs' recorded sha256 must equal that
blob's — the byte-identity rule behind the path rule is therefore always armed and fires the moment the path
rule is disabled. Symmetrically, byte-identical transcripts always carry the same sessionId, so M05's
fall-through lands on M19's rule. Neither mutant can change exit/admitted/reason; both change WHICH rule names
the fixture. The cases therefore pin the finding with a new optional case field `bDetailIncludes`, compared
against the gate's own runtime output (`row.detail` / `entryDetail`), never against the gate's source bytes.

## Fixture design (smallest honest fixture per rule)

- M04: `samePath: true` — both runs cite `…/run1/transcript.jsonl`; existing builder option.
- M05: `sameBytes: true` — one transcript text written under two distinct run paths; existing builder option.
- M07: new builder hook `bWsSessionSegment` — run1's `webSocketUrl` carries `b`×32 (32 lower-case hex, the
  S127 session-id shape) while that run's `sessionId` is the seed-derived id; every other field stays golden.
- M16: new builder hook `bGateRowNoSha` (option on `lessonsDoc`) — the `## Gate` row for S002 keeps its
  `https://e.test/s002` URL and receipt quote and loses only the 64-hex sha256; registry host stays equal.
- M18: existing `cell` hook returning `"no"` — 16 measured-but-unmeasured rows, population 16, admitted 0,
  failing 0, so only the `admitted >= 1` clause of the clean guard can refuse it.
- M19: explicit `sessionId` on both runs, same 32-lower-case-hex value `0f1e…e1f0`, distinct `sessionTag`
  (⇒ distinct bytes and distinct upper-case context ids), so only the pairwise-distinctness rule can refuse it.
