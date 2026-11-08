# R83Critic — falsification of round-83 C1/C2

Seat: R83Critic (leaf, read-only). Lane: tabi-shokunin. Base per
assignment `4cdf4de…` (note: `claims.json` in-tree records base
`518f6b84…` / digests `b6496e6f…` / nonce `tabi-r83-l1-b6496e6f5d4f`;
this report follows the **frozen files in the lane**, not the
assignment header; the scored receipt's own nonce is
`tabi-r83-l1-c016710129da`, which is what the counter was run with
below).
Scratch: `/fast/scratch/hyaku/tabi-r83/R83Critic/` (deleted before yield;
receipts copied into seat dir first — see §0). No commit, no mutation
of walked trees. All forgeries were run on a scratch mirror lane
`…/R83Critic/sabi-shokunin/` (basename constraint) with the frozen
counter at pin `7b9f9ec4…`.

Axes (godspeed): **(i) forgery escape** — can a receipt be produced
that passes 74/74 without a browser? **(ii) coverage truth** — do
the 5 new legs add surface or re-deep-en old surface?
**(iii) no-work discrimination** — does the counter separate r82
from r83? **(iv) C2 direction binding** — does `23 -> 20` bind
direction or only presence?

## 0. Reproducible baseline

- Scored receipt `corpus/evidence/round83/chromium-showpicker/receipt.json`
  (sha256 `3f9bbb60…`): 15 legs, **61 page events**, 2 gaps
  `[63.6, 609.3]` ms. Leg event counts: 6× cross-origin 0, 5, 9, 8,
  10, 2× cross-origin 0 (number/range), 8, 8, 13.
- Prior set `controls/c1/probes/prior1.json` (pre-freeze probe,
  15 legs, also 61 events): `priorEvents=61, absNeed=ceil(0.5*61)=31`,
  **`escapeEvents = 61-31+1 = 31`**. Matches `scored/counter-a.json`
  `limit.perPrior[0]` exactly. Honest mirror run: **clean 74/74**.

## 1. (1) The limit sentence — exact escape minimum, tested at the boundary

Frozen sentence (counter `limit.sentence`, printed beside the
threshold): *"refuse when absMatched >= ceil(0.5 * prior events);
the escape minimum is priorEvents - absNeed + 1 moved events.
… A forger who moves fewer events but shifts EVERY event by a
constant offset escapes this rule — that is the limit."*
Code: `check-showpicker-r83.mjs:642-649` (`pairMatch` greedy within
`TOL=0.05` ms on `(ts,at)` pairs; `refused = absMatched >= absNeed`).

Results (scratch mirror, frozen counter, expected nonce/driver/fixture):

| Forgery | absMatched | refused | verdict | notes |
|---|---|---|---|---|
| A — verbatim prior events+marks | 61/61 | true | **findings** `replay-event-timeline` | the only finding; replay is the load-bearing check |
| B — copy prior, move first **31** events +100 ms, shift marks +100 | 30/61 | false | findings `event-leg-window` | **replay escapes** (30 < 31) — the leg-window is what catches the naive boundary move, **not** the replay rule |
| C — copy prior, shift **all** events −/＋ constant (+500 ms, marks too) | 0/61 | false | **clean 74/74** | absolute-times rule trivially defeated by one translation |

Boundary interpretation:

- The replay threshold itself is **tight and truthful**: escape
  requires moving ≥ `escapeEvents = 31` of 61 events. 30 moved ⇒
  31 matched ⇒ refused; 31 moved ⇒ 30 matched ⇒ escapes. Verified
  numerically at the boundary (B), not just read.
