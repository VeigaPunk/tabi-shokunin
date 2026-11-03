# R60Exec2 — C2 chromium receipt counter generation (round 60, wave w1)

Authority: `.ufo/waves/round-60/claims.json` C2 (read first, in full, never amended).
Base: `.ufo/waves/round-59/counters/chromium-receipt-r59.mjs` — 2193 lines, sha256
`b287cfa21bfb9193a445c293d52aceebae99412191fd588c184c82078bee5136`, selftest 91/91.
That file was copied and is **unchanged** (sha re-read after authoring).

## FINAL PIN — `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae`

Accepted as the round-60 C2 instrument by the L1 (TabiR60) with 110/110; no further edits without
a written L1 ruling. Evidence at exactly these bytes (2582 lines, 154 463 B):

| check | result |
| --- | --- |
| `--selftest` | exit 0, `allPass:true`, **110/110**, id coverage 58/58, `uncovered: []`, `stray: []` |
| `--path-selftest` | **110/110**, exit 0 |
| `--self-check` | fixtureCount **110**, status ok |
| live receipt (item command, cwd = lane root) | exit 0, `predicate:true`, findings `[]`, `couldNotEvaluate: []` |
| frozen probes A / B / D / E | exit 1 each (`missing-delivered-shape-field` + `keylog-flag-mismatch` for A/D; `missing-delivered-shape-field` for B/E), `forgedGreen = 0` |
| R60Critic receipts P1/P2/P2b/P2c/P3/P3b/P4 | exit 1 each (`keylog-flag-mismatch` / `missing-delivered-shape-field` / `keylog-entry-mismatch`) |
| R60Reviewer P4b (letter-keyup dp deleted), P4d (letter-keyup key corrupted), P4c (caps keyup cancelable false) | exit 1; P4a (letter-keyup cancelable false) GREEN **by the claim's keyup rule**, pinned as a deliberate case |
| mutants C6/C7/C8/C9 | KILLED at the immediately prior digest `0ed93c7a`; re-measurement at `b0d03fe0` requested (no check was removed, so no kill path is lost) |
| `/tmp` scan | zero hits in the counter |

Both mid-wave closures (`0ed93c7a` = P3 control-window slice; `b0d03fe0` = page-keyup delivered
shape) are PRE-FREEZE INSTRUMENT STRENGTHENINGS ruled by the L1: the claim's predicate text is
unchanged, no frozen kill rule was touched, and no carried r59 case or expectation moved.

## Files written (all inside this seat's two paths)

