# R65Reviewer — findings for C1 (adjacency, v22 refusal class delta-disposition-conflict)

Target attacked: `.ufo/waves/round-65/w1/R65Executor1/c1-adjacency-host-v22.mjs`
(sha256 `019541e745e54f0c5aebbd9ffe1f4fb528a24e195ec8040dd25866c6c782e238` — re-hash at scoring; untracked lane file).
Full worksheet with all re-runnable commands: `.ufo/waves/round-65/w1/R65Reviewer/c1-attacks.md`.
Base scratch: `/fast/scratch/hyaku/tabi-r65/R65Reviewer/clone` (shared clone at `58ed8c7a…`, copy show-toplevel verified).

1. **Claim targets all met — no killed attack survives at exit level.** Forgery A
   (`.ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv`) → v22 exit 1,
   `delta-disposition-conflict` ×1; forgery B (round-62 committed `real-conflicting-delta.tsv`,
   conflict key `kagi-shokunin/PROVINCE.md:41`: line 20 no-tabi-ground vs line 176 contested-open)
   → v22 exit 1 with the claimed id; positive control C (honest
   `corpus/adjacency-host-delta-r62.tsv`) → v22 exit 0, findings [].

2. **Do-nothing control holds.** v21 at base on A and on B both exit 0 with predicate true
   and empty findings — the claim sheet's "2 false greens of 2" is real. v21 selftest 44/44
   (`tabi-adjacency-host-v21-selftest`); v22 selftest 46/46 = 44 carried unchanged + 2 new
   (`conflict-refused`, `same-disposition-duplicate-accepted`), exit 0.

3. **Predicate sentence identity verified.** The v22 `PREDICATE-SENTENCE` header (line 17) is the
   v21 body + generation-name change + exactly one appended clause ("AND no two delta line rows
   share a (lane, relPath, line) key with differing dispositions."), word-diff shows nothing else;
   run-time `predicateSentence` matches.

4. **Attack class "spelling of the same conflict" — all killed** (each names the exploited line):
   raw string compare `first !== r[7]` at v22 line 185 is resilient to the probes I could build:
   - trailing ASCII space on the duplicate disposition (`at-trailspace.tsv`) → exit 1, conflict id (line 185; no `trim` white-list hole the other way).
   - CRLF row endings, both one line (`at-crlf-eol.tsv`) and the whole file (`w-full-crlf.tsv`) → exit 1, conflict id (tsvParse's `replace(/\r$/,'')` at line 46, re-verified:?; no `\r`-preserving hole).
   - `CONTESTED-OPEN` case variant (`at-case-variant.tsv`) → exit 1, conflict id: the mismatch is refused, so the case-insensitive-admission attack does not exist.
   - empty disposition field (`o-empty-disp.tsv`) → exit 1, conflict id.
   - embedded literal `con\ttested-open` (`w-disp-embedded-t.tsv`) → exit 1, conflict id.
   - majority vote 3-vs-1 (`m-majority-3v1.tsv`) → conflict id ×3 (no majority leniency).
   - swapped row order (`o-swapped-order.tsv`) → conflict id (order-insensitive refusal).

5. **Findings with id deviation (bounded residual, not claim-breaking)**: two malformed-key
   attacks still red but under a NON-conflict id —
   - (K1) later duplicate keyed by a trailing-`:0` path cell (`at-trailing-zero-line.tsv`,
     `n-trailing-zero-conflict.tsv`) → exit 1 but the id is `line-row-unscreened-file` (linePathOf
     gets line=null at v22 line 242, lands in the stray-row class). The conflict WITH a
     well-formed twin (`n-…`) also fires the conflict id. RISK: the frozen predicate sentence is
     still met (exit 1), so no claim-verdict impact, only id-attribution noise.
   - (K2) conflict row with a padded lane name (`w-lane-pad-conflict.tsv`) → exit 1 via
     `orphan-line-row`.
   Verdict: survives-as-other-id; the exit-1 obligation holds in every case; no green path exists
   through these.

6. **Over-refusal mutants killed by the regression set.** Built two trivial mutants in scratch
   (copies shelved at `w1/R65Reviewer/mutant-dupall.mjs` / `mutant-dupsame.mjs`, sha256
   `bd2d7339…`): M-dupall fires the conflict on EVERY duplicate key, M-dupsame fires it on every
   same-disposition duplicate. Both exit 1 on the honest-ledger + one-identical-dup positive run
   (`m-honest-plus-same-dup.tsv`) where v22 exits 0; both fail the v22 selftest case
   `same-disposition-duplicate-accepted` (allPass 45/46, exit 1). A third mutant (M-noLines, gutting
   the line row index) is killed by the honest control (149 `delta-line-missing`). So the claim's
   target cannot be met by a trivial over-refusal: the selftest regression set catches it.

7. **Same-disposition duplicates are admitted on isolated keys (contract, verified):
   `m-honest-plus-same-dup.tsv` (honest ledger + exact dup of row 13) → v22 exit 0, findings [];
   v22 selftest asserts the same (`same-disposition-duplicate-accepted`, allPass).

8. **Blanket relabels stay admitted** (`c2-fixtures/delta-fab-label.tsv`, v21 exit 0 findings [] in
   base scratch — v22 not claimed on it): the draft's C1 section correctly declares this as the
   residual; nothing to fix.

9. **Honest ledger has zero duplicate line-row keys** (verified by script over the committed ledger:
   every (lane, rel, line) key appears once), so the positive control does not exercise the new
   refusal in either direction — the v22 selftest's two new cases and the `m-honest-plus-same-dup`
   / `pos-dup-honest.tsv` scratch runs fill both sides of that truth table; recommend the L1 add
   `m-honest-plus-same-dup.tsv`-style same-dup confirmation as a committed control before freeze if
   the remainder budget allows (reusable; construct is one row appended).

Verification gaps: none blocking. All fixtures were hand-built in scratch
(`/fast/scratch/hyaku/tabi-r65/R65Reviewer/sandbox/`, pruned; the named probe files are encoded in
the worksheet); the delta of the honest ledger v21 vs v22 (ledger content identical, DELTA-HEAD-IDENTICAL).
The v22 hash applies to the file as of the attack wave; re-hash at the freeze.
