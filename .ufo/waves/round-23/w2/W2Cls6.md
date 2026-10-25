# W2Cls6 — c6-landed-log-binding (round 23, wave 2, attack)

**Verdict: CONFIRMED** — c6 fires on exactly 2 §Landed-changes rows (report lines 85 and 89), each cites only commits whose diff-tree lacks `LOG.md`; all three declared edges hold; three fail-open/precision defects found, none changing the count of 2.

## Runs (pinned by the digest the instrument echoes)
- HEAD-committed bytes (`sha256 6eeaeda7…`, `git cat-file -p HEAD:scripts/round-evidence-audit.mjs | sha256sum` with HEAD now `03c1b4d`): `node scripts/round-evidence-audit.mjs --rev be271a2d98f3e2f6ec3e179c8e17f50f80698571 --round 22 --round-cap 128 --json` → exit 1, findings 7, classes 6, c6 = `["47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e","be271a2d98f3e2f6ec3e179c8e17f50f80698571"]`.
- Current working bytes (`94759966…`, sha equal before/after the run): same command → identical result; `git diff -U0 scripts/round-evidence-audit.mjs | grep -ci 'c6\|landed-log'` → 0, so c6 is byte-untouched by the uncommitted edit.
- Baseline absence: at `a89f1935…` (HEAD when I started) `git cat-file -e a89f1935…:scripts/round-evidence-audit.mjs` → `fatal: path 'scripts/round-evidence-audit.mjs' exists on disk, but not in 'a89f1935…'`; before = 0 holds.
- Report bytes are the committed fleet bytes: `git -C /home/vgpnk/Projects/shokunin cat-file -p HEAD:.ufo/reports/round-22/tabi.md | sha256sum` = `a838b5b4…` = on-disk file.

## The two flagged rows (re-derived)
| Report line | Cited commit | `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff-tree --no-commit-id --name-only -r <hash>` |
|---|---|---|
| 85 | `47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e` | 5 files (`fixtures/expected.json`, `measure-c1.mjs`, `post-crash-repair.json`, `selftest-c1.mjs`, `semantic-expectations.json`) — **no `LOG.md`** |
| 89 | `be271a2d98f3e2f6ec3e179c8e17f50f80698571` | 1 file (`.ufo/waves/round-22/checks-final.json`) — **no `LOG.md`** |
Clearers re-checked the same way: line 84 via `0f24164` (LOG.md=1); lines 86–88 via `fbee618`/`fbee618b…` (LOG.md=1); `e3cf4e0` (row 84) and `47bfb5f` (row 86) are LOG-less but OR-cleared by a sibling hash. Row 85's `d00aed4c…` is not a lane object (`git cat-file -t d00aed4c` → fatal) and was dropped by the check, not reported (F1).

## Declared edges (mutants under `.ufo/waves/round-23/scratch/W2Cls6/`, same flags + `--report <mutant>`)
| Edge | Mutant | c6 result | Verdict |
|---|---|---|---|
| `LOG entry lands in <hash>` must clear | `m9-lands-in-hash.md` (phrase + `e3cf4e0`) | 1 | **clears as specified** |
| Row with no hash must be skipped | `m2-nohash.md` | 2 (unchanged) | **skipped as specified** |
| Two commits, one touches LOG.md must clear | `m3-two-commits.md`; real row 86 | 1; 0 | **clears as specified** |
Fixture matrix agrees: `--selftest` → 12/12; `c6-red-landed-commit-without-log` trips, `c6-green-entry-bound-elsewhere` clears.

## Findings
- **F1 (medium, fail-open).** Unresolvable cited ids are discarded — `scripts/round-evidence-audit.mjs`: `if (touched === null) continue;` then `if (seen.length && !logBound && !bindsElsewhere)` — so a row whose only hash does not resolve is clean. `node scripts/round-evidence-audit.mjs --rev be271a2d… --round 22 --round-cap 128 --report .ufo/waves/round-23/scratch/W2Cls6/m4-bogus.md --json` → c6 `["47bfb5f7…"]`: the `deadbeef` row silently passed. Row 85 already relies on this skip for `d00aed4c`.
- **F2 (low, both directions).** Hash extraction is row-wide (`row.matchAll(/\b[0-9a-f]{7,40}\b/g)`), not column-scoped, so prose counts as citation: `--report …/m7-prose-hash.md` flags `e3cf4e0` from the Change cell while the Commit cell holds no hash; `--report …/m10-prose-log-carrier.md` clears a row whose Commit cell is `be271a2d…` (LOG-less) because prose names `fbee618` — a prose mention of an unrelated LOG-carrying commit unbinds the row.
- **F3 (low, fail-open).** All-digit prefixes are filtered out (`/[a-f]/.test(h) && !/^\d+$/.test(h)`): `--report …/m6-numeric.md` → c6 `["47bfb5f7…"]`, i.e. a genuine `1234567` commit prefix is never checked.
- **F4 (low, evidence quality).** Evidence is `row.trim().slice(0, 160)`; on row 85 it stops at `…case (45/45)` before the Commit column, so the finding does not display its own cited hash (the `cited` field does): `node -e "const r=require('/tmp/a22d.json');console.log(r.findings.filter(f=>f.class==='c6-landed-log-binding')[0].evidence[0])"`.
- **F5 (low, revision binding / live churn).** The counter is not runnable from a revision while the working copy is dirty: HEAD `03c1b4d` holds `6eeaeda7…`, the on-disk file changed at least three times during this review (`6eeaeda7` → `3fe9c326` → `87b9f678` → `94759966`, `sha256sum scripts/round-evidence-audit.mjs` after each run; `git diff --stat scripts/round-evidence-audit.mjs` → 83 insertions/21 deletions at the last check) with c6 output invariant. The landing must commit the working copy before the C1 counter is reproducible from a rev; every output already carries `scriptSha256`.

## Residual risk / verification gaps
- c6 binds a row to a commit that touches `LOG.md` anywhere; it never checks the named section exists. Row 86 clears on file-touch alone, and row 89 names "§Round22 landing (serial cohort)" while `git show be271a2d:LOG.md | grep -ci cohort` = 3 non-subsection mentions. That is the class's declared scope, not a defect: a c6-clean report can still misname its entry.
- Row 85 is a true positive under the predicate, but the entry it names (items 1 and 3) does exist at `fbee618` (`git show fbee618:LOG.md | sed -n '1579p'` → `## Round22 landing …`). c6 cannot distinguish "entry carried by a later commit" from "no entry at all"; repair the row to the carrying commit rather than delete it.
- Only lane objects were resolved; the fleet report's provenance rests on its committed sha256 alone.
- Tooling: none installed or updated (no pacman/uv/cargo/npm transaction); pacman untouched per the host pause.
