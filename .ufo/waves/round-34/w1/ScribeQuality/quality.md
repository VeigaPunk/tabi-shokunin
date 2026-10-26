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
