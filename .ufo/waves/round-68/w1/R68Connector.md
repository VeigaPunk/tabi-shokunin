# R68Connector — C1 axis analysis: do the 49 pending worksheet rows move adjacency?

Date 2026-11-05. Seat R68Connector (connector, leaf, no subagents). Judged axis: adjacency. Read-only
round: no production edits, no git mutations (read-only `git show`/`rev-parse` only), no sibling writes,
no installs (none needed). Scratch `/fast/scratch/hyaku/tabi-r68/R68Connector` deleted before yield;
evidence persisted to `.ufo/waves/round-68/w1/R68Connector/`.

## 1. Independent recount at the pinned r66 heads

Regenerated the worksheet independently before assessing (assignment requirement, post r[5]→r[6] fix):

- Producer: `.ufo/waves/round-68/counters/build-worksheet-r68.mjs` sha256 `85e168020e95634c875b93b5384940805e9a0bec0d7f0e0a63a375d616a31750`.
- Command: `node .ufo/waves/round-68/counters/build-worksheet-r68.mjs --ledger .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --out <scratch>/worksheet-regen.tsv` → rc 0, stdout `{"ok":true,"rows":49,...}`.
- Input pins: ledger sha256 `3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105`, snapshot sha256 `a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74` — both equal the r66 spotcheck's pins (round-66-verifier-spotcheck.md §2).
- Output sha256 `a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91`; `diff -u` against the existing `corpus/adjacency-adjudication-r68.tsv` → rc 0, byte-identical (49 data rows + header). The committed production worksheet is the corrected-generator output.
- Quote-column check: ledger header is `type lane path provinceSha256 lines bgHits quote disposition head`; quote is r[6], disposition r[7]. The regen emits r[6]; the pre-fix r[5] would have emitted bgHits (`-` or an integer), which the gate would flag as `quote-mismatch` on every row (gate compares worksheet quote to ledger r[6]). The correction was necessary and is now consistent.

