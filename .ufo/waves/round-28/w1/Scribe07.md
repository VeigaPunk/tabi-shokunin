# Scribe07 — Round 28 source-gate audit

## Axes and scope

- **Depth (C1):** Frozen target is S106 receipt revision binding, matching/mismatching cases, preservation of missing-source could-not-evaluate (CNE), at least 7 selftest cases, and a revision-valid committed target receipt.
- **Calibration (C2):** Frozen target is exact-citation-only m1 tally supersession, with LOG.md:221 still a mismatch absent an exact-line correction and both negative and positive tests.
- This assignment asks only for source-gate audit: identify at least one admitted source, one reject, and an opened S-row for this round. It does not request another claim or any production edits.

## Frozen claims and provenance

Read `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (lines 1–16). It says `frozenBeforeData: true` and baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; C1 and C2 exact predicates are at lines 11–12. `notClaimed` at line 14 explicitly says no source-admission claim. The same file records `considerthese directory absent at baseline` in its note on line 14.

Observed with command:

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log -1 --format='%H %s' eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain | wc -l && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD`

Output: baseline resolved; subject `round-27 verifier spot-check (integrator, hyaku): non-author admit/reject`; status line count `1`; HEAD equals baseline. The one untracked path is round-28 wave evidence, consistent with the assignment. No tracked changes were made by this seat.

## Source gate: admitted, rejected, and opened row

**[OBSERVATION] Prior evidence provides both an admitted row and a refused/rejected row, but it is round-27 evidence, not round-28 evidence.** `corpus/lessons/round-27.md` in the baseline states under `## Gate` that S107 was admitted after opening RFC 9110 bytes, and that staged S125 was refused after a fresh reopen found its quoted rate-limit text absent. The detailed audit is `/.ufo/waves/round-27/quarantine/QuarantineA.md` (repo-relative path below): S125 § row at lines 98–104 records URL, HTTP 200, 146,976 bytes, and zero rate-limit quote hits; lines 108–119 list S125 as absent/refuse. This satisfies the requested admitted-plus-reject examples only as historical precedent; it is not proof of an admission or rejection in this round.

**[OBSERVATION] The feasible current claim source is S106, not a new SOURCES admission.** At baseline, `corpus/SOURCES.md` row S106 names Chromium 154 `content_features.cc` and its BackForwardCache default-enable anchor. The committed source bytes and receipt are at `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` and `corpus/evidence/round-26/sources/s106.json`. The receipt gives the source URL, decoded-byte digest, and anchor line 187. Frozen C1 is specifically about binding this existing receipt to the measured revision. It neither makes a source-admission claim nor provides evidence of a newly opened source.

**[OBSERVATION] Registry and census baseline.** Commands:

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S[0-9]{3,}[[:space:]]*\\|'` → `107` registry rows.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/SOURCES.md | awk -F'|' 'NR>14 && $0 ~ /^\\|/ {gsub(/ /,"",$9); s[$9]++} END {for (k in s) print "<" k ">", s[k]}' | sort` → `<mined> 79`, `<queued> 19`, `<rejected> 9`.
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi; echo EXIT=$?` → `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`, exit 0; emitted 16 W04 duplicate-URL warnings. This is a structure/census gate, not an opened-source or admission verdict.

**[UNKNOWN] Round-28 opened S-row.** The frozen claims explicitly disclaim source admission. The round-28 materials inspected here expose no round-28 Gate/opened-row receipt or completed current-round source audit; I did not fetch a public source or treat prior round-27 openings as new. Accordingly, this source-gate requirement is not evidenced for round 28 by this report. Do not claim current-round admission/rejection. A current-round opener must record the exact S-row, reopened bytes/source locator, access date, and located quote before asserting an opening.

## Relevant defect evidence and current measured check

The independent round-27 defect record `corpus/lessons/round-27-verifier-spotcheck.md` lines 15–17 states (verbatim, 12 words): “its own finding at `LOG.md:221` says claimed 8, observed 12, `superseded=true`.” Lines 46–47 route the exact-citation supersession repair and S106 revision/fetch binding. This is historical defect evidence, not a current C2 run.

Command run at baseline: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --selftest --json` → `cases: 5`, `passed: 5`, `ok: true`. The result includes a valid clean fixture and `missing-receipt-could-not-evaluate` with exit 2. This is the unmodified baseline control; it does not meet frozen C1’s target of at least 7 cases and contains no observed revision-binding cases. The separate round-26 receipt inspection confirms the receipt shown has no revision field. No claim is made about a post-fix state.

## Touched surfaces, limits, and report path

Only this report was written: `.ufo/waves/round-28/w1/Scribe07.md`. No production files, source registry, lesson, tracked report, or scratch fixture was edited. No installations or updates. No source fetch, external interaction, build, lint, formatter, or product test was run. No claim is made about C2 current counter output or round-28 implementation results. Negative scope statements are limited to the inspected round-28 frozen claims and available wave files, not a repository-wide sweep.

**Report path (relative to lane root):** `.ufo/waves/round-28/w1/Scribe07.md`
