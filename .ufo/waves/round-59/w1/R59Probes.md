# R59Probes — probe receipts for the round-59 corrections of record (D3/D6/D9)

Seat: R59Probes (leaf executor, round 59 wave w1, lane tabi-shokunin)
Lane base revision: 4e7fb89d7b71a6fdf661680891440be6577759e8
Claims read first: `.ufo/waves/round-59/claims.json` (sha256 6f40ff47c06016469d78fd7c167e50c83e7c55a4b35ed0173ee75cb37d3a266a at read time; the L1 amended it
pre-data mid-wave with a `preDataCorrection` field — C1 counts now {roster 20, mapRows 16, auditRows 16,
deltaLanes 20, bgScreenSiblings 20}. None of my five probes depends on those counts; recorded here so the
citation is not stale.)
Host: linux x64, node v24.21.0. No browser launched. No network fetch performed. No tool installed.

## Outcome

All five assigned probes ran. Four produced the evidence the item asked for; one carries an honest
finding (CapsLock has no dfn in the cited source) and one measured caveat about the routed D1 rule.

| # | Probe | Artifact | Verdict |
|---|-------|----------|---------|
| 1 | D9 red-before (defaultPrevented in S161) | `probes/d9-red-before-defaultprevented.txt` | **RED** — no definition site, only cross-reference anchors |
| 2 | D9 green (getModifierState, CapsLock / key, windowsVirtualKeyCode) | `probes/d9-green-capslock.txt` | **GREEN** for 3 of 4 terms; CapsLock = finding (no dfn, four local loci) |
| 3 | D3 absent-receipt shape | `probes/d3-absent-receipt-shape.json` | exit 1, `findings [receipt-missing]`, `couldNotEvaluate [{receipt-load, receipt-absent}]`, verbatim |
| 4 | D6 six swallow-block entries + page-side existence match | `probes/d6-six-entries.json` | 6/6 existence matches; multiplicity caveat measured |
| 5 | Instrument syntax gate | `probes/node-check-instruments.txt` | **OK** on all four instruments (`ALL_OK: true`) |

## Artifacts (final sha256)

| Artifact | Bytes | sha256 |
|---|---|---|
| `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt` | 8168 | `168c7f09d4112fe5c523e6f016fe02bcdb3f20eb06243ae8c73ccaebafe13c6a` |
| `.ufo/waves/round-59/probes/d9-green-capslock.txt` | 32218 | `7e4c71b47ae875c1dbd0017eb90de93ec7ef67425b3cfce2486df3ab2dc453ad` |
| `.ufo/waves/round-59/probes/d3-absent-receipt-shape.json` | 3745 | `2da5f2e2ce47a0b93cf72eace98f032438a04555b97d22c7f9a83904956b48cc` |
| `.ufo/waves/round-59/probes/d6-six-entries.json` | 10876 | `e4e5d885b56943b363edb95c112553f296b1c55949ec716805ca25d4f8a660e9` |
| `.ufo/waves/round-59/probes/node-check-instruments.txt` | 819 | `3d7ecc3a9b0e44ca35bb1db2c33a0070e7171e10dd07dce8b0512c21922ae0bb` |
| `.ufo/waves/round-59/w1/R59Probes.md` (this report) | — | recorded at yield in my result |

Pre-final shas (single-write discipline; three files were corrected in place, d9-green twice, each correction disclosed — the
corrections are listed below and each pre-final sha is recorded):

- `d9-red-before-defaultprevented.txt`: pre-final `ec409b377b307e918cb289c18a8b3103b440b9bdee840ec3fbd77b9c723ba2b4`
  → final `168c7f09…` (added the VERBATIM r58 claim sentence; the sweep output was unchanged).
- `d6-six-entries.json`: pre-final `463d74879a6427266c39bd72ebf7297a78a5cdd18c1e3432894e374e32ca35e3`
  → final `e4e5d885…` (added the `maskabilityTest` block with the six measured cases; existing fields unchanged).
- `d9-green-capslock.txt`: pre-final `723c46b24b15528654576caf46085ece3309c5c40db67b84ea37c0a32322ad79`
  → `1d892e8a…` (added the sweep-executed timestamp line 21:17:02Z; every sweep line unchanged)
  → final `7e4c71b4…` (CORRECTION OF RECORD after R59Scribe + the L1 reported the unscoped raw-line
  attribution for `key`/`code`; see Probe 2 "Correction of record").

