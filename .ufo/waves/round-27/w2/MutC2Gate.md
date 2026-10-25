# MutC2Gate — W2 mutation probe of `scripts/check-s106-evidence.mjs` (C2 gate)

Seat TabiR27.MutC2Gate-2, tabi round 27 wave 2, 2026-10-25. Read-only reporter: outside
`.ufo/waves/round-27/scratch/MutC2Gate-2/` the only file written is this report. No git writes
(read-only `show`/`rev-parse`/`log`/`merge-base --is-ancestor`/`status` only), no builds/linters/formatters,
no installs (node v24.21.0 preinstalled, command `node --version`; pacman untouched). Fixture git repos were
created under the scratch dir with `git -C "$D" init -q`, `rev-parse --show-toplevel == $D` asserted before
the first commit, and removed after the run (revs + hashes preserved in `scratch/MutC2Gate-2/results.json`).

## Fold-in from wave 1 (artifacts named)

- **w1 `MutC2Gate.md`** — its bytes-identity hazard is resolved this wave: the comment-only worktree edit it
  observed (`ef12a6fb…`, 12576 B, then-dirty vs 5ed6484) was itself committed by `bceb17d` ("round-27:
  integrate falsification findings, …", `git log -3 -- scripts/check-s106-evidence.mjs`), so pristine bytes
  have a single identity now: worktree == HEAD blob == `ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d`,
  12576 B, `git status --porcelain=v1 -- <path>` empty. Its coverage finding ("selftest kills only its m1")
  is extended below: my four new mutant classes are **all** selftest-blind.
- **w1 `RevC2Gate.md`** — I5 noted `readFileSync` as a dead import; my m3 mutant is precisely the defect that
  would activate it (worktree read). Its M1 (content-pinning bypass) is adjacent to my m2/m4: both are further
  unvalidated-receipt-claim avenues at gate time. Its exit-code table (malformed receipt → 2) is what m2 is
  tested against.

## Method

Driver `scratch/MutC2Gate-2/driver.mjs` (node, spawnSync only; raw cells in `scratch/MutC2Gate-2/results.json`):
for each variant, copy pristine → apply exactly one minimal hunk (every needle asserted `count==1` before
replacing) → run the same bounded behavioral detector on all variants: gate as CLI
`node <variant> --repo <fixtureRoot> --rev <sha> --json`, exit code + JSON fields recorded. Five fixtures
(bytes mirror the gate's own `FIXTURE_BYTES` shape; anchor really at line 187, comment 186):
`F_clean` (valid control), `F_bytecount` (receipt `decoded_bytes` = actual+3, sha/anchor correct),
`F_schema` (`schema: "tabi-s106-evidence-v0-forged"`, rest clean), `F_wtbytes` (receipt committed, bytes file
present only as an **untracked** worktree copy — bytes-absent-at-rev asserted via `git show rev:<path>` status≠0),
`F_embedded` (line 187 = `// Enable using the BackForwardCache. BASE_FEATURE(kBackForwardCache, …);` — anchor
embedded in a longer line, sha/byte-count recomputed). Full matrix 6 variants × 5 fixtures, plus per-variant
`--selftest` and read-only production runs at HEAD `bceb17dd` and C2's named `5ed6484d` (both ancestors of HEAD;
tasking's f185b4e7 tip superseded by peers, noted not fought).

Honest process note: the first driver run had a fixture-construction bug (anchor duplicated at lines 186+187);
the pristine `F_clean` control failed (exit 1) — an unusable baseline, so that entire matrix was **discarded as
inconclusive**, the builder fixed, and the run below is the complete re-run. This is why the control exists.

**Baseline (pristine) — all pass, so no verdict below is inconclusive:**
`F_clean` exit 0 valid=true occ=1; `F_bytecount` exit 1 valid=false `byte_count_match=false`;
`F_schema` exit 2 refusal `receipt schema mismatch: "tabi-s106-evidence-v0-forged"`;
`F_wtbytes` exit 2 refusal `decoded bytes absent at 46e5a9f40180c97e87b0466cce2029a8a7480e4f: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`;
`F_embedded` exit 1 valid=false `anchor_located=false` occ=0; `--selftest` exit 0 `verdict=clean cases=5 passed=5`;
production exit 0 valid=true at both `bceb17dd` and `5ed6484d` (C2 valid=true re-confirmed by a non-author).

## Mutants

### m1 — `byte_count_match` conjunct removed — **KILLED**
Hunk (line ~127 of pristine):
```diff
-  const valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch;
+  const valid = shaMatch && anchorLocated && anchorUnique; // m1: byte_count_match removed
```
Detector `F_bytecount` (correct committed bytes and sha, receipt overcounts `decoded_bytes` by 3):
pristine `exit=1 valid=false byte_count_match=false` → m1 `exit=0 valid=true` — while still honestly reporting
`byte_count_match=false` internally. A length-forged receipt passes under the mutant and only under it
(other 4 fixtures identical to pristine). Selftest **does not** catch m1 (`exit=0 … passed=5`): its
tampered-bytes case flips `sha_match` at the same time, so the byte-count conjunct is never the sole blocker.

### m2 — `receipt.schema` check removed — **KILLED**
Hunk (`parseReceipt`, line ~95):
```diff
-  if (doc.schema !== RECEIPT_SCHEMA) throw new Refusal(`receipt schema mismatch: ${JSON.stringify(doc.schema)}`);
+  // m2: receipt.schema check removed
```
Detector `F_schema` (forged schema string, everything else clean):
pristine `exit=2 could-not-evaluate, refusal="receipt schema mismatch: \"tabi-s106-evidence-v0-forged\""` →
m2 `exit=0 valid=true sha_match=true anchor_located=true anchor_unique=true`. A wrong-schema receipt not only
parses, it **validates**. Per the gate's own header contract a malformed receipt must be exit 2, so this is a
verdict-class change. Selftest does NOT catch m2 (5/5; no case forges the schema).

### m3 — `readBlob` falls back to the working tree — **KILLED**
Hunk (line ~60):
```diff
 function readBlob(repo, rev, path) {
   const r = git(repo, ["show", `${rev}:${path}`]);
-  if (r.status !== 0) return null;
+  if (r.status !== 0) {
+    try { return readFileSync(join(repo, path), "utf8"); } catch { return null; }
+  }
   return r.stdout;
 }
```
Detector `F_wtbytes` (receipt committed; bytes file exists only untracked in the worktree, matching the
receipt's sha/line/length):
pristine `exit=2 refusal="decoded bytes absent at 46e5a9f4…: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc"`
→ m3 `exit=0 valid=true` — the mutant reads the live file, so evidence that was never committed validates.
This is exactly the measurement-binding hole the gate's design closes ("reads committed git blobs only",
header lines 16-18); RevC2Gate I5's dead `readFileSync` import becomes the attack vehicle. Selftest does NOT
catch m3 (5/5 — its missing-bytes case has no worktree copy either, so the fallback also fails and exit stays 2).

### m4 — anchor matched with `.includes()` instead of trim-equality — **KILLED**
Hunks (the anchor-match predicate has two uses; the coherent `.includes()` refactor replaces both, lines ~123-125):
```diff
-  const anchorLocated = recorded !== undefined && recorded.trim() === receipt.anchor.text.trim();
+  const anchorLocated = recorded !== undefined && recorded.includes(receipt.anchor.text.trim());
…
-  const occurrences = lines.filter((l) => l.trim() === receipt.anchor.text.trim()).length;
+  const occurrences = lines.filter((l) => l.includes(receipt.anchor.text.trim())).length;
```
Detector `F_embedded` (anchor embedded in a longer line 187, sha/byte-count recomputed):
pristine `exit=1 valid=false anchor_located=false occ=0` → m4 `exit=0 valid=true anchor_located=true occ=1`.
An anchor fabricated inside a longer line passes under the mutant. Selftest does NOT catch m4 (5/5; no
embedded-anchor case).

**Granularity probe m4n (single-site variant, `anchorLocated` only — occurrences predicate untouched):**
`F_embedded` → `exit=1 valid=false` — verdict-identical to pristine at exit/valid granularity (occ stays 0,
`anchor_unique=false` blocks), but the JSON field flips `anchor_located=false→true`. So at minimal mutation
granularity this defect **SURVIVES exit-code detection** and is visible only at field granularity; the
`anchor_unique` backstop covers it only while the occurrences predicate keeps trim-equality. Recorded as a
granularity finding, not a contract change.

## Summary

| mutant | detector | pristine → mutant | selftest | verdict |
|---|---|---|---|---|
| m1 byte_count conjunct removed | F_bytecount | exit 1/false → **exit 0/true** | 5/5 blind | **KILLED** |
| m2 receipt.schema check removed | F_schema | exit 2 → **exit 0/true** | 5/5 blind | **KILLED** |
| m3 readBlob worktree fallback | F_wtbytes | exit 2 → **exit 0/true** | 5/5 blind | **KILLED** |
| m4 includes (both predicate sites) | F_embedded | exit 1/false → **exit 0/true** | 5/5 blind | **KILLED** |
| m4n includes (located only) | F_embedded | exit 1/false → exit 1/false (`anchor_located` flips) | 5/5 blind | **SURVIVED at exit-code granularity** |

Specificity: on every fixture other than its designated detector each mutant behaved byte-identically to
pristine (full 30-cell matrix in `results.json`) — no mutant is a global false-positiver. Production runs on
honest lane data distinguish no mutant (all 6 variants `exit=0 valid=true` at `bceb17dd` and `5ed6484d`) — same
shape as w1's finding: only fabricated fixtures detect these classes.

Coverage finding (survival evidence, not contract proposals): the shipped 5-case selftest kills only w1's
anchor-anywhere mutant; across the 8 distinct mutant classes probed in w1+w2 it is blind to 7, including all
four here (byte-count-only tampering, schema forgery, worktree-fallback reads, embedded anchors). The gate's
fail-closed conjunctions (`anchor_unique`, `byte_count_match`) are load-bearing: m4n shows removing the
matching predicate from only one site is absorbed at exit granularity.

## Restoration evidence

The probe mutated only scratch copies; the tracked path was never written. Tracked
`scripts/check-s106-evidence.mjs`: before `ef12a6fb…`/12576 B, after `ef12a6fb…`/12576 B (driver
`restored_check.unchanged=true`), `git status --porcelain=v1` for the path empty before and after, pristine
detector reproduced post-run (`F_clean` exit=0 valid=true, identical to the first pristine cell). Scratch
kept for audit: `driver.mjs`, `pristine.mjs`, `mutants/m{1,2,3,4,4n}.mjs`, `results.json`; fixture repos removed.

Tools installed/updated: none (node v24.21.0 preinstalled; no pacman use).
