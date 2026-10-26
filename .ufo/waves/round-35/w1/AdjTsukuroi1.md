# AdjTsukuroi1 — C1 build, chunk `AdjTsukuroi1.tsv` (10 tsukuroi lines)

**Verdict.** All 10 candidates in my chunk are accounted as `not-browser-sense` screens; I propose **no map row** and therefore draft no DECL or L0 line. Every line is one of tsukuroi's own host measurements (OOM score bands, systemd app-scope counts, a kernel OOM dump trigger) in which the frozen BG regex fires on a browser *process* name — `chromium` / `Chromium` / `GpuWatchdog` — while no browser is driven, observed, profiled or captured; tsukuroi's own `PROVINCE.md:30-33` says kill-event measurements "do not establish which fleet wave caused pressure" and that "fleet correlation belongs to mori", and ADJ-04 (`PROVINCE.md:49`) routes host pressure/kill attribution to mori, so none of these lines states tsukuroi's side of any tabi surface. Decision-rule steps 2-4 were each checked and do not fit (no verified map row owns a tsukuroi surface, so `same-surface` is impossible; the lines are tsukuroi's own work, not a report of another lane's; none declares a refusal/boundary/non-goal on tabi's surface). In the scratch clone at the freeze plus my ledger, the frozen counter reads **adjacency clean (16 rows, 16 verified, 0 findings), screenFindings [], my 10 keys absent from `unaccountedKeys`, newMapped 0, newRowRefusals []** — the predicate is false only because the other 373 candidates belong to sibling seats' chunks.

## Evidence (commands, exit codes)

Scratch: `S=/fast/scratch/hyaku/tabi-r35/AdjTsukuroi1`, `TMPDIR=$S/tmp`.

1. Clone + freeze checkout — exit 0.
   ```
   git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
   git -C "$S/clone" rev-parse --show-toplevel        # /fast/scratch/hyaku/tabi-r35/AdjTsukuroi1/clone
   git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
   git -C "$S/clone" rev-parse HEAD                   # a4bfef0f75027c915e715649950b1d46dcb33d83
   ```
   `corpus/adjacency-screen-browser.tsv` did not exist at HEAD (exit 128 from `cat-file -e`), so the ledger is new, not an edit.

2. Read the sibling at its frozen pin `tsukuroi-shokunin@a968393c678171f8a5a2907da5015735396da4cc` (c1-pins.json):
   - `git -C tsukuroi-shokunin show <pin>:PROVINCE.md` — owned surfaces at `:6-13` (pacman/systemd/journal/driver state), `:25-28` refusals (kama/kagi/kaidoku/revenger), `:30-33` "Host memory and kill-event measurements support OS triage; they do not establish which fleet wave caused pressure … fleet correlation belongs to mori", `:49` ADJ-04 → mori.
   - `git show <pin>:SKILL.md | sed -n '1,40p'` — tsukuroi playbook ("host operability & system repair playbook … Nothing here is oral knowledge").
   - `git show <pin>:corpus/knowledge/kill-event-deep-r8.md | sed -n '1,30p'` — "Kill-event plane deepened — the 13:10:59 SIGKILL's causal picture readable non-root"; `oom-event-plane.md:1-25` — "OOM-event plane … kernel OOM dumps, cgroup accounting, victims".
   - Context windows per candidate: `sed -n '<line-8>,<line+8>p'` on each of the 10 cited lines (see decisions.md for the per-line ground).

3. Quote validation before writing the ledger: each quote is a verbatim substring of the candidate line, 4-25 whitespace words and >= 20 non-space chars (all 10 pass; counts 5-11 words, 25-90 non-space chars).

4. Ledger commit in the scratch clone — exit 0.
   ```
   git -C "$S/clone" add corpus/adjacency-screen-browser.tsv
   git -C "$S/clone" -c user.name=AdjTsukuroi1 -c user.email=AdjTsukuroi1@scratch.local \
       commit -q -m "round-35 scratch: screen ledger for tsukuroi chunk (10 rows)"
   git -C "$S/clone" rev-parse HEAD   # 6fc23c1a4044d28513336f37ea23a9b22da58d8f
   # 1 file changed, 11 insertions(+)  (header + 10 rows)
   ```
   SKILL.md was **not** edited and `corpus/adjacency.tsv` was **not** touched: zero DECL lines exist to append (no map row proposed), so there is no `## Round 35 — scratch declarations` section in the clone.

