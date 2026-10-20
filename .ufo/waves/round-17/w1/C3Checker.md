VERDICT: PASS

# C3 checker — scripts/check-adjacency.mjs (round 17, w1)

Artifact: `scripts/check-adjacency.mjs` (new, 1667 lines)
sha256: `5a7ea9a2bf584c7cc610653510b5f91ff287d7994c503b60b9b0790120170aff`
Self-test summary line (run `node scripts/check-adjacency.mjs --self-test`):
`ADJACENCY_SELFTEST verdict=clean cases=51 reasons=17 could_not_evaluate=6`

## Interface

```
node scripts/check-adjacency.mjs [--at REV] [--json] [--fleet <dir>] [--repo <dir>]
node scripts/check-adjacency.mjs --self-test
node scripts/check-adjacency.mjs --reasons
```

- `corpus/adjacency.tsv`: 9 TAB columns + header (surface, sibling, sibling_ref,
  sibling_quote, tabi_ref, tabi_quote, disposition, ruling_ref, ruling_quote).
- Map bytes and every cited line are read with `git cat-file blob` at exact
  commits; never the worktree, never HEAD. Map at the evaluated revision.
- `--at` defaults to the lane tip: attached HEAD's own branch; detached
  (jj-colocated) → `refs/heads/master`, then `refs/heads/main`, direct-ref
  checked. An explicit `--at` refuses every HEAD-relative token (`HEAD`, `@`, ...).
- `--fleet` defaults to the lane's parent; sibling repo = `<fleet>/<lane>-shokunin`,
  `fleet` token = `<fleet>`; both must be non-symlink git toplevels whose git dir
  is `<dir>/.git`. Sibling/fleet tips use the ladder master → main and the ref
  used is recorded in `--json` under `tips`.
- Exit 0 clean / 1 row findings / 2 could_not_evaluate. `--json` emits one object
  line: schema, mode, map, repo, fleet, at, verdict, rows, verified, selfRulings,
  tips, vocabulary, findings.

## Reason vocabulary (closed; `--reasons` prints it)

Findings (17): `column_count`, `surface_empty`, `field_control_char`,
`sibling_ref_invalid`, `sibling_unresolved`, `sibling_quote_absent`,
`tabi_ref_invalid`, `tabi_unresolved`, `tabi_quote_absent`,
`disposition_unknown`, `ruling_ref_invalid`, `ruling_unresolved`,
`ruling_quote_absent`, `l0_line_absent`, `quote_too_long`, `quote_too_short`,
`duplicate_row`.
Could-not-evaluate (6): `map_unreadable`, `map_schema_invalid`,
`revision_unresolved`, `lane_tip_unresolved`, `git_failed`, `usage`.

## L1 tight-rules steer — implemented and each has a negative case

- (a) `tabi_ref` is `<path>:<line>` only; quote must be on that exact line;
  the map and any path under `.ufo/` are refused (`tabi-ref-invalid-noline`,
  `tabi-ref-self-citation`, `tabi-ref-wave-citation`, `tabi-ref-invalid-path`).
- (b) Quote floor 4 words AND 20 non-space chars (`quote-too-short`, 1 word).
- (c) `sibling` must equal the lane token in `sibling_ref` exactly
  (`sibling-suffix-mismatch` for `-shokunin`, `sibling-list` for `kagi/kaidoku`,
  `sibling-ref-invalid-lane`, `own-lane-sibling`).
- (d) Sibling/fleet tip ladder master → main, used ref recorded
  (`sibling-unresolved-*` set covers absent repo, non-toplevel, symlink,
  unresolvable commit/path/line, unreachable commit; ladder proven on real
  repos: kaidoku and game-dev-3d have only `main`).
- (e) Duplicate key = folded surface + sibling only (same surface for two
  different siblings is allowed); `duplicate-row` uses an uppercase variant.
- (f) `ruled` venue restricted to `fleet` or a tabi
  `corpus/lessons/*-verifier-spotcheck.md` line whose last touching commit
  author is not `tabi-shokunin`; self venue additionally requires ancestry of
  the evaluated revision and byte-identical line
  (`ruling-venue-sibling`, `ruling-venue-self-notspotcheck`,
  `ruling-venue-self-author`). Positive self-venue case asserted with
  `selfRulings: [2]`.
- (g) `contested-open`: the l0 line must be a `tabi | round-<N> |` row AND name
  the sibling lane (`l0-line-absent-not-tabi`, `l0-line-absent-eof`,
  `l0-line-no-sibling`).
