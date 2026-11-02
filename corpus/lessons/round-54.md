# Round 54 — tabi (Windows host; the Ctrl/Alt/Meta modifier-domain chords witnessed by the page's own DOM keydown record, the meter v14 generation rebind with the v13 name-leftover fix, and the committed-stderr rule)

Baseline `3a415cbcadceeebbf9565906f36348e9ef09ac38` → freeze
`f92c544e5e1703a04e7b003c5f2f747208b20f71` (claims.json + instruments + the
round-open controls + census start, BEFORE any data) → C2 data
`4d3dca816e5f242b6cd5e7628b96918eec6ec1b7` (the live chord-domain receipt +
six PNGs + counter green + both cross-refusals + the spawn-blocked first
run's committed stderr) → C1 data
`435ea4ce8b4962f29331888401f3cba6bdf3b959` (both ledgers re-bound at one
fresh snapshot; the meter v14 GREEN at THIS revision, correction 0 — the
first round since 46 with no correction cycle consumed) → work commit (this
round's corpus, SCORECARD, LOG, PROVINCE). Two declared claims, every
after-state produced by committed instruments at its data revision.
Carry-in from the r53 non-author closure (all three routed items addressed;
none is a claim): (1) D1 — the r53 Mistakes row cited the three
spawn-blocked compiles' stderr that lane-scratch deletion destroyed;
corrected of record below, the convention NAMED (the **committed-stderr
rule**) and landed as a QUALITY.md criterion citing this lesson, and the
class's evidence regenerated under the convention
(`controls/hostexe-fresh-compile-spawn-verdict.json` — a fresh compile+spawn
with every stderr byte committed inside the receipt; the original r53 bytes
are disclosed unrecoverable, never silently replaced); (2) D2 — the
`compileReuse` prose drift corrected as a Correction of record below, the
receipt shape measured at `measure/d2-receipt-shape-check.txt`, no frozen
r53 byte edited, forward prose carries the step+pins shape; (3) D3 — the
`tabi | round-44` L2-floor L0 is ALREADY consolidated as the standing
PROVINCE.md disposition line (the r50-closure consolidation governs; this
round refers there, does not restate, never treats it as answered).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S161 — W3C UI Events specification, KeyboardEvent modifier attributes, https://www.w3.org/TR/uievents/ — NEW ROW this round (the DOM side of the page-side witness: the round needed the ctrlKey/altKey/metaKey boolean attribute definitions; staged `.ufo/waves/round-54/sources/uievents.html`, 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`) | 2026-11-02 | `curl -q -sL --proto =https -o .ufo/waves/round-54/sources/uievents.html https://www.w3.org/TR/uievents/` → 920,762 B (`wc -c`), sha256 `8ded5eaf…`; §5.3 The KeyboardEvent interface, the attribute definitions at `id="dom-keyboardevent-ctrlkey"`/`…altkey`/`…metakey`/`…shiftkey`; the ctrlKey definition greps verbatim in the raw bytes 1 hit: `grep -c '<code>true</code> if the <code class="keycap">Control</code> (control) key modifier'` → 1 | "true if the Control (control) key modifier was active." (9 words; the ctrlKey attribute definition — the DOM boolean the CDP modifiers bit 2 must produce; the altKey definition reads "true if the Alt (alternative) (or "Option") key modifier was active" and the metaKey definition "true if the meta (Meta) key modifier was active", both located in the opened bytes with the page's own tag/whitespace wrap) |
| S153 — Chrome DevTools Protocol browser_protocol.json (ChromeDevTools/devtools-protocol), https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (sixth open; the fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, 1,421,620 B, master unchanged across 2026-10-31 → 2026-11-01 → 2026-11-02 ×2; no new row — the round needed the dispatchKeyEvent modifiers bit field already registered under this row, now extended from Shift=8 to the OTHER THREE bits) | 2026-11-02 | `curl -q -sL --proto =https -o .ufo/waves/round-54/sources/browser-protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c0263c6…` (== the registered anchor) | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)." (12 words; the Input.dispatchKeyEvent modifiers parameter description — the three bits the chord-domain leg rides: Ctrl=2, Alt=1, Meta=4) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check
remains the closure's duty):
ADMIT — S161 new row (opened this round; the located quote grounds the DOM boolean
half of the bit↔boolean correspondence C2 measures; cited by the round's knowledge
note and this lesson).
ADMIT — S153 re-open (fresh fetch byte-identical to the registered anchor, staged;
the modifiers bit-field description located in the opened bytes; load-bearing for
C2 together with S161: the bits are S153's, the booleans are S161's, and the live
run measured the mapping between them).
ADMIT — C1 (the round-open red control on the committed r53 generation: exit 1,
predicate false, **7 findings** — 5 lane-screen-head-mismatch (kengaku, mori,
shokunin-binary-forensics, shokunin-reverse-engineering, tameshi — the heads that
advanced since the r53 snapshot) PLUS lane-screen-sha-mismatch AND
lane-screen-lines-mismatch BOTH on kengaku: its PROVINCE.md bytes changed since
the r53 snapshot, the first screened-province byte change since r48; ZERO audit
findings, so no map row moved as of round open; receipt taken before any lane
write — a do-nothing control reaches exactly this red). The versioned v14 meter
(frozen digest c9357c96…) differs from v13 ONLY in header comments (including the
new Round 54 delta paragraph, which quotes the red control's numbers and
discloses the fix below), the AUDIT_REL/DELTA_REL rebind to the r54 ledger
names, the schema strings — INCLUDING THE FIX: v13's run-output JSON emitted
`schema: "tabi-adjacency-host-v12"` while its die/selftest/sentence strings said
v13 (a name-leftover of the v13 bump, found by this round's diff review of the
meter itself), and v14 emits `tabi-adjacency-host-v14` in all four places — the
usage strings, and the emitted predicateSentence's and header PREDICATE-SENTENCE
comment's leading token (pure core byte-identical, diff committed
`controls/v13-v14-meter.diff`, the Round 53 delta paragraph's historical numbers
quoted verbatim — the r52 corrupted-quotation class guarded,
`measure/c1-token-check-r54.txt`); v14 selftest 16/16; both ledgers re-bound at
one fresh snapshot (16 dispositions carried by exact whole-line quote match,
0 new adjudications needed — kengaku's re-screen at its new head f97e5b7b
re-derived 847 lines with ZERO browser-ground hits, so the lane row's
sha/lines/bgHits re-bound and no line row changed), 0 dropped stale quotes;
GREEN at `435ea4ce` at correction 0 — exit 0, predicate true, 0 findings,
counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}; NO correction cycle
consumed this round (the first round since 46 with none), receipt
`measure/c1-meter-green-at-data.json` named by OUTCOME at the revision it
measured.
ADMIT — C2 (the r53 planned residual exercised at `4d3dca81`: the live 6-leg
journey with the fill now THREE per-key key-event traces — the r52 plain trace
into #field and the r53 Shift-chord trace into #field2, both behavior-unchanged,
PLUS the round-54 chord-domain leg into #field3: three real modifier chords
(Control bit 2, Alt bit 1, Meta bit 4 — S153's bit field) on the nonce-derived
letter (first `[a-f]` char of the hex tail — `d`), 12 key events, each chord's
two page-recorded keydowns read back from `window.__keylog`, the bit↔boolean
correspondence measured live (bit 2 ↔ ctrlKey, bit 1 ↔ altKey, bit 4 ↔ metaKey,
shiftKey false; modifier keys' own keydowns delivered as
Control/ControlLeft/17, Alt/AltLeft/18, Meta/MetaLeft/91), #field3 staying EMPTY
(the negative witness: a modifier chord inserts nothing), the keylog window +6,
and `journey.form.pageKeylog` — the page's COMPLETE keydown record of the fill,
70 entries for this nonce — re-derived end to end by the counter from the
receipt's own nonce and matched entry by entry; the GET submit carrying both
parameters witnessed SERVER-SIDE and CLIENT-SIDE; nonce
`tabi-r54-6da3859c91bdfddb`; six per-step URL/title/PNG pins; Edg/156.0.4314.58;
teardown sweep 0; host-exe-provenance disclosed (the data scratch's FRESH
compile was spawn-refused — UNKNOWN errno -4094, the r53 per-blob condition
recurred — the blocked run's stderr is COMMITTED at
`controls/c2-live-run1-spawn-unknown.txt` under the round's own convention, and
the documented class fix was applied: the scratch seeded with the
already-proven smoke-run blob, the reuse disclosed by the receipt's
`{"step": "host-exe-reused"}` step + hostExeSha256/hostCsSha256 pins);
counter r54 green 0 findings couldNotEvaluate [] (`measure/c2-counter-green-at-data.json`);
cross-refusals symmetric — the r53 counter refuses the r54 receipt with
**5 findings** (schema, profile-shape, nonce-shape, driver-pin,
form-mechanism; `measure/c2-r53counter-refuses-r54.json`) and the r54 counter
refuses the committed r53 receipt with **7 findings** incl. schema and
**chord-domain-missing** and **keylog-missing**
(`measure/c2-r54counter-refuses-r53.json`); counter selftest **96/96** at the
frozen bytes (93 refusals covering every harness-expressible finding id
incl. eleven new round-54 chord-domain/keylog cases and the full r53 chain;
exact-findings manifest + declared cne rule per case;
`measure/c2-counter-selftest-at-freeze.json`); `--path-selftest` 6/6
(`measure/c2-path-selftest-at-freeze.json`); the capability row
`webview2-modifier-domain-chords-windows` enters the table at the work commit).
REJECT — the spawn-blocked first data run as a data source (the runner crashed
at spawn before writing a receipt; the full stderr is kept and named under the
committed-stderr convention at `controls/c2-live-run1-spawn-unknown.txt`; the
successful data run reuses a proven blob with its provenance pinned in the
receipt).
REJECT — the round-open smoke run's receipt as round DATA (it is the D1
spawn-verdict CONTROL — a fresh compile that spawned first try, stderr
committed inside `controls/hostexe-fresh-compile-spawn-verdict.json` +
`controls/hostexe-smoke-receipt-r54.json`; it preceded the freeze and its
runner bytes equal the frozen digest, but it is a control, not data).

