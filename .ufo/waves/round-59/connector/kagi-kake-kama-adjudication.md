# R59Connector — independent adjudication of the kagi / kake / kama browser-ground lines

Seat: `R59Connector` (connector). Lane: `tabi-shokunin`, round 59, wave w1.
Authority: `.ufo/waves/round-59/claims.json` (frozen; read first; not amended).
All scans READ-ONLY. Nothing outside `connector/` was written.

**Independence statement.** This adjudication was produced by my own scripts and my own
reading of the three provinces, **before** I opened R59Rebind's draft. I read
`.ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv` only afterwards, for the
cross-check in §5. No disposition below was copied from it.

## 1. Inputs and heads

| Lane | Live head (read at scan time) | PROVINCE.md sha256 | Lines |
|---|---|---|---|
| `kagi-shokunin` | `91f7752ba551092eef20f6bd43d6dd798dc88ba0` | `0bbf19b3019e780269259b1acbbd45fcb9a53139fe6337609e7bd6448b364edd` | 107 |
| `kake-shokunin` | `1240288fb1065ba4dfae0bb3beeaa9cbeb97ea27` | `0513521fc4ac3d2a79ed53c86b3d82208e65a20d43ab927e2641eea75e361e7d` | 491 |
| `kama-shokunin` | `6035e952c2521999e192d6f236331f265ac98392` | `f0aaae9ccfd0ecb6641ad1646934f4ff5555fcc45d2e397670b2eb5ff083e8a6` | 270 |

Every byte was read with `git cat-file -p <head>:<path>` — the **working tree was never
read**, matching the meter's per-run head-snapshot discipline (`c1-adjacency-host-v18.mjs`
`makeSibRefGit`).

### Files adjudicated, and why

The claim's change (d) screens, for every sibling: *"its PROVINCE.md and every file its map
rows reference"*. From `tabi-shokunin/corpus/adjacency.tsv` (16 map rows), the three lanes'
referenced files are:

| Lane | screened files (per (d)) | from which map rows |
|---|---|---|
| `kagi-shokunin` | `PROVINCE.md` | `musketeer-cdp-9222-profile-lease` → `PROVINCE.md:64`; `secrets-vault-ops` → `PROVINCE.md:3` |
| `kake-shokunin` | `PROVINCE.md`, `SKILL.md` | `crawler-discipline-vs-publishing` → `PROVINCE.md:40`; `musketeer-cdp-9222-profile-lease` → `PROVINCE.md:45`; `js-rendering-browser-execution` → `PROVINCE.md:67`; `robots-txt-publisher-audit-vs-client-obedience` → `PROVINCE.md:310`; `accessibility-browser-at-execution` → `PROVINCE.md:85`; `lab-performance-tool-runs` → `SKILL.md:697` |
| `kama-shokunin` | `PROVINCE.md`, `corpus/knowledge/listener-census.md` | `cdp-live-target-census` → `corpus/knowledge/listener-census.md:355` |

So I adjudicated **five files, 197 browser-ground hit lines** in total (72 under the meter's
frozen list, 184 additional under the seat's list, 1 line — kama `listener-census.md:243` — is
a meter hit with **no** card-list word, so the union is 256 distinct lines).

## 2. The word lists I used (stated explicitly, as required)

**List M — the meter's FROZEN list.** Copied from `tabi-shokunin/.ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs:203`
(the v19 meter inherits it; the claim's change set (a)–(e) does **not** list a word-list change):

```
cdp, devtools, remote-debugging, headless, webdriver, geckodriver, selenium,
playwright, bidi, crawl, screenshot, recordhar, record-har
```

**List C — the seat's list, named in my item** (stated so a reader can reproduce Part B):
`chromium, chrome, cdp, devtools, browser, headless, websocket, http, playwright, selenium,
puppeteer, firefox, geckodriver, webview`.

Both lists are matched case-insensitively as **substrings** of the whole line — the meter's
rule is `BG_WORDS.some((w) => low.includes(w))` (`c1-adjacency-host-v18.mjs:310`), and I used
the same rule for list C.

**List M vs list C — the two substantive differences.**

1. List C contains `http`, `chrome`, `chromium`, `browser`, `websocket`, `firefox`,
   `puppeteer`, `webview`; list M contains none of these. List C therefore matches a bare
   `https://` URL, an `HTTP 200 OK` status string, the token `burnerchrome`, and the generic
   word "browser" — 184 extra lines on these three lanes, of which **167 are incidental**.
2. List M contains `crawl`, `screenshot`, `bidi`, `webdriver`, `remote-debugging`,
   `recordhar`, `record-har`; list C contains none of these. On kake — whose domain *is*
   publisher-side crawl hygiene — list M's `crawl` term is what surfaces 43 of kake's 45
   `PROVINCE.md` hits, and 17 of kake's 19 `SKILL.md` hits. These are genuinely tabi-relevant
   lines: they are the **client-side crawler discipline** lines, the exact ground tabi claims
   in the ruled map (`crawler-discipline-vs-publishing` → `split-declared`).
3. Consequence for the lease: `cdp` ∈ both lists, `chrome` ∈ only list C. **kagi
   `PROVINCE.md:64` says "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile`"** →
   list M hits it. **kake `PROVINCE.md:45` says "The the-musketeer Chrome profile lease is
   contested scope (kagi/tabi/kake)"** → list M does **not** hit it (verified by evaluating
   all 13 list-M words against that exact line: zero hits). See §4.

## 3. Vocabulary I adjudicated with

The claim freezes a three-term disposition vocabulary. I use it verbatim:

- **`no-tabi-ground`** — the line names a browser-ground *word* but no browser surface in
  tabi's ground; it is incidental (a URL, an HTTP status artefact, a brand token, a
  publisher-side crawl sentence, a vendor sentence about HTTP clients).
- **`overlap-declared`** — the line states, in the sibling's own voice, that the browser
  surface belongs to tabi (or to a declared split). It records a **declared** adjacency, not
  an open question.
- **`contested-open`** — the line names a browser surface whose ownership is **not settled**:
  it needs a tabi (or L0) ruling before it can be closed.

My item also asked me to name "which lines name browser surfaces, which are incidental, which
need a tabi ruling". That maps onto the frozen vocabulary as:

| my question | frozen vocabulary |
|---|---|
| names a browser surface, incidental | `no-tabi-ground` |
| names a browser surface, split already declared by the sibling | `overlap-declared` |
| names a browser surface, ownership unsettled | `contested-open` |

## PART A — the 72 meter-list hit lines, adjudicated line by line

Every line below is a hit under the meter's **frozen** BG word list. These are the only lines
the v19 meter will re-derive, so these are the only lines that can become ledger `line` rows.
Verdicts use the frozen vocabulary: `no-tabi-ground` / `overlap-declared` / `contested-open`.

