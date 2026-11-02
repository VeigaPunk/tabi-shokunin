# Round 51 — tabi (Windows host; the form-interaction residual with input-domain fill and a server-side witness, the meter's host-shape fix and re-bind, the standing environmental m3 verdict closed by byte-truth grading, the r50-closure D-1/D-2/D-3 corrections of record, the standing L0 consolidated)

Baseline `c54749228e3b71f3d3c2d1f6a8167d89c2233a8e` → freeze
`1ecb86bf1be4ab88a8ebc99534a3f818346405e8` (claims.json + four instruments + round-open
controls + census start, BEFORE any data) → C1 data `33967b108af1ae9f85c96b50dc9b3bebd5a91d62`
(both ledgers re-bound at one fresh snapshot; meter v11 GREEN at the data revision, no
correction cycle consumed) → C2 data `08cc4b72552f266cff0bd60a435f7cbcbf430748` (the live
form journey receipt + six PNGs + counter receipts) → work commit (this round's corpus,
SCORECARD, LOG, PROVINCE) → final receipt commit (the gate's at-R verdict; the r50
`ea11da95` post-integration-appendix pattern). Three declared claims, every after-state
produced by committed instruments at its data revision. Carry-in from the r50 non-author
closure (all four routed items addressed; none is a claim): (1) D-1 prose class-split —
correction of record below (the receipt's own Counter governs); (2) D-2 stale S161
census-end sentence — dated correction below; (3) D-3 superseded counter-sha
parenthetical — correction of record below; (4) the `tabi | round-44` L2-floor L0 —
still open, and per the routing note the standing per-round mentions are CONSOLIDATED
into one standing PROVINCE.md line this round (see Province), replacing the per-round
re-statements.

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json (ChromeDevTools/devtools-protocol), https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (third open; today's fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` on all three fetches, master unchanged between 2026-10-31 and 2026-11-01; no new row — the round needed the Input-domain primitives already registered under this row) | 2026-11-01 | `curl -q -sL --proto =https -o .ufo/waves/round-51/sources/browser-protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` (== the registered anchor) | "This method emulates inserting text that doesn't come from a key press" (13 words; the Input.insertText description; verbatim 1 hit in the opened bytes) and "Dispatches a mouse event to the page." (7 words; the Input.dispatchMouseEvent description; verbatim 1 hit) — the two primitives the form legs run on |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check
remains the closure's duty):
ADMIT — S153 re-open (fresh fetch byte-identical to the registered anchor, staged; the
Input.insertText and Input.dispatchMouseEvent descriptions verbatim in the opened bytes;
load-bearing for C2: they are exactly the primitives the fill and submit legs run on).
ADMIT — C1 (the round-open red control 23 findings on the inherited v10 generation — a
new class shape: the fleet root became itself a git worktree and the sibling links are
NTFS symlinks, so v10's readdir-isDirectory roster scan derived the roster as {.git} and
dropped all 16 siblings; the versioned v11 meter fixes the roster scan with two hunks,
pure core byte-identical, diff committed; the rosterfix-on-r50-ledgers control isolates
the fix — same ledgers, v10 → roster {.git} 23 findings, v11 → roster 16 and exactly the
7 real head races; ledgers re-bound at ONE fresh snapshot with 0 new adjudications, 16
dispositions carried by exact whole-line quote match; GREEN at `33967b10`: exit 0,
predicate true, 0 findings, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12};
v11 selftest 16/16; no correction cycle consumed).
ADMIT — C2 (the r49/r50 planned residual exercised at `08cc4b72`: the live 6-leg journey
A→B→C→back-to-B→form→echo over the inline loopback HTTP fixture, the form legs driven
with the CDP Input domain — a real mouse click into the field, Input.insertText of the
invocation-bound nonce, the DOM value read back, a second mouse click on the form's own
submit button — the GET submit witnessed SERVER-SIDE (fixture served log:
`/echo?field=<nonce>`) and CLIENT-SIDE (the echo page renders the received value);
history at C [data:, a, b, c] 4/3 and back leg 4/2 reproduced; six per-step URL/title/PNG
pins; Edg/156.0.4314.58; teardown sweep 0; counter r51 green 0 findings,
couldNotEvaluate []; cross-refusal r50-counter-refuses-r51 5 findings; counter selftest
17/17 at the freeze; the capability row `webview2-form-journey-windows` enters the table
at the work commit).
ADMIT — C3 (the standing environmental verdict closed in the versioned v4 gate: the
round-baseline bytes read verdict=failed mismatches=1 counting 656 status rows of which
the measured byte-truth is 650 artifact — 648 byte-identical-or-NTFS-illegal + 2
case-collision spellings; v4 grades each row by byte-truth against the measured tree,
discloses artifact rows under the declared class `m3-index-artifact` (never a mismatch)
and keeps every real-drift branch refusing; the gate's own selftest runs on this host
for the first time since the migration (fixture-root path normalization + the r49-known
EPERM cleanup hardened) and passes 45/45 with four new cases; sandbox red/green: the
baseline v3 bytes read the artifact sandbox mismatches=1, the v4 bytes read the same
sandbox clean with the artifact disclosed; the two genuinely-modified inherited worktree
files restored to their committed bytes under the uncommitted-round-work clause BEFORE
the after-measurement; the at-R verdict is measured post-commit per the r50
post-integration-appendix pattern).
REJECT — the round-baseline v3 gate bytes for host use (its m3 counts the host's broken
index's phantom rows as unlanded work: mismatches=1 on a tree holding no unlanded work;
its selftest cannot even run on this host — fixture root mismatch on every fixture). The
bytes stay committed at the baseline rev; the v4 gate supersedes them for host use with
the diff committed (`controls/selfassessment-v3-v4.diff`).
REJECT — the v10 meter for this host shape (its roster scan drops every symlinked lane;
23 findings at round open). Superseded by v11 for roster derivation only; the pure core
is byte-identical and the diff names every changed line
(`controls/v10-v11-meter.diff`).
REJECT — the fixture generator's first drafts during authoring (three fixture receipts
disagreed with the counter on first selftest run: the resolution-not-applied paths block
was self-consistent under the broken shape and produced 2 findings not 3; the
tampered-shot fixture rode a journey receipt and gained a spurious main-shot finding;
the cross-schema receipt mixed nonce generations so the invocation-binding check fired).
Caught by the counter's own 17-case selftest at authoring time (14/17 first run), fixed
in the fixtures before the freeze; the passing run overwrote the failing receipt in
place — disclosed here; nothing was frozen with a failing fixture set (the freeze
receipt `measure/c3-counter-selftest-at-freeze.json` is the 17/17 run).

