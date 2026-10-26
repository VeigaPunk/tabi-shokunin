# CritC2Rule — C2 premise: are SCORECARD.md:1473, :1515, :1576 mis-statements?

**Verdict (lead).** The premise holds: all three statements are mis-statements of the lane's own
frozen nudge semantics, not defensible readings. The last capability entry is round 25
(`First-working round: 25`, twice, SCORECARD.md:1306 and :1314; nothing later in SCORECARD.md,
SKILL.md, corpus/README.md or LOG.md), window N=3 and the saturation line is 8
(SCORECARD.md:430-432), and every axis at round start is >= 8 in rounds 29, 30 and 31
(SCORECARD.md:1471-1472, :1512-1514, :1574-1575). Three consecutive rounds with no capability
row (26, 27, 28) had fully passed by the start of round 29, so the nudge is `active` at 29 and
stays active at 30 and 31 (nothing restarts the window; no capability row enters at 26–31). I
tested four escapes and none rescues any of the three: (1) excluding the zero-seat round 26
shifts the boundary by one, which could at most rescue :1473 and still leaves 30/31 wrong, and it
has no textual basis — round 26 is a numbered round with its own baseline, frozen claims and
disposition (:1325-1360) and round 27 is a separate numbered round with its own baseline and 72
dispatched seats (:1372-1404); (2) treating round 27 as a resumption of round 26 fails for the
same reason; (3) a run-boundary reset ("Fresh-start round (run 8)", :1470) has no rule anywhere —
grep finds no "fresh-start"/"run 8"/"window resets" rule in AXES.md or the lane's docs, and only a
capability entry restarts the window (:773, :816); (4) reading "at or above the saturation line"
as "strictly above" is the exact misreading round 31 writes down as its reason (:1576, "depth and
adjacency sit at the line, not above it") and is contradicted by AXES.md:68 ("at or above") and by
the lane's own declaration at SCORECARD.md:431 ("the nudge fires only after all six axes reach
8"). The strongest counterexample available — SCORECARD.md:737, where the lane says round 16,
position 3 since the round-13 capability, "the waiver would apply under the position reading" —
does not rescue any of the three either; it instead makes the *boundary* ambiguous one round
earlier and exposes an instrument hole at SCORECARD.md:1456 (round 28), which the frozen counter
cannot evaluate because the round-28 group omits the literal label `Axes at round start:`.
Severity: **medium** for the three statements (self-description only — every one of the three
rounds still worked a lowest axis at 8, so no claim or admission is voided), **medium** for the
counter's CNE hole, and **low** for the :431/:737 window-boundary ambiguity.

## 1. Frozen instrument, run

All lane scripts were run only inside my shared clone; the lane checkout was read-only.

```
S=/fast/scratch/hyaku/tabi-r32/CritC2Rule
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" -q && \
git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
# exit=0; git -C clone rev-parse HEAD -> 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
sha256sum "$S/clone/scripts/check-selfassessment.mjs"
# 77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9
#   == .ufo/waves/round-32/claims.json frozenDigests["scripts/check-selfassessment.mjs"]

cd "$S/clone" && TMPDIR="$S" node scripts/check-selfassessment.mjs \
  --rev 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --json > "$S/sa.json"
# exit=1
jq '{mismatches,couldNotEvaluate,superseded,clean}' "$S/sa.json"
# {"mismatches":18,"couldNotEvaluate":104,"superseded":21,"clean":false}
jq -r '.counted[]|"\(.class)\t\(.doc)\t\(.line)\t\(.claimed)->\(.observed)"' "$S/sa.json"
# 15x m1-selftest-tally (SCORECARD.md:1439,1465,1486,1564; SKILL.md:2479,2515,2530,2545,2576,2578,2590,2594,2598;
#                          corpus/README.md:613,668 — all "N->41")
# m4-nudge-state SCORECARD.md 1473 inactive->active
# m4-nudge-state SCORECARD.md 1515 inactive->active
# m4-nudge-state SCORECARD.md 1576 inactive->active
```

`git diff --stat 2f8535c5b3015fc5730c1076cbe57d1dc29e4fee 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
-- scripts/check-selfassessment.mjs scripts/check-bidi-runtime.mjs` (exit 0) shows only
`check-bidi-runtime.mjs` changed (the 5ad1fcbf TMPDIR fix named in `counterCommits.note`); the
calibration counter bytes at the freeze are the 2f8535c5 bytes and match the frozen digest.
Receipt copied to `.ufo/waves/round-32/w1/CritC2Rule/sa-at-4181fffb.json`
(sha256 `98eb1c003cfa33b8a6272cccdabdc750a361338a96ef1db284f702c7be318aad`).

Composition matches the claim exactly: 15 m1 + 3 m4 = 18 (`mismatches`), which is what
`.ufo/waves/round-32/claims.json` C2 states.

## 2. The rule and the inputs

`AXES.md:66-72` (frozen text):

> When every axis the lane owns sits at or above the lane's saturation line and no capability has
> entered the table within the lane's stagnation window (both recorded in `SCORECARD.md`), the
> lowest-axis obligation is waived ...

`SCORECARD.md:430-432` (the lane's own declaration of it):

> Saturation line **8**; stagnation window **N = 3** rounds. ... at line 8 the nudge fires only
> after all six axes reach 8 and three consecutive rounds pass with no new capability row.

`SCORECARD.md:773` and `:816` fix the position arithmetic after an entry: "the round-16 capability
restarts the window (round 17 = position 1)"; "the round-17 capability restarts the window
(round 18 = position 1)".

Capability entry rounds (grep `First-working round`, SCORECARD.md):

```
383,424,572,764,805  table headers; last cells resolve to rounds 1 (kaika fleet round-1),
                     13 (round13), 16 (round16), 17 (round17)
1109 First-working round: 22
1141 First-working round: 23
1243 First-working round: 24
1249 First-working round: 24
1306 First-working round: 25
1314 First-working round: 25
# grep over SKILL.md, corpus/README.md, LOG.md for a "first-working round" >= 26: no match
```

No capability row enters at rounds 26–31, stated by the lane itself:

- round 26: "No capability rows enter (no gate ran)" (:1357-1358)
- round 27: "No capability-table promotion this round: `check-s106-evidence.mjs` is a gate
  (counter), not a repertoire capability." (:1404-1405)
- round 28: "capabilities unchanged; no axis retired; saturation 8 / window 3; stagnation nudge
  inactive." (:1456)
- round 29: "capabilities unchanged (gates are counters)" (:1500-1501)
- round 30: "capabilities unchanged (gates are counters)" (:1538-1539)
- round 31: "capabilities unchanged; saturation 8 / window 3; no axis retired." (:1600-1601)

Axes at round start, verbatim:

- 29: "depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8" (:1471-1472)
- 30: "depth 8, coverage 9, operability 8, freshness 9, calibration 9, adjacency 8" (:1513-1514)
- 31: "depth 8, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8" (:1574-1575)

All six >= 8 in all three rounds, so the first half of the nudge condition holds at each round
start. The window half:

| Round | Rounds since the round-25 entry | Window fully empty? | :431 reading ("three rounds pass") | :737 "position reading" | Counter rule (N-3..N-1) |
|---|---|---|---|---|---|
| 26 | 1 | no | inactive | inactive | inactive |
| 27 | 2 | no | inactive | inactive | inactive |
| 28 | 3 | rounds 26,27 empty; 28 in progress | inactive | **active** | inactive |
| 29 | 4 (26,27,28) | yes | **active** | **active** | **active** |
| 30 | 5 | yes | **active** | **active** | **active** |
| 31 | 6 | yes | **active** | **active** | **active** |

Every reading that has any textual support in the lane's own record yields `active` for 29, 30
and 31.

## 3. Verdict per statement

- **SCORECARD.md:1473 (round 29) — MIS-STATEMENT.** Exact text: "Saturation 8 / window 3; nudge
  inactive; no axis retired." Derived state at round 29 start: active (three fully passed empty
  rounds, 26–28; all axes >= 8; no entry since 25). Rescues tried: zero-seat round 26 excluded
  (only shifts the boundary; :1473 becomes position-3 ambiguity, not clean, and 30/31 stay
  wrong; also no basis — round 26 is numbered and recorded, round 27 has its own baseline and 72
  seats); "fresh-start (run 8)" reset (no such rule exists); strict-above reading of the
  saturation line (contradicted by AXES.md:68 and SCORECARD.md:431).
- **SCORECARD.md:1515 (round 30) — MIS-STATEMENT.** Exact text: "Saturation 8 / window 3; nudge
  inactive; no axis retired." Derived: active (five empty rounds). No escape reading exists; even
  the most generous boundary shift leaves round 30 active.
- **SCORECARD.md:1576 (round 31) — MIS-STATEMENT, aggravated.** Exact text: "Saturation 8 /
  window 3; nudge inactive; no axis retired." The round-31 `claims.json`
  `lowestNonRetiredAxis` states the reason: "stagnation nudge inactive (depth and adjacency sit at
  the line, not above it)". That parenthetical is a second, substantive misreading: AXES.md:68
  says "at or above", and SCORECARD.md:431 says "reach 8". Depth 8 and adjacency 8 meet the line.
  Derived state: active (six empty rounds).

