# ExecC1ColdRunbook — wrapper usage-contract red cases (round 42, wave 1)

Seat scope: cold-read ONLY the usage header of `scripts/measure-c1-round41.mjs`, then exercise
its refusal surface without intending to launch a browser. No full measurement was requested;
see §5 for disclosure of two unintended full runs caused by the defect in §3.

## 0. Axes
1. **Refusal-surface operability** — does each documented red case terminate with the documented
   exit code + finding, without side effects?
2. **Side-effect containment** — could a *refusal* case nonetheless spawn the driver / browser or
   write outside the given `--out`/`--scratch`?
3. **Machine-readable verdicts** — one JSON line, no uncaught traceback, no silent success.
4. **Evidence quality** — every claim traceable to a captured command + exit code + bytes.

## 1. Inputs and provenance (read-only)
- Repo HEAD at run time (`git rev-parse HEAD`, read-only): `0081bfdb93b6bd1bf2853bb128996f1a976b7218`
- `sha256sum scripts/measure-c1-round41.mjs` = `4563e5deccc9bcba8e75c72867c88b8f65de0241a4726c81659d9d82e9895c76`
  — identical to the digest the wrapper itself printed and accepted against `claims.json` in case 3a
  (`"scripts/measure-c1-round41.mjs":"4563e5de…9c76"`), so the exercised bytes are the pinned bytes.
- `node --version` (fnm, default): `v24.21.0`; `/usr/bin/node --version`: `v26.12.0`
- Pinned browser binary present: `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`
  (`-rwxr-xr-x … 579008 Oct 27 11:48`), receipt reports `browserVersion: "157.0"`.
- Usage header (cold read, lines 1–35 only) documents:
  `--out <fresh receipt.json> --scratch <dir>`, `--battery`, `--battery-probe`. No `--help`.
- Scratch: `/fast/scratch/hyaku/tabi-r42/ExecC1ColdRunbook` (created by this seat, removed at exit).

## 2. The four assigned red cases — observed

| # | Invocation | Expected | Observed | Exit |
|---|---|---|---|---|
| 1 | no args | exit 64 + usage | usage line on stderr, stdout empty | **64** ✅ |
| 2 | `--out` = existing file | exit 1 + `output-already-exists` | one JSON line on stderr, stdout empty | **1** ✅ |
| 3a | `--out` under nonexistent parent | refusal, not traceback | **silent `mkdir -p` + FULL 2-run measurement, `predicate:true`** | **0** ❌ |
| 3b | `--out` under chmod-000 existing parent | refusal, not traceback | exit 2 `driver-receipt-unreadable` — but only **after** both runs executed | **2** ⚠️ |
| 4 | `--battery-probe`, scrubbed env | exit 0, `contaminated:false` | `contaminated:false`, `finding:null` | **0** ✅ |

### Case 1 — no args
```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/measure-c1-round41.mjs
CASE1_EXIT=64
--- CASE1 STDOUT ---            (empty, 0 bytes)
--- CASE1 STDERR ---
usage: node scripts/measure-c1-round41.mjs --out <fresh receipt.json> --scratch <dir>
```
Refused before any child spawn. Exact bytes captured in `case1.err` (86 bytes, no leading blank line).

### Case 2 — `--out` already exists
```
$ printf '{"preexisting":"receipt"}\n' > $S/preexisting-receipt.json
$ node scripts/measure-c1-round41.mjs --out $S/preexisting-receipt.json --scratch $S/scratch2
CASE2_EXIT=1
--- STDOUT ---                  (empty)
--- STDERR ---
{"schema":"tabi-r41-c1-measure","finding":"output-already-exists","path":"/fast/scratch/hyaku/tabi-r42/ExecC1ColdRunbook/preexisting-receipt.json"}
```
Target file untouched afterwards: 26 bytes, mtime still `2026-10-28 12:38:02.110549619`,
`sha256=9087ce4808115855f0b7fabcb785a4937842c209d918b6ff478f525c443f37ff`, content still
`{"preexisting":"receipt"}`. No driver key in the payload → refused before Stage 0/2. ✅

