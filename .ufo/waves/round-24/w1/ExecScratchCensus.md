# ExecScratchCensus — round-23 M5 scratch over-commit census (round-24 w1)

Seat: L1Tabi24.ExecScratchCensus (leaf executor, read-only reporter).
Measured revision: `573c99e4885382db38babc3a6fc90e77afeb42a6` (round-24 baseline). Today: 2026-10-25.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Report path: `.ufo/waves/round-24/w1/ExecScratchCensus.md`. All commands were read-only git (`rev-parse`, `ls-tree`, `grep`, `cat-file`), `find`, or throwaway fixture writes under `.ufo/waves/round-24/scratch/ExecScratchCensus/` (tokens.txt, cited_files.txt, bare_cited.txt, merged_cited.txt). No tracked file was edited; no git/jj write; no installs (node/git present).

---

## 1. Over-commit census at baseline

### Commands

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse 573c99e4885382db38babc3a6fc90e77afeb42a6^{commit}
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23/scratch | wc -l
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23 | wc -l
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -rl 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23/scratch | awk '{s += $4} END {print s}'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -rl 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23 | awk '{s += $4} END {print s}'
```

### Results

| Metric | Value |
|---|---|
| Committed paths under `.ufo/waves/round-23/scratch` | **1,034** |
| Committed paths under `.ufo/waves/round-23` | **1,139** |
| Committed non-scratch round-23 paths | 105 (1,139 − 1,034) |
| Raw bytes under scratch | **26,999,535** (= 25.75 MiB) |
| Raw bytes under round-23 overall | **27,965,888** |
| Non-scratch round-23 bytes | 966,353 |
| Unique blobs in scratch | **420** (of 1,034 paths) |
| Unique blobs in round-23 | 524 |

Scratch is 90.8% of round-23's committed paths and 96.5% of its raw bytes. The 1,034 count matches the round-23 wave-2 M5 finding (`W2SelfAudit.md`: `git ls-tree -r --name-only 2433ed2 -- .ufo/waves/round-23 | grep -c 'scratch/'` → 1034) and the round-24 ScoutCiteScan report (count 1,034). The 868/23.6 MB figure in `corpus/lessons/round-23.md:191` is stale (predates growth to 1,034).

### Per-subdirectory breakdown (full table, sorted by path count)

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23/scratch | sed 's#^\.ufo/waves/round-23/scratch/##' | cut -d/ -f1 | sort | uniq -c | sort -rn
```

Counts (all 44 subdirs): MutClassFalsifiers 621, ExecMirrorCensus 91, W2EvRepair 42, W2FinalArms 33, W2Cls4 20, ExecCollisionGuard 20, W2NoHarm 19, W2SelfAudit 14, W2Mistakes 14, D3GateSpot 12, W2Cls3 11, W2Cls6 10, W2Revenger2 9, W2Cls5 9, W2InMemory 8, ExecNoHarmGuard 8, W2LandedCites 7, SentinelRoundSafety 7, ScribeGate 7, W2Simplifier 6, W2Separability 6, W2Determinism 6, RevRenumber 6, W2Cls1 5, W2Cheat 5, W2QuoteB 4, ExecCliContract 4, W2QuoteA 3, L1Tabi23.D4StaleAttempts 3, CritControl 3, W2Tooling 2, W2CounterShape 2, SrcS103 2, SrcS102 2, SrcDivergence 2, ExecBlobReader 2, CritDeterminism 2, W2Secrets 1, W2Prune 1, W2Log 1, W2CorrAttempts 1, W2Cls2 1, RevMinWaveIntegrity 1, ExecAppendNormalize 1. Top 12 by count: **MutClassFalsifiers 621, ExecMirrorCensus 91, W2EvRepair 42, W2FinalArms 33, W2Cls4 20, ExecCollisionGuard 20, W2NoHarm 19, W2SelfAudit 14, W2Mistakes 14, D3GateSpot 12, W2Cls3 11, W2Cls6 10**.

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -rl 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23/scratch | awk '{split($0,t,"\t");p=t[2];sub(/^\.ufo\/waves\/round-23\/scratch\//,"",p);split(p,a,"/");s[a[1]]+=$4} END{for(k in s) print s[k], k}' | sort -rn
```

Top 12 by bytes: **MutClassFalsifiers 19,160,994; ExecMirrorCensus 1,371,903; W2EvRepair 769,350; W2Determinism 698,416; W2Mistakes 604,233; W2NoHarm 509,389; W2Separability 361,303; W2InMemory 332,315; SrcDivergence 304,785; SrcS102 278,550; W2Revenger2 274,331; ScribeGate 237,677**.

---

## 2. Nested `.git` scan

### Commands

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23 | awk '$2=="commit" {print}'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r 573c99e4885382db38babc3a6fc90e77afeb42a6 | awk '$2=="commit" {print}'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 573c99e4885382db38babc3a6fc90e77afeb42a6 -- .ufo/waves/round-23 | grep -E '(^|/)\.git(/|$)'
find /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 -name .git -printf '%y %p\n' | head -40
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-files -s | awk '$1=="160000"' | wc -l
```