## Corrections of record (r50-closure carry-in; append-only — the r50 bytes are not edited)

- **D-1 (prose number drift, class number-drift).** Superseded text: the r50 claims.json
  C1 frozenPredicate parenthetical, the r50 lesson Measurements bullet and the r50 report
  bullet decompose the v9 red control as "12 lane-screen-head-mismatch + 3 sha + 3 lines
  … + 1 further head mismatch". The committed receipt's own Counter is the governing
  decomposition: `.ufo/waves/round-50/controls/c1-meter-v9-red-at-round-open.json`
  findings are **11 lane-screen-head-mismatch / 4 lane-screen-sha-mismatch /
  4 lane-screen-lines-mismatch / 2 delta-line-missing / 1 delta-quote-not-whole-line /
  2 delta-line-invented = 24** (kotoba carries a sha+lines pair beyond the three named
  provinces; kasegi/kengaku/mado/kotoba each contribute head+sha+lines or head+sha+lines+delta
  rows). The operative headline numbers (exit 1, predicate false, findingCount 24) were
  correct everywhere and the receipt itself was always the instrument output. Read the
  receipt, not the prose, for any per-class split.
- **D-2 (stale sentence, class stale-premise).** Superseded text: the r50 lesson's
  Census → End sentence "S161's URL is new to the registry and lands INSIDE the Registry
  table (after the S160 row, before the S159 row …)". True of the during-round draft,
  false of the final state: the S161 row was withdrawn pre-commit at the E04 duplicate_url
  refusal (the same lesson documents the withdrawal) and the registry ended the round at
  160 rows. The committed census-end receipt (exit 0, 22 W04) was and is fine. Correction
  dated 2026-11-01.
