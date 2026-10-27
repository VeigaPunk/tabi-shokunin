# CritC2b — attack seat: C2-B3 (observed binder) + B2 (survivors), tabi round 37 w1

Frozen contract read first: `.ufo/waves/round-37/claims.json` (claim C2, predicate, kill rules,
before-states) and `corpus/lessons/round-36-verifier-spotcheck.md` (routed defects 8 → B1/B2/B3).
Measured rev for the C2 honest fixture: `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
(= `claims.json.frozenAt`; frozen baseline `c2r37-J3-honest-v3.json` names it).
Worktree counter byte-matches `frozenDigests.c2` (`eda339eb…2e019`); gate matches
`GATE_SHA256` (`370e8e95…6c87`). No tool installs were needed (node v24.21.0; lane-pinned
Firefox 158.0.1 + geckodriver 0.37.1 already present).

Method: lane cloned into my scratch (`git rev-parse --show-toplevel` asserted == clone dir);
attack fixtures committed on top of `ed8ccfc`; counter driven as
`node …/c2-firefox-bidi-v3.mjs --repo <clone> --rev <fixture> --json` with `TMPDIR` under my
scratch. Browser ran headless against the counter's own loopback fixture only.

## Honest control (reproduces frozen J3)

exit 0 · predicate true · admitted 16/17 · failing 0 · egress non-loopback 0 · survivors 0.
(`evidence/honest-repro.json` — matches `baseline/c2r37-J3-honest-v3.json`.)

## (a) Display-only declaration vs outside-set tamper

Header, lines 16–19, quoted verbatim:

> B3 receipt runs[*].observed decorations are bound where derivable from the
> transcript-derived record — session caps/websocket segment, context count,
> viewport, first-screenshot sha — and a mismatch is a receipt finding; steps
> outside that derivable set stay declared display-only

Code binds exactly four steps (`observedFinding`, lines 413–428): `session`
(browserVersion / geckodriverVersion / sessionId≠'uuid' / webSocketUrl-segment-if-parseable),
`getTree.contexts` (number only), `setViewport` w×h, `captureScreenshot.sha256`.

**Attack A** — both runs' receipts falsified on four decorations the transcript provably
derives (`recordFromTranscript` keeps every `script.evaluate` response and `network.getData`
body): `#out textContent` → `clicked:FORGED-DECORATION`; `held body` → `forged-held-body`;
`fetch /data.txt` → `forged-fetch-body`; `window.innerWidth` → `1024`.

**Result: exit 0, predicate TRUE, receiptFinding null** (`evidence/attack-A-display-only-tamper.json`).

Side by side: the header says steps outside the derivable set "stay declared display-only";
the tamper shows the unread residue includes transcript-derivable facts. The declaration is
truthful about *which set is bound* (code == header), but "bound **where derivable**"
overstates coverage — most derivable content (evaluate results, bodies, intercept ids, event
URLs) is unauthenticated. Classification: **by-design admit, declared**; no kill-rule trip
(kill rule targets the frozen J2 fixture, a bound-field tamper). Round-38 candidate: extend
binding to the remaining derivable decorations, or reword the header so the bound set is
exhaustive of binding rather than implied exhaustive of derivability.

## (b) sessionId / webSocketUrl

- **B4 control**: `sessionId` → different real UUID ⇒ **exit 1**, `receiptFinding: run1:
  observed session.sessionId != transcript sessionId`. The bound field is enforced.
- **B1**: `webSocketUrl` port `39419`→`1`, same session segment ⇒ **exit 0, predicate TRUE**.
  Accepted — correct classification: the derivable identity is the session segment
  (`WS_SESSION` captures `([0-9a-f-]+)` after `/session/`); the port is transport, not
  identity. Matches the declaration.
- **B2**: `webSocketUrl` → `ws://203.0.113.7:4444/session/<sid>` (non-loopback host, same
  segment) ⇒ **exit 0, predicate TRUE**. FINDING: a claimed URL that contradicts the
  transcript (the transcript's own `caps.webSocketUrl` must be loopback — `sessionOf` line
  ~382) and contradicts the `live.egressNonLoopback == 0` requirement's spirit is silently
  admitted: lines 419–421 only check when `WS_SESSION` parses; an unparseable claim is
  skipped, never found.
- **B3**: `webSocketUrl` → `garbage-not-a-url` ⇒ **exit 0, predicate TRUE**. Same silent-skip.

Smallest safe correction (round-38; no counter byte may change after data this round):
any *claimed* `webSocketUrl` string must parse as a loopback ws session URL and its segment
must equal the transcript sid — replace the `if (m && …)` gate with
`if (!m) return "… observed session.webSocketUrl is not a loopback ws session url";`.

## (c) Survivor check false positive (B2)

Header, lines 13–15:

> B2 live-leg teardown hygiene: after SIGTERM + close, the session's firefox/
> geckodriver processes must be gone (survivors are SIGKILLed and counted); the
> predicate requires live.survivors == 0

`scratchSurvivors` (lines 467–477) counts **any** `/proc/*/cmdline` containing the live
scratch dir string — no firefox/geckodriver identity test, no descent-from-geckodriver test.

**Attack C**: a watcher spawned `bash -c 'exec -a "$0" sleep 300' <scratch>/injected-dummy`
the instant `tabi-r36-c2-live-*` appeared (argv[0] names the scratch dir; the process has
nothing to do with firefox). **Result: counter exit 1, predicate FALSE, survivors 1**, with
entry/receipt/binding all clean, admitted 16, egress 0 (`evidence/attack-C-survivor-falsepositive.json`).
The counter SIGKILLed my unrelated sleep (reaped by scan time). An honest measurement fails
solely because an ambient process names the scratch path — stale `tail`, editor session,
crashed-run leftover, or any concurrent process on a shared host.

Classification: **fixable defect** — implementation overcounts versus its own declaration.
It requires local concurrency to trigger and fails safe (predicate false, exit 1), so it is a
liveness hazard, not a forgery path. Smallest safe correction:
`if (cmd.includes(scratch) && /(?:^|\/)firefox(?:-bin)?\b|geckodriver/.test(cmd))`.

## (d) Live leg fails entirely → survivors null

Driver imported the counter's `evaluate()` with a stub `liveRunner` that throws a plain
Error. **Result: predicate false, survivors null, egress null,
binding = "live session failed: simulated live-leg total failure", exit 1**
(`evidence/attack-D-livefail.json`, `evidence/livefail-driver.mjs`). Both guards fire:
`out.survivors === 0` rejects `null` (line 683) and the binding finding records why. Covered.

## Claim impact

No kill rule tripped: v3 admits the honest state; v3 refuses bound-field observed tamper
(B4 above; frozen `c2r37-J2` baseline records exit 1 over its captureScreenshot tamper);
survivors are counted (over-broadly); the predicate sentence is byte-identical across
claims.json, header line 72, and receipt `predicateSentence` (spot-checked). The claim
stands. Findings are round-38 hardening candidates since no counter byte may change after data.

VERDICT finding claim-c2-verified-at-ed8ccfc-but-two-fixable-defects-demonstrated: survivor check false-positives on any process whose cmdline names the live scratch dir (honest run scored predicate false, survivors=1); observed webSocketUrl silently admits non-loopback or garbage claims (exit 0 both); display-only residue includes transcript-derivable decorations (declared by design, header overstates derivability coverage)
