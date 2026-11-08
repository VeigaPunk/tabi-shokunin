# R92Exec2 — append-only checker (round 92 w1)

## Deliverable
- Script (new): `scripts/check-append-only-round92.mjs` (Node, no deps, ESM).
  `node check-append-only-round92.mjs --lane <ABS lane> --base <rev> --tip <rev> [--json] -- <repo-relative path>...`
  For each path, bytes read via `git -C <lane> show <rev>:<path>` (read-only):
  absent at base → `new` (ok); absent at tip → `deleted` (finding); base a
  byte-exact prefix of tip → `ok`; else `rewritten` with first-diff `offset`
  and 1-based `line` of that offset in the base file.
  Output JSON `{tool, base, tip, baseRev, tipRev (full hashes), files:[{path,status,offset?,line?}], findings}`.
  Exit 0 = no findings, 1 = findings, 2 = usage (missing lane/revs/paths, unresolvable rev,
  relative `--lane`, unknown flag).
- `--selftest` mode: builds a fixture repo under `--scratch` per contract
  (mktemp subdir, asserts `git -C $D rev-parse --show-toplevel` == fixture dir),
  with an append (ok), an in-place edit (rewritten), a deletion (deleted) and a
  new file (new); exits 0 iff all four classify as expected. Fixture is removed on pass.

## Evidence (all runs from scratch cwd; evidence copies in this w1 dir)
| Check | Command (abbrev) | Result |
|---|---|---|
| Selftest | `node check-append-only-round92.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r92/R92Exec2 --json` | exit 0, `pass:true`, 4/4 expected → `.ufo/waves/round-92/w1/R92Exec2-selftest.json` |
| Demo A (fail-capable) | `--lane …/tabi-shokunin --base b1d8f07b0d58… --tip 878bc9125b85… -- LOG.md corpus/QUALITY.md` | exit 1, both `rewritten` (LOG.md offset 405854 line 4079; QUALITY.md offset 115168 line 1060) → `R92Exec2-demo-a.json` |
| Demo B (pass-capable) | `--lane …/tabi-shokunin --base bdf403ff40d9… --tip master -- LOG.md corpus/QUALITY.md SCORECARD.md corpus/SOURCES.md corpus/lessons/round-89.md` | exit 0, all 5 `ok`, findings 0 (master resolved to `4fe08d26…`) → `R92Exec2-demo-b.json` |
| Usage probes | no-paths / missing `--lane` / 0{40} base / relative lane / `--bogus` | each exit 2 with error text (verified in-session, not saved) |

## Tooling
No installs/upgrades (node v24.21.0, git 2.56.0 pre-existing). No pacman/qty shown.
No Chromium used (no port triple needed for this seat).

## Risks / blockers
- `git show <rev>:<path>` treats a directory path as absent; only file-like paths are meaningful.
- Blob reads buffer fully (512 MiB cap); fine for corpus files, not for multi-hundred-MB blobs.
- First-diff offset of a truncated tip (tip shorter than base) reports `offset == tip length` with `line` of that offset in the base — spec-consistent.
- None block integration. No commits, no other files modified.

## C1 stance
VERDICT C1: neutral
- This seat's artifact (append-only checker) has no bearing on claim C1
  (`chromium-crosssite-iframe-chooser-linux`, predicate `C1-IFRAME-CHOOSER-R92`).
  No evidence produced here shows the C1 stated wording false or wider than its counter.
