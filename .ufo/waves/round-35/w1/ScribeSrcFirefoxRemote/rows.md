# C2 frontier rows — S136, S137 (tabi round 35, wave w1, seat ScribeSrcFirefoxRemote)

Drafted 2026-10-26 against the lane at freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`
(scratch clone `/fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote/clone`). Both rows were
opened by this seat's own read-only HTTPS GET this round (receipts: `gate.md`, `fetches/`).
Both are destined for `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`, the C2
entry; `corpus/SOURCES.md` gains no other edit. Registry ids are the seat's assignment
(S136, S137); the L1 renumbers if integration order changes.

Registry rows, verbatim (11 cells; NF=13 after `|` split, checked):

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S136 | Remote protocol preferences — Firefox Source Docs — https://firefox-source-docs.mozilla.org/remote/Prefs.html | docs | A | Firefox's own statement of the Remote Agent's protocol-selection and experimental-command preferences at the round-35 fetch; not a command-coverage matrix and not another engine | living page fetched 2026-10-26, body lines 292-299 under heading remote.active-protocols and lines 308-312 under heading remote.experimental.enabled; body 31971 B, sha256 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1 | WebDriver BiDi is the Remote Agent's only protocol after CDP support ended and remote.active-protocols was removed in Firefox 141; experimental BiDi commands are exposed only when remote.experimental.enabled is set, which defaults to false outside Nightly | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S137 | browsingContext.locateNodes command — MDN — https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes | docs | B | The locateNodes command's parameters and locator shapes as MDN documents them, secondary to the W3C draft (S005, S124); not browser support evidence | MDN page fetched 2026-10-26, §browsingContext.locateNodes command paragraph (body line 1506) and the locator type/value entries (body lines 1596-1640); body 186783 B, sha256 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48 | locateNodes searches one context with a locator object whose type selects the criterion and whose value follows that type (css takes a selector string), and returns node references reusable in later commands | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |

## Why these two pages, and what each grounds in the C2 entry

- **S136 grounds R1 (browser identity at launch) and the entry's protocol premise.**
  `remote.active-protocols` is documented as removed in Firefox 141 with the end of CDP
  support, leaving WebDriver BiDi as the Remote Agent's only protocol — so a Firefox 158
  session's `webSocketUrl` is a BiDi endpoint by construction, not by configuration. The same
  page's `remote.experimental.enabled` entry (default `false` outside Nightly) is the fact a
  C2 row needs before it may read a release-Firefox refusal of an experimental BiDi command as
  "not implemented": the preference state must be recorded first. The page is Firefox's own
  source documentation, tier A scoped to the Remote Agent's preferences, never to per-command
  coverage.
- **S137 grounds R5 (DOM shape/state) for the one command the C2 recipe uses to resolve nodes.**
  MDN documents `browsingContext.locateNodes` as taking a `locator` object whose `type` chooses
  among five criteria and whose `value` follows that type, `css` taking a selector string, and
  returning node references for later commands. It is tier B: docs secondary to the W3C draft,
  and its browser-compatibility table is a lead, not measurement.
- Rejected candidates (fetch status recorded, no row): `remote/RemoteAgent.html`,
  `remote/WebDriverBidi.html`, `remote/SupportedClients.html` → HTTP 404, 358/360/363 B
  (guessed paths; the index at `remote/index.html`, 28,453 B, HTTP 200, links only the
  preferences and extensions pages). `testing/geckodriver/Capabilities.html` (HTTP 200,
  31,324 B) contains no `webSocketUrl` and no `moz:geckodriverVersion` string (grep count 0),
  so it cannot ground R1's predicates. `remote/Security.html` (HTTP 200, 32,928 B) does ground
  the loopback-only restriction and the 9222 default, but was not registered: the item allotted
  two rows, and S136's preference facts are the ones the entry's per-row verdicts depend on.
  `…/BiDi/Modules/network/addDataCollector` → HTTP 404, 88,379 B, so the locateNodes page was
  used for the MDN half.

## Duplicate check against the registry (CORPUS.md rule 2; census E04)

Run in the lane root, read-only:

- `grep -n 'firefox-source-docs.mozilla.org' corpus/SOURCES.md` → no match, exit 1.
- `grep -n 'Modules/browsingContext/locateNodes' corpus/SOURCES.md` → no match, exit 1.
- `grep -c 'developer.mozilla.org' corpus/SOURCES.md` → 2, both pre-existing and unrelated:
  `S006` (line 20, `…/BiDi/Modules` index) and `S007` (line 21, `…/How_to/Create_BiDi_connection`).
- Registry held 133 rows before this seat's append; ids S134–S135 are unused in the file as
  read (reserved for the C2 entry/sources seats), so S136–S137 leave no collision.

## Validation

See `census-check.txt`. `sources-census.sh validate --file <clone>/corpus/SOURCES.md` reports
the two rows structurally valid and flags only `E11 missing used-by
corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` for S136 and S137 — the C2 entry
does not exist at the freeze and is another seat's deliverable. With a clone-only zero-byte
stub of that path the same validate exits 0 with zero E-codes (21 pre-existing W04 warnings,
none on S136/S137); the stub was deleted, and `git -C clone status --porcelain` then showed
only `M corpus/SOURCES.md`.
