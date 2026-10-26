# w2 MutC1Entry — mutation probe of the landed C1 entry/receipt against the frozen gate

**Verdict.** The frozen gate `scripts/check-bidi-runtime.mjs` (sha256 `2f25af5a…`, byte-identical to `frozenDigests` in claims.json) on a pristine checkout of `b234a58920134424e0d104f137311ff54a16d26b` exits 0 with population 16 / admitted 16 / failing 0 under `--live`, and four of the six mutations are killed loudly (exit 1, all rows failing or one row failing). Two mutants survive, and both are population/verdict-integrity findings rather than new defects: (1) **decorating a Measured cell to `yes (live)` silently shrinks the population 16→15 and the gate still exits 0 clean** — the row is dropped from the population instead of failing, exactly the w1 RevQualityBar trap 2, and the plain-counts closure `.ufo/waves/round-32/measure/c1-distinct.mjs` shares the same parse rule so it also reports `ok:true` — neither detector records the decorated row as a failure; (2) **pointing run2 at run1's transcript passes the frozen gate clean (16/16/0)** — the disclosed two-runs hole (entry §8, w1 CritC1Forgery) — and here the closure does its job (`c1-distinct.mjs` exit 1, distinct transcript paths/digests = 1). Mutations B (strip source ids), D (one transcript byte), E (R16 yes), F (drop driver) are killed with the expected reasons. Every mutant's bytes were restored; final tree hashes equal the pristine hashes and `git status --porcelain` is empty.

## Setup

- Scratch clone (only live clone): `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`, `git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b`, `$S=/fast/scratch/hyaku/tabi-r32/MutC1Entry`, TMPDIR under it; `git rev-parse --show-toplevel` verified equal to the clone on every git call; commits only in the clone with `-c user.name=MutC1Entry -c user.email=MutC1Entry@scratch.local`. The lane checkout was never written.
- Frozen counter bytes at REV verified: `sha256sum` → `check-bidi-runtime.mjs` `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`, `check-selfassessment.mjs` `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9` (both match claims.json `frozenDigests`).
- Detector command (per run, in the clone): `TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json`; every run's stdout JSON and stderr are copied to `.ufo/waves/round-32/w2/MutC1Entry/`.
- No tools were installed or upgraded (node v24.21.0, jq, git, chromium/chromedriver 154.0.8037.97 already present); pacman untouched.

## Baseline (pristine) — detector works

`--rev b234a589…` → **exit 0**, `population=16 admitted=16 failing=0 clean=true entryFinding=null binding=null live=true` (`baseline.json`). The live leg ran (chromium + chromedriver 154.0.8037.97, loopback fixture; stderr empty; no chromedriver/chromium process left behind). Pristine hashes, all re-verified after every restore:

```
1a391000676b23d2332b22dae251c8315ef9b38a49c38073475dc22151600e86  corpus/knowledge/webdriver-bidi-runtime-round-32.md
e739d53df693f1673d32df7562ce25c14f71cb7875ca7804be8ff6b7f8b88cf4  corpus/evidence/round-32/bidi/receipt.json
8aa97463c2386515407328cd96a55b4f38aeb0c376a87ddc2d323c8209aaf851  corpus/evidence/round-32/bidi/run1/transcript.jsonl
9918a716da71b41e0366fa6839217e8a191e2f473826ade0bd9ab3bedc7169d7  corpus/evidence/round-32/bidi/run2/transcript.jsonl
55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a  scripts/bidi-loopback-round32.mjs
```

## Mutants (one at a time, committed, gated, restored)

| # | Mutation (target) | Mutant bytes sha256 (mutated file) | Gate exit | population / admitted / failing | Reason observed | Verdict |
|---|---|---|---|---|---|---|
| baseline | none | — (see table above) | 0 | 16 / 16 / 0 | — | clean |
| A | R2 Measured `yes` → `yes (live)` (entry :68) | entry `c8683d9e5de0a8f1…` | **0** | **15 / 15 / 0** | **none — row silently dropped from population; `clean=true`** | **SURVIVED (trap 2)** |
| B | remove `S124`/`S125`/`S126` ids from `source:` line (entry :5) | entry `85aa3ecfe4612d5f…` | 1 | 16 / 0 / 16 | `entryFinding=s1-source-row` on all rows | killed |
| C | receipt run2 `transcript`/`transcriptSha256` → run1's (receipt :160-161) | receipt `b15869232b19d09a…` | **0** | **16 / 16 / 0** | **none — `clean=true`, binding null** | **SURVIVED gate; killed by closure (see below)** |
| D | one byte in run1 transcript (`prof-bWDBKf` → `prof-bWDBKe`, line 1 userDataDir) | transcript `7d5a4ff0ed5611da…` | 1 | 16 / 0 / 16 | `t1-receipt` — `transcript sha256 differs: …/run1/transcript.jsonl` | killed |
| E | R16 Measured `no — no BiDi command` → `yes` (entry :82) | entry `3f7f2cd8e424c71f…` | 1 | **17** / 16 / 1 | `x2-no-counterpart` on R16 only | killed |
| F | `git rm scripts/bidi-loopback-round32.mjs` | driver absent at mutant rev `4d7c6bc7…` | 1 | 16 / 0 / 16 | `t1-receipt` — `driver absent, is this counter, or its sha256 differs` | killed |

