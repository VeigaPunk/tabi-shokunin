# RevClaimsFreeze — round 30 w1 claims-freeze review

## Verdict

The freeze holds. All three `frozenDigests` in `.ufo/waves/round-30/claims.json` are byte-identical to `git show 061e6202…:<path> | sha256sum`; the freeze commit `061e62024c0523d3c6c7e819506a773ff2cd7d75` sits directly on baseline `f7c0317e…` and carries only claims + baseline receipts + assimilation notes + the three counter files + SKILL.md — no corpus/knowledge, no SOURCES rows, no lesson (so `frozenBeforeData: true` is honest). Both claim predicates map one-to-one onto the counter code (C1: exit 0 ⇔ `fault_survivors 0 && benign_killed 0` with totals 27/13 from the catalogue; C2: every clause — tag, provenance, mined rows opened ≥ `--since`, used-by, receipt g1–g7, entry-quote q1, live l1+l3 — is a distinct check with the claimed failure id). Every control receipt label matches, and I reproduced every control whose fixture bytes are committed: c1 do-nothing 14/0 exit 1 (same 14 survivor ids, same order), c1-J2 0/13, c1-J3 9/3, c1-J4 exit 2 with the byte-identical refusal message, c2 do-nothing 0/0 exit 1 (offline and `--live`), c2-J2 `r4-opened`, c2-J3 `g1-receipt`, plus both self-tests (12/12, 24/24) and census (exit 0, `tabi ok`). Both counters honour TMPDIR/`--work`; neither contains a literal `/tmp` path. No predicate/code/receipt drift found; residual items below are notes, not blockers.

## Findings by severity

### High
None.

### Medium
None.

### Low (notes, no claim affected)

1. **`check-gate-mutants.mjs` leaks its work dir on exit-2 refusals.** Header (line 24) promises work trees are "removed on exit unless `--keep`", but `main()` calls `process.exit(2)` inside the `catch` (line ~410), so the `finally { rmSync(work, …) }` never runs for Refusal exits. Observed: after my c1-J4 exit-2 rerun, an empty `work/gate-mutants-xaOub2` remained under my scratch `--work`; all clean/failed (exit 0/1) runs cleaned up. Counts and exit codes unaffected; leaks only an empty dir on the refusal path.
2. **c2-J4 (`selfquote`) fixture is not byte-reproducible from committed receipts.** `baseline/c2-control-J4-selfquote.stat` lists 10 changed files (incl. a 16-line change to `scripts/check-frontier-admission.mjs` — the pre-`--live`→frozen counter delta the README describes) but no `.diff` with content. The committed JSONs match the claims labels exactly (offline: `live:false, admitted 2`; `--live`: `admitted 0`, `l3-live-bytes` on S182 and S159), so the label check passes and the "offline is gameable → `--live` is part of the predicate" conclusion is supported; the reading itself I could not re-derive. Verification gap, not drift.
3. **Junk-control diffs are cumulative, not isolated.** `c1-control-J3-site-grep.diff` is relative to J2's post-state (blob chain `88d3cf5..cbb2388`, `8cb61f7..6996286`), `c1-control-J4-literal.diff` relative to J3 (`6996286..791f16d`), and `c2-control-J3-date-bump.sources.diff` relative to J2 (`46a5b79..75f38e3`). Reproducing requires applying J2→J3→J4 in order; the README's "one scratch commit on top" implies this but the per-control claims labels don't state it. Applying in order reproduces every label exactly (commands below).
4. **c2 `.sources.diff` files carry only the `corpus/SOURCES.md` hunk**, not the two knowledge entries the scratch commits added (per `c2-control-J2-package-as-is.stat`: 31/34-line files). I reconstructed them as package bytes + one `frontier: rate-tos-signal` line inserted after the `ground:` header line — line counts then match the stat exactly (34/31) — and both readings reproduced. Faithful to the label "package entries copied byte-exact plus the frontier tag"; not a byte-proof of L1's original files.
5. **C1 killRule's exit-2 enumeration is non-exhaustive** ("a catalogue find string no longer present exactly once, a mutant-aware literal, a pristine self-test not clean"): the code also refuses on usage, bad/unresolvable rev, malformed catalogue, absent gate script, duplicate ids, unknown kind, identity mutant. All are "could-not-evaluate", consistent with "counter exit 2 … -> not verified"; noting for precision only.

