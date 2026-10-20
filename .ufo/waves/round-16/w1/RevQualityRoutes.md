# RevQualityRoutes — round-16 response map for round-15 routed defects :118-124

Seat: `TabiR16.RevQualityRoutes-5` (reviewer, leaf; no dispatch). Date 2026-10-20.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `e38d2599a922cb729186353830fff8e159b4fef0`
(observed HEAD; at first read `git status --porcelain` → only `?? .ufo/waves/round-16/`; by final
write peers had also landed `?? corpus/evidence/round-16/` and `?? scripts/webmcp-loopback-round16.mjs`,
neither in my write set).

Scope: every routed defect under `corpus/lessons/round-15-verifier-spotcheck.md:118-124`
(heading `:118`, items `:120-124`) mapped to its round-16 response as criterion, fix, or
explicit carry. Items 4-5 additionally get paste-ready honest carry wording.
No gates, selftests, counters, browsers, or installs were run (lane bounds); every
"ABSENT"/"PRESENT" below is a filesystem observation, and every digest is a command output.

## 0. Observed state (commands actually run)

```
git rev-parse HEAD                                  → e38d2599a922cb729186353830fff8e159b4fef0
git show <rev>:.ufo/waves/round-15/measure.mjs | sha256sum
  27dfd98 → 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
  b7cf044 → 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
  36240c7 → dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
  HEAD    → dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
git diff --name-only b7cf044 36240c7               → 13 paths, including
                                                      .ufo/waves/round-15/measure.mjs (the counter itself),
                                                      LOG.md, SCORECARD.md, measurements.json,
                                                      count-after-{c1,c2,c2-repaired}.json, final-production.json,
                                                      histogram-after.json, round-final-production.json,
                                                      user-final-production.json, wrapup-misroot.json,
                                                      .ufo/waves/round-15/w1/MeasureContracts.md
git merge-base --is-ancestor 9fd8bca b7cf044       → NO (9fd8bca 05:59:13 postdates b7cf044 05:51:01)
git merge-base --is-ancestor b7cf044 9fd8bca       → YES
test -e <path> (round-16 artifacts)
  ABSENT  scripts/check-measurement-binding.mjs
  ABSENT  scripts/selftest-measurement-binding.mjs
  ABSENT  .ufo/waves/round-16/measure.mjs
  ABSENT  corpus/evidence/round-16/measurement-binding.json
  ABSENT  corpus/evidence/round-16/binding/selftest.json
  ABSENT  corpus/evidence/round-16/binding/legacy-r15.json
  PRESENT corpus/evidence/round-16/binding/r15-counter-identity.json
```

Re-checked at final write: every C1 artifact above is still ABSENT; only the C2 harness
landed (`scripts/webmcp-loopback-round16.mjs` PRESENT, outside items 1-5).

The spotcheck's own digests reproduce exactly: `3ee59de0…` at `27dfd98`/`b7cf044`,
`dd9c8675…` at `36240c7`/HEAD. The delivery commit `36240c7` changed the C1 counter blob
that produced the measured count, which is defect 1's substance (not a counted-input change).

## 1. Summary map

| # (line) | Defect (short) | Round-16 response | Mechanism / anchor | Evidence target | Status |
|---|---|---|---|---|---|
| 1 (`:120`) | counter digest not recorded; which counter revision reproduces each receipt | **Criterion C1** | PLAN:9-14 claim; PLAN:40-52 per-claim `counter.sha256` + `measuredRevision`; PLAN:54-57 reasons `counter_digest_unrecorded`/`counter_digest_mismatch`/`counter_changed_since_measurement`; PLAN:64-67 `--legacy` names digests at `counterCodeRevision`/`measuredRevision`/`REV` | `corpus/evidence/round-16/binding/r15-counter-identity.json` (landed); gate + manifest + `legacy-r15.json` (absent) | **Routed; closure pending artifacts** |
| 2 (`:121`) | measured at `b7cf044`, delivered `36240c7`; measure at or diff to delivered HEAD | **Criterion C1** | PLAN:11-13 routes `:120-121`; PLAN:54 `measured_revision_not_ancestor`; PLAN:57 `counted_input_changed` = `git diff --name-only measuredRevision REV -- <countedInputs+counter>`; PLAN:53 `--at REV` (default HEAD) | same C1 manifest/receipts; DraftQuality:3 states the rule | **Routed; admission does not require delivered-HEAD run** |
| 3 (`:122`) | adopt the erratum pointer | **No counted criterion; doc fix (L1 integration)** | DraftSkill.md:37 pointer; ErratumAnchors evidence + report; five citing texts verified | `.ufo/waves/round-16/erratum-anchors.json`; `.ufo/waves/round-16/w1/ErratumAnchors.md`; target text = `corpus/lessons/round-16.md` | **Fix prepared; L1 must land it** |
| 4 (`:123`) | protocol frozen step-1/step-4 closure certification absent | **Explicit carry** | No C1/C2 criterion claims it | none by design | **Carried** |
| 5 (`:124`) | six inherited boundaries | **Explicit carry** | No ownership row touches them | none by design | **Carried** |

