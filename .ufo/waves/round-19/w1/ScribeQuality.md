# Round 19 — ScribeQuality (w1): frontier draft of QUALITY 40–45

Seat: `TabiR19-2.ScribeQuality-4` (scribe, leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb` (lane `refs/heads/master` = B at read time).
Scope: draft only. `corpus/QUALITY.md` is append-only and L1-owned; it was not edited. No production
file, no counter run, no browser, no git write. Installed tools: none.

## Observed inputs (read this round, verbatim anchors)

- `corpus/QUALITY.md` (165 lines at B): criteria numbered 1–39. Last three: 37 (`corpus/lessons/round-18.md#mistakes`,
  self-test receipt), 38 (`.ufo/waves/round-18/w1/ReviewC1Contract.md`, quote presence), 39
  (`.ufo/waves/round-18/w2/ReviewQuality.md`, digest re-derivation). New criteria therefore start at **40**.
- `corpus/lessons/round-19.md` **does not exist at B** (`ls corpus/lessons/` lists round-1…round-18 and
  `round-18-verifier-spotcheck.md`; no round-19 file anywhere under `corpus/`). The `#mistakes` anchor in the
  task is therefore not yet resolvable. See "Dependency" below.
- Lesson basis actually committed at B: `corpus/lessons/round-18.md` `## Mistakes` (line 103; rows
  number-drift, reference-drift, landing, stale-premise, landing, survivor, scope) and
  `corpus/lessons/round-18-verifier-spotcheck.md` `## Routed defects` (line 141; items 1–4 at lines 143,
  147, 149–157, 158–160).
- Routed items, quoted in the spot-check's own words:
  - 1 (line 143): `LOG.md:1059` says “QUALITY33–38 …”; the committed additions are seven criteria, 33–39.
  - 2 (line 147): “Wave 1 wrote through disjoint assigned files in one checkout instead of the addendum §6.2
    separate-writer-worktree contract.”
  - 3 (lines 149–157): H4 download scan “matches only the suggested filename”, a pasted download record
    “with real browsers passes”; H1 “checks SIGTERM but not the SIGINT/SIGHUP cases”; F6 “tries only the
    literal `--rev HEAD` and not `@`, `master`, a short hash or the refusal reason”; SCORECARD:830 assertion
    delta (“IDs and pass status retained”).
  - 4 (lines 158–160): “both `w{1,2}/swarm-registry.json` carry `"wave": null`”.
- Harness signal evidence (read-only grep, `scripts/webmcp-invoke-round18.mjs`): signal sends are SIGTERM only
  at lines 532, 554, 565, 1131; the handler flags at 1118–1120 list SIGINT/SIGTERM/SIGHUP as `false`. This is
  consistent with routed item 3 (H1) and was not re-run.
- `.ufo/waves/round-19/w1/swarm-registry.json`: `"wave": "tabi-round-19-w1"` (non-null); `spec.json` carries the
  same label. `dispatch-result.txt` contains zero `"wave"` keys, consistent with the PLAN d3 cause. Observation
  only; (v) is a criterion for every dispatch, not a pass claim for round 19.
- `.ufo/waves/round-19/isolation/`: only `lane-status-before-w1.txt` (content `?? .ufo/waves/round-19/`).
  `ledger.json` does not exist yet, so the writer-isolation ledger (routed item 2 / PLAN d4) is **unmet** at the
  time of this draft.

## Dependency (blocking for admission, not for drafting)

Criteria 40–45 cite `corpus/lessons/round-19.md#mistakes`. Criterion 10 forbids admitting round 19 while its
own lesson is missing, and criterion 28 forbids a claim whose pointer does not resolve as committed bytes.
The L1 must therefore land `corpus/lessons/round-19.md` (with a `## Mistakes` table, rows below) in the
**same integration commit** as QUALITY 40–45. If it is not landed, these criteria must not be admitted.

Proposed `## Mistakes` rows for that file (class | evidence | captured-by | fix, with red case):

| Class | Evidence | Captured-by | Fix, including red case |
|---|---|---|---|
| artifact-scope | round-18 spot-check routed 3 (H4) | QUALITY 40 | scan every new file under each run artifact root; red: planted uuid-named file must be flagged |
| signal-scope | round-18 spot-check routed 3 (H1) | QUALITY 41 | enumerate SIGINT, SIGHUP, SIGTERM; red: empty pre-signal pid set is vacuous |
| refusal-scope | round-18 spot-check routed 3 (F6) | QUALITY 42 | each refused shape plus reason token; red: exit-only check rejected |
| count-drift | round-18 spot-check routed 1 (LOG.md:1059); routed 3 (SCORECARD:830) | QUALITY 43 (refines 34) | re-derive by command before commit; red: “33–38” against seven rows rejected |
| registry-label | round-18 spot-check routed 4 | QUALITY 44 | check `wave` after dispatch; red: `"wave": null` rejected |
| writer-isolation | round-18 spot-check routed 2 | QUALITY 45 | per-writer clone ledger; red: disjoint paths in one checkout rejected |

## Draft criteria (to append to `corpus/QUALITY.md` as 40–45)

