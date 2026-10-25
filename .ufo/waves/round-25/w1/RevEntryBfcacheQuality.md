# RevEntryBfcacheQuality — admission-quality review of the C1 entry plan (round 25, wave 1)

Seat: `L1Tabi25.RevEntryBfcacheQuality` (leaf reviewer, read-only). Reviewed at 2026-10-25T12:17Z
(`date -u +%FT%TZ`). Lane HEAD `c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`), one
commit past baseline `9e13666759bcf30665abec84dec13adefc1fa86a` (`c8ef308 round-25: freeze claims,
controls, census-before, wave-1 spec`, from `git log --oneline 9e136667..HEAD`).

What I reviewed: the C1 entry in `.ufo/waves/round-25/claims.json`, and the C1 seat prompts in
`.ufo/waves/round-25/w1-dispatch.json` (`ExecHarnessC1`, `ExecCounterC1Proto`, `ScribeEntryBfcache`,
`MutC1Counter`). I checked them against `PROVINCE.md`, `corpus/QUALITY.md` and
`corpus/knowledge/navigation-history-bfcache-evidence.md`, all read at the baseline revision.

Supporting scratch data I read but did not produce: the
`scratch/ExecBfcacheDiagnostics/runs/{v1-goback,v2-historyback,v3-control-disabled}` captures, the
`scratch/ExecControlScore/` reference scorer and fixtures, and `w1/ScoutOpenS106.md`.

LSP: not applicable, because the reviewed artifacts are JSON/markdown plans with no language-server
surface. Every check below is a text or git read, and is labelled as one.

Tool installs and updates: none.

Axes: (1) province fit, (2) novelty against held ground, (3) QUALITY clearance, (4) receipt
re-derivability.

## Verdict summary

| Question | Answer |
|---|---|
| Inside PROVINCE.md owned surfaces? | **Yes**, with one scope note (loopback is not a "real site"). |
| Runtime ground the corpus does not hold? | **Yes.** The only bfcache knowledge note is docs-only and explicitly says no restore was observed. |
| Would the entry clear QUALITY.md as planned? | **Not yet.** It has 2 HIGH and 5 MEDIUM defects (F1–F7); all are fixable inside this round. |
| Is the receipt design re-derivable as specified? | **No.** A self-digested forgery passes the specified counter shape (F2), and the harness is not committed (F6). |

## 1. Province fit — inside

Observation:

- `PROVINCE.md:9`: "CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)".
- `PROVINCE.md:12-13`: "dynamic-page evidence patterns (what to capture so a claim about a page is
  re-verifiable)".

A history step observed through `Page.frameNavigated` falls under both. Commands:
`git show 9e136667:PROVINCE.md | cat -n`.

Scope note (inference):

- `PROVINCE.md:3-4` frames the domain as "driving real browsers against real sites". A loopback
  fixture is a real browser but not a real site. The lane already holds loopback-fixture journeys
  (`corpus/knowledge/multi-step-journey.md`, a python http.server fixture). So this is precedent
  and not absorption.
- The entry must say plainly "loopback fixture, not a real-site journey". The README frontier item
  "Real-site journeys" therefore stays open for real sites.

Refusal boundary:

- `PROVINCE.md:15` refuses "reverse engineering as forensics". Citing
  `content_features.cc:187` (S106) as a source line is a source citation, not forensics.

Adjacency:

- `corpus/adjacency.tsv` row 2 `cdp-runtime-observation` / kaidoku is `ruled`. Its ruling quote is
  "**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis", which
  leaves tabi's plain-CDP observation in tabi.
- Row 5 `rea-browser-runtime-evidence` / revenger is `contested-open`. It concerns the REA
  skill/toolset, and the C1 probe uses raw CDP over WebSocket, not REA.
- The entry should name row 5 and say it does not use REA. Command:
  `git show 9e136667:corpus/adjacency.tsv | sed -n '1p;2p;5p'`.

## 2. Novelty — runtime ground not held

Sweep I ran: `git grep -ril 'bfcache' 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/knowledge`
(exit 0) returns exactly one file:

```
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md
```

Wider sweeps:

- `git grep -l -i -E 'BackForwardCache|bfcache|back/forward|back-forward|goBack|history\.back|navigateToHistoryEntry' 9e136667 -- corpus/knowledge`
  returns the same single file.
