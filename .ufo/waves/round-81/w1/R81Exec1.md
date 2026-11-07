# R81Exec1 — leg (b): two independent cold runs of the frozen driver

Seat: R81Exec1 (leaf executor). Lane `tabi-shokunin`, base `c27e8406`, digests commit D = `a2183a933622`.
Host: Chromium 155.0.8059.84 Arch Linux (`/usr/bin/chromium`), node v24.21.0, CDP 1.3.
No tool installs. No mutating git/jj. Read-only git only (`rev-parse`, `cat-file`, `diff`, `log`, `status`).

## Verdict

Both cold runs completed and both scored **clean**: exit 0, verdict `clean`, **56/56 checks**, `findings: []`,
zero honest refusals. The L1 scored receipt also scores clean under the counter, including with my cold1
added as a prior. Leg (b) contributes **2 fresh cold runs, 0 refusals**; the third run needed for the
"at least 3" target is not mine to produce.

| run | nonce | driver exit | fixture sha256 | counter exit | verdict | checks | findings |
|---|---|---|---|---|---|---|---|
| cold1 | `tabi-r81-cold1-a2183a933622` | 0 | `8b876444…fd52da` | 0 | clean | 56 | [] |
| cold2 | `tabi-r81-cold2-a2183a933622` | 0 | `0becfd0a…50111b` | 0 | clean | 56 | [] |
| scored (a) | `tabi-r81-l1-a2183a933622` | — | `d9129edd…2a1703` | 0 | clean | 56 | [] |

Driver digest on all three receipts: `e35e63c1…c97c669` — matches `freeze.txt`. All 6 legs, `failures: []`.

## Coverage facts observed (both runs, identical)

1. `sp81-cross-origin-nonfile` — child `SecurityError: showPicker() called from cross-origin iframe.`; **0** chooser events; parent page state untouched.
2. `sp81-cross-origin-nonfile-disabled` — the **same** `SecurityError` on a disabled `type=date` in the cross-origin frame; **0** choosers. Origin is checked before mutability.
3. `sp81-same-origin-nonfile-disabled` — `InvalidStateError: HTMLInputElement::showPicker() cannot be used on immutable controls.`; 0 choosers. The order discriminator holds: same call, same disabled state, different error by origin.
4. `sp81-webkitdirectory-answer` — one `selectSingle` chooser; `DOM.setFileInputFiles` with a **directory** yields `inner-a.txt` (19, `text/plain`, `tabi-r81-dir/inner-a.txt`) and `inner-b.png` (18, `image/png`, `tabi-r81-dir/inner-b.png`); trusted `input`+`change` fire.
5. `sp81-accept-answer` — a `.txt` answered into `accept=".png"` is **accepted**: `tabi-r81-a.txt` (22, `text/plain`) lands in the file list; trusted `input`+`change` fire. `accept` filters the dialog, not a programmatic answer.
6. `sp81-click-while-open` — chooser count goes **1 → 2** on a real trusted click on the input whose picker is already open.

Determinism: semantic projection of cold1 vs cold2 is **equal**. The only deltas are browser-assigned or
wall-clock: `mainFrameId`, one `backendNodeId` (10 vs 9 in the accept leg), and `marks[].at`. Both scored
clean, so the counter does not pin them.

## Findings (control/instrument integrity — reported, not repaired)

- **F1** `scripts/negatives-showpicker-r81.mjs` is worktree-modified and no longer matches its frozen digest
  (`6964de6f…` → `f7c423c1…`; D and HEAD both hold the frozen blob). Diff: `receiptPath = realPath` →
  `path.resolve(realPath)` in two cases. Predicate (c) battery evidence produced from the worktree is not the
  frozen instrument's evidence.
- **F2** `.ufo/waves/round-81/controls/c1/prior-set.txt` was **amended in the worktree** during the wave:
  committed (D and HEAD) is 1 line, probe1, sha `1275fa1f…`; worktree is 2 lines, probe1+probe2, sha `5f8becd3…`.
  My cold1 score used the committed set; my cold2 score used the amended one.
- **F3** `freeze.txt` is worktree-modified: its prior-set line was re-pinned to `5f8becd3…` (following F2) while
  its claims.json line still pins D's blob `49c8c96e…` although the tree holds HEAD's `0b850d15…`. Mixed vintage.
- **F4** `claims.json` tree == HEAD (`0b850d15…`) ≠ freeze pin (`49c8c96e…`). The D→HEAD delta is only
  `digestsCommit`/`nonce` null→value plus `\u2014` escapes; the contract body is unchanged.
- **F5 (structural)** `prior-set-complete` walks `.ufo/waves/round-81` and `corpus/evidence/round81` and demands
  every schema receipt there be a prior or the receipt under test. With the **committed 1-line set**, both cold
  runs and the scored receipt exit **1** on `prior-set-complete` (naming `probes/tabi-r81-probe2.json`, and for
  cold runs also the scored receipt). With `--prior probe2` (and `--prior <scored receipt>` for cold runs) all
  three exit 0 clean — the predicate's command grammar allows `[--prior …]`. "With the committed prior set" is
  therefore satisfiable only with extra priors or an amended set. For L1 to decide; no amendment proposed.

## Acceptance matrix (all 56 checks)

| # | receipt | prior set | extra priors | exit | verdict |
|---|---|---|---|---|---|
| M1 | scored | committed `1275fa1f` | probe2 | 0 | clean |
| M2 | cold2 | committed `1275fa1f` | probe2, scored | 0 | clean |
| M3 | cold1 | worktree `5f8becd3` | probe2, scored | 0 | clean |
| M4 | cold1 | committed `1275fa1f` | probe2, scored | 0 | clean |
| M5 | cold2 | committed `1275fa1f` | — | 1 | `prior-set-complete` |
| M6 | scored | committed `1275fa1f` | — | 1 | `prior-set-complete` |

## Evidence retained

`.ufo/waves/round-81-seats/R81Exec1/`: `cold1.json`, `cold2.json` (full receipts), `ledger.txt` (every command,
exit code and finding id), `prior-set-committed.txt` (committed bytes, sha `1275fa1f…`), and the ten counter
outputs `cold1-score.json`, `cold2-score.json`, `cold2-score-committed.json`, `scored-with-cold1.json`,
`scored-priori-only.json`, `scored-committed-with-cold1.json`, `m1…m4-*.json`.

Scratch `/fast/scratch/hyaku/tabi-r81/R81Exec1` deleted after the score outputs were copied into the seat dir.

## Risks

- If the wave is judged on the worktree `freeze.txt`/`prior-set.txt`, the frozen-control claim is not what the
  committed bytes say (F2/F3/F4). If judged on committed bytes, the battery instrument has drifted (F1).
- Predicate (b)'s "at least 3 fresh cold runs" is at 2 from this seat; a third is still owed.
