# R60MutC1 — C1 mutation probe (tabi round 60, w1)

Seat: R60MutC1 (mutation-tester, C1). Authority: `.ufo/waves/round-60/claims.json`
`mutantsC1` M1–M5, read in full before any run. No predicate, kill rule or mutant
definition was amended.

Instrument: `.ufo/waves/round-60/counters/c1-wide-screen-r60.mjs`
sha256 `ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920`
(READY from R60Exec1, re-hashed here: match). Snapshot:
`.ufo/waves/round-60/c1/snapshot-r60.tsv` sha256
`9480fb74465beda3c88d0914591156e82a9d063f98d93ef80616f58bf8046420`, 20 lanes.

Kill rule applied (from the seat item): KILLED iff the mutant selftest fails
(exit ≠ control exit, `allPass` false, or any failing case) OR the mutant's
wide-run exit/predicate/counts differ from the control's.

## Harness

- Scratch `S=/fast/scratch/hyaku/tabi-r60/R60MutC1/`, created with
  `trap 'rm -rf -- "$S"' EXIT` set before the first write; every run used an
  explicit per-run `TMPDIR` under `S`. The harness job was backgrounded by the
  shell runner, so the EXIT trap did not fire and the directory was removed
  explicitly after the pass (364K, receipts already copied into the wave dir;
  `S` no longer exists). `disk-guard.sh status`: `/fast/scratch/hyaku` 49% used,
  410.0G free — no ENOSPC.
- Mutants are exact single-occurrence string replacements applied to **copies**
  (`anchorOccurrences` 1 for every mutant, asserted before writing). The
  original counter was never opened for write; its sha256 after the pass equals
  the READY sha (`originalUnchanged: true`).
- Copies live at `<S>/lane/.ufo/waves/round-60/counters/mut-M*.mjs` so
  `laneRoot()` resolves to the same depth as the instrument. `<S>/lane` is a
  fixture git repo (toplevel asserted before its first commit, commits made with
  `-c user.name=tabi-selftest -c user.email=selftest@invalid`) whose
  `corpus/adjacency.tsv` at tag `67d6f70e` is byte-identical to the lane map
  (sha256 `39a04a3c516ffefb296ac64665f481f240d95ae024394dfe631a4a754c35b309`,
  asserted equal). This matters only for M5, whose defect enters the defaulted
  map path; without it the defaulted run would die on a missing map (exit 2) and
  the `missing-scope-exits-2` case would falsely pass.
- Control = the original file run in place (read-only): selftest and wide run
  with the same flags the mutants get. Mutant wide runs read the 20 sibling
  repos read-only at the recorded heads; only M3 (the defect itself) touches
  worktree paths, and it writes nothing.

## Control

- selftest: exit 0, `allPass` true, 17/17 cases, no failures (1.1 s).
- wide run (`--scope wide --snapshot … --fleet /home/vgpnk/Projects/shokunin --json`):
  exit 0, predicate true,
  `enumeratedMd=85598 screenedMd=85598 unscreenedMd=0 rowMismatch=0
  unresolvableHead=0 roster=20 wideHitLines=19049 wideHitFiles=6129
  blobReadErrors=0` (11.8 s).
- default-scope probe (no `--scope`): exit 2,
  `c1-wide-screen-r60: missing --scope (wide|map); there is no default scope`.

## Mutants

### M1 — enumerate only top-level `.md` (drop nested directories) — **KILLED**

Target → replacement (in `enumerateMd`):

```js
    const isMd = pathBuf.length >= 3
      && pathBuf[pathBuf.length - 3] === 0x2e
      && pathBuf[pathBuf.length - 2] === 0x6d
      && pathBuf[pathBuf.length - 1] === 0x64;
```
```js
    const isMd = pathBuf.length >= 3
      && pathBuf[pathBuf.length - 3] === 0x2e
      && pathBuf[pathBuf.length - 2] === 0x6d
      && pathBuf[pathBuf.length - 1] === 0x64
      && !pathBuf.includes(0x2f);
```

