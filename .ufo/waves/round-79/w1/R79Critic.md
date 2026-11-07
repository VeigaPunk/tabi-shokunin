# R79Critic — falsification report (tabi round 79, wave w1)

Seat: critic (read-only). Scope: attack C1's limit sentence, the axis label, the no-work
control, and C2's counter. No lane writes; every control ran in scratch; the crafted receipts
and counter outputs are filed under `.ufo/waves/round-79-seats/R79Critic/`.

Verdict: **FINDINGS**. The C1 escape boundary is confirmed exactly (and is reachable); the C2
counter is falsified (a reversed correction passes); the round's own records carry a fresh
record drift of the class C2 claims to fix; predicate legs (c) and (d) are not evidenced as
written.

---

## Findings

### H1 — C2's drift counter counts substrings, not attribution; a reversed correction passes

- `scripts/check-record-drift-r79.mjs:31` — `const has = (text, needle) => … text.includes(needle)`.
- `scripts/check-record-drift-r79.mjs:61` — `sc-78-nonce-corrected` requires the stale nonce, the
  scored nonce and the marker to appear **anywhere** in `SCORECARD.md`; it never checks which one
  the correction calls corrected.
- `scripts/check-record-drift-r79.mjs:77` — `report-78-corrected` requires the single character
  `8` anywhere in the lesson (the lesson contains "round 78" many times), so the corrected value
  is effectively unchecked.

Control A (correction text present, direction reversed). In a scratch copy of the lane I rewrote
the SCORECARD correction to say the *superseded* nonce is `tabi-r78-l1-bf94adaab578` and the
*final scored receipt* is `tabi-r78-l1-d59ca0270c2a` — the exact opposite of the committed truth:

```
node scripts/check-record-drift-r79.mjs --lane /fast/scratch/hyaku/tabi-r79/R79Critic/c2rev \
  --fleet-report /home/vgpnk/Projects/shokunin/.ufo/reports/round-78/tabi.md --json
→ exit 0, mismatches 0
```

Control B (lesson truth reversed). In another copy I rewrote lesson item 4 to "The committed
truth: **32** witness cases, **9** Mistakes rows, … `pick-multiple` node is **10**" — while the
counter's own `truth` object prints `witnessCases 31, mistakesRows 8, scoredNode 7`:

```
node scripts/check-record-drift-r79.mjs --lane /fast/scratch/hyaku/tabi-r79/R79Critic/c2lesson \
  --fleet-report /home/vgpnk/Projects/shokunin/.ufo/reports/round-78/tabi.md --json
→ exit 0, mismatches 0 (truth: 31 / 8 / 7)
```

