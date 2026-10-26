# ConnFrontierConsistency — round 30 w2 (falsify) scoped findings

Seat: ConnFrontierConsistency (leaf). Tip under test: `072af95fe2822f0785a6ff88a578e2142dd258e5`; baseline
`f7c0317e4f8445502005e79e3d65767430912dab`; claims frozen at `061e620…` (`.ufo/waves/round-30/claims.json`).
Everything below was measured in the seat's scratch clone
(`/fast/scratch/hyaku/tabi-r30/ConnFrontierConsistency/clone`, cloned `--shared` from the lane, checked out at the
tip, `git status --porcelain` → 0 lines). No network fetch was made by this seat (all quotes verified against
committed bytes and a read-only read of the sibling lane). No tool installed. No lane tracked file edited.

## Verdict

I attacked the consistency of the lane's frontier records for the Rate/ToS item at the tip: the round-30 README
section (`corpus/README.md:632-652`), every earlier frontier-table statement of the item (kaika row `:182`, rounds
12/15/16/17/18/20/21/22/23 carry-forward rows), the approval-table text C2–C6 and U1
(`corpus/knowledge/interaction-approval-table.md`), SKILL.md's `§Rights / rate boundary` + `§Approval table`
(`:681-729`), and the crawler-discipline adjacency row
(`corpus/adjacency.tsv` row 6, kake split). **Holds in substance: no statement in any earlier record contradicts the
round-30 restatement, and nothing in the round-30 section contradicts an earlier one.** The status progression
`open` (kaika `:182`; rounds 12/15/16/17) → `docs-held; runtime open` (round 30, `:641-651`) is the intended
append-only move and matches the two new entries' own tier ("documented upstream, not measured here"). The claims I
checked are all accurate: the fixture's stop-and-report predicate fires on 429/403/robots/interstitial and records
`Retry-After` as a shape but **no** `RateLimit`/`X-RateLimit-*` field (`external-class-fixture-v2.md` §2/§5/§8);
U1 correctly stays open because round 30 landed documented vocabulary, not a *measured* datum; SKILL.md's C3/C6
rows and the `§Rights / rate boundary` paragraph remain true (no measured live-site surface exists). **Minor
defects found — all precision/stale-pointer issues, none verdict-changing:** (1) item-label drift —
"rate/rights real-site records" (README `:216`, `:282-285`, `:302-305`, `:331-332`; `PROVINCE.md:10`) vs the
canonical "Rate/ToS surface for site-interaction records" (`:182`, `:641-651`), with rounds 18/20/21/22 silently
dropping the item from their "still open" enumerations; (2) class-pointer narrowing — the kaika row's "C2–C6"
pointer (`:182`) vs the round-30 restatement's "C3 and C6" (`:644`, `:651`), when the approval table's deciding
evidence actually names C2 (rate unmeasured), C3 (ToS/robots unmeasured) and C6 (rate unmeasured) — C4/C5 decide
on other axes, so neither pointer is exact; (3) fixture pointer imprecision — the instrument rule's exact sentence
"A loopback 429 is an instrument, never a C6 datum" lives at `external-class-fixture-v2.md:510` (§8), while both
the kaika row and the round-30 restatement point at §4–§5 (E1/E2 measurement sections, adequate but not exact);
(4) the approval-table C3 parenthetical "ToS/robots surface unmeasured (no datum in the corpus …)" is now
incomplete in a literal reading — the corpus contains S116/S117 documented vocabulary, just no measured surface;
(5) SKILL.md `§Rights / rate boundary` (`:693-695`) and the C3/C6 rows predate round 30 and carry no pointer to
S116/S117, inviting a future reader to misread "no measured surface" as "no vocabulary recorded"; (6) adjacency.tsv
row 6 (kake split) quotes are truncated without ellipsis (sibling_quote ends "…kake owns" although kake
`PROVINCE.md:30` continues "publisher-side placement (robots/sitemap at the host it serves)"; tabi_quote cuts at a
comma), and its ruling_quote "browsers against real sites with evidence discipline." has `ruling_ref -` with no
cited source (the phrase is a substring of the lane's own `.ufo/waves/round-14/w1/PolicyBoundaries.md:27`, not of
either `PROVINCE.md`). All six are fixable by append-only additions; none changes a disposition, a counter reading,
or a claim.

