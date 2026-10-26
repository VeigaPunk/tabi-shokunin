# AdjTsukuroi2 — C1 build (round-35 w1)

**Verdict.** All ten candidates in my chunk are screened `not-browser-sense` in the new ledger
`corpus/adjacency-screen-browser.tsv`; no map row is proposed because not one of the ten lines states
tsukuroi's side of a tabi browser surface. The chunk is answered honestly and without padding: the ten keys are
absent from `unaccountedKeys`, `screenFindings` is empty for them, `newMapped` is 0 — so this seat contributes
10 of the sweep's 383 accounted candidates and **0** of the ≥2 new map rows the lane's target still needs; the
predicate remains false at my revision, which is the expected mid-wave state (373 candidates are other seats'
chunks, not mine). My scratch clone's commit `f57917b26c88676dd989bb301618749d5781baa7` is evidence only; the lane
checkout at `a4bfef0f75027c915e715649950b1d46dcb33d83` was not edited (lane `git status`: only this output dir,
untracked).

## What was read before deciding (commands, exit 0 unless stated)

- `cat .ufo/waves/round-35/w1-chunks/AdjTsukuroi2.tsv` — 10 lines, 2 TAB columns (`wc -l` = 10), all
  `tsukuroi-shokunin@a968393c678171f8a5a2907da5015735396da4cc:<path>:<line>`.
- `sed -n '2861,2881p' SKILL.md` — the round-33 decision rule (ask 1→5; a real overlap is never screened).
- `cat corpus/adjacency.tsv` — 17 lines: header + **16** verified rows, **none** naming `tsukuroi`, therefore
  `same-surface` is structurally unavailable for this sibling and every row below carries `surface` = `-`
  (the counter rejects `screen-surface-not-dash` otherwise, `c1-adjacency-sweep-v3.mjs:243-246`).
- `cat -n PROVINCE.md` (`:1-18`) — tabi's owned surfaces at `PROVINCE.md:3-4` and `:6-13`; the two sides of each
  decision below.
- `git -C tsukuroi-shokunin show a968393c…:PROVINCE.md | cat -n` — the sibling's own province at the pin:
  `PROVINCE.md:3-4` host operability, `:30-33` "Host memory and kill-event measurements support OS triage". No
  browser-craft surface anywhere in it.
- `git -C tsukuroi-shokunin show a968393c…:corpus/knowledge/oom-event-plane.md | sed -n '1,20p;95,132p'` — the file
  is the OOM-event plane: kernel dumps, cgroup accounting, `oom_score_adj`. Kill-time table header at `:104` is
  `| pid | oom_score_adj | rss_anon (pages → GiB) | swapents (pages → GiB) | name |`.
- `git -C tsukuroi-shokunin show a968393c…:corpus/knowledge/update-safety-v2.md | sed -n '1,20p;40,64p;216,234p'`
  — the file is a risk-ordered pre-upgrade re-run note; `:44` is the r2-vs-v2 comparison table, `:59` its workload
  contention row, `:230` the U8 workloads bullet.
- Exact candidate bytes pulled per line:
  `git -C tsukuroi-shokunin show <pin>:<path> | sed -n '111p;116p;118p;205p;304p;332p;349p;386p'` and
  `… update-safety-v2.md | sed -n '59p;230p'`.

## Dispositions (all ten `not-browser-sense`; see decisions.md for the per-line sentence)

