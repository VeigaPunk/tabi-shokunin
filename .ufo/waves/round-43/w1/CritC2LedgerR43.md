# CritC2LedgerR43 — C2 calibration review

## Finding

**Axis: calibration.** The measure-blob pin works against the all-fake V0 fixture, but a V0-style fixture with the authentic round-41 measure, receipt, and witness copied in passes the complete round-43 checker while its round-42 supporting inputs remain fabricated. This is a false green for the checker’s broader committed-input claim; it is **not** a fabrication of different round-41 evidence.

## Evidence and commands

Read-only live-revision check at lane `HEAD=ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`:

```sh
TMPDIR=/fast/scratch/hyaku/tabi-r43/CritC2LedgerR43 node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Observed JSON fields: `predicate=true`, `findingCount=0`, `findings=[]`; exit 0.

Read-only byte identity checks:

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:.ufo/waves/round-41/measure/c1-measure.json | git hash-object --stdin
# 8ff64d691f5c09569a50f2a5a038bb23774c3d35

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:.ufo/waves/round-41/measure/c1-measure.json | sha256sum
# 5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
# 416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:corpus/evidence/round41/playwright-egress/receipt.witness.json | sha256sum
# d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3
```

The `git hash-object` result is the frozen pin. The two SHA-256 values match the fields in the committed measure record, and the actual blobs are `blob` objects of 1,167,198 and 1,153,988 bytes respectively.

### Scratch fabrication probe

Because the assignment forbids Git mutations/commits, I did not run the committed fixture generator (it performs `git init`, `git add`, and `git commit`). Instead I ran the unchanged checker against a scratch filesystem-backed shim for its read-only Git calls. The shim calculated object IDs using Git SHA-1 blob framing; no Git repository, object writes, or commits were created. It used the exact 38 committed slice IDs, copied the actual frozen claims, their bound controls, and the committed V0 probe into both cases, and otherwise recreated the V0 fixture’s fake `SOURCES.md`, staged HTML, baseline output, TSV, and 38 evidence files. The second case replaced only the three R1 files with their exact bytes from the live committed HEAD.

Checker argv in both runs was:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev ffffffffffffffffffffffffffffffffffffffff --repo <scratch>/virtual-repo --json
```

Environment was `PATH=<scratch>/bin:$PATH`, `FAKE_GIT_ROOT=<scratch>/<case>`, and `TMPDIR=<scratch>`; the shim supplies the Git read responses from that fixture. Parsed checker results (stderr empty):

```json
{
  "allFake": {"exit": 1, "predicate": false, "findingCount": 1, "findingIds": ["r1-measure-blob-pin-mismatch"]},
  "copiedRealR41": {"exit": 0, "predicate": true, "findingCount": 0, "findingIds": []}
}
```

The all-fake result is also consistent with committed `.ufo/waves/round-43/controls/c2-v0-probe.json`, which records the original V0 fixture refused by round 43 for `r1-measure-blob-pin-mismatch` (the original fixture additionally lacks R5/R6 inputs).

## Interpretation and correction

The exact-byte copy is **covered by the frozen R1 wording**: the measure is pinned by object ID, and reusing identical blob bytes produces that same object ID. The copied case does not alter or forge the round-41 record, receipt, or witness. Thus, **no exit-0 case here has round-41 evidence bytes different from the real round-41 state**.

The complete checker nevertheless returns exit 0 with materially fake non-R41 content: the copied fixture’s S148/S146 source rows and staged page are synthetic, the baseline output is invented, and all 38 adjudication evidence files are literal fabricated filler. These inputs pass because R2/R3/R4 check text/shape/existence/size, not source or evidence provenance. R5/R6 were the real frozen bytes, so this isolates the unbound R2/R3/R4 inputs. The frozen sentence states those structural tests, but does not require those inputs to be authentic; if the intended calibration claim is that a synthetic committed revision cannot green materially fabricated supporting evidence, that scope is not covered. No counter/claims/checker bytes were amended.

Smallest safe route: retain the R1 pin as-is; for any future claim requiring provenance, bind the R2/R3/R4 source, baseline, slice, TSV, and evidence inputs to frozen digests/controls (and ensure the measured revision is tied to the actual freeze), rather than treating presence/length/string matches as authentic evidence. Current frozen bytes must remain unchanged; route this gap to the next round if that provenance is intended.

## Limitations and environment

The scratch probe emulates Git read responses rather than exercising a real committed fixture; actual Git commit/tree resolution was not tested, by explicit no-Git-mutation constraint. The live HEAD check and blob/hash checks used real Git. No tools were installed or updated. The scratch directory was removed in `finally`; no files were written outside this report and scratch.

VERDICT finding The checker greens V0-style fake R2/R3/R4 inputs when the authentic R41 blobs are copied.