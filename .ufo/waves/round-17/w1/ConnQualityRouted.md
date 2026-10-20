VERDICT: ISSUES

# ConnQualityRouted — round-16 routed defects mapped to QUALITY 1–25 / DraftQuality 26–29

Read-only connector seat. Lane `tabi-shokunin` at `5859243` (HEAD detached); `corpus/QUALITY.md`
ends at 25 (`:97-101`) and is append-only (`scripts/check-round-contract.mjs:25`). DraftQuality's
`.ufo/waves/round-17/drafts/quality.md` already proposes 26–29; this report cross-checks those four
against **every** spot-check item (`corpus/lessons/round-16-verifier-spotcheck.md:146-157`, i.e.
:148/:149/:150/:151/:152/:153/:154-157) and the `:76` disagreement, and finds three uncovered items
and one drafted criterion that cannot be satisfied. No lane file was written.

Axes (godspeed): **calibration** (QUALITY is the calibration surface — spot-check `:131`),
**operability** (is each predicate gate-checkable?), **adjacency** (proposed 32 is the C3 admission
rule). Coverage axis untouched; nothing here lowers a scalar.

## Ledger — one row per item

| # | Item (spot-check line) | Existing 1–25 | Draft 26–29 | Verdict |
|---|---|---|---|---|
| 1 | unrooted liar probe `:148` | 17 (case-input manifest, browser-scoped), 25 (probes exist and differ), 2 (anchor) — none requires the probe's *inputs* to be committed | 28 (pointer resolves) | **closed by 28** |
| 2 | pre-hardening gate receipts `:149` | 22 (count-scoped digest), 20 (correction-scoped), 18 (runtime metadata) — none binds a receipt's *producer* to the registered blob | none | **GAP → 30** |
| 3 | delivered-HEAD claim without receipt `:150` | 22 second sentence is already the substantive predicate | 26 (receipt or drift-diff) | **closed by 22 + 26** |
| 4 | census U3 has no supersession pointer `:151` | 4, 11, 24 hold in letter (erratum appended, index row exists, row carries an unchecked label); 28 inapplicable — a label is not a pointer | none | **GAP → 31** |
| 5 | integrator ruling unrecorded `:152` | none (9 is seat-alias routing, not scope) | none | **GAP → 32** |
| 6 | frozen step-1/step-4 closure checker `:153` | 10 is the only admission-coupled analogue; the checker is outside the lane | none | **refuse a criterion** (R6) |
| 7 | inherited debt `:154-157` | 1/3 separate observation/inference/unknown; each limit is already disclosed | none | **refuse a criterion** (R7) |
| D | `:76` "unforgeable" | 1 (falsifiable) and 25 (probes) are partial; neither bounds a quantifier | 27 (finite shape list) | **closed by 27** + provenance caveat D2 |

## Gaps — exact text (append after DraftQuality 29)

