VERDICT: BREAKS

Attacked: `corpus/adjacency.tsv` data row 8 (file line 9) at M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` —
surface `cdp-consequential-submissions`, sibling `kasegi`, disposition `refused-route`. Re-verified both pins
and the shared quote, then attacked the disposition itself.

## Pin + quote verification (all observed)

- Pin reachable from the sibling's tip: `git -C kasegi-shokunin rev-parse refs/heads/master` →
  `922a4dde90b60b465e2b8b241d1fe363f1f27e98`, exactly the pinned commit. `check-adjacency --json`
  `tips["…/kasegi-shokunin"] = "refs/heads/master"`.
- Sibling quote verbatim on the pinned line:
  `git -C kasegi-shokunin show 922a4dde…:SKILL.md | sed -n 267p` →
  `Sibling L1s: \`fleets/claimer-mission.md\` (CDP browser submissions,` — identical to the row's
  `sibling_quote` (6 words). Line 268 continues `operator-authed), \`fleets/review-mission.md\` …`.
- Tabi quote on `SKILL.md:727` at M: C4 row
  `| C4 | Third-party consequential (purchases/posts/deletions/submissions) | **operator-approval-required — lane execution refused; approval routes the act to the operator** | …`
  Both `tabi_quote` and `ruling_quote` of row 9 are verbatim substrings of this one line.
- Structural checks pass at M: `node scripts/check-adjacency.mjs --at 6c97851… --json` → `verdict: clean,
  rows: 9, verified: 9, findings: []`; `node .ufo/waves/round-17/measure-c3.mjs 6c97851…` → `c3=9`,
  `by_disposition {refused-route:4, split-declared:2, contested-open:2, ruled:1}`, row 9 `verified:true`.
  So the attack is semantic, not a pin break.

## Disposition attack — all four tests fail

1. **Does a split/route exist on both sides?** No. Tabi's quoted line routes the act to *the operator*, not to
   any lane. Kasegi's quoted line is an inventory bullet: line 261 reads `Mission L1s are 584 generated
   fleets/missions/<program>.md assignments`, and `kasegi-shokunin/corpus/knowledge/mission-control.md:116-120`
   titles the same documents `## Sibling L1 contracts` and calls the claimer mission
   `the external-effect lane: operator-authenticated burnerchrome at CDP 9222`. "Sibling L1s" here means
   kasegi's own mission-doc contracts, not a shokunin sibling lane. `git grep -i 'tabi'` over kasegi at the
   pin = 0 hits, so the sibling side never names tabi and states no split or cession.
2. **Does the ruling cover this sibling?** No — and none is cited (`ruling_ref` `-`). The only `ruled`
   venue on the map is `corpus/lessons/round-16-verifier-spotcheck.md:141-142` and it names tabi and kaidoku
   only. Fleet L0 has three `tabi |` rows (`:25`, `:34`, `:62`); 0 name kasegi; `:62` names kagi/kake
   (`rule the lease owner between kagi and kake, or declare the split`). So neither `ruled` nor
   `contested-open` was available — but the row did not have to claim `refused-route` either.
3. **Is a refused-route really tabi refusing?** No. Tabi's refusal list (`PROVINCE.md:15-19`) is
   `reverse engineering as forensics (→ revenger/kaidoku), web *publishing* (→ kake), secrets (→ kagi …)` —
   kasegi is absent — and the consequential-act sentence has no lane target: `Never performs consequential
   actions on external sites (purchases, posts, deletions); observation and operator-approved interaction only.`
   The map's own convention agrees: the other three `refused-route` rows (`:3`, `:4`, `:8`) all quote tabi
   text carrying an arrow to the named sibling (`→ revenger/kaidoku`, `(→ kagi`). Row 9 is the only
   arrowless one, and its arrow points at the operator. Kasegi's side says the same thing:
   `SKILL.md:229-231` `SUBMITTED (3) and DISCLOSED_FREE are operator-attributed ledger facts, never fleet
   actions`; `PROVINCE.md:49` `Live-target testing is refused; this corpus is documentation only`.
