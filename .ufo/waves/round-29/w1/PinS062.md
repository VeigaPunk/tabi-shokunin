# PinS062 — C3 re-open of registry row S062 at the new stable tag

Seat: PinS062 (leaf executor, milestone C3, wave tabi-r29-w1).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims read first at `97be89bc66139eb45526a04af59a35dccc006eb9` (`.ufo/waves/round-29/claims.json`, `frozenBeforeData: true`).
Old tag `154.0.8037.97`, new stable `156.0.8078.47`. No lane tracked file, index or jj state was written. Scratch: `/fast/scratch/hyaku/tabi-r29/PinS062` (removed at end; receipts copied out first).

## Verdict (headline)

**S062 holds at 156.0.8078.47 — all four files hold, all four anchored ranges hold.** No range drifted, so item 6 (superseding row) is **not triggered**; `entry.json.superseded_by` is `null` and no `supersede-row.md` was written (writing one would be a false drift claim). `content/browser/devtools/devtools_http_handler.cc` did move by **+11 lines** (anchored block 297-306 → 308-317) but its anchored text is byte-identical, so the counter counts the range as holding.

## 1. Files the row cites (11-column row, `corpus/SOURCES.md:76`)

Source cell carries one Gitiles URL; the anchor cell names three more by basename. Full `chromium/src` paths resolved from the round-18 dossier (`.ufo/waves/round-18/sources/SrcChromiumPipe.md`, fetch sweep table lines 41-45) and confirmed by the 154.0.8037.97 bytes themselves:

| # | path | anchor range(s) as spelled |
|---|---|---|
| 1 | `content/public/common/content_switches.cc` | `596-603` |
| 2 | `content/browser/devtools/devtools_pipe_handler.cc` | `135-200` |
| 3 | `chrome/browser/devtools/remote_debugging_server.cc` | `353-400` |
| 4 | `content/browser/devtools/devtools_http_handler.cc` | `297-306` |

Basename→path note: `remote_debugging_server.cc` lives under `chrome/browser/devtools/`, not `content/browser/devtools/` (the round-18 dossier recorded a 404 for `chrome/browser/devtools/devtools_pipe_handler.cc`, the wrong-directory twin; the pipe handler is under `content/browser/devtools/`). All four paths were re-fetched at both tags with HTTP 200 at those paths — the resolution is confirmed by the bytes, not assumed.

## 2. Fetches, statuses, digests, line counts

Command per file/tag (`$S=/fast/scratch/hyaku/tabi-r29/PinS062`):

```
code=$(curl -sS -o "$f" -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT")
base64 -d < "$f" > bytes/<tag>/<path>      # decode exit 0 for all 8
sha256sum bytes/<tag>/<path>
```

Fetch batch exit `0`; `fetch.log` in `receipts/` records all eight rows. Decode: exit 0, eight of eight.

| path | 154 status | 156 status | 154 sha256 | 156 sha256 | 154 lines | 156 lines |
|---|---|---|---|---|---|---|
| `content/public/common/content_switches.cc` | 200 | 200 | `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` | `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` | 990 | 990 |
| `content/browser/devtools/devtools_pipe_handler.cc` | 200 | 200 | `30b772e6f7fc34d1e30b9e288fd2f23aaf2b36b481eeb7180e44f08716583264` | `9ff89d7d46fdad7a94dbcca75adf9978aa6a7be1e3a18de785ddce712b5b5fb6` | 478 | 479 |
| `chrome/browser/devtools/remote_debugging_server.cc` | 200 | 200 | `9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d` | `9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d` | 424 | 424 |
| `content/browser/devtools/devtools_http_handler.cc` | 200 | 200 | `9fa47f6bec780d8dc6a9c2eb2132af24e51eb03fe342d24d1094227754f0b011` | `c9b306d5c2aeac078d50c6ebbfb44727c301ae11e5309a87da6a596f7d105680` | 1062 | 1095 |

