source: S023 https://playwright.dev/docs/locators — §Locating elements, §Locate by role, §Locate by label, §Locate by placeholder, §Locate by text, §Locate by alt text, §Locate by title, §Locate by test id, §Locate by CSS or XPath, §Strictness; S024 https://playwright.dev/docs/aria-snapshots — §Aria snapshots, §Snapshot matching, §Partial matching, §Strict matching, §Matching with regular expressions, §Updating snapshots, §Snapshots as separate files; S025 https://www.w3.org/WAI/ARIA/apg/ — APG Home, §Design Patterns and Examples, §Providing Accessible Names and Descriptions. All three opened 2026-10-20; exact quotations, anchors, and hashes in §1.
verified-at: 2026-10-20 (raw GETs at 04:04–04:05 GMT; S023 `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6`, S024 `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194`, S025 `17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f`; quoted text matched the served HTML; locally measured: no)
recheck: on each Playwright release — re-fetch both Playwright pages and diff the quoted anchors (§Locate by role, §Locate by text, §Strictness, §Snapshot matching, §Partial matching, §Strict matching, §Updating snapshots, §Snapshots as separate files); 365d for the APG home; a changed sha re-opens the quotation rows, not the lane rule
<!-- corpus entry — tabi-shokunin round 12 (2026-10-20), lane AriaEntry (claim C2: one docs-held entry admitted, entry count 0→1; the C2 scalar stays 9 and no runtime support is claimed). Path: accessible-selectors, S025 → S023 → S024, as queued in corpus/SOURCES.md §Paths. Method: documentation only — the three URLs were fetched raw with curl this session and sha256'd; every quotation below was re-located in the served HTML; the S023/S024 hashes are byte-identical to the round-1 fetches recorded in corpus/lessons/kaika-fleet-round-1.md:66-67 and S025 to :68. No Playwright runner, browser, locator resolution, accessibility tree, or live page was executed or inspected. Write scope: this file only. -->

# Accessible locators and ARIA snapshots — semantic selection, structural evidence, and what they do not prove


## 1. Sources, access date, and exact quotations [observation]

| row | URL | accessed (UTC) | HTTP evidence | sha256 | bytes |
|---|---|---|---|---|---|
| S023 | https://playwright.dev/docs/locators | 2026-10-20 04:04:42 | `server: GitHub.com`, `last-modified: Mon, 19 Oct 2026 16:28:55 GMT`, `etag: "6ad64547-41737"` | `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` | 268,087 |
| S024 | https://playwright.dev/docs/aria-snapshots | 2026-10-20 04:05:55 | `server: GitHub.com`, `last-modified: Mon, 19 Oct 2026 16:28:55 GMT`, `etag: "6ad64547-1e9f2"` | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` | 125,426 |
| S025 | https://www.w3.org/WAI/ARIA/apg/ | 2026-10-20 04:04:42 | `server: cloudflare`, `last-modified: Wed, 14 Oct 2026 17:09:16 GMT`, Jekyll v4.4.1 | `17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f` | 39,382 |

The S023/S024 hashes equal the round-1 seat's hashes (`corpus/lessons/kaika-fleet-round-1.md:66-67`) and S025's equals that lesson's `:68`: the bytes did not change between 2026-10-19 and this round's re-open. `Last-Modified` is the server's header, not a claim that no later build exists behind a cache. The access date and hashes pin the served documentation bytes only; they do not pin a Playwright package or browser runtime, and no version banner was read (see Unknown 5).

Located source excerpts (each ≤25 words; source sections, rather than word-count
annotations, are the anchors):

| row | location | excerpt |
|---|---|---|
| S023 | §Locate by role | "role locators do not replace accessibility audits and conformance tests" |
| S023 | §Locating elements | "Every time a locator is used for an action, an up-to-date DOM element is located in the page." |
| S024 | §Aria snapshots | "A template is a constraint, not necessarily a complete serialization of the accessibility tree." |
| S024 | §Snapshot matching | "A single-node template can match at any depth within the selected page or locator." |
| S024 | §Strict matching | "contain (default): Matches if all specified children are present in order." |
| S025 | APG Home, introduction | "This guide describes how to apply accessibility semantics to common design patterns and widgets." |

## 2. Role / name / label decision table [inference, grounded in §1]

Playwright's own priority is user-facing attributes and explicit contracts (S023 §Locating elements). The table turns that into a selection rule; it is not an accessibility judgment about the page.

