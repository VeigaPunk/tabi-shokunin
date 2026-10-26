# Round 33 wave-2 findings U15–U28 — dispositions (round 35, w1)

seat: ScribeUDispositionsB (scribe, leaf)
freeze re-checked: `a4bfef0f75027c915e715649950b1d46dcb33d83` (`round-35: freeze claims, counters, controls`)
clone: `/fast/scratch/hyaku/tabi-r35/ScribeUDispositionsB/clone` (`git clone --shared` of the lane, detached at the freeze; deleted at yield)
item source: `corpus/lessons/round-34.md:97-104` (§Mistakes sweep, "U08–U13/U16–U19 (precision items in round-33 text), U14/U15/U20/U21 (criteria 87/88 and screen granularity), U22–U26 (coverage of R4, near-copy drivers, S125 carry)") and `corpus/lessons/round-34-verifier-spotcheck.md` §Routed defects 4.
index: `.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md:383-625` (U14–U28 detail), checks `.ufo/waves/round-34/w1/ScribeMistakeSweep/sweep-checks.sh`
receipt: `holds-receipt.txt` next to this file (36 HOLDS / 0 BROKEN), produced by `verify-holds.sh` — both in this directory.

**Verdict, one paragraph. All fourteen findings (U15–U28) still hold at the freeze.** Not one of them was fixed,
withdrawn or rejected by round 34's integration (`04f9623d`), its wave-2 corrections (`b44b964d`) or the round-34
closure (`2d2c8a7`): `git log -S` shows the criterion-88 headline, the README:766 population sentence, the gate
header's "registry or lessons absent", the exact-byte driver comparison and the `shots.some` R4 predicate unchanged
since the commits that introduced them (round 33 `bf48b81`, round 32 `2f8535c`). The round-35 freeze also changes
none of them — its commit adds only `.ufo/waves/round-35/**` (the counters, controls, `measure.sh`,
`c1-candidates.tsv`, `c1-pins.json`) and two append-only registry blocks (`LOG.md` +13, `SCORECARD.md` +36) — and,
decisive for U21, the new frozen C1 counter **inherits** the substring
quote semantics at `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:242`. Four findings carry a stale
*example* while the defect itself stands (U15 row 15 now names `tabi`, U18's seat locators are data-row indices,
U19's `:354-363` range is partly wrong, U24's cited `:856` is now `:860`); those four are recorded with the
correction rather than upgraded. Dispositions: **8 correction-drafted** (U15, U16, U17, U18, U19, U20, U26, U28),
**4 routed to a future instrument claim** (U21, U22, U25, U27), **U23 split** correction-drafted (wording) /
routed (normalised digest), and **U24 fixed in substance by `04f9623d`** (the shipped case now pins the admitted
behaviour) with its stale sentence correction-drafted. Two findings are in conflict with each other on one cell
(U20 wants screen row 6 moved to the robots surface; CritScreenCrawlerSplit calls the same row a legitimate
umbrella) and the conflict is reported verbatim below, unresolved, for the L1/canonical judge.

## Dispositions

