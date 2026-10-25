# ExecMirrorCensus — pre-append registry gate (round 23, C2)

**Verdict: PASS on the normalized append, FAIL on the append as drafted by ScribeSources.**
Mirror of the pre-append lane registry + normalized S102/S103 → `validate` exit **0**, zero
E03/E04, zero new W04. The same two rows copied verbatim from the ScribeSources fenced block
(prose `recheck` cells) → exit **1** with exactly two **E09**. Removing the used-by target →
exit **1** with exactly two **E11** (dangling control), restored → **0**.

## Mirror built (pre-append copy, no production writes)

- `MIR=.ufo/waves/round-23/assimilation/validate`
- `mkdir -p $MIR/corpus && cp corpus/SOURCES.md $MIR/corpus/SOURCES.md && cp -a corpus/knowledge $MIR/corpus/knowledge && cp -a corpus/lessons $MIR/corpus/lessons`
- `cmp corpus/SOURCES.md $MIR/corpus/SOURCES.md` → silent (byte-identical before insert); lane was 101 rows (`grep -cE '^\| *S[0-9]' corpus/SOURCES.md` → 101), last id S101.
- Used-by target set: only two prefixes occur in `col` 11 — `awk -F'|' '/^\| *S[0-9]/{…}' corpus/SOURCES.md | sort | uniq -c` → `83 corpus/knowledge`, `4 corpus/lessons`; no `corpus/evidence` ref, so those two trees are the complete target mirror. Mirror after copy: `ls $MIR/corpus/knowledge | wc -l` → 42 (41 + placeholder).
- Placeholder for the admitted entry: `cp /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md $MIR/corpus/knowledge/csrf-defense-shape-boundary.md` (staged bytes at the lane path the rows cite; ScribeEntry's draft was not yet published when the gate ran).

## Rows inserted (ExecAppendNormalize report absent; canonical cells from ScribeSources)

Inserted after S101, cells verbatim from `.ufo/waves/round-23/w1/ScribeSources.md:16-17` **except**
`recheck`: `180d (draft revision moves)` → `180d`; `180d (the sheet is revised on a rolling basis)` → `180d`
(the only cells rewritten; both stripped parentheticals recorded here, not silently dropped).

## Gate results

- **Normalized mirror:** `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file $MIR/corpus/SOURCES.md` → **EXIT=0**; `grep -cE '\t[EW][0-9]+\t' ` → 16, all **W04**, none naming S102/S103. `awk -F'|' '/^\| S10[23] /{print $2,NF}'` → `S102 NF=13`, `S103 NF=13`; teaches 23 and 24 words.
- **Baseline control (lane registry, pre-append):** same command on `tabi-shokunin/corpus/SOURCES.md` → EXIT=0, 16 W04; `diff <(grep W04 baseline) <(grep W04 mirror)` → identical set. So the append adds **no** W04 and changes nothing else.
- **E03:** none. `grep -nE '^\| *S10[23] ' corpus/SOURCES.md` → no match pre-append (ids free); `grep -cE '\tE03\t'` on every run → 0.
- **E04:** none, and structurally impossible for this pair: `grep -nc 'draft-ietf-httpbis-rfc6265bis-13' corpus/SOURCES.md` → 0 and `grep -nc 'Cross-Site_Request_Forgery_Prevention_Cheat_Sheet' corpus/SOURCES.md` → 0 before the append, so no URL+scope collision exists to trip it.
- **W04:** 16 lines, unchanged verbatim (S058, S065, S066, S068–S070, S073–S077, S095, S096, S098–S100). No S102/S103 line appears in any output.

## Red control — the drafted cells would not have passed

`scratch/ExecMirrorCensus/raw/corpus/SOURCES.md` = mirror with both `recheck` cells restored to the
ScribeSources prose. `sources-census.sh validate --file <that file>` → **EXIT=1**, exactly 2 E-lines:

```
file	E09	S102 recheck=180d (draft revision moves)
file	E09	S103 recheck=180d (the sheet is revised on a rolling basis)
```

`recheck` must be ISO / `NNd` / symbolic (`scripts/sources-census.sh:24-33`); a `NNd (` prefix is none
of the three. Appending the fenced block unchanged would have shipped two E09s.

## Dangling used-by control (path removed)

`mv $MIR/corpus/knowledge/csrf-defense-shape-boundary.md $MIR/corpus/knowledge/.placeholder-away`
then `sources-census.sh validate --file $MIR/corpus/SOURCES.md` → **EXIT=1**, exactly 2 E-lines:

```
file	E11	S102 missing used-by corpus/knowledge/csrf-defense-shape-boundary.md
file	E11	S103 missing used-by corpus/knowledge/csrf-defense-shape-boundary.md
```

Restored (`mv` back) → EXIT=0. So the append's used-by binding is checked against a real file and
would print exactly those two E11 lines if the admitted entry were never written.

## Observed while gating (advisory, not my writes)

- The lane registry gained S102/S103 from another seat at ~04:15 while this gate ran; current bytes:
  `awk …'{…}' corpus/SOURCES.md` → S102 `SameSite Cookie Attributes…`, anchor `lines 2815-2828 … sha256 06223931…d85fbf`, recheck `180d`; S103 `Cross Site Request Forgery Prevention Cheat Sheet…`, recheck **`90d`**. `validate` on the landed file → **EXIT=0**, 0 E-lines, same 16 W04 (`/tmp/base2.out`). The landed cells are **not** the ScribeSources canonical cells (title `Cookies: HTTP State Management Mechanism`, body-hash anchor) and S103's landed cadence `90d` contradicts that seat's documented `180d`; the two seats disagree on cadence, and only 90d/180d (not prose) is gate-clean.
- C2 counting command is pre-commit blind: `git grep -lE '^source: S10[23] ' -- corpus/knowledge | wc -l` → **0** today because the new entry is untracked (`git grep` reads tracked bytes only); the same regex over the tree, `grep -lE '^source: S10[23] ' corpus/knowledge/*.md`, matches **1** file, so the command reaches 1 only at a rev that contains the entry.
- S103's `last-modified: Sun, 25 Oct 2026 06:56:47 GMT` is grounded in `w1/SrcS103.md:14` (curl `-I`), not inferred from page text.

## Bounds

No tracked-file edit, no git/jj write, no spawn, no message to another seat, no network call. Mirror
and raw-variant fixtures are untracked wave artifacts under `assimilation/validate/` and
`scratch/ExecMirrorCensus/`. Tool installs: none (base `cp`, `awk`, `grep`, `cmp`, `diff`, `sources-census.sh`).
