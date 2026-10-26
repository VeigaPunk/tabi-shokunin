# CritRowA11y — attack on map row `accessibility-browser-at-execution` (row 14)

Revision attacked: lane `042d6d9abf97d567d495652a85eabc851b81adc1`; sibling pin `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350`; baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd`.

## Verdict

**defect — severity MEDIUM, confined to the tabi-side surface; the disposition form and every mechanical gate HOLD.** The row is a real kake→tabi handoff (kake's own `SKILL.md:559-560` at the pin hands "authorized browser/AT evaluation" to tabi and `PROVINCE.md:79-80` defers it as "separately authorized adjacent work"), `split-declared` is the right disposition (refused-route would be false — tabi accepts, and contested-open has no `tabi | round-<N> |` L0 basis), and all three quotes are byte-verbatim on their cited lines, the candidate line is covered exactly, and the surface is not a cosmetic rename of `crawler-discipline-vs-publishing` or the musketeer lease. The defect is that the surface's *assistive-technology execution* component is not held by tabi: tabi's province enumeration does not list it (`PROVINCE.md:6-13`; zero accessibility/A11y/AT hits anywhere in `PROVINCE.md`) and **both notes the lesson's C1 table cites as this row's tabi evidence explicitly disclaim exactly that component** — `corpus/knowledge/aria-loopback-round-13.md:45` ("It is not an accessibility audit, keyboard/screen-reader test, WCAG certificate…") and `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:83` ("role locators do not replace accessibility audits and conformance tests … The pages do not establish keyboard operability, focus order, screen-reader output, contrast, timing, or WCAG conformance"). Two smaller fixable gaps ride along: the declaration drops kake's "process scope" half of the authorization condition (LOW), and the row's three quotes never cite the kake naming line `SKILL.md:559-560`, so the split cannot be verified from the row itself (LOW). Fix by narrowing the surface to held ground and carrying the kake naming text in the row; do not screen the line and do not change the disposition.

## Question verdicts

**1. Is it a REAL overlap between a kake surface and a surface tabi actually holds? — holds on direction, DEFECT on held-surface (MEDIUM).**
- Direction is real and kake-initiated. `kake-shokunin@04404859…:PROVINCE.md:79-80`: "No actual website accessibility is evaluated. Browser/assistive-technology / execution stays separately authorized adjacent work; publishing stays with / the operator." `kake-shokunin@04404859…:SKILL.md:559-560`: "The operator authorizes a named property/build/process scope; tabi receives / authorized browser/AT evaluation, kagi owns any credential custody". kake names tabi as the receiver; screening this line would violate "never screen a real overlap".
- Held-surface fails on the AT component:
  - `PROVINCE.md:6-13` enumerates the owned surfaces (webbridge docs, browser inventory/profile shape census, CDP session discipline, interaction records, dynamic-page evidence patterns). None is accessibility/AT. `grep -n -i -E "accessib|a11y|assistive|screen.?reader|wcag|axe-core|aria" PROVINCE.md` → exit 1, no output.
  - What tabi actually holds is accessible-**tree/role-locator** craft, proven only as structural selection: `corpus/evidence/round-13/aria/receipt.json` summary `cases 8/8 passed`, ids `role-name, label-fill, duplicate-strict, re-resolve, panel-before-after, contain-default, equal-explicit, checked-wrong-state` — no keyboard, no AT, no conformance.
  - `corpus/knowledge/aria-loopback-round-13.md:45`: "It is not an accessibility audit, keyboard/screen-reader test, WCAG certificate, screenshot/pixel comparison, real-site journey, cross-browser comparison or determinism result."
  - `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:83` ("Not a full accessibility audit"): "…do not establish keyboard operability, focus order, screen-reader output, contrast, timing, or WCAG conformance."
  - These two notes are the exact pair the round-33 lesson cites as this row's tabi evidence (`corpus/lessons/round-33.md:106`, third column). The evidence cell therefore argues against the surface it is cited to support.
- Consequence, and why this is not cosmetic: strip the disclaimed AT clause and the row's tabi side reduces to "browser execution is tabi's", which is already mapped at the *same pin* by row 12 `js-rendering-browser-execution` (`PROVINCE.md:61`, `SKILL.md:2887`). The row's distinctness from row 12 rests entirely on the component tabi's own corpus denies. (Rows 13 and 15, by contrast, cite tabi evidence that is genuinely held: D1–D5 `rate-signal-decision-table.md:49-53`, D1–D13, `live-dynamic-capture.md`.)

**2. Is `split-declared` right? — holds.**
- Both sides declare: kake `SKILL.md:559-560` (names tabi) and `PROVINCE.md:79-80` (authorization stays with the operator); tabi `SKILL.md:2889`.
- `refused-route` would be false: tabi accepts and routes in; contrast row 2 `reverse-engineering-of-shipped-artifacts`, where tabi refuses ("**Refuses:** reverse engineering as forensics (→ revenger/kaidoku)").
- `contested-open` has no basis. The only accessibility-adjacent fleet L0 line is `.ufo/l0-questions.md:81`, which is a `kake | round-25 |` **policy-stop** row ("Policy-stop disposition remains open from round24…; Round25 instead prepares a distinct benign WCAG publisher-review packet…"), not a `tabi | round-<N> |` row naming kake — the gate's `l0_line_absent` rule would reject it — and it concerns the round-24 policy stop, not ownership of AT execution.

**3. Is the tabi-side declaration (`SKILL.md:2889`) truthful about tabi's corpus and free of absorbing kake ground? — no absorption (holds); untruthful on one clause (defect, LOW).**
- No absorption. The line keeps kake's own term and ground: "the publisher-side WCAG review preparation stays kake's (kake `SKILL.md:559-560`, `PROVINCE.md:79-80`)" — matching kake `PROVINCE.md:76-78` ("publisher-side review preparation: sourced criterion cards and an offline inventory gate … preparation only into held ground, not WCAG conformance") and kake's "every JSON result keeps websiteConformance=not-assessed" (`kake SKILL.md:556`). Nothing of kake's inventory gate, cards, or conformance judgement is claimed.
- Truthfulness gap: "browser and assistive-technology execution … is tabi's" states as held what question 1 shows tabi disclaims. A route declaration would be defensible; a bare "is tabi's" over the word "assistive-technology" is not.
- Authorization clause: kake conditions on "a named property/build/**process scope**" (`SKILL.md:559`); tabi's line conditions only on "loopback or operator-authorized **properties**" (`SKILL.md:2889`), silently dropping the process/build half.

**4. Do both quotes sit verbatim on the cited lines? — holds (all three fields, byte-checked).**
- `sibling_quote` = `No actual website accessibility is evaluated. Browser/assistive-technology` — verbatim on `kake PROVINCE.md:79` at `04404859…` (`git -C kake-shokunin cat-file blob 04404859…:PROVINCE.md | sed -n '79p'`), 7 words, 68 non-space chars, inside 4..25/≥20.
- `tabi_quote` = `browser and assistive-technology execution for kake's accessibility review is tabi's` — verbatim on `SKILL.md:2889` at `042d6d9…`, 10 words, 75 non-space chars. It also names the other side ("kake's"), so the C1 naming requirement is met.
- `ruling_quote` (split rows must be verbatim in the tabi file) = `the publisher-side WCAG review preparation stays kake's` — verbatim on the same line, 7 words.
- Coverage/exclusivity: the candidate entry `kake-shokunin@04404859…:PROVINCE.md:79\tNo actual website accessibility is evaluated. Browser/assistive-technology` is byte-equal to `sibling_quote` at the same pin; no screen row touches kake:79 (`corpus/adjacency-screen.tsv` 43 rows, zero hits for `PROVINCE.md:79` or `accessib`); no other row reuses the pin `kake-shokunin@04404859…:PROVINCE.md:79`; no `duplicate_row`, `quote_too_long`/`quote_too_short`, control-char or charset finding.
- Note on quote shape (not a gate failure): the quoted sibling text stops at the line break, i.e. before the predicate on line 80 ("execution stays separately authorized adjacent work"), and the tabi quote stops before the boundary clause on its own line. The boundary survives only in `ruling_quote`; the kake naming line `SKILL.md:559-560` appears only in the *unquoted* tail of `SKILL.md:2889`, so no field of the row carries it.

