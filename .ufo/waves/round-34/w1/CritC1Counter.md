# CritC1Counter — attack on the frozen C1 counter (tabi round 34, w1)

**Verdict.** The frozen counter `c1-adjacency-sweep-v2.mjs` is satisfiable with **zero** of the claimed work. Append one junk prose line at the end of `SKILL.md` (any tabi file works — a brand-new `corpus/r34-junk-decl.md` also passes), add three map rows on three unaccounted candidate lines with disposition `refused-route` and an arbitrary surface string, and screen the other 63 candidates `not-browser-sense`: predicate met, gate clean, exit 0 (`K1`, `K2`, `K6`). The counter checks the *shape* of a declaration, never that it is one; it never looks at the `## Round 34 — sibling-overlap declarations (outside PROVINCE)` section the item requires; it never requires the sibling side to name tabi for `refused-route`; and the entire screening ledger is honour-system, so 24 of the 28 set-B leads the frozen round-33 scan labels `real_overlap=yes` are screened "not browser sense" and still count as accounted. Separately, `newMapped`'s notion of "new" is per-file string absence: a verbatim old line copied from another tabi file, or an existing line with one character changed, counts as a NEW declaration (`K3b`, `K7`). The one genuinely guarded construction is `contested-open` (the gate demands a real fleet L0 row — `K5`, `adjacency=failed reason=l0_line_absent`), and `ruled` is only weakly guarded: a stale round-16 spotcheck line that merely names the sibling was accepted for an unrelated kaidoku candidate (`K8` row 15, verified). Two latent holes need a w2 guard even though the frozen 67-lead set does not expose them today: the lead re-anchor fallback can anchor a **wrong line** on a 4-word coincidence and silently **drops** leads whose quote straddles a wrap with no unaccounted penalty (probe: `8 -> 9` on a drifted quote; wrapped lead listed in `leadsUnresolved`), and the candidate set is blind to 697 non-`.ufo` sibling lines that name tabi outside `SKILL.md` + `corpus/knowledge/*.md` (55 of them in one kake `.json`).

Everything below was executed in a scratch clone at the freeze `59f1b47…` (baseline `15dfaccb…`) against the frozen counter bytes (`sha256 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e`) with the frozen gate (`sha256 4e2c2a64…`, asserted by the counter).

---

## 1. What I attacked (axes)

| axis | question |
|---|---|
| A1 work-required | does passing require the mapping/judgement work, or only its shape? |
| A2 judgement fidelity | does an accepted disposition mean a real overlap judgement (never screen a real overlap, never map a non-overlap)? |
| A3 provenance | does every counted row name both sides with a **fresh** declaration/ruling that refers to *this* boundary? |
| A4 candidate integrity | is the frozen 67 the real overlap surface, and is each candidate anchored on the right line? |
| A5 tamper resistance | counter/gate bytes, refs, reachability, surface identity |
| A6 ledger honesty | are findings surfaced, and can they be ignored? |

## 2. Constructions and their scores (frozen counter, `--json`)

Scored with `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev <rev> --repo <scratch-clone> --fleet /home/vgpnk/Projects/shokunin --json`; every other input is the frozen baseline. Receipts in `receipts/`, drivers in `drivers/`.

| ref | construction | key numbers | exit |
|---|---|---|---|
| J1–J5 | frozen baseline controls (`baseline/controls-summary.json`) | all fail only on `newMapped` (J2 reaches `unaccounted=0` by screening all) | 1 |
| **K1** | junk line at `SKILL.md` EOF (no Round-34 section) + 3 `refused-route` rows with surfaces `r34-junk-0..2` + 63 `not-browser-sense` screens | `cand=67 mapped=4 screened=63 unaccounted=0 newMapped=3 adjacency=clean rows=16 verified=16` | **0** |
| **K1b** | K1 + one padded screen row with reason `bogus-reason` | same, plus `screenFindings=[{row:65,reason:"screen-reason-unknown"}]` — still met | **0** |
| **K2** | K1 but the declaration lives in a **new** `corpus/r34-junk-decl.md:1`; `SKILL.md` untouched | `newMapped=3 adjacency=clean` | **0** |
| **K3b** | three one-character-edited copies of existing `SKILL.md` lines as declarations | `newMapped=3 adjacency=clean` | **0** |
| K3 | same construction with only two qualifying lanes | `newMapped=2` | 1 |
| **K4** | `same-surface` screen for a kake CWV candidate pointing at `crawler-discipline-vs-publishing` (an unrelated boundary) | `unaccounted=0 adjacency=clean` | **0** |
| **K6** | 3 `refused-route` rows on set-B leads whose sibling lines never name tabi; one declaration line naming six siblings | `newMapped=3 adjacency=clean`; per-row `sibling_quote names tabi? False` | **0** |
| **K7** | declarations are old tabi lines copied verbatim out of other `.md` files into `SKILL.md` | `newMapped=3 adjacency=clean` | **0** |
| K5 | `contested-open` with `fleet@…:.ufo/l0-questions.md:99999` | `adjacency=failed`, `finding row=15 reason=l0_line_absent` | 1 |
| K8 | `ruled` rows citing stale spotcheck lines | row 15 (kaidoku ← `round-16-verifier-spotcheck.md:132`) **verified and counted**; round-17 self-rulings failed `ruling_unresolved … has no resolvable author` | 1 |

