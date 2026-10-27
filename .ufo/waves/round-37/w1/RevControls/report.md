# Round 37 w1 — control-construction review

## Findings

### Low — fixture toplevel is not verified before commits for B/C/D

`baseline/run-controls.sh:4-5` says the fixture rule verifies the clone toplevel before the first commit, but only fixture A does so (`:40-41`). Fixture B is cloned at `:52` and committed at `:62`; C is cloned at `:66` and committed at `:77`; D is cloned at `:84` and creates a replace ref at `:98` without a toplevel assertion. Thus the rule is implemented for A, not every fixture that is mutated. This is a guard/documentation discrepancy; the committed receipts do not demonstrate that B/C/D passed the intended assertion. No live-lane mutation was observed in the script: all fixture mutations target `$S` clone paths; `TIP=$(git -C "$LANE" rev-parse master)` only reads the lane.

### Low — C2 honest receipt summary and structured predicate disagree

At `baseline/run-controls.sh:164-169`, the J3 honest-v3 branch passes literal `null` as the receipt predicate field, while the summary captures the JSON predicate and reports `true`. The committed `c2r37-J3-honest-v3.json` therefore has `"predicate":null` alongside a summary stating `"predicate": true`. This is a receipt-construction inconsistency; the summary and raw run agree on honest predicate true, but consumers of the structured predicate field cannot rely on it.

## Receipt semantics cross-check

The ten committed receipts match the expected behaviors:

- C1 J1 reordered pins: v4 `exit:0,predicate:true`; v5 `exit:2,predicate:null`, digest refusal. C1 J2 decoy note: v4 `exit:1,predicate:false`; v5 `exit:0,predicate:true`. C1 J3 honest v5: `exit:0,predicate:true`.
- C2 J1 replace graft: v2 `exit:0,predicate:true`; v3 `exit:2,predicate:null`, refusal because `refs/replace` is present. J2 observed tamper: v2 `exit:0,predicate:true`; v3 `exit:1,predicate:false` with receipt finding for screenshot SHA mismatch. J3 honest v3 raw summary reports predicate true, admitted 16, survivors 0, egress 0; structured predicate field is null as noted above.

Source-level checks corroborate the claimed mechanisms: v4 parses moved-note relocation from the first numeric token (`round-36/counters/c1-adjacency-sweep-v4.mjs:437-443`); v5 binds the pins file digest (`round-37/counters/c1-adjacency-sweep-v5.mjs:96,388-389`) and parses the canonical `verbatim at :N` clause (`:456-458`). v2 has no replace-ref enumeration/no-replace environment path; v3 sets `GIT_NO_REPLACE_OBJECTS=1`, enumerates refs/replace, refuses a clone carrying one, and checks observed screenshot decoration against transcript (`round-37/counters/c2-firefox-bidi-v3.mjs:121-125,401-428,526-528`).

## Independent control run

Rebuilt c1r37-J1 in `/fast/scratch/hyaku/tabi-r37/w1/RevControls/clone` as a `git clone --shared` of the lane, reordered the JSON keys in `c1-delta-pins.json`, verified `git -C "$D" rev-parse --show-toplevel` equaled `$D` before the fixture commit, and committed only in that clone. Ran the v4 and v5 scripts from freeze commit `99437d29de036415a9f2d0524343617a3b19988a` against the fixture revision. Observed v4 exit 0 and v5 exit 2 with the expected frozen-digest mismatch. Scratch was removed on shell exit.

Frozen counter/build/harness/control digests from `claims.json` all match the bytes at freeze commit `99437d29de036415a9f2d0524343617a3b19988a` and the current corresponding files. I did not find an LSP device in the available tool inventory; semantic checks above are direct source/receipt inspection. No tools installed.

VERDICT finding — control expectations and independent C1 J1 reproduction agree; report the missing B/C/D clone-toplevel assertions and C2 J3 structured-predicate null inconsistency.
