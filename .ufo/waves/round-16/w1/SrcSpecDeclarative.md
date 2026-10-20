# SrcSpecDeclarative — WebMCP declarative (HTML `<form>`) API: specified or only proposed? (round 16, w1)

Question (assigned slice): open the WebMCP spec (https://webmachinelearning.github.io/webmcp/) and its
repository (https://github.com/webmachinelearning/webmcp) and determine whether a declarative
(HTML-form-attribute) API is specified, or only proposed — e.g. `toolname` / `tooldescription`
attributes, a declarative explainer doc. Quote ≤25 words with exact file/section; record commit/date.

Status: **answered from primary sources**; every quote below was opened this session (2026-10-20).
No browser, harness, gate, selftest, counter or WPT run by this seat. No tools installed or upgraded.

## 0. Answer

**Proposed only — not specified.** As of repository HEAD `cb3d169` (2026-10-20T09:53:18Z) and the
published CG draft fetched 2026-10-20, the spec defines only the imperative JavaScript API
(`document.modelContext.registerTool()`); it declares **no** declarative form attributes.

- The published spec and `index.bs` contain **zero** case-insensitive occurrences of `declarative`
  (`grep -c -i` → `0` on both), and zero occurrences of `toolname=`, `tooldescription`,
  `toolautosubmit`, `toolparamdescription` (table §2).
- A declarative section existed in `index.bs` only as an admitted placeholder: added 2026-03-02 by
  commit `643b92c`, it read "This section is entirely a TODO"; removed 2026-10-08 by commit
  `14ae813` / PR #338, titled "Remove declarative API from the spec for now" (§3).
- The proposal lives in repo root `declarative-api-explainer.md` (213 lines, last touched
  `f14762e`, 2026-10-16), linked from `README.md` §"Future Exploration: Declarative API", which
  says it "is not part of the specification at this time" (§4, §5).
- The closest thing to a normative declarative contract is **WPT**, not the spec: `webmcp/declarative/`
  (25 `.https.html` files, feature `declarative-webmcp`) exercises `toolname`, `tooldescription`,
  `toolautosubmit`, `toolparamdescription`, plus a `tooltitle` attribute the explainer never defines;
  its latest commit is `e61b0727` (2026-10-17), i.e. after the spec removal (§6).
- Chromium's experimental behaviour behind `WebMCP`/`DeclarativeWebmcp` flags is therefore
  **implementation + tests ahead of spec**, not implementation of specified semantics. The flag
  behaviour itself is the L1 pre-probe's evidence, not re-run here.

## 1. Published spec identity and build provenance

| Fact | Value |
|---|---|
| URL | `https://webmachinelearning.github.io/webmcp/` |
| Fetch (2026-10-20) | `curl -sS -D /tmp/webmcp_spec_hdrs.txt -o /tmp/webmcp_spec.html https://webmachinelearning.github.io/webmcp/` |
| HTTP response | `HTTP/2 200`, `content-length: 505949`, `last-modified: Tue, 20 Oct 2026 09:54:46 GMT`, `etag: "6ad73a66-7b85d"`, `server: GitHub.com` |
| sha256 (fetched bytes) | `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` |
| Document title | `<title>WebMCP</title>` |
| Status | `Status: CG-DRAFT`, `Group: webml` (`index.bs:5-6`); published "Status of this document": "It is not a W3C Standard nor is it on the W3C Standards Track." (14 words) |
| Spec metadata | `Repository: webmachinelearning/webmcp` (`index.bs:7`), `URL: https://webmachinelearning.github.io/webmcp` (`:8`), `Test Suite: https://wpt.fyi/results/webmcp` (`:21`) |
| Repo HEAD | `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, committed `2026-10-20T12:53:18+03:00` = `09:53:18Z`, "Add new editor (#352)" |
| `index.bs` sha256 at HEAD | `dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39` |
| `README.md` sha256 at HEAD | `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` |
| `declarative-api-explainer.md` sha256 at HEAD | `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` |

The published page is the `main`-branch Editor's Draft (Bikeshed build of `index.bs`):

- `Makefile:1-9` — `# make Generate index.html from index.bs`; builds via `bikeshed spec`
  (or the csswg API when Bikeshed is absent).
- `.github/workflows/auto-publish.yml` — `push: branches: [main]` → `w3c/spec-prod@v2` with
  `GH_PAGES_BRANCH: gh-pages`, `BUILD_FAIL_ON: warning`. So every push to `main` republishes the ED.

Build-to-commit binding check (observed, with one `[INFERENCE]`): the fetched page names four editors,
including **Samuel Dallstream** — the single line added by HEAD commit `cb3d169` (`git show cb3d169 --
index.bs`: `+Editor: Samuel Dallstream, …`; only 1 line changed). Page `Last-Modified` is 74 s after
that commit (`09:54:46Z` vs `09:53:18Z`). `[INFERENCE]` the published bytes are a build of `cb3d169`
(or a commit whose `index.bs` is byte-identical to it); the page carries no commit stamp.

## 2. The spec contains no declarative API — measurements

All counts run on the fetched published HTML (`/tmp/webmcp_spec.html`) and on `index.bs` at HEAD
(`/tmp/webmcp-repo/index.bs`), 2026-10-20:

| Probe | Command | Published HTML | `index.bs` @ HEAD |
|---|---|---|---|
| word "declarative" | `grep -c -i declarativ` | `0` | `0` |
| `toolname=` attribute | `grep -o 'toolname=' \| wc -l` | `0` | `0` |
| `tooldescription` | `grep -o -i tooldescription \| wc -l` | `0` | `0` |
| `toolautosubmit` | `grep -o -i toolautosubmit \| wc -l` | `0` | `0` |
| `toolparamdescription` | `grep -o -i toolparamdescription \| wc -l` | `0` | `0` |
| `<form>` element API / `form-associated` | `grep -n -i '<form\|form element\|form-associated' index.bs` | — | no API lines; only two prose uses: `index.bs:1548` ("format"), `index.bs:1753` ("filling forms") |

Case trap, resolved: a *case-insensitive* `toolname` count on the HTML returns 40, but every hit is
the **IDL member** `toolName` / its generated fragment id, not a form attribute:

```
$ grep -o '.\{60\}toolname.\{40\}' /tmp/webmcp_spec.html | head -3
…data-link-type="idl" href="#dom-toolcancelevent-toolname" id="ref-for-dom-toolcancelevent-toolna…
…readonly data-type="DOMString" href="#dom-toolactivatedevent-toolname" id="ref-for-dom-toolactivatedevent-too…
…dfn-type="attribute" data-export id="dom-toolactivatedevent-toolname"><code>toolName</code></dfn>…
```

The specified surface is imperative JavaScript only:

- Abstract, `index.bs:13` and published §Abstract (13 words):
  "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents."
- §4.1 Extensions to Document, `index.bs:640-655`, published `#document-extension` — the only
  `Document` extension is the imperative entry point:
  "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };"
- §4.2 ModelContext Interface, `index.bs:665-680`, published `#model-context-container` (19 words):
  "The ModelContext interface provides methods for web applications to register and manage tools that can be invoked by agents."
- `tool definition` is defined against the imperative dictionary only (`index.bs:172-205`):
  `:195` — "This is the stringified representation of the `ModelContextTool/inputSchema` passed to
  `ModelContext/registerTool()`"; `:204` — "These steps invoke the execute callback of the
  `ModelContextTool` passed to `ModelContext/registerTool()`". The declarative branches and the
  `synthesize a declarative JSON Schema object algorithm` are gone (they were deleted by `14ae813`).
- Published IDL Index holds only `Document`, `ModelContext`, `ModelContextTool` and the five option
  dictionaries (and `// Boilerplate` script text) — no form-associated interfaces, no `HTMLFormElement`
  extension.
- Published Issues Index contains only Issue #224 and Issue #227 — no declarative TODO/issue marker.

## 3. History: the declarative API was a placeholder in the spec, then removed

All commit facts from a full clone (2026-10-20) and GitHub REST (`/commits`, `/pulls/338`):

| Commit | Date | Subject | Effect on `index.bs` |
|---|---|---|---|
| `643b92c3e5fb5be34621ae4fa2d32f874071e697` | 2026-03-02T15:59:55-05:00 | "Add basic tool infra: complete `registerTool()` and `unregisterTool()`" | adds `<h3 id="declarative-api">Declarative WebMCP</h3>` as an admitted TODO stub |
| `14ae813cc4e9fe0d39313f4b1ee5b231746731ad` | 2026-10-08T07:26:23-04:00 (11:26:23Z) | "Remove declarative API from the spec for now (#338)" | deletes the stub, the declarative schema algorithm, the declarative execute steps, the `form-associated element` link-default; renames "imperative execute steps" → "invoke the execute callback" |

PR #338 (`https://github.com/webmachinelearning/webmcp/pull/338`, state `closed`, `merged: true`,
`merged_at 2026-10-08T11:26:24Z`), body (20 words):

> The spec now focuses on the imperative `registerTool()` API. Declarative WebMCP is still being
> explored in the Declarative API Explainer.

Diff stat: `index.bs | 49 ++++---------------` (7 insertions, ~42 deletions), `README.md | 16`.

The stub, verbatim at its last revision (`git show 14ae813^:index.bs`, `:1284-1295`; 14 words at
`:1286`):

> This section is entirely a TODO. For now, refer to the [Declarative API explainer](…).

That section was the *entire* declarative content of the spec: a `<h3 id="declarative-api">`, the
sentence above, and a `synthesize a declarative JSON Schema object algorithm` whose body was
`1. TODO: Derive a conformant JSON Schema object from |form| and its [=form-associated elements=].`
(`:1289-1293`). The proposed attribute vocabulary never entered the spec at any revision:

```
$ git -C /tmp/webmcp-repo log --oneline -S'tooldescription' -- index.bs        # 0 commits
$ git -C /tmp/webmcp-repo log --oneline -S'toolautosubmit'   -- index.bs        # 0 commits
$ git -C /tmp/webmcp-repo log --oneline -S'toolname='        -- index.bs        # 0 commits
$ git -C /tmp/webmcp-repo log --oneline -S'declarative'      -- index.bs
14ae813 Remove declarative API from the spec for now (#338)
bd99438 Drop closed executeTool issue links from explainers. (#259)
f303c45 Spec the `executeTool()` API (#226)
643b92c Add basic tool infra: complete `registerTool()` and `unregisterTool()`
```

S020's queued anchor (`revision f14762e6`, 2026-10-16) is already post-removal: `git show
f14762e6:index.bs | grep -c -i declarative` → `0`. From `f14762e6` to HEAD there is exactly one
commit (`cb3d169`), touching only the editor list: `git diff --stat f14762e6..HEAD` → `index.bs | 1 +`.
So the removal predates the wave's source row and is not a change this round introduced.

## 4. The proposal: `declarative-api-explainer.md` (repo root, at HEAD `cb3d169`)

| Fact | Value |
|---|---|
| File | `declarative-api-explainer.md` (213 lines, 10,417 bytes) |
| Added | `483d1aa3acd022b30bac0c44e966dfbdcda8fae1`, 2026-03-09T18:17:06Z, "Declarative API Explainer (#76)" |
| Last touched | `f14762e63607bf96592b1a7a6392cd2b047b8209`, 2026-10-16T16:30:24Z, "Editorial: sync explainers with spec (#350)" |
| Read via | `https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/declarative-api-explainer.md` |
| Status word | self-described "proposal"; the README calls it "Early ideas" |

Located quotes (all verbatim, word counts ≤25):

| Location | Quote | Words |
|---|---|---|
| `:1` | "WebMCP declarative API" (title) | 3 |
| `:3-4` | "See discussion in https://github.com/webmachinelearning/webmcp/issues/22 that led to the creation of this proposal." | 12 |
| `:20-22` | "To make it easier for developers to expose this kind of site functionality while still using the semantic web, we propose:" | 21 |
| `:24-26` | "New attributes that augment `<form>`s and form-associated elements, that expose these as WebMCP tools to agents." | 16 |
| `:44-47` | "The `toolname` attribute is analogous to the imperative API's `ModelContextTool#name`, while `tooldescription` is analogous to `ModelContextTool#description`." | 16 |
| `:50-51` | "lets the agent submit the form on the user's behalf after filling it out, without requiring the user to check it manually before submitting." | 24 |
| `:64-65` | "Since there's no pre-existing description attribute we can use, we introduce the `toolparamdescription` attribute for form control elements" | 18 |
| `:108-110` | "TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes like `step` and `min` are TBD." | 19 |
| `:114-115` | "Chromium is implementing a loose version of this and will conduct testing/trials" | 12 |
| `:119` | "This topic is currently under debate; see https://github.com/webmachinelearning/webmcp/issues/135." | 8 |
| `:140` | "we introduce the CSS pseudo-classes `:tool-form-active` and `:tool-submit-active`." | 8 |
| `:143` | "The exact definition of this will be clarified in the specification" | 11 |
| `:211-212` | "How *declarative* tools show up there is still TBD." | 9 |

Proposed vocabulary (§"Form attributes", `:35-42`):

```html
<form
  toolname="Search flights"
  tooldescription="This form searches flights and displays [...]"
  toolautosubmit>
```

| Attribute | Element | Explainer anchor | Spec anchor |
|---|---|---|---|
| `toolname` | `<form>` | `:39`, `:44-47` | absent (0 in `index.bs` history) |
| `tooldescription` | `<form>` | `:40`, `:46-47` | absent |
| `toolautosubmit` | `<form>` (boolean) | `:41`, `:49-52` | absent |
| `toolparamdescription` | form control | `:65-67` | absent |
| `:tool-form-active` / `:tool-submit-active` | CSS pseudo-classes | `:135-153` | absent |
| `SubmitEvent#respondWith()` / `agentInvoked` | JS additions | `:155-160` | absent |

The document is incomplete by its own text: input-schema synthesis is TBD (`:106-112`), the
cross-document response mechanism is `under debate` (`:117-119`, issue #135), and how declarative
tools appear on `getTools()`/`executeTool()` is TBD (`:209-213`). Issue #210 remains open with the
stale title "Define the declarative input-schema synthesis algorithm (#declarative-api is currently a
TODO)" (GitHub search API, `state: open`, `updated_at 2026-09-24T20:45:59Z`; the `#declarative-api`
anchor it names no longer exists in the spec).

