# Round 28 — revision-bound evidence and exact citation matching (2026-10-25)

Baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. Frozen claims and before-controls: `.ufo/waves/round-28/claims.json`; wave evidence in `.ufo/waves/round-28/w1/`.

## Gate

- **S106 source reopened this round (admit):** S106, Chromium 154 `content_features.cc` decoded bytes at `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc:186-187`. Located quote at line 187: `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` (9 words). Registry scope S106 is specifically the shipped feature enablement at the pinned tag; this is source evidence, not a new browser observation. Accessed 2026-10-25 by reading committed lane bytes; no URL fetch performed.
- **S125 reopened this round (reject):** https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt, access 2026-10-25, re-opened with `read`; document identifies itself as “Cookies: HTTP State Management Mechanism” (Abstract, first page). The previously recorded S125 rate-limit quotations are not supported by this cookie draft; retain rejection, flip only if exact rate-limit language is found in the cited source. No S125 status change.
- No new source rows, status/recheck/used-by changes, or corpus knowledge admissions. Considerthese directory absent.

## Mistakes

### M1 — revision identity was underspecified as a commit-hash equality

Class: evidence-provenance / counter design. Evidence: wave connector `w1/Conn01.md:22-27`, `w1/Conn03.md:30-35`; S106 round-27 routed defect `round-27-verifier-spotcheck.md:47`. A receipt cannot contain the hash of the commit that contains that receipt; strict equality is circular, while ancestry-only comparison does not prove the source bytes at the claimed measured revision. Captured by `corpus/QUALITY.md:22` measurement binding and AXES claim-sizing rule; those are not sufficient to choose a non-circular predicate. Fix attempted: gate now resolves `measured_rev` and hashes the bytes at that revision against the receipt, while also requiring the bytes at the evaluation revision to match. Paired self-tests were added. The L1 did not execute verification after integration; therefore the fix has not yet been shown able to fail and M1 remains an unproven correction, not a passed quality criterion.

### M2 — line-shaped timestamps were mistaken for citations

Class: counter false-clear. Evidence: committed prior verifier `round-27-verifier-spotcheck.md:15`; this-round baseline attacks `w1/Crit01.md:39-52`, `w1/Crit07.md:22-40`. The matcher treated any `:<digits>` as proof a stale LOG tally was cited; unrelated `LOG.md:999` and timestamps could satisfy it. Captured by the frozen exact-line predicate in claims C2 and `CORPUS.md` claim sizing; the implementation now parses `LOG.md`/`SCORECARD.md` line/range citations and requires the stale line to fall in that citation. Added unrelated-line and timestamp self-test cases, alongside the existing exact-line positive control. Post-edit self-test was not run, so effectiveness is not verified.

## Dispositions

C1 depth and C2 calibration remain **unverified pending the main integration verification**. The exact counters, results, and commit are recorded in the report and SCORECARD. No outside spot-check is claimed; all dispatched seats are author-side.
