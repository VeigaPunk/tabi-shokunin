# S128 supersede — corrected locators, own Gate entry, old→new log (seat ScribeErrataS128, tabi round 34 w1, frontier)

**Verdict.** Round 33's ReopenS128 found three low-severity locator/stamp defects in the S128 row and its Gate line and
left every substantive cell standing; re-opening both documents myself at 2026-10-26T19:47Z (nine read-only HTTPS
GETs, all HTTP 200) reproduces all three — `_launcher_ver=8` sits at `PKGBUILD:12` in the pinned bytes while the row
cites `:13` (`_manual_clone=1`), the Gate row's PKGBUILD stamp `18:26:26Z` is not the pinned-URL fetch's stamp, and the
lesson's draft pointers `row-S128.md:7` / `:50` resolve only at `:10` / `:53` — and adds one precision gain: the
launcher cell should name the recipe's own pin (`tag v8`), with the commit id as the byte-identity check rather than as
the locator. The superseding row below carries corrected locators, an accessible Gate entry stamped with *my* fetches,
and the old→new log line for the round-34 lesson. No digest, quote, kind, tier, scope or status cell changes: S128's
substance holds byte-for-byte (`a6fd458b…`, `b2772fe0…`, `1bed55f7…`).

Round-33 spot-check routed defect 5 (`ReopenS128: three locator/stamp defects`) is answered by this file; the row is a
new row (CORPUS.md `SOURCES.md` contract rule 2: a correction is a new row whose `teaches` opens `supersedes S0NN —`),
so **S128 at `corpus/SOURCES.md:142` is not rewritten**.

## 1. The three defects, re-derived from my own fetches (not taken from ReopenS128)

| # | defect | old | observed in the pinned bytes | how I saw it |
|---|---|---|---|---|
| D1 | anchor's first PKGBUILD locator is one line off | `PKGBUILD:13,86,110,328,438,444` | `:12` = `_launcher_ver=8`, `:13` = `_manual_clone=1` | `out/locator-check.txt` §PKGBUILD, read from the sha256-verified 18,285 B fetch |
| D2 | Gate row's PKGBUILD accessed stamp is not the pinned-URL fetch's | `2026-10-26T18:26:26Z` | my pinned-commit fetch is stamped `2026-10-26T19:47:34Z`; the old stamp is the `0b95e2e` corroboration fetch's (byte-identical bytes) | `receipts/` stamps + `.ufo/waves/round-33/w1/ScribeSrcLauncher/fetch-receipts.tsv:15` (pinned fetch, `18:24:16Z`) and `:17` (`0b95e2e`, `18:26:26Z`) — quoted, not re-run |
| D3 | Gate-prose pointers into the draft do not resolve | `row-S128.md:7` and `:50` | the registry row is `row-S128.md:10`; the Gate row is `:53` — same at `042d6d9a` and at the round-34 freeze | `git grep -n '^\| S128 \|'` over that file at both revisions (`out/path-checks.txt`) |

D1's diagnosis is now grounded by my own fetch rather than by a sibling receipt: at branch `main`
(`PKGBUILD.main`, HTTP 200, 18,157 B, sha256 `3acef740…5e8b08e0`, fetched `19:47:58Z`) `pkgver=156.0.8078.47` and
`_launcher_ver=8` really is at **`:13`** (`_manual_clone=0` at `:14`). The `:13` cite matches the main-branch layout,
not the pinned commit's — which is exactly how an off-by-one survives a review.

Precision gain beyond ReopenS128 (not a defect, a locator quality): the recipe pins the launcher by **tag**
(`:86` = `…/archive/v$_launcher_ver/chromium-launcher-$_launcher_ver.tar.gz`, `_launcher_ver=8` at `:12`), so the
superseding anchor names `tag v8` and keeps the commit `a7ed2cb8…` as the byte-identity check (my `launcher.c` and
`Makefile` fetches at tag and at commit compare `IDENTICAL`).

## 2. The superseding row (paste-ready, one line)