## 5. Repository status statements (README at HEAD)

| Location | Quote | Words |
|---|---|---|
| `README.md:3` | "A declarative API based on HTML `<form>` elements is also being explored." | 12 |
| `README.md:315` | heading: "Future Exploration: Declarative API" | 4 |
| `README.md:317` | "WebMCP is currently focused on the imperative `document.modelContext.registerTool()` API described above, which is what the specification defines." | 17 |
| `README.md:319` | "Early ideas are captured in the Declarative API Explainer, but it is not part of the specification at this time." | 20 |

That is the repository's own answer to this ticket's question, and it is consistent with every
`index.bs` measurement in §2.

## 6. WPT: a declarative test surface exists ahead of the spec

Fetched 2026-10-20 from the WPT `master` tree pages (embedded `"tree":{"items"…}` JSON) and
`raw.githubusercontent.com`. This is the sharpest nuance for the round-16 note: absence from the
spec does **not** mean absence of a declarative contract in the ecosystem.

| Fact | Value |
|---|---|
| Directory | `webmcp/declarative/` — 27 entries: 25 `.https.html` files (+ one `.headers`), `WEB_FEATURES.yml` |
| Feature name | `webmcp/declarative/WEB_FEATURES.yml`: `rules: - "**": [declarative-webmcp]` |
| Imperative sibling | `webmcp/imperative/` — 53 entries (incl. `resources/`, `WEB_FEATURES.yml` = `document-modelcontext`) |
| Suite spec pointer | `webmcp/META.yml`: `spec: hthttps://webmachinelearning.github.io/webmcp/` — observed literal `hthttps` typo, i.e. the suite's declared spec link is broken |
| Latest commit touching `webmcp/declarative` | `e61b072782cfcb8fe459849a86f3460efaa2dc9d`, committed 2026-10-16T22:18:42-07:00 (= 2026-10-17T05:18:42Z), "WebMCP: Keep a form's declarative tool in sync with its registration" — after the 2026-10-08 spec removal |
| Helper | `webmcp/resources/helpers.js:1` (12 words): "Wait for a declarative WebMCP tool to register with the specified name." |

