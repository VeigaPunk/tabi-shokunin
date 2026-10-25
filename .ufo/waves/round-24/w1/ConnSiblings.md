# ConnSiblings — sibling-overlap scan (tabi round 24, wave 1)

Seat: L1Tabi24.ConnSiblings. Role: connector. Report only, never absorb — no claim, no
edit to any tracked file. A `Report:` trailer appears at the end.

## 1. Scope and method

Scanned the fleet root `/home/vgpnk/Projects/shokunin` for already-shipped (a) gate-registry
conformance checkers and (b) self-assessment mismatch counters, at every surface named in the
assignment — PROTOCOL.md (§Gate standard), aggregator tooling at the fleet root (`scripts/`,
`.ufo/gates/`), kumitate, kengaku, kaidoku, chousa — plus a full sweep of every lane's
`scripts/tools/verifiers/plans` directories and `MANIFEST.json` round records. Read-only only
(dir listings, file reads, `grep`, git-log/ls-tree/show/cat-file via the tools); nothing was
executed, and PROTOCOL §Closure consequence forbids executing a sibling's gate anyway. No
writes except this report.

## 2. Gate-registry conformance checkers — hits

### 2.1 kotoba-shokunin/verifiers/check_gate_registry.py (protocol lane — the reference implementation)

- What: frozen counter for kotoba round-54 C2 (consistency). Reads `SKILL.md` at a revision
  via `git ls-tree`/`git show`/`git cat-file -e` (never the worktree). Universe = every
  `verifiers/*.{py,sh}` blob at the rev. Each script must have **exactly one** row in the
  `## Gate registry` table; phantom rows (a row naming a `verifiers/` path absent from the
  tree) are counted separately.
- Table header (8 fields, exactly PROTOCOL §Gate standard): `Name | Kind | Entry command |
  Verdict map | Self-test | Pinned values | Write scope | Owner`.
- Row predicates (`judge_row`): kind ∈ {gate, probe}; entry cell must contain the script path;
  verdict map must declare code=class pairs (gates must include `0=clean` and `1=failed`;
  probes must not declare `1=failed` and must not carry a `--self-test` handler); self-test
  cell must name a backticked flag that has an exact handler in the script; pinned-values cell
  is `none`/`in-file`/backticked path(s) that exist at the rev; write scope non-empty; owner
  must equal `kotoba`.
- CLI: `python3 -B verifiers/check_gate_registry.py --rev <rev> [--json] [--self-test]`;
  `--self-test` is exclusive with `--rev`/`--json` (argparse error otherwise).
- Exit: 0 iff conformant count == universe size and no phantom; 1 otherwise; 2 on
  could-not-evaluate (SKILL.md absent at rev, decode/OS failure → stderr line + exit 2);
  `--self-test` returns 0/1. Usage errors exit 2 (plain argparse).
- Output text: one line per verifier (`OK`/`no` + why), `PHANTOM <path>` lines, final line
  `gate registry rows conformant %d of %d lane verifiers; phantom %d`. JSON:
  `{"conformant": k, "of": N, "phantom": P, "verifiers": [{verifier, conformant, why}]}`.
- Self-test asserts exactly the kill-rule cases of C1: missing row, duplicate row, phantom row,
  wrong flag spelling (`--selftest` vs `--self-test`), a flag mentioned in comments but not
  handled.
- Evidence: `skill://`-adjacent reads — `check_gate_registry.py:339-374` (CLI/exit),
  `:178-242` (judge), `:112-137` (Tree/universe), `:245-283` (selftest cases);
  `kotoba-shokunin/SKILL.md:463-470` (registry home text), `:471-516` (rows, e.g. line 485
  registers the checker itself). MANIFEST.json rechecks show closure exercising it: "C2
  check_gate_registry.py: 0 of 21 exit 1 @422ffd10 … -> 24 of 24 phantom 0 exit 0
  @bf65974c/c501cd53" (MANIFEST.json:14899).
- Note: this checker requires a **unique** row per verifier — a duplicate/superseded row is
  nonconformant, not "latest row wins" (see §5).

### 2.2 kama-shokunin/tools/gate-registry-check.py

- What: round-32 instrument-registry gate (repair of the round-28 occurrence-only gate).
  Population: tracked `count-*.py` under `.ufo/waves/round-*/` and `tools/round<N>-*.py`
  (round-34 widening). Registry: the `| Name | Kind / entry command | Exit map | Self-test /
  pinned values | Write scope |` tables in SKILL.md at the rev; prose mentions do not count
  (`unregistered`).
