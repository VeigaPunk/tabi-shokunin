# ScribeErrataS128 — S128 supersede (tabi round 34 w1, frontier)

**Verdict: the three ReopenS128 locator/stamp defects reproduce independently and the superseding row is drafted, structurally tested and ready for the L1.** I re-opened both cited documents myself at 2026-10-26T19:47Z (nine read-only HTTPS GETs, all HTTP 200, digests identical three ways — my fetches, round-33 w1's lane receipts at `.ufo/waves/round-33/w1/ScribeSrcLauncher/receipts/`, and the digests pinned in `corpus/SOURCES.md:142`) and read the fetched bytes: `_launcher_ver=8` is at `PKGBUILD:12` while S128's anchor cell cites `:13` (which is `_manual_clone=1`) — and `:13` is exactly where that token sits on branch `main` (`pkgver=156.0.8078.47`, fetched `19:47:58Z`), so the off-by-one came from the wrong revision's layout; the round-33 Gate row's PKGBUILD stamp `18:26:26Z` is not the pinned-URL fetch's stamp (my pinned fetch is `19:47:34Z`, and `18:26:26Z` belongs to the byte-identical `0b95e2e` corroboration fetch recorded at `.ufo/waves/round-33/w1/ScribeSrcLauncher/fetch-receipts.tsv:17`, whose `:15` is the pinned fetch at `18:24:16Z`); and the lesson's draft pointers `row-S128.md:7` / `:50` resolve only at `:10` / `:53` at all three revisions I checked (`042d6d9a`, the round-34 freeze, the baseline). One precision gain beyond the reopen: the recipe pins the launcher by **tag** (`PKGBUILD:86` with `_launcher_ver=8` at `:12`), so the new anchor names `tag v8` as the locator and keeps commit `a7ed2cb8…` as the byte-identity check (tag and commit fetches `IDENTICAL` for both `launcher.c` and `Makefile`). Every substantive S128 cell holds unchanged; the row line I deliver, pasted verbatim into a scratch clone of the registry, reads `rows=130 findings=0` exit 0.

## Evidence (commands, exit codes, file:line)

### 1. The eight fetches (all `curl -q -sS --proto =https`; receipt `fetch-receipts.tsv`)

| name | URL host | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| `PKGBUILD.871c2ad9…` | gitlab.archlinux.org `/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD` | 2026-10-26T19:47:34Z | 200 | 18,285 | `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be` |
| `launcher.c.a7ed2cb8…` | raw.githubusercontent.com `foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c` | 19:47:35Z | 200 | 3,546 | `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624` |
| `Makefile.a7ed2cb8…` | raw.githubusercontent.com `…/a7ed2cb8…/Makefile` | 19:47:35Z | 200 | 1,219 | `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c` |
| `launcher.c.tag-v8` | raw.githubusercontent.com `…/v8/launcher.c` | 19:47:36Z | 200 | 3,546 | `b2772fe0…` (identical to the commit fetch) |
| `Makefile.tag-v8` | raw.githubusercontent.com `…/v8/Makefile` | 19:47:36Z | 200 | 1,219 | `1bed55f7…` (identical) |
| `gitlab-commits-154.0.8037.97-1.atom` | gitlab.archlinux.org `…/-/commits/154.0.8037.97-1?format=atom` | 19:47:37Z | 200 | 29,839 | `5e73eba6bbb2b63746cf4a0bfa6be10c4bb2b741626881d12a20b239034d15b8` |
| `github-commits-v8.atom` | github.com `foutrelis/chromium-launcher/commits/v8.atom` | 19:47:42Z | 200 | 15,912 | `c1ea5b725bb53f3581880bd135ee47d5dc08945933994944aa15c06153a8d94a` |
| `PKGBUILD.ref-154.0.8037.97-1` | gitlab.archlinux.org `/raw/154.0.8037.97-1/PKGBUILD` | 19:47:42Z | 200 | 18,285 | `a6fd458b…` (byte-identical to the commit fetch) |
| `PKGBUILD.main` | gitlab.archlinux.org `/raw/main/PKGBUILD` | 19:47:58Z | 200 | 18,157 | `3acef740544ddc45d8652219388711e1816a6cbcec1a2f8e2a4ba98a5e8b08e0` |

Hosts used: `gitlab.archlinux.org` (4), `raw.githubusercontent.com` (4), `github.com` (1) — all on the allowed list. No
404 occurred (so the "record a 404 by body text" rule had nothing to apply to), no tokens, cookies or consequential
actions, no browser launched.

**Digest identity (three-way):** `sha256sum` over round-33 w1's lane receipts
(`.ufo/waves/round-33/w1/ScribeSrcLauncher/receipts/{PKGBUILD.871c2ad9…,launcher.c.a7ed2cb8…,Makefile.a7ed2cb8…}`) →
`a6fd458b…961be`, `b2772fe0…82624`, `1bed55f7…b508c`, exit 0 — equal to my fetches and to `corpus/SOURCES.md:142`.

**Ref pins, re-derived from my own atom bytes:** the GitLab atom's newest commit id is `…/commit/871c2ad960ad54af03579cb90a1c9656485ea598` with title `upgpkg: 154.0.8037.97-1` and feed title `chromium:154.0.8037.97-1 commits` (so ref tip = the pinned commit); the GitHub atom's newest id is `…Grit::Commit/a7ed2cb89fe28c91199524c828866201c9d6b5e5` under `Recent Commits to chromium-launcher:v8` (so tag `v8` tip = the pinned launcher commit).

### 2. Locators (receipt `out/locator-check.txt`, read from the sha256-verified bytes)

- PKGBUILD `871c2ad9…` (18,285 B, 511 lines): `:12` `_launcher_ver=8`; `:13` `_manual_clone=1`; `:86` launcher tarball URL; `:109`–`:132` `sha256sums` with `:110` = `213e50f4…4483a` (24 source entries `:85`–`:108`, 24 sums); `:328` `make -C chromium-launcher-$_launcher_ver`; `:438` `make PREFIX=/usr DESTDIR="$pkgdir" install`; `:444` `install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"`.
- launcher.c `a7ed2cb8…` (3,546 B, 134 lines): `:15`, `:18-29` (with `:26`), `:47-48`, `:93-94`, `:106-107`, `:109-110`, `:124` — all verified by line; `:106` appends the binary, `:107` concatenates the flags list, `:109-110` the caller's argv.
- Makefile `a7ed2cb8…` (1,219 B, 41 lines): `:5` `CHROMIUM_BINARY  = …` (double space verbatim), `:30` `install -D …`.
- `cmp` tag-vs-commit: `launcher.c` IDENTICAL, `Makefile` IDENTICAL; `cmp` ref-name-vs-commit PKGBUILD: IDENTICAL (exit 0 each).
- D1's wrong-revision diagnosis: `PKGBUILD.main` has `pkgver=156.0.8078.47` (`:11`) and `_launcher_ver=8` at **`:13`** (`_manual_clone=0` at `:14`) — the layout the old cite matches.

### 3. Pointer resolution (receipt `out/path-checks.txt`)

`git grep -n '^| S128 |'` at `042d6d9abf97d567d495652a85eabc851b81adc1`, `59f1b47aae277e1670e4a824173da8cde7e388ee` and
`15dfaccb34601c2d221c78501e2befd8998d600c` over `.ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md` → registry row
`:10`, Gate row `:53` at every revision. `corpus/lessons/round-33.md:36` is the S128 Gate row (stamps
`2026-10-26T18:26:26Z and 2026-10-26T18:23:50Z`); `:51` carries the stale `row-S128.md:7` / `Gate line `:50`` pointers.
`corpus/SOURCES.md:142` is the S128 registry row.

### 4. Structural test of the delivered row (scratch clone at the freeze, `59f1b47`)

```
node scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md
  row pasted as S132, lesson absent  → FINDING id=used_by_missing fleet=E11 row=S132 detail=path_missing;
                                       verdict=failed rows=130 findings=1                                    exit=1
  with corpus/lessons/round-34.md fixture (names S132) → verdict=clean rows=130 findings=0                  exit=0
  id cell left as S13X → FINDING id=bad_id fleet=E02 row=- detail=id_invalid; rows=129                     exit=1
  row line extracted from the DELIVERED file, S13X→S132 → verdict=clean rows=130 findings=0                 exit=0
node scripts/check-sources.mjs --self-test → SOURCES_SELFTEST verdict=clean cases=26                        exit=0
```

The delivered line carries 12 pipes / 11 cells and is byte-identical (id aside) to the row that verifies — the L1
pastes exactly what was tested. The duplicate `source` URL is accepted only because `teaches` opens
`supersedes S128 —` (`scripts/check-sources.mjs:296`).

### 5. Lane state

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` → 8 untracked entries, all round-34 wave
artifacts (`.ufo/waves/round-34/w1/…`, the wave's spec/dispatch/ready files and `baseline/measure-at-baseline/`); no
tracked file modified, HEAD still `59f1b47`. I wrote only this report and my output dir. No tool was installed or
upgraded (`curl`, `git`, `node`, `python3` present); no counter was run (not this item); no browser or chromedriver was
started by me — the `chromium` pids visible on the host belong to the session's own window and to the harness daemon's
throwaway profile (`/home/vgpnk/.omp/run/daemons/…/omp.browser.headless.profile`), not to this seat.

## Findings

| id | severity | finding |
|---|---|---|
| D1 | low (confirmed) | `corpus/SOURCES.md:142` anchor's first locator is one line off: `_launcher_ver=8` is `PKGBUILD:12`; `:13` is `_manual_clone=1`. Corrected in the supersede row, plus the `:13` meaning is spelled out so the error cannot recur unnoticed. |
| D2 | low (confirmed) | `corpus/lessons/round-33.md:36` stamps the PKGBUILD at `18:26:26Z`, the corroboration fetch's stamp, not the pinned-URL fetch's (`18:23:50Z` launcher.c matches its pin, so the asymmetry is an error, not a convention). Supersede Gate row carries `19:47:34Z`/`19:47:35Z`, each its own fetch. |
| D3 | low (confirmed) | `corpus/lessons/round-33.md:51` cites `row-S128.md:7` and Gate line `:50`; the row is at `:10`, the Gate row at `:53` at all three revisions checked. Corrected pointers are in the old→new log line. |
| P1 | precision (new) | The recipe pins the launcher by tag (`:86` + `_launcher_ver=8`); S128's anchor named the commit as the locator. The new anchor names `tag v8` and keeps the commit for byte identity. |
| C1 | integration constraint | A literal `S13X` id is red (`bad_id` E02). The L1 must substitute the next free numeric id and land a round-34 lesson containing that literal (`used_by_missing` E11 otherwise). |

## Out of scope / not done

- No repair of S128, `corpus/lessons/round-33.md`, `corpus/SOURCES.md` or any lane file (contract rule 2: correction is a new row; seats never edit lane files).
- The launcher tarball (`213e50f4…4483a`) was not re-downloaded — `codeload.github.com` is outside the allowed hosts.
- The installed package's build stamp was not matched to a packaging commit and no host probe (pacman/`--help`) was run; neither bears on a locator correction.
- No C1/C2 counter run, no chrome/chromedriver, no tooling change.

## Deliverables

- `.ufo/waves/round-34/w1/ScribeErrataS128.md` — this report.
- `.ufo/waves/round-34/w1/ScribeErrataS128/s128-supersede.md` — the superseding row (paste-ready, `S13X` placeholder plus substitution rule), its cell-by-cell delta against S128, its own Gate entry (URL, UTC, status, bytes, sha256, located quotes), the old→new log line for the round-34 lesson, the locator table, the structural test and the integration constraints.
- `.ufo/waves/round-34/w1/ScribeErrataS128/fetch-receipts.tsv`, `fetch.sh`.
- `.ufo/waves/round-34/w1/ScribeErrataS128/receipts/` — the nine fetched byte-files.
- `.ufo/waves/round-34/w1/ScribeErrataS128/out/` — `locator-check.txt`, `path-checks.txt`, `check-132-red.txt`, `check-132-green.txt`, `check-132-green-restored.txt`, `check-13X-placeholder.txt`, `check-deliverable-row.txt`, `check-sources-selftest.txt`.

Scratch `/fast/scratch/hyaku/tabi-r34/ScribeErrataS128` (clone included) is deleted after the receipts were copied;
nothing of it remains on disk.
