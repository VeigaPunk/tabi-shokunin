# w1 AdjKumitate — C1 build: kumitate candidate rows 19–23

## Verdict

All five assigned candidates are accounted for, with two of them converted into NEW verified map
rows and three screened as a restatement of one already-mapped boundary. The sibling lines are
`kumitate-shokunin@8d557f85…:corpus/knowledge/kimi-skills-plugins.md` `:250` (webbridge daemon
binary/version provenance — "the daemon itself is tabi's ground, not described here") and `:278`
(the plugin-root file count, whose two dated host-probe dumps tabi records at
`SKILL.md:1421-1424`). Both are distinct boundaries from map row 10
(`kimi-webbridge-plugin-internals`, kumitate `SCORECARD.md:1556`): the daemon binary lives at
`~/.kimi-webbridge/bin/kimi-webbridge`, outside `~/.kimi-code/plugins/managed/kimi-webbridge/`,
and tabi documents it in its own note (`corpus/knowledge/webbridge-daemon-disposition.md:161`,
D2 operator-only `stop`/`restart`/`uninstall`; `SKILL.md:1343` pid/addr row); the host-probe
dumps are host-state census artifacts (chromium process table, memory/swap/load snapshot), not
plugin payload. `:320`, `:321` and `:324` literally name the K-block clause / the payload-anatomy
provenance of row 10, so they are screened `same-surface`, not re-mapped. In the scratch clone at
the freeze, `scripts/check-adjacency.mjs` reports `verdict=clean rows=15 verified=15`, and the
frozen C1 counter reports `unaccounted kumitate keys: []`, `newMapped 2` with both new rows in
`newMappedRows` (rows 15 and 16) and `screenFindings []`. Its whole-wave `predicate=false` is the
aggregate of the other lanes' still-unaccounted 61 candidates, not a failure of these five.

## Evidence

Scratch clone: `/fast/scratch/hyaku/tabi-r34/AdjKumitate/clone`, `git checkout --detach
59f1b47aae277e1670e4a824173da8cde7e388ee` (`rev-parse HEAD` → `59f1b47…`), toplevel asserted
equal to the clone before every git mutation. Freeze vs baseline diff for the three touched paths
(`SKILL.md`, `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`): empty (`rc=0`).
Seat commit: `d0f141338f76604462c3ce96755cc620423849e5`, stat
`SKILL.md 5/0 · corpus/adjacency-screen-skill.tsv 4/0 · corpus/adjacency.tsv 2/0` (append-only).

Sibling lines read at the pin: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show
8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md` (`sed -n
'242,332p'`); tabi ground read at the freeze (`PROVINCE.md:6,8`, `SKILL.md:1343`,
`SKILL.md:1419-1424`, `corpus/knowledge/webbridge-daemon-disposition.md:36,42,76-77,93,102-103,161`);
existing map rows read from `corpus/adjacency.tsv` (13 rows at the baseline; row 10 is the kumitate
surface `kimi-webbridge-plugin-internals`).

Applied tabi declaration lines (new section at the end of `SKILL.md`): header `SKILL.md:2917`,
DECL1 `SKILL.md:2919`, DECL2 `SKILL.md:2920`. `decl.md` carries the `DECL1:`/`DECL2:` labels for
reference; the applied bullets are the same text without the label prefix.

Quote verification — every quote checked with `grep -F` against the `git show` bytes (sibling side,
hits on exactly the cited line) and against the applied `SKILL.md` lines (tabi side); each printed
`1` hit, then word/non-space length (4–25 words, ≥20 non-space):

```
$ grep -n -F <quote> k.md        # k.md = git show <pin>:corpus/knowledge/kimi-skills-plugins.md
250  the daemon itself is tabi's ground, not described here            9 words / 46 chars
278  as tabi records them at `tabi-shokunin/SKILL.md:1421-1424`       6 words / 53 chars
320  `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md` (the K-block boundary
                                                                        4 words / 79 chars
321  clause routes `plugins/managed/kimi-webbridge` internals to tabi). 6 words / 61 chars
324  the plugin copy's size, digests, version 1.11.3 and install record are tabi's ground
                                                                       13 words / 72 chars
$ grep -F <quote> decl-lines.txt # sed -n '2919p;2920p' SKILL.md
tabi_quote 2919  `kumitate` publishes the webbridge daemon binary's version string as package-inventory provenance only
                                                                       12 words / 91 chars
tabi_quote 2920  `kumitate` counts the two dated host-probe dumps at the plugin root
                                                                       11 words / 57 chars
ruling_quote 2919  the pid/addr pointers, the `/status` probe and operator-only
                                                                        8 words / 53 chars
ruling_quote 2920  a chromium process table and a memory/swap/load snapshot, named at
                                                                       10 words / 57 chars
```

Gate and counter, run from the lane script bytes at the seat commit (TMPDIR
`/fast/scratch/hyaku/tabi-r34/AdjKumitate/tmp`):

```
$ node <clone>/scripts/check-adjacency.mjs --at d0f141338f76604462c3ce96755cc620423849e5 \
    --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json
