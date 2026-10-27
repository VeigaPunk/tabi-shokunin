# Round 25 — bfcache restore observed; six on-release sources hold (2026-10-25)

Baseline `9e13666759bcf30665abec84dec13adefc1fa86a`; claims frozen in
`.ufo/waves/round-25/claims.json` before either counter existed (includes pre-data
revisions for the history-step method naming, the before-state definitions, and the
C2 fail-closed strictness). Axes at round start: depth 8, coverage 9, operability 8,
freshness 8, calibration 9, adjacency 8. Lowest non-retired axis: **tie at 8**
(depth, operability, freshness, adjacency); C1 works depth, C2 works freshness.
Saturation 8 / window 3 retained; the stagnation nudge is inactive (capabilities
entered at rounds 22–24).

## Claims

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | depth — frontier entry: runtime observation | 0 committed bfcache receipts at baseline (swept by `git ls-tree -r --name-only 9e136667 -- corpus/evidence/round-25` → empty) → restores ≥ 1, valid | `node scripts/check-bfcache-receipt.mjs --rev <REV> --json` (`restores`, `valid`) |
| C2 | freshness — on-release source re-verification | 0 rows re-opened this round → reopened=6, unresolved=0 | `node scripts/check-source-reopen-receipt.mjs --rev <REV> --json` (`reopened`, `unresolved`) |

The goto C1 journey probe was built and executed inside the round (loopback A→B→A,
CDP `Page.navigateToHistoryEntry` history step, raw frameNavigated/ records, page
witness, negative controls: no-history step and `--disable-back-forward-cache`).
C1's history-step wording in the frozen claim named `Page.goBack`; the revision
records that this method does not exist on the build (observed -32601) and that the
real history primitive is `Page.navigateToHistoryEntry` (the index-drop check f13
covers it). Claims are measured by re-running each counting command at the delivered
tip against committed bytes; receipts record the exact measured revision and the
report cites the same hash (QUALITY 66).

## Gate (opened sources, 2026-10-25)

- **S106** — Chromium 154 `content_features.cc` BackForwardCache feature; anchor:
  decoded lines 186–187 `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)`
  with the comment `// Enable using the BackForwardCache.`; mined; used by
  `corpus/knowledge/bfcache-runtime-observed-round-25.md`.
- **S104 / S105 re-opened** — fresh fetches on 2026-10-25; both held quotes located
  again (web.dev bfcache quote at line 2531; Page.pdl `NavigationType` enum at
  decoded line 1345).
- **C2 rows** — S013/S015/S016/S020/S023/S024 re-opened with fresh bytes (HTTP 200)
  on 2026-10-25; all six held quotes located exactly once; 0 supersessions.
  S020's anchor cell still names revision `f14762e6`; today's bytes carry
  `51ed7565` + `dt-updated 2026-10-20`; moving anchors are not drift (round-18
  precedent) so no superseding row is opened.
- Census before → after: `scripts/sources-census.sh validate --root … tabi` exit 0
  at both revisions (rows 105 → 106; same W04 duplicates).
- Assimilation: none. The candidate shokuknow entry
  `webmcp-devtools-agent-surface-r25.md` was re-grounded; its tool-behavior claims
  (what `list_webmcp_tools`/`execute_webmcp_tool` do) are not supported by the
  current en/zh-TW DevTools bytes (behavioral attribution diverges; 'chooses schema
  itself' unsupported), and its staged row S242 carries an unscannable 14-column
  cell. Refused with reason and flip condition per the assimilation contract; the
  quarantine slice (38 tabi rows, round 22) stays closed with verdicts carried.

## Mistakes

### M1 — receipt-pinned measurement revision vs the report's cited commit (routed round-24 spot-check)

Class: reference-drift at landing. The round-24 receipts pinned the measurement at
`4722dbaf8efc8ba50ca9196234c4c285ab779161`, while the round-24 report's claim table
cited the final commit `8bc1d32…`; the delta was only the two receipt files, so the
verdicts were unaffected (spot-check §Routed observations). Fix, landed this round:
the measurement receipt records the exact assessed measured; the report cites that
same hash, and any later receipt-only commit is cited separately (QUALITY 66).
Shown able to fail: a red fixture whose recorded revision differs from the cited
revision fails `scripts/check-measurement-binding.mjs` (wave-1 ExecLessonEvidence).
Note: the original spot-check text accidentally wrote the short hash as
`4722dba`; the full hash is `4722dbaf8efc…` (it is not `4722dba…` in the receipt
file). The claim table of this round cites `870fab29977a2ab8cbee7fbe0e6dc4ef87ff6009`
(measurement commit) and the final delivery tip separately.

### M2 — probe harness awaited a finish signal that never fired (this round's own build)

Class: probe-harness liveness bug. The wave-1 `ExecHarnessC1` probe's first positive
attempt ended with Node exit 13 (a script left waiting on something that never
finishes) because the driver was still awaiting a log-file finish signal after the
browser and server were killed. Fixed inside the seat by making the driver exit once
the captured runs finish; the fixed probe produced the three runs (positive +
two negative controls) with clean shutdowns. Shown able to fail: the pre-fix run
recorded exit 13 and the post-fix runs exited 0 with cleanup proof; both are in the
seat's report and its scratch notes.

## Corrections

None. S020 anchor drift is recorded, not corrected (round-18 precedent). The only
registry add is S106; no row's cells were rewritten. The round's probes ran in the
lane's scratch; the committed evidence is the receipt plus raw event log, screenshots
and control summary under `corpus/evidence/round-25/`.
