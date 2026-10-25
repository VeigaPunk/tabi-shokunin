# RevScorecardDisposition — SCORECARD §"Round 24 — executed disposition" vs corpus/evidence/round-24/

Lane: tabi-shokunin @ ad125e85c235e1c4ec6a08e398bd64da01f68a08 (reviewed tip)
Reviewed 2026-10-25. All gates re-run with `TMPDIR=/home/vgpnk/tmp-tabi24` (host /tmp full).
Read-only seat; nothing edited.

## Verdict summary

C1 met (receipts and re-runs agree). C3 met. **C2 is NOT met — the prose claims 0 where the
round's own receipt records 1, and a re-run at the reviewed tip returns 1, exit 1.**

## Findings, by severity

### F1 (high) — C2 "5 → 0 mismatches … tip counts none" is contradicted by every measurement

- `corpus/evidence/round-24/c2-measurements.json` records `after: {rev: b973fde…, mismatches: 1}`
  — one counted `m3-unlanded-paths` finding (`claimed: "landed", observed: 4`). `c2-tip.json`
  (same rev) shows `mismatches: 1, clean: false`.
- Re-run at the reviewed tip: `node scripts/check-selfassessment.mjs --rev ad125e8… --json` →
  `mismatches: 1`, counted `[{class: m3-unlanded-paths, claimed: landed, observed: 5}]`,
  `clean: false`, exit 1.
- Re-run at baseline: `… --rev 573c99e…` → `mismatches: 5` (4 m1 + 1 m3), exit 1. Baseline
  figure reproduces.
- `git status --porcelain` at tip: 5 paths (`gen-w2.mjs`, `w2-dispatch.err`, `w2-dispatch.json`,
  `w2-spec.json`, `w2/`, all untracked, all round-24 wave-2 artifacts).
- No revision measured anywhere reports 0: baseline 5, b973fde 1, ad125e8 1. The after-value
  `0` in the disposition has no receipt. The disposition's own landing is what trips m3: the
  block asserts landed work while wave artifacts sit unlanded — the claim is self-undermining.
- Companion falsifications: routed defect 2's "…`git status --porcelain` empty at the tip"
  (SCORECARD.md:1259) and LOG.md:1781 "2 closed (89 → 0 porcelain paths)" are both false at the
  reviewed tip (5 unlanded paths). At b973fde measurement time the observed 4 paths were almost
  certainly the four not-yet-committed receipt files themselves (`c1-baseline/tip`,
  `c2-baseline/tip` are absent from the b973fde tree; only `sources/` and the knowledge entry
  are committed there — `git ls-tree -r --name-only b973fde -- corpus/evidence/round-24`).

### F2 (medium) — frozen C2 before diverges from the declared table; no revisions entry

- `claims.json` (committed f6f7f45, frozen-before-data) declares C2 `before: 4` —
  "three stale `--selftest` 12/12 figures … one unlanded-path mismatch over 89 porcelain paths".
- The instrument measures 5 at the baseline (the fourth m1 is `check-sources` 25-vs-26 at
  `:410`, which the frozen enumeration omits).
- SCORECARD's §"Round 24 — declared claims (frozen before data)" table states `5 → 0`: it
  reproduces the *measured* before, not the frozen one. That table itself landed only in
  `ad125e8` (`git log -S "Round 24 — declared claims"`), the same commit as the executed
  disposition — so a heading claiming "frozen before data" wraps a post-data figure.
- `claims.json` `revisions: []` is empty at tip; the 4→5 supersession is recorded nowhere.
  The counter's own m1 window does not read claims.json, so this drift is invisible to it.

### F3 (medium-low) — defect-2 disposition details unverifiable and internally inconsistent

- SCORECARD: "66 empty numeric files, four empty `.err` captures and the untracked seat scratch
  deleted; the two rewrite-in-progress files restored from the branch".
- `corpus/lessons/round-24.md:86`: "**67** empty numeric-named files, 4 empty `.err` captures,
  untracked seat-scratch subtrees **and the 91-file assimilation mirror** deleted; … committed
  in `16fa92f`". Composition differs (66 vs 67; mirror named in lesson only). Deleted-untracked
  paths leave no bytes to diff; unverifiable either way. The committed part does check out:
  `.ufo/waves/round-23/w2/W2Simplifier.md` is present at tip; `git ls-tree -r ad125e8
  .ufo/waves/round-23/scratch` → 0 (and 1034 at 573c99e — defect 3 verified below).

### F4 (low) — S105 evidence-row byte count mislabeled

- SOURCES.md S105 and the entry's `source:` line say "82548 bytes decoded". The pinned artifact
  `corpus/evidence/round-24/sources/page.pdl` is **61,911** bytes; its sha256
  (`e944a3b1…`) matches the row. 82548 = exactly ceil(61911/3)·4, the base64 representation
  length — the number recorded is the pre-decode size, labeled "decoded". The hash and the two
  cited line numbers (1345 `BackForwardCacheRestore`, 1706 `backForwardCacheNotUsed`) all verify
  in the pinned bytes, so this is a labeling error, not missing evidence.

### F5 (low) — a corrections-block figure comes from a gate whose own selftest fails

- `node scripts/check-adjacency.mjs --self-test` → `ADJACENCY_SELFTEST verdict=failed
  cases=57 reasons=18 could_not_evaluate=5`, exit 1. Case `git-failed` reports
  `reasons=[map_unreadable]` where `[git_failed]` is expected (`scripts/check-adjacency.mjs:1622`).
