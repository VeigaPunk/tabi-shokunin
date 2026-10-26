# Wave 2 seat report — CritReceiptTranscripts (C2 receipt & transcripts attack)

Items attacked: the committed C2 receipt and transcripts
`corpus/evidence/round-35/bidi-firefox/` (receipt.json, run1.jsonl, run2.jsonl) at the
wave-1 integration commit `083c5c643be7aa5965a5de3458a32ed0d289ead3`, plus one cheap forgery
against the frozen counter `c2-firefox-bidi.mjs` scored in a scratch clone.

## Verdict

**Holds.** Every check the seat was asked to run passes on the committed artifacts: schema
fields, `fixtureSha256` == the gate's `FIXTURE_SHA256` (`343cbced…`), driver path +
`driverSha256` (and the driver's static imports are exactly the allow-list
`FIXTURE_SHA256, VIEWPORT, serveFixture` — no counter import), transcript sha256s match the
receipt, and each transcript is a coherent single session: distinct UUID session ids
(`0bbeca6a-…` vs `8efe5e35-…`), distinct ws ports (39419 vs 38493), monotone `seq` 1..77,
every send has exactly one matching `recv` success, no orphan responses, events interleave
plausibly (network events for a request precede its completed event; `browsingContext.load`
precedes the navigate response; the blocked `beforeRequestSent` follows `addIntercept` and
precedes `continueRequest`; the prompt event precedes `handleUserPrompt`), and events carry
real wall-clock `timestamp`s that differ across runs (~2.1 s apart). Run1/run2 differ only in
per-session identity and timing fields (UUIDs for session/context/clientWindow/realm/
sharedId/navigation/subscription/collector/intercept, request-id counters, ports, processIDs,
profile scratch paths, event timestamps) — the fixture is static and the recipe is
deterministic, so the semantic content is identical by construction. Both runs' first
screenshots decode to the same 9,451-byte 640×480 PNG with sha256
`7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` = the binding value. I
re-ran the frozen counter (live Firefox leg) at the integration rev: exit 0, `admitted 16,
failing 0, unmeasured 1 (R16 no), entryFinding null, receiptFinding null, binding null`,
matching the recorded integration facts. **No defect in the committed receipt/transcripts.**

