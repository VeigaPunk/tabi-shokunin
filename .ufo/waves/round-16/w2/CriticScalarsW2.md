# CriticScalarsW2 — round 16 wave 2 (reviewer, leaf), 2026-10-20

Seat `TabiR16.CriticScalarsW2`. Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3`
(measured revision; commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + the C2 counter repair).
Baseline: `e38d2599a922cb729186353830fff8e159b4fef0`.

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. I wrote only this report. Everything else was
read-only; the WebMCP harness was run once with `--out /tmp/<unique>.json` (loopback only). I installed
or updated nothing, started no background jobs, committed nothing, and re-opened no source URL (my item
does not rest on a source-truth claim; the freshness reading below uses the committed rows only).

## Attack item

**Question:** Should any scalar move at `b444ca8` (recorded axes: coverage 9, operability 8)?

**Verdict: HOLDS — no scalar moves at `b444ca8`; every delta is 0.** The two proposed raises fail on
the lane's own committed precedent and on snapshot state:

- **coverage 9→10: REJECT** (BREAKS if asserted). Structurally identical to round 13, which held
  9→9 after a real loopback experiment and a new capability; round 12's 9→10 was proposed and
  withdrawn. The round closes one build-scoped slice of one frontier row and names four new opens.
- **operability 8→9: UNPROVEN** (BREAKS if asserted as fact). No re-derivable denominator, the
  lane's own USER production gate is still red at this snapshot, and the binding manifest that makes
  the new contract runnable at the delivered revision is **not committed** (a clean checkout of
  `b444ca8` fails the documented `--check` with `manifest_unreadable`, exit 2).

This is an author-side review, not non-author certification.

## 1. The snapshot's scalar state is literally unchanged

```text
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ git rev-parse HEAD
b444ca8e024f386124418169e8e400221524bba3

$ git diff --stat e38d2599a922cb729186353830fff8e159b4fef0 b444ca8e024f386124418169e8e400221524bba3 -- SCORECARD.md
(no output; exit 0)

$ git diff --stat e38d2599a922cb729186353830fff8e159b4fef0 b444ca8e024f386124418169e8e400221524bba3 -- LOG.md
(no output; exit 0)

$ git show b444ca8:SCORECARD.md | sed -n '403,406p'
| After | depth | coverage | operability | freshness | calibration | adjacency |
|---|---|---|---|---|---|---|
| user-20261015-r06 (start) | 8 | 8 | 7 | 8 | 8 | 8 |
| kaika-fleet-round-1 (claimed) | 8 | 9 | 8 | 8 | 9 | 8 |

$ git show b444ca8:SCORECARD.md | grep -c 'Round 16'
0
```

`SCORECARD.md` and `LOG.md` are byte-identical to the baseline; the axes table's last row is still the
outside-admitted kaika row (`corpus/lessons/round-1-verifier-spotcheck.md:17`, ADMITTED at `5cdc976`).
The round-16 scalar block does not exist at the delivered snapshot, so this verdict is prospective for
L1 integration: the only honest block is six 0-deltas.

## 2. What the two claims actually count (both verified)

```text
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
{"revision":"e38d2599...","c1_binding_contracts":0,"gateSha256":null,"selftestSha256":null,
 "failures":["gate or selftest absent at revision"],"counterBlobAtRevisionSha256":"e3b0c442...b855",
 "inputsRead":[...]}
EXIT=0

$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8e...","c1_binding_contracts":1,
 "gateSha256":"5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":0,"cases":43,
             "summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13",
             "bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,
           "findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],
                       "C2":["counted_inputs_undeclared","counter_digest_mismatch"]},
           "at":"36240c70ee114347a79abb91cacab6c63044ce36"},
 "failures":[],"counterBlobAtRevisionSha256":"bda4e18e...b88f9"}
EXIT=0

$ node .ufo/waves/round-16/measure.mjs e38d2599... --claim C2
{"revision":"e38d2599...","c2_webmcp_held":0,
 "failures":["note, receipt or harness absent at revision"], ...}
EXIT=0

$ node .ufo/waves/round-16/measure.mjs b444ca8e... --claim C2
{"revision":"b444ca8e...","c2_webmcp_held":1,
 "cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":["flags-off-negative-control","devtools-domain-disabled","declarative-form-tool",
            "imperative-model-context","lifecycle-removal","navigation-clears-tools",
            "declarative-missing-name","model-context-location","frame-tools",
            "opaque-sandboxed-iframe","data-url-declarative"],
 "failures":[], ...}
EXIT=0
```

Both counts are 0→1 at the named revisions, exactly as claimed. The C2 evidence is real, not
receipt-shaped: I reproduced it from the committed harness.

```text
$ sha256sum scripts/webmcp-loopback-round16.mjs
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  scripts/webmcp-loopback-round16.mjs
$ git show b444ca8:scripts/webmcp-loopback-round16.mjs | sha256sum
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  -

