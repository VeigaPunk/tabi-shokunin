# kake-shokunin — Province

**Domain:** web properties & publishing — scopes ds4cc.com, kimi.page/pro mirrors, Pages deploys

**Owns:** the domain knowledge, playbooks, error patterns, and checklists above.
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.

<!-- Sections below appended round 20 (2026-10-19); the four lines above are unchanged. -->

## Core

- Source-grounded audits, drift checks and source-fix guidance for the lane's
  web properties: GitHub Pages fronts, kimi.page/pro mirrors, sitemaps.
- Publishing-platform semantics the audits depend on: what a Pages deploy
  serves, where the custom domain lives, what an ETag can prove
  (`corpus/knowledge/ghp-*.md`, sources in `corpus/SOURCES.md`).
- The lane's own gates: `scripts/freshness-sweep.mjs`, `scripts/probe-delta.mjs`.
  Publishing itself stays operator-gated: kake prepares, verifies and hands off.

## Frontier

- Crawl hygiene per host (robots.txt, sitemap scope, canonical signals) — first
  entry `corpus/knowledge/crawl-scope-per-host.md`; canonical/JS rendering open.
- Field performance (Core Web Vitals, CrUX eligibility) — first entry
  `corpus/knowledge/field-performance-cwv.md` (round 28; knowledge only, no
  gate, no property measured); Jekyll/base-path build tooling — first entry
  `corpus/knowledge/pages-base-path.md` plus offline gate
  `scripts/base_path_audit.py` (round 29; no live property repaired);
  accessibility conformance (WCAG 2.2) and Render deploy semantics remain
  open. Ground moves to Core only with source-backed entries and a gate.

## Adjacent

- `tabi` drives browsers and owns client-side crawler discipline; kake owns
  publisher-side placement (robots/sitemap at the host it serves).
- `chousa` owns research method and source hierarchy; kake keeps only
  domain findings and its own `corpus/SOURCES.md` rows.
- `kagi` owns secrets and credential custody; kake records no secret values.
  The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)
  and stays with the integrator.
- `kama` owns local model-serving endpoints; kake owns remote web properties.

## Surfaces (checked 2026-10-19 with `test -e`)

- Present: `SKILL.md`, `corpus/knowledge/`, `corpus/lessons/`,
  `scripts/freshness-sweep.mjs`, `scripts/probe-delta.mjs`.
- Absent since the 2026-10-12 `~/Projects` prune (r18 W7 annotations): the
  webzites tooling checkout, the ds4cc-marketplace source, the plazir-15-site
  source, the lucario checkout and the origin-work tree. Restore-or-retire is
  operator-owned; the corpus keeps their cites as historical records.
- Live web properties (ds4cc.com, veigapunk.github.io project sites,
  *.kimi.page/pro) were not probed in round 20 (documentation-only round).

## Round-22 publisher-side addition

`corpus/knowledge/static-canonical-preflight.md` covers the previously open
static canonical-signal ground: preferred relation semantics, explicit local
publisher policy and offline parser limits. The lane's local validator and
frozen fixtures are its operability artifact, not a claim that a live website
was repaired or a Google-selected canonical observed. The broader crawl and
JS-rendered-canonical frontier above remains open; browser execution stays tabi's
adjacent province and publication/account operations stay operator-owned.


## Round-23 live use

The publisher-side canonical tool now consumes saved GET-response HTML from owned public properties through `scripts/live_snapshot.py`; live capture is GET-only and separate from offline validation. This is not rendered-DOM observation, navigation/readiness approval or permission to publish. `corpus/lessons/round-23.md` records the outcomes; source repair and deployment stay operator-owned. A surviving burnerchrome source candidate at `~/Projects/burnerchrome` was found and read only; its mapped historical ds4cc-marketplace path remains absent.


## Round-24 restored source correction

The earlier Surfaces paragraph and round-23 burnerchrome note are historical local-state observations. On 2026-10-21 the ds4cc-marketplace checkout and its CNAME, burnerchrome, speedrun and apps-sdk subtrees are present again (checkout birth 05:19 -03; observed HEAD 1fbdb8ed). No restoration was performed by kake. Evidence: `.ufo/waves/round-24/c1-receipts/T16.json` through `T19.json` and `w1/R23ReceiptsDs4ccStale.md`. Presence enables later source rechecks; it does not establish live deployment or grant publication, browser-profile, DNS or account authority. The webzites, Plazir and Lucario observations remain separately dated.

