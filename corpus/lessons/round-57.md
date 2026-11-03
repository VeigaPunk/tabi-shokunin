# Round 57 lesson — tabi, 2026-11-03 (Linux host)

Baseline `ef43ecec` → freeze `6f00780c` (instruments + claims + round-open controls + wave
evidence, no data) → C1 data `646c1859` (ledgers re-bound at ONE fresh snapshot; GREEN at
correction cycle 0 — the first round since 54 with none consumed) → C2 data `c5ac279a` (the
live Chromium 155 modifier-chords receipt + 8 per-step PNGs, evidence tree 0 → 9) → work
commit (this block). Axes at round start: adjacency 8, coverage 9, depth 9, operability 9,
freshness 9, calibration 9; saturation 8 / window 3; the r56 capability row
(`chromium-keyevent-control-keys-linux`, first-working 56) keeps the window RESTARTED
(round 57 = position 1) — the nudge is inactive, the lowest-axis obligation applies, and C1
works adjacency. Fresh-start ruling: rounds 53–56 were all ADMITTED (no three-rejected
streak), so no fresh-start round is owed; the refused claim classes (r42
counter-greens-synthetic, r43 in-model do-nothing seats, r47 reasoned-not-measured) remain
ruled out by construction: both after-states are committed instrument outputs at named
revisions, and both claims carry explicit do-nothing controls.

## Gate

| Source | Opened | Command | Located quote (≤25 words, byte-exact) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json — https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED (ninth open; `@master` UNMOVED: 1,423,170 B, sha256 `d6737c31…` == the round-56 re-open digest; `cmp` vs the committed r56 staged copy: no difference) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-57/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" (`Input.dispatchKeyEvent` → `modifiers`, raw line 14323; 1 hit scoped to the command block, 5 file-wide, one per Input command) |
| S161 — W3C UI Events, KeyboardEvent modifier attributes — https://www.w3.org/TR/uievents/ — RE-OPENED (byte-identical to the registered anchor: sha256 `8ded5eaf…` == the row's recorded digest) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-57/sources/uievents.html https://www.w3.org/TR/uievents/` → 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | "`<code>true</code> if the <code class="keycap">Control</code>` (control) key modifier" (§3.5.1 `ctrlKey`, line 3264; byte-exact including the keycap markup — the r56 closure's quote-precision rule applied) |

The L1 independently re-verified both re-opens against the staged bytes at integration
(the L1 gate promised to R57Scribe): S153's `modifiers` description parses to exactly the
bit-field sentence with the real `\n` escape (`"…Shift=8\n(default: 0)."`), 1 hit scoped to
the dispatchKeyEvent span, 5 file-wide; S161's four boolean definitions are byte-exact at
lines 3264/3273/3282/3291 including the `<code class="keycap">`/`<code class="glyph">`
markup. Receipts: `.ufo/waves/round-57/scribe/reopen-receipt-s153.json`,
`.ufo/waves/round-57/scribe/reopen-receipt-s161.json`,
`.ufo/waves/round-57/scribe/reopen-receipt-round-57.json` +
`scribe/gate-quote-verification.json` (byte-exactness proof per quote). The frozen
`scripts/check-source-reopen-receipt.mjs` is a round-25-scoped gate by design
(RECEIPT_PATH/EXPECTED_IDS are that round's set); the L1 ruling (recorded in the scribe
report §"frozen gate") is that no round-57 variant is authored — the seat's scratch
re-implementation of the frozen gate's row predicates (f3/f4/f5/f6) scoring 0 findings on
all three receipts is the verification of record, plus the L1's own quote re-verification
above. Instrument proliferation for no new check is not adoption.

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains
the closure's duty):

