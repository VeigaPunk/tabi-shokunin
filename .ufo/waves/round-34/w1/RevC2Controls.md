# RevC2Controls-2 — C2 controls reproduction (round 34 w1)

## Verdict

**Reproduces.** The C2 half of the frozen round-34 controls was re-run end-to-end in scratch from the freeze commit 59f1b47aae277e1670e4a824173da8cde7e388ee (baseline 15dfaccb34601c2d221c78501e2befd8998d600c), with receipts redirected to this seat's output dir and nothing written into the lane. All four C2 controls returned counter exit 1 / predicate false exactly as committed: c2-J1-do-nothing is **byte-identical** to the committed receipt (including `rev=15dfacc…`), and c2-J2-selfhash / c2-J3-find-sniff / c2-J4-reject-all are identical except the volatile scratch-commit `rev` field — and even the control-commit **trees** reproduce byte-for-byte (e1c283fc…, 97fdee32…, 6592e943…). The do-nothing survivors list equals the claims.json before-value (M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19, killed 8); the self-hash control fails neutral, decoy and all 20 whitespace twins on CASE `selfhash-guard`; the find-sniff control passes neutral/decoy but fails all 20 twins on CASE `sniff-guard`; the reject-all control keeps the same 12 survivors and fails the battery leg (honest H0/H1/H2 all rejected, forgeriesAccepted 0). Every stated failure reason in claims.json is confirmed.

## Evidence

### 1. Frozen bytes verified before running (exit 0)

`for f in …; do git show 59f1b47…:$f | sha256sum; done` at the freeze commit, cross-checked against the baseline rev and the lane worktree:

| file | freeze = worktree | frozenDigests (claims.json) |
|---|---|---|
| .ufo/waves/round-34/baseline/controls.mjs | 18c95d673c55f3d3521dd08d418b8ef894dc5c8f89233e57417565576bcf035e | 18c95d67… ✓ |
| .ufo/waves/round-34/counters/c2-gate-mutants.mjs | 3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82 | 3cf5eb69… ✓ |
| .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs | 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e | 0dba816c… ✓ |
| scripts/check-bidi-runtime.mjs | eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1 | = baseline bytes (unchanged 15dfacc → 59f1b47) ✓ |

