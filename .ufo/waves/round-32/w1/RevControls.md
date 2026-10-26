# RevControls — round-32 freeze-controls review (w1)

## Verdict

The freeze is sound: I re-ran `.ufo/waves/round-32/baseline/controls.sh` myself in scratch at the freeze commit `5ad1fcbf` with baseline `d805d1d6` and every one of the eight controls reproduces its committed counted fields exactly — c1-J1 (population 0 / e1-entry-absent / exit 1), c1-J2 (16 rows, all s1-source-row / exit 1), c1-J3-offline (admitted 16, exit 0 — the offline leg alone admits the forgery, exactly as claimed), c1-J3-live (admitted 0, t3-binding "first screenshot differs from this counter's live session" / exit 1), c1-J4 (admitted 0, t1-receipt "driver absent, is this counter, or its sha256 differs" / exit 1), c2-J1 (mismatches 18 = 3 m4 at SCORECARD.md:1473/1515/1576 inactive→active + 15 m1 / exit 1), c2-J2 (mismatches 15, numstat 3/3 SCORECARD.md / exit 1), c2-J3 (mismatches 18 / exit 1) — and the two selftests (BIDI cases=27 passed=27, SELFASSESSMENT cases=41 passed=41), `frozen-counter-sha256.txt` and the c2-J2 numstat are byte-identical to the committed copies. Every control that skips the claimed work misses its target, and every control's failure reason is the mechanism claims.json names. Provenance: `freeze=5ad1fcbf` resolves in the lane; seven of eight tree digests reproduce exactly from the script; the junk clone heads are absent from the lane by design. One defect found, minor and documentation-only: the c1-J4 tree digest is not byte-reproducible (it embeds two real live-session transcripts carrying session-bound fields), so README-receipts.md's blanket "the tree digest is reproducible from the script" overclaims for that one control; the recorded digest is honest and the control's verdict is unaffected.

## Per-control result

| Control | Claimed reading (claims.json / README) | Committed receipt | My re-run | Verdict |
|---|---|---|---|---|
| c1-J1-do-nothing | population 0, admitted 0, e1-entry-absent, exit 1 | matches claim | identical fields; rows `[]` | **reproduced** |
| c1-J2-docs-only | population 16, admitted 0, s1-source-row, exit 1 | matches | identical fields; all 16 rows reason=s1-source-row | **reproduced** |
| c1-J3-forgery-offline | population 16, admitted 16 (offline), exit 0 | matches | identical; all 16 rows admitted | **reproduced** |
| c1-J3-forgery-live | admitted 0, t3-binding (screenshot differs), exit 1 | matches | identical fields; all 16 rows t3-binding, detail "first screenshot differs from this counter's live session"; top-level binding identical | **reproduced** |
| c1-J4-counter-as-driver | admitted 0, t1-receipt (driver is the counter), exit 1 | matches | identical fields; all 16 rows t1-receipt, detail "driver absent, is this counter, or its sha256 differs" | **reproduced** |
| c2-J1-do-nothing | mismatches 18 (3 m4 + 15 m1), exit 1 | matches | identical `counted` (18 items), couldNotEvaluate 104, superseded 21; m4 items = SCORECARD.md:1473/1515/1576 inactive→active | **reproduced** |
| c2-J2-delete-words | mismatches 15, numstat 3/3 SCORECARD.md, exit 1 | matches | identical `counted` (15, m4 gone); numstat byte-identical (`3	3	SCORECARD.md`) | **reproduced** |
| c2-J3-uncited-correction | mismatches 18, exit 1 | matches | identical `counted` (18) | **reproduced** |
| c1-counter-selftest | cases=27 passed=27, exit 0 | — | byte-identical | **reproduced** |
| c2-counter-selftest | cases=41 passed=41, exit 0 | — | byte-identical | **reproduced** |

"Does every control that skips the claimed work miss the target?" — yes: J1/J2/J3-live/J4 and c2-J1/J2/J3 all miss their targets, and each misses for the claimed reason (e1 / s1 / t3 / t1 / 18 mismatches / deletion leg / uncited correction). c1-J3-offline is the one control that *passes*, and that is its claim: the offline leg alone admits a browserless forgery, which is why `--live` is part of the C1 predicate.

## Provenance

- `freeze=5ad1fcbfbae947e56ed448c7d24af0632b534e80` in all eight provenance files; resolves in the lane (`git rev-parse --verify 5ad1fcbf…^{commit}` OK; freeze tree `ffd7ce56d10a603500644956f30509e099e9d204` present — `git cat-file -e` OK). It is identical to the committed c1-J1/c2-J1 `clone_tree` and to my re-run's.
- Tree-digest reproduction (committed vs my re-run): J1 `ffd7ce56…` =, J2 `21c48a93…` =, J3 `51b5c583…` = (offline and live share one junk tree, same as committed), k1 `ffd7ce56…` =, k2 `4b873bef…` =, k3 `f1dc6fea…` = — 7/8 exact. c1-J4: committed `de1d7ae0…`, re-run `c9fe1e2d…` — **DIFF**.
- Junk `clone_head`s (151bc90d, cd75f98b, 93cb97ae, 4031cf52, 1d1533f0) do not resolve in the lane — `git cat-file -e` fails for each; README-receipts.md states this is by design (round-31 routed defect 5).
- Receipt↔provenance consistency: every committed receipt's `rev` equals its provenance `clone_head` (8/8), and same for my re-run (8/8). Recorded exits match the README table and my re-run (J3-offline 0, all others 1).