### `kagi-shokunin` — `PROVINCE.md` (3 hits)

| line | meter word(s) | my verdict | quote (verbatim whole line) |
|---|---|---|---|
| `41` | `cdp` | **no-tabi-ground** | - `~/.local/bin/the-janitor` (755, 333 lines) — the CLI: `status`/`start`/`stop`/`request`/`run`/`refs`/`whoami`/`cdp-bridge`/`tac-check`/`tac-register`/`_serve` (hidden) |
| `64` | `cdp` | **needs-ruling** | - CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake** (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest — the profile dir itself is presence-only, mode unchecked). Declared as a partition row in `corpus/adjacency.tsv` (`kake` / `contested` / `presence-only`), so drifting the profile dir to an exact mode pin is `OVERCLAIM`, exit 1 (round 16) |
| `81` | `cdp` | **needs-ruling** | **Deliberate refusals:** vault-side structure (which vaults/items/fields exist) stays unmapped — mapping it would put ref paths in a durable artifact; `op` item-level reads stay unexercised; the CDP lease/profile ownership question is reported to the integrator, never adjudicated here. |

### `kake-shokunin` — `PROVINCE.md` (45 hits)

| line | meter word(s) | my verdict | quote (verbatim whole line) |
|---|---|---|---|
| `22` | `crawl` | **no-tabi-ground** | - Crawl hygiene per host (robots.txt, sitemap scope, canonical signals) — first |
| `23` | `crawl` | **no-tabi-ground** |   entry `corpus/knowledge/crawl-scope-per-host.md`; canonical/JS rendering open. |
| `40` | `crawl` | **surface-note** | - `tabi` drives browsers and owns client-side crawler discipline; kake owns |
| `66` | `crawl` | **no-tabi-ground** | was repaired or a Google-selected canonical observed. The broader crawl and |
| `308` | `crawl` | **no-tabi-ground** | Unknown records, including `Sitemap` and `crawl-delay`, are ignored; sitemap parsing/scope and crawler-specific extension behavior remain open (C1 contract, Lines; S012–S013). |
| `309` | `crawl` | **no-tabi-ground** | This contract does not observe live fetches, redirects, caching, or crawler behavior (C1 contract, Limits). |
| `310` | `crawl` | **surface-note** | Boundary: kake owns publisher-side robots/sitemap placement at the host it serves, while browser-driving and client-side crawler discipline belong to tabi (PROVINCE.md, Adjacent); this audit does not probe or publish an owned property. |
| `328` | `crawl` | **no-tabi-ground** | Still open: live fetch, redirects, caching, crawler extensions, sitemaps, the symlinked manifest |
| `329` | `crawl` | **surface-note** | directory and U+FFFD per byte. Client-side crawler discipline stays with tabi; kake keeps |
| `344` | `crawl` | **surface-note** | Boundary unchanged: publisher-side placement is kake's; client-side crawling stays with tabi. |
| `346` | `crawl` | **no-tabi-ground** | ## Round-49 crawl-budget frontier step |
| `348` | `crawl` | **no-tabi-ground** | Round 49 adds publisher-side crawl-budget consequence knowledge |
| `349` | `crawl` | **no-tabi-ground** | (`corpus/knowledge/crawl-budget-consequences.md`, S273, S274), re-opened this |
| `351` | `crawl` | **no-tabi-ground** | checked sentences are: Google will not shift newly available crawl budget to |
| `353` | `crawl` | **no-tabi-ground** | backoff reduces the crawl rate across the whole hostname (S274). Publishing |
| `358` | `crawl` | **no-tabi-ground** | ## Round-51 canonical-selection and crawler-identity frontier step |
| `364` | `crawl` | **no-tabi-ground** | covers only the declaration side and explicitly disclaims selection. `corpus/knowledge/crawler-identity.md` |
| `365` | `crawl` | **no-tabi-ground** | (S263) holds the identity half of the crawl signal — "Googlebot" names two crawlers, the subtype |
| `370` | `crawl` | **no-tabi-ground** | crawl-error-status-table) stay true as vendor sentences but inherit subtype ambiguity; a round |
| `373` | `crawl` | **no-tabi-ground** | ## Round-52 per-engine crawl hygiene (and a correction to the round-51 wording) |
| `379` | `crawl` | **no-tabi-ground** | Round 52 adds three entries on per-engine crawl hygiene beyond Google, on rows opened this round. |
| `381` | `crawl` | **no-tabi-ground** | non-endorsement and is not weighed when results are ordered — it is not a crawl refusal, and the |
| `382` | `crawl` | **no-tabi-ground** | tagged URL is still used to find new pages. `corpus/knowledge/baidu-friendly-crawl-guidance.md` |
| `383` | `crawl` | **no-tabi-ground** | (S329): one `User-agent: Baiduspider` block binds the PC and mobile crawlers together, the crawler |
| `400` | `crawl` | **no-tabi-ground** | site root). They extend the per-engine crawl-hygiene ground of round 52 from link attributes |
| `402` | `crawl` | **no-tabi-ground** | 更新日 2010年11月24日); no robots.txt was served and no crawl was observed, so no crawler behaviour is |
| `404` | `crawl` | **no-tabi-ground** | operator-owned. Yahoo! JAPAN crawler-address, user-agent-list and deleted-URL pages in the staging |
| `414` | `crawl` | **no-tabi-ground** | ## Round-56 Yahoo! JAPAN crawl handling: link-target restriction, deleted URL, non-existent URL |
| `416` | `crawl` | **no-tabi-ground** | Round 56 adds three entries on what one operator's pages say a server's answer does to the crawl, each |
| `417` | `crawl` | **no-tabi-ground** | re-grounded against a fresh retained body fetched 2026-10-25: `corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md` |
| `418` | `crawl` | **no-tabi-ground** | (S367, a held row re-opened: a page refuses the crawl of the link targets it contains from its own head |
| `420` | `crawl` | **no-tabi-ground** | leaves the page's own registration permitted), `corpus/knowledge/yahoo-japan-deleted-url-recrawl.md` (S419, |
| `421` | `crawl` | **no-tabi-ground** | a new row: a deleted URL that answers `HTTP 200 OK` may keep being crawled; the page asks the publisher to confirm |
| `423` | `crawl` | **no-tabi-ground** | cannot be set) and `corpus/knowledge/yahoo-japan-nonexistent-url-recrawl.md` (S420, a new row: an error page served |
| `424` | `crawl` | **no-tabi-ground** | under `HTTP 200 OK` is not read as an error page and the crawl continues; this page asks that the server be |
| `426` | `crawl` | **no-tabi-ground** | They continue the per-engine crawl-hygiene ground of rounds 52 and 55 from link attributes (S374) and the |
| `428` | `crawl` | **no-tabi-ground** | documentation says (the pages print 更新日 2010年11月24日); no URL was served under test and no crawl was |
| `437` | `crawl` | **no-tabi-ground** | Round 57 adds two entries on what one operator's own pages say a dead link is and how its crawler treats one, each re-grounded against a |
| `444` | `crawl` | **no-tabi-ground** | figure belongs to index display, not to dead-link handling). They continue the per-engine crawl-hygiene ground of rounds 52, 55 and 56 |
| `446` | `crawl` | **no-tabi-ground** | operator's pages say (the pages print 发布日期 2022-09-09 and 2016-06-30); no URL was served under test and no crawl was observed. |
| `455` | `crawl` | **no-tabi-ground** | ## Round-58 crawler identity: Baidu identification and unblocking |
| `457` | `crawl` | **no-tabi-ground** | Round 58 adds two entries on the `Crawler identity` ground (round-51 Googlebot subtypes row; `PROVINCE.md:22-23` unchanged), each re-grounded |
| `464` | `crawl` | **no-tabi-ground** | sets. Refused on scope: staged `yahoo-japan-crawler-address-change-notice.md` (S378) — an ads-API notice for the Display Ads product-list FTP |
| `465` | `crawl` | **no-tabi-ground** | crawler, ad-delivery infrastructure, not a search crawler (`corpus/lessons/round-58.md` § Gate). Adjacency (reported, not absorbed; |
| `466` | `crawl` | **no-tabi-ground** | `.ufo/waves/round-58/w1/ConnSiblingOverlap.md`): no sibling lane owns crawler DNS verification. |