| page element / need | preferred locator | observed basis | caveat |
|---|---|---|---|
| interactive control with a semantic role and accessible name (button, link, checkbox, heading, listitem, table) | `getByRole(role, { name })` | closest to how users and assistive technology perceive the page; follows W3C role/attribute/accessible-name specifications (S023 §Locate by role) | pass the name as well "so that the locator pinpoints the exact element"; a role-only locator can match several controls; the role/name come from the page's ARIA/HTML, so a wrong role is a page defect, not a selector trick |
| form control with an associated `<label>` | `getByLabel(labelText)` | documented for form-control fields (S023 §Locate by label) | use the label, not the placeholder, when a label exists; label association must actually exist |
| input with a placeholder and no label | `getByPlaceholder(text)` | documented for "form elements that do not have labels but do have placeholder texts" (S023 §Locate by placeholder) | a placeholder is a hint, not asserted here to be the accessible name; prefer fixing the page with a label when the claim is semantic [inference] |
| non-interactive text (`div`, `span`, `p`) | `getByText(text)` | explicitly recommended for non-interactive elements (S023 §Locate by text) | do not use it for buttons/links/inputs; whitespace is normalized even with `exact: true` |
| image or area with a text alternative | `getByAltText(altText)` | documented for `img`/`area` (S023 §Locate by alt text) | needs a meaningful `alt`; this locator selects the text alternative, not the rendered pixels |
| element whose explicit contract is its `title` | `getByTitle(titleText)` | documented when the element has the `title` attribute (S023 §Locate by title) | choose only when the title is the intended contract; this page does not claim `title` is the accessible name [inference] |
| stable test-only contract | `getByTestId(id)` | "most resilient way of testing" (S023 §Locate by test id) | "not user facing": it survives text/role changes precisely because it does not verify semantics; use it only when role/text cannot identify the target or the explicit test contract is wanted |
| structural CSS/XPath fallback | `page.locator(cssOrXpath)` | available but explicitly last resort (S023 §Locate by CSS or XPath) | DOM-structure coupled; "not recommended"; long chains are the documented bad practice |
| narrowing within a component | `filter({ hasText })`, `filter({ has: ... })`, `within()`, `and()` | documented filtering/operator surfaces (S023 §Filtering Locators, §Locator operators) | `or()` can match both alternatives and trigger a strictness violation; prefer a unique composite locator over `.first()` |

**Selection rule.** Interactive target → role + accessible name; form field → label; non-interactive content → text; image → alt; test-only contract → test id; CSS/XPath only when nothing semantic exists. APG (S025) establishes the authoring scope — roles, states and properties, and keyboard support as a category — before a role locator is meaningful. The APG home does not, by itself, state any specific widget's keyboard requirement, and no APG pattern page was opened this round, so no per-widget keyboard contract is cited here. APG is not a test oracle (§5).

## 3. Strictness and dynamic-locator pitfalls [observation + inference]

Observed in S023:

- **Locators are re-resolved at action time.** "Every time a locator is used for an action, an up-to-date DOM element is located in the page" (§Locating elements). A locator is a query, not a pinned element handle; this is also Playwright's stated basis for retry-ability.
- **Strictness is default.** Operations that imply a single target throw when more than one element matches; multi-element operations such as `count()` work (§Strictness). The documented example is several `<button>` elements and a bare `getByRole('button').click()`.
- **The opt-outs hide ambiguity.** `first()`, `last()`, and `nth()` bypass the check but are "not recommended because when your page changes, Playwright may click on an element you did not intend" (§Strictness). `nth()` carries its own warning that the page may change and the locator may point to a different element (§Get by nth item).
- **`or()` is not a disambiguator.** If both alternatives appear, the locator matches both and may throw a strict-mode violation (§Locator operators).
- **Text matching is normalized and can be approximate.** `getByText` supports substring, exact, and regex; even exact matching collapses whitespace and trims (§Locate by text). A text pass is therefore not a byte-identical content check.
- **`all()` and enumerated counts are point-in-time queries** [inference from the re-resolution rule; the page does not state list-stability]. Keep the count and the enumeration time if either is used as evidence.

Operational inferences for tabi:

1. Record the locator expression, the expected role/name, and the observed match count at the moment of use. A bare `.click()` with no recorded ambiguity is not reproducible when the DOM has more than one candidate.
2. A strictness violation is a finding: the selector did not uniquely identify the target. Refine with a scoped filter/`within`/`and`, or record the ambiguity and stop; do not default to `.first()`.
3. A locator success proves only that an element matched at that instant. It is not a state predicate for payload content, network completion, or rendering; those need the §6 witnesses.
4. A role locator with no name, or a text locator used on a button, weakens the claim: the first may match several controls, the second bypasses the role contract the test claims to exercise.

## 4. ARIA snapshots: representation and matching [observation]

- **Representation.** An ARIA snapshot is YAML over the accessibility tree; each node is `- role "name" [attribute=value]`, with quoted names as exact strings and `/patterns/` as regular expressions. Attributes listed by the page include `checked`, `disabled`, `expanded`, `invalid`, `level`, `pressed`, and `selected`; values are "derived from ARIA attributes or calculated based on HTML semantics" (S024 §Aria snapshots).
- **Matching is structural and partial by default.** Case-sensitive, whitespace-normalized names/text, indentation-driven nesting, order-sensitive siblings; a single-node template can match at any depth, while multiple top-level nodes must share a parent and order (S024 §Snapshot matching).
- **Partial matching removes constraints.** Omitting an attribute or accessible name means the assertion passes regardless of the omitted value; the checkbox example ignores `checked`, and the button example ignores the label (S024 §Partial matching).
- **"Strict matching" is a children-mode setting, not default exactness.** `contain` is the default and only requires the listed children in order; `equal` makes direct children exact; `deep-equal` makes nested children exact; a nested `/children: contain` can override an inherited `deep-equal`. The mode can also be set globally in config (S024 §Strict matching). The section heading is easy to misread: absent `/children: equal|deep-equal`, the snapshot is a subset constraint. Even under `equal`/`deep-equal`, a name or state omitted from a node stays unconstrained — children exactness does not restore omitted attributes [inference from S024 §Partial matching + §Strict matching].
- **Dynamic text can be matched by regex**, but a regex is still a template constraint, not a full-tree capture (S024 §Matching with regular expressions).
- **Generation vs update.** Default mode generates absent snapshots but fails those tests so a new snapshot does not silently pass; `missing` keeps them passing; `-u` updates changed snapshots; `all`/`none` control scope. Inline snapshots produce patch files for review; `--update-source-method` selects `patch` (default), `3way`, or `overwrite` (S024 §Updating snapshots, §Snapshot patch files).
- **One snapshot is shared across browsers.** The docs say snapshots "should be the same across browsers" and only one is saved even when testing multiple browsers (S024 §Snapshots as separate files). Any browser-specific accessibility-tree difference is therefore outside that snapshot's evidence [inference].

## 5. Separation from pixels and from accessibility conformance [synthesis / inference, grounded in §1]

The two separations below are this entry's synthesis, not quotations from S024; S024 supplies the representation facts (tree derived from ARIA/HTML semantics, template-as-constraint), and the inference that these facts exclude rendering and audit claims is ours.

**Not pixels [inference].** The ARIA tree is computed from ARIA attributes and HTML semantics (S024 §Aria snapshots). Nothing in these pages establishes color, contrast, layout, overlap, font rendering, clipping, or visual visibility. The representation can include CSS-derived content — the §Links example composes link text from pseudo-elements and matches `/url` — but that is structured accessible content, not a guarantee of rendered appearance [inference]. A passing ARIA snapshot is compatible with a visually broken or unreadable page; a screenshot is the rendered-state layer (`SKILL.md:401`), and the two are independent witnesses. Do not present YAML as a screenshot substitute, and do not present a screenshot as proof of the accessible role tree.

**Not a full accessibility audit [inference].** Playwright is explicit: "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines" (S023 §Locate by role). The ARIA snapshot is also a template constraint, "not necessarily a complete serialization of the accessibility tree" (S024 §Aria snapshots), and partial matching deliberately drops names/attributes. The pages do not establish keyboard operability, focus order, screen-reader output, contrast, timing, or WCAG conformance. The APG home describes the guide's scope — applying ARIA semantics to patterns and widgets, with keyboard support named as part of that scope (S025) — but it is authoring guidance, not an audit procedure or a conformance verdict, and no per-widget keyboard requirement was opened or cited.

**What a snapshot can support.** A statement about the roles/names/attributes and sibling order that the template actually lists, within the selected page or locator scope, under the chosen children mode. That is narrower than "the page is accessible" and narrower than "the page has exactly this tree" unless `equal`/`deep-equal` and all relevant names/attributes are present.

