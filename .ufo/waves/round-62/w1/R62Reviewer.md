# R62Reviewer — C1 frozen-instrument adversarial review

Axes: adjacency; supporting calibration and depth. Recommendation only, not outside admission. Freeze: `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`; baseline: `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`.

## Findings, severity first

### High — contradictory delta duplicate keys remain counter-green

Frozen `.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs:162-174` indexes the first lane/line row for each key without producing a duplicate finding; lines 238-264 subsequently check whether extra line rows refer to real hits, not whether their disposition conflicts. The emitted predicate explicitly promises “no duplicate keys” (line 14 and emitted predicateSentence).

Proof on the actual R62Exec1 candidate: append one additional kaidoku hit row with the same key/quote as an existing `contested-open` row, but disposition `overlap-declared`. The frozen meter still exits **0**, predicate **true**, findingCount **0**. The unmodified real candidate is also green. Receipts: `R62Reviewer/real-candidate-meter.json`, `R62Reviewer/real-conflicting-meter.json`; exact appended row: `R62Reviewer/real-candidate-review.json`; full conflicting input: `R62Reviewer/real-conflicting-delta.tsv`. This admits mutually inconsistent dispositions on an unanswered overlap. It does NOT mean the real candidate contains this forgery: it demonstrates the frozen guarantee is unenforced. Audit-key duplicate rejection exists and its selftest passes; that does not cover delta keys.

### Medium — evidence-free blanket dispositions satisfy the 119→0 gate

Frozen `counters/rebind-r62.mjs:240-248` consumes only lane/path/quote/disposition from adjudications; it neither requires nor checks a basis. Lines 276-283 choose that label and emit the line row. The counter verifies whole-line text and vocabulary, not an adjudication's evidence or unresolved-overlap preservation.

Proof: construct 119 adjudications straight from the no-work unresolved list, assign **all 119 `overlap-declared`**, supply **no basis**, and run the frozen rebind at the freeze revision. Rebind exits **0**, unresolved disappears, preflight findings **0**; frozen meter over its explicit candidate files exits **0**, predicate **true**, findings **0**. This includes 37 uncertain kaidoku lines whose overlap must remain open. Receipts: `R62Reviewer/fabricated-rebind.json`, `R62Reviewer/fabricated-meter.json`, `R62Reviewer/fabricated-adjudications.json` and `R62Reviewer/fabricated-delta.tsv`.

This is a certification/semantic-integrity gap, not evidence that the real author fabricated anything. A literal no-work rerun is correctly refused; **label-only work is sufficient for green**. Green therefore does not independently certify “evidence-backed” classification or unresolved L0 preservation. No frozen instrument was repaired.

## Assigned controls and positive checks

Each JSON command receipt below records full argv, absolute cwd, exit, stdout and stderr. Commands ran from this seat's exact scratch directory. Control output/scratch arguments were redirected to this seat; baseline, fleet and snapshot inputs were unchanged.

| Receipt under `R62Reviewer/` | Observed result |
|---|---|
| `rebind-no-work.json` | exit 3; exactly 119 unresolved; no ledger emitted |
| `v20-baseline.json` | exit 1; predicate false; 206 findings; missing r61 ledgers |
| `v21-selftest.json` | exit 0; 44/44; allPass true; guarded host fixtures cleaned by counter |
| `v21-freeze.json` | exit 1; predicate false; 206 findings; no committed r62 ledgers at freeze |
| `real-candidate-meter.json` | exit 0; predicate true; 0 findings, using explicit candidate inputs, NOT scored committed after-pass |
| `strict-real-header-red.json` | exit 2; copy of real 20-head snapshot with blank second header cell refused |
| `missing-snapshot.json` | exit 2; required snapshot refused when omitted |

Real frozen header bytes are exactly `lane\thead`; snapshot has 20 data rows. Strict real-header green is the real-candidate-meter run with the untouched frozen snapshot. Selftest independently exercises blank-header refusal and strict-header green.

## Snapshot source of truth and drift

