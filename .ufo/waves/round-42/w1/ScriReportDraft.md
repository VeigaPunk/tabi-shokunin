# ScriReportDraft — scoped findings

Deliverable: `.ufo/waves/round-42/w1/ScriReportDraft/report-skeleton.md` (draft skeleton, L1
completes; the filed report is the L1's). Seat report with the full command/output ledger:
`.ufo/waves/round-42/w1/ScriReportDraft/report.md`.

Ground: baseline `34e177959d1b7ce04afb85a001420e02631ce79e`, freeze
`9b6de3a19de11abdb80e82a1310abc64a40215bb`, draft HEAD
`0081bfdb93b6bd1bf2853bb128996f1a976b7218`. Skeleton section order: Work performed; Landed
changes; Before → after measurements; Sources & frontier; Trend verdicts; SHONEN; Stale-lane;
Wave shape; Tool installs; Misroot sweep; L0 questions.

Pre-filled facts: C1 live run exit 0 (`driverExit 0`, `counterExit 0`, `predicate true`,
`findings []`, `nonceMatches true`, receipt sha256 `3984455276…317b7e`, witness
`163f4eba…57d339`) with the bytes **untracked**; C1 battery 6/6, r39/r40/r41 replays exit 1,
baseline tree count 0; C2 checker 7 findings at baseline → 1 (`r4-quarantine-absent`) at the
freeze and at HEAD; D1 receipt/witness committed and sha-bound to the r41 measure record
(`416f6e4b…446db1` / `d3c9972e…f39d3`); D2 S148 `supersedes S146` + S146 `rejected`; D3
baseline control populated with its command and the 0; D4 slice-ids 38 with the TSV owed;
S148/S149 landed (registry 147 → 149 rows); wave w1 64 seats, attack 23/64, dispatched with
`taskCall` at epoch `1793201876.0697021`.

Findings routed to the L1:

1. **LOG census off.** `LOG.md` round-42 states "149 rows (A131/B7/C9; mined 122 / queued 15 /
   rejected 10)". Observed at freeze and HEAD: 149 rows, A133/B7/C9, mined 124 / queued 15 /
   rejected 10. The stated status cells sum to 147; A131/mined-122 is the pre-S148/S149 state.
2. **Misroot.** Untracked self-referential symlinks created 12:39 during the wave:
   `corpus/knowledge/knowledge -> …/corpus/knowledge/` and
   `corpus/lessons/lessons -> …/corpus/lessons/`. `git diff HEAD --stat` empty; directory
   loops remain for the owner to attribute and remove. No shokuknow/sibling/fleet write by
   this seat.
3. **C1 not admissible yet** — committed-at-measured-revision leg unsatisfied
   (`?? corpus/evidence/round42/`).
4. **C2 r4 wave-gated by design** — 38-row TSV absent until WAVE-DONE.

PENDING slots are marked with the command/artifact that fills them (WAVE-DONE results via
`parse-w1-results.mjs`, TSV, final tip, trend/SHONEN lines). No claim verdict was issued; no
tool install; scratch `/fast/scratch/hyaku/tabi-r42/ScriReportDraft/` deleted.

VERDICT ok — skeleton drafted with frozen facts cited and all unfilled slots explicitly PENDING.