## Round-25 accessibility preparation boundary

The WCAG frontier now has publisher-side review preparation: sourced criterion
cards and an offline inventory gate (`corpus/knowledge/accessibility-review-packet.md`,
S035). This moves preparation only into held ground, not WCAG conformance.
No actual website accessibility is evaluated. Browser/assistive-technology
execution stays separately authorized adjacent work; publishing stays with
the operator. The remaining field-performance, Jekyll and Render frontier
is unchanged. Round24's policy-stop disposition remains separate open debt.

## Round-29 base-path frontier step

The round-25 sentence above ("The remaining field-performance, Jekyll and
Render frontier is unchanged") is historical for its date. Round 28 added
field-performance knowledge, and round 29 added project-site base-path
knowledge (`corpus/knowledge/pages-base-path.md`, S040–S043) with an offline
gate (`scripts/base_path_audit.py`). The gate reads local files only; no live
property was fetched, measured or repaired, and publishing stays with the
operator. Render deploy semantics and accessibility conformance stay open.

## Round-30 Render static-site frontier step

The round-29 sentence above ("Render deploy semantics and accessibility
conformance stay open") is historical for its date. Round 30 added Render
static-site platform knowledge (`corpus/knowledge/render-static-sites.md`,
S049–S052): build and deploy on push, redirect and rewrite rule order,
dashboard response headers, custom domains and TLS. It is knowledge only, with
no gate, and no owned property recorded in local checkouts or the corpus is a
Render static site; Render web service deploys (the Docker service recorded
for `app.ds4cc.com`) and the Blueprint file stay open.
Accessibility conformance stays open. The lane's own citing-set gate
(`scripts/citing_set.py`) gained committed reason-code fixtures, repairs for the round-27 input
families that round 28 routed (duplicate keys, non-finite numbers, short ids,
repeated options) and for two round-28 residual findings (deep corpus,
`O_NOCTTY`). The round-27 identity-path, retention and unit-override families
stay open.

## Round-31 Render web-service frontier step

The round-30 sentence above ("Render web service deploys … and the Blueprint
file stay open") is historical for its date. Round 31 added Render
web-service and Blueprint knowledge (`corpus/knowledge/render-web-services.md`,
S057–S060): port binding, Docker builds, health-check rules and the
Blueprint keys, with an offline key-by-key check of the lane's own
`render.yaml` at ds4cc-marketplace `1fbdb8ed`. It is knowledge only, with no
gate; nothing live was fetched and no deploy was made. The live service's
plan, region, domains and deploy trigger stay unknown from the file.
Accessibility conformance stays open. The citing-set fixture runner gained
containment for five hostile fixture shapes (`scripts/citing_set_hostile_selftest.py`);
the round-27 families listed in round 30 stay open.

Round-31 wave-2 narrowing (`.ufo/waves/round-31/a2-w2/ReviewProvinceReadme.md`
F1, F2, F4): "nothing live was fetched" above means no operator-owned property
was fetched or measured and no deploy was made; the round's only live fetches
were the public Render Docs pages S057–S061 (one GET each, 15:41:23–29Z). The
refusals live in the runner `scripts/citing_set_selftest.py`;
`scripts/citing_set_hostile_selftest.py` is the committed check of them. S061
also corrected `render-static-sites.md` (its "Round-31 corrections").

## Round-33 frontier step

Correction (round-32 routed item 5): line 122 above says "five hostile
fixture shapes"; the committed hostile-spec set has six since round 32
(P1–P6 under `scripts/fixtures/citing-set-hostile/`). Round 33 keyed P6 on the
runner's structured refusal `code` (`reason_code`) instead of message text.

The ds4cc-marketplace source the corpus reads moved upstream from `1fbdb8ed`
to `7fc6aa2f` (one commit, three `/magga/frostbite/` pages, sitemap 97 → 100
locs). The corpus now records that commit's sitemap, page canonicals and the
forge's deploy-run record (S065, S066;
`corpus/knowledge/sitemap-orphan-audit.md` round-33 sections). Source-side
and forge-record only: no operator-owned property was fetched and nothing
was deployed. The round's only network reads were the public GitHub
repository clone and two GitHub API run listings.

Correction (round-33 wave-2 `CriticC2Verdict`): "The round's only network
reads were the public GitHub repository clone and two GitHub API run
listings" above is too narrow. The L1 also ran `git ls-remote`, and wave
seats made further public github.com reads (other clones, `ls-remote`, the
commit page, `gh api` run, deployment and workflow listings, two refused
unauthenticated API requests; `.ufo/waves/round-33/w1/*.md`,
`w2/ScoutUpstreamHeadNow.md`). All went to public GitHub; none reached an
operator-owned property.

## Round-34 link-preview frontier step

Link-preview metadata — the Open Graph properties a platform reads to build a
card for a shared URL — enters the Frontier as held ground with a source-backed
entry and an offline gate. The entry,
`corpus/knowledge/link-preview-metadata.md`, is grounded in S067 ogp.me, S068
Meta's sharing guide for webmasters, S069 Slack's robots page and S070
Mastodon's PreviewCard entity, and states the ds4cc Open Graph census of the
retained upstream tree at `7fc6aa2f`: 102 pages, 87 with `og:title`, 87 with
`og:type`, 87 with `og:url`, 1 with `og:image`, 1 with all four, and 87 whose
`og:url` equals the page canonical. The gate, `scripts/link_preview_audit.py`,
reads a version-1 manifest of local HTML pages and absolute page URLs and,
network-free, reports a missing one of the four required properties (S067),
more than one `og:type` (S068), a non-absolute `og:url`, and an `og:url`
differing from the first `<link rel=canonical>` resolved against the page URL.
Exit, verdict and finding shapes and the 28 frozen cases are in
`.ufo/waves/round-34/c1-matrix.json`; the counters are
`.ufo/waves/round-34/c1_matrix_count.py` and `c2_source_census.py`.

The Frontier paragraph at line 30 says ground moves to Core only with
source-backed entries and a gate. Both conditions are supplied: the entry's
quotes are exact substrings of the retained text, and the gate has a frozen
case matrix and a counter that rejects four constant implementations (although a
lookup-table tool also scores it; `corpus/lessons/round-34.md` mistake row 4), plus a
29-fixture selftest `scripts/link_preview_selftest.py`. The
round takes this ground from open to held Frontier ground, not Core; no Core
line is added and no older line is rewritten.

Nothing live was observed: the gate reads local files only, and the sources
were opened with one public GET each at 20:57Z (S067–S072) and 21:08–21:09Z
(S073–S077) (`.ufo/waves/round-34/sources/receipts.json`); wave-1 seats made further
ordinary GETs of public documentation and the public ds4cc-marketplace repository, listed
in their reports. No
operator-owned property was fetched. Open: live platform rendering (no card
was requested or observed; Slack's link robot reads tags over HTTP Range and
fetches referenced media, S069; Mastodon generates a PreviewCard from Open
Graph tags, S070); X card tags, whose markup URL S071 now redirects to a
generic documentation index and so grounds nothing; image checks beyond a
non-empty `og:image` (no fetch, MIME, dimension, HTTPS or reachability test);
`name=` meta forms, the other `og:*` properties and per-type extra required
properties (S067). The census observes source bytes and repairs nothing: 101
of 102 pages carry no non-empty `og:image`.


## Round-35 security.txt publishing frontier step

Serving a `security.txt` file from a GitHub Pages site — placing RFC 9116's
machine-readable pointer to a vulnerability-reporting channel where a
researcher can find it, and getting that path past the site's build — enters
the Frontier as held ground with a source-backed entry and no gate. The
entry, `corpus/knowledge/security-txt-publishing.md`, is grounded in S078
RFC 9116, S079 securitytxt.org, S080 Jekyll's configuration options, S082
RFC 8615, S083 the IANA "Well-Known URIs" registry and the re-opened S006
GitHub Pages/Jekyll page, with S084
(`https://github.com/.well-known/security.txt`) and S085
(`https://www.google.com/.well-known/security.txt`) as published examples,
retained as body text only; S081 (Wikipedia) is rejected as secondary and
grounds no claim.

The placement rule is the RFC's, not the lane's: a publisher “MUST place the
"security.txt" file under the "/.well-known/" path” of the domain (S078); a
legacy top-level copy may be served or redirected, but “the one in the
"/.well-known/" path MUST be used” when both exist (S078). That prefix is the
reserved well-known space of RFC 8615 (S082), and the registry lists
`security.txt` against RFC 9116 as a permanent registration (S083). What the
file must carry is sourced the same way: `Contact` “MUST always be present in
a "security.txt" file” (S078); `Expires` “MUST always be present and MUST NOT
appear more than once”, in RFC 3339 form, and it is “RECOMMENDED that the
value of this field be less than a year into the future to avoid staleness”
(S078); `Canonical` is https-only for web URIs, and a file whose retrieval URI
is not listed there is one whose contents “SHOULD NOT be trusted” (S078); the
response “MUST have a Content-Type of "text/plain" with the default charset
parameter set to "utf-8"” and the file must be served over HTTPS, where
“implementors MUST use HTTPS” (S078); it is “RECOMMENDED that a "security.txt"
file be digitally signed using an OpenPGP cleartext signature” (S078); and
scope is the retrieval URI's domain, “not to any of its subdomains or parent
domains” (S078). S078 is current: a wave-1 check of the RFC-Editor errata page
and the datatracker document page found no update or obsoletion relation, and
no erratum that changes a publisher rule — the one verified erratum is a
comment cross-reference and the two reported ones touch the `Expires` example's
lowercase `z` and the ABNF line separator
(`.ufo/waves/round-35/w1/ScoutRfc9116Errata.md`).

The Pages half of the question is a build-path question. A branch build
through Jekyll does not publish paths starting with a dot (S006), and
`include:` is the documented escape for dotfiles — “.htaccess is a good
example since dotfiles are excluded by default” (S080) — with Jekyll 4's
include entries overriding exclude entries (S080). An Actions artifact build
instead packages the tree before upload, and that archive hard-codes a
hidden-dotfile exclusion at v4.0.0, gains an `include-hidden-files` input
(default false) at v5.0.0, and never archives `.git` or `.github` (S001, S002;
recorded with its quotes in `corpus/knowledge/ghp-served-set.md`). A project
site is served under `https://<owner>.github.io/<repo>/` (S040–S043,
`corpus/knowledge/pages-base-path.md`), so whether a project-site subpath can
satisfy a domain-level well-known placement is not settled by any opened row;
the entry must not assert that it does. A wave-1 source-side census of the
public ds4cc-marketplace tree at `7fc6aa2f` reports no `.well-known` path and
no `security.txt`, no `_config.yml` (so no `include:` list exists for a Jekyll
build of that tree), a root `.nojekyll`, and a single Pages workflow pinned to
`actions/upload-pages-artifact@v3` with `include-hidden-files` unset
(`.ufo/waves/round-35/w1/ScoutDs4ccWellKnown.md`; read-only clone, no owned
host probed). Whether that pinned revision already includes hidden files —
the dotfile exclusion is documented as a v4.0.0 change (S002, as recorded in
`corpus/knowledge/ghp-served-set.md`) — is not established by the opened rows
and is open below.

This puts new publisher-side ground — where a Pages site has to keep a
`security.txt` file, and what the file has to say — into held Frontier ground,
not Core. The Frontier section above says ground moves to Core only with
source-backed entries and a gate; this ground gets the entry, and the round's
only instrument for it is the C2 counter, which reads the entry text, its
cites, its size and the retained source texts rather than a served file. No
gate is declared and no Core line is added, and no older line is rewritten.

No owned property was observed. The corpus rows were opened with one public
GET each at 2026-10-22T22:00:48–22:02:20Z
(`.ufo/waves/round-35/sources/receipts.json`), and S084/S085 were retained as
body text only: no response headers, TLS chain, redirect chain or
Content-Type was recorded, so their conformance to the RFC's serving
requirements is not observed. Wave-1 seats made further public reads — the
GitHub Pages and Jekyll documentation, the RFC-Editor errata and datatracker
pages, the action's released `action.yml` files, and a ten-host public
`/.well-known/security.txt` census — reported in their own files under
`.ufo/waves/round-35/w1/`; none reached an operator-owned property, and this
section restates none of their counts. No `security.txt` was authored, added,
built or published on any owned site. Writing one, editing a site's `include:` list, changing a deploy workflow and
deploying are operator-owned actions. Vulnerability handling itself stays out
of province: report intake, triage, remediation, disclosure timing, bounty and
policy operation, and whether any named contact channel works, are not kake's
ground, and this ground does not claim that publishing a file improves
security. Open: whether an `include:` entry for a dot directory is actually
served by a Pages branch build (no build was run); whether the ds4cc workflow's
pinned `upload-pages-artifact@v3` includes a hidden path, which its `action.yml`
at that tag would settle and no opened row does; project-site placement
(above); a live `/.well-known/security.txt` request against any owned host;
response-header, TLS and redirect conformance of the two published examples;
signature generation and verification, with key custody adjacent to `kagi`;
and expiry monitoring, since the RFC's warning is that the data goes stale.

## Round-37 robots.txt frontier step

Round 37's declared frontier move is an offline robots.txt expectation audit (`scripts/robots_audit.py`): each manifest check compares an expected allow/disallow result against its supplied status and, for 2xx, its named local robots file (S011; S095; Round-37 C1 contract).
The command reads only the manifest and named robots files, writes nothing, and uses no network (C1 contract, Usage).
It reports `blocked`/`exposed` for policy mismatches; its verdict is `could-not-evaluate` if input/check faults exist, `failed-policy` for findings otherwise, and `clean` when there are none (C1 contract, Findings/Verdict).
Unknown records, including `Sitemap` and `crawl-delay`, are ignored; sitemap parsing/scope and crawler-specific extension behavior remain open (C1 contract, Lines; S012–S013).
This contract does not observe live fetches, redirects, caching, or crawler behavior (C1 contract, Limits).
Boundary: kake owns publisher-side robots/sitemap placement at the host it serves, while browser-driving and client-side crawler discipline belong to tabi (PROVINCE.md, Adjacent); this audit does not probe or publish an owned property.
Knowledge entry: `corpus/knowledge/robots-txt-rules.md` (S011, S095, S096; lane readings marked).

## Round-38 robots audit repair step

Round-37 C1 was not admitted (`corpus/lessons/round-37-verifier-spotcheck.md`). Its audit, selftest
and independent implementation stay as non-claim work. Round 38 re-claims `scripts/robots_audit.py`
as a tool repair (C2), not new domain ground. The repair covers three surfaces: manifest and check
validation, and the implicit-allow comparison.
(h) `NaN`, `Infinity` and `-Infinity` outside strings make the manifest `input_invalid`. An
out-of-range `robotsStatus` of any length is `check_invalid`, and unused long numbers change nothing
(S034, S100). (i) Any ASCII character outside RFC 3986's set, anywhere in `url`, is `check_invalid`.
Non-ASCII is kept; this is not a full URI grammar check (S098). (k) A path to match that is exactly
`/robots.txt` after rule-(e) normalization is implicitly allowed; query, case and kept reserved
escapes leave it to the rules (S099; Google differs, S096).
Counter v3 (20 of 20) separates the tool from stdlib-delegating readers. Before the build it scored
13 for the stdlib reader patched for (h), (i) and (k), and 7 for the round-37 shortcut. Measured: 8 → 20
at `3ed8e15c`.
Still open: live fetch, redirects, caching, crawler extensions, sitemaps, the symlinked manifest
directory and U+FFFD per byte. Client-side crawler discipline stays with tabi; kake keeps
publisher-side placement.

## Round-39 sitemap file audit step

Round 39 opens the sitemap surface left open by rounds 37–38 ("sitemaps" in their Still-open lines).
`scripts/sitemap_audit.py` (build `565ef4c9`) audits local sitemap and sitemap-index files against
`.ufo/waves/round-39/c1-contract.md`: UTF-8 and encoding declaration, well-formedness and DOCTYPE,
root and entries in the 0.9 namespace (other namespaces ignored), entry children, the 50,000-entry
and 52,428,800-byte limits, `loc` form and length, `loc` scope against the sitemap's own URL, and
`lastmod`, `changefreq` and `priority` values (S102–S108). It reads files only; it does not fetch,
gunzip, follow robots `Sitemap:` lines or judge any engine's acceptance (S109 shows one engine
reading `loc` limits differently). The claim (C1) is exploratory: its sealed 24-case counter could not
separate the contract from a regex reader or from 15 single-sentence breaks. Still open: gzip, live
fetch, text/RSS sitemaps, robots cross-submission, and a key that kills those 15 breaks.
Boundary unchanged: publisher-side placement is kake's; client-side crawling stays with tabi.

## Round-49 crawl-budget frontier step

Round 49 adds publisher-side crawl-budget consequence knowledge
(`corpus/knowledge/crawl-budget-consequences.md`, S273, S274), re-opened this
round. It is knowledge only, with no gate and no property measured. The
checked sentences are: Google will not shift newly available crawl budget to
other pages unless the capacity limit is already hit (S273), and the emergency
backoff reduces the crawl rate across the whole hostname (S274). Publishing
stays operator-owned. The Jekyll url/baseurl staged row was refused because
its URL is already S080. The Ollama OpenAPI staged row was refused as kama's
province.

## Round-51 canonical-selection and crawler-identity frontier step

Round 51 adds two source-backed entries and narrows Frontier line 23: `canonical/JS rendering
open` is now partly held. `corpus/knowledge/canonical-selection.md` (S262) holds the selection
half of the canonical signal — what a declared canonical is worth, which signals Google weighs,
and which variant classes create duplicates; the lane's held `static-canonical-preflight.md`
covers only the declaration side and explicitly disclaims selection. `corpus/knowledge/crawler-identity.md`
(S263) holds the identity half of the crawl signal — "Googlebot" names two crawlers, the subtype
is read from the HTTP user-agent request header, and both obey the same robots product token.
Both are Frontier knowledge: no gate, no owned property audited, no publish action. JS rendering
stays open and stays tabi's adjacent province for anything that executes a browser. Held entries
that still speak of a bare "Googlebot" (js-rendering-queue, dynamic-rendering-workaround-limits,
crawl-error-status-table) stay true as vendor sentences but inherit subtype ambiguity; a round
that closes that must cross-reference the new entry, not re-derive it.

## Round-52 per-engine crawl hygiene (and a correction to the round-51 wording)

Round 51's block above says it "narrows Frontier line 23". The bytes of line 23 are identical
before and after round 51; what changed is this document's reading of it, added as that block.
Read the sentence that way (round-51 closure routed defect 6).

Round 52 adds three entries on per-engine crawl hygiene beyond Google, on rows opened this round.
`corpus/knowledge/yahoo-japan-rel-nofollow-semantics.md` (S374): a link attribute states
non-endorsement and is not weighed when results are ordered — it is not a crawl refusal, and the
tagged URL is still used to find new pages. `corpus/knowledge/baidu-friendly-crawl-guidance.md`
(S329): one `User-agent: Baiduspider` block binds the PC and mobile crawlers together, the crawler
honours the `*` and `$` wildcards, and the spider trap is the site's own low-cost generation of
near-identical parameter URLs that the refusal file is to cover.
`corpus/knowledge/baidu-mobile-matching-error-causes.md` (S312): the five causes of a failed
PC↔mobile correspondence, including a mobile main body loaded by ajax and a robots block on
Baiduspider. All three are Frontier knowledge: no gate, no owned property audited, no publish
action. Publishing stays operator-owned.

## Round-55 Yahoo! JAPAN robots.txt rules, and the coverage map's frontier ground map

Round 55 adds three entries on one operator's robots.txt rules, each re-grounded against a fresh
retained body fetched 2026-10-25: `corpus/knowledge/yahoo-japan-robots-txt-refusal-rules.md` (S372:
where the file goes, what an absent file means, case-sensitive path names, `Allow:` beside
`Disallow:`, the meta-tag fallback), `corpus/knowledge/yahoo-japan-robots-pattern-syntax.md` (S373:
the wildcard, the end marker, and the prefix rule that makes a line without the end marker match
every URL containing its string) and `corpus/knowledge/yahoo-japan-robots-txt-basics.md` (S418, a new
row: robots.txt as a request channel for the refused pages and the sitemap location, read from the
site root). They extend the per-engine crawl-hygiene ground of round 52 from link attributes
(S374) to the refusal file itself. They state what the operator's documentation says (the pages print
更新日 2010年11月24日); no robots.txt was served and no crawl was observed, so no crawler behaviour is
claimed. Frontier knowledge: no gate, no owned property audited, no publish action; publishing stays
operator-owned. Yahoo! JAPAN crawler-address, user-agent-list and deleted-URL pages in the staging
package are not adopted this round.

