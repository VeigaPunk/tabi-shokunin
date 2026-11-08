# R88Exec1 — C1 cold-run reproduction (round 88, wave w1)

Seat: executor (leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Assignment: run the frozen r88 showpicker driver twice under fresh nonces and score each cold
receipt with the frozen counter; report verdict / checkCount / finding ids, per-leg counts and
durations, and whether the three `sp88-accept-*` legs are present in both runs with identical
per-leg facts.

## Bottom line

Both cold runs completed with `failures: []` and 37/37 legs, and both scored
`checkCount 102` with **exactly one** failing id: `prior-set-complete`.

- `prior-set-complete` is a **declaration/bookkeeping** check over the walked round-88
  wave/evidence trees, not a capability law. It fires because the L1's scored in-tree receipt
  `corpus/evidence/round88/chromium-showpicker/receipt.json` exists in the walked tree and is
  neither the receipt under test, nor among `prior-set.txt` (prior1/prior2), nor sha-exempted via
  `--tree-exempt`. Every law and every per-leg check passed (101/102 true).
- The measured law reproduces cold: all three r88 `accept` token forms are delivered into the
  input with their bytes, trusted `input`+`change`, one `Page.fileChooserOpened` (mode
  `selectSingle`), and the page-read hex of the delivered bytes; the raw `accept` attribute is
  read back from the page and additionally pinned by the counter's `FIXTURE_INPUTS` constant
  (`fixture-descriptors`).
- The three `sp88-accept-*` legs are present in **both** cold receipts with **identical**
  per-leg facts (stateAfter, chooser count/mode, read hex, input/change trust).

## Commands actually executed

```
# cold run 1
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-showpicker-round88.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r88-cold1-86f1dcec \
  --scratch /fast/scratch/hyaku/tabi-r88/R88Exec1/cold1 \
  --out /fast/scratch/hyaku/tabi-r88/R88Exec1/cold1.json \
  --http-port 19820 --cdp-port 19821 --child-port 19822
# exit 0

# cold run 2
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-showpicker-round88.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r88-cold2-86f1dcec \
  --scratch /fast/scratch/hyaku/tabi-r88/R88Exec1/cold2 \
  --out /fast/scratch/hyaku/tabi-r88/R88Exec1/cold2.json \
  --http-port 19830 --cdp-port 19831 --child-port 19832
# exit 0

# scoring (per cold receipt, expect-fixture-sha256 = that receipt's own fixture sha)
node scripts/check-showpicker-round88.mjs --lane <lane> --receipt <coldK.json> \
  --expect-driver-sha256 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4 \
  --expect-nonce <coldK nonce> \
  --expect-fixture-sha256 <coldK fixture.sha256> \
  --prior-set .ufo/waves/round-88/controls/c1/prior-set.txt --json
# cold1 exit 1 (findings), cold2 exit 1 (findings)
```

Instrument pins re-verified before the runs (read-only):
`sha256sum -c .ufo/waves/round-88/freeze.txt` → **8/8 OK** (driver `8c015fa4…`, counter
`3224747…`, negatives, kill-power, selftest, record-drift, prior1/prior2).

## Receipt identity and timing

| | cold1 | cold2 |
|---|---|---|
| nonce | `tabi-r88-cold1-86f1dcec` | `tabi-r88-cold2-86f1dcec` |
| ports (http/cdp/child) | 19820 / 19821 / 19822 | 19830 / 19831 / 19832 |
| driverSha256 | `8c015fa4…be49b9b4` | `8c015fa4…be49b9b4` |
| fixture.sha256 | `d20d269c4aab8f604919fe3386b36a8de93a361f97e2c4c41dbbdf3cde3c8914` | `e85c25837ee5b4148160c60887a7fd2833552182dc31aa9c1d4bdff703ccecbf` |
| fixture.child.sha256 | `195366b1676acbf7cf2748b82b88d1378abe3f7f98594fff5a99c64c02ea04e8` | `5a1467ac76cda63c65c8ffaa705721f81b0a63d91f02956149e3d45fc37028d7` |
| legs | 37 | 37 |
| `failures` | `[]` | `[]` |
| startedAt → finishedAt | 11:51:19.384Z → 11:54:39.165Z | 11:54:53.880Z → 11:57:53.105Z |
| wall duration | 199.781 s | 179.225 s |
| host | Chromium 155.0.8059.84 / Chrome/155.0.8059.84 / CDP 1.3 / node v24.21.0 | identical |

Per-leg observation window (marks `start`→`settle`), 37 legs each:
cold1 sum 89.898 s, min 2.148 s, max 2.721 s, mean 2.430 s;
cold2 sum 88.816 s, min 2.139 s, max 2.719 s, mean 2.400 s.
The wall/leg gap is per-leg browser launch + teardown, not leg drift.

The two fixture shas differ because the fixture HTML embeds the child origin
(`http://127.0.0.1:<child-port>`); the fixture sha is therefore port-triple dependent. The
counter's `fixture-hash` check compares against the receipt's own declared sha (hence
per-receipt `--expect-fixture-sha256` above), while fixture *content* is pinned independently by
the driver's byte-identical template extraction + six asserted patch anchors and by the counter's
`fixture-descriptors` check against its `FIXTURE_INPUTS` constant (which carries the `accept`
strings for `aw/am/ap/aa/av/a2/aws/ac/au/amc`). A differing cold fixture sha is not a weaker pin.

## Counter result (both runs identical in structure)

| run | verdict | checkCount | true | false ids |
|---|---|---|---|---|
| cold1 | `findings` | 102 | 101 | `prior-set-complete` |
| cold2 | `findings` | 102 | 101 | `prior-set-complete` |

Finding detail (verbatim, differs only in the receipt-under-test path):

```
cold1: receipts of schema tabi-chrome-cdp-showpicker-r88 in the round-88 wave/evidence trees,
not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r88/R88Exec1/cold1.json),
not exempted by sha256 and not among the priors:
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round88/chromium-showpicker/receipt.json

cold2: same, with path .../R88Exec1/cold2.json
```

prior-set: 2 entries (`prior1.json`, `prior2.json`), prior-set file sha256
`531c65e846d573b113952269032ddb2c4423f501c62c8e7dfa7c466cdbecefce`; `treeExemptSha256: []`.

Replay/limit block (identical shape, no refusal):

```
cold1: ownEvents 177 ownGaps 4
  prior1 priorEvents 177 priorGaps 12 absMatched 0 gapMatched 0 absNeed 89 gapNeed 9 escapeEvents 89 refused false
  prior2 priorEvents 177 priorGaps  2 absMatched 0 gapMatched 0 absNeed 89 gapNeed 2 escapeEvents 89 refused false
cold2: ownEvents 177 ownGaps 5
  prior1 priorEvents 177 priorGaps 12 absMatched 0 gapMatched 0 absNeed 89 gapNeed 9 escapeEvents 89 refused false
  prior2 priorEvents 177 priorGaps  2 absMatched 1 gapMatched 0 absNeed 89 gapNeed 2 escapeEvents 89 refused false
```

Page-side chooser backendNodeId report (`nodeReport`) for the three r88 legs: `ac → [19]`,
`au → [19]`, `amc → [20]` in both runs — matching each leg's `answer.setParams.backendNodeId`.

### Meaning of `prior-set-complete`

`check-showpicker-round88.mjs:898` walks `TREES` (the round-88 wave and evidence trees) and
reports any file that parses as `schema === tabi-chrome-cdp-showpicker-r88` and is neither the
receipt under test, nor one of the `--prior-set` paths, nor sha-exempted via `--tree-exempt`.
The walk found exactly one such file: the L1's scored receipt under
`corpus/evidence/round88/chromium-showpicker/`. That is a **declaration** gap (the prior-set
manifest does not declare the in-tree scored receipt), not a law about the measured capability:
the receipt under test is in `/fast/scratch/…`, outside the walked trees, and its own 102 checks
otherwise pass. Resolving it means the L1 either adds the scored receipt to the prior set /
declares a tree exemption, or accepts the finding as the expected cold-run signature — an L1
decision; this seat did not and must not edit lane declarations.

All other checks true, including every per-leg check
(`leg-sp84-*`, `leg-sp85-*`, `leg-sp86-*`, `leg-sp87-*`, `leg-sp88-accept-case-png`,
`leg-sp88-accept-audiovideo-text`, `leg-sp88-accept-mimeparam-png`) and every law
(`gesture-law`, `activation-law`, `mode-law`, `cross-origin-nonfile-law`, `order-law`,
`sp84-cross-origin-{color,month,week,time,number,range,tel,search,text}-law`,
`webkitdirectory-answer-law`, `accept-answer-law`, `click-while-open-law`, `multiple-mode-law`,
`accept-mime-answer-law`, `accept-grammar-law`, `same-origin-color-law`,
`second-chooser-answer-law`, `no-selection-law`, `same-origin-no-picker-law`, `intercept-law`,
`cancel-law`, `dismiss-law`, `trust-law`), the structural checks (`schema`, `lane`,
`nonce-shape`, `nonce-expected`, `receipt-fields`, `driver-pin`, `fixture-hash`,
`host-chromium`, `host-node`, `ports-declared`, `frame-tree`, `plan-frozen`, `leg-order`,
`leg-records`, `leg-marks`, `context-binding`, `send-log-allowlist`, `plan-calls`,
`cdp-event-log-closed`, `frame-binding`, `event-types`, `event-time-quantum`,
`event-leg-window`, `seq-monotonic`, `host-argv`, `devtools-port-binding`,
`teardown-closure`, `fixture-descriptors`, `server-log-binding`, `child-server-log-binding`,
`run-window`, `replay-event-timeline`, `replay-launch-token`, `replay-devtools-url`,
`prior-set-unmatched-exempt`, `prior-set-unparsable`).

## The three r88 `accept` legs — present in both, facts identical

| leg | target | raw `accept` (page-read) | stateAfter[target] | fileChooserOpened | page `read` ret | input/change |
|---|---|---|---|---|---|---|
| `sp88-accept-case-png` | `ac` | `IMAGE/PNG` | `[["tabi-r88-b.png",21,"image/png",""]]` | 1 × `selectSingle` | `hex:89504e470d0a1a0a746162692d7238332d706e670a` (46 chars) | `input@true`, `change@true` |
| `sp88-accept-audiovideo-text` | `au` | `audio/*,video/*` | `[["tabi-r88-a.txt",22,"text/plain",""]]` | 1 × `selectSingle` | `hex:746162692d7238332d616e737765722d616c7068610a` (48 chars) | `input@true`, `change@true` |
| `sp88-accept-mimeparam-png` | `amc` | `image/png;q=0.9` | `[["tabi-r88-b.png",21,"image/png",""]]` | 1 × `selectSingle` | `hex:89504e470d0a1a0a746162692d7238332d706e670a` (46 chars) | `input@true`, `change@true` |

Byte pins carried by both runs: `uploadPng.sha256 = 575d88a4154ed4f5cc7e9d1f6fe9a508c31f08c934a6c99f0b8596920e947050`,
`upload.sha256` (txt) `= bc9965f176353d135c7f4229794068341dc8f51283baee3111500f149f2c21de`.
Each leg's `answer.setResult` is `{}`, `setError` null, one `setParams.files` entry whose basename
equals the delivered name; the delivered file is the *non-matching* one where the token grammar
does not cover it (`audio/*,video/*` answered with `text/plain`; `IMAGE/PNG` answered with a
`image/png` file; `image/png;q=0.9` answered with `image/png`) — i.e. `accept` is not a validator
on a programmatic answer, over twelve token forms in the counter's `GRAMMAR` matrix (nine carried
from r86/r87, three new in r88).

