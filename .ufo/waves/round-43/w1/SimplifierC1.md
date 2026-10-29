# SimplifierC1 — signing-layer simplification review (tabi round 43, w1)

Seat: `SimplifierC1` (leaf — no subagents dispatched)
Lane: **REPORT ONLY** on the C1 signing layer — `scripts/measure-c1-round43.mjs` (wrapper) and
`.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` (counter).
Milestone: signing-layer simplification review. Axis judged: operability.
Date: 2026-10-29

**No repository bytes were changed.** The wrapper/counter/claims bytes are frozen this round, so every
proposal below is a *next-round (r44) amendment proposal*, not an applied change. All experiments ran on
copies under the scratch root; the shared tree is byte-identical before and after (verified, §7).

Tooling: **no install or upgrade was performed** (no pacman transaction — host-wide pacman pause honoured).
Pre-existing tools used: `node v24.21.0` (fnm-managed, matches the pinned `producerPins.nodeSha256`),
`git` 2.x (read-only), `python3` 3.14, coreutils. No new tool, no `~/.local/bin` write.

---

## 1. Method

1. Read the frozen wrapper (374 lines) and counter (≈290 lines) end to end, plus the driver
   (`scripts/playwright-firefox-egress-round43.mjs`, 462 lines) for env consumption and
   `.ufo/waves/round-43/claims.json` for the frozen pins.
2. Static dead-weight scan (identifier occurrence counts; unreachable/always-undefined expressions).
3. Hypothesis testing **on scratch copies only** (never in place):
   * `v1-deadcode.mjs` — removes the dead constant, the dead computation, the dead ternary and the
     tautological gate re-derivation.
   * `v2-minenv.mjs` (6-entry allowlist), `v4-minenv2.mjs` (4-entry), `v5-nohome.mjs`, `v6-nopath.mjs` —
     reduced `ENV_ALLOW` variants.
   * `v3-gateargv.mjs` — isolates the `GATE_ARGV_OK` removal alone.
4. Equivalence criterion for a "no-op" proposal (because the frozen chain's green/red is **not** a
   deterministic function of the code on a live host — §6):
   **all non-egress counter findings empty** AND `driverExit === 0` AND `counterExit === 0` AND
   `counter.predicate === true` AND `measureSignatureVerified === true` AND
   `witnessAttestationVerified === true` AND `challengeVerified === true` AND the **gate report
   byte-identical** (ppid-normalised) to the baseline AND the recorded producer digests identical.

---

## 2. Frozen bytes verified before any experiment

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && sha256sum \
    scripts/measure-c1-round43.mjs scripts/playwright-firefox-egress-round43.mjs \
    .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
```

All three equal `claims.json → frozenDigests`; `claims.json` itself
sha256 `290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029`.
Freeze commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` is an ancestor of HEAD (`ba433c94`);
`git diff --stat 7ca6f018..HEAD -- scripts/ .ufo/waves/round-43/` touches **no** producer byte
(only `w1-dispatch.json`, `w1-spec.json`, `w1-run.err`, `w1.ready`).

### 2.1 The instrument still reproduces its committed control (narrow existing check)

```
$ node scripts/measure-c1-round43.mjs --battery > battery-baseline.json
exit=0
$ cmp .ufo/waves/round-43/controls/c1-battery-r43.json battery-baseline.json
BATTERY-OUTPUT-BYTE-IDENTICAL-TO-COMMITTED-CONTROL
```

Both files sha256 `6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed`
(= the frozen control binding in `claims.json.controlBindings`). All 7 cases:
`forger-r39-verbatim / forger-r41-retargeted / node-path / ld-preload / esm-loader / esm-import`
→ exit 2 + `environment-loader-contamination`; `clean` → exit 0. This is the committed round-43
battery control re-executed, not a new instrument.

---

## 3. Findings — provably dead weight in the signing layer (r44 candidates)

