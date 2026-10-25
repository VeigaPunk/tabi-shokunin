# Round 12 — source-claim rechecks and accessible structural evidence

Steered round: 12, attempt 1, 2026-10-20. Base `f032f2dccc8a99632eea52edafa8220284b5c919`.
C1 freshness: dated, note-hash-pinned, claim-versus-source reviews of three named claim
families, 0→3. C2 coverage: accessible-locator/ARIA-snapshot docs-held entry, 0→1.
The initial wave proposed freshness 8→9 / coverage 9→10; those scalar increments are
withdrawn after CoverageAttack/ClaimAttack. Last admitted ordinal scores remain freshness
8 and coverage 9 (delta 0); the actual improvements are the measured records and new
knowledge, not an unsupported expertise fraction or perfect-coverage claim.

## Gate

Author-side admission (not outside verification):
- admitted: `corpus/knowledge/playwright-accessible-locators-and-snapshots.md` — S023,
  S024 and S025 reopened; role/name/label choices, action-time re-resolution, single-target
  strictness, partial ARIA templates and child modes. Runtime locally unmeasured.
- admitted: `corpus/knowledge/source-recheck-round-12.md` — correction on existing ground,
  not a second coverage claim. The profile note's socket-factory conflation is corrected;
  its original entry and the retry entry each carry dated append-only qualifications.
- rechecked: selected profile, dated BiDi-matrix, and Playwright retry/source claims in
  `corpus/evidence/round-12/source-recheck.json`; two note/source discrepancies qualified
  or corrected and one matrix family confirmed. S018/S019 paper/abstract claims, WPT
  implementation data, host browser behavior and runner execution were not refreshed.
- rejected: treating a default partial ARIA template as whole-tree equality; omitted
  names/states/children are not constraints. Flip: explicitly record the relevant
  names/states and matching modes, or make the narrower partial-structure claim.
- rejected: ARIA/template success as rendered appearance or accessibility conformance
  evidence. Flip: the appropriate separate visual/audit evidence and authority.
- rejected critic B3 correction: S011's introduction literally says Puppeteer's CDP
  support “remains unchanged”; replacing a true version-scoped paraphrase with a
  supposed correction would degrade knowledge. The separate Chrome-default wording
  is also retained in the correction dossier.
- rejected: source hashes alone prove a note is true; profile source bytes were unchanged
  while its factory attribution was still wrong. Source text must be checked against
  the actual claim. Dynamic full-page hashes are fetch identities, not semantic drift.
  seats are all author-side, even when not authors of a particular note. No SHONEN box
  is upgraded and no current-round outside agreement is claimed.

Opened this round (source access date 2026-10-20; located excerpts ≤25 words):

| Rows | URL | Located excerpt | Evidence |
|---|---|---|---|
| S023 | https://playwright.dev/docs/locators | §Locate by role: “role locators do not replace accessibility audits and conformance tests” | new entry §1; LocatorSource.txt; L1 reader reopen |
| S024 | https://playwright.dev/docs/aria-snapshots | §Aria snapshots: “A template is a constraint, not necessarily a complete serialization of the accessibility tree.” | new entry §1; SnapshotSource.txt; L1 reader reopen |
| S025 | https://www.w3.org/WAI/ARIA/apg/ | Home introduction: “This guide describes how to apply accessibility semantics to common design patterns and widgets.” | new entry §1; ApgSource.txt; L1 reader reopen |
| S028 | https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc | Port-fallback class comment, :113–114: “Prefers a free port over switching from IPv4 to IPv6.” | FreshProfile.txt; L1 source reopen; correction dossier |
| S011 | https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi | Introduction: “Puppeteer's support for Chrome DevTools Protocol (CDP) remains unchanged.” | FreshBidi.txt; L1 reader reopen |
| S013 | https://playwright.dev/docs/test-retries | §Retries: “tests that failed on the first run, but passed when retried” | FreshRetry.txt; L1 reader reopen |
| S017 | https://playwright.dev/docs/release-notes | Version 1.64, Test runner: “New `--shuffle` command line option schedules tests in a random order” | FreshRetry.txt |
| S005 | https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | Abstract: “This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents.” | FreshBidi.txt; revision f922e6af669ead51496db85f37813f39438ef171 |