- The corrections block's "cases=57, reasons=18" is literally accurate but omits the failed
  verdict and the 5 could-not-evaluate. `scripts/check-adjacency.mjs` is byte-identical to
  573c99e (same sha256), so this is pre-existing and environment-sensitive, not a round-24
  regression — but the round presents its tally as a measured figure without disclosing that
  the gate is red on this host. The m1 class compares only the tally, so this blind spot is
  structural, not a mistake in this run.

### F6 (low) — m2/m3 class coverage is thinner than the disposition implies

- At tip, the counter's m2 class yields 76 findings, **75 could-not-evaluate** (every receipt
  whose command falls outside the closed `git cat-file`/`git show` grammar) and exactly **1
  evaluated** — the round-23 receipt, which matches (`claimed 128, observed 128`, supporting
  defect-5's "does not reproduce"). m1 adds 4 more CNE (couldNotEvaluate=79 total).
- The C2 disposition row reports counts only; neither the row nor the capability row discloses
  that m2's closed grammar cannot re-run ~99% of committed receipts, or that the CNE tally grew
  75→79 this round (new round-24 receipts whose commands are ungrammatical for m2).
- Consequence: m2's "receipt exit" class has never reported a mismatch on real data — on this
  corpus it is exercised positively exactly once, on the defect-5 receipt itself.

### F7 (low) — C1's frozen before is a literal placeholder

- `claims.json` C1 declares "Before: **N** nonconformant gates at the baseline revision" — the
  freeze left the number unbound; the instrument-derived `3` was substituted later (the
  `before` field defers to the receipt, which is honest, but the declared claim text is not
  itself a frozen number). Compare C2, which did freeze a number — and froze it wrong (F2).

## Verified as claimed

- **C1 before/after** — baseline `nonconformant=3` (e1-missing-row: check-adjacency,
  check-measurement-binding, round-evidence-audit); tip `nonconformant=0`, `clean: true`,
  exit 0 — reproduces at both b973fde (receipt) and ad125e8 (re-run). Gates 12→14 verified;
  the two new gate scripts carry conformant rows.
- **C3** — `git grep -lE '^source: S10[45] '` → 1 at ad125e8, 0 at 573c99e. SOURCES rows
  103→105 (`SOURCES_GATE verdict=clean rows=105 … findings=0`, exit 0). S104/S105 absent at
  baseline, opened 2026-10-25; S104 size (157,667) and sha256 match the artifact; quoted cells
  at bfcache.html lines 2531/2893/2511 verified; page.pdl sha256 matches (F4 aside).
- **Defect 1** — `round-evidence-audit` row exists at SKILL.md:2477 with the eight fields; the
  conformance gate accepts it (mechanical proof).
- **Defect 3** — `git ls-tree -r` on `.ufo/waves/round-23/scratch`: 1034 at 573c99e, 0 at
  ad125e8; `.gitignore` ignores `.ufo/waves/*/scratch/`; bytes remain at 573c99e.
- **Defect 4** — at tip the four stale tallies are superseded (m1 counted=0, superseded=5);
  auditor `--selftest` reports `cases=13, passed=13` (13th case in 43e9bb5).
- **Defect 5** — "does not reproduce" **verified**: `before.exit` reads 128 at c90dffd,
  573c99e and ad125e8, and `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` exits 128
  on this host; the field was 1 at 03c1b4d until 7ac9fff. The disposition's "recorded, not
  fixed" is accurate.
- **Defect 6** — "unchanged" is consistent with nothing having been added or removed.
- **Corrections-block tallies** — every stated figure re-verified on this host:
  check-sources 26; freshness 12; adjacency 57/18 (but see F5); measurement-binding 76/13;
  round-contract 38; user-round-contract 45; aria cli_cases=36, helpers=4; auditor 13/13.
  The ":1183-1184" evidence-keyed claim also reproduces exactly:
  `baselineFindings 7, baselineClasses 6, cases 6, passed 6, clean: true`, exit 0.
- **Capability rows** — appended in the round-24 section only; r22/r23-era tables untouched.
  Both cite demonstrated runs: check-gate-registry (selftest 22/22 pass; real run 3→0) and
  check-selfassessment (selftest 13/13 pass; real run 5→…1). The C2 row's demonstration is
  legitimate evidence *for the instrument* while falsifying the disposition verdict — the
  measurement file the row cites is the very receipt that says after=1.
- **Append-only prose** — `git diff 573c99e ad125e8` deletes zero lines in SCORECARD.md,
  LOG.md, SKILL.md.
- **W1 seat counts** — 31 `.md` reports in `.ufo/waves/round-24/w1/`, ScribeLesson absent,
  matching the seat table.

## Residual risk / gaps

- The 89-path composition (F3) cannot be reconstructed from committed bytes; only the 66-vs-67
  inconsistency is checkable.
- Whether the working tree was ever clean at any instant during the round is unprovable — but
  irrelevant: no committed receipt shows 0, and the instrument's count is the frozen metric.
- `check-adjacency` selftest failure is environment-sensitive; I did not re-derive which side
  (fixture vs host git) produces `map_unreadable`, only that the gate is red here with exit 1.
- m2's closed grammar means "receipt exit" is effectively unevaluable for most receipts —
  disclosed in the receipts (75/79 CNE) but absent from the disposition prose.
- The gate-set convention counts wave-scratch scripts (`.ufo/waves/round-{12,21,22}/*.mjs`) as
  lane gates; consistent between baseline and tip, but the "12→14 gates" figure includes them.
- I did not re-fetch S104/S105 upstream (contract forbids probing external sites); hash, size
  (F4), and located quotes were verified against the pinned artifacts only.