- But the *identity lesson* is that the counter's honest prior is
  itself an **r83-shaped probe receipt** (15 legs, 61 events), and
  the scored receipt is also 61 events — so a **same-generation
  copy-paste with a single constant shift is a one-line clean
  forgery**. The limit sentence *discloses* this ("shifts EVERY
  event by a constant offset escapes"), so this is a disclosed
  limit, not a hidden hole — but it means the replay rule binds
  **only against the recorded prior probe**, and only up to a
  translation. A forger who rewrites identity fields (nonce,
  driverSha256, fixture.sha256, ports, frameTree, launchTokens,
  browserIds, server-log `run`) and copies the prior's events with
  a +500 ms translation and marks shifted in lockstep gets `clean`.
  Identity rewrites are checked against *operator-supplied*
  `--expect-*` pins, so a forger must know the pins — which are in
  `claims.json`/freeze. The counter has no independent timestamp
  anchor (no wall-clock vs `at` binding beyond `run-window`
  12 s–600 s); `startedAt` is itself a receipt field.
- `backendNodeId` relabel: changing only `first/secondChooser…`
  + `cdpEventLog` + `answer.setParams` fails `plan-calls` (send log
  carries the id). Changing **all four sites consistently to 999**
  gives **clean 74/74** — exactly as the limit says ("inside the
  limit by design"). Confirmed live.
- Gap side: disclosed as reported-not-refused; honest mirror
  `gapMatched=0`. The +500 ms forgery still got `gapMatched=1`
  (one gap survived translation) and stayed clean. Gaps are
  decoration.

Smallest safe correction (does **not** amend the frozen predicate/
rule, just notes the consequence for the judge): none available
without amending the counter — the attack *confirms* the sentence.
The judge should treat C1 leg (a) as "clean against the stated
pins with replay binding only up to translation," i.e. the
counter proves **internal consistency + novelty-vs-prior up to
translation**, not "a browser ran." If the predicate were to be
strengthened, the cheapest fix preserving the sentence's spirit is
a *translation-invariant* statistic alongside absMatched (e.g.
gap-sequence hash), but that is an amendment request — flagged
here, not proposed as the current claim's fix.

## 2. (2) The axis — coverage move or depth mislabelled?

Verified from receipt + `PLAN` + fixture descriptors:

- r82: 10 legs (`sp82-*`, checkCount 64). r83: 15 legs. Delta =
  **exactly the five named legs**:
  1. `sp83-cross-origin-number` (`nu`, 0 events, opens 0,
     `childResult` SecurityError)
  2. `sp83-cross-origin-range` (`rg`, same shape)
  3. `sp83-multiple-mode` (`m`, 8 events, `selectMultiple`,
     answer accepted)
  4. `sp83-accept-mime-answer` (`k` + real PNG `tabi-r83-b.png`,
     `selectSingle`, bytes delivered `hex:89504e…`)
  5. `sp83-second-chooser-answer` (`s`, 13 events, 2 choosers,
     `firstChooserBackendNodeId === secondChooserBackendNodeId`,
     answer `tabi-r83-second.txt` with distinct sha256/bytes)
- These are **new `FIXTURE_INPUTS` branches**, not re-measured old
  branches: number/range are new cross-origin `type=` values
  (r82 had date, color, month, week, time); `multiple` is the
  *only* leg that opens `selectMultiple` (all other answer legs
  are `selectSingle`); `.png` is the first accept-conformant
  answer (r82's accept leg was a `.txt` into `accept=".png"`);
  second-chooser is the first leg with 2 `fileChooserOpened`
  events *and* an answer bound to the second event's bytes —
  `sp83-click-while-open` already had 2 opens but no answer.
- The r82 seven laws are genuinely carried (name, kind, target,
  intercept, LEG_SHAPE all preserved under `sp83-` prefix) — the
  receipt shows identical shapes for the 10 inherited legs.
- **Verdict: coverage label is honest.** Each new leg exercises a
  distinct, previously unexercised conjunct (type enumeration
  +1 type, mode branch, accept polarity, chooser-2 attribution).
  The 5 legs add 5 new checks (`leg-sp83-…` ×5 plus 5 new
  `*-law` = 10 new check ids; 64 → 74) and move the battery
  84 → 153 (84 r83 cases + 69 imported witnesses — lesson,
  correction row 4). No leg is a re-run of an old branch with
  new numbers.
- One nuance for the judge: legs 1–2 (number/range) are
  **zero-event legs** — coverage is measured by `childResult`
  + `childEvents` (5 trusted child-click events) rather than
  page events. That matches the cross-origin family shape
  (date/color/month/week/time are also 0 page events), so it is
  consistent, but a reader counting only `pageEvents` will
  undercount the new surface. Not a mislabel.

## 3. (3) The no-work control

Scored file `scored/nowork-r82-under-r83.json` claims verdict
findings, 69 checks, 41 failed. **Live re-execution** (same args,
frozen pins):
- r82 receipt under r83 counter → **findings, 69, 40 failed**,
  exit non-zero. Failing classes: schema/nonce/driver/fixture,
  all `leg-sp82-*`, legal-plan family, gesture/activation/
  cross/order laws. (Minor delta 69-vs-74 checkCount is a
  scored-file artifact of the pre-freeze counter having 69
  checks; the live frozen counter has 74. Both exit findings.)
- r83 receipt under r82 counter (r82 pins, r82 prior-set) →
  **findings, 69, 41 findings**, symmetric: schema/nonce/driver/
  fixture, all `leg-sp83-*`, plan family.
- Replay check on the no-work runs: `replay-event-timeline`
  **true** (absMatched=0) — the prior probe is r83-shaped, r82
  events don't touch it. So the no-work discrimination comes
  from **schema/plan/pins**, not from replay. A no-work submitter
  (r82 receipt, r83 pins) fails on 40/69-74 checks across every
  family; a depth work submitter that re-ran only old legs
  would fail `plan-frozen`/`leg-order` immediately.

What exits: nothing no-work-ish exits clean. The control is
**discriminative and bidirectional**. Caveat: because checks are
*global* (plan-frozen fails the whole receipt), the counter
cannot distinguish "5 new legs missing" from "everything wrong"
— a partial-but-honest receipt gets no partial credit. That is
the frozen design (kill rule: any leg false → NOT verified), not
a flakiness issue.

## 4. (4) C2 — does `23 -> 20` bind direction or only presence?

Counter `check-record-drift-r83.mjs:72-92`:
`direction-bound = cellAnchor && controlRefused && !reversedOnly`,
where `cellAnchor = /23\s*->\s*20/`, `controlRefused` = committed
`c2-controls.json` carries a `refused:true` + `/reversed/i` entry,
`reversedOnly = has(20->23) && !has(23->20)`.

Live mutations on a scratch drift lane (baseline: 0 mismatches,
7 claims):

| Lesson state | exit | direction-bound |
|---|---|---|
| A — `23 -> 20` only (live) | 0 | true |
| B — `20 -> 23` only (reversed) | 1 | **false** (`cellAnchor=false reversedOnly=true`) |
| C — **both** `23 -> 20` and `20 -> 23` present | **0** | true |
| D — both numbers, no arrow | 1 | false |
| E — `23 → 20` (unicode) | 0 | true |
| F — `23 -> 20` + trailing `(also see 20 -> 23)` | **0** | true |

So: **direction is bound in the "only-wrong-direction fails"
sense, but presence of the correct arrow suffices even when the
reversed arrow is also asserted.** C and F are the counterexamples:
a lesson that *simultaneously* claims `23 -> 20` and `20 -> 23`
passes. The check is an **anchor + anti-reversal-only** gate, not
a "no false direction is stated" gate. The header comment claims
"not just both numbers somewhere" — true (D fails) — but the
predicate does not exclude a contradictory dual statement.

Two further findings in the same check family (live):

- `lesson-7-to-4`: `truthNamed` is **computed but never gates**
  the claim. Mutating the truth string `mismatches: 4` → 99 while
  keeping `7 -> 4` still exits 0. The binding is the arrow +
  stale presence, not the named truth.
- `c2-controls.json`'s committed reversed control lists 6 failed
  ids (`direction-bound, lesson-7-to-4, census-artifacts,
  r82-verdicts-preserved, r83-identity, r83-numbers`) — but a
  scratch-mirror reversal of the live lesson alone (control JSON
  untouched) fails with **only `direction-bound`** (1 mismatch).
  The committed control's 6-id failure list is therefore the
  result of a fuller mirror-mutation than the lesson-arrow swap,
  and the counter accepts it by *shape* (`refused:true` +
  `/reversed/i`), not by re-execution — despite the header's
  "re-executes … on a scratch mirror" language, the committed
  counter contains **no executor** (grep: no `exec`, no child
  process; the re-execution was done by R83Drift / the lesson-proof
  process and committed as JSON). The exit-1 behavior on a
  reversed scratch mirror is real (this seat reproduced it as
  case B), but its provenance is the operator's test, not
  counter-enforced.

Smallest safe correction: gate `direction-bound` additionally on
`!/20\s*->\s*23/` co-presence **or** redefine `reversedOnly` to
any-presence (one-character-class change), and either actually
re-execute the control or downgrade the header to "committed
refusal record inspected by shape." Both are amendments to the
frozen counter — flagged as the strongest counterexample, not
applied.

## 5. Smallest safe corrections (summary, no amendments applied)

1. Accept C1 leg (a) as disclosed-limit clean; record that the
   replay rule's teeth are the 31-event threshold plus the
   leg-window, and that a constant-translation copy of the prior
   probe is the known escape.
2. Coverage axis stands: 5 new surface branches, 64→74 checks,
   4 boolean legs + 3 answer legs with distinct observables
   (modes, bytes, chooser-2). No relabel needed.
3. No-work control is sound (40/74 fail both directions).
4. C2 direction-bound: bind direction by rejecting the
   *co-presence* case (C/F above) and dropping the unused
   `truthNamed` dead variable or wiring it; either re-execute the
   reversed control in-counter or correct the header. As frozen,
   C2 proves "correct arrow present + reversal record committed +
   reversal-only fails," not "no reversed assertion present."

## Evidence

- `scripts/check-showpicker-r83.mjs` sha256
  `7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841`
  (matches freeze.txt + claims.json pin).
- `scripts/check-record-drift-r83.mjs` sha256 `4d0343b5…`
  (matches pin).
- Receipts: r83 `3f9bbb60…`, r82 `75c3c442…`, prior1 probe 61
  events. All numeric claims above were produced from these files
  in-memory; forgery harness outputs (A/B/C, backendNodeId,
  drift A–F) were run against the frozen counters and are
  reproducible from the constructions described.

Report: .ufo/waves/round-83-seats/R83Critic/report.md
Report: .ufo/waves/round-83/w1/R83Critic.md
