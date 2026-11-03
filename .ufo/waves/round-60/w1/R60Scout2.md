# R60Scout2 C1 Population and Snapshot Audit

- **Seat:** R60Scout2
- **Milestone:** C1 population and snapshot audit
- **Round / Wave:** Round 60, Wave w1 (tabi-shokunin)
- **Snapshot File:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-60/c1/snapshot-r60.tsv`
- **Output Artifact:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-60/w1/R60Scout2/population.tsv`

---

## 1. Snapshot and Head Resolution Audit

Every one of the 20 roster sibling lanes recorded in `snapshot-r60.tsv` resolves cleanly to a commit object via `git -C <lane> cat-file -t <head>` (`commit` returned for all 20).
Zero unresolvable heads (`unresolvableHead == 0`).

Head status comparison between snapshot head and current working repository HEAD:
- **Equal (15 lanes):** `audio-shokunin`, `chousa-shokunin`, `game-dev-2d-shokunin`, `game-dev-3d-shokunin`, `kaidoku-shokunin`, `kama-shokunin`, `kotoba-shokunin`, `kotodama-shokunin`, `kumitate-shokunin`, `lore-shokunin`, `mado-shokunin`, `mori-shokunin`, `revenger-shokunin`, `tameshi-shokunin`, `tsukuroi-shokunin`.
- **Moved (5 lanes):**
  - `kagi-shokunin`: snapshot `22a7119c` -> current `ffa4add5` (+1 commit)
  - `kake-shokunin`: snapshot `3c68645a` -> current `a19d38ea` (+1 commit)
  - `kasegi-shokunin`: snapshot `00b53575` -> current `15cd5771` (+2 commits)
  - `kengaku-shokunin`: snapshot `4bc29fd8` -> current `dcc39ea3` (+1 commit)
  - `souji-shokunin`: snapshot `3ce0ba03` -> current `b6c6a93a` (+2 commits)

Per claim C1 specification, moved current HEADs are expected in concurrent wave operations and are not a failure; the wide screen counter evaluates blobs at the recorded snapshot heads only.

---

## 2. Population & Screen Scope Table (`population.tsv`)

The population was enumerated using `git -C <lane> ls-tree -r -z --name-only <head>`, keeping paths ending in `.md`.
The v19 map-scope targets were derived from `PROVINCE.md` (present in all 20 lanes) plus the file paths referenced in `67d6f70e:corpus/adjacency.tsv` per `c1-adjacency-host-v19.mjs`.

| Lane | Snapshot Head | Resolves | Enumerated .md | v19 Scope .md | Unscreened at v19 |
|---|---|---|---|---|---|
| `audio-shokunin` | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | true | 1097 | 1 | 1096 |
| `chousa-shokunin` | `f748abbb6bf58388e732facd4ecec5612419c457` | true | 3975 | 1 | 3974 |
| `game-dev-2d-shokunin` | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | true | 1300 | 1 | 1299 |
| `game-dev-3d-shokunin` | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | true | 884 | 1 | 883 |
| `kagi-shokunin` | `22a7119cf191bc734b682a2ee372a929c13fac99` | true | 2162 | 1 | 2161 |
| `kaidoku-shokunin` | `c7fe6898e9a8b3ff04486b4a1d672e9db37610c9` | true | 6971 | 3 | 6968 |
| `kake-shokunin` | `3c68645af27706d1d09b8dc7e27b0b0a9ffef6f1` | true | 6599 | 2 | 6597 |
| `kama-shokunin` | `6035e952c2521999e192d6f236331f265ac98392` | true | 5283 | 2 | 5281 |
| `kasegi-shokunin` | `00b535758d2cfa4511cda7167b67cdc045b85fb4` | true | 5552 | 1 | 5551 |
| `kengaku-shokunin` | `4bc29fd8c8b260df419a23d590c5c7963986a3fb` | true | 6862 | 1 | 6861 |
| `kotoba-shokunin` | `1c8f37edf2e5ac0fb3c2be1c88e32406313fe47b` | true | 4487 | 1 | 4486 |
| `kotodama-shokunin` | `c285b2afb19d4b64320e18df1f55e426bf2d0b0c` | true | 5069 | 1 | 5068 |
| `kumitate-shokunin` | `3c369336218329e30248b5d69c41348c02658169` | true | 6957 | 2 | 6955 |
| `lore-shokunin` | `0f044aa7c7e4e17cfd5b6278179709b60db45d61` | true | 3105 | 1 | 3104 |
| `mado-shokunin` | `524fa1f90b1f2de44b3019bacf833d54e0af13a0` | true | 6651 | 1 | 6650 |
| `mori-shokunin` | `84c6cbc3b47c536a504aaee329c77897d389935e` | true | 4007 | 1 | 4006 |
| `revenger-shokunin` | `5915ad8d71c19ad377829d130ba1c35445eb32a4` | true | 1341 | 1 | 1340 |
| `souji-shokunin` | `3ce0ba036275f3bbd7a74bde1fecd7ec60f4c58f` | true | 4248 | 1 | 4247 |
| `tameshi-shokunin` | `f20ba482c7441d4c75818e7cd8a3165fee7821a1` | true | 4270 | 1 | 4269 |
| `tsukuroi-shokunin` | `071a55c9c0fd022890d1b255c2782e4761e7a7d8` | true | 4778 | 1 | 4777 |
| **TOTAL** | - | **20/20** | **85,598** | **25** | **85,573** |

### Breakdown of v19 Map-Referenced Files (Total 25)
- All 20 lanes: `PROVINCE.md` (20 files, 1 per lane)
- `kaidoku-shokunin` (2 extra):
  - `corpus/knowledge/2026-10-14-r10-01-queue-ops.md`
  - `corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md`
