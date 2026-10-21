# ConnectProvince — one bounded boundary-evidence proposal

## Axes

- Declared round axis: **depth / C1**, finite receipt-bound lifecycle observations, target 0→12; not novel branches or coverage (`SCORECARD.md:973-986`).
- No-harm surfaces: **calibration** (observation versus inference), **adjacency** (existing ownership splits), and quality of the evidence claim. No scalar promotion or admission is made here.

## Concrete attack: requested launch configuration is not observed transport

The current producer does not request a shared debugging port, connect to an existing browser, use a default profile, invoke REA, or navigate an external site. However, retained current evidence does **not** independently establish the effective browser transport as a private pipe or prove absence of all browser-level network traffic. This is an evidence limitation, not an observed boundary breach.

Exact anchors:

1. `PROVINCE.md:6-13` owns CDP session discipline and re-verifiable browser interaction evidence. `PROVINCE.md:15-21` refuses shipped-artifact forensics, publishing, secrets and external consequential actions.
2. `corpus/adjacency.tsv:2` assigns kaidoku CDP to an REA provider surface for shipped-artifact analysis. Rows 3-4 route shipped-artifact reverse engineering to kaidoku/revenger. Row 5 retains the REA-browser-runtime overlap as **contested-open**; rows 7-8 retain the musketeer 9222/profile lease as **contested-open**; row 11 retains live shared-CDP census overlap with kama. None is resolved by this round's local experiment.
3. `scripts/webmcp-lifecycle-round21.mjs:124-145` creates a new temporary namespace and an HTTP server bound to ephemeral port 0 on `127.0.0.1`. Lines 155-160 create generated dummy nonce fixtures and a separate case profile beneath that namespace. Line 164 launches a persistent context using that profile, temporary HOME/TMPDIR, fixed executable and version-pinned Playwright. Lines 171-175 allow only same-origin GET page routes and record/abort other routed requests. Lines 176-184 create a CDP session from that owned context; there is no explicit existing endpoint or port9222 attachment in the complete producer (lines 1-263).
4. Producer lines 105-121 define a dummy form with `/landing` GET target; lines 195-225 invoke the fixture tool and perform only fixture-local click/form operations. Native submit's landing remains local. No REA imports/calls, profile-content reads, credential acquisition, publisher changes or external consequential action exist in the read producer.
5. `corpus/evidence/round-21/runtime/receipt.json:3-18` names the current run and pins producer SHA256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`, Node/Chromium/Playwright and **requested flags**. `.ufo/waves/round-21/runtime-execution-bounded.json:5-18` names the current producer execution and records exit0; earlier acquisitions are not evidence for this run. Receipt lines 686-751 retain thirteen fixture-server GET requests: twelve cases plus `/landing?q=<dummy nonce>` at lines 707-710. Receipt page-state URLs use `http://127.0.0.1:35363` (e.g. lines 45, 109, 173, 239).
6. `corpus/evidence/round-21/runtime/na-pending.json:249-267,302-317` records nonempty process ownership, PID start identities, contextClosed true, no survivors, no blocked routed requests and no downloads. It does not record effective browser argv, pipe FDs or listening sockets. Producer `processTree` reads `/proc/*/cmdline` to identify its generated user-data-dir (lines 52-64) but retains PID membership rather than the launch argv.
7. `SKILL.md:103-107` explicitly warns that host launchers inject flags and typed arguments are not effective commands. The counter `measure-c1.mjs:48-50` checks recorded requested flags; lines 97-98 check process-cleanup summary and blocked/download arrays, not effective argv/transport or browser-wide network isolation. The supplied controls `selftest-c1.mjs:44-50` mutate flags/build/download/blocked-request records, not transport attestation. The positive fixture labels its producer `fixture producer, never executed` (`fixtures/positive-ordered.json:3`), appropriately separating gate structure from runtime proof.

## Proposed move — one claim-boundary footnote, not a new mechanism

Have L1 retain one short boundary statement alongside the current runtime interpretation:

> This is a self-launched, case-private-profile, loopback-fixture CDP experiment within tabi's browser-interaction province. No existing9222 endpoint or REA provider is requested. Private-pipe transport is inferred from the launch API, not independently attested by this receipt; flags are requested strings and the request trail covers the fixture server, not all browser traffic. Existing shared9222/profile-lease and REA-provider adjacency questions remain open and are not claimed by C1.

This is a **calibration improvement with adjacency preservation**: it avoids making the C1 counter into an unimplemented transport/security attestor while preserving the finite depth claim and all twelve observations. It does not require altering producer, fixture population, source interpretation, counter contract or siblings. The note already narrows authenticity and host guarantees (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:63-72,100-106`); this footnote makes the transport-specific implication explicit instead of contradicting those limits.

## Second-order effects and explicit contradictions

- Runtime: no added browser/CDP commands, acquisition, deadlines or resource ownership changes.
- Contract: no C1 expansion from observation correlation into proof of universal network isolation or private-pipe authenticity.
- Substrate: no shared endpoint census, default profile inspection, REA provider action or sibling worktree access is needed.
- Verification: existing boundary controls establish rejection of recorded blocked/download data only; they cannot supply missing transport evidence. Do not call them proof of a private pipe.
- Contradiction retained: a requested loopback policy plus an empty `blocked` array is **not** an observed browser-wide egress guarantee; Playwright launch ownership is **not** retained effective-argv evidence. Conversely, missing attestation is **not** evidence of a shared9222 connection or external action. Do not collapse either distinction into a pass/fail scalar.

## Routing and risks

- kaidoku/revenger: only if the question becomes shipped-artifact forensics or REA-provider operation; no such expansion is proposed.
- kagi/kake: shared musketeer profile/lease ownership remains contested; no lease/default-profile access was found in this producer. Publishing remains kake's surface; secret values remain outside this experiment.
- kama: existing shared9222 target-census question stays outside this experiment.
- Environment overlap was sent once to live `TabiR21.ReviewEnvironment` as a short coordination message. No sibling files were rewritten and no dead w1 writer was messaged.
- Risk: unqualified 'private pipe' wording could be read as an observed receipt property. The proposed footnote prevents that overclaim without inventing an attestation or changing the successful current acquisition.

## Verification and execution limits

Performed only static reads/searches of current repository/cache evidence, including producer, note, current receipt/case example, counter and persisted controls. No builds, tests, counter/selftest executions, browser/REA runs, package installations, git/jj/index changes, or production edits. No observed fresh test result is claimed. L1 alone owns final serial verification and any acceptance decision. To verify this proposal, check wording against the exact distinction above; do not require another runtime merely to label currently missing evidence. No actor-quiescence claim follows from this report.

Report: .ufo/waves/round-21/w2/ConnectProvince.md
