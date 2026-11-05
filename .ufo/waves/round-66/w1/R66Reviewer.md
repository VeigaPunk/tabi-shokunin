# R66Reviewer — attack of R66Executor1 C1 output (w1 seat review, read-only)

Date: 2026-11-05. Attacker scratch: /fast/scratch/hyaku/tabi-r66/R66Reviewer (deleted before yield). All commands below were run from my own scratch or the fleet root with absolute paths; no writes outside my scope.

## Method
- r62 baseline ledgers extracted by me from the frozen rev (`git cat-file -p 2816adb…:corpus/adjacency-host-{delta,audit}-r62.tsv`), never trusted to the executor copies.
- Independent re-derivation: P3 sweep (25/25 screened lane-files byte-computed), P1 sweep (16/16 map rows status + note), P2 roster completeness (20/20), duplicate-key and disposition-conflict invariants.
- Frozen meter run twice by me (exact argv, --json); both my runs and the executor's committed meter/*.json agree.

## Meter runs (mine)
```
command: node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 2816adb359a50c2fd83fa975e39f0650aa189984 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --audit <audit> --delta <delta> --json
mechanical:  exit=1  predicate=false  findingCount=1  [delta-quote-not-whole-line | kake-shokunin:SKILL.md:1358]  (expected residue)
adjudicated: exit=0  predicate=true  findingCount=0  counts roster=20 mapRows=16 auditRows=16 deltaLanes=20 bgScreenSiblings=20 unresolvableHead=0
my runs reproduce the executor-landed c1/meter/{mechanical,adjudicated}.json exactly (same predicate/counters).
drift on the adjudicated run: 3 lanes moved past their snapshot head since the snapshot (kama,kengaku,kotoba) — disclosed drift only, not a finding.
```

## 1. Ledger diff r62 → adjudicated r66
Rows: 174 data rows both sides (25 lane rows, 149 line rows), same order, no row added or removed.
Rows with cell changes: 22. Per-column tally: head=21, provinceSha256=9, lines=8, quote=1, bgHits=0, disposition=0, type=0, lane=0, path=0.
The mechanical ledger has 21 changed rows (all but the kake SKILL.md:1358 quote cell); the adjudicated ledger adds exactly one more changed row (that quote cell).
bgHits changed in no row (executor claim confirmed). The 21 head columns match the snapshot heads (all `provinceSha256/lines/bgHits/ head` cells equal my own git python re-derivation for all 20 lanes — see item 2).

### Disposition changes (column 8)
**Zero.** Line-row dispositions byte-equal to the r62 ledger for all 149 rows; lane rows carry `-`.
Command: python cell-by-cell compare, output `dispositionChanges: 0`, `dispositionChangeList: []` also in the executor-landed c1/diff-summary.json — mutually consistent.
→ No unjustified disposition change exists; the required list is empty.

### Quote change (1) — justified
Only `kake-shokunin SKILL.md:1358`: quote replaced with the whole head line at d838e744.
Verified byte-for-byte: my `git cat-file -p d838e744…:SKILL.md | sed -n 1358p` equals the ledger quote cell exactly (python `==` on full length 782 Ch; earlier first-difference at char 547 is between the r62 head line and the r66 head line, i.e. the line itself changed at the sibling between the r62 and r66 heads — `[r93-absence 2026-11-04]` clause, char 547).
Justification check (adjudication.md + c1/quote-residue.tsv): row is still the kake-owned user-triggered-quote-truth-counter entry; only BG-word hit in the new head line is `crawl` (inside `crawlers`, twice in the counter scope descriptor); no browser-execution claim; disposition kept `no-tabi-ground`. My independent grep of the whole line confirms `crawl` is the only BG hit. **Justified; no disposition change.**

### Audit ledger
One row changed: `kumitate-shokunin@89cbd998…:SCORECARD.md:1723` note `:1885` → `:1898` (status `moved` unchanged). All 16 rows otherwise preserved.

## 2. Independent re-derivation of lane rows

