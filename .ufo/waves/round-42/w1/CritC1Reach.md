# CritC1Reach — C1 do-nothing reachability attack (tabi round 42, wave 1)

Seat: `CritC1Reach` (leaf; one wave item; no subagents).
Repo under test: `/home/vgpnk/Projects/shokunin/tabi-shokunin` at `HEAD 0081bfdb93b6bd1bf2853bb128996f1a976b7218`
(claims frozen at `9b6de3a19de11abdb80e82a1310abc64a40215bb`, baseline `34e177959d1b7ce04afb85a001420e02631ce79e`).
Scratch: `/fast/scratch/hyaku/tabi-r42/CritC1Reach/` (created by me, deleted at the end; evidence copied here first).
No installs or upgrades were performed (tooling directive: nothing needed; `node v24.21.0` was already the pinned producer).

## Axes (named first)

| axis | what this seat can move | judgement used per attack |
|---|---|---|
| **coverage** (C1's owned axis) | whether the admitted evidence actually covers a browser run | does the attack make "exit 0" true with no browser |
| **calibration** | whether the instrument's verdict tracks the world | does the counter's verdict change when the world is absent |
| **freshness** | whether "fresh nonce" is evidence of recency | can old/label-free bytes satisfy it |
| **operability** | cost for an ordinary seat | commands, wall time, privileges |
| **depth / adjacency** | not this seat's frontier | a move is kept only if it harms neither |

Kept moves: all attacks below (each raises coverage/calibration/freshness pressure, harms no axis, writes nothing outside scratch + this seat dir).

## Bounds observed

Leaf only. No writes to the production tree, the fleet repo, sibling `*-shokunin` repos or `shokuknow`; every generated artifact lives in the scratch dir. No commits/pushes/`git`-mutations — only read-only `git rev-parse/status/log/ls-tree/cat-file/check-ignore/show`. No kernel modules, no ptrace, no interference with other processes (only read-only `/proc` reads). **No Firefox and no Playwright was launched**: that is the premise of the attack, so the runner never invokes `measure-c1-round41.mjs` in measure mode or the driver.

## Stage map (read from the frozen bytes, not assumed)

- **Stage A — counter** `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`: a pure function of `(receipt file, witness file, --measure doc, --pins file, process.execPath, the firefox binary at the path named inside the receipt)`. It never reads git, never reads `/proc` for a claimed pid, never sees the wrapper.
- **Stage B — wrapper** `scripts/measure-c1-round41.mjs`: exits 0 iff `driverExit === 0 && counterExit === 0 && counter.predicate === true`.
- **Stage C — driver** `scripts/playwright-firefox-egress-round41.mjs`: exits 0 iff neither run refused; reaching that state requires `firefox.launch`, `browser.version()`, `page.goto`, click effects and screenshots.

The attack therefore splits: A is attacker-written JSON end to end; B/C are the only stages whose exit cannot be typed.

## Results (every command run from the repo root)

Reproducer: `bash .ufo/waves/round-42/w1/CritC1Reach/evidence/run-attacks.sh` (≈3.7 s; builds the shims and extracts the witness source itself). Raw outputs are in `evidence/`; the table below is `evidence/matrix.txt` verbatim.

```
a1-r41-relabel          EXIT=0 predicate=true findings=[] receiptSha256=0e0b0a516f157ce97ff498e42ae797b5703a9bcd9f3f28d86675a084581f5cb1
a1b-r42-relabel        EXIT=0 predicate=true findings=[] receiptSha256=9c0def03e0920f6c9853a80ed77efadc688910d766262cbb862188e08e408398
a1c-nonce-from-receipt EXIT=0 predicate=true findings=[] receiptSha256=3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e
a2-synthetic-no-pins?   EXIT=0 predicate=true findings=[] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a7-synthetic-no-pins    EXIT=0 predicate=true findings=[] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a3-measure-stdin        EXIT=0 predicate=true findings=[] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a4-measure-too-short    EXIT=1 predicate=false findings=["wall-clock-inconsistent"] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a4b-measure-garbage     EXIT=2 measure-doc-unreadable 
a4c-measure-missing     EXIT=2 measure-doc-unreadable 
a5-no-witness           EXIT=1 predicate=false findings=["witness-missing"] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a6-wrong-nonce          EXIT=1 predicate=false findings=["run-nonce-mismatch","witness-nonce-mismatch"] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
a8-witness-missing-file EXIT=1 predicate=false findings=["witness-unreadable"] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
b1-NODE_OPTIONS-battery EXIT=2
b2-NODE_V8_COVERAGE EXIT=0 contaminated=false
b2-OPENSSL_CONF EXIT=0 contaminated=false
b2-GCONV_PATH EXIT=0 contaminated=false
b2-NLSPATH EXIT=0 contaminated=false
b2-NODE_REPL_EXTERNAL_MODULE EXIT=0 contaminated=false
b2-LOCPATH EXIT=0 contaminated=false
b3-getconf-shim EXIT=0 canary=SHIM-GETCONF-CALLED
b3b-ss-ps-shim EXIT=0 canary-ss=SHIM-SS-CALLED canary-ps=SHIM-PS-CALLED
b4-witness-ps-shim canary=WITNESS-PS-SHIM-CALLED -eo pid=,ppid= tree0=[{"pid":1,"ppid":0,"startTicks":8,"exe":null,"comm":"systemd"}]
c1-out-exists EXIT=1 {"schema":"tabi-r41-c1-measure","finding":"output-already-exists","path":"/fast/scratch/hyaku/tabi-r42/CritC1Reach/work/c/exists.json"} 
c2-dangling-symlink-past-freshness-guard EXIT=2 finding=environment-loader-contamination measure=1
c3-out-without-.json-creates-outpath EXIT=2 outpath_exists=yes bytes=825
c4-driver-wx-on-dangling-symlink REFUSED:EEXIST
c5-counter-symlinked-receipt EXIT=0 predicate=true findings=[] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
c6-counter-receipt-stdin EXIT=0 predicate=true findings=[] receiptSha256=12d299d645fc8844ea6b0ee712dec1d9f263a606159b8286a6136bc1f08db8c6
```

### (a) forged receipt + witness, counter invoked directly — **REACHED**

**A1 — committed round-41 bytes, only the nonce relabeled.**
```
node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
  /fast/scratch/hyaku/tabi-r42/CritC1Reach/work/a1-receipt.json \
  --nonce $(cat /fast/scratch/hyaku/tabi-r42/CritC1Reach/work/a1-nonce.txt) \
  --witness /fast/scratch/hyaku/tabi-r42/CritC1Reach/work/a1-witness.json \
  --pins .ufo/waves/round-41/claims.json
→ EXIT=0  {"predicate":true,"findings":[],"nonceMatched":true,"receiptSha256":"0e0b0a516f157ce97ff498e42ae797b5703a9bcd9f3f28d86675a084581f5cb1"}
```
`evidence/gen-a1.mjs` copies `corpus/evidence/round41/playwright-egress/receipt.json` + `receipt.witness.json` and rewrites **only** `runNonce`, `runs[*].runNonce` and `witness.nonce`. No Firefox, no Playwright, no driver, no observation.

**A1b — round-42 bytes, only the nonce relabeled.** Same command against `corpus/evidence/round42/playwright-egress/{receipt,witness}.json` → `EXIT=0 predicate=true findings=[]`. Round-42 evidence is therefore replayable into any later round by relabeling.

**A1c — the nonce argument is redundant.** `--nonce "$(receipt.runNonce)"` on the untouched round-42 receipt → `EXIT=0 predicate=true findings=[]`. "Fresh nonce" means "whatever 64-hex string the receipt contains".

**A2/A3/A7 — a hand-written receipt with no browser artifacts at all.** `evidence/gen-a2.mjs` writes a receipt with **no** `cmds`, `events`, `screenshots`, `httpLog`, `userAgent`, no `fixture` (hash `00…`, bytes 0), `driver: "handwritten-no-driver.json"`, `browserVersion: "0.0-not-a-browser"`, `measuredAt` 1970, **pid 1 as the firefox tree pid** (PID 1 is not firefox) and **pid 999999 as the driver** (nonexistent), plus a witness with 10 synthetic samples.
- with `--pins …/claims.json`: `EXIT=0 predicate=true findings=[]` (A2)
- without `--pins` at all: `EXIT=0 predicate=true findings=[]` (A7) — the digest pinning clause is optional at the counter call
- with `--measure -` carrying a crafted doc `{"elapsedMs":999999,"gate":{…}}`: `EXIT=0 predicate=true` (A3)
The counter's only real checks are structural; since the attacker writes every structural value, none of them is a barrier. The negative controls (A4–A8) confirm the checks *fire* when the attacker supplies inconsistent values — which the attacker simply does not do.

### (b) environment vectors the battery does not cover — **partially reachable, gate is a blacklist**

- `b1`: `NODE_OPTIONS=--require .ufo/waves/round-41/fixtures/forger-round41.cjs node scripts/measure-c1-round41.mjs --battery-probe` → `EXIT=2`, `contaminated=true`, `forbiddenNames:["NODE_OPTIONS"]`. The r40 forger vector is indeed refused.
- `b2`: six loader-class names **not** in `FORBIDDEN_ENV` all pass as clean (`EXIT=0 contaminated=false`): `NODE_V8_COVERAGE`, `OPENSSL_CONF`, `GCONV_PATH`, `NLSPATH`, `NODE_REPL_EXTERNAL_MODULE`, `LOCPATH`. `OPENSSL_CONF`/`GCONV_PATH` are code-loading surfaces; the gate is a name blacklist, so any name not listed is invisible. [INFERENCE] exploiting those two requires a provider/gconv module I did not build; the demonstrated fact is gate blindness, not a live code load.
- `b3`: `PATH` **is** allowlisted (`ENV_ALLOW`) and every external evidence producer is resolved through it. With `PATH=<shim>:$PATH`, `--battery-probe` executed the shim `getconf` (`canary=SHIM-GETCONF-CALLED`) and still reported `contaminated=false`. The same `spawnSync('ss'|'ps')` call form used by driver and witness executed the shims (`canary-ss=SHIM-SS-CALLED canary-ps=SHIM-PS-CALLED`).
- `b4`: the committed witness source (extracted byte-identically, 2013 B, sha256 `9fb79f1c…`) was run with a shim `ps`: it wrote `WITNESS-PS-SHIM-CALLED -eo pid=,ppid=` and produced `tree0=[{"pid":1,"ppid":0,"startTicks":8,…}]` — i.e. it reported **pid 1 as a descendant of a nonexistent root 999999**. The "independent witness" reads its process table from PATH.
  **Boundary (verified):** the witness's `pid/ppid/startTicks/exe` come from real `/proc`, and the counter re-derives ancestry from those real `ppid` values, so a `ps` shim can steer *membership* but cannot invent parentage. Conversely the driver's `ss` observation (the r40 F1 anti-blindness counter) is pure shim output: `ssObs>0` can be manufactured.

### (c) race / rename on `--out` — **guard bypassable, receipt substitution fails closed**

- `c1`: pre-existing `--out` → `EXIT=1 {"finding":"output-already-exists"}` (before any spawn).
- `c2`: a **dangling symlink** at `--out` makes `fs.existsSync` false, so the wrapper proceeds; with a contaminated env it only stops at stage 0 (`EXIT=2 environment-loader-contamination`) and has already written `dangling.measure.json`. So the freshness guard is bypassable by name.
- `c3`: `--out` without a `.json` suffix makes `outPath`, `witnessPath` and the `.measure.json` path **identical** (`"plainreceipt".replace(/\.json$/,'.witness.json') === "plainreceipt"`). `refuse()` then wrote the 825-byte refusal body **into the requested receipt path** (`outpath_exists=yes bytes=825`). On a real run the witness's SIGTERM write would land on the receipt path too.
- `c4`: the driver's `writeFileSync(..., {flag:'wx'})` refuses a dangling symlink (`REFUSED:EEXIST`), so c2/c3 cannot substitute a receipt — fail-closed.
- `c5`/`c6`: the counter accepts a **symlinked** receipt and `/dev/stdin` as the receipt path (`EXIT=0 predicate=true`).

### (d) crafted `--measure` stdin — **REACHED**

`a3` (crafted doc, exit 0) and `a7` (no `--measure` at all, exit 0) show the wall-clock/gate clause is either attacker-supplied or skipped. `a4` (`elapsedMs:10`), `a4b` (garbage), `a4c` (missing file) show the parser/consistency checks exist — they constrain only a cooperative attacker.

## Findings

**F1 (blocker — coverage + freshness). The counter is an unkeyed validator, not an attestation.** Every input it reads (`receipt`, `witness`, `--measure`, `--pins`) is written by the seat; the nonce it matches against is a string inside the receipt. `predicate=true` therefore asserts "this JSON is internally consistent", not "measure-c1-round41 launched two Playwright Firefox runs". Evidence: A1, A1b, A1c, A2, A3, A7. The predicate sentence printed by the counter ("measure-c1-round41 launches …") is false as a description of what the counter tests.

**F2 (blocker — freshness). The one frozen replay control is defeated by relabeling.** `controls/c1-r41-replay-refused.json` refuses with exactly `["run-nonce-mismatch","witness-nonce-mismatch"]` — i.e. it tested a **byte-exact** replay, not a replay that adopts the reviewer's nonce. Relabeling the three nonce fields yields exit 0 (A1). The claim's `beforeState` sentence "the committed round-41 receipt replayed under a fresh nonce is refused" is therefore only true of a replay that keeps the old nonce. The same applies to the round-42 bytes (A1b): they are replayable into round 43+.

**F3 (blocker on the claim text, independent of any attack). The receipt/witness are not committed in any revision.** `git status --porcelain corpus/evidence/round42` → `?? corpus/evidence/round42/`; `git log --all --oneline -- corpus/evidence/round42` → **0 commits**; `git ls-tree -r HEAD -- corpus/evidence/round42` → empty; `git check-ignore` → not ignored; `git cat-file -e 9b6de3a:corpus/evidence/round42/playwright-egress/receipt.json` → exit 128. The committed `measure/c1-measure.json` names `receiptSha256 3984455…`/`witnessSha256 163f4e…`, which currently match only the untracked working-tree files (`sha256sum` above). So the predicate conjunct "the produced receipt.json and receipt.witness.json are committed at the measured revision" is unmet and cannot be met at `9b6de3a` or at HEAD. This is round-41 defect **D1** ("durable receipt never committed") recurring one round later, in the round that is supposed to close it.

**F4 (finding — coverage/calibration). The env gate is a blacklist and PATH is allowlisted.** Six unlisted loader-class names pass as clean (b2); `getconf`, `ps` and `ss` — i.e. the wall-clock scalar, the process tree and the socket surface — all execute from a writable PATH (b3, b3b, b4). The witness's independence is bounded (F4 boundary above), but the `ss` observation is not.

**F5 (finding — wrapper refuse path). `--out` aliasing.** A non-`.json` `--out` collapses `outPath`/`witnessPath`/`measurePath` into one name, and `refuse()` writes the refusal into the requested receipt path (c3). A dangling symlink also slips past the freshness check (c2). Neither yields a receipt, because the driver's `wx` fails closed (c4) — but both are avoidable defects in the same file whose digest is frozen.

**F6 (boundary — no live-path reach found).** The counting command's own exit 0 still requires `driverExit === 0`, and the driver's flow requires a real Playwright Firefox (`browser.version()`, `page.goto`, screenshot/click/hydration checks) plus `/proc`-derived samples and a witness whose ancestry the counter re-derives. A `ps` shim cannot supply `browser.version()`; the 7 stale/file-local firefox-1555 processes on this host have `startTicks 9564095` (far outside any current run window) and `ownedRoots` requires `ppid === driverPid`, so they cannot be borrowed live (`evidence/live-ms-playwright-processes.txt`). I could not reach `measure-c1-round41 … exit 0` without Firefox, and I am not claiming I did.

## Impact by axis

- **coverage: 9 holds only if the round ignores its own predicate.** The predicate's "counter exit 0, predicate true, empty findings" conjunct is satisfiable with zero observation. Admission value must come from the wrapper's live exit, the committed measure record and committed receipt bytes — and the receipt bytes are untracked (F3). So C1 is not admissible as the claim is written, regardless of whether the live measurement did run.
- **calibration: the counter's verdict does not track the world** (A2 passes with no browser). It measures JSON shape.
- **freshness: the nonce is self-declared** (A1c) and old bytes pass after relabeling (A1/A1b).
- **operability: the reach costs one command and ~0.1 s per tier** (whole battery 3.7 s), no privileges.
- **depth/adjacency: unchanged** — nothing proposed here edits scores or other claims.

## Smallest safe correction (admission layer; frozen bytes untouched)

1. **Re-measure at judgement time.** The verifier must run the counting command itself and observe exit 0 in the verification session; a committed `receipt.json` + counter stdout can never be distinguished from a forgery by a bytes-only check. This is the "an unrun check has not passed" discipline applied to C1.
2. **Bind the committed bytes to that run.** Compare the re-run's `receiptSha256`/`witnessSha256` with `git cat-file` of the measured revision *and* with the measure record. Today this refuses because `corpus/evidence/round42` is untracked (F3).
3. **Stop reading "counter exit 0" as a browser-run proof.** It is a schema check; the wrapper's `driverExit === 0` is the only stage whose exit a seat cannot type.
4. **Re-run the replay control on relabeled bytes** (A1) before relying on it for freshness; as frozen, it only tests byte-exact replay.
5. **Treat `PATH` as a contamination vector** (or pin/invoke `getconf`/`ps`/`ss` by absolute path), and do not treat the r42 `--battery` name list as covering loader-class env names (F4).

## Limitations

- Never ran the counting command or the driver (that launches Firefox, which the assignment forbids); the live-path boundary is established by reading the frozen driver/wrapper code and by c1/c4 fail-closed experiments, not by a live run.
- The 14 live `ms-playwright` processes belong to other sessions; I only read `/proc` and did not touch them.
- b2 demonstrates gate blindness, not a compiled `OPENSSL_CONF`/`GCONV_PATH` exploit (marked [INFERENCE]).
- Sibling seats corroborate independently and are *not* my evidence: `.ufo/waves/round-42/w1/CritC1Witness/probes.out` reports `p1..p5` forged witnesses passing with `predicate=True`, and `RevWitnessProbe/evidence/{r42-fresh-nonce,committed-counter}.json` exist; my reach is byte-for-byte from the frozen counter, reproduced in `evidence/run-attacks.sh`.

VERDICT finding — counter exit 0 with predicate true and empty findings was reached with zero browser three ways (round-41 bytes relabeled, round-42 bytes relabeled, hand-written receipt naming pid 1 as firefox), the frozen r41-replay control is defeated by nonce relabeling, and `corpus/evidence/round42` is untracked in every revision, so C1 must not be admitted on its counter clause and cannot be admitted at all until the receipt/witness are committed; the counting command's own exit 0 still requires a real Playwright Firefox run, which I did not reach and do not claim.