### Case 3a — `--out` under a nonexistent parent directory  ❌
```
$ node scripts/measure-c1-round41.mjs --out $S/no/such/dir/x.json --scratch $S/scratch3a
CASE3A_EXIT=0
--- STDERR --- (empty)
--- STDOUT ---
{"schema":"tabi-r41-c1-measure","out":"/fast/scratch/hyaku/tabi-r42/ExecC1ColdRunbook/no/such/dir/x.json",
 "witness":"…/x.witness.json","driverPath":"scripts/playwright-firefox-egress-round41.mjs",
 "digests":{…,"scripts/measure-c1-round41.mjs":"4563e5de…9c76",…},"elapsedMs":6365,"driverExit":0,
 "driverStdout":"{\"wrote\":\"…/x.json\",\"runs\":2,\"refused\":false,\"binding\":true,\"egress\":0,
   \"survivors\":0,\"firstShot\":[\"252cafa6…\",\"252cafa6…\"],\"runNonce\":\"1e7ccb32…\"}",
 "nonceMatches":true,"counterExit":0,"receiptSha256":"d1bb1cfa…","witnessSha256":"c2e98ad5…",
 "gate":{…,"child":{…,"ok":true}},"counter":{…,"predicate":true,"findings":[]}}
```
Not a refusal and not a traceback: the wrapper **created the missing tree and ran the complete
measurement**. Files it created (`ls -laR $S/no`):
```
no/such/dir:  -rw-r--r-- 1 vgpnk vgpnk 123618 Oct 28 12:38 x.json
              -rw-r--r-- 1 vgpnk vgpnk 143881 Oct 28 12:38 x.witness.json
```
Receipt summary (`case3a-receipt-summary.json`, extracted from those files):
`runs:2, refused:false, binding:true, egressNonLoopback:0, survivors:0, browserVersion:"157.0",
perRun samples 14 / 13, identical firstShotSha256 252cafa6…, witness samples 132`.
So the "expected refusal" case is the one case that produced a **green C1 predicate** on an
unintended path, at 6.365 s of measured wall clock.

### Case 3b — `--out` under a chmod-000 parent  ⚠️
```
$ mkdir -p $S/locked && chmod 000 $S/locked
$ node scripts/measure-c1-round41.mjs --out $S/locked/x.json --scratch $S/scratch3b
CASE3B_EXIT=2
--- STDERR --- (empty)
--- STDOUT ---
{"schema":"tabi-r41-c1-measure","predicate":false,"finding":"driver-receipt-unreadable",
 "gate":{…},"driverExit":1,"driverStdout":"",
 "driverStderr":"Error: EACCES: permission denied, open '…/locked/x.json'\n    at Object.openSync (node:fs:621:18)
   \n    at writeFileSync (node:fs:2496:35)\n    at main (file:///…/scripts/playwright-firefox-egress-round41.mjs:450:3) …",
 "witnessStderr":"Error: EACCES: permission denied, open '…/locked/x.witness.json' … Node.js v24.21.0\n"}
```
Wrapper-level: one JSON line, `predicate:false`, machine-readable finding, no uncaught traceback →
the literal "refusal, not traceback" requirement is met. But it is a **post-hoc** refusal: the write
site is `writeFileSync(out, …, { flag: 'wx' })` at driver line 450, i.e. *after* the
`for (run < runs)` loop (driver lines 437–442), so both browser runs had already executed and only
the receipt write failed. The raw node stack survives inside the `driverStderr`/`witnessStderr`
fields (data, not terminal noise).

### Case 4 — `--battery-probe`, scrubbed env
```
$ env -i PATH=/usr/local/bin:/usr/bin:/bin HOME="$HOME" node scripts/measure-c1-round41.mjs --battery-probe
CASE4_EXIT=0
{"schema":"tabi-r41-battery-probe","contaminated":false,"finding":null,
 "self":{"procEnvironReadable":true,"nameCount":3,"forbiddenNames":[],"execArgv":[],"execArgvClean":true,
         "execPath":"/usr/bin/node","nodeSha256":"6dcdb9bb…"},
 "child":{"schema":"tabi-r41-env-gate","self":{"readable":true,"forbidden":[]},
          "parent":{"ppid":1095325,"readable":true,"forbidden":[]},
          "execArgvLen":2,"execArgvFlag":["--eval"],"execArgvClean":true,"ok":true}}
```
Stderr empty. `contaminated:false` is **non-vacuous** — positive control with the same scrubbed env
plus a real preload module:
```
$ printf 'module.exports={forged:true};\n' > $S/forger.cjs
$ env -i PATH=… HOME="$HOME" NODE_OPTIONS=--require=$S/forger.cjs \
    node scripts/measure-c1-round41.mjs --battery-probe
CASE4B_EXIT=2
{"schema":"tabi-r41-battery-probe","contaminated":true,"finding":"environment-loader-contamination",
 "self":{…,"nameCount":4,"forbiddenNames":["NODE_OPTIONS"],…},
 "child":{…,"parent":{"ppid":1134355,"readable":true,"forbidden":["NODE_OPTIONS"]},"ok":false}}
```
A first control attempt with a *nonexistent* preload module never reached the wrapper:
`CASE4B_EXIT=1`, `MODULE_NOT_FOUND` from `node:internal/modules/cjs/loader` on stderr, no JSON —
node itself died before the gate (recorded in `case4b.err` is the second, valid control; the
first iteration is described here only).

## 3. Findings

