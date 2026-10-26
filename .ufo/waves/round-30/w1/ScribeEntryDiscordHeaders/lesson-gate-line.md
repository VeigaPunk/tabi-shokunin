# Required corpus/lessons/round-30.md §Gate content for S117

`corpus/lessons/round-30.md` does not exist at 061e620. The L1 owns its assembly; the row/Gate
drafter is seat `ScribeRows` (deliverables `.ufo/waves/round-30/w1/ScribeRows/rows.md`,
`gate-block.md`). This seat does not patch that file.

Two spans must appear in the lesson, byte-exact:

1. A located quote that grounds what the row teaches (19 words, the §Header Format disclosure):

   `For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request.`

2. The committed receipt quote (25 words). `check-frontier-admission.mjs` g6-gate does
   `lessonFlat.includes(rc.quote)` against `corpus/evidence/round-30/frontier/S117.json`, whose
   quote is fixed at:

   `limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.`

A lesson line carrying only span 1 fails g6 for S117. Quoting the full per-guild sentence also
satisfies span 2, because span 2 begins after `specifically ` inside it. Suggested line pair:

```md
- S117: https://docs.discord.com/developers/topics/rate-limits, 2026-10-26T06:40:02Z, "For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request." (19 words, §Header Format first paragraph)
- S117 (per-guild exception, required by the committed receipt quote): "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s."
```

Verified in a scratch fixture: with both spans present, the frozen counter returns
`population 1, admitted 1, clean true, exit 0` offline and with `--live`; without span 2 it returns
`admitted 0 (g6-gate)`.
