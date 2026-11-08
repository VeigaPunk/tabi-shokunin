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

## Round 43 additions (append-only; never edit above)

106. A refusal control must exercise the strongest attack in its class: a control that refuses
    only because the attack channel is absent does not cover an attacker who supplies the
    channel. Red state: `c1-synthetic-refused.json` refused the synthetic pair via the
    channel-absent variant (no fd3/fd4), while round-43 wave seats answered the counter's fresh
    challenge from the pair's own key — `CritC1ReachSynth` (three variants incl. a second-process
    relay), `CritC1ReachDirect`, `CritC1Witness`, `CritC1ReachReplay` — reaching exit 0 /
    predicate true with zero browser runs; the C1 kill rule fired. (source:
    `corpus/lessons/round-43.md` Mistakes 1)
107. A binding rule must enforce set equality against the exact set it claims to bind and anchor
    quotes to complete lines; a length floor plus substring matching accepts a freeze that names
    controls it does not bind. Red state: round-43 wave `CritFreezeBindings` — a scratch fixture
    binding only 5 of the 8 controls its beforeState names greens (`binds.length < 5` floor) and
    a 19-character quote fragment greens (`includes`, not whole-line), exit 0 / predicate true /
    zero findings against the frozen sentence "binds every control it names ... a verbatim quote
    line"; `CritFreezeAudit` independently found r5 does not enforce beforeState-to-bindings
    completeness; all five required negative mutations still refused (the rule is not vacuous,
    it is narrower than its sentence). (source: `corpus/lessons/round-43.md` Mistakes 2)

## Round 54 additions (append-only; never edit above)

