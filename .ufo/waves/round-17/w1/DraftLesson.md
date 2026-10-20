VERDICT: ISSUES

Scope: skeleton of `corpus/lessons/round-17.md` as a draft for L1 integration, written to
`.ufo/waves/round-17/drafts/lesson-r17.md` (lane-relative). Gate, Mistakes, SOURCES transitions and
Census headers mirror `corpus/lessons/round-16.md` (`## Gate` :12, `### Rows opened this round` :35,
`### Registry transitions` :57, `### Census` :73, `## Mistakes` :81-94). Counts, REV and new S-rows are
`[pending]` by design: they come from the counters and scouts, not from this draft.

## Behavior

- Pre-filled Mistakes: four rows as assigned. Each carries an evidence pointer and `captured-by` (`none`
  or a partial reference, named). Fix column names the falsifier for each.
- Gate: per-claim admit conditions for C1/C2/C3 taken from PLAN.md:87-151; rejected list from PLAN.md
  :46-51 and round-16 `corpus/lessons/round-16.md:28-33`; per-source table with URL/date/≤25-word quote
  columns, rows left `[pending]` (scouts named in `.ufo/waves/round-17/w1/spec.json` around :134-170).
- Routed defects: the five in PLAN.md:157-169 plus carried debt (spot-check :153, :156).

## Findings

1. **ISSUE (source attribution): "unforgeable" is not in committed round-16 bytes.**
   The spot-check says the word is the "author summary's" (`corpus/lessons/round-16-verifier-spotcheck.md:76`).
   PLAN.md:169 says it is "the r16 report word". Neither matches the committed report:
   `grep -n -i forge /home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tabi.md` → no match; the grep
   over `.ufo/reports`, `tabi-shokunin/reports`, `.ufo/waves/round-16`, `corpus`, `LOG.md`,
   `SCORECARD.md` returns only `round-16-verifier-spotcheck.md` (rc=0). The draft's Mistakes row 1 says
   this explicitly rather than asserting the report's wording. L1 should decide whether the row cites the
   spot-check quote only, and should not write "the report said unforgeable" into any admitted line.
2. **Pointer check (ok):** report `.ufo/reports/round-16/tabi.md:69` contains "again at `1205d26`"
   (fleet root path, not lane-relative: the report lives in `/home/vgpnk/Projects/shokunin/.ufo/reports/`).
   Spot-check `:150` (routed 3) confirms no committed receipt at 1205d26.
3. **Pointer check (ok):** liar evidence `corpus/evidence/round-16/measure/c1-liar-probes.json:3` resolves
   to `/tmp/tabi-r16-c1liar-93NO/repo`; `.ufo/waves/round-16/w2/AttackC1Liar.md:19` gives the mktemp
   pattern. Spot-check `:148` (routed 1).
4. **Pointer check (ok, audit-scoped):** JjAuditTabi F1–F3 at fleet
   `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` (`:44-67`, `:69-93`, `:95-130`). Gate sites cross-checked
   against lane bytes at 5859243: `scripts/check-round-contract.mjs:119,231,232,504` and
   `scripts/check-user-round-contract.mjs:167,308,794,795` (the audit's line numbers match). Audit F6
   (`check-freshness --witness HEAD`, audit `:184-191`) was NOT re-read in the lane; `check-freshness.mjs`
   is byte-frozen and was not opened by this seat.
5. **Coverage gap:** `corpus/QUALITY.md` has no HEAD/jj criterion (`grep -n -i 'jj\|HEAD'` → `:79-80`
   only) and no `/tmp`-root criterion (`grep -n /tmp` → none). Both are pending `DraftQuality` items,
   so the draft marks them `[pending]` rather than naming a number.
6. **Count not verified:** `c1_anchor_safe` entry-point count and C2/C3 counts are `[pending]`; nothing
   was run (per assignment: no checks executed).

## Tools installed or updated

None. No `pacman`, `uv tool`, or `npm -g` action taken (lane guard: pacman paused host-wide).

## Out of scope / not done

- No edits to `corpus/lessons/round-17.md`, `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`,
  `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, or `corpus/adjacency.tsv` (L1-owned).
- No git or jj writes. No subagents. No browser launches.
- The ownership table lists `drafts/<name>.md`; the assigned filename `lesson-r17.md` was used as
  instructed (PLAN.md:191).

## Files written

- `.ufo/waves/round-17/drafts/lesson-r17.md` (new)
- `.ufo/waves/round-17/w1/DraftLesson.md` (this report)