| # | Location | Dead weight | Proof | r44 proposal | Byte/behaviour-preserving? |
|---|---|---|---|---|---|
| S1 | wrapper:49 | `const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox'` — **1 occurrence in the file, never read**. The same path already exists as an authority in `claims.json → producerPins.firefoxBinPath`, and the counter matches executables by prefix (`FIREFOX_DIR_PREFIX`, counter:20). | `grep -c FIREFOX_BIN` → 1 | delete the constant | **Yes** — proven by the `v1-deadcode` run (§5): chain green, gate report byte-identical, recorded digests identical. |
| S2 | wrapper:64 (+ import at :41) | `const uptimeTicks = (() => { … execFileSync('getconf', …) … })()` — **1 occurrence, never called**. It also forks `getconf` at module load in *every* invocation, including the 7 spawns `--battery` performs. | `grep -c uptimeTicks` → 1; the witness and the driver each carry their own `uptime()`/`uptimeTicks()`. | delete the const **and** the then-unused `import { execFileSync }` (`:41`) — note the wrapper also imports the same module twice (`:40` and `:41`) | **Yes** — same `v1-deadcode` proof (§5). |
| S3 | wrapper:185 | `process.exit(finding === 'environment-loader-contamination' ? 2 : 2);` — **both arms are `2`**, the condition is inert; the `finding` argument never changes the exit code. | source line 185 | `process.exit(2);` | **Yes** — same `v1-deadcode` proof (§5). |
| S4 | wrapper:86 + :97 | `GATE_ARGV_OK` re-derives a value the gate child **already computed with the identical predicate** (`GATE_SRC` line 81: `execArgv.length===2 && /^(--eval\|-e)$/.test(execArgv[0])`). The child's `execArgv` can only ever be `['--eval', src]`, because the child is spawned with `scrubEnv()` and `ENV_ALLOW ∩ FORBIDDEN_ENV = ∅` (computed: **empty**), so no `NODE_OPTIONS` can ever reach the child to inject a flag. The parent's re-derivation is therefore a tautology over data the parent does not own. | `ENV_ALLOW ∩ FORBIDDEN_ENV = []` (computed); `v3-gateargv.mjs` isolates the removal; probe output byte-identical (ppid-normalised) | delete `GATE_ARGV_OK` and the `parsed.execArgvClean = …` line (keep the child's own `r.execArgvClean` and the `execArgvFlag`/`execArgvLen` fields so the gate-report bytes do not change) | **Yes** — `v1-deadcode` (which includes S4) is green with a byte-identical gate report; `v3` alone is ppid-identical at the probe level. |
| S5 | wrapper:249, :263 | `witnessExit` is **always `undefined`**: the promise resolves via `r()` with no value (`child.on('exit', () => { clearTimeout(to); r(); })`). It is then passed into a refusal payload, and `JSON.stringify` drops `undefined` values — so the key **never appears in any emitted JSON**. Dead field with a misleading name. | wrapper:249 (`r()` with no argument); `node -e 'console.log(JSON.stringify({x:undefined}))'` → `{}` | delete `witnessExit` (or capture the real exit code — that would *add* behaviour, so it is out of scope for a simplification) | **Yes** — no observable output changes (the field is absent from every payload today). |
| S6 | wrapper:177-178 | `loadClaimsPins()` returns `firefoxBinSha256`, but the wrapper **never uses it** — only `pins.digests` (:227) and `pins.nodeSha256` (:230). The firefox binary pin is enforced solely by the counter (counter:186-195). | `grep -n "firefoxBinSha256\|pins\."` → 3 hits, none consuming `pins.firefoxBinSha256` | drop the field from the wrapper's pin loader | **Yes** — no code path reads it. |
| S7 | wrapper:51 | `ENV_ALLOW` carries **25** entries; the chain needs **4** of them on this host (`PATH`, `HOME`, `TABI_RUN_NONCE`, `HYAKU_SCRATCH`) — and even `HOME` (v5) and `PATH` (v6) proved dispensable *here*. `TABI_RUN_NONCE` is the one the item named; the other 24 are not read by any component of the chain (node wrapper, gate child, witness child, driver, firefox). | §5 table: `v2` (6 entries), `v4` (4), `v5` (no HOME), `v6` (no PATH) all → exit 0, predicate true | shrink `ENV_ALLOW` to `['PATH','HOME','TABI_RUN_NONCE','HYAKU_SCRATCH']` (keep `PATH`+`HOME` as insurance: `PATH` is how the driver finds `ps`/`ss`/`getconf`, and dropping it only worked because glibc's `execvp` falls back to `/bin:/usr/bin`; `HOME` is firefox's profile/home dir) | **Yes on this host** (§5) — but see §6.3: the allowlist is a host-shape contract, so keep the 2-var insurance. Also: `SSH_AUTH_SOCK` (agent socket), `DISPLAY`/`WAYLAND_DISPLAY`/`XAUTHORITY` (GUI session) and `DBUS_SESSION_BUS_ADDRESS` (session bus) are **capability-granting** entries handed to the browser child for nothing — dropping them is an operability *and* hygiene win. |
| S8 | wrapper:221-231 vs counter:173-200 | **Duplicated digest authority.** The wrapper computes sha256 over the same three producer files and compares them to `claims.frozenDigests`; the counter re-derives the same three digests, compares them to the same pins, *and* cross-checks the wrapper-recorded `m.digests` against its own (counter:230). The same fact is established three times. | source: wrapper `digests` map (:222-226) + loop (:227-231); counter `digestDetails` (:173-184) + `measure-digest-mismatch` (:230) | **Do not delete** the wrapper's copy silently: it is a fail-fast whose observable contract is *exit 2 + finding `producer-digest-mismatch`*, whereas the counter's is *exit 1 + finding `digest-mismatch:<key>`*. Removing it would change the wrapper's exit code and finding string → not a pure no-op. r44 option: keep exactly one authority and document which (recommend: counter = scoring authority; wrapper copy = fail-fast, explicitly labelled). | **No** (as a blind deletion) — behaviour-visible difference; report only. |
| S9 | wrapper:227-229, counter:178 | **Fail-open pin shape (silently skipped pins).** The wrapper iterates `Object.entries(pins.digests)` but guards `if (digests[k] !== undefined && …)`: the wrapper's map holds only 3 keys, so **3 of the 6 frozen pins** (`check-routed-defects-round43.mjs`, `fixtures/v0-fabrication.mjs`, `fixtures/tree-vs-blob.mjs` — all C2-owned) are skipped without a word. The counter has the same shape (`if (digests[k])`). A pin key that is renamed or dropped would be silently unchecked on both sides. | `claims.json frozenDigests` has 6 keys; the wrapper's map has 3; the guard skips the other 3 | r44: make the C1-owned pin key list explicit, and make "pin key missing from the C1 set" a *finding* rather than a silent skip. | **No** (it changes findings) — report only; this is a hole, not dead weight. |
| S10 | wrapper:208-209 | Comment claims more than the code does: *"Stage 0 — environment boundary: refuse any loader/injection vector **before any child is spawned**"*. The gate child **is** spawned first: `const gate = runGate();` (wrapper:211) runs before `envContaminated` is decided (wrapper:212). The true guarantee is "before the driver and the witness are spawned". | wrapper:208-212 | reword the comment (r44) | **Yes** (comment-only). |
| S11 | wrapper:84-85 vs :86 | The comment describes a *semantic* criterion — *"clean means no preload/loader flag among the node flags"* — while the code implements a *structural* one (`len === 2 && flag matches`): a child with `['--eval', src, '--extra']` would be judged unclean although it carries no preload flag. Under the frozen bytes the two coincide (the child's argv is always exactly 2), so this is a documentation/robustness mismatch, not a live defect. | source lines 84-86 vs `GATE_SRC` line 81 | reword to state the structural criterion, or implement the semantic one | **Yes** (comment-only). |
| S12 | wrapper:268 (the `measureRecord` literal) + counter | **Unconsumed signed fields.** `measureRecord.bindings.runs`, `measureRecord.createdAt`, `measureRecord.driverExit`, and `gate.self.nameCount` / `gate.self.execPath` / `gate.self.execArgv` / `gate.child.execArgvLen` / `gate.child.execArgvFlag` are written into the signed record, but the counter consumes only `gate.self.forbiddenNames`, `gate.self.execArgvClean`, `gate.child.ok`, and `bindings.receiptSha256` / `bindings.witnessSha256`. | counter source: `g.self.*`/`g.child.ok` checks (gate-contaminated), `b.receiptSha256`, `b.witnessSha256` | keep (audit trail) or trim in r44 — note trimming changes the signed bytes (and therefore every future `measureSha256`), though not the predicate. | **No** (signed bytes change) — report only. |
| S13 | wrapper:136 (in `WITNESS_SRC`), wrapper:57, counter:31 | `canonical()` is written **three** times (wrapper, counter, and the copy embedded in the witness source string) and `sha256()` three times (wrapper:53, counter:26, witness). The wrapper↔counter copies are *necessary* (separate processes, separate trust boundary); the witness copy is a third copy of the same 6-line function. | grep: `function canonical` ×3 in the wrapper file (1 in the embedded witness source), `canonical` ×1 in the counter | a shared module would add a file to the pinned producer set (new frozen digest, new claims entry) — **not** a local simplification. Report only; do not propose for r44 without re-pinning. | n/a (would change the frozen producer set) |
| S14 | wrapper:184 | The refusal sidecar `outPath.replace(/\.json$/, '.measure.json')` has **no consumer** in the round-43 chain (grep over `scripts/` and `.ufo/waves/round-43/`: only the two wrapper copies write it; nothing reads it). It is inherited verbatim from `scripts/measure-c1-round41.mjs:157`. | grep for `.measure.json` → 2 hits, both writers | keep as operator-visible refusal evidence (recommended) or drop in r44 | n/a (kept by default) |

---

## 4. Routed finding — the frozen predicate's last clause has no enforcing code

The frozen PREDICATE sentence (counter:8 header comment, counter:24 `const PREDICATE`,
`claims.json → claims[0].counterPredicate`) ends with:

> "… AND **no private half of either per-invocation signing key is persisted by any chain component**."

**No code in the counter or the wrapper enforces that clause.** `grep -n "private\|PRIVATE"` on the
counter returns only comments (lines 7, 8, 24, 246) — there is no scan of the receipt, the witness
document, the measure record or the scratch tree for private-key material, and no comparison of
"private halves that exist on disk" against the two per-invocation keys. The wrapper only *asserts*
it in prose (header comment, lines 3-8 and the Stage-2 comment) and by construction (no `fs.write`
receives `runPriv`, and the witness keeps its own half).

This is a *sentence-vs-code* gap of exactly the kind this lane is chartered to surface ("comments
claiming more than the code does"). It is **not** a simplification and I did not attempt to close it
here: a sibling seat (`CritC1KeyPersistence`) already owns the private-key-persistence thread, so I
route rather than duplicate. **Owner action requested:** either add the mechanical check (scan the
committed artifacts + scratch for `BEGIN … PRIVATE KEY` / raw Ed25519 seed material) or reword the
frozen clause so the sentence matches what the code proves. Note the clause cannot be reworded inside
round 43 (bytes frozen) — the choice is a round-44 amendment.

---

## 5. Experiments — exact commands and observed output

Scratch root (created by this seat, deleted before yield):
`S=/fast/scratch/hyaku/tabi-r43/SimplifierC1`.

### 5.1 Baseline full chain (unmodified wrapper)

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs \
    --out $S/base/receipt.json --measure-out $S/base/measure.json --scratch $S/base/scratch
exit=1        (elapsedMs 64327)
driverExit=0  counterExit=1  counter.predicate=false  findings=39
measureSignatureVerified=true  witnessAttestationVerified=true  challengeVerified=true  challengeError=null
non-egress findings: []      <- all 39 findings are of the form "<run>-sample<N>-{ss,proc}-egress"
egress remotes seen: ["42.4.78.66.0.42.0.0.0.0.0.0.0.0.3.71:443", "[2a04:4e42:2a::347]:443"]
```

The 39 findings are **all** egress-class; the signature/witness/challenge limbs are sound. See §6.1
for why the baseline is red and the later identical-code runs are green.

### 5.2 Variant runs (scratch copies only)

```
$ node $S/v1-deadcode.mjs --out $S/v1-deadcode/receipt.json --measure-out ... --scratch ...
v1-deadcode exit=0
$ node $S/v2-minenv.mjs   ... ; v2-minenv exit=0
$ node $S/v4-minenv2.mjs  ... ; v4-minenv2 exit=0
$ node $S/v5-nohome.mjs   ... ; v5-nohome exit=0
$ node $S/v6-nopath.mjs   ... ; v6-nopath exit=0
```

Summarised by `evidence/summarize-runs.mjs` → `evidence/run-summary.json`:

| run | ENV_ALLOW | driverExit | counterExit | predicate | findings | non-egress | gate report == baseline | digests == baseline |
|---|---|---|---|---|---|---|---|---|
| base | 25 entries (repo file) | 0 | 1 | false | 39 | 0 | — | — |
| v1-deadcode | 25 (S1-S4 removed) | 0 | **0** | **true** | **0** | 0 | **yes** | **yes** |
| v2-minenv | PATH, HOME, LANG, TMPDIR, HYAKU_SCRATCH, TABI_RUN_NONCE | 0 | 0 | true | 0 | 0 | yes | yes |
| v4-minenv2 | PATH, HOME, TABI_RUN_NONCE, HYAKU_SCRATCH | 0 | 0 | true | 0 | 0 | yes | yes |
| v5-nohome | PATH, TABI_RUN_NONCE, HYAKU_SCRATCH | 0 | 0 | true | 0 | 0 | yes | yes |
| v6-nopath | HOME, TABI_RUN_NONCE, HYAKU_SCRATCH | 0 | 0 | true | 0 | 0 | yes | yes |

`v1-deadcode` is the load-bearing result: **removing S1+S2+S3+S4 together leaves the chain green with
a byte-identical gate report and identical recorded producer digests** — i.e. those four items are
provably dead weight, not load-bearing ceremony. `v2/v4/v5/v6` are the load-bearing result for S7:
a 4-entry allowlist (and even a 3-entry one) drives the whole chain, so 21 of the 25 allowlisted
variables are never read.

### 5.3 Probe-level parity (battery probe, every contamination vector)

`evidence/probe-parity.mjs` replicates `batteryMain()`'s case list against the repo file and each
scratch variant (clean + 6 vectors), with a scrubbed parent env:

```
ppid-normalized probe parity across repo/v1/v2/v3: True
repo v1 v2 v3 — forger-r39-verbatim:2/environment-loader-contamination … esm-import:2/… clean:0/null
```

Byte-identical stdout (modulo the ppid the child reports for its parent) and identical exit codes and
findings for all 7 cases × 4 targets. The reduced-env variants were additionally checked at the
probe level: `repo` vs `v5-nohome` vs `v6-nopath` clean-case JSON → **0 diff lines** after ppid
normalisation.

---

## 6. Limitations and honest caveats

1. **The chain's green/red is not a deterministic function of the code on a live host.** The baseline
   run of the *unmodified* wrapper was red (39 egress findings — the browser's own outbound
   connections to `42.4.78.66:443` / `[2a04:4e42:2a::347]:443`), while five later runs of the same
   frozen bytes (v1, v2, v4, v5, v6) were green with zero findings. The egress surfaces are
   ownership-filtered to the browser tree (`observeSs(tree)` filters `ss` lines by owned pid,
   driver:160-173; `observeProc(tree)` filters `/proc/net/tcp` rows by the owned socket inodes,
   driver:226-253), so
   the non-loopback sockets belonged to the firefox tree itself, not to unrelated host traffic; but
   whether firefox opens such a connection during a given run is not controlled by the frozen code.
   Consequence: I could not use "predicate == true" as the equivalence criterion for the *baseline*,
   and every claim above is stated against the criterion in §1 (non-egress findings empty + all
   signature/challenge limbs true + byte-identical gate report). **This ambient sensitivity is itself
   an operability observation for the C1 owners**: the frozen counting command can be red for reasons
   unrelated to the browser session it claims to observe.
2. **One host, one toolchain.** All runs are on this workstation, `node v24.21.0`
   (= pinned `producerPins.nodeSha256`), firefox build `firefox-1555`, glibc `/bin`+`/usr/bin`
   layout. The reduced-allowlist results are a *lower bound on what the chain needs here*, not a
   portable guarantee: `PATH` matters because the driver spawns `ps`, `ss` and `getconf` by bare
   name (it worked without `PATH` only because glibc's `execvp` falls back to `/bin:/usr/bin`), and
   font/locale configuration (`FONTCONFIG_PATH`, `LC_*`) was exercised only in its present-host form.
   A conservative r44 allowlist should keep `PATH` and `HOME`.
3. **No claim-level verdict is offered.** This seat does not score C1 or C2 and did not attempt to
   admit or reject either claim; §4 is routed to the C1 claim owners, not scored here.
4. **The "no-op" proofs are host-observed, not formal.** The four dead-code removals (S1-S4) are
   proven dead by (a) static occurrence counts and (b) an end-to-end green run with byte-identical
   gate output. They remain *statements about these frozen bytes*; a future change to the driver or
   the claims could make one of them load-bearing again (e.g. if the counter started consuming
   `gate.child.execArgvFlag`).
5. **The pin check binds repository paths, not the executing file.** Observed as a side effect: the
   mutated copies (v1/v2/v4/v5/v6) all recorded the *repository* digests (`23afa29d…`, `37182359…`,
   `6b8c8750…`) in their measure records and passed the counter's pin check, because the wrapper's
   `SELF`/`DRIVER`/`COUNTER` constants point at the repo paths regardless of which file is actually
   executing. The counter re-derives the same repo paths, so neither the wrapper's Stage-1 check nor
   the counter's check binds the *running* bytes. Reported to the C1 owners as an adjacent observation
   (not a simplification); no change proposed here.
6. **Adjacent, outside the signing layer but inside the chain:** `scripts/playwright-firefox-egress-round43.mjs:26`
   imports `tmpdir` from `node:os` and never uses it (`grep -c "tmpdir("` → **0**). Dead import in a
   frozen producer — reported for r44, not touched here.

---

## 7. Shared tree untouched

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain -- scripts/ \
      .ufo/waves/round-43/counters .ufo/waves/round-43/claims.json
(no output)
$ sha256sum scripts/measure-c1-round43.mjs scripts/playwright-firefox-egress-round43.mjs \
      .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
```

Identical to §2 → the frozen producer bytes are byte-identical before and after this seat. No commit,
no push, no git/jj mutation anywhere; no write outside this seat's report/evidence directory and the
scratch root; scratch root removed on exit.

---

## 8. Evidence index

All under `.ufo/waves/round-43/w1/SimplifierC1/evidence/`:

| file | what it is |
|---|---|
| `battery-baseline.json` | fresh `--battery` output; byte-identical to the committed control `c1-battery-r43.json` (sha256 `6cb61f11…`) |
| `probe-parity.json` | raw stdout/exit/finding per case for repo × v1 × v2 × v3 (7 cases each) |
| `probe-parity.mjs` | the harness that produced it (scratch copy) |
| `make-variants.mjs` | generator for the v1/v2/v3 variants |
| `v1-deadcode.mjs` | copy with S1+S2+S3+S4 removed (22511 B) |
| `v2-minenv.mjs` | copy with a 6-entry `ENV_ALLOW` (22840 B) |
| `v4-minenv2.mjs` | copy with a 4-entry `ENV_ALLOW` (22819 B) |
| `v5-nohome.mjs` | copy without `HOME` (22812 B) |
| `v6-nopath.mjs` | copy without `PATH` (22812 B) |
| `run-*-stdout.json` | the wrapper's full stdout for each of the six runs |
| `run-summary.json` | compact per-run comparison table used in §5.2 |
| `summarize-runs.mjs` | the extractor that produced `run-summary.json` |

Receipt/witness/measure bytes stay in scratch (each ≈1 MiB); their sha256 are recorded in
`run-summary.json` (`receiptSha256`, `witnessSha256`, `measureSha256` per run).

---

## 9. Bottom line for the round-44 amendment queue

Delete-now-safe (proven no-op on these frozen bytes, §5.2): `FIREFOX_BIN` (S1), `uptimeTicks` +
the orphaned `execFileSync` import (S2), the `? 2 : 2` ternary (S3), `GATE_ARGV_OK` + its call (S4),
the always-`undefined` `witnessExit` field (S5), the unread `pins.firefoxBinSha256` (S6), and 21 of
the 25 `ENV_ALLOW` entries (S7 — keep `PATH` and `HOME` as insurance, and drop the
capability-granting `SSH_AUTH_SOCK` / `DISPLAY` / `WAYLAND_DISPLAY` / `XAUTHORITY` /
`DBUS_SESSION_BUS_ADDRESS`).

Decide-as-amendment, not deletion: the duplicated pin authority (S8), the fail-open pin-key skip
(S9), the unenforced "no private half persisted" predicate clause (§4, routed to
`CritC1KeyPersistence`), and the two over-claiming comments (S10, S11).

Not to be touched inside a round: the PREDICATE sentence triple (counter header comment, counter
`const PREDICATE`, `claims.json`) — it is required to stay byte-identical across the three frozen
sites, so its "duplication" is a freeze requirement, not dead weight.

VERDICT finding signing layer carries 6 provably dead code paths/fields (S1-S6) and a 21-entry unused ENV_ALLOW (S7) — all proven no-op on the frozen bytes by green scratch-variant runs — plus 2 routed holes: the frozen PREDICATE's "no private half persisted" clause has no enforcing code, and the pin checks silently skip 3 of 6 frozen pins.
