# AdjKaidoku6 — C1 chunk dispositions (16 kaidoku r10-01 browser-ground lines)

**Verdict.** All 16 lines of chunk `AdjKaidoku6.tsv` are `same-surface` screens and none is a map row:
every one is a fact on kaidoku's own side of a split this lane has already mapped — 15 on map row 15
`recorded-har-producer-channel` (kaidoku, `split-declared`; tabi side `SKILL.md:2958`, whose declaration
names this exact file: "kaidoku's Playwright `recordHar` run and its HAR-schema gate feed its own
`inspect-web-network-capture` input (kaidoku `corpus/knowledge/2026-10-14-r10-01-queue-ops.md:151,161-166`)
and stay kaidoku's") and 1 (`:241`) on map row 1 `cdp-runtime-observation` (kaidoku, `ruled`). The sibling
file is kaidoku's own round-10 REA queue-ops record: it provisions a HAR with Playwright `recordHar` over
its own localhost fixture, refutes `chromium --log-net-log` as that gate's provisioning path, and points at
its next census row (`capture-electron-scenario`, CDP self-launch family). Nothing in it states a new side
of a tabi surface, so step 2 of the decision rule (`SKILL.md:2861-2881`) decides every line, and QUALITY 91
("a fact on the sibling's own side of an already-mapped split is a screen") plus QUALITY 97 bound the choice.
A map row would also have been worthless mechanically: both surfaces are already in the baseline map, so
`baseKeys` excludes them from `newMapped`, and no new declaration exists to cite (n1).

## Evidence (commands, exit codes)

Scratch clone (`--shared`, detached at the freeze):

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          # exit 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83        # exit 0
git -C "$S/clone" rev-parse --show-toplevel                                            # $S/clone
git -C "$S/clone" rev-parse HEAD                                                       # a4bfef0f75027c915e715649950b1d46dcb33d83
```

Sibling bytes read (pinned, read-only): `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show
49096c7e6f226af0c750c4b003be58883cb6049f:corpus/knowledge/2026-10-14-r10-01-queue-ops.md`
(whole file; the 16 candidate lines dumped individually plus context `:110-145`, `:225-249`) and
`…:PROVINCE.md` at the same pin (kaidoku's Adjacent list: REA/substrate surface, no browser craft).

Quote validation before the commit (`python3 validate.py` in scratch, replicating the counter's
`goodQuote`/`includes` rule at `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:131,242`):

```
rows 16
bad 0
```

Commit in the clone (only file touched: the new ledger):

```
printf 'sibling_ref\treason\tsurface\tquote\tnote\n' > corpus/adjacency-screen-browser.tsv
cat <out>/screen.tsv >> corpus/adjacency-screen-browser.tsv
git -C "$D" add corpus/adjacency-screen-browser.tsv                                   # exit 0
git -C "$D" -c user.name=AdjKaidoku6 -c user.email=AdjKaidoku6@scratch.local \
    commit -q -m "round-35 w1 AdjKaidoku6: 16 same-surface screens on kaidoku r10-01 browser lines"  # exit 0
git rev-parse HEAD                                                                    # 9d1ff097a3740bc54144cb5a7fd5be7df1fea326
git show --stat HEAD   # 1 file changed, 17 insertions(+)  corpus/adjacency-screen-browser.tsv
```

Frozen counter, `TMPDIR` under scratch, run from the lane checkout (script never reads the worktree map):

```
node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev 9d1ff097a3740bc54144cb5a7fd5be7df1fea326 \
  --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json > counter-check.json   # exit 1
```

Reading (full JSON in `counter-check.json`, sha256 `5841c297b4b9a5d3c62987812f7c2974db691cb201882551a09b212eaa851aae`):

| field | value |
|---|---|
| adjacency | `clean`, rows 16, verified 16, findings 0 |
| adjGateSha256 | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (pinned, unchanged) |
| candidates | 383 |
| mapped | 0 |
| screened | 16 |
| unaccounted | 367 |
| newMapped | 0 (`newMappedRows []`, `newRowRefusals []`) |
| screenFindings | `[]` (0) |
| my 16 keys in `unaccountedKeys` | **0 of 16** |
| predicate | false (expected for one seat: 16 of 383, no new rows) |

Per-lane candidate census unchanged (`perLane.kaidoku` 137); `priorCandidatesSkipped` 22.

## Findings (what wave 2 should attack)

- **The screen group is the whole chunk**, so it is a single attack surface: if any of the 15 HAR lines is
  read as kaidoku claiming *browser-driving* ground rather than provisioning its own evidence input, my
  surface choice weakens. The strongest defence is the existing declaration's own citation of
  `:151,161-166` in this same file (`SKILL.md:2958`), which puts these lines on kaidoku's side by tabi's own
  admitted words, not by my reading.
- **`:241`** is the one line in a different surface (`capture-electron-scenario` CDP self-launch). It cites
  map row 1's `ruled` disposition (round-16 verifier spotcheck: kaidoku keeps CDP only as an REA provider
  surface). If an attacker reads "next unexercised census row" as a *plan to drive CDP*, the row 1 ruling
  still covers it.
- **No new tabi line, no DECL, no L0**: `SKILL.md` was not touched in my clone (the round's newMapped
  burden rests on chunks that find real sibling-side claims).
- **Not checked by me** (out of my seat): whether the other 367 candidates are accounted elsewhere, and the
  lane-wide predicate. My run reports them unaccounted simply because my ledger holds only my 16 rows.

## Deliverables

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku6/`

- `screen.tsv` — 16 rows, no header (sha256 `0f6a90efff3d1c918e32e9a8fc174af05f03d194105873b35cf858dfa9a3b409`)
- `rows.tsv` — 0 bytes (no map rows proposed)
- `decl.md` — 0 bytes (no DECL lines)
- `decisions.md` — per-key disposition + both-sides ground + rejected map alternatives
- `counter-check.json` — raw frozen-counter output at `9d1ff097`
- no `l0.txt` (no contested-open row was needed)

Scratch clone commit carrying the ledger: `9d1ff097a3740bc54144cb5a7fd5be7df1fea326`
(`corpus/adjacency-screen-browser.tsv`, 17 lines: header + my 16). The L1 merges these rows with the other
chunks' into the lane's ledger; I did not write any lane file.