40. A download or artifact predicate scans every new file under each browser artifact root of the run (the
    run's private `playwright-artifacts-*` directories, whatever the file name, including Playwright
    `<uuid>` names) by a before/after listing diff, and binds the accepted download record to a per-run value:
    a nonce the counter generates for that run and the page echoes, or an artifact the browser observably
    produced in that run. A pasted record, a prior receipt, or a record whose nonce differs from this run's is
    refused. A negative control plants a uuid-named file under the run's artifact root and requires the scan to
    flag it. Refines 25. (lesson: corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 3, H4 —
    suggested-filename scan and harness-reported marker)

41. A signal-abort claim enumerates each signal it names (SIGINT, SIGHUP, SIGTERM, and any other named) and,
    per signal, requires: a run-owned browser pid set observed non-empty before the signal is sent; exit 2 with
    reason `run_aborted`; no pass/fail receipt written; and that pid set empty afterwards. Evidence for one
    signal does not cover another. “No surviving browser” over an empty pre-signal set is vacuous and is a
    finding. (lesson: corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 3, H1 — SIGTERM-only
    checks; “no surviving browser” reads 0 on both revisions)

42. A claim that a revision-input gate refuses a shape enumerates each refused shape named in its header or
    claim (for example `HEAD`, `@`, `master`, a 7–12-hex short hash, a full hash off the declared branch) and,
    per shape, asserts both the nonzero exit and the refusal reason token declared in the header, observed in
    stdout or stderr. Testing the literal form of one shape does not cover the others. A shape with no red case
    and no reason-token assertion is listed as untested in the claim. (lesson:
    corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 3, F6 — counter tried only literal
    `--rev HEAD`, checked exit code, not refusal reason)

43. A LOG or SCORECARD count line (criteria, rows, cases, correction items, or sibling counts) is re-derived by
    a command run against the content it counts at the revision about to be committed, before that commit is
    made; the command and its output are recorded in the same integration commit. A count copied from prose,
    an older lesson, or a prior line is a finding. Refines 34. Red examples: `LOG.md:1059` “QUALITY33–38”
    against the committed seven criteria 33–39; a SCORECARD assertion-delta count against the six case ids whose
    predicates replaced numeric CDP codes. (lesson: corpus/lessons/round-19.md#mistakes; round-18 spot-check
    routed 1 and routed 3 — LOG.md:1059, SCORECARD.md:830)

44. After every dispatch, each registry file the round produces is checked by command for a non-null `wave`
    equal to its spec's `wave`. A dispatch output's embedded registry object is not the registry file and does
    not satisfy this check. A null or mismatched label is a finding recorded against that dispatch, not deferred
    to the next round. Red case: a registry with `"wave": null` is rejected. Shapes left untested: `agentId: null`
    in validation snapshots (routed 4 says no claim depends on it; not claimed here). (lesson:
    corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 4 — both `w{1,2}/swarm-registry.json`
    carried `"wave": null`)

45. Concurrent production writers in a wave prove clone isolation by a committed ledger. For each writer: clone
    path, branch, base (the wave baseline), commit (40-hex), and `git diff --name-only base commit`, which must
    be a subset of the writer's assigned paths. Before and after lane `git status --porcelain` snapshots must be
    equal except for seat report files. Disjoint assigned paths written into one shared checkout do not satisfy
    this. A writer whose changed paths exceed its assignment, a missing ledger row, or a snapshot delta outside
    report files is a finding. The ledger proves isolation of writes, not the correctness of their content.
    (lesson: corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 2 — wave 1 wrote disjoint files in
    one checkout)

## Overlap and refinement (checked against existing criteria at B)

- 40 refines 25 (counter-owned probes); no existing criterion covers artifact roots or download nonces.
- 41 has no existing criterion; 17 (negative control reason) is adjacent but about runtime producer rejection.
- 42 extends 27 (named shapes defeated) with a required reason token; 21 covers counting controls only.
- 43 refines 34 (prose count carries its command); 22/26 cover counter binding, not pre-commit re-derivation.
- 44 is new; 28/30 cover receipts, not registry labels.
- 45 is new at the level of writer ledgers; 35 and 36 cover harm receipts and reruns, not writer clones.

## Calibration notes (what this draft does not claim)

- Each criterion is tied to one committed routed item and its named red case. No criterion is drawn from
  an unobserved risk.
- Routed item 2 (writer isolation) is currently unmet at this draft: `isolation/ledger.json` is absent. This is a
  fact about the directory, not a verdict on the wave.
- Routed item 4's registry label is currently present for w1 (`tabi-round-19-w1`). Criterion 44 applies to
  every dispatch, including w1, and requires the command to be run, which was not done in this draft.
- Routed item 3's H4/H1/F6 gaps are the round-19 C2 targets (PLAN); this draft does not decide whether they close.
- No counter was run; no browser was launched; all anchors are grep or read observations at B.

## Isolation

Scribe seat: production-file writes none. Only write: this report at
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ScribeQuality.md`. No clone was created
because no production file was drafted; criteria text is in this report, not in a separate file.
