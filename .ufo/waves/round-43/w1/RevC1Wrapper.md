# RevC1Wrapper — wrapper line review (seat report)

- Seat: RevC1Wrapper (leaf; no subagents dispatched)
- Reviewed file: `scripts/measure-c1-round43.mjs` (374 lines)
- Frozen revision: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (claims frozen before any seat data); current HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`
- Frozen-byte confirmation: working-tree sha256 of the measured file is `23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0` == `claims.json frozenDigests["scripts/measure-c1-round43.mjs"]` == blob at the freeze commit; `git diff --stat 7ca6f01..ba433c94` over all six frozen files is empty (the two post-freeze commits add only the w1 spec and the C1 receipt/witness evidence). Reviewed bytes are the frozen bytes.
- Tooling: no installs/upgrades performed (nothing added; nothing to record). Runtime probes used the already-installed fnm-managed node v24.21.0 (matches the frozen producer pin).

## Findings (by severity)

### F1 — minor — refuse() exit code is 2 for every refusal; the contamination/other distinction is dead code
- `scripts/measure-c1-round43.mjs:185`: `process.exit(finding === 'environment-loader-contamination' ? 2 : 2);`
- Both branches are `2`, so every `refuse()` finding exits 2 — including the non-contamination refusals `producer-digest-mismatch`, `driver-receipt-unreadable`, `witness-unreadable`, `fresh-run-nonce-mismatch`, `witness-attestation-absent`, `counter-output-unparseable`. The ternary is degenerate; the conditional implements no distinction. Inherited verbatim from round-41 (`scripts/measure-c1-round41.mjs:158`, same shape).
- Contract check: the committed battery control `.ufo/waves/round-43/controls/c1-battery-r43.json` pins only contamination vectors → exit 2 + finding `environment-loader-contamination` (6 cases, all satisfied by `batteryMain`) and clean → exit 0. It does NOT pin the "otherwise" limb, so there is no committed-contract violation and no admission impact (any non-zero is a refusal; the final gate at lines 330–331 exits 1 whenever the counter predicate is false). However, the review axis names the convention "2 for contamination, 1 otherwise"; the code does not implement it, and the dead conditional shows a distinction was intended. Operability impact: a caller keying on exit 2 to triage contamination will misclassify e.g. a digest-mismatch refusal as environment contamination.

### F2 — minor — output-exists guard does not cover the witness output; non-`.json` `--out` collapses receipt and witness onto one path
- Guard at lines 197–200 checks only `outPath` and `measurePath`. The third output, `witnessPath = outPath.replace(/\.json$/, '.witness.json')` (line 237), is unguarded: the witness child unconditionally `writeFileSync`s it on SIGTERM (line 161 inside `WITNESS_SRC`). A stale `*.witness.json` from a prior run would be silently overwritten, so the freshness guarantee the guard provides for the receipt and measure record does not extend to the witness. Fails no predicate (the counter verifies the attestation over whatever bytes exist), but it is an evidence-freshness gap in a guard whose purpose is output freshness.
- Same root cause, sharper edge: if `--out` lacks a `.json` suffix, the `replace` is a no-op, so `witnessPath === outPath` and the witness overwrites the receipt the driver just wrote; the run then fails closed (`fresh-run-nonce-mismatch` refuse) but via a clobbered, confusing artifact. Usage examples always use `.json`; nothing enforces it.

## Sound axes (checked, no defect)

1. **Signature covers the canonical unsigned record incl. nonce, bindings, digests** — `measureRecord` (lines 268–276) contains `schema`, `nonce` (32 random bytes hex, line 215), `createdAt`, `pubkeys{wrapper,witness}`, `bindings{receiptSha256, witnessSha256, runs}`, `digests` (three pinned producer files), `gate`, `elapsedMs`, `driverExit`. `unsigned = canonical(measureRecord)` (line 279) is computed before `signature` is attached (lines 280–284), so the signed bytes include everything named by the axis. `crypto.sign(null, …, runPriv)` is correct Ed25519 usage. The counter strips only the `signature` field (`const { signature, ...rest } = m`) and re-canonicalizes with a byte-identical `canonical()`; the two `canonical()` implementations (wrapper line 36, counter line 33) are the same algorithm. Empirically verified against the committed round-43 artifacts: `over` == sha256(canonical unsigned), Ed25519 verify under `pubkeys.wrapper` = true, `bindings.receiptSha256`/`witnessSha256` == sha256 of committed `corpus/evidence/round43/playwright-egress/receipt.json` / `receipt.witness.json`, `bindings.runs` = 2, record nonce == receipt `runNonce`.
2. **Challenge-response flow, close ordering, deadlock** — counter writes a fresh 32-byte challenge to fd3 and `fs.closeSync(3)` (counter lines ~248–250); the wrapper accumulates fd3 data and answers only on fd3 `'end'` (EOF) at lines 300–308, signs exactly 32-byte challenges, writes hex+`\n` to fd4, then `stdio[4].end()`. The interlock is correct: all writes are small (fit buffers), the only blocking reads are ordered after the peer's unblock action, `fd4.end()` runs even if `sign` throws (line 308), and counter-side EOF/short-input paths exit non-zero without waiting. Counter-side read loop (`fs.readSync(4,…)` with n≤0 break, 128-hex regex) tolerates split chunks. No deadlock path found. Corroborated at runtime: the exit-0 path was exercised end-to-end (receipt+witness committed at `ba433c94`).
3. **Private key never serialized** — `runPriv` appears only at generation (line 205) and the two `crypto.sign` calls (lines 283, 304); the witness `privateKey` only inside the child source (lines 137, 159). No `export`/`pkcs8`/`jwk` anywhere in the file; the only exports are SPKI public PEMs. The witness doc carries env var NAMES only (`e.split('=')[0]`), not values. Refusal/result JSON extras (`gate`, driver stdout/stderr) cannot reach the key.
4. **`--measure-out` required** — line 196: usage error and exit 64 unless `--out`, `--scratch`, and `--measure-out` are all present (probe: no args → usage line, exit 64). Output-exists guard fires before key generation and any child spawn (probe: pre-created `--out` → `{"finding":"output-already-exists"}`, exit 1).
5. **Exit-0 gate** — line 330 requires driver exit 0 AND counter exit 0 AND counter `predicate`/`challengeVerified`/`witnessAttestationVerified` all true; no in-model do-nothing reach found (counter demands per-sample firefox exe trees, owned-socket observations, witness overlap, digest pins).

## Non-blocking observations

- O1: the counter promise (lines 292–323) has no spawn-`error` handling or timeout (contrast the witness exit promise's 5 s timeout). A spawn failure (e.g. EMFILE) would hang `measureMain` rather than refuse; fails safe (no exit 0) but is a liveness gap.
- O2: if `claims.json` is unreadable, `loadClaimsPins()` (lines 174–179) returns empty pins and Stage-1 pinning silently no-ops; the counter re-derives pins from its own claims read and the declared residual model (iii) puts on-disk tampering out of scope, so no in-model reach — defense-in-depth note only.
- O3: wrapper-side witness check (`witnessAttestationOk`, lines 257–260) is shape-only; cryptographic verification happens in the counter. By design, but the signed measure record can bind a witness whose attestation fails verification one layer down.

## Verification evidence (commands actually run)

- `sha256sum` of all six frozen files vs `claims.json frozenDigests` — all match; `git show 7ca6f01:<file> | sha256sum` matches for the wrapper and counter; `git diff --stat 7ca6f01..ba433c94` empty for frozen set.
- Probes (scratch `/fast/scratch/hyaku/tabi-r43/RevC1Wrapper`, since deleted): `node scripts/measure-c1-round43.mjs --out /tmp/x.json` → usage line, exit 64; `--out exists.json …` → `{"schema":"tabi-r43-c1-measure","finding":"output-already-exists","path":"…/exists.json"}`, exit 1.
- Read-only verification of committed artifacts (measure record, receipt, witness): all nine checks true (nonce shape, `over` match, wrapper sig, both bindings, witness `over`+sig, pubkey binding, runs=2).
- Grep over the wrapper for `runPriv|privateKey|pkcs8|\.export(|jwk` — only the six expected sites listed above.

## Limitations

- Line review plus read-only corroboration; no full measurement re-run (browser launch) from this seat — runtime confirmation is via the committed exit-0 evidence at HEAD and the two pre-spawn probes.
- The "battery contract" comparison is against the committed control bytes; no external document pins the "1 otherwise" limb.

VERDICT finding refuse() exit code is degenerate (2 for all refusals, distinction dead at line 185) and the output-exists guard misses the derived witness path (lines 197–200 vs 237); signature coverage, challenge-response interlock, key hygiene, and --measure-out requirement are sound
