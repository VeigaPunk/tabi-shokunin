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
