# ScoutRegister — registry drift audit (tabi round 43, attempt 1)

Audited: `corpus/SOURCES.md` at freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (frozen bytes via `git show <rev>:corpus/SOURCES.md`, sha256 `13ef6d4cf3bbdd5db118bf869f86f1caec40bdf8f3fd7a1791aee454fe7ca678`, 148,086 B; worktree copy is byte-identical — `git status --porcelain -- corpus/SOURCES.md` empty, HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` blob identical). Baseline (round-42 end): `ab592825cd195599822ca227f7768914df208201`, SOURCES sha256 `7bd231fef54c7e876c0be817729f1590e5c66368b1506e60ad4d3c04e67bf21b`, 146,972 B.

Godspeed axes: correctness (cell-by-cell + validator), coverage (collision history + drift diff + URL-dup replication), freshness (parallel batches), evidence quality (artifacts + producer digests). No tool installed or upgraded; no pacman; no network. Leaf seat: no subagents; no git/jj mutation anywhere (jj colocated repo — `jj` deliberately not invoked to avoid working-copy auto-snapshot).

## Result per acceptance criterion

| Item | Expected | Observed | Verdict |
|---|---|---|---|
| Total rows at 7ca6f018 | 151 | 151 rows, all inside `## Registry`, 0 outside, 0 duplicate ids, contiguous S001→S151, no gaps | ok |
| S150/S151 cells | 11 cells, 0–3 leading spaces | 11 cells each; every cell exactly 1 leading space, no tabs, no cell >3 | ok |
| Escaped pipes | none | none (`\|` absent from both raw rows) | ok |
| ISO dates | valid | `opened` = `2026-10-29` both rows; calendar-valid, ≤ today | ok |
| Symbolic cadence | `on-release` | `recheck` = `on-release` both rows | ok |
| Id collision | S150/S151 previously unused | absent from ab592825 (149 rows, S001→S149); `git log --all -S'S150'`/`-S'S151'` over `corpus/SOURCES.md` → only `7ca6f018`; freeze id set = base ∪ {S150,S151} exactly | ok |
| Census validator | run + record exit + W04 delta vs r42 end (21) | `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → **exit 0**, 22 lines = **21 × W04 + 1 × `tabi ok`**, zero E-codes; **delta = 0** (W04 id set byte-identical to the r42-end record `.ufo/waves/round-42/measure/census-end.out` / `w1/ExecCensus/validate.txt`: S058 S065 S066 S068 S069 S070 S073 S074 S075 S076 S077 S095 S096 S098 S099 S100 S114 S115 S118 S123 S148) | ok |
| Used-by paths | exist or this round's planned paths | both rows → `corpus/knowledge/receipt-authenticity-signing-round-43.md`: not committed at freeze/HEAD (`git cat-file -e` fails both) but **present on disk** (untracked, 6183 B, mtime 2026-10-29T17:51:58, sha256 `b8cee7faa378fcf61ce4ea3d815d83bb439bacaaf6deabb92d904aeb73889b48`) and **this round's planned path** — `w1-dispatch.json`/`w1-spec.json` seat `ScribeEntryAuth` drafts exactly this file; the note cites both `S150` and `S151`, and the per-lane gate's `used_by_uncited` check is clean | ok |

## Supporting observations

- Drift shape base→freeze: unified diff of the two frozen blobs = **2 added lines, 0 removed, 0 modified** — pure append of the S150/S151 rows (`evidence-base-to-freeze.diff`). No in-place rewrite of neighbors S148/S149 or any other row.
- `sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi` → `rows 151, tier A135/B7/C9, status mined126/queued15/rejected10, FLEET missing 0` = r42-end histogram (A133/B7/C9, mined124) + exactly S150,S151 as tier-A mined.
- Per-lane gate `node scripts/check-sources.mjs` (worktree sha256 `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`): `SOURCES_GATE verdict=clean rows=151 tiers=A:135,B:7,C:9 status=queued:15,mined:126,rejected:10 findings=0`, exit 0. (Context: the r42 lesson draft recorded `failed, 2 findings` for the gate at r42 — those runs read working-tree knowledge notes, which round-43 seats have since edited; the committed-bytes audit above is revision-pinned and unaffected. Not a SOURCES.md drift.)
- URL-duplication replication (fleet normalize rule) over all 151 frozen rows: 0 predicted W04/E04; S150 (`nodejs.org/docs/latest-v24.x/api/crypto.html`) and S151 (`git-scm.com/docs/git-cat-file`) URLs each occur once — consistent with the observed W04 delta of 0.
- Enum checks: kind `docs`, tier `A`, status `mined` all valid per contract (`check-sources.mjs` sets); anchors non-empty; no credential patterns; community-at-tier-A n/a.
- Worktree state during seat (context, none mine): ` M corpus/README.md` (concurrent seat), untracked `.ufo/waves/round-43/{measure/failed-run-1,w1.ready.dispatched,w1}`, `corpus/knowledge/receipt-authenticity-signing-round-43.md`, `corpus/lessons/round-43.md`.

## Residual risk (recorded, not a contract breach)

The S150/S151 used-by target is still untracked: a census `validate` run against the *freeze tree* reports `E11 ×2` (sibling ExecCensus `06-validate.frozen-tree-committed.out` observes exactly this), and the admission chain's knowledge note exists only as working-tree bytes until integration commits it. The requested metric — live lane-root validator exit + W04 delta — is exit 0 / delta 0.

## Commands (exact)

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc^{commit}'   # ok
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018…:corpus/SOURCES.md          # frozen bytes audited (sha256 13ef6d4c…)
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --all -S'S150' --format='%h %ad %s' --date=short -- corpus/SOURCES.md
  → 7ca6f018 2026-10-29 round-43: freeze C1 … S150/S151 opened …              # single introducing commit; same for S151
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
  → exit 0; 21 × "tabi W04 <id> duplicate url … across scopes"; final line "tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md"
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi   # rows 151, A135/B7/C9, mined126/queued15/rejected10
node scripts/check-sources.mjs   # in /home/vgpnk/Projects/shokunin/tabi-shokunin → SOURCES_GATE verdict=clean … findings=0, exit 0
```
Cell parsing replicated the frozen validators' rules (`rowPattern` `^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|`, `NF==13`, per-cell leading-space measurement on raw cells).

## Evidence (this seat dir)

`report.md` (copy), `evidence-s150-s151-cells.json` (cell-by-cell raw rows), `evidence-base-to-freeze.diff`, `evidence-census-validate.out` + `.exit`, `evidence-census-mode.out`, `evidence-gate-check-sources.out`, `evidence-digests.txt`, `evidence-worktree-status.txt`. Scratch `/fast/scratch/hyaku/tabi-r43/ScoutRegister` deleted before yield.

Limitations: git history only (jj colocated, not invoked — auto-snapshot would mutate); used-by existence measured via `git cat-file -e` at freeze/HEAD plus disk stat; W04 baseline taken from the committed r42-end validator records (byte-identical id set, so no re-derivation at ab592825 was needed); "cites row id" for the note verified by substring + gate `used_by_uncited` cleanliness, not by quote-position audit (RevS150/RevS151 seats own quote verification).

VERDICT ok — 151 rows at 7ca6f018; S150/S151 contract-clean with no id collision; census validator exit 0 with 21 W04, delta 0 vs round-42 end; used-by targets are this round's planned (untracked-but-present) paths.
