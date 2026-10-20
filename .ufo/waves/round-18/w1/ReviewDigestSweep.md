# ReviewDigestSweep — round-17 abbreviated-digest sweep (WAVE 1, TabiR18.ReviewDigestSweep)

VERDICT: PASS

Scope: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-17/` (27 files) and
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/` (194 files) — every occurrence of
`…` (U+2026) or `...` preceded by hex, classified as (a) abbreviated digest standing as the ONLY record
of a run claimed in round-17 lesson (`corpus/lessons/round-17.md`), SCORECARD (`SCORECARD.md:776-829`),
or SKILL (`SKILL.md:1894-1970`), vs (b) display abbreviation next to a full digest. Committed-bytes
checks ran against the lane tip `refs/heads/master` = `2bff864fdfee684ddbcd066cc8e735adaba2735c`
(read-only `git grep -In <needle> refs/heads/master`; worktree is dirty — 3 porcelain entries — so
nothing was taken from working-tree bytes). No tools installed; no git/jj writes; no subagents.

## Findings

### F1 (LOW) — claimed legacy-r15 receipts store the r15 measured revision mid-truncated, twice each

- `corpus/evidence/round-17/binding/legacy-r15.json:16` — stored `stdout` contains literal
  `measuredRevision=b7cf0446a31014a81b4882857c9...` (26 hex + `...`, `counter_changed_since_measurement`
  finding) and `measuredRevision=b7cf0446a31014...` (14 hex + `...`, `counter_digest_mismatch` finding).
  Verified in raw bytes (`read :raw:16`), not reader elision.
- `corpus/evidence/round-17/routed/binding-hardened/legacy-r15.json:22` — byte-identical `stdout`
  string, same two truncated forms (verified `:raw:22`).

These receipts are the committed records of the routed-defect-2 runs claimed in the lesson
("hardened-gate receipts: done (`routed/binding-hardened/{selftest,legacy-r15}.json`, history index)")
and, for the `binding/` copy, of the round-end binding set. Inside each receipt, the abbreviated digest
is the only form of the r15 measured revision; no full digest sits beside it in the same file.

Does the full digest exist elsewhere in committed bytes? **Yes** —
`b7cf0446a31014a81b4882857c90c565ebc14210` (40-hex, verified by `git grep` at the tip) is recorded at:
`​.ufo/waves/round-15/w1/MeasureContracts.md:230`, `.ufo/waves/round-16/w1/BindLegacyEvidence.md:18`,
`.ufo/waves/round-16/w1/ReconMeasure15.md:160`, `.ufo/waves/round-16/w1/RevC1Design.md:132`,
`.ufo/waves/round-16/w1/RevengeCounterIntent.md:163,166`. The committed wave-1 reviewer report
`.ufo/waves/round-17/w1/RevRouted12.md:69` already documents the truncation ("the stored strings end
`…=13\n` / `…b7cf0446a31014...\n`"). Severity LOW because the truncation is byte-faithful capture of the
round-15 gate's own output (round-17 bytes are frozen; the repair surface, if any, is a future index
note, not an edit), and the identity is one git-grep away.

### No other only-record abbreviated digest of a claimed run

Everything else hex+ellipsis in the two trees is a display abbreviation whose full form exists in
committed bytes, verified per class:

- `routed/liar/README.md:12,13,22,36` and `generate.mjs:10-11` (`5150611c…`, `8c5426f2…`, `c8b4100a…`,
  `9ecfcc9…/0754e44…/7b497d1…`, `bda4e18e…`, `fa1e12e1…`, `3c923598…`) → full forms in the same
  directory's `routed/liar/receipt.json` (`counters.hardened.sha256` c8b4100a9f60…94cb; 
  `counters.preHardening.sha256` bda4e18eecba…88f9; `liarBlobs` fa1e12e17b03…4eaf / 3c9235988399…187f;
  `realBlobsAtBase` 5150611c3d59…d6fb / 8c5426f254b7…f2ae; `originals.commits[].commit`
  9ecfcc911ce204d3a5b548a37819f01b0c640c10, 0754e448bbe81390e3c190f5a69d13364d0bc45f,
  7b497d15a5db17fa3fe3dad6bf44612680dd5e80) and in committed `w1/RevR16Liar.md:70-72`,
  `w1/RevRouted12.md:20`.
- `routed/binding-hardened/index.json:10,86,96,110`, `legacy-r15.json:39`, `selftest.json:36`
  (`5150611c.../8c5426f2...`, `1f84fb54.../481eefae...`) → full forms in-file (`index.json` registeredGate
  block: `1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6` /
  `481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3`; entries at :88-89, :97-98) and in
  `check-at-1205d26.json` (argv/at `1205d261776a349af99a5a205c7c2467fbabae16`, full digests).
