# MutC2Gate — mutation probe of `scripts/check-s106-evidence.mjs` (C2 gate)

Seat MutC2Gate, tabi round 27 w1, 2026-10-25. Read-only reporter: the only file this probe wrote outside
`.ufo/waves/round-27/scratch/MutC2Gate/` is this report. No git writes, no builds/linters, no installs
(node v24.21.0 preinstalled, command `node --version`; pacman guard untouched). Pre-existing scratch
artifacts from an earlier seat (`fx/`, `hunk-m1..4.txt`, `m1.mjs`–`m4.mjs`, `matrix.json`, `mut-run.mjs`)
were found as-found and left untouched; everything below was produced by `driver.mjs` this session.

## Subject and bytes-identity question

Lane tip during probe: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log -1 --format='%H %ci %s'`
→ `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 2026-10-25 14:35:59 -0300 "round-27: permit empty missing-receipt selftest fixture commit"`.
(The tasking's baseline tip f185b4e7… had already been superseded by peers before this probe started.)

The tracked worktree file changed mid-probe, not by me (observation; commands cited, attribution inference separated):

| t | command | result |
|---|---|---|
| t0 (probe start) | `sha256sum scripts/check-s106-evidence.mjs && wc -c <file>` | `fce4d4e224b9acde8a0cbee02fff09a81e312e289bf77f3166516af1bfb93773`, 12503 B |
| t1 (matrix run) | `readFileSync` in driver (logged `PRISTINE …`) | 12576 B, `ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d` |
| post | `git show HEAD:scripts/check-s106-evidence.mjs > pristine-head.mjs && sha256sum pristine-head.mjs` | blob = `fce4d4e2…`, 12503 B — so at t0 worktree == HEAD blob |
| post | `diff -u pristine-head.mjs pristine.mjs` | comment-only delta (header doc lines: "4 isolated cases"→"5", validity-formula wording) — no code change |
| post | `git status --porcelain=v1 -- scripts/check-s106-evidence.mjs` | ` M` (worktree-dirty vs 5ed6484) |
| post | `sha256sum` again | still `ef12a6fb…`, 12576 B — unchanged through my probe |

Inference: a concurrent sibling edited the tracked file's worktree copy (comment-only) between t0 and t1; the
last commit touching the path is 5ed6484, and ` M` is uncommitted. I never wrote the tracked path and restored
nothing — preserving the sibling's in-flight bytes exactly is the restoration obligation here. Robustness measure:
the full matrix was run twice, once against the dirty worktree bytes (`pristine.mjs`, ef12a6fb) and once against
the committed HEAD blob (`pristine-head.mjs`, fce4d4e2). **Both matrices are identical cell-for-cell** (evidence:
`.ufo/waves/round-27/scratch/MutC2Gate/runs/results.json` and `runs/results-head.json`); verdicts below hold for
the committed bytes.

## Method

Driver: `.ufo/waves/round-27/scratch/MutC2Gate/driver.mjs` (node; spawnSync only). For each byte-version:
copy pristine → apply exactly one minimal patch per mutant (each find-string verified `count=1` in the source
before replacing) → run gates as CLI (`node <variant> --repo <D> --rev <sha> --json`). Fixtures: six throwaway
git repos per run, each `mkdtempSync(tmpdir,"mutfx-")` + `git -C "$D" init -q`, toplevel verified
(`rev-parse --show-toplevel == $D`) before the first commit; receipt+bytes committed; manifests in
`scratch/MutC2Gate/fixtures-manifest/F_*.json`. Detector matrix: 5 gate variants × 6 fixtures, plus per-variant
`--selftest`, plus per-variant production runs (read-only) at rev `5ed6484d…` (tip) and `5577d1b6…` (C2's named commit).

Fixtures (bytes mirror the gate's own `FIXTURE_BYTES`; anchor text really sits at line 187, comment 186 — asserted in driver):
`F_clean` (valid), `F_offby1` (receipt claims anchor line 188), `F_sha` (`decoded_sha256`=64×"0", `encoded_sha256`=real sha — field exists on the real receipt `corpus/evidence/round-26/sources/s106.json` at tip: `"encoded_sha256": "f17347b2…"`), `F_dup` (anchor text occurs at lines 187 AND 188, sha/byte-count recomputed to match), `F_nobp` (receipt missing `bytes_path`), `F_nosha` (receipt missing `decoded_sha256`).

**Baseline (pristine) — all pass, so no verdict below is inconclusive:**
`F_clean` exit 0 valid=true; `F_offby1` exit 1 valid=false `anchor_located=false`; `F_sha` exit 1 valid=false
`sha_match=false`; `F_dup` exit 1 valid=false `anchor_unique=false` occ=2; `F_nobp` exit 2 refusal
`"receipt missing bytes_path"`; `F_nosha` exit 2 refusal `"receipt missing decoded_sha256"`;
`--selftest` exit 0 `S106_SELFTEST verdict=clean cases=5 passed=5`; production both revs exit 0 `valid=true`
(i.e. C2's valid=true re-confirmed by a non-author at 5ed6484d and 5577d1b6).

## Mutants

### m1 — anchor_located accepts "occurs anywhere" — **KILLED**
Hunk (`diff -u pristine.mjs mutants/m1-anchor-anywhere.mjs`, line ~123):
```diff
-  const anchorLocated = recorded !== undefined && recorded.trim() === receipt.anchor.text.trim();
+  const anchorLocated = lines.some((l) => l.trim() === receipt.anchor.text.trim());
```
Detector `F_offby1` (recorded line 188 is `// tail`; anchor text is on 187):
pristine `exit=1 valid=false anchor_located=false` → m1 `exit=0 valid=true sha_match=true anchor_located=true anchor_unique=true occ=1`.
The off-by-one fabrication passes under the mutant and only under it (m1 on `F_clean`/`F_sha`/`F_dup`/`F_nobp`/`F_nosha` unchanged from pristine).
Second independent kill: gate's own selftest under m1 → `exit=3 … verdict=failed cases=5 passed=4 failing=anchor-off-by-one-invalid`
(pristine selftest: `exit=0 … passed=5`). The shipped check catches the off-by-one; the mutant does not.

