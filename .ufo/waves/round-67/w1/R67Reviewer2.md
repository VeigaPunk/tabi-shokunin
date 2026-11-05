# R67Reviewer2 — C2 repo-escape vector enumeration (v3 → v4)

Lane: tabi round 67, wave w1, seat R67Reviewer2. Lane base rev `5400136b233579f7b716ab83a70b8be24ed88b26` (read-only; no git/jj mutations performed).
Target gate: `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` (read-only). Defect under review: critic F7 — a matrix input path that normalizes outside `--repo` binds the gate to a file outside the repo.

## Method

Plain-directory fixture built under `$HYAKU_SCRATCH/tabi-r67/R67Reviewer2/`:

```
X/
  outside.mjs                    (sha256 9e6ab3efa43e6dd6c15b8e684ca7e91b0a7b2cc0f172fda9fa5c67361fb80a54)
  repo/
    instruments/a.mjs            (sha256 037ecd1db38c230c248787e60fd7bfc0cb0101b187b59535b6e7483be762d350)
    link.mjs -> ../outside.mjs   (symlink)
    controls/
      good.stdout
      plus 7 fixture pairs (matrix-<letter>.json / matrix-<letter>.command.json)
```

`matrix-<letter>.command.json` receipt contents replicate the v3 selftest's clean receipt shape (schema `tabi-command-receipt-v1`, argv0 `node`, exit 0, `stdoutFile: good.stdout` pinned to its actual sha, single input `instruments/a.mjs` pinned to a.mjs's actual sha, `rev: 'worktree'`); each matrix pins the sha256 of the file its `input.path` really names. All other receipt checks therefore pass, isolating the `matrix-input` conjunct.

Per-vector run (isolated: one matrix file per controls dir per invocation, others removed) — commands, from cwd `$S=$HYAKU_SCRATCH/tabi-r67/R67Reviewer2`:

```
node $V3 --dir X/repo/controls --repo X/repo --json > full.json   # batch, all 7 at once
node $V3 --selftest --scratch $S/self --json                      # baseline
node $V3 --dir <iso-dir-only-control-pair> --repo X/repo --json    # per-vector isolation
node $V3 --dir X/repo/controls --repo X/repo --json > out-h.json   # control: wrong-pinned digest red case
```

## Results

Baseline: `node $V3 --selftest --scratch $S/self --json` → verdict `clean`, cases `14`, passed `14`, exit `0`.

Observed (batch run): with correctly-named matrix files (`matrix-<letter>.json` pairs), `checked=7 matrices=7 failures=0 byCheck={} ok=true`, exit `0`. I.e. **v3 accepts every one of vectors (a)–(e): matrix rows remain green while naming files outside the repo.**

Harness sanity control: one pair with `input.path` = `../outside.mjs` but a **wrong** (all-`6`) pinned digest — run `node $V3 --dir X/repo/controls --repo X/repo --json > out-h.json` plus a plain non-json rerun — both yielded `failures=1`, `byCheck={"matrix-input":1}`, findings `["input digest mismatch"]`, and **exit 1** (plain mode printed `TABI_R64_PROVENANCE checked=1 matrices=1 failures=1 byCheck={"matrix-input":1}` with exit 1). This proves the per-vector greens below are genuine containment-laxity, not a broken harness.

Per-vector runs (each vector the only pair present in its isolated controls dir; exit codes and findings below are from actually-run commands):

| vector | input.path | exit | matrix-input findings |
|---|---|---|---|
| a | `../outside.mjs` | 0 | failures=0, findings=[] |
| b | `./../outside.mjs` | 0 | failures=0, findings=[] |
| c | `instruments/../../outside.mjs` | 0 | failures=0, findings=[] |
| d | `link.mjs` (symlink → outside) | 0 | failures=0, findings=[] |
| e | absolute path to X/outside.mjs | 0 | failures=0, findings=[] |
| f | `instruments/a.mjs` (legit) | 0 | failures=0, findings=[] |
| g | `controls/../instruments/a.mjs` (legit) | 0 | failures=0, findings=[] |

Full vectors table with per-row refusal/pass expectations and rationale: `vectors.tsv` (same directory).

## Findings

F1 (the defect, confirmed): v3's `checkMatrix` resolves a relative input against **repo first, then the matrix directory**, taking whichever candidate `statSync` shows to be a file, with no containment check of the resolved path against `--repo` (see the gate's v2 binding block: `candidates = ... [path.join(repo, rel), path.join(path.dirname(file), rel)]... hit = candidates.find(...isFile())`). Any relative escape (`../`, `./../`, `instruments/../../`) hits outside the repo through the second candidate and stays green: all of (a)(b)(c) observed green, exit 0, zero matrix-input findings.

F2: symlink escape — `statSync` follows symlinks, so candidate `repo/link.mjs` resolves to an external file and, with the pinned digest matching the *target's* sha, (d) is accepted. v4 must `realpath` and require containment.

F3 (ancillary 1): an absolute escape path (e) is also accepted; the gate has no absolute-path rule at all. v3 takes absolute paths as-is (`candidates=[rel]` when `path.isAbsolute(rel)`) — containment never applies.

F3b (ancillary 2, observed): matrix-file *discovery* is name-gated — files not matching `matrix*.json` / `*-matrix.json` (non-`.command.json`) are skipped entirely. In an intermediate run the fixture pairs were named `v-<letter>.json` and the gate reported `matrices=0` while exit stayed 0 (observed `TABI_R64_PROVENANCE checked=1 matrices=0 failures=0`, exit 0). An escape matrix can therefore hide behind any non-`matrix` filename; v4 hardening should note that discovery-name gating exists but is out of scope for the F7 fix.

F4: v3's selftest never exercises an out-of-repo input — no red case for escape, so the defect persists across rounds. v4's selftest should add (a)-(d) as red and (f)(g) as green.

## v4 expectation summary (what must change)

- Refuse any input whose **realpath-resolved canonical location is outside `--repo`** (covers (a)(b)(c)(d), and (e) explicitly).
- Keep passing (f)(g): relative resolution against repo-then-matrix-dir is fine *after* normalization+containment — matrix-dir resolution remains needed for the receipt-file self-bound case (selftest `matrix-good.json`, which pins its own command.json).
- Absolute paths: refuse outright (stronger) or require containment after realpath — same effect for (e); prefer refusing all absolute paths for simplicity since every currently-vetted absolute case (selftest's `matrix-good.json`) can be expressed repo-relatively.

## Ancillary observations

- v3 CLI emits only one exit code family on green regardless of vector — red-state refusal semantics must be confirmed by the C2 implementer on their v4 fixture (not in this seat's scope).
- Scratch root `$HYAKU_SCRATCH/tabi-r67/R67Reviewer2/` was deleted before yield per lane discipline (fixture X tree no longer on disk; every observed value above was captured verbatim from live output before deletion).
- No repo files modified; no git/jj operations performed anywhere (lane forbade it; all work was in `$HYAKU_SCRATCH/tabi-r67/R67Reviewer2/`).
- Tooling authorization: no tools installed or upgraded this seat; pacman never invoked.
