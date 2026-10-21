# ConnProvince — bounding the review-chronology guard to browser acquisition evidence

## Axes

- **calibration** (primary): the guard must not turn a snapshot clock or a producer
  hash into "final bytes were reviewed". Acquisition-internal clocks/identity stay
  distinct from orchestration clocks/status.
- **adjacency** (preserve, do not absorb): orchestration event semantics already have
  an owner (kumitate); CDP/REA/census/secrets routes stay closed.
- **depth / C1** (unchanged): the guard is not the outcome oracle and adds no C1 value,
  no new observation and no coverage credit (`SCORECARD.md:1002,1025-1027`).
- **coverage, operability, freshness** (unchanged): no browser run, CDP, REA, census,
  network, install or service action.

## What the new guard is (exact assignment)

BuildDebt owns `.ufo/waves/round-22/check-review-chronology.mjs` and
`.ufo/waves/round-22/debt-expectations.json` (`.ufo/waves/round-22/w1-spec.json` item
BuildDebt; full text `.ufo/waves/round-22/w1-spawn-result.json:49-50`). It compares
reviewed producer digest + review-return timestamp against artifact producer digest +
acquisition start; digest mismatch or acquisition-after-return reports
`review_scope_gap`, never final-reviewed; per-seat ordered events must keep
first-terminal and latest-observed status distinct; no completeness/authenticity
certification; `--selftest` covers absent event history, peer revival after failure,
routing broadcast, late failure, chronology gap, exact pre-review artifact positive,
unknown clocks and differing producer.

## Retained evidence establishing the r21 chronology gap

Final (canonical) acquisition:

- `.ufo/waves/round-21/runtime-execution-finalized.json:13` producerSha256
  `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`;
  `:14` startedAt `2026-10-21T13:51:46.597742+00:00`; `:19` finishedAt
  `2026-10-21T13:51:58.460511+00:00`; `:47` receiptSha256
  `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`.
- `corpus/evidence/round-21/runtime/receipt.json:3` startedAt
  `2026-10-21T13:51:46.773Z`; `:4-6` pins the same producer; `:19` cases;
  `:685` finishedAt `2026-10-21T13:51:58.439Z`. The receipt's sha256 was recomputed
  here and equals the finalized pin `4bc79636…`.

Reviewed (historical) acquisition:

- `.ufo/waves/round-21/runtime-execution-bounded.json:12` producerSha256
  `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`;
  `:13` startedAt `2026-10-21T13:07:01.895287+00:00`; `:18` finishedAt
  `2026-10-21T13:07:14.124522+00:00`.
- Archived artifacts `.ufo/waves/round-21/history/runtime-v4/receipt.json:3,6`
  (startedAt `2026-10-21T13:07:02.041Z`, same producer); that receipt's sha256 is
  `323ccd59…` (recomputed). Mapping is lane-curated at
  `.ufo/waves/round-21/history/index.json:21-32`.
- Review observation: `.ufo/waves/round-21/w2-returns.json:4` readAt
  `2026-10-21T13:49:02.529912+00:00`. Seat objects carry only
  `name`/`role`/`latestOutput` (no per-seat timestamps).
- 29 of 58 W2 report files cite the bounded producer `5363d576…`, e.g.
  `.ufo/waves/round-21/w2/ConnectProvince.md:18` (producer hash plus bounded port
  `35363`) and `.ufo/waves/round-21/w2/CounterFlags.md:69,98,146`. Report mtimes run
  `13:22:35–13:38:38Z` — **filesystem observation only**, not blob evidence.
- `.ufo/waves/round-21/w2-failures.json:4,10,13` retains 6 failed W2 seats and states
  that partial analysis is not a completed semantic review.

Consequence: reviewed producer `5363d576…` ≠ final producer `bc11e4d6…`, and final
acquisition start `13:51:46.773Z` is after the review snapshot `13:49:02.529912Z`.
Both independent rules yield `review_scope_gap`: W2 reviewed older bounded bytes and
cannot certify the final bytes. W2's findings remain valid for those bounded bytes.

Acquisition-internal chronology is checkable without mtimes: every raw frame
`at`/pageObservation `at` lies inside `[receipt.startedAt, receipt.finishedAt]`, with
monotonic `seq` and `at`, for all 12 cases (global span 1792590707063–1792590718399 ms
inside 1792590706773–1792590718439 ms; case digest pins at `receipt.json:55` etc. match
raw bytes 12/12; raw anchors `corpus/evidence/round-21/runtime/na-pending.json:12,15,107,215`).