## Corrections of record (r53-closure carry-in + one found this round; append-only — the r53 bytes are not edited)

- **Item 1 (D1, class `landing` — dead evidence pointers) and the convention it
  names.** Superseded text: the r53 lesson's Mistakes row said the three
  spawn-blocked compiles' stderr was "kept: scratch live-run2/3/4-stderr".
  Those bytes were in lane scratch, and lane scratch is deleted at round end
  per the round contract — the pointers are dead: the artifacts are NOT
  re-openable at closure, and they are unrecoverable now (the r53 scratch is
  gone; this round's survey found only the closure's own verifier scratch).
  The class evidence that DOES survive: the PROVINCE standing note, the r53
  knowledge note, and the committed r53 receipt's `host-exe-reused` step. The
  correction: (a) the r53 stderr bytes are disclosed LOST, never silently
  replaced; (b) the convention is NAMED — **the committed-stderr rule**: run
  stderr cited as evidence must resolve to committed bytes, or be quoted
  verbatim in the lesson, at the round that cites it; lane scratch is
  ephemeral and never citable (the round prompt's "/tmp is never citable"
  extended to scratch); (c) the convention lands as `corpus/QUALITY.md`
  criterion 108 citing this lesson; (d) the class's evidence is REGENERATED
  under the convention this round: `controls/hostexe-fresh-compile-spawn-verdict.json`
  (fresh compile+spawn, every stderr byte committed inside the receipt) and
  — the rule applied at the round that cites it — the data run's own
  spawn-blocked first attempt has its full stderr committed at
  `controls/c2-live-run1-spawn-unknown.txt`.
