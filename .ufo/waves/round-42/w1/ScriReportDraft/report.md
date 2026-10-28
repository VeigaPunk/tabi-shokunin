# ScriReportDraft — round-42 report skeleton (scribe seat)

Milestone: report skeleton draft. Deliverable: `report-skeleton.md` in this directory.
Scope: DRAFT ONLY — the filed fleet report is the L1's. This seat made no claim verdict,
ran no C1 measurement, committed nothing, and wrote only inside its seat dir.

## Deliverable

- `.ufo/waves/round-42/w1/ScriReportDraft/report-skeleton.md` — the required section order
  (Work performed; Landed changes; Before → after measurements; Sources & frontier;
  Trend verdicts; SHONEN; Stale-lane; Wave shape; Tool installs; Misroot sweep; L0 questions),
  every section pre-filled with frozen facts and every unrun slot marked **PENDING** with the
  exact artifact/command that fills it.

## Frozen facts established (exact commands and outputs)

All run read-only from `/home/vgpnk/Projects/shokunin/tabi-shokunin` on 2026-10-28.

1. Identity of the frozen state.
   `git show --stat --format='%H%n%cI%n%B' 9b6de3a19de11abdb80e82a1310abc64a40215bb`
   → `9b6de3a19de11abdb80e82a1310abc64a40215bb`, `2026-10-28T12:07:26-03:00`, 19 files
   `+20501/-2`, message naming D1/D2/D3 repairs and S149.
   `git log -1 --format='%H %cI %s'` → `0081bfdb93b6bd1bf2853bb128996f1a976b7218
   2026-10-28T12:26:20-03:00 round-42: SCORECARD declared-claims section (frozen predicates, C1/C2)`.
   `git log --oneline 34e1779..9b6de3a` → one commit (the freeze).

2. C2 checker at the freeze and at HEAD (read-only; the script's header states it writes
   nothing):
   `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 9b6de3a19de11abdb80e82a1310abc64a40215bb --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json`
   → `{"schema":"tabi-r42-routed-defects","rev":"9b6de3a…","predicate":false,"findingCount":1,
   "findings":[{"id":"r4-quarantine-absent",…}]}`, exit 1.
   Same at `--rev 0081bfdb…` → identical single `r4-quarantine-absent`, exit 1.
   Baseline state from the committed control (`controls/c2-baseline-red.json`): exit 1, 7
   findings (r1a, r1b, r2-s146-not-rejected, r2-supersession-absent, r3-baseline-file-empty,
   r4-slice-absent, r4-quarantine-absent).

3. D1 byte binding (verifier defect closed at the freeze):
   `git cat-file blob 9b6de3a:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum`
   → `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1`;
   witness → `d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3`.
   Both equal `receiptSha256`/`witnessSha256` in the committed
   `.ufo/waves/round-41/measure/c1-measure.json`. Blob sizes `1167198` / `1153988` bytes
   (`git cat-file -s`).

4. D3 control contents: `git show 9b6de3a:.ufo/waves/round-41/controls/c1-baseline-noop.out`
   → 4 lines, the `ls-tree … | wc -l` command and `0` on its own line.

5. D2 rows: `grep -n 'S14[5-9]' corpus/SOURCES.md` → S148 teaches cell
   `supersedes S146 — A space-separated list of command-line options.`, S146 status `rejected`.

6. C1 live measurement already present (NOT re-run by this seat; read from its receipt):
   `.ufo/waves/round-42/measure/c1-measure.json` → `MEASURE_EXIT=0`, `driverExit 0`,
   `counterExit 0`, counter `predicate true` / `findings []`, `nonceMatches true`,
   `elapsedMs 38384`, receipt sha256 `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e`
   (1,145,258 B), witness sha256 `163f4eba…57d339` (1,122,212 B).
   `git status --porcelain` → `?? corpus/evidence/round42/` — **uncommitted**.

