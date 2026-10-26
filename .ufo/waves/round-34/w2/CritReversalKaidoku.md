# CritReversalKaidoku — C1 wave 2: attack on the L1's three kaidoku reversals

**Verdict.** One of the three reversals holds and two are a **defect (medium)**. The reversal of
`kaidoku-shokunin@fa6a8a3f:corpus/knowledge/2026-10-13-r3-runtime-observation.md:99` **holds**: the map row it is folded into
(`cdp-runtime-observation`, `corpus/adjacency.tsv:2`) already cites a sibling line that *lists* `capture-browser-scenario`
among its own verbs (`kaidoku-shokunin@9011581d:PROVINCE.md:53`), and the row's ruling routes browser-side mechanics to tabi
(`round-16-verifier-spotcheck.md:142-143` "It cites tabi for browser-side mechanics"), so w1's `scripted-action-execution`
row would have re-declared a decided split. The seat's premise that `r2-skill-references-deep.md:72` ("never claim REA
clicked, navigated") contradicts `r3:99` is **refuted on the sibling's own bytes**: `:72`'s source is the REA reference
`runtime-observation.md:3-22`, whose scope sentence is "Observation **with these tools** is passive" (`:13-15`), while
`capture-browser-scenario` is a separate family ("Run one bounded Playwright browser scenario and return Evidence",
`cli-command-map.md:20`) — no intra-sibling contradiction exists, so it cannot ground a new boundary. The reversals of
`2026-10-14-r10-01-queue-ops.md:151` (recorded HAR) and `2026-10-14-r10-02-queue-ops-2.md:117` (screenshot pair-compare) are
**defects**: each line's own file explicitly removes the subject the screen cites — the HAR verb is "strictly offline …
never touches a live endpoint" with "No endpoint parameter exists" (`r10-01:88-89,94`), and the compare verb refuses the
evidence envelope and accepts exactly the two PNG artifact blocks (`r10-02:122-126`) — so "restates the ruled REA-provider
**CDP** boundary" is not a ground on those lines' bytes (QUALITY 91), and both objects are ones **tabi holds on its own
side with its own rule** (`SKILL.md:403` lists "a real recorded HAR (Playwright `recordHar` precedent)" as a tabi capture
channel; `SKILL.md:401` makes screenshots tabi's evidence class with environment-scoped byte stability and cross-refs
kaidoku `r10-02:130-131`, and `:437` routes "visible rendered state" to "screenshot (pixel tools for machine checks)"),
i.e. two **real overlaps were screened**, which the frozen claims forbid. The committed ledger also contradicts itself on
the point: its `r4-16-frontier-rescan.md:184` row keeps w1's note that "the comparison semantics are row 44 … separately
mapped" while row 42 (candidate 44) declares those semantics restate the same ruled surface. **Impacted axes: adjacency
(one ledger row is inconsistent, two boundaries hidden), evidence/QUALITY 91 (a reversal's recorded ground is not on the
cited bytes). No axis moves and the frozen predicate is untouched** — restoring the two rows leaves `unaccounted 0`,
`newMapped 4` and `predicate true` (probe below), so this is a disposition-accuracy defect, not a target regression.

## Per-line verdicts

### Candidate row 40 — `kaidoku@fa6a8a3f:corpus/knowledge/2026-10-13-r3-runtime-observation.md:99` — **HOLDS**

Attacked claim: that the scenario verb's `click|fill|goto` execution is a boundary the map now hides.

- The map row it is screened onto cites a sibling line that already names the verb family:
  `git -C kaidoku-shokunin show fa6a8a3f:PROVINCE.md | sed -n '53p' | grep -F -- 'capture-browser-scenario'` → rc=0;
  the same line was the row's pin at `9011581d`, so the row's subject always included the scenario verb.
- The ruling: `git -C tabi-shokunin show 5859243183:corpus/lessons/round-16-verifier-spotcheck.md | sed -n '142,143p' |
  grep -F -- 'It cites tabi for browser-side mechanics.'` → rc=0. A declared click/fill list driven through a supplied
  endpoint *is* browser-side mechanics, which the ruling routes to tabi; the line restates a ruled boundary.
