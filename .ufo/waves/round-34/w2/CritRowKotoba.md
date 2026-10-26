# CritRowKotoba — wave 2 falsify, map row 17 `agent-facing-tool-text-craft`

## Verdict

**DEFECT — severity high: map row 17 is not a split. Withdraw it** (`corpus/adjacency.tsv`, surface
`agent-facing-tool-text-craft`, sibling `kotoba`, sibling_ref `...sibling-overlap-census-round49.md:171`). The
sibling-side quote is kotoba's *report of tabi's own round-16 wave draft*, and in the same bullet kotoba rules the
relationship `none` ("It never reached tabi's scope surfaces, so the row stays `none` under the rule's wave-report
exclusion"); kotoba's own census rows say `none` at the row's pin (`:86`) and at its later re-pin ("a citation, not a
split, so tabi stays `none`", round-74 census `:150-152`), and kotoba's `SKILL.md` never names tabi at the pin
(`grep -c -w -i tabi` → 0). A `split-declared` row needs both sides to state the split; here one side states it twice
(tabi's declaration and tabi's own `.ufo` draft) and the sibling states the negation. The tabi declaration that backs the
row (`SKILL.md:2923`) additionally cites `kotoba PROVINCE.md:13` for a claim that line does not carry: at the row's own
pin `:13` scopes "Agent-definition, always-on (AGENTS.md-class) and dispatch-prompt craft" over three kotoba notes and
contains none of `tool|description|schema|webmcp` (token count 0). The only axis that holds is quote fidelity: both
quotes are verbatim on their cited lines (grep -F count 1 each) and the gate verifies the row structurally
(`ADJACENCY verdict=clean rows=17 verified=17`, exit 0) — the gate checks verbatim existence, not that the sibling stated
a split, which is exactly the hole C1's `feasibilityDisclosed` assigns to this wave.

Secondary defect (same row, inseparable): the three screens that continue the bullet — census49 `:172`, `:173`, `:175`
(`corpus/adjacency-screen-skill.tsv` rows 8-10) — are reasoned `same-surface` against `agent-facing-tool-text-craft`.
That surface exists only because of row 17, so the ledger rows assert "same boundary as the row" while the row's ground
is the same sentence. Withdrawing the row without re-screening them makes them unaccounted: probed below, the counter
returns `unaccounted 3` and `screen-surface-unmapped` on all three.

Impact on C1: `newMapped` falls 4 → 3, exactly the floor (`>= 3`). The row is the only slack in the predicate; it is not
harmless even though the predicate still passes after the correction.

## Evidence (commands, exit codes)

Work: one shared clone of the lane at the wave-1 integration
(`git clone --shared … ; git -C clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa`, toplevel asserted
`/fast/scratch/hyaku/tabi-r34/CritRowKotoba/clone`). All lane scripts run there; the lane checkout was only read via
`git show`. No lane file, index, jj state or fleet file written.

1. **The row as landed** (`git -C …/tabi-shokunin show 04f9623…:corpus/adjacency.tsv`, `awk -F'\t' '$2=="kotoba"'`):
   `agent-facing-tool-text-craft / kotoba / kotoba-shokunin@65a5c7a6…:corpus/knowledge/sibling-overlap-census-round49.md:171
   / "tabi's round-16 wave drafts state a split with kotoba" / SKILL.md:2923 / "the craft of those names, descriptions and
   schemas as agent-facing text a model reads stays kotoba's" / split-declared / -`.
2. **Sibling line in context** (`git -C kotoba-shokunin show 65a5c7a6…:corpus/knowledge/sibling-overlap-census-round49.md`
   `| sed -n '171,175p'`): the bullet reads "- **tabi** (seat `RowTabi.md`): tabi's round-16 wave drafts state a split with
   kotoba ("kotoba owns the craft of such text … Route craft findings to kotoba", tabi `.ufo/waves/round-16/drafts/
   DraftAdjacency.md:39` at the pin) over tool names, descriptions and schemas as agent-facing text. **It never reached
   tabi's scope surfaces, so the row stays `none` under the rule's wave-report exclusion** …; a later round should ask tabi
   whether to land it." → the proposition is about *tabi's drafts*; the sibling's own verdict is `none`, and the cited
   evidence is a `.ufo/` wave draft, which `scripts/check-adjacency.mjs:76-78` refuses as a sibling_ref precisely because
   "wave scratch is not a province-level claim".
3. **kotoba does not claim the craft there** — `git show 65a5c7a6…:corpus/knowledge/sibling-overlap-census-round49.md |
   sed -n '86p'`: `| tabi | master | e3cf4e0d… | SKILL.md | none | …`. Round-74 census `:150-152` (same pin):
   "tabi's frozen `SKILL.md` body carries the whole word twice … a citation, not a split, so tabi stays `none`". kotoba
   `SKILL.md` at the pin: `grep -c -w -i tabi` → `0`. So no sibling line under this surface states a kotoba-side claim.
4. **False provenance in the declaration** — `git show 65a5c7a6…:PROVINCE.md | sed -n '13p'` = "- Agent-definition,
   always-on (AGENTS.md-class) and dispatch-prompt craft — `corpus/knowledge/agent-defs-commands-and-round-prompts.md`,
   …" and `grep -c -E 'tool|description|schema|webmcp'` on that line → `0`. `SKILL.md:2923`'s citation
   "(kotoba `PROVINCE.md:13`)" therefore does not support "the craft of those names, descriptions and schemas … stays
   kotoba's"; kotoba's documented tool-text ground at that pin is MCP server `instructions` (kotoba `SKILL.md:75-76`,
   about the server-wide text, naming a tool's `description` only as where a single tool's inputs belong).
5. **Tabi's own half is grounded** (the row's *only* sound part): `SKILL.md:2923`'s "records the `toolsAdded` tool `name`,
   `description` and `inputSchema` verbatim" is backed by `corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-60`
   (declarative-form derived `inputSchema`; `registerTool({name, description, inputSchema, execute})`) and by
   `PROVINCE.md:13` "dynamic-page evidence patterns (what to capture so a claim about a page is re-verifiable)". The
   problem is not tabi's ground; it is that tabi unilaterally assigns ground the sibling has declined.
