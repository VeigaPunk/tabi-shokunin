VERDICT: ISSUES
# MutC3 — finite C3 mutation probes at the measured candidate

Owner: TabiR18.MutC3-2. Read-only production lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Measured candidate: 530f40a9bc3f10436161a2af1ca0fe9bffffc004. Historical reference: 93bfead1f5f25f584353df3152a60209bbd89a2e.

## Result

**12 isolated committed mutants: 4 SURVIVED, 8 KILLED, 0 inconclusive.** Every mutant had a green pristine control and an exact-byte restored green control. All detector processes exited 0; kills are the JSON defect predicate becoming false and c3_routed_closed dropping from 5 to 4, not an error exit. The four survivors retain c3_routed_closed=5.

Survivors: **D1 unrelated 6 / asserted 7; D2 inconsistent stdout digests; D4 paraphrased unsupported publisher premise; D5 one execution replayed in seven whitespace-distinct files.** Exact duplicate entries, repeated same pathname, byte-identical copied receipts, wrong historical revision, wrong gate argv, a missing gate, and wrong adjacency producer digests were rejected in the finite shapes below.

This is falsification evidence and a counter-coverage finding, not round admission or a claim-wide judgment. No contract was changed and no production repair was integrated.

## Axes and bounds

- Target axis: **calibration C3**. Attack boundaries: semantic correction (D1), historical receipt identity/integrity (D2), checker provenance (D3), premise supersession (D4), execution uniqueness versus byte identity (D5).
- Guard axes: production isolation and exact restoration. The detector script was never mutated; its SHA-256 before, during and after every probe was **cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a**.
- Read PLAN.md:37-45,91-103 and corpus/lessons/round-18.md:24-28,53-84 first. The literal D2 digest-shape and D4 substring contracts are explicitly distinguished from the stronger semantic properties attacked here.
- One private clone rooted at /tmp/tabi-r18-MutC3-1KNrqBXw/repo; twelve detached worktrees below /tmp/tabi-r18-MutC3-1KNrqBXw, one committed defect per worktree. No Git writes, jj operation, index operation, browser operation or production-source edit occurred in LANE. Only this requested report is retained there.
- Each detector used timeout --signal=TERM --kill-after=5s 90s; the subprocess wrapper also had a 100000 ms bound and 16 MiB output cap. No detector timed out or produced stderr. Counter-internal Git output cap remains 64 MiB. Twelve pristine/mutated/restored triplets were logged (36 calls), plus one initial pristine call from the clone (37 calls total). No --self-test, harm-gate rerun, browser run, network request or other claim counter was invoked by this assignment.
- Observed tools: Node v24.21.0; git version 2.56.0; GNU timeout/coreutils 9.12. No installs or upgrades. Host tooling rules were read; no package/system transaction occurred.

## Outcome matrix

| Mutant | Boundary | Verdict | Mutant count | Observed target reason | Pristine / mutant / restored exits |
|---|---|---|---:|---|---|
| m1-d1-issue6-count7 | d1 | SURVIVED | 5 | correction_line_verified | 0 / 0 / 0 |
| m2-d2-stdout | d2 | SURVIVED | 5 | 20_historical_gates_verified | 0 / 0 / 0 |
| m3-d2-revision | d2 | KILLED | 4 | wrong_revision | 0 / 0 / 0 |
| m4-d2-argv | d2 | KILLED | 4 | gate_identity_mismatch | 0 / 0 / 0 |
| m5-d2-missinggate | d2 | KILLED | 4 | gate_count | 0 / 0 / 0 |
| m6-d3-producer | d3 | KILLED | 4 | wrong_producer_sha256 | 0 / 0 / 0 |
| m7-d4-paraphrase | d4 | SURVIVED | 5 | S058_supersession_verified | 0 / 0 / 0 |
| m8-d5-doubleindex | d5 | KILLED | 4 | rerun_file_duplicate | 0 / 0 / 0 |
| m9-d5-samepath | d5 | KILLED | 4 | fewer_than_seven_reruns | 0 / 0 / 0 |
| m10-d5-samebytes | d5 | KILLED | 4 | duplicate_rerun_artifact | 0 / 0 / 0 |
| m11-d5-samejson-whitespace | d5 | SURVIVED | 5 | 7_reruns_verified | 0 / 0 / 0 |
| m12-d3-forged57 | d3 | KILLED | 4 | wrong_producer_sha256 | 0 / 0 / 0 |

All pristine and restored counts were 5, all five defect predicates true. All non-target defect predicates stayed true in every mutant.

## Finite mutations, expected detector and observed result

### m1-d1-issue6-count7 — SURVIVED

- Input: corpus/lessons/round-18.md:55 (paths relative to LANE; committed sandbox variants only).
- Mutation: Replace the correction line with: Audit item 6: `corpus/lessons/round-17.md:116` and fleet `.ufo/reports/round-17/tabi.md:35`; after recounting, there are 7 siblings.
- Expected detector: d1.pass=false and c3_routed_closed=4: the 6 is an audit-item number, not the sibling count.
- Actual: exit 0; d1.pass=true; reason=correction_line_verified; c3_routed_closed=5; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:251-265,267-295 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- SURVIVOR: the correction claims seven after recounting, but the unrelated standalone 6 satisfies the citation-line predicate. The phrase “there are 7 siblings” evades claimsSevenAsCorrected. This is one demonstrated prose shape, not a claim about every paraphrase.
- Committed mutant: 6eb784505e0968e3f5710d50f6888017e40e6b99; restored commit: 07d04cccc86d0c4eef012ff0d1103a3135cfca2b.

### m2-d2-stdout — SURVIVED

