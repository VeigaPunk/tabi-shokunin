# MutC3Receipt — mutation-test of C3's integrated data at 32008a453737a27f69e9ab401d0b9775d2a944f7

Seat: MutC3Receipt (w2 falsify, round 29, milestone C3). Lane untouched (read-only git only);
every measurement ran in my own `git clone --shared` of the lane checked out at
32008a453737a27f69e9ab401d0b9775d2a944f7 (porcelain empty at checkout). Scratch:
`/fast/scratch/hyaku/tabi-r29/MutC3Receipt` (cleaned after receipts were copied out).

## Setup (scratch only, per item)

1. Tip baseline with no refetch records: `node scripts/check-release-pins.mjs --repo <clone> --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47 --json` → exit=1, population=23, unresolved=23, holds=0, drifted=0; all 23 rows fail `f6-refetch` and nothing else (`tip-baseline.json`).
2. Added `corpus/evidence/round-29/release-pins/refetch/<id>.json` for all 23 ids, generated from the pristine receipt (`{id, seat, fetched_at, files:[{path, tag: "156.0.8078.47", status: new_status, sha256: new_sha256}]}` per entry file), seat `MutC3Receipt` — differs from every entry's `fetched_by` (`PinS033`…`PinS106`). Committed in the scratch clone.
3. Mutant-set baseline commit `fb1376443d048866016dd1721189368db65ee65d` (= 32008a45 + refetch records only): exit=0, **population=23, unresolved=0, holds=16, drifted=7** (`baseline.json`). The mutant set starts at unresolved=0 as required.

Counter invocation for every run below:
`node scripts/check-release-pins.mjs --repo <clone> --rev HEAD --stable 156.0.8078.47 --json`

## Mutant table

| # | Mutation (one at a time from fb137644) | Mutant rev | Exit | Pop | Unres | Holds | Drifted | Unresolved rows and firing reason | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| M1 | S042 receipt entry: `superseded_by` removed | `4deae992ffd69142` | 1 | 23 | 1 | 16 | 6 | S042: `s1-drift-unsuperseded` | killed |
| M2 | S109 teaches prefix `supersedes S042 — at tag 156` → `supersedes S042 at tag 156` (em-dash dropped) | `e988d594d7cf5eb8` | 1 | 23 | 1 | 16 | 6 | S042: `s1-drift-unsuperseded` | killed |
| M3 | S110 source cell tag `refs/tags/156.0.8078.47/` → `refs/tags/154.0.8037.97/` (source cell only) | `f7ad8b2e8bdfab8b` | 1 | **24** | **2** | 16 | 6 | S110: `r1-entry missing or no files`; S071: `s1-drift-unsuperseded` | killed (double) |
| M4 | S106 file ranges `[[186,187]]` → `[[186,189]]` (in-bounds: old file 1624 lines; token `186-189` absent from anchor "lines 186-187") | `bddc08b4c4bb0d6f` | 1 | 23 | 1 | 15 | 7 | S106: `f4-ranges content/public/common/content_features.cc [186,189]` | killed |
| M5 | `bytes/156.0.8078.47/.../Page.pdl` replaced by the 154 file (S105's only file) | `89c7de0452c32d85` | 1 | 23 | 1 | 15 | 7 | S105: `f3-bytes sha` + `f5-digest` (cascade, see below) | killed |
| M6 | S080 entry: first file dropped (`script_tool_types.h`, 8 → 7 files) | `bad789f20f19fc1c` | **0** | 23 | **0** | 16 | 7 | — | **SURVIVED** |
| M6b | Diagnostic second instance: S080 `model_context.cc` dropped instead | `8d3ebae613785abb` | **0** | 23 | **0** | 16 | 7 | — (S080 verdict=drifted, reasons empty) | **SURVIVED** |
| M7 | S094 file `new_status` 404 → 200 | `ccf021dc956571d3` | 1 | 23 | 1 | 15 | 7 | S094: `f6-refetch` (refetch record status 404 ≠ mutated 200; fires before the 404-holds branch is reached) | killed |

7 of 7 assigned mutants killed (M3 doubly); M6 survived and is a coverage finding, not a contract change.

## Coverage finding — M6/M6b survivor

Dropping any single file of S080's 8-file entry is invisible to the frozen counter (exit 0,
unresolved=0, holds/drifted identical to baseline, S080 still verdict=drifted and resolved via
`superseded_by: S112`):

- `r1-entry` only requires ≥ 1 file; there is no completeness check of the entry's file set
  against the row's anchor, which names 8 paths (`script_tool_types.h:16-49`,
  `form_mcp_schema.cc:208-300`, `html_form_element.cc:174-259`, `frame.mojom:1112-1119`,
  `local_frame_mojo_handler.cc:987-1005`, `model_context.cc:528-580,695-745`,
  `inspector_web_mcp_agent.cc:220-243`, `WebMCP.pdl:25-30,109-123`).
