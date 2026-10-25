# Round 26 — frozen claims; wrap-up lands routed evidence, claims unexecuted (2026-10-25)

Baseline `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`; claims frozen in
`.ufo/waves/round-26/claims.json` before any wave ran (`frozenBeforeData: true`,
no `revisions`). Axes at round start: depth 8, coverage 9, operability 8,
freshness 8, calibration 9, adjacency 8. Lowest non-retired axis: **tie at 8**
(depth, operability, freshness, adjacency); C2 works depth (tie), C1
calibration 9, C3 coverage 9. Saturation 8 / window 3 retained; stagnation
nudge inactive (capabilities entered at rounds 22–25). No axis retired.

**Round shape (operator wrap-up).** The orchestrator ended the run mid-round:
"start no new waves … land NOW with what you have". No wave was dispatched —
wave 1 was built (34 seats, spec validated under policy v1, exit 0,
`w1-dispatch.json` produced) but never sent; wave 2 never built. Per the
run-6 amendment a round whose swarm never ran gets **no falsification credit**:
all three claims are recorded **failed (not executed)** in SCORECARD.md, not
prettified. The frozen claims, the validated spec, the census-before, the
routed-defect resolutions and this lesson are the landed work.

## Claims (frozen, all unexecuted)

| Claim | Axis | Frozen before → after | Counting command | Disposition |
|---|---|---|---|---|
| C1 | calibration | extended `check-selfassessment.mjs` m1 window to LOG.md: ≥1 mismatch at baseline (LOG.md:1664 stale `12/12`) → 0 at tip after append-only corrections | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) | **failed — not executed**: counter extension never built (no wave). The LOG correction block this round supersedes :1664 on the measured oracle (cases=13), but no instrument proves the window. |
| C2 | depth | 0 committed S106 evidence bytes → `check-s106-evidence.mjs --json` `valid=true` | `node scripts/check-s106-evidence.mjs --rev <REV> --json` | **failed — not executed**: the counter was never built. The routed evidence itself LANDED (decoded bytes + receipt, see Gate) as round-25 closure defect 4's resolution. |
| C3 | coverage | 0 → ≥1 entry citing new row S107 (assimilation of the staged redirect/Retry-After theme) | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **failed — not executed**: no seat re-grounded any source; nothing appended; registry untouched (rows 106 → 106). |

## Gate (sources opened this round, 2026-10-25)

- **S106 re-opened (decoded)** — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT — access 2026-10-25; the `?format=TEXT` transfer is **base64** (encoded 98,604 B, sha256 `f17347b2…`); decoded 73,952 B / 1,624 lines, sha256 `9b93fe64…`; located quote (line 187): "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);" with line 186 comment "// Enable using the BackForwardCache." — exactly the S106 row's anchor; the token occurs once in the file. **Admit** as committed evidence: `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` + `s106.json`. This closes routed defect 4 (the round-25 closure reader read the encoded transfer as text).
- **Assimilation set: no verdicts this round.** The staged candidates were not re-grounded (no seats; the L1 wrap-up landing adds no row without the §10 machinery: re-grounding, collision guard, scratch census gate). The staged **S125 row is pre-noted as a likely refuse** (its document already stands in this registry as S102 — a within-scope duplicate URL) and **S142 as a likely refuse** (overlap with S124's §15.4 ground); both stay staged, unadjudicated, until a round with seats re-grounds them. Registry unchanged: 106 rows before → 106 after, census exit 0 both ends. Quarantine slice (38 tabi rows): closed since round 22, verdicts carried, nothing adopted. `considerthese/`: no such directory in this lane — noted per the contract.
- Census before → after: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0 at both ends (`.ufo/waves/round-26/census-before.txt` and the round report).

## Mistakes

### M1 — round-25 report landed at the wrong path without SHONEN (routed defect 1)

Class: landing-discipline (report contract). Evidence: fleet repo history —
`git -C /home/vgpnk/Projects/shokunin log --oneline -- .ufo/waves/round-25/tabi.md`
shows the round-25 report first committed at the wrong path
`.ufo/waves/round-25/tabi.md`; the round-25 verifier spot-check §Conformance
records it. Captured-by: **none** — no pre-flight check existed. Fix, landed
this round: the round-26 report is written at the contract path
`.ufo/reports/round-26/tabi.md` with every required section including
`## SHONEN` in its first commit (this report). Fix shown able to fail: the
check is the report contract itself — the round-25 first landing is the red
existence proof of the failure mode; the utility (`scripts/report-contract.mjs`)
that would mechanize it was specced (ExecReportPreflight) but NOT built this
round (no waves) — the mechanization is owed, named in the round report, not
silently claimed.

### M2 — decoded-source transfer misread (base64 `?format=TEXT`)

Class: evidence-encoding assumption. Evidence: the round-25 closure
spot-check's S106 "Disagree" (the reader saw "only a tiny text transfer with no
readable cited feature lines") and its erratum decoding base64 to find line 187.
Captured-by: none — the S106 row said "decoded text lines 186-187" but nothing
pinned the transfer encoding. Fix, landed this round: the decoded bytes +
sha256 + encoded-sha256 + transfer note are committed
(`corpus/evidence/round-26/sources/`, receipt `s106.json`); a QUALITY criterion
encoding "googlesource `?format=TEXT` rows carry committed decoded bytes +
sha256" is **proposed** (next free id 67 after Q66) but not appended this round
— no waves, and a criterion append without the review seat's read is exactly
the kind of unreviewed prose the lane's bar forbids. Named, not silently
dropped: it is the first item of the next round's planned work.

## Corrections

- **LOG.md supersession block (append-only)** in the round-26 LOG entry:
  "Correction (supersedes LOG.md:1664): `scripts/round-evidence-audit.mjs
  --selftest` measured `cases: 13` at `4ad4c77`; the round-23 entry's
  `12/12` restates the pre-`43e9bb5` tally." — factually measured by the L1
  this round (`node scripts/round-evidence-audit.mjs --selftest` →
  `cases: 13`, exit 0). Recorded as a prose correction; no counter window
  proves it mechanically (C1 failed).
- No registry cells rewritten; no prior-round bytes touched. Routed defect 3
  (untracked `.ufo/waves/round-25/w2/swarm-registry.json`): resolved by
  committing it as round-25 wave evidence (validator-produced roster of the
  validated-but-undispatched W2, per the round-25 closure erratum).