- Seat's counterexample tested and refuted: `sed -n '13,15p' ~/.agents/skills/reverse-engineer-anything/references/runtime-observation.md |
  grep -F -- 'Observation with these tools is passive'` → rc=0 (passivity is scoped to `list_*`/inspect), and
  `grep -F -- 'Run one bounded Playwright browser scenario' …/references/cli-command-map.md` → rc=0 (the scenario verb is
  another family). `r2:72` and `r3:99` do not contradict each other; there is no hidden boundary behind their contrast.
- **Where the L1 is still imprecise (low, note text only):** the reversal's recorded ground is "w1 ConnBoundaries", and
  that artifact's G3 rationale states the nine lines observe "strictly as REA provider (passive; screenshots/HAR; **never
  clicks/navigates/evaluates JS**)" (`.ufo/waves/round-34/w1/ConnBoundaries/boundaries.tsv:4`). That clause is false for
  `:99` (actions = `goto|click|fill|press|select_option|check|uncheck|wait_for|wait_for_timeout`, `r3:107-108`). The
  disposition is right; the ground recorded for it is not. Cite the ruling clause and `PROVINCE.md:53` instead.

### Candidate row 42 — `kaidoku@fa6a8a3f:corpus/knowledge/2026-10-14-r10-01-queue-ops.md:151` — **DEFECT (medium)**

- Ledger line 40 (`corpus/adjacency-screen-skill.tsv:40`) screens it `same-surface cdp-runtime-observation` with the note
  "REA-driven capture restates the ruled REA-provider CDP boundary (row 2; w1 ConnBoundaries; QUALITY 91)".
- The cited line is an **admission rule of an endpoint-free verb**: `git show fa6a8a3f:…r10-01-queue-ops.md | sed -n '89p' |
  grep -F -- 'never touches a live endpoint.'` → rc=0; `:94` "No endpoint parameter exists." → rc=0; the quoted line itself
  is `"any har-schema-valid capture", which playwright's recordHar satisfies.` (7 words, verified rc=0). There is no browser
  run, endpoint or target in the line; the note's "REA-driven capture" describes a different sentence of the same file
  (`:155-158`, the Playwright `recordHar` provisioning).