- Row meaning defects: `thin-row` (<2 non-empty cells), `empty-entry`, `empty-exit-map`,
  `missing-path:PATH` (a repo-relative path token in entry/self-test/write-scope cells that
  does not exist at the rev; the counter's own path exempt).
- Output: `unregistered <path>` / `defective <path>: <reason>` lines and
  `registered R unregistered U defective D`.
- Exit: 0 iff U==0 and D==0; 1 otherwise; 2 could-not-evaluate (not a git repo, bad revision,
  missing SKILL.md, git failure/timeout).
- CLI: `gate-registry-check.py [--repo DIR] [--rev REV] [--selftest]`; default rev = working
  tree (tracked files from index). `--selftest` prints `GATE_SELFTEST pass=N fail=M`.
- Evidence: `kama-shokunin/tools/gate-registry-check.py:1-95`.

### 2.3 mori-shokunin/tools/mori-gate-registry.py

- What: round-44 auditor. Checks `SKILL.md` `## Gates` table rows against committed bytes: for
  each audited tool path, a row must name it in its `entry` cell with all **eight** standard
  cells non-empty (name, kind, entry, verdict map, self-test, pinned values, write scope,
  owner); the named tool must resolve at the revision and must carry a `--selftest` mode.
- CLI: `python3 tools/mori-gate-registry.py --rev <rev|WORK> [--repo PATH] [--registry SKILL.md] --audit <repo-relative path> [--audit ...]`; `--selftest` runs the fixture matrix.
- Exit: 0 `REGISTRY=met` · 1 `REGISTRY=unmet` · 2 `REGISTRY_SETUP`.
- Evidence: `mori-shokunin/tools/mori-gate-registry.py:1-83`.

### 2.4 Fleet aggregator: .ufo/gates/root-ledgers.py (protocol-lane ledger gate)

- What: asserts fleet-root ledger identity — SCORECARD.md/LOG.md line-1 headers pinned, the
  protocol-lane gate-registry heading sits above the `## Aggregator lane` section, and the
  registered closure-check row exists between them. Finding ids: `scorecard_header_lost`,
  `log_header_lost`, `protocol_registry_lost`, `aggregator_section_lost`,
  `registry_below_aggregator`, `protocol_registry_duplicated`, `closure_check_row_lost`.
- Exit map: `VERDICT_BY_EXIT = {0: clean, 1: failed, 2: could-not-evaluate}`; usage exits 64
  (argparse subclass). Modes: live/`--rev`, frozen replay over `root-ledgers/expected.json`
  (pinned sha256 per revision), `--selftest` over fixtures. Emits JSON or per-finding lines +
  `VERDICT <class>`.
- Evidence: `.ufo/gates/root-ledgers.py:1-65,147-247,265-413,439-490`; `expected.json`.
- This is the *placement/location* half of registry conformance at the fleet root; it does not
  grade a child lane's SKILL.md rows.

### 2.5 Adjacent: tameshi-shokunin/tools/registry-check.py

- Entry-registry monitor for `tools/registry.json` (schema `tameshi-entry-registry-v1`): replays
  every active row's argv and checks `expect.exit` + `stdout_contains` needles; rows carry
  `status: active|superseded` + `superseded_by` (superseded rows still run, excluded from N/M,
  counted `superseded=K`). Exit 0 all held · 1 any differs · 2 could-not-evaluate · 64 usage.
  Not a SKILL.md gate-registry checker, but a second precedent for registry-row semantics and
  the 0/1/2/64 exit map. Evidence: `tameshi-shokunin/tools/registry-check.py:1-58`.

### 2.6 History (MANIFEST.json)

- `gate-registry-check.py` is referenced as the authority for kama rounds 28/33: "gate-registry-check.py
  occurrence-only, no fixture self-test, no revision printed" (16676, kama r28) and "round-33
  instruments documented in SKILL.md prose, no five-column registry rows (invisible to
  gate-registry-check)" (19292, kama r33). "check-index.py lacks a SKILL.md gate-registry row
  (not conformant under §Gate Delivery until added)" (19047, r30-era). These confirm the
  §Gate conformance rule has been enforced across lanes for several rounds.

## 3. Self-assessment mismatch counters — hits

### 3.1 tsukuroi-shokunin/tools/check-self-assessment.py (closest named sibling)

- What: round-26 C2 counter. "Count self-assessment mismatches between a lane's stated axes and
  observed state." Fixed check set v2, K01–K27 (declared in SCORECARD.md "Round 26 -
  declaration, attempt 1"). Every input is read through Git at one revision (`git show`,
  `git ls-tree`, `git archive`); the working tree is never read. K13 runs the census selftest
  from a `git archive` temp dir.
- Checks: current axes table (last table under the last `## Axes - ` heading; heading must name
  `round N`), measured-outcome ordinal references (`<axis> … (\d{1,2}) → (\d{1,2})`), a
  `no dated move record` mismatch (never silent pass, never exit 2), capability rows, SHONEN
  boxes 1–4 citing existing, non-superseded `corpus/knowledge/*.md` notes, etc.
