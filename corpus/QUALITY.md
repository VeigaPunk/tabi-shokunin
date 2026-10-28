# Admission bar (probation draft)

1. Every claim falsifiable or marked opinion.
2. Every claim carries a source: a measured anchor (path:line, command,
   evidence id) — never oral knowledge.
3. Observation, inference, and unknown stay separate.
4. Errata are append-only blocks.
5. A rejection is kept, not silently dropped.

6. A lane-owned gate pins its inputs to fixed identities, refuses symlinked or
   non-regular inputs, and its self-test asserts each refusal with an expected
   exit/finding pair. (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M4)
7. An executed wave or round's aggregate lands in that round's LOG entry in the
   same integration commit, or is explicitly retired there with reason.
   (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M6)
8. A reject verified in at least 3 consecutive rounds is pinned once with its
   evidence and spot-checked on a stated cadence, not re-run every round.
   (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M7)
9. A round dispatches only after every declared seat route alias resolves to an
   actual binding; alias names alone are not bindings.
   (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M9)
10. A round is not admitted while an earlier round's lesson is missing (any file
    under `corpus/lessons/` naming that round); a lesson deferral names the
    closing round and its closing surface.
    (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M11)
11. A coverage/index map either lists every current note or states its snapshot
    date and the exact open row-count gap in the same commit as each admit.
    (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M12)
