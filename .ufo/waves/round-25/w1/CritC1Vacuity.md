# CritC1Vacuity — round 25, wave 1 (critic, C1 counter + kill rule + axis fit)

Seat: `L1Tabi25.CritC1Vacuity`, lane-dispatched (author-side; no non-author judgment asserted).
Lane HEAD at review: `c8ef308` (claims frozen), baseline `9e13666759bcf30665abec84dec13adefc1fa86a`.
Tooling installed: none. Browsers launched: none (this item names no loopback fixture; all runtime
bytes below were read from sibling scratch, read-only, and pinned by sha256).

## Verdict (TLDR)

The C1 counter, as specified for `ExecCounterC1Proto` and as prototyped, is **vacuous on (a), (b) and (c)**:
a hand-typed receipt with no browser, a receipt with one real restore replayed three times, and a
**real `--disable-back-forward-cache` run with one `type` field flipped** all score `valid=true`.
(d) holds only partly. The baseline is unreachable as `0`: it returns could-not-evaluate (exit 2), so the frozen
`"before": 0` is a file count from `ls-tree`, not a value of the counter field. Separately, the genuine
positive receipt the harness produces **crashes** the prototype with an uncaught `TypeError`, exit 1.
That is the same exit code as "invalid", so a crash scores as an honest miss.

Two upstream defects matter for the claim itself:
- The frozen method `CDP Page.goBack` **does not exist** at the pinned build: live Chromium 154
  answers `-32601 "'Page.goBack' wasn't found"`.
- The axis label "depth" is defensible only with a disclosure. The counter field measures existence,
  which matches the lane's coverage precedent.

Impacted axes: **depth** (the claimed axis: the count is vacuous as specified), **calibration**
(a valid=true result would overstate what was observed, and "before 0" is not counter-derived), and
**operability** (counter/harness contract drift, and the crash collides with the failed exit code).

## Evidence base (observation)

| Artifact | sha256 | Source |
|---|---|---|
| prototype counter (pinned copy `scratch/CritC1Vacuity/proto-copy.mjs`) | `1e199ffa8c9c925cd0fc1a75acf1a715c34e1ad07146a085c2c5cc10487a2046` | `scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs`, unchanged at last check |
| real restore run v1 | `0a23ff90330a660c9f10cdf056f24d552076e91678d07c283ba665da0be73636` | `scratch/ExecBfcacheDiagnostics/runs/v1-goback/capture.json` |
| real disabled-control run v3 | `fa01524efe2c25a9f9d3f69d3efeb8df393970857a5e9fce550ad3e8c2330a75` | `scratch/ExecBfcacheDiagnostics/runs/v3-control-disabled/capture.json` |
| harness draft, positive | `220abf1b7c0ae731c199015a665d8f3b61ed9d76f9dcddf241580e359bf9f0ad` | `scratch/ExecHarnessC1/runs/positive/receipt.draft.json` |
| attack generator / reference predicate | `1d66deed…ca298` / `481517a0…081af4` | `scratch/CritC1Vacuity/gen.mjs`, `harden.mjs` |
| held Page.pdl @154.0.8037.97 (S105) | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | `corpus/evidence/round-24/sources/page.pdl` |

Observed runtime facts from the v1 and v3 bytes, extracted with the node one-liners recorded in this
seat's transcript:
- **The restore reuses the original loader.** In v1, A's `Navigation` and the back
  `BackForwardCacheRestore` event both carry loaderId `8DFC0ECCFCED3BB7BE3BF2671ECE9056`. Runs v1-r2
  (`627153B5…`) and v2-historyback (`29B4E222…`) show the same equality. In v3 (disabled), the back
  step is a `Navigation` with a **fresh** loader `7D441B5F…`, preceded by a `Network.requestWillBeSent`
  for a.html, and followed by `Page.backForwardCacheNotUsed` with reasons
  `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine` and `BrowsingInstanceNotSwapped`.