- mutant sha256 `44385e32274a6c7f81276808fa85cd5c67a1054e9e17b2b164670d25155757ba`
- selftest: exit 1, `allPass` false; failing cases: `wide-green-25`,
  `nested-md-screened`, `space-and-nonascii-path`, `newline-path-roundtrip`,
  `wide-hit-counts`, `map-red-on-unreferenced-nested-md`,
  `verify-rows-genuine`, `unresolvable-head-refused`.
- wide run: exit 0, predicate **true**, counts
  `enumeratedMd=144 screenedMd=144 unscreenedMd=0 rowMismatch=0
  unresolvableHead=0 roster=20 wideHitLines=478 wideHitFiles=58` — counts differ
  from the control (144 vs 85598 enumerated).
- Evidence: the predicate alone does not see this defect (144 == 144 stays
  green); the wide-run **count comparison** and eight selftest cases kill it.

### M2 — skip the per-file hit recount (trust the claimed count) — **KILLED**

Target → replacement (in the `--verify-rows` comparison loop):

```js
      if (m.bgHits !== row.bgHits) { mismatch(`bgHits ${row.bgHits} != ${m.bgHits}`, row); continue; }
```
```js
      const bgHitsRecounted = row.bgHits; // M2: trust the row's claimed count, skip the per-file recount
      if (bgHitsRecounted !== row.bgHits) { mismatch(`bgHits ${row.bgHits} != ${bgHitsRecounted}`, row); continue; }
```

