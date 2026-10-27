# RevControls — Round 37 w1 control review

Findings:

- **Low, `baseline/run-controls.sh:52,62,66,77,84,98`:** B/C/D fixture mutations lack the `rev-parse --show-toplevel` assertion that A has at `:40-41` and the script header promises at `:4-5`. All mutations are directed to clone paths; no live-lane mutation was observed.
- **Low, `baseline/run-controls.sh:164-169`:** C2 J3 passes literal `null` as the structured predicate while the summary embeds the actual JSON result. `c2r37-J3-honest-v3.json` consequently has `predicate:null` but summary predicate true (admitted 16, survivors 0, egress 0).

All ten receipts match expected v4/v5 and v2/v3 behaviors except that structured-field inconsistency. Source inspection confirms v4's first-numeric-token moved-note parser, v5's pins digest binding and canonical `verbatim at :N` parser, v2's missing replace protection, and v3's replace enumeration/refusal, no-replace git environment, and observed-decoration binding.

Independently rebuilt c1r37-J1 in scratch as a shared clone, asserted clone toplevel before committing the reordered pins, and ran v4/v5 bytes from freeze commit `99437d29de036415a9f2d0524343617a3b19988a`: observed exit 0 vs exit 2 as expected. Scratch removed on exit. Frozen hashes match claims. No LSP device available in tool inventory; no tools installed.

VERDICT finding — control expectations and independent J1 reproduction agree; the two low-severity construction/receipt issues above remain.
