VERDICT: PASS

# CriticSeparability — causal separability of C1/C2/C3 at REV

Seat: TabiR18.CriticSeparability-2. Measured candidate REV = `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
(round-18 tip; baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`). All probes ran in a private
sandbox `/tmp/tabi-r18-csep` (`git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin
/tmp/tabi-r18-csep`). No writes in LANE except this report and the companion evidence file.
Lane `git status` before/after: only `?? .ufo/waves/round-18/w2/` (my own output, untracked).

## Method

Five removal commits were built on top of REV in the sandbox (each a single-claim-input deletion;
surgical row/section cuts made with the editor, file deletions with `git rm`):

| Commit | Removed |
|---|---|
| `17d62e32d89f4e06f6af1b989fc111af6026fc24` (revA) | `corpus/evidence/round-18/source-recheck/**` — all 51 C1 `.json` + `.excerpt.txt` receipts |
| `03558f7ddbaecc54585828c0a20c960fb6343d73` (revB) | `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs` — both C2 artifacts |
| `83dab59c9b51f32e453a31d9865c1ca875bbd287` (revC3b) | `corpus/evidence/round-18/routed/**` — harm receipt, adjacency selftest, `harm-runner.mjs`, `harness-reruns/` (d2/d3/d5 inputs) |
| `6be1df0b271277c4c8dd7df15c54ab623b36ed29` (revS058only) | S058 table row only, in `corpus/SOURCES.md` (d4 input; dossier blob retained) |
| `ada876b57b92880b2ad28bd78377eae4bfe1e384` (revC3a) | revC3b + S058 row + `.ufo/waves/round-18/sources/S058Listing.md` + lesson `## Corrections` (all d1–d5 inputs) |

The counter copies inside the sandbox were used so each counter resolved the sandbox repo
(`measure-c1` `resolveLane`, `measure-c3` `ROOT`, `measure-c2` `resolveLaneRoot` all anchor to the
script's own toplevel). Counter digests: c1 `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`,
c2 `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6`,
c3 `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`.

## Exact commands and results

`cd /tmp/tabi-r18-csep && node .ufo/waves/round-18/measure-c{1,2,3}.mjs <commit>`; every invocation
exited 0 (counter emit on stdout, exit recorded). Full per-run JSON in `/tmp/tabi-r18-csep-out/`
(sandbox-side, not retained; committed summary in `CriticSeparability.matrix.json`).

| Revision | removed | c1_rows_rechecked | c2_hazards_closed | c3_routed_closed |
|---|---|---|---|---|
| `530f40a9` REV (control) | — | **51** | **6** | **5** |
| `17d62e32` revA | C1 receipts | **0** | **6** | **5** |
| `03558f7d` revB | C2 scripts | **51** | **0** | **5** |
| `83dab59c` revC3b | routed/** | **51** | n/r | **2** (d2,d3,d5 fail) |
| `6be1df0b` revS058only | S058 row | **51** (eligible_rows drops 58→57) | n/r | **4** (d4 `S058_missing`) |
| `ada876b5` revC3a | all C3 inputs | **51** (eligible_rows 57) | **6** | **0** |

revB detail: artifact selection fell back to `scripts/webmcp-invoke-round17.mjs`; all six hazards
failed — f6 why = "scripts/freshness-witness.mjs absent or not a regular file at the revision";
h1–h4/s1 failed because the `invoke-download-refused` retained-coverage precondition fails on the
round-17 artifact (h3 also observed `--remote-debugging-port` + `DevToolsActivePort`, s1 saw a
duplicate `--enable-features=` launch — the baseline-hazard symptoms, consistent with B being red).
c2 wall times: REV 33.4 s; revA/revB/revC3a chained 100.1 s total; all exits 0.

## Findings

1. **Causality is proven in both directions for every claim.** Removing claim X's inputs drops only
   counter X: revA → c1 51→0 while c2=6, c3=5; revB → c2 6→0 while c1=51, c3=5; revC3a → c3 5→0 while
   c1=51, c2=6. No counter depends on a sibling claim's inputs. No counterexample found.

2. **S057 count-vs-active-source distinction holds (assigned check).** At revS058only (the C3 row
   superseding S057 deleted, S057 receipt untouched), `c1_rows_rechecked` stays 51 — the S057 receipt
   carries `teachesVerdict:"held"`, so `measure-c1.mjs:338`'s drift→superseding-row rule never fires.
   Removing C3's S058 cannot strand a C1 receipt. C1's count counts *receipts over the fixed
   baseline-eligible set*, which is separable from C3's active-source claim about the listing.
   Corollary structural fact: all 51 receipts are `held`; zero `drift` receipts exist at REV, so C1
   has no dependence on *any* superseding row (S058 included).

3. **C3's own granular separability is clean**: revC3b (routed/ only) → d2 `harm_receipt_missing`,
   d3 `adjacency_receipt_missing`, d5 `rerun_index_missing`, d1/d4 still pass; revS058only → only
   d4 `S058_missing`. Each defect's inputs are independently countable.

4. **Counter input surfaces do not overlap** (verified by reading all three counters): c1 reads
   `corpus/SOURCES.md` + `source-recheck/**` + `recheck-fetch.mjs` + a pinned S029 blob at `837b33a…`;
   c3 reads `lesson` + `SOURCES.md` S058 row + `S058Listing.md` + `routed/**` + reference blobs at
   `93bfead`/B; c2 reads `scripts/webmcp-invoke-round*.mjs` + `freshness-witness.mjs` and only diffs
   `corpus/evidence/**/webmcp-invoke/receipt.json` stamps (path pattern disjoint from both
   `source-recheck/` and `routed/`). The shared file `corpus/SOURCES.md` is read for disjoint cells
   (c1: rowUrl containment of receipted rows; c3: the S058 row's teaches/anchor cells), and the
   measured removals showed neither direction leaks.

## Fixable defects vs judge-level notes

- **No fixable separability defect found.** The strongest counterexample available — removing the
  C3 S058 row while S057's C1 receipt remains — does not decrement c1, because C1 measures receipts
  over a baseline-fixed eligibility set, not the active row graph. If the canonical judge instead
  required "receipted row still a live, non-superseded source at REV," S057's receipt would be
  disputable as an *active-source* claim — but that is the deliberately rejected framing (the
  assignment fixes baseline C1 S057 eligibility and distinguishes count from active-source claim).
- Minor observation (not a defect): `eligible_rows` in the c1 record is recomputed at the measured
  revision (58→57 when S058 is removed) while `c1_rows_rechecked` is stable; the report field is
  descriptive metadata, not the counter.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/CriticSeparability.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/CriticSeparability.matrix.json` (attack artifact: full removal-commit IDs, matrix, digests)

Finite limits: c2 `--live` not run (C1 live re-fetch is orthogonal to separability and hits public
sources); c2 not run on revC3b/revS058only (both are strict subsets of revC3a's already-green removal
set for c2's input surface — revC3a removes everything revC3b removes plus more, and c2 stayed 6/6);
sandbox `/tmp/tabi-r18-csep` retained for reproducibility of the removal commits cited above.

Report: .ufo/waves/round-18/w2/CriticSeparability.md
