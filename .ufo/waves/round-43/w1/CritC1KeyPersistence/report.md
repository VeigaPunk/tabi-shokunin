# CritC1KeyPersistence — private-key non-persistence audit

## Result

The frozen C1 predicate ends: **“no private half of either per-invocation signing key is persisted by any chain component.”** Read as a component-controlled persistence invariant (no private half written into chain files/receipts or passed through child argv/env/IPC), the source satisfies it. I found no in-scope write or launch path that carries either private half.

This is not a guarantee that key material is zeroed from process memory or cannot be captured by an OS-level memory/core-dump mechanism. Node.js `KeyObject` has no zeroization call in these sources; GC/process exit does not establish wiping of OpenSSL/native copies. The frozen residual model excludes process-memory/kernel attacks. A stronger host-wide claim about swap, core dumps, or crash collection is not established by this source audit.

## Key flow and persistent outputs

- **Wrapper/run key** — `measure-c1-round43.mjs:202-206` generates the per-invocation pair and exports only `runPub` as SPKI PEM. `runPriv` is used only as the key argument to `crypto.sign` at `:283` and `:304`; no private-key export/serialization call exists. The measure record at `:268-286` contains `pubkeys.wrapper`, `pubkeys.witness`, and a signature hex value—not either private key. The challenge response sends only the Ed25519 signature hex plus newline over fd4 (`:304-305`), not the private key.
- **Witness key** — the inline child program at `measure-c1-round43.mjs:124-163` generates its own pair at `:137`; signs at `:159`; exports only the public key and signature into `doc.attestation` at `:160`; and writes that document at `:161`. The wrapper receives the witness public key/signature from this file, never the witness private half.
- **Receipt and result** — the driver receipt contains fixture/run/socket/browser observations and the public nonce, not signing-key fields (`playwright-firefox-egress-round43.mjs:432-457`). The wrapper's returned/logged result is a counter result and hashes/status/gate metadata (`measure-c1-round43.mjs:316-330`). Counter output contains predicate/verification results, not the parsed measure record or key material (`c1-signature-bound-v5.mjs:267-274`). The persisted signatures are public verification artifacts, not private-key bytes.

### Complete source write inventory

Searches covered `writeFileSync|writeSync|appendFile|createWriteStream|appendFileSync|mkdirSync|mkdtempSync|rmSync|openSync` in each component.

- Wrapper (`measure-c1-round43.mjs`): inline witness `fs.writeFileSync(out, …)` at `:161`; refusal record `fs.writeFileSync(outPath.replace(...), …)` at `:184`; directory creation at `:215, :238-240`; signed measure record `fs.writeFileSync(measurePath, measureRaw)` at `:286`. The refusal writer's call sites at `:216, :231, :253, :257, :260, :263, :314` provide gate/digest/status/error/output metadata, not key objects. No `appendFile*` or file stream writer is present.
- Driver (`playwright-firefox-egress-round43.mjs`): refusal receipt `writeFileSync(out, …)` at `:423`; scratch/profile directory creation and cleanup at `:428-431`; normal receipt `writeFileSync(out, …)` at `:457`. Neither receipt object includes a key. No append/file-stream writer is present.
- Counter (`c1-signature-bound-v5.mjs`): no file writer. `fs.writeSync(3, challenge)` at `:249-251` writes the counter's fresh 32-byte challenge to the inherited fd3 pipe, not to a file; the wrapper returns a signature on fd4. It does not receive a private key.

Other filesystem mutations are directory/profile creation or scratch cleanup only. None has key bytes as data.

## Child argv/environment inventory