**5. Is the surface distinct from the existing kake rows, or a cosmetic rename? — holds against the two named rows; conditional against same-pin row 12.**
- Against `crawler-discipline-vs-publishing` (`kake PROVINCE.md:30`, client-side crawler discipline) and `musketeer-cdp-9222-profile-lease` (`PROVINCE.md:35`, Chrome profile lease): different kake line, different pin, different object (WCAG review execution vs crawler discipline vs a profile lease). Not a rename.
- Against row 12 `js-rendering-browser-execution` (same pin, `PROVINCE.md:61`): the objects differ (crawler-render evidence vs accessibility review), but the tabi surface differs only by the disclaimed AT component — see question 1. This is what makes the MEDIUM finding material rather than cosmetic.

## Gate weakness exposed (context for the L1, not part of the row verdict)

`scripts/check-adjacency.mjs` header (lines ~89-92) commits the split-row refinement as *"there is no third file to pin, so the committed refinement of 'both quotes state the split' is exact verbatim existence"*. A disclaimer line plus a truncated claim therefore passes: this row is `verified` in `rows=14 verified=14` while its sibling quote states no split and names no lane. The gate cannot see that the naming line (`kake SKILL.md:559-560`) is cited nowhere in the row.

## Commands and exit codes

All lane scripts were run inside the scratch clone at `042d6d9…`, never in the lane checkout.