### Defect (minor, documentation): c1-J4 tree digest is not byte-reproducible

README-receipts.md says "the tree digest is reproducible from the script". True for the six deterministic junk trees (all reproduced above), false for c1-J4: its tree embeds two real `liveRecord` transcripts. I rebuilt the J4 tree twice with the frozen control's own code: trees `2827f24d…` and `32b77b19…` differ, and a leaf-field diff of the two `run1/transcript.jsonl` shows exactly 5 differing fields, all session-bound — `capabilities.chrome.userDataDir` (throwaway profile path), `goog:chromeOptions.debuggerAddress` (port), `goog:processID`, `capabilities.webSocketUrl`, `value.sessionId` (5 of 28 leaf fields). The first `captureScreenshot` bytes are **identical** across builds, so the evidence content the counter binds on (t3) is deterministic; only session metadata varies. The recorded digest is honest (it is the tree that was scored); only the README's reproducibility sentence overclaims for this one control. Suggested fix for the L1: scope the sentence to the six deterministic trees, or note c1-J4's tree is session-bound.

## Freeze integrity checks

- Commit graph (read-only): `2f8535c5` (counters landed) → `5ad1fcbf` (chromium TMPDIR fix before freeze) → `4181fffb` (claims + controls frozen before data); baseline `d805d1d6` is an ancestor of the freeze (`git merge-base --is-ancestor` OK ×3).
- `git show 5ad1fcbf:scripts/check-{bidi-runtime,selfassessment}.mjs` sha256 = `2f25af5a…` / `77b5c8ed…` = claims.json `frozenDigests` = `frozen-counter-sha256.txt` (byte-identical re-run); same digests at `4181fffb`. No counter change between counter-freeze and claims-freeze.
- Working tree: `git status --porcelain -- .ufo/waves/round-32/baseline/` empty; `git diff 4181fffb -- .ufo/waves/round-32/claims.json .ufo/waves/round-32/baseline/` empty (claims and controls I reviewed are the committed bytes).
- c2-J1 `counted` equals claims `beforeItems` exactly (18 items, same order and values; m1 tallies 17/22/22/30/13/17/20/22/30/30/30/30/30/17/30 → 41; m4 1473/1515/1576 inactive→active).
- m4 derivation spot-check at the freeze tree: the three statements exist (1473's sentence wraps onto 1474 — hence controls.sh sed line 1474; 1515 and 1576 inline); each round group carries all six axes ≥ 8 and `Saturation 8 / window 3`; last capability entries at round 25 (`First-working round: 22,23,24,24,25,25`) → window [N−3, N−1] empty for N∈{29,30,31} → derived `active`. AXES.md (fleet root) §The stagnation nudge says "at or above" — the counter's `allAtLine` uses `>=`. Consistent.
- s1 mechanics for c1-J2: `S005` (W3C BiDi WD) exists at baseline `d805d1d6` with `status=mined` but used-by the matrix, so the citation is neither new-at-baseline nor naming the entry → `s1-source-row` fires, as claimed. `S900` and `S123`–`S126` are absent from SOURCES.md at the freeze (grep no match).
- Counter `ROWS` = matrix §2's 17 rows in order (verified against the baseline matrix: Browser identity … User prompts; row 16 "Stop loading / nav-cancel" has "No navigation-stop command" — matching x2-no-counterpart); every matrix row's `locally measured` cell is `no`.

## Commands run (exit codes)

```
git clone -q --shared <lane> $S/clone-equivalents (controls.sh's own fresh()); controls.sh sets toplevel guard
HYAKU_SCRATCH=/fast/scratch/hyaku bash $S/controls.sh \
  5ad1fcbfbae947e56ed448c7d24af0632b534e80 d805d1d6132430118b206a848b85753ab35d1014 \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/RevControls/controls-rerun
  → "done", controls.sh exit=0 (wall ~103s)
```
Comparison commands: `jq` field/`counted`/per-row diffs committed-vs-rerun (all OK/IDENTICAL as tabled); `cmp -s` on selftest txt ×2, frozen-counter-sha256.txt, c2-J2 numstat (all byte-identical, exit 0); `git cat-file -e` resolution checks (freeze OK, junk heads absent as designed); node scripts for beforeItems↔counted (`identical (order+values): true`) and the J4 double-build field diff. Re-run receipts are committed at `.ufo/waves/round-32/w1/RevControls/controls-rerun/` (24 files). Tooling: nothing installed (env already had node 24.21.0, chromium/chromedriver 154.0.8037.97 — matching the claimed versions — jaq, git 2.56.0).

## Residual risk / verification gaps

- Live legs ran on this host only; cross-host determinism of the t3 screenshot binding is untested (C1 is scoped to "this host", so in-scope).
- I did not re-derive the 104 `couldNotEvaluate` / 21 `superseded` items (not counted fields; byte-stable across runs).
- c2-J2's sed targets line 1474 while the m4 finding anchors at 1473 (wrapped sentence) — works today, but a future rewrap above line 1473 would silently no-op the first sed. Frozen control, informational only.
- Browser hygiene: `pgrep -fa 'chromedriver|chromium'` after my runs shows 0 lines owned by my scratch paths (pre-existing lines belong to sibling seats, untouched). Scratch `/fast/scratch/hyaku/tabi-r32/RevControls` deleted after copying receipts.
