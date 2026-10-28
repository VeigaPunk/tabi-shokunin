# RevWitnessProbe — witness channel audit (round 42, W1)

Seat: `RevWitnessProbe` (leaf, lane `tabi`, round 42 attempt 1, policy-v2 wave)
Milestone: witness channel audit of the frozen r41 C1 measurement chain.
Claims/counter bytes frozen at `9b6de3a19de11abdb80e82a1310abc64a40215bb` (baseline `34e177959d1b7ce04afb85a001420e02631ce79e`). No claim, predicate, counter or pin byte was changed; nothing was committed or pushed; no agents spawned. All writes are inside this seat dir; scratch `/fast/scratch/hyaku/tabi-r42/RevWitnessProbe/` was used and removed before yield.

Tooling: none installed (node v24.21.0 already present; `uv`/pacman not used — pacman guard respected).

## 1. What was read (frozen bytes)

- Counter: `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs` sha256 `cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a` = frozen pin in `.ufo/waves/round-41/claims.json:frozenDigests`.
- Witness conditions, as implemented (not as paraphrased):
  - `:30` receipt `runNonce` and every `runs[i].runNonce` must equal the CLI `--nonce`.
  - `:101-129` witness block. `:106` witness `nonce` vs the same CLI nonce; `:108` only *forbidden name* scan of `witness.environ`; `:110` `samples.length >= 10`; `:111` `nodePid = runs[0].owned.nodePid`; `:113` claimed-pid set = all receipt `samples[].treePids[].pid`; `:120-122` descendant set **seeded with `nodePid` itself**; `:123-127` per-sample firefox-exe descendant and `witness-no-overlap`.
  - `:65-66` startTicks-in-run-window is applied **only** to receipt `samples[].treePids` (slack `:12` = 25 ticks). `:85` the same for `owned.roots`.
  - `:159-164` the wall-clock/gate leg runs **only if** `--measure` is supplied.
- Chain contains **no signature/HMAC/MAC**: `grep -n "hmac\|createSign\|verify(" ` over the three producer files → no match (exit 1).
- `grep -n rootPid <counter>` → no match (exit 1): `witness.rootPid` is never read by the counter.

## 2. Part 1 — does the committed r42 witness satisfy the conditions in its bytes?

Command (reproduced in `evidence/repro.mjs` §P1a; transcript `evidence/repro-output.txt`):

```
node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
  corpus/evidence/round42/playwright-egress/receipt.json \
  --nonce 94c0f0efa48293b3ed923bd9717b5c2702b5f89f3fd45ffd51c980ba8e4e21ab \
  --witness corpus/evidence/round42/playwright-egress/receipt.witness.json \
  --pins .ufo/waves/round-41/claims.json \
  --measure .ufo/waves/round-42/measure/c1-measure.json
```

Result: `EXIT=0`, `{"predicate":true,"findings":[]}`. `receiptSha256` `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e` equals `.ufo/waves/round-42/measure/c1-measure.json:receiptSha256`; witness sha256 `163f4eba…57d339` equals its `witnessSha256`. The honest artifact is internally consistent.

Byte-level witness facts (`evidence/repro-output.txt` Part 1 block):

| Condition | Observed in committed r42 witness | Verdict |
|---|---|---|
| schema `tabi-r41-witness` | `tabi-r41-witness` | pass |
| nonce == receipt nonce | `94c0f0…21ab` (receipt and both runs) | pass |
| >= 10 samples | **754** samples | pass |
| environ uncontaminated | 17 names, none matching `FORBIDDEN_ENV` (includes `TABI_RUN_NONCE`) | pass |
| driver pid observed | `runs[0].owned.nodePid` = 2765128 appears in **749/754** samples | passes the letter; the counter leg is vacuous (§4 F1) |
| firefox-binary descendant of driver, per sample | **715/754** samples carry a `/home/vgpnk/.cache/ms-playwright/firefox-` exe pid under nodePid | pass |
| overlap with claimed pids | yes (e.g. 2765924, 2853602) | pass |
| witness `startTicks` inside run window | **not checked** (witness block reads `startTicks` 0 times). Genuine witness: 1511/7524 tree entries outside the union window `17286057..17289820` — all are the measure wrapper 2764370, the driver node 2764854, and post-run `ps`/`ss` helpers 2949484/2949719/2949948 | unenforced |
| `rootPid` bound to the measure process | `rootPid` 2764370 (the wrapper); counter never reads it | unenforced |

