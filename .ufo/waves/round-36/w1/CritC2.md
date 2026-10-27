# CritC2 — ATTACK C2 (tabi round 36, wave w1)

Seat: CritC2 (leaf critic). Freeze: `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.
Frozen counter: `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`
(sha256 `15910c59…9e2b764`, re-verified against `git show FREEZE:<path>` before use;
every run below executed those freeze bytes from scratch, with `TMPDIR` under the
seat scratch root, against a scratch clone of the lane at the freeze commit).

**Axes named.** operability (C2's axis): does the amended counter still admit honest
evidence and refuse fabrication? calibration: is what it admits/refuses exactly what
the frozen contract claims — no more, no less?

**Tools.** No installs/upgrades were needed; node v24.21.0, the pinned
Firefox 158.0.1 (`a1947294…`) and geckodriver 0.37.1 (`f831b7e6…`) were already
present and match the counter's `PINNED_BINARIES` digests.

## Avenue outcomes (each: frozen counter run from freeze bytes, JSON committed in `evidence/`)

### (a) Own minimal honest BiDi driver — ADMITTED (expected; not a finding)
Wrote `scripts/critc2-honest-driver.mjs` from scratch (in the scratch clone;
saved as `evidence/avenue-a-driver.mjs`): a BiDi client over geckodriver's classic
`/session` bootstrap, importing only the counter's allow-list (`FIXTURE_SHA256`,
`VIEWPORT`, `serveFixture`), DNS-off prefs, fresh profile/HOME/TMPDIR per cold run,
the gate recipe order, gate transcript format. Ran it twice on the real pinned
Firefox; both first screenshots equal the canonical `7a3ae6a9…fd02`.
Committed driver + transcripts + receipt at clone rev
`689c8f066499bcec64d0f39685397ca7e61d2a18` and ran the frozen counter:
`exit=0, predicate=true, admitted=16/16, failing=0, binding=null,
egressNonLoopback=0 (samples=2, pids=9), live=firefox 158.0.1 cmds=28`
(`evidence/out-a.json`, receipt/transcripts `evidence/avenue-a-*`). The v2 counter
admits an independent honest driver — interoperability holds.

### (b) Rewritten-id transcript clone — **PREDICATE TRUE ON FABRICATED EVIDENCE** (the disclosed limit, verified)
Built run2 as a byte-level clone of run1 with all 15 distinct UUIDs (sessionId,
browsing-context ids, intercept/request ids, shared ids) regenerated via a
consistent mapping (`evidence/avenue-b-rewrite-ids.mjs`); screenshots, ports,
recipe and every predicate-relevant byte identical. Updated only the receipt's
run2 `transcriptSha256`. Clone rev `d104f6a5f43b04e50ff6df19212b67bc62ffe48f`.
Frozen counter: `exit=0, predicate=true, admitted=16/16, failing=0, binding=null`
(`evidence/out-b.json`) — run1/run2 context-id sets are disjoint and UUID-shaped,
first screenshots match the counter's own live session, so A6 passes. **One honest
run, replayed with fresh ids, satisfies the predicate.** This is exactly the
contract's disclosed limit ("rewritten-id clones stay a recorded limit… A6 refuses
identical-id clones only"); this seat confirms the limit is live at the freeze,
not just asserted. Corollary observation: the receipt's human-readable `observed`
blocks are unauthenticated decoration — the counter never cross-checks them
(avenue-b's run2 `observed` still cited the pre-rewrite socket), so a fabricator
need only keep schema fields + transcripts coherent.

Contrast ladder, same clone, frozen counter:
- byte-identical clone (c2-J5 family): refused, `transcript sha256 repeated across runs`, exit 1 (`evidence/out-b0.json`);
- same ids, non-id bytes shifted: refused, `sessionId repeated across runs`, exit 1 (`evidence/out-b1.json`);
- fresh sessionId but shared browsing-context ids: refused by A6, `runs run1 and run2 share a browsing-context id`, exit 1 (`evidence/out-b2.json`).

So A6's refusal boundary sits exactly between "shared context ids" (refused) and
"all ids rewritten" (admitted); the residual is the disclosed one.

### (c) Caller-named / replaced binaries — REFUSED as designed
`verifyBinaries` compares the caller's path string only to route into a content
sha256 check; the pin is the digest, not the path.
- `--firefox /usr/bin/true`: exit 2, `refusing unregistered firefox binary` (`evidence/err-c1.txt`);
- sandbox copy of the counter with `PINNED_BINARIES` paths repointed at
  seat-controlled files: a decoy geckodriver → exit 2,
  `pinned geckodriver sha256 e41001… != install receipt f831b7…` (`evidence/err-c2.txt`);
  a 6-byte-tampered firefox copy at the pinned path → exit 2,
  `pinned firefox sha256 40bf6c… != install receipt a19472…` (`evidence/err-c3.txt`).
A sandbox that controls the file at the pinned path is still refused unless it
presents the pinned digest; a sandbox that controls both file and expected digest
controls the whole host and is outside the counter's threat model. The only
theoretical residual is a TOCTOU swap between the digest read and the live
session's spawn — needs a concurrent filesystem adversary, not demonstrated, and
the counter's own live leg would then be running the attacker's browser under the
seat's observation anyway.

### (d) `--rev` with a tampered gate — REFUSED
Committed a one-line tamper to `scripts/check-bidi-runtime.mjs` in the clone
(rev `d28e7609cfdc99184cb893881eed324cabaa69a2`). Frozen counter: exit 2,
`check-bidi-runtime.mjs at d28e760… sha256 fb0056… != frozen 370e8e…`
(`evidence/err-d.txt`). The gate digest pin at `--rev` binds; a lane cannot amend
its gate to widen predicates under the frozen counter. (`--rev` also requires
40-hex, enforced by `resolveCommit`.)

## Impacted axes
- operability: none harmed — honest evidence still admitted (a), every hardening
  avenue refused (c, d, contrast ladder).
- calibration: avenue (b) confirms predicate=TRUE is reachable on fabricated
  evidence, but only through the contract's own disclosed limit; every refusal
  fires exactly at the disclosed boundary. No undisclosed regression found.

## Smallest safe correction
None required this round — the rewritten-id limit is already disclosed in
`claims.json` (`feasibilityDisclosed`) and A6's header, and this seat's runs
confirm the disclosure is accurate. If the lane ever wants the limit closed, the
fix is not in the counter (transcript ids are self-generated, so id-rewriting is
unobservable from bytes): it needs an out-of-band witness of execution (e.g. a
counter-side nonce the driver must reflect, or operator-attested binary/session
telemetry). That is a contract change, not a counter patch, and is correctly
deferred.

VERDICT finding — predicate=TRUE reached on fabricated evidence only via the
contract-disclosed rewritten-id limit (avenue b, exit 0, admitted 16/16); all
other attack avenues refused by the frozen v2 counter; honest independent driver
admitted. No undisclosed defect; disclosure accurate.
