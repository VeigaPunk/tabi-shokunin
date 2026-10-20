# Attack: sources census on `corpus/SOURCES.md`

**Verdict: HOLDS.** The maintained census validator, the default fleet census, and all seven
frozen v1 manual census commands agree on the tabi registry at `b444ca8`: **39 rows, all
13 fields, tiers A:31 B:4 C:4, statuses mined:32 queued:3 rejected:4, 0 malformed, 0 duplicate
ids, 0 dangling used-by**. One URL+scope duplicate pair exists (S004/S028) and is exempt by the
contract's supersedes clause; every used-by edge resolves to a real file that actually cites its
row. Four validator blind spots were found and are listed as bounded limitations; none is
triggered by the tabi file, so none changes the verdict.

Target revision: `b444ca8e024f386124418169e8e400221524bba3`
(`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair). Access date 2026-10-20.

---

## 1. Exact commands and observed output

### 1.1 Maintained validator and census

```
$ cd /home/vgpnk/Projects/shokunin
$ ./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
EXIT=0
```

```
$ ./scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi
tabi	rows	39
tabi	tier.A	31
tabi	tier.B	4
tabi	tier.C	4
tabi	status.mined	32
tabi	status.queued	3
tabi	status.rejected	4
FLEET	rows	39
FLEET	tier.A	31
FLEET	tier.B	4
FLEET	tier.C	4
FLEET	tier.invalid	0
FLEET	status.queued	3
FLEET	status.mined	32
FLEET	status.rejected	4
FLEET	status.invalid	0
FLEET	missing	0
EXIT=0
```

`FLEET.*` here is the total over the **selected** lanes, not fleet-wide — the same binary with no
lane filter reports `FLEET rows 691` (tabi's 39 included). See §4 L4.

Cwd independence: the same validate run from `/tmp` gives the identical `tabi ok` line
(`EXIT=0`), so the clean verdict is not an artifact of the working directory.

### 1.2 Frozen v1 manual census (run from the lane root)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
39
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
0
$ awk -F'|' '... {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{...}' corpus/SOURCES.md
A=31 B=4 C=4
$ awk -F'|' '... {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{...}' corpus/SOURCES.md
mined=32 queued=3 rejected=4
$ awk -F'|' '... {i=$2; ...; print i}' corpus/SOURCES.md | sort | uniq -d
(empty)
$ awk -F'|' '... NF==13 {i=$2;k=$4;t=$5;s=$9; ... enums, community-at-A ...}' corpus/SOURCES.md
(empty)
$ awk -F'|' '... mined used-by paths ...' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
(empty)
```

All seven frozen commands match the maintained parser. `rows 39` in both.

### 1.3 Independent third parser (not the census code)

Python split on `|` over `^\|\s*S\d{3,}\s*\|`:

```
rows 39
field-count histogram Counter({13: 39})
tier Counter({'A': 31, 'B': 4, 'C': 4})
status Counter({'mined': 32, 'rejected': 4, 'queued': 3})
kind Counter({'docs': 22, 'code': 6, 'community': 4, 'spec': 3, 'paper': 3, 'own-work': 1})
unique ids 39   sorted==S001..S039 True
dup url+scope: [('https://github.com/chromium/chromium/blob/main/chrome/browser/devtools/remote_debugging_server.cc',
                 'Enforcement mechanics of the default-data-dir refusal; branding and OS gating')]
mined-with-dash-usedby: []
non-mined-with-usedby: []
tierC: ['S026','S027','S038','S039']
```

### 1.4 Revised file's own structural checker

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
EXIT=0
```

`check-sources.mjs` is read-only on this path (its `writeFileSync` calls are inside selftest
fixtures); `corpus/SOURCES.md` is unmodified after the run (`git status` clean for tracked files).

### 1.5 Other modes

```
$ ./scripts/sources-census.sh overdue --root /home/vgpnk/Projects/shokunin tabi
tabi	cadence	S001 recheck=on-release opened=2026-10-19
... (all 39 rows, one cadence line each)
EXIT=0
$ ./scripts/sources-census.sh shared --root /home/vgpnk/Projects/shokunin tabi
(empty)  EXIT=0        # single-lane selection can never report a shared URL — expected
$ ./scripts/sources-census.sh selftest
96 lines, every one `killed`, final `selftest ok`
EXIT=0
```

No row is overdue (all cadences are `on-release`, `90d`, `180d`, `365d`; the 90/180/365 windows
open 2026-10-19/20 and none has elapsed). The 96 killed mutants include `E01`…`E12`, `W01`…`W04`,
the indented-row matrix (0–3 spaces), and `gawk-failure-is-error-not-ok`.

---

## 2. Histograms (tabi at `b444ca8`)

| axis | values |
|---|---|
| rows | **39** |
| tier | A **31** (79.5%) · B **4** · C **4** · invalid 0 |
| status | mined **32** (82.1%) · queued **3** · rejected **4** · invalid 0 |
| kind | docs 22 · code 6 · community 4 · spec 3 · paper 3 · own-work 1 |
| columns | 13 (11 cells) on all 39 rows; malformed 0 |
| ids | contiguous `S001`…`S039`, 39 unique, 0 duplicates |
| used-by | 40 edges over 10 distinct targets, 0 dangling, 0 drift |

Round-16 delta: `29` rows at `e38d259` → `39` at `b444ca8`; the added ten are exactly
S030–S039 (S030–S036 A/mined, S037 A/queued, S038–S039 C/rejected). `git diff 8f7feb3 b444ca8 --
corpus/SOURCES.md` is empty, so commit A and the counter repair publish the identical registry;
the census number is the same at both.

---

## 3. Malformed / duplicate / used-by findings

**Malformed: none.** Every row has exactly 13 pipe-fields (11 cells). The 2–4-space indented
variants the maintained parser tolerates (`0–3` leading spaces) do not occur here; every row is
at column zero, so the frozen awk and the maintained parser see the same set.

**Duplicate ids: none.** 39 rows, 39 distinct ids, contiguous S001–S039.

**Duplicate URL+scope: exactly one pair, contract-exempt.**
- `S004` and `S028` cite the same URL
  (`.../chrome/browser/devtools/remote_debugging_server.cc`) with the byte-identical scope
  string `Enforcement mechanics of the default-data-dir refusal; branding and OS gating`.
- `S028`'s `teaches` cell begins `supersedes S004 — …`, which is the contract's stated exemption.
  Both rows are `mined`; the pair is retained deliberately (S028 is the L1 re-fetch superseding
  round-1's S004).
- Confirmed live: deleting the words `supersedes S004` from the row makes `validate` emit
  `E04 S028 duplicate url … within scope …` and exit 1 on the copy (§5 M3). The exemption is
  doing real work, not masking a row by accident.

**used-by: 40 edges, all clean, and all *semantically* real.**
- 40 comma-separated path mentions across the 32 mined rows (S011, S013, S017, S023, S024,
  S025, S028, S029 carry two each; the rest one).
- 10 distinct targets. All are regular `*.md` files (0 non-regular, 0 non-md), all exist.
- **Reference-drift probe (beyond what E11 checks):** for each `(id, path)` edge, `grep -F "$id"`
  in the target file. **0 edges drift** — every one of the 40 edges points at a file that names
  its citing row. So the used-by column is not merely resolvable, it is truthful.
- No mined row uses `—` (would be W03); no queued/rejected row carries a path.

**Queued rows** are S021 (Chrome DevTools for agents), S022 (IEEE JS flaky-test paper, abstract
read), S037 (MCP Tools 2026-07-28) — all `—` used-by, all with `recheck=on-release`. Legitimate.
**Rejected rows** are S026, S027, S038, S039 — all `community`, tier C, `—` used-by, each with a
`REJECTED:` rationale and an explicit flip. Community-at-A (E10) is not triggered.

---

## 4. Bounded limitations found (none triggered by the tabi file)

These are defects in the *instrument*, not in tabi's registry. Each was reproduced on a mutated
copy; each is stated with the evidence that the live file does not hit it.

- **L1 `E04`'s supersedes exemption does not check the target id exists.** Replacing
  `supersedes S004` with `supersedes S999` leaves validate at `ok` (EXIT=0), even though no S999
  row exists. Live file: the marker names S004, which exists. Severity low; a one-line
  "superseded id must be a row" rule would close it.
- **L2 `E11` accepts a directory as `used-by`.** Pointing a used-by cell at `corpus/knowledge`
  (a directory) yields `ok` (EXIT=0), because the check is `[ -e "$dir/$path" ]`. Live file: all
  40 edges are regular `.md` files (§3).
- **L3 `E11` cannot see semantic drift.** Pointing a used-by cell at a *different existing* file
  yields `ok`. Live file: the independent drift probe (§3) shows 0/40 drift, so this blind spot
  is closed by evidence, not by the checker.
- **L4 `FLEET.*` in a lane-filtered run is the selection total, not the fleet.** `census … tabi`
  prints `FLEET rows 39`; the unfiltered run prints `FLEET rows 691`. Anyone quoting the FLEET
  block from a filtered invocation as a fleet number would be wrong. The tabi lane numbers are
  unaffected; only the label is ambiguous.
- **L5 symbolic cadence accepts any bare word.** `recheck=often` validates `ok`; genuinely
  invalid forms (`90x`, `2026-13-01`, `-5d`, empty) each produce `E09 … recheck=…` and exit 1.
  So `E09` is live; the acceptance of arbitrary alphabetic tokens is by design, but it means
  "recheck is a valid cadence" cannot be read as "recheck is a meaningful cadence". Live file
  uses only `on-release`/`90d`/`180d`/`365d`.

---

## 5. Non-vacuity: mutation battery on a `/tmp` copy

Baseline: `cp -a` of `corpus/knowledge`, `corpus/lessons` and `corpus/SOURCES.md` into
`/tmp/census-mut.tMrOyk/probe-shokunin/`; baseline validate on the copy prints
`file ok … EXIT=0`. Then one defect at a time, restored between runs:

| # | mutation | observed |
|---|---|---|
| M1 | `S001` used-by → `corpus/knowledge/NOPE.md` | `E11 S001 missing used-by …` (and the three sibling rows sharing that path), **EXIT=1** |
| M2 | `S005` id → `S001` | `E03 S001 duplicate id`, **EXIT=1** |
| M3 | strip `supersedes S004` from `S028` | `E04 S028 duplicate url … within scope …`, **EXIT=1** |
| M4 | extra `\|` inside `S018` teaches | `E01 S018 fields=12`, **EXIT=1** |
| M5 | `S026` → `mined` (used-by still `—`) | `W03 S026 mined but unused` + `ok`, **EXIT=0** (warning) |
| M6 | `S026` tier `C` → `A` | `E10 S026 community-at-A`, **EXIT=1** |
| M7 | row appended after `## Paths` | `E12 S099 row outside Registry section`, **EXIT=1** |
| M8 | `S023` status → `watched` | `E07 S023 status=watched`, **EXIT=1** |
| M9 | `S024` opened → `2026-12-01` | `E08 S024 opened=2026-12-01`, **EXIT=1** |
| M10 | `S025` recheck → `often` | `ok`, **EXIT=0** — see L5 (by design) |
| M11 | `S030` id → `S30` | `E02 S30`, **EXIT=1** |

Restored baseline re-validates `file ok … EXIT=0`. The `ok` on the real lane is therefore a
negative result of a checker that demonstrably fires on this exact file when a defect is present.

Fleet context, also run read-only: `validate` with no lane filter prints
`tabi ok …/tabi-shokunin/corpus/SOURCES.md` and exits 1 **only** because of other lanes
(`souji` E11 ×7, plus W01/W04 elsewhere). tabi is clean in both the filtered and the fleet run,
so its `ok` is not inherited from a skip.

---

## 6. Residual risk and verification gaps

- The census is structural. It cannot tell whether a tier-A row was truly opened; S020's
  re-open and S030–S039's content claims are outside this item (other attack items hold those).
  The census contributes count/identity/consistency, not source truth.
- The "39 rows" number is correct for both `8f7feb3` and `b444ca8` (identical file); it does not
  by itself certify the counter repair, which changed no registry bytes.
- Not verified here: whether other lanes' registries are clean (out of scope, and `souji` is
  visibly not), and `shared` across the fleet (single-lane invocation returns empty by design).
- Side effect observed but not mine: `corpus/evidence/round-16/measurement-binding.json` appeared
  untracked at 11:57:18 during this session, written by `selftest-measurement-binding.mjs`
  (`MANIFEST_REL` constant). `check-sources.mjs` never references that path and
  `corpus/SOURCES.md` is byte-unchanged. Flagging it because a sibling running that selftest in
  the lane leaves an artifact behind.
- No tools were installed or upgraded for this item (pacman untouched, per the host-wide pause).

**Verdict: HOLDS** for the assigned negative claim — no malformed row, no duplicate id, no
unexempted duplicate URL+scope, no dangling or drifting used-by, and the three command families
agree.