- `kake-shokunin` (1 extra):
  - `SKILL.md`
- `kama-shokunin` (1 extra):
  - `corpus/knowledge/listener-census.md`
- `kumitate-shokunin` (1 extra):
  - `SCORECARD.md`

All 25 map-scope files exist at their respective snapshot heads. Under scope=map, 85,573 tracked `.md` files remain unscreened.

---

## 3. Path Oddities and Enumeration Safety Audit

### A. Paths with Spaces (Count: 7)
1. `chousa-shokunin`: `.ufo/waves/round-33/w1/ExecD5Check/fixtures/names/has space.md`
2. `souji-shokunin`: `.ufo/waves/round-26/assimilation/validate/tests/vault/vadv-56/vault/sub dir/note two.md`
3. `souji-shokunin`: `.ufo/waves/round-26/assimilation/validate/tests/vault/vadv-56/vault/sub dir/tamper.md`
4. `souji-shokunin`: `census/round-26/waves/assimilation/validate/tests/vault/vadv-56/vault/sub dir/note two.md`
5. `souji-shokunin`: `census/round-26/waves/assimilation/validate/tests/vault/vadv-56/vault/sub dir/tamper.md`
6. `souji-shokunin`: `tests/vault/vadv-56/vault/sub dir/note two.md`
7. `souji-shokunin`: `tests/vault/vadv-56/vault/sub dir/tamper.md`

### B. Paths with Non-ASCII Characters (Count: 1)
1. `kengaku-shokunin`: `.ufo/waves/round-43/build/R43ScoutPriorArt/tp/pomelo-nwu_report_docs_terminal-bench-2_03-极限挑战——那些让人怀疑“这真的能做？”的任务.md`

### C. Paths with Embedded Newlines (`\n`) (Count: 3)
In `souji-shokunin`, three test fixture paths contain literal newline characters in the file name (`first\nsecond.md`):
1. `.ufo/waves/round-26/assimilation/validate/tests/vault/vadv54-run/r/nl/first\nsecond.md`
2. `census/round-26/waves/assimilation/validate/tests/vault/vadv54-run/r/nl/first\nsecond.md`
3. `tests/vault/vadv54-run/r/nl/first\nsecond.md`

### D. Leading Dot Paths
- **Path starts with `.` (e.g. `.ufo/...`):** 72,593 files.
- **Any path segment starts with `.`:** 72,625 files (includes 32 files where an internal directory starts with `.ufo/` inside fixture subdirectories in `kasegi-shokunin`).
- **File basename starts with `.` (e.g. `.something.md`):** 0 files.

### E. Symlinked `.md` Paths (Mode 120000) (Count: 72)
Tracked symlinks pointing to `.md` files or named with `.md` extension exist across 8 lanes:
- `chousa-shokunin`: 1
- `kama-shokunin`: 2
- `kasegi-shokunin`: 43
- `kotoba-shokunin`: 4
- `kotodama-shokunin`: 6
- `kumitate-shokunin`: 3
- `mado-shokunin`: 7
- `souji-shokunin`: 6
*(Total: 72 symlinked `.md` paths)*
In git tree representation, these entries have type `blob` with mode `120000`. `git cat-file -p <head>:<path>` yields the symlink target string.

### F. Submodules (Mode 160000) Named `.md` (Count: 0)
There are 0 git submodules named `.md` across all 20 lanes (and 0 submodules overall).

### G. Enumeration Method Check: `git ls-tree` vs `git ls-files`
For all 15 lanes where `HEAD == snapshot head`:
The count of `.md` files from `git ls-tree -r -z --name-only HEAD` equals the count of `.md` files from `git ls-files -z` exactly:
- `audio-shokunin`: diff = 0 (1097 vs 1097)
- `chousa-shokunin`: diff = 0 (3975 vs 3975)
- `game-dev-2d-shokunin`: diff = 0 (1300 vs 1300)
- `game-dev-3d-shokunin`: diff = 0 (884 vs 884)
- `kaidoku-shokunin`: diff = 0 (6971 vs 6971)
- `kama-shokunin`: diff = 0 (5283 vs 5283)
- `kotoba-shokunin`: diff = 0 (4487 vs 4487)
- `kotodama-shokunin`: diff = 0 (5069 vs 5069)
- `kumitate-shokunin`: diff = 0 (6957 vs 6957)
- `lore-shokunin`: diff = 0 (3105 vs 3105)
- `mado-shokunin`: diff = 0 (6651 vs 6651)
- `mori-shokunin`: diff = 0 (4007 vs 4007)
- `revenger-shokunin`: diff = 0 (1341 vs 1341)
- `tameshi-shokunin`: diff = 0 (4270 vs 4270)
- `tsukuroi-shokunin`: diff = 0 (4778 vs 4778)

*(For the 5 moved lanes, `git ls-tree -r HEAD` also matches `git ls-files` at current HEAD).*

### H. Critical Enumeration Tooling Finding
Standard `git ls-tree -r --name-only <head>` with default `core.quotepath=true` encloses non-ASCII filenames and filenames containing newlines in C-style double quotes (e.g. `"...md"`).
A naive pipeline splitting on `\n` and matching `path.endsWith('.md')` fails to match:
- 1 non-ASCII file in `kengaku-shokunin` (quoted as `"...md"`)
- 3 newline-containing files in `souji-shokunin` (quoted and split across lines)
Total missing if non-NUL enumeration is used: 4 files (85,594 vs 85,598).
Executing `git ls-tree -r -z --name-only <head>` with NUL (`\0`) splitting eliminates all quoting and guarantees exact enumeration of all 85,598 `.md` blobs.
