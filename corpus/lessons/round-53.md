# Round 53 — tabi (Windows host; the Shift modifier-chord key-event trace with per-keystroke chord witnesses, the meter's v13 generation rebind, and the per-blob spawn-verdict host condition)

Baseline `3abdeba6faa574edd8120661341a8a15c181ad55` → freeze
`eec453d99fd3821a4d10f5a3c437cfc478f58b36` (claims.json + instruments + the
round-open controls + census start, BEFORE any data) → PRE-DATA AMENDMENT 1
`1d0f07931b91e30c608e00c3799df6e76427f049` (the runner's formMode ok-chain was
generated without its leading `const f` declaration — the FIRST live run
crashed at the ok-chain after the journey completed; red receipt kept and
named; the fix restores the one declaration, fixtures regenerated, selftests
re-run at the amendment bytes) → C2 data
`1bb1ca43fe643b6403384d06479d7fcb6238fbdb` (the live chord receipt + six PNGs
+ counter receipts, both cross-refusals) → C1 data
`e87c695847a49403034ba3db3e8eda77cd8f6533` (both ledgers re-bound at one fresh
snapshot) → C1 correction 1 `99ff0c6b51d02a117c0cc5dc055c7e45e56d19e3` (the
tameshi head race; the frozen correction flow, cycle 1 of 2 — the green at
this rev: exit 0, predicate true, 0 findings) → work commit (this round's
corpus, SCORECARD, LOG, PROVINCE). Two declared claims, every after-state
produced by committed instruments at its data revision. Carry-in from the r52
non-author closure (all three routed items addressed; none is a claim):
(1) the claims.json "9 vs 10" typing-refusal prose drift — corrected as a
Correction of record below, the fixture oracle measured at 10
(`measure/c2-r52-typing-count-check.txt`), no frozen r52 byte edited, all
forward prose carries 10; (2) the SHONEN operator note — operator-owned
promotion review, routed around (boxes stay `[~]` with resolvable pointers;
the lane does not self-check `[x]`); (3) the receipt-counter selftest
repo-root layout sensitivity — pinned INSIDE the r53 counter (named error
`selftest-repo-root-layout`, exit 2 before any case runs), measured at
`controls/selftest-layout-pin.txt`. The `tabi | round-44` L2-floor L0 — still
open, routed around per its standing PROVINCE.md disposition line (the r51
consolidation governs; this round refers there, does not restate, never
treats it as answered).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json (ChromeDevTools/devtools-protocol), https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (fifth open; the fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, master unchanged across 2026-10-31 → 2026-11-01 → 2026-11-02 → 2026-11-02; no new row — the round needed the dispatchKeyEvent modifiers parameter description already registered under this row) | 2026-11-02 | `curl -q -sL --proto =https -o .ufo/waves/round-53/sources/browser-protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c0263c6…` (== the registered anchor; the modifiers description located via the parsed Input.dispatchKeyEvent parameters and confirmed by literal grep — the JSON string carries it with a `\n` wrap, 5 lines carry the same description across the Input domain) | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)." (12 words; the Input.dispatchKeyEvent modifiers parameter description — the Shift=8 bit the chord leg rides; the command description "Dispatches a key event to the page." still verbatim 1 hit) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check
remains the closure's duty):
ADMIT — S153 re-open (fresh fetch byte-identical to the registered anchor, staged; the
modifiers bit-field description located in the opened bytes; load-bearing for C2: it is
exactly the Shift=8 bit the chord leg rides and the number the counter re-derives).
ADMIT — C1 (the round-open red control on the inherited v12/r52 generation: exit 1,
predicate false, 5 findings — 5 lane-screen-head-mismatch (kengaku, mori,
shokunin-binary-forensics, shokunin-reverse-engineering, tameshi — the heads that
advanced since the r52 snapshot), with ZERO sha/lines/quote/hits findings: no screened
province byte moved; the versioned v13 meter differs from v12 only in comments, the r53
ledger rebind, schema strings and the emitted-sentence token (pure core byte-identical,
diff committed `controls/v12-v13-meter.diff`, the Round 52 delta paragraph's historical
numbers quoted verbatim — the r52 corrupted-quotation class guarded); both ledgers
re-bound at one fresh snapshot with 16 dispositions carried by exact whole-line quote
match, 0 new adjudications, 0 dropped stale quotes, the kumitate row honestly moved with
the meter-derived note (`text now at :1736`); GREEN at `99ff0c6b` through the frozen
correction flow — cycle 1 (tameshi raced mid-round, the raced receipt named by OUTCOME
`c1-meter-raced-at-correction0.json` per the r52 lesson's birth-name class fix, taken
after stability polls); v13 selftest 16/16; no meter-token carry-in this round, the
token check measured at the freeze (`measure/c1-token-check-r53.txt`: v13 emits v13,
v12 emits v12, the historical paragraph intact)).
ADMIT — C2 (the r52 planned residual exercised at `1bb1ca43`: the live 6-leg journey
with the fill now TWO per-key key-event traces — the r52 plain trace into #field (25
keyDown/keyUp pairs, keyEventCount 50, 25 prefix witnesses, allPrefixTrue) AND the
Shift-chord trace into #field2: the nonce uppercased typed with real Shift rides
(ShiftLeft VK 16 around every letter's pair, the letter's event carrying modifiers 8 —
S153's Shift=8 — and the shifted key/text; digits/hyphen unshifted), 25 chord entries
with per-keystroke prefix witnesses, keyEventCount 70 = 10 letters × 4 + 15 unshifted ×
2, allPrefixTrue true; the GET submit carrying both parameters witnessed SERVER-SIDE
(fixture served log) and CLIENT-SIDE (the echo page renders both values); nonce
`tabi-r53-281215ca50c47cd8`; six per-step URL/title/PNG pins; Edg/156.0.4314.58;
teardown sweep 0; counter r53 green 0 findings couldNotEvaluate []; cross-refusals
symmetric — the r52 counter refuses the r53 receipt with 7 findings (schema, profile,
nonce-shape, driver-pin, form-mechanism, form-echo-query, form-server-witness) and the
r53 counter refuses the committed r52 receipt with 10 findings incl. schema and
chords-missing; counter selftest 85/85 at the freeze and re-run at the amendment bytes;
`--path-selftest` 6/6; the selftest layout pin demonstrated (wrong layout exit 2,
`selftest-repo-root-layout`); the capability row `webview2-keyevent-modifier-chords-windows`
enters the table at the work commit).
REJECT — the first live run's bytes as a data source (the ok-chain crash:
`ReferenceError: f is not defined` after the journey — receipt unwritten; the run is
kept and named as the amendment-1 red receipt; the runner bytes it would have
validated are superseded by the amendment digest 4e80a2e0…).
REJECT — three fresh compile+spawn attempts as data runs (spawn UNKNOWN errno -4094,
per-blob host verdicts; kept and named in the Mistakes table; the successful data run
reuses a proven blob with its provenance pinned — see the standing host note in
PROVINCE.md and the knowledge note).