- `git grep -n -E 'Page\.goBack|navigateToHistoryEntry|history\.back\(|"goBack"' 9e136667 -- scripts corpus/evidence ':!corpus/evidence/round-24/sources'`
  returns **0 lines**. No committed script or evidence file performs a history step.
- `git ls-tree -r --name-only 9e136667 -- corpus/evidence/round-25 | wc -l` returns **0**.
- `git cat-file -e 9e136667:scripts/check-bfcache-receipt.mjs` returns exit **128**: the counter is
  absent at baseline.

Every committed lane file that names `BackForwardCacheRestore` is a round-24 wave report, a
LOG/README/SOURCES/lesson row, the retained PDL, or the round-24 note. None of them is a runtime
receipt (`git grep -l 'BackForwardCacheRestore' 9e136667`, 22 files, listed by path in my sweep
output).

### Nearest note and the overlap (quoted)

`corpus/knowledge/navigation-history-bfcache-evidence.md` (baseline) is docs-held and explicitly
runtime-open:

- `:9` "**No browser ran for this entry.** Nothing here is a capture, a run or a measurement"
- `:79-80` "U1 — No restore has been observed on this host. Whether the pinned build emits
  `BackForwardCacheRestore` on a loopback fixture is unmeasured."
- `:57` (decision-table row 1) "`Page.frameNavigated` with `type: BackForwardCacheRestore` | the
  frame-navigated event verbatim, plus the post-restore DOM snapshot and the pre-navigation snapshot"
- `:68-71` "Any probe that intends to observe restores must drop `--disable-back-forward-cache` and
  record the launch argv"
- `:61` (row 5) "network slice empty, DOM unchanged | … | nothing on its own — empty network is
  consistent with a restore AND with a no-op"

The README frontier row agrees: `corpus/README.md:582` reads "docs-held, runtime open … no restore
has been observed on this host because no committed probe performs a history step at all".

So C1 is a genuine step from docs-held to runtime-observed. Two obligations follow from the overlap:

- **No re-credit (QUALITY 56).** The round-24 discriminator documentation gets no new coverage
  credit. Only the observation itself is new.
- **Append, don't rewrite (QUALITY 4 and 31).** U1 closes through an append-only `corpus/README.md`
  index row that names `navigation-history-bfcache-evidence.md:79`. The round-24 note bytes stay
  untouched. The planned new path `corpus/knowledge/bfcache-runtime-observed-round-25.md` is the
  right shape.

## 3. Findings by severity

### F1 — HIGH: the frozen claim names a CDP method that does not exist on the pinned build (`Page.goBack`)

Observation:

- `claims.json` C1 `declared` says "navigates fixture A -> B -> A via CDP Page.goBack". The
  `killRule` says "the run must have executed a history step (goBack)".
- The pinned PDL has no such command:
  `git show 9e136667:corpus/evidence/round-24/sources/page.pdl | grep -c -i goBack` returns **0**.
- The history commands it does carry are `command getNavigationHistory` (`:850`),
  `command resetNavigationHistory` (`:858`) and `command navigateToHistoryEntry` (`:913`, parameter
  `integer entryId`).
- At runtime, in `scratch/ExecBfcacheDiagnostics/runs/v1-goback/capture.json` step `Page.goBack`,
  the response is `{"id":9,"error":{"code":-32601,"message":"'Page.goBack' wasn't found"}}`. The
  restore in that run was produced by the next step, `Page.navigateToHistoryEntry`
  (`{"id":10,"result":{}}`). The same holds in `v3-control-disabled`.
- Host build: `chromium --version` returns `Chromium 154.0.8037.97 Arch Linux`, and the capture's
  `/json/version` reports `Chrome/154.0.8037.97`.

Why it matters:

- This is QUALITY 23/24: a hypothesised API path, written into the frozen claim, that the build's
  own IDL contradicts.
- A counter that checks `steps[].action === "goBack"` as a label would credit a run whose
  `Page.goBack` call *failed*. The diagnostics run's `backMode` is still labelled `"goBack"`.

Fix:

- Disclose a revision in `claims.json` `revisions[]`. The claims are frozen, so QUALITY 59 applies:
  disclosed, authored-after-data, with metric, target and population unchanged.
- The revision should name the real history step: `Page.navigateToHistoryEntry` with an `entryId`
  taken from `Page.getNavigationHistory`, or `Runtime.evaluate("history.back()")` (diagnostics
  `v2-historyback`).
