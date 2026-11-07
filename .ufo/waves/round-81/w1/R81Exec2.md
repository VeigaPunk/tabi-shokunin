# R81Exec2 — C1 leg (b): cold runs cold3 and cold4 (one under a space-bearing scratch path)

Seat R81Exec2 (executor, leaf). Lane `tabi-shokunin`, base `c27e8406`, D = `a2183a933622`. No commits, no mutating git commands, no writes into the walked trees. Every JSON/receipt lives under `.ufo/waves/round-81-seats/R81Exec2/`.

## Seat verdict

Both cold runs exit 0 clean under the frozen counter: verdict `clean`, checkCount 56, findings `[]`. **Zero honest refusals.** The scratch path containing a space is handled correctly end to end.

## Per-run facts

| | cold3 | cold4 (space path) |
|---|---|---|
| nonce | `tabi-r81-cold3-a2183a933622` | `tabi-r81-cold4-a2183a933622` |
| ports http/cdp/child | 19266 / 19267 / 19268 | 19269 / 19270 / 19271 |
| scratch | `/fast/scratch/hyaku/tabi-r81/R81Exec2/scratch-cold3` | `/fast/scratch/hyaku/tabi-r81/R81Exec2/scratch with space` |
| driver exit | 0 | 0 |
| legs / failures | 6 / `[]` | 6 / `[]` |
| run window | 31.32 s (23:14:35.948Z → 23:15:07.270Z) | 31.30 s (23:14:35.942Z → 23:15:07.244Z) |
| fixture sha256 | `8ffee952a141712f88a347c139cacc8df54d24cddb9346a847938089e64aac02` | `dc0cb72a011b883b0d53aa79f30f63822dc5ea83f8891c42d1a834c5130a1782` |
| receipt sha256 | `b1b475a03c616d88b3468a6ab87c7bc54a8dda700c225cb2340b5017c4153106` | `6766ae21b6f748469c30bb06db4608e587684fa95595d014fe5e4f09f1b48630` |
| receipt | `.ufo/waves/round-81-seats/R81Exec2/cold3.json` | `.ufo/waves/round-81-seats/R81Exec2/cold4.json` |
| counter exit | 0 | 0 |
| verdict / checkCount / findings | `clean` / 56 / `[]` | `clean` / 56 / `[]` |
| launch tokens | 6 distinct, none in a prior | 6 distinct, none in a prior |
| teardown | sweepRounds 0, survivors `[]`, 3 ports closed, post-kill curl 7 | same |

Driver pin `e35e63c1…` and counter pin `0d69659c…` both match `freeze.txt` at D and at HEAD. Host: Chromium 155.0.8059.84 Arch Linux, CDP 1.3, node v24.21.0. Fixture source `scripts/chrome-cdp-filechooser-round78.mjs` unchanged (`0ae89d92…`, mtime 14:02).

## Scoring invocations

**(1) Primary — committed prior set + probe2 + the scored receipt (claims leg b wording):**

```
node scripts/check-showpicker-r81.mjs --lane <ABS lane> --receipt <seat>/cold3.json \
  --expect-driver-sha256 e35e63c1… --expect-nonce tabi-r81-cold3-a2183a933622 \
  --expect-fixture-sha256 8ffee952… \
  --prior-set <seat>/prior-set.frozen.txt \
  --prior .ufo/waves/round-81/controls/c1/probes/tabi-r81-probe2.json \
  --prior corpus/evidence/round81/chromium-showpicker/receipt.json --json
```

exit 0, `clean`, 56 checks, findings `[]`; `priorSetFile.sha256 = 1275fa1f…` (the committed bytes). `prior-set.frozen.txt` is `git show HEAD:.ufo/waves/round-81/controls/c1/prior-set.txt` (sha `1275fa1f…`, one line: probe1). Three priors (probe1, probe2, scored); `absMatched 0` of `absNeed 16` against each; `refused false`. Artifacts: `cold3.score.frozen-priorset.json`, `cold4.score.frozen-priorset.json`.

**(2) Worktree prior-set as it stands now (two lines, `5f8becd3…`) + probe2 + scored:** exit 0, `clean`, 56, findings `[]`, 4 priors (probe2 appears twice), `absMatched 0`. Artifacts: `cold3.score.json`, `cold4.score.json`. Leg (b) therefore holds under either prior set.

**(3) prior-set + probe2 only (no scored receipt):** exit 1, single finding `prior-set-complete` naming `corpus/evidence/round81/chromium-showpicker/receipt.json` — the L1's scored receipt landed at 23:14:54Z, mid-run, and must be named as a prior (claims leg b: "the committed prior set plus `--prior` for the scored receipt"). Artifacts: `cold3.score.priorset-only.json`, `cold4.score.priorset-only.json`. This is an invocation-completeness finding, not a defect in the cold receipts; the same two receipts pass once the scored receipt is named. **No cold-run refusal.**