12. Source tier: an admitted external claim cites ≥1 opened corpus/SOURCES.md row of tier A or B for its scope; tier C never sole support; tier definitions live in corpus/SOURCES.md. (source: SOURCES contract v1 rule 3 — contract-derived, not a mined-lesson criterion)
13. Before writing a corpus path, check it against the lane's gate-protected set (`protectedPath` in scripts/check-*-contract.mjs, `corpus/evidence/pstack-20261015/baseline-census.tsv`); protected history is never appended — a new round gets a new file. (lesson: corpus/lessons/kaika-fleet-round-1.md#mistakes M13)
14. Distillation preserves the evidence class of its source: a source-code reading may
    justify a source-scoped inference, but never an observed host behavior. Check the
    distilled SKILL/index claim as well as the note; a dated documentation recheck
    does not renew a historical runtime observation.
    (lesson: corpus/lessons/round-12.md#mistakes; recurrence of kaika M2/post-review M-1)
15. Supersedes criterion 12's tier-definition pointer only: use the scoped A/B/C
    definitions in the canonical `CORPUS.md` §SOURCES.md contract v1
    (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md`).
    `corpus/SOURCES.md` curates rows; it does not define a second tier scheme.
    The opened A/B requirement and tier-C prohibition are unchanged.
    (lesson: corpus/lessons/round-12.md#mistakes; ReviewSources finding 2)
16. Historical protection distinguishes the baseline's existing paths from future
    protocol-required lessons. A canonical mutable file gets a narrow validated policy,
    never a moved measurement baseline or blanket path exemption; regression fixtures
    must still reject changed historical bytes, altered census rows and noncanonical
    SHONEN content. (lesson: corpus/lessons/round-13.md#mistakes; outside round-12
    verifier routed item 1)
17. A runtime negative control has a complete case-input manifest and checks the
    pinned producer's actual rejection cause, not any exception or source-reasoned
    diagnostic spelling. Retain the real expected/actual structure and a positive
    control; aggregate every executed case after worker restart before admitting
    a capability. (lesson: corpus/lessons/round-13.md#mistakes; missing queue template,
    version-scoped equal-diff format and surviving-worker receipt)
18. A browser cleanup summary must agree with a complete nonempty set of worker
    proofs; a negative property such as listeningAfter is not the proposition that
    every worker stopped. Runtime metadata distinguishes observed, minimum-enforced
    and descriptive recorded versions. Historical corrections retain input digests,
    a same-checker red→green witness and an explicit no-new-execution qualifier.
    (lesson: corpus/lessons/round-14.md#mistakes; outside round13 routed items1/2)
19. A historical count expression is data, never authority to invoke a shell.
    Accept only the persisted historical tree-path/content counting forms,
    evaluate validated Git argv without a shell, and assert legitimate-count equivalence and
    rejected malicious grammar with no side effect through isolated CLI fixtures.
    (lesson: corpus/lessons/round-14.md#mistakes; outside round13 routed item4)
20. Every emitted cleanup/qualification mirror in a historical browser-evidence
    correction is compared with authenticated underlying proofs, not trusted
    because another copy agrees. Independent CLI fixture expectations distinguish
    a semantic contradiction (failed) from a changed pinned input
    (`snapshot_tampered`, could-not-evaluate). A deterministic same-function
    comparison proves determinism only, not independent content correctness.
    (lesson: corpus/lessons/round-15.md#mistakes; round14 outside routed2/3)
21. A negative counting control asserts its intended diagnostic reason as well
    as exit/finding; an unrelated `score_mismatch` must not satisfy it.
    Side-effect receipt fields distinguish applicable-and-absent from not
    applicable. Counter safety is scoped to the accepted grammar, not the Git
    environment, whole repository or a production path that stopped earlier.
    (lesson: corpus/lessons/round-15.md#mistakes; round14 outside routed4)
22. A claim's count binds the counter blob sha256 at its measured revision and its
    declared counted inputs, and is re-run at the delivered HEAD: admit only when
    `scripts/check-measurement-binding.mjs --check <manifest> --at <delivered HEAD>
    --reproduce` exits 0. A revision-only pin, or a digest of a counter committed after
    the measured revision, is a finding (`counter_digest_unrecorded` /
    `counter_digest_mismatch`), never a pass. (lesson: corpus/lessons/round-16.md#mistakes;
    round15 outside routed 1/2)
23. A browser-API observation names the exact exposed object, the build, the flags and
    the origin's secure-context state, and checks the current spec text before calling
    a name a divergence; a hypothesised API path is recorded as an unknown, never as
    a negative finding. Spec citations back spec text only; implementation-only
    surfaces cite source or receipts. (lesson: corpus/lessons/round-16.md#mistakes;
    census U3 `navigator.modelContext` guess)
24. Refines 23: a hypothesised API path written into a census, index or README row is
    checked against the current spec IDL and the build's own IDL in the round that
    writes it; until checked it carries no negative gloss ("not X", "no flag carries
    it"), only an explicit unchecked-hypothesis label. (lesson:
    corpus/lessons/round-16.md#mistakes; wave-2 AttackQuality23 showed 23 alone
    would pass the census U3 row)
25. A counter that executes code from the revision it measures never trusts that
    code's printed receipts alone: it adds counter-owned probes whose expected
    outputs differ across inputs (a stub dependency that must turn the result red,
    and input variations with different expected findings). (lesson:
    corpus/lessons/round-16.md#mistakes; wave-2 AttackC1Liar)
26. A run claim (a count, verdict or exit "at REV") cites a committed receipt recording argv,
    producer digest, the revision it ran at and its exit; or it says "holds by drift diff" and
    names the empty `git diff --name-only` over every counted input plus the counter path — and
    criterion 22's `--reproduce` at the delivered revision still applies. A bare "again at REV"
    is a finding. (lesson: corpus/lessons/round-17.md#mistakes; round16 outside routed 3)
27. A probe, gate or selftest is described by the finite set of shapes it defeats, each named by
    the case or probe that goes red on it, and the description ends with the shapes left
    untested. Absolute words ("unforgeable", "tamper-proof") are not admitted in prose about a
    probe. Refines 25. (lesson: corpus/lessons/round-17.md#mistakes; round16 outside :76 — a
    paraphrase of an uncommitted author summary, not a report word)
28. Every evidence pointer in a lesson, note, QUALITY/SCORECARD/README row resolves as committed
    bytes: a lane path tracked at the cited revision, or `<repo>@<40-hex>:<path>` for a sibling
    or fleet object. A `/tmp` or untracked path is never the only root of a claim; it may appear
    as labelled history or as data inside a receipt. (lesson: corpus/lessons/round-17.md#mistakes;
    round16 outside routed 1)
29. A gate's implicit anchor is the lane tip: the attached branch, else `refs/heads/master`,
    read once per process with `symbolic-ref -q --no-recurse HEAD`, refusing a symbolic anchor
    and any other status, peeled with `rev-parse --verify --end-of-options <ref>^{commit}` and
    printed as the 40-hex in `code_revision=`/`codeRevision=` (`measuredRevision=uncommitted`
    stays legal for worktree bytes). An explicit `--at`/`--witness` is the caller's revision.
    "Delivered HEAD" in 22 means the 40-hex of local `refs/heads/master` that the lane helper
    printed as `landed`. Carve-out: the byte-frozen `scripts/check-freshness.mjs` keeps its
    witness parser; callers pass `"$(git rev-parse --verify refs/heads/master)"`. (lesson:
    corpus/lessons/round-17.md#mistakes; fleet `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` F1–F3, F6)
30. A committed receipt records the producer it ran (path and sha256 of gate, selftest, harness
    or counter); a claim cites it only when that digest equals the blob registered for the
    claim. Receipts from an earlier hardening are labelled history by a committed index in the
    superseding round; the frozen receipt is not edited. (lesson: corpus/lessons/round-17.md#mistakes;
    round16 outside routed 2)
31. Refines 4 and 24: a correction to a line of a sha-pinned note names that frozen path and line
    in an append-only index row (`corpus/README.md`), so a reader at the frozen line can find it;
    the pinned bytes stay untouched. (lesson: corpus/lessons/round-17.md#mistakes; round16 outside routed 4)
32. A scope overlap with a sibling lane is dispositioned in a committed `corpus/adjacency.tsv` row
    whose quotes resolve on pinned lines (`scripts/check-adjacency.mjs`); `ruled` cites a
    non-lane-authored ruling that names the sibling, `contested-open` cites a fleet L0 line naming
    the sibling. A clean checker certifies citations and venues, not bilateral agreement: a
    `split-declared` or `refused-route` row records tabi's reading and says so. (lesson:
    corpus/lessons/round-17.md#mistakes; round16 outside routed 5)
33. A superseding source row removes the falsified premise from every cell, not only `teaches`;
    old append-only rows remain explicitly superseded. Red example: S057's publisher anchor.
    (lesson: corpus/lessons/round-18.md#mistakes; round17 outside routed 4)
34. A prose count carries its counting command against the named revision, including counts outside
    the measurement manifest. The sibling-count correction is six, independently re-derived from
    the map, not copied from its old lesson. (lesson: corpus/lessons/round-18.md#mistakes;
    round17 outside routed 1; round18 C3 wrong-seven negative case)
35. A no-harm receipt binds the complete gate set and executed gate bytes to the measured revision;
    a later orchestration runner has its own separately pinned identity. An earlier run is not a
    run at that revision. (lesson: corpus/lessons/round-18.md#mistakes; round17 outside routed 2;
    round18 C3 wrong-revision and missing-gate negative cases)
36. Rerun evidence retains full SHA-256 digests and the artifacts they hash. A new execution is
    labeled new, never a recovery of lost temporary bytes. (lesson:
    corpus/lessons/round-18.md#mistakes; round17 outside routed 5)
37. A self-test claim cites a committed receipt under `corpus/evidence/` with argv, exit, stdout
    and producer identity, not solely a wave summary. (lesson:
    corpus/lessons/round-18.md#mistakes; round17 outside routed 3)
38. Quote presence is not source identity: a recheck binds row URL to fetched URL by explicit
    same-source transformations and binds own-work bytes to their Git object. An unrelated URL
    with a copied quote must not count. (lesson: corpus/lessons/round-18.md#mistakes;
    .ufo/waves/round-18/w1/ReviewC1Contract.md)
39. A response-body digest is re-derived from retained bytes (compressed storage is fine), and
    quote offset/excerpt are re-derived after decoding those same bytes. Digest-shaped strings
    and an excerpt's self-hash alone are insufficient. This binds recorded content, not the
    remote publisher's authenticity. (lesson: corpus/lessons/round-18.md#mistakes;
    .ufo/waves/round-18/w2/ReviewQuality.md zero-digest mutant; final C1 self-test)
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
    per shape, asserts both the nonzero exit and the shape-correct refusal reason (token and detail text)
    observed in stdout or stderr. Testing the literal form of one shape does not cover the others. A shape with no red case
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
    be a subset of the writer's assigned paths. Before and after lane `git status --porcelain=v1 -uall` snapshots must
    differ only by files under the round's wave directory, and the tracked diff must be empty. Disjoint assigned paths written into one shared checkout do not satisfy
    this. A writer whose changed paths exceed its assignment, a missing ledger row, or a snapshot delta outside
    report files is a finding. The ledger proves isolation of writes, not the correctness of their content.
    (lesson: corpus/lessons/round-19.md#mistakes; round-18 spot-check routed 2 — wave 1 wrote disjoint files in
    one checkout)
46. An integration-time change to a seat-authored expectation or to the harness's observation contract is
    recorded with the seat original retained and the reason, and the full case set is re-run after it; the
    expectation still equals an observed run, never a hoped one. Red example: checkbox cases expected checked
    booleans while the harness reports FormData-like values, 9/64 failing until the field contract was stated.
    (lesson: corpus/lessons/round-19.md#mistakes; integration receipts receipt-1→receipt-2)
47. Refines 14/27: a type-level rejection claim names the tested input shapes and checks the implementation's
    conversion branches before universal words are used. Source-token presence is not entailment of the
    whole decision. Supplemental accepted `"true"`/`"false"` checkbox strings are red counterexamples to
    “booleans only”; described hidden controls and disabled-option serialization are separate branches.
    (lesson: corpus/lessons/round-19.md#mistakes; w2/ScribeCoherence E03–E06, Decision15, RuntimeCheckbox)
48. Refines 45: a reconstructed return-time status or tracked diff, even backed by mtimes, is not an observed
    before/after snapshot. The checker must reject that provenance for closure credit; an irrecoverable
    historical observation stays unprovable. Red case: the round-19 wave-1 ledger explicitly labels its
    after-state RECONSTRUCTED; C3's d4 refuses it.
    (lesson: corpus/lessons/round-19.md#mistakes; w2/ScribeCoherence E07; measure-c3 reconstructed-snapshot case)
49. Refines 40/44/46's explanatory text only: round-18 H4 scanned marker bytes, not suggested filenames;
    C3 d3 also tests nonempty agentIds in post-record records/registries (validation snapshots are not them);
    first integration's 9 failures were five checkbox encoding mismatches plus four disabled-hidden
    field-reader mismatches. These supersede those narrower attribution examples, not their requirements.
    (lesson: corpus/lessons/round-19.md#mistakes; w2/ScribeCoherence E12–E13)
50. A source-only decision table separates the sampled callsite from its downstream effect,
    preserves entry-time predicates across possible callbacks, and distinguishes documentary
    row counts from semantic entailment, novelty and runtime coverage. Each citation span
    is contained in its named source row's immutable anchor; extending that anchor requires
    a new explicit same-source supersession row, never an in-place anchor edit.
    (lesson: corpus/lessons/round-20.md#mistakes; w1/CriticCount, AttackLC05, ReviewSourceContract)
51. A task-return barrier is not all-actor quiescence: peer messages may revive a parked
    seat. Scope return claims to observed facts, preserve later report-only activity,
    and import fixed committed blobs rather than mutable clone worktrees. A separately
    frozen before-import snapshot is an ordering record, not observer authentication.
    A metadata guard's clean verdict must never be reported as proof of settlement.
    (lesson: corpus/lessons/round-20.md#mistakes;
    `.ufo/waves/round-20/w2/ReviewReturnBoundary.md`, `WaveMembership.md`)
52. A strict invocation→observation→action claim places the completed observation,
    dispatch-start marker and operation acknowledgement in the same ordered transcript
    as the correlated invocation result; tied millisecond timestamps across separate
    arrays are not strict-order proof. An invoke error or missing ID stops the action,
    and a missing observation marker has its own same-counter red fixture. These
    author-recorded markers prove finite record consistency, not actor authentication
    or a human action. (lesson: corpus/lessons/round-21.md#mistakes;
    `.ufo/waves/round-21/w1/ReviewPreAction.md`; missing-observation-marker CLI case)
53. Navigation can destroy the document holding a page-side observation. A missing
    old-document collection is unavailable (null), not an observed empty list; keep
    navigation/output evidence separately and do not turn loss of state into a zero
    count. A same-counter positive-null / negative-empty pair distinguishes the
    shapes. (lesson: corpus/lessons/round-21.md#mistakes;
    `.ufo/waves/round-21/w1/ReviewNavigation.md`; unavailable-null-positive and
    unavailable-to-empty CLI cases)
54. A source association is checked in the first `source:` line, not rescued by
    a matching identifier elsewhere in the body. The declared S101 own-work
    receipt and S100 external URL stay distinct, and registry backlinks point to
    the current corrected entry. A copied-header-label red control must fail with
    `source_binding`. (lesson: corpus/lessons/round-21.md#mistakes;
    `.ufo/waves/round-21/w2/CounterSource.md`; copied-note-source-label case)
55. Structural consistency is not a semantic oracle. A silent synthetic CLI fixture
    may test observation-counting relationships, but each published lifecycle
    contrast needs a separate revision/case/invocation/sequence-anchored reading of
    the actual acquisition. Preserve this distinction when a coherent different
    status remains structurally countable. (lesson: corpus/lessons/round-21.md#mistakes;
    `.ufo/waves/round-21/w2/ConnectNoHarm.md`; semantic contrast witness)
56. Refines55: an outcome oracle persists independent case-specific expected
    status, output/error shape and finite-window position. Its negative cases
    coherently change raw events and mirrored summaries and refresh digest links,
    then require a semantic finding, not merely stale-hash refusal. Baseline zero
    for a new instrument is not absence of earlier knowledge: reused observations
    retain their old population count and receive no new coverage credit.
    (lesson: corpus/lessons/round-22.md#mistakes; w1 ConnPlanner, Raw05, Raw07)
57. Review scope is content-addressed and chronology-bound: record the exact
    artifact/producer reviewed, review return, acquisition start and completion.
    A start time alone cannot establish availability of the complete artifacts.
    An older review cannot certify finalized bytes acquired after it returned. Later
    L1 checks or fresh non-author immutable review are named separately, never
    backdated into the old wave's scope. Unknown clocks/identities stay unknown.
    (lesson: corpus/lessons/round-22.md#mistakes;
    `.ufo/waves/round-22/round21-closure.json` wave_conformance_debt)
58. Refines51: a first-terminal failure snapshot is not complete final seat
    history. Preserve observed later peer/routing messages, activity and failure
    notices with their own times/classes; unavailable history is unavailable,
    not an empty list or evidence of no wakes. Finite observed classifications
    never authenticate every actor or certify quiescence.
    (lesson: corpus/lessons/round-22.md#mistakes;
    `.ufo/waves/round-22/round21-closure.json` wave_conformance_debt)
59. A pinned expectation must spell absence as absence. When a stage has no
    recorder for a field, pin `null` (as the stage already pins a missing submit
    recorder) rather than `[]`; a code branch may not read a pinned literal
    backwards so that the observation equal to the pin fails while an unobserved
    dimension passes. A revision to a pinned field that is authored after the data
    was observed must be disclosed, must keep metric/target/blocking rule/population
    unchanged, and must show value neutrality by measured before→after at both
    oracle revisions — assertion is not neutrality. Bind the encoding in the schema
    check and isolate the digest guard with its own mutant, or a later revision can
    loosen the pin invisibly. (lesson: corpus/lessons/round-22.md#m1; w2b
    CriticRepairFitting F1, CriticAuthority A1/A4, ReviewExpectationsPin F1;
    `.ufo/waves/round-22/expectation-revision.json`)
60. An all-negative result from a detector is uninterpretable until the same
    detector finds a known-present control and misses a known-absent one; run both
    before publishing any verdicts, record them in the verdict receipt, and fail the
    run when a control disagrees. A register row with no checkable payload is
    `unverifiable`, never a silent pass. (lesson: corpus/lessons/round-22.md#m2;
    `.ufo/waves/round-22/assimilation/quarantine-verdicts.json` controls)
61. A round-evidence figure is derived from the round's own receipts, never restated
    from prose, and the derivation ships as a check that fails on the round that
    produced the defect. A detector that cannot be shown failing on that round is not
    evidence that the figure is right, and a counter whose "before" arm cannot be run
    (an absent instrument) must say so in those words rather than print 0.
    (lesson: corpus/lessons/round-23.md#mistakes M1; auditor class
    `c1-refusal-arithmetic`, which derives 24 refusals from 13+11 receipts against a
    filed 23)
62. A wave's seat count is checked against the policy band before dispatch and the
    round's total against the declared round cap; a replacement wave does not buy a
    larger band, and a wave's own validation record is not an authority — a record
    that substituted a band is the mechanism of the defect, not a licence. The cap is
    an input the run must supply: a verdict computed without it is fail-open and must
    refuse instead. (lesson: corpus/lessons/round-23.md#mistakes M2;
    `.ufo/waves/round-22/w2b-spec.json` 65 vs policy 64, round 129 vs ≤128)
63. A landed change and the LOG.md entry that describes it are bound to one commit, or
    the row says which commit carries the entry. The test is membership of `LOG.md` in
    the cited commit's own file list, never the presence of a LOG.md path in the tree
    at that revision — every commit after the first inherits the file.
    (lesson: corpus/lessons/round-23.md#mistakes M3; `47bfb5f` → 0 LOG hunks,
    `fbee618` → 1)

64. A gate's registry row is checked mechanically against the §Gate standard, not read: the gate
    set is derived from the revision's own scripts — a naming convention (`check-*.mjs`,
    `*audit*.mjs`) gives the primary universe, and scripts a registry row invokes as a gate add to
    it — so a gate whose row is absent cannot be hidden by the registry. Table shapes are read by
    header name, never by cell position, because a lane accumulates several. A later row for the
    same gate supersedes an earlier one. A field predicate that a mutated row cannot fail is not a
    predicate — every required field carries a red mutant and a green control in the gate's own
    self-test. The measurement is a universe statement, and a row whose kind cell is not parsed by
    the header map is reported as a missing kind, never silently dropped. (lesson:
    corpus/lessons/round-24.md; routed round-23 defect 1; `scripts/check-gate-registry.mjs`
    cases=22)

65. A self-assessment figure is compared against the instrument that produced it, at the revision
    being graded, never against a committed receipt that may itself carry the stale figure. A
    later statement of the same figure supersedes an earlier one only when the later statement
    names the same instrument, carries a correction marker, cites the superseded mention, and
    states the measured value; the counter reports the superseded mentions rather than silently
    dropping them, and a plain later claim never clears anything. A class whose "before" is a
    working-tree property (unlanded paths) is a live measurement, not a committed byte: its verdict
    is stated over a clean tree, the receipt records the porcelain count at the measurement instant,
    and mid-wave values are never filed as the after-value. (lesson:
    corpus/lessons/round-24.md#m1 #m2; routed round-23 defects 2 and 4;
    `scripts/check-selfassessment.mjs` cases=13)
66. A claim's measurement receipt records the exact revision it was measured at, and the report
    cites the same hash; a receipt whose recorded revision differs from the cited revision is a
    defect (reference-drift), and the gate re-runs the counting command at the delivered tip rather
    than trusting the receipt's self-report alone. (lesson: corpus/lessons/round-25.md#m1; routed
    round-24 spot-check observation; `scripts/check-measurement-binding.mjs` red fixture)

67. A googlesource `?format=TEXT` source is not admitted until its base64 transfer
    has been decoded and the decoded bytes are committed as lane evidence. A receipt
    records `bytes_path`, `decoded_sha256` and the transfer's `encoded_sha256`; the
    admission gate rehashes the decoded committed bytes and checks the located anchor
    against those bytes, never the live URL. The encoded digest is provenance only
    unless an instrument explicitly verifies it. (lesson: corpus/lessons/round-26.md#m2;
    routed round-25 closure defect 4; `scripts/check-s106-evidence.mjs` cases=5)
68. Before a tabi round report is fleet-committed, run
    `scripts/report-contract.mjs` on its contract path
    `.ufo/reports/round-<N>/tabi.md`. The check requires all six headings in order,
    exactly one `## SHONEN`, and a checkbox count matching SHONEN.md; fenced text does
    not satisfy headings or boxes. The round-25 verifier recorded both a wrong-path
    draft and missing SHONEN, defects a prose reminder had failed to prevent.
    (lesson: corpus/lessons/round-26.md#m1; routed round-25 closure defect 1)
69. A receipt's measurement revision must be a full resolved commit identity;
    the gate compares the committed source bytes at that revision with the
    receipt digest and also checks the evaluation revision's bytes. Do not bind
    a receipt to its own containing commit hash (circular), or accept an
    ancestor label without checking that revision's bytes. A self-test includes
    both the matching-source and divergent-source controls. (lesson:
    corpus/lessons/round-28.md#mistakes M1)
70. A self-assessment supersession citation names the target document and line
    (or a range containing it); timestamps and unrelated numeric tokens do not
    count. Test an unrelated-line red case, timestamp red case, and exact-line
    positive case. (lesson: corpus/lessons/round-28.md#mistakes M2)
71. A gate, counter or self-test whose bytes a round changes is executed at the commit
    that lands the change; the round commits that run (argv, revision, exit, tally) and
    one mutant that turns a named case red. A landed instrument no recorded run reaches is
    a `landing` finding even when no claim rests on it. (lesson:
    corpus/lessons/round-29.md#mistakes M1)
72. Command output quoted in a report, lesson or SCORECARD row is a committed capture
    made by redirect at a named revision and cited by path; a re-capture by the same
    command at that revision must match byte-for-byte. (lesson:
    corpus/lessons/round-29.md#mistakes M2)
73. A counter frozen for a claim is attacked before freezing by a seat that did not write
    it, with fixtures that try to reach the target without the claimed work; every
    clause of the predicate sentence names the code line that enforces it, and a clause
    no line enforces is dropped from the sentence or enforced before data. (lesson:
    corpus/lessons/round-29.md#mistakes M4)

74. A Gate quote is a contiguous substring of its own row's committed bytes under
    whitespace collapse, never a sibling row's bytes and never a span assembled across a
    boundary the source does not carry: adjacent C++ string literals, two table lines, an
    ellipsis. It must also ground that row's own `teaches`; a located sentence about a
    neighbouring row's subject is an attribution defect. Location is mechanical for a
    frontier entry (`g5-quote-located` against the receipt's committed `bytes_path`,
    `g6-gate` in the round lesson, `q1-entry-quote` for every >=4-word span of the
    entry); grounding, and any Gate row no counter parses, is review. (lesson:
    corpus/lessons/round-30.md#mistakes M1; routed round-29 defect 2;
    `scripts/check-frontier-admission.mjs` cases=24)

75. `used-by` reciprocity holds in both directions: every id an entry's `source:` line
    names lists that entry's repo path in `used-by`, and the in-place append is logged
    old→new in the round lesson (SOURCES contract rule 2). A one-way citation is a defect
    even when every quote is located: the row reads `mined` with no consumer that cites
    it. The frontier counter's `r3-used-by` rejects the absent direction for an admitted
    entry; a `used-by` path that no longer exists is a census check; neither instrument
    reads a row cited only outside the frontier surface, so that direction is reviewed.
    (lesson: corpus/lessons/round-30.md#mistakes M4; routed round-29 defect 1;
    `scripts/check-frontier-admission.mjs` cases=24)

76. A self-test case names the check it targets — a finding id, or a sub-check field and
    its expected value — and turns red when that one check is disrupted; a case that
    asserts only an exit code and a tally is satisfied by a failure on a neighbouring
    path and counts as no coverage. The mutant battery is the instrument: every
    catalogued fault mutant must turn its case red and every benign rewrite at the same
    site must stay green (27 fault, 13 benign). (lesson: corpus/lessons/round-30.md#mistakes
    M3; routed round-29 defect 7; `scripts/check-gate-mutants.mjs` cases=12;
    `scripts/check-s106-evidence.mjs` and `scripts/check-release-pins.mjs` case tables)

77. A lesson that numbers its mistakes carries one table row and one subsection per
    number; a mistake left in prose is not a numbered mistake and cannot be cited, and a
    row with no subsection leaves its fix and its able-to-fail state unrecorded. Table
    rows and subsections are counted and compared (`grep -c '^| M[0-9]'` against
    `grep -c '^### M[0-9]'`); no lane instrument asserts this yet. (source: routed
    round-29 defect 3, defect-derived; corpus/lessons/round-29-verifier-spotcheck.md)

78. An appended correction cites its target by document and line, or by a quoted anchor;
    "the bullet above" and any ordinal position is not a citation, because an append
    between the two moves the target and leaves the earlier statement standing unmarked.
    A described span also counts the lines it names: the guard block at 201-209 is nine
    lines, and the "10-line insertion" the errata calls it is those nine plus the blank
    at 210; a span that does not add up is corrected, not repeated. (source: routed
    round-29 defect 4, defect-derived; recurrence of criteria 65 and 70;
    corpus/lessons/round-29-verifier-spotcheck.md)

79. A counted population is stated as the rule that selects its members, in the same
    place as the count, with every class the rule excludes named and counted: "23
    on-release rows" is not a predicate until it says the source cell carries a src tag
    and that the two DEPS-pinned rows (S044, S068) fall outside the set by that rule. A
    number whose rule lives only in the counter's code cannot be re-derived by a reader
    and does not bind the next round. (source: routed round-29 defect 5, defect-derived;
    no lane instrument prints the excluded class — the reader recomputes the id set by
    the rule; `scripts/check-release-pins.mjs`)

## Round 31 additions (append-only; never edit above)

80. A decision-table row counts only when its threshold is the source's own number, located in a quote
    that also carries the force the row's decision rests on: the source's normative keyword as written
    (`MUST`, `SHOULD`, `MAY`, RFC 2119/8174 sense), a directive the page addresses to its reader, or a
    declared limit — and a row resting on a declared limit marks its Decision cell `(derived)`, with
    the derivation stated once in the entry's prose. A sample or example value (a specimen response
    block, an illustrative figure) sources no row; an RFC example period kept as a row says
    "example" in its own cells. The row names the actor and the scope the source binds the number to
    (a vendor's policy is that vendor's, at the access date). The frozen counter checks only that the
    number occurs in a located, live quote: `node scripts/check-decision-table.mjs --rev <REV>
    --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md
    --live --json` — `failing 0` is necessary, not sufficient; unit, bound word, force and
    distinctness are read row by row (round-31 wave-1 CritC1Axis and CritC1Counter admitted a
    ten-row repetition and a status code as a "threshold" under the same counter). (source:
    corpus/lessons/round-31.md M10; claim C1)

81. The oracle for a gate's self-test tally is that gate's own summary line
    (`<NAME>_SELFTEST … verdict=… cases=N`, the last such line), never the first `cases=` token in
    its output, and a summary whose verdict is not `clean` is not a tally. Check:
    `node scripts/check-selfassessment.mjs --selftest` includes the case
    `v2-oracle-reads-summary-line-not-first-cases-token`, and the counter with the summary-line
    rule removed fails that case (`.ufo/waves/round-31/baseline/m8-proof/old-oracle-selftest.txt`,
    `verdict=failed`, exit 3). A gate whose summary spells its count differently
    (`scripts/check-aria-metadata.mjs` prints `cli_cases=`) is outside the oracle until a later
    counter reads it, and a tally stated for it is unchecked, not matched. (source:
    corpus/lessons/round-30.md M8; corpus/lessons/round-31.md M1, M7)

82. Supersedes the second clause of 81 ("a summary whose verdict is not `clean` is not a tally") and its
    "never the first `cases=` token" wording, which the frozen v2 counter does not enforce: its summary
    pattern reads no `verdict=` token, a failed self-test's `cases=N` is read as the gate's tally, and a
    gate that prints no `<NAME>_SELFTEST` line falls back to the first `cases=` or `N/M` token. Until a
    counter enforces it, a tally stated for a gate whose self-test is not `clean`, or whose output has no
    summary line, is read by hand against the gate's own run and recorded as such; a criterion clause no
    line enforces is stated as a limit, not as a rule (criterion 73). Red state: wave a2w1 RevQuality probe
    (`.ufo/waves/round-31/a2w1/RevQuality/`, a `verdict=failed cases=13` summary read as tally 13; a
    summary-less gate read as 9). (source: corpus/lessons/round-31.md M11)

## Round 32 additions (append-only; never edit above)

83. A statement a round makes about its own derived state — the stagnation-nudge state, a window position, a
    lowest-axis tie — is re-derived in that round from the rule and its inputs, and the round names both: the rule
    (`AXES.md` §The stagnation nudge: every axis "at or above" the line, no capability entered within the window)
    and the inputs it read (axis scores at round start, saturation and window, the capability table's entry rounds).
    A statement carried from the previous round is a finding even when the state is unchanged, and a reason that
    narrows the rule ("sit at the line, not above it" against "at or above") is a second finding. The fix is an
    append-only correction that cites the stale line as `DOC:N` and states the derived state (`nudge was active`).
    Instrument: `scripts/check-selfassessment.mjs` v3 class `m4-nudge-state`, over `SCORECARD.md` round groups only;
    the same statement in `LOG.md`, a frozen `claims.json` or a lesson is read by hand, and a round group without a
    six-axis `Axes at round start:` line is unread, not correct. Red state at the round-32 freeze:
    `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (m4 at `SCORECARD.md:1473`, `:1515`, `:1576`, claimed
    `inactive`, derived `active`). (source: corpus/lessons/round-32.md M1)

84. A capability-table row names an operation the shokunin can now run, with its demonstration in the round report;
    a gate or counter never enters the table, because the table feeds the stagnation nudge and a gate row would reset
    the window by bookkeeping. The round-24/25 gate rows (`SCORECARD.md:1243`, `:1249`, `:1306`, `:1314`) stay as
    written and are counted as entries by the nudge rule, which reads the table as committed. (source:
    corpus/lessons/round-32.md M1; `.ufo/waves/round-32/w1/CritAxisCapability.md` F1)

85. Supersedes criterion 82's limit clause for the frozen v3 counter: a self-test whose exit is nonzero or whose
    `<NAME>_SELFTEST` summary verdict is not `clean` is not an oracle — the tally stated for that gate is
    could-not-evaluate, never matched or mismatched. Check: `node scripts/check-selfassessment.mjs --selftest`
    includes `v3-failed-summary-is-not-an-oracle` and `v3-nonzero-exit-is-not-an-oracle`; the gate with the refusal
    removed fails them (`.ufo/waves/round-32/measure/c2-refusal-mutant.txt`, 39/41, exit 3). A gate that prints no summary line still falls back to
    the first `cases=` or `N/M` token (criterion 82's remaining limit). (source: corpus/lessons/round-31.md M11;
    corpus/lessons/round-32.md M4)

86. A runtime-evidence row count is a count of distinct surfaces backed by distinct runs. When a gate counts table
    instances (a row id listed twice scores twice), accepts one transcript cited as two runs, or accepts its own
    bytes as the driver under another path, the round records the plain distinct counts beside the gate's reading:
    distinct row ids admitted, distinct transcript digests, driver digest unequal to the gate's, and the driver's
    imports. The gate's reading alone does not carry "two independent runs". Red state:
    `.ufo/waves/round-32/w1/CritC1Forgery.md` (four constructions admitted 16 by the frozen
    `scripts/check-bidi-runtime.mjs`). (source: corpus/lessons/round-32.md M2)

## Round 33 additions (append-only; never edit above)

87. A sibling-overlap map answers a frozen sweep only when the sweep's membership rule was fixed before the map was
    edited and every candidate it names ends either mapped by a verified row or screened under one of the closed
    reasons — and no single count is the answer: screening all 47 unaccounted candidates reaches `unaccounted 0` with
    `newMapped 0`, and a map gate that verifies fourteen rows clean leaves those same 47 candidates unaccounted, so
    the round states `mapped`, `screened`, `unaccounted` and the verified-row count together and never one of them as
    "the sweep is answered". Check: `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --repo
    <clone> --fleet <fleet> --json` is `predicate` true only with `unaccounted` 0 and `newMapped` >= 4 over
    `adjacency` clean; a `same-surface` screen additionally needs a `surface` naming a mapped-verified row of that
    same sibling, and every screen quote is a verbatim 4-25-word substring of the candidate line. Red state at the
    round-33 freeze: `.ufo/waves/round-33/baseline/c1-J2-screen-all.json` (`screened 47`, `unaccounted 0`,
    `newMapped 0`, predicate false) and `c1-J3-junk-rows.json` (`adjacency` clean, rows 14, verified 14,
    `unaccounted 47`). (source: corpus/lessons/round-33.md §Gate; `.ufo/waves/round-33/claims.json` C1 controls)

88. A new map row covers a candidate only when its two quotes name each other's lane: a `ruled` row's ruling line and
    a `contested-open` row's fleet L0 `tabi | round-<N> |` line name the sibling, and a `split-declared` or
    `refused-route` row carries `tabi` in its sibling quote or the sibling lane token in its tabi quote — because the
    map gate verifies verbatim quotes on both cited lines, not overlap, so "the row verifies clean" is never coverage.
    Red state: `.ufo/waves/round-33/baseline/c1-J4-mislabel-unnamed.json` — four split-declared rows on real kake
    candidate lines whose quotes name neither side verify clean (rows 14, verified 14) and leave `mapped 9`,
    `newMapped 0`, predicate false — and `c1-J3-junk-rows.json`, where four rows on non-candidate sibling lines are
    equally clean and equally worth nothing. (source: corpus/lessons/round-33.md §Mistakes; `.ufo/waves/round-33/
    claims.json` C1 `feasibilityDisclosed`: "a candidate screened with a wrong reason counts as accounted")
    Naming is necessary, not sufficient: w1 CritC1Counter reached the frozen predicate with refused-route rows that
    reuse one tabi refusal line (`PROVINCE.md:16`) as the only naming quote (`.ufo/waves/round-33/w1/CritC1Counter/`),
    so each new row's overlap is judged by an attack seat and the closure, row by row (lesson round-33 M5).

89. A gate is said to admit evidence only after a frozen battery scores it on three populations that can move
    independently — honest variants admitted with the admitted count stated, constructions drawn from the gate's own
    prior-era golden output rather than from its current code that must be refused, and a whitelist control that
    accepts only the honest bytes and must fail — because a forgery-only reading passes any gate that exits 1 on
    everything (`forgeriesAccepted 0`, honest H0/H1/H2 false), and a digest whitelist passes both the forgery and the
    honest reading while carrying five 12-hex digest literals and failing its own self-test (exit 3). Red state at the
    round-33 freeze: `.ufo/waves/round-33/baseline/c2-J1-do-nothing.json` (`forgeriesAccepted 8`,
    `acceptedForgeries` F1-F8), `c2-J2-reject-all.json`, `c2-J3-whitelist.json` (`digestLiterals` 5, `selftest` exit
    3, `verdict=failed cases=27 passed=25`). Criterion 86 governs what the admitted count means; this criterion
    governs which populations a forgeriesAccepted number is read against. (source: corpus/lessons/round-33.md §Gate;
    `.ufo/waves/round-33/claims.json` C2 controls; `.ufo/waves/round-32/w1/CritC1Forgery.md` D1-D5)

90. A feasibility sentence — "not reachable without …", "the counter cannot judge …", "the battery cannot catch …" —
    is written only after the cheapest forgery against that instrument has been run, and it names the attack and
    cites its control; a limit stated without a run is a finding, and its fix is an append-only correction that cites
    the stale sentence. Red state: round 32's C1 said the target was "not reachable without a committed receipt of
    two real runs from a driver other than the counter" while four cheap constructions reached admitted 16 (an id
    listed 16 times, one transcript cited as both runs, a driver re-exporting the gate, a synthetic transcript with a
    real first screenshot spliced in), and the frozen file could only be corrected downstream
    (`corpus/lessons/round-32-verifier-spotcheck.md:151`, routed defect 4; `corpus/lessons/round-32.md` M2). Green
    form at round 33: C2 states the battery's finiteness only after F1-F8 and the reject-all and whitelist controls
    ran (`c2-J1-do-nothing.json`, `c2-J2-reject-all.json`, `c2-J3-whitelist.json`). C1 is the counter-example: its
    sentence named the named-quote mislabel after the screen-all and mislabel controls ran, but w1 CritC1Counter and
    CritC1Axis found cheaper constructions it did not name (lesson round-33 M5) — a feasibility sentence is bounded by
    the attacks actually run, and says so. (source: corpus/lessons/round-33.md M1 and M5, routed defect 4;
    `.ufo/waves/round-33/claims.json` C1/C2 `feasibilityDisclosed`)

91. An integrator who reverses a seat's screen-or-map decision records each reversal with its ground on the sibling's own
    bytes, and a reversal that is load-bearing for a frozen target is attacked before the target is read; a map row whose
    only sibling-side ground is a fact on the sibling's own side of an already-mapped split is a screen, whatever its
    surface name. Red state: round 33's integration `042d6d9a` reads C1 predicate true with the kake:347 row and false
    without it (`.ufo/waves/round-33/measure/c1-at-bf48b81.json`; `.ufo/waves/round-33/w2/CritC1Overrides.md`).
    (source: corpus/lessons/round-33.md M6)

## Round 34 additions (append-only; never edit above)

92. Integration hygiene is a reading taken on the commit candidate before the integration is called
    landed, and the receipt carries the three values the reading depends on: the rev, the exit and the
    porcelain count. `node scripts/check-selfassessment.mjs --rev <CANDIDATE> --repo <repo>` must print
    `SELFASSESSMENT verdict=clean … mismatches=0` and exit 0; any m1/m2/m4 mismatch is fixed append-only in
    the next commit before the report calls the round landed. The tree state is part of the reading, because
    class m3 reads the live working tree (`scripts/check-selfassessment.mjs:57-64`, `:419-423`, one mismatch
    per porcelain path): a pre-commit run legitimately reports `m3-unlanded-paths` while the round's own
    `## Round N — executed disposition` block is uncommitted, so that finding is recorded as commit-pending
    and cleared by the candidate commit, never read as a pass; and the same rev replayed later from a clean
    clone can read 0 while the candidate run read 1, so a clean replay never supersedes the candidate
    reading, and a reading that names no rev/tree state is not a reading. Check: this seat replayed the
    closure's two named commits (2026-10-26, clone at `59f1b47a…`): `--rev 9f008f6c` → `verdict=failed …
    mismatches=1`, exit 1, the counted finding `class=m1-selftest-tally doc=SCORECARD.md line=1829
    script=scripts/check-adjacency.mjs claimed=44 observed=57`; `--rev 59f1b47a` and `--rev bf48b81c` →
    `mismatches=0`, exit 0. Red state: `9f008f6c` is the committed candidate that read mismatch 1 and was
    corrected only downstream; `bf48b81c` read 1 at integration time and 0 in a clean replay, which is why the
    criterion fixes the candidate reading and not a replay. (source:
    corpus/lessons/round-33-verifier-spotcheck.md routed defect 4, `:162`;
    `.ufo/waves/round-34/claims.json` priorClosure item (4))

93. A 404 receipt is recorded by HTTP status, byte count and body text — the stable first line, verbatim — and
    never by a sha256; a 200 keeps its sha, because there the bytes are the identity. A gitiles error body is
    not one constant: its `request_id` field changes per request, so the whole body is also not a stable
    anchor, and a sha stated for a 404 is a finding rather than a receipt. Check: `curl -q -sS --proto =https`
    twice against the absent page; two fetches this round (2026-10-26T19:47:51Z and 19:47:52Z) each returned
    `HTTP 404`, 233 B, first line `NOT_FOUND: Requested entity was not found`, with different `request_id`
    values and sha256 `582edd5a4b2d4d5f87f7bda4dad4843c8494529421f3f406fb3e1c6a28816c42` vs
    `b427426b36d80b4805fde990bbf92a6b1b206ce1efbfd31095013527a8638e85`. Red state:
    `docs/linux/sandboxing.md` at tag `154.0.8037.97` carries four distinct sha256 over one 233-byte body
    across the lane — `b52a956c…5198` (`corpus/lessons/round-33.md:73`), `3bd81c56…` at closure
    (`corpus/lessons/round-33-verifier-spotcheck.md:134`), and this round's two — so a 404 sha identifies a
    request, not the page it was asked for; the closure's own re-open proved the point and routed it.
    (source: corpus/lessons/round-33-verifier-spotcheck.md `:134`, routed defect 5 at `:168`;
    corpus/lessons/round-33.md:73)

94. A third-party lead list is keyed by (path, verbatim quote); the line number is a derived locator,
    re-verified against the quote at read time, and never the key. A lead whose cited line does not hold its
    quote is re-anchored to the nearest line whose text does and the move is reported, not silently dropped
    and not re-keyed by line number; a candidate key inherits the corrected line, and the report states the
    move. Check: `.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs:23-33` (a lead is anchored by its
    quote, ±2, with a 4-consecutive-word fallback for a wrapped quote) and `:159-160`, whose run on the
    baseline records `leadsReanchored: ["corpus/knowledge/mirror-pitfalls.md:39@04404859… -> 40"]`
    (`.ufo/waves/round-34/baseline/c1-J1-do-nothing.json`). Red state: the round-33 w1 lead
    (`ConnSiblingScan/leads.tsv:24`) cites kake `mirror-pitfalls.md:39` while its quote
    ``Lease first: `webzites lease acquire --owner <n> --ttl-ms 900000`; release`` sits at `:40` (`:38` is
    the `## Browser/CDP lane` heading and `:39` is blank at pin `04404859…`; the file line at `:40` begins
    `- Lease first:`) and this round's candidate is keyed at `:40` (`c1-candidates.tsv:56`); an off-by-one line
    key names a different line's text and a sweep that trusts it maps or screens the wrong sibling fact.
    (source: `.ufo/waves/round-33/w1/ConnSiblingScan`
    leads; corpus/lessons/round-33-verifier-spotcheck.md routed defect 1; lesson class
    corpus/lessons/round-33.md M3 `reference-drift`)

95. A mutation-kill case asserts the rule's outcome on a fixture that exercises the mutated rule — exit 3 with
    a `CASE … FAIL` line plus the expected admitted count or reason id (`scripts/check-bidi-runtime.mjs:1108-1110`)
    — and never the gate's source text: a case that whitespace-normalises `gateSource` (`:1037`) and fails when
    a rule's literal is absent kills every mutant while exercising nothing, and it is invisible to the frozen
    counter's whitespace twin (a behaviour-preserving edit normalises to the find text). A kill whose only
    evidence is a difference in the gate's bytes is therefore a second shape of the same defect and is counted
    as a survivor, not a kill. Check: the frozen counter's probes are `pristine`/`neutral`/`decoy`/`twin`
    (`c2-gate-mutants.mjs:14-31`) and `KILLED` requires exit 3 plus a `CASE … FAIL` line (`:27-29`). Red state:
    `baseline/c2-J3-find-sniff.json` is a self-test that sniffs its source for the find texts; it reports all
    20 mutants killed, `pristine`/`neutral`/`decoy` exit 0, and the battery `predicate true`, and is refused
    only because `twinsFailing` lists all 20 — the counter's disclosed residual (`c2-gate-mutants.mjs:35-37`)
    is the whitespace-normalised variant, which this seat measured passing the twin (pristine 45/45 clean exit
    0; twin at the M01 site clean exit 0; `CASE id=sniff-rule-present … reason=rule text absent FAIL` exit 3
    with the duplicate-threshold rule never run). The survivor the case must actually cover is M01
    (`> 1`→`> 2`, `.ufo/waves/round-33/w2/MutGateV2.md` row M01, survives both round-33 detectors): it needs a
    two-duplicate fixture, not a text check. (source: `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:35-37`;
    `.ufo/waves/round-33/w2/MutGateV2.md` M01 and protocol note; corpus/lessons/round-33-verifier-spotcheck.md
    routed defect 2)

96. A freeze's control set includes every cheap construction the previous round's lesson names, each scored with
    the frozen counter before data; a named construction left unscored is a control gap, whatever the other controls
    show. Red state: round 34's freeze scored five C1 controls but not the rename route round-33 lesson M5 named, and
    w1 CritC1Claim's probe A reached the predicate with it (exit 0, newMapped 3). (source: corpus/lessons/round-34.md M3)

97. A `split-declared` map row cites a sibling line in which the sibling itself states its side of the split (a
    sibling's census or report of tabi's own text is a third-lane record, never the sibling's side); a `refused-route`
    row cites a tabi refusal that names the sibling as the destination of the refused surface. check-adjacency verifies
    quotes, not that either side states anything. Red state: the round-34 w1 integration `04f9623d` carried row 17
    (kotoba census line ruling the pair `none`) and row 18 (a refusal routed nowhere) and read C1 newMapped 4; wave 2
    withdrew both. (source: corpus/lessons/round-34.md M5)

- Round 34 wave-2 corrections (append-only; w2 RevQuality92): criterion 92's parenthetical "(…, one mismatch per porcelain path)" — read "one m3 finding for a non-empty porcelain, whatever the path count" (`scripts/check-selfassessment.mjs:419-423`). Criterion 95's gate line cites (`:1037` `gateSource`, `:1108-1110` the case comparison) are at the baseline gate `15dfaccb`; at the round-34 gate they are `:1086` and the `const pass = …` comparison of `runSelftest`.

## Round 35 additions (append-only; never edit above)

98. A freeze carries, for each numeric predicate it declares, a boundary control one step short of the target that
    must exit 1, and the counter's threshold constant is read back against the declared sentence before the freeze
    lands; a control set whose every member scores far from the threshold cannot see a threshold that disagrees with
    the claim. Red state: round 35's C2 counter froze `TARGET = 14` (`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:54`,
    `:77`) under a declared `admitted >= 16` (`.ufo/waves/round-35/claims.json`); all five C2 controls score admitted
    0, and w1 MutC2Counter m11 (`TARGET 14→1`) survives them. (source: corpus/lessons/round-35.md M1; w1
    RevClaimsFreeze F1-F2)

99. A counter that launches binaries the caller can name is read only together with the provenance of the binaries it
    ran: the measurement records each binary's path, `--version` line and sha256, and the reading counts only when
    those equal the install receipt (signed checksum or release digest) the round registered. Red state: w1
    CritC2Counter reached `admitted 16, failing 0, binding null` with a fake geckodriver and a `--version` stub passed
    through `--firefox`/`--geckodriver` (`.ufo/waves/round-35/w1/CritC2Counter.md`). (source: corpus/lessons/round-35.md
    M4; S140, S141)

100. "Loopback only" is a socket observation, never an inference from the URLs a run navigates: a browser started for
    loopback evidence is sampled for non-loopback peers during the run, and the receipt or entry that asserts loopback
    cites that sample. Firefox 158 under geckodriver's recommended automation prefs opens TLS sockets to Mozilla
    remote-settings and content-signature hosts within seconds of launch; `network.dns.disabled` + `network.trr.mode 5`
    measured 0 (fixture on an IP literal). Red state: the frozen C2 counter's header claims its live leg is "loopback
    FIXTURE only" (`c2-firefox-bidi.mjs:57-58`) while w1 SentinelFirefoxEgress measured three outbound connections per
    launch. (source: corpus/lessons/round-35.md M3; `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` §5 D11)

101. A no-harm reading runs every gate that has a production mode in that mode — not only its self-test — and a
    correction appended to a file some gate pins by bytes is either carried with that pin's own append-only refresh or
    placed elsewhere; a no-harm sweep that runs a gate only through its self-test cannot see the gate turn red on the
    lane's own bytes. Red state: `scripts/check-freshness.mjs --worktree` reads `content_drift` at `083c5c643be7aa5965a5de3458a32ed0d289ead3` (the census
    append moved bytes pinned at `corpus/evidence/fleet-round-1-freshness/pins.tsv:7`) while the frozen
    `.ufo/waves/round-35/measure.sh` no-harm block, which runs check-freshness only with `--self-test`, stays 28/28 green
    (w2 RevCorrections D1). (source: corpus/lessons/round-35.md M5)


## Round 39 additions (append-only; never edit above)

102. A `/proc/net/tcp{,6}` loopback classifier decodes Linux's little-endian 32-bit words before testing the remote address and cross-checks `ss` output; disagreement is a finding, not a clean loopback reading. Red state: `.ufo/waves/round-39/measure/proc-endian-before.json` records 12 false non-loopback observations for 127.0.0.1 while `ss` records 0; after decoding, both surfaces record 0 in `.ufo/waves/round-39/measure/proc-endian-after.json`. (source: `corpus/lessons/round-39.md` M1; S145)

103. A frozen counter must test whether its measurement receipt can exist at the revision it is required to name; a receipt that embeds the full hash of the commit containing its own bytes creates an unreachable fixed point. Red state: C2 D6 requires `.ufo/waves/round-39/measure/numstat-at-REV.txt` in REV and `text.includes(REV)`; adding the receipt changes REV, confirmed by `.ufo/waves/round-39/measure/c2-self-reference-probe.txt`. Freeze a non-self-referential candidate/evidence-carrier protocol before data. (source: `corpus/lessons/round-39.md` M2; round-39 C2 counter)


## Round 42 additions (append-only; never edit above)

104. A counter that scores a receipt from committed bytes must refuse bytes it cannot
    authenticate: a nonce relabel of a genuinely-produced receipt, or a fully
    synthetic receipt+witness pair, must not reach predicate true. The live wrapper's
    in-process nonce binds only the live invocation; scored-over-committed-bytes it
    authenticates nothing. Red state: round-42 wave — `CritC1Reach` reached counter
    exit 0 / predicate true three ways with zero browser runs (r41 bytes relabeled,
    r42 bytes relabeled, hand-written receipt naming pid 1 as firefox);
    `CritC1Witness`/`RevWitnessProbe` greened a 4-scalar nonce patch and a 6.7 KB
    synthetic pair; `MutC1Counter` added the unpinned `--pins` hole. Fix (sign the
    receipt with a per-invocation key, public half pinned) is routed to round 43,
    not amended post-data. (source: `corpus/lessons/round-42.md` Mistakes 1)
105. Quarantine classification standard: `misbound` requires the registered quote
    located verbatim in a DIFFERENT registered source's document; `absent` means the
    registered document opens and the quote is not in it; a classification that
    changes another round's letter names the standard, not just the letter.
    Red state: round-42 `RevQuarCross` vs `QuarR4208` disagreed on S135 (absent vs
    misbound) — a standard divergence, not a fabrication. (source:
    `corpus/lessons/round-42.md` Gate spot-check)
