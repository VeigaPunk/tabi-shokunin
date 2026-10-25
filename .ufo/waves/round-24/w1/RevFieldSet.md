# RevFieldSet — C1 gate-registry eight-field predicate review (round 24, w1)

**Seat:** L1Tabi24.RevFieldSet (leaf member; no subagent dispatch).
**Role:** read-only reviewer. Report path: `.ufo/waves/round-24/w1/RevFieldSet.md`.
**Question:** for each of the eight PROTOCOL §Gate standard fields, give the exact textual
predicate a parser can apply to a prose table cell, one false-green and one false-red; read the
real rows and say which a reasonable predicate would wrongly clear; recommend the minimal honest
field set if all eight cannot be decided mechanically.

## 0. Evidence (every number carries its command)

| Claim | Command (cwd = lane root) | Result |
|---|---|---|
| `round-evidence-audit` has no registry row in SKILL.md | `grep -c 'round-evidence-audit' SKILL.md` | 0 |
| Lane tip is the baseline (round 24 attempt 1 not yet landed) | `git rev-parse --verify refs/heads/master` | `573c99e4885382db38babc3a6fc90e77afeb42a6` |
| Every entry command named by the rows below exists at baseline | `git cat-file -e 573c99e:<path>` for the 15 scripts named in §4 | all OK (incl. `scripts/round-evidence-audit.mjs`; so the C1 defect is a missing row, not a missing script) |
| SCORECARD.md names only these gate scripts | `grep -oE 'scripts/[a-zA-Z0-9._-]+\.mjs' SCORECARD.md \| sort \| uniq -c \| sort -rn` | `round-evidence-audit` (4), `check-sources` (2), `check-measurement-binding` (2), `webmcp-loopback-round16` (1), `webmcp-invoke-round17` (1), `check-freshness` (1), `aria-loopback-round13` (1) |

