# CritFreezeAudit evidence — round 43

## Frozen-revision identity and control crosswalk

Frozen revision: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`.

Read-only command/output:

```text
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --show-toplevel
/home/vgpnk/Projects/shokunin/tabi-shokunin

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc^{commit}
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/claims.json | sha256sum
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  -
sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json
```

The frozen `claims.json` beforeState controls, read with:

```text
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/claims.json | jq -r '.claims[] | "\(.id): \(.beforeState)"'
```

Output (controls named):

- C1: `c1-baseline-tree-count.txt`, `c1-replay-r42-refused.json`, `c1-synthetic-refused.json`, `c1-relabel-refused.json`.
- C2: `c2-baseline-red-r43.json`, `c2-v0-probe.json`, `c2-tree-fixture.json`.

The frozen `controlBindings` list has eight entries: those seven controls plus `c1-battery-r43.json`. Each named control has a matching full path in the list. The exact frozen path/hash listing and the `git show <REV>:<path> | sha256sum` outputs were:

```text
.ufo/waves/round-43/controls/c1-baseline-tree-count.txt 23983f216328d232ecfe988cfc0718698a8a2aede3cdad740176420d436211e3
.ufo/waves/round-43/controls/c1-battery-r43.json 6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed
.ufo/waves/round-43/controls/c1-replay-r42-refused.json 6640e2087bef2cdf8d7b3b7e2473e760d90169126bfb82e976f68db30dac0a4c
.ufo/waves/round-43/controls/c1-synthetic-refused.json 6b1052ad2023d346195531af122f35961388ab6c9c0475cbbcce23923708d5c3
.ufo/waves/round-43/controls/c1-relabel-refused.json eeec71d70f8799081bab464a941afb77b9c2c0b1482baecc6e3e0100b0e5f0ef
.ufo/waves/round-43/controls/c2-baseline-red-r43.json eecba100c680be5a74821ffbdbdc2399c89a99f654e0b754fcbd566f415a40a5
.ufo/waves/round-43/controls/c2-v0-probe.json c24d24f8e39a61c2bdb072ff9d1006296a236d6551b0a6fd572d3cb9772e9a6c
.ufo/waves/round-43/controls/c2-tree-fixture.json 3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf
```

Each frozen hash equals its `controlBindings[].sha256`. Re-running `sha256sum` on all eight working-tree controls produced the same eight values above. Thus the content read from the control files corresponds to the frozen bytes.

## Quote and checker evidence

At commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`, I copied the frozen checker to scratch and ran:

```text
node /fast/scratch/hyaku/tabi-r43/CritFreezeAudit/check-routed-defects-round43.mjs --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

The copied checker SHA-256 was `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`, matching the frozen digest. Output fields:

```json
{
  "schema": "tabi-r43-routed-defects",
  "rev": "7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc",
  "predicate": true,
  "findingCount": 0,
  "findings": []
}
```

The frozen checker R5 code at `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs:192-201` iterates the supplied bindings, requiring each path to be a blob, its SHA-256 to equal the listed digest, and its quote string to occur in the bytes. For the eight existing entries, those checks passed. All quote strings were present in their respective frozen controls; quotes correspond to `git ls-tree ... | wc -l`, the battery's complete JSON line, `refusalLayers`, `measure-signature-invalid`, `findingIds`, `refused`, and `typeViolationNamed` lines. The quote strings in the controls are exact line text.

## Refusal/control contents read

Control files read directly:

- `controls/c1-baseline-tree-count.txt`: command for baseline `git ls-tree ... corpus/evidence/round43 | wc -l`; output `0`.
- `controls/c1-replay-r42-refused.json`: `exit: 1`, `refused: true`; refusal layers state `measure-schema (r41 record under v5)` and `challenge channel absent / unsigned (direct invocation)`.
- `controls/c1-synthetic-refused.json`: synthetic input `exit: 1`, `challengeVerified: false`, `challengeError: EINVAL`; refusal layer says no run private half means challenge verification is false. Its separate tampered result also records `measure-signature-invalid` and `receipt-binding-mismatch`.
- `controls/c1-relabel-refused.json`: tampered measure result `exit: 1`; findings and refusal layers include `measure-signature-invalid` and `receipt-binding-mismatch`.
- `controls/c2-baseline-red-r43.json`: baseline revision recorded, `exit: 1`, `findingCount: 2`, `predicate: false`.
- `controls/c2-v0-probe.json`: v2 checker `exit: 1`, `refused: true`, finding `r1-measure-blob-pin-mismatch`; r42 checker `exit: 0`, `r42FindingCount: 0`.
- `controls/c2-tree-fixture.json`: v2 names `r1a-not-a-blob`; r42 findings contain `r1a-unparseable` and no type-violation finding.

## R5 completeness counterexample

The actual freeze crosswalk above is complete. However, the frozen checker does not itself check that completeness: source lines 192-201 only require `controlBindings` to have at least five entries and then validate each listed entry. The checker contains no `beforeState` reference (search of the frozen-identical source returned no matches). **[INFERENCE]** If a later measured claims blob omitted any one beforeState control binding while retaining seven valid entries, R5 would not report the omission; it validates the remaining entries but never compares the list against the controls named in beforeState. This was not mutation-tested, in keeping with the frozen-byte scope.

No tools were installed or updated. The scratch directory was removed on command exit.