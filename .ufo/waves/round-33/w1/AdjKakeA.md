# AdjKakeA — C1 build: kake disposition drafts (:22, :23, :60, :61, :72, :79)

**Verdict.** One real overlap and five screens, all grounded in the frozen bytes and all verifying: kake:61 declares a surface split that the existing `crawler-discipline-vs-publishing` row does not cover — kake keeps the JS-rendered-canonical frontier open while assigning browser execution to tabi, and tabi owns dynamic-page evidence (PROVINCE.md:12) while refusing publishing (PROVINCE.md:16) — so it becomes one NEW `split-declared` map row; kake:22, :23 and :60 restate surfaces already held by verified rows and are screened `same-surface`, kake:72 is screened `not-browser-sense` (the regex hit is the project token `burnerchrome` inside a local-checkout presence claim that disclaims browser-profile authority), and kake:79 is screened `no-claim-declared` (kake states it evaluates no accessibility and refers browser/AT execution out). At the validation commit the gate is `clean` (rows 11, verified 11, findings 0) and the frozen C1 counter accepts the row and all five screens (`screenFindings: []`, `newMapped: 1`, all six of my candidates `accounted`); the fleet predicate stays false only because the other 41 candidates belong to sibling seats.

## Commands and outcomes (scratch clone at the freeze commit)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea  # exit 0; HEAD=e6b0a907...
git -C "$S/clone" rev-parse --show-toplevel                                       # = "$S/clone" (toplevel_ok)
sha256sum "$S/clone/scripts/check-adjacency.mjs"
  # 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac  (frozen digest, matches)
git -C kake-shokunin rev-parse --verify refs/heads/master
  # 044048597d62f3199494b63b36e90dd57825e350 (the frozen candidate pin is the kake tip)
git -C kake-shokunin merge-base --is-ancestor 044048... refs/heads/master          # exit 0
```

Quote checks against the frozen bytes — `git show 044048...:PROVINCE.md | grep -c -F -- "<quote>"` returned `1` for every one of:

| line | quote | grep -F count |
|---|---|---|
| 22 | `Crawl hygiene per host (robots.txt, sitemap scope, canonical signals)` | 1 |
| 23 | ``entry `corpus/knowledge/crawl-scope-per-host.md`; canonical/JS rendering open.`` | 1 |
| 60 | `was repaired or a Google-selected canonical observed. The broader crawl and` | 1 |
| 61 | `browser execution stays tabi's` | 1 |
| 72 | `burnerchrome, speedrun and apps-sdk subtrees are present again` | 1 |
| 79 | `No actual website accessibility is evaluated.` | 1 |

Tabi-side quotes at e6b0a90 (`git show e6b0a90...:PROVINCE.md | grep -c -F`): `dynamic-page evidence patterns (what to capture so a` → 1 (line 12); `web *publishing* (→ kake),` → 1 (line 16).

Validation commit (rows installed in the clone only):

```
cat rows.tsv >> corpus/adjacency.tsv
{ printf 'sibling_ref\treason\tsurface\tquote\tnote\n'; cat screen.tsv; } > corpus/adjacency-screen.tsv
git -C "$S/clone" -c user.name=AdjKakeA -c user.email=AdjKakeA@scratch.local commit
  # 44aac27e6bc5eb599b84c9c6f72a1c795b1efd95
node "$S/clone/scripts/check-adjacency.mjs" --at 44aac27e... --repo "$S/clone" \
     --fleet /home/vgpnk/Projects/shokunin --json                                  # exit 0
  # {"verdict":"clean","rows":11,"verified":11,"findings":[],"selfRulings":[2],"tips":{kake:"refs/heads/master",...}}
node "$S/clone/.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs" --rev 44aac27e... \
     --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json                 # exit 1 (predicate not met fleet-wide)
  # counter sha256 da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380 (frozen, matches)
  # {"predicate":false,"adjacency":{"verdict":"clean","rows":11,"verified":11,"findings":0},
  #  "candidates":52,"mapped":6,"screened":5,"unaccounted":41,"newMapped":1,
  #  "newMappedRows":[{"row":12,"surface":"a-js-rendered-canonical-vs-browser-execution","sibling":"kake","disposition":"split-declared"}],
  #  "screenFindings":[]}
```

The map now holds 11 data rows (10 baseline + my row 12 of the file) and the gate verified all 11 with zero findings; all five screen rows were accepted (`screenFindings` empty). Per-candidate accounting from `unaccountedKeys`: `:22`, `:23`, `:60`, `:61`, `:72`, `:79` all `accounted`. The 41 remaining unaccounted candidates are outside this seat's six (other kake lines and the other nineteen siblings).