exit 0
{"schema":"tabi-adjacency-check-v1","mode":"check","map":"corpus/adjacency.tsv",
 "repo":"/fast/scratch/hyaku/tabi-r34/AdjKumitate/clone",
 "fleet":"/home/vgpnk/Projects/shokunin",
 "at":"d0f141338f76604462c3ce96755cc620423849e5","verdict":"clean","rows":15,"verified":15,
 "selfRulings":[2], ...}                                  # full bytes: check-adjacency-at-d0f1413.json
                                                          # findings: none (exit 0, no finding lines)

$ node <lane>/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
    --rev d0f141338f76604462c3ce96755cc620423849e5 --repo <clone> \
    --fleet /home/vgpnk/Projects/shokunin --json
exit 1
predicate=false  candidates=67 (A 38, B 29)  mapped=3  screened=3  unaccounted=61  newMapped=2
newMappedRows=[{row:15,surface:"webbridge-daemon-lifecycle",sibling:"kumitate",disposition:"split-declared"},
               {row:16,surface:"host-probe-census-records",sibling:"kumitate",disposition:"split-declared"}]
screenFindings=[]  adjacency={verdict:"clean",rows:15,verified:15,findings:0}
unaccountedKeys ∩ kumitate = []   perLane.kumitate=5
                                        # full bytes: c1-counter-at-d0f1413.json (7,244 B; the
                                        # unaccountedKeys array is elided here, every one of its 61
                                        # entries is a non-kumitate lane)
```

Why `exit 1` is expected here and not a miss: the frozen predicate is whole-wave
(`unaccounted == 0 AND newMapped >= 3`); the other 61 unaccounted candidates belong to kake,
kotoba, mori, tameshi, tsukuroi, kaidoku, kagi, kama, kasegi and chousa — seats other than this
one. All five kumitate candidates (rows 19–23 of `baseline/c1-candidates.tsv`) are accounted, and
both new rows verify and appear in `newMappedRows`.

## Deliverables

- `.ufo/waves/round-34/w1/AdjKumitate.md` — this report.
- `.ufo/waves/round-34/w1/AdjKumitate/rows.tsv` — the two map rows, 9 TAB columns, no header,
  `tabi_ref` as `SKILL.md:DECL1`/`SKILL.md:DECL2` placeholders.
- `.ufo/waves/round-34/w1/AdjKumitate/rows.applied.tsv` — the same rows with the real line numbers
  (`SKILL.md:2919`, `SKILL.md:2920`) as committed in the clone.
- `.ufo/waves/round-34/w1/AdjKumitate/decl.md` — the drafted declaration bullets (`DECL1`, `DECL2`).
- `.ufo/waves/round-34/w1/AdjKumitate/screen.tsv` and `screen.ledger.tsv` — the three screen rows
  (draft and applied form, 5 TAB columns, no header in `screen.tsv`; the applied ledger carries the
  required header).
- `.ufo/waves/round-34/w1/AdjKumitate/per-candidate.tsv` — `key | decision | reason` for rows 19–23.
- `.ufo/waves/round-34/w1/AdjKumitate/check-adjacency-at-d0f1413.json`,
  `c1-counter-at-d0f1413.json`, `sibling-kimi-skills-plugins-at-pin.md` (the exact sibling bytes
  the quotes were verified against).
- No `l0.txt`: no row is `contested-open`, so no fleet L0 line was drafted.

## Judgment calls the integrator may reverse

1. `:250` could be filed as `same-surface` on row 10, because the sibling's own routing sentence at
   `:318-321` lumps "the daemon" under plugin internals. I keyed it as a distinct boundary because
   the daemon binary sits outside the plugin path row 10's tabi side names, and tabi's daemon
   ground is its own note (`webbridge-daemon-disposition.md`, A2–A4/D2) rather than the payload
   anatomy. If reversed, screen it `same-surface` and the wave loses one `newMapped`.
2. `:278` is the same class of call: the dumps live at the plugin root, but they are host-state
   records (process table, memory snapshot) under `PROVINCE.md:8`, and the sibling's own
   out-of-scope sentence does not list them.
3. `:324` was screened, not mapped, although it mentions the install record (outside the plugin
   dir): the sentence's claim is the plugin copy's size/digests/version provenance, which is row
   10's payload-anatomy surface.

## Scope and limits

- No lane files were touched: the append was applied and committed only inside the scratch clone.
  `SKILL.md`, `corpus/adjacency.tsv` and `corpus/adjacency-screen-skill.tsv` in the lane checkout
  are unchanged, and no gate/linter/formatter of the lane was run beyond the two named commands.
- Not claimed: the two new rows' semantic worth beyond the two-side reading above (the frozen
  counter cannot judge overlap semantics); wave-2 attack of these rows is the semantic guard.
- No browser was launched; no network fetch was made; no tool was installed.