- **In-page state survives a restore.** In v1, `window.__counter` stays 42 and `loadId` stays
  `ce4eb9fuqir`, and the log ends `["pageshow",true,…]`. In v3, the counter reads 0 after back,
  `loadId` is new, and `pageshow` is `false`.
- **The server log does not discriminate.** Both v1 (restore) and v3 (non-restore) server logs show
  exactly one `GET /a.html`, because v3's refetch was served from the HTTP cache. A server-hit witness
  is not evidence of a restore.
- **`Page.goBack` is not a CDP method.** `grep -c -i goback corpus/evidence/round-24/sources/page.pdl`
  returns 0. The only history commands in `page.pdl` are `getNavigationHistory` (:850),
  `navigateToHistoryEntry` (:913) and `resetNavigationHistory`. The protocol 1.3 JSON
  (`/home/vgpnk/Projects/shokuknow/lanes/revenger/round8/measurements/browser_protocol.json`, read-only)
  has no command matching `back` or `history` other than those three Page commands. The live
  response, recorded in v1 and v3 steps at `tMs 851`, is
  `{"code":-32601,"message":"'Page.goBack' wasn't found"}`. Both probes then fall back to
  `Page.navigateToHistoryEntry {entryId:13}`, and `currentIndex` goes 2→1.

## Counterexamples — prototype scored on attack fixtures

Command: `cd scratch/CritC1Vacuity && node gen.mjs && for f in fx/*.json; do node proto-copy.mjs --file $f --json; done`

| Fixture (construction) | Prototype result | Should be |
|---|---|---|
| F1 hand-typed: three invented events, A and B share loaderId `"L"`, one `goBack` label (the prototype's own selftest "valid" shape) | exit 0, `valid=true restores=1` | invalid |
| F2 replay: real v1 stream with the single restore event appended twice more, one goBack step | exit 0, `valid=true restores=3` | invalid / restores ≤ 1 |
| F3 type-flip: **real v3 disabled run**, back event `type` changed to `BackForwardCacheRestore`, flag omitted from self-declared `run.flags`, digest recomputed | exit 0, `valid=true restores=1` | invalid |
| F4 copy-first: v3 with no back event; A's first `Navigation` copied and type-flipped (it reuses A's loader) | exit 0, `valid=true restores=1` | invalid |
| F5 truthful stream including the real `Page.backForwardCacheNotUsed` event | exit 1, `event-not-raw` (rejected for its *shape*) | evaluated; valid with restores=0 |
| F6 goBack label carrying the `-32601` error, no third event | exit 0, `valid=true restores=0` | invalid: `history-step-not-executed` |
| F7 restore event URL = b.html | exit 1, `restore-target-mismatch` | invalid ✓ |
| F8 genuine v1 stream, unmodified | exit 0, `valid=true restores=1` | clean ✓ |
| control `control/fake-receipt-bfcache.json` | exit 1: `events-empty`, `restore-unbacked`, `digest-missing` | invalid ✓ |
| baseline `--rev 9e13666… --repo <lane>` | exit 2, `could-not-evaluate`, `restores:null` | could-not-evaluate ✓ |
| harness genuine `runs/positive/receipt.draft.json` | **uncaught `TypeError` at proto line 85, exit 1, empty stdout under `--json`** | clean |
| harness `runs/disabled/receipt.draft.json` | exit 1 for `event-not-raw` + `digest-missing`; **`bfcache-disabled` never fires** | invalid: `bfcache-disabled` |

`node proto-copy.mjs --selftest` reports 7/7 pass. The selftest is green while F1–F4 and F6 pass as valid.

### (a) valid=true without a real history step — YES

Vacuous code shapes in the prototype:

```48:48:/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/CritC1Vacuity/proto-copy.mjs
const digestOf = (events) => `sha256:${createHash("sha256").update(JSON.stringify(events)).digest("hex")}`;
```

