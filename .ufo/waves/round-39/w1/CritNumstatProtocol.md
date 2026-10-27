# C2 numstat protocol falsification

Axes: calibration (primary); coverage (secondary).

Counterexample / result: the candidate moving-tree attack does **not** falsify D6 as implemented. The receipt is fetched from the immutable `REV` tree via `git show REV:path`; its non-comment data is compared against the counter's fresh `git diff --numstat BASELINE..REV -- . :(exclude)receipt-path`. Those explicit commit endpoints are unaffected by concurrent worktree edits. If the body came from different endpoints and differs, `bodyMatches` is false. Revision input is resolved to a commit at lines 58-61 before use.

Evidence: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` lines 54-61 and 211-229. Exact observed commands:

```sh
cat /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/claims.json
cat /home/vgpnk/.omp/agent/RULES.md
```

Observed frozen claims identify C2's requirement as body equality with `git diff --numstat baseline..REV` excluding the receipt. Read the counter source at the cited ranges; no fixture mutation or counter execution was performed. No output artifact beyond this report was produced.

Potential hardening, not a demonstrated defect: `namesBaseline` and `namesRev` use substring inclusion, so endpoint labels themselves are not parsed/validated as exact header fields; the actual command's comparison still binds the body to fixed `BASELINE` and resolved `REV`, meaning forged labels cannot substitute another body without a mismatch. The smallest safe correction, if stronger receipt provenance is desired, is define an exact versioned header with parsed full baseline and resolved full REV (and optionally command identity), then verify exact equality; retain the current independent body recomputation. Do not rely on receipt-declared endpoints as command arguments.

VERDICT ok — no moving-worktree counterexample observed; D6 derives expected numstat from explicit immutable BASELINE and resolved REV, not mutable tree state.
