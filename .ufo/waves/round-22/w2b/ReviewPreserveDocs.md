# ReviewPreserveDocs — round22/attempt1 (w2b), revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`

**Item:** append-only discipline of the six mutable docs between base `5f585773258b33d2d514b00cd0b0775333578db6`
and head `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` — byte-prefix preservation and any in-place rewrite.
**Mode:** read-only review. All execution happened in the private throwaway clone
`/tmp/tabi-r22-w2b-ReviewPreserveDocs` (clone of the lane, checked out at `e3cf4e0`). The lane tree, its
Git index, its jj state and every sibling lane were read only; the only file written in the lane is this report.

## Verdict

| # | Severity | Subject |
|---|---|---|
| F1 | medium | `corpus/SOURCES.md` S101 `used-by` cell rewritten in place **without** the contract-required `old→new` log (the round lesson does not exist) |
| F2 | medium | `corpus/QUALITY.md:275,282,289` cite `corpus/lessons/round-22.md#mistakes` — dangling target file/anchor at this revision |
| F3 | informational | five of six docs preserve their base bytes exactly; `corpus/SOURCES.md` is *not* an append-only file by contract (scope fact, no defect) |
| F4 | informational | `SCORECARD.md:1043` round heading form drifts from the file's established form; no parser depends on it |

No high finding. No in-place rewrite of history was found in the five contract-append-only docs.

---

## F1 (medium) — `corpus/SOURCES.md` S101 `used-by` rewritten in place, mandatory `old→new` log absent

**Where:** revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`, `corpus/SOURCES.md:115` (row `S101`; the changed
cell is the row's last cell, `used-by`). The change was committed in `0f24164be77e72ba359fe4befdc42d96bc343034`
(the only commit in this range that touches the six docs; `e3cf4e0` touches none of them).

**Evidence of the in-place rewrite (byte level).** First divergence between base and head blobs of
`corpus/SOURCES.md` is at byte offset **65466** of 83799 base bytes; base length 83799, head length 84565:

```
base_ctx:  ... webmcp-nonautosubmit-round-21-corrected.md |
head_ctx:  ... webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md |
```

So the row's `used-by` cell gained `, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`; the byte prefix
is broken at that cell (this is the only prefix break among the six docs).

**Contract.** SOURCES contract v1 (fleet ledger, frozen 2026-10-19;
`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:49`):

> 2. **Append-only.** Only `status`, `recheck` and `used-by` change in place, and each change is logged
> old→new in the round lesson.

The `used-by` cell is mutable, so the *cell change* is permitted; the *log* is mandatory and is missing:
`git cat-file -e e3cf4e0:corpus/lessons/round-22.md` → exit 128 (absent);
`git ls-tree e3cf4e0 corpus/lessons/` → 46 entries, none `round-22.md`. Searching the whole head tree for the
log line finds it only in older lessons (`corpus/lessons/round-13.md`, `round-16.md`, `round-18.md`,
`round-20.md`, `round-21.md`, `kaika-fleet-round-1.md`) — never for the round-22 S101 transition.
Precedent form is `corpus/lessons/round-21.md:87` ("Mutable cells, old→new:" followed by the S100/S101
`used-by` transitions).

**Smallest counterexample.** `git show 5f58577:corpus/SOURCES.md` and `git show e3cf4e0:corpus/SOURCES.md`
differ at the S101 `used-by` cell, and no file in `e3cf4e0` records that `old→new` transition, while the
contract requires it in the round lesson. The lane's own scout already flagged the gap as pending and
unresolved at this revision: `.ufo/waves/round-22/w1/CensusFrontier.md:86` ("**each change is logged old→new in
the round lesson**. No `corpus/lessons/round-22.md` exists at read time, so this log line is pending.") and
`:194-195` ("The SOURCES search-log append and the round-22 lesson's used-by old→new log are pending").

**Preserving positive.** The change is minimal and content-preserving: every other cell of the S101 row is
byte-identical (no immutable cell touched, no new row, no supersession row), which is exactly the invariant the
lane's own preservation harness asserts (`.ufo/waves/round-22/run-checks.py:96-104`: for S101 the immutable cells
must be equal and `used-by` must equal base + `, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`).
The structure gate is clean (`SOURCES_GATE verdict=clean rows=101 … findings=0`), the census prints `malformed=0`
and no duplicate ids, and the contract's used-by path census prints no `missing:` line — the added path exists at
head (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, blob `de9d9cda7c9ded3407cf9ea0c6503e01af4d66dc`).
The defect is therefore **only the missing audit line**, not a content regression.

**Smallest fix.** Create `corpus/lessons/round-22.md` whose `## Gate` section carries one line in the established
form:

