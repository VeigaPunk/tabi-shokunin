VERDICT: PASS

# ReviewSourcesShape — round-18 W1, SOURCES.md structural review

Scope: `corpus/SOURCES.md` (104 lines, lane tip `2bff864fdfee684ddbcd066cc8e735adaba2735c`,
identical to baseline B — `git status --porcelain corpus/SOURCES.md` empty, `git diff --stat
2bff864… -- corpus/SOURCES.md` empty) against CORPUS.md §SOURCES contract v1 (carried in full
from frozen `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`, CORPUS.md:69-72) and the round-18 PLAN.md
claims. No pacman/tool installs were needed or made.

## Validation runs (both read-only, both pasted verbatim)

1. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
   ```
   tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
   EXIT=0
   ```
2. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sources.mjs`
   ```
   SOURCES_GATE verdict=clean rows=57 tiers=A:46,B:4,C:7 status=queued:8,mined:42,rejected:7 findings=0 file=corpus/SOURCES.md
   EXIT=0
   ```
   Matches the PLAN.md start census (rows 57, A46/B4/C7, mined42/queued8/rejected7) exactly; no
   sibling seat has appended anything yet.

## Structure observed

- `# SOURCES` L1; `## Registry` L11 (header L13, divider L14, rows S001 L15 → S057 L71, 57 rows);
  `## Paths` L73 (7 paths: profile-isolation, protocol-choice, flake-receipts, accessible-selectors,
  native-webmcp, webmcp-invocation, jj-colocated-anchor); `## Search log` L83 (14 bullets L85–L98);
  `## Leads (unopened)` L100 (3 bullets). All four sections the gate requires are present.
- Superseding rows at B (teaches literally begins `supersedes S0NN —`), verified by raw line reads:
  S028→S004 (L42), S040→S039 (L54), S054→S047 (L68), S055→S049 (L69), S056→S050 (L70),
  S057→S053 (L71). 57 − 6 = 51 = the C1 recheck target in PLAN.md ✓.
- Next free id: **S058** (no row beyond S057; gate `duplicate_id` findings=0).
- Search log shape (does it exist): yes — prose bullets, convention
  `YYYY-MM-DD · <name/seat list>. Question: … Searched … Identified N, screened N, included N
  (S###–S###), excluded N: <reasons>. Stop: <rationale>.` matching contract rule 5
  (CORPUS.md:120-122). Known in-file deviations (integrated history, not new): two round-14
  bullets carry no leading date (L93 `Registry preamble qualification (round14):`, L94
  `Round14 bounded reopening census:`); L89 (L1 re-open spot-check) and L90–L91/L95 (bounded
  reopenings) carry no identified/screened counts because no discovery query ran; L96
  (round-16 w1) explicitly declines totals ("not claimed: fifteen seats searched independently
  and their per-seat counts were not normalised").

## Structural risks for round-18 appends

1. **S058 is already reserved by C3/D4.** PLAN.md C3: "SOURCES row S058 `supersedes S057 —`";
   counter d4 requires S058 exists, teaches starts `supersedes S057 —`, and no S058 cell contains
   "individual publisher". C2's rows are declared "S059+". Any draft that takes S058 for a C1/C2
   row breaks d4; the id order must be S058=D4 first, then C2/C1-drift rows. Ownership rule
   (PLAN.md: SOURCES integrated by L1 from scribe drafts) is the only guard — no seat should
   append to SOURCES directly.
2. **Duplicate-URL trap for non-superseding re-citations.** The gate flags a repeated normalized
   URL unless that row's teaches starts `supersedes S[0-9]{3,}` (check-sources.mjs `duplicate_url`
   logic). S058 clears it by its mandated prefix, but a C1 drift row or C2 row citing a URL
   already in the registry (e.g. a Playwright docs page already held by S013–S017, or
   developer.chrome.com pages S032/S047/S048) must open teaches with `supersedes S0NN —` even if
   it is conceptually an *additional* row, not a supersession — otherwise the gate fails. The
   check is order-dependent: first occurrence wins, later ones need the prefix.
3. **Supersession chains are unchecked.** The gate does not verify that a `supersedes S0NN`
   target exists or is the latest predecessor (a `supersedes S999` passes silently). D4/C1-drift
   drafts must be reviewed by L1 for target correctness; PLAN.md's superseded-at-B set (6 rows)
   is frozen text the C1 counter re-derives, so new round-18 supersessions do not join it.
