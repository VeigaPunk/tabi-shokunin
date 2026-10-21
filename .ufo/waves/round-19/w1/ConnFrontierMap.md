# Declarative WebMCP runtime validation — expansion check

## Verdict

**Conditional yes: a new note can count as expansion, but only for measured declarative-form input-validation behavior not already held by the coverage map.** A note that only restates S071's Chromium-source analysis would not be expansion. At baseline, source-level declarative validation is held; runtime validation outcomes for declarative inputs are not. Count expansion only once a qualifying note is admitted on that uncovered runtime ground and its `source:` cites a mined `corpus/SOURCES.md` row.

## Evidence and current boundary

- `LEARNING.md:31-34` defines expansion as admitted knowledge on ground the coverage map did not hold, with each source citing a mined SOURCES row (including `own-work` rows); it requires a net new admitted entry on uncovered ground. A count or new file alone is insufficient.
- The round-16 note holds declarative form **registration/schema exposure**: `webmcp-chromium-loopback-round-16.md:59` records a declarative form producing a `toolsAdded` tool with derived `inputSchema`; its receipt scope is Chromium 154, flag-enabled, loopback (`:15-20`). That does not establish how submitted declarative inputs validate.
- The round-17 note holds **declarative-form invocation** (`webmcp-invocation-round-17.md:28-30,55`), but its `invoke-input-schema-mismatch` result (`:54,73`) was the imperative-tool case. `corpus/README.md:393` explicitly scopes the no-inputSchema-check observation to imperative tools and says declarative validation is source-evidenced.
- `SKILL.md:1994-1997` states that S071 traces declarative form inputs through `FillData`, which rejects unknown names and invalid supported values, then explicitly limits that to source evidence: it is “not a new runtime validation probe” and does not prove every declarative custom-control type validates.
- `corpus/SOURCES.md:85` already marks S071 mined and tier A, but describes source-level behavior, not a runtime receipt. It also explicitly says this is not a general JSON Schema validator. Thus S071 can ground the implementation mechanism, not substitute for observation of runtime cases.
- Round-19 `PLAN.md:18-28` independently declares C1 as runtime-verified declarative validation decision rows, starting at 0 (target ≥12), requiring passing receipt cases with observed CDP status/error text and new, dated primary-source rows (S077+). This is a planned acceptance contract, not evidence that any case has passed.

The apparent mismatch is resolved by scope, not by choosing one claim: the round-17 mismatch result is for an **imperative** tool, while S071's `FillData` path is **declarative** and currently source-read only. Existing evidence supports declarative registration and invocation, not runtime validation semantics.

## Axes and one bounded move

- **Coverage / expansion:** the declarative runtime-validation slice is not held in the map; measured case outcomes can add coverage.
- **Depth:** this is the round-19 C1 target (baseline 0 rows); case-bound decision rows deepen the existing Chromium-154 evidence.
- **Calibration risk:** no harm if source-derived expectations and observed runtime behavior are clearly separated and claims remain build/flag/origin/case scoped.

**Proposed move:** admit one new knowledge entry only after the committed round-19 receipt contains the relevant passing cases. Record individual decision rows tied to receipt case IDs and observed CDP/form-state outcomes; cite the new mined primary-source row(s) required by C1 and cite a mined own-work row for the retained runtime receipt if the receipt is represented as a source. Add a README coverage row explicitly scoped to those declarative input families and the exact Chromium 154.0.8037.97, enabled-flags, loopback environment. Cite S071 only for the source mechanism. Keep other controls, types, versions, origins, and standards claims outside the held scope.

## Wording that would overclaim

Avoid these unqualified formulations:

- “Chromium does not enforce `inputSchema`” — this generalizes the imperative-only round-17 mismatch case to declarative tools.
- “Chromium validates declarative inputs against `inputSchema`” or “all declarative inputs/custom controls are validated” — S071 is source-level, names only unknown parameters and invalid supported values, and disclaims a general JSON Schema validator; no new runtime result follows from it.
- “The WebMCP spec requires/defines declarative validation” — the round-16 source table (`webmcp-chromium-loopback-round-16.md:84-86`) marks declarative forms outside the spec; describe this as Chromium implementation behavior, not normative WebMCP behavior.
- “WebMCP declarative validation works” without build and conditions — current held runtime evidence is Chromium 154.0.8037.97 with flags on loopback; do not imply default/unflagged behavior, other versions, production sites, every control, or general interoperability.
- “An agent/MCP client validated or invoked it” — existing invocation evidence is harness-driven CDP, not agent-side consumption (`webmcp-invocation-round-17.md:77-79`).

Safe framing is: **runtime outcomes for the specifically tested declarative-form input cases on Chromium 154.0.8037.97, with WebMCP flags enabled on loopback**; list the observed cases rather than infer an all-input rule. Do not state an outcome here before the receipt establishes it.

## Verification and limitations

Inspected the canonical round-19 plan; `LEARNING.md`; the corpus coverage map and SOURCES registry; both `knowledge/webmcp-*.md` notes; and `SKILL.md:1950-2036`. The exact source-only correction is at `SKILL.md:1994-1997`; the coverage-map correction is at `corpus/README.md:393`; the existing S071 registry row is at `corpus/SOURCES.md:85`. No runtime validation, suite, or external fetch was run for this expansion check. Accordingly, this report establishes the coverage/admission boundary only; it does not claim round-19 cases passed or that expansion has already been admitted. No tool was installed or updated.

## Isolation

Connector report only; written to the assigned report path in LANE. No production files or domain source trees were edited, no clone/branch/commit was created, and no Git/JJ write or verification suite was run.