L1 substitution rule: replace `S13X` with the next free numeric id **after** this wave's scout rows (the w1 spec
reserves `S130`/`S131` for the two C2 source scouts; `S132` appears in that spec only as an example). A literal
`S13X` is *not* a valid registry id — `check-sources.mjs` rejects it with `FINDING id=bad_id fleet=E02 row=-
detail=id_invalid`, rows 129, exit 1 (`out/check-13X-placeholder.txt`). I ran the structural test with `S132` as the
stand-in.

```markdown
| S13X | Arch chromium PKGBUILD and the chromium-launcher v8 it builds at package 154.0.8037.97-1 — https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD | code | A | what the Arch chromium launcher does with chromium-flags.conf and which binary it execs at package 154.0.8037.97-1; not Chromium's own semantics for those flags and not other distros' wrappers | PKGBUILD:12,86,110,328,438,444 at commit 871c2ad960ad54af03579cb90a1c9656485ea598 (ref 154.0.8037.97-1, PKGBUILD sha256 a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be; `_launcher_ver=8` at :12 with `_manual_clone=1` at :13; launcher tarball source :86 is the second `source` entry and its sum :110 is the second of `sha256sums` :109-132 — 24 entries each — `213e50f48b67feb4441078d50b0fd431df34323be15be97c55302d3fdac4483a`); launcher.c:15,18-29,93-94,106-107,109-110,124 and Makefile:5,30 at chromium-launcher tag v8 = commit a7ed2cb89fe28c91199524c828866201c9d6b5e5 (launcher.c sha256 b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624, byte-identical at the tag and at the commit; Makefile sha256 1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c) | supersedes S128 — /usr/bin/chromium is the chromium-launcher v8 binary: it reads /etc/chromium-flags.conf then $XDG_CONFIG_HOME/chromium-flags.conf (else $HOME/.config/chromium-flags.conf), shell-splits each line, and prepends those flags to argv before execv of /usr/lib/chromium/chromium, so a recorded typed command is not the executed command; S128's anchor cell pointed at PKGBUILD:13 for `_launcher_ver=8`, which is at :12 in the pinned bytes | mined | 2026-10-26 | 90d | corpus/lessons/round-34.md |
```

### Cell-by-cell delta against S128 (`corpus/SOURCES.md:142`)

| cell | S128 | this row | why |
|---|---|---|---|
| `id` | S128 | next free (`S13X` placeholder) | contract rule 2: a correction is a new row, never an edit |
| `source` | same one URL | **unchanged** | the primary artifact is still the packaging recipe at the installed `pkgver`'s commit |
| `kind` / `tier` / `scope` | `code` / `A` / mechanism + exec target, exclusions stated | **unchanged** | ReopenS128 verified every substantive cell; nothing here bears on them |
| `anchor` | `PKGBUILD:13,86,110,328,438,444`; `launcher.c:15,18-29,93-94,124`; `Makefile:5,30` "at chromium-launcher v8 commit a7ed2cb8…" | `PKGBUILD:**12**,86,110,328,438,444` (with `:13` named as `_manual_clone=1`, so the next reader cannot re-derive the off-by-one); `launcher.c:15,18-29,93-94,**106-107,109-110**,124`; "at chromium-launcher **tag v8 = commit** a7ed2cb8…" | D1; the two added ranges are the lines that make `teaches`' "prepends those flags to argv" a located claim (`:106` binary, `:107` flags, `:109-110` caller's args); the recipe pins a tag, so the tag is the locator |
| `teaches` | `/usr/bin/chromium is the …` | `supersedes S128 — /usr/bin/chromium is the …` + one clause naming the corrected locator | contract rule 2 requires the `supersedes` opener; the clause is the errata |
| `status` / `opened` / `recheck` | `mined` / `2026-10-26` / `90d` | `mined` / `2026-10-26` / `90d` | I opened the documents this round; the recipe changes per release and the launcher pin is version-independent, so `90d` is the floor (`on-release` also defensible) |
| `used-by` | `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` | `corpus/lessons/round-34.md` | that note carries the literal `S128`, not this row's id — `used_by_uncited` would fire; the round-34 lesson carries the old→new line below, which names this id |

