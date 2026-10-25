# ExecC2Controls — C2 skip-work controls (round 27, wave 1)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Gate under test: `scripts/check-s106-evidence.mjs`
Lane HEAD at run start/end: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (read-only `git rev-parse HEAD`).
Environment: `node --version` → `v24.21.0`. No tool installs, no upgrades, no pacman.
Write scope used: this report + `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/ExecC2Controls/` only. No tracked file written by this seat; no git write command run.

Gate semantics read from source (`scripts/check-s106-evidence.mjs:95-143`): `valid = sha_match && anchor_located && anchor_unique && byte_count_match`; `sha256` is recomputed over the blob at `receipt.bytes_path` at the measured rev; `anchor_located` = `lines[line-1].trim() === text.trim()`; `anchor_unique` = exactly 1 trimmed-equal line; refusals (missing receipt, missing bytes, malformed receipt) exit 2; invalid exits 1; valid exits 0.

## Fixtures

Base data for every fixture is the shipped evidence-of-record (copied, throwaway only):
- receipt: `corpus/evidence/round-26/sources/s106.json` (`sha256sum` of decoded bytes `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`, `wc -c` → `73952`)
- bytes: `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` (`sed -n '186,187p'` → `// Enable using the BackForwardCache.` / `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`; `grep -c 'BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);'` → `1`)

Each fixture was created with `D=$(mktemp -d "$SCR/<id>-XXXX")`, `git -C "$D" init -q`, `git -C "$D" config user.email fixture@tabi.local`, `git -C "$D" config user.name tabi-fixture`, and the assertion `[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ]` before the first commit. Re-verified after the run (all six show toplevel = their own fixture dir).

Driver script (reproduces every case): `bash .ufo/waves/round-27/scratch/ExecC2Controls/run-controls.sh`
`sha256sum run-controls.sh` → `e1b5a966ee894ece3c7e2169fc23b5f3647fad1f650a43242d9fad268f2d03af`

Per case the exact invocation is:
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --repo <fixture> --rev <fixture-rev> --json > out-<id>.json 2> err-<id>.txt`

## Control results

| case | fixture rev | exit | sha_match | anchor_located | anchor_unique | byte_count_match | valid | occurrences |
|---|---|---|---|---|---|---|---|---|
| a encoded-sha-as-decoded | `b7faf25345bd48e5ae14606880387831c412a0cc` | 1 | false | true | true | true | false | 1 |
| a2 transfer-as-bytes (extra) | `40bfde901e280fd0b61978fd282829ed7f6fc52b` | 1 | true | false | false | true | false | 0 |
| b line 186 | `26d42ddf46104deab2ffeec03db6311141029be4` | 1 | true | false | true | true | false | 1 |
| b line 188 | `409e4e4f439a21e30cb88d285d50eed6d055be7a` | 1 | true | false | true | true | false | 1 |
| c receipt present, bytes absent | `3baa64d5bce5c1199859fbb2206a7b3dad0fb43b` | 2 | — | — | — | — | (no JSON, never valid) | — |
| d anchor text twice | `00d417635f0038b52c182e5284498c6393523f65` | 1 | true | true | false | true | false | 2 |

### (a) receipt `decoded_sha256` = sha of the ENCODED base64 transfer

Command (as run by the driver):
```
ENC_SHA=$(base64 -w0 <bytes> | sha256sum | cut -d' ' -f1)
# receipt override: {"decoded_sha256":"$ENC_SHA","decoded_bytes":73952}; bytes file = decoded bytes
node scripts/check-s106-evidence.mjs --repo fx-a-IN6i --rev b7faf253... --json
```
Key JSON: `"decoded_sha256_claimed":"f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03"`, `"decoded_sha256_observed":"9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44"`, `"sha_match":false`, `"anchor_located":true`, `"anchor_unique":true`, `"byte_count_match":true`, `"valid":false`, exit 1.

Corroboration that `f17347b2…` really is the encoded-transfer digest (and not an arbitrary string): `base64 -w0 <bytes> | wc -c` → `98604`, matching `receipt.encoded_bytes=98604`; `base64 -w0 <bytes> | sha256sum` → `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03`, identical to `receipt.encoded_sha256`. So the arm models the exact round-25 defect (encoded-transfer hash recorded as if it were the decoded hash) and the gate rejects it on `sha_match` alone — the other three predicates are true, so the rejection is isolated to the intended predicate.

### (a2) extra arm — committed bytes are the base64 transfer itself (the round-25 plain-text misread)

Receipt `decoded_sha256` = encoded sha (`f17347b2…`), `bytes_path` holding the 98604-byte base64 transfer, `decoded_bytes=98604`.
Key JSON: `"sha_match":true`, `"anchor":{"line":187,...,"occurrences":0}`, `"anchor_located":false`, `"anchor_unique":false`, `"valid":false`, exit 1. A reader that treats the transfer as decoded text cannot pass even when its hash is internally consistent, because the anchor is not locatable.

### (b) anchor line off by one, both directions

Bytes unchanged (`sha256 9b93fe…`, `sha_match:true`), only `anchor.line` mutated.
- `line:186` → `"anchor":{"line":186,...,"occurrences":1}`, `"anchor_located":false`, `"anchor_unique":true`, `"valid":false`, exit 1.
  (`sed -n '186p'` on the bytes is `// Enable using the BackForwardCache.`, the comment, not the anchor text.)
