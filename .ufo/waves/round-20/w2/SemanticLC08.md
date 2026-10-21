# SemanticLC08 — LC08 predicate/effect falsification (round 20 w2)

Seat: TabiR20.SemanticLC08 (leaf, no subagents). Targets: `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `SKILL.md`, against retained `corpus/evidence/round-20/sources/html_form_element.cc` at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`.

Godspeed axes named: (1) entailment fidelity of LC08's condition/outcome vs the retained bytes, (2) span/line-number hygiene, (3) three-artifact rendering parity, (4) scope honesty (source-only, no capability claim). Moves kept: grep-anchored line verification, callsite chase inside the anchor, digest/revision identity checks; all improved an axis and harmed none. No tools installed (none needed).

## Identity and revision checks (all pass)

- `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` → `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` = manifest `source.sha256`.
- `git rev-parse HEAD` → `4ae99816b8994fdedc159156d8d9d242dd5c4782`; `git status --porcelain` over the three attack targets + retained source → empty. All findings below are against the checkpoint bytes.

## Verdicts

| Artifact (LC08 row) | Verdict |
|---|---|
| `decisions.json` LC08 (span 290-298, quote `if (!tool->CurrentlyRunning()) {`) | **ENTAILED** |
| `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` table row + failure checklist item 8 | **ENTAILED** |
| `SKILL.md:2224` rendering `| LC08 | … | S096:290-298 |` under `### Declarative WebMCP completion lifecycle — source-scoped (round 20)` | **ENTAILED** |

No REWRITE, NOT-ENTAILED, or UNRESOLVED findings. No semantic fields summed.

## Evidence

**Span and quote hygiene (decisions.json).** Grep-anchored lines: 290 `void HTMLFormElement::HandleWebMcpToolResponse(HTMLFormMcpTool* tool,` · 291-293 params `(bool resolved, ScriptState*, ScriptValue)` · 294 `CHECK(tool);` · 295 the quoted guard · 296 `return;` · 297 `}` · 298 `if (resolved) {`. Span 290-298 brackets the complete branch; `endLine: 298` is the shared boundary opening LC09's branch — the manifest's established convention (LC04/LC05 share 218). Quote is a literal substring of line 295, 3 whitespace words ≤ 25, inside the span. No line drift: cross-checked neighbors land too (`invocation_id_ = invocation_id;` at 178 as LC02's cross-ref states; LC01's quote at 182 ∈ [181,186]).

**Callsite vs actual effect.** Sole caller is the respondWith promise wiring inside the declared 635-842 anchor (~790-806): `submit_event->TakeRespondWithPromise()` → `std::move(*promise).Then(BindOnce(&HTMLFormElement::HandleWebMcpToolResponse, …, /*resolved=*/true), BindOnce(…, /*resolved=*/false))` (refs at 799 and 803; grep shows no other caller). The function is both arms of a `Then` on the respondWith promise, so the condition's "receives a settlement" is grounded in-source, not imported terminology. The comment at ~781-786 names exactly LC08's scenario: "if the form gets unregistered as a tool asynchronously before `promise` fulfills, then `HandleWebMcpToolResponse()` will handle this appropriately." The LC11 sibling (`else if (!should_submit)` → programming-error `CallDoneCallback`) registers no `Then`, so a no-promise path never delivers a settlement — LC08's premise genuinely excludes LC11; the rows do not overlap.

**Entry-time predicate.** The guard is evaluated per settlement at reaction entry, not at ExecuteTool entry — LC08 states it at settlement time (correctly, unlike LC03/LC04/LC05 which explicitly say "entry-time"). `CHECK(tool);` at 294 precedes the guard: a null tool CHECK-fails rather than being ignored, but LC08's condition presupposes "a tool" (the callsite passes a persistent `executing_tool.Get()`), so this is an entry-order fact, not a defect.

**Callback/null guard.** The branch is exactly `return;` — no `CallDoneCallback`, no `done_callback_` use, no state mutation. LC07's null-callback guard is not implicated: when the tool is not running, its callback was already consumed by a prior `CallDoneCallback` (LC06/LC07/LC12 producers), so no double settlement is possible via this path. "The settlement is ignored: the function returns without calling the done callback" is the complete effect inventory of lines 294-297 — no overclaim, no omitted effect claim.

**Sample limits and parity.** Note failure-checklist item 8 ("Settlement after the tool stopped running (LC08): ignored; no second callback") matches the row; the note honestly records that no runtime witness is supplied for LC08 and makes no capability claim. The three artifacts carry byte-identical LC08 condition/outcome/anchor text; `S096` resolves correctly via `manifest.source.id` (LC08 has no per-row `sourceId`, unlike LC11's S100); no pipe inside cells.

## Findings by severity

- **Defects: none.** Every claimed predicate, effect, span, quote, and anchor for LC08 checks out against the retained bytes at the pinned revision.
- **Minor (no action required):** on the not-running exit, a *rejected* settlement is dropped without `V8ScriptRunner::ReportException` (contrast LC10). The row's "ignored" already covers this; recording it as the only asymmetry between the two arms observed inside the branch.

## Residual risk and verification gaps

- `HTMLFormMcpTool::CurrentlyRunning()` is defined in the header, outside the retained body. The row quotes the guard itself and all six in-anchor uses (164, 169, 722, 788, 825, 839) treat it as the running-state predicate; its definition is unverified from the anchor. Low risk.
- How a tool stops running between `Then` registration (~799) and settlement is shown only by the source comment (async unregistration); the mechanism's code is outside the anchor and nothing in LC08 claims it.
- Source-only scope maintained: no runtime reproduction, no exploit probing; unrelated race leads left unverified and out of scope per assignment. Untested claims stay untested — no runtime witness for LC08 exists in this round, and none is claimed.

No tool installs or updates were performed (reason: grep/read/sha256/git read-only sufficed).
