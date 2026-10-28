# ScriCapabilityRow — SCORECARD round-42 section draft

Lane: tabi · round 42 · wave w1 · seat `ScriCapabilityRow` (scribe, leaf).
Milestone: scorecard section draft. Judged on: calibration.
Scratch: `/fast/scratch/hyaku/tabi-r42/ScriCapabilityRow/` — created, used, deleted
(`test -d … && echo SCRATCH_REMAINS || echo SCRATCH_DELETED` → `SCRATCH_DELETED`).

## Behavior

Drafted the landing-ready Round 42 SCORECARD section at
`.ufo/waves/round-42/w1/ScriCapabilityRow/scorecard-round42-draft.md`
(203 lines, 16,869 B). **No `SCORECARD.md` byte was written.** The file carries:

1. a contract-field map (axes / capabilities / planned / saturation / retired)
   against `AXES.md` §SCORECARD.md contract and §Capabilities;
2. `## Round 42 — declared claims (frozen before data)` — the six-axis
   `Axes at round start:` line (`depth 9, coverage 9, operability 9, freshness 9,
   calibration 9, adjacency 8`), `Saturation 8 / window 3`, the nudge derivation
   with rule + inputs (QUALITY 83), the C1/C2 table (frozen counting command,
   before-state quoted from `claims.json` plus its observed control, target), and
   each claim's predicate and kill rule as verbatim blockquotes;
3. `### C1/C2 — frozen-before-data live state` — the measured values split out as
   measurement, explicitly not admission;
4. `## Round 42 — waves and seats` — empty block with fill slots only (dispatch
   counts are labelled queue, not result; settled seats/roles/dead/WAVE-DONE are
   `PENDING`);
5. `## Round 42 — capabilities / planned / saturation / retired`;
6. `## Round 42 — trend verdicts` — three `PENDING (L1 after WAVE-DONE)`
   placeholders, with the discernment note that dispatched seats do not qualify;
7. `## Findings routed while drafting` (F1–F3);
8. the capability row for `playwright-firefox-loopback-tcp` **only inside an
   HTML comment**, with receipt/witness paths, counter digest, control paths and
   last cell `42`, plus uncomment instructions bound to the full C1 predicate.

## Commands run (exact) and observed outputs

Worktree: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only for this seat).

