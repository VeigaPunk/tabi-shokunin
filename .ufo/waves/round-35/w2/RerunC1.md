# RerunC1 — round-35 w2: re-run of the C1 counting command at the integration

Seat: RerunC1 (leaf, no subagents). Rev under test: `083c5c643be7aa5965a5de3458a32ed0d289ead3` (wave-1 integration). Freeze: `a4bfef0f75027c915e715649950b1d46dcb33d83`. Baseline: `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`.

## Verdict

**Holds.** The C1 counter bytes extracted from the freeze (`sha256 5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9`) equal `frozenDigests[".ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs"]` in `.ufo/waves/round-35/claims.json` and equal the bytes of that path at REV — and the rerun at REV in a clean shared clone reproduces the declared C1 counting exactly: candidates 383, mapped 1, screened 382, unaccounted 0, newMapped 1 (adjacency.tsv row 18, `cdp-bridge-vault-dom-refusal`, kagi, split-declared), newRowRefusals `[]`, screenFindings `[]`, unaccountedKeys `[]`, adjacency verdict clean (rows 17, verified 17, findings 0) with `adjGateSha256` equal to the pinned `4e2c2a64…24aac`; predicate false, exit 1 — the declared honest miss of `newMapped >= 2` at newMapped = 1, which is the kill-rule path claims.json froze, not a counting defect. No-harm holds: the round-33 counter (frozen bytes `da59d157…`) and the round-34 counter (frozen bytes `0dba816c…`), both byte-identical at REV, keep unaccounted 0 with screenFindings `[]` and unaccountedKeys `[]`. No new defect found by this rerun; nothing was repaired (attack seat reports findings only).

Godspeed axes named: byte-fidelity of the instrument, reproducibility of the counted numbers, no-harm to prior-round gates, latency (all independent probes run concurrently).

## Evidence

Scratch: `S=/fast/scratch/hyaku/tabi-r35/RerunC1` (TMPDIR=`$S/tmp` passed to every counter), one live clone `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`. No browsers launched, no network fetches, no tool installs (node v24.21.0 already present). All commands run from `$S`; the lane checkout was never written.

1. Clone + byte integrity — exit 0:
   - `git -C "$S/clone" checkout -q --detach 083c5c64…` → `cloneHEAD=083c5c643be7aa5965a5de3458a32ed0d289ead3`.
   - `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show a4bfef0f…:.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs > $S/c1-r35-frozen.mjs` → sha256 `5707a937…b436b9` (== frozenDigests in claims.json).
   - `git -C "$S/clone" show 083c5c64…:.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs | sha256sum` → same digest: the counter is byte-unchanged between freeze and integration.
   - Older counters from the freeze: `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` → `da59d157…2c6380`; `.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` → `0dba816c…a8781e`; both digests also equal their blobs at REV.
   - Baseline sweep integrity: `.ufo/waves/round-35/baseline/c1-candidates.tsv` is 383 lines; frozen blob sha `9efd0407…b659cf` == worktree sha.
2. C1 rerun at the integration — `node $S/c1-r35-frozen.mjs --rev 083c5c64… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1** (evaluated, predicate not met, per the usage contract at `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:13`), stderr empty. Stdout JSON (receipt `out-r35.json`):
   - `candidates` 383, `mapped` 1, `screened` 382 → `unaccounted` 0 (1 + 382 = 383 closes arithmetically);
   - `newMapped` 1: `[{"row":18,"surface":"cdp-bridge-vault-dom-refusal","sibling":"kagi","disposition":"split-declared"}]` — the single new map row declared by wave 1 (integration facts: one new row at `corpus/adjacency.tsv:18`);
   - `newRowRefusals` `[]`, `screenFindings` `[]`, `unaccountedKeys` `[]`;
   - `adjacency` `{"verdict":"clean","rows":17,"verified":17,"findings":0}`, `adjGateSha256` `4e2c2a64…` == the pin frozen inside C1 and in claims.json (`scripts/check-adjacency.mjs` byte-unchanged — the counter exits 2 on mismatch, and it evaluated);
   - `perLane` sums to 383 and matches the claims.json C1 breakdown exactly (kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1);
   - `predicate` false. Frozen predicate: `check-adjacency verdict clean AND unaccounted == 0 AND newMapped >= 2` — `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:61-62`. Verdict clean ✓, unaccounted 0 ✓, newMapped 1 < 2 ✗ → false. Matches the counter result declared at the integration (unaccounted 0, newMapped 1, predicate false) digit for digit.
3. Round-33 no-harm — `node $S/c1-r33-frozen.mjs --rev 083c5c64… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1**, stderr empty. Receipt `out-r33.json`: candidates 52, mapped 8, screened 44, **unaccounted 0**, **screenFindings []**, unaccountedKeys [], adjacency clean 17/17, adjGateSha256 == pin. (newMapped 3 < its own frozen floor 4, `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:46-47` — predicate false at this REV. The frozen no-harm bar in claims.json `noHarmRule` requires only "unaccounted 0 with screenFindings []" for the round-33/34 counters, which holds; predicate truth at REV is not part of that bar.)
4. Round-34 no-harm — `node $S/c1-r34-frozen.mjs --rev 083c5c64… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1**, stderr empty. Receipt `out-r34.json`: candidates 67 (A 38 + B 29), leadsUnresolved [], mapped 4, screened 63, **unaccounted 0**, **screenFindings []**, unaccountedKeys [], adjacency clean 17/17. newMapped 1 < 3 (`.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs:52-53`) — exactly the recorded round-34 honest miss ("C1 adjacency missed newMapped>=3 at 1", claims.json `priorClosure`).

## Observations (not defects; for L1 awareness)

- `priorCandidatesSkipped` 22 vs claims.json's "minus the 67 round-34 candidates": consistent, [INFERENCE] — of round-34's 67 candidates, the 38 set-A lines name tabi and are already excluded by the r35 `\btabi\b` filter, so only set-B leads can collide with the r35 net; 22 of the 29 leads were skipped by the prior-candidate rule. The headline number (383 candidates, exact per-lane breakdown) matches the frozen claim either way.
- The r33 counter reports newMapped 3 at this REV where its own floor is 4; whether the round-33 closure measurement differed (e.g. a then-counted row withdrawn during round-34's honest stop) was not audited — outside this seat's scope, no lane file was reinterpreted.

## Deliverable paths

- Report: `.ufo/waves/round-35/w2/RerunC1.md` (this file)
- Receipts: `.ufo/waves/round-35/w2/RerunC1/out-r35.json`, `.ufo/waves/round-35/w2/RerunC1/out-r33.json`, `.ufo/waves/round-35/w2/RerunC1/out-r34.json`, `.ufo/waves/round-35/w2/RerunC1/sha256s.txt`

Scratch `/fast/scratch/hyaku/tabi-r35/RerunC1` deleted after receipt copy. Lane files untouched; no browser or driver process started.
