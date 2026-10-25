# RevNoHarmDiff — round 24 wave-2 no-harm + falsification review

Seat: `L1Tabi24.RevNoHarmDiff` (wave 2, falsify lane). Reviewed: diff `573c99e..ad125e85c235e1c4ec6a08e398bd64da01f68a08` plus a re-run of both instruments at both ends. Read-only throughout; `TMPDIR=/home/vgpnk/tmp-tabi24` set for all gate runs (host `/tmp` full). No installs performed (no tool needed beyond git/node/python3, all present).

## 1. Diff census (both assigned commands, verbatim)

- `git diff --stat 573c99e ad125e85…` → **1093 files changed, +13246 −237737**.
- `git diff --diff-filter=D --name-status 573c99e ad125e85…` → **1032 deletions**.
- Composition of the 1093: 1032 `D` + 3 `R` + 8 `M` + 50 `A`.

## 2. Deletion enumeration and classification

| Class | Count | Detail |
|---|---|---|
| (a) owed scratch cleanup | **1031** | Every deleted path sits under `.ufo/waves/round-23/scratch/` (`git diff --diff-filter=D --name-only … | grep -vc '^\.ufo/waves/round-23/scratch/'` → 1). Baseline carried 1034 scratch paths (`git ls-tree -r 573c99e \| grep -c '/scratch/'` → 1034); tip carries **0** (same command → 0). 1031 deleted + 3 renamed = 1034: exact closure, none lost unaccounted. |
| (b) tracked junk removal | **1** | `.ufo/waves/round-23/w2-record.err` — 0-byte stderr capture (`git show 573c99e:…w2-record.err \| wc -c` → 0). Still cited as a junk example in `W2CorrRegistry.md`, `W2NoHarm`, `round-23-verifier-spotcheck.md`; bytes readable at `573c99e`. |
| (c) renames (moves, content preserved) | **3** | `scratch/ExecCollisionGuard/real-long/reg-ids` → `assimilation/lane-registry-ids.txt` (R098, 101→103 lines); `real-long/staged-ids` → `assimilation/staged-ids.txt` (R100, 148→148, identical); `real-narrow/staged-ids` → `assimilation/union-ids.txt` (R059, 148→249). Verified `union-ids.txt` is the exact sorted union of `lane-registry-ids.txt` ∪ `staged-ids.txt` (`comm`/`diff` clean; intersection = {S102,S103}, matching the lesson's "intersection 2"). The +101 lines are the union's new members, not a rewrite of prior content. |

**No tracked byte outside `.ufo/waves/round-23/scratch/` + `w2-record.err` was deleted.** All 8 `M` files are pure insertions (`--numstat`: 0 deletions each): `.gitignore` +4, `LOG.md` +41, `SCORECARD.md` +86, `SKILL.md` +26, `QUALITY.md` +18, `README.md` +8, `SOURCES.md` +2, `round-23/w2/W2Simplifier.md` +1.

## 3. Modified prior-round bytes (c vs d)

- (c) append-only: all 8 `M` files. The only prior-round prose touched is `W2Simplifier.md` (+1 line, a drift note appended — itself disclosed in the SCORECARD defect-2 disposition).
- **(d) rewrite: none.** Zero `M` entries carry deletions; zero prior-round `A`-file content is mutated.

## 4. Findings

### F1 — C2's declared `after: 0` is falsified by the lane's own committed receipt (HIGH)

`corpus/evidence/round-24/c2-measurements.json` (committed) records `after: {rev: b973fde…, mismatches: 1, counted: [m3-unlanded-paths, observed: 4]}` and `c2-tip.json` records `mismatches: 1, clean: false`. `claims.json` C2 declares `after: 0`; `SCORECARD.md` §executed-disposition declares "5 → 0 mismatches | **met**". Both disagree with the lane's own committed measurement. Independent re-run confirms the receipt, not the prose:

```
TMPDIR=… node scripts/check-selfassessment.mjs --rev ad125e85c235e1c4ec6a08e398bd64da01f68a08 --json
→ mismatches: 1, counted: [m3-unlanded-paths, claimed:"landed", observed:5], clean: false, exit 1
```

The round's own calibration instrument reports one live mismatch at the reviewed tip, and the disposition prose asserts zero — a self-assessment/observed-state divergence of exactly the class the gate exists to count.

### F2 — m3 makes the counting command non-revision-deterministic (HIGH, mechanism of F1)

`scripts/check-selfassessment.mjs` `m3Findings()` (~line 262-276) runs `git status --porcelain` against the **live working tree**, not the `--rev` revision, and hardcodes `claimed: "landed"` whenever the newest `## Round N — executed disposition` header exists — it never reads the block's text. Consequences, all observable:

- `--rev <REV>` is not a function of `<REV>`: same rev yields 0 on a clean tree, 1+ on a dirty one. The wave-2 dispatch files (`gen-w2.mjs`, `w2-dispatch.{json,spec,err}`, `w2/` — 5 untracked paths, `git status --porcelain` → 5 rows, all 0–new, `w2-dispatch.err` 0 B) were enough to produce the F1 finding.
- Any unlanded file from *any* future wave or seat inflates the counter against whatever round's disposition is newest.
- `claimed:"landed"` fires even if the newest disposition never asserted landed (the predicate is a constant).
- The m3 finding that closed round-23 routed defect 2 (89 unlanded paths) is the same class that now fires on round-24's own in-flight wave-2 scaffolding — the class recurs by construction, and `.gitignore`'s `.ufo/waves/*/scratch/` does not cover `w2-dispatch.err`/`w2-spec.json`/`w2/` (all still untracked-visible).

### F3 — The control receipt named by both controls does not exist at tip (MEDIUM, disclosed)

`claims.json` C1 and C2 each state "Recorded before data in `.ufo/waves/round-24/control/control-receipt.json`". `git ls-tree -r ad125e85 | grep control` finds no round-24 control path; `ls .ufo/waves/round-24/control/` → absent on disk too. Wave-1 already flagged it (`DistillW1.md:75`: "freeze-process miss … control/ dir absent; no round-24 file committed"; `RevClaimSizing.md:45`; `ExecControlSkip.md:189` says the path was outside that seat's write scope). The receipt JSON *is* embedded at `ExecControlSkip.md:136` but the named artifact was never landed — the claim's own control-recording step is unmet at tip.

### F4 — Round-24's own committed artifacts cite never-committed, now-uncommittable scratch (MEDIUM)

20 of 77 distinct `.ufo/waves/*/scratch/` paths cited inside the tip tree are absent at the baseline (loop `git cat-file -e 573c99e:$p` → 22 missing, 20 of them `round-24/scratch/…`). Those citations are committed bytes at tip — `.ufo/waves/round-24/w1/*.md` (e.g. `ExecControlSkip.md:25-26` naming both control scripts by scratch path, `MutRegistryPredicates/mutants.json`) and both `corpus/evidence/round-24/c1-measurements.json`/`c2-measurements.json` `control.path` fields — pointing at `.ufo/waves/round-24/scratch/…` paths that exist only in the working tree (32 scratch dirs present on disk) and are now `.gitignore`d, so they can never resolve from git. Same dangling-evidence shape the M5 deletion was meant to close, re-created in the same round at its own receipts.

### F5 — S105 size figure is the base64 envelope, not the decoded length (LOW)

`SOURCES.md` S105 and the entry header say "82548 bytes decoded". The committed `corpus/evidence/round-24/sources/page.pdl` is **61911 bytes, 1795 lines, raw PDL text** (`# Copyright 2017 The Chromium Authors…`; `base64 -d` yields 0 bytes — it is not base64). `82548 = 61911 × 4/3` exactly: the labeled figure is the `?format=TEXT` encoded length. The sha256 recorded (`e944a3b1…`) matches the committed bytes, so digest and size cannot both describe the same bytes; the size unit is wrong. Line anchors verify: `page.pdl:1345 = BackForwardCacheRestore`, `:1706 = experimental event backForwardCacheNotUsed`.

### F6 — S104 located quote is not byte-exact (LOW)

The cited quote "Loading the previous page is essentially instant, …" greps **0** in the committed `bfcache.html`; the byte at line 2531 is `Loading the previous page is <em>essentially instant</em>, because the entire page can be restored from memory, without having to go to the network at all.` Every word-literal present (`grep -c` for each fragment → 1–2), line number correct, file 3428 lines. The quote is a markup-elided rendering of the byte, not the byte — the entry's located-quote discipline is satisfied in substance but the citation is not the verbatim byte the receipts elsewhere claim to pin.

## 5. Verified (re-run, not trusted)

| Claim element | Command | Observed |
|---|---|---|
| C1 before 3 | `check-gate-registry.mjs --rev 573c99e --json` | nonconformant 3 (`e1-missing-row` × {check-adjacency, check-measurement-binding, round-evidence-audit}), exit 1 |
| C1 after 0 | `… --rev ad125e85… --json` | nonconformant 0, gates 14, rows 23, clean, exit 0 |
| C2 before 5 | receipt `c2-baseline.json` (+ my `--rev 573c99e` run agrees) | mismatches 5 (4×m1 stale tallies + 1×m3 observed 4) |
| C3 0→1 | `git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge \| wc -l` | 0 at base, 1 at tip; SOURCES rows 103→105 |
| M5 scratch 1034→0 | `git ls-tree -r <REV> \| grep -c /scratch/` | 1034 at `573c99e`, 0 at tip |
| Stale-figure corrections | m1 findings at `SCORECARD.md:1192-1198` | all `claimed==observed` (26,13,12,57,76,38,45) — corrections block is accurate |
| Defect-5 "does not reproduce" | m2 evaluated `git cat-file -e a89f193:…` | claimed 128 = observed 128 |
| `.gitignore` scope | `git check-ignore -v corpus/evidence/w6-aud-b6-scratch/poll.sh .ufo/waves/round-24/scratch/x` | matches scratch only; the 49 `corpus/evidence/*-scratch` paths are NOT shadowed (still tracked) |

## 6. Residual risk / gaps

- `couldNotEvaluate` = 79 at tip (75 at the b973fde receipt): m2's closed re-run grammar (`git cat-file -e` / `git show`) fits only ~1 of ~80 scanned receipts — `git status`, `sha256sum`, `wc -l`, `sed -n`, `node …` all fall outside. The m2 class is effectively single-receipt coverage; disclosed in the field, but the "5 → 0" narrative obscures that m2 never could have fired at scale.
- The "after" receipts for C1 and C2 are named `*-tip.json` but record `rev: b973fde…`, not the reviewed tip `ad125e8` — the disposition's "measured against the tip commit" reads the penultimate commit. C1 happens to agree at the real tip (0); C2 does not (1).
- Round-23's defect-2 repair ("porcelain empty at tip") is re-broken by the same wave machinery that fixed it: 5 unlanded paths exist right now and will need a landing commit; `w2-dispatch.err` is a fresh member of the exact `*.err` junk class the round deleted.
- Frozen `claims.json` C2 `before: 4` under-counts the measured baseline (5). The disposition reports 5 honestly; the frozen number predates the m3 finding.

Verdict on the diff proper: **no harm to committed bytes** — deletions are exactly the owed cleanup + one tracked 0-byte capture, renames preserve content, every prose modification is append-only, and `.gitignore` does not shadow the tracked `corpus/evidence/*-scratch` trees. The harm is not in the diff but above it: **C2's claimed `after: 0` is contradicted by the lane's own committed receipt (1) and by re-run (1), driven by an m3 class that reads the live tree instead of the named revision.**
