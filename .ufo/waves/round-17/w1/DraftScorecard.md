VERDICT: PASS

Scope: draft of the `## Round 17 — hyaku` SCORECARD section, mirroring the round-16 section (`SCORECARD.md:732-774`) and the round-16 scorecard draft (`.ufo/waves/round-16/drafts/DraftScorecard.md`). Read-only on all lane files; no git, no jj, no counter run (counters do not exist yet).

Facts verified by read or glob:
- Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, clean (`.ufo/waves/round-17/PLAN.md:4`).
- Round-16 end scalars: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8 (`SCORECARD.md:742-747`). Saturation line 8, window 3, round 17 = position 1 under the round-16 reading (`SCORECARD.md:773`).
- Round-16 capability `webmcp-cdp-observation` at `SCORECARD.md:766`; the top-level Capabilities table still reads "— none yet —" (`SCORECARD.md:385`).
- Start census: rows 40, A31/B4/C5, mined33/queued2/rejected5 (`PLAN.md:7`); last SOURCES row S040 (`corpus/SOURCES.md:54`).
- Knowledge notes: 33 files in `corpus/knowledge/*.md` (glob), matching `SCORECARD.md:760`.
- `corpus/adjacency.tsv` absent at baseline (glob → not found); `.ufo/waves/round-17/drafts/` did not exist before this draft.
- Claim-rule text: `AXES.md:25-41` (1–3 distinct-axis claims, lowest-axis obligation, no harm), `AXES.md:57-64` (capabilities), `AXES.md:66-73` (stagnation nudge), `AXES.md:75-83` (SCORECARD contract).

Findings for L1:
1. Pointer drift in PLAN: `PLAN.md:24` cites "corpus/README.md:308-309" for the frontier phrase "tool invocation as committed evidence". The phrase is at `corpus/README.md:303` (grep-confirmed); `:307-314` is the supersession note. Correct the pointer at integration.
2. Top-level capabilities table not updated since round 16 (`SCORECARD.md:385`); decision left to L1.
3. Top-level axes table (`SCORECARD.md:91-100`) is the training-era table; hyaku scalars live in the per-round tables. Draft follows rounds 12–16.
4. Stagnation waiver: not applicable (capability within window, `SCORECARD.md:766`, `:773`); lowest-axis obligation holds; C1 satisfies it.
5. Before-values are grounded: C1 0 is [INFERENCE] from `PLAN.md:61-63` and `:94-96`; C2 0 grounded at `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`; C3 0 grounded by absence of `corpus/adjacency.tsv`.
6. Round-18 saturation/position reading is [INFERENCE] by round-16 precedent (`SCORECARD.md:773`); L1 to confirm.

Not verified (unrun): counter outputs, receipt summaries, SOURCES additions, knowledge note, adjacency rows. Every PENDING in the draft is one of these.

Tooling: none installed or updated.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/scorecard.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/DraftScorecard.md
