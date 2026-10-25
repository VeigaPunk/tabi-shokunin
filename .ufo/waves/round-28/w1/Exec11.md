# Exec11 — item 11: C1 do-nothing control at baseline

- Seat: Exec11 / item 11, executor, wave tabi-r28-w1.
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (HEAD == baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, verified below).
- Frozen claims read: `.ufo/waves/round-28/claims.json` (absolute `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`), claim C1 on line 11; C1 control text: "Do-nothing control: unchanged gate selftest is 5, below target." (line 11, same JSON object).
- Scope: C1 only (do-nothing control: selftest count and target gate validity at baseline). No code changes; no repair; no installs performed.

## 1. Commands and exact output

### 1.1 Baseline identity (observation)
```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
eb23c0b84668afc48ebab8bd7e4a8a4457407cc4
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -t eb23c0b84668afc48ebab8bd7e4a8a4457407cc4
commit
```
Observation: lane working tree HEAD equals the frozen baseline commit; `git status --porcelain` shows exactly one line, `?? .ufo/waves/round-28/` (pre-existing untracked orchestration material), before and after this control — no tracked changes introduced.

### 1.2 Selftest at baseline (unchanged code), plain:
```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node --version
v24.21.0
$ node scripts/check-s106-evidence.mjs --selftest
CASE id=clean-fixture-valid expected_exit=0 exit=0 valid=true PASS
CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=anchor-off-by-one-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=missing-bytes-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=decoded bytes absent at 6919b381cf5c29497ba1d0660906f948a4076307: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc PASS
CASE id=missing-receipt-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=receipt absent at 132389054d19c646e4d5834597f6a8e9844eeecb PASS
S106_SELFTEST verdict=clean cases=5 passed=5
SELFTEST_EXIT=0
```

### 1.3 Selftest at baseline, JSON (`--selftest --json`, exit 0):
```
{
  "schema": "tabi-s106-evidence-selftest-v1",
  "cases": 5,
  "passed": 5,
  "results": [
    {"id":"clean-fixture-valid","ok":true,"expectedExit":0,"exit":0,"valid":true,"refusal":null},
    {"id":"sha-mismatch-invalid","ok":true,"expectedExit":1,"exit":1,"valid":false,"refusal":null},
    {"id":"anchor-off-by-one-invalid","ok":true,"expectedExit":1,"exit":1,"valid":false,"refusal":null},
    {"id":"missing-bytes-could-not-evaluate","ok":true,"expectedExit":2,"exit":2,"valid":null,"refusal":"decoded bytes absent at 6919b381cf5c29497ba1d0660906f948a4076307: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc"},
    {"id":"missing-receipt-could-not-evaluate","ok":true,"expectedExit":2,"exit":2,"valid":null,"refusal":"receipt absent at 132389054d19c646e4d5834597f6a8e9844eeecb"}
  ],
  "ok": true
}
```

### 1.4 Runtime gate at baseline commit (target gate validity), plain:
```
$ node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4
S106_EVIDENCE verdict=valid rev=eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 present=true sha_match=true anchor_located=true valid=true
GATE_BASELINE_EXIT=0
```

### 1.5 Runtime gate at baseline commit, JSON (exit 0):
```
{
  "schema": "tabi-s106-evidence-v1",
  "rev": "eb23c0b84668afc48ebab8bd7e4a8a4457407cc4",
  "receipt": "corpus/evidence/round-26/sources/s106.json",
  "bytes_path": "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc",
  "present": true,
  "decoded_bytes": 73952,
  "decoded_sha256_claimed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "decoded_sha256_observed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "sha_match": true,
  "anchor": {"line": 187, "text": "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", "occurrences": 1},
  "anchor_located": true,
  "anchor_unique": true,
  "byte_count_match": true,
  "valid": true
}
```

## 2. Findings (observation vs inference vs unknown)

1. OBSERVED: unchanged selftest at baseline reports `cases=5 passed=5` (exit 0). This matches claim C1's `before` ("5 cases at baseline eb23c0b84668afc48ebab8bd7e4a8a4457407cc4") and its `control` ("unchanged gate selftest is 5, below target"). The C1 target of ≥7 cases is therefore unmet at baseline; count increase requires the claim implementation.
2. OBSERVED: both missing-source CNE cases exist at baseline and pass: `missing-bytes-could-not-evaluate` and `missing-receipt-could-not-evaluate`, each exit 2 / valid null. Consistent with claim C1 "Preserve fetch-failure as could-not-evaluate" and kill rule "Missing source fetch remains could-not-evaluate."
3. OBSERVED: runtime gate at the baseline commit evaluates `valid=true` (exit 0) with sha_match, anchor_located, anchor_unique, byte_count_match all true; decoded bytes 73952; decoded sha256 claimed == observed `9b93fe64…`.
4. INFERENCE (from 1.3 case-id enumeration): no revision-mismatch or revision-match fixture exists in the selftest today; the five present case ids are clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate. The C1 red/green revision controls are absent.
5. INFERENCE (from reading the receipt `corpus/evidence/round-26/sources/s106.json` wholesale): the receipt carries no revision identity field — its top-level keys are `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`. The gate reads receipt and bytes at the same supplied `--rev` (`readBlob(repo, rev, …)` in `evaluate`), so evaluation is revision-anchored only by the caller's argument, not by any committed receipt-stated revision; the claim's "runtime gate at its committed target receipt remains valid" cannot be distinguished at baseline from validity at an arbitrary rev. (The receipt's `fetched_at` is a timestamp, not a git revision.)
6. OBSERVED (negative, with sweep): `git status --porcelain` output was exactly `?? .ufo/waves/round-28/` both before and after this control (only that one untracked entry; no tracked diffs). The selftest creates and removes its fixture trees via `mkdtempSync` under the OS temp dir (`rmSync` in `finally`); no lane write observed.
7. Unknown: nothing in this control establishes behavior of the future revision-binding gate; unknowns are the post-implementation case count and red/green verdicts, which are the claim's `after` targets, not baseline facts.

## 3. Tooling report
- No tools installed or updated. Node pre-existing at v24.21.0 (channel: pre-existing, no action). No pacman transaction.
- Exact commands recorded above; outputs verbatim.

## 4. Risks / notes
- The control strongly confirms the claim's premise: selftest count is 5 (< target 7); both CNE cases are present; runtime gate passes at baseline. No blocker observed for the C1 implementation; the missing revision binding is corroborated but is the C1 implementation's scope, not repaird here.
- This report is advisory; no production code was changed.

## 5. Evidence map
| Number | Command | Kind |
|---|---|---|
| selftest cases=5 passed=5 | `node scripts/check-s106-evidence.mjs --selftest` (plain + `--json`) | observation |
| gate valid at baseline, exit 0 | `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (+ `--json`) | observation |
| HEAD == baseline | `git rev-parse HEAD` | observation |
| no tracked changes | `git status --porcelain` (single pre-existing untracked `.ufo/waves/round-28/`) | observation (negative, swept) |
| receipt lacks revision field | full read of `corpus/evidence/round-26/sources/s106.json` (keys enumerated above) | inference from file contents |