### Results

- **Zero gitlinks (mode 160000) in the committed tree** — round-23 subtree and entire repo scan both empty; `git ls-files -s` 160000 count = 0.
- **Zero committed paths with a `.git` path component** — sweep empty (only `ExecBlobReader/hostile.gitconfig` — a fixture file *named* hostile.gitconfig, not a `.git` directory).
- **The working tree contains 13 embedded `.git` entries on disk** (12 directories + 1 file `CritDeterminism/proof/r4/sub/.git`), all untracked: `CritDeterminism/proof/r{1,2,3,4}/.git`, `CritDeterminism/proof/r4/sub/.git`, `ExecBlobReader/lane-clone/.git`, `W2C2Counter/repo{,,2,3,4,5}/.git`, `W2Determinism/{sibling,clone}/.git`. This matches W2Prune finding 4 (13 embedded `.git`, none became gitlinks). Risk stands: a careless `git add -A` over `scratch/` would stage these as gitlinks or error; the cleanup commit must exclude the untracked clone trees.

---

## 3. Citation census: which committed scratch paths are cited

### Method (every sweep)

1. Full-form references — `git grep -n -E 'round-23/scratch' 573c99e… -- . ':!.ufo/waves/round-23/scratch'` (all committed non-scratch blobs).
2. `scratch/`-prefixed tokens — `git grep -h -oE 'scratch/[A-Za-z0-9._+/-]+' 573c99e… -- . ':!.ufo/waves/round-23/scratch' | sort -u` → 507 unique tokens.
3. Bare relative tokens (e.g. `SrcS102/flat.txt` without the `scratch/` prefix) — one `git grep -h -oE '<subdir>/[A-Za-z0-9._+/-]+'` pass per committed scratch subdir name, excluding scratch → 74 tokens, 61 resolved.
4. All tokens resolved against the committed scratch tree (`git ls-tree -rl`); a token was counted as a citation only if it names a committed blob (exact file) or is a prefix of committed blobs (directory).
5. ScoutCiteScan cross-check: report exists at `.ufo/waves/round-24/w1/ScoutCiteScan.md` (sibling seat, same baseline). It independently confirms 1,034 scratch paths, the lesson hits below, and names `SrcS102`, `SrcS103`, `SrcDivergence`, `W2QuoteA`, `W2QuoteB` as the saved source/evidence subtrees. No contradiction with my sweep; it applies a narrower scope (lesson/LOG/SCORECARD/SKILL only), mine sweeps every committed non-scratch blob.

### Result

