# ExecDriftEdge — w1 probe: the C1 counter's handling of malformed drift rows

Lane: tabi (round 36, attempt 1, wave w1). Milestone C1, judged on adjacency. Leaf seat; no subagents.
Freeze: claims, counters, control receipts at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.

## 1. What was run

* Counter **bytes taken from the freeze** — `git -C tabi-shokunin show 2e7b7a89:.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs`
  → sha256 `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385`, equal to `frozenDigests` in `claims.json`.
  Never run from a worktree copy.
* Scratch clone of the lane, detached at the freeze rev: `/fast/scratch/hyaku/tabi-r36/ExecDriftEdge/clone`
  (one commit per variant inside that clone; `git -C <clone> rev-parse --show-toplevel` asserted to be the clone on every mutation).
* `TMPDIR=/fast/scratch/hyaku/tabi-r36/ExecDriftEdge/tmp` passed explicitly; `--fleet /home/vgpnk/Projects/shokunin`.
* Command shape, identical for all six runs:
  `node <scratch>/counter/c1-adjacency-sweep-v4.mjs --rev <variant-rev> --repo <scratch>/clone --fleet /home/vgpnk/Projects/shokunin --json`
* **Nothing was regenerated**: `c1-drift-audit-build.mjs` was not run for any variant; every mutant is a hand edit of
  `corpus/adjacency-screen-browser.tsv` or `corpus/adjacency-screen-drift.tsv` on top of the frozen ledger.
* No tool installed or upgraded (node v24.21.0, git 2.56.0 as present). No pacman.

Raw JSON for every run is in this seat directory; `probe-matrix.json` carries each rev, exit code and output sha256.

| # | variant | rev (clone commit) | exit | predicate | stack trace |
|---|---|---|---|---|---|
| 0 | frozen ledger, no edits | `2e7b7a89…` | **0** | true | no |
| A | first drifted screen row cites line **99999** | `3bdfdc6e…` | **1** | false | **no** |
| B1 | audit row for a **non-drifted** lane (audio) | `0de15e79…` | **1** | false | **no** |
| B2 | **duplicated** audit row (chousa) | `ff26dc54…` | **1** | false | **no** |
| C | five malformed audit rows at once | `550848de…` | **1** | false | **no** |
| D | duplicated **screen** row, non-drifted lane (kagi) | `1638ee8e…` | **0** | **true** | no |

## 2. Baseline reproduces the claim's surface (exit 0)

`baseline.json` — predicate **true**, adjacency `clean` 16/16 rows, completeness `383` candidates / `383` screened /
`unaccounted 0`, drift `total 307` with observed `unchanged 304, moved 3, stale 0`, `auditCoverage 307`,
`auditFindings 0`, `auditMissing 0`, `staleFindings 0`, delta `total 0`. This matches the numbers disclosed in
`claims.json` for the frozen ledger, read independently from the freeze bytes.

## 3. Probe (a) — citation rewritten to line 99999: clean stale handling, no stack trace

Mutant A rewrote **line 2** of `corpus/adjacency-screen-browser.tsv` — the first drifted-lane row, the chousa row
`chousa-shokunin@00f8c7f5…:corpus/knowledge/archived-export-intake.md:141` — to cite `:99999`. The chousa pin file is
213 lines and the chousa delta head (`f9736a39…`) is also 213 lines, so the citation is out of range on both sides.

Result (`A-line99999.json`), exit **1**, **stderr empty (0 bytes), no unhandled exception**:

* `drift.observed` becomes `unchanged 303, moved 3, stale 1` — the malformed citation is re-derived as
  `status=stale` with detail `pin line absent` (counter line 406: `cited === null` short-circuits **before** any head
  lookup, so no index is taken on a short line array).
* `drift.auditCoverage` 306 of 307, `auditMissing` = the `:99999` ref, and the ledger's own row for `:141` is reported
  as `audit-not-a-drift-row` (counter line 434) because `observed` is keyed by the *new* ref.
* `completeness.unaccounted` 1 with `screen-not-a-candidate` on row 2 (counter line 313 pushes the screen row before
  candidate validation, so a bogus ref cannot silently screen its candidate away).

So the mutation is caught **twice over** by independent gates, and the drift leg degrades to an honest `stale`
count instead of crashing. This is the "clean stale handling" outcome the assignment predicted.

## 4. Probe (b) — audit rows for non-drifted lanes, duplicates, and five malformed shapes

| variant | what was added | counter response |
|---|---|---|
| B1 | `audio-shokunin@7a2fcd4f…:corpus/QUALITY.md:1  unchanged  -` (audio is in `PINS` but its delta head equals its pin) | `auditFindings[0] = {row 309, audit-not-a-drift-ref}` (line 432); coverage unchanged at 307; exit 1 |
| B2 | byte-identical duplicate of the existing chousa `unchanged` audit row | `auditFindings[0] = {row 309, audit-duplicate}` (line 445); coverage unchanged; exit 1 |
| C | (1) status `verified`; (2) two-column row; (3) ref `garbage-ref`; (4) `unchanged` on a row observed `moved`; (5) `moved` with relocation `:99999` | five distinct findings, one per row: `audit-status-unknown` (435), `audit-columns` (429), `audit-not-a-drift-ref` (432), `audit-status-mismatch "unchanged != observed moved"` (436), `audit-moved-wrong-relocation ":99999"` (443); exit 1 |

