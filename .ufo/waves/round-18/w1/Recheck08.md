VERDICT: PASS

# C1 freshness recheck — S016, S017 (seat Recheck08, 2026-10-20)

Both rows re-opened against their live source, both **held**. Both fetched bodies are
**byte-identical** to the 2026-10-19 Gate fetches recorded in
`corpus/lessons/kaika-fleet-round-1.md:59-60`, i.e. no source drift in the stable-docs window.
No drift -> no superseding SOURCES row drafted. Receipts produced only by
`.ufo/waves/round-18/recheck-fetch.mjs` (no hand-edited JSON). No tool installs or upgrades
were needed.

## S016 — Assertions — Playwright

- Row: `corpus/SOURCES.md:30`; source cell contains `https://playwright.dev/docs/test-assertions`
  verbatim; status `mined`, not in the superseded set; teaches = "Web-first assertions wait for
  the expected state; generic value assertions do not retry".
- Fetch: tool `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64)
  tabi-shokunin-recheck/18 ... 'https://playwright.dev/docs/test-assertions'` (receipt `command`).
- HTTP `200`; bytes `159543`; sha256
  `1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c`
  (identical to the Gate seat-fetch hash at `kaika-fleet-round-1.md:59`).
- decode `html-text`; quote (15 words, original Gate quote, quote-source
  `corpus/lessons/kaika-fleet-round-1.md:59`):
  "Playwright also includes web-specific async matchers that will wait until the expected condition is met."
  `quoteFound=true`, `quoteOffset=1402`.
- Excerpt: `corpus/evidence/round-18/source-recheck/S016.excerpt.txt`, sha256
  `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` (quote present in excerpt).
- Anchor observed: `docsearch version=stable`; footer `Copyright © 2026 Microsoft`; section
  "Auto-retrying assertions" still present.
- Verdict `held`: §Auto-retrying assertions says retrying assertions retry until the assertion
  passes / the expected condition; §Non-retrying assertions says "These assertions allow to test
  any conditions, but do not auto-retry" and warns they can produce a flaky test. Both halves of
  the teaches cell are directly stated in the body.

## S017 — Release notes — Playwright

- Row: `corpus/SOURCES.md:31`; source cell contains `https://playwright.dev/docs/release-notes`
  verbatim; status `mined`, not in the superseded set; teaches = "`--shuffle` prints a seed and
  `--shuffle <seed>` replays the order, making order-dependent failures reproducible".
- Fetch: same tool curl argv against `https://playwright.dev/docs/release-notes` (receipt `command`).
- HTTP `200`; bytes `1002533`; sha256
  `ce461e5be73bd602d24395e4628c62ded8293b088a085c82f5436960241952c5`
  (identical to the Gate seat-fetch hash at `kaika-fleet-round-1.md:60`).
- decode `html-text`; quote (11 words, quoteFound=true, quoteOffset=3891):
  "New --shuffle command line option schedules tests in a random order"
- Quote provenance nuance: the Gate quote is markdown-annotated as
  ``New `--shuffle` command line option schedules tests in a random order`` (§Test runner). The
  HTML renderer wraps `--shuffle` in `<code>`, so the literal backticks are not in the rendered
  text and the markdown form does not normalize-match; the receipt therefore carries the rendered
  wording, with `quoteSource` = `corpus/lessons/kaika-fleet-round-1.md:60 (markdown backticks
  around --shuffle are rendered away in HTML)`. Content is unchanged from the Gate quote.
- Excerpt: `corpus/evidence/round-18/source-recheck/S017.excerpt.txt`, sha256
  `36197d5a3142f7aa2ae9cd12d2f66338331a3262e62d56136955caa68ddcb586` (quote present).
- Anchor observed: `<h2 id=version-164>Version 1.64` is the first version heading and first TOC
  entry; page description meta `Version 1.64`; the 1.64 "Test runner" section is present.
- Verdict `held`: in Version 1.64 §Test runner the body says `--shuffle` "schedules tests in a
  random order", the sample transcript prints `# Running 42 tests using 4 workers, shuffle seed
  271828182`, and the following lines are `# Pass the seed to reproduce the same order.` /
  `npx playwright test --shuffle 271828182`. That grounds both "prints a seed" and "`--shuffle
  <seed>` replays the order" for order-dependent failures.

## C1 receipt-contract self-check (both receipts)

- `schema` `tabi-source-recheck-v1`; `row` S016/S017 present in SOURCES at B and not superseded;
  `rowUrl` verbatim in the row's source cell; `sha256` 64-hex; `quoteWords` 15 / 11 and equals the
  quote word count; `quoteFound=true`; `excerptSha256` recomputed with `sha256sum` equals the
  receipt; `fetchedAt` `2026-10-20T19:05:48Z` (both); `httpStatus` 200; `teachesVerdict` `held`;
  `producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` equals
  `sha256sum .ufo/waves/round-18/recheck-fetch.mjs`. One receipt per row; no row file pre-existed.

## Observation (not this seat's item)

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs` is absent at the
current lane worktree, so I could not run the `c1_rows_rechecked` counter over these receipts; the
counter seat owns that. Unrun there = unpassed.

## Files written (absolute)

- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S016.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S017.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S017.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck08.md
