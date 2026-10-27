<!-- corpus entry — tabi-shokunin round 36 (2026-10-27), claim C1 (adjacency — the split meter). Drafted by seat ScribeSrcGitDocs (.ufo/waves/round-36/w1/ScribeSrcGitDocs/), reviewed and landed by the L1. This entry documents the method; the measured round verdict is the frozen counter's run recorded in .ufo/waves/round-36/measure/. No measurement was run by the drafting seat; every status below is either the committed ledger's own column read at the frozen revision, the frozen claims file, or the counter's frozen header text. -->
source: S142 https://git-scm.com/docs/git-show (§DESCRIPTION, line 3272; §EXAMPLES, lines 5566-5571), fetched 2026-10-27T09:29:57Z (200, 246,608 B, sha256 0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a), with https://git-scm.com/docs/git-diff as support (§DESCRIPTION, lines 3243-3246; 200, 229,155 B, sha256 5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed). Location lines, quote word counts and the whitespace-normalisation caveat on the EXAMPLES quote are recorded in `.ufo/waves/round-36/w1/ScribeSrcGitDocs/fetch-receipts.md`.
verified-at: 2026-10-27T09:29:57Z — **source text only** (fetched, hashed, quoted by this seat). The ledger figures below were read from the lane repo at HEAD `2e7b7a8920bff47fae6f75c3d06e48e37767099e` with read-only `git -C … show HEAD:<path>` / `rev-parse` / `status --porcelain`; the counter was **not** executed by this seat, so no predicate verdict is asserted here.
recheck: 180d (S142 is an unversioned living page) — and re-read this entry whenever the drift ledger is regenerated: the status classes are a derivation over sibling git objects at frozen delta heads, so their truth expires with the pins, not with this prose.

# Adjacency drift audit — auditing a pinned screen row against a sibling's moved head

This entry documents the *method* C1 rests on. It does not report a
measured round: `claims.json` and the frozen counter own that verdict, and the numbers quoted
below are cited with their provenance, not upgraded into evidence.

## 1. What the method answers

The lane's sibling-overlap map (`corpus/adjacency.tsv`) and screen ledger
(`corpus/adjacency-screen-browser.tsv`, **383 data rows**, header at line 1) were built against
each sibling's **pinned** head — a `sibling_ref` of the shape
`<lane>-shokunin@<40-hex>:<path>:<line>`. A pin freezes *where* a cited line lived, not *where it
lives now*. Three consecutive honest stops (rounds 33-35) closed the fixed-`newMapped`-quota
meter on a pool that is already fully screened — there is nothing left to map. The round-36
split meter therefore asks a different question of the same pool: **when a sibling moves after
the pin, is every screen row citing that sibling still true, and is every new browser-ground
line the sibling added accounted for?** [contract: claims.json C1; counter header lines 6-24]

## 2. Frozen inputs

| input | what it is | size read this seat |
|---|---|---|
| `.ufo/waves/round-36/baseline/c1-delta-pins.json` | per-lane round-36 delta heads (blob `81019362…`) | 20 lanes, **12 differ** from the round-35 pins baked into the build tool |
| `corpus/adjacency-screen-browser.tsv` | the closed screen pool, 383 rows | 384 lines incl. header |
| round-35 pins | 20 heads baked as a literal in `c1-drift-audit-build.mjs` and in the counter | 20 lanes |
| `corpus/adjacency-screen-drift.tsv` | the derived ledger under audit | 308 lines incl. header = **307 data rows**, committed at the frozen revision, worktree clean |

Drifted lanes and their pin → delta head (`PINS` in the build tool vs `c1-delta-pins.json`):

| lane | round-35 pin | round-36 delta head | drift rows citing it |
|---|---|---|---|
| chousa | `00f8c7f5…` | `f9736a39…` | 1 |
| kaidoku | `49096c7e…` | `1ed29de2…` | 137 |
| kake | `04404859…` | `437f53b1…` | 51 |
| kama | `e8fa87ef…` | `3a600d2f…` | 9 |
| kasegi | `752e476d…` | `96dbd5f4…` | 0 |
| kengaku | `ff14d76d…` | `0f77f9b2…` | 0 |
| kumitate | `8d557f85…` | `d23892ad…` | 66 |
| mado | `e0be61e4…` | `b4a79843…` | 20 |
| mori | `aa3af1ec…` | `5b295eee…` | 2 |
| revenger | `6da884c6…` | `b7abcd87…` | 0 |
| tameshi | `f181a961…` | `6db1d220…` | 1 |
| tsukuroi | `a968393c…` | `3629c46a…` | 20 |

