# w2 CritReversalKumitate — attack: L1 reversal of the two kumitate map drafts

**Attacked:** the L1's screening of w1 AdjKumitate's two drafted split-declared rows — `webbridge-daemon-lifecycle`
(`kumitate-shokunin@8d557f85…:corpus/knowledge/kimi-skills-plugins.md:250`) and `host-probe-census-records`
(`…:kimi-skills-plugins.md:278`) — as `same-surface kimi-webbridge-plugin-internals` (map row 10), recorded at
`corpus/adjacency-screen-skill.tsv:17-18` and `corpus/lessons/round-34.md:73-75`.

## Verdict

**Both screens hold; one recorded-ground defect (severity LOW, record-only).** The strongest available counterexample
is the substrate split: the daemon binary sits at `~/.kimi-webbridge/bin/kimi-webbridge`, outside `~/.kimi-code`
entirely, and tabi's own anatomy note records "No scripts, no binaries shipped inside the plugin"
(`corpus/knowledge/webbridge-plugin-anatomy.md:30`) while the lifecycle authority lives in a separate note
(`corpus/knowledge/webbridge-daemon-disposition.md:36,161`). That counterexample **fails**: the sibling defines its own
term on line 318 at the same pin — "Plugin internals — the daemon, the browser-extension payloads and the CLI workflow
—" — and then says those "belong to `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md` (the K-block boundary
clause routes `plugins/managed/kimi-webbridge` internals to tabi)" (`:318-321`). The quoted clause is the very line map
row 10 pins, so "the daemon itself is tabi's ground" (`:250`) is a restatement of a mapped split, and QUALITY 91's
second clause ("a map row whose only sibling-side ground is a fact on the sibling's own side of an already-mapped split
is a screen, whatever its surface name") decides it. `:278` holds on the same reasoning with a narrower margin: the two
dated dumps are files at the plugin root, inside the routed path, and row 10's own sibling line carries the
census-vs-domain carve-out ("a CENSUS … not exclusive ownership of their domains"), which already resolves
count-by-kumitate against read-by-tabi; a content-scoped reading (tabi's record is `PROVINCE.md:8` browser inventory,
which row 10's `tabi_quote` at `PROVINCE.md:6` does not name) would find a boundary, so this is a **tradeoff the map's
path/ownership reading resolves**, not a defect. **The defect is the ground of the record, not the disposition:** both
reversal records cite "plugin internals row 10 already routes to tabi" plus a wave-1 seat, but row 10's sibling line
(`kumitate SCORECARD.md:1556` at `1770305f`) reads "internals route to **tabi**, the `config.toml` REA MCP spawn key to
**kaidoku**," and contains no "daemon" — the step "daemon ⇒ plugin internals" is only on `kimi-skills-plugins.md:318`,
which neither record cites, although the L1 screened `:320-321` in the same ledger two rows later.

Per line:

| candidate | L1 disposition | verdict | ground |
|---|---|---|---|
| `:250` daemon | `same-surface` row 10 | **holds** | sibling `:318` enumeration + `:320-321` K-block clause = row 10's sibling line |
| `:278` probe dumps | `same-surface` row 10 | **holds (narrow)** | dumps at the plugin root inside the routed path; row 10's sibling line states census ≠ domain ownership — tradeoff, not defect |

## Evidence

Scratch clone `/fast/scratch/hyaku/tabi-r34/CritReversalKumitate/clone`, `git clone --shared` then
`git checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` (exit 0); `rev-parse HEAD` → `04f9623dde8ad35d470cecf766e421eafbcb47fa`;
`rev-parse --show-toplevel` → the clone dir. `TMPDIR=/fast/scratch/hyaku/tabi-r34/CritReversalKumitate/tmp`.

Pinned bytes equal the freeze:

```
$ sha256sum .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs            # exit 0
0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e   (= claims.json frozenDigests)
$ sha256sum scripts/check-adjacency.mjs                                       # exit 0
4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac   (= claims.json pin)
```

Independent whole-wave reading at the integration rev (my own run, not the L1's receipt):

```
$ TMPDIR=<scratch>/tmp node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
    --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo <clone> \
    --fleet /home/vgpnk/Projects/shokunin --json
exit 0   predicate true  candidates 67  mapped 5  screened 62  unaccounted 0  newMapped 4
newMappedRows = 15 live-delivery-observation/kake, 16 lab-performance-tool-runs/kake,
                17 agent-facing-tool-text-craft/kotoba, 18 authenticated-consequential-driving/kasegi
screenFindings []   adjacency {verdict clean, rows 17, verified 17, findings 0}
                                   # full bytes: CritReversalKumitate/c1-counter-at-04f9623.json

$ TMPDIR=<scratch>/tmp node scripts/check-adjacency.mjs --at 04f9623… --repo <clone> \
    --fleet /home/vgpnk/Projects/shokunin --json
exit 0   {"verdict":"clean","rows":17,"verified":17,"selfRulings":[2], …}
                                   # full bytes: CritReversalKumitate/check-adjacency-at-04f9623.json
```

So the reversal itself is **not load-bearing**: screening `:250`/`:278` lowers `newMapped` from a hypothetical 6 to 4;
the target is 3. (Margin note, not this seat's item: the target's remaining margin is one row, and the seat-flagged
contested row is 15 — `corpus/lessons/round-34.md:76` — which is not a kumitate row.)

The decisive sibling bytes, read at the candidate pin (`git -C kumitate-shokunin show 8d557f85…:corpus/knowledge/kimi-skills-plugins.md`;
`git merge-base --is-ancestor 8d557f85… refs/heads/master` exit 0):

- `:248-250` — "outside `~/.kimi-code` the daemon binary `~/.kimi-webbridge/bin/kimi-webbridge` carries the same
  `2.0.26` string … the daemon itself is tabi's ground, not described here" → the counterexample's premise.
- `:318` — `Plugin internals — the daemon, the browser-extension payloads and the CLI workflow —` (13 words / 72
  non-space chars, verbatim, single line).
- `:319-321` — "are out of this note's scope; they belong to `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md`
  (the K-block boundary clause routes `plugins/managed/kimi-webbridge` internals to tabi)" → the same clause row 10
  pins, applied by the sibling to the daemon.
- `:271-278` — the two trees' comparison table; the dumped-file row is "5 (incl. `…/kimi.plugin.json` + two dated
  host-probe dumps (a chromium process table and a memory snapshot, as tabi records them at
  `tabi-shokunin/SKILL.md:1421-1424`) at the plugin root)" → the dumps are *at the plugin root*, i.e. inside the routed
  path, unlike the daemon binary.

Map row 10 (`corpus/adjacency.tsv:10` at the integration rev, full row in
`CritReversalKumitate/map-row-10.tsv`): `kimi-webbridge-plugin-internals  kumitate
kumitate-shokunin@1770305f…:SCORECARD.md:1556  "internals route to **tabi**, the `config.toml` REA MCP spawn key to
**kaidoku**"  PROVINCE.md:6  "**Owns (surfaces):** the kimi-webbridge plugin"  split-declared  -  "(`~/.kimi-code/plugins/managed/kimi-webbridge/`)
as primary substrate"`. The pinned sibling line is `SCORECARD.md:1556` = "internals route to **tabi**, the `config.toml`
REA MCP spawn key to **kaidoku**," — **no "daemon", no "probe dumps"**, which is the recorded-ground defect below.

Quote validity of the two ledger rows (the frozen counter validates `text.includes(quote)`, reason vocabulary and
`surface` ∈ verified rows of the same sibling — `c1-adjacency-sweep-v2.mjs:240-249`; my run reports
`screenFindings []`, exit 0):

```
$ grep -c -F "the daemon itself is tabi's ground, not described here" <sibling bytes at pin>        → 1
$ grep -c -F 'as tabi records them at `tabi-shokunin/SKILL.md:1421-1424`' <sibling bytes at pin>    → 1
```

No orphaned declaration: the withdrawn drafts left no `kumitate` bullet in the new
`## Round 34 — sibling-overlap declarations` section (`git show 04f9623…:SKILL.md | sed -n '2905,2960p' | grep -n
kumitate` → no output), so there is no duplicate authority behind the screen. The two rows are absent from
`corpus/adjacency.tsv` (17 rows: baseline 13 + rows 15-18), so nothing is double-counted.

## Defect (severity LOW) — reversal record ground, criterion 91 first clause

- **Line evidence.** `corpus/adjacency-screen-skill.tsv:17-18` note: "the daemon and plugin-root probe dumps are plugin
  internals already routed to tabi (row 10; w1 ConnBoundaries; QUALITY 91)"; `corpus/lessons/round-34.md:73-75` repeats
  it with "(w1 ConnBoundaries)". Criterion 91 (`corpus/QUALITY.md:585-586`) requires each reversal be "record[ed] …
  with its ground on the sibling's own bytes". The cited ground is row 10, whose sibling line contains neither "daemon"
  nor the dumps; the only sibling bytes that put the daemon inside "Plugin internals" are
  `kimi-skills-plugins.md:318-321`, which are cited nowhere in the reversal record — even though the L1 screened
  `:320-321` in the same ledger rows 19-20 for exactly that clause. Consequence: an auditor cannot verify the daemon
  step of the reversal from the record's own ground; the step is currently an inference.
- **Not a disposition defect.** The disposition is right on the sibling's own taxonomy; w1 AdjKumitate's contrary
  reading (`webbridge-daemon-lifecycle`) is the better counterexample only if the daemon's path outside `~/.kimi-code`
  governs over the sibling's explicit enumeration of "the daemon" under "Plugin internals".
- **Smallest safe correction** (append-only; the integrator's call): add the sibling line to the two ledger notes and to
  the lesson bullet — quote `kimi-skills-plugins.md:318` verbatim ("Plugin internals — the daemon, the
  browser-extension payloads and the CLI workflow —", 13 words / 72 non-space chars) and state that the same sentence's
  `:320` cites the K-block clause row 10 pins. For `:278`, state the reading explicitly: the dumps sit at the plugin
  root inside the routed path, and row 10's sibling line's "not exclusive ownership of their domains" is the ground for
  count-by-kumitate vs read-by-tabi; tabi's content record (`PROVINCE.md:8`) is not the surface being mapped, so the
  row is not a new boundary. No gate or counter change is needed (the `note` column is free text;
  `screenFindings` stays empty).
- **Observation, not the L1's defect.** The sibling routes the daemon to `webbridge-plugin-anatomy.md` (`:320`), but that
  tabi note records only presence ("Daemon endpoint **not called** (presence check only)") and an empty plugin
  (`:30`); the lifecycle authority is `webbridge-daemon-disposition.md`. The sibling's citation target is approximate
  while the ownership routing is exact — this strengthens, not weakens, the "already routed" reading.

## What this seat did not do

Read-only work in a scratch clone; no lane file, lane index, fleet file or sibling repo was modified; no subagents; no
`agent://all`; no network fetch; no browser launched; no tool installed or upgraded.
