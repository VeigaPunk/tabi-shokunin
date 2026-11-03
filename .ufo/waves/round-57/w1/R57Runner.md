# R57Runner — the r57 Chromium-class modifier-chord runner (C2 instrument)

Seat: executor. Owned path: `scripts/chrome-cdp-loopback-round57.mjs` (new file; the frozen r56 bytes
`scripts/chrome-cdp-loopback-round56.mjs` were never edited). Nothing committed (seat rule); the L1
commits at the FREEZE commit. **No live data run was made: nothing was written under `corpus/`.**

## Files changed

| path | state | sha256 |
|---|---|---|
| `scripts/chrome-cdp-loopback-round57.mjs` | new (1355 lines) | `ba5ba927d03f5d01406860ff8a0ec44164491b91ea6862bc65d141c9ee98f6ad` |
| `.ufo/waves/round-57/w1/R57Runner.md` | new (this report) | — |
| `.ufo/waves/round-57/w1/R57Runner/{smoke/,smoke-stdout.json,smoke-counter.json,path-selftest.json}` | smoke evidence copies | see below |

`scripts/chrome-cdp-loopback-round56.mjs` is byte-unchanged (`sha256 26da87bbfcc2eb7034f6815fd48430ce6bd8a12bf5ba21ae766950a840893b7d`).

## Behaviour (everything r56 kept, plus the modifier domain)