- The receipt records each step's CDP method **and its response**. The counter treats a history
  step whose response carries `error` as no history step.
- The entry must not say "Page.goBack" as an executed method anywhere.

### F2 — HIGH: the specified counter shape accepts a self-digested forgery

Observation: the reference scorer `scratch/ExecControlScore/ref-check-bfcache-receipt.mjs` implements
`ExecCounterC1Proto` checks (a)–(d). Run as `node ref-check-bfcache-receipt.mjs <file>`:

| Fixture | Output | Exit |
|---|---|---|
| `control/fake-receipt-bfcache.json` | `{"restores":0,"valid":false,"findings":["no-raw-frameNavigated-events","summary-restores-unbacked(claimed=2,events=0)","digest-missing"]}` | 1 |
| `forged-selfdigest-bfcache.json` | `{"receipt_present":true,"restores":2,"valid":true,"findings":[]}` | **0** |
| `sanity-valid-bfcache.json` | `{"restores":1,"valid":true,"findings":[]}` | 0 |

The forged fixture passes with all of these defects:

- two identical restore events for one history step;
- no `Navigation`-typed event at all;
- frame id `"F"` with no `loaderId`;
- a claimed build `chromium 152.0.7977.82` that is not the host build;
- `"flags": []`, self-reported;
- a `digest` that is just `sha256(JSON.stringify(events))` computed by the forger.

Why it matters:

- QUALITY 39: "Digest-shaped strings and an excerpt's self-hash alone are insufficient."
- QUALITY 25/60: the frozen skip-work control is the weakest possible shape (`events: []`).
  Failing it does not show that the detector separates real runs from coherent fakes.
- MutC1Counter mutant (5), a duplicated event pair, already points at this. A counter built only to
  (a)–(d) fails that mutant.

Required receipt and counter properties. Each property below goes red on a named shape, and all of
them are observed to hold on real runs:

1. **Origin binding.** Every counted restore's `params.frame.loaderId` equals the `loaderId` of an
   earlier `type:"Navigation"` event for the same `frame.id` and URL. That earlier `loaderId` also
   equals the `Page.navigate` response `loaderId` for A.
   - Observed on restore runs: v1 `8DFC0ECCFCED3BB7BE3BF2671ECE9056` appears on both the initial A
     and the restore event; v2 `29B4E22281C26495A67B49851D2423B2` likewise.
   - Observed on the disabled control: v3's back navigation gets a fresh `7D441B5F…` (initial A was
     `FC6A6564…`) and is typed `Navigation`.
   - [INFERENCE] A restore keeps the original document's `loaderId`. This is observed in 2/2
     restore runs and 1/1 control, not documented in S105. Pin it as an observed invariant with its
     run count, not as protocol fact.
   - Red shape: the forged fixture (no `loaderId`).
2. **Cardinality.** `restores ≤` the number of successful history-step commands, counting one
   restore per (`frame.id`, history step). Red shape: the duplicated pair.
3. **Ordering.** Each restore event sits after the history-step command's send and before the next
   step, in **one** ordered transcript (QUALITY 52). Separate arrays with tied timestamps do not
   count.
4. **Independent page-side witness (QUALITY 55/56 semantic oracle).** A per-run nonce is set in A
   before leaving and read after the back step. Pair it with `pageshow` `persisted:true`.
   - Observed in v1 `read-after-back`: `counter:42`, `loadId:"ce4eb9fuqir"` unchanged, log ends
     `["pageshow",true,"visible",826.29…]`.
   - Observed in the v3 control: `counter:0`, new `loadId:"juxbsraya3b"`, only
     `["pageshow",false,…]`.
   - Red shape: a restore event with no matching nonce survival.
5. **Digest over committed bytes, not over a re-serialised array.** Use the sha256 of a separately
   committed raw event log file (the CDP stream as received). The counter re-hashes the file bytes
   (QUALITY 39), and the receipt records the producer path and sha256 (QUALITY 30).
6. **Build identity** comes from the run's own `/json/version` response, retained verbatim. It must
   equal the PDL tag the entry cites (`154.0.8037.97`).

