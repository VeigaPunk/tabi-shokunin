PASS

# R69Scribe — C2 knowledge note draft, `chromium-synth-scroll-gesture-linux`

Round 69 / Amendment 46, seat R69Scribe. Drafted the runtime knowledge note for the
scored synth-scroll receipt. Read-only on production; no counters, drivers or gates were
executed by this seat.

## Outputs

| artifact | path |
|---|---|
| knowledge note | `.ufo/waves/round-69/w1/R69Scribe/chromium-synth-scroll-gesture-runtime-round-69.md` (56 lines; first three lines `source:`, `verified-at:`, `recheck:`; `## Gate` is the final 6-line block at :51-56) |
| derived facts | `.ufo/waves/round-69/w1/R69Scribe/note-facts.json` |
| fact extractor | `.ufo/waves/round-69/w1/R69Scribe/extract-facts.mjs` |
| full report | `.ufo/waves/round-69/w1/R69Scribe/report.md` |
| scoped summary | `.ufo/waves/round-69/w1/R69Scribe.md` |

## Provenance read (nothing refetched)

| item | observed | check |
|---|---|---|
| scored receipt | `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`, sha256 `587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8` | `sha256sum` |
| driver pin | `scripts/chrome-cdp-synthscroll-round69.mjs`, sha256 `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3`; receipt `driverSha256` equals it | `sha256sum`; `freeze.txt` row |
| S173 | `.ufo/waves/round-68/sources/Input.pdl`, sha256 `5bbc6e23…c66e3d`; `:286-315` inspected with `grep -n` | `sha256sum`; numbered read |
| S174 | `.ufo/waves/round-69/sources/input_handler.cc`, sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`; `:71-79`, `:2167-2170`, `:2190-2191`, `:2239-2249` inspected | `sha256sum`; numbered read |
| counter receipt (a) | `.ufo/waves/round-69/scored/c2-counter-a.json` + `.exit`: `verdict: clean`, `checkCount: 63`, `findings: []`; exit `0` | read, **not rerun** |
| battery receipt (a) | `.ufo/waves/round-69/scored/c2-negatives-a.json` + `.exit`: `negatives: 44`, `refusedForExpectedReason: 44`, `positiveOk: true`, `failed: []`; exit `0` | read, **not rerun** |
| seat receipt (b) | `.ufo/waves/round-69/w1/R69Exec1/receipt.json` read only for wheel-count variance | read |

## Facts recorded in the note

Derived from the scored receipt with
`TMPDIR=/fast/scratch/hyaku/tabi-r69/R69Scribe node .ufo/waves/round-69/w1/R69Scribe/extract-facts.mjs corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json > .ufo/waves/round-69/w1/R69Scribe/note-facts.json`
(the extractor is read-only and writes no files; `TMPDIR` pointed at the seat scratch path, which no step needed to create, so no scratch directory was created).

| leg | scrollY | wheel n / Σ deltaY | scrollend | other events | elapsedMs |
|---|---|---|---|---|---|
| start | 0 → 0 | 0 / 0 | 0 | none | 124 |
| mouse | 0 → 600 | 46 / +600 | 1 @ 600 | none | 1846 |
| default | 600 → 300 | 25 / −300 | 1 @ 300 | none | 1465 |
| repeat | 300 → 900 | 51 / +600 | 3 @ 500, 700, 900 | none | 2165 |
| touch | 900 → 900 | 0 / 0 | 0 | pointerdown 1, pointermove 40, pointerup 1, touchstart 1, touchend 1, touchmove 0 | 1801 |

All 171 events `isTrusted: true`; `failures: []`; `degenerate: null`;
`synthScrollHypothesis: "CONFIRMED"`; `predicate: true`; 4
`Input.synthesizeScrollGesture` sends and 0 other `Input.*` sends in `cdpSendLog`;
page close state scrollY 900, 120 scroll events, eventCount 171.

`elapsedMs` interpretation is explicit in the note: `t0` precedes the send, gesture legs
add a fixed 900 ms settle sleep plus scrollY polling, so the field is an upper bound
(`response ≤ elapsedMs − 900`), and the start leg's 124 ms is the settle-only baseline.
I did not re-time the CDP calls.

## Verification performed here

- `sha256sum` on receipt, driver, S173, S174: all matched the values above and the
  `freeze.txt` driver row.
- Numbered reads (`awk`/`grep -n`) of S173 `:284-316` and S174 `:71-79`, `:2167-2170`,
  `:2190-2191`, `:2239-2249`: every cited line contains the text attributed to it in the
  note.
- `node extract-facts.mjs …`: per-leg aggregates match the note table exactly; the
  extractor's receipt digest matches `sha256sum`.
- `wc -l` on the note: 56 lines (≤ ~80); `awk` on `## Gate`: heading at :51, six lines
  through :56; `head -3` prefix check: `source:`, `verified-at:`, `recheck:`.
