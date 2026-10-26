# CritScreenTameshiTsukuroiChousa — attack on the eight screen rows for tameshi / tsukuroi / chousa

**Verdict: holds — no defect in the eight rows, at any severity.** I attacked every screen row that the
round-34 ledger carries for these three siblings (tameshi 5, tsukuroi 2, chousa 1; ledger lines
30–36 and 63 of `corpus/adjacency-screen-skill.tsv`, 62 data rows total) read in context at their own
frozen pins: 7 `third-lane-report`, 1 `no-claim-declared`, no `same-surface` and no
`not-browser-sense` row in this set. All eight keys are exactly the frozen candidate keys (`set A` ×7,
`set B` ×1), all eight pins equal the frozen `PINS` map, all eight quotes are verbatim substrings of the
cited line inside the 4–25-word / ≥20-non-space window, and the candidate text equals the pin line's
trimmed text. **No real overlap is screened**: no map row in `corpus/adjacency.tsv` carries tameshi,
tsukuroi or chousa at all (17 rows, siblings kaidoku/revenger/kake/kagi/kumitate/kama/kotoba/kasegi), so
`same-surface` was impossible and the `-` surface cells are the only legal value; and every reason is the
*first* applicable answer of the lane's own ordered rule (`SKILL.md:2863-2877`), not a convenience label.
The strongest counterexample I could build from local evidence — tsukuroi IN-093 recording tabi's
Chromium version-pin drift against tsukuroi's pacman province — fails the overlap test: the sibling side
is a `historical | RESOLVES` pointer-resolution row that claims nothing, and tabi's side of that boundary
exists only in `.ufo/` wave drafts, which `scripts/check-adjacency.mjs` refuses as a `tabi_ref`; a map row
here would manufacture a boundary. Four observations follow the table; none is a defect and none changes
`unaccounted 0`.

## Per-row verdicts, grouped by reason

### `third-lane-report` (7 rows) — all hold

Ordered rule, quoted from `SKILL.md:2863-2877`: step 1 `not-browser-sense` applies only to "a sibling line
that only matches the regex through another sense of the word (a UI "chrome" skin, a prose "crawl" of a
book)"; step 3 is "Does the line only report another lane's work — a probe it ran, **a measurement it
took**, a ruling it received — without claiming anything on this lane's surface?" Each row below names the
lane `tabi` itself (not a homonym) and reports a measurement or a pointer resolution, so step 3 is the
first applicable answer; step 2 was impossible (no map row for these siblings), and step 5 (overlap) is
refused by the content test in the last column.