- **Item 2 (D2, class `name-leftover` — the r52 item-1 class again).**
  Superseded text: the r53 lesson and report described the receipt disclosure
  as a "`compileReuse` 'reused' path". Measured this round
  (`measure/d2-receipt-shape-check.txt`): the committed r53 receipt carries
  **0** occurrences of `compileReuse`; the disclosure shape is the
  `{"step": "host-exe-reused"}` note step plus the `hostExeSha256`
  (83c466d3…) / `hostCsSha256` (13b2bc3d… — == the committed source) pins.
  No measurement bound the drifted name. The frozen r53 bytes are not edited;
  every forward quote carries the step+pins shape (this round's receipt, the
  knowledge note, PROVINCE, SCORECARD).
- **Item 3 (found this round, class `name-leftover` — instrument-output
  drift, the same class as item 2 but in the meter's own output).** v13's
  run-output JSON emitted `schema: "tabi-adjacency-host-v12"` while its
  die()/selftest/sentence strings said v13 — the v13 generation bump missed
  the run-output field. Found by this round's diff review of the meter before
  any run; FIXED in the v14 generation (v14 emits
  `tabi-adjacency-host-v14` in all four places); the committed diff
  (`controls/v13-v14-meter.diff`) names the changed line, and
  `measure/c1-token-check-r54.txt` measures the fix. No v13 byte is edited;
  the v13 generation is retired at its own bytes.
- **The L2-floor L0 (`tabi | round-44`, routed around every round since 44).**
  Already consolidated as the standing PROVINCE.md disposition line (the
  r50-closure consolidation governs); referred to above, not restated; the
  question is never treated as answered.

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind through the v14 generation bump;
  green measured at `435ea4ce8b4962f29331888401f3cba6bdf3b959`, correction 0):
  - Before: `node .ufo/waves/round-53/counters/c1-adjacency-host-v13.mjs --rev
    3a415cbc… --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false,
    **findingCount 7** (5 lane-screen-head-mismatch + lane-screen-sha-mismatch
    and lane-screen-lines-mismatch, both kengaku; zero audit findings) —
    receipt `.ufo/waves/round-54/controls/c1-meter-v13-red-at-round-open.json`
    (round open, before any lane write).
  - Instrument: `node .ufo/waves/round-54/counters/c1-adjacency-host-v14.mjs
    --selftest` → exit 0, allPass=true, cases=16, pass=16
    (`measure/c1-meter-v14-selftest.json`); the diff v13→v14 is committed
    (`controls/v13-v14-meter.diff`, 61 diff lines: header comments, the ledger
    rebind, schema strings, usage strings, the emitted-sentence/header token —
    and the run-output schema fix).
  - After: `node .ufo/waves/round-54/counters/c1-adjacency-host-v14.mjs --rev
    435ea4ce… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16,
    deltaLanes:12} — receipt `measure/c1-meter-green-at-data.json` (named by
    outcome; the green revision IS the data revision — no correction cycle
    consumed, the first round since 46 with none).
  - Ledgers: `awk -F'\t' 'NR>1 && $1=="lane"{n++} END{print n}'
    corpus/adjacency-host-delta-r54.tsv` → 12; line rows
    `awk -F'\t' 'NR>1 && $1=="line"{n++} END{print n}'` → 16; audit rows
    `awk -F'\t' 'NR>1{n++} END{print n}' corpus/adjacency-host-audit-r54.tsv`
    → 16 (9 unchanged + 6 sibling-absent + 1 moved — the kumitate row honest
    at :1736).
