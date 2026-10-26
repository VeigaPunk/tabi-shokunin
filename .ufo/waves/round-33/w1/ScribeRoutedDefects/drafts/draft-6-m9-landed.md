# Draft — routed defect 6: M9's fix recorded as landed

The fix exists and was committed before the round-33 baseline: `corpus/knowledge/webdriver-bidi-capability-matrix.md:263`
`## Dated correction — 2026-10-26 (round 32 wave 2): collector size limits on this build` supersedes the
round-13 correction's clause at `:157-161` (`"with the body within that collector's \`max encoded item
size\`"`). Verified committed at the freeze: `git show e6b0a907:corpus/knowledge/webdriver-bidi-capability-matrix.md | grep -n "round 32 wave 2"` → `263:`.

Two texts, pick one or land both (the second is the one the spot-check asked for).

## A. Round-33 lesson `## Mistakes` row (primary)

    | M9 (round 32, closed) | `stale-premise` | `.ufo/waves/round-32/w1/ExecCollectorTiming.md` case 3 contradicted the matrix's round-13 collector correction (`corpus/knowledge/webdriver-bidi-capability-matrix.md` §Dated correction 2026-10-20) | the round-32 wave-2 integration | **landed** — `corpus/knowledge/webdriver-bidi-capability-matrix.md:263` §Dated correction 2026-10-26 (round 32 wave 2) supersedes the clause at `:157-161`: on 154.0.8037.97 a body larger than `maxEncodedDataSize` is collected whole and the `getData` failure threshold tracks the response header block; committed at the round-33 baseline `b7d16fb8` |

## B. In-place update of the round-32 lesson's M9 "fix" cell (`corpus/lessons/round-32.md:145`, last cell)

old:

    carried: an append-only correction of that paragraph is planned with gate v2

new:

    landed (round 33) — `corpus/knowledge/webdriver-bidi-capability-matrix.md:263` §Dated correction
    2026-10-26 (round 32 wave 2) corrects that paragraph (`:157-161`); committed at the round-33 baseline

If the lane treats every prior lesson as frozen prose, use A only and append B as a dated line at the end
of round-32's `## Wave 2 — falsify` section; lessons are outside the round-33 no-harm append-only path set
(`SKILL.md`, `SCORECARD.md`, `LOG.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`), so the
in-place cell edit does not break a frozen rule — but it does rewrite a round-32 statement, which is why A
carries the same fact independently.

## What the correction says, in the matrix's own words

`:265-272` — "The §2 'Byte truth' row (`:71`, '`maxEncodedDataSize` limits each item') and the round-13
correction's 'with the body within that collector's `max encoded item size`' (`:157-161`) describe the
draft, not this build's behaviour. Measured on chromium/chromedriver 154.0.8037.97 by w1
ExecCollectorTiming (`.ufo/waves/round-32/w1/ExecCollectorTiming.md`, case 3, and `runs/out10`–`out12`): a
body larger than `maxEncodedDataSize` is collected and returned whole; the limit at which `getData` starts
failing with `no such network data` tracks the size of the response header block, not the body; a
`maxTotalCollectedSize` below the body size still returns it."