## 6. Connection to tabi's evidence ladder [inference, corpus-specific]

The ladder's first rule is that a lower rung is never support for a higher one (`SKILL.md:361-367`). Locator and snapshot documentation does not add a rung; it changes what the existing rungs can record.

| tabi need | what this entry can record | ladder placement | boundary |
|---|---|---|---|
| select the target for a state claim | locator expression + expected role/name + observed match count + Playwright version + browser build | methodology, not evidence | a selector is not a state witness; strictness ambiguity must be recorded, not suppressed (S023 §Strictness) |
| "the DOM/accessibility tree has X" | `page.ariaSnapshot()`/`locator.ariaSnapshot()` YAML, or the committed `.aria.yml`/patch, with sha256 and full template | State claim class (`SKILL.md:402`), structural witness; can participate in rung 2 (before/after under a state-wait) | the template is a constraint; `contain` allows extra children and omissions weaken the claim (S024 §Partial matching, §Strict matching) |
| "clicking X changed the accessible structure to Y" | before/after YAML pair under a pinned methodology and a payload-derived settle predicate | rung 2, dynamic capture (`SKILL.md:369-374`) | the pair must be kept, including the pre-state; a single passing assertion has no before image |
| "the page renders X and exposes Y" | YAML + a screenshot read back, plus protocol metadata where relevant; two full runs | rung 3, multi-signal (`SKILL.md:369-374`) | the two signals can disagree; an ARIA pass cannot overrule a visual failure or vice versa |
| "the page fetched X" | no ARIA evidence; use the network slice | rung 4 only (`SKILL.md:374`) | an accessibility-tree change is not a network witness; a 200 body says nothing about the tree, and the tree says nothing about the wire |
| "the page is accessible / conformant" | no rung in this ladder | out of scope | role locators are not audits; snapshots are templates; APG is authoring guidance (S023 §Locate by role; S024 §Aria snapshots; S025) |

**Do not conflate the two `snapshot` surfaces.** `SKILL.md:402` already routes a state claim to webbridge `snapshot` — an accessibility tree with `@e` refs — first, with `DOM.getDocument`/`DOMSnapshot.captureSnapshot` as the raw form. That is a different producer and format from Playwright's YAML ARIA snapshot: the webbridge surface yields refs/attrs used for selection, while `toMatchAriaSnapshot` yields a template comparison. Neither format is evidence of the other's contents; a Playwright YAML file cannot be cited as a webbridge `@e` snapshot (or vice versa). If a claim spans both, record both artifacts with the producer named.

**ARIA is not an independent second signal against DOM shape.** An ARIA tree and a DOM snapshot are both derived from the same document; agreement between them does not satisfy rung 3's "two or more independent signals" (`SKILL.md:369-374`). For work that cites an ARIA artifact, the independent channels are the rendered screenshot and, for fetch claims, the network slice. Rung 4 is the network rung (`SKILL.md:374`), not a pixels rung; do not renumber the ladder around an ARIA artifact.

**Record shape for an ARIA-snapshot assertion.** Keep: source/test revision, Playwright version, browser name/build, locator scope, exact template, children mode (`contain`/`equal`/`deep-equal` and any nested overrides), regexes, expected/actual YAML or the diff/patch, assertion timeout, pass/fail, and the artifact sha256. `toMatchAriaSnapshot` may retry up to the expect timeout (S024 §Updating snapshots); a pass means the template matched during that window, not that it matched continuously or only at timeout. A snapshot update (`-u`) changes the baseline and therefore the claim: archive the old and new snapshot plus the diff, rather than accepting the new file silently.

## Rejected

