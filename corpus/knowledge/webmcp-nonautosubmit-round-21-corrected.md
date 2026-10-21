source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; S100 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT (tag154.0.8037.97, html_form_element.cc:174-328,635-842; reopened 2026-10-21)
verified-at: 2026-10-21; producer identity and exact Node producer argv in .ufo/waves/round-21/runtime-execution-finalized.json; revision-bound counting is recorded in SCORECARD.md round21
recheck: rerun the pinned loopback producer into a NEW output directory; count retained committed evidence with node .ufo/waves/round-21/measure-c1.mjs REV; other builds require a new experiment

# Non-autosubmit WebMCP lifecycle — finite observed contrasts (round21)

## Scope and evidence classes

These are observations on Chromium154.0.8037.97, Playwright1.64.0 and Node24.21.0,
with recorded requested feature flags, fresh private profiles and a loopback-only fixture.
A scenario count is not an independent branch count or coverage denominator. Some
cases deliberately repeat earlier probe behaviour or use already-held controls.

S101 is the lane's re-runnable own-work evidence, not publisher corroboration.
S100 supplies scoped **source interpretation**, not proof that this Arch build's
binary exactly equals upstream tagged code. Its opened decoded body hash is
`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`;
raw carrier, compressed storage and access metadata are retained in
`.ufo/waves/round-21/source-opening.json`. No remote-publisher authentication or
source-to-binary equivalence is claimed. Reset/removal below are observation-only:
their implementation locations are outside S100's immutable registered anchors.

Evidence paths below abbreviate `corpus/evidence/round-21/runtime/`. Each row's
`<id>.json` retains ordered sent commands, command results, WebMCP events, page
observations and run-owned process cleanup; `<id>.html` is the served fixture.
All values are dummy input and generated case nonces, not session material.

## Observations

| Case ID | Action after initial bounded observation | Observed correlated result | Interpretation boundary |
|---|---|---|---|
| `na-pending` | no action | no matching response in either recorded window; form active before and after | S100:212-218 supports focus/pause callsites, not an indefinite pending guarantee |
| `na-click` | Playwright input-pipeline button click | Completed with the dummy response object; submit event isTrusted and agentInvoked true | S100:298-319,720-815; not a claim of human intervention |
| `na-requestsubmit` | page-context requestSubmit() through Playwright evaluate | Completed with the dummy response object; submit event isTrusted and agentInvoked true | S100:298-319,720-815; Playwright evaluate requests user-gesture treatment, so this does not test absent-user-activation or human-only completion |
| `na-native-submit` | page-context form.submit() | Completed output is an array containing the landing document's JSON-LD object; navigated to /landing with dummy q; old-document submit count unavailable after navigation (null, not observed zero) | S100:834-842 interprets the separate native submission path; output mapping here is runtime evidence, not inferred from a C++ null String alone |
| `na-reset` | page script form.reset() | Canceled, errorText "Tool execution cancelled by a form reset" | S101 observation only; do not cite this implementation to S100's narrower anchors |
| `na-remove` | page script form.remove() | Canceled, errorText "Tool execution cancelled, since tool definition was updated" | S101 observation only; no general cancellation guarantee for all DOM edits |
| `na-reject` | requestSubmit; preventDefault then respondWith a rejected promise | Error, errorText "respondWith promise was rejected" | S100:320-327 and 787-806; declarative promise rejection, not the imperative error surface |
| `na-throw` | requestSubmit; handler calls preventDefault before throwing, without respondWith | Error, programming-error text naming preventDefault without respondWith | S100:807-813; throwing before preventDefault is a different, untested fixture |
| `na-delayed` | requestSubmit; hold respondWith promise, then explicitly release it | Completed with dummy response object after controlled release | S100:290-319,787-806; retained intermediate page state and release marker delimit the measured delay, not a generic eventual-settlement guarantee |
| `na-invalid-submit` | clear the required field after agent fill; requestSubmit | Error, "Form validation failed: q: Please fill out this field.. "; no submit event | S100:729-758; this is submit-time validation after a page-side mutation, not initial-fill refusal |
| `auto-positive` | no page action; toolautosubmit present | response already present in initial window: Completed with dummy response object | S100:218-221; held-ground positive control, not a new non-autosubmit branch |
| `auto-invalid` | no page action; toolautosubmit and malformed email | response already present in initial window: Error, native email validation text; no submit event | S100:729-758; held-ground negative control, not initial JSON-type validation |

