# CritAxisCapability — C1 classification, capability acquisition, and the nudge state

**Verdict.** C1's **coverage** axis holds under the binding surface rule: the round changes a surface the
lane never held — a second transport (`chromedriver` BiDi WebSocket) with a new operation class over 17
in-province surfaces that the lane's own map marks `locally measured: no` ×17 — and it is not the
re-scoring of a held rule nor a sourceless-fixture row count; the frontier→core half is assigned
(`ScribeMatrixAddendum` drafts the `corpus/README.md:191` Frontier row and the matrix §2 addendum).
C1 also qualifies as a **capability acquisition** *conditionally* on two guards (row must name the
transport operation, not the gate; demonstration must be the `--live` run plus two non-counter driver runs).
The **stagnation nudge is genuinely ACTIVE**: I reproduced round 32's derived state `active` with the frozen
counter on the freeze revision, so the round owes no adjacency claim and `notClaimed`'s waiver is valid —
**but** the active state (and 2 of C2's 3 `m4` findings) rest on an unstated, self-contradicted promotion
policy: the lane's capability table contains four gate/counter rows entered at rounds 24–25
(`SCORECARD.md:1243`, `:1249`, `:1306`, `:1314`) while rounds 27+ declare "gates are counters, not repertoire
rows" (`:1403-1404`, `:1427`, `:1456`, `:1501`, `:1544`). The frozen counter, run against a counterfactual
that applies the lane's own earlier practice, derives rounds **29 and 30 as correctly inactive** and round
**32 as INACTIVE** — which would put adjacency (lowest, 8) back in play. That is a disclose-and-record
defect, not a counter failure, and it is the one thing this round must not leave silent.

---

## 1. Axis by the surface — **holds** (coverage)

Rule as bound in the fleet addendum (`scripts/hyaku/lane-addendum.md:342-346`): *"Name the axis by the surface
the round changes, not by the number it produces … Re-scoring a rule the lane already holds on new inputs, or
counting rows a sourceless fixture also counts, is quality work, never coverage or depth. A coverage claim
names the surface it moves (frontier → core, a new tool, operation or edge class) and the command that would
show it unmoved."*

Element-by-element:

| Rule element | C1 evidence | Status |
|---|---|---|
| new tool / operation class | `chromedriver` is used by no other lane script (`grep -rn chromedriver --include=*.mjs scripts \| grep -v check-bidi-runtime.mjs` → no lines, pipeline exit 1); the repertoire's transport rows to date are CDP-only (`SCORECARD.md:764` webmcp-cdp-observation r16, `:805` webmcp-cdp-invocation r17). BiDi is a second wire protocol with its own command/event model (`scripts/check-bidi-runtime.mjs` ROWS R1–R17). | holds |
| frontier → core | `corpus/README.md:191` Frontier row reads "WebDriver BiDi \| docs-held — spec map only; no BiDi session measured" at the freeze; the move is assigned this wave (`w1-dispatch.json` task `ScribeMatrixAddendum`: matrix §2 addendum + README coverage/frontier rows, append-only). | holds (assigned, must land) |
| not a held rule re-scored | The held ground is CDP; the BiDi map is explicitly unheld: `corpus/knowledge/webdriver-bidi-capability-matrix.md` preamble "locally measured: no" and §2 lines 60–76 = 17 data rows, **every** last cell `no` (scripted count: `data rows: 17 line range 60 - 76`, `last cell all "no": True`). No BiDi session has run on this host: `LOG.md:551` "The BiDi matrix is confirmed at its dated WD, not promoted to implementation support"; `corpus/evidence/round-12/source-recheck.json:35` `FreshBidi.txt` is a docs re-open capture. | holds |
| not a sourceless-fixture row count | each counted row is spec-anchored (matrix §2 anchors; counter `s1-source-row` requires a `mined` S-row opened after the baseline) **and** browser-bound: `t3-binding` requires each run's first screenshot (after setViewport/navigate/`__ready`) to decode to bytes equal in every run and equal to the counter's own live session, plus a `chromedriverVersion`; `l1-live` re-runs the predicate on an independent client. The committed controls prove a fixture-only record cannot admit: `c1-J3-forgery-offline` admitted 16 exit 0 **offline only**, `c1-J3-forgery-live` → admitted 0, `t3-binding` (baseline/README-receipts.md). | holds |
| command that would show it unmoved | Present but only as a control: `before` = "population 0, admitted 0, exit 1 (entry absent; `baseline/c1-J1-do-nothing.json`)". The `surface` text also gestures at a matrix grep with elided arguments (`grep -c 'locally measured' ...`). | holds-in-substance, weak wording (F3) |

**Strongest counterexample tested:** "C1 is depth, like round 25's bfcache receipt (0 → restores≥1, scored
depth 8→8) and round 31's decision table (scored depth 8→9)." It fails on the object, not the shape: round 25
added a receipt for a surface the lane already governed in the same transport (CDP `Page.backForwardCacheRestore`
on `SKILL.md`-anchored ground), and round 31 deepened a rule the lane held (its rate-signal table). C1 moves an
unedited doc map's 17 *unmeasured* rows into measured state over a transport no lane script used. The axis
follows the surface, not the artifact count. **Coverage.** Note it is saturated (9): the claim must not claim a
scalar promotion, and the deliverable is the entry + capability row (the round-31 depth 8→9 precedent is not
available here because coverage already reads 9).