No claim is voided by this: round 29 worked operability (8) and freshness (8), round 30 worked
operability (8), round 31 worked depth (8) — the lowest-axis obligation was satisfied anyway. The
harm is (a) false self-description on the calibration axis, and (b) three consecutive rounds
whose shape AXES's nudge tells the lane to make "a frontier/capability move"; the round-32 C1
BiDi frontier move is the first round that follows that guidance.

## 4. Rounds 23–28: the opposite error

No statement in SCORECARD.md claims the nudge **active** anywhere (`grep -n 'nudge' SCORECARD.md`
returns only `inactive`, `does not use the nudge`, and `no waiver` forms), so a false-"active"
claim does not exist to find. Checked each round's statement against the derived state:

- :1126 (round 23) "inactive (a capability entered at round 22), so no waiver is claimed or
  needed" — correct (entry at 22).
- :1215 (round 24) "inactive (capabilities entered at rounds 22–23)" — correct.
- :1277 (round 25) "inactive (capabilities entered at rounds 22–24)" — correct.
- :1333 (round 26) "inactive (capabilities entered at rounds 22–25)" — correct (entry at 25 is
  inside the window; position 1).
- :1382 (round 27) "window 3; nudge inactive; no axis retired" — correct (position 2).
- :1456 (round 28) "stagnation nudge inactive" — **boundary-ambiguous, not clean**: correct under
  the lane's frozen declaration (:431, three rounds must pass) and under the counter; a
  mis-statement under the lane's own "position reading" (:737, waiver applies at position 3).
  SCORECARD.md:431 and :737 do not agree at position 3; that inconsistency is pre-existing and
  the frozen counter is silent on it — see §5.

