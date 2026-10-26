# Verification — ScribeS119 (round 32 w1, routed defect 3)

All runs in a throwaway shared clone of the lane under `$HYAKU_SCRATCH/tabi-r32/ScribeS119/clone`, detached at
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`; TMPDIR = the seat scratch dir. The lane checkout was never written and no
lane script ran there.

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"     # exit 0
$ git -C "$S/clone" checkout -q --detach 4181fffb...                           # exit 0
$ git -C "$S/clone" rev-parse --show-toplevel   → /fast/scratch/hyaku/tabi-r32/ScribeS119/clone
$ git -C "$S/clone" rev-parse HEAD              → 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
$ git -C "$S/clone" status --porcelain | wc -l  → 0
```

Drafts applied only inside the clone, then committed there under the scratch identity:

```
$ git -C "$D" -c user.name=ScribeS119 -c user.email=ScribeS119@scratch.local commit -q -m "ScribeS119 draft: ..."
commit_exit=0
$ git -C "$D" rev-parse HEAD → c6798906125d93d98571a58348f929aeda7f5598
$ git -C "$D" status --porcelain | wc -l → 0
```

## 1. Registry census + sources gate (`census-and-sources.txt`, raw)

```
rows=123
malformed=0
SOURCES_GATE verdict=clean rows=123 tiers=A:108,B:6,C:9 status=queued:15,mined:99,rejected:9 findings=0 file=corpus/SOURCES.md
check_sources_exit=0
```

`rows=122` before the insertion (`git show 4181fffb:corpus/SOURCES.md`), 123 after; `malformed=0` is the contract's
`NF!=13` census. The gate accepts the duplicate URL only because cell 7 of S123 opens `supersedes S119 —`
(`scripts/check-sources.mjs:296-298`), and accepts `used-by corpus/knowledge/rate-signal-decision-table.md` because the
appended errata paragraph contains the literal `S123` (`used_by_uncited` check, `scripts/check-sources.mjs:203-241`).

## 2. Decision table, offline — two baselines

At `c679890` (draft commit), entry unchanged except the appended errata:

```
$ node scripts/check-decision-table.mjs --rev c679890... --baseline d805d1d... --entry corpus/knowledge/rate-signal-decision-table.md --json
exit=1   population 13, admitted 0, failing 13 — every row's first reason: r4-new-row

$ node scripts/check-decision-table.mjs --rev c679890... --baseline 96a2d1a3... --entry ... --json
exit=0   population 13, admitted 13, failing 0
```

Reading: with the round-32 baseline (`d805d1d`) every row fails `r4-new-row`, because `r4-new-row` requires the cited
registry row to be **absent** at `--baseline` and S119–S122 all exist at `d805d1d` (they landed in round 31). This is
the counter's baseline semantics, not a defect introduced by this seat; the entry's rows are re-measurable only
against a pre-round-31 baseline (`96a2d1a3`, round 31's own baseline). Reported to the L1 as a measurement constraint.

## 3. Decision table, live — round-31 baseline (`dt-live-baseline-round31.json`)

```
$ node scripts/check-decision-table.mjs --rev c679890... --baseline 96a2d1a3... --entry ... --live --json
exit=0   13/13 admitted, live:true, rows: D1..D13 all ok
```

Four read-only HTTPS GETs by the counter itself (S119, S120, S121, S122), all on the allowed hosts. This shows the
appended errata text does not disturb table parsing or any row's admission, and that all 13 located quotes still
appear in the live pages.

## 4. Diff shape

```
$ git -C "$D" diff --numstat HEAD~1 HEAD -- corpus/SOURCES.md corpus/knowledge/rate-signal-decision-table.md
2	0	corpus/SOURCES.md
20	0	corpus/knowledge/rate-signal-decision-table.md
```

0 deletions: the entry keeps every round-31 byte and gains one `## Errata — round 32 wave w1` section; the registry
gains one row and edits nothing (`SOURCES` contract rule 2).

## 5. Browser / process hygiene

No browser was started by this seat. Before cleanup:

```
$ pgrep -fa 'chromedriver|chromium' | grep -c 'tabi-r32/ScribeS119'   → 0
```

(Other seats' browsers are out of this seat's scope and were not touched.)