```63:64:/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/CritC1Vacuity/proto-copy.mjs
  const goBacks = steps.filter((s) => s?.action === "goBack");
  if (goBacks.length === 0) fail("no-history-step", "run.steps has no goBack step");
```

- The history step is a **label check** (`action === "goBack"`). Nothing requires an executed command
  with an error-free response, or a `getNavigationHistory` `currentIndex` that drops by one (F6).
- The kill rule's "matching before/after target" is checked only on author-declared `steps` URLs,
  never against the browser's own history entries or loader ids (F1, F4).

### (b) restores inflated by replaying one event — YES

```82:88:/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/CritC1Vacuity/proto-copy.mjs
  const restoreEvents = evs.filter((e) => e?.params?.type === RESTORE && !e?.params?.frame?.parentId);
  const backUrls = new Set(goBacks.map((s) => s.url));
  for (const e of restoreEvents)
    if (!backUrls.has(e.params.frame.url)) fail("restore-target-mismatch", `restore at ${e.params.frame.url} matches no goBack target`);
  const claimed = r?.summary?.restores;
  if (!Number.isInteger(claimed) || claimed !== restoreEvents.length)
    fail("restore-unbacked", `summary.restores=${JSON.stringify(claimed)} observed=${restoreEvents.length}`);
```

- Set membership has no cardinality, and count equality is satisfied by any author who edits both
  sides. Nothing bounds restores by executed history steps or rejects identical replayed payloads (F2).
  `Page.frameNavigated` carries no timestamp (`page.pdl:1348-1352`: only `frame` and `type`), so a
  replay is detectable only by a capture ordinal or by cardinality.

### (c) digest binding — NOT binding

- `digest` is sha256 over the same file's `events` field, written by the same author. Editing events
  and recomputing it takes one line (F2, F3 and F4 all carry a recomputed, matching digest). It detects
  accidental inconsistency only.
- The harness already writes `rawEventLog.sha256` (a separate `events.jsonl`), but the prototype never
  reads it. Restores are counted from the summarised `events` copy, not from the raw stream.
- Event filtering forbids the contradicting witness:

```77:79:/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/CritC1Vacuity/proto-copy.mjs
  evs.forEach((e, i) => {
    if (e?.method !== "Page.frameNavigated" || typeof e?.params?.type !== "string" || typeof e?.params?.frame?.url !== "string")
      fail("event-not-raw", `events[${i}] is not a raw Page.frameNavigated event with params.type and params.frame.url`);
```

  A receipt **must delete** `backForwardCacheNotUsed` and `Network.requestWillBeSent` to be valid
  (F5). Those are the two events that falsified the restore in v3.
- The flag check reads self-declared `run.flags` (proto:59-60). The harness writes `run.flags_effective`,
  so on the real disabled receipt the check reads `[]` and never fires.

### (d) could-not-evaluate vs a do-nothing '0' — partly vacuous

- At the baseline the counter cannot produce `restores=0`: it returns exit 2 with `restores:null`
  (command above). `claims.json` `"before": 0` is the `git ls-tree` file count, a different metric.
  A SCORECARD row reading "restores 0 → 1" would mix a file count with a counter field.
- A do-nothing run (no history step) yields `restores=0, valid=false` (selftest `no-history-run`), as
  the frozen control text demands. But the prototype also prints a numeric `restores` for every invalid
  receipt (proto:92; the control prints `restores=0`). So `restores: 0` carries two meanings: honest
  zero, or invalid.
- A *valid* zero is reachable only through an executed history step without a restore (H10 below).
  The prototype also emits valid zero for an **unexecuted** labelled step (F6), which misattributes
  a harness failure to the browser.
- Crash path: no `try/catch` around `validate`. A shape mismatch throws, exits 1, and prints nothing
  under `--json`. A caller keyed on exit codes scores a crash as an honest miss, not as
  could-not-evaluate.

## Smallest safe correction (what the production counter must check)