- No Chromium launch, no counters, no batteries, no builds by this seat.

## Findings

1. **Scored receipt loopback ports are outside the stated 41000-48999 band (observation,
   not a frozen kill rule).** The receipt records fixture origin `http://127.0.0.1:40501`
   and `--remote-debugging-port=40502`
   (`corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`, `fixture.origin`
   and `host.argv[2]`). My seat's Chromium bound was 41000-48999; the C2 kill list is pinned
   bytes / red runs / battery failure, so this is reported for the judge, not scored as a
   predicate failure. Repro:
   `python3 -c "import json;d=json.load(open('corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json'));print(d['fixture']['origin'],d['host']['argv'][2])"`
   → `http://127.0.0.1:40501 --remote-debugging-port=40502`.
2. **Pinned driver carries unused constants from another (band/overscroll) surface.**
   Unused definitions: `scripts/chrome-cdp-synthscroll-round69.mjs:43-45`
   (`SCROLLEND_WAIT_MS`, `SCROLLEND_DRAIN_MS`, `BOUNDARY_WAIT_MS`), `:48-51`
   (`BAND_WIDTH`, `BAND_COUNT`, `CONTENT_WIDTH`, `CONTENT_HEIGHT`), `:52-56`
   (`LEG_NAMES` horizontal list, `LEG_WITNESS`). The executed legs are `LEGS` at `:203-209`;
   `SWEEP_*`, `VIEWPORT`, `DEVICE_SCALE_FACTOR` are used. Repro:
   `grep -n "BAND_WIDTH\|LEG_NAMES\|LEG_WITNESS" scripts/chrome-cdp-synthscroll-round69.mjs`
   shows definitions only. Pinned instrument: recorded, no edit proposed.
   This corrects the earlier seat report's `:31-35` citation; the actual dead block is
   `:43-56`.
3. **SCORECARD capability row is still absent at read time.** C2 predicate (d) requires
   the capabilities table row plus a knowledge note citing S174; the note now exists, the
   row does not. `grep -n "synth-scroll\|synthscroll\|synthesizeScrollGesture" SCORECARD.md`
   returns only the round-68 C3 line (`SCORECARD.md:3630`) and no round-69 capability row.
   Integration owner action (L1); this seat does not edit SCORECARD.md.

## Out of scope / not assessed

- C1 adjacency: no inspection, no execution, no gate.
- The note does not adjudicate `chromium-hscroll-domain-linux` or any other capability.
- No claim about the seat run's counter beyond the committed files; not rerun.
- Touch-source non-scroll is recorded as measured, not explained; no cause assigned.

## Bounds compliance

- Wrote only `.ufo/waves/round-69/w1/R69Scribe/**` plus the required trailer summary
  `.ufo/waves/round-69/w1/R69Scribe.md`; no production, lane-root, fleet or sibling files.
- No git/jj mutations or commits; only reads (`sha256sum`, `grep`, `awk`, `python3`, `node`
  extractor).
- Scratch: `/fast/scratch/hyaku/tabi-r69/R69Scribe/` was not created; no step needed temp
  files (the extractor is read-only). Nothing to delete; no `/tmp` clone or evidence.
- No subagents, no swarms, no builds, no sysctl/host/service changes, no tool installs,
  no Chromium launch.
