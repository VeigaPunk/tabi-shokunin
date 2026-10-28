# RevReceiptBytes — round-42 C1 receipt-bytes audit

Seat: `RevReceiptBytes` (leaf reviewer). Milestone: receipt bytes audit.
Repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; no writes outside my seat dir, no git/jj mutation).
Audit time: 2026-10-28T12:39:xx–12:43:40-03:00. HEAD at audit = `0081bfdb93b6bd1bf2853bb128996f1a976b7218`, **detached** (`git branch --show-current` empty; `master` also at `0081bfd`).
Freeze revision (round-42 claims) = `9b6de3a19de11abdb80e82a1310abc64a40215bb`; baseline = `34e177959d1b7ce04afb85a001420e02631ce79e`.
Tooling: no installs performed (nothing needed; `sha256sum`, `git`, `python3` sufficed).

Subject: `corpus/evidence/round42/playwright-egress/receipt.json` (1 145 258 B, mtime 12:09:59) and `receipt.witness.json` (1 122 212 B, mtime 12:09:59).

## 1. Byte hashes vs the committed measure record

```
$ sha256sum corpus/evidence/round42/playwright-egress/receipt.json \
            corpus/evidence/round42/playwright-egress/receipt.witness.json
3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e  .../receipt.json
163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339  .../receipt.witness.json
```

`.ufo/waves/round-42/measure/c1-measure.json`:

```
receiptSha256 = 3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e
witnessSha256 = 163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339
```

**Match: exact, both files.** The measure record's own committed blob equals the worktree
(`git rev-parse HEAD:.ufo/waves/round-42/measure/c1-measure.json` =
`git hash-object …` = `762af345fabd45b907ff51f5f4e7daf8fa9468f2`), i.e. the hashes are the
committed claims at HEAD, so the worktree bytes are the bytes the record measured.

Evidence: `01-sha-vs-measure.txt`.

## 2. Receipt parse and invariants

All observed on the bytes in §1:

| check | observed |
|---|---|
| schema | `tabi-pw-firefox-egress-receipt-r41` (driver `scripts/playwright-firefox-egress-round41.mjs`; its digest `fb279c74…` equals the measured and frozen pin) |
| `runNonce` | `94c0f0efa48293b3ed923bd9717b5c2702b5f89f3fd45ffd51c980ba8e4e21ab`, len 64, full `[0-9a-f]{64}` |
| `runs` length | 2 (`run1`, `run2`) |
| nonce carried by both runs | `run1.runNonce == run2.runNonce == receipt.runNonce` → True |
| nonce carried by witness | `witness.nonce == receipt.runNonce` → True (witness schema `tabi-r41-witness`, 754 samples) |
| nonce fresh vs r41 | differs from r41 nonce `78df30b0…` |
| `browserVersion` bound | `157.0` at receipt and both runs; UA `… rv:157.0 … Firefox/157.0`; `binding: true`; `owned.roots` exe `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` per run; counter's firefox-bin digest pin path exercised |
| `egressNonLoopback` | top 0; run1 0; run2 0; Σ over 260 samples (ss+proc) = 0, max per-sample = 0; sockets ss/proc observations 82/82 and 80/80, all `nonLoopback: 0`, finalSweep `{ss:0, proc:0}` |
| `survivors` | top 0; run1 0 `survivorPids: []`; run2 0 `survivorPids: []`; `portClosed: true`; `finalSweep.treePids: []` |
| `firstShotSha256` identical across runs | True: `252cafa6e9b2f656be8c1107fc5fa2714cc50124d50a902c2a09beb39709be12`, both `firstShotBytes` 25058 |
| `refused` | false (both runs) |
| envCheck | `procEnvironReadable true, nameCount 18, forbiddenNames [], execArgv [], execArgvClean true, envNonceEcho "match"` |
| coverage | run1 samples 126, span 17 435 ms (ticks 17286082→17287915); run2 samples 134, span 18 835 ms (17287928→17289883); min ss/proc ticks 1 on every sample |
| witness envelope | ticks 17286056→17289921 encloses both runs; rootPid 2764370; `owned.nodePid` 2765128 present in witness tree; both firefox roots 2765924 / 2853602 present in witness tree (432 distinct pids) |

Counter (in the measure record): `predicate: true`, `findings: []`, `counterExit: 0`,
`driverExit: 0`, `nonceMatched: true`, measure process exit 0 (`c1-measure.exit` = `MEASURE_EXIT=0`).

Do-nothing reach check (C1 kill rule, my remit only insofar as bytes show it): not
demonstrated here — real navigation commands (`navigate.hydrated` 1502/1695 ms), 200-status
loopback httpLog entries, a 25 058-byte first screenshot, and firefox processes bound into the
independent witness tree in both runs.

Evidence: `02-receipt-invariants.txt`.

## 3. D1 closure — r41 measure record vs committed r41 bytes

`.ufo/waves/round-41/measure/c1-measure.json`:
`receiptSha256 = 416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1`,
`witnessSha256 = d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3`.

```
$ git show 9b6de3a19de11abdb80e82a1310abc64a40215bb:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1  -
$ git show 9b6de3a…:corpus/evidence/round41/playwright-egress/receipt.witness.json | sha256sum
d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3  -
```

