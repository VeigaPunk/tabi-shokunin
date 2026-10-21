# ScribeFrontier — round 20, C1 source-only lifecycle frontier

Baseline: `c49929430d996b016dde2e3a3a5be380f3433fdb` (`git rev-parse HEAD` matches).
Scope: frontier and index draft only. Lane tree read-only; this report is the only write. No commit, no build, no test run.
Tools installed or updated: none.

## Verdict

The frontier draft is admissible once L1 applies two registry fixes (F1, F2 below). The C1 count itself cannot be checked from this tree: the lifecycle note, manifest and counter are absent.

## Checks run

| Check | Command or source | Result |
|---|---|---|
| Source bytes | `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` | `8c8d6796…8c36916`, matches S096 and S078 rows and `design.json` `source.sha256`. 1740 lines. |
| Decision spans | read `html_form_element.cc` at 181-221, 224-229, 249-258, 261-275, 290-327, 783-830 | All 12 spans land on the construct the design names. Each span matches its topic. |
| Note, manifest, counter | `_glob` and `ls` over main tree and `clones/ScribeLifecycle` | Absent: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `corpus/evidence/round-20/lifecycle/decisions.json`, `.ufo/waves/round-20/measure-c1.mjs`. Quote-within-span and C1 count are unverified. |
| Knowledge index | `ls corpus/knowledge/*.md \| wc -l`; set-diff against `corpus/README.md` `knowledge/*.md` tokens | 37 notes on disk; set-diff empty, so every note is mapped. No index gap. |
| Runtime non-autosubmit | grep `toolname` in round-17/18/19 harnesses and their fixtures | Every declarative runtime form is `toolautosubmit`: `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html:6`, `invoke-decl-nav.html:6`. Non-autosubmit forms exist only in round-16 fixtures (`round-16/webmcp/fixtures/declarative-form.html:6`, `lifecycle.html:6`), registration only. `webmcp-invocation-round-17.md:28` records no round-16 declarative-form invocation. |

## Findings for L1 / integration

**F1 — S096 row omits LC11's span (pointer defect).** `corpus/SOURCES.md:110` cites `html_form_element.cc:174-328,729-758,818-842`. LC11 is at 787-815, which falls in none of those ranges. S078 (`SOURCES.md:92`) cites `635-842` and does cover it. Fix: add 787-815, or 759-817, to the S096 range list. This is the QUALITY 28 "evidence pointer resolves" check.

**F2 — S078 row keeps a falsified premise with no supersession marker (QUALITY 33).** `SOURCES.md:92` still reads "navigation submission returns an empty string". The source at 827-829 is `base::ok(String())`, a null String, so the premise is wrong. The S078 row has no "superseded by S096" marker; the supersession appears only in S096's teaches cell and in prose at `webmcp-declarative-validation-round-19.md:129-131`. Fix: append an explicit superseded marker to S078. Do not silently rewrite the row. The round-19 note's "ordinary-empty-string reading" must not be cited as current.

**F3 — "runtime non-autosubmit untested" holds, and must stay scoped.** No harness or fixture in rounds 17-19 invokes a declarative tool without `toolautosubmit`. The draft must not say "autosubmit untested" in general.

**F4 — declarative runtime that exists must not be credited to LC04-LC12.** Round-17 holds, on Chromium 154, loopback, flags on, autosubmit only:
- `invoke-declarative-form` (`webmcp-invocation-round-17.md:55`; harness `scripts/webmcp-invoke-round17.mjs:1281-1306`): respondWith success returns Completed, no navigation. Covers LC05 with respondWith, and LC08 only indirectly.
- `invoke-declarative-navigation-result` (`:63`): an autosubmit navigation completes with the new document's result. Covers the navigation outcome only, not LC12's String-versus-JSON-null shape.
- Imperative `invoke-imperative-rejects` and `invoke-cancel` (`:52`, `:62`) exist, but they are imperative. They do not transfer to LC06 or LC10.

**F5 — index credit.** The assignment grants no note-count credit. If the lifecycle note lands as a new file, the knowledge count moves 37 to 38. QUALITY 11 then requires the snapshot date and the open gap in the same commit. Recommended placement: a deepening row under the round-19 declarative-validation ground, with the note count unchanged.

## Draft 12-row table (exact `skillRendering` shape, for the declared heading)

Heading: `### Declarative WebMCP completion lifecycle — source-scoped (round 20)`
Scope line: source-only, Chromium 154.0.8037.97 (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), not runtime-observed.

| ID | condition | outcome | source |
|---|---|---|---|
| LC01 | `toolautosubmit` attribute absent | require_submit_button becomes true | S096:181-186 |
| LC02 | FillFormControls returns an error | callback runs with that error before running state is set | S096:189-210 |
| LC03 | require_submit_button true and no submit button found | kMissingRequiredSubmitButton error returned | S096:249-258 |
| LC04 | success without `toolautosubmit` | submit button focused and PauseExecution called; no completion signalled | S096:212-218 |
| LC05 | success with `toolautosubmit` | PrepareForSubmission runs immediately with the submit button | S096:218-221 |
| LC06 | CancelTool called while running | CallDoneCallback with kToolCancelled error | S096:224-229 |
| LC07 | CallDoneCallback called | no-op with no pending callback; otherwise runs it and clears running, submit-button and invocation state | S096:261-275 |
| LC08 | response arrives after the tool stopped running | response ignored | S096:290-298 |
| LC09 | respondWith resolves to an object JSON.stringify cannot serialize | kToolInvocationFailed error; non-object values convert through ToString | S096:298-319 |
| LC10 | respondWith promise rejects | exception reported; kToolInvocationFailed "respondWith promise was rejected" | S096:320-327 |
| LC11 | preventDefault called, no respondWith, form not submitting | kToolInvocationFailed programming-error result | S096:787-815 |
| LC12 | navigation submit while tool running | CallDoneCallback with ok null String sentinel, not an empty string or JSON null | S096:818-830 |

## Draft frontier row (for `SKILL.md` and `corpus/README.md`, append-only)

| Frontier item | Current status | Pointer |
|---|---|---|
| Declarative completion lifecycle (round 20) | source-held, Chromium 154.0.8037.97, source-scoped (LC01-LC12). Runtime untested for: non-autosubmit path (LC01, LC03-LC04); declarative respondWith rejection and preventDefault-without-respondWith (LC10-LC11); stringify failure (LC09); declarative cancel (LC06); late response (LC08); navigation sentinel wire shape (LC12). Other Chromium builds untested. Runtime-held, autosubmit only (round 17): respondWith success returns Completed; autosubmit navigation completes with the new document's result. Imperative reject and cancel do not transfer. No note-count credit. | `### Declarative WebMCP completion lifecycle — source-scoped (round 20)`; S096; `webmcp-invocation-round-17.md:55,63` |

## Out of scope, not checked

- Quote-within-span and the C1 count (manifest and counter absent).
- Remote fetch of the Chromium source; the sha matches local bytes only.
- Chromium 152 and CfT 156 builds: untested, per `webmcp-chromium-loopback-round-16.md:122`.
- Historical note and lesson bytes: unchanged.
