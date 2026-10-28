# MutSliceExtraction — slice extraction red/green (r42 wave 1)

Seat: `MutSliceExtraction` · one wave item · leaf, no subagents · 2026-10-28
Milestone: **extraction red/green** — prove the r41 D4 extraction fix is able to fail (CORPUS.md rule).

Evidence dir: `.ufo/waves/round-42/w1/MutSliceExtraction/`
Scratch: `/fast/scratch/hyaku/tabi-r42/MutSliceExtraction/` (deleted before yield)

## 0. Inputs and their hashes

```
$ sha256sum /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833   (83621 bytes, mtime 2026-10-24 08:37:00.746072780)

$ git show 9b6de3a19de11abdb80e82a1310abc64a40215bb:.ufo/waves/round-42/quarantine/slice-ids.txt > slice-ids.committed.txt
$ sha256sum slice-ids.committed.txt
373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf   (38 lines)
```

Register row shape (columns consumed by the extraction): `| lane | round | id | class | ... |`
→ `$2`=lane, `$3`=round, `$4`=id, `$5`=class.

The behaviour-bearing point is `$4`. Its raw value for the defective row is ` S171` + backtick
(leading space from the pipe delimiter, trailing backtick from the Markdown code-span that never
closed before the pipe).

```
$ sed -n '362p' register.md | cat -A
| `tabi` | round5 | S171` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |$
```

Singularity check — the defect occurs exactly once in the whole register:

```
$ awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ \
    { if ($4 ~ /[^A-Za-z0-9 ]/) print NR": raw[" $4"]" }' register.md | cat -A
