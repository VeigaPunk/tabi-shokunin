# CritScreenMadoTsukuroi — C1 screen-row attack, mado|tsukuroi (w2, round 35)

Item: attack the C1 screen rows of sibling lanes `mado|tsukuroi` in
`corpus/adjacency-screen-browser.tsv` — 40 rows (mado 20, tsukuroi 20). For each:
open the sibling line at its pin with context, judge the reason against the decision
rule (SKILL.md:2861-2881), check same-surface ground against `corpus/adjacency.tsv`,
and decide whether the line is a real overlap that should be mapped.

## Verdict

**HOLDS — no defect found.** All 40 screen rows are correctly classified under the
frozen decision rule: 37 `not-browser-sense`, 3 `no-claim-declared` (mado
`theme-wallpaper-plane.md:196,377,378`). No row should be relabeled and no row
should be mapped. Same-surface is impossible for both lanes: `adjacency.tsv` has zero
map rows for sibling `mado` or `tsukuroi` (existing rows cover kagi, kaidoku, kake,
kama, kumitate, revenger only), so decision-rule step 2 cannot apply to any row
here. Should-map is absent because neither sibling's PROVINCE.md at its pinned rev
declares a browser surface (mado: zero browser-token hits; tsukuroi: one hit,
R20-OUT009, which names *Revenger's* sibling declaration and is not a tsukuroi
grant of browser ground), and none of the 40 lines states the sibling's own side of
any tabi PROVINCE surface — every chromium token is a window-class token, a theme
filename, a systemd scope unit name, an OOM score-band class, a ps comm value, or
an attribution question routed to fleet/operator. Severity: n/a (no findings).

## Evidence

Commands (each with exit code); all sibling reads are read-only `git show` at the
frozen pins, run from scratch `/fast/scratch/hyaku/tabi-r35/CritScreenMadoTsukuroi`:

- `git -C /home/vgpnk/Projects/shokunin/mado-shokunin rev-parse --verify e0be61e4f6e34896f8b1c329f9c6d129e5af81f7` → exit 0 (pin exists).
- `git -C /home/vgpnk/Projects/shokunin/tsukuroi-shokunin rev-parse --verify a968393c678171f8a5a2907da5015735396da4cc` → exit 0 (pin exists).
- `python3 verify_screen.py` (scratch) → `target rows: 40`, `baseline candidates: 383`, `pass 40 / 40`, exit 0. The script, for each of the 40 rows: resolves the pinned line via `git -C <repo> show <rev>:<path>`; asserts the quote is a verbatim substring of that line; asserts quote word count 4–25 (or whole trimmed line ≤25); asserts ≥20 non-space chars; asserts reason ∈ {not-browser-sense, same-surface, third-lane-report, no-claim-declared}; asserts the key is a member of the frozen 383-candidate set (`.ufo/waves/round-35/baseline/c1-candidates.tsv`).
- Context windows (±3 lines around each pin) printed for all 40 pins from the pinned revs (bash `git show <rev>:<path> | nl -ba | sed -n 'M,Np'`), e.g.:
  - mado `hyprland-gkeep-geometry-r43.md:70`: `**OBS** S296 - the pinned dump holds four mapped clients and none is floating, for example `"class": "chromium", "floating": false,`` (hyprctl clients JSON, window-class token).
  - mado `theme-wallpaper-plane.md:196`: row `| \`chromium.theme\` | read by \`bin/omarchy-theme-set-browser\` → writes /etc/chromium/policies/managed/color.json | … | file pair resolved; adoption \`[UNK]\` |` — live-browser adoption explicitly unknown.
  - mado `theme-wallpaper-plane.md:377-378`: "the policy file matches the theme hex, but whether the running chromium re-read it in-session is unverifiable without a restart. `[UNK]`." — explicit non-claim.
  - tsukuroi `SKILL.md:2547`: "a +100 manager beats a +200 app only if it holds 1,690,900 pages … more than each +300 Chromium; event B's per-process sizes are unmeasured (F5)…" — OOM magnitude check.
  - tsukuroi `oom-event-plane.md:205`: "`systemd[1573]: Started app-org.chromium.Chromium-…` … Who drives this launch cadence is not visible read-only (Q6)." — systemd journal scope-start accounting.
  - tsukuroi `oom-event-plane.md:386` / `kill-event-deep-r8.md:294`: Q6/Q11 routed to fleet/operator ("process audit at the next occurrence"; "workload attribution (fleet lanes vs chromium automation); launcher identity still unproven") — attribution questions, not claims.
- `git show <rev>:PROVINCE.md | grep -inE 'chromium|browser|cdp|chrome|webdriver|selenium|playwright'` → mado: 0 hits; tsukuroi: 1 hit at line 150 naming Revenger's sibling declaration (not tsukuroi's own ground). Neither sibling declares a browser surface.
- Map sibling inventory from `corpus/adjacency.tsv`: `kagi, kaidoku, kake, kama, kumitate, revenger` — no mado/tsukuroi rows (so no `same-surface` can apply; step 2 of the decision rule has no row to name).

Per-row grounds: `verdicts.tsv` (40 rows, all `ok`).

## Counts

- Total attacked: 40 (mado 20, tsukuroi 20).
- `ok` 40; `relabel` 0; `should-map` 0.
- By reason: `not-browser-sense` 37; `no-claim-declared` 3; `same-surface` 0; `third-lane-report` 0.

## Deliverables

- `verdicts.tsv` — /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenMadoTsukuroi/verdicts.tsv (key | verdict | correct reason+surface | one-sentence ground)
- This report — /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenMadoTsukuroi.md
- Scratch: /fast/scratch/hyaku/tabi-r35/CritScreenMadoTsukuroi/ (verify_screen.py + clone; removed at yield)
