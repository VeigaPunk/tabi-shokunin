# Round 52 — tabi (Windows host; the per-key key-event typing trace with per-keystroke delivery witnesses, the meter's v12 token fix (the routed R51-V1 carry-in) and the concurrent-fleet re-bind)

Baseline `d24d31ea2c7a28f74ae41145446bb98e75b4bd0d` → freeze
`8016e67ea5d9ee9ef10710602d9293b86e397987` (claims.json + three instruments + the
round-open controls + census start, BEFORE any data) → C1 data
`62d0cd6e8d0e20d643adbe88349ef0a27b339c82` (both ledgers re-bound at one fresh snapshot)
→ C1 correction 1 `c58469826af2b4a6d4a5ff59919d1d6cd39768f9` (the tsukuroi head race;
the frozen correction flow, cycle 1 of 2) → C2 data
`11d6aeb3f5e626d09320521646b994dafa7651e2` (the live typing-trace receipt + six PNGs +
counter receipts, both cross-refusals) → C1 correction 2
`7d91d5e31d448230578a06f63f566188c39706a2` (the kengaku/mori head races; cycle 2 of 2 —
the green at this rev: exit 0, predicate true, 0 findings) → work commit (this round's
corpus, SCORECARD, LOG, PROVINCE). Two declared claims, every after-state produced by
committed instruments at its data revision. Carry-in from the r51 non-author closure
(both routed items addressed; neither is a claim): (1) R51-V1 — the v11 meter's emitted
predicateSentence still led with `c1-adjacency-host-v10 admits…` (and the header comment
with v7); fixed by the v12 version bump exactly as the routing named, measured at the
freeze on committed bytes (`measure/c1-emitted-token-check.txt`: v11 line 374 led v10,
v12 line 380 leads v12; the one v10-name occurrence left inside v12 is the delta comment
quoting the historical defect, line 49 — documentation, not output); (2) the `tabi |
round-44` L2-floor L0 — still open, routed around per its standing PROVINCE.md
disposition line (the r51 consolidation governs; this round refers there, does not
restate, never treats it as answered).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json (ChromeDevTools/devtools-protocol), https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (fourth open; the fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, master unchanged across 2026-10-31 → 2026-11-01 → 2026-11-02; no new row — the round needed the dispatchKeyEvent description already registered under this row) | 2026-11-02 | `curl -q -sL --proto =https -o .ufo/waves/round-52/sources/browser-protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c0263c6…` (== the registered anchor; receipt `measure/c1-token-and-s153-grep.txt`) | "Dispatches a key event to the page." (8 words; the Input.dispatchKeyEvent description; verbatim 1 hit in the opened bytes) — the primitive the fill leg now rides per keystroke (the r51 insertText/dispatchMouseEvent quotes still 1 hit each) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check
remains the closure's duty):
ADMIT — S153 re-open (fresh fetch byte-identical to the registered anchor, staged; the
dispatchKeyEvent description verbatim in the opened bytes; load-bearing for C2: it is
exactly the primitive the per-key fill runs on).
ADMIT — C1 (the round-open red control on the inherited v11/r51 generation: exit 1,
predicate false, 9 findings — 7 lane-screen-head-mismatch (chousa, kengaku, mori,
shokunin-binary-forensics, shokunin-reverse-engineering, tameshi, tsukuroi — the heads
that advanced since the r51 snapshot) + the kumitate audit pair (claimed unchanged,
observed moved at SCORECARD.md:1723), with ZERO sha/lines/quote/hits findings: no
screened province byte moved; the versioned v12 meter differs from v11 only in comments,
the r52 ledger rebind, schema strings and the emitted-sentence token (pure core
byte-identical, diff committed `controls/v11-v12-meter.diff`); both ledgers re-bound at
one fresh snapshot with 16 dispositions carried by exact whole-line quote match, 0 new
adjudications, the kumitate row honestly moved with the meter-derived note
(`text now at :1736`); GREEN at `7d91d5e3` through the frozen correction flow — cycle 1
(tsukuroi raced mid-round, `c5846982`), cycle 2 (kengaku and mori raced again,
`7d91d5e3`, taken after two consecutive stable head polls with the re-bind→commit→run
chained in one command); v12 selftest 16/16; the R51-V1 token fix measured at the freeze).
ADMIT — C2 (the r51 planned residual exercised at `11d6aeb3`: the live 6-leg journey
with the fill leg replaced by the per-key trace — 25 real `Input.dispatchKeyEvent`
keyDown/keyUp pairs for the nonce `tabi-r52-48b62c227a28283d`, per-character derived
code/VK, the DOM value read back after EVERY keystroke (25 prefix witnesses,
`keyEventCount` 50, `allPrefixTrue` true), the submit through the form's own button, the
GET submit witnessed SERVER-SIDE (fixture served log) and CLIENT-SIDE (echo page);
history at C `[data:, a, b, c]` 4/3 and back leg 4/2 reproduced a third time; six
per-step URL/title/PNG pins; Edg/156.0.4314.58; teardown sweep 0; counter r52 green 0
findings couldNotEvaluate []; cross-refusals symmetric — the r51 counter refuses the r52
receipt with 6 findings and the r52 counter refuses the committed r51 receipt with 6
findings incl. `typing-missing`; counter selftest 50/50 at the freeze; `--path-selftest`
6/6; the capability row `webview2-keyevent-typing-windows` enters the table at the work
commit).
REJECT — the r51 insertText fill as the lane's typing evidence going forward (its
before/after witness cannot distinguish a per-keystroke delivery from a value-set or a
dropped-key artifact; superseded on the r52 runner by the trace; the r51 runner stays
frozen and its receipts stand as landed).
REJECT — the first fixture authoring pass (49/50: the `paths-absolute-not-identity`
fixture set `scratchGiven` equal to `scratchResolved`, so the mutation produced no
finding and the exact-findings assertion failed). Caught by the counter's own 50-case
selftest at authoring time, run BEFORE the freeze; fixed before the freeze; the passing
run overwrote the failing receipt in place — disclosed here (the same class the r51
lesson disclosed at 14/17); nothing was frozen with a failing fixture set (the freeze
receipt `measure/c2-counter-selftest-at-freeze.json` is the 50/50 run).

