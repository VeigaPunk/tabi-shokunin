# SourceS083 — scoped source falsification at R

## Result

**Agree with keeping S083 as `spec / A / mined`, with a conditional-entailment caveat; agree with S094's rejection and do not flip it.** S083's fetched body and located quotation reproduce exactly. The lesson's quotation is **18 words, not 16**. A separate freshness-description inconsistency remains. Neither discrepancy changes the quoted normative predicate.

Axes: source fidelity, reproducible provenance, scope/entailment, read-only isolation. Access date throughout: **2026-10-21**.

Checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Read-only `git rev-parse --verify refs/heads/master` returned R. Scoped `git show R:<path>` reads confirmed that the inspected SOURCES, lesson and used-by note match their committed R bytes. No other queued source row was evaluated or mined.

## S083 — fetched bytes and quotation

- Exact registry URL, requested and final: <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html>.
- HTTP **200**; media type `text/html; charset=utf-8`; identity content encoding requested; no HTTP content encoding returned. Hashes below cover the decoded HTTP body, not reader Markdown or compressed artifact bytes.
- Decoded size: **466,321 bytes**.
- Decoded SHA-256: `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92`.
- **No drift:** both size/hash and every decoded byte match the source body committed at R in `corpus/evidence/round-19/sources/form-control-infrastructure.html.gz`.
- Page header, decoded line 16: Living Standard, last updated **20 October 2026**. HTTP Last-Modified: `Tue, 20 Oct 2026 12:58:32 GMT`. This is a rolling document, not a Chromium-tag-pinned implementation file.
- Required retained body: `.ufo/waves/round-19/w2/SourceS083.body.gz` (**61,276 compressed bytes**, deterministic gzip with mtime 0).

Located quote, verbatim after removing HTML tags and collapsing line-break whitespace:

> its value was last changed by a user edit (as opposed to a change made by a script)

