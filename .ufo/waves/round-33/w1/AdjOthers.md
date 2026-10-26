# AdjOthers — C1 build: disposition drafts for kengaku:54, kotoba:73, tsukuroi:150

**Verdict.** All three assigned candidates are screened with a closed reason and none is a real
sibling overlap, so this seat drafts **0 new map rows and 3 screen rows**; the screens validate
clean (`screenFindings` empty), all three candidate keys leave `unaccountedKeys`, and the map at my
validation commit is unchanged (10 rows, 10 verified, check-adjacency `clean`). With only these
rows, the frozen counter at my commit reports `candidates 52, mapped 5, screened 3, unaccounted 44,
newMapped 0, predicate false`: that is the honest seat-local reading — the C1 target
(`unaccounted 0 AND newMapped >= 4`) cannot be reached by screens, and the remaining 44 candidate
keys and the >= 4 map rows belong to the other seats/integrator commit. I did not map any
non-overlap to move the number.

## Per-candidate decisions

| candidate | decision | grounded reason |
|---|---|---|
| `kengaku-shokunin@7984fd30…:PROVINCE.md:54` | screen `not-browser-sense`, surface `-` | Line 54 is kengaku's round-10 report-out **to kumitate**: the bench-arena `telemetry_source=journal` field must not be read as a "scraper outage" in *kumitate's* operational failure taxonomy (lines 48-54 read together). No browser is driven and no crawl described; "scraper" names a local telemetry row class. kengaku's only genuine browser surface is WebArena deterministic browser eval (`kengaku SKILL.md:39`), which this line does not state. |
| `kotoba-shokunin@65a5c7a6…:PROVINCE.md:73` | screen `no-claim-declared`, surface `-` | kotoba's coverage table row for tabi: adjacency `none`, "tabi owns browser-session and web-interaction evidence … it states no split with kotoba on its scope surfaces". kotoba declares no browser surface and no split, so there is no overlap to map. |
| `tsukuroi-shokunin@9cc9aa77…:PROVINCE.md:150` | screen `third-lane-report`, surface `-` | R20-OUT009 restates **revenger's** OUT-009 declaration (reverse engineering of shipped artifacts, incl. browser/Electron runtime evidence) and says "It is not a tsukuroi grant of ownership". The browser words are revenger's claim, already mapped as `rea-browser-runtime-evidence` contested-open; tsukuroi states no browser surface of its own. |

`revenger:5` was already mapped at baseline (`rea-browser-runtime-evidence`), so it was not touched.

## Commands and exit codes (all in scratch clone `$S/clone`, TMPDIR `$S/tmp`)

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                    # exit 0
$ git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea               # exit 0
  -> e6b0a9074d434ccc307badd312ae7379d1193fea ; rev-parse --show-toplevel == "$S/clone"

# quote verification, git-object bytes
$ git -C kengaku-shokunin show 7984fd30…:PROVINCE.md | sed -n '54p' | grep -c -F 'treat `source=journal` rows as scraper outages'
1                                                                                              # exit 0
$ git -C kotoba-shokunin show 65a5c7a6…:PROVINCE.md | sed -n '73p' | grep -c -F 'it states no split with kotoba on its scope surfaces'
1                                                                                              # exit 0
$ git -C tsukuroi-shokunin show 9cc9aa77…:PROVINCE.md | sed -n '150p' | grep -c -F 'browser/Electron runtime evidence. It is not a tsukuroi grant of ownership'
1                                                                                              # exit 0

# candidate keys from the frozen counter (pins match PINS in c1-adjacency-sweep.mjs)
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --list-candidates --fleet /home/vgpnk/Projects/shokunin
  kengaku-shokunin@7984fd30892b54b1eff01054206ad54fc535021c:PROVINCE.md:54 …
  kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:PROVINCE.md:73 …
  tsukuroi-shokunin@9cc9aa77e30e0e23de2d4d2697b3b218ada02969:PROVINCE.md:150 …                # exit 0

# commit (map untouched; only the new screen ledger added)
$ git -C "$D" -c user.name=AdjOthers -c user.email=AdjOthers@scratch.local commit -m "r33 w1 AdjOthers: adjacency screen rows for kengaku:54, kotoba:73, tsukuroi:150"
  -> REV 9c9654ac5c9bdb3218cc53836644b63405178eee ; 1 file changed, 4 insertions

