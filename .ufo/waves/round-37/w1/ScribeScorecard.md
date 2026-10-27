# ScribeScorecard — tabi round 37, w1

Seat: scribe (`ScribeScorecard`), milestone `frontier`, judged on `calibration`. Leaf: no subagents.
Scope: draft the round-37 `SCORECARD.md` sections; fill the frozen-claims table from `claims.json`; leave disposition cells
for the L1; name round-38 candidates from the routed-defect residue; propose trend verdicts with evidence pointers.
No product code, no counter run, no commit, no push, no fleet-file write.

## Behavior (what this seat did)

1. Read the frozen contract first: `.ufo/waves/round-37/claims.json` (both claims, predicates, kill rules, before-states,
   `frozenDigests`, `measurementRule`, `noHarmRule`, `controlsDoNothingNote`) and
   `corpus/lessons/round-36-verifier-spotcheck.md` (§ Routed defects and notes for round 37, items 1–8).
2. Read the round-36 sections of `SCORECARD.md` (`:1924-2045`) and mirrored their shape and column layout for round 35/36.
3. Verified, statically and read-only, the freeze's own integrity (commands in § Gates). No counter, gate, browser or
   fixture was executed by this seat; every claim outcome is left `PENDING-MEASUREMENT`.
4. Wrote the draft at `.ufo/waves/round-37/w1/ScribeScorecard/scorecard-draft.md`: the five requested sections, the
   frozen-claims table with claim/axis, counting command, before and target quoted from `claims.json` (predicate
   sentences quoted byte-for-byte: C1 295 B, C2 154 B), a disposition table whose after/verdict cells are
   `PENDING-MEASUREMENT`, a waves-and-seats paragraph with the frozen 34-seat w1 roster and completion left pending,
   capabilities/planned/saturation/retired with seven round-38 candidates drawn from the routed-defect residue, and a
   trend-verdict table whose rows are explicitly proposals.
5. Added an integration checklist so no cell can be filled later from memory: measured-REV line, receipt paths,
   three-site predicate comparison, tool-install line, append-only constraint.

## Gates (commands run by this seat — all read-only)

| Command | Result |
|---|---|
| `sha256sum .ufo/waves/round-37/counters/*.mjs .ufo/waves/round-37/measure.sh .ufo/waves/round-37/baseline/run-controls.sh` | all five equal `claims.json:frozenDigests` (`c1 9c6289b7…91752c`, `c2 eda339eb…2e019`, `buildTool a85152cd…2a9a96`, `measure 9f89697c…43302`, `controls 3a08367f…f25e`) |
| python compare: `claims.json` predicate vs `PREDICATE_SENTENCE` in each counter | byte-identical, C1 295 B (`c1-adjacency-sweep-v5.mjs:131`), C2 154 B (`c2-firefox-bidi-v3.mjs:114`); third site (`receipt.predicateSentence`) has no receipt yet → PENDING |
| `git show --stat 99437d2` / `git log --oneline -6` / `git status --porcelain` | freeze `99437d2` is one commit, 17 files / 1812 insertions, parent `ed8ccfc`; tip `f76da09`; porcelain shows only untracked `w1/` |
| python: `PINS` table of `c1-drift-audit-build-v2.mjs` | 20 entries, all 40 hex, kama `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d`; per-entry `rev-parse --verify` at line 64 |
| read `c1-adjacency-sweep-v5.mjs:604-640` | `DELTA_PINS_SHA256` refusal at `:389` and predicate term at `:587`; `--list-delta` / `--list-drift` read pins at HEAD (fallback on-disk `cat`) with **no** digest comparison |
| read `c2-firefox-bidi-v3.mjs` term map | `GIT_NO_REPLACE_OBJECTS` in git env, `replaceRefs()` called at `:527` before blob reads, `scratchSurvivors` with second scan after grace (`:339-341`, fn `:467`), `observedFinding` (`:405`), `TARGET = 16` (`:96`) |
| read `scripts/check-freshness.mjs:48-52` + `.ufo/waves/round-37/measure.sh:1-40,45-70` | `--worktree` with `--repo` is inside the gate's usage contract; `measure.sh` v2 header names both round-36 harness defects, takes `OUT` absolute, writes `numstat-at-$short.txt`, and runs `check-freshness.mjs --worktree --repo $d` |
| python byte-compare: 34 w1 dispatch task payloads vs `skill://godspeed/directive.md` | 34/34 byte-identical after the `/skill:godspeed\n\n` prefix (directive 429 B, sha256 `db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb`); 0 deviants — round-36 routed defect 6 does not recur in w1 |
| read `baseline/*.json` (10 receipts), `baseline/census-start.txt`, `w1/swarm-registry.json`, `corpus/SOURCES.md`, `corpus/README.md` | controls' before→after exit directions as declared; census-start `tabi ok` with 20 pre-existing W04 lines; w1 = 34 seats (8 reviewer, 8 executor, 5 critic, 4 mutation-tester, 3 scribe, 2 scout, 2 connector, 1 simplifier, 1 sentinel); `SOURCES.md` 142 rows, no S143 row yet |