## What I attacked

1. **Round-30 README section vs the kaika row (`README:182`).** The kaika row: "Rate/ToS surface for
   site-interaction records | open — the approval table still decides from an absence; round 6 measured loopback
   429/403/robots-disallow instruments with a stop-and-report predicate, which is the instrument, not a real
   surface. | `knowledge/external-class-fixture-v2.md` §4–§5; `knowledge/interaction-approval-table.md` C2–C6;
   `knowledge/state-changing-matrix-r9.md` (loopback only)." Verified: the fixture really contains robots-disallow,
   429+`Retry-After`, 403, interstitial instruments (`external-class-fixture-v2.md:48-53`, §5 `:410+`, code
   `:84-132`, fixture files `:178+`, cell table `:418-422`), the stop-and-report predicate at §2 (`:57+`), and the
   exact "A loopback 429 is an instrument, never a C6 datum" sentence at §8 (`:510`). Round-30 restatement
   (`:641-647`) agrees and adds the verified fact that the predicate records no `RateLimit`/`X-RateLimit-*` field
   (the trip-record shape at `:137-140` carries `retryAfter`/status/body — no rate-limit header fields; confirmed
   independently by w1 `ConnApprovalTable.md`).
2. **Round-30 README section vs later frontier tables.** Rounds 12 (`:216` "rate/rights real-site records …
   unchanged — historical frontier rows :180–183 and :194"), 15 (`:282-285` "real-site rate/rights … remain
   open"), 16 (`:302-305`, wave-2 note `:307-314`), 17 (`:331-332`), 18 (`:384-385` "real-site … remain open"),
   20/21/22 (`:442-444`, `:478`, `:519-520` — no explicit rate/ToS mention), 23 (`:548-558` restates CSRF and
   references the `:183` cell, not `:182`), 24/25/27/29 (`:580-630` — no rate/ToS row). No later row asserts a
   status that the round-30 "docs-held; runtime open" contradicts; the label drift in (1) of the verdict is the
   only textual inconsistency.
3. **Approval table C2–C6 and U1.** C2 (`:58`): "rate: unmeasured for real sites → the bounded-runs floor
   applies". C3 (`:59`): "ToS/robots surface unmeasured (no datum in the corpus …)". C6 (`:62`): "rate: the
   deciding axis — and it is unmeasured here". U1 (`:191-193`): "The first **measured** datum (status-code family,
   `Retry-After`, robots/ToS text) re-anchors C6 and lands in the corpus". Round-30's "C3 and C6 still decide from
   an absence [U1 stays open]" holds — the entries explicitly say "No host was queried … no browser ran" / "Nothing
   in this entry was measured in this lane"; U1's *measured* trigger remains unsatisfied.
4. **SKILL.md approval table (`:681-729`).** `§Rights / rate boundary` (`:693-695`): "No measured live-site rate
   limit or ToS surface exists in the probation notes — do not assert one; record it when measured." C3 row
   (`:726`): "Default-deny — ToS/robots surface unmeasured". C6 row (`:729`): "Deciding axis unmeasured → never
   self-assign a budget; stop-and-report on the first measured rate datum". All remain true after round 30
   (documented ≠ measured); SKILL.md changed this round only at the tail (+16 appended registry lines at `:2546+`;
   diff `f7c0317..072af95 -- SKILL.md` = 16 insertions, 0 deletions, approval table untouched).
5. **adjacency.tsv crawler-discipline row (kake split).** Row 6: `crawler-discipline-vs-publishing kake
   kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:30` — sibling_quote ends "…kake owns"
   (truncated); tabi_quote "web *publishing* (→ kake)," (prefix of `PROVINCE.md:16`); disposition `split-declared`;
   ruling_ref `-`; ruling_quote "browsers against real sites with evidence discipline." Verified against kake's
   pinned blob `7c61c8cc…:PROVINCE.md:30` (full sentence: "`tabi` drives browsers and owns client-side crawler
   discipline; kake owns publisher-side placement (robots/sitemap at the host it serves).") and tabi's
   `PROVINCE.md:15-19`. The split is consistent with the approval table (owning the discipline ≠ a grant to
   browse: C3/C6 still asleep-blocked) and no round-30 change affects it.

## Evidence (commands, outputs, exit codes)

Setup (exit 0):
```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin \
      /fast/scratch/hyaku/tabi-r30/ConnFrontierConsistency/clone
$ git -C /fast/scratch/hyaku/tabi-r30/ConnFrontierConsistency/clone checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5
$ git -C /fast/scratch/hyaku/tabi-r30/ConnFrontierConsistency/clone status --porcelain | wc -l
0
```

Round-30 README section is append-only (commit 072af95 vs 38891ca; exit 0):
```
$ git diff --stat 38891ca..072af95 -- corpus/README.md
 corpus/README.md | 22 ++++++++++++++++++++++
 1 file changed, 22 insertions(+)
$ git diff 38891ca..072af95 -- corpus/README.md | grep -cE '^-[^-]'
0
```

Kaika row and carry-forward rows (line checks from committed bytes):
```
$ sed -n '182p' corpus/README.md        # kaika row: Rate/ToS open, pointer C2–C6 + fixture §4–§5
$ sed -n '216p' corpus/README.md        # r12: "rate/rights real-site records … unchanged"
$ sed -n '282,285p' corpus/README.md    # r15: "real-site rate/rights … remain open"
$ sed -n '302,305p;331,332p' corpus/README.md   # r16/r17 carry-rows
$ sed -n '641,651p' corpus/README.md    # r30 restatement + table row
```

Fixture instrument claims (exit 0 except noted):
```
$ git grep -nE '^## ' 072af95 -- corpus/knowledge/external-class-fixture-v2.md
  # §2 stop-and-report :57; §4 E1 :373; §5 E2 :410; §8 429-rule :508
$ git grep -n 'A loopback 429 is an instrument, never a C6 datum' 072af95 -- corpus/knowledge/external-class-fixture-v2.md
  # :510 (exact sentence lives in §8, not §4–§5)
$ git grep -cE 'RateLimit|X-RateLimit' 072af95 -- corpus/knowledge/external-class-fixture-v2.md
  # 0 — no such fields anywhere in the fixture (predicate records retryAfter only)
```

Approval table / SKILL.md (exit 0):
```
$ sed -n '58,62p' corpus/knowledge/interaction-approval-table.md   # C2/C3/C6 deciding evidence
$ sed -n '191,193p' corpus/knowledge/interaction-approval-table.md # U1
$ sed -n '693,695p;724,729p' SKILL.md                             # boundary + C1–C6 rows
$ git diff f7c0317..072af95 -- SKILL.md | grep -cE '^-[^-]'
0
```

adjacency.tsv row 6 (exit 0):
```
$ awk -F'\t' 'NR==6{for(i=1;i<=NF;i++) printf "FIELD %d len=%d: [%s]\n", i, length($i), substr($i,1,160)}' corpus/adjacency.tsv
FIELD 3 len=69: [kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:30]
FIELD 4 len=73: [`tabi` drives browsers and owns client-side crawler discipline; kake owns]
FIELD 6 len=26: [web *publishing* (→ kake),]
FIELD 8 len=1: [-]
FIELD 9 len=53: [browsers against real sites with evidence discipline.]
```

Sibling-source verification (read-only, exit 0):
```
$ git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md | sed -n '27,32p'
- `tabi` drives browsers and owns client-side crawler discipline; kake owns
  publisher-side placement (robots/sitemap at the host it serves).
$ sed -n '15,19p' corpus …NCE.md   # refuse-and-route: "web *publishing* (→ kake), secrets (→ kagi …"
$ grep -n 'evidence discipline' .ufo/waves/round-14/w1/PolicyBoundaries.md | head -3
  # :27 "…driving real browsers against real sites with evidence discipline." ← the ruling_quote's only locatable origin
```

New entries' self-declared tier (exit 0):
```
$ sed -n '6,12p' corpus/knowledge/rate-limit-policy-fields.md   # frontier: rate-tos-signal; "Not measured here"
$ sed -n '6,16p' corpus/knowledge/host-published-rate-limit-headers.md  # frontier: rate-tos-signal; "Nothing … measured in this lane"
$ grep -nE '^\| S11[67] ' corpus/SOURCES.md                     # rows S116/S117, opened 2026-10-26
```

## Findings

| # | Surface | Verdict | Detail |
|---|---|---|---|
| F1 | README r30 vs kaika `:182` | **holds** | same item name; status open → docs-held/runtime open is the intended append-only progression; fixture instrument claims verified; the "predicate records no RateLimit/X-RateLimit-*" addition verified (0 hits in fixture). |
| F2 | README r30 vs later frontier tables | **holds** (label drift) | no contradicting status; but "rate/rights real-site records" (r12/15/16/17) and r18/20/21/22 silent omission are aliases of the canonical item and are not cross-referenced. |
| F3 | README r30 vs approval table C2–C6/U1 | **holds** (pointer narrowing) | "C3 and C6" vs kaika's "C2–C6": the table's deciding-evidence text names C2, C3, C6 for unmeasured rate/ToS; neither pointer is exact; U1 correctly stays open (S116/S117 are documented, not measured). |
| F4 | README r30 vs SKILL.md `:681-729` | **holds** | C3/C6 rows and the no-measured-surface paragraph remain true; no stale pointer in substance; no pointer yet to S116/S117. |
| F5 | README r30 fixture pointer | **holds** (imprecision) | kaika and r30 cite §4–§5; the exact "instrument, never a C6 datum" sentence is at §8 `:510`. |
| F6 | adjacency.tsv crawler-discipline row | **holds** (data-quality) | split statement agrees with kake `PROVINCE.md:30` at the pinned commit; sibling_quote truncated without ellipsis; ruling_quote uncited (`ruling_ref -`), phrase traceable to tabi `PolicyBoundaries.md:27` only. |
| F7 | C3 "no datum in the corpus" | **stale parenthetical** | literally true of *measured* data, incomplete now that documented vocabulary (S116/S117) is in the corpus; round-30 restatement already carries the honest phrasing. |

## Proposed append-only fixes (nothing below touches existing bytes)

1. **Alias resolution (future restatement).** In the next round's frontier restatement (or a round-30 errata
   appended below `README:652`), add one line: "the round-12/15/16/17 rows' 'rate/rights real-site records' (≡
   Rate/ToS surface for site-interaction records) are the same item; status superseded by the round-30 row."