### `kake-shokunin` — `SKILL.md` (19 hits)

| line | meter word(s) | my verdict | quote (verbatim whole line) |
|---|---|---|---|
| `161` | `cdp` | **needs-ruling** |    (`the-musketeer` profile, CDP `127.0.0.1:9222`) serializes the whole |
| `697` | `devtools` | **surface-note** | \| Only a lab score (Lighthouse, DevTools) \| Use it to guide a fix; give no Core Web Vitals verdict (S036). Running the tool is tabi's work. \| |
| `1014` | `crawl` | **no-tabi-ground** | \| Quoting those numbers as a preview verdict \| Do not: the census says what the retained bytes contain, not what any crawler fetches or renders, and it covers only the four properties, only `.html`, only that commit \| restate the commit and the dated-measurement status beside the number \| S069.txt@685 `we are looking for oEmbed and Twitter Card / Open Graph tags`; S070.txt@3020 `Represents a rich preview card that is generated using OpenGraph tags from a URL` \| |
| `1089` | `crawl` | **no-tabi-ground** | what any particular crawler does. |
| `1100` | `crawl` | **no-tabi-ground** | 3. `blocked`: the publisher's file disallows a URL it wants crawled; `exposed`: it allows a URL it |
| `1121` | `crawl` | **no-tabi-ground** | Use it before publishing a sitemap or sitemap index, or when a crawl report says a sitemap was |
| `1233` | `crawl` | **no-tabi-ground** | \| readme-index-counter \| gate (historical from round 59: green at its round-55 measured revision `64c0ce12ffe3ca4d6d1891a3e3e33933a95380f6` and on the round-58 tree; red from round 59 on by design — its `head_changed` term requires every round-55-base knowledge file to survive as a byte prefix, and the round-59 append-only correction inserts lines inside `corpus/knowledge/crawler-identity.md` where the stale bullet ends (`.ufo/waves/round-59/a2r1/ReviewerNoHarm.md`); the other six terms still read 0 there; offline, committed bytes only; no network) \| `python3 -B .ufo/waves/round-55/c55_readme_index.py --root . --revision <commit>` \| `0=met` (`index_mismatches == 0 AND knowledge_files >= 46`); `1=not met` (any unindexed, multi, thin, duplicate, head_changed, deleted or dangling item, or fewer than 46 knowledge files); `2=could-not-evaluate` (tree or `corpus/README.md` unreadable, no or more than one `## Coverage map` section, no table); usage errors also exit 2 (`ap.error`) \| `python3 -B .ufo/waves/round-55/c55_readme_index.py --selftest` (44 fixtures, generated sandbox repos; receipt `.ufo/waves/round-55/controls/c1-selftest-v2.txt`) \| `contract.json` `claims.C1.predicate`; base control `.ufo/waves/round-55/controls/base-c1-readme-index-v2.txt` (`index_mismatches=21`, exit 1 at `fcaf4b85`); version-1 control kept as history \| none (reads `git show` / `git ls-tree` only; selftest writes only `mktemp -d` sandboxes) \| kake \| |
| `1248` | `crawl` | **no-tabi-ground** | crawl-handling entries. Receipts: `.ufo/waves/round-56/controls/`. `scripts/landed_check.py` is a tool, not a gate: it compares the commit |
| `1254` | `crawl` | **no-tabi-ground** | \| yahoo-crawl-handling-quote-truth-counter \| gate (historical: green at its round-56 measured revision `4cb225fb032b04166fb0232bc98a7bcce72675ec` only; red on later trees by design — mirror pins 158 rows; offline, committed bytes only) \| `python3 -B .ufo/waves/round-56/c56_quote_truth.py --root . --revision <commit>` \| `0=met` (`conditions_passed == 8 of 8`); `1=not met` (any C1-C8 sub-condition fails); `2=could-not-evaluate` (malformed receipt or mirror-pin JSON, an exception); usage errors also exit 2 (`ap.error`) \| `KAKE_R56_SELFTEST_REV=f8438a282d5946b386812d784cc617edcbc9201d python3 -B .ufo/waves/round-56/c56_quote_truth.py --selftest` (86 checks: 83 sandbox-repo fixtures built from the committed round-56 evidence at the pinned revision, plus 3 unit-rule checks) \| `contract.json` `claims.C2`; base control `.ufo/waves/round-56/controls/base-c2-quote-truth.txt` (`0/8`, exit 1); retained bodies `.ufo/waves/round-56/sources/` with `receipts.json`; held-row body pin `HELD_BODY_SHA256` (S367); pre-append mirror pin `.ufo/waves/round-56/assimilation/mirror-pin.json` \| none (reads `git show` / `git log` only; selftest writes only `mktemp -d` sandboxes) \| kake \| |
| `1295` | `crawl` | **no-tabi-ground** | \| baidu-crawler-identification-quote-truth-counter \| gate (historical from round 59: green at its round-58 measured revision `8d340c15200959190ba3e894399cdc931976331f`; red on later trees by design — C7 pins the round-58 validate scratch and C8 the 160-row mirror, and round 59 grows the registry to 164; offline, committed bytes only) \| `python3 -B .ufo/waves/round-58/c58_quote_truth.py --root . --revision <commit>` \| `0=met` (`conditions_passed == 8 of 8`); `1=not met`; `2=could-not-evaluate`; `64=usage` \| `KAKE_R58_SELFTEST_REV=fff3eea6aa349c8635fd84a791cc32de350ee1c2 python3 -B .ufo/waves/round-58/c58_quote_truth.py --selftest` (120 checks; `controls/c3-selftest-v2.txt`) \| bodies pinned by sha256 (S423 `8b8aef60…`, S424 `3ef1275b…`); mirror pins the 160-row base registry (historical once a later round appends a row) \| none \| kake \| |
| `1309` | `crawl` | **no-tabi-ground** | \| crawler-identity-quote-truth-counter \| gate (historical from round 60: green at its round-59 measured revision `b322ccabe1628fc0cfe80c2dddca03ed154d1349`; red from round 60 on by design — C8 requires the registry minus S425/S426 to equal the 162-row pre-append mirror, and round 60 appends S427-S429 (`.ufo/waves/round-60/w1/CriticD1Collision.md`); C5 and C7 also fail at round 60 on the same correction, not only the mirror: the S426 entry's `[r60-correction]` block quotes S428's wording, which the round-59 C5 tests against S426's own retained body, and the round-59 C7 scratch-entry receipt predates the append — disclosed complete after w2/ConnW2Cross and w2/ReviewerC1Relabels F1; offline, committed bytes only; quote truth plus the append-only stale-claim correction) \| `python3 -B .ufo/waves/round-59/c59_quote_truth.py --root . --revision <commit> [--base <rev>] [--json]` \| `0=met` (`conditions_passed == 9 of 9`: C1-C8 as round 58 on S425/S426, C9 the append-only `[r59-correction 2026-10-27]` tail on `corpus/knowledge/crawler-identity.md`); `1=not met`; `2=could-not-evaluate` (`--root` not a toplevel, revision or base unresolved, unreadable retained body or receipt); `64=usage` \| `KAKE_R59_SELFTEST_ROOT=<lane> TMPDIR=<scratch> python3 -B .ufo/waves/round-59/c59_quote_truth.py --selftest` (121 checks; `controls/c3-selftest-v2.txt`) \| bodies pinned by sha256 (S425 `ff2b9fd7…` 74477 B, S426 `8df9d4ad…` 69789 B, `.ufo/waves/round-59/sources/receipts.json`); mirror pin `.ufo/waves/round-59/assimilation/mirror-pin.json` = 162 rows at `fd6303ce`; base control `controls/base-c3-quote-truth-v2.txt` (`0/9`, exit 1); contract `counterSha256v2 808c72c3…`; mirror pins the 162-row base registry (historical once a later round appends a row) \| none \| kake \| |
| `1325` | `crawl` | **no-tabi-ground** | `crawler-identity-quote-truth-counter`, reddened by rows S427–S429, and `ops-debt-counter`, reddened by the honest relabel of the |
| `1333` | `crawl` | **no-tabi-ground** |   `yahoo-robots-quote-truth-counter` (55), `yahoo-crawl-handling-quote-truth-counter` (56), `receipt-pin-counter` (57), |
| `1334` | `crawl` | **no-tabi-ground** |   `baidu-dead-link-quote-truth-counter` (57), `baidu-crawler-identification-quote-truth` (58), `ops-debt-counter` (54, from round 60), |
| `1335` | `crawl` | **no-tabi-ground** |   `crawler-identity-quote-truth-counter` (59, from round 60). |
| `1346` | `crawl` | **no-tabi-ground** | \| crawl-budget-quote-truth-counter \| gate (live; freshness: round-49 S273/S274 row-entry-quote-receipt truth over committed bytes only — R4 is `git show <rev>:.ufo/waves/round-49/sources/<textPath>`; green at round-60 base `97cdc122`) \| `python3 -B .ufo/waves/round-49/c49_quote_truth.py --root . --revision <commit> [--json <path>]` \| `0=met` (`passed >= 2 of 2 declared ids`); `1=not met`; `2=could-not-evaluate` (exception while reading the tree); `64=usage` \| none (no selftest mode) \| measured `1c846ed2d67b1692ea966be064f0fc04542763c6` exit 0; green again at `97cdc122` (exit 0, `passed 2/2`); counter blob `0808c865234a4a2bc95905622871807c5c77ee1d` identical `99fa9d3f..b3ae50ef`; retained texts sha256-pinned by `.ufo/waves/round-49/sources/receipts.json`; receipts `.ufo/waves/round-49/verification/c2-before-090ce8f1.json` `c2-after-1c846ed2.json` \| none \| kake \| |
| `1350` | `crawl` | **no-tabi-ground** | \| canonical-crawler-identity-quote-truth-counter \| gate (live; offline, committed bytes only, `git show`, `git log` and `git ls-tree` only) \| `python3 -B .ufo/waves/round-51/c51_quote_truth.py --root . --revision <commit>` \| `0=met` (`conditions_passed == 8 of 8`); `1=not met` (any C1-C8 sub-condition fails; an uncaught exception also exits 1 with a traceback); `2=usage` (argparse error; the docstring's `2=could-not-evaluate` and `64=usage` labels do not match the code — nothing in it returns 2 or 64) \| none (no selftest mode) \| `contract.json` round-51 `claims.C2`; adopted ids S262 and S263 with retained bodies and `sources/receipts.json` under `.ufo/waves/round-51/`; pre-append mirror at `assimilation/pre-append/corpus/SOURCES.md`; measured green at `842c1b44a590104cff4c06ef84726cac19475d0a` \| none (reads git) \| kake \| |
| `1357` | `crawl` | **no-tabi-ground** | \| guard-cases-counter \| gate (the tool as committed at the measured revision against gate-built fixture repositories, one `git init` per case under `--work`, file names, ids and line contents drawn from `--seed` so a fixture-keyed tool cannot recognise them; the tool is extracted with `git show <rev>:scripts/append_guard.py` and a missing tool fails every case; per-case timeout, a hang fails) \| `python3 -B .ufo/waves/round-60/c60_guard_cases.py --root . --revision <rev> [--work <scratch>] [--seed N]` \| `0=met` (`cases_passed == 24 of 24`: K1–K22 — tagged and untagged mid-file runs, a tag on the second line, a tag inside an HTML comment and inside a backtick span, a byte change, a deletion, a rename, a symlink, CRLF, two base lines swapped, a trailing space, an untagged duplicate, a clean alignment with a tag, an out-of-scope rewrite, a subdirectory rewrite, a new file, binary bytes at EOF, `--base` not an ancestor, `--base` missing — plus R1 the real lane over `--base fd6303ce` holding the round-59 tagged in-file correction and R2 one byte of a base line of `corpus/knowledge/crawler-identity.md` changed in a scratch clone); `1=not met`; `2=could-not-evaluate` (`--root` not a repository toplevel, revision unresolved, work directory unusable); `64=usage` \| `TMPDIR=<scratch> python3 -B .ufo/waves/round-60/c60_guard_cases.py --selftest` (`6` scored controls; `controls/c2-selftest.txt`) \| controls scored before data: no tool (`0/24`), always-exit-0, always-exit-1, the c55 byte-prefix port (must fail K2, K15, R1), a reference implementation (`24/24`); base control `controls/base-c2-guard-cases.txt` (`0/24`, exit 1); case table frozen in `.ufo/waves/round-60/contract.md` § Claim C2; contract `.ufo/waves/round-60/contract.json` \| none \| kake \| |
| `1358` | `crawl` | **no-tabi-ground** | \| user-triggered-quote-truth-counter \| gate (offline, committed bytes only; no network; quote truth on rows S427–S429 and the two entries opened this round, plus the append-only `[r60-correction 2026-10-27]` correction of `corpus/knowledge/googlebot-verification.md`; round-60 version 1, derived from the round-59 quote-truth counter at version 2 by `derive_c60_quote_truth.py`) \| `python3 -B .ufo/waves/round-60/c60_quote_truth.py --root . --revision <rev> [--json]` \| `0=met` (`conditions_passed == 9 of 9`: C1 both entries exist and the staged `corpus/knowledge/google-robots-txt-limits.md` does not, C2 the provenance trio and the row id cited again below the header, C3 rows S427–S429 well formed with S427 opening `supersedes S425 —` and its scope carrying `common crawlers` and `special-case crawlers` but not `their robots.txt posture`, C4 the used-by sets, C5 quote truth including `Last updated <date> UTC` read inside `<devsite-content-footer`, C6 receipts, C7 the `controls/validate-append.txt` census, C8 the 164-row mirror pin, C9 the correction after the base line holding `these fetchers ignore robots.txt rules.`); `1=not met`; `2=could-not-evaluate` (`--root` not a repository toplevel, revision unresolved, unreadable retained body or receipt); `64=usage` \| `KAKE_R60_SELFTEST_ROOT=<lane> TMPDIR=<scratch> python3 -B .ufo/waves/round-60/c60_quote_truth.py --selftest` (`140` checks; `controls/c3-selftest.txt`) \| bodies pinned by sha256 (S427 `d70ce6f5…` 74477 B, S428 `0f296b86…` 76197 B, S429 `423d99c5…` 178797 B, `.ufo/waves/round-60/sources/receipts.json`, fetched 2026-10-27T04:03Z); mirror pin `.ufo/waves/round-60/assimilation/mirror-pin.json` = 164 rows at `97cdc122` (sha256 `bc054d10…`, 152817 B); base control `controls/base-c3-quote-truth.txt` (`0/9`, exit 1); contract `.ufo/waves/round-60/contract.json`; the mirror pins the 164-row base registry (stale once a later round appends a row) \| none \| kake \| |

### `kama-shokunin` — `corpus/knowledge/listener-census.md` (5 hits)

| line | meter word(s) | my verdict | quote (verbatim whole line) |
|---|---|---|---|
| `56` | `remote-debugging` | **needs-ruling** | \| 8 \| `127.0.0.1:9222` \| session \| `chrome` pid **3080080**, `--remote-debugging-address=127.0.0.1 --remote-debugging-port=9222` \| `200` `text/html; charset=UTF-8` (**empty body**) \| *(none)* \| `404` text/html \| `FOREIGN_SERVICE` \| 2xx `text/html` (**verbatim rule**) \| C1,C12 \| |
| `241` | `devtools` | **needs-ruling** | # C12 — chrome devtools |
| `242` | `devtools` | **needs-ruling** | curl -sS http://127.0.0.1:9222/json/version                   # Browser Chrome/152.0.7977.64; ws://127.0.0.1:9222/devtools/browser/… |
| `243` | `remote-debugging` | **needs-ruling** | tr '\0' '\n' < /proc/3080080/cmdline \| grep remote-debugging  # --remote-debugging-port=9222 --remote-allow-origins=… |
| `355` | `devtools` | **needs-ruling** | 2. `127.0.0.1:9222` — Chrome DevTools protocol, 21 live targets including `https://chatgpt.com/`, |

## PART B — the 184 card-list-only lines (hits under the seat's BG word list, NOT under the meter's)

These lines are **outside** the meter's frozen screen. They cannot become ledger `line` rows
(the meter would emit `delta-line-invented` for them). They are adjudicated here because they
are the substance the meter cannot see; the summary counts and the non-incidental rows follow.

| lane | file | card-list hits | of which meter-list hits | no-tabi-ground | overlap-declared | contested-open |
|---|---|---|---|---|---|---|
| `kagi-shokunin` | `PROVINCE.md` | 2 | 0 | 2 | 0 | 0 |
| `kake-shokunin` | `PROVINCE.md` | 19 | 0 | 15 | 0 | 0 |
| `kake-shokunin` | `SKILL.md` | 85 | 0 | 74 | 0 | 0 |
| `kama-shokunin` | `PROVINCE.md` | 3 | 0 | 3 | 0 | 0 |
| `kama-shokunin` | `corpus/knowledge/listener-census.md` | 75 | 0 | 73 | 0 | 0 |

### B.1 — the 17 card-list-only rows that are NOT `no-tabi-ground`

| lane | file:line | card word(s) | my verdict | quote (verbatim whole line) |
|---|---|---|---|---|
| `kake-shokunin` | `PROVINCE.md:45` | `chrome` | **needs-ruling** |   The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake) |
| `kake-shokunin` | `PROVINCE.md:67` | `browser` | **surface-note** | JS-rendered-canonical frontier above remains open; browser execution stays tabi's |
| `kake-shokunin` | `PROVINCE.md:85` | `browser` | **surface-note** | No actual website accessibility is evaluated. Browser/assistive-technology |
| `kake-shokunin` | `PROVINCE.md:368` | `browser` | **surface-note** | stays open and stays tabi's adjacent province for anything that executes a browser. Held entries |
| `kake-shokunin` | `SKILL.md:139` | `browser` | **surface-note** |     by title+marker+vintage, never bytes; `kimi-map` (E5) is browser-gated |
| `kake-shokunin` | `SKILL.md:159` | `browser` | **needs-ruling** | 5. **Lease before browser.** `webzites lease acquire --owner <name> |
| `kake-shokunin` | `SKILL.md:160` | `chrome` | **needs-ruling** |    --ttl-ms 900000`; release in `finally`. The shared burner chrome |
| `kake-shokunin` | `SKILL.md:261` | `browser` | **surface-note** | - **Vault PROPERTIES[] needs no browser.** The rendered link surface is a |
| `kake-shokunin` | `SKILL.md:294` | `browser` | **surface-note** | - **Session/browser traps.** Dead sessions can pass avatar checks (`browser |
| `kake-shokunin` | `SKILL.md:297` | `browser` | **surface-note** |   open/close — re-derive targets from `/json/list` URLs. `agent-browser open |
| `kake-shokunin` | `SKILL.md:301` | `browser` | **surface-note** |   a crash is tolerated — `browser ensure` rebinds. |
| `kake-shokunin` | `SKILL.md:407` | `browser` | **surface-note** | \| Unsupported HTML, invalid manifest or unreadable input \| Could not evaluate; use a proper HTML5/browser audit rather than calling it clean \| |
| `kake-shokunin` | `SKILL.md:408` | `browser`, `http` | **surface-note** | \| Need Google-selected canonical, HTTP headers, redirects, content duplication or JS state \| This tool cannot establish it; route browser work to tabi, publishing/account actions to the operator \| |
| `kake-shokunin` | `SKILL.md:551` | `browser` | **surface-note** | evaluation; browser execution remains adjacent ownership and publication |
| `kake-shokunin` | `SKILL.md:560` | `browser` | **surface-note** | authorized browser/AT evaluation, kagi owns any credential custody, and |
| `kama-shokunin` | `corpus/knowledge/listener-census.md:102` | `chrome`, `http` | **needs-ruling** | \| **Platform/system** \| `631` (`+ [::1]:631`), `127.0.0.53:53`, `127.0.0.54:53`, `9222` \| `FOREIGN_SERVICE` ×4, `NOT_HTTP` ×2 \| cupsd pid 1207, systemd-resolve pid 816, chrome pid 3080080 \| |
| `kama-shokunin` | `corpus/knowledge/listener-census.md:356` | `browser` | **needs-ruling** |    `gemini.google.com` (`the-musketeer` profile). Any local process can drive a logged-in browser. |

### B.2 — the 167 card-list-only rows that ARE `no-tabi-ground`, grouped by reason

All 167 are incidental mentions of the *word* without a browser surface in the lane's own
ground. They fall into four mechanical families; I give the families with their line lists so
the classification is auditable without quoting 167 long lines.

(No card-list-only row is matched by the word `crawl` — the card list has no `crawl` term, so
every publisher-side crawl/sitemap/crawl-budget line is a *meter-list* hit and already sits in
PART A. That is why the card-only set is dominated by URLs and HTTP-protocol artefacts.)

**F1 — a bare URL, hostname or `http(s)://` scheme in a publishing or registry table (the card word `http` matches the scheme; no browser is invoked)** — 83 lines

- `kake-shokunin` `PROVINCE.md`: `218`, `219`, `256`
- `kake-shokunin` `SKILL.md`: `16`, `17`, `18`, `19`, `21`, `22`, `23`, `26`, `27`, `28`, `423`, `426`, `427`, `428`, `435`, `437`, `438`, `439`, `441`, `443`, `444`, `445`, `447`, `448`, `454`, `455`, `456`, `457`, `460`, `463`, `465`, `467`, `469`, `470`, `471`, `472`, `473`, `474`, `475`, `496`, `704`, `706`, `715`, `716`, `720`, `1013`
- `kama-shokunin` `PROVINCE.md`: `11`
- `kama-shokunin` `corpus/knowledge/listener-census.md`: `76`, `109`, `110`, `112`, `113`, `114`, `115`, `116`, `117`, `121`, `123`, `190`, `191`, `192`, `193`, `196`, `199`, `202`, `207`, `209`, `212`, `225`, `226`, `238`, `248`, `258`, `259`, `270`, `271`, `277`, `279`, `280`, `307`

**F2 — an HTTP-protocol / probe artefact of a local endpoint census (the card word `http` matches `HTTP 200 OK`, `HTTP 404`, `HTTP Range`, `http_code`, `content_type`, `http.server`, `GET /`; the transport is loopback HTTP to a local service, not a browser)** — 68 lines

- `kagi-shokunin` `PROVINCE.md`: `42`
- `kake-shokunin` `PROVINCE.md`: `198`, `202`, `233`, `236`, `237`, `366`, `422`, `439`, `440`
- `kake-shokunin` `SKILL.md`: `156`, `483`, `497`, `654`, `696`, `742`, `746`, `753`, `821`, `822`, `1004`, `1009`, `1011`, `1067`, `1134`, `1359`
- `kama-shokunin` `PROVINCE.md`: `254`, `256`
- `kama-shokunin` `corpus/knowledge/listener-census.md`: `5`, `50`, `51`, `52`, `53`, `54`, `55`, `59`, `60`, `61`, `62`, `63`, `64`, `65`, `66`, `67`, `68`, `69`, `70`, `71`, `99`, `101`, `103`, `175`, `197`, `201`, `203`, `247`, `254`, `255`, `275`, `278`, `292`, `309`, `351`, `358`, `364`, `368`, `369`, `391`

**F3 — the literal token `burnerchrome` (a kimi.page property name) matching the card word `chrome`; the token is a brand/property, not the browser** — 13 lines

- `kake-shokunin` `PROVINCE.md`: `73`, `78`, `475`
- `kake-shokunin` `SKILL.md`: `20`, `44`, `367`, `424`, `431`, `432`, `433`, `519`, `520`, `521`

**F4 — a platform document quote that mentions "the browser" as a generic HTTP client (a Render/S050 vendor sentence, not a browser surface)** — 3 lines

- `kagi-shokunin` `PROVINCE.md`: `104`
- `kake-shokunin` `SKILL.md`: `113`, `745`


## 4. Findings — what my adjudication says that a reader should route

### 4.1 The three `contested-open` clusters (8 meter-list lines, 5 card-only lines)

**(a) the the-musketeer Chrome profile / CDP 9222 lease — kagi + kake.**
kagi `PROVINCE.md:64` ("**contested with kake**") and kagi `PROVINCE.md:81` ("the CDP
lease/profile ownership question is reported to the integrator, never adjudicated here") and
kake `SKILL.md:161` ("(`the-musketeer` profile, CDP `127.0.0.1:9222`) serializes the whole
kimi fleet — one op at a time, machine-wide"). All three are `contested-open`. The ruling
question is on record at `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` line 62
(`tabi | round-17 | Contested scope, no ruling on record: the the-musketeer Chrome profile /
CDP 127.0.0.1:9222 lease named by kagi … and kake … Request: rule the lease owner between
kagi and kake, or declare the split`). tabi holds **no** lease half — the r58 runner uses
`--remote-debugging-port=0` with a throwaway `--user-data-dir`
(`scripts/chrome-cdp-loopback-round58.mjs:1049,1051`) and never attaches to 9222.

**(b) the CDP live-target census — kama.** `listener-census.md:56` (a `chrome` pid with
`--remote-debugging-port=9222`), `:241` ("# C12 — chrome devtools"), `:242` (`curl
http://127.0.0.1:9222/json/version` → "Browser Chrome/152.0.7977.64; ws://127.0.0.1:9222/
devtools/browser/…"), `:243` (the `/proc/3080080/cmdline` remote-debugging flags), `:355`
("`127.0.0.1:9222` — Chrome DevTools protocol, 21 live targets including
`https://chatgpt.com/`"), plus card-only `:102` (the 9222 chrome pid in the platform table)
and `:356` ("`gemini.google.com` (`the-musketeer` profile). Any local process can drive a
logged-in browser."). The ruling question is `.ufo/l0-questions.md` line 65: *"say whether the
ruling covers revenger and kama on these surfaces or rule a split; tabi records both as
contested-open in corpus/adjacency.tsv and absorbs neither."*

**(c) kake's own lease statement — kake `PROVINCE.md:45` and `SKILL.md:159-160`.** This is
the finding I want the L1 to see, and it is a **coverage asymmetry, not a disagreement**:

> kake's province states the contested lease **without** using any list-M word
> ("The the-musketeer **Chrome** profile lease is contested scope (kagi/tabi/kake)"), while
> kagi's province states the same lease **with** the list-M word `cdp`. The meter's frozen
> screen therefore adjudicates the lease from kagi's side and from kake's `SKILL.md:161`, but
> **not** from kake's `PROVINCE.md:45` — the line where kake itself calls it contested.
> kake `SKILL.md:159` ("**Lease before browser.** `webzites lease acquire --owner <name>") and
> `:160` ("The shared burner chrome") are likewise outside the frozen screen.

This is **not** a defect in the meter (the meter re-derives its own hits and the ledger
matches them; the claim's predicate promises nothing about non-hit lines) and **not** mine to
fix (the meter is `R59Meter`'s file; the ledger is `R59Rebind`'s). It is a **contested-scope
note**: the D8 "new screened surface" is real for all three lanes, but *which* of a lane's
browser-ground statements count as browser ground is decided by a word list frozen before
these three lanes were ever screened — and on this list a lane's own explicit "contested"
statement can fall outside the screen while its sibling's equivalent statement falls inside.
Route to `R59Meter` (the word list's consequence) and `TabiR59` (the D8 wording).

### 4.2 The `overlap-declared` cluster (5 meter-list lines, 12 card-only lines)

kake's province and skill file **declare** the split themselves, in the sibling's own voice:

- `PROVINCE.md:40` — "`tabi` drives browsers and owns client-side crawler discipline; kake owns" (list-M `crawl`).
- `PROVINCE.md:310` — "browser-driving and client-side crawler discipline belong to tabi".
- `PROVINCE.md:329`, `:344` — the client-side-crawler half stays with tabi.
- `SKILL.md:697` — "| Only a lab score (Lighthouse, DevTools) | … Running the tool is tabi's work. |" (list-M `devtools`).
- Card-only (list C): `PROVINCE.md:67` ("browser execution stays tabi's"), `:85` ("Browser/assistive-technology execution … is tabi's"), `:368` ("stays open and stays tabi's adjacent province for anything that executes a browser"); `SKILL.md:139` ("`kimi-map` (E5) is browser-gated"), `:261` ("Vault PROPERTIES[] needs no browser"), `:294`/`:297`/`:301` (session/browser traps: `browser status`, `/json/list` target re-derivation, `browser ensure` rebinds), `:407`/`:408` ("use a proper HTML5/browser audit"; "route browser work to tabi"), `:551`, `:560`.

Every one of these is a **declared** adjacency, not an open question: the sibling says out loud
that the browser surface is tabi's. That is the `overlap-declared` disposition's exact sense.

### 4.3 The `no-tabi-ground` mass (59 meter-list lines, 167 card-list lines)

Two structurally different populations:

- **The 41 kake `PROVINCE.md` crawl lines + 17 kake `SKILL.md` crawl lines (list M).** These
  are publisher-side crawl/sitemap/crawl-budget/crawler-identity semantics — robots.txt
  placement, Baidu/Yahoo/Google crawler identity, per-engine crawl hygiene, crawl-budget
  consequences. They match list M's `crawl` term. They are **incidental** for the meter: the
  browser is not invoked, the crawler is a *remote server* crawling a published site, and the
  lane explicitly keeps the client-side half with tabi. Their disposition is `no-tabi-ground`.
- **The 167 card-list-only lines.** Grouped by reason in Part B.2 (F1 83 bare URLs/hosts,
  F2 68 HTTP-protocol/probe artefacts, F3 13 `burnerchrome` brand tokens, F4 3 generic
  "browser" in a vendor sentence). All incidental.

Note the two populations look similar but mean different things, and the meter cannot tell
them apart: list M's `crawl` term surfaces **43 kake lines whose own domain is crawl
hygiene** — i.e. the meter is deliberately over-triggering on kake — while missing **kake's
own lease statement** entirely. Both facts follow from one frozen 13-word list, and they are
why the D8 claim should be worded as "the three lanes are now screened", not "every
browser-ground statement in the three lanes is now adjudicated".

## 5. Cross-check against R59Rebind's draft (read AFTER my adjudication)

`.ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv` — 73 lines (1 header + 72 data).

### 5.1 Hit set — identical

| | my independent result | R59Rebind's draft | agree? |
|---|---|---|---|
| kagi `PROVINCE.md` | 3 hits | 3 | **yes** |
| kake `PROVINCE.md` | 45 hits | 45 | **yes** |
| kake `SKILL.md` | 19 hits | 19 | **yes** |
| kama `corpus/knowledge/listener-census.md` | 5 hits | 5 | **yes** |
| **total** | **72** | **72** | **yes** |

### 5.2 Dispositions — identical after I corrected two of my own verdicts

| disposition | mine, first pass | mine, corrected | draft |
|---|---|---|---|
| `no-tabi-ground` | 61 | **59** | 59 |
| `overlap-declared` | 3 | **5** | 5 |
| `contested-open` | 8 | **8** | 8 |
| total | 72 | **72** | **72** |

**Self-correction, disclosed.** My first pass classified kake `PROVINCE.md:329`
("… Client-side crawler discipline stays with tabi; kake keeps") and `:344` ("Boundary
unchanged: publisher-side placement is kake's; client-side crawling stays with tabi.") as
`no-tabi-ground`. That was **wrong**: both lines explicitly assign the client-side crawler
ground to tabi, which is the definition of `overlap-declared`. I caught it on the cross-check
by re-reading every meter-list row whose quote mentions "tabi" — a mechanical check I should
have run before writing Part A. After correcting both, my table and the draft agree on **all
72 dispositions, line for line**.

The 5 `overlap-declared` rows are the same 5 in both: kake `PROVINCE.md:40, 310, 329, 344`
and `SKILL.md:697`. The 8 `contested-open` rows are the same 8 in both: kagi
`PROVINCE.md:64` and `:81`; kake `SKILL.md:161`; kama `listener-census.md:56, 241, 242, 243,
355`.

### 5.3 Ruling references — every one resolves, every quote is verbatim

| rows | ruling_ref | my check |
|---|---|---|
| kagi `PROVINCE.md:64`, `:81`; kake `SKILL.md:161` | `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62` | `git cat-file -t ebeb396f…` → `commit`; line 62 at that commit carries the musketeer-lease question; the `ruling_quote` is a verbatim substring |
| kama `listener-census.md:56,241,242,243,355` | `fleet@b6b3b5e42044b7cd7307d1d923ee054bf98eeb43:.ufo/l0-questions.md:65` | `git cat-file -t b6b3b5e4…` → `commit`; line 65 at that commit carries the CDP-scope question; the `ruling_quote` is a verbatim substring |
| kake `PROVINCE.md:40,329,344` | `corpus/adjacency.tsv: crawler-discipline-vs-publishing` | the `ruling_quote` ("browsers against real sites with evidence discipline.") is a verbatim substring of that map row's `ruling_quote` column |
| kake `PROVINCE.md:310` | `corpus/adjacency.tsv: robots-txt-publisher-audit-vs-client-obedience` | the `ruling_quote` is a verbatim substring of that map row |
| kake `SKILL.md:697` | `corpus/adjacency.tsv: lab-performance-tool-runs` | the `ruling_quote` is a verbatim substring of that map row |

All 13 non-`no-tabi-ground` rows carry a **real, resolvable** ruling reference and a quote
that is verbatim at the cited place. **No contested adjudication. No invented ground.**

### 5.4 The one real difference is coverage, not classification

The draft has **no rows** for kake `PROVINCE.md:45`, `SKILL.md:159`, `SKILL.md:160` — the
three lines list M does not hit (§4.1c). My adjudication reaches them and calls them
`needs-ruling`; they **cannot** be ledger rows, so I record them as a contested-scope note
instead. That is the only divergence between the two tables.

## 6. Verdicts, stated

1. **The hit set is independently confirmed.** My own scan and R59Rebind's draft agree on
   all 72 meter-list hit lines, per lane and per file.
2. **The dispositions are independently confirmed.** All 72 rows carry the same disposition in
   both adjudications (59 `no-tabi-ground`, 5 `overlap-declared`, 8 `contested-open`) — after
   I corrected my own two wrong verdicts on kake `PROVINCE.md:329` and `:344` (§5.2). The
   correction is disclosed here rather than smoothed over.
3. **All 13 non-`no-tabi-ground` rows carry a real ruling reference** at a real commit/line,
   with a verbatim quote. Nothing is invented.
4. **One coverage asymmetry to route** (§4.1c): the meter's frozen 13-word list contains
   `cdp` but not `chrome`/`browser`, so kake's *own* province statement of the contested
   the-musketeer lease (`PROVINCE.md:45`) falls outside the screen while kagi's equivalent
   statement falls inside it. Not a meter defect, not mine to fix — a contested-scope note for
   `R59Meter` and `TabiR59`.
5. **A second-order effect for `R59Meter`** (evidence in `overlap-scan.md` §2.3): R59Rebind's
   rebind writes **one `lane` row per (lane, relPath)** — 25 lane rows over 20 lanes — while
   v18's `verify()` keys `line` rows by **lane alone**, so the `delta-line-invented` check
   cross-fires across a lane's files. Against the exact rebind output shape I measured **118**
   findings under v18's keying (37 `delta-line-missing` + **81** `delta-line-invented`) versus
   **37** (all `delta-line-missing`, zero invented) once the rows are keyed by
   (lane, relPath). The claim's change (e) already declares "lineRows keyed by (lane,
   relPath)", so the v19 meter is *declared* to do this — but the v19 selftest must **pin** it
   with a case that feeds two relPaths for one lane and asserts the line-row checks do not
   cross-fire. Route to `R59Meter` (and to `R59Rebind` as a "your ledger shape is fine" note).
6. **37 kaidoku hits remain unadjudicated** (`uncoveredRows: 37` in
   `adj/screen-set-r59-inventory.json`; the two `corpus/knowledge/2026-10-14-r10-0*-queue-ops.md`
   files). Outside the three named lanes but inside (d)'s "every roster sibling" requirement —
   the meter cannot be green until they carry dispositions. Route to `R59Rebind`.

## 7. Commands run for this adjudication (all read-only)

| Command | Outcome |
|---|---|
| `git -C {kagi,kake,kama}-shokunin rev-parse HEAD` | `91f7752b…`, `1240288f…`, `6035e952…` |
| `sha256sum {kagi,kake,kama}-shokunin/PROVINCE.md` | `0bbf19b3…`, `0513521f…`, `f0aaae9c…` |
| `git -C <lane> cat-file -p <head>:PROVINCE.md` (and `SKILL.md`, `corpus/knowledge/listener-census.md`) | bytes read at head, worktree never read |
| my `bgscan.mjs` (scratch) | per-line card/meter word matches for the 5 files → 256 union lines |
| my `adj_table.mjs` (scratch) | semantic verdicts → `adjudication-table.json` (256 rows) |
| my `screen.mjs` / `pairs.mjs` (scratch) | all 20 siblings × 25 (lane,path) screens → 140 meter-list hits fleet-wide |
| my `probe2/3/4.mjs` (scratch) | the v18-keying vs (lane,relPath)-keying measurement (§5.5) |
| `git cat-file -t ebeb396f… / b6b3b5e4…` | both `commit`; cited lines carry the quoted ruling text |
| `grep -c` of the three `overlap-declared` ruling quotes in `tabi-shokunin/corpus/adjacency.tsv` | all ≥1 — quotes verbatim |

Scratch tree `/fast/scratch/hyaku/tabi-r59/R59Connector/` deleted before this report was
written; nothing above cites a scratch path as evidence.