All **20/20 pinned heads resolve as commits**, each tested with `git -C FLEET/LANE cat-file -e HEAD^{commit}`; exits and exact heads/argv retained in `R62Reviewer/heads.json`. Five current sibling heads differed at observation: **kaidoku, kama, kotodama, souji, tameshi**. Full snapshot/live identities are retained; the green meter outputs disclose five drift entries.

Source review: v21 `makeSibRefGit` (lines 301-310) uses `cat-file -p SNAPSHOT_HEAD:path`; `runAt` (lines 341-367) loads map/default ledgers at the explicit lane REV and passes snapshot heads into `headOf`. `discloseDrift` (lines 291-299) reads live HEAD separately; drift is not added to findings. The host selftest's moved-sibling case confirms green with changed live bytes and nonempty drift. Rebind likewise reads pinned heads, not live/worktree content. Its duplicated BG_WORDS/DISPOSITIONS are compared to the imported meter's source literals (`rebind-r62.mjs:34-44`); both full files also match frozen SHA256 pins. No source-of-truth drift observed in the six pins.

## Real candidate and honest boundary

R62Exec1's candidate contains **119 explicit adjudications: 74 no-tabi-ground, 45 contested-open; all 37 newly classified kaidoku hits contested-open**. All 119 have nonempty basis fields. All eight context-input file hashes were independently rederived using their pinned heads; results retained in `R62Reviewer/real-candidate-review.json`. Selected basis/context entries were read directly; no claim is made that a counter validates the prose reasoning. The candidate ledger comprises 149 hit rows over 25 present mapped-surface files and 20 lanes, including carried classifications.

Claim wording is appropriately bounded: **PROVINCE plus map-referenced files, not full wide Markdown coverage**. The screen-target construction at v21 lines 135-143 matches that boundary. A keyword-screened, dispositioned surface is not proof that every possible browser-ground concept or Markdown file is covered. Unanswered kaidoku/keyup L0s remain unanswered; neither actual candidate review nor this report settles them.

## Exact instrument pins

Every following SHA256 matches BOTH frozen git bytes and worktree bytes; all corresponding `git show` reads exited 0. Machine evidence: `R62Reviewer/pins.json`.

| Path | SHA256 |
|---|---|
| `scripts/gen-adjacency-snapshot-r62.mjs` | `5c4a93e1ace85aaaf8f106b6201c304cb5b5b92405c5cb8a1bc492281ae776ca` |
| `scripts/chrome-cdp-loopback-round62.mjs` | `8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0` |
| `.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs` | `b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6` |
| `.ufo/waves/round-62/counters/rebind-r62.mjs` | `b627cc8be99b4813b1d2578179b5b4eb80bfe20f2dab775edd530c264374f14f` |
| `.ufo/waves/round-62/counters/chromium-receipt-r62.mjs` | `971c84f602f6d79b9aa12f9872eba57463a938b425546f793c4b5df72bd5a006` |
| `.ufo/waves/round-62/c1/snapshot-r62.tsv` | `1e47eb02b0387393f87c501d16a196a2802ed6d75d8906d23b36970f23dedae4` |

## Residual risk and verification gaps

- No committed post-wave data REV was supplied during this review. Explicit candidate green is not the promised committed after-pass. Freeze remains red, as expected. Integration must evaluate the final committed revision without transferring pins.
- This seat has not rerun the other seats' targeted M1–M5 mutation battery and does not assert mutant kill success from selftest alone.
- LSP device unavailable (`xd://lsp` returned “No such tool”); references/definition/diagnostics could not run. Source references here are textual inspection and executable receipts, not semantic LSP proof.
- Lane HEAD initially equalled freeze; pre-existing working-tree changes included SKILL, QUALITY, SOURCES and wave outputs. They were not treated as scored committed data. No edits to those paths, instruments, snapshot, fleet or sibling artifacts were made.
- No browser, clone, external runtime, installation, production edit, or VCS mutation was performed by this reviewer. Only explicitly assigned checks and scratch data were executed. The prescribed v21 selftest owns its guarded R62V21Selftest temporary directories.

Report: `.ufo/waves/round-62/w1/R62Reviewer.md`
