# R84Exec2 — C2 before/after pair for the record-drift counter

Seat: R84Exec2, Tabi round 84, one v1 wave w1 (godspeed).
Milestone: C2 controls — `scripts/check-record-drift-r84.mjs` must fail on the r83 records and pass on the r84 corrections.
Counter pin (frozen): `31a3b0f4ca8e6f4fe719c0120203c00837edb235540b4e1a82eadb3530330fcf` (verified = freeze.txt).
Counter contract: `node scripts/check-record-drift-r84.mjs --lane <ABS lane> --json`; exit 0 = 0 mismatches, 1 = mismatches, 2 = usage.
Scratch: `/fast/scratch/hyaku/tabi-r84/R84Exec2/` (deleted before yield, after receipts copied into the wave dir).

## What the counter checks (10 claims)

`r83-accept-correction`, `r83-png-correction`, `falsification-scout`, `falsification-review2`,
`record-counts`, `r83-numbers`, `census-artifacts`, `r84-identity`, `r84-numbers`, `claim-count-stable`.
It reads, relative to the lane: `corpus/lessons/round-84.md`, `SKILL.md`, `SCORECARD.md`, `LOG.md`,
`.ufo/waves/round-84/claims.json`, `.ufo/waves/round-84/scored/{counter,battery,killpower}-a.json`,
`.ufo/waves/round-84/census/{start,end}.txt`, `.ufo/waves/round-83/claim-falsification.tsv`,
and `scripts/negatives-showpicker-r84.mjs` (battery-witness regex).

## (1) BEFORE — mirror in scratch, r84 corrections absent

`corpus/lessons/round-84.md` did not exist in the lane at this seat's start (verified: `ls` → No such file),
so the mirror carries it as **empty**, per the assignment note. Mirrored from the lane:
`corpus/lessons/round-83.md`, `corpus/lessons/round-84.md` (empty), `corpus/knowledge/chromium-showpicker-runtime-round-83.md`,
`SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/SOURCES.md`, `.ufo/waves/round-84/claims.json`,
`.ufo/waves/round-84/scored/{counter-a,battery-a,killpower-a}.json`, `.ufo/waves/round-84/census/start.txt`,
`.ufo/waves/round-83/claim-falsification.tsv`, `scripts/negatives-showpicker-r84.mjs`.

Commands (absolute paths; lane never written to):

```
S=/fast/scratch/hyaku/tabi-r84/R84Exec2; mkdir -p "$S/mirror/..."   # dirs per tree above
cp <each lane file> "$S/mirror/<same relpath>"
: > "$S/mirror/corpus/lessons/round-84.md"                            # does not exist in lane yet
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-record-drift-r84.mjs --lane "$S/mirror" --json > "$S/before.json"   # exit 1
```

Result: `claims=10, mismatches=8`, failed =
`r83-accept-correction, r83-png-correction, falsification-scout, record-counts, r83-numbers, census-artifacts, r84-identity, r84-numbers`.
Passing: `falsification-review2` (`ledgerOrLesson=true witness=true` — the r83 ledger's Review2 row already carries the
cross-origin narrowing and the battery carries the witness fields) and `claim-count-stable`. Note `r84-numbers`
detail `checks=80 battery=162/0 kp=null` — `killpower-a.json` was 0 bytes in the lane at copy time (a scored run was
mid-write; see Risks). Full JSON: `c2-before.json` in this dir.

## (2) AFTER — real lane

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-record-drift-r84.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json > "$S/after.json"   # exit 1
```

Result: `claims=10, mismatches=8`, failed list byte-identical to BEFORE (`c2-after.json` is
sha256-identical to `c2-before.json`; both `80206d7f…`). Expected and honest: the r84 corrections have not
landed in the lane yet — `round-84.md` still does not exist, `census/end.txt` still does not exist,
`SKILL.md` still has no `153 cases`, no record cites the nonce `tabi-r84-l1-a5bdb15ec9a7`, and `killpower-a.json`
was still empty at run time. The counter is frozen, so it cannot pass until the L1/integrator writes the records.

## Corrected mirror — the counter CAN pass (9/10 → 10/10)

To prove the counter discriminates (not stuck at 8), I built `corrected/` = mirror + the minimal r84 corrections
the counter's predicates require, in the append-only form C2 leg (b) specifies:

- `corpus/lessons/round-84.md`: correction table carrying the r83 note's law-3 accept correction
  (extension token `accept=".png"`, `#accept image/png` untargeted, MIME-token/`image/*` frontier),
  the real-PNG correction (8-byte signature `89504e47`, 13-byte ASCII marker, byte-acceptance not decodability),
  the Scout `falsifies-wording` accept-MIME narrowing, the Review2 parentCrossAccess cross-origin narrowing,
  the fused counts (frozen-counter no-work `69 checks / 41 findings`, reverse-control withdrawn,
  `SKILL battery 84 -> 153 cases`, seven laws -> 8), the r83 scored numbers
  (`74 checks / 153 battery cases / 50 kill power / 9 selftest`), and the identity line
  `D a5bdb15ec9a7 nonce tabi-r84-l1-a5bdb15ec9a7`.