4. **In-place status/recheck/used-by changes are invisible to the gate.** Contract rule 2
   (CORPUS.md:107-109) permits only status/recheck/used-by in place, each logged old→new in the
   round lesson; check-sources.mjs has no history view, so a silently flipped cell passes
   validation. Precedent to copy: S037 queued→mined logged in the round-16 w2 search-log bullet
   (L97) and the round lesson. Every C1-driven cell change must carry its old→new line in
   `corpus/lessons/round-18.md`.
5. **used-by is verified semantically, not just for existence.** `inspectUsedBy` requires the
   cited file to *contain the row id as a standalone token* (`used_by_uncited` otherwise) and the
   path to be inside the lane root and a regular file (`used_by_missing`/`used_by_escape`). New
   S059+ rows (C2: Playwright launch/context/CDPSession docs, Node signal docs, Chromium switch
   source) must cite a committed file that literally contains the id — integration order matters
   (target file must exist in the tree when the gate runs, or the gate goes red).
6. **recheck vocabulary is closed.** Gate accepts ISO date, `Nd`, or exactly `on-release`
   (check-sources.mjs:322). The round-14 preamble-qualification bullet (L93) already records one
   pre-admission correction (`on-change` unsupported). C1/C2 rows must not invent cadences.
7. **Column discipline.** `fields.length !== 13` fails the row; any `|` inside a cell (quoting a
   shell pipeline or the table itself — plausible for C2 harness rows or D5 rerun receipts)
   silently changes the field count. Existing rows are pipe-free; drafts must stay so. Prose
   rows are long (S042/S046 exceed 700 chars) but that is display-only truncation, not a defect.
8. **rejected rows must carry both markers.** `rejected_without_flip` requires the teaches cell
   to contain `REJECTED:` and `flip:` (S057 satisfies both inside its `supersedes S053 —` prefix,
   L71). Any round-18 rejection row (S058 is one) must keep both.
9. **`opened`/`--since` coupling.** `bad_opened` fires if opened is not ISO or is older than an
   explicitly passed `--since`. Round-18 rows dated 2026-10-20 are safe today; a backdated draft
   would fail if L1 validates with `--since 2026-10-20`. Whether L1 passes `--since` at
   integration is not stated in PLAN.md [INFERENCE-free observation: start census ran without it].
10. **Preamble drift.** L4-6 still say "Every row below was opened in kaika fleet round-1" — true
    only for S001–S028; S029–S057 rely on the round-14 qualification bullet (L93). Round-18 rows
    (S058+) widen the drift; per precedent the round-18 search log should carry its own
    qualification bullet (or L1 updates the preamble as a logged prose change — the contract's
    append-only rule speaks to rows, leaving the preamble's status ambiguous).
11. **Search-log entry for round-18.** Rule 5 elements are content-checked by no tool; the
    round-16 w1 precedent (totals declined with an explicit one-line reason) is the honest shape
    for a multi-seat wave; the two undated round-14 meta-bullets should not become the template —
    new bounded-search notes keep the dated bullet shape.
12. **Paths section is gate-invisible.** Row ids inside `## Paths` bullets are never validated
    (a typo'd `S958` in a path bullet passes). If round-18 adds paths (C2/C1 likely reference the
    round-18 lesson, and the existing `webmcp-invocation` path already spans S041–S048 which
    S054 supersedes), the ids must be hand-checked; also note the existing paths still cite
    superseded predecessors (e.g. none cite S047/S053 directly — verified: paths cite S047 and
    S048; S047 is superseded by S054 but remains a path member, which the contract permits as
    append-only history).

## Residual risk / verification gaps

- I did not re-derive the six supersession targets against live sources (C1's job, wave lanes
  own it); my check is textual (teaches prefix + id correctness) on the committed rows.
- Gate coverage claims (checks listed in risks 2–9) are read from
  `scripts/check-sources.mjs` `evaluate()`/`inspectUsedBy()` (lines 203-343) plus its exit-0 run;
  I did not execute the gate's self-test fixture suite (`--self-test`), and the awk parity in
  `parityCheck` was exercised implicitly by the clean run only.
- Whether L1 will run `check-sources.mjs --since` at integration is unknown from PLAN.md.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReviewSourcesShape.md
