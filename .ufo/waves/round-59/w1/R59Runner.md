# R59Runner — tabi round 59, wave w1

- Seat: R59Runner (executor). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Base revision: `4e7fb89d7b71a6fdf661680891440be6577759e8`.
- Assignment: build the r59 driver generation for claims.json C2 (runner side), on
  `scripts/chrome-cdp-loopback-round58.mjs` (1903 lines, sha256
  `9935ed9862af0f5e7ff1d5400790ab9a14d6966e6f5cc713280af6108bd1d324`), never edited.
- **Final driver sha256 (the instrument-freeze pin):**
  `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86`
  (`scripts/chrome-cdp-loopback-round59.mjs`). The lane file was written ONCE from the
  tested scratch bytes; the scratch and lane shas are identical; no post-write edit.

## Outcome

- Driver generation complete: CapsLock delivery-boundary leg, routed D4 `/form2`
  positive control, extended schema, 18-name append-only step plan.
- `--path-selftest`: exit 0, `allPass true`, **24/24 cases**
  (`.ufo/waves/round-59/runner/path-selftest.json`).
- Two independent smoke runs: exit 0, `predicate true`, `failures []`, 0 survivors,
  fixture + DevTools ports closed.
- Cited probe receipt for the pre-data C2 restatement (option A):
  `.ufo/waves/round-59/runner/probe-capslock.json`, with the probe script and the
  fetched source bytes beside it.
- No live round-59 data pass was run. No commit, add, push, or other VCS mutation.
- No tool installed or upgraded (node built-ins + `curl` only; pacman untouched).

## Pre-data boundary and the ruling this generation implements

The original frozen C2 asserted a CapsLock **latch** sequence
(`getModifierState('CapsLock')` false → true → held → false). On the declared
headless loopback-CDP surface that state is unreachable:

- CDP `Input.dispatchKeyEvent` maps only modifier bits 1/2/4/8
  (Alt/Ctrl/Meta/Shift) and ignores every other bit
  (`content/browser/devtools/protocol/input_handler.cc`, `GetEventModifiers`,
  lines 92–110; fetched bytes staged as
  `.ufo/waves/round-59/runner/probe-source-input_handler.cc.txt`).
- Live probe: CapsLock keyDown+keyUp with `key`/`code` CapsLock and
  `windowsVirtualKeyCode` 20 delivers page records with the full shape
  (`type`, `key`, `code`, `keyCode 20`, `cancelable true`,
  `defaultPrevented false`), while `getModifierState('CapsLock')` reads **false on
  every event** — on the CapsLock down/up, after the press, and across the
  interleaved letters. Modifier bits 16…8192 are ignored; CapsLock events carrying
  those bits never set the caps flag.
- Detector-positive differential: the same recorder reads
  `getModifierState('Shift')` **true** on every event of a real Shift chord
  (14 Shift events + 14 uppercase letter events in the driver's own shift leg;
  4/4 in the probe). A dead recorder therefore cannot explain the all-false caps
  record.

L1 ruled option (A) pre-data (claims.json C2 + killRules.C2 +
`preDataCorrection.c2Restatement`, committed before any data run): C2 is now
`chromium-keyevent-delivery-boundary-linux`, a **measured negative** — delivered
shape on every CapsLock/letter event, `getModifierState('CapsLock')` false
throughout, **`capsLatchExpected: false` named in the receipt**, any true a
finding. This driver implements that, plus pins R1–R4 (Shift detector field
`shift`; `type` in the delivered-shape tuple; per-letter DOM read-back; no
caps-bit identifier cited as sourced).

## Declared interface (frozen in the driver)

- Schema: `tabi-chrome-cdp-r59`. Nonce: `tabi-r59-` + 12 lowercase hex
  (regenerated while the tail carries no `[a-f]`; both the chord letter and the
  CapsLock letters derive from the tail).
- Declared step list, 18 names, `receipt.steps` in this order:
  `a-start, b-typed, c-end-witness, d-backspace, e-tab, f-enter-echo, g-shift-typed,
  h-chord-domain, i-swallow-control, j-swallow-backspace, k-swallow-digit,
  l-swallow-enter, m-capslock-press1, n-capslock-letters1, o-capslock-press2,
  p-capslock-letters2, q-form2-chord, r-form2-echo`.
  `stepsExtended` is chronological: a,b,c,d,e,g,h,i,j,k,l,m,n,o,p,f,q,r
  (`f-enter-echo` physically follows the CapsLock leg because the submit
  navigates).