$ node scripts/webmcp-loopback-round16.mjs --out /tmp/tabi-r16-critic-18184.json
WEBMCP_CASE id=flags-off-negative-control status=pass
WEBMCP_CASE id=devtools-domain-disabled status=pass
WEBMCP_CASE id=declarative-form-tool status=pass
WEBMCP_CASE id=imperative-model-context status=pass
WEBMCP_CASE id=lifecycle-removal status=pass
WEBMCP_CASE id=navigation-clears-tools status=pass
WEBMCP_CASE id=declarative-missing-name status=pass
WEBMCP_CASE id=model-context-location status=pass
WEBMCP_CASE id=frame-tools status=pass
WEBMCP_CASE id=opaque-sandboxed-iframe status=pass
WEBMCP_CASE id=data-url-declarative status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/tabi-r16-critic-18184.json
EXIT=0
```

The retained first failure is also real: `receipt-first-run-failed.json` has `verdict=fail`,
`passed=8 failed=3`, with the three failures named (`navigation-clears-tools registered=[search]
removed=[]`; `frame-tools tool not observed: childSearch`; `opaque-sandboxed-iframe … sandboxedAdded=0`).
The first-run receipt records those three failures as `findings` with `verdict=fail`; the note keeps it
unmodified as the pre-repair run (§Corrections). The current `receipt.json` `producerSha256` equals the
committed harness blob (`961874e4…`).

## 3. Scalar verdicts, axis by axis

| Axis | Recorded → honest after | Verdict for round 16 | Basis |
|---|---|---|---|
| depth | 8→8 | unchanged | Precision of one build's held contract; no broader protocol/browser mastery claim. Same class as r13's 8→8. |
| coverage | 9→9 | improved narrowly, **no scalar move** | One runtime-held build slice + capability; r13 precedent (9→9) and r12 withdrawal; 4 new opens named. |
| operability | 8→8 | improved narrowly, **no scalar move** | New gate + selftest + real-history oracle, but it is repair of measurement identity (r15 routed defects), not a new rung; USER still red. |
| freshness | 8→8 | unchanged (at most improved narrowly; no scalar) | S020 queued→mined and S030–S036 opened with access date 2026-10-20, but no existing note claim is re-verified; r12's bounded rechecks scored 8→8. |
| calibration | 9→9 | unchanged | First-run failure and the pre-repair count-0 retained; rejected rows S038/S039 kept with reasons and flips; no overreach found. |
| adjacency | 8→8 | unchanged | S037 (MCP tools) is queued as adjacency, not absorbed; loopback-only perimeter retained. |

Only the two named axes had any case for a move; neither clears the bar. Depth, calibration and
adjacency were never in play.

## 4. Why coverage 9→10 is rejected

- **Exact structural precedent.** Round 13 was "coverage + capability": a real isolated loopback
  demonstration on previously docs-only ground plus a capability row — and it stayed **9→9**
  (`SCORECARD.md:537` for the 9→9 row, `:546` for the C2 claim, `:552`: "Every ordinal delta is0").
  Round 16 has the same shape at `b444ca8`: one loopback demonstration on previously
  unprobed ground plus `webmcp-cdp-observation`. Treating it as 10 would treat like cases differently.
- **The lane already withdrew this exact move.** Round 12's block: "The frozen wave initially proposed
  freshness8→9 and coverage9→10. Critic … correctly rejected treating an added note as a full
  expertise fraction. Those increments are withdrawn: **scalar delta0** on both axes"
  (`SCORECARD.md:466-469`). The non-author closure recorded "scalar stays9"
  (`corpus/lessons/round-12-verifier-spotcheck.md:132`).
- **Capabilities are not axes.** `AXES.md:59`: "The six axes measure the quality of what the skill
  knows; they do not measure what the shokunin can now do." A new repertoire row is not a coverage
  numerator.
- **The frontier got wider, not narrower.** The committed round-16 README block names the new opens
  explicitly: "Still open: real-site WebMCP (needs operator approval), agent-side consumption of page
  tools, tool invocation as committed evidence, any unflagged/default-profile claim, and the
  extension↔daemon handshake, real-site rate/rights and real-site journey rows"
  (`corpus/README.md:299-303`). One row moved to "held for Chromium 154 only"; four new opens appear
  in the same paragraph.
- **The province denominator did not move.** `PROVINCE.md:6-13` lists seven surfaces; WebMCP is a CDP
  domain under "CDP session discipline", already governed. No new province numerator.
- **10 is the ceiling** (`AXES.md:79`); reaching it makes the axis eligible for retirement or split
  (`AXES.md:37-38`). With the held fraction still low, a 10 would assert saturation and destroy
  headroom for the remaining frontier.
- **The 9 is already a count, not a fraction.** The outside admission recorded it "as a note/row
  count, not the AXES fraction" (`corpus/lessons/round-1-verifier-spotcheck.md:17`). More count
  increments do not convert it into a fraction.

## 5. Why operability 8→9 is not supported

- **The one admitted move crossed a zero.** Kaika moved 7→8 when the repo had **no** repo-local gate
  scripts and got `scripts/check-sources.mjs` plus a 26-case selftest. `ls scripts/` at this snapshot
  already shows six `check-*` gates plus seven other scripts (harnesses, aggregators, selftest);
  C1 adds a seventh gate and is a repair of
  measurement identity for the r15 routed defects (`PLAN.md:10-13`), not a new rung. Round 13's own
  wording is the same logic: "restoring compatibility is not two newly clean full gates"
  (`SCORECARD.md:538`).
- **The operability signal is contradicted by a lane-owned red gate.** `AXES.md:13`: "A checklist
  item can be run and produces the stated outcome." At `b444ca8`:

  ```text
  $ node scripts/check-user-round-contract.mjs
  USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10
  EXIT=1
  ```

  This is the pre-existing red named in rounds 13–15 (`SCORECARD.md:698`, "Final committed docs
  production: ROUND clean10 exit0; USER failed6/10 exit1"). Nothing in round 16 fixes it, and no
  outside ruling puts it out of scope.
- **No re-derivable denominator exists.** There is no committed count of production gates
  clean-at-HEAD over the gate set, before and after. Without it a step is an opinion — the exact thing
  `AXES.md:53-54` names ("a score no reader can re-derive is an opinion, not a measurement").
- **The new contract's own manifest is not at the delivered revision.** This is the decisive new
  falsifier, measured this session:

  ```text
  $ git ls-tree b444ca8 -- corpus/evidence/round-16/measurement-binding.json
  (no output)

  $ D=$(mktemp -d /tmp/tabi-r16-clean-XXXXXX)
  $ git archive b444ca8e024f386124418169e8e400221524bba3 | tar -x -C "$D"
  $ test -e "$D/corpus/evidence/round-16/measurement-binding.json" && echo PRESENT || echo ABSENT
  ABSENT

  $ cd "$D" && node scripts/check-measurement-binding.mjs \
      --check corpus/evidence/round-16/measurement-binding.json \
      --at b444ca8e024f386124418169e8e400221524bba3 \
      --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --reproduce
  MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0
  finding claim=- reason=manifest_unreadable detail=/tmp/tabi-r16-clean-XXXXXX/corpus/evidence/round-16/measurement-binding.json: ENOENT: no such file or directory, open '…'
  EXIT=2
  ```

  The worktree manifest itself is correct and does bind both claims — with it present, the check is
  clean:

  ```text
  $ node scripts/check-measurement-binding.mjs \
      --check corpus/evidence/round-16/measurement-binding.json \
      --at b444ca8e024f386124418169e8e400221524bba3 --reproduce
  MEASUREMENT_BINDING verdict=clean claims=2 bound=2
  EXIT=0
  ```

  But an untracked artifact is not a delivered one. A verifier checking out `b444ca8` cannot run the
  documented command; the operability artifact is therefore *not* re-derivable at the revision the
  scalar would be pinned to. `git status --short` at review time confirms the file is untracked
  (`?? corpus/evidence/round-16/measurement-binding.json`).
- **It is meta-tooling, not domain operability.** The gate checks that the lane's measurements are
  identity-bound (calibration-adjacent hygiene). It adds no runnable browser or web-interaction
  artifact; the round's browser artifact is C2, and C2 is a coverage/capability move.
- **Author-side only.** Every round-16 seat is the lane, and a dispatched subagent does not count as a
  non-author reviewer (`AXES.md:47-49`); no non-author has executed the gate for this round. A move
  with no outside execution has weaker footing than kaika's, which the outside reviewer admitted after
  post-review fixes.

## 6. No axis is harmed (admission precondition, `AXES.md:35`)

```text
$ node scripts/check-freshness.mjs --worktree
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
EXIT=0