No other lane writes. I did not touch any instrument, any other seat's file, `.ufo/state/`, `corpus/`,
`MANIFEST.json`, or any VCS state.

## Probe 1 — D9 RED-BEFORE (defaultPrevented in S161)

Input: `.ufo/waves/round-58/sources/uievents.html`, 920762 B,
sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` (= registered S161 anchor).

The r58 claim's verbatim citation (`.ufo/waves/round-58/claims.json`, C2.statement offset 1846):
`S161 (W3C UI Events - the cancelable/defaultPrevented/default-action ground, re-opened this round)`.

Commands and outcomes (full transcript in the artifact):

| Command | Exit | Outcome |
|---|---|---|
| `grep -n 'id="dom-defaultprevented"\|data-dfn.*defaultprevented\|dom-event-defaultprevented' <file>` | 0 | 3 hits — all the `dom-event-defaultprevented` cross-reference form (raw 2064, 9079, 9878) |
| `grep -n 'id="dom-defaultprevented"' <file>` | 1 | no local definition id |
| `grep -n -i 'data-dfn.*defaultprevented' <file>` | 1 | no data-dfn declaration |
| `grep -n -E "(readonly )?attribute [A-Za-z]+ defaultPrevented" <file>` | 1 | no IDL member declaration |
| `grep -n '<dfn[^>]*>defaultPrevented<' <file>` | 1 | no dfn element |
| `grep -n -E 'id="[^"]*defaultprevented"' <file>` | 0 | one hit — `id="ref-for-dom-event-defaultprevented"`, a cross-reference id |
| `grep -n -i 'defaultprevented' <file>` | 0 | 4 occurrences in 920762 B: raw 2064 (link out to dom.spec.whatwg.org), 7924 (dfn PANEL entry for an external dfn), 9079 (`"external":true` dfn record), 9878 (anchor table: `"shortname":"dom","spec":"dom"`) |

Classification: every occurrence resolves to the DOM Standard. **Verdict RED** — the criterion can fail
and does fail on the r58 claim. Cross-evidence that this is not a sweep artefact: the r58 knowledge note
already states the same ("What S161 does NOT define", `corpus/knowledge/chromium-preventdefault-swallow-round-58.md`).

Reproduction: the artifact ends with a copy-paste block (read-only greps over committed bytes).

## Probe 2 — D9 GREEN (this round's terms)

Sources: `.ufo/waves/round-59/sources/uievents.html` (920762 B, `8ded5eaf…`),
`.ufo/waves/round-59/sources/browser_protocol.json` (1423170 B, `d6737c31…`), plus supplementary
`.ufo/waves/round-59/sources/input_handler.cc` (89463 B, `72cf0d1d…`).

Wait discipline (bounded): poll started 20:56:31Z; both files present 21:09:38Z and sha-stable across
checks 60 s apart; the recorded sweep executed 21:17:02Z. Drift: `cmp` of both r59 sources against the r58 staged copies
exits 0 (byte-identical), and both equal the registered anchors. **I performed no fetch**, so no R57-S3
guard fields are mine to record; the provenance is R59Scout's staging receipts (and, for S162, the L1's —
`README-S162.md` / `s162-fetch-receipt.json`, host chromium.googlesource.com, num_redirects 0, http 200).

Results (definition site found, by raw line):

| Term | Source | Result |
|---|---|---|
| `getModifierState` | S161 | **FOUND** — raw 3327 local `<dfn data-dfn-for="KeyboardEvent" data-dfn-type="method" id="dom-keyboardevent-getmodifierstate">`; IDL entry raw 3160; anchor raw 9799 `"spec":"uievents","status":"local"` |
| `CapsLock` | S161 | **NO dfn for the string** (finding, not failure). Four local loci: raw 4791 latch prose ("Other modifiers are activated depending on their state such as CapsLock"), raw 6370-6371 legacy key-code table row `CapsLock` → `20`, raw 3574 `getModifierState` parameter prose, raw 3569 `modifierCapsLock` dict-member dfn (anchor raw 9773, `"status":"local"`) |
| `key` | S153 | **FOUND** — `$.domains[Input].commands[dispatchKeyEvent].parameters[name=key]`, type string, optional; raw 14358 inside the command block starting raw 14307; 15 file-wide `"name": "key"` entries, so the structural scoping is what disambiguates |
| `windowsVirtualKeyCode` | S153 | **FOUND** — same parameter list, type integer, optional; raw 14364; the name occurs exactly once file-wide |
| `GetEventModifiers` (supplementary) | S162 | defined raw 92, but **zero CapsLock occurrences** (`grep -i capslock` exit 1) — S162 grounds the Alt/Ctrl/Meta/Shift bit field only |

Anchor-table differential (the discriminator between this GREEN and the r58 RED):
`"#dom-keyboardevent-getmodifierstate"` → `"spec":"uievents","status":"local"`;
`"#dom-eventmodifierinit-modifiercapslock"` → `"spec":"uievents","status":"local"`;
the red comparator `"https://dom.spec.whatwg.org/#dom-event-defaultprevented"` → `"spec":"dom","status":"current"`.

**Verdict: GREEN** for getModifierState/key/windowsVirtualKeyCode; CapsLock classified as a finding with
four named loci. Honest limit stated in the artifact: a definition site existing does not validate the
claim's *use* of it; the receipt answers only the criterion's question.

### Correction of record (Probe 2 artifact, after first sign-off)

R59Scribe (independently) and the L1 both reported that the receipt's `STRUCTURAL CONFIRMATION` block
attributed `"name": "key"` to raw 3053 and `"name": "code"` to raw 2702 — the FIRST FILE-WIDE hits, which
are `EventMetadata.properties` and `InspectorIssue.properties` in unrelated domains. The JSON parse in the
same block was correct (15 parameters, right names/types/descriptionHeads); the harness's line lookup was
unscoped. I verified the defect and the correct attributions myself before rewriting:

```
awk 'NR>=14307 && NR<=14460 && /"name":/ {print NR": "$0}' .ufo/waves/round-59/sources/browser_protocol.json
  14307 dispatchKeyEvent   14311 type        14322 modifiers   14328 timestamp   14334 text
  14340 unmodifiedText     14346 keyIdentifier 14352 code      14358 key        14364 windowsVirtualKeyCode
  14370 nativeVirtualKeyCode 14376 autoRepeat 14382 isKeypad   14388 isSystemKey 14394 location
  14400 commands           (14458 dispatchMouseEvent = block end 14457)