$ node scripts/check-adjacency.mjs --at 9c9654ac… --repo "$D" --fleet /home/vgpnk/Projects/shokunin --json
  verdict=clean rows=10 verified=10 findings 0 selfRulings [2]                                 # exit 0
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 9c9654ac… --repo "$D" --fleet /home/vgpnk/Projects/shokunin --json
  predicate=false candidates=52 mapped=5 screened=3 unaccounted=44 newMapped=0
  screenFindings=[] adjacency={clean,10,10,0}                                                  # exit 1
$ python3 -c '…'  # unaccountedKeys ∩ my three keys == [] ; unaccountedKeys len 44
```

Screen-row shape check: each row 5 TAB columns; quote words/non-space chars — 6/41, 10/43, 11/64
(all within 4-25 words and >= 20 non-space chars); no C0/C1/control characters in any field;
surface `-` for all three (none is `same-surface`). Full screen ledger with header is in the output
dir as `adjacency-screen.tsv`; the headerless 5-column deliverable is `screen.tsv`, and `rows.tsv`
is present as a 0-byte file because no map row is drafted.

## Touched surfaces

- Scratch only: `$S/clone` commit `9c9654ac5c9bdb3218cc53836644b63405178eee` (one new file
  `corpus/adjacency-screen.tsv`, 3 data rows + header).
- Lane checkout untouched; no lane tracked file, index, jj state, fleet repo or sibling repo
  written. Output dir `/…/tabi-shokunin/.ufo/waves/round-33/w1/AdjOthers/` created with the
  receipts and deliverables below.

## Findings / limits

1. **Seat-local predicate is false by construction.** My three candidates are genuine screens; the
   frozen counter rewards map rows, so this seat contributes `newMapped 0`. Reaching
   `newMapped >= 4` requires other seats' rows on kake/kaidoku/kagi/kumitate-class candidates; an
   integrator commit that only merges screens leaves `unaccounted 44`.
2. **kengaku does have a browser-adjacent surface off-candidate** — `kengaku-shokunin SKILL.md:39`
   lists "Browser workflows | WebArena-Verified | Deterministic browser eval, curated tasks, trace
   scoring". It is not on a sweep candidate line (the counter only credits PROVINCE.md candidate
   lines), so mapping it would not move C1; it is flagged here as a future-round adjacency
   candidate that would need an L0 question naming kengaku (tabi's evidence discipline vs a
   benchmark lane's deterministic browser-eval harness scoring).
3. **Reason-choice risk at wave 2.** kengaku:54 also reads as a report-out (§ "Reported out this
   round (evidence sent, not absorbed)", items (1) kotoba, (2) kumitate, (3) kagi), so
   `third-lane-report` is a defensible alternative to `not-browser-sense`; I chose
   `not-browser-sense` because the regex hit ("scraper outages") is a telemetry-row class, not a
   crawl practice. Only one reason may be recorded, and both exclude a map row.
4. No browser was run and no network fetch was made; no tool installs (pacman paused, nothing
   installed). `pgrep -fa 'chromedriver|chromium'` shows one line, pid 1371 `/usr/bin/earlyoom …
   --prefer (^|/)(java|node|chromium|python3?)$` — a host process's argv, not a browser I started
   (none owned).
5. Scratch `$S=/fast/scratch/hyaku/tabi-r33/AdjOthers` deleted after receipts were copied.

## Deliverables

- `.ufo/waves/round-33/w1/AdjOthers.md` — this report
- `.ufo/waves/round-33/w1/AdjOthers/rows.tsv` — map rows (0 bytes; none drafted)
- `.ufo/waves/round-33/w1/AdjOthers/screen.tsv` — 3 screen rows, 5 TAB columns, no header
- `.ufo/waves/round-33/w1/AdjOthers/adjacency-screen.tsv` — the committed ledger with header
- `.ufo/waves/round-33/w1/AdjOthers/candidates.md` — per-candidate decision table
- `.ufo/waves/round-33/w1/AdjOthers/c1-counter.json`, `adjacency-gate.json` — raw gate/counter output