## Evidence

Environment: clean `git clone --shared` at `061e62024c0523d3c6c7e819506a773ff2cd7d75`, `git status --porcelain` empty; `TMPDIR=/fast/scratch/hyaku/tabi-r30/RevClaimsFreeze/tmp`; every scratch commit `-c user.name=RevClaimsFreeze -c user.email=RevClaimsFreeze@scratch.local` after `rev-parse --show-toplevel` check; lane only read via `git -C … show/rev-parse/diff/status`.

### Frozen digests — all match

```
for f in scripts/check-gate-mutants.mjs scripts/gate-mutants.json scripts/check-frontier-admission.mjs; do
  git -C <lane> show 061e6202…:"$f" | sha256sum; done
→ 02945f882ea9…3a55  cd1c27a2a971…3833  cadef57e8d96…9eca   (all three equal frozenDigests)
```
`baseline/frozen-counter-sha256.txt` carries the same three digests. Freeze commit parent = `f7c0317e…` (baseline); `diff --name-only f7c0317 061e6202` = 32 files: `.ufo/waves/round-30/{claims.json, baseline/* (21), assimilation/* (6)}`, `SKILL.md`, the 3 counter files. No claim data.

### Predicate ↔ code

- **C1** (`scripts/check-gate-mutants.mjs`, 422 lines): `clean = survivors.length===0 && benignKilled.length===0` → exit 0, else 1 (main's last lines); Refusal → exit 2. Counts `fault_total/benign_total` from the catalogue: `scripts/gate-mutants.json` has exactly 27 fault + 13 benign over exactly `scripts/check-s106-evidence.mjs` and `scripts/check-release-pins.mjs` — matches the predicate's totals and the "before" 14-id list (5 s106 + 9 pins; identical set and order in the J1 receipt and my rerun). Pristine-self-test-clean is a precondition of exit 0 (Refusal otherwise). Static guards: find-once, mutant-aware literal ≥8 non-space chars — matches killRule's first two exit-2 causes; find-string drift → exit 2 as claimed.
- **C2** (`scripts/check-frontier-admission.mjs`, 461 lines): clause-by-clause — tag in first 15 lines (`frontier: rate-tos-signal`); e1 provenance; r1 row present; r2 `status==="mined"`; r3 used-by names `corpus/knowledge/<file>`; r4 `opened >= --since`; g1 receipt committed/parses/names id; g2 url in row's source cell; g3 bytes committed + sha256 + `http_status===200`; g4 quote 1–25 words; g5 quote in normalised bytes; g6 quote in `corpus/lessons/round-30.md` (default `--lesson`); g7 refetch by different seat, sha-matched, quote present; `--live` l1 live quote + l3 live bytes ≡ committed bytes normalised; q1 every ≥4-word quoted span (code/fences excluded) in cited bytes. `clean = population>0 && admitted===population` → exit 0; else 1; refusal (malformed frontier/since, bad rev, registry absent) → 2. Exactly the predicate.
- **Separability** holds: C1's counter reads only the catalogue, itself, and the two gate scripts — no corpus file; C2's reads only `corpus/SOURCES.md`, `corpus/knowledge/*`, receipts, lesson — no script.

### Controls re-run (clean clone at 061e6202, frozen counter bytes)

| Receipt | Claims label | My re-run | Exit |
|---|---|---|---|
| c1-control-J1-do-nothing | 14 survivors, benign_killed 0 | `fault_total 27, survivors 14` (same ids/order), `benign_killed 0` | 1 ✓ |
| c1-counter-selftest | clean 12/12 | `clean cases=12 passed=12` | 0 ✓ |
| c1-J2-length-fingerprint | 0 survivors, 13 killed | identical, same 13 `benign_killed_ids` | 1 ✓ |
| c1-J3-site-grep | 9 survivors, 3 killed | identical, same id sets | 1 ✓ |
| c1-J4-literal | exit 2 mutant-aware literal | `mutant-aware literal: fault mutant s106-anchor-unique-true …` byte-identical message | 2 ✓ |
| c2-control-J1-do-nothing | population 0, admitted 0 | same, offline and `--live` | 1 ✓ |
| c2-counter-selftest | clean 24/24 | `clean cases=24 passed=24` | 0 ✓ |
| c2-J2-package-as-is | population 2, admitted 0 (r4-opened) | `population 2, admitted 0`, `r4-opened S182/S159` | 1 ✓ |
| c2-J3-date-bump | admitted 0 (g1-receipt) | `population 2, admitted 0`, `g1-receipt S182/S159` | 1 ✓ |
| c2-J4-selfquote-{offline,live} | offline admitted 2; `--live` admitted 0 (l3-live-bytes) | JSONs match labels (see Low #2 — not re-derived) | — |
| census-start.txt | exit 0, `tabi ok` | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok` | 0 ✓ |

Rerun receipts copied to `.ufo/waves/round-30/w1/RevClaimsFreeze/` (`*-rerun.*`). Representative commands (exit codes inline):

```
node scripts/check-gate-mutants.mjs --rev HEAD --repo $C --work $S/work --json   # c1-J1 exit=1
node scripts/check-frontier-admission.mjs --rev HEAD --repo $C --frontier rate-tos-signal --since 2026-10-26 [--live] --json   # exit=1
node scripts/check-gate-mutants.mjs --selftest                                   # exit=0
node scripts/check-frontier-admission.mjs --selftest                             # exit=0
git -C $C apply <baseline>/c1-control-J2-length-fingerprint.diff && git -C $C commit -q -m "repro c1-J2"   # then counter → exit=1
# J3, J4: apply cumulatively J2→J3→J4, counter after J3 → exit=1, after J4 → exit=2
# c2: apply c2-J2 .sources.diff + reconstructed entries → exit=1 r4-opened; + c2-J3 .sources.diff → exit=1 g1-receipt
```

### TMPDIR / `--work` (scratch discipline §7.4)

- `check-gate-mutants.mjs`: `--work DIR` → `mkdtemp(DIR/"gate-mutants-*")` (line 403); default `mkdtemp(tmpdir(), …)`; child self-tests get `TMPDIR/TMP/TEMP` pointed at a per-run tmp (line 152). Grep for literal `/tmp/` or `"/tmp` across both counters: **0 hits**.
- `check-frontier-admission.mjs`: production mode writes stdout/stderr only (curl `-o -`); no `--work` flag and none needed; self-test temp trees under `os.tmpdir()` (line 366) → TMPDIR honoured.
- Integrated-state run shapes match the code (`--repo/--work` for C1; `--repo` only for C2).

### Observations (not defects)

- Lane tip has advanced mid-wave: `HEAD = 072af95fe2822f0785a6ff88a578e2142dd258e5` with 10 dirty working-tree entries; `merge-base --is-ancestor` confirms 061e6202 is its ancestor — freeze untouched, measurements for this review all ran in my own clone at 061e6202.
- Census rerun (against the live lane working tree) shows one extra `W04` warning vs `census-start.txt`: `S118 duplicate url …/WebMCPModel.ts across scopes` — consistent with the reserved S118 id already appearing in-flight; verdict `tabi ok`, exit 0 unchanged.

## Residual risk and verification gaps

1. c2-J4 readings verified by label/digest consistency of committed JSONs only; fixture not committed as a diff (Low #2).
2. c2-J2/J3 reproductions rely on my reconstruction of the two entry files (package bytes + tag; line counts match the committed stat exactly) — not a byte-identity proof of L1's scratch files (Low #4).
3. c1 J1–J3 receipts embed `rev`s of L1's scratch commits (51a4132f, 42558fa8, 03ed82ae) which no longer exist anywhere I can fetch; the readings — the substance — reproduce exactly at 061e6202 from the committed diffs.
4. Exit codes for the frozen receipts are not embedded in the receipt JSONs (only derivable from `clean`/refusal fields); I verified them by re-running, except c2-J4 (gap 1).
