# RerunCensus — round-33 w2 (falsify): SOURCES census re-run at 042d6d9

**Verdict: holds (no defect).** The registry re-run at lane commit
`042d6d9abf97d567d495652a85eabc851b81adc1` in a clean `--shared` clone reproduces the frozen baseline census
byte-for-byte and adds exactly the three registry rows the round-33 Gate claims — **126 rows at baseline `b7d16fb8`
→ 129 rows at `042d6d9`** (S127–S129) — with `sources-census.sh validate` exit 0, `node scripts/check-sources.mjs`
`verdict=clean rows=129 findings=0` exit 0, zero malformed rows (NF≠13 = 0), tier `A=114 B=6 C=9`, status
`mined=105 queued=15 rejected=9`, zero duplicate ids, zero enum/tier-inflation violations, and zero mined rows whose
`used-by` paths are missing. The only census findings at all are the 20 pre-existing `W04 duplicate url … across
scopes` warnings, which are identical to the frozen baseline set and exit 0 (no new row introduced a duplicate URL).
The three rows are well-formed and honest to the contract: S127 `code/A/mined`, S128 `code/A/mined`, S129 `docs/A/mined`,
all `opened 2026-10-26`, `recheck 90d`, `used-by corpus/knowledge/bidi-runtime-gate-v2-round-33.md`, each URL unique in
the registry, and the cited note exists and carries the literal tokens `S127`/`S128`/`S129` plus its provenance trio.
The used-by enforcement is real, measured red-before: hiding that note in the clone turns the same command into three
`FINDING id=used_by_missing fleet=E11` lines and exit 1.

