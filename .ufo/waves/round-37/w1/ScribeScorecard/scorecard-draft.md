# Round 37 SCORECARD sections — draft (scribe `ScribeScorecard`, w1)

DRAFT for L1 integration. Not scorecard content until the L1 moves it into `SCORECARD.md` and replaces every
`PENDING-MEASUREMENT` cell. Nothing here is a measurement: no counter was run by this seat, no claim is adjudicated,
and no score is proposed. Every factual cell is either quoted from the freeze or read statically from committed bytes
with the pointer given.

Provenance of this draft:

- freeze commit `99437d29de036415a9f2d0524343617a3b19988a` (parent `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`): adds
  `claims.json`, both counters, the build tool v2, `measure.sh` v2, the control driver and the ten baseline receipts
  in one commit (`git show --stat 99437d2` → 17 files, 1812 insertions). Round-start baseline `ed8ccfc…`.
- lane tip at dispatch `f76da094f0ff0ad9856d2232858241e3f7841379` (`round-37: validated w1 spec, dispatch payload and
  ready handoff (34 seats)`); `git status --porcelain` at draft time shows only the untracked `w1/` tree, so the frozen
  files are still the committed bytes.
- frozen digests recomputed by this seat over the worktree files and equal to `claims.json:frozenDigests`:
  `c1` `9c6289b7…91752c` (`c1-adjacency-sweep-v5.mjs`), `c2` `eda339eb…2e019` (`c2-firefox-bidi-v3.mjs`), `buildTool`
  `a85152cd…2a9a96` (`c1-drift-audit-build-v2.mjs`), `measure` `9f89697c…43302` (`measure.sh`), `controls`
  `3a08367f…f25e` (`baseline/run-controls.sh`).

## Round 37 — declared claims (frozen before data)

Freeze `99437d29de036415a9f2d0524343617a3b19988a`; round-start baseline `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`.
Both claims are instrument repairs of instruments that already exist (adjacency drift counter v4 → v5; Firefox BiDi
counter v2 → v3) plus the frozen build-tool and harness repairs the round-36 closure routed; neither claim claims a new
capability. Axes at round start (frozen in `claims.json:axesAtRoundStart`): adjacency 8, operability 9, depth 9,
coverage 9, freshness 9, calibration 9. Lowest axis adjacency 8 (unique). Saturation 8 / window 3; the round-35
capability `webdriver-bidi-runtime-firefox` restarted the window, round 36 was position 1, so round 37 is position 2 and
the stagnation nudge is inactive.

Attribution note carried verbatim from the freeze: `claims.json` records `frozenAt` = `baseline` = `ed8ccfc…`, and unlike
round 36 it carries no `frozenBeforeData` boolean. The commit that actually contains these bytes is `99437d2`; the round
statement above therefore names the freeze commit that holds the bytes and the baseline the claims measure against.
(L1: if the round-36 convention of a self-describing `frozenBeforeData` flag is wanted, that is an L1/planner edit to a
*future* claims file, never an amendment to this one — `measurementRule` forbids amending a claim byte after any seat
scores.)

