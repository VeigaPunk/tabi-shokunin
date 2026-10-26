# AdjMori — C1 disposition drafts for mori candidates (rows 24-31)

**Verdict.** All eight assigned candidates are screened `third-lane-report`, and no map row is truthful: every line is mori's own fleet-observability fact about a tabi artifact (an ID token in a roster string, a tabi dispatch file counted by mori's parser, tabi's `.txt` reports, a tabi clone tree seen mid-scan) and none claims a surface of tabi's browser province. The new screen ledger installed in a scratch clone at the freeze plus one commit is accepted in full by the frozen counter — `screened 8`, `screenFindings []`, `unaccounted 66 → 58`, mori unaccounted 0 — while `check-adjacency` stays `clean` at 13/13 verified rows. `newMapped` is 0 from this seat by construction (no candidate is an overlap, so nothing was mapped to inflate the count); the lane-level `newMapped >= 3` leg must come from seats whose candidates are real overlaps, per claims.json `feasibilityDisclosed`.

## Sibling side read in context

Commands (all from `/home/vgpnk/Projects/shokunin`; mori pin `aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd`):

    git -C mori-shokunin show aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/roster-truth-r12.md | sed -n '1,25p'      # rc 0
    git -C mori-shokunin show aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/wave-settlement-r20.md | sed -n '1,115p'   # rc 0
    git -C mori-shokunin show aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/wave-settlement-r20.md | wc -l          # rc 0, 106 lines
    git -C mori-shokunin show aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/roster-truth-r12.md | wc -l             # rc 0, 42 lines

Mori's province is not browser ground: `mori-shokunin/PROVINCE.md:3` — "**Domain:** fleet & host observability (森) — whether the fleet, its waves and its host are alive and progressing", with "**Owns (read-only probes):** … `.ufo/waves/*` settlement state (registry + results pair)" (`PROVINCE.md:7-8`). The tabi side has no mori boundary to restate: `grep -n -i 'mori' SKILL.md corpus/README.md PROVINCE.md` in the lane → **no output** (rc 1), so nothing existing maps or screens mori and no declaration line could have been "already there".

Both files read: roster-truth §"Measured sets" (lines 7-17) counts IDs from `shokunin.conf` and `.ufo/state/*.round`; wave-settlement §2 decision table, §3 refinements R1/R4, §4 limits and §5 measurements are mori's settlement scan of *other* lanes' wave artifacts.

## Per-candidate decisions

| key (c1-candidates.tsv) | decision | reason, grounded on both sides |
|---|---|---|
| `mori-shokunin@aa3af1ec…:corpus/knowledge/roster-truth-r12.md:9` | screen `third-lane-report` | The 20 declared config IDs are parsed from `shokunin.conf`; `tabi` is one token in that roster string. Mori's ground is the roster/config census (mori `PROVINCE.md:3`), tabi's province is browser & web-interaction craft (tabi `PROVINCE.md:3`) — the line names neither a browser surface nor a boundary. |
| `…:roster-truth-r12.md:10` | screen `third-lane-report` | Same fact read from regular `.ufo/state/*.round` files (21 IDs). A state-counter roster, not a tabi claim. |
| `…:wave-settlement-r20.md:33` | screen `third-lane-report` | Settlement `missing` row: "the seat may have written elsewhere (tabi r12/r13 wrote `.txt` as their Acceptance said, not the trailer's `.md`)". It reports tabi's own artifact choice as mori's observation; mori grades report presence, it does not claim tabi's report-path craft. |
| `…:wave-settlement-r20.md:50` | screen `third-lane-report` | Refinement R1's evidence counts "96 tabi clone tasks" with a trailing `| godspeed` envelope — evidence for mori's own trailer parser, over tabi dispatch files. |
| `…:wave-settlement-r20.md:52` | screen `third-lane-report` | R4 `duplicate_of`: byte-identical dispatch copies "exist in kengaku, tameshi, tabi" — a census fact about tabi's wave files. |
| `…:wave-settlement-r20.md:69` | screen `third-lane-report` | Limits: "tabi r12/r13 wrote 63 same-stem `.txt` files beside missing `.md` paths" — mori observes tabi's artifacts without claiming their craft. |
| `…:wave-settlement-r20.md:90` | screen `third-lane-report` | "Live trees move during a scan (tabi clone tree appeared mid-scan); cite the scan time" — a scan-time caveat about a tabi tree. |
| `…:wave-settlement-r20.md:106` | screen `third-lane-report` | Fleet-scan snapshot: "kama, kagi, tabi were mid-round and moved between snapshots" — a census fact about tabi's state. |