## Corrections of record (r52-closure carry-in; append-only — the r52 bytes are not edited)

- **Item 1 (cosmetic prose drift, class count-leftover).** Superseded text: the r52
  claims.json C2(d) frozen predicate said "48 refusal fixtures including **9**
  typing-trace refusals" then listed **ten** ids. The oracle (the committed r52 fixture
  set) has 10 cases carrying typing-* findings and 10 distinct typing-* ids; the r52
  SCORECARD block, LOG entry and capability row all say 10. No measurement bound the
  "9" (the fixture selftest asserted exact findings per case and passed 50/50) — the
  r52 closure routed it as cosmetic. Measured this round:
  `measure/c2-r52-typing-count-check.txt` (claims.json says 9 in 2 places; the manifest
  oracle says 10). The frozen r52 bytes are not edited; every forward quote carries 10.
- **Item 2 (SHONEN operator note).** The r52 closure's observation that all four
  SHONEN.md boxes look fully checkable from a non-author position is the operator's
  promotion-review gate, not the lane's: routed around. The boxes remain `[~]`
  lane-asserted with resolvable pointers; no `[x]` is self-written; the pointer set is
  re-listed in this round's report SHONEN section for the operator's convenience.
- **Item 3 (the selftest repo-root layout sensitivity).** The r52 receipt counter's
  `--selftest` resolved its pinned driver/hostsrc five directories above the fixtures
  dir and silently reported per-case `pin-file-unreadable` when run from a
  non-repo-root layout. Fixed inside C2's instrument work exactly as the routing
  named ("in the next counter generation"): the r53 counter pins the layout expectation
  and dies exit 2 with the named error `selftest-repo-root-layout` before any case
  runs. Measured: `controls/selftest-layout-pin.txt` (right layout: exit 0, 85/85;
  wrong layout: exit 2 with the named error).
