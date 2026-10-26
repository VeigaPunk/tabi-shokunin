# AdjKakeKnowledge — C1 build (round 34, wave 1)

## Verdict

Seat scope was the seven kake candidates of `baseline/c1-candidates.tsv` that sit in kake's
`corpus/knowledge/` (rows 4, 6, 7, 54, 55, 56, 57). **All seven are accounted for by seven
`corpus/adjacency-screen-skill.tsv` rows — six `same-surface` and one `not-browser-sense` — and
this seat drafts no map row, no declaration bullet and no L0 line.** That is deliberate, not a
shortfall: every one of the six tabi-naming lines allocates tabi ground that `corpus/adjacency.tsv`
already dispositions for kake (`accessibility-browser-at-execution` ×3,
`js-rendering-browser-execution`, `crawler-discipline-vs-publishing`,
`musketeer-cdp-9222-profile-lease`), and the gate refuses a second row on a folded
`surface`+`sibling` pair (`duplicate_row`), while QUALITY criterion 91 makes a re-keyed surface on
a sibling-side fact a screen "whatever its surface name". The seventh line (`fire-journal-codes.md:27`)
is an exit-code table row for kake's own tool and maps nothing. Validation in a freeze clone at
`59f1b47aae277e1670e4a824173da8cde7e388ee`: `ADJACENCY verdict=clean rows=13 verified=13`,
`screenFindings 0`, all seven keys accounted, `unaccounted` 66 → 59, `newMapped 0`, predicate
`not-met` (exit 1) — the wave's `unaccounted 0` / `newMapped >= 3` depends on the seats whose
candidates state a boundary the map does not yet carry (kake `SKILL.md:697`,
`field-performance-cwv.md:153`, `SKILL.md:408`; kasegi `mission-control.md:119`; the kotoba split),
never on a re-key from here.

## Ground read before deciding

- `.ufo/waves/round-34/claims.json` (C1 predicate, controls J1–J5, `feasibilityDisclosed`: three new
  rows reach `newMapped 3` whatever the declarations are worth; screens with a wrong reason count as
  accounted — hence the semantic care below).
- `.ufo/waves/round-34/baseline/c1-candidates.tsv` — 67 candidates (A 38, B 29); my seven keys are
  enumerated verbatim in `decisions.md`.
- `.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` (frozen bytes, sha256
  `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` — recomputed, matches
  `claims.json` `frozenDigests`; screen rules at `:238-262`, `newMapped` at `:277-288`).
- `scripts/check-adjacency.mjs:1-170` (all nine columns, dispositions, `duplicate_row`, quote rules;
  gate bytes at my commit hash `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` =
  the digest pinned inside the counter).
- `corpus/adjacency.tsv` rows 6, 7, 8, 12, 13 (the kake surfaces named above) and
  `corpus/adjacency-screen.tsv` (round-33 house style for `same-surface` / `not-browser-sense`).
