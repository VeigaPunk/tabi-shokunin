# Round 34 w1 — C1 build: kotoba boundary (agent-facing tool text)

**Verdict.** The six kotoba candidates assigned to this seat are answered: **one new verified map row** (`agent-facing-tool-text-craft`, sibling `kotoba`, **split-declared**) on `sibling-overlap-census-round49.md:171`, and **five screen rows** (three `same-surface` on that new row, two `third-lane-report`), with zero of this slice's keys left unaccounted and zero screen findings. On the round-16 question the census raised at `:175`, the boundary *is* real in tabi's own scope and is declared now rather than treated as a third-lane report: tabi's side is fixed by existing ground — `PROVINCE.md:12-13` (dynamic-page evidence: what to capture so a claim about a page is re-verifiable) and the measured `WebMCP.toolsAdded` capture of `name`/`description`/`inputSchema` (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-60`, decision table `SKILL.md:1864-1878`) — while kotoba's side is agent-facing text craft (kotoba `PROVINCE.md:13`); tabi records that text verbatim as page-declared evidence and grades no wording, so the two sides name each other and no ruling venue is needed (`ruling_ref` `-`). Validated in a scratch clone at the freeze plus one commit: `check-adjacency` verdict `clean` (rows 14, verified 14, findings 0), C1 counter `screenFindings 0`, `newMapped 1`, my six keys absent from `unaccountedKeys`.

## Evidence

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=/fast/scratch/hyaku/tabi-r34/AdjKotoba49` (removed before yield; receipts copied first).

| # | command | exit | result |
|---|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` ; `git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` ; `git -C "$S/clone" rev-parse --show-toplevel` | 0 | HEAD `59f1b47aae277e1670e4a824173da8cde7e388ee`, toplevel `/fast/scratch/hyaku/tabi-r34/AdjKotoba49/clone` |
| 2 | `python3 build.py` (reads every candidate line with `git -C …/kotoba-shokunin show <pin>:<path>`, asserts each quote is a verbatim substring and 4–25 words / ≥20 non-space chars, writes the deliverables, appends the section to `SKILL.md`, appends the map row, writes the screen ledger) | 0 | `declaration line: 2921`; quotes asserted by construction, then re-checked with `grep -F` (row 5) |
| 3 | `git -C clone -c user.name=AdjKotoba49 -c user.email=AdjKotoba49@scratch.local commit` | 0 | `1ffd51dfc7783883184ed56e11d43845833a143c` — `SKILL.md +6`, `corpus/adjacency-screen-skill.tsv +6`, `corpus/adjacency.tsv +1` |
| 4 | `TMPDIR=$S node clone/scripts/check-adjacency.mjs --at 1ffd51dfc7783883184ed56e11d43845833a143c --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | 0 | `{"verdict":"clean","rows":14,"verified":14,"findings":[]}` (`adjacency-gate.json`) |
| 5 | `TMPDIR=$S node /home/vgpnk/…/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 1ffd51dfc7783883184ed56e11d43845833a143c --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | 1 | `adjacency=clean`, `candidates=67`, `mapped=2`, `screened=5`, `unaccounted=60`, `newMapped=1`, `newMappedRows=[{row:15,surface:agent-facing-tool-text-craft,sibling:kotoba,disposition:split-declared}]`, `screenFindings=[]`; every one of this seat's six keys is absent from `unaccountedKeys` (`c1-counter.json`) |
| 6 | `grep -c -F -- '<quote>' sib-census.txt` / `sib-audit.txt` / `skill-new.txt` (bytes from `git show`) | 0 | each of the 7 quotes: count `1` (`quote-checks.txt`) |

Exit 1 on row 5 is the **wave-level** predicate, not this slice: it requires `unaccounted == 0` and `newMapped >= 3` across all 67 candidates, and 60 candidates belong to the other C1 seats (kake 13, kaidoku 9, mori 8, kotoba 13 after dedup, kumitate 5, tameshi 5, kagi 4, kama 4, kasegi 3, tsukuroi 2, chousa 1). This slice contributes 1 of the ≥3 new rows with all of its own keys accounted.

## Decisions (per candidate, grounded both sides)

