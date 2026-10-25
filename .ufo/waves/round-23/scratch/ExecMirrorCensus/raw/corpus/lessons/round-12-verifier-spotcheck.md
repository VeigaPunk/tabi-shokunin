author: hyaku closure (non-author integrator, @m_strong)

# tabi round 12 — independent closure and discernment spot-check

Date: 2026-10-20. Non-author integrator: CloseTabiR12, dispatched by the orchestrator,
not by tabi. Read-only closure reviewers: CloseTabiR12.C1Review,
CloseTabiR12.C2GateReview, CloseTabiR12.NoHarmReview. No lane-authored file changed.

**Decision: status=ok; admitted=true.** C1 and C2 verify as bounded documentary
improvements; no axis is harmed. The optional collector-timing precision was disputed
by reviewers; the integrator's ruling and reasons are recorded below, not suppressed.
No new runtime capability, browser execution, promotion or scalar increase is admitted.

## Dispatch and report conformance

Immutable digest copied from the closure assignment (the live watchdog log is mutable):

```text
2026-10-20T01:00:45-03:00 launch tabi round=12 pgid=651903 driver=hyaku-inline attempt=1
2026-10-20T01:16:16-03:00 complete tabi round=12; hyaku-inline attempt=1
```

Report: fleet `.ufo/reports/round-12/tabi.md`, a substantive report, not a marker.
`git log -1 --format='%an <%ae> %H' -- .ufo/reports/round-12/tabi.md` observed:

```text
tabi-shokunin <tabi@shokunin.local> e0e6f3ad3ac76dab50c049e821b29f5451b4a181
```

The add-file history also attributes the report to this same lane commit. Its commit
clock is 2026-10-20T01:16:03-03:00, after lane content commit
`0d82098e8151ac8c1f58f55716b9f6569bd1844a` at 01:13:51-03:00 and final measured
commit `37ffbef29486ec93e004a4d3e39fdfa78006024d` at 01:14:42-03:00. Both lane
commits carry `tabi-shokunin <tabi@shokunin.local>`. Report sections are in contract
order; `## SHONEN` assesses all four boxes as `[~]` with evidence pointers.

Commands run before this verifier artifact existed (lane cwd):

```sh
git status --porcelain
git rev-list --count @{u}..HEAD
git log -1 --format='%H %an <%ae>'
git merge-base --is-ancestor f032f2dccc8a99632eea52edafa8220284b5c919 HEAD
git merge-base --is-ancestor 0d82098e8151ac8c1f58f55716b9f6569bd1844a HEAD
git merge-base --is-ancestor 37ffbef29486ec93e004a4d3e39fdfa78006024d HEAD
git merge-base --is-ancestor 5cdc976 HEAD
```

Observed: empty porcelain, ahead count `0`, HEAD
`37ffbef29486ec93e004a4d3e39fdfa78006024d tabi-shokunin <tabi@shokunin.local>`;
all four ancestry commands exit 0. No uncommitted round work was present.

Prompt `.ufo/prompts/tabi-round-12.md` is committed at fleet
`f8a96a4ecabe01f0ab1fce9ad8bb5e82f7e82bdb`. A Node comparison rendered the
140-line fleet `templates/round-prompt.md` using LANE=tabi, ROUND=12,
FLEET_ROOT=/home/vgpnk/Projects/shokunin, AXES=`coverage + calibration (browser
and web-interaction craft)`, and `<tabi-repo>`=tabi-shokunin; observed
`template_contract_prefix_match=true`, `template_lines=140`,
`shonen_boxes=true`, `campaign_addendum=true`. All five child-lane contract items
are present. The addendum's absolute `reportDir` instruction contradicts the validator;
the lane disclosed the refusal and used the operator-confirmed lane-relative directory.
Its explicit host route/planner ruling is operator-authorized, not a silent route change.

Committed dispatch metadata contains 32 tasks; registry contains 32 members.
Role census from dispatch.taskCall.tasks: connector4, critic4, executor5, revenger1,
reviewer6, scout9, scribe2, sentinel1. L1 planner mapping is explicit in the report.
This inspection confirms persisted dispatch evidence, not an invented second dispatch.

## Claims: committed counting commands and semantic re-check

Lane cwd: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

```sh
node .ufo/waves/round-12/measure.mjs f032f2dccc8a99632eea52edafa8220284b5c919
node .ufo/waves/round-12/measure.mjs 37ffbef29486ec93e004a4d3e39fdfa78006024d
```

Both exit 0; observed stdout:

```json
{"revision":"f032f2dccc8a99632eea52edafa8220284b5c919","source_rechecks":0,"accessible_locator_entry":0}
{"revision":"37ffbef29486ec93e004a4d3e39fdfa78006024d","source_rechecks":3,"accessible_locator_entry":1}
```