7. C1 producer identity: `sha256sum scripts/measure-c1-round41.mjs
   scripts/playwright-firefox-egress-round41.mjs .ufo/waves/round-41/counters/c1-session-bound-v4.mjs`
   → `4563e5de…95c76`, `fb279c74…9180a3`, `cd71a59e…cff126a` = the frozen pins.

8. C1 pre-data controls: `controls/c1-battery-r42.json` → 6 cases, all pass, `BATTERY_EXIT=0`
   (forger-r39-verbatim, forger-r41-retargeted, node-path, ld-preload, esm-loader each exit 2
   `environment-loader-contamination`; clean exit 0). Replay refusals:
   `R39_REPLAY_EXIT=1`, `R40_REPLAY_EXIT=1`, `R41_REPLAY_EXIT=1`
   (r41 findings `run-nonce-mismatch`, `witness-nonce-mismatch`).
   Baseline tree count `0` (`controls/c1-baseline-tree-count.txt`).

9. Registry census, re-derived:
   - working tree / freeze (`git show 9b6de3a:corpus/SOURCES.md`): **149** rows,
     A133/B7/C9, mined 124 / queued 15 / rejected 10;
   - baseline (`git show 34e1779:corpus/SOURCES.md`): **147** rows, A131/B7/C9,
     mined 123 / queued 15 / rejected 9.
   `measure/census-start.out` → exit 0, `tabi ok`, 20 W04 duplicate-URL warnings.

10. Wave: `python3` over `w1-spec.json` → 64 items; roles scout 20, mutation-tester 9,
    executor 9, reviewer 8, critic 6, scribe 5, connector 4, sentinel 1, simplifier 1,
    revenger 1; attack 23/64; axes discernment 22 / calibration 17 / quality 11 / coverage 7 /
    adjacency 4 / operability 3. `w1-dispatch.json` → `counts.spawn 64`, `taskCall` key
    present. `w1.ready.dispatched` = `1793201876.0697021`. Contrast: r41's marker is
    `never-dispatched: … dispatcher KeyError(taskCall)`.

## Findings (for the L1; not amended by this seat)

1. **LOG census arithmetic.** `LOG.md` round-42 says "Registry working-tree state: 149 rows
   (A131/B7/C9; mined 122 / queued 15 / rejected 10)". Observed at the freeze and at HEAD:
   149 rows, A133/B7/C9, mined 124 / queued 15 / rejected 10. The A131/mined-122 pair is the
   pre-S148/S149 state and the stated status cells sum to 147, not 149. Fix before the filed
   report copies the number.
2. **Misroot in the production tree.** Two untracked self-referential symlinks created
   2026-10-28 12:39 (during the wave, not by this seat):
   `corpus/knowledge/knowledge -> …/corpus/knowledge/` and
   `corpus/lessons/lessons -> …/corpus/lessons/`. `git diff HEAD --stat` is empty, so nothing
   tracked was altered; the links are directory loops and must be attributed and removed by
   the owner. No shokuknow/sibling/fleet write was made by this seat.
3. **C1 not yet admissible.** The live run is green but its receipt/witness are untracked;
   C1's predicate explicitly requires the bytes committed at the measured revision. This is
   the first leg the L1 must close, before the wave verdict.
4. **r4 is wave-gated by design** — the checker's single remaining finding is the 38-row
   re-adjudication TSV; C2 cannot pass until WAVE-DONE.

## Limitations

- This seat did not re-run the C1 measurement (not its work item), did not execute any
  session/claim verdict, and did not verify seat reports (wave still running; no
  `w1-results.json`). Trend/SHONEN/WAVE-DONE/TSV/tip-hash slots are therefore PENDING, not
  guessed.
- `.ufo/l0-questions.md` does not exist at HEAD; the skeleton records that and lists only the
  two carried-forward candidates from r41.

## Tool installs

None (no pacman per the guard; no uv/cargo/npm/`~/.local/bin` install needed).

VERDICT ok — skeleton drafted at `.ufo/waves/round-42/w1/ScriReportDraft/report-skeleton.md` with all frozen facts cited and every unfilled slot marked PENDING with its filling artifact.
