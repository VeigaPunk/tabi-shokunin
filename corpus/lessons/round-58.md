# Round 58 lesson — tabi, 2026-11-03 (Linux host)

Baseline `051f433d` → freeze `d131223c` (claims.json, round-open controls, the v18 meter + both kills, the r58 rebind tool, the C2 runner `scripts/chrome-cdp-loopback-round58.mjs` at driver sha256 `9935ed98…`, the C2 counter at sha256 `632e62e4…`, smoke receipts; no corpus data) → C1 data `34dc6b9b` (ledgers re-bound at one fresh snapshot; green at the first attempt) → C2 live receipt + counter green at the data revision (`corpus/evidence/round58/chromium-preventdefault-swallow/`) → work commit (this block).

Axes at round start: adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9; saturation 8 / window 3; the r57 capability row `chromium-keyevent-modifier-chords-linux` (first-working 57) keeps the window RESTARTED (round 58 = position 1). Nudge inactive; the lowest-axis obligation applies, so C1 works adjacency. Fresh-start: rounds 55–57 ADMITTED, none owed.

## Gate

Re-opens (this round, fresh fetches, guard R57-S3: the final host equals the cited host; `num_redirects 0` on both):

| Source | Opened | Command | Located quote (≤25 words, byte-exact) |
|---|---|---|---|
| S161 — W3C UI Events — https://www.w3.org/TR/uievents/ — RE-OPENED (byte-identical to the registered anchor: 920,762 B, sha256 `8ded5eaf…`) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-58/sources/uievents.html https://www.w3.org/TR/uievents/` → sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`; `cmp` vs `.ufo/waves/round-57/sources/uievents.html` → identical | "Canceling the default action of a keydown event MUST NOT affect its respective keyup event" (§4.3.4 "Default actions and cancelable keyboard events", raw line 5680–5681; markup elided in the cell, byte-exact in the receipt `scout/reopen-receipt-s161.json`) |
| S161 — secondary, cross-reference only | 2026-11-03 | same fetch | `defaultPrevented` attribute item — raw line 2064 — a link to `dom.spec.whatwg.org`; NOT a definition (receipt locus `EXTERNAL`) |
| S161 — §3.5.6.1 keydown definition | 2026-11-03 | same fetch | `Cancelable` / `Yes` at raw 3751–3752 (scribe-verified byte-exact, `scribe/gate-quote-verification.json`) |
| S153 — Chrome DevTools Protocol browser_protocol.json — RE-OPENED (`@master` UNMOVED: 1,423,170 B, sha256 `d6737c31…` == the round-57 re-open digest; independently re-fetched and byte-compared by the sentinel) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-58/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" (`Input.dispatchKeyEvent` → `modifiers`, raw line 14323; 1 hit scoped, 5 file-wide) |

Receipts: `.ufo/waves/round-58/scout/reopen-receipt-s161.json`, `…-s153.json` (scout, fetch guard fields recorded); `.ufo/waves/round-58/scribe/gate-quote-verification.json` (9/9 quotes byte-exact at their named lines, `cmp` rc 0); sentinel's independent re-fetch of both (`.ufo/waves/round-58/sentinel/evidence/`) — byte-identical, no HIGH fetch finding.