- `line:188` → `"anchor":{"line":188,...,"occurrences":1}`, `"anchor_located":false`, `"anchor_unique":true`, `"valid":false`, exit 1.
  (`sed -n '188p'` is neither anchor nor comment.)
Both directions rejected; the line number is not tolerated as a range or nearest-match.

### (c) receipt present, bytes file absent

Receipt copied unchanged (`bytes_path` = `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`), bytes file not created, committed.
Command: `node scripts/check-s106-evidence.mjs --repo fx-c-gKGJ --rev 3baa64d5... --json`
Observed: stdout 0 bytes (`wc -c out-c-missing-bytes.json` → `0`), exit 2, stderr:
`S106_EVIDENCE verdict=could-not-evaluate detail=decoded bytes absent at 3baa64d5bce5c1199859fbb2206a7b3dad0fb43b: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`
No `valid` key is ever emitted on this path → never valid, matching the kill rule.

### (d) anchor text repeated twice in the file

Fixture bytes = real decoded bytes plus an appended second copy of the anchor line (`printf '\nBASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);\n' >> …`), receipt re-hashed to the new blob (`decoded_sha256=dc013f5f0340dc10d968182c3f297d5e382957b2a2f3e3c9e55dd3629c6ea138`, `decoded_bytes=74020`) so that `sha_match` and `byte_count_match` stay true.
Key JSON: `"sha_match":true`, `"anchor":{"line":187,...,"occurrences":2}`, `"anchor_located":true`, `"anchor_unique":false`, `"valid":false`, exit 1. Uniqueness is the sole failing predicate — the gate does not accept "at least one occurrence".

## (e) Recorded naive reachability check

```
grep -c BackForwardCache /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-25/bfcache/events.jsonl
```
Observed: `1` (exit 0). Same file at the pre-claim baseline, via git: `git show f185b4e7ab10cd9e8925e8ec614c9c111772357d:corpus/evidence/round-25/bfcache/events.jsonl | grep -c BackForwardCache` → `1`.

The single match is line 58, a `Page.frameNavigated` CDP event whose frame `"type":"BackForwardCacheRestore"` (extracted with `node -e` over `split("\n")[57]`); it contains no `BASE_FEATURE` source line, no digest and no receipt.

