VERDICT: PASS

# C1 freshness — S014 and S015 rechecked (seat Recheck07)

Both rows re-opened against their live source on 2026-10-20 and both **held**: the body is
byte-identical to the 2026-10-19 seat fetch recorded in
`corpus/lessons/kaika-fleet-round-1.md:57-58`, and the original Gate quote is still present
verbatim under `html-text` decode. Receipts were produced only by
`node .ufo/waves/round-18/recheck-fetch.mjs` (schema `tabi-source-recheck-v1`); no hand edit.

## Row S014 — Trace viewer — Playwright

- Row at lane tip `2bff864fdfee684ddbcd066cc8e735adaba2735c`: `corpus/SOURCES.md:28`
  (`| S014 | Trace viewer — Playwright — https://playwright.dev/docs/trace-viewer | docs | A | … | mined | 2026-10-19 |`)
- Fetch: `curl -sSL --compressed --max-time 90 … 'https://playwright.dev/docs/trace-viewer'`
  → **http 200, 60566 bytes**
- sha256: `e947d4dc0b73cdb8eae97f10c268c10024e4ff9410077acd7d69e6b0bafc1bee`
  (identical to the 2026-10-19 seat fetch digest at `kaika-fleet-round-1.md:57`)
- Quote (15 words, `quote-source` = original Gate quote, `corpus/lessons/kaika-fleet-round-1.md:57`):
  "Traces should be run on continuous integration on the first retry of a failed test"
  — found at normalized offset 2845, §Tracing on CI.
- Anchor observed: `docsearch:version=stable`, no date/revision marker in the body; body sha256
  equals the 2026-10-19 seat fetch, so the served artifact is unchanged even though the page
  itself publishes no anchor.
- Verdict: **held**. §Tracing on CI still instructs `trace: 'on-first-retry'` and says it
  "will produce a trace.zip file for each test that was retried"; §Snapshots plus the actions
  tab still expose DOM snapshots, console logs and network logs, which is exactly the teaches
  cell ("Playwright Test retry-trace capture" / inspectable with DOM, console, network records).
- Drift draft: none.

## Row S015 — Auto-waiting — Playwright

- Row at lane tip: `corpus/SOURCES.md:29`
  (`| S015 | Auto-waiting — Playwright — https://playwright.dev/docs/actionability | docs | A | … | mined | 2026-10-19 |`)
- Fetch: `curl -sSL --compressed --max-time 90 … 'https://playwright.dev/docs/actionability'`
  → **http 200, 47845 bytes**
- sha256: `31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d`
  (identical to the 2026-10-19 seat fetch digest at `kaika-fleet-round-1.md:58`)
- Quote (16 words, `quote-source` = original Gate quote, `corpus/lessons/kaika-fleet-round-1.md:58`):
  "It auto-waits for all the relevant checks to pass and only then performs the requested action."
  — found at normalized offset 1230, §Introduction.
- Anchor observed: `docsearch:version=stable`, no date marker; body sha256 equals the
  2026-10-19 seat fetch.
- Verdict: **held**. §Introduction still says Playwright "performs a range of actionability
  checks on the elements before making actions" and that a check not passing "within the given
  timeout, action fails with the TimeoutError" — the gate is on the action, not on the test's
  post-action state predicate, which is the teaches cell.
- Drift draft: none.

## Contract check (independent re-verification of the written receipts)

For both `S014.json` / `S015.json`:

- `schema` = `tabi-source-recheck-v1`; `quoteFound` = true; `httpStatus` = 200; `fetchedAt` =
  `2026-10-20T19:05:39.6xxZ`.
- `rowUrl` occurs **verbatim** in that row's source cell at the lane tip (checked by substring
  against the `| S014 |` / `| S015 |` lines).
- `quoteWords` 15 / 16 ≤ 25 and equal to the quote's actual word count.
- `normalize(quote)` occurs in `normalize(excerpt)` — re-checked directly, not only via the tool.
- `excerptSha256` matches the excerpt file bytes:
  - S014 `5ca87465a4c202ff770f289f9c901a5e03e6b781fe0d2b3d9346b5458d9e063d`
  - S015 `7e3087d046e63e90eb3496b6dec4874c43924072fb7051a8b8f7a9a6738f6245`
- `producerSha256` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` and equals
  `sha256sum .ufo/waves/round-18/recheck-fetch.mjs` measured in this lane.
- Neither row is in the PLAN superseded set (S004→S028, S039→S040, S047→S054, S049→S055,
  S050→S056, S053→S057); one receipt per row.

No SOURCES status edit was made (append-only registry, integrated by L1); no byte-frozen path
was touched. No drift → no superseding row or Gate entry drafted.

## Tooling

No installs and no upgrades were performed (nothing was needed; `node v24.21.0`, `curl 8.23.0`
already present). All pacman transactions remain paused.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S014.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S014.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S015.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S015.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck07.md
