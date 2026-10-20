VERDICT: PASS

# RevCensusStart — round-17 start-of-wave census record (2026-10-20)

Scope: re-run the three census gates from the lane root and verify the registry's next free id is
`S041`. Read-only for the lane; the only lane file written is this report.

Host at run time: Node v24.21.0, GNU Awk 5.4.1 (API 4.1), GNU bash 5.3.20, cwd
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## 1. Start record — commands, exact output, exit codes

### 1.1 `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`

```
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
EXIT=0
```

Single `ok` line, no E/W codes. `ok` is emitted only when the gawk row pass produced no `E[0-9]+`
finding (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh:739-745`), and the E11 used-by
pass found nothing missing (`:720-724`).

### 1.2 `sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi`

```
tabi	rows	40
tabi	tier.A	31
tabi	tier.B	4
tabi	tier.C	5
tabi	status.mined	33
tabi	status.queued	2
tabi	status.rejected	5
FLEET	rows	40
FLEET	tier.A	31
FLEET	tier.B	4
FLEET	tier.C	5
FLEET	tier.invalid	0
FLEET	status.queued	2
FLEET	status.mined	33
FLEET	status.rejected	5
FLEET	status.invalid	0
FLEET	missing	0
EXIT=0
```

Two consecutive runs were byte-identical (`DETERMINISTIC=yes`, rc 0,0). Internally consistent:
31+4+5 = 40 rows; 33+2+5 = 40 rows.

### 1.3 `node scripts/check-sources.mjs` (lane root, no args)

```
SOURCES_GATE verdict=clean rows=40 tiers=A:31,B:4,C:5 status=queued:2,mined:33,rejected:5 findings=0 file=corpus/SOURCES.md
EXIT=0
```

`verdict=clean` = zero findings; exit mapping is `clean→0, failed→1, could-not-evaluate→2`
(`scripts/check-sources.mjs:359-360`, dispatch `:556-557`).

## 2. Agreement with the round plan

`.ufo/waves/round-17/PLAN.md:7` claims "Start census (fleet validator) exit 0: rows 40, A31/B4/C5,
mined33/queued2/rejected5". Measured: identical, and the independent Node gate reports the same
rows/tier/status vector. No divergence between the two validators.

Registry shape behind the counts: Registry section `corpus/SOURCES.md:11`, first row S001 `:15`,
last row S040 `:54`, sections Paths `:56`, Search log `:64`, Leads `:80`; file 84 lines, 31178 bytes,
sha256 `099115bea5172e46b87f8bf9a90fce1b3bb012d08ad2c3e38839321bb498c994`.

## 3. Next unused id = S041 — verified

Positive evidence:

1. Registry ids enumerated by strict parse of row ids (2nd TSV field) are exactly
   `S001 … S040`, 40 rows, one each: no duplicate (E03 would fire, `sources-census.sh:641`), no gap,
   max `S040`.
2. No id ≥ S041 in the registry: an awk filter over row ids for numbering ≥ 41 printed nothing.
3. `S041` does not occur anywhere under `corpus/` (`grep -rn 'S041' corpus/` → no match). Lane-wide,
   `S041` occurs only in `PLAN.md:29` and `:129` (the C2 contract, "S041+") and in wave-1 dispatch
   metadata (`.ufo/waves/round-17/w1/spec.json`, `validation.json`, `dispatch-result.json`), none of
   which is a registry row. No `sources/*.md` draft dir or drafted row exists yet.
4. Acceptance probe (in `/tmp`, full `corpus/` copy with all used-by targets): inserting a queued
   `S041` row directly after `S040` yields validate `ok` exit 0, census `rows 41 / tier.B 5 /
   status.queued 3` exit 0, and check-sources `verdict=clean rows=41` exit 0. So S041 is free and
   admissible, and the counters shift by exactly one row.
5. Placement control: appending the same `S041` row after `## Leads (unopened)` yields
   `E12 S041 row outside Registry section` exit 1 — E12 is live, so an allocation must go inside the
   Registry table.

Residual gap (informational, not a defect): neither gate enforces id contiguity or "next free id"
(`sources-census.sh:24-35` codes: E02 format, E03 duplicate; `check-sources.mjs` has no ordering
check). The S041 claim is therefore established by enumeration above, not by any gate; if a
concurrent seat allocates S041 first, the next writer collides and both gates flag `E03 duplicate id`
only after the second row lands.

## 4. Read-only evidence

- No `--out` was passed; the census script writes only stdout or `--out`
  (`sources-census.sh:7`, truncation only at `:699`), and no write occurs in the `census`/`validate`
  branches (`:724-745`; FLEET aggregation `:727-735`, emit `:766-772`).
- `corpus/SOURCES.md` sha256 and mtime (`2026-10-20 12:19:21 -0300`) are unchanged across every run
  in this review (re-hashed at open and again at close, ~12:52 -0300).
- `check-sources.mjs` writes only inside `selfTest()` under `mkdtempSync` and removes the tree
  (`:488`, `:526-528`); the normal `run()` path only reads (`:533-543`).
- All negative-control fixtures lived in `mktemp -d /tmp/census-probe*` and were removed. One
  pre-existing empty skeleton `/tmp/census-probe.WevEz2` (`root/probe-shokunin/corpus`, no files,
  created 11:58 local, not by this seat's commands) was removed while cleaning; it held no data.

## 5. Gate sanity (beyond the assignment)

- `sources-census.sh selftest` → `selftest ok`, exit 0 (mutation selftest of the validator).
- `node scripts/check-sources.mjs --self-test` → `SOURCES_SELFTEST verdict=clean cases=26`, exit 0.
- Negative control on a full `/tmp` corpus copy: baseline validate `ok` exit 0; injected duplicate
  `S001` → `E03 S001 duplicate id` exit 1; injected tier `Z` on S002 → `E06 S002 tier=Z` exit 1.
  So the lane's `ok` is not a vacuous pass.

## 6. Findings

No blocking or actionable defect in scope. The three gates hold at the lane root and the next free
registry id is S041.

Notes on how to read the record:
- `FLEET` lines equal `tabi` because the target list was exactly `[tabi]`; they are not a fleet-wide
  census. Default target selection enumerates child `*-shokunin` repos and skips conf rows with
  repo `.` (`sources-census.sh:462-465` skip; `:472-482` unlisted enumeration); the tabi lane is
  conf row `shokunin.conf:58` `tabi|tabi-shokunin|coverage + calibration (browser and web-interaction
  craft)`.
- `--root /home/vgpnk/Projects/shokunin` resolves the same root the script would derive from its own
  path (`scripts/..`), so the explicit flag is redundant here but harmless and consistent with the
  assigned argv.
- S041 is a start-of-wave fact: peers that add rows must allocate from S041 upward and place the row
  inside `## Registry` (E12 above); `validate`/`check-sources` will catch duplicate ids but not
  skips.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/RevCensusStart.md
