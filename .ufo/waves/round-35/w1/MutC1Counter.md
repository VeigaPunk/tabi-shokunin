# MutC1Counter — round 35 w1: C1 counter mutation test

## Verdict

13 single-point mutants of the frozen C1 counter
(`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs`, digest
`5707a937…b436b9`) were each probed against the full frozen control suite
(`baseline/controls.mjs`, J1–J8) in a scratch clone at the freeze
`a4bfef0f75027c915e715649950b1d46dcb33d83` with a functional fleet stand-in
(real git clones under scratch, because the adjacency gate refuses symlinked
repo paths by design). **4 mutants were killed, 9 survived.** Killed:
`n3 THIRD_LANE` removed → J7 flips (1→0, true); `n4 SIDE` removed → J6
flips; short-line screen exception removed → J8 flips (0→1); `NEW_TARGET`
2→0 → J2–J7 all flip. Survived (clauses no control guards / not exercised):
the four n1 clauses singly (`isNew`, sibling-token, declaration-names-path,
shared-tabi-ref — J4 exercises n1 only as a bundle and dies at the next clause
when one is removed), `n2 rename-route` (disclosed near-vacuous on this set),
`n4 browser-ground` singly (J5's fixture quotes carry neither BG nor SIDE, so
the two n4 checks shadow each other), the same-surface screen validation (no
control emits a same-surface row), the prior-candidate exclusion (summary-only
effects), and the TABI exclusion (vacuous: BG∩TABI is empty on this data, so
removing it changes nothing).

