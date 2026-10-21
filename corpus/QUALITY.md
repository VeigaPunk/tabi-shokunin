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