```

Independent spot checks of the description lines: 14323 (modifiers), 14335 (text), 14353 (code), 14359
(key), 14365 (windowsVirtualKeyCode) — all confirmed by `sed -n '<n>p'` on the staged bytes, matching
R59Scribe's byte-exact quote verification (`.ufo/waves/round-59/scribe/gate-quote-verification.json`).

The artifact now lists the dispatchKeyEvent-SCOPED lines (14322/14334/14352/14358/14364 with their
description lines) and carries the correction inline. Also folded in, at R59Scribe's suggestion: the
dfn at raw 3569 defines `modifierCapsLock` (the EventModifierInit initializer flag) — a DIFFERENT term
from the latch — so no reader takes "CapsLock has a local dfn" to mean "S161 defines the latch".
The D1 maskability measurement already present in Probe 4 was left as written (no change needed).

## Probe 3 — D3 absent-receipt shape

Command (different absent path than the round-open control, per the item):

```
node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs \
  /fast/scratch/hyaku/tabi-r59/R59Probes/absent-d3/subdir/receipt.json \
  --driver scripts/chrome-cdp-loopback-round58.mjs --json
```

Exit **1**; stderr empty; stdout 861 B, sha256 `dc3a177f62ed5bd0f382deface8fe968619f732ba2428146db33d91a30fdc1fa`.
Emitted (verbatim, also embedded in the artifact):

```json
{ "schema": "tabi-chromium-receipt-r58",
  "receipt": "/fast/scratch/hyaku/tabi-r59/R59Probes/absent-d3/subdir/receipt.json",
  "driver": "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round58.mjs",
  "shotDir": "/fast/scratch/hyaku/tabi-r59/R59Probes/absent-d3/subdir",
  "nonce": null, "predicate": false, "findingCount": 1,
  "findings": [ { "id": "receipt-missing", "detail": "…/receipt.json", "occurrences": 1 } ],
  "couldNotEvaluate": [ { "check": "receipt-load", "code": "receipt-absent",
                          "detail": "no receipt bytes at …/receipt.json" } ] }
