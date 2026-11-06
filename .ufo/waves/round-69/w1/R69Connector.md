DRAFTED

# R69Connector — blind per-sibling relation draft (tabi r69 · C1 adjacency)

Independent draft of tabi's relation with each of the 20 frozen sibling lanes, produced
before any tabi sibling matrix existed, from the siblings' own province text only.

## Blind-start proof

- Snapshot: `.ufo/waves/round-69/c1/sibling-heads-r69.tsv`, sha256
  `5aa91a5886f6eb64eec56673861532967d80f18ae9b833d8e58b9caf6a5fbdf4`
  (`receipt-01-snapshot-and-blind-start.txt`).
- Tabi's `PROVINCE.md` at FREEZE `a033979c` (`a033979c55c92dca2913a8f94ac9f1cb6c4b38da`)
  contains **0** occurrences of `Adjacent — sibling matrix`. No tabi matrix was consulted.
- Concurrent mutation, disclosed: at 15:58:07 another seat added
  `## Adjacent — sibling matrix (round 69)` to the working-tree `PROVINCE.md` (now `:171`,
  `M PROVINCE.md`, +35 lines). This seat's `relations.tsv` was written 15:56:48, after every
  province read (15:53–15:56) and before that section existed; the section was never read
  into this draft. Timeline and mtimes: `receipt-01-snapshot-and-blind-start.txt` addendum.
- Every sibling was read with `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show
  <head>:PROVINCE.md`. Per-lane digests: `receipt-01-province-digests.tsv`.
- `PROVINCE.md` was non-silent (Owns/Refuses present) for all 20 lanes, so no lane needed
  its `SKILL.md` head. One incidental SKILL hit (`kaidoku-shokunin/SKILL.md:57`, "self-launch
  `chromium --remote-debugging-port=9222` … held") agrees with that lane's PROVINCE:55 and is
  recorded in `receipt-03`.

## Result

`relations.tsv` — 20 rows, header `lane	relation	cite	quote	reason`:

| relation | count |
|---|---|
| none | 14 |
| adjacent | 3 |
| contested | 3 |

Every row's quote was re-read at its own snapshot head and matched verbatim; longest quote
is 20 words (bound 25). `receipt-04-relations-selfcheck.txt` prints per-row `verbatim=YES`
and `mismatches: 0`.

## Adjacent (3) — a split is stated by at least one side

- **kake** — `kake-shokunin/PROVINCE.md:40`: "`tabi` drives browsers and owns client-side
  crawler discipline; kake owns". Kake restates it at `:310` ("browser-driving and
  client-side crawler discipline belong to tabi") and keeps browser execution out of its
  JS-rendered-canonical frontier at `:67`. Tabi's side: the browser and its evidence are
  tabi's; what a publisher serves at the origin is kake's. Kake also names the
  the-musketeer Chrome profile lease contested (`:45`, kagi/tabi/kake) — recorded, not
  absorbed here.
- **kagi** — `kagi-shokunin/corpus/knowledge/cdp-bridge-1password.md:70`: "start/inspect via
  the browser lane; do not re-`ensure` blindly". Kagi keeps credential custody and defers
  browser start/inspect to tabi; tabi keeps session material shape-only and reads no secret
  values. Note `kagi-shokunin/PROVINCE.md:64` declares "CDP `9222`" plus the
  `the-musketeer/chrome-profile` contested **with kake**, not with tabi — tabi claims no
  fixed 9222 lease.
- **chousa** — `chousa-shokunin/PROVINCE.md:7`: "search-strategy taxonomy; the external-target
  approval table for a research". Chousa owns the approval table and source hierarchy for an
  external research window (`:13-14` also refuses external live-target research without
  operator approval, loopback-only otherwise); tabi owns the browser mechanics of running an
  approved window.

## Contested (3) — two provinces claim the same mechanics, and neither yields

- **kaidoku** — `kaidoku-shokunin/PROVINCE.md:55` ("self-launched targets: `chromium
  --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223`"
  with `list_browser_targets` / `inspect-web-page`) and `:139` (`observe-web-session`,
  `observe-web-execution`, `observe-javascript-runtime`, "all held r4-08"). Tabi owns "CDP
  session discipline (endpoints, targets, screenshot/DOM evidence capture)" verbatim. Tabi's
  refusal hands *forensics* to kaidoku, not the session mechanics; kaidoku's province names
  no split with tabi. Same instrument, same objects (targets, pages), no owner ruled.
- **revenger** — `revenger-shokunin/PROVINCE.md:5` owns "browser/Electron runtime evidence";
  `:30-33` records a loopback CDP browser surface for REA's `rea-cdp-browser`
  (`rea list-browser-targets`, `rea inspect-web-page`); `corpus/live/runs/round-77/receipt.json:7`
  pins headless Chrome over `--remote-debugging-port=9333`. That is the same surface class as
  tabi's CDP endpoint/target/screenshot discipline, again split only by purpose (forensics).
- **kumitate** — `kumitate-shokunin/PROVINCE.md:14`: "Kimi Code substrate `~/.kimi-code/` —
  rows K1–K5, gated by `scripts/kimi-census.mjs`". Tabi's province names
  `~/.kimi-code/plugins/managed/kimi-webbridge/` as its primary substrate documentation.
  Same tree, two claimants, and the two statuses contradict (see Contradictions, item 1).

## None (14) — grouped by why, not by bookkeeping

- Different domain object, no shared artifact or source: **audio** (`:3`), **game-dev-2d**
  (`:3`), **game-dev-3d** (`:3`), **kotodama** (`:3`), **lore** (`:3`), **kama** (`:3`),
  **mado** (`:3`).
- The sibling's own refusal closes the surface: **kasegi** (`:52`, "Live-target testing is
  refused; this corpus is documentation only"), **souji** (`:3`, receipt-gated repository
  hygiene), **tameshi** (`:14`, method only — "every lane's gate remains its own"), **tsukuroi**
  (`:3`, OS substrate; its seven handoff classes name kama/kagi/mado/mori/kumitate/RE/tameshi
  and no browser lane).
- Sibling's own census already says so: **kotoba** (`:76`, "it states no split with kotoba on
  its scope surfaces").
- Fleet-wide observation, not a pairwise edge: **mori** (`:3`, watches every lane's waves —
  treating that as adjacency would make mori adjacent to all 20).
- Fleet-level method comparison that absorbed nothing: **kengaku** (`:106`, "Nothing was
  absorbed into this lane; a fleet-level index/registry standard") — it read one tabi script
  (`scripts/check-measurement-binding.mjs:575-613`) as a primitive comparison only.

## synthesizeScrollGesture / CDP Input-domain overlap scan

`receipt-02-synthscroll-scan.txt`, `receipt-03-input-domain-scan.txt`.

- `synthesizeScrollGesture` (case-insensitive) at all 20 snapshot heads: **0 hits, 0 of 20
  lanes** (`git grep` rc=1 per lane). Positive control with the same pattern: 7 hits in the
  staged source `tabi-shokunin/.ufo/waves/round-69/sources/input_handler.cc`
  (sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`), so the
  pattern and the pinned bytes are sound.
- CDP Input-domain commands on **live** (non-`.ufo`) paths — `Input.dispatch*`,
  `Input.insertText`, `dispatchTouchEvent`: **0 hits in all 20 lanes**.
- Live CDP *session* holders (different layer, reported for the overlap question):
  - `kaidoku-shokunin/PROVINCE.md:55`, `SKILL.md:57` — chrome `:9222` target enumerate/inspect.
  - `revenger-shokunin/PROVINCE.md:30-33`, `corpus/live/runs/round-77/receipt.json:7` — chrome
    `:9333`, `rea list-browser-targets` / `rea inspect-web-page`.
  - `kagi-shokunin/PROVINCE.md:41,64` — `cdp-bridge` verb, CDP `9222` + the-musketeer
    profile (declared contested with kake); `corpus/knowledge/cdp-bridge-1password.md:70`
    routes browser start/inspect to "the browser lane".
  - `kama-shokunin/corpus/knowledge/listener-census.md:56` — a **foreign** `chrome` listener
    observed on `127.0.0.1:9222`; an observation row, not a claim.
- Kotoba's hits (`Input.dispatchKeyEvent` etc. in
  `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt`) are harness binary strings, and
  kotodama's are round-90 copies of tabi's own text — neither is a claim.