- **The L2-floor L0 (`tabi | round-44`, seventh round routed around).** The standing
  PROVINCE.md disposition line governs; no per-round restatement beyond this
  reference; the question is never treated as answered.

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind through the v13 generation bump; green
  measured at `99ff0c6b51d02a117c0cc5dc055c7e45e56d19e3`):
  - Before: `node .ufo/waves/round-52/counters/c1-adjacency-host-v12.mjs --rev
    3abdeba6… --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false,
    **findingCount 5** (5 lane-screen-head-mismatch: kengaku, mori,
    shokunin-binary-forensics, shokunin-reverse-engineering, tameshi; zero
    sha/lines/quote/hits) — receipt `.ufo/waves/round-53/controls/c1-meter-v12-red-at-round-open.json`
    (round open, before any lane write).
  - Instrument: `node .ufo/waves/round-53/counters/c1-adjacency-host-v13.mjs --selftest`
    → exit 0, allPass=true, cases=16, pass=16 (`measure/c1-meter-v13-selftest.json`);
    the diff v12→v13 is committed (`controls/v12-v13-meter.diff`) and touches only
    comments, the ledger rebind, schema strings and the emitted-sentence/header token.
  - Correction: cycle 1 (tameshi raced; raced receipt `measure/c1-meter-raced-at-correction0.json`,
    named by outcome; committed at `99ff0c6b`). Re-bind: 16 dispositions carried,
    0 new adjudications, 0 dropped stale quotes.
  - After: `node .ufo/waves/round-53/counters/c1-adjacency-host-v13.mjs --rev
    99ff0c6b… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12} —
    receipt `measure/c1-meter-green-at-correction1.json`. One of the two frozen
    correction cycles consumed; the predicate reached true within them.
  - Ledgers: `awk -F'\t' 'NR>1 && $1=="lane"{n++} END{print n}'
    corpus/adjacency-host-delta-r53.tsv` → 12; line rows 16; audit rows
    `awk -F'\t' 'NR>1{n++} END{print n}' corpus/adjacency-host-audit-r53.tsv` → 16
    (9 unchanged + 6 sibling-absent + 1 moved).