## 3. Gate entry for `corpus/lessons/round-34.md` §Gate

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S13X | https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD and https://raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c | 2026-10-26T19:47:34Z and 2026-10-26T19:47:35Z (ScribeErrataS128; both HTTP 200; PKGBUILD 18,285 B sha256 `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be`, byte-identical when re-fetched by ref name `154.0.8037.97-1` at 19:47:42Z; launcher.c 3,546 B sha256 `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624`, byte-identical at tag `v8`; `Makefile` 1,219 B sha256 `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c` at 19:47:35Z) | `PKGBUILD:12`: `_launcher_ver=8` (with `_manual_clone=1` at `:13`); `PKGBUILD:86` carries the launcher tarball URL and `:110` its sha256; `launcher.c:26`: "path = g_build_filename(home, \".config\", CHROMIUM_NAME \"-flags.conf\", NULL);" (9 words); `launcher.c:124`: "return execv(CHROMIUM_BINARY, exec_args);" (5 words); `Makefile:5`: "CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)" |

Gate prose for the same section:

```
S13X (Arch chromium launcher — supersedes S128): reopened 2026-10-26 by ScribeErrataS128 with read-only GETs.
PKGBUILD at commit 871c2ad960ad54af03579cb90a1c9656485ea598 = ref 154.0.8037.97-1 tip (HTTP 200, 18,285 B, sha256
a6fd458b…961be; byte-identical at the ref name, 19:47:42Z) — note `_launcher_ver=8` is at :12 and `_manual_clone=1` at
:13, the :13 cite in S128 having matched the main-branch layout (main: pkgver 156.0.8078.47, _launcher_ver at :13,
sha256 3acef740…e08e0, 18,157 B). chromium-launcher launcher.c + Makefile at tag v8 = commit
a7ed2cb89fe28c91199524c828866201c9d6b5e5 (launcher.c HTTP 200, 3,546 B, sha256 b2772fe0…82624, byte-identical at tag
and commit; Makefile 1,219 B, sha256 1bed55f7…b508c). `launcher.c:106-107` prepends the flags-file arguments to argv
before `:124`'s execv of Makefile:5's binary, which is the cell this row teaches. Scope unchanged from S128: what the
Arch launcher does, not flag semantics and not other distros' wrappers; the launcher tarball digest 213e50f4…4483a is
pinned by the recipe, not re-downloaded.
```

## 4. Old→new log line for `corpus/lessons/round-34.md`

```
- **S128 → S13X (superseding row, append-only correction).** anchor `PKGBUILD:13,86,110,328,438,444` →
  `PKGBUILD:12,86,110,328,438,444` (`_launcher_ver=8` is at :12 in the pinned bytes; :13 is `_manual_clone=1`; the
  :13 cite matches main-branch layout) and `launcher.c:15,18-29,93-94,124` → `launcher.c:15,18-29,93-94,106-107,109-110,124`;
  launcher locator "v8 commit a7ed2cb8…" → "tag v8 = commit a7ed2cb8…" (the recipe pins the tag, :86/:12; bytes at
  tag and commit identical). Gate accessed `2026-10-26T18:26:26Z and 2026-10-26T18:23:50Z` → `2026-10-26T19:47:34Z and
  2026-10-26T19:47:35Z` (each the pinned-URL fetch's own stamp; the old PKGBUILD stamp belongs to the byte-identical
  0b95e2e corroboration fetch). round-33 lesson pointers `row-S128.md:7` and `:50` → `row-S128.md:10` and `:53`
  (verified at 042d6d9a and at the round-34 freeze). No digest, quote, kind, tier, scope or status cell changes;
  `corpus/SOURCES.md:142` is not rewritten (contract rule 2).
```

## 5. Locator table — every locator of the row, read from the sha256-verified bytes

`out/locator-check.txt` is the receipt. PKGBUILD `871c2ad9…` (18,285 B, 511 lines):