The shared ground: each line is host memory / cgroup / journal / workload-census text in which `chromium` (or
`Chromium`) is a **process name value** — a `name` cell (`oom-event-plane.md:104,111`), an `oom_score_adj` band
(`:115-116`, `:349`), an exhaustion symptom the sibling itself subordinates (`:118`, with `:119` "the *symptom of
exhaustion*, not the memory holder"), a systemd scope-start record (`:205`, `:332`), a `ps … comm` census
(`:304`, `update-safety-v2.md:59,230`), and a Q6 open question routed to `fleet/operator` (`:386`). Tabi owns
browser driving/capture (`PROVINCE.md:6-13`); a `ps` comm count, a scope launch and an OOM class state nothing on
those surfaces, and rule 5's test — does the line state the sibling's side of tabi's ground — is false for all ten.

| # | sibling_ref (path:line) | reason | quote (verbatim, words/non-space chars) |
|---|---|---|---|
| 1 | oom-event-plane.md:111 | not-browser-sense | `300 \| 8,845 → 0.03 \| 9,503 → 0.04 \| chromium` (11/34) |
| 2 | oom-event-plane.md:116 | not-browser-sense | `user workload ran at +200 (and Chromium helpers at +300), which is exactly the band` (15/69) |
| 3 | oom-event-plane.md:118 | not-browser-sense | `so its death returned the budget that re-armed the system; the trigger being a Chromium` (15/73) |
| 4 | oom-event-plane.md:205 | not-browser-sense | `**6 Chromium scopes started** (`systemd[1573]: Started app-org.chromium.Chromium-…`) at 13:08:45.18,` (9/92) |
| 5 | oom-event-plane.md:304 | not-browser-sense | `` `ps -eo pid,user,rss,pmem,comm --sort=-rss` \| live \| none \| 14:42: kimi 706 MB, chromium ×6 260–344 MB `` (17/86) |
| 6 | oom-event-plane.md:332 | not-browser-sense | `(Hyprland session processes, the 6 just-started Chromium scopes, terminal/agent processes)` (10/81) |
| 7 | oom-event-plane.md:349 | not-browser-sense | `` `oom_score_adj` steering \| user workload at +200 (120 tasks), Chromium helpers +300, victim +200 `` (14/83) |
| 8 | oom-event-plane.md:386 | not-browser-sense | `Who starts 6 Chromium scopes in the 110 s before event B \| process audit at the next occurrence` (19/77) |
| 9 | update-safety-v2.md:59 | not-browser-sense | ``load 3.10/1.21/1.12, top comms `bash` 26, `chromium` 15, `grep` 7`` (10/56) |
| 10 | update-safety-v2.md:230 | not-browser-sense | ``process census top: `bash` 26, `chromium` 15,`` (7/39) |

Every quote was machine-checked against the frozen candidate text before the counter ran: 10/10 are verbatim
substrings and satisfy `4 ≤ words ≤ 25` and `non-space ≥ 20`.

## Validation in the scratch clone (commands, exact)

```
S=/fast/scratch/hyaku/tabi-r35/AdjTsukuroi2
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"           # exit 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83        # exit 0
git -C "$S/clone" rev-parse --show-toplevel   -> /fast/scratch/hyaku/tabi-r35/AdjTsukuroi2/clone
git -C "$S/clone" rev-parse HEAD              -> a4bfef0f75027c915e715649950b1d46dcb33d83   (freeze)
# wrote corpus/adjacency-screen-browser.tsv (header + 10 rows); no change to SKILL.md or corpus/adjacency.tsv
git -C "$S/clone" add corpus/adjacency-screen-browser.tsv                              # exit 0
git -C "$S/clone" -c user.name=AdjTsukuroi2 -c user.email=AdjTsukuroi2@scratch.local \
    commit -q -m "round-35 w1 AdjTsukuroi2: screen 10 tsukuroi browser-ground candidates (not-browser-sense)"
git -C "$S/clone" rev-parse HEAD              -> f57917b26c88676dd989bb301618749d5781baa7
git -C "$S/clone" show --stat --oneline HEAD  -> 1 file changed, 11 insertions(+)
git -C "$S/clone" status --porcelain          -> (empty)
cd "$S/clone" && TMPDIR="$S/tmp" node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
    --rev f57917b26c88676dd989bb301618749d5781baa7 --repo "$S/clone" \
    --fleet /home/vgpnk/Projects/shokunin --json > "$S/counter.json"          # exit 1 (predicate false)
```

The counter was run three times; `cmp` of the three outputs is identical (`exit 0`), and the stdout shown below is
the captured file (`sha256 4a829c7ba4632b6e0b07340dc5db54ed5b0fd0f31bedd812e5d29a1e5ceaa449`). Exit 1 is the
counter's own "evaluated, predicate not met" class, correct at a seat revision that screens one chunk of 383.

```
{"schema":"tabi-r35-c1-adjacency-sweep-v3",
 "rev":"f57917b26c88676dd989bb301618749d5781baa7",
 "baseline":"2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684",
 "adjGateSha256":"4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac",
 "adjacency":{"verdict":"clean","rows":16,"verified":16,"findings":0},
 "candidates":383,"priorCandidatesSkipped":22,
 "mapped":0,"screened":10,"unaccounted":373,"newMapped":0,
 "newMappedRows":[],"newRowRefusals":[],"screenFindings":[],"predicate":false}
```

Read against the acceptance the seat was given:

- **adjacency verdict** — `clean`, rows 16, verified 16, findings 0, at gate sha256 equal to the frozen
  `ADJ_GATE_SHA256`.
- **screenFindings on my keys** — `[]`; `screened` = 10 = every row I wrote, so no row was silently rejected
  (`screen-quote`, `screen-surface-not-dash`, `screen-duplicate`, `screen-not-a-candidate` all absent).
- **my keys absent from `unaccountedKeys`** — checked key by key with Python: `in unaccounted: []` for all 10.
  `unaccounted` 373 = the sweep's other 373 candidates (other seats' chunks).
