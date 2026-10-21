# Playwright action evidence classes for round 21

**Axes:** official/versioned source coverage; fidelity of the action-class distinction; scope discipline (finite observations only); unsupported-claim boundary.

## Observed in official Playwright documentation

- At access date 2026-10-21, the official release-notes page's leading section is **Version 1.64**. The API and guide URLs below are the official `stable` documentation URLs, not immutable versioned paths; I use the visible 1.64 release-note heading to anchor the version. The v1.64 notes list Chromium 156, while the round21 runtime contract names Chromium 154. Do not use these docs to infer behavior of that different browser build.
- The Locator API's `locator.click()` details specify actionability checks (unless forced), scrolling when needed, a `page.mouse` click, and waiting for initiated navigation unless opted out. Exact quote: “Use page.mouse to click in the center of the element, or the specified position.”
- The `page.evaluate()` API says its function is “Function to be evaluated in the page context.” The official evaluating guide distinguishes Playwright scripts from page scripts; `evaluate` runs the supplied JavaScript in the page environment. The Locator API separately calls `dispatchEvent()` a programmatic event dispatch and says its click example is equivalent to `element.click()`; that is a third method, not `locator.click()`.
- The opened official Playwright action, evaluation, and Locator API sections do not define `HTMLFormElement.requestSubmit()` or its validation/submission semantics. The official-doc search for `requestSubmit` did not return a Playwright docs result.

## Round21 constraint (inference from those docs + the supplied case contract)

Keep `na-click` (`locator.click()`) and `na-requestsubmit` (`page.evaluate(() => form.requestSubmit())`) as separately labelled actions/evidence classes: the former is Playwright's actionability/`page.mouse` path; the latter is a JavaScript invocation evaluated in the page context. Do not relabel either as the other, or describe script submission as human-only or the click as proven human-equivalent. In particular, the click API may wait for actionability and initiated navigation before its promise completes, so preserve the run's explicit action/invocation boundary when interpreting finite pre-action and post-action windows. Report only the observed correlated events and named-window counts; documentation is not an outcome prediction.

## One unsupported overclaim

**Not supported by these Playwright docs:** “Calling `form.requestSubmit()` through `page.evaluate()` has the same form-submission semantics as `locator.click()` on a submit button.” The docs establish where `evaluate` executes and what `locator.click()` does, but do not specify `requestSubmit` semantics or prove equivalence between those actions.

## Source record

1. Playwright, [Release notes — Version 1.64](https://playwright.dev/docs/release-notes#version-164), location: top `Version 1.64` section; accessed 2026-10-21.
2. Playwright, [Locator API — `locator.click()`](https://playwright.dev/docs/api/class-locator#locator-click), location: `Details`, step 3 (quote above) and step 4; accessed 2026-10-21.
3. Playwright, [Page API — `page.evaluate()`](https://playwright.dev/docs/api/class-page#page-evaluate-option-expression), location: `pageFunction` argument; accessed 2026-10-21.
4. Playwright, [Evaluating JavaScript](https://playwright.dev/docs/evaluating#different-environments), location: `Different environments`; and [Locator API — `locator.dispatchEvent()`](https://playwright.dev/docs/api/class-locator#locator-dispatch-event), location: `Details`; accessed 2026-10-21.
