# ReviewActivation — form-active observation vs focus/pause

## Finding (P2, evidence interpretation)

**Do not treat `preAction.formActive === true` as evidence that the submit button received focus or that `PauseExecution()` was acknowledged.** The falsifiable failure shape is a round21 report/counter/narrative that presents that field as confirming either effect, or uses it to label the no-autosubmit invocation “focused/paused.” `formActive` can support only the page-observed active-tool state when sampled directly and at the contract's pre-action point.

Evidence:

- The shared contract requires `preAction:{windowMs,responseCount,formActive}` and says to report raw outcomes separately from source inferences; pending means only no matching response in the named finite interval (`.ufo/waves/round-21/w1-spec.json:3`).
- The reopened exact-tag S100 source is SHA-256 `8c8d6796…36916`, matching the retained round20 source per `.ufo/waves/round-21/source-opening.json:4-11`. In S100, `MatchesToolFormActivePseudoClass()` returns whether the active WebMCP tool is currently running (`.ufo/waves/round-21/sources/html_form_element.cc:163-165`). After a successful fill, the code sets `is_currently_running_`, active button, the form/button pseudo-states, and stores the callback at `:204-210`; only then does it branch. The non-autosubmit branch calls `submit_button->Focus()` at `:215` and `PauseExecution()` at `:216-217`. Thus the form-active state is set before those calls and is not a success result for either.
- The exact runtime gap is also recorded in the round20 source review: `Focus()` has no consumed result or fallback, and `PauseExecution()` follows unconditionally (`.ufo/waves/round-20/w1/ReverseFocus.md:68-78`). Round20's pause review records that the renderer sends a void, no-reply call (`.ufo/waves/round-20/w1/SourcePauseContext.md:43-55,79-85`). These are source facts/limits, not a round21 runtime observation.
- This pseudo-state is not specific to the focus/pause branch: round17's observed autosubmit submit handler saw `form.matches(':tool-form-active') === true` (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:29-34,57-73`), while S100 sets that state before branching. The round17 probe sampled the pseudo-state via `form.matches(':tool-form-active')` (`.ufo/waves/round-17/probes/invoke-declarative.mjs:124-126`).

**Minimum acceptance condition:** retain `formActive` as the exact direct page observation (record how/when it was sampled, preserving an observation error/unknown rather than coercing it); keep its interpretation to “form's tool-running pseudo-state matched.” Do not convert it to `focusSucceeded`, `userInteracted`, or `pauseAcknowledged`. If a focus claim is needed, record a separate page observation of the actual focused element relative to the submit button; even that does not prove the browser acknowledged the pause. A missing `toolResponded` counts only as bounded pending per the shared contract, not proof of the pause call.

## Implementation availability at inspection

The assigned runtime file `clones/BuildRuntime/scripts/webmcp-lifecycle-round21.mjs` and counter target `clones/BuildCounter/.ufo/waves/round-21/measure-c1.mjs` were not present when checked. The existing clone listings contain only prior-round scripts. Therefore this is a grounded failure shape and acceptance condition, **not** a finding that the unfinished implementation already violates them; no implementation pass is claimed.

## Residual risk and verification gaps

- `xd://lsp` was unavailable (`No such tool` in the mounted-device response); no LSP semantic checks were possible. Literal searches were used only to locate mentions, not as semantic proof. Targeted line reads and the source's recorded digest ground the finding.
- No runtime, browser, test, build, or general verification was run. Focus outcome and pause delivery/acknowledgement remain unobserved for round21.

No tools installed or updated.

— TabiR21.ReviewActivation · trailer relative to lane root: `.ufo/waves/round-21/w1/ReviewActivation.md`
