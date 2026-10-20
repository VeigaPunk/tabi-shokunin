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