Fresh-nonce replay of the same committed bytes (`repro.mjs` §P1b): `EXIT=1`, findings `["run-nonce-mismatch","witness-nonce-mismatch"]`. So the committed artifact cannot be replayed under an independently chosen nonce — freshness is carried only by the receipt's own `runNonce`.

## 3. Part 2 — witness-only forgery around a COPY of the committed r41 receipt

All cases use the frozen counter, the frozen pins file, and the committed r41 receipt `corpus/evidence/round41/playwright-egress/receipt.json` (sha256 `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1`) copied into this seat. Only files were written; the counter executes no child processes (`counter source spawn calls: 0` from `repro-output.txt`), so no browser ran in any case.

| Case | Attacker-controlled files | Result |
|---|---|---|
| P2a | 12-sample fabricated-pid witness (fake node 888001 / fake firefox 999001), receipt **untouched**, fresh nonce | exit 1, `["run-nonce-mismatch","witness-no-owned-firefox","witness-no-overlap"]` |
| P2b | genuine r41 witness, **only its nonce rewritten**, receipt untouched | exit 1, **`["run-nonce-mismatch"]`** |
| P2c | fully hand-built 10-sample witness using only receipt `nodePid` 2560459 + one claimed firefox pid 2563476 (startTicks 18000000, far outside the r41 windows 16008847..16014516), receipt untouched | exit 1, **`["run-nonce-mismatch"]`** |
| P2d | witness with no driver and no firefox at all | exit 1, `["run-nonce-mismatch","witness-no-owned-firefox","witness-no-overlap"]` — **`witness-driver-unseen` is not emitted** |
| P2e | witness in which the driver pid is never observed, out-of-window startTicks | exit 1, **`["run-nonce-mismatch"]`** |
| P2f | receipt copy with `runNonce`/`runs[].runNonce` rewritten + r41 witness nonce rewritten + 98-byte forged measure doc | **exit 0, `predicate:true`, `findings:[]`** |
| P2g | receipt copy with nonce rewritten + **hand-built** witness + forged measure doc | **exit 0, `predicate:true`, `findings:[]`** |
| P2g′ | P2g **without `--measure`** | **exit 0**, `predicate:true`, `findings:[]` (measure leg skipped at `:159`) |

Exact invocations and nonces are in `evidence/repro-output.txt`; e.g. P2g:

```
node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
  .ufo/waves/round-42/w1/RevWitnessProbe/evidence/r41-copy-final.json \
  --nonce e5d9aca6e187e12b3f8568310576536274c248e093afbe43005f0a989d280705 \
  --witness .ufo/waves/round-42/w1/RevWitnessProbe/evidence/witness-FINAL-handbuilt.json \
  --pins .ufo/waves/round-41/claims.json --measure …/forged-measure.json
→ EXIT=0 {"predicate":true,"findings":[]}
receiptSha256 200071967289b3c28fcb2061e5defa7e425cdd6f5a8369064e4baa34ef78489c
```

Bounded inputs: the forged receipt is a byte copy of a genuine r41 receipt with two nonce fields rewritten; the witness is 10 samples / ~3.5 KB; the measure doc is 98 bytes. Attacker cost is one `JSON.parse`/field edit plus the fabricated witness.

## 4. The refusal chain, precisely

Witness-only forgery around an untouched receipt refuses on **exactly one finding: `run-nonce-mismatch` (`:30`)**, and only that. Not on witness content, not on witness nonce (when the witness nonce is set to the fresh value), and not on root pid (never read):