- **C1 freshness: verifies, improved, 0→3 bounded source-claim reviews.** A separate
  `git show REV:PATH`/Node SHA-256 comparison found before/after digests true for all
  three records in `corpus/evidence/round-12/source-recheck.json`. Source reopening by
  C1Review verifies the same-port IPv4/IPv6 factory versus approval-mode port-zero
  fallback; S011's literal CDP “remains unchanged” sentence; the dated BiDi spec/anchors;
  retry classifications, worker restart, trace-on-first-retry, waiting/assertion split,
  and the Version 1.64 shuffle announcement. Rolling-stable qualification is supported.
  The counter counts reviews with dispositions, not source-truth certification, browser
  support, full-note freshness, paper/abstract rechecks, or WPT implementation results.
- **C2 coverage: verifies, improved, 0→1 docs-held entry.** The entry carries the
  provenance trio, mined S023/S024/S025 citations and used-by paths, README coverage row,
  lesson admission and SKILL integration. All three official sources were independently
  reopened; accessible locator/partial template semantics and audit boundaries agree.
  This is new previously queued coverage-map ground, not a coverage fraction or runtime
  capability. The correction dossier is not counted as a second coverage acquisition.
- These claims are causally separable: C1 reads three review records/note digests; C2
  reads the accessible entry and its registry/index/admission links. No capability or
  exploratory claim was declared, so no runtime demonstration or taste admission is owed.

### Disputed BiDi timing precision — integrator ruling

C1Review initially described matrix `webdriver-bidi-capability-matrix.md:71` as a
contradiction, then clarified that it is an **under-specified necessary condition, not
a flat contradiction**, but still recommended treating “mappings confirmed” as
unprovable/calibration harm. NoHarmReview independently disagreed.

The dated WD §7.5.2 body-cloning steps require collectors at response creation/clone
time; its note says “there are no collectors setup when the response is created”.
The matrix says a collector must exist “when the response body is collected”, says
“No CDP-style after-the-fact body command” in that same row, and separately states
“not a drop-in after-completion” at :87–88. The named addDataCollector/getData/disownData
mapping is correct. The existing wording does not claim later collector registration
recovers an earlier response. Its necessary condition is true, though less operationally
precise than the source. FreshBidi:158–177 itself labels R1 optional precision and also
recommends carrying it. **Ruling: C1 verifies; no harmed calibration/freshness axis.**
Route the omitted precision as debt, without upgrading a true but incomplete condition
into a false assertion. This ruling does not certify every matrix detail or any runtime.

## Per-axis and learning-trend verdicts

`git diff f032f2dccc8a99632eea52edafa8220284b5c919 37ffbef29486ec93e004a4d3e39fdfa78006024d -- SCORECARD.md`
observed 67 insertions, zero deletions; round-12 scores remain 8/9/8/8/9/8.
PROVINCE, SHONEN and legacy scripts are unchanged in this round's diff.

| Axis | Verdict | Evidence/boundary |
|---|---|---|
| depth | unchanged | No removed knowledge or newly certified runtime/protocol support; source-only detail is scoped. |
| coverage | improved | C2 0→1 sourced, admitted, indexed docs-held entry; scalar stays9. |
| operability | unchanged | Existing red legacy-gate debt is not cleared or weakened; no runtime capability claimed. |
| freshness | improved | C1 0→3 substantive source comparisons with corrections/qualification; scalar stays8. |
| calibration | unchanged | Withdrawn unsupported scalar increases and author/non-author boundary are explicit; timing precision ruling above. |
| adjacency | unchanged | Province/refusal routes retained; no publishing, secrets, forensic or accessibility-certification scope absorbed. |

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | Accessible-selector frontier now has a mined-source knowledge entry and coverage-map row, README:208–215. |
| quality | improved | False factory conflation explicitly superseded; retry version scope qualified; no false admitted claim established by this recheck. Historical unreviewed dates are retained. |
| discernment | improved | This actual non-author closure agrees with both the admit and reject below; QUALITY14 also learns the earlier outside inference/observation disagreement. The lane's pending-review `unchanged` was honest at report time. |

## Outside Gate spot-check and source census

Access date: 2026-10-20. Sources reopened by closure reviewers, with S024 also reopened
by the integrator using the reader. Quotes below are each ≤25 words.