- CLI: `python3 tools/check-self-assessment.py --revision <REV> [--repo <path>]`; `--selftest`.
  Prints **one JSON object** on stdout. Exit: 0 mismatches==0 · 1 any mismatch · 2 cannot
  evaluate (unknown revision, missing file/table/row, <4 SHONEN boxes).
- Evidence: `tsukuroi-shokunin/tools/check-self-assessment.py:1-113`.
- Scope difference vs tabi C2: classes are K01–K27 (axes tables, capability rows, SHONEN
  boxes), not tabi's m1 (stale `--selftest` tally) / m2 (receipt exit contradiction) / m3
  (unlanded working-tree paths). It does not re-run receipts and does not inspect the worktree.

### 3.2 kengaku-shokunin: plans/state_check.py, attrib_calibration.py, p3_oracle.sh

- `plans/state_check.py` (state-assertion-check capability row): "re-derive the lane's own
  current-state assertions (capability rows, axis basis anchors, SHONEN canonical form,
  PROVINCE surface rows, corpus index both directions) and exit 0/1/2" — base `6180e4f`
  `mismatch=11` exit 1; landed `mismatch=0 superseded=1` exit 0; `--selftest` ALL PASS.
  CLI `--summary`/`--json` per its SCORECARD row (row text visible in
  `plans/fixtures/r26/state_p3/p3a-selftest-count.patch`; also `plans/state_check.py` head).
- `plans/attrib_calibration.py` + `p3_oracle.sh`: compare SCORECARD capability-row tokens (incl.
  `--selftest` tallies and recorded exits) against committed receipts; fixtures
  `p3a-selftest-count` (stale tally "14 checks" vs receipt "18 checks" → MISMATCH) and
  `p3b-province-count` (recorded "10 mismatches" vs receipt `mismatch=10`) prove m1/m2-equivalent
  detection lane-specifically. `verdict $id.summary-exit` compares recorded exit vs receipt exit
  (`p3_oracle.sh:156`). Exits 0/1/2.

### 3.3 kumitate-shokunin: scripts/receipt-evidence.mjs, round-gate.mjs

- `receipt-evidence.mjs` (round 58, gate row in SKILL.md §Gate registry): REPRODUCTION — each
  receipt's recorded argv is re-run inside a `git archive` extraction of the judged rev and must
  match the recorded exit **and** stdout/stderr sha256. This is the executable embodiment of C2
  class m2. Also FRESHNESS (nonce sweep, fail-closed `SWEEP_GREP`/`SWEEP_NO_FILES`/
  `SWEEP_NO_NONCES`) and SPAN. CLI `verify --lane <dir> --rev <rev> --receipts <dir> …`;
  verdicts `RECEIPT_EVIDENCE: HELD …` exit 0 / `UNMET` 1 / `FAIL-CLOSED` 2 / usage 64;
  `--selftest` hermetic. Evidence: `kumitate-shokunin/scripts/receipt-evidence.mjs:1-85`.
- `round-gate.mjs`: audits one lane's round artifacts — report presence/SHONEN heading, cited
  commit ancestry, SCORECARD.md round row + `## Planned` forward, LOG.md entry, and
  `TREE_DIRTY`/`UNPUSHED`/`REPORT_UNTRACKED` findings (≈ C2 class m3: unlanded paths while
  asserting landed rounds). Exit map 0 clean · 1 findings · 2 fail-closed · 64 usage.
  Evidence: `kumitate-shokunin/scripts/round-gate.mjs:8-48,183-196`.

### 3.4 Fleet rule

- `scripts/hyaku/lane-addendum.md:220-221`: "A calibration claim must count mismatches between
  the lane's self-assessment (SCORECARD/SHONEN) and observed repo state. It cannot be an
  assertion." — C2's shape is protocol-stated, not tabi-invented.

## 4. Overlap verdict — reuse, do not invent a second convention