- CapsLock leg (on `#field3`, after the r58 swallow leg, before the submit):
  CapsLock keyDown+keyUp (no text) → two nonce-derived `[a-f]` letters, typed
  r52-style (`text = char`) → second CapsLock keyDown+keyUp → two more letters.
  Every page keydown/keyup carries `capsLock: getModifierState('CapsLock') === true`
  and `shift: getModifierState('Shift') === true`; DOM `#field3` is read back after
  every keystroke (`press1.valueAfter`, `letters1[i].valueAfter`,
  `press2.valueAfter`, `letters2[i].valueAfter`, `valueAfter`).
- Receipt CapsLock fields: top-level `capsLatchExpected: false`; top-level
  `capslockTrace {target, derivation, letters, letters1, letters2, press1, letters1,
  press2, letters2, beforePress1, afterPress1, acrossLetters1, afterPress2,
  acrossLetters2, latch:{expected, beforePress1, afterPress1, acrossLetters1,
  afterPress2, acrossLetters2, sequence (13 raw page caps values), anyTrue, allFalse},
  capsLatchOk, trace[]}`; `journey.form.capsLockLeg` mirrors the detailed leg with
  every read-back and `capsLatchOk`. Delivered-shape checks use
  `(type, key, code, keyCode, cancelable, defaultPrevented)` on every CapsLock and
  letter event.
- D4 `/form2`: same fixture shape, **no swallower**, action `/echo2`; `#field`
  prefilled with the nonce; the same Control+Enter chord (bit 2, `text '\r'`).
  On this surface Ctrl+Enter submits to a **new tab**, so the client witness is
  the `/echo2` page target's own URL + DOM (disclosed in the receipt as
  `journey.form2.echo2.disposition === 'new-tab'` and `clientTargetId`/
  `clientTargetUrl`; `r-form2-echo.png` is captured from that target). Exactly
  one `/echo2` request; form1's exactly-one `/echo` invariant unchanged.
- `journey.form.shiftDetector` carries the R1 differential
  (`events`, `shiftKeyEvents`, `uppercaseLetterEvents`,
  `allGetModifierStateShiftTrue`, `capsLegAllGetModifierStateShiftFalse`,
  `differential`, `ok`).
- The r58 top-level `field3Value`/`field3Final` move to
  `swallowControlPrefix + capsLetters` (e.g. `"68acfa"`), disclosed in
  `capsLockLeg.valueBefore/valueAfter` and `prefixOk`.

## Change-set mapping

- (a) CapsLock leg + recorder fields `capsLock` (and the R1 `shift` detector field)
  on both `window.__keylog` and `window.__keylogFull`, every keydown/keyup.
- (b) `FIXTURE2_HTML`, `/form2` and `/echo2` routes, a `form2Contract`, the form2
  chord/submission leg and the `/echo2` target witness.
- (c) Receipt schema additions: `fixture.form2Sha256`, `fixture.form2Contract`,
  `fixtureDelta.additiveRecorderFields` (+`capsLock`,`shift`), `capsLatchExpected`,
  `capslockTrace`, `journey.form.capsLockLeg`, `journey.form.shiftDetector`,
  `journey.form2`, `echo2Witness`, extended `legOrder`; `declaredStepNames` and
  `steps` are the 18-name declared list.
- Pins R1–R4 applied; no `kCapsLockOn`/`1<<9` identifier appears in the driver.

## Artifacts (sha256, lane-relative paths)

| Artifact | sha256 |
|---|---|
| `scripts/chrome-cdp-loopback-round59.mjs` | `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86` |
| `.ufo/waves/round-59/runner/path-selftest.json` | `511286a41dcf4a0f729cfa03475cef3af4ff626489fcba48564192044493bac5` |
| `.ufo/waves/round-59/runner/smoke1/receipt.json` | `88c5d01aa37a65c200e5516dab0dca5278af57360d30dd92634e425db7b9b4bf` |
| `.ufo/waves/round-59/runner/smoke2/receipt.json` | `5266cebaf3657d42dc5822b23c71b10f9bb749ed113aa3375a0a37f9c3a7eaad` |
| `.ufo/waves/round-59/runner/probe-capslock.json` | `bec7ec8d2ab7b460c5495e8cfe4feb8cf71dfe825f26dd1751eefd1c5132ea98` |
| `.ufo/waves/round-59/runner/probe-capslock.mjs` | `7e3c1d7c5ec21c96008b0b97d7e481d6dcee068c255664c636368462d78c1a38` |
| `.ufo/waves/round-59/runner/probe-source-input_handler.cc.txt` | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` |
| `.ufo/waves/round-59/runner/probe-src.meta.json` | `6f0cf4269a127d21b51b820fde598f812ad09e408aa9cd4a443a9d2151f475dd` |

Each smoke directory also holds the 18 declared PNGs; each receipt's
`steps[]`/`stepsExtended[]` carries every PNG's sha256 and byte count. The probe
receipt carries all case records, the 14-bit sweep, the CapsLock-with-bit sweep,
the analysis verdicts, and the source-ground metadata.

Source-ground fetch (R57-S3 guard, cited by the probe receipt):
URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT`,
final host `chromium.googlesource.com`, `num_redirects 0`, download bytes
`119284`, decoded bytes `89463`, sha256
`72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`, lines
92–110. It is staged under my own wave dir (`runner/`) because `sources/` is
another seat's write scope; the L1 can copy it to `sources/` at integration.

