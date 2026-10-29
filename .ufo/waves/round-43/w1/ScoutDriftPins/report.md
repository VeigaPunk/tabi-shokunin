# ScoutDriftPins — freshness pins re-check (round 43, wave 1)

Date: 2026-10-29. Seat: ScoutDriftPins (leaf; no subagents spawned). Item: run
`scripts/check-freshness.mjs --worktree` read-only, confirm the 34 pins are clean,
and confirm the new round-43 instrument files disturb no pinned path.

## Environment
- Repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`. Read-only seat: no commit, no push, no git/jj mutation anywhere.
- Node v24.21.0 (pre-existing, fnm-managed). No tools installed: PACMAN GUARD honored (no pacman invocations); no uv/official-binary install was needed.

## Gate run (primary result)
```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-freshness.mjs --worktree
```
- Exit code **0**, stderr **0 bytes**.
- **34 × `PIN_MATCH target=… sha256=… newlines=…`** lines (full log: `worktree-run.stdout` in seat dir).
- Gate line, observed verbatim:
```
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
```
Usage contract honored: exactly one mode (`--worktree`); no `--repo`/`--expected` overrides (production descriptor path is fixed by the script's `descriptor_allowlist`). The script did not refuse, so `--self-test` was not required by the contract — run anyway as an instrument-health bonus (below).

## The 34 pins
`corpus/evidence/fleet-round-1-freshness/pins.tsv` = header + 34 `MATCH` rows. Targets (receipt `pinned-targets.txt`, 34 lines): 23 `corpus/knowledge/*.md`, 7 `reports/*.md`, `SKILL.md`, and 3 public external files under `~/.kimi-code/plugins/managed/kimi-webbridge/` (plugin.json, SKILL.md, references/operations.md). The checker's `target_set` gate independently rebuilds the expected target set from `git ls-tree` at its persisted baseline `c24eaea1…` plus the frozen public allowlist and demands exact equality — the 34 identities matched, so no pin was silently added, removed, or renamed.

## Round-43 instruments vs pinned paths
- Inventory (`round43-inventory.txt`): **26 paths** = 24 files under `.ufo/waves/round-43/` (claims.json, counters/, controls/, fixtures/, measure/, sources/, quarantine/, w1-dispatch.json, w1-spec.json, w1.ready, w1.ready.dispatched, w1-run.err; `w1/` seat outputs excluded) + `scripts/measure-c1-round43.mjs` + the round-43 directory entry itself.
- Exact-line intersection of those 26 paths with the 34 pinned targets: **0 lines** (`intersection.txt` is empty; `grep -xF -f pinned-targets.txt` over the inventory). The checker's own `content_drift` gate additionally re-hashed every pinned worktree byte and found all 34 identical to their pinned digests, so nothing under the round-43 wave touched any pinned path in content either.
- Nearest adjacency, recorded for completeness: new untracked `corpus/knowledge/receipt-authenticity-signing-round-43.md` sits inside the pinned *directory* `corpus/knowledge/` but is itself not one of the 34 pin targets (the target set is the fixed baseline set; untracked additions cannot enter it).

## Worktree observations (context, not pin findings)
- `git status --porcelain` (receipt `git-status-porcelain.txt`): one modified tracked file ` M corpus/README.md` (+1 line per `git diff --stat`); NOT a pin target, so the gate is unaffected. Provenance of that edit is outside this lane and was not investigated.
- 4 untracked entries: `.ufo/waves/round-43/w1.ready.dispatched`, `.ufo/waves/round-43/w1/` (wave output), `corpus/knowledge/receipt-authenticity-signing-round-43.md`, `corpus/lessons/round-43.md`.
- Instrument identity: `scripts/check-freshness.mjs`, `corpus/evidence/fleet-round-1-freshness/pins.tsv`, `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`, and `scripts/measure-c1-round43.mjs` are all git-tracked and `git diff --stat HEAD` over them is empty — the gate measured committed instrument bytes at HEAD `ba433c94`, not mutated copies.

## Instrument health (bonus axis)
```
$ node scripts/check-freshness.mjs --self-test
```
Exit 0; **12/12 PASS** (`worktree_clean`, `witness_clean`, `duplicate_target`, `missing_target`→`target_set`, `changed_bytes`→`content_drift`, `wrong_source_pin`→`source_pin`, `early_witness`, `unavailable_revision`, `public_target_injection`, `table_path_injection`, `public_file_symlink`, `descriptor_symlink`); final line `FRESHNESS_SELFTEST verdict=clean cases=12`. Fixture ran in a self-removed `/tmp` mkdtemp; repo untouched. (Receipt: `self-test.stdout`.)

## Boundaries honored
Writes confined to the seat dir `.ufo/waves/round-43/w1/ScoutDriftPins/` (this report + receipts) and scratch `/fast/scratch/hyaku/tabi-r43/ScoutDriftPins/` (created, used as cwd only, deleted before yield). Production tree, fleet repo, sibling `*-shokunin` repos, and `shokuknow` untouched; loopback not needed; no logins/forms anywhere.

## Limitations
- `--worktree` mode measures live bytes at run time (`revision=worktree`); it is a point-in-time verdict, not a durable witness. Freezing via `--witness REV` is out of this seat's scope.
- The 3 public pins were verified live against `~/.kimi-code/plugins/managed/kimi-webbridge/` files at run time and may drift afterwards.
- `corpus/README.md` modification provenance not traced (not a pin; outside lane).

## Receipts (this seat dir)
`worktree-run.stdout`, `worktree-run.stderr`, `self-test.stdout`, `self-test.stderr`, `pinned-targets.txt`, `round43-inventory.txt`, `intersection.txt` (empty), `nonpinned-round43.txt`, `git-status-porcelain.txt`, `report.md` (copy of this file).

VERDICT ok 34/34 freshness pins clean at worktree (exit 0, verdict=clean); all 26 round-43 instrument paths intersect zero pinned targets.