Attributes actually exercised by the tests:

| File:line | Markup |
|---|---|
| `getTools-declarative-schema.https.html:10` | `<form toolname="search_tool" tooldescription="Search the web">`; inputs carry `toolparamdescription` (`:11-13`) |
| `toolchange-on-attribute-mutation.https.html:10` | `<form id="f1" toolname="my_tool" tooltitle="My Title" tooldescription="desc">` |
| `executeTool-no-autosubmit.https.html:9` | `<form id="no_auto_submit_form" toolname="no_auto_tool" tooldescription="No auto submit tool" …>`; asserts `form.matches(':tool-form-active')` (`:48`) |
| `executeTool-respondWith.https.html:9` | `<form id="spa_form" toolautosubmit toolname="spa_tool" …>`; `e.respondWith(...)` |

Two divergences worth recording (observed, not inferred):

1. **`tooltitle` exists in tests, not in the proposal.** `toolchange-on-attribute-mutation.https.html`
   sets `tooltitle="My Title"` and asserts `tool.title === 'My Title'`. `grep -c -i tooltitle
   declarative-api-explainer.md` → `0`; published spec/`index.bs` → `0`. So the test/implementation
   vocabulary is a superset of the explainer's.
2. **The pseudo-class contract is asserted in WPT while the explainer defers its definition to a
   spec that does not contain it**: `:tool-form-active` is asserted in
   `executeTool-no-autosubmit.https.html:48,57`, and the explainer says the definition "will be
   clarified in the specification" (`:143`).

