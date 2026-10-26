# AdjMado2 — C1 build, chunk `w1-chunks/AdjMado2.tsv` (10 mado lines)

**Verdict.** All ten candidate lines are screened, none mapped: they are two mado theme-plane notes
censusing the omarchy theme payload `chromium.theme` (9 bytes) and its consumer output
`/etc/chromium/policies/managed/color.json`. The browser word enters only as a payload file name and a
policy path; no line states mado's side (owns / refuses / routes / leases / shares / contests) of any
surface in tabi's `PROVINCE.md`, so under the decision rule (`SKILL.md:2861-2881`) rule 1 screens seven
lines as `not-browser-sense` and rule 4 screens three as `no-claim-declared` (mado marks browser
adoption `[UNK]` / "unverifiable without a restart"). No `same-surface` screen was available (no mado
row exists in the 16-row map), and no truthful map row exists: a mechanical check with the frozen
counter's own regexes shows **SIDE matches on 0 of 10** quoted substrings, so a `split-declared` row
would be refused `n4-split-quote-states-no-side`, and `ruled` / `contested-open` / `refused-route` have
no truthful ruling, L0 question or tabi refusal naming mado. This chunk therefore contributes
`mapped 0`, `screened 10`; the lane target `newMapped >= 2` rests on other chunks' rows (map unchanged
at my commit).

## Evidence (commands, exit codes)

Scratch clone at the frozen baseline (all in `/fast/scratch/hyaku/tabi-r35/AdjMado2`):

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone          exit 0
git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83      exit 0
git -C $S/clone rev-parse --show-toplevel  -> /fast/scratch/hyaku/tabi-r35/AdjMado2/clone
```

Key verification (python, exit 0): for each of the 10 chunk keys, `git -C mado-shokunin show
e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:<path>` line N equals the chunk text and the frozen
`baseline/c1-candidates.tsv` text — `line-match: True`, `in-frozen-candidates: True`,
`frozen-text-match: True` ×10.

Sibling context read at that pin: `corpus/knowledge/theme-route-r18.md` lines 130-160 (its
`## Unexercised behavior` list) and `corpus/knowledge/theme-wallpaper-plane.md` lines 1-30, 40-60,
85-100, 185-235, 340-385 (declared-file census, §4 consumer-chain table, §9 re-runs, §11 unknowns);
mado `PROVINCE.md` at the pin (theme plane is mado's declared surface, read-only, "every claim is
file-byte- or screenshot-verified"). `git -C $S/clone cat-file -e a4bfef0f…:corpus/adjacency-screen-browser.tsv`
→ absent (I create the ledger); `corpus/adjacency.tsv` at the freeze = 17 lines = header + 16 rows,
none naming mado.

Screen validation (python, exit 0): each quote is a verbatim substring of the trimmed candidate line
(or the whole trimmed line for the short `:52`, `:230`, `:353`, `:354` rows), 4-25 words and >= 20
non-space chars, no TAB/C0/bidi characters in any field.

Commit inside the clone (toplevel asserted equal to the clone first):

```
git -C $S/clone -c user.name=AdjMado2 -c user.email=AdjMado2@scratch.local add corpus/adjacency-screen-browser.tsv
git -C $S/clone … commit -m "r35 w1 AdjMado2: browser screen ledger, 10 mado theme-plane lines"
-> c17d422b64ee64d218810b50e2ad6c0c460c7bbf   (1 file changed, 11 insertions: header + 10 rows)
```

Frozen counter, `TMPDIR=$S/tmp`, `--repo $S/clone --fleet /home/vgpnk/Projects/shokunin
--rev c17d422b64ee64d218810b50e2ad6c0c460c7bbf --json` → **exit 1** (predicate not met, expected):

```
C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=c17d422b … adjacency=clean candidates=383
  mapped=0 screened=10 unaccounted=373 newMapped=0 screenFindings=0
```

- adjacency verdict `clean`, rows 16, verified 16, findings 0;
- `screenFindings` `[]` — **0 findings on my 10 ledger rows**;
- `unaccountedKeys` contains **none** of my 10 keys (383 − 10 = 373 unaccounted, all other chunks);
- `newMappedRows` `[]` and `newRowRefusals` `[]` — no row of mine is scored, because I propose none.

SIDE/BG mechanical check with the frozen counter's regexes on my ten quotes (python, port of
`c1-adjacency-sweep-v3.mjs` `BG`/`SIDE`): BG true on 9/10, **SIDE false on 10/10** (the `:196`
disclaimer substring "file pair resolved; adoption `[UNK]`" matches neither).

## Deliverables (in `.ufo/waves/round-35/w1/AdjMado2/`)

| File | Bytes | Content |
|---|---|---|
| `screen.tsv` | 3296 | 10 rows, 5 TAB columns (`sibling_ref reason surface quote note`), no header; `surface` = `-` on all ten |
| `rows.tsv` | 0 | empty — no map row proposed |
| `decl.md` | 0 | empty — no DECL line, so `SKILL.md` was not appended in the clone |
| `l0.txt` | absent | no contested-open row, so no L0 question |
| `decisions.md` | 5965 | per-key decision, reason and one-sentence ground on both sides' bytes; counter facts |
| `counter-check.json` | 39615 | the counter's full `--json` object at `c17d422b…` |

## Findings and limits

- No product/lane file was edited; the only clone change is the new untracked-at-baseline ledger file.
- No tool installs or upgrades were needed this seat; no browser was launched (C1 is git-object work).
- The screens are screening *reason* claims, not overlap judgments: if wave 2 reads any mado line as a
  real overlap, the row shape available is `split-declared` only, and the frozen counter would refuse
  it for lack of a SIDE word — the disagreement is with the line, not with the quote.
- `mapped 0 / newMapped 0` at my commit is honest and local: the map is unchanged at
  `c17d422b…`, so the lane-level `unaccounted 0 AND newMapped >= 2` predicate can only be read after
  the other chunks' rows land. My contribution is 10 accounted candidates with 0 screenFindings.
- Scratch `/fast/scratch/hyaku/tabi-r35/AdjMado2` was removed after the receipts above were copied
  (verified absent).
