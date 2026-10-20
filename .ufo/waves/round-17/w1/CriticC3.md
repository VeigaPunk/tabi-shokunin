VERDICT: ISSUES

# CriticC3 — attack on C3 (adjacency 8, checked sibling-overlap map)

Scope: the C3 contract in `PLAN.md:30-34,135-153`, read-only. No C3 artifact existed when I reviewed
(`corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`, `measure-c3.mjs` and `adjacency/` were all absent
from the round-17 glob), so I attacked the contract. Sibling repos were read with `git show`/`git grep` only.
Axes affected: adjacency (claimed), calibration (honest counting), operability (jj-safe anchoring).

## A1 — "A TSV of overlaps is an adjacency improvement." Verdict: needs-change
- Axis definition `AXES.md:16`: "evidence belonging to another domain reported, not absorbed | Lane
  reports name contested scope; integrator arbitrates". Tabi's own precedent scores reporting alone as
  *unchanged*: `SCORECARD.md:747` "adjacency | 8→8 | unchanged; kaidoku CDP-runtime overlap reported as
  contested". Moving prose into a TSV is bookkeeping unless the TSV adds something prose cannot give.
- Fleet precedent for what does earn the move: kagi 8→9 in round 16 (`kagi-shokunin` commit 8a6ec16) used
  `corpus/adjacency.tsv` against a census **denominator**. Its rule: "every census row outside them must be
  covered by a row below" (kagi `corpus/adjacency.tsv` header), with a per-row `token` ERE "so a basis
  cannot decay into a pointer at unrelated text". The plan's count, "verified adjacency dispositions 0→N"
  (`PLAN.md:33-34`), has no denominator. Because the file is new, its before value is 0 by construction.
  That is the same new-artifact count shape as `SCORECARD.md:255-258` (boundary .txt 0→4) and `:287-290`.
  A critic already flagged it once: `SCORECARD.md:418-419` "a mention-count can be gamed".
- Counterexample: the plan's enumerated list (`PLAN.md:32-33`) misses real overlaps that a counter-fixed
  sweep finds:
  - kasegi `SKILL.md:267` @922a4dd: "`fleets/claimer-mission.md` (CDP browser submissions," which is
    CDP-driven, operator-authed external submissions. It touches tabi's CDP discipline and its
    no-consequential-action refusal (`PROVINCE.md:17-19`).
  - kengaku `SKILL.md:39` @6180e4f: "Browser workflows | WebArena-Verified | Deterministic browser eval".
  - kaidoku's own CDP recipe uses `--remote-debugging-port=9222` (`kaidoku PROVINCE.md:53` @9011581).
    That is the-musketeer lease port, which the round contract forbids tabi from touching.
  A map without these still scores N>0. A row count measures effort, not awareness.
- Repair: make the count `dispositioned/denominator`. The counter fixes the denominator: every line of
  sibling `PROVINCE.md`/`SKILL.md` at each sibling's landed branch tip that word-matches a counter-owned
  vocabulary. I measured `-w -i 'tabi|CDP|chromium|webmcp|the-musketeer|crawler|remote-debugging-port'`
  → kagi 12, kaidoku 5, kake 3, kasegi 1 = 21 lines (plus `browser` adds kake 8, kaidoku/kasegi/kengaku/
  revenger 1 each). Each denominator line needs a disposition row or an explicit `no-overlap` row with a
  reason. Before = 0/M, after = K/M. Omissions then show as red, and the `no-overlap` calls are tabi's own
  discernment, open to non-author sampling. Also report drift: a quote that no longer occurs at the
  sibling's *current* branch tip is reported as `drifted` and not counted. That drift check is the only
  value a pinned map adds over prose.

## A2 — "Recording the integrator ruling counts as tabi's discernment." Verdict: fails as stated
- The decision is not tabi's. `corpus/lessons/round-16-verifier-spotcheck.md:138-142` was written by the
  integrator: `git blame --porcelain -L 141,141 5859243` gives author `protocol-shokunin
  <protocol@shokunin.local>`. Tabi's 88 commits are `tabi-shokunin <tabi@shokunin.local>`. Routed defect
  5 (`:152`) *instructs* tabi to cite it. Counting that row is credit for integrator work plus
  routed-defect compliance: one act paid twice.
