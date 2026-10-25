# ScoutSourceCensus — run-free SOURCES census, 5f58577 → e3cf4e0

Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane `HEAD`, verified with
`git rev-parse HEAD`, exit 0). Base: `5f585773258b33d2d514b00cd0b0775333578db6`
(`run-checks.py:24`). Method: `git show` blob reads and static re-derivation only; no lane
script was executed. Headline claim under test: SOURCES census `rows 101`, tiers
`A88/B4/C9`, statuses `mined73/queued19/rejected9`, with `knowledge 40→41`, matches the
`curation-before`/`curation-after` expectations.

## Axes

1. Census fidelity: row/tier/status counts at base and review revision.
2. Expectation agreement: my static counts vs `run-checks.py` census expectations and the
   two retained receipts.
3. Preservation bound: the exact byte surface changed in `corpus/SOURCES.md`, and the
   `used-by` integrity rule the gate applies.
4. Evidence retention: whether the cited census receipts can be read from the review
   revision.

## Observed census (independent static re-derivation)

Each row line has exactly 13 pipe cells; ids S001–S101 are contiguous and unique; no
row-shaped line exists outside `## Registry` at e3cf4e0.

| revision | role | rows | A/B/C | mined/queued/rejected | knowledge `*.md` | `corpus/SOURCES.md` sha256 |
|---|---|---|---|---|---|---|
| `5f58577…` | base | 101 | 88/4/9 | 73/19/9 | 40 | `1572aa2dec255d80c25e4200ee9020ba4526a688887e5aa588aacae8acff71a3` |
| `0f24164…` | first checkpoint | 101 | 88/4/9 | 73/19/9 | 41 | `972093d856903f4c8367ed3dda10f2d7b349fc61cc1f74747b1af3a11db661a1` |
| `e3cf4e0…` | review | 101 | 88/4/9 | 73/19/9 | 41 | `972093d856903f4c8367ed3dda10f2d7b349fc61cc1f74747b1af3a11db661a1` |

`knowledge` is `git ls-tree -r --name-only REV -- corpus/knowledge/ | *.md` (the metric of
`.ufo/waves/round-20/counts.mjs:13`), not an admission count.

## Expectation agreement

- `run-checks.py:137-142` expects, for both gates, `rows: 101`, `tiers {A:88,B:4,C:9}`,
  `statuses {mined:73,queued:19,rejected:9}`, and `knowledge` 40 (base) / 41 (revision).
- My counts equal every one of those values at both revisions (table above).
- `checks-pre-w2-0f24164.json` (committed at e3cf4e0, overall verdict `failed` 33/35)
  records `curation-before` and `curation-after` exit 0, `pass: true`, with observed
  metrics exactly `101 / 88-4-9 / 73-19-9 / 40→41`.
- `checks-at-e3cf4e0.json` (working tree only, see F2; overall verdict `clean`, 35/35)
  records the same observed metrics, with `curation-after` evaluated against e3cf4e0.
  Its `producerSha256` `c501034d…` equals the committed `run-checks.py` blob.

Three readings (mine, base receipt, review receipt) agree; I did not re-execute their
producers.

## Preservation math for the only changed row

- Raw split cells are byte-identical for all 100 other rows and for S101 cells 1–10 and 12.
- S101 (`corpus/SOURCES.md:115`): base cell 11 is
  `' corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md '`;
  review cell 11 inserts `, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` before the
  trailing space. The stripped formula at `run-checks.py:101` holds exactly.
- The only non-row change is one appended Search-log bullet at `corpus/SOURCES.md:156`.
- `used-by` integrity: every `corpus/` target of every row exists at e3cf4e0; S101's three
  targets contain `S101` (4, 4, 1 occurrences), satisfying the boundary regex at
  `scripts/check-sources.mjs:232`.

## Findings

### F1 — Census claim holds; the census gates are load-bearing (no defect, high confidence)

Expected metrics are compared as values, including the nested `tiers`/`statuses` objects
(`run-checks.py:155-158`), so a silent status or tier drift fails even when `rows` remains
101.

- Smallest counterexample the gate catches: change one `queued` row to `mined`.
  `rows` stays 101 and `knowledge` is unchanged, but `statuses` becomes
  `{mined:74,queued:18,rejected:9}` ≠ `run-checks.py:142`, so `curation-after` fails; a
  `B→A` tier flip likewise breaks `run-checks.py:141`. For non-S101 rows the cell compare
  at `run-checks.py:96-104` fires first.
- Preserving positive: the actual tree at both revisions yields exactly
  `73/19/9` and `88/4/9`, and every receipt cell above records those values with
  `pass: true`.
- Conclusion: the review revision's census matches the expectations and the retained
  receipts. No false census statement found.

### F2 — The 35/35 receipt is not part of the reviewed revision (low; evidence retention, not production)

`git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` exits 128
("exists on disk, but not in e3cf4e0"), and `git status --porcelain` reports
`?? .ufo/waves/round-22/checks-at-e3cf4e0.json`. The wave context cites this file as the
35/35 serial receipt, but a reviewer holding only the committed revision cannot open it.

