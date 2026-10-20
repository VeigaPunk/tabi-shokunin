# PlaywrightSource Scout Report: Reopening S023 & S024 Scoped Limits on C2

- **Seat**: `TabiR14.PlaywrightSource` (Leaf Scout subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Target**: Open `https://playwright.dev/docs/locators` and `https://playwright.dev/docs/aria-snapshots`. Reopen S023/S024 scoped limits on C2; exact located ≤25-word quotes, no audit/runtime upgrade, no registry edits.
- **Report Path**: `.ufo/waves/round-14/w1/PlaywrightSource.md`

---

## 1. Godspeed Axes

1. **Freshness**: Live HTTP re-opening and cryptographic SHA-256 byte-pinning of primary sources S023 (`playwright.dev/docs/locators`) and S024 (`playwright.dev/docs/aria-snapshots`). Measured SHA-256 digests match the recorded values in `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:13-14` and `corpus/lessons/kaika-fleet-round-1.md:66-67` without asserting unmeasured cross-round identity.
2. **Coverage**: Comprehensive extraction of located quotes across all relevant structural, semantic, and matching sections (§Locate by role, §Locating elements, §Strictness, §Aria snapshots, §Snapshot matching, §Strict matching, §Partial matching).
3. **Calibration**: Grounded epistemic boundary setting for Claim C2 (Calibration: Node metadata/cleanup sidecar 0→1). Strict separation between documentation-held knowledge, loopback fixture testing, and metadata derivation; zero overclaims regarding browser capability or accessibility audit compliance.
4. **Operability**: Non-destructive, leaf-bounded operation. Zero unauthorized gate runs, zero test runner executions, zero registry edits (`corpus/SOURCES.md` remains untouched). Clear, reproducible commands provided for L1.
5. **Depth**: Preserving the authentic four-rung evidence ladder (Rung 1: static bytes, Rung 2: dynamic capture, Rung 3: multi-signal, Rung 4: network wire capture; `SKILL.md:361-374`) and claim classes (Visual, State, Network; `SKILL.md:399-404`). ARIA template matching evaluates State claims, proving neither rendered appearance (Visual / screenshot layer; `SKILL.md:394-395`) nor network actions (Network / wire capture; `SKILL.md:374`), and does not constitute an independent multi-signal witness against DOM shape on Rung 3 (`SKILL.md:1637`).
6. **Adjacency**: Preserving domain boundaries against accessibility compliance auditing (forensics/audit) and HTML publishing (Kake/APG authoring).

---

## 2. Source Identification & Live Wire Evidence

Both sources were re-opened and fetched directly from GitHub's documentation CDN on 2026-10-20. Observed digests match the in-repo recorded reference values.

### S023: Playwright Locators
- **URL**: `https://playwright.dev/docs/locators`
- **HTTP Status**: `HTTP/2 200 OK`
- **Server**: `GitHub.com`
- **Content-Type**: `text/html; charset=utf-8`
- **Last-Modified**: `Mon, 19 Oct 2026 16:28:55 GMT`
- **ETag**: `"6ad64547-41737"`
- **Content-Length**: `268,087 bytes`
- **SHA-256**: `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6`
- **In-Repo Match**: Matches recorded hash in `corpus/lessons/kaika-fleet-round-1.md:66` and `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:13`.

### S024: Playwright Snapshot Testing (ARIA Snapshots)
- **URL**: `https://playwright.dev/docs/aria-snapshots`
- **HTTP Status**: `HTTP/2 200 OK`
- **Server**: `GitHub.com`
- **Content-Type**: `text/html; charset=utf-8`
- **Last-Modified**: `Mon, 19 Oct 2026 16:28:55 GMT`
- **ETag**: `"6ad64547-1e9f2"`
- **Content-Length**: `125,426 bytes`
- **SHA-256**: `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194`
- **In-Repo Match**: Matches recorded hash in `corpus/lessons/kaika-fleet-round-1.md:67` and `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:14`.

---

## 3. Exact Located Quotations (Each Quote ≤ 25 Words)

### From S023 (`https://playwright.dev/docs/locators`)

1. **Non-Audit Boundary (Explicit Subquote)**
   - *Anchor*: §Locate by role (`id="locate-by-role"`)
   - *Verbatim* (10 words):
     > "role locators do not replace accessibility audits and conformance tests"

2. **Re-resolution at Action Time (Query Nature of Locators)**
   - *Anchor*: §Locating elements (`id="locating-elements"`)
   - *Verbatim* (18 words):
     > "Every time a locator is used for an action, an up-to-date DOM element is located in the page."

3. **Dynamic Re-render Adaptation**
   - *Anchor*: §Locating elements (`id="locating-elements"`)
   - *Verbatim* (24 words):
     > "This means that if the DOM changes in between the calls due to re-render, the new element corresponding to the locator will be used."

4. **User & Assistive Technology Perception**
   - *Anchor*: §Locate by role (`id="locate-by-role"`)
   - *Verbatim* (23 words):
     > "The page.getByRole() locator reflects how users and assistive technology perceive the page, for example whether some element is a button or a checkbox."

5. **Disambiguation via Accessible Name**
   - *Anchor*: §Locate by role (`id="locate-by-role"`)
   - *Verbatim* (22 words):
     > "When locating by role, you should usually pass the accessible name as well, so that the locator pinpoints the exact element."

6. **Strictness Violation & Opt-Out Hazard**
   - *Anchor*: §Strictness (`id="strictness"`)
   - *Verbatim* (19 words):
     > "They are not recommended because when your page changes, Playwright may click on an element you did not intend."

---

### From S024 (`https://playwright.dev/docs/aria-snapshots`)

7. **Template as Constraint (Not Full Tree Dump)**
   - *Anchor*: §Aria snapshots (`id="aria-snapshots"`)
   - *Verbatim* (14 words):
     > "A template is a constraint, not necessarily a complete serialization of the accessibility tree."

8. **YAML Accessibility Tree Representation**
   - *Anchor*: §Aria snapshots (`id="aria-snapshots"`)
   - *Verbatim* (15 words):
     > "In Playwright, aria snapshots provide a YAML representation of the accessibility tree of a page."

9. **Single-Node Subtree Scope**
   - *Anchor*: §Snapshot matching (`id="snapshot-matching"`)
   - *Verbatim* (14 words):
     > "A single-node template can match at any depth within the selected page or locator."

10. **Multi-Node Sibling Order Constraint**
    - *Anchor*: §Snapshot matching (`id="snapshot-matching"`)
    - *Verbatim* (11 words):
      > "Multiple top-level nodes must match under the same parent, in order."

11. **Whitespace & Case Comparison Rules**
    - *Anchor*: §Snapshot matching (`id="snapshot-matching"`)
    - *Verbatim* (16 words):
      > "The comparison is case-sensitive and normalizes whitespace within names and text values. YAML indentation determines nesting."

12. **Partial Matching by Omission**
    - *Anchor*: §Partial matching (`id="partial-matching"`)
    - *Verbatim* (22 words):
      > "You can perform partial matches on nodes by omitting attributes or accessible names, enabling verification of specific parts of the accessibility tree"

13. **Default Children Matching Mode (`contain`)**
    - *Anchor*: §Strict matching (`id="strictmatching"`)
    - *Verbatim* (11 words):
      > "contain (default): Matches if all specified children are present in order."

14. **Exact Children Mode (`equal`)**
    - *Anchor*: §Strict matching (`id="strictmatching"`)
    - *Verbatim* (12 words):
      > "equal: Matches if direct children exactly match the specified list in order."

15. **Expect Timeout Retry (Hiding Intermediate Flakes)**
    - *Anchor*: §Updating snapshots with `@playwright/test` and the `--update-snapshots` flag (`id="updating-snapshots-with-playwrighttest-and-the---update-snapshots-flag"`)
    - *Verbatim* (9 words):
      > "Playwright retries the assertion until its expect timeout expires."

---

## 4. Reopening S023/S024 Scoped Limits on Claim C2

Round 14 defines Claim C2 as:
> *C2 calibration: independently checked corrected round13 cleanup/Node metadata sidecar 0→1; retain original receipt and pin byte-for-byte, do not pretend new browser execution. Scalars unchanged. Claims causally separable.*

The primary source texts S023 and S024 enforce five fundamental epistemic boundaries on Claim C2:

### Limit 1: No Accessibility Audit or WCAG Conformance Claim
- **Primary Ground**: S023 §Locate by role explicitly establishes that *"role locators do not replace accessibility audits and conformance tests"*. S024 provides a structural YAML template over the accessible tree, with zero mention of WCAG conformance, color contrast, keyboard event trapping, or assistive technology screen-reader audio output.
- **C2 Calibration Application**: The corrected round-13 metadata sidecar or any associated knowledge note must never frame Playwright locators or ARIA snapshot passes as proof of web accessibility compliance. They are structural state predicates only.

### Limit 2: No Browser Runtime Upgrade Claim
- **Primary Ground**: S023 and S024 are official documentation specifications. In round 13, an isolated loopback run occurred (`corpus/evidence/round-13/aria/receipt.json`).
- **C2 Calibration Application**: Claim C2 in round 14 is strictly a **calibration** claim (0→1 corrected metadata sidecar), not a new capability or runtime execution. The sidecar resolves contradictory worker cleanup fields (`listeningAfter=false`) and notes the exact Node version difference (`Node 26.12.0` observed vs recorded minimum `Node 24.21.0`). S023/S024 documentation principles dictate that adjusting metadata records derived from an existing run does not constitute a new browser launch or runtime upgrade.

### Limit 3: ARIA Snapshots Are Structural State Witnesses, Not Pixel or Network Proofs
- **Primary Ground**: S024 defines ARIA snapshots as a *"YAML representation of the accessibility tree of a page"*, where *"A template is a constraint, not necessarily a complete serialization"*. The page does not inspect pixel paint, CSS rendering, layout coordinates (unless `--boxes` is used), or network packets.
- **C2 Calibration Application**: Under Tabi's ladder architecture (`SKILL.md:361-404, 1636-1637`), ARIA template matching addresses State claims. It is not an independent second signal against DOM shape for Rung 3 multi-signal evidence (`SKILL.md:1637`: *"ARIA and DOM shape are not independent rung-3 witnesses"*), does not evaluate Visual claim rendering (`SKILL.md:394-395`: *"screenshot is the only rendered-state layer"*), and does not capture wire behavior (Rung 4 Network domain). C2 evidence cannot substitute ARIA snapshots for visual or network claims.

### Limit 4: Template Constraint Semantics vs Full-Tree Equality
- **Primary Ground**: S024 §Strict matching documents that the default mode is `contain` (allowing unlisted extra sibling children), and §Partial matching documents that omitting an attribute (such as `[checked]` or name) passes regardless of state.
- **C2 Calibration Application**: C2 validation must preserve the distinction: a passing ARIA snapshot confirms only that the declared template constraints were satisfied within the matching window. It does not certify that unconstrained attributes or omitted children are correct.

### Limit 5: Strictness Violations Are Ambiguity Findings, Not Selector Failures
- **Primary Ground**: S023 §Strictness documents that single-element actions throw when multiple elements match, and warns that opt-outs (`first()`, `last()`, `nth()`) *"are not recommended because when your page changes, Playwright may click on an element you did not intend"*.
- **C2 Calibration Application**: Strictness enforcement is an anti-ambiguity invariant. Any test fixture or locator contract evaluated under C2 must treat a strictness exception as a truthful finding of DOM ambiguity, rather than silently suppressing it with `.first()`.

---

## 5. Registry Immutability & Safety Scope

- **Zero Registry Edits**: As mandated by the target directive (*"no registry edits"*), `corpus/SOURCES.md` was inspected read-only and **no lines were modified, added, or deleted**.
- **Zero Protected Path Writes**: No edits were made to `SHONEN.md`, `baseline-census.tsv`, `scripts/check-freshness.mjs`, or historical lesson files.
- **Single Report Write**: This report is written exclusively to the designated trailer path:
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/w1/PlaywrightSource.md`.

---

## 6. Recommended Verification Commands for L1

When integrating round-14 wave deliverables, L1 should run the following commands to independently re-verify source freshness and C2 calibration artifacts without manual intervention:

```sh
# 1. Verify byte-exact integrity of S023 and S024 documentation fetches
curl -sL https://playwright.dev/docs/locators | sha256sum
# Expected: 234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6  -

curl -sL https://playwright.dev/docs/aria-snapshots | sha256sum
# Expected: bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194  -

# 2. Verify check-sources registry compliance (confirming zero invalid mutations)
node scripts/check-sources.mjs --repo .

# 3. Verify C2 metadata sidecar validator once landed by ReceiptRepair
node scripts/check-aria-metadata.mjs --self-test

# 4. Measure C2 admission count once landed by MeasureClaims
node .ufo/waves/round-14/measure.mjs --claim C2
```
