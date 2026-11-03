# Round 59 lesson — tabi, 2026-11-03 (Linux host)

Claims (frozen at `dd337bb3`; pre-data corrections `44752c57`, `8e740a08`, `a40822d9`, `03f64a39`, `e7cc1331`; instrument freeze `73b52e0f`):

- **C1 adjacency** (lowest owned axis, score 8): the v19 meter generation admits the lane state with the three newly screened sibling lanes (kagi, kake, kama) carrying adjudicated browser-ground line rows. **VERIFIED** (measured, green at `09b22bcd`).
- **C2 coverage** (capability acquisition `chromium-keyevent-delivery-boundary-linux`, restated pre-data from the r57 CapsLock-toggle residual): CapsLock delivers over CDP on the Linux Chromium 155 surface while the page's caps flag never sets. **KILLED by its own frozen kill rule f6** (see Mistakes 1). Not admitted.

Round verdict: **not admitted** (one claim unverified → honest stop, report and let the operator rule).

## Gate

Re-opens and new sources this round (fetch guard R57-S3: final host = cited host, `num_redirects 0`):

| Source | Opened | Located quote (byte-exact, ≤25 words) | Decision |
|---|---|---|---|
| S161 — W3C UI Events — https://www.w3.org/TR/uievents/ (re-open, byte-identical: 920,762 B, sha256 `8ded5eaf…`; receipt `.ufo/waves/round-59/scout/reopen-receipt-s161.json`) | 2026-11-03 | `getModifierState(keyArg)` — local dfn `id="dom-keyboardevent-getmodifierstate"`, raw line 3327 (definition site) | **admit** (method contract the absence witness reads) |
| S161 — same fetch | 2026-11-03 | CapsLock latch model: normative §4.3.1 prose, raw line 4791; key-code table row CapsLock→20, raw 6370–6371 | **admit as prose-grounded**, NOT as a dfn (no `<dfn>` for CapsLock; R59Probes D9 green) |
| S161 — same fetch | 2026-11-03 | `modifierCapsLock` dict-member dfn, raw 3569 (`EventModifierInit` initializer — a DIFFERENT term) | **admit as a different term**, excluded from the measured claim (listed in Limits) |
| S153 — Chrome DevTools Protocol browser_protocol.json — https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json (re-open, `@master` unmoved: 1,423,170 B, sha256 `d6737c31…`) | 2026-11-03 | `Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8` (`Input.dispatchKeyEvent` modifiers, raw 14323) | **admit** (the four-bit channel) |
| S162 — NEW — Chromium `content/browser/devtools/protocol/input_handler.cc` at tag 155.0.8059.84 — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT (staged decoded: 89,463 B, sha256 `72cf0d1d…`; transport 119,284 B, sha256 `847c531e…`; receipt `.ufo/waves/round-59/sources/s162-fetch-receipt.json`) | 2026-11-03 | `int GetEventModifiers(int modifiers,` — definition, raw line 92; the mapping is exactly four branches `if (modifiers & 1)`→kAltKey … `& 8`→kShiftKey (raw 103–110), **no CapsLock branch** | **admit for the four-bit mapping only** |
| Reject: `kCapsLockOn` = 1<<9 as a SOURCED Blink constant | 2026-11-03 | `kCapsLockOn` has 0 hits in the staged S162 bytes (case-insensitive `caps` sweep: 0) | **reject as ground this round.** Flip: stage `third_party/blink/public/web_input/web_input_event.h` as its own row (R4 / R59Scribe finding; the probe's interpretation is named in Limits) |
| Reject: S161 as the definition of `defaultPrevented` / `preventDefault()` (carried from r58) | — | no local dfn (r58 Mistakes 2; D9 red-before, `probes/d9-red-before-defaultprevented.txt`) | reject (unchanged) |

Registry: 161 → **162** (S162 new). S153 and S161 `used-by` extended old→new (see `## Sources & frontier`). No S-anchor cell was edited in place.

Spot-check (non-author discernment, LEARNING.md): **owed** — the outside closure has not run for this round. The seat reviewers (R59Reviewer, R59Critic, R59Sentinel, R59Scribe quote verification) are authors-of-attacks, not the closure. Not claimed as a discernment pass.

## Work performed — evidence pointers

- Round-open controls (before any lane write): v18 at baseline → exit 1, predicate false, 4 findings (`.ufo/waves/round-59/controls/c1-meter-v18-at-round-open.json`); r58 counter on an absent receipt → exit 1, `receipt-missing` + `couldNotEvaluate [receipt-load/receipt-absent]` (`controls/c2-counter-absent-receipt.json`); census start exit 0 (`controls/census-start.txt`).
- Claims freeze and pre-data corrections (all committed before any seat scored): `claims.json` at `dd337bb3`, `44752c57`, `8e740a08`, `a40822d9`, `03f64a39`, `e7cc1331`; every correction is disclosed in its `preDataCorrection` block.
- Wave w1 (ONE v1 wave, 13 seats; spec `.ufo/waves/round-59/w1-spec.json`, dispatch `w1-dispatch.json`, results `w1-results.json`, all 13 settled, 0 dead).
- C1 v19 meter (`.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs`, sha `0f956f86…`, selftest 38/38, see `counters/v18-v19-meter.diff` + `adj/v19-line-audit.txt`, 318 non-comment lines, 0 unaccounted; independent re-diff by R59Reviewer: 0 unaccounted outside (a)–(e) + pins).
- C1 rebind (`adj/rebind-r59.mjs`, sha `577fef00…`): one snapshot, data pass at `09b22bcd` (`measure/rebind-r59-receipt.json`, `adj/rebind-snapshot.json`); 110 adjudications: 31 carried from r58, 72 drafted (connector-confirmed), 37 kaidoku, 1 kagi (see below).
- C2 runner (`scripts/chrome-cdp-loopback-round59.mjs`, sha `b16ddb44…`, path-selftest 24/24, smokes green) — live data pass receipt `corpus/evidence/round59/chromium-capslock-boundary/receipt.json` at `69194768`, 18 PNGs, nonce `tabi-r59-f72b90a13fc0`, 18 steps, 0 teardown survivors.
- C2 counter (`.ufo/waves/round-59/counters/chromium-receipt-r59.mjs`, sha `b287cfa2…`, selftest 91/91, id coverage 58/58) — green on the live receipt.
- Probe: `runner/probe-capslock.json` (corroborating pre-data evidence for the caps-bit boundary; the probe script and its S162 source bytes are staged beside it).
- D9 probes: `probes/d9-red-before-defaultprevented.txt` (RED: only cross-reference anchors), `probes/d9-green-capslock.txt` (getModifierState dfn found; CapsLock prose-only; S162 zero CapsLock occurrences).
- D3 / D6 grounds: `probes/d3-absent-receipt-shape.json`, `probes/d6-six-entries.json`.
- Attacks: R59Reviewer (`.ufo/waves/round-59/w1/R59Reviewer.md`: A3 M1 gap fixed pre-freeze; A6 screen-scope and A9 hardening depth named as survivors; A7 URL-toggle residual carried), R59Critic (`critic/R59Critic.md`: pins P1–P3, R1–R4 applied; restated C2 SOUND), R59MutMeter (M1–M6 all KILLED, `mutant-meter/`), R59MutCounter (C1–C5, C7 KILLED; **C6 SURVIVED** — Mistakes 1), R59Sentinel (guard audit: S161/S153 MATCH, S162 guard record remediated, 0 secret hits in r59 bytes, pacman log unchanged), R59Connector (overlap scan: no sibling holds CapsLock ground; CDP overlap pre-ruled).

## Measurements (counting commands, paste-able)

```
# C1 before — v18 meter at the baseline 4e7fb89d (round open, before any lane write)
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 4e7fb89d7b71a6fdf661680891440be6577759e8 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 1, predicate false, findingCount 4 (lane-screen-head-mismatch: kasegi, kengaku, souji, tsukuroi)   (controls/c1-meter-v18-at-round-open.json)
git show 4e7fb89d7b71a6fdf661680891440be6577759e8:corpus/adjacency-host-delta-r58.tsv | grep -c 'kagi\|kake\|kama'
#   → 0   (the new surface is unheld at the baseline)

# C1 after — v19 meter at the data revision 09b22bcd
node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --rev 09b22bcdea01252d2448b3869d0381a6f72f7183 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 0, predicate true, findingCount 0, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}   (measure/c1-meter-green-at-data.json)
grep -c kagi-shokunin corpus/adjacency-host-delta-r59.tsv   # → 5
grep -c kake-shokunin corpus/adjacency-host-delta-r59.tsv   # → 66
grep -c kama-shokunin corpus/adjacency-host-delta-r59.tsv   # → 7
node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --selftest   # → allPass true, 38 cases
# delta ledger: 167 lines = 1 header + 25 lane rows + 141 line rows (grep -c '^line' → 141; grep -c '^lane' → 25)

# C2 before — evidence tree at the baseline; r58 counter on an absent receipt
git ls-tree -r --name-only 4e7fb89d7b71a6fdf661680891440be6577759e8 -- corpus/evidence/round59 | wc -l   # → 0
node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round59/nonexistent/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --json   # → exit 1, receipt-missing

# C2 after — live receipt at 69194768 + frozen counter
git ls-tree -r --name-only 69194768838d9456d24f5b0943a9aa791a03d2e2 -- corpus/evidence/round59 | wc -l   # → 19 (receipt.json + 18 PNGs)
node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 --shot corpus/evidence/round59/chromium-capslock-boundary --json
#   → exit 0, predicate true, findings [], couldNotEvaluate []   (measure/c2-counter-green-at-data.json)
node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json --driver scripts/chrome-cdp-loopback-round59.mjs --json   # → exit 1, schema-wrong first
node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --json   # → exit 1, schema-wrong first

# C2 kill rule f6 — forged-but-consistent receipts (lesson Mistakes 1; the canonical counter GREENS both)
#   A: first CapsLock keydownEntry with cancelable:false  → canonical counter: exit 0, findings []
#   B: same entry with the cancelable key deleted          → canonical counter: exit 0, findings []
#   (committed reproduction: .ufo/waves/round-59/measure/f6-probe.py; outputs in measure/f6-probe/)
#   (committed probe: `.ufo/waves/round-59/measure/f6-probe.py`; outputs `.ufo/waves/round-59/measure/f6-probe/`)
# mutation: C6 (drop the cancelable presence/value checks) → SURVIVED (91/91 still green); C1–C5, C7 KILLED
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| **1. The frozen C2 kill rule f6 is not enforced for `cancelable`.** A CapsLock keydown whose `cancelable` is `false`, or is deleted, goes GREEN on the canonical counter (probe A/B above, scratch copies of the committed receipt). The frozen rule names "a missing delivered-shape field on any CapsLock/letter event" as a kill; the counter checks presence/value for other fields only. Mutation seat C6 SURVIVED (`mutant-counter/C6-kill.json`: removing the cancelable checks leaves 91/91 green — no fixture exercises the path). The L1 first read this as a suite coverage gap; the direct probe shows the **canonical** counter also misses it. | the frozen mutation battery (C6 SURVIVED) plus the L1's own probe. Neither the selftest (91/91) nor the live green caught it: the selftest's f6 fixture removed a different field. | **C2 is killed under its frozen rule; not amended** (a post-data counter change is a new claim). Next counter generation (new claim): enforce `cancelable === true` and key presence on every CapsLock/letter trace entry, and cross-check trace entries against the page keylog by value (the Mistake-2 class). Red-before state = probes A/B above (exit 0 on forged bytes). |
| 2. The D1 page-vs-block check was maskable on non-unique control entries (R59Probes: forged dP on digit 7 / digit 5 / Control stayed GREEN). | R59Probes measurement (`probes/d6-six-entries.json`), before freeze. | Strengthened pre-freeze to positional occurrence matching (counter sha `b287cfa2`, selftest case `keylog-flag-mismatch-masked-control`; forged-fail receipt `.ufo/waves/round-59/counters/d1-forged-fail.json`). Disclosed as a pre-freeze strengthening, not a claim change. |
| 3. The counter crashed on every receipt (`add is not a function`, a 7-param function called with 6 args) and inverted the `acrossLetters` polarity; the 91-case selftest passed while the crash was live. | R59Sentinel attack (F-1, F-1b) and the counter's own selftest coverage of the call path. | Fixed pre-freeze (call site corrected; polarity read from the unambiguous fields). Lesson: a selftest must exercise the production call path, not only the leaf functions. |
| 4. The pre-data counts were mis-derived: `bgScreenSiblings` 19 (should be 20 — v18's roster excludes only tabi, 21 dirs) and `deltaLanes` 16 (should be 20). | R59Rebind pre-data message; L1 re-derivation (`measure/l1-roster-check.txt`). | Corrected pre-data in `claims.json` `preDataCorrection` (`44752c57`), disclosed; no data had scored. |
| 5. C2's first restatement sourced `kCapsLockOn = 1<<9` to S162; the staged S162 bytes contain no caps constant. | R59Scribe citation-class check against the staged bytes. | Scoped: S162 cited only for the four-bit mapping; the caps half is the measured absence + the structural no-CapsLock-bit observation; the Blink constant is an unsourced limit (`e7cc1331`). The D9 discipline applied to the freeze text itself. |
| 6. The C2 restatement's first form had no detector-positive: a constant-false recorder would have produced the same "caps false" readback as the boundary. | R59Critic R1 (pre-data). | Shift detector-positive leg added (the recorder reads `shift === true` on Shift chords; counter finding `shift-detector-negative`). |
| 7. S162 guard record deficient: `s162-guard.txt` recorded HTTP 503 / size 0 for a file of 89,463 B, and no sha256. | R59Sentinel HIGH (F-3). | Conforming receipt `sources/s162-fetch-receipt.json` written; decoded-vs-transport encoding recorded in `sources/README-S162.md`; `s162-guard.txt` kept as the failed-probe history. |
| 8. The L1 staged S162 bytes into R59Scout's declared `sources/` dir (undeclared write; sentinel LOW). | R59Sentinel write-scope audit. | Disclosed; `sources/` re-declared shared scout+L1 for S162 in the round report. The wave contract's write-scope rule was the captured-by control and the L1 was the author that broke it. |
| 9. The L1 broadcast a message on `agent://all` (the round contract forbids it). | L1 self-report. | None of the 48 peers had a round-59 action to take; no further broadcasts; all later messages addressed by id. |
| 10. A kagi `PROVINCE.md` line appeared between the draft head (`91f7752b`) and the data snapshot (`d8d1f4f`) and was unadjudicated (`kagi PROVINCE.md:89`, a `cdp-bridge` filename inside an OIDC-federation sentence). | the rebind's exit 3 (the designed guard). | Adjudicated `no-tabi-ground` at the data snapshot; re-ran the dry run to exit 0 before the data pass. |
| 11. The 37 kaidoku queue-ops hit lines were adjudicated by the L1, not by a non-author. Each is a browser-capture act on a split-declared or ruled tabi surface (`cdp-runtime-observation` ruled; `recorded-har-producer-channel` and `screenshot-pair-compare-semantics` split-declared), so the disposition is `overlap-declared`. | none — the adjudication is L1 judgment; the non-author closure has not run. | L0 question appended (`tabi | round-59 | …`) requesting a non-author ruling; mapping kept in `adj/data/kaidoku-37-ruling-map.json`. |
| 12. The meter's `(d)` screen does not enumerate the whole sibling ledger surface: 18,869 BG-word lines in sibling `.md` files outside the PROVINCE.md ∪ map-referenced screen (R59Reviewer A6). | R59Reviewer (structural, named). | Named for the next meter generation (screen scope derived from the map, or a wider enumeration). Not a v19 defect under the frozen predicate; disclosed as the limit of the new surface. |
| 13. v18's lane-only line-row keying cross-fires on multi-file lanes (118 spurious findings on the correct ledger shape). | R59Connector routing note; the v19 `(lane, relPath)` keying is pinned by `kaidoku-multi-file-keyed-green`. | Fixed in v19 with the pinning case; the M5/M6 kill receipts cover it. |

## Census

Start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 161 rows, 22 pre-existing W04 (`controls/census-start.txt`).
End: see `## Sources & frontier` (census run at the round's close).

## Sources & frontier — registry changes (old → new, logged per contract rule 2)

- **S162 NEW row** (opened 2026-11-03; status `mined`; used-by = this lesson). Registry 161 → 162.
- **S153 used-by:** old = the 18-path chain ending `corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md, corpus/knowledge/chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md`; new = the same chain plus `corpus/lessons/round-59.md`. Status `mined`, recheck `90d`, id/tier/anchor unchanged.
- **S161 used-by:** old = `…, corpus/knowledge/chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md`; new = the same chain plus `corpus/lessons/round-59.md`. Status `mined`, recheck `on-release`, id/tier/anchor unchanged.
- **Knowledge notes:** unchanged (74). No `knowledge/` entry is admitted this round: C2 was killed, and the expansion trend does not count an unadmitted note.
- **Frontier advanced:** the Chromium key-event model now has a measured CapsLock delivery/state boundary on the Linux surface (delivered-shape witnesses + the absent-caps-flag witness + a Shift detector-positive); its verdict is **not admitted** (Mistakes 1). The frontier cell for the caps-latch remains open.
- **considerthese/:** the lane repo has no `considerthese/` directory (checked 2026-11-03). **Assimilation: none** — `adoption stays CLOSED`: L0 `tabi | round-57` (register regeneration) is still open.
- **Sourced claim:** C2 rests on S162 (opened this round: fetch receipt `sources/s162-fetch-receipt.json`; located quote `int GetEventModifiers(int modifiers,` at raw 92, byte-exact in the staged bytes) and on S153/S161 re-opens.

## Corrections of record (r58 closure routed defects, D1–D10)

- **D1** (page-vs-block cross-check, R58-S1): implemented in the r59 counter (positional, `b287cfa2`); forged-fail receipt committed; not repaired in r58 (frozen).
- **D2** (synthetic-green step plan): implemented as the step-plan check; a forged-but-consistent receipt that edits its own step list is refused by the declared-list comparison (the counter embeds the runner's declared list); the forgery class that survives (byte-perfect replica) is disclosed as the residual in the frozen rule.
- **D3** (absent-receipt shape): the r58 counter on an absent receipt emits `findings [receipt-missing]` AND `couldNotEvaluate [receipt-load / receipt-absent]`. The r58 closure's "couldNotEvaluate []" was wrong; the measured shape is `.ufo/waves/round-59/probes/d3-absent-receipt-shape.json` + `controls/c2-counter-absent-receipt.json`. Corrected by this appended entry, not in place.
- **D4** (s4 positive control): **closed in the runner.** Form2 Ctrl+Enter submits in a NEW TAB on this surface (`disposition: new-tab`, `clientTargetId`/URL witnessed); exactly one `/echo2`; form1 stays exactly one `/echo`.
- **D5 / N1 / N2 / N3 / N4 / A4 / A5** (C1 meter): closed in v19 (`harness-guard` findings-mismatch cases, the integer-suffix hardening, the all-roster screen, the (lane, relPath) line keying); the kill receipts M1–M6 are all KILLED (`mutant-meter/`).
- **D6** (scratch citation `/fast/scratch/hyaku/tabi-r58/L1/forge`): corrected — the six keylog entries (control 7, control 5, Backspace, b, Control, Enter) are an existence match by value; the forged-copy check is now committed as the D1 forged-fail receipt, not a scratch path.
- **D7** (w1-results.json has no status values): honored — seat evidence cited from `w1/R59*.md` files.
- **D8** (adjacency needs a new screened surface): the three lanes are screened and adjudicated (kagi 5, kake 66, kama 7 line-row grep counts); the claim is verified on its frozen predicate. Limit (Mistakes 12): the screen is still PROVINCE.md ∪ map-referenced files.
- **D9** (definition-site sweep criterion): landed as QUALITY criterion 111 with the red-before receipt (`probes/d9-red-before-defaultprevented.txt`) and the green classification (`probes/d9-green-capslock.txt`); CapsLock is classified as prose-grounded, not dfn.
- **D10** (capability-only claim holds the axis score): recorded in SCORECARD (AXES.md keeps capabilities separate from the six scored axes).

## Limits (named, not smoothed)

- The caps-latch half of the boundary is measured on this surface only; Blink's internal `kCapsLockOn` constant is unsourced this round (Gate, Reject row).
- C2's delivery-boundary evidence is a live receipt on one host; genuineness of a byte-perfect replica is disclosed as the counter's residual and rests on the committed live pass.
- `probes/` and `runner/probe-capslock.json` are corroborating pre-data evidence; the committed live receipt is the primary ground.
- The `cancelable` gap (Mistakes 1) means the counter does not yet enforce the f6 shape it names.
- The 37 kaidoku rows are an L1 ruling pending a non-author check.