- C2 (coverage — the chord-domain capability; measured at
  `4d3dca816e5f242b6cd5e7628b96918eec6ec1b7`):
  - Evidence: `git ls-tree -r --name-only <REV> -- corpus/evidence/round54 |
    wc -l` → baseline **0** → **7** (receipt.json + 6 per-step PNGs).
  - Live run: inline loopback HTTP fixture on ephemeral port 64673; legs
    `Page.navigate` → `/a.html`, anchor-click → `/b.html`, anchor-click →
    `/c.html`, `Page.navigateToHistoryEntry` → `/b.html` (targetIndex 2),
    anchor-click → `/form.html`, then the fill as THREE per-key traces — the
    r52 plain trace (25 keyDown/keyUp pairs, keyEventCount 50, 25 prefix
    witnesses, allPrefixTrue), the r53 Shift-chord trace (25 chord entries,
    keyEventCount 70, per-keystroke prefix witnesses, allPrefixTrue), and the
    round-54 CHORD-DOMAIN leg (three chords Control/Alt/Meta — bits 2/1/4 — on
    the derived letter `d`, 12 key events, per-chord domEvents from the page's
    own `window.__keylog`: the modifier's own keydown
    Control/ControlLeft/17 + ctrlKey, Alt/AltLeft/18 + altKey,
    Meta/MetaLeft/91 + metaKey, then the letter's keydown KeyD/68 + its
    chord's boolean, shiftKey false throughout; the keylog window +6;
    `field3ValueAfter` '' — the negative witness) — then the submit through
    the form's own button, the GET navigation to
    `/echo?field=tabi-r54-6da3859c91bdfddb&mixed=TABI-R54-6DA3859C91BDFDDB`;
    both values witnessed on the echo page and in the fixture served log;
    `journey.form.pageKeylog` = the page's complete 70-entry keydown record;
    history at C `[data:, a, b, c]` (4/3), after the hop 4/2;
    `Edg/156.0.4314.58`; teardown postKillSweepCount 0; host-exe-reused
    (provenance pinned: the receipt's `{"step": "host-exe-reused"}` step +
    hostExeSha256 + hostCsSha256 — see Corrections item 2 for the shape).
  - Counter: `node .ufo/waves/round-54/counters/webview2-receipt-r54.mjs
    corpus/evidence/round54/webview2-modifier-chords/receipt.json --shot
    …journey-echo.png --png-a … --png-b … --png-c … --png-form … --png-echo …
    --driver scripts/webview2-cdp-loopback-round54.mjs --hostsrc
    scripts/webview2-host-round48.cs` → exit 0, predicate true, **0 findings**,
    couldNotEvaluate [] (`measure/c2-counter-green-at-data.json`).
  - Cross-refusals: the r53 counter on the r54 receipt → exit 1, **5 findings**
    (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch,
    form-mechanism; `measure/c2-r53counter-refuses-r54.json`); the r54 counter
    on the committed r53 evidence receipt → exit 1, **7 findings** (schema,
    profile, nonce-shape, driver-pin, form-mechanism, **chord-domain-missing**,
    **keylog-missing**; `measure/c2-r54counter-refuses-r53.json`).
  - Selftests: counter 96/96 (`measure/c2-counter-selftest-at-freeze.json`, at
    the frozen bytes; 3 green incl. one declared-cne green + 93 refusals incl.
    eleven new round-54 cases); `--path-selftest` 6/6
    (`measure/c2-path-selftest-at-freeze.json`).
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
  **160 → 161** (S161 new; S153 re-opened byte-identical a sixth time, its
  used-by column extended in place per the contract — old→new logged here:
  the r53 tail gains `corpus/knowledge/webview2-modifier-domain-round-54.md,
  corpus/lessons/round-54.md`). Knowledge notes 69 → **70** (the
  modifier-domain note). `node scripts/check-sources.mjs` → SOURCES_GATE
  verdict=clean rows=161 (`measure/check-sources-at-work.txt`).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| landing (the r53-closure D1, executed as its own evidence): run stderr cited as evidence was left in ephemeral lane scratch and destroyed at round end — dead evidence pointers | the r53 lesson's Mistakes row ("stderr kept: scratch live-run2/3/4-stderr"); the r53 scratch is gone (this round's survey found only the closure's verifier scratch); the surviving class evidence is the PROVINCE standing note + the r53 knowledge note + the committed r53 receipt's host-exe-reused step | none at the time it was cited (the round prompt forbids citing /tmp; scratch was treated as citable when it is equally ephemeral) — captured THIS round by the r53 non-author closure (D1) and landed here | the committed-stderr rule named (Corrections item 1) and landed as QUALITY.md criterion 108 citing this lesson; the class regenerated under the convention this round (controls/hostexe-fresh-compile-spawn-verdict.json; controls/c2-live-run1-spawn-unknown.txt — cited stderr committed at the citing round, same hour it was produced); the r53 bytes disclosed LOST |