## Corrections of record (r51-closure carry-in; append-only — the r51 bytes are not edited)

- **R51-V1 (label leftover, class instrument-output drift).** Superseded text: the v11
  meter's emitted `predicateSentence` opening token `c1-adjacency-host-v10 admits…`
  (and the header PREDICATE-SENTENCE comment's `c1-adjacency-host-v7 admits…`). The v12
  bump corrects both to v12; no measurement bound the token (the r51 verifier's routing
  said exactly this), so no frozen predicate is invalidated, and no r51 byte is edited.
  Measured at the freeze: `measure/c1-emitted-token-check.txt` (v11 emitted line 374 →
  v10; v12 emitted line 380 → v12; header comment line 57 → v7 vs line 63 → v12) and
  `measure/c1-token-and-s153-grep.txt` (v10-token-in-v11: 1; v10-token-in-v12: 1 — the
  delta comment's historical quotation; v12-token-in-v12: 3 — header, sentence, comment).
- **Item 2 (the L2-floor L0, sixth round routed around).** The `tabi | round-44`
  question stays open; the standing PROVINCE.md disposition line (the r51 consolidation)
  governs. No per-round restatement beyond this reference; the question is never treated
  as answered.

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind through the v12 meter bump; green measured
  at `7d91d5e31d448230578a06f63f566188c39706a2`):
  - Before: `node .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs --rev d24d31ea…
    --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false, **findingCount 9**
    (7 lane-screen-head-mismatch + 1 audit-status-mismatch + 1 audit-note-moved-line, all
    on the kumitate SCORECARD row; zero sha/lines/quote) — receipt
    `.ufo/waves/round-52/controls/c1-meter-v11-red-at-round-open.json` (round open,
    before any lane write).
  - Instrument: `node .ufo/waves/round-52/counters/c1-adjacency-host-v12.mjs --selftest`
    → exit 0, allPass=true, cases=16, pass=16 (`measure/c1-meter-v12-selftest.json`);
    the diff v11→v12 is committed (`controls/v11-v12-meter.diff`) and touches only
    comments, the ledger rebind, schema strings and the emitted-sentence token.
  - Corrections: cycle 1 (tsukuroi raced; raced receipt `measure/c1-meter-raced-at-correction0.json`,
    committed at `c5846982`), cycle 2 (kengaku+mori raced; raced receipt
    `measure/c1-meter-green-at-correction1.json`, birth name disclosed — it holds a
    FAILED run; committed at `7d91d5e3`'s parent step with the correction-2 commit).
    Both re-binds: 16 dispositions carried, 0 new adjudications.
  - After: `node .ufo/waves/round-52/counters/c1-adjacency-host-v12.mjs --rev
    7d91d5e3… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12} —
    receipt `measure/c1-meter-green-at-correction2.json`. Both correction cycles of the
    frozen two-cycle budget consumed; the predicate reached true within them.
  - Ledgers: `awk -F'\t' 'NR>1 && $1=="lane"{n++} END{print n}'
    corpus/adjacency-host-delta-r52.tsv` → 12; line rows 16; audit rows
    `awk -F'\t' 'NR>1{n++} END{print n}' corpus/adjacency-host-audit-r52.tsv` → 16
    (9 unchanged + 6 sibling-absent + 1 moved).
  - Carry-in: `grep -c "c1-adjacency-host-v10 admits"
    .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs` → 1 (the routed defect, the
    emitted sentence) vs the same grep on v12 → 1 (the delta comment's historical
    quotation; the emitted sentence names v12 — `measure/c1-emitted-token-check.txt`).
