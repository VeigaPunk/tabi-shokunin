# tabi — round 68 (attempt 2)

Attempt 2 of this round. Attempt 1's L1 ended after its wave was dispatched (watchdog `lane-dead-no-report tabi round=68`, 08:10); its uncommitted outputs were inherited and re-verified here. Baseline (committed) `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`. Census start: `scripts/sources-census.sh validate --root <fleet-copy-of-HEAD> tabi` exit 0, 172 rows (A154 B9 C9; mined 147, queued 15, rejected 10). Census at worktree before S173 landed: exit 1 (E11 on S173 used-by, row staged without its lesson).

Axes at round start: adjacency 8 (lowest), coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8 / window 3; the window stood at position 0 after the round-67 capability, so no stagnation nudge.

## Gate

### Sources — new rows

- **S173** — Chromium 155.0.8059.84 Input domain PDL, `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT` (base64-decoded). Access date 2026-11-05 (fetched by this lane; the seat R68Scout independently re-opened the same tag). Staged `.ufo/waves/round-68/sources/Input.pdl`, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`, 336 lines; byte-identical to the r64 staged copy (`.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl`, same digest).
  - Located quote 1 (13 words, staged line 286): "Synthesizes a scroll gesture over a time period by issuing appropriate touch events." — grounds `teaches` (protocol operation, not trackpad/smooth-rendering guarantee).
  - Located quote 2 (4 words, staged line 303): "Prevent fling (default: true)." — grounds the fling-default row.
  - Tier A, kind `code`, scope limited to "experimental synthesizeScrollGesture parameters at this tag only; documentation-held, runtime unmeasured". Status `mined`, `used-by` the knowledge note and this lesson.
- Status / recheck / used-by changes (old → new): none on existing rows. S168 (same URL, different scope) is untouched.

### Admitted

- `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md` (cites S173): the `synthesizeScrollGesture` parameter set at this tag, decision table with line ranges, runtime qualifier. Line citations were checked against the staged bytes: 286–315 command block, 293–296 distance signs, 303–304 fling, 305–306 speed, 307–309 source type, 310–313 repeats; `dispatchMouseEvent` at 165 (mouseWheel 172, deltaX 201, deltaY 203) — corrected from "163–209" (see Mistakes M4).

### Rejected (kept as rows or notes, with flip conditions)

- "S173 supersedes S168" framing for the shared URL: rejected — S168 is not corrected; it is a second scope on the same file (Scout §5.1). Flip: a correction to S168 found at this tag.
- Runtime capability claim for `Input.synthesizeScrollGesture`: rejected — nothing executed it (`grep -rn synthesizeScrollGesture scripts/ .ufo/waves/round-67/` zero hits). Flip: a live run with a measured receipt.
- "No phase tokens anywhere in the protocol": not claimed. The negative is finite: `grep -ni phase .ufo/waves/round-68/sources/Input.pdl` exits 1 (no matches) at this tag only.
- Pending C1 worksheet rows as adjudications: rejected — the 49 rows are `pending-non-author` placeholders, not dispositions (Connector §1).

### Spot-check (discernment)

Owed to the non-author closure per LEARNING.md. This lane does not record a spot-check result for its own round. Admits and rejects above are listed so the closure can sample at least one of each.

### Sweep / negative sweeps

- `grep -rln synthesizeScrollGesture corpus/` at HEAD: returns only `corpus/SOURCES.md` (the S173 row is worktree-only) and a vendored Playwright `types/protocol.d.ts` under `corpus/evidence/round-13/`. No lane knowledge entry before this round.

## Claims — measured

Counting commands are frozen in the SCORECARD round-68 block and the wave controls directory.

| Claim | Axis | Before (do-nothing / pre-fix) | After | Verdict |
|---|---|---|---|---|
| C1 adjudication gate hardening (adjacency ledger worksheet) | adjacency (8) | pre-fix gate exits 0 on 4 red forgeries: lane self-adjudication `tabi-shokunin` (`controls/c1-forge-p5-prefix.json`), seat alias `TabiR68a2` (`controls/c1-forge-alias-prefix.json`), line-swapped quotes (`controls/c1-forge-p7-prefix.json`), degenerate quote `-` (`controls/c1-forge-pdeg-prefix.json`) | all four exit 1 with `adjudicator-author`, `adjudicator-author`, `quote-off-line` ×2, `quote-degenerate`; real 49 rows exit 0 (`controls/c1-real-postfix.json`: checked 49, pending 49, adjudicated 0); no-work (no worksheet) exit 1 `worksheet-missing` (`controls/c1-donothing.json`); selftest 20/20 (`controls/c1-selftest-postfix.json`) | VERIFIED on its frozen predicate. Axis contested: Connector reads the 49 pending rows as bookkeeping (no adjacency measure moves; `R68Connector.md`); the gate hardening reads as calibration of the adjudication gate. Score held 8. Not admitted pending the operator ruling (L0 `tabi | round-67` still open). |
| C2 instrument registry at SKILL.md (calibration) | calibration (9) | `scripts/check-instrument-registry-r68.mjs --skill <HEAD SKILL.md> --repo . --json` exit 1 `registry-section-missing` (`controls/c2-donothing-head.json`); `grep -c` of the seven paths at HEAD: 0 of 7 | exit 0, `findings []`, 7 expected (`controls/c2-after-worktree.json`); selftest 7/7; blob equality worktree = HEAD blob = r67 freeze blob for all seven, all regular files (`controls/c2-blob-equality.txt`); canonical gate rows for the two r68 gates (`check-gate-registry`) | VERIFIED on its frozen predicate. Score held 9. Gate defects routed (see Attack). |
| C3 docs-held `synthesizeScrollGesture` entry bound to S173 (coverage) | coverage (9) | no lane knowledge entry on this surface (HEAD grep above); counter on an empty entry exits 2 `no-work` (`controls/c3-donothing.json`) | counter `.ufo/waves/round-68/w1/R68Exec3/check-c3-synthscroll-r68.mjs` exits 0, verdict clean, 8/8 checks (`controls/c3-verify.json`); selftest 9/9 (`controls/c3-selftest.json`) | VERIFIED on the counter's predicate (source-bound, not presence). Score held 9. Not a capability; no SCORECARD capability row. |

Expansion: knowledge +1 (`knowledge/chromium-scroll-gesture-protocol-round-68.md`, S173); registry 172 → 173 (census exit 0 at HEAD and at the worktree after the lesson).

## Mistakes

| # | Class | Evidence | Captured by | Fix |
|---|---|---|---|---|
| M1 | landing | Attempt 1's L1 ended after its wave dispatched; `w1.ready` carried `l1: TabiR68`, the dead id. Settlement reached this attempt only through the orchestrator's WAVE-DONE; `w1-results.json` records every seat with `output: null` ("kernel restarted mid-wave"). | none | Reconciled from the twelve seat reports (R68Mut1 has receipts but no report; see Wave). Future ready files need a live L1 id. |
| M2 | `argv` / CLI | Both new gates rejected their documented `--json` flag: `parseArgs` treats a valueless trailing flag as missing (exit 2, `missing --skill` / usage). Evidence `controls/argv-json-before-after.txt`. | none (a selftest never passes `--json`) | `json` accepted as a boolean flag in both gates; post-fix runs above. |
| M3 | generator | The committed `corpus/adjacency-adjudication-r68.tsv` had `-` in every quote cell (the generator read ledger column r[5]; the quote is r[6]). Pre-fix gate: 49 `quote-mismatch` (`R68Exec1`/`controls/c1-red-quote-column.json`). | gate quote-mismatch (caught on first run) | generator reads r[6]; regenerated worksheet byte-identical to R68Exec1's independent regeneration (`cmp`). |
| M4 | gate: self-adjudication | P5 (`tabi-shokunin`) and the seat alias `TabiR68a2` both passed the pre-fix gate with rc 0 (`controls/c1-forge-p5-prefix.json`, `c1-forge-alias-prefix.json`). The check was a literal `tabi` match. | none (selftest exercised only the literal `tabi`) | `isLaneIdentity` matches any identity carrying the lane name; selftest cases for both forms; post-fix rc 1. |
| M5 | gate: line binding | P7: quotes of two same-file rows swapped at the line level (ledger and worksheet both re-pinned) passed with rc 0 (`controls/c1-forge-p7-prefix.json`); the gate used `fileContent.includes(quote)`, never the cited line. | none | quote must be on line N of the cited path; `quote-off-line` distinguished from `quote-unresolved`; real 49 rows remain exact on their lines (positive control). |
| M6 | gate: degenerate quote / verdict polarity | PDEG (`-` quote, ledger and worksheet matched) passed rc 0; verdict cell unchecked against status (`R68Review1` M3). | none | `quote-degenerate` (`-` or under 8 characters); `verdict-status-mismatch`; selftest cases; post-fix rc 1. |
| M7 | knowledge citation | The note cited `dispatchMouseEvent` at "lines 163–209"; measured: the command is at line 165 (`sed`/`grep -n` on the staged bytes), and the range should start there. | none (no gate checks knowledge line ranges; the C3 counter's anchor-range check was not run on the pre-edit note) | corrected to 165–209 with the exact sub-line anchors (command 165, mouseWheel 172, deltaX 201, deltaY 203). |
| M8 | registry shape | My first C2 draft used a seven-column instrument table; the lane's canonical gate-registry checker (`scripts/check-gate-registry.mjs`) requires the eight-field shape and a gate-kind row for every `scripts/check-*.mjs`. Both new gates would have been `e1-missing-row`. | check-gate-registry (canonical) | the seven-column instrument section kept (it satisfies the r67 routed defect) and canonical gate rows added for both new gates. |
| M9 | census timing | The census at the worktree after staging S173 exits 1 (E11, used-by lesson absent). Start census must be read at HEAD. | census E11 | lesson landed in the same commit as the row; census start and end recorded at HEAD and worktree. |
| M10 | carried defect (r67 spot-check) | Routed item 1: the SKILL registry lacked the r67 instruments (0 of 7 registered). Routed item 3: the S172 quote word count (13 vs 14 recorded). | r67 spot-check only; no gate | item 1 fixed by C2. Item 3: the S172 quote is 13 words per the spot-check's recount; the r67 record stands as filed and this lesson names the correction. Item 2 (`frozenAt: pending-commit`): this round's claims record names the freeze commit explicitly. |

## Attack (wave w1: 12 seats; reports `.ufo/waves/round-68/w1/`)

- C1 gate (`R68Review1`, `R68Mut1`, `R68Exec1`, `R68Sentinel`): the pre-fix gate also accepted an arbitrary adjudicator label and a seat-alias identity (fixed), an unchecked verdict (fixed), and quotes off their lines (fixed). Still open and routed: the pending-count assertion and six extra wedges survive the shipped selftest (`R68Review1` §Mutant selftest deltas); mutant kills (`R68Mut1`: 8 of 10 killed, `M5b` dead clause survived and was removed, `M8` pending-count survived) were measured on the pre-hardening gate and are not re-run on the final gate.
- C2 gate (`R68Review2`, `R68Mut2`): ten findings, including string-exact duplicate detection on the instrument cell only, unanchored first-match sha extraction, substring-only `entry` binding, token-level selftest, silently dropped malformed rows, exact-string section detection. `R68Mut2`: 11 of 11 mutants killed overall, only 2 of 11 by the internal selftest; the rest only through the public parser. Routed as the next calibration claim; C2 is verified on its public predicate, not on the gate's own strength.
- C2 and C3 entries (`R68Sentinel`): no executed symlink or path-escape exploit found in the new gates; the symlink hole in C2's `readFileSync`-based hashing is routed (the blob-equality receipt above covers today's bytes).
- Lane-local `scripts/check-sources.mjs` (`R68Scout` §5.1, `R68Critic`, `R68Exec3`): S173 shares its URL with S168 and is refused as E04 by the lane gate (the lane gate requires a `supersedes` prefix). The fleet census (`CORPUS.md` contract v1) treats the same pair as W04 (cross-scope, warning) and exits 0. The lane gate was already red at base for S171/S172 (pre-existing debt). I did not add a `supersedes` prefix: that asserts a supersession that is false. Authority for round-end conformance is the fleet census; the disagreement is routed.

## Criteria added this round

- QUALITY 126 — a lane-authored or seat-alias adjudicator is refused by identity, not by a literal name (M4).
- QUALITY 127 — a quote binds to the cited line, not to anywhere in the file (M5).
- QUALITY 128 — a degenerate quote and a verdict that disagrees with its status are findings (M6).
- QUALITY 129 — every new `scripts/check-*.mjs` gate has a canonical gate-kind registry row in the same round (M8).

## Frontier and limits

- Operator ruling still owed on the adjacency axis (L0 `tabi | round-67`, unanswered). This round's C1 is declared on adjacency with its dissent recorded; the round is not admitted until ruled.
- Next-round candidates from the attack: the C2 gate's ten defects (calibration); the C1 selftest gaps (pending count, six wedges); the symlink hole; the lane-local `check-sources.mjs` scope-aware duplicate rule.
- Runtime residuals for `Input.synthesizeScrollGesture`: delivery, fling contrast, source-type effects, overscroll, repeats, trackpad phases, smooth rendering — all unmeasured.
- Assimilation: none. The round-57 quarantine register shift still blocks package adoption; the 38 hand-checked rows stand from round 62; `considerthese/` is absent for this lane.

## Wave and disposition

- ONE v1 wave `w1`, 12 seats: scout 1, connector 1, executor 3, scribe 1, reviewer 2, critic 1, mutation-tester 2, sentinel 1. Attack seats 6/12 (50 %). The L1 holds the planner seat (validator forbids `planner`).
- Settlement: `w1-results.json` (WAVE-DONE from the orchestrator); every seat's `output` is null by the orchestrator's kernel restart, so the seat reports in `w1/<seat>.md` are the record. Eleven seats wrote reports. R68Mut1 wrote receipts (`w1/R68Mut1/receipts/index.json`) without a report; its receipts are cited as-is and it is recorded as settled-without-report, not as dead.
- Two parked seats (Connector, Critic, Scribe) were revived by message to deliver their reports; the Scribe's draft is not used for claims (it labels its evidence as unavailable where it could not reproduce).
- No residual call. No dead seat replaced.