- `python3 - <<'PY' … json.load('.ufo/waves/round-42/claims.json') …` (printed each
  claim's `title/countingCommand/beforeState/predicate/killRule/admission`) —
  supplied the frozen text quoted in the draft.
- `git status --porcelain -- corpus/evidence/round42 .ufo/waves/round-42/measure .ufo/waves/round-42/controls .ufo/waves/round-42/counters`
  → `?? corpus/evidence/round42/` (the live receipt/witness are **uncommitted**).
- `git ls-tree -r --name-only HEAD -- corpus/evidence/round42 | wc -l` → `0`.
- `cat .ufo/waves/round-42/controls/c1-baseline-tree-count.txt` → `0` + the
  `git ls-tree … 34e17795… -- corpus/evidence/round42 | wc -l → 0` command line.
- `cat .ufo/waves/round-42/controls/c1-r41-replay-refused.exit` → `R41_REPLAY_EXIT=1`;
  the JSON records `"predicate": false`, findings `run-nonce-mismatch`,
  `witness-nonce-mismatch`.
- `cat .ufo/waves/round-42/controls/c2-baseline-red.exit` → `predicate False` +
  7 finding ids; `.json` → `"findingCount": 7`, `r1a-receipt-absent`,
  `r1b-witness-absent`, `r2-s146-not-rejected`, `r2-supersession-absent`,
  `r3-baseline-file-empty`, `r4-slice-absent`, `r4-quarantine-absent`.
- `cat .ufo/waves/round-42/controls/c2-at-freeze.json` → rev `9b6de3a1…`,
  `"predicate": false`, `"findingCount": 1`, `r4-quarantine-absent`;
  `c2-at-freeze.exit` → `C2_AT_FREEZE_EXIT=1`.
- `cat .ufo/waves/round-42/controls/c1-battery-r42.json` → 6 cases, all
  `pass:true` (forger-r39-verbatim, forger-r41-retargeted, node-path, ld-preload,
  esm-loader exit 2 `environment-loader-contamination`; clean exit 0);
  `c1-battery-r42.exit` → `BATTERY_EXIT=0`.
- `cat .ufo/waves/round-42/controls/c1-r39-replay-r42.exit` →
  `R39_REPLAY_EXIT=1`; `…-r40-replay-r42.exit` → `R40_REPLAY_EXIT=1`.
- `cat .ufo/waves/round-42/measure/c1-measure.json` → `driverExit` 0,
  `counterExit` 0, `counter.predicate` true, `counter.findings` `[]`,
  `nonceMatches` true, `receiptSha256 39844552…7b7e`,
  `witnessSha256 163f4eba…d339`; `c1-measure.exit` → `MEASURE_EXIT=0`.
- Receipt inspection (`corpus/evidence/round42/playwright-egress/receipt.json`):
  runs 0/1 → `sampleCount` 126/134, first-to-last sample span 16,356 ms /
  17,790 ms, identical `firstShotSha256 252cafa6…be12`, `browserVersion 157.0`,
  `egressNonLoopback 0`, `survivors 0`, `portClosed:true`.
- `wc -l .ufo/waves/round-42/quarantine/slice-ids.txt` → `38`;
  `ls .ufo/waves/round-42/quarantine/re-adjudication.tsv` → `No such file or
  directory`; `git ls-tree -r --name-only HEAD -- .ufo/waves/round-42/quarantine/`
  → the build script + 3 slice files, no TSV.
- `git cat-file -e 9b6de3a1…:corpus/evidence/round41/playwright-egress/receipt.json`
  (and `receipt.witness.json`, `.ufo/waves/round-41/controls/c1-baseline-noop.out`)
  → all present at the freeze (exit 0 each), matching `c2-at-freeze.json`'s single
  r4 finding.
- `node scripts/check-selfassessment.mjs --rev HEAD --json` → **exit 1**;
  234 findings (143 `m1-selftest-tally`, 77 `m2-receipt-exit`, 13
  `m4-nudge-state`, 1 `m3-unlanded-paths`), `couldNotEvaluate` 117, `superseded`
  48; counted `m3-unlanded-paths observed: 530`; **no finding has `round: 42`**
  (the existing round-42 block states no nudge state, so m4 reads it as unread,
  not mismatched). Evidence: `evidence/selfassess-head-rev.json`.
- Instrument-input check with the checker's own `capabilityRounds()` source
  extracted from `scripts/check-selfassessment.mjs`:
  `scorecard capabilityRounds: [1,13,16,17,22,23,24,25,32,35]`;
  `draft capabilityRounds: []` (evidence/capability-rounds.txt). Consequence:
  no capability entered in rounds 39–41 → the nudge for round 42 is **active**,
  which is what the draft states; and the commented pending row does **not**
  register round 42 as an entry (`capabilityRounds()` does not strip HTML
  comments or fences).
- Verbatim check (python, whitespace-normalised substring match of the draft
  against `claims.json`): `C1 predicate VERBATIM`, `C1 killRule VERBATIM`,
  `C1 beforeState VERBATIM`, `C2 predicate VERBATIM`, `C2 killRule VERBATIM`,
  `C2 beforeState VERBATIM`. (First pass reported MISMATCH for both
  `beforeState` quotes because the draft had added inline backticks inside the
  frozen sentence; both cells were edited to the exact sentence and re-checked.)

## Gates / evidence

- `check-selfassessment` at `HEAD` is red (exit 1) with **no round-42 finding**;
  the red classes are pre-existing and not produced by this seat (this seat wrote
  nothing under `SCORECARD.md`/`LOG.md`/`scripts/`).
- The draft's own claims are all `pending` in this report: C1 lacks committed
  receipt bytes and a settled wave; C2 lacks the r4 TSV. No claim, axis score or
  capability row is asserted as admitted.

## Touched surfaces

- `tabi-shokunin/.ufo/waves/round-42/w1/ScriCapabilityRow/scorecard-round42-draft.md` (new)
- `tabi-shokunin/.ufo/waves/round-42/w1/ScriCapabilityRow/report.md` (new)
- `tabi-shokunin/.ufo/waves/round-42/w1/ScriCapabilityRow.md` (new; Report-trailer path)
- `tabi-shokunin/.ufo/waves/round-42/w1/ScriCapabilityRow/evidence/selfassess-head-rev.json` (new)
- `tabi-shokunin/.ufo/waves/round-42/w1/ScriCapabilityRow/evidence/capability-rounds.txt` (new)

No other file was written anywhere; production tree, fleet repo, sibling repos and
shokuknow were read-only. No git/jj mutation, no commit, push or fetch.
`SCORECARD.md` not opened for writing.

## Out of scope (not done, by instruction)

- `SCORECARD.md` was not edited (draft only).
- Wave settlement, `w1-results.json`, WAVE-DONE, dead-seat tally, trend verdicts,
  final measured revision and the actual uncommenting are L1's after-wave work.
- No re-run of the C1 measure, the battery, the replays or the C2 checker: their
  committed outputs were read, not regenerated (the C1 live run is L1's frozen
  counting command).

## Findings (routed, frozen bytes not amended)

- **F1** `claims.json:C2.beforeState` enumerates five findings; the committed red
  control `controls/c2-baseline-red.json` records **seven**
  (`r2-s146-not-rejected`, `r4-slice-absent` omitted from the sentence). The draft
  quotes the frozen sentence verbatim and states the control's seven beside it.
- **F2** The currently landed `SCORECARD.md` round-42 block puts a measured live
  outcome ("measured 2026-10-28: exit 0, spans 16,356/17,790 ms") inside the C1
  *declared target* cell. The draft moves it to a labelled
  frozen-before-data live-state block that changes no verdict.
- **F3** The global `## Capabilities` table (`SCORECARD.md:381-387`) still reads
  "— none yet —" although per-round tables carry rows (rounds 16, 17, 25, 32, 35).
  A reader of that table alone derives "no capability ever", which is the nudge
  input. Not fixed (append-only, draft only); routed to L1.

## Tool installs

None. No pacman transaction was run (host rule), no `uv tool` install, no binary
download.

## Limitations

- The draft is text for L1 to splice; line numbers in `SCORECARD.md` will shift on
  landing (only `:381-387` is cited as a pre-splice pointer).
- The commented row's last cell `42` is the intended first-working round; if L1
  lands the row in a per-round `### Capabilities — round 42` table (round-32/35
  practice) the nudge window restarts there. Placement is L1's decision.
- `m4-nudge-state` will read the spliced round-42 group only if the
  `Axes at round start:` and `Saturation 8 / window 3` lines land together with a
  nudge statement; the draft supplies all three, so a splice that drops one line
  would degrade the group to could-not-evaluate rather than mismatch.

VERDICT ok — Round 42 SCORECARD section draft written (declared C1/C2 table with
verbatim frozen text, empty waves block, PENDING trend verdicts, commented
capability row that the nudge parser does not count); corpus pending, three
findings routed; nothing admitted, no score changed.
