# SourceS084 — bounded source reopening at R

## Finding

**S084's scoped teaching holds; the lesson's 13-word quote is exact.** The historical HTML digest is authentic to the retained wave-1 body, but the live response has presentation-layer byte drift. The commit-pinned XML is unchanged. **Agree with S094's HTTP404 rejection; its conditional flip has not occurred.** No registry edits or mining/status transitions were made.

- Checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Read-only `git show` supplied the checkpoint registry/lesson; the authoritative `refs/heads/master` lookup also returned R.
- Access date for every remote observation below: **2026-10-21**.
- Axes: **source identity/byte integrity; located semantic entailment; curation and implementation-boundary precision**.
- Scope: only S084, its cited immutable source identity, and the explicitly requested S094 rejection. No other queued source or alternative test-file lead was fetched/mined.

## Exact fetch identities and retention

All sizes and SHA-256 values below describe HTTP content-decoded response bodies, not gzip artifacts. The independent captures requested `Accept-Encoding: identity`; the responses used identity encoding. Canonical requests retained their exact URLs without redirection.

| Key | Exact URL | HTTP | Decoded bytes | Decoded SHA-256 |
|---|---|---:|---:|---|
| H — S084 served HTML | https://json-schema.org/draft/2020-12/json-schema-validation | 200 | 169,790 | `08f97c234867e92252ffc06274e93aea68b2caeaae103b8954f0133ca4e8dc03` |
| X — commit-pinned source | https://raw.githubusercontent.com/json-schema-org/json-schema-spec/add836e705c9a07434c467b6b90946ba45258a73/jsonschema-validation.xml | 200 | 82,430 | `dcba094c316c17922cb95cc36affc53b9d9521139bfd5a3afdd1cc810ab39773` |
| T — cited tag resolution | https://api.github.com/repos/json-schema-org/json-schema-spec/git/ref/tags/draft-bhutton-json-schema-validation-01 | 200 | 483 | `0affdbf6dbe8432cb87845204df59652b594311805f9d747643883acfcf4ab31` |
| N — S094 failed lookup | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT | 404 | 233 | `07c53986bedc3f06df7f0bb7c8d10740f30b2de7540c20b0d4ea5316167b5f7a` |

T resolves `refs/tags/draft-bhutton-json-schema-validation-01` directly to a **commit**, `add836e705c9a07434c467b6b90946ba45258a73`. X's size/digest exactly match the wave-1 source provenance at `.ufo/waves/round-19/w1/SrcJsonSchemaValidation.md:27`.

Retained beneath `.ufo/waves/round-19/w2/`:

- **`SourceS084.body.gz`** — exact H body; gzip size 33,264 bytes; gzip SHA-256 `685d5464474f1a0742c3a89770001e646698dcc28821a3094c3744d1fc1bdfc6`.
- `SourceS084.xml.gz` — X.
- `SourceS084.tag.json.gz` — T.
- `SourceS084.S094.body.gz` — N, kept under this seat's artifact prefix.
- `SourceS084.fetch.json` — URL/status/size/hash metadata and capture timestamps.

### HTML drift is observed, not assumed immutability failure

The retained wave-1 `SrcJsonSchemaValidation.body.gz` decompresses to **169,423 bytes / 3,184 lines**, SHA-256 `bc982a03be9ba4e7da597a0f10dc00614aa28dc413e6981186405473981fd267`, exactly the digest in `corpus/SOURCES.md:98` and `corpus/lessons/round-19.md:40`. H is **367 bytes larger / 3,185 lines**.

A complete line diff found only three changed Cloudflare email-obfuscation wrapper lines (3149–3166) and an added Cloudflare beacon script after line 3182. Lines 1–3148 are byte-identical, including every clause cited here and the lesson's line 2051. No source text changed in that diff. The injected script was not executed and its URL was not fetched. Thus **agree with the recorded digest as historical capture identity; disagree with treating the served HTML as byte-immutable merely because its URL is versioned**. The pinned XML supplies unchanged source identity without claiming proof of the site's deployment build.

## Located quote and entailment

`corpus/lessons/round-19.md:40` records:

> The value of format MUST be collected as an annotation, if the implementation

**13 whitespace-delimited words**, exactly present in H at decoded HTML **line 2051**, §7.2.1, paragraph `#section-7.2.1-1`. The sentence continues on line 2052; its condition must not be dropped when teaching the rule.

All quotations in the following table are from **H**, accessed **2026-10-21**, decoded SHA-256 **`08f97c234867e92252ffc06274e93aea68b2caeaae103b8954f0133ca4e8dc03`**. URLs use the exact fetched source plus section fragments; quotes spanning lines join only source whitespace, without changing words. Each quote is ≤25 words.

| Proposition | Located quote; word count | Exact section / decoded HTML lines | Source-vs-teaches result |
|---|---|---|---|
| Validation vocabulary assertions | “These keywords are all assertions without any annotation behavior.” — 9 | [§6](https://json-schema.org/draft/2020-12/json-schema-validation#section-6-1), 1670 | Supports classifying the listed validation keywords as assertions rather than annotations. |
| `type` | “its type matches the type represented by the value of the string.” — 12 | [§6.1.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.1.1-3), 1697–1701 | Supports type matching; a type array permits any listed type. It does not specify Chromium coercion. |
| `enum` | “equal to one of the elements in this keyword's array value.” — 11 | [§6.1.2](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.1.2-2), 1712–1713 | Supports instance-value equality, not merely a suggested-options list. |
| `maximum` | “less than or exactly equal to "maximum".” — 7 | [§6.2.2](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.2-2), 1756–1757 | Inclusive upper bound for numeric instances; it is not an HTML-control submission rule. |
| `minimum` | “greater than or exactly equal to "minimum".” — 7 | [§6.2.4](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.4-2), 1778–1779 | Inclusive lower bound for numeric instances; this keyword alone is not a type assertion. |
| `required` | “An object instance is valid against this keyword if every item in the array is the name of a property in the instance.” — 23 | [§6.5.3](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.5.3-2), 1963–1964 | Presence of object properties, not HTML required-control validity, nonempty text, or truthiness. |
| Annotation collection condition | “The value of format MUST be collected as an annotation, if the implementation supports annotation collection.” — 16 | [§7.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-7.2.1-1), 2051–2052 | The full sentence entails conditional annotation collection. The lesson's shorter quote is accurate but incomplete alone. |
| Annotation-mode validation default | “The implementation MUST provide options to enable and disable such evaluation and MUST be disabled by default.” — 17 | [§7.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-7.2.1-2), 2057–2058 | Assertion-like checking may also be enabled under Format-Annotation; it is disabled by default and is not equivalent to full Format-Assertion support. |
| Separate optional vocabulary | “Implementing support for the Format-Assertion vocabulary is OPTIONAL.” — 8 | [§7.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-7.1-4), 2034 | Directly supports S084's separate-optional-vocabulary statement. |
| Assertion vocabulary, once supported | “MUST evaluate "format" as an assertion;” — 6 | [§7.2.2](https://json-schema.org/draft/2020-12/json-schema-validation#section-7.2.2-3.2), 2105 | Optional implementation support does not make assertion behavior optional after selecting that supported vocabulary. |

**Entailment conclusion: agree**, with two precision limits. First, S084's separate optional vocabulary is not the *only* way an implementation may offer format checks: §7.2.1 also permits configurable, default-off checks. Second, declaring Format-Assertion true requires full support for the defined formats or refusal to process the schema (H:2093–2096); unknown format names fail under that vocabulary (H:2148–2152). Neither qualification contradicts the row's scoped summary.

The complete annotation sentence is independently present in **X:579–580**, and the default-off clause at **X:586–587**; optional vocabulary support is at **X:563**. X's exact URL and digest are recorded above. This is an independent immutable source cross-check, not a claim that rendered HTML bytes are immutable.

## Scope, tier, status and callers

Observed checkpoint cells at `corpus/SOURCES.md:98`:

- `kind=spec`, `tier=A`.
- Scope: **2020-12 Validation and format-vocabulary semantics only; not implementation conformance**.
- `status=queued`, `opened=2026-10-21`, `recheck=on-release`, `used-by=—`.

**Scope/tier agree.** H identifies itself at lines 1210–1219 as Internet-Draft `draft-bhutton-json-schema-validation-01`, published 16 June 2022, intended Informational, expiring 18 December 2022. A primary source is authoritative for that draft's own vocabulary rules; this is not a shipped Chromium implementation, current implementation-conformance certification, or a W3C standard. S084 expressly excludes those claims.

**Status/used-by are confirmed as queued/—, not mined.** Literal citation searches found S084 in the round-19 lesson's source-opening Gate and its wave-1 dossier, but no S084/canonical-URL/format-annotation consumer in `SKILL.md`, `corpus/knowledge/`, `corpus/evidence/round-19/`, or the C1 counter. The Gate opening record must not be presented as an admitted knowledge dependency or runtime decision. No mined status, used-by path, or coverage credit was inferred from this reopening. The registry contract at `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:36–41` permits knowledge **or lesson** paths in used-by; if the L1 elects to count the Gate citation as substantive mining, the actual path is `corpus/lessons/round-19.md`, and a queued→mined/—→path change must be explicitly logged rather than silently assumed. At R it has not happened.

LSP limitation: `read xd://lsp` returned **“No such tool”**; no answering server/device was available. Literal searches are reported only as citation inventory, not semantic symbol-resolution proof. No Chromium definitions/callers were attributed to this JSON Schema source. Establishing browser implementation behavior would require implementation evidence and runtime observations outside S084's scope; this seat did not mine those other queued rows.

## S094 rejection and flip

**Agree with rejection, narrowly at the exact attempted path/tag.** N returned HTTP **404**, with its first line:

> NOT_FOUND: Requested entity was not found

**6 words**, decoded response **line 1**; exact N URL, access date **2026-10-21**, decoded SHA-256 **`07c53986bedc3f06df7f0bb7c8d10740f30b2de7540c20b0d4ea5316167b5f7a`**.

The checkpoint-retained `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` decompresses to **233 bytes**, SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`, matching `corpus/SOURCES.md:108` and lesson:51. The entire fresh-vs-retained diff is the per-request `request_id` on line 7; the error text/status did not change. Digest drift is therefore not evidence the failed path became available.

**Agree with the stated conditional flip as an admission criterion:** a resolvable, revision-pinned test source with a quote located in that test file would supply usable test evidence. **Not triggered here.** Resolving a differently named test would not make the failed exact URL exist, and would require its own correctly scoped source record; it cannot silently rewrite S094's identity. No alternative test-file lead was opened. This 404 does not establish the absence of all form/schema tests.

## Exercised work and remaining unknowns

- Exercised: static official-URL HTTP fetches, decoded hashes/sizes, retained-body diffs, quote/count/location checks, GitHub tag resolution, and bounded literal citation searches.
- Not exercised: browser/CDP invocation, mutation probes, build/lint/test suites, or any conformance implementation. No package/tool installation or update; no processes left running.
- Remaining limits: the site's exact HTML deployment build was not authenticated; the pinned XML and served clauses agree, but a matching text/digest is not deployment provenance. Queued-to-mined policy treatment of a source-opening Gate is not silently resolved as a production transition by this report. No broader test-file absence or Chromium behavior claim follows.
- Tool issue recorded: ranged `read` on the valid gzip body returned “empty archive directory”; exact captured text was instead materialized in disposable `/tmp` files through `write`, then searched/read there. No fetched content was executed.

## Isolation

- Clone path: **none** — read-only source reopening; no runtime/mutation probe or production work required a sandbox clone.
- Branch: none.
- Base: attacked checkpoint R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Commit: none — no production changes or clone commit.
- Changed LANE paths: only `.ufo/waves/round-19/w2/SourceS084.md`, `SourceS084.body.gz`, `SourceS084.xml.gz`, `SourceS084.tag.json.gz`, `SourceS084.S094.body.gz`, and `SourceS084.fetch.json` under that same directory.
- No SOURCES/shared production edits, git writes, browser/profile access, domain-source mutations, delegation, background jobs, or orchestration runtime.
