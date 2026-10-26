# MutC1Counter — C1 counter mutation test (round-33 w1)

## Verdict

The frozen C1 counter `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` (sha256 `da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`, byte-identical at freeze commit e6b0a90, in the lane worktree, and in `claims.json.frozenDigests`) was probed with 15 single-point mutants against the four committed C1 controls (J1 do-nothing, J2 screen-all, J3 junk-rows, J4 mislabel-unnamed), each rebuilt in a disposable scratch clone exactly per `baseline/controls.mjs`. The pristine counter reproduces all four committed receipts field-for-field (and tree-for-tree on J1/J2/J4; J3 differs only because its construction cites siblings' live `refs/heads/master`, which moved after the committed run — souji `a7c35c2`→`756d77f` at 15:26 per reflog — while all scored fields still match). **5 mutants killed, 10 survived.** Predicate-flipping kills: M02 (baseline-row newness check dropped — J2 flips to predicate **true** with the five old rows counted as new) and M09 (NEW_TARGET 4→0 — J2 flips true). Measure-level kills: M01 (naming rule dropped — J4 newMapped 0→4), M05 (candidate-side trim dropped — mapped 5→4 on real bytes, so edge whitespace exists in sibling PROVINCEs), M08 (regex word-boundary loss — candidates 52→60). The 10 survivors are coverage limits of the four-control battery, disclosed below, not defects of the counter or the claim: every survivor passes because the controls only exercise valid screens, an empty findings set, and newMapped 0, so screen-vocabulary, flagged-row, header/duplicate/quote-strictness, same-surface, threshold-positive-side, and two predicate-conjunct mutants are invisible to them. The lane counter was never modified; all work happened on scratch copies (disposable per tasking); scratch has been deleted.

## Kill criterion

A mutant is **killed** iff, on ≥ 1 of the four rebuilt controls, any field recorded in the committed receipts differs: `exit`, `predicate`, `candidates`, `mapped`, `screened`, `unaccounted`, `newMapped`, `adjacency.verdict`, `adjacency.findings`, `screenFindings`. `predicateFlip` names the stronger case (exit 1→0). An exit-2/crash would be inconclusive; none occurred (0 non-empty stderr files across 64 counter runs).

## Mutants and verdicts

Mutation points are `file:line` in the pristine counter; mutant sha256s in `MutC1Counter/manifest.json`.

| Tag | Mutation (line) | Verdict | Killed by / evidence |
|---|---|---|---|
| M01-naming-rule-drop | disposition/naming block → `return true` (220) | **killed** | J4 `newMapped` 0→4 (predicate stays false, unaccounted 43≠0) — a counter that counts unnamed split-declared rows inflates the claimed measure |
| M02-baseKeys-drop | drop `if (baseKeys.has(...)) return false` (218) | **killed** | **J2 predicate false→true (exit 1→0), newMapped 0→5**: rows 2,5,6,7,8 (kaidoku ruled, revenger contested-open, kake split-declared+`tabi`, kake/kagi contested-open) all count as new; also J1/J3/J4 newMapped 0→5 |
| M03-target-gt | `>=` → `>` on NEW_TARGET (239) | survived | no control reaches newMapped near 4; positive side of the threshold untested (would mis-kill a genuinely good round, errs conservative) |
| M04-same-surface-drop | same-surface `verifiedSurfaces` check dropped (203) | survived | no control screens with reason `same-surface`; surfaces pointing at unmapped rows accepted |
| M05-trim-drop | `c.text.trim()` → `c.text` in mapped key (212) | **killed** | all four: J1 mapped 5→4 / unaccounted 47→48, J4 mapped 9→7 — trim is load-bearing on real sibling bytes |
| M06-any-screen-reason | `SCREEN_REASONS.includes(reason)` → `reason !== ''` (201) | survived | J2 uses a valid reason; arbitrary screen reasons accepted |
| M07-ignore-flagged | `verifiedRows = mapNow` (gate.flagged ignored) (174) | survived | all four controls run with `adjacency.findings = 0`; flagged rows counted as verified is invisible |
| M08-regex-boundary-loss | `\b` pair dropped from candidate REGEX (65) | **killed** | all four: candidates 52→60 (8 substring matches admitted); predicate unchanged (unaccounted still >0) — killed at receipt level |
| M09-target-zero | `NEW_TARGET = 4` → `0` (64) | **killed** | **J2 predicate false→true (exit 1→0)** — the screen-all control guards the target's lower side |
| M10-predicate-unaccounted-drop | drop `unaccounted == 0` conjunct (239) | survived | all controls fail via newMapped 0 anyway |
| M11-predicate-clean-drop | drop `verdict === 'clean'` conjunct (239) | survived | same; verdict conjunct untested |
| M12-screen-quote-weaken | verbatim-substring requirement dropped (202) | survived | J2 quotes are genuine substrings; fabricated-but-well-shaped quotes accepted |
| M13-duplicate-screen-drop | duplicate sibling_ref accepted (206) | survived | J2 keys are unique |
| M14-header-check-drop | header mismatch never reported (189) | survived | J2 writes the exact header |
| M15-naming-boundary-loss | `\b` dropped inside naming rule (222) | survived | J4 quotes contain no `tabi` substring at all; boundary strictness untested (e.g. `tabi` inside a longer word would count) |

**Survivors = coverage limits to disclose**: the four controls never exercise (a) a screen ledger row that violates vocabulary/header/quote/duplicate/same-surface rules (M04, M06, M12, M13, M14), (b) a check-adjacency finding (M07), (c) a satisfied newMapped threshold (M03), or (d) predicate conjuncts other than newMapped on the false side (M10, M11), nor naming-rule boundary strictness (M15). These paths are guarded by the C1 predicate evaluated at REV (unaccounted 0 with clean verdict forces the map/screen to be real) and by wave-2 semantic review, not by the control battery. No changes made — disclosure only.

## Evidence (commands, exit codes)

Scratch `S=/fast/scratch/hyaku/tabi-r33/MutC1Counter`, `TMPDIR=$S/tmp` (under `/fast/scratch/hyaku/tabi-r33/`, as `controls.mjs` requires). Counter runs used the disposable shared clone built per control (`git clone -q --shared --no-checkout` from the lane, toplevel verified, commits as `user.name=MutC1Counter <MutC1Counter@scratch.local>`, reset to BASELINE `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd` between controls; J1 scored at BASELINE in the clone, tree `c7999ee70b63…` = committed lane tree).

```
node gen.mjs                                   # exit 0 — 15/15 old-strings matched exactly once
sha256sum lane counter / pristine copy         # da59d157… both, also at e6b0a90 via git show
TMPDIR=$S/tmp node mut-controls.mjs pristine/c1-adjacency-sweep.mjs PRISTINE results/PRISTINE   # exit 0
for m in mutants/*.mjs; do TMPDIR=$S/tmp node mut-controls.mjs "$m" "$(basename $m .mjs)" "results/$(basename $m .mjs)"; done   # 15/15 exit 0, no RUN_FAIL
node compare.mjs > results/VERDICTS.json       # exit 0
# post-run: 0 non-empty .run.err; 0 non-empty J*.stderr; 0 files left in $S/tmp
# after-hashes: lane counter da59d157… (unchanged), pristine da59d157… (unchanged),
#               all 15 mutant sha256s match manifest.json (verified again in the output dir)
pgrep -fa 'chromedriver|chromium'              # only earlyoom (its --prefer arg mentions chromium); none owned by me
```

Per-run receipts (J1–J4 `.json`/`.stderr`/`.provenance`, `summary.json`, `candidates.tsv`), `VERDICTS.json`, the 15 mutant sources, and all harness scripts are in the output dir below.

## Restoration evidence

Mutants lived only in scratch; the lane was read-only throughout (`git show`/`rev-parse` only). Lane counter sha256 `da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380` before and after all runs — unchanged. Scratch tree deleted after receipts were copied; no chromedriver/chromium was started.

## Tooling record

No tools installed or upgraded (node v24.21.0, git 2.56.0 already present; no network fetches).

## Deliverable paths

All relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin/`:

- `.ufo/waves/round-33/w1/MutC1Counter.md` — this report
- `.ufo/waves/round-33/w1/MutC1Counter/VERDICTS.json` — machine-readable verdicts incl. pristine reproduction
- `.ufo/waves/round-33/w1/MutC1Counter/manifest.json` — 15 mutation points with line numbers + sha256s
- `.ufo/waves/round-33/w1/MutC1Counter/results/<PRISTINE|M01…M15>/` — per-control receipts and summaries
- `.ufo/waves/round-33/w1/MutC1Counter/{gen.mjs,pairs.json,mut-controls.mjs,compare.mjs}` — harness
- `.ufo/waves/round-33/w1/MutC1Counter/mutants/` — mutant sources