| Claim / axis | Counting command | Before (frozen) | Target (frozen) |
|---|---|---|---|
| **C1** — adjacency; kind `instrument-repair`; surface: the lane's adjacency drift-verification instruments (`.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs` family). Title: *C1 adjacency counter amendment v5: digest-bound delta pins, canonical moved-note parsing, one predicate sentence, repaired build tool*. Predicate sentence frozen in `claims.json` (295 B) and byte-identical to the counter's `PREDICATE_SENTENCE` (`c1-adjacency-sweep-v5.mjs:131`): `check-adjacency verdict clean at REV AND completeness.unaccounted == 0 AND drift.total >= 1 AND drift.auditCoverage == drift.total AND drift.auditFindings == 0 AND drift.staleFindings == 0 AND delta.unaccounted == 0 AND delta.screenFindings == 0 AND delta pins digest == frozen delta pins digest` | `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | instrument: v4 absent pins digest-binding (c1r37-J1: v4 exit 0 predicate true over semantically-identical UNFROZEN pins); v4 refuses a truthful decoy-token moved note (c1r37-J2: exit 1, audit-moved-wrong-relocation); frozen build tool carries a 39-hex kama pin; the enforced predicate is not one byte-identical sentence. Receipts: `baseline/c1r37-J1-pins-reorder-v4.json`, `baseline/c1r37-J1-pins-reorder-v5.json`, `baseline/c1r37-J2-decoy-note-v4.json`, `baseline/c1r37-J2-decoy-note-v5.json`, `baseline/c1r37-J3-honest-v5.json` | at the measured REV: v5 predicate true on the honest state AND v5 refuses the reordered-pins fixture (exit 2, digest mismatch) AND v5 admits the decoy-note fixture (exit 0) AND the v5 predicate sentence is byte-identical across its three sites AND `c1-drift-audit-build-v2.mjs` resolves every PINS entry (exit 0 run receipt) |
| **C2** — operability; kind `instrument-hardening`; surface: the lane's Firefox BiDi operability counter (`.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`) and the round measurement harness. Title: *C2 BiDi-runtime counter v3: replace-ref refusal + `GIT_NO_REPLACE_OBJECTS`, teardown survivor check, observed-decoration binding; harness v2*. Source: S143 (git-replace manual, opened this round; grounds the replace-ref mechanism B1). Predicate sentence frozen in `claims.json` (154 B) and byte-identical to the counter's `PREDICATE_SENTENCE` (`c2-firefox-bidi-v3.mjs:114`): `no entry finding AND no receipt finding AND no binding finding AND failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0 AND live.survivors == 0` | `node .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs --rev <REV> --repo <clean clone> --json` | instrument: v2 admits an honest-tree clone whose receipt blob is grafted via `refs/replace` (c2r37-J1: exit 0 predicate true — the forged decoration rides through); v2 admits an observed-decoration tamper (c2r37-J2: exit 0 predicate true); v2 has no teardown survivor check; the round-36 `measure.sh` wrote its numstat to a stale path and invoked check-freshness outside its usage contract. Receipts: `baseline/c2r37-J1-replace-ref-v2.json`, `baseline/c2r37-J1-replace-ref-v3.json`, `baseline/c2r37-J2-observed-tamper-v2.json`, `baseline/c2r37-J2-observed-tamper-v3.json`, `baseline/c2r37-J3-honest-v3.json` | at the measured REV: v3 predicate true on the honest state (admitted >= 16, survivors 0, egress 0) AND v3 refuses the replace-graft clone (exit 2) AND v3 receipt-finds the observed-tamper fixture (exit 1) AND the v3 predicate sentence is byte-identical across its three sites AND `measure.sh` v2 writes numstat and runs check-freshness per contract |

Kill rules, verbatim from the freeze. **C1:** v5 refuses the honest state; v5 admits the reordered-pins or any non-frozen
pins bytes; v5 refuses the truthful decoy-note fixture; the three sentence sites differ by one byte; the build tool still
cannot resolve kama. **C2:** v3 admits the replace-graft clone or reads through any `refs/replace`; v3 admits the
observed-tamper fixture; v3 refuses the honest state; survivors are uncounted; the three sentence sites differ by one byte.

Frozen controls (scored before any claim data; exit/predicate read from the receipt JSONs). C1: v4 over reordered pins
`exit 0 predicate true` → v5 `exit 2` (`could-not-evaluate`, pins digest `ef7ca…` ≠ frozen `81019362…3f1910655`);
J2 decoy note v4 `exit 1 predicate false` → v5 `exit 0 predicate true`; J3 honest tip v5 `exit 0 predicate true`
pinsDigest bound. C2: replace graft v2 `exit 0 predicate true` → v3 `exit 2` (`refs/replace/88f73cf2…` present,
refusing); observed tamper v2 `exit 0 predicate true` → v3 `exit 1 predicate false`
(`receiptFinding=run1: observed captureScreenshot.sha256 != transcript first screenshot`); J3 honest tip v3 reads
`predicate true, admitted 16, survivors 0, egress 0, receiptFinding null, binding null`. The do-nothing lane keeps
v4/v2: the same receipts are the red states, so the v5/v3 targets are unreachable without the amendments
(`controlsDoNothingNote`).

Contract fragments that bind the measurement (`claims.json`): every after-measurement runs
`.ufo/waves/round-37/measure.sh <REV> <OUT> <FREEZE>` in a clean clone with counters taken from the FREEZE commit, not
the worktree (`measurementRule`); no offline gate that exits 0 at the baseline may turn red, `check-selfassessment`
mismatches stay 0, census exits 0, and every prior-round prose byte of `SKILL.md`, `SCORECARD.md`, `LOG.md`,
`corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md` is append-only (`noHarmRule`).

Freeze-integrity observations this seat made statically (calibration inputs for the L1; none is a verdict):

- predicate byte identity: two of the three declared sites are byte-identical at the freeze (C1 295 B, C2 154 B,
  `claims.json` vs the counter constant). The third site (`receipt.predicateSentence`) exists in both counters
  (`c1-adjacency-sweep-v5.mjs:539`, `c2-firefox-bidi-v3.mjs:682`) and is **PENDING-MEASUREMENT** until a receipt exists.
- build tool v2: 20 frozen PINS entries, all 40 hex; kama is `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` and the header
  names the round-36 defect it repairs (`c1-drift-audit-build-v2.mjs:4-6`); per-entry `rev-parse --verify` gate at line 64.
- v5 pins binding: `DELTA_PINS_SHA256 = 8101936…10655` (`:96`) with the refusal at `:389` and the predicate term at
  `:587`. The **display modes are not bound**: `--list-delta` / `--list-drift` read the pins blob at lane HEAD (fallback
  on-disk `cat`) and never compare the digest (`:613-620`). Round-38 candidate 1 below.
- v3 hardening is present as declared: `GIT_NO_REPLACE_OBJECTS` in the git env and `replaceRefs()` enumeration before any
  blob read (`:118-123`, called at `:527`), survivor scan with a second scan after the grace sleep (`:339-341`,
  `scratchSurvivors` at `:467`), observed binder `observedFinding` at `:405`. Whether each leg behaves as declared is
  the claim's business, not this draft's.
- harness v2 names both round-36 harness defects in its header and takes `OUT` absolute; `scripts/check-freshness.mjs`
  accepts `--worktree` with `--repo` (`:48-52`), so `--worktree --repo $d` is inside its usage contract (round 36 used
  `--worktree --rev HEAD`, which exits 2 by contract).

## Round 37 — executed disposition

Measured at **PENDING-MEASUREMENT** (`measure.sh <REV> <OUT> <FREEZE>` in a clean clone, counter bytes from the freeze
`99437d2…`; provenance + no-harm receipts under `.ufo/waves/round-37/measure/`). No cell in this table is filled: the L1
replaces each one from the measured receipts and cites the receipt path.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | frozen before (v4 unbound pins; decoy note refused; 39-hex kama; sentence not one text) → **PENDING-MEASUREMENT** (fill: `drift.total` / `auditCoverage` / `auditFindings` / `staleFindings`, `completeness.unaccounted`, `delta.unaccounted`, `delta.screenFindings`, `deltaPinsSha256`, adjacency rows/verified/findings, predicate) | **PENDING-MEASUREMENT** (fill: met / not met under the frozen predicate, the three-site byte comparison result, the build-tool exit, and the score with its rubric note) |
| C2 operability | `node .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs --rev <REV> --repo <clean clone> --json` | frozen before (v2 admits the replace graft; v2 admits the observed tamper; no survivor leg; harness numstat/freshness defects) → **PENDING-MEASUREMENT** (fill: population / admitted / failing / unmeasured, binding, entry/receipt findings, live Firefox 158.0.1 + geckodriver 0.37.1 with `egressNonLoopback`, `survivors`, predicate; plus the harness numstat and freshness legs from the no-harm receipt) | **PENDING-MEASUREMENT** (fill: met / not met, the J1/J2 control directions at the measured bytes, and the score with its rubric note) |
| depth, coverage, freshness, calibration | — | no claim (calibration is measured through the no-harm leg, not a claim) | **PENDING-MEASUREMENT** for the no-harm summary only: `check-selfassessment` mismatches, census exit, gate self-test tallies, any nonzero command and whether it reproduces at baseline. Score: no claim → held unless the no-harm leg shows harm. |

### Round 37 — waves and seats

Two v1 waves. W1 build + first falsifiers: **34 seats**, frozen in `w1-dispatch.json` / `w1/swarm-registry.json` —
8 reviewer, 8 executor, 5 critic, 4 mutation-tester, 3 scribe, 2 scout, 2 connector, 1 simplifier, 1 sentinel; by
milestone 9 C1, 7 C2, 6 instruments, 6 frontier, 3 freeze, 3 claims. W2 falsify: **PENDING-MEASUREMENT** (seat count and
roster not frozen at draft time). Round total: PENDING-MEASUREMENT.

Seat completion: **PENDING-MEASUREMENT**. At draft time 11 seat directories existed and no seat had written `report.md`
(seats in flight), so this draft claims no completion credit; the L1 fills the completed/incomplete/dropped counts from
`w1-results.json` / `w2-results.json` and names any incomplete seat explicitly, as round 36 did for `RevF1`, `RevC2b`,
`MutC2b`, `ExecEgressLive` (those four took no verification credit).

Dispatch fidelity (repairs routed defect 6 in practice, not by gate): all 34 w1 task payloads in `w1-dispatch.json` carry
`/skill:godspeed\n\n` followed by bytes byte-identical to `skill://godspeed/directive.md`
(`/home/vgpnk/.agents/skills/godspeed/directive.md`, 429 B, sha256 `db88963c…27be3bb`) — 34/34, 0 deviants by exact
comparison. Round 36's w1 deviation (ASCII hyphen, paraphrased immediate-stop sentence) does not recur. Nothing in the
lane enforces this; see round-38 candidate 5.