No new registry rows. Registry transitions (all immutable fields, including original
`opened`, and every `recheck` cadence unchanged):
- S023/S024/S025: `status queued→mined`; `used-by —→corpus/knowledge/playwright-accessible-locators-and-snapshots.md`.
- S011: `used-by corpus/knowledge/webdriver-bidi-capability-matrix.md→same + corpus/knowledge/source-recheck-round-12.md`.
- S013/S017: `used-by corpus/knowledge/web-flake-retry-evidence.md→same + corpus/knowledge/source-recheck-round-12.md`.
- S028: `used-by corpus/lessons/kaika-fleet-round-1.md→same + corpus/knowledge/source-recheck-round-12.md`.
- S011/S013/S017/S028: `status mined→mined`; all other rows untouched.
The old S023/S024/S025 teaching summaries are interpreted within their original scoped
rows; the new entry quotes the actual audit language, labels no-rendered-appearance and
no-audit conclusions as inference, and makes no per-widget APG keyboard claim.

Census command, at start and end:
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
Both outputs: `tabi\tok\t/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`, exit 0.
Start receipt `.ufo/waves/round-12/w1/census-before.txt`; end receipt
`corpus/evidence/round-12/census-after.json`. Live source gate after:
`SOURCES_GATE verdict=clean rows=28 tiers=A:22,B:4,C:2 status=queued:3,mined:23,rejected:2 findings=0`.
Before: rows 28, A22/B4/C2, mined20/queued6/rejected2 (`.ufo/waves/round-12/before.json`).
Rows added by tier: A0/B0/C0; frontier rows advanced: accessible-selectors open→docs-held,
not runtime-held. No discovery search was performed; this was bounded primary-source
reopening, not an exhaustive literature search.

## Mistakes

| Class | Evidence pointer | Captured-by | Fix |
|---|---|---|---|
| Source inference distilled into host observation | kaika lesson M2/post-review M-1; original SKILL:1606; outside `round-1-verifier-spotcheck.md`; red fixture receipt `corpus/evidence/round-12/mistake-red.json` | QUALITY #3 existed but failed in distillation | QUALITY #14 now explicitly checks SKILL/index evidence class; bounded claim-record gate refuses source-only host observations. Red exit1 `observation_without_runtime`; same claim/evidence/id with only modality→inference plus scope=source gives green exit0. Observed outputs committed; self-test9/9 asserts exit/finding pairs. This guards declared records, not arbitrary prose truth. |
| One factory attributed another factory's fallback | old profile note :41; FreshnessAttack F2; FreshProfile.txt; L1 .cc source reopen | QUALITY #2/#3 | dated append-only correction plus source-recheck dossier distinguish same-port address retry from approval-mode port-zero fallback; the unchanged source bytes did not excuse the wrong note |
| Tier-definition pointer points to registry, not contract | ReviewSources.txt F2; QUALITY #12 | none | editorial pointer repair #15 supersedes #12's pointer only; no separate measured fix credit claimed |

Outside teaching/disagreement disposition: the actual latest outside lesson is
`round-1-verifier-spotcheck.md` (no round-11-verifier file in the initial directory census).
Its source-inference and same-lane-non-author disagreement becomes criterion14 and the
regression witness. Its SHONEN history-pin debt stays named: no historical baselines,
SHONEN bytes, or old gate scripts were changed. A lawful gate repair needs an explicit,
fixture-covered production exception and census/PSTACK handling; moving HARD_BASELINE
would corrupt old before measurements. Orchestrator clarified lane scripts are writable,
but no untested exception is shipped. The required new `round-12.md` also conflicts with
the legacy user gate's broad round-N diff guard; it is not silently omitted or renamed.

## Execution and boundaries

One validated wave, 32 seats: executor5, scout9, connector4, reviewer6, critic4, sentinel1,
scribe2, revenger1. L1 holds canonical planner; PlanningWalk is a bounded scout data-walk.
Wave spec/dispatch/registered IDs: `.ufo/waves/round-12/w1/`. No model parameter supplied.
The absolute reportDir rejected `invalid_report_dir`; the validated lane-relative directory
resolves beneath the absolute lane root. Orchestrator confirmed this prompt defect is
fixed for later rounds; no L0 question is needed for it.

No inherited uncommitted lane work at start; base HEAD was protocol-authored bookkeeping.
Seat duplicate `.md` summaries were removed by their authors; only the assigned outputs
and durable code/fixtures remain. No browser launched, no secrets/profile accessed, no
consequential external action. Accessibility certification/authoring is not absorbed;
publishing remains kake-owned, secrets kagi-owned, forensic work revenger/kaidoku-owned.
No tools installed or updated. `sources-selftest.json` records26 clean source cases;
`mistake-selftest.json` records9/9 clean isolated cases. No legacy gate re-run or historical
pin weakening is claimed. Report and final measured commit are recorded in SCORECARD/LOG.
