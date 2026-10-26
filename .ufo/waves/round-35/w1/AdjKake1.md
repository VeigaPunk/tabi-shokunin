# C1 build — AdjKake1 (17 kake candidate lines)

**Verdict.** All 17 kake lines in `.ufo/waves/round-35/w1-chunks/AdjKake1.tsv` are dispositioned as **screen rows in the new ledger `corpus/adjacency-screen-browser.tsv`, and this chunk contributes no map row**: 15 are `not-browser-sense` (the frozen BG match is a published-site name, a source-directory name, a registry row name or a CrUX audience class — `burnerchrome*`, `kimi-webbridge` aside), 2 are `same-surface` on surfaces kake rows already own for this same sibling (`musketeer-cdp-9222-profile-lease`, `lab-performance-tool-runs`), and 1 is `no-claim-declared` (`kimi-webbridge`). No line in the chunk reaches step 5 of the decision rule (`SKILL.md:2861-2881`): none states kake's own/refused/routed/leased/shared/contested side of a tabi PROVINCE surface, and only `SKILL.md:160` even carries a SIDE word. The frozen counter at my scratch commit reads `adjacency verdict=clean rows=16 verified=16 findings=0`, `screenFindings []`, `screened 17`, my 17 keys absent from `unaccountedKeys`, `newMapped 0`, `predicate false` — expected at a single-seat rev, because the remaining 366 unaccounted keys belong to the other chunk seats and because no kake line here can truthfully carry a new row. **Blocker for the lane target, not for this seat: C1's `newMapped >= 2` cannot come from the kake chunk; it must come from the kaidoku/kumitate/kagi chunks.**

## Evidence (commands and exit codes)

Reads (all at the frozen pins; kake pin `044048597d62f3199494b63b36e90dd57825e350`):

```
git -C kake-shokunin show 0440485…:PROVINCE.md | cat -n            # exit 0 — publisher-side domain; :35 musketeer lease contested; :61 "browser execution stays tabi's"
git -C kake-shokunin show 0440485…:SKILL.md | sed -n '<L-8>,<L+8>p'   # exit 0 — for lines 20,44,131,160,367,424,431,432,433,519,520,521,696
git -C kake-shokunin show 0440485…:corpus/knowledge/drift-detection.md  | sed -n '1,20p;43,63p'      # exit 0
git -C kake-shokunin show 0440485…:corpus/knowledge/field-performance-cwv.md | sed -n '1,20p;56,90p;124,144p'  # exit 0
```

Freeze reads used as the contract: `tabi-shokunin/.ufo/waves/round-35/claims.json` (C1 predicate, killRule, feasibilityDisclosed), `counters/c1-adjacency-sweep-v3.mjs:1-60` (candidate/mapped/screened/newMapped definitions, `BG` line 35, `SIDE` line 36, `THIRD_LANE` line 37, pins), `counters/c1-adjacency-sweep-v3.mjs:204-300` (`evaluate`: `goodQuote`, screen validation, n1-n4), `scripts/check-adjacency.mjs:1-170` (column and disposition definitions), `corpus/adjacency.tsv` (16 rows at the freeze; 17 lines with header), `corpus/QUALITY.md:545-556,585-590,670-675` (88, 91, 97), `PROVINCE.md`, `SKILL.md:2855-2890`.

Scratch clone and validation:

```
S=/fast/scratch/hyaku/tabi-r35/AdjKake1
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83  # exit 0
git -C "$S/clone" rev-parse --show-toplevel   # /fast/scratch/hyaku/tabi-r35/AdjKake1/clone (asserted before the commit)
{ printf 'sibling_ref\treason\tsurface\tquote\tnote\n'; cat "$S/screen-rows.tsv"; } > corpus/adjacency-screen-browser.tsv
git -C "$S/clone" -c user.name=AdjKake1 -c user.email=AdjKake1@scratch.local commit -q -m "round 35 scratch: AdjKake1 screen ledger (17 kake candidates)"   # exit 0
# commit c566a3242cfa52d276f7f213cdc7c7724e9786b6; git diff --numstat a4bfef0f HEAD => 18 0 corpus/adjacency-screen-browser.tsv (no other path touched)
TMPDIR="$S" node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev c566a3242cfa52d276f7f213cdc7c7724e9786b6 --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json > "$S/counter-check.json"         # exit 1 (predicate not met at this seat rev)
```

Counter result (raw in `counter-check.json`, pasted fields):

```
adjacency      verdict=clean rows=16 verified=16 findings=0   adjGateSha256=4e2c2a64…324aac (== frozen)
candidates 383  priorCandidatesSkipped 22  mapped 0  screened 17  unaccounted 366  newMapped 0
screenFindings []            newRowRefusals []            predicate false
my 17 keys in unaccountedKeys: 0     my keys: 17 (17 distinct)
```

Per-quote checks run in-cell before the commit, all passing: every screen quote is a verbatim substring of the physical line at the pin, 4-25 words, >= 20 non-space chars (`goodQuote`); `BG` matches all 17 lines; `SIDE` matches only `SKILL.md:160`, which is why no `split-declared` row is proposed anywhere in the chunk (n4 would refuse it on the other 16).

## Decisions (key suffix after `kake-shokunin@0440485…:`; full text in `decisions.md`, machine rows in `screen.tsv`)

