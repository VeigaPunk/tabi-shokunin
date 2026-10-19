<!-- corpus entry — tabi-shokunin kaika fleet round 1 (2026-10-19), lane TabiFlakeExec2 (claim C2, coverage expansion). Method: documentation only — seven public sources fetched raw with curl (sha256 in the round lesson's Gate), the ICST 2025 PDF text extracted with `pdftotext -layout`; tabi's own wait discipline read from SKILL.md and corpus/knowledge. No Playwright runner, browser or test was executed. Write scope: this file only. The first-spawn seat died on a provider stall before writing; this is the re-dispatched seat's output. -->
# Re-deriving web-test flakes from attempt receipts

source: S013 (https://playwright.dev/docs/test-retries, Retries > Failures and Retries); S014 (https://playwright.dev/docs/trace-viewer, Recording a trace > Tracing on CI and Trace Viewer features); S015 (https://playwright.dev/docs/actionability, Auto-waiting); S016 (https://playwright.dev/docs/test-assertions, Auto-retrying assertions); S017 (https://playwright.dev/docs/release-notes, Version 1.64 > Test runner); S018 (https://mpapad.github.io/publications/pdfs/ICST25.pdf, §III.C and §V.A / Table V); S019 (https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/, Abstract)
verified-at: 2026-10-19 (all seven public sources opened this session; PDF text extracted with `pdftotext -layout`; hashes and quotes in the dispatch receipt)
recheck: on each Playwright release, compare the stable docs for retries, traces, actionability, assertions, and the shuffle flag; 180d for the 2025 paper records, preserving the DOI/PDF identity

## 1. Scope and evidence [observation]

This note defines an evidence receipt, not a flaky-test detector or a diagnosis of
root cause. Playwright pages below were the official `stable` docs as served on
2026-10-19 (page metadata reports Docusaurus v3.10.1). The release-notes page
itself is headed **Version 1.64** (S017); claims about runner behavior are
scoped to those docs and that stated version, not every Playwright release.

The release notes confirm the seeded-shuffling lead: Playwright Test 1.64 adds
`--shuffle`; its example is `npx playwright test --shuffle`, which prints a
`shuffle seed`, and a numeric seed can be replayed with
`npx playwright test --shuffle 271828182` (S017, Version 1.64 > Test
runner). The version and spelling are recorded here as published, not locally
executed. A seed reproduces a test order only within the runner's other recorded
execution conditions [inference]; it does not establish why a test failed.

Playwright Test 1.64's retry docs classify a first-run pass as `passed`, a
first-run failure followed by a retry pass as `flaky`, and a first-run failure
followed by failure on every retry as `failed` (S013, Retries). Thus a
retry-pass is evidence of outcome variation, not evidence that the initial
failure can be erased or that the underlying application is healthy.

The 2025 ICST paper studies 123 flaky tests from 49 open-source web projects and
labels statement interactions ED (Event-DOM), E (Event), DE (DOM-Event), D
(DOM), R (Response), or O (Other) (S018, Abstract and §III.C). Those are
its sample and coding scheme, not a universal distribution of all web flakes.
Its Table V groups fixes into DOM interaction synchronization (62, 50.4%),
conditional event-completion waits (47, 38.2%), and consistent DOM-state
transitions (14, 11.4%) (S018, §V.A, Table V). Percentages and classes
remain scoped to the paper's dataset and coding.

## 2. Minimum run receipt [operational inference]

Keep a per-test attempt ledger from the first execution through the last allowed
retry. A summary such as “green after retry” is not enough to re-derive the
classification. Each receipt retains:

1. **Run identity:** source revision, exact test/project identifiers, Playwright
   Test version, browser name/version, OS/runtime, command and effective config,
   retry limit, worker/shard settings, and a unique run identifier. The 1.64
   retry description says a failed test's worker is discarded and a new worker
   retries it; keep worker/attempt identity so that lifecycle changes are visible
   (S013, Failures and Retries).
2. **Attempt outcomes:** the first-run result and error/stack, then every retry's
   ordinal, result, error/stack and duration. Retain the reporter output or an
   equivalent structured record, including skipped/aborted attempts; do not
   reconstruct a missing first failure from the final status. Apply the three
   labels above only when the whole configured attempt sequence is present
   (S013, Retries).
3. **Order evidence:** whether shuffling was enabled, the exact `--shuffle`
   command/seed, the runner-reported seed, and the observed test order. For
   Playwright Test 1.64, the no-number example emits a seed and the numeric form
   passes that seed back (S017, Version 1.64 > Test runner). Save the seed
   with the runner version and worker/shard configuration; a number alone is not
   a complete replay recipe [inference].
4. **First-retry trace:** set `trace: 'on-first-retry'` and preserve the resulting
   `trace.zip` for the retried test, its digest, and the run/test/attempt identity.
   Playwright's stable trace guide says this mode records a trace on the first
   retry of a failed test; the viewer exposes action logs, source locations,
   snapshots, errors, console, network and metadata (S014, Tracing on CI and
   Trace Viewer features). Keep the first-run error separately: a retry-only trace
   is not the first-run trace and cannot by itself show the original failure.
5. **Waited state predicate:** preserve the exact state predicate the test awaited,
   its code/source revision, target (locator/document/request), initial observed
   value, expected terminal value, actual value/result, timeout and whether the
   predicate passed or expired. For an async page transition, retain the DOM
   assertion and relevant network/request completion witness where available.
   “Waited for the page” or “slept 500 ms” is not a re-derivable predicate.
6. **Action context:** retain the preceding action, locator and relevant
   Playwright actionability error/checks, plus the assertion/matcher and its
   timeout. The actionability guide's stable docs say actions wait for their
   applicable checks; that does not prove the application's post-action state
   predicate held (S015, Auto-waiting; S016, Auto-retrying assertions).

The label function is mechanical: all attempts pass from attempt one → `passed`;
first fails and any retry passes → `flaky`; first fails and every configured
retry fails → `failed`. Missing/aborted attempt evidence → `unclassified`, not an
assumed pass or failure [inference from S013]. A `flaky` label reports the
observed sequence, not the fault's owner or whether the failure was product,
test, environment, or infrastructure.

## 3. Tabi state-predicate mapping [inference]

Tabi's own discipline says “Wait on state, never on time” (SKILL.md:476-501),
settles on the run's payload-derived predicate (SKILL.md:498-502), and records
both DOM and network witnesses when the claim needs both (SKILL.md:503-510).
`async-step-evidence.md:69-77, 125-153` demonstrates the exact pre/post pattern:
held request plus pending DOM before release, then payload-derived ready DOM and
answered network request after release. Two animation frames settle paint only;
they do not certify network completion (SKILL.md:511-512). Apply the same
standard to a test-runner receipt: name the predicate and record its evidence,
not merely its elapsed wait.

The ICST paper's classes map to that rule as follows (S018, §III.C and
§V.A, Table V):

- **ED / DE:** an event and DOM change depend on each other. Record the action,
  then wait for the exact post-action DOM state and, when relevant, event or
  response completion; element actionability alone is only a precondition.
- **E:** for a page load, click, or other event, record the completion witness
  and the resulting state before the next dependent step; an event being issued
  is not proof that its effects settled.
- **D:** express the required DOM state in the predicate (including the needed
  count/text/attribute or absence); mere locator discovery is insufficient when
  rendering is still changing.
- **R:** make the expected response/result itself the predicate. Playwright's
  stable assertion guide documents auto-retrying locator matchers; retain the
  exact matcher and observed result (S016, Auto-retrying assertions).
- **O:** the paper's “Other” category is outside DOM/event state; keep its actual
  blocking condition explicit rather than forcing it into a DOM predicate.

Table V's DOM synchronization and consistent-state-transition strategies fit a
specific predicate plus its witness. Its conditional-completion category also
includes fixed/dynamic delays; that empirical category is not a recommendation
to replace tabi's state predicate with a longer sleep. If a necessary temporal
minimum is independently established, record it separately from the state
predicate and its evidence [inference].

## 4. Local boundary [observation]

No Playwright test-runner flake was run locally for this entry. Adjacent
(kaidoku-owned, cited not absorbed): kaidoku recorded `playwright` 1.64.0 global plus
`~/.cache/ms-playwright/chromium-1248` on this host
(`kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:42-44`) and used it
for `recordHar` over loopback (`…/2026-10-14-r10-01-queue-ops.md:155-158`) — an install
observation dated 2026-10-13/14, not a tabi measurement and not a runner-flake result.
The tabi evidence perimeter
remains loopback-first, based on local fixtures and loopback capture precedent
(SKILL.md:687-695; `live-dynamic-capture.md:35-42, 151-173`). Nothing here measures
real-site flakes, external service behavior, or Playwright runner outcomes on
tabi's local fixtures.

## Rejected

- **“A retry-pass is a reliable pass.”** Rejected: Playwright Test 1.64's
  published category is `flaky` when the first run fails and a retry passes;
  erasing the first attempt destroys the distinction needed to re-derive the
  result (S013, Retries). Flip only with a version-scoped change in the
  runner's published classification and a receipt format retaining all attempts.
- **“A longer fixed sleep is the default flake fix.”** Rejected: it records no
  state transition and cannot establish that the intended DOM/network outcome
  occurred; tabi's measured rule waits on a payload-derived predicate
  (SKILL.md:496-510). The paper reports delay-based fixes in 38.2% of its sample,
  but does not make longer sleeps the default or prove that a longer delay
  repairs each underlying condition (S018, §V.A/Table V; S019,
  Abstract). Flip only after a specific local measurement demonstrates a
  necessary time bound and preserves the state predicate as separate evidence.

## Unknowns

1. Whether the host's installed Playwright package matches the 1.64 docs or
   supports the documented shuffle form; no local runner probe was made.
2. Whether replaying a 1.64 seed plus the retained worker/shard configuration
   produces identical order across hosts, browser versions, or later releases;
   the docs example only establishes the seed replay syntax.
3. Whether tabi's trace-retention path can preserve first-retry traces without
   retaining sensitive page data; this entry did not run the runner or handle a
   trace artifact.
4. Which specific failure class dominates any tabi fixture: no runner flake
   corpus was measured here, and the ICST sample cannot answer that local
   question.
5. Whether the kaidoku-recorded Playwright 1.64.0 global install (2026-10-13) is still
   present and current; tabi re-ran no version probe this round.