10 lane-rows re-derived by me solo (`git -C <lane> cat-file -p <snapshot-head>:PROVINCE.md | sha256sum`, `wc -l`, per-line BG-word counters; BG word list copied from the frozen meter source (13 words, lowercase substring); cross-check also ran once as pipe-separated `grep -cEi` (grep -i app, once per word) and twice as inline awk (13-word table, +1 per line with any hit). All three counters agree on every sampled lane.

| lane | provinceSha256 (r62 -> r66) | lines | bgHits | head | result |
|---|---|---|---|---|---|
| audio-shokunin | 20d881a6... (unchanged) | 53 | 3 | f9da7ee9 | MATCH |
| chousa-shokunin | cf7826a4... (unchanged) | 17 | 0 | 378fda82 | MATCH |
| game-dev-2d-shokunin | 06b3c868... (unchanged) | 38 | 3 | 1e033ef0 | MATCH |
| game-dev-3d-shokunin | dd8b0328... (unchanged) | 82 | 8 | 39ca3973 | MATCH |
| kagi-shokunin | 723ca14a -> d1999362... | 110 | 4 | a916f4a5 | MATCH |
| kaidoku-shokunin | 99d29a00 -> 9f855019... | 643 -> 769 | 6 | fe1913d9 | MATCH |
| kake-shokunin | 3e70b8e9 -> ccc9b72d... | 690 -> 747 | 50 | d838e744 | MATCH |
| kama-shokunin | c5a2fe07 -> c7589cc8... | 404 -> 419 | 0 | 24d1895d | MATCH |
| kasegi-shokunin | 262e4980 -> dcf3af43... | 211 -> 219 | 0 | a5e814a1 | MATCH |
| kengaku-shokunin | 2fe3b5e1 -> 9e519864... | 1130 -> 1136 | 2 | 00462b59 | MATCH |

Commands (verbatim pattern for each of the 10 lanes):

    H=$(grep -P "^<lane>\t" snapshot-live-r66.tsv | cut -f2)
    git -C /home/vgpnk/Projects/shokunin/<lane> show $H:PROVINCE.md | sha256sum | cut -d' ' -f1
    git -C /home/vgpnk/Projects/shokunin/<lane> show $H:PROVINCE.md | wc -l
    git -C /home/vgpnk/Projects/shokunin/<lane> show $H:PROVINCE.md | grep -cEi "cdp|devtools|remote-debugging|headless|webdriver|geckodriver|selenium|playwright|bidi|crawl|screenshot|recordhar|record-har"

Inline awk cross-check on three more lanes (game-dev-2d 38/3, kake 747/50, kotoba 78/3): all match. kotoba bgHits spot-proof: exactly 3 head lines carry a BG word — 59 (`recordHar`), 61 (`headless`), 62 (`headless`); my `grep -niE` printed those three lines (git show ... of kotoba at 4df1e800).

kaidoku second spot-check: kaidoku PROVINCE.md lines=769 matches this `wc -l`; the two knowledge line rows (r10-01:151 `contested-open` and r10-02:117 `contested-open`) quote exactly the whole lines at fe1913d9 (byte-check done; `grep -c` each = 1).

-> 10/10 sampled provinceSha256/lines/bgHits match the ledger; zero mismatches. (These rows are the 9 sha-changed + 8 lines-changed lanes from the diff, i.e. the whole change surface minus the 1 quote cell.)
## 3. Moved-note recomputation (kumitate SCORECARD.md:1723)
Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 7218699c…:SCORECARD.md | python byte-compare against the map-row cited text`.
Result: the cited text `internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**,` occurs exactly once in the whole file and only at line **1898** (also asserted by the meter-same `observedStatus` code path: derivedLine 1898).
The r62 audit note said `text now at :1885` — this was already wrong at the r62 head (line 1723 vs old file at a648a6f8), it happened to be derived under an older kumitate head; the adjudicated note `text now at :1898` is right for the snapshot head 7218699c. Context lines printed: 1885 = `- **S1 / S4** — topic-form: dispatcher core; sighting wall`; 1898 = the pinned text itself.
Meter P1 check on the adjudicated audit row: no `audit-note-moved-line` finding → agrees with 1898. → **Confirmed.**

## 4. kake SKILL.md:1358 whole-line quote
Command: `git -C /home/vgpnk/Projects/shokunin/kake-shokunin cat-file -p d838e744…:SKILL.md | sed -n 1358p` → byte-for-byte equal to the adjudicated delta row quote cell (python full-string `==` true; the r62-vs-r66 line differs first at char 547, where the sibling added the `[r93-absence 2026-11-04]` clause).
Meter on adjudicated output: no `delta-quote-not-whole-line` finding (mechanical output still has it — the expected single residue). → **Confirmed.**

## 5. Meter on both outputs (my own runs)
See the top of the report. mechanical: predicate=false findingCount=1 (delta-quote-not-whole-line on kake SKILL.md:1358); adjudicated: predicate=true findingCount=0.
Both run outputs match the executor-landed c1/meter/{mechanical,adjudicated}.json exactly (same predicate, same counters).

## 6. Independent P1/P2 sweep beyond the meter
- P1 re-check, 16/16 map rows: claimed audit status == my observed status from snapshot-head bytes. Problems: 0. (Note re-derivation: 16 rows, `audit-note-moved-line` none — the note`s :1898 equals my derived index+1.)
- P2 roster completeness: roster 20 (all non-tabi lanes in the live snapshot); uncovered = none; invented (delta lane not on roster) = none.
- v22 invariants: no duplicate lane-row keys, zero (lane,relPath,line) duplicate keys in both r62 and r66 ledgers (the "same-disposition duplicates" allowance is not exercised), zero delta-disposition-conflicts.
- Full-screen P3 sweep, 25/25 screened (lane,file) pairs: every present screened file has a lane row and every hit line has a line row with a whole-line quote and a vocabulary disposition (no-tabi-ground/overlap-declared/contested-open). Problems: 0.

