# C1 build — kake sibling-overlap dispositions (seat AdjKakeDelegations)

**Verdict.** All six assigned kake candidates (baseline rows 1, 2, 3, 5, 52, 53) are decided on the bytes: two are new, verified map rows — `live-delivery-observation` (kake `SKILL.md:408`) and `lab-performance-tool-runs` (kake `SKILL.md:697`), both `split-declared` against new tabi declaration lines at `SKILL.md:2921-2922` — and four are `same-surface` screens (kake `SKILL.md:559`, `SKILL.md:560`, `SKILL.md:161`, `corpus/knowledge/field-performance-cwv.md:153`). In my clone at commit `8ae3b1549c3829e913a907e26c5781732079f31c` (parent = freeze `59f1b47a…`), `scripts/check-adjacency.mjs` reads **clean, rows 15, verified 15** (exit 0) and the frozen counter reads `mapped 3, screened 4, unaccounted 60, newMapped 2` with **`screenFindings: []`** and both new rows listed in `newMappedRows` — exit 1 only because the fleet target (`unaccounted 0`, `newMapped ≥ 3`) belongs to the integrated wave, not to one seat (the 60 unaccounted are other lanes' and other seats' candidates; 7 of them are kake candidates outside my assignment, listed below for the L1).

## Evidence (commands, exit codes, outputs)

All runs in a `--shared` clone at `$HYAKU_SCRATCH/tabi-r34/AdjKakeDelegations/clone` (= `/fast/scratch/hyaku/…`, `TMPDIR` under the same scratch), now removed.

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          rc 0
git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee    rc 0
git -C "$S/clone" rev-parse HEAD   -> 59f1b47aae277e1670e4a824173da8cde7e388ee
```

Applied changes (receipts `applied.patch`, `commit.txt`):

* `SKILL.md` appended at the end (line 2916 blank + section 2917-2922): `## Round 34 — sibling-overlap declarations (outside PROVINCE)`, one framing line, two declaration bullets at **lines 2921 and 2922**. No existing prose byte edited (`diff --numstat` = `7 0 SKILL.md`).
* `corpus/adjacency.tsv`: rows 15-16 appended (`2 0`).
* `corpus/adjacency-screen-skill.tsv`: new file, header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note` + 4 rows (`5 0`).

```
git -C "$S/clone" -c user.name=AdjKakeDelegations -c user.email=AdjKakeDelegations@scratch.local \
  add SKILL.md corpus/adjacency.tsv corpus/adjacency-screen-skill.tsv && commit -q -m "r34 w1 …"   rc 0
REV=8ae3b1549c3829e913a907e26c5781732079f31c   (parent 59f1b47aae277e1670e4a824173da8cde7e388ee)

node "$S/clone/scripts/check-adjacency.mjs" --at "$REV" --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                                     rc 0
  {"verdict":"clean","rows":15,"verified":15,"selfRulings":[2],"findings":[] }     (adjacency.json)

node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
  --rev "$REV" --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json        rc 1 (evaluated; predicate not met)
  predicate false · adjacency clean 15/15 · candidates 67 (A 38, B 29) · mapped 3 · screened 4
  · unaccounted 60 · newMapped 2 · screenFindings [] · leadsUnresolved []
  newMappedRows = [{row 15, live-delivery-observation, kake, split-declared},
                   {row 16, lab-performance-tool-runs, kake, split-declared}]