Worktree r41 files hash identically. `git log --first-parent --diff-filter=A --
corpus/evidence/round41/playwright-egress` names a single introduction commit:
`9b6de3a` ("…land r41 defects D1 (commit receipt/witness bytes)…"). At baseline `34e1779`
the r41 evidence paths are **absent** while the measure record was already present — i.e. the
original D1 (hashes asserted over uncommitted bytes) was real, and it is now **closed**: the
committed claim bytes and the committed subject bytes agree, at the freeze revision and at HEAD.

(Commits `c4bea52`, `0ddc6f7`, `6cc6826` carry the same two r41 blobs but are **not**
ancestors of HEAD; the first-parent introduction is `9b6de3a`. Recorded for completeness only.)

Evidence: `03-d1-r41-hashes.txt`.

## 4. Tracking state of the round-42 receipt bytes — FINDING

Three polls over ~4 min, HEAD unchanged (`0081bfdb93b6`), detached:

```
POLL1 2026-10-28T12:40:15-03:00   POLL2 2026-10-28T12:41:53-03:00
POLL3 2026-10-28T12:43:54-03:00   final 12:43:40-03:00
$ git status --porcelain -- corpus/evidence/round42 .ufo/waves/round-42/measure
?? corpus/evidence/round42/
```

- `git ls-files --error-unmatch corpus/evidence/round42/playwright-egress/receipt.json` → **UNTRACKED**; same for `receipt.witness.json`. Index has no entries (`git ls-files -s corpus/evidence/round42` empty → never even staged).
- The corresponding git objects do not exist in the object database:
  `git hash-object receipt.json` = `0b81608dd6e184614a66afcacf5f8f3eade5e223` → `git cat-file -e` **NO**;
  witness = `9adbb6a3b4834274e8264416362323591ce52d89` → **NO**.
- `git log --all --oneline -- corpus/evidence/round42` → **0 commits**. No revision anywhere in the repo contains these bytes.
- The evidence path is **not gitignored** (`git check-ignore -v` → not ignored), so the only reason it is untracked is that it was never added.
- The measure record *is* tracked (committed in `236c4f4`), so at HEAD a reader sees hashes
  `398445…`/`163f4e…` whose subjects cannot be fetched from the tree.

**No commit is visible to report.** This is the round-41 D1 failure mode reproduced on the
round-42 bytes.

### Why this is a claim-level (not cosmetic) defect

The frozen C1 predicate (`.ufo/waves/round-42/claims.json`) is a conjunction that includes
"…AND the produced receipt.json and receipt.witness.json **are committed at the measured
revision**…", and the C1 kill rule refuses admission when "the receipt bytes are not committed
at the measured revision". At audit time that conjunct is **false**: the bytes are untracked,
unstaged, and absent from the object database. Everything else in my audited surface passes,
so the claim currently stands on the unexecuted commitment clause alone.

### F2 (structural, enables the recurrence)

`grep -n -i "git\|commit\|ls-tree\|porcelain\|tracked" .ufo/waves/round-41/counters/c1-session-bound-v4.mjs`
→ **no matches**; the same grep on `scripts/measure-c1-round41.mjs` finds only comments. Neither
the counter nor the measure wrapper has any executable check of the commitment conjunct, so
`predicate: true` is returned for bytes that exist nowhere in git. The clause is prose-only and
must be enforced by a human/verifier step; the r41 and r42 rounds both show that step getting
skipped. (Recording as a hole; counter/claims bytes are frozen and I propose no amendment.)

## Residual risk / verification gaps

- I verified the bytes as they sit in the worktree; I cannot prove they are the bytes the
  driver actually wrote, beyond their agreeing with the committed measure record's hashes and
  the receipt's internal self-consistency (nonce echoed in envCheck, witness tree, both runs).
- `binding: true` is a driver self-report; I confirmed consistency (browserVersion ↔ UA ↔
  ms-playwright firefox exe ↔ witness tree), not the counter's internal pin-loading path.
- Polling was 3 samples over 3 minutes; a commit landing after 12:43:40 would change item 4
  (item 3 is commit-fixed and unaffected).
- Not in my remit and therefore unexamined: the battery/refusal controls, the r39/r40/r41
  replay controls, and the C2 routed-defect ledger.

## Evidence files (in this seat dir)

- `01-sha-vs-measure.txt` — §1 hashes and measure-record fields
- `02-receipt-invariants.txt` — §2 full invariant dump
- `03-d1-r41-hashes.txt` — §3 committed-blob hashes and stability
- `04-git-tracking.txt` — §4 poll-3 tracking capture (written by the delayed poll)
- `05-final-status.txt` — §4 final tracking state, blob-ODB absence

VERDICT finding — receipt/witness hashes match the committed measure record and every parse invariant holds (2 runs, fresh 64-hex nonce in receipt+runs+witness, browserVersion bound, 0 nonLoopback, 0 survivors, identical firstShotSha256), and D1 is closed (r41 measure hashes match the blobs committed at 9b6de3a), but the round-42 receipt bytes are untracked/unstaged/absent from the object database with zero commits touching them at audit time (3 polls, HEAD 0081bfdb), so C1's "committed at the measured revision" conjunct is false and the D1 failure mode has recurred.