**18 whitespace-delimited words.** Location: decoded body **325–326**, §4.10.19.3, [maxlength constraint](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#limiting-user-input-length:-the-maxlength-attribute). URL/access/hash are those immediately above. This is the exact quotation at `corpus/lessons/round-19.md:39`; its text, location and hash are correct, but its parenthetical count says 16. It still satisfies the lesson's ≤25-word limit.

The same user-edit condition occurs at decoded **370–371**, §4.10.19.4, [minlength constraint](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#setting-minimum-input-length-requirements:-the-minlength-attribute). The complete too-short paragraph is **368–374**; the registry's 368–372 range contains the relevant condition but not the final too-short conclusion.

## Scope, classification and entailment

Observed registry contract: `corpus/SOURCES.md:97` has type **spec**, tier **A**, status **mined**, opened **2026-10-21**, recheck **on-release**, used-by **`corpus/knowledge/webmcp-declarative-validation-round-19.md`**.

- **Agree, type/tier:** these are primary normative WHATWG HTML algorithms, not a WebMCP proposal and not Chromium implementation evidence.
- **Agree, used-by/status:** the named note exists, identifies S083 and the matching retained-body hash at line 5, and applies the condition at lines 62–65. `SKILL.md:2078` and `validation/decisions.json:470–494` also use it for DV-19. That decision binds the correct hash, lines 323–327 and a token present in those lines.
- **Direct normative support:** too-long requires an applicable maximum, a true dirty-value flag, a last change by user editing, and an over-limit API-value length. Too-short additionally requires a nonempty value and an under-limit API-value length. Thus a value last changed by script does not meet these specific user-edit predicates. This is not a blanket exemption from other form constraints.
- **Conditional, not direct entailment:** S083 does **not** establish that every agent action changes the value as a script would. It does not specify WebMCP's fill path, perform schema validation, or demonstrate Chromium 154 behavior. The registry's teaches phrase joining script and agent fills is supportable only with that separate build-specific premise; interpreted as a universal fact about all agents, it exceeds this source. An automated user-like edit is not established here to be a script edit.
- **Existing evidence, not a new runtime result:** R's receipt records `decl-text-constraints-02` (`AB`), `-03` (`ABCDEF`), and success control `-04` (`ABCD`) as Completed, unchanged, one submit, `pass: true` (`receipt.json:4058–4235`). The recorded identity is Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. This supports the note's explicitly build-bounded examples; I did not rerun them or independently trace the Blink setter. The source alone must not receive credit for proving the runtime behavior.
- **Freshness caveat:** used-by note line 9 includes S083 inside an on-release/tag-pinned range, then separately calls S082/S083 Living Standard 180d. The actual URL and body are rolling, and the registry says on-release. The tag-pinned description is false for S083; no byte drift was observed today.

### Submission branch: definitions and caller chain

The registered page directly supplies the submission algorithm: **2643–2645** define the optional submitted-from-method boolean with default false; **2649–2664** guard validation on that boolean being false and the submitter's no-validate state being false; a negative result returns before the submit event at **2665–2672**. Interactive validation at **2294–2312** consumes static validation at **2268–2290**. No-validate state is defined at **590–594**. These are normative HTML semantics, not evidence that WebMCP uses a particular caller.

To resolve the row's requestSubmit/submit distinction, I followed the existing dossier's linked method-definition page, **not another SOURCES row**:

- Exact requested/final URL: <https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit>; HTTP **200**, accessed **2026-10-21**.
- Decoded size **192,872 bytes**; SHA-256 `10c102a442621c52863729076315f89ba1651318b143eb289a821afde8914b18`.
- Retained `.ufo/waves/round-19/w2/SourceS083.forms.body.gz` (**24,792 compressed bytes**).
- `HTMLFormElement.submit()` definition at **854–856** calls the submission algorithm with the boolean true. `requestSubmit(submitter)` at **860–870** validates its submitter and calls the same algorithm without overriding the default. This closes the normative definition→caller→validation-branch chain. It does not close WebMCP→HTML-caller wiring, which is outside S083's stated scope. No companion immutable checksum was claimed or tested.

## S094 — rejection and flip condition

- Exact requested/final URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>.
- Access **2026-10-21**; observed HTTP **404**, `text/plain; charset=utf-8`; decoded size **233 bytes**.
- First-line quote: **“NOT_FOUND: Requested entity was not found”** (**6 words**), decoded line **1**.
- Newly fetched decoded SHA-256: `d1a60fa9afc13a451cdb0015f0a0c6c0eeb1c69a408038afb40e79b233be760b`.
- R's retained response also has 233 bytes and SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. Comparing the decoded bodies finds **only line 7's per-request request_id changed**. The hash drift is response-diagnostic variability, not recovered source or a reason to reject the recorded historical hash.
- Current response retained as `.ufo/waves/round-19/w2/SourceS083.404.body.gz` (**183 compressed bytes**).

**Agree with rejection; no flip now.** This exact attempted tag/path still supplies no test source or located implementation quote. A flip requires a resolvable relevant source with an authenticated body and located quote; for S094 unchanged in scope, that must be this exact tag/path. Finding a different test filename requires explicit replacement/rescoping and its own checked evidence, not silently treating a lead as proof that this URL exists. No lead or other queued row was opened for that purpose.

## Method, confidence and remaining gaps

High confidence in HTTP statuses, byte identities, quotation/count, normative predicates, method-call chain, registry classification and used-by linkage. The broader agent-fill conclusion remains conditional on separate implementation/runtime evidence; no claim of all-agent or all-build conformance is made.

`read xd://lsp` returned **No such tool** and enumerated mounted devices without LSP. Consequently no semantic-server definition/reference result exists; literal search was used only to locate sections, followed by direct primary-text and committed-record reads. Empty compressed-file search results were not treated as semantic absence. No tests, builds, browser runs, installations, package updates or background jobs were performed. No production file or SOURCES row was modified.

## Isolation

- Clone: none; source-only audit, no runtime/mutation probe or production writer.
- Branch: none; no git writes.
- Read checkpoint/base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Commit: none; advisory report and public-source retention only.
- Seat-owned changed paths only: `.ufo/waves/round-19/w2/SourceS083.md`, `.ufo/waves/round-19/w2/SourceS083.body.gz`, `.ufo/waves/round-19/w2/SourceS083.forms.body.gz`, `.ufo/waves/round-19/w2/SourceS083.404.body.gz`.