Why this check cannot satisfy the real counter (`node scripts/check-s106-evidence.mjs --rev <REV> --json` → `valid:true` with `present/sha_match/anchor_located`):
1. **Wrong artifact.** It scans a round-25 runtime event capture; the counter reads `corpus/evidence/round-26/sources/s106.json` and the decoded source blob at `bytes_path`, recomputing sha256 over it and locating the anchor at line 187. No path, digest or line is shared.
2. **Not discriminating.** The naive count is already `1` at baseline `f185b4e7…`, where the gate does not exist (`git cat-file -e f185b4e7…:scripts/check-s106-evidence.mjs` → absent; `git cat-file -e` on the receipt and bytes → present). A do-nothing round scores the same `1`; the value cannot express any before/after of C2.
3. **Not kill-rule capable.** In fixture c (receipt present, bytes absent, gate exit 2) a scratch copy of `events.jsonl` still yields `grep -c BackForwardCache` → `1`: the naive check is satisfied in exactly the state the gate must refuse. It can never produce exit 2 or "never valid".
4. **Satisfiable by unrelated text.** Matching-line counts elsewhere: `grep -c BackForwardCache scripts/check-s106-evidence.mjs` → `3`, `corpus/evidence/round-26/sources/s106.json` → `3`, `SKILL.md` → `1`, `LOG.md` → `2`. Deleting the evidence leaves these matches intact, so the predicate is not tied to evidence presence at all.

Conclusion: recorded in `claims.json` C2 `killRule` as a false positive — confirmed. The gate itself refuses the corresponding states (a/b/c/d).

## Independent corroboration — prior fixture set in the same scratch dir

The scratch dir already contained a fixture set from an earlier `ExecC2Controls` instance (mtimes `2026-10-25 14:32:33`–`14:34:31`, before this instance's first command): `fixtures.js`, `fixtures.json`, `a-encoded-transfer.b64` (99902 B), `a-encoded-unwrapped.b64` (98604 B), `gate-head-336d5d1c.mjs`, and repos `a-encoded-sha`, `a2-authentic-encoded-sha`, `a3-encoded-sha-decoded-bytes-count`, `b-anchor-186`, `b-anchor-188`, `c-missing-bytes`, `d-anchor-duplicate`, `f-path-escape`, `f2-absolute-path`. This seat did not create them; it re-ran the gate against them read-only (committed blobs only), producing a second, independently constructed pass:

```
node scripts/check-s106-evidence.mjs --repo <prior-fixture> --rev <fixtures.json rev> --json
```

| prior case | rev | exit | sha_match | anchor_located | anchor_unique | byte_count_match | valid |
|---|---|---|---|---|---|---|---|
| a | `724a6f9b031745cbfd862228d4f85d079bf732a5` | 1 | false | true | true | false | false |
| b186 | `4fad8ffdf12b1febf2489e8eb45a98fa7d2175fb` | 1 | true | false | true | true | false |
| b188 | `f2f9963a4a9407831c1ed39ac3aefe4835b64372` | 1 | true | false | true | true | false |
| c | `60eb21af5882f26b398874119e9ad07961140530` | 2 | — | — | — | — | no JSON |
| d | `f31d7e08a8dfdc44a1a5e17cd1e71a13ed415b0d` | 1 | true | true | false | true | false |

Outcomes agree with this seat's fixtures on every predicate of interest. Note the prior `a` used `base64 -w76` (99902 B, sha `da18af2fd0a03ba0c1340507d091eb4f6f4e3c12584cb650b1c4559fafc4ddc0`, reproduced by this seat's `enc76.b64` probe), so its `byte_count_match` also failed; this seat's `a` uses `base64 -w0` (98604 B, sha `f17347b2…`), which matches the receipt's `encoded_sha256`/`encoded_bytes` exactly and isolates `sha_match`.

Path-escape arms (prior fixtures, re-run by this seat): `bytes_path` `../../../etc/hostname` and `/etc/hostname` both exit 2 with `verdict=could-not-evaluate` and 0 stdout bytes. Direct git ground: `git -C f-path-escape show HEAD:../../../etc/hostname` → exit 128, `fatal: '../../../etc/hostname' is outside repository at '<fixture>'`; `git -C f2-absolute-path show HEAD:/etc/hostname` → exit 128, `fatal: path '/etc/hostname' exists on disk, but not in 'HEAD'` (host file size 9 B, never read). `git show` is tree-relative, so a receipt cannot pull host filesystem bytes into the hash.