1. `witness-nonce-mismatch` (`:106`) is avoidable by construction — the witness nonce is a field the forger writes.
2. **`witness-driver-unseen` is unreachable whenever `runs[0].owned.nodePid` is truthy.** `:120` seeds `desc` with `nodePid` before the walk, so `desc.has(nodePid)` (`:122`) is always true; `driverSamples` therefore equals `ws.length`, i.e. it only re-checks the `>= 10` sample count. P2d proves it (no driver pid anywhere, no such finding) and so does the committed witness path (749/754, not 754/754 — the counter would have accepted 0/754).
3. `witness-no-owned-firefox` is satisfied by any tree entry whose `exe` string starts with `/home/vgpnk/.cache/ms-playwright/firefox-` (`:10`, prefix match, no digest) that is reachable from `nodePid` **in the same attacker-authored tree**.
4. `witness-no-overlap` is satisfied by reusing one pid already listed in the receipt's own `samples[].treePids` — the same file family the forger controls.
5. Witness pid `startTicks` are never read (`:112-125`), so the "identity-bound, in-window" property is enforced only on the receipt's own tree (`:65-66`). P2c/P2e pass with `startTicks` 18000000 against real windows 16008847..16014516.
6. Removing the single `run-nonce-mismatch` refusal requires editing the receipt copy — still a file-only action. Then the chain returns exit 0 (P2f, P2g), with `--measure` supplied or omitted.

## 5. Reachability under "attacker controls only files, not the measure process"

- **Post-hoc/admission path — reachable.** Counter v4 over a receipt + witness + measure record is satisfied entirely by attacker-authored bytes: nonce binding is self-consistent across the same three files, and there is no signature, no external entropy anchor, and no check that the nonce was unknown to the forger. P2f and P2g are complete file-only forgery chains that yield `predicate:true` / exit 0 with zero browser runs. The claim's predicate explicitly scores "counter exit 0, predicate true and empty findings" and its controls replay the counter over committed bytes, so this is a reachable do-nothing path for the scored predicate.
- **The counting command itself (`scripts/measure-c1-round41.mjs`) — not reached by file writes alone.** The nonce is generated in-process (`crypto.randomBytes(32)`, `measure-c1-round41.mjs` Stage 2), the witness child is spawned by the wrapper under `scrubEnv` and overwrites its output path on SIGTERM, the receipt nonce is compared to the in-process nonce (`:219` `fresh-run-nonce-mismatch`), the measure doc handed to the counter is the wrapper's own `Date.now()` elapsed + gate report, and pins are read from the committed `round-41/claims.json`. A pre-existing output is refused before any spawn — tested:

```
node scripts/measure-c1-round41.mjs --out preexisting/receipt.json --scratch preexisting/scratch
→ WRAPPER_EXIT=1
{"schema":"tabi-r41-c1-measure","finding":"output-already-exists","path":"…/preexisting/receipt.json"}
```

  This boundary is source-read plus the guard test, not an end-to-end refusal of a forged receipt by a live wrapper run (I did not launch a Firefox run; see Limitations).
- **Consequence for the claim's "fresh 64-hex nonce" leg.** Freshness is established only inside the wrapper's process at measure time. From committed bytes, a verifier that takes the nonce from the receipt or from `c1-measure.json` is checking self-consistency, not freshness. A verifier that re-runs the counting command itself gets a real fresh nonce and the forged artifact is refused (`run-nonce-mismatch`) — but then the committed receipt/witness/measure record contribute nothing that the live re-run does not establish.

## 6. Findings