```

Shape comparison to `.ufo/waves/round-59/controls/c2-counter-absent-receipt.json`
(sha256 `9d1548969324d2101c9ea75ff875e77751f8245277775c8606b6fd53407a11ac`): identical key set
(`schema,receipt,driver,shotDir,nonce,predicate,findingCount,findings,couldNotEvaluate`), identical
finding id and identical `{check, code}` pair — only the paths differ. So the absent-receipt refusal
carries a NON-EMPTY `couldNotEvaluate`; the r58 spotcheck's `couldNotEvaluate []` is the D3 divergence
the round-59 lesson records.

## Probe 4 — D6 six swallow-block entries

Input: `corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json`, 70689 B,
sha256 `1d0c1389bb0589e76ad9edb08d28d6dd02c559f3d8b74b0af62e1e456ba0b691`.

The six entries (jq paths; `key`, `cancelable`, `defaultPrevented` — full fields in the artifact):

| Entry | jq path | key | cancelable | defaultPrevented | keylog window |
|---|---|---|---|---|---|
| control digit 7 | `.journey.form.swallowLeg.control.keylog[0]` | `7` | true | false | 126→130 |
| control digit 5 | `.journey.form.swallowLeg.control.keylog[1]` | `5` | true | false | 126→130 |
| Backspace | `.journey.form.swallowLeg.backspaceSwallow.keylogEntry` | `Backspace` | true | **true** | 130→132 |
| b | `.journey.form.swallowLeg.digitSwallow.keylogEntry` | `b` | true | **true** | 132→134 |
| Control | `.journey.form.swallowLeg.enterChordSwallow.ctrlKeylogEntry` | `Control` | true | false | — |
| Enter | `.journey.form.swallowLeg.enterChordSwallow.enterKeylogEntry` | `Enter` | true | **true** | — |

Page-side match: **existence by value, not positional** over `journey.form.pageKeylog` (138 entries,
69 keydowns, `keylogMatchesPlan: true`). Result: **6/6 matched, 0 missing**. Match counts (which is where
the honesty is): `7` → 6 matches, `5` → 14, `Backspace` → 1 (index 130), `b` → 1 (132), `Control` → 4,
`Enter` → 1 (135). Only the three swallowed entries carry a unique `(key,cancelable,defaultPrevented)`
triple, because their keyUp twins carry `defaultPrevented:false`; the page keylog interleaves
keyDown/keyUp pairs, so a positional matcher sits one off-by-pair from a silent pass.

Sentinel evidence: `.ufo/waves/round-58/sentinel/evidence/page-vs-recorded-attack.json` exists, parses
(1059 B, sha256 `2419d1476cd8b24dc22f3bd89d6cbf313853d3e57d86f0f5d689de089ce77342`), `predicate:false`,
`findingCount:1`; its F1 leg
(page keylog forged to say the swallowed Backspace was NOT prevented) exited 0 with predicate **true**,
which is the live proof the r58 counter read the recorded block, not the page — the routed D1 defect.

Measured caveat (`maskabilityTest`, 6 cases, in-memory clones only): the D1 rule as specified
(existence-by-value of the triple per block entry) goes **RED** on a forged swallow
(`pageKeylog[130]` Backspace, `pageKeylog[135]` Enter) but stays **GREEN** on a forged non-unique control
entry (`pageKeylog[126]` digit 7, `pageKeylog[12]` digit 5, `pageKeylog[134]` Control) because an
equal-valued twin survives. The check protects exactly the entries the claim's witness rests on and
cannot by itself assert the control entries' flags; a per-window occurrence count or a keyDown-only match
would be strictly stronger. Routed to R59Counter/R59Critic via the L1, not smoothed here.

## Probe 5 — Instrument syntax gate

Poll discipline: the four instruments were not all present when my wave started; bounded polls
(30 s steps, sha-stable across a 60 s gap) ran at 20:56Z and 21:17Z. `rebind-r59.mjs` appeared 20:58Z
(evolving 22501→22676→22917→23220 B), `c1-adjacency-host-v19.mjs` 21:09Z (49982→53384 B),
`chrome-cdp-loopback-round59.mjs` 21:11Z, `chromium-receipt-r59.mjs` 21:17:56Z. All four stable at
21:18:56Z; the gate ran 21:19:04Z.

| Instrument | sha256 at gate | Bytes | `node --check` |
|---|---|---|---|
| `scripts/chrome-cdp-loopback-round59.mjs` | `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86` | 160190 | **OK** |
| `.ufo/waves/round-59/counters/chromium-receipt-r59.mjs` | `35461bbeb9e26981941d5b597b16c8138181ebdb919c06d53dbdc44f81bf9332` | 125756 | **OK** |
| `.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` | 53384 | **OK** |
| `.ufo/waves/round-59/adj/rebind-r59.mjs` | `577fef0019362ed102e1b839c77f403ea6fd51dc81dc730311232c03367c3645` | 23220 | **OK** |

`ALL_OK: true`. Re-hashed after the gate: unchanged at those shas. A syntax pass is not a semantic pass —
it says only that the four files parse under node v24.21.0; transpile-time and runtime defects are outside
this probe.

## Full command log (every command I ran, with outcome)

| # | Command | Outcome |
|---|---|---|
| 1 | `mkdir -p /fast/scratch/hyaku/tabi-r59/R59Probes`; `ls -la .ufo/waves/round-59/`; `ls -la .ufo/waves/round-58/sources/` | scratch created; r58 sources present (uievents.html 920762 B, browser_protocol.json 1423170 B); r59 sources empty at 17:54Z |
| 2 | `git rev-parse --show-toplevel`; `git log --oneline -3` | `/home/vgpnk/Projects/shokunin/tabi-shokunin`; HEAD `dd337bb3` (round-59 claims freeze), parent `4e7fb89d` (r58 verifier spot-check) |
| 3 | `for f in <4 instruments>; do [ -f ] …` (repeated 5×) | absent at 17:54Z, 20:56Z, 21:05Z; present and stable 21:18Z |
| 4 | `grep -n -i 'defaultprevented' .ufo/waves/round-58/sources/uievents.html` | 4 occurrences (raw 2064, 7924, 9079, 9878) |
| 5 | `grep -n 'id="dom-defaultprevented"\|data-dfn.*defaultprevented\|dom-event-defaultprevented' <r58 uievents>` | exit 0, 3 cross-reference hits |
| 6 | `grep -n 'id="dom-defaultprevented"'`, `grep -n -i 'data-dfn.*defaultprevented'`, `grep -n -E "(readonly )?attribute [A-Za-z]+ defaultPrevented"`, `grep -n '<dfn[^>]*>defaultPrevented<'` | each exit 1 (no definition site) |
| 7 | `grep -n -E 'id="[^"]*defaultprevented"'` | exit 0, one `ref-for-…` cross-reference id |
| 8 | `node -e` receipt inspection (`keylog`, `journey.form` keys, `swallowLeg`) | 138-entry page keylog, 69 keydowns, `keylogMatchesPlan: true`; swallow block at indices 126..137 |
| 9 | `node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs /fast/…/absent-d3/subdir/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --json` | exit 1; `receipt-missing` + `receipt-load/receipt-absent` (Probe 3) |
| 10 | `node gen-d6.mjs` (scratch; reads the committed r58 receipt) | wrote `probes/d6-six-entries.json`; 6/6 existence, sentinel evidence parses |
| 11 | `node mask-test.mjs` (scratch; in-memory clones) | 6 cases: swallow forges RED, control forges GREEN (masked) |
| 12 | `node poll.mjs 480 30` (bounded poll) | bound reached; only rebind-r59.mjs present |
| 13 | `node poll.mjs 660 30` | sources present + stable 21:09Z; runner/meter/rebind present; counter absent |
| 14 | `node d9-green.mjs <r58 bytes>` (harness validation, twice) | 3 of 4 terms found; harness bug found and fixed (`hitCount` return); second run correct |
| 15 | `node d9-green.mjs <r59 uievents> <r59 protocol> … <r59 input_handler.cc>` | GREEN; all sweeps recorded with exit codes |
| 16 | `cmp -s <r59> <r58>` for both sources | exit 0 both — byte-identical, no drift vs the registered anchors |
| 17 | `grep -n -i 'geteventmodifiers\|capslock' .ufo/waves/round-59/sources/input_handler.cc` | `GetEventModifiers` 8 hits (defn raw 92); `capslock` 0 hits |
| 18 | `node compose-d9-green.mjs` (scratch) | wrote `probes/d9-green-capslock.txt` (30188 B / 290 lines at that write; the current file is 32218 B / 312 lines after the two disclosed corrections) |
| 19 | `node poll.mjs 900 30` | ALL READY at 21:18:56Z (sources + instruments stable) |
| 20 | `node node-check.mjs <lane path>` | 4× `OK`, `ALL_OK: true` |
| 21 | `node -e 'JSON.parse(...)'` on both JSON artifacts; `sha256sum` on all artifacts | both parse; hashes recorded above |
| 22 | `git status --porcelain` | only untracked wave dirs incl. `probes/`; I made no tracked-file change and no VCS mutation |
| 23 | `sha256sum` re-hash of the four instruments after the gate | unchanged at the gated shas |
| 24 | `awk \x27NR>=14307 && NR<=14460 && /"name":/ {print NR": "$0}\x27 .ufo/waves/round-59/sources/browser_protocol.json` | 15 dispatchKeyEvent parameters in order (14311 type … 14400 commands); block ends 14457 |
| 25 | `sed -n '<n>p'` for n in 14322/14323/14334/14335/14352/14353/14358/14359/14364/14365 | confirmed the scoped parameter and description lines (correction verification) |
| 26 | `grep -n '"name": "key"\x27` / `"name": "code"` (first hits) | 3053 / 2702 — reproduces the reported defect (first file-wide hit, unrelated domains) |

