# R80Exec1 — Leg (b) cold-run acceptance report

Assignment: run the frozen driver twice with fresh nonces and score each receipt with the frozen counter; re-run the counter on the scored L1 receipt with my cold1 as an extra prior; record every exit code and finding id.

## Result

Milestone met: **two independent cold runs, zero honest refusals.**

| Run | Nonce | Driver exit | Legs | Counter exit | Verdict |
|---|---|---|---|---|---|
| cold1 (19:26:28–19:27:05) | tabi-r80-cold1-f9ece6562c94 | 0 | 7/7, failures [] | 0 (57 checks) | clean |
| cold2 (19:27:24–19:28:00) | tabi-r80-cold2-f9ece6562c94 | 0 | 7/7, failures [] | 0 (57 checks) | clean |

Both scores were produced under the **frozen** counter (sha256 f22db0ac…, the freeze.txt pin) and re-confirmed clean under the counter currently on disk (8db6a43a…). Driver sha256 cb93935c… matched the pinned `--expect-driver-sha256` in every run. Per-run fixture sha256: cold1 fbf256945882b4d737c7d0d83bd917850207ec5c38f59f3b69a0d56e296750c7, cold2 d35c8ae289676128c5889d429c20cb81e45935b99590372265ba4ae764701ce8 (differs per run because the fixture embeds the run's ports — accepted via each receipt's own `fixture.sha256`).

## Findings (full detail in .ufo/waves/round-80-seats/R80Exec1/ledger.txt)

**F1 — counter drift post-freeze (integration owner decision).** `scripts/check-showpicker-r80.mjs` on disk hashes `8db6a43a0e3cfa52058aed187dda25d623e8cbeef924cae8c97b1732fff41a15`, but freeze.txt (commit D f9ece6562c94…) pins `f22db0ac025eac823473eb543c08c83a91c02ad7a611fecdf5c410c48566c9af`. Mtime 2026-11-07 19:29:21 falls between two of my counter runs on identical inputs: at 19:28:48 the frozen counter exited 1 on the L1-receipt-with-cold1-prior combination (`replay-event-timeline`, prior #1 = tabi-r80-probe2, `gapMatched 1` ≥ `gapNeed 1` on a single ≥50 ms gap); at 19:29:30 the edited counter exited 0 clean on the same inputs. The edit adds a `gapRule` guard: gap evidence counts only when **both** receipts carry ≥ 2 gaps ("a single gap's duration is a driver artifact, not a fingerprint"). The driver sha still matches its freeze pin. I did not touch the counter or the freeze; flagging so the freeze digest and the shipped counter can be reconciled before gate (d).

**F2 — predicate-(a) nonce mismatch (finding id `nonce-expected`, field `nonce`).** The receipt at the predicate-(a) path `corpus/evidence/round80/chromium-showpicker/receipt.json` carries nonce **tabi-r80-l1-53ecca8411dc** (run 2026-11-07T22:28:04Z → 22:28:39Z), not the claimed `tabi-r80-l1-f9ece6562c94`. Scoring it with the predicate nonce exits 1 on `nonce-expected` alone; with its own nonce it is clean 57/57 under the current counter, prior-set only and with cold1 as an extra prior. No receipt with the predicate nonce appeared at that path during my window (19:26–19:35).

**F3 — positive.** Cold-run acceptance (b): both fresh cold runs exited 0, drove 7/7 legs with zero failures and zero refusals, and scored clean 57/57 under both counter versions with the committed prior set.

**F4 — conditional.** The prior set still accepts the committed L1 receipt with cold1 added as a prior — but only under the post-freeze counter; under the frozen counter that exact combination refuses on `replay-event-timeline`. Acceptance is therefore conditional on the F1 edit standing.

## Artifacts (all under .ufo/waves/round-80-seats/R80Exec1/)

`cold1.json`, `cold2.json` (driver receipts) · `cold1.score.json`, `cold2.score.json` (frozen-counter scores) · `cold1.rescore.json`, `cold2.rescore.json` (current-counter scores) · `l1-rescore-cold1prior.json` (19:28:48 refusal under frozen counter), `l1-rescore-setonly.json`, `l1-rescore-setplus-cold1-ownnonce.json`, `l1-assigned-command-final.json` (current-counter L1 rescores) · `ledger.txt` (every exit code + finding id) · driver stdout/stderr copies.

No tool installs or upgrades (node v24.21.0, /usr/bin/chromium 155.0.8059.84 already present and pinned). Scratch /fast/scratch/hyaku/tabi-r80/R80Exec1 deleted after artifacts were copied into the seat dir.
