# R56Scribe — round 56 wave w1 — source re-opens for C2 (tabi)

Seat: R56Scribe (leaf member, no subagent dispatch). Lane: tabi-shokunin.
Base revision read: `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`.

## Paths written (absolute)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/sources/html-form-control-infrastructure.html` (466,321 B)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/sources/browser_protocol.json` (1,423,170 B)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/sources/uievents.html` (920,762 B)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scribe/source-gate.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scribe/knowledge-draft.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scribe/reopen-receipt-round-56.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scribe/check-sources.out` / `.check-sources.err`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scribe/sources-census-validate.out` / `.err`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/w1/R56Scribe.md` (this file)

Nothing outside the wave dir was written. `corpus/SOURCES.md`, the knowledge dir, the lessons
dir and the fleet root were read only. No git/jj mutation was run (only `git log/show/ls-tree/
rev-list/status`, read-only). Scratch `/fast/scratch/hyaku/tabi-r56/R56Scribe/` was created for a
determinism re-fetch and **removed** before yielding (no tree left on disk); `/tmp/_span.txt`
removed.

## Commands and exit codes

| command | exit |
|---|---|
| `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/html-form-control-infrastructure.html https://html.spec.whatwg.org/multipage/form-control-infrastructure.html` | 0 |
| `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | 0 |
| `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/uievents.html https://www.w3.org/TR/uievents/` | 0 |
| determinism re-fetch of all three (scratch) → identical digests | 0 |
| `node scripts/check-sources.mjs` (lane root) | **0** |
| `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | **0** |
| `node scripts/check-source-reopen-receipt.mjs --selftest --json` | 0 (18/18 pass) |
| `node scripts/check-source-reopen-receipt.mjs --rev faee4cb2… --json` | 0 (6 reopened, 6 resolved, 0 unresolved) |

Only the three registered hosts were fetched; no cookies, no auth headers, no credentials.

## Row results (access date 2026-11-03)

| row | bytes | sha256 | anchorStatus | quote | grepCount |
|---|---|---|---|---|---|
| S083 | 466321 | `2e70de253aa945567c94ec95bb343de523fc28ea5f390b5f8e1bea801302b3b8` | **changed** | `hitting the "enter" key while a text control is <a id=implicit-submission:focused href=interaction.html#focused>focused</a> implicitly submits` (§4.10.22.2, line 2589) | 1 |
| S153 | 1423170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | **changed** | `Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).` (`Input.dispatchKeyEvent` → `modifiers`, line 14323) | 5 whole-file / **1** scoped to the `dispatchKeyEvent` block (14307-14410) |
| S161 | 920762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | **same** | `<code>true</code> if the <code class="keycap">Control</code> (control) key modifier` (§3.5.1 `ctrlKey`, line 3264) | 1 |

Drift, honestly: S083's registry anchor records the r55 raw digest `dc7c3088…` at the same
466,321 B — identical length, different bytes, so the fresh raw digest is not the anchor digest
and the anchor cell needs the round-56 digest appended. The r55 staged copy is not in the tree
(`git rev-list --all --objects | grep round-55/sources` → no hits), so the byte delta cannot be
diffed. S153's `@master` moved (1,421,620 → 1,423,170 B); the `dispatchKeyEvent` contract itself
is unchanged. S161 is byte-identical to its anchor. No digest was adjusted to match a registry
value and no quote was weakened.

## used-by proposals (L1 applies; not applied here)

S083, S153 and S161: append `corpus/knowledge/chromium-control-keys-round-56.md,
corpus/lessons/round-56.md` to the `used-by` cell; append the round-56 re-open digest to the
S083/S153 anchor cells (S161 unchanged). Full old->new strings are in `scribe/source-gate.md`.

**Ordering constraint (must not be missed):** `scripts/check-sources.mjs` requires every
`used-by` path to EXIST on disk and to CITE the row id (`inspectUsedBy` → findings
`used_by_missing` / `used_by_uncited`). Neither target file exists yet, so the used-by
extension may only be committed after the L1 creates `corpus/knowledge/chromium-control-keys-round-56.md`
and `corpus/lessons/round-56.md` and both cite `S083`, `S153`, `S161` verbatim. Applying the
cells first turns the lane's own source gate RED.

## Notes / findings for the L1

1. The seat brief named `tabi-shokunin/scripts/sources-census.sh`; that file does not exist in
   the lane. The fleet script `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` was run
   instead (read-only, stdout only).
2. `scripts/check-source-reopen-receipt.mjs` is frozen on `RECEIPT_PATH =
   corpus/evidence/round-25/freshness/reopened.json` and `EXPECTED_IDS =
   [S013,S015,S016,S020,S023,S024]`, so it cannot score a round-56 receipt over
   S083/S153/S161 — by design. The round-56 receipt follows the same schema for a round-56 gate
   variant the L1 authors.
3. The S153 `modifiers` description string occurs in five Input commands in `@master`; the
   dispatchKeyEvent-scoped count is 1. The gate's `grep -c -F` count alone would be ambiguous,
   so the scoped count is reported too.
4. `check-sources.mjs` at baseline: `verdict=clean rows=161 tiers=A:145,B:7,C:9
   status=queued:15,mined:136,rejected:10 findings=0`. Census `validate`: exit 0, `tabi ok`,
   with 22 pre-existing W04 duplicate-URL warnings (S058, S065-S070, S073-S077, S095, S096,
   S098-S100, S114, S115, S118, S123, S148, S156) — pre-existing, not introduced by this seat.

## Verdict

Three re-opens executed live, all three located quotes verified verbatim in the staged bytes
(grep counts 1 / 1-scoped / 1), two anchors moved and one is byte-identical, zero unresolved.
The used-by proposals and the anchor-cell appends are specified old->new for the L1 and are
gated on the two new corpus files existing and citing the three row ids. No claim predicate,
counter, kill rule or expected finding was touched.

No tool was installed or upgraded by this seat (nothing was missing).
