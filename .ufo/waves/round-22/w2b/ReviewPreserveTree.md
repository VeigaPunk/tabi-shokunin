# ReviewPreserveTree — preservation-baseline vs tree @ e3cf4e0 (round-22 w2b)

Item: **ReviewPreserveTree** (frozen files/modes/blobs, gitlinks, changed-path scope).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` — **read-only**; no lane VCS mutation, no
browser, no delegation, no installs.
Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed).
Baseline under test: `.ufo/waves/round-22/preservation-baseline.json` (revision
`5f585773258b33d2d514b00cd0b0775333578db6`, 4865 frozen entries, 6 mutable docs).

**Axes.** (1) frozen bytes/modes, (2) gitlinks/symlink/type drift, (3) changed-path scope,
(4) falsifiability of the preservation claim itself (can the checks detect a rewrite?).

---

## 1. Verdict per facet (all exercised, independent of the wave's own script)

| Facet | Result | Evidence |
|---|---|---|
| Frozen blobs (4865) | **HOLDS** — 0 missing, 0 content-changed, 0 mode-changed | independent `git ls-tree -r` diff vs baseline (§3.1) |
| Removals / renames / retypes | **HOLDS** — 0 deleted, 0 renamed, 0 typechange; no gitlink anywhere | `git diff --name-status -M` base→target: `132 A`, `6 M` only |
| Gitlinks | **HOLDS** — tree contains only `blob` entries; 0 mode-160000 entries; no `.gitmodules`; no submodule config | `git ls-tree -r` type histogram = `{'blob'}` |
| Symlinks (2) | **HOLDS** — mode `120000` preserved, both targets resolve at the target revision | `corpus/evidence/round-19/.../case-symlink/cases/alias.json → ../target.json`, `.../fixture-symlink/fixtures/fixture-symlink.html → target.html` |
| Changed-path scope | **HOLDS** — 138 added paths = 132 round-22 additions (`.ufo/waves/round-22/**`, `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`) + exactly the 6 mutable docs; **0 out-of-scope** | independent classification, §3.2 |
| Mutable docs | 5/6 pure byte-prefix extensions; `corpus/SOURCES.md` is the one intentional in-place edit (S101 `used-by` cell) — sanctioned by `corpus/README.md:511-513` and structurally validated by `check-sources.mjs` (`rows=101 findings=0`) | §3.3 |
| Census consistency | `counts.mjs` base → `rows:101, knowledge:40`; target → `rows:101, knowledge:41`, tiers/statuses unchanged | §3.4 |
| Falsifiability of the preservation claim | **FAILS for one of the six mutable docs** → Finding F1 | §4.1 |

**Bottom line: the tree at `e3cf4e0` is itself clean** (nothing frozen was rewritten, nothing
out-of-scope was added, no gitlink appeared). **The defect is in the verifier**, not in the tree:
for `corpus/SOURCES.md` the wave's entire check cohort is blind to any change outside the
`S101` table row, so the round's headline "historical preservation" claim is not falsifiable
for that file.

---

## 2. Findings by severity

### F1 — HIGH — `corpus/SOURCES.md` content outside the `S101` row is verified by *no* check in the wave's cohort

* **Where.** `.ufo/waves/round-22/run-checks.py:78-81` (prefix check skips `corpus/SOURCES.md`
  outright), `:88-102` (SOURCES check is **row-only**, via the regex
  `^\|\s*S\d{3,}\s*\|` at `:89-90`); `.ufo/waves/round-22/preservation-baseline.json`
  (`mutableDocs` excludes `corpus/SOURCES.md` from the 4865 frozen entries, so the frozen-file
  check at `run-checks.py:75-76` cannot see it either); `scripts/check-sources.mjs`
  (structure only — rows/sections/cell counts); `scripts/check-round-contract.mjs:168-176`
  (`protectedPath` does not cover `corpus/SOURCES.md`) and `:25` (`APPEND_ONLY` does not list
  `corpus/SOURCES.md`).
* **Why it is a defect.** The wave's own intent is stated at `corpus/README.md:512-513`:
  *"No new source row or publisher-diversity credit is claimed; S101's mutable used-by cell
  gains this note while its immutable cells remain unchanged."* Only the `used-by` cell of one
  row may change; the rest of the registry (contract header `corpus/SOURCES.md:1-8`, the
  historical recheck notes `corpus/SOURCES.md:151-155`, the `## Leads (unopened)` section
  `corpus/SOURCES.md:158-163`) is historical text that the lane's no-harm axis claims to
  preserve — and nothing checks it.
* **Smallest counterexample (executed).** In a throwaway clone at `e3cf4e0`, commit `M9`
  rewrites one character of the *historical round-21 note* at `corpus/SOURCES.md:155`
  (`…round21 bounded source reopening` → `…round21 bounded source reopening (REWRITTEN BY
  COUNTEREXAMPLE)`; 1 insertion, 1 deletion, one line):

  | check | result at `M9` |
  |---|---|
  | wave preservation block (`run-checks.py` preservation code, executed verbatim) | `mismatches: []`, `prefixes: all true`, `scopeErrors: []`, `sourceErrors: []`, `gitlinks: []` → **clean** |
  | `node scripts/check-sources.mjs` | `SOURCES_GATE verdict=clean rows=101 … findings=0` → **exit 0** |
  | `node scripts/check-round-contract.mjs` | `ROUND_CONTRACT verdict=clean rounds=10` → **exit 0** |

  A second variant, `M1` (rewriting the contract header sentence at
  `corpus/SOURCES.md:4`) is likewise **clean under all three** checks.
  A third variant, `M8` (deleting the `## Leads (unopened)` heading at
  `corpus/SOURCES.md:158` and the historical WPT lead line at `:160`) is **clean under the wave
  preservation block and under `check-round-contract.mjs`**; only `check-sources.mjs` catches it
  (`FINDING id=missing_section detail=missing_leads_unopened_`, exit 1) — and only because that
  section is structurally required, not because history was preserved.
* **Preserving positive (no false positive).** At `e3cf4e0` itself all three checks are clean
  and correct: the only sanctioned delta is the `S101` `used-by` cell
  (`corpus/SOURCES.md:115`) plus one inserted note line (`corpus/SOURCES.md:156`) — a
  *middle insertion*, so `corpus/SOURCES.md` is **not** a byte-prefix extension of the baseline
  (prefix check would fail if it were applied — which is why it is skipped at
  `run-checks.py:79`). A fix must therefore allow insertions anywhere, not only at EOF.
* **Smallest fix.** Replace the row-only SOURCES check (`run-checks.py:88-102`) with a
  **line-level** diff of `BASE:corpus/SOURCES.md` vs the revision's file: every opcode must be
  `equal`, `insert`, or a single-line `replace` whose two lines are the `S101` row (the
  existing `used-by`-cell test then still applies). 8 lines added to `run-checks.py`:

  ```python
  import difflib
  before_lines = subprocess.check_output(['git','-C',str(lane),'show',BASE+':corpus/SOURCES.md'], env=ENV).decode().splitlines()
  after_lines  = (lane / 'corpus/SOURCES.md').read_text().splitlines()
  for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, before_lines, after_lines, autojunk=False).get_opcodes():
      if tag in ('equal', 'insert'):
          continue
      if (tag == 'replace' and (i2-i1) == 1 and (j2-j1) == 1
              and before_lines[i1].lstrip().startswith('| S101')
              and after_lines[j1].lstrip().startswith('| S101')):
          continue
      source_errors.append('sources_line_change:%s:%d' % (tag, i1+1))
  ```
  Verified in the throwaway clone: **clean at `e3cf4e0`** (no false positive),
  `sources_line_change:replace:4` at `M1`, `sources_line_change:replace:155` at `M9`,
  `sources_line_change:delete:157` + `:delete:159` at `M8`.
* **Out of scope / not this item's call.** Whether `corpus/SOURCES.md` should be *frozen whole*
  (rather than "one mutable cell") is a policy decision for L1; this finding only shows that
  the *currently intended* invariant ("immutable cells unchanged", `corpus/README.md:512-513`)
  is not enforced anywhere.

### F2 — MEDIUM — three new normative criteria cite a lesson file that does not exist at the reviewed revision

* **Where.** `corpus/QUALITY.md:275`, `:282`, `:289` — new items 56, 57 and 58 each cite
  `(lesson: corpus/lessons/round-22.md#mistakes; …)`. `corpus/lessons/round-22.md` **does not
  exist** at `e3cf4e0` (not in the tree, not in the lane working tree).
  The wave's own scope rule already anticipates that path:
  `.ufo/waves/round-22/run-checks.py:84` lists `'corpus/lessons/round-22.md'` in `allowed_new`.
* **Why it matters.** The convention holds everywhere else: pre-existing items cite existing
  lesson files (`corpus/QUALITY.md:199,207,213,218,223,228` → `round-19.md`; `:234,240` →
  `round-20.md`; `:248,254,261,267` → `round-21.md`; all three exist at the target). The three
  new items are the corpus admission contract for this wave, and their only lesson pointer
  resolves to nothing, so a reader cannot audit the mistakes those criteria encode. No gate in
  the cohort resolves citation targets, so the dangling pointer passes silently.
* **Smallest counterexample.** `git cat-file -e e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:corpus/lessons/round-22.md`
  → `fatal: path 'corpus/lessons/round-22.md' does not exist` (exit 1), while
  `corpus/QUALITY.md:275` asserts it as the lesson for item 56.
* **Preserving positive.** `corpus/QUALITY.md:275`'s sibling citations
  (`.ufo/waves/round-22/round21-closure.json`, cited at `:283-284` and `:290-291`) **do** exist
  at the target — so the defect is confined to the lesson pointer, not the whole citation block.
* **Smallest fix.** Add `corpus/lessons/round-22.md` with a `#mistakes` section before the
  wave lands (it is already an allowed new path, so no scope change is needed), or re-point
  items 56–58 at an existing artifact. If the file is intentionally deferred to a later
  (post-w2b) commit, say so in the item text instead of citing a non-existent path.
* **Ownership note.** This is a corpus-docs defect; it may belong to the docs reviewer. It is
  reported here because it is a **tree-level** fact about the reviewed revision (a cited path
  absent from that revision), not a prose opinion.

### F3 — LOW — the preservation baseline is self-certified; its out-of-band pin is not consumed by any check

* **Where.** `run-checks.py:68` reads `preservation-baseline.json` **from the revision under
  test**; the file is itself a round-22 addition, so it is not in its own 4865 frozen entries.
  The only out-of-band record is
  `.ufo/waves/round-22/review-snapshot.json` (pins `preservation-baseline.json`
  sha256 `c64d32e1dc2cdc1ab0c0a79a6d79513b107091fef31e3a6df06aa11ef7cc2e85`, 811507 bytes) —
  and I verified that pin **still matches at `e3cf4e0`** — but no check in the cohort reads
  `review-snapshot.json`; it is human-readable evidence only.
* **Risk.** A future wave that edits the baseline to drop entries would make the frozen-file
  check vacuous while every gate still reports `clean`.
* **Smallest fix.** Assert the pinned digests inside `run-checks.py` (e.g. compare
  `sha256(preservation-baseline.json)` against the `review-snapshot.json` value and fail on
  mismatch) so the baseline cannot be weakened silently.

---

## 3. What I ran (commands, exit codes)

All lane reads were `git -C … show/ls-tree/diff/status` (read-only); the lane working tree was
**not** modified (`git status --porcelain` shows only untracked round-22 in-flight artifacts:
`checks-at-e3cf4e0.json`, `w2b-*.json`, `w2b/`). All execution happened in a private
throwaway clone, since deleted.

### 3.1 Independent frozen-file verification (pure `git ls-tree`, not the wave's script)
```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r -z --full-tree e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
```
compared entry-by-entry with `preservation-baseline.json` (`files[4865]`, keys `path/gitBlob/mode`):

* missing = **0**, mode changed = **0**, content changed = **0**
* baseline ⊂ tree@`5f58577` exactly: `tree@5f58577` (4871 entries) − baseline (4865) = the 6
  mutable docs, nothing else; baseline ⊄ tree@`5f58577` = 0; blob/mode mismatches vs
  `5f58577` = 0 → **the baseline is complete and faithful for its stated scope**
* baseline mode histogram: `{100644: 4783, 100755: 80, 120000: 2}`; target tree contains no
  non-blob entry, no `160000`.

### 3.2 Changed-path scope (independent classification)
```
git diff --name-status -M 5f58577… e3cf4e0d…   → 132 A, 6 M, 0 D, 0 R, 0 T
```
138 added paths classified: **132** round-22 additions (all under `.ufo/waves/round-22/`
(130), `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`)
+ **6** mutable docs; **0 out-of-scope**. The 6 modified paths are exactly the mutable docs.
Exec bits on the four new executables are `100755`
(`check-review-chronology.mjs`, `measure-c1.mjs`, `run-checks.py`, `selftest-c1.mjs`).
The `w2-cap-refusal-10` numbering gap is **documented, not a defect**:
`.ufo/waves/round-22/w2-cap-refusal-11.json:16` — *"attempt 10 by dead TabiR22 is unrecorded:
slot granted 16:10:37Z, kernel died 16:10:51Z before any result; no seat transcripts exist, so
0 seats spent."*

### 3.3 Mutable docs
`git diff --numstat 5f58577… e3cf4e0d…` → `LOG.md 83/0`, `SCORECARD.md 28/0`, `SKILL.md 35/0`,
`corpus/QUALITY.md 22/0`, `corpus/README.md 21/0`, `corpus/SOURCES.md 2/1`.
Byte-prefix test (`b[:len(a)] == a`): LOG/SCORECARD/SKILL/QUALITY/README **pure append**;
`corpus/SOURCES.md` **not** a prefix extension — its single changed line is the `S101` row
(`corpus/SOURCES.md:115`, `used-by` cell) and its single added line is the round-22 note
(`corpus/SOURCES.md:156`, inserted *before* `## Leads (unopened)`, not at EOF).

### 3.4 Census and the wave's own receipts
```
node .ufo/waves/round-20/counts.mjs 5f58577…  → {"rows":101,…,"knowledge":40}   exit 0
node .ufo/waves/round-20/counts.mjs e3cf4e0d…  → {"rows":101,…,"knowledge":41}   exit 0
```
Both match the expectations hard-coded in `run-checks.py:137-140`.
`.ufo/waves/round-22/checks-at-e3cf4e0.json` (35/35, verdict `clean`) was re-read: its
`preservation` block matches my independent result exactly
(`mismatches: []`, `prefixes` all true, `scopeErrors: []`, `sourceErrors: []`, `gitlinks: []`).
`check-sources-production` (`rows=101 findings=0`) and `check-round-contract-production`
(`ROUND_CONTRACT verdict=clean`) both passed in that cohort.
Snapshot pin drift: only the three files the post-crash repair changed differ from
`review-snapshot.json` (which pins `0f24164`): `measure-c1.mjs`, `selftest-c1.mjs`,
`fixtures/expected.json` — exactly the `filesBefore`/`filesAfter` digests recorded in
`.ufo/waves/round-22/post-crash-repair.json`. The other 41 of the snapshot's 44 pinned digests
still match at `e3cf4e0`.

### 3.5 Counterexample battery (throwaway clone, `run-checks.py` preservation block executed verbatim)
| id | mutation | wave preservation | `check-sources` | `check-round-contract` |
|---|---|---|---|---|
| E0 | none (`e3cf4e0` itself) | **clean** (expected) | clean | clean |
| M1 | rewrite `corpus/SOURCES.md:4` contract-header prose | **clean** ← hole | clean | clean |
| M2 | edit `LOG.md` interior (line 6) | **detected** (`prefixes.LOG.md=false`) | – | – |
| M3 | change `S101` tier cell (A→B) | **detected** (`sourceErrors=['S101:immutable_cells']`) | – | – |
| M4 | delete frozen `corpus/lessons/round-21.md` | **detected** (`mismatches`+`scopeErrors D`) | – | – |
| M5 | add `corpus/lessons/round-23.md` (out of scope) | **detected** (`scopeErrors`) | – | – |
| M6 | mode change frozen file (`100644`→`100755`) | **detected** (`mismatches`) | – | – |
| M7 | add a gitlink (`vendor/sub.git`, mode 160000) | **detected** (`gitlinks`+`scopeErrors`) | – | – |
| M8 | delete `## Leads (unopened)` + one historical lead line | **clean** ← hole | **detected** (`missing_section`) | clean |
| M9 | rewrite historical round-21 note line (`corpus/SOURCES.md:155`) | **clean** ← hole | clean | clean |

The M2–M7 controls prove the verifier is **not vacuous**; the M1/M8/M9 rows localize the blind
spot precisely to `corpus/SOURCES.md` non-row content.

---

## 4. Residual risk and verification gaps

1. **Unverified by me (out of my item, but load-bearing for the wave):** the semantic
   correctness of `measure-c1.mjs` / `selftest-c1.mjs` (other items), the honesty of
   `post-crash-repair.json` (author-side fit), and the W2B wave's own artifacts — all
   untracked in the lane at review time (`checks-at-e3cf4e0.json`, `w2b-*.json`, `w2b/`), so
   the reviewed revision does not carry its own verification receipt.
2. **`corpus/lessons/round-22.md` may be added by a later post-w2b commit.** If so, F2
   dissolves; I could not observe that (the lane HEAD is `e3cf4e0`; no later commit exists in
   the lane at review time). F2 is stated against the reviewed revision only.
3. **The wave's cohort is one-shot and revision-pinned** (`run-checks.py` takes the revision as
   argv): a passing receipt at `e3cf4e0` does not certify any later commit. The parent L1 must
   re-run it after F1's fix lands.
4. **Not run (deliberately, out of bounds):** the full `run-checks.py` end-to-end (it clones the
   whole fleet and re-runs 20+ historical gates, and its fleet path cannot be reproduced from a
   throwaway clone); `check-user-round-contract-production` (known-red, deliberately skipped by
   the wave and unchanged by it); no browser, no `adb`, no REA, no installs.

## 5. Deviations and tooling

* **Tooling:** no package was installed or upgraded (nothing was needed); therefore no
  install record. Node used: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`
  (pre-existing).
* **Throwaway clone path deviation:** the prescribed `/tmp/tabi-r22-w2b-ReviewPreserveTree`
  could not be used — `/tmp` is on a 128 GiB partition at **100 % (336 KiB free)**, filled by
  other agents' throwaway clones (`git clone` there failed: `No space left on device`). I did
  **not** delete any other agent's directory. I used
  `/home/vgpnk/.cache/tabi-r22-w2b-ReviewPreserveTree` instead (same throwaway discipline: a
  private `git clone` of the lane, detached at `e3cf4e0`, all mutations confined to it) and
  **deleted it** after the counterexample battery (`rm -rf`, verified gone).
* **No lane mutation:** only `git show/ls-tree/diff/status/log` in the lane; the sole file I
  wrote is this report.

---

**Recommendation.** The tree at `e3cf4e0` is preservation-clean on every facet I was asked to
check; adopt it. Do **not** record the round's preservation claim as falsifiable until **F1** is
fixed (8-line line-level SOURCES diff in `run-checks.py`) and re-run at the landing revision;
**F2** should be closed by adding `corpus/lessons/round-22.md` (already an allowed new path) or
re-pointing the three citations. **F3** is a cheap hardening, not a blocker.

Report: tabi-shokunin/.ufo/waves/round-22/w2b/ReviewPreserveTree.md
