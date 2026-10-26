# AdjKumitate2 — C1 build, 17 kumitate candidate lines (round 35, w1)

**Verdict.** All 17 candidate lines in my chunk are accounted for, each by one `same-surface` screen row naming `kimi-webbridge-plugin-internals`, the surface verified map row 9 already owns for kumitate (`corpus/adjacency.tsv:10`: kumitate `SCORECARD.md:1556` "internals route to **tabi**" × tabi `PROVINCE.md:6` "**Owns (surfaces):** the kimi-webbridge plugin"); no map row is proposed because every one of the 17 lines is an inventory fact (bytes / mode / digest / declared version / install root / copy set / name collision) about the kimi-webbridge payload and none states kumitate's side — owns, refuses, routes, leases, shares, contests — of any browser-ground split, so a row would be a fabricated overlap. Counter at my ledger commit `c6e0db9e`: `adjacency=clean rows=16 verified=16 findings=0`, `screened=17`, `screenFindings=[]`, my 17 keys absent from `unaccountedKeys`, `newMappedRows=[]`, `newRowRefusals=[]`, predicate false (globally `unaccounted=366`, `newMapped=0` — the other 366 accounts and the ≥2 new rows belong to the sibling chunk seats, not this one).

## Candidate set and what the sibling document is

All 17 keys are `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md:<line>` (chunk `kumitate` = 66 candidates sweep-wide). The document is kumitate's own census of the Kimi Code skills/plugins plane (`# Kimi skills & plugins plane — how skills and plugins resolve`, line 1), and my lines sit inside two of its sections:

- `## ~/.kimi-code/skills/kimi-webbridge` (line 218) → `### File inventory — 7 files` (line 252): lines 257-262, 267.
- `### Relation to the managed plugin tree` (line 269): 271, 274-277; `### The same bytes in four harness roots` (288): 291, 292, 294; `### Name collision with the managed plugin's skill` (300): 302; 284 is the `~/.kimi-code/plugins/installed.json` record quoted inside the webbridge section.
- The same section states the boundary the whole chunk rests on at line 250: "the daemon itself is tabi's ground, not described here".

kumitate `PROVINCE.md` at the pin (read in full) is orchestration & tooling; its Core band names the Kimi Code substrate `~/.kimi-code/` (rows K1–K5) and has no browser-owning line, which is why no line in my chunk can carry kumitate's side of a browser split.

## Decision rule application (`SKILL.md:2861-2881`)

1. Browser craft? Yes for all 17 — they are about the kimi-webbridge plugin/skill, tabi's "primary substrate documentation" (`PROVINCE.md:6`), not a regex accident ("webbridge" is the substrate itself).
2. Surface already owned for this sibling? Yes — map row 9 (`corpus/adjacency.tsv:10`) is verified at my rev (gate reports 16/16 verified, 0 findings) and owns `kimi-webbridge-plugin-internals` for kumitate. Steps 3/4 never reached: none of the lines reports another lane's work, and none declares a refusal of its own.
5. Not reached — no line states a side, so no map row. QUALITY 97's third-lane test also fails on the cited path (`corpus/knowledge/kimi-skills-plugins.md` carries no census-of-other-lanes marker): the line is kumitate's own measurement of the payload, i.e. a fact on the sibling's side of an already-mapped split (QUALITY 91's screen case), never a statement of the split.

## Evidence (commands, exit codes)

Clone (scratch, one live clone):

```
S=/fast/scratch/hyaku/tabi-r35/AdjKumitate2 ; TMPDIR=$S
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83      # 0
git -C "$S/clone" rev-parse HEAD                                                     # a4bfef0f75027c915e715649950b1d46dcb33d83
git -C "$S/clone" rev-parse --show-toplevel   # /fast/scratch/hyaku/tabi-r35/AdjKumitate2/clone
```

Counter at the freeze (control: the ledger does not yet exist):

```
cd "$S/clone" && node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev a4bfef0f75027c915e715649950b1d46dcb33d83 --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                                      # exit 1
adjacency clean rows=16 verified=16 findings=0 | mapped=0 screened=0 unaccounted=383 newMapped=0
screenFindings=[]  (all 17 chunk keys present in unaccountedKeys)
```