| # | key | quote (verbatim) | content test — why not an overlap | verdict |
|---|---|---|---|---|
| 1 | `tameshi@c6295cb0:corpus/knowledge/fleet-kill-rate-ledger.md:128` | `their gate-ness is U until a survey admits them; tabi \`tools/\` absent;` (12 w / 59 ns) | inside "**Boundary — sightings and adjacent machinery, not queued**": kake/kama/kotoba file existence, then tabi's `tools/` absence. Tabi's `PROVINCE.md:3-13` owns no tooling or gate surface (`grep -n -i -E "gate\|tool\|script" PROVINCE.md` → no match), and tameshi's own `PROVINCE.md:14-17` refuses product domains ("every lane's gate remains its own"). The line claims no surface on either side. | holds |
| 2 | `tameshi@c6295cb0:corpus/knowledge/fleet-suite-census.md:306` | `` `tabi-shokunin/tools/` were empty at read `` (5 w / 37 ns) | suite-census receipt of a directory listing; tabi appears beside mado's `tools/`. Same test as #1. | holds |
| 3 | `tameshi@c6295cb0:corpus/knowledge/fleet-suite-census.md:621` | ``tabi `tools/` still absent`` (4 w / 23 ns) | first half of one cross-ref sentence (ends `rc=2).` on `:622`): "tabi `tools/` still absent (`ls tabi-shokunin/tools` → …)". Read receipt. | holds |
| 4 | `tameshi@c6295cb0:corpus/knowledge/fleet-suite-census.md:622` | ``tabi-shokunin/tools` → No such file or directory, rc=2`` (8 w / 47 ns) | second half of the same sentence — the `ls` receipt itself. | holds |
| 5 | `tameshi@c6295cb0:corpus/knowledge/fleet-suite-census.md:646` | `` `078a260184e25282…` (unchanged); tabi tools absent`` (5 w / 46 ns) | S3 drift/queue anchor list beside kagi gate pins; a pin/drift receipt, no browser claim. | holds |
| 6 | `tsukuroi@a84fc9de:corpus/knowledge/adjacency-anchors-r19.md:187` | `` `tabi:.ufo/waves/round-16/drafts/DraftAdjacency.md:29` \| `PROVINCE.md:8-14` \| historical \| RESOLVES`` (7 w / 93 ns) | IN-092 in tsukuroi's inbound-pointer ledger. The tabi pointer lands on the draft's tsukuroi bullet ("`:8-14` owns pacman state; `:27` Never installs, upgrades, or removes packages"); the row's own resolving cell is "**Owns (surfaces, all read-only probes):** pacman state (`pacman -Qkk`" — host package state, not browser ground; marked `historical`. Report of a tabi pointer + receipt, no claim on tabi's craft. | holds |
| 7 | `tsukuroi@a84fc9de:corpus/knowledge/adjacency-anchors-r19.md:188` | `` `tabi:.ufo/waves/round-16/w1/ConnSiblings.md:71` \| `PROVINCE.md:8-14,27` \| historical \| RESOLVES`` (7 w / 90 ns) | IN-093, same shape: the tabi pointer lands on tabi's own `ConnSiblings.md:71` row ("Chromium version pin (152 in README vs 154 on host) — **Report** the version-pin drift"), resolved to tsukuroi `PROVINCE.md:27` "Never installs, upgrades, or removes packages". This is the strongest overlap candidate in the set; it still fails: tsukuroi claims only its own province line, the tabi side is wave scratch (`check-adjacency.mjs` refuses `.ufo/` as a `tabi_ref`), and the tabi pointer is tabi's own declaration, not the sibling's claim. Mapping it would need a manufactured sibling side. | holds |

### `no-claim-declared` (1 row) — holds

| # | key | quote (verbatim) | content test | verdict |
|---|---|---|---|---|
| 8 | `chousa@00f8c7f5:corpus/knowledge/archived-export-intake.md:20` | `no browser, CDP or session access` (6 w / 28 ns) | `window_mode: loopback, local file reads only, no external fetch of any kind, no browser, CDP or session access, no credential or config reads`. A deliberate non-goal on chousa's own record; it names no tabi and routes nothing to it, so the step-5 `refused-route` map row has no sibling-side route to record, and step 4 is the first applicable answer (step 3 does not apply: the line declares chousa's window, it does not report a tabi probe). `not-browser-sense` would be wrong here — the line is *about* browser access, declining it. | holds |

### `same-surface` — none in scope

The test "does the named surface really carry that boundary" is vacuous for these siblings: `corpus/adjacency.tsv`
at `04f9623` has no row whose sibling is tameshi, tsukuroi or chousa
(`awk -F'\t' 'NR>1{print $2}' corpus/adjacency.tsv | sort -u` → kaidoku, revenger, kake, kagi, kumitate, kama,
kotoba, kasegi). A `same-surface` cell would therefore have been `screen-surface-unmapped`; all eight rows write
`-`, which is the required value for their reasons (`SKILL.md:2849`).

## Observations (recorded, not defects; no repair attempted)

- **O1 — tsukuroi quotes omit the deciding clause; the notes carry it.** Both quotes stop at `RESOLVES`; the
  span that decides the disposition ("pacman state", "Never installs …") is in the row's last cell and is named
  in both notes. This is the same shape as the round-33 routed precision item on kake `PROVINCE.md:411`
  (deciding token outside the quoted span), whose routed fix was a **note**, not a new quote — and these notes
  already do it. Optional hardening if the L1 wants byte-level consistency: extend row 6's quote to
  `**Owns (surfaces, all read-only probes):** pacman state` (7 words, verbatim on `:187`). Reason, accounting
  and counter numbers are unchanged either way.
- **O2 — "tabi `tools/` absent" is true, but tabi's gates live in `scripts/`.** `git cat-file -e 04f9623:tools`
  fails; `git ls-tree --name-only 04f9623:scripts` lists 34 entries (`check-adjacency.mjs`,
  `check-bidi-runtime.mjs`, `check-selfassessment.mjs`, `measure.sh`, …). So the five tameshi lines are literally
  accurate about a directory name, while the fleet's gate survey never looked at tabi's actual gates. The screens
  do not misattribute this: notes 1–5 scope the claim to tabi's *province* ("no gate surface"), which is the
  correct statement. Risk is reader-side only (a closure reader could read "tools/ absent" as "no gates") and
  belongs to tameshi's document, not to this ledger.
- **O3 — the w1 seat's "third-lane-report may be over-used" worry is settled, not open.** `not-browser-sense`
  is reserved by the rule's own gloss for a regex match through *another sense of the word*; every row here
  names the lane `tabi`. The ledger's single `not-browser-sense` row (kake `fire-journal-codes.md:27`, another
  seat's scope) is the other side of that same boundary, so the vocabulary is used consistently across the 62
  rows (histogram same-surface 35 / third-lane-report 23 / no-claim-declared 3 / not-browser-sense 1 = exactly
  `corpus/lessons/round-34.md:65-66`).
- **O4 — row 3 sits on the quote floor.** `tabi \`tools/\` still absent` is 4 words / 23 non-space characters:
  the minimum `goodQuote` accepts (`>= 4` words, `>= 20` non-space). Valid as landed; zero slack, so any later
  edit of that span (e.g. dropping the backticks) fails `screen-quote`. No action.