## Evidence — commands, exit codes, files

Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then
`git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1`; all commands `cd "$S/clone"`.
Provenance (`00-provenance.txt`): HEAD `042d6d9abf97d567d495652a85eabc851b81adc1`, toplevel `$S/clone`,
node `v24.21.0`, `sources-census.sh` sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`,
`corpus/SOURCES.md` sha256 `94189062b8f197ea61be2e3aea9b1c6396ec8bedb010cd410fac2a06f3f0c833`, clone dirty 0 entries.

| # | command | exit | result |
|---|---|---|---|
| 1 | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/clone/corpus/SOURCES.md"` | **0** | 20× `W04 duplicate url …` + `ok` line (baseline set, unchanged) |
| 2 | `node scripts/check-sources.mjs` | **0** | `SOURCES_GATE verdict=clean rows=129 tiers=A:114,B:6,C:9 status=queued:15,mined:105,rejected:9 findings=0` |
| 3 | `node scripts/check-sources.mjs --self-test` | **0** | `SOURCES_SELFTEST verdict=clean cases=26` |
| 4 | CORPUS.md manual census block (rows, malformed, tiers, statuses, duplicate ids, enum/tier inflation, mined used-by existence) | **0** | rows `129`; malformed `0`; `A=114 B=6 C=9`; `mined=105 queued=15 rejected=9`; duplicate ids empty; violations empty; missing used-by empty |
| 5 | `git -C "$S/clone" show b7d16fb8…:corpus/SOURCES.md \| grep -cE '^\|…S[0-9]{3,}…\|'` | 0 | **126** (Gate's "126 rows at the baseline (R6)" verified) |
| 6 | red-before: `mv corpus/knowledge/bidi-runtime-gate-v2-round-33.md` away, `node scripts/check-sources.mjs`, restore, re-run | 1 → 0 | without note: `FINDING id=used_by_missing fleet=E11 row=S127/S128/S129 detail=path_missing`, `verdict=failed rows=129 findings=3`, **exit 1**; restored: `verdict=clean findings=0`, **exit 0**, clone dirty 0 |
| 7 | baseline-vs-rerun diff (`cut -f2-` to drop the repo label; `--file` mode prints `file`, fleet-root discovery printed `tabi`) | `diff_exit=0` | finding sets byte-identical, 22 normalised lines each |
| 8 | control for (7): inject `S999` in one W04 line; append an extra W04 line | 1 / 1 | the comparison is shown able to fail; (7) is not vacuous |

Column-level read of the three new rows (`07-new-rows.txt`, `awk -F'|'` on `corpus/SOURCES.md:141-143`):

```
S127 | ChromeDriver 154 session-id generator — util.cc | code | A | … | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md
S128 | Arch chromium PKGBUILD + chromium-launcher v8 …     | code | A | … | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md
S129 | The Linux Sandbox — sandbox/linux/README.md        | docs | A | … | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md
```

URL uniqueness for each new row: `chrome/test/chromedriver/util.cc` = 1 occurrence, `gitlab.archlinux.org/…/PKGBUILD`
raw path = 1, `sandbox/linux/README.md` = 1 (`grep -cF`). Parser parity: frozen manual `grep` (column-zero) = 129 and
leading-space-tolerant `^[ ]{0,3}\|` = 129, with 0 rows at 4+ leading spaces — no row hides from the frozen awk.

## Findings

1. **Rows 126 → 129 (+3).** Exactly S127, S128, S129, matching the Gate's admitted set and its reasons; no other row
   changed `status`, `recheck` or `used-by` (status histogram is the baseline's plus three `mined`).
2. **W04 duplicate-URL warnings: 20, pre-existing, exit 0.** The ids are S058, S065, S066, S068, S069, S070, S073,
   S074, S075, S076, S077, S095, S096, S098, S099, S100, S114, S115, S118, S123 — the baseline list unchanged, and none
   of the three 2026-10-26 rows is in it. This is a warning class the lane gate does not enforce (contract forbids
   duplicate *ids*, not duplicate URLs); not a round-33 regression.
3. **`used_by_missing` (E11) holds as a live rule**, measured red-before and restored in the clone (row 6 above); the
   Gate's claim that the note is load-bearing for S127–S129 is reproduced independently, with `rows=129` in both states.
4. **Observation, informational, not a defect against the census:** the w2 brief's framing that the SCORECARD correction
   is "the only change between `bf48b81` and `042d6d9` besides measure files" is incomplete by one file —
   `git diff --stat bf48b81c… 042d6d9a…` also lists `.ufo/waves/round-33/w2-spec.json` (+236, absent at `bf48b81`).
   `corpus/SOURCES.md` itself is identical across the two revisions (`git diff --quiet … -- corpus/SOURCES.md`,
   exit 0), so the census reading is unaffected.
5. No census-relevant defects found; I did not touch lane files and did not run the lane's build/lint/test gates
   (out of scope for an editing wave; the parent owns them).

## Hygiene

No tool installed or upgraded (nothing needed; `pacman` untouched — transaction guard respected). No network fetch, no
browser run, no chromedriver/chromium started. `pgrep -fa 'chromedriver|chromium'` after the run: only the system
`/usr/bin/earlyoom` matcher line (pid 1371, not mine) and a sibling seat's `curl` of S128's PKGBUILD (pid 816841, not
mine) — none owned by this seat. Scratch `/fast/scratch/hyaku/tabi-r33/RerunCensus` removed after receipts were copied.

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/RerunCensus.md` (this file)
- Receipts in `.ufo/waves/round-33/w2/RerunCensus/`:
  - `00-provenance.txt` — sha256 `50723c0739e0315a184fb6b1cf02e9970f05b720930ff130f12a2421f46185e0`
  - `01-census-validate.txt` — sha256 `daec399a9e3a722af35414fd4eceaca597cfe6db6beea8e155e9f2aea3e5b642`
  - `02-check-sources.txt` — sha256 `6abffebdfa995d15dbda4830c61db1b7bdfa4b9270906f0dd3e990cbfc2ba850`
  - `03-selftest.txt` — sha256 `f73d5fc7272d2d27eb07cd44acfb16538fb14066310f6acf79f2293f45568139`
  - `04-census-manual.txt` — sha256 `3bffc079c1e07baa58aad1a425ea76dbe2fa96246891ef4a06f191123b4367fa`
  - `05-usedby-red-before.txt` — sha256 `c1b03a8d25a606876545f856406eeaa2910fe6dee34b44ccdef5ae7cd3bc2524`
  - `06-baseline-diff.txt` — sha256 `b837ba741fcacd838cdd0d241259b7a17382a44a0870bdfec5dc365677ee1c38`
  - `07-new-rows.txt` — sha256 `bf4378dc3b772b51c7c6a4a3cf0740ce90d618dc92b71f916a2e04b37a502a5c`
  - `08-diff-control.txt` — sha256 `fb6b9f7a63aff55c554a20b5fb761439b9357d32589d5ea7c92434982fd0c981`
  - `09-baseline-census-start.txt` (verbatim copy of `baseline/census-start.txt`) — sha256
    `37368b34971d29e02b1b4e3e9ed1d9defd536a47a8be2d973b1af45041960959`