- **D-3 (label leftover).** Superseded text: the r50 claims.json C3 frozenPredicate
  parenthetical "the r50 counter (frozen sha 8372402c…)". That freeze-time counter sha
  was superseded by amendment 2; the operative `frozenDigests` pin (b7f54586…) governs,
  matches the committed counter bytes, and no measured predicate binds 8372402c. The r50
  bytes are not edited; this entry is the correction of record.

## Province note (the L0 consolidation)

The `tabi | round-44` L2-floor L0 stays open and routed around (fifth round running).
Per the closure's routing note, this round CONSOLIDATES the standing per-round mentions
into one line in PROVINCE.md (the standing-disposition line under Host surfaces); the
per-round carry-in lists from this round on refer here instead of re-stating the
disposition. The question is never treated as answered.

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind + the v11 host-shape fix; measured at
  `33967b108af1ae9f85c96b50dc9b3bebd5a91d62`):
  - Before: `node .ufo/waves/round-50/counters/c1-adjacency-host-v10.mjs --rev
    c5474922… --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false,
    **findingCount 23** (10 audit-status-mismatch + 1 roster-lane-uncovered `.git` +
    12 delta-lane-not-on-roster — the roster artifact: roster = {.git}) — receipt
    `.ufo/waves/round-51/controls/c1-meter-v10-red-at-round-open.json` (round open,
    before any lane write).
  - Isolation: `node .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs` (with the
    r50 ledger names via the committed control) → counts {roster:16, mapRows:16,
    auditRows:16, deltaLanes:12}, **7 findings, all lane-screen-head-mismatch** —
    receipt `controls/c1-meter-v11-rosterfix-on-r50-ledgers.json`; the diff v10→v11 is
    committed (`controls/v10-v11-meter.diff`, roster-scan hunks + retarget only, pure
    core byte-identical).
  - After: `node .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs --rev
    33967b10… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12} —
    receipt `measure/c1-meter-green-at-data.json`; NO correction cycle consumed.
  - Instrument: `--selftest` → exit 0, allPass=true, cases=16, pass=16
    (`measure/c1-meter-v11-selftest.json`).
  - Ledgers: `awk -F'\t' 'NR>1 && $1=="lane"{n++} END{print n}'
    corpus/adjacency-host-delta-r51.tsv` → 12; line rows 16; audit rows
    `grep -c '^kake\|^kagi\|^kama\|^kumitate\|^kaidoku\|^revenger'
    corpus/adjacency-host-audit-r51.tsv` → 16 total (10 unchanged + 6 sibling-absent);
    dispositions carried from delta-r50 by exact whole-line quote match, **0 new
    adjudications** (kengaku's province advanced 732 → 778 lines with the BG-hit set
    unchanged at 0 — sha re-pinned, no disposition change).
