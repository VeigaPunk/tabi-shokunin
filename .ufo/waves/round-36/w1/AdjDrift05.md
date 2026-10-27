# AdjDrift05 — C1 drift-audit independent re-derivation (tabi round 36, wave w1)

**Chunk:** `.ufo/waves/round-36/w1-chunks/AdjDrift05.tsv` — 20 rows, all citing
`kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`.
**Frozen delta head for kaidoku:** `1ed29de2cdd6061315fb2f5478d5029b7d570675`
(`.ufo/waves/round-36/baseline/c1-delta-pins.json`, digest pinned in claims.json).
**Committed ledger compared against:** `corpus/adjacency-screen-drift.tsv` (307 data rows, 3 `moved`, 304 `unchanged`, 0 `stale`).
**VERDICT: ok — 20/20 rows agree with the committed ledger, 0 mismatches.**

## Method (git objects only, read-only)

Per row `sibling_ref = <lane>-shokunin@<pin>:<path>:<line>`:

1. `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>`, take line `<line>`, trim
   leading/trailing space+tab+CR → **CITED** (line absent → `stale: pin line absent`).
2. Read `<lane>`'s frozen head `H` from `baseline/c1-delta-pins.json`;
   `git -C … show <H>:<path>` (absent → `stale: head file absent`). Head line `<line>` trimmed:
   equal to CITED → `unchanged`; else first head line whose trimmed text **equals** CITED at N → `moved :N`;
   not found → `stale`.
3. Located the ledger row by exact `sibling_ref` and compared status class; for a `moved` row the
   relocation line named in my status must appear in the ledger note (`verbatim at :N`).

Two independent implementations were run and cross-checked column-by-column:
`derive.py` (Python driver, logs every literal git invocation it made) and `shellpass.sh`
(pure `git`+`sed`+`grep -nxF`). **0 differing rows of 20.**
Driver: `python3 .ufo/waves/round-36/w1/AdjDrift05/derive.py` → `rows=20 mismatches=0`.

## Result (receipt.tsv, one line per input row)

| # | path:line | my status | ledger | agree |
|---|---|---|---|---|
| 1 | `corpus/knowledge/2026-10-13-rea-cli-surface.md:94` | unchanged | unchanged | agree |
| 2–20 | `corpus/knowledge/2026-10-14-r10-01-queue-ops.md:` lines **3, 9, 24, 25, 26, 116, 129, 131, 137, 153, 155, 156, 158, 235, 236, 241, 263, 264, 300** | unchanged (19/19) | unchanged | agree |

Totals: `# AdjDrift05: 20 rows, 0 mismatches`. No row in this chunk is `moved` or `stale`; the
committed ledger says the same, so the `unchanged` class is the only agreement class exercised here.

**Structural reason (not just line-by-line luck):** both cited files are byte-identical between the
pin and the frozen delta head —

```
git -C kaidoku-shokunin rev-parse <pin>:2026-10-13-rea-cli-surface.md <H>:2026-10-13-rea-cli-surface.md
  -> b43a050adf21eeb0d49dacc78a48fd9b680a9a6a  b43a050adf21eeb0d49dacc78a48fd9b680a9a6a
git -C kaidoku-shokunin rev-parse <pin>:2026-10-14-r10-01-queue-ops.md <H>:2026-10-14-r10-01-queue-ops.md
  -> 394e175f7303bce1bc749f23f41e1ae8c847db79  394e175f7303bce1bc749f23f41e1ae8c847db79
```

(line counts 325/325 both files). Kaidoku's drift is confined to `SKILL.md`, which is why the three
committed `moved` rows (585→748, 621→784, 652→815) are the only kaidoku relocations and none of them
falls in this chunk.

## Controls run (falsifiers against my own method)

- **Positive control** — same method on the three committed `moved` rows (outside my chunk):
  derives `moved :748`, `moved :784`, `moved :815`, i.e. exactly the ledger's `verbatim at :748/:784/:815`.
  The method therefore detects moves; `unchanged` here is not a default.
- **Negative control** — a cited line with one appended synthetic token yields 0 hits at head
  (method does not manufacture `moved`, and a genuinely absent text would classify `stale`).
- **Ledger integrity** — `uniq -d` over column 1 is empty (no duplicate `sibling_ref`); each of my 20
  refs matches exactly one ledger row (so row lookup was unambiguous).
- **Duplicate-text risk** — each of the 20 cited line texts occurs exactly once in its head file, so the
  `moved :N` first-hit rule cannot be ambiguous on this chunk.

## Evidence (retained in this seat dir)

- `receipt.tsv` — 20 rows `sibling_ref / my-status / my-note / ledger-status / agree|MISMATCH` + summary line.
- `commands.txt` — every literal git invocation made by the driver, plus the control commands.
- `derive.py` — primary derivation driver (logs its own git calls).
- `shellpass.sh` — second, independent git+sed derivation (re-runs to the same 20 statuses).

## Risks / limits

- My chunk contains only `unchanged` rows, so it verifies the `unchanged` class agreement and cannot
  speak to `moved`/`stale` agreement except through the positive control above (which ran on rows
  owned by another chunk; it is a method check, not an audit of those rows).
- Verification scope is git objects at the frozen heads; it says nothing about whether a cited line is
  the *right* line for the screen row (semantic screen quality is a separate review lane).
- Agreement is conditional on the ledger note convention `verbatim at :N` for `moved`; no such row
  occurs in this chunk, so that convention was not exercised in the ledger comparison itself.

## Tooling / hygiene

- No tool installed, upgraded or run beyond stock `git`, `python3`, `sed`, `grep`, `awk`, `diff`
  (no installs needed → no channel/version entries).
- Scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift05/` was `mkdir -p`'d, used with explicit
  `TMPDIR=…/tmp`, and **deleted** at the end of the run.
- No writes outside this seat dir and scratch; no git mutation anywhere; no subagents.

**VERDICT ok — 20/20 rows re-derived independently from kaidoku git objects at frozen head
`1ed29de2…` agree with the committed ledger; 0 mismatches.**