## 2. Item detail

### Item 1 — `:120` counter identity for C1

Defect asks two things: *record the counter digest per claim*, and *say which counter revision
reproduces each receipt*.

Round-16 answer (design, PLAN:40-52 + PLAN:64-67):

- Manifest `corpus/evidence/round-16/measurement-binding.json` carries, per claim,
  `counter.path` + `counter.sha256` (blob digest), `counter.argv`, `countField`,
  `countedInputs`, `measuredRevision`, and `before`/`after` counts.
- Gate reasons make a missing or drifting digest non-clean: `counter_digest_unrecorded`,
  `counter_digest_mismatch` (blob at `measuredRevision` ≠ recorded sha256),
  `counter_changed_since_measurement` (blob at `REV` ≠ recorded sha256),
  `counted_input_changed`, `measured_revision_not_ancestor`, `argv_unsupported`;
  with `--reproduce`: `counter_failed`, `count_not_reproduced`.
- The schema names no separate `counterRevision` field: the pair (`counter.sha256`,
  `measuredRevision`) is the revision statement, because `counter_digest_mismatch` checks the
  blob *at* `measuredRevision`. That is stronger than a revision label, which is exactly what
  the r15 pin lacked. `--legacy` adds the three named revisions for the historical record.
- `--legacy` adapts the real r15 file and "detail carries the blob digests at
  counterCodeRevision, measuredRevision and REV" (PLAN:64-67) — that is the per-receipt
  counter-revision statement the defect asks for.

Landed evidence already answers the r15 half correctly:
`corpus/evidence/round-16/binding/r15-counter-identity.json` records
`27dfd98→3ee59de0…`, `b7cf044→3ee59de0…`, `9fd8bca→dd9c8675…`, `36240c7→dd9c8675…`,
`e38d259→dd9c8675…`, plus `changedCountedInputs: []` and the 13-path delivery diff.
I recomputed all five digests independently and they match.

Nuance the report must keep: `b7cf044` (measured) still carried the old counter
`3ee59de0…`; the repair `dd9c8675…` is already at `9fd8bca`, which is *between* measured
and delivered. So the honest sentence is "the C1 count was produced by counter bytes
`3ee59de0…`, identical at `27dfd98` and `b7cf044`; the delivered HEAD ran `dd9c8675…`,
which has not been shown to reproduce that count."

Gaps: see F1, F3, F4.

### Item 2 — `:121` measured revision vs delivered HEAD

Defect requirement: "measure at, or explicitly diff to, the delivered HEAD."

