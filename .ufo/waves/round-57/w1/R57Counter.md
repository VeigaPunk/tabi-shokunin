# R57Counter — the frozen C2 counter (chromium-receipt-r57)

Status: **delivered, green**. Counter + fixtures authored, `--selftest` 70/70 green with exact-findings
assertions for all 43 frozen ids, both cross-generation directions measured on bytes, do-nothing control
verified. No live browser run performed (the L1 owns the data pass); nothing committed.

## Files written (exclusive paths, new files)

| path | bytes | sha256 |
|---|---|---|
| `.ufo/waves/round-57/counters/chromium-receipt-r57.mjs` | 57848 | `94757af9771bb61c4877519009ff4972e0d593527b2224e979ec1d748042327a` |
| `.ufo/waves/round-57/counters/chromium-receipt-r57-fixtures/` | 2.3 MB, 153 files | 70 spec cases, 75 receipts, 14 PNGs |

Nothing else written. `git status --short` in the lane shows only `?? .ufo/waves/round-57/` (the whole
wave dir, shared by all seats) and `?? scripts/chrome-cdp-loopback-round57.mjs` (R57Runner's file, not mine).
No mutation of `scripts/`, `corpus/`, `.ufo/state/`, the fleet root or shokuknow; no git/jj mutation; no
tool installs (nothing needed; PACMAN untouched).

## What the counter is

A scoring counter for one receipt-plus-driver pair. It writes nothing but stdout, resolves paths against
cwd (the frozen C2 command uses repo-relative paths), and exits 0 only when the predicate holds:

* `node chromium-receipt-r57.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--shot <dir|pngs...>] [--json]` → 0 predicate met / 1 any finding / 2 usage;
* `--selftest` → exact-findings assertions over every fixture; `--self-check` → counter digest + fixture count.

Output schema `tabi-chromium-receipt-r57` with `predicate` / `findings[]` / `couldNotEvaluate[]`.
Dedupe is one entry per id with `occurrences` counted (the r56 contract).

### Receipt contract (r57) — the authority for R57Runner

r56 top level unchanged: `schema`, `nonce`, `driverSha256`, `host{chromium,argv,launchToken}`,
`fixture{...}`, `plainTrace.entries[]`, `controlDomain{end,backspace,restore,tab,enter}`, `keylog{entries,
length,window}`, `serverLog[]`, `field3Value`, `steps[]`, `teardown`, `predicate`.

r57 additions:

* `field3Final` — `#field3` after the whole modifier leg (empty = the negative witness).
* `journey.form.shiftTrace` — `{value, valueBeforeFirstKey, typing[], keyEventCount, fieldValueAfterTyping,
  field2ValueAfterTyping}`; each typing entry `{i, char, key, code, windowsVirtualKeyCode, shiftRide,
  modifiers, valueAfter (#field2 prefix), valueAfterField (#field read-back, always the nonce), ride}`;
  `ride` is REQUIRED on uppercase letters: `{keyDown:{key:'Shift',code:'ShiftLeft',keyCode:16,modifiers:8,
  shiftKey:true}, keyUp:{...}}`; digits/`-` carry `modifiers 0` and no ride.
* `journey.form.chordLeg` — `{derivation, hexTail, letter, letterCode, letterWindowsVirtualKeyCode,
  field3TargetId, chords[{name,bit,key,code,windowsVirtualKeyCode,domEvents[2]}], field3ValueAfter}`.
* `journey.form.field3NameAttribute` — `null` = witnessed absent (the frozen witness); a string is a finding.
* `journey.form.pageKeylog` — the full run record, ARRAY (whole run, leg order plain,control,shift,chord) or
  `{legs:[...], entries:[...]}` (declared window; must include shift+chord). Every entry
  `{type:'keyDown'|'keyUp', key, code, keyCode, modifiers, ctrlKey, altKey, metaKey, shiftKey, targetId}`;
  `modifiers` is the S153 mirror computed from the DOM booleans (alt1|ctrl2|meta4|shift8); `targetId` is the
  element the event was delivered to.

### Finding ids — 43, frozen, each guarded by at least one fixture

Carried from r56 unchanged (29): `receipt-missing`, `receipt-unparseable`, `schema-wrong` (schema string),
`nonce-shape` (`^tabi-r57-[0-9a-f]{12}$`), `nonce-not-invocation-bound` (nonce absent from server log and
typed values), `driver-sha-mismatch` (receipt vs bytes, and vs `--expect-driver-sha256`),
`driver-missing`, `profile-not-throwaway` (absolute `--user-data-dir` basenamed `profile-<token>`),
`host-browser-mismatch` (Chromium 155), `host-argv-home-leak` (no `/home/<user>/` in argv),
`plain-trace-wrong` (per-keystroke nonce prefix), `plain-trace-missing`,
`control-domain-missing`, `control-end-witness-wrong` (flag + value-unchanged),
`control-backspace-witness-wrong` (exact residue), `control-restore-witness-wrong` (exact nonce),
`control-tab-focus-wrong` (field→field2 by activeElement), `control-enter-submit-wrong` (submitted +
server-side field value), `field3-not-empty`, `keylog-missing`, `keylog-length-wrong` (implied keydown count
+ window span), `server-log-missing`, `server-log-echo-count` (exactly one `/echo`), `steps-missing`,
`png-missing`, `png-sha-mismatch`, `png-not-png`, `teardown-survivor`, `predicate-false`.

New in r57 (14):

| id | check |
|---|---|
| `shift-trace-missing` | block/entry array absent or empty, wrong length, wrong index, wrong char |
| `shift-prefix-mismatch` | per-keystroke `#field2` read-back ≠ uppercased-nonce prefix; missing/drifted `#field` read-back (both-field witness); final `#field` ≠ nonce |
| `shift-modifiers-wrong` | uppercase letter event without modifiers 8, or with the unshifted key/code/VK; ride event modifiers ≠ 8 |
| `shift-ride-missing` | no Shift keyDown/keyUp pair recorded around an uppercase letter (trace), or the page record does not BRACKET the letter pair `[Shift kd][letter kd][letter ku][Shift ku]` in order |
| `shift-unshifted-char-wrong` | a digit/`-` carrying modifiers 8, a shifted key shape, `shiftRide:true`, or a Shift ride on an unshifted char |
| `field2-final-mismatch` | `#field2` final value (or declared target) ≠ `nonce.toUpperCase()` |
| `chord-missing` | Control/Alt/Meta leg absent, chords array ≠ 3 named chords, chord modifier key identity wrong, `domEvents` not two records |
| `chord-modifiers-wrong` | a chord's recorded bit ≠ 2/1/4 (S153) |
| `keylog-absent` | `pageKeylog` absent / no entries array / declared window omits shift or chord |
| `keylog-entry-mismatch` | keydown subsequence ≠ re-derived plan (length, key/code/keyCode, booleans of non-chord entries, modifiers bit); missing `type`, missing `targetId`, missing `modifiers`, wrong `targetId` |
| `boolean-mismatch` | bit↔boolean correspondence on chord entries (2↔ctrlKey, 1↔altKey, 4↔metaKey, shiftKey false), including the page record's own modifiers mirror and the chord leg's `domEvents` echo |
| `chord-char-mismatch` | chord letter / letterCode / letterVK / hexTail ≠ the nonce-derived first `[a-f]`; or a nonce tail with no `[a-f]` (underivable) |
| `field3-named` | a recorded `#field3` name attribute is a string, OR no name-attribute witness exists at all |
| `server-field2-mismatch` | the single submission's server-side `field2` ≠ `nonce.toUpperCase()` (see amendment 1) |

`couldNotEvaluate` carries one class: `nonce-unusable` (the nonce cannot derive the shift/chord plan; the
shape checks still run). Green receipts report `[]`, as C2's `after.expected` requires.

## Pre-freeze amendments (R57Critic 1+2)

Both were ordered by the L1 mid-authoring and are folded in, disclosed here as required:

1. **Enter leg last / field2 server witness.** The r56 clause `serverSawField2 === ''` inside
   `control-enter-submit-wrong` is REPLACED by `server-field2-mismatch` with the strengthened expectation
   `serverSawField2 === nonce.toUpperCase()` (the Enter runs last, so `#field2` legitimately carries the
   uppercased nonce at submit time). `control-enter-submit-wrong` keeps `submitted` and `serverSawField`.
   This is a declared strengthening, not a relaxation: the submitted `field2` must now equal a value the
   counter derives from the nonce.
2. **Keylog entry content (closes the vacuous-witness attack).** The page record must carry `type`,
   `modifiers` and `targetId` on every entry; the keydown subsequence is compared entry by entry against
   the re-derived plan (identity, booleans, modifiers bit, targetId); every uppercase letter's keydown must
   be bracketed by a Shift keyDown/keyUp pair in order; chord keydowns must carry their bit AND the matching
   booleans AND `targetId === 'field3'` (or the receipt's declared `chordLeg.field3TargetId`). A missing
   field is itself `keylog-entry-mismatch` — no check was weakened to fit a missing field.

The r56 `keylog` block keeps its keydown-only semantics unchanged: the fixture's `window.__keylog` recorder
stays keydown-only (its 4-entry control slice and window are still checked exactly as r56 checked them);
the r57 witness is the separate full record (`window.__keylogFull` → `journey.form.pageKeylog`), which
carries both types. This split was relayed to the L1 for R57Runner.

## Exact retained evidence

Run from `.ufo/waves/round-57/counters`:

```
$ node chromium-receipt-r57.mjs --selftest
70/70                      (exit 0; idCoverage required 43, covered 43, uncovered [], stray [])
```

The selftest asserts, per case, the **exact** finding set (sorted equality), the optional exact emission
order and the optional exact couldNotEvaluate codes; it also fails on any id not exercised and any id
exercised but not frozen.

```
$ node chromium-receipt-r57.mjs /fast/.../R57Counter/absent.json --driver .../driver-stub.mjs --json
predicate false, findingCount 1, findings [{id:"receipt-missing"}], couldNotEvaluate []   (exit 1)
   — the frozen do-nothing control

$ node chromium-receipt-r57.mjs          (no args)
usage error on stderr, exit 2

$ node chromium-receipt-r57.mjs --self-check
schema tabi-chromium-receipt-r57-selfcheck, sha256 94757af9…327a, bytes 57848, fixtureCount 70, status ok
```

Cross-generation, both directions, on committed bytes:

```
# direction A — an r56-SHAPED body (no shiftTrace/chordLeg/pageKeylog) relabelled to the r57 schema
$ node chromium-receipt-r57.mjs .../receipts/crossgen-r56-shaped.receipt.json --driver .../driver-stub.mjs --json
predicate false, order = [shift-trace-missing, chord-missing, field3-named, keylog-absent]
   — shift-trace-missing FIRST, exactly as the frozen text requires

# direction A' — an ACTUAL r56 receipt (r56 schema, r56 nonce)
$ node chromium-receipt-r57.mjs .../receipts/crossgen-r56-receipt.receipt.json --driver .../driver-stub.mjs --json
[schema-wrong, nonce-shape, shift-trace-missing, chord-missing, field3-named, keylog-absent],
couldNotEvaluate [nonce-unusable]

# direction B — the r57 green receipt fed to the FROZEN r56 counter
$ node ../round-56/counters/chromium-receipt-r56.mjs .../crossgen/r57-for-r56.receipt.json --driver .../driver-stub.mjs --json
predicate false, exit 1, findings [schema-wrong, nonce-shape, control-enter-submit-wrong]
   — the r56 counter refuses the r57 receipt; its enter clause also fires because r57 submits with a
     non-empty field2 (the amendment-1 witness). r56 bytes were not edited.
```

## Fixture inventory (70 exact-findings cases)

* **Green (5):** `green-synthetic` (full-run pageKeylog array), `green-window-form` (declared window
  `[shift,chord]`), `green-extra-step` (the six r56 steps + two extra evidence steps hashed identically),
  `expect-driver-sha-agrees`, `shot-files-override-green`.
* **Pass-branch strictness (1):** `shot-files-override-sha-mismatch` (the `--shot` override never relaxes a pin).
* **r56 ids (29 cases + the authoring controls):** one per id; the two authoring do-nothing controls
  (`do-nothing-empty-object`, `do-nothing-nonce-missing`), the wrong-digest control, and the
  `--expect-driver-sha256` refusal.
* **New r57 ids (22 cases):** including two `boolean-mismatch` paths (page record and chord-leg echo),
  three `keylog-entry-mismatch` paths (key identity, missing targetId, missing type, missing modifiers
  bit), the Shift bracketing attack, the both-field read-back gap, and both `field3-named` sources
  (form record string; fixture echo).
* **Cross-generation (3):** `crossgen-r56-shaped` (with `expectOrder`), `crossgen-r56-receipt`,
  `crossgen-r57-receipt-to-r56-counter` (the committed file the L1 feeds to the r56 counter).

Receipts are compact JSON under `receipts/` (75 files) with eight synthetic 1×1 PNGs and one `notpng.bin`;
`crossgen/` carries the r57 receipt for direction B plus the six PNGs it resolves. `driver-stub.mjs`
(sha256 `01c167a907025bd3…c6ad0954`) stands in for the live driver so the digest binding is exercised
without a browser.

## Alignment with R57Runner — measured, not assumed

I diff-read `scripts/chrome-cdp-loopback-round57.mjs` while it was being authored (74333 bytes at 16:12).
Its receipt skeleton implements the contract sent to the L1: `fixture.field3Name/field3NameAttribute`,
`journey.form.{shiftTrace{...,valueAfterField,ride{keyDown,keyUp}},chordLeg{...,field3TargetId,domEvents},
field3NameAttribute,pageKeylog}` from a `window.__keylogFull` recorder (`type`/`modifiers`/`targetId`),
`field3Final`, `legOrder` ending `enter-submit`, `controlDomain.enter.serverSawField2` taken from the
`/echo` query. It also regenerates the nonce until the 12-hex tail contains `[a-f]` and keeps
`window.__keylog` keydown-only for the r56 slice. The counter does **not** read the extra keys it emits
(`legOrder`, `stepsExtended`, `fixture.contract`, `form.mechanism`, …).

Beyond the diff-read, the contract is confirmed against a LIVE-measured receipt that R57Runner produced in
its own scratch smoke (a real Chromium 155 headless run; that receipt is R57Runner's evidence, not the
frozen data evidence and not a substitute for the L1's data pass). Scored here, just now:

```
$ node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs \
    .ufo/waves/round-57/w1/R57Runner/smoke/receipt.json \
    --driver scripts/chrome-cdp-loopback-round57.mjs --json
schema tabi-chromium-receipt-r57, nonce tabi-r57-fc2ce844dc2f,
predicate true, findingCount 0, findings [], couldNotEvaluate []   (exit 0)
```

That receipt carries the full 120-entry keydown+keyup page record (60 keydowns), the Shift rides, the
three chords with bits 2/1/4, `#field3` empty before and after, and the submission carrying
`field2=TABI-R57-FC2CE844DC2F`. So the entry-content, bracketing, targetId and modifiers-mirror checks all
pass against a record produced by Chromium, not by the fixture's own re-derivation.

## Risks

1. **Live shape drift.** If R57Runner renames any key in the contract above, the live run goes red on shape
   (`shift-trace-missing`/`keylog-absent`/`keylog-entry-mismatch`) rather than silently passing. That is the
   intended failure mode.
2. **Measured model, not measured here.** The counter asserts the Shift ride's *keydown* booleans
   (`shiftKey:true`, modifiers 8) and the chord keydowns' booleans — measured in r54/r56 — and deliberately
   does NOT assert keyup booleans (the CDP dispatch passes modifiers 8 on the Shift keyup; Chromium's
   reported `shiftKey` there is unmeasured on this host). Keyups are checked structurally (type + key
   bracketing) only. Declared residual, not a hidden relaxation.
3. **Nonce with no `[a-f]` tail** is refused (`chord-char-mismatch`). The runner already redraws; a future
   runner that does not would go red here rather than silently deriving a fake letter.
4. **Declared residual carried from r44…r56:** a counter over committed bytes cannot prove a browser ran;
   the re-derivation path is re-running the committed runner (fresh nonce, fresh port) and re-hashing the
   committed PNGs. The r56 plain-trace early-stop clause is unchanged and not strengthened.

## Blockers

None. Scratch `/fast/scratch/hyaku/tabi-r57/R57Counter/` (the fixture generator and the selftest capture)
was deleted after the evidence above was taken; the committed fixtures are the artifacts of record.
