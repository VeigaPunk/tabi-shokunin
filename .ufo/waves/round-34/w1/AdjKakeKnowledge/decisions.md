# Per-candidate decisions — AdjKakeKnowledge (C1 build, round 34)

Baseline/freeze: `59f1b47aae277e1670e4a824173da8cde7e388ee`; sibling pin
`kake-shokunin@044048597d62f3199494b63b36e90dd57825e350` (counter `PINS.kake`).

| # | candidate key (rows 4,6,7,54,55,56,57 of `.ufo/waves/round-34/baseline/c1-candidates.tsv`) | set | decision | one-sentence reason grounded in both sides |
|---|---|---|---|---|
| 4 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/accessibility-review-packet.md:121` | A | screen `same-surface` → `accessibility-browser-at-execution` | kake's handoff sentence gives the operator the authorization and tabi "authorized browser/assistive-technology work", which is exactly the execution split already mapped from kake `PROVINCE.md:79` against tabi `SKILL.md:2889`. |
| 6 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/js-rendering-queue.md:77` | A | screen `same-surface` → `crawler-discipline-vs-publishing` | "Browser execution and client-side crawler discipline belong to tabi … kake's side is the publisher's placement and status codes" is kake `PROVINCE.md:30` restated (map row 6), and the queueing contract adds no second allocation. |
| 7 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/static-canonical-preflight.md:134` | A | screen `same-surface` → `js-rendering-browser-execution` | "rendered DOM (tabi's ground)" is the browser-execution surface mapped from kake `PROVINCE.md:61` / tabi `SKILL.md:2887`; the line's new content is kake's own receipt limit (bytes at `fetchedAt`), a fact on kake's side of that split (QUALITY 91). |
| 54 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/accessibility-review-packet.md:122` | B | screen `same-surface` → `accessibility-browser-at-execution` | the continuation of candidate 4's sentence ("authorized browser/assistive-technology work; **kagi** owns any credential") repeats the a11y execution split and puts credentials on the surface already refused-route as `secrets-vault-ops` (tabi `PROVINCE.md:16`). |
| 55 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/accessibility-review-cards.json:8` | B | screen `same-surface` → `accessibility-browser-at-execution` | the `publisherCheck` string "tabi owns authorized browser/assistive-technology execution …" (55 occurrences in the card file) is the same a11y split kake `PROVINCE.md:79` maps, and "any account operation remains operator-gated" is kake's condition on its own handoff. |
| 56 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/mirror-pitfalls.md:40` | B | screen `same-surface` → `musketeer-cdp-9222-profile-lease` | kake's "Lease first: `webzites lease acquire …`; release" is kake's operating rule under the very lease/profile ownership that row 7 (kake `PROVINCE.md:35`, kagi `PROVINCE.md:43`) already holds contested with tabi's throwaway-profile rule (`SKILL.md:556`); the round-33 lead's `:39` re-anchors to `:40` under the counter's quote anchor. |
| 57 | `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/fire-journal-codes.md:27` | B | screen `not-browser-sense` (surface `-`) | the row is an exit-code entry of kake's own `kimi-surface.mjs` fire journal ("CDP down, no kimi tab, tab new, live fetch" → `browser ensure`): kake tool infrastructure states, no browser behaviour, site or evidence surface that tabi practises. |

No map row, no declaration bullet, no L0 line is drafted for this seat. Quotes
are verbatim substrings of the candidate lines (checks pasted in the seat
report); `static-canonical-preflight.md:134`'s content matches the round-33
lead topic `rendered-dom` with `real_overlap=yes`, which is why it is a
`same-surface` screen and not `not-browser-sense`.
