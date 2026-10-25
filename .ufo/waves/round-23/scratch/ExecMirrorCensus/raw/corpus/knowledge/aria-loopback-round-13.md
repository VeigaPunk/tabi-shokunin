source: S023 https://playwright.dev/docs/locators — Locating elements, Locate by role, Locate by label, Strictness; S024 https://playwright.dev/docs/aria-snapshots — Aria snapshots, Partial matching, Strict matching; S025 https://www.w3.org/WAI/ARIA/apg/ — Home introduction (authoring scope only); scripts/aria-loopback-round13.mjs; corpus/evidence/round-13/aria/receipt.json
verified-at: 2026-10-20 — primary sources reopened this round; the committed runtime receipt records the actual execution time, pinned package/browser identities, per-case results and cleanup rather than inheriting a documentation date
recheck: on package/browser/fixture/template change — in an isolated checkout run node scripts/aria-loopback-round13.mjs; preserve the committed original evidence, inspect the new full receipt/actual YAML/failure causes/cleanup, and never update templates merely to turn a failure green

# Isolated accessible-selector and ARIA-template experiment

## Scope and authoritative outcome

This entry is the executable evidence contract for one loopback experiment, not a prediction that its assertions pass. The actual observed result is `corpus/evidence/round-13/aria/receipt.json`; admission requires its `verdict` to be `pass`, all declared cases to have run, and its independently retained execution command to exit0. `corpus/lessons/round-13.md` records the admission decision. The file's existence, test names and expected values are not runtime evidence.

The runtime is scoped to the versions and executable digest in `corpus/evidence/round-13/aria/runtime-pin.json`: Playwright Test/playwright/playwright-core1.64.0 and managed Chrome for Testing156.0.8078.4, cache revision1248. This is recorded and digest-checked, not a claim that the global installation cannot change. Local dependencies can be restored from the exact npm lock with `npm ci` in that evidence directory; no browser download is part of the experiment.

## Reproduce and inspect

From the lane root:

```sh
node scripts/aria-loopback-round13.mjs
node -e 'const r=require("./corpus/evidence/round-13/aria/receipt.json"); console.log(JSON.stringify({verdict:r.verdict,runtime:r.runtime,cases:r.summary.cases,negative:r.summary.negative,cleanup:r.cleanup},null,2))'
```

The entry launches the genuine Playwright Test runner, not a bare-node matcher substitute. `toMatchAriaSnapshot` requires the runner's test context. The committed configuration disables retries, snapshot updates, snapshot ignoring and parallel workers, and supplies no global children-mode override. Assertions read exact committed nonempty templates. The package, browser digest, input digests and observed runtime configuration are checked before claims are accepted.

Expected case inventory and its counting command: `node -e 'const m=require("./corpus/evidence/round-13/aria/manifest.json"); console.log(m.cases.length)'` — eight declared cases. Actual executed/passed/failed counts come only from the receipt.

| Case | Witness and falsifier |
|---|---|
| role-name | Unique role+accessible-name locator acts on the intended button and checks its resulting state. |
| label-fill | Associated-label locator fills the control and checks its actual value. |
| duplicate-strict | Ambiguous single-target action rejects with Playwright's strict-mode error; no unexplained `.first()` bypass. |
| re-resolve | A stale element handle is detached after replacement while the same locator resolves and acts on the distinct replacement. |
| panel-before-after | Actual `ariaSnapshot()` YAML is retained before and after the UI state transition under an awaited predicate. |
| contain-default | A subset template accepts the actual list with an extra sibling under the unmodified default `contain` rule. |
| equal-explicit | The same tree rejects a subset with explicit `/children: equal`; a full exact-children template is the positive control. |
| checked-wrong-state | A scoped checkbox rejects wrong state constraints, with opposite-state controls and actual YAML; an omitted checked attribute is not evidence of state. |

Actuals, exact templates, stable finding IDs, timeout values, expected-failure messages and SHA256 identities are retained beneath `corpus/evidence/round-13/aria/`. The merged receipt is written by the launcher after the real child runner exits; worker-local records cannot disguise skipped or missing cases. A process failure remains a failure even if a surviving worker has a passing local case.

## Isolation and cleanup

The fixture HTTP server binds only127.0.0.1 on an ephemeral port and serves exact fixture routes. Every browser profile is a new run-owned directory; it is never a host/session profile. Browser HOME/XDG/TMPDIR are isolated, service workers are blocked, and page requests outside the exact fixture origin are aborted and logged. This is page-level origin confinement, not packet-capture proof of zero browser background traffic. The receipt records context closure, removed profiles/temp roots, child-process observations and a connection-refused proof after server shutdown. Playwright's browser sandbox default is not upgraded into a sandbox-certification claim.

## What this result cannot establish

A successful record proves only these declared structural/selection behaviors on this package/browser/OS and author-built fixture. It is not an accessibility audit, keyboard/screen-reader test, WCAG certificate, screenshot/pixel comparison, real-site journey, cross-browser comparison or determinism result. ARIA and DOM are correlated projections of the document, not independent rung3 witnesses. This experiment stays on the state-evidence side of the existing ladder.

S023 Locate by role explicitly says role locators do not replace accessibility audits and conformance tests. S024 Strict matching establishes default `contain`, not whole-tree equality. S025's home establishes general authoring scope, not any opened per-widget keyboard contract. Documentation held in `playwright-accessible-locators-and-snapshots.md` remains historically documentation-only; this separate record supplies the bounded runtime qualifier without redating the older note.

## Observed construction failure retained

The first execution is retained in `corpus/evidence/round-13/aria-execution-initial.json` and `aria-initial-receipt.json`: six tests passed, but the equal case dereferenced a missing `queue-contain` template. The failure was a TypeError, not an ARIA mismatch. The repair adds the missing manifest input without changing expected matching semantics. The initial worker-restart aggregation also exposed why one worker's local record cannot stand for the full run; the final launcher merges durable per-case/worker records after child exit. The final receipt, not this historical failed attempt, decides admission.
