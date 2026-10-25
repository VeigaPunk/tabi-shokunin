# ScoutJunkCount — C3 counter junk-reachability falsification (round 27, wave 2)

Seat: `ScoutJunkCount` (scout, leaf, no subagents). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; tip
measured at `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (moved during the run from `5ed6484`; both measured).
Read-only reporter: no tracked file edited, no git/jj writes, no fleet/sibling touches, no builds/linters/
formatters, no tool installs. Throwaway fixtures under
`.ufo/waves/round-27/scratch/ScoutJunkCount/` (gitignored by `.gitignore:5`). This item re-derives the wave-1
`CritC3Junk.md` junk-fixture result independently (fresh fixture, fresh commands) and answers the two questions
the frozen claim carries to wave falsification: which frozen mechanism prevents a junk landing, and whether the
closure can re-derive the difference.

## 1. Junk fixture: the counting command is met by a 109-byte filler

**Fixture (independent of CritC3Junk):** `D=$(mktemp -d -p …/scratch/ScoutJunkCount junkrepo.XXXXXX)`; `git -C "$D" init -q`;
`git -C "$D" rev-parse --show-toplevel` == `"$D"` verified before the first commit. One file
`corpus/knowledge/junk.md` (109 bytes), content:

```
# Junk entry

source: S107 (filler, no URL, no quote, no location)

Lorem ipsum filler line with no content.
```

Committed `361437f99d0e7e77e6494c0fe4436a974d01ecc1`. Command and result:

```
git -C "$D" grep -lE '^source: S107 ' "$REV" -- corpus/knowledge | wc -l   ->  1
```

The frozen C3 counting command (`claims.json` C3.countingCommand) returns **1** for a file with no URL, no
quote, no location and no analysis. Re-verified at the live tip: baseline `f185b4e` → 0; `6ca3b89` → 1;
`5ed6484` → 1; `bceb17d` → 1 (single match `corpus/knowledge/redirect-and-retry-after-semantics.md`). Row
count 106 → 107 at tip; fleet census `validate --root … tabi` exit 0. The numerical target (`>=1`) is
junk-satisfiable.

**Junk-shape blind spots of the counter (measured):**
- **Regex anchor:** `grep` matches `^source: S107 ` at any line start. In the lane 8 of 15 knowledge files
  carry `^source: S### ` on line 1; the C3 entry has it on line 3. A line buried at any position counts.
- **Path/extension:** a nested, extensionless, trailing-line file counts (`corpus/knowledge/deep/noext`, line 4
  `source: S107 buried` → 1; fixture `junkrepo5`).
- **Inflation:** an orphan junk file *alongside* the real entry (registry untouched) makes the counter return
  **2** (fixture `junkrepo3`, rev `0ed83b99`), while the census and lane gate stay clean (see §2). The target
  `>=1` cannot distinguish "one real entry" from "real entry + junk" or "junk alone".

## 2. The mechanical gates are junk-blind (measured, both gates)

A junk landing requires the registry row's `used-by` to point at the junk file (else fleet census E11
`used-by path missing` fires — measured via `junkmirror` with a repointed cell). With the repointed cell:

- **Fleet census** `sources-census.sh validate --file <mirror>/corpus/SOURCES.md --today 2026-10-25` → exit
  **0**, line `file ok <mirror>/corpus/SOURCES.md` (receipt `census-junk.out`, sha256
  `05a2930c46196554c07afdb94225acf360780db8320f0d903a603f8348212907`).
- **Lane gate** `node scripts/check-sources.mjs --root <mirror>` → `SOURCES_GATE verdict=clean rows=107
  tiers=A:92,B:6,C:9 status=queued:19,mined:79,rejected:9 findings=0`, exit 0 (receipt `lanegate-junk.out`,
  sha256 `bab9c3490d3061be2d6f6a1c934fb8c962edbb1b757e67ba09cde9200a45ece4`).

Mechanism: `check-sources.mjs` couples the registry row to the file by **path existence + the presence of the
token `S107`** in the file (`inspectUsedBy`, regex `(?<![A-Za-z0-9])S107(?![0-9])`); the census E11 checks the
same path and the token. Neither parses quotes, citations, front matter or analysis. The lane's `scripts/` sweep
(`grep -rn "corpus/knowledge" scripts/*.mjs`) shows only `check-freshness.mjs` (byte-witness `ls-tree` paths),
`check-sources.mjs` (path + token), `check-user-round-contract.mjs` (pointer path) and the round-13 harness touch
knowledge entries — none reads entry prose.

## 3. Which frozen mechanism prevents landing? A judgment seat, not a gate

The frozen claim names the mechanism explicitly (C3.control): "a junk entry naming S107 without located quotes
must fail the QUALITY review seat" — carried to wave falsification. Concretely, the landing barrier is the
**QUALITY bar review seat**:

- `corpus/QUALITY.md` criterion 2 ("Every claim carries a source: a measured anchor (path:line, command,
  evidence id) — never oral knowledge") and criterion 3 (observation/inference/unknown separation) are prose
  bars, enforced by reviewers, not by an instrument. No lane gate executes them.
- The wave-1 seat `RevEntryC3` check (e) ("does the entry carry real content a `source: S107` filler could not
  fake?") is a reading; `ExecQualityGate` is a manual quote census. Neither plants a junk mutant; both are
  judgment/reading seats.
- **Wave falsification** (this wave 2) is the designed control arm: the junk reachability is tested by seats
  like this one, and the claim is honest that the arm is carried, not gate-mechanized.

So the answer to "which frozen mechanism prevents landing it": **the QUALITY review seat's judgment** (criterion
2/3 read by seats), **the claim's own control arm** (a review-seat failure requirement), and **wave
falsification** — none of which is a mechanical counter. The count/census/gate surfaces are junk-blind by
measurement (§1–§2).

## 4. Can the closure re-derive the difference? Yes mechanically for quote-absence, no for the full gap

The question: can the closure (the non-author/L1 gate set) re-derive the difference between the landed entry's
located quotes and the junk's absence?

- **The material for re-derivation exists and is committed:** the entry's `source:` line carries the byte count
  and sha256 `21c1cdce…`; the bytes are tracked at `.ufo/waves/round-27/assimilation/rfc9110.txt` (blob
  `19a88abc`, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`); the entry's quoted
  spans resolve in those bytes (tip `5ed6484` blob: 9 spans, 6 located after whitespace/table-strip
  normalization; worktree/tip `bceb17d` blob `d5878a83`: 8 spans, 7 located; the two residuals at the new tip
  are lane glosses — "the form was POSTed" — not offered as source quotes).
- **But no committed instrument re-derives it.** No lane script extracts entry quotes or checks them against the
  bytes; the closure's gate set (counter, census, lane gate, freshness witness) is junk-blind (§2). The
  difference is therefore re-derivable **only by running a new, uncommitted probe** — which is exactly what a
  wave seat does, not what the closure runs.
- **A mechanical discriminator is possible but not complete.** I built one (scratch `discriminator.mjs`; P1
  ≥1 located quoted span, P2 ≥1 numeric line citation all in-range, P3 source line carries sha256). Results:
  real entry → PASS (8 spans, 7 located, 13 citations); bare junk filler → REFUSE (0 spans, 0 citations, no
  sha); quote-paste junk (two verbatim quotes, no line citations) → REFUSE (P2 fails); **hardened junk** (one
  verbatim quote + one real line citation + correct sha256) → PASS. So even a purpose-built mechanical probe
  separates "no evidence" from "evidence" but cannot separate a minimal-but-cited junk from a real entry — the
  residual (analysis, observation/inference/unknown separation, novelty) is judgment. This matches the W1
  finding that the frozen kill rule's "any quote absent" is vacuously satisfied by a zero-quote file and that
  byte-exact quote matching alone would falsely refuse the *real* entry.

**Bottom line:** the closure can re-derive the difference only in the direction "junk has no located quotes" —
via a new probe like `discriminator.mjs` — not via any existing landed gate, and even that probe cannot fully
close the gap against a cited-but-content-free entry. The numerical C3 counter remains junk-blind, and the
frozen prevention mechanism is the QUALITY review seat's judgment, not the counter.

## 5. Evidence appendix (commands)

- `git -C "$D" rev-parse --show-toplevel` == `$D` before first commit (fixtures `junkrepo*`).
- Fixture revs: `junkrepo` `361437f99…`, `junkrepo2` `84dccc45…`, `junkrepo3` `0ed83b99…`, `junkrepo4`
  `cb8be188…`, `junkrepo5` `06c10867…`.
- `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l` → 1 (junk repo), 2 (orphan junk repo3),
  0/1/1/1 across `f185b4e`/`6ca3b89`/`5ed6484`/`bceb17d`.
- `bash …/sources-census.sh validate --file <mirror>/corpus/SOURCES.md --today 2026-10-25` → exit 0
  (`census-junk.out`).
- `node scripts/check-sources.mjs --root <mirror>` → `verdict=clean findings=0`, exit 0
  (`lanegate-junk.out`).
- `node scratch/ScoutJunkCount/discriminator.mjs <entry> .ufo/waves/round-27/assimilation/rfc9110.txt` →
  exit 0 (real entry) / 1 (filler, quote-paste) / 0 (hardened junk).
- `git show 5ed6484:corpus/knowledge/redirect-and-retry-after-semantics.md` (blob `848c0321`) vs worktree/tip
  `bceb17d` blob `d5878a83` (8 spans, 7 located).
- `sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt` → `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; `git ls-tree HEAD -- …rfc9110.txt` → blob `19a88abc`.

## 6. Tooling

Nothing installed or upgraded (no pacman/uv/npx/binary). `node` and `python3` from host; fixtures use scratch
`git` repos. PACMAN untouched.
