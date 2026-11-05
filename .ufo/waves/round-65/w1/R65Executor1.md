# R65Executor1 — C1 adjacency v22 instrument

Base: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162. Clone: scratch `R65Executor1/clone` (removed at exit).

## Built
- `c1-adjacency-host-v22.mjs` = v21 (round 62, from base) plus one refusal class, `delta-disposition-conflict`.
  - Added pass (f) in `verify()` after the line-row index: for each `line` delta row, key `(lane, relPath, line)` via `linePathOf`; first disposition is recorded; a later row with a DIFFERENT disposition adds `delta-disposition-conflict` (detail `lane:path:line: first vs later`). Same-disposition duplicates are not refused. Other checks are untouched; the v21 first-row index is unchanged.
  - Schema string `tabi-adjacency-host-v21` → `tabi-adjacency-host-v22` (die, output `schema`, selftest `schema` now `tabi-adjacency-host-v22-selftest`). CLI, exit codes and JSON shape are unchanged.
  - Two selftest cases added after the last v21 case: `conflict-refused` (expect 1, id `delta-disposition-conflict`, predicate false, count 1) and `same-disposition-duplicate-accepted` (expect 0, predicate true, count 0). All 44 v21 case lines are byte-identical (diff shows only the additions).
- Header comment, usage text and `predicateSentence` updated to v22 and to carry the frozen clause "AND no two delta line rows share a (lane, relPath, line) key with differing dispositions" (see deviation).

## Measured
- v21 selftest at base: 44 cases, 44 pass, allPass true (`selftest-v21-base.stdout`).
- v22 selftest: 46 cases, 46 pass, allPass true, schema `tabi-adjacency-host-v22-selftest` (`selftest.stdout`). Count = 44 + 2.
- Regression (real ledger, base, argv from the assignment): v21 exit 0 predicate true findings []; v22 exit 0 predicate true findings []. `findings`, `predicate`, `findingCount`, `counts`, `drift` identical. Bytes differ only in `schema` and `predicateSentence` (version name and appended clause).
- Forgery (`.ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv`, which is the committed ledger plus one row `line kagi-shokunin PROVINCE.md:41 … contested-open`):
  - v21: exit 0, predicate true, findings [] (the 2nd row is ignored; output byte-identical to the honest regression run).
  - v22: exit 1, predicate false, findings `[{"id":"delta-disposition-conflict","detail":"kagi-shokunin:PROVINCE.md:41: no-tabi-ground vs contested-open"}]`.

## Deviation to decide at freeze
- The JSON `predicateSentence` (and the header comment) now starts `c1-adjacency-host-v22` and appends the frozen clause. The contract said the only schema change is the schema string; I changed the sentence too because the claim requires the counter's PREDICATE-SENTENCE to carry the v22 predicate. If the L1 wants only the schema string changed, revert the predicateSentence line to v21 text; findings and predicate are unaffected.

## Residuals and observations (not fixed; inherited)
- Blanket same-line labels with no sibling ruling remain accepted (declared residual in claims-draft).
- `hostSelftest` writes to hardcoded `/fast/scratch/hyaku/tabi-r62/R62V21Selftest` (inherited from v21; not /tmp; left unchanged to keep v21 cases byte-identical).
- Unparseable line suffixes key as `null`; two such rows with different dispositions will now conflict (new behaviour, consistent with the rule; those rows are also flagged by `line-row-unscreened-file`).

## Tooling
- No tools installed or upgraded. No pacman, no git mutation (read-only `git show`, `cat-file`, `rev-parse`, `clone --shared`, `checkout` in scratch only).

## Deliverables (`.ufo/waves/round-65/w1/R65Executor1/`)
- c1-adjacency-host-v22.mjs `5c16dfbcdba771eb61d279f7d8d5ceddd21ee55a34854073b5c8219e8991d1ec`
- selftest.stdout `e1758c93ad5474627c2e2c6f28496e0dc90fb66277c66b429a283e4d719ac98f`
- selftest-v21-base.stdout `449e318a4c96fbdbbb63905852df51283854f9c35d5f6e2ee3473545c0296a65`
- regression-v21.json `952076040aad5a75c469dbdc962eb324aff86b8f8cbf05a1a702da773762177d`
- regression-v22.json `b9444c1ec18f685e77b93eacacb89a3be9e7a19573db7640af2649695168789f`
- forgery-v21.json `952076040aad5a75c469dbdc962eb324aff86b8f8cbf05a1a702da773762177d`
- forgery-v22.json `5805bec28d1ba1c045513ae176870db6e6e52e9d8d0d658066185790576cf776`

Proving command (run from the lane root):
`node .ufo/waves/round-65/w1/R65Executor1/c1-adjacency-host-v22.mjs --repo . --rev 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-62/c1/snapshot-r62.tsv --audit corpus/adjacency-host-audit-r62.tsv --delta .ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv --json` → exit 1, `delta-disposition-conflict`.
