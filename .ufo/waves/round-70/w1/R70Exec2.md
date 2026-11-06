PASS

# R70Exec2 — independent cold live re-derivation of C2 (predicate leg b), profile `synthscroll-r69`

Move: re-derive round-69 capability `chromium-synth-scroll-gesture-linux` live and cold with the round-70 verifier on my own short scratch, reproduce the frozen C2 control suite, and re-execute three controls myself through the real verifier. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` @ base `90b9ff045542651fb59814fe32f73fee0d1d8243`; read-only except my w1 dir. Host: Chromium 155.0.8059.84 (Arch Linux), node v24.21.0, kernel 7.2.11-arch1-1, 2026-11-06. Claims/freeze untouched; no predicate, counter, pin or kill rule was proposed for amendment.

## 1. Cold positive run (assigned command, exactly one attempt)

Wrapper (exit captured on the line directly after the node invocation):

```
W=.../.ufo/waves/round-70/w1/R70Exec2
node .../scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch /fast/scratch/hyaku/tabi-r70/R70Exec2/v --json > "$W/verify.json" 2> "$W/verify.err"
rc=$?
printf '%s\n' "$rc" > "$W/verify.exit"
```

Result: **exit 0** (`verify.exit` = `0`), stdout parses as `tabi-r70-live-verifier`:
`predicate=true`, `exit=0`, `pinSource=frozen`, `findings=[]` (empty), stderr empty (0 bytes).

- Frozen pins matched before any launch: driver `scripts/chrome-cdp-synthscroll-round69.mjs` sha256 `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3`; counter `scripts/check-synthscroll-r69.mjs` sha256 `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795`.
- Committed evidence `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json` sha256 `587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8`; pinned counter exit 0, findings `[]`.
- Two cold live runs, each in its own scratch subdir, verifier-drawn nonces and ports:

| run | nonce | http port | cdp port | driver exit | counter exit | wall ms |
|---|---|---|---|---|---|---|
| a | `tabi-r69-live-41e97cf2a7-a` | 45585 | 40945 | 0 | 0 | 10384 |
| b | `tabi-r69-live-b76a469e0c-b` | 43477 | 39749 | 0 | 0 | 10338 |

- Run binding both runs: `newFile=true, nonce=true, driverDigest=true, cdpPort=true, httpPort=true`; each receipt names the executed frozen driver digest and the drawn CDP/HTTP ports (run a: `--remote-debugging-port=40945`, origin `http://127.0.0.1:45585`; run b: `39749`, `http://127.0.0.1:43477`). Launch tokens differ (`0391d4911817` vs `c544d5cc588e`) and nonces differ.
- Cross-run and evidence agreement both `true`; measured fingerprint `[["start",0,0,0,false,0,0,0,0,false],["mouse",0,600,600,true,...],["default",600,300,-300,true,...],["repeat",300,900,600,true,...],["touch",900,900,0,false,1,1,1,1,false]]` equals the committed evidence fingerprint. Receipts: 5 legs, 169/170 events.
- Total wall 20.8 s; scratch socket path 95 bytes (limit 107); fresh profile under my scratch; no stray Chromium process left afterwards (`pgrep -af tabi-r70/R70Exec2` → none).

## 2. Frozen control suite reproduced from a scratch copy (never run in the lane)

```
cp -a <lane>/.ufo/waves/round-70/controls /fast/scratch/hyaku/tabi-r70/R70Exec2/controls
node /fast/scratch/hyaku/tabi-r70/R70Exec2/controls/evaluate-controls.mjs
```

Exit 0; stdout `controls 31/31 hold; failing: none`; the copy's `summary.json` is **byte-identical** to the committed lane `summary.json` (both sha256 `9dfd57e3bb3cc015fd6df60a73b2e2a49a6460e846763bbf3fd4a90be65b6fa0`). The lane evaluator was not executed in the lane and lane `summary.json` was not modified.

## 3. Three controls re-executed by me through the real verifier (one attempt each)

All with my own scratch (`/fast/scratch/hyaku/tabi-r70/R70Exec2/c2-*`), outputs retained in `controls-reforged/`:

| control | command shape | observed exit | expected exit | observed findings |
|---|---|---|---|---|
| forger-rewrite | `FORGER_MODE=rewrite FORGER_SOURCE=<r69 evidence> node scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch .../c2-rw --driver controls/forgers/forger.mjs --driver-sha256 9c2a5ca466d987590ffd20c7936118a28a194ad44bfaa24e1f20210bbdcef3cb --json` | **1** | 1 | `run-a-driverDigest, run-a-cdpPort, run-a-httpPort, run-b-driverDigest, run-b-cdpPort, run-b-httpPort, cross-run-identity` |
| tampered driver | copy of the frozen r69 driver + appended `// tampered`, pinned to the frozen digest | **2** | 2 | `driver-pin` (refused before any launch; zero runs) |
| no-run | `--no-run` | **1** | 1 | `no-run` |

Finding sets equal the pre-freeze lane controls exactly (compared against `controls/c2/{forger-rewrite,tampered-driver,no-run}.out`): forger-rewrite's forged receipts pass the r69 counter (counter exit 0 for both runs) yet the verifier faults them on per-run binding and cross-run identity, so the rewrite control cannot pass; `pinSource=override` throughout (a control is never a scored pass).

## 4. Evidence retained (all under `.ufo/waves/round-70/w1/R70Exec2/`)

| file | sha256 |
|---|---|
| `verify.json` | `653b8f3820414d546c92b5c2d54f4a7146d7208e67fac975041914beed54e804` |
| `verify.exit` | `9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa` |
| `positive-run-a.json` | `3835fc60e75f58bf1751fccddd236e617e38d399eabe26198d004bd6b2ded2f2` |
| `positive-run-b.json` | `91e0b4a42b1f3ad7e4cd33afd1805755e73385eec8c6bccc4d0e0adfefa85f88` |
| `controls-evaluator/summary-reproduced.json` | `9dfd57e3bb3cc015fd6df60a73b2e2a49a6460e846763bbf3fd4a90be65b6fa0` |
| `controls-reforged/forger-rewrite.json` | `3eaa702dc17478ec961c90e664b11833f2b661bb545b192d8b1894315309046d` |
| `controls-reforged/tampered-driver.json` | `0fdd9d8d5024ccb01dfc33a5ff3ba593a3d442256b213985da2441f75fdaf157` |
| `controls-reforged/no-run.json` | `d37ed67c470bc2693d6ed689d7b43652b4f04c21947c7c121cbd3e9705b5cad9` |

Exits are also stored beside each output as `<name>.exit`; forger-rewrite run-a forged receipt retained as `controls-reforged/forger-rewrite-run-a.json` (sha256 `9843d40bb54fa3ff8165af7f57959469892f71e4e0512de566c9077992ea9d1b`). Scratch `/fast/scratch/hyaku/tabi-r70/R70Exec2` was deleted after copying.

## 5. Honest limits

- Each control was executed once; the cold positive run was executed once. Nothing was rerun to obtain a preferred result.
- Not run by me: whole-repo builds, lane gates, git/jj mutations (none made), sysctl/host/service changes (none made), the lane evaluator in the lane (forbidden; scratch copy used), and the c1 (tap) capability probes (assigned to other seats).
- `verify-live-r70.mjs` draws its own ephemeral loopback ports; one drawn port (40945) sits below the 41000-48999 band I am allowed to *choose*, which is the verifier's own draw per its design, not a hand-picked port. The socket-length guard held at 95 bytes.

Blockers: none.