- **"A passing ARIA snapshot proves the page is accessible."** Rejected: Playwright says "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines" (S023 §Locate by role), and the snapshot template is "not necessarily a complete serialization" (S024 §Aria snapshots). It can support only the listed roles/names/attributes/order. Flip: a documented audit procedure with its own scope and evidence, not this assertion.
- **"An ARIA snapshot substitutes for a screenshot."** Rejected [synthesis, inference]: snapshot values are derived from ARIA/HTML semantics (S024 §Aria snapshots); they carry no rendering, contrast, layout, or visibility guarantee, even where the representation includes CSS-derived content such as pseudo-element link text. The ladder keeps visual claims on the screenshot row (`SKILL.md:401`). Flip: a measured claim class where a tree assertion alone arbitrates a rendering question — none is offered by these pages.
- **"Use `.first()` to clear a strictness violation."** Rejected: the docs call `first()`, `last()`, and `nth()` opt-outs that are "not recommended" because a changed page can select the wrong element (S023 §Strictness). An ambiguity is a finding; refine the locator or record the ambiguity. Flip: a case where the target is intentionally ordinal and the order itself is the recorded contract.
- **"Default `toMatchAriaSnapshot` is exact."** Rejected: the default children mode is `contain`, a subset match (S024 §Strict matching); exactness of children needs `equal`/`deep-equal`, and even those modes do not constrain names or states omitted from the node (S024 §Partial matching). Flip: a version-scoped change of the documented default, with the anchor re-opened.
- **"ARIA snapshots are cross-browser evidence."** Rejected: the docs save only one snapshot across browsers because snapshots "should be the same" (S024 §Snapshots as separate files); that is a single shared template, not a per-browser tree comparison. Flip: a pinned per-browser snapshot/ariaSnapshot capture with differing bytes and a scoped claim.

## Unknowns

1. **Runtime behavior on this host.** No Playwright runner or browser was launched; no locator resolved, no `toMatchAriaSnapshot` evaluated, no `page.ariaSnapshot()` emitted. The host's installed Playwright version and whether it implements the documented `children` modes are unmeasured.
2. **Accessible-name computation details.** The docs say role locators follow W3C specifications but do not enumerate name-from-author/name-from-content precedence, `aria-labelledby` edge cases, or hidden-element handling. Not read from the W3C AccName specification this round.
3. **Tree inclusion rules.** These Playwright pages do not state how `display:none`, `aria-hidden`, shadow roots, iframes, or pseudo-element text enter or leave the ARIA snapshot. The examples show selected cases only.
4. **Cross-browser tree equality.** The single-snapshot policy suggests equality is expected, but no per-browser comparison was made; that remains a documentation statement.
5. **Locator implementation version.** The pages are `stable` docs served 2026-10-19 (HTTP header) and re-read 2026-10-20; no version banner was read, so the exact Playwright release is not pinned here. A local version probe is a later rung.
6. **APG revision.** The APG home has no version/revision marker in the fetched bytes, only a Jekyll generator tag and a server `Last-Modified` of 2026-10-14; the quoted authoring guidance is scoped to that fetch.

## 7. Round-13 append — 2026-10-20: children-mode attribution and `ariaSnapshot` API spelling [observation]

Appended only; every byte above is unchanged. S024 was re-opened raw on 2026-10-20 between 05:05 and 05:09 UTC: HTTP 200, 125,426 bytes, sha256 `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` — byte-identical to the round-12 fetch in §1, so the excerpts below describe the same served bytes. Section byte offsets below are offsets in that response body.

**Routed verifier item 4 — the default `contain` belongs to §Strict matching, not §Snapshot matching.** In the served S024 HTML:

- The exact bullet "contain (default): Matches if all specified children are present in order." occurs once, at byte 55,236, inside the §Strict matching region (the `<h3 id=strict-matching>` tag begins at 51,004; the next heading, `setting-children-mode-globally`, at 60,470). It is preceded in that section by "By default, a template containing the subset of children will be matched:" and followed by the `equal` and `deep-equal` bullets, "With no expected child entries, contain allows any children, while equal and deep-equal require none.", and "Add /children: contain to a nested node to override inherited deep-equal matching and allow extra children there."
- §Snapshot matching (the `<h2 id=snapshot-matching>` tag begins at 38,500; §Partial matching begins at 42,708) contains no children-mode statement. Case-insensitive, that region has zero occurrences of "children"; its only "contain" substrings are inside `codeBlockContainer` markup, not prose. What it does state is the assertion methods (`expect(page).toMatchAriaSnapshot()`, `expect(locator).toMatchAriaSnapshot()`), case-sensitivity and whitespace normalization, indentation-driven nesting, order sensitivity, and "A single-node template can match at any depth within the selected page or locator. Multiple top-level nodes must match under the same parent, in order."
- Consequence for §4: line 70's opening claim "Matching is structural and partial by default" is a §Strict matching claim — its support is the "By default, a template containing the subset of children will be matched" sentence — while the depth/order sentence later in that bullet is §Snapshot matching. Line 70's single trailing anchor `(S024 §Snapshot matching)` therefore covers only the second part. The §1 quote row and the §4 strict-mode bullet already carry the correct §Strict matching anchor; this paragraph is the correction of record, and no text above is rewritten.