- Wrapper module initialization: `execFileSync('getconf', ['CLK_TCK'], …)` at `measure-c1-round43.mjs:64`; no explicit env, and no key exists in its argv.
- Environment probe: `spawnSync(process.execPath, ['--eval', GATE_SRC], { env: scrubEnv(), … })` at `:90-92`; source is a gate probe, with no key.
- Witness launch: `spawn(process.execPath, ['--eval', WITNESS_SRC], { env, … })` at `:165-168`. The env is the allow-listed `scrubEnv` plus `TABI_WITNESS_OUT`, `TABI_WITNESS_ROOT`, and `TABI_RUN_NONCE` (`:102-106, :166`). The argv carries source text that generates a key later in the child, not generated key bytes. Nested witness `getconf` and `ps` calls are in `WITNESS_SRC` at `:133, :141`; they do not set env and inherit only the witness's scrubbed environment.
- Driver launch: `spawnSync(process.execPath, [DRIVER, '--out', outPath, '--runs', '2', '--scratch', scratchPath, '--nonce', nonce], { env: scrubEnv({ TABI_RUN_NONCE: nonce, HYAKU_SCRATCH: scratchPath }), … })` at `:243-245`. Only paths, run count, and nonce are in argv/env.
- Counter launch: `spawn(process.execPath, [COUNTER, outPath, '--measure', measurePath], { env: scrubEnv(), … })` at `:292-295`. No key is in argv/env; the only key-derived IPC payload is the signature described above.
- Battery-only paths: `spawnSync('/bin/bash', ['-c', …], { env: scrubEnv(), … })` at `:356-358` and clean `spawnSync(process.execPath, [SELF, '--battery-probe'], { env: scrubEnv(), … })` at `:363`. These probe environment handling and do not generate/use signing keys.
- Driver utilities: `execFileSync('getconf', ['CLK_TCK'], …)` at `playwright-firefox-egress-round43.mjs:40`; `spawnSync('ps', ['-eo', 'pid=,ppid='], …)` at `:98-100`; `spawnSync('ss', ['-Htnp'], …)` at `:160-162`; and `spawnSync('ss', ['-Hlt'], …)` at `:383-384`. No explicit env is supplied; these inherit the driver environment (which receives the nonce, not a key). `firefox.launch({ headless: true, firefoxUserPrefs: … })` at `:286` has no explicit key, argv, or env option. The counter has no child-process launch.

The searches also covered `generateKeyPairSync|privateKey|runPriv|crypto.sign|.export(|writeFileSync|writeSync|.write(`. The only two keypair generations are the wrapper and witness sites above; the only private-key uses are the corresponding `crypto.sign` calls.

## Counterexample, evidence, axes, correction

- **Counterexample considered:** both private `KeyObject`s exist in process memory while signing; the sources do not wipe them, and JavaScript/Node cannot certify native-memory zeroization. This defeats any reading that the clause promises no transient/native-memory copies or immunity to OS memory capture, but does not demonstrate persistence by a chain component's controlled write/launch paths. The explicit frozen residual model excludes process-memory/kernel attacks.
- **Evidence:** source line references above; frozen digests independently matched the current three source files (command/output below). Inspection was read-only; the chain was not executed, so no runtime/crash-dump behavior is claimed.
- **Impacted axes:** coverage (C1 only); no separate C2/calibration impact identified.
- **Smallest safe correction:** no source change or frozen-claim amendment is warranted for the component-level non-persistence reading. Keep memory zeroization and host-managed dumps explicitly outside the claim/model; if the intended meaning includes those, this static audit cannot certify it and it must be routed as a finding rather than changing frozen bytes.

## Commands and outputs

Read-only source search patterns used across the three named files: `writeFileSync|writeSync|appendFile|createWriteStream|appendFileSync|mkdirSync|mkdtempSync|rmSync|openSync`; `\b(spawn|spawnSync|execFileSync|execFile|fork)\s*\(`; and `generateKeyPairSync|privateKey|runPriv|crypto\.sign|\.export\(|writeFileSync|writeSync|\.write\(`. No chain/counting command, tests, or checkers were run. No tool was installed or updated.

Exact shell command run (creates and removes only the specified scratch root, then hashes the three read-only sources):

```sh
S=/fast/scratch/hyaku/tabi-r43/CritC1KeyPersistence; mkdir -p "$S"; trap 'rm -rf -- "$S"' EXIT; sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round43.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
```

Observed stdout:

```text
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
```

VERDICT ok no chain-controlled write, argv, env, receipt, or IPC path persists either private half; runtime memory zeroization is not guaranteed.