Reference predicate `scratch/CritC1Vacuity/harden.mjs` (≈40 lines) runs over the **full** raw stream:
every command with its response, plus every inbound event. It derives restores itself and ignores
the summary. Command: `node harden.mjs`.

| Case | Result |
|---|---|
| H8 genuine v1 | `valid=true restores=1` |
| H0 genuine v3 control | `valid=false` `bfcache-disabled` |
| H2 replay | `restore-replayed`, `restores-exceed-history-steps` |
| H3 type-flip of disabled run | `restore-loader-not-reused`, `notused-contradicts`, `refetch-contradicts`, `inpage-witness-absent` |
| H1 hand-typed | `history-step-not-executed`, `loader-not-distinct`, `restores-exceed-history-steps`, `inpage-witness-absent` |
| H6 goBack error only | `history-step-not-executed` |
| H10 honest miss (synthetic: v3 stream, flag removed from argv) | `valid=true restores=0` (a valid zero stays reachable) |
| **H9 coherent forgery** (v3 edited on every witness) | **`valid=true restores=1`** — irreducible, see bound |

Required checks, each mapped to the fixture it kills:
1. **Raw source.** Count from the committed raw wire log. The counter computes the log blob's
   sha256 at `--rev` and requires equality with the receipt. Restores are derived from the log;
   `summary.restores` is only compared against it. (Kills F1 and the summary-only paths.)
2. **Executed history step.** Require a `Page.navigateToHistoryEntry` (or `Runtime.evaluate
   history.back()`) whose response has no `error`. `getNavigationHistory` `currentIndex` must drop
   by exactly one, onto A's entry id. (Kills F6/H6.)
3. **Cardinality.** At most one restore per executed history step, and no identical restore payload
   twice. (Kills F2/H2.)
4. **Loader identity.** The restore's `frame.loaderId` must equal A's first `Navigation` loaderId on
   the same frame id, and A and B loaders must be distinct. This is observed 3/3 in restore runs and
   violated by the v3 control. (Kills F1, F3/H3.)
5. **No contradiction, evaluated rather than filtered.** When a restore is counted, there must be no
   `Page.backForwardCacheNotUsed` and no `Network.requestWillBeSent` for the restored URL after the
   history command. Keep these events in the receipt. (Kills F3/H3; F5 becomes evaluable.)
6. **In-page witness.** A nonce set on A before leaving must read back unchanged, with a
   `pageshow` `persisted=true` entry. (Kills H3 and F4 once commands are required.)
7. **Flags from effective argv.** Read `/proc/<pid>/cmdline`, which the harness already records as
   `argv_effective`. Reject `--disable-back-forward-cache` and `--disable-features=…BackForwardCache…`.
   Fix the field-name drift (`run.flags` vs `run.flags_effective`).
8. **Exit discipline.** Wrap validation; any thrown error is exit 2 (could-not-evaluate). Print
   `restores:null` whenever `valid=false`, and quote `(valid, restores)` only as a pair.
9. **Selftest.** Make F1, F2, F3, F6 and the harness positive draft into selftest cases. The current
   "valid-run-receipt" synth (proto:105-113) is F1 and must move to the *invalid* set.