**Routed item — `page.ariaSnapshot()` spelling: no correction needed.** S024 §Using page.ariaSnapshot() and locator.ariaSnapshot() (the `<h3 id=using-pageariasnapshot-and-locatorariasnapshot>` tag begins at 79,997) names both methods in its heading and body: "Methods page.ariaSnapshot() and locator.ariaSnapshot() allow you to programmatically create a YAML representation of accessible elements within a locator's scope…", and its example is `const snapshot = await page.ariaSnapshot();`. The API reference agrees independently, with version markers:

| surface | exact documented API | version marker | fetched URL | sha256 | bytes |
|---|---|---|---|---|---|
| Page | `page.ariaSnapshot(options?)` | "Added in: v1.59" | https://playwright.dev/docs/api/class-page | `5f8af4e006dd43c0e9302733cef08c7dfd24ad77385bb61cd29953b06848930e` | 975,536 |
| Locator | `locator.ariaSnapshot(options?)` | "Added in: v1.49" | https://playwright.dev/docs/api/class-locator | `50bf21d2f64a9e164cb2b2dd35141d12284d0d287c0b9c2c723e1e8d254b99da` | 572,193 |
| Page assertion | `expect(page).toMatchAriaSnapshot()` | — | https://playwright.dev/docs/api/class-pageassertions | `1a6ac38d3dab947b51bd91157e4d050c68fd2292f72e541987f7320e34b9768b` | 104,757 |
| Locator assertion | `expect(locator).toMatchAriaSnapshot()` | — | https://playwright.dev/docs/api/class-locatorassertions | `bb949bb823bb1f91634a4099e4cee64e670b385f81373eea1ace5c8b69cd952e` | 303,904 |

Both methods are documented as `ariaSnapshot`, so there is no spelling error to repair and no alternate supported name is asserted here. The exact call forms are `page.ariaSnapshot()` / `page.ariaSnapshot(options)` and `locator.ariaSnapshot()` / `locator.ariaSnapshot(options)`. On the locator page the JSON sibling is `locator.ariaSnapshotJSON()` ("Added in: v1.63"); on the page method it is `page.ariaSnapshotJSON()`, described as returning "the same tree as page.ariaSnapshot()". Options listed on both: `boxes`, `depth`, and `mode` with values `"ai" | "default"` (defaults to `"default"`). A `mode: "ai"` snapshot "Includes element references [ref=e2]" and, for the locator form, "Does not wait for an element matching the locator, and throws when no elements match" and "Includes snapshots of <iframe>s inside the target." This is Playwright's own ref spelling, so §6's warning stands and gains a second reason: Playwright's `[ref=e2]` is not the webbridge `@e` ref, even where both are rendering-derived trees.

These API-reference URLs are not rows in `corpus/SOURCES.md` at this append; they are cited here by URL, hash, and size only, and their registration is left to the corpus owner. No runtime was launched and no Playwright package or browser was probed; the version markers are documentation claims, not a host measurement.

## 8. Round-13 runtime qualifier (2026-10-20; append-only)

The round-12 method statement and Unknown1 describe the original documentation-only
revision; they do not describe the lane after the round-13 experiment. This paragraph
supersedes Unknown1 only for the exact fixture/package/browser and declared behaviors
in `corpus/knowledge/aria-loopback-round-13.md`. At code revision `06e6ada`,
`node scripts/aria-loopback-round13.mjs` exited0; eight cases ran/eight passed,
four expected rejections. The counting command and exact observed values are in
`corpus/evidence/round-13/aria-execution-pass.json` and `aria/receipt.json` within that
same evidence directory. The runtime receipt's documentedContract hash identifies
the pre-append documentation bytes used during that execution, not this later qualifier.

Playwright1.64.0 and managed Chrome for Testing156.0.8078.4 were recorded and
digest-checked. Role/name/label selection, strictness, re-resolution, before/after
ARIA capture, default contain versus explicit equal, and scoped checkbox-state
controls ran. This does not renew the other Unknowns, qualify another build,
certify accessibility, supply pixels/network truth, establish determinism or
exercise a real site. The original provenance dates and documentary claims above
remain historical. Reproduce in an isolated checkout; preserve the committed
original evidence before any later recheck.