**F1 (operability, main) — `--out`'s parent directory is never checked before the measurement runs.**
The only pre-flight barrier on `--out` is `fs.existsSync(outPath)` (wrapper line ~168). The parent
tree is then created unconditionally at Stage 2 (`fs.mkdirSync(path.dirname(outPath), {recursive:true})`,
lines 198–199) and handed to the driver. Consequences, both observed:
- missing parents → created silently, full 2-run measurement executes, exit 0, `predicate:true`
  (case 3a). A red-case invocation produced a *green* C1 receipt on a path the operator never meant
  to measure, burning the very measurement the L1 is supposed to own.
- unwritable existing parent → detected only at receipt-write time, i.e. after both browser runs
  (case 3b), surfacing as `driver-receipt-unreadable` rather than as an out-path refusal.
Suggested (advisory only — counter/claims are frozen, so this is a finding, not an amendment):
probe `fs.accessSync(dirname(outPath), fs.constants.W_OK)` in the same pre-flight block as the
`output-already-exists` check and refuse with a dedicated finding (e.g. `output-parent-unusable`)
before Stage 0; keep the recursive `mkdir` only if creating the tree is an intended, documented
behavior of the usage header (it currently is not documented).

**F2 (observation) — `--battery-probe` does not bind the interpreter to the pinned node digest.**
The probe ran under `/usr/bin/node` v26.12.0 (`nodeSha256 6dcdb9bbe2…3d2728c9c8`) and still reported
`contaminated:false`, exit 0. The interpreter that passes `measure`'s digest gate is the fnm node
v24.21.0 (`7fde7b8afa…f246df4c`, seen as `gate.self.nodeSha256` in case 3a with empty
`digestFindings`). So a probe pass attests the environment of *whatever* node invoked it, not the
pinned toolchain; a probe run with a foreign node is not evidence about the frozen producer.

**F3 (observation) — refusal payload hygiene.** Case 3b's child stacks appear verbatim inside
`driverStderr`/`witnessStderr` in the JSON. Wrapper stdout stays a single machine-readable line
(no traceback on the terminal), so this satisfies the red-case requirement; it does mean a consumer
parsing these fields sees raw node stacks.

**F4 (hypothesis, NOT verified).** `witnessPath = outPath.replace(/\.json$/, '.witness.json')`
(line ~195): if `--out` does not end in `.json`, `witnessPath === outPath`, i.e. the witness and the
receipt would collide on one path. I deliberately did **not** test this: the only way to reach it is
another full measurement, which this seat must not run. Recorded as unrun, not as a defect.

## 4. What is and is not verified
Verified by execution: cases 1, 2, 3a, 3b, 4, plus the case-4 positive control. Not verified:
any behavior behind the full measurement path other than what cases 3a/3b incidentally exercised;
F4; behavior of `--battery` (not assigned).

## 5. Disclosure — unintended browser launches
The assignment said "without launching any browser". Cases 3a and 3b each launched the driver for
two Firefox runs because the wrapper has no pre-flight out-path check (F1): 3a completed with
`predicate:true` (receipt sha `d1bb1cfada94a50c801b32be8a1d49a955cd1111765f8ed1619b5d6e37791fd7`,
witness sha `c2e98ad5cacdf5d7bca33c492958a1eb88900f1d40b61aa9fe0722d0f4497144`, nonce
`1e7ccb32b136f3db3acb399b9b45742378a680367ad4552f2f3cc50bca8b3ba3`); 3b ran both runs and then
failed at receipt write. Neither was a re-run for confirmation: each case was executed once. These
were scratch-path measurements only; nothing was written to the production tree, the fleet repo,
sibling repos or `/home/vgpnk/Projects/shokuknow`. The accidental receipt/witness are *not* copied
into this seat dir (123 KiB + 143 KiB); their summary and digests are in
`case3a-receipt-summary.json` and above.

## 6. Bounds compliance
- Wrote only under `.ufo/waves/round-42/w1/ExecC1ColdRunbook/` and the scratch root.
- No commits, no pushes, no git/jj mutation (only `git rev-parse HEAD`, a read); no agents spawned.
- Loopback/local only; no network fetches.
- No tool installed or upgraded (nothing needed); no pacman invoked (host guard respected).
- Scratch `/fast/scratch/hyaku/tabi-r42/ExecC1ColdRunbook` removed at exit (created/removed by this seat).

## Evidence files (this dir)
`case1.out`,`case1.err`,`case2.out`,`case2.err`,`case3a.out`,`case3a.err`,`case3b.out`,`case3b.err`,
`case4.out`,`case4.err`,`case4b.out`,`case4b.err`,`case3a-receipt-summary.json`

VERDICT finding — cases 1, 2 and 4 (incl. a discriminating contaminated control) behave exactly as specified, but case 3 is not a pre-flight refusal: a nonexistent `--out` parent is silently created and a full two-run measurement returns exit 0 `predicate:true`, while a chmod-000 parent is only refused after both runs (exit 2 `driver-receipt-unreadable`).