- C2 (coverage — the form-interaction capability; measured at
  `08cc4b72552f266cff0bd60a435f7cbcbf430748`):
  - Evidence: `git ls-tree -r --name-only <REV> -- corpus/evidence/round51 | wc -l` →
    baseline **0** → **7** (receipt.json + 6 per-step PNGs).
  - Live run: inline loopback HTTP fixture on ephemeral port 50373; legs
    `Page.navigate` → `/a.html`, anchor-click → `/b.html`, anchor-click → `/c.html`,
    `Page.navigateToHistoryEntry` → `/b.html` (targetIndex 2), anchor-click →
    `/form.html`, form-submit → `/echo?field=tabi-r51-81bda5e52cf6fee7`; history at C
    `[data:, a, b, c]` (entriesLength 4, currentIndex 3), after the hop 4/2;
    `journey.form`: mechanism `dispatchMouseEvent+insertText+submit-click`,
    nonceOnFormPage true, filledValue == fieldValueAfterInsert ==
    `tabi-r51-81bda5e52cf6fee7`, urlAfter
    `http://127.0.0.1:50373/echo?field=tabi-r51-81bda5e52cf6fee7`, valueOnEchoPage ===
    the nonce, servedEchoEntry `/echo?field=<nonce>`, serverSawField true; PNGs
    8,137/8,714/7,420/9,058/7,691/5,358 B; `Edg/156.0.4314.58`; teardown
    postKillSweepCount 0.
  - Counter: `node .ufo/waves/round-51/counters/webview2-receipt-r51.mjs
    corpus/evidence/round51/webview2-form-journey/receipt.json --shot …journey-echo.png
    --png-a … --png-b … --png-c … --png-form … --png-echo … --driver
    scripts/webview2-cdp-loopback-round51.mjs --hostsrc scripts/webview2-host-round48.cs`
    → exit 0, predicate true, **0 findings**, couldNotEvaluate []
    (`measure/c2-counter-green-at-data.json`).
  - Cross-refusal: the r50 counter on the r51 receipt → exit 1, **5 findings** (schema,
    profile-not-throwaway, nonce-shape, driver-pin-mismatch, journey-steps;
    `measure/c2-r50counter-refuses-r51.json`).
  - Selftests: counter 17/17 (`measure/c3-counter-selftest-at-freeze.json`, at the
    freeze); `--path-selftest` 6/6 (`measure/c2-path-selftest-at-freeze.json`).