- `f5-digest` cannot bind here: S080's anchor carries **no sha256** — only range tokens and a
  40-hex commit id `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, which matches neither the 64-hex
  nor the `8…4` digest patterns → `digests.length === 0` → the check is skipped entirely.
- The verdict class is preserved: the remaining files still drift, so the row stays
  `drifted` and the S112 supersession still resolves it.

Net effect: an entire anchored file's evidence can be silently removed from a multi-file
drifted row without `unresolved > 0`. Reported as a finding only (attack seat; no production
change made).

## M5's second reason is a cascade, not an independent catch

S105's anchor carries the full 64-hex digest `e944a3b1…` (the old sha). In the counter, `oldShas.push(f.old_sha256)` happens only after f3 passes; M5's f3 sha failure `continue`s before the push, leaving `oldShas` empty, so `f5-digest` fires for any row with a digest. Primary catch: `f3-bytes sha`. The f5 echo would fire for any digest-bearing row whose f3 fails, regardless of which sha broke.

## Hashes (before → after)

- `receipt.json` pristine blob @ fb137644: `ef3f9b0ad25dff53e8f429ffe200060cf8d9c4e269727487fc3431398ea23f77`
  - M1 after `81b6b057508cfea71d14de374d6fd62d7b5930ecb5bf6c75a47c1c2190faf8b2`, M4 after `79cd1a09ce62ed0330526644f4bed6e2087804e22e17068cf929376d1b65e861`, M6 after `f30a06f70ebcdf18e69142d2a5da7b0ef9d9048ebda312125c81051975fbbeb2`, M6b after `244c15dcaf7df002f8bdedae2abfdeb15261caeba18db58988433180d23048aa`, M7 after `a1f61361ae4943a1342433cb33372d11e518f505fea747346725bac5128ad488`
  - jq re-indents (1 → 2 spaces); every mutation was verified semantically by jq readback in the run transcript (e.g. `S042 superseded_by=ABSENT`, `S106 ranges=[[186,189]]`, `S080 files=7`, `S094 new_status=200`).
- `corpus/SOURCES.md` pristine @ fb137644: `ed29d04e7ad048375528dd6cdf32cc07ee52bd2355a9e52c77cbc01943f6d85d`
  - M2 after `6b602d9b74f51cd79529d255445bdf5397c67611830cdf76225d7a032450a09d`, M3 after `1e9d207694845cf5a8dc46825be8ea2ddeed7ea3e61c89a40a1d0949b493d83a`
- `bytes/156.0.8078.47/.../Page.pdl` pristine @ fb137644: `9eb79e1b6747b462e908d54758474854064d42b8362097542708d11e8c407a11` (= receipt `new_sha256`) → M5 after `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` (= 154 file sha = receipt `old_sha256`)

## Commands and exit codes (paste of the decisive lines)

```
git clone --shared --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone   # ok
git -C $S/clone checkout -q 32008a453737a27f69e9ab401d0b9775d2a944f7                    # HEAD=32008a45…, porcelain=0
node scripts/check-release-pins.mjs --repo $C --rev 32008a45… --stable 156.0.8078.47 --json   # exit=1 pop=23 unres=23 (all f6-refetch)
# refetch generation (jq from pristine receipt, seat MutC3Receipt) + commit
git -C $C rev-parse HEAD                       # fb1376443d048866016dd1721189368db65ee65d
node scripts/check-release-pins.mjs --repo $C --rev HEAD --stable 156.0.8078.47 --json        # exit=0 pop=23 unres=0 holds=16 drifted=7
# per mutant: mutate → git add -A && commit → counter --rev HEAD → capture → git reset --hard fb137644
M1 exit=1 unres=1 S042 s1-drift-unsuperseded
M2 exit=1 unres=1 S042 s1-drift-unsuperseded
M3 exit=1 unres=2 S110 r1-entry missing or no files; S071 s1-drift-unsuperseded (pop=24)
M4 exit=1 unres=1 S106 f4-ranges [186,189]
M5 exit=1 unres=1 S105 f3-bytes sha; f5-digest
M6 exit=0 unres=0 (survivor)
M6b exit=0 unres=0 (survivor, diagnostic)
M7 exit=1 unres=1 S094 f6-refetch
```

## Restoration evidence

- After every mutant: `git reset -q --hard fb1376443d048866016dd1721189368db65ee65d`, printed `porcelain=0` each time.
- Lane repo: only read operations (`clone --shared`, `rev-parse`, `show`, `status`); nothing written to the lane, its index, or its jj state. During my run the lane tip advanced to `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` with 38 dirty entries from concurrent seats; my pinned measurement base 32008a453737a27f69e9ab401d0b9775d2a944f7 is intact in git history and was the sole base of every run above.
- Scratch `/fast/scratch/hyaku/tabi-r29/MutC3Receipt` removed after receipts were copied to `.ufo/waves/round-29/w2/MutC3Receipt/`.

## Tooling record

No tools installed or updated (operator authorization 2026-10-19 noted; pacman guard respected; none needed — git, node v24.21.0, jq, coreutils sufficed).

## Raw receipts

`.ufo/waves/round-29/w2/MutC3Receipt/{tip-baseline,baseline,m1,m2,m3,m4,m5,m6,m6b,m7}.json`
