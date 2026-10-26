# CritRowKasegi — attack on map row 18 `authenticated-consequential-driving` (kasegi)

**VERDICT: DEFECT — high on the map's truth, non-load-bearing on the frozen C1 predicate.**
Row 18 (`corpus/adjacency.tsv:19`, sibling `kasegi`) and its tabi declaration (`SKILL.md:2924`) state a
route that exists on neither side. The sibling side is a corpus record of the **bounty-hunter fleet's**
`fleets/claimer-mission.md` — a third lane that is not `kasegi`, whose file does not exist in the kasegi
repository at the pin **or** at its master tip, and whose ground `kasegi`'s own province refuses
(`PROVINCE.md:52` "Live-target testing is refused; this corpus is documentation only"). `kasegi` names
`tabi` **nowhere** in its tracked non-`.ufo` files (one word-boundary hit fleet-wide: a quote-source lane
list), and never states a split, cession or contest with `tabi`. The tabi side therefore declares a route
to a lane that claims nothing, and the row's sibling-side ground that *is* real — attach to an
operator-authenticated profile at CDP 9222 — is the driver side of the profile/lease boundary already
mapped contested as `musketeer-cdp-9222-profile-lease` (rows 7/8; fleet L0 `.ufo/l0-questions.md:62`:
tabi "never attaches to 9222 or the musketeer profile"). That is exactly QUALITY criterion 91's screen
shape ("a map row whose only sibling-side ground is a fact on the sibling's own side of an already-mapped
split is a screen, whatever its surface name"), and the row's name is new while the boundary is not.
`refused-route` is the wrong label on top of that: the map's other three refused-route rows quote tabi
text carrying an arrow to the named sibling (`→ revenger/kaidoku`, `(→ kagi`), while this row's arrow (C4,
`SKILL.md:727`) points at **the operator**. Re-keying onto the lease as `contested-open` is *also* false:
`kasegi` disclaims the lease (its own `LOG.md:399` routes "the shared CDP lease" to kagi/kake), so an L0
question naming kasegi would manufacture a third claimant, and the existing L0 line cannot carry it
(probe C below). The correction is free: withdrawing the row and re-screening its three candidates leaves
C1's predicate **true at the frozen target** (newMapped 4→3, unaccounted 0, adjacency clean 16/16 — probe
B). Keeping the row costs the map its truth for zero predicate gain.

## What I attacked

- Map row 18: `corpus/adjacency.tsv:19` (sibling `kasegi@9a10b02f:corpus/knowledge/mission-control.md:119`,
  `refused-route`, ruling `-`).
- Its tabi declaration `SKILL.md:2924` (the round-34 appended line that makes the row `newMapped`).
- The two screens that hang off the same surface: `corpus/adjacency-screen-skill.tsv:59` (`kasegi
  SKILL.md:267`) and `:60` (`kasegi ufo-workspaces.md:272`), both `same-surface`.
- kasegi's current tip (`d65d823e`, and its master `5006097a`) for anything that changes the reading.

## Evidence (commands, exit codes, file:line)

### 1. Pins and quotes verify — the defect is semantic, not a byte break

```
git -C kasegi-shokunin show 9a10b02f:corpus/knowledge/mission-control.md | sed -n '119p' \
  | grep -cF 'authenticated burnerchrome at CDP 9222 (attach by URL substring, never'   → 1
sed -n '2924p' SKILL.md | grep -cF "kasegi's claimer lane owns its operator-authed CDP 9222 bounty submissions" → 1
sed -n '2924p' SKILL.md | grep -cF 'tabi refuses to drive an operator-authenticated browser into a submission act' → 1
```
All three quotes are verbatim on their cited lines. `check-adjacency` at the integration rev: 17 data
rows, **17 verified**, 0 findings (`.ufo/waves/round-34/w2/CritRowKasegi/c1-at-integration.json`).

### 2. The sibling line's subject is a third lane, not kasegi