## Proposed move — split the guard's two sides by provenance, digest-first

One bounded change: the guard's input JSON declares two blocks with different authority,
and the verdict is finite/typed (no scalar).

1. `acquisition` (browser acquisition evidence; tabi-owned):
   - `producer_sha256` from `runtime-execution-finalized.json:13`, cross-checked with
     `receipt.json:6`;
   - `receipt_sha256` from `runtime-execution-finalized.json:47`, cross-checked against
     the receipt bytes;
   - `started_at`/`finished_at` from the receipt (`:3`, `:685`); the wrapper times
     (`:14`, `:19`) are the execution envelope. Retain the observed 175 ms lead
     (wrapper `46.597742` vs receipt `46.773`) as named skew, not smoothed;
   - `case_evidence[]` digests from the receipt rows, cross-checked against raw files;
   - optional order check: raw `at`/`seq` monotonic and bracketed by start/finish.
2. `review` (declared external observation; not browser evidence):
   - `reviewed_producer_sha256`, `reviewed_receipt_sha256` (and case digests when
     declared) copied verbatim from the review return/report; never recomputed from
     the current acquisition;
   - `observed_at` = snapshot readAt, labeled `review_observation_upper_bound`; a
     per-seat time only when actually present. `w2-returns.json` has none, so
     `seat_clock_unavailable` is the honest value.
3. Verdict rules:
   - any declared digest mismatch → `review_scope_gap`, `final_reviewed:false`, exit1;
   - producer **and** receipt digest equality → `reviewed_bytes_identical`
     (`completeness: unasserted`), exit0; no clock required;
   - producer-only equality → `producer_identity_match_artifact_unknown`, exit2.
     Same producer does not imply same artifacts: bounded receipt uses port `35363`
     and case digest `ae7e55…`; final uses port `43143` and `f17fe86…`
     (`history/runtime-v4/receipt.json:45,55` vs `receipt.json:45,55`);
   - insufficient/malformed declared fields → `unavailable`, exit2, never 0;
   - clock fallback only when identity is not established: acquisition start > review
     upper bound → `review_scope_gap`; otherwise `review_scope_unestablished`, exit2.
4. Hard input bounds:
   - no filesystem mtimes, no Git commit/author times, no `history://`, no live
     registry/dispatch/session reads beyond the declared snapshot;
   - a declaration pointing at `runtime-execution-bounded.json` + `history/index.json`
     is a lane-curated mapping, not independently authenticated;
   - no import of `.ufo/waves/round-21/measure-c1.mjs` or its output as a chronology or
     outcome verdict (frozen counter digest `8d992423…` at
     `.ufo/waves/round-21/measurement-binding.json:14,20`);
   - no CDP/REA/census/profile-content read and no new acquisition.

## Sibling ownership and routes (report, never absorb)

- **kumitate** owns orchestration & tooling (OMP task/hub, ufo-fsd scripts/runtime):
  `kumitate-shokunin/PROVINCE.md:3-6,19`; precedent `tsukuroi-shokunin/PROVINCE.md:50`
  (ADJ-05) and `mori-shokunin/PROVINCE.md:12,23,65`. The guard may classify retained
  `w2-failures.json` / `peer-revival.json` / `dispatch-headroom.json` inputs, but any
  output asserting wake completeness, first-terminal vs latest status, revival,
  broadcast routing or dispatch correctness is routed to kumitate; tabi asserts only
  "the declared input says X".
- **kaidoku**: CDP only as an REA provider surface for shipped artifacts
  (`corpus/adjacency.tsv:2`) — the guard opens no endpoint.
- **revenger**: REA browser-runtime evidence is contested-open (`adjacency.tsv:5`) —
  no REA call.
- **kama**: live 9222 target census is contested-open (`adjacency.tsv:11`) — untouched.
- **kagi**: secrets/session material (`adjacency.tsv:9`; `PROVINCE.md:16-17`). The
  receipt records only node/chromium/playwright versions and requested flags
  (`receipt.json:8-13`); no cookie/token/profile content.