- Real overlap the map now hides: tabi adopts the *same producer and the same artifact* —
  `git show 04f9623:SKILL.md | sed -n '403p' | grep -F -- 'a real recorded HAR (Playwright `recordHar` precedent)'` → rc=0 —
  and states the producer rule at `:405-407` (a netlog is not a HAR; typed refusal) and `:470-473` ("the producer channel
  named per fact"), while kaidoku's gate admits any schema-valid capture as `historical-reference`/`observed` with
  `runtime_attribution:"unknown"` (`r10-01:153-170`). Two lanes, one object, two rules → a split, and row 2's quotes
  (self-launched targets / "endpoints, targets, screenshot/DOM evidence capture") never name HAR admission.
- QUALITY 91's screen clause does not rescue the reversal: its premise is "a fact on the sibling's own side of an
  **already-mapped split**"; the mapped split is endpoint/target/capture discipline, so the premise is unmet.

### Candidate row 44 — `kaidoku@fa6a8a3f:corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:117` — **DEFECT (medium)**

- Ledger line 42 screens it with the identical reversal note as ledger lines 38 and 40
  (`sort -u` over ledger lines 38/40/42 column 5 → **1** distinct note), so the note does not record a ground on this line at all.
- Counterexample from the same file: `compare-web-screenshots` *refuses the whole evidence envelope* and accepts exactly
  the artifact block `{sha256, bytes, media_type, data_base64}` (`r10-02:122-126`); the compared objects are two stored PNG
  artifacts. A comparison of two files has no CDP target; the line's proposition is *what a comparison proves*
  ("artifact differ … capture differ (honest `unknown` on incomplete dimensions)", 12 words, rc=0), not how a target is
  attached. The only line that names the compare verbs (`r4-16-frontier-rescan.md:184`) is itself screened with the note
  "needs the ruled CDP target plus prior captures; **the capture side is the ruled boundary, the comparison semantics are
  row 44**" — i.e. the landed ledger defers the comparison semantics to candidate 44 as a separate item and then, at row 42,
  folds them back into the same boundary. The two notes cannot both be true.
- Real overlap: tabi compares pixels itself and cites kaidoku for determinism —
  `git show 04f9623:SKILL.md | sed -n '401p' | grep -F -- 'determinism cross-ref `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:130-131`'`
  → rc=0, and `:437` "visible rendered state | screenshot (pixel tools for machine checks)" → rc=0. kaidoku's
  pair-compare splits artifact differ from capture differ; tabi's determinism is "byte-stable … in this environment;
  environment-scoped". That is a boundary with two named sides, and it is now invisible.

## Evidence — commands and exit codes

One live clone, scratch `TMPDIR`, no lane writes (`git show`/`status` only):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone   # rc=0
git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa   # rc=0
git -C "$S/clone" rev-parse HEAD          # 04f9623dde8ad35d470cecf766e421eafbcb47fa
git -C "$S/clone" rev-parse --show-toplevel  # $S/clone   (asserted before the probe commit)
sha256sum .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs   # 0dba816…a8781e == claims.frozenDigests
sha256sum scripts/check-adjacency.mjs                             # 4e2c2a64…324aac == claims.frozenDigests
```

Frozen counter and gate at the integration commit (counter extracted from the FREEZE blob, bytes
`0dba816c…a8781e`):

```
node $S/c1.mjs --rev 04f9623 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json   # exit 0
  predicate true | candidates 67 | mapped 5 | screened 62 | unaccounted 0 | newMapped 4
  adjacency {verdict clean, rows 17, verified 17, findings 0} | screenFindings []
```

So the L1's measured predicate reproduces; **my finding is inside it, not against it**.

Correction probe (restore w1's two rows + two declaration bullets at `SKILL.md:2925-2926`, drop the two screen rows;
commit `c089f8c4e1f4663c065205864188aa0d8fc670c3` in the scratch clone, identity
`CritReversalKaidoku <CritReversalKaidoku@scratch.local>`; `git diff --numstat 04f9623 HEAD` → `2 0 SKILL.md`,
`0 2 corpus/adjacency-screen-skill.tsv`, `2 0 corpus/adjacency.tsv`):

```
node scripts/check-adjacency.mjs --at c089f8c4 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json  # exit 0
  {"verdict":"clean","rows":19,"verified":19,"findings":[],"selfRulings":[2]}
node $S/c1.mjs --rev c089f8c4 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json                  # exit 0
  predicate true | mapped 7 | screened 60 | unaccounted 0 | newMapped 4 | screenFindings []
```

`newMapped` stays 4: the two candidate lines are set-B (no `tabi` token in their text), so a truthful split raises
`mapped` only. **The reversal was not load-bearing for the target in either direction** — the smallest correction costs
nothing and removes two false screens.

Quote receipts (`quotecheck.txt`, all `grep -F` against the pinned blobs, rc=0 each): `r3:99` 6 words,
`r10-01:151` 7 words, `r10-02:117` 12 words, `kaidoku PROVINCE.md:53` lists `capture-browser-scenario`, `r10-01:89`
"never touches a live endpoint.", `r10-01:94` "No endpoint parameter exists.", `round-16…spotcheck.md:142-143` "It cites
tabi for browser-side mechanics.", `SKILL.md:401/403/405-437` tabi sides, `adjacency-screen-skill.tsv:41` "the comparison
semantics are row 44".

No network fetch was made this seat; the only non-lane reads are `/home/vgpnk/.agents/skills/reverse-engineer-anything/`
reference files (read-only) and `kaidoku-shokunin` at pinned blobs. No tool install/upgrade. No browser launched.

## Smallest safe correction (for the L1; not applied by this seat)

1. Keep candidate 40 screened (correct), but rewrite its note to cite the ruling's "browser-side mechanics" clause and
   `kaidoku PROVINCE.md:53`'s verb list instead of `w1 ConnBoundaries` G3 (whose "never clicks/navigates" clause is false
   for the line).
2. Restore w1's `recorded-har-producer-channel` and `screenshot-pair-compare-semantics` split rows (candidate 42, 44) with
   two new declaration lines under the existing `## Round 34 — sibling-overlap declarations` section, and delete ledger
   rows 40 and 42. Two declaration bullets are needed because the counter's newMapped clause requires the tabi quote to
   name the sibling; the sibling-side quotes here do not contain `tabi`, so `newMapped` is unaffected.
3. Fix the now-vacuous cross-reference in the `r4-16:184` note ("the comparison semantics are row 44") so it names the
   restored surface rather than a screened candidate.

Residual risk to weigh: the restored HAR row will sit beside map row 5 (`rea-browser-runtime-evidence`, revenger,
contested-open). Keep the kaidoku row `split-declared` on the *admission/producer* object (kaidoku owns its gate, tabi
names the producer of its own claims); do not let it restate revenger's REA-toolset claim.

## Deliverables

- `.ufo/waves/round-34/w2/CritReversalKaidoku.md` — this report.
- `.ufo/waves/round-34/w2/CritReversalKaidoku/adj-at-probe.json` — gate at `c089f8c4` (exit 0, clean 19/19).
- `.ufo/waves/round-34/w2/CritReversalKaidoku/c1-at-04f9623.json`, `.stderr` — frozen counter at the integration commit
  (exit 0, predicate true, mapped 5).
- `.ufo/waves/round-34/w2/CritReversalKaidoku/c1-at-probe.json` — frozen counter at the correction probe (exit 0,
  mapped 7, newMapped 4).
- `.ufo/waves/round-34/w2/CritReversalKaidoku/quotecheck.txt` — every `grep -F` quote check with rc.
- `.ufo/waves/round-34/w2/CritReversalKaidoku/lane-clean.txt`, `sha256sums.txt` — lane tree state at exit and receipt
  digests.

Scratch `$HYAKU_SCRATCH/tabi-r34/CritReversalKaidoku` (clone + TMPDIR) is deleted after the receipts above;
`/home/vgpnk/Projects/shokunin/tabi-shokunin` was read-only for this seat.