```
Mutable cells, old→new:
- S101 used-by: `corpus/knowledge/webmcp-nonautosubmit-round-21.md,
  corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` → those two plus
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.
```

If the round-22 lesson will not be produced in this wave, the alternative smallest fix is to restore that one
cell to the base bytes (the round-22 note is not referenced by any other row, so reverting loses no cross-reference)
rather than shipping an unlogged in-place change. Do not create the lesson *after* other lessons freeze it: see F2.

---

## F2 (medium) — `corpus/QUALITY.md` cites a lesson file and anchor that do not exist at this revision

**Where:** revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`, `corpus/QUALITY.md:275`, `:282`, `:289` — the three
new criteria (56, 57, 58) each end with `(lesson: corpus/lessons/round-22.md#mistakes; …)`.

**Evidence.** `git grep -c "round-22.md#mistakes" e3cf4e0 -- corpus/QUALITY.md` → 3 hits;
`git cat-file -e e3cf4e0:corpus/lessons/round-22.md` → exit 128 (absent). There is no `## Mistakes` section
anywhere in the head tree, so the `#mistakes` anchor is unresolvable as well as the file.

**Why this is a preservation defect, not a typo.** `corpus/QUALITY.md` is append-only
(`scripts/check-round-contract.mjs:25` `APPEND_ONLY = ['LOG.md','SCORECARD.md','SKILL.md','PROVINCE.md','corpus/QUALITY.md','corpus/README.md']`;
prefix enforcement at `scripts/check-round-contract.mjs:316-320`), so the three citation lines can never be
corrected in place — a later fix must be a *further append*. Meanwhile a `corpus/lessons/round-*.md` file becomes
byte-protected for subsequent rounds once it exists (`protectedPath()` at `scripts/check-round-contract.mjs:168-171`
matches `corpus/lessons/round-\d+\.md`; the hard census `corpus/evidence/pstack-20261015/baseline-census.tsv`
pins lessons 1–10 only, so round-22 freezes from the *next* wave's baseline, not now). The repair window is
therefore narrow and one-directional: the lesson's **first** version must carry a `## Mistakes` section whose
anchor is exactly `mistakes`, and a `## Gate` section (F1) — or the criteria citations are permanently dangling.

**Smallest counterexample.** Open `corpus/QUALITY.md` at `e3cf4e0` line 275: it points at
`corpus/lessons/round-22.md#mistakes`; that path does not exist in the tree, and no other file in the tree
carries a `mistakes` anchor for round 22.

**Preserving positive.** Every *other* path reference added in this range resolves at head. A scripted sweep of
the appended regions of all six docs (backticked repo-relative paths) found: `LOG.md` 5 refs → all resolve;
`SKILL.md` 5 refs → all resolve; `corpus/README.md` 1 ref (`knowledge/webmcp-lifecycle-oracle-round-22.md`,
corpus-relative) → resolves; `corpus/SOURCES.md` 1 ref → resolves; `SCORECARD.md` 1 ref
(`.ufo/waves/round-22/w1/{CriticClaim,CriticScope,ConnPlanner}.md`) → all three files exist at head. Historical
corpus bytes are untouched: `git diff --name-only 5f58577 e3cf4e0 -- corpus/lessons/ corpus/evidence/round-21/
corpus/knowledge/` lists only the new `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.

**Smallest fix.** Same single file as F1: create `corpus/lessons/round-22.md` with `## Gate` (F1's `old→new` line)
and `## Mistakes` (anchor `mistakes`). If that is deliberately deferred, the only append-only remedy is a dated
appended qualification in `corpus/QUALITY.md` naming the anchor that will actually exist, and a corresponding
correction note in the round-22 wave; editing lines 275/282/289 is not available.

---

## F3 (informational, no defect) — prefix preservation measured; `corpus/SOURCES.md` is outside the append-only contract

* **Five append-only docs preserve base bytes exactly.** Per-file byte comparison (base blob vs head blob, first
  `len(base)` bytes) → `PREFIX_OK` for `SCORECARD.md` (83649→85364), `LOG.md` (115666→120989), `SKILL.md`
  (217205→220633), `corpus/QUALITY.md` (23086→24736), `corpus/README.md` (49952→51452). Every addition lands at
  end-of-file (hunk headers `@@ -1041 +1041,29`, `@@ -1494 +1494,84`, `@@ -2406 +2406,36`, `@@ -268 +268,23`,
  `@@ -499 +499,22`); all six files still end with `0x0a`.
* **`corpus/SOURCES.md` is not an append-only file by contract.** `scripts/check-round-contract.mjs:25` lists
  `LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/QUALITY.md, corpus/README.md` — `corpus/SOURCES.md` is absent,
  and the lane's own preservation harness excludes it from the prefix check on purpose
  (`.ufo/waves/round-22/run-checks.py:79` `if path != 'corpus/SOURCES.md':`) in favour of the S101 cell invariant
  (`:96-104`). F1 is therefore a rule-2 *logging* defect, not an append-only-prefix defect. `PROVINCE.md` was not
  touched in this range (`git diff --name-only 5f58577 e3cf4e0 -- PROVINCE.md` → empty).
* **Canonical gates at head (run in the clone):**
  * `node scripts/check-round-contract.mjs --repo /tmp/tabi-r22-w2b-ReviewPreserveDocs --baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c --expect 10`
    → **exit 0**, `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` (this is the prefix enforcer for the
    five append-only docs, `scripts/check-round-contract.mjs:316-320`).
  * `node scripts/check-freshness.mjs --repo /tmp/tabi-r22-w2b-ReviewPreserveDocs --witness e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`
    → **exit 0**, `FRESHNESS_GATE verdict=clean … matched=34 unique=34 lane=31 public=3`, including
    `PIN_MATCH target=SKILL.md` — the SKILL.md baseline bytes are preserved as a prefix *and* a dated append
    exists (`scripts/check-freshness.mjs:96-101`).
  * `node scripts/check-sources.mjs` → **exit 0**, `SOURCES_GATE verdict=clean rows=101 tiers=A:88,B:4,C:9
    status=queued:19,mined:73,rejected:9 findings=0 file=corpus/SOURCES.md`.
* **No counterexample exists** for these five docs: the only difference between base and head bytes is the
  appended tail. **Fix:** none.

---

## F4 (informational) — `SCORECARD.md:1043` heading form differs from the file's own convention

`SCORECARD.md:1043` is `## Round22 — declared finite lifecycle semantic-oracle claim`, while every earlier round
block uses `## Round N — … (YYYY-MM-DD)` (`SCORECARD.md:661, :732, :776, :819, :864, :924, :973`, e.g.
`## Round 21 — declared finite lifecycle observation claim (2026-10-21)`). No script parses these headings
(`git grep -n "## Round" e3cf4e0 -- scripts/` → no hits; the contract gate parses only
`<!-- pstack-round:ID -->` blocks, `scripts/check-round-contract.mjs:360-361`), so no measurement or gate is
affected, and the base bytes are untouched (not a rewrite). **Smallest fix:** none required — a rewrite of
`:1043` would itself break append-only; if a later append introduces another round block, use the established form.

---

## Preserving positives explicitly verified

* The round-22 axis correction in `SCORECARD.md:1041-1069` keeps the superseded depth declaration in place and
  adds a `### Round22 pre-measurement axis correction` section beneath it — the earlier declaration was not edited.
* Historical lesson, closure and knowledge bytes for round 21 and earlier are unchanged: `git diff --name-only
  5f58577 e3cf4e0 -- corpus/lessons/ corpus/evidence/round-21/ corpus/knowledge/` lists only the newly added
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.
* The round-22 note qualifies the round-21 notes from a *new* file rather than editing them; the round-21 note
  and its correction are byte-identical to base.
* `corpus/SOURCES.md` gained no row, no status change, no recheck change; the only registry change in the range
  is S101's `used-by` cell.

## Commands exercised (all inside `/tmp/tabi-r22-w2b-ReviewPreserveDocs`; node v24.21.0 from fnm, git + python3 from the base system)

| Command | Exit | Result used |
|---|---|---|
| `git clone <lane> /tmp/tabi-r22-w2b-ReviewPreserveDocs` + `git checkout e3cf4e0…` | 0 | private clone at the reviewed revision |
| `git diff --stat 5f58577 e3cf4e0…` / `--numstat` per doc | 0 | six docs changed, all by `0f24164`; only `corpus/SOURCES.md` has a deletion |
| per-file `head -c <baseLen> \| cmp -` against the base blob | 0 | `PREFIX_OK` ×5, `PREFIX_BROKEN` for `corpus/SOURCES.md` |
| python first-difference scan of the two `corpus/SOURCES.md` blobs | 0 | first divergence at offset 65466/83799 |
| `git ls-tree e3cf4e0 corpus/lessons/` · `git cat-file -e e3cf4e0:corpus/lessons/round-22.md` | 0 / 128 | round-22 lesson absent |
| `git grep -c "round-22.md#mistakes" e3cf4e0 -- corpus/QUALITY.md` | 0 | 3 dangling citations |
| `git grep -l "old→new" e3cf4e0 -- corpus/` | 0 | no round-22 `used-by` log |
| `node scripts/check-round-contract.mjs --repo <clone> --baseline 7f506aff… --expect 10` | **0** | `ROUND_CONTRACT verdict=clean rounds=10` (append-only prefix enforced) |
| `node scripts/check-freshness.mjs --repo <clone> --witness e3cf4e0…` | **0** | `FRESHNESS_GATE verdict=clean matched=34`, SKILL.md prefix + dated append |
| `node scripts/check-sources.mjs` | **0** | `SOURCES_GATE verdict=clean rows=101 findings=0` |
| census `awk` malformed/duplicate-id and used-by-path checks on `corpus/SOURCES.md` | 0 | `malformed=0`, no duplicate ids, no `missing:` path |
| path-resolution sweep over the appended regions of all six docs (python) | 0 | only the F2 lesson citations and two extraction false positives (brace expansion / corpus-relative path), both manually confirmed to resolve |

## Unrun checks / residual risk / verification gaps

* **`.ufo/waves/round-22/run-checks.py` was not run.** It clones the fleet plus every sibling lane into `/tmp` and
  is the L1 harness rather than a doc gate; its preservation cohort at head therefore remains unexercised. My
  conclusions about S101 come from direct blob comparison and the contract text, and the S101 cell invariant the
  harness asserts (`.ufo/waves/round-22/run-checks.py:96-104`) was re-implemented by hand rather than executed.
* **`scripts/check-adjacency.mjs` was run and exits 1** with `sibling_unresolved` / `ruling_unresolved` on every
  row: the harness needs `/tmp/<sibling>-shokunin` checkouts and the fleet root, which a single-lane clone does not
  provide. This is an environment failure, not a document defect; adjacency was **not** evaluated.
* `scripts/check-freshness.mjs` without a mode exits 2 (`usage: Choose exactly one mode`); the witness mode was
  used instead. Its three public targets under `~/.kimi-code/plugins/managed/kimi-webbridge/` were read as-is.
* Factual accuracy of the round-21 lesson/closure/report contents, and of the round-22 note's own claims, was
  **not** audited (other seats' scope); only their byte preservation was checked.
* Whether the wave's close will add `corpus/lessons/round-22.md` is unobservable at `e3cf4e0`; F1 and F2 are
  stated against the committed revision, and their minimal fix is a single new file that must land before any
  lesson freeze.
* The prefix checks cover only the six named docs; other files in the range (138 changed paths) were not audited
  for in-place rewrites, except where noted that `corpus/lessons/`, `corpus/evidence/round-21/` and
  `corpus/knowledge/` show no modification of historical bytes.

## Tooling

No installs, upgrades or pacman transactions were performed or needed: the review is byte-level Git work plus
Node gate scripts, and Node **v24.21.0** (fnm path `/run/user/1000/fnm_multishells/10875_1792599106774/bin/node`)
was already present. The throwaway clone `/tmp/tabi-r22-w2b-ReviewPreserveDocs` was deleted after the checks.