Pasted counter lines (from `receipts/*.summary.json`, `receipts/K5-gate.txt`, `receipts/K8-gate.txt`):

```
K1-eof-junk-decl        pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K1b-padded-screen       pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 sf=1 exit=0
K2-new-junk-file        pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K3b-neardup-predicate   pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K4-same-surface-mismatch pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K6-setB-refused-route   pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K7-moved-declaration    pred=True cand=67 mapped=4 scr=63 un=0 new=3 adj=clean rows=16 ver=16 exit=0
K5-contested-no-l0      pred=False mapped=1 scr=65 un=1 new=0 adj=failed rows=14 ver=13 exit=1
K8-stale-ruling         pred=False mapped=2 scr=63 un=2 new=1 adj=failed rows=16 ver=14 exit=1
ADJACENCY verdict=failed rows=14 verified=13
finding row=15 reason=l0_line_absent detail=l0 .ufo/l0-questions.md:99999 line 99999 absent (lines=178) at 34703e82…
```

The K1 declaration, verbatim, at the evaluated rev `469887316bc5cfbc5a09e820e6093bda7440d5c1` (last line of `SKILL.md`, `grep -n '^## Round 34' SKILL.md` → no match):

```
Round-34 scratch note (junk): kama, kake, kotoba and mori keep their own browser ground.
```

and the three counted rows (`git show 4698873:corpus/adjacency.tsv | sed -n '15,17p'`):

```
r34-junk-0  kake    kake-shokunin@044048…:SKILL.md:408  <5-word window of that line>   SKILL.md:2916  kama, kake, kotoba and mori keep their own browser ground  refused-route  -  <same>
r34-junk-1  kotoba  kotoba-shokunin@65a5c7…:corpus/knowledge/sibling-overlap-census-round49.md:86  …
r34-junk-2  mori    mori-shokunin@aa3af1…:corpus/knowledge/roster-truth-r12.md:9  …
```

## 3. Per-hole verdicts

### H1 — a "declaration" need not be a declaration, and need not be in the required section
`tabiDeclaration` (`counters/c1-adjacency-sweep-v2.mjs:260-268`) accepts any `<path>:<line>` at `REV` whose trimmed text is absent from **that same file** at baseline, then `:275` only checks `decl.text.includes(r.tabiQuote)` and `sibTok.test(r.tabiQuote)`. There is no section check, no `SKILL.md` requirement, no sentence requirement. One line naming four (K1) or six (K6) sibling tokens serves an unbounded number of rows.
**Counterexample:** K1 (`newMapped=3`, exit 0) and K2 (declaration in a brand-new `corpus/r34-junk-decl.md:1`, `SKILL.md` byte-identical to baseline, exit 0).
**Verdict:** predicate-satisfiable — **critical**. The round-34 section requirement in the item is enforced by nothing.
**Smallest safe correction:** require `tabi_ref` path `== 'SKILL.md'`, and require the cited line to sit under the literal heading `## Round 34 — sibling-overlap declarations (outside PROVINCE)` (scan upward to the nearest `^## ` heading); require `goodQuote(tabiQuote)` and require the quote to contain exactly one lane token from `PINS`.

### H2 — `refused-route` needs no sibling-side naming and no refusal
`:276` returns `true` for `refused-route` after only the tabi-side token test; the gate treats `refused-route` as "no ruling ref" (`scripts/check-adjacency.mjs` header: "split-declared / refused-route: `-`"). Nothing binds the disposition to the mapped boundary.
**Counterexample:** K6 — three set-B leads whose cited sibling lines contain no `tabi` at all (`sibling_quote names tabi? False`), tabi declaration = the six-name junk line; predicate met, gate clean.
**Verdict:** predicate-satisfiable — **critical**.
**Smallest safe correction:** require `/\\btabi\\b/i.test(r.siblingQuote)` for `refused-route` as for `split-declared` (mutual naming), i.e. drop the `refused-route` fast path at `:276`.