Commands run per mutant (exit codes pasted from the transcript): hash → `git add -A && git -c user.name=MutC1Entry -c user.email=MutC1Entry@scratch.local commit` → detector (exit code echoed) → `jq` extract → `git reset -q --hard b234a589…` → hash re-check → `git status --porcelain | wc -l` (0 each time).

## Findings

1. **Defect (coverage, known-but-unanswered for decorated cells): the frozen gate treats a decorated Measured cell as absence, not failure.** `evaluate()` filters `(r.cells[3] || "").toLowerCase() === "yes"` (scripts/check-bidi-runtime.mjs:501 in the counter's `parseTable` consumption path) before counting, so mutant A's R2 row leaves the population entirely: `population=15 admitted=15 failing=0 clean=true`, exit 0. Nothing in the JSON names R2 or the decoration — silent drop, no row entry at all. This is precisely w1 RevQualityBar trap 2 reproduced at the landed entry. **The plain-counts closure does not close it:** `c1-distinct.mjs` applies the same `c[3].toLowerCase() === "yes"` rule, so on mutant A it prints `rowsMarkedYes=15 distinctRowIds=15 duplicateListings=0 ok=true`, exit 0 (`A-decorate-measured.distinct.json`). An entry that decorates every cell `yes (live)` would pass both counters with population 0 and neither would fail (population 0 only blocks `clean` via `population >= 1`; the closure's own `ok` does not require rows > 0). Smallest append-only fix: the round's measure should record the count of rows whose Measured cell is non-empty but not exactly `yes` (a `decoratedOrBlank` tally beside `rowsMarkedYes`), or the entry/README should state that any Measured cell other than exactly `yes` voids the row count — but per lane rules the frozen counters themselves are reported, not patched. Severity: medium — it cannot inflate admitted/failing, but it can silently deflate the population under both the gate and the closure.
2. **Mutant C confirms the disclosed two-runs hole end-to-end and confirms the closure kills it.** Gate: exit 0, 16/16/0, `clean=true` — one transcript cited as both runs is accepted (disclosed in entry §8, first falsified by w1 CritC1Forgery). Closure: `distinctTranscriptPaths=1 distinctTranscriptDigests=1 ok=false`, exit 1 (`C-run2-copy-of-run1.distinct.json`). Coverage finding, consistent with the round's disclosure; no new contract change implied.
3. **All four kill paths are loud and correctly attributed:** source-row provenance (B), transcript digest binding (D), the R16 refusal (E — note the population grows to 17 and exactly the R16 row fails, so no silent behaviour), and driver blob digest binding (F). Mutant E also shows `x2-no-counterpart` is keyed on the row id, not the cell text — the fabricated `yes` cannot sneak through.

## Restoration evidence

After the final mutant: `git -C clone reset --hard b234a58920134424e0d104f137311ff54a16d26b`; `rev-parse HEAD` → `b234a58920134424e0d104f137311ff54a16d26b`; `status --porcelain` → empty; all five pristine sha256 values re-hashed identical (block above). Mutant commits (`a6f57544…`, `f4fa4196…`, `e4e8222f…`, `7551a3ec…`, `763b2e0d…`, `4d7c6bc7…`) existed only inside the scratch clone and were discarded with it.

## Hygiene

- Receipts copied first to `.ufo/waves/round-32/w2/MutC1Entry/` (baseline.json, A…F.json, A/C `.distinct.json`; all stderr files were 0 bytes).
- Browser bounds: gate-spawned chromedriver/chromium only, loopback fixture URLs only, throwaway profiles; gate `liveRecord` cleans its own profile and (per 5ad1fcbf) hands chromium a short TMPDIR. Final `pgrep -fa 'chromedriver|chromium'`: only `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` — a host monitor matching the pattern, no chromedriver/chromium process; nothing owned by this seat.
- Scratch `/fast/scratch/hyaku/tabi-r32/MutC1Entry` deleted after the receipts were copied (deletion command and its exit recorded in the session transcript; the tree above was verified empty of receipts-not-copied first).
- Network: none used by this seat (all evidence is local execution; the entry's own fetch receipts were not re-fetched).
