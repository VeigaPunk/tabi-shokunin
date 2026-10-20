VERDICT: PASS

# Round 18 W2 — C3 counter and committed-artifact check

## Result

Measured `B=2bff864fdfee684ddbcd066cc8e735adaba2735c` at `c3_routed_closed=0/5` and `REV=530f40a9bc3f10436161a2af1ca0fe9bffffc004` at `5/5`. All five expected B-side absences and all five REV-side reasons matched; the REV counter SHA-256 was `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`. The self-test passed all 26 cases (honest fixture plus 25 rejected forgeries). Independent SHA-256 calculations from committed blobs confirmed the six-entry historical gate producer map, the seven rerun artifact hashes, and the related D2/D3/D5 producer bindings.

## Commands, outputs, exits, determinism

Working directory for the commands was `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

Each of the following exact standalone argv was run twice in the first batch:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs --self-test
```

To capture explicit process exits, I then ran the following shell command; it repeats each revision twice and self-test once. Thus there were four observed invocations per revision and two self-test invocations total. The outputs were identical between invocations for each argument.

```sh
set +e; node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c; rc=$?; printf 'EXIT=%s\n' "$rc"; node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c; rc=$?; printf 'EXIT=%s\n' "$rc"; node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004; rc=$?; printf 'EXIT=%s\n' "$rc"; node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004; rc=$?; printf 'EXIT=%s\n' "$rc"; node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs --self-test; rc=$?; printf 'EXIT=%s\n' "$rc"
```

Observed stdout for every B invocation (exit 0 for both exit-captured repeats):

```json
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","c3_routed_closed":0,"defects":{"d1":{"pass":false,"why":"lesson_missing"},"d2":{"pass":false,"why":"harm_receipt_missing"},"d3":{"pass":false,"why":"adjacency_receipt_missing"},"d4":{"pass":false,"why":"S058_missing"},"d5":{"pass":false,"why":"rerun_index_missing"}},"counterSha256":null}
```