## 5. Two defects in the attack surface (found while falsifying, not repaired)

1. **CNE hole at the boundary (medium).** Round 28's group states its axes as "axes depth 8, …"
   (:1433) without the literal `Axes at round start:` label. `m4Findings` requires that label
   (`/Axes at round start:\s*/`), so SCORECARD.md:1456 is `couldNotEvaluate` (confirmed in the
   receipt: `observed: null`, reason "no `Axes at round start:` with all six axes in the round
   group"). A nudge statement in any round group that omits the label is therefore permanently
   exempt from the class. C2's plan corrects the three counted lines and then reads m4 = 0 while
   :1456 — the one line sitting exactly on the boundary the lane's own :737 treats as active —
   stays unexamined.
2. **Window boundary not reconciled with the lane's own text (low, but on the same class).** The
   counter encodes `recent = caps in [N-W .. N-1]` (comment at the m4 block: "rounds N-W .. N-1"),
   i.e. the :431 "three rounds pass" reading. SCORECARD.md:737 records the alternative "position
   reading" in which the waiver applies at position 3 (round 28 here). The two readings disagree
   only at position 3, which cannot change the verdict on 29–31, but a correction text that says
   "active for round 28" would silently adopt :737 and contradict :431.

## 6. Smallest safe correction

1. Append-only corrections at the end of SCORECARD.md for exactly the three counted lines —
   `SCORECARD.md:1473`, `SCORECARD.md:1515`, `SCORECARD.md:1576` — each citing the line and
   stating the derived state ("the stagnation nudge was active for round 29/30/31"; for :1576
   also restate the basis as "at or above the line", per AXES.md:68 and SCORECARD.md:431, not
   "above it"). Zero deleted lines; scripts untouched.
2. Add one disclosed line — not a state assertion — recording that SCORECARD.md:1456 (round 28)
   is unjudged by the frozen counter (CNE: the group omits `Axes at round start:`) and that
   SCORECARD.md:431 and :737 disagree at position 3. Do **not** claim :1456 is either state under
   the frozen rule.
3. Route, not fix: a v4 item making m4's axis parsing label-independent (use the six `<axis> <n>`
   pairs anywhere in the round group's opening sentence) and reconciling the window boundary to
   one declared reading. Fixing it now would change the frozen counter after the freeze.

## 7. Scope, tools, cleanliness

- Attack only; nothing in the lane was edited. Lane checkout read-only; all git and node work in
  the clone at 4181fffb. No subagents, no `agent://all`, no builds/linters of the lane.
- No tool installs; no browser launched; no network fetch. Nothing to report under the pacman
  guard.
- Scratch `/fast/scratch/hyaku/tabi-r32/CritC2Rule` (clone + counter output) is removed before
  yield; the counter receipt was copied to
  `.ufo/waves/round-32/w1/CritC2Rule/sa-at-4181fffb.json`.