| Item | Decision | Re-opened source / located quote | Agree/disagree | Reason |
|---|---|---|---|---|
| Accessible-locator/ARIA knowledge entry | admit | [S023 Locators](https://playwright.dev/docs/locators), Locate by role: “role locators do not replace accessibility audits and conformance tests”; Locating elements gives action-time re-resolution. | agree | Role/name selection, strictness and evidence boundaries are documentary, with runtime explicitly unknown. |
| Default partial ARIA template as whole-tree equality | reject | [S024 Snapshot testing](https://playwright.dev/docs/aria-snapshots), Strict matching: “contain (default): Matches if all specified children are present in order.” Partial matching ignores omitted names/states. | agree | A default subset constraint cannot establish whole-tree equality; chosen children modes and listed fields matter. |
| S024 touched row / Gate quote | queued→mined; used-by set | Same source, Aria snapshots: “A template is a constraint, not necessarily a complete serialization of the accessibility tree.” | agree | Exact Gate quote is present; 16 whitespace-separated words, below25. Structural-not-pixels is grounded synthesis, not a literal source quote. |
| S025 supporting authoring scope | supporting admit | [APG Home](https://www.w3.org/WAI/ARIA/apg/): “This guide describes how to apply accessibility semantics to common design patterns and widgets.” | agree | Authoring scope, not an audit oracle or opened per-widget keyboard contract. |

**No newly written registry row exists:** registry rows28→28, A22/B4/C2 unchanged;
mined20→23, queued6→3, rejected2→2. Thus a new-row sample is inapplicable, not fabricated;
a newly mined/touched S024 row and its round-12 located quote were sampled instead.
S023/S024/S025 source SHA-256 values matched the entry's recorded hashes on independent
re-fetch. Immutable original opened/anchor dates correctly remain 2026-10-19; reopening
dates are in the lesson, not unauthorized edits to immutable registry cells.

Ran, exit0:

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

Observed:

```text
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

The report's Node source histogram command was also rerun at both specified revisions;
its row/tier/status JSON matched report:131–132 exactly.

## Gate evidence, inherited debt and routed next-round items

No sibling gate/self-test was executed by this closure. Per PROTOCOL Gate standard,
committed receipts were inspected instead: sources self-test26 clean cases; mistake
self-test9/9; mistake red exit1 `observation_without_runtime`, green exit0; sources live
exit0 with28 rows/no findings. The registered mistake expected.json pins three fixture
digests; `git show 37ffbef:PATH`/Node SHA-256 comparisons observed all three true.
Synthetic runtime fixture is a schema control, never a browser observation.

NoHarmReview's static prefix command (not a legacy-gate pass):

```sh
node -e "const {execFileSync:g}=require('node:child_process');for(const p of ['LOG.md','SCORECARD.md','SKILL.md','PROVINCE.md','corpus/QUALITY.md','corpus/README.md']){const s=r=>g('git',['show',r+':'+p]);const b=s('f032f2d'),a=s('37ffbef'),h=s('7f506affa55f6fb892d3c8073c75151c998bdf2c');console.log(p,'round-prefix',a.subarray(0,b.length).equals(b),'hardbase-prefix@before',b.subarray(0,h.length).equals(h),'hardbase-prefix@after',a.subarray(0,h.length).equals(h));}"
```

Observed exit0: each of the six files printed `round-prefix true hardbase-prefix@before
true hardbase-prefix@after true`. This resolves GateDebt's speculative prefix concern,
not the SHONEN/census/PSTACK issue or USER round_count failure.

Routed defects/debt (status-neutral; lane fixes in a subsequent round, never by this verifier):

1. **tabi — carried legacy gate repair:** honor canonical four-`[~]` SHONEN regeneration
   without moving historical measurement baselines. Cover SHONEN/census/PSTACK interactions
   and future required round lessons with fixtures. USER's inherited6/10 round_count remains
   separate; round-12.md adds another path matching its overbroad drift guard, masked by the
   existing SHONEN failure. No legacy pass is asserted. Evidence: GateDebt.txt, ProtectedMap.txt.
2. **tabi — unswept FreshBidi R1/C1(c):** append precise collector-before-response-creation/
   clone timing, citing dated WD §7.5.2; distinguish collection from getData retrieval. This
   is operational precision, not an admission-blocking false mapping (ruling above).
3. **tabi — receipt metadata:** FreshRetry.txt:21/25 labels10801/99752 as raw bytes, but
   C1Review's same-digest raw fetch measured99073/1002533. Correct through a dated appended
   receipt clarification, with count command and representation; do not rewrite old evidence.
   No numeric round claim relies on these byte cells.
4. **tabi — citation precision:** accessible note:70 attributes its default-partial clause
   to Snapshot matching; add Strict matching as the exact default-contain location. The
   correct Strict matching explanation is already present at:72. Report:16's dossier range
   `:14-77` exceeds the66-line file; correct that pointer in the next report/append-only erratum.
5. **operator/protocol — closure conformance debt:** this pass supplies executable commands
   and observed outputs plus the serialized append helper, not a committed frozen step-1
   closure-checker run. Do not misread it as full frozen closure-gate certification; supply
   that evidence through operator-owned closure tooling. Absolute-reportDir prompt debt was
   already disclosed/routed by the lane; no validator bypass is approved here.

Historical S001/S003 whole-page digest volatility is disclosed in FreshProfile:16–41 and
excluded from semantic-truth inference. Those are historical fetch identities, not current
whole-page-equality guarantees. Do not red-date unreviewed runtime/paper claims.

SHONEN: not all four boxes were independently adjudicated by this source-only closure;
old end-to-end/runtime instructions were not re-executed. No `[x]` or promotion is granted.
No tools installed or updated by the integrator or its three review seats.