Observed stdout for every REV invocation (exit 0 for both exit-captured repeats):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c3_routed_closed":5,"defects":{"d1":{"pass":true,"why":"correction_line_verified"},"d2":{"pass":true,"why":"20_historical_gates_verified"},"d3":{"pass":true,"why":"adjacency_selftest_verified"},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{"pass":true,"why":"7_reruns_verified"}},"counterSha256":"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"}
```

Observed stdout for each `--self-test` invocation (exit 0):

```json
{"selfTest":"pass","cases":26,"honest":{"c3_routed_closed":5,"defects":{"d1":{"pass":true,"why":"correction_line_verified"},"d2":{"pass":true,"why":"20_historical_gates_verified"},"d3":{"pass":true,"why":"adjacency_selftest_verified"},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{"pass":true,"why":"7_reruns_verified"}},"pass":true},"forgeries":[{"name":"wrong revision","defect":"d2","expectedWhy":"wrong_revision","observedWhy":"wrong_revision","otherDefectsPass":true,"pass":true},{"name":"19 gates","defect":"d2","expectedWhy":"gate_count","observedWhy":"gate_count","otherDefectsPass":true,"pass":true},{"name":"short digest","defect":"d2","expectedWhy":"short_stdout_sha256","observedWhy":"short_stdout_sha256","otherDefectsPass":true,"pass":true},{"name":"wrong gate producer sha","defect":"d2","expectedWhy":"gate_producer_sha_mismatch","observedWhy":"gate_producer_sha_mismatch","otherDefectsPass":true,"pass":true},{"name":"wrong producer sha","defect":"d3","expectedWhy":"wrong_producer_sha256","observedWhy":"wrong_producer_sha256","otherDefectsPass":true,"pass":true},{"name":"cases!=57","defect":"d3","expectedWhy":"cases_not_57","observedWhy":"cases_not_57","otherDefectsPass":true,"pass":true},{"name":"S058 still saying individual publisher","defect":"d4","expectedWhy":"S058_individual_publisher","observedWhy":"S058_individual_publisher","otherDefectsPass":true,"pass":true},{"name":"S058 not superseding S057","defect":"d4","expectedWhy":"S058_not_superseding_S057","observedWhy":"S058_not_superseding_S057","otherDefectsPass":true,"pass":true},{"name":"S058 missing corrected publisher","defect":"d4","expectedWhy":"S058_corrected_publisher_missing","observedWhy":"S058_corrected_publisher_missing","otherDefectsPass":true,"pass":true},{"name":"S058 missing dossier pointer","defect":"d4","expectedWhy":"S058_dossier_pointer_missing","observedWhy":"S058_dossier_pointer_missing","otherDefectsPass":true,"pass":true},{"name":"S058 access date mismatch","defect":"d4","expectedWhy":"S058_access_date_mismatch","observedWhy":"S058_access_date_mismatch","otherDefectsPass":true,"pass":true},{"name":"S058 dossier not committed","defect":"d4","expectedWhy":"S058_dossier_blob_missing","observedWhy":"S058_dossier_blob_missing","otherDefectsPass":true,"pass":true},{"name":"correction claiming 7","defect":"d1","expectedWhy":"correction_claims_7","observedWhy":"correction_claims_7","otherDefectsPass":true,"pass":true},{"name":"correction omits fleet report pointer","defect":"d1","expectedWhy":"correction_report_citation_missing","observedWhy":"correction_report_citation_missing","otherDefectsPass":true,"pass":true},{"name":"rerun sha mismatch","defect":"d5","expectedWhy":"rerun_sha_mismatch","observedWhy":"rerun_sha_mismatch","otherDefectsPass":true,"pass":true},{"name":"rerun exit nonzero","defect":"d5","expectedWhy":"rerun_exit_not_zero","observedWhy":"rerun_exit_not_zero","otherDefectsPass":true,"pass":true},{"name":"rerun verdict not pass","defect":"d5","expectedWhy":"rerun_verdict_not_pass","observedWhy":"rerun_verdict_not_pass","otherDefectsPass":true,"pass":true},{"name":"index cases not all pass","defect":"d5","expectedWhy":"rerun_cases_not_all_pass","observedWhy":"rerun_cases_not_all_pass","otherDefectsPass":true,"pass":true},{"name":"missing original scenario","defect":"d5","expectedWhy":"rerun_case_set_mismatch","observedWhy":"rerun_case_set_mismatch","otherDefectsPass":true,"pass":true},{"name":"original scenario failed","defect":"d5","expectedWhy":"rerun_cases_not_all_pass","observedWhy":"rerun_cases_not_all_pass","otherDefectsPass":true,"pass":true},{"name":"index controls not all pass","defect":"d5","expectedWhy":"rerun_controls_not_all_pass","observedWhy":"rerun_controls_not_all_pass","otherDefectsPass":true,"pass":true},{"name":"original control failed","defect":"d5","expectedWhy":"rerun_controls_not_all_pass","observedWhy":"rerun_controls_not_all_pass","otherDefectsPass":true,"pass":true},{"name":"only 6 reruns","defect":"d5","expectedWhy":"fewer_than_seven_reruns","observedWhy":"fewer_than_seven_reruns","otherDefectsPass":true,"pass":true},{"name":"same rerun file indexed seven times","defect":"d5","expectedWhy":"fewer_than_seven_reruns","observedWhy":"fewer_than_seven_reruns","otherDefectsPass":true,"pass":true},{"name":"same receipt bytes indexed seven times","defect":"d5","expectedWhy":"duplicate_rerun_artifact","observedWhy":"duplicate_rerun_artifact","otherDefectsPass":true,"pass":true}]}
```

Observed runs therefore had bounded repeated-output determinism: the B outputs were identical across four invocations, REV outputs identical across four, and self-test output identical across two. This is only determinism of these observed invocations, not a claim about other hosts/environments.

## Independent committed-blob verification

Historical producer-path inventory command (exit 0):

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 93bfead1f5f25f584353df3152a60209bbd89a2e:.ufo/waves/round-17/harm-baseline.json | jq -r '.gates[].argv[] | select(test("^scripts/.+\\.mjs$"))' | sort -u
```

Exact stdout:

```text
scripts/check-aria-metadata.mjs
scripts/check-freshness.mjs
scripts/check-measurement-binding.mjs
scripts/check-round-contract.mjs
scripts/check-sources.mjs
scripts/check-user-round-contract.mjs
```

I independently hashed the six blobs at `93bfead1f5f25f584353df3152a60209bbd89a2e` with this command (exit 0):

```sh
set -euo pipefail; for p in scripts/check-aria-metadata.mjs scripts/check-freshness.mjs scripts/check-measurement-binding.mjs scripts/check-round-contract.mjs scripts/check-sources.mjs scripts/check-user-round-contract.mjs; do printf '%s ' "$p"; git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show "93bfead1f5f25f584353df3152a60209bbd89a2e:$p" | sha256sum; done; printf 'EXIT=0\n'
```

Observed stdout (all six match `harm-at-93bfead.json:28-35`):

```text
scripts/check-aria-metadata.mjs d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b  -
scripts/check-freshness.mjs 93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b  -
scripts/check-measurement-binding.mjs 388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74  -
scripts/check-round-contract.mjs 1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828  -
scripts/check-sources.mjs afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77  -
scripts/check-user-round-contract.mjs 568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273  -
EXIT=0
```

The `harm-at-93bfead.json` receipt binds revision `93bfead...`, lists the 20 gates, and records the same six-path producer map (`corpus/evidence/round-18/routed/harm-at-93bfead.json:2-13,28-36,37-885`). The C3 counter's verification result for D2 was `20_historical_gates_verified`; this check did not freshly replay those 20 historical commands.

Committed rerun receipt hash command (exit 0):

```sh
set -euo pipefail; for n in 1 2 3 4 5 6 7; do p="corpus/evidence/round-18/routed/harness-reruns/run-${n}.json"; printf '%s ' "$p"; git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show "530f40a9bc3f10436161a2af1ca0fe9bffffc004:$p" | sha256sum; done; printf 'EXIT=0\n'
```