## 2. Capability acquisition under `AXES.md` §Capabilities — **qualifies, with two guards**

`AXES.md:57-64`: rows enter "only through a round that demonstrates the capability running; a capability
without a passing demonstration in the round report is pre-claiming and does not enter the table."

- **Demonstration is not self-certified.** The frozen predicate is not the entry's `Measured: yes` column: the
  committed receipt must carry ≥ 2 runs whose transcripts match blob digests, a `driver` blob that is *not*
  `scripts/check-bidi-runtime.mjs`, and screenshot bytes bound to the counter's own live session
  (`check-bidi-runtime.mjs:520-540`; kill rule: "the offline reading alone does not verify (control J3)").
  `c1-J4-counter-as-driver` (two real sessions, counter as driver) → admitted 0, `t1-receipt`.
- **Output verifies.** `--live` is part of the predicate; the `l1-live` leg is an independent client against
  `FIXTURE` and requires `browserVersion` equality with the receipt.
- **Guard a (identity).** The row must name the *transport operation* ("drive a WebDriver BiDi session …
  capture/observe 16 of 17 matrix §2 surfaces on loopback"), never the gate. `SCORECARD.md:1403-1404` refused
  exactly that promotion for `check-s106-evidence.mjs` ("a gate (counter), not a repertoire capability"), and
  `:1427` restates it. Promoting `check-bidi-runtime` would both violate that rule and make the capability
  half a duplicate of the coverage half.
- **Guard b (operational).** Receipt-producing driver runs must use a short `TMPDIR` (`/tmp/…`), not the deep
  `$HYAKU_SCRATCH` path: `claims.json` `counterCommits.note` records that every pre-freeze `--live` leg failed
  with `session not created: Chrome instance exited` because chromium's singleton socket path exceeds the
  108-byte unix-socket limit under a deep `TMPDIR`. Only `liveRecord`'s TMPDIR choice was fixed (`5ad1fcbf`);
  a new, separate driver script inherits the hazard.

## 3. Stagnation nudge — **ACTIVE** (reproduced), but **convention-dependent** (defect)

Inputs, all from committed bytes:

- Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, **adjacency 8**.
  Round 31 start was depth 8 … adjacency 8 (`SCORECARD.md:1575`); round 31 moved depth 8 → 9 (`:1581`);
  no capability entry is recorded at any of rounds 26–31 (`:1356` r26 "No capability rows enter", `:1403` r27
  "No capability-table promotion this round", `:1427` r28, `:1501` r29, `:1544` r30, `:1603` r31 "capabilities unchanged").
- Saturation 8 / window 3 (`SCORECARD.md:1603`, unchanged since `:424`).
- Recorded capability entry rounds = {13, 16, 17, 22, 23, 24, 25} (table rows `:572`(13), `:764`(16), `:805`(17);
  prose `First-working round:` at `:1109`(22), `:1141`(23), `:1243`, `:1249`(24), `:1306`, `:1314`(25)). **None after 25.**

Every axis sits at or above 8 ("at or above", `AXES.md:68`), so the first condition holds. Under the frozen
rule's window (`check-selfassessment.mjs:497`: `c >= round - window && c <= round - 1`), round 32's window is
[29,31] → no capability entry → **ACTIVE**. I reproduced it mechanically, not by reading the claim:

```
# run 4: clone commit 86ed04e (freeze SCORECARD + a synthetic `## Round 32` group carrying the real
#         "Axes at round start: depth 9 … adjacency 8; Saturation 8 / window 3; nudge active")
node scripts/check-selfassessment.mjs --rev 86ed04e --json      # exit 1
   finding m4-nudge-state round=32 line=1608 claimed=active observed=active
```

So the round shape is right: no adjacency claim is owed, and `notClaimed`'s "adjacency (lowest axis; obligation
waived by the active nudge)" is valid **as the table is written**.

### The counterexample: the table is written under a rule the lane itself reversed

Two facts, both committed:

1. Four capability rows are gates/counters: `SCORECARD.md:1243` (gate-registry conformance gate, round 24),
   `:1249` (self-assessment mismatch counter, round 24), `:1306` (bfcache-receipt gate, 25), `:1314`
   (source-reopen-receipt gate, 25). Their "what it can now do" is a *gate's* analysis.
2. Rounds 27+ declare the opposite rule and never promote again: `:1403-1404` "No capability-table promotion
   this round: `check-s106-evidence.mjs` is a gate (counter), not a repertoire capability"; `:1427` "gates are
   counters, not repertoire rows"; `:1456`, `:1501`, `:1544` "capabilities unchanged (gates are counters)";
   `:1603` "capabilities unchanged" after round 31's own new gate (`:1585`).

Under the lane's round-24/25 practice, the round-27 gate ("s106", `:1403`) and the round-31 decision-table gate
(`:1585`) are entitlement-equal and would be entries 27 and 31. Running the frozen counter on that reading
(counterfactual commit `3680837`, `First-working round: 27` / `: 31` appended, nothing else changed):

```
node scripts/check-selfassessment.mjs --rev 3680837 --json       # exit 1
  round 29 line 1473 claimed=inactive observed=inactive   # statement CORRECT
  round 30 line 1515 claimed=inactive observed=inactive   # statement CORRECT
  round 31 line 1576 claimed=inactive observed=active     # only this one wrong
  round 32 line 1608 claimed=active   observed=inactive   # nudge INACTIVE -> adjacency owed
```

Consequences if this reading governs: (i) C2's "3 m4" is really 1 false statement plus 2 correct ones
(`:1473`, `:1515`); (ii) the round would owe an **adjacency** claim (adjacency 8 is the unique lowest axis),
and C1's coverage claim would not satisfy the lowest-axis obligation; (iii) the round's lesson "stale-premise:
'nudge inactive' carried from rounds 26–28 into 29–31" is only half true — rounds 29–30 were right under the
pre-27 rule and wrong only retroactively.

Which reading wins? The frozen one, for this round: `AXES.md:69` says "no capability **has entered the table**",
and the table as committed has no entry after 25; the frozen counter derives ACTIVE and the claim's predicate is
that counter. But the state is then decided by a promotion policy that has two authorities in the same document,
and the round cannot pretend otherwise.

**Impacted axes:** calibration (C2's m4 composition and its lesson), coverage (the waiver that makes C1's axis
legitimate), adjacency (owed if the pre-27 practice governs).

---

## Findings

| # | Verdict | Severity | Evidence | Smallest safe correction |
|---|---|---|---|---|
| F1 | **defect** — duplicate authority over "capability entry" decides the nudge state, and 2 of C2's 3 m4 findings flip under the lane's own earlier practice | medium | `SCORECARD.md:1243,1249,1306,1314` (gate rows are capability rows) vs `:1403-1404,1427,1456,1501,1544` (gates are counters); counterfactual run `B2-counterfactual.json` → `:1473`,`:1515` correct, `:1576` wrong, round 32 `observed=inactive` | Append-only disclosure paragraph in the round-32 disposition **and** in the round-32 lesson's `## Gate`/`## Mistakes`: adopt "gates/counters never enter the capability table" as the operative rule, cite `:1403-1404`/`:1427` and the four pre-rule rows, and state that rounds 29–30's statements fail only under that rule while round 32's active state is a property of the table as written. No counter edit (frozen), no deleted row. Phrase it "the nudge was active" (which also serves C2's supersession requirement for the three stale lines) and keep the counterfactual reading out of any sentence the m4 scanner reads as a state statement. |
| F2 | **defect (instrument input hole)** — round 28's nudge statement is `could-not-evaluate`, never verified | low | `A-freeze.json`: `round 28 line 1456 ... couldNotEvaluate="no \`Axes at round start:\` with all six axes in the round group"`; the group at `SCORECARD.md:1432` writes "axes depth 8, coverage 9, …" instead | Disclose `:1456` in the round-32 lesson as *unread* (not correct): the m4 class is format-tied, like the word-numeral and `<name>_cases=` holes already in `notClaimed`. Do not touch the frozen counter. |
| F3 | **defect (wording)** — the coverage claim does not spell "the command that would show it unmoved" | low | `claims.json` C1 `surface`/`before`: the unmoved demonstration is only the do-nothing control `baseline/c1-J1-do-nothing.json`; the matrix grep is elided (`grep -c 'locally measured' ...`) | In the disposition, write the unmoved command in full (counter at the baseline tree → population 0, exit 1; plus the matrix reading: 17/17 last cell `no` at the baseline bytes `d805d1d6`) so the coverage rule's fifth clause is literal. |
| F4 | **guard (not a defect)** — capability row identity and TMPDIR | low | `SCORECARD.md:1403-1404`, `:1427`; `claims.json` `counterCommits.note` (108-byte socket limit) | Row names the BiDi transport operation; evidence pointer = entry + the two independent driver runs + the `--live` receipt; run receipt-producing drivers with `TMPDIR=/tmp/…`. |
| F5 | **holds** — no adjacency absorption, no hidden regression | — | `grep -rn -i bidi --include=PROVINCE.md .` at the fleet root → **exit 1, no match**; `PROVINCE.md` owns CDP session discipline and the lane's own matrix is round-1 in-province ground; loopback-only perimeter honored (no external navigation in the counter). | none |

**Round-32 group must not create a fourth m4 finding.** The capability row entering with
`First-working round: 32` does **not** flip round 32's state: `check-selfassessment.mjs:497` excludes `c = round`,
so the round-32 group must state `nudge active` and must not restate rounds 29–31 in a scanned form except via
the citation-bearing correction paragraph in F1.

---

## Receipts

Output dir `.ufo/waves/round-32/w1/CritAxisCapability/`:

| File | sha256 | Reading |
|---|---|---|
| `A-freeze.json` | `98eb1c003cfa33b8a6272cccdabdc750a361338a96ef1db284f702c7be318aad` | rev 4181fffb, mismatches 18, cne 104, m4 counted `:1473`,`:1515`,`:1576` |
| `B1-synthetic32.json` | `d84932c6a0b21d2c4e39c4d97b3199828d802ee3a3700b610d2e18bccf60e73e` | rev 86ed04e, round 32 `claimed=active observed=active` |
| `B2-counterfactual.json` | `68b674b87f307494708c30ae144ba967e8a28451716648bf5f92db58c4909bf0` | rev 3680837, rounds 29/30 `inactive/inactive`, `:1576` wrong, round 32 `observed=inactive` |
| `commands.md` | — | every command, exit code, scratch commit; frozen digests re-derived at 4181fffb (`2f25af5a…`, `77b5c8ed…` == `claims.json` `frozenDigests`) |

Commands and exit codes: `node scripts/check-selfassessment.mjs --rev 4181fffb… --json` → **exit 1**;
`--rev 86ed04e… --json` → **exit 1**; `--rev 3680837… --json` → **exit 1**. Non-zero is the counter's declared
"failed" verdict (findings exist), not a tool error; the readings above are parsed from the JSON.
Scratch `/fast/scratch/hyaku/tabi-r32/CritAxisCapability` was deleted before yield. No chromedriver or
chromium process was started by this seat (`--live` never invoked); the chromium/chromedriver processes visible
in `pgrep -fa` carry `--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/...` and belong to that
seat, not to me. No network fetch, no tool install, no pacman transaction.
