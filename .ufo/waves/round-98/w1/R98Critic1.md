# R98Critic1 — wording vs instrument map (C1)

Scope: plans/round-98.md §Claim C1 + §Declared limits mapped to counter
`scripts/check-client-oopif-uploadmodes-round98.mjs` (e55581ea…) and driver
`scripts/client-oopif-uploadmodes-round98.mjs` (f8e95a98…). Hashes verified
against claims.json. Static map only: no --live run by this seat, no
chromium, no ports. Tooling installs: none.

## Legend
- **enforced** = named counter check rejects a receipt making the sentence false.
- **driver-pin** = declared driver-performed in §Claim; counter checks only recorded consequences.
- **limit** = covered by §Declared limits.
- **not enforced** = nothing rejects the falsehood.

## Sentence map
1. "Chromium 155.0.8059.84 (/usr/bin/chromium, Linux)" — `chromium` (:196,
   substring), `browser` (:225, DevTools + client version). Host/Linux/path:
   not enforced; in --live the driver launches the binary by path (driver-pin).
   Ambient context; acceptable.
2. "runs the pinned driver (sha256 before run; nonce in env; receipt in fresh
   mkdtemp)" — `driver-pin` (:195, re-hashed :99), nonce minted :116, receipt
   dir :128, sha-before-spawn :112-114. **enforced** (--live). --receipt is
   forgeable — declared limit 6.
3. "3 reps of PUA, PLA, PLAB, PLB, PLLB, PLL, PLLM, PUR in that order (24 legs)"
   — `leg-set` (:206-208) + `leg-label` (:219). **enforced**.
4. Driver-pin paragraph (own browser; launch/connect per arm; page/iframe/
   listener shape; call forms; payload/missing args; 400 ms read) — declared
   driver-pin. Per-element below.
5. "each leg gets its own browser" — `fresh-browser` (:211-212): 24 distinct
   UUID-shaped `browserId` (driver :271). Process-tree identity is **not**
   enforced; limit 2 declares this verbatim ("the counter sees … the per-leg
   browser id … not the process tree"). Not a falsification.
6. Launch args / connect modes / isLocal per arm — driver-pin (driver :258-265,
   :274-279). Counter sees recorded `mode`/`isLocal` (`leg-arm` :224) + version
   strings (`browser` :225) only. Limit 2 declares exactly this ("launch vs
   connect is a driver-pin fact"). Not a falsification.
7. Parent/child URLs, #pp, #s listeners — `leg-arm` (:224, exact URLs),
   `frames` (:226, exactly [parent, child]), `iframe-targets` (:228, exactly
   one, url == child). Listener HTML: driver-pin (:187-195). Cross-site
   relation is implied by the exact `localhost`/`127.0.0.1` strings. ✓
8. Call forms (`uploadFile`, `setInputFiles` with timeout) — driver-pin
   (driver :289-297); counter enforces outcome/files/events/read per arm.
9. Payload/missing descriptors — `answer` (:199), `payload` (:200),
   `missing` (:202: abs path, basename, missingExists === false) + `leg-arm`
   input field (:224). `missingExists`/descriptors are recorded receipts;
   honest in --live under the pinned driver. Forgery surface = limit 6. ✓
10. "after a 400 ms settle" — driver constant SETTLE_MS (:65,:304), not
    counter-observable; sits in the driver-pin paragraph. Covered.
    "read when #s holds exactly one file, else null" — driver gate (:307-311);
    counter enforces `child-read` == arm read incl. PLLM null (:72,:237), so
    any inconsistent read fails the files+read pair (:235,:237). ✓
11. "every leg" bullet — `browser` :225, `leg-arm` :224, `frames` :226,
    `iframe-targets` :228, `parent-files` :229. **enforced**.
12. PUA/PLA/PLL bullet — `outcome` :231, `child-files` :235 (== [[answer,22,
    text/plain]]), `child-events` :236 (== [input T, change T]), `child-read`
    :237. **enforced**.
13. PLAB/PLB/PLLB bullet — same checks vs [[payload,29,text/plain]],
    [input F, change F], payload text. **enforced**.
14. PLLM bullet — `outcome` :233 (Error + exact ENOENT stat '<missingPath>'),
    []/:235, []/:236, null/:237. Counter builds the message from receipt
    missingPath; `missing-bound` (:191, --live) + `missing` (:202) pin it. ✓
15. PUR bullet — resolved :231, [[missing,0,text/plain]] :235, [input T,
    change T] :236, NOT_FOUND :237. **enforced**.
16. "(no leg may record a click)" — events compared by exact eq (:236);
    any extra event (click or other) fails. **enforced**.
17. Receipt paragraph — `schema` :193, `nonce` :194, `driver-pin` :195,
    `chromium` :196, `reps` :197, `libs` :198 (exact eq vs LIBS :56-58:
    version, integrity, file sha, tree entries+sha), `answer` :199,
    `payload` :200, `missing` :202, `ports` :204 (3 distinct, 1024..65535),
    `leg-set` :208, `failures` :210, `fresh-browser` :212, plus --live
    `driver-exit` :189, `ports-bound` :190, `missing-bound` :191.
    "UUID-shaped" = regex only (:212); the sentence says "shaped". Match. ✓
18. "Before → after" — `git cat-file -e 020ce05f:…` rc 128: **verified by
    critic** (ran it, rc=128). Base-state grep verified two ways: on disk
    grep over scripts/*round9[67]* rc=1; `git grep -E <pattern> 020ce05f
    -- scripts/*round96* scripts/*round97*` rc=1 (exactly 6 files at base).
    Score-result leg points to .ufo/waves/round-98/scored/ (not re-run). ✓
19. Kill rule — procedural; restricts leg falsification to "--live run of
    the pinned driver" (receipt forgery excluded, consistent with limit 6).
    Committed controls in controls/rc.txt. ✓
20. Limits 1-7 — disclaimers, no enforcement owed. Spot: limit 3 "`type` is
    File.type" — counter compares it inside file triples (:235);
    lastModified never read ✓. Limit 2's mode-field blindness = #6. ✓

## claims.json statement
Explicitly a "pointer, not a restatement" summary. Grouping, sizes 22/29,
trusted/untrusted polarity, PLLM ENOENT, PUR NotFoundError message, #pp empty,
one iframe target: all match the predicate bullets. No narrowing, no extra.
No drift.

## Rejected candidates
- browserId "UUID-shaped" regex vs actual UUIDs: sentence says shaped. Match.
- `chromium` substring check (:196) vs "containing 155.0.8059.84": match.
- missingPath-derived ENOENT message: pinned by missing-bound in --live (#14).
- "no click" alias: exact eq also rejects other extra events; the stated
  consequence holds. OK.

## Conclusion
Every operative sentence is enforced by a named check or is an explicitly
declared driver-pin fact / limit. The two real blind spots (launch-vs-connect
and own-browser *process* identity) are declared in limit 2 in the counter's
own terms. No sentence claims more than the instrument enforces. Calibration:
high on wording; no live/number claims (no ports assigned).

VERDICT C1: neutral