The computed SHA-256 values match each indexed value in `corpus/evidence/round-18/routed/harness-reruns/index.json:9-93`:

| Committed path at REV | SHA-256 of committed bytes |
|---|---|
| `corpus/evidence/round-18/routed/harness-reruns/run-1.json` | `5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6` |
| `corpus/evidence/round-18/routed/harness-reruns/run-2.json` | `eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b` |
| `corpus/evidence/round-18/routed/harness-reruns/run-3.json` | `0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f` |
| `corpus/evidence/round-18/routed/harness-reruns/run-4.json` | `cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b` |
| `corpus/evidence/round-18/routed/harness-reruns/run-5.json` | `cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb` |
| `corpus/evidence/round-18/routed/harness-reruns/run-6.json` | `f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905` |
| `corpus/evidence/round-18/routed/harness-reruns/run-7.json` | `8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902` |

Additional committed producer hashes (the command exited 0):

```sh
set -euo pipefail; for spec in '530f40a9bc3f10436161a2af1ca0fe9bffffc004 corpus/evidence/round-18/routed/harm-runner.mjs' '93bfead1f5f25f584353df3152a60209bbd89a2e scripts/check-adjacency.mjs' '530f40a9bc3f10436161a2af1ca0fe9bffffc004 scripts/webmcp-invoke-round17.mjs' '530f40a9bc3f10436161a2af1ca0fe9bffffc004 .ufo/waves/round-18/measure-c3.mjs'; do set -- $spec; printf '%s:%s ' "$1" "$2"; git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show "$1:$2" | sha256sum; done; printf 'EXIT=0\n'
```

| Committed blob | SHA-256 | Binding checked against |
|---|---|---|
| REV `corpus/evidence/round-18/routed/harm-runner.mjs` | `892466566850fd5edce2e901e20ca81dc79fa7a9957fa45380e12dfa6f03b98f` | D2 receipt producer, `harm-at-93bfead.json:5-8` |
| `93bfead` `scripts/check-adjacency.mjs` | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` | D3 receipt producer, `adjacency-selftest.json:12-15` |
| REV `scripts/webmcp-invoke-round17.mjs` | `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` | D5 index producer, `harness-reruns/index.json:2-7` |
| REV `.ufo/waves/round-18/measure-c3.mjs` | `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a` | Exact match to the full counter hash printed for REV |

## D1–D5 findings and evidence

- **D1 — `correction_line_verified` at REV; `lesson_missing` at B.** The correction states six siblings, cites both protected references, and records the count command (`corpus/lessons/round-18.md:53-60`). The counter independently derives sibling cardinality from the reference commit's `corpus/adjacency.tsv`; its D1 citation/count and wrong-seven checks are in `measure-c3.mjs:267-295,950-967`.
- **D2 — `20_historical_gates_verified` at REV; `harm_receipt_missing` at B.** The committed receipt is revision-bound to `93bfead...`, lists the 20 historical gates, and carries the runner plus six gate-script hashes (`corpus/evidence/round-18/routed/harm-at-93bfead.json:2-13,28-37,885`). Independent `git show` hashing confirmed each gate producer in the table above against its committed blob at `93bfead`.
- **D3 — `adjacency_selftest_verified` at REV; `adjacency_receipt_missing` at B.** The receipt binds `scripts/check-adjacency.mjs` at `93bfead`, exit 0, and parsed `cases=57`, `verdict=clean` (`corpus/evidence/round-18/routed/adjacency-selftest.json:2-15`). Independently hashed historical checker bytes matched its full producer SHA.
- **D4 — `S058_supersession_verified` at REV; `S058_missing` at B.** The single S058 row says `supersedes S057 —`, records developer Google Ireland, Ltd. and points at the dossier, with no “individual publisher” claim (`corpus/SOURCES.md:72`; validator path `measure-c3.mjs:427-471`).
- **D5 — `7_reruns_verified` at REV; `rerun_index_missing` at B.** The index binds the unchanged round-17 harness digest and enumerates seven run receipt hashes (`corpus/evidence/round-18/routed/harness-reruns/index.json:2-20,82-93`). Every indexed digest independently matched the committed JSON blob; each run is recorded as exit 0, pass, 11/11 cases and 4/4 controls in the index (`:9-93`).

## Scope and limits

The counter reads commit blobs for the measured revisions (`.ufo/waves/round-18/measure-c3.mjs:120-135,583-601`); the self-test fixture is placed in a unique temporary directory and removed in `finally` (`:614-624,857-863,1041-1043`). No production, fleet, sibling, Git index, or jj files were edited; no tools were installed. This result verifies the requested counter outcomes and committed-byte producer/artifact digests. It does not claim a fresh execution of the 20 historical gates or the seven recorded harness runs; those are retained, revision-bound evidence. The finite C3 acceptance requirements and expected defect set are stated in `.ufo/waves/round-18/PLAN.md:91-103` and `corpus/lessons/round-18.md:24-33,67-75`.

No blockers.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReRunC3.md