Reproducibility: a second GET of the 156 `content_switches.cc` URL returned HTTP 200 and base64 sha256 `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e`, identical to the first fetch and identical to the round-18 dossier's recorded base64 digest for 154. Base64 digests of all eight responses are in `receipts/b64-sha256.txt`. `remote_debugging_server.cc` and `content_switches.cc` base64 digests are equal across tags, so those two files are unchanged between the tags — the sha equality is not a copy/paste slip.

Bytes on disk (decoded, exact chromium path) at
`.ufo/waves/round-29/w1/pins/S062/bytes/{154.0.8037.97,156.0.8078.47}/<chromium path>` — 8 files; `cmp` against the fetched copies exit 0 for all 8.

## 3. Registry digest

`rowDigests` finds **no** 64-hex and no `8hex…4hex` token in the row's source+anchor cells (`digest_count: 0`; the anchor carries line ranges only). `f5-digest` is therefore vacuously satisfied. There is no registry digest for S062 to match — recorded as *not applicable*, not as *matched*. The dossier's 8+4 abbreviation (`02621444…764e`) is in the knowledge entry, not in the registry row.

## 4. Range holds/drift (154 block vs 156 file, trimmed + inner-whitespace-collapsed, contiguous)

Check run twice: a Python `difflib` matcher and a Node replica of the counter's own `normLine`/`blockIn` (`receipts/blockin.json`, node exit 0). Both agree.

| path | range | verdict | 156 line where it now sits |
|---|---|---|---|
| `content/public/common/content_switches.cc` | 596-603 | **holds** | 596 |
| `content/browser/devtools/devtools_pipe_handler.cc` | 135-200 | **holds** | 135 |
| `chrome/browser/devtools/remote_debugging_server.cc` | 353-400 | **holds** | 353 |
| `content/browser/devtools/devtools_http_handler.cc` | 297-306 | **holds (moved +11)** | 308-317 |

No unified diff of a drifted region is owed: nothing drifted. The observed whole-file deltas (`receipts/http.diff`, diff exit 1 = differences present) are outside the anchored ranges: `devtools_http_handler.cc` 14 hunks, +45/−12 — `DCHECK*`→`CHECK*(…, base::NotFatalUntil::M159)` migrations at seven sites, a `kNativeFilePathStyle` constant block (`windows`/`posix`, new lines 92-98) with `#include "base/strings/strcat.h"` and `#include "url/origin.h"`, and a new `version.Set("File-Path-Style", kNativeFilePathStyle)` in `/json/version` (new line 631). `devtools_pipe_handler.cc` changed in two sites only: `DCHECK(crdtp::cbor::IsCBORMessage(...))`→`CHECK(..., base::NotFatalUntil::M159)` (new 305-306) and `DCHECK(browser_target_)`→`CHECK(browser_target_, base::NotFatalUntil::M159)` (new 436). The −11 shift accounting is exact: insertions at old 25 (+1), old 57 (+1), old 87 (+8) and old 272 (+1) sum to +11, and the anchored block lands at 308.

## 5. Counter dry run (proves the row resolves, without touching the lane)

