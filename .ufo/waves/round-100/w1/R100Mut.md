# R100Mut — counter mutation sweep (C1, client-oopif-uploadsets round 100)

## Axes (godspeed)
- Kill rate: a mutant is killed only if the positive stays clean (rc 0) AND the battery rc != 0.
- Positive stability: mutants that fail the positive are not coverage evidence.
- Survivor routing: distinguish equivalent/unobservable mutants from true gaps.

## Method (exact)
Scratch mirror S=/fast/scratch/hyaku/tabi-r100/R100Mut; lane mirror S/lane holds the 4 frozen scripts + r99 receipt. Counter sha256 5c3d56d8…c90f matches freeze. Positive receipt controls/receipt-positive.json sha256 17662a71…659d0, nonce tabi-r100-ctl-positive.

Baseline (pristine counter):
```
node $L/scripts/check-client-oopif-uploadsets-round100.mjs --lane $L --expect-driver-sha256 97947b…c90 --receipt $S/receipt-positive.json --expect-nonce tabi-r100-ctl-positive --json
# clean, 212 checks, rc=0
node $L/scripts/negatives-client-oopif-uploadsets-round100.mjs --lane $L --receipt $S/receipt-positive.json --expect-nonce tabi-r100-ctl-positive --expect-driver-sha256 97947b…c90 --scratch $S/batt --json
# 121/121 killed, rc=0
```
100 single-point mutants (mutlist M01–M100: eq→==, drop check, swap true/false in ARM tables, expected size/type/relativePath edits, targetId/errName/errMessage drops, missingExists strictness, files.d key) + 12 discriminators (M101–M112), each run against positive + full 121-case battery in parallel (16 workers, ~60s total).

Verdict rule: killed = positive rc 0 clean AND battery rc !=0 with expected id; survived = positive clean AND battery 121/121; broken = positive rc !=0 (mutation moves correct behaviour — not a kill, not a coverage gap).

## Result: 56 killed, 38 broken, 11 survived, 7 broken (M102-105, M110-112 positive-fail)

Killed highlights (killer case): M13 missing-exists-zero→battery missing-exists-zero; M42 iframe targetId→iframe-targetid-empty; M47/M48 errName/errMessage→resolved-errname-only/resolved-errmessage-only/dir-errname/dir-other-message-x; M53/M99→files-d-key-dropped, dir-relative-flattened, dir-first-file-on-s; M05→nonce-other; M06→driver-pin-other; M09→reps-other; M10→lib-* (6 cases); M16→tmpdir-*; M17→port-1023; M20→port-duplicate; M25→browser-id-not-uuid; M26→browser-reused; M28→leg-rep-mismatch; M30→launch2-lib-swapped; M34→dup3-input-*; M36→empty-child-same-site; M38→browser-version-leg, client-version-leg; M40→frames-*; M99 files.d→dir-relative-flattened.

Every r99 battery-survivor class confirmed killed on pristine battery (batt-base.json):
missing-exists-zero(rc1,missing) ✓, iframe-targetid-empty(rc1,iframe-targets) ✓, resolved-errmessage-only(rc1,outcome) ✓, resolved-errname-only(rc1,outcome) ✓, files-d-key-dropped(rc1,child-files) ✓, dup3-deduped ✓, dir-relative-flattened ✓, mixed-resolved ✓, mixed-other-message ✓.

### Survivors (11) and routing
- M01 `===`→`==` in eq(): eq compares JSON strings; string equality makes this behavioural no-op. Equivalent mutant. No r101 change.
- M07 drop `&& driverSha === pin`: receipt's stamp is still checked; driver-sha vs pin divergence is --live-only by design (counter aborts before run). Live-killer territory, stays there. Not a receipt gap.
- M27 drop `l.arm===m[1]` from leg-label: recovered by leg-arm check using same m[1]. Redundant overlap; killed overlap exists. Equivalent in conjunction.
- M29 leg regex $-anchored→prefix: labels ZZZZ-3 / rep-mismatch still caught by leg-set/leg-label rep fold. No case leaves the conjunction.
- M77 PREDICATE r100→r99: output field only; battery matches verdict not predicate id. Cosmetic. No claim impact.
- M78 LAUNCH_FAIL string renamed: affects only receipt-mode partialLaunch=false path (always []); live-only by construction. Live-killer harness owns it.
- M84 NF row unused: grep shows NF defined once, never read (reads come from ARM/m constants). Dead code, equivalent.
- M93 eq() trailing-newline tolerance: never triggers for JSON receipts; equivalent.
- M94 non-object receipt ⇒ schema-filled stub: still fails nonce/pin/etc. on same cases. Equivalent on reached inputs.
- M101 tighten leg-label with endsWith(rep): redundant conjunct; unchanged outcome. Equivalent.
- M109 drop `Array.isArray(receipt.failures)`: probe (no-failures-key, failures null) shows mutant crashes rc1-stderr (not a clean findings JSON) vs frozen findings rc1. Observable difference is crash-vs-findings shape, not acceptance; still rejects. Cosmetic-defensive; battery cannot distinguish because it parses JSON. Suggest a case asserting JSON-parseable findings with id failures for non-array failures — evidence of robustness, not of unsoundness.

### Broken (38+7) note
Constant/ARM edits (sizes, MIME, schema, EV order, lib swaps, valid-ARM truth flips) necessarily fail the unmodified positive; they confirm the battery is pointed at genuine constants. They are not kills and prove nothing about acceptance — included for completeness and to prevent re-running them as "killed".

## Files
- .ufo/waves/round-100/w1/R100Mut-results.json (100 mutants, per-mutant rc/ids/verdict)
- .ufo/waves/round-100/w1/R100Mut-addl.json (M101–M112)
- .ufo/waves/round-100/w1/R100Mut-battery-base.json (121-case pristine battery)
No live run; no chromium launched by this seat (pgrep remote-debugging-port shows only R100Exec2 processes, per rules untouched). Scratch retained for L1 inspection: R100Mut scratch not removed pending integration (receipts cited above copied).

VERDICT C1: neutral
