# RerunC2 — wave w2, round 35, tabi lane (C2 milestone)

## Verdict

**Holds.** The frozen C2 counter (bytes `git show a4bfef0f75027c915e715649950b1d46dcb33d83:.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`, sha256 `7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e`, 31,040 B — equal to `claims.json` `frozenDigests[".ufo/waves/round-35/counters/c2-firefox-bidi.mjs"]`) was re-run twice, ~3 minutes apart, at the wave-1 integration `083c5c643be7aa5965a5de3458a32ed0d289ead3` in a clean `--shared` clone with `TMPDIR` under seat scratch. **Both runs: exit 0, predicate true, population 17, admitted 16, failing 0, unmeasured 1 (R16 `no`), entryFinding null, entryDetail null, receiptFinding null, binding null**, and the two stdout JSON files are **byte-identical** (sha256 `b28876f1f1003b995da5b98abf4c7c3ac456023b0f0312733323a93b2c2c15ab` for both; `cmp` clean). The counter's own live Firefox leg ran in both passes (28 commands, 20 events) and its first-screenshot digest `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` equals the frozen pre-freeze instrument check's shot (`.ufo/waves/round-35/baseline/c2-instrument-check.json`, both sessions). Because `admitted` is 16, the run also satisfies the **declared** predicate (`admitted >= 16`, claims.json C2), so the known M1 threshold gap (counter `TARGET = 14`, `c2.mjs:66`) did not drive this reading. Binary digests match the census tail and chain through S140/S141 (QUALITY 99): no mismatch. No new defect found; known defects M1/M3/M4 were not re-triggered and are not re-reported.

## Evidence

### Commands and exit codes

```
# counter bytes from the freeze
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show \
  a4bfef0f75027c915e715649950b1d46dcb33d83:.ufo/waves/round-35/counters/c2-firefox-bidi.mjs \
  > $S/c2.mjs          # sha256 7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e, 31040 B (re-hashed on disk)

# clean clone
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3
#   rev-parse HEAD -> 083c5c643be7aa5965a5de3458a32ed0d289ead3 ; rev-parse --show-toplevel -> $S/clone

# pass 1 — exit=0, 2693 B stdout, 0 B stderr, wall ~2 s
TMPDIR=$S/tmp node $S/c2.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 \
  --repo $S/clone --json > $S/out/run1.json 2> $S/out/run1.err ; echo "exit=$?"

# pass 2 — after `sleep 180` (~3 min later) — exit=0, 2693 B stdout, 0 B stderr
TMPDIR=$S/tmp node $S/c2.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 \
  --repo $S/clone --json > $S/out/run2.json 2> $S/out/run2.err ; echo "exit=$?"

sha256sum $S/out/run1.json $S/out/run2.json   # both b28876f1f1003b995da5b98abf4c7c3ac456023b0f0312733323a93b2c2c15ab
cmp $S/out/run1.json $S/out/run2.json          # byte-identical
```

($S = `/fast/scratch/hyaku/tabi-r35/RerunC2`, deleted after receipts were copied; node v24.21.0.)

### Counter output fields — identical in both runs

| field | value |
|---|---|
| `population` | 17 |
| `admitted` | **16** |
| `failing` | **0** |
| `unmeasured` | 1 (R16, verdict `no`) |
| `entryFinding` / `entryDetail` | null / null |
| `receiptFinding` | null |
| `binding` | null |
| `predicate` | true (exit 0) |
| `gateSha256` | `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` — the counter itself verified `scripts/check-bidi-runtime.mjs` at REV against this frozen pin (`c2.mjs:59`, `loadGate` `c2.mjs:326-331` refuses any mismatch); equal to claims.json `frozenDigests` pin |
| `sourceWitness` | `{"id":"S134","gate":"corpus/lessons/round-35.md:15","host":"firefox-source-docs.mozilla.org"}` |
| `provenance` | run1 sessionId `0bbeca6a-dbcc-4219-a397-ea458e786a1d`, run2 `8efe5e35-f4a9-4247-b3c7-246f692fe2ea` (the two committed transcripts; pairwise-distinct geckodriver-UUID sessionIds, both `moz:geckodriverVersion` 0.37.1, `browserVersion` 158.0.1, UUID browsing contexts) |
| `live` | firefox 158.0.1 / geckodriver 0.37.1, 28 commands, 20 events, `firstShotSha256` `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` |

The live first shot equals the shot recorded for **both** sessions in the frozen instrument check (`.ufo/waves/round-35/baseline/c2-instrument-check.json`, sessions `59aa1fd4…` and `df776540…`, `"shot":"7a3ae6a9…"`), i.e. the pre-freeze oracle picture reproduced post-integration.

### Every row reason — both runs

All 17 rows have `reason: null, detail: null` in both runs; admission follows the verdict cell:

- **R1–R15, R17** (entry lines 105–119, 121): verdict `yes`, admitted true, reason null — each row's frozen gate predicate held on both committed runs (t2) and on the counter's live session (l1).
- **R16** (entry line 120): verdict `no` ("no — no BiDi command in the draft (§7.3.3)"), admitted false, reason null → counted **unmeasured, not failing**, exactly as the entry and the counter define; the `x2-no-counterpart` refusal would only fire on an R16 `yes`.