(The counters/controls.mjs do not exist at 15dfacc — they were added by the freeze commit; `git show 15dfacc:…` fails for them, expected. c2-mutant-finds.json worktree copy = freeze bytes, sha256 d8f1142a22f200939729ec84c3eac18a2eb8d30e3ba1b372fba8189ebcb2d539; 20 find-text strings, first = M01's find.)

### 2. Setup (exit 0)

- `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach 59f1b47…`; toplevel verified = `$S/clone` (`/fast/scratch/hyaku/tabi-r34/RevC2Controls-2/clone`); clone gate sha = eded1be0… ✓.
- `cp` of controls.mjs + both counters + c2-mutant-finds.json into the output dir; copied digests equal the freeze digests above.

### 3. Driver adaptation (only change: C2 scope + receipt location)

`node --check` OK. Full diff: `controls.adaptation.diff` in the output dir. Relative to the frozen driver (baseline/controls.mjs):
- counter consts point at the HERE-local frozen copies (digest-verified) instead of `../counters/…` (controls.mjs:18-19 of the copy);
- `LANE` overridable via `CONTROLS_LANE` (set to the lane checkout, as the committed run used) because the seat copy lives 5 levels deep (line 15);
- the C1 half (J1 score + candidate list + C1 J2–J5 blocks, frozen lines 58-113) removed — C2 reproduction scope only; the C2 J2/J3/J4 construction code is unchanged (frozen lines 114-137).

### 4. Run (driver exit 0, 1m47s)

```
TMPDIR=$S/ctl CONTROLS_LANE=$L node $OUT/controls.mjs   # exit 0
```
- Per-counter exits (recorded in each .provenance, matching committed): c2-J1 exit 1, c2-J2 exit 1, c2-J3 exit 1, c2-J4 exit 1 (predicate false in all four).
- stderr receipts: 0 bytes in both the committed and the re-run for all four controls.
- Lane worktree gate sha re-checked after the run: still eded1be0… (unchanged; the counter reads all blobs via `git show` from REV, so the run is read-only on the lane).

### 5. Receipt diff vs committed (baseline/ dir)

`jq -S 'del(.rev)' | cmp` on each pair:

| receipt | ignoring `.rev` | raw bytes | only-diff |
|---|---|---|---|
| c2-J1-do-nothing.json | IDENTICAL | IDENTICAL | — |
| c2-J2-selfhash.json | IDENTICAL | differ | rev: committed 199ecc96… vs rerun 8fe62782… (scratch commit hash, volatile) |
| c2-J3-find-sniff.json | IDENTICAL | differ | rev: e4348757… vs 85a5b3c8… (volatile) |
| c2-J4-reject-all.json | IDENTICAL | differ | rev: 04fadd14… vs a64b22b4… (volatile) |

Provenance diffs: only `counter=` path (rerun points at the OUT copies) and `rev=`; `counter_sha256=3cf5eb69…` identical; `tree=` identical for all four (J1 21383e57…, J2 e1c283fc…, J3 97fdee32…, J4 6592e943…); `repo=` strings identical; `exit=1` identical. Byte-identical trees prove the J2/J3/J4 gate transformations reproduced exactly from the baseline gate.

### 6. Claim-level checks (all confirmed)

- **do-nothing survivors = claims.json before-value**: J1 survivors `["M01","M03","M04","M05","M06","M07","M08","M09","M10","M16","M18","M19"]` — equality with the frozen before-list: true; killed 8; pristine/neutral/decoy exit 0; twinsFailing 0; unappliable 0; battery true; predicate false; exit 1 (claims.json C2.before; c2-gate-mutants.mjs:241 predicate). Cross-check: the independent measure-at-baseline run `measure-at-baseline/c2-at-15dfacc.json` carries the same values.
- **self-hash (J2) fails for the stated reason**: killed 20/20; neutral exit 3 and decoy exit 3, each with CASE FAIL `selfhash-guard`; all 20 twins fail (twinExit 3, failing case `selfhash-guard`); battery true; predicate false — matches claims C2.controls.selfHash ("killed 20, but neutral exit 3, decoy exit 3 and all 20 twins fail"). Mechanism confirmed: any byte change (neutral comment, decoy comment, whitespace twin) shifts the self-hash minus the SELFHASH line, so the guard case fails.
- **find-sniff (J3) fails for the stated reason**: killed 20/20; neutral exit 0, decoy exit 0; all 20 twins fail with CASE FAIL `sniff-guard`; predicate false — matches claims C2.controls.findSniff. Mechanism confirmed: the twin's doubled space removes the exact find text from the source, so the presence sniff fails, while neutral/decoy (which do not remove find texts) still pass.
- **reject-all (J4) fails on the battery leg**: killed 8, survivors the same 12, twins pass, pristine/neutral/decoy 0, and battery predicate **false** with honest H0/H1/H2 all false and forgeriesAccepted 0 — matches claims C2.controls.rejectAll ("survivors 12 and battery false, predicate false").

## Residual risk / scope notes

- This reproduction exercises the frozen counter and driver as-is; it does not re-judge the disclosed residual (a self-test that reads its own source and checks a whitespace-normalised find text passes all four probes — c2-gate-mutants.mjs:33-34 discloses this; the guard is the wave-2 code read, out of scope here).
- J1 ran against the lane checkout (`repo=lane`) exactly like the committed run; the counter resolves everything from git blobs at REV, so no lane state was written or relied upon beyond the digest-verified gate bytes.
- No network fetches, no tool installs/updates (operator tooling authorization: none used), no browsers launched, no subagent dispatch.

## Deliverables (output dir: .ufo/waves/round-34/w1/RevC2Controls/)

- `c2-J1-do-nothing.json` / `.provenance` / `.stderr`, `c2-J2-selfhash.json` / `.provenance` / `.stderr`, `c2-J3-find-sniff.json` / `.provenance` / `.stderr`, `c2-J4-reject-all.json` / `.provenance` / `.stderr` — re-run receipts
- `controls-summary.json`, `run-stdout.txt`, `run-stderr.txt` — driver summary and captured output
- `controls.mjs` (adapted seat copy), `controls.adaptation.diff` (diff vs frozen driver), `c1-adjacency-sweep-v2.mjs`, `c2-gate-mutants.mjs`, `c2-mutant-finds.json` (frozen-byte copies, digests verified)
- Scratch `/fast/scratch/hyaku/tabi-r34/RevC2Controls-2/` deleted before yield (receipts copied first).
