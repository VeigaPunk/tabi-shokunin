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
