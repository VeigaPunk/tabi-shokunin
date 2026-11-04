# R62Exec3 — r61 final-byte certification

## Scope and disposition

Round 62, wave w1; assigned axis **calibration**. Supporting axes: reproducibility and evidence precision. This is certification support for the existing two-claim wave, **not a third claim**, an admission decision, or an outside review.

Executed the final committed r61 counter directly against the five existing r61 probes and the actual recorded live r61 receipt. **f1–f5 each exit 1 with semantic findings; live exits 0 with predicate true and no findings. No invocation exits 2 occurred.** All six stderr streams are empty. All six results have empty `couldNotEvaluate` arrays. No instrument, historical evidence, pin, or production file was changed.

Durable machine-readable evidence: `.ufo/waves/round-62/w1/R62Exec3/certification.json`. It retains full command argv, cwd, timestamps, exits, signal, verbatim stdout/stderr, parsed findings, runtime identity, input sizes/digests, and committed-byte comparisons. Each stdout/stderr stream is additionally retained separately under that directory.

## Exact inputs

All 14 instrument/receipt/manifest/PNG inputs were byte-compared with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 544a40ac8328ee355b7c41bd67da856f058726e2:<path>`; every comparison matched. No clone or VCS mutation was needed.

| Input | SHA-256 |
|---|---|
| final r61 counter | `97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625` |
| actual r61 driver | `f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76` |
| live receipt | `4147c9d131fff23ec546fbbcdd3818f989442147911644ba04c775092e3052db` |
| f1 | `f52c48ad3a58e90af4dc93532a5cef57c90767019e283a8391a4299d0976d90f` |
| f2 | `21da0f13aa635be97ea8824ec69b732eaffee284e5811873027e4d34e5a00c1f` |
| f3 | `b5ca8b2a7053a0b7289f24ee382095ab828e4a6d77344adb53da8753aae20673` |
| f4 | `bb9d1155b5ca1d80fe86388569bf5d766519b936fb5e5a2480427c1677b59118` |
| f5 | `ce1fa45b7619aff6ecd3a7f3c72aff163f19a5889e36582aed0b32075157d62a` |

Certification JSON also records manifest, smoke-source receipt, and both distinct shot sets' full digests. Probe hashes match the existing manifest; each shot's measured hash matches its receipt pin. Probes use the original `w1/R61Exec2/smoke-r61b` shots, **not** the different corpus live PNGs. f1–f4 are frozen set F; f5 is the auxiliary nonce-tamper control.

Context: baseline `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`; r62 instrument freeze `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`. Read r62 claims and instrument pins first; their hashes are retained in the certification. Read rejected verifier spotchecks for rounds 59–61 before issuing this finding.

## Commands and observed exits

Runtime: Node `v24.21.0`. Replay command (exit **0**):

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec3/replay.mjs
```

The replay launches six independent counter evaluations concurrently and captures each child exit separately; replay exit 0 is not substituted for counter verdicts. Exact executable paths and expanded argv for every evaluation are retained in `certification.json`. All evaluations ran from `/fast/scratch/hyaku/tabi-r62/R62Exec3`.

Each argv has this shape (all path placeholders expand to absolute paths in the JSON):

```text
<node-executable> <lane>/.ufo/waves/round-61/counters/chromium-receipt-r61.mjs <receipt>
  --driver <lane>/scripts/chrome-cdp-loopback-round61.mjs
  --expect-driver-sha256 f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76
  --shot <shot-directory> --json
```

For f1–f5, receipt is `<lane>/.ufo/waves/round-61/measure/f-probes/probe-fN.receipt.json`; shot directory is `<lane>/.ufo/waves/round-61/w1/R61Exec2/smoke-r61b`. For live, receipt is `<lane>/corpus/evidence/round61/chromium-pointer-domain/receipt.json`; shots are its parent directory.

| Case | Exit | Exact findings (occurrences) |
|---|---:|---|
| f1 | 1 | `pointer-type-wrong` ×3 |
| f2 | 1 | `pointer-order-wrong` ×2 |
| f3 | 1 | `pointer-id-wrong` ×1; `pointer-order-wrong` ×1 |
| f4 | 1 | `pointer-trust-wrong` ×1 |
| f5 | 1 | `pointer-nonce-wrong` ×1; `plain-trace-wrong` ×1; `nonce-not-invocation-bound` ×1 |
| live | 0 | none; predicate true |

Exit 1 here means the JSON evaluation completed and refused the receipt semantically. Exit 2 would be a CLI invocation error and would **not** count as forgery refusal. None occurred. The driver was only supplied as a hashed input to the counter, never executed; no browser/process/port closure experiment was launched.

## What this resolves, and what it does not

Round-61 verifier spotcheck R2/D2 records inconsistent wording: the report/runbook limit seat mutation evidence to earlier pins, while `w1/R61MutC2.md` claims a final-pin matrix. These new, retained executions establish one narrow, reproducible position: **the pristine final `97f10e67…` counter semantically refuses these exact committed f1–f5 bytes and admits the exact committed live receipt.** They supply new final-byte refusal/live-control evidence this round, separate from earlier seat pins, and agree with the prior MutC2 pristine-control table.

They do **not** independently reproduce or certify the earlier 5/5 mutant-kill matrix: no mutated counter or selftest was run in this assignment. Thus the wider historical mutation-certification divergence cannot be upgraded into a newly observed 5/5 kill claim from these six runs. No pin transfer is made, and no history is edited. Round 61 remains unadmitted: the frozen-interface change identified by its verifier is not repaired by today's evidence. Integration may cite this as supporting evidence, not retroactive admission.

Unanswered keyup-value and kaidoku-overlap L0s remain unanswered; uncertain split-declared kaidoku lines remain contested-open. No scope/overlap ruling is implied.

## Integrity, limits, and cleanup

Only this report and `.ufo/waves/round-62/w1/R62Exec3/` were written. Scratch was reserved solely at `/fast/scratch/hyaku/tabi-r62/R62Exec3`; removed after durable receipt capture. No installations, global changes, builds, lint, formatting, or unassigned checks. No browser or background job was started. LSP was not available among mounted tools; no symbol refactor was required. No execution blocker remains for the assigned six certifications.

Self-evaluation: accuracy 4/5 (direct final-byte evidence; no mutation-kill inference), completeness 4/5 (all six assigned runs retained; wider matrix explicitly outside this execution), clarity 4/5 (raw JSON is authoritative alongside this summary), actionability 4/5 (single replay command; fixed host paths intentionally retained), conciseness 4/5 (full pins/argv increase length but preserve auditability). Overall 4.0/5. Main owns integration/admission gates; no unrun gate is marked passed.

Report: `.ufo/waves/round-62/w1/R62Exec3.md`
