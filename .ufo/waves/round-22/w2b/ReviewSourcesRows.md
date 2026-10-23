# ReviewSourcesRows — SOURCES registry rows, fleet census receipt, frontier-step receipt

Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (committed, pushed).
Base for the before/after comparison: `5f585773258b33d2d514b00cd0b0775333578db6`
(`run-checks.py:24`).
Method: `git show` blob reads, `git ls-tree`/`git diff` on committed content, and static
re-derivation only. **No lane script was executed** (no `sources-census.sh`, no
`check-sources.mjs`, no `measure-c1.mjs`, no `run-checks.py`); every exit code quoted
below is one recorded in a committed receipt, not one I observed. Nothing in the lane
was modified except this report.

Claim source under review: the wave's own census/frontier claim in
`.ufo/waves/round-22/w1/CensusFrontier.md` (committed at `0f24164`), which carries the
rows before/after, the exact census commands with expected values, and the frontier
disposition.

## Axes

1. **Registry delta fidelity** — is the before/after change in `corpus/SOURCES.md`
   exactly "S101 used-by appended", nothing else?
2. **Census receipt sufficiency** — does an executed receipt cover the *after* tree,
   and are the W04 warnings genuinely pre-existing?
3. **Frontier-step conformance** — is the row/scope opened this round recorded with a
   quote and a location that resolves?

## Verdict per sub-claim

| sub-claim | verdict | one-line basis |
|---|---|---|
| rows before/after: only S101 used-by appended | **TRUE, machine-proven** | 101→101 rows, one cell changed (S101 cell 11) — S1/P1 |
| census `sources-census.sh validate` exit + W04 pre-existing | **TRUE in fact, but only pre-change attested** | 16 W04 + `ok`, exit 0 in the pre-edit receipt; no after-state receipt — S1/P3 |
| frontier step (row opened this round, quote/location in `source-opening.json`) | **CONFORMANT** (reopening, no new row) | quote/location/digests resolve and re-verify — P4 |

No false claim was found. Two evidence gaps and two precision defects are listed below;
none of them changes the operative C1 claim.

---

## Findings by severity

### S1 — Medium: the fleet census has no after-state receipt at the reviewed revision

- **Revision/path/line:** `e3cf4e0` — `.ufo/waves/round-22/census-before.json:2-11`
  (`argv :2-7`, `exit :9`, `stdout :10`, `stderr :11`). No after-state artifact:
  `git ls-tree -r e3cf4e0 --name-only | grep census` yields only
  `.ufo/waves/round-22/census-before.json`; `.ufo/waves/round-22/final/` does not
  exist at this revision (round-20 and round-21 both ship
  `.ufo/waves/round-2{0,1}/final/census-after.json`).
- **Why it matters:** the claim source `.ufo/waves/round-22/w1/CensusFrontier.md`
  ("Exact census commands and expected values") states the *end* requirement —
  "end: must be the same 16 W04 + ok, exit 0; E11 must not appear now that the new
  used-by path exists. Retain the full streams (prior-round precedent:
  `.ufo/waves/round-20/final/census-after.json`,
  `.ufo/waves/round-21/final/census-after.json`)". The retained receipt predates the
  only registry edit: `census-before.json` mtime `11:49:11 -0300`,
  `corpus/SOURCES.md` mtime `11:58:15 -0300`, and the edit landed in `0f24164`
  (`2026-10-21T12:35:37-03:00`). The serial cohort
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` (35 gates) contains **no** fleet-census
  gate: `curation-before`/`curation-after` run `.ufo/waves/round-20/counts.mjs`
  (rows/tiers/statuses/knowledge only), not `sources-census.sh`.
- **Smallest counterexample (preserving the positive):** append any non-existent path
  to any `mined` row's `used-by`; the committed receipt set at `e3cf4e0` would still
  read "exit 0, 16 W04 + ok", because no artifact records the post-edit tree. The
  positive that survives this: the lane's own E11-equivalent gate **did** run at the
  measured revision — `checks-at-e3cf4e0.json` → gate `check-sources-production`,
  argv `[node, scripts/check-sources.mjs]`, `exit: 0`, stdout
  `SOURCES_GATE verdict=clean rows=101 tiers=A:88,B:4,C:9 status=queued:19,mined:73,rejected:9 findings=0 file=corpus/SOURCES.md`
  — and `scripts/check-sources.mjs` implements `used_by_missing` (E11) and
  `used_by_uncited`, so the dangling/uncited risk of the append is covered even
  though the fleet census receipt is not.
- **Smallest fix:** add `.ufo/waves/round-22/final/census-after.json` in the same JSON
  shape as `.ufo/waves/round-21/final/census-after.json`, holding argv/exit/stdout/
  stderr of `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin tabi` executed against the `e3cf4e0` tree.

### S2 — Medium (pending, self-declared): the rule-2 old→new log for the S101 append has no round lesson to live in at `e3cf4e0`

- **Contract:** `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`
  rule 2 — "Only `status`, `recheck` and `used-by` change in place, **and each change is
  logged old→new in the round lesson**"; rule 1 puts new-row quotes in the round
  lesson's `## Gate`.