## Per-candidate decisions

| candidate key | decision | reason (both sides) |
|---|---|---|
| kake@044048…:PROVINCE.md:22 | screen `same-surface` → `crawler-discipline-vs-publishing` | kake's frontier line lists robots.txt/sitemap/canonical as publisher-side crawl hygiene — exactly the kake side of the split already verified at kake:34 ("`tabi` drives browsers and owns client-side crawler discipline; kake owns / publisher-side placement"), and tabi's side is the existing PROVINCE.md:16 refusal of publishing; the line names no tabi surface beyond that split. |
| kake@044048…:PROVINCE.md:23 | screen `same-surface` → `a-js-rendered-canonical-vs-browser-execution` | The bullet's "canonical/JS rendering open" half is the frontier whose browser-execution side my :61 row splits (tabi renders, kake declares); its crawl half is the :34 split. |
| kake@044048…:PROVINCE.md:60 | screen `same-surface` → `a-js-rendered-canonical-vs-browser-execution` | First half of the sentence completed on :61; same frontier, one disposition, so the row lives on :61 and :60 is its restatement. |
| kake@044048…:PROVINCE.md:61 | **NEW map row** `a-js-rendered-canonical-vs-browser-execution`, `split-declared` | kake: "JS-rendered-canonical frontier above remains open; browser execution stays tabi's". tabi: PROVINCE.md:12 "dynamic-page evidence patterns (what to capture so a / claim about a page is re-verifiable)" is the rendered-page evidence side, and PROVINCE.md:16 "web *publishing* (→ kake)" is the other half of the split. Not the :34 crawler split: this is canonical selection under JS rendering (a rendered-DOM observation) versus the static canonical declaration kake holds (kake `corpus/knowledge/static-canonical-preflight.md`). |
| kake@044048…:PROVINCE.md:72 | screen `not-browser-sense` | The regex hit is the project token `burnerchrome` in a restored-checkout presence claim; the same line states presence "does not establish live deployment or grant publication, browser-profile, DNS or account authority" — no browser/crawl work is claimed. |
| kake@044048…:PROVINCE.md:79 | screen `no-claim-declared` | kake states "No actual website accessibility is evaluated" and refers "Browser/assistive-technology execution" out as separately authorized adjacent work — it claims nothing on tabi's browser-execution ground (:61 says that ground is tabi's). |

## Coined surface (dedupe list)

- `a-js-rendered-canonical-vs-browser-execution` (seat AdjKakeA, sibling kake, pinned at kake:61 @ 044048…). If a sibling seat (AdjKakeB/C) coins a JS-rendered-canonical surface on a different kake line, dedupe to this one and put the second line on the screen ledger as `same-surface`.

## Deliverables

- `rows.tsv` — 1 map row, 9 TAB columns, no header (fields: surface, sibling, sibling_ref, sibling_quote, tabi_ref=`PROVINCE.md:12`, tabi_quote, disposition=`split-declared`, ruling_ref=`-`, ruling_quote=`web *publishing* (→ kake),`).
- `screen.tsv` — 5 screen rows, 5 TAB columns, no header (order :22, :23, :60, :72, :79).
- `gate.json` — check-adjacency `--json` at 44aac27e (verdict clean, rows 11, verified 11, findings []).
- `counter.json` — frozen C1 counter `--json` at 44aac27e (predicate false fleet-wide; newMapped 1; screenFindings []).

## Limits / caveats

- This seat is leaf-scoped to six kake candidates; `unaccounted: 41` and `predicate: false` are expected at a single-seat commit and are not a claim about the fleet.
- The counter cannot judge overlap semantics (claims.json `feasibilityDisclosed`): my single row is `split-declared` with `sibling_quote` containing `tabi`, which satisfies the counter's naming test; the semantic weight rests on the two-sided reading above (kake keeps canonical declaration; tabi renders and refuses publishing).
- No browser was launched for this seat; nothing to kill. No tool installs were needed. Scratch dir `/fast/scratch/hyaku/tabi-r33/AdjKakeA` (clone + one validation commit) is removed after the receipts above were copied out.
- Only the scratch clone's `corpus/adjacency.tsv`, `corpus/adjacency-screen.tsv` and one commit were written; no lane tracked file, lane index, lane jj state or fleet file was touched.
