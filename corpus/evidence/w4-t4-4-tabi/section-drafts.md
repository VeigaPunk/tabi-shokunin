# SKILL.md round-4 section drafts (T4-4) — pins filled at write time

## A. Ladder rung 4 row (table)

| 4 — **network** | per-step `Network`-domain slices (requestWillBeSent → responseReceived(+`ExtraInfo`) → loadingFinished/failed), client events + the server's wire log + cache class + timing + byte counts; bodies only via `Network.getResponseBody` on explicit request | "the page fetched X / got Y / got nothing" — claims where DOM and wire disagree (optimistic render vs wire error; client 200 vs wire 304) | `Network.enable` before navigation; slice per step; wire status from `responseReceivedExtraInfo`, byte counts from `loadingFinished`; keep the in-flight (issued, no response) slice too | @@RUNG-ANCHOR@@ |

## B. Ladder prose updates

- intro: "Climb to the rung the claim needs" — the ladder now has four rungs.
- Ladder rules paragraph gains: \* a network settle (in-flight request count / expected response event) before the shutter — §Settle-wait discipline; \* keep the pre-settle slice as the counterexample; \* name which network surface produced each fact (client slice vs wire log) — the two can disagree (wire 304 vs client 200, round 3) and neither is a substitute for the other.

## C. §Settle-wait discipline (new)

### Settle-wait discipline — wait for a predicate, capture the pre-settle state

A "settle" is a **predicate, not a duration**. The shutter opens when the run's own
state predicate holds — derived from the payload the page is expected to render, never
from a fixed sleep (round-2 split: hydration at ~150 ms and the confirm div at ~120 ms
were awaited, not slept).

- **Two witnesses for a settle.** The DOM predicate (e.g. the async step's output text
  equals the payload-derived string) AND the network witness: at capture time, no
  request of the step remains in flight (client slice: response/finish event seen, or
  an empty slice for an idle step). Record both; a state claim whose network side is
  still "issued" is a pre-settle capture, not a settled one.
- **rAF settles paint, not network.** The two-rAF-frame settle (step 9) makes the
  raster stable; it says nothing about in-flight fetches.
- **Pre-settle states must be kept, not raced away.** Two measured patterns:
  (1) *race pair* — capture immediately after the action with no state wait, then wait
  on the predicate and capture again; both timings recorded (r4-1: click→race 82 ms,
  click→settled 82 ms on this host); the race capture is the counterexample that shows
  what a sleep-based shutter would have caught.
  (2) *deterministic hold* — `Fetch.enable` at request stage holds the payload request
  so the pre-settle state cannot race the capture; release, then await the
  payload-derived predicate (r4-2: pre-slice `routes.json` `state:"issued"`,
  `status:null`; post-slice `status:200`, `encodedDataLength:325`; wire log 9→10
  lines).
- **The predicates live in the sha-pinned script** — "the capture waited correctly" is
  re-checkable, not a promise.
- **Timeout discipline**: every wait bounded and loud (measured harness: 50 ms cadence /
  8 s timeout, last value echoed). See §Bounded waits for the deliverable-poll cadence.
- **Optimistic DOM ≠ wire truth**: a page may render success before/without the wire
  agreeing; pair the settled capture with the wire witness (§Evidence ladder rung 4).

## D. §Hygiene rules (new)

### Hygiene rules — cheap, checkable, per session

- **Namespace from the first write**: every artifact under `/tmp/<lane>-r<round>-<seat>-*/`
  (never bare `/tmp` files, never another lane's dir).
- **Kill by explicit PID; scan by `comm`.** `pkill -f` self-matched the invoking shell
  once (`cdp-evidence-patterns.md:105`); arg-pattern scans can self-match on *other text
  in the same command line* (`live-dynamic-capture.md:182-188`). Use the discovered PID
  list (runbook step 6) and `comm`-based scans in a clean command.
- **Ports**: free before launch (loud precheck), loopback-bind only, closed after —
  `ss` line empty + `curl` exit 7 per session; a second run that re-binds proves the
  first run's closure (`live-dynamic-capture.md:179-188`).
- **Profiles**: one throwaway profile per run under the run's output dir; fresh at run
  start (`rm -rf "$OUT/profile"`); never a user profile; log the disposition line
  (`multi-step-journey.md:247,53-56`).
- **Bounded runs**: everything under an explicit `timeout`.
- **Secrets**: shape-only, never content-read (§Session-material discipline).
- **Evidence**: `/tmp` is volatile — archive or it didn't happen; record the effective
  child line, not the typed command.
- **Deliverable polls**: fixed cadence + hard cap, sample condition + elapsed
  (§Bounded waits).
- **As-of-capture sweep** (round 4, /tmp-staged): @@SWEEP@@