4. **Real overlap or passing mention?** Passing mention wrapped around a real subject overlap. The act class
   (`CDP browser submissions`) genuinely intersects tabi's C4, but the pinned kasegi line is a mission-control
   inventory bullet, and both sides' text places the act under operator approval — a **shared operator gate**,
   not a split and not a tabi→kasegi route. Note the one word that would have shown the shared gate
   (`operator-authed`) sits on line 268, outside the single-line quote window; the row quotes only the mention.

Truth: the honest relation is "both lanes route third-party consequential submissions to the operator".
None of `ruled | contested-open | split-declared | refused-route` expresses it, and `refused-route` is false.

## Why the gate and counter cannot see it (mechanism; observed)

- Checker split branch `scripts/check-adjacency.mjs:766-781` checks only `ruling_quote ∈ <tabi file>`; this
  row's `ruling_quote` re-quotes the very line 727 its `tabi_quote` came from. A sibling-side statement is
  never required. `measure-c3.mjs:623-635` is the same rule, and none of its seven mutations probes
  split/refused semantics (all seven target quote presence, pins, self-citation, duplicates).
- Proof by mutation in a sandbox clone at M (`/tmp/tabi-r17w2-AdjRow8-iBJ1/tabi-shokunin`):
  - P1 `a10de58`: row 9 `sibling_ref`/`sibling_quote` → `kasegi@922a4dde:PROVINCE.md:44`
    `chousa — research method and source hierarchy` (no CDP, no split, no route) → checker still
    `{"verdict":"clean","verified":9,"findings":[]}`.
  - P2 `dfa65ed`: additionally `ruling_quote` → `SKILL.md:556` `a fresh throwaway profile per run under the
    run's own output dir` → checker still clean 9/9 and `measure-c3` still `c3=9` with row 9 `verified:true`.
  So the row is label-only in exactly the sense C1-v2 forbids: the gates certify byte positions, not the
  disposition's claim.

## Concrete repair

1. Preferred: **drop row 9**; `c3_adjacency_verified` 9→8. No closed-vocabulary disposition is true, and the
   sibling line names no lane relation; record kasegi as a sweep-only finding with that reason.
2. If the overlap is kept (the act class is genuinely tabi-adjacent): add a fifth disposition
   `shared-operator-gate` to PLAN §C3, `check-adjacency.mjs`, its `--self-test`, and `measure-c3.mjs`, with a
   rule that **both** quotes must carry an operator/approval token and that `ruling_ref` = `-`; re-pin the
   sibling quote to `mission-control.md:119` `authenticated burnerchrome at CDP 9222` (or `SKILL.md:230`
   `operator-attributed ledger facts, never fleet`), keeping tabi `SKILL.md:727`.
3. Harden the `split-declared`/`refused-route` branch regardless: require `sibling_quote` to match a
   route/split predicate (`owns|refuses|routes|split|→|never|operator`), require `ruling_quote` to sit on a
   different line than `tabi_quote`, and add counter mutations `split_silent_sibling` and
   `split_same_line_requote` (both pass today — proved at `a10de58` and `dfa65ed`).
4. Recount; do not let this row (or a re-labelled successor) count as `refused-route`.

Remaining unknowns: `fleets/claimer-mission.md` itself is absent at the kasegi pin
(`git cat-file -e 922a4dde:fleets/claimer-mission.md` → `does not exist`), so the claimer mission's
operational bytes are only corpus-attested (`mission-control.md:116-126`), not verifiable from the sibling
repo. This does not change the disposition finding.

Files written: `.ufo/waves/round-17/w2/AdjRow8.md` (lane-relative). Sandbox
`/tmp/tabi-r17w2-AdjRow8-iBJ1` retained as the cited falsification witness (P1 `a10de58`, P2 `dfa65ed`,
47 MB); delete after review. No tools installed or upgraded.