Frozen claim source: `claims.json` C1 (read first; authoritative). Standard source:
`/home/vgpnk/Projects/shokunin/PROTOCOL.md:375-423` (§Gate standard; **Registry** at :398-406:
"Row fields: name, `gate|probe`, entry command, verdict map (code → class), self-test command
and spelling, pinned-value path, write scope, owner").

## 1. What the parser sees: five registry-table schemas in one SKILL.md

The gate must parse heterogeneous markdown tables; the "eight fields" are not always eight cells.

| Header line | Columns | 8-field mapping |
|---|---|---|
| `1557/1612/1655/1675/1753/1798`: `\| Name \| Kind / owner \| Entry and verdict map \| Self-invocation \| Persisted baseline\|pinned values \| Write scope \|` | 6 cells | name; kind+owner (split on `/`); entry+verdict (split on `;`/`,`); selftest; pinned-value; write scope |
| `1935`: `\| Entry \| argv \| Verdict map \| sha256 \|` | 4 cells | name; entry; verdict; **sha256 in the pinned-value slot** — no kind, no self-test command, no write scope, no owner |
| `2025`: `\| Name / kind \| Entry command \| Verdict map \| Self-test / expected values \| Write scope \|` | 5 cells | name+kind (split on `/`); entry; verdict; selftest+expected; write scope — no owner cell (preamble at 2022: "All entries owned by tabi") |
| `2096/2241`: `\| Name / kind \| Entry command (lane root) \| Verdict map \| Self-test \| Pinned values \| Write scope / owner \|` | 6 cells | name+kind; entry; verdict; selftest; pinned; write scope+owner |
| `2388/2433`: `\| Name \| Kind \| Entry command \| Verdict map \| Self-test \| Pinned-value path \| Write scope \| Owner \|` | 8 cells | direct (this is the canonical layout) |

Nobody "round-24 supersession section" exists yet at the baseline; the round-21/22 tables at
2388/2433 are the only canonical 8-column instances, and the round-17/18/19/20 tables are the
ones that diverge.

## 2. The eight predicates (exact, parseable)

Common normalization first: parse the table header; classify the schema (above); split merged
cells on ` / ` (kind/owner), on `;` and `,` (entry/verdict), taking the first backticked span
of the relevant chunk as the canonical command. Work on the cell text, not the rendered table.

- **P1 name.** Cell[0] trimmed must be nonempty and match `^[A-Za-z0-9][^|]*$` (accept spaces —
  "adjacency map" at 1940 is a legal name). Keep it as an identifier, but join the gate set by
  **script path** (below), not by name.
- **P2 kind.** Kind cell (or the first half of a `Name / kind` host) must contain the exact word
  `gate` or `probe` as a standalone token: regex `/(?:\A|\s|\/)(?:gate|probe)(?=\s|\/|\||\z)/`.
  A table schema with no kind-bearing cell is **undecidable → nonconformant** (kill rule):
  never default to `gate`.
- **P3 entry command.** The entry chunk must contain at least one backticked span matching
  `` `node\s+\S+\.mjs(?:\s|\|)` `` (or `` `/.../node\s+\S+\.mjs` `` for absolute node paths,
  e.g. 2390), and the referenced file must exist at the measured rev
  (`git cat-file -e <rev>:<path>`). Placeholders (`<manifest>`, `REV`, `NEW_DIRECTORY`) and a
  multi-command cell ("cmd1, or cmd2", e.g. 1559) are legal; accept the first span in the
  `node … .mjs` form.
- **P4 verdict map.** Normalize separators (`;` `,` `=` words). Require: a `0` token mapped to a
  clean-class token (`clean`, `observed finite run`, `evaluated`), and a `1` token mapped to a
  failed-class token; for **every other integer token** present in the cell, a class token
  (`clean|failed|could-not-evaluate` or `could not evaluate`) must occur in the same clause.
  Bare digits with no class token are nonconformant.
- **P5 self-test command and spelling.** The self-test chunk must contain a backticked span
  whose command includes `--self-test` or `--selftest`, **or** a reference to the entry command
  (`Same entry` / `same command`) plus the flag token; **and** the chunk must contain assertion
  vocabulary: `assert|exit|case|finding|fixture`. A bare tally ("self-test 57 cases") with no
  command, no flag and no assertion verbs fails.
- **P6 pinned-value path.** The pinned-value chunk must contain at least one path-like token:
  a backticked or bare string with a `/` separator and a leaf that is **not** a pure hex digest
  (regex `/(?:`)?(?:\.ufo|corpus|scripts|\./|[\w.-]+/)[\w./{}-]+/`), and the relative path
  must resolve to a committed file at the rev. Known limitation, disclosed in §6: a receipt path
  (`…/selftest-receipt.txt`) satisfies this; the predicate cannot tell expectation pins from
  evidence receipts.
- **P7 write scope.** Cell nonempty and containing ≥1 token from the write-vocabulary family:
  `read-only|read|readonly|writes|writ|creates|removes|removes|temp|fixture|stdout|private|new|blobs`.
  Synonyms such as "Production committed reads" (1677/1678/1800) must pass — never require the
  literal `read-only`.
- **P8 owner.** The row's owner-bearing cell (kind-half in 6-col tables, Owner column in 8-col)
  must contain the lane id `tabi`. A table schema with no owner cell is **undecidable →
  nonconformant**; the round-18 preamble ("All entries owned by tabi") may be used **only** if the
  parser explicitly implements preamble inheritance and records it — never a global default.

## 3. Per-field false-green / false-red (one each), with selftest mutants

| Field | False-green (should fail, passes) | False-red (complete row fails) | Green control | Red mutant |
|---|---|---|---|---|
| P1 name | Name cell empty; parser fills it from the section heading ("Sources gate registry" → "sources") | Name cell carries a round annotation ("aria-historical-metadata (r14)") rejected by a strict `^[a-z-]+$` matcher | `closeout-pin-witness` (1559) | drop the first cell → row has no name |
| P2 kind | Kind cell contains `gate` inside a longer word ("segregate", "gateish") under a substring match; or parser defaults missing kind to `gate` | Kind cell is "gate / tabi" (merged) — a predicate requiring the cell to equal exactly `gate` rejects all six 6-col rows | `gate / tabi` in 1559 | write `probe` for a registered gate, or blank the kind cell |
| P3 entry | Backticked span is a path, not a command ("`scripts/check-round-contract.mjs` constants …") — an any-backtick predicate accepts a prose-only entry cell | Entry uses absolute node path (`/home/vgpnk/.local/share/fnm/…/node scripts/webmcp-lifecycle-round21.mjs`, 2390) under a "must start with `node `" predicate | `` `node scripts/check-freshness.mjs --worktree` `` in 1559 | replace the command with prose; or point at a file missing at rev |
| P4 verdict | Cell maps 0→clean and 1→failed but leaves an extra digit bare ("… 2") — passes the half-predicate | "0=observed finite run; 1=failed execution; 2=could-not-evaluate" (2390) fails a predicate requiring the literal word `clean` | `0 clean, 1 failed, 2 could-not-evaluate` (1559) | append a bare `8` with no class token |
| P5 selftest | Cell contains the phrase "self-test 57 cases" with no command, flag or assertion (1940) — a `/self-?test/` substring predicate clears it | "Same entry with `--self-test` only" (1657) fails a predicate requiring a full backticked command in the selftest cell | 1559 (full command + "eight isolated CLI cases assert exit and stable finding") | drop the flag token; or keep tally-only wording |
| P6 pinned-value | Backticked hex digest `4e2c2a64…324aac` (1940) passes a predicate that accepts any backticked token / a receipt path (1614) passes a lenient any-path predicate | Cell naming in-script constants only ("Expected exit/finding table inside the script", 1614) fails a predicate requiring a `…/…` path | `…/freshness.expected.json` (1559) | replace the path with "none" / a bare constant name |
| P7 write scope | Empty cell defaults to "read-only" | "Production committed reads" (1677/1678/1800) fails a predicate requiring literal `read-only` | 1559 read-only clause | blank the cell |
| P8 owner | Global default owner = tabi (lane identity) clears every row, including 1940 which has no owner cell | A row explicitly co-owned ("kake / tabi") fails an exact "tabi" matcher | `tabi` in 1559 col2 | blank the owner half; or delete the owner column |
| P9 (whole-row) | A row parsed under the wrong schema (e.g. 4-col table read as 6-col: 1940's `argv` becomes "kind") — schema misclassification hides the missing fields | — | — | — |

## 4. Real-row verdicts (requested lines)

Read at `SKILL.md:1559,1614,1657,1677,1678,1755,1800,1801,1940` (raw, untruncated). Verdict
assumes the recommended predicate set of §2 and join-by-script.

| Line | Row | Latest-row status | Fields present | Verdict under reasonable predicates |
|---|---|---|---|---|
| 1559 | closeout-pin-witness (freshness gate registry) | only row | all 8 (kind+owner merged; entry has two alternative commands; verdict "0 clean, 1 failed, 2 could-not-evaluate"; selftest full command + "eight isolated CLI cases assert exit and stable finding"; pinned `…/freshness.expected.json`; write scope incl. read-only) | conformant |
| 1614 | sources-census | only row | 7 solid; **P6 weak**: pinned chunk says "Expected exit/finding table inside the script" (not a path) + receipt path `…/selftest-receipt.txt` | conformant under lenient P6; nonconformant under strict P6 — **decision point for L1 (§6)** |
| 1657 | claim-record-discipline | only row | all 8; **P5 shorthand**: "Same entry with `--self-test` only" (resolves against entry command) | conformant **only if** P5 implements the "same entry" resolution; false-reds under a full-command predicate |
| 1677 | historical-pstack-contract | only row | all 8 (pinned: script constants + `corpus/evidence/pstack-20261015/baseline-census.tsv`) | conformant |
| 1678 | historical-user-contract | superseded by 1800 | all 8 | conformant (superseded; latest wins → 1800 governs) |
| 1755 | aria-historical-metadata (r14) | superseded by 1801 | all 8; exact `--witness`/check paths | conformant |
| 1800 | historical-user-contract (r15 override) | **latest** | all 8 (incl. `--count-witness <40hex>`; pinned = script constants + explicit expectations) | conformant |
| 1801 | aria-historical-metadata (r15 override) | **latest** | all 8 (verdict "0 clean, 1 semantic failed, 2 could-not-evaluate including snapshot_tampered/…") | conformant |
| 1940 | adjacency map (round-17 4-col table) | only row | present: name, entry (`argv` cell), verdict, sha256. **Missing: kind, self-test command+spelling (tally only), pinned-value path (hex only), write scope, owner** | **nonconformant** under the §2 predicate set — the C1 defect the claim targets |

Context rows adjacent to the requested set (same gates' stories):

| Line | Row | Note |
|---|---|---|
| 1840 | measurement-binding (round-16 5-col table) | only row for `check-measurement-binding.mjs` (1939 is a 4-col alias). Missing kind and owner cells; P6 cell lists checks but no committed path (`<manifest>` argv placeholder is not a path) → **nonconformant** under strict parse |
| 1937/1938/1939 | "round contract" / "user contract" / "measurement binding" (round-17 4-col) | same 4-col schema as 1940; if joined **by script**, these are the latest rows for `check-round-contract.mjs` / `check-user-round-contract.mjs` / `check-measurement-binding.mjs`, superseding the conformant 1677/1800/1840 rows → all three become nonconformant |
| 2027-2032 | round-18 5-col rows (probes) | kind present (merged), owner via preamble only; P5 present for most ("--self-test:8 cases…") |
| 2243-2246 | round-20 6-col rows | kind+owner merged; conformant under split rules |
| 2390-2391, 2435-2436 | round-21/22 canonical 8-col rows | the model layout; 2390 shows the P4 false-red ("0=observed finite run") and P3 absolute-node-path forms |

**Which rows a reasonable predicate would wrongly clear** (the assignment's key question):

1. **1940 (adjacency map)** — wrongly cleared by each of: (a) P5 substring predicate ("self-test
   57 cases" satisfies `/self-?test/`); (b) P6 accepting the backticked hex `4e2c2a64…324aac`
   as a pinned-value (no `/`, no filename); (c) defaulting kind=gate and owner=tabi when the
   4-col table has no such cells. A predicate set with any one of these three weaknesses clears
   the row the C1 claim exists to catch. **Fix:** require flag token + assertion vocabulary in
   P5; require a `/`-bearing non-hex path in P6; fail closed on missing kind/owner cells.
2. **1840 (measurement-binding)** — wrongly cleared by a parser that drops P2/P8 when the table
   has no kind/owner column (schema-adaptive trimming), or that treats the `Pinned / checked`
   cell (checks-only prose) as a path.
3. **1614 (sources-census)** — wrongly cleared by a lenient P6 that accepts the receipt path as
   the pinned-value path. Whether this is a true false-green depends on whether the lane accepts
   in-script expected constants as "pinned values" (see §6).
4. **1937/1938/1939** — wrongly cleared by the same three weaknesses as 1940 if the parser does
   not join by script (name-join keeps the earlier conformant rows alive and masks the 4-col
   rows' missing fields).

**Rows a reasonable predicate would wrongly fail** (false-red on real rows): 1657 if P5 lacks
the "same entry" resolution; 2390 if P4 requires the literal word `clean`; 1559 if P3 rejects
multi-command cells; all six 6-col rows if P2 requires the kind cell to equal `gate` exactly;
1677/1678/1800 if P7 requires literal `read-only`.

## 5. Gate-set definition (dependency the predicate review exposes)

The claim's counter is "for every gate in the lane's gate-script set". The set **cannot** be
derived from registry rows (absent rows would vanish from the set — the very defect C1 measures),
and SCORECARD.md alone is insufficient: it names only 7 of the 9 scripts that own rows
(§0; it omits `check-round-contract.mjs`, `check-user-round-contract.mjs`,
`check-aria-metadata.mjs`, `check-adjacency.mjs`). Recommendation: the gate ships an explicit,
frozen inventory constant (the 9 gates + registered probes), cross-checked against
`scripts/check-*.mjs` ∪ `scripts/*-audit.mjs` ∪ named rows; any script in the inventory with no
row, or any row naming a script not in the inventory, is a finding. The inventory is the control's
load-bearing piece: `round-evidence-audit.mjs` must be in it even though its row is absent.

## 6. Minimal honest field set

**Recommendation: keep all eight.** Each predicate can be shown red on a mutant and green on a
conformant row (§3's phenotype/control pairs are directly implementable as `--selftest` cases:
the claim's failureCapable already requires "a mutant that drops one field and a mutant that
removes the row"). No field forces a drop under the kill rule, provided the L1 gate adopts:

1. **Fail-closed schema handling** (P2/P8): a row in a table schema with no kind/owner cell is
   nonconformant, never defaulted. This is what makes 1940/1840/1937-1939 red.
2. **P5 "same entry" resolution** — otherwise 1657 (a conformant row) goes false-red.
3. **P6 as a committed-path predicate with a disclosed false-green**: receipts satisfy it; the
   prose text cannot distinguish pins from receipts. Document this as a residual risk. For 1614,
   explicitly decide (and record in the gate's README or selftest) whether in-script expected
   constants count as a "pinned-value path"; the lane's own row for round-22 (2435) pins files,
   and PROTOCOL's "Two evidences" expects digests of snapshot inputs to be pinned — I read the
   honest choice as **requiring a committed path** and therefore flagging 1614 as nonconformant
   until a superseding row names its expected-values file (this matches the round-23 precedent
   where a missing cell was the routed defect). If L1 chooses the lenient reading instead, state
   it explicitly; either way the row is decided, not silently passed.
4. **P4 class-token tolerance** (probe labels, `=` separators) — otherwise 2390 false-reds.
5. **Join by script path**, not row name; treat name aliases ("round contract" vs
   "historical-pstack-contract") as the same gate. Otherwise the 4-col round-17 rows silently
   stop superseding the conformant rows above them.

If the L1 gate nevertheless finds one field mechanically undecidable both ways, the drop order by
weakest decidability is: **P6 first** (path presence ≠ pin correctness; only field whose green
control can be satisfied by a non-pin file), then **P5** (shorthand resolution), then **P8/P2**
(schema-dependent). Dropping any field changes the frozen claim's field set; per the claim text
the target then "misses honestly" — the gate must report the reduced field set in `--json` output
rather than silently asserting the full eight.

## 7. Residual risk and verification gaps

- The exact gate-set inventory does not yet exist as a committed constant; the counter's baseline
  N depends on it. This is the highest-leverage gap for the L1 to close before measuring.
- P6 cannot distinguish a receipt from expectation pins (false-green 3 above): no purely textual
  predicate can. Mitigation: require the path's leaf to match a pin-hint pattern
  (`expected|expect|pin|fixture|baseline|expectations`) OR name the choice in the gate's docs;
  a leaf named `selftest-receipt.txt` then reads as a receipt, not pins, and 1614 stays red
  unless a superseding row names a pin file.
- Rows at 1937-1942 (round-17) embed a pinned sha256 per entry; if the lane intends that table as
  a pin annex rather than a superseding registry, the parser must recognize it as non-registry —
  otherwise the round-contract/user-contract/measurement-binding gates go red despite complete
  earlier rows. This table-classification rule must be explicit and tested.
- Round-18/19/20 tables carry owner via preamble/merged cells only; if preamble inheritance is
  implemented for 2025-2032, it must not leak to the round-17 table (no preamble there).
- Numbers above were produced at the worktree/tip `573c99e` (baseline); the gate itself reads
  `--rev` bytes, so identical parsing must be verified against `git show <rev>:SKILL.md`.

— End.