Ledger written and committed in the clone (`corpus/adjacency-screen-browser.tsv`, new file: header + 17 rows):

```
git -C "$S/clone" -c user.name=AdjKumitate2 -c user.email=AdjKumitate2@scratch.local \
  commit -q -m "r35 w1 AdjKumitate2: screen ledger, kumitate webbridge inventory lines (17)"   # 0
git -C "$S/clone" rev-parse HEAD   # c6e0db9e9dc194c3e3b69320f43328e99e027738
git -C "$S/clone" diff --stat a4bfef0f c6e0db9e
  corpus/adjacency-screen-browser.tsv | 18 ++++++++++++++++++   1 file changed, 18 insertions(+)
```

→ `SKILL.md`, `corpus/adjacency.tsv` and every other lane file are byte-unchanged: no DECL lines, no map rows, no L0 line.

Counter at my ledger commit:

```
node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev c6e0db9e... \
  --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json                     # exit 1
adjacency clean rows=16 verified=16 findings=0 | candidates=383 mapped=0 screened=17
unaccounted=366 newMapped=0 screenFindings=[] newMappedRows=[] newRowRefusals=[]
my keys still unaccounted: []   (17/17 accounted, all via screen)
```

Discriminating control on the `surface` cell (same ledger, `surface` rewritten to `webbridge-inventory-control`, commit `0c9ff4e21999611ca027cae07682c6363ae73585`, then checked back out):

```
node ... --rev 0c9ff4e2... --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json   # exit 1
screened=0 unaccounted=383 screenFindings=17 {"screen-surface-unmapped"}   # one per row
git -C "$S/clone" checkout -q --detach c6e0db9e...   # 0; status --porcelain → 0 lines
```

So `screenFindings=0` at `c6e0db9e` is a live reading: the surface cell is checked against verified rows, and a wrong surface drops all 17 back to unaccounted. A final rerun at `c6e0db9e` after the control reproduced the same numbers (exit 1).

Quotes are whole trimmed candidate lines (all 17 are ≤14 whitespace-words, so each is both a verbatim substring and accepted by the counter's short-line clause); no quote carries a TAB or CR (`awk -F'\t' '{print NF}' screen.tsv` → `5` on every row).

## Known limits / for the attack seats

- **Scope of `same-surface`.** Key 284 quotes the `plugins/installed.json` registry record, keys 291/292/294 the three non-Kimi harness copies, key 302 the skills-copy `SKILL.md:2` name collision. These are payload-internal facts of the *same* kimi-webbridge skill, but they lie in files outside the managed plugin tree named in map row 9. If a wave-2 seat judges that the mapped surface (`kimi-webbridge-plugin-internals`, ground: `~/.kimi-code/plugins/managed/kimi-webbridge/`) cannot extend to the skills-tree copy or to the registry record, the honest repair is a new surface with its own declaration, not a different screen reason — none of the four is `not-browser-sense`, a third-lane report, or a declared non-claim.
- **Screens carry no tabi side** (QUALITY 88/91): this chunk contributes 17 accounts and 0 of the ≥2 new verified map rows the frozen predicate needs; `unaccounted 366` and `newMapped 0` are expected from one 17-line chunk of a 383-line sweep.
- `same-surface` was accepted against map row 9 at pin `1770305f…` (its own pin), as the counter folds `(surface, sibling)` regardless of the row's sibling pin.

## Environment discipline

No browser or driver process was started; no tool installed or upgraded; no network fetch; no write outside my scratch dir and my output dir; scratch clone only (`git -C "$D"` on every call, toplevel asserted). Scratch `/fast/scratch/hyaku/tabi-r35/AdjKumitate2` deleted after the receipts were copied into the output dir.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate2/screen.tsv` — 17 screen rows, no header (append body for `corpus/adjacency-screen-browser.tsv`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate2/decisions.md` — key | map/screen+reason | both-sides sentence, plus the no-map-row rationale.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate2/counter-check.json` — three counter runs (freeze, ledger, control) with `myKeys`, `screenFindingsOnMyRows`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate2/rows.tsv`, `decl.md`, `l0.txt` — zero-byte: this chunk proposes no map row, no `DECL<n>`, no L0 line.