Control C (the counter's intended catch). Rewriting the r78 receipt's nonce to the stale value
while the correction text stays correct:

```
node scripts/check-record-drift-r79.mjs --lane /fast/scratch/hyaku/tabi-r79/R79Critic/c2truth \
  --fleet-report /home/vgpnk/Projects/shokunin/.ufo/reports/round-78/tabi.md --json
→ exit 1, mismatches 1 (sc-78-nonce-truth)
```

So the truth derivation from bytes works; the binding between the correction and the truth does
not. Predicate C2 leg (b) — "a correction names it with the corrected value; the corrected value
equals the committed truth re-derived by the counter" — is **not machine-checked**. The claim's
"mismatches 0" is satisfiable by writing the correction strings in the wrong direction.

### H2 — the round's own records carry the drift it claims to fix: the battery count is 87 / 88 / 90

- `.ufo/waves/round-79/claims.json:5` — "battery 87/87 allOk"; `:14` — "battery exits 0 allOk
  (87 cases, coverageGap [])".
- `SKILL.md:3236` — "`scripts/negatives-showpicker-r79.mjs` (battery, 88 cases, …)".
- `.ufo/waves/round-79/scored/c1-negatives-a.json` — `cases: 90, passed: 90, failed: 0`.
- The battery script's digest `8c64f8e0…` matches `freeze.txt` at D and at HEAD, so the pinned
  instrument emits 90 cases; 87 is the pre-freeze number and 88 is a third, unsourced number.

Command: `node -e 'const j=require("./.ufo/waves/round-79/scored/c1-negatives-a.json");console.log(j.cases,j.passed,j.failed)'`
→ `90 90 0`. The C2 counter checks only r78 records, so this fresh drift is uncounted.

Also `claims.json:14` says "coverageGap []"; the battery emits `coverage: {declared, covered,
uncovered, unknown}` (uncovered/unknown both `[]`) — there is no `coverageGap` field.

### H3 — predicate C1(d) is false as written: the admitted note does not cite S219

Predicate C1(d): the note "citing S216-S219". The admitted note
`corpus/knowledge/chromium-showpicker-runtime-round-79.md:3` cites S216, S217, S218 only;
`corpus/SOURCES.md:233` is the last source row (S218); there is no S219 row. The scribe's draft
(`.ufo/waves/round-79-seats/R79Scribe/knowledge-note.md:1`,
`.ufo/waves/round-79-seats/R79Scribe/sources-rows.md:13`) has S219, but neither is admitted.

```
grep -n "S219" corpus/knowledge/chromium-showpicker-runtime-round-79.md corpus/SOURCES.md
→ no hits
```

### H4 — predicate C1(c)'s kill-power leg has no committed evidence

```
ls .ufo/waves/round-79/scored/
→ c1-counter-a.json  c1-negatives-a.json  digests-commit.txt  selftest-r79-gates.out
find .ufo/waves/round-79 .ufo/waves/round-79-seats -name '*killpower*'
→ no hits
```

`run-scored-r79.sh` runs `kill-power-r79.mjs` and copies `c1-killpower-a.json` into
`scored/`; the committed run has no such file. The (c) leg is half-evidenced: battery yes
(90/90, coverage uncovered/unknown `[]`), kill power (0 survivors, 0 crashed) no.

### H5 — cited control evidence absent (false provenance)

- `claims.json:5` cites `controls/c1/prefreeze-summary.json` — absent. `ls
  .ufo/waves/round-79/controls/c1/` shows only `prior-set.txt` and `probes/`; the only
  `prefreeze-summary.json` files in the repo are round-73/74.
- `claims.json:44` cites `lesson-proof/c2-controls.json` — absent. The round-79 lesson-proof
  holds only `c1-nowork.json`, `c2-after.json`, `c2-before.json`; the r78 file exists at
  `.ufo/waves/round-78/lesson-proof/c2-controls.json`.

### M1 — the frozen limit sentence's first clause is off by one in general

`scripts/check-showpicker-r79.mjs:17-21` (header) and `:506` (`limit.sentence`): "moves at least
`absNeed(prior)` … escapes". The escape condition is `absMatched < absNeed`, so the moved count
must be `N_p - absNeed + 1`. For the four committed 37-event priors the two coincide (19); for a
40-event prior the `limit` block prints `absNeed 20, escapeEvents 21` (synthetic `--prior`
demonstration, `syn40-result.json`), so the first clause would understate the boundary by one.
The printed `escapeEvents`/`escapeGaps` are correct; the prose is not.

### M2 — the coverage claim's signal is not in PROVINCE.md

AXES.md:12's coverage signal is "PROVINCE.md lists every surface". `PROVINCE.md` has no
file-chooser / showPicker line and no Round 77/78/79 entry. The only frontier record is the r77
note's exclusion sentence, `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:116-117`:
"… `showPicker()` (refused without a gesture in a throwaway exploration, not a receipt) are not
part of this capability."

---

## 1. C1 limit sentence: the exact escape minimum and the boundary forgery

From the counter's `limit` block on the scored receipt (4 priors, identical shape):

```
priorEvents 37, priorGaps 1, absNeed 19, gapNeed 1, escapeEvents 19, escapeGaps 1   (per prior)
```

Effective minimum: **19 page-event times moved and 1 gap broken**. The four priors are
independent timelines (cross-match 0–2 events, 0 gaps), so replaying one prior only has to beat
that prior; the set's size buys nothing.

Boundary test. I replayed `probe1` and rewrote every identity field (nonce, driver sha, fixture
sha/origin, ports, 10 launch tokens/argv/profile dirs, 10 devtools browser ids, per-leg frame
ids, navigate URLs, the `Runtime.evaluate` nonce expression, the server-log run), then moved
exactly 19 events' `ts` by +0.1 ms and the ≥50 ms gap's later bound `at` by +0.2 ms:

```
node scripts/check-showpicker-r79.mjs --lane /fast/scratch/hyaku/tabi-r79/R79Critic/lane \
  --receipt corpus/evidence/round79/chromium-showpicker/receipt.json \
  --expect-driver-sha256 e9c87159… --expect-nonce tabi-r79-forge19 \
  --expect-fixture-sha256 147df8dd… --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --json
→ exit 0, verdict clean, 56/56 checks; replay absMatched 18 < 19, gapMatched 0 < 1
```

At k=18 (one below the printed minimum) the same forgery:

```
→ exit 1, replay-event-timeline refused (absMatched 19 ≥ 19)
```

So the printed escape minimum is exact and reachable: the replay rule is the counter's only
provenance defense, and its price is 19 of 37 event times plus one gap. The battery's own
`unbracketed` list already admits the gap rule has no independent kill; the forgery confirms a
0.2 ms move on one event defeats it.

## 2. The axis

The deciding sentence is **AXES.md:12** — coverage is "Fraction of the domain's real surfaces the
skill governs (repo paths, tools, edge classes)". The programmatic trigger path is a new
governed surface element: at base `git grep showPicker 24c8218 -- scripts/` is empty (the
r77/r78 instruments never call it), and the r77 note explicitly excludes it
(`chromium-file-chooser-runtime-round-77.md:116-117`: refused without a gesture, "not a
receipt"). r79 moves that excluded element into the governed set with a receipt and a law
table → **coverage**, not quality work on the r77/r78 instrument. The quality reading would
require the existing instrument to have exercised showPicker; it did not. The depth sentence
(AXES.md:13, "named error signatures") describes what the law contributes, but the surface count
is what moved. Caveat: the coverage *signal* is unmet — PROVINCE.md does not list the surface
(M2).

## 3. The no-work control

The r78 receipt under the r79 counting command (r79 pins):

```
node scripts/check-showpicker-r79.mjs --lane <lane> \
  --receipt corpus/evidence/round78/chromium-file-chooser/receipt.json \
  --expect-driver-sha256 e9c87159… --expect-nonce tabi-r79-l1-80830674d421 \
  --expect-fixture-sha256 2e80efa0… --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --json
→ exit 1, 61 checks, 52 findings
```

Exactly the SCORECARD's recorded 52 (`SCORECARD.md:3911`), reproducible. It fails on the right
reasons: schema, nonce, driver pin, fixture, plan-frozen, every `leg-*`, the
gesture/activation/consumption/immutable/intercept/cancel/dismiss/trust laws (as unknown-leg),
host-argv, teardown, fixture-descriptors, server-log, run-window, replay tokens,
prior-set-complete. Caveat: 10 checks pass, and several pass vacuously because the r78 receipt's
legs carry no `pageEvents` key (`event-leg-window`, `seq-monotonic`, `replay-event-timeline`,
`mode-law`, `node-binding-law`); the no-work control proves identity/plan binding, not law kill
power — the battery is the only law-kill evidence.

A do-nothing round passes **no** predicate leg: (a) needs the r79 receipt/nonce, (b) needs the
cold runs, (c) needs the battery + kill power on (a), (d) needs the note/row/registry/selftest.

## 4. C2: the counter counts the claim, not the truth

Controls A/B above: correction text present, truth wrong → exit 0. Control C: truth bytes wrong,
correction text present → exit 1. The counter's `truth` is re-derived from bytes (good), but
every correction check is `String.includes` co-presence
(`scripts/check-record-drift-r79.mjs:31,61,77`), so the attribution is unchecked. The predicate's
leg (b) is stronger than the instrument.

## Impacted axes

- **calibration** (H1, H2, H5, M1): the calibration instrument is satisfiable by a false
  correction; the round's own records carry three battery counts and two absent evidence
  pointers.
- **coverage** (H3, M2): the capability's note is one source short of its predicate; the
  province map does not record the surface.
- **operability** (H4): the kill-power leg's committed output is missing.

## Smallest safe corrections (not amendments to frozen artifacts)

1. C2: the correction claims must parse the corrected value out of the sentence (capture the
   backticked token after "The final scored receipt is" and compare to `truth.scoredNonce`;
   capture the integer after "Mistakes rows" and compare to `truth.mistakesRows`) instead of
   testing co-presence. Until then the claim must not say the counter verifies attribution —
   leg (b) is human-checked.
2. C1(d): admit the S219 row to `corpus/SOURCES.md` and cite it in the note (the scribe's draft
   has it); do not amend the predicate.
3. C1(c): commit the kill-power output for the (a) receipt, or record (c) as unevidenced.
4. Battery count: state one number (90) in claims/SKILL and correct 87/88 by append-only
   correction.
5. Limit prose: the printed `escapeEvents`/`escapeGaps` are right; the sentence's "moves at
   least absNeed" clause should be read as `N_p - absNeed + 1` (its second clause). A future
   instrument should print only the complement formula.
6. Provenance: commit `prefreeze-summary.json` / `c2-controls.json` at the cited paths or correct
   the citations.

## Evidence filed

`.ufo/waves/round-79-seats/R79Critic/`: `c1-baseline.json` (scored receipt, clean 56),
`nowork-pinned.json` (r78 receipt, 52 findings), `forge19-lane.json` (boundary forgery, clean 56),
`forge18-lane.json` (one below, refused), `forged19.json` / `forged18.json` /
`forged19-receipt.json` (crafted receipts), `forge2.mjs` (generator), `c2-reversed.json`,
`c2-lesson-reversed.json`, `c2-truthwrong.json`, `syn40-result.json`.

## Tooling

No installs. Node v24.21.0 (host), Python 3 (host). All commands read-only against the lane; all
writes under `/fast/scratch/hyaku/tabi-r79/R79Critic/` and the seat dir.