```

Quote verification (receipt `quote-checks.txt`): every sibling quote greps `-F` exactly once against `git -C kake-shokunin show 044048597d…:<path>`; every tabi quote and every split `ruling_quote` greps `-F` once in the clone `SKILL.md` and a node check confirmed the exact line index (`onLine=true` for 408, 697, 559, 560, 161, cwv:153; and for 2921/2922), all 4-25 words with ≥ 20 non-space chars.

No-harm (receipt `noharm.txt`): `git diff --numstat 59f1b47..8ae3b15` shows only `7 0 SKILL.md`, `2 0 corpus/adjacency.tsv`, `5 0 corpus/adjacency-screen-skill.tsv` — **0 deletions** on every protected prose path (`SCORECARD.md`, `LOG.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`, `corpus/adjacency-screen.tsv` untouched); `scripts/check-adjacency.mjs` at REV hashes `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`, equal to the frozen digest.

## Per-candidate decisions

| candidate | decision | reason grounded in both sides |
|---|---|---|
| kake `SKILL.md:408` (row 1) | **map row 15** `live-delivery-observation`, split-declared | kake's offline canonical audit cannot establish "Google-selected canonical, HTTP headers, redirects, content duplication or JS state" and routes "browser work to tabi"; tabi measures those delivery facts on the wire — hop chain / same-origin-only `redirectCount` (`SKILL.md:327`) and raw status line + header bytes (`SKILL.md:374`) — a delivery-fact boundary the rendered-DOM `js-rendering-browser-execution` row (row 9) does not name. |
| kake `SKILL.md:559` (row 2) | **screen** `same-surface` = `accessibility-browser-at-execution` | "The operator authorizes a named property/build/process scope; tabi receives" is a scope condition on the split already mapped on kake `PROVINCE.md:79` (row 13) and already restated in tabi's round-33 declaration at `SKILL.md:2889`; no second boundary. |
| kake `SKILL.md:560` (row 53) | **screen** `same-surface` = `accessibility-browser-at-execution` | completes :559 (AT evaluation → tabi, credential custody → kagi, publishing → operator): same mapped split plus kagi's refused secrets surface (`PROVINCE.md:16-17`); tabi's AT execution stays a frontier route, not a held surface (`SKILL.md:2889`). |
| kake `SKILL.md:697` (row 3) | **map row 16** `lab-performance-tool-runs`, split-declared | kake keeps the Core Web Vitals verdict/thresholds and assigns the run — "Running the tool is tabi's work"; tabi runs browsers under its session/evidence rules (`PROVINCE.md:3-4,9-13`; `SKILL.md:28-35`), and the declaration says outright that no Lighthouse run is yet a measured tabi surface (only mention of Lighthouse in the corpus is S002's rejected-rule quote that it is a supported CDP consumer, `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:93`). |
| kake `corpus/knowledge/field-performance-cwv.md:153` (row 5) | **screen** `same-surface` = `lab-performance-tool-runs` | the line is the wrap of the sentence begun at :152 ("Running lab tools such as Lighthouse or DevTools is browser work and routes to tabi") — the boundary mapped this round on `:697`; its CrUX-key clause is credential ground already refused (`PROVINCE.md:16-17`). |
| kake `SKILL.md:161` (row 52) | **screen** `same-surface` = `musketeer-cdp-9222-profile-lease` | names the-musketeer profile and CDP `127.0.0.1:9222`, the lease boundary already mapped contested for kake (`PROVINCE.md:35`, row 7) and answered by tabi's fresh-throwaway-profile rule (`SKILL.md:556`); kake's serialization rule adds no boundary and the ownership question is the open L0 one. |

No candidate in this seat needed a `contested-open` row, so `l0.txt` carries none (only the L1 files L0 lines).

## Disclosed attack surface (for w2)

1. **`live-delivery-observation` may be argued as a re-key.** kake's `PROVINCE.md:303` ("does not observe live fetches, redirects, caching") is screened on `robots-txt-publisher-audit-vs-client-obedience`, and row 9 maps "browser execution stays tabi's". My defence is that :408 is a *positive route* over a fact list (headers, redirect chains, JS state) that tabi's wire rung measures and neither mapped row names; a critic who reads it as the same "browser work is tabi's" sentence should file it as a withdrawn row, not a screened one.
2. **`lab-performance-tool-runs` claims no measured capability.** The declaration bounds tabi's side to "browser work … under its session and evidence rules" and states the missing measurement; if the wave judges that tabi cannot hold the surface at all, the honest repair is a refused-route framing, not a wider claim.
3. The 559/560 screens lean on the round-33 correction at `SKILL.md:2889` (AT execution is a frontier route); the map row 13 itself still says "browser and assistive-technology execution … is tabi's", so the map and the correction differ in strength — already recorded by round 33, not repaired here (append-only prose).

**Unassigned kake candidates left unaccounted at my REV** (for the L1's remaining-seat routing): `corpus/knowledge/accessibility-review-packet.md:121`, `:122`, `corpus/knowledge/accessibility-review-cards.json:8`, `corpus/knowledge/js-rendering-queue.md:77`, `corpus/knowledge/static-canonical-preflight.md:134`, `corpus/knowledge/mirror-pitfalls.md:40`, `corpus/knowledge/fire-journal-codes.md:27`.

## Out of scope / untouched

Lane worktree, lane git index, lane jj state, fleet repo (incl. `.ufo/l0-questions.md`), sibling repos, `corpus/adjacency-screen.tsv`, `scripts/check-adjacency.mjs`, `PROVINCE.md`. No lane script run outside the clone. No browser launched, no network fetch, no subagent, no tool install/upgrade. Scratch dir `/fast/scratch/hyaku/tabi-r34/AdjKakeDelegations` removed after receipts were copied (`ls` → "No such file or directory", rc 2).

## Deliverables

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/AdjKakeDelegations/`:
`rows.tsv` (2 map rows, 9 TAB columns, `SKILL.md:DECL1/DECL2` placeholders) · `decl.md` (DECL1 = line 2921, DECL2 = line 2922, with the tabi ground each rests on) · `screen.tsv` (4 rows, 5 TAB columns, no header) · `l0.txt` (none) · `decisions.tsv` (per-candidate table) · `adjacency.json` · `counter.json` · `counter-summary.json` · `noharm.txt` · `quote-checks.txt` · `rows-real.tsv` (resolved line numbers) · `applied.patch` · `commit.txt`.