- C3 (operability — the v4 gate; before at the round open / baseline bytes, after at
  the final content rev R):
  - Before: `node scripts/check-selfassessment.mjs --repo <lane> --rev c5474922…` (the
    round-baseline bytes) → exit 1, verdict=failed **mismatches=1**
    could_not_evaluate=182 superseded=23 (control
    `controls/c3-gate-v3baseline-at-round-open.txt`) — the single standing m3 class;
    the v4 oracle's own separation over the real tree (measured pre-data):
    **650 artifact rows disclosed / real rows only the round's own in-progress files**
    (`measure/c3-gate-v4-at-baseline-predata.txt`).
  - Sandbox red/green: the baseline v3 bytes on the artifact sandbox (`git rm --cached`
    leaves an untracked byte-identical file) → exit 1, mismatches=1
    (`controls/c3-v3-baseline-artifact-sandbox-red.txt`); the v4 bytes on the same
    sandbox → exit 0 with the artifact disclosed (run recorded in the lesson appendix).
  - Selftest: `node scripts/check-selfassessment.mjs --selftest` → exit 0,
    `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45`
    (`measure/c3-selftest-v4-at-instrument.txt`) — the gate's own selftest runs on this
    host for the first time since the migration.
  - After: `node scripts/check-selfassessment.mjs --repo <lane> --rev R` → exit 0,
    verdict=clean **mismatches=0** with the `m3-index-artifact` class disclosed under
    couldNotEvaluate — measured post-commit at the round's final content rev; receipt
    `.ufo/waves/round-51/measure/c3-gate-v4-at-R.txt` (landed in the final receipt
    commit, naming R; the r50 `ea11da95` pattern).
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` **160
  → 160** (UNCHANGED: S153 re-opened byte-identical; no new row). S153's used-by column
  changed in place per the contract: `corpus/knowledge/chrome-cdp-loopback-round-44.md,
  corpus/lessons/round-44.md` → `…round-44.md, corpus/lessons/round-44.md,
  corpus/knowledge/webview2-journey-round-50.md, corpus/lessons/round-50.md,
  corpus/knowledge/webview2-form-journey-round-51.md, corpus/lessons/round-51.md`
  (old→new logged here). Knowledge notes 66 → **67** (the form-journey note).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| environment drift (expected class, new shape): the fleet root became itself a git worktree and the sibling links are NTFS symlinks, not junctions | the v10 meter at round open read roster {.git} — 23 findings (10 audit rows re-read sibling-absent, 12 delta lanes not-on-roster, `.git` uncovered); receipt `controls/c1-meter-v10-red-at-round-open.json` | the meter's own red control at round open (the fifth consecutive round the round-open control catches a real environment change) | the versioned v11 meter (rosterScan follows symlinks, skips dot-entries; pure core byte-identical, diff committed); the rosterfix-on-r50-ledgers control isolates fix from staleness (7 real head races, zero byte drift) |
| instrument blindness (standing, closed this round): the calibration gate's m3 counted the broken index's phantom rows as unlanded work | verdict=failed mismatches=1 every round since 44 on a tree whose byte-truth holds no unlanded work; measured at the round baseline: 656 status rows, 650 artifact | the r50 closure's standing-item note + this round's byte-truth classification (the m3 oracle itself) | v4 grades each row against the measured tree (byte-identical / NTFS-illegal / case-collision → declared class, disclosed; real drift → refuses); sandbox red/green proves the fix able to fail |
| instrument breakage (found by opening the gate's own selftest): the selftest refused EVERY fixture on this host | `fixture root mismatch: C:/Users/... != C:\Users\...` — git prints forward-slash temp paths, node tmpdir backslashes; the gate's selftest had not successfully run on this host since the migration | running the gate's own `--selftest` while building the v4 cases | v4 compares path-normalized (separators unified, case-folded on win32); the 41 existing cases pass unchanged plus four new ones (45/45) |
| crash-class recurrence (r49/r50 known): the m1 gate-tally temp cleanup died on the Windows EPERM file-lock race | the first real-tree v4 run crashed in rmSync of its own temp sandbox (`measure/` interim output, superseded by the re-run); same class as the r49/r50 crashed receipts | the crashed run itself (kept and named, never quoted as a verdict) | v4 hardens the cleanup: a failed temp sweep is not a verdict datum (try/catch; the per-invocation TMPDIR is never the lane tree); disclosed here |
| fixture authoring drift: three fixture receipts disagreed with the counter on the first selftest run (14/17) | the resolution-not-applied paths block was self-consistent under the broken shape (2 findings, wanted 3); tampered-shot rode a journey receipt (spurious main-shot finding); cross-schema mixed nonce generations (extra invocation-binding finding) | the counter's own 17-case fixture selftest at authoring time, run BEFORE the freeze | fixtures corrected; the passing 17/17 run overwrote the failing receipt in place — disclosed here; the freeze receipt is the passing run |
| case-collision surprise: restoring one spelling of a case-colliding pair leaves the sibling spelling reading as modified | after restoring `sandbox_README.md` to its committed bytes, status showed ` M …sandbox_readme.md` — the tree holds BOTH spellings (blobs abfd5fb0 / 0a8ed86f; witness-FINAL-handbuilt.json / witness-final-handbuilt.json) and a case-insensitive filesystem can hold exactly one | the v4 oracle's own classification receipts (the 2 rows refused to resolve) | the v4 case-collision branch (the on-disk file carries one spelling's committed bytes → the sibling row is the collision artifact); the restoration is still the right disposition — the on-disk file now holds landed bytes |

## Census

Start (2026-11-01, round open): `bash <fleet>/scripts/sources-census.sh validate --root
<fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04 duplicate-URL warnings (the same
set disclosed r47–r50); receipt `.ufo/waves/round-51/measure/census-start.txt`
(committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-51/measure/census-end.txt`), W04 set unchanged at 22, registry 160
rows. Correction of record (D-2, dated 2026-11-01): the r50 lesson's census-end sentence
about an S161 row landing inside the Registry table describes the withdrawn draft, not
the final state; the final state was and is registry 160, no S161 row.

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-01). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow unreachable.