### Binaries — versions, digests, QUALITY 99 comparison

```
/home/vgpnk/.local/opt/firefox-158.0.1/firefox --version  -> Mozilla Firefox 158.0.1
/home/vgpnk/.local/bin/geckodriver --version              -> geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)
sha256(firefox)     = a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789
sha256(geckodriver) = f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f
```

Comparison (recorded, no mismatch):

- **Census tail** (`corpus/knowledge/browser-surface-census.md`, appended 2026-10-26 block): pins exactly `sha256(firefox)` = `a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789` and geckodriver 6,029,440 B sha256 `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f` with the same `--version` string. **Both digests match byte-for-byte.**
- **S140** (`corpus/SOURCES.md:154`) pins the *published* `firefox-158.0.1.tar.xz` digest (SHA256SUMS 551,210 B, `.asc` verifies Good, signature 2026-10-19T23:59:50Z under Mozilla release key `14F26682D0916CDD81E37B6D61B7B526D98F0353`) and its scope explicitly excludes installed-tree bytes — so the installed-binary binding correctly lives in the census row above, which matches. Provenance chain intact: release → signed SHA256SUMS → unpacked tree → measured binary.
- **S141** (`corpus/SOURCES.md:155`) pins the geckodriver v0.37.1 linux64 tarball (`e815130e…`, `.asc` Good but by subkey `09BEED63F3462A2DFFAB3B875ECB6497C1A20256`, marked revoked 2026-08-06 — digest-bound, no signature trust) and quotes the release text "0.37.1 (2026-07-20, **300705c65d1b**)" — the build id in my measured `--version` output matches that pinned build id.

### Known defects — status in this re-run (not re-reported as new)

- **M1** (counter threshold 14 vs declared 16): present in the frozen bytes (`const TARGET = 14;`, `c2.mjs:66`). Not load-bearing here: admitted is 16, so the declared predicate `admitted >= 16` holds on both runs independently of the weaker frozen threshold.
- **M3** (counter's own live leg not loopback-only): the live leg I observed exercised only the gate's loopback fixture (`serveFixture`, `fx.base` URLs) via free ports; the recorded defect stands as recorded, unexercised either way by this re-run.
- **M4** (counter accepts caller-named fake binaries): I passed no `--firefox`/`--geckodriver` overrides; the frozen default paths were used and their digests pinned above, so the acceptance hole was not exercised.

### Hygiene

- Ports: chosen by the counter's `freePort()` on 127.0.0.1 (`c2.mjs:193-198`); the 9222 musketeer lease port was never bound, connected to or probed. During pass 2 a sibling seat's live leg (profile-root under `…/MutDriverReceipt/tmp/tabi-r35-c2-live-…`) was concurrently in flight on other ports with no collision.
- The counter SIGTERMs its geckodriver and `rmSync`s its scratch in `finally` (`c2.mjs:317-321`); post-run `pgrep -af 'RerunC2'` → exit 1 (no process of mine remained; the only `tabi-r35-c2-live` matches belonged to the sibling seat and were left untouched).
- Scratch `/fast/scratch/hyaku/tabi-r35/RerunC2` deleted after receipt copy; zero `RerunC2` entries remain under `/fast/scratch/hyaku/tabi-r35/`. `/tmp` untouched.
- Tooling record: **no installs or upgrades performed** (node v24.21.0 already present; Firefox 158.0.1 and geckodriver 0.37.1 were installed earlier this round and are pinned by the census — this seat only version-checked and digest-pinned them).

## Residual risk and verification gaps

- Two clean spaced runs on one host show stability at this integration but not cross-host determinism; this is the canonical runtime only.
- The counter is the oracle: row admission rests on the frozen gate predicates applied to the two committed transcripts plus one live session. The feasibility note's residual (a forged transcript pair matching the live first screenshot byte-for-byte is not excluded by this counter) applies unchanged; the digests here bound what I ran, not what the transcripts contain beyond the counter's checks.
- Wall-clock spacing was implemented as `sleep 180` between passes (~3 min; pass-1 wall ~2 s, pass-2 job 182.19 s including the sleep); exact UTC timestamps of the passes were not captured.
- Exit-code semantics per frozen counter: 0 = predicate met, 1 = evaluated-not-met, 2 = could-not-evaluate; both passes exited 0.

## Deliverable paths

- Report: `.ufo/waves/round-35/w2/RerunC2.md` (this file, at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/RerunC2.md`)
- Receipts (copied before scratch deletion; run JSONs sha256 `b28876f1f1003b995da5b98abf4c7c3ac456023b0f0312733323a93b2c2c15ab` each):
  - `.ufo/waves/round-35/w2/RerunC2/run1.json`
  - `.ufo/waves/round-35/w2/RerunC2/run1.err` (0 B)
  - `.ufo/waves/round-35/w2/RerunC2/run2.json`
  - `.ufo/waves/round-35/w2/RerunC2/run2.err` (0 B)
