# R69Scribe — C2 knowledge note, `chromium-synth-scroll-gesture-linux`

Verdict: **PASS** (draft complete; no probe, counter or gate executed by this seat).
Full report: `.ufo/waves/round-69/w1/R69Scribe/report.md`.

## Delivered

- `.ufo/waves/round-69/w1/R69Scribe/chromium-synth-scroll-gesture-runtime-round-69.md`
  — 56 lines; first three lines `source:`, `verified-at:`, `recheck:`; `## Gate` is the
  final 6-line block (:51-56) with one admit and one reject plus reason and flip condition.
- `.ufo/waves/round-69/w1/R69Scribe/note-facts.json` and `extract-facts.mjs` — the note's
  per-leg numbers re-derivable from the scored receipt.
- `.ufo/waves/round-69/w1/R69Scribe/report.md` — scoped findings and provenance.

## Coverage of the milestone

The note records the live scored run (receipt sha256 `587100d9…c667f8`, driver pin
`13ea3f8a…abce3`), tied line by line to S173 `Input.pdl:286-315` and S174
`input_handler.cc:71-79`, `:2167-2170`, `:2190-2191`, `:2239-2249`:

- start 0→0; mouse 0→600 (46 wheels, Σ+600, 1 scrollend);
  default 600→300 (25 wheels, Σ−300, 1 scrollend);
  repeat 300→900 (51 wheels, Σ+600, 3 scrollends at 500/700/900);
  touch 900→900 (0 wheels, 0 scrollends, pointerdown/up 1+1, pointermove 40,
  touchstart/end 1+1, touchmove 0).
- `elapsedMs` 124/1846/1465/2165/1801 is stated as a latency upper bound
  (`response ≤ elapsedMs − 900`), not measured latency.
- Limits stated: one host/build, headless, desktop metrics; touch-source non-scroll
  measured not explained; counts vary (seat run 24 vs 25 default wheels); publisher
  authenticity not claimed.

Committed counter (a): `.ufo/waves/round-69/scored/c2-counter-a.json` clean, 63 checks,
exit 0. Battery (a): `c2-negatives-a.json`, 44/44 refused for expected ids, positive ok,
exit 0. Both read, not rerun.

## Findings

1. Scored receipt used loopback ports 40501/40502, outside the 41000-48999 band stated in
   this seat's Chromium bound (receipt `fixture.origin`, `host.argv[2]`). Reported for the
   judge; not a frozen kill rule and not scored as a predicate failure.
2. Pinned driver `scripts/chrome-cdp-synthscroll-round69.mjs:43-56` carries unused
   constants from a band/overscroll surface (`SCROLLEND_*`, `BOUNDARY_WAIT_MS`, `BAND_*`,
   `CONTENT_*`, `LEG_NAMES`, `LEG_WITNESS`); executed legs are `:203-209`. No edit
   proposed — pinned instrument. (Corrects the earlier seat's `:31-35` citation.)
3. `SCORECARD.md` has no round-69 capability row yet (only the r68 C3 row at :3630);
   C2 predicate (d) needs that row plus a note citing S174. Integration owner action.

## Bounds

Wrote only `.ufo/waves/round-69/w1/R69Scribe/**` plus this required trailer file; read-only
elsewhere; no git/jj mutations; no scratch created; no subagents; no Chromium launch; no
tool installs.