- Counterexample: clone at e3cf4e0 and try to read the 35/35 evidence — path absent; only
  the 33/35 `checks-pre-w2-0f24164.json` is committed.
- Preserving positive: the committed 33/35 receipt is readable (`git cat-file -e` exit 0)
  and already contains both census gates `pass: true` with the expected metrics, so the
  census conclusion does not depend on the untracked file.
- Smallest fix: commit the receipt under a `post-w2b` label, or cite it explicitly as
  uncommitted working-tree evidence.

### F3 — Non-row SOURCES.md text escapes both census gates (low; gate boundary)

`run-checks.py:78-81` deliberately skips the append-only prefix check for
`corpus/SOURCES.md`, and the row comparison at `:88-104` sees only row-shaped lines.
`scripts/check-sources.mjs` validates sections, row structure and `used-by` citations
(`:262-347`), not Search-log prose.

- Counterexample: rewrite `corpus/SOURCES.md:156` (the round-22 bullet) to claim "included
  12 new rows"; row cells, ids, histograms and `knowledge` all stay identical, so by their code paths
  `curation-before/after` and `check-sources-production` would still pass, and the prefix
  check does not apply.
- Preserving positive: any row-cell edit is caught by `run-checks.py:96-104`; any
  status/tier histogram shift by `:141-142`; a missing or uncited `used-by` target by
  `check-sources.mjs:329-340`.
- Smallest fix: assert the full expected file rather than only row cells — base text with
  exactly the S101 cell-11 insertion and the one recorded appended bullet — or
  digest-bind the appended bullet text.
- Observed state: the appended bullet's assertions ("No new source row", identified 2 /
  screened 2 / included 2 / excluded 0) are consistent with `study.json` and with the
  unchanged census; the gap is mechanical, not an observed false statement.

### F4 — `curation-after` is invariant across the repair (scope note, not a defect)

`corpus/SOURCES.md` (`972093d8…`) and the 41 knowledge files are byte-identical at
0f24164 and e3cf4e0. `curation-after` therefore records the same observation at both
checkpoints; it is a no-harm invariant, not evidence that the D1–D3 landing-stage repairs
changed anything. Repair evidence must come from `measure-c1` (other seats).

### F5 — W1 reports describe a weaker gate than the reviewed bytes (design history, peripheral)

`w1/CriticNoHarm.md:107` and `w1/CensusFrontier.md:199-201` state that `curation-after`
asserts only `rows:101` and `knowledge:41`. The reviewed `run-checks.py:140-142` also
asserts tiers and statuses, and its blob (`c501034d…`) is identical at 0f24164 and
e3cf4e0. F3 of `CriticNoHarm` recommended exactly that addition, so the lines are stale
design history rather than a description of the reviewed gate. No action for the census
verdict; flagged so reviewers do not under-credit the gate.

## Unrun checks (honest scope)

- Did not execute `.ufo/waves/round-20/counts.mjs`, `scripts/check-sources.mjs`,
  `.ufo/waves/round-22/run-checks.py`, `measure-c1.mjs`, or any other lane script
  (static-review bound). All exits cited above are quoted from committed/working receipts,
  not reproduced.
- Did not run the fleet-level `scripts/sources-census.sh`; I only counted the retained
  stdout in `census-before.json` (16 `W04` duplicate-URL warnings + 1 `ok` line, recorded
  exit 0), which matches round21-closure's "16 repeated-URL-across-scope W04 warnings".
- No browser, network, credentials, REA, delegation, seat messaging, installs (none
  needed), or VCS mutation. Only `/tmp/base_sources.md` and `/tmp/rev_sources.md` were
  written.

## Remaining unknowns

- Whether `checks-at-e3cf4e0.json` is intended to be committed post-w2b; currently it is
  not in the revision.
- The W1-era uncommitted `run-checks.py` draft that F5's lines describe (not recoverable
  from the revision).
- Semantic truth of the S101 row cells and the round-22 note (assigned to other seats).

## Commands exercised (exit codes)

| command | exit |
|---|---|
| `git show 5f58577:corpus/SOURCES.md > /tmp/base_sources.md` | 0 |
| `git show e3cf4e0:corpus/SOURCES.md > /tmp/rev_sources.md` | 0 |
| `git show 0f24164:corpus/SOURCES.md \| sha256sum` (= rev blob) | 0 |
| ad-hoc `python3` row/tier/status/cell counter (reimplementation of `counts.mjs:11-14`) | 0 |
| `git ls-tree -r --name-only REV -- corpus/knowledge/ \| grep -c '\.md$'` | 0 (40 / 41 / 41) |
| `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` | 128 |
| `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-pre-w2-0f24164.json` | 0 |
| `git status --porcelain -- .ufo/waves/round-22/checks-at-e3cf4e0.json` | 0 (`?? …`) |
| `diff base rev` | 1 (2 insertions, 1 deletion as described) |
| `sha256sum` on `run-checks.py` worktree vs `git show` blob | 0 (both `c501034d…`) |

Report: .ufo/waves/round-22/w2b/ScoutSourceCensus.md