### Round 37 — capabilities / planned / saturation / retired

No new capability entered and none is claimed: both claims repair instruments that already exist (`adjacency` drift
counter v4 → v5; Firefox BiDi counter v2 → v3 + harness v2), so `webdriver-bidi-runtime-firefox` is preserved and
remeasured rather than extended, and the round-36 method note `corpus/knowledge/adjacency-drift-audit-r36.md` is the
existing evidence whose input-binding gap C1 closes. No axis retired; saturation remains 8 / window 3; window position 2
at round 37 (round 35's capability restarted it), so the stagnation nudge is inactive.

- Planned for round 38 — **adjacency**: bind or explicitly scope the v5 display modes. `--list-delta` / `--list-drift`
  read `.ufo/waves/round-36/baseline/c1-delta-pins.json` at lane HEAD (or on disk) and never compare
  `DELTA_PINS_SHA256` (`c1-adjacency-sweep-v5.mjs:613-620` vs the refusal at `:389`), so a display consumer can be shown
  an unfrozen drifted-set with no signal; w1 `LabratC1` probes exactly this. Either refuse without the digest or label
  the output display-only and non-evidential.
- Planned for round 38 — **adjacency**: widen the moved-note grammar beyond the frozen decoy case. v5 anchors the
  canonical relocation clause; a truthful note in a different shape (multiple clauses, a quote containing a colon-digit)
  has no fixture yet (`MutC1a` m3 is the decoy half). Enumerate the accepted shapes and add one fixture per shape.
- Planned for round 38 — **operability**: give the survivor leg an injected-survivor negative control. No control in the
  frozen set flips a hard-coded `survivors = 0`; w1 `MutC2a` m3 names the gap ("if the function is module-internal,
  classify the test gap precisely"). A seam (`--survivors-fixture`) or a synthetic leftover process the counter must
  count converts an assertion into a measurement; `LabratC2` probes the scan's false-positive isolation from the other
  side.
- Planned for round 38 — **operability**: close the two C2 hardening legs that remain scope questions, not checks —
  decorations outside the bound set (`session/getTree/setViewport/captureScreenshot`; w1 `CritC2b` avenue a) and cleanup
  after an abnormal signal (v3 counts survivors only on the SIGKILL path, `:339-341`), the third leg of round-36 routed
  defect 8.
- Planned for round 38 — **calibration**: make dispatch fidelity and seat completeness gates rather than review habits.
  The w1 payload is byte-exact this round but unguarded (candidate 5 above), and the round-36 seat-completeness reading
  (4 incomplete w2 seats, zero verification credit) was hand-derived. Hash the directive block in the dispatch generator
  and cross-check the results roster against the dispatch roster.
- Planned for round 38 — **freshness**: land S143 with the existing instruments. `claims.json` cites S143 (git-replace
  manual) as C2's source; at this draft `corpus/SOURCES.md` carries 142 rows and no S143 row, so the row is w1 work in
  flight (`ScoutSrc` / `ScribeSources`). The round-38 gate is the census plus the ≤25-word quote rule, not a new tool.

### Round 37 — trend verdicts

Proposals for the L1 to confirm at integration; each names the evidence it must be confirmed against. No row below is a
finding.

| Trend | Proposed verdict | Evidence pointer to confirm |
|---|---|---|
| expansion | improved **if** S143 lands on the round's own ground | S143 is cited as C2's source in `claims.json` (git-replace manual, grounds B1). Confirm: an S143 row in `corpus/SOURCES.md` (142 rows at draft, S143 absent), mined, with a ≤25-word located quote in the lesson `## Gate`, plus the C2 note or lesson section it grounds. If the row does not land, the proposal reverts to unchanged. |
| quality | improved (provisional) | Frozen repairs are in the bytes: build tool v2 (20/20 pins 40-hex, kama `e8fa87ef…`, per-entry resolve gate at `:64`), v5 pins refusal at `:389` + canonical note parse (J2 v4 `exit 1` → v5 `exit 0`), v3 replace-ref refusal + `GIT_NO_REPLACE_OBJECTS` (`:118-123`, call at `:527`) and observed binder (`:405`), harness v2 naming both round-36 harness defects. Confirm: the after-receipts hold the declared directions at the measured bytes, and `SimplifyC1`'s YAGNI verdict on the v4→v5 / v2→v3 diffs reports no dead weight added. If any mutant survives a declared term, this row drops to unchanged. |
| discernment | unchanged (default at filing) | No outside non-author admit/reject spot-check exists at draft time; in-lane w1 seats do not qualify. Confirm at closure: a non-author spot-check of this round's source admissions (S143 at minimum) is the condition that would move it to improved. |

Integration checklist for the L1 (mechanical, so no cell is invented later): replace every `PENDING-MEASUREMENT` in the
disposition table and the waves/seats paragraph; add the measured-REV line with the receipt paths; state the three-site
predicate byte comparison per claim (two sites verified here, the third is measured); record tool installs (this seat
installed nothing; Firefox 158.0.1 / geckodriver 0.37.1 are the pinned binaries the counter names, not new installs);
keep the whole addition append-only.