Frozen-control reproduction was verified before mutating: the pristine run
reproduces the frozen J1 receipt byte-for-byte and J2–J8 receipts modulo their
per-run fixture commit sha (candidate list and summary identical; final run on
restored bytes confirms the exact frozen summary and candidate list again).
One run artifact is reported separately: the harness never checks the exit
status of its `--list-candidates` child; during a period of heavy host load
(child agents), that child died after printing a 203-line prefix, silently
truncating the fixtures (a first M7 run was poisoned this way — its "J8
killed" outcome was an artifact, disproved by a guarded re-run). Every verdict
below comes from runs whose fixture list length equals the counter's own
candidate count (guard described under Evidence).

Clauses with no control guard (QUALITY 96), i.e. single-removal survivors:
`n1 isNew`, `n1 sibling-token`, `n1 declaration-names-path`, `n1
shared-tabi-ref`, `n2 rename-route`, `n4 split-declared quote browser-ground`,
same-surface screen validation, TABI exclusion (vacuous), prior-candidate
exclusion (only counts change, outcomes cannot flip on this data).

## Evidence

Environment: scratch `/fast/scratch/hyaku/tabi-r35/MutC1Counter/`; lane clone
(shared) `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin
$S/fleet/tabi-shokunin`, `git -C … checkout -q --detach
a4bfef0f75027c915e715649950b1d46dcb33d83` → HEAD printed
`a4bfef0f75027c915e715649950b1d46dcb33d83`; toplevel asserted =
`$S/fleet/tabi-shokunin`. Fleet stand-in: `fleet/` = shared clone of the
fleet root (needed for `fleet@…` ruling refs; the adjacency gate requires a
git toplevel for the fleet root), sibling lanes = real `git clone --shared`
repos (gate rejects symlinks and gitfiles: `repoIdentity` requires a real dir
whose absolute git dir is `<dir>/.git`, check-adjacency.mjs lines 539–570).
All source repos read-only; no writes outside scratch + designated output.

Detector command (per state): `TMPDIR=$S/ctl node
.ufo/waves/round-35/baseline/controls.mjs` run inside the clone, exit 0 each
time (pristine, 13 mutants, restored). Frozen parity:

- J1 receipt `c1-J1-do-nothing.json` sha256 == frozen `da2b6664…f1bf`
  (byte-identical); J2–J8 receipts identical modulo `rev` (fixture commit
  sha of the run); `c1-candidates.tsv` sha256 == frozen; the summary JSON is
  identical (all 13 entries).
- Restored-bytes final run: summary identical YES, candidates identical YES.

Per-mutant record (mutant | clause [file:line of the removed test] | mutant
sha | killed-by | outcome):

| # | clause | line | mutant sha (first 12) | killed by | control outcome |
|---|---|---|---|---|---|
| m01 | n1 isNew | 280 | fc4046db193f | — | J4 summary-only: refusals n1-tabi-declaration → n1-declaration-names-no-sibling-path |
| m02 | n1 sibling-token test | 280 | 7044dc6d3b85 | — | no deltas |
| m03 | n1 declaration-names-path | 283 | a3ee04827f35 | — | no deltas |
| m04 | n1 shared-tabi-ref | 285 | 155c73fbd5c1 | — | no deltas |
| m05 | n2 rename-route | 286 | 67fd2797e49a | — | no deltas |
| m06 | n3 THIRD_LANE | 287 | ca25576b5402 | c1-J7-third-lane-record | J7 1→0 false→true; J5 summary-only (row 2 refusal n3 → n4-BG) |
| m07 | n4 BG (split quote browser ground) | 289 | 3b4b88a87ee0 | — | J5 summary-only: refusals n4-BG → n4-states-no-side |
| m08 | n4 SIDE | 289 | 76be8a5a35e8 | c1-J6-quote-states-no-side | J6 1→0 false→true |
| m09 | short-line screen exception | 242 | 92aee374e542 | c1-J8-residual-lexical-forgery | J8 0→1 true→false; 31 screen-quote findings, unaccounted 31 |
| m10 | same-surface surface check | 243–245 | e562158230c2 | — | no deltas |
| m11 | prior-candidate exclusion | 154 | 20dfd9f1321a | — | summary-only all controls: candidates 383→405; J8 still 0 true |
| m12 | TABI exclusion | 152 | c1b7c424ebf4 | — | no deltas; candidates stay 383 ⇒ BG∩TABI empty on this data |
| m13 | NEW_TARGET 2→0 | 80 | 80079d049719 | c1-J2..J7 (six) | J2–J7 1→0 false→true |

Restore evidence: pristine sha `5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9`
reproduced after every restore (`cp` from `$S/pristine-c1.mjs`; sha printed in
each run log); the post-restore detector run reproduces the frozen summary and
candidate list exactly.

Run-artifact incident (harness weakness, NOT a counter defect): `controls.mjs`
captures `node c1-adjacency-sweep-v3.mjs --list-candidates …` stdout without
checking its exit status (file:line ≈ controls.mjs:74). During one run a
`--list-candidates` child died mid-print (host under heavy concurrent load;
the box was running >120 sibling agents) leaving a 203-line prefix; the
fixtures built from it screened only 203/383 candidates, producing
`unaccounted=180, screenFindings=0` across J2–J8 and a spurious "J8 killed"
for that run (M7 attempt 1). The run was repeated with a guard — fixture list
line count must equal the counter's own candidate count (J1 summary) — and the
guarded M7 run shows no outcome flip (see m07 row). The verdict table above
contains only guarded runs; per-run guard output (`LIST-GUARD … OK`) is in the
run transcripts saved under the deliverables directory.

No tools installed (nothing beyond `node`/`git`/shell utilities needed); no
browser or driver launched; no processes left running; scratch tree removed
after copying deliverables. All git calls carried `-C <scratch clone>`; no
source repo and no lane tracked file was created/modified except the two
designated deliverables below.

## Deliverables

- Report: `.ufo/waves/round-35/w1/MutC1Counter.md` (this file).
- Output dir `.ufo/waves/round-35/w1/MutC1Counter/`:
  - `mutants-verdict.json` — machine-readable frame + 13-row verdict table
    (mutant, clause, line, mutant sha, killed-by, delta notes);
  - `m01…m13.deltas.json` — per-mutant control deltas (frozen vs mutant
    summary for every changed control);
  - `restored-final-controls-summary.json`,
    `restored-controls-summary.json` — restored-bytes detector run outputs
    (identical to frozen).