- C2 (coverage — the per-key key-event typing trace; measured at
  `11d6aeb3f5e626d09320521646b994dafa7651e2`):
  - Evidence: `git ls-tree -r --name-only <REV> -- corpus/evidence/round52 | wc -l` →
    baseline **0** → **7** (receipt.json + 6 per-step PNGs).
  - Live run: inline loopback HTTP fixture on ephemeral port 62630; legs
    `Page.navigate` → `/a.html`, anchor-click → `/b.html`, anchor-click → `/c.html`,
    `Page.navigateToHistoryEntry` → `/b.html` (targetIndex 2), anchor-click →
    `/form.html`, then the fill as **25 real `Input.dispatchKeyEvent` keyDown/keyUp
    pairs** (per-character derived code/VK — `KeyT`+84 … `Minus`+189 — `keyEventCount`
    50) with the DOM value read back after every keystroke (`typing[]` 25 prefix
    witnesses, `allPrefixTrue` true), a second mouse click on the form's own submit
    button, the GET navigation to `/echo?field=tabi-r52-48b62c227a28283d`; history at C
    `[data:, a, b, c]` (4/3), after the hop 4/2; `journey.form`: mechanism
    `dispatchKeyEvent+submit-click`, `valueBeforeFirstKey` '', filledValue ==
    fieldValueAfterTyping == the nonce, urlAfter carrying the query on the same loopback
    origin+port, valueOnEchoPage === the nonce, servedEchoEntry
    `/echo?field=<nonce>`, serverSawField true; PNGs
    8,144/8,722/7,427/9,067/7,700/5,363 B; `Edg/156.0.4314.58`; teardown
    postKillSweepCount 0.
  - Counter: `node .ufo/waves/round-52/counters/webview2-receipt-r52.mjs
    corpus/evidence/round52/webview2-keyevent-typing/receipt.json --shot …journey-echo.png
    --png-a … --png-b … --png-c … --png-form … --png-echo … --driver
    scripts/webview2-cdp-loopback-round52.mjs --hostsrc scripts/webview2-host-round48.cs`
    → exit 0, predicate true, **0 findings**, couldNotEvaluate []
    (`measure/c2-counter-green-at-data.json`).
  - Cross-refusals: the r51 counter on the r52 receipt → exit 1, **6 findings** (schema,
    nonce-shape, profile-not-throwaway, driver-pin-mismatch, form-mechanism,
    form-field-value; `measure/c2-r51counter-refuses-r52.json`); the r52 counter on the
    committed r51 evidence receipt → exit 1, **6 findings** (schema, nonce-shape,
    profile, driver-pin, form-mechanism, **typing-missing**;
    `measure/c2-r52counter-refuses-r51.json`).
  - Selftests: counter 50/50 (`measure/c2-counter-selftest-at-freeze.json`, at the
    freeze); `--path-selftest` 6/6 (`measure/c2-path-selftest-at-freeze.json`).
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` **160
  → 160** (UNCHANGED: S153 re-opened byte-identical; no new row). S153's used-by column
  changed in place per the contract: the r51 tail gains
  `corpus/knowledge/webview2-keyevent-typing-round-52.md, corpus/lessons/round-52.md`
  (old→new logged here). Knowledge notes 67 → **68** (the keyevent-typing note).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| environment drift (expected class): sibling lanes commit mid-round — two head races hit the green run | correction-0 raced receipt `measure/c1-meter-raced-at-correction0.json` (1 finding, tsukuroi); correction-1 raced receipt `measure/c1-meter-green-at-correction1.json` (1 finding, mori; kengaku moved between polls too); the fleet is concurrently active — both lanes committed while this round ran | the meter's own green runs (both raced receipts committed; the frozen correction flow routed both) | the frozen correction flow as declared: re-snapshot → re-bind both ledgers → commit → re-run, twice; cycle 2 taken only after two consecutive stable head polls with re-bind→commit→run chained in one command; the green at `7d91d5e3` — both cycles consumed, disclosed here |
| fixture authoring drift (r51 class, new instance): one fixture disagreed with the counter on the first selftest run (49/50) | the `paths-absolute-not-identity` fixture set `scratchGiven` equal to `scratchResolved`, so the mutation produced no finding and the exact-findings assertion failed | the counter's own 50-case fixture selftest at authoring time, run BEFORE the freeze | fixture corrected (`scratchGiven` a different absolute path); the passing 50/50 run overwrote the failing receipt in place — disclosed here; the freeze receipt is the passing run |
| authoring-time self-inflicted instrument defect (caught before any run): the v12 header generation corrupted the historical v10 quotation and dropped the P1/P2/P3 frozen-question block | the first generated v12 bytes quoted `("c1-adjacency-host-v12 admits…", and the header comment carried v7)` — the global token replace had rewritten the defect's own historical name inside the comment — and the header splice had deleted the P1/P2/P3 documentation | the diff review (diff v11 v12) before running the meter | both fixed before the selftest run; the committed diff names the final hunks; the lesson of the class: a generation bump that rewrites a defect's name must quote the OLD name verbatim in the historical note — do the token replace BEFORE writing the historical comment, not after |
| receipt authoring mojibake: the first `c1-emitted-token-check.txt` render carried a corrupted dash and a broken comment line | the heredoc-rendered receipt contained a non-ASCII `ù` where an em-dash was intended, and the first cleanup dropped half a comment line | re-reading the receipt before committing it | the receipt rewritten from a clean body before the freeze commit; the committed bytes are the clean rewrite; the frozen digest pins the clean bytes |
| receipt birth-name drift: two committed receipts hold FAILED runs under names containing "green" | `measure/c1-meter-green-at-correction1.json` (the correction-1 raced run) and — deleted before commit — `c1-meter-green-at-data.json` (the correction-0 raced run; its committed evidence is `c1-meter-raced-at-correction0.json`) | this lesson's own receipt inventory pass at work-commit time | the correction-1 file keeps its birth name with this disclosure (its commit message already calls it "raced receipt"); the correction-0 duplicate was removed from the tree pre-commit so exactly one committed receipt carries that run; class fix for next generation: name correction-flow receipts by their outcome, never by their intent |

| authoring-time file doubling (found by the gate's own second pass, caught by impossible line numbers): the tally-addendum script opened SCORECARD.md and SKILL.md in append mode and then wrote the FULL original content plus the addendum — both files doubled in the worktree, and the doubled bytes were committed at `24efa072` before the defect was seen | the second gate pass read mismatches=43 with findings at SCORECARD.md:3371/4099/4156/4399+ — line numbers beyond the file's true length; the tree blob at `24efa072` measured 5,934 SCORECARD lines against the true 2,972 | the gate's second-pass receipt itself (`scratch`-side run, `.ufo/waves/round-52/measure/c3-gate-at-addendum.txt`, kept and named; never quoted as a verdict) + the immediate wc/blob-diff check | both files rebuilt from the `9bda1741` pre-addendum blobs plus exactly one addendum (prefix equality against the blobs verified before commit); the repair commit supersedes the doubled bytes of `24efa072` by name; class fix: append-mode writes must write ONLY the appended bytes — never re-write the read-back content. Second beat, same repair cycle: the first clearing line wrapped its citations onto continuation lines and cleared nothing — the SCORECARD window reads the clearing line's OWN text only (g.lineText), so the tally, the marker and all four citations must share ONE physical line (the r51 `8e2fe015` single-line form, re-learned; the wrapped attempt's receipt is the scratch-side c3-gate-at-repair.txt run, kept and named) |

## Census

Start (2026-11-02, round open): `bash <fleet>/scripts/sources-census.sh validate --root
<fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04 duplicate-URL warnings (the same
set disclosed r47–r51); receipt `.ufo/waves/round-52/measure/census-start.txt`
(committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-52/measure/census-end.txt`), W04 set unchanged at 22, registry 160
rows.

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-02). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow unreachable.

## Post-integration appendix (2026-11-02, same day)

The v4 gate's first complete host-side pass at the work commit `9bda1741` read
`SELFASSESSMENT verdict=failed rev=9bda1741... mismatches=7 could_not_evaluate=167
superseded=43` (receipt `measure/c3-gate-at-work.txt`, committed at the addendum commit
`24efa072`) — six stale `check-adjacency.mjs` self-test tallies the r48 57 -> 64
case-count change had orphaned across the SCORECARD and SKILL m1 windows (the same class
the r51 chain mined for the check-selfassessment 41 -> 45 change), plus m3 itself
counting the gate's own in-flight receipt file (the honest reading: it was unlanded at
that instant). Notable: the six adjacency rows graded could-not-evaluate in the r51
passes and MEASURED here — the oracle's own self-test sits near the gate's 180-second
spawn timeout on this host (a bare `--self-test` run took minutes while the fleet was
busy; it printed `ADJACENCY_SELFTEST verdict=clean cases=64 reasons=18
could_not_evaluate=6` at `.ufo/waves/round-52/measure/adjacency-selftest-at-work.txt`),
so the stale tallies were real and unmarked since r48 either way, and the gate did its
job in both states.

The closure then took two repairs, both caught by the gate's own subsequent passes and
mined as Mistakes rows: (1) the addendum script doubled SCORECARD.md and SKILL.md
(append mode + full-content rewrite) and the doubled bytes landed at `24efa072` — the
second pass read mismatches=43 with findings past the true end of file
(`measure/c3-gate-at-addendum.txt`, kept and named, never quoted as a verdict); the
repair at `9d0757b7` rebuilt both files from the `9bda1741` pre-addendum blobs plus
exactly one addendum (prefix equality verified). (2) the rebuilt SCORECARD clearing line
wrapped its citations onto continuation lines, so the line-scoped window cleared nothing
— the third pass read mismatches=4 (`measure/c3-gate-at-repair.txt`, kept and named)
while the SKILL paragraph clears worked; the repair at `3ae7b891` put the tally, the
marker and all four citations on ONE physical line (the r51 `8e2fe015` single-line form,
re-learned). The gate re-measured at `3ae7b891` with a fully committed tree and its
output outside the tree:
`SELFASSESSMENT verdict=clean rev=3ae7b8913680050e6757e9c0e926edcaea00d430
mismatches=0 could_not_evaluate=178 superseded=43` (exit 0) — that receipt is
`measure/c3-gate-v4-at-final.txt`, landed in the round's receipts-only final commit
naming the rev it measured (the r50/r51 `ea11da95` pattern). No number in this appendix
quotes an uncommitted or crashed run; every quoted line is from a committed receipt.
