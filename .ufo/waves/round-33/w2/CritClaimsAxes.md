# CritClaimsAxes — final claim attack, tabi round 33 w2

Seat: CritClaimsAxes (leaf; no subagent dispatch). Attacked: the after-state reading of
claims C1 (adjacency) and C2 (operability) at the integrated revision
`042d6d9abf97d567d495652a85eabc851b81adc1`, the frozen counter bytes, the pinned
`scripts/check-adjacency.mjs` digest, rule drift after scoring, and causal separability of the
two claims.

## Verdict

**Both claims hold; no defect found (severity: none).** At `042d6d9` the frozen C1 counter exits 0
with `predicate true` (check-adjacency clean, rows 14, verified 14; candidates 52, mapped 9,
screened 43, unaccounted 0, newMapped 4 — rows 12-15, all split-declared kake rows) and the frozen
C2 counter exits 0 with `predicate true` (H0/H1/H2 accepted, admitted 16, failing 0;
forgeriesAccepted 0/8; `--selftest` exit 0, `cases=44 passed=44`; `digestLiterals []`), exactly the
predicates worded at `claims.json:26` and `claims.json:45`. Both counters' bytes equal
`claims.json:13-18` `frozenDigests` at the freeze commit and at REV, `measure.sh` and
`controls.mjs` likewise, and `scripts/check-adjacency.mjs` is byte-identical to the digest pinned
inside the C1 counter (`4e2c2a64…24aac`, C1 counter:59) at both the baseline and REV — it has not
been touched since round 17 (`93bfead`). No rule moved after scoring: `claims.json`, both counters,
`measure.sh` and `controls.mjs` last-touch `e6b0a90` (the freeze) and are byte-identical at REV;
the only post-measure commit `042d6d9` adds measure files, the wave-2 spec and one appended
SCORECARD correction line, none of which either counter reads. The claims are causally separable
in both directions and at both partition sizes: reverting C1's map inputs (or all its non-wave
files, SKILL.md included) leaves C2 true and makes C1 false; reverting C2's gate (or all its
non-wave files, sources and lesson included) leaves C1 true and makes C2 false. Two observations
are recorded below (measure taken one commit before REV; the ticket's "only change besides measure
files" omits the wave-2 spec; the bf48b81 selfassessment mismatch is cleared at REV) — none is a
defect of the C1/C2 predicates.

## Evidence

Scratch: `/fast/scratch/hyaku/tabi-r33/CritClaimsAxes` (deleted before yield; receipts copied).
Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` rc 0,
`git -C "$S/clone" checkout -q --detach 042d6d9…` rc 0,
`git -C "$S/clone" rev-parse --show-toplevel` = `$S/clone`; REV
`042d6d9abf97d567d495652a85eabc851b81adc1`. Counters taken from the freeze commit exactly as
`claims.json:12` demands: `git -C lane show e6b0a90:.ufo/waves/round-33/counters/{c1,c2}.mjs`.
TMPDIR = `$S/tmp`. No browser, no network fetch, no installs.

### A. Frozen predicate vs after-state at 042d6d9

1. Frozen counter bytes (claims.json:13-18): `sha256sum` of the freeze-commit blobs =
   `da59d157…c6380` (c1) and `51ace65f…e812b` (c2); `git -C clone show HEAD:<path> | sha256sum`
   gives the same two values at REV; worktree `sha256sum` also the same. `measure.sh` =
   `ca6b830e…84c7e` and `controls.mjs` = `2d0cf841…f5a451e` at freeze and REV.
2. C1: `node "$S/k/c1.mjs" --rev 042d6d9… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json`
   → **exit 0**, `predicate:true`, `adjacency:{verdict:"clean",rows:14,verified:14,findings:0}`,
   `candidates:52, mapped:9, screened:43, unaccounted:0, newMapped:4`, `screenFindings:[]`,
   `newMappedRows` = rows 12,13,14,15 (`js-rendering-browser-execution`,
   `robots-txt-publisher-audit-vs-client-obedience`, `accessibility-browser-at-execution`,
   `crawl-budget-vs-client-crawl-thresholds`, all `kake`, all `split-declared`). Predicate
   implementation `c1-adjacency-sweep.mjs:239` is the wording of `claims.json:26`; newMapped filter
   `c1-adjacency-sweep.mjs:217-225`; pinned digest `:59`.
3. Pinned adjacency digest: `scripts/check-adjacency.mjs` at REV = `4e2c2a64…24aac` = at baseline
   `b7d16fb` = `claims.json:18`; `git log --oneline b7d16fb..042d6d9 -- scripts/check-adjacency.mjs`
   prints nothing (last touch `93bfead`, round 17).
4. C2: `node "$S/k/c2.mjs" --rev 042d6d9… --repo "$S/clone" --json` → **exit 0**,
   `predicate:true`, `honest:{H0:true,H1:true,H2:true}`, each admitted 16, failing 0, population 17;
   `forgeriesAccepted:0`, `forgeriesTotal:8`, `acceptedForgeries:[]`; per-variant exits F1-F8 all
   1 with reasons `t1-receipt` (F1,F3,F4,F5,F6), `x3-duplicate-id` (F2), `x4-measured-cell` (F7),
   `s1-source-row` (F8); `selftest:{exit:0,last:"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"}`;
   `digestLiterals:[]`; `gateSha256 62453b55…ac75`. Predicate `c2-bidi-forgery-battery.mjs:229`,
   digest-literal scan `:222`, honest digest list `:65` — exactly `claims.json:45`.
5. Candidate set: `node "$S/k/c1.mjs" --list-candidates --fleet …` yields 52 keys; `diff` against
   the first column of `.ufo/waves/round-33/baseline/c1-candidates.tsv` → identical (52/52). The
   four new rows cite candidate lines kake `PROVINCE.md:61,304,79,347` at pin
   `044048597…25e350`, each present verbatim in the frozen list (lines 12,17,14,25 of the tsv).
6. Screen ledger: `corpus/adjacency-screen.tsv` header line 1 exactly
   `sibling_ref	reason	surface	quote	note`; 43 data rows; reasons 36 `same-surface`,
   4 `no-claim-declared`, 2 `not-browser-sense`, 1 `third-lane-report`; counter reports
   `screenFindings:[]`. 9 mapped + 43 screened = 52 candidates, unaccounted 0.

### B. Measure fidelity (committed readings are reproducible)
1. At `bf48b81` (the revision the committed measure names): both frozen counters exit 0. C1 JSON is
   **identical** to `.ufo/waves/round-33/measure/c1-at-bf48b81.json` after `jq -S` (diff empty). C2
   JSON differs from `measure/c2-at-bf48b81.json` **only** in the 10 synthetic variant `commit`
   hashes (nondeterministic commit ids in the counter's throwaway clone); every predicate field is
   identical.
2. At baseline `b7d16fb`: C1 exits 1 — `predicate:false`, clean, rows 10/10, 52/5/0/47/0; C2 exits 1
   — `predicate:false`, honest H0/H1/H2 true, `forgeriesAccepted:8`, selftest `cases=27 passed=27`.
   Both match `baseline/measure-at-baseline/*-at-b7d16fb.json` and the do-nothing controls in
   `baseline/controls-summary.json`. So the move is real: false at baseline, true at REV, on the
   frozen bytes.

### C. Was any rule changed after scoring?

1. `git log --oneline -- <path>` for `.ufo/waves/round-33/claims.json`, both counters,
   `.ufo/waves/round-33/measure.sh`, `.ufo/waves/round-33/baseline/controls.mjs`: **one commit
   only, `e6b0a90` (freeze)**. Blob digests at `e6b0a90` and `042d6d9` are equal for all five
   (c1 `da59…`, c2 `51ac…`, measure.sh `ca6b…`, controls `2d0c…`, claims `796f7800…cf515e`).
2. `git diff --name-status bf48b81 042d6d9` = the 6 measure files, `.ufo/waves/round-33/w2-spec.json`
   (added), and `SCORECARD.md` (2 insertions, the appended correction at `SCORECARD.md:1805`). No
   counter, claims, map, ledger, gate or gate input changed between the measured revision and REV.
   Neither counter reads SCORECARD.md or the wave-2 spec (C1 reads adjacency.tsv, the screen ledger,
   sibling PROVINCE.md at pins, check-adjacency; C2 reads the gate, the round-32 entry, receipt,
   transcripts, `corpus/SOURCES.md`, `corpus/lessons/*.md` Gate rows) — confirmed by re-running both
   at REV, not inferred.
3. `corpus/adjacency.tsv` rows 12-15 and `corpus/adjacency-screen.tsv` are byte-identical between
   `bf48b81` and `042d6d9` (same diff); `scripts/check-bidi-runtime.mjs` likewise (`62453b…` at both).
4. `node scripts/check-selfassessment.mjs --rev HEAD --json` at `042d6d9`: **exit 0,
   `mismatches: 0`** (at `bf48b81` the L1 provenance records exit 1, mismatch 1, cleared by the
   one-line append at `SCORECARD.md:1805`).

### D. Causal separability (executed, not argued)

Each experiment is one commit in the scratch clone off `042d6d9`
(`git -C "$C" rev-parse --show-toplevel` asserted = `$C`; identity `CritClaimsAxes@scratch.local`),
then both frozen counters run at that commit.

| Exp | Change | C1 counter | C2 counter |
|---|---|---|---|
| A | C1 inputs reverted: `adjacency.tsv`→baseline, screen ledger deleted (`1d0b3854…`) | **exit 1**, false: clean 10/10, 52/5/**0**/**47**/**0** | **exit 0**, true: honest all true, 0/8, cases 44, no digests |
| B | C2 input reverted: `scripts/check-bidi-runtime.mjs`→baseline v1 (`adce41f3…`) | **exit 0**, true: clean 14/14, 52/9/43/**0**/**4** | **exit 1**, false: `forgeriesAccepted:8`, cases 27 |
| C | All C1 non-wave files reverted (`adjacency.tsv`+`SKILL.md`→baseline, ledger deleted; `0041e272…`) | **exit 1**, false: clean 10/10, 47/0 | **exit 0**, true: 0/8, cases 44 |
| D | All C2 non-wave files reverted (gate, `SOURCES.md`, round-32 entry, v2 note → baseline; `lessons/round-33.md` deleted; `93099b9e…`) | **exit 0**, true: clean 14/14, 52/9/43/0/4 | **exit 1**, false: 8 forgeries, cases 27 |

Each claim's predicate depends on its own files and on none of the other claim's files, in both
the minimal-input and full-partition forms. No shared authority, no hidden coupling through the
map, the gate, the registry or the lesson.

## Observations (not defects; no severity assigned)

1. **Measured revision is one commit behind REV.** The after-state reading was taken at `bf48b81`;
   the integrated revision is `042d6d9`. Transfer is exact because the intervening lane change is
   one appended SCORECARD line that neither counter reads, and I re-ran both counters at `042d6d9`
   (predicates true, exit 0). The ticket's "the only change between the two revisions besides
   measure files" omits `.ufo/waves/round-33/w2-spec.json` (236 lines added at `042d6d9`); it is
   orchestration, not a rule or counter input, so the transfer stands — but the description is
   imprecise.
2. **No-harm clause at the measured revision.** `measure/provenance-bf48b81.txt` records
   `selfassessment exit=1`; `claims.json`'s no-harm rule wants mismatches 0. At `042d6d9` my run is
   exit 0 / mismatches 0, cleared by the append at `SCORECARD.md:1805` (append-only, cites the stale
   line). The C1/C2 predicates themselves never read that counter; this is a no-harm observation for
   the L1, resolved at REV.
3. **Counter looseness already disclosed.** C1's `feasibilityDisclosed` (claims.json:35) admits that
   any closed-vocabulary screen reason counts as accounted and any 4 qualifying rows reach
   newMapped. At REV the four rows qualify as worded: row 12/13 via `sibling_quote` containing
   "tabi" (`adjacency.tsv:12-13`), rows 14/15 via `tabi_quote` naming kake
   (`adjacency.tsv:14-15`) — the frozen wording allows either side to name the other. Row-level
   overlap semantics and the 43 screen reasons are other w2 seats' attack; this seat certifies the
   predicate as worded, which is met.

Cleanup: scratch `/fast/scratch/hyaku/tabi-r33/CritClaimsAxes` removed after receipts were copied
(`test ! -d` passes). `pgrep -fa 'chromedriver|chromium'` returns one line, the host `earlyoom`
daemon whose argv merely names chromium — no chromedriver or chromium process was started by this
seat. No lane tracked file, lane index, fleet file or sibling repo was written; commits exist only
inside the (deleted) scratch clone.

## Deliverables
- Report: `.ufo/waves/round-33/w2/CritClaimsAxes.md` (this file).
- Receipts: `.ufo/waves/round-33/w2/CritClaimsAxes/` — `c1-at-042d6d9.json`,
  `c2-at-042d6d9.json`, `c1-at-bf48b81-repro.json`, `c2-at-bf48b81-repro.json`,
  `c1-at-b7d16fb-repro.json`, `c2-at-b7d16fb-repro.json`, `sep-{A,B,C,D}-{c1,c2}.json`,
  `candidate-keys.txt`, `frozen-candidate-keys.txt`, `selfassessment-at-042d6d9.json`,
  `run-log.txt`, `MANIFEST.sha256`.