Shapes left untested even with 1–6 (QUALITY 27): an author who fabricates a fully coherent
transcript, with matching loaderIds, nonce and ordering, still passes. These are author-recorded
records, not actor authentication (QUALITY 52's last sentence). The entry must say so and avoid
absolute words.

### F3 — MEDIUM: `before: 0` contradicts the claim's own kill rule and QUALITY 61

Observation:

- `claims.json` C1 has `"before": 0`.
- Its `killRule` says "A receipt missing at the measured revision is could-not-evaluate, never 0."
- At baseline both the counter (`git cat-file -e` exit 128) and the receipt (`ls-tree` 0 lines) are
  absent.

QUALITY 61: "a counter whose 'before' arm cannot be run (an absent instrument) must say so in those
words rather than print 0."

Fix: the LOG and SCORECARD say "before: could-not-evaluate (instrument absent at 9e136667; 0
committed receipts by `git ls-tree -r --name-only 9e136667 -- corpus/evidence/round-25`)". The
filed "before" must not be the integer 0.

### F4 — MEDIUM: the flag check is literal, over self-reported argv

Observation:

- The kill rule names only the `--disable-back-forward-cache` spelling.
- The reference scorer checks `String(f).includes("--disable-back-forward-cache")` over `run.flags`,
  which the receipt authors itself. The forged fixture simply writes `"flags": []`.
- The diagnostics `argv.txt` is the driver's own list, not an observed process line.

Inference (not runtime-tested): S106 `content_features.cc:187` declares
`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)`. A base::Feature can be turned
off through `--disable-features=BackForwardCache`, a spelling the literal check misses. Label this
an unchecked hypothesis (QUALITY 24) until a run tests it.

Fix:

- Record the effective browser argv from `/proc/<browser-pid>/cmdline`. `ExecHarnessC1`'s prompt
  already asks for "the effective child process line".
- Refuse both spellings.
- Impact: low on a genuine positive, since a disabled cache cannot produce a real restore. Real for
  forgeries and for the validity of the negative control.

### F5 — MEDIUM: the network/server slice does not discriminate, so the entry must not use it as a witness

Observation: `grep -c '"GET /a.html' runs/*/server.log` gives `v1-goback`=1, `v2-historyback`=1 and
`v3-control-disabled`=**1**. Even the disabled control, whose back step was a `Navigation` with a
fresh loaderId, produced no second wire GET for A.

[INFERENCE] The control was served from the HTTP/memory cache, since python http.server sends no
`Cache-Control`. This is not checked against the `Network.responseReceived` cache flags in the
capture.

This confirms `navigation-history-bfcache-evidence.md:61` (row 5). The entry and the receipt must not
list "no second request" as restore evidence. The discriminator is the CDP `type` plus the
page-side witness (F2 items 1 and 4).

### F6 — MEDIUM: re-derivability — the harness and fixture have no committed home in the plan

Observation:

- The harness is planned for `scratch/ExecHarnessC1/` (untracked). The claim names only the receipt
  path `corpus/evidence/round-25/bfcache/receipt.json`.
- QUALITY 28: an untracked path "is never the only root of a claim".
- QUALITY 30/37: a receipt records producer path and sha256.
- QUALITY 22: the count binds the counter blob sha256 via `scripts/check-measurement-binding.mjs`
  (present at baseline: `git cat-file -e` succeeded).

Fix:

- Commit the probe, the fixture `a.html`/`b.html` bytes and the raw event log alongside the
  receipt, with their sha256s in the receipt.
- Bind the counter in a measurement-binding manifest.
- Re-derivable then means the counter re-reads committed bytes. A fresh browser run is a **new
  execution**, labelled new (QUALITY 36), never a recovery.
- U2 (byte-determinism) stays open. LoaderIds and loadIds differ per run, as seen in v1 versus v2,
  so receipts are not byte-reproducible by design.

### F7 — MEDIUM: the planned capture under-delivers the held decision table

The nearest note's row 1 (`:57`) requires "the frame-navigated event verbatim, plus the post-restore
DOM snapshot and the pre-navigation snapshot". C1's capture records `Page.frameNavigated` and
`Page.backForwardCacheNotUsed` only.

Fix: the entry either captures both DOM snapshots or states the departure and why. The F2 item 4
nonce witness is a reasonable page-state substitute, but it must be named as such. Otherwise the new
entry contradicts held runbook text without an erratum.

### F8 — LOW: the evidence class of S106 and its id collision

- Evidence class (QUALITY 14): `content_features.cc:187` `FEATURE_ENABLED_BY_DEFAULT` is a source
  reading. It supports "the feature defaults on at this tag", not "bfcache is on on this host". The
  host fact comes only from the receipt. Keep the two sentences separate and label the first
  [INFERENCE].