Round-16 answer: the C1 claim text routes this explicitly (PLAN:10-13), and the gate
implements the "explicitly diff" half (`counted_input_changed`, PLAN:57) plus ancestry
(`measured_revision_not_ancestor`, PLAN:54). DraftQuality:3 states the quality rule
("reproduced at, or diffed to, the delivered HEAD. A revision-only pin or a measurement
taken at an older revision is not admissible").

Observed necessity: `SCORECARD.md:680-681` cite `b7cf0446…` as the measured revision while
the file itself was committed in `36240c7` — the defect's exact shape. The observed
`b7cf044..36240c7` diff is 13 paths and contains no C1 counted input
(`corpus/evidence/round-15/user-diagnostics.json`, `scripts/check-user-round-contract.mjs`),
so "no counted input drift" holds; the *counter* changed.

Gap: the admission condition (PLAN:74-77) does not require the final check to run at the
delivered HEAD or to record a measured→delivered diff. `counted_input_changed` is empty for
docs-only delivery commits, so a gate run at an earlier revision passes identically to a run
at delivered HEAD. See F2.

### Item 3 — `:122` adopt the erratum

Defect: "Future SKILL/lesson text citing round-14 Node wording should point to the erratum
section of this file."

Round-16 answer: no counted criterion (correctly — it is not a capability), but a concrete
lane fix exists:

- `DraftSkill.md:37` states the pointer and the corrected distinction, citing
  `corpus/lessons/round-15-verifier-spotcheck.md` §Erratum, lines 90-101. Verified: heading
  at `:90`, corrected statement at `:101`; the range is accurate.
- `ErratumAnchors` (assigned seat) produced `.ufo/waves/round-16/erratum-anchors.json`
  (schema `tabi-round16-erratum-anchors-v1`) and `.ufo/waves/round-16/w1/ErratumAnchors.md`:
  five citing hits (`SKILL.md:1744`, `SKILL.md:1766-1777`, `corpus/README.md:255-257`,
  `corpus/README.md:275-281`, `corpus/QUALITY.md:56-58`), zero hits in
  `corpus/knowledge/*.md`, and proposed append blocks.
- I re-opened the cited texts: README:255-257 ("Observed Node26.12.0 differs from
  descriptive24.21.0/minimum20"), README:275-281 (named qualification, "corrects the outside
  review's overbroad non-enforcement inference without rewriting it"), QUALITY:56-57
  ("Runtime metadata distinguishes observed, minimum-enforced and descriptive recorded
  versions"). None reproduces the superseded "never enforces" claim; the gap is the missing
  pointer index, exactly as the seat reported.

Status: **fix, not carry**, conditional on L1 landing the pointer paragraph in a
round-16-owned file. See F5 for the append-target problem.

### Item 4 — `:123` protocol/operator closure certification

No round-16 criterion supplies it. C1's measurement-binding gate is a lane gate over the
lane's own counters; the WebMCP harness is an observation, not a closure checker. Its
honest disposition is an explicit carry (wording in §3).

### Item 5 — `:124` inherited boundaries

No round-16 ownership row touches `scripts/check-user-round-contract.mjs`, the r07 survivor
replay, user-record freezing, IPv6 origin classification, hostile-parent Git
environment/hooks/config/PATH trust, or external-validator pinning. C2 is loopback
`127.0.0.1` only and does not classify public origins; C1's minimal Git env covers only the
new gate's own subprocesses. Honest disposition: explicit carry (wording in §3).

## 3. Honest carry wording (paste-ready, status-neutral)

Item 4:

> 4. **protocol/operator — frozen step-1/step-4 closure-checker certification** for the
> round-16 inputs remains absent. No round-16 criterion supplies, substitutes for, or
> certifies it: C1's measurement-binding gate is a lane gate over the lane's own counters,
> and the WebMCP harness is an observation, not a closure checker. Manual checks in this
> round do not substitute. Carried unchanged as status-neutral protocol/operator debt.

Item 5:

> 5. **Inherited boundaries retained; none discharged by round 16:** USER production remains
> failed 6/10 (`SCORECARD.md:698`; the USER gate is outside this round's write set); r07
> survivor replay, user-record freezing, IPv6 origin classification (C2 is loopback
> `127.0.0.1` only), Git environment/hooks/config/PATH trust (C1's minimal Git env is
> scoped to the new gate's own subprocesses), and external-validator pinning remain
> uncredited. None is a round-16 counted input.

These match the precedent wording at `corpus/lessons/round-13-verifier-spotcheck.md:161-162`,
`corpus/lessons/round-14.md:48`, and `corpus/lessons/round-15.md:13,50`, and add the
round-16-specific reason each stays open.

## 4. Findings by severity

**F1 — high (item 1 closure). C1 admissibility never reads the real manifest.**
`PLAN.md:74-77` lists the C1 counter's admission conditions: gate blob, committed
`binding/selftest.json`, committed `binding/legacy-r15.json`. It never requires
`corpus/evidence/round-16/measurement-binding.json` (defined at `PLAN.md:40`) to exist,
parse, or pass `--check`. Consequence: C1 can count 1 while round-16's own claims have no
recorded counter digest/measured revision — the defect-1 remedy is exercised on fixtures and
the legacy r15 record, but never applied to this round's claims. Fix: add to the condition
"`--check corpus/evidence/round-16/measurement-binding.json --at REV` exits 0 with claims
covering C1 and C2", and name that manifest in the ownership table (currently only L1's
catch-all receipt clause covers it).

**F2 — high (item 2 closure). No delivered-HEAD requirement in admission.**
`PLAN.md:53` makes `--at REV` optional with default HEAD, and `PLAN.md:74-77` gates only on
the two receipts. `DraftQuality.md:3` asserts "reproduced at, or diffed to, the delivered
HEAD" but no receipt records the delivered revision or the crude diff. Fix: require the
final C1 receipt to name `deliveredRevision` (40-hex) and embed the output of
`git diff --name-only <measuredRevision> <deliveredRevision>` (empty, or justified paths),
or run the gate after the final commit so `REV` *is* the delivered HEAD.

**F3 — high (item 1 evidence path mismatch). `legacy-r15.json` vs `r15-counter-identity.json`.**
`PLAN.md:76` requires `corpus/evidence/round-16/binding/legacy-r15.json` (a gate run with
exit 1), but `PLAN.md:105` assigns BindLegacyEvidence
`corpus/evidence/round-16/binding/r15-counter-identity.json`, which is what actually landed.
As written, the C1 counter's second condition cannot be satisfied by the landed file, and
the landed file is raw digest evidence rather than a gate receipt. Fix: after BindCore
lands, produce the gate receipt at one canonical path
(`node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --json`,
expected exit 1) with captured exit/stdout, and amend `PLAN.md:105` (or `:76`) so the two
names agree. Expected reasons on the real file: `counter_digest_unrecorded` and
`counted_inputs_undeclared` for C1 and C2, plus `counter_changed_since_measurement` for C1
only (C2's `counterCodeRevision` blob equals the REV blob).

**F4 — medium (item 1 honesty). `--legacy` has no counter-vs-measured ancestry check.**
Observed: r15 C2's `counterCodeRevision` is `9fd8bca` (`measurements.json:131`) while
`measuredRevision` is `b7cf044` (`measurements.json:4`); `9fd8bca` *postdates* `b7cf044`
(merge-base check: NO/YES above), and `count-after-c2-repaired.json:27` still prints
`"revision":"b7cf044…"`. That is a second identity conflation of the same family as
defect 1, not named by the outside spotcheck. The planned three-digest detail exposes it
only to a reader who already knows to compare ancestry. Fix: emit
`counter_revision_postdates_measurement` (or a detail boolean
`counterCodeRevisionIsAncestorOfMeasuredRevision`), and disclose the r15 C2 ordering in
`corpus/lessons/round-16.md`.

**F5 — medium (item 3 landing). Primary erratum append conflicts with immutability.**
`erratum-anchors.json:66-72` proposes appending a new section to
`corpus/lessons/round-15-verifier-spotcheck.md` at EOF. `PLAN.md:114` says "Historical
evidence, prior lessons and outside verifier files are immutable." The round-8/9 precedent
("closed by erratum, not by editing archived bytes") appends to archive receipts, and the
round-14→15 erratum was recorded in the *next* file, not appended to the old one. Fix: land
the companion paragraph (the round-16 lesson block, `erratum-anchors.json:77`) only; if L1
rules that EOF appends are permitted, record that ruling explicitly so the immutability
claim is not silently relaxed.

**F6 — low (reporting). DraftLog carries the list but no dispositions.**
`DraftLog.md:14-20` restates defects 1-5; its last line leaves "which of round-15 routed
1-5 are closed by a counted move and which carry forward unchanged" as PENDING. Paste §1's
status column and §3's wording at integration so the round-16 close names each one.

## 5. Residual risk and verification gaps

- The C1 gate, counter, manifest, and both binding receipts are ABSENT at this read
  (`test -e` output in §0). Items 1-2 are mapped at contract level, not executed; the C1
  counter would evaluate 0 at this instant. Re-check F1-F3 against the landed artifacts.
- I ran no gate, selftest, counter, or browser (lane bounds), so I assert no count and no
  WebMCP behavior. All digests above are from `git show | sha256sum`.
- I did not assess the WebMCP C2 claim beyond confirming it does not intersect items 1-5.
- `r15-counter-identity.json` independently corroborates my digest computation
  (`counterDigests` block matches byte-for-byte).
- No tool installs or updates were needed or performed (pacman pause honored).