- Input: corpus/evidence/round-18/routed/harm-at-93bfead.json:51,65,71 (paths relative to LANE; committed sandbox variants only).
- Mutation: Set gates[0].stdout.sha256 to 64 zeroes. Leave determinism.firstRun.stdoutSha256 and secondRun.stdoutSha256 at 25e66498180565a95122221af203fba2a053e8cb87ca152b1ee25e077158bd61, with deterministic=true.
- Expected detector: d2.pass=false and c3_routed_closed=4 for inconsistent same-first-run stdout digests.
- Actual: exit 0; d2.pass=true; reason=20_historical_gates_verified; c3_routed_closed=5; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:348-367 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- SURVIVOR: D2 accepts the 64-hex string without reconciling it against the receipt’s own firstRun digest. No retained full stdout exists in this receipt to rehash; this probe establishes an internal digest-consistency gap, not that a real gate failed. PLAN.md:95-98 explicitly requires digest shape and producer binding, so this is a finite coverage limitation of that stated predicate, not authority to silently broaden it.
- Committed mutant: cecde2e3462ba725e9019659e8c861bae5b8d911; restored commit: b23ddb8375b69245b135e46be46829e6afa57595.

### m3-d2-revision — KILLED

- Input: corpus/evidence/round-18/routed/harm-at-93bfead.json:3 (paths relative to LANE; committed sandbox variants only).
- Mutation: Replace the historical revision 93bfead1f5f25f584353df3152a60209bbd89a2e with 2bff864fdfee684ddbcd066cc8e735adaba2735c; all gate records unchanged.
- Expected detector: d2.pass=false, why=wrong_revision, c3_routed_closed=4.
- Actual: exit 0; d2.pass=false; reason=wrong_revision; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:314 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for this wrong full-hex revision.
- Committed mutant: a49b0a77062e162c817d7b5146f99825d3968c87; restored commit: eb193f7abb41d1976114425c7b5391078cee0a45.

### m4-d2-argv — KILLED

- Input: corpus/evidence/round-18/routed/harm-at-93bfead.json:42 (paths relative to LANE; committed sandbox variants only).
- Mutation: For check-round-contract-production only, replace argv[1] scripts/check-round-contract.mjs with scripts/check-adjacency.mjs. Keep its gate name, exit, digests and producer map unchanged.
- Expected detector: d2.pass=false, why=gate_identity_mismatch, c3_routed_closed=4.
- Actual: exit 0; d2.pass=false; reason=gate_identity_mismatch; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:348-353 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for this gate-name/argv disagreement.
- Committed mutant: 00c0ea48b496707fa793d4c8e06e738665c7aa60; restored commit: ae9970608278a869c5c410d6c4f6b03403eb7216.

### m5-d2-missinggate — KILLED

- Input: corpus/evidence/round-18/routed/harm-at-93bfead.json:838-884 at the candidate (paths relative to LANE; committed sandbox variants only).
- Mutation: Remove only the twentieth gate, check-measurement-binding-check-r16-at-1205d26-reproduce, and the preceding array comma. Nineteen gate records remain.
- Expected detector: d2.pass=false, why=gate_count, c3_routed_closed=4.
- Actual: exit 0; d2.pass=false; reason=gate_count; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:315 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for this 19-of-20 receipt.
- Committed mutant: c01eb4cabf30c3485acf92e3b60bc9c251065fd2; restored commit: 8deb25a2449cb209785e6b25cd05ca2ba18140d2.

### m6-d3-producer — KILLED

- Input: corpus/evidence/round-18/routed/adjacency-selftest.json:14 (paths relative to LANE; committed sandbox variants only).
- Mutation: Change only producer.sha256 from the historical checker SHA-256 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac to 64 zeroes. Retain the full genuine cases=57 stdout and its valid digest.
- Expected detector: d3.pass=false, why=wrong_producer_sha256, c3_routed_closed=4.
- Actual: exit 0; d3.pass=false; reason=wrong_producer_sha256; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:408-414 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED. This producer-only control isolates digest binding from stdout parsing.
- Committed mutant: 4d20ce369c6b1d2837ba9ba601f412ff80262fe1; restored commit: ede9a1aef238980b264268355071cdd856fcb292.

### m7-d4-paraphrase — SURVIVED

- Input: corpus/SOURCES.md:72, S058 anchor cell (paths relative to LANE; committed sandbox variants only).
- Mutation: Replace offered by François Beaufort; with offered by François Beaufort (a natural-person publisher);. Keep the supersedes S057 prefix, developer Google Ireland, Ltd., date and dossier untouched.
- Expected detector: d4.pass=false and c3_routed_closed=4 for reintroducing the unsupported publisher classification in paraphrase.
- Actual: exit 0; d4.pass=true; reason=S058_supersession_verified; c3_routed_closed=5; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:455-471 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- SURVIVOR: S058 still carries the old publisher-classification premise in a synonym while avoiding the exact substring “individual publisher”. The literal plan predicate remains satisfied; the broader claimed all-cell premise sweep in corpus/lessons/round-18.md:62-64 is not semantically enforced. No new live listing fetch or publisher identity assertion is made here.
- Committed mutant: a17a93a7377c526b21933da057a641ce1e42b33e; restored commit: bd5ee5c61e34e93848a5ac4cab413ade2b2e3e7e.

### m8-d5-doubleindex — KILLED

- Input: corpus/evidence/round-18/routed/harness-reruns/index.json:93-105 in the mutant (paths relative to LANE; committed sandbox variants only).
- Mutation: Append an exact copy of the first run index object after the original seven. Seven actual files remain, with eight index entries and run-1 indexed twice.
- Expected detector: d5.pass=false, why=rerun_file_duplicate, c3_routed_closed=4.
- Actual: exit 0; d5.pass=false; reason=rerun_file_duplicate; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:498-500 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for this duplicate index entry.
- Committed mutant: c29fcfa45c4516ea929e58f10e26df5b5096a23a; restored commit: 52ab17cecaffe86fc668b135280ceaba09a27535.

