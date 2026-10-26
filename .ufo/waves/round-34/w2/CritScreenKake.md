# CritScreenKake — wave 2 (FALSIFY): the kake screen rows of `corpus/adjacency-screen-skill.tsv`

Attacked surface: the 11 screen-ledger rows whose sibling is kake —
`SKILL.md:559`, `SKILL.md:560`, `SKILL.md:161`, `corpus/knowledge/field-performance-cwv.md:153`,
`corpus/knowledge/accessibility-review-packet.md:121`/`:122`, `corpus/knowledge/accessibility-review-cards.json:8`,
`corpus/knowledge/js-rendering-queue.md:77`, `corpus/knowledge/static-canonical-preflight.md:134`,
`corpus/knowledge/mirror-pitfalls.md:40`, `corpus/knowledge/fire-journal-codes.md:27` — read against kake
`044048597d62f3199494b63b36e90dd57825e350` (±10 lines each) and against the map at REV
`04f9623dde8ad35d470cecf766e421eafbcb47fa`. Seat: findings only, no repair.

## Verdict

**Holds on substance; two defects in the ledger's reason/citation columns, both low severity.**
The accounting is sound: the 11 kake rows are exactly the 13 kake candidates minus the 2 that map rows 15/16 own,
every `sibling_ref` is byte-equal to its frozen candidate key, every quote is verbatim on the *actual* pinned line
(11/11, not merely on the frozen text), every quote is 7–13 words / 49–98 non-space chars, every row has 5 columns
with no control/CR/trailing-space bytes, and every `same-surface` names a map surface that verifies for kake at REV.
**No real overlap is screened away** — the worst defect class is absent: each of the 10 `same-surface` lines restates a
verified kake surface, and the one non-`same-surface` line allocates nothing. The counter is unmoved and finds nothing:
`predicate=met … unaccounted=0 newMapped=4 screenFindings=0`.

- **Defect D1 (low, one cell):** `corpus/knowledge/fire-journal-codes.md:27` is screened `not-browser-sense`, a reason the
  lane's own decision rule reserves for regex word-sense false positives. The line genuinely names CDP/tab state and
  `browser ensure`; the right reason is `no-claim-declared`.
- **Defect D2 (low, three notes):** the notes of `SKILL.md:161`, `mirror-pitfalls.md:40` and `js-rendering-queue.md:77`
  cite a bare `kake PROVINCE.md:35`/`:30`. Those numbers are true at the *map* rows' pin `7c61c8cc…` and false at the
  row's own pin `0440485…`, where the same text sits at `:39` and `:34`. Precision, not falsehood — but the citation
  does not resolve at the row's pin.

Neither finding changes any count, the predicate, or the claim; both are one-cell/one-phrase fixes.

## Evidence

### Commands (exit codes pasted)

```
git clone --shared .../tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 04f9623d…   exit 0
git -C $S/clone rev-parse HEAD                                    -> 04f9623dde8ad35d470cecf766e421eafbcb47fa
sha256sum c1-adjacency-sweep-v2.mjs -> 0dba816c…75a8781e         (= claims.frozenDigests; frozen bytes used)
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
     --rev 04f9623d… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin                      exit 0
  C1_ADJACENCY_SWEEP_V2 predicate=met rev=04f9623d… adjacency=clean candidates=67 mapped=5
  screened=62 unaccounted=0 newMapped=4 screenFindings=0
node <per-row quote-at-pin verifier: git show kake@0440485:<path>, line N includes quote>        exit 0
  11/11 onspine=true  (receipt: screen-rows-verified.txt)
git show kake@0440485:corpus/knowledge/accessibility-review-cards.json | grep -c \
  'tabi owns authorized browser/assistive-technology execution and any account operation remains operator-gated'
  -> 55   (matches the cards note's "55 occurrences")
```

### D1 — `fire-journal-codes.md:27` screened `not-browser-sense` (wrong reason)

The lane's own rule (`SKILL.md:2865-2867`): *"Is the line about this lane's craft at all — a browser, a driver, a
protocol, a capture? A sibling line that only matches the regex through another sense of the word (a UI 'chrome' skin,
a prose 'crawl' of a book) is `not-browser-sense`."*