**Conclusion:** no sibling holds the `synthesizeScrollGesture` instrument or any Input-domain
command. The capability adds no new sibling overlap beyond C1; the overlap that does exist is
with the CDP *session* mechanics of kaidoku and revenger, already carried as `contested`.

## Contradictions stated (not smoothed)

1. **`~/.kimi-code/` status.** Tabi's province (round-44 host section) records the
   kimi-webbridge plugin **ABSENT** on this host; kumitate's round-70 host correction records
   the substrate as **present with 5 entries**. Both are province text at frozen heads; neither
   reconciles the other. A path-level probe would settle it — a province read cannot.
2. **Purpose split vs mechanics split.** Tabi's refuses clause hands "reverse engineering as
   forensics" to revenger/kaidoku; kaidoku and revenger each claim the CDP runtime-observation
   mechanics. A purpose split is not a mechanics split, and neither province yields endpoints
   or targets. This is why kaidoku and revenger are `contested`, not `adjacent`.
3. **CDP 9222 lease.** kagi declares `9222` + `the-musketeer/chrome-profile` contested with
   kake; tabi claims only ephemeral ports it chooses. The lease is outside tabi's edge as
   written, but it is a live unresolved CDP-endpoint question in the fleet — recorded, not
   absorbed.

## Risks and limits

- The draft is province-text evidence at head. A sibling can hold more than its province states
  — kaidoku and revenger demonstrably ship CDP code their provinces summarise but do not bound.
- Snapshot race: heads are frozen at `2026-11-06T15:46:41-03:00`; a mid-round sibling commit is
  not in this draft.
- `none` means "no shared surface appears in either province at head", not "no interaction is
  possible".
- Quote lines are pinned to the frozen heads; a later head moves them. Re-bind before citing
  outside this round.

## Verification (read-only)

```
git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <head>:PROVINCE.md | sed -n '<line>p'
git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin grep -n -i synthesizeScrollGesture <head>
grep -c -i synthesizeScrollGesture /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/sources/input_handler.cc
```

`receipt-04-relations-selfcheck.txt` is the full re-read: one line per row with
`verbatim=YES|NO`, the 25-word bound, and the relation counts.
