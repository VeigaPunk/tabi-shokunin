HOLDS

Seat R76Exec1, round 76 wave 1. Axes: coverage (predicate legs b, c). All numbers below are measured in this run; every claim carries its command and exit code or path.

## Pinned digests (freeze check)

Command: `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && grep -E '^[0-9a-f]{64}  ' .ufo/waves/round-76/freeze.txt | while read -r d p; do sha256sum "$p" | cut -d' ' -f1 ...` — rc=0, 7/7 OK, no MISMATCH lines:

| File | Digest | Result |
|---|---|---|
| scripts/chrome-cdp-dialog-round76.mjs | 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 | OK |
| scripts/check-dialog-r76.mjs | 505055381ee4d4697a0f2c4fad69f661b64a0adabd44ab451a97b3cd30dddcf4 | OK |
| scripts/negatives-dialog-r76.mjs | 91874c87e26deda667d6ff7e0b772f647bae2ab1a11996d473bdf93e09e8474c | OK |
| .ufo/waves/round-76/controls/c1/kill-power-r76.mjs | 80107844ba3286d2e8091b7d9bf0c07406f79acab68076c879c5f17fe535aca1 | OK |
| .ufo/waves/round-76/controls/c1/prior-set.txt | 30f7418a6419b9676d9f335324b2a8f1099505114852e5831087c4c3c1e27e5b | OK |
| .ufo/waves/round-76/claims.json | aa835a8c82b597f2ac9536662e8459c790ab90769f744c3c043cba6e70f6b02e | OK |
| .ufo/waves/round-76/run-scored.sh | 6dd74d285453b436d0d9c2f5184f1c9cfb23a1289a784409ab8221cad92f84ca | OK |

## Leg (b) — independent cold run: HOLDS

1. Driver, run exactly once (no re-run; rc was 0, not a usage refusal): `S=/fast/scratch/hyaku/tabi-r76/R76Exec1; mkdir -p $S/d && TMPDIR=$S/d node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-dialog-round76.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r76-exec1-97bf5d560d03 --http-port 56379 --cdp-port 52601` (ports proven free via `ss -ltn` before launch) — **rc=0**, receipt written 39713 bytes, 10/10 legs present, `failures: []`, teardown clean (`postKillSweepCount 0`, portProbes both `closed`). Observed behavior matches the frozen surface: alert→undefined; confirm→true/false; prompt→`string:tabi-typed` / `string:` on accept without promptText / `null` on dismiss (with `closed promptText "tabi-ignored"` echoed); no-dialog handle → `{code:-32602,message:"No dialog is showing"}`; beforeunload dismiss → `net::ERR_ABORTED`, path stays `/`; beforeunload accept → navigated `/next`; all input events `trusted: true`.
2. Receipt saved unmodified: `cp $S/receipt.json /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-76/w1/R76Exec1/receipt.txt`; `sha256sum` both = `13c75ac641014746e154c89015fc8a9aa95b159c9fbb7def82d5184a823b2ce3` (identical, never edited).
3. Counter: `node scripts/check-dialog-r76.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --receipt <w1/R76Exec1/receipt.txt> --expect-driver-sha256 152ffc…dd51 --expect-nonce tabi-r76-exec1-97bf5d560d03 --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --prior corpus/evidence/round76/chromium-js-dialog/receipt.json --json` — **rc=0**; output `.ufo/waves/round-76/w1/R76Exec1/counter.json`: `verdict "clean"`, `checkCount 131`, `findings []`, `nonce "tabi-r76-exec1-97bf5d560d03"`, `priorSet` length 18 (the committed 17 + the scored receipt passed as --prior).

## Leg (c) — independent re-run on the L1 scored receipt: HOLDS

1. Battery on scored receipt: `node scripts/negatives-dialog-r76.mjs --lane … --real corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 152ffc…dd51 --expect-nonce tabi-r76-l1-97bf5d560d03 --prior-set controls/c1/prior-set.txt --prior .ufo/waves/round-76/w1/R76Exec1/receipt.txt --laundered <the three frozen degenerate receipts> --work $S/n --jobs 6 --json` — **rc=0**; output `negatives-a.json`: `allOk true`, `passed 251`, `failed []`, `cases 251`, `coverageGap []`, `positiveOk true`, `refuseCases 241`, `mustAcceptCases 7`, `launderedCases 3`, `stoppedEarly false`.
2. Battery on MY receipt: same command with `--real .ufo/waves/round-76/w1/R76Exec1/receipt.txt --expect-nonce tabi-r76-exec1-97bf5d560d03 --prior corpus/evidence/round76/chromium-js-dialog/receipt.json --work $S/n2` — **rc=0**; `negatives-b.json`: `allOk true`, `passed 251`, `failed []`, `cases 251`, `coverageGap []`, `positiveOk true`, `launderedCases 3`, `stoppedEarly false`.
3. Kill power on scored receipt: `node .ufo/waves/round-76/controls/c1/kill-power-r76.mjs --lane … --real corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 152ffc…dd51 --expect-nonce tabi-r76-l1-97bf5d560d03 --prior-set controls/c1/prior-set.txt --prior .ufo/waves/round-76/w1/R76Exec1/receipt.txt --laundered <the three frozen degenerate receipts> --work $S/k --out .ufo/waves/round-76/w1/R76Exec1/kill-power-a.json --jobs 6` — **rc=0**; result: `holds true`, force-true `131/131` killed, semantic `56/56` killed (`killedPositive 3`), `survivors []`, `crashed []`, guard `{declaredChecks 131, forceTrueMutants 131, semanticMutants 56, ok true}`, both unmutated runs exit 0 (`unmutatedExit 0`, `unmutatedLastExit 0`). Matches the L1's scored measurement (force-true 131/131, semantic 56/56 incl. 3 killed-positive, crashed 0, guard ok).

## Verdict vs claims.json (frozen)

- Leg (b) holds as frozen: cold single driver run rc=0 with nonce tabi-r76-exec1-97bf5d560d03 and own ports; pinned counter exit 0 clean 131 on that receipt with frozen digest, expected nonce, committed prior set and scored receipt as --prior. ✔
- Leg (c) holds as frozen: battery exit 0 allOk true (coverageGap empty, positiveOk, 3 laundered cases) on the scored receipt, and kill power exit 0 holds true (131/131, 56/56, crashed empty, both unmutated runs survived, guard ok). ✔
- Digests: all 7 freeze.txt rows match; no instrument byte moved. Not attacked/amended: predicate, counter, pins, priors, thresholds, kill rule untouched.

## Artifacts kept (all under .ufo/waves/round-76/w1/R76Exec1/)

`receipt.txt` (cold-run receipt, sha256 13c75ac6…), `counter.json`, `negatives-a.json`, `negatives-b.json`, `kill-power-a.json`, `report.md`. Scratch `/fast/scratch/hyaku/tabi-r76/R76Exec1` removed (`rm -rf` rc=0). No tool installs this seat. No git mutations; read-only commands only. Bounds respected: writes only in w1/R76Exec1/ and scratch.

## Risks

None observed. One structural note (no action): the walk-invisibility of `.receipt.txt` is load-bearing and was exercised empirically — my counter run walked `.ufo/waves/round-76` while `w1/R76Exec1/receipt.txt` was already present and still returned clean 131, i.e. the walk ignored it as designed.
