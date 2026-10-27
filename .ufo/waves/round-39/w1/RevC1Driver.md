# RevC1Driver — C1 scoped findings

- **High:** `scripts/playwright-firefox-egress-round39.mjs:245-246,268-271,329` discovers the PID tree once before navigation and reuses it for all samples/final sweep. A later Firefox descendant with a non-loopback socket is invisible.
- **High:** `:116-118,218-225` turns empty/unavailable `ss` stdout into synthetic zero observations. The frozen C1 counter (`.ufo/waves/round-39/counters/c1-egress-session-bound.mjs:112-117`) checks only numeric non-loopback counts, not the `unavailable` flags. A receipt can pass while lacking one required observation surface.
- **Medium:** `:90-92,94-111` selects roots through substring matching in `ps args` and retains bare PIDs; it does not prove executable identity or guard PID reuse/reparenting between tree discovery and observation.
- **Medium:** `:315-321` calculates `coverageMs` after the post-close 600 ms sleep, while sampling stops at `:317`; counter checks only elapsed `coverageMs` and count, not sample timestamp span/live interval.

Concrete falsifiers and evidence limitations are documented in [w1/RevC1Driver/report.md](w1/RevC1Driver/report.md). No live falsification run was performed.

VERDICT finding — source-level C1 false-negative paths observed; occurrence during the captured runs not evaluated.