Implication for the C2 note: declarative form tools are a **testing/prototyping surface** (WPT feature
`declarative-webmcp` + Chromium flags), not a specified one. WPT presence must not be written up as
spec conformance.

## 7. What this licenses for the C2 note and harness wording

Derivable now:

- "The CG draft defines only the imperative `document.modelContext` API; declarative form tools are
  not in the spec (removed 2026-10-08, PR #338) and are described only by a repo explainer."
- Exact attribute vocabulary to *observe* in the browser: `toolname`, `tooldescription`,
  `toolautosubmit`, `toolparamdescription`, and (per WPT) `tooltitle`.
- The explainer's own caveats: schema synthesis TBD, cross-document response under debate, and its
  pseudo-class definition deferred to a non-existent spec section.

Not derivable / must not be claimed:

- Any normative JSON-Schema synthesis rule (the explainer calls it TBD; issue #210 open). The harness
  must assert the **exact schema the running build emits**, not a schema derived from prose.
- That the spec entitles a page to declarative tools at all — it does not contain the word
  "declarative".
- That declarative attributes are "new as of this round": the proposal dates to 2026-03-09 (#76) and
  was in the spec as a TODO from 2026-03-02 to 2026-10-08.

Harness/fixture advice (advice only; not my write set): do not hard-code `tooldescription` semantics
from the explainer for edge cases; the explainer's autosubmit, response, and pseudo-class behaviours
are the least settled parts (`:114-119`, `:143`), while WPT treats `tooltitle` as real.

## 8. SOURCES row candidates (L1 writes rows; each opened this round)

Access date for all: **2026-10-20**. Method: `curl` (HTTP headers captured for the ED), `git clone
--no-tags` + pickaxe for history, `raw.githubusercontent.com` for repo files, GitHub HTML tree pages
for WPT listings, GitHub REST for commit/PR metadata before the unauthenticated rate limit tripped.

1. **S020 re-open (WebMCP ED)** — `https://webmachinelearning.github.io/webmcp/`.
   Anchor update: `CG-DRAFT` at `revision cb3d1696` (2026-10-20), superseding the row's
   `revision f14762e6` (2026-10-16); `index.bs` diff between them is one editor line.
   Quote (published §4.2, 19 words): "The ModelContext interface provides methods for web applications
   to register and manage tools that can be invoked by agents."
   Add to `teaches`: the draft's API surface is imperative-only; no declarative form attributes.
   Observed counts to cite: `grep -c -i declarativ` → `0` in both `index.bs`@HEAD and the ED.
2. **New row — WebMCP repo README, §Future Exploration: Declarative API** —
   `https://github.com/webmachinelearning/webmcp/blob/cb3d16964ab3e92cfd5f09901ed0504373a906e8/README.md#future-exploration-declarative-api`.
   Quote (`README.md:319`, 20 words): "Early ideas are captured in the Declarative API Explainer, but
   it is not part of the specification at this time."
3. **New row — declarative API explainer (proposal)** —
   `https://github.com/webmachinelearning/webmcp/blob/cb3d16964ab3e92cfd5f09901ed0504373a906e8/declarative-api-explainer.md`.
   Quote (`:24-26`, 16 words): "New attributes that augment `<form>`s and form-associated elements,
   that expose these as WebMCP tools to agents." Add caveat quote (`:108-110`, 19 words):
   "TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes
   like `step` and `min` are TBD." sha256 of file at HEAD: `4587c9f2…`.
4. **New row — removal commit / PR #338** —
   `https://github.com/webmachinelearning/webmcp/commit/14ae813cc4e9fe0d39313f4b1ee5b231746731ad`
   and `https://github.com/webmachinelearning/webmcp/pull/338` (merged 2026-10-08T11:26:24Z).
   Quote (PR body, 20 words): "The spec now focuses on the imperative `registerTool()` API.
   Declarative WebMCP is still being explored in the Declarative API Explainer."
   Why it matters: dates the spec/explainer split; prevents citing the ED as declarative authority.
5. **New row — WPT `webmcp/declarative/`** — `https://github.com/web-platform-tests/wpt/tree/master/webmcp/declarative`
   (listing; sample test `…/getTools-declarative-schema.https.html`; feature file `WEB_FEATURES.yml`).
   Quote (`webmcp/resources/helpers.js:1`, 12 words): "Wait for a declarative WebMCP tool to register
   with the specified name." Scope note: tests, not specification; latest dir commit `e61b0727`
   (2026-10-17); declared spec link in `webmcp/META.yml` is the literal typo
   `hthttps://webmachinelearning.github.io/webmcp/`.

Suggested verdicts: row 1 remains tier A / status `mined` (used-by the round-16 WebMCP note);
rows 2-4 tier A / `mined`; row 5 tier A but scope narrowed to "declarative behaviour as exercised by
WPT, not spec text" (or tier B if L1 treats test suites as secondary).

## 9. Confidence and remaining unknowns

- **High confidence (opened and measured this session):** the spec contains no declarative API or
  form attributes at `cb3d169`; the placeholder was added 2026-03-02 and removed 2026-10-08 by PR #338;
  the explainer's contents, attribute vocabulary, and TBD statements; README's "not part of the
  specification at this time"; the WPT declarative directory and its attribute usage including
  `tooltitle`.
- **Observed, cross-checked:** S020's `f14762e6` anchor predates HEAD by one editor-only commit and
  already had zero declarative text; published ED contains the editor added by `cb3d169`.
- **`[INFERENCE]`:** the fetched ED bytes are built from `cb3d169` or a byte-identical `index.bs`
  (evidence: editor line present, publish-on-push workflow, `Last-Modified` 74 s after commit; no
  commit stamp in page).
- **Not established here:** whether the CG intends to re-add declarative text (no open PR found:
  the only open PR matching "declarative" is #254, `outputSchema`); full text of issue #210 (GitHub
  REST hit the unauthenticated rate limit after the first calls; only its title/state/update time
  were observed via search); exact WPT commit history beyond the directory's newest commit; whether
  a policy prevents WPT declarative tests from being upstreamed to the spec repo.
- **Unrun:** browsers, CDP, harnesses, gates, selftests, counters — out of scope for this seat.

## 10. Commands and tooling

No installs or upgrades (nothing to record under the tooling directive). Used preinstalled `curl`,
`git`, `python3`, `grep`, `nl`, `sha256sum`.

Reproduction set:

```
curl -sS -D /tmp/webmcp_spec_hdrs.txt -o /tmp/webmcp_spec.html https://webmachinelearning.github.io/webmcp/
grep -c -i declarativ /tmp/webmcp_spec.html                       # 0
grep -o 'toolname=' /tmp/webmcp_spec.html | wc -l                 # 0
grep -o -i 'tooldescription' /tmp/webmcp_spec.html | wc -l        # 0
sha256sum /tmp/webmcp_spec.html                                   # 180c55ba…

rm -rf /tmp/webmcp-repo && git clone --no-tags https://github.com/webmachinelearning/webmcp.git /tmp/webmcp-repo
git -C /tmp/webmcp-repo rev-parse HEAD                            # cb3d16964ab3e…
git -C /tmp/webmcp-repo log -1 --format='%H %cI %s'
git -C /tmp/webmcp-repo log --oneline -S'declarative' -- index.bs
git -C /tmp/webmcp-repo log --oneline -S'tooldescription' -- index.bs   # (empty)
git -C /tmp/webmcp-repo show 14ae813 -- index.bs
git -C /tmp/webmcp-repo show 14ae813^:index.bs | grep -n -B2 -A12 'declarative-api'
git -C /tmp/webmcp-repo show f14762e6:index.bs | grep -c -i declarative  # 0
git -C /tmp/webmcp-repo diff --stat f14762e6..HEAD                  # index.bs | 1 +

curl -sS https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/declarative-api-explainer.md
curl -sS https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/README.md

curl -sSL https://github.com/web-platform-tests/wpt/tree/master/webmcp/declarative   # parsed embedded tree JSON
curl -sS  https://raw.githubusercontent.com/web-platform-tests/wpt/master/webmcp/declarative/WEB_FEATURES.yml
curl -sS  https://raw.githubusercontent.com/web-platform-tests/wpt/master/webmcp/resources/helpers.js
curl -sS  https://raw.githubusercontent.com/web-platform-tests/wpt/master/webmcp/declarative/getTools-declarative-schema.https.html
```

All fetched artifacts remain under `/tmp` (`webmcp_spec.html`, `webmcp_index.bs`,
`decl-explainer.md`, `README.md`, `webmcp-repo/`, `wpt_*.html`, `wpt_helpers.js`) and are not round
deliverables.