Variant C's fifth row is the sharpest one: the moved branch bounds-checks the named relocation **before** indexing head
lines (`nn > hl.length` at line 443) and kaidoku's head `SKILL.md` is 1568 lines, so `:99999` is refused as a finding
rather than an out-of-bounds `TypeError`. The `moved` branch's own `lines(blob(pin))[n-1].trim()` at line 442 is safe
because reaching it requires `observed === moved`, which requires the pin line to exist.

Validation order is the reason all of this is quiet: columns → ref/drifted → observed presence → status vocabulary →
status equality → relocation bounds → duplicate. Every malformed shape exits as a *named finding inside the JSON*, and
`main()` only converts `Refusal` into exit 2 — no malformed row I could build from read-only git objects reached a raw
throw.

## 5. Finding — the predicate does not gate `completeness.screenFindings`

Variant D duplicated the screen row for the **non-drifted** kagi lane (`SKILL.md:11`) at the end of
`corpus/adjacency-screen-browser.tsv`.

`D-duplicate-screen-row.json`: `completeness.screenFindings = [{row 385, screen-duplicate, kagi…SKILL.md:11}]`,
`unaccounted 0`, drift untouched, delta 0 — and the counter **exits 0 with `predicate: true`** (5.0 s, no stderr).

This is faithful to the frozen sentence, not a coding defect: `claims.json`'s predicate is
`… AND delta.unaccounted == 0 AND delta.screenFindings == 0` and never names `completeness.screenFindings`, and the
counter's `predicate` assembly (lines 558-563) matches it conjunct for conjunct. The consequence is that exactly one
malformed-row family — a **duplicated screen row for a lane outside the drift set** — leaves a live finding in the
output while the counter reports the claim met. Every other completeness malformation I can reach (bogus ref, bad
reason, bad quote, wrong surface, malformed length) removes the candidate's screening and therefore trips
`unaccounted`, which is gated.

Classification: predicate-scope gap in C1 as frozen, **not** an unhandled-malformation bug and not a counter defect.
It does not move C1's own measured target (the honest ledger is unaffected; the gap needs an added junk row). It is a
w2 hardening note: `completeness.screenFindings == 0` (and, symmetrically, `completeness.screenFindings` as a conjunct)
would close it, and the r36 delta-screen analogue (`delta.screenFindings`) is already gated.

## 6. Scope limits of this probe (disclosed, not hidden)

* The delta pool is empty at the freeze (`delta.total 0`), so the delta-leg validators
  (`screen-not-a-delta-candidate`, the `same-surface` check on delta rows) were exercised by reading only, never with
  real data — a delta-row mutant cannot be built without mutating a sibling repo, which is out of scope for this seat.
* A `stale` row whose head line now holds browser-ground text (the `staleFindings` gate, line 502-515) is likewise
  unreachable read-only: it needs a pin file longer than the head file with BG text at the same line, i.e. a sibling
  mutation.
* Variants A–D are scratch-clone commits only. Nothing was written to the lane repo outside this seat directory, and no
  sibling repo, fleet-root file, `.ufo/state`, `MANIFEST.json`, `templates/` or `scripts/` entry was touched. All git
  calls were read-only against the lane/fleet and `-C`-scoped to the scratch clone for the variant commits.

## 7. Retained evidence (this directory)

```
baseline.json                 94e3d653…  exit 0  predicate true   (frozen ledger re-measured from freeze bytes)
A-line99999.json              e1468537…  exit 1  stale 1 / auditMissing 1 / unaccounted 1
B1-nondrifted-audit.json      d4b3b8b1…  exit 1  audit-not-a-drift-ref
B2-duplicate-audit.json       94bc38ad…  exit 1  audit-duplicate
C-malformed-audit.json        21d28589…  exit 1  five findings (unknown status / columns / bad ref / mismatch / :99999)
D-duplicate-screen-row.json   7cfff278…  exit 0  predicate TRUE with screen-duplicate live   <-- §5 finding
probe-matrix.json                        machine-readable matrix (revs, exits, digests, code-path notes)
```

Scratch root `/fast/scratch/hyaku/tabi-r36/ExecDriftEdge/` (clone, counter bytes, tmp, out) is deleted on exit; the
JSON copies above are the durable evidence.

VERDICT finding — malformed drift rows are handled cleanly (no stack trace anywhere: A/B1/B2/C all exit 1 with named
findings, the 99999 citation degrades to an honest `stale` and is caught again by `auditMissing` + `unaccounted`), but
the frozen C1 predicate does not gate `completeness.screenFindings`, so a duplicated screen row for a non-drifted lane
still exits 0 with `predicate: true` (variant D); predicate-scope gap in the frozen sentence, not a counter defect, and
no effect on C1's measured target.