- `sibling-overlap-census-round49.md:171` → **map row 15**, surface `agent-facing-tool-text-craft`, `split-declared`. `sibling_quote` = `tabi's round-16 wave drafts state a split with kotoba` (names both lanes). `tabi_ref` = `SKILL.md:2921` (new DECL1), `tabi_quote` = `the craft of those names, descriptions and schemas as agent-facing text a model reads stays kotoba's`; `ruling_quote` = `agent-facing text a model reads stays kotoba's (kotoba \`PROVINCE.md:13\`)` (verbatim on the same new line).
- `:172` → **screen `same-surface`** on `agent-facing-tool-text-craft`; the line quotes the split's own text (`Route craft findings to kotoba", tabi`), a restatement of the row-15 boundary.
- `:173` → **screen `same-surface`**; names the same subject (`over tool names, descriptions and schemas as agent-facing text`) and reports only that the draft never reached tabi's scope — the state DECL1 now changes.
- `:175` → **screen `same-surface`**; deciding content is the pending ask (`a later round should ask tabi whether to land it`); the second clause corrects kotoba's own build-seat sentence.
- `:86` → **screen `third-lane-report`**; kotoba's census row about tabi (pin, `SKILL.md` presence, verbatim `PROVINCE.md:3` quote) — a roster fact, no claim on tabi surfaces.
- `fleet-skill-audit-round5.md:45` → **screen `third-lane-report`**; reports kagi's and kake's CDP-bridge descriptions (`both describe CDP-bridge flows (kagi L31–32/L71–72 vs`), another lane's work; the CDP 9222/profile boundary it touches is already mapped for both kagi and kake as `musketeer-cdp-9222-profile-lease`, and it asserts nothing on tabi ground.

Not screened, and not converted to a screen: the round-16 draft's own `C-C` paragraph (`tabi/.ufo/waves/round-16/drafts/DraftAdjacency.md:39`) — a wave-report line outside the candidate list; it is the *source* of the split, cited in the bullet's reasoning, and `.ufo/` paths are not evidence the map may quote.

## Declaration drafted (DECL1, one physical line, appended under `## Round 34 — sibling-overlap declarations (outside PROVINCE)`)

```text
- **Agent-facing tool text (kotoba):** tabi records the WebMCP `toolsAdded` tool `name`, `description` and `inputSchema` verbatim as page-declared, re-verifiable evidence (`PROVINCE.md:12-13`; `corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-60`) and grades no wording; the craft of those names, descriptions and schemas as agent-facing text a model reads stays kotoba's (kotoba `PROVINCE.md:13`).
```

## Integration note (L1)

The other kotoba slice this wave, `.ufo/waves/round-34/w1/AdjKotoba74/`, is screens-only (7 rows on `sibling-overlap-census-round74.md:70,101,126,150,151,152` and `sibling-description-rewrites-round8.md:136`; empty `rows.tsv`/`decl.md`), so no map surface collides with `agent-facing-tool-text-craft`. Both seats write `corpus/adjacency-screen-skill.tsv`, so L1 must union the two ledgers (all 12 refs are distinct; header identical). Note `AdjKotoba74` screens `round74:152` as `no-claim-declared` on the same paragraph my row 171 maps at the round-49 pin — those are different files and different sentences, but if L1 merges both, `round74:150-152` stays a screen and must not be read as withdrawing this split.

## Out of scope / not done here

- No L0 line drafted: no candidate is `contested-open` (`l0.txt` is empty by decision, not by omission).
- No lane file, lane index or jj state touched; no fleet-root write; no browser launched; no network fetch; no tool install (nothing needed). Sibling repos read with read-only `git show`.
- The other 60 candidates are other seats' slices; `newMapped` 2 of 3 remaining for the wave.

## Deliverable paths (this dir)

- `rows.tsv` — map row with `SKILL.md:DECL1` placeholder (9 TAB columns, no header)
- `rows.resolved.tsv` — the same row with the real line number `SKILL.md:2921`, as committed
- `decl.md` — DECL1 bullet
- `screen.tsv` — 5 screen rows (5 TAB columns, no header)
- `l0.txt` — empty (no contested-open)
- `table.md` — per-candidate table
- `adjacency-gate.json`, `c1-counter.json`, `build.json`, `quote-checks.txt` — receipts

Report path: `.ufo/waves/round-34/w1/AdjKotoba49.md`