- **58 exact file-level citations** (paths that resolve to committed scratch blobs), total **2,136,001 bytes** (≤2.04 MiB), **53 unique blobs**.
- **26 directory-level citation roots** (a doc names `scratch/<dir>` or a descendent). After covering with the 58 exact files, **8 dir-level roots remain with no exact-cited file inside**: `ExecCliContract` (4 files, 12,425 B), `ExecCollisionGuard/real-long` (3, 1,245 B), `ExecCollisionGuard/real-narrow` (3, 1,245 B), `RevRenumber` (6, 174,639 B), `W2Cheat/faketree` (1, 72 B), `W2Cls4` (20, 54,260 B), `W2Revenger2` (9, 274,331 B), `W2Secrets` (1, 173 B). Total for these 8 roots if kept whole: 518,390 B.
- Exact-cited files by subdir (count / bytes): W2InMemory 8/332,315; W2Separability 3/339,871; SrcS102 2/278,550; SrcS103 2/207,920; SrcDivergence 1/157,809; W2QuoteA 1/146,976; W2QuoteB 1/157,809; W2Mistakes 3/99,394; W2Simplifier 2/50,753; W2Tooling 1/41,513; SentinelRoundSafety 2/74,198; W2Determinism 2/14,598; CritControl 2/15,979; RevMinWaveIntegrity 1/13,137; W2Cls6 1/14,893; W2CounterShape 1/14,911; W2EvRepair 1/15,014; W2Cheat 1/15,054; W2Cls3 2/9,518; MutClassFalsifiers 1/8,640; W2NoHarm 1/8,418; W2Cls5 2/5,376; ScribeGate 1/5,335; CritDeterminism 1/4,779; W2Cls2 1/3,719; W2Cls1 1/3,608; ExecBlobReader 2/2,686; L1Tabi23.D4StaleAttempts 2/2,333; ExecAppendNormalize 1/1,696; W2SelfAudit 1/1,196; W2Prune 1/820; D3GateSpot 1/347; ExecCollisionGuard 2/324; ExecNoHarmGuard 1/232; W2CorrAttempts 1/157.
- **Citations in permanent lane docs** (lesson/LOG/SCORECARD/SKILL): only `corpus/lessons/round-23.md:87` (`.ufo/waves/round-23/scratch/ExecCollisionGuard/`, evidence pointer), `:191`, `:206`, `corpus/lessons/round-23-verifier-spotcheck.md:97` (scratch counts only). No exact-file citation to scratch anywhere in LOG/SCORECARD/SKILL/SHONEN. The fleet report `.ufo/reports/round-23/tabi.md` (outside the lane repo, not lane-committed) mentions scratch on lines 50-51, 67, 187-194.
- The remaining citations live in the round-23 wave machinery that stays committed: w1/w2 seat reports (`w1/*.md`, `w2/*.md`), `w1/w2-dispatch.json`, `w1/w2-spec.json`, `w1/w2-record.json`, `w1/w2/swarm-registry.json`, `gen-w1.mjs`, `gen-w2.mjs` (seat-name/fixture-home references), plus `corpus/knowledge/csrf-defense-shape-boundary.md` whose S102/S103 rows are digest-anchored to the retained `SrcS102`/`SrcS103` bytes (verified by `W2Separability.md`: `git cat-file -p 03c1b4d:…/SrcS102/rfc6265bis-13.txt | sha256sum` → `06223931…d85fbf`; `SrcS103/owasp-csrf.html` → `6f32bfbf…872312`).
- 423 of 507 `scratch/`-prefixed tokens did not resolve (e.g. `scratch/tabi-r19/…`, `scratch/harness/…`, `scratch/note-rev/…`, `scratch/poll.sh`, `scratch/goal-20261025-hyaku-12h.md`, `scratch/MANIFEST.txt`, `scratch/W2C2Counter/repo5`, `scratch/W2Determinism/clone`, `scratch/ExecNoHarmGuard/empty`). These reference historical `/tmp` scratch (rounds 4–19) or **uncommitted** round-23 fixtures; none is a committed scratch path, so none creates a retention obligation.

---

## 4. Smallest retention set and target path

### Recommendation

Keep **Tier 1 — the 58 exact-cited files (2,136,001 B, 53 unique blobs)**. This resolves every file-level citation plus the lesson evidence pointer (its cited dir `ExecCollisionGuard/` still contains its two cited files `fx/registry-indented.md`, `fx/staged.md`). Delete the remaining 976 scratch paths (24,863,534 B).