- mutant sha256 `5baadc1d137e41ea9f9576bc712d8fb071b3340434d720bed4736d27b081d934`
- selftest: exit 1, `allPass` false; failing case: `forged-row-hits` (the
  forged-row fixture bumps `bgHits` by one; the mutant accepts it, `rowMismatch`
  stays 0 and the case's expected exit 1 / `rowMismatch` 1 fails).
- wide run: exit 0, predicate true, counts **identical to the control**
  (85598/85598/0/0/0/20, 19049 lines, 6129 files).
- Evidence: kill comes solely from the declared forged-row fixture; the data run
  cannot see it (no rows supplied).

### M3 — read the working tree instead of the head blob — **KILLED**

Target → replacement (in `batchMetrics`):

```js
      out.set(e.path, lineMetrics(buf.subarray(start, end)));
```
```js
      out.set(e.path, lineMetrics(fs.readFileSync(path.join(repo, e.path))));
```

- mutant sha256 `a39c3d14c1a0c5e5e206f7ca7765eea6e753d2a44863a8bb29a9adeb33650d9f`
- selftest: exit 1, `allPass` false; failing cases:
  `symlink-md-screened-as-blob` (follows the link instead of hashing the blob)
  and `worktree-differs-from-head` (reports the rewritten worktree bytes, not
  the head blob).
- wide run: exit 1, no JSON (predicate/counts absent), stderr
  `Error: ENOENT: no such file or directory, open
  '/home/vgpnk/Projects/shokunin/mado-shokunin/.ufo/waves/round-34/scratch/
  RevengerC1/a2-entry-symlink/corpus/knowledge/waybar-module-text-route-r25.md'`
  — a head blob that is absent from that sibling's worktree, i.e. the worktree
  is not a complete byte authority.
- Evidence: selftest kill is the declared one; the wide-run crash is a second,
  independent kill. This mutant's wide pass is the only one that read sibling
  worktree files (read-only); the control and every other mutant read only head
  blobs.

### M4 — treat an unresolvable head as zero files — **KILLED**

Target → replacement (in `run`):

```js
    if (!headIsCommit(repo, head)) {
      counts.unresolvableHead++;
      continue;
    }
```
```js
    if (!headIsCommit(repo, head)) {
      row.headResolvable = false;
      continue;
    }
```

- mutant sha256 `b634cf34896f3798f0d869e37ccd2dc5009ddb743b740a4c7f4e603c05a99e8c`
- selftest: exit 1, `allPass` false; failing case: `unresolvable-head-refused`
  (mutant returns exit 0, `unresolvableHead=0`, predicate true on the
  `f`×40-head snapshot; the case requires exit 1, `unresolvableHead=1`,
  `enumeratedMd=24`).
- wide run: exit 0, predicate true, counts **identical to the control** (all 20
  recorded heads resolve, so the defect is latent on the data).
- Evidence: kill comes solely from the declared unresolvable-head fixture.

### M5 — default `--scope` to `map` when missing — **KILLED**

Target → replacement (CLI):

```js
  if (!opts.scope) die('missing --scope (wide|map); there is no default scope');
```
```js
  if (!opts.scope) opts.scope = 'map';
```

- mutant sha256 `108d0762098edb6d2b8902fbbc6e474a3326fc1ad599c3148414b3e56aa41921`
- selftest: exit 1, `allPass` false; failing case: `missing-scope-exits-2`
  (mutant falls through to the map scope and exits 1, not 2).
- wide run: exit 0, predicate true, counts **identical to the control** (the
  data-run command passes `--scope wide` explicitly, so the default is not
  exercised there).
- default-scope probe on the frozen snapshot: control exit 2 vs mutant exit 1 —
  a direct behavioral difference in the default path.
- Evidence: kill comes from the default-scope selftest case (with the
  depth-matched lane root above) and is corroborated by the probe; the explicit
  `--scope wide` data command cannot kill it, exactly as the claim states.

## Verdicts

| mutant | defect | selftest | wide run | verdict |
|---|---|---|---|---|
| M1 | top-level `.md` only | 8 cases fail | counts 144 vs 85598 | KILLED |
| M2 | no hit recount | `forged-row-hits` fails | identical | KILLED |
| M3 | worktree bytes | `symlink-md-screened-as-blob`, `worktree-differs-from-head` fail | exit 1, ENOENT | KILLED |
| M4 | unresolvable head = 0 files | `unresolvable-head-refused` fails | identical | KILLED |
| M5 | default scope = map | `missing-scope-exits-2` fails | identical | KILLED |

SURVIVED: none. C1's kill clause K2 (any mutant survives) is therefore not
triggered by this probe. No case that would kill a surviving mutant needs to be
named.

## Scope limits

- This probe covers C1 mutants M1–M5 only. It did not run C1's `after` data pass,
  the v19 map meter (K7), the `before`/map-scope control receipt, or any C2
  probe; those belong to other seats/the L1.
- The control and M2/M4/M5 wide runs agree byte-for-byte in counts; their kills
  rest on the named selftest cases, not on the data run. M1's data run stays
  predicate-true while its counts collapse, so the wide-run count comparison —
  not the predicate — is what exposes it.
- Two harness constructions are disclosed because they can change a verdict:
  (1) mutants run from a depth-matched copy so `laneRoot()` resolves as in the
  lane; (2) `<S>/lane` carries a byte-identical map under tag `67d6f70e` so the
  M5 defaulted map scope measures the same bytes instead of dying on a missing
  map. Both are asserted in `kills.json.harness`.
- No tool was installed or upgraded. Used: node v24.21.0, git, python3,
  `scripts/hyaku/disk-guard.sh` (status only).

## Files

- `.ufo/waves/round-60/w1/R60MutC1/kills.json` (mutants, hashes, verdicts)
- `.ufo/waves/round-60/w1/R60MutC1/control-{selftest,wide}.json`
- `.ufo/waves/round-60/w1/R60MutC1/mut-M{1..5}-selftest.json`, `mut-M{2,4,5}-wide.json`,
  `mut-M1-wide.json` (M3 produced no JSON)
- `.ufo/waves/round-60/w1/R60MutC1/mutants/mut-M{1..5}.mjs`