`corpus/README.md` §Coverage map now carries a running table of this section's frontier items against
the rounds and entries that entered them (`considerthese/2026-10-25.md` proposal 4), and a row for
each of the 21 knowledge files the map did not name at the round base, plus rows for the three new
entries (24 rows added). The table's `Untouched ground` list is the
reading of the Frontier that this round could evidence; it is not a statement that the ground stays
untouched.

## Round-56 Yahoo! JAPAN crawl handling: link-target restriction, deleted URL, non-existent URL

Round 56 adds three entries on what one operator's pages say a server's answer does to the crawl, each
re-grounded against a fresh retained body fetched 2026-10-25: `corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md`
(S367, a held row re-opened: a page refuses the crawl of the link targets it contains from its own head
with `index,nofollow` or `noindex,nofollow`, or from the server with `X-Robots-Tag: NOFOLLOW`; the first value
leaves the page's own registration permitted), `corpus/knowledge/yahoo-japan-deleted-url-recrawl.md` (S419,
a new row: a deleted URL that answers `HTTP 200 OK` may keep being crawled; the page asks the publisher to confirm
that the server returns `HTTP 404 Not Found`, with an index-refusal meta tag in the error page's head where that
cannot be set) and `corpus/knowledge/yahoo-japan-nonexistent-url-recrawl.md` (S420, a new row: an error page served
under `HTTP 200 OK` is not read as an error page and the crawl continues; this page asks that the server be
set to return 404, with the same fallback).
They continue the per-engine crawl-hygiene ground of rounds 52 and 55 from link attributes (S374) and the
refusal file (S372, S373, S418) to the server's own status answer. They state what the operator's
documentation says (the pages print 更新日 2010年11月24日); no URL was served under test and no crawl was
observed. Frontier knowledge: no gate, no owned property audited, no publish action; publishing stays
operator-owned. The round-55 sentence that the deleted-URL page "is not adopted this round" is superseded
for that page by this round. Not adopted from the same staging package: the canonical-notification (S388),
redirect-and-indexed-URL (S389) and dynamic-page-indexing (S387) candidates — rejected as staged, reasons
and flip conditions in `corpus/lessons/round-56.md` § Gate.