Leg durations and CDP volume for the three r88 legs (`cdpSendLog` / `cdpEventLog` counts):

| leg | cold1 dur | cold1 sends/events | cold2 dur | cold2 sends/events |
|---|---|---|---|---|
| `sp88-accept-case-png` | 2.352 s | 27 / 2 | 2.339 s | 27 / 2 |
| `sp88-accept-audiovideo-text` | 2.377 s | 27 / 2 | 2.332 s | 27 / 2 |
| `sp88-accept-mimeparam-png` | 2.288 s | 27 / 2 | 2.337 s | 27 / 2 |

## Full per-leg counts and durations (37 legs, both runs)

`dur` = marks `start`→`settle`; `sends`/`evs` = `cdpSendLog`/`cdpEventLog` lengths; `err` = `errors` length (0 in every leg of both runs).

| leg | c1 dur | c1 sends | c1 evs | c2 dur | c2 sends | c2 evs |
|---|---|---|---|---|---|---|
| sp84-cross-origin-nonfile | 2.647 | 29 | 1 | 2.693 | 29 | 1 |
| sp84-cross-origin-nonfile-disabled | 2.653 | 29 | 1 | 2.677 | 29 | 1 |
| sp84-cross-origin-color | 2.682 | 29 | 1 | 2.719 | 29 | 1 |
| sp84-cross-origin-month | 2.667 | 29 | 1 | 2.688 | 29 | 1 |
| sp84-cross-origin-week | 2.682 | 29 | 1 | 2.683 | 29 | 1 |
| sp84-cross-origin-time | 2.692 | 29 | 1 | 2.680 | 29 | 1 |
| sp84-same-origin-nonfile-disabled | 2.318 | 24 | 1 | 2.305 | 24 | 1 |
| sp84-webkitdirectory-answer | 2.316 | 27 | 2 | 2.307 | 27 | 2 |
| sp84-accept-answer | 2.359 | 27 | 2 | 2.305 | 27 | 2 |
| sp84-click-while-open | 2.341 | 31 | 3 | 2.310 | 31 | 3 |
| sp84-cross-origin-number | 2.693 | 29 | 1 | 2.644 | 29 | 1 |
| sp84-cross-origin-range | 2.721 | 29 | 1 | 2.644 | 29 | 1 |
| sp84-cross-origin-tel | 2.663 | 29 | 1 | 2.643 | 29 | 1 |
| sp84-cross-origin-search | 2.693 | 29 | 1 | 2.643 | 29 | 1 |
| sp84-cross-origin-text | 2.692 | 29 | 1 | 2.642 | 29 | 1 |
| sp84-multiple-mode | 2.347 | 27 | 2 | 2.290 | 27 | 2 |
| sp84-accept-mime-answer | 2.333 | 27 | 2 | 2.301 | 27 | 2 |
| sp84-second-chooser-answer | 2.349 | 32 | 3 | 2.324 | 32 | 3 |
| sp85-same-origin-tel | 2.164 | 19 | 1 | 2.139 | 19 | 1 |
| sp85-same-origin-search | 2.162 | 19 | 1 | 2.140 | 19 | 1 |
| sp85-same-origin-text | 2.148 | 19 | 1 | 2.142 | 19 | 1 |
| sp85-same-origin-tel-activated | 2.355 | 24 | 1 | 2.300 | 24 | 1 |
| sp85-same-origin-search-activated | 2.310 | 24 | 1 | 2.300 | 24 | 1 |
| sp85-same-origin-text-activated | 2.341 | 24 | 1 | 2.304 | 24 | 1 |
| sp86-accept-wildcard-text | 2.375 | 27 | 2 | 2.285 | 27 | 2 |
| sp86-accept-wildcard-png | 2.355 | 27 | 2 | 2.286 | 27 | 2 |
| sp86-accept-mixed-text | 2.344 | 27 | 2 | 2.285 | 27 | 2 |
| sp86-accept-mixed-png | 2.278 | 27 | 2 | 2.282 | 27 | 2 |
| sp86-accept-pdf-token-png | 2.352 | 27 | 2 | 2.282 | 27 | 2 |
| sp86-same-origin-color-activated | 2.396 | 24 | 1 | 2.304 | 24 | 1 |
| sp87-accept-audio-png | 2.349 | 27 | 2 | 2.300 | 27 | 2 |
| sp87-accept-video-text | 2.405 | 27 | 2 | 2.300 | 27 | 2 |
| sp87-accept-multimime-text | 2.364 | 27 | 2 | 2.332 | 27 | 2 |
| sp87-accept-whitespace-png | 2.334 | 27 | 2 | 2.331 | 27 | 2 |
| sp88-accept-case-png | 2.352 | 27 | 2 | 2.339 | 27 | 2 |
| sp88-accept-audiovideo-text | 2.377 | 27 | 2 | 2.332 | 27 | 2 |
| sp88-accept-mimeparam-png | 2.288 | 27 | 2 | 2.337 | 27 | 2 |