## Evidence — commands, exit codes, bytes

Scratch `S=/fast/scratch/hyaku/tabi-r34/CritScreenTameshiTsukuroiChousa` (deleted after copying receipts);
`TMPDIR="$S/tmp"` on the counter run; one clone, `git -C "$S/clone" rev-parse --show-toplevel` printed
`$S/clone` before any commit-capable call (no commits were made; nothing was written outside `$S` and this
seat's output dir).

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                 # exit 0
$ git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa            # exit 0
$ TMPDIR="$S/tmp" node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
      --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo "$S/clone" \
      --fleet /home/vgpnk/Projects/shokunin --json                                          # exit 0
   {"predicate":true,"candidates":67,"candidatesBySet":{"A":38,"B":29},"mapped":5,"screened":62,
    "unaccounted":0,"newMapped":4,"screenFindings":[],
    "adjacency":{"verdict":"clean","rows":17,"verified":17,"findings":0},
    "perLane":{"tameshi":5,"tsukuroi":2,"chousa":1, ...}}
$ sha256sum …/tabi-shokunin/corpus/adjacency-screen-skill.tsv                                # 4435bbcd2dffa3abca6e510636bbbbd80d0e3790029cd94008e438d369ed20e1
$ git -C "$S/clone" show 04f9623:corpus/adjacency-screen-skill.tsv | sha256sum                # 4435bbcd… identical: the ledger I attacked is the integrated blob
$ python3 "$S/check_screens.py"                                                              # exit 0
   per row: in_candidates=True, set=A|B, text_trimmed_eq=True, pin_eq_frozen=True,
            quote_substr=True, 4<=words<=25, nonspace>=20, surface=-, reason in vocabulary
$ ledger integrity: 62 data rows, 0 duplicate keys, all 5 columns, 35 same-surface + 27 dash,
  0 reasons outside {not-browser-sense, same-surface, third-lane-report, no-claim-declared}
$ git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path> | sed -n '<n-10>,<n+10>p'
   # context read for all 8 (tameshi c6295cb0, tsukuroi a84fc9de, chousa 00f8c7f5): exit 0
$ git -C "$S/clone" show 15dfaccb:.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv | grep -E '^(tameshi|tsukuroi|chousa)'
   # tsukuroi …:187@71851d63… (round-33 label: third-lane-report) ; chousa …:20@00f8c7f5… (round-33 label: refusal)
$ git -C "$S/clone" grep -n -I -E '\b(tsukuroi|tameshi|chousa)\b' 04f9623 -- SKILL.md PROVINCE.md corpus
   # tabi names tsukuroi only at SKILL.md:2827 (roster scan counts) + the two ledger rows;
   # tameshi/chousa appear nowhere in tabi's committed files except ledger rows/evidence archives
$ git -C "$S/clone" show 04f9623:SKILL.md | grep -n -i -E "pacman|never install|install.*package|chromium (upgrade|update)"   # no match (exit 1)
$ git -C "$S/clone" show 04f9623:PROVINCE.md | grep -c -i -E "gate|tool|script"                                              # 0 (exit 1)
$ git -C "$S/clone" cat-file -e 04f9623:tools                                                                               # fatal: path 'tools' does not exist (exit 128)
$ awk -F'\t' 'NR>1{print $2}' corpus/adjacency.tsv | sort -u   # kagi kaidoku kake kama kasegi kotoba kumitate revenger (no tameshi/tsukuroi/chousa)
```

Deciding citations:
- `SKILL.md:2863-2877` (ordered rule: 1 not-browser-sense → 2 same-surface → 3 third-lane-report →
  4 no-claim-declared → 5 overlap; "a real overlap is never screened").
- `SKILL.md:2841-2851` (ledger columns; the round-33 header — note its `sibling_ref` rule is written for
  round 33's `PROVINCE.md` sweep and its scope line at `SKILL.md:2819-2839` says so; round 34's extension to
  sibling `SKILL.md`/`corpus/knowledge/` lines is declared at `SKILL.md:2919`, so there is no stale-schema
  contradiction between the two sections).
- `SKILL.md:2819-2839` + `corpus/adjacency-screen.tsv` row 45 (round-33 precedent: tsukuroi
  `PROVINCE.md:150` screened `third-lane-report` for restating another lane's declaration) — same practice.
- `corpus/lessons/round-34.md:65-66` (histogram) matches the ledger byte-for-byte in counts.

## What a defect would have looked like, and was not found

- a key absent from `baseline/c1-candidates.tsv`, a pin other than `PINS`, a quote not on the line, a
  `surface` other than `-` paired with a non-`same-surface` reason, a duplicate `sibling_ref`, a missed
  candidate for one of the three lanes (perLane 5/2/1 = the 8 rows; `unaccounted 0`);
- a stepped-over overlap: any line claiming a surface tabi owns (browsers, driver, protocol, capture) or
  restating a mapped boundary. None of the eight does; the closest (row 7) is a pointer row with no claim and
  an un-citable tabi side, recorded as a limit by w1, not a missing map row.

## Deliverables

- `.ufo/waves/round-34/w2/CritScreenTameshiTsukuroiChousa.md` — this report
- `.ufo/waves/round-34/w2/CritScreenTameshiTsukuroiChousa/eight-rows.tsv` — the 8 rows verbatim as integrated at `04f9623`
- `…/context.txt` — ±10-line context of each candidate at its pin, the two tabi lines IN-092/IN-093 resolve to,
  tabi `PROVINCE.md:3-13`, tameshi/chousa province extracts, `scripts/` inventory, the ordered rule `2863-2877`
- `…/c1-at-integration.json`, `…/counter-summary.txt` — frozen C1 counter at `04f9623` (exit 0, predicate true)
- `…/check_screens.py`, `…/ledger-integrity.txt` — the per-row mechanical check and the 62-row integrity check
- `…/commands.txt` — exact commands and exit codes

Tool installs: none. Network fetches: none. Browser launches: none. Lane/sibling/fleet writes: none.

Report: .ufo/waves/round-34/w2/CritScreenTameshiTsukuroiChousa.md