| line | content |
|---|---|
| `:12` | `_launcher_ver=8` |
| `:13` | `_manual_clone=1` |
| `:85` | `source=(https://commondatastorage.googleapis.com/chromium-browser-official/chromium-$pkgver-lite.tar.xz` |
| `:86` | `        https://github.com/foutrelis/chromium-launcher/archive/v$_launcher_ver/chromium-launcher-$_launcher_ver.tar.gz` |
| `:109`–`:132` | `sha256sums=(` … 24 entries, `:110` = `213e50f48b67feb4441078d50b0fd431df34323be15be97c55302d3fdac4483a` |
| `:328` | `  make -C chromium-launcher-$_launcher_ver` |
| `:438` | `  make PREFIX=/usr DESTDIR="$pkgdir" install` |
| `:444` | `  install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"` |

Ordering check behind the `:86` ↔ `:110` pairing: `source` (`:85`–`:108`) = 24 entries, `sha256sums` (`:109`–`:132`) =
24 entries, so the second source entry's sum is the second sum; the pairing itself is recipe structure, not a fetch.

launcher.c `a7ed2cb8…` (3,546 B, 134 lines): `:15` `return g_build_filename("/etc", CHROMIUM_NAME "-flags.conf", NULL);`;
`:18-29` `default_user_flags_conf_path()` (`:23-24` XDG when set, `:25-26` else `$HOME/.config`); `:47-48`
`while (fgets…)` / `if (!g_shell_parse_argv(buf, &argcp, &argvp, NULL))`; `:93-94` system-then-user `g_slist_concat`;
`:106` `args = g_slist_append(args, g_strdup(CHROMIUM_BINARY));`, `:107` `args = g_slist_concat(args, flags);`, `:109-110`
caller's argv appended after; `:124` `return execv(CHROMIUM_BINARY, exec_args);`.
Makefile `a7ed2cb8…` (1,219 B, 41 lines): `:5` `CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)` (two
spaces, verbatim); `:30` `	install -D $(CHROMIUM_NAME) "$(DESTDIR)$(PREFIX)/bin/$(CHROMIUM_NAME)"`.

## 6. Structural test of the row (red → green), in my scratch clone at the freeze

```
$ git -C $S/clone rev-parse HEAD                    # 59f1b47aae277e1670e4a824173da8cde7e388ee
$ node scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md      # row pasted as S132, lesson absent
FINDING id=used_by_missing fleet=E11 row=S132 detail=path_missing
SOURCES_GATE verdict=failed rows=130 … findings=1                                exit=1   (out/check-132-red.txt)
$ node scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md      # with corpus/lessons/round-34.md fixture
SOURCES_GATE verdict=clean rows=130 tiers=A:115,B:6,C:9 status=queued:15,mined:106,rejected:9 findings=0   exit=0
                                                                                          (out/check-132-green.txt)
$ node scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md      # id cell left as S13X
FINDING id=bad_id fleet=E02 row=- detail=id_invalid ; rows=129                  exit=1   (out/check-13X-placeholder.txt)
$ node scripts/check-sources.mjs --self-test
SOURCES_SELFTEST verdict=clean cases=26                                          exit=0   (out/check-sources-selftest.txt)
$ # the row line extracted from THIS file (§2 fence), id swapped S13X→S132, pasted into the registry:
$ node scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=130 … findings=0                                 exit=0   (out/check-deliverable-row.txt)
```

The green run also demonstrates the duplicate-URL allowance: the row repeats S128's `source` URL and is accepted only
because `teaches` opens `supersedes S128 —` (`scripts/check-sources.mjs:296`, read in the clone). The fixture lesson
file was a two-line stub naming `S132`; it is *not* the round-34 lesson and lives only in my deleted scratch.

The last run is the one that matters: the delivered line has 12 pipes (11 cells) and is byte-identical to the row that
verifies, so what the L1 pastes is exactly what was tested.

## 7. Integration constraints the L1 must honour