### H3 — the screening ledger is honour-system (real overlaps screened away)
`:237-249` accepts any `SCREEN_REASONS` value with a 4-word in-line quote; `not-browser-sense` is never cross-checked against any frozen evidence. At baseline 66 candidates are unaccounted, and K1 screens 63 of them `not-browser-sense` and is accepted — including **35 set-A lines that name tabi** by the counter's own definition, and **24 of the 28 set-B candidates whose anchored lead row the frozen round-33 scan labels `real_overlap=yes`** (`leads.tsv` column 5; anchored-key join reproduced in the driver).
**Counterexample:** K1. Also the frozen J2 control already shows `unaccounted=0` from screens alone.
**Verdict:** predicate-satisfiable — **high** (the item's "never screen a real overlap" is unenforced).
**Smallest safe correction:** mechanically reject `not-browser-sense` for (a) set-B candidates whose anchored lead has `real_overlap=yes`, and (b) set-A candidates (the line names tabi); keep the reason vocabulary for the rest, and count screens separately in `newMapped` gating.

### H4 — "new" is per-file string absence
`:267` builds the baseline line set **keyed by path only**; `:268` sets `isNew = !set.has(text.trim())`. Hence (a) an old line copied from `PROVINCE.md`/`corpus/lessons/*.md` into `SKILL.md` is "new" (K7, exit 0), and (b) an existing `SKILL.md` line with one character changed is "new" (K3b, exit 0).
**Counterexample:** K3b (`newMapped=3`), K7 (`newMapped=3`), both `adjacency=clean`.
**Verdict:** predicate-satisfiable — **high**.
**Smallest safe correction:** compare against the union of all tabi `*.md` files at baseline, and refuse a declaration whose normalised text is within edit distance 1 of any baseline line.

### H5 — `same-surface` screens are name-only
`:245-246` requires only that some verified row of the same sibling carries that surface *name* (`verifiedSurfaces`, `:234`); it never checks the boundary. A genuinely different boundary can be screened `same-surface` against any existing surface of that sibling.
**Counterexample:** K4 — kake `corpus/knowledge/field-performance-cwv.md:153` (CWV/browser measurement) screened `same-surface` → surface `crawler-discipline-vs-publishing`; `unaccounted=0`, gate clean, exit 0.
**Verdict:** predicate-satisfiable — **medium-high**.
**Smallest safe correction:** require that row's `siblingQuote` to share a 4-word window with the screened candidate line (same subject), not merely its surface name.

### H6 — newness is a surface *string*, not a boundary
`baseKeys` (`:215`) and `:271` fold `(surface, sibling)` strings; any new spelling — or `r34-junk-0` — is "new". The item's rule "count boundaries, not surface strings" is inverted in both directions: arbitrary names count as new rows (K1/K2/K3b/K4/K6/K7 all use invented surfaces), and restatements are separately countable at will.
**Verdict:** predicate-satisfiable — **high**; **smallest safe correction:** require the new row's `tabiQuote` to differ by ≥4 words from every baseline row's `tabiQuote` for that sibling (block respellings), and require `surface` to be absent from a closed surface vocabulary only for genuinely new boundaries.

### H7 — `screenFindings` never touch the predicate
`:280-295`: findings are printed (`:291`) but `out.predicate` (`:295`) uses only `gate.verdict`, `unaccounted`, `newMapped`.
**Counterexample:** K1b — a padded row with reason `bogus-reason` produces `{row:65, reason:"screen-reason-unknown"}` and the predicate is still met (exit 0).
**Verdict:** predicate-satisfiable — **medium** (a padded/contradictory ledger is invisible in the verdict).
**Smallest safe correction:** add `&& out.screenFindings.length === 0` at `:295`.

### H8 — `ruled` can cite a ruling that does not address the boundary
The gate checks only that a self-venue ruling line is authored by someone else and that its quote names the sibling; nothing ties the ruling to the mapped line or to round 34.
**Counterexample:** K8 row 15 — kaidoku `SKILL.md:55` mapped with a round-16 spotcheck line (`corpus/lessons/round-16-verifier-spotcheck.md:132`, "adjacency | unchanged | kaidoku overlap reported…"); the row is verified and counted `newMapped`. (The two round-17 rows failed for an unrelated reason: `ruling_unresolved … has no resolvable author`.)
**Verdict:** predicate-satisfiable — **medium** (false provenance: an old ruling authenticates a new boundary).
**Smallest safe correction:** require `ruling_ref`'s commit to be an ancestor authored this round (or at least a round-N spotcheck with N ≥ the round that touched the candidate line), and require the ruling quote to name the candidate's file or surface.

### H9 — `contested-open` is properly gated
`contested-open` requires `fleet@<commit>:.ufo/l0-questions.md:<line>` naming a `tabi | round-<N> |` row that names the sibling, and the gate resolves it.
**Counterexample attempt:** K5 → `finding row=15 reason=l0_line_absent`; predicate not met.
**Verdict:** **blocked-by-counter** (`scripts/check-adjacency.mjs` `l0_line_absent`). No change needed; this is the only disposition with a real external anchor.

### H10 — lead re-anchoring: wrong-line anchors and silent drops
`candidates()` `:152-159`: `order = [cited, ±1, ±2]`; exact `includes(quote)` first over the whole window, then a **4-word window** fallback, then `continue` (`:159`) with the lead pushed to `leadsUnresolved` — which affects nothing.
Measured on the frozen set: `leadsReanchored = ['corpus/knowledge/mirror-pitfalls.md:39@044048… -> 40']`, and it is **correct** (line 39 at that pin is blank; the quote is on line 40), `leadsUnresolved = []`.
Probe on a byte-identical copy with **only** `LEADS`/`BASELINE` constants changed (`drivers/counter-patched-probe.mjs`, `diff` shows exactly 2 lines; `sha256 4bb741…`): a real audio lead at `corpus/knowledge/2026-10-12-threshold-calibration.md:8` with a one-word quote drift anchors to the **decoy** line 9 (a different metric row) instead of the true line 10 — `leadsReanchored … 8 -> 9`, `ANCHORED_AT_DECOY=True`. A real lead whose quote straddles a line wrap (`corpus/knowledge/2026-10-12-fixture-battery.md:5`) has no 4-word run on any line within ±2 → `WRAP_LEAD_DROPPED: True`, and the candidate disappears with no penalty. 4-word runs are near-universal in these corpora (5 647 adjacent line pairs sharing one, measured over the candidate-scope files), so the fallback is not discriminating.
**Verdict:** **blocked-by-counter** for this round's frozen leads (0 unresolved, 1 correct re-anchor); **needs-wave-2-guard** for any future leads file — wrong-line anchor + silent drop are both reachable.
**Smallest safe correction:** remove the 4-word tier (accept exact only, optionally after whitespace normalisation), and count `leadsUnresolved` as unaccounted so a dropped lead fails the predicate.

### H11 — candidate-set blind spots
Set A = sibling `SKILL.md` + `corpus/knowledge/**.md` only (`:132`); set B = the frozen round-33 leads. Case is not a blind spot (`/i` matches `Tabi`/`TABI`); there are no `tabi_shokunin` occurrences and no `\t`-escape false positives among the 67 (checked). What is invisible: **697 non-`.ufo` sibling lines that name tabi** at the pins, of which
* **55** sit in `kake-shokunin/corpus/knowledge/accessibility-review-cards.json` — only line 8 is visible (as a set-B lead); the other 54 are identical semantic lines ("… tabi owns …") and are out of scope,
* `kake corpus/handoffs/accessibility-preparation.md:5` ("**tabi**, only after the operator names the target, scope and authorizes that"), `kake corpus/README.md:131` ("…leaves anything that executes a browser to tabi"),
* `corpus/lessons/*.md`, `LOG.md`, `SCORECARD.md`, `plans/*.md`, `tools/*.py` across 14 lanes (souji 569, kake 66, mori 15, kotoba 10, kotodama 8, tsukuroi 7, kaidoku 6, kumitate 5, tameshi 3, game-dev-3d 2, kengaku 2, revenger 2, kasegi 1, mado 1).
**Verdict:** **needs-wave-2-guard** — **medium**: "unaccounted = 0" certifies 67 lines, not the overlap surface; the claim's 67 is a lower bound (many of the 697 are routing/lessons lines, but the `.json` and `handoffs/` ones are substantive).
**Smallest safe correction:** widen set A to every non-`.ufo` sibling file (or at least `corpus/**/*.md`, `corpus/**/*.json`, `SCORECARD.md`), or restate the claim as scoped to those three globs.

### H12 — dedupe collapses repeated lines and duplicate text
`add()` dedupes on `(lane, path, text.trim())` (`:126-127`), so a file of 55 identical `publisherCheck` lines would yield one candidate; and a set-B lead anchored onto a line whose text duplicates a set-A candidate is silently absorbed.
**Verdict:** needs-wave-2-guard — **low**; **smallest safe correction:** include the line number in the dedupe key and report collapsed duplicates in the output.

## 4. Impacted axes

* **A1 work-required — fails.** K1/K2/K6 reach the predicate with no judgement.
* **A2 judgement fidelity — fails.** H3, H5 (screen anything; point at any surface).
* **A3 provenance — fails.** H1, H4, H8 (junk, moved, near-duplicate declarations; stale rulings).
* **A4 candidate integrity — fails partially.** H10 (anchoring), H11 (scope), H12 (dedupe).
* **A5 tamper resistance — holds.** Gate bytes (`ADJ_GATE_SHA256`), refs, reachability, `GIT_NO_REPLACE_OBJECTS`, surface charset, `duplicate_row` all behaved; every junk row still had to satisfy the gate.
* **A6 ledger honesty — fails.** H7 (findings ignored).

The predicate's only real teeth are the gate's structural checks (refs, quotes, duplicate pins, `l0_line_absent`, self-venue author). Every semantic clause of the item ("under a `## Round 34` section of `SKILL.md`", "declaration names the sibling", "refused-route", "never screen a real overlap", "count boundaries") is unenforced.

## 5. Deliverable paths (relative to the lane root)

* report: `.ufo/waves/round-34/w1/CritC1Counter.md`
* receipts: `.ufo/waves/round-34/w1/CritC1Counter/receipts/` — `K1-eof-junk-decl.{json,stderr,summary.json}`, `K1b-padded-screen.*`, `K2-new-junk-file.*`, `K3-near-duplicate-decl.*`, `K3b-neardup-predicate.*`, `K4-same-surface-mismatch.*`, `K5-contested-no-l0.*`, `K5-gate.txt`, `K6-setB-refused-route.*`, `K7-moved-declaration.json`, `K8-stale-ruling.json`, `K8-gate.txt`, `reanchor-probe.json`, `probe-list-candidates.tsv`, `blindspots-scoped.json`, `blindspots-fast.json`, `revs.json`
* drivers: `.ufo/waves/round-34/w1/CritC1Counter/drivers/` — `attack.py` (K1/K1b/K2/K3/K4/K5), `attack2.py` (K3b/K1/K6/K5 gate detail), `attack3.py` (K7), `attack4.py` (K6 rebuild), `reanchor.py` (H10 probe), `counter-patched-probe.mjs` (2-line probe copy; sha256 `4bb74136c6d8d98a19892884db9d77c2ae2a125941656ffd9744e064f8b49178`)

## 6. Commands and exit codes

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone            # 0
$ git -C $S/clone checkout -q --detach 15dfaccb34601c2d221c78501e2befd8998d600c         # 0
$ test "$(git -C $S/clone rev-parse --show-toplevel)" = "$S/clone"                      # 0  (TOPLEVEL_OK)
$ TMPDIR=$S/tmp python3 attack.py                                                       # 0  (K1,K1b,K2,K3,K4,K5 receipts)
$ TMPDIR=$S/tmp python3 attack2.py                                                      # 0  (K3b,K1,K6,K5+gate)
$ TMPDIR=$S/tmp python3 attack3.py                                                      # 0  (K7)
$ TMPDIR=$S/tmp python3 attack4.py                                                      # 0  (K6 rebuild)
$ TMPDIR=$S/tmp python3 reanchor.py                                                     # 0  (H10 probe)
$ node <counter> --rev <rev> --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
    K1 0 · K1b 0 · K2 0 · K3b 0 · K4 0 · K6 0 · K7 0 · K3 1 · K5 1 · K8 1
$ scripts/check-adjacency.mjs --at <K5 rev> --repo $S/clone --fleet … | exit 1          # l0_line_absent
$ scripts/check-adjacency.mjs --at <K8 rev> --repo $S/clone --fleet … | exit 1          # ruling_unresolved ×2
```

Honesty notes: every score above is a frozen-counter run except the H10 probe, which is explicitly a **2-constant copy** of the frozen counter (diff pasted; the probe result is labelled as primitive behaviour, not as a frozen-counter verdict on this round's leads). No network fetches, no browser launch, no tool installs this seat. Scratch `/fast/scratch/hyaku/tabi-r34/CritC1Counter` removed after receipts were copied.