`holds-at-freeze` = re-checked against the bytes the finding names, at `a4bfef0f` (commands in §Evidence; a
finding's own quoted line numbers are from its round-33 revision and may have moved — each move is recorded).

| U-id | finding (verbatim, path:line) | holds-at-freeze | disposition | evidence |
|---|---|---|---|---|
| U15 | "**F4 — low — criterion 88's headline overstates mutuality; the landed rows show the one-directional rule is operative.** Headline (`QUALITY.md:545-546`): "its two quotes name each other's lane"." — `.ufo/waves/round-33/w2/RevQuality87.md:150-151` | **yes**; example stale: `corpus/adjacency.tsv:15` (round-34 row) *does* name tabi in its sibling_quote (row 14 names only the sibling) | **correction-drafted** (headline only; the elaboration stays) | `corpus/QUALITY.md:545` still "name each other's lane"; counter one-directional at `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:220-227`; gate `scripts/check-adjacency.mjs:84-87`; rows 14/15: `sib_has_tabi=0/1`, `tabi_has_kake=1/1`. Round-35 widens the gap: its n4 names no lane at all (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:50-55`) |
| U16 | "**F5 — low — criterion 89's lesson pointer lands on the wrong section.** Source line (`QUALITY.md:567-568`): "corpus/lessons/round-33.md §Gate"." — `.ufo/waves/round-33/w2/RevQuality87.md:159-160` | **yes** | **correction-drafted** → pointer `§Mistakes M1` | `corpus/QUALITY.md:567` unchanged; battery/forgeriesAccepted/whitelist terms: §Gate (`round-33.md:24-92`) **0**, M1 (`:173-189`) **5** |
| U17 | "**F2 — low — criterion 90's four-construction enumeration misaligns with CritC1Forgery's construction table.**" (parenthetical "a driver re-exporting the gate" + no v4) — `.ufo/waves/round-33/w2/RevQuality87.md:132-134` | **yes** | **correction-drafted** → enumerate by commit id as SCORECARD does | `corpus/QUALITY.md:574-576` unchanged; `byte-identical` absent from criterion 90 (0), present with commit at `SCORECARD.md:1793-1796` (`b858b5d`, `e666174`, `7912a62`, `cee9539`) |
| U18 | "**Observation — surface label, row 28 (`:377`).** The line is robots.txt `User-agent:`/wildcard semantics, so the more exact owner is `robots-txt-publisher-audit-vs-client-obedience`" — `.ufo/waves/round-33/w2/CritScreenCrawlerSplit.md:131-133`; "screen row for `kake:358` names the wrong mapped surface" — `.ufo/waves/round-33/w2/CritAdjacencyHarm.md:142` | **yes**; seat locators are data-row indices — file lines are 21 and 29 | **correction-drafted** (relabel two `surface` cells; no counter clause) | `corpus/adjacency-screen.tsv:21` (kake:358) and `:29` (kake:377) both still `crawler-discipline-vs-publishing`; the owning rows exist: `corpus/adjacency.tsv:13` robots (sibling_ref kake `PROVINCE.md:304`), `:12` js-rendering (ruling_quote "canonical declaration and selection stay kake's") |
| U19 | "**D2 — defect (low): `corpus/README.md:766` claims a population the frozen regex does not cover**" — `.ufo/waves/round-33/w2/CritAdjacencyHarm.md:117` | **yes**; range imprecise (see correction) | **correction-drafted** (reword + carried limit) | `corpus/README.md:766` still "Every browser-domain line"; frozen regex `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:65`; tested at kake pin `0440485`: `:67` no-match; `:354-357,360-361,363` no-match but `:358,:359,:362` match (`:362` names tabi → excluded) |
| U20 | "**Q5 — distinct from the existing kake rows, or a cosmetic rename? defect (severity: low)** … the new row restates the *same* split edge" — `.ufo/waves/round-33/w2/CritRowRobots.md:94-96` | **yes** | **correction-drafted** (one granularity rule + the `:6` reattribution it implies); **conflicts with CritScreenCrawlerSplit** — see §Conflicts | surfaces `corpus/adjacency.tsv:6` (crawler) and `:13` (robots) both exist; ledger `:6` kake:22→crawler, `:12-13` kake:322/323→robots, `:14` kake:338→crawler; no rule sentence (`who drives browsers` → 0) |
| U21 | "**m1b / m10 — quote truncation that stays a substring survives both instruments.** The gate checks `line.text.includes(quote)` (scripts/check-adjacency.mjs:729-731) and the counter checks `c.text.includes(quote)` for screens (counter:202)" — `.ufo/waves/round-33/w2/MutC1Rows.md:60` | **yes**, and live in round-35's frozen counter | **routed** → round-36 C1 counter amendment (`quote-partial` on token boundaries); the r35 counter cannot be edited after seats score | gate `scripts/check-adjacency.mjs:728-729`; r33 counter `:202`; **r35 v3 counter `:242`** (`c.text.includes(quote)`), `goodQuote` `:131` |
| U22 | "**`S-KILL 2` — R4 is existential, the pin is not. Limit, low, `scripts/check-bidi-runtime.mjs:298` and `:816-824`.**" — `.ufo/waves/round-33/w2/CritMutC1Survivors.md:101-102` | **yes** | **routed** → C2 gate amendment (position-bounded capture); gate digest `370e8e95…` pinned by C2, not editable this round | `scripts/check-bidi-runtime.mjs:295-298` (`shots.some` on the viewport size), `:825` (t3-binding compares first shots only); round-35 counter imports `PREDICATES` unchanged (`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:21-24`) |
| U23 | "**`S-KILL 1` — near-copy gate as driver. Defect, low (wording gap), `scripts/check-bidi-runtime.mjs:774` (exact-byte comparison) vs `SKILL.md` round-33 row "a driver that is the gate or imports it beyond the allow-list".**" — `.ufo/waves/round-33/w2/CritMutC1Survivors.md:89-91` | **yes** (line moved 774→778) | **correction-drafted** (SKILL row wording → "byte copy") **+ routed** (normalised digest) with U22/U28 | `scripts/check-bidi-runtime.mjs:778` `sha256(drv) === sha256(gateBuf)`; `SKILL.md:2907` still "a driver that is the gate"; header `:58` already says "its bytes" |
| U24 | "**M03** — `MEASURED` is case-insensitive (:149 `/i`) but admission requires lowercase `verdict === "yes"` (:856); an all-uppercase `YES` entry parses as measured, admits nothing, and yields no row finding." — `.ufo/waves/round-33/w2/MutGateV2.md:63` | **yes** (cited `:856` moved to `:860`); its *description* is refuted by round 34's case, not by the code | **fixed-by `04f9623d`** (case pins exit 0 / admitted 2 on a capitalised cell) **+ correction-drafted** for the stale sentence | gate `:149`, `:373`, `:860`; case `v3-a-m03-measured-cell-uppercase` at `scripts/check-bidi-runtime.mjs:1031` (`exit: 0, admitted: 2`, `cell: "Yes"`), added by `04f9623d`; mutant `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:72-76` drops `.toLowerCase()` and fails that case |
| U25 | "**F3 (low) — the carry condition is unobservable by the gate it defers to** … Because `f6` compares a name string, any seat can satisfy it alone" — `.ufo/waves/round-33/w2/CritS125Cadence.md:92-95` | **yes** (check now `g7` in `check-frontier-admission.mjs`) | **routed** → frontier-admission gate amendment (compare the refetch seat with the entry author in one commit, or declare the condition human-read) | `scripts/check-frontier-admission.mjs:46-47`, `:213-219` (`rf.seat !== rc.fetched_by`); carry text `corpus/lessons/round-33.md:148-151`; round-34 closure routed defect 5 keeps the item open |
| U26 | "**F4 (low) — two justifications for one value in one section, and the growing divergence is not counted**" (S127–S129 by gate population; S125 by immutability; no rule for the next tag-pinned row) — `.ufo/waves/round-33/w2/CritS125Cadence.md:100-104` | **yes** (the finding's 30/3 snapshot is historical; the freeze reads 90/26) | **correction-drafted** (one rule sentence + the two counts) | `corpus/lessons/round-33.md:26-27` and `:144-147` unchanged; `tag-pinned` appears nowhere in the lesson (0); freeze counts: 90 registry rows carrying `on-release`, 26 carrying `90d` |
| U27 | "CritC2Counter D6 — medium/low — two exit-2 paths (symlink TMPDIR; entry-shape regression → could-not-evaluate) \| not addressed (latent)" — `.ufo/waves/round-33/w2/ConnW2.md:86` (source: `.ufo/waves/round-33/w1/CritC2Counter.md:73-75`) | **yes** in the round-33/34 C2 counters; **does not extend** to round-35's counter (no clone path) | **routed** → C2 counter amendment (round-34 closure defect 3, *not claimed* this round) | `c2-bidi-forgery-battery.mjs:118` (`entry table header not found`) and `:140` (`clone toplevel mismatch`) both `throw new Refusal` → exit 2; `symlink` appears in no case (0); `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:215` repeats the comparison; `grep -c 'toplevel\|realpath' c2-firefox-bidi.mjs` → 0 |
| U28 | "**L3 — the header claims exit 2 on "lessons absent"; the code cannot produce it.** `v2.mjs:8`: "2 could-not-evaluate (usage, unresolvable revision, registry or lessons absent, …)". `gateRows` (`v2.mjs:511-517`) returns an empty map when `git ls-tree` fails" — `.ufo/waves/round-33/w2/RevGateV2Code.md:15` | **yes** | **correction-drafted** (drop "lessons absent" from the header); landing held to the next gate amendment because C2 pins the gate digest | `scripts/check-bidi-runtime.mjs:8` unchanged; `gateRows` `:511-517`, `return map` at `:514`; `SKILL.md:2907`'s two-class list already omits it |

No finding in U15–U28 is **rejected**: each named byte still reads as the seat reported it.

## Drafted corrections (append-only text; each names its stale line)

**U15 — `corpus/QUALITY.md:545-546`.**
> Correction to criterion 88 (headline, `corpus/QUALITY.md:545-546`): "its two quotes name each other's lane"
> overstates the rule. The round-33 instruments require one direction per disposition — `split-declared` /
> `refused-route` need `tabi` in the `sibling_quote` **or** the sibling lane token in the `tabi_quote`
> (`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:220-227`); `ruled` / `contested-open` need the tabi-side
> line to name the sibling (`scripts/check-adjacency.mjs:84-87`). Read the headline as "carries the other lane's
> token in the direction its disposition requires". The round-35 C1 rule is a third form and names no lane at all:
> a split row's sibling quote must carry browser ground and a side-stating word
> (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:50-55`). `corpus/adjacency.tsv:14` satisfies one
> direction (tabi quote names kake), `:15` satisfies both; a criterion-88 reader applying "each other" calls row 14
> a defect while `check-adjacency` reports it clean.

**U16 — `corpus/QUALITY.md:567`.**
> Correction to criterion 89's source pointer (`corpus/QUALITY.md:567`): "corpus/lessons/round-33.md §Gate" lands on
> the S127–S129 admissions section (`round-33.md:24-92`), which carries no battery, `forgeriesAccepted` or whitelist
> content (0 matching lines); the three-population rule and its controls are lesson M1 (`round-33.md:173-189`, 5
> matching lines). The pointer reads §Mistakes M1.

**U17 — `corpus/QUALITY.md:574-576`.**
> Correction to criterion 90's parenthetical (`corpus/QUALITY.md:574-576`): "a driver re-exporting the gate" is
> round 32's v1 driver component counted a second time, and v4 is missing. The four constructions, by commit id as
> `SCORECARD.md:1793-1796` states them: two `goldenLines` synthetic transcripts plus one real CDP screenshot with a
> two-line re-export as the driver (`b858b5d`); one row id listed sixteen times (`e666174`); one real run's
> transcript path cited twice (`7912a62`); two byte-identical copies of one run (`cee9539`).

**U18 — `corpus/adjacency-screen.tsv:21` and `:29`.**
> Correction to the screen ledger, naming the stale cells (`corpus/adjacency-screen.tsv:21`, `:29`; the seats'
> locators `:20` and "row 28" are data-row indices): kake `PROVINCE.md:358` is screened on
> `crawler-discipline-vs-publishing` although its subject is canonical selection, whose owning kake row is
> `js-rendering-browser-execution` (`corpus/adjacency.tsv:12`) — whose ruling_quote reads "canonical declaration and
> selection stay kake's", which is why the seat named it; kake
> `PROVINCE.md:377` (a `User-agent:`/wildcard robots sentence) is screened on `crawler-discipline-vs-publishing`
> although `robots-txt-publisher-audit-vs-client-obedience` (`corpus/adjacency.tsv:13`, sibling_ref kake
> `PROVINCE.md:304`) owns it. Relabel both `surface` cells; no counter clause changes, because both counters check
> only that the surface names a verified row of the same sibling.

**U19 — `corpus/README.md:766`.**
> Correction to `corpus/README.md:766`, naming the stale sentence: "Every browser-domain line of the twenty sibling
> `PROVINCE.md` files at frozen pins" is not what was swept; the population was the frozen regex
> (`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:65`) minus tabi-naming lines. Read it as "every line of the
> twenty sibling `PROVINCE.md` files at frozen pins that matches the frozen browser-word regex". Carried limit: kake
> `PROVINCE.md:67`, `:354-357`, `:360-361`, `:363` are browser-domain prose that matches no regex token and is in
> neither ledger. Precision: the finding's range `:354-363` is not all out-of-population — `:358` and `:359` match
> and are screened (ledger lines 21-22), and `:362` matches but names tabi, so the not-tabi clause excluded it.

**U20 — one granularity rule; conflicts with CritScreenCrawlerSplit (see §Conflicts).**
> Granularity rule (append to lesson round-35 §Errata intake, naming round-33 `CritRowRobots` Q5 at
> `.ufo/waves/round-33/w2/CritRowRobots.md:94`): a kake line about a robots/sitemap artifact is owned by
> `robots-txt-publisher-audit-vs-client-obedience` when its subject is the publisher's `robots.txt`/sitemap content
> or its `User-agent:` semantics, and by `crawler-discipline-vs-publishing` when its subject is who drives a browser
> versus who publishes. The discriminator is the artifact pair: robots carries kake's offline auditor contract and
> tabi's D1–D5 stop predicate; crawler carries the driving/publishing split. Under this rule
> `corpus/adjacency-screen.tsv:6` (kake:22, "robots.txt, sitemap scope") moves to the robots surface and `:14`
> (kake:338) stays. Counter impact: none.

**U26 — one rule sentence.**
> Recheck rule (append to lesson round-35 §Errata intake, naming `corpus/lessons/round-33.md:26-27` and `:144-147`,
> which each justify a subset of the `90d` rows and state no count): `on-release` is the default recheck for a
> tag-pinned SOURCES row; leaving it for `90d` requires a named reopen condition, and the round reports the two
> counts. At the round-35 freeze `corpus/SOURCES.md` carries 90 registry rows whose row contains `on-release` and 26
> whose row contains `90d` (row-level `grep` count, not the finding's narrower "tag-pinned" metric).

**U28 — one header word (landing held).**
> Correction to `scripts/check-bidi-runtime.mjs:8`, naming the stale header line: drop "lessons absent" from the
> exit-2 list. The gate cannot produce exit 2 for a missing lessons file: `gateRows` returns an empty map at `:514`
> and the absence surfaces as `s1-source-row` → exit 1. `SKILL.md:2907`'s two-class list already omits it.

**U23 — SKILL row wording.**
> Correction to `SKILL.md:2907`, naming the stale cell: "a driver that is the gate or imports it beyond the
> allow-list" should read "a byte copy of this gate (path or bytes — comments included) or a driver whose imports go
> beyond the allow-list". `scripts/check-bidi-runtime.mjs:778` compares exact bytes and its header `:58` already
> says "its bytes"; the near-copy (the gate plus one appended comment) is admitted, and the entry's Limits should
> say so.

**U24 — stale sentence, with the fix already landed in the instrument.**
> Correction naming `.ufo/waves/round-33/w2/MutGateV2.md:63`: its M03 text says an all-uppercase `YES` entry
> "admits nothing". The code lower-cases the verdict (`scripts/check-bidi-runtime.mjs:373`) and admits on
> `row.verdict === "yes"` (`:860`), and round 34 (`04f9623d`) pinned the true behaviour with case
> `v3-a-m03-measured-cell-uppercase` (`:1031`: exit 0, admitted 2 on a capitalised Measured cell); mutant M03
> (`.ufo/waves/round-34/counters/c2-gate-mutants.mjs:72-76`, dropping `.toLowerCase()`) fails that case.

## Routed items (target + reason)

| U-id | routed to | reason |
|---|---|---|
| U21 | round-36 C1 counter amendment: a `quote-partial` / token-boundary rule for prose quotes | The round-35 counter is frozen before data (`claims.json` `frozenDigests` `c1-adjacency-sweep-v3.mjs` = `5707a937…`) and *inherits* substring matching at `:242`. Changing a counter after seats score is barred by the round's own rule ("a rule changed after any seat has scored is not the claim's rule", round-34 lesson §Wave-1 attacks, prompt §6 item 9). Red state: `MutC1Rows` m1b/m10; green control: the untouched quotes. |
| U22 | the next C2 gate amendment: make R4 position-bounded (the first `captureScreenshot` after `setViewport`, or every post-viewport capture 640×480) | `scripts/check-bidi-runtime.mjs` is pinned by C2's digest `370e8e95…` ("must stay unchanged", `claims.json`), and round-35's counter imports `PREDICATES` unchanged by design. Red state: the V7 hybrid (V4's 100×100 first capture plus one appended 640×480 capture, gate exit 0). |
| U23 (instrument half) | same gate amendment as U22/U28: a normalised digest (comments/whitespace stripped) for the driver-vs-gate comparison | Exact-byte comparison at `:778` is the gate's shipped rule; normalising it changes what the gate admits, so it belongs with the same amendment that lands U22/U28. |
| U25 | the frontier-admission gate amendment (`scripts/check-frontier-admission.mjs`): `g7` shall compare the refetch `seat` with the author of the entry in the same commit, or the lesson shall declare the carry condition human-read | The check is two typed names in one commit (`:213-219`) and one process wrote both in round 33 (CritS125Cadence F3). Round 35 does not touch this gate; the S125 carry is round-34 closure routed defect 5, still open. |
| U27 | the C2 counter amendment named as round-34 closure routed defect 3 (explicitly **not claimed** this round, `claims.json` `priorClosure`): `realpath` the clone before the toplevel comparison, and turn entry-shape drift into a named finding (exit 1) or add one CASE per path | Both paths are `throw new Refusal` (`c2-bidi-forgery-battery.mjs:118`, `:140`), no case reaches them (`symlink` → 0 in that file), and `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:215` repeats the unresolved comparison. Round-35's counter takes `--repo` and has no clone path (`grep -c 'toplevel\|realpath'` → 0), so the class does not extend to this round's instrument. |
| U28 (landing half) | same gate amendment as U22/U23 (one header word) | The gate digest is pinned by C2 for this round; the text edit cannot land without failing `GATE_SHA256`. |

## Conflicts reported verbatim (not resolved here)

U20's drafted rule implies `corpus/adjacency-screen.tsv:6` (kake `PROVINCE.md:22`) moves to
`robots-txt-publisher-audit-vs-client-obedience`. `.ufo/waves/round-33/w2/CritScreenCrawlerSplit.md:133-134` says
the opposite of the neighbouring row and preserves row 6: "Row 6 (`:22`, robots inside a three-signal
parenthetical) is a legitimate umbrella use of the same label." Both seats are round-33 wave-2 critics; round 34
dispositioned neither cell. The L1 (or the canonical Rust judge) must pick, and whichever it picks the rule
sentence must be written so the other cell is the one that moves.

## Evidence (commands, exit codes, file:line)

All commands run read-only in the freeze clone; full output in `holds-receipt.txt` (36 `HOLDS`, 0 `BROKEN`).

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" -q
$ git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
$ git -C "$S/clone" rev-parse HEAD
a4bfef0f75027c915e715649950b1d46dcb33d83                                    exit 0
$ bash verify-holds.sh "$S/clone" > holds-receipt.txt 2>&1
script exit=0; 36 HOLDS; 0 BROKEN
```

Freeze scope (`git show --name-only a4bfef0`): `.ufo/waves/round-35/**` (baseline JSON/provenance/stderr,
`c1-candidates.tsv` 383 lines, `c1-pins.json`, both counters, `controls.mjs`, `measure.sh`) plus two append-only
registry blocks — `LOG.md` +13 and `SCORECARD.md` +36. No `corpus/QUALITY.md`, `corpus/README.md`, `scripts/*`,
`SKILL.md`, `corpus/lessons/*`, `corpus/SOURCES.md` or `corpus/adjacency-screen.tsv` byte changed, and
`corpus/adjacency-screen-browser.tsv` does not exist at the freeze (it is a round-35 deliverable). The added
SCORECARD block states the pin my routes rely on: "`scripts/check-adjacency.mjs` and
`scripts/check-bidi-runtime.mjs` are pinned inside the counters and must not move." `2d2c8a7` (round-34 closure)
touches only `corpus/lessons/round-34-verifier-spotcheck.md` (+187).

No-fix check (`git log --oneline -S"<string>" --all -- <files>`), each returning only the introducing commit:

| string | commit that last touched it |
|---|---|
| `name each other's lane` (QUALITY 88) | `bf48b81` (round 33 w1 integration) |
| `Every browser-domain line` (README:766) | `bf48b81` |
| `registry or lessons absent` (gate header) | `bf48b81` |
| `driver is a byte copy of this gate` | `bf48b81` |
| `shots.some` (R4) | `2f8535c` (round 32 freeze) |
| `v3-a-m03-measured-cell-uppercase` (U24 fix) | `04f9623` (round 34 w1 integration) |

Per-item byte reads (all exit 0 unless stated; the receipt prints `got/want/grep_exit` per line):

- U15 `corpus/QUALITY.md:545` = 1 hit for `name each other's lane`; `c1-adjacency-sweep.mjs:218-227` = 1 hit
  for the one-directional naming clause; `awk -F'\t' 'NR==14||NR==15' corpus/adjacency.tsv` →
  `14: sib_has_tabi=0 tabi_has_kake=1`, `15: sib_has_tabi=1 tabi_has_kake=1`.
- U16 `corpus/QUALITY.md:567` = 1 hit for `round-33.md §Gate`; battery terms `sed -n '24,92p' lessons` → 0,
  `sed -n '173,189p'` → 5.
- U17 `corpus/QUALITY.md:574-576` = 1 hit for `a driver re-exporting the gate`, 0 for `byte-identical`;
  `SCORECARD.md:1790-1798` = 1 hit for `two byte-identical copies` (with `cee9539`; `b858b5d`, `e666174`,
  `7912a62` on the surrounding lines).
- U18 `sed -n '21p;29p' corpus/adjacency-screen.tsv` → both `crawler-discipline-vs-publishing`;
  `grep -n '^robots-txt-publisher-audit-vs-client-obedience' corpus/adjacency.tsv` → `13:`, sibling_ref kake
  `PROVINCE.md:304`; `^js-rendering-browser-execution` → `12:`.
- U19 `corpus/README.md:766` = 1 hit for `Every browser-domain line`; regex test over kake pin `0440485`
  `PROVINCE.md`: no-match lines `67,354,355,356,357,360,361,363`; `:67` starts "The publisher-side canonical tool
  now consumes saved GET-res".
- U20 `corpus/adjacency.tsv` surfaces include both `crawler-discipline-vs-publishing` (`:6`) and
  `robots-txt-publisher-audit-vs-client-obedience` (`:13`); ledger `:6`/`:12-13`/`:14` read crawler/robots/crawler;
  `who drives browsers` → 0 in `corpus/lessons/round-34.md`.
- U21 `scripts/check-adjacency.mjs:728-729` (`quoteLengthProblems`, `includes(quote)`);
  `c1-adjacency-sweep.mjs:202`; **`c1-adjacency-sweep-v3.mjs:242`**; `goodQuote` `:131`
  (`>= 4`, `<= 25` words, `>= 20` non-space).
- U22 `scripts/check-bidi-runtime.mjs:298` (`shots.some`), `:825` (`new Set(shots).size !== 1`).
- U23 `scripts/check-bidi-runtime.mjs:778` exact-byte comparison (the seat's `774` moved); `SKILL.md:2907`
  "a driver that is the gate".
- U24 `MutGateV2.md:63` = 1 hit for `admits nothing`; gate `:149`, `:373` (`toLowerCase`), `:860`
  (`row.verdict === "yes"`), `:1031` (case, `exit: 0, admitted: 2`).
- U25 `check-frontier-admission.mjs:213-219` = 1 hit for `rf.seat !== rc.fetched_by`;
  `lessons/round-33.md:148-152` = 1 hit for `until a second seat fetches`.
- U26 `lessons/round-33.md:26-27` = 1 hit for `not .on-release.`; `:144-147` = 1 hit for `immutable`;
  `tag-pinned` → 0 in that lesson; freeze row counts 90 / 26.
- U27 `c2-bidi-forgery-battery.mjs:118` (`entry table header not found`) and `:140` (`toplevel mismatch`) = 1
  each; `symlink` → 0; `c2-gate-mutants.mjs:215` = 1; round-35 counter has 0 `toplevel|realpath`.
- U28 `scripts/check-bidi-runtime.mjs:8` = 1 hit for `registry or lessons absent`; `:514` `return map`;
  `SKILL.md:2907` exit-2 list = "usage, unresolvable revision, registry absent, `--live` without chromedriver or
  chromium, sandbox unavailable, no short socket directory" (no "lessons absent").

Tooling installed this round: none (no `pacman`, `uv tool`, `npx` or binary install; all reads used the host's
existing `git`, `grep`, `sed`, `awk` and `node`).