362: raw[ S171` ]$
```

## 1. OLD r41 extraction — RED

```
$ awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print $4, $5}' register.md
  → old-extraction.out   (38 lines, sha256 79ea7557572ff6ff81c9c70fc582ae39ce35d35f437e44ec5d901b98d9fd3772)

$ grep -n 'S171' old-extraction.out | cat -A
38: S171`   the cited source could not be fetched, so no quote was checked $

$ head -2 old-extraction.out | cat -A
 S102   `payload-absent` $
 S106   `payload-absent` $
          (every row carries a leading space from the pipe delimiter)
```

The S171 line as extracted is ` S171`` — leading space **and** trailing backtick. That token is not
the id `S171`.

## 2. FIXED extraction — GREEN

```
$ awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ \
    {id=$4; gsub(/[^A-Za-z0-9]/,"",id); print id, $5}' register.md | sort -u
  → fixed-extraction.out  (38 lines, sha256 44cd829e6c4a850d7199af1e36c3982698ef4efb8f727cb1714a40d6038d3252)

$ grep -n 'S171' fixed-extraction.out | cat -A
35:S171  the cited source could not be fetched, so no quote was checked $

$ head -2 fixed-extraction.out | cat -A
S102  `payload-absent` $
```

`S171` clean, at column 0.

## 3. Diff against the committed 38-id list

```
$ awk '{print $1}' fixed-extraction.out | sort -u > fixed-ids.txt
$ diff -u slice-ids.committed.txt fixed-ids.txt ; echo exit=$?
exit=0                      # empty diff — byte-identical
$ cmp -s slice-ids.committed.txt fixed-ids.txt && echo IDENTICAL
IDENTICAL

$ awk '{print $1}' old-extraction.out | sort -u > old-ids.txt
$ diff -u slice-ids.committed.txt old-ids.txt ; echo exit=$?
--- slice-ids.committed.txt
+++ old-ids.txt
@@ -32,7 +32,7 @@
 S165
 S166
 S167
-S171
+S171`
 S174
 S175
 S176
exit=1
```

**Required outcome satisfied on both limbs:** fixed ⇒ equal (exit 0); old ⇒ differs (exit 1) *and*
contains the malformed token `S171``. Duplicate check on old: `sort | uniq -d` → empty, so the
failure is a substitution, not a lost row.

S171 output token (fixed): `S171 S174 S175 S176` tail intact; full set reproduced:
`S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138 S140
S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167 S171 S174 S175 S176`

## 4. Census-parser angle (kumitate lesson) — indentation

Fixture at `fixture-SOURCES.md` (scratch, nothing written under shukuknow), proof transcript in
`census-parser-proof.out`. Fixture bytes:

```
| lane | id | class |$
|---|---|---|$
| `tabi` | S001 | `payload-absent` |$
  | S002 |  | `unreachable` |$      <-- two-space indent
| `tabi` | S003 | `payload-absent` |$
```

```
$ grep -c '^|' fixture-SOURCES.md            # column-zero-only
4
   3:| lane | id | class |
   4:|---|---|---|
   5:| `tabi` | S001 | `payload-absent` |
   7:| `tabi` | S003 | `payload-absent` |

$ grep -cE '^ {0,3}\|' fixture-SOURCES.md    # CommonMark up-to-3-space indent
5
   6:  | S002 |  | `unreachable` |

$ grep -q '^|.*S002' fixture-SOURCES.md      → ZERO-COLUMN: MISS — S002 row invisible
$ grep -qE '^ {0,3}\|.*S002' fixture-SOURCES.md → INDENT-TOLERANT: HIT — S002 row visible
```

The zero-column parser silently drops the S002 row; it does not error, it under-counts. Delta:
4 table lines vs 5.

**Honest bound:** the hazard is *latent, not live* in the real corpora I checked. Both real census
files have zero indented rows, so no current under-count is being claimed:

```
round-39/assimilation/validate/corpus/SOURCES.md   ^| = 147   ^{1,3}| = 0   (213 lines)
round-31/w1/ScribeRowsRetry/evidence/SOURCES.md    ^| = 4     ^{1,3}| = 0   (6 lines)
```

## 5. Detector discrimination — what actually catches this defect

The count-only check *passes the buggy extraction*: both old and fixed emit 38 lines and the
committed list has 38. Count equality is therefore a false-negative detector for this defect class.
But the committed file is an *id list*, so the load-bearing check is id-set equality.

```
variant             D1 count-only   D2 id-set (awk $1)   D3 char-anchored ^S[0-9]{3}\x20
old-extraction.out  GREEN(38)       RED                  RED(0/38)
fixed-extraction.out GREEN(38)      GREEN                GREEN(38/38)
backtickonly.raw    GREEN(38)       GREEN                RED(0/38)
```

(`detector-matrix.out`; D3 = `grep -cE '^S[0-9]{3} '`.)

Readings:

- **`sort -u` is not the fix.** Re-running old with `sort -u` appended still yields ` S171`` and
  still diffs (`sortunly.diff`: `-S171` / `+S171``). The `gsub` is the load-bearing change.
- **`gsub` alone is sufficient**, without `sort -u` (`gsubonly.out`: 38 lines, diff exit 0).
- **Downstream consequence** of the old token — an id join drops the row silently:
  `grep -cx 'S171' old-ids.txt` → `0`; on `fixed-ids.txt` → `1`. A consumer matching the
  committed ids never sees the S171 row from the old extraction.
- **Coverage hole in the red/green pair itself (routed as a finding, no amendment):** the
  `[^A-Za-z0-9]` scrub is *stronger than this pair can distinguish*. A narrower fix that strips only
  the backtick (`gsub(/`/,"")`, leaving ` S171`) still passes D2, because `awk '{print $1}'`
  collapses leading whitespace. Only D3 sees it (`backtickonly.raw` → RED 0/38). So the pair proves
  the *backtick* limb able to fail; the *leading-space* limb is proven only under a character-anchored
  detector, which the frozen comparison does not use.

## 6. Red → green → red → green, hash-guarded

```
GUARD PASS 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833
1 OLD  (pristine buggy extraction) -> RED   (id set != committed)
2 NEW  (fixed extraction)          -> GREEN (id set == committed)
3 OLD  (defect re-injected)        -> RED   (id set != committed)
4 NEW  (restored)                  -> GREEN (id set == committed)

