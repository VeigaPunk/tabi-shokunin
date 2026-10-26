# AdjKaidoku — C1 build (round 34, w1): kaidoku disposition drafts

**Verdict.** All nine assigned kaidoku candidates (rows 39-47, pin `fa6a8a3f85ec65946b3a54d37c0ddd1d6748664f`) are dispositioned and every one is accounted at my scratch commit: six lines restate the ruled `cdp-runtime-observation` boundary and are screened `same-surface` in the new ledger, three lines carry a genuinely different object and are mapped as three NEW split-declared rows with three NEW tabi declaration bullets. Gate and counter results at `1dfd0d125b904b8267950a6c4f6ea93f7506b9c3`: `check-adjacency` exit 0, `verdict=clean rows=16 verified=16 findings=0 selfRulings=[2]`; the frozen counter exits 1 only because the wave-wide predicate is not this seat's to meet (57 candidates belong to other seats), and reports `candidates 67, mapped 4, screened 6, unaccounted 57, newMapped 0, screenFindings []`, with **zero kaidoku keys in `unaccountedKeys`** (perLane `kaidoku: 9`). `newMapped` is 0 from this seat by construction, not by omission: none of the nine kaidoku lines carries the token `tabi`, so under the frozen counter's both-sides-named clause a one-sided split declaration lifts `mapped` (1 → 4) but is never credited as a new declared boundary — no refused-route or ruled disposition is truthful for these surfaces, and I declined to manufacture one.

## What I decided, per line

The ruled boundary is map row 2 (`cdp-runtime-observation`): kaidoku `PROVINCE.md:53` self-launched `chromium --headless --remote-debugging-port=9222` vs tabi `PROVINCE.md:9` CDP session discipline, ruled at `corpus/lessons/round-16-verifier-spotcheck.md:142` ("kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis"). Applying the lane's own decision rule (`SKILL.md:2861-2875`, step 2 before step 5):

| line | surface family | decision |
|---|---|---|
| `SKILL.md:55` | self-launched loopback browser | screen `same-surface` `cdp-runtime-observation` |
| `2026-10-13-r3-runtime-observation.md:17` | self-launched loopback browser | screen `same-surface` |
| `2026-10-13-r3-runtime-observation.md:50` | a11y-tree capture | screen `same-surface` (a11y is a provider payload of the ruled passive inspection; tabi's accessible-tree capture is its own loopback craft, `SKILL.md:2889` correction) |
| `2026-10-13-r2-skill-references-deep.md:72` | passive observation contract | screen `same-surface` |
| `2026-10-13-r4-16-frontier-rescan.md:184` | screenshot capture/compare provisioning | screen `same-surface` |
| `2026-10-14-r11-01-queue-ops.md:305` | self-launched loopback browser | screen `same-surface` |
| `2026-10-13-r3-runtime-observation.md:99` | REA-driven Playwright scenario (executes declared actions) | NEW row `scripted-action-execution`, `split-declared` |
| `2026-10-14-r10-01-queue-ops.md:151` | HAR capture/validation | NEW row `recorded-har-producer-channel`, `split-declared` |
| `2026-10-14-r10-02-queue-ops-2.md:117` | screenshot compare semantics | NEW row `screenshot-pair-compare-semantics`, `split-declared` |

The three mapped objects are distinct from the ruled one on the sibling's own words: the scenario verb *executes declared actions* over an attached endpoint (r3 `:99-104`), which the round-16 ruling never names (it names tabi's *observation*); the HAR gate accepts `"any har-schema-valid capture"` from a verb that has "No endpoint parameter exists" (r10-01 `:147-151`), so it is recorded-artifact production, not endpoint discipline; the screenshot note is about *what a comparison proves* (`artifact differ` vs `capture differ` with an honest `unknown`), and tabi's committed side is `SKILL.md:401` (visual read-back, byte-stability environment-scoped) and `:437` (pixel tools). Tabi's side of the execution split rests on `PROVINCE.md:18` ("observation and operator-approved interaction only") and `corpus/knowledge/interaction-approval-table.md:144`; of the HAR split on `SKILL.md:403-406` (HAR is one channel, producer named, netlog is not a HAR).

Full per-candidate reasoning: `.ufo/waves/round-34/w1/AdjKaidoku/decisions.md`.

## Evidence (commands, exit codes, file:line)

Clone at the freeze (`59f1b47aae277e1670e4a824173da8cde7e388ee`), one live clone, scratch `TMPDIR`, no writes to the lane:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone            # exit 0
git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee    # exit 0
git -C "$S/clone" rev-parse HEAD                                                   # 59f1b47aae277e1670e4a824173da8cde7e388ee
git -C "$S/clone" rev-parse --show-toplevel                                        # $S/clone (asserted before every commit)
```

Sibling pin provenance (read-only): `git -C kaidoku-shokunin merge-base --is-ancestor fa6a8a3f85ec65946b3a54d37c0ddd1d6748664f refs/heads/main` → **rc=0** (kaidoku `main` = `c4895cf1f0fc00b629fbf5f4f9d4dd789ae93210`; the lane tip ladder resolves `refs/heads/main`, printed in the gate's `tips`). All nine lines were read with `git -C kaidoku-shokunin show fa6a8a3f:<path> | sed -n '<line-8>,<line+8>p'`; none carries `tabi` (`grep -qE '\btabi\b'` per line → nine `no-tabi`).

Commit (scratch clone only, named identity): `git -C "$S/clone" -c user.name=AdjKaidoku -c user.email=AdjKaidoku@scratch.local commit` → **`1dfd0d125b904b8267950a6c4f6ea93f7506b9c3`**. Append-only proof — `git -C "$S/clone" diff --numstat 59f1b47..1dfd0d1`:

```
10	0	SKILL.md
7	0	corpus/adjacency-screen-skill.tsv
3	0	corpus/adjacency.tsv
```

New section and declaration lines (real numbers substituted into the rows): `SKILL.md:2917` header `## Round 34 — sibling-overlap declarations (outside PROVINCE)`, bullets at `SKILL.md:2923` (`scripted-action-execution`), `:2924` (`recorded-har-producer-channel`), `:2925` (`screenshot-pair-compare-semantics`); map rows 15-17 cite those lines.