- **F1 (High, counter hole): `witness-driver-unseen` is vacuous.** `:120` seeds the descendant set with `nodePid`, so `:122` counts every sample whenever `nodePid` is truthy. Evidence: P2d (no driver pid present → no finding), P2e (driver pid never observed → only nonce finding), committed witness observes the driver in 749/754 (not 754). The declared condition "the independent witness observed the driver pid" is not implemented.
- **F2 (High, counter hole): witness pid `startTicks` / run window / `rootPid` unenforced.** The witness block never reads `startTicks`; `witness.rootPid` is dead data. P2c and P2e pass with `startTicks` 18000000 vs run windows 16008847..16014516, and with `rootPid` 123456 that is not the measure process. The assignment's paraphrase ("startTicks inside run window") is true only of the receipt's own samples.
- **F3 (High, evidence-channel): witness channel adds no independence in the replay threat model.** A hand-built 10-sample witness around a byte-copy receipt passes every witness leg (P2c); with the receipt's nonce fields rewritten the counter returns exit 0 (P2f, P2g, P2g′). Nothing binds receipt and witness beyond pid reuse and a nonce string the forger writes.
- **F4 (Medium, admission procedure): nonce freshness is not checkable from committed bytes.** No HMAC/signature exists in the chain; the only freshness anchor is the wrapper's in-process random nonce. `--measure` is optional (`:159`), so the wall-clock leg is skippable by invocation.
- **F5 (Low, design note for any fix): a strict "every witness pid startTicks inside the run window" rule would fail the genuine artifact.** 1511/7524 committed witness tree entries are outside the union window — the measure wrapper (started before), the driver node (2–17 ticks before the slack bound), and post-run `ps`/`ss` helpers. A fix must classify ancestors/helpers (or use per-run windows and exempt the witness path), not apply the receipt rule to the whole tree.

## 7. Limitations / verification gaps

- I did not execute `scripts/measure-c1-round41.mjs` end-to-end (it performs a real two-run Firefox measurement and the wave already has its single measure at `.ufo/waves/round-42/measure/c1-measure.json`). The wrapper's nonce/witness flow is read from source; only its `output-already-exists` guard was exercised. Marked as source-read, not executed.
- No LSP server applies to a read-only `.mjs` evidence review; no semantic-server check was therefore performed, and none of this report's claims rest on text search over code call sites.
- A pre-existing Firefox process (pid 785258, ppid 785032, started 2026-10-27 14:42) was observed on the host; it is not mine. All my counter invocations are read-only and the counter source contains zero spawn calls.
- The forged artifacts are planted in this seat's evidence dir only; nothing was written to the production tree, the fleet repo, sibling repos, or shokuknow.

## 8. Evidence manifest (`evidence/`, checksums in `evidence/SHA256SUMS.txt`)

- `repro.mjs` — self-contained reproduction of §2 and §3; reads only frozen repo files, writes only this dir.
- `repro-output.txt` — full transcript (Part 1 + P2a–P2g + provenance, including the pinned node sha `7fde7b…df4c` and counter sha `cd71a5…126a`).
- `r41-copy.json` (`593d15…6e5a72`), `r41-copy-nonce-rewritten.json` (`99eeab…82edf9`), `r41-copy-final.json` (`200071…78489c`), `r41-copy-nonce2.json` (`df9bab…db815a`) — receipt copies.
- `witness-A-fabricated-pids.json`, `witness-B-r41-nonce-rewritten.json`, `witness-D-handbuilt.json`, `witness-E1-no-ff-no-node.json`, `witness-E2-node-never-observed.json`, `witness-C-r41-nonce-rewritten.json`, `witness-FINAL-handbuilt.json` — forged/rewritten witnesses.
- `forged-measure.json` (98 B), `P2g-without-measure.json`, `A/B/C/FINAL/committed-counter/r42-fresh-nonce` counter outputs, `wrapper-guard.err` (`{"finding":"output-already-exists"}`).

VERDICT finding — the committed r42 witness satisfies the counter's witness checks in its bytes (754 samples, driver pid in 749, firefox descendants in 715, overlap present), but `witness-driver-unseen` is vacuous, witness `startTicks`/`rootPid` are never checked, and a file-only attacker reaches `predicate:true` (exit 0, zero browser runs) by copying the r41 receipt, rewriting its nonce, and supplying a hand-built 10-sample witness plus a 98-byte measure doc (P2f, P2g, P2g′); the only refusal for a witness-only forgery is `run-nonce-mismatch`, and the in-process nonce blocks forgery only if the counting command is re-run live rather than scored over committed bytes.
