# ScribeScorecardDraft — round-43 executed-disposition skeleton (tabi, wave 1)

Seat: `ScribeScorecardDraft` · Item: disposition table skeleton · Axis judged: **calibration** ·
Milestone: disposition table skeleton · Date: 2026-10-29 · Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(fleet root `/home/vgpnk/Projects/shokunin`; scratch `/fast/scratch/hyaku/tabi-r43/ScribeScorecardDraft/`, deleted before yield).

## Behavior

Drafted the round-43 **executed-disposition skeleton** for `SCORECARD.md` into this seat's
directory as `disposition-skeleton.md` — a two-row table (C1, C2) whose *Counting command* and
*Before* cells are quoted **verbatim** from the frozen `.ufo/waves/round-43/claims.json`
(frozen at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`), whose *After* cells are placeholders
and whose *Verdict / score* cells are left as `pending (L1 post-wave)`. The draft also carries
the frozen kill rules, the conditional admission sentences, the waves/seats block placeholder
(64 seats; roles tallied at integration from `w1-results.json`), the draft-integrity notes and
two open items for L1. The generated file was produced by a script that reads `claims.json`
directly, so no string in the table is hand-transcribed.

**`SCORECARD.md` itself was not edited** (the lane tree is read-only for this seat); the draft
is a proposal for L1 to append after the existing `## Round 43 — declared claims (frozen
before data)` section. No commit, no push, no git/jj mutation anywhere; no agent dispatched
(leaf seat).

## Exact commands run and observed output

All commands ran with absolute paths; `cwd` was the fleet root only for `cd`-less absolute-path
calls. Nothing was written outside this seat directory and the seat's own scratch.

1. Freeze and worktree state (read-only):
   ```
   git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
   → ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
   git -C ... status --short
   →  M corpus/README.md
   →  ?? .ufo/waves/round-43/w1.ready.dispatched
   →  ?? .ufo/waves/round-43/w1/
   →  ?? corpus/knowledge/receipt-authenticity-signing-round-43.md
   git -C ... cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
   → commit
   git -C ... log --oneline -1 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
   → 7ca6f018 round-43: freeze C1 signature-authenticated chain + C2 hardened checker; controls red pre-data; S150/S151 opened; live measurement clean
   ```
   (`SCORECARD.md` is tracked and unmodified, so its round-43 declared-claims section is a
   committed byte, not a working-tree edit.)

2. Frozen digests re-derived from the **committed bytes at the freeze commit** and compared to
   `claims.json:frozenDigests` — all six match exactly (evidence
   `evidence/freeze-digests.txt`):
   ```
   scripts/measure-c1-round43.mjs                        23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  match=yes
   scripts/playwright-firefox-egress-round43.mjs          3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  match=yes
   .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs 6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  match=yes
   .ufo/waves/round-43/counters/check-routed-defects-round43.mjs 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743 match=yes
   .ufo/waves/round-43/fixtures/v0-fabrication.mjs        b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  match=yes
   .ufo/waves/round-43/fixtures/tree-vs-blob.mjs          7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  match=yes
   ```
   The same re-derivation over the eight committed control files matches every
   `claims.json:controlBindings[].sha256` (all `match=yes`), so the freeze's r5
   "freeze-binds-controls" premise holds on the committed bytes this seat inspected.

3. The C2 counting command at the **baseline** revision — the C2 row's "Before" cell, observed
   rather than copied:
   ```
   node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
        --rev ab592825cd195599822ca227f7768914df208201 \
        --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
   → exit 1
     "rev": "ab592825cd195599822ca227f7768914df208201", "predicate": false, "findingCount": 2
     findings: r5-claims-absent (.ufo/waves/round-43/claims.json not committed at REV)
               r6-probe-absent  (.ufo/waves/round-43/controls/c2-v0-probe.json not committed at REV)
   ```
   This matches the committed red control `.ufo/waves/round-43/controls/c2-baseline-red-r43.json`
   field for field (`exit 1`, `findingCount 2`, `findingIds [r5-claims-absent, r6-probe-absent]`,
   `predicate false`, same `rev`). Evidence: `evidence/c2-checker-at-baseline.json`.

4. The same checker at two candidate revisions (read-only observation; **not** the measured
   revision — L1 owns that):
   ```
   --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc → exit 0, predicate true, findingCount 0, findings []
   --rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c → exit 0, predicate true, findingCount 0, findings []
   ```
   Evidence: `evidence/c2-checker-at-freeze.json`, `evidence/c2-checker-at-head.json`. These are
   recorded in the draft as observations only; they do **not** pre-empt the verdict cells.

5. The C1 row's "Before" first element re-observed:
   ```
   git ls-tree -r --name-only ab592825cd195599822ca227f7768914df208201 -- corpus/evidence/round43 | wc -l
   → 0
   ```
   (evidence `evidence/c1-baseline-tree-count.txt`; the committed control
   `.ufo/waves/round-43/controls/c1-baseline-tree-count.txt` records the same command and `0`.)

6. Wave shape observed from the dispatch registry
   `.ufo/waves/round-43/w1/swarm-registry.json` (`createdAt 2026-10-29T20:49:15.914Z`): **64
   members**, all `kind: spawn`; roles — critic 16, executor 16, mutation-tester 8, reviewer 6,
   scout 5, scribe 5, connector 4, sentinel 2, simplifier 1, revenger 1; declared axes —
   calibration 27, operability 10, coverage 9, freshness 6, adjacency 4, discernment 4,
   quality 2, depth 2 (evidence `evidence/registry-tally.txt`).

7. The counter's argv discipline, read from the frozen bytes:
   `c1-signature-bound-v5.mjs:239` —
   `if (args.length !== 3 || args[1] !== '--measure') die('usage: node c1-signature-bound-v5.mjs <receipt.json> --measure <measure-record.json> (wrapper-invoked only; no --pins/--nonce/--witness)')`
   — consistent with the assignment's "strict argv — no `--pins`/`--nonce`".

## Gates exercised

| Gate | Result | Evidence |
|---|---|---|
| Freeze commit exists and is a commit | yes (`git cat-file -t` → `commit`) | `evidence/freeze-digests.txt` |
| `claims.json` committed bytes == worktree bytes | yes (sha256 `290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029` both sides) | `evidence/freeze-digests.txt` |
| Six frozen file digests == `claims.json:frozenDigests` | 6/6 match | `evidence/freeze-digests.txt` |
| Eight control digests == `claims.json:controlBindings[].sha256` | 8/8 match | `evidence/freeze-digests.txt` |
| C2 counting command at baseline reproduces the committed red control | yes (exit 1, 2 findings, same ids) | `evidence/c2-checker-at-baseline.json` |
| C1 baseline tree count = 0 | yes | `evidence/c1-baseline-tree-count.txt` |
| C1 counting command executed | **no** — out of this seat's scope (L1's measured run) | — |
| `w1-results.json` present | **no** — not yet written at this seat's write time | — |
| Any file written outside the seat dir / scratch | no | `git status --short` above: only pre-existing untracked wave dir + `corpus/README.md` (not mine) |

## Touched surfaces (writes only)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ScribeScorecardDraft/report.md` (this file)
- `…/ScribeScorecardDraft/disposition-skeleton.md` (the draft to be appended to `SCORECARD.md`)
- `…/ScribeScorecardDraft/evidence/` — `claims-frozen-strings.txt`, `c1-baseline-tree-count.txt`,
  `c2-checker-at-baseline.json`, `c2-checker-at-baseline.err`, `c2-checker-at-freeze.json`,
  `c2-checker-at-head.json`, `registry-tally.txt`, `freeze-digests.txt`,
  `controls-at-freeze-lstree.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ScribeScorecardDraft.md`
  (the seat's `Report:` trailer path — same content as this report)
- scratch `/fast/scratch/hyaku/tabi-r43/ScribeScorecardDraft/` — **deleted before yield**

## Out of scope / not done

- The C1 counting command was **not** run (it launches Playwright Firefox; it is L1's measured
  run and the seat item is drafting). C1's "After" cell therefore stays a placeholder.
- `SCORECARD.md` was not modified; no round-43 disposition text was landed by this seat.
- No commits, pushes, fetches, branches, tags, `jj` operations or `git` mutations anywhere; no
  fixture repository was created (none was needed).
- No tool installs and **no pacman transaction** (host-wide pacman guard); `/home/vgpnk/.omp/agent/RULES.md`
  was read first — nothing in it needed installing for a drafting seat, so the allowed channels
  (`uv tool`, official binaries in `~/.local/bin`) were not exercised. No `~/.local/bin` or
  PATH-directory write.
- No network access; no source re-open was needed by this item.
- `w1-results.json` does not exist yet, so the waves/seats block stays a placeholder with the
  dispatch-time registry shape recorded alongside it.
- No subagent was dispatched (leaf member).

## Findings

**F1 — the C1 counting command is printed with two different scratch paths in two committed
files.** The frozen `claims.json` (commit `7ca6f018…`, line 62) says
`--scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run`; the committed `SCORECARD.md:2309`
(round-43 declared-claims table) says `--scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run2`.
A repo-wide grep for `L1-measure/run2?` finds `run2` **only** at `SCORECARD.md:2309`; every
other occurrence (`claims.json:62`, the round-42 rows at `SCORECARD.md:2235`/`2253`, `LOG.md`,
the r42 wave evidence) uses the plain `run` form. This seat's draft quotes the frozen
`claims.json` string (the freeze governs, and the assignment names the exact frozen commands);
L1 owns the reconciliation of the declared table. Nothing frozen was amended by this seat.
Severity: documentation/traceability only — the scratch path is a work directory, and the
measured run's actual output path is fixed by `--out`/`--measure-out`; it does not reach either
claim's predicate or kill rule.

**F2 — no other divergence found.** The two rows' counting commands and before-states in the
draft are byte-equal to the frozen `claims.json` values (machine-copied, not retyped), and the
frozen digests, control bindings and baseline red state all re-derive cleanly over committed
bytes (tables above). The C2 command's `<REV>` placeholder is the frozen form and is left for
L1 to substitute — noted as an open item, not a defect.

## Limitations

- The verdict cells are unresolvable by this seat: the wave was not settled, no
  `w1-results.json` existed, the measured revision is L1's, and the frozen kill rules reserve
  the decision for post-wave scoring. Nothing here asserts a pass or a fail for C1 or C2.
- The checker runs at `7ca6f018` and `ba433c94` are single observations in the live worktree,
  not a clean-clone measurement at a pinned revision; they are recorded as observations, and
  they are *not* the disposition.
- The "Before" cells of C1's other three elements (r42-receipt replay refused, synthetic pair
  refused, tampered record refused) were **not** re-executed by this seat; they are quoted from
  the frozen `claims.json` and their control receipts are committed and digest-bound, but this
  seat did not re-run them.
- The registry role/axis tallies are the **dispatch-time** shape; the canonical tally is
  `w1-results.json` at integration.

## Artifact paths

- Draft: `.ufo/waves/round-43/w1/ScribeScorecardDraft/disposition-skeleton.md`
- This report: `.ufo/waves/round-43/w1/ScribeScorecardDraft/report.md` and
  `.ufo/waves/round-43/w1/ScribeScorecardDraft.md`
- Evidence: `.ufo/waves/round-43/w1/ScribeScorecardDraft/evidence/` (9 files listed above)
- Frozen sources read (read-only): `.ufo/waves/round-43/claims.json`,
  `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`,
  `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`,
  `.ufo/waves/round-43/controls/`, `SCORECARD.md`, `.ufo/waves/round-43/w1/swarm-registry.json`

VERDICT finding — the disposition skeleton is drafted and grounded, but the committed `SCORECARD.md:2309` declares the C1 counting command with `--scratch …/L1-measure/run2` while the frozen `claims.json` says `…/L1-measure/run`; the draft quotes the frozen string and routes the divergence to L1.