Eight lanes did not move (audio, game-dev-2d, game-dev-3d, kagi, kotoba, kotodama, lore, souji),
so their screen rows are outside the drift leg. Three drifted lanes — kasegi, kengaku,
revenger — have **no** screen row citing them, hence no drift row: drift coverage is every
*citing* row, not every drifted lane. [observed: per-lane tally of the committed ledger]

## 3. The three status classes and their derivations

The counter re-derives every status from git objects at the **frozen delta head**, never from a
sibling working tree. Definitions quoted from its frozen header (lines 45-48 of
`.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs`), with the build tool's parallel
implementation (`c1-drift-audit-build.mjs` lines 85-88) agreeing line for line:

- **`unchanged`** — *"the file exists at head and line `ln` holds the cited text verbatim."*
  Build tool: `if (atN === cited) rows.push([ref, 'unchanged', '-'])`. No relocation note.
- **`moved`** — *"the file exists, line `ln` differs, and the cited text appears verbatim at
  >= 1 other line (the audit's note must name one of them as `:<N>`)."* Build tool searches the
  whole head blob for a line whose **trimmed** text equals the cited text and writes
  `verbatim at :<N>` (plus `(also :N, :M)` when several positions match).
- **`stale`** — *"the file is absent at head or the cited text appears nowhere at head."* The
  build tool splits this into four distinguishable causes, each written into the note: `pin
  file absent`, `pin line absent`, `head file absent`, `cited text absent at head`.

Why the classes are ordered this way: the comparison is `trim(line)` equality on a single line,
so leading indentation changes are **not** drift, while re-wrapping a paragraph or reordering
prose *is* — and re-wrapping is exactly what a legitimate edit produces, which is why `moved`
exists as a class instead of collapsing into `stale`.

Two further clauses keep `stale` honest. A `stale` row is not accepted on its own: the counter
requires it **stale-re-dispositioned** — at the delta head the file is gone (nothing new to
disposition) or the new text at every position the cited text vacated is browser-ground-free
(the counter's `BG` vocabulary) or is delta-accounted. And the **delta pool** — every
browser-ground, non-tabi line at a frozen delta head whose `(lane, path, trimmed text)` is
absent from the pin lines — must be mapped by a verified row under the round-35 n1-n4 rules or
screened in `corpus/adjacency-screen-delta.tsv` under the v3 screen rules.

## 4. The ledger at the frozen revision

Read from `git -C tabi-shokunin show 2e7b7a8…:corpus/adjacency-screen-drift.tsv`
(header `sibling_ref<TAB>status<TAB>note`):

- **304 unchanged**, **3 moved**, **0 stale** — 307 rows, one per drift-eligible screen row.
- The 3 moved rows are all **kaidoku**, all `SKILL.md`, all relocated verbatim:

  | cited at pin | status | note |
  |---|---|---|
  | `kaidoku-shokunin@49096c7e…:SKILL.md:585` | moved | `verbatim at :748` |
  | `kaidoku-shokunin@49096c7e…:SKILL.md:621` | moved | `verbatim at :784` |
  | `kaidoku-shokunin@49096c7e…:SKILL.md:652` | moved | `verbatim at :815` |

- **Independent spot-check by this seat** (read-only `git -C <sibling> show`, not a counter
  run): all 3 `moved` notes verify — `SKILL.md:585/621/652` at pin `49096c7e…` equal
  `SKILL.md:748/784/815` at head `1ed29de2…` byte-for-byte (the file grew 1,405 → 1,568 lines,
  +163); and 4 `unchanged` rows sampled at every 97th row (chousa
  `corpus/knowledge/archived-export-intake.md:141`, kaidoku
  `corpus/knowledge/2026-10-14-r10-01-queue-ops.md`, kama `corpus/knowledge/listener-census.md`,
  tsukuroi `corpus/knowledge/kill-event-deep-r8.md`) all still hold their cited text at the
  delta head. That is 3/3 moved and 4/307 unchanged verified by hand — a sample, not coverage;
  coverage is the counter's claim to make.
- **Empty delta pool**: claims.json records 0 browser-ground lines added across the 12 drifted
  lanes between pin and delta head, verified by `git diff` at freeze [contract]. Consistent with
  that, `corpus/adjacency-screen-delta.tsv` is **absent** at the frozen revision; the counter
  reads it with `{ optional: true }` (line 459), so an empty pool needs no ledger — and a
  non-empty file with rows that key no candidate is a finding (`screen-not-a-delta-candidate`).
  This entry records the absence as observed; the "0 added lines" figure itself is the claim
  file's, not this seat's measurement.

## 5. What S142 grounds, and what it does not

`source: S142` enters the method at exactly one joint: the read that produces the head-side
comparison. The git-show page states (line 3272) *"Shows one or more objects (blobs, trees, tags
and commits)."*, and its EXAMPLES entry fixes the revision-addressed read:

> git show next~10:Documentation/README — "Shows the contents of the file Documentation/README as
> they were current in the 10th last commit of the branch next." (lines 5566-5571, whitespace-normalised)

That is the primitive both the counter and the build tool invoke — `git show <pin>:<path>` and
`git show <delta head>:<path>` — and it makes the pin and the delta head comparable **blobs at
the same path**, which is what licenses a line-by-line text comparison at all. Support only:
git-diff's §DESCRIPTION (lines 3243-3246) states that a diff can compare *"two blob objects"*,
i.e. the object-level equality question is well-formed, but it says nothing about the syntax in
use.

The page does **not** say that a line number is stable across revisions, that a blob read
"moves" text, or that any particular sibling is unchanged. So the class assignments in §3 remain
a derivation over two objects. S142 is a row about *where to learn the addressing primitive*; it
is not evidence for any status in §4, and it cannot rescue a mis-audited row.

## 6. Limits (disclosed, not fixed)

1. **This entry carries no measurement.** No counter run, no `measure.sh`, no predicate verdict —
   the numbers in §4 are the committed ledger's columns and the claim file's figures, read
   read-only at the frozen revision.
2. **A forger who runs the same derivation needs no lane work** [contract:
   `feasibilityDisclosed`]. The ledger is honest only where it equals the derivation the counter
   repeats; wave 2 attacks each status class and the 3 moved rows by hand. The class definitions
   in §3 are therefore the surface to attack, and a mis-assigned class is expected to survive
   nothing but an equal derivation.
3. **Trim-equality is coarse.** Re-indenting a cited line reads `unchanged`; splitting one cited
   line into two reads `stale` even when the sentence is intact and merely re-wrapped mid-line.
   The audit measures *line identity*, not *claim survival*.
4. **A relocated citation is only as good as the note.** `moved` requires the note to name a
   line where the cited text verifies verbatim; it does not require that the surrounding context
   still means the same thing. The 3 kaidoku rows are exactly this shape (`SKILL.md` grew
   1,405 → 1,568 lines, +163), so a reader who cares about meaning must open `:748`, `:784`,
   `:815`.
5. **`<rev>:<path>` grammar is cited from an example, not a specification.** gitrevisions(7) was
   not opened this round; the general form is unverified here.
6. **Drift coverage is citing rows, not drifted lanes.** kasegi, kengaku and revenger moved with
   zero screen rows citing them. A sibling that moves *and* gains browser-ground lines nobody
   screened is caught only by the delta leg, and the delta leg's emptiness this round is a fact
   about these 12 heads at freeze — not a standing property.
7. **Movement after freeze is invisible.** Delta heads were resolvable at freeze; a sibling
   commit landing afterwards changes nothing in this ledger, by construction.

## 7. Recheck

Regenerate with `node .ufo/waves/round-36/baseline/c1-drift-audit-build.mjs` (reads only git
objects; refuses unresolvable revisions) or re-derive with
`node .ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs --rev <REV> --repo <clean clone>
--fleet /home/vgpnk/Projects/shokunin --json`, then re-read §4's three class counts. On any
sibling head moving, on a new pin set, or at the 180d S142 recheck, this entry's §4 table is
superseded — the method in §3 survives until the counter's definitions change.

## Correction — §6.7 post-freeze sibling movement (round 36, wave 2)

This clarification supersedes §6.7's wording that a sibling commit landing after the freeze
"changes nothing in this ledger." The frozen counter reads the delta pins committed at `REV`;
post-freeze sibling commits therefore do not alter the measured ledger or predicate while those
pins stay fixed. A later re-derivation against live sibling tips can, however, change relocation
notes and make that re-derived ledger fail against the frozen counter.

Measured by w2 `ExecDeltaLive` (`.ufo/waves/round-36/w2/ExecDeltaLive/report.md`): 7 of the 12
frozen drifted lanes advanced after the freeze, plus `souji` (outside that 12-lane set), for 51
post-freeze commits across the 20 lanes. With the frozen pins, the counter remains true at the
wave-1 landing and the later lane tip. Re-deriving at live sibling tips leaves all 307 status
classes unchanged (304 `unchanged`, 3 `moved`, 0 `stale`) and the delta pool empty, but the three
kaidoku relocation notes shift from `:748/:784/:815` to `:752/:788/:819`; the counter with those
live-tip pins refuses the re-derived ledger with three `audit-moved-wrong-relocation` findings.
`souji` contributes no cited screen rows or browser-ground delta lines in this measurement.

Recheck by re-deriving both the status classes and relocation notes at the declared pins; do not
infer note stability from unchanged class counts.