- Self-ruling vector: `ruling_ref` accepts any `<lane>-shokunin` repo, tabi included (`PLAN.md:143-144`).
  The spot-check file is not gate-protected, because `protectedPath` only matches
  `^corpus\/lessons\/round-\d+\.md$` (`scripts/check-round-contract.mjs:116`). So a tabi commit could edit
  or append "ruling" text and cite its own commit, and the contract's checks would pass.
- Scope-extension vector: `:141` says "tabi owns live browser/CDP page observation" and does not name
  kaidoku. The same `ruling_ref` therefore "verifies" a `ruled` row for revenger ("browser/Electron runtime
  evidence", revenger `PROVINCE.md:5` @cf02419), kasegi, or anyone. That is false provenance: the ruling
  covers kaidoku only (`:142`).
- Coupling with C2: the ruling grants *observation* of the WebMCP page-tool surface. C2 *invokes* tools,
  which runs page code. If the C3 row or the PROVINCE append is cited as authority for invocation, tabi
  absorbs scope the integrator did not rule on.
- Repair:
  1. `ruled` rows count 0 toward C3; report them separately as routed-defect-5 closure.
  2. For lane-repo `ruling_ref`, require `git blame --porcelain` author-mail = `<protocol@shokunin.local>`
     at the pinned commit. This is a floor, not unforgeable, since identity is configurable.
  3. `ruling_quote`, or a `:N-M` range, must word-match both `tabi` and the row's sibling.
  4. The PROVINCE append quotes `:141` verbatim. It labels "invocation on tabi-owned loopback fixtures" as
     tabi's reading, not a ruling, and routes that reading as an open question.

## A3 — "The count is non-inflatable." Verdict: fails. Concrete passing forgeries under `PLAN.md:137-151`
1. **Self-quote**: `tabi_ref=corpus/adjacency.tsv`. Any `tabi_quote` is a substring of the file that
   contains the row, so it always verifies. Repair: forbid the TSV, `.ufo/**` and drafts as `tabi_ref`.
2. **Trivial quote**: "verbatim substring ≤25 words" has no lower bound, so `CDP` or `the` passes.
   Repair: require ≥6 words plus a per-row token ERE that the quoted line must match (kagi's `token`).
3. **Substring sweep blow-up**: `git grep -i -c tabi` across kaidoku = **4766** hits ("stability",
   "unstable"). Word-boundary matching gives 12, and all 12 are `.ufo/` wave chatter (e.g.
   `.ufo/waves/round-17/w1/ConnSiblingOverlap.md:16`). Repair: word-boundary only, and `sibling_ref`
   restricted to canonical surfaces (`PROVINCE.md`, `SKILL.md`, `corpus/knowledge`, `corpus/lessons`,
   `corpus/adjacency.tsv`), never `.ufo/**`.
4. **Row splitting**: one overlap becomes several rows, e.g. kaidoku `PROVINCE.md:53` and `:128` are both
   CDP runtime observation. Repair: unique key `(surface, sibling)`; the count is distinct keys.
5. **Unrelated L0 line**: `contested-open` accepts any "earlier tabi" `l0-questions.md` line. Fleet HEAD
   5348522 has only `:25` (round-5 operator approval for third-party URLs) and `:34` (namespace), neither
   about CDP or the musketeer lease, yet any contested row could cite `:25`. Repair: the L0 line must
   word-match the sibling and the row token. Note that seats cannot commit the fleet repo, so new
   contested rows are unreachable this round. Disclose this rather than let rows drift to the cheap
   dispositions.
6. **Unverifiable split**: for `split-declared`/`refused-route`, "both quotes must state the split" cannot
   be checked mechanically. Repair: count `split-declared` only when the *sibling* quote word-matches
   `tabi`, e.g. kake `PROVINCE.md:30` @7c61c8c "`tabi` drives browsers and owns client-side crawler
   discipline". Otherwise it is tabi's unilateral claim and must be `contested-open`.
7. **Pre-existing refusals recounted**: `PROVINCE.md:15-19` refusals were already scored in r1
   (`SCORECARD.md:100` "refusal routes `PROVINCE.md:15-19`"). Repair: rows whose tabi side is unchanged
   since baseline count in before as well. That is only possible with the denominator form in A1.
8. **Ambiguous route**: `PROVINCE.md:15` routes RE to "revenger/kaidoku". Kaidoku's own r17 scan reads it
   as "ambiguous pair, no arbiter" (kaidoku `.ufo/waves/round-17/w1/ConnSiblingOverlap.md:16`). A
   `refused-route` row needs one sibling. A pair is not a disposition; mark it `contested-open`.
- **Counter independence**: `measure-c3` re-implements the same spec (`PLAN.md:150-151`), and its only
  probe is "a counter-mutated row". That catches quote bit-flips and nothing in items 1-8. Repair: one
  mutant per vector above, each required to be red in both the checker and the counter.

## A4 — "Sibling anchoring is jj-safe." Verdict: needs-change
- C1 semantics are applied to tabi only. Sibling tips differ:
  - kaidoku has a `.jj` directory, HEAD detached at 9011581, branch `refs/heads/main`.
  - revenger is on `main`.
  - kagi and kake are on `master`.
  - `refs/heads/master` does not resolve in kaidoku or revenger (exit 128).
  A scout that pins kaidoku `HEAD` after a `jj new` would pin an unlanded commit that may be abandoned or
  garbage-collected. Repair: per row, require `merge-base --is-ancestor <commit>` against the sibling's
  landed branch, found as symbolic-ref → main|master. Unreachable means exit 1; a missing repo or object
  means exit 2, never 0.

## A5 — "C3 reports, not absorbs." Verdict: holds with one needs-change
- Holds: the plan reads siblings read-only, edits no sibling file, and leaves kaidoku's own follow-up to
  kaidoku. Kaidoku main still has no word-boundary `tabi` in `PROVINCE.md`/`SKILL.md`, so tabi must
  record that as `counterparty-unacknowledged` and not act on kaidoku's behalf.
- Needs-change: the-musketeer lease is a three-way contest per kake `PROVINCE.md:35-36` ("contested scope
  (kagi/tabi/kake) and stays with the integrator"). Kagi already dispositions it in kagi
  `corpus/adjacency.tsv:82` (owner `kake`, `contested`, `presence-only`). Tabi has **zero** musketeer text
  (`git grep -i musketeer HEAD -- PROVINCE.md SKILL.md corpus/knowledge corpus/README.md` → empty), so
  any tabi side would be written this round to fit the row. Any tabi disposition that names a kagi/kake
  owner adjudicates their contest, which is absorption.
- Repair: a tabi-only row that cites kagi `:82` and kake `:35` and states only tabi's own stance (for
  example, it disclaims the lease, which the round contract already forbids it to touch). It assigns no
  owner between kagi and kake.

## A6 — "A second convention under the same filename." Verdict: needs-change
- `kagi-shokunin/corpus/adjacency.tsv` already exists: 7 columns (`path owner status claim basis token
  note`), status vocabulary `contested|shared-read|unresolved|writer`, checked by kagi's
  `corpus/scope-gate.sh`. Tabi's plan uses the same filename with 9 columns and a disjoint vocabulary
  (`ruled|contested-open|split-declared|refused-route`). A fleet reader of `*/corpus/adjacency.tsv`, or the
  integrator, gets two incompatible authorities for the same musketeer surface.
- Repair: reuse kagi's `token` floor and directive style, or rename the file (e.g.
  `corpus/sibling-overlap.tsv`). Either way, shared surfaces cite kagi's existing row instead of a
  parallel disposition.

## Smallest safe correction (minimum set)
1. Make the count denominator-based (A1). `ruled` rows count 0 (A2).
2. Add these checker rules, each with a red mutant in both the checker and the counter: no self-referenced
   `tabi_ref`; ≥6 words plus a row-token ERE; word-boundary matching only; canonical sibling paths only;
   unique `(surface, sibling)`; L0 line matches sibling+token; split counts only if the sibling names tabi;
   integrator blame identity; sibling ancestry on the landed branch; drift reported, not counted.
3. Disclose in the lesson that contested rows are unfileable this round (fleet repo is read-only to seats).

## Not run
I ran no checker, counter or self-test; the artifacts did not exist. The C2 invocation-scope question
(A2) is [INFERENCE] about later use. Sibling refs are as read at the tips listed above.

Tooling: no installs or updates.

Files written:
- .ufo/waves/round-17/w1/CriticC3.md