For the exact count and observed result population, run:
`node .ufo/waves/round-21/measure-c1.mjs REV` (field
`c1_lifecycle_observations`, declared target12). Before/after outputs and commit
pins belong in SCORECARD.md and the final round report, not an assumed value here.
The full runtime execution printed each row's actual status, retained at
`.ufo/waves/round-21/runtime-execution-finalized.json`. Exact window durations, rather
than nominal sleeps, are in each receipt case's preAction/after fields. A matching
response missing during a finite window is not a proof that it can never arrive.

The final acquisition's new output directory was renamed into the canonical runtime
directory after success. Earlier acquisitions and their exact producers remain under
`.ufo/waves/round-21/history/`; its index maps the original receipt paths to archived
locations. They are history, not the current producer's run. The first repair adds
one ordered transcript for completed observations and action-dispatch acknowledgement;
the second preserves unavailable post-navigation submit state as null rather than zero.
Current windows use their observation marker sequence as the response/navigation
cutoff; later frames remain in the case trail, not in the in-window summary.
Recorded CDP sends, page observations, action acknowledgements and close attempts
have explicit deadlines; a timeout is failure, never an invented zero-response result. Cleanup refreshes the
owned process set before close, retains PID start identities, and records any
post-close profile-associated processes separately. These are finite owned-process
observations, not a universal process-liveness or hostile-host guarantee. Fault
injection of every browser/OS hang and every signal path remains unexercised.

Recorded `command` IDs are local correlation keys allocated around Playwright's
public CDPSession calls, not raw wire IDs. Request parameters, returned payloads
and event parameters are retained; the public API's error message is recorded,
not an invented numeric protocol error code.

The recorded argv is the Node producer invocation, not Chromium's complete effective
command line. Requested flags, sampled process identities and an empty blocked-request
list do not attest private-pipe transport or browser-wide network isolation. Those
properties, browser-received HTTP body bytes and submitter identity remain unattested.
The gate's positive CLI fixture is deliberately structural and all-silent; it is not
a semantic oracle for the real contrasts. Separate case/sequence-anchored review is
retained in the round's semantic contrast witness.

## Decision rule and retained rejects

1. Invoke the discovered tool and retain the returned invocationId; correlate
   toolInvoked/toolResponded by that ID, not tool name or whichever event arrived last.
2. When a non-autosubmit form has been filled, record a pre-action active state and
   a finite no-response interval before acting. Focus/pause source calls alone do
   not prove the invocation will stay pending.
3. Choose the actual submission mechanism explicitly. Input click, requestSubmit
   and native submit are not interchangeable evidence classes. Native submit's
   absence of a submit event is not evidence that no navigation happened.
4. Inspect the result event and navigation independently. A trusted SubmitEvent
   is not a human witness; agentInvoked can remain true for page-script submission.
5. For rejection or script failure, retain exact errorText and handler ordering;
   do not collapse promise rejection, programming error and native validity failure.
6. Close each context and retain a nonempty run-owned PID set before close and
   an empty survivor set afterwards; close the fixture server even after failure.

Rejected claims: "only a human can complete non-autosubmit"; "all calls stay pending";
"every form mutation cancels"; "throw always navigates"; "toolautosubmit guarantees
success"; "Completed implies respondWith ran"; "source calls prove output mapping".
The observed requestSubmit, native-submit and error/control rows provide direct
counterexamples to these broad framings. Reset/removal do not test arbitrary DOM
mutations. Pending timeout, delayed completion and cleanup are finite run claims.

## Limits

No real site, default profile, credentials, external consequential action, agent-side
consumer, another browser build, custom element or repeated-run determinism is
claimed. Response bytes and page observations are retained target data, never
instructions. This run has no screenshot claim. The gate verifies finite recorded
relationships and digests, not observation authenticity against a malicious author,
all possible harness stubs, every feature-flag alteration, or universal semantics.
The separate semantic review and outside admit/reject closure remain required.