| line | disposition | ground |
|---|---|---|
| `SKILL.md:20` | not-browser-sense | property-map row prices `https://burnerchrome.kimi.page/` and its source dir; BG matched the site's name |
| `SKILL.md:44` | not-browser-sense | `burnerchrome-com` is a url-less fleet-registry row invisible to `probe` by design |
| `SKILL.md:131` | no-claim-declared | kake records `kimi-webbridge` unsupported on this host and DOM chat automation as not a site-ops channel — a boundary, not a claim on tabi's webbridge surface; SIDE absent, so a split row could not pass n4 |
| `SKILL.md:160` | same-surface (`musketeer-cdp-9222-profile-lease`) | shared `the-musketeer` profile at CDP `127.0.0.1:9222` is exactly the surface the kake row `PROVINCE.md:35` (contested-open) already answers |
| `SKILL.md:367` | not-browser-sense | `burnerchrome/` is a source subtree listed beside `render.yaml`, `apps-sdk/` |
| `SKILL.md:424` | not-browser-sense | property-map STALE audit decided by `test -e` over local source dirs |
| `SKILL.md:431` | not-browser-sense | one public GET of kake's own page; publisher-side liveness, not execution |
| `SKILL.md:432` | not-browser-sense | correction swaps one local source path for another |
| `SKILL.md:433` | not-browser-sense | served HTML head of one published page, read as property evidence |
| `SKILL.md:519` | not-browser-sense | dated path reconciliation: `test -e` exit 0 on a source dir |
| `SKILL.md:520` | not-browser-sense | same reconciliation, repeated |
| `SKILL.md:521` | not-browser-sense | same reconciliation, repeated |
| `SKILL.md:696` | not-browser-sense | `Chromium` = CrUX audience that sends no data, not a browser this lane drives |
| `drift-detection.md:53` | not-browser-sense | `burnerchrome-kimi` is a kimi-surface `sync-check` row that matched by title+marker |
| `field-performance-cwv.md:66` | same-surface (`lab-performance-tool-runs`) | lab-tool capability fact on kake's side of the split `SKILL.md:697` "Running the tool is tabi's work" (QUALITY 91) |
| `field-performance-cwv.md:76` | not-browser-sense | browser families that send no CrUX data — eligibility, not driving |
| `field-performance-cwv.md:134` | not-browser-sense | same eligibility point, `Chromium` as audience class |

No DECL line, no `rows.tsv` row, no `l0.txt` question: `decl.md` records the empty set.

## Touched surfaces

- Wrote (product, in the scratch clone only): `corpus/adjacency-screen-browser.tsv` (new file, header + 17 rows) at `c566a32`. Nothing else in the clone changed (`diff --numstat` shows that one path only).
- Wrote (deliverables): `.ufo/waves/round-35/w1/AdjKake1/{screen.tsv, rows.tsv (empty), decl.md, l0.txt (empty), decisions.md, counter-check.json}` and this report.
- Not touched: `corpus/adjacency.tsv`, `SKILL.md`, any lane tracked file in the live checkout, the lane git index/jj state, the fleet repo, sibling repos. No browser launched (C1 seat). No tool installed or upgraded.

## Known limits / what wave 2 should attack

1. **`newMapped 0` from this chunk.** The lane target's `newMapped >= 2` must come from the kaidoku/kumitate/kagi chunks; if those chunks land only screens, C1 is an honest stop. This is a finding about the candidate population, not a repair I can make: the kake lines that mention tabi's ground do so as *facts* (site live, path present, DevTools can measure INP) or *boundaries* (webbridge unsupported), never as a side-claim.
2. **Screen semantics, not form, are the exposed edge.** 15 of 17 rest on `not-browser-sense`: rule 1's "another sense of the word". The strongest attack is `SKILL.md:20`/`:431`/`:433` (a *live Kimi-published page* — arguably tabi's `dynamic-page evidence` surface) and `:696`/`cwv:76`/`cwv:134` (real browser families). My answer is that these lines state kake property facts and CrUX audience eligibility and claim nothing tabi-side; if an attack seat shows kake asserting a side, the row moves to the map, which needs a tabi declaration naming kake and the sibling path — none exists yet for these surfaces.
3. **`SKILL.md:131` is the one judgement call recorded as such.** `SIDE` does not match the line, so the counter would refuse a `split-declared` row here (`n4-split-quote-states-no-side`); `no-claim-declared` is the honest closed-vocabulary reason even though the sentence is phrased as a platform fact ("unsupported on this Linux host").
4. **The two `same-surface` rows depend on the surface names surviving the gate.** The counter validated both (`screen-surface-unmapped` absent), and `musketeer-cdp-9222-profile-lease` is itself `contested-open` (fleet L0 `:62`) — a wave-2 seat may argue a contested row cannot "own" a surface; the alternative for `:160` would be a second map row on the same pin class, which the gate refuses as `duplicate_row` (pin `kake@PROVINCE.md:35` vs `kake@SKILL.md:160` are different pins, but the surface would fold duplicate).
5. Counter exit 1 at my rev is the expected shape for a single-chunk validation; it is **not** evidence that C1 fails. My 17 keys are accounted and `screenFindings` is empty.
