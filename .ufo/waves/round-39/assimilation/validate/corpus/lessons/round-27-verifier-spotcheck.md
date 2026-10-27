# Round 27 verifier spot-check

author: hyaku closure (non-author integrator, @m_kfc)

## Conformance

- Report `.ufo/reports/round-27/tabi.md` is committed by `tabi-shokunin` commit `a9877584fab2592f3379f952c0e2b387518d346f`; SHONEN section has four `[~]` box lines. The full report cites final lane HEAD `ef8aa4a3256cc6462a60d850d7ea21277aecd2a1`; it exists and is ancestor of `refs/heads/master` (verified with `git cat-file -e` and `git merge-base --is-ancestor`). Lane state helper: `ahead=0 behind=0`, `tracked=0 untracked=0`; `git status --porcelain` empty.
- Prompt includes contract sections 1–5 and the operative run-7 addendum. Report conformance defects: Work performed does not open by declaring all claims/axes; landed-changes are not individually tied to LOG entries; Sources & frontier lacks the required census before/after counting command and tier/touched/frontier counts; round wave seat totals and dead-seat accounting are incomplete (35/36 W2 reports disclosed, no seat marked dead); dispatch report-file timing is not independently evidenced. These do not change status.
- All cited abbreviated lane commit IDs in report resolve in repository history; final HEAD is pushed on `origin/master`.

## Claim re-checks

Commands run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` against committed bytes at `ef8aa4a3256cc6462a60d850d7ea21277aecd2a1`:

- C1 calibration: `node scripts/check-selfassessment.mjs --rev ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 --json` returned `mismatches=0`, `clean=true`, `superseded=10`; nevertheless its own finding at `LOG.md:221` says claimed 8, observed 12, `superseded=true`. The report's referenced attack receipts identify that paragraph does not cite line 221, violating frozen supersession rule. **Claim failed; calibration harmed** (the claimed result is a false clear).
- C2 depth: `node scripts/check-s106-evidence.mjs --rev ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 --json` returned `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, `valid=true`. The committed lesson/report records self-test 5/5 and missing-receipt CNE/exit 2. Frozen inherited measurement-revision binding and fetch-failure requirements are absent from the round-27 claim/receipt, so counter evidence does not establish the whole claim. **Unprovable**.
- C3 coverage: `git grep -lE '^source: S107 ' ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 -- corpus/knowledge | wc -l` returned `1`; committed SOURCES census row count via `git show ...:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S[0-9]{3,}[[:space:]]*\\|'` returned `107`. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` returned `tabi ok` with 16 W04 warnings (pre-existing duplicate URLs). Counter re-measured; quarantine hand-check and source opening are committed. Frozen claim drift and unresolved S114/S140 present-row direction mean full claim conformity remains **unprovable**.

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| calibration | harmed | C1 false-clear of stale LOG.md:221 tally under frozen citation rule |
| depth | unprovable | C2 counter and gate evidence pass; inherited claim's revision/fetch binding not established |
| coverage | unprovable-but-better | one new S107-linked knowledge entry and registry row measured; frozen claim drift prevents full claim verification |

Overall not admitted: at least one claim failed and an axis was harmed.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S107 admit | admit | Committed fetched RFC 9110 bytes, `.ufo/waves/round-27/assimilation/rfc9110.txt`, §10.2.3 lines 4805–4807; registry S107 cites RFC 9110 URL | agree | Located quote is present: “Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request.” Scope and access metadata match the opened bytes. |
| S125 reject | reject | `https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/` (reported source URL); round-27 committed re-open record `.ufo/waves/round-27/quarantine/QuarantineA.md` | agree | Re-open receipt records HTTP 200 and quote search showing the quoted “Rate limits…” text absent; reject is supported, not an assumed absence. |

New source row quote check: S107's ≤25-word quote is in committed RFC bytes at the cited lines (19 words); agrees. Census command above completed successfully (`tabi ok`, 16 W04 warnings).

## Trends

- Expansion: **improved** — committed knowledge entry cites new mined S107 row, and committed registry grows 106→107; measured at final revision.
- Quality: **unchanged** — no existing entry was verified/deepened/superseded by stronger evidence; S107 is a new entry, not a quality re-check.
- Discernment: **unprovable-but-better** — outside admit/reject sample agrees, but the lane's own claim-drift and C1 false-clear prevent an improved verdict for its recorded gate decisions.

## Routed defects

- Tabi next round: repair C1's supersession matcher so it enforces citation to the superseded line; retain the failed frozen predicate and add a pre-scored claim; add committed regression coverage for unrelated paragraph/citation and ambient-fraction false clears.
- Tabi next round: preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation and test it against the measured commit.
- Tabi next round: reconcile S114/S140 present-row quarantine directive with frozen C3 scope through an operator/L0 ruling before adoption; never silently widen the frozen claim.
- Tabi next round: ensure round-prompt claim resume is byte-identical to frozen source or explicitly record non-resumption before data; provide complete wave report accounting and required frontier census breakdown.