## Additional observation — the counter is revision-relative

```
node scripts/check-s106-evidence.mjs --rev f185b4e7ab10cd9e8925e8ec614c9c111772357d --json   # exit 0, valid:true
node scripts/check-s106-evidence.mjs --rev 5577d1b6fe2dc298486e354b5416d38acafeffaa --json   # exit 0, valid:true
node scripts/check-s106-evidence.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json   # exit 0, valid:true
```
All three report `present:true, sha_match:true, anchor_located:true, anchor_unique:true, byte_count_match:true, valid:true, decoded_bytes:73952`. Because the receipt and decoded bytes already exist at the baseline rev, the gate pointed backwards at `f185b4e7` also returns `valid:true`. This does not falsify C2's after-state (`valid=true` at `5577d1b6…` and at the tip — reproduced, exit 0), but it means the counter values alone do not encode the claim's delta; the `before: 0 (gate absent)` arm rests on gate-file absence at the baseline (`git cat-file -e` fails, recorded above), not on the gate returning `false`. Reported as an observation, not a failure.

## Concurrent tracked-file drift (not caused by this seat)

At run start `git status --porcelain` showed only the round-27 untracked wave files. During the run the following appeared, with mtimes inside the wave window (`date -Is` → `2026-10-25T14:38:03-03:00`):
```
 M corpus/QUALITY.md                                         mtime 2026-10-25 14:37:50 -0300
 M corpus/knowledge/redirect-and-retry-after-semantics.md    mtime 2026-10-25 14:36:52 -0300
?? scripts/report-contract.mjs                               mtime 2026-10-25 14:37:24 -0300
git diff --stat → 2 files changed, 15 insertions(+), 18 deletions(-)
```
This seat ran no edit/write against those paths (its only writes are this report and `scratch/ExecC2Controls/`), so the changes are concurrent-seat or L1 activity. Flagged for the L1's post-integration gate: wave-1 output is supposed to be report/scratch only, and a dirty tracked tree will contaminate any working-tree-based counter.

## Risks / limitations

- The fixtures copy the shipped receipt and bytes; they do not re-fetch chromium (no external GET was authorized for this item and none was attempted).
- Control (a) uses `decoded_bytes=73952` with the encoded sha, isolating `sha_match`; it does not model an incorrectly recorded byte count. The shipped gate checks that separately (`byte_count_match`) and it was `true` in all decoded-byte fixtures here.
- Case c's fixture working tree additionally holds an untracked post-commit copy of `events.jsonl` used only for the naive-grep demonstration (`git -C fx-c-gKGJ status --porcelain` → `?? events.jsonl`); the gate reads committed blobs only, so the measured exit 2 is unaffected.
- No blockers. No nested dispatch, no credential/session reads, no writes outside the report and scratch.

## Artifacts (scratch, throwaway)

Created by this seat under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/ExecC2Controls/`: `run-controls.sh`, `exits.txt`, `out-<case>.json`, `err-<case>.txt`, `encprobe-vLlt/enc0.b64|enc76.b64`, and fixture repos `fx-a-IN6i`, `fx-a2-p96R`, `fx-b186-yXQh`, `fx-b188-IEg0`, `fx-c-gKGJ`, `fx-d-sSgW`.

Pre-existing from the earlier instance (not created, not modified by this seat; read-only re-run): `fixtures.js`, `fixtures.json`, `a2.js`, `a-encoded-transfer.b64`, `a-encoded-unwrapped.b64`, `gate-head-336d5d1c.mjs`, and repos `a-encoded-sha`, `a2-authentic-encoded-sha`, `a3-encoded-sha-decoded-bytes-count`, `b-anchor-186`, `b-anchor-188`, `c-missing-bytes`, `d-anchor-duplicate`, `f-path-escape`, `f2-absolute-path`.