- (h) A ruled `ruling_quote` must name the sibling lane
  (`ruling-quote-no-sibling`).

Self-test is hermetic: temp fleet of three real git repos; one clean case
(4 rows, 4 dispositions), one positive self-venue case, a case per finding
reason, plus map schema/unreadable, usage, HEAD refusal, git failure, lane-tip
default/poison/unresolved. Ascii-safe: a zero-width space in a quote yields
exactly `field_control_char`.

## Real-data probe (sandbox clone; no lane writes)

Sandbox `/tmp/tabi-r17-C3Checker-sWJU` (removed after use), 3 rows:
`kaidoku-cdp-scope` contested-open at the L1's sent anchor
`fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62`
(names kagi; sibling kagi at `c2cab35...:PROVINCE.md:43`);
`kaidoku-integrator-ruling` ruled via the real integrator spotcheck
`tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142`
(last author `protocol-shokunin`, verified with
`git log -1 --format=%an 5859243 -- corpus/lessons/round-16-verifier-spotcheck.md`);
`kagi-9222-lease` split-declared.
Result: `ADJACENCY verdict=clean rows=3 verified=3`, `selfRulings [3]`, exit 0.
`tips`: kaidoku → `refs/heads/main`, kagi → `refs/heads/master`,
fleet → `refs/heads/master`, lane → `refs/heads/master`.

Real lane default run (`cd tabi-shokunin && node scripts/check-adjacency.mjs`):
`at=5859243183c4d7ac5429dfdb8a73ce0d9a43d583`,
`verdict=could_not_evaluate`, `reason=map_unreadable`,
`detail=corpus/adjacency.tsv path absent at 5859243...`, exit 2 — correct: the
lane tip resolved and the map is the L1's to write.

## Wave-2 repair (Forge/Critic/Sentinel steer) — applied at this edit

sha256: `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (1748 lines)
Self-test summary line:
`ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6`

Repairs applied (each has a negative case asserting its reason, or a positive
case for the env rule):

1. Pin dedupe: a second key, `siblingRefKey` = `<lane>@<path>:<line>`
   (commit-independent), now flags a row that re-cites a sibling line under a
   different surface; the folded surface+sibling key is kept. Case
   `duplicate-sibling-pin` asserts `duplicate_row` only.
2. `surface` restricted to ASCII `[a-z0-9-]` (new reason `surface_charset`;
   case `surface-charset` uses a U+03BF omicron).
3. A `ruled` venue refuses every fleet path under `.ufo/` (l0 questions are
   not rulings): cases `ruling-venue-l0-question` and `ruling-venue-ufo`
   assert `ruling_ref_invalid`. The fleet fixture moved off `.ufo/` to
   `decisions.md`; the contested-open `.ufo/l0-questions.md` venue is
   unchanged.
4. `sibling_ref` path under `.ufo/` is refused (`sibling_ref_invalid`);
   case `sibling-ref-under-ufo`.
5. `core.commitGraph=false` added to `GIT_PREFIX` (SentinelAnchorAfter B1);
   case `commit-graph-ignored` writes a garbage `commit-graph` into the
   sibling and asserts a clean clean-map run.
6. Header line replaced: the map records "the overlaps the lane has
   dispositioned; known undispositioned overlaps are listed in the round
   lesson."

Real-map re-check at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (before
these edits were committed by the L1): `ADJACENCY verdict=clean rows=9
verified=9`, exit 0 — the tightened rules accept the landed map (all real
surfaces are `[a-z0-9-]`; all nine sibling pins are distinct; no `.ufo/`
paths on the sibling or ruled side).
## Risks / notes for the L1 map

1. For a `ruled` self-venue row on the round-16 ruling, the line must be
   `:142` and the quote must contain `kaidoku`
   (e.g. `**kaidoku** keeps CDP only as an REA provider surface`). The line-141
   quote `tabi owns live browser/CDP page observation` is valid prose but fails
   rule (h). `:138-142` as a range is not accepted — one line is cited.
2. `sibling` must be the bare token (`kaidoku`), never `kaidoku-shokunin` or a
   list; the map cannot use the old multi-lane form.
3. `tabi_ref` must carry `:<line>`; a bare path is now `tabi_ref_invalid`.
4. A `contested-open` l0 row must name the sibling in the row text; a row that
   only names `kake` cannot back a `kagi` contested row.
5. No tool installs were performed; no pacman transactions were run.

Files written:
- scripts/check-adjacency.mjs (new; sha256 above)
- .ufo/waves/round-17/w1/C3Checker.md (this report)