108. The committed-stderr rule: run stderr (or any interim instrument output)
    cited as evidence in a lesson, receipt, or report must resolve to committed
    bytes — or be quoted verbatim in the citing text — at the round that cites
    it; lane scratch is ephemeral and never citable (the round prompt's
    "/tmp is never citable" line extends to scratch). Red state: the r53
    lesson's Mistakes row cited the three spawn-blocked compiles' stderr as
    "kept: scratch live-run2/3/4-stderr"; lane scratch is deleted at round end
    per the round contract, so those bytes were unrecoverable at the r53
    closure (the r53 non-author closure's D1; this round's survey confirmed
    the loss — only the closure's own verifier scratch survives). The rule was
    applied in the same round it was named: the r54 data run's own
    spawn-blocked first attempt has its full stderr committed at the round
    that cites it (`controls/c2-live-run1-spawn-unknown.txt`), and the
    spawn-verdict control commits its compile/spawn bytes inside the receipt
    (`controls/hostexe-fresh-compile-spawn-verdict.json`). (source:
    `corpus/lessons/round-54.md` Corrections item 1)

## Round 55 additions (append-only; never edit above)

109. The cited-receipt landing rule: every receipt a committed text (lesson, report,
    SCORECARD cell, claims.json) cites as evidence must EXIST in the committed tree at
    the citing round — verified post-commit with `git diff-tree --no-commit-id
    --name-status -r <rev>` / `git show <rev>:<path>`, never from the working tree
    alone; scratch is never citable (extends criterion 108 to instrument receipts,
    not just stderr). Red state: the r54 report/lesson/SCORECARD cited three counter
    receipts (`measure/c2-counter-green-at-data.json` + the cross-refusal pair) that
    were never committed under `.ufo/waves/round-54/measure/` — the r54 scratch was
    cleaned at round end and the author's originals are unrecoverable (the r54
    non-author closure's D54-1; the loss disclosed, never silently replaced). The
    rule was applied in the round it was named: r55 re-measured all three outputs on
    the committed r54 bytes and landed them at the exact cited paths with a
    provenance note (`measure/d54-1-landing-note-r55.txt`), and every r55 commit was
    landing-checked with diff-tree before use — the same check that caught the CRLF
    empty-commit class the same round. (source: `corpus/lessons/round-55.md`
    Corrections item 1 + Mistakes 2)

## Round 56 additions (append-only; never edit above)

110. The full-prefix citation rule: every evidence path a committed text (lesson, report,
    SCORECARD cell, claims.json) cites MUST carry the full `.ufo/waves/round-<N>/` prefix —
    a relative form (`measure/foo.json`) is not machine-checkable and is the gap that left
    the r55 lost green receipt invisible to the r56 gate's frozen extraction rule
    (R56Gate-F1: `measure/c1-meter-green-at-correction1.json` at SCORECARD:3145 and
    `measure/d54-1-landing-note-r55.txt` at lesson:67 are relative-form citations of paths
    absent at r55). New citations use the full prefix; the gate
    (`scripts/check-cited-receipts.mjs`) runs on the round's citing docs at the round's
    close revision before the report is filed. Red state: the gate at the r55 close
    revision `545b251d` exits 1 with 6 findings / 5 distinct missing paths
    (`.ufo/waves/round-56/gate/red-at-545b251d.txt`), including the whole
    `sources/` byte store the r55 docs cite. (source: `corpus/lessons/round-56.md`
    Corrections item 1 + Mistakes 3)

## Round 59 additions (append-only; never edit above)

111. The definition-site sweep rule: a claim that cites a source for a named term runs
    a grep for that term's definition site in the staged bytes BEFORE the instrument
    freeze, and classifies each term as definition site (a local `<dfn>` / `data-dfn`
    / WebIDL member declaration with a line number), prose (a normative sentence
    without a dfn), cross-reference (an external link), or absent. A term classified
    as prose or absent is cited as prose-grounded or as measured, never as a
    definition site. Red state: the r58 C2 claim cited S161 for `defaultPrevented`;
    the sweep on the staged bytes finds only cross-reference anchors and no local
    definition (`.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt`,
    verdict RED: the criterion is able to fail). Green state on the r59 terms
    (`.ufo/waves/round-59/probes/d9-green-capslock.txt`): `getModifierState` is a
    local dfn (S161 raw 3327); `CapsLock` has no dfn (prose raw 4791, key-code table
    raw 6370-6371, and the `modifierCapsLock` initializer dfn raw 3569, a different
    term); the S162 staged bytes carry no CapsLock occurrence. (source:
    `corpus/lessons/round-59.md` Gate + Corrections D9)

## Round 60 additions (append-only; never edit above)

112. The forgery-probe and mutant coverage rule: a counter that enforces a frozen kill rule
    carries (a) one selftest case per enumerated forgery probe named in the frozen rule, and
    (b) one kill per named mutant in the frozen mutant list; and its selftest drives the
    PRODUCTION call path (the entry point the live gate invokes on a receipt), not only the
    leaf functions the rule's clauses are built from. A frozen probe with no selftest case,
    or a named mutant with no killing case, is a coverage gap; the counter is not green until
    the gap is closed or the rule's wording is changed as a new claim. Red state: the
    round-59 chromium receipt counter's 91-case selftest had no `cancelable` case; probes A
    and B exited 0 with `findings []` and mutant C6 SURVIVED (`corpus/lessons/round-59.md`
    Mistakes 1). Second red state: the counter crashed on every receipt while its selftest
    passed, because the selftest drove leaf functions only (`corpus/lessons/round-59.md`
    Mistakes 3). Green state: round 60 kills C6–C9 and greens probes A, B, D, E in
    `corpus/lessons/round-60.md` Measurements, with 110/110 selftest cases.

## Round 61 additions

113. Validate frozen input grammar with the exact downstream command before
    freezing it; preserve original bytes when an attack finds a defect. A
    repaired input or changed receipt grammar after scoring is candidate work,
    not evidence that the original predicate passed. Red state: r61 snapshot
    header `lane<TAB>` gives exit 2 in the unchanged r60 wide counter; repaired
    `lane<TAB>head` gives exit 0 with the same heads. Both measured by Reviewer
    and Sentinel; original restored, repair separately named. See
    `corpus/lessons/round-61.md` Mistakes and the non-admitting integration
    disposition `.ufo/waves/round-61/DATA-PASS-RUNBOOK.md`.

## Round 62 additions

114. Pin existing instrument bytes before seats score them, not a future
    generation description. Mutation evidence names the exact counter digest,
    probe digest, argv and observed exit; invocation failure is not semantic
    refusal. Never transfer an earlier generation's kills to final bytes.
    Red state: round 61's earlier `f615a2f9` mutation pin differed from final
    `97f10e67`; `corpus/lessons/round-61-verifier-spotcheck.md` R2 routes the
    inconsistent final-byte wording. Round 62 freezes all instrument digests
    in `.ufo/waves/round-62/instrument-pins.json` before its wave; see
    `corpus/lessons/round-62.md` Mistakes for evidence and limits.

## Round 63 additions

115. A counter that reads a producer's own verdict must carry BOTH polarity
    negatives — producer-true/derivation-false and producer-false/derivation-true
    — and the exact source line that combines them must be mutated and run
    through the production CLI. A selftest that never makes the two disagree
    cannot kill an `&&`→`||` weakening.
    Red state: round 62's frozen counter greenlit a lying producer after its
    exact-line producer conjunct was weakened (survives 16/16); demonstrated
    again on this host at `.ufo/waves/round-63/controls/old-generation/result.json`.
    Green state: round 63's generation refuses both polarities
    (`controls/negatives-data/n1-…`, `n2-…`) and its M1 mutant false-greens
    exactly those two (`controls/mutation/matrix-data.json`). See
    `corpus/lessons/round-63.md` Mistakes row 1.

## Round 64 additions

116. A receipt the counter accepts is not evidence that the surface ran. Every
    capability whose target is "the counter exits 0" must also declare the
    cheapest no-work control that reaches the same target; if a synthesized
    artifact passes the checks, the demonstration must move to a live re-run
    (an instrument that executes the frozen driver itself) and the counter is
    evidence quality only.
    Red state: round 63's C1 was unprovable because a hand-written receipt with
    four 1x1 PNGs satisfied its counter
    (`corpus/lessons/round-63-verifier-spotcheck.md` §2).
    Green state: round 64 commits the synthesized-rendering control at exit 0
    (`.ufo/waves/round-64/controls/red-synthetic-rendering.command.json`) and
    the `--no-run` control at exit 1 with `live-run-required`
    (`.ufo/waves/round-64/controls/live-no-run.command.json`), and its C1 target
    is `scripts/verify-live-r64.mjs`, not the counter. See
    `corpus/lessons/round-64.md` Mistakes.

117. A declared negative must isolate the check it names: it mutates only the
    field that check reads, and the matching exact-line mutant must accept it.
    A negative refused by a second check silently hides a dead or redundant
    check, and the mutation matrix reports survivors that are not real.
    Red state: round 64's first negative set left five of sixteen mutants
    surviving (`cancelation` also tripped `scroll-event-witness`, `shot-bytes`
    also tripped every pixel check, `target-binding` also tripped the target id,
    `survivors` also tripped the sweep count) —
    `.ufo/waves/round-64/controls/mutants/matrix.json` before the fix.
    Green state: after isolating each negative the matrix reports
    `surviving: []` with all sixteen mutants killed; the 1x1-PNG class stays
    covered by the committed `red-one-by-one` control instead of by the
    negative. See `corpus/lessons/round-64.md` Mistakes.
118. A demonstration must verify the executable it runs against the claim's
    pinned digest; it may never derive its own "expected" digest from the file
    the caller handed it. When the demonstration's premise lives in one argv
    token, a control that changes that token must be refused, or the green
    proves only that some program ran.
    Red state: round 64's `scripts/verify-live-r64.mjs` hashes whatever
    `--driver` it is given and passes that hash to the counter as
    `--expect-driver-sha256`, so a 40-line substitute driver that never launches
    Chromium makes it exit 0 with predicate true, two "live" runs and full
    agreement in 561 ms (`.ufo/waves/round-64/w1/R64Reviewer/E3a.json`,
    `fake-driver.mjs`). The frozen claims name the pinned driver path in their
    after-command, so the scored run itself is not attacked, but no instrument
    re-checks the pin.
    Green state (next round's repair): the verifier compares `sha256(--driver)`
    with the claim's pin and refuses a mismatch with a named finding, and a
    committed control proves the refusal. Until then the round reports the
    scored green with `driverSha256 == 1ff560cc…b92db5` printed in the verifier
    output and discloses the gap as a limit. See `corpus/lessons/round-64.md`
    Mistakes.

## Round 65 additions

119. A gate's population selector must match the naming scheme of every committed producer population it claims to check. A green over a population the selector misses is vacuous: the count it reports is zero or partial, and it cannot demonstrate the claim. Red state: round 64's v1 matrix selector `^matrix.*\.json$` missed the scored population's `mutants-matrix.json` and `negatives-matrix.json`, so the positive control matrix-checked nothing. Green state: v2 selects `*-matrix.json` too and reports `matrices 2` on that population. The positive control must report a non-zero count of the thing it claims to check. (lesson: corpus/lessons/round-65.md#mistakes; scope row; MutTester2 calibration defect; Critic finding 4)

120. A ledger keyed by (lane, path, line) must refuse two different dispositions on one key rather than keep the first and ignore the rest. A later row that contradicts an earlier one is a finding of its own, not a duplicate to skip. Red state: round-62 v21 keeps the first row per key, so `overlap-declared` followed by `contested-open` on one hit line passes (`corpus/lessons/round-65.md` C1 forgeries; v21 predicate true 2 of 2). Green state: v22 refuses both forgeries with `delta-disposition-conflict` and accepts the real ledger. Limits: the refusal is order-insensitive (verified), but a conflict re-keyed to a trailing `:0` suffix is refused under another id (reviewer K1), so the conflict id is not the only guard. (lesson: corpus/lessons/round-65.md#mistakes; C1; reviewer attacks K1, O1)
121. A ledger rebind is an adjacency move only when it changes a disposition with an integrator ruling reference. A rebind that moves provenance columns (sha, lines, head) and audit notes and leaves every disposition unchanged is a freshness move and is declared as one. Red state: round-66 C1 reaches predicate true with zero disposition changes (`.ufo/waves/round-66/scored/c1-after.json`), and two critics read the axis as freshness (`R66Critic` F4; `round-65/w1/R65Critic`). Green state: the declared axis is the one the measured surface moves, and the adjacency score does not move without a disposition change. (lesson: corpus/lessons/round-66.md; R66Critic F4)

122. A meter whose disposition check is vocabulary-only does not evidence disposition correctness. Before a meter's green is cited as adjacency evidence, flip each disposition to every other in-vocabulary value and count survivors. Red state: round-66 found 149 of 149 line rows survive the flip sweep (`R66MutTester2`). Green state: a disposition-aware check that kills at least one flip per row. Until then the green is currency only. (lesson: corpus/lessons/round-66.md; R66MutTester2)

## Round 67 additions

123. A driver's own predicate is not evidence that the pixels it records show what its receipt claims. The frozen counter must re-derive every pixel-level claim (nonce grid, band colours, witness strip) from the committed bytes, and a driver that verifies only its own fields is a producer, not a demonstration. Red state: round-67 `measure/smoke2/receipt.json` reports `hscrollHypothesis CONFIRMED` while the nonce grid rendered all black (the fixture had dropped the `#noncegrid i` white-cell rule); the counter's `nonce-pixels` check exits 1. Green state: the rule restored, `measure/smoke3/receipt.json` CONFIRMED, counter exit 0 on the same bytes. (lesson: corpus/lessons/round-67.md Mistakes; R67Executor3; R67Critic1 A-C3)

124. A do-nothing control counts only after its behavioural change is measured. Before a degenerate copy of an instrument is cited as a control, the change must show in the instrument's own observable measurements; a copy that fails to run, or whose edit is equivalent, is recorded as invalid or equivalent and is neither a kill nor a survivor. Red state: round-67 M-A's first copy was a syntax error (exit 1, no receipt); M-C (container width) left the bands overflowing and was not a control; M-C2 (clipped container) leaves the window scrollable, so both driver and counter stay green. Green state: M-A replaced with the full statement (`REFUTED`, legs all 0); M-C3 (page overflow hidden, scrollLeft 0 on every leg) is refused by the counter (exit 1). (lesson: corpus/lessons/round-67.md Mistakes; R67MutTester1)

125. A disposition or ledger rule is checked against the data it governs before it is frozen. A rule whose refusal set is non-empty over the committed ledger, or that no legal row can satisfy, is withdrawn before freeze and its controls are committed as the record; it is not frozen and then scored as failed. Red state: the lexical BG-word disposition rule refuses 95 of 149 committed r66 rows (`no-tabi-ground`, zeroHit 0; `.ufo/waves/round-67/w1/R67Connector/report.md`), and the meter admits only BG-hit line rows, so the branch is unsatisfiable. Green state: the withdrawal with the executor's v23 run, the independent v22 flip baseline (298 of 298 accepted) and the reviewer's verdict committed before the freeze. (lesson: corpus/lessons/round-67.md Mistakes; R67Executor1; R67MutTester2; R67Reviewer1)

## Round 68 additions

126. An adjudication gate refuses a lane-authored adjudicator by identity, not by a literal name. Any identity carrying the lane name is the lane, including seat aliases. Red state: the pre-fix C1 gate exits 0 on `tabi-shokunin` (`controls/c1-forge-p5-prefix.json`) and on the seat alias `TabiR68a2` (`controls/c1-forge-alias-prefix.json`). Green state: both exit 1 with `adjudicator-author`; the real 49 rows still exit 0 (`controls/c1-real-postfix.json`). (lesson: corpus/lessons/round-68.md Mistakes M4; R68Review1 M3; R68Critic C1)

127. A quote in a worksheet or ledger binds to the cited line of the cited file at the pinned head, not to anywhere in the file. A line-swapped quote whose text appears elsewhere in the file is a finding of its own. Red state: the pre-fix gate exits 0 on two same-file rows whose quotes are swapped (`controls/c1-forge-p7-prefix.json`). Green state: `quote-off-line` on both rows (`controls/c1-forge-p7-postfix.json`). (lesson: corpus/lessons/round-68.md Mistakes M5; R68Exec1 P7)

128. A degenerate quote (`-` or under eight characters) and a verdict that disagrees with its status are findings, not silent passes. Red state: the pre-fix gate exits 0 on a `-` quote matching a `-` ledger quote (`controls/c1-forge-pdeg-prefix.json`) and accepts any verdict cell. Green state: `quote-degenerate` and `verdict-status-mismatch` (`controls/c1-selftest-postfix.json`, 20/20). (lesson: corpus/lessons/round-68.md Mistakes M6; R68Review1 M3)

129. Every new `scripts/check-*.mjs` gate has a canonical gate-kind registry row (eight fields, `--selftest`, pinned path, scope) in the round it lands, not a separate table. Red state: the canonical checker reports `e1-missing-row` for any convention-named gate with no such row (its own selftest case `missing-row`). Green state: `check-gate-registry --rev <commit>` lists both round-68 gates with no e1 finding for them. The lane's pre-existing five nonconformant gates at HEAD are routed, not fixed here. (lesson: corpus/lessons/round-68.md Mistakes M8)

130. A committed control receipt records the exit status captured on the line right after the command (`rc=$?` before any other expansion), and its exit must agree with its own stdout verdict (`red` ⇒ 1, `clean` ⇒ 0, `usage`/`unreadable` ⇒ 2). Red state: a recorder that read `$?` after a `$(…)` substitution recorded 0 for a do-nothing control whose counter printed `red` (round-69 L1, caught before commit). Green state: `.ufo/waves/round-69/controls/c1/donothing-head.exit.json` `"exit": 1` beside `donothing-head.out` `"verdict": "red"`. (lesson: `corpus/lessons/round-69.md` `## Mistakes` row 1)

131. A committed control names its expected exit AND the finding ids that must be present, and is evaluated mechanically; an exit-code match alone is not a kill. Red state: an exit-only runner accepted round-70 control-run 1, where every C2 forger control exited 1 because Chromium never launched (socket path too long), not because the counter refused; the evaluator on those restored findings reports `30/31 hold; failing: c2/forger-degenerate-js-scroll` (`.ufo/waves/round-70/lesson-proof/evaluator-wrong-reason-summary.json`). Green state: `node .ufo/waves/round-70/controls/evaluate-controls.mjs` → `controls 31/31 hold` (`controls/summary.json`). (lesson: corpus/lessons/round-70.md, Mistakes row 1)

132. A negative battery fails unless every check id its counter declares is the expected id of at least one case (`coverage-gap`). Red state: round 69's synthscroll battery left four counter checks without a negative (R69Mut2). Green state: `scripts/negatives-synthtap-r70.mjs` reads `check-synthtap-r70.mjs --list-checks` and reports `coverageGap: []` with 95 cases over 84 ids (`.ufo/waves/round-70/scored/c1-negatives-a.json`). (lesson: corpus/lessons/round-70.md, Mistakes row 3)

## Round 71 additions

133. A degenerate or look-alike control receipt carries its own control label, and the control evaluator refuses a control whose receipt label differs from the control's name (`label-mismatch`), whatever its exit code. Red state: an honest receipt filed as `degenerate-dispatch-wheel` fails the evaluator with `label-mismatch: receipt.degenerate=null` (`.ufo/waves/round-71/lesson-proof/mislabeled-summary.json`). Green state: `node .ufo/waves/round-71/controls/c1/evaluate-c1-controls.mjs --dir .ufo/waves/round-71/controls/c1` → `c1 controls 4/4 hold`. (lesson: corpus/lessons/round-71.md, Mistakes row 1)

134. An attack that did not land is never scored as a refusal: an attack harness records whether each attack's tampering happened, classifies an unlanded attack `NOT-LANDED`, and the predicate evaluator fails any summary that has one. Red state: the blanket-accept control verifier leaves both swap attacks unlanded and the evaluator reports `holds=false … attacks not landed 2` (`.ufo/waves/round-71/controls/c2/blanket-accept.eval.json`). Green state: `.ufo/waves/round-71/controls/c2/pre-r71.eval.json` holds with `notLanded 0`. (lesson: corpus/lessons/round-71.md, Mistakes row 2)

## Round 72 additions

135. When a live capability claim repeats its producer before the freeze, every receipt-reading leg of the predicate (counter, negative battery, kill power) is run over every pre-freeze repetition receipt, not only the counter, and a battery case whose mutation is relative to an honest value (`+=`, `-=`, scaling) must cross the counter's tolerance on every repetition receipt. Red state: round 72 ran the counter on 5 smoke receipts (5/5 clean) but the battery on smoke1 only; the battery on smoke3 and smoke6 exits 1 with `in-wheel-anchor-2px` (a +2 px shift of a wheel already at 399 lands at 401, inside the ±1 anchor tolerance) (`.ufo/waves/round-72/lesson-proof/battery-smoke3.json`, `battery-smoke6.json`), and the same case failed leg (c) on the scored receipt (`.ufo/waves/round-72/scored/c1-negatives-a.json`). Green state (measured on a proposal, not yet a frozen generation): with that case set to `AT.x + 2` absolutely, the battery exits 0 on all 9 available receipts while the frozen battery exits 1 on 3 of them, and against a counter copy whose anchor tolerance is widened to 3 the proposed battery exits 1 on all 9 (`.ufo/waves/round-72/w1/R72Exec2/battery-{frozen,proposed,widened}-*.exit`, `negatives-synthpinch-proposed.diff`). (lesson: corpus/lessons/round-72.md, Mistakes row 1)

136. A live-capability claim's do-nothing and forgery controls include a replay of a same-generation pre-freeze receipt — byte-identical, and with only its nonce and wall-clock stamps rewritten — and a predicate leg that reads only receipts counts as an independent or post-freeze run only if the counter refuses both replays. Red state: round 72's controls covered no receipt and the r71 receipt only; R72Critic's zero-edit copy of pre-freeze smoke1 and its nonce-and-stamp rewrite both score counter exit 0 clean, and the rewrite also passes the battery (218/218) and kill power (`holds: true`) (`.ufo/waves/round-72/w1/R72Critic/receipts/zeroedit.counter.json`, `forged-a.counter.json`, `battery-forged-a.json`, `killpower-forged-a.summary.json`); R72Review1 FG1 replays the scored receipt under a new nonce, exit 0 (`.ufo/waves/round-72/w1/R72Review1/fg05-nonce-replay.json`). Green state: a counter generation that refuses both replays (for example a `--not-before <freeze time>` bound plus refusal of a byte-identical pre-freeze receipt), with those two replays committed as controls before its freeze. (lesson: corpus/lessons/round-72.md, Mistakes row 3)

## Round 73 additions

137. A pre-freeze repetition result (QUALITY 135) is read through a summary that enumerates the expected receipt set and fails closed: a missing or unparsable counter, battery or kill-power output is red, never "not reported"; parallel evaluation streams are joined by that summary, not by reading whichever stream printed. Red state: round 73 launched the pre-freeze evaluation as two streams, one backgrounded with `( … & )` inside a tool call; it died without output, the surviving stream printed four green lines, and smoke2–5 had no battery or kill-power output at all. The fail-closed summary on that state exits 1 with 5/9 (`.ufo/waves/round-73/lesson-proof/prefreeze-summary-streamA-lost.{txt,exit,json}`). Green state: after re-running smoke2–5, the same summary exits 0 with 9/9 (`.ufo/waves/round-73/controls/c1/prefreeze-summary.json`). (lesson: corpus/lessons/round-73.md, Mistakes row 1)

138. A counter's replay refusal is only as wide as its prior set: the frozen prior set of a receipt-reading leg includes every committed receipt of every earlier generation whose receipts differ from the current generation only in identity labels (schema, nonce, driver pin), not only the current generation's pre-freeze runs, and a limit sentence names the prior-set boundary, not only the identifiers checked. Red state: round 73's frozen prior set held its own 12 pre-freeze receipts; R73Critic relabelled four identity fields of the round-72 scored receipt and of round-72 smoke1 and both pass the frozen counting command (`.ufo/waves/round-73/lesson-proof/forge-r72-relabel.pre-only.json`, `forge-legb-r72smoke1.pre-only.json`, exit 0). Green state: the same counter with the 87 committed r71/r72 receipts added as priors refuses both for the three replay ids (`*.crossgen.json`, exit 1), while the honest r73 scored and R73Exec1 receipts stay clean (`.ufo/waves/round-73/scored/c1-counter-{a,b}-crossgen.json`, exit 0). (lesson: corpus/lessons/round-73.md, Mistakes row 2)

## Round 74 additions

139. Before a live-capability counter is frozen, every rule it carries from another surface and every tolerance that separates a replay from an honest run is evaluated on all honest pre-freeze repetition receipts of the new surface, and the result is committed: a carried rule that refuses an honest receipt is re-derived (and sourced if it encodes a law), and a replay tolerance must refuse zero honest pairs with the measured minimum honest distance recorded beside it. Red state: the pinch generation's "every event trusted" rule passes 0 of 9 honest IME runs (`compositionend` is untrusted, S190–S192), and a 1 ms near-match tolerance refuses 1 of 36 honest pairs (minimum honest max-difference 1.0 ms) (`.ufo/waves/round-74/lesson-proof/prefreeze-defects.json`, exit 0 only while both old rules still fail). Green state: the frozen r74 counter carries a per-event trust vector and a sourced `trust-law`, and a 0.05 ms tolerance with a 0.1 ms quantum check that refuses 0 of 36 honest pairs while refusing the 1e-12 forgery (`.ufo/waves/round-74/controls/c1/controls-summary.json` `replay-forged-1e-12`). (lesson: corpus/lessons/round-74.md, Mistakes rows 2–3)

140. A frozen prior set is checked against the repository, not against memory: at the freeze parent, every committed file carrying the generation's receipt schema is enumerated (`git grep -l '"schema": "<schema>"' <freeze-parent> -- '*.json'`), and a receipt outside the prior set blocks the freeze until it is added or removed; a sentence claiming the prior set is complete cites that enumeration. Red state: round 74 committed three probe receipts of schema `tabi-chrome-cdp-imecompose-r74` in the pre-freeze commit outside PRE, and R74Critic's relabels of two of them pass legs (a) and (b) of the frozen predicate (`.ufo/waves/round-74/lesson-proof/prior-set-enumeration.txt`: 3 outside PRE at `b70e0a27`). Green state: with the probes added as priors the same relabels are refused for the three replay ids, and the round's scored and seat receipts stay clean (`.ufo/waves/round-74/lesson-proof/postfreeze-checks.json`). (lesson: corpus/lessons/round-74.md, Mistakes row 4)

## Round 75 additions

141. A prior-set enumeration by receipt schema keeps only files whose TOP-LEVEL `schema` is the receipt schema; a plain text grep is the candidate list, not the set, because any instrument output that records the receipts it read (a counter's `priorSet`) carries the same string. Red state: at the round-75 freeze parent `d71951a7`, `git grep -l '"schema": "tabi-chrome-cdp-dragdrop-r75"' -- '*.json'` lists 25 files — the 16 receipts plus the 9 pre-freeze counter outputs `pf-smoke1..9.counter.json` (`.ufo/waves/round-75/lesson-proof/prior-set-enumeration-raw.txt`). Green state: the top-level filter lists exactly the 16 lines of `controls/c1/prior-set.txt` (`lesson-proof/prior-set-enumeration-toplevel.txt`, diff empty). (lesson: corpus/lessons/round-75.md, Mistakes row 4)

142. Before a counter is frozen, its kill-power control is run once on a pre-freeze receipt and every semantic survivor is resolved by a battery case before the repetition pass; a battery case that perturbs a value by less than the instrument's quantum must not round the perturbed value back onto the quantum grid. Red state: the round-75 trial on probe p4 left four semantic survivors, one of them because `replay-timeline-sub-quantum` rounded its 0.04 ms prior shift back to the honest 0.1 ms grid values (`.ufo/waves/round-75/lesson-proof/killpower-trial-p4-survivors.json`, `holds: false`). Green state: after the alternating unrounded shift and three new cases, each former survivor fails exactly its new case (`lesson-proof/survivor-recheck-after-cases.txt`) and the 9 pre-freeze kill-power runs hold with 40/40 semantic kills and 0 crashed (`controls/c1/prefreeze-summary.json`). (lesson: corpus/lessons/round-75.md, Mistakes row 2)

## Round 76 additions

143. Before a new counter generation is frozen, every routed defect of the previous closure is re-derived against the NEW instrument bytes, not filed by the surface it was first found on: a defect about a rule or tolerance the new generation carries (a pair tolerance, a grid tolerance, a threshold) is applied to the new counter as a semantic mutant in kill power, and the battery holds a case on each side of that value, so the mutant is killed by a named case. Red state: round 75 filed r74 F4/F5 (pair tolerance 0.05 → 0.045, grid tolerance 1e-4 → 0.02) as IME-only, yet its drag counter carried both tolerances and both weakenings passed its battery 254/254 (`.ufo/waves/round-75/w1/R75Revenger/mutant-tol-0.045.battery.json`, `mutant-grid-0.02.battery.json`; round-75 lesson Mistakes row 5, `captured-by: none`). Green state: round 76's kill power carries both directions of each value and every pre-freeze run kills `M-timeline-tol-0.045` with `replay-timeline-tol-in-0.049`, `M-timeline-tol-0.06` with `accept-prior-tol-out-0.051`, `M-quantum-tolerance-0.02` with `event-time-quantum-bracket-2e-5` and `M-quantum-tolerance-1e-5` with `accept-grid-5e-6` (`.ufo/waves/round-76/controls/c1/pf/pf-smoke1..9.killpower.json`, 9/9). (lesson: corpus/lessons/round-76.md, Mistakes row 6)

144. Every rule of a counter — new rules as much as carried ones (QUALITY 139) — and every placement guard of its battery is run on ALL honest pre-freeze receipts, probes included, before the freeze; a rule tied to a timer or a measured duration states its floor below the smallest honest value with the measurement beside it, and a battery case that places a mutation relative to an honest receipt constrains only the quantity it brackets. Red state: pre-freeze pass 1 of round 76 refused honest smoke4 (`leg-records: start:elapsedMs`, a 300 ms settle timer read as 299 ms; probes p3/p4 also read 299 and were outside the pass) and misplaced the bracket cases on 7 of 9 smokes because they required the unbracketed fraction to be exactly 0 (`.ufo/waves/round-76/lesson-proof/prefreeze-pass1/`, `allOk false 2/9`). Green state: floor 290 with the 13-receipt measurement in the counter comment, brackets constrain the other fraction to below its threshold, the pass covers p1-p4 with the counter: `controls/c1/prefreeze-summary.json` `allOk true`, 9/9 + probes 4/4. (lesson: corpus/lessons/round-76.md, Mistakes rows 2-3) Correction (same round, R76Review3 F1): round 76 met this criterion for the counter only — its battery was not run on the probes, and on probe p2 two bracket cases fail closed (`bracket misplaced`, `.ufo/waves/round-76/w1/R76Review3/receipts/recheck-battery-probe-p2.json`); the green state above covers the counter and the smokes, not the probe batteries.

## Round 77 additions

145. A replay rule's fractions divide by quantities the forger cannot change — the PRIOR's own event and gap counts, never the receipt-under-test's own — and the frozen limit sentence is the counter's printed per-prior `limit` block (absNeed, gapNeed and the matched counts), not a hand-computed number; the battery holds a case at the stated minimum in which the receipt under test ADDS gaps. Red state: round 76's counter divided the gap match by the receipt's own gap count, so a forgery that changed one gap and added a seventh scored 5/7 < 0.75 and passed clean 131 (`.ufo/waves/round-76/w1/R76Critic/F2c-one-gap.counter.json`, exit 0; round-76 lesson Mistakes row "a limit sentence computed against a fixed denominator", `captured-by: none`; spot-check routed defect 1, unclosed twice). Green state: round 77's counter divides by the prior's counts; the control `replay-gaps-added-r76-escape` (a relabel that adds two own gaps) exits 1 `replay-event-timeline` (`.ufo/waves/round-77/controls/c1/controls-summary.json`), and the battery case `replay-timeline-gaps-added-own-denominator` kills the kill-power mutant `M-timeline-gap-denominator-own` (`.ufo/waves/round-77/controls/c1/pf/pf-smoke*.killpower.json`). (lesson: `corpus/lessons/round-77.md`)

146. A prior-set completeness walk reads every regular file of its trees whatever its extension or its case, follows symlinked files and directories (real paths de-duplicated), and refuses — never skips — a file that carries the schema string, looks like JSON and does not parse; files that other agents write while the walk may run are kept OUT of the walked trees by a rule in the wave dispatch contract that the spec builder checks mechanically before the dispatch is written. Red state: round 76's walk read only lower-case `*.json`, skipped symlinks and skipped unparsable files, and its seat-receipt rule (`*.receipt.txt`) was a convention in the context only (round-76 lesson Mistakes rows "a completeness check whose answer depends on files other agents write" and "a wave convention stated in the context but not enforced", `captured-by: none`; spot-check routed defects 2 and 5); round 77's kill-power mutants `M-walk-json-ext-only`, `M-walk-no-symlink-follow` and `M-walk-unparsable-skipped` restore those behaviours. Green state: each is killed by a named battery case (`prior-set-complete-txt-ext`/`-uppercase-ext`, `prior-set-complete-symlinked-dir`, `prior-set-unparsable-truncated`) on every pre-freeze smoke, and `.ufo/waves/round-77/build-spec.py` refuses a spec whose item lacks the seat-output rule (`lesson-proof/build-spec-refusal.txt`). (lesson: `corpus/lessons/round-77.md`)

147. A surface-novelty sentence ("no note covers X") is checked with a wide concept grep — the surface's own words, element and attribute names, its common verbs — besides the command names, and every hit of the wide grep is named in the sentence with what it does or does not cover. Red state: round 76's before-command grepped only `handleJavaScriptDialog|javascriptDialogOpening` (0 notes) while `\balert\b|confirm\(|\bprompt\(|beforeunload` finds three BiDi notes that measured one alert (`.ufo/waves/round-77/lesson-proof/novelty-grep.txt`; round-76 SCORECARD Correction 2, lesson Mistakes row "a novelty sentence checked with a grep narrower than the sentence", `captured-by: none`). Green state: round 77's note and claims state the wide grep (0 notes) and name the one `upload` hit (`webbridge-plugin-anatomy.md:85`, a plugin verb, not a measurement). (lesson: `corpus/lessons/round-77.md`)

148. An instrument whose output another instrument parses through a pipe writes that output completely before it exits (synchronous write, or `process.exitCode` instead of `process.exit()` after an asynchronous write), and the parsing instrument is run once at the full output size before the freeze. Red state: round 77's first kill-power trial classified 41 runs `crashed` with "summary unparsable": the battery printed a ~190 KB summary and then called `process.exit()`, which cut the pipe at 64 KiB (`.ufo/waves/round-77/lesson-proof/killpower-trial1-smoke1-pipe-truncation.json`; reproduced: `node -e 'console.log("x".repeat(200000)); process.exit(1)' | wc -c` prints 131072 on this host). Green state: the battery sets `process.exitCode`, the counter writes with a synchronous loop, and the full pre-freeze pass has `crashed: []` on every smoke (`controls/c1/prefreeze-summary.json`). (lesson: `corpus/lessons/round-77.md`)

149. A battery placement guard over a prior DERIVED from the receipt under test states the property it brackets — the quantity that decides the counter's verdict (a retiming beyond the tolerance from the event's own twin, a matched count below the prior's own need) — never an absolute count such as exactly 0; and a battery whose bytes changed after the pre-freeze receipts were produced is run at least once on a receipt produced AFTER that edit, because the pre-freeze set can hide a neighbour-dependent guard. Red state: round 77 attempt 2, `accept-prior-tol-out-0.051` demanded exactly 0 abs matches and threw `bracket misplaced: abs 2 (need 40)` on a fresh honest receipt whose events sat on adjacent 0.1 ms grid steps (battery exit 1; `.ufo/waves/round-77/lesson-proof/attempt2-battery-fresh-receipt-pass1.json`), while the counter's verdict on the same receipt was clean 183. Green state: the guard asserts the retiming and `placed(p, null, null)`, and the same fresh receipt is 336/336 (`attempt2-battery-fresh-receipt-pass2.json`).

150. A check binds only what the measured behaviour determines. An identifier the browser assigns per DOM serialization history (`Page.fileChooserOpened.backendNodeId` and its kin) is never pinned to a literal: the receipt is bound to the page-side element the leg recorded (tag, position, attribute) and the id is reported, not required. Red state: round 77's `leg-*-opened` required 5/7/14/18 and refused two honest cold runs of the same pinned driver in 25 observed runs (`.ufo/waves/round-77-seats/R77Exec1/counter.json`, one finding per leg on `#s`; `.ufo/waves/round-77-seats/L1-diag/r2.json`, `#m` → 10), failing claim leg (b) as frozen while every other per-leg field was identical.

## Round 78 additions

151. An instrument never writes its own JSON output into a tree another instrument walks: outputs go to scratch and are copied into the evidence tree only after the run. Red state: round 78's first pre-freeze counter run redirected its `--json` output into `.ufo/waves/round-78/`, and the walk parsed its own half-written file — `prior-set-unparsable: .../probe/p1.counter.json` (`.ufo/waves/round-78/lesson-proof/self-write-collision.json`). Green state: `run-prefreeze-gates.sh` writes to `$HYAKU_SCRATCH` and copies `pf/out/pf-*.json` after each run; the same pass then reports `prior-set-unparsable` empty. (lesson: corpus/lessons/round-78.md Mistakes row 1)

152. A capability row's first-working round must be a round whose recorded verdict is not `NOT VERIFIED`/`honest stop`, unless the row says `provisional`; the count is a committed instrument, `scripts/check-capability-status.mjs` (exit 1 on a mismatch), not a reading. Red state: at round-78 base the checker exits 1 with one mismatch — `chromium-file-chooser-linux` names round 77, whose C1 is NOT VERIFIED (`.ufo/waves/round-78/lesson-proof/c2-before.json`). Green state: after the repair the same command exits 0 with `mismatches=0` (`.ufo/waves/round-78/scored/c2-after.json`). (lesson: corpus/lessons/round-78.md Mistakes row 2; AXES *Capabilities* bars pre-claiming)

153. A prior-set exemption is a PATH and it is declared by the caller, never inferred from a receipt's self-claim: a walk exempts the receipt under test and any path passed as `--tree-exempt`, and a different file claiming the same nonce is refused. Red state: round 77 exempted by nonce, so a second receipt claiming the run's nonce was invisible (`.ufo/waves/round-77/w1/R77Review1`); round 78's first battery run then refused its own source receipt once the exemption became path-only (378 cases failing on `prior-set-complete`). Green state: `--tree-exempt` passed by the battery only, the contradictory-nonce and escaped-schema cases refused, and the escape case's own selftest case `tree-exempt-absent` (no flag) exits 1 with exactly `prior-set-complete`. (lesson: corpus/lessons/round-78.md Mistakes rows 2-3)

154. A battery refuses at build time any refusal case that declares no expected finding id, and a non-author witness carried from an earlier round is re-classified by its own kind (`must-accept` is an accepting case) rather than by its presence. Red state: carrying the 34 R77Mut1 witnesses into the r78 battery produced three refusal cases with `expect: null`, and the first run crashed in `lineOf(null)` (`.ufo/waves/round-78/lesson-proof/witness-import-crash.txt`). Green state: the guard refuses such a set before any run (`node scripts/negatives-filechooser-r78.mjs ... --work /tmp/x` exits 2 with `refuse case ... declares no expected finding id`), and the corrected set runs 398/398. (lesson: corpus/lessons/round-78.md Mistakes row 4)

## Round 79 additions

155. A battery carries one ISOLATING case per rule CLAUSE, not one per check id: a case that trips a broad check still passes when a narrow clause inside it is dropped, so kill power leaves that clause alive and the instrument only looks strong. Red state: round 79's first kill-power run left 30 of 70 counter mutants alive — `gesture-message-dropped` survived `gesture-law`'s ok-only case, `consumption-second-ok` survived the name-only case, `event-window-dropped` survived a case that broke monotonicity instead of the window (`.ufo/waves/round-79/lesson-proof/kp-run1.json`). Green state: one isolating case per clause (`gesture-name-only`, `gesture-message-only`, `consumption-second-contradictory-ok`, `cdp-open-id-zero`, `event-after-settle`, `send-expression`, `send-id-gap`, …), 88 cases, and kill power at 0 survivors. (lesson: corpus/lessons/round-79.md Mistakes row 1)

156. A rule is owned by exactly one check: a clause duplicated inside another check is dead weight — its mutant is unkillable because the owning check still fires — and the duplicate is REMOVED, never covered by a case. Red state: round 79's `host-argv` repeated `teardown-closure`'s survivor/port/curl clauses, `mode-law` repeated `fixture-descriptors`' `multiple` assertion, and `plan-calls` repeated its own trigger-id binding; four mutants survived by construction (`teardown-survivors-ok`, `teardown-ports-ok`, `mode-law-descriptor-dropped`, `plan-trigger-order-dropped`). Green state: the clauses removed, each rule owned by one check, kill power re-run with no survivor from that class. (lesson: corpus/lessons/round-79.md Mistakes row 2)

## Round 80 additions

157. An anti-replay rule may refuse only on evidence that differs between honest runs. A gap-duration side is not evidence when the driver's own fixed waits dominate it: round 80's honest scored receipt matched a prior's single gap within 0.05 ms and was refused, and a uniform +1 ms shift changed gap durations by ±0.1 ms through grid rounding, so the rule could be neither passed honestly nor bracketed soundly. Green state: the gap side is REPORTED in the counter's `limit` block and the refusal is pair-based; the limit sentence names the uniform-shift escape. Red state: `.ufo/waves/round-80/scored/counter-a.json` at D5 (`replay-event-timeline`, `gapMatched 1/1` on an honest run). (lesson: corpus/lessons/round-80.md Mistakes row 4)

158. A prior-set walk must decide what a receipt IS before it refuses: a file that merely QUOTES the receipt schema in prose is not a receipt. Round 80's walk refused the scored run on two seat reports (`w1/R80Exec3.md`, `w1/R80Exec3/report.md`) that quoted the schema string. Green state: an unparsable receipt must be a `.json` file or start with `{`; prose is skipped. Red state: `.ufo/waves/round-80/scored/counter-a.json` at D6 (`prior-set-unparsable` naming two markdown files). (lesson: corpus/lessons/round-80.md Mistakes row 5)

## Round 81 additions

159. A Gate quote count is checked with `wc -w` before filing, and its locator is the line range the quote actually occupies. Round 80's Gate stated S220 as 17 words at 2654-2656 (it is 14 words at 2654-2655) and S221 as 9 words (it is 7), a recurrence of the r79 defect-6 class. Green state: `printf '%s' "<quote>" | wc -w` is run for every new row and the count written beside the locator; the r81 Gate rows state 6 and 23 words with their line/paragraph locators. Red state: `corpus/lessons/round-80.md` Gate rows S220/S221 as filed. (lesson: corpus/lessons/round-81.md Corrections row 5)

## Round 82 additions

160. A cross-origin leg set must not overlap its own click targets. Round 82's probe legs placed the new `type=color`/`month`/`week`/`time` buttons in the same column as the existing `go3`/`go4` buttons at overlapping `top` values; the click for `sp82-cross-origin-nonfile` landed on `go5` instead of `go3` and the leg read `None` until the buttons were separated into two columns (go3/go4 at x=300, go5–go8 at x=160). Green state: a cross-origin leg's child events name the leg's own button; a leg whose child result is `None` after a click is a fixture defect, not a law. Red state: `.ufo/waves/round-82/controls/c1/probes/probe8.json` (`sp82-cross-origin-nonfile` child events `['go5', …]`). (lesson: corpus/lessons/round-82.md Mistakes row 1)

## Round 87 additions

161. A narrowing sweeps every distilled copy in the round that narrows it: the knowledge note, the plan, SKILL.md, the lesson and any ledger cell that repeats the wider sentence are each rewritten or explicitly marked, and a counting command enumerates the set. Red state: round 86 narrowed its `accept` law in the note and the lesson but left "never a validator" in `SKILL.md` and "filters the dialog, never a programmatic answer" in `plans/round-86.md`, caught by the round-86 verifier spot-check as defect 3. Green state: `node scripts/check-record-drift-round90.mjs --lane <ABS lane> --json` → 0 mismatches with the stale-phrase sweep inside claim `r89-narrowing-pointers` (through round 89 the citation was `check-record-drift-r89`), and the round-87 records carry only the programmatic-answer wording. Scope extended round 88: the sweep enumerates the SCORECARD tally set too — a blanket `selftest 9/9 → 10/10` edit across historical round sections is a mismatch (round-87 spot-check D1: seven sections rewritten with no evidence, invisible to that round's five statements). Green state from round 88: `node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json` → 0 mismatches with the per-section tally statement `scorecard-tallies` inside it. Green state from round 89: `node scripts/check-record-drift-r89.mjs --lane <ABS lane> --json` carries the same per-section tally statement against the r89 records.

162. A selftest fixture is causal, not absentee, and self-cleaning. The fixture's reds must be reproducible with each injected defect removed one at a time (removing the injected defect turns its statement green while the other statements stay red), and the fixture tree must be removed by the process that created it (the lane counts `HYAKU_SCRATCH/tabi-r89-driftfix-*` before and after; any survivor is a finding). Red state: round 88's drift fixture carried only Round 44 and Round 87 of the seven swept sections, so its `scorecard-tallies` red survived removal of the injected 10/10 (R88Mut1 `drift-selftest-fixture-swept-tally-removed`), and each run left a `tabi-r88-driftfix-*` tree behind (14 of them, cleaned by hand). Green state: the round-89 fixture carries all seven swept sections, the injected `selftest 10/10` in Round 44 makes `bad=["round-44-no-9","round-44-has-10"]` with `stray=[2]`, and the after-run glob count is 0.

## Round 90 additions

163. A DOM read that a claim binds is bound by the CALL that produced it, not by data the producer hands the checker. Round 89's domread legs carried `domRead` as a driver-recorded field and the counter bound its two fields; no check required the settle `Runtime.evaluate` on the leg's own send log, so a receipt with the data but no call passed (R89Review2 F1; the r89 spot-check's reject flip condition). Green state: the four domread legs' send logs carry a distinct `window.__inputs(true)` evaluate immediately after the settle `window.__state()` call, `plan-calls` requires it there and forbids it elsewhere, two battery cases strip and reorder it, and two kill-power mutants drop the requirement; round 90 measures 2 refusals on the mutated receipts. Red state: `corpus/evidence/round89/chromium-showpicker/receipt.json` under `scripts/check-showpicker-round90.mjs` → `plan-calls` findings on all four domread legs (`schema` first). (lesson: corpus/lessons/round-89.md §5 reject + §7 defect 2)