Scratch-only helpers (deleted with the scratch tree, never citable): `poll.mjs`, `gen-d6.mjs`,
`d9-green.mjs`, `compose-d9-green.mjs`, `node-check.mjs`, `mask-test.mjs`, `d9-green-r59.{json,txt}`,
`d9-green-r58bytes.{json,txt}`, `d3-raw.json`, `d3-raw.err`, `mask-test.json`, `absent-d3/`.
Their every output that matters is inside the five lane artifacts, and every command in those artifacts
is a plain `grep`/`node` line that can be re-run from the lane checkout.

## Findings worth routing (not smoothed)

1. **CapsLock has no dfn in S161** and **zero occurrences in S162**. The claim's CapsLock ground is
   carried by prose (raw 4791), a legacy key-code table row (raw 6370-6371: `CapsLock` → `20`), the
   `getModifierState` parameter prose (raw 3574) and the `modifierCapsLock` dfn (raw 3569). Anyone
   reading S162 (`input_handler.cc`) as the CapsLock ground would be wrong: it grounds only the
   Alt/Ctrl/Meta/Shift bit field.
2. **The D1 existence-by-value rule is maskable on non-unique control entries** (measured, Probe 4).
   It is not a defect in the r59 counter — it is a limit of the check as worded in C2, and the swallow
   entries (the ones the latch/swallow witness rests on) are exactly the unique ones.
