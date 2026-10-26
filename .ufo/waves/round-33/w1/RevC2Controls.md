# RevC2Controls — C2 controls and claim review, tabi round 33 w1 (2026-10-26)

## Verdict

All five assigned items **hold**; no defect found in scope. The three C2 controls of the frozen `.ufo/waves/round-33/baseline/controls.mjs` (sha256 `2d0cf841…f5a451e`, = frozenDigests) reproduce **byte-identically** from a seat clone at the freeze commit `e6b0a9074d434ccc307badd312ae7379d1193fea` with seat TMPDIR: every counted field of my re-run receipts equals `.ufo/waves/round-33/baseline/c2-J{1,2,3}-*.json` (diff clean after excluding only the `rev`/`results.*.commit` fields, which must differ because the baseline control commits lived in a since-deleted scratch clone), and my control commits' **trees are identical** to the baseline ones (`c7999ee7`, `b7566d9f`, `9811384d`), so even the patched gate bytes are the same. The claims.json C2 predicate sentence matches the counter's `out.predicate` computation clause for clause; the `before` value matches the do-nothing receipt; the battery demonstrably executes REV's gate blob (not the worktree's) and generates golden transcripts from the frozen v1 gate blob at `GOLDEN_REV`.

## Evidence

### 0. Frozen bytes verified

```
sha256sum .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs   -> 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b  (= frozenDigests)
sha256sum .ufo/waves/round-33/baseline/controls.mjs                  -> 2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e  (= frozenDigests)
git show e6b0a907:...c2-bidi-forgery-battery.mjs | sha256sum         -> 51ace65f…  (worktree copy == freeze-commit copy)
```

### 1. Controls re-run — exit codes and reproduction

Setup: `git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach e6b0a907…` (toplevel verified). The frozen counter bytes were copied out of the clone at e6b0a907 to `$S/c2-battery.frozen.mjs` (sha re-verified `51ace65f…`) and run from scratch — never from the lane checkout; the counter reads everything through git blobs of `--repo`, so the copy's location cannot change results. I replicated controls.mjs's C2 section line-for-line (same patch texts; J2 reads v1 from the BASE blob, sha `2f25af5a…` verified before patching):

`TMPDIR=$S/tmp node run-c2-controls.mjs` → **exit 0**; per-control counter exits (recorded in `*.provenance`):

| control | rev | tree | counter exit | predicate | gateSha256 |
|---|---|---|---|---|---|
| c2-J1-do-nothing | b7d16fb8 (BASE) | c7999ee7 | 1 | false | `2f25af5a…` (= baseline) |
| c2-J2-reject-all | 2ad70625 (my commit) | b7566d9f | 1 | false | `d327300f…` (= baseline) |
| c2-J3-whitelist | c92232fb (my commit) | 9811384d | 1 | false | `7cc8f233…` (= baseline) |

Baseline provenance (`.ufo/waves/round-33/baseline/c2-J*.provenance`) shows the same trees (`c7999ee7` / `b7566d9f` / `9811384d`) and the same counter sha; only commit ids differ (`285fac1b`, `3f77d79b` were made in the deleted controls clone). Tree equality means the patched gate + receipt/entry/registry bytes of my J2/J3 commits are byte-identical to the baseline controls'.

Field-by-field comparison (jq `delpaths([["rev"]]) | .results |= with_entries(.value |= del(.commit))`, then `diff`): **IDENTICAL** for all three controls. Counted fields, rerun == baseline:

- **J1 (do nothing):** honest H0/H1/H2 = true/true/true, forgeriesAccepted **8 of 8** (F1–F8), acceptedForgeries ["F1".."F8"], digestLiterals [], selftest exit 0, all 9 run fields (exit/accepted/population/admitted/failing/entryFinding/binding/reasons/stderr) identical.
- **J2 (reject-all):** honest false×3, forgeriesAccepted **0**, digestLiterals [], selftest exit 0 — identical.
- **J3 (whitelist):** honest true×3, forgeriesAccepted **0**, digestLiterals exactly the 5 prefixes `8aa97463c238, 9918a716da71, 92bd413caab0, b9dab912f0af, 55dbef88ed4b`, selftest exit 3 (25/27) — identical.

All six stderr files (baseline + rerun) are 0 bytes. `controls-summary.json` c2 entries agree with the individual receipts.

### 2. Predicate sentence == counter's `out.predicate`

claims.json:45 vs counter code — clause by clause:

| claims.json C2 predicate (line 45) | counter code | match |
|---|---|---|
| "honest H0, H1, H2 accepted with admitted 16 and failing 0" | `honestOk(x) = x.accepted && x.admitted === HONEST_ADMITTED && x.failing === 0` (c2-bidi-forgery-battery.mjs:217, HONEST_ADMITTED=16 at :63); all three required at :229 | yes |
| "forgeriesAccepted 0 of 8 (F1…F8)" | `forgeriesAccepted === 0` (:229); forgeries = `VARIANTS.filter(startsWith('F'))` (:218), VARIANTS lists F1–F8 (:72) | yes |
| "REV's gate --selftest exit 0" | `st = run(gate, '--selftest', cwd=clone)` (:215), `st.status === 0` (:229) | yes |
| "source carries none of the five honest digests nor a 12-hex prefix of one" | `digestLiterals = HONEST_DIGESTS.filter(d => gateAtRev.includes(d.slice(0,12)))` (:222, HONEST_DIGESTS 5 entries at :65), `length === 0` required (:229). The 12-hex-prefix test subsumes the full-digest test | yes (equivalent) |

Kill rule alignment: counter exit 0/1/2 per header (:12-13), Refusal → exit 2 in `main()`; `--rev` must resolve to a 40-hex commit (`:131-134`), as the wave contract requires.

### 3. `before` value

claims.json:47 "honest H0/H1/H2 true, forgeriesAccepted 8 of 8, selftest exit 0, digestLiterals [] — baseline/c2-J1-do-nothing.json" — exactly the baseline J1 receipt **and** my re-run J1. claims.json:44 surface "v1 (sha256 2f25af5a...c393)" matches J1's `gateSha256` (both runs) and the measured blob digest of `git show b7d16fb8:scripts/check-bidi-runtime.mjs`. `commandShowingSurfaceUnmoved` ("same counter at the baseline: forgeriesAccepted 8") confirmed.

### 4. Battery runs REV's gate, not the worktree's

Code: `gateAtRev = blob(lane, REV, GATE)` (:146, a `git show <rev>:<path>` from `--repo`); before every variant run the counter asserts the on-disk gate in its inner clone is byte-identical to REV's blob, else Refusal (:202); it then executes `node <clone>/scripts/check-bidi-runtime.mjs --repo <clone> --rev <target> …` with cwd=clone (:203). No reference to the lane worktree's gate path anywhere. Behavioral proof from my J2/J3 runs: the executed gate rejected all 8 forgeries (J2, honest false×3) and tripped digestLiterals+selftest-3 (J3) while the lane worktree gate — never touched by any run, still `2f25af5a…` (`sha256sum` after) — accepts all 8 (J1). Had the battery run the worktree gate, J2 would read forgeriesAccepted 8.

### 5. Golden generator from the frozen v1 blob

Code: `goldenSrc = blob(lane, GOLDEN_REV, GATE)` with `GOLDEN_REV = b7d16fb8…` (:57), Refusal unless `sha256(goldenSrc) === GOLDEN_GATE_SHA256 = 2f25af5a…` (:58, check at :142); the blob is written to the scratch dir and `goldenLines` is imported from that file (:143-145) — never from REV's gate or the worktree. In my runs the assertion passed (no Refusal; J1 produced F1–F8 from it), and I independently measured the clone's `b7d16fb8` gate blob at exactly `2f25af5a…`. Golden source is pinned by content, not location.

## Residual risk / verification gaps

- J1 provenance difference: baseline scored do-nothing with `--repo lane`, mine with `--repo <seat clone>`. Byte-sourcing is via git objects; identical tree (`c7999ee7`) and identical receipt. No effect on any counted field.
- controls.mjs computed J3's entrySha/regSha from lane worktree files at controls time; my re-run computed them from BASE blobs and reached the identical gate sha `7cc8f233…`, which incidentally proves those worktree files matched BASE when controls ran.
- Not re-executed here (out of my item scope): the C1 controls, the `--live` leg (battery is offline by construction; claims.json killRule excludes it), and any v2 gate (does not exist yet at the baseline — J1's forgeriesAccepted 8 is the unmoved-surface evidence the claim cites).
- Known, already-disclosed limits (claims.json C2 feasibilityDisclosed): the battery cannot catch a smarter forgery or a non-hex whitelist encoding (e.g. sizes); J3 was caught only because it embedded hex literals. Wave 2 and the reviewer read of v2's code are the guards — consistent with the frozen predicate, not a defect in it.

## Process notes

- No browser, chromedriver, or chromium was started (battery is offline); `pgrep -fa 'chromedriver|chromium'` matches only the host's earlyoom `--prefer` regex text — zero processes owned by me.
- No lane tracked file, lane index, or fleet repo written; read-only git in the lane. Commits only inside `$S/clone` (toplevel verified per run). No tools installed (none needed).
- Scratch `/fast/scratch/hyaku/tabi-r33/RevC2Controls` (clone, tmp, v1-gate.mjs, counter copy) deleted after copying receipts to the output dir.

## Deliverable paths

- Report: `.ufo/waves/round-33/w1/RevC2Controls.md` (this file)
- Receipts: `.ufo/waves/round-33/w1/RevC2Controls/`
  - `c2-J1-do-nothing.{json,stderr,provenance}`, `c2-J2-reject-all.{json,stderr,provenance}`, `c2-J3-whitelist.{json,stderr,provenance}`
  - `rerun-summary.json`, `rerun-summary.log`, `run-c2-controls.mjs` (the exact re-run script)