5. Frozen counter — `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 6fc23c1a4044d28513336f37ea23a9b22da58d8f --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1** (evaluated, predicate not met — expected for a single chunk), raw output in `counter-check.json`:
   ```
   rev 6fc23c1a…  candidates 383  priorCandidatesSkipped 22  mapped 0  screened 10  unaccounted 373
   newMapped 0  newMappedRows []  newRowRefusals []
   adjacency {verdict: "clean", rows: 16, verified: 16, findings: 0}
   screenFindings []
   mine in unaccountedKeys: []        (all 10 keys screened)
   predicate false
   ```
   `screenFindings []` covers the whole ledger (my 10 rows are the only ones), so no finding on my keys; `newMapped` is 0 by construction because I proposed no row.

## Disposition summary (key → reason)

| key (sibling pin `a968393c…`) | decision |
|---|---|
| `SKILL.md:2547` | screen `not-browser-sense` — OOM-band pages-magnitude check; Chromium is a `+300` band member |
| `corpus/knowledge/kill-event-deep-r8.md:81` | screen `not-browser-sense` — last journal words naming an `app-org.chromium.…scope` unit |
| `corpus/knowledge/kill-event-deep-r8.md:140` | screen `not-browser-sense` — `+300` row of the measured OOM score class table |
| `corpus/knowledge/kill-event-deep-r8.md:148` | screen `not-browser-sense` — inference on kernel OOM task selection with `+200 Chromium clients` |
| `corpus/knowledge/kill-event-deep-r8.md:185` | screen `not-browser-sense` — "things at the kill second": six chromium scope launches with PIDs |
| `corpus/knowledge/kill-event-deep-r8.md:227` | screen `not-browser-sense` — launch-vs-live trap counting 69 `app-*.scope` units (50 chromium) |
| `corpus/knowledge/kill-event-deep-r8.md:236` | screen `not-browser-sense` — cadence corollary reading scope-launch rate ≈2/min |
| `corpus/knowledge/kill-event-deep-r8.md:260` | screen `not-browser-sense` — lever row 6, `oom_score_adj` steering, `/proc/*/oom_score_adj` detection |
| `corpus/knowledge/kill-event-deep-r8.md:294` | screen `not-browser-sense` — Q11 open question on scope-launch attribution, launcher unproven |
| `corpus/knowledge/oom-event-plane.md:62` | screen `not-browser-sense` — event A kernel OOM trigger, `GpuWatchdog` Chromium thread as allocator |

No candidate path matches the counter's `THIRD_LANE` pattern (`sibling|overlap|adjacen|fleet-skill-audit|description-rewrites`), and no candidate is cited by a baseline map row, so neither `third-lane-report` nor a rename route applies.

## Limits / out of scope

- These are screens, not overlap evidence: they account for the line, they do not claim tabi shares the surface. A wave-2 attack seat may contest any single `not-browser-sense` call; the ground offered is per row in decisions.md.
- The counter run is a **chunk-local** validation in my scratch clone (10 of 383 accounted). It is not the lane measurement and does not reach the frozen predicate; newMapped >= 2 must come from sibling chunks' map rows.
- Nothing was installed or upgraded (node and git were already present). No browser or driver was launched. No message was sent to `agent://all`.
- Scratch `/fast/scratch/hyaku/tabi-r35/AdjTsukuroi1` (clone included) was deleted after copying `counter-check.json`; nothing was written under the fleet root or to any lane tracked file.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjTsukuroi1/screen.tsv` — 10 rows, 5 TAB columns, no header.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjTsukuroi1/rows.tsv` — empty (no map row).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjTsukuroi1/decl.md` — records zero DECL lines.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjTsukuroi1/decisions.md` — per-key disposition with both-sides ground.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjTsukuroi1/counter-check.json` — raw frozen-counter output at `6fc23c1a`.
- No `l0.txt`: no contested-open row was drafted.