- Round-33 provenance: `.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv` rows 20–25 (kake leads,
  including `real_overlap` flags: `yes` for :122, cards:8, :77, :134, :39; **`no`** for
  `fire-journal-codes.md:27`), `corpus/QUALITY.md` criteria 87–91 (87: `same-surface` needs a mapped
  verified surface and a verbatim quote; 91: re-keyed surfaces on a sibling's own fact are screens),
  `corpus/lessons/round-33-verifier-spotcheck.md` §Routed defects.

## Decisions (one line each; full table in `decisions.md`)

| candidate | decision |
|---|---|
| `accessibility-review-packet.md:121` | screen `same-surface` → `accessibility-browser-at-execution` — kake hands tabi "authorized browser/assistive-technology work", the allocation already mapped from kake `PROVINCE.md:79` / tabi `SKILL.md:2889`. |
| `js-rendering-queue.md:77` | screen `same-surface` → `crawler-discipline-vs-publishing` — "client-side crawler discipline belong[s] to `tabi` … kake's side is the publisher's placement and status codes" is kake `PROVINCE.md:30` in substance (map row 6). |
| `static-canonical-preflight.md:134` | screen `same-surface` → `js-rendering-browser-execution` — "rendered DOM (tabi's ground)" is the browser-execution surface mapped from kake `PROVINCE.md:61` / tabi `SKILL.md:2887`; the line's new content is kake's own receipt limit (`fetchedAt` bytes), kake's side of that split (QUALITY 91). |
| `accessibility-review-packet.md:122` | screen `same-surface` → `accessibility-browser-at-execution` — same handoff sentence; the `**kagi**` credential half is the surface already refused-route as `secrets-vault-ops` (tabi `PROVINCE.md:16`). |
| `accessibility-review-cards.json:8` | screen `same-surface` → `accessibility-browser-at-execution` — the `publisherCheck` string (55 occurrences in the file) repeats the a11y execution split; "any account operation remains operator-gated" is kake's condition on its own handoff. |
| `mirror-pitfalls.md:40` | screen `same-surface` → `musketeer-cdp-9222-profile-lease` — kake's "Lease first: `webzites lease acquire …`" is its operating rule under the contested lease mapped at kake `PROVINCE.md:35` (tabi side `SKILL.md:556`); the round-33 lead's `:39` re-anchors to `:40` (counter output `leadsReanchored` below). |
| `fire-journal-codes.md:27` | screen `not-browser-sense` (surface `-`) — exit-code taxonomy of kake's own `kimi-surface.mjs` fire journal ("CDP down, no kimi tab, tab new, live fetch"); no browser behaviour, site or evidence surface tabi practises. |

No `ruled` candidate exists in this set (no fleet-repo ruling line outside `.ufo/` names kake on any
of these surfaces; the map's kagi lease row is an L0 question, not a ruling), and no
`contested-open` candidate beyond the lease already mapped — an L0 line on `mirror-pitfalls.md:40`
would restate fleet L0 `:62`.

## Evidence (commands as run; exit codes from the shell)

Quote verification — each screen quote against the pinned blob (`grep -F … | grep -cF`), pin
`044048597d62f3199494b63b36e90dd57825e350`:

```
q1=1   (a11y packet:121)  alone authorizes any later property evaluation. **tabi** receives
q2=1   (a11y packet:122)  authorized browser/assistive-technology work; **kagi** owns any credential
q3=55  (cards.json:8)     tabi owns authorized browser/assistive-technology execution and any account operation remains operator-gated
q4=0 -> 1 after re-read  (js-rendering-queue.md:77)  crawler discipline belong to `tabi` (PROVINCE.md, Adjacent); kake's side is the
q5=1   (static-canonical-preflight.md:134)  not current delivery, rendered DOM (tabi's ground) or search-engine
q6=1   (mirror-pitfalls.md:40)  Lease first: `webzites lease acquire --owner <n> --ttl-ms 900000`; release
q7=1   (fire-journal-codes.md:27)  lane/preflight infrastructure (CDP down, no kimi tab, tab new, live fetch)
```

`q4` first read as 0 because I started the quote at the previous physical line (`:76` ends
"Browser execution and client-side"); the corrected quote is a verbatim substring of line 77, the
candidate text, and is 11 words / 69 non-space bytes. All seven words/chars counts are inside
`goodQuote` (4–25 words, ≥ 20 non-space).

Clone and commit (own scratch clone, not the lane checkout):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee
git -C "$S/clone" rev-parse --show-toplevel   -> /fast/scratch/hyaku/tabi-r34/AdjKakeKnowledge/clone
git -C "$S/clone" commit …                    -> c0c54c93c2aba307dea605cdb101e8934262ba55
        1 file changed, 8 insertions(+)   corpus/adjacency-screen-skill.tsv
```

Gate at the commit (exit 0):

```
$ node scripts/check-adjacency.mjs --at c0c54c93… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin
ADJACENCY verdict=clean rows=13 verified=13          exit 0
--json: {"verdict":"clean","rows":13,"verified":13,"findings":[]}   (receipt adjacency.json)
```

Frozen C1 counter (exit 1 — predicate not met, as expected for one seat):

```
$ node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev c0c54c93… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin
C1_ADJACENCY_SWEEP_V2 predicate=not-met rev=c0c54c93c2aba307dea605cdb101e8934262ba55 adjacency=clean
candidates=67 mapped=1 screened=7 unaccounted=59 newMapped=0 screenFindings=0        exit 1
```

`--json` (receipt `c1.json`): `candidates 67`, `candidatesBySet {A:38, B:29}`, `mapped 1`,
`screened 7`, `unaccounted 59`, `newMapped 0`, `newMappedRows []`, `screenFindings []`,
`leadsUnresolved []`, `leadsReanchored ["corpus/knowledge/mirror-pitfalls.md:39@044048597… -> 40"]`,
`adjGateSha256 4e2c2a64…`, `adjacency {verdict clean, rows 13, verified 13, findings 0}`.
Per-candidate check that none of my seven sits in `unaccountedKeys` (all printed `accounted`); kake's
remaining `unaccounted` 6 are the other seats' candidates (`SKILL.md:408`, `:559`, `:697`, `:161`,
`:560`, `field-performance-cwv.md:153`).

`newMappedRows` is empty because this seat drafts no map row — the checks the item asks for
("each new row appears in `newMappedRows`") are vacuous here by construction; the seven screens are
the seat's answer and they verify with zero `screenFindings`.

No browser was launched, no network fetch was made, no package was installed or upgraded, no lane
tracked file or lane git/jj state was touched (all writes went to the seat output dir, the scratch
clone, and `$HYAKU_SCRATCH`). Scratch `/fast/scratch/hyaku/tabi-r34/AdjKakeKnowledge` is removed
after the receipts above were copied.

## Deliverables

Output dir `.ufo/waves/round-34/w1/AdjKakeKnowledge/`:

- `screen.tsv` — seven screen rows, five TAB columns, no header (the ledger body).
- `screen-committed.tsv` — the same rows as committed at `c0c54c93…` with the required header
  `sibling_ref	reason	surface	quote	note`.
- `decisions.md` — per-candidate table (key | set | decision | one-sentence reason grounded in both sides).
- `decl.md` — states zero declaration bullets and why (gate `duplicate_row`, QUALITY 91, no ruling
  line, no new L0 question).
- `rows.tsv` — empty (no map row drafted).
- `l0.txt` — empty (no L0 line drafted).
- `adjacency.json`, `adjacency.txt`, `c1.json`, `c1.txt`, `commit.txt` — raw receipts pasted above.

## Findings and limits

- **Finding (semantic risk, disclosed):** three candidates (a11y packet `:121`, `:122`, cards `:8`)
  restate one boundary, so they are three distinct candidate keys answered by three `same-surface`
  screens naming one surface. A wave-2 attack that holds one applies to all three; withdrawing one
  cannot be compensated by keeping another (the counter counts candidates, not rows).
- **Finding (re-anchor):** `mirror-pitfalls.md`'s lease line is `:40` at this pin; round 33's lead
  cited `:39`. The counter's own quote anchor performs the move (`leadsReanchored` above), so the
  licence is textual (the quote sits on `:40`), not silence.
- **Limit:** as `claims.json` `feasibilityDisclosed` says, the counter cannot judge overlap
  semantics; `screened 7 / screenFindings 0` proves structure and verbatim quotes, not that kake's
  line is a restatement. That judgement rests on the cited pairs and is open to the wave-2 attack
  seats per candidate group.
- **Limit:** `cards.json:8`'s quote occurs 55 times in that file (a repeated `publisherCheck`
  string); the screen is keyed to line 8 only, every occurrence carries the same restatement, and no
  claim is made that line 8 is the unique home of the sentence.
- **Not claimed:** the wave's `unaccounted 0` and `newMapped >= 3`; any new tabi declaration line;
  any ruling, L0 filing, or assimilation decision; no build/lint/format of the lane was run.
