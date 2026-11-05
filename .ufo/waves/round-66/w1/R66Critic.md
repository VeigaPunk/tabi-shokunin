# R66Critic — attack report (round 66, wave w1, claims C1 and C2)

Read-only attack. No frozen file, corpus file, sibling repo, or fleet file was written. Every scratch artifact lived under `/fast/scratch/hyaku/tabi-r66/R66Critic/` and was removed before yield; the artifacts I reference below were copied to `.ufo/waves/round-66/w1/R66Critic/evidence/`.

Note: `.ufo/waves/round-66/c1/mechanical` (the executor generator named in the assignment) does **not exist** on disk at the time of this run. I wrote an independent mechanical generator (`evidence/gen-c1.mjs`). It copies `BG_WORDS` from the frozen meter source by regex and does not retype it.

## Verdicts

- **C1 (adjacency, score 8): FALSIFIED as an adjacency claim.** The frozen predicate is reachable by a purely mechanical rebind with zero disposition changes. The move is freshness, not adjacency (see F4).
- **C2 (calibration, score 9): SURVIVES.** The selftest-only v3 with two relative-input cases kills M5a and M5b and stays clean on the unmutated gate with zero predicate hunks. The premise that a *fixture-free* kill exists is falsified (F6). The sourcing claim that C2 "rests on the S-next row" is falsified (F8).

## C1 findings

**F1 — high — the do-nothing standard fails.** A mechanical-only ledger reaches `predicate true, findingCount 0, exit 0`.
- Construction (`evidence/gen-c1.mjs full`): lane rows regenerated at snapshot heads (sha, lines, bgHits, head); audit statuses regenerated and the moved note rewritten to the derived line; line rows matched to current hit lines by content identity (148 of 149), one residue quote rewritten to the whole line by same-line key (1 of 149), 0 new hit lines, 0 dropped rows.
- Result: `evidence/c1/full.meter.json` — predicate `true`, findingCount `0`.
- Disposition cells changed: **0**. Audit status changes: **0** (only notes changed: `:1885`→`:1898` at `kumitate-shokunin:SCORECARD.md:1723`, and "stale" notes re-headed from `9cc8fbbc` to the snapshot head).
- The claim's own admission (a) is met by this construction, and (b) trivially. The claim's "adjudication is necessary" premise does not follow from the predicate.

**F2 — high — the claim's control (c) is green only because of one mechanical quote rewrite.** I reproduced the control exactly as drafted (lane rows and audit note rebound, quote residue left). Result: `evidence/c1/linesonly.meter.json` — predicate `false`, findingCount `1`: `delta-quote-not-whole-line kake-shokunin:SKILL.md:1358`. The only residue is one row; fixing it is a whole-line copy, not an adjudication.

**F3 — high — a disposition is carried across changed text, and the meter cannot see it.** The residue row `kake-shokunin:SKILL.md:1358` carries `no-tabi-ground`, adjudicated on the r62 text. The current line (`evidence/kake-SKILL-1358-at-head.txt`) is not a superset of the old quote: the old quote (1937 chars) and the current line (2254 chars) diverge at character 547. Current text reads: "C1 both entries exist and the staged candidate name does not (`[r93-absence 2026-11-04: corpus/knowledge/google-robots-txt-limits.md — the round-60 staged draft name, never committed …]`; the round's committed entry for the subject is `corpus/knowledge/robots-txt-limits.md`)". The old text read "C1 both entries exist and the staged `corpus/knowledge/google-robots-txt-limits.md` does not". The rebind overwrote the quote and kept the disposition; the predicate only checks vocabulary membership, not that the disposition was adjudicated on this text. This is the r62 false-green class in a new form.

**F4 — medium — axis assignment: freshness, not adjacency.** The rebind changes heads, hashes, line counts, audit notes and one quote; it changes zero dispositions and names no new contested scope. Quoting `AXES.md`:
- freshness: "Drift detection — skill claims re-verified against live surfaces; stale items flagged or fixed" (AXES.md row *freshness*).
- adjacency: "Lane reports name contested scope; integrator arbitrates" (AXES.md row *adjacency*).

Counter-argument for adjacency (rejected): the ledger is an adjacency artifact, so its staleness is an adjacency defect. But staleness of an adjacency artifact is a freshness failure; the adjacency signal moves only when contested scope is named or a `contested-open` row is ruled with an integrator reference. The r65 Critic reached the same verdict (`round-65/w1/R65Critic/claims-critique.md` §(a): "Best-fit reading is calibration … the claim's own measured effect is zero on adjacency").
**One-line verdict: the rebind is a freshness move; C1 may score adjacency only if it changes a disposition with an integrator ruling reference, which this predicate does not require.**

**F5 — low — the before-artifact is not byte-reproducible.** Re-running the frozen meter at the same inputs gives `drift: [{lane: kengaku-shokunin, snapshotHead: 00462b59…, liveHead: c3f81f72…}]`, while the committed `measure/v22-live-r66.json` has `drift: []`. Findings are unchanged (40); the drift field is disclosure-only. Record that the committed control depends on live-head state at run time.