| path | sha256 |
| --- | --- |
| `.ufo/waves/round-60/counters/chromium-receipt-r60.mjs` (2582 lines, 154 463 B) | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` |
| `.ufo/waves/round-60/counters/chromium-receipt-r60-fixtures/` (250 files: 110 case specs, 91 receipts + PNGs + driver stub, `live/` with 12 receipts + 18 PNGs + 1 driver copy, and the 249-entry `fixtures-sha256.txt`) | see manifest |
| `.ufo/waves/round-60/w1/R60Exec2.md` (this file) | — |

Fixtures tree = the 91 r59 case specs + their receipts/PNGs/driver stub copied byte-for-byte
(nothing under `round-59/` was written) **plus** a `live/` subdir and 19 new case specs:

- `live/corpus-live-receipt.json` — copy of `corpus/evidence/round59/chromium-capslock-boundary/receipt.json`
  (`72514ff700cab2211b6507f8e423716ffe60e02affd5161f7d704486b483a083`) + its 18 committed PNGs.
- `live/A-cancelable-false.receipt.json` — `bdd3c0ea…447d8a0`; `live/B-cancelable-missing.receipt.json` — `7793e4f8…a5566fbb`
  (= the frozen `probe-A`/`probe-B` bytes, which are byte copies of the r59 f6 probes; the
  item's pointer to the *counters'* fixture dir is superseded by the actual A/B bytes, which
  live in `.ufo/waves/round-59/measure/f6-probe/`).
- `live/chrome-cdp-loopback-round59.mjs` — byte copy of `scripts/chrome-cdp-loopback-round59.mjs`
  (`b16ddb44…52ff86`) so the live/A/B cases are self-contained and the driver pin re-derives.

## Declared change set (a)–(e): exact sites

| clause | site in `chromium-receipt-r60.mjs` |
| --- | --- |
| (a) cancelable on every CapsLock/letter delivered-shape event | `deliveredShapeProblem` (~L1056): keydown ⇒ `cancelable` must be boolean **true**; keyup ⇒ presence + boolean type (rule stated in the code comment); applied to `journey.form.capsLockLeg` (r59 path, unchanged), to the `capslockTrace` mirror via `checkCapsMirrorShape`, and to `capsLockLeg.trace[]` via `checkCapsLegTrace` |
| (b) trace-vs-keylog cancelable/defaultPrevented | `capsRunPlan`/`locateCapsRun`/`capsMirrorSlots`/`checkCapsTraceFlags` and the `trace[]` half of `checkCapsLegTrace`: the r59 D1 positional rule (last contiguous derived 12-event run: the r59 keydown tail interleaved with its keyups), fallback = distinct occurrence by (type,key); a mirror event whose own flags are not both booleans is skipped (the shape check owns it) |
| (c) `type` presence on CapsLock trace entries | `deliveredShapeProblem` for every press event (`want.type`) of both mirrors; `checkCapsLegTrace` for every `trace[]` entry |
| (d) cancelable is a JSON boolean | `typeof e.cancelable !== 'boolean'` refused in `deliveredShapeProblem` and in `checkCapsLegTrace` |
| (e) cancelable read on EVERY CapsLock event | every press slot (press1/press2, keydown+keyup, `presses[]`) and every letter slot of both mirrors; both are read, not only `press1.keydownEntry` |

Finding ids are the carried r59 ids (`missing-delivered-shape-field` = cancelable/shape class,
`keylog-flag-mismatch` = trace-vs-keylog class); the frozen 58-id list and its coverage are
unchanged. Scan schema and nonce are carried (`tabi-chrome-cdp-r59`, `^tabi-r59-…`) because the
receipt under test is an r59 receipt (K2).

### Post-freeze closure requested by R60Reviewer (same ids, no predicate change)

Three K5-class false greens the reviewer demonstrated on the 99-case bytes were closed while the
instrument was still being authored (before the L1's freeze commit; no frozen predicate or kill
rule was touched):

1. `journey.form.capsLockLeg.trace[k].capsLock === true` → `caps-flag-true` (the field is a
   recorded getModifierState read; r59 never read the `trace[]` array).
2. `press1DownCaps`/`press1UpCaps`/`press2DownCaps`/`press2UpCaps` scalar mirrors `=== true` →
   `caps-flag-true` (`checkCapsScalars`, both mirrors).
3. a mirror slot replaced by a non-object (letter item or press container) → 
   `missing-delivered-shape-field` instead of a silent skip (`capsMirrorSlots` `bad` slots).

The selftest harness gained one declarative key (`derive: [{path, set|delete}]`): it reads
`receiptPath` from disk, applies the one-key edit, and scores the object through the same
`checkReceipt`/`evaluate` path with the receipt file's own dir as `baseDir` (so D/E are built
from the live bytes, not a second free-hand copy).

## Selftest (at the frozen bytes above)

`node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs --selftest` → **exit 0**, JSON
`{allPass:true, cases:110, pass:110}`, id coverage required 58 / covered 58, `uncovered: []`,
`stray: []`. `--self-check` → fixtureCount 110. `--path-selftest` → 110/110, exit 0.

The 91 r59 cases are carried **unchanged** (same spec files, same receipts, same expected
finding sets) and pass. The 19 new cases (expected = exact set):

| case | build | expect | got |
| --- | --- | --- | --- |
| `live-receipt-green` | live bytes (path) | GREEN | `[]` |
| `probe-A-cancelable-false` | frozen A bytes (path) | shape + keylog-flag | `keylog-flag-mismatch`, `missing-delivered-shape-field` |
| `probe-B-cancelable-missing` | frozen B bytes (path) | shape | `missing-delivered-shape-field` |
| `probe-D-trace-vs-keylog` | live + `journey.form.capsLockLeg.trace.0.cancelable=false` | shape + keylog-flag | `keylog-flag-mismatch`, `missing-delivered-shape-field` |
| `probe-E-trace-type-missing` | live + delete `…trace.0.type` | shape | `missing-delivered-shape-field` |
| `cancelable-string-typed` | live + `capslockTrace.press1.keydownEntry.cancelable="true"` | shape | `missing-delivered-shape-field` |
| `cancelable-second-event-false` | live + `capslockTrace.press2.keydownEntry.cancelable=false` | shape + keylog-flag | `keylog-flag-mismatch`, `missing-delivered-shape-field` |
| `cancelable-keyup-disagrees` | live + `capslockTrace.press1.keyupEntry.cancelable=false` | keylog-flag only | `keylog-flag-mismatch` |
| `caps-leg-trace-flags-true` | live + `…capsLockLeg.trace.0.capsLock=true` | caps-flag | `caps-flag-true` |
| `caps-scalar-mirror-true` | live + `capslockTrace.press1DownCaps=true` | caps-flag | `caps-flag-true` |
| `mirror-letter-not-object` | live + `capslockTrace.letters1.0="f"` | shape | `missing-delivered-shape-field` |
| `caps-dp-missing-press1-down` | live + delete `capslockTrace.press1.keydownEntry.defaultPrevented` | shape | `missing-delivered-shape-field` |
| `caps-dp-missing-press2-up` | live + delete `…press2.keyupEntry.defaultPrevented` | shape | `missing-delivered-shape-field` |
| `caps-dp-missing-letter` | live + delete `capslockTrace.letters1.0.defaultPrevented` | shape | `missing-delivered-shape-field` |
| `p3-keylog-entries-cancelable-false` | live + `keylog.entries.0.cancelable=false` | keylog-entry | `keylog-entry-mismatch` |
| `p3b-keylog-entries-key-corrupted` | live + `keylog.entries.0.key="EndX"` | keylog-entry | `keylog-entry-mismatch` |
| `page-keyup-dp-missing` | live + delete `pageKeylog.139.defaultPrevented` (letter keyup) | shape | `missing-delivered-shape-field` |
| `page-keyup-key-corrupted` | live + `pageKeylog.139.key="fX"` (letter keyup) | shape | `missing-delivered-shape-field` |
| `page-keyup-cancelable-false-admitted` | live + `pageKeylog.139.cancelable=false` (letter keyup) | **GREEN by rule** | `[]` |

### R60Critic P2 FLAW at `99844dd9` — closed

The critic demonstrated (cr1/P2*, receipts under `.ufo/waves/round-60/w1/R60Critic/cr1/`) that
DELETING `defaultPrevented` on a CapsLock event (`press1.keydownEntry`, `press2.keyupEntry`,
`letters1[0]`) exited 0: r59 tested `defaultPrevented` only "when present", and
`checkCapsTraceFlags` judges only pairs that are both booleans, so absence was nobody's subject.
Closed by requiring `defaultPrevented` as part of the delivered shape (`deliveredShapeProblem`):
present, a JSON boolean, and the contract's `false`; three pinning cases above. At
`1408dd90` the critic's own P1/P2/P2b/P2c/P4 receipts all exit 1
(`keylog-flag-mismatch` / `missing-delivered-shape-field`).

### R60Critic P3/P3b — pre-freeze strengthening, IMPLEMENTED (narrow variant) per L1 ruling

P3 (`keylog.entries[0].cancelable=false`) and P3b (`keylog.entries[0].key` "End"->"EndX") mutate
the TOP-LEVEL r56 control-domain slice `receipt.keylog.entries` (End / Backspace / last-nonce-char
/ Tab; window [21,25)), not a CapsLock or letter event and not the page keylog a CapsLock trace
entry cites. No frozen clause binds that slice's content: the carried r56 clause binds
`keylog.length` and `keylog.window` only, and C2's (a)-(e) bind CapsLock and letter events. Both
forgeries went green at `1408dd90`; R60Critic recorded them as scope NOTE rows and ruled against
widening the round; R60Reviewer raised K5's letter (a green forged probe is a kill-class finding).
The L1 (TabiR60) ruled IN SCOPE as a pre-freeze instrument strengthening — the predicate text is
unchanged, this is the same class as the r59 D1 page-vs-block cross-check.

Implemented in the `receipt.keylog` block: identity is re-derived from the receipt's own nonce
(`derivePageKeylog(nonce, ['control'], …)`: End, Backspace, last nonce character, Tab) and, WHERE
THE SLICE RECORDS THEM, `cancelable` must be `true` and `defaultPrevented` `false`, all under the
existing `keylog-entry-mismatch` id. Absent flags are admitted.

Measured before choosing the variant (scratch only, at `1408dd90`):
- BROAD (flags required unconditionally) turned 77 of 105 carried cases red — the synthetic r59
  receipts record no flag fields in that slice — i.e. it would have broken the "91 carried
  unchanged" invariant. Refused by the L1 and not implemented.
- NARROW (this implementation) is the only variant that changes no expectation.

At `0ed93c7a` (superseded): selftest 107/107 (the two new P3/P3b cases are in the table above), live
exit 0 findings [], frozen A/B/D/E exit 1, and the critic's own P3/P3b receipts exit 1 with
`keylog-entry-mismatch` (`entries[0] cancelable false != true`; `identity {"key":"EndX",…} != the
nonce-derived control window`).

Mutant-kill reading: C6 (drop the cancelable checks) greens B and changes A's set; C7 (drop the
cross-check) greens `cancelable-keyup-disagrees` and changes A/D's set; C8 (first keydownEntry
only) greens `cancelable-second-event-false`; C9 (accept the string) greens
`cancelable-string-typed`.

### R60Reviewer's page-keyup residual — closed (the page record's delivered shape, keyup half)

R60Reviewer named it in its seat summary: "pageKeylog letter keyup entries are cited by no trace
slot, so their cancelable/defaultPrevented are unpinned." Measured at `0ed93c7a`, three of those
four forgeries were GREEN — a letter keyup with `defaultPrevented` deleted, and a letter keyup
with its `key` corrupted (`f` -> `fX`), exited 0; the CapsLock keyup was already caught by the
trace-vs-keylog check, and a letter keyup with `cancelable:false` is admitted BY THE CLAIM'S KEYUP
RULE (value unbound; presence + boolean type only).

Closed by extending the page-side delivered-shape check from the six keydowns to the whole
12-event derived run (`capsRunPlan`), compared positionally at the tail of the page record: every
entry must carry its derived (type, key, code, keyCode), cancelable per the keydown/keyup rule,
and `defaultPrevented` false. The keyup cancelable VALUE stays unbound, and that boundary is
pinned by its own GREEN case rather than left implicit. Measured at `b0d03fe0`: the two refusals
exit 1 (`missing-delivered-shape-field`), the admitted case stays GREEN, selftest 110/110, live
exit 0, and no carried expectation moved. R60Reviewer independently forged the LAST letter keyup
(page index 147) and reports at these bytes: `defaultPrevented` deleted exit 1, `key` `f`->`fX`
exit 1, `cancelable` deleted exit 1, `cancelable` `"true"` (string) exit 1, `cancelable:false`
exit 0. It records that last one as a by-design boundary for the L1 to rule under K5's letter (its
A6 row).

L1 RULING (option (a)): the keyup cancelable VALUE stays UNBOUND by design — the frozen keyup rule
is presence + boolean type — so this is a named residual LIMIT of the claim, not a kill, and no
counter edit follows. The disclosed class must be stated accurately, because a partial forgery is
misleading: R60Critic's P8 refused only because a third recording disagreed. Measured here at
`b0d03fe0`: forging `cancelable:false` on a CapsLock keyup in the `capslockTrace` mirror AND
`pageKeylog[137]` exits 1 (`keylog-flag-mismatch`, the un-forged
`journey.form.capsLockLeg.press1.keyupEntry` copy), while forging the same event consistently in
ALL THREE recordings exits 0, findings [], exactly like the letter-keyup page-only forgery. So the
limit is: **the cancelable value of ANY keyup — CapsLock or letter — is unbound, and a forgery is
refused only when some recording of that event disagrees.**

MEASURED by R60MutC2 at the FINAL bytes `b0d03fe0`: CONTROL-OK (110/110, A/B/D/E exit 1, live
exit 0) and all four KILLED, `survived: []` (receipts `.ufo/waves/round-60/w1/R60MutC2/kills.json`
+ `R60MutC2.md`): C6 `86506095…b244d1` -> 105/110, probe B green (probe A stays red with the set
shrunk to `keylog-flag-mismatch`); C7 `917d2895…16ae58e` -> 106/110, killed by the selftest alone
(`cancelable-keyup-disagrees`; probe D stays red under C7 through the shape value rule); C8
`7d716f83…c496a4a` -> 108/110, `cancelable-second-event-false` + `caps-dp-missing-press2-up`; C9
`f881ece4…7a20af` -> 109/110, `cancelable-string-typed`. Live stayed green under every mutant.
Those two deviations from the frozen "must be KILLED by probe X" wording are recorded by that seat
and by R60Exec3 as peer-reported deviations for the L1 — in both cases the probe stays RED, so the
mutant cannot produce a green forged probe; only the *isolating* fixture differs from the literal
line. Supersession chain: `5465be1f` (99 cases) -> `99844dd9` (102) -> `1408dd90` (105) ->
`0ed93c7a` (107) -> **`b0d03fe0` (110, final, accepted by the L1)**.

## Live receipt (item run 2, cwd = lane root)

```
node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round59/chromium-capslock-boundary/receipt.json \
  --driver scripts/chrome-cdp-loopback-round59.mjs \
  --expect-driver-sha256 b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 \
  --shot corpus/evidence/round59/chromium-capslock-boundary --json