- C2 (coverage — the Shift modifier-chord key-event trace; measured at
  `1bb1ca43fe643b6403384d06479d7fcb6238fbdb`):
  - Evidence: `git ls-tree -r --name-only <REV> -- corpus/evidence/round53 | wc -l` →
    baseline **0** → **7** (receipt.json + 6 per-step PNGs).
  - Live run: inline loopback HTTP fixture on ephemeral port 49478; legs
    `Page.navigate` → `/a.html`, anchor-click → `/b.html`, anchor-click → `/c.html`,
    `Page.navigateToHistoryEntry` → `/b.html` (targetIndex 2), anchor-click →
    `/form.html`, then the fill as TWO per-key traces — the r52 plain trace (25 real
    `Input.dispatchKeyEvent` keyDown/keyUp pairs, `keyEventCount` 50, per-keystroke
    prefix witnesses, `allPrefixTrue` true) and the Shift-chord trace into #field2 (the
    nonce uppercased: real Shift rides — ShiftLeft VK 16 keyDown/keyUp around every
    letter's pair, the letter's event carrying `modifiers: 8` and the shifted
    key/text; digits/hyphen `modifiers: 0`; 25 chord entries, per-keystroke prefix
    witnesses, `keyEventCount` 70 = 10 shifted × 4 + 15 unshifted × 2,
    `allPrefixTrue` true, `fieldValueAfterTyping` == the uppercased nonce) — then the
    submit through the form's own button, the GET navigation to
    `/echo?field=tabi-r53-281215ca50c47cd8&mixed=TABI-R53-281215CA50C47CD8`; both
    values witnessed on the echo page (`valueOnEchoPage`, `mixedOnEchoPage`) and in
    the fixture served log (`serverSawField`, `serverSawMixed` true); history at C
    `[data:, a, b, c]` (4/3), after the hop 4/2; `Edg/156.0.4314.58`; teardown
    postKillSweepCount 0; host-exe-reused (provenance pinned: hostExeSha256 for the
    blob, hostCsSha256 for the committed source it was compiled from — the per-blob
    spawn-verdict condition, disclosed above and in PROVINCE).
  - Counter: `node .ufo/waves/round-53/counters/webview2-receipt-r53.mjs
    corpus/evidence/round53/webview2-modifier-chords/receipt.json --shot
    …journey-echo.png --png-a … --png-b … --png-c … --png-form … --png-echo …
    --driver scripts/webview2-cdp-loopback-round53.mjs --hostsrc
    scripts/webview2-host-round48.cs` → exit 0, predicate true, **0 findings**,
    couldNotEvaluate [] (`measure/c2-counter-green-at-data.json`).
  - Cross-refusals: the r52 counter on the r53 receipt → exit 1, **7 findings**
    (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch,
    form-mechanism, form-echo-query, form-server-witness;
    `measure/c2-r52counter-refuses-r53.json`); the r53 counter on the committed r52
    evidence receipt → exit 1, **10 findings** (schema, profile, nonce-shape,
    driver-pin, form-mechanism, form-echo-query, form-server-witness,
    **chords-missing**, form-mixed-echo-value, form-server-mixed-witness;
    `measure/c2-r53counter-refuses-r52.json`).
  - Selftests: counter 85/85 (`measure/c2-counter-selftest-at-freeze.json`, at the
    amendment bytes; the freeze-time run passed the same 85/85 before amendment 1
    against the pre-amendment driver pins); `--path-selftest` 6/6
    (`measure/c2-path-selftest-at-freeze.json`); the layout pin
    (`controls/selftest-layout-pin.txt`).
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
  **160 → 160** (UNCHANGED: S153 re-opened byte-identical; no new row). S153's
  used-by column changed in place per the contract: the r52 tail gains
  `corpus/knowledge/webview2-keyevent-modifier-chords-round-53.md,
  corpus/lessons/round-53.md` (old→new logged here). Knowledge notes 68 → **69**
  (the modifier-chords note). `node scripts/check-sources.mjs` →
  SOURCES_GATE verdict=clean rows=160 (`measure/check-sources-at-work.txt`).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| transform authoring defect (execution-only): the runner's formMode ok-chain was generated WITHOUT its leading `const f = receipt.journey && receipt.journey.form;` declaration — the r52→r53 transform spliced FROM the anchor line that declared f, and the replacement chain referenced f undeclared | the FIRST live run crashed at the ok-chain AFTER the journey completed and after teardown: `ReferenceError: f is not defined` at runner line 583 (freeze digest 949384b3…), receipt unwritten; `node --check` had passed — f parses as a possible global, the defect surfaced only at execution | the run's own stderr (kept and named: `controls/c2-live-run1-crash-f-undefined.txt`; amendment-1 commit `1d0f0793`) | the declaration restored (runner 949384b3… → 4e80a2e0…, otherwise byte-identical); fixtures regenerated against the fixed runner (manifest byte-identical); both selftests re-run at the amendment bytes; class fix: a transform that splices FROM a declaration anchor must re-emit the declaration in the replacement block, and a runner's ok-chain should fail LOUDLY before the journey (a preflight use of every named binding) so an undeclared name cannot waste a live run |
| environment drift (new host class): a freshly csc-compiled host exe is refused by `spawn` with UNKNOWN (errno -4094) — per-BLOB verdicts, not path or process | attempts 2, 3 and 4 failed at spawn (three different fresh compiles; attempt 4 on a totally fresh scratch); direct-spawn probes showed the SAME bytes fail everywhere while the r52-control blob (compiled minutes earlier from the same committed source) spawns from any path; `spawn UNKNOWN` reproduced on demand with the blocked blob | the runners' own spawn failures (stderr kept: scratch live-run2/3/4-stderr; the direct probes this lesson describes; the working r52-control run as the positive control) | the runner's documented reuse-if-exists branch used for the data run: the scratch seeded with the proven blob (provenance pinned — receipt hostExeSha256 for the blob, hostCsSha256 `13b2bc3d…` for the committed source it was compiled from); disclosed in the receipt (`compileReuse` 'reused' path), PROVINCE standing note, and the knowledge note; class fix for future generations: on spawn UNKNOWN, discard the blob, recompile (a fresh compile draws a fresh verdict) or reuse a proven-spawnable blob, and say which in the receipt |
| receipt birth-name drift avoided by the r52 class fix (recorded as a PASS, not a mistake): the correction-0 raced run was first written as `c1-meter-green-at-data.json` | the file held a FAILED run (exit 1, 1 finding) under a "green" name | the r52 lesson's own class fix, applied at rename time | renamed to the outcome name `c1-meter-raced-at-correction0.json` BEFORE any commit — no committed receipt carries a failed run under a green name this round |

## Census

Start (2026-11-02, round open): `bash <fleet>/scripts/sources-census.sh validate
--root <fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04 duplicate-URL
warnings (the same set disclosed r47–r52); receipt
`.ufo/waves/round-53/measure/census-start.txt` (committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-53/measure/census-end.txt`), W04 set unchanged at 22, registry
160 rows.

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-02). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow unreachable.