```
$ cd /fast/scratch/hyaku/tabi-r33/CritRowA11y && git clone -q --shared …/tabi-shokunin "$S/clone" \
  && git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1 \
  && git -C "$S/clone" rev-parse HEAD && git -C "$S/clone" rev-parse --show-toplevel
042d6d9abf97d567d495652a85eabc851b81adc1
/fast/scratch/hyaku/tabi-r33/CritRowA11y/clone                                         exit 0

$ node scripts/check-adjacency.mjs --at 042d6d9abf97d567d495652a85eabc851b81adc1 \
    --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
{"schema":"tabi-adjacency-check-v1","mode":"check",…,"verdict":"clean","rows":14,"verified":14,"selfRulings":[2],…}
                                                                                        exit 0

$ node scripts/check-adjacency.mjs --at 042d6d9… --repo "$S/clone" --fleet …/shokunin
ADJACENCY verdict=clean rows=14 verified=14                                             exit 0

$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 042d6d9… --repo "$S/clone" \
    --fleet /home/vgpnk/Projects/shokunin --json      (TMPDIR=$S/tmp)
{"…","candidates":52,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
 "newMappedRows":[…,{"row":14,"surface":"accessibility-browser-at-execution","sibling":"kake","disposition":"split-declared"},…]}
                                                                                        exit 0

$ git -C ../kake-shokunin merge-base --is-ancestor 04404859… refs/heads/master && echo ANCESTOR_OK
ANCESTOR_OK                                                                            exit 0

$ grep -n -i -E "accessib|a11y|assistive|screen.?reader|wcag|axe-core|aria" tabi PROVINCE.md
(no output)                                                                            exit 1
$ grep -n -i -E "accessib|a11y|assistive|wcag" ../.ufo/l0-questions.md
81:kake | round-25 | Policy-stop disposition remains open from round24: …              exit 0

$ python3 (verbatim/coverage script over clone + kake pin)  → receipts/verify-quotes.txt exit 0
```

Verbatim/coverage facts (from `verify-quotes.txt`, byte-checked in the clone and at the kake pin): cols 9; `tabi_quote` verbatim@2889 True (10 words / 75); `ruling_quote` verbatim@2889 True (7 / 49); `sibling_quote` verbatim@kake:79 True (7 / 68); candidate exact-equal True; screen hits for kake:79: none; rows at pin `04404859…`: 12 (`PROVINCE.md:61`), 13 (`:304`), 14 (`:79`), 15 (`:347`).

## Smallest safe correction

1. `corpus/adjacency.tsv` row 14 — replace `tabi_quote` (col 6) with the 22-word tail of the same line, which is verbatim on `SKILL.md:2889`, stays ≤ 25 words, and makes the row itself carry the kake naming line and the boundary:
   `execution for kake's accessibility review is tabi's, loopback or operator-authorized properties only; the publisher-side WCAG review preparation stays kake's (kake \`SKILL.md:559-560\`, \`PROVINCE.md:79-80\`).`
   (verified substring: True; 22 words / 184 non-space chars.) Keep `sibling_ref`, `sibling_quote`, `disposition`, `ruling_ref`.
2. `SKILL.md:2889` — narrow the claim to held ground and keep the route conditional on operator authorization of the *process*, e.g. reduce "browser and assistive-technology execution … is tabi's" to browser execution plus accessibility-tree evidence, with AT/keyboard evaluation admitted only "under an operator-authorized named property/build/process scope" (drops the dropped `process scope` half of kake `SKILL.md:559`); cite `corpus/knowledge/aria-loopback-round-13.md:45` as the limit so the line cannot be read as an executed AT capability.
3. `corpus/lessons/round-33.md:106` — the "tabi evidence" cell must not present the two notes as support for AT execution; point it at the notes' limit lines (`aria-loopback-round-13.md:45`, `playwright-accessible-locators-and-snapshots.md:83`) as the boundary, or name the round-13 receipt's structural-selection scope.
4. Do **not** screen kake:79 and do **not** change the disposition: kake `SKILL.md:559-560` names tabi as receiver, and `split-declared` is the only disposition the evidence supports.

## Housekeeping

- Scratch `$HYAKU_SCRATCH/tabi-r33/CritRowA11y` (202 MB) deleted after receipts were copied; nothing left on disk. No lane, fleet, sibling or `~/.local/bin` file written; lane repo read-only (`git cat-file`, `merge-base`); commits only inside the scratch clone (none made). No browser started; `pgrep -fa 'chromedriver|chromium'` showed no process owned by this seat (only an unrelated `earlyoom` daemon line and another seat's `curl`). No tool installed or upgraded. No network fetch performed.

## Deliverables

- `.ufo/waves/round-33/w2/CritRowA11y.md` (this report)
- `.ufo/waves/round-33/w2/CritRowA11y/adj.txt` — `ADJACENCY verdict=clean rows=14 verified=14`
- `.ufo/waves/round-33/w2/CritRowA11y/adj.json` — full checker object at `042d6d9…`
- `.ufo/waves/round-33/w2/CritRowA11y/c1.json` — C1 counter: candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4 (row 14 included)
- `.ufo/waves/round-33/w2/CritRowA11y/verify-quotes.txt` — byte verification of all three quote fields and candidate coverage
- `.ufo/waves/round-33/w2/CritRowA11y/adjacency.tsv.at-042d6d9` — map bytes at the attacked revision (14 rows)
