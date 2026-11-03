# R56Counter — C2 frozen counter (chromium-keyevent-control-keys-linux)

Seat: `R56Counter`, executor (leaf). Lane base `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`. No commit, no git/jj mutation.

## Deliverables (absolute paths)

| path | role | sha256 / count |
|---|---|---|
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/counters/chromium-receipt-r56.mjs` | frozen counter | `4ed809a83cef7034c7152c617ce263913451d8628ca3cb3ecd9be880e2a492d2` (25076 bytes) |
| `.ufo/waves/round-56/counters/chromium-receipt-r56-fixtures/` | 38 fixture cases | 35 refusal + 3 pass cases |
| `…-fixtures/receipts/` | 33 receipt JSON + 6 step PNGs + `notpng.bin` + `bad.json` | 41 files |
| `…-fixtures/driver-stub.mjs` | fixture-only driver stand-in for the sha binding | `e444778c24c41fb58350da1da8b2b0f8a2184729e82f5e71d2dc690641c2c0e0` |
| `.ufo/waves/round-56/w1/R56Counter/` | this seat's run receipts | 8 files |

Counter implements the frozen predicate verbatim: schema `tabi-chrome-cdp-r56`, nonce `^tabi-r56-[0-9a-f]{16}$` and invocation-bound, `driverSha256` == re-hashed `--driver` bytes AND `--expect-driver-sha256`, throwaway `--user-data-dir` = `…/profile-<host.launchToken>`, plain-trace prefixes, End negative witness, Backspace exact residue, exact restore, Tab `field -> field2`, one Enter implicit submission witnessed server-side, `field3Value === ''`, keylog window length implied by the control domain, an `/echo` server-log entry, the six named steps in order with PNG bytes hashing to their pins and carrying the PNG signature, zero teardown survivors, and `receipt.predicate === true`.

26 frozen finding ids, exactly as specified; `--selftest` asserts **both** the per-case exact set and that every one of the 26 ids is exercised (`idCoverage`). Each frozen id is one entry (first detail kept, `occurrences` counted), so a fixture is an exact set; a step whose bytes fail both the sha pin and the signature reports both ids (they are separate frozen ids). Exit 0/1/2 as specified. Writes nothing but stdout (no `writeFileSync`, `mkdirSync`, `createWriteStream`, `rmSync`, `unlinkSync` anywhere in the file: `grep` returns none).

## Verification actually run

| command | exit |
|---|---|
| `node --check chromium-receipt-r56.mjs` | 0 |
| `node chromium-receipt-r56.mjs --selftest` | 0 — `38/38` |
| `node chromium-receipt-r56.mjs --self-check` | 0 |
| `node chromium-receipt-r56.mjs <absent> --driver scripts/chrome-cdp-loopback-round56.mjs --json` | 1 (do-nothing control) |
| `node … fixtures/receipts/green-synthetic.receipt.json --driver …/driver-stub.mjs --json` | 0, predicate true, 0 findings |
| `node … round-55/counters/webview2-receipt-r55-fixtures/control-end-witness-wrong.json --driver <r56 counter>` | 1 (cross-schema refuse) |
| r55 receipt relabelled `schema=tabi-chrome-cdp-r56`, body untouched | 1 — `nonce-shape,driver-sha-mismatch,profile-not-throwaway,plain-trace-missing,control-domain-missing,field3-not-empty,keylog-missing,server-log-missing,nonce-not-invocation-bound,steps-missing,png-missing` |
| selftest teeth (scratch copies): perturb green expectation → 35/36 + named failure; delete `driver-missing.json` → `idCoverage.uncovered ["driver-missing"]`, allPass false | harness discriminates |

Do-nothing run, verbatim:

```
{
 "schema": "tabi-chrome-cdp-r56-counter",
 "receipt": "/fast/scratch/hyaku/tabi-r56/R56Counter/absent-receipt.json",
 "driver": "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round56.mjs",
 "shotDir": "/fast/scratch/hyaku/tabi-r56/R56Counter",
 "nonce": null,
 "predicate": false,
 "findingCount": 1,
 "findings": [
  {
   "id": "receipt-missing",
   "detail": "/fast/scratch/hyaku/tabi-r56/R56Counter/absent-receipt.json",
   "occurrences": 1
  }
 ],
 "couldNotEvaluate": []
}
```

Three authoring do-nothing controls (all refuse; exact sets asserted in the selftest): empty object `{…: 12 ids}`, nonce missing `[nonce-shape, plain-trace-wrong, control-backspace-witness-wrong, control-restore-witness-wrong, control-enter-submit-wrong, nonce-not-invocation-bound]`, wrong `driverSha256` `[driver-sha-mismatch]`.

## Fixture inventory

35 refusals: one per frozen id (26), extras for each control-witness leg (`-flag`/`-value` end, `-empty` backspace, `-null` restore, plus enter/tab/keylog/second png variants), `expect-driver-sha-mismatch`, and the three authoring controls. Pass cases: `green-synthetic.json` (the one hand-authored from the schema — stated synthetic in its note and in the counter header) plus two pass-branch controls that re-drive **that same** receipt through `--expect-driver-sha256` and `--shot` so the pass branch is shown not to be over-strict on the two CLI paths the live data run uses.

## Findings for the L1 (fold before the data pass)

1. **`nonce-not-invocation-bound` cannot fire alone.** The frozen control checks require `restore.valueAfter === nonce`, which puts the nonce in the typed values by construction; an unbound nonce therefore always co-fires with a missing/failing control domain. The fixture declares the exact collateral set (`control-domain-missing` + `nonce-not-invocation-bound`) and the reason. The check is still load-bearing against a log-only forgery.
2. **Plain-trace residual (declared, not weakened).** The frozen clause only requires each `valueAfter` to be a prefix of the nonce of *its own length*; a trace that stops early passes that clause. Caught only by the control-domain witnesses and the binding. Strengthening it would be a post-freeze predicate change, so it is not done — recorded in the counter header.
3. **`keylog` contract confirmed against R56Runner (binding).** `keylog` = the 4-entry control-domain slice `[End, Backspace, restored char, Tab]` read before Enter; `length === entries.length === 4`; `window={start,end}` absolute with `end-start === 4`; Enter's own keydown is **not** in the window. `controlDomain.enter.serverSawField` is the string the server saw (`=== nonce`), `serverSawField2 === ''`, `submitted === true`; `host.argv` is an array; `--user-data-dir=<abs>/profile-<launchToken>`, token 12 hex; `steps[].png` basenames beside the receipt. Counter matches all five.
4. **`--shot` accepted** (directory, or one path per step) because the frozen C2 `after` command passes it. It never relaxes a check: bytes found that way are still hashed against the step pins and signature-checked (fixtures `shot-files-override-green`, `shot-files-override-sha-mismatch`).
5. **Recommendation for the data pass:** add `--expect-driver-sha256 <sha256 of scripts/chrome-cdp-loopback-round56.mjs at the freeze commit>` to the run so the receipt's self-declared driver digest is pinned to committed bytes rather than to itself.
6. **Runner integration checked on real bytes.** `scripts/chrome-cdp-loopback-round56.mjs` landed (sha256 `183c2050a56f26adc8c086664299a4ac1911093cc1f81f9af46a9163617bbbae` at read time) and its own smoke receipt (`/fast/scratch/hyaku/tabi-r56/R56Runner/smoke/receipt.json`, a real Chromium run in the runner's scratch, **not** corpus evidence) scores **exit 0, predicate true, 0 findings**. The same receipt with `--expect-driver-sha256 <runner sha>` is also green, and with a wrong pin refuses `[driver-sha-mismatch]`. Receipt top-level keys are exactly the 13 of the frozen schema; `keylog.length` 4, `window` `{25,29}`; steps `a-start,b-typed,c-end-witness,d-backspace,e-tab,f-enter-echo`. The runner sha must be re-read and pinned at the freeze commit — the runner may still change before it. The authoritative green is still the L1's live data receipt; no witness was weakened to reach any green.

## Tooling / cleanliness

No installs, no upgrades (pacman paused host-wide; nothing needed). No `/tmp` writes. Scratch `$HYAKU_SCRATCH/tabi-r56/R56Counter/` held the one-off fixture generator (`gen.mjs`) plus prompt extracts and teeth copies; teeth copies and the generator are removed, prompt extracts remain and are disposable. Fixture set is now static on disk; nothing outside the two owned paths and `.ufo/waves/round-56/w1/R56Counter/` was written.