```

→ **exit 0**, `predicate:true`, `findingCount:0`, `findings:[]`, `couldNotEvaluate:[]` (K2).
Re-run at every instrument digest, including the final `b0d03fe0` after the P3 and page-keyup
strengthenings: unchanged.

## Frozen probes F = {A, B, D, E} (exact frozen bytes, sha verified against the manifest)

Copied read-only into scratch together with the pinned PNGs/driver (the probe dir carries no
PNGs); sha256 of the copies equals the manifest pins. Verdicts at the final bytes:

| probe | sha256 | r60 exit | findings |
| --- | --- | --- | --- |
| A | `bdd3c0ea…447d8a0` | 1 | `missing-delivered-shape-field` (cancelable false != true), `keylog-flag-mismatch` |
| B | `7793e4f8…a5566fbb` | 1 | `missing-delivered-shape-field` (no cancelable) |
| D | `0feeb2ae…dcfdc445` | 1 | `missing-delivered-shape-field` (cancelable false on a keyDown), `keylog-flag-mismatch` (cites page keylog 136, cancelable true) |
| E | `5b5ebd12…6c53736c` | 1 | `missing-delivered-shape-field` (no type) |

`forgedGreen = 0`.

Independent confirmation at the PREVIOUS digest `0ed93c7a` (now superseded by `b0d03fe0`;
fresh re-runs were requested from the same seats): R60Exec3 repinned `measure/c2-after/*.json`
there (probe-A `94da529e`, probe-B `a3859656`, probe-D `1f13888b`, probe-E `39cfe573`, live
`33eca090`) with the same exit codes, ids and details as this seat's runs. Frozen probe bytes,
manifest (`edd97c45`) and generator (`2e29acd0`) are unchanged by any of this, and the live receipt
sha stays `72514ff7`.
R60Critic's independent re-run at `0ed93c7a`: P1/P2/P2b/P2c/P4 exit 1 (cancelable/shape), P3/P3b
exit 1 (`keylog-entry-mismatch`), live exit 0, A/B/D/E exit 1 (`cr1/repin-0ed93c7a.txt`).
R60Reviewer's independent re-run at the same digest agreed (selftest 107/107, self-check 107, live
exit 0, A/B/D/E exit 1, P3/P3b exit 1) and closed its A5d row against the L1 ruling — its later
seat summary is what surfaced the page-keyup residual now closed above. This seat re-ran the whole
battery itself at `b0d03fe0`: live green, A/B/D/E red, critic P1/P2/P2b/P2c/P3/P3b/P4 red,
reviewer P4b/P4c/P4d red and P4a green by rule.

Baseline re-measured for the record (r59 counter, same bytes): **all six** forged variants —
A, B, the D class on `trace[0]`, the E class, a string `cancelable`, and a second-event
`cancelable:false` — exit 0 with `findings: []`; A and B reproduce the frozen
`round-59/measure/f6-probe/RESULT.txt`.

## Not run / limits

- The C2 after-command at DATA-REV and the r59-side controls (L1). Mutants C6–C9 ARE measured at
  `b0d03fe0` (see above: all KILLED, `survived: []`); every earlier battery is void.
- No build/lint/test suite, no formatter; only this artifact's `--selftest`, `--path-selftest`,
  `--self-check`, the prescribed live run, and the four probe runs.
- No tools installed or upgraded (nothing was needed).
- Residual, disclosed: (i) deleting a whole mirror slot (or a whole `capslockTrace`/`trace`
  array) is not refused — the form leg's own r59 checks remain the witness and no cancelable
  value is forged. (ii) The `trace[]` array's key/code identity is not re-derived (out of the
  declared change set); positions are grounded on the located 12-event run. (iii) The leg's
  DERIVED summary booleans (`leg.anyCapsTrue`, `leg.capsLatchObservedAllFalse`,
  `leg.capsLatchOk`, `trace.capsLatchOk`) are not read: they are summaries, not the "recorded
  keydown/keyup" the carried predicate names, and the `latch` block's `anyTrue`/`allFalse`/
  `acrossLetters*` are read. A forged summary alone therefore stays green — a disclosed
  boundary, not a forged read. (iv) The top-level r56 control-domain slice
  `receipt.keylog.entries` is now re-derived for identity and for the flags it records (the
  P3/P3b strengthening, L1 ruling); a slice that omits the flags entirely is still admitted,
  by construction, because the synthetic generation records it that way. (v) NAMED LIMIT, ruled by
  the L1 (option (a), no edit): the `cancelable` VALUE of any keyup — CapsLock or letter — is
  unbound; only presence and boolean type are required, so a forgery is refused only when some
  recording of that event disagrees. Consistent-record keyup-value forgeries are GREEN by the
  claim's keyup rule, and `page-keyup-cancelable-false-admitted` pins that boundary as a deliberate
  GREEN case.
- Scratch: `S=/fast/scratch/hyaku/tabi-r60/R60Exec2` with `TMPDIR=$S` (disk 408 G free at start,
  `disk-guard` not needed); no `/tmp` reference in the counter.