- **Revision/path/line:** `e3cf4e0` — the change is `corpus/SOURCES.md:115` (S101
  `used-by`), landed in `0f24164`; `git ls-tree -r e3cf4e0 --name-only | grep
  corpus/lessons/` lists `round-2.md`, `round-20.md`, `round-21.md` and **no**
  `corpus/lessons/round-22.md`.
- **Smallest counterexample (preserving the positive):** diff BASE→`e3cf4e0` and read
  the tree: S101's `used-by` changed and no artifact states the old→new pair.
  `corpus/README.md:512-513` says only "S101's mutable used-by cell gains this note",
  and the round-22 search-log bullet `corpus/SOURCES.md:156` does not mention the cell
  at all — so rule 2 is unverifiable from the revision alone. The positive:
  `corpus/lessons/round-21.md:88-93` logs exactly this transition for round-21
  ("- S100 used-by: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` → that
  path plus …", "- S101 new row starts mined with the original round21 note; used-by
  then appends the …", "- No other existing status, recheck or used-by cells changed;
  immutable cells stay unchanged."), and the wave's own seat report already flagged the
  gap as pending (`w1/CensusFrontier.md`, "Contract requirements this transition must
  still satisfy (pending, not observable yet)"). It is an open item of an open round,
  not a hidden breach.
- **Smallest fix:** add `corpus/lessons/round-22.md` with a `## Gate` section carrying
  the exact old→new pair, in the `round-21.md:88-93` shape: old
  `corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`
  → new = old + `, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.

### S3 — Low: the round-22 search-log inclusion count counts a lane-internal artifact as an included source

- **Revision/path/line:** `e3cf4e0` — `corpus/SOURCES.md:156` ("identified2/screened2/
  included2/excluded0") and `.ufo/waves/round-22/study.json:3,7` (`"where": "S101
  receipt/raw and round21 closure417/recorded review chronology"`, `"included": 2`).
- **Smallest counterexample (preserving the positive):** of the two "included" items,
  one is the reopened S101 own-work receipt/raw; the other is
  `.ufo/waves/round-22/round21-closure.json`, a lane-internal closure artifact whose
  fields are `round/type/lane/admitted/verdicts/claims/trends` — no URL, no quote, no
  location, nothing source-like. So only one *source* was included, while the same
  label in the preceding round-21 bullet (`corpus/SOURCES.md:155`,
  "Identified2/screened2/included2/excluded0") corresponded to two admitted registry
  rows (S100 reopened source, S101 new own-work row). The same count label therefore
  denotes two different things in consecutive bullets. The positive: the entry is
  otherwise rule-5 complete (question, where, date, counts, stop rationale, plus the
  explicit "No new source row, publisher diversity or discovery-completeness claim"),
  and `study.json:2-10` carries the same fields verbatim with `exclusionReasons: []`.
- **Smallest fix:** state the split in the round-22 bullet — e.g. "included1 source
  (reopened S101) + 1 lane-internal closure artifact" — or set `study.json` `included`
  to 1 and record the closure artifact in a separate field.

### S4 — Low (informational): `source-opening.json`'s `source` field points at the receipt while the location's line range belongs to the raw file

- **Revision/path/line:** `e3cf4e0` — `.ufo/waves/round-22/source-opening.json:4`
  (`"source": "corpus/evidence/round-21/runtime/receipt.json"`), `:6` (`"raw":
  "…/na-reset.json"`), `:9` (`"location": "na-reset.json frames[…].params.errorText;
  source lines197-205"`).
- **Smallest counterexample (preserving the positive):** resolving "source" +
  "source lines197-205" lands on `corpus/evidence/round-21/runtime/receipt.json:197-205`,
  which is a different case's response window (`"responseCount": 0`, an `"after"` timing
  window); the quoted `errorText` sits at `receipt.json:274`, and at
  `na-reset.json:205` inside the frame that spans lines 197-207. The content is sound —
  both digests recompute exactly (`4bc79636…` for the receipt, `097b8833…` for the raw)
  — only the "source lines" pointer is ambiguous.
- **Smallest fix:** change the location to "raw lines197-205" or add
  `"locationFile": "corpus/evidence/round-21/runtime/na-reset.json"`.

---

## Preserving positives (verified, not assumed)

- **P1 — the before/after claim is exact.** Comparing the committed blobs of
  `corpus/SOURCES.md` at `5f58577` and `e3cf4e0`: 101 rows → 101 rows, row-id set
  unchanged (no row added, removed or reordered), and exactly one cell differs —
  `S101` (line 115), cell 11 `used-by`, append-only:
  `…, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` →
  `…, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.
  Machine corroboration: `checks-at-e3cf4e0.json` → `preservation.sourceErrors: []`
  (`run-checks.py:100-113` compares every row BASE→revision and *requires*
  `after[11] == before[11] + ", corpus/knowledge/webmcp-lifecycle-oracle-round-22.md"`
  for S101); `preservation.scopeErrors: []`, `preservation.prefixes` all `true`.
  Gate corroboration: `check-sources-production` exit 0, `rows=101 findings=0`;
  `curation-after` exit 0, `rows 101, knowledge 41, tiers A88/B4/C9, statuses
  mined73/queued19/rejected9`.
- **P2 — the used-by set is consistent with what the note cites.** The new note cites
  exactly one registry id (`grep -oE '\bS[0-9]{3,}\b'` → `S101`), and exactly one
  registry row lists the note (`corpus/SOURCES.md:115`). The conditional in
  `w1/CensusFrontier.md` ("if the final note adds an `S100` citation … S100's used-by
  must also append …") therefore does **not** trigger, and S100's `used-by` correctly
  stays unchanged.
- **P3 — "W04 duplicate warnings pre-existing" is true and provable statically.** The
  16 flagged rows (S058, S065, S066, S068, S069, S070, S073, S074, S075, S076, S077,
  S095, S096, S098, S099, S100) all exist at BASE with byte-identical rows, and the
  census W04 rule keys only on (normalized URL, scope)
  (`scripts/sources-census.sh`, `row_pass` gawk: `if (u!="" && (u in url_seen) &&
  !(scope_key in url_scopes))`). The wave changed no `source`/`scope` cell, and S101's
  `source` cell is an own-work repo path with no `http(s)` URL (`u==""`), so it can add
  neither W04 nor E04. The pre-edit receipt itself shows `exit: 0`, stderr empty,
  16 `W04` lines plus `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
  Note on attribution: the census command is the **fleet** script
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (there is no lane-local
  `scripts/sources-census.sh`; `tabi-shokunin/scripts/` holds only `.mjs` gates), and
  the receipt's `argv` records that absolute path — the receipt is unambiguous.
- **P4 — the frontier step is conformant and honestly described.** Round-22 opened no
  new row (rule 1's Gate-quote duty therefore does not bind), and the round says so:
  `corpus/SOURCES.md:156` "No new source row, publisher diversity or
  discovery-completeness claim". The reopening receipt
  `.ufo/waves/round-22/source-opening.json` carries a 7-word quote (≤25), a location,
  and both digests, all of which re-verify against the committed evidence:
  `sha256sum corpus/evidence/round-21/runtime/receipt.json` =
  `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` (matches `:5`),
  `na-reset.json` = `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4`
  (matches `:7`), and the quote is verbatim at `na-reset.json:205` with the frame
  opening at 197. `openedAt` `2026-10-21T14:52:31.042898+00:00` equals the file mtime
  `11:52:31 -0300` — no time travel against the `0f24164` commit (`12:35:37 -0300`).

## Residual risk

1. The fleet census **after**-state is unrecorded (S1); the substantive used-by
   integrity is nonetheless covered by `check-sources-production` at the measured
   revision, so the residual risk is evidentiary, not a live dangling-path defect.
2. Rule-2 logging stays pending until `corpus/lessons/round-22.md` lands (S2); if the
   round closes without it, the in-place `used-by` change becomes an unaudited
   append-only mutation.
3. The "included2" label (S3) can be read as two sources by a later auditor; the
   round-21 precedent sets the stronger reading.
4. The `source-opening.json` pointer ambiguity (S4) can send a reader to the wrong
   file for a quote that is nonetheless present in both.

## Verification gaps (honest)

- **Not run by me:** `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (any
  mode), `tabi-shokunin/scripts/check-sources.mjs` (any mode),
  `node .ufo/waves/round-22/measure-c1.mjs`, `node .ufo/waves/round-22/run-checks.py`.
  Every exit code in this report is quoted from a committed receipt
  (`.ufo/waves/round-22/census-before.json`,
  `.ufo/waves/round-22/checks-at-e3cf4e0.json`), never re-observed.
- **Not executed, therefore predicted only:** the after-state fleet census output. My
  prediction from static re-derivation is `exit 0` with the same 16 `W04` lines plus
  `tabi ok`; this is an inference from the unchanged (url, scope) pairs, not an
  observation.
- **Not read as authority:** the sibling seat report
  `.ufo/waves/round-22/w2b/ScoutSourceCensus.md` (overlapping scope) was not used to
  support any finding here; all findings rest on committed lane content and the
  frozen contract.
- **Out of scope for this seat:** the oracle/counter implementation under
  `.ufo/waves/round-22/measure-c1.mjs` and the W1/W2 chronology repairs (other seats);
  I confirmed only that they left `corpus/SOURCES.md` byte-equal between `0f24164` and
  `e3cf4e0` (`git diff 0f24164 e3cf4e0 -- corpus/SOURCES.md` → empty).

Report: .ufo/waves/round-22/w2b/ReviewSourcesRows.md