- `git -C kasegi-shokunin show 9a10b02f:corpus/knowledge/mission-control.md | sed -n '116,121p'`:
  `## Sibling L1 contracts` → ``**`fleets/claimer-mission.md`** — the external-effect lane: operator-`` /
  ``authenticated burnerchrome at CDP 9222 (attach by URL substring, never`` / `steal his tab) ...`.
  The file's own source line (`:3-8`) is `~/Projects/bounties/ops/fleet-dispatch.mjs`,
  `fleets/{claimer-mission,review-mission}.md` — the bounty-hunter fleet, i.e. `mission-control.md` is a
  *documentation* record of that fleet's runtime.
- `git -C kasegi-shokunin cat-file -e 9a10b02f:fleets/claimer-mission.md` → `fatal: path
  'fleets/claimer-mission.md' does not exist in '9a10b02f'`; same at `refs/heads/master` (exit 128 both).
- `git -C kasegi-shokunin show 9a10b02f:PROVINCE.md | sed -n '43,52p'`:
  `## Adjacent` / `- chousa` / `- kagi` / `- kake` / `- kengaku` /
  `Live-target testing is refused; this corpus is documentation only.` — no `tabi`, and the lane refuses
  the very act the row attributes to it.
- `git -C kasegi-shokunin grep -nE '\btabi\b' 9a10b02f -- '*.md' '*.tsv' ':!.ufo/*'` → exactly one hit,
  `9a10b02f:corpus/lessons/round-35.md:191` ("in `kagi`, `mori`, `kotoba`, `kotodama`, `tabi` that are
  quote sources …") — a source-custody lane list, no relation claim. Same single hit at master. No split,
  cession, route or contest with tabi exists on the sibling side.
- `git -C kasegi-shokunin show refs/heads/master:LOG.md | sed -n '399p'`: "kagi README cites kake
  SKILL.md:104-107 for the shared CDP lease, now at :116-119 → kagi fixes" — kasegi's own log routes the
  shared CDP lease to **kagi/kake** and does not absorb it.

### 3. kasegi's current tip does not change the reading — it strengthens it

`git -C kasegi-shokunin log --oneline -3 refs/heads/master` → `5006097 round-39: receipt Y (all-gates v3)`;
`git merge-base --is-ancestor d65d823e refs/heads/master` → ancestor (exit 0); pin is an ancestor too.
Blob identities pin → master:
```
mission-control.md  ed84661425da68680ffed7538ace5ad18f95b629  (identical)
ufo-workspaces.md   54225e4f5c42c177513103f7e4308a360f9c7e07  (identical)
SKILL.md            0a245949… → ed22d61d…  changed, but :267 still
                    "Sibling L1s: `fleets/claimer-mission.md` (CDP browser submissions," (same line, same text)
PROVINCE.md         c2283a05… → 4ea904f2…  changed, but :52 refusal and the four-lane Adjacent list unchanged
```
`git -C kasegi-shokunin grep -n -iE '9222|burnerchrome|\bcdp\b' refs/heads/master -- '*.md' '*.tsv'
':!.ufo/*'` → five hits, all reporting the third lane (`SKILL.md:267`, `mission-control.md:119`,
`ufo-workspaces.md:272`, `LOG.md:67`, `LOG.md:399`). No new kasegi claim; nothing that converts the
documented practice into kasegi ground.

### 4. Probe A — withdrawal alone is *not* the fix (counter still catches it)

```
git -C "$D" commit -am "probe A: withdraw row 18 only"        → cf6fc8c2067e1aecc52e163871b8146e66117f81
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev cf6fc8c… --repo "$D" \
  --fleet /home/vgpnk/Projects/shokunin --json                → exit 1
  predicate false · candidates 67 · mapped 4 · screened 60 · unaccounted 3 · newMapped 3 · adjacency clean 16/16
  screenFindings: [{row:59, reason:screen-surface-unmapped, detail:"authenticated-consequential-driving kasegi"},
                   {row:60, reason:screen-surface-unmapped, detail:"authenticated-consequential-driving kasegi"}]
```
Two consequences: (a) row 18 is **not** load-bearing — newMapped falls 4→3, still ≥ the frozen target 3;
(b) the two `same-surface` screens are only valid because the surface exists, so a withdrawal must carry
their re-screen (all three kasegi candidates become unaccounted otherwise).

### 5. Probe B — the correction keeps C1 true at the frozen target

```
git -C "$D" commit -am "probe B: withdraw row 18 + re-screen three kasegi candidates as third-lane-report"
                                                              → e3b7cf1b9caa6319f3e0c10347de8236a28bc907
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev e3b7cf1… --repo "$D" \
  --fleet /home/vgpnk/Projects/shokunin --json                → exit 0
  predicate true · candidates 67 · mapped 4 · screened 63 · unaccounted 0 · newMapped 3 · adjacency clean 16/16
  newMappedRows: rows 15 (kake, split), 16 (kake, split), 17 (kotoba, split) · screenFindings []
```
The re-screens used in the probe (surface `-`, reason `third-lane-report`): `kasegi SKILL.md:267`,
`corpus/knowledge/mission-control.md:119`, `corpus/knowledge/ufo-workspaces.md:272`, each quoting a verbatim
substring of the candidate line.

### 6. Probe C — the "should be an L0 question" reading is not available either

Re-keyed the same line onto the mapped lease surface as `contested-open` with the existing L0 line
(`musketeer-cdp-9222-profile-lease` / kasegi / `SKILL.md:556` / fleet@d1e70ce6…:`.ufo/l0-questions.md:62`):

```
node scripts/check-adjacency.mjs --at 09a6c58e… --repo "$D" --fleet … --json   → exit 1
  verdict failed · rows 17 · verified 16
  finding row=18 reason=l0_line_absent detail="l0 .ufo/l0-questions.md:62 does not name sibling=kasegi"
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 09a6c58e… …  → exit 1
```
`sed -n '62p' .ufo/l0-questions.md` says "tabi holds no lease half … never attaches to 9222 or the
musketeer profile" and asks to "rule the lease owner between kagi and kake" — it names neither kasegi nor
a third claimant. Filing a *new* L0 line naming kasegi would assert a claim kasegi's province refuses, so
the contested-open route is available only by manufacturing a contest.

### 7. Why the gate verified the bad row (mechanism, observed)

`scripts/check-adjacency.mjs:790-804`: for `split-declared`/`refused-route` the only requirement is
`ruling_ref == '-'` and `ruling_quote` a substring of the **tabi file named by tabi_ref** — no route token,
no "different line than tabi_quote" rule, no sibling-side statement. Row 18 satisfies it by construction:
both its `tabi_quote` and its `ruling_quote` are substrings of the same line `SKILL.md:2924`. This is the
same mechanism round-17 w2 `AdjRow8.md` proved by mutation for the row's predecessor; round 34 re-created
the row with the recommended re-anchor and the unchanged disposition.

## Answers to the four attack points

1. **Real overlap, distinct from every existing boundary? No.** The only browser fact on the sibling side —
   attach to an operator-authenticated profile at CDP 9222, never stealing the operator's tab — is the
   driver/attach side of the profile+lease boundary already mapped as
   `musketeer-cdp-9222-profile-lease` (rows 7/8; tabi's side `SKILL.md:556` "a fresh throwaway profile per
   run", "never a user profile"; fleet L0 `:62` "never attaches to 9222 or the musketeer profile"), and
   the lane's own prior reading consolidates "burner Chrome … `--remote-debugging-port=9222`" onto that
   surface (`adjacency-screen-skill.tsv:48-49`). The other half — the consequential submission — is not a
   lane relation at all: tabi's C4 row refuses it and routes it to **the operator**
   (`SKILL.md:727`, `PROVINCE.md:17-19`), and `PROVINCE.md:15-16` — the province's only routed refusals —
   name revenger/kaidoku, kake and kagi, never kasegi. Even if one declines the burnerchrome/musketeer
   identity, the row still fails point 3, so the correction is unchanged.
2. **Does the declaration claim practised ground without absorbing sibling ground? It claims practised
   ground but attributes non-existent sibling ground.** "tabi keeps only CDP observation and session-shape
   reporting" is practised (`PROVINCE.md:9`; A9 `SKILL.md:743`, session-material discipline `SKILL.md:662-663`).
   But "kasegi's claimer lane owns its operator-authed CDP 9222 bounty submissions" hands `kasegi` a
   practice (a) its province refuses (`PROVINCE.md:52`), (b) that belongs to a third lane whose mission
   file is absent from the repo, and (c) that `kasegi` itself routes to kagi/kake (`LOG.md:399`).
   Secondary defect (medium): the same sentence's trailing "tabi keeps only CDP observation" sits
   immediately after the operator-authenticated-9222 clause and reads as observation *on that browser* —
   contradicting fleet L0 `:62` ("never attaches to 9222") and `SKILL.md:556-557`; it needs an explicit
   loopback/self-launched scope if the line survives in any form.
3. **Is the disposition right? No.** `refused-route` needs tabi to refuse *and route*: tabi refuses
   (`PROVINCE.md:17-19`, C4 `SKILL.md:727`) and routes to the operator, not to kasegi; the map's other
   three refused-route rows all quote tabi text carrying `→ <sibling>`. Nor is `split-declared` available
   (the sibling side states no split — `\btabi\b` silent), nor `ruled` (no ruling names kasegi), nor
   `contested-open` (probe C: `l0_line_absent`, and a contest would be manufactured).
4. **Quotes verbatim and on the cited lines? Yes** (§1): `mission-control.md:119`, `SKILL.md:2924`, and
   both quote columns on `:2924`. The pin is also still accurate at master (`SKILL.md:267` unchanged).

## Impacted axes

- **adjacency (the axis in play).** The map gains a surface whose sibling side claims nothing and whose
  name re-labels an existing boundary — the criterion-91 red shape, on the axis whose obligation binds
  this round. Verified flow: `newMapped` 4 (integration) → 3 (probe B, at target), so the frozen predicate
  survives the truthful version and the row buys margin only, at the price of a false row.
- No other axis touched; no harm leg affected (probe B: adjacency clean 16/16, screenFindings 0).

## Smallest safe correction (for the L1; I edited nothing in the lane)

1. **Withdraw row 18** (`corpus/adjacency.tsv:19`).
2. **Re-screen its three candidates** in `corpus/adjacency-screen-skill.tsv` as `third-lane-report`
   (surface `-`): `kasegi SKILL.md:267`, `corpus/knowledge/mission-control.md:119`,
   `corpus/knowledge/ufo-workspaces.md:272` — each line reports the bounty-hunter fleet's claimer mission
   or its post-mortem submission record, and kasegi's province refuses live-target testing and names no
   tabi. (Replacing `:59`/`:60` is mandatory: withdrawal alone leaves `screen-surface-unmapped` ×2 and
   three unaccounted candidates — probe A.) `no-claim-declared` would also pass the counter for `:267`; it
   is less accurate, since the line does report a claim, just not kasegi's.
3. **Append one correction line** in SKILL.md's "Round 34 — corrections" block (append-only): `SKILL.md:2924`
   backs no map row; the 9222/authenticated-profile half is the mapped lease (rows 7/8, fleet L0 `:62`);
   tabi's CDP observation is loopback/self-launched only (`SKILL.md:556-557`).
4. **Record the reversal per QUALITY criterion 91**, with the ground on kasegi's own bytes
   (`PROVINCE.md:52`, `:43-50`, `LOG.md:399`, the absent `fleets/claimer-mission.md`), and record that the
   row was load-bearing for margin only (4→3).

## Honesty / scope notes

- I wrote only this report, `.ufo/waves/round-34/w2/CritRowKasegi/` (five receipt JSONs) and my scratch
  clone under `/fast/scratch/hyaku/tabi-r34/CritRowKasegi` (deleted before yield). The lane, its index and
  jj state, the fleet repo and sibling repos were read-only; commits exist only in the scratch clone
  (`cf6fc8c`, `e3b7cf1`, `09a6c58`, all with `-c user.name=CritRowKasegi`, toplevel asserted per commit).
- No network fetch, no tool install/upgrade, no browser launch.
- Receipts: `.ufo/waves/round-34/w2/CritRowKasegi/{c1-at-integration,c1-probeA-withdraw-only,c1-probeB-withdraw-rescreen,c1-probeC-lease-contested,probeC-adjacency}.json`.