### m9-d5-samepath — KILLED

- Input: corpus/evidence/round-18/routed/harness-reruns/index.json:24-25,36-37,48-49,60-61,72-73,84-85 (paths relative to LANE; committed sandbox variants only).
- Mutation: Keep k=1..7, but point all seven index entries to run-1.json and its correct full SHA-256. Retain the seven committed files.
- Expected detector: d5.pass=false, why=fewer_than_seven_reruns, c3_routed_closed=4.
- Actual: exit 0; d5.pass=false; reason=fewer_than_seven_reruns; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:498-499 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for seven references to one file.
- Committed mutant: f4cfc2edc84a24a887d8cff1a33a690e50e4c3f4; restored commit: 6c5e8db8071f494bcc68ae46bc389f2e5d8719dd.

### m10-d5-samebytes — KILLED

- Input: corpus/evidence/round-18/routed/harness-reruns/run-2.json through run-7.json; index.json:25,37,49,61,73,85 (paths relative to LANE; committed sandbox variants only).
- Mutation: Copy the exact 309004 bytes of run-1.json into run-2..7.json; set each corresponding index SHA-256 to that copied receipt’s actual SHA-256. Names and k values remain distinct.
- Expected detector: d5.pass=false, why=duplicate_rerun_artifact, c3_routed_closed=4.
- Actual: exit 0; d5.pass=false; reason=duplicate_rerun_artifact; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:521-525 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for byte-identical receipt reuse under seven filenames.
- Committed mutant: 732641a9fdd1c960d3f6031c48771b4d196842bf; restored commit: 7339ece1c349be11fde29bb8ae67664915df74ef.

### m11-d5-samejson-whitespace — SURVIVED

- Input: corpus/evidence/round-18/routed/harness-reruns/run-2.json through run-7.json; index.json:25,37,49,61,73,85 (paths relative to LANE; committed sandbox variants only).
- Mutation: As in m10, reuse run-1.json for every run, but append k-1 LF bytes to run-k.json, k=2..7, then set every index SHA-256 to its actual new bytes. No parsed receipt field changes.
- Expected detector: d5.pass=false and c3_routed_closed=4: whitespace variants of one execution must not demonstrate seven executions.
- Actual: exit 0; d5.pass=true; reason=7_reruns_verified; c3_routed_closed=5; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:521-525,528-575 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- SURVIVOR: seven full byte digests are distinct but all seven JSON.stringify(JSON.parse(bytes)) digests are identical. All retain generatedAt=2026-10-20T19:06:35.783Z and flagged browser pid=834495. The counter reports 7_reruns_verified. This proves a byte-identity deduplication gap for this whitespace-only replay, not a general guarantee of execution authenticity.
- Committed mutant: 19960a0b102f3d78618ad78097fd03c231542f3c; restored commit: 995f0f4d0286cf0088a487f8f48eb3d703704e8b.

### m12-d3-forged57 — KILLED

- Input: corpus/evidence/round-18/routed/adjacency-selftest.json:8-9,14 (paths relative to LANE; committed sandbox variants only).
- Mutation: Replace stdout with the synthetic string ADJACENCY_SELFTEST verdict=clean cases=57\n; set its correct SHA-256 5ce3368203c7170db46cba2552176ce5fd3668fc44d15fa5734c753f3d308a13; bind producer.sha256 to the wrong historical script, check-sources.mjs (afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77). Keep parsed.cases=57 and exit=0.
- Expected detector: d3.pass=false, why=wrong_producer_sha256, c3_routed_closed=4.
- Actual: exit 0; d3.pass=false; reason=wrong_producer_sha256; c3_routed_closed=4; stderr empty.
- Detector boundary: .ufo/waves/round-18/measure-c3.mjs:399-414 at 530f40a9bc3f10436161a2af1ca0fe9bffffc004.
- KILLED for a forged cases=57 summary with a valid content digest but the wrong script digest.
- Committed mutant: 3c663991304bdce5d781af0dcb66a43cd6a72c5f; restored commit: 426806c3f12cb4c902148c106e1c88ebde966ca7.

## Restoration and sandbox cleanup

For each worktree, the finally path used git restore --source 530f40a9bc3f10436161a2af1ca0fe9bffffc004 --staged --worktree -- followed by its exact mutated path list (the argv is retained below), then committed restoration and ran the same unchanged detector on that restoration commit. SHA-256 maps below record all touched files plus the detector, before/mutated/restored. Every restored map equals its pristine map. Each restored full Git tree is **82a9c844c23e30a9cd4abb296fcd5879e060b828**, identical to the candidate tree, independently of the differing commit IDs.

All twelve exact-byte restorations completed before deletion. Cleanup receipt:

```json
{
  "cleanup": {
    "argv": [
      "rm",
      "-rf",
      "--",
      "/tmp/tabi-r18-MutC3-1KNrqBXw"
    ],
    "cwd": "/tmp",
    "exit": 0,
    "stdout": "",
    "stderr": ""
  },
  "sandboxAbsent": true,
  "retainedSandbox": false
}
```

The sandbox and all private Git metadata were removed. No sandbox commit is claimed to exist in LANE. Reproducible mutation source is retained below instead of leaving ephemeral paths as the only receipt.

## Setup commands and observed outputs

Executed from /home/vgpnk/Projects/shokunin, mktemp -d /tmp/tabi-r18-MutC3-XXXXXXXX returned /tmp/tabi-r18-MutC3-1KNrqBXw, exit 0. Then:

```sh
git -c core.hooksPath=/dev/null clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-MutC3-1KNrqBXw/repo && git -c core.hooksPath=/dev/null -C /tmp/tabi-r18-MutC3-1KNrqBXw/repo checkout --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed exit 0; output:

```text
Cloning into '/tmp/tabi-r18-MutC3-1KNrqBXw/repo'...
done.
HEAD is now at 530f40a round-18: source rechecks, guarded harness, routed correction evidence and build wave
```

Each worktree used git -c core.hooksPath=/dev/null -c core.fsmonitor=false -C /tmp/tabi-r18-MutC3-1KNrqBXw/repo worktree add --detach, its absolute directory, and 530f40a9bc3f10436161a2af1ca0fe9bffffc004. All exited 0, stdout HEAD is now at 530f40a round-18: source rechecks, guarded harness, routed correction evidence and build wave; stderr Preparing worktree (detached HEAD 530f40a). Directories and detector argv are recorded for every case below. Commands inherited the existing environment with GIT_CONFIG_NOSYSTEM=1, GIT_CONFIG_GLOBAL=/dev/null, GIT_OPTIONAL_LOCKS=0; no environment secrets are recorded. Mutant/restoration commit argv below use explicit fixed author/committer dates and private test identity.

Initial pristine call (exit 0, empty stderr):

```sh
timeout --signal=TERM --kill-after=5s 90s node /tmp/tabi-r18-MutC3-1KNrqBXw/repo/.ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```
```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c3_routed_closed":5,"defects":{"d1":{"pass":true,"why":"correction_line_verified"},"d2":{"pass":true,"why":"20_historical_gates_verified"},"d3":{"pass":true,"why":"adjacency_selftest_verified"},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{"pass":true,"why":"7_reruns_verified"}},"counterSha256":"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"}
```

## Exact detector receipts, hashes and commit/restoration argv

These are actual captured stdout/stderr strings and exit statuses, not illustrative output. Every argv array is complete and each cwd is absolute. SHA-256 values are full 64-hex digests. The semantic digest in replay payload facts is SHA-256 of UTF-8 JSON.stringify(JSON.parse(receipt bytes)); it establishes identical parsed values for these seven copies, not cryptographic proof that independently authored arbitrary receipts describe distinct executions.

```json
[
  {
    "id": "m1-d1-issue6-count7",
    "defect": "d1",
    "verdict": "survived",
    "mutantRevision": "6eb784505e0968e3f5710d50f6888017e40e6b99",
    "restoredRevision": "07d04cccc86d0c4eef012ff0d1103a3135cfca2b",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7/.ufo/waves/round-18/measure-c3.mjs",
        "6eb784505e0968e3f5710d50f6888017e40e6b99"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "{\"rev\":\"6eb784505e0968e3f5710d50f6888017e40e6b99\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7/.ufo/waves/round-18/measure-c3.mjs",
        "07d04cccc86d0c4eef012ff0d1103a3135cfca2b"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "{\"rev\":\"07d04cccc86d0c4eef012ff0d1103a3135cfca2b\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/lessons/round-18.md": "31b21b9a461a25b263c8a16f6453a7bc60d49f57157246760a45c325ac7b8a44",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/lessons/round-18.md": "6f961306b64f4e7872a66a6604bdd46bdfa1fae9f4bdc4aab0353eb7310069aa",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/lessons/round-18.md": "31b21b9a461a25b263c8a16f6453a7bc60d49f57157246760a45c325ac7b8a44",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m1-d1-issue6-count7"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/lessons/round-18.md"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m1-d1-issue6-count7"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m1-d1-issue6-count7",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m2-d2-stdout",
    "defect": "d2",
    "verdict": "survived",
    "mutantRevision": "cecde2e3462ba725e9019659e8c861bae5b8d911",
    "restoredRevision": "b23ddb8375b69245b135e46be46829e6afa57595",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout/.ufo/waves/round-18/measure-c3.mjs",
        "cecde2e3462ba725e9019659e8c861bae5b8d911"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "{\"rev\":\"cecde2e3462ba725e9019659e8c861bae5b8d911\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout/.ufo/waves/round-18/measure-c3.mjs",
        "b23ddb8375b69245b135e46be46829e6afa57595"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "{\"rev\":\"b23ddb8375b69245b135e46be46829e6afa57595\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "7b97e27c085059612ebf2129fa2714875c4f3375a9e998a23d4b7dfa2c42080f",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": {
      "gate": "check-round-contract-production",
      "stdoutSha256": "0000000000000000000000000000000000000000000000000000000000000000",
      "determinism": {
        "runs": 2,
        "deterministic": true,
        "firstRun": {
          "exit": 0,
          "stdoutSha256": "25e66498180565a95122221af203fba2a053e8cb87ca152b1ee25e077158bd61",
          "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          "runtimeMs": 1580.34192
        },
        "secondRun": {
          "exit": 0,
          "stdoutSha256": "25e66498180565a95122221af203fba2a053e8cb87ca152b1ee25e077158bd61",
          "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          "runtimeMs": 1584.089487
        }
      }
    },
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m2-d2-stdout"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harm-at-93bfead.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m2-d2-stdout"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m2-d2-stdout",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m3-d2-revision",
    "defect": "d2",
    "verdict": "killed",
    "mutantRevision": "a49b0a77062e162c817d7b5146f99825d3968c87",
    "restoredRevision": "eb193f7abb41d1976114425c7b5391078cee0a45",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision/.ufo/waves/round-18/measure-c3.mjs",
        "a49b0a77062e162c817d7b5146f99825d3968c87"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "{\"rev\":\"a49b0a77062e162c817d7b5146f99825d3968c87\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":false,\"why\":\"wrong_revision\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision/.ufo/waves/round-18/measure-c3.mjs",
        "eb193f7abb41d1976114425c7b5391078cee0a45"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "{\"rev\":\"eb193f7abb41d1976114425c7b5391078cee0a45\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "d0e9758ff885bc3a151587b62716929bd99bc47ac46e672ef518003b0f38b1f6",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m3-d2-revision"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harm-at-93bfead.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m3-d2-revision"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m3-d2-revision",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m4-d2-argv",
    "defect": "d2",
    "verdict": "killed",
    "mutantRevision": "00c0ea48b496707fa793d4c8e06e738665c7aa60",
    "restoredRevision": "ae9970608278a869c5c410d6c4f6b03403eb7216",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv/.ufo/waves/round-18/measure-c3.mjs",
        "00c0ea48b496707fa793d4c8e06e738665c7aa60"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "{\"rev\":\"00c0ea48b496707fa793d4c8e06e738665c7aa60\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":false,\"why\":\"gate_identity_mismatch\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv/.ufo/waves/round-18/measure-c3.mjs",
        "ae9970608278a869c5c410d6c4f6b03403eb7216"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "{\"rev\":\"ae9970608278a869c5c410d6c4f6b03403eb7216\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "020006d082bce5f30148d03491e57186ccdbf1db2738cc26872204cb3aa8529f",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m4-d2-argv"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harm-at-93bfead.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m4-d2-argv"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m4-d2-argv",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m5-d2-missinggate",
    "defect": "d2",
    "verdict": "killed",
    "mutantRevision": "c01eb4cabf30c3485acf92e3b60bc9c251065fd2",
    "restoredRevision": "8deb25a2449cb209785e6b25cd05ca2ba18140d2",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate/.ufo/waves/round-18/measure-c3.mjs",
        "c01eb4cabf30c3485acf92e3b60bc9c251065fd2"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "{\"rev\":\"c01eb4cabf30c3485acf92e3b60bc9c251065fd2\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":false,\"why\":\"gate_count\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate/.ufo/waves/round-18/measure-c3.mjs",
        "8deb25a2449cb209785e6b25cd05ca2ba18140d2"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "{\"rev\":\"8deb25a2449cb209785e6b25cd05ca2ba18140d2\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "bc2215c4a1ffaec48518f655d8590b324bfecd64c148a660af6620b15e3117c8",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harm-at-93bfead.json": "99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m5-d2-missinggate"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harm-at-93bfead.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m5-d2-missinggate"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m5-d2-missinggate",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m6-d3-producer",
    "defect": "d3",
    "verdict": "killed",
    "mutantRevision": "4d20ce369c6b1d2837ba9ba601f412ff80262fe1",
    "restoredRevision": "ede9a1aef238980b264268355071cdd856fcb292",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer/.ufo/waves/round-18/measure-c3.mjs",
        "4d20ce369c6b1d2837ba9ba601f412ff80262fe1"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "{\"rev\":\"4d20ce369c6b1d2837ba9ba601f412ff80262fe1\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":false,\"why\":\"wrong_producer_sha256\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer/.ufo/waves/round-18/measure-c3.mjs",
        "ede9a1aef238980b264268355071cdd856fcb292"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "{\"rev\":\"ede9a1aef238980b264268355071cdd856fcb292\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "5207b8ff66ad298a7dfca8c030a70b9623ad73057f229f2ae6c41e15622dce6e",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "7f8dfb31863bc6eafb12f41ceeb96791b05b1ceb3445bdfe3d41a32353ccd4a2",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "5207b8ff66ad298a7dfca8c030a70b9623ad73057f229f2ae6c41e15622dce6e",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": {
      "stdoutContainsCases57": true,
      "parsed": {
        "cases": 57,
        "verdict": "clean"
      },
      "producer": {
        "path": "scripts/check-adjacency.mjs",
        "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
      }
    },
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m6-d3-producer"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/adjacency-selftest.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m6-d3-producer"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m6-d3-producer",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m7-d4-paraphrase",
    "defect": "d4",
    "verdict": "survived",
    "mutantRevision": "a17a93a7377c526b21933da057a641ce1e42b33e",
    "restoredRevision": "bd5ee5c61e34e93848a5ac4cab413ade2b2e3e7e",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase/.ufo/waves/round-18/measure-c3.mjs",
        "a17a93a7377c526b21933da057a641ce1e42b33e"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "{\"rev\":\"a17a93a7377c526b21933da057a641ce1e42b33e\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase/.ufo/waves/round-18/measure-c3.mjs",
        "bd5ee5c61e34e93848a5ac4cab413ade2b2e3e7e"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "{\"rev\":\"bd5ee5c61e34e93848a5ac4cab413ade2b2e3e7e\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/SOURCES.md": "81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/SOURCES.md": "b7fa83a565076b8f57b5fac1af88e34a42a0d5fd3c65e59c42d269f3b9f1ecc2",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/SOURCES.md": "81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m7-d4-paraphrase"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/SOURCES.md"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m7-d4-paraphrase"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m7-d4-paraphrase",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m8-d5-doubleindex",
    "defect": "d5",
    "verdict": "killed",
    "mutantRevision": "c29fcfa45c4516ea929e58f10e26df5b5096a23a",
    "restoredRevision": "52ab17cecaffe86fc668b135280ceaba09a27535",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex/.ufo/waves/round-18/measure-c3.mjs",
        "c29fcfa45c4516ea929e58f10e26df5b5096a23a"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "{\"rev\":\"c29fcfa45c4516ea929e58f10e26df5b5096a23a\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":false,\"why\":\"rerun_file_duplicate\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex/.ufo/waves/round-18/measure-c3.mjs",
        "52ab17cecaffe86fc668b135280ceaba09a27535"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "{\"rev\":\"52ab17cecaffe86fc668b135280ceaba09a27535\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "61b3e7de5dbe75b46ce2addb4daf52aae0dff9cefdb11571edbcc7604dcd6373",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m8-d5-doubleindex"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harness-reruns/index.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m8-d5-doubleindex"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m8-d5-doubleindex",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m9-d5-samepath",
    "defect": "d5",
    "verdict": "killed",
    "mutantRevision": "f4cfc2edc84a24a887d8cff1a33a690e50e4c3f4",
    "restoredRevision": "6c5e8db8071f494bcc68ae46bc389f2e5d8719dd",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath/.ufo/waves/round-18/measure-c3.mjs",
        "f4cfc2edc84a24a887d8cff1a33a690e50e4c3f4"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "{\"rev\":\"f4cfc2edc84a24a887d8cff1a33a690e50e4c3f4\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":false,\"why\":\"fewer_than_seven_reruns\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath/.ufo/waves/round-18/measure-c3.mjs",
        "6c5e8db8071f494bcc68ae46bc389f2e5d8719dd"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "{\"rev\":\"6c5e8db8071f494bcc68ae46bc389f2e5d8719dd\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "10bbab81cdfa5b8ce6c358307870d9ed28e74c2053f24d53dcb11fdb39c3c814",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": null,
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m9-d5-samepath"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harness-reruns/index.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m9-d5-samepath"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m9-d5-samepath",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m10-d5-samebytes",
    "defect": "d5",
    "verdict": "killed",
    "mutantRevision": "732641a9fdd1c960d3f6031c48771b4d196842bf",
    "restoredRevision": "7339ece1c349be11fde29bb8ae67664915df74ef",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes/.ufo/waves/round-18/measure-c3.mjs",
        "732641a9fdd1c960d3f6031c48771b4d196842bf"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "{\"rev\":\"732641a9fdd1c960d3f6031c48771b4d196842bf\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":false,\"why\":\"duplicate_rerun_artifact\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes/.ufo/waves/round-18/measure-c3.mjs",
        "7339ece1c349be11fde29bb8ae67664915df74ef"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "{\"rev\":\"7339ece1c349be11fde29bb8ae67664915df74ef\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "9a1ea663c9429e2736af46e36c343fe040301e2ec5cf7d8addc0f0dfb16238c7",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": {
      "fileFacts": [
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-1.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-2.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-3.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-4.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-5.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-6.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-7.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        }
      ],
      "distinctByteDigests": 1,
      "distinctSemanticDigests": 1
    },
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m10-d5-samebytes"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harness-reruns/index.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m10-d5-samebytes"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m10-d5-samebytes",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m11-d5-samejson-whitespace",
    "defect": "d5",
    "verdict": "survived",
    "mutantRevision": "19960a0b102f3d78618ad78097fd03c231542f3c",
    "restoredRevision": "995f0f4d0286cf0088a487f8f48eb3d703704e8b",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace/.ufo/waves/round-18/measure-c3.mjs",
        "19960a0b102f3d78618ad78097fd03c231542f3c"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "{\"rev\":\"19960a0b102f3d78618ad78097fd03c231542f3c\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace/.ufo/waves/round-18/measure-c3.mjs",
        "995f0f4d0286cf0088a487f8f48eb3d703704e8b"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "{\"rev\":\"995f0f4d0286cf0088a487f8f48eb3d703704e8b\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "3a3a7c46606c2b727e98504e9d47b76393d4bed66061924a59795c9ba12ac069",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "8ff5d72b87648d6138e48ab10fcfc31db59b7f2d4761be0381a6658a3a19b32f",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "61ff55767fdb6c746d45a71898023ec16112287294dce2a53672edac1abb6701",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "63c40ebb8a26750814f3f5f49a4711a33321b9f64dabb647541e81d24b7bb015",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "9347b7b219da205360c4148df1dafd8d9dde7cce8cdcfe738d21e8381e1dfaf4",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "9312a907d6625b376efbbf8151a189aa76ecd231533e2b62161b414b136d995c",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "2f6e02332a978782f7513db25fc6c0395a6b497bad95588a32a8678861057f88",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/harness-reruns/index.json": "043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json": "eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json": "0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json": "cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json": "cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json": "f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json": "8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": {
      "fileFacts": [
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-1.json",
          "bytes": 309004,
          "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-2.json",
          "bytes": 309005,
          "sha256": "8ff5d72b87648d6138e48ab10fcfc31db59b7f2d4761be0381a6658a3a19b32f",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-3.json",
          "bytes": 309006,
          "sha256": "61ff55767fdb6c746d45a71898023ec16112287294dce2a53672edac1abb6701",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-4.json",
          "bytes": 309007,
          "sha256": "63c40ebb8a26750814f3f5f49a4711a33321b9f64dabb647541e81d24b7bb015",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-5.json",
          "bytes": 309008,
          "sha256": "9347b7b219da205360c4148df1dafd8d9dde7cce8cdcfe738d21e8381e1dfaf4",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-6.json",
          "bytes": 309009,
          "sha256": "9312a907d6625b376efbbf8151a189aa76ecd231533e2b62161b414b136d995c",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        },
        {
          "path": "corpus/evidence/round-18/routed/harness-reruns/run-7.json",
          "bytes": 309010,
          "sha256": "2f6e02332a978782f7513db25fc6c0395a6b497bad95588a32a8678861057f88",
          "semanticSha256": "180cd4812e5178101984afbb244ce746a0db91bc57b9cb0282e95640b61ad7ef",
          "generatedAt": "2026-10-20T19:06:35.783Z",
          "flaggedPid": 834495
        }
      ],
      "distinctByteDigests": 7,
      "distinctSemanticDigests": 1
    },
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m11-d5-samejson-whitespace"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/harness-reruns/index.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-2.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-3.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-4.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-5.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-6.json",
        "corpus/evidence/round-18/routed/harness-reruns/run-7.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m11-d5-samejson-whitespace"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m11-d5-samejson-whitespace",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  },
  {
    "id": "m12-d3-forged57",
    "defect": "d3",
    "verdict": "killed",
    "mutantRevision": "3c663991304bdce5d781af0dcb66a43cd6a72c5f",
    "restoredRevision": "426806c3f12cb4c902148c106e1c88ebde966ca7",
    "pristine": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57/.ufo/waves/round-18/measure-c3.mjs",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "{\"rev\":\"530f40a9bc3f10436161a2af1ca0fe9bffffc004\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "mutant": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57/.ufo/waves/round-18/measure-c3.mjs",
        "3c663991304bdce5d781af0dcb66a43cd6a72c5f"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "{\"rev\":\"3c663991304bdce5d781af0dcb66a43cd6a72c5f\",\"c3_routed_closed\":4,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":false,\"why\":\"wrong_producer_sha256\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "restored": {
      "argv": [
        "timeout",
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        "node",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57/.ufo/waves/round-18/measure-c3.mjs",
        "426806c3f12cb4c902148c106e1c88ebde966ca7"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "{\"rev\":\"426806c3f12cb4c902148c106e1c88ebde966ca7\",\"c3_routed_closed\":5,\"defects\":{\"d1\":{\"pass\":true,\"why\":\"correction_line_verified\"},\"d2\":{\"pass\":true,\"why\":\"20_historical_gates_verified\"},\"d3\":{\"pass\":true,\"why\":\"adjacency_selftest_verified\"},\"d4\":{\"pass\":true,\"why\":\"S058_supersession_verified\"},\"d5\":{\"pass\":true,\"why\":\"7_reruns_verified\"}},\"counterSha256\":\"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a\"}\n",
      "stderr": ""
    },
    "sha256": {
      "pristine": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "5207b8ff66ad298a7dfca8c030a70b9623ad73057f229f2ae6c41e15622dce6e",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "mutated": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "f2bd8d7ee51f719fd2e27704710b0cc63beab1c6b3de169a546a70e37d12a1e3",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      },
      "restored": {
        "corpus/evidence/round-18/routed/adjacency-selftest.json": "5207b8ff66ad298a7dfca8c030a70b9623ad73057f229f2ae6c41e15622dce6e",
        ".ufo/waves/round-18/measure-c3.mjs": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"
      }
    },
    "tree": {
      "pristine": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "restored": "82a9c844c23e30a9cd4abb296fcd5879e060b828",
      "exact": true
    },
    "payloadFacts": {
      "stdout": "ADJACENCY_SELFTEST verdict=clean cases=57\n",
      "stdoutSha256": "5ce3368203c7170db46cba2552176ce5fd3668fc44d15fa5734c753f3d308a13",
      "wrongScript": "scripts/check-sources.mjs",
      "producerSha256": "afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77"
    },
    "mutationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "MutC3 m12-d3-forged57"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restoreBytes": {
      "argv": [
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
        "restore",
        "--source",
        "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
        "--staged",
        "--worktree",
        "--",
        "corpus/evidence/round-18/routed/adjacency-selftest.json"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    },
    "restorationCommit": {
      "argv": [
        "env",
        "GIT_AUTHOR_DATE=2026-10-20T00:00:00Z",
        "GIT_COMMITTER_DATE=2026-10-20T00:00:00Z",
        "git",
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "user.name=TabiR18.MutC3-2",
        "-c",
        "user.email=mut-c3@example.invalid",
        "-c",
        "commit.gpgsign=false",
        "-C",
        "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
        "commit",
        "--quiet",
        "--no-gpg-sign",
        "-m",
        "Restore MutC3 m12-d3-forged57"
      ],
      "cwd": "/tmp/tabi-r18-MutC3-1KNrqBXw/m12-d3-forged57",
      "exit": 0,
      "stdout": "",
      "stderr": ""
    }
  }
]
```

## Reproducible finite mutation source

The following self-contained Node source recreates the same committed input mutations from the pinned candidate using only a new private /tmp clone/worktrees, applies the unchanged bounded detector to pristine/mutated/restored commits, and removes its sandbox. It is retained as reproduction source, **not claimed as an additional executed verification**. The observed run used the specialized edit/write tool operations recorded in this session, and the exact observed command receipts are above. All writes in this source are confined to its newly allocated /tmp root.

```js
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const lane = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const base = '530f40a9bc3f10436161a2af1ca0fe9bffffc004';
const root = mkdtempSync('/tmp/tabi-r18-MutC3-replay-');
const repo = root + '/repo';
const routed = 'corpus/evidence/round-18/routed/';
const counter = '.ufo/waves/round-18/measure-c3.mjs';
const ids = ['m1-d1-issue6-count7','m2-d2-stdout','m3-d2-revision','m4-d2-argv','m5-d2-missinggate','m6-d3-producer','m7-d4-paraphrase','m8-d5-doubleindex','m9-d5-samepath','m10-d5-samebytes','m11-d5-samejson-whitespace','m12-d3-forged57'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const NL = String.fromCharCode(10);
const env = { ...process.env, GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:'/dev/null', GIT_OPTIONAL_LOCKS:'0', GIT_AUTHOR_DATE:'2026-10-20T00:00:00Z', GIT_COMMITTER_DATE:'2026-10-20T00:00:00Z' };
function run(argv, cwd, checked=true) {
  const r = spawnSync(argv[0], argv.slice(1), { cwd, env, encoding:'utf8', timeout:100000, maxBuffer:2**24 });
  if (checked && (r.error || r.status !== 0)) throw new Error(JSON.stringify({argv,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message}));
  return { argv, cwd, exit:r.status, signal:r.signal, stdout:r.stdout, stderr:r.stderr };
}
function git(dir, args) {
  return run(['git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-c','user.name=TabiR18.MutC3-2','-c','user.email=mut-c3@example.invalid','-c','commit.gpgsign=false','-C',dir,...args], dir);
}
function editLines(dir, path, fn) {
  const lines = readFileSync(dir+'/'+path,'utf8').split(NL);
  fn(lines);
  writeFileSync(dir+'/'+path,lines.join(NL));
}
function mutate(dir,id) {
  const harm=routed+'harm-at-93bfead.json', adj=routed+'adjacency-selftest.json', index=routed+'harness-reruns/index.json';
  if (id==='m1-d1-issue6-count7') editLines(dir,'corpus/lessons/round-18.md',l=>{const q=String.fromCharCode(96);l[54]='Audit item 6: '+q+'corpus/lessons/round-17.md:116'+q+' and fleet '+q+'.ufo/reports/round-17/tabi.md:35'+q+'; after recounting, there are 7 siblings.';});
  if (id==='m2-d2-stdout') editLines(dir,harm,l=>{l[50]='        "sha256": "'+'0'.repeat(64)+'",';});
  if (id==='m3-d2-revision') editLines(dir,harm,l=>{l[2]='  "revision": "2bff864fdfee684ddbcd066cc8e735adaba2735c",';});
  if (id==='m4-d2-argv') editLines(dir,harm,l=>{l[41]='        "scripts/check-adjacency.mjs"';});
  if (id==='m5-d2-missinggate') editLines(dir,harm,l=>{l[837]='    }';l.splice(838,46);});
  if (id==='m6-d3-producer') editLines(dir,adj,l=>{l[13]='    "sha256": "'+'0'.repeat(64)+'"';});
  if (id==='m7-d4-paraphrase') editLines(dir,'corpus/SOURCES.md',l=>{l[71]=l[71].replace('offered by François Beaufort;','offered by François Beaufort (a natural-person publisher);');});
  if (id==='m8-d5-doubleindex') editLines(dir,index,l=>{const first=l.slice(9,20);l.splice(92,1,'    },',...first,'    }');});
  if (id==='m9-d5-samepath') editLines(dir,index,l=>{for(let k=2;k<=7;k++){l[12*k-1]='      "file": "run-1.json",';l[12*k]='      "sha256": "5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6",';}});
  if (id==='m10-d5-samebytes'||id==='m11-d5-samejson-whitespace') {
    const first=readFileSync(dir+'/'+routed+'harness-reruns/run-1.json');
    const sums={};
    for(let k=2;k<=7;k++) {
      const bytes=Buffer.concat([first,Buffer.from(id==='m11-d5-samejson-whitespace'?NL.repeat(k-1):'')]);
      writeFileSync(dir+'/'+routed+'harness-reruns/run-'+k+'.json',bytes);sums[k]=sha(bytes);
    }
    editLines(dir,index,l=>{for(let k=2;k<=7;k++)l[12*k]='      "sha256": "'+sums[k]+'",';});
  }
  if (id==='m12-d3-forged57') editLines(dir,adj,l=>{
    const stdout='ADJACENCY_SELFTEST verdict=clean cases=57'+NL;
    l[7]='  "stdout": '+JSON.stringify(stdout)+',';
    l[8]='  "stdoutSha256": "'+sha(stdout)+'",';
    l[13]='    "sha256": "afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77"';
  });
}
function probe(dir,rev) { return run(['timeout','--signal=TERM','--kill-after=5s','90s','node',dir+'/'+counter,rev],dir,false); }
try {
  run(['git','-c','core.hooksPath=/dev/null','clone','--no-hardlinks',lane,repo],root);
  git(repo,['checkout','--detach',base]);
  for (const id of ids) {
    const dir=root+'/'+id;
    git(repo,['worktree','add','--detach',dir,base]);
    const pristine=probe(dir,base);
    if(pristine.exit!==0||JSON.parse(pristine.stdout).c3_routed_closed!==5) throw new Error('Inconclusive pristine control: '+JSON.stringify(pristine));
    let mutated, restored;
    try {
      mutate(dir,id);
      git(dir,['add','--all']);
      git(dir,['commit','--quiet','--no-gpg-sign','-m','MutC3 '+id]);
      const rev=git(dir,['rev-parse','HEAD']).stdout.trim();
      mutated=probe(dir,rev);
    } finally {
      git(dir,['restore','--source',base,'--staged','--worktree','--','.']);
      git(dir,['commit','--quiet','--no-gpg-sign','-m','Restore MutC3 '+id]);
      const rev=git(dir,['rev-parse','HEAD']).stdout.trim();
      restored=probe(dir,rev);
    }
    console.log(JSON.stringify({id,pristine,mutated,restored}));
  }
} finally { rmSync(root,{recursive:true,force:true}); }
```

## Scope of the findings

The survivors do not establish an actual failed historical gate or a false current live source. They establish four precise ways that wrong or replayed inputs still receive credit at this candidate. The killed shapes establish only their named checks; no exhaustive forgery resistance, general semantic understanding, or broader C1/C2 result is claimed. No production code, corpus, fleet state, Git index or jj state was modified for repair.

Files written (retained):
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/MutC3.md