## Round-57 Baidu dead-link handling: dead-link types, Spider 3.0 recognition model

Round 57 adds two entries on what one operator's own pages say a dead link is and how its crawler treats one, each re-grounded against a
fresh retained body fetched 2026-10-25: `corpus/knowledge/baidu-dead-link-types.md` (S421, a new row: Baidu's college page divides dead links
into protocol dead links, shown by the page's TCP/HTTP status, and content dead links, where the server answers normally but the content has
become nonexistent, deleted or permission-gated; it states the content kind answers HTTP 200 and cannot be set to 404, that handled pages
should be set to 404, and that its submission tool recognises 404 only) and `corpus/knowledge/baidu-spider3-dead-link-model.md` (S422, a new
row: the 2016 Spider 3.0 announcement says a new dead-link recognition model recognises protocol dead links and most content dead links and
redirect dead links, states a few-days handling time after the update and calls a protocol dead link the best choice; its 10-day and 40–80%
figure belongs to index display, not to dead-link handling). They continue the per-engine crawl-hygiene ground of rounds 52, 55 and 56
from Yahoo! JAPAN's server-status answers to the same class on Baidu's side (a gone page that still answers success). They state what the
operator's pages say (the pages print 发布日期 2022-09-09 and 2016-06-30); no URL was served under test and no crawl was observed.
Frontier knowledge: no gate, no owned property audited, no publish action; publishing stays operator-owned. Not adopted from the same
staging package this round: the other Baidu candidates (render-agent announcements S390, S409/S410, and entries citing campaign-internal
evidence paths) — reasons and flip conditions in `corpus/lessons/round-57.md` § Gate.

`corpus/README.md` §Coverage map gains two rows and a round-57 row in its frontier ground map; the sibling-registry resolver
`scripts/id_resolver.py` (round-57 capability, `considerthese/2026-10-25.md` proposal 2) reads this lane's knowledge entries and the
other lanes' registries and changes no owned ground.