Recount (my own parser over the ledger, agreeing with the generator and the r67 spotcheck's census):

| disposition | rows |
|---|---|
| no-tabi-ground | 95 |
| contested-open | 49 |
| overlap-declared | 5 |

Contested-open per lane at pinned heads: kagi 2, kaidoku 39, kake 1, kama 5, revenger 2 (sum 49).
Ledger lane-head vs snapshot-head agreement: 20/20 lanes, 0 mismatches.

## 2. What the r65–r67 spotchecks actually key the adjacency verdict on

- r65 (round-65-verifier-spotcheck.md): C1 v22 (duplicate-key disposition-conflict refusal) "verifies on its frozen predicate", but the Critic refused the axis ("axis mis-assigned"); L0 `tabi | round-65` filed (fleet `.ufo/l0-questions.md:316`).
- r66 (round-66-verifier-spotcheck.md §2–3): C1 rebind, 40 stale findings → 0, **0 disposition changes** → "the declared adjacency claim is not evidenced as adjacency… a freshness move… graded unchanged." R66MutTester2: 149/149 in-vocabulary disposition flips survive the meter (disposition-blind; QUALITY 122). L0 `tabi | round-66 | C1 axis ruling` (`.ufo/l0-questions.md:323`).
- r67 (round-67-verifier-spotcheck.md): C1 v23 withdrawn before freeze — "disposition is semantic adjudication, not a counting predicate"; independently re-derived: all 95 no-tabi-ground rows already carry ≥1 BG word, so the lexical rule is unsatisfiable by construction; R67MutTester2 298/298 flips accepted. Round not admitted; L0 `tabi | round-67` (`.ufo/l0-questions.md:334`) asks exactly: how should adjacency move when disposition is human adjudication — "(a) a per-row non-author adjudication record with a verifier, or (b) a new predicate; or (2) retire or split adjacency". This L0 is unanswered ("L0 r67 unanswered").

So across three rounds the non-author closure standard is stable: **adjacency moves only when contested dispositions actually change, and no counting predicate can substitute.**

## 3. Answer: bookkeeping, with one real verification payload

The 49-row pending worksheet is **bookkeeping, not an adjacency move** — by the exact standard r66 and r67 closures applied:

- It changes no sibling bytes, no ledger disposition, no meter term, no PROVINCE/adjacency.tsv row. The measured adjacency delta is 0.
- What it does do is real but instrument-shaped: it converts the contested surface into a per-row adjudication record, binds every quote byte-exact to a pinned head (the gate's `quote-unresolved`/`head-mismatch`/`path-unresolved` checks), and enforces polarity — at freeze every row `pending-non-author` with clean cells, and `adjudicator-author` fires if tabi (or any lane) fills the cells. It is precisely L0-334 option (a), built before the operator has ruled on it.
- Honesty requirement (assignment): the rows are **pending-non-author records, not adjudications**. The worksheet never pretends otherwise; neither should the claim. Declaring C1 as "adjacency improved" would repeat the r66 failure mode the closure already rejected (do-nothing laundering). The honest declaration is adjudication-readiness (calibration/operability shape), adjacency held at 8.

## 4. New measured fact: the contested surface is current, not stale

Drift probe (`drift-probe-r68.json`, full receipts) — for each of the 49 rows, quote containment at the
pinned r66 head and at the sibling's current live HEAD (read-only `git show`):

- Live HEADs: kagi `6742fdef`, kaidoku `73a88271`, kama `9b4c7af1` — all three **moved** since the r66 pin; kake and revenger unchanged.
- Quote resolution: **49/49 at pinned heads, 49/49 at live heads, 0 stale.** Three head moves touched no contested sentence.
- Consequence: no contest is dissolvable by staleness (the r66-style currency move has nothing to rebind here), and every row's evidence a future non-author would read is byte-current.

## 5. The 49 rows are one boundary family, not 49 contests

Every contested quote is the loopback CDP `9222` browser surface: kagi PROVINCE.md:64/:83 (musketeer
chrome-profile + lease, "reported to the integrator, never adjudicated here"), kake SKILL.md:161 (profile
serializes the whole session), kama listener-census.md C12 rows ×5 (port 9222 census), revenger
PROVINCE.md:30/:33 (rea-cdp-browser provider), kaidoku 39 rows (CDP capture/observation knowledge vs
tabi's browser-driving ground). One contest — self-launched/connect-mode CDP observation and control —
spanning 5 lanes and 49 ledger rows.

## 6. Smallest real adjacency move possible without an operator/non-author ruling

**No measured adjacency movement is available to tabi alone this round — and that is a proved bound, not
a cop-out:** disposition changes require a non-author (gate `adjudicator-author` + freeze polarity) or the
operator (L0-334 unanswered), and r67 re-derived that no counting predicate can decide disposition. The
smallest real move is therefore the one that makes the single future non-author decision well-defined and
cheap. Concretely, three sub-moves, all author-side and gate-compatible:

1. **Keep the worksheet gate-exact; put facts in a sidecar, not columns.** The gate requires exactly 9
   cells and fires `pending-fields-dirty` on any non-`—` cell, so a `resolves-at-live-head` column would
   break it. A sidecar annex (like `drift-probe-r68.json`) carries the live-head resolution per row
   without touching polarity.
2. **Record the one-family classification (49 rows → 1 CDP-9222 boundary family, 5 lanes) as fact, not
   verdict.** This turns a future ruling into one decision instead of 49, which is the only lever that
   can move the axis materially next round: one non-author ruling resolves up to 49 rows at once.
3. **Declare C1 on its true axis.** Claim the record+verifier as calibration/operability (it verifies
   resolvability and polarity — both demonstrable red/green), declare adjacency unchanged at 8, and point
   at L0-334: the worksheet is option (a) awaiting the ruling. This satisfies the do-nothing
   discrimination the round context demands instead of repeating r66's rejected laundering.

Rejected alternatives, with reasons: re-dispositioning "self-refusing" rows (kagi:83 declines to
adjudicate — that strengthens `pending`, it does not dissolve the contest) is adjudication by the author,
gate-forbidden; sharpening tabi's own `corpus/adjacency.tsv` CDP row is author-side bookkeeping with zero
disposition movement (r65 Critic precedent: don't carry it as adjacency); a freshness rebind is moot (§4:
nothing is stale).

## 7. Risks / second-order effects

- The annex is per-round evidence: if regenerated only once it becomes the next stale artifact (freshness
  debt, the r66 lesson). Regenerate at each freeze that cites it.
- The one-family framing could bias a future adjudicator toward a single verdict; mitigation: the annex
  states byte-facts only (quote resolution, family membership), adjudication cells stay clean, and the
  gate keeps the non-author requirement.
- No harm surface: no sibling writes, no meter change, no claim polarity change; C2/C3 unaffected.
- Gate rigidity discovered: `pending-fields-dirty` makes the worksheet schema closed — any future fact
  column is a gate change (new generation), not an amendment.

## 8. Receipts

- Generator run: rc 0, stdout `{"ok":true,"rows":49,"out":"<scratch>/worksheet-regen.tsv"}`; producer sha `85e168020e95634c875b93b5384940805e9a0bec0d7f0e0a63a375d616a31750`; input shas in §1.
- Production-vs-regen `diff -u`: rc 0 (identical).
- Drift probe: 10 `git rev-parse`/`git show` families over 5 sibling repos + 49×2 containment tests, all rc 0, zero mutations; per-lane heads and resolution counts in `drift-probe-r68.json`.
- Not run (owner seats): gate 15-case selftest and C2 7-case selftest (Exec seats); frozen v22 meter (L1). C2 instrument pinned: `scripts/check-adjacency-adjudication-r68.mjs` sha256 `55c6acbc5c9fd634a12ddf0881a03ae67c8e751fde7d30cc01c4639e3330f17f`; registry checker `scripts/check-instrument-registry-r68.mjs` sha256 `091933a027a325a8a616ffd02f01c0dec1f4bb67bd13b8689d12e88f981dc054` (unexamined here — C2/C3 seats' scope).
- L0 records read: fleet `.ufo/l0-questions.md:316,:323,:334` (r65/r66/r67 adjacency-axis questions, all unanswered).

## Report trailer

Paths relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Evidence persisted:
`.ufo/waves/round-68/w1/R68Connector/worksheet-regen-r68.tsv`,
`.ufo/waves/round-68/w1/R68Connector/drift-probe-r68.json`. Scratch deleted; no other file touched.