- **kake**: publishing (`adjacency.tsv:6`) — not implicated.
- kimi-webbridge internals split (`adjacency.tsv:10`) — not implicated: the producer
  uses Playwright persistent context (`scripts/webmcp-lifecycle-round21.mjs:41-50,165`),
  no kimi plugin and no 9222.
- Landing/VCS settlement: `final/reanchor-incident.json:2,8` puts resolution authority
  with Main parent/operator; the guard does not adjudicate reanchor or working-tree
  state. Observed, not judged: the lane worktree currently shows `LOG.md`,
  `SCORECARD.md`, `SKILL.md`, `corpus/SOURCES.md` modified and `.ufo/waves/round-22/`
  untracked; no mutation was made by this seat.
- Gap: `corpus/adjacency.tsv` has no review/orchestration-chronology row. Proposed for
  L1 (not edited here): surface `review-chronology-vs-orchestration-status`, sibling
  `kumitate`, tabi_ref `PROVINCE.md:9-13`, disposition `retained-input-only` — tabi
  classifies declared evidence; orchestration authority stays with kumitate.

## Contradictions retained (not smoothed)

- A guard "bound to browser acquisition evidence" cannot be purely acquisition-side:
  the review-return time is an orchestration observation. The honest object is a
  conditional comparison, not an acquisition-only attestation.
- Producer-hash equality is not artifact equality; browser runs differ in nonces,
  ephemeral ports and window times.
- A snapshot `readAt` is an upper bound, not a per-seat return time; seat-level event
  ordering is unavailable in `w2-returns.json`.
- W2 reviewed older bytes: that neither invalidates W2's bounded-byte findings nor
  proves final-byte review. The round-22 oracle's new expectations are the independent
  final-byte check (author-side until outside agreement).
- Absence of an event in the snapshot is not absence of activity; failures
  (`w2-failures.json:4,10`) and revivals (`peer-revival.json`, with
  `allActorQuiescenceCertified:false`) are recorded without quiescence certification.
- File mtimes in this wave (canonical runtime written `13:51:58Z`, notes rewritten
  `13:56:45Z`, new untracked `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
  at `14:53:25Z`) are filesystem observations; they are unstable across relocation and
  are forbidden as guard inputs.

## Second-order effects

- Runtime: none — no browser/CDP/REA/network/service/allocation change.
- Contract: C1 stays 12 only via the semantic oracle; the guard cannot move the value,
  grant coverage or promote a scalar. Guard exit1 for r21 is documentary debt, not an
  oracle or admission failure.
- Substrate: no sibling files, registry writes, messages, installs or VCS/jj actions.
- Verification: static only; the expected r21 verdict is `review_scope_gap` by design.
- The guard must never become a reason to re-run the acquisition or re-label W2 as a
  final-byte review.

## Risks

- Absorbing orchestration if it starts asserting wake completeness, status semantics or
  dispatch correctness → bounded by the route rule and typed `unavailable`.
- Clock false positives/negatives → digest-first, clock-fallback-only; envelope skew
  named; unknown clocks typed.
- Retroactive overclaim → identity match is labeled `reviewed_bytes_identical` with
  completeness unasserted, never "final-reviewed".
- Gate spill → keep `check-review-chronology` and `measure-c1` as separate instruments;
  do not gate C1 on the chronology classification.
- Provenance laundering → reviewed digests must be declared, never derived from the
  evaluated acquisition.

## Verification (checks for L1; none executed here)

1. Retained r21 input: reviewed `{5363d576…, receipt 323ccd…, observed
   13:49:02.529912Z}` vs final `{bc11e4d6…, receipt 4bc79636…, started
   13:51:46.773Z}` → expect `review_scope_gap`, exit1, `final_reviewed:false`.
2. Identity positive: reviewed `{bc11e4d6…, 4bc79636…}` vs same → expect
   `reviewed_bytes_identical`, exit0, even with clock unavailable; no completeness claim.
3. Producer-only positive: reviewed `{bc11e4d6…}` only → expect
   `producer_identity_match_artifact_unknown`, exit2 (ports `35363` vs `43143`; case
   digests `ae7e55…` vs `f17fe86…`).
4. Missing review fields or absent event history → expect `unavailable`, exit2,
   no reconstruction.
5. Confirm guard inputs contain no mtimes, Git times, old-counter output or live
   endpoints, and that writes stay inside its two owned files in the private clone.

Report: .ufo/waves/round-22/w1/ConnProvince.md