Reason choice: all eight lines carry a census/roster/settlement **fact about tabi** (membership in an ID set, counts of tabi files, tabi's mid-round state), which is exactly the `third-lane-report` definition, and none is about browsers at all. `same-surface` is impossible for mori (no existing or new map row for this sibling), and `no-claim-declared` would misstate the case — the sibling *does* make claims, just only on its own fleet-observability ground.

## Evidence (commands, exit codes)

Baseline state (frozen receipt, not rerun): `.ufo/waves/round-34/baseline/c1-J1-do-nothing.json` → `candidates 67, mapped 1, screened 0, unaccounted 66, newMapped 0, predicate false, adjacency clean rows 13`; all 8 assigned keys appear in `unaccountedKeys` (8 of 8, `grep 'mori-shokunin@'` on `baseline/c1-candidates.tsv` → rows 24-31; count 8).

Quote verification against the `git show` bytes at the pin (`grep -F -c`, one hit each; full transcript `evidence/quotes-check.txt`):

    line 9    **Declared config set — 20 IDs.**                              1
    line 10   **Regular driver-counter set — 21 IDs.**                       1
    line 33   (tabi r12/r13 wrote `.txt` as their Acceptance said            1
    line 50   96 tabi clone tasks, `build/TrailerVariants.md`                1
    line 52   byte-identical copies exist in kengaku, tameshi, tabi          1
    line 69   tabi r12/r13 wrote 63 same-stem `.txt` files beside missing    1
    line 90   Live trees move during a scan (tabi clone tree appeared mid-scan)  1
    line 106  kama, kagi, tabi were mid-round and moved between snapshots.   1

Each is 4-25 words and ≥ 20 non-space characters (min 5 words / 43 non-space; max 11 words / 55), and each was separately confirmed as a substring of the named line (not merely present in the file).

Scratch clone validation (`--shared` clone of the lane, `checkout --detach 59f1b47aae277e1670e4a824173da8cde7e388ee`; `git rev-parse --show-toplevel` = `/fast/scratch/hyaku/tabi-r34/AdjMori/clone`, asserted before the commit):

    git -C clone add corpus/adjacency-screen-skill.tsv
    git -C clone -c user.name=AdjMori -c user.email=AdjMori@scratch.local commit -m "r34 w1 AdjMori: C1 screen ledger, 8 mori roster/settlement candidates"
      → 3f274f693e2826e1f329a10464f25d855bcb6af7 (parent 59f1b47aae277e1670e4a824173da8cde7e388ee), 1 file, +9 lines (header + 8 rows)

    node scripts/check-adjacency.mjs --at 3f274f693e2826e1f329a10464f25d855bcb6af7 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
      → exit 0; {"verdict":"clean","rows":13,"verified":13,"findings":[],"selfRulings":[2]}

    node tabi-shokunin/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 3f274f69… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
      → exit 1; candidates 67, mapped 1, screened 8, unaccounted 58, newMapped 0, newMappedRows [], screenFindings [];
        adjacency {"verdict":"clean","rows":13,"verified":13,"findings":0}; perLane.mori 8; mori keys left in unaccountedKeys: none

Exit 1 is the frozen **lane-level** predicate (`newMapped >= 3`) being unmet by a screens-only seat commit, not a rejected row: every one of the eight rows was accepted (screened 8 = 8, `screenFindings []`), and mori moved from 8 unaccounted to 0. No row of mine could appear in `newMappedRows` because I mapped nothing — mapping any of these lines would assert an overlap mori's line does not make.

The committed ledger is byte-identical to the deliverable apart from its header line (`diff <(tail -n +2 evidence/committed-screen-ledger.tsv) screen.tsv` → no output); `sha256(screen.tsv)` = `8ff281373565aaa17b633fa79dfd42d0a5fd0d2ea9e0bf1374993d3ce0139bb7`, committed ledger `6c87e3a1b02c5c5550e27ceeae0eddfd1638f7d3ad47e84d336c266002f18425`.

## Deliverables (output dir)

- `rows.tsv` — 0 rows (empty; no map row is truthful for these candidates)
- `decl.md` — no declaration bullet (nothing to declare under `## Round 34 — sibling-overlap declarations (outside PROVINCE)`); it records why, with the mori domain line
- `screen.tsv` — 8 rows, 5 TAB columns, no header, `sibling_ref` = the exact candidate key, `reason` = `third-lane-report`, `surface` = `-`
- `l0.txt` — empty (no contested-open row, so no L0 line drafted)
- `decisions.tsv` — per-candidate `key | decision | reason` table
- `evidence/` — `c1-at-seat.json` (counter, `--rev 3f274f69…`), `gate.json` (check-adjacency), `committed-screen-ledger.tsv`, `quotes-check.txt`, `commit.txt`

## Findings and limits

- **No overlap in this slice.** Mori is a read-only fleet/host observability lane; its tabi mentions are data points in rosters and settlement scans. Nothing here touches tabi's browser, CDP, interaction-record or evidence surfaces, so the correct action is a screen, not a map row, and not a split (a split needs both sides declaring a boundary — tabi has no line naming mori at all).
- **Reason granularity is a judgement, disclosed.** `third-lane-report` vs `not-browser-sense` for rows 33/69 (mori documenting that tabi wrote `.txt` per its own Acceptance): both are in the closed vocabulary; I chose `third-lane-report` because the line carries a fact about this sibling's own artifacts rather than a purely non-browser topic. A wave-2 attack may contest the label; the accounting itself (accounted, not overlap) does not depend on it.
- **Seat-scoped counter exit 1 is expected.** The lane predicate needs ≥ 3 new mapped rows with new tabi declaration lines; this seat contributes screens only, so the L1 must take `newMapped` from other seats' rows.
- **Out of scope / not done:** no edits to `corpus/adjacency.tsv`, `SKILL.md`, `corpus/README.md` or any other tracked lane file in the lane checkout (all validation happened in the scratch clone and died with it); no L0 filing (L1's job); no commits in the lane, sibling repos or fleet repo; no browser launched; no tools installed.