**One cheap forgery is NOT caught (disclosed tradeoff, low severity).** A pure text-level
replay — `run2` rebuilt from `run1` with relabeled session/context/realm/sharedId/
navigation/request UUIDs, shifted timestamps (+3000 ms), processIDs, and a new ws port, with
the receipt's `run2.transcriptSha256` updated — is accepted by the frozen counter at a forged
rev (`d1cb3734…`): exit 0, predicate true, admitted 16, failing 0, binding null. The counter
binds shape and identity, not two independent sessions; this is precisely the limit the
knowledge entry discloses ("A fabricated transcript pair that reproduced Firefox's rendering
of this fixture byte-for-byte would not be excluded … the binding proves the fixture was
rendered by this build, not that these two runs happened" — entry §Limits). Verdict:
disclosed tradeoff, not a new defect; the counter's live leg is what re-visits the rows on a
session the counter itself starts.

## Evidence

All paths under the lane root unless noted. Scratch root `$S=/fast/scratch/hyaku/tabi-r35/CritReceiptTranscripts`.

### 1. Setup + byte hashes (sha256sum, exit 0)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3   # HEAD = 083c5c6…
sha256sum corpus/evidence/round-35/bidi-firefox/receipt.json  → 58d5142c0d5e82e189aedfe8eceb1ba70779404d26c0bdcd2ad7b16d5821f881
sha256sum corpus/evidence/round-35/bidi-firefox/run1.jsonl   → 0ef2e7e5c20241565aa4b307bddbac9886c8099cca80360660bbbbcb16a2f62a  (== receipt)
sha256sum corpus/evidence/round-35/bidi-firefox/run2.jsonl   → 6754ec2dca56c417341431f00cf773964bec68ad10b35e2e6aeb32f92a06f687  (== receipt)
sha256sum scripts/bidi-firefox-loopback-round35.mjs          → fb8c5fdfeb4350948dc7b62c26883b657efe5d0190274dbd8c0ea8716320ba9b  (== receipt)
sha256sum .ufo/waves/round-35/counters/c2-firefox-bidi.mjs   → 7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e  (== frozen digest)
sha256sum scripts/check-bidi-runtime.mjs                     → 370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87  (== frozen digest)
```

### 2. Schema + fixture hash (node, exit 0)

Receipt (receipt.json:1-8, 311-317): `schema "tabi-bidi-receipt-v1"`, `browserVersion
158.0.1`, `browserName firefox`, `geckodriverVersion 0.37.1`, `driver
scripts/bidi-firefox-loopback-round35.mjs`, `driverSha256 fb8c5fdf…`,
`firstScreenshotSha256 7a3ae6a9…`, binaries block with version lines.

```
node -e 'import("./scripts/check-bidi-runtime.mjs").then(m=>console.log(m.FIXTURE_SHA256))'
→ 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843 == receipt fixtureSha256 (receipt.json:3)
```
(`FIXTURE_SHA256` definition: check-bidi-runtime.mjs:182; counter check: c2-firefox-bidi.mjs:378.)

Driver imports (bidi-firefox-loopback-round35.mjs:43-50): only node built-ins plus
`import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs"` —
exactly `DRIVER_ALLOW` (c2-firefox-bidi.mjs:80); no import of the counter; DNS-off prefs
present at :155 (`network.dns.disabled: true`, `network.trr.mode: 5`).

### 3. Real-session structure (analysis script, exit 0)

Per transcript (77 lines): `seq` = 1..77 monotone; sends 28, all with exactly one matching
`recv` success; no orphan responses; 20 events (`network.beforeRequestSent` 8,
`network.responseCompleted` 8, `browsingContext.load` 3, `browsingContext.userPromptOpened`
1). Identity:

| field | run1 | run2 |
|---|---|---|
| sessionId | `0bbeca6a-dbcc-4219-a397-ea458e786a1d` (run1.jsonl:1) | `8efe5e35-f4a9-4247-b3c7-246f692fe2ea` (run2.jsonl:1) |
| ws port | 39419 | 38493 |
| ws segment == sessionId | yes | yes |
| context | `658356ec-b45e-45b8-ba2d-e313609aef68` (run1.jsonl:5) | `cff1dabb-c9ca-4aa0-99d2-7f2a07f22256` (run2.jsonl:5) |
| moz:processID | 903535 | 907916 |
| browserVersion / gdv | 158.0.1 / 0.37.1 | 158.0.1 / 0.37.1 |
| event timestamps | 1793050353029–1793050353330 | 1793050355145–1793050355460 |

First screenshot: `browsingContext.captureScreenshot` response data decodes to a PNG with
IHDR 640×480, 9,451 bytes, sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`
(run1.jsonl:22, run2.jsonl:22) — matches receipt `firstScreenshotSha256` (receipt.json:311)
and the pre-freeze instrument check (`baseline/c2-instrument-check.json`, both sessions).

Structural diff (identity-normalized JSON tree): 77 lines each; 19 lines differ, every one
differing only in per-session identity/timing tokens (session/context/clientWindow/realm/
sharedId/navigation/subscription/collector/intercept UUIDs, request-id integer prefixes,
ports, processIDs, profile paths, event timestamps). Command sequence and event sequence are
identical — deterministic recipe over a static fixture.

### 4. Frozen counter at the integration rev (node, exit 0)

```
TMPDIR=$S/tmp node $S/clone/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs \
  --repo $S/clone --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --json
exit 0
population 17, admitted 16, failing 0, unmeasured 1 (R16 no), entryFinding null,
receiptFinding null, binding null, predicate true
live: browserName firefox, browserVersion 158.0.1, geckodriverVersion 0.37.1,
      firstShotSha256 7a3ae6a9…, commands 28, events 20
sourceWitness: S134 @ corpus/lessons/round-35.md:15 (firefox-source-docs.mozilla.org)
```

### 5. Forgery scored (exit 0 — not caught)

Forgery script `$S/forge/make-forgery.py` (python3, exit 0): rebuilds `run2.jsonl` from
`run1.jsonl` — global relabel of every UUID (session, context, clientWindow, realm,
sharedId, navigation, subscription, collector, intercept, request-id suffixes), request-id
integer prefixes +1, ws url port 39419→45678, timestamps +3000 ms, processIDs +1; receipt
`run2.transcriptSha256` updated to `03d6aed3fbdf90a8764a4b07c08637ecfa2c958365faf9cceeb6545f3faeb38c`;
run1 untouched. Consistency verified (all event contexts = new context; 8 distinct request
ids each with before+completed pairs; no old run1 tokens survive). Committed in the scratch
clone:

```
git -C $F add corpus/evidence/round-35/bidi-firefox/receipt.json corpus/evidence/round-35/bidi-firefox/run2.jsonl
git -C $F commit -q -m "forgery: run2 replayed from run1 with relabeled identity"   # d1cb3734d52303adfa82082efd9514be775b363e
TMPDIR=$S/tmp node $F/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs --repo $F --rev d1cb3734… --json
exit 0 — predicate true, admitted 16, failing 0, unmeasured 1, receiptFinding null, binding null
provenance: run1 0bbeca6a-… / run2 895d68ba-a52e-4de1-9b9c-47386f556ac1 (both UUID; distinct)
```

This is the entry's disclosed Limits case ("the binding proves the fixture was rendered by
this build, not that these two runs happened" — webdriver-bidi-firefox-runtime-round-35.md
§6), beyond lesson M4's fake-binary route: the receipt shape cannot distinguish a replayed
transcript from a second real session. Severity: low, disclosed, not a defect of the
committed evidence.

### Cleanup
Scratch removed after copying artifacts; `pgrep -af geckodriver|firefox` returned none after
the counter runs (counter teardown: ws close, `DELETE /session/<id>`, SIGTERM to
geckodriver, scratch rm — c2-firefox-bidi.mjs:284-292).

## Deliverable paths
- Report: `.ufo/waves/round-35/w2/CritReceiptTranscripts.md` (this file)
- Output dir `.ufo/waves/round-35/w2/CritReceiptTranscripts/`:
  - `counter-at-integration.json` (frozen counter at 083c5c6…, exit 0)
  - `counter-at-forgery.json` (frozen counter at forged d1cb3734…, exit 0)