| transform authoring defect (the r53 ok-chain class, this round's fixture generator): the r53→r54 fixture transform v1 carried whole r53-derived lists (typing/chords traces embed per-character nonce values), so the generation rename left cross-generation character leaks (the position-6 `3`→`4` nonce char) that surfaced as extra typing-char/code/vk findings | the counter's exact-findings selftest FAILED on first generation (green cases emitted 29 spurious findings; 2/96 passing) — caught at authoring, BEFORE the freeze, fixed in the generator (element-wise list diffs + trace rebuild from the final nonce + slice-to-length for length mutations); the FROZEN selftest is 96/96 (measure/c2-counter-selftest-at-freeze.json) and is the committed evidence of the fixed state | the instrument's own exact-findings manifest (the r52/r53 discipline working — a fixture set that cannot lie about its counter) | disclosure: the INTERIM failing outputs were overwritten in scratch (v1→v3 in place) and are not committed — the committed-stderr rule now covers such receipts going forward (failing-state receipts of cited defects get committed at the round that cites them); class fix recorded: a cross-generation fixture transform must re-derive per-character traces from the FINAL nonce and apply case mutations element-wise, and interim failing receipts must be kept named in scratch until the round commits or discards them |
| environment drift recurrence (the r53 per-blob spawn-verdict condition, recorded as a PASS of the r53 class fix — not a new mistake): the data scratch's FRESH compile was refused at spawn (UNKNOWN, errno -4094) | the blocked run's full stderr COMMITTED at `controls/c2-live-run1-spawn-unknown.txt` (the committed-stderr rule applied at the round that cites it); the receipt discloses the reuse (host-exe-reused step + pins); the round-open smoke run's fresh compile spawned first try (`controls/hostexe-fresh-compile-spawn-verdict.json`) — the per-blob verdict class is stochastic, as disclosed since r53 | the runners' own spawn failure, committed under this round's convention | the documented r53 class fix applied unchanged: seed the scratch with a proven-spawnable blob, use the runner's reuse-if-exists branch, say which in the receipt |
| name-leftover (instrument output, found by diff review before any run): the v13 meter's run-output JSON said `schema: "tabi-adjacency-host-v12"` while its die/selftest/sentence strings said v13 | the committed diff `controls/v13-v14-meter.diff` (the v12→v14 schema line is visible); `measure/c1-token-check-r54.txt` measures v14 emitting v14 in all four places | this round's generation-diff review (the r52 corrupted-quotation review discipline, applied to the meter generation bump) | FIXED in v14 (all four schema strings name v14); Corrections item 3 of record; no v13 byte edited — the generation is retired at its own bytes |

## Census

Start (2026-11-02, round open): `bash <fleet>/scripts/sources-census.sh validate
--root <fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04 duplicate-URL
warnings (the same set disclosed r47–r53); receipt
`.ufo/waves/round-54/measure/census-start.txt` (committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-54/measure/census-end.txt`), W04 set unchanged at 22, registry
161 rows.

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-02). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow unreachable.