- `.ufo/waves/round-17/PLAN.md:5,161,162` (`5859243…`, `36240c7…`, `1f84fb54…`) → baseline full at
  `PLAN.md:4`; `36240c70ee114347a79abb91cacab6c63044ce36` full in
  `w2/RoutedHardened.md:40` and both legacy receipts' argv/reproduce blocks; `1f84fb54…` full as above.
- `.ufo/waves/round-17/measure-c1.mjs:70-77` SKILL quotes (`75e7836…`) → full
  `75e7836b6c3090180aee2754e20a5d3cfb186e74` at :71; `bebe2efc4565bb068efd905e9ef78011bb6b4efd` at :75.
- `w1/C2ProbeLifecycle.md:128` (`8b005ad0…1474cd`) → full
  `8b005ad0d6db617f5d90717692db1f03237932e534729d9ef16cd1e07a1474cd` in committed bytes.
- `w2/ReRunHarness.md:14,31-32`, `w2/CriticPredicates.md:9`, `w2/RevNoteVsReceipt.md:13`
  (`de62820d…`, `0cfaeb7e…`, `9408d300…`) → full producer
  `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` in
  `corpus/evidence/round-17/webmcp-invoke/receipt.json:7` and `measurements.json:2151`; committed-receipt
  sha `0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346` in `w1/C2Harness.md:9`;
  preflight producer `9408d30036484fadbc8c2669678937633d18478a14b46c63d94ead9107…` full inside
  `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json:7,9`.
- The three counters' own claim records are full-form: `measurements.json:3-4` (baseline + measured
  revision 40-hex), `measurement-binding.json` counter `sha256` fields 64-hex, SCORECARD:794-796 counter
  digests 64-hex. `sources/*.md` prefix…suffix digests (`474083d6…8823` style) are backed by full digests
  in the lesson's source table and SOURCES rows. Adjacency sibling pins (`9011581d…` etc.) carry "full
  40-hex in the TSV" (`w1/…/skill2.md:87`) — `corpus/adjacency.tsv` at the tip.
- Non-hex ellipses observed and excluded: `measurements.json` stored gate-source lines
  (`...list(root, 'HEAD', …)` spread syntax; `stdout_tail` vocabulary ending `l0_line_...` at :2396) —
  code text, not digests.

## Context (abbreviated-only, but not runs claimed in lesson/SCORECARD/SKILL)

- Wave-1 sandbox-commit ids `7babdfd2`, `66b80768`, `8c330c8d` have **no full form anywhere in committed
  bytes** (prefix-length sweep returned nothing beyond the abbreviated forms), and `1ff9dc3b…`
  (`w1/C1Counter.md:77`, c1-sites control rev) likewise. These are the wave-1 counter runs
  (`w1/C1Counter.md:113`, `w1/C3Counter.md:95-98`) explicitly superseded as history: the landed claims
  were re-measured at `93bfead1f5f25f584353df3152a60209bbd89a2e` (full in SCORECARD:779 and
  `measurements.json:4`), and the lane's own reviewers flagged the unreceiptable revs
  (`w2/CriticQualityDraft.md:56` E26d; `w2/DraftSkill2.md:22` F2). `a84459cd5c8ba4816722955636aa0f0f43060b47`
  (the fourth wave-1 rev) does exist in full at `w1/C2Counter.md:63`.
- `harm-baseline.json:1031-1037` input pins (`b458b351...`, `4d894756...`, `56764241...`, `03cb4e17...`,
  `87ae779b...`, `0d0f00e2...`, `1d54c9e9...`) and `:1061` (`47e9ffdc...`) are 8-hex+`...`; the run they
  pin (harm baseline) is not claimed in lesson/SCORECARD/SKILL, and each full 64-hex digest was verified
  present in committed bytes (e.g. `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`).
- `harm-baseline.json:442` (`a916bfb1...` / `6e09c1e3...`) are wall-clock-derived fixture commit ids the
  file itself declares nondeterministic; full forms exist nowhere, by design, and nothing claims them.

## Residual risk and verification gaps

- Reader truncation was bypassed with `:raw` reads for every line cited as literal bytes; lines quoted
  from grep output carry the tool's `[col NNN]` elision and were not treated as file content.
- Sweep boundary: abbreviations of 1-5 hex digits followed by an ellipsis were not pattern-swept; none
  surfaced in the full `…`/`...` sweeps of both trees. `originals.bundle` (binary) matches hex prefixes —
  it is the git bundle carrying the three full liar ids, counted as a full-form location.
- SKILL.md's round-17 registry records its sha256 column abbreviated (`1579a794…91828` style); SKILL is
  outside the two swept trees and every one of those digests was verified full-form elsewhere committed
  (SCORECARD, `binding/*.json`, `receipt.json`) — noted here because SKILL is a claim source.
- Worktree was dirty (3 entries, round-18 seats); all existence checks used `git grep` at
  `refs/heads/master` = `2bff864fdfee684ddbcd066cc8e735adaba2735c`, never working-tree bytes.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReviewDigestSweep.md`