The candidate line (kake `0440485:corpus/knowledge/fire-journal-codes.md:27`) is
`| 2 | lane/preflight infrastructure (CDP down, no kimi tab, tab new, live fetch) | no | `browser ensure`, re-check live URL, retry |`
— it matches in the *real* sense (CDP endpoint down, browser tab lifecycle, `browser ensure`), so it is not a word-sense
false positive, and step 1 cannot be the deciding answer. Round-33 w1 `ConnSiblingScan/leads.tsv` scores the same line
`real_overlap=no`, topic `cdp-usage`, note *"Operational CDP preflight use; reports state, does not claim ownership"* —
i.e. the sweep itself read it as an operational taxonomy that claims nothing, not as out-of-sense text.

Smallest safe correction: `reason` `not-browser-sense` → `no-claim-declared`, `surface` stays `-`, note unchanged (it
already argues exactly that: *"the row asserts no browser behaviour, no site and no evidence surface that tabi practises,
so it maps nothing"*). The counter is indifferent (any closed-vocabulary reason + `-` is accounted); the ledger stops
asserting a false thing about the line. Impacted axis: adjacency (the screen-reason vocabulary is the evidence; this is
the one row in my set where the tag and the note disagree).

### D2 — three notes cite `PROVINCE.md:35`/`:30` at the wrong pin

At the pin of the ledger rows (`kake@0440485…`):

| note in row | cites | text at `0440485` at that number | text at `7c61c8cc` (map pin) at that number |
|---|---|---|---|
| `SKILL.md:161` | "kake `PROVINCE.md:35` row" | `:35` = "publisher-side placement (robots/sitemap at the host it serves)." | `:35` = "The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)" |
| `mirror-pitfalls.md:40` | "at kake `PROVINCE.md:35`" | same (`:39` is the lease bullet at this pin) | same |
| `js-rendering-queue.md:77` | "restates kake `PROVINCE.md:30`" | `:30` = "open. Ground moves to Core only with source-backed entries and a gate." | `:30` = "`tabi` drives browsers and owns client-side crawler discipline; kake owns" |

The map rows 6 and 7 are pinned at `kake@7c61c8cc…:PROVINCE.md:30` and `:35`; the file grew by four lines before
`0440485`, so `PROVINCE.md` went `:30→:34` and `:35→:39`. The "already mapped" half of each note is true; only the
locator is unpinned. Smallest safe correction: qualify the ref (`kake@7c61c8cc…:PROVINCE.md:35`) or re-point to the
row's-pin locators (`:39`, `:34`). Contrast: the four a11y notes cite `PROVINCE.md:79`, which *is* correct at
`0440485` (verified), so the ledger's convention is the row's pin.

### Per-row verdicts, grouped by reason

**`same-surface` (10 rows) — all hold; the named surface does carry the boundary.**

| row | surface | verdict and ground |
|---|---|---|
| `SKILL.md:559` | accessibility-browser-at-execution | **holds** — tabi's own round-33 declaration at `SKILL.md:2889` cites *"kake `SKILL.md:559-560`"*, so this line and `:560` are literally the tabi-declared boundary; map row 14 (`PROVINCE.md:79`) carries it. `:559` is the scope half ("The operator authorizes a named property/build/process scope; tabi receives"), `:560` the allocation half. |
| `SKILL.md:560` | accessibility-browser-at-execution | **holds** — second half of the same sentence; kagi-credential and operator-publishing clauses are conditions on kake's side (credential custody is map row 7 `secrets-vault-ops`, kagi; publishing is kake's own per `PROVINCE.md:16`), not a second tabi surface. |
| `accessibility-review-packet.md:121` | accessibility-browser-at-execution | **holds** — same handoff sentence family; "operator … alone authorizes any later property evaluation" is the authorization gate, the tabi clause is the mapped execution split. |
| `accessibility-review-packet.md:122` | accessibility-browser-at-execution | **holds** — same sentence's tabi/kagi halves; no second boundary. |
| `accessibility-review-cards.json:8` | accessibility-browser-at-execution | **holds** — identical `publisherCheck` prefix on exactly 55 lines (grep = 55, so the note's count is exact); the account clause ("any account operation remains operator-gated") is a fact on kake's own side of an already-mapped split — QUALITY 91's screen rule, apt citation. |
| `field-performance-cwv.md:153` | lab-performance-tool-runs | **holds** — the line is the wrap of `:152` ("Running lab tools such as Lighthouse or DevTools is browser work / and routes to tabi"); the subject is the lab run mapped as row 16 (kake `SKILL.md:697`). The CrUX-key clause is a credential route (operator/kagi), not tabi ground. |
| `js-rendering-queue.md:77` | crawler-discipline-vs-publishing | **holds** — the line self-cites "(`PROVINCE.md`, Adjacent)"; at the row's pin that bullet is `PROVINCE.md:34-35`, the very sentence map row 6 quotes (at its own pin `7c61c8cc:PROVINCE.md:30`). Note has D2's locator nit. |
| `static-canonical-preflight.md:134` | js-rendering-browser-execution | **holds** — "rendered DOM (tabi's ground)" is exactly map row 12's allocation (kake `PROVINCE.md:61` / tabi `SKILL.md:2887`). "current delivery" and "search-engine selection" sit in the *disclaimed* list (what a receipt does not prove), not as allocations, so they add no second boundary. |
| `SKILL.md:161` | musketeer-cdp-9222-profile-lease | **holds** — names the leased resource literally ("the-musketeer profile, CDP `127.0.0.1:9222`"); map row 7 (contested-open) owns kake's side, tabi's answer is the throwaway profile at `SKILL.md:556`. Note has D2's locator nit. |
| `mirror-pitfalls.md:40` | musketeer-cdp-9222-profile-lease | **holds** — the lease-acquire/release step inside kake's `## Browser/CDP lane`, whose next line (:41, not a candidate) names the shared burner; same contested surface. Note's lead claim is accurate: leads.tsv cites `:39`, the quote is on `:40`, the counter's ±2 re-anchor lands on `:40`. Note has D2's locator nit. |

**`not-browser-sense` (1 row) — defect D1** (`fire-journal-codes.md:27`), above.

**Real-overlap check (the failure this seat exists to catch): none.** All 13 kake candidates outside `PROVINCE.md` are
accounted (2 mapped: `SKILL.md:408`→row 15, `SKILL.md:697`→row 16; 11 screened). Cross-checked against the round-33 w1
`leads.tsv` kake rows: 11 leads, every one accounted — 9 land on a screen row (`SKILL.md:161`, `:560`,
`field-performance-cwv.md:153`, `accessibility-review-packet.md:122`, `accessibility-review-cards.json:8`,
`js-rendering-queue.md:77`, `static-canonical-preflight.md:134`, `fire-journal-codes.md:27`; `mirror-pitfalls.md:39`
re-anchors to `:40`) and 2 are the mapped lines (`SKILL.md:408`→row 15, `SKILL.md:697`→row 16). No kake line asserts a
boundary that has no map row or screen row.

### Carried observation (not a defect of these rows; L1's call)

The four a11y screens work because map row 14 verifies, but row 14's `tabi_quote` (`SKILL.md:2889`, "browser and
assistive-technology execution … is tabi's") is superseded by the append-only correction at `SKILL.md:2914`:
assistive-technology execution "is a route tabi accepts as frontier, not a held surface". The screens remain correct as
*accounts* (they only say these lines restate that split), but a strict reading of the a11y boundary today is
route/frontier, not `split-declared` on a held surface. Already recorded in-lane; nothing to repair in wave 2.

### Scope note (checked, no verdict claimed)

The old-ledger relabel mandated by routed defect 5 (`corpus/adjacency-screen.tsv`, kake `PROVINCE.md:396`/`:411`/`:422`/
`:440`) is outside my named 11 rows. I read it anyway: re-screening the three disclaimer lines from `no-claim-declared`
to `same-surface` is defensible under the decision rule's first-match order (step 2 "a map row already owns that surface"
precedes step 4), and the new notes say so. The apparent cross-ledger inconsistency with disclaimer rows that keep
`no-claim-declared` is not one: the screen's `surface` must be a map surface of the *same* sibling, which such siblings
(e.g. chousa) do not have. No finding.

## Deliverables

- This report: `.ufo/waves/round-34/w2/CritScreenKake.md`
- Output dir `.ufo/waves/round-34/w2/CritScreenKake/`:
  `c1-at-04f9623.json` (counter JSON at REV), `c1-text.txt` (counter text line), `screen-rows-verified.txt`
  (11 rows: reason, surface, word count, quote-on-actual-pinned-line), `kake-candidate-context.txt`
  (±10-line context dump for all 11 candidate lines at the kake pin), `commands.md` (commands + exit codes).

No lane file, index or sibling repo was written; no browser was launched; no network fetch was made; no tool installed.
Scratch `$HYAKU_SCRATCH/tabi-r34/CritScreenKake/` (clone + TMPDIR) deleted after copying receipts.