- **newMappedRows / newRowRefusals for my rows** — both `[]`; I proposed no map row, as `rows.tsv` is empty.
- Lane-level `perLane.tsukuroi` = 20 candidates; the other 10 (e.g. `SKILL.md:2547`,
  `corpus/knowledge/kill-event-deep-r8.md:81,140,148,185,227,236`) belong to the sibling tsukuroi chunks, not mine.

## Criteria

- **QUALITY 87** — the four counts are stated together and none is offered as "the sweep is answered":
  candidates 383, mapped 0, screened 10, unaccounted 373, verified rows 16. Every screen has a reason from the
  closed vocabulary and a verbatim 4–25-word quote; no `same-surface` was attempted (no tsukuroi map row exists).
- **QUALITY 88 / 97** — no row exists, so no naming or split falsification can be smuggled in. Screening was
  preferred over mapping precisely because no truthful tabi side exists; nothing was converted into a screen from
  "inconvenience" — these are host-plane lines, and my own attack on the two closest cases (`:118` GPU-watchdog,
  `:386` who-starts-scopes) still finds no browser-craft claim in the sibling's bytes.
- **QUALITY 91** — no map/screen decision of another seat was reversed; nothing load-bearing was touched.

## Out of scope / not done here

- The lane-level C1 target (`unaccounted 0`, `newMapped ≥ 2`) is not reachable from this chunk alone; the 0
  map rows is this seat's honest result, not a claim about the wave.
- No lane file, lane index or fleet file was written; no browser launched; no tool installed (nothing needed);
  no network fetch (all evidence is pinned git bytes).
- Scratch `/fast/scratch/hyaku/tabi-r35/AdjTsukuroi2` was deleted after the receipts were copied here.

## Deliverables (all under `.ufo/waves/round-35/w1/AdjTsukuroi2/`)

| path | content | sha256 |
|---|---|---|
| `screen.tsv` | 10 screen rows, no header | `fd7a03928a84f4e01d7ce0d8d75dc845e634d52a04bee7b14a96e6e3738c7461` |
| `rows.tsv` | empty (0 map rows) | — |
| `decl.md` | no DECL (comment line only) | — |
| `l0.txt` | empty (no contested-open) | — |
| `decisions.md` | key → disposition → sentence grounded on both sides | `d7381fd801003f5f486c8a963fed6aef951001b45dd44561b1a95c5d9225c35d` |
| `counter-check.json` | frozen counter stdout at `f57917b2` | `4a829c7ba4632b6e0b07340dc5db54ed5b0fd0f31bedd812e5d29a1e5ceaa449` |

The clone-committed ledger body (header + the same 10 rows) is `corpus/adjacency-screen-browser.tsv` inside
commit `f57917b26c88676dd989bb301618749d5781baa7`; the L1 needs to land that file (and nothing else from this
seat) on the lane.