1. Substitute a **numeric** id for `S13X` (E02 otherwise) — next free after the two scout rows.
2. Land the row together with a `corpus/lessons/round-34.md` that contains the literal new id (old→new line above);
   otherwise `used_by_missing` E11 fires (red receipt above). The row is `mined`, so `used-by` cannot be `—`.
3. Do **not** rewrite `corpus/SOURCES.md:142` (S128) — contract rule 2 makes the correction a new row; the errata
   clause inside `teaches` plus the lesson's old→new line is the whole correction.
4. Do not "fix" `corpus/lessons/round-33.md:36,51` in place; that round's lesson is closed. The round-34 lesson's
   old→new line carries the corrected stamps and pointers.
5. `used_by_uncited` is content-based: the lesson must spell the id, not just reference this file.

## 8. Limits (stated, not hidden)

- The launcher **tarball** digest (`213e50f4…4483a`, `PKGBUILD:110`) is the recipe's pin; I did not re-download it
  (`github.com/…/archive/v8/…` redirects to `codeload.github.com`, outside this seat's allowed hosts). Verified
  instead: `launcher.c` and `Makefile` are byte-identical at tag `v8` and at the pinned commit.
- The installed package's build stamp (2026-10-09 07:41:57 -03) is still not matched to a packaging commit; identity
  rests on the round-33 pacman/digest records, which I did **not** re-run this round (no host probe was needed for a
  locator correction, and none was made).
- `/usr/bin/chromium --help` was not run: `launcher.c:98-102` would print the host flags file's contents.
- The main-branch PKGBUILD fetch is used only to diagnose D1's wrong-revision layout; it grounds no cell of the row.
- No JSON/`?format=TEXT` decode was needed — every fetch was a plain-text file at a pinned ref.
- No lane file, lane index or lane jj state was touched; no tool was installed (nothing was needed: `curl`, `git`,
  `node`, `python3` present).

## 9. Commands (as run; exit codes inline above)

```
S=/fast/scratch/hyaku/tabi-r34/ScribeErrataS128
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee
TMPDIR=$S bash "$S/fetch.sh"                           # 8 GETs → fetch-receipts.tsv, exit=0 (the 9th is PKGBUILD.main below)
curl -q -sS --proto =https -o receipts/PKGBUILD.main …/-/raw/main/PKGBUILD   # D1 diagnosis, 200, 18,157 B
awk/grep over receipts/{PKGBUILD.871c2ad9…,launcher.c.a7ed2cb8…,Makefile.a7ed2cb8…} → out/locator-check.txt
cmp receipts/launcher.c.tag-v8 receipts/launcher.c.a7ed2cb8…    # IDENTICAL
cmp receipts/Makefile.tag-v8   receipts/Makefile.a7ed2cb8…      # IDENTICAL
cmp receipts/PKGBUILD.ref-154.0.8037.97-1 receipts/PKGBUILD.871c2ad9…  # IDENTICAL
git -C "$S/clone" grep -n '^| S128 |' HEAD -- corpus/lessons/round-33.md .ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md
node scripts/check-sources.mjs --root "$S/clone" --file corpus/SOURCES.md   # red / green / placeholder
node scripts/check-sources.mjs --self-test                                  # cases=26, exit 0
```

## 10. Receipts (copied into this seat's output dir)

`fetch-receipts.tsv` (9 GETs: name, URL, UTC, HTTP, bytes, sha256), `fetch.sh` (method), `receipts/` (the fetched
bytes: `PKGBUILD.871c2ad9…`, `PKGBUILD.ref-154.0.8037.97-1`, `PKGBUILD.main`, `launcher.c.a7ed2cb8…`,
`launcher.c.tag-v8`, `Makefile.a7ed2cb8…`, `Makefile.tag-v8`, `gitlab-commits-154.0.8037.97-1.atom`,
`github-commits-v8.atom`), `out/` (`locator-check.txt`, `path-checks.txt`, `check-132-red.txt`,
`check-132-green.txt`, `check-132-green-restored.txt`, `check-13X-placeholder.txt`, `check-deliverable-row.txt`,
`check-sources-selftest.txt`, `self-pointers.txt`).