$ node scripts/check-round-contract.mjs
ROUND_CONTRACT verdict=clean rounds=10 consequential=0
EXIT=0

$ node scripts/check-user-round-contract.mjs
USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10
EXIT=1                       # same pre-existing red as r13/r14/r15; not introduced here

$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
EXIT=0

$ node scripts/check-sources.mjs --self-test | tail -1
SOURCES_SELFTEST verdict=clean cases=26
EXIT=0

$ node scripts/check-measurement-binding.mjs --self-test | tail -1
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
EXIT=0

$ node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json \
    --at 36240c70ee114347a79abb91cacab6c63044ce36
MEASUREMENT_BINDING verdict=failed claims=2 bound=0
finding claim=C1 reason=counted_inputs_undeclared …
finding claim=C1 reason=counter_changed_since_measurement …
finding claim=C1 reason=counter_digest_unrecorded …
finding claim=C2 reason=counted_inputs_undeclared …
finding claim=C2 reason=counter_digest_mismatch …
EXIT=1                       # the documented expected red on real r15 history
```

Sources/notes moved exactly as the claims say, and the map is complete:

```text
$ node .ufo/waves/round-16/measure.mjs e38d2599... --histogram
{"sources_rows":29,"tiers":{"A":23,"B":4,"C":2},"status":{"mined":24,"queued":3,"rejected":2},"knowledge_notes":32,...}
$ node .ufo/waves/round-16/measure.mjs b444ca8e... --histogram
{"sources_rows":39,"tiers":{"A":31,"B":4,"C":4},"status":{"mined":32,"queued":3,"rejected":4},"knowledge_notes":33,...}