ADMIT — S153 re-open (`@master` unmoved; the modifiers bit field re-verified verbatim; the
transport contract for every chord leg).
ADMIT — S161 re-open (byte-identical; the DOM booleans the page-side recorder captures).
ADMIT — C1 (adjacency, the lowest owned axis): the round-open v16 meter measured RED at the
baseline — exit 1, predicate false, **1 finding** (`lane-screen-head-mismatch:
kengaku-shokunin`; receipt `.ufo/waves/round-57/controls/c1-meter-v16-red-at-round-open.json`,
taken before any lane write — a do-nothing control reaches exactly this red, green requires
the rebind work). The v17 meter is v16 + the DECLARED change set only: (a) the r56→r57
relabel (AUDIT_REL/DELTA_REL, schema strings, predicate sentence file names, usage, header)
and (b) the ROUTED r56-closure fix — `predicateFrom(findings)` as the single shared
predicate emission + two new selftest cases (`predicate-assert-green`,
`predicate-assert-partial`) that assert the EMITTED predicate at green and
exactly-one-clause-failed states; the OR-class inversion m4' is KILLED by the selftest
(16/18 with exactly the two new cases failing — `mutant/m4-kill.json`, triple-corroborated
by R57Adj's self-dev receipt, R57MutMeter's probe and R57Reviewer's weaker-mutant sweep;
the reviewer's mutant files sit at `reviewer/fixtures/`).
The committed diff `counters/v16-v17-meter.diff` accounts for every differing non-comment
line (`adj/v17-line-audit.txt`); the verify() pure core is otherwise byte-identical.
Selftest 18/18. GREEN at the data revision `646c1859`: exit 0, predicate true, 0 findings,
counts {roster 20, mapRows 16, auditRows 16, deltaLanes 16} — **correction cycle 0 of 2
consumed** (the first round since 54 with none). The rebind carried the r56 dispositions by
exact whole-line quote match; the ONE new kengaku BG line (its head moved twice this round:
`9ebde3a7`→`859ac24f`→`21b13dc7`) was adjudicated `no-tabi-ground` via
`measure/c1-adjudications.json` — the line reports OUT terminal/nginx tooling
(`headless-terminal`, `nginx-request-logging`) as blocked on absent binaries and keeps it
kengaku ground; no browser/CDP/web-interaction surface is named.
ADMIT — C2 (coverage, capability acquisition `chromium-keyevent-modifier-chords-linux`):
the live Chromium 155 receipt at `c5ac279a` (nonce `tabi-r57-6b714a3a7080`, fresh run first
try, `Chromium 155.0.8059.84 Arch Linux`, teardown 0 survivors, argv shape-only with the
throwaway profile + `--disable-extensions` + throwaway HOME/XDG): shiftTrace 21 entries
with per-keystroke prefix witnesses on BOTH fields (field2 grows the UPPERCASED nonce,
field stays the plain nonce), every uppercase letter's event carrying `modifiers: 8` with
the Shift keyDown/keyUp ride around its pair, digits/hyphen unshifted; chordLeg letter `b`
(first [a-f] of the nonce hex tail) with three real chords Control/Alt/Meta (bits 2/1/4)
into the never-submitted field3, the page's own `__keylogFull` recording every
keydown/keyup with its booleans (120 entries = 60+60), the bit↔boolean correspondence
measured live (2↔ctrlKey, 1↔altKey, 4↔metaKey; shiftKey false on the chorded letter),
field3Final `""` + field3NameAttribute `null` (the negative witnesses); Enter LAST with
`serverSawField == nonce` AND `serverSawField2 == nonce.toUpperCase()` (the critic's
declared strengthening — the Shift leg's server-side echo witness); the r56 plain trace +
control legs carried unchanged. Counter green exit 0, 0 findings, 0 couldNotEvaluate with
`--expect-driver-sha256 e0b1f3f5…`; cross-refusals symmetric (r56 counter on the r57
receipt: exit 1, 3 findings, `schema-wrong` first; r57 counter on the committed r56
receipt: exit 1, 7 findings, `schema-wrong` first); counter selftest 70/70 at the frozen
bytes; runner `--path-selftest` 13/13. Evidence tree 0 → 9.
ADMIT — the quarantine adjudication rule (see Assimilation): the unified verdict rule
(located-anywhere-else = mispaired with the carrier named; located-nowhere =
absent-confirmed) applied across all four seats' receipts, with the register-shift scan
(`quarantine/R57QuarB/register-shift-scan.json`: 26/37 rows' entire quote cell
byte-present in a single cell of staged row N+1) as the structural proof.
REJECT — the fabrication reading of the register's `payload-absent` class for tabi: 32 of
38 rows' quote cells are next-row text (the one-row quote-column shift); a face-value
roll-up would log ~32 nonexistent fabrications. The register row is refused as
absence-evidence; the class is a checker artifact, not a staging fabrication.
REJECT — S124's staged knowledge quote (`merge/tabi/knowledge/redirect-and-retry-after-semantics.md`
quotes "Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable)
status code" as source-grounded): the sentence is absent from RFC 9110 AND RFC 7231 under
the full ladder (QuarA's correction list; the r27 ScoutStagedGround 4.4 precedent) — a
fabrication-class quote in the STAGED entry; the row stays refused and adoption stays
closed.

## Corrections of record (r56-closure carry-ins; append-only — the r56 bytes are not edited)

1. **Routed defect 1 (R56Mutant m4 survivor) — CLOSED this round.** The v17 generation
   ships the shared `predicateFrom` emission + the two asserting selftest cases; the
   OR-class mutant is killed by the selftest (receipts `mutant/m4-kill.json`,
   `adj/m4-kill-selfdev.json`). Residual (R57Reviewer mG): the cases' assertion strength
   rests on two harness lines (`okPredicate`/`okCount`) that no selftest case guards — a
   harness-drop mutant survives; routed to the next meter generation as a named-line
   protection item, not silently widened.
2. **Routed defect 2 (R56Gate-F1 relative-form gap) — CLOSED this round.**
   `scripts/check-cited-receipts-v2.mjs` (sha `f7f2d4e4…`; the r56 v1 stays frozen):
   unprefixed tokens under a known wave-dir component resolve against
   `.ufo/waves/round-<N>/`; traversal refused outright; selftest 6/6 incl. the v1
   differential; red-before at the r55 close revision: v1 6 findings/5 paths → v2 83
   findings/72 distinct, both F1 targets caught (`gate/v2-red-before-545b251d.json`). The
   L1 ruling on the gate's close-run usage contract (recorded in the gate report §5.1):
   the relative rule applies to ROUND-SCOPED docs (the round's own lesson + report at
   `--round N`); cumulative docs (SCORECARD, LOG) stay under the v1 full-prefix rule — a
   relative token there is ambiguous by construction (the head run's 62
   exists-in-another-round findings are the demonstration); the same-name masking
   limitation is disclosed and scoped away by the same rule. The annex-scope-v3 sketch
   (7 findings, 33-34 silently unchecked) is the named alternative, NOT adopted.
3. **Routed defect 3 (wave-4 quarantine-first) — EXECUTED this round** (see Assimilation).
4. **Routed defect 4 (L0 `tabi | round-44`)** — stays OPEN; routed around via the inline
   spawn handoff (16 seats in one batched wave); never treated as answered.
5. **Routed defect 5 (SOURCES.md N4 pattern)** — the operator/aggregator ruling stays
   pending; this round adds in-place re-open logs only (S153/S161 anchor cells + used-by
   extensions), old→new logged above and in the report.
6. **Routed defect 6 (seat counts from results.json)** — applied: this round's counts are
   quoted from `w1-results.json` (16 results entries), never from prose memory.
7. **Routed defect 7 (byte-exact quotes)** — applied: every Gate quote above is
   byte-exact including inline markup, proven per-quote in
   `scribe/gate-quote-verification.json`.

## Measurements (counting commands, paste-able)

```
# C1 before (red control, round open, before any lane write):
node .ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs --rev ef43ececde883cc0368c6c7cfbabe30ef937b717 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 1, predicate false, findingCount 1 (lane-screen-head-mismatch: kengaku-shokunin)
#   (receipt controls/c1-meter-v16-red-at-round-open.json; a LATER re-run may show more
#   findings as sibling heads move — the committed receipt is the frozen before-state)
# C1 after (green at the data revision, correction cycle 0):
node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs --rev 646c1859aecad30998667e8ea3e9235ec2b3041d --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 0, predicate true, findingCount 0, counts {roster:20, mapRows:16, auditRows:16, deltaLanes:16}
#   (receipt measure/c1-meter-green-at-data.json)
# C1 selftest + mutation kill at the frozen bytes:
node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs --selftest          # → 18/18 (adj/v17-selftest.json)
#   m4' OR-inversion → selftest FAILS 16/18 with exactly the two new cases (mutant/m4-kill.json)
# C2 before / after (the evidence tree):
git ls-tree -r --name-only ef43ececde883cc0368c6c7cfbabe30ef937b717 -- corpus/evidence/round57 | wc -l   # → 0
git ls-tree -r --name-only c5ac279a7b771afb6aff8f565b12a3afecf8b900 -- corpus/evidence/round57 | wc -l   # → 9
# C2 counter green (committed receipt + committed PNG bytes, clean tree):
node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs corpus/evidence/round57/chromium-modifier-chords/receipt.json --driver scripts/chrome-cdp-loopback-round57.mjs --expect-driver-sha256 e0b1f3f5b8d576e2c96b298eb76a828ee3aa2e363305c05eaa8636fa02d0573b --shot corpus/evidence/round57/chromium-modifier-chords --json
#   → exit 0, predicate true, findings [], couldNotEvaluate []  (measure/c2-counter-green-at-data.json)
# cross-refusals (committed bytes):
#   r56 counter on the r57 receipt → exit 1, 3 findings, schema-wrong first (measure/c2-r56counter-refuses-r57.json)
#   r57 counter on the committed r56 receipt → exit 1, 7 findings, schema-wrong first (measure/c2-r57counter-refuses-r56.json)
# selftests at the frozen bytes: counter 70/70 (measure/c2-counter-selftest-at-freeze.json);
#   runner --path-selftest 13/13 (measure/c2-path-selftest-at-freeze.json); meter v17 18/18 (adj/v17-selftest.json)
# gate v2 red-before (the widening catches the previously-invisible class):
node scripts/check-cited-receipts-v2.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --round 55 \
  --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md --json
#   → exit 1, 83 findings / 72 distinct (v1 at the same revision: 6 findings / 5 paths)  (gate/v2-red-before-545b251d.json)
# quarantine census (the register slice):
awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print $4, $5}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md | wc -l   # → 38
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| THE REGISTER'S QUOTE COLUMN IS SHIFTED ONE ROW: row N's quote cell is staged row N+1's anchor text (mechanism: `parse_gate_blocks` `quote-lint.py:159-166` ends a block at the next `## Gate` heading, swallowing the next row's table line incl. its §-anchor cell; `block_quotes` `:376-424` harvests those spans as row N's quotes; structural proof `quarantine/R57QuarB/register-shift-scan.json` — 26/37 parseable tabi rows carry their ENTIRE quote cell from staged row N+1, 7 partial; the scout's census-internal classification: 54 of the 65 tabi ABSENT findings are next-row-table-line spans) | none (the register's own class cell said "the quote is in none of them" for rows whose own gate quotes always matched — a checker artifact wearing a fabrication label) | the 38-row hand-check verdict-per-row (this round's quarantine duty) + the unified adjudication rule recorded in the lesson; the campaign correction has a named address (`quote-lint.py` block-boundary rule); ADOPT NOTHING held — adoption stays closed until the register is regenerated or the shift is corrected campaign-side |
| the r56 lesson's register count (39) vs the frozen filter's 38: the looser grep counted the By-lane summary row (`| `tabi` | 37 |`) as a data row | the prompt's frozen awk filter (re-derive at round time — it is the authority) | counts are derived only by the frozen filter; the reconciliation is recorded here; the prompt's own "39" was the looser count |
| R57MutMeter m4b SURVIVOR — weakening `parseRef`'s line-number regex (`/^\d+$/` → `/^\d+/`) survives the v17 selftest 18/18 (no case feeds a malformed line-number suffix; under the mutant the `map-ref-unparseable` id disappears, replaced by audit-status-mismatch/audit-missing — the live output stays red but the ID set changes unobserved) | the mutation seat's own probe (`mutant/results.tsv`) | next meter generation: a selftest case feeding a bad-suffix ref asserting the `map-ref-unparseable` id; v17's bytes stay frozen |
| R57Reviewer mG SURVIVOR (harness-level) — the two predicate-assert cases' strength rests on the unguarded harness lines `okPredicate`/`okCount`; a mutant that drops the assertion and returns `true` survives 18/18 | the reviewer's weaker-mutant sweep (the mutant files at `reviewer/fixtures/`) | next meter generation: the harness lines get their own named-line protection (a selftest case that asserts the harness's own verdict logic), not a silent widening |
| R57Sentinel R57-S3 (high, guard gap): the quarantine seats' fetch guard checked the URL string but not the FINAL host after redirects — a fetch landing on a refused host could derive an `absent-confirmed` (fabrication) verdict from bytes that did not come from the cited source; the sentinel verified `num_redirects 0` on every committed fetch, so NO committed verdict is affected | the sentinel's live probe (`sentinel/` evidence; E14) | R57QuarB re-fetched post-guard (url_effective re-guarded, `-q` first, absolute `-o`, Content-Encoding + size-vs-cap recorded — 23/23 fetches zero flags); the guard-on-final-host rule is pinned for every future register fetch (a guard change only: it can turn a verdict into `unreachable`, never the reverse) |
| the runner seat's header name-leftover (round 56 in comments of the r57 file) + the fixture-server close-ordering bug (close() awaiting Chromium keep-alive sockets) — both caught pre-freeze by the seat's own diff review and smoke | the r53 ok-chain lesson's diff-review discipline + the smoke run | fixed pre-freeze (header sweep; kill-group-first + closeAllConnections + bounded close); the sentinel R57-S1 SIGTERM/SIGINT keyed-teardown amendment applied by the L1 pre-freeze (smoke re-run green; driver digest `e0b1f3f5…` pinned in the scoring command) |
| measure receipts written through a traced shell carried the shell's xtrace prefix (`+ node …` lines inside redirected JSON), breaking JSON parsing on first read (caught immediately by the parse check) | the parse-before-cite check (this round's own discipline) | re-derived with the trace filtered (`grep -v '^+ '`); class rule: a receipt file must parse as JSON before it is cited; a traced shell never writes a receipt directly |

## Census

Start (2026-11-03, round open): `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 22 pre-existing W04
duplicate-URL warnings (the same set disclosed r47-r56); receipt
`.ufo/waves/round-57/controls/census-start.txt`. End (round close): same command → exit 0
(receipt `.ufo/waves/round-57/measure/census-end.txt`), W04 set unchanged at 22, registry
161 rows (no new row: the two re-opens ride existing rows; no duplicate-URL draft was
proposed this round). `node scripts/check-sources.mjs` → SOURCES_GATE verdict=clean
rows=161 findings=0 (`.ufo/waves/round-57/measure/check-sources-at-work.txt`).

## Assimilation

The wave-4 quarantine-first duty is EXECUTED: all 38 tabi data rows in
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(frozen filter: lane `tabi` + round cell + S-id cell; the r56 prose count 39 included the
By-lane summary row) hand-checked verdict-per-row by four seats (10/10/10/8) plus the
reviewer's independent 3-row sample and the scout's census-internal re-parse. Unified
verdict table (the L1 adjudication; the seats' raw verdicts stay untouched in their
receipts): **32 mispaired** (the one-row quote-column shift — the quote text is real and
located at the carrier: the next staged row's anchor/scope cell and its cited source;
carriers named per row in the receipts), **2 absent-confirmed** (S114: "set-of-marks" vs
the PDF's "set-of mark" 1-char drift, content present but the quoted form locates nowhere;
S124: the Retry-After sentence absent from RFC 9110 AND RFC 7231 — the staged knowledge
entry quotes it as source-grounded, a fabrication-class quote in the STAGED entry),
**1 partial-located** (S111: 1/2 — "Add hints to your tools" is the page's h2 paraphrase
"Use annotation hints"; the quoted form locates only in the staged anchor + knowledge),
**2 quote-located** (S118: the arXiv PDF text layer under page-level reading order;
S140: the f6 tag-strip+punctuation-strip fold the census lacks), **1 unreachable** (S171:
the malformed row — id cell `S171` with a stray backtick, prose class cell; the cited
`chromestatus.com/features/<id>` URL 404s but the record is live at
`chromestatus.com/feature/<id>` with exactly the quoted fields — recoverable by URL
re-point, never unverifiable). **ADOPT NOTHING** held: no register/staged/knowledge byte
was touched; adoption stays closed until the campaign corrects the register (the shift
mechanism is named at `quote-lint.py:159-166`/`:376-424` with the structural proof). The
id-collision context for the eventual adoption round (scout inventory): the staged block
is contiguous S102..S249 (148 rows, 86 knowledge entries); 60 of 148 staged ids
(S102..S161) are ALREADY OCCUPIED in the lane registry by different documents; only
S162..S249 (88 ids) are free; 1 knowledge basename collision
(`redirect-and-retry-after-semantics.md`); every `collides_with_existing` flag in
`MERGE-REPORT.json` is stale. `considerthese/` does not exist in the lane repo (checked
2026-11-03).
