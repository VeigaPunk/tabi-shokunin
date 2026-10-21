# ScribeScorecardCorrection — C3 d2 assertion-delta correction draft

Seat: TabiR19-2.ScribeScorecardCorrection-4. Scope: draft only (SCORECARD.md is append-only and L1-owned).
Baseline B = 66251bfc1aef393e4aec599e950a8deb867736bb. Read-only inputs: lane `SCORECARD.md` at B,
fleet `.ufo/reports/round-18/tabi.md`, B blobs of `scripts/webmcp-invoke-round17.mjs` and `…round18.mjs`.

## Coordination status (N)

- `.ufo/waves/round-19/w1/ScoutAssertionDelta.md`: **absent** at write time (w1 holds record.json,
  swarm-registry.json, assignments.json, dispatch-result.txt, dispatch-attempts.json, validation.json,
  plan.json, spec.json). Per instruction, **N is left TBD** in the draft line below.
- Independent B-observed derivation (not reconciled with any scout): **6 of 15** (see table). The
  six-id list matches PLAN.md C3 d2 ("lists the six case ids"), but the scout seat has not confirmed it.

## Draft correction line (for L1 to paste into SCORECARD.md, round-19 section)

Option A — N not yet confirmed (use while ScoutAssertionDelta.md is absent):

> Round-19 correction (d2): `SCORECARD.md:830` and the round-18 report sentence `.ufo/reports/round-18/tabi.md:8` ("Final main run retains all11 original scenarios/four controls plus the download case (12/12)") are restated as: case IDs and pass status retained; N = TBD of 15 checks loosened from numeric CDP codes to message substrings (list: TBD pending ScoutAssertionDelta).

Option B — use once the scout confirms N=6 and the list (the B-observed list below):

> Round-19 correction (d2): `SCORECARD.md:830` and the round-18 report sentence `.ufo/reports/round-18/tabi.md:8` ("Final main run retains all11 original scenarios/four controls plus the download case (12/12)") are restated as: case IDs and pass status retained; 6 of 15 checks loosened from numeric CDP codes to message substrings (invoke-unknown-tool, invoke-after-unregister, invoke-flags-off-control, invoke-iframe-frameid, invoke-before-enable, invoke-domain-disabled).

Note the wording: the round-18 report says "retains" about the scenarios/controls set; the correction keeps the
ID/pass-status claim and removes the implication that the predicates are unchanged.

## B-observed loosened checks (15 original = 11 cases + 4 controls)

Round-17 numeric checks at B `scripts/webmcp-invoke-round17.mjs` (sha256 de62820d…b052d7) vs round-18 at B
`scripts/webmcp-invoke-round18.mjs` (sha256 d1443344…896baa). Round-18 contains **0** `-32xxx` tokens; round-17
contains 17 lines (predicates + expected objects + prose).

| # | case id | kind | r17 predicate (numeric) | r18 predicate (B line) |
|---|---|---|---|---|
| 1 | invoke-unknown-tool | case | `error.code === -32602` (r17:1177) | `/Tool not found/i.test(message)` (r18:1975) |
| 2 | invoke-after-unregister | case | `error.code === -32602` (r17:1379) | `/Tool not found/i.test(message)` (r18:2177) |
| 3 | invoke-flags-off-control | case | `error.code === -32602` (r17:1534) | `/Tool not found/i.test(message)` (r18:2332) |
| 4 | invoke-iframe-frameid | case | `error.code === -32602` (r17:1627) | `/Tool not found/i.test(message)` (r18:2425) |
| 5 | invoke-before-enable | control | `error.code === -32000 && /domain is not enabled/i` (r17:1756) | `/domain is not enabled/i.test(message)` only (r18:2553) |
| 6 | invoke-domain-disabled | control | `error.code === -32601` (r17:1873) | `typeof message === 'string' && message.length > 0` (r18:2670) — **nonempty message, not a substring test** |

Flag for L1: row 6 is loosened further than "message substring"; the draft list above names it without
that qualifier. If the scout reports it differently, Option B must be amended, not silently kept.

Counter re-derivation (matches PLAN C3 d2 contract, reproducible read-only at B):
`git show B:scripts/webmcp-invoke-round17.mjs | grep -n -E -- '-32[0-9]{3}'` (17 lines) and
`git show B:scripts/webmcp-invoke-round18.mjs | grep -c -E -- '-32[0-9]{3}'` (0).

## Source anchors

- `SCORECARD.md:830` at B (sha256 e399d24c…465368): `| coverage | 9→9 | unchanged; original11 scenarios/four controls retained; no real-site/agent-side/default-profile/Chromium152 claim |`
- `.ufo/reports/round-18/tabi.md:8` (file sha256 38ca3b6f…34a2): "Final main run retains all11 original scenarios/four controls plus the download case (12/12); six hazard predicates pass."
- Round-18 explanation of the omitted numeric code: `numericCode: 'not exposed by Playwright CDPSession'` at r18:1982 and r18:2552.

## Findings

1. Draft line produced; N is TBD in Option A because ScoutAssertionDelta.md is absent.
2. The B-derived count is 6 of 15, not 15: 15 is the denominator (11 cases + 4 controls), consistent with the round-18 report's "all11 … four controls".
3. Round-18 retained all 15 ids plus `invoke-download-refused` (r18 ids at B, lines 147–158 and case blocks).
4. One row (invoke-domain-disabled) is weaker than a substring match; L1 should decide the wording before paste.

## Tool installs

None. Only read-only `git show`, `grep`, `sha256sum`, `sed` at B and on the fleet report file. Temporary /tmp copies were removed.

## Isolation

No production files written. No clone created; no commit; no git write in LANE. Report file is the only LANE write:
`.ufo/waves/round-19/w1/ScribeScorecardCorrection.md`.
