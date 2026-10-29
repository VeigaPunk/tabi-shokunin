== HEAD ba433c94 presence ==
corpus/knowledge/receipt-authenticity-signing-round-43.md    fatal: path 'corpus/knowledge/receipt-authenticity-signing-round-43.md' exists on disk, but not in 'HEAD'
corpus/lessons/round-43.md                                   fatal: path 'corpus/lessons/round-43.md' exists on disk, but not in 'HEAD'

== corpus/README.md diff (worktree vs HEAD) ==
diff --git i/corpus/README.md w/corpus/README.md
index ea1809af..bb6a7c6c 100644
--- i/corpus/README.md
+++ w/corpus/README.md
@@ -877,4 +877,5 @@ Append-only. One knowledge note on the forgery class; no capability claim.
 |---|---|---|
 | `knowledge/environment-injection-measurement-integrity-round-41.md` | The environment-injection forgery class for loopback browser measurement: the round-40 F4-full attack replayed and refused; `/proc/pid/environ` as the tamper-resistant detection channel; an 8-row vector→detection→refusal decision table; declared residuals (caller-realm hooks, sub-env native attacks). | S148 (supersedes S146), S147; `scripts/measure-c1-round41.mjs`; `scripts/playwright-firefox-egress-round41.mjs`; `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`; `.ufo/waves/round-41/fixtures/`; `.ufo/waves/round-41/measure/`. |
 | `knowledge/committed-bytes-verification-round-42.md` | Committed-bytes verification discipline from r41 defect D1: evidence exists when a revision addresses it (ls-tree/cat-file/ls-remote decision table); rules for evidence pointers, control files, verbatim quotes and >1 MiB file commits; the r42 routed-defects checker as the falsifier. | S149; `corpus/lessons/round-42.md`; `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`; `.ufo/waves/round-42/controls/c2-baseline-red.json`. |
+| `knowledge/receipt-authenticity-signing-round-43.md` | Receipt authenticity by per-invocation Ed25519 signing (r42 criterion 104 closed): forgery→refusal decision table over the committed controls, the declared residual model, strict-argv counter with a challenge wall, witness self-attestation, freeze-binds-controls, and the >1 MiB explicit-file rule walked into and caught at the freeze. | S150; S151; `.ufo/waves/round-43/claims.json`; `.ufo/waves/round-43/controls/`; `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`. |
 