Process/perimeter discipline is r56's, carried unchanged: loopback-only CDP
(`--remote-debugging-address=127.0.0.1`, ephemeral `--remote-debugging-port=0`, port discovered from
the throwaway profile's `DevToolsActivePort`), throwaway `--user-data-dir` under `--scratch`,
throwaway `HOME`/`XDG_CONFIG_HOME` under the scratch, `--disable-extensions`, real write probe before
spawn, default-Chromium-profile refusal (direct and via `realpath`), keyed `/proc` sweep on the launch
token + profile path + crash-db path, `pkill -f` never used, group kill `kill(-pid)`, argv recorded
SHAPE-ONLY (`/home/<user>` → `__USER_HOME__`), zero npm deps (node built-in `WebSocket`).

Legs, one run, in physical order (`receipt.legOrder` records the order explicitly):

1. **plain trace** (r56, unchanged) — click `#field`, one `Input.dispatchKeyEvent` keyDown+keyUp per
   nonce character, `#field.value` read back after EVERY keystroke.
2. **End** (VK 35) — negative-edit witness (`valueBefore === nonce === valueAfter`).
3. **Backspace** (VK 8) — residue `nonce.slice(0,-1)`.
4. **restore** — exact re-type, value `=== nonce`.
5. **Tab** (VK 9) — `activeElement` `field` → `field2`.
   The page's own **r56 keydown recorder** slice is read here: exactly the four control keydowns
   (`End, Backspace, <restored char>, Tab`), `window [start,end)` span 4 — r56 semantics unchanged.
6. **Shift-chord trace (new)** — the nonce UPPERCASED into `#field2`; each uppercase letter's
   keyDown/keyUp is **bracketed** by a real `Shift` keyDown/keyUp (`code ShiftLeft`, vk 16, modifiers
   8), the letter event carries `modifiers: 8` and the shifted key/text (`unmodifiedText` = lowercase);
   digits and `-` type with `modifiers: 0`. **Both** fields' DOM values are read after EVERY keystroke:
   `#field` must still hold the nonce, `#field2` must hold the uppercased prefix.
7. **chord leg (new)** — click `#field3` (the never-submitted, name-less field); for each of
   Control (bit 2) / Alt (1) / Meta (4): modifier keyDown → letter keyDown **with no `text` param** →
   letter keyUp → modifier keyUp (12 events), on the nonce-derived letter (first `[a-f]` of the nonce
   hex tail). `#field3.value` read after every chord and at the end (EMPTY).
8. **Enter (VK 13) from a re-focused `#field2`** — ONE keyDown with `text: '\r'`, the form's implicit
   submission; exactly ONE `/echo` request carrying `field=<nonce>` and `field2=<UPPERCASED nonce>`;
   `field3` absent from the query; echo page renders both values and reports `field3 absent`.

Fixture (loopback, `127.0.0.1`, ephemeral port): `#field` (name `field`), `#field2` (name `field2`),
`#field3` (**no** `name` attribute), the inline `window.__keylog` keydown recorder, `#nonce` marker on
the form and echo pages, the GET `/echo` page and the server request log.

Receipt: r56 top-level keys in r56 order, plus `field3Value`, **`field3Final`** (empty), `legOrder`,
`fixture.contract`/`fixture.fields`/`fixture.field3NameAttribute`, `journey.form.{shiftTrace,chordLeg,
pageKeylog,echoPage,field3NameAttribute,rideSection,keylogMatchesPlan,...}`, `stepsExtended`
(chronological 8-step evidence log; `steps` keeps the frozen r56 six in r56 order) and
`teardown.portProbes`.

### Fixture delta vs r56 (disclosed, minimal)

The r56 fixture **already carried** `#field`, `#field2`, `#field3` (name-less) and the keydown-only
`window.__keylog` recorder; only what the new legs need was added:

1. `windowsVirtualKeyCode: e.keyCode` on every `__keylog` entry. The DOM has **no**
   `windowsVirtualKeyCode` property; `KeyboardEvent.keyCode` *is* the Windows virtual key code value,
   so the alias is recorded from the DOM number, never inferred. r56's field names/values and the
   4-entry window are otherwise untouched.
2. A **separate** full recorder `window.__keylogFull`: keydown **and** keyup, each entry
   `{type, key, code, keyCode, modifiers, ctrlKey, altKey, metaKey, shiftKey, targetId}` where
   `type` is `keyDown|keyUp` and `modifiers` is the S153 mirror computed from the DOM booleans
   (`alt1|ctrl2|meta4|shift8`). This is the `journey.form.pageKeylog` source; the r56 recorder stays
   keydown-only and unchanged in semantics.
3. `#nonce` marker on the form page and the echo page (the invocation binding rides the data page).
4. Echo page `#field3param` = `present|absent` (server-side witness that `#field3` cannot ride).
5. Titles `tabi-r57 …`; the served fixture bytes are checked by the shared `fixtureContract()` **before
   any browser exists** (exit 2 with the diagnosis if the fixture cannot witness the legs).

Nonce: `tabi-r57-<12 hex>`, **regenerated (bounded, 1000 tries) while the 12-hex tail carries no
`[a-f]`**, because the chord letter is underivable there and the frozen counter refuses with
`chord-char-mismatch` (matches the counter's rule).

## Pre-freeze amendments (disclosed)

**(a) R57Critic item 3 — leg order + field2 witness (adopted).** The Enter implicit-submission leg is
**physically last**: the frozen C2 requires ONE submission carrying both `field` (the nonce) and
`field2` (the uppercased nonce), which is structurally impossible if the r56 Enter leg runs before the
`#field2` fill. `controlDomain.enter` therefore records `serverSawField = <nonce>`,
`serverSawField2 = <UPPERCASED nonce>` plus `expectedField2`, `focusedBeforeEnter: 'field2'`,
`queryKeys: ['field','field2']`, `carriesField3: false`. The r56 control legs themselves are unchanged
in mechanism and witnesses (End / Backspace / restore / Tab); only the Enter member's position moved.
`legOrder` states the physical order; `steps` keeps the r56 six in r56 order; `stepsExtended` and
`journey.form.shots` carry the chronological evidence.
The page keylog is read **after** the chords and **before** the Enter dispatch, so the page-side
record survives the navigation (the r56 disclosure carried unchanged: Enter's own DOM record is not
witnessed; the submission is).

**(b) R57Critic item 1 — name-leftover sweep.** Every `r56` occurrence in the new file is
provenance-labelled (it names the FROZEN BASE or the inherited leg), never this file. The header says
"chrome-cdp-loopback-round57.mjs — tabi round 57". `grep -n "r56\|round 56"` returns only base
references; the r57 vocabulary (schema `tabi-chrome-cdp-r57`, nonce prefix, titles) is used everywhere
else. The r56 runner's own header is untouched.

**(c) Found by this seat's own smoke (not a critic item): teardown deadlock.** The first smoke proved
`fixtureServer.close()` **awaits keep-alive sockets** the live Chromium still holds; closing before the
kill deadlocked after the drive (all eight PNGs written, receipt never written; the orphaned browser
was cleaned by PID by the keyed profile path, never by name). Teardown now: kill the process GROUP →
sweep the keyed `/proc` needles to zero → `closeAllConnections()` → bounded (2 s) `close()` → **port
probes** (fixture port and DevTools port must refuse a connect). The WS-open await is also bounded
(20 s) instead of unbounded.

**(d) Adopted the L1's frozen counter shape verbatim**: `journey.form.shiftTrace.typing[]` with
`{i, char, key, code, windowsVirtualKeyCode, shiftRide, modifiers, valueAfter, valueAfterField, ride}`
(`ride` = `{keyDown, keyUp}` Shift records on uppercase, `null` otherwise); `chordLeg.field3TargetId`;
`journey.form.field3NameAttribute`; `fixture.field3NameAttribute`; `pageKeylog` as ONE full
keydown+keyup array.

## Evidence (measured this wave, on the final bytes)

* **Path selftest GREEN, 13/13** — `node scripts/chrome-cdp-loopback-round57.mjs --path-selftest`,
  copied at `.ufo/waves/round-57/w1/R57Runner/path-selftest.json`. Cases: the six r56 path cases
  (adjusted for the eight PNG names, r56 six still asserted in frozen order) plus
  `fixture-contract-green`, `fixture-missing-field3`, `fixture-keylog-recorder-absent`,
  `fixture-field3-named`, `shift-ride-absent-refused`, `page-shift-brackets`,
  `chord-letter-derivation`.
* **Smoke (scratch only)**: `node scripts/chrome-cdp-loopback-round57.mjs --chromium /usr/bin/chromium
  --scratch <scratch> --out <scratch>/out/receipt.json` → **exit 0, predicate true, failures []`**.
  Copied receipt: `.ufo/waves/round-57/w1/R57Runner/smoke/receipt.json`
  (nonce `tabi-r57-fc2ce844dc2f`, chord letter `f`, `Chromium 155.0.8059.84 Arch Linux`).
* **Driver sha256** (the receipt's `driverSha256`, matches the file on disk):
  `ba5ba927d03f5d01406860ff8a0ec44164491b91ea6862bc65d141c9ee98f6ad`.
* **PNG list** (all eight written next to the receipt under `dirname(--out)`):
  `a-start.png`, `b-typed.png`, `c-end-witness.png`, `d-backspace.png`, `e-tab.png`,
  `f-enter-echo.png`, `g-shift-typed.png`, `h-chord-domain.png`
  (copied at `.ufo/waves/round-57/w1/R57Runner/smoke/`; `steps` = the six r56 names, `stepsExtended` =
  the chronological eight).
* **Frozen counter scores the smoke receipt GREEN**:
  `node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs .ufo/waves/round-57/w1/R57Runner/smoke/receipt.json
  --driver scripts/chrome-cdp-loopback-round57.mjs --json` → exit 0, `predicate true`,
  `findingCount 0`, `findings []`, `couldNotEvaluate []` (`.ufo/waves/round-57/w1/R57Runner/smoke-counter.json`).
* **Chord-letter coverage**: twelve green smokes exercised the derived chord letter
  `a, b, c, d, e, f` (a=smoke6, b=smoke10/11, c=smoke5/12/13, d=smoke7/8, e=smoke4/9, f=smoke14/final);
  every one delivered all three chords with the measured S153-bit ↔ S161-boolean correspondence
  (2↔`ctrlKey`, 1↔`altKey`, 4↔`metaKey`, `shiftKey:false`), no browser accelerator swallowed the
  Control/Alt/Meta chord on this headless surface. The two earlier runs (smoke1/smoke2) are the red
  runs that exposed the teardown deadlock above, and smoke3 exposed the pageKeylog-length check
  (fixed before the final bytes).
* **Measured smoke facts** (from the copied receipt): `#field2` final `TABI-R57-FC2CE844DC2F`,
  `#field` final `tabi-r57-fc2ce844dc2f`; page keylog 60 keydowns + 60 keyups = 120 entries, keydown
  subsequence equals the plan re-derived from the nonce; `#field3` EMPTY before and after the chords;
  submission query exactly `field`,`field2`; echo page `field3 absent`; teardown
  `postKillSweepCount 0`, `survivors []`, `portProbes {fixture:'closed', devtools:'closed'}`;
  sweeps pre 0 / mid 13 / post 0.

## Risks / notes for the L1

1. **The data run must use the frozen bytes.** The receipt is bound to the driver digest; any edit to
   `scripts/chrome-cdp-loopback-round57.mjs` after the freeze commit invalidates
   `--expect-driver-sha256 ba5ba927d03f5d01406860ff8a0ec44164491b91ea6862bc65d141c9ee98f6ad`.
2. **r56 `keylog` slice semantics**: the slice is read after the Tab leg (window of the four control
   keydowns) — unchanged from r56, and the shift/chord keydowns necessarily fall outside that window.
3. **`pageKeylog` is the full keydown+keyup record**, so its raw length is 2× the keydown count
   (`pageKeylogLength` vs `pageKeylogKeydownCount` are both recorded); the frozen counter compares the
   keydown subsequence, which is what matches the derivation.
4. **All six chord letters measured green**, so a live nonce with any `[a-f]` first letter is covered.
   If a future Chromium changes accelerator handling, the per-letter evidence above is the baseline.
5. No gates, builds, linters or formatters were run beyond the runner's own `--path-selftest`, the
   scratch smokes and the frozen counter (all self-contained). No package was installed; **no pacman
   transaction was run** (pacman is paused host-wide). No npm dependency exists.
6. Scratch root `/fast/scratch/hyaku/tabi-r57/R57Runner/` was deleted after copying the receipts;
   no Chromium/helper process from this seat survives (verified: keyed `/proc` scan for the scratch
   profile paths returns empty; each run's own teardown sweep also ends at 0 survivors).