6. **Quotes verbatim** — `git show …census-round49.md | sed -n '171p' | grep -c -F "tabi's round-16 wave drafts state a
   split with kotoba"` → `1`; `sed -n '2923p' SKILL.md | grep -c -F "the craft of those names, descriptions and schemas as
   agent-facing text a model reads stays kotoba's"` → `1` (line length 407 bytes; 19 words, sibling quote 9 words — inside
   the 4-25 word / >=20 non-space-char bounds).
7. **Gate** — `node scripts/check-adjacency.mjs --at 04f9623… --repo . --fleet /home/vgpnk/Projects/shokunin` →
   `ADJACENCY verdict=clean rows=17 verified=17`, exit `0`. The gate cannot catch this defect by design (header `:90-94`:
   for split rows "the committed refinement of 'both quotes state the split' is exact verbatim existence").
8. **C1 counter at the integration** — `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --repo <clone>
   --fleet /home/vgpnk/Projects/shokunin --rev 04f9623… --json`, exit `0`: `predicate true, candidates 67, mapped 5,
   screened 62, unaccounted 0, newMapped 4` — `newMappedRows` = 15 live-delivery-observation, 16
   lab-performance-tool-runs, **17 agent-facing-tool-text-craft**, 18 authenticated-consequential-driving.
9. **Withdrawal probe (scratch clone, `git -c user.name=CritRowKotoba -c user.email=CritRowKotoba@scratch.local`,
   toplevel asserted)** — rev `2a86f87`: delete row 17, append one screen row for census49 `:171` reason
   `third-lane-report` → counter exit `0`: `predicate false, newMapped 3, unaccounted 3`, `screenFindings` =
   rows 8/9/10 `screen-surface-unmapped` "agent-facing-tool-text-craft kotoba". Rev `4bef9ba`: additionally re-screen
   `:172/:173/:175` as `third-lane-report` (surface `-`) → counter exit `0`: `predicate true, mapped 4, screened 63,
   unaccounted 0, newMapped 3, adjacency clean rows=16 verified=16`, `findings []`.