- `SKILL.md` + appended `Battery (r83): 153 cases.`
- `census/end.txt`: `tabi ok` + `exit=0`.
- `scored/killpower-a.json`: `{mutants:50, killed:50, survived:0, crashed:0}` (frozen-form fields the counter reads).

```
node .../check-record-drift-r84.mjs --lane "$S/corrected" --json    # exit 0
```

Result: `claims=10, mismatches=0, failed=[]` — every claim green, including
`r83-accept-correction extensionToken=true untargeted=true frontier=true`,
`r84-identity cited=["a5bdb15ec9a7"] wrong=[]`, `r84-numbers checks=80 battery=162/0 kp=50/50`.

## Control — one stale rewrite flips one id back

`control/` = corrected except the row-1 correction sentence rewritten into its stale form (the
`#accept image/png untargeted` clause dropped). Quoted diff:

```
corrected: | 1 | ... | corrected of record: the answered input is an extension token accept=".png"; #accept image/png untargeted; ...
control:   | 1 | ... | corrected of record: the answered input is an extension token accept=".png"; image/png is the delivered file's media type; ...   (no #accept clause)
```

```
node .../check-record-drift-r84.mjs --lane "$S/control" --json    # exit 1
```

Result: `mismatches=1, failed=["r83-accept-correction"]` with detail
`extensionToken=true untargeted=false frontier=true` — exactly the flipped id, and exactly the broken conjunct
(`untargeted` requires both `/#accept/` and `/image\/png/` in the lesson). Full JSON: `c2-control.json`.

## Receipts in this dir

- `c2-before.json` — counter vs scratch mirror (r84 corrections absent): 8 mismatches.
- `c2-after.json` — counter vs real lane at seat time: 8 mismatches (identical to before; corrections not landed).
- `c2-control.json` — counter vs corrected mirror with one stale rewrite: 1 mismatch (`r83-accept-correction`).
- (`c2-corrected.json`, mismatches=0, lives in scratch; deleted with it — re-derivable from the recipe above.)

## Risks / notes for the L1

1. **Mid-write race observed.** `killpower-a.json` and `battery-a.json` were 0 bytes when first copied
   (private scored runs were landing during this seat's execution), so the first BEFORE/AFTER runs read them as
   null. I re-copied after they materialized and re-ran; the final `c2-before.json`/`c2-after.json` reflect the
   complete bytes (`battery=162/0`). To be robust, the L1 should re-run the AFTER leg once the scored dir is
   quiescent (and `killpower-a.json` parses with `survived=0, crashed=0`) before the gate call.
2. **AFTER is red by design until the records land.** The 8 failures name precisely the not-yet-written r84
   records: `round-84.md` (accept/PNG/Scout/counts), `census/end.txt`, the `153 cases` SKILL line, and the
   nonce citation in SCORECARD/LOG/SKILL/lesson. The corrected-mirror run proves the counter passes at 0 the
   moment those land in that form.
3. `falsification-review2` passes on the r83 records as-is (Review2 row + battery witness already present) —
   that leg genuinely needs no new record; it is not a counter flaw, the r83 records already satisfied it.
4. `claim-count-stable` is hardcoded `true` (`'claims=' + (results.length + 1)`) — it can never fail. Noted for
   the L1; out of scope for this seat (frozen counter; I attack nothing in the pin).
5. No tools were installed or upgraded (host python3/node only); no prior scratch reuse; lane tree untouched
   except the four files in this dir. Counter sha256 re-verified equal to the frozen pin before every run.