### m2 — sha_match accepts the ENCODED sha256 as decoded — **KILLED**
Hunk (line ~119):
```diff
-  const shaMatch = observedSha === receipt.decoded_sha256;
+  const shaMatch = observedSha === receipt.decoded_sha256 || observedSha === receipt.encoded_sha256;
```
Detector `F_sha` (claims zero `decoded_sha256`, puts the real committed-bytes sha in `encoded_sha256` — a receipt
shape the gate otherwise parses, since `encoded_sha256` is unvalidated):
pristine `exit=1 valid=false sha_match=false` → m2 `exit=0 valid=true sha_match=true`. A receipt whose decoded-sha
claim is fabricated validates under the mutant. The gate's selftest does NOT catch m2 (`exit=0 … passed=5` — its
tampered-bytes case leaves `encoded_sha256` unset), so the bespoke fixture is the only detector; coverage finding, not a contract change.

### m3 — anchor_unique requirement dropped — **KILLED**
Hunk (line ~126):
```diff
-  const valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch;
+  const valid = shaMatch && anchorLocated && byteCountMatch;
```
Detector `F_dup` (anchor text twice, occ=2; sha and byte-count still true — isolates uniqueness):
pristine `exit=1 valid=false anchor_unique=false occ=2` → m3 `exit=0 valid=true` while still reporting
`anchor_unique=false occ=2` internally — the two-occurrence file passes under the mutant. Selftest does NOT catch
m3 (`exit=0 … passed=5`; no duplicate-anchor case exists).

### m4 — receipt schema required-key check skipped — **KILLED** (bytes_path key itself survives at exit-code granularity)
Hunk (parseReceipt, ~line 96):
```diff
-  for (const key of ["url", "decoded_sha256", "bytes_path"]) {
-    if (typeof doc[key] !== "string" || !doc[key]) throw new Refusal(`receipt missing ${key}`);
-  }
+  // m4-mutant: schema required-key loop removed
```
Answer to "a receipt missing bytes_path parses under mutant — what happens?": it parses; then
`readBlob(rev, undefined)` builds `git show <rev>:undefined`, which fails → `Refusal` → **exit 2 could-not-evaluate**,
refusal `"decoded bytes absent at c18b65b9e73f52507740e51cd91deff36c8da454: undefined"` (recorded output,
`runs/results.json` / driver log `RUN mutant=m4… fixture=F_nobp`). Same verdict code as shipped's exit 2
(`"receipt missing bytes_path"`); the difference is message-level only. So the `bytes_path` required-key check is
verdict-redundant with the bytes-absent refusal — it survives any exit-code fixture (SURVIVED at that granularity).
The loop's other keys do not survive: detector `F_nosha` (missing `decoded_sha256`) gives
pristine `exit=2 refusal="receipt missing decoded_sha256"` → m4 `exit=1 valid=false sha_match=false` — a
could-not-evaluate collapses into an invalid, a verdict-class change; m4 is killed. Selftest does NOT catch m4
(`exit=0 … passed=5`; no case omits a required key). A malformed receipt must be could-not-evaluate per the gate's
own header contract, so the m4 behavior on `F_nosha` violates the shipped contract's declared code table.

## Summary

| mutant | detector fixture | pristine → mutant | verdict |
|---|---|---|---|
| m1 anchor-anywhere | F_offby1 (+selftest case) | exit 1/false → exit 0/true (selftest 5/5 → 4/5, exit 3) | **KILLED** |
| m2 encoded-sha accepted | F_sha | exit 1/false → exit 0/true (selftest unchanged 5/5) | **KILLED** |
| m3 unique dropped | F_dup | exit 1/false → exit 0/true (selftest unchanged 5/5) | **KILLED** |
| m4 schema keys skipped | F_nosha (bytes_path: F_nobp) | exit 2 → exit 1/false (F_nobp: exit 2 both, message only) | **KILLED** (bytes_path key survives at exit-code level) |

Coverage findings (survival evidence, not contract proposals): the gate's 5-case selftest kills only m1; m2, m3,
m4 pass it clean. No selftest case exercises a fabricated `decoded_sha256` with a plausible `encoded_sha256`
present (the real receipt carries that field), a duplicated anchor, or an omitted required key. Production-data
runs distinguish no mutant (all 5 variants `exit=0 valid=true` at both 5ed6484d and 5577d1b6) — honest data cannot
detect these defects; the fabricated fixtures above are the operative detectors. All raw cells:
`scratch/MutC2Gate/runs/results.json` (worktree bytes) and `runs/results-head.json` (HEAD blob), driver log in this
session transcript.

Restoration evidence: tracked `scripts/check-s106-evidence.mjs` — t0 `fce4d4e2…`/12503 B (== HEAD blob 5ed6484),
t1 `ef12a6fb…`/12576 B (sibling's uncommitted comment-only edit, preserved byte-exact), post-probe `sha256sum`
still `ef12a6fb…`/12576 B; `git status --porcelain=v1` unchanged (` M`); `diff -q pristine.mjs <tracked>` →
identical. This probe wrote zero bytes to any tracked file and mutated only scratch copies.

Tools installed/updated: none (node v24.21.0 already present; no pacman use).