## Commands and outcomes

1. `node --check scripts/chrome-cdp-loopback-round59.mjs` → OK (exit 0).
2. `node scripts/chrome-cdp-loopback-round59.mjs --path-selftest` → exit 0,
   `allPass true`, cases 24, pass 24; output saved as `runner/path-selftest.json`.
   The selftest pins the 18-name list (`SHOT_NAMES.length === 12`,
   `ALL_PNG_NAMES.length === 18`), the CapsLock subject derivation/cycling, the
   measured-negative boundary predicate, the form2 contract (no swallower,
   `/echo2`, caps + shift recorder fields), and the recorder-field absence
   refusals.
3. Smoke 1:
   `node scripts/chrome-cdp-loopback-round59.mjs --scratch /fast/scratch/hyaku/tabi-r59/R59Runner/smoke1 --out .ufo/waves/round-59/runner/smoke1/receipt.json`
   → exit 0, `predicate true`, `failures []`, nonce
   `tabi-r59-641635bb8984`, `steps` 18, `declaredStepNames` 18,
   `capsLockLeg.capsLatchOk true`, `capsLatchExpected false`,
   `shiftDetector.ok true` (28 events, 14 Shift + 14 uppercase, all `shift:true`;
   caps leg 12 events all `capsLock:false`), `/echo` exactly 1, `/echo2`
   exactly 1, teardown 0 survivors, both ports `closed`.
4. Smoke 2 (independent run, same final bytes):
   `... --scratch /fast/scratch/hyaku/tabi-r59/R59Runner/smoke2 --out .ufo/waves/round-59/runner/smoke2/receipt.json`
   → exit 0, `predicate true`, `failures []`, nonce `tabi-r59-4836161cd251`,
   same witness counts, `/echo` 1, `/echo2` 1, teardown 0 survivors, both ports
   `closed`.
5. Cited probe:
   `node .ufo/waves/round-59/runner/probe-capslock.mjs --scratch /fast/scratch/hyaku/tabi-r59/R59Runner/probe-final --out .ufo/waves/round-59/runner/probe-capslock.json --source-meta .ufo/waves/round-59/runner/probe-src.meta.json`
   → exit 0, `boundaryMeasured true`: 26 CapsLock events all delivered with the
   shape, `capsFlagAnyTrue false`, `shiftDetectorPositive true` (4/4),
   `bitMappingOk true` (bits 1/2/4/8 map to Alt/Ctrl/Meta/Shift; 16…8192 ignored),
   `capsBitNoLatch true`, teardown 0 survivors, DevTools port closed.
6. `sha256sum` over the driver and every artifact above; the smoke receipts'
   `driverSha256` equals the lane driver sha `b16ddb…` (verified).

## Teardown proof (both smokes and the probe)

- Launch key: throwaway profile `profile-<token>` plus throwaway `HOME`/
  `XDG_CONFIG_HOME` under `--scratch`, `--disable-extensions`, headless new.
- Pre-launch sweep 0; mid-run sweep 13 (the key binds the launch); post-kill
  sweep 0 survivors; fixture and DevTools ports `closed`.
- The form2 submission's new tab is the same browser process/profile; the keyed
  group kill and token sweep remove it too.

## Evidence boundaries / risks

- The CapsLock result is the **measured negative** the amended C2 asks for. The
  receipt names the expectation (`capsLatchExpected: false`) and never emits a
  true caps flag; a true anywhere would fail the driver's own `capsLock` witness.
- `capslockTrace.latch.sequence` is 13 raw page values in event order
  (pre-press + 2×CapsLock down/up + 4 letter down/up); `allFalse true`,
  `anyTrue false`. The structured checkpoints (`beforePress1`, `afterPress1`,
  `acrossLetters1`, `afterPress2`, `acrossLetters2`) are separate keys.
- Ctrl+Enter submits `/form2` in a **new tab** on this surface; the receipt
  discloses the disposition and target, and the client-side witness is the
  `/echo2` target's DOM/URL. This is a property of the chord, not of the
  driver's assumption; the server-side one-request witness is independent.
- No live data pass, no commit, no push. The driver is frozen at
  `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86`.
