# AdjMado1 — C1 build, 10 mado candidates (round 35, w1)

**Verdict.** All 10 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjMado1.tsv` are screened in the new ledger `corpus/adjacency-screen-browser.tsv` as `not-browser-sense`, 0 map rows proposed, 0 `DECL` lines, no `l0.txt`. Each line's browser-ground regex hit is a *token* on mado's compositor/theme plane (a `hyprctl clients -j` window class, a systemd uwsm scope name, a hypr window-rule pattern, an app-state directory name, or a rendered theme filename); none states mado's side of any tabi `PROVINCE.md:6-13` surface, so step 1 of the decision rule (`SKILL.md:2861-2881`) answers and no row was manufactured. In the scratch clone at `fda19ba8283cb451a81a714e25a793f7707a21ed`: `adjacency=clean rows=16 verified=16`, `screenFindings=[]`, my 10 keys absent from `unaccountedKeys`, `newMapped 0` (nothing of mine to map), `newRowRefusals []`. `predicate=not-met` at my commit only because the other seats' chunks are not yet dispositioned (`unaccounted 373` of 383, none of them mine) — expected for a w1 chunk seat, not a claim about C1.

## Evidence (commands and exit codes)

1. Clone at the freeze, tools run only there:
   `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` → exit 0;
   `git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` → exit 0;
   `git -C $S/clone rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r35/AdjMado1/clone` (asserted before every git write).
2. Candidate set confirmed from the frozen counter itself, not from the chunk file:
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --list-candidates --repo $S/clone --fleet /home/vgpnk/Projects/shokunin` → mado contributes **20** candidates at pin `e0be61e4f6e34896f8b1c329f9c6d129e5af81f7`; the 10 in my chunk are those in `hyprland-gkeep-geometry-r43.md`, `province-accuracy-selfaudit.md` (2), `remaining-planes-census.md` (5), `theme-route-r18.md` (2).
3. Sibling bytes read at the pin, per line, with 6-8 lines of context and each file's opening 12-16 lines:
   `git -C /home/vgpnk/Projects/shokunin/mado-shokunin show e0be61e4…:<path> | sed -n '<l-6>,<l+6>p'` → exit 0 for all 10.
   Sibling province read at the pin: `git -C …mado-shokunin show e0be61e4…:PROVINCE.md` → exit 0 (`:6-9` owns the hypr/theme planes, `:14-16` refusals, `:18` round-19 theme-plane refinement).
   Tabi side: `PROVINCE.md:6-13` (owns: webbridge, browser inventory + profile census, CDP session discipline, interaction records, dynamic-page evidence) and `PROVINCE.md:15-19` (refuses: RE forensics, publishing, secrets).
4. Quote validation before write: each quote asserted to be a verbatim substring of the cited line at the pin and to satisfy the counter's `goodQuote` shape (4-25 words, ≥20 non-space chars) or the whole-trimmed-line alternative; observed word counts 2-13, non-space chars 41-77. Row shape asserted: exactly 5 TAB columns, no TAB/newline inside a field.
5. Clone commit: `git -C $S/clone add corpus/adjacency-screen-browser.tsv`; `git -C $S/clone -c user.name=AdjMado1 -c user.email=AdjMado1@scratch.local commit -q -m "scratch: AdjMado1 round-35 screen ledger (10 mado candidates)"` → exit 0, `HEAD = fda19ba8283cb451a81a714e25a793f7707a21ed`; `git diff --stat a4bfef0f… HEAD` → `1 file changed, 11 insertions(+)` (header + 10 rows, nothing else touched).
6. Frozen counter:
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev fda19ba8283cb451a81a714e25a793f7707a21ed --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1**, `C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=fda19ba82… adjacency=clean candidates=383 mapped=0 screened=10 unaccounted=373 newMapped=0 screenFindings=0`.
   JSON fields lifted verbatim: `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`, `candidates 383`, `screened 10`, `screenFindings []`, `newMappedRows []`, `newRowRefusals []`, `perLane.mado 20`.
7. Per-key check against that JSON: 10 of my 10 rows count as screened; `sum(k in unaccountedKeys for k in my keys) = 0`; the 10 residual `mado` unaccounted keys are `theme-route-r18.md:145` and `theme-wallpaper-plane.md:52,93,196,200,230,353,354,377,378` — **not my chunk**, left to whichever Adj seat owns them.
8. Committed ledger blob: `corpus/adjacency-screen-browser.tsv` at `fda19ba8` → sha256 `62f6a6d68c62a4bb0bae94be022a30c14849d8fc8bfc41f9b1efffac90f4cdf5` (11 lines).
9. No tool was installed or upgraded this round; no pacman transaction, no network fetch, no browser launched (this seat launches none). No writes outside my output dir and my scratch clone; the lane checkout, lane index, fleet repo and sibling repos were read-only (`git show` only).

## Findings / limits

- **F1 (seat-level, disclosure).** My chunk yields **no** new map row, so this seat contributes 0 of the lane's `newMapped >= 2` target; the target must come from other chunks. I did not convert a screen into a map row to help it (QUALITY 88/97: a row that verifies clean is not coverage).
- **F2.** `same-surface` was unavailable for every one of my lines by construction: `corpus/adjacency.tsv` holds no verified row with `sibling = mado`.
- **F3.** The 10 residual mado candidates (item 7) are the ones closest to browser ground (the `/etc/chromium/policies/managed/color.json` adoption question at `theme-wallpaper-plane.md:196,353,377,378`); if C1 is to reach `newMapped >= 2` honestly, that is where the lane's real candidate lives, and it is outside my chunk.

## Deliverables

- `.ufo/waves/round-35/w1/AdjMado1/screen.tsv` — 10 rows, no header (ledger body).
- `.ufo/waves/round-35/w1/AdjMado1/rows.tsv` — empty (0 map rows).
- `.ufo/waves/round-35/w1/AdjMado1/decl.md` — empty (0 `DECL` lines).
- `.ufo/waves/round-35/w1/AdjMado1/decisions.md` — per-key decision plus one-sentence ground on both sides' bytes.
- `.ufo/waves/round-35/w1/AdjMado1/counter-check.json` — the frozen counter's JSON at `fda19ba8`.
- No `l0.txt` (no `contested-open` row).
