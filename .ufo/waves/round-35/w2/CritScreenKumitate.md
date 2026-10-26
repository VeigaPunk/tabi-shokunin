# C1 screen-row attack — CritScreenKumitate (wave w2, round 35)

Item: attack the C1 screen rows of sibling lane `kumitate` in `corpus/adjacency-screen-browser.tsv` (66 rows, all in `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md`). Findings only; no repair.

## Verdict

**Holds.** All 66 kumitate screen rows (60 `same-surface kimi-webbridge-plugin-internals`, 6 `not-browser-sense`) survive attack: every reason obeys the decision-rule order (`SKILL.md:2861-2881`), every quote is verbatim at the pinned commit (all mechanically valid under the frozen counter's quote rules), and no line states kumitate's own side of any tabi surface that the existing map does not already answer — so zero rows should-map. Two caveats, neither a defect that changes any count or account. (1) ~30 rows label facts about the *user-scope / harness-root copies* of the kimi-webbridge skill (a separate install kumitate explicitly distinguishes from the managed plugin at `kimi-skills-plugins.md:282,286`) as `same-surface` on the plugin-internals split; this is sustainable only through kumitate's own routing clause (`:318-321`: "the browser-extension payloads" belong to tabi) plus QUALITY 91's screen case, and a strict reader could relabel them `not-browser-sense` without changing any count (no new row, no unaccounted). (2) The ledger's note column inconsistently cites "row 9" vs "row 10" for the same surface (the kimi-webbridge-plugin-internals row is `adjacency.tsv:10`); cosmetic only.

## Evidence

### Mechanical counter at the wave-1 integration rev (083c5c643be7aa5965a5de3458a32ed0d289ead3)

```
$ cd /fast/scratch/hyaku/tabi-r35/CritScreenKumitate
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin clone          # exit 0
$ git -C clone checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3   # exit 0
$ TMPDIR=$PWD node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
    --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo clone \
    --fleet /home/vgpnk/Projects/shokunin --json > counter-at-integration.json
$ echo $? → 1
```

JSON receipt (`counter-at-integration.json`): `adjacency {verdict:clean, rows:17, verified:17, findings:0}`, `candidates 383`, `mapped 1`, `screened 382`, `unaccounted 0`, `newMapped 1` (predicate false only because `newMapped 1 < 2`), `screenFindings []`, `perLane.kumitate 66`, `unaccountedKeys []`. So every kumitate candidate is accounted by exactly one screen row; no screen is a non-candidate, duplicate, bad-quote or bad-reason row.

### Quote / candidate verification (scratch script)

For each of the 66 keys, resolved the source line at pin `8d557f85` (`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85:corpus/knowledge/kimi-skills-plugins.md`) and checked: quote is a verbatim substring, or the whole trimmed line with ≤25 words (15 short path/heading quotes valid only via the whole-line branch, e.g. `:337`, `:433`, `:502-505` — all pass); line matches the frozen BG regex; line does not name `tabi`; `same-surface` rows carry a surface and non-same-surface rows carry `-`. 0 violations.

### Side-word scan (SIDE regex from counter line 83)

Only 5 candidate lines carry any SIDE token: `:247` ("its own title" — possessive), `:294` ("skill's own" — possessive), `:315` ("is now owned by two" — census bookkeeping, not ownership of a surface), `:381` ("plugin's own manifest" — possessive), `:415` ("own schema URL" — possessive). None states a side of a split; so no line could support a split-declared (or ruled/contested/refused) map row under n4. The two lines with genuine routing language sit on the already-mapped surface: `:249` (daemon binary version; the next line `:250` concedes "the daemon itself is tabi's ground" — the mapped daemon/plugin-internals surface), and `:486` (daemon endpoint routed to kama — the transport/extension ground is the mapped plugin surface; endpoint routing to a third lane adds no tabi surface).

### Decision-rule application (SKILL.md:2861-2881) — representative rows

- `:218`, `:224`, `:225`, `:471`, `:574`, `:581` → step 1 fails (bare heading / filesystem probes / log-telemetry absence / structural sentences): `not-browser-sense` stands.
- Plugin-package/registry/daemon rows (`:6,249,284,303,337,338,343,361,368,371,381,383,386,390,395,396,405,406,415,432,433,442,486,502,503,504,505,566,569,570`) → step 2: row `adjacency.tsv:10` (`kimi-webbridge-plugin-internals`, kumitate, split-declared, verified 17/17 at the integration rev) owns the surface; the rows are facts about the mapped plugin package / install record / daemon transport. `same-surface` stands.
- User-copy / harness-copy rows (`:230,232,235,236,238,239,241,242,243,244,247,256-262,267,271,274-277,291,292,294,302,304,315`) → step 2 by kumitate's own clause `:318-321` ("the browser-extension payloads" belong to tabi) and QUALITY 91's screen case (a fact on the sibling's own side of an already-mapped split is a screen); the surface label is loose because the user copy is a separate install (2.0.26, 19437 B) versus the managed plugin skill (1.11.3, 11880 B) that tabi's `webbridge-plugin-anatomy.md` documents. Screen decision correct either way; no line can be mapped (no side word), so the alternative reading only changes the reason label, never the account.

### Sibling and tabi bytes read at pins (all `git show`, read-only)

- `kumitate-shokunin@8d557f85:corpus/knowledge/kimi-skills-plugins.md` (581 lines) — full read; boundary clause at `:318-321`, daemon concession at `:250`, install-difference framing at `:324`, user-copy vs plugin distinction at `:269-286`.
- `kumitate-shokunin@8d557f85:PROVINCE.md` — orchestration/tooling; Kimi Code substrate rows K1-K5; no browser-owning line.
- `tabi-shokunin@083c5c6:corpus/knowledge/webbridge-plugin-anatomy.md` — documents the managed plugin package (§1-4), daemon install root (§5), registry (§3), extension presence (U3); never mentions the user-scope copy.
- `tabi-shokunin@083c5c6:PROVINCE.md:6` — "Owns (surfaces): the kimi-webbridge plugin (`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate documentation".

## Counts

- rows examined: 66 (all kumitate rows in the ledger)
- verdict ok: 66 (same-surface 60, not-browser-sense 6)
- verdict relabel: 0 (caveat (1) above: the user-copy cluster's label rests on the sibling's `:318-321` routing clause; strict relabel to `not-browser-sense` would not alter any count)
- verdict should-map: 0
- no row withdrawn; kumitate contributes no `newMapped` row to the claim (consistent with wave 1).

## Deliverables

- `corpus/adjacency-screen-browser.tsv` kumitate rows → attacked; findings only, nothing edited.
- Output dir `.ufo/waves/round-35/w2/CritScreenKumitate/`:
  - `verdicts.tsv` — key | verdict | correct reason+surface | one-sentence ground (66 rows + header)
  - `counts.txt` — counts
  - `counter-at-integration.json` — frozen C1 counter receipt at 083c5c6
- This report: `.ufo/waves/round-35/w2/CritScreenKumitate.md`

No tools installed, no network fetches, no browser launches, no builds/linters (leaf seat). Scratch `/fast/scratch/hyaku/tabi-r35/CritScreenKumitate` (clone inside) deleted after receipts were copied.
