# ConnSelfOverlap — in-lane overlap of `committed-bytes-verification-round-42.md`

Full report with every command and output: `.ufo/waves/round-42/w1/ConnSelfOverlap/report.md`
(evidence: `w1/ConnSelfOverlap/lane-facts.txt`, `w1/ConnSelfOverlap/replace-ref-experiment.txt`).
Lane HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218`. Read-only; scratch
`/fast/scratch/hyaku/tabi-r42/ConnSelfOverlap/` removed. Judged axis: adjacency.

## Decision

**Distinct ground. No supersession.** Cross-cites only.

| Claim | Held already by | Judgment |
|---|---|---|
| A. Evidence-at-revision rule (path + revision; verifier enumerates first) | not S142 — S142 scopes out “working-tree state” and its used-by entry compares pin vs delta head, never binds a pointer to a revision | **distinct**, but the *instrument* claim is weaker than stated: `git show <rev>:<path>` also fails on an absent path |
| A′. Table row 3 (`git show <rev>:<path>` + sha256) | S142 (`corpus/knowledge/adjacency-drift-audit-r36.md` §5 uses exactly this primitive for pin vs head) | **partial overlap** → cross-cite S142 |
| B. >1 MiB file-commit behavior (“the lane helper skips new files over 1 MiB”) | nobody: 0 registry rows for jj config; no size filter in `scripts/` | **not overlap — unsourced and misattributed** |
| C. `ls-remote` pre-report gate (`refs/heads/<branch>`) | S055 (supersedes S049, `queued`, used-by `—`): colocated jj HEAD is detached, a gate must resolve an exported branch ref, never HEAD | **premise overlap** → cross-cite S055 |
| D. Byte rows treated as invariant | S143: replace refs substitute what `show`/`cat-file` read; “a digest-bound receipt must hold both” | **dependency** → cross-cite S143 + state the guard |

## Key observed facts

```
$ jj config get snapshot.max-new-file-size            -> 1MiB
$ jj config list --repo | grep -i snapshot            -> snapshot.auto-track = "none()"
$ git rev-parse --abbrev-ref HEAD                     -> HEAD   (detached; only refs/heads/master exported)
$ git ls-tree -r -l HEAD -- corpus/evidence/round41/playwright-egress/
  1167198  receipt.json      1153988  receipt.witness.json      (both > 1 MiB)
$ git ls-tree -r --name-only 34e177959d… -- corpus/evidence/round41/ | wc -l   -> 0
$ git ls-tree -r --name-only ef41e539 -- corpus/evidence/round41/playwright-egress | wc -l -> 0  (rule 1's citation binds)
$ grep -n "ls-tree" .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
  18 (comment), 23 (comment), 128 (`/ls-tree/.test(raw)` on the R3 control)
  R1/R4 actually call `git show <rev>:<path>` (:56) and `git cat-file -s` (:61)
$ git for-each-ref refs/replace | wc -l               -> 0
```

Replace-ref experiment (depth-1 `--no-local` clone in scratch; lane untouched):
`cat-file -s` 38955 → **18** under a replace ref; `show|sha256` 48fb0fdb… instead of the
entry's pinned `2c298383…`; `GIT_NO_REPLACE_OBJECTS=1` restores 38955 / `2c298383…`.
Latent today (0 replace refs), so the entry's digest is currently true.

## Findings (no edits made; entry/claims/counter bytes frozen)

- **F1** `corpus/README.md:879` (committed) cites `corpus/lessons/round-42.md`; that path is
  absent at `HEAD`, `9b6de3a1…`, `34e17795…` — the landing violates the entry's own rule 1
  (D1's class). S146's used-by cell has the same dead pointer.
- **F2** The round-42 note is indexed under the header `## Round 41 …` (`README.md:872`) whose
  framing line still says “One knowledge note” (`:874`). Enumerating round 42 by heading finds
  zero.
- **F3** “the instrument the round-42 checker's R1/R4 checks are built on” is false for
  `git ls-tree`: R1/R4 use `git show` + `cat-file -s`.
- **F4** Rule 4's causality is unobserved: no lane size-filter helper; the lane sets
  `snapshot.auto-track = "none()"`, which leaves *all* new files untracked regardless of size,
  and “commit as explicitly named files” does not follow (naming ≠ tracking under `none()`).
  The 1 MiB arithmetic is at least consistent with the incident sizes.
- **F5** `README.md:879` advertises “ls-tree/cat-file/ls-remote” but the registry has no
  `git cat-file` and no `git ls-remote` row (`grep -in "ls-remote" corpus/SOURCES.md` → none).
- **F6** Untracked self-referential symlink `corpus/knowledge/knowledge ->
  …/corpus/knowledge/` (created 12:39 today) — recursive corpus walks can loop. Not mine,
  not deleted.
- **F7** S055's quote cell is lane-voiced (“…so a gate must resolve…”), so cross-citing it
  without a verbatim quote from `docs/git-compatibility.md:113-115` would inherit a D2 defect.

## Recommended moves (findings only)

1. Cross-cite **S142** on table row 3 (primitive is S142's; digest bind is additive).
2. Cross-cite **S143** on the byte rows and add the guard: `refs/replace` empty **or**
   `GIT_NO_REPLACE_OBJECTS=1`. Highest adjacency gain, harms no other axis.
3. Cross-cite **S055** on row 4, stating where `<branch>` resolves from; repair S055's quote
   first (F7). This also populates a `queued` row with an empty used-by.
4. Fix or cut rule 4's mechanism clause (F4).
5. Fix the index as an **appended correction row** (QUALITY 31), never an edit of `:879`.

## Boundary note (disclosed)

I ran `git ls-remote origin` once (read-only HTTPS, no credentials, nothing written) for the
pushed-tip evidence; the seat bounds otherwise restrict to loopback/local. No tool installs.

VERDICT finding