No mutating git/jj command was run; every git invocation was `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin` with a
read-only subcommand. No pacman; no tool installed, so the tooling-authorization record for this seat is "none". Scratch
root was not needed and no scratch path was created, so there is nothing to delete.

## Touched surfaces

| Path | Kind |
|---|---|
| `.ufo/waves/round-37/w1/ScribeScorecard/scorecard-draft.md` | new — the drafted sections (18.9 KB) |
| `.ufo/waves/round-37/w1/ScribeScorecard/report.md` | new — this report (spec-named `Report:` trailer) |
| `.ufo/waves/round-37/w1/ScribeScorecard.md` | new — same content, wrapper-named report path |

No other file was created, edited or deleted; `SCORECARD.md` itself was not touched (the L1 integrates).

## Out of scope / not done (by design)

- No claim adjudication: no counter was run, no clean clone was made, no browser/Firefox was launched, no fixture was
  built. Every disposition cell in the draft is `PENDING-MEASUREMENT`.
- No score proposed for any axis; the draft says "held" only where a claim is absent, and marks those cells pending too.
- W2 roster, seat-completion counts and the round total: not frozen at draft time (11 seat dirs, 0 `report.md` at the
  time of writing) — left pending rather than guessed.
- The third predicate site (`receipt.predicateSentence`) cannot be checked before a receipt exists.
- Tool installs: none. Firefox 158.0.1 / geckodriver 0.37.1 are the binaries the frozen counter names; this seat did not
  install, run or verify them.

## Findings (recorded by this seat, not adjudicated)

1. **`claims.json:frozenAt` names the baseline, not the freeze commit.** `frozenAt` and `baseline` are both
   `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`, while the commit that contains the claims, counters, build tool, harness
   and control receipts is `99437d2…` (parent `ed8ccfc`). Round 36's claims carried a self-describing
   `frozenBeforeData: true`; this one carries no such field. The bytes are frozen-before-data as far as the receipts show,
   but the file does not say so itself. Draft names both commits and flags the convention gap for the L1; amending this
   claims file after seats scored would violate `measurementRule`.
2. **The v5 display modes are not digest-bound.** `--list-delta` / `--list-drift` (`c1-adjacency-sweep-v5.mjs:613-620`)
   read `c1-delta-pins.json` at lane HEAD or on disk and never compare `DELTA_PINS_SHA256` (`:96`, refusal `:389`). The
   evaluated path is bound; the display path is not. This is the hypothesis w1 `LabratC1` probes and round-38 candidate 1
   in the draft.
3. **The survivor leg has no injected-survivor control.** v3 counts survivors on the SIGKILL path only
   (`:339-341`); no frozen control flips a hard-coded `survivors = 0`, which is the gap w1 `MutC2a` m3 is asked to
   classify. Round-38 candidate 3.
4. **Dispatch fidelity is correct but unguarded.** All 34 w1 payloads carry the Godspeed directive byte-identically
   (429 B, sha256 `db88963c…`), so round-36 routed defect 6 does not recur — but nothing in the lane checks it; the
   round-36 deviation was caught by hand. Round-38 candidate 5.
5. **S143 is cited before it is registered.** `claims.json` C2 `source` names S143 (git-replace manual) as "opened this
   round"; `corpus/SOURCES.md` carries 142 rows at draft and no S143 row, so that row is w1 work in flight
   (`ScoutSrc`/`ScribeSources`). The expansion trend proposal is conditional on it. This is a sequencing observation, not
   a defect.
6. **Round-36 routed defects 1–5 and 8 are represented in the frozen bytes** (pins digest `:96/:389`, kama 40 hex +
   per-entry resolve, canonical note clause per the J2 receipt, one 295 B predicate sentence at two of three sites,
   harness v2 header naming both defects, replace-ref refusal + `GIT_NO_REPLACE_OBJECTS` + survivor scan + observed
   binder). Defect 6 is repaired in the payload but unguarded (finding 4); defect 7 (incomplete seats) is a completion
   count this draft leaves to the L1. None of this is a verdict — whether each leg behaves as declared is exactly what
   the after-measurement and the w1 mutation seats are for.

## Artifact paths

- Draft: `.ufo/waves/round-37/w1/ScribeScorecard/scorecard-draft.md`
- Report: `.ufo/waves/round-37/w1/ScribeScorecard/report.md` (= `.ufo/waves/round-37/w1/ScribeScorecard.md`)
- Read for grounding: `.ufo/waves/round-37/claims.json`, `.ufo/waves/round-37/counters/*.mjs`,
  `.ufo/waves/round-37/measure.sh`, `.ufo/waves/round-37/baseline/*`, `.ufo/waves/round-37/w1-dispatch.json`,
  `.ufo/waves/round-37/w1/swarm-registry.json`, `SCORECARD.md:1924-2045`,
  `corpus/lessons/round-36-verifier-spotcheck.md`, `corpus/SOURCES.md`, `scripts/check-freshness.mjs`,
  `skill://godspeed/directive.md`.

VERDICT ok — draft delivered with the frozen-claims table quoted verbatim from `claims.json`, every disposition/score cell
marked PENDING-MEASUREMENT, seven round-38 candidates traced to routed-defect residue with file:line pointers, and trend
verdicts stated as proposals; freeze digests and two of three predicate sites verified statically, no counter run.