## Findings list

1. **note (informational)** — r62 audit note pinned `text now at :1885` for kumitate SCORECARD.md:1723 while the adjudicated head (7218699c) holds the cited text at **:1898**; also the r62 note was wrong for its own reference head (the cited text was at line 1723 uneffected in the r62 rev, sitting at 1898). The adjudicated ledger fixes the note; the TSV-diff-based finding is inherited honest (`status moved` unchanged); meter P1 green.
   Evidence: `git show 7218699c:SCORECARD.md` byte-compare → hits [1898]; meter adjudicated output has no audit-note-moved-line finding.

2. **note (informational)** — the adjudicated ledger reaches predicate true with **zero disposition changes** (column 8 byte-equal for all 174 rows) and exactly one justified quote change (kake SKILL.md:1358, justified in c1/adjudication.md + c1/quote-residue.tsv, verified against the head line byte-for-byte; only BG word is `crawl` inside the counter description; no-tabi-ground still holds). No unjustified change.

3. **note** — drift disclosure: 3 lanes (kama, kengaku, kotoba) have already moved past their snapshot head before the freeze; snapshot-live-r66.tsv remains the pinned measurement (drift is disclosed, not a defect).

4. **note (informational)** — the executed ledger changes 9 provinceSha256 + 8 lines + 21 head cells (all provenance), one quote cell, one audit note; bgHits and dispositions are byte-stable; P2/P3 sweeps (independent) identical to the meter counters.

## Kill-level / defect findings: none.

## Verdict
**Yes** — the adjudicated ledger reaches predicate true (exit 0, findingCount 0) with no unjustified disposition change (zero disposition changes), the single quote residue fixed with a verbatim whole-line quote, and the moved note corrected to the re-derived :1898.

## Residual risk / verification gaps
- My meter runs and the executor-landed c1/meter/*.json agree, but both read the same frozen counter; a counter-level distortion would not be caught here (attack of the counter is out of C1 scope; R66MutTester seats own that).
- I checked the ledger row contents byte-level and file-level; the r62→r66 quote change is the only adjudication within the ledger — the adjudication-decisions.tsv justification was checked against the head line but the *ruling* that the counter row is still kake-owned was taken from the row text (the underlying tree/rule was not re-derived).
- The bgHits-unchanged claim is corroborated both by the executor diff-summary and my python tally (0 changed bgHits cells) — but I only recomputed the sampled lanes` bgHits by hand; the full-screen sweep used the same word list and substring semantics as the meter (grep -cEi / per-line contains checks on 25 file-pairs); a character-level BG-word boundary bug shared by grep/python/awk would go unnoticed (all three implementations agree, though).
