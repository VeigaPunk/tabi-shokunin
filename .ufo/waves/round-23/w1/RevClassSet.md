# RevClassSet — are the six classes exactly the round-22 routed defects, each decidable?

Seat L1Tabi23.RevClassSet (reviewer, read-only; no spawns, messages or installs). Baseline `a89f1935…`.
Reviewed `claims.json` C1, `corpus/lessons/round-22-verifier-spotcheck.md` §Routed defects 1–6, and
the now-present `scripts/round-evidence-audit.mjs` (725 lines, untracked). `--selftest` is the L1's gate.

**Verdict:** no class is invented; the map is 1:1 for routed 1/2/3/4/6, but routed item 5 carries a
second sub-defect no class derives, and two frozen-contract breaks stop a reproducible 6/6: the
claim's counting command **exits 2** against the implementation, and c2's round-cap fact is decided
by a caller-supplied number. All six do fire on round-22 evidence — only under `--round-cap 128`,
which the frozen command omits.

| # | Routed defect | Class | Round-22 derivation | Verdict |
|---|---|---|---|---|
| 1 | 23 vs 24 whole-payload refusals | `c1-refusal-arithmetic` | lesson `:130` cites 23; 13+11=24 receipts | faithful |
| 2 | 65 > band 64 **and** 129 > 128 | `c2-wave-caps` | `w2b-spec.json` 65; spawned 64+0+65=129 | band arm faithful; round arm unbound (F2) |
| 3 | `## Gate` lacks spot-check result | `c3-gate-spotcheck` | Gate `:13-69`, 0 spot/closure hits | faithful; arm 3 loose (F6) |
| 4 | Stale-lane not graded per attempt | `c4-stale-attempts` | report `:3` one line, ≥2 attempt artifacts | faithful; input uncommitted (F3) |
| 5 | W2b registry no seat ids **+ attempt 1..11 vs `attempt: 12`** | `c5-registry-identities` | 65 null `agentId`, spawned wave | ids faithful; clause 2 **dropped** (F8) |
| 6 | Landed row cites `47bfb5f`, no LOG entry | `c6-landed-log-binding` | row `:85`; `47bfb5f` touches no `LOG.md` | faithful; input uncommitted (F3) |

No seventh class; nothing merged (item 1's "64/65 seats" and item 2's 65 are one wave-cap fact).
## Findings

**F1 [blocker] The frozen counting command cannot run.** C1 counts with
`node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --json`; `grep -n 'round-cap is required'
scripts/round-evidence-audit.mjs` shows the parser refuses that form (exit 2). The claim is frozen, so
the script must default the cap from the round contract (`lane-addendum.md:52`), recording that source.

**F2 [high] `--round-cap` has no authority check; 129>128 is caller-decided.** `--policy` is
validated against fleet authorities, tighten-only; `--round-cap` accepts any positive number and is
echoed with no provenance in `inputs`. With `--round-cap 200` the round arm cannot fire. The only c2
red case is `c2-red-spec-above-band` (no red for round-total-over-cap; the green passes cap 4 from the
fixture). Bind the cap (path+sha256) or move the round arm under the policy authority.

**F3 [high] c4/c6 read a working-tree file, not committed bytes.** `--report` defaults to
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-${round}/tabi.md` via `readFileSync`;
`reportSha256` is recorded but never compared with the committed blob, though one exists
(`git -C /home/vgpnk/Projects/shokunin cat-file -e 69449ed:.ufo/reports/round-22/tabi.md` → present).
Add `--report-rev`, compare blobs, fail closed on mismatch.

**F4 [medium] c1 takes `Math.max` of cited figures, masking a stale one.** `extractRefusalCitation`
(`:190-195`) returns the max. Routed defect 1 lets 23 survive only with a correction naming it
superseded; as written a round saying 24 once and leaving "23 whole-payload refusals" uncorrected
reads clean (round-22 still trips: 24 receipts vs 23 at lesson `:130`). Require every citation ==
receipts, or accept a lower figure only beside a correction marker.

**F5 [medium] c6's `bindsElsewhere` escape is unchecked text.** `/LOG entry lands in/i.test(row)`
clears a row without verifying the named commit touches `LOG.md`; the c6 green fixture
(`c6-green-entry-bound-elsewhere`) passes on exactly that phrase. Parse the hash after the phrase and
require it in `filesOfCommit`.

**F6 [medium] c3's third arm is a keyword matcher.** `/non-author/i && /closure|verifier/i` inside
Gate clears: round-21 clears via `corpus/lessons/round-21.md:63` (control holds), round-22 trips, but
a Gate saying "non-author verifier" with no result clears while committing the same defect. Tighten
to the committed witness: if `corpus/lessons/round-<N>-verifier-spotcheck.md` exists at `--rev`, Gate
must cite it. That witness landed at `a89f193`, so at `be271a2` only keyword arms are in play.

**F7 [low] Envelope deviates from the frozen API.** Contract `{…, classes:6, clean}`; the script emits
`classIds`, `perClass`, `findingClasses`, `roundCap`, no numeric `classes`. The counter field
(`findings[].class` distinct) works, so C1's measurement survives.

**F8 [dropped routed clause] Item 5's attempt numbering is underived.**
`grep -o '"attempt"[^,]*' .ufo/waves/round-22/w2b-spawn-result.json` → `12` while
`ls .ufo/waves/round-22/w2b-cap-refusal-*.json` → `01`–`11`. Decidable from lane bytes, derived by no
class: widen `c5`'s `derived` under the same id (six stays); a seventh would break the target.

## Checks that pass

- `c5` skips never-spawned waves correctly: `.ufo/waves/round-22/w2/swarm-registry.json` has 64 null
  ids but no `Spawned N background agents` marker, so `spawned=0`; w1/w2b markers give 64/65, total 129.
- Round-21 control: c1 (no refusal citation at that rev), c2 (64+64=128, no 65-seat spec), c5 (0 nulls
  in `round-21/*/swarm-registry.json`), c3 (F6 arm 3). `section()` stops at the next `## `, so
  round-22's `## Honest bounds` `:149-150` cannot leak into the Gate judgement.

## Verification gaps

- `--selftest` and the control runs were not executed here; F1's exit 2 is read from the parser.
- c4/c6 round-21 cleanliness is unverified — the input is the fleet report, outside this item's read
  scope, and C1's control text requires it. No operability credit judged: fidelity and decidability only.