Gate — `node "$C/scripts/check-adjacency.mjs" --at 1dfd0d125b904b8267950a6c4f6ea93f7506b9c3 --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 0**:

```
{"verdict":"clean","rows":16,"verified":16,"findings":[],"selfRulings":[2],"at":"1dfd0d125b904b8267950a6c4f6ea93f7506b9c3",...}
```

Frozen counter — `node tabi-shokunin/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 1dfd0d1... --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1** (predicate not met wave-wide; this seat owns 9 of 67 candidates):

```
predicate False | candidates 67 | mapped 4 | screened 6 | unaccounted 57 | newMapped 0
newMappedRows [] | adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}
screenFindings [] | leadsReanchored ['corpus/knowledge/mirror-pitfalls.md:39@0440485 -> 40']
unaccountedKeys: contains no kaidoku key; perLane kaidoku = 9
```

Counter bytes verified against the freeze: `sha256sum .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` → `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` = `claims.json.frozenDigests`. The counter ran to completion (exit 1, one JSON object), which is itself the proof that `scripts/check-adjacency.mjs` at REV still matches its pinned digest (a mismatch is `exit 2 / not verified`).

Quote verification — every quote checked with `grep -F` against the `git show` bytes (15/15 rc=0, word counts 5-19, all within 4-25 words and >= 20 non-space chars); the full transcript is `AdjKaidoku/quotecheck.txt`. Examples:

```
git show fa6a8a3f85ec:corpus/knowledge/2026-10-13-r3-runtime-observation.md | sed -n '99p' | grep -F -- '`rea capture-browser-scenario <inputJson>` runs an explicit Playwright'   -> rc=0 words=7
git show 1dfd0d125b90:SKILL.md | sed -n '2923p' | grep -F -- 'kaidoku'"'"'s `capture-browser-scenario` runs a declared action list against a caller-supplied endpoint'   -> rc=0 words=11
git show 1dfd0d125b90:SKILL.md | sed -n '2924p' | grep -F -- 'a recorded HAR is one network channel here, admitted as an evidence artifact only when its producer is named'   -> rc=0 words=19
```

## Findings for wave 2 / the integrator

1. **The both-sides-named clause is the binding constraint on my slice.** All nine kaidoku lead lines are set-B (they never name tabi), so a truthful split cannot be credited as `newMapped`; it can only raise `mapped`. Three of my rows are exactly that: real distinct boundaries, verified, `mapped` 1 → 4, `newMapped` 0. Attack seat: check each of the three surfaces really is distinct from `cdp-runtime-observation` (my argument is on the object — execution vs observation, recorded artifact vs endpoint, comparison semantics vs capture) and that the six screens are not real overlaps.
2. **`selfRulings: [2]`** — the ruled row still rests on the tabi self-venue spot-check line, unchanged by me; I added no `ruled` row because no fleet-repo ruling outside `.ufo/` names kaidoku on these surfaces and the round-16 ruling's subject is CDP observation, which I did not stretch onto HAR or comparison semantics.
3. **A11y-tree capture is a judgment call I made against a map row**: tabi *does* hold accessible-tree capture on loopback (`SKILL.md:2889`), but kaidoku's line states only that a passive inspection returns an `accessibility` structure — a provider payload inside the ruled boundary. If the L1 reads that as a distinct surface, the screen row 45 reason must change to a map row, and the boundary to argue is "who captures an a11y tree", not "who may attach".
4. **Provenance note for the gate:** kaidoku's lane branch is `main` (no `master`); my pin is an ancestor of it, and the gate's `tips` map prints `kaidoku-shokunin: refs/heads/main`. Any future seat that assumes `master` will mis-read the ladder.
5. **Not done here, by contract:** no L0 line drafted (`l0.txt` absent — nothing contested), no lane file touched, no judge/commit outside my clone, no browser launched, no tool installed or upgraded (nothing needed).

## Deliverables

- `.ufo/waves/round-34/w1/AdjKaidoku.md` — this report.
- `.ufo/waves/round-34/w1/AdjKaidoku/rows.tsv` — 3 map rows, 9 TAB columns, real tabi line numbers (`SKILL.md:2923-2925`).
- `.ufo/waves/round-34/w1/AdjKaidoku/rows-placeholder.tsv` — same rows before substitution (`SKILL.md:DECL<n>`).
- `.ufo/waves/round-34/w1/AdjKaidoku/decl.md` — the three declaration bullets (DECL1-DECL3) plus the surfaces they back.
- `.ufo/waves/round-34/w1/AdjKaidoku/screen.tsv` — 6 screen rows, 5 TAB columns, header exactly `sibling_ref	reason	surface	quote	note`.
- `.ufo/waves/round-34/w1/AdjKaidoku/decisions.md` — per-candidate table (key | decision | reason grounded in both sides' lines).
- `.ufo/waves/round-34/w1/AdjKaidoku/adj.json`, `c1.json` — raw gate and counter stdout at `1dfd0d1`.
- `.ufo/waves/round-34/w1/AdjKaidoku/quotecheck.txt` — the 15 `grep -F` quote checks.

Scratch (`/fast/scratch/hyaku/tabi-r34/AdjKaidoku`, clone + TMPDIR) was removed after the receipts above were copied into the output dir.