## Smallest safe correction (L1 to apply; this seat repairs nothing)

1. Withdraw map row 17 (`agent-facing-tool-text-craft` / kotoba / census49 `:171`) — the sibling side declares no claim
   (siblings' own verdicts `none`), and the only ground is tabi's `.ufo` wave draft, which the gate refuses as evidence.
2. Add the screen row the withdrawal needs: `kotoba-shokunin@65a5c7a6…:sibling-overlap-census-round49.md:171`
   reason `third-lane-report` (the bullet's subject is tabi's draft; same reason already used for the sibling's `:86`
   roster line at ledger row 7), surface `-`, quote "tabi's round-16 wave drafts state a split with kotoba" (9 words),
   note naming that kotoba rules the row `none` and defers ("a later round should ask tabi whether to land it"), so tabi
   cannot land the sibling's side for it.
3. Re-screen `:172`, `:173`, `:175` (ledger rows 8-10) with a non-`same-surface` reason and their notes reworded — their
   current reason and notes are circular once row 17 is gone (they say "the split's own quoted text" / "the boundary now
   mapped as agent-facing-tool-text-craft"). `third-lane-report` is the exact reason; `no-claim-declared` would also
   account them but clashes with the subject of the sentence.
4. Narrow `SKILL.md:2923`: keep tabi's practiced half (verbatim capture, no wording grade — grounded at webmcp
   `:59-60`), drop the assignment of the craft to kotoba or restate it as "kotoba has not claimed this (`census
   'round49.md:171` rules the row `none`); tabi grades no wording and routes any such finding to the operator". The
   `(kotoba PROVINCE.md:13)` citation cannot stay: that line carries none of `tool/description/schema/webmcp`.

After (1)-(3) the probe shows C1 still passes at `newMapped 3 / unaccounted 0 / adjacency clean` — the floor. Any second
withdrawal among rows 15/16/18 therefore fails C1 outright; the round should find a replacement candidate row rather than
spend this slot on a one-sided split.

## Axes attacked

| axis | finding |
|---|---|
| real overlap, distinct from every boundary | **fails**: the sibling's only statement is a report of tabi's `.ufo` draft plus the verdict `none`; no sibling-side claim exists to overlap with |
| tabi declaration claims practised ground without absorbing the sibling's | half: practice is grounded (webmcp `:59-60`); provenance is false (kotoba `PROVINCE.md:13` carries no tool/description/schema ground) and the line cedes ground the sibling declines |
| disposition | **fails**: `split-declared` on a one-sided statement; `refused-route` would also fail (no sibling-side claim line to route to, and tabi's refusal is not in `PROVINCE.md`'s `Refuses:` list) |
| quotes verbatim / on the cited lines | holds (grep -F 1, 1; gate verifies 17/17) |
| ledger consistency | fails: `:172/:173/:175` screened `same-surface` on the withdrawn surface — circular |

## Deliverables

- Report (this file): `.ufo/waves/round-34/w2/CritRowKotoba.md`
- `.ufo/waves/round-34/w2/CritRowKotoba/c1-at-04f9623.json` — counter `--json` at the integration (newMapped 4, row 17 present)
- `.ufo/waves/round-34/w2/CritRowKotoba/c1-withdraw-probe-4bef9ba.json` — counter `--json` after the full correction (predicate true, newMapped 3)
- `.ufo/waves/round-34/w2/CritRowKotoba/withdraw-probe.patch` — the probe diff (`04f9623..4bef9ba`: row 17 deleted, 4 screen rows)
- `.ufo/waves/round-34/w2/CritRowKotoba/kotoba-sibling-side.txt` — pinned sibling bytes (:13 token count 0, census49 :86/:171-:175, census74 :150-152, SKILL.md whole-word tabi count 0)

Scratch `/fast/scratch/hyaku/tabi-r34/CritRowKotoba/` deleted after copying the receipts above. No tool installed or
upgraded; no network fetch; no browser launched.