**Correction of record (the frozen claim's wording).** The C2 statement cites S161 for "the cancelable/defaultPrevented/default-action ground". S161 does not define `defaultPrevented` or `preventDefault()`: they are cross-references to the DOM Standard (scribe F1; sentinel informational; scout definition_locus EXTERNAL). The knowledge note `corpus/knowledge/chromium-preventdefault-swallow-round-58.md` cites S161 only for what S161 defines (§4.3.4 cancelation semantics, §3.5.6.1 Cancelable/Yes, the cancel-stops-action sentence) and names the DOM Standard as the locus of the method and attribute. The frozen text is not edited; the wording gap is recorded here.

ADMIT — S161 re-open (byte-identical; §4.3.4 default-action cancelation; §3.5.6.1 Cancelable/Yes).
ADMIT — S153 re-open (`@master` unmoved; modifiers bit field verbatim).
ADMIT — C1 (adjacency): the v18 meter (v17 + the (a) relabel, (b) the m4b map-ref-unparseable kill, (c) the mG caseOk extraction + harness-guard) and the rebind at one fresh snapshot; green at `34dc6b9b` (see Measurements).
ADMIT — C2 (coverage, capability `chromium-keyevent-preventdefault-swallow-linux`): the live Chromium 155 receipt (nonce `tabi-r58-75b513ebbf9f`) and the frozen counter's green verdict at the data revision.
REJECT — the reading that S161 itself defines `defaultPrevented`/`preventDefault()` (quote located at line 2064 is a cross-reference; see above). Flip: a DOM Standard row, or an S161 definition anchor in a later edition.
REJECT (not admitted as a row) — the DOM Standard as a new source. Not opened this round; the claim does not need it to verify. Flip: a later round that claims the DOM-side definitions.
Assimilation: none (see below).

## Work performed — evidence pointers

- C1 meter v18 + kills (R58Meter): `.ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs` (sha256 `3afade4e…`), `counters/v17-v18-meter.diff`, `adj/v18-line-audit.txt` (104 differing lines, zero unaccounted), `adj/v18-selftest.json` 20/20, `adj/m4b-kill.json` (parseRef `/^\d+$/`→`/^\d+/`: exit 1, 19/20, failing `map-ref-unparseable`), `adj/mG-kill.json` (caseOk drops predicate/count terms: exit 1, 19/20, failing `harness-guard`).
- C1 rebind (adapted from r57 by the L1: `adj/rebind-r58.mjs`, names and PREV_DELTA → r57, imports the v18 meter): `measure/rebind-r58-receipt.json`, `adj/rebind-snapshot.json` (snapshotAt 2026-11-03T20:27:12Z; 20 roster, 16 map, 16 audit (stale 5, unchanged 10, moved 1), 16 delta lanes, 31 line rows), `measure/rebind-out/`, preflight 0 findings.
- C2 runner (R58Runner): `scripts/chrome-cdp-loopback-round58.mjs` (110,081 B, sha256 `9935ed98…`; r57 driver unmodified); path-selftest 19/19 (`runner/path-selftest.json`); two smoke runs green (`runner/smoke1`, `runner/smoke2`); live run `measure/c2-live-run1.stdout.json` (exit 0).
- C2 counter (R58Counter): `counters/chromium-receipt-r58.mjs` (sha256 `632e62e4…`), selftest 78/78 (`counters/selftest-L1.txt`), 49/49 finding-id coverage (mutant-counter's independent run).
- Live C2 receipt: `corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json` + 12 per-step PNGs (`a-start` … `l-swallow-enter`).
- Attacks: R58Reviewer (`reviewer/R58Reviewer.md`), R58Critic (`critic/R58Critic.md`), R58MutCounter (`mutant-counter/README.md`, m1–m5 all KILLED), R58Sentinel (`sentinel/`, one MEDIUM finding — see Mistakes).

## Measurements (counting commands, paste-able)

```
# C1 before (red control at round open, before any lane write; v17 meter at the baseline):
node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs --rev 051f433dd49880d652407f1c02f8a15646602bbe --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 1, predicate false, findingCount 1 (lane-screen-head-mismatch: kengaku-shokunin)   (controls/c1-meter-v17-at-round-open.json)
# C1 after (green at the data revision, first attempt, no correction cycle):
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 34dc6b9bcafa5a294ef819163b9f61a795448034 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 0, predicate true, findingCount 0, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 16}   (measure/c1-meter-green-at-data.json)
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --selftest   # → 20/20 (adj/v18-selftest.json)
# C2 before:
git ls-tree -r --name-only 051f433dd49880d652407f1c02f8a15646602bbe -- corpus/evidence/round58 | wc -l   # → 0
# C2 after (live receipt, frozen counter, driver pin):
git ls-tree -r --name-only HEAD -- corpus/evidence/round58 | wc -l   # → 13 (receipt.json + 12 per-step PNGs), at the landing commit named in the report
node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --expect-driver-sha256 9935ed9862af0f5e7ff1d5400790ab9a14d6966e6f5cc713280af6108bd1d324 --shot corpus/evidence/round58/chromium-preventdefault-swallow --json
#   → exit 0, predicate true, findings [], couldNotEvaluate []   (measure/c2-counter-green-at-data.json)
# C2 cross-refusals (committed bytes; both exit 1, schema-wrong first):
node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round57/chromium-modifier-chords/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --json   # → exit 1, 3 findings, schema-wrong first
node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json --driver scripts/chrome-cdp-loopback-round57.mjs --json   # → exit 1, 4 findings, schema-wrong first
# one-off page-vs-block check (R58-S1; not the frozen counter):
#   genuine receipt: 6 block entries with cancelable/defaultPrevented → 0 mismatches vs pageKeylog
#   forged copy (one page Backspace defaultPrevented flipped, scratch /fast/scratch/hyaku/tabi-r58/L1/forge): 1 mismatch  → the check can fail
# registry census start / end: see Census below
# check-sources: node scripts/check-sources.mjs → SOURCES_GATE verdict=clean rows=161 findings=0
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| **vacuous / guard gap (R58-S1, MEDIUM):** the frozen C2 kill rule names "a swallow witness rests on driver-side state instead of page/server state", but the counter reads the swallow witness from the driver's recorded block and checks the page keylog only for presence and keys. Sentinel forged `pageKeylog` cancelable/defaultPrevented on the genuine green receipt: counter stayed GREEN (B1, B2, B3); changing the block itself did fire (Q1). Evidence `sentinel/evidence/page-vs-recorded-attack.json`, `swallow-witness-source.json`. | the kill rule text (no check implemented it); the seat caught it, not the L1 | Disclosed, not repaired (the counter is frozen; a post-data counter change is a new claim). Measured on the committed receipt instead: page-vs-block equality holds 6/6. The fix shape is proven able to fail (forged copy: 1 mismatch). Routed to the next counter generation: compare the page keylog's cancelable/defaultPrevented against the derived plan (the sentinel's ~8-line remediation). |
| **landing: frozen claim wording overstated its source (S161 cited for defaultPrevented/preventDefault, which it does not define).** Evidence scribe F1, sentinel informational, scout receipt `definition_locus: EXTERNAL`, S161 raw 2064. | none — the freeze review checked the claim's bytes against the instruments, not the cited source's definitions | Knowledge note cites only what S161 defines; wording gap recorded above. Capture rule for next round: a claim that cites a source for a named term runs a sweep for that term's definition site (`grep -n 'id="dom-…"\|data-dfn' <staged>`) before freeze. Not yet shown able to fail as a gate (it is a process rule; the sweep ran by hand, output above). |
| **routine (the L1's own): the r57 rebind tool is generation-hardcoded** (`PREV_DELTA_REL` = r56, output names r57, v17 import). Caught by R58Meter's closing caveat, not by the L1's plan. | none — I had assumed the rebind tool was generic | Adapted to `adj/rebind-r58.mjs` (names, prev-delta → r57, v18 import), `node --check` green, executed at the data pass with preflight 0 findings. |
| **attack-found crash in the counter at an earlier snapshot (R58Reviewer A13):** `pickStr` used five times, never defined; the r58 counter exited 1 with ReferenceError and no JSON on both selftest and cross-refusal. | the seat's own selftest did not exercise the cross-refusal path until attacked | Fixed by the counter seat before the frozen bytes (`pickStr` defined at `counters/chromium-receipt-r58.mjs:689`; selftest 78/78; cross-refusals now emit JSON with `schema-wrong` first). Reviewer's counter findings were measured at sha `7ff9846f…`, not the frozen `632e62e4…`; the lesson says so. |
| **the s4 leg lacks a positive control (scribe F4; scout design gap 1):** the Ctrl+Enter chord shows defaultPrevented true and no submission, but no swallow-OFF Ctrl+Enter run shows the same chord submitting; "no submit" cannot yet be separated from "this chord never submits here". | the frozen step list (no positive control was declared) | Disclosed as a limit in the knowledge note. Routed to the next runner generation as a declared positive control (a separate form, so the single-submission invariant stays intact). |
| **the reviewer's C1 predicate-scope holes (A4 major, A5 minor):** the universal "every browser-ground hit line in a screened province has a line row" enumerates only provinces that a delta lane row names; a map-covered lane skips the screen, and stray line rows are not examined. Also surviving mutants N1 (drop of the findings term in caseOk masks a verify() regression) and N2 (malformed-suffix variants survive map-ref-unparseable). Evidence `reviewer/R58Reviewer.md` §A4/A5, §C. | the claim predicate as frozen (the screened-set wording is circular) | Named for the next meter generation (v19): a screened set derived from the map, not from the delta; a findings-mismatch row in harness-guard; malformed-suffix fixtures. Not a reason to widen v18 now. |

## Census

Start (round open): `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 161 rows, 22 pre-existing W04 duplicate-URL warnings (`controls/census-start.txt`).
End (round close): see the work commit's `measure/census-end.txt` (exit recorded there). Registry rows 161 → 161: no new row (the two re-opens extend existing rows, S153 and S161, used-by only).

## Sources & frontier — registry changes (old → new, logged per contract rule 2)

- **S153 used-by:** old = the 18-path chain (nine knowledge/lesson pairs, round-44 through round-57) ending `corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md`; new = the same chain plus `corpus/knowledge/chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md`. Status `mined`, recheck `90d`, id/tier/anchor unchanged.
- **S161 used-by:** old = `corpus/knowledge/webview2-modifier-domain-round-54.md, corpus/lessons/round-54.md, corpus/knowledge/chromium-control-keys-round-56.md, corpus/lessons/round-56.md, corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md`; new = the same plus `corpus/knowledge/chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md`. Status `mined`, recheck `on-release`.
- **New rows: 0.** Rejected or queued changes: none.
- **Knowledge notes:** 73 → 74 (`chromium-preventdefault-swallow-round-58.md`, cites S153, S161, S083).
- **Frontier advanced:** the Chromium key-event model now carries the accelerator-swallowing class (preventDefault on keydown) on the Linux surface, with the browser's own default action measured as suppressed (text edit and backspace) and the page's record measured as delivered (cancelable, defaultPrevented).
- **considerthese/:** the lane repo has no `considerthese/` directory (checked 2026-11-03). One report line says so.
- **Assimilation: none** — the register quarantine-first duty stays closed by the L0 `tabi | round-57` (the register's quote-column shift awaits campaign regeneration); shokuknow package adoption stays closed.

## Corrections of record (r57-closure carry-ins)

1. Routed defect (R57MutMeter m4b survivor) — CLOSED this round: the v18 `map-ref-unparseable` selftest case; kill receipt `adj/m4b-kill.json`.
2. Routed defect (R57Reviewer mG survivor) — CLOSED this round: the caseOk extraction + the harness-guard case; kill receipt `adj/mG-kill.json`.
3. Routed defect (R57Sentinel R57-S3, final-host re-guard) — applied for every fetch this round (scout, sentinel; all `num_redirects 0`).
4. L0 `tabi | round-57` (register regeneration) — stays OPEN; routed around; adoption stays closed.
5. Standing L0 `tabi | round-44` (L2 floor) — stays OPEN; this round's wave is a single batched dispatch of 10 seats (≥ the 8-seat floor); the planner seat is the L1 (validator rejects the planner role).
6. The r57 verifier spot-check (`corpus/lessons/round-57-verifier-spotcheck.md`): no routed defect for the corpus; its open items (SHONEN boxes awaiting an operator/non-author verifier) are unchanged.