**30 (routed 2).**
```
30. A committed receipt records the producer it ran — path and sha256 of the gate, selftest,
    harness or counter — and a claim cites that receipt only when the digest equals the blob
    registered for the claim. A receipt produced by an earlier hardening is labelled history by a
    committed record in the superseding round that names the receipt path and producer digest; the
    frozen receipt itself is not edited. Read receipts through this rule as 22 reads counts.
    (lesson: corpus/lessons/round-16-verifier-spotcheck.md:149; the count-scoped analogue is
    corpus/QUALITY.md:78-84)
```
Falsifier (as drafted by DraftQuality's style): `corpus/evidence/round-16/binding/selftest.json`
records `gateSha256 5150611c…`/`selftestSha256 8c5426f2…`, while the blob registered for the claim at
`5859243` is `1f84fb54…`/`481eefae…` (`git show 5859243:scripts/check-measurement-binding.mjs |
sha256sum`). `legacy-r15.json` carries the same pre-hardening `gateSha256`. Today those two receipts
are cited for a claim whose registered producer differs — criterion 30 is falsified at baseline, and
its repair is RoutedHardened's receipts at `1f84fb54…`.

**31 (routed 4).**
```
31. Refines 24: when a row previously marked unchecked in a sha-pinned note is checked and
    superseded, the supersession names the frozen path and line
    (corpus/knowledge/browser-surface-census.md:188), not only a label such as "census U3", so a
    reader at the frozen surface can reach the correction. The pinned bytes stay untouched.
    (lesson: corpus/lessons/round-16-verifier-spotcheck.md:151)
```
Falsifier: `corpus/README.md:295-317` names "(census U3)" at `:297` and never the path/line, so the
row at `corpus/knowledge/browser-surface-census.md:188` stays unreachable; grep of the supersession
for `browser-surface-census.md` returns nothing. `pins.tsv` sha-pins that note, so an in-file erratum
is not available — the index row is the only legal carrier (`corpus/README.md:293`).

**32 (routed 5).**
```
32. A contested scope with a sibling lane is dispositioned in a committed map row that quotes the
    sibling surface at a 40-hex revision with path and line; `ruled` cites the ruling at the revision
    that produced it, `contested-open` names the L0 question it waits on, and a declared split or
    refusal quotes both sides stating the split. An overlap acknowledged only in a report narrative,
    or a ruling quoted from an uncommitted message, is not a disposition.
    (lesson: corpus/lessons/round-16-verifier-spotcheck.md:152; ruling at :138-142)
```
Falsifier: a `ruled` row with `-` in `ruling_ref`, or a `ruling_ref` that does not resolve at its
40-hex, still verifies. Satisfiable against C3's grammar (PLAN `:137-146`): `ruling_ref` =
`tabi-shokunin@5859243:corpus/lessons/round-16-verifier-spotcheck.md:138`; the sibling side is
`kaidoku-shokunin@<hex>:PROVINCE.md:53` ("Runtime observation (CDP)", observed this round).

## Conflict — DraftQuality 29 is unsatisfiable as drafted

29 says "A gate or counter that certifies the lane reads the branch tip, never git `HEAD`." The
byte-frozen `scripts/check-freshness.mjs` is in `protectedPath` at baseline in both contract gates
(`scripts/check-round-contract.mjs:101`, `scripts/check-user-round-contract.mjs:151`, verified with
`git grep -n … 5859243`) and accepts a literal `HEAD` witness (`scripts/check-freshness.mjs:49,63-65`;
JjAudit F6 `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:184-188`, which ran `--witness HEAD` and got
`revision=HEAD`). A literal 29 makes a lane file the lane may not edit permanently red — an operability
harm. Required clause: "Except the byte-frozen `scripts/check-freshness.mjs`; the registry invocation
rule passes an explicit 40-hex ref (`PLAN.md:52-57`) and its `HEAD` acceptance is recorded as a why-not."
Everything else in 26–29 is sound and satisfiable.

## SKILL.md round-16 — what is already landed

`SKILL.md:1826-1892` (round-16 append) lands **none** of routed 1–5:
- `:1840` registry row pinpoints `--self-test`/pinned/checked values but never says that
  `corpus/evidence/round-16/binding/selftest.json` (43 cases) and `legacy-r15.json` came from the
  pre-hardening gate `5150611c…`. A reader following the row to the committed receipts gets the wrong
  producer — the failure criterion 30 names. Nothing in `:1880-1892` corrects it.
- `:1885-1886` records "Gate hardening at `3254740` … selftest 59 cases" — documents the hardening,
  not the receipt/producer mismatch (routed 2 remains open).
- `grep -n "liar\|routed\|integrator ruling\|adjacen" SKILL.md` hits only round-14/15 lines (`:700`,
  `:708`, `:1143`, `:1784`, `:1856`); no liar-probe, ruling or adjacency row exists.
- Routed 5's "next PROVINCE/SKILL append" is still draft-only: `.ufo/waves/round-17/drafts/province.md:3-4`,
  `drafts/skill.md:41-49`.
- `corpus/lessons/round-16.md:104-116` carries only the round-15 disposition; its Mistakes table
  (`:81-94`) has no row for routed 1/2/3. DraftQuality's `drafts/lesson-r17.md:74-77` adds rows for
  routed 1, 3 and `:76`, but **no row for routed 2, 4 or 5** (`:81-86` lists them only as
  dispositions). Criteria 30–32 cite the non-author spot-check directly (precedent: QUALITY 12/16);
  if L1 prefers `round-17.md#mistakes`, those three rows must be added first.

## D2 — the quoted word has no committed original

`git grep -in unforgeable 5859243` returns exactly one lane file: the spot-check itself
(`:76`). `grep -in "forge" /home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tabi.md` is empty, and
`grep -rn unforgeable .ufo/reports/ .ufo/waves/round-16/` in the fleet is empty. So
`PLAN.md:169` ("the r16 report word") and `drafts/log.md:44` misattribute it: the word is the
reviewer's paraphrase of an uncommitted author summary. Criterion 27 must cite spot-check `:76`
(stating it is a paraphrase) and must not cite a report line. This is routed item 1's defect class
applied to the routing text itself — a reason to land 28 (pointer resolution) the same round.

## Risks / second-order effects

- Adding 26–32 (seven criteria) in one append is a calibration-dilution risk; each new one is tied to a
  named routed defect and has a concrete enforcement point (30 → RoutedHardened receipts + binding gate;
  31 → greppable README row; 32 → C3 checker self-test). 26/30 must stay disjoint: 26 = receipt exists
  and is committed, 30 = its producer digest equals the registered blob.
- 31 is the weakest of the three: it is enforceable only by grep, and the byte-frozen note can never be
  edited. If L1 judges a whole criterion excessive, it can land as the README:297 text alone — but then
  routed 4's class recurs at every pinned note with no admission rule.
- 30 and 31 deliberately forbid editing frozen bytes (r16 evidence is byte-frozen per PLAN `:44-46`),
  so neither creates a permanent red once the r17 repair receipts land.

## Verification for L1

- `grep -cE '^[0-9]+\.' corpus/QUALITY.md` must read 32 after the append (25 + 4 + 3); the file must
  still pass the append-only check in both contract gates.
- 30 is falsified today by the two r16 receipts above; RoutedHardened's `--self-test` and `--legacy`
  receipts at `1f84fb54…` must make it hold (producer equality is then true, history labelled).
- 32 must fail on `ruling_ref` `-` for a `ruled` row; confirm with a counter-mutated row in the C3
  self-test.
- 29 needs the frozen-freshness carve-out before it is admitted; run `check-freshness --witness HEAD`
  once to show it still prints `revision=HEAD` (F6) and cite it as the why-not.

Files written:
- `.ufo/waves/round-17/w1/ConnQualityRouted.md` (this report)

Tools installed/updated: none. All reads were `read`/`grep`/`git show|grep|cat-file|ls-tree|log`
(read-only); no `jj`, no git write, no browser, no lane edit.