$ (note-map diff at b444ca8)  notes=33 mapped=33
--- unmapped --- (empty)
--- extra mapped --- (empty)
```

The round touched no ARIA metadata inputs (`git diff --name-only e38d259 b444ca8 -- corpus/evidence/round-13 scripts/check-aria-metadata.mjs` → 0 paths), so the ARIA gate is out of this harm map, not skipped evidence.

## 7. Integration findings for L1 (not scalar moves)

1. **Commit `corpus/evidence/round-16/measurement-binding.json`.** Until it is committed, the
   documented `--check … --reproduce` cannot run from a clean checkout of the measured revision
   (exit 2, `manifest_unreadable`, observed above). This is a delivery gap, not a reason to raise
   operability; it *blocks* operability 9 under any reading.
2. **Land the round-16 SCORECARD block with six 0-deltas** and the capability row. At `b444ca8`
   neither exists (`SCORECARD.md` and `LOG.md` byte-identical to baseline; canonical `## Capabilities`
   table still "— none yet —"). The `webmcp-cdp-observation` row enters only through the integration
   round that lands the receipt; the demonstration itself is real (I reproduced 11/11).
3. **Attribute C2's "0 at A" to the counter version.** With the repaired counter, `--claim C2` at
   `8f7feb3` returns 1 (I ran it). The retained 0 is the pre-repair counter blob
   `4eb82895…` reading the display label as a fixture path (`count-after-c2-first-counter-defect.json`,
   `counterBlobAtRevisionSha256: 4eb82895…`, `failures:["case data-url-declarative fixture digest"]`).
   The receipt is honestly labeled; the scorecard/LOG wording must say "counter-version-bound", not
   imply the capability was absent at A. This is precisely the r15 routed defect class the new gate
   exists to catch.
4. **[INF, not adjudicated here]** The manifest's `countedInputs` match the counter's own `inputsRead`
   for C1 (observed set = declared set: round-15 measurements, gate, selftest). Transitive Git reads
   performed inside the materialized gate (e.g. the round-15 counter blob at
   `counterCodeRevision`) are not in the declared list. Whether `counted_input_changed` should cover
   them is a gate-design question owned by the C1 mutation seats; I did not probe it.
5. **Keep the operability threshold in Planned, not in the score.** If L1 writes 9, no reader can
   re-derive it; if L1 writes 8 with the threshold, the next round has a falsifiable target. The
   threshold observed here: a committed gate-set denominator with before/after values, USER green or
   a non-author scope ruling, both claims bound by a committed manifest at delivered HEAD, and a
   non-author execution.

## 8. Commands run / not run

Run (all read-only except the harness writing to `/tmp/tabi-r16-critic-18184.json`): the two counters
at `e38d259`, at `8f7feb3`, and at `b444ca8`; the counter histograms at both revisions; the binding
gate `--check --reproduce` (worktree manifest) and `--self-test` and `--legacy`; the clean-archive
`--check` probe; the WebMCP harness; the freshness, round-contract, user-round-contract and sources
gates plus sources selftest; the note-map diff; `git show/diff/ls-tree/archive/log/status`.

Not run, and not claimed: the ARIA metadata gate (no touched inputs), the fleet census, any source
URL re-open, and any gate mutation probe (owned by other seats). No tools installed or upgraded.

**Bottom line: HOLDS. Coverage stays 9, operability stays 8, and every other axis stays as recorded.
The round's real products — the 0→1 counters, the 11/11 loopback receipt, the retained failures, the
13-reason selftest — are improvements in verdict, not in scalar; that is the lane's consistent
r12–r15 convention, and any positive delta at `b444ca8` would be an unre-derivable opinion.**