3. **D3**: the absent-receipt refusal carries `couldNotEvaluate [{check:"receipt-load", code:"receipt-absent"}]`
   — non-empty, re-derived on an independent absent path.
4. **D6**: the six-entry page match is 6/6 by existence and 0 by position-sensitivity; the multiplicity
   table above is what makes the "not positional" correction auditable.

## Environment / state evidence

- Sources at sweep time: `uievents.html` 920762 B `8ded5eaf…`; `browser_protocol.json` 1423170 B
  `d6737c31…`; `input_handler.cc` 89463 B `72cf0d1d…` (all three = their staging receipts / registered anchors).
- Instruments at gate time: see Probe 5 table; re-hashed unchanged afterwards.
- Frozen claims file at read time: `6f40ff47c06016469d78fd7c167e50c83e7c55a4b35ed0173ee75cb37d3a266a`
  (includes the L1's `preDataCorrection`).
- No browser process was started, so the throwaway HOME/XDG + `--disable-extensions` constraint was not
  exercised by me.
- No network access was used; no credential, token or session material was read (none appears in any
  artifact).

## Limits and blockers

- My node-check is a point-in-time syntax gate over the shas listed; if an author edits an instrument
  after 21:19:04Z the receipt no longer covers the new bytes (the L1's freeze commit is the authority).
- The D9 green receipt proves definition-site presence, not claim correctness; the D9 red receipt proves
  absence in the cited bytes, not that the r58 claim was false in substance.
- The maskability test emulates the D1 rule; it does not exercise the r59 counter's actual implementation
  (the committed r59 receipt does not exist until the L1's live data pass).
- Blockers: none.