2. **Exact class pointer.** Append an errata row in `interaction-approval-table.md` §8 listing the classes whose
   deciding evidence is an unmeasured rate/ToS absence: C2 (rate), C3 (ToS/robots), C6 (rate) — reconciling
   "C2–C6" and "C3/C6" — and pointing at S116/S117 as documented-but-unmeasured vocabulary (with their tier), so
   "no datum in the corpus" cannot be read as "no vocabulary recorded".
3. **Fixture rule locator.** In the same errata (or in the round-30 restatement's successor), note the exact
   sentence "A loopback 429 is an instrument, never a C6 datum" lives at `external-class-fixture-v2.md:510` (§8),
   with §4–§5 kept as the measurement-section pointer.
4. **SKILL.md pointer.** Append (never edit) to `§Rights / rate boundary` a pointer to the two round-30 entries
   with their tier — the paragraph's claim stays true and becomes searchable.
5. **adjacency.tsv.** No byte edit (tracked file, checker-owned). For a future row/cell revision under
   `scripts/check-adjacency.mjs` rules: complete the sibling_quote to kake `PROVINCE.md:30`'s full sentence with
   an ellipsis convention, and give the ruling_quote a `ruling_ref` (kake `7c61c8cc…:PROVINCE.md:30` and/or tabi
   `.ufo/waves/round-14/w1/PolicyBoundaries.md:27`).

## Scope and honesty notes

- No network fetch made this seat; the `Retry-After`-shape pointer in the round-30 restatement was verified against
  committed bytes (`redirect-and-retry-after-semantics.md`, 5 `retry-after` hits) and the w1 ConnApprovalTable
  receipt log.
- The claims.json C2 wording "status open since kaika round 1 … at `:182`" describes freeze-time (before the round-30
  row existed) — consistent with the frozen-before-data rule; the tip row supersedes the *status*, not the claim.
- I did not re-run the C2 frontier counter; the L1 live reading (population 2 / admitted 2) is the integrator's
  milestone verification and is out of this seat's scope.
- Nothing was repaired; this seat only attacks and reports.