**Irreducible bound (H9).** A deliberate coherent forgery passes every committed-bytes predicate.
Here, a non-restore run was edited on loader, type, network, NotUsed and in-page values, and it
still scored `valid=true restores=1`. `valid=true` can prove only that the committed raw stream is
internally coherent with a restore. It cannot prove that a browser ran. That needs a replay by a
non-author seat (the fleet's closure), at the pinned build, compared on the invariants above. The
receipt's scope line and the disposition must say this. Git history binds the bytes after
measurement (edits need a new commit), so the measured revision plus the receipt and raw-log blob
digests belong in the measurement-binding record.

## Upstream defect: frozen method name

The claim text says "via CDP Page.goBack (a real history step)". That method does not exist at
154.0.8037.97 (observed `-32601`; zero `goback` tokens in the held PDL). Any receipt therefore
records a substitution (`navigateToHistoryEntry(currentIndex-1)`; ExecHarnessC1 already notes it at
`probe.mjs:228`). The substitution must land as a recorded revision in `claims.json` `revisions[]`
or as an erratum, with the `-32601` response committed as evidence. Otherwise the receipt's method
silently differs from the frozen declaration (false provenance). This is a fixable defect, not a
reason to reject the claim.

## Axis fit — depth or coverage?

- Definitions (`/home/vgpnk/Projects/shokunin/AXES.md:11-12`, read-only): **depth** is "Verifiable
  technical detail — decision tables with real thresholds, named error signatures, cited sources".
  **coverage** is "Fraction of the domain's real surfaces the skill governs".
- The surface is already governed. Round 24 entered bfcache as **C3 coverage 0→1**, documented
  upstream, "no restore observed" (`SCORECARD.md:1234`). The decision table already exists in
  documentary form (`corpus/knowledge/navigation-history-bfcache-evidence.md:57-59`). C1 turns
  U1 (`:79-80`) from an unknown into an observation.
- The strongest counterexample to depth is **round 13**, which scored "actual isolated
  locator/template experiment0→1 on previously docs-only ground" as **coverage**
  (`SCORECARD.md:537`). Rounds 16 and 17 scored their first loopback runtime entries as coverage
  (`:743`, `:786`). Depth precedents are rounds 19 and 21: finite decision and observation counts
  (`:882`, `:1002`). Round 19 still annotated coverage for "enters prior source-only runtime ground"
  (`:889`).
- C1's counter field, `restores >= 1`, is a 0→1 existence count. That has the coverage shape of
  rounds 13, 16 and 17, not the finite-decision shape of rounds 19 and 21. Coverage stands at 9, not
  lowest, so labelling the claim depth is what satisfies the lowest-axis rule. That is the
  axis-shopping risk.
- What genuinely is depth here is the content an entry can carry from the observed bytes, all named
  error signatures and verifiable detail per AXES.md:11:
  - the loader-reuse discriminator;
  - the three NotUsed reason names;
  - the `persisted=true` witness;
  - the `-32601 'Page.goBack' wasn't found` signature;
  - the non-discriminating server log.

  The frozen counter measures none of these.

**Judgment for the canonical judge (tradeoff, not a fixable defect).** The claim truly moves the
*evidence grade of an already-covered surface* (U1: documented → observed) and supplies depth
material. Its counter field measures only existence. Naming depth is honest only if:
- the disposition states "counter = existence of one coherent restore receipt; depth credit rests on
  the entry's discriminator rows, each anchored to a raw-stream seq";
- it records the round-13 contrary precedent;
- it claims no coverage credit.

Without that disclosure, depth is a coverage observation under a depth label, and the judge should
reject the axis attribution. Re-labelling to coverage post-freeze is not available: it would need a
revision and would break the lowest-axis rule.

## Inference / unknown (kept separate)

- [INFERENCE] The loader-reuse invariant generalises beyond the three observed restore runs on this
  build. It was observed 3/3 here and is untested across builds or with iframes.
- [INFERENCE] H10's valid zero stands in for a real eligibility-blocked run. No real run with the
  cache enabled and a restore blocked by a page feature (e.g. an `unload` handler) was observed.
- [UNKNOWN] Whether `Browser.getBrowserCommandLine` would give a browser-witnessed flag list under
  this launch. Not exercised. `/proc` cmdline is the observed path.
- [UNKNOWN] The final production counter and receipt shapes. This review scored the prototype at
  sha `1e199ffa…` and the harness drafts at the shas above. Re-score if either changes.

Negative sweeps:
- `git grep -n -I -E 'Page\.goBack|goBack' 9e13666… -- SKILL.md corpus/knowledge corpus/lessons scripts`
  returns no hits, so the lane's held text never named the nonexistent method before this round.
- `grep -c -i goback corpus/evidence/round-24/sources/page.pdl` returns 0.