Totals: cold1 991 CDP sends / 0 leg errors; cold2 991 / 0. Leg order is the frozen plan order and
identical across runs (`leg-order: true`).

Driver stderr in both runs carried Node's `MaxListenersExceededWarning` (11 SIGINT and 11 SIGTERM
listeners on `process`, limit 10) — cosmetic leak from per-leg signal registration; no leg errors,
`teardown-closure` true (all 37 legs: `survivors: []`, three port probes `closed`, post-kill curl
exit 7).

## Hygiene / bounds compliance

- Read-only on the lane: no commit, no `git add/checkout/reset`, no writes to
  `corpus/evidence/round88`, `.ufo/waves/round-88/scored`, `SKILL.md`, `SCORECARD.md`, `LOG.md`,
  `plans/`, `corpus/**`, `scripts/**`. Only `git status` / `git log` / `sha256sum -c` were run.
- No fixture git repos were created; no host sysctls touched; no packages installed or upgraded
  (no `pacman` transaction), so there is no tool/version/channel record to add.
- Unique scratch: `/fast/scratch/hyaku/tabi-r88/R88Exec1/{cold1,cold2}` (plus the two receipts
  and two score JSONs at the same root). Per seat bounds the whole scratch root
  `/fast/scratch/hyaku/tabi-r88/R88Exec1/` was removed before yielding; the cold receipts and
  score JSONs therefore no longer exist on disk. All scored values needed to audit the claim are
  transcribed above, and the exact commands are given for reproduction (fresh nonce, fresh ports,
  `--expect-fixture-sha256` from the new receipt).

## Risks / notes for L1

1. `prior-set-complete` is expected to fail on any cold receipt until the in-tree scored receipt
   is declared in `prior-set.txt` or covered by a content-bound `--tree-exempt` hash. That is a
   declaration decision owned by L1; it does not weaken any measured law, and treating the failure
   as a capability defect would misread the counter.
2. `--expect-fixture-sha256` is per-receipt for cold runs (fixture embeds the child port), so it
   cannot be the scored receipt's `8f93405128f1…`. Fixture content remains pinned by the driver's
   template extraction/patch assertions and the counter's `fixture-descriptors`.
3. Wall-time spread (199.8 s vs 179.2 s, ~11%) sits entirely in per-leg launch/teardown; leg
   windows are 2.14–2.72 s in both runs, so no timing-based refusal is near the replay threshold
   (`absMatched` 0/0 and 0/1 vs `absNeed` 89).
4. Observed stderr `MaxListenersExceededWarning` in the driver — not a receipt field, not judged
   by the counter, but worth a note if stderr is ever stricter.