The 8 dir-level-only roots have **no exact-cited byte**. Two options:
- **Option A (recommended):** delete them too (saves another 518,390 B) and amend the citing lines (they are wave-runner seat names / run descriptions — e.g. `w2/W2Cls4.md`, `w2/W2Revenger2.md`, `w1/RevRenumber.md`, `w2/W2Secrets.md`, `w1/ExecCliContract.md`, `w1/ExecCollisionGuard.md` real-long/real-narrow fixtures, `w2/W2Cheat.md` faketree).
- **Option B:** keep the 8 dirs whole as well → total retention 2,654,391 B; nothing else changes.

Also keep **in place** (already non-scratch evidence): `corpus/evidence/round-23/c1-measurements.json`, `c2-measurements.json`, `corpus/SOURCES.md`, `corpus/knowledge/csrf-defense-shape-boundary.md`.

Special care: `MutClassFalsifiers` — keep only `audit.mjs` (8,640 B); its remaining 620 paths (variants/base/pristine/repaired clones) are the 117 false attempt receipts flagged by `W2Cls4.md` and are redundant round-22 mirror bytes. `ExecMirrorCensus` — keep only the cited `raw/corpus/SOURCES.md` snapshot (86,123 B); its 90 other paths mirror live corpus files (all still present in `corpus/`).

### Target path

**`corpus/evidence/round-23/retained-scratch/`** (new directory beside the existing c1/c2 measurement receipts). Mirror the original relative layout so citation re-pointing is mechanical:

- `corpus/evidence/round-23/retained-scratch/sources/SrcS102/rfc6265bis-13.txt`, `…/flat.txt`
- `corpus/evidence/round-23/retained-scratch/sources/SrcS103/owasp-csrf.html`, `…/owasp-csrf.txt`
- `corpus/evidence/round-23/retained-scratch/sources/SrcDivergence/owasp-csrf.html` (plus `rfc6265bis-13.txt` if S102's divergence pair is kept — 146,976 B, not cited)
- `corpus/evidence/round-23/retained-scratch/fixtures/<seat>/…` for the remaining 52 files (W2InMemory mutA–G + pristine, W2Mistakes, W2Separability, CritControl, W2QuoteA, W2QuoteB, SentinelRoundSafety, etc.)
- Optionally `…/MANIFEST.txt` listing source commit `573c99e…`, per-file sha256, and the citing document:line for each.

Docs to touch in the cleanup commit (citations to deleted paths): `corpus/lessons/round-23.md` (87/191/206), `corpus/lessons/round-23-verifier-spotcheck.md:97` (count command — update to post-cleanup figure), the round-23 w1/w2 reports that name deleted fixture paths, `gen-w1.mjs`/`gen-w2.mjs` and dispatch/spec JSON if they must point at the new evidence home. Re-run `scripts/round-evidence-audit.mjs` (or its round-24 replacement) after the cutover so the lesson's proposed check — `git show --name-only --format='' <commit> | grep -c '^\.ufo/waves/round-23/scratch/'` must be 0 — holds.

### Numbers

- Scratch total: 1,034 paths / 26,999,535 B.
- Tier 1 retention: 58 paths / 2,136,001 B (7.9% of bytes).
- Deleted: 976 paths / 24,863,534 B (92.1% of bytes).
- Option B (incl. 8 dir roots): 2,654,391 B retained; 24,345,144 B deleted.

---

## 5. Risks / blockers

- The 13 working-tree `.git` dirs under scratch must stay untracked and be excluded from the cleanup commit (none is committed today).
- `W2C2Counter` and `W2Determinism/clone` fixtures are uncommitted; their citations (e.g. `scratch/W2C2Counter/repo5`) cannot be "retained" because no committed bytes exist — they are deleted implicitly and need no action.
- ScoutCiteScan (round-24 w1) agrees on all shared figures; its scope note that the fleet report is not lane-committed is adopted here (fleet-report scratch mentions impose no lane retention).
- No installs performed (node v24.21.0, git 2.56.0 from the system); no pacman transaction.