## Space-path test (cold4)

- Scratch `/fast/scratch/hyaku/tabi-r81/R81Exec2/scratch with space` (absolute, one space). Driver's Chromium singleton-socket precheck: 101 bytes ≤ 107.
- Chromium argv: `--user-data-dir=/fast/scratch/hyaku/tabi-r81/R81Exec2/scratch with space/profile-340c3e3fbef8`; HOME/XDG/TMPDIR all under the same space-bearing dir.
- `DOM.setFileInputFiles` answered with a directory path containing the space: `/fast/scratch/hyaku/tabi-r81/R81Exec2/scratch with space/upload-b391d8074170/tabi-r81-dir`; `setError null`; files arrived with `webkitRelativePath` `tabi-r81-dir/inner-a.txt` and `tabi-r81-dir/inner-b.png`.
- All 6 legs completed; teardown swept to zero (sweepRounds 0, survivors `[]`, fixture/devtools/child ports closed, post-kill curl 7).
- The driver spawns with argv arrays only (no `shell: true`, no `exec`/`sh -c`), so the space never round-trips through a shell.

## Law reproduced (identical in both runs; 56/56 counter checks true)

- cross-origin non-file: no chooser; `SecurityError: … showPicker() called from cross-origin iframe.`
- cross-origin disabled: same `SecurityError` (origin checked before mutability); no chooser.
- same-origin disabled: `InvalidStateError: … cannot be used on immutable controls.`; no chooser (chooserWaitMs 2016 = full wait).
- webkitdirectory answer: one `selectSingle` chooser; directory files with relative paths; trusted input+change.
- accept answer: `.txt` accepted into `accept=".png"`; `state.k = [["tabi-r81-a.txt",22,"text/plain",""]]`.
- click while open: chooser count 1 → 2.

## Instrument drift observed (not this seat; material to legs a/c)

Timeline (local −03:00), all uncommitted working-tree changes:

- 20:15:06.390 `.ufo/waves/round-81/controls/c1/prior-set.txt` modified: probe2 appended; `1275fa1f…` → `5f8becd3…`; `M` vs HEAD.
- 20:15:06.405 `.ufo/waves/round-81/freeze.txt` modified: its prior-set line rewritten to `5f8becd3…`; file sha `65c2d970…` (HEAD) → `bcae9500…` (worktree).
- 20:15:06.453 `.ufo/waves/round-81/scored/counter-a.json` written with `priorSetFile.sha256 = 5f8becd3…` — leg (a) was scored against the working-tree prior set, not the committed one (`1275fa1f…` at D and HEAD).
- 20:15:25.802 `scripts/negatives-showpicker-r81.mjs` modified: two `receiptPath = realPath` → `path.resolve(realPath)`; pin `6964de6f…` → actual `f7c423c1…`.
- 20:15:28.471 `scored/battery-a.json`: 62 cases, 0 failed, `uncovered []`, `unknown ["order-law-message","activation-before","cross-nonfile-chooser","cross-nonfile-result"]` — frozen leg (c) text says coverage.unknown `[]`; this output does not show that.
- 20:15:52.752 `scored/killpower-a.json`: 46 mutants, 46 killed, 0 survivors, 0 crashed (matches leg c's kill-power clause).
- `claims.json` D→HEAD change is the digests commit filling `digestsCommit`/`nonce` (expected; at D both were null).

This seat's two instruments are byte-identical to their pins (driver `e35e63c1…`, counter `0d69659c…`), so the cold receipts were produced and scored by the frozen instruments; the prior-set drift cannot touch them (the driver never reads the prior set). The L1 must reconcile the prior-set/freeze/battery drift before scoring legs (a)/(c); this seat did not touch those files.

## Files written

- Seat dir: `cold3.json`, `cold4.json`, `cold3.score.frozen-priorset.json`, `cold4.score.frozen-priorset.json`, `cold3.score.json`, `cold4.score.json`, `cold3.score.priorset-only.json`, `cold4.score.priorset-only.json`, `prior-set.frozen.txt`.
- This report (also at `.ufo/waves/round-81/w1/R81Exec2.md`).
- Scratch `/fast/scratch/hyaku/tabi-r81/R81Exec2/` deleted after the receipts were in the seat dir.

## Risks / blockers

- None for leg (b): two fresh cold runs, zero refusals, both clean under the committed prior set and under the current worktree one.
- Open for the L1, not this seat: leg (a) evidence currently cites a non-committed prior set; leg (c) battery output shows 4 unknown coverage entries against a frozen `unknown []`.