- Id collision: `corpus/lessons/round-22-verifier-spotcheck.md:164` already names an `S106`, a
  refused shokuknow package row (`https://www.rfc-editor.org/rfc/rfc9309.txt`, `payload-absent`).
  Read with `git show 9e136667:corpus/lessons/round-22-verifier-spotcheck.md | sed -n 164p`. The new
  S106 row text should disambiguate. SOURCES itself tops out at S105:
  `git show 9e136667:corpus/SOURCES.md | grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' | grep -oE 'S[0-9]+' | sort -V | tail -1`
  returns `S105`.

### F9 — LOW: QUALITY 23 browser-API observation fields

The entry must name four things:

- the build (`Chrome/154.0.8037.97` from the run's `/json/version`);
- the mode and flags (`--headless=new`, full effective argv);
- the event's experimental status (PDL `:1342` `experimental type NavigationType`);
- the origin's secure-context state. Observed in the v1 `backFrameNavigated.frame`:
  `"secureContextType":"SecureLocalhost"`, `"securityOriginDetails":{"isLocalhost":true}`.

Scope the result as "headless=new, single top-level frame, `http://127.0.0.1` loopback, this build".
Unprobed: headful, iframes, cross-origin, real sites, other browsers (U5).

## 4. QUALITY clearance checklist (as planned → after fixes)

| Criterion | As planned | After F1–F9 |
|---|---|---|
| 1 falsifiable | yes (restores≥1, valid) | yes |
| 2 / 12 / 15 sourced, A/B tier | S104 (B), S105 (A), S106 (code, A expected) | yes |
| 3 observation / inference / unknown separate | at risk (S106 default vs host; loaderId invariant) | yes if labelled (F2.1, F8) |
| 14 evidence class preserved | at risk (F8) | yes |
| 22 / 26 / 30 / 37 binding and receipts | missing producer and harness digest (F6) | yes |
| 23 / 24 API names checked against build IDL | **fails** (`Page.goBack`, F1) | yes after a disclosed revision |
| 25 / 27 / 60 counter-owned probes, defeated shapes, controls | **fails** (self-digest forgery passes, F2) | yes, with untested shapes named |
| 28 committed roots | fails (scratch harness, F6) | yes |
| 31 / 4 append-only correction of U1 | planned correctly (new file) | yes, plus a README index row |
| 52 ordered transcript | unspecified | yes (F2.3) |
| 55 / 56 semantic oracle, no reuse credit | missing oracle | yes (F2.4) |
| 59 disclosed revision of a frozen claim | needed for F1 | yes |
| 61 absent-instrument "before" | **fails** (F3) | yes |

## 5. Residual risk

- The loaderId-equality invariant rests on 2 restore runs and 1 control (diagnostics). More runs
  (`v1-goback-r2`, `-r3`) were being written while I reviewed; I did not read them, because their
  `capture.json` was absent when I ran (`MODULE_NOT_FOUND`).
- Even with F2 applied, a fully coherent fabricated transcript passes. That limit is inherent to
  author-recorded receipts and must be stated, not closed.
- The experimental CDP surface (`NavigationType`) can change across Chromium tags. The observation
  is valid only for tag 154.0.8037.97.

## 6. Verification gaps (what I did not run)

- I did not launch a browser. All runtime facts quoted come from `ExecBfcacheDiagnostics` scratch
  captures, read only.
- I did not test `--disable-features=BackForwardCache` (F4 is an inference).
- I did not inspect the `Network.responseReceived` cache flags in the v3 capture (the F5 cause is an
  inference).
- I did not run the production counter: it does not exist yet. F2 used the reference scorer in
  `scratch/ExecControlScore/` as a stand-in for the prompt's (a)–(d) spec. Its CLI reads the first
  positional argument when `--file` is absent (`args[args.indexOf("--file")+1]` → `args[0]`), which
  is how I invoked it.
- The L1 should run once after integration: the production
  `node scripts/check-bfcache-receipt.mjs --selftest`, including red cases for the self-digest
  forgery, the duplicate event, the error-response history step, the mismatched loaderId and the
  `--disable-features` spelling; then `--rev <tip> --json`; then
  `scripts/check-measurement-binding.mjs --check <manifest> --at <tip> --reproduce`.