- **C1 (gate-registry conformance): reuse.** The §Gate eight-field schema, the registry-home
  rule (child lane's own SKILL.md), and the outer exit mapping (0 clean / 1 failed / 2
  could-not-evaluate) are already implemented by at least three sibling gates: kotoba's
  `check_gate_registry.py` (the de facto reference; exercised by closures per MANIFEST), kama's
  `gate-registry-check.py` (occurrence + meaning), and mori's `mori-gate-registry.py` (8-cell
  non-empty + resolution + selftest presence). Tabi should mirror the *interface surface* rather
  than introduce a third variant:
  - Required `--rev <full hash>` (never a moving ref) reading committed bytes via git; optional
    `--json`; a self-test flag spelling recorded in the row (PROTOCOL §Self-test leaves spelling
    to the lane; kama/mori/kumitate/tsukuroi use `--selftest`, kotoba uses `--self-test`).
  - Exit semantics identical to kotoba/kama/mori: 0 clean, 1 any nonconformant gate, 2
    could-not-evaluate (unparseable row / missing script / IO refusal counts as nonconformant or
    could-not-evaluate, never clean). Tabi's proposed `--selftest` exit map (0 only when every
    isolated case agrees) matches sibling practice.
  - JSON field names: tabi C1 proposes `{schema, rev, gates:[{name, script, row, missing}],
    nonconformant:N, clean}`; kotoba emits `{conformant, of, phantom, verifiers}` and kama
    prints `registered R unregistered U defective D`. Align on one counting vocabulary: at
    minimum document `nonconformant == of - conformant` and keep a per-gate `missing:[fields]`
    list (mori's per-cell defect reasons are the same idea). No sibling uses a
    `{schema, rev, …}` envelope; tabi may keep it as long as the count semantics are expressible
    in kotoba's terms.
- **C2 (self-assessment mismatch counter): partial reuse.** No sibling ships a generic
  triple-class counter with tabi's exact m1/m2/m3 classification; tsukuroi's
  `check-self-assessment.py` is the closest named sibling (0/1/2 + one JSON object + fixed check
  set) but its classes are K01–K27 and it never touches receipts or the worktree. The m2 and m3
  classes are separately embodied by kumitate `receipt-evidence.mjs` and `round-gate.mjs`.
  Recommendation: keep tabi's proposed `{schema, rev, mismatches, findings:[{class, doc, line,
  claimed, observed}], clean}` shape (no conflict with any sibling), but reuse the standard exit
  map (0/1/2, 2 = could-not-evaluate) and the "read only committed bytes at `--rev`" discipline,
  and name the classes m1/m2/m3 explicitly (tsukuroi's K-ids are its own; there is no shared
  class namespace to collide with).

## 5. Risks and notes

1. **Supersession rule divergence.** kotoba's checker requires exactly one row per script; a
   duplicate/superseded row reads as nonconformant. Tabi C1's API says "latest row wins (later
   rows supersede earlier ones in document order)" — no sibling implements that. If tabi lands
   appendix-only supersession rows (as C1 declares), a kotoba-style checker would flag them
   nonconformant. Decide explicitly: either adopt unique-row-per-script (fleet practice, no
   supersession allowed) or implement latest-row-wins as a documented tabi extension — do not
   ship an ambiguous parser.
2. **Tabi's own current registries are six-column.** tabi SKILL.md currently holds per-round
   registries with header `Name | Kind / owner | Entry and verdict map | Self-invocation |
   Persisted baseline | Write scope` (SKILL.md:1557,1612,1655,1753,1838) — not the §Gate
   eight-field header. C1's landing must migrate these to the eight-field §Gate header verbatim
   (kotoba's table) rather than keep a second column convention.
3. Flag spelling: `--selftest` (as used by kama, mori, tsukuroi, kumitate, and tabi's own
   claim docs) is fine; PROTOCOL leaves it lane-owned. Record it in the row.
4. Observed working tree: `tabi-shokunin/scripts/check-gate-registry.mjs` (18.1 KB) is present
   in the lane's scripts dir at observation time (mtime "just now", during wave 1). Not
   reviewed — the L1 writes the gate; this report covers sibling interfaces only.
5. No gate was executed (PROTOCOL §Closure consequence: the integrator verifies committed
   evidence, never executes a sibling's gate); all interface details above come from reading
   committed bytes.

## 6. Evidence index (commands)

- `read /home/vgpnk/Projects/shokunin` (fleet root listing)
- `read` kotoba `check_gate_registry.py:339-374 / 178-242 / 112-137 / 245-283`;
  kotoba `SKILL.md:463-516`; `PROTOCOL.md:375-423`
- `read` kama `gate-registry-check.py:1-95`; mori `mori-gate-registry.py:1-83`;
  tsukuroi `check-self-assessment.py:1-113`; tameshi `registry-check.py:1-58`
- `grep` MANIFEST.json `gate-registry-check|check-gate-registry|gate_registry_check`
  (hits 16676, 19047, 19292)
- `read` kumitate `receipt-evidence.mjs:1-85`, `round-gate.mjs:8-48,183-196`;
  kengaku `plans/fixtures/r26/state_p3/` (p3a/p3b/p3c fixture manifest + patches);
  kengaku `p3_oracle.sh:144-196`
- `read` tabi `SKILL.md:1554-1839` (six-column registries); tabi
  `.ufo/waves/round-24/claims.json` (frozen claims)

Report: .ufo/waves/round-24/w1/ConnSiblings.md