## C2 findings

**F6 — medium — no fixture-free kill exists; the claim's relative-fixture construction is the minimum.** Evidence:
- `diff` of the frozen v2 against each mutant: one line differs (line 90, `const candidates = …`). For absolute `rel` all three expressions yield `[rel]`. For relative `rel`, v2 yields `[repo/rel, dir/rel]`, M5a yields `[dir/rel]`, M5b yields `[repo/rel]`.
- The only relative input among v2's 12 cases is `instruments/missing.mjs`, absent at both bases. So M5a and M5b give identical verdicts on all 12 (re-run: v2 `clean 12/12` exit 0; M5a `clean 12/12` exit 0; M5b `clean 12/12` exit 0).
- Therefore any predicate change that kills M5a/M5b without a new relative fixture must change a verdict on an existing fixture (e.g. refuse relative inputs, and re-assert `matrix-input-absent`'s expectation). That is a behavior change to the gate and a predicate hunk, which the draft's admission (a) forbids.

**Experiment (selftest-only v3, `evidence/v3-*.mjs`, `evidence/run-v3-*.json`):**
- `v3-candidate`: `clean 14/14`, exit 0 (both new cases pass: `matrix-rel-repo-base`, `matrix-rel-matrix-dir-base`).
- `v3-M5a`: `red 13/14`, exit 1; failing case `matrix-rel-repo-base` (`["matrix-input"]`).
- `v3-M5b`: `red 13/14`, exit 1; failing case `matrix-rel-matrix-dir-base` (`["matrix-input"]`).
- `diff` v2→v3-candidate: additions only inside `selftest()` (hunk `170a171,187`); no predicate hunk.

**F7 — medium — v2 accepts a relative input that escapes `--repo` (out of C2's kill, not covered by v3).** `path.join` normalizes `..` (`node -e 'path.join("/repo","../outside.mjs")'` → `"/outside.mjs"`, exit 0; Node v24.21.0). Fixture: repo at `X/repo`, file at `X/outside.mjs`, matrix `{input:{path:"../outside.mjs", sha256:<its sha>}}` → `evidence/matrix-esc.json`: `ok true`, `byCheck {}`, exit 0. Control with a missing path → `evidence/matrix-missing.json`: `ok false`, `matrix-input`, exit 1. The binding passes for a file outside the repo tree. Severity medium; L1 to decide whether it belongs in a later claim.

**F8 — medium — the `S-next` row grounds much less than the claim says.** `claims-draft.md:41-43` says "C2 rests on the S-next row" and cites a "C2 knowledge note and the round lesson". No such row file exists on disk: grep for `S-next` finds only `claims-draft.md`, `w1-dispatch.json`, `w1-plan.json`, `w1-spec.json`. The only sources are `w1/R66Scout/sources/path-docs.txt` (Node v24.22.2 docs) and `headers.txt`; the host runs Node v24.21.0 (version mismatch, low).
- What the doc grounds: `path.join` concatenates and normalizes (`path.join('/foo','bar','baz/asdf','quux','..')`), and `path.isAbsolute` classifies inputs; `path.resolve` resolves against cwd.
- What it does not ground: the candidate order (that is v2's own header, lines 9–10), the mutant kill (empirical, F6), base precedence, or the repo-escape behavior (F7).
- C2 rests on the frozen code and the executed fixtures, not on S-next. Fix the claim's sourcing before freezing.

**F9 — low — the relative branch is the common path in real use but untested.** 27 of 33 matrix files under `round-65/` and `round-66/` name a relative input (scan of `matrix*.json`, `input.path`); the frozen selftest has no relative *positive* case. v3's two cases would be the first.

## Commands run (exit codes)

- `node …/c1-adjacency-host-v22.mjs --rev 2816adb3… --repo …/tabi-shokunin --fleet …/shokunin --snapshot …/snapshot-live-r66.tsv --json` → 1 (predicate false, findingCount 40; drift kengaku only).
- `node gen-c1.mjs linesonly|full <dir>` → 0 each.
- Meter on `c1/linesonly` → 1 (findingCount 1); on `c1/full` → 0 (findingCount 0).
- `node check-receipt-provenance-v2.mjs --selftest --scratch <abs> --json` (v2, M5a, M5b) → 0 each, `clean 12/12`.
- `node mk-c2.mjs` → 0; `--selftest` on v3-candidate → 0 (`clean 14/14`); v3-M5a → 1 (`red 13/14`); v3-M5b → 1 (`red 13/14`).
- `git -C <sibling> show <head>:SKILL.md | sed -n 1358p` and `git -C <tabi> cat-file -p` (read-only) → 0.
- `node -e 'path.join(...)'` → 0. Matrix-escape fixture (v2) → 0 (ok true); matrix-missing control → 1.
- Tool installs: none. No `pacman`, no `~/.local/bin` writes.

## Scope and limits

- Did not run the tabi repo's own validators or the lane's suite (not in scope).
- F5 drift is disclosure-only and does not change the finding count.
- The mechanical generator is my construction, not the executor's (`round-66/c1/mechanical` absent).
