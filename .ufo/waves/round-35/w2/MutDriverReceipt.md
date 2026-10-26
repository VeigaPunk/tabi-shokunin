# MutDriverReceipt — w2 falsification: does the frozen C2 counter depend on the committed runs?

**Verdict: holds, with one coverage finding (moderate).** The frozen C2 counter (bytes at `a4bfef0f75027c915e715649950b1d46dcb33d83`, sha256 `7cc7f17f…`, byte-identical to the counter at the wave-1 integration rev `083c5c6…`) does depend on the committed evidence on every axis probed: 7 of 8 single-point mutants of the COMMITTED EVIDENCE were killed by exactly the frozen clause the mutation attacks (R13 frame presence, transcript sha integrity, first-screenshot byte binding, browserVersion binding, driver independence, entry sourcing, R16 refusal). The one survivor is M2: `run2.jsonl` replaced by a byte-copy of `run1.jsonl` with only the session id rewritten is **admitted 16 / failing 0 / binding null / exit 0** — the counter's "two committed runs" clause checks only pairwise-distinct transcript paths, transcript sha256s and sessionIds, and the transcripts carry no timestamps or per-run nonce, so one real run replayed under a fresh UUID satisfies it. Severity: **moderate, instrument coverage only** — the receipt's "two cold runs" provenance rests on the author, not the instrument; it is not a false admission of any row predicate, because the replayed run still carries true predicate evidence and the counter's own live session independently re-tests all 16 admitted rows. This is a coverage finding against the frozen instrument, not a repair request and not a new defect in the landed claim's evidence.

## Instrument provenance (all hashes computed this session)

- Counter bytes extracted from the freeze commit: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin archive a4bfef0f75027c915e715649950b1d46dcb33d83 -- .ufo/waves/round-35/counters/c2-firefox-bidi.mjs | tar -x -C $S/frozen` → sha256 `7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e` = `claims.json` `frozenDigests[".ufo/waves/round-35/counters/c2-firefox-bidi.mjs"]`, and `git show 083c5c6…:<counter> | sha256sum` = same → the integration rev carries the frozen bytes.
- Gate at the integration rev: `git show 083c5c6…:scripts/check-bidi-runtime.mjs | sha256sum` → `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` = the counter's `GATE_SHA256` (counter line 62).
- Environment: node v24.21.0; geckodriver 0.37.1 (`300705c65d1b`); Firefox `/home/vgpnk/.local/opt/firefox-158.0.1/firefox`. No tools installed this round.
- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` (exit 0), `git -C $S/clone checkout -q --detach 083c5c6…`, `rev-parse --show-toplevel` = the clone (asserted before every commit). All lane scripts ran only there; the lane checkout was never written.

## Command shape (every probe)

```
test "$(git -C $S/clone rev-parse --show-toplevel)" = "$S/clone" \
  && git -C $S/clone add -A \
  && git -C $S/clone -c user.name=MutDriverReceipt -c user.email=MutDriverReceipt@scratch.local commit -q -m "mutant …" \
  && git -C $S/clone rev-parse HEAD                       # exit 0
TMPDIR=$S/tmp node $S/frozen/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs \
  --repo $S/clone --rev <mutant-sha> | tee $S/logs/<name>.log; echo EXIT=${PIPESTATUS[0]}
git -C $S/clone reset -q --hard 083c5c643be7aa5965a5de3458a32ed0d289ead3   # exit 0, status clean after every probe
```

Baseline on the pristine clone (exit 0, 2.0 s): `predicate=met population=17 admitted=16 failing=0 unmeasured=1 entry=- receipt=- binding=-` — detector healthy before any mutant.

## Mutant table

