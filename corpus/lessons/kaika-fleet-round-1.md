# Kaika fleet round-1 lessons — tabi-shokunin (2026-10-19)

Steered round 1 per fleet-ledger `.ufo/waves/kaika/steer.md:32` ("record or retire
the unrecorded `user-20261015-r07` wave first"). The L1 declared **C1** operability
7→8 (hermetic `scripts/check-sources.mjs` with `--self-test`), **C2** coverage 8→9
plus capability `sources-registry` (`corpus/SOURCES.md` v1 + three knowledge
entries), **C3** calibration 8→9 (this mining + `corpus/QUALITY.md` criteria).
Nothing here credits a claim; this is the errata ledger behind C3. The section was
first appended to gate-protected `corpus/lessons/round-1.md` and moved here
pre-commit (M13) — this file is the traceable surface.

## Mistakes

| # | class | evidence pointer (re-run 2026-10-19) | captured-by | fix |
|---|---|---|---|---|
| M1 | Anchor/citation slips | census `operations.md:22-23` cite off by 4 — correction `corpus/knowledge/browser-surface-census.md:207-213`; the "297 lines" nit resolves on the `wc -l` vs `grep -c ''` convention (`SKILL.md:78-83`); 37-hex pin at `corpus/knowledge/carried-debt-closure-r8.md:5` — `git cat-file -t b377007877be2d104cc9e3da56cf81a24ab0d` → `fatal: Not a valid object name`, rc 128; annotation drifts: "8-field `/status`" vs 9 counted keys (`webbridge-revival-assessment.md:233-239`), "4-line" vs 3 changed lines (`carried-debt-closure-r8.md:55-59`) | QUALITY #2 + #4; §Pins `SKILL.md:37` | re-derive every anchor and pin by command at write time; correct by append |
| M2 | Observation admitted before its artifact was staged | launch-window extension targets claimed from a 50-line-truncated listing, downgraded non-replayable (`corpus/knowledge/cdp-evidence-patterns.md:172-181`), reinstated only after a staged `listBefore` (:207-216) | QUALITY #1/#3; §Evidence ladder `SKILL.md:361` | stage the artifact first; keep the downgrade as record |
| M3 | Time-gated claim closed early (honest stop kept) | clause (c) held **IN FORCE 3/4** (`corpus/knowledge/closeout-r11.md:128`); closed only by committed witness `c5e25208` with instant ≥ 2026-10-15T00:00Z (`SCORECARD.md:177-192`) | QUALITY #1 | never close a dated clause on a same-day witness |
| M4 | Tooling safety defect | freshness gate v1 trusted mutable public-target metadata and could hash an arbitrary host file (`SKILL.md:1577-1588`); corrected gate fixes 3 identities, opens `O_NOFOLLOW`, refuses symlink/non-regular (`scripts/check-freshness.mjs:28-36`), 12 self-test cases incl. `public_target_injection`, `public_file_symlink`, `descriptor_symlink` (`.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`) | none (SKILL §Safety erratum is a record, not a rule) | criterion 6 |
| M5 | Inherited work read as this session's | stopped headless attempt's receipts retained; erratum `corpus/README.md` §Interactive reconciliation erratum (`:82-95`) — "retained provenance, not this interactive session's capture" | QUALITY #3 | label inherited bytes with their provenance before reuse |
| M6 | Executed wave never recorded | `user-20261015-r07`: 32/32 PASS, 37 files, committed `2676cc8`; `grep -rn 'user-20261015-r07' LOG.md SCORECARD.md reports/ corpus/lessons/` → 0 hits; its operability receipt is byte-identical to already-credited r01 (`sha256sum` both → `77374a71…`) | none | criterion 7; record or retire with reason (housekeeping, not claimed here) |
| M7 | Redundant reject re-runs | Brave-not-installed reject appears in 21 of 26 lesson files (`grep -l 'Brave' corpus/lessons/*.md` → 21); `round-10.md:75` records the count asserted **10th** | none | criterion 8 |
| M8 | State-change/authority events | daemon OOM death recorded as state, stop left operator-only (`corpus/knowledge/hygiene-sweep-r4.md` §4; `SKILL.md:738` A4 moot) — handled, not hidden | §Approval table `SKILL.md:697` | keep state changes recorded with their authority |
| M9 | Dispatch attempted without resolved seat bindings | operator-required route aliases vs actual bindings; `dispatch_decision` = blocked, zero task calls (`.ufo/rounds/fleet-round-1-interactive-20261015/routing.json` — git-tracked, `git ls-files` rc 0; `SKILL.md:1549-1551`) | none | criterion 9 |
| M10 | Procedure-doc clauses falsified by execution | fresh executor found E1 count definition, E2 interaction count, E3 process-table channel, E4 `/tmp`-provisional hashes, E5 two `SKILL.md` revisions in one window (`corpus/knowledge/executor-test-sufficiency.md:230-296`) | SKILL §Sufficiency `:12-27` | run every copy-paste command in a fresh seat before publishing; errata by append |
| M11 | Round closed without its lesson | `ls corpus/lessons/round-11.md` → `No such file or directory`, exit 2 at this round's opening; debt O5 named at `corpus/knowledge/closeout-r11.md:132` and `LOG.md:144`; closed 2026-10-19 by `corpus/lessons/training-round-11.md` (retro lesson) | none | criterion 10 |
| M12 | Living index frozen while notes accrue | `corpus/README.md:5-9` still "Held at round 3 … 8 knowledge notes … Lessons: 0"; at base, 11 mapped rows vs 26 knowledge files; debt O3 `corpus/knowledge/closeout-r11.md:130` | none | criterion 11; refresh or restate the dated gap (housekeeping, not claimed here) |
| M13 | Lesson append targeted gate-protected history | this round's scribe first appended its section to `corpus/lessons/round-1.md`; caught pre-commit by L1 per `corpus/evidence/pstack-20261015/baseline-census.tsv:47` (blob `19bafbb9…`) + `scripts/check-round-contract.mjs:100-118` (`history_rewritten`; `protectedPath` `:60-69`) and `scripts/check-user-round-contract.mjs:121-135` (any added/changed `corpus/lessons/round-N.md`); append reverted, this file replaces it | none | criterion 13 |
| M14 | Seat death on provider stall left partial work | executor seats TabiFlakeExec and TabiBidiExec ended with `Provider stream stalled/timed out` errors (session transcripts, 2026-10-19T21:56–21:57Z); TabiGateExec made no progress after 21:32Z (last event a file read) inside the executor-route rate-limit window the orchestrator announced; the BiDi seat had written its file without reporting rows | QUALITY #3 (inherited work labeled) | killed and re-dispatched as fresh seats in one batch; the BiDi successor re-opened every source and re-verified the predecessor's file before any row was written |
| M15 | L1 relayed a peer's pointer without opening it | the dispatch cited `kaidoku-shokunin/05-runtime-obs.md:97-114` from the connector; the path does not exist — the executor flagged it; real anchor `kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:42-44` | QUALITY #2 | open every relayed anchor before it enters a prompt or note; corrected in `web-flake-retry-evidence.md` §4 |

## Gate

Round: kaika fleet round-1 (steered `1`, fleet-ledger `.ufo/waves/kaika/steer.md:32`).
axis: operability (C1), coverage (C2), calibration (C3)
consequential-external-actions: none

Source-opening records (contract v1 rule 1). Every row was opened 2026-10-19 by the
named seat; sha256 is `curl -sL --max-time 30 '<url>' | sha256sum` of the raw fetch.
Quotes are ≤25 words with their location.

| row | seat | quote — location | sha256 (seat fetch) |
|---|---|---|---|
| S001 | TabiCdpProfileExec | "These switches will no longer be respected if attempting to debug the default Chrome data directory" — body, Chrome 136 paragraph | `bf63ed06681d7adf7e645cb55cd81f314e713f0b85893ee00ebc93663a871668` |
| S002 | TabiCdpProfileExec | "CDP is not a public or supported API for Chrome, and it does not guarantee backwards compatibility" — §Scope and support | `ba8018bb02f360686cbff23304da8b6e21923a2e012ade273e3f9a2ce1e2fd64` |
| S003 | TabiCdpProfileExec | "a dedicated flavor of Chrome targeting the testing use case, without auto-update, integrated into the Chrome release process" — §Discover a dedicated Chrome flavor for testing | `1618fa580b092d4838662ab31a248395224e7e08d581adf1f295251b78d3b77c` |
| S004 | TabiCdpProfileExec | "Enables the default user data dir check even for non-Chrome branded builds, for testing" — remote_debugging_server.h:47-48 | `.cc` `ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc`; `.h` `841c6f67378c05cdbdbd8da48e2a39474278d84cc9049881de552589ad78a602` |
| S005 | TabiBidiExec2 | "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents." — Abstract | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |
| S006 | TabiBidiExec2 | "The WebDriver BiDi protocol is organized into modules." — introduction | `6bb0a5edad403ab06a5b4db2398765fdf7ab50294369c89c1d075a2a3b7806c9` |
| S007 | TabiBidiExec2 | "The client and the browser communicate using the WebDriver BiDi protocol over a WebSocket connection." — introduction | `0a3b26cff1a21d25f50b2c612453797b2de5cd83311a4bd47536fcaa3c8de2d4` |
| S008 | TabiBidiExec2 | "The low-level BiDi domains will be accessible in the code to the end user" — §Enabling BiDi in Selenium | `c919558a0ec5e42fb7b33560d633f508dd6f30dfb39f4821270cdfe0b3a9c97b` |
| S009 | TabiBidiExec2 | "This will be updated when a public API is stabilized." — v4.32 Python example comment | `84a9db7fa1063664af92b6a2b353c5849d81836ddb0ce9a098bdca241b30187d` |
| S010 | TabiBidiExec2 | "In 2022, both Chrome/ChromeDriver 106 and Firefox 102 shipped support for the WebDriver BiDi standard." — §Where are we now? | `e457c166e6b8ebb172daa8c0a1c538b6467281b7eacca808f520736f62b11490` |
| S011 | TabiBidiExec2 | "Firefox 129 and Puppeteer 23 each getting production-ready support for WebDriver BiDi!" — introduction | `12dacd54a6edf34d5681e862b1021e9df0a4a3e90401fff1c52209b25c732326` |
| S012 | TabiBidiExec2 | "implemented as a JavaScript layer translating between BiDi and CDP, running inside a Chrome tab" — README introduction | `992ec9d3d60bbe36bb7d804d695fc57fefb651589115c4efb96239307ac1d866` |
| S013 | TabiFlakeExec2 | ""flaky" - tests that failed on the first run, but passed when retried" — §Retries, result categories | `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa` |
| S014 | TabiFlakeExec2 | "Traces should be run on continuous integration on the first retry of a failed test" — §Tracing on CI | `e947d4dc0b73cdb8eae97f10c268c10024e4ff9410077acd7d69e6b0bafc1bee` |
| S015 | TabiFlakeExec2 | "It auto-waits for all the relevant checks to pass and only then performs the requested action." — §Introduction | `31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d` |
| S016 | TabiFlakeExec2 | "Playwright also includes web-specific async matchers that will wait until the expected condition is met." — §Introduction | `1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c` |
| S017 | TabiFlakeExec2 | "New `--shuffle` command line option schedules tests in a random order" — Version 1.64 §Test runner | `ce461e5be73bd602d24395e4628c62ded8293b088a085c82f5436960241952c5` |
| S018 | TabiFlakeExec2 | "Ensure elements are fully loaded and visible before interaction." — §V.A Table V, printed p. 99 | `9304083f19871e117d5c4de0db4b1fe40767b66778641a188cdbd9dae4ebed3b` |
| S019 | TabiFlakeExec2 | "developers adjusted wait time to address asynchronous wait flakiness in about 63% of cases (31 out of 49)" — Abstract | `4fa85f45c7657f149f868a36b747c2319ebb10fb00484bb491b8b7a3546015ab` |
| S020 | TabiLeadScout | "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents." — Abstract | `a8f757909ae3c04f17149575edaca44cd659536f916995afb52963269bbd04a1` |
| S021 | TabiLeadScout | "Help your agent build, debug, and verify your code correctly." — introduction | `33c0773da9e81c50d997229fb6b398e942fdd70ca3891cb6282708046906b4c0` |
| S022 | TabiLeadScout | "Flaky tests, which have non-deterministic outcomes (pass or fail when running on the same code), are a significant issue" — Abstract (page reader; raw curl body empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty body) |
| S023 | TabiLeadScout | "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines" — §Locate by role | `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` |
| S024 | TabiLeadScout | "aria snapshots provide a YAML representation of the accessibility tree of a page." — §Aria snapshots | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` |
| S025 | TabiLeadScout | "This guide describes how to apply accessibility semantics to common design patterns and widgets." — introduction | `17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f` |
| S026 | TabiLeadScout | "await new Promise(resolve => setTimeout(resolve, 5000));" — answer 74926242 | `18fedc59b70e86075d63f8a3dcd204aa332a2833b081bed38cda51b1cdc7fed1` |
| S027 | TabiLeadScout | "add `--remote-debugging-port=9222` on the end of the command line" — setup list | `e36d660b349e1db885701007e8977fa8cdc6017593074b07d44ad340a4c3cace` |

L1 re-open (author-side, not the non-author check): re-fetched S002, S004, S020, S023, S027,
S013, S017 — sha256 identical to the seat fetch; S001 re-fetch `f0c70bd2…5f6a` differs
(dynamic page) but the quoted sentence is present; S026 page returned a challenge, the
answer body was re-read through the Stack Exchange API (sha256 `07242acd…12e6`) and
contains the quoted line. Rows touched old→new: none (all 27 rows are new).

- admitted: knowledge/chrome-remote-debugging-profile-boundary.md — source-level enforcement read first-hand (S004) and bounded: refusal never observed locally, CfT exemption kept unknown.
- admitted: knowledge/webdriver-bidi-capability-matrix.md — every surface anchored to a tabi path and a WD-20261008 section; "locally measured: no" on every row.
- admitted: knowledge/web-flake-retry-evidence.md — Playwright 1.64 claims version-scoped; paper findings bounded to its sample; no runner flake claimed.
- rejected: S026 (fixed 5 s sleep as readiness) — records no state transition; contradicts SKILL.md §Settle-wait (`:496`).
- rejected: S027 (port 9222 on the everyday profile) — refused on branded Chrome ≥136 (S001) and forbidden by the shape-only session rule (SKILL.md:660).
- rejected: user-20261015-r07 as round credit — executed and committed (`2676cc8`) but its only receipt is byte-identical to r01's already-credited one; recorded in LOG.md, no axis move.
- spot-check: non-author pending — the orchestrator's post-landing verification (≥1 admit, ≥1 reject, ≥3 rows re-opened) is owed and not claimed here.
