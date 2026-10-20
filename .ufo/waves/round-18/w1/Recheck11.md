VERDICT: PASS

# C1 freshness recheck — S022, S023 (seat Recheck11)

Lane tip read at start: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (B). No git/jj writes; no pacman; no tool installs
(nothing was needed — node/curl/pdftotext already present). Receipts produced only by
`.ufo/waves/round-18/recheck-fetch.mjs` (producer sha256
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`).

## S022 — Identifying and Mitigating Flaky Tests in JavaScript

- Row `corpus/SOURCES.md:36` (status `queued`, tier B, scope "JavaScript flaky-test research framing,
  abstract only"; anchor "IEEE ICST 2025, DOI 10.1109/ICST62969.2025.10989021, Abstract").
  Teaches: *Frames JavaScript test nondeterminism as a research agenda; methods and results not yet read*.
- Original Gate quote `corpus/lessons/kaika-fleet-round-1.md:65`, seat digest
  `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty body — the Gate already
  recorded "page reader; raw curl body empty").
- Row URL `https://ieeexplore.ieee.org/document/10989021/` → **HTTP 202, 0 bytes** on two separate
  curl attempts (first pass and the instructed later retry), i.e. still bot-gated for raw curl. The
  receipt therefore records the fetch URL as the same article number's abstract page:
  `https://ieeexplore.ieee.org/abstract/document/10989021`.
- Receipt fetch: **HTTP 200, bytes 45610**, decode `none`,
  sha256 `0748f3739d37e8b01e013006877cfaa633c9ef2fd159589a84a25260f62042dc`.
- Quote (19 words, ≥25 cap not hit), found at offset 4454 in both `<meta name="Description">` and the
  embedded `xplGlobal.document.metadata` `abstract`:
  "Flaky tests, which have non-deterministic outcomes (pass or fail when running on the same code), are a significant issue"
- Anchor observed: `articleNumber 10989021`, `publicationYear 2025`, `doi 10.1109/ICST62969.2025.10989021`,
  `publicationTitle "2025 IEEE Conference on Software Testing, Verification and Validation (ICST)"`.
- **Verdict: held.** The abstract continues "…affects software quality and makes it difficult to rely on
  test results. This research aims to explore the root causes … develop practical techniques to manifest
  possible flaky behaviour, and provide a mechanism to mitigate…" — aims only, no methods or results, which
  is exactly the teaches cell. No drift draft.
- Corroboration (not the receipt body): the same abstract read independently through the DOI-keyed
  Semantic Scholar record, HTTP 200, 1,817 bytes, sha256
  `a20eeedf18ea79b83d4747f958d6d2562a0c017165829035d30c0ac34c5a2b3a`; text identical. [INFERENCE] that
  index's `publicationVenue` display name is mislabelled ("International Conference on Information Control
  Systems & Technologies") although its `alternate_names` carry the correct "International Conference on
  Software Testing, Verification, and Validation" — an index-label quirk, not a source change; the receipt
  anchor rests on the publisher page.

## S023 — Locators — Playwright

- Row `corpus/SOURCES.md:37` (status `mined`, tier A, scope "Playwright role/label/text selector semantics";
  anchor "stable docs read 2026-10-19, §Locate by role"). Teaches: *Role locators are user-facing semantic
  selectors and explicitly not an accessibility audit*.
- Original Gate quote `corpus/lessons/kaika-fleet-round-1.md:66`.
- Receipt fetch: `https://playwright.dev/docs/locators` **HTTP 200, bytes 268087**, decode `html-text`,
  sha256 `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` — **byte-identical to the
  seat fetch digest recorded in the Gate**, so the page has not changed since 2026-10-19.
- Quote (19 words), found at offset 4509 in §Locate by role:
  "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines"
- Anchor observed: `<meta name=docusaurus_version content=stable>`, `<meta name=docsearch:version content=stable>`,
  `docs-doc-id-locators` — the stable docs channel, same section.
- **Verdict: held.** Same section also says role locators are "the closest way to how users and assistive
  technology perceive the page", so "user-facing semantic selectors … explicitly not an accessibility audit"
  is supported at the anchor. No drift draft.
- Access note: a probe with a Chrome UA returned a smaller 22,351-byte variant of the same URL (quote still
  present); the tool's fixed UA returns the 268,087-byte page whose digest equals the Gate's. The receipt
  records the tool's own fetch.

## Contract check (replica, run locally over the two receipt files)

For both rows, all of: schema `tabi-source-recheck-v1`; `row` present at `corpus/SOURCES.md`; `rowUrl`
verbatim inside that row's source cell; `sha256` 64-hex; `quoteWords` = 19 = word count of `quote`;
`normalize(quote)` ⊂ `normalize(excerpt file)`; `excerptSha256` = sha256 of the excerpt bytes; `quoteFound`
true; `fetchedAt` 2026-10-20; `teachesVerdict` held; `httpStatus` 200; `producerSha256` = current tool sha;
`seat` `Recheck11`. Result `ALL=true` for S022 and S023.
S022 excerpt sha256 `ef1fd81d3c3d5cf637c8a000f71739c44d9443b99fae422321c707fb7792edd4`;
S023 excerpt sha256 `505dfbf06c320e65ebbc052f5d7687d115b82126ca23377282e4c410a9f397d9`.

## Remaining unknowns

- S022 full text stays behind IEEE sign-in (unchanged from the Gate); the teaches cell claims only the
  framing, so this is out of scope, not a gap in the recheck.
- The row URL `/document/10989021/` itself remains non-fetchable by plain curl (202/0 bytes) today; the
  abstract page is the same article number served by the same host.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S022.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S022.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S023.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S023.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck11.md
