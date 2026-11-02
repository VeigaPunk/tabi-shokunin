# Round 55 lesson — tabi, 2026-11-02 (Windows host)

Baseline `793d947e` → freeze `db6f4225` (after the disclosed 3-commit chain: two EMPTY
path-carrier commits + the claims-only probe — see Mistakes 2) → C2 data `c1e64885` (+ the
evidence addendum `81b2fdbd`) → C1 data `103bf06f` → correction 1 `216b1cf2` (the frozen
correction flow, cycle 1 of 2) → work commit (this block) → receipts commit. Axes at round
start: adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9;
saturation 8 / window 3; the r54 capability row keeps the window RESTARTED (round 55 =
position 1), the stagnation nudge is inactive, the lowest-axis obligation applies: C1 works
adjacency.

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S083 — WHATWG HTML Standard, form control infrastructure (constraints and form submission), https://html.spec.whatwg.org/multipage/form-control-infrastructure.html — RE-OPENED this round (the Implicit submission ground EXTENDED onto the row the registry already owns: the first S162 draft row was DROPPED because its URL duplicates S083's — check-sources E04 caught it before any commit, and the contract routed the ground to a re-open + used-by extension instead of a duplicate row) | 2026-11-02 | `curl -sL --max-time 60 "https://html.spec.whatwg.org/multipage/form-control-infrastructure.html" -o .ufo/waves/round-55/sources/html-form-control-infrastructure.html` → 466,321 B (`wc -c`), sha256 `dc7c30888b2d1d665c0afbabee782ee4e0789f4bb8c2685802db0b033e8d1aaa` (a NEW body — the Living Standard page moved since the r19 fetch; the r19 decoded-body sha `af71cc01…` stays the r19 basis, disclosed in the row) | "hitting the \"enter\" key while a text control is" (9 words verbatim in the raw bytes 1 hit; the sentence continues "implicitly submits the form" across the page's own anchor markup — §4.10.22.2 Implicit submission: the implicit submission fires a click at the form's DEFAULT BUTTON, the first submit button in tree order — the Enter-key submit leg's spec ground) |
| S153 — Chrome DevTools Protocol browser_protocol.json, https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (SEVENTH open; the fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, 1,421,620 B; no new row — the located ground rides the same dispatchKeyEvent contract; the used-by column extended in place, old→new logged here) | 2026-11-02 | `curl -sL --max-time 90 "https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json" -o .ufo/waves/round-55/sources/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c02…` (== the registered anchor) | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)." (the dispatchKeyEvent modifiers parameter description — the key-event contract every r52-r55 trace rides; located ground greps 5 hits in the fresh bytes) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains
the closure's duty):
ADMIT — S083 re-open with the extended located ground (the implicit-submission default-button
contract grounds C2's Enter leg; the duplicate-URL proposal honestly rerouted, disclosed).
ADMIT — S153 seventh re-open (byte-identical; the r52-r55 key-event instruments' shared ground).
ADMIT — C1 (adjacency, the lowest owned axis): the round-open red control on the committed v14
generation measured RED at the baseline — exit 1, **6 findings** (4 lane-screen-head-mismatch:
kengaku, mori, shokunin-binary-forensics, tameshi; PLUS lane-screen-sha-mismatch AND
lane-screen-lines-mismatch BOTH on kengaku — the second consecutive screened-province byte
change; ZERO audit findings so no map row moved as of round open; receipt
`controls/c1-meter-v14-red-at-round-open.json` taken before any lane write — a do-nothing
control reaches exactly this red, and green requires the re-bind work). The v15 meter (frozen
digest `2fbcf068…`) differs from v14 ONLY in header comments (including the Round 55 delta
paragraph quoting the red control's numbers and naming the comment-only name-leftover fix), the
AUDIT_REL/DELTA_REL rebind to the r55 names, the schema strings (v15 in all four places —
`controls/c1-token-check-r55.txt`), the usage strings, the sentence/header tokens, and THE FIX:
v14's header comment named "tabi round 53" (the D2 name-leftover class, comment-only — no
schema string, sentence token or output field involved; found by this round's diff review;
v14's bytes are NEVER edited; disclosed at `controls/c1-token-check-r55.txt`). Pure core
byte-identical to v14 (diff committed `controls/v14-v15-meter.diff`). GREEN at correction 1:
exit 0, predicate true, 0 findings, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}
at `216b1cf2` (correction 0 raced tameshi's commit — receipt kept
`measure/c1-meter-raced-at-correction0.json`; ONE fresh snapshot per cycle; 0 new
adjudications; kengaku re-screened at its new head a6cd337d: 892 lines, 0 BG hits, 0 line-row
changes; dispositions carried by exact whole-line quote match).
ADMIT — C2 (coverage, capability acquisition `webview2-keyevent-control-keys-windows`): the
live control-domain receipt at `c1e64885`/`81b2fdbd` (nonce `tabi-r55-5a70384367c4b44b`,
fresh compile spawned first try with the compile bytes inside the receipt, Edg/156.0.4314.58,
teardown 0): End negative-edit witness, Backspace residue == nonce[:-1] + exact restore, Tab
field→field2 witnessed by the page's own activeElement, Enter-key implicit submission
witnessed server-side AND client-side, keylog window +4, pageKeylog 69/69 matched entry by
entry; counter green exit 0, 0 findings, couldNotEvaluate []; cross-refusals symmetric
(r54 counter on the r55 receipt: 6 findings; r55 counter on the committed r54 receipt: 7
findings incl. control-domain-missing + keylog-length); counter selftest 103/103 at the frozen
bytes; `--path-selftest` 6/6. Evidence tree 0 → 7.

## Corrections of record (r54-closure carry-in; append-only — the r54 bytes are not edited)

1. **D54-1 — the orphaned counter receipts LANDED.** The r54 report/lesson/SCORECARD cite
   `measure/c2-counter-green-at-data.json` + the cross-refusal pair the SCORECARD names
   `c2-r53counter-refuses-r54.json` / `c2-r54counter-refuses-r53.json`; none existed in the
   committed tree (the r54 scratch was cleaned at round end). The author's originals are
   unrecoverable and are disclosed LOST. This round re-ran the committed r54 counters against
   the committed r54 receipt + PNG bytes and landed the three receipts at the exact cited
   paths: green exit 0 / 0 findings / cne []; r53-counter refuses exit 1 / **5 findings**
   (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch, form-mechanism — the
   exact cited set); r54-counter refuses exit 1 / **7 findings** incl. chord-domain-missing +
   keylog-missing (the exact cited set; the closure's driver observation reproduced). A
   provenance note (`measure/d54-1-landing-note-r55.txt`) names these as r55 RE-MEASURES.
   **Class fix (the criterion-108 sibling for receipts, landed as QUALITY.md criterion 109
   citing this lesson): every receipt a committed text cites must exist in the committed
   tree at the citing round — verified post-commit with `git show <rev>:<path>` /
   `git diff-tree --name-status -r <rev>`; a cited-but-uncommitted receipt is the
   orphaned-evidence defect.**
2. **D54-2 — S161 anchor precision corrected of record.** The r54 cell said §5.3; the staged
   bytes carry the KeyboardEvent attribute definitions under §3.5.1 Interface KeyboardEvent
   (`data-level="3.5.1" id="interface-keyboardevent"`; four attribute-definition ids present;
   NO 5.3 heading exists in the staged bytes). The LIVE row's anchor cell is corrected
   §5.3 → §3.5.1 with the correction disclosed in the cell (old→new logged here); ids and
   quote unchanged; no frozen byte edited.
3. **D54-3 — the L2-floor L0 standing** (`tabi | round-44`, open since round 44): consolidated
   as the standing PROVINCE.md disposition line; referred to, not restated, never treated as
   answered. This round again ran L1-inline and discloses it in claims.json.
4. **Fresh-start ruling honored** (the rendered contract §7 lists r42/r43/r47 as the last
   three REJECTED closures): all three re-read before declaring; the refused claim classes
   ruled out in claims.json's freshStartNote (no wave/seat claims; no reasoned-not-measured
   after-states — both after-states are committed instrument outputs at named revisions;
   the do-nothing-control test is explicit for both claims). Rounds 48-54 were admitted; the
   discipline is applied as a bar, not as a standing verdict.

## Measurements (counting commands, paste-able)

```
# C1 before (red control, round open, before any lane write):
node .ufo/waves/round-54/counters/c1-adjacency-host-v14.mjs --rev 793d947e14099a642428e9abafe708daf4938ddc --repo <lane> --fleet <fleet> --json
#   → exit 1, findingCount 6 (4 lane-screen-head-mismatch + sha/lines both on kengaku; 0 audit)
# C1 after (green at correction 1):
node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev 216b1cf2f136e445c8097fc00f5da63068c30244 --repo <lane> --fleet <fleet> --json
#   → exit 0, predicate true, findingCount 0, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}
#   correction cycle consumed: 1 of 2 (raced receipt kept: measure/c1-meter-raced-at-correction0.json)
# C2 before / after (the evidence tree):
git ls-tree -r --name-only 793d947e14099a642428e9abafe708daf4938ddc -- corpus/evidence/round55 | wc -l   # → 0
git ls-tree -r --name-only 81b2fdbde6e3606578ae215de4fdaaeeb8d2a1da -- corpus/evidence/round55 | wc -l   # → 7
# C2 counter green (committed receipt + committed PNG bytes):
node .ufo/waves/round-55/counters/webview2-receipt-r55.mjs corpus/evidence/round55/webview2-control-keys/receipt.json --shot ... --png-a ... --png-b ... --png-c ... --png-form ... --png-echo ... --driver scripts/webview2-cdp-loopback-round55.mjs --hostsrc scripts/webview2-host-round48.cs
#   → exit 0, predicate true, findings [], couldNotEvaluate []  (measure/c2-counter-green-at-data.json)
# cross-refusals (committed bytes):
#   r54 counter on the r55 receipt → exit 1, 6 findings  (measure/c2-r54counter-refuses-r55.json)
#   r55 counter on the committed r54 receipt → exit 1, 7 findings  (measure/c2-r55counter-refuses-r54.json)
# selftests at the frozen bytes: counter 103/103 (measure/c2-counter-selftest-at-freeze.json);
#   runner --path-selftest 6/6 (measure/c2-path-selftest-at-freeze.json); meter v15 16/16 (measure/c1-meter-v15-selftest.json)
# D54-1 landing (re-measures of the r54 claims on the committed r54 bytes):
#   measure/c2-counter-green-at-data.json → exit 0, 0 findings
#   measure/c2-r53counter-refuses-r54.json → exit 1, 5 findings
#   measure/c2-r54counter-refuses-r53.json → exit 1, 7 findings
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| caret-placement (the mouse-click caret anchor): `centerOf(id)` clicks + keys on a NON-EMPTY input place the caret at the click point, NOT at end-of-line — the first caret-SENSITIVE key leg (Backspace) deleted a MIDDLE character and the submitted query drifted from the invocation-bound pair | the pre-freeze smoke run at the authoring stage, BEFORE the freeze — the red receipt COMMITTED at the round that cites it (`controls/c2-smoke-caret-midtext-red.json`, criterion-108 discipline; the amended runner landed at the same digest the freeze pins, so no post-freeze amendment) | the End key anchor added to the r55 runner BEFORE any data: caret re-anchor + the NEGATIVE EDIT WITNESS (the field value read back UNCHANGED over the End leg); class rule: a key leg whose meaning depends on the caret must re-anchor explicitly and witness the anchor — the anchor key is part of the capability, not scaffolding |
| CRLF commit-path list (the empty-commit class): the freeze's path file was written by python text-mode stdout on this Windows host → CRLF line endings → every path reached treecommit with a trailing `\r` → `os.path.isfile` failed for ALL → treecommit built the parent tree unchanged and reported success (commits `774610da`, `a766984c` are EMPTY; `7b82763d` carried claims.json only — all three disclosed in the carrier's message) | the post-commit LANDING CHECK (`git diff-tree --name-status -r <rev>` after every treecommit — the same check criterion 109 now mandates for cited receipts) — caught before any data run, the full carrier landed at `db6f4225` with all digests == claims.json's pins | path lists written with `newline='\n'` (byte-level verification with `grep -c $'\r'` before use); class rule: on this host, every treecommit is verified with diff-tree before it is used or cited, and path files are LF-verified |
| the v14 meter's header comment named "tabi round 53" while v14 is the round-54 generation (the D2 name-leftover class, comment-only — no schema string, sentence token or output field involved) | this round's generation-diff review (the r52/r54 corrupted-quotation review discipline applied to the meter bump BEFORE the freeze) | fixed in v15 (the header names round 55, `controls/c1-token-check-r55.txt` measures all four v15 tokens + the disclosed v14 leftover); v14's bytes NEVER edited — the generation is retired at its own bytes |
| the frozen cross-refusal expectation was first WRITTEN WRONG in the C2 predicate draft (promised `control-end-witness` where the counter's check flow on a control-domain-ABSENT receipt yields `control-domain-missing` + `keylog-length` — the `else` block containing the witness checks never runs) | deriving the expected finding set from the counter's actual check flow BEFORE the freeze (the claims.json edit was made pre-data; the frozen predicate carries the corrected expectation, and the measured cross-refusal matched it exactly: 7 findings) | class rule: a frozen expected-findings enumeration must be derived by walking the counter's check flow, not by restating the claim text |

## Census

Start (2026-11-02, round open): `bash <fleet>/scripts/sources-census.sh validate --root
<fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04 duplicate-URL warnings (the same set
disclosed r47-r54); receipt `.ufo/waves/round-55/measure/census-start.txt` (committed at the
freeze). End (round close): same command → exit 0 (receipt
`.ufo/waves/round-55/measure/census-end.txt`), W04 set unchanged at 22, registry 161 rows
(S162's duplicate draft dropped before landing; S083 re-opened in place instead).
`node scripts/check-sources.mjs` → SOURCES_GATE verdict=clean rows=161 findings=0
(`.ufo/waves/round-55/measure/check-sources-at-work.txt`).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-02). Shokuknow register
not reachable from this host. Assimilation: none — shokuknow unreachable.