Read-only clone, receipt and bytes staged **only inside the clone**, committed there:

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone rev-parse --show-toplevel   # $S/clone  (verified before the commit)
# commit cd2f5a44625b4b051a4c22dae3c24a8e87a48444, git status --porcelain -> 0 lines
node scripts/check-release-pins.mjs --rev cd2f5a4… --stable 156.0.8078.47 --json | jq '.rows[]|select(.id=="S062")'
```

Result (`receipts/dryrun-counter.json`, counter exit `1` because only 1 of 23 entries is staged in this clone):

```
population 23  resolved 1  unresolved 22  holds 1  drifted 0
S062 {"id":"S062","resolved":true,"verdict":"holds","reasons":[]}
```

`population=23` matches the claim's population; `S062` has **no reason codes** — `f1-old-tag`, `f2-path-bound` (3 files bound by anchor basename, 1 by source URL), `f3-bytes` (paths, presence, both shas), `f4-ranges` (each range inside the old line count and its `a-b` token present in the anchor cell), `f5-digest` (vacuous) and `f6-refetch` all pass. Frozen counter digest at the claims commit: `git show 97be89b:scripts/check-release-pins.mjs | sha256sum` → `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`; its self-test in that clone: `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20`, exit 0.

**Honesty boundary:** the `refetch/S062.json` used in the dry run carries seat `DryRunRefetch`. That is a **placeholder in my scratch clone only** and was deliberately **not** copied into the lane — `f6-refetch` requires a real independent re-fetch record from a seat other than `PinS062`. Owed by the wave: `corpus/evidence/round-29/release-pins/refetch/S062.json` (`{id,seat,fetched_at,files:[{path,tag:"156.0.8078.47",status,sha256}]}`, seat ≠ `PinS062`) and the byte copies at the committed paths my entry references.

## 6. Superseding row

Not written — nothing drifted. The row's scope cell is tag-bound ("Pipe versus HTTP transport at Chromium 154.0.8037.97"), so 11-line movement in a non-anchored region of a changed file is not a factual error in the row. Advisory 156-tag quote for the eventual recheck, `devtools_http_handler.cc:308`: "Write this port to a well-known file in the profile directory" (10 words); the pipe/port switch definitions sit unchanged at `content_switches.cc:600` and `:603` at 156.

Citing knowledge entry: `corpus/knowledge/harness-hardening-round-18.md` (the only file citing S062; lines 4, 26, 38). Its claims — pipe switch uses stdio fds 3/4, pipe path starts no HTTP listener, `DevToolsActivePort` written only by the HTTP handler under a non-empty `output_directory` — all still match the 156 bytes. No round-29 recheck note is owed, because the kill rule scopes those notes to drifted rows and no row drifted.

## Commands run (with exit codes)

| command | exit |
|---|---|
| `git rev-parse HEAD` (lane, read-only) → `97be89bc…` | 0 |
| 8× `curl -sS -w '%{http_code}' …?format=TEXT` (all 200) | 0 each |
| 8× `base64 -d` | 0 each |
| `sha256sum` over 8 decoded + 8 base64 files | 0 |
| `python3 rangecheck.py` | 0 |
| `node blockin.mjs` | 0 |
| `git clone -q --shared` + `git -C … rev-parse --show-toplevel` (verified `$S/clone`) | 0 |
| `git add -A && git commit` (scratch clone only) → `cd2f5a44…` | 0 |
| `node scripts/check-release-pins.mjs --rev cd2f5a44… --stable 156.0.8078.47 --json` | 1 (22 of 23 entries unstaged in the clone — expected) |
| `node scripts/check-release-pins.mjs --selftest` | 0 (`cases=20 passed=20`) |
| `diff -u 154 156 devtools_http_handler.cc` | 1 (differences present) |
| re-GET 156 `content_switches.cc` (reproducibility) | 0, status 200, identical b64 digest |
| `cmp` copies vs fetched bytes | 0 (8/8) |

No tool was installed or upgraded. No build, lint, formatter or lane gate was run.

## Risks / blockers

1. `f6-refetch` is **not** mine to produce; S062 stays unresolved until a different seat lands `refetch/S062.json` matching these `new_sha256` values. The dry-run pass above proves only counter mechanics.
2. My `entry.json` `old_bytes`/`new_bytes` point at lane-relative `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`; the assembler must commit the eight files from this seat's output dir byte-identically or `f3-bytes` fails on sha.
3. `devtools_http_handler.cc` carries an 11-line shift that the counter cannot see by design (range-only comparison). If a later reviewer reads the row's `297-306` against the 156 tag, it is a tag-154 anchor and correct as written — but the row should be re-pinned at the next release rather than read against 156 line numbers.
4. Baseline `chromiumdash` trigger was not re-fetched by this seat (not in my item); the stable version was taken from the claims file.
