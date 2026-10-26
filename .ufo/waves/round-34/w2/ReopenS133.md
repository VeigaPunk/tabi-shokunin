# ReopenS133 — round 34 w2 FALSIFY, row S133 (supersedes S128)

**Verdict: holds.** I found no defect. Every anchor S133 cites re-opens at the stated line against the pinned bytes, all digests match, the row is 11 cells with no inner `|`, the supersession is well-formed (S128's bytes are unchanged against baseline 15dfaccb and integration 04f9623), the `:13` → `:12` correction is right, and the teaches claim stays within what the bytes say. Two observations at the end are informational (severity none/trivial).

## Fetches (curl -q -sS --proto =https; all read-only GET)
| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD | 2026-10-26T20:12:46Z | 200 | 18285 | a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be (= row) |
| raw.githubusercontent.com/foutrelis/chromium-launcher/v8/launcher.c | 20:12:47Z | 200 | 3546 | b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624 (= row) |
| …/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c | 20:12:48Z | 200 | 3546 | b2772fe0… identical to tag fetch ("byte-identical at the tag and at the commit" holds) |
| …/v8/Makefile | 20:12:48Z | 200 | 1219 | 1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c (= row) |
| …/a7ed2cb8…/Makefile | 20:12:48Z | 200 | 1219 | 1bed55f7… identical |
| github.com/foutrelis/chromium-launcher/archive/v8/chromium-launcher-8.tar.gz (→ codeload …/refs/tags/v8) | 20:12:55Z | 200 | 4725 | 213e50f48b67feb4441078d50b0fd431df34323be15be97c55302d3fdac4483a (= PKGBUILD:110 sum, so the tarball the package builds is the v8 tag) |
| github.com/foutrelis/chromium-launcher.git/info/refs?service=git-upload-pack | 20:12:56Z | (stream) | n/a | `refs/tags/v8^{}` = a7ed2cb89fe28c91199524c828866201c9d6b5e5 (tag object 1cf72148…); "tag v8 = commit a7ed2cb…" holds |
| gitlab…/-/raw/154.0.8037.97-1/PKGBUILD | 2026-10-26T20:13:31Z | 200 | 18285 | a6fd458b… identical to the commit fetch ("ref 154.0.8037.97-1" holds) |

## Anchors located (bytes as fetched)
- PKGBUILD:12 `_launcher_ver=8`; :13 `_manual_clone=1` (S128 said :13 for `_launcher_ver=8` — wrong; S133's `:12` is right); :4-5 pkgver=154.0.8037.97 pkgrel=1.
- PKGBUILD:85 `source=(` is the first entry (chromium tarball); :86 `https://github.com/foutrelis/chromium-launcher/archive/v$_launcher_ver/…tar.gz` is the second entry; the source array runs :85-108 = 24 entries; :109 `sha256sums=(` first sum 2e2f36e3…, :110 = `213e50f4…4483a` second sum; sums :109-132 = 24 `'<64hex>'` entries (counted). "second of sha256sums :109-132 — 24 entries each" holds.
- PKGBUILD:328 `make -C chromium-launcher-$_launcher_ver`; :438 `make PREFIX=/usr DESTDIR="$pkgdir" install`; :444 `install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"`.
- launcher.c:15 `/etc` + CHROMIUM_NAME "-flags.conf"; :18-29 XDG_CONFIG_HOME else HOME/.config; :48 `g_shell_parse_argv` per line (shell-splits each line); :93-94 system then user flags concatenated; :106-107 args = CHROMIUM_BINARY then flags; :109-110 original argv[1..] appended after; :124 `execv(CHROMIUM_BINARY, exec_args)`.
- Makefile:5 `CHROMIUM_BINARY = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)` (CHROMIUM_NAME=chromium, :3-4); :30 `install -D $(CHROMIUM_NAME) "$(DESTDIR)$(PREFIX)/bin/$(CHROMIUM_NAME)"` → with PREFIX=/usr (PKGBUILD:438) /usr/bin/chromium is the launcher; PKGBUILD:444 puts the browser at /usr/lib/chromium/chromium. The teaches claim ("/usr/bin/chromium is the launcher … prepends flags … before execv of /usr/lib/chromium/chromium; a recorded typed command is not the executed command") is exactly the bytes; no overreach. It correctly does not claim Chromium semantics for the flags (scope cell excludes them).
- Lesson Gate entry (corpus/lessons/round-34.md:35): URL, `PKGBUILD:12`: `_launcher_ver=8`, sizes 18,285 B / 3,546 B and short digests `a6fd458b…961be` / `b2772fe0…82624` all match. The 19:47:34Z/35Z stamps are the scribe's (my fetch 20:12 — different time, same bytes; not re-verifiable, not a defect). "stamp corrected" refers to round-33 Gate stamping the PKGBUILD at 18:26:26Z (corroboration fetch) — confirmed in ScribeErrataS128.md D2 / round-33.md:36.

## Structure
- `awk -F'|'` on SOURCES.md:147 → NF=13 (11 cells + 2 edge empties); no `|` inside any cell (cell 7 and 8 read whole). S128 line 142 likewise NF=13.
- Cells: id S133; kind `code` (PKGBUILD + C source); tier A (Arch packaging repo / upstream source at pinned revisions; scope cell limits to the Arch launcher, not Chromium flag semantics); status mined; opened 2026-10-26; recheck 90d; used-by `corpus/lessons/round-34.md`, which exists and cites S133 at :35 (grep) and in the "Rows touched" paragraph :37.
- `teaches` cell opens `supersedes S128 — ` (exactly) and ends with the locator correction.
- S128 unchanged: md5 of SOURCES.md line 142 at 15dfaccb == at 04f9623 == working tree (2c9fa5af…). Append-only holds. `node scripts/check-sources.mjs` on the lane checkout (read-only, structure) → `SOURCES_GATE verdict=clean rows=133 … findings=0`.
- Other S133 rows with the same URL pattern: no other stale `PKGBUILD:13` locator outside S128 itself (grep of corpus/ SKILL.md README.md hits only lines 142 and 147).

## Observations (not defects)
1. `corpus/knowledge/bidi-gate-selftest-round-34.md` does not cite S128/S133 at all (grep 0) — it builds on S127, S125, S130-S132. So the "claim the entry builds on the row" is vacuous for the entry; S133's only used-by is the lesson, which does cite it. Consistent, no overreach. The round-33 entry (`bidi-runtime-gate-v2-round-33.md:1,157-161`) still cites S128 with `:15`, `:18-29`, `:93-94`, `:124` — all correct; it never used the wrong `:13`, so the supersession leaves it valid.
2. Lesson Gate's S132 row says "drafted as its S133" (seat-local number) while the registry's S133 is the Arch row — the lesson's own row order disambiguates; trivial.

## Commands / exit codes
curl fetches: each returned 0 with the HTTP codes above; `base64 -d` not needed (raw GitLab/GitHub endpoints). sed/awk/grep reads of corpus/SOURCES.md, corpus/lessons/round-34.md, bidi entries: exit 0. `node scripts/check-sources.mjs` exit 0 (verdict clean). md5 comparisons via `git show 15dfaccb:…`/`04f9623:…`.

## Deliverables
This report only; receipts above are inline (fetch bodies deleted with scratch). Scratch /fast/scratch/hyaku/tabi-r34/ReopenS133 removed before yield.