| # | Mutant (single point, committed at) | Expected detector (frozen clause) | Counter result (admitted/failing/binding/exit) | Verdict |
|---|---|---|---|---|
| M1 | run1.jsonl:52-53 deleted — the `send id=22 network.continueRequest` frame and its success response (blocked `beforeRequestSent` at :51 kept); receipt run1 `transcriptSha256` `0ef2e7e5…`→`a5727f7e…` (commit `809d60f0`) | gate R13 predicate (`check-bidi-runtime.mjs:341-349`) fails on run1 → `t2-run` | R13 `t2-run detail="run1: blocked request never continued"`; admitted 15, failing 1, binding −, **exit 1** | **killed** |
| M2 | run2.jsonl := byte-copy of run1.jsonl with `sessionId` and `webSocketUrl` session segment rewritten `0bbeca6a-…`→`e6297406-…` (run2.jsonl:1); receipt run2 sha `6754ec2d…`→`f3d14efc…` (commit `4e83bee9`) | none exists: counter:382-410 requires only distinct paths/sha256s/sessionIds; gate `recordFromTranscript` (:216-244) sees no timestamps or per-run nonce | **predicate=met, admitted 16, failing 0, binding −, exit 0** | **SURVIVED** |
| M3a | one base64 char of run2.jsonl:22 first-screenshot data changed (char 6000, `4E+I5…`→`5E+I5…`); receipt sha left stale (commit `522a8e2c`) | counter:394 transcript sha guard | receipt `"transcript sha256 differs: …/run2.jsonl"`; admitted 0, failing 16, binding −, **exit 1** | **killed** (integrity guard) |
| M3b | same one-char screenshot change; receipt run2 sha updated to `ed64607f…` to isolate the binding clause (commit `e6d5e01b`) | counter:428 first-screenshot byte equality across runs | binding `"first screenshots absent or differ between runs"`; admitted 0, failing 16, **exit 1** | **killed** |
| M4 | receipt.json:4 top-level `browserVersion` `"158.0.1"`→`"158.0"` (observed-array copies untouched) (commit `a07734f8`) | counter:430 browserVersion equality runs↔receipt (gate R1 :277-289 also fails vs live) | binding `"browserVersion differs between runs or from the receipt"`; admitted 0, failing 16, **exit 1** | **killed** |
| M5 | driver `scripts/bidi-firefox-loopback-round35.mjs:50` import gains `PREDICATES` (outside `DRIVER_ALLOW`, counter:80); receipt `driverSha256` `fb8c5fdf…`→`b80cbe9a…` to isolate the independence clause (commit `3c0ef2af`) | counter:161-186 `driverFinding` | receipt `"driver has a named relation to the gate beyond the allow-list (./check-bidi-runtime.mjs)"`; admitted 0, failing 16, **exit 1** | **killed** |
| M6 | entry `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:5` `source:` line stripped of all 9 S-id tokens (S134-S141, S007, S124, S125) (commit `65a4c5cf`) | counter:366 `s1-source-row` | entry=`s1-source-row`; admitted 0, failing 17, **exit 1** | **killed** |
| M7 | entry:120 R16 Measured cell `"no — no BiDi command in the draft (§7.3.3)"`→`"yes"` (commit `c06383ec`) | counter:448 `x2-no-counterpart` | R16 `x2-no-counterpart`; admitted 16, failing 1, binding −, **exit 1** | **killed** |

Tally: **killed 7, survived 1, inconclusive 0.**

## What M2's survival means (the coverage finding)

The counter did real work on the replay and still passed it: transcript paths distinct ✓, transcript sha256s distinct ✓ (the id rewrite changes the bytes), sessionIds distinct ✓ (`e6297406-…` vs `0bbeca6a-…`), Firefox-shaped session ✓, UUID context ids ✓, binding ✓ (run2's first screenshot is run1's, which equals the receipt's `firstScreenshotSha256` and the counter's own live session), gdv/browserVersion equal ✓, all 16 row predicates hold on both runs and live ✓. The only thing distinguishing the replay from a second cold run is a UUID string the author chose. Nothing in the counter (or the transcript format it parses) binds a committed run to a distinct execution — no timestamps, no per-run nonce, no cross-check of `receipt.observed` (which the counter never reads). So "two committed Firefox runs" is proven by this instrument as "two distinct byte strings with Firefox-shaped, mutually consistent headers", and the receipt's two-cold-runs provenance is authorial, not instrumented. Row admission is unaffected: the live leg re-tests every admitted row on a session the counter starts itself, so even a fully fabricated run pair cannot admit a row the live session fails.

## Observations (cosmetic, not defects)

- When the live leg is skipped because an entry finding is set (M6), the binding block still runs and reports `binding="live session failed: null"` (counter:431) instead of staying null; the predicate is already false via `entryFinding`, so no verdict impact. With a receipt finding (M3a, M5) the binding block short-circuits and binding stays null.
- The counter's live leg ran in 6 of 9 runs (baseline, M1, M2, M3b, M4, M7); M3a/M5/M6 exited at the receipt/entry clause without a browser. Its non-loopback live-leg limit is the already-recorded lesson round-35 M3 — not re-reported.

## Hygiene

- Restoration: after every probe `git -C $S/clone reset -q --hard 083c5c6…`; final `git -C $S/clone rev-parse HEAD` = `083c5c643be7aa5965a5de3458a32ed0d289ead3`, `git status --porcelain` empty.
- Processes: `pgrep -af 'tabi-r35/MutDriverReceipt|tabi-r35-c2-live'` → no matches (exit 1); the counter tears down its own geckodriver/fixture (its `finally` block); no browser or driver process of mine survives.
- Scratch `/fast/scratch/hyaku/tabi-r35/MutDriverReceipt/` (clone, frozen counter, logs, tmp) deleted before this report was finalized; receipts (all 9 counter logs + `summary.json`) copied to the output dir first.
- No lane tracked file, lane git index, fleet file, or sibling repo was written; the only lane-tree writes are this report and the seat output dir.

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-35/w2/MutDriverReceipt.md` (this file)
- Output dir: `tabi-shokunin/.ufo/waves/round-35/w2/MutDriverReceipt/` — `summary.json` (machine-readable table + provenance) and logs `m0-baseline.log`, `m1-drop-r13-run1.log`, `m2-run2-replay.log`, `m3a-shot-byte-stale-sha.log`, `m3b-shot-byte-sha-updated.log`, `m4-browserversion-158.0.log`, `m5-driver-imports-gate.log`, `m6-entry-source-ids-stripped.log`, `m7-r16-yes.log`
- Mutant commits (scratch clone, deleted with the scratch; shas recorded above and in `summary.json`): `809d60f0`, `4e83bee9`, `522a8e2c`, `e6d5e01b`, `a07734f8`, `3c0ef2af`, `65a4c5cf`, `c06383ec`