r1 == r3 : identical        r2 == r4 : identical
79ea7557…fd3772  r1.red     79ea7557…fd3772  r3.red
44cd829e…8d3252  r2.green   44cd829e…8d3252  r4.green
```

The detector is deterministic and the defect re-injection is reproducible from the same input
bytes, so the green is a property of the fix and not of run ordering. Program hashes (the mutated
behaviour-bearing point):
`PROG_OLD 4e593693bf03a2ad8b9c92d53c58529f2e4d9996ac339f331ca67542b3fe248f`,
`PROG_NEW 1f36adb704666bed1dbba279d1f3f17e16fc0933cca13cd5e1b5a7da0a53f7a4`.

## 7. Bounds compliance

- **No writes under shukuknow.** Register sha256 re-checked after all reads: identical
  (`5afe1810…ead833`), mtime unchanged (`2026-10-24 08:37:00.746072780`).
  `find /home/vgpnk/Projects/shukuknow -newermt '2026-10-28 12:00'` → empty.
- No git/jj mutation; `git show` is a read. No commits, pushes, fetches. No spawned agents.
- All writes: seat dir + `/fast/scratch/hyaku/tabi-r42/MutSliceExtraction/` (removed before yield).
- **No tools installed or upgraded; no pacman invoked** (host-wide pacman pause respected).
  Nothing in this seat needed an install.

## 8. Incident observation — path alias disappeared mid-run (recorded, not diagnosed)

Reads at 12:37–12:39 through `/home/vgpnk/Projects/shukuknow/.ufo/waves/corpus-expansion-1/…`
succeeded (sha256 `5afe1810…`, 83621 bytes, mtime `2026-10-24 08:37:00.746072780`). At 12:40 the
same path returned `ENOENT`; `stat` and `ls` both failed. The register at
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` is
**byte-identical**: same sha256, same size, same nanosecond mtime.

`/home/vgpnk/Projects` also contains near-miss decoys: `shokunnow`, `shokunoin`,
`shokuzicoknows`. Because the hash guard passed, every measurement above is anchored to the exact
bytes, not to a path. Cause not determined by me (out of scope, and I will not touch that tree).

## Limitations

- The defect is singular (one row); this proof says nothing about extraction robustness for other
  register shapes, other lanes, or the `audio`/other-round rows in the same file.
- Only `sort -u`-normalised id-set equality was compared; column alignment is compared only by D3.
- The S171 row's `$5` is free prose (`the cited source could not be fetched…`) rather than the
  backticked class token the other 37 rows carry; any consumer parsing `$5` as a class enum gets
  prose for this row. Observed in the register, not introduced by either extraction — reported as an
  observation, not as a claim verdict.
- The census-parser demonstration is a purpose-built fixture; on the two real `SOURCES.md` files
  there are zero indented rows, so the lesson's hazard is preventive there.
- Path-alias disappearance in §8 is unreproduced; I did not investigate further (read-only tree,
  no permission to probe).

## Evidence index (`.ufo/waves/round-42/w1/MutSliceExtraction/`)

| file | what it holds |
|---|---|
| `old-extraction.out` | OLD r41 extraction, 38 lines, sha `79ea7557…` |
| `fixed-extraction.out` | FIXED extraction, 38 lines, sha `44cd829e…` |
| `slice-ids.committed.txt` | frozen `slice-ids.txt` at `9b6de3a1`, sha `3735162…` |
| `old-ids.txt` / `fixed-ids.txt` | id columns used for the diffs |
| `sortunly-ids.txt` / `sortunly.diff` | sort-`-u`-only variant: still RED |
| `gsubonly.out` / `gsubonly-ids.txt` | gsub without sort: GREEN |
| `backtickonly.raw` / `backtickonly-ids.txt` / `backtickonly.diff` | competing narrow fix: GREEN on D2, RED on D3 |
| `detector-matrix.out` | D1/D2/D3 discriminations |
| `census-parser-proof.out` | `^|` vs `^ {0,3}\|` on the indented fixture |
| `fixture-SOURCES.md`, `fixture-dir/SOURCES.md` | the indented census fixture |
| `isolation.sh` | the variant battery |

VERDICT ok — old r41 extraction fails (S171`) and fixed extraction reproduces the frozen 38-id set byte-identically, hash-guarded across a red→green→red→green cycle; routed findings: id-set detector is blind to leading whitespace (D3 required), and the real census files show the indentation hazard is latent only.
