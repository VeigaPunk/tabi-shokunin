# C3 contract review — routed items 1, 2, 4

## Verdict

Two medium findings: C3 d3 does not cover all of routed item 4, and d4's current `git status --porcelain` snapshot cannot establish its stated lane-write exclusion. No d1–d4 rule requires rewriting a frozen or filed file. d1/d2 call for new append-only LOG/SCORECARD entries; d3/d4 create new round-19 records. Keep all round-18 files, including the spot-check and its cited registries/validation snapshot, unchanged.

## Findings (severity order)

### Medium — d3 can pass while routed item 4's `agentId:null` remains

The spot-check's item 4 records both `wave:null` in the two round-18 registries and `agentId:null` in the round-18 w1 validation snapshot (spot-check lines 158–159). C3 d3 requires a `wave`-to-spec match for round-19 `swarm-registry.json` files and a note naming the two old null registries and their `wave` cause (PLAN lines 49–52); it has no predicate or disposition for the validation-snapshot `agentId` issue. This is present again in the current round-19 validation snapshot: `validation.json:28` gives `SrcFormSchemaFill` `agentId: null`. Consequently, a d3 pass would close only the registry-label part while leaving the routed bookkeeping defect unaccounted for, yet C3 presents d1–d4 as the four routed closures.

Keep the round-18 snapshot frozen. Either explicitly disposition `agentId:null` as a residual that is not credited as closed, or add a checkable round-19 record/predicate for it; do not silently let the registry-only predicate stand for all of item 4.

### Medium — d4's before/after status comparison is not file-granular

PLAN lines 53–56 require equal before/after `git status --porcelain` snapshots except seat reports. The saved before-W1 snapshot is only `?? .ufo/waves/round-19/` (line 1). That directory-level untracked entry hides which nested paths exist; new non-report files under the same untracked directory can leave the same porcelain output. Equality therefore does not prove that only seat reports were written directly in LANE, weakening d4's proof of the round-18 worktree-isolation fix.

Use a file-granular untracked-path inventory (for example, porcelain with all untracked files shown, or an explicit recursive manifest), and compare it against the exact pre-wave set plus the allowlisted seat-report paths. This needs no edit to round-18 history.

## Rules that conform / no frozen-file edit required

- **d1 / routed item 1:** the spot-check directs a round-19 correction naming the superseded LOG text, not an in-place repair. PLAN d1 follows that form and re-derives the seven criteria from the append-only QUALITY corpus. It does not require changing `LOG.md:1059` or `corpus/lessons/round-18.md`.
- **d4 / routed item 2:** per-writer clones from B and assigned-path-limited commits are the requested next-wave remedy. The ledger is a new round-19 record; the snapshot-granularity finding above is a verification weakness, not a requirement to rewrite the prior report.
- **d2:** the plan asks for a new SCORECARD correction line; this is append-only and does not ask to replace line 830. It is not one of the selected routed items 1, 2, or 4, so this review does not assess its case-id delta against routed item 3. If a filed report is corrected, PROTOCOL requires a correcting-round report or an erratum appended after the filed bytes, never an in-place rewrite.
- **d3 historical records:** the new correction note is the right shape for explaining frozen round-18 registry bytes; the old registry files must not be edited. The missing `agentId` disposition is the sole d3 closure gap identified here.

## Residual risk and verification gaps

This was a contract review of C3 and the cited current W1 artifacts; I did not run the round-19 C3 counter or any build/test suite. No C3 runtime or same-identity reroute behavior is asserted or certified by this report. The current W1 `validation.json` does show `spawn:72`, `resume:0` (`:16–19`), so no resumed seat is evidenced in that snapshot. No tools were installed or updated.

## Source receipts

All local UTF-8 source bodies below were read on 2026-10-21; SHA-256 is over the decoded file body.

| Source / anchor | Verbatim excerpt (≤25 words) | URL | SHA-256 |
|---|---|---|---|
| Round-19 PLAN, lines 43–69, 71–88 | “every round-19 `swarm-registry.json` carries `wave` equal to its spec's `wave`” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md#L43-L88` | `c71e721a5b5edc371c29d8180d6b0d01b757b8c5f304006566b9a61c4cd27655` |
| Round-18 spot-check, routed items 1, 2, 4, lines 143–159 | “Append a correction in round 19 naming the superseded count; do not rewrite the append-only LOG entry.” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-18-verifier-spotcheck.md#L143-L159` | `0cfc40c6999a3ff8ed34e27c22cd8afbc25eeb0abadb2d4e3620a749b4a300e4` |
| Round-18 spot-check, item 2, lines 146–148 | “the next multi-writer wave must bind each writer to its own worktree/clone.” | same URL as above | same SHA-256 as above |
| Round-18 spot-check, item 4, lines 158–159 | “both `w{1,2}/swarm-registry.json` carry "wave": null, and the w1 validation snapshot embeds `agentId: null`.” | same URL as above | same SHA-256 as above |
| PROTOCOL, lines 125–139 | “append-only files (`LOG.md`) take an appended correction entry pointing at the superseded text, never an in-place rewrite.” | `file:///home/vgpnk/.agents/skills/shokunin/protocol/PROTOCOL.md#L125-L139` | `622b29a043046f0b3b3c7a2240fe62ab516898922885685dd8d89f50b1739fd0` |
| PROTOCOL, lines 136–139 | “A filed report is a record: a correction to it lands in the correcting round's own report” | same URL as above | same SHA-256 as above |
| Round-19 W1 validation snapshot, lines 21–32 | `"agentId": null` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/validation.json#L21-L32` | `53a1390882988f969f31cc343423f4d93ee617021dfa864f1fb32c51c1d6cca1` |
| Before-W1 status snapshot, line 1 | `?? .ufo/waves/round-19/` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/isolation/lane-status-before-w1.txt#L1` | `e271694cdefbcf6132564f7723fec4bde9b3b3bd2a4be8fed0f93004c7ce2612` |
| LOG, line 1059 | “QUALITY33–38 arise from the lesson's mistake rows.” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/LOG.md#L1059` | `b2d5ff556dadd741c7542883af29f83d74158eadee5ad1bae652796a5c4c648f` |
| QUALITY, lines 140–165 | “33. A superseding source row removes the falsified premise from every cell” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/QUALITY.md#L140-L165` | `4be2546540f1c4e4a2d0939d7e563ed58f6f0494d2087932d57fb64d0eacf524` |

## Isolation

- Clone / branch: N/A — review-only seat; no production files written.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (PLAN baseline).
- Commit: N/A — this seat writes only its assigned report artifact; no git write performed.
- Changed path: `.ufo/waves/round-19/w1/ReviewC3Contract.md` (this report only).
