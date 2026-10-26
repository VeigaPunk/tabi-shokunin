# AdjKaidoku3 — C1 chunk build (16 kaidoku candidate lines)

**Verdict.** All 16 candidate lines in my chunk are dispositioned as **screens** and none as a map row: 15 `same-surface`
against the already-verified map row `cdp-runtime-observation` (sibling `kaidoku`) and 1 `third-lane-report` (line 116, a
host-environment measurement). The reason is uniform and comes from the sibling's own bytes: my chunk is one document —
`kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:corpus/knowledge/2026-10-13-r3-runtime-observation.md`, "Runtime-observation
surface: self-launched CDP endpoints" — and the sibling's own surface table line that the map already cites
(`kaidoku .../PROVINCE.md:53`) names exactly the legs these lines record: `chromium --headless --remote-debugging-port=9222`,
`xvfb-run electron --remote-debugging-port=9223`, `list_browser_targets`, `inspect-web-page`, `list_electron_targets`,
`inspect-electron-page`, `capture-browser-scenario`. That row is `ruled` by the round-16 verifier spot-check
(`corpus/lessons/round-16-verifier-spotcheck.md:142`: "**kaidoku** keeps CDP only as an REA provider surface for
shipped-artifact analysis"), so each line is a fact on the sibling's own side of an already-mapped split — a screen, not a
second overlap (decision rule `SKILL.md:2858-2881` step 2; QUALITY 91 last clause; QUALITY 97). Counter at my commit
`ed76dab`: `adjacency=clean rows=16 verified=16`, `screenFindings=0`, none of my keys in `unaccountedKeys`, 16 candidates
screened. The round-wide predicate is still `not-met` (`unaccounted=367`, `newMapped=0`) because those 367 candidates are
other seats' chunks and no seat may manufacture a map row this chunk does not support.

## Evidence (commands, exit codes)

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=/fast/scratch/hyaku/tabi-r35/AdjKaidoku3`, `TMPDIR=$S/tmp`.

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83`; `git rev-parse --show-toplevel` → `$S/clone` | 0 |
| 2 | `node .ufo/.../c1-adjacency-sweep-v3.mjs --list-candidates --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin` → 383 lines; my 16 keys matched with identical text (`matched=16`) | 0 |
| 3 | quote build/validation script (`build.mjs`, reads the sibling doc at pin `49096c7e` with `git show`): every chunk text equals the trimmed raw line at that pin, every quote is a verbatim substring with 4–25 words and ≥20 non-space chars (whole trimmed line where the line is shorter) → `rows=16` | 0 |
| 4 | `git -C "$S/clone" -c user.name=AdjKaidoku3 -c user.email=AdjKaidoku3@scratch.local commit` → `ed76dab7ee8c4e95ecf2ce8cf1d24af8eaa3ab4c`, adds `corpus/adjacency-screen-browser.tsv` (17 lines: header + 16), worktree `status --porcelain` = 0 | 0 |
| 5 | `node .../c1-adjacency-sweep-v3.mjs --rev ed76dab7ee8c4e95ecf2ce8cf1d24af8eaa3ab4c --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | **1** (predicate not met, round-wide) |
| 6 | same counter, text mode | **1** |

Counter reading (row 5, `counter-check.json`): `adjacency {"verdict":"clean","rows":16,"verified":16,"findings":0}`,
`candidates 383`, `mapped 0`, `screened 16`, `unaccounted 367`, `newMapped 0`, `newRowRefusals []`,
`screenFindings 0` (all rows, and 0 on my keys), my keys ∩ `unaccountedKeys` = ∅, `perLane.kaidoku = 137` candidates.

Committed ledger bytes: `git rev-parse ed76dab:corpus/adjacency-screen-browser.tsv` → blob `6869bbf340c6bb914efb270ed05e0d1a67ced993`;
the blob's sha256 (`git cat-file -p` piped to `sha256sum`) is `4370c29967667f14b5fac79a9aee8cc3a45e3c6719f3be5dce78068595af0881`, identical to
`screen-ledger-committed.tsv` in my output dir.

## Decisions (16/16)

| line | reason | surface | why |
|---|---|---|---|
| 6 | same-surface | cdp-runtime-observation | "r3 launches its own Chromium" — the self-launched target the mapped row cites verbatim from kaidoku `PROVINCE.md:53`. |
| 14 | same-surface | cdp-runtime-observation | `list-browser-targets` on a caller-launched loopback CDP browser — the `list_browser_targets` leg of that surface. |
| 16 | same-surface | cdp-runtime-observation | `chromium --headless --remote-debugging-port=9222` is the mapped row's own sibling quote (same fact, earlier pin). |
| 25 | same-surface | cdp-runtime-observation | `rea-cdp-browser` v2 provider identity / Chrome product behind the same `/json/version` endpoint. |
| 61 | same-surface | cdp-runtime-observation | Electron `file://` targets on :9223 — the `list_electron_targets` leg. |
| 64 | same-surface | cdp-runtime-observation | `xvfb-run electron --remote-debugging-port=9223` self-owned app — named on the mapped surface. |
| 71 | same-surface | cdp-runtime-observation | `rea.electron-target-list` predicate on the same :9223 endpoint. |
| 100 | same-surface | cdp-runtime-observation | connect-mode attach to a supplied loopback CDP endpoint — `capture-browser-scenario`, named on the mapped surface. |
| 113 | same-surface | cdp-runtime-observation | `process_ownership: "external"` for that same connect-mode scenario — the sibling's stated practice inside the ruled CDP-as-REA-provider split. |
| 115 | same-surface | cdp-runtime-observation | duration/digest receipt of the same connect-mode scenario capture. |
| 116 | third-lane-report | - | Playwright's `headless-shell` cache on this host: an environment measurement taken inside its own probe, claiming nothing on tabi's browser-inventory census. |
| 124 | same-surface | cdp-runtime-observation | run-log step 1 launches the self-owned chromium instance. |
| 125 | same-surface | cdp-runtime-observation | the same launch's `:9222` / throwaway `--user-data-dir` flags. |
| 127 | same-surface | cdp-runtime-observation | HeadlessChrome UA of that same endpoint. |
| 139 | same-surface | cdp-runtime-observation | `/json/version` answer on the Electron :9223 endpoint. |
| 144 | same-surface | cdp-runtime-observation | teardown of only the tree it launched (same self-owned endpoint). |

Full reasoning per key (both sides quoted/grounded): `decisions.md`.

## No map row, no declaration, no L0 line

Three lines clear the counter's mechanical n4 floor (sibling quote matches BG **and** SIDE): :6 ("its own Chromium"),
:64 ("self-owned app"), :113 (`browser.process_ownership:`). Each states kaidoku's side of the **already-mapped** split, so
a row would be a fact on the sibling's own side of that split — a screen "whatever its surface name" (QUALITY 91). I did
not draft a DECL, `rows.tsv` carries 0 rows, and I request no fleet L0 line. If wave 2 judges the `same-surface` breadth
too coarse for the Playwright-scenario lines (:100/:113/:115 — tabi `PROVINCE.md:9` CDP session discipline vs kaidoku's
REA-provider scenario capture), the cheap repair is a re-reason on those three, not a new row.

## Touched surfaces

- Scratch clone only: `$S/clone` at `a4bfef0f…`, one commit `ed76dab` adding `corpus/adjacency-screen-browser.tsv`; delete-ready.
- Lane tree, lane index, lane jj state, fleet repo, sibling repos: untouched (read-only `git show`/`git rev-parse`).
- No browser launched, no geckodriver/chromium process, no network fetch, no tool installed or upgraded, no build/lint/format of the lane.

## Deliverables (all under `.ufo/waves/round-35/w1/AdjKaidoku3/`)

| file | sha256 | note |
|---|---|---|
| `screen.tsv` | `0fc33a2e32117e00c02879ece5790b1419cb5b09a431b774e18cf8ca88bc323d` | 16 rows, no header (merge-ready) |
| `screen-ledger-committed.tsv` | `4370c29967667f14b5fac79a9aee8cc3a45e3c6719f3be5dce78068595af0881` | exact bytes committed at `ed76dab` (header + 16) |
| `rows.tsv` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | 0 map rows |
| `decl.md` | `a240e13ad21d94a84f5fb9943a91fe546e09544da7f514554b6948a61be73afb` | states why no DECL exists |
| `decisions.md` | `686b8e08583f98d27fcd6fa53c708ebedcdf77f0cfe28f63fe1369bc18c1c7e4` | 16 keys, reason, both-sides ground |
| `counter-check.json` | `2534ecefdf29d27f5151bf0c28025596dedc63c85614c5c3b40ce55c8e0de700` | counter `--json` at `ed76dab` |
| `counter-text.txt` | `94ac60c1b43cb0bb99d81086c3409cd122984a9d8d1744c3f023a12d5bc7dec6` | one-line verdict, exit 1 |

L1 integration note: append the 16 `screen.tsv` rows to `corpus/adjacency-screen-browser.tsv` **after** the header row
(`sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`); the file does not exist at the freeze, so the L1 creates it.
